import { Role } from '@hkrecruitment/shared/dist';

export type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    role: Role;
  };
};
