import { AppAbility, RoleChangeChecker, UserAuth } from '@hkrecruitment/shared';

export type AuthenticatedRequest = Request & {
  user: UserAuth;
  ability: AppAbility;
  roleChangeChecker: RoleChangeChecker;
};
