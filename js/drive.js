// Google Drive sync.
//
// Scope is drive.file — the app can only ever see the one file it creates, so
// it has no access to anything else in your Drive.
//
// Sync is download -> merge -> upload. The remote file is never blindly
// overwritten, so a session logged offline on your phone survives a sync from
// any other device.

import { getState, mergeStates, adoptMerged, syncPayload, updateLocal } from './state.js';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const FILE_NAME = 'workout-tracker-data.json';
const TOKEN_KEY = 'wt:gtoken';

let tokenClient = null;
let gisPromise = null;
let currentClientId = '';
let inFlight = null;
const listeners = new Set();

export function onStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(status, detail = {}) {
  for (const fn of listeners) {
    try { fn({ status, ...detail }); } catch (err) { console.error(err); }
  }
}

/* ------------------------------------------------------------------ token */

function readToken() {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw);
    if (t?.access_token && t.expiresAt > Date.now() + 30000) return t;
  } catch { /* ignore */ }
  return null;
}

function writeToken(access_token, expiresInSec) {
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify({
      access_token,
      expiresAt: Date.now() + (Number(expiresInSec) || 3600) * 1000,
    }));
  } catch { /* ignore */ }
}

export function clearToken() {
  try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

export function isConnected() {
  return !!readToken();
}

/* -------------------------------------------------------------- gis loader */

function loadGIS() {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not reach Google sign-in. Check your connection.'));
    document.head.appendChild(script);
    setTimeout(() => reject(new Error('Google sign-in timed out.')), 15000);
  });
  return gisPromise;
}

async function ensureClient(clientId) {
  if (!clientId) throw new Error('No Google client ID set. Add one in Settings.');
  await loadGIS();
  if (!tokenClient || currentClientId !== clientId) {
    currentClientId = clientId;
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: () => {}, // replaced per-request
    });
  }
  return tokenClient;
}

/**
 * @param {boolean} interactive show the Google consent popup if needed.
 */
export async function getAccessToken({ interactive = false } = {}) {
  const cached = readToken();
  if (cached) return cached.access_token;

  const clientId = (getState().local.driveClientId || '').trim();
  const client = await ensureClient(clientId);

  return new Promise((resolve, reject) => {
    let settled = false;
    client.callback = (resp) => {
      settled = true;
      if (resp.error) {
        return reject(new Error(describeAuthError(resp.error)));
      }
      writeToken(resp.access_token, resp.expires_in);
      resolve(resp.access_token);
    };
    client.error_callback = (err) => {
      settled = true;
      reject(new Error(describeAuthError(err?.type || 'popup_failed')));
    };
    try {
      // prompt:'' reuses an existing Google session silently where possible
      client.requestAccessToken({ prompt: interactive ? 'consent' : '' });
    } catch (err) {
      return reject(err);
    }
    setTimeout(() => {
      if (!settled) reject(new Error('Sign-in did not complete.'));
    }, 120000);
  });
}

function describeAuthError(code) {
  switch (code) {
    case 'popup_closed':
    case 'popup_closed_by_user':
      return 'Sign-in window was closed.';
    case 'popup_failed_to_open':
      return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.';
    case 'access_denied':
      return 'Access was declined.';
    case 'interaction_required':
      return 'Google needs you to sign in again — tap Connect.';
    default:
      return `Google sign-in failed (${code}).`;
  }
}

/* --------------------------------------------------------------- drive api */

async function api(url, { token, ...init } = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) },
  });
  if (res.status === 401) {
    clearToken();
    const err = new Error('Google session expired — tap Connect to sign in again.');
    err.code = 401;
    throw err;
  }
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.error?.message || ''; } catch { /* ignore */ }
    throw new Error(`Drive error ${res.status}${detail ? `: ${detail}` : ''}`);
  }
  return res;
}

async function findFile(token) {
  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name,modifiedTime)&pageSize=10`;
  const res = await api(url, { token });
  const data = await res.json();
  return data.files?.[0] || null;
}

async function createFile(token, body) {
  const boundary = 'wt' + Math.random().toString(36).slice(2);
  const metadata = { name: FILE_NAME, mimeType: 'application/json', description: 'Workout Tracker data — managed by the app.' };
  const payload =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${body}\r\n` +
    `--${boundary}--`;
  const res = await api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime', {
    token,
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: payload,
  });
  return res.json();
}

async function updateFile(token, fileId, body) {
  const res = await api(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,modifiedTime`, {
    token,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  return res.json();
}

async function downloadFile(token, fileId) {
  const res = await api(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { token });
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('The file in Drive is not readable. Rename or remove it and sync again.');
  }
}

/* ------------------------------------------------------------------- sync */

export function canSync() {
  return !!(getState().local.driveClientId || '').trim();
}

/**
 * Full sync cycle. Safe to call often; concurrent calls share one run.
 * @param {boolean} interactive allow a sign-in popup (must come from a tap).
 */
export function sync({ interactive = false } = {}) {
  if (inFlight) return inFlight;
  inFlight = runSync({ interactive }).finally(() => { inFlight = null; });
  return inFlight;
}

async function runSync({ interactive }) {
  if (!canSync()) {
    const err = new Error('Google Drive is not set up yet.');
    emit('error', { message: err.message });
    throw err;
  }
  if (!navigator.onLine) {
    const err = new Error('Offline — your workouts are saved on this device and will sync later.');
    emit('offline', { message: err.message });
    throw err;
  }

  emit('syncing');
  try {
    const token = await getAccessToken({ interactive });

    let fileId = getState().local.driveFileId;
    if (fileId) {
      // verify it still exists (user may have deleted it)
      try {
        await api(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,trashed`, { token })
          .then((r) => r.json())
          .then((meta) => { if (meta.trashed) fileId = ''; });
      } catch (err) {
        if (err.code === 401) throw err;
        fileId = '';
      }
    }
    if (!fileId) {
      const found = await findFile(token);
      fileId = found?.id || '';
    }

    let remote = null;
    if (fileId) remote = await downloadFile(token, fileId);

    const { merged, changed } = mergeStates(getState(), remote);
    if (changed) await adoptMerged(merged);

    const body = JSON.stringify(syncPayload(), null, 0);
    const result = fileId ? await updateFile(token, fileId, body) : await createFile(token, body);

    updateLocal({ driveFileId: result.id, lastSyncAt: Date.now(), lastSyncError: '' });
    emit('synced', { at: Date.now(), pulled: changed });
    return { ok: true, pulled: changed };
  } catch (err) {
    updateLocal({ lastSyncError: err.message });
    emit('error', { message: err.message });
    throw err;
  }
}

export async function disconnect() {
  const token = readToken();
  clearToken();
  if (token?.access_token && window.google?.accounts?.oauth2) {
    try { google.accounts.oauth2.revoke(token.access_token, () => {}); } catch { /* ignore */ }
  }
  updateLocal({ driveFileId: '', lastSyncAt: 0, lastSyncError: '' });
}

export { FILE_NAME };
