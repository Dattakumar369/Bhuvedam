import { boolean, index, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { notificationTypeEnum } from './enums';
import { farmers } from './farmers';

/** Notifications — mandi alerts, spray reminders, order updates, AI insights */
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    farmerId: uuid('farmer_id')
      .notNull()
      .references(() => farmers.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    body: text('body').notNull(),
    data: jsonb('data').$type<Record<string, unknown>>().default({}),
    isRead: boolean('is_read').notNull().default(false),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('notifications_farmer_idx').on(t.farmerId),
    index('notifications_type_idx').on(t.type),
    index('notifications_read_idx').on(t.isRead),
    index('notifications_created_idx').on(t.createdAt),
  ],
);
