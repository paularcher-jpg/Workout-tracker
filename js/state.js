// Local-first store. Everything lives in one JSON document, persisted to
// IndexedDB (with a localStorage mirror as a belt-and-braces fallback).
//
// Every record carries `updatedAt` and soft-delete tombstones so that syncing
// with Google Drive is a merge, never an overwrite. Nothing you log on your
// phone can be clobbered by a stale copy of the file.

import { SEED_EXERCISES, slugify } from './exercises.js';

export const SCHEMA_VERSION = 1;

const DB_NAME = 'workout-tracker';
const DB_STORE = 'kv';
const STATE_KEY = 'state';
const LS_KEY = 'wt:state:v1';

const listeners = new Set();
let state = null;
let dbPromise = null;
let saveTimer = null;

/* ------------------------------------------------------------------ utils */

export function uid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

export function now() {
  return Date.now();
}

export function todayISO(d = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

/* --------------------------------------------------------------- indexeddb */

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return resolve(null);
    let req;
    try {
      req = indexedDB.open(DB_NAME, 1);
    } catch (err) {
      return resolve(null);
    }
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(DB_STORE)) d.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    setTimeout(() => resolve(null), 3000); // never hang the app on storage
  });
  return dbPromise;
}

async function idbGet(key) {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet(key, value) {
  const db = await openDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/* ------------------------------------------------------------------- shape */

export function emptyState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      units: 'kg',
      defaultRestSec: 120,
      sound: true,
      vibrate: true,
      autoStartRest: true,
      barWeight: 20,
      // what to call you; synced, so it follows you to a new phone via Drive
      name: '',
      updatedAt: now(),
    },
    // device-local, never synced
    local: {
      deviceId: uid(),
      // per device: you may want the screen held on your phone but not a tablet
      keepAwake: true,
      askedName: false,
      driveClientId: '',
      driveFileId: '',
      lastSyncAt: 0,
      lastSyncError: '',
    },
    exercises: {},
    routines: {},
    programs: {},  // scheduled plans: which routine falls on which day
    workouts: {},
    active: null, // in-progress session; local-only until finished
  };
}

function seedExercises(s) {
  for (const ex of SEED_EXERCISES) {
    if (!s.exercises[ex.id]) {
      s.exercises[ex.id] = { ...ex, custom: false, deleted: false, updatedAt: now() };
    }
  }
  return s;
}

function normalise(raw) {
  const base = emptyState();
  if (!raw || typeof raw !== 'object') return seedExercises(base);
  const s = {
    ...base,
    ...raw,
    settings: { ...base.settings, ...(raw.settings || {}) },
    local: { ...base.local, ...(raw.local || {}) },
    exercises: raw.exercises || {},
    routines: raw.routines || {},
    programs: raw.programs || {},
    workouts: raw.workouts || {},
    active: raw.active || null,
  };
  s.schemaVersion = SCHEMA_VERSION;
  return seedExercises(s);
}

/* ------------------------------------------------------------ load / save */

export async function loadState() {
  let raw = await idbGet(STATE_KEY);
  if (!raw) {
    try {
      const ls = localStorage.getItem(LS_KEY);
      if (ls) raw = JSON.parse(ls);
    } catch { /* ignore */ }
  }
  state = normalise(raw);
  await persist();
  return state;
}

export function getState() {
  if (!state) throw new Error('state not loaded');
  return state;
}

async function persist() {
  const snapshot = JSON.stringify(state);
  const ok = await idbSet(STATE_KEY, JSON.parse(snapshot));
  try {
    localStorage.setItem(LS_KEY, snapshot);
  } catch {
    // localStorage can be full or blocked in private mode; IndexedDB is primary
  }
  return ok;
}

/** Persist and notify views. Debounced so rapid typing doesn't thrash storage. */
export function commit({ immediate = false } = {}) {
  notify();
  clearTimeout(saveTimer);
  if (immediate) return persist();
  saveTimer = setTimeout(persist, 250);
  return Promise.resolve(true);
}

export function flush() {
  clearTimeout(saveTimer);
  return persist();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) {
    try { fn(state); } catch (err) { console.error(err); }
  }
}

/* ------------------------------------------------------------- collections */

export function upsert(collection, record) {
  const s = getState();
  const id = record.id || uid();
  s[collection][id] = { deleted: false, ...s[collection][id], ...record, id, updatedAt: now() };
  commit();
  return s[collection][id];
}

export function softDelete(collection, id) {
  const s = getState();
  const rec = s[collection][id];
  if (!rec) return;
  s[collection][id] = { ...rec, deleted: true, updatedAt: now() };
  commit();
}

export function list(collection) {
  const s = getState();
  return Object.values(s[collection]).filter((r) => !r.deleted);
}

export function get(collection, id) {
  const rec = getState()[collection][id];
  return rec && !rec.deleted ? rec : null;
}

export function updateSettings(patch) {
  const s = getState();
  s.settings = { ...s.settings, ...patch, updatedAt: now() };
  commit();
  return s.settings;
}

export function updateLocal(patch) {
  const s = getState();
  s.local = { ...s.local, ...patch };
  commit();
  return s.local;
}

/* ------------------------------------------------------------ custom items */

export function addCustomExercise({ name, group, equipment, restSec, mode }) {
  const s = getState();
  let id = slugify(name);
  if (!id) id = uid();
  if (s.exercises[id] && !s.exercises[id].deleted) id = `${id}-${uid().slice(0, 4)}`;
  return upsert('exercises', {
    id,
    name: name.trim(),
    group: group || 'Other',
    equipment: equipment || 'Other',
    restSec: Number(restSec) || getState().settings.defaultRestSec,
    // a hold imported from a plan has to stay a hold: isTimeExercise reads
    // this, so dropping it turns "30s" back into "30 reps" everywhere
    ...(mode && { mode }),
    custom: true,
  });
}

/* ------------------------------------------------------------------- merge */

/**
 * Merge a remote document into a local one. Per record, the newer `updatedAt`
 * wins; tombstones are kept so a delete on one device propagates instead of
 * being resurrected by the other. Device-local settings are never taken from
 * the remote copy.
 */
export function mergeStates(local, remote) {
  if (!remote || typeof remote !== 'object') return { merged: local, changed: false };
  const merged = {
    schemaVersion: SCHEMA_VERSION,
    settings: local.settings,
    local: local.local,
    exercises: {},
    routines: {},
    programs: {},
    workouts: {},
    active: local.active,
  };
  let changed = false;

  if ((remote.settings?.updatedAt || 0) > (local.settings?.updatedAt || 0)) {
    const { updatedAt, ...rest } = remote.settings;
    merged.settings = { ...local.settings, ...rest, updatedAt };
    changed = true;
  }

  for (const key of ['exercises', 'routines', 'programs', 'workouts']) {
    const l = local[key] || {};
    const r = remote[key] || {};
    const ids = new Set([...Object.keys(l), ...Object.keys(r)]);
    for (const id of ids) {
      const a = l[id];
      const b = r[id];
      if (a && b) {
        if ((b.updatedAt || 0) > (a.updatedAt || 0)) {
          merged[key][id] = b;
          changed = true;
        } else {
          merged[key][id] = a;
        }
      } else if (b) {
        merged[key][id] = b;
        changed = true;
      } else {
        merged[key][id] = a;
      }
    }
  }
  return { merged, changed };
}

/** Replace in-memory state with a merged document (used by Drive sync). */
export function adoptMerged(merged) {
  state = normalise(merged);
  return commit({ immediate: true });
}

/** The portion of state written to Drive — device-local fields stripped. */
export function syncPayload() {
  const s = getState();
  return {
    schemaVersion: SCHEMA_VERSION,
    app: 'workout-tracker',
    exportedAt: new Date().toISOString(),
    settings: s.settings,
    exercises: s.exercises,
    routines: s.routines,
    programs: s.programs,
    workouts: s.workouts,
  };
}

/** Import a file the user picked (export/restore path). */
export async function importDocument(doc) {
  const { merged } = mergeStates(getState(), doc);
  await adoptMerged(merged);
}
