'use client';

import { useAtom } from 'jotai';
import { Archive, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  applicantsFiltersAtom,
  defaultApplicantsFilters,
} from '@/state/applicantsFiltersAtoms';
import { STAGES, AREAS } from '@/db/schema';
import { stageLabels } from '@/lib/stages';
import { degreeLevelMap } from '@/lib/degrees';
import { areaLabels } from '@/lib/areas';
import type { ApplicationStage, DegreeLevel } from '@/db/types';
import { SearchInput } from './SearchInput';
import { FilterPopover } from './FilterPopover';

const stageOptions = STAGES.map((s) => ({
  value: s,
  label: stageLabels[s],
}));

const degreeOptions = (Object.keys(degreeLevelMap) as DegreeLevel[]).map(
  (d) => ({ value: d, label: degreeLevelMap[d] })
);

const areaOptions = AREAS.map((a) => ({ value: a, label: areaLabels[a] }));

export function ApplicantsFilters() {
  const [filters, setFilters] = useAtom(applicantsFiltersAtom);

  const hasActive =
    filters.search.length > 0 ||
    filters.stages.length > 0 ||
    filters.degreeLevels.length > 0 ||
    filters.areas.length > 0 ||
    filters.showArchived;

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput />
        <FilterPopover<ApplicationStage>
          label="Stage"
          options={stageOptions}
          selected={filters.stages}
          onChange={(stages) => setFilters((p) => ({ ...p, stages }))}
          width="w-[260px]"
        />
        <FilterPopover<DegreeLevel>
          label="Degree"
          options={degreeOptions}
          selected={filters.degreeLevels}
          onChange={(degreeLevels) =>
            setFilters((p) => ({ ...p, degreeLevels }))
          }
        />
        <FilterPopover
          label="Area"
          options={areaOptions}
          selected={filters.areas}
          onChange={(areas) => setFilters((p) => ({ ...p, areas }))}
          searchable
          searchPlaceholder="Search area…"
        />
        <div className="flex items-center gap-2 ml-1">
          <Switch
            id="show-archived"
            checked={filters.showArchived}
            onCheckedChange={(showArchived) =>
              setFilters((p) => ({ ...p, showArchived }))
            }
          />
          <Label
            htmlFor="show-archived"
            className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
          >
            <Archive className="h-3.5 w-3.5" />
            Archived
          </Label>
        </div>
        {hasActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters(defaultApplicantsFilters)}
            className="h-9 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
