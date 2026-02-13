import { db, schema } from '@/db';
import { applicant } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { DEGREE_LEVELS, LANGUAGE_LEVELS } from '@/db/schema';

const appl = schema.applicant;

export const listAllApplicants = async (rid: string) =>
  await db
    .select()
    .from(appl)
    .where(eq(appl.recruitingSessionId, rid))
    .orderBy(desc(appl.createdAt));

export async function getApplicantById(id: string) {
  const rows = await db.select().from(applicant).where(eq(applicant.id, id));
  return rows.length ? rows[0] : null;
}

export const insertApplicantSchema = createInsertSchema(applicant)
  .pick({
    name: true,
    surname: true,
    email: true,
    gpa: true,
    degreeLevel: true,
    course: true,
    courseArea: true,
    italianLevel: true,
  })
  .extend({
    name: z.string().nonempty('Name is required'),
    surname: z.string().nonempty('Surname is required'),
    email: z.email('Invalid email'),
    gpa: z.number().min(0, 'GPA must be >= 0').max(30, 'GPA must be <= 30'),
    degreeLevel: z.enum([...DEGREE_LEVELS] as [string, ...string[]]),
    course: z.string().nonempty('Course is required'),
    courseArea: z.string().nonempty('Course area is required'),
    italianLevel: z.enum([...LANGUAGE_LEVELS] as [string, ...string[]]),
  });

export type InsertApplicant = z.infer<typeof insertApplicantSchema>;
