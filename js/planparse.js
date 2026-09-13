// Reads a written training plan — CSV or plain text — into sessions and a
// calendar of weeks.
//
// Both parsers produce the same shape:
//   { name, sessions: {key: {key, name, exercises[]}}, weeks: [{days: [key|null × 7]}] }
// so a session used by several weeks becomes one routine, not a copy per week.

import { list, getState, upsert, uid, addCustomExercise } from './state.js';
import { slugify } from './exercises.js';
import { newProgram, setActiveProgram, toISODate, mondayOf } from './program.js';
export { describeReps } from './workout.js';

/* ------------------------------------------------------------ exercise ids */

/** Compare names ignoring case, spacing and punctuation. */
function normaliseName(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Match a written exercise name against the library.
 *
 * Deliberately strict: only an exact match once punctuation and spacing are
 * stripped. Fuzzy matching would happily fold "Side Plank" into "Plank" and
 * quietly merge two exercises' progress history, which is far worse than
 * carrying a near-duplicate in the library.
 */
export function resolveExerciseName(name) {
  const library = list('exercises');
  const slug = slugify(name);
  const target = normaliseName(name);
  const found = library.find((ex) => ex.id === slug || normaliseName(ex.name) === target);
  return found ? { exercise: found, isNew: false } : { exercise: null, isNew: true };
}

/* ------------------------------------------------------------- rep parsing */

/* ---------------------------------------------------------------- helpers */

export function defaultRest() {
  return getState().settings.defaultRestSec;
}

function parseRest(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  const m = text.match(/(\d+(?:\.\d+)?)\s*(s|sec|secs|seconds|m|min|mins|minutes)?/i);
  if (!m) return null;
  const value = Number(m[1]);
  const unit = (m[2] || 's').toLowerCase();
  const secs = unit.startsWith('m') ? Math.round(value * 60) : Math.round(value);
  return secs > 0 && secs <= 1800 ? secs : null;
}

/** "1-2" → [1,2]; "3-9" → [3…9]; "4" → [4]; "1,3" → [1,3]. */
function parseWeekRange(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return [];
  const weeks = new Set();
  for (const part of text.split(/[,;]/)) {
    const range = part.trim().match(/^(\d+)\s*(?:[-–—]|to)\s*(\d+)$/i);
    if (range) {
      const from = Number(range[1]);
      const to = Number(range[2]);
      for (let w = Math.min(from, to); w <= Math.max(from, to); w++) weeks.add(w);
      continue;
    }
    const single = part.trim().match(/(\d+)/);
    if (single) weeks.add(Number(single[1]));
  }
  return [...weeks].sort((a, b) => a - b);
}

// Where to put N sessions in a week when the plan does not name weekdays.
const DAY_SPREAD = {
  1: [0], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6],
};

export function spreadDays(count) {
  return DAY_SPREAD[Math.min(7, Math.max(1, count))] || DAY_SPREAD[3];
}

/* ------------------------------------------------------------------- CSV */

/** Split CSV text into rows, honouring quoted fields. */
export function parseCSVRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

const COLUMNS = [
  ['phase', /^(phase|block|mesocycle)/],
  ['weeks', /^weeks?\b/],
  ['workout', /^(workout|session|routine|day\b)/],
  ['order', /^(order|no\b|num|#)/],
  ['exercise', /^(exercise|movement|lift)/],
  ['sets', /^sets?/],
  ['reps', /^reps?|^repetitions/],
  ['rest', /^rest/],
  ['rpe', /^(rpe|intensity)/],
  ['notes', /^(notes?|cues?|comment)/],
];

function mapHeaders(header) {
  const map = {};
  header.forEach((raw, index) => {
    const clean = String(raw).trim().toLowerCase();
    for (const [key, re] of COLUMNS) {
      if (map[key] === undefined && re.test(clean)) { map[key] = index; return; }
    }
  });
  return map;
}

export function looksLikeCSV(text) {
  const first = String(text || '').split(/\r?\n/).find((l) => l.trim());
  if (!first || !first.includes(',')) return false;
  const map = mapHeaders(parseCSVRows(first)[0] || []);
  return map.exercise !== undefined && (map.sets !== undefined || map.reps !== undefined);
}

/**
 * Parse a CSV plan. Rows are grouped into sessions by workout name, and
 * sessions are placed on the weeks their phase covers.
 */
export function parseCSVPlan(text, { name = 'My plan' } = {}) {
  const rows = parseCSVRows(String(text || ''));
  const warnings = [];
  if (!rows.length) return { name, sessions: {}, weeks: [], warnings, totalExercises: 0, source: 'csv' };

  const map = mapHeaders(rows[0]);
  if (map.exercise === undefined) {
    return {
      name, sessions: {}, weeks: [], totalExercises: 0, source: 'csv',
      warnings: ['No "Exercise" column found — check the header row.'],
    };
  }

  const cell = (row, key) => (map[key] === undefined ? '' : String(row[map[key]] ?? '').trim());

  const sessions = {};
  const phaseWeeks = new Map();   // phase key -> week numbers
  const phaseOrder = [];          // phase key -> ordered session keys
  let totalExercises = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const exerciseName = cell(row, 'exercise');
    if (!exerciseName) continue;

    const phase = cell(row, 'phase') || 'Plan';
    const workout = cell(row, 'workout') || 'Session';
    const key = `${phase}|${workout}`;

    if (!sessions[key]) {
      sessions[key] = { key, name: workout, phase, exercises: [] };
      if (!phaseOrder.find((p) => p.phase === phase)) phaseOrder.push({ phase, keys: [] });
      phaseOrder.find((p) => p.phase === phase).keys.push(key);
    }

    if (!phaseWeeks.has(phase)) {
      const weeks = parseWeekRange(cell(row, 'weeks'));
      phaseWeeks.set(phase, weeks);
    }

    const sets = Math.min(20, Math.max(1, Number(cell(row, 'sets')) || 1));
    const reps = cell(row, 'reps');
    const rpe = cell(row, 'rpe');
    const notes = cell(row, 'notes');

    sessions[key].exercises.push({
      name: exerciseName,
      sets,
      reps,
      restSec: parseRest(cell(row, 'rest')),
      rpe: rpe || '',
      notes: notes || '',
      order: Number(cell(row, 'order')) || sessions[key].exercises.length + 1,
    });
    totalExercises += 1;
  }

  for (const session of Object.values(sessions)) {
    session.exercises.sort((a, b) => a.order - b.order);
  }

  // lay the phases out across weeks
  let maxWeek = 0;
  for (const weeks of phaseWeeks.values()) maxWeek = Math.max(maxWeek, ...weeks, 0);
  if (!maxWeek) {
    // no week column: everything repeats in a single week
    maxWeek = 1;
    for (const phase of phaseWeeks.keys()) phaseWeeks.set(phase, [1]);
  }

  const weeks = Array.from({ length: maxWeek }, () => ({ days: Array.from({ length: 7 }, () => null) }));
  for (const { phase, keys } of phaseOrder) {
    const weekNumbers = phaseWeeks.get(phase) || [];
    const days = spreadDays(keys.length);
    for (const weekNumber of weekNumbers) {
      const week = weeks[weekNumber - 1];
      if (!week) continue;
      keys.forEach((key, i) => { week.days[days[i]] = key; });
    }
  }

  const uncovered = weeks
    .map((w, i) => (w.days.some(Boolean) ? null : i + 1))
    .filter(Boolean);
  if (uncovered.length) warnings.push(`No sessions for week ${uncovered.join(', ')}.`);

  const planName = phaseOrder.length === 1 ? phaseOrder[0].phase : name;

  return { name: planName, sessions, weeks, warnings, totalExercises, source: 'csv' };
}

/* ------------------------------------------------------------------ text */

const DAY_PATTERNS = [
  [/^(mon|monday)$/i, 0], [/^(tue|tues|tuesday)$/i, 1], [/^(wed|weds|wednesday)$/i, 2],
  [/^(thu|thur|thurs|thursday)$/i, 3], [/^(fri|friday)$/i, 4],
  [/^(sat|saturday)$/i, 5], [/^(sun|sunday)$/i, 6],
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

function parseDayHeader(line) {
  const m = line.match(/^\s*([A-Za-z]+\s*\d*)\s*[-–—:|]\s*(.+?)\s*$/);
  if (m) {
    const dayIndex = matchDay(m[1]);
    return dayIndex === null ? null : { dayIndex, sessionName: m[2].trim() };
  }
  const bare = matchDay(line.trim());
  return bare === null ? null : { dayIndex: bare, sessionName: '' };
}

function parseExerciseLine(line) {
  const text = line.replace(/^[\s\-*••\d.)]+/, '').trim();
  if (!text) return null;

  const m = text.match(/^(.+?)\s*[:–—-]?\s*(\d+)\s*[x×*]\s*(\d+(?:\s*[-–]\s*\d+)?\s*s?(?:\s*each)?)\s*(?:reps?)?\s*(.*)$/i);
  if (!m) return null;

  const name = m[1].replace(/[\s:,-]+$/, '').trim();
  if (!name || name.length < 2) return null;

  const tail = m[4] || '';
  const restSec = parseRest((tail.match(/(?:rest\s*|@)?(\d+(?:\.\d+)?\s*(?:s|sec|secs|seconds|m|min|mins|minutes)?)/i) || [])[1] || '');
  const rpeMatch = tail.match(/rpe\s*([\d.]+)/i);
  const notes = tail
    .replace(/(?:rest\s*|@)?\d+(?:\.\d+)?\s*(?:s|sec|secs|seconds|m|min|mins|minutes)?\b/i, '')
    .replace(/rpe\s*[\d.]+/i, '')
    .replace(/^[\s,;–—-]+|[\s,;–—-]+$/g, '')
    .trim();

  return {
    name,
    sets: Math.min(20, Math.max(1, Number(m[2]) || 1)),
    reps: m[3].replace(/\s+/g, ' ').trim(),
    restSec,
    rpe: rpeMatch ? rpeMatch[1] : '',
    notes,
  };
}

export function parseTextPlan(text, { name = 'My plan' } = {}) {
  const lines = String(text || '').split(/\r?\n/);
  const warnings = [];
  const sessions = {};
  const weeks = [];
  let weekIndex = -1;
  let currentKey = null;
  let planName = name;
  let totalExercises = 0;

  const ensureWeek = () => {
    if (weekIndex < 0) {
      weeks.push({ days: Array.from({ length: 7 }, () => null) });
      weekIndex = 0;
    }
    return weeks[weekIndex];
  };

  for (const [i, raw] of lines.entries()) {
    const line = raw.trim();
    if (!line) continue;

    const titleMatch = line.match(/^(?:plan|program|programme|block)\s*[:–—-]\s*(.+)$/i);
    if (titleMatch) { planName = titleMatch[1].trim(); continue; }

    if (/^week\s*\d+\b/i.test(line)) {
      weeks.push({ days: Array.from({ length: 7 }, () => null) });
      weekIndex = weeks.length - 1;
      currentKey = null;
      continue;
    }

    const header = parseDayHeader(line);
    if (header) {
      const week = ensureWeek();
      if (REST_WORDS.test(header.sessionName)) {
        week.days[header.dayIndex] = null;
        currentKey = null;
        continue;
      }
      const key = `w${weekIndex}-d${header.dayIndex}`;
      sessions[key] = { key, name: header.sessionName || `Day ${header.dayIndex + 1}`, exercises: [] };
      week.days[header.dayIndex] = key;
      currentKey = key;
      continue;
    }

    const exercise = parseExerciseLine(line);
    if (exercise) {
      if (!currentKey) {
        const week = ensureWeek();
        currentKey = `w${weekIndex}-d0`;
        sessions[currentKey] = { key: currentKey, name: 'Session', exercises: [] };
        week.days[0] = currentKey;
      }
      sessions[currentKey].exercises.push(exercise);
      totalExercises += 1;
      continue;
    }

    warnings.push(`Line ${i + 1}: could not read "${line.slice(0, 60)}"`);
  }

  // drop sessions that gathered no exercises
  for (const week of weeks) {
    week.days = week.days.map((key) => (key && sessions[key]?.exercises.length ? key : null));
  }
  for (const key of Object.keys(sessions)) {
    if (!sessions[key].exercises.length) delete sessions[key];
  }

  return {
    name: planName,
    sessions,
    weeks: weeks.filter((w) => w.days.some(Boolean)),
    warnings,
    totalExercises,
    source: 'text',
  };
}

/** Parse either format, choosing by content. */
export function parsePlan(text, options) {
  return looksLikeCSV(text) ? parseCSVPlan(text, options) : parseTextPlan(text, options);
}

/* ------------------------------------------------------------------ apply */

export function newExercisesIn(parsed) {
  const seen = new Map();
  for (const session of Object.values(parsed.sessions || {})) {
    for (const ex of session.exercises) {
      const key = normaliseName(ex.name);
      if (seen.has(key)) continue;
      if (resolveExerciseName(ex.name).isNew) seen.set(key, ex);
    }
  }
  return [...seen.values()];
}

/** Every session in calendar order, for previews. */
export function sessionList(parsed) {
  const out = [];
  const seen = new Set();
  for (const week of parsed.weeks || []) {
    for (const key of week.days) {
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(parsed.sessions[key]);
    }
  }
  return out.filter(Boolean);
}

/**
 * Turn a parsed plan into exercises, routines and a scheduled program.
 * Only ever adds — nothing existing is modified or removed.
 */
export function applyPlan(parsed, { startDate } = {}) {
  const createdExercises = [];
  const createdRoutines = [];

  // 1. make sure every exercise exists
  const idFor = new Map();
  for (const session of Object.values(parsed.sessions)) {
    for (const ex of session.exercises) {
      const key = normaliseName(ex.name);
      if (idFor.has(key)) continue;
      const { exercise, isNew } = resolveExerciseName(ex.name);
      if (isNew) {
        const made = addCustomExercise({
          name: ex.name, group: 'Other', equipment: 'Other',
          restSec: ex.restSec ?? defaultRest(),
        });
        createdExercises.push(made);
        idFor.set(key, made.id);
      } else {
        idFor.set(key, exercise.id);
      }
    }
  }

  // 2. one routine per distinct session
  const routineFor = new Map();
  for (const session of Object.values(parsed.sessions)) {
    const routine = upsert('routines', {
      id: uid(),
      name: session.name,
      items: session.exercises.map((ex) => ({
        exerciseId: idFor.get(normaliseName(ex.name)),
        sets: ex.sets,
        reps: ex.reps,          // may be a range, a hold, or per-side
        restSec: ex.restSec ?? defaultRest(),
        rpe: ex.rpe || '',
        notes: ex.notes || '',
      })),
      lastUsedAt: 0,
    });
    routineFor.set(session.key, routine.id);
    createdRoutines.push(routine);
  }

  // 3. the calendar
  const program = newProgram(parsed.name, parsed.weeks.length);
  program.startDate = startDate || toISODate(mondayOf(new Date()));
  parsed.weeks.forEach((week, weekIndex) => {
    week.days.forEach((key, dayIndex) => {
      const routineId = key ? routineFor.get(key) : null;
      program.weeks[weekIndex].days[dayIndex] = routineId ? { routineId } : null;
    });
  });

  const saved = upsert('programs', program);
  setActiveProgram(saved.id);
  return { program: saved, createdRoutines, createdExercises };
}
