// Programs for endurance athletes — runners, cyclists, triathletes and
// mountain athletes. The job of the gym here is to make you durable and
// economical, not big, so volume is deliberately low and the heavy work is
// genuinely heavy.
//
// The muscular endurance block follows the method published by Steve House
// and Scott Johnston for mountain athletes: high-rep loaded step-ups and
// lunges, bodyweight first, rest shrinking before load rises.

export const ENDURANCE = [
  {
    id: 'gym-muscular-endurance',
    name: 'Gym Muscular Endurance',
    goal: 'endurance',
    level: 'advanced',
    days: 2,
    weeks: 6,
    repeat: false,
    equipment: 'Box and weight vest',
    source: 'Follows the gym muscular endurance progression published by Evoke Endurance and Uphill Athlete (Steve House and Scott Johnston).',
    summary: 'Six workouts of step-ups and lunges. Bodyweight first, vest later.',
    detail: 'The gym version of the session mountain and ultra athletes use to stop their legs '
      + 'giving out late in a long day. Six workouts over six weeks, each one harder than the '
      + 'last, done on top of your own aerobic volume.\n\n'
      + 'Work through it station by station, not as a circuit: every set of an exercise before you '
      + 'move to the next one. Step-ups and front lunges are done all one leg then all the other, '
      + 'with only thirty seconds between sets. Keep a steady tempo of about a rep a second. The '
      + 'burn is the point, and it should get genuinely unpleasant by the last couple of sets.\n\n'
      + 'The first three workouts are bodyweight only, and progress by adding sets and cutting '
      + 'rest rather than by adding load. Only from workout four does a vest come on, at no more '
      + 'than ten per cent of bodyweight. Going heavier earlier is the usual way people wreck '
      + 'themselves on this.\n\n'
      + 'One prerequisite worth taking seriously: this is a sharpening block, not a foundation. '
      + 'You want an established aerobic base and a general strength block behind you before you '
      + 'start, or it will just make you sore and slow. Six weeks, then stop.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Workout 1 bodyweight,1,Tue,ME Workout 1,1,Box Step-Up,4,10 each,30,8.5,All right leg then all left leg. Bodyweight only.
Workout 1 bodyweight,1,Tue,ME Workout 1,2,Front Lunge,4,10 each,30,8.5,All right leg then all left leg. Bodyweight only.
Workout 1 bodyweight,1,Tue,ME Workout 1,3,Split Jump,4,10 each,60,8.5,Land soft. Bodyweight throughout.
Workout 1 bodyweight,1,Tue,ME Workout 1,4,Box Step-Down,4,10 each,60,8.5,Lower under control. This is the descent. Bodyweight only.
Workout 1 bodyweight,1,Tue,ME Workout 1,5,Hanging Leg Raise,3,12,45,8,
Workout 1 bodyweight,1,Tue,ME Workout 1,6,Copenhagen Plank,3,25s each,45,8,
Workout 1 bodyweight,1,Tue,ME Workout 1,7,Hollow Body Hold,3,40s,45,8,
Workout 1 bodyweight,1,Sat,General Strength,1,Back Squat,3,5,180,7,Hold onto max strength. Never grind.
Workout 1 bodyweight,1,Sat,General Strength,2,Trap Bar Deadlift,3,5,180,7,
Workout 1 bodyweight,1,Sat,General Strength,3,Pull-Up,3,6,120,7,
Workout 1 bodyweight,1,Sat,General Strength,4,Farmer Carry,3,45s,90,7,Pack-carrying strength.
Workout 2 bodyweight,2,Tue,ME Workout 2,1,Box Step-Up,5,10 each,30,8.5,All right leg then all left leg. Bodyweight only.
Workout 2 bodyweight,2,Tue,ME Workout 2,2,Front Lunge,5,10 each,30,8.5,All right leg then all left leg. Bodyweight only.
Workout 2 bodyweight,2,Tue,ME Workout 2,3,Split Jump,5,10 each,60,8.5,Land soft. Bodyweight throughout.
Workout 2 bodyweight,2,Tue,ME Workout 2,4,Box Step-Down,5,10 each,60,8.5,Lower under control. This is the descent. Bodyweight only.
Workout 2 bodyweight,2,Tue,ME Workout 2,5,Hanging Leg Raise,3,12,45,8,
Workout 2 bodyweight,2,Tue,ME Workout 2,6,Copenhagen Plank,3,25s each,45,8,
Workout 2 bodyweight,2,Tue,ME Workout 2,7,Hollow Body Hold,3,40s,45,8,
Workout 2 bodyweight,2,Sat,General Strength,1,Back Squat,3,5,180,7,Hold onto max strength. Never grind.
Workout 2 bodyweight,2,Sat,General Strength,2,Trap Bar Deadlift,3,5,180,7,
Workout 2 bodyweight,2,Sat,General Strength,3,Pull-Up,3,6,120,7,
Workout 2 bodyweight,2,Sat,General Strength,4,Farmer Carry,3,45s,90,7,Pack-carrying strength.
Workout 3 shrink the rest,3,Tue,ME Workout 3,1,Box Step-Up,7,10 each,30,8.5,All right leg then all left leg. Still bodyweight. The rest is what changed.
Workout 3 shrink the rest,3,Tue,ME Workout 3,2,Front Lunge,7,10 each,30,8.5,All right leg then all left leg. Still bodyweight. The rest is what changed.
Workout 3 shrink the rest,3,Tue,ME Workout 3,3,Split Jump,7,10 each,45,8.5,Land soft. Bodyweight throughout.
Workout 3 shrink the rest,3,Tue,ME Workout 3,4,Box Step-Down,7,10 each,45,8.5,Lower under control. This is the descent. Still bodyweight. The rest is what changed.
Workout 3 shrink the rest,3,Tue,ME Workout 3,5,Hanging Leg Raise,3,12,45,8,
Workout 3 shrink the rest,3,Tue,ME Workout 3,6,Copenhagen Plank,3,25s each,45,8,
Workout 3 shrink the rest,3,Tue,ME Workout 3,7,Hollow Body Hold,3,40s,45,8,
Workout 3 shrink the rest,3,Sat,General Strength,1,Back Squat,3,5,180,7,Hold onto max strength. Never grind.
Workout 3 shrink the rest,3,Sat,General Strength,2,Trap Bar Deadlift,3,5,180,7,
Workout 3 shrink the rest,3,Sat,General Strength,3,Pull-Up,3,6,120,7,
Workout 3 shrink the rest,3,Sat,General Strength,4,Farmer Carry,3,45s,90,7,Pack-carrying strength.
Workout 4 vest on,4,Tue,ME Workout 4,1,Box Step-Up,5,10 each,60,8.5,All right leg then all left leg. Vest at ten per cent of bodyweight.
Workout 4 vest on,4,Tue,ME Workout 4,2,Front Lunge,5,10 each,60,8.5,All right leg then all left leg. Vest at ten per cent of bodyweight.
Workout 4 vest on,4,Tue,ME Workout 4,3,Split Jump,5,10 each,60,8.5,Bodyweight. No vest for jumps.
Workout 4 vest on,4,Tue,ME Workout 4,4,Box Step-Down,5,10 each,60,8.5,Lower under control. This is the descent. Vest at ten per cent of bodyweight.
Workout 4 vest on,4,Tue,ME Workout 4,5,Hanging Leg Raise,3,12,45,8,
Workout 4 vest on,4,Tue,ME Workout 4,6,Copenhagen Plank,3,25s each,45,8,
Workout 4 vest on,4,Tue,ME Workout 4,7,Hollow Body Hold,3,40s,45,8,
Workout 4 vest on,4,Sat,General Strength,1,Back Squat,3,5,180,7,Hold onto max strength. Never grind.
Workout 4 vest on,4,Sat,General Strength,2,Trap Bar Deadlift,3,5,180,7,
Workout 4 vest on,4,Sat,General Strength,3,Pull-Up,3,6,120,7,
Workout 4 vest on,4,Sat,General Strength,4,Farmer Carry,3,45s,90,7,Pack-carrying strength.
Workout 5 more sets,5,Tue,ME Workout 5,1,Box Step-Up,6,10 each,30,8.5,All right leg then all left leg. Vest on.
Workout 5 more sets,5,Tue,ME Workout 5,2,Front Lunge,6,10 each,30,8.5,All right leg then all left leg. Vest on.
Workout 5 more sets,5,Tue,ME Workout 5,3,Split Jump,6,10 each,45,8.5,Bodyweight. No vest for jumps.
Workout 5 more sets,5,Tue,ME Workout 5,4,Box Step-Down,6,10 each,45,8.5,Lower under control. This is the descent. Vest on.
Workout 5 more sets,5,Tue,ME Workout 5,5,Hanging Leg Raise,3,12,45,8,
Workout 5 more sets,5,Tue,ME Workout 5,6,Copenhagen Plank,3,25s each,45,8,
Workout 5 more sets,5,Tue,ME Workout 5,7,Hollow Body Hold,3,40s,45,8,
Workout 5 more sets,5,Sat,General Strength,1,Back Squat,3,5,180,7,Hold onto max strength. Never grind.
Workout 5 more sets,5,Sat,General Strength,2,Trap Bar Deadlift,3,5,180,7,
Workout 5 more sets,5,Sat,General Strength,3,Pull-Up,3,6,120,7,
Workout 5 more sets,5,Sat,General Strength,4,Farmer Carry,3,45s,90,7,Pack-carrying strength.
Workout 6 the peak,6,Tue,ME Workout 6,1,Box Step-Up,7,10 each,30,8.5,All right leg then all left leg. Vest on. The hardest session of the block.
Workout 6 the peak,6,Tue,ME Workout 6,2,Front Lunge,7,10 each,30,8.5,All right leg then all left leg. Vest on. The hardest session of the block.
Workout 6 the peak,6,Tue,ME Workout 6,3,Split Jump,7,10 each,45,8.5,Bodyweight. No vest for jumps.
Workout 6 the peak,6,Tue,ME Workout 6,4,Box Step-Down,7,10 each,45,8.5,Lower under control. This is the descent. Vest on. The hardest session of the block.
Workout 6 the peak,6,Tue,ME Workout 6,5,Hanging Leg Raise,3,12,45,8,
Workout 6 the peak,6,Tue,ME Workout 6,6,Copenhagen Plank,3,25s each,45,8,
Workout 6 the peak,6,Tue,ME Workout 6,7,Hollow Body Hold,3,40s,45,8,
Workout 6 the peak,6,Sat,General Strength,1,Back Squat,3,5,180,7,Hold onto max strength. Never grind.
Workout 6 the peak,6,Sat,General Strength,2,Trap Bar Deadlift,3,5,180,7,
Workout 6 the peak,6,Sat,General Strength,3,Pull-Up,3,6,120,7,
Workout 6 the peak,6,Sat,General Strength,4,Farmer Carry,3,45s,90,7,Pack-carrying strength.`,
  },
  {
    id: 'runner-strength-base',
    name: "Runner's Strength — Base",
    goal: 'endurance',
    level: 'beginner',
    days: 2,
    weeks: 1,
    repeat: true,
    equipment: 'Full gym',
    summary: 'Two short heavy sessions a week. Built for running economy.',
    detail: 'Heavy, low-rep, low-volume lifting is the version of strength work that actually '
      + 'improves running economy — light circuits do not. Two sessions a week, four to six reps '
      + 'on the main lifts, nowhere near failure, and never so much volume that tomorrow’s run '
      + 'suffers. Run this in base season when mileage is moderate. If a session leaves your legs '
      + 'wrecked for two days, cut a set, not the weight.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Base,1,Tue,Heavy Lower,1,Back Squat,4,5,180,8,Heavy but never grinding. Stop two reps short.
Base,1,Tue,Heavy Lower,2,Romanian Deadlift,3,6,150,8,
Base,1,Tue,Heavy Lower,3,Bulgarian Split Squat,3,8 each,120,8,
Base,1,Tue,Heavy Lower,4,Single-Leg Calf Raise,3,12 each,75,8,Slow down. Three seconds lowering.
Base,1,Tue,Heavy Lower,5,Plank,3,45s,45,,
Base,1,Fri,Power and Posterior,1,Trap Bar Deadlift,4,5,180,8,
Base,1,Fri,Power and Posterior,2,Box Jump,4,4,120,7,Land soft. Step back down every time.
Base,1,Fri,Power and Posterior,3,Hip Thrust,3,8,120,8,
Base,1,Fri,Power and Posterior,4,Nordic Curl,3,5,120,8,Lower as slowly as you can.
Base,1,Fri,Power and Posterior,5,Copenhagen Plank,3,20s each,45,,Adductors. Runners neglect these.`,
  },

  {
    id: 'runner-strength-inseason',
    name: "Runner's Strength — In Season",
    goal: 'endurance',
    level: 'intermediate',
    days: 2,
    weeks: 1,
    repeat: true,
    equipment: 'Full gym',
    summary: 'Maintenance only. Keeps the strength you built without stealing legs.',
    detail: 'When mileage and intensity go up, lifting has to get out of the way. This keeps '
      + 'two short sessions a week at heavy loads and tiny volume — enough to hold onto strength, '
      + 'not enough to cost you a workout. Two to three sets, three to five reps, always well '
      + 'short of failure. Put these on the same day as a hard run rather than on an easy day, '
      + 'so easy days stay easy.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
In Season,1,Tue,Maintain A,1,Back Squat,3,4,180,7,Same bar speed every rep. Leave three in reserve.
In Season,1,Tue,Maintain A,2,Single-Leg Romanian Deadlift,2,8 each,90,7,
In Season,1,Tue,Maintain A,3,Single-Leg Calf Raise,3,12 each,60,7,
In Season,1,Tue,Maintain A,4,Side Plank,2,30s each,45,,
In Season,1,Fri,Maintain B,1,Trap Bar Deadlift,3,4,180,7,
In Season,1,Fri,Maintain B,2,Pogo Hop,3,20,60,6,Stiff ankles. Minimal ground contact.
In Season,1,Fri,Maintain B,3,Hip Thrust,2,8,90,7,
In Season,1,Fri,Maintain B,4,Dead Bug,3,10 each,45,,`,
  },

  {
    id: 'muscular-endurance-mountain',
    name: 'Muscular Endurance — Mountain',
    goal: 'endurance',
    level: 'advanced',
    days: 3,
    weeks: 6,
    repeat: false,
    equipment: 'Box and weight vest',
    summary: 'High-rep loaded step-ups. Builds legs that do not fail on hour six.',
    detail: 'The block mountain and ultra athletes use to stop their legs giving out late in a '
      + 'long day. High-rep step-ups and lunges, done to a deep local burn, with rest shrinking '
      + 'week by week before any load is added. Bodyweight for the first four weeks — this is '
      + 'much harder than it reads — then a vest at around ten per cent of bodyweight.\n\n'
      + 'Only run this on top of an existing aerobic base and a general strength block. Doing it '
      + 'too early is the classic mistake: it is a sharpening tool, not a foundation. Six weeks, '
      + 'then stop.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Base 4 sets,1-2,Tue,ME Circuit A,1,Box Step-Up,4,10 each,60,8,Bodyweight. Knee-height box. Drive through the whole foot.
Base 4 sets,1-2,Tue,ME Circuit A,2,Walking Lunge,4,10 each,60,8,Bodyweight.
Base 4 sets,1-2,Tue,ME Circuit A,3,Box Step-Down,4,10 each,60,8,Lower under control. This is the downhill.
Base 4 sets,1-2,Tue,ME Circuit A,4,Single-Leg Calf Raise,4,15 each,45,8,
Base 4 sets,1-2,Tue,ME Circuit A,5,Plank,3,60s,45,,
Base 4 sets,1-2,Fri,ME Circuit B,1,Box Step-Up,4,10 each,60,8,Bodyweight. Same box as Tuesday.
Base 4 sets,1-2,Fri,ME Circuit B,2,Split Jump,4,10 each,60,8,Land quietly.
Base 4 sets,1-2,Fri,ME Circuit B,3,Reverse Lunge,4,10 each,60,8,
Base 4 sets,1-2,Fri,ME Circuit B,4,Copenhagen Plank,3,20s each,45,,
Base 4 sets,1-2,Sun,General Strength,1,Back Squat,3,6,180,7,Keep general strength ticking over.
Base 4 sets,1-2,Sun,General Strength,2,Romanian Deadlift,3,8,150,7,
Base 4 sets,1-2,Sun,General Strength,3,Pull-Up,3,6,120,7,
Base 4 sets,1-2,Sun,General Strength,4,Dead Bug,3,10 each,45,,
Build 6 sets,3-4,Tue,ME Circuit A,1,Box Step-Up,6,10 each,45,8.5,Still bodyweight. Rest is the thing that changes.
Build 6 sets,3-4,Tue,ME Circuit A,2,Walking Lunge,6,10 each,45,8.5,
Build 6 sets,3-4,Tue,ME Circuit A,3,Box Step-Down,6,10 each,45,8.5,
Build 6 sets,3-4,Tue,ME Circuit A,4,Single-Leg Calf Raise,5,15 each,30,8.5,
Build 6 sets,3-4,Tue,ME Circuit A,5,Plank,3,60s,45,,
Build 6 sets,3-4,Fri,ME Circuit B,1,Box Step-Up,6,10 each,45,8.5,
Build 6 sets,3-4,Fri,ME Circuit B,2,Split Jump,5,10 each,45,8.5,
Build 6 sets,3-4,Fri,ME Circuit B,3,Reverse Lunge,6,10 each,45,8.5,
Build 6 sets,3-4,Fri,ME Circuit B,4,Copenhagen Plank,3,25s each,45,,
Build 6 sets,3-4,Sun,General Strength,1,Back Squat,3,6,180,7,
Build 6 sets,3-4,Sun,General Strength,2,Romanian Deadlift,3,8,150,7,
Build 6 sets,3-4,Sun,General Strength,3,Pull-Up,3,6,120,7,
Build 6 sets,3-4,Sun,General Strength,4,Dead Bug,3,10 each,45,,
Loaded,5-6,Tue,ME Circuit A,1,Box Step-Up,6,10 each,45,9,Weight vest at ten per cent of bodyweight. No more.
Loaded,5-6,Tue,ME Circuit A,2,Walking Lunge,5,10 each,45,9,Vest on.
Loaded,5-6,Tue,ME Circuit A,3,Box Step-Down,5,10 each,45,9,Vest on. Control the lowering.
Loaded,5-6,Tue,ME Circuit A,4,Single-Leg Calf Raise,5,15 each,30,9,
Loaded,5-6,Tue,ME Circuit A,5,Plank,3,60s,45,,
Loaded,5-6,Fri,ME Circuit B,1,Box Step-Up,6,10 each,45,9,Vest on.
Loaded,5-6,Fri,ME Circuit B,2,Split Jump,4,10 each,60,8,No vest for jumps.
Loaded,5-6,Fri,ME Circuit B,3,Reverse Lunge,5,10 each,45,9,Vest on.
Loaded,5-6,Fri,ME Circuit B,4,Copenhagen Plank,3,30s each,45,,
Loaded,5-6,Sun,General Strength,1,Back Squat,3,5,180,7,Keep it light. The circuits are the work now.
Loaded,5-6,Sun,General Strength,2,Romanian Deadlift,3,6,150,7,
Loaded,5-6,Sun,General Strength,3,Pull-Up,3,6,120,7,
Loaded,5-6,Sun,General Strength,4,Dead Bug,3,10 each,45,,`,
  },

  {
    id: 'mountain-general-strength',
    name: 'Mountain General Strength',
    goal: 'endurance',
    level: 'beginner',
    days: 3,
    weeks: 8,
    repeat: false,
    equipment: 'Full gym',
    summary: 'The eight weeks you do before you earn the right to train muscular endurance.',
    detail: 'General strength first, always. This is the block that makes a muscular endurance '
      + 'phase safe and worth doing: eight weeks moving from bodyweight competence through to '
      + 'genuinely heavy compound lifting, with single-leg work and core throughout. Weeks one '
      + 'to three are about movement quality, four to six add load, seven and eight get heavy. '
      + 'Run it in the off season when aerobic volume is lowest.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Foundation,1-3,Mon,Full Body A,1,Goblet Squat,3,12,90,7,Own the movement before you load it.
Foundation,1-3,Mon,Full Body A,2,Push-Up,3,12,90,7,
Foundation,1-3,Mon,Full Body A,3,Inverted Row,3,10,90,7,
Foundation,1-3,Mon,Full Body A,4,Single-Leg Glute Bridge,3,12 each,60,7,
Foundation,1-3,Mon,Full Body A,5,Plank,3,45s,45,,
Foundation,1-3,Wed,Full Body B,1,Box Step-Up,3,10 each,90,7,Bodyweight. Knee-height box.
Foundation,1-3,Wed,Full Body B,2,Romanian Deadlift,3,10,120,7,Light. Learn the hinge.
Foundation,1-3,Wed,Full Body B,3,Pike Push-Up,3,8,90,7,
Foundation,1-3,Wed,Full Body B,4,Bird Dog,3,10 each,45,,
Foundation,1-3,Fri,Full Body C,1,Reverse Lunge,3,10 each,90,7,
Foundation,1-3,Fri,Full Body C,2,Lat Pulldown,3,12,90,7,
Foundation,1-3,Fri,Full Body C,3,Single-Leg Calf Raise,3,15 each,60,7,
Foundation,1-3,Fri,Full Body C,4,Side Plank,3,30s each,45,,
Loading,4-6,Mon,Strength A,1,Back Squat,4,8,150,8,Now add weight every week.
Loading,4-6,Mon,Strength A,2,Barbell Bench Press,3,8,120,8,
Loading,4-6,Mon,Strength A,3,Barbell Row,3,8,120,8,
Loading,4-6,Mon,Strength A,4,Hip Thrust,3,10,90,8,
Loading,4-6,Mon,Strength A,5,Plank,3,60s,45,,
Loading,4-6,Wed,Strength B,1,Trap Bar Deadlift,4,8,150,8,
Loading,4-6,Wed,Strength B,2,Bulgarian Split Squat,3,10 each,120,8,
Loading,4-6,Wed,Strength B,3,Overhead Press,3,8,120,8,
Loading,4-6,Wed,Strength B,4,Copenhagen Plank,3,20s each,45,,
Loading,4-6,Fri,Strength C,1,Front Squat,3,8,150,8,
Loading,4-6,Fri,Strength C,2,Pull-Up,3,6,120,8,
Loading,4-6,Fri,Strength C,3,Nordic Curl,3,5,120,8,
Loading,4-6,Fri,Strength C,4,Farmer Carry,3,45s,90,8,Heavy. Stay tall.
Max Strength,7-8,Mon,Heavy A,1,Back Squat,5,5,210,8.5,The heaviest weeks. Warm up thoroughly.
Max Strength,7-8,Mon,Heavy A,2,Barbell Bench Press,4,5,180,8.5,
Max Strength,7-8,Mon,Heavy A,3,Barbell Row,3,6,150,8,
Max Strength,7-8,Mon,Heavy A,4,Plank,3,60s,45,,
Max Strength,7-8,Wed,Heavy B,1,Trap Bar Deadlift,5,5,210,8.5,
Max Strength,7-8,Wed,Heavy B,2,Bulgarian Split Squat,3,8 each,120,8,
Max Strength,7-8,Wed,Heavy B,3,Overhead Press,4,5,150,8.5,
Max Strength,7-8,Wed,Heavy B,4,Hanging Leg Raise,3,12,60,8,
Max Strength,7-8,Fri,Heavy C,1,Front Squat,4,5,180,8.5,
Max Strength,7-8,Fri,Heavy C,2,Pull-Up,4,5,120,8.5,
Max Strength,7-8,Fri,Heavy C,3,Nordic Curl,3,6,120,8,
Max Strength,7-8,Fri,Heavy C,4,Farmer Carry,3,60s,90,8,`,
  },

  {
    id: 'trail-ultra-durability',
    name: 'Trail Ultra Durability',
    goal: 'endurance',
    level: 'intermediate',
    days: 3,
    weeks: 1,
    repeat: true,
    equipment: 'Full gym',
    summary: 'Eccentric and single-leg work. For the descents that wreck you.',
    detail: 'Downhill running is where trail races are actually lost, and it is eccentric loading '
      + 'that causes the damage. This week is built around controlled lowering — step-downs, slow '
      + 'Nordics, tempo squats — plus the single-leg stability work that keeps ankles and hips '
      + 'honest on uneven ground. Expect to be sore for the first fortnight; that is the point, '
      + 'and it stops once you adapt.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Durability,1,Tue,Eccentric Legs,1,Back Squat,4,6,180,8,Four seconds down on every rep.
Durability,1,Tue,Eccentric Legs,2,Box Step-Down,4,8 each,90,8,Three seconds to the floor. No dropping.
Durability,1,Tue,Eccentric Legs,3,Nordic Curl,4,5,120,8,As slow as you can hold it.
Durability,1,Tue,Eccentric Legs,4,Single-Leg Calf Raise,3,15 each,60,8,Slow lowering.
Durability,1,Tue,Eccentric Legs,5,Copenhagen Plank,3,25s each,45,,
Durability,1,Thu,Stability and Core,1,Single-Leg Romanian Deadlift,4,8 each,90,8,
Durability,1,Thu,Stability and Core,2,Lateral Lunge,3,10 each,90,8,Frontal plane. Trails are not flat.
Durability,1,Thu,Stability and Core,3,Monster Walk,3,15 each,60,7,
Durability,1,Thu,Stability and Core,4,Pallof Press,3,10 each,60,8,
Durability,1,Thu,Stability and Core,5,Side Plank,3,40s each,45,,
Durability,1,Sat,Power and Carry,1,Trap Bar Deadlift,4,5,180,8,
Durability,1,Sat,Power and Carry,2,Box Jump,4,4,120,7,Land soft.
Durability,1,Sat,Power and Carry,3,Walking Lunge,3,12 each,90,8,
Durability,1,Sat,Power and Carry,4,Farmer Carry,3,60s,90,8,Pack-carrying strength.
Durability,1,Sat,Power and Carry,5,Hanging Leg Raise,3,12,60,8,`,
  },

  {
    id: 'cyclist-strength',
    name: "Cyclist's Strength",
    goal: 'endurance',
    level: 'beginner',
    days: 2,
    weeks: 1,
    repeat: true,
    equipment: 'Full gym',
    summary: 'Heavy legs and the posterior chain cycling never loads.',
    detail: 'Cycling is a narrow movement: seated, one plane, no impact, and almost no work for '
      + 'the hamstrings or the bones. Two sessions a week fix what the bike neglects — heavy '
      + 'bilateral squatting and hinging for power, single-leg work for the imbalance every '
      + 'cyclist develops, and upper back work to undo the position. Low volume, high load, and '
      + 'never the day before a hard ride.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Cyclist,1,Tue,Legs and Hinge,1,Back Squat,4,5,180,8,
Cyclist,1,Tue,Legs and Hinge,2,Romanian Deadlift,3,6,150,8,Hamstrings. The bike does nothing for these.
Cyclist,1,Tue,Legs and Hinge,3,Bulgarian Split Squat,3,8 each,120,8,
Cyclist,1,Tue,Legs and Hinge,4,Standing Calf Raise,3,12,75,8,
Cyclist,1,Tue,Legs and Hinge,5,Plank,3,45s,45,,
Cyclist,1,Fri,Power and Posture,1,Trap Bar Deadlift,4,5,180,8,
Cyclist,1,Fri,Power and Posture,2,Box Jump,3,4,120,7,Bone loading. Cycling gives you none.
Cyclist,1,Fri,Power and Posture,3,Barbell Row,3,8,120,8,Undo the riding position.
Cyclist,1,Fri,Power and Posture,4,Face Pull,3,15,60,8,
Cyclist,1,Fri,Power and Posture,5,Hip Thrust,3,8,120,8,`,
  },

  {
    id: 'triathlete-strength',
    name: "Triathlete's Strength",
    goal: 'endurance',
    level: 'intermediate',
    days: 2,
    weeks: 1,
    repeat: true,
    equipment: 'Full gym',
    summary: 'Whole-body work that fits round three sports. Shoulders included.',
    detail: 'Three disciplines already fill the week, so the gym gets two sessions and has to '
      + 'earn them. Heavy lower body for the bike and run, pulling and shoulder stability for the '
      + 'swim, and core work that ties the three together. Kept short on purpose — if lifting '
      + 'starts costing you swim or run quality, cut a set rather than dropping the session.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Triathlon,1,Tue,Lower and Pull,1,Back Squat,4,5,180,8,
Triathlon,1,Tue,Lower and Pull,2,Romanian Deadlift,3,6,150,8,
Triathlon,1,Tue,Lower and Pull,3,Pull-Up,3,6,120,8,Swim pull strength.
Triathlon,1,Tue,Lower and Pull,4,Straight-Arm Pulldown,3,12,60,8,The swim catch.
Triathlon,1,Tue,Lower and Pull,5,Plank,3,45s,45,,
Triathlon,1,Fri,Power and Shoulders,1,Trap Bar Deadlift,4,5,180,8,
Triathlon,1,Fri,Power and Shoulders,2,Single-Leg Romanian Deadlift,3,8 each,90,8,
Triathlon,1,Fri,Power and Shoulders,3,Seated Dumbbell Shoulder Press,3,8,120,8,
Triathlon,1,Fri,Power and Shoulders,4,Face Pull,3,15,60,8,Shoulder health. Non-negotiable for swimmers.
Triathlon,1,Fri,Power and Shoulders,5,Side Plank,3,30s each,45,,`,
  },

  {
    id: 'hybrid-conditioning',
    name: 'Hybrid Conditioning',
    goal: 'endurance',
    level: 'intermediate',
    days: 4,
    weeks: 1,
    repeat: true,
    equipment: 'Full gym plus sled and erg',
    summary: 'Strength plus sleds, carries and ergs. For fitness-race formats.',
    detail: 'Built for the races that alternate running with functional stations — sled pushes, '
      + 'carries, wall balls, rowing. Two strength days keep you capable of moving heavy things, '
      + 'two mixed days train the specific skill of working hard with your heart rate already '
      + 'buried. The compromise is real: you will not get as strong as a pure strength plan or '
      + 'as fit as a pure running one, which is exactly the trade these events ask for.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Hybrid,1,Mon,Strength Lower,1,Back Squat,4,5,180,8,
Hybrid,1,Mon,Strength Lower,2,Romanian Deadlift,3,8,150,8,
Hybrid,1,Mon,Strength Lower,3,Walking Lunge,3,12 each,120,8,
Hybrid,1,Mon,Strength Lower,4,Standing Calf Raise,3,15,60,8,
Hybrid,1,Tue,Engine,1,Ski Erg,5,60s,60,8,Hard minute. Easy minute. Repeat.
Hybrid,1,Tue,Engine,2,Sled Push,6,30s,90,9,Heavy. Short. Brutal.
Hybrid,1,Tue,Engine,3,Farmer Carry,4,45s,60,8,
Hybrid,1,Tue,Engine,4,Wall Ball,4,20,60,8,
Hybrid,1,Thu,Strength Upper,1,Barbell Bench Press,4,5,180,8,
Hybrid,1,Thu,Strength Upper,2,Barbell Row,4,8,150,8,
Hybrid,1,Thu,Strength Upper,3,Overhead Press,3,8,120,8,
Hybrid,1,Thu,Strength Upper,4,Pull-Up,3,8,120,8,
Hybrid,1,Sat,Mixed,1,Rowing Machine,4,240s,90,8,Four minutes hard. Hold the split.
Hybrid,1,Sat,Mixed,2,Burpee,5,15,60,9,
Hybrid,1,Sat,Mixed,3,Sandbag Carry,4,60s,90,8,
Hybrid,1,Sat,Mixed,4,Kettlebell Swing,5,20,60,8,
Hybrid,1,Sat,Mixed,5,Plank,3,60s,45,,`,
  },

  {
    id: 'marathon-strength-12',
    name: 'Marathon Strength — 12 Week',
    goal: 'endurance',
    level: 'intermediate',
    days: 2,
    weeks: 12,
    repeat: false,
    equipment: 'Full gym',
    summary: 'Twelve weeks that back off as your mileage climbs. Ends race-ready.',
    detail: 'Strength work timed to a marathon build. Weeks one to four load heavily while '
      + 'mileage is still moderate, weeks five to eight hold strength with less volume as the long '
      + 'runs get long, weeks nine to eleven drop to pure maintenance, and week twelve is little '
      + 'more than movement. The whole design is about giving the running back what the lifting '
      + 'borrows, at the right time.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Load,1-4,Tue,Heavy Lower,1,Back Squat,4,5,180,8,Build weight each week while mileage is moderate.
Load,1-4,Tue,Heavy Lower,2,Romanian Deadlift,3,6,150,8,
Load,1-4,Tue,Heavy Lower,3,Bulgarian Split Squat,3,8 each,120,8,
Load,1-4,Tue,Heavy Lower,4,Single-Leg Calf Raise,3,12 each,75,8,
Load,1-4,Tue,Heavy Lower,5,Plank,3,45s,45,,
Load,1-4,Fri,Power,1,Trap Bar Deadlift,4,5,180,8,
Load,1-4,Fri,Power,2,Box Jump,4,4,120,7,
Load,1-4,Fri,Power,3,Hip Thrust,3,8,120,8,
Load,1-4,Fri,Power,4,Nordic Curl,3,5,120,8,
Load,1-4,Fri,Power,5,Copenhagen Plank,3,20s each,45,,
Hold,5-8,Tue,Heavy Lower,1,Back Squat,3,4,180,7,Same weight as week four. Fewer sets.
Hold,5-8,Tue,Heavy Lower,2,Romanian Deadlift,2,6,150,7,
Hold,5-8,Tue,Heavy Lower,3,Single-Leg Calf Raise,3,12 each,60,7,
Hold,5-8,Tue,Heavy Lower,4,Plank,3,45s,45,,
Hold,5-8,Fri,Power,1,Trap Bar Deadlift,3,4,180,7,
Hold,5-8,Fri,Power,2,Pogo Hop,3,20,60,6,
Hold,5-8,Fri,Power,3,Hip Thrust,2,8,90,7,
Hold,5-8,Fri,Power,4,Dead Bug,3,10 each,45,,
Maintain,9-11,Tue,Maintain A,1,Back Squat,2,4,180,6,Two sets. In and out. Legs belong to the long run now.
Maintain,9-11,Tue,Maintain A,2,Single-Leg Calf Raise,2,12 each,60,6,
Maintain,9-11,Tue,Maintain A,3,Side Plank,2,30s each,45,,
Maintain,9-11,Fri,Maintain B,1,Trap Bar Deadlift,2,4,180,6,
Maintain,9-11,Fri,Maintain B,2,Hip Thrust,2,8,90,6,
Maintain,9-11,Fri,Maintain B,3,Dead Bug,2,10 each,45,,
Taper,12,Tue,Movement A,1,Goblet Squat,2,8,90,5,Nothing heavy. Just move.
Taper,12,Tue,Movement A,2,Glute Bridge,2,12,60,5,
Taper,12,Fri,Movement B,1,Single-Leg Glute Bridge,2,10 each,60,5,
Taper,12,Fri,Movement B,2,Bird Dog,2,10 each,45,,`,
  },
];
