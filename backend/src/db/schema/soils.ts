import { index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { decimal } from 'drizzle-orm/pg-core';

import { farmers, lands } from './farmers';

/** Global soil data cache — SoilGrids / lab results keyed by location */
export const soils = pgTable(
  'soils',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    geoKey: varchar('geo_key', { length: 24 }).notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
    depthCm: varchar('depth_cm', { length: 20 }).notNull().default('0-5cm'),
    ph: decimal('ph', { precision: 4, scale: 2 }),
    nitrogenGkg: decimal('nitrogen_gkg', { precision: 8, scale: 4 }),
    organicCarbonGkg: decimal('organic_carbon_gkg', { precision: 8, scale: 4 }),
    clayPercent: decimal('clay_percent', { precision: 6, scale: 2 }),
    sandPercent: decimal('sand_percent', { precision: 6, scale: 2 }),
    siltPercent: decimal('silt_percent', { precision: 6, scale: 2 }),
    cecCmol: decimal('cec_cmol', { precision: 8, scale: 4 }),
    bulkDensity: decimal('bulk_density', { precision: 8, scale: 4 }),
    textureClass: varchar('texture_class', { length: 40 }),
    wrbClass: varchar('wrb_class', { length: 80 }),
    source: varchar('source', { length: 40 }).notNull().default('soilgrids'),
    rawData: jsonb('raw_data').$type<Record<string, unknown>>().default({}),
    fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('soils_geo_depth_idx').on(t.geoKey, t.depthCm),
    index('soils_coords_idx').on(t.latitude, t.longitude),
  ],
);

/** Farmer land soil tests — lab / field measurements */
export const soilReadings = pgTable(
  'soil_readings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    farmerId: uuid('farmer_id').references(() => farmers.id, { onDelete: 'cascade' }),
    landId: uuid('land_id').references(() => lands.id, { onDelete: 'cascade' }),
    latitude: decimal('latitude', { precision: 10, scale: 7 }),
    longitude: decimal('longitude', { precision: 10, scale: 7 }),
    ph: decimal('ph', { precision: 4, scale: 2 }),
    nitrogen: decimal('nitrogen', { precision: 8, scale: 4 }),
    phosphorus: decimal('phosphorus', { precision: 8, scale: 4 }),
    potassium: decimal('potassium', { precision: 8, scale: 4 }),
    organicMatter: decimal('organic_matter', { precision: 6, scale: 2 }),
    moisture: decimal('moisture', { precision: 6, scale: 2 }),
    salinity: decimal('salinity', { precision: 6, scale: 2 }),
    notes: text('notes'),
    source: varchar('source', { length: 40 }).notNull().default('field_test'),
    testedAt: timestamp('tested_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('soil_readings_farmer_idx').on(t.farmerId),
    index('soil_readings_land_idx').on(t.landId),
  ],
);
