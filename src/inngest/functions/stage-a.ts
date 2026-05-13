import { inngest } from '@/inngest/client';
import { STAGE_CANCELLED_EVENT, STAGE_CHANGED_EVENT } from '@/inngest/events';
import { sendTemplatedEmail } from '@/lib/automation/email';
import { renderGoogleDocTemplate } from '@/lib/automation/emailTemplates';
import { notifyTelegram } from '@/lib/automation/notifications';
import {
  loadActiveStageContext,
  markStageStatusProcessed,
} from '@/lib/automation/stageData';

type StageEventData = {
  stageStatusId: string;
  scheduledAt: string;
};

export const stageAApplicationReceipt = inngest.createFunction(
  {
    id: 'stage-a-application-receipt',
    triggers: { event: STAGE_CHANGED_EVENT, if: "event.data.stage == 'a'" },
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
        expectedStage: 'a',
      });
    });

    if (!context) {
      return { skipped: true, reason: 'stage-status-no-longer-active' };
    }

    const html = await step.run('render-email-template', async () => {
      return await renderGoogleDocTemplate({
        templateId: process.env.STAGE_A_TEMPLATE_ID,
        values: {
          ...context.applicant,
          name: context.applicant.name,
          surname: context.applicant.surname,
          email: context.applicant.email,
        },
      });
    });

    await step.run('send-application-receipt-email', async () => {
      await sendTemplatedEmail({
        to: context.applicant.email,
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
