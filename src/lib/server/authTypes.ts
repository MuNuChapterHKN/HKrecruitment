import { auth } from './auth';

export type AuthSessionUser = typeof auth.$Infer.Session;
export type AuthSession = AuthSessionUser['session'];
export type AuthUser = AuthSessionUser['user'];

export enum AuthUserRole {
  Guest = 0,
  User = 1,
  Clerk = 2,
  Admin = 3,
  God = 4,
}

export const AuthUserRoleName: Record<number, string> = {
  [AuthUserRole.Guest]: 'guest',
  [AuthUserRole.User]: 'user',
  [AuthUserRole.Clerk]: 'clerk',
  [AuthUserRole.Admin]: 'admin',
  [AuthUserRole.God]: 'god',
};
