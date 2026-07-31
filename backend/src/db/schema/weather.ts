import {
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { weatherConditionEnum } from './enums';
import { farmers, lands } from './farmers';

/** Weather — cached snapshots per farmer / land / coordinates */
export const weather = pgTable(
  'weather',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    farmerId: uuid('farmer_id').references(() => farmers.id, { onDelete: 'cascade' }),
    landId: uuid('land_id').references(() => lands.id, { onDelete: 'set null' }),
    locationName: varchar('location_name', { length: 200 }).notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
    temperature: decimal('temperature', { precision: 5, scale: 2 }),
    feelsLike: decimal('feels_like', { precision: 5, scale: 2 }),
    condition: weatherConditionEnum('condition'),
    humidity: integer('humidity'),
    windSpeed: decimal('wind_speed', { precision: 6, scale: 2 }),
    pressure: decimal('pressure', { precision: 7, scale: 2 }),
    visibility: decimal('visibility', { precision: 6, scale: 2 }),
    uvIndex: decimal('uv_index', { precision: 4, scale: 2 }),
    precipitation: integer('precipitation'),
    hourly: jsonb('hourly').$type<unknown[]>().default([]),
    daily: jsonb('daily').$type<unknown[]>().default([]),
    agricultureTip: text('agriculture_tip'),
    fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('weather_farmer_idx').on(t.farmerId),
    index('weather_land_idx').on(t.landId),
    index('weather_coords_idx').on(t.latitude, t.longitude),
    index('weather_fetched_idx').on(t.fetchedAt),
  ],
);
