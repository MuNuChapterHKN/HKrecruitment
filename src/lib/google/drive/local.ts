import { promises as fs } from 'fs';
import path from 'path';
import { Result, ok, err, fromPromise } from 'neverthrow';
import { service } from '../service';
import { DriveFile, DriveFolder } from './types';

const LOCAL_DRIVE_DIR = path.join(process.cwd(), '.local-drive');
const ID_PREFIX = 'local-';
const ROOT_ID = `${ID_PREFIX}root`;

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
};

let warned = false;

export function isLocalDrive(): boolean {
  const enabled =
    process.env.NODE_ENV !== 'production' && !service.hasCredentials();

  if (enabled && !warned) {
    warned = true;
    console.warn(
      `[local-drive] Google credentials missing: Drive files are stored in ${LOCAL_DRIVE_DIR}`
    );
  }

  return enabled;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error('Unknown error occurred');
}

function toId(relativePath: string) {
  if (!relativePath) return ROOT_ID;
  return ID_PREFIX + Buffer.from(relativePath).toString('base64url');
}

function toRelativePath(id: string | undefined): string | null {
  if (!id || id === ROOT_ID) return '';
  if (!id.startsWith(ID_PREFIX)) return null;
  return Buffer.from(id.slice(ID_PREFIX.length), 'base64url').toString();
}

function safeName(name: string) {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim() || '_';
}

function childPath(parentId: string | undefined, name: string) {
  return path.posix.join(toRelativePath(parentId) ?? '', safeName(name));
}

function parentIdOf(relativePath: string) {
  const parent = path.posix.dirname(relativePath);
  return toId(parent === '.' ? '' : parent);
}

function absolutePath(relativePath: string): Result<string, Error> {
  const absolute = path.resolve(LOCAL_DRIVE_DIR, relativePath);
  if (
    absolute !== LOCAL_DRIVE_DIR &&
    !absolute.startsWith(LOCAL_DRIVE_DIR + path.sep)
  ) {
    return err(new Error(`Invalid local drive path: ${relativePath}`));
  }
  return ok(absolute);
}

export async function localGetFolderByName(
  name: string,
  parentId?: string
): Promise<Result<DriveFolder | null, Error>> {
  const relativePath = childPath(parentId, name);
  const absolute = absolutePath(relativePath);
  if (absolute.isErr()) return err(absolute.error);

  const stats = await fs.stat(absolute.value).catch(() => null);
  if (!stats?.isDirectory()) return ok(null);

  return ok({
    id: toId(relativePath),
    name: path.posix.basename(relativePath),
    parents: [parentIdOf(relativePath)],
  });
}

export async function localCreateFolder(params: {
  name: string;
  parentId?: string;
}): Promise<Result<DriveFolder, Error>> {
  const relativePath = childPath(params.parentId, params.name);
  const absolute = absolutePath(relativePath);
  if (absolute.isErr()) return err(absolute.error);

  return fromPromise(
    fs.mkdir(absolute.value, { recursive: true }),
    toError
  ).map(() => ({
    id: toId(relativePath),
    name: path.posix.basename(relativePath),
    parents: [parentIdOf(relativePath)],
  }));
}

export async function localUploadFile(params: {
  file: {
    name: string;
    data: ArrayBuffer;
    type: string;
  };
  parentId?: string;
}): Promise<Result<DriveFile, Error>> {
  const relativePath = childPath(params.parentId, params.file.name);
  const absolute = absolutePath(relativePath);
  if (absolute.isErr()) return err(absolute.error);

  return fromPromise(
    fs
      .mkdir(path.dirname(absolute.value), { recursive: true })
      .then(() => fs.writeFile(absolute.value, Buffer.from(params.file.data))),
    toError
  ).map(() => ({
    id: toId(relativePath),
    name: path.posix.basename(relativePath),
    parents: [parentIdOf(relativePath)],
    mimeType: params.file.type,
  }));
}

export async function localGetFileMetadata(
  fileId: string
): Promise<Result<DriveFile, Error>> {
  const relativePath = toRelativePath(fileId);
  if (!relativePath) {
    return err(new Error(`File not found in local drive: ${fileId}`));
  }

  const absolute = absolutePath(relativePath);
  if (absolute.isErr()) return err(absolute.error);

  const stats = await fs.stat(absolute.value).catch(() => null);
  if (!stats?.isFile()) {
    return err(new Error(`File not found in local drive: ${fileId}`));
  }

  return ok({
    id: fileId,
    name: path.posix.basename(relativePath),
    parents: [parentIdOf(relativePath)],
    mimeType:
      MIME_TYPES[path.extname(relativePath).toLowerCase()] ??
      'application/octet-stream',
  });
}

export async function localShareFileWithGroup(): Promise<Result<void, Error>> {
  return ok(undefined);
}
