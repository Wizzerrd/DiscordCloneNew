import { pgTable, varchar, timestamp, primaryKey, index } from "drizzle-orm/pg-core";

export const relationships = pgTable("relationships", {
    senderId: varchar("sender_id").notNull(),
    receiverId: varchar("receiver_id").notNull(),
    type: varchar("type").notNull().default("friend"), // 'friend' | 'blocked' | etc.
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.senderId, table.receiverId, table.type] }),
    senderIdx: index("idx_relationships_sender").on(table.senderId),
    receiverIdx: index("idx_relationships_receiver").on(table.receiverId),
}));
