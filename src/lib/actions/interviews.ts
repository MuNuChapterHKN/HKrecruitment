'use server';

import { db, schema } from '@/db';
import { auth } from '@/lib/server/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { INTERVIEW_AWAITING_INTERVIEW } from '@/lib/stages';
import { switchStage } from '@/lib/services/stages';

export type ApproveInterviewState = {
  message: string;
  success?: boolean;
};

export async function approveInterview(
  prevState: ApproveInterviewState,
  formData: FormData
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { message: 'Unauthorized', success: false };
  }
  const { user } = session;

  const applicantId = formData.get('applicantId') as string;
  const interviewId = formData.get('interviewId') as string;
  const interviewerIds = formData.getAll('interviewerIds') as string[];

  if (!applicantId || !interviewId) {
    return { message: 'Invalid applicant or interview data', success: false };
  }

  if (interviewerIds.length === 0) {
    return {
      message: 'At least one interviewer is required',
      success: false,
    };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(schema.interview)
        .set({
          confirmed: true,
        })
        .where(eq(schema.interview.id, interviewId));

      await tx.insert(schema.usersToInterviews).values(
        interviewerIds.map((userId) => ({
          userId,
          interviewId,
        }))
      );
    });

    await switchStage(applicantId, INTERVIEW_AWAITING_INTERVIEW, true, user.id);

    revalidatePath('/dashboard/[rid]/candidates');

    return { message: 'Interview approved successfully', success: true };
  } catch (error) {
    console.error('Error approving interview:', error);
    return { message: 'Failed to approve interview', success: false };
  }
}
