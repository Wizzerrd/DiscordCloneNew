import { pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { servers } from './servers.js';

export const serverMembers = pgTable('server_members', {
    id: varchar('id').primaryKey(),
    userId: varchar('user_id').notNull().references(() => users.id),
    serverId: varchar('server_id').notNull().references(() => servers.id),
    role: text('role').default('member'),
    joinedAt: timestamp('joined_at').defaultNow(),
});
