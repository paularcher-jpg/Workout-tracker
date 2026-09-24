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
    weeks: 1,
    repeat: true,
    equipment: 'Pull-up bar',
    summary: 'A push, a pull, a squat and a hinge. Nothing but a bar to hang from.',
    detail: 'Bodyweight training works as long as you keep making it harder. Each movement here '
      + 'has somewhere to go: push-ups become diamond push-ups become one-arm work, squats become '
      + 'pistols, rows become chin-ups. Progress by adding reps until the top of the range is '
      + 'comfortable across every set, then move to the harder version and start again lower.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Bodyweight,1,Mon,Full Body A,1,Pull-Up,4,5-8,120,8,Assist with a band if you need to.
Bodyweight,1,Mon,Full Body A,2,Push-Up,4,8-15,90,8,Slow and full range beats fast and short.
Bodyweight,1,Mon,Full Body A,3,Bulgarian Split Squat,3,10 each,90,8,
Bodyweight,1,Mon,Full Body A,4,Nordic Curl,3,5,120,8,Partner or a sofa edge.
Bodyweight,1,Mon,Full Body A,5,Hollow Body Hold,3,30s,45,,
Bodyweight,1,Wed,Full Body B,1,Inverted Row,4,8-12,90,8,Lower the bar to make it harder.
Bodyweight,1,Wed,Full Body B,2,Pike Push-Up,4,6-10,90,8,Feet higher as you get stronger.
Bodyweight,1,Wed,Full Body B,3,Pistol Squat,3,5 each,120,8,Hold a doorframe until you can balance.
Bodyweight,1,Wed,Full Body B,4,Single-Leg Glute Bridge,3,12 each,60,8,
Bodyweight,1,Wed,Full Body B,5,Side Plank,3,30s each,45,,
Bodyweight,1,Fri,Full Body C,1,Chin-Up,4,5-8,120,8,
Bodyweight,1,Fri,Full Body C,2,Diamond Push-Up,3,8-12,90,8,
Bodyweight,1,Fri,Full Body C,3,Walking Lunge,3,15 each,90,8,
Bodyweight,1,Fri,Full Body C,4,Single-Leg Calf Raise,3,15 each,60,8,
Bodyweight,1,Fri,Full Body C,5,L-Sit,3,20s,60,,Tuck the knees if you must.`,
  },

  {
    id: 'kettlebell-minimal',
    name: 'One Kettlebell',
    goal: 'conditioning',
    level: 'beginner',
    days: 5,
    weeks: 1,
    repeat: true,
    equipment: 'One kettlebell',
    summary: 'Swings and get-ups, most days, for about twenty minutes.',
    detail: 'Two movements, done most days, for as long as you care to keep doing them. The swing '
      + 'trains the hip hinge hard and builds a serious engine; the get-up trains everything else '
      + 'slowly and carefully. It is not a hypertrophy plan and does not pretend to be — it is '
      + 'about being durably fit with one bell and twenty minutes. Add weight only once the whole '
      + 'session feels genuinely easy.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Kettlebell,1,Mon Tue Wed Thu Fri,Swing and Get-Up,1,Kettlebell Swing,10,10,60,8,Hard hip snap. Arms are rope.
Kettlebell,1,Mon Tue Wed Thu Fri,Swing and Get-Up,2,Turkish Get-Up,5,1 each,60,7,Slow. Every position under control.
Kettlebell,1,Mon Tue Wed Thu Fri,Swing and Get-Up,3,Side Plank,2,30s each,45,,`,
  },

  {
    id: 'kettlebell-strength',
    name: 'Kettlebell Strength',
    goal: 'conditioning',
    level: 'intermediate',
    days: 3,
    weeks: 1,
    repeat: true,
    equipment: 'Kettlebells',
    summary: 'Three full-body kettlebell sessions. Strength and conditioning at once.',
    detail: 'A fuller kettlebell week: pressing, squatting, hinging and carrying, with enough '
      + 'density that your heart rate never really settles. Kettlebells make loading jumps large, '
      + 'so progress by adding reps and sets before you add a bell. Three sessions a week with a '
      + 'day between each.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Kettlebell,1,Mon,Press and Swing,1,Kettlebell Clean and Press,5,5 each,90,8,
Kettlebell,1,Mon,Press and Swing,2,Kettlebell Swing,5,15,75,8,
Kettlebell,1,Mon,Press and Swing,3,Kettlebell Row,4,10 each,75,8,
Kettlebell,1,Mon,Press and Swing,4,Suitcase Carry,3,45s each,60,8,
Kettlebell,1,Wed,Squat and Carry,1,Kettlebell Front Squat,5,8,120,8,Two bells in the rack if you have them.
Kettlebell,1,Wed,Squat and Carry,2,Turkish Get-Up,5,1 each,90,7,
Kettlebell,1,Wed,Squat and Carry,3,Goblet Squat,3,15,90,8,
Kettlebell,1,Wed,Squat and Carry,4,Farmer Carry,3,60s,60,8,
Kettlebell,1,Fri,Power,1,Kettlebell Snatch,6,6 each,90,8,
Kettlebell,1,Fri,Power,2,Kettlebell Swing,6,15,60,8.5,
Kettlebell,1,Fri,Power,3,Push-Up,4,15,60,8,
Kettlebell,1,Fri,Power,4,Hollow Body Hold,3,30s,45,,`,
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
    summary: 'A hotel room, a floor, and twenty-five minutes.',
    detail: 'No bar, no bands, no bench. Three short full-body sessions that hold onto what you '
      + 'have built while you are away from your gym. It will not add much, and it is not supposed '
      + 'to — a fortnight of this and you come back close to where you left off rather than three '
      + 'weeks behind.',
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
    summary: 'Six exercises, six rounds, six days, six weeks. Short and relentless.',
    detail: 'A simple format that is much harder than it looks: six movements, six rounds of '
      + 'each, six days a week, for six weeks. Sessions run about thirty minutes because rest is '
      + 'short by design — the conditioning effect comes from the density, not the load. Pick '
      + 'weights you could manage for twelve reps and stop at eight. Weeks five and six drop the '
      + 'rest again rather than adding weight.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Six by Six,1-6,Mon,Push Circuit,1,Dumbbell Bench Press,6,8,45,8,Keep moving. Forty-five seconds between rounds.
Six by Six,1-6,Mon,Push Circuit,2,Seated Dumbbell Shoulder Press,6,8,45,8,
Six by Six,1-6,Mon,Push Circuit,3,Push-Up,6,12,45,8,
Six by Six,1-6,Mon,Push Circuit,4,Lateral Raise,6,12,45,8,
Six by Six,1-6,Mon,Push Circuit,5,Dumbbell Kickback,6,12,45,8,
Six by Six,1-6,Mon,Push Circuit,6,Plank,6,30s,45,,
Six by Six,1-6,Tue,Pull Circuit,1,Dumbbell Row,6,8 each,45,8,
Six by Six,1-6,Tue,Pull Circuit,2,Inverted Row,6,10,45,8,
Six by Six,1-6,Tue,Pull Circuit,3,Rear Delt Fly,6,12,45,8,
Six by Six,1-6,Tue,Pull Circuit,4,Dumbbell Curl,6,12,45,8,
Six by Six,1-6,Tue,Pull Circuit,5,Hammer Curl,6,12,45,8,
Six by Six,1-6,Tue,Pull Circuit,6,Hollow Body Hold,6,30s,45,,
Six by Six,1-6,Wed,Leg Circuit,1,Goblet Squat,6,10,45,8,
Six by Six,1-6,Wed,Leg Circuit,2,Romanian Deadlift,6,10,45,8,
Six by Six,1-6,Wed,Leg Circuit,3,Reverse Lunge,6,10 each,45,8,
Six by Six,1-6,Wed,Leg Circuit,4,Step-Up,6,10 each,45,8,
Six by Six,1-6,Wed,Leg Circuit,5,Single-Leg Calf Raise,6,15 each,45,8,
Six by Six,1-6,Wed,Leg Circuit,6,Side Plank,6,25s each,45,,
Six by Six,1-6,Thu,Conditioning,1,Burpee,6,12,45,9,
Six by Six,1-6,Thu,Conditioning,2,Kettlebell Swing,6,15,45,8,
Six by Six,1-6,Thu,Conditioning,3,Mountain Climber,6,30s,45,,
Six by Six,1-6,Thu,Conditioning,4,Jump Rope,6,45s,45,,
Six by Six,1-6,Thu,Conditioning,5,Medicine Ball Slam,6,12,45,8,
Six by Six,1-6,Thu,Conditioning,6,Dead Bug,6,10 each,45,,
Six by Six,1-6,Fri,Full Body,1,Thruster,6,8,45,8,
Six by Six,1-6,Fri,Full Body,2,Dumbbell Row,6,10 each,45,8,
Six by Six,1-6,Fri,Full Body,3,Walking Lunge,6,10 each,45,8,
Six by Six,1-6,Fri,Full Body,4,Push-Up,6,12,45,8,
Six by Six,1-6,Fri,Full Body,5,Farmer Carry,6,30s,45,8,
Six by Six,1-6,Fri,Full Body,6,Plank,6,30s,45,,
Six by Six,1-6,Sat,Core and Carry,1,Turkish Get-Up,6,1 each,45,7,
Six by Six,1-6,Sat,Core and Carry,2,Suitcase Carry,6,30s each,45,8,
Six by Six,1-6,Sat,Core and Carry,3,Hanging Leg Raise,6,10,45,8,
Six by Six,1-6,Sat,Core and Carry,4,Russian Twist,6,20,45,8,
Six by Six,1-6,Sat,Core and Carry,5,Bear Crawl,6,30s,45,,
Six by Six,1-6,Sat,Core and Carry,6,Copenhagen Plank,6,20s each,45,,`,
  },

  {
    id: 'thirty-minute-strength',
    name: 'Thirty-Minute Strength',
    goal: 'conditioning',
    level: 'beginner',
    days: 4,
    weeks: 1,
    repeat: true,
    equipment: 'Full gym',
    summary: 'Four half-hour sessions. Real strength work with the fat trimmed off.',
    detail: 'Four sessions a week that genuinely fit in half an hour: one main lift taken '
      + 'seriously, then two pairs of exercises alternated so you are always working while '
      + 'something recovers. You lose the last ten per cent of what a longer session would give '
      + 'you and save an hour a week, which for most people is the better deal.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Thirty,1,Mon,Squat Focus,1,Back Squat,4,6,150,8,The one lift that matters today.
Thirty,1,Mon,Squat Focus,2,Romanian Deadlift,3,10,60,8,Alternate with the next exercise.
Thirty,1,Mon,Squat Focus,3,Lat Pulldown,3,12,60,8,
Thirty,1,Mon,Squat Focus,4,Plank,2,45s,45,,
Thirty,1,Tue,Bench Focus,1,Barbell Bench Press,4,6,150,8,
Thirty,1,Tue,Bench Focus,2,Dumbbell Row,3,10 each,60,8,
Thirty,1,Tue,Bench Focus,3,Lateral Raise,3,15,60,8,
Thirty,1,Tue,Bench Focus,4,Rope Pushdown,2,15,45,8,
Thirty,1,Thu,Deadlift Focus,1,Trap Bar Deadlift,4,5,180,8,
Thirty,1,Thu,Deadlift Focus,2,Walking Lunge,3,10 each,60,8,
Thirty,1,Thu,Deadlift Focus,3,Seated Cable Row,3,12,60,8,
Thirty,1,Thu,Deadlift Focus,4,Hanging Leg Raise,2,12,45,8,
Thirty,1,Fri,Press Focus,1,Overhead Press,4,6,150,8,
Thirty,1,Fri,Press Focus,2,Chin-Up,3,8,60,8,
Thirty,1,Fri,Press Focus,3,Incline Dumbbell Press,3,10,60,8,
Thirty,1,Fri,Press Focus,4,Face Pull,2,15,45,8,`,
  },

  {
    id: 'first-gym-plan',
    name: 'Your First Gym Plan',
    goal: 'muscle',
    level: 'beginner',
    days: 3,
    weeks: 4,
    repeat: true,
    equipment: 'Machines and dumbbells',
    summary: 'Machines and dumbbells only. For a first month in a gym.',
    detail: 'Written for someone who has just joined a gym and does not yet want to be the person '
      + 'figuring out a squat rack in front of everyone. Machines and dumbbells only, three '
      + 'sessions a week, the same exercises every time so you get to practise them. Four weeks '
      + 'of this and barbells will feel a lot less intimidating. Start lighter than you think and '
      + 'add a little every week.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
First Month,1-4,Mon,Full Body A,1,Leg Press,3,12,120,7,Start light. Learn the range of motion.
First Month,1-4,Mon,Full Body A,2,Machine Chest Press,3,12,90,7,
First Month,1-4,Mon,Full Body A,3,Lat Pulldown,3,12,90,7,
First Month,1-4,Mon,Full Body A,4,Seated Leg Curl,3,12,75,7,
First Month,1-4,Mon,Full Body A,5,Plank,3,30s,45,,
First Month,1-4,Wed,Full Body B,1,Goblet Squat,3,12,120,7,
First Month,1-4,Wed,Full Body B,2,Seated Cable Row,3,12,90,7,
First Month,1-4,Wed,Full Body B,3,Machine Shoulder Press,3,12,90,7,
First Month,1-4,Wed,Full Body B,4,Leg Extension,3,15,75,7,
First Month,1-4,Wed,Full Body B,5,Dead Bug,3,10 each,45,,
First Month,1-4,Fri,Full Body C,1,Leg Press,3,15,120,7,
First Month,1-4,Fri,Full Body C,2,Incline Dumbbell Press,3,12,90,7,
First Month,1-4,Fri,Full Body C,3,Chest-Supported Row,3,12,90,7,
First Month,1-4,Fri,Full Body C,4,Dumbbell Curl,3,12,60,7,
First Month,1-4,Fri,Full Body C,5,Standing Calf Raise,3,15,60,7,`,
  },
];
