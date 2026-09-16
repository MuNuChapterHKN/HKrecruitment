import { abilityForUserInSession } from '@/lib/abilities/server';
import type { AppSubject } from '@/lib/abilities/user';
import { forbidden } from 'next/navigation';

export async function requirePageAccess(
  userId: string,
  recruitingSessionId: string,
  subject: AppSubject
) {
  const ability = await abilityForUserInSession(userId, recruitingSessionId);

  if (!ability.can('read', subject)) {
    forbidden();
  }
}
