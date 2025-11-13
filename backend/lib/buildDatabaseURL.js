// lib/buildDatabaseURL.js
import { getSecret } from "./secrets.js";

/**
 * Build a PostgreSQL connection URL.
 * - In dev: use DATABASE_URL from .env directly.
 * - In prod: combine RDS host env var with credentials from AWS Secrets Manager.
 */
export async function buildDatabaseURL() {
    const env = process.env.NODE_ENV || "development";

    // === Local development ===
    if (env !== "production") {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL missing in development environment");
        }
        return process.env.DATABASE_URL;
    }

    // === Production (App Runner) ===
    const secretArn = process.env.DB_SECRET_ARN;
    const host = process.env.DATABASE_URL; // your env var contains the hostname
    const dbName = process.env.DATABASE_NAME;  // your actual database name
    const port = 5432;

    if (!secretArn) throw new Error("DB_SECRET_ARN not set in environment");
    if (!host) throw new Error("DATABASE_URL (host) missing in production environment");

    const secret = await getSecret(secretArn);

    if (!secret.username || !secret.password) {
        throw new Error("Secret missing username or password fields");
    }

    // Build full PostgreSQL connection URL
    const url = `postgresql://${encodeURIComponent(secret.username)}:${encodeURIComponent(secret.password)}@${host}:${port}/${dbName}`;
    return url;
}
