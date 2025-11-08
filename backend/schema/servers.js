import { pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const servers = pgTable('servers', {
    id: varchar('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
});
