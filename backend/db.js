import pkg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // RDS requires SSL
});

export const db = drizzle(pool);
