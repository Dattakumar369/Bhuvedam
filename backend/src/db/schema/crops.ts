import {
  boolean,
  decimal,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { cropSeasonEnum } from './enums';

/** Crops — synced from FAO FAOSTAT + Agmarknet (global catalog) */
export const crops = pgTable('crops', {
  id: varchar('id', { length: 40 }).primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  nameTe: varchar('name_te', { length: 160 }),
  season: cropSeasonEnum('season'),
  seasonLabel: varchar('season_label', { length: 120 }),
  category: varchar('category', { length: 80 }),
  sowingPeriod: varchar('sowing_period', { length: 80 }),
  harvestPeriod: varchar('harvest_period', { length: 80 }),
  waterNeeds: varchar('water_needs', { length: 120 }),
  soilType: varchar('soil_type', { length: 120 }),
  tips: jsonb('tips').$type<string[]>().default([]),
  searchAliases: jsonb('search_aliases').$type<string[]>().default([]),
  /** AI-cached farmer-friendly names per language code (te, hi, ta, ...) */
  localizedNames: jsonb('localized_names').$type<Record<string, string>>().default({}),
  description: text('description'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  icon: varchar('icon', { length: 40 }),
  color: varchar('color', { length: 20 }),
  source: varchar('source', { length: 40 }).notNull().default('fao'),
  externalId: varchar('external_id', { length: 80 }),
  regionScope: varchar('region_scope', { length: 80 }).default('global'),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Crop varieties — hundreds per crop; curated + Agmarknet-discovered */
export const cropVarieties = pgTable(
  'crop_varieties',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    cropId: varchar('crop_id', { length: 40 })
      .notNull()
      .references(() => crops.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 160 }).notNull(),
    nameTe: varchar('name_te', { length: 160 }),
    aliases: jsonb('aliases').$type<string[]>().default([]),
    agmarknetNames: jsonb('agmarknet_names').$type<string[]>().default([]),
    isCurated: boolean('is_curated').notNull().default(false),
    source: varchar('source', { length: 40 }).notNull().default('agmarknet'),
    externalId: varchar('external_id', { length: 120 }),
    country: varchar('country', { length: 80 }),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    duration: varchar('duration', { length: 80 }),
    grainType: varchar('grain_type', { length: 80 }),
    yieldPotential: varchar('yield_potential', { length: 80 }),
    referenceBaselineQtl: decimal('reference_baseline_qtl', { precision: 10, scale: 2 }),
    priceNote: text('price_note'),
    priceNoteTe: text('price_note_te'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('crop_varieties_crop_idx').on(t.cropId),
    index('crop_varieties_name_idx').on(t.name),
  ],
);
