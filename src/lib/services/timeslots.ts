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
  const allTimeslots = await findAll(rid);

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
    .select()
    .from(schema.interviewerAvailability)
    .innerJoin(
      schema.timeslot,
      eq(schema.interviewerAvailability.timeslotId, schema.timeslot.id)
    )
    .where(eq(schema.timeslot.recruitingSessionId, rid));

  const availableTimeslots: string[] = [];

  for (const timeslot of allTimeslots) {
    const currentIndex = timeslotIndices.get(timeslot.id)!;

    const usersAvailableInSlot = availabilities
      .filter((a) => a.interviewer_availability.timeslotId === timeslot.id)
      .map((a) => a.interviewer_availability.userId);

    const actuallyAvailableUsers = usersAvailableInSlot.filter((userId) => {
      const userInterviewIndices = userInterviews.get(userId);
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
      availableTimeslots.push(timeslot.id);
    }
  }

  return allTimeslots.filter((ts) => availableTimeslots.includes(ts.id));
};
