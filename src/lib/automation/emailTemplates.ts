import { google } from 'googleapis';
import * as nunjucks from 'nunjucks';
import { service } from '@/lib/google/service';

nunjucks.configure({ autoescape: false });

function defaultHtml(values: Record<string, unknown>): string {
  return `
    <p>Hello ${values.name ?? ''} ${values.surname ?? ''},</p>
    <p>this is an automated update about your HKN recruitment application.</p>
  `;
}

export async function renderGoogleDocTemplate(params: {
  templateId?: string;
  values: Record<string, unknown>;
}): Promise<string> {
  if (process.env.AUTOMATION_DRY_RUN === '1') {
    return defaultHtml(params.values);
  }

  if (!params.templateId) {
    return defaultHtml(params.values);
  }

  const authResult = await service.getAuth();
  if (authResult.isErr()) {
    throw authResult.error;
  }

  const drive = google.drive({ version: 'v3', auth: authResult.value });
  const response = await drive.files.export(
    {
      fileId: params.templateId,
      mimeType: 'text/html',
    },
    { responseType: 'arraybuffer' }
  );

  const templateHtml =
    typeof response.data === 'string'
      ? response.data
      : Buffer.from(response.data as unknown as ArrayBuffer).toString('utf8');

  return nunjucks.renderString(templateHtml, params.values);
}
