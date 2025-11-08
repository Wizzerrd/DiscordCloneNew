import { pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { servers } from './servers.js';

export const channels = pgTable('channels', {
    id: varchar('id').primaryKey(),
    name: text('name').notNull(),
    serverId: varchar('server_id').notNull().references(() => servers.id),
    createdAt: timestamp('created_at').defaultNow(),
});
