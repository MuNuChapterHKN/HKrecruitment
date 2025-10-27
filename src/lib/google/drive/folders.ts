import { google } from 'googleapis';
import { Result, ok, err, fromPromise } from 'neverthrow';
import { service } from '../service';
import { DriveFolder } from './types';

async function getFolderByName(
  name: string,
  parentId?: string
): Promise<Result<DriveFolder | null, Error>> {
  const authResult = await service.getAuth();
  if (authResult.isErr()) {
    return err(authResult.error);
  }

  const drive = google.drive({ version: 'v3', auth: authResult.value });

  let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  return fromPromise(
    drive.files.list({
      q: query,
      fields: 'files(id, name, parents)',
    }),
    (error) =>
      error instanceof Error ? error : new Error('Unknown error occurred')
  ).andThen((response) => {
    const files = response.data.files || [];
    if (files.length === 0) {
      return ok(null);
    }

    const file = files[0];
    return ok({
      id: file.id!,
      name: file.name!,
      parents: file.parents || undefined,
    });
  });
}

export async function createFolder(params: {
  name: string;
  parentId?: string;
}): Promise<Result<DriveFolder, Error>> {
  const authResult = await service.getAuth();
  if (authResult.isErr()) {
    return err(authResult.error);
  }

  const drive = google.drive({ version: 'v3', auth: authResult.value });

  const fileMetadata: {
    name: string;
    mimeType: string;
    parents?: string[];
  } = {
    name: params.name,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (params.parentId) {
    fileMetadata.parents = [params.parentId];
  }

  return fromPromise(
    drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, parents',
    }),
    (error) =>
      error instanceof Error ? error : new Error('Unknown error occurred')
  ).andThen((response) => {
    if (!response.data.id) {
      return err(new Error('Failed to create folder: No ID returned'));
    }

    return ok({
      id: response.data.id,
      name: response.data.name || params.name,
      parents: response.data.parents || undefined,
    });
  });
}

export async function assertPath(
  path: string,
  parentId: string
): Promise<Result<DriveFolder, Error>> {
  if (!path || path === '/') {
    return err(new Error('Invalid path'));
  }

  const parts = path.split('/').filter((part) => part.length > 0);
  let currentParent: DriveFolder = {
    id: parentId,
    name: 'Parent',
  };

  for (const part of parts) {
    const existingFolderResult = await getFolderByName(part, currentParent.id);

    if (existingFolderResult.isErr()) {
      return err(existingFolderResult.error);
    }

    const existingFolder = existingFolderResult.value;

    if (existingFolder) {
      currentParent = existingFolder;
    } else {
      const createResult = await createFolder({
        name: part,
        parentId: currentParent.id,
      });

      if (createResult.isErr()) return err(createResult.error);

      currentParent = createResult.value;
    }
  }

  return ok(currentParent);
}
