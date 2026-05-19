import { defineAbilityFor } from './user';
import { findUserRoleForSession } from '@/lib/services/recruitmentSessions';

export async function abilityForUserInSession(
  userId: string,
  recruitingSessionId: string
) {
  const role = await findUserRoleForSession(userId, recruitingSessionId);
  return defineAbilityFor({ role });
}

export async function abilityForUserFromResource(
  userId: string,
  resource: { recruitingSessionId?: string }
) {
  const rid = resource.recruitingSessionId;
  if (!rid) return defineAbilityFor({ role: 0 });
  return abilityForUserInSession(userId, rid);
}
