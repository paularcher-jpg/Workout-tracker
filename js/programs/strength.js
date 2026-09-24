// Barbell strength programs.
//
// Each entry carries the plan as CSV in exactly the format the plan importer
// already reads, so a built-in program and a plan you paste in yourself go
// through the same parser and end up as the same routines and schedule.
//
// These follow long-published training methods — linear progression, the
// 5/3/1 percentage cycle, GZCL tiers, Texas Method weekly undulation. The
// schemes are the authors' ideas; the exercise choices, cues and wording here
// are written for this app.

export const STRENGTH = [
  {
    id: 'linear-beginner',
    name: 'Linear Beginner',
    goal: 'strength',
    level: 'beginner',
    days: 3,
    equipment: 'Barbell',
    summary: 'Twelve weeks of two alternating full-body sessions, fives down to doubles.',
    detail: 'The simplest thing that works, given an end. Three sessions a week alternating A and '
      + 'B, so you squat every time you train. Odd and even weeks swap which session runs twice, '
      + 'so neither is always the one you do tired.\n\n'
      + 'Add 2.5kg to the bar each session while you can — that is the real engine of a beginner '
      + 'block and no written plan can do it for you. What the block adds is a shape: fives for '
      + 'four weeks, a deload, threes for four more, another deload, then two weeks of doubles to '
      + 'see what you built. If a lift stalls twice inside a phase, drop it ten per cent and build '
      + 'back.',
    alternating: {
      a: { name: 'Full Body A', exercises: [
        ['Back Squat', 'main', 180],
        ['Barbell Bench Press', 'main', 180, 'Pause briefly on the chest.'],
        ['Deadlift', 'secondary', 240, 'Reset every rep.'],
      ] },
      b: { name: 'Full Body B', exercises: [
        ['Back Squat', 'main', 180],
        ['Overhead Press', 'main', 180, 'Squeeze the glutes. No leg drive.'],
        ['Power Clean', 'power', 180, 'Speed over load. Stop the set if the bar slows.'],
      ] },
    },
  },

  {
    id: 'five-by-five',
    name: '5×5 Linear',
    goal: 'strength',
    level: 'beginner',
    days: 3,
    equipment: 'Barbell',
    summary: 'Twelve weeks of five sets of five, stepping down to heavy doubles.',
    detail: 'The other classic beginner template, run as a block. Five sets across builds more '
      + 'muscle than three and stalls a little sooner, which is a fair trade.\n\n'
      + 'Alternate A and B across three sessions a week, adding 2.5kg a session on the upper body '
      + 'lifts and 5kg on squats and deadlifts for as long as every rep moves well. The block '
      + 'steps the main lifts from fives to triples to doubles, with a deload before each change, '
      + 'so you get a proper run at heavy weight rather than grinding fives until you stall.',
    alternating: {
      a: { name: 'Workout A', exercises: [
        ['Back Squat', 'main', 180],
        ['Barbell Bench Press', 'main', 180, 'Elbows tucked to about 45 degrees.'],
        ['Barbell Row', 'secondary', 150, 'Bar to the lower ribs. Torso still.'],
      ] },
      b: { name: 'Workout B', exercises: [
        ['Back Squat', 'main', 180],
        ['Overhead Press', 'main', 180, 'Head through at lockout.'],
        ['Deadlift', 'secondary', 240, 'Stop the set if the back rounds.'],
      ] },
    },
  },

  {
    id: 'ramping-5x5',
    name: 'Ramping Strength',
    goal: 'strength',
    level: 'intermediate',
    days: 3,
    equipment: 'Barbell',
    summary: 'Twelve weeks of heavy, light and record days. The step up from linear.',
    detail: 'When adding weight every session stops working, add it every week instead. Monday is '
      + 'the volume day, Wednesday is deliberately light so you recover, and Friday you set a '
      + 'small record.\n\n'
      + 'Sets ramp up to the top weight rather than sitting at one load, which lets you handle '
      + 'heavier bars without burying yourself. Across the block the top-set target moves from '
      + 'fives to triples to doubles, so the records you are chasing on Friday change shape as you '
      + 'get stronger.',
    spec: {
      length: 12,
      roleset: 'strength',
      sessions: [
        { name: 'Heavy', day: 'Mon', exercises: [
          ['Back Squat', 'main', 180],
          ['Barbell Bench Press', 'main', 180],
          ['Barbell Row', 'secondary', 150],
        ] },
        { name: 'Light', day: 'Wed', exercises: [
          ['Back Squat', 'accessory', 150],
          ['Overhead Press', 'secondary', 150],
          ['Deadlift', 'accessory', 210],
        ] },
        { name: 'Record', day: 'Fri', exercises: [
          ['Back Squat', 'main', 210],
          ['Barbell Bench Press', 'main', 210],
          ['Chin-Up', 'accessory', 120],
        ] },
      ],
    },
  },

  {
    id: 'weekly-undulating',
    name: 'Volume / Light / Intensity',
    goal: 'strength',
    level: 'intermediate',
    days: 3,
    equipment: 'Barbell',
    summary: 'Twelve weeks of one brutal volume day, one easy day, one heavy single set.',
    detail: 'A week with three jobs, repeated across a block that gets heavier. Monday accumulates '
      + 'the work that drives adaptation. Wednesday is genuinely light and exists only so Friday is '
      + 'possible. Friday you take one heavy set and try to beat last week by the smallest margin '
      + 'that counts.\n\n'
      + 'Ruthless about recovery, and it runs for months if you respect the light day. The block '
      + 'moves the Friday target from fives to triples to doubles, which is what stops the whole '
      + 'thing stalling around week six.',
    spec: {
      length: 12,
      roleset: 'strength',
      sessions: [
        { name: 'Volume', day: 'Mon', exercises: [
          ['Back Squat', 'main', 240],
          ['Barbell Bench Press', 'main', 210],
          ['Barbell Row', 'secondary', 150],
        ] },
        { name: 'Light', day: 'Wed', exercises: [
          ['Back Squat', 'isolation', 150],
          ['Overhead Press', 'secondary', 180],
          ['Chin-Up', 'accessory', 120],
        ] },
        { name: 'Intensity', day: 'Fri', exercises: [
          ['Back Squat', 'power', 300],
          ['Barbell Bench Press', 'power', 300],
          ['Deadlift', 'main', 300],
        ] },
      ],
    },
  },

  {
    id: 'percentage-cycle',
    name: 'Percentage Cycle + High Volume',
    goal: 'strength',
    level: 'intermediate',
    days: 4,
    weeks: 4,
    repeat: true,
    equipment: 'Barbell',
    summary: 'Four-week wave on a training max, plus 5×10 back-off work.',
    detail: 'The most durable intermediate template there is. Work from a training max of 90% '
      + 'of your true best, not your best, so the percentages stay honest. Three main sets a '
      + 'session ending in an AMRAP, then five sets of ten at half the training max to build the '
      + 'muscle that carries the strength. Week four is a real deload. Add 2.5kg upper and 5kg '
      + 'lower to the training max each cycle.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Week 1 fives,1,Mon,Press Day,1,Overhead Press,3,5/5/5+,180,8,65% then 75% then 85% of training max. Last set to a hard rep.
Week 1 fives,1,Mon,Press Day,2,Overhead Press,5,10,90,7,50% of training max. Same weight across.
Week 1 fives,1,Mon,Press Day,3,Chin-Up,5,8,90,8,Add weight when all sets are clean.
Week 1 fives,1,Mon,Press Day,4,Hanging Leg Raise,3,12,60,8,
Week 1 fives,1,Tue,Deadlift Day,1,Deadlift,3,5/5/5+,240,8,65% then 75% then 85% of training max. Last set to a hard rep.
Week 1 fives,1,Tue,Deadlift Day,2,Deadlift,5,10,120,7,50% of training max. Touch and go is fine here.
Week 1 fives,1,Tue,Deadlift Day,3,Barbell Row,5,10,90,8,
Week 1 fives,1,Tue,Deadlift Day,4,Plank,3,45s,45,,Ribs down.
Week 1 fives,1,Thu,Bench Day,1,Barbell Bench Press,3,5/5/5+,180,8,65% then 75% then 85% of training max. Last set to a hard rep.
Week 1 fives,1,Thu,Bench Day,2,Barbell Bench Press,5,10,90,7,50% of training max.
Week 1 fives,1,Thu,Bench Day,3,Dumbbell Row,5,10,90,8,
Week 1 fives,1,Thu,Bench Day,4,Triceps Pushdown,3,15,60,8,
Week 1 fives,1,Fri,Squat Day,1,Back Squat,3,5/5/5+,210,8,65% then 75% then 85% of training max. Last set to a hard rep.
Week 1 fives,1,Fri,Squat Day,2,Back Squat,5,10,120,7,50% of training max. These are meant to be grim.
Week 1 fives,1,Fri,Squat Day,3,Lying Leg Curl,5,10,75,8,
Week 1 fives,1,Fri,Squat Day,4,Hanging Leg Raise,3,12,60,8,
Week 2 threes,2,Mon,Press Day,1,Overhead Press,3,3/3/3+,180,8.5,70% then 80% then 90% of training max. Last set to a hard rep.
Week 2 threes,2,Mon,Press Day,2,Overhead Press,5,10,90,7,50% of training max.
Week 2 threes,2,Mon,Press Day,3,Chin-Up,5,8,90,8,
Week 2 threes,2,Mon,Press Day,4,Hanging Leg Raise,3,12,60,8,
Week 2 threes,2,Tue,Deadlift Day,1,Deadlift,3,3/3/3+,240,8.5,70% then 80% then 90% of training max.
Week 2 threes,2,Tue,Deadlift Day,2,Deadlift,5,10,120,7,50% of training max.
Week 2 threes,2,Tue,Deadlift Day,3,Barbell Row,5,10,90,8,
Week 2 threes,2,Tue,Deadlift Day,4,Plank,3,45s,45,,Ribs down.
Week 2 threes,2,Thu,Bench Day,1,Barbell Bench Press,3,3/3/3+,180,8.5,70% then 80% then 90% of training max.
Week 2 threes,2,Thu,Bench Day,2,Barbell Bench Press,5,10,90,7,50% of training max.
Week 2 threes,2,Thu,Bench Day,3,Dumbbell Row,5,10,90,8,
Week 2 threes,2,Thu,Bench Day,4,Triceps Pushdown,3,15,60,8,
Week 2 threes,2,Fri,Squat Day,1,Back Squat,3,3/3/3+,210,8.5,70% then 80% then 90% of training max.
Week 2 threes,2,Fri,Squat Day,2,Back Squat,5,10,120,7,50% of training max.
Week 2 threes,2,Fri,Squat Day,3,Lying Leg Curl,5,10,75,8,
Week 2 threes,2,Fri,Squat Day,4,Hanging Leg Raise,3,12,60,8,
Week 3 peak,3,Mon,Press Day,1,Overhead Press,3,5/3/1+,210,9.5,75% then 85% then 95% of training max. Last set is the one that counts.
Week 3 peak,3,Mon,Press Day,2,Overhead Press,5,10,90,7,50% of training max.
Week 3 peak,3,Mon,Press Day,3,Chin-Up,5,8,90,8,
Week 3 peak,3,Mon,Press Day,4,Hanging Leg Raise,3,12,60,8,
Week 3 peak,3,Tue,Deadlift Day,1,Deadlift,3,5/3/1+,300,9.5,75% then 85% then 95% of training max.
Week 3 peak,3,Tue,Deadlift Day,2,Deadlift,5,10,120,7,50% of training max.
Week 3 peak,3,Tue,Deadlift Day,3,Barbell Row,5,10,90,8,
Week 3 peak,3,Tue,Deadlift Day,4,Plank,3,45s,45,,Ribs down.
Week 3 peak,3,Thu,Bench Day,1,Barbell Bench Press,3,5/3/1+,240,9.5,75% then 85% then 95% of training max.
Week 3 peak,3,Thu,Bench Day,2,Barbell Bench Press,5,10,90,7,50% of training max.
Week 3 peak,3,Thu,Bench Day,3,Dumbbell Row,5,10,90,8,
Week 3 peak,3,Thu,Bench Day,4,Triceps Pushdown,3,15,60,8,
Week 3 peak,3,Fri,Squat Day,1,Back Squat,3,5/3/1+,240,9.5,75% then 85% then 95% of training max.
Week 3 peak,3,Fri,Squat Day,2,Back Squat,5,10,120,7,50% of training max.
Week 3 peak,3,Fri,Squat Day,3,Lying Leg Curl,5,10,75,8,
Week 3 peak,3,Fri,Squat Day,4,Hanging Leg Raise,3,12,60,8,
Week 4 deload,4,Mon,Press Day,1,Overhead Press,3,5,120,5,40% then 50% then 60% of training max. Stop early.
Week 4 deload,4,Mon,Press Day,2,Chin-Up,3,8,90,6,
Week 4 deload,4,Tue,Deadlift Day,1,Deadlift,3,5,150,5,40% then 50% then 60% of training max.
Week 4 deload,4,Tue,Deadlift Day,2,Plank,3,45s,45,,
Week 4 deload,4,Thu,Bench Day,1,Barbell Bench Press,3,5,120,5,40% then 50% then 60% of training max.
Week 4 deload,4,Thu,Bench Day,2,Dumbbell Row,3,10,90,6,
Week 4 deload,4,Fri,Squat Day,1,Back Squat,3,5,150,5,40% then 50% then 60% of training max.
Week 4 deload,4,Fri,Squat Day,2,Lying Leg Curl,3,10,75,6,`,
  },

  {
    id: 'tiered-linear',
    name: 'Tiered Linear (T1/T2/T3)',
    goal: 'strength',
    level: 'beginner',
    days: 4,
    equipment: 'Full gym',
    summary: 'Twelve weeks where every lift gets a heavy day and a volume day.',
    detail: 'Each session has one heavy main lift, one moderate lift for volume, and light '
      + 'accessory work. Over four sessions every big lift appears twice, once heavy and once for '
      + 'reps.\n\n'
      + 'The block walks the heavy tier down the rep ladder — fives, then triples, then doubles — '
      + 'with deloads between, so you change the scheme on a plan rather than because you missed a '
      + 'rep. Much harder to stall out than a plain linear plan.',
    spec: {
      length: 12,
      roleset: 'strength',
      sessions: [
        { name: 'Day 1', day: 'Mon', exercises: [
          ['Back Squat', 'main', 180],
          ['Barbell Bench Press', 'accessory', 120],
          ['Lat Pulldown', 'isolation', 75],
        ] },
        { name: 'Day 2', day: 'Tue', exercises: [
          ['Overhead Press', 'main', 180],
          ['Deadlift', 'accessory', 150],
          ['Dumbbell Row', 'isolation', 75],
        ] },
        { name: 'Day 3', day: 'Thu', exercises: [
          ['Barbell Bench Press', 'main', 180],
          ['Back Squat', 'accessory', 150],
          ['Lat Pulldown', 'isolation', 75],
        ] },
        { name: 'Day 4', day: 'Fri', exercises: [
          ['Deadlift', 'main', 210],
          ['Overhead Press', 'accessory', 120],
          ['Dumbbell Row', 'isolation', 75],
        ] },
      ],
    },
  },

  {
    id: 'six-week-peak',
    name: 'Six-Week Peak',
    goal: 'strength',
    level: 'advanced',
    days: 4,
    weeks: 6,
    repeat: false,
    equipment: 'Barbell',
    summary: 'Hypertrophy into heavy into speed into a test. Finishes with a new max.',
    detail: 'A finite block that ends with you testing. Weeks one and two build muscle with '
      + 'higher reps, weeks three and four move to heavy fives and triples, week five drops the '
      + 'volume and keeps the bar fast, and week six you work up to a single. Run this when you '
      + 'have a date to be strong for. Do not repeat it back to back — go back to a volume '
      + 'block afterwards.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Build,1-2,Mon,Lower Build,1,Back Squat,4,8,180,8,Leave two reps in reserve on every set.
Build,1-2,Mon,Lower Build,2,Romanian Deadlift,3,10,150,8,
Build,1-2,Mon,Lower Build,3,Leg Press,3,12,120,8,
Build,1-2,Mon,Lower Build,4,Hanging Leg Raise,3,12,60,8,
Build,1-2,Tue,Upper Build,1,Barbell Bench Press,4,8,180,8,
Build,1-2,Tue,Upper Build,2,Barbell Row,4,8,150,8,
Build,1-2,Tue,Upper Build,3,Overhead Press,3,10,120,8,
Build,1-2,Tue,Upper Build,4,Lat Pulldown,3,12,90,8,
Build,1-2,Thu,Lower Volume,1,Front Squat,4,8,180,8,
Build,1-2,Thu,Lower Volume,2,Deadlift,3,8,210,8,
Build,1-2,Thu,Lower Volume,3,Walking Lunge,3,10 each,120,8,
Build,1-2,Fri,Upper Volume,1,Incline Barbell Bench Press,4,8,150,8,
Build,1-2,Fri,Upper Volume,2,Chin-Up,4,8,120,8,
Build,1-2,Fri,Upper Volume,3,Seated Dumbbell Shoulder Press,3,10,120,8,
Heavy,3-4,Mon,Lower Heavy,1,Back Squat,5,4,240,9,Work up. Top two sets heavy.
Heavy,3-4,Mon,Lower Heavy,2,Romanian Deadlift,3,6,180,8,
Heavy,3-4,Mon,Lower Heavy,3,Hanging Leg Raise,3,12,60,8,
Heavy,3-4,Tue,Upper Heavy,1,Barbell Bench Press,5,4,240,9,Work up. Top two sets heavy.
Heavy,3-4,Tue,Upper Heavy,2,Barbell Row,4,6,150,8,
Heavy,3-4,Tue,Upper Heavy,3,Close-Grip Bench Press,3,8,120,8,
Heavy,3-4,Thu,Pull Heavy,1,Deadlift,4,4,300,9,Every rep from a dead stop.
Heavy,3-4,Thu,Pull Heavy,2,Front Squat,3,5,210,8,
Heavy,3-4,Thu,Pull Heavy,3,Chin-Up,4,6,120,8,
Heavy,3-4,Fri,Press Heavy,1,Overhead Press,5,4,210,9,
Heavy,3-4,Fri,Press Heavy,2,Incline Dumbbell Press,3,8,120,8,
Heavy,3-4,Fri,Press Heavy,3,Face Pull,3,15,60,8,
Speed,5,Mon,Lower Speed,1,Back Squat,6,3,180,7,60% of your max. Every rep as fast as you can.
Speed,5,Mon,Lower Speed,2,Box Jump,4,3,120,7,Land soft. Step down.
Speed,5,Mon,Lower Speed,3,Plank,3,45s,45,,
Speed,5,Tue,Upper Speed,1,Barbell Bench Press,6,3,180,7,60% of your max. Bar speed is the point.
Speed,5,Tue,Upper Speed,2,Barbell Row,3,8,120,7,
Speed,5,Thu,Pull Speed,1,Deadlift,5,2,210,7,65%. Fast off the floor.
Speed,5,Thu,Pull Speed,2,Chin-Up,3,6,120,7,
Speed,5,Fri,Press Speed,1,Overhead Press,5,3,150,7,60%. Keep it snappy.
Speed,5,Fri,Press Speed,2,Lateral Raise,3,15,60,7,
Test,6,Mon,Squat Test,1,Back Squat,5,1,300,10,Work up in singles to a new best.
Test,6,Mon,Squat Test,2,Plank,2,45s,45,,
Test,6,Tue,Bench Test,1,Barbell Bench Press,5,1,300,10,Work up in singles to a new best.
Test,6,Thu,Deadlift Test,1,Deadlift,5,1,300,10,Work up in singles to a new best.
Test,6,Fri,Press Test,1,Overhead Press,5,1,240,10,Work up in singles to a new best.`,
  },

  {
    id: 'squat-specialisation',
    name: 'Squat Specialisation',
    goal: 'strength',
    level: 'advanced',
    days: 4,
    weeks: 4,
    repeat: false,
    equipment: 'Barbell',
    summary: 'Four weeks of squatting four times a week. Brutal, effective, then stop.',
    detail: 'A short overload block that hammers one lift four times a week at rising intensity '
      + 'and falling volume: sixes, fives, fours, then triples, each day at a different '
      + 'percentage.\n\n'
      + 'Three loading weeks that add both weight and sets, then a deload week that finishes with '
      + 'a test. It works, it hurts, and it is not something to run twice in a row. Only worth '
      + 'doing if your recovery, sleep and food are genuinely in order.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Week 1,1,Mon,Sixes — Week 1,1,Back Squat,6,6,210,8.5,70% 75% 80% and 85% of your max across the four days.
Week 1,1,Mon,Sixes — Week 1,2,Chin-Up,3,8,90,7,Everything else stays light.
Week 1,1,Tue,Fives — Week 1,1,Back Squat,7,5,210,8.5,70% 75% 80% and 85% of your max across the four days.
Week 1,1,Tue,Fives — Week 1,2,Chin-Up,3,8,90,7,Everything else stays light.
Week 1,1,Thu,Fours — Week 1,1,Back Squat,8,4,210,8.5,70% 75% 80% and 85% of your max across the four days.
Week 1,1,Thu,Fours — Week 1,2,Chin-Up,3,8,90,7,Everything else stays light.
Week 1,1,Sat,Triples — Week 1,1,Back Squat,10,3,210,8.5,70% 75% 80% and 85% of your max across the four days.
Week 1,1,Sat,Triples — Week 1,2,Chin-Up,3,8,90,7,Everything else stays light.
Week 2,2,Mon,Sixes — Week 2,1,Back Squat,7,6,210,8.5,Same percentages plus 5kg. One more set on the first three days.
Week 2,2,Mon,Sixes — Week 2,2,Chin-Up,3,8,90,7,Everything else stays light.
Week 2,2,Tue,Fives — Week 2,1,Back Squat,8,5,210,8.5,Same percentages plus 5kg. One more set on the first three days.
Week 2,2,Tue,Fives — Week 2,2,Chin-Up,3,8,90,7,Everything else stays light.
Week 2,2,Thu,Fours — Week 2,1,Back Squat,9,4,210,8.5,Same percentages plus 5kg. One more set on the first three days.
Week 2,2,Thu,Fours — Week 2,2,Chin-Up,3,8,90,7,Everything else stays light.
Week 2,2,Sat,Triples — Week 2,1,Back Squat,10,3,210,8.5,Same percentages plus 5kg. One more set on the first three days.
Week 2,2,Sat,Triples — Week 2,2,Chin-Up,3,8,90,7,Everything else stays light.
Week 3,3,Mon,Sixes — Week 3,1,Back Squat,8,6,210,8.5,Plus another 5kg. This is the hardest week you will do.
Week 3,3,Mon,Sixes — Week 3,2,Chin-Up,3,8,90,7,Everything else stays light.
Week 3,3,Tue,Fives — Week 3,1,Back Squat,9,5,210,8.5,Plus another 5kg. This is the hardest week you will do.
Week 3,3,Tue,Fives — Week 3,2,Chin-Up,3,8,90,7,Everything else stays light.
Week 3,3,Thu,Fours — Week 3,1,Back Squat,10,4,210,8.5,Plus another 5kg. This is the hardest week you will do.
Week 3,3,Thu,Fours — Week 3,2,Chin-Up,3,8,90,7,Everything else stays light.
Week 3,3,Sat,Triples — Week 3,1,Back Squat,10,3,210,8.5,Plus another 5kg. This is the hardest week you will do.
Week 3,3,Sat,Triples — Week 3,2,Chin-Up,3,8,90,7,Everything else stays light.
Week 4 test,4,Mon,Sixes — Test,1,Back Squat,3,3,240,6,Deload week. 60% only. Then test a single on Saturday.
Week 4 test,4,Mon,Sixes — Test,2,Plank,2,45s,45,,
Week 4 test,4,Tue,Fives — Test,1,Back Squat,3,3,240,6,Deload week. 60% only. Then test a single on Saturday.
Week 4 test,4,Tue,Fives — Test,2,Plank,2,45s,45,,
Week 4 test,4,Thu,Fours — Test,1,Back Squat,3,3,240,6,Deload week. 60% only. Then test a single on Saturday.
Week 4 test,4,Thu,Fours — Test,2,Plank,2,45s,45,,
Week 4 test,4,Sat,Triples — Test,1,Back Squat,3,3,240,6,Deload week. 60% only. Then test a single on Saturday.
Week 4 test,4,Sat,Triples — Test,2,Plank,2,45s,45,,`,
  },

  {
    id: 'press-focus-lp',
    name: 'Press-Focused Linear',
    goal: 'strength',
    level: 'beginner',
    days: 3,
    equipment: 'Barbell',
    summary: 'Twelve weeks with pressing every session and a heavy finish.',
    detail: 'A linear block for anyone whose overhead strength lags behind their squat. Pressing '
      + 'of one kind or another appears every session, and the accessory work is all pulling to '
      + 'keep the shoulders honest.\n\n'
      + 'Take the last set of each main lift close to a hard rep — if you clear the target on every '
      + 'set comfortably, jump the weight twice as much next session. The block runs fives, then '
      + 'threes, then doubles, with deloads between.',
    alternating: {
      a: { name: 'Session A', exercises: [
        ['Overhead Press', 'main', 180],
        ['Back Squat', 'main', 210],
        ['Chin-Up', 'accessory', 120, 'Add weight when you clear the target.'],
      ] },
      b: { name: 'Session B', exercises: [
        ['Barbell Bench Press', 'main', 180],
        ['Deadlift', 'secondary', 300, 'Every rep from a dead stop.'],
        ['Barbell Row', 'accessory', 120],
      ] },
    },
  },
];
