import { Role } from '@hkrecruitment/shared';

export type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    role: Role;
  };
};
