import { atomWithStorage } from 'jotai/utils';

export type ApplicantsView = 'grid' | 'table';

export const APPLICANTS_VIEW_STORAGE_KEY = 'hkrecruitment.applicants.view';

export const applicantsViewAtom = atomWithStorage<ApplicantsView>(
  APPLICANTS_VIEW_STORAGE_KEY,
  'grid'
);
