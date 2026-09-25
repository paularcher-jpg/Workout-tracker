// A program is a plan laid out on a calendar: which routine falls on which day.
//
// It is stored as an ordered list of weeks (Monday first). Once the last week
// is reached the cycle repeats, so a one-week plan simply repeats every week,
// while a multi-week block cycles and can carry week-to-week progression.

import { list, get, upsert, uid, softDelete } from './state.js';

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MS_DAY = 86400000;

/* ------------------------------------------------------------------ dates */

/** Local midnight for a Date or a YYYY-MM-DD string. */
export function startOfDay(value = new Date()) {
  if (typeof value === 'string') {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toISODate(value = new Date()) {
  const d = startOfDay(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(date) {
  return (startOfDay(date).getDay() + 6) % 7;
}

export function mondayOf(date) {
  const d = startOfDay(date);
  return addDays(d, -weekdayIndex(d));
}

function daysBetween(a, b) {
  // rounding absorbs the hour a DST change adds or removes
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_DAY);
}

/**
 * Add whole days using calendar arithmetic.
 *
 * Never do this by adding n × 86400000 ms: across a daylight-saving change a
 * day is 23 or 25 hours long, so millisecond arithmetic drifts and lands on
 * the wrong date. Letting the Date constructor normalise the day-of-month
 * keeps the local wall-clock day correct.
 */
export function addDays(date, n) {
  const d = startOfDay(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/* --------------------------------------------------------------- programs */

export function emptyWeek() {
  return { days: Array.from({ length: 7 }, () => null) };
}

export function newProgram(name = 'My plan', weeks = 1) {
  return {
    id: uid(),
    name,
    startDate: toISODate(mondayOf(new Date())),
    weeks: Array.from({ length: Math.max(1, weeks) }, emptyWeek),
    // a single repeating week is the common case; a multi-week block is
    // usually finite, so it stops rather than silently starting again
    repeat: Math.max(1, weeks) === 1,
    active: true,
  };
}

/**
 * Where a date sits relative to the plan.
 * @returns {'none'|'upcoming'|'active'|'finished'}
 */
export function planState(program = activeProgram(), date = new Date()) {
  if (!program || !program.weeks?.length) return 'none';
  const day = startOfDay(date);
  if (day < startOfDay(program.startDate)) return 'upcoming';
  const weekNumber = Math.floor(daysBetween(mondayOf(program.startDate), day) / 7);
  // `repeat` is absent on plans saved before it existed: those keep looping,
  // so an upgrade can never silently strip days off someone's schedule
  if (program.repeat === false && weekNumber >= program.weeks.length) return 'finished';
  return 'active';
}

/** The date a non-repeating plan runs out, or null if it repeats. */
export function planEndDate(program = activeProgram()) {
  if (!program?.weeks?.length || program.repeat !== false) return null;
  return addDays(mondayOf(program.startDate), program.weeks.length * 7 - 1);
}

export function allPrograms() {
  return list('programs');
}

/**
 * Every plan you are currently following. Several can run at once — a
 * strength block alongside a muscular endurance block is a normal week for an
 * endurance athlete — so the calendar is the union of all of them.
 */
export function activePrograms() {
  return allPrograms()
    .filter((p) => p.active)
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate))
      || String(a.name).localeCompare(String(b.name)));
}

/** The first active plan. Kept for callers that only ever show one. */
export function activeProgram() {
  return activePrograms()[0] || null;
}

/** Add a plan to the calendar without taking any other plan off it. */
export function activateProgram(id) {
  const program = get('programs', id);
  if (program && !program.active) upsert('programs', { ...program, active: true });
}

/** @deprecated a plan no longer replaces the others; use activateProgram. */
export const setActiveProgram = activateProgram;

/** Routine ids a program schedules anywhere in its cycle. */
export function routinesOf(program) {
  const ids = new Set();
  for (const week of program?.weeks || []) {
    for (const slot of week.days || []) if (slot?.routineId) ids.add(slot.routineId);
  }
  return ids;
}

/**
 * The routines that would go with a plan if it were removed: the ones it
 * schedules that no other plan still uses. A routine you have borrowed into a
 * second plan stays, or removing one plan would punch holes in the other.
 */
export function routinesOnlyIn(program) {
  const mine = routinesOf(program);
  for (const other of allPrograms()) {
    if (other.id === program.id) continue;
    for (const id of routinesOf(other)) mine.delete(id);
  }
  return [...mine].filter((id) => get('routines', id));
}

/**
 * Take a plan off the calendar. Logged workouts are never touched — they are
 * a record of what you did, not of what a plan said — and the plan's own
 * routines go only if asked.
 */
export function removeProgram(id, { removeRoutines = false } = {}) {
  const program = get('programs', id);
  if (!program) return { removedRoutines: 0 };
  const orphans = removeRoutines ? routinesOnlyIn(program) : [];
  for (const rid of orphans) softDelete('routines', rid);
  softDelete('programs', id);
  return { removedRoutines: orphans.length };
}

/** Everything scheduled on a date across every active plan. */
export function scheduledAcross(date, programs = activePrograms()) {
  return programs.map((program) => scheduledFor(date, program)).filter(Boolean);
}

/** Today's sessions across every active plan, rest days excluded. */
export function todaysSessions(programs = activePrograms()) {
  return scheduledAcross(new Date(), programs).filter((s) => !s.rest);
}

/** Weekdays (0 = Monday) each active plan trains on, for spotting clashes. */
export function daysInUse(programs = activePrograms(), exceptId = null) {
  const used = new Map();   // dayIndex -> [program names]
  for (const program of programs) {
    if (program.id === exceptId) continue;
    const days = new Set();
    for (const week of program.weeks || []) {
      (week.days || []).forEach((slot, day) => { if (slot?.routineId) days.add(day); });
    }
    for (const day of days) {
      if (!used.has(day)) used.set(day, []);
      used.get(day).push(program.name);
    }
  }
  return used;
}

/* -------------------------------------------------------------- schedule */

/**
 * Where a date falls in a program. Pure date maths — no store access, so the
 * rules here are unit-testable on their own.
 * @returns {null | {date, weekNumber, weekIndex, dayIndex, routineId}}
 */
export function slotFor(program, date) {
  if (!program || !program.weeks?.length) return null;

  const day = startOfDay(date);
  if (day < startOfDay(program.startDate)) return null;
  if (planState(program, day) === 'finished') return null;

  // Weeks run Monday to Sunday, counted from the Monday of the start week, so
  // a plan starting mid-week still lines up with the calendar.
  const offset = daysBetween(mondayOf(program.startDate), day);
  if (offset < 0) return null;

  const weekNumber = Math.floor(offset / 7);
  const weekIndex = weekNumber % program.weeks.length;
  const dayIndex = offset % 7;

  return {
    date: day,
    weekNumber,   // whole weeks since the plan started
    weekIndex,    // which week of the repeating cycle
    dayIndex,     // 0 = Monday
    routineId: program.weeks[weekIndex]?.days?.[dayIndex]?.routineId || null,
  };
}

/**
 * What is scheduled on a given date, with the routine resolved.
 * @returns {null | {date, program, weekNumber, weekIndex, dayIndex, routine, routineId, rest}}
 */
export function scheduledFor(date, program = activeProgram()) {
  const slot = slotFor(program, date);
  if (!slot) return null;
  const routine = slot.routineId ? get('routines', slot.routineId) : null;
  return {
    ...slot,
    program,
    routineId: routine ? slot.routineId : null,
    routine,
    rest: !routine,
  };
}

export function todaysSession(program = activeProgram()) {
  return scheduledFor(new Date(), program);
}

/**
 * The plan laid out forward from a date.
 * @returns {Array} one entry per day, always including rest days.
 */
export function projection(days = 28, from = new Date(), program = activeProgram()) {
  if (!program) return [];
  const out = [];
  const start = startOfDay(from);
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    const slot = scheduledFor(date, program);
    if (!slot) continue;
    out.push(slot);
  }
  return out;
}

/** Next scheduled training day at or after `from`, skipping rest days. */
export function nextTrainingDay(from = new Date(), program = activeProgram()) {
  return projection(60, from, program).find((s) => !s.rest) || null;
}

/** The soonest session after today in any active plan. */
export function nextSessionAcross(from = addDays(new Date(), 1), programs = activePrograms()) {
  let best = null;
  for (const program of programs) {
    const next = nextTrainingDay(from, program);
    if (next && (!best || next.date < best.date)) best = next;
  }
  return best;
}

/** How many training days the plan has per cycle, for display. */
export function programSummary(program) {
  if (!program?.weeks?.length) return { weeks: 0, sessions: 0 };
  let sessions = 0;
  for (const week of program.weeks) {
    for (const slot of week.days || []) if (slot?.routineId) sessions += 1;
  }
  return { weeks: program.weeks.length, sessions };
}

/** Assign a routine (or null for a rest day) to one slot. */
export function setSlot(program, weekIndex, dayIndex, routineId) {
  const weeks = program.weeks.map((w, i) => {
    if (i !== weekIndex) return { days: [...w.days] };
    const days = [...w.days];
    days[dayIndex] = routineId ? { routineId } : null;
    return { days };
  });
  return upsert('programs', { ...program, weeks });
}

/** Move a slot from one day to another within the same cycle week. Swaps if destination is occupied. */
export function moveSlot(program, weekIndex, fromDay, toDay) {
  if (fromDay === toDay || fromDay < 0 || fromDay > 6 || toDay < 0 || toDay > 6) {
    return program;
  }

  const weeks = program.weeks.map((w, i) => {
    if (i !== weekIndex) return { days: [...w.days] };
    const days = [...w.days];
    const temp = days[fromDay];
    days[fromDay] = days[toDay];
    days[toDay] = temp;
    return { days };
  });
  return upsert('programs', { ...program, weeks });
}
