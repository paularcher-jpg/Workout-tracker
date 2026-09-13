// DOM helpers, sheets, toasts and formatting shared by all views.

import { list, getState } from './state.js';
import { MUSCLE_GROUPS } from './exercises.js';

/* -------------------------------------------------------------- dom helper */

export function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'html') node.innerHTML = value;
    else if (key in node && key !== 'list') node[key] = value;
    else node.setAttribute(key, String(value));
  }
  append(node, children);
  return node;
}

function append(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/* ------------------------------------------------------------- formatting */

export function units() {
  return getState().settings.units;
}

export function fmtWeight(value, { withUnit = true } = {}) {
  const n = Number(value) || 0;
  const rounded = Math.round(n * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return withUnit ? `${text} ${units()}` : text;
}

export function fmtVolume(value) {
  const n = Math.round(Number(value) || 0);
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k ${units()}`;
  return `${n} ${units()}`;
}

export function fmtDuration(ms) {
  const mins = Math.max(0, Math.round((Number(ms) || 0) / 60000));
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function fmtDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const yest = new Date(today.getTime() - 86400000).toDateString() === d.toDateString();
  if (sameDay) return `Today, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  if (yest) return `Yesterday, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  return d.toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short',
    year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
}

export function relativeTime(ts) {
  if (!ts) return 'never';
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

/* ------------------------------------------------------------------ toast */

let toastTimer = null;
export function toast(message, kind = 'info') {
  const host = document.getElementById('toast');
  if (!host) return;
  host.textContent = message;
  host.className = `toast toast-${kind} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { host.className = 'toast'; }, kind === 'error' ? 4800 : 2600);
}

/* ------------------------------------------------------------------ sheet */

// Sheets stack: opening the exercise picker from inside the routine editor
// must not destroy the editor underneath it.
const sheetStack = [];

export function closeAllSheets() {
  [...sheetStack].reverse().forEach((entry) => entry.close());
}

/**
 * Bottom sheet modal. `render(close)` returns the body content.
 * @returns {() => void} close function
 */
export function openSheet({ title, render, fullHeight = false, onClose } = {}) {
  const depth = sheetStack.length;
  const backdrop = h('div', { class: 'sheet-backdrop', style: { zIndex: String(40 + depth * 2) } });
  const sheet = h('div', {
    class: `sheet${fullHeight ? ' sheet-full' : ''}`,
    style: { zIndex: String(41 + depth * 2) },
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title || 'Dialog',
  });

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    const i = sheetStack.indexOf(entry);
    if (i >= 0) sheetStack.splice(i, 1);
    backdrop.classList.remove('open');
    sheet.classList.remove('open');
    setTimeout(() => { backdrop.remove(); sheet.remove(); }, 200);
    document.removeEventListener('keydown', onKey);
    if (typeof onClose === 'function') onClose();
  };

  const onKey = (e) => {
    // only the topmost sheet reacts to Escape
    if (e.key === 'Escape' && sheetStack.at(-1) === entry) close();
  };

  const entry = { close, sheet };
  sheetStack.push(entry);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  sheet.appendChild(h('header', { class: 'sheet-head' },
    h('div', { class: 'sheet-grip' }),
    title ? h('h2', {}, title) : null,
    h('button', { class: 'sheet-close', type: 'button', 'aria-label': 'Close', onclick: close }, '\u00d7'),
  ));

  const body = h('div', { class: 'sheet-body' });
  sheet.appendChild(body);
  append(body, [render(close)]);

  document.body.appendChild(backdrop);
  document.body.appendChild(sheet);
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
    sheet.classList.add('open');
  });
  return close;
}

export function confirmSheet({ title, message, confirmLabel = 'Confirm', danger = false }) {
  return new Promise((resolve) => {
    let answer = false;
    openSheet({
      title,
      onClose: () => resolve(answer),
      render: (close) => h('div', { class: 'confirm' },
        h('p', {}, message),
        h('div', { class: 'confirm-actions' },
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: close }, 'Cancel'),
          h('button', {
            class: `btn ${danger ? 'btn-danger' : 'btn-primary'}`,
            type: 'button',
            onclick: () => { answer = true; close(); },
          }, confirmLabel),
        ),
      ),
    });
  });
}

/* -------------------------------------------------------- exercise picker */

/**
 * Searchable exercise list. Resolves with an exercise id, or null if dismissed.
 * `onCreate(name)` should resolve with a new exercise record, or null.
 */
export function pickExercise({ title = 'Add exercise', onCreate } = {}) {
  return new Promise((resolve) => {
    let chosen = null;

    openSheet({
      title,
      fullHeight: true,
      onClose: () => resolve(chosen),
      render: (close) => {
        const results = h('div', { class: 'picker-list' });
        const search = h('input', {
          class: 'input picker-search',
          type: 'search',
          placeholder: 'Search exercises',
          autocomplete: 'off',
          enterkeyhint: 'search',
        });
        const filters = h('div', { class: 'chips' });

        let group = 'All';
        const groups = ['All', ...MUSCLE_GROUPS];

        const draw = () => {
          const term = search.value.trim().toLowerCase();
          const matches = list('exercises')
            .filter((ex) => group === 'All' || ex.group === group)
            .filter((ex) => !term || ex.name.toLowerCase().includes(term) || ex.equipment.toLowerCase().includes(term))
            .sort((a, b) => a.name.localeCompare(b.name));

          clear(results);
          if (!matches.length) results.appendChild(h('p', { class: 'muted pad' }, 'No matches.'));

          for (const ex of matches) {
            results.appendChild(h('button', {
              class: 'picker-item',
              type: 'button',
              onclick: () => { chosen = ex.id; close(); },
            },
              h('span', { class: 'picker-name' }, ex.name),
              h('span', { class: 'picker-meta' }, `${ex.group} \u00b7 ${ex.equipment}`),
            ));
          }

          if (onCreate) {
            const typed = search.value.trim();
            results.appendChild(h('button', {
              class: 'picker-item picker-create',
              type: 'button',
              onclick: async () => {
                const created = await onCreate(typed);
                if (created) { chosen = created.id; close(); }
                else draw();
              },
            }, h('span', { class: 'picker-name' }, typed ? `Create \u201c${typed}\u201d` : 'Create a new exercise')));
          }
        };

        for (const g of groups) {
          filters.appendChild(h('button', {
            class: `chip${g === group ? ' chip-on' : ''}`,
            type: 'button',
            onclick: (e) => {
              group = g;
              filters.querySelectorAll('.chip').forEach((c) => c.classList.remove('chip-on'));
              e.currentTarget.classList.add('chip-on');
              draw();
            },
          }, g));
        }

        search.addEventListener('input', draw);
        draw();
        setTimeout(() => search.focus(), 220);
        return h('div', { class: 'picker' }, search, filters, results);
      },
    });
  });
}

const ICONS = {
  train: '<rect x="2" y="9.5" width="2.6" height="5" rx="1.1"/><rect x="5.2" y="7" width="3" height="10" rx="1.2"/><path d="M8.6 12h6.8"/><rect x="15.8" y="7" width="3" height="10" rx="1.2"/><rect x="19.4" y="9.5" width="2.6" height="5" rx="1.1"/>',
  routines: '<circle cx="4.5" cy="6.5" r="1.4"/><circle cx="4.5" cy="12" r="1.4"/><circle cx="4.5" cy="17.5" r="1.4"/><path d="M9 6.5h11M9 12h11M9 17.5h11"/>',
  history: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none"/>',
  progress: '<path d="M3 17.5l5.5-5.5 3.5 3.5L21 7"/><path d="M16 7h5v5"/>',
  settings: '<path d="M3 7.5h16M3 16.5h16"/><circle cx="9" cy="7.5" r="2.6"/><circle cx="15" cy="16.5" r="2.6"/>',
};

/** Inline stroke icon, inheriting the current text colour. */
export function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = ICONS[name] || '';
  return svg;
}

export function emptyState(glyph, title, body, action) {
  return h('div', { class: 'empty' },
    h('div', { class: 'empty-icon' }, glyph),
    h('h3', {}, title),
    body ? h('p', {}, body) : null,
    action || null,
  );
}

export function sectionTitle(text, right) {
  return h('div', { class: 'section-title' }, h('h2', {}, text), right || null);
}
