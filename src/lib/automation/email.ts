import { google } from 'googleapis';
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

export async function sendTemplatedEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (process.env.AUTOMATION_DRY_RUN === '1') {
    console.log(`[DRY RUN][email] to=${params.to} subject=${params.subject}`);
    return;
  }

  const authResult = await service.getAuth();
  if (authResult.isErr()) {
    throw authResult.error;
  }

  const gmail = google.gmail({ version: 'v1', auth: authResult.value });

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: buildRawMessage(params),
    },
  });
}
