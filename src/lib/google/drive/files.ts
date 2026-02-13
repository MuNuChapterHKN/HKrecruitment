import { google } from 'googleapis';
import { Result, ok, err, fromPromise } from 'neverthrow';
import { service } from '../service';
import { DriveFile } from './types';
import stream from 'stream';

export async function uploadFile(params: {
  file: {
    name: string;
    data: ArrayBuffer;
    type: string;
  };
  parentId?: string;
}): Promise<Result<DriveFile, Error>> {
  const authResult = await service.getAuth();
  if (authResult.isErr()) {
    return err(authResult.error);
  }

  const drive = google.drive({ version: 'v3', auth: authResult.value });
  const { file } = params;

  const fileMetadata: {
    name: string;
    parents?: string[];
  } = {
    name: file.name,
  };

  if (params.parentId) fileMetadata.parents = [params.parentId];

  const buffer = Buffer.from(file.data);
  const passThrough = new stream.PassThrough();
  passThrough.end(buffer);

  return fromPromise(
    drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: file.type,
        body: passThrough,
      },
      fields: 'id, name, parents, mimeType',
    }),
    (error) =>
      error instanceof Error ? error : new Error('Unknown error occurred')
  ).andThen((response) => {
    if (!response.data.id) {
      return err(new Error('Failed to upload file: No ID returned'));
    }

    return ok({
      id: response.data.id,
      name: response.data.name || params.file.name,
      parents: response.data.parents || undefined,
      mimeType: response.data.mimeType || params.file.type,
    });
  });
}

export async function shareFileWithDomain(
  fileId: string,
  domain: string
): Promise<Result<void, Error>> {
  const authResult = await service.getAuth();
  if (authResult.isErr()) {
    return err(authResult.error);
  }

  const drive = google.drive({ version: 'v3', auth: authResult.value });

  return fromPromise(
    drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'domain',
        domain,
      },
    }),
    (error) =>
      error instanceof Error ? error : new Error('Unknown error occurred')
  ).andThen(() => ok(undefined));
}

export async function getFileMetadata(
  fileId: string
): Promise<Result<DriveFile, Error>> {
  const authResult = await service.getAuth();
  if (authResult.isErr()) {
    return err(authResult.error);
  }

  const drive = google.drive({ version: 'v3', auth: authResult.value });

  return fromPromise(
    drive.files.get({
      fileId,
      fields: 'id, name, parents, mimeType',
    }),
    (error) =>
      error instanceof Error ? error : new Error('Unknown error occurred')
  ).andThen((response) => {
    if (!response.data.id) {
      return err(new Error('Failed to get file metadata: No ID returned'));
    }

    return ok({
      id: response.data.id,
      name: response.data.name || '',
      parents: response.data.parents || undefined,
      mimeType: response.data.mimeType || '',
    });
  });
}

export function getFileViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}
