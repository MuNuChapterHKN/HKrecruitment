'use server';

import { db } from '@/db';
import { interviewerAvailability } from '@/db/schema';
import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function submitAvailability(timeslotIds: string[]) {
  /* Check Auth */
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  const { user } = session;

  try {
    // Delete existing availabilities for this user
    await db
      .delete(interviewerAvailability)
      .where(eq(interviewerAvailability.userId, user.id));

    // Insert new availabilities
    if (timeslotIds.length > 0) {
      await db.insert(interviewerAvailability).values(
        timeslotIds.map((timeslotId) => ({
          userId: user.id,
          timeslotId,
        }))
      );
    }

    revalidatePath('/dashboard/[rid]/me/availability');

    return { success: true };
  } catch (error) {
    console.error('Error submitting availability:', error);
    return { success: false, error: 'Failed to submit availability' };
  }
}
