// Everything you've logged, newest first.

import { h, clear, toast, confirmSheet, openSheet, fmtWeight, fmtVolume, fmtDuration, fmtDate, emptyState, icon } from '../ui.js';
import { get, softDelete, commit, upsert } from '../state.js';
import * as W from '../workout.js';

export function destroy() {}

export function render(root, { refresh, navigate }) {
  clear(root);
  const workouts = W.workoutsSorted();
  const wrap = h('div', { class: 'view' });

  wrap.appendChild(h('div', { class: 'hero' },
    h('h1', {}, 'History'),
    h('p', { class: 'muted' }, workouts.length
      ? `${workouts.length} session${workouts.length === 1 ? '' : 's'} logged`
      : 'Your completed sessions will appear here.'),
  ));

  if (!workouts.length) {
    wrap.appendChild(emptyState(icon('history'), 'Nothing logged yet', 'Finish a workout and it will show up here.'));
    root.appendChild(wrap);
    return;
  }

  let lastMonth = '';
  for (const w of workouts) {
    const month = new Date(w.startedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (month !== lastMonth) {
      lastMonth = month;
      wrap.appendChild(h('h2', { class: 'month-head' }, month));
    }
    wrap.appendChild(workoutCard(w, refresh, navigate));
  }

  root.appendChild(wrap);
}

function workoutCard(w, refresh, navigate) {
  const st = W.workoutStats(w);
  const card = h('section', { class: 'card card-history' });

  card.appendChild(h('div', { class: 'card-head' },
    h('div', {},
      h('h3', {}, w.name || 'Workout'),
      h('p', { class: 'muted small' }, fmtDate(w.startedAt)),
    ),
    h('button', {
      class: 'icon-btn', type: 'button', 'aria-label': 'Options',
      onclick: () => workoutMenu(w, refresh, navigate),
    }, '⋯'),
  ));

  card.appendChild(h('div', { class: 'stat-row' },
    stat(String(st.exercises), 'exercises'),
    stat(String(st.sets), 'sets'),
    stat(fmtVolume(st.volume), 'volume'),
    stat(fmtDuration(st.durationMs), 'time'),
  ));

  const details = h('div', { class: 'history-detail' });
  for (const entry of w.entries || []) {
    const ex = get('exercises', entry.exerciseId);
    const working = entry.sets.filter((s) => !s.warmup);
    const best = working.reduce((a, b) => ((Number(b.weight) || 0) > (Number(a?.weight) || 0) ? b : a), working[0]);
    details.appendChild(h('div', { class: 'history-line' },
      h('span', { class: 'history-ex' }, ex?.name || 'Exercise'),
      h('span', { class: 'history-sets' },
        working.map((s) => `${fmtWeight(s.weight, { withUnit: false })}×${s.reps}`).join(', ') || '—'),
      best ? h('span', { class: 'history-best' }, `best ${fmtWeight(best.weight)}`) : null,
    ));
  }
  if (w.notes) details.appendChild(h('p', { class: 'muted small pad-top' }, w.notes));
  details.hidden = true;
  card.appendChild(details);

  card.appendChild(h('button', {
    class: 'btn btn-quiet btn-block btn-sm',
    type: 'button',
    onclick: (e) => {
      details.hidden = !details.hidden;
      e.currentTarget.textContent = details.hidden ? 'Show details' : 'Hide details';
    },
  }, 'Show details'));

  return card;
}

function stat(value, label) {
  return h('div', { class: 'stat' }, h('strong', {}, value), h('span', {}, label));
}

function workoutMenu(w, refresh, navigate) {
  openSheet({
    title: w.name || 'Workout',
    render: (close) => h('div', { class: 'menu' },
      h('button', {
        class: 'menu-item', type: 'button',
        onclick: () => { close(); renameWorkout(w, refresh); },
      }, 'Rename / add notes'),
      h('button', {
        class: 'menu-item', type: 'button',
        onclick: () => {
          close();
          if (W.activeWorkout()) { toast('Finish your current workout first', 'error'); return; }
          repeat(w);
          navigate('train');
        },
      }, 'Repeat this workout'),
      h('button', {
        class: 'menu-item menu-danger', type: 'button',
        onclick: async () => {
          close();
          const ok = await confirmSheet({
            title: 'Delete workout?',
            message: 'This session will be removed from your history and progress charts.',
            confirmLabel: 'Delete', danger: true,
          });
          if (ok) { softDelete('workouts', w.id); refresh(); toast('Workout deleted'); }
        },
      }, 'Delete'),
    ),
  });
}

function repeat(source) {
  W.startWorkout({ name: source.name });
  for (const entry of source.entries || []) {
    const created = W.addExerciseToActive(entry.exerciseId);
    if (!created) continue;
    if (entry.target) created.target = { ...entry.target };
    if (entry.restSec != null) created.restSec = entry.restSec;
    created.sets = entry.sets.map((s) => ({
      id: Math.random().toString(36).slice(2),
      weight: s.weight, reps: s.reps, warmup: !!s.warmup, done: false, doneAt: null,
    }));
  }
  commit({ immediate: true });
}

function renameWorkout(w, refresh) {
  openSheet({
    title: 'Edit workout',
    render: (close) => {
      const name = h('input', { class: 'input', value: w.name || '', placeholder: 'Workout name' });
      const notes = h('textarea', { class: 'input', rows: 4, placeholder: 'Notes (how it felt, injuries, etc.)' });
      notes.value = w.notes || '';
      return h('div', { class: 'form' },
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Name'), name),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Notes'), notes),
        h('button', {
          class: 'btn btn-primary btn-block', type: 'button',
          onclick: () => {
            upsert('workouts', { ...w, name: name.value.trim() || 'Workout', notes: notes.value });
            close();
            refresh();
            toast('Saved', 'success');
          },
        }, 'Save'),
      );
    },
  });
}
