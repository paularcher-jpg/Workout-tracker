// Exercises you made yourself, folded into the library once it has them.
//
// This recreates the state a phone is actually in: a coach's plan uploaded
// before the library knew ten of its names, so those ten were created as
// custom exercises, planned into routines and logged in workouts. After the
// library learns them, none may be left over and no history may be lost.

import test from 'node:test';
import assert from 'node:assert/strict';
import { loadState, adoptMerged, getState, list, get } from '../js/state.js';
import { SEED_EXERCISES, slugify } from '../js/exercises.js';
import { resolveExerciseName } from '../js/planparse.js';

await loadState();

const COACH = [
  'Dumbbell Shoulder Press', 'Dumbbell Split Squat', 'Triceps Rope Pushdown',
  'Standing Overhead Press', 'Dumbbell Lateral Raise', 'Overhead Cable Triceps Extension',
  'Pull Up or Lat Pulldown', 'Single Arm Dumbbell Row', 'Seated or Lying Leg Curl', 'Hanging Knee Raise',
];
const NEW_IN_LIBRARY = ['dumbbell-shoulder-press', 'dumbbell-split-squat', 'pull-up-or-lat-pulldown',
  'seated-or-lying-leg-curl', 'hanging-knee-raise'];
const ALIASED = {
  'triceps-rope-pushdown': 'rope-pushdown',
  'standing-overhead-press': 'overhead-press',
  'dumbbell-lateral-raise': 'lateral-raise',
  'overhead-cable-triceps-extension': 'overhead-cable-extension',
  'single-arm-dumbbell-row': 'dumbbell-row',
};

/** The phone before this change: old library, ten customs, used everywhere. */
function phoneBefore() {
  const T = 1_700_000_000_000;
  const exercises = {};
  for (const ex of SEED_EXERCISES) {
    if (NEW_IN_LIBRARY.includes(ex.id)) continue;   // the library did not have these yet
    exercises[ex.id] = { ...ex, custom: false, deleted: false, updatedAt: T };
  }
  for (const name of COACH) {
    const id = slugify(name);
    exercises[id] = { id, name, group: 'Other', equipment: 'Other', restSec: 75, custom: true, deleted: false, updatedAt: T };
  }
  // one someone really did invent, which the library knows nothing about
  exercises['sandbag-bear-hug-walk'] = {
    id: 'sandbag-bear-hug-walk', name: 'Sandbag Bear Hug Walk', group: 'Other', equipment: 'Other',
    restSec: 90, custom: true, deleted: false, updatedAt: T,
  };
  const item = (name) => ({ exerciseId: slugify(name), sets: 3, reps: '10', restSec: 75 });
  const set = (w, r) => ({ id: `s${w}${r}`, weight: String(w), reps: String(r), secs: '', done: true });
  return {
    settings: {}, local: {},
    exercises,
    routines: {
      r1: { id: 'r1', name: 'Upper A', items: COACH.map(item), updatedAt: T, deleted: false },
    },
    programs: {},
    workouts: {
      w1: {
        id: 'w1', name: 'Upper A', routineId: 'r1', startedAt: T, finishedAt: T + 3600e3, updatedAt: T, deleted: false,
        entries: [
          { id: 'e1', exerciseId: 'dumbbell-lateral-raise', sets: [set(10, 15), set(10, 14)] },
          { id: 'e2', exerciseId: 'hanging-knee-raise', sets: [set(0, 12)] },
          { id: 'e3', exerciseId: 'sandbag-bear-hug-walk', sets: [set(40, 1)] },
        ],
      },
    },
    active: { id: 'live', entries: [{ id: 'a1', exerciseId: 'triceps-rope-pushdown', sets: [] }] },
  };
}

await adoptMerged(phoneBefore());
const s = getState();

test('nothing from the coach’s plan is left as a custom exercise', () => {
  const custom = list('exercises').filter((e) => e.custom).map((e) => e.name);
  assert.deepEqual(custom, ['Sandbag Bear Hug Walk'], 'only the genuinely invented one should remain');
});

test('the five the library now has take over their records in place', () => {
  for (const id of NEW_IN_LIBRARY) {
    const ex = get('exercises', id);
    assert.ok(ex, `${id} missing`);
    assert.equal(ex.custom, false, `${id} still custom`);
    assert.notEqual(ex.group, 'Other', `${id} should take the library's muscle group`);
    assert.equal(ex.restSec, 75, `${id} should keep the rest time you had`);
  }
});

test('the five other names are merged into the exercise they already were', () => {
  for (const [from, to] of Object.entries(ALIASED)) {
    assert.equal(get('exercises', from), null, `${from} should be retired`);
    assert.ok(get('exercises', to), `${to} missing`);
  }
});

test('routines point at the library exercises', () => {
  const ids = s.routines.r1.items.map((i) => i.exerciseId);
  for (const id of ids) assert.ok(get('exercises', id), `routine points at a missing exercise: ${id}`);
  assert.ok(ids.includes('rope-pushdown') && !ids.includes('triceps-rope-pushdown'));
});

test('logged history moves with the exercise and loses nothing', () => {
  const w = s.workouts.w1;
  assert.equal(w.entries[0].exerciseId, 'lateral-raise');
  assert.deepEqual(w.entries[0].sets.map((x) => [x.weight, x.reps]), [['10', '15'], ['10', '14']]);
  assert.equal(w.entries[1].exerciseId, 'hanging-knee-raise', 'same id, taken over in place');
  assert.equal(w.entries[2].exerciseId, 'sandbag-bear-hug-walk', 'an invented exercise is left alone');
});

test('a session in progress is carried across too', () => {
  assert.equal(s.active.entries[0].exerciseId, 'rope-pushdown');
});

test('running it again changes nothing, so sync does not churn', async () => {
  // savedAt is the local save stamp and moves on every save by design
  const snap = () => JSON.stringify({ ...getState(), savedAt: 0 });
  const before = snap();
  await adoptMerged(JSON.parse(JSON.stringify(getState())));
  assert.equal(snap(), before);
});

test('uploading the coach’s plan again reuses the library, not new customs', () => {
  for (const name of COACH) {
    const { exercise, isNew } = resolveExerciseName(name);
    assert.equal(isNew, false, `"${name}" would be created again`);
    assert.equal(exercise.custom, false, `"${name}" resolves to a custom exercise`);
  }
});
