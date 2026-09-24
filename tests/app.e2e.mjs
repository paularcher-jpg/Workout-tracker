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

// Lets a test serve a changed file, so a real service worker update can be
// exercised without touching the working tree.
const OVERRIDES = new Map();

function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';

    // GitHub Pages serves assets with a max-age, and that is precisely what
    // makes a stale shell possible — so the test server has to do it too, or
    // the update path passes here and fails on a real phone.
    const headers = { 'Cache-Control': 'max-age=600' };

    if (OVERRIDES.has(p)) {
      res.writeHead(200, { ...headers, 'Content-Type': TYPES[path.extname(p)] || 'text/plain' });
      return res.end(OVERRIDES.get(p));
    }

    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      return res.end('not found');
    }
    res.writeHead(200, { ...headers, 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

const problems = [];
const step = async (name, fn) => {
  try { await fn(); console.log('  PASS ' + name); }
  catch (err) { console.log('  FAIL ' + name + ' -> ' + err.message); problems.push(name + ': ' + err.message); }
};

/**
 * Finish the live session and dismiss the summary sheet it now opens.
 * The sheet is modal, so leaving it up blocks every later interaction.
 */
async function endSession(p) {
  const finish = p.getByRole('button', { name: 'Finish' });
  if (!(await finish.count())) return false;
  await finish.click();
  const done = p.getByRole('button', { name: 'Done' });
  await done.waitFor({ timeout: 5000 });
  await done.click();
  await p.waitForSelector('.sheet', { state: 'detached', timeout: 5000 });
  await p.waitForSelector('.hero h1', { timeout: 5000 });
  return true;
}

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
  const rows = await page.locator('.set-row').count();
  if (rows < 1) throw new Error('no set rows');
});
await step('log a set and start rest timer', async () => {
  const row = page.locator('.set-row').first();
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
await step('ticking a set repaints immediately, without waiting for a re-render', async () => {
  // the whole logging loop rests on this: if the tick does not change on tap,
  // you tap again and silently un-log the set
  const state = await page.evaluate(() => {
    const row = document.querySelector('.set-row.set-done');
    const chk = row?.querySelector('.set-check');
    if (!row || !chk) return null;
    const rowBg = getComputedStyle(row).backgroundColor;
    const open = document.querySelector('.set-row:not(.set-done)');
    return {
      checkOn: chk.classList.contains('on'),
      aria: chk.getAttribute('aria-label'),
      rowBg,
      openBg: open ? getComputedStyle(open).backgroundColor : null,
    };
  });
  if (!state) throw new Error('no completed row found');
  if (!state.checkOn) throw new Error('tick did not turn on: still ' + state.aria);
  if (state.aria !== 'Undo set') throw new Error('aria not updated: ' + state.aria);
  if (state.rowBg === state.openBg) {
    throw new Error('a done row is painted identically to an open one: ' + state.rowBg);
  }
});
await step('the personal-best flash clears instead of becoming a state', async () => {
  await page.waitForTimeout(1800);
  const stuck = await page.locator('.set-row.set-pr').count();
  if (stuck) throw new Error(`${stuck} rows still flagged as a PR after the animation`);
});
await step('the rest bar fill is driven by transform, not width', async () => {
  // animating width re-lays out the bar every frame for the whole countdown;
  // this asserts the compositor-friendly mechanism is actually wired up
  const fill = await page.evaluate(() => {
    const el = document.querySelector('.rest-fill');
    const cs = getComputedStyle(el);
    return { transform: cs.transform, width: cs.width, transitionProperty: cs.transitionProperty };
  });
  if (fill.transform === 'none' || !fill.transform.startsWith('matrix')) {
    throw new Error('fill is not transformed: ' + fill.transform);
  }
  if (!/transform/.test(fill.transitionProperty)) {
    throw new Error('fill still transitions ' + fill.transitionProperty);
  }
  if (/width/.test(fill.transitionProperty)) throw new Error('width is still animated');
});
await step('remaining blank sets inherit the logged numbers', async () => {
  const rows = page.locator('.set-row');
  const w = await rows.nth(1).locator('.set-input').nth(0).inputValue();
  const r = await rows.nth(1).locator('.set-input').nth(1).inputValue();
  if (w !== '80' || r !== '8') throw new Error(`expected 80/8, got ${w}/${r}`);
});
await step('added set copies the last real numbers', async () => {
  await page.getByRole('button', { name: 'Add set' }).first().click();
  const rows = page.locator('.set-row');
  const n = await rows.count();
  const v = await rows.nth(n - 1).locator('.set-input').nth(0).inputValue();
  if (v !== '80') throw new Error('expected 80, got ' + v);
});
await step('log second set', async () => {
  const row = page.locator('.set-row').nth(1);
  await row.locator('.set-input').nth(1).fill('6');
  await row.locator('.set-check').click();
});
await step('second exercise', async () => {
  await page.getByRole('button', { name: '+ Add exercise' }).click();
  await page.locator('.picker-search').fill('squat');
  await page.locator('.picker-item').first().click();
  const row = page.locator('.entry').nth(1).locator('.set-row').first();
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
await step('finishing shows a session summary, not just a toast', async () => {
  await page.getByRole('button', { name: 'Finish' }).click();
  const sheet = page.locator('.summary');
  await sheet.waitFor({ timeout: 5000 });
  const text = await sheet.innerText();
  if (!/set/i.test(text)) throw new Error('summary has no set count: ' + text);
  if (!/exercises/i.test(text)) throw new Error('summary has no exercise count: ' + text);
  await page.getByRole('button', { name: 'Done' }).click();
  await page.waitForSelector('.sheet', { state: 'detached', timeout: 5000 });
  await page.waitForSelector('.hero h1', { timeout: 5000 });
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
  const rows = await page.locator('.set-row').count();
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
  const row=page.locator('.set-row').first();
  await row.locator('.set-input').nth(0).fill(String(weight));
  await row.locator('.set-input').nth(1).fill(String(reps));
  await row.locator('.set-check').click();
  await endSession(page);
};


console.log('\n== previous-session column ==');
await step('session 1 logged', async () => { await logWorkout(140, 5); });
await step('last session becomes this session\u2019s placeholders', async () => {
  await page.getByRole('button',{name:'Start empty workout'}).click();
  await page.getByRole('button',{name:'+ Add exercise'}).click();
  await page.locator('.picker-search').fill('deadlift');
  await page.locator('.picker-item').first().click();
  await page.waitForSelector('.entry');
  const row = page.locator('.set-row').first();
  const w = await row.locator('.set-input').nth(0).getAttribute('placeholder');
  const r = await row.locator('.set-input').nth(1).getAttribute('placeholder');
  if (w !== '140' || r !== '5') throw new Error(`placeholders were ${w}/${r}, expected 140/5`);
});
await step('ticking an untouched set accepts last time\u2019s numbers', async () => {
  const row = page.locator('.set-row').first();
  await row.locator('.set-check').click();
  const w = await row.locator('.set-input').nth(0).inputValue();
  const r = await row.locator('.set-input').nth(1).inputValue();
  if (w !== '140' || r !== '5') throw new Error(`logged ${w}x${r}, expected 140x5`);
});
await step('beating it is flagged as a personal best', async () => {
  await page.getByRole('button', { name: 'Add set' }).first().click();
  const row = page.locator('.set-row').last();
  await row.locator('.set-input').nth(0).fill('150');
  await row.locator('.set-input').nth(1).fill('5');
  await row.locator('.set-check').click();
  await page.waitForSelector('.toast.show', { timeout: 2000 });
  const t = await page.locator('#toast').textContent();
  if (!t.includes('Personal best')) throw new Error('got "' + t + '"');
});
await step('finish second session', async () => {
  await endSession(page);
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
  const targets = await page.locator('.entry-meta').allInnerTexts();
  if (!targets.length) throw new Error('no targets rendered');
  const i = targets.findIndex((t) => t.includes('-'));
  if (i >= 0) {
    const reps = await page.locator('.entry').nth(i)
      .locator('.set-row .set-input').nth(1).inputValue();
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
  const target = await page.locator('.entry-meta').first().innerText();
  if (!/3×10/.test(target)) throw new Error(target);
  if (!/RPE 6/.test(target)) throw new Error('RPE missing: ' + target);
  const notes = await page.locator('.entry-note').allInnerTexts();
  if (!notes.some((t) => /Easy first week/.test(t))) throw new Error('note missing');
});
await step('a hold logs seconds, never reps', async () => {
  let plank = null;
  for (const e of await page.locator('.entry').all()) {
    if ((await e.innerText()).startsWith('Plank')) plank = e;
  }
  if (!plank) throw new Error('no Plank entry');
  const row = plank.locator('.set-row').first();

  const units = await row.locator('.set-unit').allInnerTexts();
  if (units[1] !== 's') throw new Error(`second field should read "s", got "${units[1]}"`);

  const aria = await row.locator('.set-input').nth(1).getAttribute('aria-label');
  if (!/seconds/i.test(aria)) throw new Error('aria-label is still reps: ' + aria);

  const val = await row.locator('.set-input').nth(1).inputValue();
  if (val !== '30') throw new Error(`plan says 30s, box shows "${val}"`);

  // and it must be stored as secs — a hold must never write a reps value,
  // or it re-enters the volume and 1RM maths
  const stored = await page.evaluate(async () => {
    const m = await import('/js/state.js');
    const e = m.getState().active.entries.find((x) => x.exerciseId === 'plank');
    return e ? e.sets[0] : null;
  });
  if (!stored) throw new Error('no plank entry in state');
  if (stored.reps) throw new Error('a hold wrote reps: ' + JSON.stringify(stored));
  if (String(stored.secs) !== '30') throw new Error('secs not set: ' + JSON.stringify(stored));

  // log it with a weight on the back, so Progress has a hold to chart later
  await row.locator('.set-input').nth(0).fill('10');
  await row.locator('.set-check').click();
});
await step('rest times come from the plan', async () => {
  const rest = (await page.locator('.rest-pill').allInnerTexts())[0];
  if (!/1:30/.test(rest)) throw new Error('expected 1:30, got ' + rest);
});
await step('logging a set carries weight into plan-prefilled sets', async () => {
  const entry = page.locator('.entry').first();
  const row = entry.locator('.set-row').first();
  await row.locator('.set-input').nth(0).fill('24');
  await row.locator('.set-input').nth(1).fill('10');
  await row.locator('.set-check').click();
  const rows = entry.locator('.set-row');
  for (const i of [1, 2]) {
    const w = await rows.nth(i).locator('.set-input').nth(0).inputValue();
    const r = await rows.nth(i).locator('.set-input').nth(1).inputValue();
    if (w !== '24') throw new Error(`set ${i + 1} weight should carry, got "${w}"`);
    if (r !== '10') throw new Error(`set ${i + 1} reps should stay 10, got "${r}"`);
  }
});


console.log('\n== starting a session on any day ==');
await step('close the session the previous block left open', async () => {
  // the app refuses to start a second workout while one is in progress, which
  // is correct behaviour — so finish it the way a person would
  await page.locator('.tab[data-tab="train"]').click();
  await endSession(page);
});

console.log('\n== progress for a hold ==');
await step('a hold charts its duration, never a 1-rep max', async () => {
  await page.evaluate(async () => {
    const m = await import('/js/state.js');
    m.updateLocal({ trackedExerciseId: 'plank' });
  });
  await page.locator('.tab[data-tab="history"]').click();
  await page.locator('.tab[data-tab="progress"]').click();
  await page.waitForSelector('.card-head h3');

  let card = null;
  for (const c of await page.locator('.card').all()) {
    const head = c.locator('.card-head h3');
    if (await head.count() && (await head.innerText()).trim() === 'Plank') card = c;
  }
  if (!card) throw new Error('no Plank card on Progress');

  const text = await card.innerText();
  if (!/longest hold/i.test(text)) throw new Error('no hold stat: ' + text);
  if (/est\. 1RM/i.test(text)) throw new Error('a hold is showing a 1-rep max: ' + text);
  if (/Heaviest set/i.test(text)) throw new Error('a hold is showing a heaviest-set chart: ' + text);
  if (!/30s/.test(text)) throw new Error('the 30s hold is not in the stats: ' + text);
  // the weight on the back is a secondary measure, so it still has to show
  if (!/10/.test(text)) throw new Error('added weight missing: ' + text);
});
await step('a hold stays out of the 1RM-ranked records table', async () => {
  let records = null;
  for (const c of await page.locator('.card').all()) {
    const head = c.locator('h3');
    if (await head.count() && (await head.first().innerText()).trim() === 'Personal bests') records = c;
  }
  if (records && /Plank/.test(await records.innerText())) {
    throw new Error('Plank is being ranked by estimated 1RM');
  }
  let holds = null;
  for (const c of await page.locator('.card').all()) {
    const head = c.locator('h3');
    if (await head.count() && (await head.first().innerText()).trim() === 'Longest holds') holds = c;
  }
  if (!holds) throw new Error('no Longest holds card');
  if (!/Plank/.test(await holds.innerText())) throw new Error('Plank missing from holds');
});

await step('every scheduled session is startable, rest days are not', async () => {
  await page.locator('.tab[data-tab="plan"]').click();
  await page.waitForSelector('.sched-row');
  const rows = await page.locator('.sched-row').count();
  const rests = await page.locator('.sched-row.is-rest').count();
  const starts = await page.locator('.sched-start').count();
  if (starts !== rows - rests) throw new Error(`${rows} rows, ${rests} rest, ${starts} buttons`);
  if (await page.locator('.sched-row.is-rest .sched-start').count()) throw new Error('rest day is startable');
});
await step('the list begins on Monday so a missed day is still reachable', async () => {
  const first = (await page.locator('.sched-row').first().innerText()).trim();
  if (!/^mon/i.test(first)) throw new Error('does not start on Monday: ' + first);
});

let planned = null;
await step('start a session planned for a different day', async () => {
  for (const r of await page.locator('.sched-row').all()) {
    const cls = await r.getAttribute('class');
    if (cls.includes('is-rest') || cls.includes('is-today')) continue;
    planned = (await r.locator('.sched-name').innerText()).trim().replace(/\s*done$/i, '');
    await r.locator('.sched-start').click();
    break;
  }
  if (!planned) throw new Error('no non-today session found');
  await page.waitForSelector('.entry', { timeout: 5000 });
  const name = await page.locator('.session-title').inputValue();
  if (!name.startsWith(planned)) throw new Error(`tapped "${planned}" but opened "${name}"`);
});
await step('it is logged on the day it was actually done', async () => {
  const row = page.locator('.set-row').first();
  await row.locator('.set-input').nth(0).fill('60');
  await row.locator('.set-input').nth(1).fill('8');
  await row.locator('.set-check').click();
  await endSession(page);

  const logged = await page.evaluate(async () => {
    const m = await import('/js/state.js');
    const w = Object.values(m.getState().workouts)
      .filter((x) => !x.deleted).sort((a, b) => b.startedAt - a.startedAt)[0];
    const d = new Date(w.startedAt);
    const pad = (n) => String(n).padStart(2, '0');
    return {
      iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      finishedSameDay: new Date(w.finishedAt).toDateString() === d.toDateString(),
    };
  });
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  if (logged.iso !== todayISO) throw new Error(`logged ${logged.iso}, expected today ${todayISO}`);
  if (!logged.finishedSameDay) throw new Error('finishedAt fell on a different day');
});
await step('history files it under today', async () => {
  await page.locator('.tab[data-tab="history"]').click();
  await page.waitForSelector('.card-history');
  const t = await page.locator('.card-history').first().innerText();
  if (!/Today/.test(t)) throw new Error('history does not say Today: ' + t);
});
await step('the plan ticks that session off for the week', async () => {
  await page.locator('.tab[data-tab="plan"]').click();
  await page.waitForSelector('.sched-row');
  if (!(await page.locator('.sched-row.is-done').count())) throw new Error('nothing marked done');
  const label = await page.locator('.sched-row.is-done .sched-start').first().innerText();
  if (!/again/i.test(label)) throw new Error('a done session should offer "Again", got ' + label);
});


console.log('\n== a plan that finishes ==');
await step('a multi-week CSV block is set not to repeat', async () => {
  const repeat = await page.evaluate(async () => {
    const m = await import('/js/state.js');
    const p = Object.values(m.getState().programs).find((x) => !x.deleted && x.active);
    return { repeat: p.repeat, weeks: p.weeks.length };
  });
  if (repeat.weeks !== 9) throw new Error('expected 9 weeks, got ' + repeat.weeks);
  if (repeat.repeat !== false) throw new Error('a 9-week block should not repeat, got ' + repeat.repeat);
});
await step('the plan says when it ends', async () => {
  await page.locator('.tab[data-tab="plan"]').click();
  await page.waitForSelector('.card-today');
  const t = await page.locator('.view').innerText();
  if (!/ends/i.test(t)) throw new Error('no end date shown');
});
await step('once past the end it reports completion, not week 1 again', async () => {
  await page.evaluate(async () => {
    const m = await import('/js/state.js');
    const p = Object.values(m.getState().programs).find((x) => !x.deleted && x.active);
    // move the start back so the block has already run its course
    m.upsert('programs', { ...p, startDate: '2020-01-06' });
  });
  await page.locator('.tab[data-tab="train"]').click();
  await page.locator('.tab[data-tab="plan"]').click();
  await page.waitForSelector('.card-today');
  const t = await page.locator('.card-today').innerText();
  if (!/Plan complete/.test(t)) throw new Error('expected completion, got: ' + t);
  if (await page.locator('.sched-row').count() !== 0) throw new Error('finished plan still lists days');
});
await step('“Run it again” restarts it from this week', async () => {
  await page.getByRole('button', { name: 'Run it again' }).click();
  await page.waitForSelector('.sched-row', { timeout: 4000 });
  const t = await page.locator('.card-today').innerText();
  if (/Plan complete/.test(t)) throw new Error('still complete after restart');
});


console.log('\n== editing the schedule ==');
await step('tapping a rest day offers the routines', async () => {
  await ctx.close();
  ({ context: ctx, page } = await newSession());
  await page.locator('.tab[data-tab="plan"]').click();
  await page.getByRole('button', { name: 'Paste a plan' }).click();
  await page.locator('input[type="file"]').setInputFiles(path.join(ROOT, 'tests/fixtures/plan.csv'));
  await page.waitForSelector('.plan-ok');
  await page.getByRole('button', { name: 'Add this plan' }).click();
  await page.waitForSelector('.sched-row');

  const rest = page.locator('.sched-row.is-rest').first();
  const day = (await rest.locator('.sched-day').innerText()).trim();
  await rest.locator('.sched-name').click();
  await page.waitForSelector('.sheet', { timeout: 4000 });
  const sheet = await page.locator('.sheet').innerText();
  if (!/Full Body A/.test(sheet)) throw new Error('routines not offered: ' + sheet.slice(0, 120));
  if (!/rest/i.test(sheet)) throw new Error('no rest-day option');
  globalThis.__restDay = day;
});
await step('choosing a routine assigns it to that day', async () => {
  await page.locator('.picker-item, .menu-item').filter({ hasText: 'Full Body A' }).first().click();
  await page.waitForSelector('.sheet', { state: 'detached', timeout: 4000 });
  const rows = await page.locator('.sched-row').allInnerTexts();
  const target = rows.find((r) => r.trim().startsWith(globalThis.__restDay));
  if (!/Full Body A/.test(target)) throw new Error(`${globalThis.__restDay} is still: ${target}`);
});
await step('a session can be dragged to another day', async () => {
  const before = await page.locator('.sched-row').allInnerTexts();
  const fromIdx = before.findIndex((r) => /Full Body B/.test(r));
  if (fromIdx < 0) throw new Error('no Full Body B row to drag');
  const toIdx = before.findIndex((r, i) => i !== fromIdx && /Rest/.test(r) && i < 7);
  if (toIdx < 0) throw new Error('no rest row in week 1 to drop onto');

  const grip = page.locator('.sched-row').nth(fromIdx).locator('.sched-grip');
  if (!(await grip.count())) throw new Error('session row has no drag grip');
  const from = await grip.boundingBox();
  const to = await page.locator('.sched-row').nth(toIdx).boundingBox();

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(400);

  const after = await page.locator('.sched-row').allInnerTexts();
  if (!/Full Body B/.test(after[toIdx])) {
    throw new Error(`drop did not land: row ${toIdx} is "${after[toIdx]}"`);
  }
});
await step('only the grip opts out of touch scrolling', async () => {
  // touch-action:none on the rows themselves would make the 21-day list
  // unscrollable on a phone — worse than having no drag at all
  const ta = await page.evaluate(() => ({
    row: getComputedStyle(document.querySelector('.sched-row')).touchAction,
    grip: getComputedStyle(document.querySelector('.sched-grip')).touchAction,
    rowsWithNone: [...document.querySelectorAll('.sched-row')]
      .filter((r) => getComputedStyle(r).touchAction === 'none').length,
  }));
  if (ta.grip !== 'none') throw new Error('grip must be touch-action:none, got ' + ta.grip);
  if (ta.rowsWithNone > 0) throw new Error(`${ta.rowsWithNone} rows block touch scrolling`);
});
await step('the page still scrolls with the plan open', async () => {
  const before = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(150);
  const after = await page.evaluate(() => window.scrollY);
  if (after <= before) throw new Error(`page did not scroll (${before} -> ${after})`);
});


console.log('\n== program library ==');
await step('a fresh install can browse the built-in programs', async () => {
  await ctx.close();
  ({ context: ctx, page } = await newSession());
  await page.locator('.tab[data-tab="plan"]').click();
  await page.getByRole('button', { name: 'Browse programs' }).click();
  await page.waitForSelector('.prog-browse .picker-item');
  const n = await page.locator('.prog-browse .picker-item').count();
  if (n < 30) throw new Error(`only ${n} programs listed`);
});
await step('every program lists its length, days and equipment', async () => {
  const meta = await page.locator('.prog-browse .picker-item .picker-meta').allInnerTexts();
  const bad = meta.filter((t) => !/week/.test(t) || !/days? a week/.test(t));
  if (bad.length) throw new Error(`${bad.length} programs have no meta line, e.g. "${bad[0]}"`);
});
await step('filtering by goal narrows the list', async () => {
  const all = await page.locator('.prog-browse .picker-item').count();
  await page.locator('.chip', { hasText: 'Endurance' }).click();
  await page.waitForFunction(
    (before) => document.querySelectorAll('.prog-browse .picker-item').length < before,
    all, { timeout: 3000 },
  );
  const few = await page.locator('.prog-browse .picker-item').count();
  if (few < 1) throw new Error('endurance filter returned nothing');
});
await step('filtering by days a week narrows it further', async () => {
  await page.locator('.chip', { hasText: '2 days' }).click();
  await page.waitForTimeout(100);
  const metas = await page.locator('.prog-browse .picker-item .picker-meta').allInnerTexts();
  if (!metas.length) throw new Error('no programs train twice a week');
  const wrong = metas.filter((t) => !/2 days a week/.test(t));
  if (wrong.length) throw new Error(`filter leaked: "${wrong[0]}"`);
});
await step('searching finds a program by name', async () => {
  await page.locator('.chip', { hasText: 'Any days' }).click();
  await page.locator('.chip', { hasText: 'All' }).first().click();
  await page.locator('.prog-browse input[type="search"]').fill('muscular endurance');
  await page.waitForTimeout(150);
  const names = await page.locator('.prog-browse .picker-name').allInnerTexts();
  if (!names.some((t) => /Muscular Endurance/i.test(t))) {
    throw new Error('search did not find it: ' + names.join(', '));
  }
});
await step('the detail sheet shows the week-by-week layout', async () => {
  // take the length off the list row, so the assertion does not depend on
  // which program happens to sort first
  const meta = await page.locator('.prog-browse .picker-item .picker-meta').first().innerText();
  const weeks = meta.match(/(\d+) weeks?/)[1];
  await page.locator('.prog-browse .picker-item').first().click();
  await page.waitForSelector('.prog-detail');
  const text = await page.locator('.prog-detail').innerText();
  if (!/Week 1:/.test(text)) throw new Error('no week layout: ' + text.slice(0, 200));
  if (!new RegExp(`Week ${weeks}:`).test(text)) {
    throw new Error(`says ${weeks} weeks but the layout stops short`);
  }
});
await step('using a program builds routines and a schedule', async () => {
  await page.getByRole('button', { name: 'Use this program' }).click();
  await page.waitForSelector('.sched-row', { timeout: 6000 });
  const routines = await page.locator('.card .routine-items').count();
  if (routines < 2) throw new Error(`expected several routines, got ${routines}`);
  const rests = await page.locator('.sched-row.is-rest').count();
  const rows = await page.locator('.sched-row').count();
  if (rows - rests < 1) throw new Error('nothing was scheduled');
});
await step('a hold in a built-in program logs seconds, not reps', async () => {
  // the library leans on holds heavily; if they import as reps they poison
  // every volume figure in the app
  const modes = await page.evaluate(async () => {
    const m = await import('/js/state.js');
    const all = Object.values(m.getState().exercises);
    return {
      plank: all.find((e) => e.name === 'Plank')?.mode,
      routineHolds: Object.values(m.getState().routines)
        .flatMap((r) => r.items || [])
        .filter((i) => i.mode === 'time').length,
    };
  });
  if (modes.plank !== 'time') throw new Error('Plank is not a time exercise: ' + modes.plank);
  if (!modes.routineHolds) throw new Error('no holds carried into the routines');
});
await step('a session from a program can be logged end to end', async () => {
  await page.locator('.sched-start').first().click();
  await page.waitForSelector('.entry', { timeout: 5000 });
  const entries = await page.locator('.entry').count();
  if (!entries) throw new Error('session started with no exercises');

  const row = page.locator('.entry').first().locator('.set-row').first();
  await row.locator('.set-input').nth(0).fill('20');
  await row.locator('.set-input').nth(1).fill('8');
  await row.locator('.set-check').click();
  if (!await page.locator('.set-row.set-done').count()) throw new Error('the set did not log');

  if (!await endSession(page)) throw new Error('could not finish the session');
});
await step('a repeating program keeps running past its written weeks', async () => {
  const repeats = await page.evaluate(async () => {
    const m = await import('/js/state.js');
    const p = Object.values(m.getState().programs).find((x) => x.active && !x.deleted);
    return p ? { name: p.name, weeks: p.weeks.length, repeat: p.repeat } : null;
  });
  if (!repeats) throw new Error('no active program');
  // the one just imported is the six-week endurance block, which must finish
  if (repeats.repeat !== false) throw new Error(`${repeats.name} should not repeat`);
});

console.log('\n== shipping an update ==');
await step('a new version reaches an already-installed app', async () => {
  // This is the path every future fix takes to the phone. It broke once by
  // serving a new cache the old files, so it is worth testing for real.
  await ctx.close();
  ({ context: ctx, page } = await newSession());
  await page.evaluate(() => navigator.serviceWorker.ready);

  await page.locator('.tab[data-tab="plan"]').click();
  await page.getByRole('button', { name: 'Browse programs' }).click();
  await page.waitForSelector('.prog-browse .picker-item');
  const before = await page.locator('.prog-browse .picker-item').count();

  // ship a change: one more program, and the version bump that carries it
  const minimal = fs.readFileSync(path.join(ROOT, 'js/programs/minimal.js'), 'utf8');
  OVERRIDES.set('/js/programs/minimal.js', minimal + `
MINIMAL.push({
  id: 'update-probe', name: 'Update Probe', goal: 'strength', level: 'beginner',
  days: 1, weeks: 1, repeat: true, equipment: 'None',
  summary: 'Only exists to prove an update landed.', detail: 'Test only.',
  csv: 'Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s)\\nT,1,Mon,T,1,Push-Up,1,10,60',
});
`);
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const bumped = sw.replace(/const VERSION = 'v[\d.]+'/, "const VERSION = 'v99.0.0'");
  if (bumped === sw) throw new Error('could not bump the service worker version');
  OVERRIDES.set('/sw.js', bumped);

  try {
    // coming back to the foreground is what triggers the check
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(async () => {
      const m = await import('/js/programs/index.js');
      return m.PROGRAMS.some((p) => p.id === 'update-probe');
    }, null, { timeout: 20000 });
  } finally {
    OVERRIDES.delete('/js/programs/minimal.js');
    OVERRIDES.delete('/sw.js');
  }

  await page.locator('.tab[data-tab="plan"]').click();
  await page.getByRole('button', { name: 'Browse programs' }).click();
  await page.waitForSelector('.prog-browse .picker-item');
  const after = await page.locator('.prog-browse .picker-item').count();
  if (after !== before + 1) throw new Error(`expected ${before + 1} programs after the update, got ${after}`);
});
await step('the update check runs when the app comes back to the foreground', async () => {
  // an installed app can go days without a navigation, so a version check that
  // only happens on load never happens at all
  const wired = await page.evaluate(() => {
    const reg = navigator.serviceWorker.controller !== null;
    return { controlled: reg };
  });
  if (!wired.controlled) throw new Error('the page is not controlled by a service worker');
  const src = await (await fetch(`http://localhost:${PORT}/js/app.js`)).text();
  if (!/visibilitychange/.test(src)) throw new Error('no foreground update check');
  if (!/controllerchange/.test(src)) throw new Error('nothing reloads the page when the worker changes');
});

console.log('\n== console errors ==');
console.log(problems.length ? 'PROBLEMS:\n' + problems.map((p) => ' - ' + p).join('\n') : '  none');

await browser.close();
server.close();
process.exit(problems.length ? 1 : 0);
