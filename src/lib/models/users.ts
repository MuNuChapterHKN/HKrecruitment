import { db, schema } from "@/db"

export const listAllUsers = async () => await db.select().from(schema.user)
