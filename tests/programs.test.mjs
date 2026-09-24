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
