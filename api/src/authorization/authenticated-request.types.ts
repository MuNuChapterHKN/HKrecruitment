import { AppAbility, UserAuth } from '@hkrecruitment/shared';

export type AuthenticatedRequest = Request & {
  user: UserAuth;
  ability: AppAbility;
};
