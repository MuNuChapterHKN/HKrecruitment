'use server';

import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { INTERVIEW_BOOKING_STAGE } from '@/lib/stages';
import { switchStage } from '@/lib/services/stages';

export async function acceptApplication(applicantId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  const { user } = session;

  try {
    await switchStage(applicantId, INTERVIEW_BOOKING_STAGE, false, user.id);

    revalidatePath('/dashboard/[rid]/candidates');

    return { success: true };
  } catch (error) {
    console.error('Error accepting application:', error);
    return { success: false, error: 'Failed to accept application' };
  }
}
