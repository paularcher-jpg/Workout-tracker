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
  ['Seated Cable Row', 'Back', 'Cable', 120],
  ['Chest-Supported Row', 'Back', 'Machine', 120],
  ['T-Bar Row', 'Back', 'Barbell', 150],
  ['Straight-Arm Pulldown', 'Back', 'Cable', 90],
  ['Face Pull', 'Back', 'Cable', 90],
  ['Rack Pull', 'Back', 'Barbell', 210],
  // Shoulders
  ['Overhead Press', 'Shoulders', 'Barbell', 180],
  ['Seated Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell', 150],
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
  ['Walking Lunge', 'Quads', 'Dumbbell', 120],
  ['Goblet Squat', 'Quads', 'Dumbbell', 120],
  ['Leg Extension', 'Quads', 'Machine', 90],
  ['Step-Up', 'Quads', 'Dumbbell', 90],
  // Hamstrings
  ['Romanian Deadlift', 'Hamstrings', 'Barbell', 180],
  ['Stiff-Leg Deadlift', 'Hamstrings', 'Barbell', 180],
  ['Lying Leg Curl', 'Hamstrings', 'Machine', 90],
  ['Seated Leg Curl', 'Hamstrings', 'Machine', 90],
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
];

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export const SEED_EXERCISES = SEED.map(([name, group, equipment, restSec, mode]) => ({
  id: slugify(name),
  name,
  group,
  equipment,
  restSec,
  ...(mode && { mode }),
}));
