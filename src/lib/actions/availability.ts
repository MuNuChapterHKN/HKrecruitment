'use server';

import { db, schema } from '@/db';
import { interviewerAvailability } from '@/db/schema';
import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { findTimeslotsWithInterviewsForUser } from '@/lib/services/timeslots';
import { abilityForUserInSession } from '@/lib/abilities/server';

export async function submitAvailability(timeslotIds: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  const { user } = session;

  try {
    if (!timeslotIds || timeslotIds.length === 0) {
      return { success: false, error: 'No timeslots provided' };
    }

    // infer recruitment session from first timeslot
    const ts = await db
      .select({ recruitingSessionId: schema.timeslot.recruitingSessionId })
      .from(schema.timeslot)
      .where(eq(schema.timeslot.id, timeslotIds[0]))
      .limit(1);

    const rid = ts.at(0)?.recruitingSessionId;
    if (!rid) return { success: false, error: 'Invalid timeslot' };

    const ability = await abilityForUserInSession(user.id, rid);
    if (!ability.can('submit', 'AvailabilityActions')) {
      return { success: false, error: 'Forbidden' };
    }

    const lockedTimeslotIds = await findTimeslotsWithInterviewsForUser(user.id);

    const existingAvailabilities = await db
      .select()
      .from(interviewerAvailability)
      .where(eq(interviewerAvailability.userId, user.id));

    const existingLockedTimeslots = existingAvailabilities
      .filter((av) => lockedTimeslotIds.includes(av.timeslotId))
      .map((av) => av.timeslotId);

    const attemptingToRemoveLocked = existingLockedTimeslots.some(
      (lockedId) => !timeslotIds.includes(lockedId)
    );

    if (attemptingToRemoveLocked) {
      return {
        success: false,
        error:
          'Cannot remove availability from timeslots with scheduled interviews',
      };
    }

    await db
      .delete(interviewerAvailability)
      .where(eq(interviewerAvailability.userId, user.id));

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
