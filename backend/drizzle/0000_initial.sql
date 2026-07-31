-- Bhuvedam initial schema for Neon PostgreSQL
-- Run: psql $DATABASE_URL -f drizzle/0000_initial.sql

CREATE TYPE "crop_season" AS ENUM ('kharif', 'rabi', 'year-round');
CREATE TYPE "calendar_stage" AS ENUM ('planned', 'sown', 'vegetative', 'flowering', 'harvesting', 'completed');
CREATE TYPE "prediction_type" AS ENUM ('price_forecast', 'yield_estimate', 'disease_risk', 'spray_advisory', 'weather_impact');
CREATE TYPE "order_status" AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE "payment_status" AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE "payment_method" AS ENUM ('upi', 'card', 'netbanking', 'cod', 'wallet');
CREATE TYPE "notification_type" AS ENUM ('mandi_alert', 'weather_alert', 'spray_reminder', 'fertilizer_reminder', 'order_update', 'payment_update', 'ai_insight', 'crop_calendar');
CREATE TYPE "spray_type" AS ENUM ('insecticide', 'fungicide', 'herbicide', 'bio', 'fertilizer_foliar');
CREATE TYPE "product_type" AS ENUM ('fertilizer', 'seed', 'spray', 'other');
CREATE TYPE "confidence_level" AS ENUM ('high', 'medium', 'low');
CREATE TYPE "weather_condition" AS ENUM ('clear', 'partlyCloudy', 'cloudy', 'rain', 'thunderstorm', 'fog', 'snow');

-- Farmers
CREATE TABLE "farmers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "phone" varchar(15) NOT NULL UNIQUE,
  "name" varchar(120) NOT NULL,
  "avatar_url" text,
  "language" varchar(10) DEFAULT 'te' NOT NULL,
  "location_label" varchar(200),
  "farm_size" varchar(50),
  "notes" jsonb DEFAULT '[]'::jsonb,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "farmers_phone_idx" ON "farmers" ("phone");

-- Lands
CREATE TABLE "lands" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "farmer_id" uuid NOT NULL REFERENCES "farmers"("id") ON DELETE cascade,
  "label" varchar(120) NOT NULL,
  "area_acres" numeric(10, 4),
  "village" varchar(120),
  "mandal" varchar(120),
  "district" varchar(120) NOT NULL,
  "state" varchar(120) DEFAULT 'Andhra Pradesh' NOT NULL,
  "soil_type" varchar(120),
  "latitude" numeric(10, 7),
  "longitude" numeric(10, 7),
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "lands_farmer_idx" ON "lands" ("farmer_id");
CREATE INDEX "lands_district_idx" ON "lands" ("district");

-- Survey Numbers
CREATE TABLE "survey_numbers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "land_id" uuid NOT NULL REFERENCES "lands"("id") ON DELETE cascade,
  "survey_number" varchar(60) NOT NULL,
  "sub_division" varchar(30),
  "extent_acres" numeric(10, 4),
  "revenue_village" varchar(120),
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "survey_numbers_land_idx" ON "survey_numbers" ("land_id");
CREATE INDEX "survey_numbers_number_idx" ON "survey_numbers" ("survey_number");

-- Crops
CREATE TABLE "crops" (
  "id" varchar(40) PRIMARY KEY NOT NULL,
  "name" varchar(80) NOT NULL,
  "name_te" varchar(120),
  "season" "crop_season" NOT NULL,
  "season_label" varchar(120),
  "sowing_period" varchar(80),
  "harvest_period" varchar(80),
  "water_needs" varchar(120),
  "soil_type" varchar(120),
  "tips" jsonb DEFAULT '[]'::jsonb,
  "icon" varchar(40),
  "color" varchar(20),
  "created_at" timestamptz DEFAULT now() NOT NULL
);

-- Crop Varieties
CREATE TABLE "crop_varieties" (
  "id" varchar(80) PRIMARY KEY NOT NULL,
  "crop_id" varchar(40) NOT NULL REFERENCES "crops"("id") ON DELETE cascade,
  "name" varchar(160) NOT NULL,
  "name_te" varchar(160),
  "aliases" jsonb DEFAULT '[]'::jsonb,
  "agmarknet_names" jsonb DEFAULT '[]'::jsonb,
  "is_curated" boolean DEFAULT false NOT NULL,
  "duration" varchar(80),
  "grain_type" varchar(80),
  "yield_potential" varchar(80),
  "reference_baseline_qtl" numeric(10, 2),
  "price_note" text,
  "price_note_te" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "crop_varieties_crop_idx" ON "crop_varieties" ("crop_id");
CREATE INDEX "crop_varieties_name_idx" ON "crop_varieties" ("name");

-- Crop Calendar
CREATE TABLE "crop_calendar" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "farmer_id" uuid NOT NULL REFERENCES "farmers"("id") ON DELETE cascade,
  "land_id" uuid REFERENCES "lands"("id") ON DELETE set null,
  "crop_id" varchar(40) NOT NULL REFERENCES "crops"("id") ON DELETE restrict,
  "variety_id" varchar(80) REFERENCES "crop_varieties"("id") ON DELETE set null,
  "variety_name" varchar(160),
  "sowing_date" date,
  "expected_harvest_date" date,
  "actual_harvest_date" date,
  "stage" "calendar_stage" DEFAULT 'planned' NOT NULL,
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "crop_calendar_farmer_idx" ON "crop_calendar" ("farmer_id");
CREATE INDEX "crop_calendar_land_idx" ON "crop_calendar" ("land_id");
CREATE INDEX "crop_calendar_crop_idx" ON "crop_calendar" ("crop_id");
CREATE INDEX "crop_calendar_sowing_idx" ON "crop_calendar" ("sowing_date");

-- Weather
CREATE TABLE "weather" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "farmer_id" uuid REFERENCES "farmers"("id") ON DELETE cascade,
  "land_id" uuid REFERENCES "lands"("id") ON DELETE set null,
  "location_name" varchar(200) NOT NULL,
  "latitude" numeric(10, 7) NOT NULL,
  "longitude" numeric(10, 7) NOT NULL,
  "temperature" numeric(5, 2),
  "feels_like" numeric(5, 2),
  "condition" "weather_condition",
  "humidity" integer,
  "wind_speed" numeric(6, 2),
  "pressure" numeric(7, 2),
  "visibility" numeric(6, 2),
  "uv_index" numeric(4, 2),
  "precipitation" integer,
  "hourly" jsonb DEFAULT '[]'::jsonb,
  "daily" jsonb DEFAULT '[]'::jsonb,
  "agriculture_tip" text,
  "fetched_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "weather_farmer_idx" ON "weather" ("farmer_id");
CREATE INDEX "weather_land_idx" ON "weather" ("land_id");
CREATE INDEX "weather_coords_idx" ON "weather" ("latitude", "longitude");
CREATE INDEX "weather_fetched_idx" ON "weather" ("fetched_at");

-- Mandi Prices
CREATE TABLE "mandi_prices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "crop_id" varchar(40) NOT NULL REFERENCES "crops"("id") ON DELETE restrict,
  "variety_id" varchar(80) REFERENCES "crop_varieties"("id") ON DELETE set null,
  "variety_name" varchar(160),
  "commodity" varchar(120) NOT NULL,
  "market" varchar(120) NOT NULL,
  "district" varchar(120) NOT NULL,
  "state" varchar(120) NOT NULL,
  "price_date" date NOT NULL,
  "min_price" numeric(12, 2) NOT NULL,
  "max_price" numeric(12, 2) NOT NULL,
  "modal_price" numeric(12, 2) NOT NULL,
  "unit" varchar(30) DEFAULT 'Quintal' NOT NULL,
  "arrival_qty" numeric(12, 2),
  "is_live" boolean DEFAULT true NOT NULL,
  "source" varchar(40) DEFAULT 'agmarknet' NOT NULL,
  "fetched_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "mandi_prices_unique_idx" ON "mandi_prices" ("crop_id", "variety_name", "market", "district", "state", "price_date");
CREATE INDEX "mandi_prices_crop_idx" ON "mandi_prices" ("crop_id");
CREATE INDEX "mandi_prices_variety_idx" ON "mandi_prices" ("variety_id");
CREATE INDEX "mandi_prices_date_idx" ON "mandi_prices" ("price_date");
CREATE INDEX "mandi_prices_state_district_idx" ON "mandi_prices" ("state", "district");

-- Fertilizers
CREATE TABLE "fertilizers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "crop_id" varchar(40) NOT NULL REFERENCES "crops"("id") ON DELETE cascade,
  "stage_id" varchar(60) NOT NULL,
  "name" varchar(120) NOT NULL,
  "name_te" varchar(160),
  "dose" varchar(120) NOT NULL,
  "method" varchar(120),
  "timing" varchar(160) NOT NULL,
  "estimated_price" varchar(80),
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "fertilizers_crop_idx" ON "fertilizers" ("crop_id");
CREATE INDEX "fertilizers_stage_idx" ON "fertilizers" ("stage_id");

-- Diseases
CREATE TABLE "diseases" (
  "id" varchar(80) PRIMARY KEY NOT NULL,
  "crop_id" varchar(40) NOT NULL REFERENCES "crops"("id") ON DELETE cascade,
  "name" varchar(120) NOT NULL,
  "name_te" varchar(160),
  "symptoms" text,
  "symptoms_te" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "diseases_crop_idx" ON "diseases" ("crop_id");

-- Disease Sprays
CREATE TABLE "disease_sprays" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "disease_id" varchar(80) NOT NULL REFERENCES "diseases"("id") ON DELETE cascade,
  "product_name" varchar(160) NOT NULL,
  "product_name_te" varchar(160),
  "type" "spray_type" NOT NULL,
  "target" varchar(120),
  "target_te" varchar(160),
  "dose" varchar(120),
  "how_to_spray" text,
  "how_to_spray_te" text,
  "best_time" varchar(120),
  "precautions" jsonb DEFAULT '[]'::jsonb,
  "precautions_te" jsonb DEFAULT '[]'::jsonb,
  "estimated_price" varchar(80),
  "where_to_buy" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "disease_sprays_disease_idx" ON "disease_sprays" ("disease_id");

-- AI Predictions
CREATE TABLE "ai_predictions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "farmer_id" uuid NOT NULL REFERENCES "farmers"("id") ON DELETE cascade,
  "land_id" uuid REFERENCES "lands"("id") ON DELETE set null,
  "crop_id" varchar(40) REFERENCES "crops"("id") ON DELETE set null,
  "variety_id" varchar(80) REFERENCES "crop_varieties"("id") ON DELETE set null,
  "prediction_type" "prediction_type" NOT NULL,
  "title" varchar(200),
  "summary" text,
  "input_context" jsonb DEFAULT '{}'::jsonb,
  "result" jsonb NOT NULL,
  "confidence" "confidence_level" DEFAULT 'medium' NOT NULL,
  "valid_until" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "ai_predictions_farmer_idx" ON "ai_predictions" ("farmer_id");
CREATE INDEX "ai_predictions_type_idx" ON "ai_predictions" ("prediction_type");
CREATE INDEX "ai_predictions_crop_idx" ON "ai_predictions" ("crop_id");
CREATE INDEX "ai_predictions_created_idx" ON "ai_predictions" ("created_at");

-- Orders
CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "farmer_id" uuid NOT NULL REFERENCES "farmers"("id") ON DELETE restrict,
  "order_number" varchar(30) NOT NULL UNIQUE,
  "status" "order_status" DEFAULT 'pending' NOT NULL,
  "total_amount" numeric(12, 2) NOT NULL,
  "currency" varchar(3) DEFAULT 'INR' NOT NULL,
  "shipping_address" jsonb,
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "orders_farmer_idx" ON "orders" ("farmer_id");
CREATE INDEX "orders_status_idx" ON "orders" ("status");
CREATE INDEX "orders_created_idx" ON "orders" ("created_at");

-- Order Items
CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE cascade,
  "product_type" "product_type" NOT NULL,
  "product_name" varchar(160) NOT NULL,
  "quantity" numeric(10, 2) NOT NULL,
  "unit" varchar(30) DEFAULT 'unit' NOT NULL,
  "unit_price" numeric(12, 2) NOT NULL,
  "total_price" numeric(12, 2) NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb
);
CREATE INDEX "order_items_order_idx" ON "order_items" ("order_id");

-- Payments
CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE restrict,
  "farmer_id" uuid NOT NULL REFERENCES "farmers"("id") ON DELETE restrict,
  "amount" numeric(12, 2) NOT NULL,
  "currency" varchar(3) DEFAULT 'INR' NOT NULL,
  "method" "payment_method" NOT NULL,
  "status" "payment_status" DEFAULT 'pending' NOT NULL,
  "transaction_id" varchar(120),
  "gateway_response" jsonb,
  "paid_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "payments_order_idx" ON "payments" ("order_id");
CREATE INDEX "payments_farmer_idx" ON "payments" ("farmer_id");
CREATE INDEX "payments_status_idx" ON "payments" ("status");

-- Notifications
CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "farmer_id" uuid NOT NULL REFERENCES "farmers"("id") ON DELETE cascade,
  "type" "notification_type" NOT NULL,
  "title" varchar(200) NOT NULL,
  "body" text NOT NULL,
  "data" jsonb DEFAULT '{}'::jsonb,
  "is_read" boolean DEFAULT false NOT NULL,
  "read_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "notifications_farmer_idx" ON "notifications" ("farmer_id");
CREATE INDEX "notifications_type_idx" ON "notifications" ("type");
CREATE INDEX "notifications_read_idx" ON "notifications" ("is_read");
CREATE INDEX "notifications_created_idx" ON "notifications" ("created_at");
