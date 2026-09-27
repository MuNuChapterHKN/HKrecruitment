import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

export * as schema from './schema';
export const db = drizzle(process.env.DATABASE_URL!);

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DbExecutor = typeof db | DbTransaction;
