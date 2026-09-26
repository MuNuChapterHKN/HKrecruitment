'use server';

import { db, schema } from '@/db';
import { interviewerAvailability } from '@/db/schema';
import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { findTimeslotsWithInterviewsForUser } from '@/lib/services/timeslots';
import { abilityForUserInSession } from '@/lib/abilities/server';

export async function submitAvailability(rid: string, timeslotIds: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  const { user } = session;

  try {
    // Validate all timeslots belong to the same recruiting session
    const timeslotRows = await db
      .select({ recruitingSessionId: schema.timeslot.recruitingSessionId })
      .from(schema.timeslot)
      .where(inArray(schema.timeslot.id, timeslotIds));

    if (timeslotRows.length !== timeslotIds.length) {
      return { success: false, error: 'Invalid timeslot' };
    }

    // Ensure all timeslots belong to the same recruiting session
    // If the Set contains more than one element, it means the time intervals come from different sessions
    // (this is either an attack or a client error -> reject them)
    const uniqueSessions = new Set(
      timeslotRows.map((t) => t.recruitingSessionId)
    );

    if (uniqueSessions.size > 1) {
      return {
        success: false,
        error: 'Timeslots must belong to the same session',
      };
    }

    if (uniqueSessions.size === 1 && !uniqueSessions.has(rid)) {
      return {
        success: false,
        error: 'Timeslots must belong to the requested session',
      };
    }

    const ability = await abilityForUserInSession(user.id, rid);
    if (!ability.can('submit', 'AvailabilityActions')) {
      return { success: false, error: 'Forbidden' };
    }

    const lockedTimeslotIds = await findTimeslotsWithInterviewsForUser(user.id);

    const existingAvailabilities = await db
      .select()
      .from(interviewerAvailability)
      .where(eq(interviewerAvailability.userId, user.id));

    const sessionTimeslotIds = (
      await db
        .select({ id: schema.timeslot.id })
        .from(schema.timeslot)
        .where(eq(schema.timeslot.recruitingSessionId, rid))
    ).map((timeslot) => timeslot.id);

    const existingSessionAvailabilities = existingAvailabilities.filter((av) =>
      sessionTimeslotIds.includes(av.timeslotId)
    );
    const existingLockedTimeslots = existingSessionAvailabilities
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

    if (sessionTimeslotIds.length > 0) {
      await db
        .delete(interviewerAvailability)
        .where(
          and(
            eq(interviewerAvailability.userId, user.id),
            inArray(interviewerAvailability.timeslotId, sessionTimeslotIds)
          )
        );
    }

    if (timeslotIds.length > 0) {
      await db.insert(interviewerAvailability).values(
        timeslotIds.map((timeslotId) => ({
          userId: user.id,
          timeslotId,
        }))
      );
    }

    revalidatePath(`/dashboard/${rid}/me/availability`);

    return { success: true };
  } catch (error) {
    console.error('Error submitting availability:', error);
    return { success: false, error: 'Failed to submit availability' };
  }
}
