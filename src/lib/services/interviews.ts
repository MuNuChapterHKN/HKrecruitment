import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { INTERVIEW_STAGE, INTERVIEW_BOOKING_STAGE } from '../stages';
import { switchStage } from './stages';
import { compare } from '../server/token';
import { findAvailableForBooking } from './timeslots';

export const findOne = async (interviewId: string) => {
  const result = await db
    .select({
      id: schema.interview.id,
      timeslotId: schema.interview.timeslotId,
      meetingId: schema.interview.meetingId,
      reportDocId: schema.interview.reportDocId,
      confirmed: schema.interview.confirmed,
      startingFrom: schema.timeslot.startingFrom,
    })
    .from(schema.interview)
    .innerJoin(
      schema.timeslot,
      eq(schema.interview.timeslotId, schema.timeslot.id)
    )
    .where(eq(schema.interview.id, interviewId))
    .limit(1);

  return result[0] ?? null;
};

export const findInterviewers = async (interviewId: string) => {
  const result = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      image: schema.user.image,
    })
    .from(schema.usersToInterviews)
    .innerJoin(schema.user, eq(schema.usersToInterviews.userId, schema.user.id))
    .where(eq(schema.usersToInterviews.interviewId, interviewId));

  return result;
};

export const bookInterview = async (
  applicantId: string,
  timeslotId: string,
  options: { token?: string } = {}
) => {
  const applicantRows = await db
    .select()
    .from(schema.applicant)
    .where(eq(schema.applicant.id, applicantId))
    .limit(1);
  const applicant = applicantRows[0];

  if (!applicant) {
    throw new Error('Applicant not found');
  }

  if (options.token !== undefined) {
    if (!applicant.token || !(await compare(options.token, applicant.token))) {
      throw new Error('Invalid booking token');
    }
  }

  if (applicant.interviewId) {
    throw new Error('Applicant already has an interview');
  }

  const timeslotRows = await db
    .select()
    .from(schema.timeslot)
    .where(eq(schema.timeslot.id, timeslotId))
    .limit(1);
  const timeslot = timeslotRows[0];

  if (!timeslot) {
    throw new Error('Timeslot not found');
  }

  if (timeslot.recruitingSessionId !== applicant.recruitingSessionId) {
    throw new Error('Timeslot does not belong to the applicant session');
  }

  const availableTimeslots = await findAvailableForBooking(
    applicant.recruitingSessionId
  );

  if (!availableTimeslots.some((ts) => ts.id === timeslotId)) {
    throw new Error('Timeslot is not available for booking');
  }

  const interviewId = nanoid();

  await db.transaction(async (tx) => {
    await tx.insert(schema.interview).values({
      id: interviewId,
      timeslotId,
      meetingId: 'placeholder',
      reportDocId: 'placeholder',
      confirmed: false,
    });

    await tx
      .update(schema.applicant)
      .set({
        interviewId,
      })
      .where(eq(schema.applicant.id, applicantId));
  });

  await switchStage(applicantId, INTERVIEW_STAGE, false, null);

  return interviewId;
};

export const deleteInterview = async (applicantId: string) => {
  const applicant = await db
    .select()
    .from(schema.applicant)
    .where(eq(schema.applicant.id, applicantId))
    .limit(1);

  if (!applicant[0] || !applicant[0].interviewId) {
    throw new Error('Applicant has no interview to delete');
  }

  const interviewId = applicant[0].interviewId;

  await db.transaction(async (tx) => {
    await tx
      .update(schema.applicant)
      .set({ interviewId: null })
      .where(eq(schema.applicant.id, applicantId));

    await tx
      .delete(schema.usersToInterviews)
      .where(eq(schema.usersToInterviews.interviewId, interviewId));

    await tx
      .delete(schema.interview)
      .where(eq(schema.interview.id, interviewId));
  });

  await switchStage(applicantId, INTERVIEW_BOOKING_STAGE, false, null);
};
