import { atomWithStorage } from 'jotai/utils';
import { AREAS } from '@/db/schema';
import type { ApplicationStage, DegreeLevel } from '@/db/types';

export type Area = (typeof AREAS)[number];

export type ApplicantsFilters = {
  search: string;
  stages: ApplicationStage[];
  degreeLevels: DegreeLevel[];
  showArchived: boolean;
};

export const defaultApplicantsFilters: ApplicantsFilters = {
  search: '',
  stages: [],
  degreeLevels: [],
  showArchived: false,
};

export const APPLICANTS_FILTERS_STORAGE_KEY =
  'hkrecruitment.applicants.filters';

export const applicantsFiltersAtom = atomWithStorage<ApplicantsFilters>(
  APPLICANTS_FILTERS_STORAGE_KEY,
  defaultApplicantsFilters
);
