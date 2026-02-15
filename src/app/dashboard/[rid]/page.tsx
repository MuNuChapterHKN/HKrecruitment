import {
  findActive,
  findLatestPast,
  findOne,
} from '@/lib/services/recruitmentSessions';
import { notFound } from 'next/navigation';
import { listAllApplicants } from '@/lib/services/applicants';
import { getStageColor, getStageLabel } from '@/lib/stages';
import { STAGES } from '@/db/schema';
import type { ApplicationStage } from '@/db/types';

export default async function Dashboard({
  params,
}: PageProps<'/dashboard/[rid]'>) {
  const { rid } = await params;
  const recruitmentSession = await findOne(rid);
  if (!recruitmentSession) notFound();

  const [activeSession, latestPastSession, applicants] = await Promise.all([
    findActive(),
    findLatestPast(),
    listAllApplicants(rid),
  ]);

  const stageCounts = Object.fromEntries(
    STAGES.map((stage) => [stage, 0])
  ) as Record<ApplicationStage, number>;

  applicants.forEach((applicant) => {
    stageCounts[applicant.stage] = (stageCounts[applicant.stage] ?? 0) + 1;
  });

  const formatSessionLabel = (session: typeof recruitmentSession) =>
    `${session.year} S${session.semester}`;

  const formatDateRange = (session: typeof recruitmentSession) =>
    `${new Date(session.start_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} - ${new Date(session.end_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;

  const statusLabel = activeSession
    ? `Active session: ${formatSessionLabel(activeSession)}`
    : latestPastSession
      ? `No active session. Last session: ${formatSessionLabel(latestPastSession)}`
      : 'No recruitment sessions yet';

  const statusRange = activeSession
    ? formatDateRange(activeSession)
    : latestPastSession
      ? formatDateRange(latestPastSession)
      : null;

  return (
    <main className="px-4 sm:px-6 py-4 sm:py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Overview
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Current session: {formatSessionLabel(recruitmentSession)}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">
            Recruitment status
          </div>
          <div className="mt-1 text-sm sm:text-base font-semibold break-words">
            {statusLabel}
          </div>
          {statusRange && (
            <div className="mt-1 text-xs text-muted-foreground">
              {statusRange}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Session window</div>
          <div className="mt-1 text-base font-semibold">
            {formatSessionLabel(recruitmentSession)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatDateRange(recruitmentSession)}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Applicants</div>
          <div className="mt-2 text-2xl sm:text-3xl font-semibold">
            {applicants.length}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Total for this session
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Stages</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            {STAGES.map((stage) => (
              <div
                key={stage}
                className="flex items-center justify-between rounded-md border px-2 py-1.5 sm:flex-col sm:items-start sm:justify-start"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: getStageColor(stage) }}
                  />
                  <span className="text-muted-foreground">
                    {getStageLabel(stage)}
                  </span>
                </div>
                <span className="font-semibold sm:mt-1">
                  {stageCounts[stage]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
