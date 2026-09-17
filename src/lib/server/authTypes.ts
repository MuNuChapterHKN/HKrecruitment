import { auth } from './auth';

export type AuthSessionUser = typeof auth.$Infer.Session;
export type AuthSession = AuthSessionUser['session'];
export type AuthUser = AuthSessionUser['user'];

export enum AuthUserRole {
  Guest = 0,
  Member = 1,
  Clerk = 2,
  Admin = 3,
  // God = 4,   // not currently used, reserved for potential future use
}

export const AuthUserRoleName: Record<number, string> = {
  [AuthUserRole.Guest]: 'guest',
  [AuthUserRole.Member]: 'member',
  [AuthUserRole.Clerk]: 'clerk',
  [AuthUserRole.Admin]: 'admin',
  // [AuthUserRole.God]: 'god',    // not currently used, reserved for potential future use
};
