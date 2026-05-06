'use server';

import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/server/auth';

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
