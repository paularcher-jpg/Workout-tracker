// Preferences, Google Drive sync setup, and backup/restore.

import { h, clear, toast, confirmSheet, openSheet, relativeTime } from '../ui.js';
import { getState, updateSettings, updateLocal, syncPayload, importDocument, flush, list, softDelete } from '../state.js';
import { keepAwake, wakeLockSupported } from '../wakelock.js';
import * as Drive from '../drive.js';
import { field } from './train.js';

export function destroy() {}

export function render(root, { refresh }) {
  clear(root);
  const s = getState();
  const wrap = h('div', { class: 'view' });

  wrap.appendChild(h('div', { class: 'hero' },
    h('h1', {}, 'Settings'),
  ));

  /* ---------------------------------------------------------- preferences */

  const unitSelect = h('select', {
    class: 'input',
    onchange: (e) => { updateSettings({ units: e.target.value }); toast('Units updated'); refresh(); },
  },
    h('option', { value: 'kg', selected: s.settings.units === 'kg' }, 'Kilograms (kg)'),
    h('option', { value: 'lb', selected: s.settings.units === 'lb' }, 'Pounds (lb)'),
  );

  const restInput = h('input', {
    class: 'input', type: 'number', inputmode: 'numeric', min: '0', step: '15',
    value: String(s.settings.defaultRestSec),
    onchange: (e) => { updateSettings({ defaultRestSec: Math.max(0, Number(e.target.value) || 0) }); toast('Saved'); },
  });

  const nameInput = h('input', {
    class: 'input', type: 'text', value: s.settings.name || '',
    placeholder: 'Your first name', autocomplete: 'given-name', autocapitalize: 'words', maxlength: 40,
    onchange: (e) => { updateSettings({ name: e.target.value.trim() }); toast('Saved'); },
  });

  wrap.appendChild(h('section', { class: 'card' },
    h('h3', {}, 'You'),
    field('Your name', nameInput, 'Used to greet you. Kept on this phone and in your own Google Drive.'),
  ));

  const awake = toggle('Keep the screen on while the app is open', s.local.keepAwake !== false, (v) => {
    updateLocal({ keepAwake: v });
    keepAwake(v);
  });
  if (!wakeLockSupported()) {
    awake.querySelector('input').disabled = true;
    awake.appendChild(h('span', { class: 'muted small switch-note' }, 'Not supported by this browser'));
  }

  wrap.appendChild(h('section', { class: 'card' },
    h('h3', {}, 'Preferences'),
    field('Units', unitSelect, 'Changing this does not convert numbers you already logged.'),
    field('Default rest', restInput, 'Used for new exercises that have no rest time of their own.'),
    toggle('Start rest timer automatically', s.settings.autoStartRest, (v) => updateSettings({ autoStartRest: v })),
    toggle('Sound when rest ends', s.settings.sound, (v) => { updateSettings({ sound: v }); }),
    toggle('Vibrate when rest ends', s.settings.vibrate, (v) => updateSettings({ vibrate: v })),
    awake,
  ));

  /* -------------------------------------------------------------- drive */

  wrap.appendChild(driveCard(refresh));

  /* ------------------------------------------------------------- backup */

  wrap.appendChild(h('section', { class: 'card' },
    h('h3', {}, 'Backup'),
    h('p', { class: 'muted small' }, 'A plain JSON file you can keep anywhere. Importing merges with what is already here — nothing is overwritten.'),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn btn-secondary', type: 'button', onclick: exportFile }, 'Export file'),
      h('button', { class: 'btn btn-secondary', type: 'button', onclick: () => importFile(refresh) }, 'Import file'),
    ),
  ));

  /* -------------------------------------------------------- custom data */

  const custom = list('exercises').filter((e) => e.custom);
  if (custom.length) {
    wrap.appendChild(h('section', { class: 'card' },
      h('h3', {}, 'Your custom exercises'),
      h('ul', { class: 'routine-items' },
        custom.sort((a, b) => a.name.localeCompare(b.name)).map((ex) => h('li', {},
          h('span', {}, ex.name),
          h('button', {
            class: 'icon-btn icon-danger', type: 'button', 'aria-label': `Delete ${ex.name}`,
            onclick: async () => {
              const ok = await confirmSheet({
                title: 'Delete exercise?',
                message: `“${ex.name}” will be removed from the list. Workouts you already logged keep their data.`,
                confirmLabel: 'Delete', danger: true,
              });
              if (ok) { softDelete('exercises', ex.id); refresh(); }
            },
          }, '×'),
        )),
      ),
    ));
  }

  /* ---------------------------------------------------------------- misc */

  wrap.appendChild(h('section', { class: 'card' },
    h('h3', {}, 'About'),
    h('p', { class: 'muted small' },
      'Your data lives on this device and, when sync is on, in a single file in your Google Drive. Nothing is sent anywhere else.'),
    h('p', { class: 'muted small' }, `Device ID ${s.local.deviceId.slice(0, 8)}`),
    h('button', {
      class: 'btn btn-quiet btn-block', type: 'button',
      onclick: async () => {
        const ok = await confirmSheet({
          title: 'Erase everything on this device?',
          message: 'All workouts, routines and settings stored here will be deleted. If sync is on, your Drive file is not touched and you can restore from it by connecting again.',
          confirmLabel: 'Erase', danger: true,
        });
        if (!ok) return;
        try {
          localStorage.clear();
          sessionStorage.clear();
          indexedDB.deleteDatabase('workout-tracker');
        } catch { /* ignore */ }
        setTimeout(() => location.reload(), 300);
      },
    }, 'Erase local data'),
  ));

  root.appendChild(wrap);
}

function toggle(label, value, onChange) {
  const input = h('input', {
    type: 'checkbox', class: 'switch-input', checked: !!value,
    onchange: (e) => onChange(e.target.checked),
  });
  return h('label', { class: 'switch' }, h('span', {}, label), input, h('span', { class: 'switch-track' }));
}

/* ------------------------------------------------------------ drive card */

function driveCard(refresh) {
  const s = getState();
  const card = h('section', { class: 'card' });
  card.appendChild(h('h3', {}, 'Google Drive sync'));

  const clientId = h('input', {
    class: 'input', type: 'text', value: s.local.driveClientId || '',
    placeholder: '….apps.googleusercontent.com',
    autocapitalize: 'off', autocorrect: 'off', spellcheck: false,
    onchange: (e) => { updateLocal({ driveClientId: e.target.value.trim() }); Drive.clearToken(); refresh(); },
  });

  const status = h('p', { class: 'sync-status' });
  const paint = () => {
    const st = getState().local;
    if (!st.driveClientId) status.textContent = 'Not set up. Add your Google client ID below to turn sync on.';
    else if (st.lastSyncError) { status.textContent = st.lastSyncError; status.className = 'sync-status is-error'; }
    else if (st.lastSyncAt) { status.textContent = `Last synced ${relativeTime(st.lastSyncAt)}.`; status.className = 'sync-status is-ok'; }
    else { status.textContent = 'Set up, but not synced yet. Tap Sync now.'; status.className = 'sync-status'; }
  };
  paint();

  card.appendChild(h('p', { class: 'muted small' },
    'Keeps one file — workout-tracker-data.json — in your Drive. The app can only see that one file, nothing else in your account.'));
  card.appendChild(status);

  card.appendChild(h('div', { class: 'btn-row' },
    h('button', {
      class: 'btn btn-primary', type: 'button',
      onclick: async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.textContent = 'Syncing…';
        try {
          await Drive.sync({ interactive: true });
          toast('Synced to Google Drive', 'success');
        } catch (err) {
          toast(err.message, 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Sync now';
          paint();
          refresh();
        }
      },
    }, 'Sync now'),
    getState().local.driveFileId
      ? h('button', {
        class: 'btn btn-quiet', type: 'button',
        onclick: async () => {
          const ok = await confirmSheet({
            title: 'Disconnect Drive?',
            message: 'Sync stops and this device signs out of Google. The file stays in your Drive and your workouts stay on this device.',
            confirmLabel: 'Disconnect',
          });
          if (ok) { await Drive.disconnect(); refresh(); toast('Disconnected'); }
        },
      }, 'Disconnect')
      : null,
  ));

  card.appendChild(field('Google client ID', clientId));
  card.appendChild(h('button', {
    class: 'btn btn-quiet btn-block btn-sm', type: 'button', onclick: showSetupHelp,
  }, 'How do I get a client ID?'));

  return card;
}

function showSetupHelp() {
  const origin = location.origin;
  openSheet({
    title: 'Connecting Google Drive',
    fullHeight: true,
    render: () => h('div', { class: 'help' },
      h('p', {}, 'This is a one-off, five-minute job. It gives this app permission to keep a single file in your own Drive.'),
      h('ol', {},
        h('li', {}, 'Go to ', h('a', { href: 'https://console.cloud.google.com/projectcreate', target: '_blank', rel: 'noopener' }, 'console.cloud.google.com'), ' and create a project (any name).'),
        h('li', {}, 'In the search bar, find ', h('strong', {}, 'Google Drive API'), ' and press Enable.'),
        h('li', {}, 'Open ', h('strong', {}, 'APIs & Services → OAuth consent screen'), '. Choose External, fill in an app name and your own email, and save. Add yourself as a test user, then press ', h('strong', {}, 'Publish app'), ' so sign-in does not expire every week.'),
        h('li', {}, 'Open ', h('strong', {}, 'Credentials → Create credentials → OAuth client ID'), '. Pick ', h('strong', {}, 'Web application'), '.'),
        h('li', {}, 'Under ', h('strong', {}, 'Authorised JavaScript origins'), ', add exactly:', h('code', { class: 'code-block' }, origin)),
        h('li', {}, 'Create it, copy the client ID, and paste it into the box in Settings.'),
      ),
      h('p', { class: 'muted small' }, 'The scope requested is drive.file, which only ever grants access to files this app itself creates. It cannot read the rest of your Drive.'),
    ),
  });
}

/* ---------------------------------------------------------------- backup */

async function exportFile() {
  await flush();
  const blob = new Blob([JSON.stringify(syncPayload(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workout-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importFile(refresh) {
  const input = h('input', { type: 'file', accept: 'application/json,.json', style: { display: 'none' } });
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const doc = JSON.parse(await file.text());
      if (!doc || typeof doc !== 'object' || !doc.workouts) throw new Error('Not a workout tracker file.');
      await importDocument(doc);
      refresh();
      toast('Imported and merged', 'success');
    } catch (err) {
      toast(err.message || 'Could not read that file', 'error');
    } finally {
      input.remove();
    }
  });
  document.body.appendChild(input);
  input.click();
}
