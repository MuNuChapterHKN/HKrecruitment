import { db, schema } from '@/db';
import type { ApplicationStage, Applicant, StageStatus } from '@/db/types';
import { and, eq, isNull } from 'drizzle-orm';

export type ActiveStageContext = {
  stageStatus: StageStatus;
  applicant: Applicant;
};

export async function loadActiveStageContext(params: {
  stageStatusId: string;
  expectedStage: ApplicationStage;
}): Promise<ActiveStageContext | null> {
  const statuses = await db
    .select()
    .from(schema.stageStatus)
    .where(
      and(
        eq(schema.stageStatus.id, params.stageStatusId),
        eq(schema.stageStatus.processed, false),
        isNull(schema.stageStatus.deletedAt)
      )
    )
    .limit(1);

  const stageStatus = statuses[0];
  if (!stageStatus || stageStatus.stage !== params.expectedStage) {
    return null;
  }

  const applicants = await db
    .select()
    .from(schema.applicant)
    .where(eq(schema.applicant.id, stageStatus.applicantId))
    .limit(1);

  const applicant = applicants[0];
  if (!applicant || applicant.stage !== params.expectedStage) {
    return null;
  }

  return { stageStatus, applicant };
}

export async function markStageStatusProcessed(
  stageStatusId: string
): Promise<void> {
  await db
    .update(schema.stageStatus)
    .set({ processed: true })
    .where(eq(schema.stageStatus.id, stageStatusId));
}

export async function loadInterviewSlotForApplicant(applicantId: string) {
  const rows = await db
    .select({
      applicant: schema.applicant,
      interview: schema.interview,
      timeslot: schema.timeslot,
    })
    .from(schema.applicant)
    .innerJoin(
      schema.interview,
      eq(schema.applicant.interviewId, schema.interview.id)
    )
    .innerJoin(
      schema.timeslot,
      eq(schema.interview.timeslotId, schema.timeslot.id)
    )
    .where(eq(schema.applicant.id, applicantId))
    .limit(1);

  return rows[0] ?? null;
}

export async function loadInterviewers(interviewId: string) {
  return await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
    })
    .from(schema.usersToInterviews)
    .innerJoin(schema.user, eq(schema.usersToInterviews.userId, schema.user.id))
    .where(eq(schema.usersToInterviews.interviewId, interviewId));
}

export async function updateInterviewGeneratedData(params: {
  interviewId: string;
  meetingId?: string | null;
  reportDocId?: string | null;
}): Promise<void> {
  const values: {
    meetingId?: string | null;
    reportDocId?: string | null;
  } = {};

  if (params.meetingId !== undefined) {
    values.meetingId = params.meetingId;
  }

  if (params.reportDocId !== undefined) {
    values.reportDocId = params.reportDocId;
  }

  if (Object.keys(values).length === 0) {
    return;
  }

  await db
    .update(schema.interview)
    .set(values)
    .where(eq(schema.interview.id, params.interviewId));
}
