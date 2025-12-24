'use server';

import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { INTERVIEW_BOOKING_STAGE, INTERVIEW_DONE_STAGE } from '@/lib/stages';
import { switchStage, switchToLimbo } from '@/lib/services/stages';
import type { ApplicationStage } from '@/db/types';

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

export async function submitInterviewReport(applicantId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  const { user } = session;

  try {
    await switchStage(applicantId, INTERVIEW_DONE_STAGE, false, user.id);

    revalidatePath('/dashboard/[rid]/candidates');

    return { success: true };
  } catch (error) {
    console.error('Error submitting interview report:', error);
    return { success: false, error: 'Failed to submit interview report' };
  }
}

export async function moveToLimbo(applicantId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  const { user } = session;

  try {
    await switchToLimbo(applicantId, user.id);

    revalidatePath('/dashboard/[rid]/candidates');

    return { success: true };
  } catch (error) {
    console.error('Error moving to limbo:', error);
    return { success: false, error: 'Failed to move to limbo' };
  }
}

export async function removeFromLimbo(
  applicantId: string,
  targetStage: string,
  notes: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  const { user } = session;

  try {
    await switchStage(
      applicantId,
      targetStage.toLowerCase() as ApplicationStage,
      false,
      user.id,
      notes
    );

    revalidatePath('/dashboard/[rid]/candidates');

    return { success: true };
  } catch (error) {
    console.error('Error removing from limbo:', error);
    return { success: false, error: 'Failed to remove from limbo' };
  }
}
