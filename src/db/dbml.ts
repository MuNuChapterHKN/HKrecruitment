import * as schema from './schema';
import { pgGenerate } from 'drizzle-dbml-generator'; // Using Postgres for this example

const out = './schema.dbml';
const relational = true;

pgGenerate({ schema, out, relational });
