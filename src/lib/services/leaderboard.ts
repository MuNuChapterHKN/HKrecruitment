import { db, schema } from '@/db';
import { sql } from 'drizzle-orm';

export type RecruiterLeaderboardEntry = {
  userId: string;
  name: string;
  interviewCount: number;
  candidates: {
    id: string;
    name: string;
  }[];
};

export async function getRecruiterLeaderboard(
  rid: string
): Promise<RecruiterLeaderboardEntry[]> {
  const result = await db
    .select({
      userId: schema.user.id,
      name: schema.user.name,

      interviewCount: sql<number>`
        COUNT(DISTINCT ${schema.usersToInterviews.interviewId})
      `,

      candidates: sql<{ id: string; name: string }[]>`
  COALESCE(
    JSONB_AGG(
      DISTINCT JSONB_BUILD_OBJECT(
        'id', ${schema.applicant.id},
        'name', CONCAT(
          ${schema.applicant.name},
          ' ',
          ${schema.applicant.surname}
        )
      )
    ) FILTER (WHERE ${schema.applicant.id} IS NOT NULL),
    '[]'::jsonb
  )
`,
    })
    .from(schema.user)
    .innerJoin(
      schema.usersToInterviews,
      sql`${schema.user.id} = ${schema.usersToInterviews.userId}`
    )
    .innerJoin(
      schema.interview,
      sql`${schema.usersToInterviews.interviewId} = ${schema.interview.id}`
    )
    .innerJoin(
      schema.timeslot,
      sql`${schema.interview.timeslotId} = ${schema.timeslot.id}`
    )
    .leftJoin(
      schema.applicant,
      sql`${schema.applicant.interviewId} = ${schema.usersToInterviews.interviewId}`
    )
    .where(sql`${schema.timeslot.recruitingSessionId} = ${rid}`)
    .groupBy(schema.user.id, schema.user.name)
    .having(sql`COUNT(DISTINCT ${schema.usersToInterviews.interviewId}) > 0`)
    .orderBy(
      sql`COUNT(DISTINCT ${schema.usersToInterviews.interviewId}) DESC`,
      schema.user.name
    );

  return result.map((row) => ({
    userId: row.userId,
    name: row.name,
    interviewCount: Number(row.interviewCount),
    candidates: row.candidates ?? [],
  }));
}
