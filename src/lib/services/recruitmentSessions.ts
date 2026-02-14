import { db, schema } from '@/db';
import { and, desc, eq, gte, lt, lte } from 'drizzle-orm';

const rs = schema.recruitingSession;

export const findOne = async (id: string) => {
  const res = await db
    .select()
    .from(rs)
    .where(eq(rs.id, id))
    .catch(() => null);

  if (!res || res.length < 1) return null;
  return res.at(0);
};

export const findAllAsOptions = async () => {
  const res = await db
    .select({
      id: rs.id,
      year: rs.year,
      semester: rs.semester,
    })
    .from(rs)
    .orderBy(desc(rs.year), desc(rs.semester));

  return res;
};

export const findLatest = async () => {
  const res = await db
    .select()
    .from(rs)
    .orderBy(desc(rs.year), desc(rs.semester))
    .limit(1)
    .catch(() => null);

  if (!res || res.length < 1) return null;
  return res.at(0);
};

export const findActive = async () => {
  const now = new Date();
  const res = await db
    .select()
    .from(rs)
    .where(and(lte(rs.start_date, now), gte(rs.end_date, now)))
    .orderBy(desc(rs.year), desc(rs.semester))
    .limit(1)
    .catch(() => null);

  if (!res || res.length < 1) return null;
  return res.at(0);
};

export const findLatestPast = async () => {
  const now = new Date();
  const res = await db
    .select()
    .from(rs)
    .where(lt(rs.end_date, now))
    .orderBy(desc(rs.year), desc(rs.semester))
    .limit(1)
    .catch(() => null);

  if (!res || res.length < 1) return null;
  return res.at(0);
};
