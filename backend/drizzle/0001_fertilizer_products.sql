-- Fertilizer product catalog (IFFCO, Coromandel, NFL, DoF standard grades)
CREATE TABLE IF NOT EXISTS "fertilizer_products" (
  "id" varchar(80) PRIMARY KEY NOT NULL,
  "name" varchar(160) NOT NULL,
  "name_te" varchar(200),
  "brand" varchar(80) NOT NULL,
  "category" varchar(60) NOT NULL,
  "npk" varchar(40),
  "nutrient" text,
  "dosage" varchar(200),
  "benefits" text,
  "crops" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "seasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "application" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "application_method" text,
  "precautions" text,
  "mrp" varchar(80),
  "pack_size" varchar(40),
  "image" varchar(120),
  "source" varchar(40) NOT NULL,
  "source_url" text,
  "is_subsidized" boolean DEFAULT true NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "last_synced_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "fertilizer_products_brand_idx" ON "fertilizer_products" ("brand");
CREATE INDEX IF NOT EXISTS "fertilizer_products_category_idx" ON "fertilizer_products" ("category");
CREATE INDEX IF NOT EXISTS "fertilizer_products_source_idx" ON "fertilizer_products" ("source");
CREATE INDEX IF NOT EXISTS "fertilizer_products_name_idx" ON "fertilizer_products" ("name");
