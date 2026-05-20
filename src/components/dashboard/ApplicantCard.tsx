import { Avatar, AvatarFallback } from '@/components/ui';
import { getStageColor, getStageLabel } from '@/lib/stages';
import type { Applicant } from '@/db/types';

type ApplicantCardProps = {
  applicant: Applicant;
};

function getInitials(name: string, surname: string): string {
  return `${name[0] ?? ''}${surname[0] ?? ''}`.toUpperCase();
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
}

export function ApplicantCard({ applicant }: ApplicantCardProps) {
  return (
    <div className="w-64 shrink-0 rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="text-xs font-medium">
            {getInitials(applicant.name, applicant.surname)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">
            {applicant.name} {applicant.surname}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {applicant.course}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: getStageColor(applicant.stage) }}
          />
          <span className="text-xs text-muted-foreground">
            {getStageLabel(applicant.stage)}
          </span>
        </div>
        {applicant.createdAt && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatDate(applicant.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}
