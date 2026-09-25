// Setting a plan up for a real week.
//
// A plan arrives laid out on the days its author chose. Almost nobody trains
// on exactly those days, so before anything lands on the calendar this asks
// which days you can actually train and moves the sessions there — keeping
// their order, so heavy/light/heavy stays heavy/light/heavy.

import { h, clear, toast, openSheet } from '../ui.js';
import { upsert } from '../state.js';
import * as P from '../program.js';
import { applyPlan, fitToDays, daysNeeded, defaultDays } from '../planparse.js';

/**
 * @param {object} opts
 * @param {object} opts.plan        a parsed plan (parseCSVPlan / parsePlan output)
 * @param {string} opts.name        shown in the title
 * @param {boolean} [opts.repeat]   override the program's repeat flag once saved
 * @param {Function} opts.onDone    called after the plan is on the calendar
 * @param {Function} [opts.onFewerDays]  offered when someone cannot make enough
 *                                  days; receives how many they can manage
 */
export function openSetupSheet({ plan, name, repeat, onDone, onFewerDays }) {
  const needed = daysNeeded(plan);
  const taken = P.daysInUse();

  openSheet({
    title: 'Your training days',
    fullHeight: true,
    render: (close) => {
      let chosen = defaultDays(plan).slice(0, needed);
      const wrap = h('div', { class: 'form setup' });

      wrap.appendChild(h('p', { class: 'setup-lead' },
        h('strong', {}, name),
        ` trains ${needed} day${needed === 1 ? '' : 's'} a week. Which days suit you?`));

      const picker = h('div', { class: 'day-picker', role: 'group', 'aria-label': 'Training days' });
      const counter = h('p', { class: 'setup-count', 'aria-live': 'polite' });
      const clash = h('p', { class: 'muted small' });
      const fewer = h('div', {});
      const preview = h('div', { class: 'plan-preview' });

      const startInput = h('input', {
        class: 'input', type: 'date', value: P.toISODate(P.mondayOf(new Date())),
        onchange: () => drawStartChips(),
      });
      const startChips = h('div', { class: 'chips' });

      const go = h('button', {
        class: 'btn btn-primary btn-lg btn-block', type: 'button',
        onclick: () => {
          if (chosen.length !== needed) return;
          const fitted = fitToDays(plan, chosen);
          const { program, createdRoutines } = applyPlan(fitted, { startDate: startInput.value || undefined });
          if (typeof repeat === 'boolean' && program.repeat !== repeat) {
            upsert('programs', { ...program, repeat });
          }
          const days = chosen.map((d) => P.DAY_SHORT[d]).join(' · ');
          toast(`${name} is on your calendar · ${days}`, 'success');
          close();
          if (typeof onDone === 'function') onDone({ program, createdRoutines });
        },
      }, 'Start plan');

      const toggle = (day) => {
        if (chosen.includes(day)) {
          chosen = chosen.filter((d) => d !== day);
        } else if (chosen.length < needed) {
          chosen = [...chosen, day].sort((a, b) => a - b);
        } else {
          // full: rather than silently ignoring the tap, say what to do
          toast(`That’s ${needed} — tap a chosen day to swap it out`);
          return;
        }
        draw();
      };

      const drawStartChips = () => {
        clear(startChips);
        const thisMon = P.toISODate(P.mondayOf(new Date()));
        const nextMon = P.toISODate(P.addDays(P.mondayOf(new Date()), 7));
        for (const [label, iso] of [['This week', thisMon], ['Next week', nextMon]]) {
          startChips.appendChild(h('button', {
            class: `chip${startInput.value === iso ? ' chip-on' : ''}`, type: 'button',
            'aria-pressed': startInput.value === iso ? 'true' : 'false',
            onclick: () => { startInput.value = iso; drawStartChips(); },
          }, label));
        }
      };

      const draw = () => {
        clear(picker);
        P.DAY_SHORT.forEach((label, day) => {
          const on = chosen.includes(day);
          const others = taken.get(day);
          picker.appendChild(h('button', {
            class: `day-chip${on ? ' is-on' : ''}${others ? ' is-taken' : ''}`,
            type: 'button',
            'aria-pressed': on ? 'true' : 'false',
            'aria-label': `${P.DAY_NAMES[day]}${others ? `, already used by ${others.join(' and ')}` : ''}`,
            onclick: () => toggle(day),
          }, label));
        });

        counter.textContent = chosen.length === needed
          ? `${needed} of ${needed} days chosen`
          : `${chosen.length} of ${needed} days chosen`;
        counter.classList.toggle('is-ready', chosen.length === needed);
        go.disabled = chosen.length !== needed;

        const clashes = chosen.filter((d) => taken.has(d));
        clash.textContent = clashes.length
          ? `${clashes.map((d) => P.DAY_NAMES[d]).join(' and ')} ${clashes.length === 1 ? 'is' : 'are'} `
            + `already used by ${[...new Set(clashes.flatMap((d) => taken.get(d)))].join(' and ')}. `
            + 'That works — you will just have two sessions that day.'
          : (taken.size ? 'Dotted days are already used by another plan.' : '');

        clear(fewer);
        if (chosen.length < needed && chosen.length > 0 && typeof onFewerDays === 'function') {
          fewer.appendChild(h('button', {
            class: 'btn btn-quiet btn-block', type: 'button',
            onclick: () => { close(); onFewerDays(chosen.length); },
          }, `Only ${chosen.length} day${chosen.length === 1 ? '' : 's'}? See plans built for that`));
        }

        clear(preview);
        if (chosen.length === needed) {
          const week = fitToDays(plan, chosen).weeks[0];
          preview.appendChild(h('p', { class: 'field-label' }, 'Your first week'));
          week.days.forEach((key, day) => {
            if (!key) return;
            preview.appendChild(h('p', { class: 'plan-session' },
              h('strong', {}, `${P.DAY_SHORT[day]} `), plan.sessions[key].name));
          });
        }
      };

      wrap.appendChild(picker);
      wrap.appendChild(counter);
      wrap.appendChild(clash);
      wrap.appendChild(fewer);
      wrap.appendChild(h('p', { class: 'field-label' }, 'Start'));
      wrap.appendChild(startChips);
      wrap.appendChild(startInput);
      wrap.appendChild(preview);
      wrap.appendChild(go);
      wrap.appendChild(h('p', { class: 'muted small' },
        'Sessions keep their order, so the plan’s hard and easy days stay in the right sequence. '
        + 'You can drag any session to another day later.'));

      drawStartChips();
      draw();
      return wrap;
    },
  });
}
