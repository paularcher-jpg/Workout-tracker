// Turns a compact block spec into a written-out, week-by-week plan.
//
// A repeating one-week template is not a program. The app carries no
// progression engine — it shows whatever the plan says — so a plan that says
// the same thing every week shows the same targets forever, and the athlete
// stalls. Every block here therefore writes each phase out explicitly, with
// volume and rep ranges moving across the block and real deloads in it.
//
// Exercises are tagged by the job they do rather than by sets and reps, and
// the phase decides what that job means this week. A main lift gets heavier
// and lower in reps as the block runs; an isolation movement stays high-rep
// throughout, because that is what it is for.

const HYPERTROPHY = {
  main:      { build: [4, '8-10', 8],   heavy: [5, '5-6', 8.5],  peak: [4, '3-5', 9],     deload: [2, '8', 5] },
  secondary: { build: [3, '10-12', 8],  heavy: [4, '8-10', 8.5], peak: [3, '6-8', 8.5],   deload: [2, '10', 5] },
  accessory: { build: [3, '12-15', 8],  heavy: [3, '10-12', 8],  peak: [3, '8-10', 8.5],  deload: [2, '12', 5] },
  isolation: { build: [3, '15-20', 9],  heavy: [3, '12-15', 9],  peak: [3, '12-15', 9],   deload: [2, '15', 6] },
  power:     { build: [4, '4', 7],      heavy: [4, '3', 7],      peak: [5, '3', 7],       deload: [2, '3', 5] },
};

// Endurance athletes lift to be durable, not big. Loads stay heavy and the
// volume stays low, and nothing goes near failure — the running or riding is
// the training, and the gym must not cost it.
const ENDURANCE = {
  main:      { build: [3, '6', 7],      heavy: [4, '4', 8],      peak: [3, '3', 8],       deload: [2, '5', 5] },
  secondary: { build: [3, '8', 7],      heavy: [3, '6', 8],      peak: [2, '5', 8],       deload: [2, '8', 5] },
  accessory: { build: [3, '10', 7],     heavy: [3, '8', 7.5],    peak: [2, '8', 7.5],     deload: [2, '10', 5] },
  isolation: { build: [3, '12', 8],     heavy: [3, '12', 8],     peak: [2, '12', 8],      deload: [2, '12', 5] },
  power:     { build: [3, '4', 7],      heavy: [4, '3', 7],      peak: [4, '3', 7],       deload: [2, '3', 5] },
};

// You cannot put 2.5kg on a press-up. Bodyweight work progresses by reps
// first and then by moving to a harder variation, so the rep ranges stay high
// and it is the volume and the movement that change across the block.
const BODYWEIGHT = {
  main:      { build: [3, '8-12', 8],   heavy: [4, '8-12', 8.5], peak: [4, '6-10', 9],   deload: [2, '8', 5] },
  secondary: { build: [3, '10-15', 8],  heavy: [4, '10-15', 8.5], peak: [4, '8-12', 9],  deload: [2, '10', 5] },
  accessory: { build: [3, '12-20', 8],  heavy: [3, '12-20', 8.5], peak: [4, '10-15', 9], deload: [2, '12', 5] },
  isolation: { build: [3, '15-25', 9],  heavy: [3, '15-25', 9],  peak: [3, '15-25', 9],  deload: [2, '15', 6] },
  power:     { build: [4, '5', 7],      heavy: [4, '4', 7],      peak: [5, '4', 7],      deload: [2, '4', 5] },
};

// Strength blocks move down the rep ladder rather than up the volume: fives
// to build, threes to get heavy, doubles to peak, with the accessory work
// holding station so the main lift keeps the recovery it needs.
const STRENGTH_ROLES = {
  main:      { build: [5, '5', 8],      heavy: [5, '3', 8.5],    peak: [4, '2', 9],      deload: [2, '5', 5] },
  secondary: { build: [4, '6', 8],      heavy: [4, '5', 8.5],    peak: [3, '3', 8.5],    deload: [2, '6', 5] },
  accessory: { build: [3, '8', 8],      heavy: [3, '6', 8],      peak: [3, '5', 8],      deload: [2, '8', 5] },
  isolation: { build: [3, '12', 8],     heavy: [3, '10', 8],     peak: [3, '8', 8],      deload: [2, '12', 6] },
  power:     { build: [4, '3', 7],      heavy: [5, '2', 7],      peak: [5, '1', 8],      deload: [2, '3', 5] },
};

export const ROLESETS = {
  hypertrophy: HYPERTROPHY, endurance: ENDURANCE, bodyweight: BODYWEIGHT, strength: STRENGTH_ROLES,
};

// Holds and carries are prescribed in seconds, so the phase moves the number
// of sets and leaves the duration to the program.
const HOLD_SETS = { build: 3, heavy: 3, peak: 3, deload: 2 };

const STAGE_NOTE = {
  build: 'Add a little weight whenever you clear the top of the rep range on every set.',
  heavy: 'Heavier and lower in reps than the last block. Same effort not more.',
  peak: 'The heaviest work of the block. Warm up properly and stop when speed drops.',
  deload: 'Deload. Half the weight you finished on and nowhere near failure. This is the week that makes the next block possible.',
};

/** Phase plans by block length. Each entry becomes one phase of the plan. */
export const PLANS = {
  4:  [['Build', 'build', '1-2'], ['Heavy', 'heavy', '3'], ['Deload', 'deload', '4']],
  6:  [['Build', 'build', '1-2'], ['Heavy', 'heavy', '3-4'], ['Deload', 'deload', '5'], ['Peak', 'peak', '6']],
  8:  [['Build', 'build', '1-3'], ['Deload', 'deload', '4'], ['Heavy', 'heavy', '5-7'], ['Peak', 'peak', '8']],
  12: [['Build', 'build', '1-4'], ['Deload', 'deload', '5;10'], ['Heavy', 'heavy', '6-9'], ['Peak', 'peak', '11-12']],
};

export function weeksIn(length) {
  const plan = PLANS[length];
  if (!plan) throw new Error(`no phase plan for a ${length} week block`);
  return length;
}

/**
 * Build the plan CSV.
 *
 * spec = {
 *   length: 12,
 *   roleset: 'hypertrophy',
 *   sessions: [{ name, day, exercises: [[name, role, restSec, note?] | [name, 'hold', rest, reps]] }]
 * }
 */
export function buildCsv(spec) {
  const plan = PLANS[spec.length];
  if (!plan) throw new Error(`no phase plan for a ${spec.length} week block`);
  const roles = ROLESETS[spec.roleset || 'hypertrophy'];

  const rows = ['Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes'];
  for (const [phaseName, stage, weeks] of plan) {
    for (const session of spec.sessions) {
      // the phase is part of the routine's name, so a block produces one
      // routine per distinct prescription rather than one per calendar week
      const workout = `${session.name} — ${phaseName}`;
      session.exercises.forEach(([name, role, rest, extra], i) => {
        let sets;
        let reps;
        let rpe;
        if (role === 'hold') {
          sets = HOLD_SETS[stage];
          reps = extra;
          rpe = '';
        } else {
          const table = roles[role];
          if (!table) throw new Error(`unknown role "${role}" for ${name}`);
          [sets, reps, rpe] = table[stage];
        }
        const note = i === 0 ? STAGE_NOTE[stage] : (role === 'hold' ? '' : (extra || ''));
        rows.push([phaseName, weeks, session.day, workout, i + 1, name, sets, reps, rest, rpe, note].join(','));
      });
    }
  }
  return rows.join('\n');
}

/**
 * Phase plan for a block that alternates two sessions across three days a
 * week — A/B/A one week, B/A/B the next. The alternation needs odd and even
 * weeks to say different things, so each stage splits in two.
 */
export const ALTERNATING = [
  ['Build odd', 'build', '1;3'], ['Build even', 'build', '2;4'],
  ['Deload', 'deload', '5;10'],
  ['Heavy odd', 'heavy', '6;8'], ['Heavy even', 'heavy', '7;9'],
  ['Peak odd', 'peak', '11'], ['Peak even', 'peak', '12'],
];

/**
 * Build an alternating three-day block. `a` and `b` are session specs; on odd
 * weeks A runs Monday and Friday with B on Wednesday, and on even weeks they
 * swap, so neither session is always the fresh one.
 */
export function buildAlternating({ a, b, roleset = 'strength' }) {
  const roles = ROLESETS[roleset];
  const rows = ['Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes'];
  for (const [phaseName, stage, weeks] of ALTERNATING) {
    const even = phaseName.endsWith('even');
    // A session's weekdays are read from its first row, so a session that runs
    // twice has to say so in one cell rather than appearing twice in the list.
    const pairs = even ? [[b, 'Mon Fri'], [a, 'Wed']] : [[a, 'Mon Fri'], [b, 'Wed']];
    for (const [session, day] of pairs) {
      const stageLabel = phaseName.split(' ')[0];
      const workout = `${session.name} — ${stageLabel}`;
      session.exercises.forEach(([name, role, rest, extra], i) => {
        let sets;
        let reps;
        let rpe;
        if (role === 'hold') { sets = HOLD_SETS[stage]; reps = extra; rpe = ''; }
        else {
          const table = roles[role];
          if (!table) throw new Error(`unknown role "${role}" for ${name}`);
          [sets, reps, rpe] = table[stage];
        }
        const note = i === 0 ? STAGE_NOTE[stage] : (role === 'hold' ? '' : (extra || ''));
        rows.push([phaseName, weeks, day, workout, i + 1, name, sets, reps, rest, rpe, note].join(','));
      });
    }
  }
  return rows.join('\n');
}

/** Fill in `csv` and `weeks` for any program that ships a block spec. */
export function expand(programs) {
  return programs.map((p) => {
    if (p.alternating) {
      return { ...p, weeks: 12, repeat: false, csv: buildAlternating(p.alternating) };
    }
    if (p.spec) {
      return { ...p, weeks: weeksIn(p.spec.length), repeat: false, csv: buildCsv(p.spec) };
    }
    return p;
  });
}
