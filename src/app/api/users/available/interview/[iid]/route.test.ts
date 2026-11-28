import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { auth } from '@/lib/server/auth';
import type { AuthUserRole } from '@/lib/auth';
import { findOne } from '@/lib/services/interviews';
import { findForTimeslot } from '@/lib/services/users';
import { findUserRoleForSession } from '@/lib/services/recruitmentSessions';

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

vi.mock('@/lib/services/interviews', () => ({
  findOne: vi.fn(),
}));

vi.mock('@/lib/services/users', () => ({
  findForTimeslot: vi.fn(),
}));

vi.mock('@/lib/services/recruitmentSessions', () => ({
  findUserRoleForSession: vi.fn(),
}));

describe('GET /api/users/available/interview/[iid]', () => {
  const interviewId = 'dev-int-1';
  const timeslotId = 'timeslot-1';
  const recruitingSessionId = 'session-1';
  const userId = 'user-1';

  const makeRequest = () =>
    new NextRequest(
      `http://localhost:3000/recruitment/api/users/available/interview/${interviewId}`
    );

  const makeContext = (iid = interviewId) => ({
    params: Promise.resolve({ iid }),
  });

  const mockSession = {
    user: { id: userId },
  } as unknown as Awaited<ReturnType<typeof auth.api.getSession>>;

  const mockInterview = {
    id: interviewId,
    timeslotId,
    recruitingSessionId,
    meetingId: null,
    reportDocId: null,
    confirmed: false,
    startingFrom: new Date('2026-11-20T10:00:00.000Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when there is no session', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const response = await GET(makeRequest(), makeContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(findOne).not.toHaveBeenCalled();
    expect(findForTimeslot).not.toHaveBeenCalled();
  });

  it('returns 404 when the interview does not exist', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
    vi.mocked(findOne).mockResolvedValue(null);

    const response = await GET(makeRequest(), makeContext('missing-int'));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'Interview not found',
    });
    expect(findUserRoleForSession).not.toHaveBeenCalled();
    expect(findForTimeslot).not.toHaveBeenCalled();
  });

  for (const [roleName, roleValue] of [
    ['guest', 0],
    ['member', 1],
  ] as Array<[string, AuthUserRole]>) {
    it(`returns 403 when the user is a ${roleName} in the interview session`, async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(findOne).mockResolvedValue(mockInterview);
      vi.mocked(findUserRoleForSession).mockResolvedValue(roleValue);

      const response = await GET(makeRequest(), makeContext());

      expect(response.status).toBe(403);
      await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
      expect(findUserRoleForSession).toHaveBeenCalledWith(
        userId,
        recruitingSessionId
      );
      expect(findForTimeslot).not.toHaveBeenCalled();
    });
  }

  for (const [roleName, roleValue] of [
    ['clerk', 2],
    ['admin', 3],
  ] as Array<[string, AuthUserRole]>) {
    it(`returns 200 with available users when the user is a ${roleName} in the interview session`, async () => {
      const availableUsers = [
        {
          id: 'interviewer-1',
          name: 'Elena Clerk',
          isFirstTime: false,
          image: null,
        },
      ];
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(findOne).mockResolvedValue(mockInterview);
      vi.mocked(findUserRoleForSession).mockResolvedValue(roleValue);
      vi.mocked(findForTimeslot).mockResolvedValue(availableUsers);

      const response = await GET(makeRequest(), makeContext());

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual(availableUsers);
      expect(findUserRoleForSession).toHaveBeenCalledWith(
        userId,
        recruitingSessionId
      );
      expect(findForTimeslot).toHaveBeenCalledWith(timeslotId);
    });
  }

  it('returns 200 with an empty array when nobody gave availability', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
    vi.mocked(findOne).mockResolvedValue(mockInterview);
    vi.mocked(findUserRoleForSession).mockResolvedValue(2);
    vi.mocked(findForTimeslot).mockResolvedValue([]);

    const response = await GET(makeRequest(), makeContext());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
  });
});
