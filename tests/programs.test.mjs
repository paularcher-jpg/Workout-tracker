// Every built-in program has to be correct before it ships: a plan that names
// an exercise the library does not have, or lands on five training days when
// it advertises three, is worse than no plan at all — you only find out in the
// gym.

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCSVPlan, sessionList } from '../js/planparse.js';
import { SEED_EXERCISES, slugify } from '../js/exercises.js';
import { PROGRAMS, GOALS, LEVELS, getProgram } from '../js/programs/index.js';

const known = new Set(SEED_EXERCISES.map((e) => e.id));
const parsed = new Map(PROGRAMS.map((p) => [p.id, parseCSVPlan(p.csv, { name: p.name })]));

test('there is a real library to choose from', () => {
  assert.ok(PROGRAMS.length >= 30, `only ${PROGRAMS.length} programs`);
  assert.equal(new Set(PROGRAMS.map((p) => p.id)).size, PROGRAMS.length, 'ids are unique');
  assert.equal(new Set(PROGRAMS.map((p) => p.name)).size, PROGRAMS.length, 'names are unique');
});

test('every goal offered as a filter has programs behind it', () => {
  for (const goal of GOALS) {
    const n = PROGRAMS.filter((p) => p.goal === goal.id).length;
    assert.ok(n > 0, `"${goal.id}" has no programs`);
  }
});

for (const def of PROGRAMS) {
  test(`${def.id} is complete and parses`, () => {
    for (const field of ['name', 'goal', 'level', 'summary', 'detail', 'equipment', 'csv']) {
      assert.ok(def[field], `missing ${field}`);
    }
    assert.ok(GOALS.some((g) => g.id === def.goal), `unknown goal "${def.goal}"`);
    assert.ok(LEVELS.includes(def.level), `unknown level "${def.level}"`);
    assert.equal(typeof def.repeat, 'boolean');
    assert.equal(getProgram(def.id), def, 'findable by id');

    const plan = parsed.get(def.id);
    assert.deepEqual(plan.warnings, [], 'parses without warnings');
    assert.equal(plan.weeks.length, def.weeks, 'week count matches the description');
  });

  test(`${def.id} trains on the days it advertises`, () => {
    const plan = parsed.get(def.id);
    plan.weeks.forEach((week, i) => {
      const days = week.days.filter(Boolean).length;
      assert.equal(days, def.days, `week ${i + 1} has ${days} training days, not ${def.days}`);
    });
  });

  test(`${def.id} only names exercises the app knows`, () => {
    // an unknown name still imports, but it arrives with no muscle group and a
    // default rest time, which is not good enough for a built-in program
    for (const session of sessionList(parsed.get(def.id))) {
      assert.ok(session.exercises.length, `"${session.name}" is empty`);
      for (const ex of session.exercises) {
        assert.ok(known.has(slugify(ex.name)), `unknown exercise "${ex.name}"`);
        assert.ok(ex.reps, `"${ex.name}" has no reps`);
        assert.ok(ex.restSec !== null, `"${ex.name}" has no rest time`);
        assert.ok(ex.sets >= 1 && ex.sets <= 20, `"${ex.name}" has ${ex.sets} sets`);
      }
    }
  });
}

test('holds are carried through as time, not reps', () => {
  // a program full of "3x45s" planks that import as 45 reps would quietly
  // poison every volume number in the app
  const withHolds = PROGRAMS.filter((def) => /,\d+s(\s+each)?,/.test(def.csv));
  assert.ok(withHolds.length > 5, 'expected plenty of programs to use holds');
  for (const def of withHolds) {
    const holds = sessionList(parsed.get(def.id))
      .flatMap((s) => s.exercises)
      .filter((ex) => /^\d+\s*s(\s+each)?$/i.test(ex.reps));
    assert.ok(holds.length, `${def.id}: found no holds after parsing`);
    for (const ex of holds) assert.equal(ex.mode, 'time', `${def.id}: "${ex.name}" is not a hold`);
  }
});

test('a repeating program is short enough to be worth repeating', () => {
  for (const def of PROGRAMS) {
    if (def.repeat) assert.ok(def.weeks <= 6, `${def.id} repeats a ${def.weeks} week cycle`);
  }
});

test('the gym muscular endurance block matches the published progression', () => {
  const def = getProgram('gym-muscular-endurance');
  assert.ok(def, 'program is missing');
  assert.ok(def.source, 'a program taken from a published protocol has to credit it');
  assert.equal(def.weeks, 14, 'the progression is fourteen workouts');
  assert.equal(def.days, 1, 'one session a week, on top of your own aerobic volume');

  const plan = parsed.get(def.id);
  const workouts = plan.weeks.map((week) => plan.sessions[week.days.find(Boolean)]);
  const find = (w, name) => w.exercises.find((e) => e.name === name);

  // the published table: sets, rest per set, and rest on the single-leg work
  const table = [
    [6, 60, 30], [6, 60, 30], [6, 45, 30], [5, 60, 60], [6, 45, 30],
    [6, 40, 30], [6, 30, 30], [8, 45, 30], [6, 40, 30], [8, 45, 30],
    [8, 30, 20], [8, 15, 15], [8, 10, 10], [8, 10, 10],
  ];
  workouts.forEach((w, i) => {
    const [sets, rest, legRest] = table[i];
    const jump = find(w, 'Squat Jump');
    const step = find(w, 'Box Step-Up');
    const lunge = find(w, 'Front Lunge');
    assert.equal(jump.sets, sets, `workout ${i + 1} sets`);
    assert.equal(jump.restSec, rest, `workout ${i + 1} rest per set`);
    assert.equal(step.restSec, legRest, `workout ${i + 1} step-up rest`);
    assert.equal(lunge.restSec, legRest, `workout ${i + 1} lunge rest`);
    assert.match(step.reps, /each/, 'step-ups are done a leg at a time');
    assert.match(lunge.reps, /each/, 'lunges are done a leg at a time');
    assert.match(find(w, 'Split Jump Squat').reps, /each/);
  });

  // bodyweight for the first three, then a vest that gets heavier at workout nine
  for (const w of workouts.slice(0, 3)) {
    assert.ok(!w.exercises.some((e) => /vest/i.test(e.notes)), 'first three are bodyweight');
  }
  for (const [i, w] of workouts.entries()) {
    if (i < 3) continue;
    const want = i < 8 ? '10% bodyweight' : '15% bodyweight';
    assert.ok(w.exercises.some((e) => e.notes.includes(want)),
      `workout ${i + 1} should carry ${want}`);
  }

  // two exercises join from workout four and stay
  for (const [i, w] of workouts.entries()) {
    const added = ['Goblet Squat to Press', 'Kettlebell Swing'].filter((n) => find(w, n));
    assert.equal(added.length, i < 3 ? 0 : 2, `workout ${i + 1} added exercises`);
  }

  // every session is warmed up and cooled down
  for (const w of workouts) {
    assert.ok(find(w, 'Floor Get-Up') && find(w, 'Burpee'), 'warm-up is part of the session');
    assert.equal(w.exercises.filter((e) => e.name === 'Easy Aerobic').length, 2,
      'an aerobic warm-up and an aerobic cool-down');
    assert.equal(w.exercises.at(-1).name, 'Easy Aerobic', 'cool-down comes last');
  }
});

test('the invented mountain block is gone now the real protocol is in', () => {
  assert.equal(getProgram('muscular-endurance-mountain'), null);
});
