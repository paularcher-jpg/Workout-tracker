// Running several plans at once, and taking one off the calendar.
//
// These run against a real in-memory store: the rules that matter here are
// about which records survive, which only shows up with the store in the loop.

import test from 'node:test';
import assert from 'node:assert/strict';
import { loadState, upsert, get, list } from '../js/state.js';
import {
  newProgram, activePrograms, activateProgram, removeProgram, routinesOnlyIn,
  todaysSessions, daysInUse, scheduledAcross, toISODate, mondayOf,
} from '../js/program.js';

await loadState();

function routine(name) {
  return upsert('routines', { name, items: [], lastUsedAt: 0 });
}

/** A one-week plan with the given routine on each listed weekday. */
function plan(name, byDay) {
  const p = newProgram(name, 1);
  p.startDate = toISODate(mondayOf(new Date()));
  for (const [day, r] of Object.entries(byDay)) p.weeks[0].days[day] = { routineId: r.id };
  return upsert('programs', p);
}

test('adding a plan keeps the plans already running', () => {
  const a = plan('Strength', { 0: routine('Squat day'), 3: routine('Bench day') });
  const b = plan('Endurance', { 2: routine('ME circuit') });
  activateProgram(b.id);
  const names = activePrograms().map((p) => p.name);
  assert.ok(names.includes('Strength') && names.includes('Endurance'), names.join(', '));
  removeProgram(a.id);
  removeProgram(b.id);
});

test("today's sessions come from every plan", () => {
  const today = (new Date().getDay() + 6) % 7;
  const a = plan('Plan A', { [today]: routine('A today') });
  const b = plan('Plan B', { [today]: routine('B today') });
  const names = todaysSessions().map((s) => s.routine.name).sort();
  assert.deepEqual(names, ['A today', 'B today']);
  assert.equal(scheduledAcross(new Date()).length, 2);
  removeProgram(a.id);
  removeProgram(b.id);
});

test('days already taken by another plan are reported by name', () => {
  const a = plan('Runner', { 1: routine('Legs'), 4: routine('Power') });
  const b = plan('Other', { 1: routine('Upper') });
  const used = daysInUse(activePrograms(), b.id);
  assert.deepEqual(used.get(1), ['Runner']);
  assert.deepEqual(used.get(4), ['Runner']);
  assert.equal(used.has(0), false);
  removeProgram(a.id);
  removeProgram(b.id);
});

test('removing a plan takes it off the calendar and keeps its routines by default', () => {
  const r = routine('Keep me');
  const p = plan('Short lived', { 0: r });
  removeProgram(p.id);
  assert.equal(activePrograms().some((x) => x.id === p.id), false);
  assert.ok(get('routines', r.id), 'routine should survive');
});

test('removing a plan with its routines never takes one another plan still uses', () => {
  const shared = routine('Shared session');
  const own = routine('Only mine');
  const a = plan('Leaving', { 0: shared, 2: own });
  const b = plan('Staying', { 4: shared });

  assert.deepEqual(routinesOnlyIn(a).sort(), [own.id]);
  const { removedRoutines } = removeProgram(a.id, { removeRoutines: true });

  assert.equal(removedRoutines, 1);
  // get() hides deleted records
  assert.equal(get('routines', own.id), null, 'its own routine goes');
  assert.ok(get('routines', shared.id), 'the shared one stays');
  assert.ok(list('programs').some((x) => x.id === b.id), 'the other plan is untouched');
  removeProgram(b.id);
});

test('removing a plan never touches logged workouts', () => {
  const r = routine('Logged');
  const p = plan('Has history', { 0: r });
  const w = upsert('workouts', { routineId: r.id, name: 'Logged', entries: [], startedAt: Date.now() });
  removeProgram(p.id, { removeRoutines: true });
  assert.ok(get('workouts', w.id), 'history must survive removing the plan');
});
