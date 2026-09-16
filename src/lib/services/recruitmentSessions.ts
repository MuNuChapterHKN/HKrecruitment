import { db, schema } from '@/db';
import { desc, eq, and } from 'drizzle-orm';
import { AuthUserRole, AuthUserRoleName } from '@/lib/server/authTypes';

const rs = schema.recruitingSession;

export const findOne = async (id: string) => {
  const res = await db
    .select()
    .from(rs)
    .where(eq(rs.id, id))
    .catch(() => null);

  if (!res || res.length < 1) return null;
  return res.at(0);
};

export const findAllAsOptions = async () => {
  const res = await db
    .select({
      id: rs.id,
      year: rs.year,
      semester: rs.semester,
    })
    .from(rs)
    .orderBy(desc(rs.year), desc(rs.semester));

  return res;
};

export const findLatest = async () => {
  const res = await db
    .select()
    .from(rs)
    .orderBy(desc(rs.year), desc(rs.semester))
    .limit(1)
    .catch(() => null);

  if (!res || res.length < 1) return null;
  return res.at(0);
};

export const findUserRoleForSession = async (
  userId: string,
  recruitingSessionId: string
): Promise<AuthUserRole> => {
  const uts = schema.usersToRecruitingSessions;
  const res = await db
    .select()
    .from(uts)
    .where(
      and(
        eq(uts.userId, userId),
        eq(uts.recruitingSessionId, recruitingSessionId)
      )
    )
    .catch(() => null);

  const role = res?.at(0)?.role;

  if (
    typeof role === 'number' &&
    Object.prototype.hasOwnProperty.call(AuthUserRoleName, role)
  ) {
    return role as AuthUserRole;
  }

  return AuthUserRole.Guest;
};
