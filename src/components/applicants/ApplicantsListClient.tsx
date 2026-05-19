'use client';

import { useDeferredValue, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import type { Applicant } from '@/db/types';
import { applicantsFiltersAtom } from '@/state/applicantsFiltersAtoms';
import { ApplicantsFilters } from './ApplicantsFilters';
import { ApplicantCard } from './ApplicantCard';

export function ApplicantsListClient({
  applicants,
}: {
  applicants: Applicant[];
}) {
  const filters = useAtomValue(applicantsFiltersAtom);
  const deferredSearch = useDeferredValue(filters.search);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return applicants.filter((a) => {
      // archived
      const isArchived =
        (a as Applicant & { archived?: boolean }).archived ?? false;
      if (!filters.showArchived && isArchived) return false;

      // search (name, surname, email, course)
      if (q) {
        const haystack =
          `${a.name} ${a.surname} ${a.email} ${a.course ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // stages
      if (filters.stages.length > 0 && !filters.stages.includes(a.stage)) {
        return false;
      }

      // degree levels
      if (
        filters.degreeLevels.length > 0 &&
        !filters.degreeLevels.includes(a.degreeLevel)
      ) {
        return false;
      }

      // areas
      if (filters.areas.length > 0) {
        const chosenArea = (a as Applicant & { chosenArea?: string | null })
          .chosenArea;
        if (!chosenArea || !filters.areas.includes(chosenArea as never)) {
          return false;
        }
      }

      return true;
    });
  }, [applicants, deferredSearch, filters]);

  const isStale = filters.search !== deferredSearch;
  const hasAnyFilter =
    deferredSearch.trim().length > 0 ||
    filters.stages.length > 0 ||
    filters.degreeLevels.length > 0 ||
    filters.areas.length > 0 ||
    filters.showArchived;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Candidates</h1>
        <div className="text-sm text-muted-foreground">
          {hasAnyFilter
            ? `${filtered.length} of ${applicants.length}`
            : `${applicants.length} candidate${applicants.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      <ApplicantsFilters />

      <div
        className="flex flex-wrap gap-4"
        style={{ opacity: isStale ? 0.7 : 1, transition: 'opacity 120ms' }}
      >
        {filtered.map((applicant) => (
          <ApplicantCard key={applicant.id} applicant={applicant} />
        ))}
        {filtered.length === 0 && (
          <div className="w-full text-center text-muted-foreground py-12">
            {hasAnyFilter
              ? 'No candidates match the current filters.'
              : 'No candidates found.'}
          </div>
        )}
      </div>
    </>
  );
}
