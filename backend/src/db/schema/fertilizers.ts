import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { crops } from './crops';
import { sprayTypeEnum } from './enums';

/** Fertilizers — reference recommendations by crop & growth stage */
export const fertilizers = pgTable(
  'fertilizers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cropId: varchar('crop_id', { length: 40 })
      .notNull()
      .references(() => crops.id, { onDelete: 'cascade' }),
    stageId: varchar('stage_id', { length: 60 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    nameTe: varchar('name_te', { length: 160 }),
    dose: varchar('dose', { length: 120 }).notNull(),
    method: varchar('method', { length: 120 }),
    timing: varchar('timing', { length: 160 }).notNull(),
    estimatedPrice: varchar('estimated_price', { length: 80 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('fertilizers_crop_idx').on(t.cropId),
    index('fertilizers_stage_idx').on(t.stageId),
  ],
);

/** Diseases — crop diseases / pests with symptoms */
export const diseases = pgTable(
  'diseases',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    cropId: varchar('crop_id', { length: 40 })
      .notNull()
      .references(() => crops.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 120 }).notNull(),
    nameTe: varchar('name_te', { length: 160 }),
    symptoms: text('symptoms'),
    symptomsTe: text('symptoms_te'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('diseases_crop_idx').on(t.cropId)],
);

/** Disease sprays — treatment products linked to a disease */
export const diseaseSprays = pgTable(
  'disease_sprays',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    diseaseId: varchar('disease_id', { length: 80 })
      .notNull()
      .references(() => diseases.id, { onDelete: 'cascade' }),
    productName: varchar('product_name', { length: 160 }).notNull(),
    productNameTe: varchar('product_name_te', { length: 160 }),
    type: sprayTypeEnum('type').notNull(),
    target: varchar('target', { length: 120 }),
    targetTe: varchar('target_te', { length: 160 }),
    dose: varchar('dose', { length: 120 }),
    howToSpray: text('how_to_spray'),
    howToSprayTe: text('how_to_spray_te'),
    bestTime: varchar('best_time', { length: 120 }),
    precautions: jsonb('precautions').$type<string[]>().default([]),
    precautionsTe: jsonb('precautions_te').$type<string[]>().default([]),
    estimatedPrice: varchar('estimated_price', { length: 80 }),
    whereToBuy: jsonb('where_to_buy').$type<string[]>().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('disease_sprays_disease_idx').on(t.diseaseId)],
);
