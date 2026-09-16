'use client';

import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  tableFeatures,
  useTable,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { Applicant } from '@/db/types';
import { DashboardLink } from '@/components/dashboard/DashboardLink';
import { getStageColor, getStageLabel } from '@/lib/stages';
import { getDegreeLabel } from '@/lib/degrees';
import { areaLabels } from '@/lib/areas';
import { cn } from '@/lib/utils';
import { ArchiveButton } from './ArchiveButton';

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, datetime: sortFn_datetime },
});

const helper = createColumnHelper<typeof features, Applicant>();

const DEFAULT_SORTING: SortingState = [{ id: 'applied', desc: true }];

function formatApplied(createdAt: Applicant['createdAt']) {
  if (!createdAt) return '';
  return new Date(createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function CandidatesTable({
  applicants,
  onToggleArchive,
}: {
  applicants: Applicant[];
  onToggleArchive: (applicantId: string, currentlyArchived: boolean) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor((a) => `${a.name} ${a.surname}`, {
          id: 'candidate',
          header: 'Candidate',
          sortFn: 'alphanumeric',
          cell: ({ row }) => (
            <DashboardLink
              href={`/candidates/${row.original.id}`}
              className="block"
            >
              <span className="font-medium hover:underline">
                {row.original.name} {row.original.surname}
              </span>
              <span className="block text-xs text-muted-foreground">
                {row.original.email}
              </span>
            </DashboardLink>
          ),
        }),
        helper.accessor((a) => getStageLabel(a.stage), {
          id: 'stage',
          header: 'Stage',
          sortFn: 'alphanumeric',
          cell: ({ row }) => (
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: getStageColor(row.original.stage) }}
              />
              {getStageLabel(row.original.stage)}
            </span>
          ),
        }),
        helper.accessor((a) => getDegreeLabel(a.degreeLevel), {
          id: 'degree',
          header: 'Degree',
          sortFn: 'alphanumeric',
        }),
        helper.accessor('course', {
          id: 'course',
          header: 'Course',
          sortFn: 'alphanumeric',
        }),
        helper.accessor((a) => (a.chosenArea ? areaLabels[a.chosenArea] : ''), {
          id: 'area',
          header: 'Area',
          sortFn: 'alphanumeric',
          cell: ({ getValue }) => (
            <span className="text-muted-foreground">{getValue() || '—'}</span>
          ),
        }),
        helper.accessor('createdAt', {
          id: 'applied',
          header: 'Applied',
          sortFn: 'datetime',
          cell: ({ row }) => (
            <span className="whitespace-nowrap text-muted-foreground">
              {formatApplied(row.original.createdAt)}
            </span>
          ),
        }),
        helper.display({
          id: 'actions',
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <div className="flex justify-end">
              <ArchiveButton
                archived={row.original.archived ?? false}
                onToggle={() =>
                  onToggleArchive(
                    row.original.id,
                    row.original.archived ?? false
                  )
                }
              />
            </div>
          ),
        }),
      ]),
    [onToggleArchive]
  );

  const table = useTable({
    features,
    columns,
    data: applicants,
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[880px] text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap"
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <table.FlexRender header={header} />
                      {header.column.getIsSorted() === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                'border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors',
                (row.original.archived ?? false) && 'opacity-60'
              )}
            >
              {row.getAllCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 align-middle">
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
