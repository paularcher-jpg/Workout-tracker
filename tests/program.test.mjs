// Schedule maths. Getting these wrong means the app shows you the wrong
// session on the wrong day, so they are pinned down here.

import test from 'node:test';
import assert from 'node:assert/strict';
import { slotFor, startOfDay, toISODate, weekdayIndex, mondayOf, programSummary } from '../js/program.js';

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
