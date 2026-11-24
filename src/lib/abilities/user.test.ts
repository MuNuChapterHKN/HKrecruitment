import { describe, expect, it } from 'vitest';
import { defineAbilityFor, type AppAction, type AppSubject } from './user';

const allSubjects: AppSubject[] = [
  'DashboardOverviewPage',
  'MyAvailabilityPage',
  'AvailabilityOverviewPage',
  'CandidatesPage',
  'CandidateDetailsPage',
  'MembersPage',
  'AvailabilityActions',
  'CandidatesActions',
  'MembersActions',
  'RecruitmentActions',
  'all',
];

const allActions: AppAction[] = ['read', 'submit', 'manage'];

describe('defineAbilityFor permissions matrix', () => {
  describe('Guest (role 0)', () => {
    it('grants expected permissions and forbids all others', () => {
      const ability = defineAbilityFor({ role: 0 });

      // Allowed permissions for guest
      expect(ability.can('read', 'DashboardOverviewPage')).toBe(true);
      expect(ability.can('read', 'MyAvailabilityPage')).toBe(true);
      expect(ability.can('submit', 'AvailabilityActions')).toBe(true);

      // Forbidden checks
      expect(ability.can('read', 'AvailabilityOverviewPage')).toBe(false);
      expect(ability.can('read', 'CandidatesPage')).toBe(false);
      expect(ability.can('read', 'CandidateDetailsPage')).toBe(false);
      expect(ability.can('read', 'MembersPage')).toBe(false);
      expect(ability.can('manage', 'CandidatesActions')).toBe(false);
      expect(ability.can('manage', 'MembersActions')).toBe(false);
      expect(ability.can('manage', 'RecruitmentActions')).toBe(false);
      expect(ability.can('manage', 'all')).toBe(false);
    });
  });

  describe('Member (role 1)', () => {
    it('grants member permissions including AvailabilityOverviewPage', () => {
      const ability = defineAbilityFor({ role: 1 });

      // Inherited from baseline
      expect(ability.can('read', 'DashboardOverviewPage')).toBe(true);
      expect(ability.can('read', 'MyAvailabilityPage')).toBe(true);
      expect(ability.can('submit', 'AvailabilityActions')).toBe(true);

      // Specific member permission
      expect(ability.can('read', 'AvailabilityOverviewPage')).toBe(true);

      // Forbidden checks
      expect(ability.can('read', 'CandidatesPage')).toBe(false);
      expect(ability.can('read', 'CandidateDetailsPage')).toBe(false);
      expect(ability.can('read', 'MembersPage')).toBe(false);
      expect(ability.can('manage', 'CandidatesActions')).toBe(false);
      expect(ability.can('manage', 'MembersActions')).toBe(false);
      expect(ability.can('manage', 'RecruitmentActions')).toBe(false);
      expect(ability.can('manage', 'all')).toBe(false);
    });
  });

  describe('Clerk (role 2)', () => {
    it('grants clerk permissions including CandidatesPage and CandidatesActions', () => {
      const ability = defineAbilityFor({ role: 2 });

      // Inherited baseline + member
      expect(ability.can('read', 'DashboardOverviewPage')).toBe(true);
      expect(ability.can('read', 'MyAvailabilityPage')).toBe(true);
      expect(ability.can('submit', 'AvailabilityActions')).toBe(true);
      expect(ability.can('read', 'AvailabilityOverviewPage')).toBe(true);

      // Specific clerk permissions
      expect(ability.can('read', 'CandidatesPage')).toBe(true);
      expect(ability.can('read', 'CandidateDetailsPage')).toBe(true);
      expect(ability.can('manage', 'CandidatesActions')).toBe(true);

      // Forbidden checks
      expect(ability.can('read', 'MembersPage')).toBe(false);
      expect(ability.can('manage', 'MembersActions')).toBe(false);
      expect(ability.can('manage', 'RecruitmentActions')).toBe(false);
      expect(ability.can('manage', 'all')).toBe(false);
    });
  });

  describe('Admin (role 3)', () => {
    it('grants admin permissions across all subjects', () => {
      const ability = defineAbilityFor({ role: 3 });

      // Admin has manage all, so can perform all actions on all subjects
      for (const subject of allSubjects) {
        for (const action of allActions) {
          expect(ability.can(action, subject)).toBe(true);
        }
      }
    });
  });

  describe('Unknown roles behave as guest', () => {
    const unknownRoles = [4, 99, null, undefined];
    const guestAbility = defineAbilityFor({ role: 0 });

    unknownRoles.forEach((role) => {
      it(`treats role value ${String(role)} exactly like guest`, () => {
        const ability = defineAbilityFor({
          role: role as unknown as number,
        });

        for (const subject of allSubjects) {
          for (const action of allActions) {
            expect(ability.can(action, subject)).toBe(
              guestAbility.can(action, subject)
            );
          }
        }
      });
    });
  });
});
