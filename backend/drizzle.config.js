import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv';

dotenv.config()

console.log(process.env.FULL_DB_CONN_STRING)

export default defineConfig({
    schema: "./schema/index.js",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.FULL_DB_CONN_STRING,
        ssl: {
            rejectUnauthorized: false,
        },
    },
    migrations: {
        table: 'journal',
        schema: 'public',
    },
});