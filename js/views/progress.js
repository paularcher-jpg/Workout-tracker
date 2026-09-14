// Charts and personal bests.

import { h, clear, fmtWeight, fmtVolume, emptyState, pickExercise, icon } from '../ui.js';
import { get, getState, updateLocal } from '../state.js';
import { lineChart, barChart } from '../charts.js';
import * as W from '../workout.js';

export function destroy() {}

export function render(root, { refresh }) {
  clear(root);
  const wrap = h('div', { class: 'view' });
  const stats = W.overallStats();

  wrap.appendChild(h('div', { class: 'hero' },
    h('h1', {}, 'Progress'),
    h('p', { class: 'muted' }, 'Where the numbers are going.'),
  ));

  if (!stats.workouts) {
    wrap.appendChild(emptyState(icon('progress'), 'No data yet', 'Log a couple of sessions and your trends will appear here.'));
    root.appendChild(wrap);
    return;
  }

  wrap.appendChild(h('div', { class: 'stat-grid' },
    bigStat(String(stats.workouts), 'workouts'),
    bigStat(String(stats.sets), 'sets'),
    bigStat(fmtVolume(stats.volume), 'total volume'),
    bigStat(`${stats.streak}`, `week streak`),
  ));

  // weekly volume
  const weekly = W.weeklyVolume(12);
  wrap.appendChild(h('section', { class: 'card' },
    h('h3', {}, 'Weekly volume'),
    h('p', { class: 'muted small' }, 'Total weight moved per week, last 12 weeks.'),
    barChart(weekly.map((p) => ({ t: p.t, value: p.value })), { unit: ` ${getState().settings.units}` }),
  ));

  // per-exercise
  const used = W.exercisesUsed();
  const tracked = getState().local.trackedExerciseId;
  const candidates = [...used.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .filter((id) => get('exercises', id));
  const selected = candidates.includes(tracked) ? tracked : candidates[0];

  if (selected) {
    const ex = get('exercises', selected);
    const series = W.exerciseSeries(selected);
    const pbs = W.personalBests(selected);
    const section = h('section', { class: 'card' });

    section.appendChild(h('div', { class: 'card-head' },
      h('h3', {}, ex.name),
      h('button', {
        class: 'btn btn-quiet btn-sm', type: 'button',
        onclick: async () => {
          const id = await pickExercise({ title: 'Track exercise' });
          if (id) { updateLocal({ trackedExerciseId: id }); refresh(); }
        },
      }, 'Change'),
    ));

    const isTime = W.isTimeExercise(selected);

    if (pbs && isTime) {
      section.appendChild(h('div', { class: 'stat-row' },
        smallStat(`${Math.round(pbs.secs || 0)}s`, 'longest hold'),
        pbs.weight ? smallStat(fmtWeight(pbs.weight), 'heaviest') : null,
      ));
    } else if (pbs) {
      section.appendChild(h('div', { class: 'stat-row' },
        smallStat(fmtWeight(pbs.weight), 'best set'),
        smallStat(fmtWeight(pbs.est1RM), 'est. 1RM'),
        smallStat(fmtVolume(pbs.volume), 'best session'),
      ));
    }

    if (isTime) {
      // a hold has no 1-rep max; duration is the whole story
      section.appendChild(h('p', { class: 'chart-caption' }, 'Longest hold'));
      section.appendChild(lineChart(series.map((p) => ({ t: p.t, value: p.topSecs || 0 })), { unit: 's' }));
    } else {
      section.appendChild(h('p', { class: 'chart-caption' }, 'Estimated 1-rep max'));
      section.appendChild(lineChart(series.map((p) => ({ t: p.t, value: p.est1RM })), { unit: ` ${getState().settings.units}` }));

      section.appendChild(h('p', { class: 'chart-caption' }, 'Heaviest set'));
      section.appendChild(lineChart(series.map((p) => ({ t: p.t, value: p.topWeight })), { unit: ` ${getState().settings.units}`, area: false }));
    }

    const recent = series.slice(-8).reverse();
    section.appendChild(h('div', { class: 'mini-table' },
      h('div', { class: 'mini-row mini-head' },
        h('span', {}, 'Date'), h('span', {}, 'Top set'), h('span', {}, isTime ? 'Sets' : 'Volume')),
      recent.map((p) => h('div', { class: 'mini-row' },
        h('span', {}, p.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })),
        h('span', {}, isTime
          ? `${Math.round(p.topSecs || 0)}s${p.topWeight ? ` @ ${fmtWeight(p.topWeight, { withUnit: false })}` : ''}`
          : `${fmtWeight(p.topWeight, { withUnit: false })}×${p.topReps}`),
        h('span', {}, isTime ? String(p.sets) : fmtVolume(p.volume)),
      )),
    ));

    wrap.appendChild(section);
  }

  // records table
  const holds = candidates
    .filter((id) => W.isTimeExercise(id))
    .map((id) => ({ exercise: get('exercises', id), pbs: W.personalBests(id) }))
    .filter((r) => r.pbs && r.pbs.secs > 0)
    .sort((a, b) => b.pbs.secs - a.pbs.secs);

  const records = candidates
    .filter((id) => !W.isTimeExercise(id))
    .map((id) => ({ exercise: get('exercises', id), pbs: W.personalBests(id) }))
    .filter((r) => r.pbs && r.pbs.weight > 0)
    .sort((a, b) => b.pbs.est1RM - a.pbs.est1RM)
    .slice(0, 20);

  if (records.length) {
    wrap.appendChild(h('section', { class: 'card' },
      h('h3', {}, 'Personal bests'),
      h('div', { class: 'mini-table' },
        h('div', { class: 'mini-row mini-head' },
          h('span', {}, 'Exercise'), h('span', {}, 'Best set'), h('span', {}, 'Est. 1RM')),
        records.map((r) => h('div', { class: 'mini-row' },
          h('span', {}, r.exercise.name),
          h('span', {}, `${fmtWeight(r.pbs.weight, { withUnit: false })}×${r.pbs.reps}`),
          h('span', {}, fmtWeight(r.pbs.est1RM)),
        )),
      ),
    ));
  }

  if (holds.length) {
    wrap.appendChild(h('section', { class: 'card' },
      h('h3', {}, 'Longest holds'),
      h('div', { class: 'mini-table' },
        h('div', { class: 'mini-row mini-head' },
          h('span', {}, 'Exercise'), h('span', {}, 'Longest'), h('span', {}, 'Loaded')),
        holds.map((r) => h('div', { class: 'mini-row' },
          h('span', {}, r.exercise.name),
          h('span', {}, `${Math.round(r.pbs.secs)}s`),
          h('span', {}, r.pbs.weight ? fmtWeight(r.pbs.weight) : '—'),
        )),
      ),
    ));
  }

  root.appendChild(wrap);
}

function bigStat(value, label) {
  return h('div', { class: 'stat-card' }, h('strong', {}, value), h('span', {}, label));
}

function smallStat(value, label) {
  return h('div', { class: 'stat' }, h('strong', {}, value), h('span', {}, label));
}
