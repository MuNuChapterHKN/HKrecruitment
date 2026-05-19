'use server';

import { db } from '@/db';
import { user, usersToRecruitingSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/server/auth';
import { AuthUserRole } from '@/lib/server/authTypes';
import { abilityForUserInSession } from '@/lib/abilities/server';

export async function toggleIsFirstTimeCheckbox(
  userId: string,
  currentValue: boolean,
  rid: string
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: 'Unauthorized' };

  const { abilityForUserInSession } = await import('@/lib/abilities/server');
  const ability = await abilityForUserInSession(session.user.id, rid);
  if (!ability.can('manage', 'MembersActions')) {
    return { success: false, error: 'Forbidden' };
  }

  await db
    .update(user)
    .set({ isFirstTime: !currentValue })
    .where(eq(user.id, userId));

  revalidatePath('/dashboard/[rid]/members'); // Reload automatically the page

  return { success: true };
}

export async function updateSessionMemberRole(
  userId: string,
  role: AuthUserRole,
  rid: string
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const ability = await abilityForUserInSession(session.user.id, rid);
  if (!ability.can('manage', 'MembersActions')) {
    return { success: false, error: 'Forbidden' };
  }

  await db
    .insert(usersToRecruitingSessions)
    .values({
      userId,
      recruitingSessionId: rid,
      role,
    })
    .onConflictDoUpdate({
      target: [
        usersToRecruitingSessions.recruitingSessionId,
        usersToRecruitingSessions.userId,
      ],
      set: {
        role,
      },
    });

  revalidatePath('/dashboard/[rid]/members');

  return { success: true };
}
