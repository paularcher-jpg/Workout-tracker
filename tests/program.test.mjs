// Schedule maths. Getting these wrong means the app shows you the wrong
// session on the wrong day, so they are pinned down here.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  slotFor, startOfDay, toISODate, weekdayIndex, mondayOf, programSummary,
  planState, planEndDate, addDays,
} from '../js/program.js';

const program = (startDate, weeks) => ({ id: 'p', name: 'P', startDate, weeks, active: true });
const week = (map = {}) => ({ days: Array.from({ length: 7 }, (_, i) => (map[i] ? { routineId: map[i] } : null)) });

test('weekdayIndex is Monday-first', () => {
  assert.equal(weekdayIndex('2026-09-14'), 0, 'Monday');
  assert.equal(weekdayIndex('2026-09-18'), 4, 'Friday');
  assert.equal(weekdayIndex('2026-09-20'), 6, 'Sunday');
});

test('mondayOf snaps back to the start of the week', () => {
  assert.equal(toISODate(mondayOf('2026-09-18')), '2026-09-14');
  assert.equal(toISODate(mondayOf('2026-09-14')), '2026-09-14');
  assert.equal(toISODate(mondayOf('2026-09-20')), '2026-09-14', 'Sunday belongs to the week that began Monday');
});

test('a one-week plan repeats every week', () => {
  const p = program('2026-09-14', [week({ 0: 'push', 2: 'pull', 4: 'legs' })]);
  assert.equal(slotFor(p, '2026-09-14').routineId, 'push');
  assert.equal(slotFor(p, '2026-09-16').routineId, 'pull');
  assert.equal(slotFor(p, '2026-09-18').routineId, 'legs');
  assert.equal(slotFor(p, '2026-09-15').routineId, null, 'Tuesday is a rest day');
  // …and again the following week
  assert.equal(slotFor(p, '2026-09-21').routineId, 'push');
  assert.equal(slotFor(p, '2026-10-19').routineId, 'push');
});

test('a multi-week block cycles through its weeks', () => {
  const p = program('2026-09-14', [
    week({ 0: 'w1-push' }),
    week({ 0: 'w2-push' }),
    week({ 0: 'w3-push' }),
  ]);
  assert.equal(slotFor(p, '2026-09-14').routineId, 'w1-push');
  assert.equal(slotFor(p, '2026-09-21').routineId, 'w2-push');
  assert.equal(slotFor(p, '2026-09-28').routineId, 'w3-push');
  assert.equal(slotFor(p, '2026-10-05').routineId, 'w1-push', 'cycle restarts after the last week');
  assert.equal(slotFor(p, '2026-10-05').weekNumber, 3);
  assert.equal(slotFor(p, '2026-10-05').weekIndex, 0);
});

test('nothing is scheduled before the plan starts', () => {
  const p = program('2026-09-14', [week({ 0: 'push' })]);
  assert.equal(slotFor(p, '2026-09-13'), null);
  assert.equal(slotFor(p, '2026-09-07'), null);
  assert.ok(slotFor(p, '2026-09-14'));
});

test('a plan starting mid-week still lines up with the calendar', () => {
  // starts on a Wednesday; Wednesday's slot should be the one that fires
  const p = program('2026-09-16', [week({ 2: 'pull', 4: 'legs' })]);
  assert.equal(slotFor(p, '2026-09-16').routineId, 'pull');
  assert.equal(slotFor(p, '2026-09-16').dayIndex, 2);
  assert.equal(slotFor(p, '2026-09-18').routineId, 'legs');
});

test('week and day indexes stay in range across a long run', () => {
  const p = program('2026-01-05', [week({ 0: 'a' }), week({ 1: 'b' })]);
  for (let i = 0; i < 400; i++) {
    const d = new Date(2026, 0, 5 + i);
    const slot = slotFor(p, d);
    assert.ok(slot.weekIndex >= 0 && slot.weekIndex < 2, 'weekIndex in range');
    assert.ok(slot.dayIndex >= 0 && slot.dayIndex < 7, 'dayIndex in range');
  }
});

test('crossing a daylight-saving change does not shift the schedule', () => {
  // UK clocks go back on 2026-10-25; a Monday plan must stay on Mondays.
  const p = program('2026-10-19', [week({ 0: 'push' })]);
  for (const monday of ['2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09']) {
    assert.equal(slotFor(p, monday).routineId, 'push', monday);
    assert.equal(slotFor(p, monday).dayIndex, 0, monday);
  }
});

test('startOfDay and toISODate round-trip without timezone drift', () => {
  for (const iso of ['2026-01-01', '2026-06-15', '2026-10-25', '2026-12-31']) {
    assert.equal(toISODate(startOfDay(iso)), iso);
  }
});

test('programSummary counts weeks and training days per cycle', () => {
  const p = program('2026-09-14', [week({ 0: 'a', 2: 'b' }), week({ 0: 'a' })]);
  assert.deepEqual(programSummary(p), { weeks: 2, sessions: 3 });
  assert.deepEqual(programSummary(null), { weeks: 0, sessions: 0 });
});

/* ------------------------------------------------------- finishing a plan */

test('a multi-week block stops at the end instead of looping', () => {
  const p = { ...program('2026-09-14', [week({ 0: 'w1' }), week({ 0: 'w2' })]), repeat: false };
  assert.equal(slotFor(p, '2026-09-14').routineId, 'w1');
  assert.equal(slotFor(p, '2026-09-21').routineId, 'w2');
  assert.equal(slotFor(p, '2026-09-28'), null, 'week 3 is past the end');
  assert.equal(planState(p, '2026-09-28'), 'finished');
  assert.equal(planState(p, '2026-09-21'), 'active');
  assert.equal(planState(p, '2026-09-01'), 'upcoming');
});

test('a repeating plan never finishes', () => {
  const p = { ...program('2026-09-14', [week({ 0: 'w1' })]), repeat: true };
  assert.equal(planState(p, '2027-09-14'), 'active');
  assert.equal(slotFor(p, '2027-09-13').routineId, 'w1');
});

test('the end date is the Sunday of the final week', () => {
  const p = { ...program('2026-09-14', [week({ 0: 'a' }), week({ 0: 'b' })]), repeat: false };
  assert.equal(toISODate(planEndDate(p)), '2026-09-27', 'two weeks from Mon 14 Sep ends Sun 27 Sep');
  assert.equal(planEndDate({ ...p, repeat: true }), null, 'a repeating plan has no end');
});

test('a nine-week block runs exactly nine weeks', () => {
  const weeks = Array.from({ length: 9 }, (_, i) => week({ 0: `w${i + 1}` }));
  const p = { ...program('2026-09-14', weeks), repeat: false };
  assert.equal(slotFor(p, '2026-09-14').routineId, 'w1');
  assert.equal(slotFor(p, '2026-11-09').routineId, 'w9', 'week 9 Monday');
  assert.equal(slotFor(p, '2026-11-16'), null, 'week 10 is past the end');
  assert.equal(toISODate(planEndDate(p)), '2026-11-15');
});

test('a plan saved before `repeat` existed keeps repeating', () => {
  // upgrading must never quietly truncate someone's existing schedule
  const legacy = program('2026-09-14', [week({ 0: 'w1' }), week({ 0: 'w2' })]);
  assert.equal(legacy.repeat, undefined);
  assert.equal(planState(legacy, '2027-01-04'), 'active');
  assert.equal(slotFor(legacy, '2026-09-28').routineId, 'w1', 'cycles rather than ending');
  assert.equal(planEndDate(legacy), null);
});

test('day arithmetic survives a daylight-saving change', () => {
  // Run under TZ=Europe/London (clocks go back 25 Oct 2026) and the rest.
  // Adding n × 86_400_000 ms would land an hour early and report 14 Nov.
  assert.equal(toISODate(addDays('2026-09-14', 62)), '2026-11-15');
  assert.equal(toISODate(addDays('2026-10-24', 2)), '2026-10-26', 'across the change');
  assert.equal(toISODate(addDays('2026-10-26', -2)), '2026-10-24', 'and backwards');

  // a Monday must stay a Monday whichever side of the change it falls
  for (const d of ['2026-10-19', '2026-10-26', '2026-11-02']) {
    assert.equal(toISODate(mondayOf(d)), d, d);
    assert.equal(weekdayIndex(d), 0, d);
  }
  // and a mid-week date still snaps back to its own Monday
  assert.equal(toISODate(mondayOf('2026-10-28')), '2026-10-26');
});

test('a projection spanning a clock change lists every day once', () => {
  const p = { ...program('2026-10-19', [week({ 0: 'push', 2: 'pull' })]), repeat: true };
  const seen = [];
  for (let i = 0; i < 28; i++) {
    const d = addDays('2026-10-19', i);
    seen.push(toISODate(d));
    assert.equal(slotFor(p, d).dayIndex, i % 7, `day index drifted at ${toISODate(d)}`);
  }
  assert.equal(new Set(seen).size, 28, 'no day repeated or skipped');
});
