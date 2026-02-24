import { DegreeLevel } from '@/db/types';

export type { DegreeLevel };

export const degreeLevelMap: Record<DegreeLevel, string> = {
  bsc: 'Bachelor',
  msc: 'Master',
  phd: 'PhD',
};

export function getDegreeLabel(degree: DegreeLevel) {
  return degreeLevelMap[degree] || degree;
}
