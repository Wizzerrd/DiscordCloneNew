process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as schema from "./schema/index.js";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { buildDatabaseURL } from "./lib/buildDatabaseURL.js";

import pkg from "pg";
const { Pool } = pkg;


export const handler = async () => {
    console.log("➡️ Migration Lambda starting...");

    try {
        const url = await buildDatabaseURL();
        console.log("🔐 Using DB URL:", url.replace(/:.+?@/, ":****@"));

        const pool = new Pool({
            connectionString: url,
            ssl: { rejectUnauthorized: false },
        });

        const db = (await import("drizzle-orm/node-postgres")).drizzle(pool, { schema });

        console.log("🚀 Running Drizzle migrations...");

        await migrate(db, {
            migrationsFolder: "/var/task/drizzle"
        });

        return {
            statusCode: 200,
            body: "Migration complete"
        };
    } catch (err) {
        console.error("❌ Migration failed:", err);
        return {
            statusCode: 500,
            body: err.message
        };
    }
};
