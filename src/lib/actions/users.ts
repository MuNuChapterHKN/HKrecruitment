'use server';

import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function toggleIsFirstTimeCheckbox(
  userId: string,
  currentValue: boolean
) {
  await db
    .update(user)
    .set({ isFirstTime: !currentValue })
    .where(eq(user.id, userId));

  revalidatePath('/dashboard/users'); // Reload automatically the page

  return { success: true };
}
