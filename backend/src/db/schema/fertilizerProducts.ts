import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/** Indian fertilizer product catalog — IFFCO, Coromandel, NFL, DoF standard grades */
export const fertilizerProducts = pgTable(
  'fertilizer_products',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    nameTe: varchar('name_te', { length: 200 }),
    brand: varchar('brand', { length: 80 }).notNull(),
    category: varchar('category', { length: 60 }).notNull(),
    /** User-facing type alias (Nitrogen, NPK Complex, etc.) */
    type: varchar('type', { length: 60 }),
    npk: varchar('npk', { length: 40 }),
    npkRatio: varchar('npk_ratio', { length: 40 }),
    nutrient: text('nutrient'),
    dosage: varchar('dosage', { length: 200 }),
    /** Primary crops as comma-separated label */
    crop: varchar('crop', { length: 300 }),
    benefits: text('benefits'),
    description: text('description'),
    crops: jsonb('crops').$type<string[]>().notNull().default([]),
    soilType: jsonb('soil_type').$type<string[]>().notNull().default([]),
    seasons: jsonb('seasons').$type<string[]>().notNull().default([]),
    application: jsonb('application').$type<string[]>().notNull().default([]),
    applicationMethod: text('application_method'),
    precautions: text('precautions'),
    mrp: varchar('mrp', { length: 80 }),
    price: varchar('price', { length: 80 }),
    packSize: varchar('pack_size', { length: 40 }),
    image: varchar('image', { length: 120 }),
    source: varchar('source', { length: 40 }).notNull(),
    sourceUrl: text('source_url'),
    isSubsidized: boolean('is_subsidized').notNull().default(true),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('fertilizer_products_brand_idx').on(t.brand),
    index('fertilizer_products_category_idx').on(t.category),
    index('fertilizer_products_source_idx').on(t.source),
    index('fertilizer_products_name_idx').on(t.name),
  ],
);
