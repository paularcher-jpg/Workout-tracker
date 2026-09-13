// Reusable workout templates. Starting a session from one pre-fills every
// exercise with your last weights.

import { h, clear, toast, pickExercise, confirmSheet, openSheet, emptyState } from '../ui.js';
import { list, get, upsert, softDelete, uid } from '../state.js';
import { formatClock } from '../timer.js';
import * as W from '../workout.js';
import { openCreateExercise, field } from './train.js';

export function destroy() {}

export function render(root, { refresh, navigate }) {
  clear(root);
  const routines = list('routines').sort((a, b) => a.name.localeCompare(b.name));
  const wrap = h('div', { class: 'view' });

  wrap.appendChild(h('div', { class: 'hero' },
    h('h1', {}, 'Routines'),
    h('p', { class: 'muted' }, 'Templates for the sessions you repeat.'),
  ));

  wrap.appendChild(h('button', {
    class: 'btn btn-primary btn-block',
    type: 'button',
    onclick: () => editRoutine(null, refresh),
  }, '+ New routine'));

  if (!routines.length) {
    wrap.appendChild(emptyState('📋', 'No routines yet',
      'Create one for each training day — Push, Pull, Legs, or whatever you follow.'));
  }

  for (const r of routines) {
    const items = (r.items || []).map((i) => ({ ...i, exercise: get('exercises', i.exerciseId) })).filter((i) => i.exercise);
    wrap.appendChild(h('section', { class: 'card' },
      h('div', { class: 'card-head' },
        h('h3', {}, r.name),
        h('button', {
          class: 'icon-btn', type: 'button', 'aria-label': `Options for ${r.name}`,
          onclick: () => routineMenu(r, refresh),
        }, '⋯'),
      ),
      h('ul', { class: 'routine-items' },
        items.map((i) => h('li', {},
          h('span', {}, i.exercise.name),
          h('span', { class: 'muted small' }, `${i.sets}×${i.reps || '—'} · ${formatClock(i.restSec ?? i.exercise.restSec)} rest`),
        )),
      ),
      h('button', {
        class: 'btn btn-secondary btn-block',
        type: 'button',
        onclick: () => {
          if (W.activeWorkout()) { toast('Finish your current workout first', 'error'); return; }
          upsert('routines', { ...r, lastUsedAt: Date.now() });
          W.startWorkout({ routineId: r.id });
          navigate('train');
        },
      }, 'Start this routine'),
    ));
  }

  root.appendChild(wrap);
}

function routineMenu(routine, refresh) {
  openSheet({
    title: routine.name,
    render: (close) => h('div', { class: 'menu' },
      h('button', { class: 'menu-item', type: 'button', onclick: () => { close(); editRoutine(routine, refresh); } }, 'Edit'),
      h('button', {
        class: 'menu-item', type: 'button',
        onclick: () => {
          close();
          upsert('routines', { ...routine, id: uid(), name: `${routine.name} copy`, lastUsedAt: 0 });
          refresh();
          toast('Duplicated');
        },
      }, 'Duplicate'),
      h('button', {
        class: 'menu-item menu-danger', type: 'button',
        onclick: async () => {
          close();
          const ok = await confirmSheet({
            title: 'Delete routine?',
            message: `“${routine.name}” will be removed. Past workouts you logged with it are kept.`,
            confirmLabel: 'Delete', danger: true,
          });
          if (ok) { softDelete('routines', routine.id); refresh(); toast('Routine deleted'); }
        },
      }, 'Delete'),
    ),
  });
}

function editRoutine(routine, refresh) {
  const draft = routine
    ? { ...routine, items: (routine.items || []).map((i) => ({ ...i })) }
    : { id: uid(), name: '', items: [], lastUsedAt: 0 };

  openSheet({
    title: routine ? 'Edit routine' : 'New routine',
    fullHeight: true,
    render: (close) => {
      const nameInput = h('input', {
        class: 'input', value: draft.name, placeholder: 'e.g. Push day', autocomplete: 'off',
        oninput: (e) => { draft.name = e.target.value; },
      });

      const itemsEl = h('div', { class: 'editor-items' });

      const drawItems = () => {
        clear(itemsEl);
        if (!draft.items.length) {
          itemsEl.appendChild(h('p', { class: 'muted pad' }, 'No exercises added yet.'));
        }
        draft.items.forEach((item, index) => {
          const ex = get('exercises', item.exerciseId);
          if (!ex) return;
          itemsEl.appendChild(h('div', { class: 'editor-item' },
            h('div', { class: 'editor-item-head' },
              h('strong', {}, ex.name),
              h('div', { class: 'editor-item-actions' },
                h('button', {
                  class: 'icon-btn', type: 'button', 'aria-label': 'Move up', disabled: index === 0,
                  onclick: () => { swap(draft.items, index, index - 1); drawItems(); },
                }, '↑'),
                h('button', {
                  class: 'icon-btn', type: 'button', 'aria-label': 'Move down', disabled: index === draft.items.length - 1,
                  onclick: () => { swap(draft.items, index, index + 1); drawItems(); },
                }, '↓'),
                h('button', {
                  class: 'icon-btn icon-danger', type: 'button', 'aria-label': 'Remove',
                  onclick: () => { draft.items.splice(index, 1); drawItems(); },
                }, '×'),
              ),
            ),
            h('div', { class: 'editor-item-grid' },
              miniField('Sets', h('input', {
                class: 'input input-sm', type: 'number', inputmode: 'numeric', min: '1', max: '20', value: String(item.sets),
                oninput: (e) => { item.sets = Math.max(1, Number(e.target.value) || 1); },
              })),
              miniField('Reps', h('input', {
                class: 'input input-sm', type: 'number', inputmode: 'numeric', min: '1', value: String(item.reps || ''), placeholder: '—',
                oninput: (e) => { item.reps = e.target.value === '' ? '' : Math.max(1, Number(e.target.value) || 1); },
              })),
              miniField('Rest (s)', h('input', {
                class: 'input input-sm', type: 'number', inputmode: 'numeric', min: '0', step: '15', value: String(item.restSec),
                oninput: (e) => { item.restSec = Math.max(0, Number(e.target.value) || 0); },
              })),
            ),
          ));
        });
      };
      drawItems();

      const addBtn = h('button', {
        class: 'btn btn-secondary btn-block', type: 'button',
        onclick: async () => {
          const id = await pickExercise({ title: 'Add to routine', onCreate: (n) => openCreateExercise(n) });
          if (!id) return;
          const ex = get('exercises', id);
          draft.items.push({ exerciseId: id, sets: 3, reps: 8, restSec: ex?.restSec ?? 120 });
          drawItems();
        },
      }, '+ Add exercise');

      return h('div', { class: 'form' },
        field('Routine name', nameInput),
        itemsEl,
        addBtn,
        h('button', {
          class: 'btn btn-primary btn-block', type: 'button',
          onclick: () => {
            if (!draft.name.trim()) { toast('Give the routine a name', 'error'); return; }
            if (!draft.items.length) { toast('Add at least one exercise', 'error'); return; }
            upsert('routines', { ...draft, name: draft.name.trim() });
            close();
            refresh();
            toast('Routine saved', 'success');
          },
        }, 'Save routine'),
      );
    },
  });
}

function miniField(label, control) {
  return h('label', { class: 'mini-field' }, h('span', {}, label), control);
}

function swap(arr, a, b) {
  [arr[a], arr[b]] = [arr[b], arr[a]];
}
