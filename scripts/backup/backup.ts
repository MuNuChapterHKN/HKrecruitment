import { spawn } from 'node:child_process';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import { service } from '../../src/lib/google/service';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function escapeDriveQuery(value: string): string {
  return value.replace(/'/g, "\\'");
}

async function runPgDump(params: {
  host: string;
  port: string;
  user: string;
  password: string;
  dbName: string;
  filePath: string;
}): Promise<void> {
  const { host, port, user, password, dbName, filePath } = params;

  await new Promise<void>((resolve, reject) => {
    const args = [
      '-Fc',
      '-h',
      host,
      '-p',
      port,
      '-U',
      user,
      '-d',
      dbName,
      '-f',
      filePath,
    ];
    const env = { ...process.env, PGPASSWORD: password };
    const pgDump = spawn('pg_dump', args, { env });

    let stderr = '';
    pgDump.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    pgDump.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`pg_dump failed with code ${code}: ${stderr.trim()}`));
    });

    pgDump.on('error', (error) => {
      reject(error);
    });
  });
}

async function uploadOrUpdateDriveFile(params: {
  filePath: string;
  fileName: string;
  parentId?: string;
}): Promise<void> {
  const authResult = await service.getAuth();
  if (authResult.isErr()) {
    throw authResult.error;
  }

  const drive = google.drive({ version: 'v3', auth: authResult.value });
  const { filePath, fileName, parentId } = params;

  const queryParts = [`name='${escapeDriveQuery(fileName)}'`, 'trashed=false'];

  if (parentId) {
    queryParts.push(`'${escapeDriveQuery(parentId)}' in parents`);
  }

  const listResponse = await drive.files.list({
    q: queryParts.join(' and '),
    fields: 'files(id, name, parents, mimeType)',
    pageSize: 1,
  });

  const existingFileId = listResponse.data.files?.[0]?.id;
  const media = {
    mimeType: 'application/octet-stream',
    body: createReadStream(filePath),
  };

  if (existingFileId) {
    await drive.files.update({
      fileId: existingFileId,
      media,
      requestBody: {
        name: fileName,
      },
      fields: 'id, name, parents, mimeType',
    });
    return;
  }

  const requestBody: {
    name: string;
    parents?: string[];
  } = {
    name: fileName,
  };

  if (parentId) {
    requestBody.parents = [parentId];
  }

  await drive.files.create({
    requestBody,
    media,
    fields: 'id, name, parents, mimeType',
  });
}

async function main(): Promise<void> {
  const host = process.env.POSTGRES_HOST ?? 'postgres';
  const port = process.env.POSTGRES_PORT ?? '5432';
  const user = requireEnv('POSTGRES_USER');
  const password = requireEnv('POSTGRES_PASSWORD');
  const dbName = requireEnv('POSTGRES_DB');

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const defaultFileName = `${dd}${mm}${yy}_pgdump`;
  const fileName = process.env.BACKUP_FILE_NAME ?? defaultFileName;
  const tmpDir = process.env.BACKUP_TMP_DIR ?? '/tmp';
  const filePath = path.join(tmpDir, fileName);
  const parentId =
    process.env.GOOGLE_DRIVE_FOLDER_ID ?? '19fmdHC2wyR4_QkxX5hHrmqlV0kP3UB7j';

  await fs.mkdir(tmpDir, { recursive: true });

  try {
    await runPgDump({ host, port, user, password, dbName, filePath });
    await uploadOrUpdateDriveFile({ filePath, fileName, parentId });
    console.log(`Backup uploaded to Google Drive as ${fileName}.`);
  } finally {
    await fs.rm(filePath, { force: true });
  }
}

main().catch((error) => {
  console.error('Backup failed:', error);
  process.exit(1);
});
