import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { INTERVIEW_STAGE } from '../stages';

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

export const bookInterview = async (
  applicantId: string,
  timeslotId: string
) => {
  const interviewId = nanoid();
  const stageStatusId = nanoid();

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
        stage: INTERVIEW_STAGE,
        interviewId,
      })
      .where(eq(schema.applicant.id, applicantId));

    await tx.insert(schema.stageStatus).values({
      id: stageStatusId,
      applicantId,
      assignedById: null,
      stage: INTERVIEW_STAGE,
      processed: true,
    });
  });

  return interviewId;
};
