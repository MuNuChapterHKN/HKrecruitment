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

function buildBookingUrl(applicantId: string, token: string | null): string {
  const baseUrl = process.env.HKRECRUITMENT_URL || 'http://localhost:3000';
  const url = new URL(`/interview/book/${applicantId}`, baseUrl);

  if (token) {
    url.searchParams.set('token', token);
  }

  return url.toString();
}

export const stageBInterviewBookingEmail = inngest.createFunction(
  {
    id: 'stage-b-interview-booking-email',
    triggers: { event: STAGE_CHANGED_EVENT, if: "event.data.stage == 'b'" },
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
        expectedStage: 'b',
      });
    });

    if (!context) {
      return { skipped: true, reason: 'stage-status-no-longer-active' };
    }

    const interviewBookingUrl = buildBookingUrl(
      context.applicant.id,
      context.applicant.token
    );

    const html = await step.run('render-email-template', async () => {
      return await renderGoogleDocTemplate({
        templateId: process.env.STAGE_B_TEMPLATE_ID,
        values: {
          ...context.applicant,
          name: context.applicant.name,
          surname: context.applicant.surname,
          email: context.applicant.email,
          interviewBookingUrl,
        },
      });
    });

    await step.run('send-interview-booking-email', async () => {
      await sendTemplatedEmail({
        to: context.applicant.email,
        subject:
          process.env.STAGE_B_EMAIL_SUBJECT ||
          'HKN Mu Nu Chapter - Book your interview',
        html,
      });
    });

    await step.run('notify-hr-and-log', async () => {
      const candidate = `${context.applicant.name} ${context.applicant.surname}`;

      await notifyTelegram({
        channel: 'hr',
        text: `Interview booking email sent to ${candidate}.`,
      });

      await notifyTelegram({
        channel: 'verbose',
        text: `[Stage B] Interview booking URL generated for ${candidate}: ${interviewBookingUrl}`,
      });
    });

    await step.run('mark-stage-status-processed', async () => {
      await markStageStatusProcessed(context.stageStatus.id);
    });

    return { success: true };
  }
);
