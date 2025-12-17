'use server';

import { db } from '@/db';
import { timeslot } from '@/db/schema';

export async function getTimeslots() {
  return await db.select().from(timeslot);
}
