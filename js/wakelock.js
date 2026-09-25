// Keeps the screen on while the app is open, so a phone propped on a bench
// does not lock itself between sets.
//
// The browser drops a wake lock every time the page is hidden — switching
// apps, locking the phone — so it has to be taken again whenever the app comes
// back. Safari can also refuse the first request until the page has been
// tapped, so a refused request is retried on the next tap rather than given up.

let sentinel = null;
let pending = null;
let wanted = false;
let listening = false;

export function wakeLockSupported() {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

export function isAwake() {
  return !!sentinel && !sentinel.released;
}

async function acquire() {
  if (!wanted || !wakeLockSupported() || document.visibilityState !== 'visible') return;
  if (isAwake() || pending) return;
  pending = navigator.wakeLock.request('screen')
    .then((lock) => {
      sentinel = lock;
      lock.addEventListener('release', () => { if (sentinel === lock) sentinel = null; });
      // turned off while the request was in flight
      if (!wanted) lock.release().catch(() => {});
    })
    .catch(() => { sentinel = null; })   // refused; the next tap tries again
    .finally(() => { pending = null; });
  await pending;
}

function onVisibility() {
  if (document.visibilityState === 'visible') acquire();
}

function onTap() {
  if (wanted && !isAwake()) acquire();
}

/** Turn keeping the screen on on or off. Safe to call repeatedly. */
export function keepAwake(on) {
  wanted = !!on;
  if (!listening && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('pointerdown', onTap, { passive: true });
    listening = true;
  }
  if (wanted) return acquire();
  if (sentinel) sentinel.release().catch(() => {});
  sentinel = null;
  return Promise.resolve();
}
