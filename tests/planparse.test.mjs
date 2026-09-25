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

/* --------------------------------------------------------------- weekdays */

test('a named weekday beats spreading by count', () => {
  const p = parseCSVPlan([
    'Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps',
    'Block,1,Tue,Session A,1,Back Squat,3,5',
    'Block,1,Sat,Session B,1,Deadlift,1,5',
  ].join('\n'));
  assert.equal(p.weeks.length, 1);
  assert.equal(dayOf(p, 0, 0), null, 'Monday should be free');
  assert.equal(dayOf(p, 0, 1).name, 'Session A');
  assert.equal(dayOf(p, 0, 5).name, 'Session B');
});

test('one session can run twice in a week', () => {
  // the whole reason weekdays exist: "squat Monday and Friday" cannot be said
  // by spreading sessions evenly across the week
  const p = parseCSVPlan([
    'Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps',
    'Block,1,Mon Fri,Full Body A,1,Back Squat,3,5',
    'Block,1,Wed,Full Body B,1,Deadlift,1,5',
  ].join('\n'));
  assert.equal(dayOf(p, 0, 0).name, 'Full Body A');
  assert.equal(dayOf(p, 0, 2).name, 'Full Body B');
  assert.equal(dayOf(p, 0, 4).name, 'Full Body A');
  assert.equal(dayOf(p, 0, 0), dayOf(p, 0, 4), 'both days are the same session');
  assert.equal(Object.keys(p.sessions).length, 2, 'not three sessions');
});

test('weekday separators', () => {
  for (const cell of ['Mon Fri', 'Mon/Fri', 'Mon;Fri', 'Monday Friday', '"Mon,Fri"']) {
    const p = parseCSVPlan([
      'Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps',
      `Block,1,${cell},A,1,Back Squat,3,5`,
    ].join('\n'));
    assert.equal(dayOf(p, 0, 0)?.name, 'A', `failed on "${cell}"`);
    assert.equal(dayOf(p, 0, 4)?.name, 'A', `failed on "${cell}"`);
  }
});

test('a bare "Day" column still names the session, not the weekday', () => {
  // "Day" is how plenty of spreadsheets label the session column, and that
  // reading must not change now that "Weekday" exists
  const p = parseCSVPlan([
    'Day,Exercise,Sets,Reps',
    'Push,Barbell Bench Press,3,5',
    'Pull,Barbell Row,3,5',
  ].join('\n'));
  assert.equal(dayOf(p, 0, 0).name, 'Push');
  assert.equal(dayOf(p, 0, 3).name, 'Pull');
});

test('sessions without a weekday fill the days left over', () => {
  const p = parseCSVPlan([
    'Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps',
    'Block,1,Wed,Fixed,1,Back Squat,3,5',
    'Block,1,,Floating,1,Deadlift,1,5',
  ].join('\n'));
  assert.equal(dayOf(p, 0, 2).name, 'Fixed');
  const floating = p.weeks[0].days
    .map((k, i) => (k && p.sessions[k].name === 'Floating' ? i : null))
    .filter((i) => i !== null);
  assert.equal(floating.length, 1, 'the floating session lands exactly once');
  assert.notEqual(floating[0], 2, 'and not on top of the fixed one');
});

/* ------------------------------------------------------------ fit to days */

import { fitToDays, daysNeeded, defaultDays } from '../js/planparse.js';

const threeDay = () => parseCSVPlan([
  'Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps',
  'Block,1,Mon Fri,A,1,Back Squat,3,5',
  'Block,1,Wed,B,1,Deadlift,1,5',
].join('\n'));

test('a plan needs as many days as its busiest week', () => {
  assert.equal(daysNeeded(threeDay()), 3);
  assert.deepEqual(defaultDays(threeDay()), [0, 2, 4]);
});

test('sessions move onto the chosen days and keep their order', () => {
  // A/B/A on Mon/Wed/Fri becomes A/B/A on Tue/Thu/Sat, not B/A/A
  const p = fitToDays(threeDay(), [5, 1, 3]);
  const names = p.weeks[0].days.map((k) => (k ? p.sessions[k].name : null));
  assert.deepEqual(names, [null, 'A', null, 'B', null, 'A', null]);
  assert.deepEqual(p.warnings, []);
});

test('a lighter week spreads out instead of bunching at the start', () => {
  const p = parseCSVPlan([
    'Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps',
    'Full,1,Mon,A,1,Back Squat,3,5', 'Full,1,Tue,B,1,Deadlift,1,5',
    'Full,1,Thu,C,1,Bench Press,3,5', 'Full,1,Fri,D,1,Barbell Row,3,5',
    'Deload,2,Mon,Easy A,1,Back Squat,2,5', 'Deload,2,Tue,Easy B,1,Deadlift,1,5',
  ].join('\n'));
  const fitted = fitToDays(p, [0, 1, 3, 4]);
  const deload = fitted.weeks[1].days.map((k, i) => (k ? i : null)).filter((i) => i !== null);
  assert.deepEqual(deload, [0, 4], 'two sessions from Mon/Tue/Thu/Fri should be Monday and Friday');
});

test('every week of a multi-week block is refitted, not just the first', () => {
  const p = parseCSVPlan([
    'Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps',
    'Build,1-2,Mon,A,1,Back Squat,3,5', 'Build,1-2,Wed,B,1,Deadlift,1,5',
    'Peak,3,Mon,A peak,1,Back Squat,3,2', 'Peak,3,Wed,B peak,1,Deadlift,1,2',
  ].join('\n'));
  const fitted = fitToDays(p, [5, 6]);
  for (const week of fitted.weeks) {
    const used = week.days.map((k, i) => (k ? i : null)).filter((i) => i !== null);
    assert.deepEqual(used, [5, 6]);
  }
});

test('too few days is reported, never silently dropped', () => {
  const p = fitToDays(threeDay(), [0, 2]);
  assert.equal(p.warnings.length, 1);
  assert.match(p.warnings[0], /3 sessions but only 2 days/);
});

/* ------------------------------------------------------ spreadsheet dates */

import { looksLikeDate } from '../js/planparse.js';

test('ranges a spreadsheet turned into dates are caught', () => {
  for (const bad of ['45208', '8-Oct', 'Oct-10', '10/8/2026', '8.10.26', '2026-10-08', '4-Jan', '8 Oct 2026']) {
    assert.ok(looksLikeDate(bad), `should flag "${bad}"`);
  }
});

test('real reps and weeks are never mistaken for dates', () => {
  for (const ok of ['10', '8-10', '8-12', '10 each', '30s', '45s each', '780s', '5/5/5+', '5/3/1+',
    '3+', '1-4', '4;8', '5;10', '12', '100', '1 each']) {
    assert.equal(looksLikeDate(ok), false, `wrongly flagged "${ok}"`);
  }
});

test('a converted range raises a warning naming the row', () => {
  const p = parseCSVPlan('Workout,Exercise,Sets,Reps\nA,Back Squat,3,45208\nA,Deadlift,1,5');
  assert.equal(p.warnings.length, 1);
  assert.match(p.warnings[0], /Row 2: reps "45208" looks like a date/);
});

test('the shipped template parses clean', async () => {
  const fs = await import('node:fs');
  const text = fs.readFileSync(new URL('../templates/plan-template.csv', import.meta.url), 'utf8');
  const p = parseCSVPlan(text, { name: 'Template' });
  assert.deepEqual(p.warnings, []);
  assert.equal(p.weeks.length, 9);
  assert.equal(daysNeeded(p), 4);
  // the format's harder features all have to survive a round trip
  const names = (w) => p.weeks[w].days.filter(Boolean).map((k) => p.sessions[k].name);
  assert.deepEqual(names(3), ['Easy Full Body', 'Easy Full Body'], 'one session twice a week');
  assert.deepEqual(names(7), ['Easy Full Body', 'Easy Full Body'], 'a phase on two separate weeks');
  const holds = Object.values(p.sessions).flatMap((s) => s.exercises).filter((e) => e.mode === 'time');
  assert.deepEqual(holds.map((e) => e.reps).sort(), ['30s each', '45s']);
});
