import pkg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
const { Pool } = pkg;

import { buildDatabaseURL } from "./lib/buildDatabaseURL.js";

const DATABASE_URL = await buildDatabaseURL();

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // RDS requires SSL
});

export const db = drizzle(pool);
