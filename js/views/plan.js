// Your training plan on a calendar: what you are doing today, and what is
// coming up. Routines are the templates; the plan says which day each falls on.

import { h, clear, toast, confirmSheet, openSheet, emptyState } from '../ui.js';
import { list, get, upsert, softDelete } from '../state.js';
import * as P from '../program.js';
import * as W from '../workout.js';
import { libraryNode, editRoutine } from './routines.js';
import { parsePlan, applyPlan, newExercisesIn } from '../planparse.js';
import { field } from './train.js';

export function destroy() {}

export function render(root, { refresh, navigate }) {
  clear(root);
  const wrap = h('div', { class: 'view' });
  const program = P.activeProgram();

  wrap.appendChild(h('div', { class: 'hero' },
    h('h1', {}, 'Plan'),
    h('p', { class: 'muted' }, program
      ? program.name
      : 'Schedule your sessions so the app knows what today is.'),
  ));

  if (!program) {
    wrap.appendChild(emptyState('🗓', 'No plan yet',
      'Paste a written plan and the app will lay it out across your week.'));
    wrap.appendChild(h('button', {
      class: 'btn btn-primary btn-lg btn-block', type: 'button',
      onclick: () => openPasteSheet(refresh),
    }, 'Paste a plan'));
    wrap.appendChild(h('button', {
      class: 'btn btn-secondary btn-block', type: 'button',
      onclick: () => { createEmptyPlan(); refresh(); },
    }, 'Build one by hand'));
  } else {
    wrap.appendChild(todayCard(program, refresh, navigate));
    wrap.appendChild(upcomingCard(program, refresh, navigate));
    wrap.appendChild(h('div', { class: 'btn-row' },
      h('button', {
        class: 'btn btn-secondary', type: 'button',
        onclick: () => openPlanEditor(program, refresh),
      }, 'Edit plan'),
      h('button', {
        class: 'btn btn-quiet', type: 'button',
        onclick: () => openPasteSheet(refresh),
      }, 'Paste a new plan'),
    ));
  }

  wrap.appendChild(h('div', { class: 'section-title' }, h('h2', {}, 'Routines')));
  wrap.appendChild(libraryNode({ refresh, navigate }));

  root.appendChild(wrap);
}

/* ------------------------------------------------------------ today card */

function startScheduled(slot, refresh, navigate) {
  if (W.activeWorkout()) { toast('Finish your current workout first', 'error'); return; }
  upsert('routines', { ...slot.routine, lastUsedAt: Date.now() });
  W.startWorkout({ routineId: slot.routineId });
  navigate('train');
}

export function todayCard(program = P.activeProgram(), refresh, navigate) {
  const slot = P.todaysSession(program);
  const card = h('section', { class: 'card card-today' });

  const heading = h('div', {},
    h('p', { class: 'today-label' }, 'Today'),
    h('h3', {}, slot?.routine ? slot.routine.name : 'Rest day'),
  );
  card.appendChild(heading);

  if (!slot) {
    card.appendChild(h('p', { class: 'muted small' },
      `Starts ${new Date(P.startOfDay(program.startDate)).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}.`));
    return card;
  }

  card.appendChild(h('p', { class: 'muted small' },
    `Week ${slot.weekIndex + 1} of ${program.weeks.length} · ${P.DAY_NAMES[slot.dayIndex]}`));

  if (slot.routine) {
    const names = (slot.routine.items || [])
      .map((i) => get('exercises', i.exerciseId)?.name).filter(Boolean);
    card.appendChild(h('p', { class: 'muted small' },
      names.slice(0, 5).join(' · ') + (names.length > 5 ? ` +${names.length - 5}` : '')));
    card.appendChild(h('button', {
      class: 'btn btn-primary btn-block', type: 'button',
      onclick: () => startScheduled(slot, refresh, navigate),
    }, 'Start today’s session'));
  } else {
    const next = P.nextTrainingDay();
    if (next) {
      card.appendChild(h('p', { class: 'muted small' },
        `Next: ${next.routine.name} on ${next.date.toLocaleDateString(undefined, { weekday: 'long' })}.`));
    }
  }
  return card;
}

/* --------------------------------------------------------------- upcoming */

function upcomingCard(program, refresh, navigate) {
  const days = P.projection(21, new Date(), program);
  const card = h('section', { class: 'card' });
  card.appendChild(h('h3', {}, 'Coming up'));

  const listEl = h('div', { class: 'sched' });
  const todayISO = P.toISODate(new Date());

  for (const slot of days) {
    const isToday = P.toISODate(slot.date) === todayISO;
    const row = h('div', { class: `sched-row${isToday ? ' is-today' : ''}${slot.rest ? ' is-rest' : ''}` },
      h('span', { class: 'sched-day' }, P.DAY_SHORT[slot.dayIndex]),
      h('span', { class: 'sched-date' }, slot.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })),
      h('span', { class: 'sched-name' }, slot.routine ? slot.routine.name : 'Rest'),
      slot.routine && isToday
        ? h('button', {
          class: 'btn btn-primary btn-sm', type: 'button',
          onclick: () => startScheduled(slot, refresh, navigate),
        }, 'Start')
        : h('span', {}),
    );
    listEl.appendChild(row);
  }
  card.appendChild(listEl);
  return card;
}

/* ----------------------------------------------------------- plan editing */

function createEmptyPlan() {
  const program = P.newProgram('My plan', 1);
  const saved = upsert('programs', program);
  P.setActiveProgram(saved.id);
  return saved;
}

function openPlanEditor(program, refresh) {
  openSheet({
    title: 'Edit plan',
    fullHeight: true,
    onClose: refresh,
    render: (close) => {
      const body = h('div', { class: 'form' });

      const draw = () => {
        const current = get('programs', program.id) || program;
        clear(body);

        const nameInput = h('input', {
          class: 'input', value: current.name, placeholder: 'Plan name',
          onchange: (e) => upsert('programs', { ...current, name: e.target.value.trim() || 'My plan' }),
        });
        const startInput = h('input', {
          class: 'input', type: 'date', value: current.startDate,
          onchange: (e) => {
            if (!e.target.value) return;
            upsert('programs', { ...current, startDate: e.target.value });
            draw();
          },
        });
        body.append(
          field('Plan name', nameInput),
          field('Start date', startInput, 'Weeks run Monday to Sunday from this date.'),
        );

        const routines = list('routines').sort((a, b) => a.name.localeCompare(b.name));

        current.weeks.forEach((week, weekIndex) => {
          const block = h('div', { class: 'week-block' });
          block.appendChild(h('div', { class: 'week-head' },
            h('strong', {}, `Week ${weekIndex + 1}`),
            current.weeks.length > 1
              ? h('button', {
                class: 'icon-btn icon-danger', type: 'button', 'aria-label': `Remove week ${weekIndex + 1}`,
                onclick: () => {
                  const weeks = current.weeks.filter((_, i) => i !== weekIndex);
                  upsert('programs', { ...current, weeks });
                  draw();
                },
              }, '×')
              : null,
          ));

          P.DAY_NAMES.forEach((dayName, dayIndex) => {
            const selected = week.days[dayIndex]?.routineId || '';
            const select = h('select', {
              class: 'input input-sm',
              onchange: (e) => {
                const fresh = get('programs', program.id) || current;
                P.setSlot(fresh, weekIndex, dayIndex, e.target.value || null);
              },
            });
            select.appendChild(h('option', { value: '' }, 'Rest'));
            for (const r of routines) {
              select.appendChild(h('option', { value: r.id, selected: r.id === selected }, r.name));
            }
            block.appendChild(h('div', { class: 'week-row' },
              h('span', { class: 'week-day' }, P.DAY_SHORT[dayIndex]),
              select,
            ));
          });
          body.appendChild(block);
        });

        body.appendChild(h('button', {
          class: 'btn btn-secondary btn-block', type: 'button',
          onclick: () => {
            const fresh = get('programs', program.id) || current;
            upsert('programs', { ...fresh, weeks: [...fresh.weeks, P.emptyWeek()] });
            draw();
          },
        }, '+ Add a week'));

        body.appendChild(h('p', { class: 'muted small' },
          'Weeks repeat in order. One week repeats every week; three weeks cycle every three.'));

        body.appendChild(h('button', {
          class: 'btn btn-quiet btn-block', type: 'button',
          onclick: async () => {
            const ok = await confirmSheet({
              title: 'Delete plan?',
              message: 'The schedule is removed. Your routines and logged workouts are kept.',
              confirmLabel: 'Delete', danger: true,
            });
            if (ok) { softDelete('programs', program.id); close(); }
          },
        }, 'Delete plan'));
      };

      draw();
      return body;
    },
  });
}

/* ------------------------------------------------------------ paste a plan */

const EXAMPLE = `Monday - Push
  Barbell Bench Press 4x8 rest 180
  Incline Dumbbell Press 3x8-12
  Lateral Raise 3x15 @60s

Wednesday - Pull
  Deadlift 3x5 rest 240
  Lat Pulldown 3x10

Friday - Legs
  Back Squat 5x5 rest 3min
  Romanian Deadlift 3x10`;

export function openPasteSheet(refresh) {
  openSheet({
    title: 'Paste a plan',
    fullHeight: true,
    render: (close) => {
      const input = h('textarea', {
        class: 'input plan-input', rows: 12, spellcheck: false,
        placeholder: EXAMPLE,
        autocapitalize: 'off', autocorrect: 'off',
      });
      const startInput = h('input', {
        class: 'input', type: 'date', value: P.toISODate(P.mondayOf(new Date())),
      });
      const preview = h('div', { class: 'plan-preview' });

      const showPreview = () => {
        const parsed = parsePlan(input.value);
        clear(preview);
        if (!parsed.weeks.length) {
          preview.appendChild(h('p', { class: 'muted small' },
            'Nothing readable yet. Use one line per exercise, like "Bench Press 4x8".'));
          return null;
        }
        const sessions = parsed.weeks.flatMap((w) => w.days.filter(Boolean));
        const fresh = newExercisesIn(parsed);
        preview.appendChild(h('p', { class: 'plan-ok' },
          `${parsed.weeks.length} week${parsed.weeks.length === 1 ? '' : 's'} · ` +
          `${sessions.length} session${sessions.length === 1 ? '' : 's'} · ` +
          `${parsed.totalExercises} exercises`));
        for (const week of parsed.weeks) {
          for (const day of week.days) {
            if (!day) continue;
            preview.appendChild(h('p', { class: 'muted small' },
              `${P.DAY_SHORT[day.dayIndex]} — ${day.sessionName}: ${day.exercises.map((e) => `${e.name} ${e.sets}×${e.reps}`).join(', ')}`));
          }
        }
        if (fresh.length) {
          preview.appendChild(h('p', { class: 'plan-note' },
            `${fresh.length} new exercise${fresh.length === 1 ? '' : 's'} will be added: ${fresh.map((e) => e.name).join(', ')}`));
        }
        for (const warn of parsed.warnings) {
          preview.appendChild(h('p', { class: 'plan-warn' }, warn));
        }
        return parsed;
      };

      input.addEventListener('input', showPreview);
      showPreview();

      return h('div', { class: 'form' },
        h('p', { class: 'muted small' },
          'One line per exercise. Day headings like "Monday - Push" split it into sessions; ' +
          '"Week 2" starts a new week for plans that progress.'),
        input,
        field('Start date', startInput, 'The plan runs forward from here and repeats.'),
        preview,
        h('button', {
          class: 'btn btn-primary btn-block', type: 'button',
          onclick: () => {
            const parsed = parsePlan(input.value);
            if (!parsed.weeks.length) { toast('Nothing to import yet', 'error'); return; }
            const result = applyPlan(parsed, { startDate: startInput.value || undefined });
            close();
            refresh();
            toast(`Plan added · ${result.createdRoutines.length} sessions`, 'success');
          },
        }, 'Add this plan'),
      );
    },
  });
}
