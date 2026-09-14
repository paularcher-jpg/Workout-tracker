// Your training plan on a calendar: what you are doing today, and what is
// coming up. Routines are the templates; the plan says which day each falls on.

import { h, clear, toast, confirmSheet, openSheet, emptyState, icon } from '../ui.js';
import { list, get, upsert, softDelete } from '../state.js';
import * as P from '../program.js';
import * as W from '../workout.js';
import { libraryNode, editRoutine } from './routines.js';
import { parsePlan, applyPlan, newExercisesIn, sessionList, looksLikeCSV } from '../planparse.js';
import { field } from './train.js';

export function destroy() {}

export function render(root, { refresh, navigate }) {
  clear(root);
  const wrap = h('div', { class: 'view' });
  const program = P.activeProgram();

  const summary = program ? P.programSummary(program) : null;
  wrap.appendChild(h('div', { class: 'hero' },
    h('h1', {}, 'Plan'),
    h('p', { class: 'muted' }, program
      ? [
        program.name,
        `${summary.weeks} week${summary.weeks === 1 ? '' : 's'}`,
        `${summary.sessions} session${summary.sessions === 1 ? '' : 's'} a cycle`,
      ].filter((part, i) => i !== 0 || part.toLowerCase() !== 'plan').join(' · ')
      : 'Schedule your sessions so the app knows what today is.'),
  ));

  if (!program) {
    wrap.appendChild(emptyState(icon('plan'), 'No plan yet',
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
    const state = P.planState(program);
    if (state === 'finished') {
      heading.lastChild.textContent = 'Plan complete';
      card.appendChild(h('p', { class: 'muted small' },
        `${program.weeks.length} weeks done. Start the next block, or run this one again.`));
      card.appendChild(h('div', { class: 'btn-row' },
        h('button', {
          class: 'btn btn-primary', type: 'button',
          onclick: () => {
            upsert('programs', { ...program, startDate: P.toISODate(P.mondayOf(new Date())) });
            refresh();
            toast('Plan restarted from this week', 'success');
          },
        }, 'Run it again'),
        h('button', {
          class: 'btn btn-quiet', type: 'button',
          onclick: () => openPasteSheet(refresh),
        }, 'Add a new plan'),
      ));
      return card;
    }
    card.appendChild(h('p', { class: 'muted small' },
      `Starts ${P.startOfDay(program.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}.`));
    return card;
  }

  const end = P.planEndDate(program);
  card.appendChild(h('p', { class: 'muted small' },
    `Week ${slot.weekNumber + 1} of ${program.weeks.length} · ${P.DAY_NAMES[slot.dayIndex]}` +
    (end ? ` · ends ${end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : '')));

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
  const card = h('section', { class: 'card' });
  const live = W.activeWorkout();

  // Start from this Monday, not today, so a session you missed earlier in the
  // week is still on screen and can still be done.
  const weekStart = P.mondayOf(new Date());
  const from = weekStart < P.startOfDay(program.startDate)
    ? P.startOfDay(program.startDate)
    : weekStart;

  const days = P.projection(21, from, program);
  const todayISO = P.toISODate(new Date());
  const today = P.startOfDay(new Date());
  const doneThisWeek = W.routinesLoggedBetween(weekStart, P.addDays(weekStart, 6));

  card.appendChild(h('div', { class: 'card-head' },
    h('h3', {}, 'Your weeks'),
    h('span', { class: 'muted small' }, live
      ? 'Finish your session to start another'
      : 'Tap any session to start it'),
  ));

  const listEl = h('div', { class: 'sched' });

  for (const slot of days) {
    const iso = P.toISODate(slot.date);
    const isToday = iso === todayISO;
    const isPast = slot.date < today;
    const sameWeek = slot.date >= weekStart && slot.date <= P.addDays(weekStart, 6);
    const done = sameWeek && slot.routineId && doneThisWeek.has(slot.routineId);

    const classes = ['sched-row'];
    if (isToday) classes.push('is-today');
    if (slot.rest) classes.push('is-rest');
    if (isPast && !isToday) classes.push('is-past');
    if (done) classes.push('is-done');

    const row = h('div', { class: classes.join(' ') },
      h('span', { class: 'sched-day' }, P.DAY_SHORT[slot.dayIndex]),
      h('span', { class: 'sched-date' }, slot.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })),
      h('span', { class: 'sched-name' }, slot.routine ? slot.routine.name : 'Rest'),
      slot.routine
        ? h('button', {
          class: `btn btn-sm ${isToday && !live ? 'btn-primary' : 'btn-quiet'} sched-start`,
          type: 'button',
          disabled: !!live,
          title: live ? 'Finish your current workout first' : '',
          'aria-label': live
            ? `${slot.routine.name} — finish your current workout first`
            : `Start ${slot.routine.name} scheduled for ${slot.date.toDateString()}`,
          onclick: () => startScheduled(slot, refresh, navigate),
        }, done ? 'Again' : 'Start')
        : h('span', { class: 'sched-tick' }, ''),
    );

    if (done) row.querySelector('.sched-name').append(h('span', { class: 'sched-done-tag' }, 'done'));
    listEl.appendChild(row);
  }

  card.appendChild(listEl);

  const end = P.planEndDate(program);
  if (end && days.length && days.at(-1).date >= end) {
    card.appendChild(h('p', { class: 'muted small pad-top' },
      `Plan ends ${end.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}.`));
  }

  card.appendChild(h('p', { class: 'muted small pad-top' },
    'A session is logged on the day you actually do it, whichever day it was planned for.'));

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

        const repeats = current.repeat !== false;
        const repeatToggle = h('input', {
          type: 'checkbox', class: 'switch-input', checked: repeats,
          onchange: (e) => {
            upsert('programs', { ...(get('programs', program.id) || current), repeat: e.target.checked });
            draw();
          },
        });
        body.appendChild(h('label', { class: 'switch' },
          h('span', {}, 'Repeat when it ends'),
          repeatToggle,
          h('span', { class: 'switch-track' }),
        ));

        const end = P.planEndDate(current);
        body.appendChild(h('p', { class: 'muted small' }, repeats
          ? 'Weeks run in order and start again from week 1. Good for an ongoing weekly split.'
          : `Runs once and finishes${end ? ` on ${end.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}` : ''}. Good for a fixed block.`));

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
  Lat Pulldown 3x10`;

function titleFromFile(fileName) {
  return fileName
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

export function openPasteSheet(refresh) {
  openSheet({
    title: 'Add a plan',
    fullHeight: true,
    render: (close) => {
      let planName = '';

      const input = h('textarea', {
        class: 'input plan-input', rows: 12, spellcheck: false,
        placeholder: EXAMPLE,
        autocapitalize: 'off', autocorrect: 'off',
      });
      const startInput = h('input', {
        class: 'input', type: 'date', value: P.toISODate(P.mondayOf(new Date())),
      });
      const preview = h('div', { class: 'plan-preview' });
      const fileLabel = h('p', { class: 'muted small' });

      const fileInput = h('input', {
        type: 'file', accept: '.csv,.txt,text/csv,text/plain',
        style: { display: 'none' },
        onchange: async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            input.value = await file.text();
            planName = titleFromFile(file.name);
            fileLabel.textContent = `Loaded ${file.name}`;
            showPreview();
          } catch (err) {
            toast('Could not read that file', 'error');
          }
        },
      });

      const parsed = () => parsePlan(input.value, { name: planName || 'My plan' });

      const showPreview = () => {
        const plan = parsed();
        clear(preview);

        if (!plan.weeks.length) {
          preview.appendChild(h('p', { class: 'muted small' },
            'Nothing readable yet. Upload a CSV, or type one line per exercise like "Bench Press 4x8".'));
          return;
        }

        const sessions = sessionList(plan);
        const fresh = newExercisesIn(plan);

        preview.appendChild(h('p', { class: 'plan-ok' },
          `${plan.weeks.length} week${plan.weeks.length === 1 ? '' : 's'} · ` +
          `${sessions.length} session${sessions.length === 1 ? '' : 's'} · ` +
          `${plan.totalExercises} exercises`));

        if (looksLikeCSV(input.value)) {
          preview.appendChild(h('p', { class: 'muted small' }, `Read as a spreadsheet · “${plan.name}”`));
        }

        for (const session of sessions) {
          preview.appendChild(h('p', { class: 'plan-session' },
            h('strong', {}, session.name),
            ` — ${session.exercises.length} exercise${session.exercises.length === 1 ? '' : 's'}`,
          ));
        }

        // how the weeks lay out
        const layout = h('div', { class: 'plan-weeks' });
        plan.weeks.forEach((week, i) => {
          const named = week.days
            .map((key, day) => (key ? `${P.DAY_SHORT[day]} ${plan.sessions[key].name}` : null))
            .filter(Boolean);
          layout.appendChild(h('p', { class: 'muted small' },
            `Week ${i + 1}: ${named.length ? named.join(' · ') : 'nothing scheduled'}`));
        });
        preview.appendChild(layout);

        if (fresh.length) {
          preview.appendChild(h('p', { class: 'plan-note' },
            `${fresh.length} new exercise${fresh.length === 1 ? '' : 's'} will be added: ${fresh.map((e) => e.name).join(', ')}`));
        }
        for (const warn of plan.warnings) {
          preview.appendChild(h('p', { class: 'plan-warn' }, warn));
        }
      };

      input.addEventListener('input', () => { planName = planName || ''; showPreview(); });
      showPreview();

      return h('div', { class: 'form' },
        h('p', { class: 'muted small' },
          'Upload the spreadsheet your plan came in, or type it out. A CSV needs an ' +
          'Exercise column; Phase, Weeks, Workout, Sets, Reps, Rest, RPE and Notes are all used if present.'),
        h('button', {
          class: 'btn btn-secondary btn-block', type: 'button',
          onclick: () => fileInput.click(),
        }, 'Upload a CSV file'),
        fileInput,
        fileLabel,
        input,
        field('Start date', startInput, 'The plan runs forward from here, then repeats.'),
        preview,
        h('button', {
          class: 'btn btn-primary btn-block', type: 'button',
          onclick: () => {
            const plan = parsed();
            if (!plan.weeks.length) { toast('Nothing to import yet', 'error'); return; }
            const result = applyPlan(plan, { startDate: startInput.value || undefined });
            close();
            refresh();
            toast(`Plan added · ${result.createdRoutines.length} sessions`, 'success');
          },
        }, 'Add this plan'),
      );
    },
  });
}
