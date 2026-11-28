import { abilityForUserInSession } from '@/lib/abilities/server';
import { auth } from '@/lib/server/auth';
import { findOne } from '@/lib/services/interviews';
import { findForTimeslot } from '@/lib/services/users';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ iid: string }> }
) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { iid } = await params;

  const interview = await findOne(iid);

  if (!interview) {
    return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
  }

  const ability = await abilityForUserInSession(
    session.user.id,
    interview.recruitingSessionId
  );

  if (!ability.can('manage', 'CandidatesActions')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await findForTimeslot(interview.timeslotId);

  return NextResponse.json(users);
};
