import { Applicant } from '@/db/types';
import { DashboardLink } from '@/components/dashboard/DashboardLink';
import { getStageLabel, getStageColor } from '@/lib/stages';
import { getDegreeLabel } from '@/lib/degrees';

export function ApplicantCard({ applicant }: { applicant: Applicant }) {
  return (
    <DashboardLink href={`/candidates/${applicant.id}`} className="block">
      <div className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 w-[300px] border border-border">
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
