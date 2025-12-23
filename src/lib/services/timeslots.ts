import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

const tsl = schema.timeslot;

export const findAll = async (rid: string) =>
  await db.select().from(tsl).where(eq(tsl.recruitingSessionId, rid));

export const findForUser = async (userId: string) => {
  const availabilities = await db
    .select()
    .from(schema.interviewerAvailability)
    .where(eq(schema.interviewerAvailability.userId, userId));

  return availabilities.map((a) => a.timeslotId);
};
