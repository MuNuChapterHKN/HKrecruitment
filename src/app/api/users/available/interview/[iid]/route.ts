import { findOne } from '@/lib/services/interviews';
import { findForTimeslot } from '@/lib/services/users';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ iid: string }> }
) => {
  const { iid } = await params;

  const interview = await findOne(iid);

  if (!interview) {
    return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
  }

  const users = await findForTimeslot(interview.timeslotId);

  return NextResponse.json(users);
};
