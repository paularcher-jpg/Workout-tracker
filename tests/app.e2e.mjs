// Browser tests. These drive a real Chromium at iPhone viewport size.
//
//   npm install --no-save playwright && npx playwright install chromium
//   node tests/app.e2e.mjs
//
// Set CHROMIUM_PATH to use a browser you already have installed.

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8099);
const LAUNCH = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png',
};

function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      return res.end('not found');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

const problems = [];
const step = async (name, fn) => {
  try { await fn(); console.log('  PASS ' + name); }
  catch (err) { console.log('  FAIL ' + name + ' -> ' + err.message); problems.push(name + ': ' + err.message); }
};

const server = await serve();
const browser = await chromium.launch(LAUNCH);
const BASE = `http://localhost:${PORT}/`;

/** A clean install of the app: fresh storage, fresh service worker. */
async function newSession() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const p = await context.newPage();
  p.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  p.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForSelector('.tabbar', { timeout: 10000 });
  return { context, page: p };
}

let { context: ctx, page } = await newSession();

console.log('\n== boot ==');
await step('splash removed', async () => {
  if (await page.locator('#splash').count()) throw new Error('splash still present');
});
await step('5 tabs rendered', async () => {
  const n = await page.locator('.tab').count();
  if (n !== 5) throw new Error(`got ${n} tabs`);
});

console.log('\n== logging a workout ==');
await step('start empty workout', async () => {
  await page.getByRole('button', { name: 'Start empty workout' }).click();
  await page.waitForSelector('.session-head');
});
await step('add exercise via picker', async () => {
  await page.getByRole('button', { name: '+ Add exercise' }).click();
  await page.waitForSelector('.picker-search');
  await page.locator('.picker-search').fill('bench');
  await page.locator('.picker-item').first().click();
  await page.waitForSelector('.entry');
});
await step('exercise card shows sets', async () => {
  const rows = await page.locator('.set-row:not(.set-head)').count();
  if (rows < 1) throw new Error('no set rows');
});
await step('log a set and start rest timer', async () => {
  const row = page.locator('.set-row:not(.set-head)').first();
  await row.locator('.set-input').nth(0).fill('80');
  await row.locator('.set-input').nth(1).fill('8');
  await row.locator('.set-check').click();
  await page.waitForSelector('.restbar:not([hidden])', { timeout: 3000 });
  const t = await page.locator('.rest-time').textContent();
  if (!/^\d+:\d\d$/.test(t)) throw new Error('bad timer text ' + t);
});
await step('rest timer +15 works', async () => {
  const before = await page.locator('.rest-time').textContent();
  await page.getByRole('button', { name: 'Add 15 seconds' }).click();
  const after = await page.locator('.rest-time').textContent();
  const s = (v) => { const [m, x] = v.split(':').map(Number); return m * 60 + x; };
  if (s(after) <= s(before)) throw new Error(`${before} -> ${after}`);
});
await step('remaining blank sets inherit the logged numbers', async () => {
  const rows = page.locator('.set-row:not(.set-head)');
  const w = await rows.nth(1).locator('.set-input').nth(0).inputValue();
  const r = await rows.nth(1).locator('.set-input').nth(1).inputValue();
  if (w !== '80' || r !== '8') throw new Error(`expected 80/8, got ${w}/${r}`);
});
await step('added set copies the last real numbers', async () => {
  await page.getByRole('button', { name: '+ Add set' }).first().click();
  const rows = page.locator('.set-row:not(.set-head)');
  const n = await rows.count();
  const v = await rows.nth(n - 1).locator('.set-input').nth(0).inputValue();
  if (v !== '80') throw new Error('expected 80, got ' + v);
});
await step('log second set', async () => {
  const row = page.locator('.set-row:not(.set-head)').nth(1);
  await row.locator('.set-input').nth(1).fill('6');
  await row.locator('.set-check').click();
});
await step('second exercise', async () => {
  await page.getByRole('button', { name: '+ Add exercise' }).click();
  await page.locator('.picker-search').fill('squat');
  await page.locator('.picker-item').first().click();
  const row = page.locator('.entry').nth(1).locator('.set-row:not(.set-head)').first();
  await row.locator('.set-input').nth(0).fill('100');
  await row.locator('.set-input').nth(1).fill('5');
  await row.locator('.set-check').click();
});

console.log('\n== persistence ==');
await step('active workout survives reload', async () => {
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.session-head', { timeout: 5000 });
  const done = await page.locator('.set-check.on').count();
  if (done !== 3) throw new Error(`expected 3 completed sets, got ${done}`);
  const name = await page.locator('.session-title').inputValue();
  if (!name) throw new Error('workout name lost on reload');
});

console.log('\n== finish + history ==');
await step('finish workout', async () => {
  await page.getByRole('button', { name: 'Finish' }).click();
  await page.waitForSelector('.hero h1', { timeout: 3000 });
});
await step('history shows the session', async () => {
  await page.locator('.tab[data-tab="history"]').click();
  await page.waitForSelector('.card-history');
  const n = await page.locator('.card-history').count();
  if (n !== 1) throw new Error(`expected 1 workout, got ${n}`);
});
await step('history detail expands', async () => {
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.waitForSelector('.history-line');
  const txt = await page.locator('.history-detail').first().innerText();
  if (!txt.includes('80')) throw new Error('missing set data: ' + txt);
});

console.log('\n== progress ==');
await step('progress renders charts', async () => {
  await page.locator('.tab[data-tab="progress"]').click();
  await page.waitForSelector('.stat-grid');
  const charts = await page.locator('.chart-svg').count();
  if (charts < 2) throw new Error(`expected charts, got ${charts}`);
});
await page.screenshot({ path: path.join(ROOT, 'tests', 'screenshot-progress.png') });

console.log('\n== routines ==');
await step('create a routine', async () => {
  await page.locator('.tab[data-tab="plan"]').click();
  await page.getByRole('button', { name: '+ New routine' }).click();
  await page.waitForSelector('.sheet');
  await page.locator('.sheet .input').first().fill('Push day');
  await page.getByRole('button', { name: '+ Add exercise' }).click();
  await page.locator('.picker-search').fill('overhead press');
  await page.locator('.picker-item').first().click();
  await page.waitForSelector('.editor-item', { timeout: 3000 });
  await page.getByRole('button', { name: 'Save routine' }).click();
  await page.waitForSelector('.routine-items', { timeout: 3000 });
});
await step('start from routine prefills', async () => {
  await page.getByRole('button', { name: 'Start this routine' }).click();
  await page.waitForSelector('.session-head', { timeout: 3000 });
  const rows = await page.locator('.set-row:not(.set-head)').count();
  if (rows !== 3) throw new Error(`expected 3 prefilled sets, got ${rows}`);
});

console.log('\n== settings ==');
await step('settings renders', async () => {
  await page.locator('.tab[data-tab="settings"]').click();
  await page.waitForSelector('.sync-status');
});
await step('drive help sheet opens', async () => {
  await page.getByRole('button', { name: 'How do I get a client ID?' }).click();
  await page.waitForSelector('.help');
  const t = await page.locator('.code-block').textContent();
  if (!t.includes('localhost:8099')) throw new Error('origin not shown: ' + t);
  await page.locator('.sheet-close').click();
});
await step('units toggle to lb', async () => {
  await page.locator('select.input').first().selectOption('lb');
  await page.locator('.tab[data-tab="progress"]').click();
  const txt = await page.locator('.stat-grid').innerText();
  if (!txt.toLowerCase().includes('lb')) throw new Error('units not applied: ' + txt);
});

console.log('\n== no horizontal overflow ==');
await step('page does not scroll sideways', async () => {
  for (const tab of ['train', 'plan', 'history', 'progress', 'settings']) {
    await page.locator(`.tab[data-tab="${tab}"]`).click();
    await page.waitForTimeout(120);
    const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (over) throw new Error('overflow on ' + tab);
  }
});


// ---- second pass: a clean install, for history, backup and offline ----
await ctx.close();
({ context: ctx, page } = await newSession());

const logWorkout = async (weight, reps) => {
  await page.getByRole('button',{name:'Start empty workout'}).click();
  await page.getByRole('button',{name:'+ Add exercise'}).click();
  await page.locator('.picker-search').fill('deadlift');
  await page.locator('.picker-item').first().click();
  await page.waitForSelector('.entry');
  const row=page.locator('.set-row:not(.set-head)').first();
  await row.locator('.set-input').nth(0).fill(String(weight));
  await row.locator('.set-input').nth(1).fill(String(reps));
  await row.locator('.set-check').click();
  await page.getByRole('button',{name:'Finish'}).click();
  await page.waitForSelector('.hero h1',{timeout:3000});
};


console.log('\n== previous-session column ==');
await step('session 1 logged', async () => { await logWorkout(140, 5); });
await step('session 2 shows session 1 in the Previous column', async () => {
  await page.getByRole('button',{name:'Start empty workout'}).click();
  await page.getByRole('button',{name:'+ Add exercise'}).click();
  await page.locator('.picker-search').fill('deadlift');
  await page.locator('.picker-item').first().click();
  await page.waitForSelector('.entry');
  const prev = await page.locator('.set-prev').first().textContent();
  if (prev.trim() !== '140×5') throw new Error('got "' + prev + '"');
});
await step('tapping Previous copies the numbers in', async () => {
  await page.locator('.set-prev').first().click();
  const w = await page.locator('.set-row:not(.set-head)').first().locator('.set-input').nth(0).inputValue();
  if (w !== '140') throw new Error('got ' + w);
});
await step('beating it is flagged as a personal best', async () => {
  const row = page.locator('.set-row:not(.set-head)').first();
  await row.locator('.set-input').nth(0).fill('150');
  await row.locator('.set-input').nth(1).fill('5');
  await row.locator('.set-check').click();
  await page.waitForSelector('.toast.show', { timeout: 2000 });
  const t = await page.locator('#toast').textContent();
  if (!t.includes('Personal best')) throw new Error('got "' + t + '"');
});
await step('finish second session', async () => {
  await page.getByRole('button',{name:'Finish'}).click();
  await page.waitForSelector('.hero h1',{timeout:3000});
});

console.log('\n== backup round-trip ==');
let exported = null;
await step('export produces a valid file', async () => {
  await page.locator('.tab[data-tab="settings"]').click();
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 5000 }),
    page.getByRole('button', { name: 'Export file' }).click(),
  ]);
  const p = await download.path();
  exported = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (Object.keys(exported.workouts).length !== 2) throw new Error('expected 2 workouts in export');
  if (!download.suggestedFilename().endsWith('.json')) throw new Error('bad filename');
});
await step('importing a file with a new workout merges it in', async () => {
  const extra = JSON.parse(JSON.stringify(exported));
  extra.workouts['imported-1'] = {
    id: 'imported-1', startedAt: Date.now() - 86400000 * 5, finishedAt: Date.now() - 86400000 * 5 + 3600000,
    name: 'Imported session', updatedAt: Date.now(), deleted: false,
    entries: [{ id: 'e1', exerciseId: 'deadlift', restSec: 180, sets: [{ id: 's1', weight: 120, reps: 5, warmup: false }] }],
  };
  await page.evaluate(async (doc) => {
    const m = await import('/js/state.js');
    await m.importDocument(doc);
  }, extra);
  await page.locator('.tab[data-tab="history"]').click();
  await page.waitForSelector('.card-history');
  const n = await page.locator('.card-history').count();
  if (n !== 3) throw new Error(`expected 3 workouts after import, got ${n}`);
});

console.log('\n== offline ==');
await step('service worker takes control', async () => {
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, { timeout: 10000 });
});
await step('app loads and data is intact with the network down', async () => {
  await ctx.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tabbar', { timeout: 10000 });
  await page.locator('.tab[data-tab="history"]').click();
  await page.waitForSelector('.card-history', { timeout: 5000 });
  const n = await page.locator('.card-history').count();
  if (n !== 3) throw new Error(`expected 3 workouts offline, got ${n}`);
});
await step('you can still log a workout offline', async () => {
  await page.locator('.tab[data-tab="train"]').click();
  await logWorkout(160, 3);
  await page.locator('.tab[data-tab="history"]').click();
  await page.waitForTimeout(200);
  const n = await page.locator('.card-history').count();
  if (n !== 4) throw new Error(`expected 4 workouts, got ${n}`);
});
await step('sync badge reports offline rather than failing', async () => {
  const txt = await page.locator('.sync-badge').textContent();
  if (!/offline|set up sync/i.test(txt)) throw new Error('badge says "' + txt + '"');
});
await ctx.setOffline(false);


// ---- third pass: plans and schedules ----
await ctx.close();
({ context: ctx, page } = await newSession());

const PLAN = `Monday - Push
  Barbell Bench Press 4x8 rest 180
  Incline Dumbbell Press 3x8-12
  Lateral Raise 3x15 @60s
Wednesday - Pull
  Deadlift 3x5 rest 240
  Lat Pulldown 3x10
Friday - Legs
  Back Squat 5x5 rest 3min
  Zercher Squat 3x10`;

console.log('\n== pasting a plan ==');
await step('plan tab starts empty', async () => {
  await page.locator('.tab[data-tab="plan"]').click();
  await page.waitForSelector('.empty');
});
await step('paste sheet previews what was understood', async () => {
  await page.getByRole('button', { name: 'Paste a plan' }).click();
  await page.waitForSelector('.plan-input');
  await page.locator('.plan-input').fill(PLAN);
  await page.waitForSelector('.plan-ok');
  const ok = await page.locator('.plan-ok').textContent();
  if (!/1 week/.test(ok) || !/3 session/.test(ok) || !/7 exercises/.test(ok)) throw new Error(ok);
});
await step('exercises not in the library are flagged first', async () => {
  const note = await page.locator('.plan-note').textContent();
  if (!note.includes('Zercher')) throw new Error(note);
});
await step('a clean plan produces no warnings', async () => {
  if (await page.locator('.plan-warn').count()) {
    throw new Error(await page.locator('.plan-warn').first().textContent());
  }
});
await step('importing builds routines and a schedule', async () => {
  await page.getByRole('button', { name: 'Add this plan' }).click();
  await page.waitForSelector('.sched-row', { timeout: 5000 });
  const n = await page.locator('.card .routine-items').count();
  if (n !== 3) throw new Error(`expected 3 routines, got ${n}`);
});

console.log('\n== schedule ==');
await step('sessions land on the weekdays the plan named', async () => {
  const rows = await page.locator('.sched-row').allInnerTexts();
  // day labels render uppercase, so match case-insensitively — and insist the
  // filter actually found rows, or .every() would pass on an empty list
  const on = (day) => rows.filter((r) => new RegExp('^' + day, 'i').test(r.trim()));
  for (const day of ['Mon', 'Tue', 'Wed', 'Fri']) {
    if (!on(day).length) throw new Error(`no ${day} rows in: ` + rows.slice(0, 3).join(' // '));
  }
  if (!on('Mon').every((r) => r.includes('Push'))) throw new Error('Mon: ' + on('Mon').join(' | '));
  if (!on('Wed').every((r) => r.includes('Pull'))) throw new Error('Wed: ' + on('Wed').join(' | '));
  if (!on('Fri').every((r) => r.includes('Legs'))) throw new Error('Fri: ' + on('Fri').join(' | '));
  if (!on('Tue').every((r) => r.includes('Rest'))) throw new Error('Tue: ' + on('Tue').join(' | '));
});
await step('the plan repeats into following weeks', async () => {
  const rows = await page.locator('.sched-row').allInnerTexts();
  if (rows.filter((r) => r.includes('Push')).length < 3) throw new Error('plan did not repeat');
});
await step('exactly one row is marked today', async () => {
  const n = await page.locator('.sched-row.is-today').count();
  if (n !== 1) throw new Error(`got ${n}`);
});
await step('train tab leads with today', async () => {
  await page.locator('.tab[data-tab="train"]').click();
  await page.waitForSelector('.card-today');
  const t = await page.locator('.card-today').innerText();
  if (!/Today/i.test(t)) throw new Error(t);
  if (/Rest day/.test(t) && !/Next:/.test(t)) throw new Error('rest day did not name the next session: ' + t);
});
await step('rep ranges stay as targets and never enter the reps field', async () => {
  const btn = page.locator('.card-today').getByRole('button', { name: /Start today/ });
  if (await btn.count()) await btn.click();
  else {
    await page.locator('.tab[data-tab="plan"]').click();
    await page.getByRole('button', { name: 'Start this routine' }).first().click();
  }
  await page.waitForSelector('.entry', { timeout: 5000 });
  const targets = await page.locator('.entry-target').allInnerTexts();
  if (!targets.length) throw new Error('no targets rendered');
  const i = targets.findIndex((t) => t.includes('-'));
  if (i >= 0) {
    const reps = await page.locator('.entry').nth(i)
      .locator('.set-row:not(.set-head) .set-input').nth(1).inputValue();
    if (reps.includes('-')) throw new Error('range leaked into the numeric field: ' + reps);
  }
});


console.log('\n== uploading a CSV programme ==');
await step('upload a phased CSV plan', async () => {
  await ctx.close();
  ({ context: ctx, page } = await newSession());
  await page.locator('.tab[data-tab="plan"]').click();
  await page.getByRole('button', { name: 'Paste a plan' }).click();
  await page.waitForSelector('.plan-input');
  await page.locator('input[type="file"]').setInputFiles(path.join(ROOT, 'tests/fixtures/plan.csv'));
  await page.waitForSelector('.plan-ok', { timeout: 5000 });
});
await step('preview counts weeks, sessions and exercises', async () => {
  const ok = await page.locator('.plan-ok').textContent();
  if (!/9 weeks/.test(ok) || !/5 sessions/.test(ok) || !/14 exercises/.test(ok)) throw new Error(ok);
});
await step('the phase change shows in the week layout', async () => {
  const t = await page.locator('.plan-weeks').innerText();
  if (!/Week 1: Mon Full Body A · Thu Full Body B/.test(t)) throw new Error(t.split('\n')[0]);
  if (!/Week 3: Mon Push · Wed Pull · Fri Legs/.test(t)) throw new Error(t);
  if (!/Week 9: Mon Push/.test(t)) throw new Error(t);
});
await step('importing makes one routine per session, not per week', async () => {
  await page.getByRole('button', { name: 'Add this plan' }).click();
  await page.waitForSelector('.sched-row', { timeout: 6000 });
  const n = await page.locator('.card .routine-items').count();
  if (n !== 5) throw new Error(`expected 5 routines, got ${n}`);
});
await step('targets, RPE and coaching notes reach the session', async () => {
  await page.getByRole('button', { name: 'Start this routine' }).first().click();
  await page.waitForSelector('.entry', { timeout: 5000 });
  const target = await page.locator('.entry-target').first().innerText();
  if (!/Target 3×10/.test(target)) throw new Error(target);
  if (!/RPE 6/.test(target)) throw new Error('RPE missing: ' + target);
  const notes = await page.locator('.entry-note').allInnerTexts();
  if (!notes.some((t) => /Easy first week/.test(t))) throw new Error('note missing');
});
await step('a timed hold does not prefill the reps box', async () => {
  let plank = null;
  for (const e of await page.locator('.entry').all()) {
    if ((await e.innerText()).startsWith('Plank')) plank = e;
  }
  if (!plank) throw new Error('no Plank entry');
  if (!/30s/.test(await plank.locator('.entry-target').innerText())) throw new Error('no 30s target');
  const reps = await plank.locator('.set-row:not(.set-head) .set-input').nth(1).inputValue();
  if (reps !== '') throw new Error('a hold should leave reps empty, got ' + reps);
});
await step('rest times come from the plan', async () => {
  const rest = (await page.locator('.rest-pill').allInnerTexts())[0];
  if (rest !== '1:30') throw new Error('expected 1:30, got ' + rest);
});
await step('logging a set carries weight into plan-prefilled sets', async () => {
  const entry = page.locator('.entry').first();
  const row = entry.locator('.set-row:not(.set-head)').first();
  await row.locator('.set-input').nth(0).fill('24');
  await row.locator('.set-input').nth(1).fill('10');
  await row.locator('.set-check').click();
  const rows = entry.locator('.set-row:not(.set-head)');
  for (const i of [1, 2]) {
    const w = await rows.nth(i).locator('.set-input').nth(0).inputValue();
    const r = await rows.nth(i).locator('.set-input').nth(1).inputValue();
    if (w !== '24') throw new Error(`set ${i + 1} weight should carry, got "${w}"`);
    if (r !== '10') throw new Error(`set ${i + 1} reps should stay 10, got "${r}"`);
  }
});


console.log('\n== console errors ==');
console.log(problems.length ? 'PROBLEMS:\n' + problems.map((p) => ' - ' + p).join('\n') : '  none');

await browser.close();
server.close();
process.exit(problems.length ? 1 : 0);
