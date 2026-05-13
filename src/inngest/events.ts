import type { ApplicationStage } from '@/db/types';

export const STAGE_CHANGED_EVENT = 'recruitment/stage.changed';
export const STAGE_CANCELLED_EVENT = 'recruitment/stage.cancelled';

export const AUTOMATED_STAGES = ['a', 'b', 'c', 'd'] as const;

export type AutomatedStage = (typeof AUTOMATED_STAGES)[number];

export type StageChangedEventData = {
  stageStatusId: string;
  applicantId: string;
  stage: ApplicationStage;
  scheduledAt: string;
  occurredAt: string;
  assignedById: string | null;
};

export type StageCancelledEventData = {
  stageStatusId: string;
  applicantId: string;
  reason: 'stage_changed' | 'moved_to_limbo' | 'manual_cancel';
};

export function isAutomatedStage(stage: ApplicationStage): boolean {
  return (AUTOMATED_STAGES as readonly ApplicationStage[]).includes(stage);
}
