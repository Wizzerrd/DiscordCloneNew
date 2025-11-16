import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { buildDatabaseURL } from "./lib/buildDatabaseURL.js";

let poolInstance;   // global cached instance
let drizzleInstance; // drizzle wrapper cached as well

export async function getDb() {
    // If already initialized, reuse it
    if (drizzleInstance) return drizzleInstance;

    const DATABASE_URL = await buildDatabaseURL(DATABASE_NAME);

    if (!poolInstance) {
        poolInstance = new pg.Pool({
            connectionString: DATABASE_URL,
            max: 4,                 // good for Lambda
            idleTimeoutMillis: 30000,
            ssl: {
                rejectUnauthorized: false, // typical for RDS + Lambda
            },
        });
    }

    drizzleInstance = drizzle(poolInstance);
    return drizzleInstance;
}
