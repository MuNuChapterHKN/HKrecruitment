import { getApplicantById } from '@/lib/services/applicants';
import ActionButtons from './ActionButtons';
import { Button } from '@/components/ui';
import { InterviewCard } from '@/components/dashboard';
import {
  findOne,
  findInterviewers,
  bookInterview,
  deleteInterview,
} from '@/lib/services/interviews';
import { getStageHistory } from '@/lib/services/stages';
import { CandidateTabs } from './CandidateTabs';
import { StageHistory } from './StageHistory';
import { StageBadge } from './StageBadge';
import { degreeLevelMap } from '@/lib/degrees';
import { getFileViewUrl } from '@/lib/google/drive/files';
import { findOne as findRecruitmentSession } from '@/lib/services/recruitmentSessions';
import { Mail } from 'lucide-react';
import { ManualBookingClient } from './ManualBookingClient';
import { DeleteInterviewButton } from './DeleteInterviewButton';
import { findAvailableForBooking } from '@/lib/services/timeslots';
import { revalidatePath } from 'next/cache';
import { INTERVIEW_BOOKING_STAGE } from '@/lib/stages';
import { UpdateFileDialog } from './UpdateFileDialog';

export default async function CandidateDetailsPage({
  params,
}: PageProps<'/dashboard/[rid]/candidates/[id]'>) {
  const { id } = await params;
  const applicant = await getApplicantById(id);

  if (!applicant) {
    return null;
  }

  const recruitmentSession = await findRecruitmentSession(
    applicant.recruitingSessionId
  );

  let interview = null;
  let interviewers: Array<{ id: string; name: string; image: string | null }> =
    [];
  if (applicant.interviewId) {
    interview = await findOne(applicant.interviewId);
    interviewers = await findInterviewers(applicant.interviewId);
  }

  const stageHistory = await getStageHistory(id);

  const availableTimeslots = await findAvailableForBooking(
    applicant.recruitingSessionId
  );

  const timeslots = availableTimeslots.map((ts) => ({
    id: ts.id,
    startingFrom: ts.startingFrom,
    active: false,
    locked: false,
  }));

  async function handleManualBooking(timeslotId: string) {
    'use server';

    const currentApplicant = await getApplicantById(id);
    if (!currentApplicant) return;

    await bookInterview(id, timeslotId);
    revalidatePath(
      `/dashboard/${currentApplicant.recruitingSessionId}/candidates/${id}`
    );
  }

  async function handleDeleteInterview() {
    'use server';

    const currentApplicant = await getApplicantById(id);
    if (!currentApplicant) return;

    await deleteInterview(id);
    revalidatePath(
      `/dashboard/${currentApplicant.recruitingSessionId}/candidates/${id}`
    );
  }

  const emailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(applicant.email)}&su=${encodeURIComponent(`IEEE-HKN Recruitment ${recruitmentSession?.year || ''}: `)}&body=BODY&cc=${encodeURIComponent('board@hknpolito.org,hr@hknpolito.org')}`;

  const detailsContent = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div key="quick-view">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Quick View
        </h2>
        <div className="bg-muted/30 rounded-lg border p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">Email:</span> {applicant.email}
            </div>
            <Button size="sm" variant="outline" asChild>
              <a href={emailUrl} target="_blank" rel="noopener noreferrer">
                <Mail className="size-4" />
              </a>
            </Button>
          </div>
          <div>
            <span className="font-semibold">Degree Level:</span>{' '}
            {degreeLevelMap[applicant.degreeLevel]}
          </div>
          <div>
            <span className="font-semibold">Course:</span> {applicant.course}
          </div>
          <div>
            <span className="font-semibold">GPA:</span> {applicant.gpa}/30
          </div>
          <div>
            <span className="font-semibold">Italian Level:</span>{' '}
            {applicant.italianLevel.toUpperCase()}
          </div>
        </div>
      </div>

      <div key="quick-actions">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <ActionButtons applicant={applicant} />
      </div>

      {interview && (
        <div key="interview-details">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Interview Details
            </h2>
            <DeleteInterviewButton deleteAction={handleDeleteInterview} />
          </div>
          <InterviewCard
            interview={{
              startingFrom: interview.startingFrom,
              confirmed: interview.confirmed,
              meetingId: interview.meetingId,
            }}
            interviewers={interviewers}
            variant="compact"
          />
        </div>
      )}

      <div key="attachments">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Attachments
        </h2>
        <div className="flex gap-4">
          <div key="cv-file" className="relative">
            <a
              href={getFileViewUrl(applicant.cvFileId)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center space-y-2 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg
                className="w-10 h-10 text-muted-foreground"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-medium text-sm">CV</p>
            </a>
            <UpdateFileDialog
              applicantId={applicant.id}
              fileType="cv"
              fileLabel="CV"
            />
          </div>

          <div key="sp-file" className="relative">
            <a
              href={getFileViewUrl(applicant.spFileId)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center space-y-2 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg
                className="w-10 h-10 text-muted-foreground"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-medium text-sm">StudyPath</p>
            </a>
            <UpdateFileDialog
              applicantId={applicant.id}
              fileType="sp"
              fileLabel="StudyPath"
            />
          </div>

          {interview?.reportDocId && (
            <a
              key="report-file"
              href={getFileViewUrl(interview.reportDocId)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center space-y-2 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg
                className="w-10 h-10 text-muted-foreground"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-medium text-sm">Interview Report</p>
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const bookingContent =
    applicant.stage >= INTERVIEW_BOOKING_STAGE ? (
      <ManualBookingClient
        timeslots={timeslots}
        hasExistingInterview={!!applicant.interviewId}
        onSubmitAction={handleManualBooking}
      />
    ) : (
      <div className="rounded-lg border bg-muted/30 p-6">
        <h2 className="text-lg font-semibold mb-2">
          Booking Not Available Yet
        </h2>
        <p className="text-sm text-muted-foreground">
          This candidate has not reached the interview booking stage yet. Please
          advance their stage before attempting to book an interview.
        </p>
      </div>
    );

  return (
    <main className="px-6 py-4">
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {applicant.name} {applicant.surname}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {applicant.createdAt
                ? new Date(applicant.createdAt).toLocaleDateString()
                : ''}
            </p>
          </div>
          <StageBadge stage={applicant.stage} />
        </header>

        <CandidateTabs
          detailsContent={detailsContent}
          historyContent={<StageHistory history={stageHistory} />}
          bookingContent={bookingContent}
        />
      </div>
    </main>
  );
}
