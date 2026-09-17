import type { Area } from '@/state/applicantsFiltersAtoms';

export const areaLabels: Record<Area, string> = {
  it: 'IT',
  hr: 'HR',
  tutoring: 'Tutoring',
  comms: 'Communications',
  training: 'Training',
  events: 'Events',
};

export function getAreaLabel(area: Area): string {
  return areaLabels[area];
}
