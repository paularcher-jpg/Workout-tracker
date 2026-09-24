// Programs that need little or no equipment, plus short circuit-style
// conditioning weeks. These exist for the days you cannot get to a gym and
// for people who would rather train for thirty minutes than ninety.

export const MINIMAL = [
  {
    id: 'bodyweight-basics',
    name: 'Bodyweight Basics',
    goal: 'bodyweight',
    level: 'beginner',
    days: 3,
    equipment: 'Pull-up bar',
    summary: 'Twelve weeks of push, pull, squat and hinge. Nothing but a bar to hang from.',
    detail: 'Bodyweight training works as long as you keep making it harder, so this is a block '
      + 'rather than a week on a loop. Volume rises across the phases and the deloads keep the '
      + 'joints happy.\n\n'
      + 'You cannot put 2.5kg on a press-up, so the other half of the progression is yours: when '
      + 'you clear the top of the rep range on every set, move to the harder version of the '
      + 'movement and start again at the bottom. Push-ups become diamond push-ups become one-arm '
      + 'work; squats become pistols; rows become chin-ups.',
    spec: {
      length: 12,
      roleset: 'bodyweight',
      sessions: [
        { name: 'Full Body A', day: 'Mon', exercises: [
          ['Pull-Up', 'main', 120],
          ['Push-Up', 'main', 90],
          ['Bulgarian Split Squat', 'secondary', 90],
          ['Nordic Curl', 'power', 120],
          ['Hollow Body Hold', 'hold', 45, '30s'],
        ] },
        { name: 'Full Body B', day: 'Wed', exercises: [
          ['Inverted Row', 'main', 90],
          ['Pike Push-Up', 'main', 90],
          ['Pistol Squat', 'power', 120],
          ['Single-Leg Glute Bridge', 'accessory', 60],
          ['Side Plank', 'hold', 45, '30s each'],
        ] },
        { name: 'Full Body C', day: 'Fri', exercises: [
          ['Chin-Up', 'main', 120],
          ['Diamond Push-Up', 'secondary', 90],
          ['Walking Lunge', 'accessory', 90],
          ['Single-Leg Calf Raise', 'isolation', 60],
          ['L-Sit', 'hold', 60, '20s'],
        ] },
      ],
    },
  },

  {
    id: 'kettlebell-minimal',
    name: 'One Kettlebell',
    goal: 'conditioning',
    level: 'beginner',
    days: 5,
    weeks: 8,
    repeat: false,
    equipment: 'One kettlebell',
    summary: 'Swings and get-ups most days, building to a hundred swings over eight weeks.',
    detail: 'Two movements, done most days, for about twenty minutes. The swing trains the hip '
      + 'hinge hard and builds a serious engine; the get-up trains everything else slowly and '
      + 'carefully.\n\n'
      + 'The block builds from sixty swings a session to a hundred across six weeks, deloads, then '
      + 'repeats the hundred with the next bell up. That last week is the test: if a hundred '
      + 'swings with the heavier bell feels like the first week did, start the block again from '
      + 'there.\n\n'
      + 'It is not a hypertrophy plan and does not pretend to be. It is about being durably fit '
      + 'with one bell and twenty minutes.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Weeks 1-2,1-2,Mon Tue Wed Thu Fri,Swing and Get-Up — Weeks 1-2,1,Kettlebell Swing,6,10,60,8,Same bell throughout. Learn the groove.
Weeks 1-2,1-2,Mon Tue Wed Thu Fri,Swing and Get-Up — Weeks 1-2,2,Turkish Get-Up,5,1 each,60,7,Slow. Every position under control.
Weeks 1-2,1-2,Mon Tue Wed Thu Fri,Swing and Get-Up — Weeks 1-2,3,Side Plank,2,30s each,45,,
Weeks 3-4,3-4,Mon Tue Wed Thu Fri,Swing and Get-Up — Weeks 3-4,1,Kettlebell Swing,8,10,60,8,Two more sets of swings. Same bell.
Weeks 3-4,3-4,Mon Tue Wed Thu Fri,Swing and Get-Up — Weeks 3-4,2,Turkish Get-Up,5,1 each,60,7,Slow. Every position under control.
Weeks 3-4,3-4,Mon Tue Wed Thu Fri,Swing and Get-Up — Weeks 3-4,3,Side Plank,2,30s each,45,,
Weeks 5-6,5-6,Mon Tue Wed Thu Fri,Swing and Get-Up — Weeks 5-6,1,Kettlebell Swing,10,10,60,8,A hundred swings. This is the target volume.
Weeks 5-6,5-6,Mon Tue Wed Thu Fri,Swing and Get-Up — Weeks 5-6,2,Turkish Get-Up,5,1 each,60,7,Slow. Every position under control.
Weeks 5-6,5-6,Mon Tue Wed Thu Fri,Swing and Get-Up — Weeks 5-6,3,Side Plank,2,30s each,45,,
Week 7 deload,7,Mon Tue Wed Thu Fri,Swing and Get-Up — deload,1,Kettlebell Swing,5,10,60,8,Deload. Half the swings and take your time.
Week 7 deload,7,Mon Tue Wed Thu Fri,Swing and Get-Up — deload,2,Turkish Get-Up,3,1 each,60,7,Slow. Every position under control.
Week 7 deload,7,Mon Tue Wed Thu Fri,Swing and Get-Up — deload,3,Side Plank,2,30s each,45,,
Week 8 heavier,8,Mon Tue Wed Thu Fri,Swing and Get-Up — heavier,1,Kettlebell Swing,10,10,60,8,Back to a hundred swings with the next bell up.
Week 8 heavier,8,Mon Tue Wed Thu Fri,Swing and Get-Up — heavier,2,Turkish Get-Up,5,1 each,60,7,Slow. Every position under control.
Week 8 heavier,8,Mon Tue Wed Thu Fri,Swing and Get-Up — heavier,3,Side Plank,2,30s each,45,,`,
  },

  {
    id: 'kettlebell-strength',
    name: 'Kettlebell Strength',
    goal: 'conditioning',
    level: 'intermediate',
    days: 3,
    equipment: 'Kettlebells',
    summary: 'Eight weeks of full-body kettlebell work. Strength and conditioning at once.',
    detail: 'A fuller kettlebell block: pressing, squatting, hinging and carrying, with enough '
      + 'density that your heart rate never really settles.\n\n'
      + 'Eight weeks rather than twelve, because kettlebells make loading jumps large and you will '
      + 'run out of bells before you run out of weeks. Progress by adding reps and sets within a '
      + 'phase, and take the next bell up when the block ends.',
    spec: {
      length: 8,
      sessions: [
        { name: 'Press and Swing', day: 'Mon', exercises: [
          ['Kettlebell Clean and Press', 'main', 90],
          ['Kettlebell Swing', 'secondary', 75],
          ['Kettlebell Row', 'accessory', 75],
          ['Suitcase Carry', 'hold', 60, '45s each'],
        ] },
        { name: 'Squat and Carry', day: 'Wed', exercises: [
          ['Kettlebell Front Squat', 'main', 120],
          ['Turkish Get-Up', 'power', 90],
          ['Goblet Squat', 'accessory', 90],
          ['Farmer Carry', 'hold', 60, '60s'],
        ] },
        { name: 'Power', day: 'Fri', exercises: [
          ['Kettlebell Snatch', 'main', 90],
          ['Kettlebell Swing', 'secondary', 60],
          ['Push-Up', 'accessory', 60],
          ['Hollow Body Hold', 'hold', 45, '30s'],
        ] },
      ],
    },
  },

  {
    id: 'travel-minimal',
    name: 'Travel / No Equipment',
    goal: 'bodyweight',
    level: 'beginner',
    days: 3,
    weeks: 1,
    repeat: true,
    equipment: 'None',
    summary: 'A hotel room, a floor, and twenty-five minutes. Deliberately a single week.',
    detail: 'No bar, no bands, no bench. Three short full-body sessions that hold onto what you '
      + 'have built while you are away from your gym.\n\n'
      + 'This is the one plan here that is meant to repeat, because it is a stopgap rather than a '
      + 'block: you run it for the week or two you are away and then go back to whatever you were '
      + 'doing. It will not add much, and it is not supposed to — a fortnight of this and you come '
      + 'back close to where you left off rather than three weeks behind.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Travel,1,Mon,Room A,1,Push-Up,4,12-20,60,8,Feet on the bed to make it harder.
Travel,1,Mon,Room A,2,Bulgarian Split Squat,4,12 each,60,8,Back foot on a chair.
Travel,1,Mon,Room A,3,Single-Leg Glute Bridge,3,15 each,45,8,
Travel,1,Mon,Room A,4,Plank,3,45s,45,,
Travel,1,Wed,Room B,1,Pike Push-Up,4,8-12,60,8,
Travel,1,Wed,Room B,2,Reverse Lunge,4,15 each,60,8,
Travel,1,Wed,Room B,3,Bear Crawl,3,30s,45,,
Travel,1,Wed,Room B,4,Side Plank,3,30s each,45,,
Travel,1,Fri,Room C,1,Diamond Push-Up,4,10-15,60,8,
Travel,1,Fri,Room C,2,Pistol Squat,3,5 each,90,8,Hold the doorframe.
Travel,1,Fri,Room C,3,Single-Leg Calf Raise,3,20 each,45,8,
Travel,1,Fri,Room C,4,Hollow Body Hold,3,30s,45,,`,
  },

  {
    id: 'six-by-six',
    name: 'Six by Six',
    goal: 'conditioning',
    level: 'intermediate',
    days: 6,
    weeks: 6,
    repeat: false,
    equipment: 'Dumbbells',
    summary: 'Six exercises, six rounds, six days, six weeks. The clock shrinks.',
    detail: 'A simple format that is much harder than it looks: six movements, six rounds of '
      + 'each, six days a week, for six weeks. Sessions run about thirty minutes.\n\n'
      + 'The progression is the rest, not the load: the gap between rounds falls from sixty '
      + 'seconds to forty-five to thirty. Pick weights you could manage for twelve reps and stop '
      + 'at eight, then let the shrinking clock do the work.\n\n'
      + 'Week four is the exception to the sixes — it drops to three rounds. Six days a week '
      + 'catches up with everyone by then, and the back-off week is what lets you finish the '
      + 'block instead of abandoning it.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Settle in,1-2,Mon,Push Circuit — Settle in,1,Dumbbell Bench Press,6,8,60,8,Six rounds with a full minute between them. Learn the sessions.
Settle in,1-2,Mon,Push Circuit — Settle in,2,Seated Dumbbell Shoulder Press,6,8,60,8,
Settle in,1-2,Mon,Push Circuit — Settle in,3,Push-Up,6,12,60,8,
Settle in,1-2,Mon,Push Circuit — Settle in,4,Lateral Raise,6,12,60,8,
Settle in,1-2,Mon,Push Circuit — Settle in,5,Dumbbell Kickback,6,12,60,8,
Settle in,1-2,Mon,Push Circuit — Settle in,6,Plank,6,30s,60,,
Settle in,1-2,Tue,Pull Circuit — Settle in,1,Dumbbell Row,6,8 each,60,8,Six rounds with a full minute between them. Learn the sessions.
Settle in,1-2,Tue,Pull Circuit — Settle in,2,Inverted Row,6,10,60,8,
Settle in,1-2,Tue,Pull Circuit — Settle in,3,Rear Delt Fly,6,12,60,8,
Settle in,1-2,Tue,Pull Circuit — Settle in,4,Dumbbell Curl,6,12,60,8,
Settle in,1-2,Tue,Pull Circuit — Settle in,5,Hammer Curl,6,12,60,8,
Settle in,1-2,Tue,Pull Circuit — Settle in,6,Hollow Body Hold,6,30s,60,,
Settle in,1-2,Wed,Leg Circuit — Settle in,1,Goblet Squat,6,10,60,8,Six rounds with a full minute between them. Learn the sessions.
Settle in,1-2,Wed,Leg Circuit — Settle in,2,Romanian Deadlift,6,10,60,8,
Settle in,1-2,Wed,Leg Circuit — Settle in,3,Reverse Lunge,6,10 each,60,8,
Settle in,1-2,Wed,Leg Circuit — Settle in,4,Step-Up,6,10 each,60,8,
Settle in,1-2,Wed,Leg Circuit — Settle in,5,Single-Leg Calf Raise,6,15 each,60,8,
Settle in,1-2,Wed,Leg Circuit — Settle in,6,Side Plank,6,25s each,60,,
Settle in,1-2,Thu,Conditioning — Settle in,1,Burpee,6,12,60,8,Six rounds with a full minute between them. Learn the sessions.
Settle in,1-2,Thu,Conditioning — Settle in,2,Kettlebell Swing,6,15,60,8,
Settle in,1-2,Thu,Conditioning — Settle in,3,Mountain Climber,6,30s,60,,
Settle in,1-2,Thu,Conditioning — Settle in,4,Jump Rope,6,45s,60,,
Settle in,1-2,Thu,Conditioning — Settle in,5,Medicine Ball Slam,6,12,60,8,
Settle in,1-2,Thu,Conditioning — Settle in,6,Dead Bug,6,10 each,60,8,
Settle in,1-2,Fri,Full Body — Settle in,1,Thruster,6,8,60,8,Six rounds with a full minute between them. Learn the sessions.
Settle in,1-2,Fri,Full Body — Settle in,2,Dumbbell Row,6,10 each,60,8,
Settle in,1-2,Fri,Full Body — Settle in,3,Walking Lunge,6,10 each,60,8,
Settle in,1-2,Fri,Full Body — Settle in,4,Push-Up,6,12,60,8,
Settle in,1-2,Fri,Full Body — Settle in,5,Farmer Carry,6,30s,60,,
Settle in,1-2,Fri,Full Body — Settle in,6,Plank,6,30s,60,,
Settle in,1-2,Sat,Core and Carry — Settle in,1,Turkish Get-Up,6,1 each,60,8,Six rounds with a full minute between them. Learn the sessions.
Settle in,1-2,Sat,Core and Carry — Settle in,2,Suitcase Carry,6,30s each,60,,
Settle in,1-2,Sat,Core and Carry — Settle in,3,Hanging Leg Raise,6,10,60,8,
Settle in,1-2,Sat,Core and Carry — Settle in,4,Russian Twist,6,20,60,8,
Settle in,1-2,Sat,Core and Carry — Settle in,5,Bear Crawl,6,30s,60,,
Settle in,1-2,Sat,Core and Carry — Settle in,6,Copenhagen Plank,6,20s each,60,,
Tighten up,3,Mon,Push Circuit — Tighten up,1,Dumbbell Bench Press,6,8,45,8,Same work. Fifteen seconds less rest. The density is the progression.
Tighten up,3,Mon,Push Circuit — Tighten up,2,Seated Dumbbell Shoulder Press,6,8,45,8,
Tighten up,3,Mon,Push Circuit — Tighten up,3,Push-Up,6,12,45,8,
Tighten up,3,Mon,Push Circuit — Tighten up,4,Lateral Raise,6,12,45,8,
Tighten up,3,Mon,Push Circuit — Tighten up,5,Dumbbell Kickback,6,12,45,8,
Tighten up,3,Mon,Push Circuit — Tighten up,6,Plank,6,30s,45,,
Tighten up,3,Tue,Pull Circuit — Tighten up,1,Dumbbell Row,6,8 each,45,8,Same work. Fifteen seconds less rest. The density is the progression.
Tighten up,3,Tue,Pull Circuit — Tighten up,2,Inverted Row,6,10,45,8,
Tighten up,3,Tue,Pull Circuit — Tighten up,3,Rear Delt Fly,6,12,45,8,
Tighten up,3,Tue,Pull Circuit — Tighten up,4,Dumbbell Curl,6,12,45,8,
Tighten up,3,Tue,Pull Circuit — Tighten up,5,Hammer Curl,6,12,45,8,
Tighten up,3,Tue,Pull Circuit — Tighten up,6,Hollow Body Hold,6,30s,45,,
Tighten up,3,Wed,Leg Circuit — Tighten up,1,Goblet Squat,6,10,45,8,Same work. Fifteen seconds less rest. The density is the progression.
Tighten up,3,Wed,Leg Circuit — Tighten up,2,Romanian Deadlift,6,10,45,8,
Tighten up,3,Wed,Leg Circuit — Tighten up,3,Reverse Lunge,6,10 each,45,8,
Tighten up,3,Wed,Leg Circuit — Tighten up,4,Step-Up,6,10 each,45,8,
Tighten up,3,Wed,Leg Circuit — Tighten up,5,Single-Leg Calf Raise,6,15 each,45,8,
Tighten up,3,Wed,Leg Circuit — Tighten up,6,Side Plank,6,25s each,45,,
Tighten up,3,Thu,Conditioning — Tighten up,1,Burpee,6,12,45,8,Same work. Fifteen seconds less rest. The density is the progression.
Tighten up,3,Thu,Conditioning — Tighten up,2,Kettlebell Swing,6,15,45,8,
Tighten up,3,Thu,Conditioning — Tighten up,3,Mountain Climber,6,30s,45,,
Tighten up,3,Thu,Conditioning — Tighten up,4,Jump Rope,6,45s,45,,
Tighten up,3,Thu,Conditioning — Tighten up,5,Medicine Ball Slam,6,12,45,8,
Tighten up,3,Thu,Conditioning — Tighten up,6,Dead Bug,6,10 each,45,8,
Tighten up,3,Fri,Full Body — Tighten up,1,Thruster,6,8,45,8,Same work. Fifteen seconds less rest. The density is the progression.
Tighten up,3,Fri,Full Body — Tighten up,2,Dumbbell Row,6,10 each,45,8,
Tighten up,3,Fri,Full Body — Tighten up,3,Walking Lunge,6,10 each,45,8,
Tighten up,3,Fri,Full Body — Tighten up,4,Push-Up,6,12,45,8,
Tighten up,3,Fri,Full Body — Tighten up,5,Farmer Carry,6,30s,45,,
Tighten up,3,Fri,Full Body — Tighten up,6,Plank,6,30s,45,,
Tighten up,3,Sat,Core and Carry — Tighten up,1,Turkish Get-Up,6,1 each,45,8,Same work. Fifteen seconds less rest. The density is the progression.
Tighten up,3,Sat,Core and Carry — Tighten up,2,Suitcase Carry,6,30s each,45,,
Tighten up,3,Sat,Core and Carry — Tighten up,3,Hanging Leg Raise,6,10,45,8,
Tighten up,3,Sat,Core and Carry — Tighten up,4,Russian Twist,6,20,45,8,
Tighten up,3,Sat,Core and Carry — Tighten up,5,Bear Crawl,6,30s,45,,
Tighten up,3,Sat,Core and Carry — Tighten up,6,Copenhagen Plank,6,20s each,45,,
Back off,4,Mon,Push Circuit — Back off,1,Dumbbell Bench Press,3,8,60,8,Half the rounds. Six days a week catches up with everyone by now.
Back off,4,Mon,Push Circuit — Back off,2,Seated Dumbbell Shoulder Press,3,8,60,8,
Back off,4,Mon,Push Circuit — Back off,3,Push-Up,3,12,60,8,
Back off,4,Mon,Push Circuit — Back off,4,Lateral Raise,3,12,60,8,
Back off,4,Mon,Push Circuit — Back off,5,Dumbbell Kickback,3,12,60,8,
Back off,4,Mon,Push Circuit — Back off,6,Plank,3,30s,60,,
Back off,4,Tue,Pull Circuit — Back off,1,Dumbbell Row,3,8 each,60,8,Half the rounds. Six days a week catches up with everyone by now.
Back off,4,Tue,Pull Circuit — Back off,2,Inverted Row,3,10,60,8,
Back off,4,Tue,Pull Circuit — Back off,3,Rear Delt Fly,3,12,60,8,
Back off,4,Tue,Pull Circuit — Back off,4,Dumbbell Curl,3,12,60,8,
Back off,4,Tue,Pull Circuit — Back off,5,Hammer Curl,3,12,60,8,
Back off,4,Tue,Pull Circuit — Back off,6,Hollow Body Hold,3,30s,60,,
Back off,4,Wed,Leg Circuit — Back off,1,Goblet Squat,3,10,60,8,Half the rounds. Six days a week catches up with everyone by now.
Back off,4,Wed,Leg Circuit — Back off,2,Romanian Deadlift,3,10,60,8,
Back off,4,Wed,Leg Circuit — Back off,3,Reverse Lunge,3,10 each,60,8,
Back off,4,Wed,Leg Circuit — Back off,4,Step-Up,3,10 each,60,8,
Back off,4,Wed,Leg Circuit — Back off,5,Single-Leg Calf Raise,3,15 each,60,8,
Back off,4,Wed,Leg Circuit — Back off,6,Side Plank,3,25s each,60,,
Back off,4,Thu,Conditioning — Back off,1,Burpee,3,12,60,8,Half the rounds. Six days a week catches up with everyone by now.
Back off,4,Thu,Conditioning — Back off,2,Kettlebell Swing,3,15,60,8,
Back off,4,Thu,Conditioning — Back off,3,Mountain Climber,3,30s,60,,
Back off,4,Thu,Conditioning — Back off,4,Jump Rope,3,45s,60,,
Back off,4,Thu,Conditioning — Back off,5,Medicine Ball Slam,3,12,60,8,
Back off,4,Thu,Conditioning — Back off,6,Dead Bug,3,10 each,60,8,
Back off,4,Fri,Full Body — Back off,1,Thruster,3,8,60,8,Half the rounds. Six days a week catches up with everyone by now.
Back off,4,Fri,Full Body — Back off,2,Dumbbell Row,3,10 each,60,8,
Back off,4,Fri,Full Body — Back off,3,Walking Lunge,3,10 each,60,8,
Back off,4,Fri,Full Body — Back off,4,Push-Up,3,12,60,8,
Back off,4,Fri,Full Body — Back off,5,Farmer Carry,3,30s,60,,
Back off,4,Fri,Full Body — Back off,6,Plank,3,30s,60,,
Back off,4,Sat,Core and Carry — Back off,1,Turkish Get-Up,3,1 each,60,8,Half the rounds. Six days a week catches up with everyone by now.
Back off,4,Sat,Core and Carry — Back off,2,Suitcase Carry,3,30s each,60,,
Back off,4,Sat,Core and Carry — Back off,3,Hanging Leg Raise,3,10,60,8,
Back off,4,Sat,Core and Carry — Back off,4,Russian Twist,3,20,60,8,
Back off,4,Sat,Core and Carry — Back off,5,Bear Crawl,3,30s,60,,
Back off,4,Sat,Core and Carry — Back off,6,Copenhagen Plank,3,20s each,60,,
The squeeze,5-6,Mon,Push Circuit — The squeeze,1,Dumbbell Bench Press,6,8,30,8,Thirty seconds between rounds. The same session is a different animal now.
The squeeze,5-6,Mon,Push Circuit — The squeeze,2,Seated Dumbbell Shoulder Press,6,8,30,8,
The squeeze,5-6,Mon,Push Circuit — The squeeze,3,Push-Up,6,12,30,8,
The squeeze,5-6,Mon,Push Circuit — The squeeze,4,Lateral Raise,6,12,30,8,
The squeeze,5-6,Mon,Push Circuit — The squeeze,5,Dumbbell Kickback,6,12,30,8,
The squeeze,5-6,Mon,Push Circuit — The squeeze,6,Plank,6,30s,30,,
The squeeze,5-6,Tue,Pull Circuit — The squeeze,1,Dumbbell Row,6,8 each,30,8,Thirty seconds between rounds. The same session is a different animal now.
The squeeze,5-6,Tue,Pull Circuit — The squeeze,2,Inverted Row,6,10,30,8,
The squeeze,5-6,Tue,Pull Circuit — The squeeze,3,Rear Delt Fly,6,12,30,8,
The squeeze,5-6,Tue,Pull Circuit — The squeeze,4,Dumbbell Curl,6,12,30,8,
The squeeze,5-6,Tue,Pull Circuit — The squeeze,5,Hammer Curl,6,12,30,8,
The squeeze,5-6,Tue,Pull Circuit — The squeeze,6,Hollow Body Hold,6,30s,30,,
The squeeze,5-6,Wed,Leg Circuit — The squeeze,1,Goblet Squat,6,10,30,8,Thirty seconds between rounds. The same session is a different animal now.
The squeeze,5-6,Wed,Leg Circuit — The squeeze,2,Romanian Deadlift,6,10,30,8,
The squeeze,5-6,Wed,Leg Circuit — The squeeze,3,Reverse Lunge,6,10 each,30,8,
The squeeze,5-6,Wed,Leg Circuit — The squeeze,4,Step-Up,6,10 each,30,8,
The squeeze,5-6,Wed,Leg Circuit — The squeeze,5,Single-Leg Calf Raise,6,15 each,30,8,
The squeeze,5-6,Wed,Leg Circuit — The squeeze,6,Side Plank,6,25s each,30,,
The squeeze,5-6,Thu,Conditioning — The squeeze,1,Burpee,6,12,30,8,Thirty seconds between rounds. The same session is a different animal now.
The squeeze,5-6,Thu,Conditioning — The squeeze,2,Kettlebell Swing,6,15,30,8,
The squeeze,5-6,Thu,Conditioning — The squeeze,3,Mountain Climber,6,30s,30,,
The squeeze,5-6,Thu,Conditioning — The squeeze,4,Jump Rope,6,45s,30,,
The squeeze,5-6,Thu,Conditioning — The squeeze,5,Medicine Ball Slam,6,12,30,8,
The squeeze,5-6,Thu,Conditioning — The squeeze,6,Dead Bug,6,10 each,30,8,
The squeeze,5-6,Fri,Full Body — The squeeze,1,Thruster,6,8,30,8,Thirty seconds between rounds. The same session is a different animal now.
The squeeze,5-6,Fri,Full Body — The squeeze,2,Dumbbell Row,6,10 each,30,8,
The squeeze,5-6,Fri,Full Body — The squeeze,3,Walking Lunge,6,10 each,30,8,
The squeeze,5-6,Fri,Full Body — The squeeze,4,Push-Up,6,12,30,8,
The squeeze,5-6,Fri,Full Body — The squeeze,5,Farmer Carry,6,30s,30,,
The squeeze,5-6,Fri,Full Body — The squeeze,6,Plank,6,30s,30,,
The squeeze,5-6,Sat,Core and Carry — The squeeze,1,Turkish Get-Up,6,1 each,30,8,Thirty seconds between rounds. The same session is a different animal now.
The squeeze,5-6,Sat,Core and Carry — The squeeze,2,Suitcase Carry,6,30s each,30,,
The squeeze,5-6,Sat,Core and Carry — The squeeze,3,Hanging Leg Raise,6,10,30,8,
The squeeze,5-6,Sat,Core and Carry — The squeeze,4,Russian Twist,6,20,30,8,
The squeeze,5-6,Sat,Core and Carry — The squeeze,5,Bear Crawl,6,30s,30,,
The squeeze,5-6,Sat,Core and Carry — The squeeze,6,Copenhagen Plank,6,20s each,30,,`,
  },

  {
    id: 'thirty-minute-strength',
    name: 'Thirty-Minute Strength',
    goal: 'conditioning',
    level: 'beginner',
    days: 4,
    equipment: 'Full gym',
    summary: 'Twelve weeks of half-hour sessions. Real strength work with the fat trimmed off.',
    detail: 'Four sessions a week that genuinely fit in half an hour: one main lift taken '
      + 'seriously, then a short tail of supporting work.\n\n'
      + 'You lose the last ten per cent of what a longer session would give you and save an hour a '
      + 'week, which for most people is the better deal. The block still periodises properly, so '
      + 'short does not mean aimless.',
    spec: {
      length: 12,
      sessions: [
        { name: 'Squat Focus', day: 'Mon', exercises: [
          ['Back Squat', 'main', 150],
          ['Romanian Deadlift', 'accessory', 60],
          ['Lat Pulldown', 'accessory', 60],
          ['Plank', 'hold', 45, '45s'],
        ] },
        { name: 'Bench Focus', day: 'Tue', exercises: [
          ['Barbell Bench Press', 'main', 150],
          ['Dumbbell Row', 'accessory', 60],
          ['Lateral Raise', 'isolation', 60],
          ['Rope Pushdown', 'isolation', 45],
        ] },
        { name: 'Deadlift Focus', day: 'Thu', exercises: [
          ['Trap Bar Deadlift', 'main', 180],
          ['Walking Lunge', 'accessory', 60],
          ['Seated Cable Row', 'accessory', 60],
          ['Hanging Leg Raise', 'isolation', 45],
        ] },
        { name: 'Press Focus', day: 'Fri', exercises: [
          ['Overhead Press', 'main', 150],
          ['Chin-Up', 'secondary', 60],
          ['Incline Dumbbell Press', 'accessory', 60],
          ['Face Pull', 'isolation', 45],
        ] },
      ],
    },
  },

];
