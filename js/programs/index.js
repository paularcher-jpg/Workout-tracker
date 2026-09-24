// The built-in program library.
//
// Each program carries its plan as CSV in the same format the plan importer
// reads, so a built-in program and a plan you paste in yourself go through one
// parser and produce the same routines and schedule.

import { STRENGTH } from './strength.js';
import { MUSCLE } from './muscle.js';
import { ENDURANCE } from './endurance.js';
import { MINIMAL } from './minimal.js';

export const PROGRAMS = [...STRENGTH, ...MUSCLE, ...ENDURANCE, ...MINIMAL];

export const GOALS = [
  { id: 'strength', label: 'Strength' },
  { id: 'muscle', label: 'Muscle' },
  { id: 'powerbuilding', label: 'Powerbuilding' },
  { id: 'endurance', label: 'Endurance' },
  { id: 'conditioning', label: 'Conditioning' },
  { id: 'bodyweight', label: 'Bodyweight' },
];

export const LEVELS = ['beginner', 'intermediate', 'advanced'];

export function getProgram(id) {
  return PROGRAMS.find((p) => p.id === id) || null;
}
