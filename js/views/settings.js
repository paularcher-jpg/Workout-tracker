// Preferences, Google Drive sync setup, and backup/restore.

import { h, clear, toast, confirmSheet, openSheet, relativeTime } from '../ui.js';
import {
  getState, updateSettings, updateLocal, syncPayload, importDocument, flush, list, get, softDelete, upsert,
  adoptBuiltInsNow,
} from '../state.js';
import { nameKey, aliasId } from '../exercises.js';
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
  if (custom.length) wrap.appendChild(customExercisesCard(custom, refresh));

  /* ---------------------------------------------------------------- misc */

  wrap.appendChild(h('section', { class: 'card' },
    h('h3', {}, 'About'),
    h('p', { class: 'muted small' },
      'Your data lives on this device and, when sync is on, in a single file in your Google Drive. Nothing is sent anywhere else.'),
    h('p', { class: 'muted small' },
      h('a', { href: './privacy.html', target: '_blank', rel: 'noopener' }, 'Privacy policy')),
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

/* ---------------------------------------------------- custom exercises */

/** Routines that use an exercise. */
function routinesUsing(exerciseId) {
  return list('routines').filter((r) => (r.items || []).some((i) => i.exerciseId === exerciseId));
}

function customExercisesCard(custom, refresh) {
  const card = h('section', { class: 'card' },
    h('h3', {}, 'Your custom exercises'),
    h('p', { class: 'muted small' },
      'Exercises you added that are not in the app’s library. Renaming keeps their history; '
      + 'rename one to a name the library has and it is merged in.'),
  );
  const listEl = h('ul', { class: 'custom-list' });
  for (const ex of custom.sort((a, b) => a.name.localeCompare(b.name))) {
    const used = routinesUsing(ex.id);
    listEl.appendChild(h('li', { class: 'plan-row' },
      h('div', { class: 'plan-row-text' },
        h('p', { class: 'plan-row-name' }, ex.name),
        h('p', { class: 'muted small' }, used.length
          ? `In ${used.length} routine${used.length === 1 ? '' : 's'}`
          : 'Not in any routine'),
      ),
      h('div', { class: 'plan-row-actions' },
        h('button', {
          class: 'btn btn-sm btn-quiet', type: 'button', 'aria-label': `Rename ${ex.name}`,
          onclick: () => openRename(ex, refresh),
        }, 'Rename'),
        h('button', {
          class: 'btn btn-sm btn-quiet plan-remove', type: 'button', 'aria-label': `Delete ${ex.name}`,
          onclick: () => openDelete(ex, refresh),
        }, 'Delete'),
      ),
    ));
  }
  card.appendChild(listEl);
  return card;
}

/**
 * Deleting an exercise a routine still uses would leave a nameless blank in
 * that routine, so it is refused, with the routines named and renaming offered.
 */
function openDelete(ex, refresh) {
  const used = routinesUsing(ex.id);
  if (used.length) {
    openSheet({
      title: `${ex.name} is in use`,
      render: (close) => h('div', { class: 'confirm' },
        h('p', {}, used.length === 1 ? 'It is part of this routine:' : 'It is part of these routines:'),
        h('ul', { class: 'in-use-list' }, used.map((r) => h('li', {}, r.name))),
        h('p', { class: 'muted small' },
          'Deleting it would leave a blank in each of them. Take it out of those routines first, '
          + 'or rename it instead.'),
        h('div', { class: 'confirm-stack' },
          h('button', {
            class: 'btn btn-secondary btn-block', type: 'button',
            onclick: () => { close(); openRename(ex, refresh); },
          }, 'Rename instead'),
          h('button', { class: 'btn btn-ghost btn-block', type: 'button', onclick: close }, 'OK'),
        ),
      ),
    });
    return;
  }
  confirmSheet({
    title: 'Delete exercise?',
    message: `“${ex.name}” will be removed from the list. Workouts you already logged keep their data.`,
    confirmLabel: 'Delete', danger: true,
  }).then((ok) => { if (ok) { softDelete('exercises', ex.id); refresh(); } });
}

/**
 * Rename keeps the id, so history stays attached. A name the library already
 * has is a merge rather than a rename, and says so before doing it.
 */
function openRename(ex, refresh) {
  openSheet({
    title: 'Rename exercise',
    render: (close) => {
      const input = h('input', {
        class: 'input', type: 'text', id: 'rename-exercise', value: ex.name, maxlength: 60,
        autocapitalize: 'words', enterkeyhint: 'done',
        onkeydown: (e) => { if (e.key === 'Enter') save(); },
      });

      const save = () => {
        const name = input.value.trim().replace(/\s+/g, ' ');
        if (!name || name === ex.name) { close(); return; }

        const clash = list('exercises').find((e) => e.id !== ex.id && nameKey(e.name) === nameKey(name));
        if (clash?.custom) {
          toast(`You already have an exercise called ${clash.name}`, 'error');
          return;
        }
        const target = get('exercises', clash ? clash.id : aliasId(name));
        if (target && !target.custom) {
          confirmSheet({
            title: `Merge into ${target.name}?`,
            message: `${target.name} is already in the app. ${ex.name} will be folded into it, `
              + `and everything you logged as ${ex.name} moves across.`,
            confirmLabel: 'Merge',
          }).then((ok) => {
            if (!ok) return;
            upsert('exercises', { ...ex, name });   // the library name is what triggers the merge
            adoptBuiltInsNow();
            close();
            refresh();
            toast(`Merged into ${target.name}`, 'success');
          });
          return;
        }

        upsert('exercises', { ...ex, name });
        close();
        refresh();
        toast('Renamed');
      };

      queueMicrotask(() => { input.focus(); input.select(); });
      return h('div', { class: 'form' },
        h('label', { class: 'field-label', for: 'rename-exercise' }, 'Name'),
        input,
        h('p', { class: 'muted small' }, 'Everything you have logged stays with it.'),
        h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: save }, 'Save'),
      );
    },
  });
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
