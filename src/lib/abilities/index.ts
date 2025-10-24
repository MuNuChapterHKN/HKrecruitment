import { AuthUserRole } from '@/lib/auth';

export * from './user';

export type A<T extends object> = T & {
  canRead?: AuthUserRole;
  canAccess?: AuthUserRole;
};
