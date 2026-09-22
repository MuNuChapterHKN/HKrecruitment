import { google } from 'googleapis';
import { and, eq, ne, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db, schema } from '@/db';
import type { EmailLog, EmailType } from '@/db/types';
import { notifyTelegram } from '@/lib/automation/notifications';
import { service } from '@/lib/google/service';

function encodeSubject(subject: string): string {
  return `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
}

function buildRawMessage(params: {
  to: string;
  subject: string;
  html: string;
}): string {
  const message = [
    `To: ${params.to}`,
    `Subject: ${encodeSubject(params.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    params.html,
  ].join('\r\n');

  return Buffer.from(message, 'utf8').toString('base64url');
}

const DRY_RUN_MESSAGE_ID = 'dry-run';

async function deliverEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<string | null> {
  const to = process.env.EMAIL_REDIRECT_TO || params.to;

  if (process.env.AUTOMATION_DRY_RUN === '1') {
    console.log(`[DRY RUN][email] to=${to} subject=${params.subject}`);
    return DRY_RUN_MESSAGE_ID;
  }

  const authResult = await service.getAuth();
  if (authResult.isErr()) {
    throw authResult.error;
  }

  const gmail = google.gmail({ version: 'v1', auth: authResult.value });

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: buildRawMessage({ ...params, to }),
    },
  });

  return response.data.id ?? null;
}

async function findOrCreateEmailLog(params: {
  type: EmailType;
  to: string;
  subject: string;
  html: string;
  applicantId?: string;
  stageStatusId?: string;
}): Promise<EmailLog> {
  const inserted = await db
    .insert(schema.emailLog)
    .values({
      id: nanoid(),
      type: params.type,
      recipient: params.to,
      subject: params.subject,
      html: params.html,
      applicantId: params.applicantId,
      stageStatusId: params.stageStatusId,
    })
    .onConflictDoUpdate({
      target: [schema.emailLog.stageStatusId, schema.emailLog.type],
      set: {
        recipient: params.to,
        subject: params.subject,
        html: params.html,
      },
      setWhere: ne(schema.emailLog.status, 'sent'),
    })
    .returning();

  if (inserted[0]) {
    return inserted[0];
  }

  const existing = await db
    .select()
    .from(schema.emailLog)
    .where(
      and(
        eq(schema.emailLog.stageStatusId, params.stageStatusId!),
        eq(schema.emailLog.type, params.type)
      )
    )
    .limit(1);

  return existing[0];
}

async function deliverEmailLog(entry: EmailLog): Promise<EmailLog> {
  if (entry.status === 'sent') {
    return entry;
  }

  try {
    const messageId = await deliverEmail({
      to: entry.recipient,
      subject: entry.subject,
      html: entry.html,
    });

    const updated = await db
      .update(schema.emailLog)
      .set({
        status: 'sent',
        attempts: sql`${schema.emailLog.attempts} + 1`,
        lastError: null,
        providerMessageId: messageId,
        sentAt: new Date(),
      })
      .where(eq(schema.emailLog.id, entry.id))
      .returning();

    return updated[0];
  } catch (error) {
    await db
      .update(schema.emailLog)
      .set({
        status: 'failed',
        attempts: sql`${schema.emailLog.attempts} + 1`,
        lastError: error instanceof Error ? error.message : String(error),
      })
      .where(eq(schema.emailLog.id, entry.id));

    throw error;
  }
}

export async function notifyEmailFailure(params: {
  type: EmailType;
  stageStatusId: string;
  error: Error;
}): Promise<void> {
  const rows = await db
    .select({ recipient: schema.applicant.email })
    .from(schema.stageStatus)
    .innerJoin(
      schema.applicant,
      eq(schema.stageStatus.applicantId, schema.applicant.id)
    )
    .where(eq(schema.stageStatus.id, params.stageStatusId))
    .limit(1);

  const recipient = rows[0]?.recipient ?? 'unknown';

  await notifyTelegram({
    channel: 'it',
    text: `[Email failed] type=${params.type} to=${recipient} stageStatusId=${params.stageStatusId}\nerror: ${params.error.message}`,
  });
}

export async function recordEmailDispatchFailure(params: {
  type: EmailType;
  to: string;
  subject: string;
  applicantId: string;
  stageStatusId: string;
  error: unknown;
}): Promise<void> {
  const error =
    params.error instanceof Error
      ? params.error
      : new Error(String(params.error));

  await db
    .insert(schema.emailLog)
    .values({
      id: nanoid(),
      type: params.type,
      recipient: params.to,
      subject: params.subject,
      html: '',
      status: 'failed',
      lastError: `Dispatch failed: ${error.message}`,
      applicantId: params.applicantId,
      stageStatusId: params.stageStatusId,
    })
    .onConflictDoNothing();

  await notifyEmailFailure({
    type: params.type,
    stageStatusId: params.stageStatusId,
    error,
  });
}

export async function sendLoggedEmail(params: {
  type: EmailType;
  to: string;
  subject: string;
  html: string;
  applicantId?: string;
  stageStatusId?: string;
}): Promise<EmailLog> {
  const entry = await findOrCreateEmailLog(params);
  return await deliverEmailLog(entry);
}
