import { index, jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

/** PlantVillage + ICAR plant disease catalog */
export const plantDiseases = pgTable(
  'plant_diseases',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    nameTe: varchar('name_te', { length: 200 }),
    cropId: varchar('crop_id', { length: 40 }).notNull(),
    plant: varchar('plant', { length: 80 }).notNull(),
    plantvillageLabel: varchar('plantvillage_label', { length: 200 }),
    category: varchar('category', { length: 40 }).notNull(),
    symptoms: text('symptoms'),
    symptomsTe: text('symptoms_te'),
    treatment: text('treatment'),
    treatmentTe: text('treatment_te'),
    prevention: text('prevention'),
    preventionTe: text('prevention_te'),
    imageClass: varchar('image_class', { length: 200 }),
    hasDatasetImages: varchar('has_dataset_images', { length: 10 }).default('yes'),
    source: varchar('source', { length: 40 }).notNull(),
    sourceUrl: text('source_url'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('plant_diseases_crop_idx').on(t.cropId),
    index('plant_diseases_plant_idx').on(t.plant),
    index('plant_diseases_source_idx').on(t.source),
    index('plant_diseases_category_idx').on(t.category),
  ],
);

/** ICAR crop, fertilizer, disease and pest guidelines */
export const icarGuidelines = pgTable(
  'icar_guidelines',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    category: varchar('category', { length: 60 }).notNull(),
    cropId: varchar('crop_id', { length: 40 }),
    title: varchar('title', { length: 300 }).notNull(),
    titleTe: varchar('title_te', { length: 300 }),
    content: text('content').notNull(),
    season: varchar('season', { length: 40 }),
    region: varchar('region', { length: 120 }).default('India'),
    sourceUrl: text('source_url'),
    tags: jsonb('tags').$type<string[]>().default([]),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('icar_guidelines_category_idx').on(t.category),
    index('icar_guidelines_crop_idx').on(t.cropId),
  ],
);

/** Ministry of Agriculture advisories, schemes, crop & fertilizer guidance */
export const agAdvisories = pgTable(
  'ag_advisories',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    type: varchar('type', { length: 60 }).notNull(),
    title: varchar('title', { length: 300 }).notNull(),
    titleTe: varchar('title_te', { length: 300 }),
    description: text('description').notNull(),
    state: varchar('state', { length: 80 }).default('All India'),
    season: varchar('season', { length: 40 }),
    cropTags: jsonb('crop_tags').$type<string[]>().default([]),
    source: varchar('source', { length: 40 }).notNull(),
    sourceUrl: text('source_url'),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('ag_advisories_type_idx').on(t.type),
    index('ag_advisories_source_idx').on(t.source),
  ],
);

/** Soil Health Card — nutrient-based fertilizer recommendations */
export const soilHealthRecommendations = pgTable(
  'soil_health_recommendations',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    soilType: varchar('soil_type', { length: 80 }).notNull(),
    nutrientStatus: varchar('nutrient_status', { length: 40 }).notNull(),
    deficiency: varchar('deficiency', { length: 120 }).notNull(),
    fertilizerRecommendation: text('fertilizer_recommendation').notNull(),
    dosage: varchar('dosage', { length: 200 }),
    crops: jsonb('crops').$type<string[]>().default([]),
    season: varchar('season', { length: 40 }),
    description: text('description'),
    source: varchar('source', { length: 40 }).notNull().default('soil_health_card'),
    sourceUrl: text('source_url'),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('soil_health_soil_type_idx').on(t.soilType),
    index('soil_health_deficiency_idx').on(t.deficiency),
  ],
);
