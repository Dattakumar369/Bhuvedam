import { index, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

/** Admin broadcast log — one row per mass update/notification */
export const adminBroadcasts = pgTable(
  'admin_broadcasts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 200 }).notNull(),
    body: text('body').notNull(),
    type: varchar('type', { length: 40 }).notNull().default('ai_insight'),
    recipientCount: integer('recipient_count').notNull().default(0),
    pushSent: integer('push_sent').notNull().default(0),
    createdBy: varchar('created_by', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('admin_broadcasts_created_idx').on(t.createdAt)],
);
