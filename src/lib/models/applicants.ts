import { db, schema } from '@/db';
import { applicant } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const listAllApplicants = async () =>
  await db.select().from(schema.applicant);

export async function getApplicantById(id: string) {
  const rows = await db.select().from(applicant).where(eq(applicant.id, id));
  return rows.length ? rows[0] : null;
}
