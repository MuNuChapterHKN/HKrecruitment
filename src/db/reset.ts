import { reset } from 'drizzle-seed';
import { db, schema } from '.';

async function main() {
  await reset(db, schema);
}

main();
