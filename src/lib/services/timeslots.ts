import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

export const findAll = async () => await db.select().from(schema.timeslot);

export const findForUser = async (userId: string) => {
  const availabilities = await db
    .select()
    .from(schema.interviewerAvailability)
    .where(eq(schema.interviewerAvailability.userId, userId));

  return availabilities.map((a) => a.timeslotId);
};
