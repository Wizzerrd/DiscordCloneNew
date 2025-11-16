process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { buildDatabaseURL } from "./lib/buildDatabaseURL.js";

import pkg from "pg";
const { Client } = pkg;

export const handler = async () => {
    console.log("➡️ Migration Lambda starting...");

    const url = await buildDatabaseURL();
    console.log("DB URL resolved:", url);

    // ❗ MUST use Client, not Pool
    const client = new Client({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    // This will now work
    const db = drizzle(client);

    try {
        console.log("🚀 Running Drizzle migrations…");

        await migrate(db, {
            migrationsFolder: "/var/task/drizzle",
        });

        console.log("✅ Migration complete");

        return {
            statusCode: 200,
            body: "Migration complete",
        };
    } catch (err) {
        console.error("❌ Migration failed:", err);
        return {
            statusCode: 500,
            body: err.message,
        };
    } finally {
        // VERY IMPORTANT
        await client.end();
    }
};
