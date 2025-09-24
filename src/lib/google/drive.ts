import { google } from 'googleapis';
import { Result, ok, err, fromPromise } from 'neverthrow';
import { service } from './service';

interface CreateFolderParams {
  name: string;
  parentId?: string;
}

interface DriveFolder {
  id: string;
  name: string;
  parents?: string[];
}

export async function createFolder(
  params: CreateFolderParams
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
