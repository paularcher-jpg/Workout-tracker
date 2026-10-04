// The built-in exercise library: big, and kept tidy, because a duplicate
// splits one movement's progress across two names.

import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_EXERCISES, MUSCLE_GROUPS, EQUIPMENT, nameKey, aliasId, slugify } from '../js/exercises.js';

test('the library is comprehensive', () => {
  assert.ok(SEED_EXERCISES.length >= 350, `only ${SEED_EXERCISES.length} exercises`);
  for (const group of MUSCLE_GROUPS.filter((g) => g !== 'Other')) {
    const n = SEED_EXERCISES.filter((e) => e.group === group).length;
    assert.ok(n >= 5, `${group} has only ${n} exercises`);
  }
  for (const kind of ['Barbell', 'Dumbbell', 'Kettlebell', 'Machine', 'Cable', 'Bodyweight', 'Band', 'Suspension']) {
    const n = SEED_EXERCISES.filter((e) => e.equipment === kind).length;
    assert.ok(n >= 5, `${kind} has only ${n} exercises`);
  }
});

test('no exercise appears twice, under any spelling', () => {
  const seen = new Map();
  for (const e of SEED_EXERCISES) {
    const key = nameKey(e.name);
    assert.ok(!seen.has(key), `${e.name} duplicates ${seen.get(key)}`);
    seen.set(key, e.name);
    const alias = aliasId(e.name);
    assert.ok(!alias || alias === e.id, `${e.name} is another name for ${alias}`);
  }
});

test('every exercise has a valid group, equipment, id and rest time', () => {
  for (const e of SEED_EXERCISES) {
    assert.ok(MUSCLE_GROUPS.includes(e.group), `${e.name}: group ${e.group}`);
    assert.ok(EQUIPMENT.includes(e.equipment) || e.equipment === 'Bar or cable', `${e.name}: equipment ${e.equipment}`);
    assert.equal(e.id, slugify(e.name));
    assert.ok(Number.isInteger(e.restSec) && e.restSec >= 0 && e.restSec <= 300, `${e.name}: rest ${e.restSec}`);
    if (e.mode) assert.equal(e.mode, 'time', `${e.name}: mode ${e.mode}`);
  }
});
