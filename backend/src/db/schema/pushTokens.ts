import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { farmers } from './farmers';

/** Expo push tokens — one farmer can have multiple devices */
export const pushTokens = pgTable(
  'push_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    farmerId: uuid('farmer_id')
      .notNull()
      .references(() => farmers.id, { onDelete: 'cascade' }),
    expoPushToken: text('expo_push_token').notNull(),
    platform: varchar('platform', { length: 20 }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('push_tokens_expo_idx').on(t.expoPushToken),
    index('push_tokens_farmer_idx').on(t.farmerId),
  ],
);
