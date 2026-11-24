import { FileText, UserRound } from 'lucide-react';
import Link from 'next/link';
import { headers } from 'next/headers';

import { auth } from '@/lib/server/auth';
import { requirePageAccess } from '@/lib/helpers/pageAuthorization';
import {
  findTimeslotsWithInterviewsForUser,
  findWithAggregatedAvailability,
} from '@/lib/services/timeslots';
import { getApplicantById } from '@/lib/services/applicants';
import { findOne } from '@/lib/services/interviews';

const googleDocumentBaseUrl = 'https://docs.google.com/document/d/';

const dateTimeFormatter = new Intl.DateTimeFormat('it-IT', {
  timeZone: 'Europe/Rome',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default async function UpcomingInterviewsPage({
  params,
}: PageProps<'/dashboard/[rid]/me/interviews'>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const { user } = session;
  const { rid } = await params;

  await requirePageAccess(user.id, rid, 'UpcomingInterviewsPage');

  const timeslots = await findWithAggregatedAvailability(rid);

  const timeslotsWithInterviews = await findTimeslotsWithInterviewsForUser(
    user.id
  );

  const userInterviews = [];

  for (const timeslotId of timeslotsWithInterviews) {
    const selectedTimeslot = timeslots.find(
      (timeslot) => timeslot.id === timeslotId
    );

    if (!selectedTimeslot) continue;

    for (const interviewElement of selectedTimeslot.interviews) {
      if (!interviewElement.interviewerIds.includes(user.id)) {
        continue;
      }

      const applicant = await getApplicantById(interviewElement.applicant.id);

      if (!applicant) {
        console.warn(
          'Applicant not found for interview:',
          interviewElement.meetingId
        );
        continue;
      }

      if (!applicant.interviewId) {
        console.warn('Interview ID not found for applicant:', applicant.id);
        continue;
      }

      const interview = await findOne(applicant.interviewId);

      if (!interview) {
        console.warn('Interview not found for applicant:', applicant.id);
        continue;
      }

      const curriculumLink = applicant.cvFileId
        ? `${googleDocumentBaseUrl}${applicant.cvFileId}`
        : null;

      const studyPathLink = applicant.spFileId
        ? `${googleDocumentBaseUrl}${applicant.spFileId}`
        : null;

      const reportLink = interview.reportDocId
        ? `${googleDocumentBaseUrl}${interview.reportDocId}`
        : null;

      userInterviews.push({
        id: interview.id,
        date: interview.startingFrom,
        content: (
          <div
            key={interview.id}
            className="w-full rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3>
              Interview with{' '}
              <strong>
                {applicant.name} {applicant.surname}
              </strong>
            </h3>

            <div className="mt-2 space-y-2">
              <p>
                <strong>Date:</strong>{' '}
                {dateTimeFormatter.format(interview.startingFrom)}
              </p>

              <p>
                <strong>Interviewers:</strong>{' '}
                {interviewElement.interviewers.join(', ')}
              </p>

              {curriculumLink && (
                <a
                  href={curriculumLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FileText className="h-5 w-5" />
                  Curriculum
                </a>
              )}

              {studyPathLink && (
                <a
                  href={studyPathLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FileText className="h-5 w-5" />
                  Study Path
                </a>
              )}

              {reportLink && (
                <a
                  href={reportLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FileText className="h-5 w-5" />
                  Report
                </a>
              )}

              <Link
                href={`/dashboard/${rid}/candidates/${applicant.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <UserRound className="h-5 w-5" />
                Show candidate page
              </Link>
            </div>
          </div>
        ),
      });
    }
  }

  userInterviews.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <main className="px-6 py-4">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Upcoming interviews
          </h1>

          <span className="rounded-full border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Beta
          </span>
        </div>

        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          This feature is still under development and may not always provide
          complete or fully accurate information. Use it as a convenient
          overview, but not as the authoritative source of interview data.
        </p>
      </header>

      <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
        <p className="font-medium">Access and permissions</p>

        <p className="mt-1">
          Some features and files available through this platform depend on your
          specific user permissions.
        </p>

        <p className="mt-1">
          If you cannot access one of the candidate files, ask someone with the
          appropriate Google Drive permissions to grant you access for this
          candidate.
        </p>
      </div>

      <div className="w-full space-y-4">
        {userInterviews.map((interview) => interview.content)}
      </div>
    </main>
  );
}
