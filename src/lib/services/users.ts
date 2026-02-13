import { db, schema } from '@/db';
import { asc, eq } from 'drizzle-orm';
import { TIMESLOT_AVAILABILITY_MARGIN } from './timeslots';

export const listAllUsers = async () =>
  await db.select().from(schema.user).orderBy(asc(schema.user.name));

export const findForTimeslot = async (timeslotId: string) => {
  const timeslot = await db
    .select()
    .from(schema.timeslot)
    .where(eq(schema.timeslot.id, timeslotId))
    .limit(1);

  if (!timeslot[0]) {
    return [];
  }

  const allTimeslots = await db
    .select()
    .from(schema.timeslot)
    .where(
      eq(schema.timeslot.recruitingSessionId, timeslot[0].recruitingSessionId)
    );

  const sortedTimeslots = [...allTimeslots].sort(
    (a, b) => a.startingFrom.getTime() - b.startingFrom.getTime()
  );

  const timeslotIndices = new Map<string, number>();
  sortedTimeslots.forEach((ts, index) => {
    timeslotIndices.set(ts.id, index);
  });

  const currentIndex = timeslotIndices.get(timeslotId);
  if (currentIndex === undefined) {
    return [];
  }

  const allTimeslotsWithInterviews = await db
    .select({
      timeslotId: schema.timeslot.id,
      userId: schema.usersToInterviews.userId,
    })
    .from(schema.timeslot)
    .leftJoin(
      schema.interview,
      eq(schema.timeslot.id, schema.interview.timeslotId)
    )
    .leftJoin(
      schema.usersToInterviews,
      eq(schema.interview.id, schema.usersToInterviews.interviewId)
    )
    .where(
      eq(schema.timeslot.recruitingSessionId, timeslot[0].recruitingSessionId)
    );

  const userInterviews = new Map<string, Set<number>>();
  allTimeslotsWithInterviews.forEach((row) => {
    if (row.userId && row.timeslotId) {
      const timeslotIndex = timeslotIndices.get(row.timeslotId);
      if (timeslotIndex !== undefined) {
        if (!userInterviews.has(row.userId)) {
          userInterviews.set(row.userId, new Set());
        }
        userInterviews.get(row.userId)!.add(timeslotIndex);
      }
    }
  });

  const availableUsers = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      isFirstTime: schema.user.isFirstTime,
      image: schema.user.image,
    })
    .from(schema.interviewerAvailability)
    .innerJoin(
      schema.user,
      eq(schema.interviewerAvailability.userId, schema.user.id)
    )
    .where(eq(schema.interviewerAvailability.timeslotId, timeslotId));

  return availableUsers.filter((user) => {
    const userInterviewIndices = userInterviews.get(user.id);
    if (!userInterviewIndices) return true;

    for (
      let i = currentIndex - TIMESLOT_AVAILABILITY_MARGIN;
      i <= currentIndex + TIMESLOT_AVAILABILITY_MARGIN;
      i++
    ) {
      if (userInterviewIndices.has(i)) {
        return false;
      }
    }
    return true;
  });
};
