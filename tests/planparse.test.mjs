// The plan parser has to cope with however a plan was written down.

import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePlan } from '../js/planparse.js';

test('a simple weekly plan', () => {
  const p = parsePlan(`
Monday - Push A
  Barbell Bench Press 4x8 rest 180
  Incline Dumbbell Press 3x10
  Lateral Raise 3x15 @60s
Tuesday - Rest
Wednesday: Pull A
  Deadlift 3x5 rest 240
  Lat Pulldown 3x10
Friday — Legs
  Back Squat 5x5 rest 3min
`);
  assert.equal(p.weeks.length, 1);
  const days = p.weeks[0].days;
  assert.equal(days[0].sessionName, 'Push A');
  assert.equal(days[0].exercises.length, 3);
  assert.equal(days[1], null, 'Tuesday is rest');
  assert.equal(days[2].sessionName, 'Pull A');
  assert.equal(days[4].sessionName, 'Legs');
  assert.equal(days[3], null, 'Thursday not mentioned = rest');
  assert.equal(p.warnings.length, 0);
});

test('sets, reps, rest and rep ranges are read correctly', () => {
  const p = parsePlan(`Mon - A
  Bench Press 4x8 rest 180
  Row 3 x 12
  Curl 3x8-12 @90s
  Squat 5x5 rest 3min
  Plank 3x30`);
  const ex = p.weeks[0].days[0].exercises;
  assert.deepEqual(
    ex.map((e) => [e.name, e.sets, e.reps, e.restSec]),
    [
      ['Bench Press', 4, '8', 180],
      ['Row', 3, '12', null],
      ['Curl', 3, '8-12', 90],
      ['Squat', 5, '5', 180],
      ['Plank', 3, '30', null],
    ],
  );
});

test('multi-week blocks with progression', () => {
  const p = parsePlan(`
Program: 3 week build
Week 1
Mon - Upper
  Bench Press 3x8
Week 2
Mon - Upper
  Bench Press 4x8
Week 3
Mon - Upper
  Bench Press 5x8
`);
  assert.equal(p.name, '3 week build');
  assert.equal(p.weeks.length, 3);
  assert.equal(p.weeks[0].days[0].exercises[0].sets, 3);
  assert.equal(p.weeks[1].days[0].exercises[0].sets, 4);
  assert.equal(p.weeks[2].days[0].exercises[0].sets, 5);
});

test('"Day 1" style rotating plans', () => {
  const p = parsePlan(`
Day 1 - Lower
  Back Squat 3x5
Day 2 - Upper
  Overhead Press 3x5
`);
  assert.equal(p.weeks[0].days[0].sessionName, 'Lower');
  assert.equal(p.weeks[0].days[1].sessionName, 'Upper');
});

test('bulleted and numbered lists are accepted', () => {
  const p = parsePlan(`Mon - A
- Bench Press 4x8
* Row 3x10
1. Curl 3x12`);
  assert.equal(p.weeks[0].days[0].exercises.length, 3);
  assert.equal(p.weeks[0].days[0].exercises[0].name, 'Bench Press');
  assert.equal(p.weeks[0].days[0].exercises[2].name, 'Curl');
});

test('trailing notes are kept, not mistaken for the name', () => {
  const p = parsePlan(`Mon - A
  Bench Press 3x8 @RPE8
  Squat 3x5 rest 180 tempo 3-1-1`);
  const ex = p.weeks[0].days[0].exercises;
  assert.equal(ex[0].name, 'Bench Press');
  assert.equal(ex[1].name, 'Squat');
  assert.equal(ex[1].restSec, 180);
});

test('unreadable lines are reported rather than silently dropped', () => {
  const p = parsePlan(`Mon - A
  Bench Press 4x8
  something entirely unparseable here`);
  assert.equal(p.weeks[0].days[0].exercises.length, 1);
  assert.equal(p.warnings.length, 1);
  assert.match(p.warnings[0], /Line 3/);
});

test('exercises with no day heading still produce a session', () => {
  const p = parsePlan(`Bench Press 4x8
Row 3x10`);
  assert.equal(p.weeks.length, 1);
  assert.equal(p.weeks[0].days[0].exercises.length, 2);
});

test('empty or junk input yields no weeks rather than throwing', () => {
  for (const input of ['', '   ', null, undefined]) {
    const p = parsePlan(input);
    assert.equal(p.weeks.length, 0);
  }
});

test('a day listed as rest does not become a session', () => {
  const p = parsePlan(`Mon - Rest
Tue - Off
Wed - Push
  Bench Press 3x8`);
  assert.equal(p.weeks[0].days[0], null);
  assert.equal(p.weeks[0].days[1], null);
  assert.ok(p.weeks[0].days[2]);
});
