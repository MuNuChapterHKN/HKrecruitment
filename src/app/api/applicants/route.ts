import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
  applicant,
  recruitingSession,
  DEGREE_LEVELS,
  LANGUAGE_LEVELS,
  STAGES,
} from '@/db/schema';
import { insertApplicantSchema } from '@/lib/models/applicants';
import { ZodError } from 'zod';
import { desc } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const [session] = await db
      .select()
      .from(recruitingSession)
      .orderBy(desc(recruitingSession.start_date))
      .limit(1);

    if (!session) {
      return NextResponse.json(
        { error: 'No recruiting session found' },
        { status: 500 }
      );
    }

    const now = new Date();
    const start = new Date(session.start_date);
    const end = new Date(session.end_date);

    const isValidWindow = now >= start && now <= end;

    if (!isValidWindow) {
      return NextResponse.json(
        {
          error:
            'Applications are closed. Please apply during the next recruiting session.',
          session: { start_date: start, end_date: end },
        },
        { status: 403 }
      );
    }

    const parsed = insertApplicantSchema.parse(body);

    const toInsert = {
      id: crypto.randomUUID(),
      recruitingSessionId: parsed.recruitingSessionId,
      name: parsed.name,
      surname: parsed.surname,
      email: parsed.email,
      gpa: parsed.gpa.toString(),
      degreeLevel: parsed.degreeLevel as (typeof DEGREE_LEVELS)[number],
      course: parsed.course,
      courseArea: parsed.courseArea,
      italianLevel: parsed.italianLevel as (typeof LANGUAGE_LEVELS)[number],
      stage: 'a' as (typeof STAGES)[number],
      cvFileId: '',
      spFileId: '',
      interviewId: '',
      token: '',
      chosenArea: null,
      accepted: null,
    };

    const inserted = await db.insert(applicant).values([toInsert]).returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    if (error instanceof ZodError && 'issues' in (error as any)) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('[POST /api/applicants] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
