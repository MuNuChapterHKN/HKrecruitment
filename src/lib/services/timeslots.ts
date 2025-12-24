import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

const tsl = schema.timeslot;

export const TIMESLOT_AVAILABILITY_MARGIN = 1;

export const findAll = async (rid: string) =>
  await db.select().from(tsl).where(eq(tsl.recruitingSessionId, rid));

export const findForUser = async (userId: string) => {
  const availabilities = await db
    .select()
    .from(schema.interviewerAvailability)
    .where(eq(schema.interviewerAvailability.userId, userId));

  return availabilities.map((a) => a.timeslotId);
};

export const findAvailableForBooking = async (rid: string) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const allTimeslots = await findAll(rid);
  const futureTimeslots = allTimeslots.filter(
    (ts) => ts.startingFrom >= tomorrow
  );

  const allTimeslotsWithInterviews = await db
    .select({
      timeslotId: schema.timeslot.id,
      startingFrom: schema.timeslot.startingFrom,
      interviewId: schema.interview.id,
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
    .where(eq(schema.timeslot.recruitingSessionId, rid));

  const timeslotMap = new Map<string, Date>();
  allTimeslots.forEach((ts) => {
    timeslotMap.set(ts.id, ts.startingFrom);
  });

  const timeslotIndices = new Map<string, number>();
  const sortedTimeslots = [...allTimeslots].sort(
    (a, b) => a.startingFrom.getTime() - b.startingFrom.getTime()
  );
  sortedTimeslots.forEach((ts, index) => {
    timeslotIndices.set(ts.id, index);
  });

  const userInterviews = new Map<string, Set<number>>();
  allTimeslotsWithInterviews.forEach((row) => {
    if (row.userId && row.interviewId && row.timeslotId) {
      const timeslotIndex = timeslotIndices.get(row.timeslotId);
      if (timeslotIndex !== undefined) {
        if (!userInterviews.has(row.userId)) {
          userInterviews.set(row.userId, new Set());
        }
        userInterviews.get(row.userId)!.add(timeslotIndex);
      }
    }
  });

  const availabilities = await db
    .select({
      userId: schema.interviewerAvailability.userId,
      timeslotId: schema.interviewerAvailability.timeslotId,
      isFirstTime: schema.user.isFirstTime,
    })
    .from(schema.interviewerAvailability)
    .innerJoin(
      schema.timeslot,
      eq(schema.interviewerAvailability.timeslotId, schema.timeslot.id)
    )
    .innerJoin(
      schema.user,
      eq(schema.interviewerAvailability.userId, schema.user.id)
    )
    .where(eq(schema.timeslot.recruitingSessionId, rid));

  const availableTimeslots: string[] = [];

  for (const timeslot of futureTimeslots) {
    const currentIndex = timeslotIndices.get(timeslot.id)!;

    const usersAvailableInSlot = availabilities.filter(
      (a) => a.timeslotId === timeslot.id
    );

    const actuallyAvailableUsers = usersAvailableInSlot.filter((user) => {
      const userInterviewIndices = userInterviews.get(user.userId);
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

    if (actuallyAvailableUsers.length >= 2) {
      const firstTimeCount = actuallyAvailableUsers.filter(
        (user) => user.isFirstTime
      ).length;

      if (firstTimeCount < 2) {
        availableTimeslots.push(timeslot.id);
      }
    }
  }

  return futureTimeslots.filter((ts) => availableTimeslots.includes(ts.id));
};
