import { inngest } from '@/inngest/client';
import { STAGE_CHANGED_EVENT } from '@/inngest/events';
import { notifyEmailFailure, sendLoggedEmail } from '@/lib/automation/email';
import { renderGoogleDocTemplate } from '@/lib/automation/emailTemplates';
import { notifyTelegram } from '@/lib/automation/notifications';
import {
  loadActiveStageContext,
  markStageStatusProcessed,
} from '@/lib/automation/stageData';

type StageEventData = {
  stageStatusId: string;
};

export const stageAApplicationReceipt = inngest.createFunction(
  {
    id: 'stage-a-application-receipt',
    triggers: { event: STAGE_CHANGED_EVENT, if: "event.data.stage == 'a'" },
    onFailure: async ({ event, error }) => {
      await notifyEmailFailure({
        type: 'application_receipt',
        stageStatusId: (event.data.event.data as StageEventData).stageStatusId,
        error,
      });
    },
  },
  async ({ event, step }) => {
    const data = event.data as StageEventData;

    const context = await step.run('load-and-validate-stage', async () => {
      return await loadActiveStageContext({
        stageStatusId: data.stageStatusId,
        expectedStage: 'a',
      });
    });

    if (!context) {
      return { skipped: true, reason: 'stage-status-no-longer-active' };
    }

    const html = await step.run('render-email-template', async () => {
      return await renderGoogleDocTemplate({
        templateId: process.env.STAGE_A_TEMPLATE_ID,
        values: context.applicant,
      });
    });

    await step.run('send-application-receipt-email', async () => {
      await sendLoggedEmail({
        type: 'application_receipt',
        to: context.applicant.email,
        applicantId: context.applicant.id,
        stageStatusId: context.stageStatus.id,
        subject:
          process.env.STAGE_A_EMAIL_SUBJECT ||
          'HKN Mu Nu Chapter - Application received',
        html,
      });
    });

    await step.run('notify-hr-and-log', async () => {
      const candidate = `${context.applicant.name} ${context.applicant.surname}`;

      await notifyTelegram({
        channel: 'hr',
        text: `New candidate application received: ${candidate} (${context.applicant.course}).`,
      });

      await notifyTelegram({
        channel: 'verbose',
        text: `[Stage A] Application receipt email sent to ${candidate}.`,
      });
    });

    await step.run('mark-stage-status-processed', async () => {
      await markStageStatusProcessed(context.stageStatus.id);
    });

    return { success: true };
  }
);
