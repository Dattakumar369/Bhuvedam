import {
  boolean,
  decimal,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/** Curated mandi markets & ag input shops — fallback when Google Places key unavailable. */
export const agPlaces = pgTable(
  'ag_places',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    placeType: varchar('place_type', { length: 32 }).notNull(), // mandi | fertilizer_shop | seed_shop | dealer
    name: varchar('name', { length: 200 }).notNull(),
    district: varchar('district', { length: 120 }).notNull(),
    state: varchar('state', { length: 80 }).notNull().default('Andhra Pradesh'),
    address: varchar('address', { length: 300 }),
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    source: varchar('source', { length: 40 }).notNull().default('curated'),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('ag_places_type_idx').on(t.placeType),
    index('ag_places_state_district_idx').on(t.state, t.district),
    index('ag_places_coords_idx').on(t.latitude, t.longitude),
  ],
);

export type AgPlaceRow = typeof agPlaces.$inferSelect;
export type NewAgPlaceRow = typeof agPlaces.$inferInsert;
