import { pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: varchar('id').primaryKey(),        // Cognito sub
    email: text('email').notNull().unique(),
    username: text('username'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow(),
    lastLoginAt: timestamp('last_login_at'),
});
