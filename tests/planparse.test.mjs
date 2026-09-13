// The plan parser has to cope with however a plan was actually written down —
// a coach's spreadsheet or a few lines typed into a box.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePlan, parseTextPlan, parseCSVPlan, parseCSVRows,
  looksLikeCSV, sessionList, spreadDays,
} from '../js/planparse.js';
import { describeReps } from '../js/workout.js';

const dayOf = (p, week, day) => {
  const key = p.weeks[week].days[day];
  return key ? p.sessions[key] : null;
};

/* ------------------------------------------------------------------ text */

test('a simple weekly plan', () => {
  const p = parseTextPlan(`
Monday - Push A
  Barbell Bench Press 4x8 rest 180
  Incline Dumbbell Press 3x10
Tuesday - Rest
Wednesday: Pull A
  Deadlift 3x5 rest 240
`);
  assert.equal(p.weeks.length, 1);
  assert.equal(dayOf(p, 0, 0).name, 'Push A');
  assert.equal(dayOf(p, 0, 0).exercises.length, 2);
  assert.equal(dayOf(p, 0, 1), null, 'Tuesday is rest');
  assert.equal(dayOf(p, 0, 2).name, 'Pull A');
  assert.equal(p.warnings.length, 0);
});

test('sets, reps, rest and rep ranges', () => {
  const p = parseTextPlan(`Mon - A
  Bench Press 4x8 rest 180
  Row 3 x 12
  Curl 3x8-12 @90s
  Squat 5x5 rest 3min`);
  assert.deepEqual(
    dayOf(p, 0, 0).exercises.map((e) => [e.name, e.sets, e.reps, e.restSec]),
    [['Bench Press', 4, '8', 180], ['Row', 3, '12', null],
     ['Curl', 3, '8-12', 90], ['Squat', 5, '5', 180]],
  );
});

test('RPE is pulled out of a text line', () => {
  const p = parseTextPlan(`Mon - A
  Bench Press 3x8 RPE 8 keep it strict`);
  const ex = dayOf(p, 0, 0).exercises[0];
  assert.equal(ex.name, 'Bench Press');
  assert.equal(ex.rpe, '8');
  assert.match(ex.notes, /strict/);
});

test('multi-week text blocks keep their weeks separate', () => {
  const p = parseTextPlan(`
Week 1
Mon - Upper
  Bench Press 3x8
Week 2
Mon - Upper
  Bench Press 4x8
`);
  assert.equal(p.weeks.length, 2);
  assert.equal(dayOf(p, 0, 0).exercises[0].sets, 3);
  assert.equal(dayOf(p, 1, 0).exercises[0].sets, 4);
});

test('unreadable lines are reported, not silently dropped', () => {
  const p = parseTextPlan(`Mon - A
  Bench Press 4x8
  something entirely unparseable`);
  assert.equal(dayOf(p, 0, 0).exercises.length, 1);
  assert.match(p.warnings[0], /Line 3/);
});

test('empty input yields no weeks rather than throwing', () => {
  for (const input of ['', '   ', null, undefined]) {
    assert.equal(parsePlan(input).weeks.length, 0);
  }
});

/* ------------------------------------------------------------------- CSV */

const CSV = `Phase,Weeks,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Phase 1 Full Body,1-2,Full Body A,1,Goblet Squat,3,10,90,6,Easy first week.
Phase 1 Full Body,1-2,Full Body A,2,Plank,3,30s,45,,Hold a straight line.
Phase 1 Full Body,1-2,Full Body B,1,Leg Press,3,12,90,6,
Phase 2 Push Pull Legs,3-9,Push,1,Barbell Bench Press,4,6-8,150,8,Main lift.
Phase 2 Push Pull Legs,3-9,Pull,1,Barbell Row,3,8-10,120,8,
Phase 2 Push Pull Legs,3-9,Legs,1,Back Squat,3,5-6,180,7,Leave two reps in reserve.
Phase 2 Push Pull Legs,3-9,Legs,2,Side Plank,3,30s each,45,,`;

test('a CSV plan is detected and read as one', () => {
  assert.equal(looksLikeCSV(CSV), true);
  assert.equal(looksLikeCSV('Mon - Push\n  Bench Press 4x8'), false);
  assert.equal(parsePlan(CSV).source, 'csv');
});

test('phases are laid out across the weeks they cover', () => {
  const p = parseCSVPlan(CSV);
  assert.equal(p.weeks.length, 9, 'weeks 1-2 plus 3-9');
  // phase 1: two sessions -> Monday and Thursday
  assert.equal(dayOf(p, 0, 0).name, 'Full Body A');
  assert.equal(dayOf(p, 0, 3).name, 'Full Body B');
  assert.equal(dayOf(p, 1, 0).name, 'Full Body A', 'week 2 repeats phase 1');
  // phase 2: three sessions -> Mon / Wed / Fri
  assert.equal(dayOf(p, 2, 0).name, 'Push');
  assert.equal(dayOf(p, 2, 2).name, 'Pull');
  assert.equal(dayOf(p, 2, 4).name, 'Legs');
  assert.equal(dayOf(p, 8, 0).name, 'Push', 'through to week 9');
});

test('a session shared by several weeks is defined once', () => {
  const p = parseCSVPlan(CSV);
  assert.equal(Object.keys(p.sessions).length, 5);
  assert.equal(p.weeks[2].days[0], p.weeks[8].days[0], 'same session key reused');
});

test('columns are read by name, and order is respected', () => {
  const p = parseCSVPlan(CSV);
  const legs = sessionList(p).find((s) => s.name === 'Legs');
  assert.deepEqual(legs.exercises.map((e) => e.name), ['Back Squat', 'Side Plank']);
  const squat = legs.exercises[0];
  assert.equal(squat.sets, 3);
  assert.equal(squat.reps, '5-6');
  assert.equal(squat.restSec, 180);
  assert.equal(squat.rpe, '7');
  assert.equal(squat.notes, 'Leave two reps in reserve.');
});

test('header names are matched loosely', () => {
  const p = parseCSVPlan(`Session,Movement,Sets,Reps,Rest
Push,Bench Press,3,8,120`);
  const s = sessionList(p)[0];
  assert.equal(s.name, 'Push');
  assert.equal(s.exercises[0].name, 'Bench Press');
  assert.equal(s.exercises[0].restSec, 120);
});

test('a CSV with no Exercise column says so rather than importing nothing', () => {
  const p = parseCSVPlan('Day,Thing\nMon,Stuff');
  assert.equal(p.weeks.length, 0);
  assert.match(p.warnings[0], /Exercise/);
});

test('quoted fields containing commas survive', () => {
  const rows = parseCSVRows('a,"b,c",d\n1,"say ""hi""",3');
  assert.deepEqual(rows[0], ['a', 'b,c', 'd']);
  assert.deepEqual(rows[1], ['1', 'say "hi"', '3']);
});

test('week ranges expand, single weeks do not', () => {
  const p = parseCSVPlan(`Phase,Weeks,Workout,Exercise,Sets,Reps
A,1,X,Squat,3,5
B,2-4,Y,Bench,3,5`);
  assert.equal(p.weeks.length, 4);
  assert.equal(dayOf(p, 0, 0).name, 'X');
  assert.equal(dayOf(p, 1, 0).name, 'Y');
  assert.equal(dayOf(p, 3, 0).name, 'Y');
});

/* -------------------------------------------------------------- rep kinds */

test('reps are classified so ambiguous targets are never prefilled', () => {
  assert.deepEqual(describeReps('10'), { label: '10', prefill: '10', perSide: false, isTime: false });

  // a range is a choice the lifter makes on the day, so it stays guidance
  assert.equal(describeReps('6-8').prefill, null);
  assert.equal(describeReps('6-8').label, '6-8');

  // a hold is seconds, not reps
  assert.equal(describeReps('30s').isTime, true);
  assert.equal(describeReps('30s').prefill, null);

  // "10 each" is still 10 reps in the box — the per-side part shows in the
  // target label, so prefilling saves typing without being misleading
  assert.equal(describeReps('10 each').perSide, true);
  assert.equal(describeReps('10 each').prefill, '10');
  assert.equal(describeReps('10 each').label, '10 each');

  assert.equal(describeReps('30s each').isTime, true);
  assert.equal(describeReps('30s each').perSide, true);
  assert.equal(describeReps('30s each').prefill, null, 'a per-side hold is still not reps');

  assert.equal(describeReps('').label, '');
});

test('sessions are spread sensibly across the week', () => {
  assert.deepEqual(spreadDays(2), [0, 3], 'two sessions: Monday and Thursday');
  assert.deepEqual(spreadDays(3), [0, 2, 4], 'three: Monday, Wednesday, Friday');
  assert.deepEqual(spreadDays(1), [0]);
  assert.equal(spreadDays(7).length, 7);
});
