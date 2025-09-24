import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

export * as schema from './schema';
export const db = drizzle(process.env.DATABASE_URL!);
