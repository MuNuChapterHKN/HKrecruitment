import { google } from 'googleapis';
import { nanoid } from 'nanoid';
import { DateTime } from 'luxon';
import type { Applicant, Interview, Timeslot } from '@/db/types';
import { service } from '@/lib/google/service';
import { ROME_TIMEZONE } from './scheduling';

const PLACEHOLDER_VALUE = 'placeholder';

export function hasRealExternalId(
  value: string | null | undefined
): value is string {
  return Boolean(value && value.trim() !== '' && value !== PLACEHOLDER_VALUE);
}

function getCandidateFullName(applicant: Pick<Applicant, 'name' | 'surname'>) {
  return `${applicant.name} ${applicant.surname}`;
}

function getReportTitle(params: {
  applicant: Pick<Applicant, 'name' | 'surname'>;
  interview: Pick<Interview, 'id'>;
}) {
  return `${getCandidateFullName(params.applicant)} (${params.interview.id})`;
}

function toRomeDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  return DateTime.fromJSDate(date, { zone: 'utc' }).setZone(ROME_TIMEZONE);
}

export async function createInterviewReportDocument(params: {
  applicant: Pick<Applicant, 'name' | 'surname'>;
  interview: Pick<Interview, 'id'>;
}): Promise<string> {
  const title = getReportTitle(params);

  if (process.env.AUTOMATION_DRY_RUN === '1') {
    const dryRunId = `dry-run-report-doc-${params.interview.id}`;
    console.log(
      `[DRY RUN][stage-d] Would copy Google Doc template as "${title}" into INTERVIEW_REPORTS_FOLDER_ID -> ${dryRunId}`
    );
    return dryRunId;
  }

  const templateId = process.env.INTERVIEW_REPORT_TEMPLATE_ID;
  const folderId = process.env.INTERVIEW_REPORTS_FOLDER_ID;

  if (!templateId) {
    throw new Error('Missing INTERVIEW_REPORT_TEMPLATE_ID env variable');
  }

  if (!folderId) {
    throw new Error('Missing INTERVIEW_REPORTS_FOLDER_ID env variable');
  }

  const authResult = await service.getAuth();
  if (authResult.isErr()) {
    throw authResult.error;
  }

  const drive = google.drive({ version: 'v3', auth: authResult.value });

  const response = await drive.files.copy({
    fileId: templateId,
    requestBody: {
      name: title,
      parents: [folderId],
    },
    fields: 'id, name, mimeType',
  });

  if (!response.data.id) {
    throw new Error('Google Doc copy failed: missing copied document id');
  }

  return response.data.id;
}

export async function createInterviewCalendarEvent(params: {
  applicant: Pick<Applicant, 'name' | 'surname' | 'email'>;
  interview: Pick<Interview, 'id'>;
  timeslot: { startingFrom: Date | string };
  interviewers: Array<{
    name: string | null;
    email: string | null;
  }>;
}): Promise<{ meetingId: string; eventId: string | null }> {
  const candidate = getCandidateFullName(params.applicant);
  const start = toRomeDateTime(params.timeslot.startingFrom);
  const end = start.plus({ hours: 1 });

  const interviewerEmails = params.interviewers
    .map((interviewer) => interviewer.email)
    .filter((email): email is string => Boolean(email));

  const attendees = [params.applicant.email, ...interviewerEmails]
    .filter(Boolean)
    .map((email) => ({ email }));

  if (process.env.AUTOMATION_DRY_RUN === '1') {
    const dryRunMeetingId = `dry-run-meet-${params.interview.id}`;
    console.log(
      `[DRY RUN][stage-d] Would create Calendar event for ${candidate} at ${start.toISO()} with attendees: ${attendees
        .map((attendee) => attendee.email)
        .join(', ')} -> ${dryRunMeetingId}`
    );

    return {
      meetingId: dryRunMeetingId,
      eventId: `dry-run-calendar-event-${params.interview.id}`,
    };
  }

  const authResult = await service.getAuth();
  if (authResult.isErr()) {
    throw authResult.error;
  }

  const calendar = google.calendar({ version: 'v3', auth: authResult.value });
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'applyhkn@hknpolito.org';

  const response = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    sendUpdates: 'all',
    requestBody: {
      summary: `[IEEE-HKN] Application Interview - ${candidate}`,
      description: 'Prepare appropriately for the interview.',
      start: {
        dateTime: start.toISO({ suppressMilliseconds: true })!,
        timeZone: ROME_TIMEZONE,
      },
      end: {
        dateTime: end.toISO({ suppressMilliseconds: true })!,
        timeZone: ROME_TIMEZONE,
      },
      attendees,
      guestsCanInviteOthers: false,
      guestsCanModify: false,
      guestsCanSeeOtherGuests: true,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 },
          { method: 'popup', minutes: 60 },
        ],
      },
      conferenceData: {
        createRequest: {
          requestId: `hkn-${params.interview.id}-${nanoid()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    },
  });

  const conferenceId = response.data.conferenceData?.conferenceId;
  const hangoutLink = response.data.hangoutLink;
  const parsedMeetingId = hangoutLink ? hangoutLink.split('/').pop() : null;
  const meetingId = conferenceId || parsedMeetingId;

  if (!meetingId) {
    throw new Error(
      'Calendar event created but no Google Meet id was returned'
    );
  }

  return {
    meetingId,
    eventId: response.data.id ?? null,
  };
}
