'use server';

import { db, schema } from '@/db';
import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { INTERVIEW_BOOKING_STAGE } from '@/lib/stages';

export async function acceptApplication(applicantId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  const { user } = session;

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(schema.applicant)
        .set({
          stage: INTERVIEW_BOOKING_STAGE,
        })
        .where(eq(schema.applicant.id, applicantId));

      await tx.insert(schema.stageStatus).values({
        id: nanoid(),
        applicantId,
        assignedById: user.id,
        stage: INTERVIEW_BOOKING_STAGE,
        processed: false,
      });
    });

    revalidatePath('/dashboard/[rid]/candidates');

    return { success: true };
  } catch (error) {
    console.error('Error accepting application:', error);
    return { success: false, error: 'Failed to accept application' };
  }
}
