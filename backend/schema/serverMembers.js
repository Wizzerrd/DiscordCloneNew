import { pgTable, varchar, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const serverMembers = pgTable("server_members", {
    serverId: varchar("server_id").notNull(),
    userId: varchar("user_id").notNull(),
    role: varchar("role").default("member"), // roles: owner, admin, member
    joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.serverId, table.userId] }),
}));
