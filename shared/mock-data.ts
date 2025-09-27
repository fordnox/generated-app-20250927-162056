import type { Shooter, Stage } from './types';
export const MOCK_SHOOTERS: Shooter[] = [
  { id: 's1', name: 'John Wick', division: 'Open' },
  { id: 's2', name: 'Jane Doe', division: 'Production' },
  { id: 's3', name: 'Bob Smith', division: 'Standard' },
];
export const MOCK_STAGES: Stage[] = [
  { id: 'st1', name: 'El Presidente', maxPoints: 60 },
  { id: 'st2', name: 'Speed Challenge', maxPoints: 80 },
  { id: 'st3', name: 'Long Shot', maxPoints: 120 },
];