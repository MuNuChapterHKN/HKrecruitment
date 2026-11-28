import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmailLog } from '@/db/types';
import type { ActiveStageContext } from '@/lib/automation/stageData';

type StepMock = {
  sleepUntil: (id: string, time: Date) => Promise<void>;
  run: <T>(id: string, fn: () => Promise<T> | T) => Promise<T>;
};

type CapturedHandler = (ctx: {
  event: { data: { stageStatusId: string; scheduledAt: string } };
  step: StepMock;
}) => Promise<unknown>;

const captured = vi.hoisted(() => ({
  handler: null as CapturedHandler | null,
}));

vi.mock('@/inngest/client', () => ({
  inngest: {
    createFunction: vi.fn((config: unknown, handler: CapturedHandler) => {
      captured.handler = handler;
      return { config, handler };
    }),
  },
}));

vi.mock('@/lib/automation/email', () => ({
  notifyEmailFailure: vi.fn(),
  sendLoggedEmail: vi.fn(),
}));

vi.mock('@/lib/automation/emailTemplates', () => ({
  renderGoogleDocTemplate: vi.fn(),
}));

vi.mock('@/lib/automation/notifications', () => ({
  notifyTelegram: vi.fn(),
}));

vi.mock('@/lib/automation/stageData', () => ({
  loadActiveStageContext: vi.fn(),
  markStageStatusProcessed: vi.fn(),
}));

import { sendLoggedEmail } from '@/lib/automation/email';
import { renderGoogleDocTemplate } from '@/lib/automation/emailTemplates';
import { notifyTelegram } from '@/lib/automation/notifications';
import {
  loadActiveStageContext,
  markStageStatusProcessed,
} from '@/lib/automation/stageData';
import { isStageBEmailEnabled, stageBInterviewBookingEmail } from './stage-b';

describe('isStageBEmailEnabled', () => {
  const originalEnv = process.env.STAGE_B_EMAIL_ENABLED;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.STAGE_B_EMAIL_ENABLED;
    } else {
      process.env.STAGE_B_EMAIL_ENABLED = originalEnv;
    }
  });

  it('returns false by default when STAGE_B_EMAIL_ENABLED is unset', () => {
    delete process.env.STAGE_B_EMAIL_ENABLED;
    expect(isStageBEmailEnabled()).toBe(false);
  });

  it.each(['0', 'false', 'FALSE', '', '   ', 'off', 'no', '2'])(
    'returns false when set to %j',
    (value) => {
      process.env.STAGE_B_EMAIL_ENABLED = value;
      expect(isStageBEmailEnabled()).toBe(false);
    }
  );

  it.each(['1', 'true', 'TRUE', 'True', ' 1 ', ' true '])(
    'returns true when set to %j',
    (value) => {
      process.env.STAGE_B_EMAIL_ENABLED = value;
      expect(isStageBEmailEnabled()).toBe(true);
    }
  );
});

describe('stageBInterviewBookingEmail', () => {
  const originalEnv = { ...process.env };

  const mockContext: ActiveStageContext = {
    applicant: {
      id: 'dev-app-b',
      recruitingSessionId: 'session-1',
      name: 'Mario',
      surname: 'Rossi',
      email: 'mario.rossi@studenti.polito.it',
      gpa: '28.5',
      degreeLevel: 'msc',
      course: 'Computer Engineering',
      courseArea: 'ICT',
      italianLevel: 'native',
      stage: 'b',
      cvFileId: 'cv-id',
      spFileId: 'sp-id',
      interviewId: null,
      token: 'booking-token',
      chosenArea: null,
      accepted: null,
      archived: false,
      createdAt: new Date('2026-11-01T10:00:00.000Z'),
      updatedAt: new Date('2026-11-01T10:00:00.000Z'),
    },
    stageStatus: {
      id: 'stage-status-b-1',
      applicantId: 'dev-app-b',
      assignedById: 'admin-1',
      stage: 'b',
      processed: false,
      deletedAt: null,
      notes: null,
      createdAt: new Date('2026-11-01T10:00:00.000Z'),
      updatedAt: new Date('2026-11-01T10:00:00.000Z'),
    },
  };

  const mockEmailLog: EmailLog = {
    id: 'email-log-1',
    type: 'interview_booking',
    recipient: mockContext.applicant.email,
    subject: 'HKN Mu Nu Chapter - Book your interview',
    html: '<p>Book here</p>',
    status: 'sent',
    attempts: 1,
    lastError: null,
    providerMessageId: 'dry-run',
    applicantId: mockContext.applicant.id,
    stageStatusId: mockContext.stageStatus.id,
    sentAt: new Date('2026-11-01T10:05:00.000Z'),
    createdAt: new Date('2026-11-01T10:05:00.000Z'),
    updatedAt: new Date('2026-11-01T10:05:00.000Z'),
  };

  const makeStep = (): StepMock => ({
    sleepUntil: vi.fn(async () => undefined),
    run: vi.fn(async (_id, fn) => await fn()),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.HKRECRUITMENT_URL = 'http://localhost:3000/recruitment';
    delete process.env.STAGE_B_EMAIL_SUBJECT;
    delete process.env.STAGE_B_EMAIL_ENABLED;

    vi.mocked(loadActiveStageContext).mockResolvedValue(mockContext);
    vi.mocked(renderGoogleDocTemplate).mockResolvedValue('<p>Book here</p>');
    vi.mocked(sendLoggedEmail).mockResolvedValue(mockEmailLog);
    vi.mocked(notifyTelegram).mockResolvedValue(undefined);
    vi.mocked(markStageStatusProcessed).mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('registers the Inngest function handler', () => {
    expect(stageBInterviewBookingEmail).toBeDefined();
    expect(captured.handler).toBeTypeOf('function');
  });

  it('does not send the email and notifies HR with the booking link when disabled', async () => {
    process.env.STAGE_B_EMAIL_ENABLED = '0';

    const result = await captured.handler!({
      event: {
        data: {
          stageStatusId: mockContext.stageStatus.id,
          scheduledAt: '2026-11-01T10:05:00.000Z',
        },
      },
      step: makeStep(),
    });

    const expectedUrl =
      'http://localhost:3000/recruitment/interview/book/dev-app-b?token=booking-token';

    expect(sendLoggedEmail).not.toHaveBeenCalled();
    expect(notifyTelegram).toHaveBeenCalledWith({
      channel: 'hr',
      text: `Interview booking email NOT sent (disabled) for Mario Rossi: ${expectedUrl}`,
    });
    expect(notifyTelegram).toHaveBeenCalledWith({
      channel: 'verbose',
      text: `[Stage B] Interview booking URL generated for Mario Rossi: ${expectedUrl}`,
    });
    expect(markStageStatusProcessed).toHaveBeenCalledWith('stage-status-b-1');
    expect(result).toEqual({ success: true, emailSent: false });
  });

  it('sends the logged email and notifies HR when enabled', async () => {
    process.env.STAGE_B_EMAIL_ENABLED = '1';

    const result = await captured.handler!({
      event: {
        data: {
          stageStatusId: mockContext.stageStatus.id,
          scheduledAt: '2026-11-01T10:05:00.000Z',
        },
      },
      step: makeStep(),
    });

    const expectedUrl =
      'http://localhost:3000/recruitment/interview/book/dev-app-b?token=booking-token';

    expect(sendLoggedEmail).toHaveBeenCalledWith({
      type: 'interview_booking',
      to: 'mario.rossi@studenti.polito.it',
      applicantId: 'dev-app-b',
      stageStatusId: 'stage-status-b-1',
      subject: 'HKN Mu Nu Chapter - Book your interview',
      html: '<p>Book here</p>',
    });
    expect(notifyTelegram).toHaveBeenCalledWith({
      channel: 'hr',
      text: 'Interview booking email sent to Mario Rossi.',
    });
    expect(notifyTelegram).toHaveBeenCalledWith({
      channel: 'verbose',
      text: `[Stage B] Interview booking URL generated for Mario Rossi: ${expectedUrl}`,
    });
    expect(markStageStatusProcessed).toHaveBeenCalledWith('stage-status-b-1');
    expect(result).toEqual({ success: true, emailSent: true });
  });

  it('relies on the memoized step return value across Inngest replays', async () => {
    process.env.STAGE_B_EMAIL_ENABLED = '0';

    const step: StepMock = {
      sleepUntil: vi.fn(async () => undefined),
      run: vi.fn(async (id, fn) => {
        if (id === 'send-interview-booking-email') {
          return true as Awaited<ReturnType<typeof fn>>;
        }
        return await fn();
      }),
    };

    await captured.handler!({
      event: {
        data: {
          stageStatusId: mockContext.stageStatus.id,
          scheduledAt: '2026-11-01T10:05:00.000Z',
        },
      },
      step,
    });

    expect(sendLoggedEmail).not.toHaveBeenCalled();
    expect(notifyTelegram).toHaveBeenCalledWith({
      channel: 'hr',
      text: 'Interview booking email sent to Mario Rossi.',
    });
  });
});
