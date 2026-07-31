import { pgEnum } from 'drizzle-orm/pg-core';

export const cropSeasonEnum = pgEnum('crop_season', ['kharif', 'rabi', 'year-round']);

export const calendarStageEnum = pgEnum('calendar_stage', [
  'planned',
  'sown',
  'vegetative',
  'flowering',
  'harvesting',
  'completed',
]);

export const predictionTypeEnum = pgEnum('prediction_type', [
  'price_forecast',
  'yield_estimate',
  'disease_risk',
  'spray_advisory',
  'weather_impact',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'success',
  'failed',
  'refunded',
]);

export const paymentMethodEnum = pgEnum('payment_method', ['upi', 'card', 'netbanking', 'cod', 'wallet']);

export const notificationTypeEnum = pgEnum('notification_type', [
  'mandi_alert',
  'weather_alert',
  'spray_reminder',
  'fertilizer_reminder',
  'order_update',
  'payment_update',
  'ai_insight',
  'crop_calendar',
]);

export const sprayTypeEnum = pgEnum('spray_type', [
  'insecticide',
  'fungicide',
  'herbicide',
  'bio',
  'fertilizer_foliar',
]);

export const productTypeEnum = pgEnum('product_type', ['fertilizer', 'seed', 'spray', 'other']);

export const confidenceEnum = pgEnum('confidence_level', ['high', 'medium', 'low']);

export const weatherConditionEnum = pgEnum('weather_condition', [
  'clear',
  'partlyCloudy',
  'cloudy',
  'rain',
  'thunderstorm',
  'fog',
  'snow',
]);
