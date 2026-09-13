// Parses a written training plan into routines and a calendar.
//
// The format is deliberately forgiving, because plans arrive as whatever the
// coach or spreadsheet produced. It understands things like:
//
//   Week 1
//   Monday - Push A
//     Barbell Bench Press 4x8 rest 180
//     Incline Dumbbell Press 3x8-12
//     Lateral Raise 3x15 @60s
//   Tuesday - Rest
//   Wednesday: Pull A
//     Deadlift 3x5
//
// "Week n" is optional (a plan with no week headings is a single repeating
// week). Days may be weekday names or "Day 1"/"Day 2" for rotating plans.

import { list, getState, upsert, uid, addCustomExercise } from './state.js';
import { slugify } from './exercises.js';
import { newProgram, setActiveProgram, toISODate, mondayOf } from './program.js';

const DAY_PATTERNS = [
  [/^(mon|monday)$/i, 0],
  [/^(tue|tues|tuesday)$/i, 1],
  [/^(wed|weds|wednesday)$/i, 2],
  [/^(thu|thur|thurs|thursday)$/i, 3],
  [/^(fri|friday)$/i, 4],
  [/^(sat|saturday)$/i, 5],
  [/^(sun|sunday)$/i, 6],
];

const REST_WORDS = /^(rest|off|rest day|recovery|none|-)$/i;

function matchDay(token) {
  const clean = token.trim();
  for (const [re, index] of DAY_PATTERNS) if (re.test(clean)) return index;
  const dayN = clean.match(/^day\s*(\d+)$/i);
  if (dayN) {
    const n = Number(dayN[1]);
    if (n >= 1 && n <= 7) return n - 1;
  }
  return null;
}

/**
 * A header line: "Monday - Push A", "Wed: Pull", "Day 1 — Lower".
 * Returns {dayIndex, sessionName} or null.
 */
function parseDayHeader(line) {
  const m = line.match(/^\s*([A-Za-z]+\s*\d*)\s*[-–—:|]\s*(.+?)\s*$/);
  if (m) {
    const dayIndex = matchDay(m[1]);
    if (dayIndex !== null) return { dayIndex, sessionName: m[2].trim() };
    return null;
  }
  // bare day name on its own line
  const bare = matchDay(line.trim());
  if (bare !== null) return { dayIndex: bare, sessionName: '' };
  return null;
}

/**
 * An exercise line: "Bench Press 4x8", "Squat 3 x 5 rest 180",
 * "Lateral Raise 3x12-15 @90s", "Plank 3x30s".
 */
function parseExercise(line) {
  const text = line.replace(/^[\s\-*••\d.)]+/, '').trim();
  if (!text) return null;

  const m = text.match(
    /^(.+?)\s*[:–—-]?\s*(\d+)\s*[x×*]\s*(\d+(?:\s*[-–]\s*\d+)?)\s*(?:reps?)?\s*(.*)$/i,
  );
  if (!m) return null;

  const name = m[1].replace(/[\s:,-]+$/, '').trim();
  if (!name || name.length < 2) return null;

  const sets = Math.min(20, Math.max(1, Number(m[2]) || 1));
  const reps = m[3].replace(/\s+/g, '');
  const tail = m[4] || '';

  // rest: "rest 180", "@90s", "120s", "2min"
  let restSec = null;
  const restMatch = tail.match(/(?:rest\s*|@)?(\d+(?:\.\d+)?)\s*(s|sec|secs|seconds|m|min|mins|minutes)?\b/i);
  if (restMatch) {
    const value = Number(restMatch[1]);
    const unit = (restMatch[2] || 's').toLowerCase();
    restSec = unit.startsWith('m') ? Math.round(value * 60) : Math.round(value);
    if (restSec > 1800 || restSec <= 0) restSec = null;
  }

  const notes = tail
    .replace(/(?:rest\s*|@)?\d+(?:\.\d+)?\s*(?:s|sec|secs|seconds|m|min|mins|minutes)?\b/i, '')
    .replace(/^[\s,;–—-]+|[\s,;–—-]+$/g, '')
    .trim();

  return { name, sets, reps, restSec, notes };
}

/** Match a written exercise name against the library, or flag it as new. */
export function resolveExerciseName(name) {
  const library = list('exercises');
  const slug = slugify(name);
  const exact = library.find((ex) => ex.id === slug || ex.name.toLowerCase() === name.toLowerCase());
  if (exact) return { exercise: exact, isNew: false };

  const needle = name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const loose = library.find((ex) => {
    const hay = ex.name.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    return hay === needle || hay.includes(needle) || needle.includes(hay);
  });
  if (loose) return { exercise: loose, isNew: false };

  return { exercise: null, isNew: true };
}

/**
 * Parse plan text.
 * @returns {{name, weeks, warnings, totalExercises}}
 */
export function parsePlan(text, { name = 'My plan' } = {}) {
  const lines = String(text || '').split(/\r?\n/);
  const warnings = [];
  const weeks = [];

  let currentWeek = null;
  let currentDay = null;
  let planName = name;
  let totalExercises = 0;

  const ensureWeek = () => {
    if (!currentWeek) {
      currentWeek = { days: Array.from({ length: 7 }, () => null) };
      weeks.push(currentWeek);
    }
    return currentWeek;
  };

  for (const [i, raw] of lines.entries()) {
    const line = raw.trim();
    if (!line) continue;

    // "Plan: name" / "Program: name"
    const titleMatch = line.match(/^(?:plan|program|programme|block)\s*[:–—-]\s*(.+)$/i);
    if (titleMatch) {
      planName = titleMatch[1].trim();
      continue;
    }

    // "Week 2" (with optional trailing title)
    const weekMatch = line.match(/^week\s*(\d+)\b\s*[:–—-]?\s*(.*)$/i);
    if (weekMatch) {
      currentWeek = { days: Array.from({ length: 7 }, () => null) };
      weeks.push(currentWeek);
      currentDay = null;
      continue;
    }

    const header = parseDayHeader(line);
    if (header) {
      const week = ensureWeek();
      if (REST_WORDS.test(header.sessionName)) {
        week.days[header.dayIndex] = null;
        currentDay = null;
        continue;
      }
      currentDay = {
        dayIndex: header.dayIndex,
        sessionName: header.sessionName || `Day ${header.dayIndex + 1}`,
        exercises: [],
      };
      week.days[header.dayIndex] = currentDay;
      continue;
    }

    const exercise = parseExercise(line);
    if (exercise) {
      if (!currentDay) {
        // exercises before any day heading: assume a single unnamed session
        const week = ensureWeek();
        currentDay = { dayIndex: 0, sessionName: 'Session', exercises: [] };
        week.days[0] = currentDay;
      }
      currentDay.exercises.push(exercise);
      totalExercises += 1;
      continue;
    }

    warnings.push(`Line ${i + 1}: could not read "${line.slice(0, 60)}"`);
  }

  // drop days that ended up with no exercises
  for (const week of weeks) {
    week.days = week.days.map((d) => (d && d.exercises.length ? d : null));
  }

  return {
    name: planName,
    weeks: weeks.filter((w) => w.days.some(Boolean)),
    warnings,
    totalExercises,
  };
}

/** Everything the plan refers to that is not already in the exercise library. */
export function newExercisesIn(parsed) {
  const seen = new Map();
  for (const week of parsed.weeks) {
    for (const day of week.days) {
      if (!day) continue;
      for (const ex of day.exercises) {
        const { isNew } = resolveExerciseName(ex.name);
        if (isNew && !seen.has(ex.name.toLowerCase())) seen.set(ex.name.toLowerCase(), ex);
      }
    }
  }
  return [...seen.values()];
}

export function defaultRest() {
  return getState().settings.defaultRestSec;
}

/* ------------------------------------------------------------------ apply */

/**
 * Turn a parsed plan into real routines, exercises and a scheduled program.
 * Existing data is untouched — this only adds.
 */
export function applyPlan(parsed, { startDate } = {}) {
  const multiWeek = parsed.weeks.length > 1;
  const createdExercises = [];
  const createdRoutines = [];

  // 1. make sure every exercise the plan names exists
  const idFor = new Map();
  for (const week of parsed.weeks) {
    for (const day of week.days) {
      if (!day) continue;
      for (const ex of day.exercises) {
        const key = ex.name.toLowerCase();
        if (idFor.has(key)) continue;
        const { exercise, isNew } = resolveExerciseName(ex.name);
        if (isNew) {
          const made = addCustomExercise({
            name: ex.name,
            group: 'Other',
            equipment: 'Other',
            restSec: ex.restSec ?? defaultRest(),
          });
          createdExercises.push(made);
          idFor.set(key, made.id);
        } else {
          idFor.set(key, exercise.id);
        }
      }
    }
  }

  // 2. one routine per (week, day)
  const program = newProgram(parsed.name, parsed.weeks.length);
  program.startDate = startDate || toISODate(mondayOf(new Date()));

  parsed.weeks.forEach((week, weekIndex) => {
    week.days.forEach((day, dayIndex) => {
      if (!day) return;
      const name = multiWeek ? `W${weekIndex + 1} · ${day.sessionName}` : day.sessionName;
      const routine = upsert('routines', {
        id: uid(),
        name,
        items: day.exercises.map((ex) => ({
          exerciseId: idFor.get(ex.name.toLowerCase()),
          sets: ex.sets,
          reps: ex.reps,           // may be a range such as "8-12"
          restSec: ex.restSec ?? defaultRest(),
          notes: ex.notes || '',
        })),
        lastUsedAt: 0,
      });
      createdRoutines.push(routine);
      program.weeks[weekIndex].days[dayIndex] = { routineId: routine.id };
    });
  });

  const saved = upsert('programs', program);
  setActiveProgram(saved.id);

  return { program: saved, createdRoutines, createdExercises };
}
