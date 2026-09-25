// Seed exercise library. Ids are slugs so the same exercise merges cleanly
// across devices without duplicating.
export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Cardio', 'Other',
];

// [name, group, equipment, defaultRestSec]
const SEED = [
  // Chest
  ['Barbell Bench Press', 'Chest', 'Barbell', 180],
  ['Incline Barbell Bench Press', 'Chest', 'Barbell', 180],
  ['Dumbbell Bench Press', 'Chest', 'Dumbbell', 150],
  ['Incline Dumbbell Press', 'Chest', 'Dumbbell', 150],
  ['Machine Chest Press', 'Chest', 'Machine', 120],
  ['Cable Fly', 'Chest', 'Cable', 90],
  ['Pec Deck', 'Chest', 'Machine', 90],
  ['Push-Up', 'Chest', 'Bodyweight', 90],
  ['Dip (Chest)', 'Chest', 'Bodyweight', 150],
  // Back
  ['Deadlift', 'Back', 'Barbell', 240],
  ['Barbell Row', 'Back', 'Barbell', 180],
  ['Pendlay Row', 'Back', 'Barbell', 180],
  ['Dumbbell Row', 'Back', 'Dumbbell', 120],
  ['Pull-Up', 'Back', 'Bodyweight', 150],
  ['Chin-Up', 'Back', 'Bodyweight', 150],
  ['Lat Pulldown', 'Back', 'Cable', 120],
  ['Pull-Up or Lat Pulldown', 'Back', 'Bar or cable', 120],
  ['Seated Cable Row', 'Back', 'Cable', 120],
  ['Chest-Supported Row', 'Back', 'Machine', 120],
  ['T-Bar Row', 'Back', 'Barbell', 150],
  ['Straight-Arm Pulldown', 'Back', 'Cable', 90],
  ['Face Pull', 'Back', 'Cable', 90],
  ['Rack Pull', 'Back', 'Barbell', 210],
  // Shoulders
  ['Overhead Press', 'Shoulders', 'Barbell', 180],
  ['Seated Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell', 150],
  ['Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell', 120],
  ['Arnold Press', 'Shoulders', 'Dumbbell', 120],
  ['Machine Shoulder Press', 'Shoulders', 'Machine', 120],
  ['Lateral Raise', 'Shoulders', 'Dumbbell', 75],
  ['Cable Lateral Raise', 'Shoulders', 'Cable', 75],
  ['Rear Delt Fly', 'Shoulders', 'Dumbbell', 75],
  ['Upright Row', 'Shoulders', 'Barbell', 90],
  ['Shrug', 'Shoulders', 'Dumbbell', 90],
  // Biceps
  ['Barbell Curl', 'Biceps', 'Barbell', 90],
  ['EZ-Bar Curl', 'Biceps', 'Barbell', 90],
  ['Dumbbell Curl', 'Biceps', 'Dumbbell', 90],
  ['Incline Dumbbell Curl', 'Biceps', 'Dumbbell', 90],
  ['Hammer Curl', 'Biceps', 'Dumbbell', 90],
  ['Preacher Curl', 'Biceps', 'Machine', 90],
  ['Cable Curl', 'Biceps', 'Cable', 75],
  // Triceps
  ['Close-Grip Bench Press', 'Triceps', 'Barbell', 150],
  ['Triceps Pushdown', 'Triceps', 'Cable', 75],
  ['Rope Pushdown', 'Triceps', 'Cable', 75],
  ['Overhead Cable Extension', 'Triceps', 'Cable', 90],
  ['Skullcrusher', 'Triceps', 'Barbell', 90],
  ['Dip (Triceps)', 'Triceps', 'Bodyweight', 150],
  ['Dumbbell Kickback', 'Triceps', 'Dumbbell', 60],
  // Quads
  ['Back Squat', 'Quads', 'Barbell', 210],
  ['Front Squat', 'Quads', 'Barbell', 210],
  ['Hack Squat', 'Quads', 'Machine', 180],
  ['Leg Press', 'Quads', 'Machine', 180],
  ['Bulgarian Split Squat', 'Quads', 'Dumbbell', 150],
  ['Dumbbell Split Squat', 'Quads', 'Dumbbell', 90],
  ['Walking Lunge', 'Quads', 'Dumbbell', 120],
  ['Goblet Squat', 'Quads', 'Dumbbell', 120],
  ['Leg Extension', 'Quads', 'Machine', 90],
  ['Step-Up', 'Quads', 'Dumbbell', 90],
  // Hamstrings
  ['Romanian Deadlift', 'Hamstrings', 'Barbell', 180],
  ['Stiff-Leg Deadlift', 'Hamstrings', 'Barbell', 180],
  ['Lying Leg Curl', 'Hamstrings', 'Machine', 90],
  ['Seated Leg Curl', 'Hamstrings', 'Machine', 90],
  ['Seated or Lying Leg Curl', 'Hamstrings', 'Machine', 90],
  ['Nordic Curl', 'Hamstrings', 'Bodyweight', 120],
  ['Good Morning', 'Hamstrings', 'Barbell', 150],
  // Glutes
  ['Hip Thrust', 'Glutes', 'Barbell', 150],
  ['Glute Bridge', 'Glutes', 'Barbell', 120],
  ['Cable Kickback', 'Glutes', 'Cable', 75],
  ['Hip Abduction', 'Glutes', 'Machine', 75],
  // Calves
  ['Standing Calf Raise', 'Calves', 'Machine', 75],
  ['Seated Calf Raise', 'Calves', 'Machine', 75],
  ['Leg Press Calf Raise', 'Calves', 'Machine', 75],
  // Core
  ['Plank', 'Core', 'Bodyweight', 60, 'time'],
  ['Side Plank', 'Core', 'Bodyweight', 45, 'time'],
  ['Hanging Leg Raise', 'Core', 'Bodyweight', 75],
  ['Hanging Knee Raise', 'Core', 'Bodyweight', 60],
  ['Cable Crunch', 'Core', 'Cable', 75],
  ['Ab Wheel Rollout', 'Core', 'Other', 75],
  ['Russian Twist', 'Core', 'Other', 60],
  ['Back Extension', 'Core', 'Machine', 90],
  ['Pallof Press', 'Core', 'Cable', 45],
  // Cardio
  ['Treadmill', 'Cardio', 'Machine', 0, 'time'],
  ['Rowing Machine', 'Cardio', 'Machine', 0, 'time'],
  ['Stationary Bike', 'Cardio', 'Machine', 0, 'time'],
  ['Stair Climber', 'Cardio', 'Machine', 0, 'time'],
  ['Elliptical', 'Cardio', 'Machine', 0, 'time'],
  ['Assault Bike', 'Cardio', 'Machine', 0, 'time'],
  ['Ski Erg', 'Cardio', 'Machine', 0, 'time'],
  ['Jump Rope', 'Cardio', 'Other', 60, 'time'],
  ['Battle Rope', 'Cardio', 'Other', 60, 'time'],
  ['Burpee', 'Cardio', 'Bodyweight', 60],
  ['Run', 'Cardio', 'Other', 0, 'time'],
  ['Easy Aerobic', 'Cardio', 'Other', 0, 'time'],
  ['Weighted Uphill Carry', 'Cardio', 'Other', 120, 'time'],
  // Olympic and power
  ['Power Clean', 'Back', 'Barbell', 180],
  ['Hang Power Clean', 'Back', 'Barbell', 180],
  ['Push Press', 'Shoulders', 'Barbell', 180],
  ['Thruster', 'Quads', 'Barbell', 120],
  ['Trap Bar Deadlift', 'Hamstrings', 'Barbell', 210],
  ['Deficit Deadlift', 'Back', 'Barbell', 240],
  ['Pause Squat', 'Quads', 'Barbell', 210],
  ['Landmine Press', 'Shoulders', 'Barbell', 90],
  // Plyometric
  ['Box Jump', 'Quads', 'Bodyweight', 120],
  ['Broad Jump', 'Quads', 'Bodyweight', 120],
  ['Depth Jump', 'Quads', 'Bodyweight', 150],
  ['Split Jump Squat', 'Quads', 'Bodyweight', 90],
  ['Squat Jump', 'Quads', 'Bodyweight', 90],
  ['Skater Bound', 'Glutes', 'Bodyweight', 90],
  ['Pogo Hop', 'Calves', 'Bodyweight', 60],
  ['Medicine Ball Slam', 'Core', 'Other', 60],
  ['Wall Ball', 'Quads', 'Other', 90],
  // Single leg and runner specific
  ['Single-Leg Romanian Deadlift', 'Hamstrings', 'Dumbbell', 90],
  ['Single-Leg Calf Raise', 'Calves', 'Bodyweight', 75],
  ['Single-Leg Glute Bridge', 'Glutes', 'Bodyweight', 60],
  ['Reverse Lunge', 'Quads', 'Dumbbell', 90],
  ['Front Lunge', 'Quads', 'Bodyweight', 60],
  ['Goblet Squat to Press', 'Quads', 'Dumbbell', 60],
  ['Floor Get-Up', 'Core', 'Bodyweight', 45],
  ['Lateral Lunge', 'Quads', 'Dumbbell', 90],
  ['Box Step-Up', 'Quads', 'Other', 60],
  ['Box Step-Down', 'Quads', 'Bodyweight', 60],
  ['Tibialis Raise', 'Calves', 'Bodyweight', 60],
  ['Monster Walk', 'Glutes', 'Other', 60],
  ['Hip Hike', 'Glutes', 'Bodyweight', 45],
  // Carries and sleds
  ['Farmer Carry', 'Core', 'Dumbbell', 90, 'time'],
  ['Suitcase Carry', 'Core', 'Dumbbell', 75, 'time'],
  ['Sled Push', 'Quads', 'Other', 120, 'time'],
  ['Sled Drag', 'Hamstrings', 'Other', 120, 'time'],
  ['Sandbag Carry', 'Core', 'Other', 120, 'time'],
  // Kettlebell
  ['Kettlebell Swing', 'Glutes', 'Kettlebell', 90],
  ['Turkish Get-Up', 'Core', 'Kettlebell', 120],
  ['Kettlebell Clean and Press', 'Shoulders', 'Kettlebell', 90],
  ['Kettlebell Front Squat', 'Quads', 'Kettlebell', 120],
  ['Kettlebell Snatch', 'Shoulders', 'Kettlebell', 90],
  ['Kettlebell Row', 'Back', 'Kettlebell', 90],
  // Bodyweight
  ['Inverted Row', 'Back', 'Bodyweight', 90],
  ['Pike Push-Up', 'Shoulders', 'Bodyweight', 90],
  ['Diamond Push-Up', 'Triceps', 'Bodyweight', 90],
  ['Pistol Squat', 'Quads', 'Bodyweight', 120],
  ['L-Sit', 'Core', 'Bodyweight', 90, 'time'],
  ['Handstand Hold', 'Shoulders', 'Bodyweight', 90, 'time'],
  ['Hollow Body Hold', 'Core', 'Bodyweight', 45, 'time'],
  ['Bear Crawl', 'Core', 'Bodyweight', 60, 'time'],
  ['Mountain Climber', 'Core', 'Bodyweight', 45, 'time'],
  ['Dead Bug', 'Core', 'Bodyweight', 45],
  ['Bird Dog', 'Core', 'Bodyweight', 45],
  ['Copenhagen Plank', 'Core', 'Bodyweight', 45, 'time'],
];

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Where to go to see a movement performed.
 *
 * A curated `video` on the exercise wins. Otherwise this returns a search
 * rather than a single hand-picked clip: a search never rots, covers the
 * exercises you add yourself, and does not quietly send you to a video that
 * was taken down a year ago. Nothing is embedded — the link opens in the
 * browser, so no third-party player loads inside the app.
 */
export function howToUrl(exercise) {
  if (exercise?.video) return exercise.video;
  const name = String(exercise?.name || '').trim();
  if (!name) return null;
  const q = encodeURIComponent(`how to ${name} proper form technique`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

/** Compare names ignoring case, spacing and punctuation. */
export function nameKey(name) {
  return String(name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Other names for exercises already in the library. A plan written as
 * "Dumbbell Lateral Raise" means the Lateral Raise here; giving it an entry of
 * its own would split one movement's progress across two exercises.
 *
 * Only names that are unambiguously the same movement belong here. Seated
 * versus standing, or rear foot up versus down, are different exercises and
 * get entries of their own instead.
 */
const ALIASES = {
  'Triceps Rope Pushdown': 'Rope Pushdown',
  'Tricep Rope Pushdown': 'Rope Pushdown',
  'Tricep Pushdown': 'Triceps Pushdown',
  'Dumbbell Lateral Raise': 'Lateral Raise',
  'DB Lateral Raise': 'Lateral Raise',
  'Overhead Cable Triceps Extension': 'Overhead Cable Extension',
  'Overhead Cable Tricep Extension': 'Overhead Cable Extension',
  'Single Arm Dumbbell Row': 'Dumbbell Row',
  'One Arm Dumbbell Row': 'Dumbbell Row',
  'Standing Overhead Press': 'Overhead Press',
  'Barbell Overhead Press': 'Overhead Press',
  'Pullup': 'Pull-Up',
  'Chinup': 'Chin-Up',
};

const ALIAS_IDS = new Map(Object.entries(ALIASES).map(([alias, name]) => [nameKey(alias), slugify(name)]));

/** The library id another name for an exercise stands for, if it is one. */
export function aliasId(name) {
  return ALIAS_IDS.get(nameKey(name)) || null;
}

export const SEED_EXERCISES = SEED.map(([name, group, equipment, restSec, mode]) => ({
  id: slugify(name),
  name,
  group,
  equipment,
  restSec,
  ...(mode && { mode }),
}));
