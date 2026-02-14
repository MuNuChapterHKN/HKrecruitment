'use client';

import { useMemo, useState } from 'react';
import { DashboardLink } from '@/components/dashboard/DashboardLink';
import { getStageLabel, getStageColor } from '@/lib/stages';
import { getDegreeLabel } from '@/lib/degrees';
import type { ApplicationStage, DegreeLevel } from '@/db/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CandidateRow = {
  id: string;
  name: string;
  surname: string;
  email: string;
  course: string;
  degreeLevel: DegreeLevel;
  stage: ApplicationStage;
  createdAt: string | null;
};

type CandidatesListClientProps = {
  applicants: CandidateRow[];
  stages: ApplicationStage[];
};

export function CandidatesListClient({
  applicants,
  stages,
}: CandidatesListClientProps) {
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApplicants = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    return applicants.filter((applicant) => {
      const matchesStage =
        stageFilter === 'all' || applicant.stage === stageFilter;
      if (!normalizedTerm) return matchesStage;
      const fullName = `${applicant.name} ${applicant.surname}`.toLowerCase();
      return matchesStage && fullName.includes(normalizedTerm);
    });
  }, [applicants, searchTerm, stageFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Candidates</h1>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {filteredApplicants.length} candidate
            {filteredApplicants.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name"
            className="w-full sm:w-64"
          />
          <div className="w-full sm:w-64">
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: getStageColor(stage) }}
                      />
                      {getStageLabel(stage)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredApplicants.map((applicant) => (
          <DashboardLink
            key={applicant.id}
            href={`/candidates/${applicant.id}`}
            className="block"
          >
            <div className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 w-full border border-border">
              <div className="flex items-start gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-sm shrink-0 mt-1"
                  style={{ backgroundColor: getStageColor(applicant.stage) }}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-base leading-tight">
                    {applicant.name} {applicant.surname}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {getStageLabel(applicant.stage)}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="text-foreground font-medium">
                  {getDegreeLabel(applicant.degreeLevel)} of {applicant.course}
                </div>

                <div className="text-sm text-muted-foreground">
                  {applicant.email}
                </div>

                <div className="text-xs text-muted-foreground pt-1">
                  {applicant.createdAt
                    ? new Date(applicant.createdAt).toLocaleDateString(
                        'en-GB',
                        {
                          day: 'numeric',
                          month: 'long',
                        }
                      )
                    : ''}
                </div>
              </div>
            </div>
          </DashboardLink>
        ))}
        {filteredApplicants.length === 0 && (
          <div className="w-full text-center text-muted-foreground py-12">
            No candidates found.
          </div>
        )}
      </div>
    </div>
  );
}
