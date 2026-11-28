import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ok } from 'neverthrow';
import { PATCH } from './route';
import { auth } from '@/lib/server/auth';
import { AuthUserRole } from '@/lib/auth';
import { getApplicantById } from '@/lib/services/applicants';
import { findUserRoleForSession } from '@/lib/services/recruitmentSessions';
import {
  getFileMetadata,
  shareFileWithGroup,
  uploadFile,
} from '@/lib/google/drive/files';
import { db } from '@/db';

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock('@/lib/server/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/lib/services/applicants', () => ({
  getApplicantById: vi.fn(),
}));

vi.mock('@/lib/services/recruitmentSessions', () => ({
  findUserRoleForSession: vi.fn(),
}));

vi.mock('@/lib/google/drive/files', () => ({
  getFileMetadata: vi.fn(),
  uploadFile: vi.fn(),
  shareFileWithGroup: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    update: vi.fn(),
  },
}));

describe('PATCH /api/applicants/[id]/files', () => {
  const applicantId = 'dev-app-a';
  const recruitingSessionId = 'session-1';
  const userId = 'user-1';

  const makePdfFormData = (fileType: string = 'cv') => {
    const form = new FormData();
    form.set('fileType', fileType);
    form.set(
      'file',
      new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'document.pdf', {
        type: 'application/pdf',
      })
    );
    return form;
  };

  const makeRequest = (body?: FormData) =>
    new Request(
      `http://localhost:3000/recruitment/api/applicants/${applicantId}/files`,
      {
        method: 'PATCH',
        body,
      }
    );

  const makeContext = (id = applicantId) => ({
    params: Promise.resolve({ id }),
  });

  const mockSession = {
    user: { id: userId },
  } as unknown as Awaited<ReturnType<typeof auth.api.getSession>>;

  const mockApplicant = {
    id: applicantId,
    recruitingSessionId,
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario.rossi@studenti.polito.it',
    gpa: '28.5',
    degreeLevel: 'msc' as const,
    course: 'Computer Engineering',
    courseArea: 'ICT',
    italianLevel: 'native' as const,
    stage: 'a' as const,
    cvFileId: 'old-cv-id',
    spFileId: 'old-sp-id',
    interviewId: null,
    token: null,
    chosenArea: null,
    accepted: null,
    archived: false,
    createdAt: new Date('2026-11-01T10:00:00.000Z'),
    updatedAt: new Date('2026-11-01T10:00:00.000Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when there is no session', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const response = await PATCH(makeRequest(makePdfFormData()), makeContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(getApplicantById).not.toHaveBeenCalled();
    expect(findUserRoleForSession).not.toHaveBeenCalled();
    expect(getFileMetadata).not.toHaveBeenCalled();
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('returns 404 when the applicant does not exist', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
    vi.mocked(getApplicantById).mockResolvedValue(null);

    const response = await PATCH(
      makeRequest(makePdfFormData()),
      makeContext('missing-applicant')
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'Applicant not found',
    });
    expect(findUserRoleForSession).not.toHaveBeenCalled();
    expect(getFileMetadata).not.toHaveBeenCalled();
    expect(uploadFile).not.toHaveBeenCalled();
  });

  for (const [roleName, roleValue] of [
    ['guest', AuthUserRole.Guest],
    ['member', AuthUserRole.Member],
  ] as const) {
    it(`returns 403 when the user is a ${roleName} in the applicant session`, async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(getApplicantById).mockResolvedValue(mockApplicant);
      vi.mocked(findUserRoleForSession).mockResolvedValue(roleValue);

      const response = await PATCH(makeRequest(), makeContext());

      expect(response.status).toBe(403);
      await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
      expect(findUserRoleForSession).toHaveBeenCalledWith(
        userId,
        recruitingSessionId
      );
      expect(getFileMetadata).not.toHaveBeenCalled();
      expect(uploadFile).not.toHaveBeenCalled();
    });
  }

  it('validates the request body after passing the role check', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
    vi.mocked(getApplicantById).mockResolvedValue(mockApplicant);
    vi.mocked(findUserRoleForSession).mockResolvedValue(AuthUserRole.Clerk);

    const response = await PATCH(makeRequest(new FormData()), makeContext());

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: 'fileType and file are required',
    });
    expect(getFileMetadata).not.toHaveBeenCalled();
    expect(uploadFile).not.toHaveBeenCalled();
  });

  for (const [roleName, roleValue] of [
    ['clerk', AuthUserRole.Clerk],
    ['admin', AuthUserRole.Admin],
  ] as const) {
    it(`passes the role check and replaces the file when the user is a ${roleName}`, async () => {
      const whereMock = vi.fn().mockResolvedValue(undefined);
      const setMock = vi.fn(() => ({ where: whereMock }));
      vi.mocked(db.update).mockReturnValue({
        set: setMock,
      } as unknown as ReturnType<typeof db.update>);

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(getApplicantById).mockResolvedValue(mockApplicant);
      vi.mocked(findUserRoleForSession).mockResolvedValue(roleValue);
      vi.mocked(getFileMetadata).mockResolvedValue(
        ok({
          id: 'old-cv-id',
          name: 'old_cv.pdf',
          parents: ['folder-1'],
          mimeType: 'application/pdf',
        })
      );
      vi.mocked(uploadFile).mockResolvedValue(
        ok({
          id: 'new-cv-id',
          name: 'curriculum_2026-11-28T18-00-00.pdf',
          parents: ['folder-1'],
          mimeType: 'application/pdf',
        })
      );
      vi.mocked(shareFileWithGroup).mockResolvedValue(ok(undefined));

      const response = await PATCH(
        makeRequest(makePdfFormData('cv')),
        makeContext()
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        success: true,
        fileId: 'new-cv-id',
        fileType: 'cv',
        oldFileId: 'old-cv-id',
      });
      expect(findUserRoleForSession).toHaveBeenCalledWith(
        userId,
        recruitingSessionId
      );
      expect(getFileMetadata).toHaveBeenCalledWith('old-cv-id');
      expect(uploadFile).toHaveBeenCalledOnce();
      expect(setMock).toHaveBeenCalledWith({ cvFileId: 'new-cv-id' });
    });
  }
});
