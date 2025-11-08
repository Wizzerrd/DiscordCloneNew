import { pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const servers = pgTable("servers", {
    id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name").notNull(),
    ownerId: varchar("owner_id").notNull(), // references users.id
    iconUrl: text("icon_url"),
    createdAt: timestamp("created_at").defaultNow(),
});
