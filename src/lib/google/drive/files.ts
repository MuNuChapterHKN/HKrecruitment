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
