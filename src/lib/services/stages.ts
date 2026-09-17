import { ApplicationStage } from '@/db/types';
import { db, schema } from '@/db';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import {
  emitStageCancelledEventsForStageStatuses,
  emitStageChangedEventForStageStatus,
} from '@/lib/automation/stageEvents';

export const switchStage = async (
  aid: string,
  stage: ApplicationStage,
  processed: boolean = false,
  userId: string | null = null,
  notes: string | null = null
) => {
  const now = new Date();

  const result = await db.transaction(async (tx) => {
    const oldPendingStatuses = await tx
      .select()
      .from(schema.stageStatus)
      .where(
        and(
          eq(schema.stageStatus.applicantId, aid),
          eq(schema.stageStatus.processed, false),
          isNull(schema.stageStatus.deletedAt)
        )
      );

    if (oldPendingStatuses.length > 0) {
      await tx
        .update(schema.stageStatus)
        .set({ deletedAt: now })
        .where(
          and(
            eq(schema.stageStatus.applicantId, aid),
            eq(schema.stageStatus.processed, false),
            isNull(schema.stageStatus.deletedAt)
          )
        );
    }

    await tx
      .update(schema.applicant)
      .set({ stage })
      .where(eq(schema.applicant.id, aid));

    const insertedStatuses = await tx
      .insert(schema.stageStatus)
      .values({
        id: nanoid(),
        applicantId: aid,
        assignedById: userId,
        stage,
        processed,
        notes,
      })
      .returning();

    return {
      oldPendingStatuses,
      newStageStatus: insertedStatuses[0],
    };
  });

  await emitStageCancelledEventsForStageStatuses(result.oldPendingStatuses);
  await emitStageChangedEventForStageStatus(result.newStageStatus);

  return result.newStageStatus;
};

export const switchToLimbo = async (
  aid: string,
  userId: string | null = null
) => {
  const LIMBO_STAGE = 'z' as ApplicationStage;
  await switchStage(aid, LIMBO_STAGE, true, userId);
};

export const getStageHistory = async (applicantId: string) => {
  const history = await db
    .select({
      id: schema.stageStatus.id,
      stage: schema.stageStatus.stage,
      processed: schema.stageStatus.processed,
      createdAt: schema.stageStatus.createdAt,
      deletedAt: schema.stageStatus.deletedAt,
      notes: schema.stageStatus.notes,
      assignedBy: {
        id: schema.user.id,
        name: schema.user.name,
        image: schema.user.image,
      },
    })
    .from(schema.stageStatus)
    .leftJoin(schema.user, eq(schema.stageStatus.assignedById, schema.user.id))
    .where(eq(schema.stageStatus.applicantId, applicantId))
    .orderBy(desc(schema.stageStatus.createdAt));

  return history;
};
