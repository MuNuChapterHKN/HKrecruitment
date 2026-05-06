import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from '@casl/ability';
import { AuthUser, AuthUserRole } from '@/lib/auth';

export type UserLike<T extends object> = T & Pick<AuthUser, 'role'>;

export type AppAction = 'read' | 'submit' | 'manage';

export type AppSubject =
  | 'DashboardOverviewPage'
  | 'MyAvailabilityPage'
  | 'AvailabilityOverviewPage'
  | 'CandidatesPage'
  | 'CandidateDetailsPage'
  | 'MembersPage'
  | 'AvailabilityActions'
  | 'CandidatesActions'
  | 'MembersActions'
  | 'RecruitmentActions'
  | 'all';

export type AppAbility = MongoAbility<[AppAction, AppSubject]>;

type DashboardRole = 'guest' | 'member' | 'clerk' | 'admin';

function resolveDashboardRole(role: number | null | undefined): DashboardRole {
  if (role === AuthUserRole.Admin) {
    return 'admin';
  }

  if (role === AuthUserRole.Clerk) {
    return 'clerk';
  }

  if (role === AuthUserRole.Member) {
    return 'member';
  }

  return 'guest';
}

export function defineAbilityFor<T extends object>(user: UserLike<T>) {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
  const role = resolveDashboardRole(user.role);

  can('read', 'DashboardOverviewPage');
  can('read', 'MyAvailabilityPage');
  can('submit', 'AvailabilityActions');

  if (role === 'member' || role === 'clerk' || role === 'admin') {
    can('read', 'AvailabilityOverviewPage');
  }

  if (role === 'clerk' || role === 'admin') {
    can('read', 'CandidatesPage');
    can('read', 'CandidateDetailsPage');
    can('manage', 'CandidatesActions');
  }

  if (role === 'admin') {
    can('read', 'MembersPage');
    can('manage', 'MembersActions');
    can('manage', 'RecruitmentActions');
    can('manage', 'all');
  }

  return build();
}
