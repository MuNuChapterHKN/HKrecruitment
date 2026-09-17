import type { StageStatus } from '@/db/types';
import { inngest } from '@/inngest/client';
import {
  isAutomatedStage,
  STAGE_CANCELLED_EVENT,
  STAGE_CHANGED_EVENT,
} from '@/inngest/events';
import { computeStageExecutionTime } from './scheduling';

export async function emitStageChangedEventForStageStatus(
  status: StageStatus
): Promise<void> {
  if (status.processed || status.deletedAt || !isAutomatedStage(status.stage)) {
    return;
  }

  const occurredAt = status.createdAt ?? new Date();
  const scheduledAt = computeStageExecutionTime(occurredAt);

  await inngest.send({
    name: STAGE_CHANGED_EVENT,
    data: {
      stageStatusId: status.id,
      applicantId: status.applicantId,
      stage: status.stage,
      scheduledAt: scheduledAt.toISOString(),
      occurredAt: occurredAt.toISOString(),
      assignedById: status.assignedById,
    },
  });
}

export async function emitStageCancelledEventsForStageStatuses(
  statuses: StageStatus[],
  reason: 'stage_changed' | 'moved_to_limbo' | 'manual_cancel' = 'stage_changed'
): Promise<void> {
  for (const status of statuses) {
    if (status.processed || !isAutomatedStage(status.stage)) {
      continue;
    }

    await inngest.send({
      name: STAGE_CANCELLED_EVENT,
      data: {
        stageStatusId: status.id,
        applicantId: status.applicantId,
        reason,
      },
    });
  }
}
