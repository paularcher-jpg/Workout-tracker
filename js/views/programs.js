// Browsing and starting a built-in program.
//
// A built-in program is just a plan in the same CSV the importer already
// reads, so everything here funnels into the same parsePlan/applyPlan pair a
// pasted plan uses. Nothing about a built-in plan is special once it lands.

import { h, clear, toast, openSheet } from '../ui.js';
import { upsert } from '../state.js';
import * as P from '../program.js';
import { parseCSVPlan, applyPlan, sessionList } from '../planparse.js';
import { PROGRAMS, GOALS } from '../programs/index.js';

const DAY_FILTERS = [0, 2, 3, 4, 5, 6];

function planOf(def) {
  const parsed = parseCSVPlan(def.csv, { name: def.name });
  // a single-phase plan otherwise takes its name from the phase column
  parsed.name = def.name;
  return parsed;
}

const sentenceCase = (text) => text.charAt(0).toUpperCase() + text.slice(1);

function metaLine(def, { full = false } = {}) {
  // the list rows stay on one line on a phone; "repeating" is explained in the
  // detail sheet, where there is room for it
  return [
    `${def.weeks} week${def.weeks === 1 ? '' : 's'}${full && def.repeat ? ' · repeating' : ''}`,
    `${def.days} day${def.days === 1 ? '' : 's'} a week`,
    sentenceCase(def.level),
    def.equipment,
  ].join(' · ');
}

/* ------------------------------------------------------------------ browse */

export function openProgramLibrary(refresh) {
  openSheet({
    title: 'Programs',
    fullHeight: true,
    render: (close) => {
      let goal = 'all';
      let days = 0;
      const wrap = h('div', { class: 'prog-browse' });

      const search = h('input', {
        class: 'input', type: 'search', placeholder: 'Search programs',
        autocomplete: 'off', enterkeyhint: 'search',
        oninput: () => draw(),
      });

      const goalChips = h('div', { class: 'chips' });
      const dayChips = h('div', { class: 'chips' });
      const count = h('p', { class: 'muted small' });
      const results = h('div', { class: 'picker-list' });

      const drawChips = () => {
        clear(goalChips);
        for (const g of [{ id: 'all', label: 'All' }, ...GOALS]) {
          goalChips.appendChild(h('button', {
            class: `chip${goal === g.id ? ' chip-on' : ''}`, type: 'button',
            'aria-pressed': goal === g.id ? 'true' : 'false',
            onclick: () => { goal = g.id; drawChips(); draw(); },
          }, g.label));
        }
        clear(dayChips);
        for (const d of DAY_FILTERS) {
          dayChips.appendChild(h('button', {
            class: `chip${days === d ? ' chip-on' : ''}`, type: 'button',
            'aria-pressed': days === d ? 'true' : 'false',
            onclick: () => { days = d; drawChips(); draw(); },
          }, d === 0 ? 'Any days' : `${d} days`));
        }
      };

      const draw = () => {
        const term = search.value.trim().toLowerCase();
        const matches = PROGRAMS
          .filter((p) => goal === 'all' || p.goal === goal)
          .filter((p) => !days || p.days === days)
          .filter((p) => !term
            || p.name.toLowerCase().includes(term)
            || p.summary.toLowerCase().includes(term)
            || p.equipment.toLowerCase().includes(term))
          .sort((a, b) => a.days - b.days || a.name.localeCompare(b.name));

        count.textContent = matches.length === 1
          ? '1 program'
          : `${matches.length} programs`;

        clear(results);
        if (!matches.length) {
          results.appendChild(h('p', { class: 'muted pad' }, 'Nothing matches those filters.'));
          return;
        }
        for (const def of matches) {
          results.appendChild(h('button', {
            class: 'picker-item', type: 'button',
            onclick: () => openProgramDetail(def, refresh, close),
          },
            h('span', { class: 'picker-name' }, def.name),
            h('span', { class: 'prog-summary' }, def.summary),
            h('span', { class: 'picker-meta' }, metaLine(def)),
          ));
        }
      };

      drawChips();
      draw();
      wrap.appendChild(search);
      wrap.appendChild(goalChips);
      wrap.appendChild(dayChips);
      wrap.appendChild(count);
      wrap.appendChild(results);
      return wrap;
    },
  });
}

/* ------------------------------------------------------------------ detail */

export function openProgramDetail(def, refresh, closeParent) {
  openSheet({
    title: def.name,
    fullHeight: true,
    render: (close) => {
      const plan = planOf(def);
      const sessions = sessionList(plan);
      const wrap = h('div', { class: 'prog-detail' });

      wrap.appendChild(h('p', { class: 'picker-meta' }, metaLine(def, { full: true })));
      for (const para of def.detail.split('\n\n')) {
        wrap.appendChild(h('p', { class: 'prog-para' }, para));
      }

      if (def.source) {
        wrap.appendChild(h('p', { class: 'prog-source' }, def.source));
      }

      const startInput = h('input', {
        class: 'input', type: 'date', value: P.toISODate(P.mondayOf(new Date())),
      });
      wrap.appendChild(h('label', { class: 'field-label' }, 'Start the week of'));
      wrap.appendChild(startInput);

      const preview = h('div', { class: 'plan-preview' });
      preview.appendChild(h('p', { class: 'plan-ok' },
        `${plan.weeks.length} week${plan.weeks.length === 1 ? '' : 's'} · `
        + `${sessions.length} session${sessions.length === 1 ? '' : 's'} · `
        + `${plan.totalExercises} exercises`));

      for (const session of sessions) {
        preview.appendChild(h('p', { class: 'plan-session' },
          h('strong', {}, session.name),
          ` — ${session.exercises.length} exercise${session.exercises.length === 1 ? '' : 's'}`));
      }

      const weeksBox = h('div', { class: 'plan-weeks' });
      plan.weeks.forEach((week, i) => {
        const named = week.days
          .map((key, day) => (key ? `${P.DAY_SHORT[day]} ${plan.sessions[key].name}` : null))
          .filter(Boolean);
        weeksBox.appendChild(h('p', { class: 'plan-session' },
          h('strong', {}, `Week ${i + 1}: `), named.join(' · ') || 'Rest'));
      });
      preview.appendChild(weeksBox);
      wrap.appendChild(preview);

      wrap.appendChild(h('button', {
        class: 'btn btn-primary btn-lg btn-block', type: 'button',
        onclick: () => {
          const { program, createdRoutines } = applyPlan(plan, { startDate: startInput.value });
          // applyPlan assumes a multi-week block runs once; the catalogue knows
          // which cycles are meant to loop and which finish
          if (program.repeat !== def.repeat) {
            upsert('programs', { ...program, repeat: def.repeat });
          }
          toast(`${def.name} added · ${createdRoutines.length} routines`);
          close();
          if (typeof closeParent === 'function') closeParent();
          refresh();
        },
      }, 'Use this program'));

      wrap.appendChild(h('p', { class: 'muted small' },
        'Your existing routines and history are left alone. You can edit any session afterwards.'));

      return wrap;
    },
  });
}
