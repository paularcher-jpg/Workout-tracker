// Sync-merge tests. Run with: node --test tests/
//
// These cover the rule that matters most: syncing must never lose a set you
// logged offline.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeStates, emptyState } from '../js/state.js';

const base = () => {
  const s = emptyState();
  s.exercises = {};
  return s;
};

const workout = (id, startedAt, updatedAt, extra = {}) => ({
  id, startedAt, updatedAt, deleted: false, name: 'W', entries: [], ...extra,
});

test('a workout only on the remote is pulled in', () => {
  const local = base();
  const remote = { ...base(), workouts: { a: workout('a', 1000, 1000) } };
  const { merged, changed } = mergeStates(local, remote);
  assert.equal(changed, true);
  assert.ok(merged.workouts.a);
});

test('a workout logged offline locally survives a sync', () => {
  const local = { ...base(), workouts: { mine: workout('mine', 5000, 5000) } };
  const remote = { ...base(), workouts: { theirs: workout('theirs', 1000, 1000) } };
  const { merged } = mergeStates(local, remote);
  assert.ok(merged.workouts.mine, 'local workout must not be dropped');
  assert.ok(merged.workouts.theirs, 'remote workout must be pulled in');
});

test('the newer edit of the same record wins', () => {
  const local = { ...base(), workouts: { a: workout('a', 1000, 2000, { name: 'local' }) } };
  const remote = { ...base(), workouts: { a: workout('a', 1000, 3000, { name: 'remote' }) } };
  assert.equal(mergeStates(local, remote).merged.workouts.a.name, 'remote');

  const local2 = { ...base(), workouts: { a: workout('a', 1000, 9000, { name: 'local' }) } };
  assert.equal(mergeStates(local2, remote).merged.workouts.a.name, 'local');
});

test('a newer local edit is not reported as a change to adopt', () => {
  const local = { ...base(), workouts: { a: workout('a', 1000, 9000) } };
  const remote = { ...base(), workouts: { a: workout('a', 1000, 1000) } };
  assert.equal(mergeStates(local, remote).changed, false);
});

test('a delete on another device propagates as a tombstone', () => {
  const local = { ...base(), workouts: { a: workout('a', 1000, 1000) } };
  const remote = { ...base(), workouts: { a: workout('a', 1000, 5000, { deleted: true }) } };
  const { merged } = mergeStates(local, remote);
  assert.equal(merged.workouts.a.deleted, true);
});

test('a record deleted remotely but edited later locally comes back', () => {
  const local = { ...base(), workouts: { a: workout('a', 1000, 9000, { name: 'kept' }) } };
  const remote = { ...base(), workouts: { a: workout('a', 1000, 5000, { deleted: true }) } };
  const { merged } = mergeStates(local, remote);
  assert.equal(merged.workouts.a.deleted, false);
});

test('device-local fields are never taken from the remote file', () => {
  const local = base();
  local.local.driveClientId = 'mine.apps.googleusercontent.com';
  local.local.driveFileId = 'file-123';
  const remote = { ...base(), local: { driveClientId: 'other', driveFileId: 'file-999', deviceId: 'x' } };
  const { merged } = mergeStates(local, remote);
  assert.equal(merged.local.driveClientId, 'mine.apps.googleusercontent.com');
  assert.equal(merged.local.driveFileId, 'file-123');
});

test('an in-progress session is never clobbered by a sync', () => {
  const local = { ...base(), active: { id: 'live', entries: [{ id: 'e' }] } };
  const remote = { ...base(), active: { id: 'stale', entries: [] } };
  const { merged } = mergeStates(local, remote);
  assert.equal(merged.active.id, 'live');
});

test('newer settings are adopted, older ones ignored', () => {
  const local = base();
  local.settings = { ...local.settings, units: 'kg', updatedAt: 1000 };
  const newer = { ...base(), settings: { units: 'lb', updatedAt: 5000 } };
  assert.equal(mergeStates(local, newer).merged.settings.units, 'lb');

  const older = { ...base(), settings: { units: 'lb', updatedAt: 10 } };
  assert.equal(mergeStates(local, older).merged.settings.units, 'kg');
});

test('a missing or unreadable remote file leaves local state untouched', () => {
  const local = { ...base(), workouts: { a: workout('a', 1000, 1000) } };
  for (const remote of [null, undefined, 'nonsense', 42]) {
    const { merged, changed } = mergeStates(local, remote);
    assert.equal(changed, false);
    assert.ok(merged.workouts.a);
  }
});

test('routines and exercises merge on the same rules', () => {
  const local = { ...base(), routines: { r: { id: 'r', name: 'local', updatedAt: 1 } } };
  const remote = {
    ...base(),
    routines: { r: { id: 'r', name: 'remote', updatedAt: 2 } },
    exercises: { custom: { id: 'custom', name: 'Zercher Squat', updatedAt: 5 } },
  };
  const { merged } = mergeStates(local, remote);
  assert.equal(merged.routines.r.name, 'remote');
  assert.equal(merged.exercises.custom.name, 'Zercher Squat');
});
