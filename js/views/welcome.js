// Asking your name, once.
//
// There is no login, and none is needed: everything this app stores lives on
// the phone it is installed on, so a friend who opens the same link on their
// own phone starts with an empty app of their own. A name is all it takes to
// make it theirs.

import { h, openSheet } from '../ui.js';
import { getState, updateSettings, updateLocal, flush } from '../state.js';

export function displayName() {
  return String(getState().settings.name || '').trim();
}

/** Show the welcome sheet if this phone has never been asked for a name. */
export function maybeWelcome(refresh) {
  const s = getState();
  if (displayName() || s.local.askedName) return;
  openWelcome(refresh);
}

export function openWelcome(refresh) {
  openSheet({
    title: 'Welcome',
    // closing it any way at all counts as having been asked
    // saved at once, not on the usual short delay: this closes in the first
    // seconds of a first launch, when an app is most likely to be swiped away
    onClose: () => { updateLocal({ askedName: true }); flush(); },
    render: (close) => {
      const input = h('input', {
        class: 'input', type: 'text', id: 'welcome-name',
        placeholder: 'Your first name',
        autocomplete: 'given-name', autocapitalize: 'words', enterkeyhint: 'done',
        maxlength: 40,
        onkeydown: (e) => { if (e.key === 'Enter') save(); },
      });
      const save = () => {
        const name = input.value.trim();
        if (name) updateSettings({ name });
        close();
        if (typeof refresh === 'function') refresh();
      };
      queueMicrotask(() => input.focus());

      return h('div', { class: 'form welcome' },
        h('label', { class: 'field-label', for: 'welcome-name' }, 'What should we call you?'),
        input,
        h('p', { class: 'muted small' },
          'Your workouts stay on this phone and, if you turn on sync, in your own Google Drive. '
          + 'Sharing the link with a friend gives them an app of their own — nothing of yours goes with it.'),
        h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: save }, 'Continue'),
        h('button', { class: 'btn btn-quiet btn-block', type: 'button', onclick: close }, 'Skip for now'),
      );
    },
  });
}
