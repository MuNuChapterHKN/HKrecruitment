'use client';

import { useDeferredValue, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import type { Applicant } from '@/db/types';
import { applicantsFiltersAtom } from '@/state/applicantsFiltersAtoms';
import { SearchInput } from './SearchInput';
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
    if (!q) return applicants;
    return applicants.filter((a) => {
      const haystack = `${a.name} ${a.surname} ${a.email}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [applicants, deferredSearch]);

  const isStale = filters.search !== deferredSearch;
  const hasQuery = deferredSearch.trim().length > 0;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Candidates</h1>
          <div className="text-sm text-muted-foreground">
            {hasQuery
              ? `${filtered.length} of ${applicants.length}`
              : `${applicants.length} candidate${applicants.length !== 1 ? 's' : ''}`}
          </div>
        </div>
        <SearchInput />
      </div>

      <div
        className="flex flex-wrap gap-4"
        style={{ opacity: isStale ? 0.7 : 1, transition: 'opacity 120ms' }}
      >
        {filtered.map((applicant) => (
          <ApplicantCard key={applicant.id} applicant={applicant} />
        ))}
        {filtered.length === 0 && (
          <div className="w-full text-center text-muted-foreground py-12">
            {hasQuery
              ? 'No candidates match your search.'
              : 'No candidates found.'}
          </div>
        )}
      </div>
    </>
  );
}
