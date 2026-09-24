// Hypertrophy and powerbuilding blocks.
//
// Every one of these is a finite block with a shape: a build phase at higher
// reps, a heavy phase, real deload weeks, and a peak. Exercises are tagged by
// the job they do and the phase decides the sets, reps and effort — see
// periodise.js. When a block ends, run a different one rather than the same
// one again.

export const MUSCLE = [
  {
    id: 'push-pull-legs-6',
    name: 'Push / Pull / Legs',
    goal: 'muscle',
    level: 'intermediate',
    days: 6,
    equipment: 'Full gym',
    summary: 'Twelve weeks, six days, every muscle twice a week.',
    detail: 'Pushing muscles, pulling muscles, then legs, run through twice a week — organised '
      + 'as a twelve-week block rather than a week you repeat forever.\n\n'
      + 'Weeks one to four build at eight to twelve reps and moderate effort. Week five is a '
      + 'deload. Weeks six to nine move heavier and lower in reps. Week ten deloads again. Weeks '
      + 'eleven and twelve are the heaviest work of the block. Six sessions sounds like a lot but '
      + 'each is short, and hitting everything twice a week beats once for growth.',
    spec: {
      length: 12,
      sessions: [
        { name: 'Push A', day: 'Mon', exercises: [
          ['Barbell Bench Press', 'main', 180],
          ['Seated Dumbbell Shoulder Press', 'secondary', 120],
          ['Incline Dumbbell Press', 'accessory', 120],
          ['Lateral Raise', 'isolation', 60],
          ['Rope Pushdown', 'isolation', 60],
        ] },
        { name: 'Pull A', day: 'Tue', exercises: [
          ['Barbell Row', 'main', 180],
          ['Lat Pulldown', 'secondary', 90],
          ['Seated Cable Row', 'accessory', 90],
          ['Face Pull', 'isolation', 60],
          ['Barbell Curl', 'isolation', 75],
        ] },
        { name: 'Legs A', day: 'Wed', exercises: [
          ['Back Squat', 'main', 210],
          ['Romanian Deadlift', 'secondary', 150],
          ['Leg Press', 'accessory', 120],
          ['Lying Leg Curl', 'isolation', 75],
          ['Standing Calf Raise', 'isolation', 60],
        ] },
        { name: 'Push B', day: 'Thu', exercises: [
          ['Overhead Press', 'main', 180],
          ['Incline Barbell Bench Press', 'secondary', 150],
          ['Machine Chest Press', 'accessory', 90],
          ['Cable Lateral Raise', 'isolation', 60],
          ['Overhead Cable Extension', 'isolation', 60],
        ] },
        { name: 'Pull B', day: 'Fri', exercises: [
          ['Deadlift', 'main', 240],
          ['Chin-Up', 'secondary', 120],
          ['Chest-Supported Row', 'accessory', 90],
          ['Straight-Arm Pulldown', 'isolation', 60],
          ['Hammer Curl', 'isolation', 60],
        ] },
        { name: 'Legs B', day: 'Sat', exercises: [
          ['Front Squat', 'main', 180],
          ['Bulgarian Split Squat', 'secondary', 120],
          ['Seated Leg Curl', 'accessory', 75],
          ['Leg Extension', 'isolation', 60],
          ['Seated Calf Raise', 'isolation', 60],
        ] },
      ],
    },
  },

  {
    id: 'push-pull-legs-3',
    name: 'Push / Pull / Legs (3 day)',
    goal: 'muscle',
    level: 'beginner',
    days: 3,
    equipment: 'Full gym',
    summary: 'The same split once through. Twelve weeks, plenty of recovery.',
    detail: 'Push, pull and legs across three sessions a week, laid out as a twelve-week block. '
      + 'Less total volume than the six-day version, so each session carries more work per muscle '
      + 'and you get two full rest days.\n\n'
      + 'The block builds at higher reps for four weeks, deloads, moves heavier for four more, '
      + 'deloads again, and finishes with two weeks of the heaviest work. A good first '
      + 'hypertrophy block, and the right one to drop to when life gets busy.',
    spec: {
      length: 12,
      sessions: [
        { name: 'Push', day: 'Mon', exercises: [
          ['Barbell Bench Press', 'main', 180],
          ['Overhead Press', 'secondary', 150],
          ['Incline Dumbbell Press', 'accessory', 120],
          ['Lateral Raise', 'isolation', 60],
          ['Rope Pushdown', 'isolation', 60],
          ['Cable Fly', 'isolation', 60],
        ] },
        { name: 'Pull', day: 'Wed', exercises: [
          ['Barbell Row', 'main', 180],
          ['Lat Pulldown', 'secondary', 90],
          ['Seated Cable Row', 'accessory', 90],
          ['Face Pull', 'isolation', 60],
          ['Barbell Curl', 'isolation', 75],
          ['Hammer Curl', 'isolation', 60],
        ] },
        { name: 'Legs', day: 'Fri', exercises: [
          ['Back Squat', 'main', 210],
          ['Romanian Deadlift', 'secondary', 150],
          ['Leg Press', 'accessory', 120],
          ['Lying Leg Curl', 'isolation', 75],
          ['Standing Calf Raise', 'isolation', 60],
          ['Hanging Leg Raise', 'isolation', 60],
        ] },
      ],
    },
  },

  {
    id: 'upper-lower-4',
    name: 'Upper / Lower',
    goal: 'muscle',
    level: 'beginner',
    days: 4,
    equipment: 'Full gym',
    summary: 'Twelve weeks, four days, everything twice a week.',
    detail: 'Two upper body days and two lower body days, periodised across twelve weeks. It hits '
      + 'the sweet spot most people want: enough frequency to grow, enough rest to recover, and it '
      + 'fits round a normal week.\n\n'
      + 'The first upper and lower days of each week lead with the heaviest compound work; the '
      + 'second pair use different movements at the same phase prescription. If you only ever run '
      + 'one block shape, this is a defensible choice.',
    spec: {
      length: 12,
      sessions: [
        { name: 'Upper A', day: 'Mon', exercises: [
          ['Barbell Bench Press', 'main', 180],
          ['Barbell Row', 'main', 180],
          ['Overhead Press', 'secondary', 150],
          ['Lat Pulldown', 'accessory', 90],
          ['Barbell Curl', 'isolation', 75],
          ['Rope Pushdown', 'isolation', 60],
        ] },
        { name: 'Lower A', day: 'Tue', exercises: [
          ['Back Squat', 'main', 210],
          ['Romanian Deadlift', 'secondary', 150],
          ['Leg Press', 'accessory', 120],
          ['Lying Leg Curl', 'isolation', 75],
          ['Standing Calf Raise', 'isolation', 60],
        ] },
        { name: 'Upper B', day: 'Thu', exercises: [
          ['Incline Dumbbell Press', 'main', 150],
          ['Chest-Supported Row', 'secondary', 120],
          ['Seated Dumbbell Shoulder Press', 'accessory', 90],
          ['Chin-Up', 'accessory', 120],
          ['Lateral Raise', 'isolation', 60],
          ['Hammer Curl', 'isolation', 60],
        ] },
        { name: 'Lower B', day: 'Fri', exercises: [
          ['Front Squat', 'main', 180],
          ['Hip Thrust', 'secondary', 120],
          ['Walking Lunge', 'accessory', 120],
          ['Seated Leg Curl', 'isolation', 75],
          ['Seated Calf Raise', 'isolation', 60],
        ] },
      ],
    },
  },

  {
    id: 'power-hypertrophy-4',
    name: 'Power + Hypertrophy',
    goal: 'powerbuilding',
    level: 'intermediate',
    days: 4,
    equipment: 'Full gym',
    summary: 'Twelve weeks of two heavy days and two pump days.',
    detail: 'The classic powerbuilding compromise, given a block structure. Monday and Tuesday you '
      + 'lift heavy on the big four; Thursday and Friday you chase reps and blood flow.\n\n'
      + 'You end up stronger than a pure bodybuilding block and bigger than a pure strength one, '
      + 'which is what most people actually want. The phases move both halves together, so the '
      + 'heavy days get heavier as the pump days get denser.',
    spec: {
      length: 12,
      sessions: [
        { name: 'Upper Power', day: 'Mon', exercises: [
          ['Barbell Bench Press', 'main', 210],
          ['Barbell Row', 'main', 210],
          ['Overhead Press', 'secondary', 150],
          ['Chin-Up', 'secondary', 150],
          ['Close-Grip Bench Press', 'accessory', 120],
        ] },
        { name: 'Lower Power', day: 'Tue', exercises: [
          ['Back Squat', 'main', 240],
          ['Deadlift', 'main', 240],
          ['Leg Press', 'accessory', 150],
          ['Lying Leg Curl', 'isolation', 75],
          ['Standing Calf Raise', 'isolation', 60],
        ] },
        { name: 'Upper Pump', day: 'Thu', exercises: [
          ['Incline Dumbbell Press', 'secondary', 90],
          ['Seated Cable Row', 'secondary', 90],
          ['Cable Fly', 'isolation', 60],
          ['Lat Pulldown', 'accessory', 75],
          ['Lateral Raise', 'isolation', 60],
          ['Cable Curl', 'isolation', 60],
        ] },
        { name: 'Lower Pump', day: 'Fri', exercises: [
          ['Front Squat', 'secondary', 120],
          ['Romanian Deadlift', 'secondary', 120],
          ['Walking Lunge', 'accessory', 90],
          ['Leg Extension', 'isolation', 60],
          ['Seated Calf Raise', 'isolation', 60],
        ] },
      ],
    },
  },

  {
    id: 'power-hypertrophy-5',
    name: 'Power + Hypertrophy (5 day)',
    goal: 'powerbuilding',
    level: 'advanced',
    days: 5,
    equipment: 'Full gym',
    summary: 'Twelve weeks, five days. High volume, high commitment.',
    detail: 'Two strength days on the big lifts, then three hypertrophy days split by body part, '
      + 'across a twelve-week block. Total volume is high and so is the time cost — budget an hour '
      + 'or more per session.\n\n'
      + 'Worth running only if you can eat and sleep to match it. Take the deload weeks seriously; '
      + 'at this volume they are the difference between finishing the block and abandoning it in '
      + 'week eight.',
    spec: {
      length: 12,
      sessions: [
        { name: 'Upper Power', day: 'Mon', exercises: [
          ['Barbell Bench Press', 'main', 210],
          ['Barbell Row', 'main', 180],
          ['Overhead Press', 'secondary', 150],
          ['Chin-Up', 'secondary', 120],
          ['Skullcrusher', 'isolation', 90],
        ] },
        { name: 'Lower Power', day: 'Tue', exercises: [
          ['Back Squat', 'main', 240],
          ['Deadlift', 'main', 300],
          ['Hack Squat', 'accessory', 150],
          ['Seated Leg Curl', 'isolation', 75],
          ['Standing Calf Raise', 'isolation', 60],
        ] },
        { name: 'Back and Shoulders', day: 'Thu', exercises: [
          ['Pendlay Row', 'secondary', 120],
          ['Lat Pulldown', 'accessory', 90],
          ['Seated Cable Row', 'accessory', 75],
          ['Lateral Raise', 'isolation', 60],
          ['Rear Delt Fly', 'isolation', 60],
        ] },
        { name: 'Chest and Arms', day: 'Fri', exercises: [
          ['Incline Barbell Bench Press', 'secondary', 120],
          ['Machine Chest Press', 'accessory', 90],
          ['Cable Fly', 'isolation', 60],
          ['EZ-Bar Curl', 'isolation', 75],
          ['Rope Pushdown', 'isolation', 60],
        ] },
        { name: 'Legs', day: 'Sat', exercises: [
          ['Front Squat', 'secondary', 150],
          ['Romanian Deadlift', 'secondary', 120],
          ['Leg Press', 'accessory', 120],
          ['Leg Extension', 'isolation', 60],
          ['Seated Calf Raise', 'isolation', 60],
        ] },
      ],
    },
  },

  {
    id: 'body-part-split',
    name: 'Body Part Split',
    goal: 'muscle',
    level: 'intermediate',
    days: 5,
    equipment: 'Full gym',
    summary: 'One body part a day for twelve weeks, trained hard.',
    detail: 'Chest, back, legs, shoulders, arms — one a day, each battered thoroughly and then '
      + 'left alone for a week, across a twelve-week block.\n\n'
      + 'Frequency is lower than modern research prefers, but the volume per session is high and '
      + 'plenty of people have built plenty of muscle on exactly this. It also has the practical '
      + 'advantage of being easy to remember and hard to rush.',
    spec: {
      length: 12,
      sessions: [
        { name: 'Chest', day: 'Mon', exercises: [
          ['Barbell Bench Press', 'main', 180],
          ['Incline Dumbbell Press', 'secondary', 120],
          ['Machine Chest Press', 'accessory', 90],
          ['Cable Fly', 'isolation', 60],
          ['Push-Up', 'isolation', 60],
        ] },
        { name: 'Back', day: 'Tue', exercises: [
          ['Deadlift', 'main', 240],
          ['Barbell Row', 'secondary', 150],
          ['Lat Pulldown', 'accessory', 90],
          ['Seated Cable Row', 'isolation', 75],
          ['Straight-Arm Pulldown', 'isolation', 60],
        ] },
        { name: 'Legs', day: 'Wed', exercises: [
          ['Back Squat', 'main', 210],
          ['Leg Press', 'secondary', 150],
          ['Romanian Deadlift', 'accessory', 120],
          ['Lying Leg Curl', 'isolation', 75],
          ['Standing Calf Raise', 'isolation', 60],
        ] },
        { name: 'Shoulders', day: 'Thu', exercises: [
          ['Overhead Press', 'main', 180],
          ['Seated Dumbbell Shoulder Press', 'accessory', 90],
          ['Lateral Raise', 'isolation', 60],
          ['Rear Delt Fly', 'isolation', 60],
          ['Shrug', 'isolation', 75],
        ] },
        { name: 'Arms', day: 'Fri', exercises: [
          ['Close-Grip Bench Press', 'secondary', 120],
          ['Barbell Curl', 'secondary', 90],
          ['Skullcrusher', 'isolation', 75],
          ['Incline Dumbbell Curl', 'isolation', 75],
          ['Rope Pushdown', 'isolation', 60],
          ['Hammer Curl', 'isolation', 60],
        ] },
      ],
    },
  },

  {
    id: 'full-body-hypertrophy',
    name: 'Full Body Hypertrophy',
    goal: 'muscle',
    level: 'beginner',
    days: 3,
    equipment: 'Full gym',
    summary: 'Twelve weeks of three full-body sessions. Best growth per hour.',
    detail: 'Everything, three times a week, with the exercises rotated so nothing gets stale, '
      + 'laid out across twelve weeks.\n\n'
      + 'Frequency does a lot of the work here: hitting each muscle three times a week at moderate '
      + 'volume grows it about as well as hitting it once with triple the sets, and it takes far '
      + 'less time. The right block if you have three hours a week and want them to count.',
    spec: {
      length: 12,
      sessions: [
        { name: 'Full Body A', day: 'Mon', exercises: [
          ['Back Squat', 'main', 180],
          ['Barbell Bench Press', 'main', 180],
          ['Barbell Row', 'secondary', 120],
          ['Seated Dumbbell Shoulder Press', 'accessory', 90],
          ['Lying Leg Curl', 'isolation', 75],
          ['Hanging Leg Raise', 'isolation', 60],
        ] },
        { name: 'Full Body B', day: 'Wed', exercises: [
          ['Romanian Deadlift', 'main', 180],
          ['Incline Dumbbell Press', 'secondary', 120],
          ['Lat Pulldown', 'secondary', 90],
          ['Leg Press', 'accessory', 120],
          ['Lateral Raise', 'isolation', 60],
          ['Cable Curl', 'isolation', 60],
        ] },
        { name: 'Full Body C', day: 'Fri', exercises: [
          ['Front Squat', 'main', 180],
          ['Overhead Press', 'secondary', 150],
          ['Chin-Up', 'secondary', 120],
          ['Hip Thrust', 'accessory', 120],
          ['Chest-Supported Row', 'accessory', 90],
          ['Standing Calf Raise', 'isolation', 60],
        ] },
      ],
    },
  },

  {
    id: 'dumbbell-only',
    name: 'Dumbbell Only',
    goal: 'muscle',
    level: 'beginner',
    days: 4,
    equipment: 'Dumbbells',
    summary: 'Eight weeks of upper/lower with nothing but a pair of dumbbells.',
    detail: 'Built for a home rack, a hotel gym, or a commercial gym at six in the evening when '
      + 'every barbell is taken. No bars, no machines, no cables.\n\n'
      + 'Eight weeks rather than twelve, because loading jumps with dumbbells are large and you '
      + 'will run out of room to add weight sooner. Progress by reps first — work to the top of '
      + 'the range on every set, then take the next pair up and start again at the bottom.',
    spec: {
      length: 8,
      sessions: [
        { name: 'Upper A', day: 'Mon', exercises: [
          ['Dumbbell Bench Press', 'main', 120],
          ['Dumbbell Row', 'main', 90],
          ['Seated Dumbbell Shoulder Press', 'accessory', 90],
          ['Dumbbell Curl', 'isolation', 60],
          ['Dumbbell Kickback', 'isolation', 60],
        ] },
        { name: 'Lower A', day: 'Tue', exercises: [
          ['Goblet Squat', 'main', 120],
          ['Romanian Deadlift', 'main', 120],
          ['Bulgarian Split Squat', 'accessory', 90],
          ['Single-Leg Calf Raise', 'isolation', 60],
          ['Plank', 'hold', 45, '45s'],
        ] },
        { name: 'Upper B', day: 'Thu', exercises: [
          ['Incline Dumbbell Press', 'main', 120],
          ['Chest-Supported Row', 'main', 90],
          ['Arnold Press', 'accessory', 90],
          ['Lateral Raise', 'isolation', 60],
          ['Hammer Curl', 'isolation', 60],
        ] },
        { name: 'Lower B', day: 'Fri', exercises: [
          ['Walking Lunge', 'main', 120],
          ['Single-Leg Romanian Deadlift', 'secondary', 90],
          ['Step-Up', 'accessory', 90],
          ['Glute Bridge', 'isolation', 75],
          ['Side Plank', 'hold', 45, '30s each'],
        ] },
      ],
    },
  },

  {
    id: 'first-gym-plan',
    name: 'Your First Gym Plan',
    goal: 'muscle',
    level: 'beginner',
    days: 3,
    equipment: 'Machines and dumbbells',
    summary: 'Eight weeks on machines and dumbbells. For a first block in a gym.',
    detail: 'Written for someone who has just joined a gym and does not yet want to be the person '
      + 'figuring out a squat rack in front of everyone. Machines and dumbbells only, three '
      + 'sessions a week, the same exercises every time so you get to practise them.\n\n'
      + 'Eight weeks with a deload in the middle and a heavier finish, so you leave it stronger '
      + 'than you would from repeating an identical week. After this, barbells will feel a lot '
      + 'less intimidating — move to Full Body Hypertrophy or Upper / Lower next.',
    spec: {
      length: 8,
      sessions: [
        { name: 'Full Body A', day: 'Mon', exercises: [
          ['Leg Press', 'main', 120],
          ['Machine Chest Press', 'secondary', 90],
          ['Lat Pulldown', 'secondary', 90],
          ['Seated Leg Curl', 'accessory', 75],
          ['Plank', 'hold', 45, '30s'],
        ] },
        { name: 'Full Body B', day: 'Wed', exercises: [
          ['Goblet Squat', 'main', 120],
          ['Seated Cable Row', 'secondary', 90],
          ['Machine Shoulder Press', 'secondary', 90],
          ['Leg Extension', 'isolation', 75],
          ['Dead Bug', 'accessory', 45],
        ] },
        { name: 'Full Body C', day: 'Fri', exercises: [
          ['Leg Press', 'main', 120],
          ['Incline Dumbbell Press', 'secondary', 90],
          ['Chest-Supported Row', 'secondary', 90],
          ['Dumbbell Curl', 'isolation', 60],
          ['Standing Calf Raise', 'isolation', 60],
        ] },
      ],
    },
  },

  {
    id: 'thirteen-week-build',
    name: 'Thirteen-Week Build',
    goal: 'muscle',
    level: 'intermediate',
    days: 4,
    weeks: 13,
    repeat: false,
    equipment: 'Full gym',
    summary: 'Three build phases with a deload between each, then a peak week.',
    detail: 'A full quarter of training with an arc: three four-week blocks that get heavier and '
      + 'lower in reps as they go, each followed by a genuine deload week, and a final week to '
      + 'see what it bought you.\n\n'
      + 'Phase one builds work capacity at 12-15 reps, phase two moves to 8-10, phase three to '
      + '5-6. Do not skip the deloads — they are what makes thirteen weeks possible.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Phase 1 Foundation,1-3,Mon,Upper Build,1,Barbell Bench Press,4,12-15,120,7,Leave three reps in reserve early on.
Phase 1 Foundation,1-3,Mon,Upper Build,2,Barbell Row,4,12-15,120,7,
Phase 1 Foundation,1-3,Mon,Upper Build,3,Seated Dumbbell Shoulder Press,3,12-15,90,8,
Phase 1 Foundation,1-3,Mon,Upper Build,4,Lat Pulldown,3,12-15,90,8,
Phase 1 Foundation,1-3,Mon,Upper Build,5,Lateral Raise,3,15-20,60,9,
Phase 1 Foundation,1-3,Tue,Lower Build,1,Back Squat,4,12-15,150,7,
Phase 1 Foundation,1-3,Tue,Lower Build,2,Romanian Deadlift,4,12-15,120,7,
Phase 1 Foundation,1-3,Tue,Lower Build,3,Leg Press,3,15-20,120,8,
Phase 1 Foundation,1-3,Tue,Lower Build,4,Lying Leg Curl,3,15,75,8,
Phase 1 Foundation,1-3,Tue,Lower Build,5,Standing Calf Raise,3,15-20,60,9,
Phase 1 Foundation,1-3,Thu,Upper Volume,1,Incline Dumbbell Press,4,12-15,90,8,
Phase 1 Foundation,1-3,Thu,Upper Volume,2,Seated Cable Row,4,12-15,90,8,
Phase 1 Foundation,1-3,Thu,Upper Volume,3,Chin-Up,3,8-12,120,8,
Phase 1 Foundation,1-3,Thu,Upper Volume,4,Cable Fly,3,15,60,9,
Phase 1 Foundation,1-3,Thu,Upper Volume,5,Cable Curl,3,15,60,9,
Phase 1 Foundation,1-3,Fri,Lower Volume,1,Front Squat,4,12-15,120,8,
Phase 1 Foundation,1-3,Fri,Lower Volume,2,Hip Thrust,4,12-15,120,8,
Phase 1 Foundation,1-3,Fri,Lower Volume,3,Walking Lunge,3,12 each,90,8,
Phase 1 Foundation,1-3,Fri,Lower Volume,4,Seated Leg Curl,3,15,75,9,
Phase 1 Foundation,1-3,Fri,Lower Volume,5,Hanging Leg Raise,3,15,60,8,
Deload,4;8;12,Mon,Deload Upper,1,Barbell Bench Press,3,10,120,5,Half the weight you finished the block on.
Deload,4;8;12,Mon,Deload Upper,2,Lat Pulldown,3,12,90,5,
Deload,4;8;12,Mon,Deload Upper,3,Lateral Raise,2,15,60,6,
Deload,4;8;12,Tue,Deload Lower,1,Back Squat,3,10,150,5,Half the weight. Move well and leave.
Deload,4;8;12,Tue,Deload Lower,2,Lying Leg Curl,3,12,75,5,
Deload,4;8;12,Tue,Deload Lower,3,Plank,3,45s,45,,
Deload,4;8;12,Thu,Deload Push,1,Seated Dumbbell Shoulder Press,3,12,90,5,
Deload,4;8;12,Thu,Deload Push,2,Cable Fly,3,15,60,6,
Deload,4;8;12,Thu,Deload Push,3,Rope Pushdown,2,15,60,6,
Deload,4;8;12,Fri,Deload Pull,1,Seated Cable Row,3,12,90,5,
Deload,4;8;12,Fri,Deload Pull,2,Face Pull,3,15,60,6,
Deload,4;8;12,Fri,Deload Pull,3,Dumbbell Curl,2,15,60,6,
Phase 2 Build,5-7,Mon,Upper Strength,1,Barbell Bench Press,4,8-10,150,8,Heavier than phase one. Same effort.
Phase 2 Build,5-7,Mon,Upper Strength,2,Barbell Row,4,8-10,150,8,
Phase 2 Build,5-7,Mon,Upper Strength,3,Overhead Press,3,8-10,120,8,
Phase 2 Build,5-7,Mon,Upper Strength,4,Chin-Up,3,8-10,120,8,
Phase 2 Build,5-7,Mon,Upper Strength,5,Rope Pushdown,3,12-15,60,9,
Phase 2 Build,5-7,Tue,Lower Strength,1,Back Squat,4,8-10,180,8,
Phase 2 Build,5-7,Tue,Lower Strength,2,Romanian Deadlift,4,8-10,150,8,
Phase 2 Build,5-7,Tue,Lower Strength,3,Bulgarian Split Squat,3,10 each,120,8,
Phase 2 Build,5-7,Tue,Lower Strength,4,Seated Leg Curl,3,12,75,8,
Phase 2 Build,5-7,Tue,Lower Strength,5,Standing Calf Raise,3,15,60,9,
Phase 2 Build,5-7,Thu,Upper Hypertrophy,1,Incline Barbell Bench Press,4,10-12,120,8,
Phase 2 Build,5-7,Thu,Upper Hypertrophy,2,Chest-Supported Row,4,10-12,90,8,
Phase 2 Build,5-7,Thu,Upper Hypertrophy,3,Arnold Press,3,10-12,90,8,
Phase 2 Build,5-7,Thu,Upper Hypertrophy,4,Lateral Raise,4,15,60,9,
Phase 2 Build,5-7,Thu,Upper Hypertrophy,5,EZ-Bar Curl,3,12,75,9,
Phase 2 Build,5-7,Fri,Lower Hypertrophy,1,Front Squat,4,10-12,150,8,
Phase 2 Build,5-7,Fri,Lower Hypertrophy,2,Hip Thrust,4,10-12,120,8,
Phase 2 Build,5-7,Fri,Lower Hypertrophy,3,Leg Press,3,12-15,120,8,
Phase 2 Build,5-7,Fri,Lower Hypertrophy,4,Leg Extension,3,15,60,9,
Phase 2 Build,5-7,Fri,Lower Hypertrophy,5,Seated Calf Raise,3,15,60,9,
Phase 3 Intensify,9-11,Mon,Upper Heavy,1,Barbell Bench Press,5,5-6,210,8.5,The heaviest block. Warm up properly.
Phase 3 Intensify,9-11,Mon,Upper Heavy,2,Barbell Row,4,5-6,180,8.5,
Phase 3 Intensify,9-11,Mon,Upper Heavy,3,Overhead Press,3,6-8,150,8,
Phase 3 Intensify,9-11,Mon,Upper Heavy,4,Chin-Up,3,6-8,120,8,
Phase 3 Intensify,9-11,Mon,Upper Heavy,5,Close-Grip Bench Press,3,8,120,8,
Phase 3 Intensify,9-11,Tue,Lower Heavy,1,Back Squat,5,5-6,240,8.5,
Phase 3 Intensify,9-11,Tue,Lower Heavy,2,Deadlift,3,5,240,8.5,
Phase 3 Intensify,9-11,Tue,Lower Heavy,3,Leg Press,3,10,150,8,
Phase 3 Intensify,9-11,Tue,Lower Heavy,4,Lying Leg Curl,3,12,75,8,
Phase 3 Intensify,9-11,Tue,Lower Heavy,5,Standing Calf Raise,3,12,60,9,
Phase 3 Intensify,9-11,Thu,Upper Support,1,Incline Dumbbell Press,4,8-10,120,8,
Phase 3 Intensify,9-11,Thu,Upper Support,2,Seated Cable Row,4,8-10,120,8,
Phase 3 Intensify,9-11,Thu,Upper Support,3,Seated Dumbbell Shoulder Press,3,10,90,8,
Phase 3 Intensify,9-11,Thu,Upper Support,4,Lateral Raise,3,15,60,9,
Phase 3 Intensify,9-11,Thu,Upper Support,5,Barbell Curl,3,10,75,9,
Phase 3 Intensify,9-11,Fri,Lower Support,1,Front Squat,4,8,150,8,
Phase 3 Intensify,9-11,Fri,Lower Support,2,Romanian Deadlift,4,8,150,8,
Phase 3 Intensify,9-11,Fri,Lower Support,3,Walking Lunge,3,10 each,120,8,
Phase 3 Intensify,9-11,Fri,Lower Support,4,Seated Leg Curl,3,12,75,8,
Phase 3 Intensify,9-11,Fri,Lower Support,5,Hanging Leg Raise,3,12,60,8,
Peak,13,Mon,Bench Test,1,Barbell Bench Press,5,1,300,10,Work up in singles to a new best.
Peak,13,Mon,Bench Test,2,Barbell Row,3,8,120,7,
Peak,13,Tue,Squat Test,1,Back Squat,5,1,300,10,Work up in singles to a new best.
Peak,13,Tue,Squat Test,2,Lying Leg Curl,3,12,75,7,
Peak,13,Thu,Press Test,1,Overhead Press,5,1,240,10,Work up in singles to a new best.
Peak,13,Thu,Press Test,2,Chin-Up,3,8,120,7,
Peak,13,Fri,Deadlift Test,1,Deadlift,5,1,300,10,Work up in singles to a new best.
Peak,13,Fri,Deadlift Test,2,Plank,3,45s,45,,`,
  },
];
