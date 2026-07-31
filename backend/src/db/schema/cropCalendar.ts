import { date, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { crops, cropVarieties } from './crops';
import { calendarStageEnum } from './enums';
import { farmers, lands } from './farmers';

/** Crop Calendar — sowing/harvest schedule per farmer, land, crop & variety */
export const cropCalendar = pgTable(
  'crop_calendar',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    farmerId: uuid('farmer_id')
      .notNull()
      .references(() => farmers.id, { onDelete: 'cascade' }),
    landId: uuid('land_id').references(() => lands.id, { onDelete: 'set null' }),
    cropId: varchar('crop_id', { length: 40 })
      .notNull()
      .references(() => crops.id, { onDelete: 'restrict' }),
    varietyId: varchar('variety_id', { length: 80 }).references(() => cropVarieties.id, {
      onDelete: 'set null',
    }),
    varietyName: varchar('variety_name', { length: 160 }),
    sowingDate: date('sowing_date'),
    expectedHarvestDate: date('expected_harvest_date'),
    actualHarvestDate: date('actual_harvest_date'),
    stage: calendarStageEnum('stage').notNull().default('planned'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('crop_calendar_farmer_idx').on(t.farmerId),
    index('crop_calendar_land_idx').on(t.landId),
    index('crop_calendar_crop_idx').on(t.cropId),
    index('crop_calendar_sowing_idx').on(t.sowingDate),
  ],
);
