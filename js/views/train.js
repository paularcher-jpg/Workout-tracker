// The screen you actually use in the gym. Big tap targets, no full re-render
// while typing, every change written to disk immediately.

import { h, clear, toast, pickExercise, confirmSheet, openSheet, fmtWeight, fmtVolume, fmtDuration, units, emptyState, icon } from '../ui.js';
import { getState, list, get, addCustomExercise, commit } from '../state.js';
import { MUSCLE_GROUPS } from '../exercises.js';
import * as P from '../program.js';
import { todayCard } from './plan.js';
import * as W from '../workout.js';
import * as Timer from '../timer.js';

let elapsedTimer = null;

export function destroy() {
  clearInterval(elapsedTimer);
  elapsedTimer = null;
}

export function render(root, { refresh, navigate }) {
  destroy();
  const active = W.activeWorkout();
  clear(root);
  root.appendChild(active ? activeView(active, refresh) : startView(refresh, navigate));
}

/* -------------------------------------------------------------- start view */

function startView(refresh, navigate) {
  const routines = list('routines').sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0));
  const recent = W.workoutsSorted()[0];
  const stats = W.overallStats();
  const program = P.activeProgram();

  const wrap = h('div', { class: 'view' });

  wrap.appendChild(h('div', { class: 'hero' },
    h('h1', {}, 'Ready to train'),
    h('p', { class: 'muted' },
      stats.workouts
        ? `${stats.workouts} session${stats.workouts === 1 ? '' : 's'} logged · ${fmtVolume(stats.volume)} lifted`
        : 'Start your first session below.'),
  ));

  // if a plan is scheduled, today's session leads
  if (program) {
    wrap.appendChild(todayCard(program, refresh, navigate));
  }

  wrap.appendChild(h('button', {
    class: `btn ${program ? 'btn-secondary' : 'btn-primary btn-lg'} btn-block`,
    type: 'button',
    onclick: () => { W.startWorkout(); refresh(); },
  }, 'Start empty workout'));

  if (routines.length && !program) {
    wrap.appendChild(h('div', { class: 'section-title' }, h('h2', {}, 'Start from a routine')));
    const grid = h('div', { class: 'routine-grid' });
    for (const r of routines) {
      const names = (r.items || [])
        .map((i) => get('exercises', i.exerciseId)?.name)
        .filter(Boolean);
      grid.appendChild(h('button', {
        class: 'card card-tap',
        type: 'button',
        onclick: () => { W.startWorkout({ routineId: r.id }); refresh(); },
      },
        h('h3', {}, r.name),
        h('p', { class: 'muted small' }, names.slice(0, 4).join(' · ') + (names.length > 4 ? ` +${names.length - 4}` : '')),
        h('span', { class: 'card-cta' }, `${names.length} exercise${names.length === 1 ? '' : 's'}`),
      ));
    }
    wrap.appendChild(grid);
  } else if (!program) {
    wrap.appendChild(h('div', { class: 'note' },
      h('p', {}, 'Tip: set up a plan and the app will tell you what to train each day, pre-filled with your last weights.'),
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => navigate('plan') }, 'Set up a plan'),
    ));
  }

  if (recent) {
    const st = W.workoutStats(recent);
    wrap.appendChild(h('div', { class: 'section-title' }, h('h2', {}, 'Last session')));
    wrap.appendChild(h('div', { class: 'card' },
      h('h3', {}, recent.name || 'Workout'),
      h('p', { class: 'muted small' }, new Date(recent.startedAt).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })),
      h('div', { class: 'stat-row' },
        stat(String(st.exercises), 'exercises'),
        stat(String(st.sets), 'sets'),
        stat(fmtVolume(st.volume), 'volume'),
        stat(fmtDuration(st.durationMs), 'time'),
      ),
      h('button', {
        class: 'btn btn-ghost btn-block',
        type: 'button',
        onclick: () => { repeatWorkout(recent); refresh(); },
      }, 'Repeat this workout'),
    ));
  }

  return wrap;
}

function repeatWorkout(source) {
  const w = W.startWorkout({ name: source.name });
  for (const entry of source.entries || []) {
    const created = W.addExerciseToActive(entry.exerciseId);
    if (!created) continue;
    // carry the plan's prescription too, or repeating a session silently
    // drops its targets, RPE, coaching notes and rest times
    if (entry.target) created.target = { ...entry.target };
    if (entry.restSec != null) created.restSec = entry.restSec;
    created.sets = entry.sets.map((s) => ({
      id: Math.random().toString(36).slice(2),
      weight: s.weight,
      reps: s.reps,
      warmup: !!s.warmup,
      done: false,
      doneAt: null,
    }));
  }
  commit({ immediate: true });
  return w;
}

function stat(value, label) {
  return h('div', { class: 'stat' }, h('strong', {}, value), h('span', {}, label));
}

/* ------------------------------------------------------------- active view */

function activeView(workout, refresh) {
  const wrap = h('div', { class: 'view' });

  const elapsed = h('span', { class: 'session-elapsed' }, '0:00');
  const tick = () => {
    const secs = Math.floor((Date.now() - workout.startedAt) / 1000);
    elapsed.textContent = Timer.formatClock(secs);
  };
  tick();
  clearInterval(elapsedTimer);
  elapsedTimer = setInterval(tick, 1000);

  const title = h('input', {
    class: 'session-title',
    value: workout.name || '',
    placeholder: 'Workout name',
    'aria-label': 'Workout name',
    oninput: (e) => { workout.name = e.target.value; commit(); },
  });

  wrap.appendChild(h('div', { class: 'session-head' },
    h('div', { class: 'session-head-main' }, title, elapsed),
    h('button', {
      class: 'btn btn-primary',
      type: 'button',
      onclick: () => finish(refresh),
    }, 'Finish'),
  ));

  const totals = h('div', { class: 'session-totals' });
  const drawTotals = () => {
    const done = workout.entries.flatMap((e) => e.sets.filter((s) => s.done && !s.warmup));
    const volume = done.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
    clear(totals);
    totals.append(
      h('span', {}, `${done.length} set${done.length === 1 ? '' : 's'}`),
      h('span', {}, fmtVolume(volume)),
    );
  };
  drawTotals();
  wrap.appendChild(totals);

  const listEl = h('div', { class: 'entries' });
  for (const entry of workout.entries) {
    listEl.appendChild(entryCard(entry, workout, refresh, drawTotals));
  }
  wrap.appendChild(listEl);

  if (!workout.entries.length) {
    wrap.appendChild(emptyState(icon('train'), 'No exercises yet', 'Add your first exercise to start logging sets.'));
  }

  wrap.appendChild(h('button', {
    class: 'btn btn-secondary btn-block',
    type: 'button',
    onclick: () => addExercise(refresh),
  }, '+ Add exercise'));

  wrap.appendChild(h('button', {
    class: 'btn btn-quiet btn-block',
    type: 'button',
    onclick: async () => {
      const ok = await confirmSheet({
        title: 'Discard workout?',
        message: 'This session will be deleted and nothing will be saved to your history.',
        confirmLabel: 'Discard',
        danger: true,
      });
      if (ok) { W.discardWorkout(); Timer.stop(); refresh(); toast('Workout discarded'); }
    },
  }, 'Discard workout'));

  return wrap;
}

async function addExercise(refresh) {
  const id = await pickExercise({
    title: 'Add exercise',
    onCreate: (name) => openCreateExercise(name),
  });
  if (!id) return;
  W.addExerciseToActive(id);
  refresh();
}

export function openCreateExercise(prefill = '') {
  return new Promise((resolve) => {
    let created = null;
    openSheet({
      title: 'New exercise',
      onClose: () => resolve(created),
      render: (close) => {
        const name = h('input', { class: 'input', value: prefill, placeholder: 'Exercise name', autocomplete: 'off' });
        const group = h('select', { class: 'input' });
        for (const g of MUSCLE_GROUPS) group.appendChild(h('option', { value: g }, g));
        const equip = h('select', { class: 'input' });
        for (const e of ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Other']) {
          equip.appendChild(h('option', { value: e }, e));
        }
        const rest = h('input', {
          class: 'input', type: 'number', inputmode: 'numeric', min: '0', step: '15',
          value: String(getState().settings.defaultRestSec),
        });

        return h('form', {
          class: 'form',
          onsubmit: (e) => {
            e.preventDefault();
            if (!name.value.trim()) { toast('Give it a name', 'error'); return; }
            created = addCustomExercise({
              name: name.value, group: group.value, equipment: equip.value, restSec: Number(rest.value),
            });
            close();
          },
        },
          field('Name', name),
          field('Muscle group', group),
          field('Equipment', equip),
          field('Default rest (seconds)', rest),
          h('button', { class: 'btn btn-primary btn-block', type: 'submit' }, 'Create exercise'),
        );
      },
    });
  });
}

export function field(label, control, hint) {
  return h('label', { class: 'field' },
    h('span', { class: 'field-label' }, label),
    control,
    hint ? h('span', { class: 'field-hint' }, hint) : null,
  );
}

/* ------------------------------------------------------------- entry card */

function entryCard(entry, workout, refresh, drawTotals) {
  const ex = get('exercises', entry.exerciseId);
  const name = ex?.name || 'Exercise';
  const prev = W.lastPerformance(entry.exerciseId);
  const card = h('section', { class: 'entry' });

  const target = entry.target;
  const targetText = target
    ? [
      target.sets && target.reps ? `Target ${target.sets}×${target.reps}` : null,
      target.rpe ? `RPE ${target.rpe}` : null,
    ].filter(Boolean).join(' · ')
    : '';

  card.appendChild(h('header', { class: 'entry-head' },
    h('div', {},
      h('h3', {}, name),
      h('p', { class: 'entry-sub' }, `${ex?.group || ''}${ex?.equipment ? ` · ${ex.equipment}` : ''}`),
      targetText ? h('p', { class: 'entry-target' }, targetText) : null,
      target?.notes ? h('p', { class: 'entry-note' }, target.notes) : null,
    ),
    h('button', {
      class: 'icon-btn',
      type: 'button',
      'aria-label': `Options for ${name}`,
      onclick: () => entryMenu(entry, workout, refresh),
    }, '⋯'),
  ));

  const restRow = h('div', { class: 'entry-rest' },
    h('span', {}, 'Rest'),
    h('button', {
      class: 'rest-pill',
      type: 'button',
      onclick: (e) => editRest(entry, e.currentTarget),
    }, Timer.formatClock(entry.restSec)),
  );
  card.appendChild(restRow);

  const table = h('div', { class: 'sets' });
  table.appendChild(h('div', { class: 'set-row set-head' },
    h('span', {}, 'Set'),
    h('span', {}, 'Prev'),
    h('span', {}, units()),
    h('span', {}, 'Reps'),
    h('span', {}, ''),
  ));

  entry.sets.forEach((set, i) => {
    table.appendChild(setRow(entry, set, i, prev, refresh, drawTotals));
  });
  card.appendChild(table);

  card.appendChild(h('button', {
    class: 'btn btn-quiet btn-block btn-sm',
    type: 'button',
    onclick: () => { W.addSet(entry.id); refresh(); },
  }, '+ Add set'));

  return card;
}

function setRow(entry, set, index, prev, refresh, drawTotals) {
  const working = entry.sets.filter((s) => !s.warmup);
  const workingIndex = working.indexOf(set);
  const priorSets = prev?.sets?.filter((s) => !s.warmup) || [];
  const prior = workingIndex >= 0 ? priorSets[workingIndex] : null;

  const row = h('div', { class: `set-row${set.done ? ' set-done' : ''}${set.warmup ? ' set-warmup' : ''}` });

  row.appendChild(h('button', {
    class: 'set-index',
    type: 'button',
    title: 'Tap to mark as a warm-up set',
    onclick: () => { W.patchSet(entry.id, set.id, { warmup: !set.warmup }); refresh(); },
  }, set.warmup ? 'W' : String(workingIndex + 1)));

  const priorLabel = prior ? `${fmtWeight(prior.weight, { withUnit: false })}×${prior.reps}` : '—';
  row.appendChild(h('button', {
    class: 'set-prev',
    type: 'button',
    disabled: !prior,
    title: prior ? 'Tap to copy' : '',
    onclick: () => {
      if (!prior) return;
      weightInput.value = prior.weight;
      repsInput.value = prior.reps;
      W.patchSet(entry.id, set.id, { weight: prior.weight, reps: prior.reps });
    },
  }, priorLabel));

  const weightInput = h('input', {
    class: 'set-input',
    type: 'text',
    inputmode: 'decimal',
    enterkeyhint: 'next',
    value: set.weight === '' ? '' : String(set.weight),
    placeholder: prior ? String(prior.weight) : '0',
    'aria-label': `Set ${workingIndex + 1} weight`,
    oninput: (e) => { W.patchSet(entry.id, set.id, { weight: sanitiseNumber(e.target.value) }); },
    onfocus: (e) => e.target.select(),
  });

  const repsInput = h('input', {
    class: 'set-input',
    type: 'text',
    inputmode: 'numeric',
    enterkeyhint: 'done',
    value: set.reps === '' ? '' : String(set.reps),
    placeholder: prior ? String(prior.reps) : '0',
    'aria-label': `Set ${workingIndex + 1} reps`,
    oninput: (e) => { W.patchSet(entry.id, set.id, { reps: sanitiseNumber(e.target.value, true) }); },
    onfocus: (e) => e.target.select(),
  });

  row.append(weightInput, repsInput);

  row.appendChild(h('button', {
    class: `set-check${set.done ? ' on' : ''}`,
    type: 'button',
    'aria-label': set.done ? 'Undo set' : 'Complete set',
    onclick: () => completeSet(entry, set, weightInput, repsInput, row, refresh, drawTotals),
  }, '✓'));

  return row;
}

function sanitiseNumber(value, integer = false) {
  const cleaned = String(value).replace(integer ? /[^0-9]/g : /[^0-9.]/g, '');
  if (cleaned === '') return '';
  return cleaned;
}

function completeSet(entry, set, weightInput, repsInput, row, refresh, drawTotals) {
  // The tick is the only confirmation a set registered, so its state is painted
  // here rather than waiting for a re-render that may never come.
  const check = row.querySelector('.set-check');
  const paint = (done) => {
    row.classList.toggle('set-done', done);
    if (!check) return;
    check.classList.toggle('on', done);
    check.setAttribute('aria-label', done ? 'Undo set' : 'Complete set');
  };

  if (set.done) {
    W.patchSet(entry.id, set.id, { done: false, doneAt: null });
    paint(false);
    row.classList.remove('set-pr');
    drawTotals();
    return;
  }

  const weight = Number(weightInput.value || weightInput.placeholder || 0);
  const reps = Number(repsInput.value || repsInput.placeholder || 0);
  if (reps <= 0) {
    repsInput.focus();
    toast('Enter your reps first', 'error');
    return;
  }

  const pr = !set.warmup && W.isPR(entry.exerciseId, { weight, reps, warmup: false });

  weightInput.value = String(weight);
  repsInput.value = String(reps);
  W.patchSet(entry.id, set.id, { weight, reps, done: true, doneAt: Date.now() });
  paint(true);
  weightInput.blur();
  repsInput.blur();
  drawTotals();

  carryForward(entry, set, row, weight, reps);

  if (pr) {
    toast('Personal best', 'success', { pr: true });
    // A flash, not a state: warm has to stay rare to mean anything, and in a
    // first session every set is a personal best. Remove before re-adding so
    // consecutive PRs replay, and clear it once the animation finishes.
    row.classList.remove('set-pr');
    void row.offsetWidth;
    row.classList.add('set-pr');
    row.addEventListener('animationend', () => row.classList.remove('set-pr'), { once: true });
  }

  const settings = getState().settings;
  if (settings.autoStartRest && !set.warmup && entry.restSec > 0) {
    Timer.start(entry.restSec);
    keepVisible(row);
  }
}

/** Keep a just-logged row clear of the rest bar, which floats over the list. */
function keepVisible(row) {
  requestAnimationFrame(() => {
    const bar = document.querySelector('.restbar:not([hidden])');
    if (!bar) return;
    const overlap = row.getBoundingClientRect().bottom - bar.getBoundingClientRect().top;
    if (overlap > -8) {
      const main = document.getElementById('main');
      main?.scrollBy({ top: overlap + 16, behavior: 'smooth' });
    }
  });
}


/**
 * After you log a set, the sets below it that are still empty inherit the same
 * numbers — so a straight-sets exercise is three taps, not six.
 */
function carryForward(entry, set, row, weight, reps) {
  const container = row.parentElement;
  if (!container) return;
  const rows = [...container.querySelectorAll('.set-row:not(.set-head)')];
  const from = entry.sets.indexOf(set);
  if (from < 0) return;

  entry.sets.forEach((other, i) => {
    if (i <= from || other.done) return;

    // Per field, not all-or-nothing: a plan prefills reps, so an all-or-nothing
    // rule would leave every later set without a weight.
    const patch = {};
    if (other.weight === '') patch.weight = weight;
    if (other.reps === '') patch.reps = reps;
    if (!Object.keys(patch).length) return;

    W.patchSet(entry.id, other.id, patch);
    const inputs = rows[i]?.querySelectorAll('.set-input');
    if (inputs?.length === 2) {
      if (patch.weight !== undefined) inputs[0].value = String(weight);
      if (patch.reps !== undefined) inputs[1].value = String(reps);
    }
  });
}

/* ----------------------------------------------------------------- menus */

function editRest(entry, button) {
  openSheet({
    title: 'Rest between sets',
    render: (close) => {
      const apply = (secs) => {
        W.patchEntry(entry.id, { restSec: secs });
        button.textContent = Timer.formatClock(secs);
        close();
      };
      const grid = h('div', { class: 'rest-grid' });
      for (const secs of [30, 45, 60, 75, 90, 120, 150, 180, 210, 240, 300]) {
        grid.appendChild(h('button', {
          class: `rest-option${entry.restSec === secs ? ' on' : ''}`,
          type: 'button',
          onclick: () => apply(secs),
        }, Timer.formatClock(secs)));
      }
      const custom = h('input', {
        class: 'input', type: 'number', min: '0', step: '5', inputmode: 'numeric',
        value: String(entry.restSec), placeholder: 'Seconds',
      });
      return h('div', { class: 'form' },
        grid,
        field('Custom (seconds)', custom),
        h('button', {
          class: 'btn btn-primary btn-block', type: 'button',
          onclick: () => apply(Math.max(0, Number(custom.value) || 0)),
        }, 'Save'),
      );
    },
  });
}

function entryMenu(entry, workout, refresh) {
  const idx = workout.entries.indexOf(entry);
  openSheet({
    title: get('exercises', entry.exerciseId)?.name || 'Exercise',
    render: (close) => h('div', { class: 'menu' },
      h('button', {
        class: 'menu-item', type: 'button', disabled: idx === 0,
        onclick: () => { W.moveEntry(entry.id, -1); close(); refresh(); },
      }, 'Move up'),
      h('button', {
        class: 'menu-item', type: 'button', disabled: idx === workout.entries.length - 1,
        onclick: () => { W.moveEntry(entry.id, 1); close(); refresh(); },
      }, 'Move down'),
      h('button', {
        class: 'menu-item', type: 'button', disabled: entry.sets.length <= 1,
        onclick: () => { W.removeSet(entry.id, entry.sets.at(-1)?.id); close(); refresh(); },
      }, 'Remove last set'),
      h('button', {
        class: 'menu-item menu-danger', type: 'button',
        onclick: () => { W.removeEntry(entry.id); close(); refresh(); },
      }, 'Remove exercise'),
    ),
  });
}

/* ---------------------------------------------------------------- finish */

async function finish(refresh) {
  const workout = W.activeWorkout();
  const done = workout.entries.flatMap((e) => e.sets.filter((s) => s.done));
  if (!done.length) {
    const ok = await confirmSheet({
      title: 'Nothing logged',
      message: 'No sets were marked complete, so there is nothing to save. Discard this session?',
      confirmLabel: 'Discard',
      danger: true,
    });
    if (ok) { W.discardWorkout(); Timer.stop(); refresh(); }
    return;
  }

  // capture the comparison before the new session lands in history
  const previous = workout.routineId
    ? W.workoutsSorted().find((w) => w.routineId === workout.routineId)
    : null;
  const prs = collectPRs(workout);

  const record = W.finishWorkout();
  Timer.stop();
  refresh();
  if (!record) return;

  document.dispatchEvent(new CustomEvent('wt:workout-saved'));
  showSummary(record, previous, prs, refresh);
}

/** Personal bests hit in this session, resolved before it is saved. */
function collectPRs(workout) {
  const out = [];
  for (const entry of workout.entries) {
    const best = entry.sets
      .filter((s) => s.done && !s.warmup)
      .reduce((a, b) => (W.estimate1RM(b.weight, b.reps) > W.estimate1RM(a?.weight, a?.reps) ? b : a), null);
    if (best && W.isPR(entry.exerciseId, { ...best, warmup: false })) {
      out.push({ name: get('exercises', entry.exerciseId)?.name || 'Exercise', set: best });
    }
  }
  return out;
}

/**
 * The end of a session is the half people remember, so it gets a real screen
 * rather than a toast that has gone before you have put the phone down.
 */
function showSummary(record, previous, prs, refresh) {
  const st = W.workoutStats(record);
  const prev = previous ? W.workoutStats(previous) : null;

  const delta = (now, before, fmt) => {
    if (!prev || !before) return null;
    const diff = now - before;
    if (Math.abs(diff) < 0.01) return h('span', { class: 'sum-delta' }, 'same as last time');
    return h('span', { class: `sum-delta ${diff > 0 ? 'up' : 'down'}` },
      `${diff > 0 ? '+' : '−'}${fmt(Math.abs(diff))} vs last time`);
  };

  openSheet({
    title: record.name || 'Workout complete',
    onClose: refresh,
    render: (close) => h('div', { class: 'summary' },
      h('p', { class: 'today-label' }, 'Session complete'),
      h('h2', { class: 'sum-headline' }, `${st.sets} set${st.sets === 1 ? '' : 's'} · ${fmtVolume(st.volume)}`),
      delta(st.volume, prev?.volume, (v) => fmtVolume(v)),

      h('div', { class: 'stat-row sum-stats' },
        stat(String(st.exercises), 'exercises'),
        stat(String(st.reps), 'reps'),
        stat(fmtDuration(st.durationMs), 'time'),
      ),

      prs.length
        ? h('div', { class: 'sum-prs' },
          h('p', { class: 'today-label' }, `${prs.length} personal best${prs.length === 1 ? '' : 's'}`),
          prs.map((p) => h('p', { class: 'sum-pr' },
            h('strong', {}, p.name),
            ` ${fmtWeight(p.set.weight, { withUnit: false })}×${p.set.reps}`)),
        )
        : null,

      h('div', { class: 'sum-lines' },
        record.entries.map((e) => {
          const working = e.sets.filter((x) => !x.warmup);
          const top = working.reduce((a, b) => ((Number(b.weight) || 0) > (Number(a?.weight) || 0) ? b : a), working[0]);
          return h('p', { class: 'sum-line' },
            h('span', {}, get('exercises', e.exerciseId)?.name || 'Exercise'),
            h('span', { class: 'muted' }, top ? `${fmtWeight(top.weight, { withUnit: false })}×${top.reps}` : '—'),
          );
        }),
      ),

      h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: close }, 'Done'),
    ),
  });
}
