import { inngest } from '@/inngest/client';
import { STAGE_CANCELLED_EVENT, STAGE_CHANGED_EVENT } from '@/inngest/events';
import { notifyTelegram } from '@/lib/automation/notifications';
import {
  loadActiveStageContext,
  loadInterviewSlotForApplicant,
  markStageStatusProcessed,
} from '@/lib/automation/stageData';

type StageEventData = {
  stageStatusId: string;
  scheduledAt: string;
};

export const stageCSlotSelectedNotification = inngest.createFunction(
  {
    id: 'stage-c-slot-selected-notification',
    triggers: { event: STAGE_CHANGED_EVENT, if: "event.data.stage == 'c'" },
    cancelOn: [{ event: STAGE_CANCELLED_EVENT, match: 'data.stageStatusId' }],
  },
  async ({ event, step }) => {
    const data = event.data as StageEventData;

    await step.sleepUntil(
      'wait-until-scheduled-time',
      new Date(data.scheduledAt)
    );

    const context = await step.run('load-and-validate-stage', async () => {
      return await loadActiveStageContext({
        stageStatusId: data.stageStatusId,
        expectedStage: 'c',
      });
    });

    if (!context) {
      return { skipped: true, reason: 'stage-status-no-longer-active' };
    }

    const interviewData = await step.run('load-interview-slot', async () => {
      return await loadInterviewSlotForApplicant(context.applicant.id);
    });

    if (!interviewData) {
      throw new Error(
        `No interview data found for applicant ${context.applicant.id}`
      );
    }

    await step.run('notify-hr', async () => {
      const candidate = `${context.applicant.name} ${context.applicant.surname}`;

      await notifyTelegram({
        channel: 'hr',
        text: `${candidate} selected an interview slot: ${interviewData.timeslot.startingFrom}.`,
      });

      await notifyTelegram({
        channel: 'verbose',
        text: `[Stage C] Slot selected by ${candidate}.`,
      });
    });

    await step.run('mark-stage-status-processed', async () => {
      await markStageStatusProcessed(context.stageStatus.id);
    });

    return { success: true };
  }
);
