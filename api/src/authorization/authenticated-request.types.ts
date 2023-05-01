import { AppAbility, Role, UserAuth } from '@hkrecruitment/shared';

export type AuthenticatedRequest = Request & {
  user: UserAuth;
  ability: AppAbility;
  roleChangeChecker: (prevRole: Role, newRole: Role) => boolean;
};
