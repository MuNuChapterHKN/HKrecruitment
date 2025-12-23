import { db, schema } from '@/db';

export const findAll = async () => await db.select().from(schema.timeslot);
