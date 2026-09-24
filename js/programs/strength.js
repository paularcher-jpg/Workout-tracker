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
    weeks: 2,
    repeat: true,
    equipment: 'Barbell',
    summary: 'Two alternating full-body sessions. Add weight every time.',
    detail: 'The simplest thing that works, and the fastest progress you will ever make. '
      + 'Three sessions a week alternating A and B, so you squat every time you train. '
      + 'Add 2.5kg to the bar each session while you can; when a lift stalls twice, drop it '
      + '10% and build back. Expect this to run for two to four months before it stops giving.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Odd weeks,1,Mon Fri,Full Body A,1,Back Squat,3,5,180,8,Add 2.5kg from last session.
Odd weeks,1,Mon Fri,Full Body A,2,Barbell Bench Press,3,5,180,8,Pause briefly on the chest.
Odd weeks,1,Mon Fri,Full Body A,3,Deadlift,1,5,240,8,One hard set only. Reset each rep.
Odd weeks,1,Wed,Full Body B,1,Back Squat,3,5,180,8,Same bar speed as Monday.
Odd weeks,1,Wed,Full Body B,2,Overhead Press,3,5,180,8,Squeeze glutes. No leg drive.
Odd weeks,1,Wed,Full Body B,3,Power Clean,5,3,180,7,Speed over load. Stop if it slows.
Even weeks,2,Mon Fri,Full Body B,1,Back Squat,3,5,180,8,Add 2.5kg from last session.
Even weeks,2,Mon Fri,Full Body B,2,Overhead Press,3,5,180,8,Squeeze glutes. No leg drive.
Even weeks,2,Mon Fri,Full Body B,3,Power Clean,5,3,180,7,Speed over load. Stop if it slows.
Even weeks,2,Wed,Full Body A,1,Back Squat,3,5,180,8,Same bar speed as Monday.
Even weeks,2,Wed,Full Body A,2,Barbell Bench Press,3,5,180,8,Pause briefly on the chest.
Even weeks,2,Wed,Full Body A,3,Deadlift,1,5,240,8,One hard set only. Reset each rep.`,
  },

  {
    id: 'five-by-five',
    name: '5×5 Linear',
    goal: 'strength',
    level: 'beginner',
    days: 3,
    weeks: 2,
    repeat: true,
    equipment: 'Barbell',
    summary: 'Five sets of five on three lifts. More volume than a pure 3×5.',
    detail: 'The other classic beginner template. Five sets of five builds more muscle than '
      + 'three sets of five and stalls a little sooner, which is a fair trade. Alternate A and B '
      + 'across three sessions a week. Add 2.5kg a session on the upper body lifts and 5kg on '
      + 'squats and deadlifts for as long as every rep moves well.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Odd weeks,1,Mon Fri,Workout A,1,Back Squat,5,5,180,8,All five sets at the same weight.
Odd weeks,1,Mon Fri,Workout A,2,Barbell Bench Press,5,5,180,8,Elbows tucked to about 45 degrees.
Odd weeks,1,Mon Fri,Workout A,3,Barbell Row,5,5,150,8,Bar to the lower ribs. Torso still.
Odd weeks,1,Wed,Workout B,1,Back Squat,5,5,180,8,All five sets at the same weight.
Odd weeks,1,Wed,Workout B,2,Overhead Press,5,5,180,8,Head through at lockout.
Odd weeks,1,Wed,Workout B,3,Deadlift,1,5,240,8,One set. Stop if the back rounds.
Even weeks,2,Mon Fri,Workout B,1,Back Squat,5,5,180,8,All five sets at the same weight.
Even weeks,2,Mon Fri,Workout B,2,Overhead Press,5,5,180,8,Head through at lockout.
Even weeks,2,Mon Fri,Workout B,3,Deadlift,1,5,240,8,One set. Stop if the back rounds.
Even weeks,2,Wed,Workout A,1,Back Squat,5,5,180,8,All five sets at the same weight.
Even weeks,2,Wed,Workout A,2,Barbell Bench Press,5,5,180,8,Elbows tucked to about 45 degrees.
Even weeks,2,Wed,Workout A,3,Barbell Row,5,5,150,8,Bar to the lower ribs. Torso still.`,
  },

  {
    id: 'ramping-5x5',
    name: 'Ramping 5×5',
    goal: 'strength',
    level: 'intermediate',
    days: 3,
    weeks: 1,
    repeat: true,
    equipment: 'Barbell',
    summary: 'Heavy, light and record day each week. The step up from linear.',
    detail: 'When adding weight every session stops working, add it every week instead. '
      + 'Monday is the volume day, Wednesday is deliberately light so you recover, and Friday '
      + 'you set a small record. Sets ramp up to the top weight rather than sitting at one load, '
      + 'which lets you handle heavier bars without burying yourself.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Ramping 5x5,1,Mon,Heavy,1,Back Squat,5,5,180,8,Ramp up. Only the last set is hard.
Ramping 5x5,1,Mon,Heavy,2,Barbell Bench Press,5,5,180,8,Ramp to the same top set as last week plus 2.5kg.
Ramping 5x5,1,Mon,Heavy,3,Barbell Row,5,5,150,8,Ramp alongside the bench.
Ramping 5x5,1,Wed,Light,1,Back Squat,4,5,150,6,Stop at 80% of Monday's top set.
Ramping 5x5,1,Wed,Light,2,Overhead Press,4,5,150,7,Ramp to a comfortable top set.
Ramping 5x5,1,Wed,Light,3,Deadlift,4,5,210,7,Ramp. Leave plenty in the tank.
Ramping 5x5,1,Fri,Record,1,Back Squat,4,5,210,9,Four ramping sets then one triple above Monday.
Ramping 5x5,1,Fri,Record,2,Barbell Bench Press,4,5,210,9,Same. A small record beats a big miss.
Ramping 5x5,1,Fri,Record,3,Barbell Row,4,5,150,8,Ramp to a heavy five.`,
  },

  {
    id: 'weekly-undulating',
    name: 'Volume / Light / Intensity',
    goal: 'strength',
    level: 'intermediate',
    days: 3,
    weeks: 1,
    repeat: true,
    equipment: 'Barbell',
    summary: 'One brutal volume day, one easy day, one single heavy set.',
    detail: 'A week with three jobs. Monday accumulates the work that drives adaptation. '
      + 'Wednesday is genuinely light and exists only so Friday is possible. Friday you take '
      + 'one heavy set of five and try to beat last week by the smallest margin that counts. '
      + 'Ruthless about recovery, and it runs for months if you respect the light day.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Undulating,1,Mon,Volume,1,Back Squat,5,5,240,8,All five sets at 90% of Friday's top set.
Undulating,1,Mon,Volume,2,Barbell Bench Press,5,5,210,8,Same weight across. This is the hard day.
Undulating,1,Mon,Volume,3,Barbell Row,5,5,150,8,Keep it strict.
Undulating,1,Wed,Light,1,Back Squat,2,5,150,6,80% of Monday. Move well and leave.
Undulating,1,Wed,Light,2,Overhead Press,3,5,180,8,This is your pressing progression day.
Undulating,1,Wed,Light,3,Chin-Up,3,8,120,8,Add weight when eight is easy.
Undulating,1,Fri,Intensity,1,Back Squat,1,5,300,9.5,One set of five. Beat last Friday.
Undulating,1,Fri,Intensity,2,Barbell Bench Press,1,5,300,9.5,One set of five. Beat last Friday.
Undulating,1,Fri,Intensity,3,Deadlift,1,5,300,9,One set. Every rep from a dead stop.`,
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
    weeks: 1,
    repeat: true,
    equipment: 'Full gym',
    summary: 'Every lift gets a heavy day and a volume day. Three tiers per session.',
    detail: 'Each session has one heavy main lift, one moderate lift for volume, and light '
      + 'accessory work. Over four sessions every big lift appears twice, once heavy and once '
      + 'for reps. Progress the heavy tier until you miss, then change the rep scheme rather '
      + 'than the weight: fives become doubles, doubles become singles, then reset heavier. '
      + 'Much harder to stall out than a plain linear plan.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Tiered,1,Mon,Day 1,1,Back Squat,5,3+,180,8.5,Heavy tier. Last set to a hard rep. When you miss switch to 6x2.
Tiered,1,Mon,Day 1,2,Barbell Bench Press,3,10,120,7,Volume tier. Start light. Add weight weekly.
Tiered,1,Mon,Day 1,3,Lat Pulldown,3,15+,75,8,Accessory tier. Last set as many as you can.
Tiered,1,Tue,Day 2,1,Overhead Press,5,3+,180,8.5,Heavy tier. Last set to a hard rep.
Tiered,1,Tue,Day 2,2,Deadlift,3,10,150,7,Volume tier. Keep the back flat.
Tiered,1,Tue,Day 2,3,Dumbbell Row,3,15+,75,8,Accessory tier.
Tiered,1,Thu,Day 3,1,Barbell Bench Press,5,3+,180,8.5,Heavy tier. Last set to a hard rep.
Tiered,1,Thu,Day 3,2,Back Squat,3,10,150,7,Volume tier.
Tiered,1,Thu,Day 3,3,Lat Pulldown,3,15+,75,8,Accessory tier.
Tiered,1,Fri,Day 4,1,Deadlift,5,3+,210,8.5,Heavy tier. Reset each rep.
Tiered,1,Fri,Day 4,2,Overhead Press,3,10,120,7,Volume tier.
Tiered,1,Fri,Day 4,3,Dumbbell Row,3,15+,75,8,Accessory tier.`,
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
    id: 'three-week-specialisation',
    name: 'Three-Week Specialisation',
    goal: 'strength',
    level: 'advanced',
    days: 4,
    weeks: 3,
    repeat: false,
    equipment: 'Barbell',
    summary: 'Brutal high-frequency block on one lift. Three weeks then stop.',
    detail: 'A short overload block that hammers one lift four times a week at rising intensity '
      + 'and falling volume: sixes, fives, fours, then triples. It works, it hurts, and it is not '
      + 'something to run twice in a row. Use your true max to set the percentages, add a little '
      + 'each week, and test about a week after you finish. Only worth doing if your recovery, '
      + 'sleep and food are genuinely in order.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Specialisation,1-3,Mon,Sixes,1,Back Squat,6,6,180,8,70% of your max. Add 5kg next week.
Specialisation,1-3,Mon,Sixes,2,Chin-Up,3,8,90,7,Everything else stays light.
Specialisation,1-3,Tue,Fives,1,Back Squat,7,5,180,8.5,75% of your max.
Specialisation,1-3,Tue,Fives,2,Barbell Row,3,10,90,7,
Specialisation,1-3,Thu,Fours,1,Back Squat,8,4,210,9,80% of your max.
Specialisation,1-3,Thu,Fours,2,Face Pull,3,15,60,7,
Specialisation,1-3,Sat,Triples,1,Back Squat,10,3,240,9.5,85% of your max. This is the hard one.
Specialisation,1-3,Sat,Triples,2,Plank,3,45s,45,,`,
  },

  {
    id: 'press-focus-lp',
    name: 'Press-Focused Linear',
    goal: 'strength',
    level: 'beginner',
    days: 3,
    weeks: 2,
    repeat: true,
    equipment: 'Barbell',
    summary: 'Linear progression with an AMRAP top set and heavy pressing.',
    detail: 'A linear plan where the last set of every main lift is taken for as many reps as '
      + 'you can manage. That gives you a built-in signal: hit ten or more and jump the weight '
      + 'twice as much next time. Pressing appears every session, so it suits anyone whose '
      + 'overhead strength lags behind their squat.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Odd weeks,1,Mon Fri,Session A,1,Overhead Press,3,5/5/5+,180,9,Last set as many reps as possible.
Odd weeks,1,Mon Fri,Session A,2,Back Squat,3,5/5/5+,210,9,Last set as many reps as possible.
Odd weeks,1,Mon Fri,Session A,3,Chin-Up,3,8,120,8,Add weight when you clear eight.
Odd weeks,1,Wed,Session B,1,Barbell Bench Press,3,5/5/5+,180,9,Last set as many reps as possible.
Odd weeks,1,Wed,Session B,2,Deadlift,1,5+,300,9,One set. Stop when form goes.
Odd weeks,1,Wed,Session B,3,Barbell Row,3,8,120,8,
Even weeks,2,Mon Fri,Session B,1,Barbell Bench Press,3,5/5/5+,180,9,Last set as many reps as possible.
Even weeks,2,Mon Fri,Session B,2,Deadlift,1,5+,300,9,One set. Stop when form goes.
Even weeks,2,Mon Fri,Session B,3,Barbell Row,3,8,120,8,
Even weeks,2,Wed,Session A,1,Overhead Press,3,5/5/5+,180,9,Last set as many reps as possible.
Even weeks,2,Wed,Session A,2,Back Squat,3,5/5/5+,210,9,Last set as many reps as possible.
Even weeks,2,Wed,Session A,3,Chin-Up,3,8,120,8,`,
  },
];
