import { inngest } from '@/inngest/client';
import { STAGE_CANCELLED_EVENT, STAGE_CHANGED_EVENT } from '@/inngest/events';
import {
  createInterviewCalendarEvent,
  createInterviewReportDocument,
  hasRealExternalId,
} from '@/lib/automation/interviewAssets';
import { notifyTelegram } from '@/lib/automation/notifications';
import {
  loadActiveStageContext,
  loadInterviewers,
  loadInterviewSlotForApplicant,
  markStageStatusProcessed,
  updateInterviewGeneratedData,
} from '@/lib/automation/stageData';

type StageEventData = {
  stageStatusId: string;
  scheduledAt: string;
};

export const stageDCreateInterviewAssets = inngest.createFunction(
  {
    id: 'stage-d-create-interview-assets',
    triggers: { event: STAGE_CHANGED_EVENT, if: "event.data.stage == 'd'" },
    cancelOn: [{ event: STAGE_CANCELLED_EVENT, match: 'data.stageStatusId' }],
  },
  async ({ event, step }) => {
    const data = event.data as StageEventData;
    const dryRun = process.env.AUTOMATION_DRY_RUN === '1';

    await step.sleepUntil(
      'wait-until-scheduled-time',
      new Date(data.scheduledAt)
    );

    const context = await step.run('load-and-validate-stage', async () => {
      return await loadActiveStageContext({
        stageStatusId: data.stageStatusId,
        expectedStage: 'd',
      });
    });

    if (!context) {
      return { skipped: true, reason: 'stage-status-no-longer-active' };
    }

    const interviewData = await step.run('load-interview-data', async () => {
      return await loadInterviewSlotForApplicant(context.applicant.id);
    });

    if (!interviewData) {
      throw new Error(
        `No interview data found for applicant ${context.applicant.id}`
      );
    }

    if (!interviewData.interview.confirmed) {
      throw new Error(
        `Interview ${interviewData.interview.id} is not confirmed yet`
      );
    }

    const interviewers = await step.run('load-interviewers', async () => {
      return await loadInterviewers(interviewData.interview.id);
    });

    const reportDocId = await step.run('ensure-report-document', async () => {
      const currentReportDocId = interviewData.interview.reportDocId;

      if (hasRealExternalId(currentReportDocId)) {
        return currentReportDocId;
      }

      const createdReportDocId = await createInterviewReportDocument({
        applicant: context.applicant,
        interview: interviewData.interview,
      });

      if (!dryRun) {
        await updateInterviewGeneratedData({
          interviewId: interviewData.interview.id,
          reportDocId: createdReportDocId,
        });
      } else {
        console.log(
          `[DRY RUN][stage-d] Would save reportDocId=${createdReportDocId} on interview ${interviewData.interview.id}`
        );
      }

      return createdReportDocId;
    });

    const meetingId = await step.run(
      'ensure-calendar-event-and-meet',
      async () => {
        const currentMeetingId = interviewData.interview.meetingId;

        if (hasRealExternalId(currentMeetingId)) {
          return currentMeetingId;
        }

        const calendarResult = await createInterviewCalendarEvent({
          applicant: context.applicant,
          interview: interviewData.interview,
          timeslot: interviewData.timeslot,
          interviewers,
        });

        if (!dryRun) {
          await updateInterviewGeneratedData({
            interviewId: interviewData.interview.id,
            meetingId: calendarResult.meetingId,
          });
        } else {
          console.log(
            `[DRY RUN][stage-d] Would save meetingId=${calendarResult.meetingId} on interview ${interviewData.interview.id}`
          );
        }

        return calendarResult.meetingId;
      }
    );

    await step.run('notify-hr', async () => {
      const candidate = `${context.applicant.name} ${context.applicant.surname}`;

      await notifyTelegram({
        channel: 'hr',
        text: `Interview assets created for ${candidate}: https://meet.google.com/${meetingId}`,
      });

      await notifyTelegram({
        channel: 'verbose',
        text: `[Stage D] Created assets for ${candidate}. meetingId=${meetingId}, reportDocId=${reportDocId}`,
      });
    });

    await step.run('mark-stage-status-processed', async () => {
      if (!dryRun) {
        await markStageStatusProcessed(context.stageStatus.id);
      } else {
        console.log(
          `[DRY RUN][stage-d] Would mark stage_status ${context.stageStatus.id} as processed`
        );
      }
    });

    return {
      success: true,
      meetingId,
      reportDocId,
      dryRun,
    };
  }
);
