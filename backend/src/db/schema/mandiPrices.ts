import {
  boolean,
  date,
  decimal,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { crops, cropVarieties } from './crops';

/** Mandi Prices — variety-wise daily market rates (Agmarknet cache) */
export const mandiPrices = pgTable(
  'mandi_prices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cropId: varchar('crop_id', { length: 40 })
      .notNull()
      .references(() => crops.id, { onDelete: 'restrict' }),
    varietyId: varchar('variety_id', { length: 80 }).references(() => cropVarieties.id, {
      onDelete: 'set null',
    }),
    varietyName: varchar('variety_name', { length: 160 }),
    commodity: varchar('commodity', { length: 120 }).notNull(),
    market: varchar('market', { length: 120 }).notNull(),
    district: varchar('district', { length: 120 }).notNull(),
    state: varchar('state', { length: 120 }).notNull(),
    priceDate: date('price_date').notNull(),
    minPrice: decimal('min_price', { precision: 12, scale: 2 }).notNull(),
    maxPrice: decimal('max_price', { precision: 12, scale: 2 }).notNull(),
    modalPrice: decimal('modal_price', { precision: 12, scale: 2 }).notNull(),
    unit: varchar('unit', { length: 30 }).notNull().default('Quintal'),
    arrivalQty: decimal('arrival_qty', { precision: 12, scale: 2 }),
    isLive: boolean('is_live').notNull().default(true),
    source: varchar('source', { length: 40 }).notNull().default('agmarknet'),
    fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('mandi_prices_unique_idx').on(
      t.cropId,
      t.varietyName,
      t.market,
      t.district,
      t.state,
      t.priceDate,
    ),
    index('mandi_prices_crop_idx').on(t.cropId),
    index('mandi_prices_variety_idx').on(t.varietyId),
    index('mandi_prices_date_idx').on(t.priceDate),
    index('mandi_prices_state_district_idx').on(t.state, t.district),
  ],
);
