'use client';

import { useDeferredValue, useMemo, useOptimistic, useTransition } from 'react';
import { useAtomValue } from 'jotai';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import type { Applicant } from '@/db/types';
import { applicantsFiltersAtom } from '@/state/applicantsFiltersAtoms';
import {
  archiveApplicantAction,
  unarchiveApplicantAction,
} from '@/lib/actions/applicants';
import { ApplicantsFilters } from './ApplicantsFilters';
import { ApplicantCard } from './ApplicantCard';

type ArchiveUpdate = { id: string; archived: boolean };

export function ApplicantsListClient({
  applicants,
}: {
  applicants: Applicant[];
}) {
  const params = useParams();
  const rid = params.rid as string;
  const filters = useAtomValue(applicantsFiltersAtom);
  const deferredSearch = useDeferredValue(filters.search);
  const [, startTransition] = useTransition();

  const [optimisticApplicants, updateOptimistic] = useOptimistic(
    applicants,
    (state, { id, archived }: ArchiveUpdate) =>
      state.map((a) => (a.id === id ? { ...a, archived } : a))
  );

  function toggleArchive(applicantId: string, currentlyArchived: boolean) {
    const newArchived = !currentlyArchived;
    startTransition(async () => {
      updateOptimistic({ id: applicantId, archived: newArchived });
      const action = newArchived
        ? archiveApplicantAction
        : unarchiveApplicantAction;
      const result = await action(rid, applicantId);

      if (!result.success) {
        toast.error(result.error ?? 'Something went wrong');
        return;
      }

      toast(newArchived ? 'Candidate archived' : 'Candidate unarchived', {
        action: {
          label: 'Undo',
          onClick: () => {
            startTransition(async () => {
              updateOptimistic({
                id: applicantId,
                archived: currentlyArchived,
              });
              const undoAction = newArchived
                ? unarchiveApplicantAction
                : archiveApplicantAction;
              await undoAction(rid, applicantId);
            });
          },
        },
      });
    });
  }

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return optimisticApplicants.filter((a) => {
      const isArchived =
        (a as Applicant & { archived?: boolean }).archived ?? false;
      if (!filters.showArchived && isArchived) return false;

      if (q) {
        const haystack =
          `${a.name} ${a.surname} ${a.email} ${a.course ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (filters.stages.length > 0 && !filters.stages.includes(a.stage))
        return false;
      if (
        filters.degreeLevels.length > 0 &&
        !filters.degreeLevels.includes(a.degreeLevel)
      )
        return false;

      if (filters.areas.length > 0) {
        const chosenArea = (a as Applicant & { chosenArea?: string | null })
          .chosenArea;
        if (!chosenArea || !filters.areas.includes(chosenArea as never))
          return false;
      }

      return true;
    });
  }, [optimisticApplicants, deferredSearch, filters]);

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
        {filtered.map((applicant) => {
          const archived =
            (applicant as Applicant & { archived?: boolean }).archived ?? false;
          return (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              archived={archived}
              onToggleArchive={() => toggleArchive(applicant.id, archived)}
            />
          );
        })}
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
