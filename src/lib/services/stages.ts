import { ApplicationStage } from '@/db/types';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const switchStage = async (
  aid: string,
  stage: ApplicationStage,
  processed: boolean = false,
  userId: string | null = null
) => {
  await db.transaction(async (tx) => {
    await tx
      .update(schema.applicant)
      .set({
        stage,
      })
      .where(eq(schema.applicant.id, aid));

    await tx.insert(schema.stageStatus).values({
      id: nanoid(),
      applicantId: aid,
      assignedById: userId,
      stage,
      processed,
    });
  });
};
