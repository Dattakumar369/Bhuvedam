-- Extended fertilizer fields + ag catalog tables
ALTER TABLE "fertilizer_products" ADD COLUMN IF NOT EXISTS "type" varchar(60);
ALTER TABLE "fertilizer_products" ADD COLUMN IF NOT EXISTS "npk_ratio" varchar(40);
ALTER TABLE "fertilizer_products" ADD COLUMN IF NOT EXISTS "crop" varchar(300);
ALTER TABLE "fertilizer_products" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "fertilizer_products" ADD COLUMN IF NOT EXISTS "soil_type" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "fertilizer_products" ADD COLUMN IF NOT EXISTS "price" varchar(80);

CREATE TABLE IF NOT EXISTS "plant_diseases" (
  "id" varchar(80) PRIMARY KEY NOT NULL,
  "name" varchar(200) NOT NULL,
  "name_te" varchar(200),
  "crop_id" varchar(40) NOT NULL,
  "plant" varchar(80) NOT NULL,
  "plantvillage_label" varchar(200),
  "category" varchar(40) NOT NULL,
  "symptoms" text,
  "symptoms_te" text,
  "treatment" text,
  "treatment_te" text,
  "prevention" text,
  "prevention_te" text,
  "image_class" varchar(200),
  "has_dataset_images" varchar(10) DEFAULT 'yes',
  "source" varchar(40) NOT NULL,
  "source_url" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "last_synced_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "icar_guidelines" (
  "id" varchar(80) PRIMARY KEY NOT NULL,
  "category" varchar(60) NOT NULL,
  "crop_id" varchar(40),
  "title" varchar(300) NOT NULL,
  "title_te" varchar(300),
  "content" text NOT NULL,
  "season" varchar(40),
  "region" varchar(120) DEFAULT 'India',
  "source_url" text,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "last_synced_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ag_advisories" (
  "id" varchar(80) PRIMARY KEY NOT NULL,
  "type" varchar(60) NOT NULL,
  "title" varchar(300) NOT NULL,
  "title_te" varchar(300),
  "description" text NOT NULL,
  "state" varchar(80) DEFAULT 'All India',
  "season" varchar(40),
  "crop_tags" jsonb DEFAULT '[]'::jsonb,
  "source" varchar(40) NOT NULL,
  "source_url" text,
  "last_synced_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "soil_health_recommendations" (
  "id" varchar(80) PRIMARY KEY NOT NULL,
  "soil_type" varchar(80) NOT NULL,
  "nutrient_status" varchar(40) NOT NULL,
  "deficiency" varchar(120) NOT NULL,
  "fertilizer_recommendation" text NOT NULL,
  "dosage" varchar(200),
  "crops" jsonb DEFAULT '[]'::jsonb,
  "season" varchar(40),
  "description" text,
  "source" varchar(40) DEFAULT 'soil_health_card' NOT NULL,
  "source_url" text,
  "last_synced_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "plant_diseases_crop_idx" ON "plant_diseases" ("crop_id");
CREATE INDEX IF NOT EXISTS "icar_guidelines_category_idx" ON "icar_guidelines" ("category");
CREATE INDEX IF NOT EXISTS "ag_advisories_type_idx" ON "ag_advisories" ("type");
CREATE INDEX IF NOT EXISTS "soil_health_soil_type_idx" ON "soil_health_recommendations" ("soil_type");
