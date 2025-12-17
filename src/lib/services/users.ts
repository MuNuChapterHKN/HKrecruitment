import { db, schema } from '@/db';
import { asc } from 'drizzle-orm';

export const listAllUsers = async () =>
  await db.select().from(schema.user).orderBy(asc(schema.user.name));
