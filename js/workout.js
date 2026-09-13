// Active-session handling plus the progress maths (PRs, estimated 1RM, volume).

import { getState, commit, uid, now, list, get, upsert } from './state.js';

/* ---------------------------------------------------------------- helpers */

export function estimate1RM(weight, reps) {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;
  return w * (1 + r / 30); // Epley
}

export function setVolume(set) {
  return (Number(set.weight) || 0) * (Number(set.reps) || 0);
}

function blankSet(prev) {
  return {
    id: uid(),
    weight: prev?.weight ?? '',
    reps: prev?.reps ?? '',
    warmup: false,
    done: false,
    doneAt: null,
  };
}

/* ------------------------------------------------------------ session life */

export function activeWorkout() {
  return getState().active;
}

export function startWorkout({ routineId = null, name = '' } = {}) {
  const s = getState();
  if (s.active) return s.active;

  const workout = {
    id: uid(),
    startedAt: now(),
    finishedAt: null,
    routineId,
    name: name || defaultSessionName(),
    notes: '',
    entries: [],
  };

  if (routineId) {
    const routine = get('routines', routineId);
    if (routine) {
      workout.name = routine.name;
      for (const item of routine.items || []) {
        const ex = get('exercises', item.exerciseId);
        if (!ex) continue;
        const entry = newEntry(item.exerciseId, item.restSec ?? ex.restSec);
        // what the plan asks for, shown as guidance on the set rows
        entry.target = {
          sets: Number(item.sets) || null,
          reps: item.reps === '' || item.reps == null ? null : String(item.reps),
          rpe: item.rpe || '',
          notes: item.notes || '',
        };
        const count = Math.max(1, Number(item.sets) || 3);
        const last = lastPerformance(item.exerciseId);
        for (let i = 0; i < count; i++) {
          const prior = last?.sets?.filter((x) => !x.warmup)[i];
          const set = blankSet(prior);
          // only a plain number can be prefilled; "8-12", "30s" and "10 each"
          // stay as guidance on the exercise
          if (set.reps === '' && /^\d+$/.test(String(item.reps ?? '').trim())) {
            set.reps = String(item.reps).trim();
          }
          entry.sets.push(set);
        }
        workout.entries.push(entry);
      }
    }
  }

  s.active = workout;
  commit({ immediate: true });
  return workout;
}

function defaultSessionName() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning workout';
  if (h < 17) return 'Afternoon workout';
  return 'Evening workout';
}

function newEntry(exerciseId, restSec) {
  const ex = get('exercises', exerciseId);
  return {
    id: uid(),
    exerciseId,
    restSec: restSec ?? ex?.restSec ?? getState().settings.defaultRestSec,
    notes: '',
    sets: [],
  };
}

export function addExerciseToActive(exerciseId) {
  const w = activeWorkout();
  if (!w) return null;
  const entry = newEntry(exerciseId);
  const last = lastPerformance(exerciseId);
  const priorSets = last?.sets?.filter((x) => !x.warmup) || [];
  const count = Math.max(1, Math.min(priorSets.length || 3, 8));
  for (let i = 0; i < count; i++) entry.sets.push(blankSet(priorSets[i]));
  w.entries.push(entry);
  commit();
  return entry;
}

export function removeEntry(entryId) {
  const w = activeWorkout();
  if (!w) return;
  w.entries = w.entries.filter((e) => e.id !== entryId);
  commit();
}

export function moveEntry(entryId, delta) {
  const w = activeWorkout();
  if (!w) return;
  const i = w.entries.findIndex((e) => e.id === entryId);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= w.entries.length) return;
  [w.entries[i], w.entries[j]] = [w.entries[j], w.entries[i]];
  commit();
}

export function addSet(entryId) {
  const w = activeWorkout();
  const entry = w?.entries.find((e) => e.id === entryId);
  if (!entry) return;
  const reversed = [...entry.sets].reverse();
  const prev = reversed.find((s) => !s.warmup && (s.weight !== '' || s.reps !== ''))
    || reversed.find((s) => !s.warmup)
    || entry.sets.at(-1);
  entry.sets.push(blankSet(prev));
  commit();
}

export function removeSet(entryId, setId) {
  const w = activeWorkout();
  const entry = w?.entries.find((e) => e.id === entryId);
  if (!entry) return;
  entry.sets = entry.sets.filter((s) => s.id !== setId);
  commit();
}

export function patchSet(entryId, setId, patch) {
  const w = activeWorkout();
  const entry = w?.entries.find((e) => e.id === entryId);
  const set = entry?.sets.find((s) => s.id === setId);
  if (!set) return null;
  Object.assign(set, patch);
  commit();
  return set;
}

export function patchEntry(entryId, patch) {
  const w = activeWorkout();
  const entry = w?.entries.find((e) => e.id === entryId);
  if (!entry) return;
  Object.assign(entry, patch);
  commit();
}

export function discardWorkout() {
  const s = getState();
  s.active = null;
  commit({ immediate: true });
}

/** Save the active session into history. Empty sets are dropped. */
export function finishWorkout() {
  const s = getState();
  const w = s.active;
  if (!w) return null;

  const entries = w.entries
    .map((e) => ({
      ...e,
      sets: e.sets
        .filter((set) => set.done && (Number(set.reps) > 0 || Number(set.weight) > 0))
        .map((set) => ({
          id: set.id,
          weight: Number(set.weight) || 0,
          reps: Number(set.reps) || 0,
          warmup: !!set.warmup,
        })),
    }))
    .filter((e) => e.sets.length > 0);

  if (entries.length === 0) {
    s.active = null;
    commit({ immediate: true });
    return null;
  }

  const record = {
    id: w.id,
    startedAt: w.startedAt,
    finishedAt: now(),
    routineId: w.routineId,
    name: w.name,
    notes: w.notes,
    entries,
  };
  upsert('workouts', record);
  s.active = null;
  commit({ immediate: true });
  return record;
}

/* ----------------------------------------------------------------- history */

export function workoutsSorted() {
  return list('workouts').sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
}

/** Most recent completed entry for an exercise (used for the "prev" column). */
export function lastPerformance(exerciseId, beforeTs = Infinity) {
  for (const w of workoutsSorted()) {
    if ((w.startedAt || 0) >= beforeTs) continue;
    const entry = w.entries?.find((e) => e.exerciseId === exerciseId);
    if (entry && entry.sets.length) return { workout: w, sets: entry.sets };
  }
  return null;
}

export function workoutStats(w) {
  let volume = 0;
  let sets = 0;
  let reps = 0;
  for (const e of w.entries || []) {
    for (const s of e.sets) {
      if (s.warmup) continue;
      volume += setVolume(s);
      sets += 1;
      reps += Number(s.reps) || 0;
    }
  }
  const durationMs = (w.finishedAt || w.startedAt) - w.startedAt;
  return { volume, sets, reps, durationMs, exercises: (w.entries || []).length };
}

/** Per-session series for one exercise, oldest first. */
export function exerciseSeries(exerciseId) {
  const out = [];
  for (const w of workoutsSorted().slice().reverse()) {
    const entry = w.entries?.find((e) => e.exerciseId === exerciseId);
    if (!entry) continue;
    const working = entry.sets.filter((s) => !s.warmup);
    if (!working.length) continue;
    let top = working[0];
    let best1RM = 0;
    let volume = 0;
    for (const s of working) {
      if ((Number(s.weight) || 0) > (Number(top.weight) || 0)) top = s;
      best1RM = Math.max(best1RM, estimate1RM(s.weight, s.reps));
      volume += setVolume(s);
    }
    out.push({
      t: w.startedAt,
      date: new Date(w.startedAt),
      topWeight: Number(top.weight) || 0,
      topReps: Number(top.reps) || 0,
      est1RM: best1RM,
      volume,
      sets: working.length,
    });
  }
  return out;
}

export function personalBests(exerciseId) {
  const series = exerciseSeries(exerciseId);
  if (!series.length) return null;
  const best = { weight: 0, est1RM: 0, volume: 0, weightAt: 0, est1RMAt: 0, volumeAt: 0, reps: 0 };
  for (const p of series) {
    if (p.topWeight > best.weight) { best.weight = p.topWeight; best.reps = p.topReps; best.weightAt = p.t; }
    if (p.est1RM > best.est1RM) { best.est1RM = p.est1RM; best.est1RMAt = p.t; }
    if (p.volume > best.volume) { best.volume = p.volume; best.volumeAt = p.t; }
  }
  return best;
}

/** True if this set beats every previous session's best for the exercise. */
export function isPR(exerciseId, set) {
  if (set.warmup) return false;
  const pbs = personalBests(exerciseId);
  if (!pbs) return (Number(set.weight) || 0) > 0;
  return estimate1RM(set.weight, set.reps) > pbs.est1RM + 0.01;
}

export function weeklyVolume(weeks = 12) {
  const buckets = new Map();
  const msWeek = 7 * 86400000;
  const startOfWeek = (ts) => {
    const d = new Date(ts);
    const day = (d.getDay() + 6) % 7; // Monday-first
    d.setHours(0, 0, 0, 0);
    return d.getTime() - day * 86400000;
  };
  for (const w of list('workouts')) {
    const key = startOfWeek(w.startedAt);
    buckets.set(key, (buckets.get(key) || 0) + workoutStats(w).volume);
  }
  const end = startOfWeek(Date.now());
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const t = end - i * msWeek;
    out.push({ t, date: new Date(t), value: buckets.get(t) || 0 });
  }
  return out;
}

export function overallStats() {
  const workouts = list('workouts');
  let volume = 0;
  let sets = 0;
  for (const w of workouts) {
    const st = workoutStats(w);
    volume += st.volume;
    sets += st.sets;
  }
  // consecutive weeks with at least one session
  const weeks = new Set(
    workouts.map((w) => {
      const d = new Date(w.startedAt);
      const day = (d.getDay() + 6) % 7;
      d.setHours(0, 0, 0, 0);
      return d.getTime() - day * 86400000;
    }),
  );
  let streak = 0;
  const msWeek = 7 * 86400000;
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  let cursor = d.getTime() - day * 86400000;
  while (weeks.has(cursor)) { streak++; cursor -= msWeek; }
  return { workouts: workouts.length, volume, sets, streak };
}

export function exercisesUsed() {
  const counts = new Map();
  for (const w of list('workouts')) {
    for (const e of w.entries || []) counts.set(e.exerciseId, (counts.get(e.exerciseId) || 0) + 1);
  }
  return counts;
}
