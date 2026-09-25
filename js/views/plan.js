// Your training plan on a calendar: what you are doing today, and what is
// coming up. Routines are the templates; the plan says which day each falls on.

import { h, clear, toast, openSheet, emptyState, icon } from '../ui.js';
import { list, get, upsert } from '../state.js';
import * as P from '../program.js';
import * as W from '../workout.js';
import { libraryNode, editRoutine } from './routines.js';
import { parsePlan, newExercisesIn, sessionList, looksLikeCSV } from '../planparse.js';
import { openProgramLibrary } from './programs.js';
import { openSetupSheet } from './setup.js';
import { planCsvFromXlsx } from '../xlsx.js';
import { field } from './train.js';

export function destroy() {}

export function render(root, { refresh, navigate }) {
  clear(root);
  const wrap = h('div', { class: 'view' });
  const programs = P.activePrograms();

  wrap.appendChild(h('div', { class: 'hero' },
    h('h1', {}, 'Plan'),
    h('p', { class: 'muted' }, heroLine(programs)),
  ));

  if (!programs.length) {
    wrap.appendChild(emptyState(icon('plan'), 'No plan yet',
      'Pick a program off the shelf, or paste one you already follow.'));
    wrap.appendChild(h('button', {
      class: 'btn btn-primary btn-lg btn-block', type: 'button',
      onclick: () => openProgramLibrary(refresh),
    }, 'Browse programs'));
    wrap.appendChild(h('button', {
      class: 'btn btn-secondary btn-block', type: 'button',
      onclick: () => openPasteSheet(refresh),
    }, 'Paste a plan'));
    wrap.appendChild(h('button', {
      class: 'btn btn-quiet btn-block', type: 'button',
      onclick: () => { createEmptyPlan(); refresh(); },
    }, 'Build one by hand'));
  } else {
    wrap.appendChild(todayCard(programs, refresh, navigate));
    wrap.appendChild(upcomingCard(programs, refresh, navigate));
    wrap.appendChild(plansCard(programs, refresh));
  }

  wrap.appendChild(h('div', { class: 'section-title' }, h('h2', {}, 'Routines')));
  wrap.appendChild(libraryNode({ refresh, navigate }));

  root.appendChild(wrap);
}

function heroLine(programs) {
  if (!programs.length) return 'Schedule your sessions so the app knows what today is.';
  if (programs.length > 1) return `${programs.length} plans running`;
  const [program] = programs;
  const summary = P.programSummary(program);
  return [
    program.name,
    `${summary.weeks} week${summary.weeks === 1 ? '' : 's'}`,
    `${summary.sessions} session${summary.sessions === 1 ? '' : 's'} a cycle`,
  ].filter((part, i) => i !== 0 || part.toLowerCase() !== 'plan').join(' · ');
}

/**
 * Where a plan is up to. A repeating plan reports its place in the cycle —
 * "week 3 of 1" is what counting weeks since the start would say.
 */
function weekLabel(program, slot) {
  const n = program.weeks.length;
  if (program.repeat === false) return `Week ${slot.weekNumber + 1} of ${n}`;
  return n === 1 ? 'Every week' : `Week ${slot.weekIndex + 1} of ${n}, repeating`;
}

/** The weekdays a plan trains on, from its busiest week. */
function trainingDays(program) {
  let best = [];
  for (const week of program.weeks || []) {
    const days = (week.days || []).map((d, i) => (d?.routineId ? i : null)).filter((i) => i !== null);
    if (days.length > best.length) best = days;
  }
  return best;
}

/* ------------------------------------------------------------ today card */

function startScheduled(slot, refresh, navigate) {
  if (W.activeWorkout()) { toast('Finish your current workout first', 'error'); return; }
  upsert('routines', { ...slot.routine, lastUsedAt: Date.now() });
  W.startWorkout({ routineId: slot.routineId });
  navigate('train');
}

function gripIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('fill', 'currentColor');
  svg.innerHTML = '<circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>'
    + '<circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>'
    + '<circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>';
  return svg;
}

/**
 * What today holds across every plan you are following. Accepts one program
 * or a list, so a caller that only knows about one plan still works.
 */
export function todayCard(programs = P.activePrograms(), refresh, navigate) {
  programs = (Array.isArray(programs) ? programs : [programs]).filter(Boolean);
  const multi = programs.length > 1;
  const live = W.activeWorkout();
  const card = h('section', { class: 'card card-today' });
  card.appendChild(h('p', { class: 'today-label' }, 'Today'));

  const sessions = P.todaysSessions(programs);
  if (sessions.length) {
    sessions.forEach((slot, i) => {
      const block = h('div', { class: i ? 'today-block today-block-next' : 'today-block' });
      block.appendChild(h('h3', {}, slot.routine.name));
      const end = P.planEndDate(slot.program);
      block.appendChild(h('p', { class: 'muted small' }, [
        multi ? slot.program.name : null,
        weekLabel(slot.program, slot),
        multi ? null : P.DAY_NAMES[slot.dayIndex],
        end ? `ends ${end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : null,
      ].filter(Boolean).join(' · ')));
      const names = (slot.routine.items || [])
        .map((it) => get('exercises', it.exerciseId)?.name).filter(Boolean);
      block.appendChild(h('p', { class: 'muted small' },
        names.slice(0, 5).join(' · ') + (names.length > 5 ? ` +${names.length - 5}` : '')));
      block.appendChild(h('button', {
        class: `btn ${i ? 'btn-secondary' : 'btn-primary'} btn-block`, type: 'button',
        disabled: !!live,
        // each block has its own heading, so the visible label stays short;
        // the accessible name still says which session it starts
        'aria-label': sessions.length > 1 ? `Start ${slot.routine.name}` : null,
        onclick: () => startScheduled(slot, refresh, navigate),
      }, sessions.length > 1 ? 'Start this session' : 'Start today’s session'));
      card.appendChild(block);
    });
    return card;
  }

  const running = programs.filter((p) => P.planState(p) === 'active');
  const finished = programs.filter((p) => P.planState(p) === 'finished');
  const upcoming = programs.filter((p) => P.planState(p) === 'upcoming');

  // every plan has run out: say so, and offer the obvious next steps
  if (!running.length && !upcoming.length && finished.length) {
    card.appendChild(h('h3', {}, 'Plan complete'));
    for (const program of finished) {
      card.appendChild(h('p', { class: 'muted small' },
        `${multi ? `${program.name}: ` : ''}${program.weeks.length} weeks done. `
        + 'Start the next block, or run this one again.'));
      card.appendChild(h('div', { class: 'btn-row' },
        h('button', {
          class: 'btn btn-primary', type: 'button',
          onclick: () => {
            upsert('programs', { ...program, startDate: P.toISODate(P.mondayOf(new Date())) });
            refresh();
            toast('Plan restarted from this week', 'success');
          },
        }, multi ? `Run ${program.name} again` : 'Run it again'),
        h('button', {
          class: 'btn btn-quiet', type: 'button',
          onclick: () => openProgramLibrary(refresh),
        }, 'Choose the next plan'),
      ));
    }
    return card;
  }

  if (!running.length && upcoming.length) {
    const first = upcoming[0];
    card.appendChild(h('h3', {}, 'Not started yet'));
    card.appendChild(h('p', { class: 'muted small' },
      `${multi ? `${first.name} starts` : 'Starts'} `
      + `${P.startOfDay(first.startDate).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}.`));
    return card;
  }

  card.appendChild(h('h3', {}, 'Rest day'));
  const next = P.nextSessionAcross(P.addDays(new Date(), 1), programs);
  if (next) {
    card.appendChild(h('p', { class: 'muted small' },
      `Next: ${next.routine.name} on ${next.date.toLocaleDateString(undefined, { weekday: 'long' })}`
      + `${multi ? ` (${next.program.name})` : ''}.`));
  }
  return card;
}

/* -------------------------------------------------------- assign sheet */

/**
 * Put a session on a date, or clear it back to rest. With several plans the
 * sheet asks which plan the change belongs to, since a day can hold one
 * session from each.
 */
function openAssignSheet(date, programs, refresh, programId = null) {
  const routines = list('routines').sort((a, b) => a.name.localeCompare(b.name));
  const day = P.weekdayIndex(date);
  let target = programs.find((p) => p.id === programId) || programs[0];

  openSheet({
    title: `${P.DAY_NAMES[day]}, ${P.startOfDay(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`,
    fullHeight: true,
    render: (close) => {
      const body = h('div', { class: 'form' });
      const chips = h('div', { class: 'chips' });
      const listEl = h('div', { class: 'picker-list' });

      const draw = () => {
        clear(chips);
        for (const program of programs) {
          chips.appendChild(h('button', {
            class: `chip${program.id === target.id ? ' chip-on' : ''}`, type: 'button',
            'aria-pressed': program.id === target.id ? 'true' : 'false',
            onclick: () => { target = program; draw(); },
          }, program.name));
        }

        clear(listEl);
        const slot = P.scheduledFor(date, target);
        if (!slot) {
          listEl.appendChild(h('p', { class: 'muted pad' }, `This day is outside ${target.name}’s dates.`));
          return;
        }
        const selected = slot.routineId;
        const assign = (routineId) => {
          P.setSlot(get('programs', target.id), slot.weekIndex, slot.dayIndex, routineId);
          refresh();
          close();
        };

        for (const routine of routines) {
          const on = routine.id === selected;
          listEl.appendChild(h('button', {
            class: `picker-item${on ? ' is-selected' : ''}`, type: 'button',
            onclick: () => assign(routine.id),
          },
            h('span', { class: 'picker-name' }, routine.name),
            on ? h('span', { class: 'picker-meta' }, '✓') : null,
          ));
        }
        listEl.appendChild(h('button', {
          class: `picker-item${selected ? '' : ' is-selected'}`, type: 'button',
          onclick: () => assign(null),
        },
          h('span', { class: 'picker-name' }, selected ? 'Make this a rest day' : 'Rest day'),
          selected ? null : h('span', { class: 'picker-meta' }, '✓'),
        ));
      };

      if (programs.length > 1) {
        body.appendChild(h('p', { class: 'field-label' }, 'Which plan'));
        body.appendChild(chips);
      }
      body.appendChild(listEl);
      draw();
      return body;
    },
  });
}

/* --------------------------------------------------------------- upcoming */

function upcomingCard(programs, refresh, navigate) {
  const card = h('section', { class: 'card' });
  const live = W.activeWorkout();
  const multi = programs.length > 1;

  // Start from this Monday, not today, so a session you missed earlier in the
  // week is still on screen and can still be done.
  const weekStart = P.mondayOf(new Date());
  const earliest = programs.map((p) => P.startOfDay(p.startDate)).sort((a, b) => a - b)[0];
  const from = earliest > weekStart ? earliest : weekStart;

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
  let lastShown = null;

  for (let i = 0; i < 21; i++) {
    const date = P.addDays(from, i);
    const slots = P.scheduledAcross(date, programs);
    if (!slots.length) continue;   // no plan covers this date
    lastShown = date;
    const sessions = slots.filter((s) => !s.rest);
    const iso = P.toISODate(date);
    const isToday = iso === todayISO;
    const isPast = date < today;
    const sameWeek = date >= weekStart && date <= P.addDays(weekStart, 6);

    const rowFor = (slot) => {
      const done = !!(slot && sameWeek && doneThisWeek.has(slot.routineId));
      const classes = ['sched-row'];
      if (slot) classes.push('sched-draggable');
      if (isToday) classes.push('is-today');
      if (!slot) classes.push('is-rest');
      if (isPast && !isToday) classes.push('is-past');
      if (done) classes.push('is-done');

      // the end of a name is often what tells sessions apart ("Upper A — Build"
      // vs "— Heavy"), so names wrap to two lines rather than being cut off
      const title = h('span', { class: 'sched-title' }, slot ? slot.routine.name : 'Rest');
      if (done) title.appendChild(h('span', { class: 'sched-done-tag' }, 'done'));
      const name = h('span', { class: 'sched-name' }, title);
      if (slot && multi) name.appendChild(h('span', { class: 'sched-plan' }, slot.program.name));

      const row = h('div', {
        class: classes.join(' '),
        'aria-grabbed': slot ? 'false' : null,
        title: slot ? 'Drag the grip to move' : 'Tap to assign a session',
        dataset: slot
          ? { iso, programId: slot.program.id, weekIndex: slot.weekIndex, dayIndex: slot.dayIndex }
          : { iso },
      },
        h('span', { class: 'sched-day' }, P.DAY_SHORT[P.weekdayIndex(date)]),
        h('span', { class: 'sched-date' }, date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })),
        name,
        slot
          ? h('button', {
            class: `btn btn-sm ${isToday && !live ? 'btn-primary' : 'btn-quiet'} sched-start`,
            type: 'button',
            disabled: !!live,
            title: live ? 'Finish your current workout first' : '',
            'aria-label': live
              ? `${slot.routine.name} — finish your current workout first`
              : `Start ${slot.routine.name} scheduled for ${date.toDateString()}`,
            onclick: (e) => { e.stopPropagation(); startScheduled(slot, refresh, navigate); },
          }, done ? 'Again' : 'Start')
          : h('span', { class: 'sched-tick' }, ''),
      );

      row.addEventListener('click', (e) => {
        if (e.target.closest('.sched-start, .sched-grip')) return;
        openAssignSheet(date, programs, refresh, slot?.program.id);
      });

      // Dragging starts from a grip, not the row. A long-press on the row would
      // need touch-action:none to work, which would stop the list scrolling at
      // all — much worse than having no drag.
      if (slot) {
        const grip = h('button', {
          class: 'sched-grip', type: 'button',
          'aria-label': `Move ${slot.routine.name} to another day`,
          title: 'Drag to move to another day',
          onclick: (e) => e.stopPropagation(),
        }, gripIcon());
        grip.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return;
          e.stopPropagation();
          e.preventDefault();
          startDrag(e, grip, row, slot);
        });
        row.appendChild(grip);
      }
      return row;
    };

    if (sessions.length) sessions.forEach((slot) => listEl.appendChild(rowFor(slot)));
    else listEl.appendChild(rowFor(null));
  }

  // Drag-to-move. A session moves within its own plan's cycle week, so a
  // target is valid when that plan puts the same cycle week on the target
  // date — whichever plan's row happens to be under the pointer.
  let activeDrag = null;

  function targetFor(candidate, sourceSlot) {
    if (!candidate || candidate === activeDrag?.sourceRow) return null;
    const there = P.slotFor(sourceSlot.program, candidate.dataset.iso);
    return there && there.weekIndex === sourceSlot.weekIndex && there.dayIndex !== sourceSlot.dayIndex
      ? there
      : null;
  }

  function startDrag(downEvent, grip, sourceRow, sourceSlot) {
    if (activeDrag) return;
    grip.setPointerCapture(downEvent.pointerId);
    sourceRow.classList.add('is-dragging');
    sourceRow.setAttribute('aria-grabbed', 'true');

    activeDrag = {
      grip, pointerId: downEvent.pointerId, sourceRow, sourceSlot,
      startY: downEvent.clientY, dropTarget: null, dropSlot: null, onMove: null, onEnd: null,
    };

    const onMove = (e) => {
      if (!activeDrag) return;
      e.preventDefault();
      sourceRow.style.transform = `translateY(${e.clientY - activeDrag.startY}px)`;
      // the dragged row carries pointer-events:none, so this sees through it
      const candidate = document.elementFromPoint(e.clientX, e.clientY)?.closest('.sched-row');
      const there = targetFor(candidate, sourceSlot);
      const valid = there ? candidate : null;
      if (valid !== activeDrag.dropTarget) {
        activeDrag.dropTarget?.classList.remove('is-drop-target');
        valid?.classList.add('is-drop-target');
        activeDrag.dropTarget = valid;
        activeDrag.dropSlot = there;
      }
    };

    const onEnd = () => {
      if (!activeDrag) return;
      const there = activeDrag.dropSlot;
      const slot = activeDrag.sourceSlot;
      cleanupDrag();
      if (!there) return;
      P.moveSlot(get('programs', slot.program.id), slot.weekIndex, slot.dayIndex, there.dayIndex);
      refresh();
    };

    activeDrag.onMove = onMove;
    activeDrag.onEnd = onEnd;
    grip.addEventListener('pointermove', onMove);
    grip.addEventListener('pointerup', onEnd);
    grip.addEventListener('pointercancel', cleanupDrag);
  }

  function cleanupDrag() {
    if (!activeDrag) return;
    const { grip, sourceRow, onMove, onEnd, pointerId } = activeDrag;
    grip.removeEventListener('pointermove', onMove);
    grip.removeEventListener('pointerup', onEnd);
    grip.removeEventListener('pointercancel', cleanupDrag);
    try { grip.releasePointerCapture(pointerId); } catch { /* already released */ }
    sourceRow.classList.remove('is-dragging');
    sourceRow.setAttribute('aria-grabbed', 'false');
    sourceRow.style.transform = '';
    activeDrag.dropTarget?.classList.remove('is-drop-target');
    activeDrag = null;
  }

  card.appendChild(listEl);

  for (const program of programs) {
    const end = P.planEndDate(program);
    if (end && lastShown && lastShown >= end) {
      card.appendChild(h('p', { class: 'muted small pad-top' },
        `${multi ? program.name : 'Plan'} ends `
        + `${end.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}.`));
    }
  }

  card.appendChild(h('p', { class: 'muted small pad-top' },
    'A session is logged on the day you actually do it, whichever day it was planned for.'));

  return card;
}

/* -------------------------------------------------------------- your plans */

/** One line per plan you are following, each with its own way off the calendar. */
function plansCard(programs, refresh) {
  const card = h('section', { class: 'card' });
  card.appendChild(h('div', { class: 'card-head' },
    h('h3', {}, programs.length === 1 ? 'Your plan' : 'Your plans')));

  for (const program of programs) {
    const state = P.planState(program);
    const slot = P.slotFor(program, new Date());
    const end = P.planEndDate(program);
    const status = state === 'finished' ? 'Complete'
      : state === 'upcoming'
        ? `Starts ${P.startOfDay(program.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`
        : slot ? weekLabel(program, slot) : '';

    card.appendChild(h('div', { class: 'plan-row' },
      h('div', { class: 'plan-row-text' },
        h('p', { class: 'plan-row-name' }, program.name),
        h('p', { class: 'muted small' }, [
          status,
          trainingDays(program).map((d) => P.DAY_SHORT[d]).join(' · '),
          end && state !== 'finished' ? `ends ${end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : null,
        ].filter(Boolean).join(' · ')),
      ),
      h('div', { class: 'plan-row-actions' },
        h('button', {
          class: 'btn btn-sm btn-quiet', type: 'button',
          'aria-label': `Edit ${program.name}`,
          onclick: () => openPlanEditor(program, refresh),
        }, 'Edit'),
        h('button', {
          class: 'btn btn-sm btn-quiet plan-remove', type: 'button',
          'aria-label': `Remove ${program.name}`,
          onclick: () => openRemoveSheet(program, refresh),
        }, 'Remove'),
      ),
    ));
  }

  card.appendChild(h('div', { class: 'btn-row pad-top' },
    h('button', {
      class: 'btn btn-secondary', type: 'button',
      onclick: () => openProgramLibrary(refresh),
    }, 'Add another plan'),
    h('button', {
      class: 'btn btn-quiet', type: 'button',
      onclick: () => openPasteSheet(refresh),
    }, 'Paste a plan'),
  ));
  return card;
}

/** Taking a plan off the calendar. History always stays; its routines are your call. */
function openRemoveSheet(program, refresh) {
  const orphans = P.routinesOnlyIn(program);
  const n = orphans.length;
  const done = (removeRoutines) => {
    const { removedRoutines } = P.removeProgram(program.id, { removeRoutines });
    toast(removedRoutines
      ? `${program.name} removed, with ${removedRoutines} routine${removedRoutines === 1 ? '' : 's'}`
      : `${program.name} removed from your calendar`);
    refresh();
  };

  openSheet({
    title: `Remove ${program.name}?`,
    render: (close) => h('div', { class: 'confirm' },
      h('p', {}, 'It comes off your calendar. Workouts you have already logged are kept — '
        + 'they are your history, not the plan’s.'),
      n ? h('p', { class: 'muted small' },
        `It also created ${n} routine${n === 1 ? '' : 's'} that no other plan uses. `
        + 'Remove them too, or keep them to start by hand.') : null,
      h('div', { class: 'confirm-stack' },
        h('button', {
          class: 'btn btn-danger btn-block', type: 'button',
          onclick: () => { close(); done(true); },
        }, n ? `Remove plan and its ${n} routine${n === 1 ? '' : 's'}` : 'Remove plan'),
        n ? h('button', {
          class: 'btn btn-secondary btn-block', type: 'button',
          onclick: () => { close(); done(false); },
        }, 'Remove plan, keep routines') : null,
        h('button', { class: 'btn btn-ghost btn-block', type: 'button', onclick: close }, 'Cancel'),
      ),
    ),
  });
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

        // one way to remove a plan, wherever you start from
        body.appendChild(h('button', {
          class: 'btn btn-quiet btn-block', type: 'button',
          onclick: () => { close(); openRemoveSheet(get('programs', program.id) || program, refresh); },
        }, 'Remove this plan'));
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
      const preview = h('div', { class: 'plan-preview' });
      const fileLabel = h('p', { class: 'muted small' });

      const fileInput = h('input', {
        type: 'file',
        accept: '.xlsx,.csv,.txt,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        style: { display: 'none' },
        onchange: async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';   // choosing the same file again still fires
          if (!file) return;
          const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
          if (ext === 'numbers') {
            toast('Numbers files cannot be read directly. In Numbers: File, Export To, Excel.', 'error');
            return;
          }
          try {
            if (ext === 'xlsx') {
              const { csv, sheet } = await planCsvFromXlsx(await file.arrayBuffer());
              input.value = csv;
              fileLabel.textContent = `Loaded ${file.name} · sheet “${sheet}”`;
            } else {
              input.value = await file.text();
              fileLabel.textContent = `Loaded ${file.name}`;
            }
            planName = titleFromFile(file.name);
            showPreview();
          } catch (err) {
            toast(err?.message || 'Could not read that file', 'error');
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
          'Upload a spreadsheet (.xlsx or .csv) or type the plan out. It needs an Exercise column; '
          + 'Phase, Weeks, Weekday, Workout, Sets, Reps, Rest, RPE and Notes are all used if present.'),
        h('button', {
          class: 'btn btn-secondary btn-block', type: 'button',
          onclick: () => fileInput.click(),
        }, 'Upload a spreadsheet'),
        h('a', {
          class: 'btn btn-quiet btn-block template-link',
          href: './templates/plan-template.xlsx',
          download: 'plan-template.xlsx',
        }, 'Download the template to fill in'),
        fileInput,
        fileLabel,
        input,
        preview,
        h('button', {
          class: 'btn btn-primary btn-block', type: 'button',
          onclick: () => {
            const plan = parsed();
            if (!plan.weeks.length) { toast('Nothing to import yet', 'error'); return; }
            // same questionnaire as a built-in program: nothing lands on the
            // calendar until you have said which days you can train
            openSetupSheet({
              plan,
              name: plan.name,
              onDone: () => { close(); refresh(); },
            });
          },
        }, 'Add this plan'),
      );
    },
  });
}
