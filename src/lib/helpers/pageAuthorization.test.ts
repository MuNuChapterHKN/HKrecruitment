import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requirePageAccess } from './pageAuthorization';
import { findUserRoleForSession } from '@/lib/services/recruitmentSessions';
import type { AuthUserRole } from '@/lib/auth';
import { forbidden } from 'next/navigation';

vi.mock('@/lib/services/recruitmentSessions', () => ({
  findUserRoleForSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  forbidden: vi.fn(() => {
    throw new Error('NEXT_FORBIDDEN');
  }),
}));

describe('requirePageAccess', () => {
  const userId = 'user-123';
  const sessionId = 'session-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Guest role (0)', () => {
    beforeEach(() => {
      vi.mocked(findUserRoleForSession).mockResolvedValue(0);
    });

    it('allows access to DashboardOverviewPage and MyAvailabilityPage without calling forbidden()', async () => {
      await expect(
        requirePageAccess(userId, sessionId, 'DashboardOverviewPage')
      ).resolves.toBeUndefined();
      await expect(
        requirePageAccess(userId, sessionId, 'MyAvailabilityPage')
      ).resolves.toBeUndefined();

      expect(findUserRoleForSession).toHaveBeenCalledWith(userId, sessionId);
      expect(forbidden).not.toHaveBeenCalled();
    });

    it('calls forbidden() when accessing AvailabilityOverviewPage, CandidatesPage, or MembersPage', async () => {
      await expect(
        requirePageAccess(userId, sessionId, 'AvailabilityOverviewPage')
      ).rejects.toThrow('NEXT_FORBIDDEN');
      expect(forbidden).toHaveBeenCalledTimes(1);

      await expect(
        requirePageAccess(userId, sessionId, 'CandidatesPage')
      ).rejects.toThrow('NEXT_FORBIDDEN');
      expect(forbidden).toHaveBeenCalledTimes(2);

      await expect(
        requirePageAccess(userId, sessionId, 'MembersPage')
      ).rejects.toThrow('NEXT_FORBIDDEN');
      expect(forbidden).toHaveBeenCalledTimes(3);
    });
  });

  describe('Member role (1)', () => {
    beforeEach(() => {
      vi.mocked(findUserRoleForSession).mockResolvedValue(1);
    });

    it('allows access to AvailabilityOverviewPage without calling forbidden()', async () => {
      await expect(
        requirePageAccess(userId, sessionId, 'AvailabilityOverviewPage')
      ).resolves.toBeUndefined();
      expect(forbidden).not.toHaveBeenCalled();
    });

    it('calls forbidden() when accessing CandidatesPage or MembersPage', async () => {
      await expect(
        requirePageAccess(userId, sessionId, 'CandidatesPage')
      ).rejects.toThrow('NEXT_FORBIDDEN');
      await expect(
        requirePageAccess(userId, sessionId, 'MembersPage')
      ).rejects.toThrow('NEXT_FORBIDDEN');
      expect(forbidden).toHaveBeenCalledTimes(2);
    });
  });

  describe('Clerk role (2)', () => {
    beforeEach(() => {
      vi.mocked(findUserRoleForSession).mockResolvedValue(2);
    });

    it('allows access to CandidatesPage and CandidateDetailsPage without calling forbidden()', async () => {
      await expect(
        requirePageAccess(userId, sessionId, 'CandidatesPage')
      ).resolves.toBeUndefined();
      await expect(
        requirePageAccess(userId, sessionId, 'CandidateDetailsPage')
      ).resolves.toBeUndefined();
      expect(forbidden).not.toHaveBeenCalled();
    });

    it('calls forbidden() when accessing MembersPage', async () => {
      await expect(
        requirePageAccess(userId, sessionId, 'MembersPage')
      ).rejects.toThrow('NEXT_FORBIDDEN');
      expect(forbidden).toHaveBeenCalledTimes(1);
    });
  });

  describe('Admin role (3)', () => {
    beforeEach(() => {
      vi.mocked(findUserRoleForSession).mockResolvedValue(3);
    });

    it('allows access to all protected pages including MembersPage', async () => {
      await expect(
        requirePageAccess(userId, sessionId, 'DashboardOverviewPage')
      ).resolves.toBeUndefined();
      await expect(
        requirePageAccess(userId, sessionId, 'AvailabilityOverviewPage')
      ).resolves.toBeUndefined();
      await expect(
        requirePageAccess(userId, sessionId, 'CandidatesPage')
      ).resolves.toBeUndefined();
      await expect(
        requirePageAccess(userId, sessionId, 'MembersPage')
      ).resolves.toBeUndefined();

      expect(forbidden).not.toHaveBeenCalled();
    });
  });

  describe('Unknown or missing role (null)', () => {
    it('falls back to guest permissions and calls forbidden() for restricted pages', async () => {
      vi.mocked(findUserRoleForSession).mockResolvedValue(
        null as unknown as AuthUserRole
      );

      await expect(
        requirePageAccess(userId, sessionId, 'DashboardOverviewPage')
      ).resolves.toBeUndefined();
      expect(forbidden).not.toHaveBeenCalled();

      await expect(
        requirePageAccess(userId, sessionId, 'AvailabilityOverviewPage')
      ).rejects.toThrow('NEXT_FORBIDDEN');
      expect(forbidden).toHaveBeenCalledTimes(1);
    });
  });
});

import { expect, test } from 'vitest';
test('temporary CI failure check', () => {
  expect(true).toBe(false);
});
