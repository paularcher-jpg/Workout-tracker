// A program is a plan laid out on a calendar: which routine falls on which day.
//
// It is stored as an ordered list of weeks (Monday first). Once the last week
// is reached the cycle repeats, so a one-week plan simply repeats every week,
// while a multi-week block cycles and can carry week-to-week progression.

import { list, get, upsert, uid } from './state.js';

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
  return new Date(d.getTime() - weekdayIndex(d) * MS_DAY);
}

function daysBetween(a, b) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_DAY);
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
    active: true,
  };
}

export function allPrograms() {
  return list('programs');
}

export function activeProgram() {
  const programs = allPrograms();
  return programs.find((p) => p.active) || null;
}

/** Make one program the active one; there is only ever a single active plan. */
export function setActiveProgram(id) {
  for (const p of allPrograms()) {
    const shouldBeActive = p.id === id;
    if (!!p.active !== shouldBeActive) upsert('programs', { ...p, active: shouldBeActive });
  }
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
    const date = new Date(start.getTime() + i * MS_DAY);
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
