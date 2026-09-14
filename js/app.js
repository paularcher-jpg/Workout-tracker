// App shell: tab routing, the persistent rest-timer bar, and sync scheduling.

import { loadState, getState, flush, subscribe } from './state.js';
import { h, clear, toast, relativeTime, icon } from './ui.js';
import * as Timer from './timer.js';
import * as Drive from './drive.js';
import * as W from './workout.js';

import * as train from './views/train.js';
import * as plan from './views/plan.js';
import * as history from './views/history.js';
import * as progress from './views/progress.js';
import * as settings from './views/settings.js';

const VIEWS = {
  train: { view: train, label: 'Train' },
  plan: { view: plan, label: 'Plan' },
  history: { view: history, label: 'History' },
  progress: { view: progress, label: 'Progress' },
  settings: { view: settings, label: 'Settings' },
};

let current = 'train';
let main = null;
let tabBar = null;
let lastSyncAttempt = 0;

/* ------------------------------------------------------------------ boot */

async function boot() {
  await loadState();

  const app = document.getElementById('app');
  clear(app);

  main = h('main', { id: 'main', class: 'main' });
  tabBar = buildTabBar();

  app.append(buildTopBar(), main, buildRestBar(), tabBar);

  Timer.configure({ sound: getState().settings.sound, vibrate: getState().settings.vibrate });
  Timer.restore();
  subscribe(() => {
    const s = getState().settings;
    Timer.configure({ sound: s.sound, vibrate: s.vibrate });
  });

  // iOS only lets us make noise after a real tap — unlock on the first one.
  const unlock = () => {
    Timer.primeAudio();
    document.removeEventListener('touchend', unlock);
    document.removeEventListener('click', unlock);
  };
  document.addEventListener('touchend', unlock, { once: true, passive: true });
  document.addEventListener('click', unlock, { once: true });

  const startTab = new URLSearchParams(location.search).get('tab');
  navigate(VIEWS[startTab] ? startTab : (W.activeWorkout() ? 'train' : 'train'));

  document.getElementById('splash')?.remove();
  document.body.classList.add('ready');

  registerServiceWorker();
  wireSync();
  wireSafetyNets();
}

/* ---------------------------------------------------------------- routing */

export function navigate(tab) {
  if (!VIEWS[tab]) tab = 'train';
  if (current && VIEWS[current]?.view.destroy) VIEWS[current].view.destroy();
  current = tab;
  paintTabs();
  render();
  main.scrollTo({ top: 0 });
  window.scrollTo(0, 0);
}

function render() {
  const { view } = VIEWS[current];
  view.render(main, { refresh: render, navigate });
  paintTabs();
}

function buildTabBar() {
  const nav = h('nav', { class: 'tabbar', role: 'tablist', 'aria-label': 'Sections' });
  for (const [key, meta] of Object.entries(VIEWS)) {
    nav.appendChild(h('button', {
      class: 'tab', type: 'button', role: 'tab', dataset: { tab: key },
      onclick: () => navigate(key),
    },
      h('span', { class: 'tab-icon' }, icon(key)),
      h('span', { class: 'tab-label' }, meta.label),
    ));
  }
  return nav;
}

function paintTabs() {
  const live = !!W.activeWorkout();
  for (const btn of tabBar.querySelectorAll('.tab')) {
    const on = btn.dataset.tab === current;
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
    // a session in progress has to be visible from every tab, not just Train
    if (btn.dataset.tab === 'train') btn.classList.toggle('live', live);
  }
}

/* ----------------------------------------------------------------- topbar */

let syncBadge = null;

function buildTopBar() {
  syncBadge = h('button', {
    class: 'sync-badge', type: 'button', 'aria-label': 'Sync status',
    onclick: async () => {
      if (!Drive.canSync()) { navigate('settings'); return; }
      try {
        await Drive.sync({ interactive: true });
        toast('Synced', 'success');
      } catch (err) {
        toast(err.message, 'error');
      }
    },
  });
  paintSyncBadge();
  return h('header', { class: 'topbar' },
    h('span', { class: 'brand' }, 'Workout Tracker'),
    syncBadge,
  );
}

function paintSyncBadge(state = null) {
  if (!syncBadge) return;
  const local = getState().local;
  if (!local.driveClientId) {
    syncBadge.textContent = 'Set up sync';
    syncBadge.className = 'sync-badge idle';
    return;
  }
  if (state === 'syncing') {
    syncBadge.textContent = 'Syncing…';
    syncBadge.className = 'sync-badge busy';
    return;
  }
  if (state === 'error' || (local.lastSyncError && !local.lastSyncAt)) {
    syncBadge.textContent = 'Sync issue';
    syncBadge.className = 'sync-badge bad';
    return;
  }
  if (!navigator.onLine) {
    syncBadge.textContent = 'Offline';
    syncBadge.className = 'sync-badge idle';
    return;
  }
  syncBadge.textContent = local.lastSyncAt ? `Synced ${relativeTime(local.lastSyncAt)}` : 'Sync now';
  syncBadge.className = 'sync-badge ok';
}

/* --------------------------------------------------------------- rest bar */

function buildRestBar() {
  const label = h('span', { class: 'rest-time' }, '0:00');
  const ring = h('div', { class: 'rest-fill' });

  const bar = h('div', { class: 'restbar', hidden: true, role: 'status', 'aria-live': 'polite' },
    ring,
    h('div', { class: 'restbar-inner' },
      h('button', { class: 'rest-adjust', type: 'button', 'aria-label': 'Subtract 15 seconds', onclick: () => Timer.adjust(-15) }, '−15'),
      h('div', { class: 'rest-main' }, h('span', { class: 'rest-caption' }, 'Rest'), label),
      h('button', { class: 'rest-adjust', type: 'button', 'aria-label': 'Add 15 seconds', onclick: () => Timer.adjust(15) }, '+15'),
      h('button', { class: 'rest-skip', type: 'button', onclick: () => Timer.stop() }, 'Skip'),
    ),
  );

  Timer.onTick((snap) => {
    bar.hidden = !snap.running;
    if (!snap.running) { document.body.classList.remove('resting'); return; }
    document.body.classList.add('resting');
    label.textContent = Timer.formatClock(snap.remainingSec);
    ring.style.transform = `scaleX(${Math.min(1, snap.progress).toFixed(4)})`;
    bar.classList.toggle('urgent', snap.remainingSec <= 10);
  });

  return bar;
}

/* -------------------------------------------------------------- sync glue */

function wireSync() {
  Drive.onStatus(({ status }) => {
    paintSyncBadge(status === 'syncing' ? 'syncing' : status === 'error' ? 'error' : null);
  });

  const attempt = (reason) => {
    if (!Drive.canSync() || !navigator.onLine) { paintSyncBadge(); return; }
    if (Date.now() - lastSyncAttempt < 20000 && reason !== 'manual') return;
    lastSyncAttempt = Date.now();
    Drive.sync({ interactive: false })
      .then(({ pulled }) => { if (pulled) render(); paintSyncBadge(); })
      .catch(() => paintSyncBadge()); // silent: the badge already shows it
  };

  attempt('load');
  document.addEventListener('wt:workout-saved', () => attempt('saved'));
  window.addEventListener('online', () => attempt('online'));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastSyncAttempt > 300000) attempt('visible');
  });
  setInterval(() => { if (!document.hidden) paintSyncBadge(); }, 30000);
}

/* ------------------------------------------------------------ safety nets */

function wireSafetyNets() {
  // Never lose a set because the browser was killed.
  const save = () => { flush(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('pagehide', save);
  window.addEventListener('beforeunload', (e) => {
    save();
    if (W.activeWorkout()) {
      // iOS ignores this, but desktop browsers will warn.
      e.preventDefault();
      e.returnValue = '';
    }
  });
  window.addEventListener('error', (e) => console.error('Unhandled error', e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => console.error('Unhandled rejection', e.reason));
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const go = () => {
    navigator.serviceWorker.register(new URL('../sw.js', import.meta.url), { scope: './' })
      .catch((err) => console.warn('Service worker registration failed', err));
  };
  // boot() is async, so the load event may already have fired by now.
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}

boot().catch((err) => {
  console.error(err);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '<div class="boot-error"><h1>Something went wrong</h1><p>Reload the page. Your data is stored on this device and has not been lost.</p></div>';
  }
});
