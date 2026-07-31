import { relations } from 'drizzle-orm';

import { aiPredictions } from './aiPredictions';
import { cropCalendar } from './cropCalendar';
import { cropVarieties, crops } from './crops';
import { diseaseSprays, diseases, fertilizers } from './fertilizers';
import { farmers, lands, surveyNumbers } from './farmers';
import { mandiPrices } from './mandiPrices';
import { notifications } from './notifications';
import { pushTokens } from './pushTokens';
import { orderItems, orders, payments } from './orders';
import { weather } from './weather';

export const farmersRelations = relations(farmers, ({ many }) => ({
  lands: many(lands),
  cropCalendars: many(cropCalendar),
  weatherSnapshots: many(weather),
  aiPredictions: many(aiPredictions),
  orders: many(orders),
  payments: many(payments),
  notifications: many(notifications),
  pushTokens: many(pushTokens),
}));

export const landsRelations = relations(lands, ({ one, many }) => ({
  farmer: one(farmers, { fields: [lands.farmerId], references: [farmers.id] }),
  surveyNumbers: many(surveyNumbers),
  cropCalendars: many(cropCalendar),
  weatherSnapshots: many(weather),
}));

export const surveyNumbersRelations = relations(surveyNumbers, ({ one }) => ({
  land: one(lands, { fields: [surveyNumbers.landId], references: [lands.id] }),
}));

export const cropsRelations = relations(crops, ({ many }) => ({
  varieties: many(cropVarieties),
  calendars: many(cropCalendar),
  fertilizers: many(fertilizers),
  diseases: many(diseases),
  mandiPrices: many(mandiPrices),
  aiPredictions: many(aiPredictions),
}));

export const cropVarietiesRelations = relations(cropVarieties, ({ one, many }) => ({
  crop: one(crops, { fields: [cropVarieties.cropId], references: [crops.id] }),
  calendars: many(cropCalendar),
  mandiPrices: many(mandiPrices),
  aiPredictions: many(aiPredictions),
}));

export const cropCalendarRelations = relations(cropCalendar, ({ one }) => ({
  farmer: one(farmers, { fields: [cropCalendar.farmerId], references: [farmers.id] }),
  land: one(lands, { fields: [cropCalendar.landId], references: [lands.id] }),
  crop: one(crops, { fields: [cropCalendar.cropId], references: [crops.id] }),
  variety: one(cropVarieties, { fields: [cropCalendar.varietyId], references: [cropVarieties.id] }),
}));

export const weatherRelations = relations(weather, ({ one }) => ({
  farmer: one(farmers, { fields: [weather.farmerId], references: [farmers.id] }),
  land: one(lands, { fields: [weather.landId], references: [lands.id] }),
}));

export const mandiPricesRelations = relations(mandiPrices, ({ one }) => ({
  crop: one(crops, { fields: [mandiPrices.cropId], references: [crops.id] }),
  variety: one(cropVarieties, { fields: [mandiPrices.varietyId], references: [cropVarieties.id] }),
}));

export const fertilizersRelations = relations(fertilizers, ({ one }) => ({
  crop: one(crops, { fields: [fertilizers.cropId], references: [crops.id] }),
}));

export const diseasesRelations = relations(diseases, ({ one, many }) => ({
  crop: one(crops, { fields: [diseases.cropId], references: [crops.id] }),
  sprays: many(diseaseSprays),
}));

export const diseaseSpraysRelations = relations(diseaseSprays, ({ one }) => ({
  disease: one(diseases, { fields: [diseaseSprays.diseaseId], references: [diseases.id] }),
}));

export const aiPredictionsRelations = relations(aiPredictions, ({ one }) => ({
  farmer: one(farmers, { fields: [aiPredictions.farmerId], references: [farmers.id] }),
  land: one(lands, { fields: [aiPredictions.landId], references: [lands.id] }),
  crop: one(crops, { fields: [aiPredictions.cropId], references: [crops.id] }),
  variety: one(cropVarieties, { fields: [aiPredictions.varietyId], references: [cropVarieties.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  farmer: one(farmers, { fields: [orders.farmerId], references: [farmers.id] }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
  farmer: one(farmers, { fields: [payments.farmerId], references: [farmers.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  farmer: one(farmers, { fields: [notifications.farmerId], references: [farmers.id] }),
}));

export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  farmer: one(farmers, { fields: [pushTokens.farmerId], references: [farmers.id] }),
}));
