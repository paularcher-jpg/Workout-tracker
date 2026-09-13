// Rest timer. Deadline-based rather than tick-counting, so it stays accurate
// when iOS suspends the tab between sets, and it survives an app reload.

const LS_KEY = 'wt:rest';

let deadline = 0;
let total = 0;
let raf = null;
let audioCtx = null;
let primed = false;
let fired = false;
let wakeLock = null;
const listeners = new Set();

export function onTick(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  const payload = snapshot();
  for (const fn of listeners) {
    try { fn(payload); } catch (err) { console.error(err); }
  }
}

export function snapshot() {
  const remaining = deadline ? Math.max(0, deadline - Date.now()) : 0;
  return {
    running: deadline > 0,
    remainingMs: remaining,
    remainingSec: Math.ceil(remaining / 1000),
    totalSec: total,
    progress: total > 0 ? 1 - remaining / (total * 1000) : 0,
  };
}

/**
 * Unlock audio playback. iOS only allows sound from a real user gesture, so
 * this is called on the first tap anywhere in the app.
 */
export function primeAudio() {
  if (primed) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
    const buf = audioCtx.createBuffer(1, 1, 22050);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    src.start(0);
    primed = true;
  } catch { /* no audio available */ }
}

function beep(times = 3) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  const start = audioCtx.currentTime;
  for (let i = 0; i < times; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const t = start + i * 0.28;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(i === times - 1 ? 1180 : 880, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }
}

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch { /* unsupported or denied */ }
}

function releaseWakeLock() {
  try { wakeLock?.release(); } catch { /* ignore */ }
  wakeLock = null;
}

let opts = { sound: true, vibrate: true };
export function configure(next) {
  opts = { ...opts, ...next };
}

export function start(seconds) {
  const secs = Math.max(0, Math.round(Number(seconds) || 0));
  if (secs === 0) return stop();
  total = secs;
  deadline = Date.now() + secs * 1000;
  fired = false;
  persist();
  requestWakeLock();
  loop();
  emit();
}

export function adjust(deltaSec) {
  if (!deadline) return;
  deadline = Math.max(Date.now(), deadline + deltaSec * 1000);
  total = Math.max(1, total + deltaSec);
  fired = false;
  persist();
  emit();
}

export function stop() {
  deadline = 0;
  total = 0;
  fired = false;
  cancelAnimationFrame(raf);
  raf = null;
  releaseWakeLock();
  try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  emit();
}

function complete() {
  if (fired) return;
  fired = true;
  if (opts.sound) beep(3);
  if (opts.vibrate && navigator.vibrate) navigator.vibrate([220, 90, 220, 90, 320]);
  notify();
  releaseWakeLock();
}

function notify() {
  try {
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      new Notification('Rest complete', { body: 'Next set is ready.', tag: 'wt-rest', silent: false });
    }
  } catch { /* ignore */ }
}

function loop() {
  cancelAnimationFrame(raf);
  const step = () => {
    const snap = snapshot();
    emit();
    if (!snap.running) return;
    if (snap.remainingMs <= 0) {
      complete();
      deadline = 0;
      try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
      emit();
      return;
    }
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ deadline, total }));
  } catch { /* ignore */ }
}

/** Re-attach to a timer that was running before a reload or backgrounding. */
export function restore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved?.deadline > Date.now()) {
      deadline = saved.deadline;
      total = saved.total || Math.ceil((deadline - Date.now()) / 1000);
      fired = false;
      loop();
      emit();
    } else {
      localStorage.removeItem(LS_KEY);
    }
  } catch { /* ignore */ }
}

// iOS throttles rAF in background tabs; re-check the moment we come back.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    if (deadline && Date.now() >= deadline) {
      complete();
      deadline = 0;
      emit();
    } else if (deadline) {
      requestWakeLock();
      loop();
    }
  }
});

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}
