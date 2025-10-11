import { db, schema } from "@/db";

export const listAllApplicants = async () => await db.select().from(schema.applicant);
