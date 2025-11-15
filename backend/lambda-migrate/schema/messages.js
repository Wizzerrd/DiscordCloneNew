import { pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { channels } from './channels.js';

export const messages = pgTable('messages', {
    id: varchar('id').primaryKey(),
    content: text('content').notNull(),
    userId: varchar('user_id').notNull().references(() => users.id),
    channelId: varchar('channel_id').notNull().references(() => channels.id),
    createdAt: timestamp('created_at').defaultNow(),
});
