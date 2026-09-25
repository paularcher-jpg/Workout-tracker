// Offline shell cache. The app's data never goes through here — that lives in
// IndexedDB — so a stale cache can only ever affect the code, not your logs.

const VERSION = 'v3.6.0';
const CACHE = `workout-tracker-${VERSION}`;

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/app.css',
  './js/app.js',
  './js/state.js',
  './js/workout.js',
  './js/exercises.js',
  './js/timer.js',
  './js/wakelock.js',
  './js/charts.js',
  './js/drive.js',
  './js/ui.js',
  './js/program.js',
  './js/planparse.js',
  './js/xlsx.js',
  './js/views/train.js',
  './js/views/plan.js',
  './js/views/routines.js',
  './js/views/history.js',
  './js/views/progress.js',
  './js/views/settings.js',
  './js/views/programs.js',
  './js/views/setup.js',
  './js/views/welcome.js',
  './js/programs/index.js',
  './js/programs/periodise.js',
  './js/programs/strength.js',
  './js/programs/muscle.js',
  './js/programs/endurance.js',
  './js/programs/minimal.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // addAll goes through the browser's HTTP cache by default, so a host that
      // sends max-age can hand a brand new cache the files it is replacing.
      // Forcing a revalidated fetch is what makes a version bump mean anything.
      .then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Google sign-in and the Drive API must always go to the network.
  if (url.origin !== self.location.origin) return;

  // Navigations: try the network so updates land, fall back to the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./'))),
    );
    return;
  }

  // Assets: cache first, refresh in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
