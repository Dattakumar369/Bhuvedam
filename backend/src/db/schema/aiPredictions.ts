import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { crops, cropVarieties } from './crops';
import { confidenceEnum, predictionTypeEnum } from './enums';
import { farmers, lands } from './farmers';

/** AI Predictions — price forecasts, yield, disease risk, spray advice */
export const aiPredictions = pgTable(
  'ai_predictions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    farmerId: uuid('farmer_id')
      .notNull()
      .references(() => farmers.id, { onDelete: 'cascade' }),
    landId: uuid('land_id').references(() => lands.id, { onDelete: 'set null' }),
    cropId: varchar('crop_id', { length: 40 }).references(() => crops.id, { onDelete: 'set null' }),
    varietyId: varchar('variety_id', { length: 80 }).references(() => cropVarieties.id, {
      onDelete: 'set null',
    }),
    predictionType: predictionTypeEnum('prediction_type').notNull(),
    title: varchar('title', { length: 200 }),
    summary: text('summary'),
    inputContext: jsonb('input_context').$type<Record<string, unknown>>().default({}),
    result: jsonb('result').$type<Record<string, unknown>>().notNull(),
    confidence: confidenceEnum('confidence').notNull().default('medium'),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('ai_predictions_farmer_idx').on(t.farmerId),
    index('ai_predictions_type_idx').on(t.predictionType),
    index('ai_predictions_crop_idx').on(t.cropId),
    index('ai_predictions_created_idx').on(t.createdAt),
  ],
);
