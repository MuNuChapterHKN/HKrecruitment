import { google } from 'googleapis';
import { Result, ok, err, fromPromise } from 'neverthrow';
import { service } from './service';
import stream from 'stream';

interface DriveFolder {
  id: string;
  name: string;
  parents?: string[];
}

export interface DriveFile {
  id: string;
  name: string;
  parents?: string[];
  mimeType: string;
}

export async function createFolder(
  params: {
    name: string;
    parentId?: string;
  }
): Promise<Result<DriveFolder, Error>> {
  const drive = google.drive({ version: 'v3', auth: service.auth });

  const fileMetadata: any = {
    name: params.name,
    mimeType: 'application/vnd.google-apps.folder'
  };

  if (params.parentId) {
    fileMetadata.parents = [params.parentId];
  }

  return fromPromise(
    drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, parents'
    }),
    (error) => error instanceof Error ? error : new Error('Unknown error occurred')
  ).andThen((response) => {
    if (!response.data.id) {
      return err(new Error('Failed to create folder: No ID returned'));
    }

    return ok({
      id: response.data.id,
      name: response.data.name || params.name,
      parents: response.data.parents || undefined
    });
  });
}

export async function uploadFile(
  params: {
    file: {
      name: string;
      data: ArrayBuffer;
      type: string;
    },
    parentId?: string;
  }
): Promise<Result<DriveFile, Error>> {
  const drive = google.drive({ version: 'v3', auth: service.auth });
  const { file } = params;

  const fileMetadata: any = {
    name: file.name
  };

  if (params.parentId)
    fileMetadata.parents = [params.parentId];

  const buffer = Buffer.from(file.data);
  const passThrough = new stream.PassThrough();
  passThrough.end(buffer);

  return fromPromise(
    drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: file.type,
        body: passThrough
      },
      fields: 'id, name, parents, mimeType'
    }),
    (error) => error instanceof Error ? error : new Error('Unknown error occurred')
  ).andThen((response) => {
    if (!response.data.id) {
      return err(new Error('Failed to upload file: No ID returned'));
    }

    return ok({
      id: response.data.id,
      name: response.data.name || params.file.name,
      parents: response.data.parents || undefined,
      mimeType: response.data.mimeType || params.file.type
    });
  });
}
