// Moving one session to another day. A move is a one-off for that date, so
// the rest of the plan stays as it was; it works across weeks, and never
// pushes a session into the past.

import test from 'node:test';
import assert from 'node:assert/strict';
import { loadState, upsert, get } from '../js/state.js';
import {
  newProgram, scheduledFor, canMoveSession, moveSession, setSlot, toISODate, addDays,
} from '../js/program.js';

await loadState();

const routine = (name) => upsert('routines', { name, items: [], lastUsedAt: 0 });
const pull = routine('Pull');
const push = routine('Push');
const legs = routine('Legs');

/** A four-week block, Mon pull / Fri push / Sun legs, starting Monday 28 Sep 2026. */
function block() {
  const p = newProgram('Block', 4);
  p.startDate = '2026-09-28';
  for (const w of p.weeks) {
    w.days[0] = { routineId: pull.id };
    w.days[4] = { routineId: push.id };
    w.days[6] = { routineId: legs.id };
  }
  return upsert('programs', p);
}

const SUNDAY = '2026-10-04';
/** What the plan, as stored now, has on a date. */
const on = (p, iso) => scheduledFor(iso, get('programs', p.id)).routineId;

test("Sunday's session can move into next week, where it used to be stuck", () => {
  const p = block();
  assert.ok(canMoveSession(p, SUNDAY, '2026-10-06', SUNDAY), 'Sunday → Tuesday of next week');
  moveSession(p, SUNDAY, '2026-10-06', SUNDAY);
  assert.equal(on(p, SUNDAY), null, 'Sunday is now a rest day');
  assert.equal(on(p, '2026-10-06'), legs.id, 'legs is on Tuesday');
  assert.equal(on(p, '2026-10-11'), legs.id, 'the following Sunday is unchanged: the move was one-off');
  assert.equal(on(p, '2026-10-13'), null, 'and the following Tuesday too');
});

test('dropping on a day with a session swaps them', () => {
  const p = block();
  moveSession(p, SUNDAY, '2026-10-05', SUNDAY);
  assert.equal(on(p, '2026-10-05'), legs.id);
  assert.equal(on(p, SUNDAY), pull.id, 'pull comes to today instead');
});

test('moving back to where the plan had it forgets the move', () => {
  const p = block();
  moveSession(p, SUNDAY, '2026-10-06', SUNDAY);
  moveSession(get('programs', p.id), '2026-10-06', SUNDAY, SUNDAY);
  assert.deepEqual(get('programs', p.id).overrides, {});
  assert.equal(on(p, SUNDAY), legs.id);
});

test('never into the past', () => {
  const p = block();
  assert.equal(canMoveSession(p, SUNDAY, '2026-10-03', SUNDAY), false, 'Saturday has gone');
  // a missed session can go to a free day ahead, but can't swap a session back into the past
  assert.equal(canMoveSession(p, '2026-10-02', '2026-10-06', SUNDAY), true, "missed Friday → next Tuesday (rest)");
  assert.equal(canMoveSession(p, '2026-10-02', '2026-10-05', SUNDAY), false, 'would push Monday into the past');
  assert.equal(canMoveSession(p, '2026-10-03', '2026-10-06', SUNDAY), false, 'a rest day has nothing to move');
  assert.equal(canMoveSession(p, SUNDAY, SUNDAY, SUNDAY), false, 'not onto itself');
  assert.equal(canMoveSession(p, SUNDAY, toISODate(addDays('2026-09-28', 40)), SUNDAY), false, 'not past the end of the plan');
});

test('assigning a session to a moved day shows the new choice', () => {
  const p = block();
  moveSession(p, SUNDAY, '2026-10-06', SUNDAY);
  const slot = scheduledFor('2026-10-06', get('programs', p.id));
  setSlot(get('programs', p.id), slot.weekIndex, slot.dayIndex, push.id, '2026-10-06');
  assert.equal(on(p, '2026-10-06'), push.id);
});
