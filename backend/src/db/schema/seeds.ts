import { index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { decimal } from 'drizzle-orm/pg-core';

import { agrochemicalTypeEnum, seedTypeEnum } from './dataIngestion';
import { crops, cropVarieties } from './crops';

/** Commercial seeds — brands, suppliers, global catalog */
export const seeds = pgTable(
  'seeds',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    cropId: varchar('crop_id', { length: 40 })
      .notNull()
      .references(() => crops.id, { onDelete: 'cascade' }),
    varietyId: varchar('variety_id', { length: 80 }).references(() => cropVarieties.id, {
      onDelete: 'set null',
    }),
    name: varchar('name', { length: 200 }).notNull(),
    brand: varchar('brand', { length: 120 }),
    supplier: varchar('supplier', { length: 120 }),
    seedType: seedTypeEnum('seed_type').default('other'),
    country: varchar('country', { length: 80 }),
    region: varchar('region', { length: 80 }),
    germinationRate: varchar('germination_rate', { length: 40 }),
    maturityDays: varchar('maturity_days', { length: 40 }),
    seedRate: varchar('seed_rate', { length: 80 }),
    priceRange: varchar('price_range', { length: 80 }),
    source: varchar('source', { length: 40 }).notNull(),
    externalId: varchar('external_id', { length: 120 }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('seeds_crop_idx').on(t.cropId),
    index('seeds_variety_idx').on(t.varietyId),
    index('seeds_source_idx').on(t.source),
    index('seeds_country_idx').on(t.country),
  ],
);

/** Fertilizers, pesticides, soil amendments — synced from open ag databases */
export const agrochemicals = pgTable(
  'agrochemicals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cropId: varchar('crop_id', { length: 40 }).references(() => crops.id, { onDelete: 'set null' }),
    type: agrochemicalTypeEnum('type').notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    nameTe: varchar('name_te', { length: 200 }),
    activeIngredient: varchar('active_ingredient', { length: 200 }),
    npk: varchar('npk', { length: 40 }),
    dose: varchar('dose', { length: 120 }),
    method: varchar('method', { length: 120 }),
    timing: varchar('timing', { length: 160 }),
    target: varchar('target', { length: 160 }),
    stageId: varchar('stage_id', { length: 60 }),
    estimatedPrice: varchar('estimated_price', { length: 80 }),
    country: varchar('country', { length: 80 }),
    source: varchar('source', { length: 40 }).notNull(),
    externalId: varchar('external_id', { length: 120 }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('agrochemicals_crop_idx').on(t.cropId),
    index('agrochemicals_type_idx').on(t.type),
    index('agrochemicals_source_idx').on(t.source),
    uniqueIndex('agrochemicals_source_ext_idx').on(t.source, t.externalId),
  ],
);
