import type { Applicant } from '@/db/types';
import { DashboardLink } from '@/components/dashboard/DashboardLink';
import { getStageLabel, getStageColor } from '@/lib/stages';
import { getDegreeLabel } from '@/lib/degrees';
import { cn } from '@/lib/utils';
import { ArchiveButton } from './ArchiveButton';

export function ApplicantCard({
  applicant,
  archived,
  onToggleArchive,
}: {
  applicant: Applicant;
  archived: boolean;
  onToggleArchive: () => void;
}) {
  return (
    <DashboardLink href={`/candidates/${applicant.id}`} className="block">
      <div
        className={cn(
          'bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 w-[300px] border border-border',
          archived && 'opacity-60'
        )}
      >
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
          <ArchiveButton archived={archived} onToggle={onToggleArchive} />
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="text-foreground font-medium">
            {getDegreeLabel(applicant.degreeLevel)} of {applicant.course}
          </div>
          <div className="text-sm text-muted-foreground">{applicant.email}</div>
          <div className="text-xs text-muted-foreground pt-1">
            {applicant.createdAt
              ? new Date(applicant.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                })
              : ''}
          </div>
        </div>
      </div>
    </DashboardLink>
  );
}
