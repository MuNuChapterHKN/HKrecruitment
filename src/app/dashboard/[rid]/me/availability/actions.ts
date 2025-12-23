'use server';

import { db } from '@/db';
import { interviewerAvailability, timeslot } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// ID finto come concordato con Pascal
const AUTHENTICATED_USER_ID = '1';

export async function saveAvailability(slots: { day: string; hour: string }[]) {
  if (!slots || slots.length === 0) {
    return { inserted: 0 };
  }

  // converte gli slot in timestamps
  const timestamps = slots.map((slot) => {
    return new Date(`2025-01-01T${slot.hour}:00Z`);
  });

  // trova i timeslot nel DB
  const matchedTimeslots = await db
    .select()
    .from(timeslot)
    .where(and(...timestamps.map((ts) => eq(timeslot.startingFrom, ts))));

  if (matchedTimeslots.length === 0) {
    throw new Error('Nessun timeslot trovato nel DB.');
  }

  // inserimento availability
  const valuesToInsert = matchedTimeslots.map((ts) => ({
    userId: AUTHENTICATED_USER_ID,
    timeslotId: ts.id,
    isFirstTime: true,
  }));

  await db.insert(interviewerAvailability).values(valuesToInsert);

  return { inserted: valuesToInsert.length };
}
