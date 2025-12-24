import { compare } from '@/lib/server/token';
import { getApplicantById } from '@/lib/services/applicants';
import { unauthorized } from 'next/navigation';
import { InterviewBookingClient } from './InterviewBookingClient';
import { findAvailableForBooking } from '@/lib/services/timeslots';
import {
  findOne,
  bookInterview,
  findInterviewers,
} from '@/lib/services/interviews';
import { revalidatePath } from 'next/cache';
import { INTERVIEW_BOOKING_STAGE } from '@/lib/stages';

export type TimeslotPeek = {
  id: string;
  startingFrom: Date;
  active: boolean;
};

export type Interviewer = {
  id: string;
  name: string;
  image: string | null;
};

export type InterviewInfo = {
  id: string;
  startingFrom: Date;
  meetingId: string | null;
  confirmed: boolean;
  interviewers: Interviewer[];
};

export default async function InterviewBookingPage({
  params,
  searchParams,
}: PageProps<'/interview/book/[aid]'>) {
  const { aid } = await params;
  const { token } = await searchParams;

  if (!aid || !token || Array.isArray(token)) unauthorized();

  const applicant = await getApplicantById(aid);
  if (
    !applicant ||
    !applicant.token ||
    applicant.stage < INTERVIEW_BOOKING_STAGE
  )
    unauthorized();

  if (!(await compare(token, applicant.token))) unauthorized();

  let interview: InterviewInfo | null = null;
  if (applicant.interviewId) {
    const interviewData = await findOne(applicant.interviewId);
    if (interviewData) {
      const interviewers = await findInterviewers(applicant.interviewId);
      interview = {
        id: interviewData.id,
        startingFrom: interviewData.startingFrom,
        meetingId: interviewData.meetingId,
        confirmed: interviewData.confirmed,
        interviewers,
      };
    }
  }

  const availableTimeslots = await findAvailableForBooking(
    applicant.recruitingSessionId
  );

  const timeslots: TimeslotPeek[] = availableTimeslots.map((ts) => ({
    id: ts.id,
    startingFrom: ts.startingFrom,
    active: false,
  }));

  async function handleBooking(timeslotId: string) {
    'use server';

    await bookInterview(aid, timeslotId);
    revalidatePath(`/interview/book/${aid}`);
  }

  return (
    <InterviewBookingClient
      timeslots={timeslots}
      applicantName={`${applicant.name} ${applicant.surname}`}
      interview={interview}
      onSubmitAction={handleBooking}
    />
  );
}
