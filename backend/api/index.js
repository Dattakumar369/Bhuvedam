"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target2, all) => {
  for (var name in all)
    __defProp(target2, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc8) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc8 = __getOwnPropDesc(from, key)) || desc8.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target2) => (target2 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target2, "default", { value: mod, enumerable: true }) : target2,
  mod
));

// src/config/env.ts
function loadEnv() {
  (0, import_dotenv.config)({ path: import_path.default.resolve(process.cwd(), ".env") });
  (0, import_dotenv.config)({ path: import_path.default.resolve(process.cwd(), "../.env") });
}
function getDataGovApiKey() {
  return process.env.DATA_GOV_API_KEY?.trim() || process.env.EXPO_PUBLIC_DATA_GOV_API_KEY?.trim() || "";
}
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not set \u2014 add it in Vercel/Railway environment variables");
  }
  return url;
}
var import_dotenv, import_path;
var init_env = __esm({
  "src/config/env.ts"() {
    "use strict";
    import_dotenv = require("dotenv");
    import_path = __toESM(require("path"), 1);
  }
});

// src/db/schema/knowledge.ts
var import_pg_core, knowledgeTypeEnum;
var init_knowledge = __esm({
  "src/db/schema/knowledge.ts"() {
    "use strict";
    import_pg_core = require("drizzle-orm/pg-core");
    knowledgeTypeEnum = (0, import_pg_core.pgEnum)("knowledge_type", [
      "research",
      "disease",
      "pest",
      "pesticide",
      "fertilizer",
      "book",
      "guide",
      "scientist_insight",
      "soil",
      "general"
    ]);
  }
});

// src/db/schema/agKnowledge.ts
var import_pg_core2, agKnowledge;
var init_agKnowledge = __esm({
  "src/db/schema/agKnowledge.ts"() {
    "use strict";
    import_pg_core2 = require("drizzle-orm/pg-core");
    init_knowledge();
    agKnowledge = (0, import_pg_core2.pgTable)(
      "ag_knowledge",
      {
        id: (0, import_pg_core2.uuid)("id").primaryKey().defaultRandom(),
        type: knowledgeTypeEnum("type").notNull(),
        title: (0, import_pg_core2.varchar)("title", { length: 500 }).notNull(),
        summary: (0, import_pg_core2.text)("summary"),
        content: (0, import_pg_core2.text)("content"),
        authors: (0, import_pg_core2.jsonb)("authors").$type().default([]),
        source: (0, import_pg_core2.varchar)("source", { length: 40 }).notNull(),
        externalId: (0, import_pg_core2.varchar)("external_id", { length: 200 }).notNull(),
        url: (0, import_pg_core2.text)("url"),
        tags: (0, import_pg_core2.jsonb)("tags").$type().default([]),
        cropTags: (0, import_pg_core2.jsonb)("crop_tags").$type().default([]),
        publishedAt: (0, import_pg_core2.timestamp)("published_at", { withTimezone: true }),
        citationCount: (0, import_pg_core2.integer)("citation_count").default(0),
        metadata: (0, import_pg_core2.jsonb)("metadata").$type().default({}),
        syncedAt: (0, import_pg_core2.timestamp)("synced_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core2.uniqueIndex)("ag_knowledge_source_ext_idx").on(t.source, t.externalId),
        (0, import_pg_core2.index)("ag_knowledge_type_idx").on(t.type),
        (0, import_pg_core2.index)("ag_knowledge_title_idx").on(t.title),
        (0, import_pg_core2.index)("ag_knowledge_citations_idx").on(t.citationCount)
      ]
    );
  }
});

// src/db/schema/dataIngestion.ts
var import_pg_core3, dataSourceTypeEnum, syncStatusEnum, agrochemicalTypeEnum, seedTypeEnum;
var init_dataIngestion = __esm({
  "src/db/schema/dataIngestion.ts"() {
    "use strict";
    import_pg_core3 = require("drizzle-orm/pg-core");
    dataSourceTypeEnum = (0, import_pg_core3.pgEnum)("data_source_type", [
      "fao",
      "agmarknet",
      "soilgrids",
      "open_meteo",
      "data_gov_in",
      "gbif",
      "usda",
      "manual"
    ]);
    syncStatusEnum = (0, import_pg_core3.pgEnum)("sync_status", [
      "pending",
      "running",
      "success",
      "failed",
      "partial"
    ]);
    agrochemicalTypeEnum = (0, import_pg_core3.pgEnum)("agrochemical_type", [
      "fertilizer",
      "pesticide",
      "herbicide",
      "fungicide",
      "insecticide",
      "bio",
      "soil_amendment"
    ]);
    seedTypeEnum = (0, import_pg_core3.pgEnum)("seed_type", [
      "hybrid",
      "open_pollinated",
      "heirloom",
      "gmo",
      "organic",
      "other"
    ]);
  }
});

// src/db/schema/syncJobs.ts
var import_pg_core4, dataSources, syncJobs;
var init_syncJobs = __esm({
  "src/db/schema/syncJobs.ts"() {
    "use strict";
    import_pg_core4 = require("drizzle-orm/pg-core");
    init_dataIngestion();
    dataSources = (0, import_pg_core4.pgTable)("data_sources", {
      id: (0, import_pg_core4.varchar)("id", { length: 40 }).primaryKey(),
      name: (0, import_pg_core4.varchar)("name", { length: 120 }).notNull(),
      type: dataSourceTypeEnum("type").notNull(),
      baseUrl: (0, import_pg_core4.text)("base_url"),
      description: (0, import_pg_core4.text)("description"),
      regionScope: (0, import_pg_core4.varchar)("region_scope", { length: 80 }).default("global"),
      isActive: (0, import_pg_core4.integer)("is_active").notNull().default(1),
      config: (0, import_pg_core4.jsonb)("config").$type().default({}),
      lastSyncAt: (0, import_pg_core4.timestamp)("last_sync_at", { withTimezone: true }),
      createdAt: (0, import_pg_core4.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
    });
    syncJobs = (0, import_pg_core4.pgTable)(
      "sync_jobs",
      {
        id: (0, import_pg_core4.uuid)("id").primaryKey().defaultRandom(),
        sourceId: (0, import_pg_core4.varchar)("source_id", { length: 40 }).notNull().references(() => dataSources.id, { onDelete: "cascade" }),
        status: syncStatusEnum("status").notNull().default("pending"),
        recordsFetched: (0, import_pg_core4.integer)("records_fetched").default(0),
        recordsUpserted: (0, import_pg_core4.integer)("records_upserted").default(0),
        errorMessage: (0, import_pg_core4.text)("error_message"),
        metadata: (0, import_pg_core4.jsonb)("metadata").$type().default({}),
        startedAt: (0, import_pg_core4.timestamp)("started_at", { withTimezone: true }).notNull().defaultNow(),
        finishedAt: (0, import_pg_core4.timestamp)("finished_at", { withTimezone: true })
      },
      (t) => [
        (0, import_pg_core4.index)("sync_jobs_source_idx").on(t.sourceId),
        (0, import_pg_core4.index)("sync_jobs_status_idx").on(t.status),
        (0, import_pg_core4.index)("sync_jobs_started_idx").on(t.startedAt)
      ]
    );
  }
});

// src/db/schema/farmers.ts
var import_pg_core5, farmers, lands, surveyNumbers;
var init_farmers = __esm({
  "src/db/schema/farmers.ts"() {
    "use strict";
    import_pg_core5 = require("drizzle-orm/pg-core");
    farmers = (0, import_pg_core5.pgTable)(
      "farmers",
      {
        id: (0, import_pg_core5.uuid)("id").primaryKey().defaultRandom(),
        phone: (0, import_pg_core5.varchar)("phone", { length: 15 }).unique(),
        email: (0, import_pg_core5.varchar)("email", { length: 255 }).unique(),
        passwordHash: (0, import_pg_core5.text)("password_hash"),
        name: (0, import_pg_core5.varchar)("name", { length: 120 }).notNull(),
        avatarUrl: (0, import_pg_core5.text)("avatar_url"),
        language: (0, import_pg_core5.varchar)("language", { length: 10 }).notNull().default("te"),
        locationLabel: (0, import_pg_core5.varchar)("location_label", { length: 200 }),
        farmSize: (0, import_pg_core5.varchar)("farm_size", { length: 255 }),
        notes: (0, import_pg_core5.jsonb)("notes").$type().default([]),
        isActive: (0, import_pg_core5.boolean)("is_active").notNull().default(true),
        createdAt: (0, import_pg_core5.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core5.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [(0, import_pg_core5.index)("farmers_phone_idx").on(t.phone)]
    );
    lands = (0, import_pg_core5.pgTable)(
      "lands",
      {
        id: (0, import_pg_core5.uuid)("id").primaryKey().defaultRandom(),
        farmerId: (0, import_pg_core5.uuid)("farmer_id").notNull().references(() => farmers.id, { onDelete: "cascade" }),
        label: (0, import_pg_core5.varchar)("label", { length: 120 }).notNull(),
        areaAcres: (0, import_pg_core5.decimal)("area_acres", { precision: 10, scale: 4 }),
        village: (0, import_pg_core5.varchar)("village", { length: 120 }),
        mandal: (0, import_pg_core5.varchar)("mandal", { length: 120 }),
        district: (0, import_pg_core5.varchar)("district", { length: 120 }).notNull(),
        state: (0, import_pg_core5.varchar)("state", { length: 120 }).notNull().default("Andhra Pradesh"),
        soilType: (0, import_pg_core5.varchar)("soil_type", { length: 120 }),
        latitude: (0, import_pg_core5.decimal)("latitude", { precision: 10, scale: 7 }),
        longitude: (0, import_pg_core5.decimal)("longitude", { precision: 10, scale: 7 }),
        createdAt: (0, import_pg_core5.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core5.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core5.index)("lands_farmer_idx").on(t.farmerId),
        (0, import_pg_core5.index)("lands_district_idx").on(t.district)
      ]
    );
    surveyNumbers = (0, import_pg_core5.pgTable)(
      "survey_numbers",
      {
        id: (0, import_pg_core5.uuid)("id").primaryKey().defaultRandom(),
        landId: (0, import_pg_core5.uuid)("land_id").notNull().references(() => lands.id, { onDelete: "cascade" }),
        surveyNumber: (0, import_pg_core5.varchar)("survey_number", { length: 60 }).notNull(),
        subDivision: (0, import_pg_core5.varchar)("sub_division", { length: 30 }),
        /** Khata / account number from MeeBhoomi (Adangal / 1-B) */
        khataNumber: (0, import_pg_core5.varchar)("khata_number", { length: 60 }),
        extentAcres: (0, import_pg_core5.decimal)("extent_acres", { precision: 10, scale: 4 }),
        revenueVillage: (0, import_pg_core5.varchar)("revenue_village", { length: 120 }),
        createdAt: (0, import_pg_core5.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core5.index)("survey_numbers_land_idx").on(t.landId),
        (0, import_pg_core5.index)("survey_numbers_number_idx").on(t.surveyNumber)
      ]
    );
  }
});

// src/db/schema/soils.ts
var import_pg_core6, import_pg_core7, soils, soilReadings;
var init_soils = __esm({
  "src/db/schema/soils.ts"() {
    "use strict";
    import_pg_core6 = require("drizzle-orm/pg-core");
    import_pg_core7 = require("drizzle-orm/pg-core");
    init_farmers();
    soils = (0, import_pg_core6.pgTable)(
      "soils",
      {
        id: (0, import_pg_core6.uuid)("id").primaryKey().defaultRandom(),
        geoKey: (0, import_pg_core6.varchar)("geo_key", { length: 24 }).notNull(),
        latitude: (0, import_pg_core7.decimal)("latitude", { precision: 10, scale: 7 }).notNull(),
        longitude: (0, import_pg_core7.decimal)("longitude", { precision: 10, scale: 7 }).notNull(),
        depthCm: (0, import_pg_core6.varchar)("depth_cm", { length: 20 }).notNull().default("0-5cm"),
        ph: (0, import_pg_core7.decimal)("ph", { precision: 4, scale: 2 }),
        nitrogenGkg: (0, import_pg_core7.decimal)("nitrogen_gkg", { precision: 8, scale: 4 }),
        organicCarbonGkg: (0, import_pg_core7.decimal)("organic_carbon_gkg", { precision: 8, scale: 4 }),
        clayPercent: (0, import_pg_core7.decimal)("clay_percent", { precision: 6, scale: 2 }),
        sandPercent: (0, import_pg_core7.decimal)("sand_percent", { precision: 6, scale: 2 }),
        siltPercent: (0, import_pg_core7.decimal)("silt_percent", { precision: 6, scale: 2 }),
        cecCmol: (0, import_pg_core7.decimal)("cec_cmol", { precision: 8, scale: 4 }),
        bulkDensity: (0, import_pg_core7.decimal)("bulk_density", { precision: 8, scale: 4 }),
        textureClass: (0, import_pg_core6.varchar)("texture_class", { length: 40 }),
        wrbClass: (0, import_pg_core6.varchar)("wrb_class", { length: 80 }),
        source: (0, import_pg_core6.varchar)("source", { length: 40 }).notNull().default("soilgrids"),
        rawData: (0, import_pg_core6.jsonb)("raw_data").$type().default({}),
        fetchedAt: (0, import_pg_core6.timestamp)("fetched_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core6.uniqueIndex)("soils_geo_depth_idx").on(t.geoKey, t.depthCm),
        (0, import_pg_core6.index)("soils_coords_idx").on(t.latitude, t.longitude)
      ]
    );
    soilReadings = (0, import_pg_core6.pgTable)(
      "soil_readings",
      {
        id: (0, import_pg_core6.uuid)("id").primaryKey().defaultRandom(),
        farmerId: (0, import_pg_core6.uuid)("farmer_id").references(() => farmers.id, { onDelete: "cascade" }),
        landId: (0, import_pg_core6.uuid)("land_id").references(() => lands.id, { onDelete: "cascade" }),
        latitude: (0, import_pg_core7.decimal)("latitude", { precision: 10, scale: 7 }),
        longitude: (0, import_pg_core7.decimal)("longitude", { precision: 10, scale: 7 }),
        ph: (0, import_pg_core7.decimal)("ph", { precision: 4, scale: 2 }),
        nitrogen: (0, import_pg_core7.decimal)("nitrogen", { precision: 8, scale: 4 }),
        phosphorus: (0, import_pg_core7.decimal)("phosphorus", { precision: 8, scale: 4 }),
        potassium: (0, import_pg_core7.decimal)("potassium", { precision: 8, scale: 4 }),
        organicMatter: (0, import_pg_core7.decimal)("organic_matter", { precision: 6, scale: 2 }),
        moisture: (0, import_pg_core7.decimal)("moisture", { precision: 6, scale: 2 }),
        salinity: (0, import_pg_core7.decimal)("salinity", { precision: 6, scale: 2 }),
        notes: (0, import_pg_core6.text)("notes"),
        source: (0, import_pg_core6.varchar)("source", { length: 40 }).notNull().default("field_test"),
        testedAt: (0, import_pg_core6.timestamp)("tested_at", { withTimezone: true }).notNull().defaultNow(),
        createdAt: (0, import_pg_core6.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core6.index)("soil_readings_farmer_idx").on(t.farmerId),
        (0, import_pg_core6.index)("soil_readings_land_idx").on(t.landId)
      ]
    );
  }
});

// src/db/schema/enums.ts
var import_pg_core8, cropSeasonEnum, calendarStageEnum, predictionTypeEnum, orderStatusEnum, paymentStatusEnum, paymentMethodEnum, notificationTypeEnum, sprayTypeEnum, productTypeEnum, confidenceEnum, weatherConditionEnum;
var init_enums = __esm({
  "src/db/schema/enums.ts"() {
    "use strict";
    import_pg_core8 = require("drizzle-orm/pg-core");
    cropSeasonEnum = (0, import_pg_core8.pgEnum)("crop_season", ["kharif", "rabi", "year-round"]);
    calendarStageEnum = (0, import_pg_core8.pgEnum)("calendar_stage", [
      "planned",
      "sown",
      "vegetative",
      "flowering",
      "harvesting",
      "completed"
    ]);
    predictionTypeEnum = (0, import_pg_core8.pgEnum)("prediction_type", [
      "price_forecast",
      "yield_estimate",
      "disease_risk",
      "spray_advisory",
      "weather_impact"
    ]);
    orderStatusEnum = (0, import_pg_core8.pgEnum)("order_status", [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled"
    ]);
    paymentStatusEnum = (0, import_pg_core8.pgEnum)("payment_status", [
      "pending",
      "success",
      "failed",
      "refunded"
    ]);
    paymentMethodEnum = (0, import_pg_core8.pgEnum)("payment_method", ["upi", "card", "netbanking", "cod", "wallet"]);
    notificationTypeEnum = (0, import_pg_core8.pgEnum)("notification_type", [
      "mandi_alert",
      "weather_alert",
      "spray_reminder",
      "fertilizer_reminder",
      "order_update",
      "payment_update",
      "ai_insight",
      "crop_calendar"
    ]);
    sprayTypeEnum = (0, import_pg_core8.pgEnum)("spray_type", [
      "insecticide",
      "fungicide",
      "herbicide",
      "bio",
      "fertilizer_foliar"
    ]);
    productTypeEnum = (0, import_pg_core8.pgEnum)("product_type", ["fertilizer", "seed", "spray", "other"]);
    confidenceEnum = (0, import_pg_core8.pgEnum)("confidence_level", ["high", "medium", "low"]);
    weatherConditionEnum = (0, import_pg_core8.pgEnum)("weather_condition", [
      "clear",
      "partlyCloudy",
      "cloudy",
      "rain",
      "thunderstorm",
      "fog",
      "snow"
    ]);
  }
});

// src/db/schema/crops.ts
var import_pg_core9, crops, cropVarieties;
var init_crops = __esm({
  "src/db/schema/crops.ts"() {
    "use strict";
    import_pg_core9 = require("drizzle-orm/pg-core");
    init_enums();
    crops = (0, import_pg_core9.pgTable)("crops", {
      id: (0, import_pg_core9.varchar)("id", { length: 40 }).primaryKey(),
      name: (0, import_pg_core9.varchar)("name", { length: 120 }).notNull(),
      nameTe: (0, import_pg_core9.varchar)("name_te", { length: 160 }),
      season: cropSeasonEnum("season"),
      seasonLabel: (0, import_pg_core9.varchar)("season_label", { length: 120 }),
      category: (0, import_pg_core9.varchar)("category", { length: 80 }),
      sowingPeriod: (0, import_pg_core9.varchar)("sowing_period", { length: 80 }),
      harvestPeriod: (0, import_pg_core9.varchar)("harvest_period", { length: 80 }),
      waterNeeds: (0, import_pg_core9.varchar)("water_needs", { length: 120 }),
      soilType: (0, import_pg_core9.varchar)("soil_type", { length: 120 }),
      tips: (0, import_pg_core9.jsonb)("tips").$type().default([]),
      searchAliases: (0, import_pg_core9.jsonb)("search_aliases").$type().default([]),
      /** AI-cached farmer-friendly names per language code (te, hi, ta, ...) */
      localizedNames: (0, import_pg_core9.jsonb)("localized_names").$type().default({}),
      description: (0, import_pg_core9.text)("description"),
      metadata: (0, import_pg_core9.jsonb)("metadata").$type().default({}),
      icon: (0, import_pg_core9.varchar)("icon", { length: 40 }),
      color: (0, import_pg_core9.varchar)("color", { length: 20 }),
      source: (0, import_pg_core9.varchar)("source", { length: 40 }).notNull().default("fao"),
      externalId: (0, import_pg_core9.varchar)("external_id", { length: 80 }),
      regionScope: (0, import_pg_core9.varchar)("region_scope", { length: 80 }).default("global"),
      lastSyncedAt: (0, import_pg_core9.timestamp)("last_synced_at", { withTimezone: true }),
      createdAt: (0, import_pg_core9.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
    });
    cropVarieties = (0, import_pg_core9.pgTable)(
      "crop_varieties",
      {
        id: (0, import_pg_core9.varchar)("id", { length: 80 }).primaryKey(),
        cropId: (0, import_pg_core9.varchar)("crop_id", { length: 40 }).notNull().references(() => crops.id, { onDelete: "cascade" }),
        name: (0, import_pg_core9.varchar)("name", { length: 160 }).notNull(),
        nameTe: (0, import_pg_core9.varchar)("name_te", { length: 160 }),
        aliases: (0, import_pg_core9.jsonb)("aliases").$type().default([]),
        agmarknetNames: (0, import_pg_core9.jsonb)("agmarknet_names").$type().default([]),
        isCurated: (0, import_pg_core9.boolean)("is_curated").notNull().default(false),
        source: (0, import_pg_core9.varchar)("source", { length: 40 }).notNull().default("agmarknet"),
        externalId: (0, import_pg_core9.varchar)("external_id", { length: 120 }),
        country: (0, import_pg_core9.varchar)("country", { length: 80 }),
        lastSyncedAt: (0, import_pg_core9.timestamp)("last_synced_at", { withTimezone: true }),
        duration: (0, import_pg_core9.varchar)("duration", { length: 80 }),
        grainType: (0, import_pg_core9.varchar)("grain_type", { length: 80 }),
        yieldPotential: (0, import_pg_core9.varchar)("yield_potential", { length: 80 }),
        referenceBaselineQtl: (0, import_pg_core9.decimal)("reference_baseline_qtl", { precision: 10, scale: 2 }),
        priceNote: (0, import_pg_core9.text)("price_note"),
        priceNoteTe: (0, import_pg_core9.text)("price_note_te"),
        metadata: (0, import_pg_core9.jsonb)("metadata").$type().default({}),
        createdAt: (0, import_pg_core9.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core9.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core9.index)("crop_varieties_crop_idx").on(t.cropId),
        (0, import_pg_core9.index)("crop_varieties_name_idx").on(t.name)
      ]
    );
  }
});

// src/db/schema/seeds.ts
var import_pg_core10, seeds, agrochemicals;
var init_seeds = __esm({
  "src/db/schema/seeds.ts"() {
    "use strict";
    import_pg_core10 = require("drizzle-orm/pg-core");
    init_dataIngestion();
    init_crops();
    seeds = (0, import_pg_core10.pgTable)(
      "seeds",
      {
        id: (0, import_pg_core10.varchar)("id", { length: 80 }).primaryKey(),
        cropId: (0, import_pg_core10.varchar)("crop_id", { length: 40 }).notNull().references(() => crops.id, { onDelete: "cascade" }),
        varietyId: (0, import_pg_core10.varchar)("variety_id", { length: 80 }).references(() => cropVarieties.id, {
          onDelete: "set null"
        }),
        name: (0, import_pg_core10.varchar)("name", { length: 200 }).notNull(),
        brand: (0, import_pg_core10.varchar)("brand", { length: 120 }),
        supplier: (0, import_pg_core10.varchar)("supplier", { length: 120 }),
        seedType: seedTypeEnum("seed_type").default("other"),
        country: (0, import_pg_core10.varchar)("country", { length: 80 }),
        region: (0, import_pg_core10.varchar)("region", { length: 80 }),
        germinationRate: (0, import_pg_core10.varchar)("germination_rate", { length: 40 }),
        maturityDays: (0, import_pg_core10.varchar)("maturity_days", { length: 40 }),
        seedRate: (0, import_pg_core10.varchar)("seed_rate", { length: 80 }),
        priceRange: (0, import_pg_core10.varchar)("price_range", { length: 80 }),
        source: (0, import_pg_core10.varchar)("source", { length: 40 }).notNull(),
        externalId: (0, import_pg_core10.varchar)("external_id", { length: 120 }),
        metadata: (0, import_pg_core10.jsonb)("metadata").$type().default({}),
        lastSyncedAt: (0, import_pg_core10.timestamp)("last_synced_at", { withTimezone: true }),
        createdAt: (0, import_pg_core10.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core10.index)("seeds_crop_idx").on(t.cropId),
        (0, import_pg_core10.index)("seeds_variety_idx").on(t.varietyId),
        (0, import_pg_core10.index)("seeds_source_idx").on(t.source),
        (0, import_pg_core10.index)("seeds_country_idx").on(t.country)
      ]
    );
    agrochemicals = (0, import_pg_core10.pgTable)(
      "agrochemicals",
      {
        id: (0, import_pg_core10.uuid)("id").primaryKey().defaultRandom(),
        cropId: (0, import_pg_core10.varchar)("crop_id", { length: 40 }).references(() => crops.id, { onDelete: "set null" }),
        type: agrochemicalTypeEnum("type").notNull(),
        name: (0, import_pg_core10.varchar)("name", { length: 200 }).notNull(),
        nameTe: (0, import_pg_core10.varchar)("name_te", { length: 200 }),
        activeIngredient: (0, import_pg_core10.varchar)("active_ingredient", { length: 200 }),
        npk: (0, import_pg_core10.varchar)("npk", { length: 40 }),
        dose: (0, import_pg_core10.varchar)("dose", { length: 120 }),
        method: (0, import_pg_core10.varchar)("method", { length: 120 }),
        timing: (0, import_pg_core10.varchar)("timing", { length: 160 }),
        target: (0, import_pg_core10.varchar)("target", { length: 160 }),
        stageId: (0, import_pg_core10.varchar)("stage_id", { length: 60 }),
        estimatedPrice: (0, import_pg_core10.varchar)("estimated_price", { length: 80 }),
        country: (0, import_pg_core10.varchar)("country", { length: 80 }),
        source: (0, import_pg_core10.varchar)("source", { length: 40 }).notNull(),
        externalId: (0, import_pg_core10.varchar)("external_id", { length: 120 }),
        metadata: (0, import_pg_core10.jsonb)("metadata").$type().default({}),
        lastSyncedAt: (0, import_pg_core10.timestamp)("last_synced_at", { withTimezone: true }),
        createdAt: (0, import_pg_core10.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core10.index)("agrochemicals_crop_idx").on(t.cropId),
        (0, import_pg_core10.index)("agrochemicals_type_idx").on(t.type),
        (0, import_pg_core10.index)("agrochemicals_source_idx").on(t.source),
        (0, import_pg_core10.uniqueIndex)("agrochemicals_source_ext_idx").on(t.source, t.externalId)
      ]
    );
  }
});

// src/db/schema/cropCalendar.ts
var import_pg_core11, cropCalendar;
var init_cropCalendar = __esm({
  "src/db/schema/cropCalendar.ts"() {
    "use strict";
    import_pg_core11 = require("drizzle-orm/pg-core");
    init_crops();
    init_enums();
    init_farmers();
    cropCalendar = (0, import_pg_core11.pgTable)(
      "crop_calendar",
      {
        id: (0, import_pg_core11.uuid)("id").primaryKey().defaultRandom(),
        farmerId: (0, import_pg_core11.uuid)("farmer_id").notNull().references(() => farmers.id, { onDelete: "cascade" }),
        landId: (0, import_pg_core11.uuid)("land_id").references(() => lands.id, { onDelete: "set null" }),
        cropId: (0, import_pg_core11.varchar)("crop_id", { length: 40 }).notNull().references(() => crops.id, { onDelete: "restrict" }),
        varietyId: (0, import_pg_core11.varchar)("variety_id", { length: 80 }).references(() => cropVarieties.id, {
          onDelete: "set null"
        }),
        varietyName: (0, import_pg_core11.varchar)("variety_name", { length: 160 }),
        sowingDate: (0, import_pg_core11.date)("sowing_date"),
        expectedHarvestDate: (0, import_pg_core11.date)("expected_harvest_date"),
        actualHarvestDate: (0, import_pg_core11.date)("actual_harvest_date"),
        stage: calendarStageEnum("stage").notNull().default("planned"),
        notes: (0, import_pg_core11.text)("notes"),
        createdAt: (0, import_pg_core11.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core11.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core11.index)("crop_calendar_farmer_idx").on(t.farmerId),
        (0, import_pg_core11.index)("crop_calendar_land_idx").on(t.landId),
        (0, import_pg_core11.index)("crop_calendar_crop_idx").on(t.cropId),
        (0, import_pg_core11.index)("crop_calendar_sowing_idx").on(t.sowingDate)
      ]
    );
  }
});

// src/db/schema/weather.ts
var import_pg_core12, weather;
var init_weather = __esm({
  "src/db/schema/weather.ts"() {
    "use strict";
    import_pg_core12 = require("drizzle-orm/pg-core");
    init_enums();
    init_farmers();
    weather = (0, import_pg_core12.pgTable)(
      "weather",
      {
        id: (0, import_pg_core12.uuid)("id").primaryKey().defaultRandom(),
        farmerId: (0, import_pg_core12.uuid)("farmer_id").references(() => farmers.id, { onDelete: "cascade" }),
        landId: (0, import_pg_core12.uuid)("land_id").references(() => lands.id, { onDelete: "set null" }),
        locationName: (0, import_pg_core12.varchar)("location_name", { length: 200 }).notNull(),
        latitude: (0, import_pg_core12.decimal)("latitude", { precision: 10, scale: 7 }).notNull(),
        longitude: (0, import_pg_core12.decimal)("longitude", { precision: 10, scale: 7 }).notNull(),
        temperature: (0, import_pg_core12.decimal)("temperature", { precision: 5, scale: 2 }),
        feelsLike: (0, import_pg_core12.decimal)("feels_like", { precision: 5, scale: 2 }),
        condition: weatherConditionEnum("condition"),
        humidity: (0, import_pg_core12.integer)("humidity"),
        windSpeed: (0, import_pg_core12.decimal)("wind_speed", { precision: 6, scale: 2 }),
        pressure: (0, import_pg_core12.decimal)("pressure", { precision: 7, scale: 2 }),
        visibility: (0, import_pg_core12.decimal)("visibility", { precision: 6, scale: 2 }),
        uvIndex: (0, import_pg_core12.decimal)("uv_index", { precision: 4, scale: 2 }),
        precipitation: (0, import_pg_core12.integer)("precipitation"),
        hourly: (0, import_pg_core12.jsonb)("hourly").$type().default([]),
        daily: (0, import_pg_core12.jsonb)("daily").$type().default([]),
        agricultureTip: (0, import_pg_core12.text)("agriculture_tip"),
        fetchedAt: (0, import_pg_core12.timestamp)("fetched_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core12.index)("weather_farmer_idx").on(t.farmerId),
        (0, import_pg_core12.index)("weather_land_idx").on(t.landId),
        (0, import_pg_core12.index)("weather_coords_idx").on(t.latitude, t.longitude),
        (0, import_pg_core12.index)("weather_fetched_idx").on(t.fetchedAt)
      ]
    );
  }
});

// src/db/schema/mandiPrices.ts
var import_pg_core13, mandiPrices;
var init_mandiPrices = __esm({
  "src/db/schema/mandiPrices.ts"() {
    "use strict";
    import_pg_core13 = require("drizzle-orm/pg-core");
    init_crops();
    mandiPrices = (0, import_pg_core13.pgTable)(
      "mandi_prices",
      {
        id: (0, import_pg_core13.uuid)("id").primaryKey().defaultRandom(),
        cropId: (0, import_pg_core13.varchar)("crop_id", { length: 40 }).notNull().references(() => crops.id, { onDelete: "restrict" }),
        varietyId: (0, import_pg_core13.varchar)("variety_id", { length: 80 }).references(() => cropVarieties.id, {
          onDelete: "set null"
        }),
        varietyName: (0, import_pg_core13.varchar)("variety_name", { length: 160 }),
        commodity: (0, import_pg_core13.varchar)("commodity", { length: 120 }).notNull(),
        market: (0, import_pg_core13.varchar)("market", { length: 120 }).notNull(),
        district: (0, import_pg_core13.varchar)("district", { length: 120 }).notNull(),
        state: (0, import_pg_core13.varchar)("state", { length: 120 }).notNull(),
        priceDate: (0, import_pg_core13.date)("price_date").notNull(),
        minPrice: (0, import_pg_core13.decimal)("min_price", { precision: 12, scale: 2 }).notNull(),
        maxPrice: (0, import_pg_core13.decimal)("max_price", { precision: 12, scale: 2 }).notNull(),
        modalPrice: (0, import_pg_core13.decimal)("modal_price", { precision: 12, scale: 2 }).notNull(),
        unit: (0, import_pg_core13.varchar)("unit", { length: 30 }).notNull().default("Quintal"),
        arrivalQty: (0, import_pg_core13.decimal)("arrival_qty", { precision: 12, scale: 2 }),
        isLive: (0, import_pg_core13.boolean)("is_live").notNull().default(true),
        source: (0, import_pg_core13.varchar)("source", { length: 40 }).notNull().default("agmarknet"),
        fetchedAt: (0, import_pg_core13.timestamp)("fetched_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core13.uniqueIndex)("mandi_prices_unique_idx").on(
          t.cropId,
          t.varietyName,
          t.market,
          t.district,
          t.state,
          t.priceDate
        ),
        (0, import_pg_core13.index)("mandi_prices_crop_idx").on(t.cropId),
        (0, import_pg_core13.index)("mandi_prices_variety_idx").on(t.varietyId),
        (0, import_pg_core13.index)("mandi_prices_date_idx").on(t.priceDate),
        (0, import_pg_core13.index)("mandi_prices_state_district_idx").on(t.state, t.district)
      ]
    );
  }
});

// src/db/schema/agPlaces.ts
var import_pg_core14, agPlaces;
var init_agPlaces = __esm({
  "src/db/schema/agPlaces.ts"() {
    "use strict";
    import_pg_core14 = require("drizzle-orm/pg-core");
    agPlaces = (0, import_pg_core14.pgTable)(
      "ag_places",
      {
        id: (0, import_pg_core14.uuid)("id").primaryKey().defaultRandom(),
        placeType: (0, import_pg_core14.varchar)("place_type", { length: 32 }).notNull(),
        // mandi | fertilizer_shop | seed_shop | dealer
        name: (0, import_pg_core14.varchar)("name", { length: 200 }).notNull(),
        district: (0, import_pg_core14.varchar)("district", { length: 120 }).notNull(),
        state: (0, import_pg_core14.varchar)("state", { length: 80 }).notNull().default("Andhra Pradesh"),
        address: (0, import_pg_core14.varchar)("address", { length: 300 }),
        latitude: (0, import_pg_core14.decimal)("latitude", { precision: 10, scale: 7 }).notNull(),
        longitude: (0, import_pg_core14.decimal)("longitude", { precision: 10, scale: 7 }).notNull(),
        phone: (0, import_pg_core14.varchar)("phone", { length: 20 }),
        source: (0, import_pg_core14.varchar)("source", { length: 40 }).notNull().default("curated"),
        active: (0, import_pg_core14.boolean)("active").notNull().default(true),
        createdAt: (0, import_pg_core14.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core14.index)("ag_places_type_idx").on(t.placeType),
        (0, import_pg_core14.index)("ag_places_state_district_idx").on(t.state, t.district),
        (0, import_pg_core14.index)("ag_places_coords_idx").on(t.latitude, t.longitude)
      ]
    );
  }
});

// src/db/schema/fertilizers.ts
var import_pg_core15, fertilizers, diseases, diseaseSprays;
var init_fertilizers = __esm({
  "src/db/schema/fertilizers.ts"() {
    "use strict";
    import_pg_core15 = require("drizzle-orm/pg-core");
    init_crops();
    init_enums();
    fertilizers = (0, import_pg_core15.pgTable)(
      "fertilizers",
      {
        id: (0, import_pg_core15.uuid)("id").primaryKey().defaultRandom(),
        cropId: (0, import_pg_core15.varchar)("crop_id", { length: 40 }).notNull().references(() => crops.id, { onDelete: "cascade" }),
        stageId: (0, import_pg_core15.varchar)("stage_id", { length: 60 }).notNull(),
        name: (0, import_pg_core15.varchar)("name", { length: 120 }).notNull(),
        nameTe: (0, import_pg_core15.varchar)("name_te", { length: 160 }),
        dose: (0, import_pg_core15.varchar)("dose", { length: 120 }).notNull(),
        method: (0, import_pg_core15.varchar)("method", { length: 120 }),
        timing: (0, import_pg_core15.varchar)("timing", { length: 160 }).notNull(),
        estimatedPrice: (0, import_pg_core15.varchar)("estimated_price", { length: 80 }),
        notes: (0, import_pg_core15.text)("notes"),
        createdAt: (0, import_pg_core15.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core15.index)("fertilizers_crop_idx").on(t.cropId),
        (0, import_pg_core15.index)("fertilizers_stage_idx").on(t.stageId)
      ]
    );
    diseases = (0, import_pg_core15.pgTable)(
      "diseases",
      {
        id: (0, import_pg_core15.varchar)("id", { length: 80 }).primaryKey(),
        cropId: (0, import_pg_core15.varchar)("crop_id", { length: 40 }).notNull().references(() => crops.id, { onDelete: "cascade" }),
        name: (0, import_pg_core15.varchar)("name", { length: 120 }).notNull(),
        nameTe: (0, import_pg_core15.varchar)("name_te", { length: 160 }),
        symptoms: (0, import_pg_core15.text)("symptoms"),
        symptomsTe: (0, import_pg_core15.text)("symptoms_te"),
        createdAt: (0, import_pg_core15.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [(0, import_pg_core15.index)("diseases_crop_idx").on(t.cropId)]
    );
    diseaseSprays = (0, import_pg_core15.pgTable)(
      "disease_sprays",
      {
        id: (0, import_pg_core15.uuid)("id").primaryKey().defaultRandom(),
        diseaseId: (0, import_pg_core15.varchar)("disease_id", { length: 80 }).notNull().references(() => diseases.id, { onDelete: "cascade" }),
        productName: (0, import_pg_core15.varchar)("product_name", { length: 160 }).notNull(),
        productNameTe: (0, import_pg_core15.varchar)("product_name_te", { length: 160 }),
        type: sprayTypeEnum("type").notNull(),
        target: (0, import_pg_core15.varchar)("target", { length: 120 }),
        targetTe: (0, import_pg_core15.varchar)("target_te", { length: 160 }),
        dose: (0, import_pg_core15.varchar)("dose", { length: 120 }),
        howToSpray: (0, import_pg_core15.text)("how_to_spray"),
        howToSprayTe: (0, import_pg_core15.text)("how_to_spray_te"),
        bestTime: (0, import_pg_core15.varchar)("best_time", { length: 120 }),
        precautions: (0, import_pg_core15.jsonb)("precautions").$type().default([]),
        precautionsTe: (0, import_pg_core15.jsonb)("precautions_te").$type().default([]),
        estimatedPrice: (0, import_pg_core15.varchar)("estimated_price", { length: 80 }),
        whereToBuy: (0, import_pg_core15.jsonb)("where_to_buy").$type().default([]),
        createdAt: (0, import_pg_core15.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [(0, import_pg_core15.index)("disease_sprays_disease_idx").on(t.diseaseId)]
    );
  }
});

// src/db/schema/fertilizerProducts.ts
var import_pg_core16, fertilizerProducts;
var init_fertilizerProducts = __esm({
  "src/db/schema/fertilizerProducts.ts"() {
    "use strict";
    import_pg_core16 = require("drizzle-orm/pg-core");
    fertilizerProducts = (0, import_pg_core16.pgTable)(
      "fertilizer_products",
      {
        id: (0, import_pg_core16.varchar)("id", { length: 80 }).primaryKey(),
        name: (0, import_pg_core16.varchar)("name", { length: 160 }).notNull(),
        nameTe: (0, import_pg_core16.varchar)("name_te", { length: 200 }),
        brand: (0, import_pg_core16.varchar)("brand", { length: 80 }).notNull(),
        category: (0, import_pg_core16.varchar)("category", { length: 60 }).notNull(),
        /** User-facing type alias (Nitrogen, NPK Complex, etc.) */
        type: (0, import_pg_core16.varchar)("type", { length: 60 }),
        npk: (0, import_pg_core16.varchar)("npk", { length: 40 }),
        npkRatio: (0, import_pg_core16.varchar)("npk_ratio", { length: 40 }),
        nutrient: (0, import_pg_core16.text)("nutrient"),
        dosage: (0, import_pg_core16.varchar)("dosage", { length: 200 }),
        /** Primary crops as comma-separated label */
        crop: (0, import_pg_core16.varchar)("crop", { length: 300 }),
        benefits: (0, import_pg_core16.text)("benefits"),
        description: (0, import_pg_core16.text)("description"),
        crops: (0, import_pg_core16.jsonb)("crops").$type().notNull().default([]),
        soilType: (0, import_pg_core16.jsonb)("soil_type").$type().notNull().default([]),
        seasons: (0, import_pg_core16.jsonb)("seasons").$type().notNull().default([]),
        application: (0, import_pg_core16.jsonb)("application").$type().notNull().default([]),
        applicationMethod: (0, import_pg_core16.text)("application_method"),
        precautions: (0, import_pg_core16.text)("precautions"),
        mrp: (0, import_pg_core16.varchar)("mrp", { length: 80 }),
        price: (0, import_pg_core16.varchar)("price", { length: 80 }),
        packSize: (0, import_pg_core16.varchar)("pack_size", { length: 40 }),
        image: (0, import_pg_core16.varchar)("image", { length: 120 }),
        source: (0, import_pg_core16.varchar)("source", { length: 40 }).notNull(),
        sourceUrl: (0, import_pg_core16.text)("source_url"),
        isSubsidized: (0, import_pg_core16.boolean)("is_subsidized").notNull().default(true),
        metadata: (0, import_pg_core16.jsonb)("metadata").$type().default({}),
        lastSyncedAt: (0, import_pg_core16.timestamp)("last_synced_at", { withTimezone: true }),
        createdAt: (0, import_pg_core16.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core16.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core16.index)("fertilizer_products_brand_idx").on(t.brand),
        (0, import_pg_core16.index)("fertilizer_products_category_idx").on(t.category),
        (0, import_pg_core16.index)("fertilizer_products_source_idx").on(t.source),
        (0, import_pg_core16.index)("fertilizer_products_name_idx").on(t.name)
      ]
    );
  }
});

// src/db/schema/agCatalog.ts
var import_pg_core17, plantDiseases, icarGuidelines, agAdvisories, soilHealthRecommendations;
var init_agCatalog = __esm({
  "src/db/schema/agCatalog.ts"() {
    "use strict";
    import_pg_core17 = require("drizzle-orm/pg-core");
    plantDiseases = (0, import_pg_core17.pgTable)(
      "plant_diseases",
      {
        id: (0, import_pg_core17.varchar)("id", { length: 80 }).primaryKey(),
        name: (0, import_pg_core17.varchar)("name", { length: 200 }).notNull(),
        nameTe: (0, import_pg_core17.varchar)("name_te", { length: 200 }),
        cropId: (0, import_pg_core17.varchar)("crop_id", { length: 40 }).notNull(),
        plant: (0, import_pg_core17.varchar)("plant", { length: 80 }).notNull(),
        plantvillageLabel: (0, import_pg_core17.varchar)("plantvillage_label", { length: 200 }),
        category: (0, import_pg_core17.varchar)("category", { length: 40 }).notNull(),
        symptoms: (0, import_pg_core17.text)("symptoms"),
        symptomsTe: (0, import_pg_core17.text)("symptoms_te"),
        treatment: (0, import_pg_core17.text)("treatment"),
        treatmentTe: (0, import_pg_core17.text)("treatment_te"),
        prevention: (0, import_pg_core17.text)("prevention"),
        preventionTe: (0, import_pg_core17.text)("prevention_te"),
        imageClass: (0, import_pg_core17.varchar)("image_class", { length: 200 }),
        hasDatasetImages: (0, import_pg_core17.varchar)("has_dataset_images", { length: 10 }).default("yes"),
        source: (0, import_pg_core17.varchar)("source", { length: 40 }).notNull(),
        sourceUrl: (0, import_pg_core17.text)("source_url"),
        metadata: (0, import_pg_core17.jsonb)("metadata").$type().default({}),
        lastSyncedAt: (0, import_pg_core17.timestamp)("last_synced_at", { withTimezone: true }),
        createdAt: (0, import_pg_core17.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core17.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core17.index)("plant_diseases_crop_idx").on(t.cropId),
        (0, import_pg_core17.index)("plant_diseases_plant_idx").on(t.plant),
        (0, import_pg_core17.index)("plant_diseases_source_idx").on(t.source),
        (0, import_pg_core17.index)("plant_diseases_category_idx").on(t.category)
      ]
    );
    icarGuidelines = (0, import_pg_core17.pgTable)(
      "icar_guidelines",
      {
        id: (0, import_pg_core17.varchar)("id", { length: 80 }).primaryKey(),
        category: (0, import_pg_core17.varchar)("category", { length: 60 }).notNull(),
        cropId: (0, import_pg_core17.varchar)("crop_id", { length: 40 }),
        title: (0, import_pg_core17.varchar)("title", { length: 300 }).notNull(),
        titleTe: (0, import_pg_core17.varchar)("title_te", { length: 300 }),
        content: (0, import_pg_core17.text)("content").notNull(),
        season: (0, import_pg_core17.varchar)("season", { length: 40 }),
        region: (0, import_pg_core17.varchar)("region", { length: 120 }).default("India"),
        sourceUrl: (0, import_pg_core17.text)("source_url"),
        tags: (0, import_pg_core17.jsonb)("tags").$type().default([]),
        lastSyncedAt: (0, import_pg_core17.timestamp)("last_synced_at", { withTimezone: true }),
        createdAt: (0, import_pg_core17.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core17.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core17.index)("icar_guidelines_category_idx").on(t.category),
        (0, import_pg_core17.index)("icar_guidelines_crop_idx").on(t.cropId)
      ]
    );
    agAdvisories = (0, import_pg_core17.pgTable)(
      "ag_advisories",
      {
        id: (0, import_pg_core17.varchar)("id", { length: 80 }).primaryKey(),
        type: (0, import_pg_core17.varchar)("type", { length: 60 }).notNull(),
        title: (0, import_pg_core17.varchar)("title", { length: 300 }).notNull(),
        titleTe: (0, import_pg_core17.varchar)("title_te", { length: 300 }),
        description: (0, import_pg_core17.text)("description").notNull(),
        state: (0, import_pg_core17.varchar)("state", { length: 80 }).default("All India"),
        season: (0, import_pg_core17.varchar)("season", { length: 40 }),
        cropTags: (0, import_pg_core17.jsonb)("crop_tags").$type().default([]),
        source: (0, import_pg_core17.varchar)("source", { length: 40 }).notNull(),
        sourceUrl: (0, import_pg_core17.text)("source_url"),
        lastSyncedAt: (0, import_pg_core17.timestamp)("last_synced_at", { withTimezone: true }),
        createdAt: (0, import_pg_core17.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core17.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core17.index)("ag_advisories_type_idx").on(t.type),
        (0, import_pg_core17.index)("ag_advisories_source_idx").on(t.source)
      ]
    );
    soilHealthRecommendations = (0, import_pg_core17.pgTable)(
      "soil_health_recommendations",
      {
        id: (0, import_pg_core17.varchar)("id", { length: 80 }).primaryKey(),
        soilType: (0, import_pg_core17.varchar)("soil_type", { length: 80 }).notNull(),
        nutrientStatus: (0, import_pg_core17.varchar)("nutrient_status", { length: 40 }).notNull(),
        deficiency: (0, import_pg_core17.varchar)("deficiency", { length: 120 }).notNull(),
        fertilizerRecommendation: (0, import_pg_core17.text)("fertilizer_recommendation").notNull(),
        dosage: (0, import_pg_core17.varchar)("dosage", { length: 200 }),
        crops: (0, import_pg_core17.jsonb)("crops").$type().default([]),
        season: (0, import_pg_core17.varchar)("season", { length: 40 }),
        description: (0, import_pg_core17.text)("description"),
        source: (0, import_pg_core17.varchar)("source", { length: 40 }).notNull().default("soil_health_card"),
        sourceUrl: (0, import_pg_core17.text)("source_url"),
        lastSyncedAt: (0, import_pg_core17.timestamp)("last_synced_at", { withTimezone: true }),
        createdAt: (0, import_pg_core17.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core17.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core17.index)("soil_health_soil_type_idx").on(t.soilType),
        (0, import_pg_core17.index)("soil_health_deficiency_idx").on(t.deficiency)
      ]
    );
  }
});

// src/db/schema/agProducts.ts
var import_pg_core18, agProducts, cropDiseaseCatalog;
var init_agProducts = __esm({
  "src/db/schema/agProducts.ts"() {
    "use strict";
    import_pg_core18 = require("drizzle-orm/pg-core");
    agProducts = (0, import_pg_core18.pgTable)(
      "ag_products",
      {
        id: (0, import_pg_core18.varchar)("id", { length: 120 }).primaryKey(),
        name: (0, import_pg_core18.varchar)("name", { length: 200 }).notNull(),
        nameTe: (0, import_pg_core18.varchar)("name_te", { length: 200 }),
        type: (0, import_pg_core18.varchar)("type", { length: 40 }).notNull(),
        subType: (0, import_pg_core18.varchar)("sub_type", { length: 60 }),
        brand: (0, import_pg_core18.varchar)("brand", { length: 120 }),
        activeIngredient: (0, import_pg_core18.varchar)("active_ingredient", { length: 200 }),
        nutrientComposition: (0, import_pg_core18.text)("nutrient_composition"),
        npkRatio: (0, import_pg_core18.varchar)("npk_ratio", { length: 40 }),
        dosage: (0, import_pg_core18.varchar)("dosage", { length: 200 }).notNull(),
        crops: (0, import_pg_core18.jsonb)("crops").$type().notNull().default([]),
        soilTypes: (0, import_pg_core18.jsonb)("soil_types").$type().notNull().default([]),
        growthStages: (0, import_pg_core18.jsonb)("growth_stages").$type().notNull().default([]),
        deficiencySymptoms: (0, import_pg_core18.jsonb)("deficiency_symptoms").$type().default([]),
        targetPest: (0, import_pg_core18.varchar)("target_pest", { length: 200 }),
        targetDisease: (0, import_pg_core18.varchar)("target_disease", { length: 200 }),
        applicationMethod: (0, import_pg_core18.text)("application_method"),
        precautions: (0, import_pg_core18.text)("precautions"),
        description: (0, import_pg_core18.text)("description"),
        price: (0, import_pg_core18.varchar)("price", { length: 80 }),
        image: (0, import_pg_core18.varchar)("image", { length: 200 }),
        source: (0, import_pg_core18.varchar)("source", { length: 40 }).notNull(),
        sourceUrl: (0, import_pg_core18.text)("source_url"),
        metadata: (0, import_pg_core18.jsonb)("metadata").$type().default({}),
        lastSyncedAt: (0, import_pg_core18.timestamp)("last_synced_at", { withTimezone: true }),
        createdAt: (0, import_pg_core18.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core18.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core18.index)("ag_products_type_idx").on(t.type),
        (0, import_pg_core18.index)("ag_products_sub_type_idx").on(t.subType),
        (0, import_pg_core18.index)("ag_products_brand_idx").on(t.brand),
        (0, import_pg_core18.index)("ag_products_name_idx").on(t.name)
      ]
    );
    cropDiseaseCatalog = (0, import_pg_core18.pgTable)(
      "crop_disease_catalog",
      {
        id: (0, import_pg_core18.varchar)("id", { length: 120 }).primaryKey(),
        name: (0, import_pg_core18.varchar)("name", { length: 200 }).notNull(),
        nameTe: (0, import_pg_core18.varchar)("name_te", { length: 200 }),
        cropId: (0, import_pg_core18.varchar)("crop_id", { length: 40 }).notNull(),
        category: (0, import_pg_core18.varchar)("category", { length: 40 }).notNull(),
        pathogen: (0, import_pg_core18.varchar)("pathogen", { length: 200 }),
        symptoms: (0, import_pg_core18.text)("symptoms").notNull(),
        deficiencySymptoms: (0, import_pg_core18.jsonb)("deficiency_symptoms").$type().default([]),
        treatment: (0, import_pg_core18.text)("treatment"),
        prevention: (0, import_pg_core18.text)("prevention"),
        growthStage: (0, import_pg_core18.varchar)("growth_stage", { length: 60 }),
        soilTypes: (0, import_pg_core18.jsonb)("soil_types").$type().default([]),
        image: (0, import_pg_core18.varchar)("image", { length: 200 }),
        source: (0, import_pg_core18.varchar)("source", { length: 40 }).notNull(),
        sourceUrl: (0, import_pg_core18.text)("source_url"),
        metadata: (0, import_pg_core18.jsonb)("metadata").$type().default({}),
        lastSyncedAt: (0, import_pg_core18.timestamp)("last_synced_at", { withTimezone: true }),
        createdAt: (0, import_pg_core18.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core18.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core18.index)("crop_disease_catalog_crop_idx").on(t.cropId),
        (0, import_pg_core18.index)("crop_disease_catalog_category_idx").on(t.category),
        (0, import_pg_core18.index)("crop_disease_catalog_name_idx").on(t.name)
      ]
    );
  }
});

// src/db/schema/aiPredictions.ts
var import_pg_core19, aiPredictions;
var init_aiPredictions = __esm({
  "src/db/schema/aiPredictions.ts"() {
    "use strict";
    import_pg_core19 = require("drizzle-orm/pg-core");
    init_crops();
    init_enums();
    init_farmers();
    aiPredictions = (0, import_pg_core19.pgTable)(
      "ai_predictions",
      {
        id: (0, import_pg_core19.uuid)("id").primaryKey().defaultRandom(),
        farmerId: (0, import_pg_core19.uuid)("farmer_id").notNull().references(() => farmers.id, { onDelete: "cascade" }),
        landId: (0, import_pg_core19.uuid)("land_id").references(() => lands.id, { onDelete: "set null" }),
        cropId: (0, import_pg_core19.varchar)("crop_id", { length: 40 }).references(() => crops.id, { onDelete: "set null" }),
        varietyId: (0, import_pg_core19.varchar)("variety_id", { length: 80 }).references(() => cropVarieties.id, {
          onDelete: "set null"
        }),
        predictionType: predictionTypeEnum("prediction_type").notNull(),
        title: (0, import_pg_core19.varchar)("title", { length: 200 }),
        summary: (0, import_pg_core19.text)("summary"),
        inputContext: (0, import_pg_core19.jsonb)("input_context").$type().default({}),
        result: (0, import_pg_core19.jsonb)("result").$type().notNull(),
        confidence: confidenceEnum("confidence").notNull().default("medium"),
        validUntil: (0, import_pg_core19.timestamp)("valid_until", { withTimezone: true }),
        createdAt: (0, import_pg_core19.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core19.index)("ai_predictions_farmer_idx").on(t.farmerId),
        (0, import_pg_core19.index)("ai_predictions_type_idx").on(t.predictionType),
        (0, import_pg_core19.index)("ai_predictions_crop_idx").on(t.cropId),
        (0, import_pg_core19.index)("ai_predictions_created_idx").on(t.createdAt)
      ]
    );
  }
});

// src/db/schema/orders.ts
var import_pg_core20, orders, orderItems, payments;
var init_orders = __esm({
  "src/db/schema/orders.ts"() {
    "use strict";
    import_pg_core20 = require("drizzle-orm/pg-core");
    init_enums();
    init_farmers();
    orders = (0, import_pg_core20.pgTable)(
      "orders",
      {
        id: (0, import_pg_core20.uuid)("id").primaryKey().defaultRandom(),
        farmerId: (0, import_pg_core20.uuid)("farmer_id").notNull().references(() => farmers.id, { onDelete: "restrict" }),
        orderNumber: (0, import_pg_core20.varchar)("order_number", { length: 30 }).notNull().unique(),
        status: orderStatusEnum("status").notNull().default("pending"),
        totalAmount: (0, import_pg_core20.decimal)("total_amount", { precision: 12, scale: 2 }).notNull(),
        currency: (0, import_pg_core20.varchar)("currency", { length: 3 }).notNull().default("INR"),
        shippingAddress: (0, import_pg_core20.jsonb)("shipping_address").$type(),
        notes: (0, import_pg_core20.text)("notes"),
        createdAt: (0, import_pg_core20.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core20.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core20.index)("orders_farmer_idx").on(t.farmerId),
        (0, import_pg_core20.index)("orders_status_idx").on(t.status),
        (0, import_pg_core20.index)("orders_created_idx").on(t.createdAt)
      ]
    );
    orderItems = (0, import_pg_core20.pgTable)(
      "order_items",
      {
        id: (0, import_pg_core20.uuid)("id").primaryKey().defaultRandom(),
        orderId: (0, import_pg_core20.uuid)("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
        productType: productTypeEnum("product_type").notNull(),
        productName: (0, import_pg_core20.varchar)("product_name", { length: 160 }).notNull(),
        quantity: (0, import_pg_core20.decimal)("quantity", { precision: 10, scale: 2 }).notNull(),
        unit: (0, import_pg_core20.varchar)("unit", { length: 30 }).notNull().default("unit"),
        unitPrice: (0, import_pg_core20.decimal)("unit_price", { precision: 12, scale: 2 }).notNull(),
        totalPrice: (0, import_pg_core20.decimal)("total_price", { precision: 12, scale: 2 }).notNull(),
        metadata: (0, import_pg_core20.jsonb)("metadata").$type().default({})
      },
      (t) => [(0, import_pg_core20.index)("order_items_order_idx").on(t.orderId)]
    );
    payments = (0, import_pg_core20.pgTable)(
      "payments",
      {
        id: (0, import_pg_core20.uuid)("id").primaryKey().defaultRandom(),
        orderId: (0, import_pg_core20.uuid)("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
        farmerId: (0, import_pg_core20.uuid)("farmer_id").notNull().references(() => farmers.id, { onDelete: "restrict" }),
        amount: (0, import_pg_core20.decimal)("amount", { precision: 12, scale: 2 }).notNull(),
        currency: (0, import_pg_core20.varchar)("currency", { length: 3 }).notNull().default("INR"),
        method: paymentMethodEnum("method").notNull(),
        status: paymentStatusEnum("status").notNull().default("pending"),
        transactionId: (0, import_pg_core20.varchar)("transaction_id", { length: 120 }),
        gatewayResponse: (0, import_pg_core20.jsonb)("gateway_response").$type(),
        paidAt: (0, import_pg_core20.timestamp)("paid_at", { withTimezone: true }),
        createdAt: (0, import_pg_core20.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core20.index)("payments_order_idx").on(t.orderId),
        (0, import_pg_core20.index)("payments_farmer_idx").on(t.farmerId),
        (0, import_pg_core20.index)("payments_status_idx").on(t.status)
      ]
    );
  }
});

// src/db/schema/notifications.ts
var import_pg_core21, notifications;
var init_notifications = __esm({
  "src/db/schema/notifications.ts"() {
    "use strict";
    import_pg_core21 = require("drizzle-orm/pg-core");
    init_enums();
    init_farmers();
    notifications = (0, import_pg_core21.pgTable)(
      "notifications",
      {
        id: (0, import_pg_core21.uuid)("id").primaryKey().defaultRandom(),
        farmerId: (0, import_pg_core21.uuid)("farmer_id").notNull().references(() => farmers.id, { onDelete: "cascade" }),
        type: notificationTypeEnum("type").notNull(),
        title: (0, import_pg_core21.varchar)("title", { length: 200 }).notNull(),
        body: (0, import_pg_core21.text)("body").notNull(),
        data: (0, import_pg_core21.jsonb)("data").$type().default({}),
        isRead: (0, import_pg_core21.boolean)("is_read").notNull().default(false),
        readAt: (0, import_pg_core21.timestamp)("read_at", { withTimezone: true }),
        createdAt: (0, import_pg_core21.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core21.index)("notifications_farmer_idx").on(t.farmerId),
        (0, import_pg_core21.index)("notifications_type_idx").on(t.type),
        (0, import_pg_core21.index)("notifications_read_idx").on(t.isRead),
        (0, import_pg_core21.index)("notifications_created_idx").on(t.createdAt)
      ]
    );
  }
});

// src/db/schema/otpCodes.ts
var import_pg_core22, otpCodes;
var init_otpCodes = __esm({
  "src/db/schema/otpCodes.ts"() {
    "use strict";
    import_pg_core22 = require("drizzle-orm/pg-core");
    otpCodes = (0, import_pg_core22.pgTable)(
      "otp_codes",
      {
        id: (0, import_pg_core22.uuid)("id").primaryKey().defaultRandom(),
        phone: (0, import_pg_core22.varchar)("phone", { length: 20 }).notNull(),
        /** Local hash (dev) or `tf:{sessionId}` for 2Factor SMS AUTOGEN */
        codeHash: (0, import_pg_core22.varchar)("code_hash", { length: 128 }).notNull(),
        attempts: (0, import_pg_core22.integer)("attempts").notNull().default(0),
        verifiedAt: (0, import_pg_core22.timestamp)("verified_at", { withTimezone: true }),
        expiresAt: (0, import_pg_core22.timestamp)("expires_at", { withTimezone: true }).notNull(),
        createdAt: (0, import_pg_core22.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [(0, import_pg_core22.index)("otp_codes_phone_idx").on(t.phone), (0, import_pg_core22.index)("otp_codes_expires_idx").on(t.expiresAt)]
    );
  }
});

// src/db/schema/pushTokens.ts
var import_pg_core23, pushTokens;
var init_pushTokens = __esm({
  "src/db/schema/pushTokens.ts"() {
    "use strict";
    import_pg_core23 = require("drizzle-orm/pg-core");
    init_farmers();
    pushTokens = (0, import_pg_core23.pgTable)(
      "push_tokens",
      {
        id: (0, import_pg_core23.uuid)("id").primaryKey().defaultRandom(),
        farmerId: (0, import_pg_core23.uuid)("farmer_id").notNull().references(() => farmers.id, { onDelete: "cascade" }),
        expoPushToken: (0, import_pg_core23.text)("expo_push_token").notNull(),
        platform: (0, import_pg_core23.varchar)("platform", { length: 20 }),
        updatedAt: (0, import_pg_core23.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core23.uniqueIndex)("push_tokens_expo_idx").on(t.expoPushToken),
        (0, import_pg_core23.index)("push_tokens_farmer_idx").on(t.farmerId)
      ]
    );
  }
});

// src/db/schema/govtSchemes.ts
var import_pg_core24, govtSchemes;
var init_govtSchemes = __esm({
  "src/db/schema/govtSchemes.ts"() {
    "use strict";
    import_pg_core24 = require("drizzle-orm/pg-core");
    govtSchemes = (0, import_pg_core24.pgTable)(
      "govt_schemes",
      {
        id: (0, import_pg_core24.varchar)("id", { length: 80 }).primaryKey(),
        category: (0, import_pg_core24.varchar)("category", { length: 40 }).notNull(),
        region: (0, import_pg_core24.varchar)("region", { length: 20 }).notNull(),
        status: (0, import_pg_core24.varchar)("status", { length: 20 }).notNull().default("active"),
        titleEn: (0, import_pg_core24.varchar)("title_en", { length: 200 }).notNull(),
        titleTe: (0, import_pg_core24.varchar)("title_te", { length: 200 }).notNull(),
        amountEn: (0, import_pg_core24.varchar)("amount_en", { length: 120 }).notNull().default(""),
        amountTe: (0, import_pg_core24.varchar)("amount_te", { length: 120 }).notNull().default(""),
        benefitEn: (0, import_pg_core24.text)("benefit_en").notNull().default(""),
        benefitTe: (0, import_pg_core24.text)("benefit_te").notNull().default(""),
        eligibilityEn: (0, import_pg_core24.text)("eligibility_en").notNull().default(""),
        eligibilityTe: (0, import_pg_core24.text)("eligibility_te").notNull().default(""),
        howToApplyEn: (0, import_pg_core24.text)("how_to_apply_en").notNull().default(""),
        howToApplyTe: (0, import_pg_core24.text)("how_to_apply_te").notNull().default(""),
        applyUrl: (0, import_pg_core24.text)("apply_url"),
        icon: (0, import_pg_core24.varchar)("icon", { length: 80 }).notNull().default("sprout"),
        highlightsEn: (0, import_pg_core24.jsonb)("highlights_en").$type().notNull().default([]),
        highlightsTe: (0, import_pg_core24.jsonb)("highlights_te").$type().notNull().default([]),
        eligibilityRules: (0, import_pg_core24.jsonb)("eligibility_rules").$type().default({}),
        verifiedAt: (0, import_pg_core24.varchar)("verified_at", { length: 40 }),
        createdAt: (0, import_pg_core24.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: (0, import_pg_core24.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [
        (0, import_pg_core24.index)("govt_schemes_status_idx").on(t.status),
        (0, import_pg_core24.index)("govt_schemes_category_idx").on(t.category),
        (0, import_pg_core24.index)("govt_schemes_region_idx").on(t.region)
      ]
    );
  }
});

// src/db/schema/adminBroadcasts.ts
var import_pg_core25, adminBroadcasts;
var init_adminBroadcasts = __esm({
  "src/db/schema/adminBroadcasts.ts"() {
    "use strict";
    import_pg_core25 = require("drizzle-orm/pg-core");
    adminBroadcasts = (0, import_pg_core25.pgTable)(
      "admin_broadcasts",
      {
        id: (0, import_pg_core25.uuid)("id").primaryKey().defaultRandom(),
        title: (0, import_pg_core25.varchar)("title", { length: 200 }).notNull(),
        body: (0, import_pg_core25.text)("body").notNull(),
        type: (0, import_pg_core25.varchar)("type", { length: 40 }).notNull().default("ai_insight"),
        recipientCount: (0, import_pg_core25.integer)("recipient_count").notNull().default(0),
        pushSent: (0, import_pg_core25.integer)("push_sent").notNull().default(0),
        createdBy: (0, import_pg_core25.varchar)("created_by", { length: 255 }),
        createdAt: (0, import_pg_core25.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (t) => [(0, import_pg_core25.index)("admin_broadcasts_created_idx").on(t.createdAt)]
    );
  }
});

// src/db/schema/relations.ts
var import_drizzle_orm, farmersRelations, landsRelations, surveyNumbersRelations, cropsRelations, cropVarietiesRelations, cropCalendarRelations, weatherRelations, mandiPricesRelations, fertilizersRelations, diseasesRelations, diseaseSpraysRelations, aiPredictionsRelations, ordersRelations, orderItemsRelations, paymentsRelations, notificationsRelations, pushTokensRelations;
var init_relations = __esm({
  "src/db/schema/relations.ts"() {
    "use strict";
    import_drizzle_orm = require("drizzle-orm");
    init_aiPredictions();
    init_cropCalendar();
    init_crops();
    init_fertilizers();
    init_farmers();
    init_mandiPrices();
    init_notifications();
    init_pushTokens();
    init_orders();
    init_weather();
    farmersRelations = (0, import_drizzle_orm.relations)(farmers, ({ many }) => ({
      lands: many(lands),
      cropCalendars: many(cropCalendar),
      weatherSnapshots: many(weather),
      aiPredictions: many(aiPredictions),
      orders: many(orders),
      payments: many(payments),
      notifications: many(notifications),
      pushTokens: many(pushTokens)
    }));
    landsRelations = (0, import_drizzle_orm.relations)(lands, ({ one, many }) => ({
      farmer: one(farmers, { fields: [lands.farmerId], references: [farmers.id] }),
      surveyNumbers: many(surveyNumbers),
      cropCalendars: many(cropCalendar),
      weatherSnapshots: many(weather)
    }));
    surveyNumbersRelations = (0, import_drizzle_orm.relations)(surveyNumbers, ({ one }) => ({
      land: one(lands, { fields: [surveyNumbers.landId], references: [lands.id] })
    }));
    cropsRelations = (0, import_drizzle_orm.relations)(crops, ({ many }) => ({
      varieties: many(cropVarieties),
      calendars: many(cropCalendar),
      fertilizers: many(fertilizers),
      diseases: many(diseases),
      mandiPrices: many(mandiPrices),
      aiPredictions: many(aiPredictions)
    }));
    cropVarietiesRelations = (0, import_drizzle_orm.relations)(cropVarieties, ({ one, many }) => ({
      crop: one(crops, { fields: [cropVarieties.cropId], references: [crops.id] }),
      calendars: many(cropCalendar),
      mandiPrices: many(mandiPrices),
      aiPredictions: many(aiPredictions)
    }));
    cropCalendarRelations = (0, import_drizzle_orm.relations)(cropCalendar, ({ one }) => ({
      farmer: one(farmers, { fields: [cropCalendar.farmerId], references: [farmers.id] }),
      land: one(lands, { fields: [cropCalendar.landId], references: [lands.id] }),
      crop: one(crops, { fields: [cropCalendar.cropId], references: [crops.id] }),
      variety: one(cropVarieties, { fields: [cropCalendar.varietyId], references: [cropVarieties.id] })
    }));
    weatherRelations = (0, import_drizzle_orm.relations)(weather, ({ one }) => ({
      farmer: one(farmers, { fields: [weather.farmerId], references: [farmers.id] }),
      land: one(lands, { fields: [weather.landId], references: [lands.id] })
    }));
    mandiPricesRelations = (0, import_drizzle_orm.relations)(mandiPrices, ({ one }) => ({
      crop: one(crops, { fields: [mandiPrices.cropId], references: [crops.id] }),
      variety: one(cropVarieties, { fields: [mandiPrices.varietyId], references: [cropVarieties.id] })
    }));
    fertilizersRelations = (0, import_drizzle_orm.relations)(fertilizers, ({ one }) => ({
      crop: one(crops, { fields: [fertilizers.cropId], references: [crops.id] })
    }));
    diseasesRelations = (0, import_drizzle_orm.relations)(diseases, ({ one, many }) => ({
      crop: one(crops, { fields: [diseases.cropId], references: [crops.id] }),
      sprays: many(diseaseSprays)
    }));
    diseaseSpraysRelations = (0, import_drizzle_orm.relations)(diseaseSprays, ({ one }) => ({
      disease: one(diseases, { fields: [diseaseSprays.diseaseId], references: [diseases.id] })
    }));
    aiPredictionsRelations = (0, import_drizzle_orm.relations)(aiPredictions, ({ one }) => ({
      farmer: one(farmers, { fields: [aiPredictions.farmerId], references: [farmers.id] }),
      land: one(lands, { fields: [aiPredictions.landId], references: [lands.id] }),
      crop: one(crops, { fields: [aiPredictions.cropId], references: [crops.id] }),
      variety: one(cropVarieties, { fields: [aiPredictions.varietyId], references: [cropVarieties.id] })
    }));
    ordersRelations = (0, import_drizzle_orm.relations)(orders, ({ one, many }) => ({
      farmer: one(farmers, { fields: [orders.farmerId], references: [farmers.id] }),
      items: many(orderItems),
      payments: many(payments)
    }));
    orderItemsRelations = (0, import_drizzle_orm.relations)(orderItems, ({ one }) => ({
      order: one(orders, { fields: [orderItems.orderId], references: [orders.id] })
    }));
    paymentsRelations = (0, import_drizzle_orm.relations)(payments, ({ one }) => ({
      order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
      farmer: one(farmers, { fields: [payments.farmerId], references: [farmers.id] })
    }));
    notificationsRelations = (0, import_drizzle_orm.relations)(notifications, ({ one }) => ({
      farmer: one(farmers, { fields: [notifications.farmerId], references: [farmers.id] })
    }));
    pushTokensRelations = (0, import_drizzle_orm.relations)(pushTokens, ({ one }) => ({
      farmer: one(farmers, { fields: [pushTokens.farmerId], references: [farmers.id] })
    }));
  }
});

// src/db/schema/index.ts
var schema_exports = {};
__export(schema_exports, {
  adminBroadcasts: () => adminBroadcasts,
  agAdvisories: () => agAdvisories,
  agKnowledge: () => agKnowledge,
  agPlaces: () => agPlaces,
  agProducts: () => agProducts,
  agrochemicalTypeEnum: () => agrochemicalTypeEnum,
  agrochemicals: () => agrochemicals,
  aiPredictions: () => aiPredictions,
  aiPredictionsRelations: () => aiPredictionsRelations,
  calendarStageEnum: () => calendarStageEnum,
  confidenceEnum: () => confidenceEnum,
  cropCalendar: () => cropCalendar,
  cropCalendarRelations: () => cropCalendarRelations,
  cropDiseaseCatalog: () => cropDiseaseCatalog,
  cropSeasonEnum: () => cropSeasonEnum,
  cropVarieties: () => cropVarieties,
  cropVarietiesRelations: () => cropVarietiesRelations,
  crops: () => crops,
  cropsRelations: () => cropsRelations,
  dataSourceTypeEnum: () => dataSourceTypeEnum,
  dataSources: () => dataSources,
  diseaseSprays: () => diseaseSprays,
  diseaseSpraysRelations: () => diseaseSpraysRelations,
  diseases: () => diseases,
  diseasesRelations: () => diseasesRelations,
  farmers: () => farmers,
  farmersRelations: () => farmersRelations,
  fertilizerProducts: () => fertilizerProducts,
  fertilizers: () => fertilizers,
  fertilizersRelations: () => fertilizersRelations,
  govtSchemes: () => govtSchemes,
  icarGuidelines: () => icarGuidelines,
  knowledgeTypeEnum: () => knowledgeTypeEnum,
  lands: () => lands,
  landsRelations: () => landsRelations,
  mandiPrices: () => mandiPrices,
  mandiPricesRelations: () => mandiPricesRelations,
  notificationTypeEnum: () => notificationTypeEnum,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orderStatusEnum: () => orderStatusEnum,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  otpCodes: () => otpCodes,
  paymentMethodEnum: () => paymentMethodEnum,
  paymentStatusEnum: () => paymentStatusEnum,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  plantDiseases: () => plantDiseases,
  predictionTypeEnum: () => predictionTypeEnum,
  productTypeEnum: () => productTypeEnum,
  pushTokens: () => pushTokens,
  pushTokensRelations: () => pushTokensRelations,
  seedTypeEnum: () => seedTypeEnum,
  seeds: () => seeds,
  soilHealthRecommendations: () => soilHealthRecommendations,
  soilReadings: () => soilReadings,
  soils: () => soils,
  sprayTypeEnum: () => sprayTypeEnum,
  surveyNumbers: () => surveyNumbers,
  surveyNumbersRelations: () => surveyNumbersRelations,
  syncJobs: () => syncJobs,
  syncStatusEnum: () => syncStatusEnum,
  weather: () => weather,
  weatherConditionEnum: () => weatherConditionEnum,
  weatherRelations: () => weatherRelations
});
var init_schema = __esm({
  "src/db/schema/index.ts"() {
    "use strict";
    init_knowledge();
    init_agKnowledge();
    init_dataIngestion();
    init_syncJobs();
    init_soils();
    init_seeds();
    init_enums();
    init_farmers();
    init_crops();
    init_cropCalendar();
    init_weather();
    init_mandiPrices();
    init_agPlaces();
    init_fertilizers();
    init_fertilizerProducts();
    init_agCatalog();
    init_agProducts();
    init_aiPredictions();
    init_orders();
    init_notifications();
    init_otpCodes();
    init_pushTokens();
    init_govtSchemes();
    init_adminBroadcasts();
    init_relations();
  }
});

// src/db/index.ts
function createDb() {
  loadEnv();
  const sql18 = (0, import_serverless.neon)(getDatabaseUrl());
  return (0, import_neon_http.drizzle)(sql18, { schema: schema_exports });
}
function getDb() {
  if (!dbInstance) dbInstance = createDb();
  return dbInstance;
}
var import_serverless, import_neon_http, dbInstance, db;
var init_db = __esm({
  "src/db/index.ts"() {
    "use strict";
    import_serverless = require("@neondatabase/serverless");
    import_neon_http = require("drizzle-orm/neon-http");
    init_env();
    init_schema();
    dbInstance = null;
    db = new Proxy({}, {
      get(_target, prop) {
        const instance = getDb();
        const value = Reflect.get(instance, prop, instance);
        return typeof value === "function" ? value.bind(instance) : value;
      }
    });
  }
});

// src/ingestion/data/publicationTypes.ts
function publicationPriority(source) {
  return PUBLICATION_SOURCE_PRIORITY[source] ?? 50;
}
var PUBLICATION_SOURCE_PRIORITY;
var init_publicationTypes = __esm({
  "src/ingestion/data/publicationTypes.ts"() {
    "use strict";
    PUBLICATION_SOURCE_PRIORITY = {
      icar: 1,
      pjtsau: 2,
      angrau: 3,
      university_research: 4,
      fao: 5,
      gov_advisory: 6,
      openalex: 7,
      openalex_pest: 7,
      openalex_chem: 7,
      openlibrary: 8,
      icar_consensus: 1,
      ai_cache: 99,
      web_research: 99
    };
  }
});

// src/ingestion/utils.ts
function slugId(text19, prefix = "") {
  const base = text19.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const full = prefix ? `${prefix}_${base}` : base;
  if (full.length <= 40) return full;
  const hash = (0, import_crypto.createHash)("sha256").update(full).digest("hex").slice(0, 8);
  const room = 40 - prefix.length - (prefix ? 1 : 0) - 9;
  return `${prefix ? `${prefix}_` : ""}${base.slice(0, Math.max(room, 8))}_${hash}`.slice(0, 40);
}
function geoKey(lat, lon) {
  return `${lat.toFixed(2)}_${lon.toFixed(2)}`;
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function parseAgmarknetDate(raw) {
  if (!raw?.trim()) return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const dmy = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim();
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
async function fetchJson(url, init) {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${url}: ${body.slice(0, 200)}`);
  }
  return res.json();
}
var import_crypto;
var init_utils = __esm({
  "src/ingestion/utils.ts"() {
    "use strict";
    import_crypto = require("crypto");
  }
});

// src/ingestion/sources/openAlexSource.ts
var openAlexSource_exports = {};
__export(openAlexSource_exports, {
  syncDiseasePestKnowledge: () => syncDiseasePestKnowledge,
  syncOpenAlexResearch: () => syncOpenAlexResearch,
  syncPesticideResearch: () => syncPesticideResearch
});
function invertAbstract2(index22) {
  if (!index22) return "";
  const pairs = [];
  for (const [word, positions] of Object.entries(index22)) {
    for (const pos of positions) pairs.push([pos, word]);
  }
  pairs.sort((a, b) => a[0] - b[0]);
  return pairs.map((p) => p[1]).join(" ").slice(0, 1200);
}
async function syncOpenAlexResearch(perQuery = 8) {
  let fetched = 0;
  let upserted = 0;
  for (const query of RESEARCH_QUERIES) {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&filter=type:article&sort=cited_by_count:desc&per_page=${perQuery}`;
    try {
      const json = await fetchJson(url);
      const results = json.results ?? [];
      fetched += results.length;
      for (const work of results) {
        const title = work.title ?? work.display_name;
        const externalId = work.id?.replace("https://openalex.org/", "") ?? title ?? "";
        if (!title || !externalId) continue;
        const authors = work.authorships?.map((a) => a.author?.display_name).filter(Boolean) ?? [];
        const abstract = invertAbstract2(work.abstract_inverted_index);
        const journal = work.primary_location?.source?.display_name;
        await db.insert(agKnowledge).values({
          type: "research",
          title: title.slice(0, 500),
          summary: abstract.slice(0, 800) || `Research on: ${query}`,
          content: abstract,
          authors: authors.slice(0, 10),
          source: "openalex",
          externalId,
          url: work.doi ? `https://doi.org/${work.doi.replace("https://doi.org/", "")}` : work.id,
          tags: query.split(" ").filter((w) => w.length > 3),
          cropTags: extractCropTags2(query),
          publishedAt: work.publication_year ? /* @__PURE__ */ new Date(`${work.publication_year}-01-01`) : void 0,
          citationCount: work.cited_by_count ?? 0,
          metadata: { journal, query },
          syncedAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: [agKnowledge.source, agKnowledge.externalId],
          set: {
            citationCount: import_drizzle_orm9.sql`excluded.citation_count`,
            summary: import_drizzle_orm9.sql`excluded.summary`,
            syncedAt: /* @__PURE__ */ new Date()
          }
        });
        upserted++;
      }
    } catch (err) {
      console.warn(`OpenAlex skip "${query}":`, err.message);
    }
    await sleep(500);
  }
  return { fetched, upserted };
}
function extractCropTags2(query) {
  const crops2 = [
    "rice",
    "wheat",
    "cotton",
    "tomato",
    "maize",
    "soybean",
    "sugarcane",
    "chickpea",
    "groundnut"
  ];
  return crops2.filter((c) => query.toLowerCase().includes(c));
}
async function syncDiseasePestKnowledge() {
  const topics = [
    { q: "Magnaporthe oryzae rice blast", type: "disease", crop: "rice" },
    { q: "Helicoverpa armigera cotton bollworm", type: "pest", crop: "cotton" },
    { q: "Tomato leaf curl virus", type: "disease", crop: "tomato" },
    { q: "Puccinia triticina wheat rust", type: "disease", crop: "wheat" },
    { q: "Spodoptera frugiperda fall armyworm", type: "pest", crop: "maize" },
    { q: "Aphids crop pest management", type: "pest", crop: "general" },
    { q: "Whitefly Bemisia tabaci pesticide", type: "pest", crop: "general" },
    { q: "Fusarium wilt chickpea", type: "disease", crop: "chickpea" }
  ];
  let fetched = 0;
  let upserted = 0;
  for (const topic of topics) {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(topic.q)}&sort=cited_by_count:desc&per_page=3`;
    try {
      const json = await fetchJson(url);
      const top = json.results?.[0];
      if (!top) continue;
      fetched++;
      const title = top.title ?? topic.q;
      const externalId = `pest_${topic.q.replace(/\s+/g, "_").slice(0, 80)}`;
      const abstract = invertAbstract2(top.abstract_inverted_index);
      await db.insert(agKnowledge).values({
        type: topic.type,
        title: title.slice(0, 500),
        summary: abstract.slice(0, 600) || `Scientific literature on ${topic.q}. Top cited research informs IPM and spray decisions.`,
        content: abstract,
        authors: top.authorships?.map((a) => a.author?.display_name).filter(Boolean),
        source: "openalex_pest",
        externalId,
        url: top.id,
        tags: [topic.type, topic.crop, ...topic.q.split(" ").slice(0, 4)],
        cropTags: [topic.crop],
        citationCount: top.cited_by_count ?? 0,
        metadata: { scientificQuery: topic.q },
        syncedAt: /* @__PURE__ */ new Date()
      }).onConflictDoUpdate({
        target: [agKnowledge.source, agKnowledge.externalId],
        set: { summary: import_drizzle_orm9.sql`excluded.summary`, syncedAt: /* @__PURE__ */ new Date() }
      });
      upserted++;
      await sleep(400);
    } catch {
    }
  }
  return { fetched, upserted };
}
async function syncPesticideResearch() {
  const queries = [
    "tricyclazole rice blast fungicide",
    "imidacloprid neonicotinoid pest control",
    "glyphosate herbicide safety crops",
    "urea nitrogen use efficiency",
    "DAP fertilizer application timing",
    "neem oil biopesticide",
    "copper oxychloride fungicide"
  ];
  let upserted = 0;
  for (const q of queries) {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(q)}&per_page=2&sort=cited_by_count:desc`;
    try {
      const json = await fetchJson(url);
      for (const work of json.results ?? []) {
        const title = work.title ?? q;
        const externalId = `chem_${q.replace(/\s+/g, "_").slice(0, 60)}`;
        await db.insert(agKnowledge).values({
          type: q.includes("fertilizer") || q.includes("urea") || q.includes("DAP") ? "fertilizer" : "pesticide",
          title: title.slice(0, 500),
          summary: invertAbstract2(work.abstract_inverted_index).slice(0, 700) || q,
          source: "openalex_chem",
          externalId,
          url: work.id,
          tags: q.split(" "),
          citationCount: work.cited_by_count ?? 0,
          syncedAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: [agKnowledge.source, agKnowledge.externalId],
          set: { syncedAt: /* @__PURE__ */ new Date() }
        });
        upserted++;
      }
      await sleep(400);
    } catch {
    }
  }
  return { fetched: queries.length, upserted };
}
var import_drizzle_orm9, RESEARCH_QUERIES;
var init_openAlexSource = __esm({
  "src/ingestion/sources/openAlexSource.ts"() {
    "use strict";
    import_drizzle_orm9 = require("drizzle-orm");
    init_db();
    init_schema();
    init_utils();
    RESEARCH_QUERIES = [
      "rice blast disease management India",
      "cotton bollworm integrated pest management",
      "tomato leaf curl virus control",
      "wheat rust fungicide",
      "soil health organic farming",
      "drip irrigation water use efficiency crops",
      "climate change agriculture adaptation",
      "biofertilizer plant growth",
      "pesticide resistance management",
      "precision agriculture smallholder farmers",
      "mandi price forecasting agriculture",
      "sugarcane red rot disease",
      "chickpea wilt management",
      "maize fall armyworm control",
      "soybean rust fungicide timing"
    ];
  }
});

// src/ingestion/data/curatedAgPlaces.ts
var CURATED_AG_PLACES;
var init_curatedAgPlaces = __esm({
  "src/ingestion/data/curatedAgPlaces.ts"() {
    "use strict";
    CURATED_AG_PLACES = [
      // ── Andhra Pradesh mandis ──────────────────────────────────────────────
      {
        placeType: "mandi",
        name: "Guntur APMC",
        district: "Guntur",
        state: "Andhra Pradesh",
        latitude: 16.3067,
        longitude: 80.4365
      },
      {
        placeType: "mandi",
        name: "Vijayawada Nunna APMC",
        district: "Krishna",
        state: "Andhra Pradesh",
        latitude: 16.5193,
        longitude: 80.6305
      },
      {
        placeType: "mandi",
        name: "Kurnool APMC",
        district: "Kurnool",
        state: "Andhra Pradesh",
        latitude: 15.8281,
        longitude: 78.0373
      },
      {
        placeType: "mandi",
        name: "Tirupati APMC",
        district: "Tirupati",
        state: "Andhra Pradesh",
        latitude: 13.6288,
        longitude: 79.4192
      },
      {
        placeType: "mandi",
        name: "Nellore APMC",
        district: "SPSR Nellore",
        state: "Andhra Pradesh",
        latitude: 14.4426,
        longitude: 79.9865
      },
      {
        placeType: "mandi",
        name: "Visakhapatnam Rythu Bazaar / Market Yard",
        district: "Visakhapatnam",
        state: "Andhra Pradesh",
        latitude: 17.6868,
        longitude: 83.2185
      },
      {
        placeType: "mandi",
        name: "Anantapur APMC",
        district: "Anantapur",
        state: "Andhra Pradesh",
        latitude: 14.6819,
        longitude: 77.6006
      },
      {
        placeType: "mandi",
        name: "Kadapa (YSR) APMC",
        district: "YSR Kadapa",
        state: "Andhra Pradesh",
        latitude: 14.4673,
        longitude: 78.8242
      },
      {
        placeType: "mandi",
        name: "Ongole APMC",
        district: "Prakasam",
        state: "Andhra Pradesh",
        latitude: 15.5057,
        longitude: 80.0499
      },
      {
        placeType: "mandi",
        name: "Rajahmundry Market Yard",
        district: "East Godavari",
        state: "Andhra Pradesh",
        latitude: 17.0005,
        longitude: 81.804
      },
      {
        placeType: "mandi",
        name: "Eluru APMC",
        district: "Eluru",
        state: "Andhra Pradesh",
        latitude: 16.7107,
        longitude: 81.0952
      },
      {
        placeType: "mandi",
        name: "Srikakulam APMC",
        district: "Srikakulam",
        state: "Andhra Pradesh",
        latitude: 18.2969,
        longitude: 83.8965
      },
      {
        placeType: "mandi",
        name: "Chittoor APMC",
        district: "Chittoor",
        state: "Andhra Pradesh",
        latitude: 13.2172,
        longitude: 79.1003
      },
      {
        placeType: "mandi",
        name: "Vizianagaram Market Yard",
        district: "Vizianagaram",
        state: "Andhra Pradesh",
        latitude: 18.1067,
        longitude: 83.3956
      },
      // ── Telangana mandis ───────────────────────────────────────────────────
      {
        placeType: "mandi",
        name: "Warangal APMC",
        district: "Warangal",
        state: "Telangana",
        latitude: 17.9689,
        longitude: 79.5941
      },
      {
        placeType: "mandi",
        name: "Karimnagar APMC",
        district: "Karimnagar",
        state: "Telangana",
        latitude: 18.4386,
        longitude: 79.1288
      },
      {
        placeType: "mandi",
        name: "Nizamabad APMC",
        district: "Nizamabad",
        state: "Telangana",
        latitude: 18.6725,
        longitude: 78.0941
      },
      {
        placeType: "mandi",
        name: "Hyderabad Bowenpally Market Yard",
        district: "Hyderabad",
        state: "Telangana",
        latitude: 17.4584,
        longitude: 78.4189
      },
      {
        placeType: "mandi",
        name: "Khammam APMC",
        district: "Khammam",
        state: "Telangana",
        latitude: 17.2473,
        longitude: 80.1514
      },
      {
        placeType: "mandi",
        name: "Mahbubnagar APMC",
        district: "Mahbubnagar",
        state: "Telangana",
        latitude: 16.7375,
        longitude: 78.0081
      },
      {
        placeType: "mandi",
        name: "Nalgonda APMC",
        district: "Nalgonda",
        state: "Telangana",
        latitude: 17.0575,
        longitude: 79.267
      },
      {
        placeType: "mandi",
        name: "Adilabad Market Yard",
        district: "Adilabad",
        state: "Telangana",
        latitude: 19.6641,
        longitude: 78.532
      },
      {
        placeType: "mandi",
        name: "Siddipet APMC",
        district: "Siddipet",
        state: "Telangana",
        latitude: 18.1018,
        longitude: 78.852
      },
      {
        placeType: "mandi",
        name: "Sangareddy Market Yard",
        district: "Sangareddy",
        state: "Telangana",
        latitude: 17.6247,
        longitude: 78.0867
      },
      // ── Shops / dealers ────────────────────────────────────────────────────
      {
        placeType: "fertilizer_shop",
        name: "IFFCO Dealer \u2014 Guntur",
        district: "Guntur",
        state: "Andhra Pradesh",
        address: "Arundelpet, Guntur",
        latitude: 16.306,
        longitude: 80.44
      },
      {
        placeType: "fertilizer_shop",
        name: "PACS Fertilizer \u2014 Tenali",
        district: "Guntur",
        state: "Andhra Pradesh",
        latitude: 16.2428,
        longitude: 80.6404
      },
      {
        placeType: "fertilizer_shop",
        name: "Rythu Bharosa Kendra \u2014 Vijayawada",
        district: "NTR",
        state: "Andhra Pradesh",
        latitude: 16.5062,
        longitude: 80.648
      },
      {
        placeType: "fertilizer_shop",
        name: "Agri Input Dealer \u2014 Kurnool",
        district: "Kurnool",
        state: "Andhra Pradesh",
        latitude: 15.8285,
        longitude: 78.042
      },
      {
        placeType: "fertilizer_shop",
        name: "Rythu Seva Kendram \u2014 Visakhapatnam",
        district: "Visakhapatnam",
        state: "Andhra Pradesh",
        latitude: 17.7215,
        longitude: 83.3042
      },
      {
        placeType: "fertilizer_shop",
        name: "Agri Input Shop \u2014 Anantapur",
        district: "Anantapur",
        state: "Andhra Pradesh",
        latitude: 14.685,
        longitude: 77.605
      },
      {
        placeType: "fertilizer_shop",
        name: "Rythu Bharosa Kendra \u2014 Rajahmundry",
        district: "East Godavari",
        state: "Andhra Pradesh",
        latitude: 17.004,
        longitude: 81.78
      },
      {
        placeType: "fertilizer_shop",
        name: "Telangana Markfed \u2014 Warangal",
        district: "Warangal",
        state: "Telangana",
        latitude: 17.975,
        longitude: 79.6
      },
      {
        placeType: "dealer",
        name: "Seed & Pesticide Dealer \u2014 Karimnagar",
        district: "Karimnagar",
        state: "Telangana",
        latitude: 18.44,
        longitude: 79.13
      },
      {
        placeType: "fertilizer_shop",
        name: "Rythu Vedika / Input Shop \u2014 Nizamabad",
        district: "Nizamabad",
        state: "Telangana",
        latitude: 18.672,
        longitude: 78.1
      },
      {
        placeType: "fertilizer_shop",
        name: "Agri Dealer \u2014 Khammam",
        district: "Khammam",
        state: "Telangana",
        latitude: 17.25,
        longitude: 80.15
      },
      {
        placeType: "dealer",
        name: "Seed & Fertilizer Dealer \u2014 Hyderabad (Bowenpally)",
        district: "Hyderabad",
        state: "Telangana",
        latitude: 17.46,
        longitude: 78.42
      }
    ];
  }
});

// src/services/nearbyAgPlacesService.ts
var nearbyAgPlacesService_exports = {};
__export(nearbyAgPlacesService_exports, {
  findNearbyAgPlacesFromDb: () => findNearbyAgPlacesFromDb,
  seedCuratedAgPlaces: () => seedCuratedAgPlaces
});
function toNumber(value) {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function matchesType(placeType, filter) {
  if (filter === "all") return true;
  if (filter === "mandi") return placeType === "mandi";
  return placeType === "fertilizer_shop" || placeType === "seed_shop" || placeType === "dealer";
}
function rowToNearby(row, fromLat, fromLon) {
  const lat = toNumber(row.latitude);
  const lon = toNumber(row.longitude);
  return {
    id: row.id,
    placeType: row.placeType,
    name: row.name,
    district: row.district,
    state: row.state,
    address: row.address,
    latitude: lat,
    longitude: lon,
    phone: row.phone,
    distanceKm: Math.round(haversineKm(fromLat, fromLon, lat, lon) * 10) / 10,
    source: "database"
  };
}
async function seedCuratedAgPlaces() {
  let inserted = 0;
  let skipped = 0;
  for (const place of CURATED_AG_PLACES) {
    const existing = await db.select({ id: agPlaces.id }).from(agPlaces).where((0, import_drizzle_orm12.and)((0, import_drizzle_orm12.eq)(agPlaces.name, place.name), (0, import_drizzle_orm12.eq)(agPlaces.district, place.district))).limit(1);
    if (existing.length) {
      skipped++;
      continue;
    }
    await db.insert(agPlaces).values({
      placeType: place.placeType,
      name: place.name,
      district: place.district,
      state: place.state,
      address: place.address ?? null,
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      phone: place.phone ?? null,
      source: "curated"
    });
    inserted++;
  }
  return { inserted, skipped };
}
async function findNearbyAgPlacesFromDb(latitude, longitude, type = "all", radiusKm = 120, limit = 30) {
  const rows = await db.select().from(agPlaces).where((0, import_drizzle_orm12.eq)(agPlaces.active, true));
  return rows.filter((row) => matchesType(row.placeType, type)).map((row) => rowToNearby(row, latitude, longitude)).filter((p) => p.distanceKm <= radiusKm).sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit);
}
var import_drizzle_orm12;
var init_nearbyAgPlacesService = __esm({
  "src/services/nearbyAgPlacesService.ts"() {
    "use strict";
    import_drizzle_orm12 = require("drizzle-orm");
    init_db();
    init_agPlaces();
    init_curatedAgPlaces();
  }
});

// src/data/agLocalTerms.ts
function localDiseaseLabel(diseaseId, englishName) {
  for (const key of Object.keys(DISEASE_LOCAL_TE)) {
    if (diseaseId.includes(key) || englishName.toLowerCase().includes(key.replace(/-/g, " "))) {
      return DISEASE_LOCAL_TE[key].nameTe;
    }
  }
  return englishName;
}
function localSymptomsTe(diseaseId, englishSymptoms) {
  for (const key of Object.keys(DISEASE_LOCAL_TE)) {
    if (diseaseId.includes(key)) return DISEASE_LOCAL_TE[key].symptomsTe;
  }
  return englishSymptoms.slice(0, 150);
}
function localPestLabel(target2) {
  const lower = target2.toLowerCase();
  for (const [key, te] of Object.entries(PEST_LOCAL_TE)) {
    if (lower.includes(key)) return te;
  }
  return target2;
}
function localCropLabel(cropId) {
  return CROP_LOCAL_TE[cropId] ?? cropId;
}
var DISEASE_LOCAL_TE, PEST_LOCAL_TE, CROP_LOCAL_TE;
var init_agLocalTerms = __esm({
  "src/data/agLocalTerms.ts"() {
    "use strict";
    DISEASE_LOCAL_TE = {
      "leaf-blight": {
        nameTe: "\u0C06\u0C15\u0C41 \u0C15\u0C3E\u0C32\u0C4D\u0C1A\u0C47 / Leaf blight \u0C30\u0C4B\u0C17\u0C02",
        symptomsTe: "\u0C06\u0C15\u0C41\u0C32\u0C2A\u0C48 \u0C17\u0C4B\u0C21\u0C41\u0C35 \u0C2E\u0C1A\u0C4D\u0C1A\u0C32\u0C41, \u0C06\u0C15\u0C41\u0C32\u0C41 \u0C2E\u0C41\u0C02\u0C26\u0C41\u0C17\u0C3E \u0C2A\u0C21\u0C3F\u0C2A\u0C4B\u0C24\u0C3E\u0C2F\u0C3F"
      },
      rust: {
        nameTe: "\u0C24\u0C17adu / Rust \u0C30\u0C4B\u0C17\u0C02",
        symptomsTe: "\u0C06\u0C15\u0C41\u0C32\u0C2A\u0C48 \u0C28\u0C3E\u0C30\u0C3F\u0C02\u0C1C/\u0C17\u0C4B\u0C27\u0C41\u0C2E \u0C30\u0C02\u0C17\u0C41 \u0C2E\u0C1A\u0C4D\u0C1A\u0C32\u0C41"
      },
      "powdery-mildew": {
        nameTe: "\u0C2A\u0C4A\u0C21\u0C3F \u0C2A\u0C47\u0C28\u0C41\u0C2C\u0C41\u0C1F\u0C4D\u0C1F / Powdery mildew",
        symptomsTe: "\u0C06\u0C15\u0C41\u0C32\u0C2A\u0C48 \u0C24\u0C46\u0C32\u0C4D\u0C32\u0C1F\u0C3F \u0C2A\u0C4A\u0C21\u0C3F \u0C2A\u0C47\u0C28\u0C41\u0C2C\u0C41\u0C1F\u0C4D\u0C1F"
      },
      "downy-mildew": {
        nameTe: "\u0C24\u0C21\u0C3F \u0C2A\u0C47\u0C28\u0C41\u0C2C\u0C41\u0C1F\u0C4D\u0C1F / Downy mildew",
        symptomsTe: "\u0C06\u0C15\u0C41\u0C32\u0C2A\u0C48 \u0C2A\u0C38\u0C41\u0C2A\u0C41 \u0C2E\u0C1A\u0C4D\u0C1A\u0C32\u0C41, \u0C15\u0C3F\u0C02\u0C26 \u0C24\u0C46\u0C32\u0C4D\u0C32\u0C1F\u0C3F fungus"
      },
      wilt: {
        nameTe: "\u0C35\u0C46\u0C32\u0C17 / Wilt \u0C30\u0C4B\u0C17\u0C02",
        symptomsTe: "\u0C2E\u0C4A\u0C15\u0C4D\u0C15 \u0C35\u0C48\u0C2A\u0C41 \u0C35\u0C48\u0C2A\u0C41 \u0C35\u0C3E\u0C21\u0C3F\u0C2A\u0C4B\u0C35\u0C21\u0C02, \u0C06\u0C15\u0C41\u0C32\u0C41 \u0C2E\u0C3E\u0C21\u0C3F\u0C2A\u0C4B\u0C35\u0C21\u0C02"
      },
      "root-rot": {
        nameTe: "\u0C35\u0C47\u0C30\u0C41 \u0C15\u0C41\u0C33\u0C4D\u0C33 / Root rot",
        symptomsTe: "\u0C2E\u0C4A\u0C15\u0C4D\u0C15 \u0C1A\u0C3F\u0C28\u0C4D\u0C28\u0C17\u0C3E, \u0C35\u0C47\u0C30\u0C4D\u0C32\u0C41 \u0C17\u0C4B\u0C27\u0C41\u0C2E \u0C30\u0C02\u0C17\u0C41, \u0C28\u0C3E\u0C1F\u0C3F\u0C28 \u0C2E\u0C4A\u0C15\u0C4D\u0C15\u0C32\u0C41 \u0C1A\u0C28\u0C3F\u0C2A\u0C4B\u0C35\u0C21\u0C02"
      },
      "bacterial-blight": {
        nameTe: "\u0C2C\u0C4D\u0C2F\u0C3E\u0C15\u0C4D\u0C1F\u0C40\u0C30\u0C3F\u0C2F\u0C3E Blight",
        symptomsTe: "\u0C06\u0C15\u0C41\u0C32\u0C2A\u0C48 \u0C28\u0C40\u0C1F\u0C3F soaked \u0C2E\u0C1A\u0C4D\u0C1A\u0C32\u0C41, \u0C2A\u0C38\u0C41\u0C2A\u0C41 \u0C1A\u0C41\u0C1F\u0C4D\u0C1F\u0C41\u0C15\u0C4B\u0C32\u0C41"
      },
      "viral-mosaic": {
        nameTe: "\u0C2E\u0C4A\u0C15\u0C4D\u0C15 / Mosaic virus",
        symptomsTe: "\u0C06\u0C15\u0C41\u0C32\u0C2A\u0C48 \u0C2A\u0C1A\u0C4D\u0C1A-\u0C2A\u0C38\u0C41\u0C2A\u0C41 \u0C2E\u0C1A\u0C4D\u0C1A\u0C32\u0C41, \u0C06\u0C15\u0C41 curl"
      },
      "leaf-spot": {
        nameTe: "\u0C06\u0C15\u0C41 \u0C2E\u0C1A\u0C4D\u0C1A / Leaf spot",
        symptomsTe: "\u0C06\u0C15\u0C41\u0C32\u0C2A\u0C48 \u0C1A\u0C3F\u0C28\u0C4D\u0C28 dark spots, \u0C06\u0C15\u0C41\u0C32\u0C41 \u0C2A\u0C21\u0C3F\u0C2A\u0C4B\u0C24\u0C3E\u0C2F\u0C3F"
      },
      "stem-borer": {
        nameTe: "\u0C15\u0C3E\u0C02\u0C21\u0C02 \u0C2A\u0C4A\u0C26 / Stem borer (\u0C24\u0C46\u0C17)",
        symptomsTe: "\u0C15\u0C3E\u0C02\u0C21\u0C02 \u0C32\u0C4B\u0C2A\u0C32 \u0C2A\u0C41\u0C30\u0C41\u0C17\u0C41, dead heart, white earheads"
      },
      aphids: {
        nameTe: "\u0C0E\u0C26\u0C4D\u0C26 \u0C2A\u0C41\u0C30\u0C41\u0C17\u0C41 / Aphids",
        symptomsTe: "\u0C06\u0C15\u0C41\u0C32\u0C41 curl, honeydew, sooty mould"
      },
      "deficiency-n": {
        nameTe: "\u0C28\u0C24\u0C4D\u0C30\u0C1C\u0C28\u0C3F \u0C32\u0C4B\u0C2A\u0C02",
        symptomsTe: "\u0C2A\u0C3E\u0C24 \u0C06\u0C15\u0C41\u0C32\u0C41 \u0C2A\u0C38\u0C41\u0C2A\u0C41, \u0C2E\u0C4A\u0C15\u0C4D\u0C15 stunt"
      },
      "deficiency-p": {
        nameTe: "\u0C2D\u0C3E\u0C38\u0C4D\u0C35\u0C30\u0C02 \u0C32\u0C4B\u0C2A\u0C02",
        symptomsTe: "\u0C06\u0C15\u0C41\u0C32\u0C41 \u0C28\u0C40\u0C32/\u0C0E\u0C30\u0C41\u0C2A\u0C41 \u0C30\u0C02\u0C17\u0C41, root weak"
      },
      "deficiency-k": {
        nameTe: "\u0C2A\u0C4A\u0C1F\u0C3E\u0C37\u0C4D \u0C32\u0C4B\u0C2A\u0C02",
        symptomsTe: "\u0C06\u0C15\u0C41 \u0C05\u0C02\u0C1A\u0C41\u0C32 scorch, fruit quality poor"
      },
      "deficiency-zn": {
        nameTe: "\u0C1C\u0C3F\u0C02\u0C15\u0C4D \u0C32\u0C4B\u0C2A\u0C02 / Khaira",
        symptomsTe: "\u0C06\u0C15\u0C41\u0C32 \u0C2E\u0C27\u0C4D\u0C2F \u0C2A\u0C38\u0C41\u0C2A\u0C41, rosette leaves"
      }
    };
    PEST_LOCAL_TE = {
      bph: "\u0C17\u0C4B\u0C27\u0C41\u0C2E \u0C2A\u0C4A\u0C26 / Brown Plant Hopper (BPH)",
      bollworm: "\u0C2A\u0C4A\u0C26\u0C2A\u0C41\u0C30\u0C41\u0C17\u0C41 / Bollworm",
      aphids: "\u0C0E\u0C26\u0C4D\u0C26 \u0C2A\u0C41\u0C30\u0C41\u0C17\u0C41 / Aphids",
      jassids: "\u0C2A\u0C1A\u0C4D\u0C1A \u0C2A\u0C41\u0C30\u0C41\u0C17\u0C41 / Jassids",
      whitefly: "\u0C24\u0C46\u0C32\u0C4D\u0C32 \u0C2A\u0C41\u0C30\u0C41\u0C17\u0C41 / Whitefly",
      thrips: "\u0C24\u0C4D\u0C30\u0C3F\u0C2A\u0C4D\u0C38\u0C4D / Thrips",
      "stem borer": "\u0C15\u0C3E\u0C02\u0C21\u0C02 \u0C2A\u0C4A\u0C26 / Stem borer",
      "leaf folder": "\u0C06\u0C15\u0C41 fold / Leaf folder",
      "fruit borer": "\u0C2A\u0C02\u0C21\u0C41 \u0C2A\u0C4A\u0C26 / Fruit borer",
      mites: "\u0C1A\u0C47\u0C24\u0C3F \u0C2A\u0C41\u0C30\u0C41\u0C17\u0C41 / Mites",
      "pod borer": "\u0C2C\u0C3F\u0C2F\u0C4D\u0C2F\u0C02 \u0C2A\u0C4A\u0C26 / Pod borer",
      blast: "\u0C17\u0C21\u0C4D\u0C21\u0C2E / Blast",
      "sheath blight": "Sheath blight / \u0C17\u0C21\u0C4D\u0C21\u0C2E"
    };
    CROP_LOCAL_TE = {
      rice: "\u0C35\u0C30\u0C3F / Rice",
      cotton: "\u0C2A\u0C24\u0C4D\u0C24\u0C3F / Cotton",
      chilli: "\u0C2E\u0C3F\u0C30\u0C2A / Chilli",
      tomato: "\u0C1F\u0C2E\u0C3E\u0C1F / Tomato",
      groundnut: "\u0C35\u0C47\u0C30\u0C41\u0C36\u0C28\u0C17 / Groundnut",
      maize: "\u0C2E\u0C4A\u0C15\u0C4D\u0C15\u0C1C\u0C4A\u0C28\u0C4D\u0C28 / Maize",
      wheat: "\u0C17\u0C4B\u0C27\u0C41\u0C2E / Wheat",
      soybean: "\u0C38\u0C4B\u0C2F\u0C3E / Soybean",
      sugarcane: "\u0C1A\u0C46\u0C30\u0C15\u0C41 / Sugarcane",
      mustard: "\u0C06\u0C35\u0C3E\u0C32 / Mustard"
    };
  }
});

// src/services/agCatalogSearch.ts
var agCatalogSearch_exports = {};
__export(agCatalogSearch_exports, {
  buildAgCatalogContextForAI: () => buildAgCatalogContextForAI,
  formatAgCatalogForAI: () => formatAgCatalogForAI,
  searchAgCatalogForAI: () => searchAgCatalogForAI
});
function isConventionalUrea(name) {
  const n = name.toLowerCase();
  return n.includes("urea") && !n.includes("nano");
}
function prioritizeNanoUrea(products) {
  return [...products].sort((a, b) => {
    const score = (name) => {
      const n = name.toLowerCase();
      if (n.includes("nano urea")) return 0;
      if (n.includes("nano")) return 1;
      return 2;
    };
    return score(a.name) - score(b.name);
  });
}
async function fetchCropAgPack(cropId) {
  const cropFilter = import_drizzle_orm14.sql`${agProducts.crops} @> ${JSON.stringify([cropId])}::jsonb`;
  let [diseases2, pesticides, fungicides] = await Promise.all([
    db.select().from(cropDiseaseCatalog).where((0, import_drizzle_orm14.eq)(cropDiseaseCatalog.cropId, cropId)).limit(12),
    db.select().from(agProducts).where((0, import_drizzle_orm14.and)((0, import_drizzle_orm14.eq)(agProducts.type, "pesticide"), cropFilter)).limit(10),
    db.select().from(agProducts).where((0, import_drizzle_orm14.and)((0, import_drizzle_orm14.eq)(agProducts.type, "fungicide"), cropFilter)).limit(8)
  ]);
  if (!pesticides.length) {
    pesticides = await db.select().from(agProducts).where((0, import_drizzle_orm14.eq)(agProducts.type, "pesticide")).limit(8);
  }
  if (!fungicides.length) {
    fungicides = await db.select().from(agProducts).where((0, import_drizzle_orm14.eq)(agProducts.type, "fungicide")).limit(8);
  }
  return { diseases: diseases2, pesticides, fungicides };
}
function mergeUnique(primary, extra, max) {
  const map = /* @__PURE__ */ new Map();
  for (const item of [...primary, ...extra]) map.set(item.id, item);
  return [...map.values()].slice(0, max);
}
function detectCropId(query, cropHint) {
  if (cropHint?.trim()) return cropHint.trim().toLowerCase();
  const lower = query.toLowerCase();
  for (const [id, aliases] of Object.entries(CROP_ALIASES)) {
    if (aliases.some((a) => lower.includes(a.toLowerCase()))) return id;
  }
  return void 0;
}
function extractProductTerms(query) {
  const lower = query.toLowerCase();
  const terms = /* @__PURE__ */ new Set();
  for (const [, aliases] of Object.entries(PRODUCT_KEYWORDS)) {
    for (const alias of aliases) {
      if (lower.includes(alias.toLowerCase())) terms.add(alias);
    }
  }
  const stop = /* @__PURE__ */ new Set(["the", "and", "for", "what", "give", "me", "ledu", "em", "vadali", "alternative", "available", "not", "use", "cheyali", "panikira"]);
  for (const w of lower.split(/\s+/)) {
    if (w.length > 2 && !stop.has(w)) terms.add(w);
  }
  return [...terms].slice(0, 6);
}
function isAlternativeQuery(query) {
  return ALT_RE.test(query);
}
function mentionsUrea(query) {
  const lower = query.toLowerCase();
  return lower.includes("urea") || lower.includes("\u0C2F\u0C42\u0C30\u0C3F\u0C2F\u0C3E") || lower.includes("yuriya");
}
function productTypesForQuery(query) {
  const types = [];
  if (FERT_RE.test(query) || isAlternativeQuery(query)) types.push("fertilizer");
  if (PEST_RE.test(query)) types.push("pesticide");
  if (FUNG_RE.test(query)) types.push("fungicide");
  if (!types.length) types.push("fertilizer", "pesticide", "fungicide");
  return types;
}
function isFertilizerQuery(query) {
  return FERT_RE.test(query) || isAlternativeQuery(query) || mentionsUrea(query);
}
async function queryProducts(searchTerms, types, cropId, limit = 12) {
  if (!searchTerms.length) return [];
  const termConditions = searchTerms.flatMap((term) => [
    (0, import_drizzle_orm14.ilike)(agProducts.name, `%${term}%`),
    (0, import_drizzle_orm14.ilike)(agProducts.nutrientComposition, `%${term}%`),
    (0, import_drizzle_orm14.ilike)(agProducts.description, `%${term}%`),
    (0, import_drizzle_orm14.ilike)(agProducts.npkRatio, `%${term}%`)
  ]);
  const conditions = [(0, import_drizzle_orm14.or)(...termConditions), (0, import_drizzle_orm14.inArray)(agProducts.type, types)];
  if (cropId) {
    conditions.push(import_drizzle_orm14.sql`${agProducts.crops} @> ${JSON.stringify([cropId])}::jsonb`);
  }
  return db.select().from(agProducts).where((0, import_drizzle_orm14.and)(...conditions)).limit(limit);
}
async function searchAgCatalogForAI(query, cropHint, limit = 12) {
  const q = query.trim();
  if (!q) return { products: [], diseases: [] };
  const cropId = detectCropId(q, cropHint);
  const types = productTypesForQuery(q);
  const terms = extractProductTerms(q);
  const isAlt = isAlternativeQuery(q);
  let products;
  if (isAlt && mentionsUrea(q)) {
    const nanoProducts = await queryProducts(["nano urea", "nano dap"], ["fertilizer"], cropId, 6);
    const otherProducts = await queryProducts(
      UREA_ALTERNATIVE_TERMS.filter((t) => !t.includes("nano")),
      ["fertilizer"],
      cropId,
      limit
    );
    if (!nanoProducts.length && !otherProducts.length && cropId) {
      const nanoAny = await queryProducts(["nano urea"], ["fertilizer"], void 0, 6);
      const otherAny = await queryProducts(
        UREA_ALTERNATIVE_TERMS.filter((t) => !t.includes("nano")),
        ["fertilizer"],
        void 0,
        limit
      );
      products = [...nanoAny, ...otherAny];
    } else {
      products = [...nanoProducts, ...otherProducts];
    }
    products = products.filter((p) => !isConventionalUrea(p.name));
  } else if (q.toLowerCase().includes("nano")) {
    products = await queryProducts(["nano urea", "nano dap"], types, cropId, limit);
    if (!products.length && cropId) {
      products = await queryProducts(["nano urea", "nano dap"], types, void 0, limit);
    }
  } else {
    products = await queryProducts(terms, types, cropId, limit);
    if (!products.length && cropId) {
      products = await queryProducts(terms, types, void 0, limit);
    }
  }
  if (!products.length && (mentionsUrea(q) || isAlt)) {
    products = (await db.select().from(agProducts).where(
      (0, import_drizzle_orm14.and)(
        (0, import_drizzle_orm14.eq)(agProducts.type, "fertilizer"),
        (0, import_drizzle_orm14.or)(
          (0, import_drizzle_orm14.ilike)(agProducts.name, "%nano urea%"),
          (0, import_drizzle_orm14.ilike)(agProducts.name, "%ammonium%"),
          (0, import_drizzle_orm14.ilike)(agProducts.name, "%nitrate%"),
          (0, import_drizzle_orm14.ilike)(agProducts.name, "%dap%")
        )
      )
    ).limit(limit)).filter((p) => !isConventionalUrea(p.name));
  }
  let diseases2 = [];
  const needsDiseases = !isFertilizerQuery(q) || DISEASE_RE.test(q) || FUNG_RE.test(q) || PEST_RE.test(q);
  if (needsDiseases && (DISEASE_RE.test(q) || FUNG_RE.test(q) || PEST_RE.test(q) || cropId)) {
    const pattern = `%${terms[0] ?? q.slice(0, 40)}%`;
    const diseaseConditions = [
      (0, import_drizzle_orm14.or)(
        (0, import_drizzle_orm14.ilike)(cropDiseaseCatalog.name, pattern),
        (0, import_drizzle_orm14.ilike)(cropDiseaseCatalog.symptoms, pattern),
        (0, import_drizzle_orm14.ilike)(cropDiseaseCatalog.treatment, pattern)
      )
    ];
    if (cropId && !isFertilizerQuery(q)) {
      diseaseConditions.push((0, import_drizzle_orm14.eq)(cropDiseaseCatalog.cropId, cropId));
    } else if (!DISEASE_RE.test(q) && !FUNG_RE.test(q) && !PEST_RE.test(q)) {
      diseaseConditions.push(import_drizzle_orm14.sql`false`);
    }
    diseases2 = await db.select().from(cropDiseaseCatalog).where((0, import_drizzle_orm14.and)(...diseaseConditions)).limit(limit);
  }
  return { products: prioritizeNanoUrea(products).slice(0, limit), diseases: diseases2.slice(0, limit) };
}
function formatAgCatalogForAI(products, diseases2, query, cropHint) {
  if (!products.length && !diseases2.length) {
    return "";
  }
  const lines = [
    `=== ${cropHint ? localCropLabel(cropHint) : "Panta"} \u2014 DB nundi rogalu & mandulu ===`,
    "AI: Kindha unna perlu + dose matrame cheppandi. English textbook style vadhu \u2014 simple Telugu.",
    "Format: Rogam local peru \u2192 lakshanaalu \u2192 mandu peru + motta/acre \u2192 eppudu spray cheyali.",
    ""
  ];
  if (products.length) {
    lines.push("--- MANDU / PESTICIDES / FUNGICIDES (\u0C0E\u0C30\u0C41\u0C35\u0C41 & \u0C2E\u0C02\u0C26ulu) ---");
    for (const p of products.slice(0, 12)) {
      const pestLabel = p.targetPest ? localPestLabel(p.targetPest) : p.targetDisease ? localPestLabel(p.targetDisease) : "";
      lines.push(`\u2022 ${p.name}${p.brand ? ` (${p.brand})` : ""} \u2014 ${p.type}`);
      if (pestLabel) lines.push(`  Target / Rogam-Purugu: ${pestLabel}`);
      lines.push(`  Dose / Motta: ${p.dosage}`);
      if (p.activeIngredient) lines.push(`  Active: ${p.activeIngredient}`);
      if (p.applicationMethod) lines.push(`  Vidhanam: ${p.applicationMethod.slice(0, 120)}`);
      lines.push("");
    }
  }
  if (diseases2.length) {
    lines.push("--- ROGALU / DISEASES ---");
    for (const d of diseases2.slice(0, 10)) {
      const teName = localDiseaseLabel(d.id, d.name);
      const teSym = localSymptomsTe(d.id, d.symptoms);
      lines.push(`\u2022 ${teName}`);
      lines.push(`  Lakshanaalu: ${teSym}`);
      if (d.treatment) lines.push(`  Mandu/Chikitsa: ${d.treatment.slice(0, 150)}`);
      if (d.prevention) lines.push(`  Nivarana: ${d.prevention.slice(0, 100)}`);
      lines.push("");
    }
  }
  if (cropHint) lines.push(`Farmer crop context: ${cropHint}`);
  return lines.join("\n");
}
async function buildAgCatalogContextForAI(query, cropIds = []) {
  const cropHint = cropIds[0];
  const agHealthQuery = PEST_RE.test(query) || DISEASE_RE.test(query) || FUNG_RE.test(query);
  let { products, diseases: diseases2 } = await searchAgCatalogForAI(query, cropHint, 15);
  if (cropHint) {
    const pack = await fetchCropAgPack(cropHint);
    diseases2 = mergeUnique(diseases2, pack.diseases, 15);
    if (agHealthQuery || !products.length) {
      products = mergeUnique(products, [...pack.pesticides, ...pack.fungicides], 15);
    }
  }
  if (!products.length && !diseases2.length && cropHint) {
    const pack = await fetchCropAgPack(cropHint);
    diseases2 = mergeUnique(diseases2, pack.diseases, 15);
    products = mergeUnique(products, [...pack.pesticides, ...pack.fungicides], 15);
  }
  if (!products.length && cropIds.length > 1) {
    const retry = await searchAgCatalogForAI(query, cropIds[1], 12);
    products = mergeUnique(products, retry.products, 15);
    diseases2 = mergeUnique(diseases2, retry.diseases, 12);
  }
  return formatAgCatalogForAI(products, diseases2, query, cropHint);
}
var import_drizzle_orm14, FERT_RE, PEST_RE, FUNG_RE, DISEASE_RE, ALT_RE, PRODUCT_KEYWORDS, UREA_ALTERNATIVE_TERMS, CROP_ALIASES;
var init_agCatalogSearch = __esm({
  "src/services/agCatalogSearch.ts"() {
    "use strict";
    import_drizzle_orm14 = require("drizzle-orm");
    init_db();
    init_agProducts();
    init_agLocalTerms();
    FERT_RE = /\b(fertilizer|fertiliser|urea|dap|npk|micronutrient|zinc|boron|compost|manure|dose|dosage|eruvu|ఎరువ|యూరియా)\b/i;
    PEST_RE = /\b(pest|insect|bollworm|aphid|thrips|whitefly|spray|pesticide|insecticide|ipm|mandu|purugu|poda|tega|gaddam|rogam)\b|తెగ|రోగ|పురుగ|పురుగు|పిచికారి|మంద|పొద|గడ్డ/i;
    FUNG_RE = /\b(fungus|fungal|fungicide|blight|rust|mildew|rot|wilt|anthracnose|sheath)\b|రోగ|గడ్డ|పేన/i;
    DISEASE_RE = /\b(disease|symptom|deficiency|chlorosis|yellow|spots|lesion|rogam|rogalu|lakshana|vastayi|gaddama|maccha|cheputunnaru)\b|రోగ|లక్ష|గడ్డ|మచ్చ|పసుప/i;
    ALT_RE = /\b(alternative|substitute|instead|ledu|lekapothe|badulu|replace|not available|unavailable|em vadali|panikira|substitute|బదుల)\b/i;
    PRODUCT_KEYWORDS = {
      urea: ["urea", "\u0C2F\u0C42\u0C30\u0C3F\u0C2F\u0C3E", "yuriya"],
      nano: ["nano urea", "nano", "\u0C28\u0C3E\u0C28\u0C4B", "nano dap"],
      dap: ["dap", "\u0C21\u0C3E\u0C2A"],
      npk: ["npk"],
      mop: ["mop", "potash", "potassium"],
      ssp: ["ssp"],
      zinc: ["zinc", "\u0C1C\u0C3F\u0C02\u0C15"],
      ammonium: ["ammonium", "ammonium sulphate", "ammonium sulfate"],
      nitrate: ["nitrate", "calcium nitrate"]
    };
    UREA_ALTERNATIVE_TERMS = [
      "nano urea",
      "nano dap",
      "ammonium sulphate",
      "ammonium sulfate",
      "calcium nitrate",
      "dap",
      "npk 19",
      "npk 20",
      "npk 15",
      "npk 12",
      "npk 10",
      "map"
    ];
    CROP_ALIASES = {
      rice: ["rice", "paddy", "vari", "\u0C35\u0C30\u0C3F"],
      cotton: ["cotton", "patti", "\u0C2A\u0C24\u0C4D\u0C24\u0C3F"],
      chilli: ["chilli", "chili", "mirchi", "\u0C2E\u0C3F\u0C30", "mirap"],
      tomato: ["tomato", "\u0C1F\u0C2E\u0C3E\u0C1F", "tamata"],
      groundnut: ["groundnut", "peanut", "verusenaga", "\u0C35\u0C47\u0C30"],
      maize: ["maize", "corn", "mokkajonna", "\u0C2E\u0C4A\u0C15"],
      wheat: ["wheat", "\u0C17\u0C4B\u0C27"]
    };
  }
});

// src/services/knowledgeSearch.ts
var knowledgeSearch_exports = {};
__export(knowledgeSearch_exports, {
  buildKnowledgeContextForAI: () => buildKnowledgeContextForAI,
  formatKnowledgeForAI: () => formatKnowledgeForAI,
  searchKnowledge: () => searchKnowledge
});
async function searchKnowledge(query, limit = 20) {
  const q = query.trim();
  if (!q) return [];
  const pattern = `%${q}%`;
  const words = q.split(/\s+/).filter((w) => w.length > 2).slice(0, 4);
  const rows = await db.select({
    type: agKnowledge.type,
    title: agKnowledge.title,
    summary: agKnowledge.summary,
    authors: agKnowledge.authors,
    url: agKnowledge.url,
    source: agKnowledge.source,
    citationCount: agKnowledge.citationCount,
    tags: agKnowledge.tags
  }).from(agKnowledge).where(
    (0, import_drizzle_orm15.or)(
      (0, import_drizzle_orm15.ilike)(agKnowledge.title, pattern),
      (0, import_drizzle_orm15.ilike)(agKnowledge.summary, pattern),
      (0, import_drizzle_orm15.ilike)(agKnowledge.content, pattern),
      import_drizzle_orm15.sql`${agKnowledge.tags}::text ilike ${pattern}`,
      ...words.map((w) => (0, import_drizzle_orm15.ilike)(agKnowledge.title, `%${w}%`))
    )
  ).orderBy((0, import_drizzle_orm15.desc)(agKnowledge.citationCount)).limit(limit * 2);
  const hits = rows.map((r) => ({
    type: r.type,
    title: r.title,
    summary: r.summary,
    authors: r.authors ?? [],
    url: r.url,
    source: r.source,
    citationCount: r.citationCount,
    tags: r.tags ?? []
  })).sort((a, b) => {
    const pa = publicationPriority(a.source);
    const pb = publicationPriority(b.source);
    if (pa !== pb) return pa - pb;
    return (b.citationCount ?? 0) - (a.citationCount ?? 0);
  }).slice(0, limit);
  if (hits.length < limit) {
    const diseaseRows = await db.select().from(diseases).where((0, import_drizzle_orm15.or)((0, import_drizzle_orm15.ilike)(diseases.name, pattern), (0, import_drizzle_orm15.ilike)(diseases.symptoms, pattern))).limit(5);
    for (const d of diseaseRows) {
      const sprays = await db.select().from(diseaseSprays).where(import_drizzle_orm15.sql`${diseaseSprays.diseaseId} = ${d.id}`).limit(3);
      hits.push({
        type: "disease",
        title: d.name,
        summary: `${d.symptoms ?? ""} \u2192 ${sprays.map((s) => s.productName).join(", ")}`,
        authors: [],
        url: null,
        source: "database",
        citationCount: null,
        tags: [d.cropId]
      });
    }
    const chemRows = await db.select().from(agrochemicals).where((0, import_drizzle_orm15.or)((0, import_drizzle_orm15.ilike)(agrochemicals.name, pattern), (0, import_drizzle_orm15.ilike)(agrochemicals.target, pattern))).limit(5);
    for (const c of chemRows) {
      hits.push({
        type: c.type,
        title: c.name,
        summary: [c.dose, c.timing, c.target].filter(Boolean).join(" "),
        authors: [],
        url: null,
        source: c.source,
        citationCount: null,
        tags: []
      });
    }
  }
  return hits.slice(0, limit);
}
function formatKnowledgeForAI(hits, query, catalogContext = "") {
  const sections = [];
  if (catalogContext.trim()) {
    sections.push(catalogContext.trim(), "");
  }
  if (!hits.length && !catalogContext.trim()) {
    return `No matching entries in Bhuvedam farming library for "${query}". Answer from your full agriculture expertise. Save a clear answer for future farmers.`;
  }
  if (hits.length) {
    const lines = [`Agriculture knowledge for: "${query}" (${hits.length} research/sources)`, ""];
    for (const h of hits) {
      const auth = h.authors.length ? ` \u2014 ${h.authors.slice(0, 3).join(", ")}` : "";
      const cite = h.citationCount ? ` [${h.citationCount} citations]` : "";
      const priority = publicationPriority(h.source);
      const trust = priority <= 3 ? "\u2605\u2605\u2605 trusted" : priority <= 6 ? "\u2605\u2605 official" : "research";
      lines.push(`[${h.type.toUpperCase()}|${h.source}|${trust}] ${h.title}${auth}${cite}`);
      if (h.summary) lines.push(`  ${h.summary.slice(0, 450)}`);
      if (h.url) lines.push(`  Link: ${h.url}`);
      lines.push("");
    }
    lines.push(
      "Use research above + DB products when helpful. Reason naturally \u2014 do not read like a fixed script."
    );
    sections.push(lines.join("\n"));
  }
  return sections.join("\n\n") || catalogContext;
}
async function buildKnowledgeContextForAI(query, cropIds = []) {
  const [hits, catalogContext] = await Promise.all([
    searchKnowledge(query, 15),
    buildAgCatalogContextForAI(query, cropIds)
  ]);
  return formatKnowledgeForAI(hits, query, catalogContext);
}
var import_drizzle_orm15;
var init_knowledgeSearch = __esm({
  "src/services/knowledgeSearch.ts"() {
    "use strict";
    import_drizzle_orm15 = require("drizzle-orm");
    init_db();
    init_schema();
    init_publicationTypes();
    init_agCatalogSearch();
  }
});

// src/vercelHandler.cts
var import_node_server2 = require("@hono/node-server");

// src/server/index.ts
var import_node_server = require("@hono/node-server");
var import_serve_static = require("@hono/node-server/serve-static");
var import_dotenv3 = require("dotenv");
var import_drizzle_orm26 = require("drizzle-orm");
var import_hono2 = require("hono");
var import_cors = require("hono/cors");
var import_node_path = __toESM(require("node:path"), 1);
init_db();
init_schema();
init_agCatalog();
init_agProducts();
init_fertilizerProducts();

// src/errors/appError.ts
var APP_ERROR = {
  MOBILE_REQUIRED: {
    code: "MOBILE_REQUIRED",
    message: "Mobile number is required",
    status: 400
  },
  NAME_REQUIRED: {
    code: "NAME_REQUIRED",
    message: "Please enter your name",
    status: 400
  },
  PASSWORD_REQUIRED: {
    code: "PASSWORD_REQUIRED",
    message: "Password is required",
    status: 400
  },
  INVALID_NAME: {
    code: "INVALID_NAME",
    message: "Please enter a valid name (at least 2 characters)",
    status: 400
  },
  WEAK_PASSWORD: {
    code: "WEAK_PASSWORD",
    message: "Password must be at least 8 characters",
    status: 400
  },
  INVALID_PHONE: {
    code: "INVALID_PHONE",
    message: "Enter a valid 10-digit mobile number",
    status: 400
  },
  INVALID_EMAIL: {
    code: "INVALID_EMAIL",
    message: "Enter a valid email address",
    status: 400
  },
  PHONE_TAKEN: {
    code: "PHONE_TAKEN",
    message: "This mobile number is already registered. Try logging in.",
    status: 409
  },
  MOBILE_NOT_REGISTERED: {
    code: "MOBILE_NOT_REGISTERED",
    message: "This mobile number is not registered. Please sign up first.",
    status: 404
  },
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    message: "Wrong mobile number or password",
    status: 401
  },
  ACCOUNT_DISABLED: {
    code: "ACCOUNT_DISABLED",
    message: "Account is disabled. Contact support.",
    status: 403
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Please log in again to continue",
    status: 401
  },
  SESSION_EXPIRED: {
    code: "SESSION_EXPIRED",
    message: "Your session expired. Please log in again.",
    status: 401
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    message: "You do not have permission for this action",
    status: 403
  },
  OTP_EXPIRED: {
    code: "OTP_EXPIRED",
    message: "OTP expired. Request a new one.",
    status: 401
  },
  OTP_INVALID: {
    code: "OTP_INVALID",
    message: "Wrong OTP. Please try again.",
    status: 401
  },
  OTP_MAX_ATTEMPTS: {
    code: "OTP_MAX_ATTEMPTS",
    message: "Too many attempts. Request a new OTP.",
    status: 401
  },
  OTP_WAIT: {
    code: "OTP_WAIT",
    message: "Please wait before requesting another OTP",
    status: 429
  },
  OTP_SEND_FAILED: {
    code: "OTP_SEND_FAILED",
    message: "Could not send OTP. Try again later.",
    status: 503
  },
  WRONG_PASSWORD: {
    code: "WRONG_PASSWORD",
    message: "Current password is wrong",
    status: 401
  },
  NO_PASSWORD: {
    code: "NO_PASSWORD",
    message: "No password set. Use Forgot Password on the login screen.",
    status: 400
  },
  SAME_PASSWORD: {
    code: "SAME_PASSWORD",
    message: "New password must be different from current password",
    status: 400
  },
  REGISTER_FAILED: {
    code: "REGISTER_FAILED",
    message: "Could not create account. Please try again.",
    status: 500
  },
  LOGIN_FAILED: {
    code: "LOGIN_FAILED",
    message: "Login failed. Please try again.",
    status: 500
  },
  RESET_FAILED: {
    code: "RESET_FAILED",
    message: "Could not reset password. Please try again.",
    status: 500
  },
  CHANGE_PASSWORD_FAILED: {
    code: "CHANGE_PASSWORD_FAILED",
    message: "Could not change password. Please try again.",
    status: 500
  },
  LEGACY_LOGIN_DISABLED: {
    code: "LEGACY_LOGIN_DISABLED",
    message: "This login method is not available. Use password or OTP login.",
    status: 403
  },
  INVALID_REQUEST: {
    code: "INVALID_REQUEST",
    message: "Some information is missing or invalid. Please check and try again.",
    status: 400
  },
  FARMER_NOT_FOUND: {
    code: "FARMER_NOT_FOUND",
    message: "Farm profile not found. Please log in again.",
    status: 404
  },
  SYNC_FAILED: {
    code: "SYNC_FAILED",
    message: "Could not save your farm details. Please try again.",
    status: 500
  },
  CROP_NOT_FOUND: {
    code: "CROP_NOT_FOUND",
    message: "Crop information is not available right now.",
    status: 404
  },
  FERTILIZER_NOT_FOUND: {
    code: "FERTILIZER_NOT_FOUND",
    message: "Fertilizer product not found.",
    status: 404
  },
  DISEASE_NOT_FOUND: {
    code: "DISEASE_NOT_FOUND",
    message: "Disease information not found.",
    status: 404
  },
  PRODUCT_NOT_FOUND: {
    code: "PRODUCT_NOT_FOUND",
    message: "Product not found.",
    status: 404
  },
  INVALID_PRODUCT_TYPE: {
    code: "INVALID_PRODUCT_TYPE",
    message: "Invalid product type selected.",
    status: 400
  },
  LOCATION_REQUIRED: {
    code: "LOCATION_REQUIRED",
    message: "Location is required for this feature.",
    status: 400
  },
  SEARCH_REQUIRED: {
    code: "SEARCH_REQUIRED",
    message: "Please enter a search word.",
    status: 400
  },
  PUSH_TOKEN_REQUIRED: {
    code: "PUSH_TOKEN_REQUIRED",
    message: "Could not register notifications on this device.",
    status: 400
  },
  NOTIFICATION_NOT_FOUND: {
    code: "NOTIFICATION_NOT_FOUND",
    message: "Notification not found.",
    status: 404
  },
  NOTIFICATION_FIELDS_REQUIRED: {
    code: "NOTIFICATION_FIELDS_REQUIRED",
    message: "Notification title and message are required.",
    status: 400
  },
  AI_MESSAGES_REQUIRED: {
    code: "AI_MESSAGES_REQUIRED",
    message: "Please type a message to send to the assistant.",
    status: 400
  },
  AI_NOT_CONFIGURED: {
    code: "AI_NOT_CONFIGURED",
    message: "AI assistant is not configured on the server.",
    status: 503
  },
  AI_UNAVAILABLE: {
    code: "AI_UNAVAILABLE",
    message: "AI assistant is temporarily unavailable. Try again later.",
    status: 503
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "Could not connect to server. Check your internet and try again.",
    status: 503
  },
  SERVER_ERROR: {
    code: "SERVER_ERROR",
    message: "Something went wrong. Please try again.",
    status: 500
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    message: "The requested information was not found.",
    status: 404
  }
};
function appError(c, key, extras) {
  const entry = APP_ERROR[key];
  return c.json(
    {
      code: entry.code,
      ...extras?.retryAfterSec != null ? { retryAfterSec: extras.retryAfterSec } : {}
    },
    entry.status
  );
}
function parseOtpWaitSeconds(message) {
  const m = /^WAIT_(\d+)$/.exec(message);
  return m ? Number(m[1]) : void 0;
}

// src/ingestion/sources/bulkAgCatalogSource.ts
var import_drizzle_orm2 = require("drizzle-orm");
init_db();
init_agProducts();
init_crops();

// src/ingestion/data/bulkMasters.ts
var GROWTH_STAGES = [
  "seedling",
  "vegetative",
  "tillering",
  "flowering",
  "fruiting",
  "maturity",
  "harvest"
];
var SOIL_TYPES = [
  "black_cotton",
  "red",
  "alluvial",
  "sandy_loam",
  "clay_loam",
  "laterite",
  "alkaline",
  "saline"
];
var NUTRIENT_DEFICIENCY_SYMPTOMS = {
  nitrogen: ["Yellowing of older leaves", "Stunted growth", "Pale green plant"],
  phosphorus: ["Purple/reddish leaves", "Poor root development", "Delayed maturity"],
  potassium: ["Leaf edge scorching", "Weak stems", "Poor fruit quality"],
  zinc: ["Interveinal chlorosis", "Rosette leaves", "Khaira in rice"],
  iron: ["Young leaf chlorosis", "Veins stay green", "Stunted shoots"],
  boron: ["Hollow stem", "Poor fruit set", "Cracked fruit"],
  sulphur: ["Uniform yellowing", "Stunted growth", "Reduced oil in oilseeds"],
  manganese: ["Grey speckled leaves", "Interveinal chlorosis on young leaves"]
};
var INSECTICIDE_ACTIVES = [
  { name: "Imidacloprid 17.8% SL", dose: "60 ml/acre", targets: ["Aphids", "Jassids", "Whitefly", "BPH"], crops: ["cotton", "rice", "chilli", "tomato", "groundnut"] },
  { name: "Lambda-cyhalothrin 5% EC", dose: "80 ml/acre", targets: ["Bollworm", "Pod borer", "Stem borer"], crops: ["cotton", "chickpea", "maize", "tomato"] },
  { name: "Chlorpyriphos 20% EC", dose: "250 ml/acre", targets: ["Stem borer", "Root grubs", "Termites"], crops: ["rice", "sugarcane", "groundnut", "cotton"] },
  { name: "Monocrotophos 36% SL", dose: "200 ml/acre", targets: ["Aphids", "Thrips", "Leaf hopper"], crops: ["cotton", "chilli", "brinjal", "okra"] },
  { name: "Quinalphos 25% EC", dose: "400 ml/acre", targets: ["Bollworm", "Leaf roller", "Gall fly"], crops: ["cotton", "rice", "mustard"] },
  { name: "Dimethoate 30% EC", dose: "300 ml/acre", targets: ["Aphids", "Mites", "Jassids"], crops: ["cotton", "chilli", "citrus", "vegetables"] },
  { name: "Triazophos 40% EC", dose: "250 ml/acre", targets: ["Stem borer", "Leaf folder", "BPH"], crops: ["rice", "cotton", "soybean"] },
  { name: "Profenofos 50% EC", dose: "200 ml/acre", targets: ["Bollworm", "Spodoptera", "Mites"], crops: ["cotton", "chilli", "soybean", "tomato"] },
  { name: "Spinosad 45% SC", dose: "80 ml/acre", targets: ["Fruit borer", "Spodoptera", "Thrips"], crops: ["cotton", "chilli", "tomato", "cabbage"] },
  { name: "Emamectin benzoate 5% SG", dose: "80 g/acre", targets: ["Bollworm", "Fruit borer", "DBM"], crops: ["cotton", "chilli", "tomato", "cabbage"] },
  { name: "Indoxacarb 14.5% SC", dose: "150 ml/acre", targets: ["Bollworm", "Spodoptera", "Leaf folder"], crops: ["cotton", "rice", "chilli"] },
  { name: "Thiamethoxam 25% WG", dose: "40 g/acre", targets: ["Aphids", "Jassids", "Whitefly"], crops: ["cotton", "rice", "wheat", "vegetables"] },
  { name: "Acetamiprid 20% SP", dose: "40 g/acre", targets: ["Aphids", "Whitefly", "Jassids"], crops: ["cotton", "chilli", "brinjal", "citrus"] },
  { name: "Fipronil 5% SC", dose: "400 ml/acre", targets: ["Stem borer", "White grubs", "Termites"], crops: ["rice", "sugarcane", "groundnut"] },
  { name: "Cartap hydrochloride 50% SP", dose: "500 g/acre", targets: ["BPH", "Leaf folder", "Stem borer"], crops: ["rice", "cotton"] },
  { name: "Buprofezin 25% SC", dose: "400 ml/acre", targets: ["BPH", "Planthopper", "Whitefly nymphs"], crops: ["rice", "cotton", "citrus"] },
  { name: "Pymetrozine 50% WG", dose: "120 g/acre", targets: ["BPH", "Aphids", "Whitefly"], crops: ["rice", "cotton", "potato"] },
  { name: "Flubendiamide 39.35% SC", dose: "60 ml/acre", targets: ["Bollworm", "Fruit borer", "Stem borer"], crops: ["cotton", "chilli", "tomato", "rice"] },
  { name: "Chlorantraniliprole 18.5% SC", dose: "60 ml/acre", targets: ["Bollworm", "Spodoptera", "Stem borer"], crops: ["cotton", "rice", "maize", "soybean"] },
  { name: "Abamectin 1.9% EC", dose: "200 ml/acre", targets: ["Mites", "Thrips", "Leaf miner"], crops: ["cotton", "chilli", "tomato", "grapes"] },
  { name: "Spiromesifen 22.9% SC", dose: "300 ml/acre", targets: ["Mites", "Whitefly"], crops: ["cotton", "chilli", "tomato", "citrus"] },
  { name: "Diafenthiuron 50% WP", dose: "200 g/acre", targets: ["Whitefly", "Mites", "Thrips"], crops: ["cotton", "chilli", "citrus"] },
  { name: "Novaluron 10% EC", dose: "400 ml/acre", targets: ["Bollworm", "DBM", "Fruit borer"], crops: ["cotton", "cabbage", "tomato"] },
  { name: "Lufenuron 5.4% EC", dose: "400 ml/acre", targets: ["Bollworm", "Spodoptera"], crops: ["cotton", "chilli", "tomato"] },
  { name: "Metaflumizone 22% SC", dose: "200 ml/acre", targets: ["Bollworm", "Beetle"], crops: ["cotton", "potato", "tomato"] },
  { name: "Cyantraniliprole 10.26% OD", dose: "150 ml/acre", targets: ["Fruit borer", "Thrips", "Whitefly"], crops: ["cotton", "chilli", "vegetables"] },
  { name: "Spinetoram 11.7% SC", dose: "100 ml/acre", targets: ["Fruit borer", "Thrips", "Leaf miner"], crops: ["cotton", "chilli", "apple"] },
  { name: "Malathion 50% EC", dose: "500 ml/acre", targets: ["Aphids", "Mealybug", "Scale"], crops: ["citrus", "mango", "vegetables"] },
  { name: "Dichlorvos 76% EC", dose: "250 ml/acre", targets: ["Stem borer", "Pod borer"], crops: ["rice", "pulses", "vegetables"] },
  { name: "Phosalone 35% EC", dose: "500 ml/acre", targets: ["Bollworm", "Aphids"], crops: ["cotton", "chilli", "brinjal"] }
];
var FUNGICIDE_ACTIVES = [
  { name: "Mancozeb 75% WP", dose: "2 g/L", targets: ["Early blight", "Late blight", "Downy mildew"], crops: ["tomato", "potato", "grapes", "chilli"] },
  { name: "Carbendazim 50% WP", dose: "1 g/L", targets: ["Smut", "Bunt", "Root rot"], crops: ["wheat", "rice", "cotton", "groundnut"] },
  { name: "Tricyclazole 75% WP", dose: "120 g/acre", targets: ["Blast", "Sheath blight"], crops: ["rice", "wheat"] },
  { name: "Propiconazole 25% EC", dose: "200 ml/acre", targets: ["Rust", "Karnal bunt", "Leaf spot"], crops: ["wheat", "maize", "groundnut"] },
  { name: "Tebuconazole 25% EC", dose: "200 ml/acre", targets: ["Rust", "Powdery mildew", "Leaf spot"], crops: ["wheat", "chilli", "grapes"] },
  { name: "Hexaconazole 5% SC", dose: "400 ml/acre", targets: ["Powdery mildew", "Rust", "Sheath blight"], crops: ["grapes", "chilli", "rice", "mango"] },
  { name: "Difenoconazole 25% EC", dose: "200 ml/acre", targets: ["Leaf spot", "Anthracnose", "Rust"], crops: ["grapes", "mango", "tomato", "chilli"] },
  { name: "Azoxystrobin 23% SC", dose: "200 ml/acre", targets: ["Leaf blight", "Rust", "Anthracnose"], crops: ["grapes", "wheat", "tomato", "potato"] },
  { name: "Copper oxychloride 50% WP", dose: "3 g/L", targets: ["Bacterial spot", "Blight", "Downy mildew"], crops: ["citrus", "tomato", "chilli", "grapes"] },
  { name: "Chlorothalonil 75% WP", dose: "2 g/L", targets: ["Early blight", "Leaf spot", "Anthracnose"], crops: ["tomato", "potato", "grapes", "groundnut"] },
  { name: "Metalaxyl + Mancozeb 72% WP", dose: "500 g/acre", targets: ["Late blight", "Downy mildew", "Damping off"], crops: ["potato", "tomato", "grapes", "onion"] },
  { name: "Validamycin 3% L", dose: "500 ml/acre", targets: ["Sheath blight", "Root rot"], crops: ["rice", "potato", "vegetables"] },
  { name: "Kasugamycin 3% SL", dose: "400 ml/acre", targets: ["Bacterial leaf blight", "Blast"], crops: ["rice", "citrus"] },
  { name: "Streptocycline + Copper", dose: "0.5 g/L", targets: ["Bacterial blight", "Canker"], crops: ["citrus", "rice", "tomato"] },
  { name: "Sulphur 80% WP", dose: "2 g/L", targets: ["Powdery mildew", "Rust"], crops: ["grapes", "chilli", "mango", "vegetables"] },
  { name: "Captan 50% WP", dose: "2 g/L", targets: ["Anthracnose", "Fruit rot", "Scab"], crops: ["grapes", "apple", "mango", "tomato"] },
  { name: "Thiophanate methyl 70% WP", dose: "500 g/acre", targets: ["Root rot", "Collar rot", "Wilt"], crops: ["groundnut", "cotton", "pulses"] },
  { name: "Pseudomonas fluorescens 2% WP", dose: "5 g/kg seed", targets: ["Root rot", "Wilt", "Seed rot"], crops: ["rice", "cotton", "pulses", "vegetables"] },
  { name: "Trichoderma viride 1% WP", dose: "5 g/kg seed", targets: ["Root rot", "Collar rot", "Wilt"], crops: ["cotton", "vegetables", "pulses"] },
  { name: "Bordeaux mixture 1%", dose: "1% spray", targets: ["Downy mildew", "Anthracnose", "Canker"], crops: ["grapes", "citrus", "mango"] }
];
var DISEASE_TEMPLATES = [
  { suffix: "leaf-blight", category: "fungal", pathogen: "Alternaria / Helminthosporium", symptoms: "Brown lesions on leaves with concentric rings; premature defoliation", treatment: "Mancozeb 75% WP @ 2 g/L or Azoxystrobin 23% SC", prevention: "Crop rotation; remove infected debris; balanced fertilization", growthStage: "vegetative" },
  { suffix: "rust", category: "fungal", pathogen: "Puccinia spp.", symptoms: "Orange-brown pustules on leaves and stems; reduced photosynthesis", treatment: "Propiconazole 25% EC @ 200 ml/acre or Tebuconazole 25% EC", prevention: "Resistant varieties; timely sowing; avoid excess nitrogen", growthStage: "flowering" },
  { suffix: "powdery-mildew", category: "fungal", pathogen: "Erysiphales", symptoms: "White powdery patches on upper leaf surface; leaf curling", treatment: "Sulphur 80% WP @ 2 g/L or Hexaconazole 5% SC", prevention: "Adequate spacing; avoid shade; resistant varieties", growthStage: "flowering" },
  { suffix: "downy-mildew", category: "fungal", pathogen: "Peronospora / Plasmopara", symptoms: "Yellow patches on upper leaf; grey mould on underside in humid weather", treatment: "Metalaxyl + Mancozeb 72% WP @ 500 g/acre", prevention: "Improve drainage; avoid overhead irrigation; crop rotation", growthStage: "vegetative" },
  { suffix: "wilt", category: "fungal", pathogen: "Fusarium / Verticillium", symptoms: "One-sided wilting; yellowing; vascular browning; plant death", treatment: "Carbendazim seed treatment; Trichoderma @ 5 g/kg seed; soil drench", prevention: "Resistant varieties; crop rotation; avoid waterlogging", growthStage: "vegetative" },
  { suffix: "root-rot", category: "fungal", pathogen: "Rhizoctonia / Pythium", symptoms: "Stunted growth; root browning; seedling damping off", treatment: "Validamycin 3% L soil drench; Pseudomonas seed treatment", prevention: "Well-drained soil; treat seeds; avoid excess moisture", growthStage: "seedling" },
  { suffix: "bacterial-blight", category: "bacterial", pathogen: "Xanthomonas / Pseudomonas", symptoms: "Water-soaked angular lesions; yellow halos; leaf drying", treatment: "Streptocycline + Copper oxychloride @ 0.5 g/L", prevention: "Disease-free seed; copper preventive spray; field sanitation", growthStage: "vegetative" },
  { suffix: "viral-mosaic", category: "viral", pathogen: "Mosaic virus", symptoms: "Mottled leaf pattern; leaf distortion; stunted growth", treatment: "Rogue infected plants; control vector (aphids/whitefly)", prevention: "Virus-free seed; vector control; resistant varieties", growthStage: "seedling" },
  { suffix: "leaf-spot", category: "fungal", pathogen: "Cercospora / Septoria", symptoms: "Small dark spots with grey centres on leaves; defoliation", treatment: "Mancozeb 75% WP @ 2 g/L; remove lower infected leaves", prevention: "Field hygiene; balanced nutrition; crop rotation", growthStage: "vegetative" },
  { suffix: "stem-borer", category: "pest", pathogen: "Scirpophaga / Chilo", symptoms: "Dead hearts in vegetative stage; white earheads at maturity", treatment: "Cartap 50% SP @ 500 g/acre or Chlorantraniliprole 18.5% SC", prevention: "Early planting; remove stubble; light traps", growthStage: "tillering" },
  { suffix: "aphids", category: "pest", pathogen: "Aphididae", symptoms: "Curled leaves; honeydew; sooty mould; virus transmission", treatment: "Imidacloprid 17.8% SL @ 60 ml/acre or Thiamethoxam 25% WG", prevention: "Monitor regularly; conserve natural enemies; reflective mulch", growthStage: "vegetative" },
  { suffix: "deficiency-n", category: "nutrient", pathogen: "Nitrogen deficiency", symptoms: "Yellowing of older leaves from tip; stunted plant; low yield", treatment: "Urea split application 40+30 kg N/acre as per crop stage", prevention: "Soil test; balanced NPK; organic matter addition", growthStage: "vegetative" },
  { suffix: "deficiency-p", category: "nutrient", pathogen: "Phosphorus deficiency", symptoms: "Purple/reddish older leaves; poor root; delayed flowering", treatment: "DAP 50\u201365 kg/acre basal or SSP 100 kg/acre", prevention: "Apply P at sowing; maintain soil pH 6\u20137", growthStage: "seedling" },
  { suffix: "deficiency-k", category: "nutrient", pathogen: "Potassium deficiency", symptoms: "Leaf edge scorching; lodging; poor grain/fruit quality", treatment: "MOP 20\u201340 kg/acre at flowering or fruit set", prevention: "Soil test; return crop residue; avoid excess N without K", growthStage: "flowering" },
  { suffix: "deficiency-zn", category: "nutrient", pathogen: "Zinc deficiency", symptoms: "Interveinal chlorosis; rosette leaves; khaira in rice", treatment: "Zinc sulphate 21% @ 10\u201325 kg/acre or 0.5% foliar spray", prevention: "Soil test; apply Zn on alkaline/calcareous soils", growthStage: "vegetative" }
];
var FERTILIZER_BASES = [
  { id: "urea", name: "Neem Coated Urea", brand: "IFFCO", type: "Nitrogen", npk: "46-0-0", nutrient: "N 46%", baseDose: "45 kg/acre", application: ["Basal", "Top dressing"] },
  { id: "nano-urea", name: "Nano Urea (IFFCO)", brand: "IFFCO", type: "Nano-fertilizer", npk: "4-0-0", nutrient: "N 4% nano \u2014 500 ml bottle \u2248 1 bag (45 kg) urea/acre", baseDose: "500 ml/acre foliar spray", application: ["Foliar"] },
  { id: "nano-dap", name: "Nano DAP (IFFCO)", brand: "IFFCO", type: "Nano-fertilizer", npk: "8-16-0", nutrient: "N 8%, P 16% nano form", baseDose: "500 ml/acre", application: ["Foliar", "Seed treatment"] },
  { id: "dap", name: "DAP", brand: "IFFCO", type: "Phosphatic", npk: "18-46-0", nutrient: "N 18%, P\u2082O\u2085 46%", baseDose: "50 kg/acre", application: ["Basal"] },
  { id: "mop", name: "MOP (Muriate of Potash)", brand: "Coromandel", type: "Potassic", npk: "0-0-60", nutrient: "K\u2082O 60%", baseDose: "25 kg/acre", application: ["Basal", "Top dressing"] },
  { id: "ssp", name: "SSP", brand: "Coromandel", type: "Phosphatic", npk: "0-16-0", nutrient: "P 16%, S 11%, Ca 19%", baseDose: "100 kg/acre", application: ["Basal"] },
  { id: "npk-10-26-26", name: "NPK 10-26-26", brand: "IFFCO", type: "NPK Complex", npk: "10-26-26", nutrient: "N 10%, P 26%, K 26%", baseDose: "60 kg/acre", application: ["Basal"] },
  { id: "npk-12-32-16", name: "NPK 12-32-16", brand: "Coromandel", type: "NPK Complex", npk: "12-32-16", nutrient: "N 12%, P 32%, K 16%", baseDose: "60 kg/acre", application: ["Basal"] },
  { id: "npk-15-15-15", name: "NPK 15-15-15", brand: "IFFCO", type: "NPK Complex", npk: "15-15-15", nutrient: "N 15%, P 15%, K 15%", baseDose: "80 kg/acre", application: ["Basal"] },
  { id: "npk-20-20-0-13", name: "NP(S) 20-20-0-13", brand: "Coromandel", type: "NPK Complex", npk: "20-20-0-13", nutrient: "N 20%, P 20%, S 13%", baseDose: "100 kg/acre", application: ["Basal"] },
  { id: "zinc-sulphate", name: "Zinc Sulphate 21%", brand: "NFL", type: "Micronutrient", npk: "0-0-0", nutrient: "Zn 21%", baseDose: "10 kg/acre", application: ["Basal", "Foliar"] },
  { id: "boron", name: "Borax / Boron", brand: "Nagarjuna", type: "Micronutrient", npk: "0-0-0", nutrient: "B 10\u201315%", baseDose: "3 kg/acre", application: ["Basal", "Foliar"] },
  { id: "fym", name: "Farm Yard Manure", brand: "Organic", type: "Organic", npk: "0.5-0.2-0.5", nutrient: "Organic matter 15\u201325%", baseDose: "5 t/acre", application: ["Basal"] },
  { id: "vermicompost", name: "Vermicompost", brand: "Organic", type: "Organic", npk: "1.5-0.8-0.9", nutrient: "Organic carbon rich", baseDose: "2 t/acre", application: ["Basal"] },
  { id: "rhizobium", name: "Rhizobium Bio-fertilizer", brand: "NFL", type: "Bio-fertilizer", npk: "0-0-0", nutrient: "Rhizobium bacteria", baseDose: "200 g/acre seed treat", application: ["Seed treatment"] },
  { id: "psb", name: "PSB Bio-fertilizer", brand: "NFL", type: "Bio-fertilizer", npk: "0-0-0", nutrient: "Phosphate solubilizing bacteria", baseDose: "200 g/acre", application: ["Seed treatment", "Soil"] },
  { id: "azotobacter", name: "Azotobacter Bio-fertilizer", brand: "NFL", type: "Bio-fertilizer", npk: "0-0-0", nutrient: "Azotobacter", baseDose: "200 g/acre", application: ["Seed treatment"] },
  { id: "calcium-nitrate", name: "Calcium Nitrate", brand: "Deepak", type: "Nitrogen", npk: "15.5-0-0", nutrient: "N 15.5%, Ca 19%", baseDose: "5 kg/acre fertigation", application: ["Fertigation", "Foliar"] },
  { id: "npk-19-19-19", name: "NPK 19-19-19 (Water soluble)", brand: "Nagarjuna", type: "NPK Complex", npk: "19-19-19", nutrient: "N 19%, P 19%, K 19%", baseDose: "2 kg/acre/week drip", application: ["Fertigation", "Foliar"] },
  { id: "ammonium-sulphate", name: "Ammonium Sulphate", brand: "DoF", type: "Nitrogen", npk: "21-0-0", nutrient: "N 21%, S 24%", baseDose: "75 kg/acre", application: ["Basal", "Top dressing"] },
  { id: "map", name: "MAP 12-61-0", brand: "Nagarjuna", type: "Phosphatic", npk: "12-61-0", nutrient: "N 12%, P 61%", baseDose: "50 kg/acre", application: ["Basal", "Fertigation"] },
  { id: "sop", name: "Sulphate of Potash", brand: "Deepak", type: "Potassic", npk: "0-0-50", nutrient: "K\u2082O 50%, S 18%", baseDose: "25 kg/acre", application: ["Basal"] }
];
var AGRO_BRANDS = [
  "IFFCO",
  "Coromandel",
  "NFL",
  "Nagarjuna",
  "Deepak",
  "UPL",
  "Rallis",
  "Bayer",
  "Syngenta",
  "Corteva",
  "PI Industries",
  "Dhanuka",
  "Meghmani",
  "Crystal",
  "Indofil",
  "Biostadt",
  "Krishi Rasayan",
  "Tagros",
  "Heranba",
  "Gharda",
  "Sumitomo",
  "Adama",
  "NACL",
  "Shreeji",
  "Willowood",
  "Insecticides India",
  "BASF",
  "FMC",
  "Tata Rallis"
];

// src/data/manufacturerProductPages.ts
var MANUFACTURER_PRODUCT_PAGES = {
  // ── IFFCO ──
  "iffco-urea": {
    sourceUrl: "https://www.iffco.in/en/urea-fertilizer",
    brandImage: "https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2020-04/UREA_0.png"
  },
  "iffco-dap": {
    sourceUrl: "https://www.iffco.in/en/dap-18-46-0",
    brandImage: "https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2020-04/18-46-0-%28DAP%29_1.png"
  },
  "iffco-npk-10-26-26": {
    sourceUrl: "https://www.iffco.in/en/npk-10-26-26",
    brandImage: "https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2020-06/10-26-26-%28NPK%29.png"
  },
  "iffco-npk-12-32-16": {
    sourceUrl: "https://www.iffco.in/en/npk-12-32-16",
    brandImage: "https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2019-09/npk-12-32-16.png"
  },
  "iffco-np-20-20-0-13": {
    sourceUrl: "https://www.iffco.in/en/np-20-20",
    brandImage: "https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2019-09/np-20-20-0-13.png"
  },
  "iffco-npk-15-15-15": {
    sourceUrl: "https://www.iffco.in/en/npk-15-15-15"
  },
  "iffco-np-28-28-0": {
    sourceUrl: "https://www.iffco.in/en/np-28-28-0"
  },
  "iffco-nano-urea": {
    sourceUrl: "https://www.iffco.in/en/nano-urea-liquid-fertilizer",
    brandImage: "https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2021-08/Nano-Fertilizer-inside-Page-image.png"
  },
  "iffco-nano-dap": {
    sourceUrl: "https://www.iffco.in/en/nano-dap-liquid",
    brandImage: "https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2021-08/Nano-Fertilizer-inside-Page-image.png"
  },
  "iffco-nano-zinc": {
    sourceUrl: "https://www.iffco.in/en/nano-fertilisers"
  },
  // ── Coromandel Gromor ──
  "coromandel-gromor-urea": {
    sourceUrl: "https://www.coromandel.biz/gromor-urea/"
  },
  "coromandel-gromor-dap": {
    sourceUrl: "https://www.coromandel.biz/gromor-godavari-dap/",
    brandImage: "https://www.coromandel.biz/wp-content/uploads/2025/03/c_DAP.webp"
  },
  "coromandel-gromor-mop": {
    sourceUrl: "https://www.coromandel.biz/gromor-mop/",
    brandImage: "https://www.coromandel.biz/wp-content/uploads/2025/03/c_Bharat_MOP_Final.webp"
  },
  "coromandel-gromor-ssp": {
    sourceUrl: "https://www.coromandel.biz/gromor-ssp/",
    brandImage: "https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Urea.webp"
  },
  "coromandel-gromor-28-28-0": {
    sourceUrl: "https://www.coromandel.biz/gromor-28-28-0/",
    brandImage: "https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_28-28-0_Side%20Number.webp"
  },
  "coromandel-gromor-20-20-0-13": {
    sourceUrl: "https://www.coromandel.biz/gromor-20-20-0-13/",
    brandImage: "https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_20-20-0-13_Side%20Number.webp"
  },
  "coromandel-gromor-15-15-15-09": {
    sourceUrl: "https://www.coromandel.biz/gromor-15-15-15-09/",
    brandImage: "https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_15-15-15-09_Side%20Number.webp"
  },
  "coromandel-gromor-12-32-16": {
    sourceUrl: "https://www.coromandel.biz/gromor-12-32-16/",
    brandImage: "https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_12-32-16.webp"
  },
  "coromandel-gromor-10-26-26": {
    sourceUrl: "https://www.coromandel.biz/gromor-10-26-26/",
    brandImage: "https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_10-10-26.webp"
  },
  "coromandel-gromor-ultra-10-26-26": {
    sourceUrl: "https://www.coromandel.biz/gromor-ultra-10--26-26/",
    brandImage: "https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_10-10-26-Zn.webp"
  },
  "coromandel-paramfos": {
    sourceUrl: "https://www.coromandel.biz/paramfos/",
    brandImage: "https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_Paramfos.webp"
  },
  // ── NFL ──
  "nfl-urea": {
    sourceUrl: "https://www.nationalfertilizers.com/product/neem-coated-urea/"
  },
  "nfl-neem-urea": {
    sourceUrl: "https://www.nationalfertilizers.com/product/neem-coated-urea/"
  },
  "nfl-bio-rhizobium": {
    sourceUrl: "https://www.nationalfertilizers.com/product/rhizobium/"
  },
  "nfl-bio-azotobacter": {
    sourceUrl: "https://www.nationalfertilizers.com/product/azotobacter/"
  },
  "nfl-bio-psb": {
    sourceUrl: "https://www.nationalfertilizers.com/product/phosphate-solubilizing-bacteria/"
  },
  "nfl-zinc-sulphate": {
    sourceUrl: "https://www.nationalfertilizers.com/product/zinc-sulphate/"
  },
  "nfl-ferrous-sulphate": {
    sourceUrl: "https://www.nationalfertilizers.com/product/ferrous-sulphate/"
  },
  // ── Nagarjuna ──
  "nagarjuna-urea": {
    sourceUrl: "https://www.nagarjunafertilizers.com/products/urea/"
  },
  "nagarjuna-dap": {
    sourceUrl: "https://www.nagarjunafertilizers.com/products/dap/"
  },
  "nagarjuna-map": {
    sourceUrl: "https://www.nagarjunafertilizers.com/products/map-12-61-00/"
  },
  "nagarjuna-polyfeed-19-19-19": {
    sourceUrl: "https://www.nagarjunafertilizers.com/products/poly-feed-19-19-19/"
  },
  "nagarjuna-mkp": {
    sourceUrl: "https://www.nagarjunafertilizers.com/products/mkp-00-52-34/"
  },
  "nagarjuna-multi-k": {
    sourceUrl: "https://www.nagarjunafertilizers.com/products/multi-k-13-0-46/"
  },
  "nagarjuna-zinc-sulphate": {
    sourceUrl: "https://www.nagarjunafertilizers.com/products/zinc-sulphate/"
  },
  "nagarjuna-borovin": {
    sourceUrl: "https://www.nagarjunafertilizers.com/products/borovin/"
  },
  // ── Deepak Mahadhan ──
  "deepak-mahadhan-12-32-16": {
    sourceUrl: "https://www.deepakfertiliser.com/mahadhan/mahadhan-12-32-16/"
  },
  "deepak-mahadhan-10-26-26": {
    sourceUrl: "https://www.deepakfertiliser.com/mahadhan/mahadhan-10-26-26/"
  },
  "deepak-mahadhan-20-20-0-13": {
    sourceUrl: "https://www.deepakfertiliser.com/mahadhan/mahadhan-20-20-0-13/"
  },
  "deepak-mahadhan-sop": {
    sourceUrl: "https://www.deepakfertiliser.com/mahadhan/mahadhan-sop/"
  },
  "deepak-mahadhan-amruta-cn": {
    sourceUrl: "https://www.deepakfertiliser.com/mahadhan/amruta-calcium-nitrate/"
  },
  "deepak-mahadhan-bentonite-s": {
    sourceUrl: "https://www.deepakfertiliser.com/mahadhan/mahadhan-bentonite-sulphur/"
  }
};
function getManufacturerPage(productId) {
  if (!productId) return null;
  return MANUFACTURER_PRODUCT_PAGES[productId] ?? null;
}
function mergeManufacturerSourceUrl(productId, existing) {
  return existing ?? getManufacturerPage(productId)?.sourceUrl;
}
function getBrandPackImage(productId) {
  return getManufacturerPage(productId)?.brandImage ?? null;
}

// src/data/curatedProductImages.ts
var W = "https://upload.wikimedia.org/wikipedia/commons";
var FERTILIZER_PACK_IMAGES = {
  urea: `${W}/4/4f/Urea_fertilizer.jpg`,
  dap: `${W}/e/e7/Diammonium_phosphate.jpg`,
  npk: `${W}/3/3d/NPK_fertilizer.jpg`,
  mop: `${W}/5/5a/Potassium_chloride.jpg`,
  ssp: `${W}/8/8a/Superphosphate_fertilizer.jpg`,
  ammoniumSulphate: `${W}/a/a4/Ammonium_sulfate.jpg`,
  zincSulphate: `${W}/4/4e/Zinc_sulfate.jpg`,
  ferrousSulphate: `${W}/2/23/Iron%28II%29_sulfate.jpg`,
  compost: `${W}/4/4c/Compost.jpg`,
  vermicompost: `${W}/1/1e/Vermicompost.jpg`,
  bioInoculant: `${W}/8/8d/Rhizobium_leguminosarum.jpg`,
  boron: `${W}/9/93/Borax.jpg`,
  nanoFertilizer: `${W}/9/9a/Fertilizer_bags.jpg`,
  waterSoluble: `${W}/3/3d/NPK_fertilizer.jpg`,
  map: `${W}/e/e7/Diammonium_phosphate.jpg`,
  sop: `${W}/5/5a/Potassium_chloride.jpg`
};
var AGROCHEM_PACK_IMAGES = {
  insecticide: `${W}/b/b3/Pesticide.jpg`,
  insecticideSpray: `${W}/6/6f/Pesticide_application.jpg`,
  fungicide: `${W}/thumb/4/4a/Copper(II)_sulfate.jpg/440px-Copper(II)_sulfate.jpg`,
  fungicideWp: `${W}/thumb/4/4a/Copper(II)_sulfate.jpg/440px-Copper(II)_sulfate.jpg`,
  herbicide: `${W}/b/b3/Pesticide.jpg`,
  bioFungicide: `${W}/1/1e/Vermicompost.jpg`
};
var FERTILIZER_FILENAME_IMAGES = {
  "urea.png": FERTILIZER_PACK_IMAGES.urea,
  "dap.png": FERTILIZER_PACK_IMAGES.dap,
  "npk-10-26-26.png": FERTILIZER_PACK_IMAGES.npk,
  "npk-12-32-16.png": FERTILIZER_PACK_IMAGES.npk,
  "npk-15-15-15.png": FERTILIZER_PACK_IMAGES.npk,
  "np-20-20-0-13.png": FERTILIZER_PACK_IMAGES.npk,
  "np-28-28-0.png": FERTILIZER_PACK_IMAGES.npk,
  "nano-urea.png": FERTILIZER_PACK_IMAGES.nanoFertilizer,
  "nano-dap.png": FERTILIZER_PACK_IMAGES.nanoFertilizer,
  "nano-zinc.png": FERTILIZER_PACK_IMAGES.zincSulphate,
  "gromor-urea.png": FERTILIZER_PACK_IMAGES.urea,
  "gromor-dap.png": FERTILIZER_PACK_IMAGES.dap,
  "gromor-mop.png": FERTILIZER_PACK_IMAGES.mop,
  "gromor-ssp.png": FERTILIZER_PACK_IMAGES.ssp,
  "gromor-28-28-0.png": FERTILIZER_PACK_IMAGES.npk,
  "gromor-20-20-0-13.png": FERTILIZER_PACK_IMAGES.npk,
  "gromor-15-15-15-09.png": FERTILIZER_PACK_IMAGES.npk,
  "gromor-12-32-16.png": FERTILIZER_PACK_IMAGES.npk,
  "gromor-10-26-26.png": FERTILIZER_PACK_IMAGES.npk,
  "gromor-ultra-10-26-26.png": FERTILIZER_PACK_IMAGES.npk,
  "paramfos.png": FERTILIZER_PACK_IMAGES.ssp,
  "nfl-urea.png": FERTILIZER_PACK_IMAGES.urea,
  "nfl-neem-urea.png": FERTILIZER_PACK_IMAGES.urea,
  "nfl-rhizobium.png": FERTILIZER_PACK_IMAGES.bioInoculant,
  "nfl-azotobacter.png": FERTILIZER_PACK_IMAGES.bioInoculant,
  "nfl-psb.png": FERTILIZER_PACK_IMAGES.bioInoculant,
  "zinc-sulphate.png": FERTILIZER_PACK_IMAGES.zincSulphate,
  "ferrous-sulphate.png": FERTILIZER_PACK_IMAGES.ferrousSulphate,
  "mop.png": FERTILIZER_PACK_IMAGES.mop,
  "ammonium-sulphate.png": FERTILIZER_PACK_IMAGES.ammoniumSulphate,
  "ssp.png": FERTILIZER_PACK_IMAGES.ssp,
  "tsp.png": FERTILIZER_PACK_IMAGES.dap,
  "map.png": FERTILIZER_PACK_IMAGES.map,
  "npk-19-19-19.png": FERTILIZER_PACK_IMAGES.waterSoluble,
  "boron.png": FERTILIZER_PACK_IMAGES.boron,
  "compost.png": FERTILIZER_PACK_IMAGES.compost,
  "nagarjuna-urea.png": FERTILIZER_PACK_IMAGES.urea,
  "nagarjuna-dap.png": FERTILIZER_PACK_IMAGES.dap,
  "nagarjuna-map.png": FERTILIZER_PACK_IMAGES.map,
  "nagarjuna-polyfeed-19-19-19.png": FERTILIZER_PACK_IMAGES.waterSoluble,
  "nagarjuna-mkp.png": FERTILIZER_PACK_IMAGES.mop,
  "nagarjuna-multi-k.png": FERTILIZER_PACK_IMAGES.mop,
  "nagarjuna-zinc-sulphate.png": FERTILIZER_PACK_IMAGES.zincSulphate,
  "nagarjuna-borovin.png": FERTILIZER_PACK_IMAGES.boron,
  "deepak-mahadhan-12-32-16.png": FERTILIZER_PACK_IMAGES.npk,
  "deepak-mahadhan-10-26-26.png": FERTILIZER_PACK_IMAGES.npk,
  "deepak-mahadhan-20-20-0-13.png": FERTILIZER_PACK_IMAGES.npk,
  "deepak-mahadhan-sop.png": FERTILIZER_PACK_IMAGES.sop,
  "deepak-mahadhan-amruta-cn.png": FERTILIZER_PACK_IMAGES.ammoniumSulphate,
  "deepak-mahadhan-bentonite-s.png": FERTILIZER_PACK_IMAGES.ssp
};
var ACTIVE_INGREDIENT_IMAGES = {
  "imidacloprid-17-8-sl": AGROCHEM_PACK_IMAGES.insecticide,
  "lambda-cyhalothrin-5-ec": AGROCHEM_PACK_IMAGES.insecticideSpray,
  "chlorpyriphos-20-ec": AGROCHEM_PACK_IMAGES.insecticide,
  "monocrotophos-36-sl": AGROCHEM_PACK_IMAGES.insecticide,
  "quinalphos-25-ec": AGROCHEM_PACK_IMAGES.insecticide,
  "dimethoate-30-ec": AGROCHEM_PACK_IMAGES.insecticide,
  "triazophos-40-ec": AGROCHEM_PACK_IMAGES.insecticide,
  "profenofos-50-ec": AGROCHEM_PACK_IMAGES.insecticide,
  "spinosad-45-sc": AGROCHEM_PACK_IMAGES.insecticide,
  "emamectin-benzoate-5-sg": AGROCHEM_PACK_IMAGES.insecticide,
  "indoxacarb-14-5-sc": AGROCHEM_PACK_IMAGES.insecticide,
  "thiamethoxam-25-wg": AGROCHEM_PACK_IMAGES.insecticide,
  "acetamiprid-20-sp": AGROCHEM_PACK_IMAGES.insecticide,
  "fipronil-5-sc": AGROCHEM_PACK_IMAGES.insecticide,
  "cartap-hydrochloride-50-sp": AGROCHEM_PACK_IMAGES.insecticide,
  "buprofezin-25-sc": AGROCHEM_PACK_IMAGES.insecticide,
  "pymetrozine-50-wg": AGROCHEM_PACK_IMAGES.insecticide,
  "flubendiamide-39-35-sc": AGROCHEM_PACK_IMAGES.insecticide,
  "chlorantraniliprole-18-5-sc": AGROCHEM_PACK_IMAGES.insecticide,
  "abamectin-1-9-ec": AGROCHEM_PACK_IMAGES.insecticide,
  "spiromesifen-22-9-sc": AGROCHEM_PACK_IMAGES.insecticide,
  "diafenthiuron-50-wp": AGROCHEM_PACK_IMAGES.insecticide,
  "novaluron-10-ec": AGROCHEM_PACK_IMAGES.insecticide,
  "lufenuron-5-4-ec": AGROCHEM_PACK_IMAGES.insecticide,
  "metaflumizone-22-sc": AGROCHEM_PACK_IMAGES.insecticide,
  "cyantraniliprole-10-26-od": AGROCHEM_PACK_IMAGES.insecticide,
  "spinetoram-11-7-sc": AGROCHEM_PACK_IMAGES.insecticide,
  "malathion-50-ec": AGROCHEM_PACK_IMAGES.insecticideSpray,
  "dichlorvos-76-ec": AGROCHEM_PACK_IMAGES.insecticide,
  "phosalone-35-ec": AGROCHEM_PACK_IMAGES.insecticide,
  "mancozeb-75-wp": AGROCHEM_PACK_IMAGES.fungicideWp,
  "carbendazim-50-wp": AGROCHEM_PACK_IMAGES.fungicideWp,
  "tricyclazole-75-wp": AGROCHEM_PACK_IMAGES.fungicideWp,
  "propiconazole-25-ec": AGROCHEM_PACK_IMAGES.fungicide,
  "tebuconazole-25-ec": AGROCHEM_PACK_IMAGES.fungicide,
  "hexaconazole-5-sc": AGROCHEM_PACK_IMAGES.fungicide,
  "difenoconazole-25-ec": AGROCHEM_PACK_IMAGES.fungicide,
  "azoxystrobin-23-sc": AGROCHEM_PACK_IMAGES.fungicide,
  "copper-oxychloride-50-wp": AGROCHEM_PACK_IMAGES.fungicideWp,
  "chlorothalonil-75-wp": AGROCHEM_PACK_IMAGES.fungicideWp,
  "metalaxyl-mancozeb-72-wp": AGROCHEM_PACK_IMAGES.fungicideWp,
  "validamycin-3-l": AGROCHEM_PACK_IMAGES.fungicide,
  "kasugamycin-3-sl": AGROCHEM_PACK_IMAGES.fungicide,
  "streptocycline-copper": AGROCHEM_PACK_IMAGES.fungicideWp,
  "sulphur-80-wp": AGROCHEM_PACK_IMAGES.fungicideWp,
  "captan-50-wp": AGROCHEM_PACK_IMAGES.fungicideWp,
  "thiophanate-methyl-70-wp": AGROCHEM_PACK_IMAGES.fungicideWp,
  "pseudomonas-fluorescens-2-wp": AGROCHEM_PACK_IMAGES.bioFungicide,
  "trichoderma-viride-1-wp": AGROCHEM_PACK_IMAGES.bioFungicide,
  "bordeaux-mixture-1": AGROCHEM_PACK_IMAGES.fungicideWp
};
function slugActiveIngredient(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}
function lookupCuratedImage(input) {
  const path3 = input.imagePath?.trim();
  if (path3?.startsWith("http://") || path3?.startsWith("https://")) return path3;
  if (path3) {
    const file = path3.split("/").pop() ?? path3;
    if (FERTILIZER_FILENAME_IMAGES[file]) return FERTILIZER_FILENAME_IMAGES[file];
    if (FERTILIZER_FILENAME_IMAGES[path3]) return FERTILIZER_FILENAME_IMAGES[path3];
    const agMatch = path3.match(/^ag\/(pesticide|fungicide)\/(.+)\.png$/);
    if (agMatch) {
      const slug3 = agMatch[2];
      if (ACTIVE_INGREDIENT_IMAGES[slug3]) return ACTIVE_INGREDIENT_IMAGES[slug3];
    }
  }
  if (input.activeIngredient) {
    const slug3 = slugActiveIngredient(input.activeIngredient);
    if (ACTIVE_INGREDIENT_IMAGES[slug3]) return ACTIVE_INGREDIENT_IMAGES[slug3];
  }
  if (input.id) {
    const idSlug = input.id.replace(/^ref-(pest|fung)-/, "");
    if (ACTIVE_INGREDIENT_IMAGES[idSlug]) return ACTIVE_INGREDIENT_IMAGES[idSlug];
  }
  const type = input.type?.toLowerCase();
  if (type === "pesticide") return AGROCHEM_PACK_IMAGES.insecticide;
  if (type === "fungicide") return AGROCHEM_PACK_IMAGES.fungicide;
  const cat = input.category?.toLowerCase() ?? "";
  if (cat.includes("nitrogen") || cat.includes("nano")) return FERTILIZER_PACK_IMAGES.urea;
  if (cat.includes("phosphatic")) return FERTILIZER_PACK_IMAGES.dap;
  if (cat.includes("potassic")) return FERTILIZER_PACK_IMAGES.mop;
  if (cat.includes("npk") || cat.includes("complex")) return FERTILIZER_PACK_IMAGES.npk;
  if (cat.includes("bio")) return FERTILIZER_PACK_IMAGES.bioInoculant;
  if (cat.includes("micro")) return FERTILIZER_PACK_IMAGES.zincSulphate;
  if (cat.includes("organic")) return FERTILIZER_PACK_IMAGES.compost;
  return FERTILIZER_PACK_IMAGES.npk;
}

// src/services/productImageResolver.ts
var ogCache = /* @__PURE__ */ new Map();
var OG_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1e3;
function absolutize(url, pageUrl) {
  if (url.startsWith("http")) return url;
  try {
    return new URL(url, pageUrl).href;
  } catch {
    return url;
  }
}
function extractOgImage(html) {
  const patterns = [
    /property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i,
    /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    /"image"\s*:\s*"(https?:[^"]+)"/i
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]?.startsWith("http") && !/logo|icon|banner|menu|footer|ticker/i.test(m[1])) {
      return m[1];
    }
  }
  return null;
}
function extractIffcoProductImage(html) {
  const assets = [...html.matchAll(/https?:\/\/iffco-public-assets[^"'\s]+\.(?:png|jpg|webp)/gi)].map(
    (m) => m[0]
  );
  const product = assets.find(
    (u) => !/logo|menu|banner|slide|save_the|farmers|reach|who-we|footer|ticker|inside-Page-N/i.test(u)
  );
  return product ?? null;
}
function scoreCoromandelPackshot(url, pageUrl) {
  const slug3 = pageUrl.toLowerCase();
  const file = decodeURIComponent(url).toLowerCase();
  let score = 0;
  if (/packshot|c_[a-z0-9_-]+\.(webp|png|jpg)/i.test(file)) score += 10;
  if (/logo|icon|favicon|banner|strip|download|elementor|css/i.test(file)) score -= 20;
  const hints = [
    [/dap/, /dap/],
    [/mop/, /mop/],
    [/paramfos/, /paramfos/],
    [/10-26-26|10--26-26/, /10-10-26|10-26-26/],
    [/ultra-10/, /10-10-26-zn/],
    [/28-28-0/, /28-28-0/],
    [/20-20-0-13/, /20-20-0-13/],
    [/15-15-15-09/, /15-15-15-09/],
    [/12-32-16/, /12-32-16/],
    [/ssp/, /ssp|urea/],
    [/gromor-urea/, /urea/]
  ];
  for (const [pageRe, fileRe] of hints) {
    if (pageRe.test(slug3) && fileRe.test(file)) score += 15;
  }
  return score;
}
function extractCoromandelPackshot(html, pageUrl) {
  const candidates = [
    ...html.matchAll(/https:\/\/www\.coromandel\.biz\/wp-content\/uploads\/[^"'\s]+\.(?:webp|png|jpg)/gi)
  ].map((m) => m[0]);
  let best = null;
  for (const url of new Set(candidates)) {
    const score = scoreCoromandelPackshot(url, pageUrl);
    if (score > 0 && (!best || score > best.score)) best = { url, score };
  }
  return best?.url ?? null;
}
function extractProductImageFromHtml(html, pageUrl) {
  const og = extractOgImage(html);
  if (og) return og;
  const host = new URL(pageUrl).hostname;
  if (host.includes("iffco.in")) {
    const iffco = extractIffcoProductImage(html);
    if (iffco) return iffco;
  }
  if (host.includes("coromandel.biz")) {
    const coro = extractCoromandelPackshot(html, pageUrl);
    if (coro) return coro;
  }
  return null;
}
function isProductPageUrl(url) {
  try {
    const u = new URL(url);
    const path3 = u.pathname.replace(/\/$/, "");
    if (!path3 || path3 === "/en") return false;
    const segments = path3.split("/").filter(Boolean);
    return segments.length >= 2;
  } catch {
    return false;
  }
}
async function fetchLiveProductImage(sourceUrl) {
  const key = sourceUrl.trim();
  if (!key.startsWith("http")) return null;
  const cached = ogCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.url;
  try {
    const res = await fetch(key, {
      headers: {
        "User-Agent": "BhuvedamBot/1.0 (+https://bhuvedam.vercel.app)",
        Accept: "text/html,application/xhtml+xml"
      },
      signal: AbortSignal.timeout(9e3),
      redirect: "follow"
    });
    if (!res.ok) return null;
    const html = await res.text();
    const raw = extractProductImageFromHtml(html, key);
    const url = raw ? absolutize(raw, key) : null;
    if (url) {
      ogCache.set(key, { url, expires: Date.now() + OG_CACHE_TTL_MS });
      return url;
    }
  } catch {
  }
  return null;
}
function resolveProductImageUrl(input) {
  const raw = input.image?.trim();
  if (raw?.startsWith("http://") || raw?.startsWith("https://")) return raw;
  const brand = getBrandPackImage(input.id);
  if (brand) return brand;
  return lookupCuratedImage({
    id: input.id,
    imagePath: raw,
    type: input.type,
    activeIngredient: input.activeIngredient,
    category: input.category
  });
}
async function resolveProductImageUrlAsync(input) {
  const brand = getBrandPackImage(input.id);
  if (brand) return brand;
  const sourceUrl = input.sourceUrl?.trim() || getManufacturerPage(input.id)?.sourceUrl || null;
  if (sourceUrl && isProductPageUrl(sourceUrl)) {
    const live = await fetchLiveProductImage(sourceUrl);
    if (live) return live;
  }
  return resolveProductImageUrl({ ...input, sourceUrl });
}
function enrichProductImage(product) {
  const resolved = resolveProductImageUrl(product);
  return {
    ...product,
    image: resolved ?? product.image ?? null
  };
}
async function enrichProductImageAsync(product) {
  const sourceUrl = product.sourceUrl ?? getManufacturerPage(product.id)?.sourceUrl ?? null;
  const resolved = await resolveProductImageUrlAsync({ ...product, sourceUrl });
  return {
    ...product,
    image: resolved ?? product.image ?? null
  };
}
function enrichProductsWithImages(products) {
  return products.map(enrichProductImage);
}
function imageUrlForActive(type, activeName) {
  const slug3 = slugActiveIngredient(activeName);
  return lookupCuratedImage({ imagePath: `ag/${type}/${slug3}.png`, type, activeIngredient: activeName }) ?? lookupCuratedImage({ type }) ?? "";
}

// src/ingestion/sources/bulkAgCatalogSource.ts
var BATCH = 200;
function dedupeById(rows) {
  const map = /* @__PURE__ */ new Map();
  for (const row of rows) map.set(row.id, row);
  return [...map.values()];
}
function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}
function imageFor(type, activeName, category) {
  if (type === "pesticide" || type === "fungicide") {
    return imageUrlForActive(type, activeName);
  }
  if (type === "fertilizer") {
    return resolveProductImageUrl({
      type: "fertilizer",
      category,
      image: `${activeName}.png`
    }) ?? "";
  }
  return "";
}
async function getTargetCrops(limit = 280) {
  const bhuvedam = await db.select({ id: crops.id }).from(crops).where((0, import_drizzle_orm2.eq)(crops.source, "bhuvedam")).limit(80);
  const agmarknet = await db.select({ id: crops.id }).from(crops).where((0, import_drizzle_orm2.eq)(crops.source, "agmarknet")).limit(200);
  const ids = /* @__PURE__ */ new Set();
  for (const r of [...bhuvedam, ...agmarknet]) ids.add(r.id);
  const fallback = [
    "rice",
    "wheat",
    "maize",
    "cotton",
    "groundnut",
    "chickpea",
    "tomato",
    "chilli",
    "sugarcane",
    "soybean",
    "mustard",
    "potato",
    "onion",
    "brinjal",
    "okra",
    "mango",
    "banana",
    "grapes",
    "citrus",
    "turmeric",
    "ginger",
    "sunflower",
    "bajra",
    "jowar",
    "ragi",
    "redgram",
    "greengram",
    "blackgram",
    "horsegram",
    "lentil",
    "barley"
  ];
  for (const id of fallback) ids.add(id);
  return [...ids].slice(0, limit);
}
function generatePesticides() {
  const rows = [];
  for (const active of INSECTICIDE_ACTIVES) {
    for (const brand of AGRO_BRANDS) {
      for (const crop of active.crops.slice(0, 3)) {
        const target2 = active.targets[0];
        const stage = GROWTH_STAGES[1];
        const soil = SOIL_TYPES[0];
        const id = `pest-${slug(active.name)}-${slug(brand)}-${crop}`.slice(0, 115);
        rows.push({
          id,
          name: `${brand} ${active.name.split(" ")[0]} \u2014 ${target2}`,
          type: "pesticide",
          subType: "insecticide",
          brand,
          activeIngredient: active.name,
          dosage: active.dose,
          crops: [crop, ...active.crops.slice(0, 2)],
          soilTypes: [...SOIL_TYPES],
          growthStages: [...GROWTH_STAGES],
          targetPest: target2,
          applicationMethod: `Spray ${active.dose} in 200 L water/acre. Best: early morning or evening.`,
          precautions: "Observe PHI on label; wear PPE; rotate chemical groups.",
          description: `CIB&RC-style ${active.name} for ${active.targets.join(", ")} on ${active.crops.join(", ")}.`,
          price: "\u20B9350\u20131200 per pack",
          image: imageFor("pesticide", active.name),
          source: "cibrc_catalog",
          sourceUrl: "https://www.ppqs.gov.in/divisions/cib-rc/registered-products"
        });
      }
    }
  }
  return rows;
}
function generateFungicides() {
  const rows = [];
  for (const active of FUNGICIDE_ACTIVES) {
    for (const brand of AGRO_BRANDS.slice(0, 22)) {
      for (const crop of active.crops.slice(0, 3)) {
        const target2 = active.targets[0];
        const id = `fung-${slug(active.name)}-${slug(brand)}-${crop}`.slice(0, 115);
        rows.push({
          id,
          name: `${brand} ${active.name.split(" ")[0]} \u2014 ${target2}`,
          type: "fungicide",
          subType: "fungicide",
          brand,
          activeIngredient: active.name,
          dosage: active.dose,
          crops: active.crops,
          soilTypes: [...SOIL_TYPES],
          growthStages: [...GROWTH_STAGES],
          targetDisease: target2,
          applicationMethod: `Spray ${active.dose}. Repeat after 10\u201314 days if needed.`,
          precautions: "Do not mix with alkaline products; observe PHI.",
          description: `${active.name} for ${active.targets.join(", ")}.`,
          price: "\u20B9400\u20131500 per pack",
          image: imageFor("fungicide", active.name),
          source: "cibrc_catalog",
          sourceUrl: "https://www.ppqs.gov.in/divisions/cib-rc/registered-products"
        });
      }
    }
  }
  return rows;
}
function generateFertilizers(cropIds) {
  const rows = [];
  const priorityCrops = [
    "rice",
    "wheat",
    "maize",
    "cotton",
    "chilli",
    "tomato",
    "groundnut",
    "sugarcane",
    "soybean",
    "mustard",
    "potato",
    "onion",
    "pulses"
  ];
  const targetCrops = [.../* @__PURE__ */ new Set([...priorityCrops, ...cropIds])].slice(0, 15);
  for (const base of FERTILIZER_BASES) {
    const brands = [.../* @__PURE__ */ new Set([base.brand, ...AGRO_BRANDS.slice(0, 4)])];
    const nanoCrops = base.id.startsWith("nano") ? ["rice", "wheat", "maize", "cotton", "chilli", "tomato", "groundnut", "sugarcane", "vegetables"] : targetCrops;
    for (const brand of brands) {
      for (const cropId of nanoCrops) {
        const id = `fert-${base.id}-${slug(brand)}-${cropId}`.slice(0, 115);
        const deficiencyKeys = Object.keys(NUTRIENT_DEFICIENCY_SYMPTOMS).slice(0, 4);
        rows.push({
          id,
          name: `${brand} ${base.name} \u2014 ${cropId}`,
          type: "fertilizer",
          subType: base.type,
          brand,
          nutrientComposition: base.nutrient,
          npkRatio: base.npk,
          dosage: base.baseDose,
          crops: [cropId],
          soilTypes: [...SOIL_TYPES],
          growthStages: [...GROWTH_STAGES],
          deficiencySymptoms: deficiencyKeys.flatMap((k) => NUTRIENT_DEFICIENCY_SYMPTOMS[k].slice(0, 2)),
          applicationMethod: `${base.application.join(" / ")} \u2014 adjust by soil test & growth stage.`,
          description: `${base.name} for ${cropId}. NPK ${base.npk}. ${base.nutrient}.`,
          price: "\u20B9250\u20131800 per bag",
          image: imageFor("fertilizer", base.id, base.type),
          source: "icar_dof_catalog"
        });
      }
    }
  }
  return rows;
}
function generateDiseases(cropIds) {
  const rows = [];
  for (const cropId of cropIds) {
    for (const tmpl of DISEASE_TEMPLATES) {
      for (const soil of SOIL_TYPES.slice(0, 4)) {
        const id = `dis-${cropId}-${tmpl.suffix}-${soil}`.slice(0, 115);
        const deficiencyKeys = tmpl.category === "nutrient" ? [tmpl.pathogen.replace(" deficiency", "").toLowerCase()] : [];
        rows.push({
          id,
          name: `${cropId.charAt(0).toUpperCase() + cropId.slice(1)} \u2014 ${tmpl.suffix.replace(/-/g, " ")}`,
          cropId,
          category: tmpl.category,
          pathogen: tmpl.pathogen,
          symptoms: tmpl.symptoms,
          deficiencySymptoms: deficiencyKeys.flatMap(
            (k) => NUTRIENT_DEFICIENCY_SYMPTOMS[k] ?? []
          ),
          treatment: tmpl.treatment,
          prevention: tmpl.prevention,
          growthStage: tmpl.growthStage,
          soilTypes: [soil],
          image: imageFor("disease", `${cropId}-${tmpl.suffix}`),
          source: "icar_plantvillage",
          sourceUrl: "https://www.icar.org.in/"
        });
      }
    }
  }
  return rows;
}
async function upsertAgProducts(rows) {
  const total = rows.length;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const now = /* @__PURE__ */ new Date();
    await db.insert(agProducts).values(chunk.map((row) => ({ ...row, lastSyncedAt: now, updatedAt: now }))).onConflictDoUpdate({
      target: agProducts.id,
      set: {
        name: import_drizzle_orm2.sql`excluded.name`,
        type: import_drizzle_orm2.sql`excluded.type`,
        subType: import_drizzle_orm2.sql`excluded.sub_type`,
        brand: import_drizzle_orm2.sql`excluded.brand`,
        activeIngredient: import_drizzle_orm2.sql`excluded.active_ingredient`,
        nutrientComposition: import_drizzle_orm2.sql`excluded.nutrient_composition`,
        npkRatio: import_drizzle_orm2.sql`excluded.npk_ratio`,
        dosage: import_drizzle_orm2.sql`excluded.dosage`,
        crops: import_drizzle_orm2.sql`excluded.crops`,
        soilTypes: import_drizzle_orm2.sql`excluded.soil_types`,
        growthStages: import_drizzle_orm2.sql`excluded.growth_stages`,
        deficiencySymptoms: import_drizzle_orm2.sql`excluded.deficiency_symptoms`,
        targetPest: import_drizzle_orm2.sql`excluded.target_pest`,
        targetDisease: import_drizzle_orm2.sql`excluded.target_disease`,
        applicationMethod: import_drizzle_orm2.sql`excluded.application_method`,
        precautions: import_drizzle_orm2.sql`excluded.precautions`,
        description: import_drizzle_orm2.sql`excluded.description`,
        price: import_drizzle_orm2.sql`excluded.price`,
        image: import_drizzle_orm2.sql`excluded.image`,
        source: import_drizzle_orm2.sql`excluded.source`,
        sourceUrl: import_drizzle_orm2.sql`excluded.source_url`,
        lastSyncedAt: now,
        updatedAt: now
      }
    });
    if ((i + BATCH) % 1e3 === 0 || i + BATCH >= total) {
      console.log(`  ag_products: ${Math.min(i + BATCH, total)}/${total}`);
    }
  }
}
async function upsertDiseases(rows) {
  const total = rows.length;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const now = /* @__PURE__ */ new Date();
    await db.insert(cropDiseaseCatalog).values(chunk.map((row) => ({ ...row, lastSyncedAt: now, updatedAt: now }))).onConflictDoUpdate({
      target: cropDiseaseCatalog.id,
      set: {
        name: import_drizzle_orm2.sql`excluded.name`,
        cropId: import_drizzle_orm2.sql`excluded.crop_id`,
        category: import_drizzle_orm2.sql`excluded.category`,
        pathogen: import_drizzle_orm2.sql`excluded.pathogen`,
        symptoms: import_drizzle_orm2.sql`excluded.symptoms`,
        deficiencySymptoms: import_drizzle_orm2.sql`excluded.deficiency_symptoms`,
        treatment: import_drizzle_orm2.sql`excluded.treatment`,
        prevention: import_drizzle_orm2.sql`excluded.prevention`,
        growthStage: import_drizzle_orm2.sql`excluded.growth_stage`,
        soilTypes: import_drizzle_orm2.sql`excluded.soil_types`,
        image: import_drizzle_orm2.sql`excluded.image`,
        source: import_drizzle_orm2.sql`excluded.source`,
        sourceUrl: import_drizzle_orm2.sql`excluded.source_url`,
        lastSyncedAt: now,
        updatedAt: now
      }
    });
    if ((i + BATCH) % 1e3 === 0 || i + BATCH >= total) {
      console.log(`  crop_diseases: ${Math.min(i + BATCH, total)}/${total}`);
    }
  }
}
async function syncBulkAgCatalog() {
  const cropIds = await getTargetCrops(280);
  const pesticides = generatePesticides();
  const fungicides = generateFungicides();
  const fertilizers2 = generateFertilizers(cropIds);
  const diseases2 = generateDiseases(cropIds);
  console.log(`Generating: ${pesticides.length} pesticides, ${fungicides.length} fungicides, ${fertilizers2.length} fertilizers, ${diseases2.length} diseases...`);
  const products = dedupeById([...pesticides, ...fungicides, ...fertilizers2]);
  const uniqueDiseases = dedupeById(diseases2);
  console.log(`After dedupe: ${products.length} products, ${uniqueDiseases.length} diseases`);
  await upsertAgProducts(products);
  await upsertDiseases(uniqueDiseases);
  const [[{ pc }], [{ fc }], [{ fertc }], [{ dc }], [{ cropc }]] = await Promise.all([
    db.select({ pc: import_drizzle_orm2.sql`count(*)::int` }).from(agProducts).where((0, import_drizzle_orm2.eq)(agProducts.type, "pesticide")),
    db.select({ fc: import_drizzle_orm2.sql`count(*)::int` }).from(agProducts).where((0, import_drizzle_orm2.eq)(agProducts.type, "fungicide")),
    db.select({ fertc: import_drizzle_orm2.sql`count(*)::int` }).from(agProducts).where((0, import_drizzle_orm2.eq)(agProducts.type, "fertilizer")),
    db.select({ dc: import_drizzle_orm2.sql`count(*)::int` }).from(cropDiseaseCatalog),
    db.select({ cropc: import_drizzle_orm2.sql`count(*)::int` }).from(crops)
  ]);
  return {
    pesticides: pc ?? 0,
    fungicides: fc ?? 0,
    fertilizers: fertc ?? 0,
    diseases: dc ?? 0,
    crops: cropc ?? 0,
    generated_pesticides: pesticides.length,
    generated_fungicides: fungicides.length,
    generated_fertilizers: fertilizers2.length,
    generated_diseases: diseases2.length
  };
}

// src/ingestion/sources/indianAgCatalogSource.ts
var import_drizzle_orm3 = require("drizzle-orm");
init_db();
init_agCatalog();
init_fertilizers();
init_crops();
init_fertilizerProducts();

// src/ingestion/data/doaAdvisories.ts
var DOA_ADVISORIES = [
  {
    id: "doa-pm-kisan",
    type: "scheme",
    title: "PM-KISAN \u2014 Income support for farmers",
    titleTe: "PM-KISAN \u2014 Rythu dhanaharam",
    description: "\u20B96,000 per year in 3 instalments to eligible landholding farmer families. Apply via pmkisan.gov.in or visit agriculture office with land records and Aadhaar.",
    state: "All India",
    source: "moa",
    sourceUrl: "https://pmkisan.gov.in/"
  },
  {
    id: "doa-soil-health-card",
    type: "soil",
    title: "Soil Health Card Scheme",
    titleTe: "Soil Health Card Scheme",
    description: "Free soil testing every 3 years. Card shows N, P, K, pH, EC, organic carbon and micronutrient status with crop-wise fertilizer recommendations. Apply at District Agriculture Office or through SHC portal.",
    state: "All India",
    source: "moa",
    sourceUrl: "https://soilhealth.dac.gov.in/"
  },
  {
    id: "doa-pm-pranam",
    type: "fertilizer",
    title: "PM-PRANAM \u2014 Reduce chemical fertilizer subsidy",
    description: "Incentive to states for reducing urea and chemical fertilizer consumption through alternative fertilizers and balanced nutrient management.",
    state: "All India",
    source: "moa",
    sourceUrl: "https://agriwelfare.gov.in/"
  },
  {
    id: "doa-nfsm-pulses",
    type: "crop",
    title: "NFSM \u2014 Pulses and oilseeds area expansion",
    description: "National Food Security Mission supports seed distribution, INM/IPM demonstrations and training for pulses (chickpea, redgram, greengram) and oilseeds (groundnut, mustard).",
    cropTags: ["chickpea", "redgram", "greengram", "groundnut", "mustard"],
    season: "kharif",
    source: "doa",
    sourceUrl: "https://agriwelfare.gov.in/"
  },
  {
    id: "doa-kharif-advisory-rice",
    type: "advisory",
    title: "Kharif rice \u2014 pre-monsoon land preparation",
    titleTe: "Kharif vari \u2014 varsham mundu panulu",
    description: "Level field for uniform irrigation. Apply green manure (dhaincha) 15 days before transplant. Use 5 kg zinc sulphate/acre on Zn-deficient soils. Treat seeds with Tricyclazole or Carbendazim.",
    cropTags: ["rice"],
    season: "kharif",
    state: "All India",
    source: "doa"
  },
  {
    id: "doa-rabi-wheat-sowing",
    type: "advisory",
    title: "Rabi wheat \u2014 timely sowing advisory",
    description: "Optimal sowing window: Nov 1\u201325 for North India, Nov 15\u2013Dec 15 for Central India. Delay reduces yield 1\u20131.5% per week. Treat seed with Vitavax or Carbendazim @ 2 g/kg.",
    cropTags: ["wheat"],
    season: "rabi",
    source: "doa"
  },
  {
    id: "doa-fertilizer-balanced-use",
    type: "fertilizer",
    title: "Balanced fertilizer use advisory",
    titleTe: "Samatulya fertilizer vaada \u2014 salaha",
    description: "Do not apply urea alone every season. Maintain N:P:K ratio based on Soil Health Card. Use complex fertilizers (NPK) and micronutrients. Adopt split application of nitrogen.",
    state: "All India",
    source: "doa",
    sourceUrl: "https://dof.gov.in/"
  },
  {
    id: "doa-neem-coated-urea",
    type: "fertilizer",
    title: "Neem-coated urea mandate",
    description: "100% neem-coated urea is supplied under subsidy. Neem coating reduces nitrogen loss by 10\u201315% and improves use efficiency. Available at PACS and authorized dealers via iFMS/e-Urvarak.",
    source: "doa",
    sourceUrl: "https://dof.gov.in/"
  },
  {
    id: "doa-ap-rythu-bharosa",
    type: "scheme",
    title: "Telangana Rythu Bharosa / AP input support",
    description: "State input assistance for farmers \u2014 seed, fertilizer and pesticide support through Rythu Bharosa Kendras. Check eligibility at local agriculture extension officer.",
    state: "Telangana / Andhra Pradesh",
    cropTags: ["rice", "cotton", "maize", "chilli"],
    source: "state_agri"
  },
  {
    id: "doa-pesticide-safety",
    type: "advisory",
    title: "Pesticide application safety advisory",
    description: "Always read label before use. Wear mask, gloves and full sleeves. Observe Pre-Harvest Interval (PHI). Do not spray during peak heat (11 AM\u20133 PM). Store pesticides away from food and children.",
    state: "All India",
    source: "doa"
  },
  {
    id: "doa-drought-management",
    type: "advisory",
    title: "Drought contingency crop advisory",
    description: "Shift to short-duration varieties. Mulch with crop residue. Apply potassium to improve drought tolerance. Use drip/sprinkler if available. Delay nitrogen until moisture assured.",
    season: "kharif",
    source: "doa"
  },
  {
    id: "doa-organic-farming",
    type: "crop",
    title: "Paramparagat Krishi Vikas Yojana (PKVY)",
    description: "Cluster-based organic farming support \u2014 \u20B950,000/hectare over 3 years for organic inputs, certification and marketing. Contact District Agriculture Officer.",
    state: "All India",
    source: "moa",
    sourceUrl: "https://agriwelfare.gov.in/"
  }
];

// src/ingestion/data/icarGuidelines.ts
var ICAR_GUIDELINES = [
  {
    id: "icar-rice-n-split",
    category: "fertilizer",
    cropId: "rice",
    title: "Split nitrogen application in rice",
    titleTe: "\u0C35\u0C30\u0C3F\u0C32\u0C4B nitrogen split application",
    content: "Apply 50% N as basal, 25% at tillering (25\u201330 DAT), 25% at panicle initiation (45\u201350 DAT). Use neem-coated urea. Avoid late nitrogen after flowering \u2014 causes lodging and blast.",
    season: "kharif",
    region: "India",
    sourceUrl: "https://www.icar.org.in/",
    tags: ["urea", "nitrogen", "split-dose"]
  },
  {
    id: "icar-rice-zn",
    category: "fertilizer",
    cropId: "rice",
    title: "Zinc application for rice (khaira prevention)",
    titleTe: "\u0C35\u0C30\u0C3F\u0C32\u0C4B zinc \u2014 khaira nundi rakshana",
    content: "Apply Zinc sulphate 25 kg/ha or 0.5% foliar spray at tillering if soil Zn is low. Essential on alkaline and sodic soils. Combine with organic matter for better uptake.",
    season: "kharif",
    tags: ["zinc", "micronutrient", "khaira"]
  },
  {
    id: "icar-rice-blast-ipm",
    category: "disease",
    cropId: "rice",
    title: "IPM for rice blast",
    content: "Use resistant varieties (BPT 5204, MTU 1010 where suitable). Seed treatment with Tricyclazole. Avoid excess nitrogen. Spray Tricyclazole 75% WP @ 120 g/acre at panicle emergence if symptoms appear.",
    season: "kharif",
    tags: ["blast", "fungicide", "IPM"]
  },
  {
    id: "icar-wheat-rust",
    category: "disease",
    cropId: "wheat",
    title: "Yellow rust management in wheat",
    content: "Monitor for yellow stripes from January onwards. Spray Propiconazole 25% EC @ 200 ml/acre at first pustule sight. Prefer resistant varieties: HD 3086, PBW 725, DBW 187.",
    season: "rabi",
    tags: ["yellow-rust", "fungicide"]
  },
  {
    id: "icar-wheat-fertilizer",
    category: "fertilizer",
    cropId: "wheat",
    title: "Wheat fertilizer schedule (irrigated)",
    content: "DAP 50 kg/acre basal + Urea 50 kg/acre in two splits (CRI stage + late tillering). MOP 15 kg/acre if soil K is low. Apply full phosphorus at sowing.",
    season: "rabi",
    tags: ["DAP", "urea", "MOP"]
  },
  {
    id: "icar-cotton-ipm",
    category: "pest",
    cropId: "cotton",
    title: "Cotton bollworm IPM with pheromone traps",
    content: "Install 5 Heliothis pheromone traps/acre. Economic threshold: 2 egg masses/100 plants. Use Emamectin benzoate or Spinosad when threshold crossed. Conserve natural enemies \u2014 avoid calendar spraying.",
    season: "kharif",
    tags: ["bollworm", "IPM", "pheromone"]
  },
  {
    id: "icar-cotton-fertilizer",
    category: "fertilizer",
    cropId: "cotton",
    title: "Cotton nutrient management",
    content: "NPK 12:32:16 50 kg/acre at square formation. Urea 25 kg + MOP 10 kg/acre side dressing at flowering. Foliar magnesium sulphate 5 g/L at boll development if deficiency observed.",
    season: "kharif",
    tags: ["NPK", "magnesium"]
  },
  {
    id: "icar-groundnut-ca-b",
    category: "fertilizer",
    cropId: "groundnut",
    title: "Groundnut calcium and boron",
    content: "Apply gypsum 400 kg/ha at peg formation for pod filling. Boron 0.1% foliar at flowering if hollow heart observed. Rhizobium seed treatment reduces nitrogen need by 25%.",
    season: "kharif",
    tags: ["gypsum", "boron", "rhizobium"]
  },
  {
    id: "icar-tomato-drip-fertigation",
    category: "fertilizer",
    cropId: "tomato",
    title: "Tomato fertigation schedule (drip)",
    content: "NPK 19:19:19 water-soluble @ 2\u20133 kg/acre/week through drip from transplant to fruit set. Reduce nitrogen after first pick to improve fruit quality. Maintain EC 1.5\u20132.0 dS/m.",
    season: "year-round",
    tags: ["fertigation", "drip", "NPK"]
  },
  {
    id: "icar-soil-ph-rice",
    category: "best_practice",
    cropId: "rice",
    title: "Soil pH management for rice",
    content: "Optimal pH 5.5\u20136.5 for rice. On alkaline soils apply gypsum or organic matter. On acid soils liming may be needed. Test soil every 3 years via Soil Health Card.",
    tags: ["soil-pH", "soil-health-card"]
  },
  {
    id: "icar-ipm-general",
    category: "best_practice",
    title: "ICAR IPM principles for all crops",
    titleTe: "ICAR IPM \u2014 anni pantala ki",
    content: "1. Use resistant varieties 2. Monitor pests weekly 3. Economic threshold based spraying 4. Rotate pesticide groups 5. Conserve natural enemies 6. Record all sprays for PHI compliance.",
    region: "India",
    sourceUrl: "https://www.icar.org.in/",
    tags: ["IPM", "general"]
  },
  {
    id: "icar-organic-manure",
    category: "fertilizer",
    title: "Integrated nutrient management with FYM",
    content: "Apply 5\u201310 tonnes FYM/acre before kharif/rabi. Combine with 50% recommended chemical fertilizer dose on soils with good organic carbon (>0.5%). Green manuring with dhaincha before rice saves 25 kg N/acre.",
    tags: ["FYM", "organic", "green-manure"]
  },
  {
    id: "icar-maize-n-management",
    category: "fertilizer",
    cropId: "maize",
    title: "Maize nitrogen management",
    content: "Full dose P and K at sowing. Urea in 3 splits: 1/3 basal, 1/3 at knee-high (30 DAS), 1/3 at tasseling. Zinc sulphate 10 kg/ha on zinc-deficient soils.",
    season: "kharif",
    tags: ["maize", "urea", "zinc"]
  },
  {
    id: "icar-chickpea-rhizobium",
    category: "fertilizer",
    cropId: "chickpea",
    title: "Chickpea bio-fertilizer and phosphorus",
    content: "Rhizobium seed treatment mandatory. DAP 40\u201350 kg/acre basal. Avoid nitrogen top dressing. MOP 10 kg/acre if soil K is medium-low.",
    season: "rabi",
    tags: ["rhizobium", "DAP", "pulses"]
  },
  {
    id: "icar-sugarcane-npk",
    category: "fertilizer",
    cropId: "sugarcane",
    title: "Sugarcane nutrient schedule",
    content: "N 250\u2013300 kg/ha in 3 splits, P\u2082O\u2085 80 kg/ha basal, K\u2082O 100 kg/ha in 2 splits. Apply trash mulching to conserve moisture and recycle nutrients. Earthing up at 120 days.",
    season: "year-round",
    tags: ["sugarcane", "NPK"]
  }
];

// src/ingestion/data/nagarjunaDeepakFertilizers.ts
var NAGARJUNA_DEEPAK_FERTILIZERS = [
  // ── Nagarjuna ──
  {
    id: "nagarjuna-urea",
    name: "Nagarjuna Urea",
    brand: "Nagarjuna",
    category: "Nitrogen",
    npk: "46-0-0",
    nutrient: "Nitrogen 46% (prilled, white free-flowing)",
    dosage: "45\u201355 kg/acre",
    benefits: "Primary nitrogen source from NFCL Kakinada plant; FCO grade urea.",
    crops: ["rice", "wheat", "maize", "sugarcane", "cotton"],
    seasons: ["kharif", "rabi", "year-round"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Split application recommended; incorporate in moist soil.",
    precautions: "Store dry; avoid contact with seeds.",
    packSize: "45 kg",
    image: "nagarjuna-urea.png",
    source: "nagarjuna",
    sourceUrl: "https://www.nagarjunafertilizers.com/products/urea/",
    soilType: ["alluvial", "black_cotton", "red", "laterite"]
  },
  {
    id: "nagarjuna-dap",
    name: "Nagarjuna DAP",
    brand: "Nagarjuna",
    category: "Phosphatic",
    npk: "18-46-0",
    nutrient: "N 18%, P\u2082O\u2085 46% (FCO specification)",
    dosage: "50\u201365 kg/acre",
    benefits: "Diammonium phosphate for root development and early vigour.",
    crops: ["rice", "wheat", "maize", "cotton", "chickpea", "groundnut"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Apply at sowing below seed or band placement.",
    precautions: "Do not seed-placed at high rates.",
    packSize: "50 kg",
    image: "nagarjuna-dap.png",
    source: "nagarjuna",
    sourceUrl: "https://www.nagarjunafertilizers.com/products/dap/",
    soilType: ["red", "alluvial", "black_cotton"]
  },
  {
    id: "nagarjuna-map",
    name: "Nagarjuna MAP (12-61-00)",
    brand: "Nagarjuna",
    category: "Phosphatic",
    npk: "12-61-0",
    nutrient: "N 12%, P\u2082O\u2085 61%",
    dosage: "40\u201355 kg/acre",
    benefits: "Water-soluble MAP for fertigation and high-value crops.",
    crops: ["vegetables", "fruits", "cotton", "sugarcane"],
    seasons: ["year-round"],
    application: ["Basal", "Fertigation"],
    applicationMethod: "Fully soluble \u2014 suitable for drip and foliar systems.",
    precautions: "Premium product; confirm economics for field crops.",
    packSize: "25 kg",
    image: "nagarjuna-map.png",
    source: "nagarjuna",
    sourceUrl: "https://www.nagarjunafertilizers.com/products/map-12-61-00/",
    soilType: ["alluvial", "sandy"]
  },
  {
    id: "nagarjuna-polyfeed-19-19-19",
    name: "Poly Feed 19-19-19 + MEN",
    brand: "Nagarjuna",
    category: "NPK Complex",
    npk: "19-19-19",
    nutrient: "N 19%, P 19%, K 19% + micronutrients",
    dosage: "2\u20133 kg/acre/week (fertigation)",
    benefits: "Water-soluble NPK with micronutrients for drip and foliar use.",
    crops: ["tomato", "chilli", "banana", "grapes", "vegetables"],
    seasons: ["year-round"],
    application: ["Fertigation", "Foliar"],
    applicationMethod: "Dissolve in drip tank; EC monitoring recommended.",
    precautions: "Do not mix with calcium nitrate in same tank.",
    packSize: "25 kg",
    image: "polyfeed-19-19-19.png",
    source: "nagarjuna",
    sourceUrl: "https://www.nagarjunafertilizers.com/products/poly-feed-19-19-19/",
    soilType: ["alluvial", "sandy", "red"]
  },
  {
    id: "nagarjuna-mkp",
    name: "MKP 00-52-34 (Mono Potassium Phosphate)",
    brand: "Nagarjuna",
    category: "Potassic",
    npk: "0-52-34",
    nutrient: "P\u2082O\u2085 52%, K\u2082O 34%",
    dosage: "1\u20132 kg/acre per fertigation cycle",
    benefits: "Phosphorus and potassium without nitrogen \u2014 ideal at flowering/fruit set.",
    crops: ["tomato", "chilli", "grapes", "banana", "potato"],
    seasons: ["year-round"],
    application: ["Fertigation", "Foliar"],
    applicationMethod: "Apply at flowering through drip or 0.5% foliar spray.",
    precautions: "Avoid mixing with calcium-containing fertilizers.",
    packSize: "25 kg",
    image: "mkp.png",
    source: "nagarjuna",
    sourceUrl: "https://www.nagarjunafertilizers.com/products/mkp-00-52-34/"
  },
  {
    id: "nagarjuna-multi-k",
    name: "Multi-K Potassium Nitrate (13-0-46)",
    brand: "Nagarjuna",
    category: "Potassic",
    npk: "13-0-46",
    nutrient: "N 13%, K\u2082O 46%",
    dosage: "1\u20132 kg/acre per fertigation cycle",
    benefits: "Chloride-free potash with nitrate nitrogen for fruit quality.",
    crops: ["tomato", "potato", "grapes", "tobacco", "vegetables"],
    seasons: ["year-round"],
    application: ["Fertigation", "Foliar"],
    applicationMethod: "Apply during fruit development through drip.",
    precautions: "Chloride-sensitive crops preferred over MOP.",
    packSize: "25 kg",
    image: "multi-k.png",
    source: "nagarjuna",
    sourceUrl: "https://www.nagarjunafertilizers.com/products/multi-k-13-0-46/"
  },
  {
    id: "nagarjuna-zinc-sulphate",
    name: "Nagarjuna Zinc Sulphate",
    brand: "Nagarjuna",
    category: "Micronutrient",
    npk: "0-0-0",
    nutrient: "Zinc 21% (heptahydrate)",
    dosage: "10\u201325 kg/acre soil OR 0.5% foliar",
    benefits: "Corrects zinc deficiency in rice, maize and cotton.",
    crops: ["rice", "maize", "cotton", "wheat", "pulses"],
    seasons: ["kharif", "rabi"],
    application: ["Basal", "Foliar"],
    applicationMethod: "Soil apply at sowing or foliar at tillering.",
    precautions: "Do not mix with phosphatic fertilizers for foliar.",
    packSize: "25 kg",
    image: "nagarjuna-zinc.png",
    source: "nagarjuna",
    sourceUrl: "https://www.nagarjunafertilizers.com/products/zinc-sulphate/",
    soilType: ["black_cotton", "alkaline", "alluvial"]
  },
  {
    id: "nagarjuna-borovin",
    name: "Borovin (Boron fertilizer)",
    brand: "Nagarjuna",
    category: "Micronutrient",
    npk: "0-0-0",
    nutrient: "Boron 10\u201315%",
    dosage: "2\u20135 kg/acre",
    benefits: "Prevents boron deficiency in cotton, groundnut and oilseeds.",
    crops: ["cotton", "groundnut", "mustard", "chilli", "grapes"],
    seasons: ["kharif", "rabi"],
    application: ["Basal", "Foliar"],
    applicationMethod: "Apply at pre-flowering; foliar 0.1\u20130.2% if needed.",
    precautions: "Narrow toxicity margin \u2014 do not overdose.",
    packSize: "10 kg",
    image: "borovin.png",
    source: "nagarjuna",
    sourceUrl: "https://www.nagarjunafertilizers.com/products/borovin/"
  },
  // ── Deepak Fertilisers (Mahadhan) ──
  {
    id: "deepak-mahadhan-12-32-16",
    name: "Mahadhan 12-32-16",
    brand: "Deepak Fertilisers",
    category: "NPK Complex",
    npk: "12-32-16",
    nutrient: "N 12%, P 32%, K 16%",
    dosage: "50\u201375 kg/acre",
    benefits: "Nitro-phosphate based complex; high P for early root establishment.",
    crops: ["soybean", "potato", "cotton", "chilli", "groundnut"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Apply at sowing; incorporate in root zone.",
    precautions: "High phosphorus \u2014 confirm soil requirement.",
    packSize: "50 kg",
    image: "mahadhan-12-32-16.png",
    source: "deepak",
    sourceUrl: "https://www.deepakfertiliser.com/mahadhan/mahadhan-12-32-16/",
    soilType: ["red", "black_cotton", "alluvial"]
  },
  {
    id: "deepak-mahadhan-10-26-26",
    name: "Mahadhan 10-26-26",
    brand: "Deepak Fertilisers",
    category: "NPK Complex",
    npk: "10-26-26",
    nutrient: "N 10%, P 26%, K 26%",
    dosage: "50\u201380 kg/acre",
    benefits: "Balanced P and K complex for leaching-prone soils.",
    crops: ["rice", "cotton", "chilli", "sugarcane"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Basal before sowing.",
    packSize: "50 kg",
    image: "mahadhan-10-26-26.png",
    source: "deepak",
    sourceUrl: "https://www.deepakfertiliser.com/mahadhan/mahadhan-10-26-26/",
    soilType: ["red", "laterite", "sandy"]
  },
  {
    id: "deepak-mahadhan-20-20-0-13",
    name: "Mahadhan 20-20-0-13",
    brand: "Deepak Fertilisers",
    category: "NPK Complex",
    npk: "20-20-0-13",
    nutrient: "N 20%, P 20%, S 13%",
    dosage: "80\u2013150 kg/acre",
    benefits: "Sulphur-containing NP grade for oilseeds and pulses.",
    crops: ["mustard", "groundnut", "wheat", "onion", "chilli"],
    seasons: ["rabi", "kharif"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Preferred for sulphur-deficient soils.",
    packSize: "50 kg",
    image: "mahadhan-20-20-0-13.png",
    source: "deepak",
    sourceUrl: "https://www.deepakfertiliser.com/mahadhan/mahadhan-20-20-0-13/",
    soilType: ["alluvial", "black_cotton"]
  },
  {
    id: "deepak-mahadhan-sop",
    name: "Mahadhan Sulphate of Potash (SOP)",
    brand: "Deepak Fertilisers",
    category: "Potassic",
    npk: "0-0-50",
    nutrient: "K\u2082O 50%, Sulphur 18%",
    dosage: "20\u201340 kg/acre",
    benefits: "Chloride-free potash with sulphur; ideal for tobacco, potato, fruits.",
    crops: ["potato", "tobacco", "grapes", "vegetables", "fruits"],
    seasons: ["year-round"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Apply before flowering on chloride-sensitive crops.",
    precautions: "Higher cost than MOP \u2014 use where chloride is a concern.",
    packSize: "50 kg",
    image: "mahadhan-sop.png",
    source: "deepak",
    sourceUrl: "https://www.deepakfertiliser.com/mahadhan/mahadhan-sop/"
  },
  {
    id: "deepak-mahadhan-amruta-cn",
    name: "Mahadhan Amruta Calcium Nitrate",
    brand: "Deepak Fertilisers",
    category: "Nitrogen",
    npk: "15.5-0-0",
    nutrient: "N 15.5%, Ca 19% (water soluble)",
    dosage: "5\u201310 kg/acre per fertigation cycle",
    benefits: "Calcium and nitrate nitrogen for fruit quality and shelf life.",
    crops: ["tomato", "chilli", "grapes", "apple", "vegetables"],
    seasons: ["year-round"],
    application: ["Fertigation", "Foliar"],
    applicationMethod: "Apply through drip at fruit development; prevents blossom end rot.",
    precautions: "Do not mix with phosphates in same tank.",
    packSize: "25 kg",
    image: "amruta-calcium-nitrate.png",
    source: "deepak",
    sourceUrl: "https://www.deepakfertiliser.com/mahadhan/amruta-calcium-nitrate/",
    soilType: ["sandy", "red", "alluvial"]
  },
  {
    id: "deepak-mahadhan-bentonite-s",
    name: "Mahadhan Sulphur Bentonite",
    brand: "Deepak Fertilisers",
    category: "Micronutrient",
    npk: "0-0-0",
    nutrient: "Sulphur 90% (bentonite pastilles)",
    dosage: "10\u201320 kg/acre",
    benefits: "Elemental sulphur for sulphur-deficient soils; improves oil content in oilseeds.",
    crops: ["mustard", "groundnut", "onion", "garlic", "wheat"],
    seasons: ["rabi", "kharif"],
    application: ["Basal"],
    applicationMethod: "Broadcast before sowing; needs moisture to oxidise.",
    precautions: "Apply well before crop sowing for conversion to sulphate.",
    packSize: "50 kg",
    image: "sulphur-bentonite.png",
    source: "deepak",
    sourceUrl: "https://www.deepakfertiliser.com/mahadhan/mahadhan-bentonite-sulphur/",
    soilType: ["alluvial", "red", "black_cotton"]
  }
];

// src/ingestion/data/indianFertilizerCatalog.ts
var INDIAN_FERTILIZER_CATALOG = [
  // ── IFFCO ──────────────────────────────────────────────────────────────
  {
    id: "iffco-urea",
    name: "Neem Coated Urea",
    nameTe: "\u0C28\u0C40\u0C2E\u0C4D Coated \u0C2F\u0C42\u0C30\u0C3F\u0C2F\u0C3E",
    brand: "IFFCO",
    category: "Nitrogen",
    npk: "46-0-0",
    nutrient: "Nitrogen 46%",
    dosage: "45\u201355 kg/acre (split doses)",
    benefits: "Primary nitrogen source for vegetative growth; neem coating reduces nitrogen loss and improves use efficiency.",
    crops: ["rice", "wheat", "maize", "cotton", "sugarcane", "groundnut", "tomato"],
    seasons: ["kharif", "rabi", "year-round"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Apply in split doses \u2014 50% at sowing/transplanting, balance at tillering/panicle initiation. Incorporate into moist soil within 24 hours.",
    precautions: "Avoid overuse; excess nitrogen causes lodging and pest buildup. Do not mix with seeds. Keep away from moisture before application.",
    mrp: "\u20B9266.50/bag (45 kg)",
    packSize: "45 kg",
    image: "urea.png",
    source: "iffco",
    sourceUrl: "https://www.iffco.in/en/urea-fertilizer"
  },
  {
    id: "iffco-dap",
    name: "DAP (Diammonium Phosphate)",
    nameTe: "DAP (\u0C21\u0C2F\u0C3E\u0C2E\u0C4B\u0C28\u0C3F\u0C2F\u0C02 \u0C2B\u0C3E\u0C38\u0C4D\u0C2B\u0C47\u0C1F\u0C4D)",
    brand: "IFFCO",
    category: "Phosphatic",
    npk: "18-46-0",
    nutrient: "Nitrogen 18%, Phosphorus (P\u2082O\u2085) 46%",
    dosage: "50\u201365 kg/acre",
    benefits: "Concentrated phosphate fertilizer; essential for root development, tillering and early crop establishment.",
    crops: ["rice", "wheat", "maize", "cotton", "chickpea", "groundnut", "mustard", "sugarcane"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Apply at sowing or transplanting as basal dose, placed 5\u20137 cm below seed or mixed with soil in root zone.",
    precautions: "Do not place in direct contact with seed. Avoid mixing with urea at storage. Not for foliar spray.",
    mrp: "\u20B91,350/bag (50 kg)",
    packSize: "50 kg",
    image: "dap.png",
    source: "iffco",
    sourceUrl: "https://www.iffco.in/en/dap-18-46-0"
  },
  {
    id: "iffco-npk-10-26-26",
    name: "NPK 10-26-26",
    brand: "IFFCO",
    category: "NPK Complex",
    npk: "10-26-26",
    nutrient: "Nitrogen 10%, Phosphorus 26%, Potassium 26%",
    dosage: "50\u201380 kg/acre",
    benefits: "DAP-based complex; fixes phosphorus and potassium in leaching-prone soils; granular, moisture-resistant.",
    crops: ["rice", "cotton", "chilli", "sugarcane", "tomato", "groundnut"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Broadcast and incorporate before sowing or apply in furrows at planting.",
    precautions: "Store in dry place. Do not over-apply potassium on saline soils.",
    mrp: "\u20B91,720/bag (50 kg)",
    packSize: "50 kg",
    image: "npk-10-26-26.png",
    source: "iffco",
    sourceUrl: "https://www.iffco.in/en/npk-10-26-26"
  },
  {
    id: "iffco-npk-12-32-16",
    name: "NPK 12-32-16",
    brand: "IFFCO",
    category: "NPK Complex",
    npk: "12-32-16",
    nutrient: "Nitrogen 12%, Phosphorus 32%, Potassium 16%",
    dosage: "50\u201375 kg/acre",
    benefits: "High-phosphate complex (60% total nutrients); ideal for early root and tuber development.",
    crops: ["soybean", "potato", "groundnut", "cotton", "chilli", "tomato"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Apply as basal before sowing; mix thoroughly with soil.",
    precautions: "High phosphorus \u2014 avoid on phosphorus-rich soils without soil test.",
    mrp: "\u20B91,720/bag (50 kg)",
    packSize: "50 kg",
    image: "npk-12-32-16.png",
    source: "iffco",
    sourceUrl: "https://www.iffco.in/en/npk-12-32-16"
  },
  {
    id: "iffco-np-20-20-0-13",
    name: "NP(S) 20-20-0-13",
    brand: "IFFCO",
    category: "NPK Complex",
    npk: "20-20-0-13",
    nutrient: "Nitrogen 20%, Phosphorus 20%, Sulphur 13%",
    dosage: "80\u2013150 kg/acre",
    benefits: "Ammonium phosphate sulphate; supplies sulphur for chlorophyll synthesis; suited to sulphur-deficient soils.",
    crops: ["wheat", "paddy", "mustard", "groundnut", "onion", "chilli", "sugarcane"],
    seasons: ["kharif", "rabi"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Apply as basal or top dress; suitable for oilseeds and pulses on sulphur-deficient soils.",
    precautions: "Not for chloride-sensitive crops when used with MOP in same season \u2014 plan nutrient balance.",
    mrp: "\u20B91,300/bag (50 kg)",
    packSize: "50 kg",
    image: "np-20-20-0-13.png",
    source: "iffco",
    sourceUrl: "https://www.iffco.in/en/np-20-20"
  },
  {
    id: "iffco-npk-15-15-15",
    name: "NPK 15-15-15",
    brand: "IFFCO",
    category: "NPK Complex",
    npk: "15-15-15",
    nutrient: "Nitrogen 15%, Phosphorus 15%, Potassium 15%",
    dosage: "80\u2013100 kg/acre",
    benefits: "Balanced NPK in 1:1:1 ratio for general crop nutrition and vegetative growth.",
    crops: ["rice", "wheat", "maize", "cotton", "vegetables", "sugarcane"],
    seasons: ["kharif", "rabi", "year-round"],
    application: ["Basal"],
    applicationMethod: "Apply at sowing/transplanting as basal dose.",
    precautions: "Adjust dose based on soil test; balanced grade may not suit highly deficient soils.",
    mrp: "\u20B91,250/bag (50 kg)",
    packSize: "50 kg",
    image: "npk-15-15-15.png",
    source: "iffco",
    sourceUrl: "https://www.iffco.in/en/npk-15-15-15"
  },
  {
    id: "iffco-np-28-28-0",
    name: "NP 28-28-0",
    brand: "IFFCO",
    category: "NPK Complex",
    npk: "28-28-0",
    nutrient: "Nitrogen 28%, Phosphorus 28%",
    dosage: "75\u2013200 kg/acre (crop dependent)",
    benefits: "Highest nitrogen complex grade; prolonged greenness; 25% P in water-soluble form.",
    crops: ["paddy", "cotton", "chilli", "sugarcane", "vegetables"],
    seasons: ["kharif", "rabi"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Ideal basal for paddy and cotton; can top-dress in standing crops.",
    precautions: "High nitrogen \u2014 split application recommended on light soils.",
    mrp: "\u20B91,750/bag (50 kg)",
    packSize: "50 kg",
    image: "np-28-28-0.png",
    source: "iffco",
    sourceUrl: "https://www.iffco.in/en/np-28-28-0"
  },
  {
    id: "iffco-nano-urea",
    name: "Nano Urea",
    brand: "IFFCO",
    category: "Nano",
    npk: "4-0-0",
    nutrient: "Nitrogen 4% (nano form)",
    dosage: "1 bottle (500 ml) replaces 1 bag urea per acre (as per label)",
    benefits: "Nano-particle urea for foliar/precision application; reduces bulk transport and nitrogen loss.",
    crops: ["rice", "wheat", "maize", "cotton", "vegetables", "sugarcane"],
    seasons: ["kharif", "rabi", "year-round"],
    application: ["Foliar"],
    applicationMethod: "Spray on foliage during active growth; follow IFFCO label dilution rates.",
    precautions: "Use only as per manufacturer directions; not a full substitute without agronomic guidance.",
    mrp: "\u20B9225/bottle (500 ml)",
    packSize: "500 ml",
    image: "nano-urea.png",
    source: "iffco",
    isSubsidized: true,
    sourceUrl: "https://www.iffco.in/en/nano-urea-liquid-fertilizer"
  },
  {
    id: "iffco-nano-dap",
    name: "Nano DAP",
    brand: "IFFCO",
    category: "Nano",
    npk: "8-16-0",
    nutrient: "Nitrogen 8%, Phosphorus 16% (nano form)",
    dosage: "1 bottle (500 ml) per acre (as per label)",
    benefits: "Nano phosphorus delivery for early root establishment and reduced bulk application.",
    crops: ["rice", "wheat", "pulses", "vegetables", "cotton"],
    seasons: ["kharif", "rabi"],
    application: ["Foliar", "Seed treatment"],
    applicationMethod: "Foliar spray or seed treatment as per label instructions.",
    precautions: "Store away from direct sunlight; use within expiry period.",
    mrp: "\u20B9600/bottle (500 ml)",
    packSize: "500 ml",
    image: "nano-dap.png",
    source: "iffco",
    sourceUrl: "https://www.iffco.in/en/nano-dap-liquid"
  },
  {
    id: "iffco-nano-zinc",
    name: "Nano Zinc",
    brand: "IFFCO",
    category: "Nano",
    npk: "0-0-0",
    nutrient: "Zinc (nano form)",
    dosage: "1 bottle (100 ml) per acre",
    benefits: "Corrects zinc deficiency; improves grain filling and crop quality.",
    crops: ["rice", "wheat", "maize", "cotton", "pulses"],
    seasons: ["kharif", "rabi"],
    application: ["Foliar"],
    applicationMethod: "Foliar spray at active growth stage; dilute as per label.",
    precautions: "Do not exceed recommended dose; avoid mixing with alkaline pesticides.",
    mrp: "\u20B9200/bottle (100 ml)",
    packSize: "100 ml",
    image: "nano-zinc.png",
    source: "iffco",
    sourceUrl: "https://www.iffco.in/en/nano-fertilisers"
  },
  // ── Coromandel (Gromor) ────────────────────────────────────────────────
  {
    id: "coromandel-gromor-urea",
    name: "Gromor Urea",
    nameTe: "\u0C17\u0C4D\u0C30\u0C4B\u0C2E\u0C4B\u0C30\u0C4D \u0C2F\u0C42\u0C30\u0C3F\u0C2F\u0C3E",
    brand: "Coromandel",
    category: "Nitrogen",
    npk: "46-0-0",
    nutrient: "Nitrogen 46%",
    dosage: "45\u201355 kg/acre",
    benefits: "Highest percentage nitrogen fertilizer; promotes vigorous vegetative growth.",
    crops: ["rice", "wheat", "maize", "sugarcane", "cotton", "vegetables"],
    seasons: ["kharif", "rabi", "year-round"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Split application recommended; incorporate into soil promptly.",
    precautions: "Avoid overuse; volatilization loss if left on surface in hot dry weather.",
    packSize: "45 kg",
    image: "gromor-urea.png",
    source: "coromandel",
    sourceUrl: "https://www.coromandel.biz/gromor-urea/"
  },
  {
    id: "coromandel-gromor-dap",
    name: "Gromor DAP",
    brand: "Coromandel",
    category: "Phosphatic",
    npk: "18-46-0",
    nutrient: "Nitrogen 18%, Phosphorus (P\u2082O\u2085) 46%",
    dosage: "50\u201365 kg/acre",
    benefits: "Phosphorus-rich basal fertilizer for root development and early vigour.",
    crops: ["rice", "wheat", "maize", "cotton", "pulses", "oilseeds"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Apply at sowing below seed level or band placement.",
    precautions: "Do not seed-placed in high rates; may cause seed injury.",
    packSize: "50 kg",
    image: "gromor-dap.png",
    source: "coromandel",
    sourceUrl: "https://www.coromandel.biz/gromor-godavari-dap/"
  },
  {
    id: "coromandel-gromor-mop",
    name: "Gromor MOP (Muriate of Potash)",
    brand: "Coromandel",
    category: "Potassic",
    npk: "0-0-60",
    nutrient: "Potassium (K\u2082O) 60%",
    dosage: "20\u201340 kg/acre",
    benefits: "Pure potash source; improves grain filling, fruit quality and drought tolerance.",
    crops: ["rice", "wheat", "cotton", "sugarcane", "potato", "banana", "chilli"],
    seasons: ["kharif", "rabi"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Apply at basal or before flowering; incorporate into soil.",
    precautions: "Avoid on chloride-sensitive crops (tobacco, some fruits) \u2014 use SOP instead.",
    packSize: "50 kg",
    image: "gromor-mop.png",
    source: "coromandel",
    sourceUrl: "https://www.coromandel.biz/gromor-mop/"
  },
  {
    id: "coromandel-gromor-ssp",
    name: "Gromor SSP (Single Super Phosphate)",
    brand: "Coromandel",
    category: "Phosphatic",
    npk: "0-16-0",
    nutrient: "Phosphorus 16%, Sulphur 11%, Calcium 19%",
    dosage: "100\u2013150 kg/acre",
    benefits: "Supplies phosphorus, sulphur and calcium; improves soil structure on acidic soils.",
    crops: ["groundnut", "pulses", "oilseeds", "cotton", "sugarcane"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Broadcast and plough in before sowing.",
    precautions: "Higher dose needed vs DAP due to lower P concentration; hygroscopic \u2014 store dry.",
    packSize: "50 kg",
    image: "gromor-ssp.png",
    source: "coromandel",
    sourceUrl: "https://www.coromandel.biz/gromor-ssp/"
  },
  {
    id: "coromandel-gromor-28-28-0",
    name: "Gromor 28-28-0",
    brand: "Coromandel",
    category: "NPK Complex",
    npk: "28-28-0",
    nutrient: "Nitrogen 28%, Phosphorus 28%",
    dosage: "75\u2013200 kg/acre",
    benefits: "Highest N complex; 19% N as urea + 9% ammoniacal; minimises urea losses.",
    crops: ["paddy", "cotton", "chilli", "sugarcane", "vegetables"],
    seasons: ["kharif", "rabi"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Basal for paddy/cotton; 75\u201385 kg/acre kharif paddy, 175\u2013200 kg/acre cotton.",
    precautions: "High analysis \u2014 adjust for soil fertility status.",
    packSize: "50 kg",
    image: "gromor-28-28-0.png",
    source: "coromandel",
    sourceUrl: "https://www.coromandel.biz/gromor-28-28-0/"
  },
  {
    id: "coromandel-gromor-20-20-0-13",
    name: "Gromor 20-20-0-13",
    brand: "Coromandel",
    category: "NPK Complex",
    npk: "20-20-0-13",
    nutrient: "Nitrogen 20%, Phosphorus 20%, Sulphur 13%",
    dosage: "80\u2013200 kg/acre",
    benefits: "Ammonium phosphate sulphate; improves oil content in oilseed crops.",
    crops: ["wheat", "paddy", "mustard", "groundnut", "onion", "chilli", "potato", "sugarcane"],
    seasons: ["kharif", "rabi"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "100\u2013150 kg/acre for wheat/paddy; 200 kg/acre for potato.",
    precautions: "Preferred for sulphur-deficient soils; avoid excess on saline soils.",
    packSize: "50 kg",
    image: "gromor-20-20-0-13.png",
    source: "coromandel",
    sourceUrl: "https://www.coromandel.biz/gromor-20-20-0-13/"
  },
  {
    id: "coromandel-gromor-15-15-15-09",
    name: "Gromor 15-15-15-09",
    brand: "Coromandel",
    category: "NPK Complex",
    npk: "15-15-15-09",
    nutrient: "Nitrogen 15%, Phosphorus 15%, Potassium 15%, Sulphur 9%",
    dosage: "50\u2013150 kg/acre",
    benefits: "Balanced NPK with sulphur; ideal for plantation crops and long-duration crops.",
    crops: ["paddy", "wheat", "maize", "cotton", "chilli", "sugarcane", "vegetables"],
    seasons: ["kharif", "rabi", "year-round"],
    application: ["Basal"],
    applicationMethod: "80\u2013100 kg/acre for paddy/wheat; 120\u2013150 kg/acre for sugarcane/cotton.",
    precautions: "Contains sulphur \u2014 suitable for pulses and oilseeds.",
    packSize: "50 kg",
    image: "gromor-15-15-15-09.png",
    source: "coromandel",
    sourceUrl: "https://www.coromandel.biz/gromor-15-15-15-09/"
  },
  {
    id: "coromandel-gromor-12-32-16",
    name: "Gromor 12-32-16",
    brand: "Coromandel",
    category: "NPK Complex",
    npk: "12-32-16",
    nutrient: "Nitrogen 12%, Phosphorus 32%, Potassium 16%",
    dosage: "50\u201375 kg/acre",
    benefits: "60% total nutrients; DAP-like P ratio plus potash; fast early establishment.",
    crops: ["soybean", "potato", "groundnut", "cotton", "chilli"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Apply at sowing for commercial and tuber crops.",
    precautions: "High P \u2014 confirm soil requirement before use.",
    packSize: "50 kg",
    image: "gromor-12-32-16.png",
    source: "coromandel",
    sourceUrl: "https://www.coromandel.biz/gromor-12-32-16/"
  },
  {
    id: "coromandel-gromor-10-26-26",
    name: "Gromor 10-26-26",
    brand: "Coromandel",
    category: "NPK Complex",
    npk: "10-26-26",
    nutrient: "Nitrogen 10%, Phosphorus 26%, Potassium 26%",
    dosage: "50\u201380 kg/acre",
    benefits: "High P and K complex; effective in leaching-prone soils.",
    crops: ["rice", "cotton", "chilli", "sugarcane", "groundnut"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Basal application before sowing.",
    precautions: "Store in moisture-proof conditions.",
    packSize: "50 kg",
    image: "gromor-10-26-26.png",
    source: "coromandel",
    sourceUrl: "https://www.coromandel.biz/gromor-10-26-26/"
  },
  {
    id: "coromandel-gromor-ultra-10-26-26",
    name: "Gromor Ultra 10-26-26 (Zinc fortified)",
    brand: "Coromandel",
    category: "NPK Complex",
    npk: "10-26-26",
    nutrient: "N 10%, P 26%, K 26%, Zinc 0.5%",
    dosage: "50\u201380 kg/acre",
    benefits: "Zinc-fortified NPK for better yield and quality on zinc-deficient soils.",
    crops: ["rice", "wheat", "maize", "cotton", "pulses"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Apply as basal at sowing.",
    precautions: "Fortified with zinc \u2014 reduce separate zinc application if using this grade.",
    packSize: "50 kg",
    image: "gromor-ultra-10-26-26.png",
    source: "coromandel",
    sourceUrl: "https://www.coromandel.biz/gromor-ultra-10--26-26/"
  },
  {
    id: "coromandel-paramfos",
    name: "Paramfos 16-20-0-13",
    brand: "Coromandel",
    category: "NPK Complex",
    npk: "16-20-0-13",
    nutrient: "Nitrogen 16%, Phosphorus 20%, Sulphur 13%",
    dosage: "80\u2013120 kg/acre",
    benefits: "NP sulphur grade for oilseeds and pulses on sulphur-deficient soils.",
    crops: ["mustard", "groundnut", "chickpea", "wheat", "onion"],
    seasons: ["rabi", "kharif"],
    application: ["Basal"],
    applicationMethod: "Apply before sowing and mix with soil.",
    precautions: "Plan potash separately if soil is K-deficient.",
    packSize: "50 kg",
    image: "paramfos.png",
    source: "coromandel",
    sourceUrl: "https://www.coromandel.biz/paramfos/"
  },
  // ── NFL (National Fertilizers Limited) ───────────────────────────────────
  {
    id: "nfl-urea",
    name: "NFL Urea",
    brand: "NFL",
    category: "Nitrogen",
    npk: "46-0-0",
    nutrient: "Nitrogen 46%",
    dosage: "45\u201355 kg/acre",
    benefits: "Primary nitrogen source manufactured by National Fertilizers Limited (PSU).",
    crops: ["rice", "wheat", "maize", "sugarcane", "cotton", "pulses"],
    seasons: ["kharif", "rabi", "year-round"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Split doses; incorporate into moist soil.",
    precautions: "Avoid overuse; follow state extension recommendations.",
    packSize: "45 kg",
    image: "nfl-urea.png",
    source: "nfl",
    sourceUrl: "https://www.nationalfertilizers.com/product/neem-coated-urea/"
  },
  {
    id: "nfl-neem-urea",
    name: "NFL Neem Coated Urea",
    brand: "NFL",
    category: "Nitrogen",
    npk: "46-0-0",
    nutrient: "Nitrogen 46% (neem coated)",
    dosage: "45\u201355 kg/acre",
    benefits: "Neem coating reduces volatilisation and improves nitrogen use efficiency.",
    crops: ["rice", "wheat", "maize", "cotton", "sugarcane"],
    seasons: ["kharif", "rabi"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Apply in split doses as per crop schedule.",
    precautions: "Mandatory neem-coated urea as per DoF policy for subsidised supply.",
    packSize: "45 kg",
    image: "nfl-neem-urea.png",
    source: "nfl",
    sourceUrl: "https://www.nationalfertilizers.com/product/neem-coated-urea/"
  },
  {
    id: "nfl-bio-rhizobium",
    name: "NFL Rhizobium Bio-fertilizer",
    brand: "NFL",
    category: "Bio-fertilizer",
    npk: "0-0-0",
    nutrient: "Rhizobium bacteria (crop specific strains)",
    dosage: "200 g/acre (seed treatment)",
    benefits: "Fixes atmospheric nitrogen in legume root nodules; reduces urea requirement in pulses.",
    crops: ["chickpea", "greengram", "blackgram", "redgram", "soybean", "groundnut"],
    seasons: ["kharif", "rabi"],
    application: ["Seed treatment"],
    applicationMethod: "Mix with jaggery/slurry and coat seeds before sowing; sow within 24 hours in moist soil.",
    precautions: "Do not mix with chemical pesticides at seed treatment. Store in cool place away from sunlight.",
    packSize: "200 g",
    image: "nfl-rhizobium.png",
    source: "nfl",
    sourceUrl: "https://www.nationalfertilizers.com/product/rhizobium/"
  },
  {
    id: "nfl-bio-azotobacter",
    name: "NFL Azotobacter Bio-fertilizer",
    brand: "NFL",
    category: "Bio-fertilizer",
    npk: "0-0-0",
    nutrient: "Azotobacter chroococcum",
    dosage: "200 g/acre",
    benefits: "Non-symbiotic nitrogen fixer for cereals and vegetables; improves seed germination.",
    crops: ["wheat", "rice", "maize", "cotton", "vegetables"],
    seasons: ["kharif", "rabi"],
    application: ["Seed treatment", "Soil application"],
    applicationMethod: "Seed treat or mix with FYM and apply in field before sowing.",
    precautions: "Not compatible with high-dose chemical fungicide seed dressers.",
    packSize: "200 g",
    image: "nfl-azotobacter.png",
    source: "nfl",
    sourceUrl: "https://www.nationalfertilizers.com/product/azotobacter/"
  },
  {
    id: "nfl-bio-psb",
    name: "NFL PSB (Phosphate Solubilizing Bacteria)",
    brand: "NFL",
    category: "Bio-fertilizer",
    npk: "0-0-0",
    nutrient: "Phosphate solubilizing bacteria",
    dosage: "200 g/acre",
    benefits: "Solubilizes fixed soil phosphorus; enhances P availability to roots.",
    crops: ["rice", "wheat", "pulses", "oilseeds", "vegetables"],
    seasons: ["kharif", "rabi", "year-round"],
    application: ["Seed treatment", "Soil application"],
    applicationMethod: "Apply with seed or mix with compost/FYM at sowing.",
    precautions: "Avoid chemical fungicides on treated seed; use fresh culture each season.",
    packSize: "200 g",
    image: "nfl-psb.png",
    source: "nfl",
    sourceUrl: "https://www.nationalfertilizers.com/product/phosphate-solubilizing-bacteria/"
  },
  {
    id: "nfl-zinc-sulphate",
    name: "NFL Zinc Sulphate (Micronutrient)",
    brand: "NFL",
    category: "Micronutrient",
    npk: "0-0-0",
    nutrient: "Zinc 21%",
    dosage: "10\u201325 kg/acre (soil) or 0.5% foliar spray",
    benefits: "Corrects zinc deficiency; prevents khaira in rice and stunting in maize/cotton.",
    crops: ["rice", "wheat", "maize", "cotton", "pulses", "citrus"],
    seasons: ["kharif", "rabi"],
    application: ["Basal", "Foliar"],
    applicationMethod: "Apply to soil at sowing or spray 0.5% solution at tillering/vegetative stage.",
    precautions: "Do not mix with phosphatic fertilizers in same tank for foliar spray.",
    packSize: "25 kg",
    image: "zinc-sulphate.png",
    source: "nfl",
    sourceUrl: "https://www.nationalfertilizers.com/product/zinc-sulphate/"
  },
  {
    id: "nfl-ferrous-sulphate",
    name: "NFL Ferrous Sulphate",
    brand: "NFL",
    category: "Micronutrient",
    npk: "0-0-0",
    nutrient: "Iron 19%",
    dosage: "5\u201310 kg/acre or 0.5% foliar spray",
    benefits: "Corrects iron chlorosis in calcareous soils; improves photosynthesis.",
    crops: ["rice", "sugarcane", "vegetables", "fruits", "cotton"],
    seasons: ["kharif", "rabi", "year-round"],
    application: ["Foliar", "Soil application"],
    applicationMethod: "Foliar spray preferred on calcareous soils; apply to moist soil.",
    precautions: "Avoid alkaline water for spray preparation.",
    packSize: "25 kg",
    image: "ferrous-sulphate.png",
    source: "nfl",
    sourceUrl: "https://www.nationalfertilizers.com/product/ferrous-sulphate/"
  },
  // ── DoF / India standard grades ────────────────────────────────────────
  {
    id: "dof-mop",
    name: "MOP (Muriate of Potash)",
    nameTe: "MOP (\u0C2A\u0C4A\u0C1F\u0C3E\u0C37\u0C4D)",
    brand: "DoF Standard",
    category: "Potassic",
    npk: "0-0-60",
    nutrient: "Potassium (K\u2082O) 60%, Chloride 47%",
    dosage: "20\u201340 kg/acre",
    benefits: "Standard potash source notified under DoF subsidy scheme; improves yield and quality.",
    crops: ["rice", "wheat", "cotton", "sugarcane", "potato", "chilli", "banana"],
    seasons: ["kharif", "rabi"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Apply before flowering or at basal; incorporated into soil.",
    precautions: "Chloride content \u2014 avoid on chloride-sensitive crops.",
    packSize: "50 kg",
    image: "mop.png",
    source: "dof",
    sourceUrl: "https://dof.gov.in/"
  },
  {
    id: "dof-ammonium-sulphate",
    name: "Ammonium Sulphate",
    brand: "DoF Standard",
    category: "Nitrogen",
    npk: "21-0-0",
    nutrient: "Nitrogen 21%, Sulphur 24%",
    dosage: "50\u2013100 kg/acre",
    benefits: "Nitrogen plus sulphur; acidifying effect useful on alkaline soils.",
    crops: ["rice", "wheat", "tea", "oilseeds", "onion", "garlic"],
    seasons: ["kharif", "rabi"],
    application: ["Basal", "Top dressing"],
    applicationMethod: "Broadcast and incorporate; suitable for sulphur-loving crops.",
    precautions: "Soil acidification with repeated use \u2014 monitor pH.",
    packSize: "50 kg",
    image: "ammonium-sulphate.png",
    source: "dof"
  },
  {
    id: "dof-ssp",
    name: "SSP (Single Super Phosphate)",
    brand: "DoF Standard",
    category: "Phosphatic",
    npk: "0-16-0",
    nutrient: "Phosphorus 16%, Sulphur 11%, Calcium 19%",
    dosage: "100\u2013150 kg/acre",
    benefits: "Economical phosphorus source with sulphur and calcium for Indian soils.",
    crops: ["groundnut", "pulses", "oilseeds", "cotton", "sugarcane"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Apply at land preparation before sowing.",
    precautions: "Store dry; hygroscopic product.",
    packSize: "50 kg",
    image: "ssp.png",
    source: "dof"
  },
  {
    id: "dof-tsp",
    name: "TSP (Triple Super Phosphate)",
    brand: "DoF Standard",
    category: "Phosphatic",
    npk: "0-46-0",
    nutrient: "Phosphorus (P\u2082O\u2085) 46%",
    dosage: "50\u201365 kg/acre",
    benefits: "High-analysis phosphorus without nitrogen; for P-deficient soils.",
    crops: ["pulses", "oilseeds", "cotton", "fruits", "vegetables"],
    seasons: ["kharif", "rabi"],
    application: ["Basal"],
    applicationMethod: "Band placement at sowing recommended.",
    precautions: "No nitrogen content \u2014 plan N separately.",
    packSize: "50 kg",
    image: "tsp.png",
    source: "dof"
  },
  {
    id: "dof-map",
    name: "MAP (Mono Ammonium Phosphate)",
    brand: "DoF Standard",
    category: "Phosphatic",
    npk: "11-52-0",
    nutrient: "Nitrogen 11%, Phosphorus (P\u2082O\u2085) 52%",
    dosage: "40\u201355 kg/acre",
    benefits: "High P analysis with some N; used in fertigation and high-value crops.",
    crops: ["vegetables", "fruits", "cotton", "potato", "sugarcane"],
    seasons: ["kharif", "rabi", "year-round"],
    application: ["Basal", "Fertigation"],
    applicationMethod: "Soil application or soluble form through drip irrigation.",
    precautions: "Premium product \u2014 confirm economic viability for field crops.",
    packSize: "50 kg",
    image: "map.png",
    source: "dof",
    sourceUrl: "https://data.gov.in/catalog/state-wise-and-month-wise-requirement-and-availability-chemical-fertilizers"
  },
  {
    id: "dof-npk-19-19-19",
    name: "NPK 19-19-19",
    brand: "DoF Standard",
    category: "NPK Complex",
    npk: "19-19-19",
    nutrient: "Nitrogen 19%, Phosphorus 19%, Potassium 19%",
    dosage: "50\u201375 kg/acre",
    benefits: "Balanced water-soluble grade popular for horticulture and nurseries.",
    crops: ["vegetables", "fruits", "cotton", "chilli", "tomato", "potato"],
    seasons: ["year-round"],
    application: ["Basal", "Fertigation", "Foliar"],
    applicationMethod: "Can be used in drip or as foliar spray when fully soluble form is used.",
    precautions: "Use soluble grade for fertigation; field grade for soil application.",
    packSize: "50 kg",
    image: "npk-19-19-19.png",
    source: "dof"
  },
  {
    id: "dof-boron",
    name: "Borax / Boron Fertilizer",
    brand: "DoF Standard",
    category: "Micronutrient",
    npk: "0-0-0",
    nutrient: "Boron 10\u201315%",
    dosage: "2\u20135 kg/acre",
    benefits: "Essential for flowering and fruit set; prevents boron deficiency in cotton and pulses.",
    crops: ["cotton", "groundnut", "mustard", "chilli", "tomato", "grapes"],
    seasons: ["kharif", "rabi"],
    application: ["Basal", "Foliar"],
    applicationMethod: "Apply at pre-flowering; foliar 0.1\u20130.2% if deficiency observed.",
    precautions: "Narrow safety margin \u2014 avoid overdose; toxic to seeds at high rates.",
    packSize: "10 kg",
    image: "boron.png",
    source: "dof"
  },
  {
    id: "dof-compost-city",
    name: "City Compost (FCoM)",
    brand: "DoF Standard",
    category: "Organic",
    npk: "0-0-0",
    nutrient: "Organic matter 20%+, NPK variable",
    dosage: "1\u20132 tonnes/acre",
    benefits: "Promoted under DoF scheme; improves soil organic carbon and water holding capacity.",
    crops: ["rice", "wheat", "vegetables", "cotton", "sugarcane", "fruits"],
    seasons: ["kharif", "rabi", "year-round"],
    application: ["Basal"],
    applicationMethod: "Spread and incorporate 2\u20133 weeks before sowing; maintain moisture for decomposition.",
    precautions: "Ensure well-decomposed compost; avoid fresh municipal waste.",
    packSize: "50 kg bag / bulk",
    image: "city-compost.png",
    source: "dof",
    sourceUrl: "https://dof.gov.in/",
    isSubsidized: true
  },
  ...NAGARJUNA_DEEPAK_FERTILIZERS
];

// src/ingestion/data/officialFertilizerMrps.ts
var FERTILIZER_PRICE_VERIFIED_AT = "2026-03-01";
var FERTILIZER_PRICE_SOURCE = {
  id: "dof_statutory_nbs",
  label: "DoF statutory / NBS notified MRP",
  note: "Urea MRP is government-controlled. DAP/MOP/NPK are typical notified bag MRPs under Nutrient Based Subsidy \u2014 dealer may add local charges. Verify on pack / POS.",
  urvarakUrl: "https://urvarak.nic.in/",
  dofUrl: "https://www.fert.nic.in/"
};
var OFFICIAL_FERTILIZER_MRPS = [
  {
    productIds: [
      "iffco-urea",
      "nfl-urea",
      "nfl-neem-urea",
      "coromandel-urea",
      "coromandel-gromor-urea",
      "nagarjuna-urea"
    ],
    aliases: ["neem coated urea", "neem urea", "urea", "46-0-0"],
    mrp: "\u20B9242/bag (45 kg) \u2014 DoF statutory",
    packSize: "45 kg",
    isSubsidized: true,
    grade: "Urea (Neem coated)"
  },
  {
    productIds: [
      "iffco-dap",
      "coromandel-dap",
      "coromandel-gromor-dap",
      "nfl-dap",
      "nagarjuna-dap"
    ],
    aliases: ["dap", "diammonium phosphate", "18-46-0"],
    mrp: "\u20B91,350/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "DAP 18-46-0"
  },
  {
    productIds: ["iffco-mop", "coromandel-mop", "coromandel-gromor-mop", "dof-mop"],
    aliases: ["mop", "muriate of potash", "0-0-60", "potash"],
    mrp: "\u20B91,700/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "MOP 0-0-60"
  },
  {
    productIds: ["iffco-ssp", "coromandel-ssp", "coromandel-gromor-ssp", "dof-ssp"],
    aliases: ["ssp", "single super phosphate"],
    mrp: "\u20B9400/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "SSP"
  },
  {
    productIds: [
      "iffco-npk-10-26-26",
      "coromandel-npk-10-26-26",
      "coromandel-gromor-10-26-26",
      "coromandel-gromor-ultra-10-26-26",
      "deepak-mahadhan-10-26-26"
    ],
    aliases: ["10-26-26", "npk 10-26-26"],
    mrp: "\u20B91,450/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "NPK 10-26-26"
  },
  {
    productIds: [
      "iffco-npk-12-32-16",
      "coromandel-npk-12-32-16",
      "coromandel-gromor-12-32-16",
      "deepak-mahadhan-12-32-16"
    ],
    aliases: ["12-32-16", "npk 12-32-16"],
    mrp: "\u20B91,480/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "NPK 12-32-16"
  },
  {
    productIds: [
      "iffco-np-20-20-0-13",
      "coromandel-20-20-0-13",
      "coromandel-gromor-20-20-0-13",
      "deepak-mahadhan-20-20-0-13"
    ],
    aliases: ["20-20-0", "20-20-0-13", "npk 20-20-0"],
    mrp: "\u20B91,200/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "NPK 20-20-0"
  },
  {
    productIds: [
      "iffco-npk-19-19-19",
      "dof-npk-19-19-19",
      "nagarjuna-polyfeed-19-19-19"
    ],
    aliases: ["19-19-19", "npk 19-19-19", "polyfeed"],
    mrp: "\u20B91,250/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "NPK 19-19-19"
  },
  {
    productIds: ["iffco-npk-15-15-15", "coromandel-gromor-15-15-15-09"],
    aliases: ["15-15-15", "15-15-15-09", "npk 15-15-15"],
    mrp: "\u20B91,300/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "NPK 15-15-15"
  },
  {
    productIds: ["iffco-np-28-28-0", "coromandel-gromor-28-28-0"],
    aliases: ["28-28-0", "np 28-28"],
    mrp: "\u20B91,750/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "NP 28-28-0"
  },
  {
    productIds: ["dof-ammonium-sulphate"],
    aliases: ["ammonium sulphate", "ammonium sulfate", "20.6-0-0"],
    mrp: "\u20B9550/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "Ammonium sulphate"
  },
  {
    productIds: ["nagarjuna-map", "dof-map"],
    aliases: ["map", "mono ammonium phosphate", "12-61-0"],
    mrp: "\u20B91,600/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "MAP 12-61-0"
  },
  {
    productIds: ["dof-tsp"],
    aliases: ["tsp", "triple super phosphate"],
    mrp: "\u20B9900/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "TSP"
  },
  {
    productIds: ["iffco-nano-urea"],
    aliases: ["nano urea"],
    mrp: "\u20B9225/bottle (500 ml) \u2014 company MRP (typical)",
    packSize: "500 ml",
    isSubsidized: false,
    grade: "Nano urea"
  },
  {
    productIds: ["iffco-nano-dap"],
    aliases: ["nano dap"],
    mrp: "\u20B9600/bottle (500 ml) \u2014 company MRP (typical)",
    packSize: "500 ml",
    isSubsidized: false,
    grade: "Nano DAP"
  },
  {
    productIds: ["iffco-nano-zinc"],
    aliases: ["nano zinc"],
    mrp: "\u20B9200/bottle (100 ml) \u2014 company MRP (typical)",
    packSize: "100 ml",
    isSubsidized: false,
    grade: "Nano zinc"
  },
  {
    productIds: ["coromandel-paramfos"],
    aliases: ["paramfos", "16-20-0-13"],
    mrp: "\u20B91,350/bag (50 kg) \u2014 NBS notified (typical)",
    packSize: "50 kg",
    isSubsidized: true,
    grade: "Paramfos 16-20-0-13"
  },
  {
    productIds: ["nfl-zinc-sulphate", "dof-zinc-sulphate"],
    aliases: ["zinc sulphate", "znso4"],
    mrp: "\u20B990\u2013140/kg \u2014 dealer typical",
    packSize: "1\u201325 kg",
    isSubsidized: false,
    grade: "Zinc sulphate"
  },
  {
    productIds: ["nfl-ferrous-sulphate", "dof-ferrous-sulphate"],
    aliases: ["ferrous sulphate", "feso4"],
    mrp: "\u20B940\u201370/kg \u2014 dealer typical",
    packSize: "1\u201325 kg",
    isSubsidized: false,
    grade: "Ferrous sulphate"
  },
  {
    productIds: ["dof-boron"],
    aliases: ["borax", "boron fertilizer"],
    mrp: "\u20B9180\u2013280/kg \u2014 dealer typical",
    packSize: "1\u20135 kg",
    isSubsidized: false,
    grade: "Boron / Borax"
  },
  {
    productIds: ["nfl-bio-azotobacter", "nfl-bio-psb", "nfl-bio-rhizobium"],
    aliases: ["azotobacter", "bio-fertilizer", "psb", "rhizobium"],
    mrp: "\u20B980\u2013150/pack \u2014 dealer typical",
    packSize: "200 g\u20131 kg",
    isSubsidized: false,
    grade: "Bio-fertilizer"
  },
  {
    productIds: ["dof-compost-city"],
    aliases: ["city compost", "fcom"],
    mrp: "\u20B95\u201312/kg \u2014 municipal / dealer typical",
    packSize: "25\u201350 kg",
    isSubsidized: false,
    grade: "City compost"
  },
  {
    productIds: ["nagarjuna-mkp"],
    aliases: ["mkp", "00-52-34", "mono potassium phosphate"],
    mrp: "\u20B9280\u2013380/kg \u2014 dealer typical",
    packSize: "1\u201325 kg",
    isSubsidized: false,
    grade: "MKP 00-52-34"
  },
  {
    productIds: ["nagarjuna-multi-k"],
    aliases: ["multi-k", "potassium nitrate", "13-0-46"],
    mrp: "\u20B9220\u2013320/kg \u2014 dealer typical",
    packSize: "1\u201325 kg",
    isSubsidized: false,
    grade: "Potassium nitrate"
  },
  {
    productIds: ["deepak-mahadhan-amruta-cn"],
    aliases: ["calcium nitrate", "amruta cn"],
    mrp: "\u20B990\u2013140/kg \u2014 dealer typical",
    packSize: "1\u201325 kg",
    isSubsidized: false,
    grade: "Calcium nitrate"
  },
  {
    productIds: ["deepak-mahadhan-bentonite-s"],
    aliases: ["sulphur bentonite", "bentonite s"],
    mrp: "\u20B945\u201375/kg \u2014 dealer typical",
    packSize: "10\u201350 kg",
    isSubsidized: false,
    grade: "Sulphur bentonite"
  }
];
function resolveOfficialMrp(input) {
  const byId = OFFICIAL_FERTILIZER_MRPS.find((row) => row.productIds.includes(input.id));
  if (byId) return byId;
  const hay = `${input.name} ${input.npk ?? ""}`.toLowerCase();
  const ranked = [...OFFICIAL_FERTILIZER_MRPS].sort(
    (a, b) => Math.max(...b.aliases.map((x) => x.length)) - Math.max(...a.aliases.map((x) => x.length))
  );
  return ranked.find((row) => row.aliases.some((alias) => hay.includes(alias.toLowerCase()))) ?? null;
}

// src/ingestion/data/plantVillageDiseases.ts
var PLANT_VILLAGE_DISEASES = [
  // ── Tomato (high priority for India) ──
  {
    id: "tomato-early-blight",
    name: "Tomato Early Blight",
    nameTe: "\u0C1F\u0C2E\u0C3E\u0C1F Early Blight",
    cropId: "tomato",
    plant: "Tomato",
    plantvillageLabel: "Tomato___Early_blight",
    category: "fungal",
    symptoms: "Dark concentric rings (bullseye) on lower leaves; yellow halo; defoliation from bottom up",
    symptomsTe: "Kinda leaves meeda black rings (bullseye), yellow border, kindi nunchi leaves padutayi",
    treatment: "Mancozeb 75% WP @ 2 g/L or Chlorothalonil 75% WP @ 2 g/L; remove infected leaves; 2\u20133 sprays 10 days apart",
    treatmentTe: "Mancozeb 2 g/L spray; infected leaves teesi padeyandi; 10 rojula gap 2-3 sarlu",
    prevention: "Crop rotation; avoid overhead irrigation; maintain plant spacing; use disease-free seed",
    preventionTe: "Crop rotation; overhead irrigation tagginchandi; spacing penchandi",
    imageClass: "Tomato___Early_blight",
    source: "plantvillage",
    sourceUrl: "https://plantvillage.psu.edu/topics/tomato/early_blight"
  },
  {
    id: "tomato-late-blight",
    name: "Tomato Late Blight",
    nameTe: "\u0C1F\u0C2E\u0C3E\u0C1F Late Blight",
    cropId: "tomato",
    plant: "Tomato",
    plantvillageLabel: "Tomato___Late_blight",
    category: "fungal",
    symptoms: "Water-soaked grey-green lesions on leaves; white mould in humid weather; rapid plant collapse",
    symptomsTe: "Leaves meeda neeti patches, humidity unte white mould, plant fast ga padutundi",
    treatment: "Metalaxyl + Mancozeb @ label dose; destroy severely infected plants; spray before rain if forecast",
    prevention: "Avoid planting near potato late blight fields; use resistant varieties; improve drainage",
    imageClass: "Tomato___Late_blight",
    source: "plantvillage",
    sourceUrl: "https://plantvillage.psu.edu/topics/tomato/late_blight"
  },
  {
    id: "tomato-bacterial-spot",
    name: "Tomato Bacterial Spot",
    cropId: "tomato",
    plant: "Tomato",
    plantvillageLabel: "Tomato___Bacterial_spot",
    category: "bacterial",
    symptoms: "Small dark spots with yellow halos on leaves and fruit; raised scabby fruit lesions",
    treatment: "Copper oxychloride 50% WP @ 3 g/L; Streptocycline seed treatment; avoid working wet plants",
    prevention: "Use certified seed; hot water seed treatment; copper spray at transplant",
    imageClass: "Tomato___Bacterial_spot",
    source: "plantvillage"
  },
  {
    id: "tomato-septoria-leaf-spot",
    name: "Tomato Septoria Leaf Spot",
    cropId: "tomato",
    plant: "Tomato",
    plantvillageLabel: "Tomato___Septoria_leaf_spot",
    category: "fungal",
    symptoms: "Small circular spots with grey centre and dark border on lower leaves",
    treatment: "Mancozeb or Chlorothalonil spray; remove lower infected leaves",
    prevention: "Mulch soil; drip irrigation; 3-year crop rotation",
    imageClass: "Tomato___Septoria_leaf_spot",
    source: "plantvillage"
  },
  {
    id: "tomato-leaf-mold",
    name: "Tomato Leaf Mold",
    cropId: "tomato",
    plant: "Tomato",
    plantvillageLabel: "Tomato___Leaf_Mold",
    category: "fungal",
    symptoms: "Yellow patches on upper leaf surface; olive-green mould on underside in humid conditions",
    treatment: "Improve ventilation in greenhouse; Azoxystrobin or Chlorothalonil spray",
    prevention: "Reduce humidity; resistant varieties in protected cultivation",
    imageClass: "Tomato___Leaf_Mold",
    source: "plantvillage"
  },
  {
    id: "tomato-target-spot",
    name: "Tomato Target Spot",
    cropId: "tomato",
    plant: "Tomato",
    plantvillageLabel: "Tomato___Target_Spot",
    category: "fungal",
    symptoms: "Brown spots with concentric rings on leaves, stems and fruit",
    treatment: "Azoxystrobin + Difenoconazole combination; remove debris",
    prevention: "Field sanitation; avoid dense planting",
    imageClass: "Tomato___Target_Spot",
    source: "plantvillage"
  },
  {
    id: "tomato-yellow-leaf-curl",
    name: "Tomato Yellow Leaf Curl Virus",
    cropId: "tomato",
    plant: "Tomato",
    plantvillageLabel: "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    category: "viral",
    symptoms: "Upward curling of leaves, yellow margins, stunted growth; spread by whitefly",
    treatment: "No cure \u2014 rogue infected plants; control whitefly with Imidacloprid / neem oil",
    prevention: "Use TYLCV-resistant varieties; yellow sticky traps; net houses where feasible",
    imageClass: "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    source: "plantvillage"
  },
  {
    id: "tomato-mosaic-virus",
    name: "Tomato Mosaic Virus",
    cropId: "tomato",
    plant: "Tomato",
    plantvillageLabel: "Tomato___Tomato_mosaic_virus",
    category: "viral",
    symptoms: "Mosaic mottling on leaves, leaf distortion, reduced fruit set",
    treatment: "Remove infected plants; disinfect tools with bleach",
    prevention: "Virus-free seed; avoid tobacco handling before field work",
    imageClass: "Tomato___Tomato_mosaic_virus",
    source: "plantvillage"
  },
  {
    id: "tomato-spider-mites",
    name: "Tomato Spider Mites (Two-spotted)",
    cropId: "tomato",
    plant: "Tomato",
    plantvillageLabel: "Tomato___Spider_mites Two-spotted_spider_mite",
    category: "pest",
    symptoms: "Fine stippling on leaves; webbing under leaves; bronzing and leaf drop in severe cases",
    treatment: "Abamectin 1.9% EC or Spiromesifen; spray underside of leaves; avoid broad-spectrum insecticides",
    prevention: "Monitor in dry hot weather; maintain field hygiene",
    imageClass: "Tomato___Spider_mites Two-spotted_spider_mite",
    source: "plantvillage"
  },
  // ── Potato ──
  {
    id: "potato-early-blight",
    name: "Potato Early Blight",
    cropId: "potato",
    plant: "Potato",
    plantvillageLabel: "Potato___Early_blight",
    category: "fungal",
    symptoms: "Dark lesions with concentric rings on lower leaves; premature defoliation",
    treatment: "Mancozeb 75% WP @ 2.5 g/L at first symptom; repeat every 10 days",
    prevention: "Balanced fertilization; avoid nitrogen excess; crop rotation",
    imageClass: "Potato___Early_blight",
    source: "plantvillage"
  },
  {
    id: "potato-late-blight",
    name: "Potato Late Blight",
    cropId: "potato",
    plant: "Potato",
    plantvillageLabel: "Potato___Late_blight",
    category: "fungal",
    symptoms: "Dark water-soaked lesions; white sporulation on underside; tuber rot in storage",
    treatment: "Metalaxyl + Mancozeb; destroy cull piles; avoid irrigation during cloudy humid weather",
    prevention: "Certified seed tubers; monitor weather-based spray alerts; resistant varieties",
    imageClass: "Potato___Late_blight",
    source: "plantvillage"
  },
  // ── Maize / Corn ──
  {
    id: "maize-common-rust",
    name: "Maize Common Rust",
    cropId: "maize",
    plant: "Corn",
    plantvillageLabel: "Corn_(maize)___Common_rust_",
    category: "fungal",
    symptoms: "Reddish-brown pustules on both leaf surfaces; severe infection causes yield loss",
    treatment: "Propiconazole 25% EC @ 1 ml/L if economic threshold crossed",
    prevention: "Plant resistant hybrids; timely sowing; balanced nutrition",
    imageClass: "Corn_(maize)___Common_rust_",
    source: "plantvillage"
  },
  {
    id: "maize-northern-leaf-blight",
    name: "Maize Northern Leaf Blight",
    cropId: "maize",
    plant: "Corn",
    plantvillageLabel: "Corn_(maize)___Northern_Leaf_Blight",
    category: "fungal",
    symptoms: "Long elliptical grey-green lesions 2.5\u201315 cm on leaves",
    treatment: "Mancozeb or Azoxystrobin spray at tasseling if needed",
    prevention: "Resistant hybrids; crop residue management",
    imageClass: "Corn_(maize)___Northern_Leaf_Blight",
    source: "plantvillage"
  },
  {
    id: "maize-gray-leaf-spot",
    name: "Maize Gray Leaf Spot",
    cropId: "maize",
    plant: "Corn",
    plantvillageLabel: "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    category: "fungal",
    symptoms: "Rectangular grey-tan lesions parallel to leaf veins",
    treatment: "Strobilurin or triazole fungicides at early grain fill",
    prevention: "Rotate with non-host crops; tillage to bury residue",
    imageClass: "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    source: "plantvillage"
  },
  // ── Rice (ICAR-aligned, common in India) ──
  {
    id: "rice-blast",
    name: "Rice Blast (Pyricularia oryzae)",
    nameTe: "\u0C35\u0C30\u0C3F Blast rogam",
    cropId: "rice",
    plant: "Rice",
    plantvillageLabel: "Rice_blast_icar",
    category: "fungal",
    symptoms: "Diamond-shaped lesions on leaves; neck rot turns panicle black and breaks",
    symptomsTe: "Leaves meeda diamond spots; moka nalla ga ayyi virugutundi",
    treatment: "Tricyclazole 75% WP @ 120 g/acre; 2 sprays 10 days apart at panicle initiation",
    treatmentTe: "Tricyclazole 120 g/acre; panicle time lo 10 rojula gap 2 sarlu",
    prevention: "Split nitrogen; avoid excess N; use resistant varieties; seed treatment with Tricyclazole",
    preventionTe: "Nitrogen split cheyandi; ekkuva N vaddu; resistant varieties",
    imageClass: "rice_blast",
    source: "icar",
    sourceUrl: "https://www.icar.org.in/"
  },
  {
    id: "rice-sheath-blight",
    name: "Rice Sheath Blight",
    nameTe: "Sheath Blight",
    cropId: "rice",
    plant: "Rice",
    plantvillageLabel: "Rice_sheath_blight_icar",
    category: "fungal",
    symptoms: "Oval greenish-grey lesions on leaf sheath at water line; sclerotia visible",
    treatment: "Validamycin 3% L @ 500 ml/acre on lower sheath",
    prevention: "Avoid excessive nitrogen; maintain proper plant spacing; drain field periodically",
    imageClass: "rice_sheath_blight",
    source: "icar"
  },
  {
    id: "rice-bph",
    name: "Brown Plant Hopper (BPH)",
    nameTe: "Brown Plant Hopper",
    cropId: "rice",
    plant: "Rice",
    plantvillageLabel: "Rice_BPH_icar",
    category: "pest",
    symptoms: 'Hopper burn \u2014 circular yellow/brown patches; plants dry in patches ("circle of death")',
    treatment: "Imidacloprid 17.8% SL @ 60 ml/acre; alternate with Buprofezin; drain water before spray",
    prevention: "Avoid excess nitrogen; synchronous planting; conserve natural enemies",
    imageClass: "rice_bph",
    source: "icar"
  },
  // ── Cotton ──
  {
    id: "cotton-bollworm",
    name: "Cotton Bollworm (Helicoverpa)",
    nameTe: "Cotton Bollworm",
    cropId: "cotton",
    plant: "Cotton",
    plantvillageLabel: "Cotton_bollworm_icar",
    category: "pest",
    symptoms: "Holes in squares and bolls; frass visible; flower bud shedding",
    treatment: "Emamectin benzoate 5% SG or Spinosad; follow IPM with pheromone traps",
    prevention: "Bt cotton where approved; install 5 pheromone traps/acre; scout weekly",
    imageClass: "cotton_bollworm",
    source: "icar"
  },
  // ── Wheat ──
  {
    id: "wheat-yellow-rust",
    name: "Wheat Yellow Rust (Stripe Rust)",
    nameTe: "\u0C17\u0C4B\u0C27\u0C41\u0C2E Yellow Rust",
    cropId: "wheat",
    plant: "Wheat",
    plantvillageLabel: "Wheat_yellow_rust_icar",
    category: "fungal",
    symptoms: "Bright yellow stripes on leaves; powdery pustules; reduced grain fill",
    treatment: "Propiconazole 25% EC @ 200 ml/acre or Tebuconazole at first sign",
    prevention: "Plant resistant varieties (HD 3086, PBW 725 etc.); timely sowing",
    imageClass: "wheat_yellow_rust",
    source: "icar"
  },
  // ── Pepper / Chilli ──
  {
    id: "pepper-bacterial-spot",
    name: "Pepper Bacterial Spot",
    cropId: "chilli",
    plant: "Pepper",
    plantvillageLabel: "Pepper,_bell___Bacterial_spot",
    category: "bacterial",
    symptoms: "Small water-soaked spots on leaves and fruit turning brown; defoliation in rain",
    treatment: "Copper hydroxide 77% WP @ 2.5 g/L + Streptocycline; avoid overhead irrigation",
    prevention: "Disease-free transplants; crop rotation; copper preventive sprays",
    imageClass: "Pepper,_bell___Bacterial_spot",
    source: "plantvillage"
  },
  // ── Apple, Grape, Citrus (PlantVillage reference) ──
  {
    id: "apple-scab",
    name: "Apple Scab",
    cropId: "apple",
    plant: "Apple",
    plantvillageLabel: "Apple___Apple_scab",
    category: "fungal",
    symptoms: "Olive-green to dark scabby lesions on leaves and fruit",
    treatment: "Captan or Mancozeb spray from green tip stage",
    prevention: "Resistant rootstocks; remove fallen leaves",
    imageClass: "Apple___Apple_scab",
    source: "plantvillage"
  },
  {
    id: "grape-black-rot",
    name: "Grape Black Rot",
    cropId: "grapes",
    plant: "Grape",
    plantvillageLabel: "Grape___Black_rot",
    category: "fungal",
    symptoms: "Circular tan spots on leaves; shrivelled black mummified fruit",
    treatment: "Mancozeb + Carbendazim at bloom and pre-bunch closure",
    prevention: "Remove mummified berries; canopy management for airflow",
    imageClass: "Grape___Black_rot",
    source: "plantvillage"
  },
  {
    id: "citrus-greening",
    name: "Citrus Greening (Huanglongbing)",
    cropId: "citrus",
    plant: "Orange",
    plantvillageLabel: "Orange___Haunglongbing_(Citrus_greening)",
    category: "bacterial",
    symptoms: "Asymmetric yellow mottling; small bitter fruit; twig dieback; spread by psyllid",
    treatment: "No cure \u2014 remove infected trees; control Asian citrus psyllid with systemic insecticides",
    prevention: "Use certified disease-free nursery plants; psyllid monitoring",
    imageClass: "Orange___Haunglongbing_(Citrus_greening)",
    source: "plantvillage"
  },
  // ── Squash, Strawberry, Peach ──
  {
    id: "squash-powdery-mildew",
    name: "Squash Powdery Mildew",
    cropId: "vegetables",
    plant: "Squash",
    plantvillageLabel: "Squash___Powdery_mildew",
    category: "fungal",
    symptoms: "White powdery patches on leaves and stems",
    treatment: "Sulphur 80% WP @ 2 g/L or Hexaconazole @ 1 ml/L",
    prevention: "Resistant varieties; avoid shade and overcrowding",
    imageClass: "Squash___Powdery_mildew",
    source: "plantvillage"
  },
  {
    id: "strawberry-leaf-scorch",
    name: "Strawberry Leaf Scorch",
    cropId: "strawberry",
    plant: "Strawberry",
    plantvillageLabel: "Strawberry___Leaf_scorch",
    category: "fungal",
    symptoms: "Small purple spots enlarging with dark centres; leaves appear scorched",
    treatment: "Remove infected leaves; Captan or Azoxystrobin spray",
    prevention: "Certified runners; avoid overhead irrigation",
    imageClass: "Strawberry___Leaf_scorch",
    source: "plantvillage"
  },
  {
    id: "peach-bacterial-spot",
    name: "Peach Bacterial Spot",
    cropId: "peach",
    plant: "Peach",
    plantvillageLabel: "Peach___Bacterial_spot",
    category: "bacterial",
    symptoms: "Purple-black spots on leaves; fruit cracking and pitting",
    treatment: "Copper sprays at dormant and shuck-split stages",
    prevention: "Resistant cultivars; avoid susceptible rootstocks in humid areas",
    imageClass: "Peach___Bacterial_spot",
    source: "plantvillage"
  },
  {
    id: "cherry-powdery-mildew",
    name: "Cherry Powdery Mildew",
    cropId: "cherry",
    plant: "Cherry",
    plantvillageLabel: "Cherry_(including_sour)___Powdery_mildew",
    category: "fungal",
    symptoms: "White fungal growth on leaves and shoots; leaf curling",
    treatment: "Sulphur or Myclobutanil spray at petal fall",
    prevention: "Prune for airflow; avoid excess nitrogen",
    imageClass: "Cherry_(including_sour)___Powdery_mildew",
    source: "plantvillage"
  },
  {
    id: "grape-leaf-blight",
    name: "Grape Leaf Blight (Isariopsis)",
    cropId: "grapes",
    plant: "Grape",
    plantvillageLabel: "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    category: "fungal",
    symptoms: "Dark angular spots on leaves; premature defoliation",
    treatment: "Mancozeb spray; remove infected leaves",
    prevention: "Canopy thinning; field sanitation",
    imageClass: "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    source: "plantvillage"
  },
  {
    id: "apple-black-rot",
    name: "Apple Black Rot",
    cropId: "apple",
    plant: "Apple",
    plantvillageLabel: "Apple___Black_rot",
    category: "fungal",
    symptoms: "Purple spots on leaves; frogeye leaf spots; fruit rot with concentric rings",
    treatment: "Captan + Mancozeb from pre-bloom through cover sprays",
    prevention: "Remove mummified fruit; prune dead wood",
    imageClass: "Apple___Black_rot",
    source: "plantvillage"
  },
  {
    id: "apple-cedar-rust",
    name: "Apple Cedar Apple Rust",
    cropId: "apple",
    plant: "Apple",
    plantvillageLabel: "Apple___Cedar_apple_rust",
    category: "fungal",
    symptoms: "Yellow-orange spots on leaves; cup-shaped structures on underside",
    treatment: "Myclobutanil at pink bud; remove nearby juniper hosts if possible",
    prevention: "Plant resistant apple varieties away from cedar/juniper",
    imageClass: "Apple___Cedar_apple_rust",
    source: "plantvillage"
  },
  {
    id: "grape-esca",
    name: "Grape Esca (Black Measles)",
    cropId: "grapes",
    plant: "Grape",
    plantvillageLabel: "Grape___Esca_(Black_Measles)",
    category: "fungal",
    symptoms: "Tiger-stripe leaf patterns; berry speckling; vine decline over years",
    treatment: "No single cure \u2014 trunk surgery in older vines; fungicide wound paste",
    prevention: "Use certified nursery stock; avoid large pruning wounds",
    imageClass: "Grape___Esca_(Black_Measles)",
    source: "plantvillage"
  },
  {
    id: "soybean-healthy-reference",
    name: "Soybean \u2014 Healthy Leaf (reference)",
    cropId: "soybean",
    plant: "Soybean",
    plantvillageLabel: "Soybean___healthy",
    category: "healthy",
    symptoms: "Uniform green trifoliate leaves without spots or distortion",
    treatment: "No treatment needed \u2014 use as comparison baseline for AI image diagnosis",
    prevention: "Balanced nutrition and IPM to maintain plant health",
    imageClass: "Soybean___healthy",
    source: "plantvillage",
    sourceUrl: "https://plantvillage.psu.edu/"
  }
];

// src/ingestion/data/soilHealthRecommendations.ts
var SOIL_HEALTH_RECOMMENDATIONS = [
  {
    id: "shc-black-cotton-low-n",
    soilType: "black_cotton",
    nutrientStatus: "low",
    deficiency: "Nitrogen",
    fertilizerRecommendation: "Neem-coated urea in 3 splits; combine with FYM 5 t/acre",
    dosage: "Urea 45\u201355 kg/acre total N equivalent",
    crops: ["cotton", "soybean", "chickpea"],
    season: "kharif",
    description: "Black cotton soils often need split N due to cracking and leaching risk during monsoon.",
    source: "soil_health_card",
    sourceUrl: "https://soilhealth.dac.gov.in/"
  },
  {
    id: "shc-black-cotton-low-zn",
    soilType: "black_cotton",
    nutrientStatus: "deficient",
    deficiency: "Zinc",
    fertilizerRecommendation: "Zinc sulphate 21% soil application or 0.5% foliar spray",
    dosage: "10\u201325 kg/acre soil OR 2 sprays @ 0.5% at tillering/flowering",
    crops: ["rice", "maize", "cotton", "wheat"],
    season: "year-round",
    description: "Very common deficiency on calcareous black soils; SHC test every 3 years.",
    source: "soil_health_card"
  },
  {
    id: "shc-red-low-p",
    soilType: "red",
    nutrientStatus: "low",
    deficiency: "Phosphorus",
    fertilizerRecommendation: "DAP or SSP as basal; do not skip P even if N is applied",
    dosage: "DAP 50\u201365 kg/acre OR SSP 100\u2013125 kg/acre",
    crops: ["groundnut", "redgram", "ragi", "maize"],
    season: "kharif",
    description: "Red soils in Deccan plateau are typically P-deficient; fix P at sowing.",
    source: "soil_health_card"
  },
  {
    id: "shc-red-low-k",
    soilType: "red",
    nutrientStatus: "low",
    deficiency: "Potassium",
    fertilizerRecommendation: "MOP (Muriate of Potash) at basal or before flowering",
    dosage: "MOP 20\u201340 kg/acre",
    crops: ["cotton", "chilli", "tomato", "banana"],
    season: "kharif",
    source: "soil_health_card"
  },
  {
    id: "shc-alluvial-balanced",
    soilType: "alluvial",
    nutrientStatus: "medium",
    deficiency: "Balanced NPK",
    fertilizerRecommendation: "NPK complex 15:15:15 or crop-specific grade based on SHC",
    dosage: "80\u2013100 kg/acre complex + urea top dress as needed",
    crops: ["rice", "wheat", "sugarcane", "vegetables"],
    season: "year-round",
    description: "Alluvial soils vary \u2014 always follow SHC for exact NPK adjustment.",
    source: "soil_health_card"
  },
  {
    id: "shc-alluvial-low-s",
    soilType: "alluvial",
    nutrientStatus: "deficient",
    deficiency: "Sulphur",
    fertilizerRecommendation: "NP(S) 20:20:0:13 or Ammonium sulphate instead of straight urea",
    dosage: "100\u2013150 kg/acre NP(S) grade",
    crops: ["mustard", "groundnut", "onion", "garlic", "wheat"],
    season: "rabi",
    description: "Sulphur deficiency increasing due to low-S fertilizers; use sulphur-containing grades.",
    source: "icar"
  },
  {
    id: "shc-sandy-low-organic",
    soilType: "sandy",
    nutrientStatus: "low",
    deficiency: "Organic carbon",
    fertilizerRecommendation: "FYM 5\u201310 t/acre + green manure; increase fertilizer dose 20% vs normal",
    dosage: "FYM 5 t/acre minimum before each crop",
    crops: ["groundnut", "bajra", "watermelon", "vegetables"],
    season: "year-round",
    description: "Sandy soils have low water and nutrient holding \u2014 organic matter is critical.",
    source: "soil_health_card"
  },
  {
    id: "shc-sandy-low-b",
    soilType: "sandy",
    nutrientStatus: "deficient",
    deficiency: "Boron",
    fertilizerRecommendation: "Borax soil application or 0.1% foliar at flowering",
    dosage: "2\u20135 kg borax/acre soil OR 2 foliar sprays",
    crops: ["groundnut", "cotton", "chilli", "grapes"],
    season: "kharif",
    description: "Boron deficiency causes hollow stem in groundnut and fruit drop in cotton.",
    source: "soil_health_card"
  },
  {
    id: "shc-laterite-low-ca",
    soilType: "laterite",
    nutrientStatus: "low",
    deficiency: "Calcium / Lime",
    fertilizerRecommendation: "Apply lime or gypsum based on pH; SSP for P and Ca",
    dosage: "Gypsum 400 kg/acre for groundnut; lime 500 kg/acre if pH < 5.5",
    crops: ["groundnut", "pineapple", "cashew"],
    season: "kharif",
    source: "icar"
  },
  {
    id: "shc-alkaline-low-fe",
    soilType: "alkaline",
    nutrientStatus: "deficient",
    deficiency: "Iron",
    fertilizerRecommendation: "Ferrous sulphate 0.5% foliar spray on chlorotic leaves",
    dosage: "2\u20133 sprays at 15-day interval; 0.5% solution",
    crops: ["rice", "sugarcane", "citrus", "vegetables"],
    season: "year-round",
    description: "Iron chlorosis common on calcareous alkaline soils; foliar faster than soil.",
    source: "soil_health_card"
  },
  {
    id: "shc-alkaline-high-ph",
    soilType: "alkaline",
    nutrientStatus: "high",
    deficiency: "High pH (>8.0)",
    fertilizerRecommendation: "Gypsum 500 kg/acre; use ammonium sulphate; avoid excess sodium fertilizers",
    dosage: "Gypsum 500 kg/acre once in 2 years",
    crops: ["wheat", "barley", "mustard"],
    season: "rabi",
    source: "soil_health_card"
  },
  {
    id: "shc-saline-management",
    soilType: "saline",
    nutrientStatus: "high",
    deficiency: "Salinity / EC",
    fertilizerRecommendation: "Leach salts with good quality irrigation; use potassium-rich fertilizers; avoid chloride sources",
    dosage: "MOP replace with SOP on chloride-sensitive crops",
    crops: ["rice", "wheat", "cotton"],
    description: "Improve drainage; gypsum on sodic-saline soils; SHC EC reading guides amendments.",
    source: "soil_health_card",
    sourceUrl: "https://soilhealth.dac.gov.in/"
  },
  {
    id: "shc-low-organic-all",
    soilType: "all",
    nutrientStatus: "low",
    deficiency: "Organic carbon (<0.4%)",
    fertilizerRecommendation: "FYM + crop residue retention + green manuring; reduce chemical N by 25% gradually",
    dosage: "FYM 5 t/acre + dhaincha green manure before rice",
    crops: ["rice", "wheat", "cotton", "vegetables"],
    season: "year-round",
    source: "icar"
  },
  {
    id: "shc-rice-zn-shc",
    soilType: "alluvial",
    nutrientStatus: "deficient",
    deficiency: "Zinc (rice khaira)",
    fertilizerRecommendation: "Zinc sulphate 25 kg/ha at transplant OR foliar 0.5% at tillering",
    dosage: "25 kg ZnSO4/ha or 2 foliar sprays",
    crops: ["rice"],
    season: "kharif",
    description: "Standard SHC recommendation for rice on zinc-deficient alluvial tracts.",
    source: "soil_health_card"
  }
];

// src/ingestion/sources/indianAgCatalogSource.ts
function cropLabel(crops2) {
  return crops2.slice(0, 4).join(", ");
}
function fertilizerDescription(item) {
  const parts = [item.benefits, item.applicationMethod].filter(Boolean);
  return parts.join(" \u2014 ");
}
async function syncIndianFertilizerCatalog() {
  const now = /* @__PURE__ */ new Date();
  let officialPricesApplied = 0;
  for (const item of INDIAN_FERTILIZER_CATALOG) {
    const official = resolveOfficialMrp({
      id: item.id,
      name: item.name,
      npk: item.npk
    });
    if (official) officialPricesApplied += 1;
    const mrp = official?.mrp ?? item.mrp ?? null;
    const price = official?.mrp ?? item.price ?? item.mrp ?? null;
    const packSize = official?.packSize ?? item.packSize ?? null;
    const isSubsidized = official?.isSubsidized ?? item.isSubsidized ?? true;
    const sourceUrl = mergeManufacturerSourceUrl(item.id, item.sourceUrl) ?? null;
    const image = await resolveProductImageUrlAsync({
      id: item.id,
      image: item.image,
      type: "fertilizer",
      category: item.category,
      sourceUrl
    });
    const metadata = {
      ...item.metadata ?? {},
      priceSource: official ? FERTILIZER_PRICE_SOURCE.id : "brand_catalog",
      priceSourceLabel: official ? FERTILIZER_PRICE_SOURCE.label : "Brand / catalog reference",
      priceVerifiedAt: official ? FERTILIZER_PRICE_VERIFIED_AT : null,
      priceNote: official ? FERTILIZER_PRICE_SOURCE.note : null,
      officialGrade: official?.grade ?? null,
      whenToUse: item.application,
      urvarakUrl: FERTILIZER_PRICE_SOURCE.urvarakUrl
    };
    await db.insert(fertilizerProducts).values({
      id: item.id,
      name: item.name,
      nameTe: item.nameTe ?? null,
      brand: item.brand,
      category: item.category,
      type: item.category,
      npk: item.npk ?? null,
      npkRatio: item.npk ?? null,
      nutrient: item.nutrient ?? null,
      dosage: item.dosage ?? null,
      crop: cropLabel(item.crops),
      benefits: item.benefits ?? null,
      description: fertilizerDescription(item),
      crops: item.crops,
      soilType: item.soilType ?? [],
      seasons: item.seasons,
      application: item.application,
      applicationMethod: item.applicationMethod ?? null,
      precautions: item.precautions ?? null,
      mrp,
      price,
      packSize,
      image: image ?? item.image ?? null,
      source: item.source,
      sourceUrl,
      isSubsidized,
      metadata,
      lastSyncedAt: now,
      updatedAt: now
    }).onConflictDoUpdate({
      target: fertilizerProducts.id,
      set: {
        name: item.name,
        nameTe: item.nameTe ?? null,
        brand: item.brand,
        category: item.category,
        type: item.category,
        npk: item.npk ?? null,
        npkRatio: item.npk ?? null,
        nutrient: item.nutrient ?? null,
        dosage: item.dosage ?? null,
        crop: cropLabel(item.crops),
        benefits: item.benefits ?? null,
        description: fertilizerDescription(item),
        crops: item.crops,
        soilType: item.soilType ?? [],
        seasons: item.seasons,
        application: item.application,
        applicationMethod: item.applicationMethod ?? null,
        precautions: item.precautions ?? null,
        mrp,
        price,
        packSize,
        image: image ?? item.image ?? null,
        source: item.source,
        sourceUrl,
        isSubsidized,
        metadata,
        lastSyncedAt: now,
        updatedAt: now
      }
    });
  }
  const [{ count: count2 }] = await db.select({ count: import_drizzle_orm3.sql`count(*)::int` }).from(fertilizerProducts);
  return {
    fetched: INDIAN_FERTILIZER_CATALOG.length,
    upserted: count2 ?? 0,
    officialPricesApplied,
    priceVerifiedAt: FERTILIZER_PRICE_VERIFIED_AT
  };
}
async function syncPlantDiseases() {
  const now = /* @__PURE__ */ new Date();
  for (const d of PLANT_VILLAGE_DISEASES) {
    await db.insert(plantDiseases).values({
      id: d.id,
      name: d.name,
      nameTe: d.nameTe ?? null,
      cropId: d.cropId,
      plant: d.plant,
      plantvillageLabel: d.plantvillageLabel,
      category: d.category,
      symptoms: d.symptoms ?? null,
      symptomsTe: d.symptomsTe ?? null,
      treatment: d.treatment ?? null,
      treatmentTe: d.treatmentTe ?? null,
      prevention: d.prevention ?? null,
      preventionTe: d.preventionTe ?? null,
      imageClass: d.imageClass,
      hasDatasetImages: d.category === "healthy" ? "yes" : "yes",
      source: d.source,
      sourceUrl: d.sourceUrl ?? null,
      lastSyncedAt: now,
      updatedAt: now
    }).onConflictDoUpdate({
      target: plantDiseases.id,
      set: {
        name: d.name,
        nameTe: d.nameTe ?? null,
        cropId: d.cropId,
        plant: d.plant,
        plantvillageLabel: d.plantvillageLabel,
        category: d.category,
        symptoms: d.symptoms ?? null,
        symptomsTe: d.symptomsTe ?? null,
        treatment: d.treatment ?? null,
        treatmentTe: d.treatmentTe ?? null,
        prevention: d.prevention ?? null,
        preventionTe: d.preventionTe ?? null,
        imageClass: d.imageClass,
        source: d.source,
        sourceUrl: d.sourceUrl ?? null,
        lastSyncedAt: now,
        updatedAt: now
      }
    });
    if (d.category !== "healthy") {
      const legacyId = d.id;
      const [cropExists] = await db.select({ id: crops.id }).from(crops).where((0, import_drizzle_orm3.eq)(crops.id, d.cropId)).limit(1);
      if (cropExists) {
        await db.insert(diseases).values({
          id: legacyId,
          cropId: d.cropId,
          name: d.name,
          nameTe: d.nameTe ?? null,
          symptoms: d.symptoms ?? null,
          symptomsTe: d.symptomsTe ?? null
        }).onConflictDoUpdate({
          target: diseases.id,
          set: {
            name: d.name,
            nameTe: d.nameTe ?? null,
            symptoms: d.symptoms ?? null,
            symptomsTe: d.symptomsTe ?? null
          }
        });
        if (d.treatment) {
          await db.delete(diseaseSprays).where((0, import_drizzle_orm3.eq)(diseaseSprays.diseaseId, legacyId));
          await db.insert(diseaseSprays).values({
            diseaseId: legacyId,
            productName: d.treatment.slice(0, 160),
            type: d.category === "pest" ? "insecticide" : d.category === "bacterial" ? "bio" : "fungicide",
            target: d.name,
            dose: "As per label / extension recommendation",
            howToSpray: d.treatment,
            precautions: d.prevention ? [d.prevention] : []
          });
        }
      }
    }
  }
  const [{ count: count2 }] = await db.select({ count: import_drizzle_orm3.sql`count(*)::int` }).from(plantDiseases);
  return { fetched: PLANT_VILLAGE_DISEASES.length, upserted: count2 ?? 0 };
}
async function syncIcarGuidelines() {
  const now = /* @__PURE__ */ new Date();
  for (const g of ICAR_GUIDELINES) {
    await db.insert(icarGuidelines).values({
      id: g.id,
      category: g.category,
      cropId: g.cropId ?? null,
      title: g.title,
      titleTe: g.titleTe ?? null,
      content: g.content,
      season: g.season ?? null,
      region: g.region ?? "India",
      sourceUrl: g.sourceUrl ?? "https://www.icar.org.in/",
      tags: g.tags ?? [],
      lastSyncedAt: now,
      updatedAt: now
    }).onConflictDoUpdate({
      target: icarGuidelines.id,
      set: {
        category: g.category,
        cropId: g.cropId ?? null,
        title: g.title,
        titleTe: g.titleTe ?? null,
        content: g.content,
        season: g.season ?? null,
        region: g.region ?? "India",
        sourceUrl: g.sourceUrl ?? "https://www.icar.org.in/",
        tags: g.tags ?? [],
        lastSyncedAt: now,
        updatedAt: now
      }
    });
  }
  const [{ count: count2 }] = await db.select({ count: import_drizzle_orm3.sql`count(*)::int` }).from(icarGuidelines);
  return { fetched: ICAR_GUIDELINES.length, upserted: count2 ?? 0 };
}
async function syncDoaAdvisories() {
  const now = /* @__PURE__ */ new Date();
  for (const a of DOA_ADVISORIES) {
    await db.insert(agAdvisories).values({
      id: a.id,
      type: a.type,
      title: a.title,
      titleTe: a.titleTe ?? null,
      description: a.description,
      state: a.state ?? "All India",
      season: a.season ?? null,
      cropTags: a.cropTags ?? [],
      source: a.source,
      sourceUrl: a.sourceUrl ?? null,
      lastSyncedAt: now,
      updatedAt: now
    }).onConflictDoUpdate({
      target: agAdvisories.id,
      set: {
        type: a.type,
        title: a.title,
        titleTe: a.titleTe ?? null,
        description: a.description,
        state: a.state ?? "All India",
        season: a.season ?? null,
        cropTags: a.cropTags ?? [],
        source: a.source,
        sourceUrl: a.sourceUrl ?? null,
        lastSyncedAt: now,
        updatedAt: now
      }
    });
  }
  const [{ count: count2 }] = await db.select({ count: import_drizzle_orm3.sql`count(*)::int` }).from(agAdvisories);
  return { fetched: DOA_ADVISORIES.length, upserted: count2 ?? 0 };
}
async function syncSoilHealthRecommendations() {
  const now = /* @__PURE__ */ new Date();
  for (const s of SOIL_HEALTH_RECOMMENDATIONS) {
    await db.insert(soilHealthRecommendations).values({
      id: s.id,
      soilType: s.soilType,
      nutrientStatus: s.nutrientStatus,
      deficiency: s.deficiency,
      fertilizerRecommendation: s.fertilizerRecommendation,
      dosage: s.dosage ?? null,
      crops: s.crops ?? [],
      season: s.season ?? null,
      description: s.description ?? null,
      source: s.source ?? "soil_health_card",
      sourceUrl: s.sourceUrl ?? "https://soilhealth.dac.gov.in/",
      lastSyncedAt: now,
      updatedAt: now
    }).onConflictDoUpdate({
      target: soilHealthRecommendations.id,
      set: {
        soilType: s.soilType,
        nutrientStatus: s.nutrientStatus,
        deficiency: s.deficiency,
        fertilizerRecommendation: s.fertilizerRecommendation,
        dosage: s.dosage ?? null,
        crops: s.crops ?? [],
        season: s.season ?? null,
        description: s.description ?? null,
        source: s.source ?? "soil_health_card",
        sourceUrl: s.sourceUrl ?? "https://soilhealth.dac.gov.in/",
        lastSyncedAt: now,
        updatedAt: now
      }
    });
  }
  const [{ count: count2 }] = await db.select({ count: import_drizzle_orm3.sql`count(*)::int` }).from(soilHealthRecommendations);
  return { fetched: SOIL_HEALTH_RECOMMENDATIONS.length, upserted: count2 ?? 0 };
}
async function syncIndianAgCatalog() {
  const [fertilizers2, plantDiseaseRows, icar, doa, soilHealth] = await Promise.all([
    syncIndianFertilizerCatalog(),
    syncPlantDiseases(),
    syncIcarGuidelines(),
    syncDoaAdvisories(),
    syncSoilHealthRecommendations()
  ]);
  return {
    fertilizers: fertilizers2,
    plant_diseases: plantDiseaseRows,
    icar_guidelines: icar,
    ag_advisories: doa,
    soil_health: soilHealth
  };
}

// src/ingestion/sources/publicationKnowledgeSource.ts
var import_drizzle_orm4 = require("drizzle-orm");
init_db();
init_schema();

// src/ingestion/data/angrauPublications.ts
var ANGRAU_PUBLICATIONS = [
  {
    id: "angrau-rice-bpt-varieties",
    source: "angrau",
    type: "guide",
    title: "ANGRAU Recommended rice varieties for Andhra Pradesh",
    titleTe: "ANGRAU \u2014 AP ki vari varieties",
    summary: "High-yielding and disease-resistant rice varieties for AP kharif and rabi \u2014 BPT, Swarna, RNR zones.",
    content: `Kharif (Coastal AP): BPT 5204, Swarna, RNR 15048, DRR Dhan 50 \u2014 check local AAO recommendation.
Kharif (Rayalaseema): RNR 15048, MTU 1010, NLR 34449 \u2014 short duration for tank irrigation.
Rabi (Nellore/Krishna): BPT 5204, MTU 1061 \u2014 sow Dec\u2013Jan with assured irrigation.
Blast-prone areas: Prefer RNR 15048, DRR Dhan 50 (moderate resistance).
Seed rate: 40 kg/acre for transplanted; treat with Carbendazim 2 g/kg + Imidacloprid 70 WS 5 g/kg for BPH.`,
    cropTags: ["rice"],
    tags: ["varieties", "AP", "seed"],
    season: "kharif",
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Extension Education",
    documentType: "publication",
    url: "https://angrau.ac.in/",
    publishedYear: 2024
  },
  {
    id: "angrau-cotton-ap-ipm",
    source: "angrau",
    type: "pest",
    title: "ANGRAU Cotton IPM for Guntur, Prakasam, Kurnool districts",
    summary: "District-specific cotton pest calendar \u2014 pink bollworm, spotted bollworm, whitefly in AP cotton belt.",
    content: `Sowing window: June 15 \u2013 July 15 (avoid late sowing for pink bollworm).
Pre-sowing: Deep summer plough; destroy previous crop residue.
60\u201390 DAS: Peak bollworm \u2014 pheromone traps 5/acre; ETL 2 egg masses/100 plants.
Whitefly (Oct\u2013Nov): Yellow sticky traps; avoid repeated Monocrotophos \u2014 use Diafenthiuron 50% WP 240 g/acre.
Pink bollworm: Install PBW pheromone traps 5/acre from 90 DAS; spray Flubendiamide 20% WG 80 g/acre at ETL.
Contact: Local ANGRAU KVK or ADA office for weekly pest scouting bulletins.`,
    cropTags: ["cotton"],
    tags: ["IPM", "pink-bollworm", "Guntur", "AP"],
    season: "kharif",
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Entomology",
    documentType: "bulletin",
    url: "https://angrau.ac.in/",
    publishedYear: 2023
  },
  {
    id: "angrau-chilli-thrips",
    source: "angrau",
    type: "pest",
    title: "ANGRAU Chilli thrips and leaf curl management \u2014 Guntur belt",
    summary: "Thrips Scirtothrips dorsalis control, virus vector management, nursery and field spray schedule for AP chilli.",
    content: `Thrips: Silvery streaks on leaves, flower drop. Blue sticky traps 15/acre for monitoring.
ETL: 5 thrips/leaf. Spray Fipronil 5% SC 400 ml/acre OR Spinosad 45% SC 150 ml/acre.
Leaf curl virus: Rogue infected plants; control whitefly vector \u2014 Imidacloprid 17.8% SL 60 ml/acre.
Nursery (Kadiri/Guntur): Raise on raised beds; mulching; avoid mixed age seedlings.
Harvest: Follow PHI \u2014 7 days after last spray before picking.`,
    cropTags: ["chilli"],
    tags: ["thrips", "leaf-curl", "Guntur", "AP"],
    season: "year-round",
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Horticulture",
    documentType: "bulletin",
    url: "https://angrau.ac.in/",
    publishedYear: 2024
  },
  {
    id: "angrau-groundnut-tikka",
    source: "angrau",
    type: "disease",
    title: "ANGRAU Groundnut tikka (early & late leaf spot) \u2014 Anantapur, Kurnool",
    summary: "Tikka disease identification, Mancozeb + Carbendazim spray schedule, gypsum timing for AP groundnut.",
    content: `Early leaf spot: Brown spots with yellow halo. Late leaf spot: Dark brown, no halo.
Spray: Mancozeb 75% WP 2 g/L + Carbendazim 50% WP 1 g/L at 15-day interval from 30 DAS (2\u20133 sprays).
Gypsum: 400 kg/ha at peg formation \u2014 critical in Anantapur red soils.
Varieties: Kadiri-6, Dharani, Kadiri-9 for AP rainfed tracts.
Rotation: Avoid groundnut on same field >2 consecutive years.`,
    cropTags: ["groundnut"],
    tags: ["tikka", "leaf-spot", "Anantapur", "AP"],
    season: "kharif",
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Plant Pathology",
    documentType: "bulletin",
    url: "https://angrau.ac.in/",
    publishedYear: 2023
  },
  {
    id: "angrau-maize-rabi-hybrids",
    source: "angrau",
    type: "guide",
    title: "ANGRAU Rabi maize production \u2014 Krishna, West Godavari",
    summary: "Rabi maize hybrids, irrigation schedule, FAW vigilance for AP delta districts.",
    content: `Hybrids: DHM 117, NK 6240, PAC 751 (check local availability).
Sowing: Oct\u2013Nov with assured irrigation; 60\xD720 cm spacing.
Fertilizer: DAP 50 kg + Urea 100 kg/acre (3 splits for N).
FAW: Scout from 15 DAS; whorl spray Emamectin benzoate at ETL.
Water: Critical at knee-high, tasseling, and grain filling stages.`,
    cropTags: ["maize"],
    tags: ["rabi", "hybrids", "Krishna", "AP"],
    season: "rabi",
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Agronomy",
    documentType: "package_of_practices",
    url: "https://angrau.ac.in/",
    publishedYear: 2023
  },
  {
    id: "angrau-mango-anthracnose",
    source: "angrau",
    type: "disease",
    title: "ANGRAU Mango anthracnose and powdery mildew \u2014 Krishna district",
    summary: "Mango flowering spray schedule for anthracnose and powdery mildew in AP mango belt.",
    content: `Anthracnose: Black spots on panicles and young fruits. Spray Copper oxychloride 3 g/L at panicle emergence.
Powdery mildew: White powder on panicles. Wettable sulphur 3 g/L OR Hexaconazole 5% EC 2 ml/L at 10-day interval.
Timing: First spray at 25% flower opening; repeat after 10\u201312 days if humid.
Fruit fly: Methyl eugenol traps 5/acre + bagging of fruits in high-value orchards.
Post-harvest: Hot water treatment 52\xB0C for 5 min for export quality.`,
    cropTags: ["mango"],
    tags: ["anthracnose", "powdery-mildew", "Krishna", "AP"],
    season: "year-round",
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Horticulture",
    documentType: "bulletin",
    url: "https://angrau.ac.in/",
    publishedYear: 2024
  },
  {
    id: "angrau-sugarcane-redrot-ap",
    source: "angrau",
    type: "disease",
    title: "ANGRAU Sugarcane red rot alert \u2014 East Godavari, West Godavari",
    summary: "Red rot resistant varieties and sett treatment for AP sugarcane growing districts.",
    content: `Resistant varieties: Co 86032, CoC 671 (check factory area recommendation).
Sett treatment: Carbendazim 0.1% dip 15 min + avoid setts from diseased fields.
Symptoms: Reddish internal tissues, sour smell \u2014 rogue and burn immediately.
Ratoon: Avoid >2 ratoon crops in red rot affected fields; plough out and rotate with pulses.`,
    cropTags: ["sugarcane"],
    tags: ["red-rot", "East-Godavari", "AP"],
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Crop Science",
    documentType: "advisory",
    url: "https://angrau.ac.in/",
    publishedYear: 2023
  },
  {
    id: "angrau-drip-fertigation",
    source: "angrau",
    type: "fertilizer",
    title: "ANGRAU Drip fertigation guide \u2014 chilli, tomato, cotton (AP)",
    summary: "Fertigation schedule through drip for horticulture and cotton in water-scarce AP districts.",
    content: `System: 4 LPH drippers, 1 dripper/plant (chilli/tomato) or 2 drippers/cotton plant.
NPK 19:19:19: 2\u20133 kg/acre/week from transplant/square formation to peak flowering.
EC target: 1.5\u20132.0 dS/m; flush lines weekly to prevent clogging.
Reduce nitrogen 30% after first harvest (chilli/tomato) to improve fruit quality.
Micronutrients: 0.5% chelated micronutrient mix monthly through drip.`,
    cropTags: ["chilli", "tomato", "cotton"],
    tags: ["drip", "fertigation", "water-saving", "AP"],
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Soil Science",
    documentType: "package_of_practices",
    url: "https://angrau.ac.in/",
    publishedYear: 2024
  },
  {
    id: "angrau-tobacco-nursery",
    source: "angrau",
    type: "guide",
    title: "ANGRAU Flue-cured tobacco \u2014 nursery and field production (Prakasam, Ongole)",
    summary: "AP tobacco belt nursery management, black shank, hornworm, aphid control.",
    content: `Nursery: Sterilized soil + raised beds; 400 m\xB2 nursery/acre field.
Transplant: 60\xD760 cm spacing; 6000 plants/acre.
Black shank: Use resistant varieties; Metalaxyl seedling drench 0.1%.
Hornworm: Hand pick small larvae; Spinosad 150 ml/acre at ETL.
Aphids/mosaic: Rogue infected plants; Imidacloprid 60 ml/acre at early vegetative.
Curing: Follow Tobacco Board grade standards for barn curing.`,
    cropTags: ["tobacco"],
    tags: ["black-shank", "hornworm", "Prakasam", "AP"],
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Tobacco Research",
    documentType: "package_of_practices",
    url: "https://angrau.ac.in/",
    publishedYear: 2023
  },
  {
    id: "angrau-rice-bph-coastal",
    source: "angrau",
    type: "pest",
    title: "ANGRAU Rice BPH outbreak alert \u2014 Krishna, Godavari delta",
    summary: "Brown planthopper hopper burn prevention in high-rice-intensity AP coastal districts.",
    content: `Symptoms: Hopper burn \u2014 circular yellow patches; BPH at base of tillers.
Avoid: Excess urea after tillering; dense planting.
Monitoring: Sweep net 5 hills/sample; ETL 5 BPH/tiller.
Drain field briefly if safe; spray Buprofezin 200 ml/acre OR Pymetrozine 150 g/acre.
Do not use broad pyrethroids \u2014 kills predators and triggers resurgence.`,
    cropTags: ["rice"],
    tags: ["BPH", "hopper-burn", "Krishna", "AP"],
    season: "kharif",
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Entomology",
    documentType: "advisory",
    url: "https://angrau.ac.in/",
    publishedYear: 2024
  },
  {
    id: "angrau-turmeric-e-godavari",
    source: "angrau",
    type: "guide",
    title: "ANGRAU Turmeric cultivation \u2014 East Godavari, Vizianagaram spice belt",
    summary: "Turmeric varieties, rhizome treatment, leaf spot and rhizome rot for AP farmers.",
    content: `Varieties: Pragati, Suguna, Roma for AP; sow May\u2013June with pre-monsoon rain.
Rhizome treat: Mancozeb 0.3% + Quinalphos dip before planting.
Fertilizer: FYM 10 t/acre + NPK 80:40:60 kg/acre.
Rhizome rot: Drench Metalaxyl-Mancozeb if waterlogging; raised bed mandatory.
Harvest: 8\u20139 months; boil and dry to 8\u201310% moisture for bright colour.`,
    cropTags: ["turmeric"],
    tags: ["spice", "rhizome-rot", "East-Godavari", "AP"],
    season: "kharif",
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Horticulture",
    documentType: "package_of_practices",
    url: "https://angrau.ac.in/",
    publishedYear: 2023
  },
  {
    id: "angrau-coconut-root-wilt",
    source: "angrau",
    type: "disease",
    title: "ANGRAU Coconut root wilt and rhinoceros beetle \u2014 coastal AP",
    summary: "Root wilt management, neem cake, beetle hook trapping in East/West Godavari coconut gardens.",
    content: `Root wilt: No cure \u2014 remove and replant with disease-free seedlings after 6-month fallow.
Beetle: Hook traps on crown; apply neem cake 5 kg/palm twice yearly.
Nutrition: Apply 1.3 kg urea + 2 kg MOP + 2 kg superphosphate/palm/year in basin.
Irrigation: 45 L/palm/day in summer through drip where available.
Intercrop: Cocoa or pineapple in young gardens for income.`,
    cropTags: ["coconut"],
    tags: ["root-wilt", "rhinoceros-beetle", "coastal", "AP"],
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Horticulture",
    documentType: "bulletin",
    url: "https://angrau.ac.in/",
    publishedYear: 2023
  },
  {
    id: "angrau-rayalaseema-drought",
    source: "angrau",
    type: "guide",
    title: "ANGRAU Drought contingency crops \u2014 Anantapur, Kadapa, Kurnool",
    summary: "Short-duration crops, mulching, tank silt application for Rayalaseema drought-prone areas.",
    content: `Crops: Redgram 120-day, horsegram, sorghum, groundnut short-duration.
Sowing: Immediately after first effective rain; wider spacing saves moisture.
Tank silt: 10 t/acre improves water holding in red soils.
Mulch: Groundnut haulms or sorghum stover at 3 t/acre reduces evaporation 25%.
Fertilizer: Reduce N 25%; apply full P and K at sowing; foliar K at drought stress.`,
    cropTags: ["redgram", "sorghum", "groundnut"],
    tags: ["drought", "Rayalaseema", "rainfed", "AP"],
    season: "kharif",
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Agronomy",
    documentType: "advisory",
    url: "https://angrau.ac.in/",
    publishedYear: 2024
  },
  {
    id: "angrau-sweet-orange-citrus",
    source: "angrau",
    type: "guide",
    title: "ANGRAU Sweet orange (Sathgudi) \u2014 pest and nutrient calendar",
    summary: "AP citrus belt psylla, leaf miner, zinc deficiency schedule for Sathgudi orchards.",
    content: `Psylla/leaf miner: Monocrotophos avoid \u2014 use Imidacloprid 17.8% SL 60 ml/acre at flush.
Zinc: 0.5% Zinc sulphate foliar at Feb\u2013Mar and Aug\u2013Sep flushes.
Irrigation: Drip 40\u201360 L/tree/day in summer; mulching with dry leaves.
Fruit borer: Spinosad 150 ml/acre at pea-size fruit if damage observed.
Harvest: Dec\u2013Feb depending on region; do not mix fallen and tree-picked for market.`,
    cropTags: ["citrus", "sweet-orange"],
    tags: ["psylla", "zinc", "Sathgudi", "AP"],
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Horticulture",
    documentType: "publication",
    url: "https://angrau.ac.in/",
    publishedYear: 2024
  },
  {
    id: "angrau-blackgram-greengram-summer",
    source: "angrau",
    type: "guide",
    title: "ANGRAU Summer greengram/blackgram \u2014 rice fallows (AP)",
    summary: "Post-rice summer pulses in Krishna delta \u2014 VBN varieties, irrigation at flowering.",
    content: `Sowing: Jan\u2013Feb after rice harvest; VBN 8, LGG 460 for summer.
Irrigation: One light irrigation at flowering if no rain \u2014 critical for pod set.
Yellow mosaic: Control whitefly early; rogue infected plants.
Harvest: 60\u201365 days; whole plant cut and dried on tarpaulin.
Seed rate: 8 kg/acre; seed treat Rhizobium + Carbendazim.`,
    cropTags: ["greengram", "blackgram"],
    tags: ["summer", "rice-fallow", "pulses", "AP"],
    season: "rabi",
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Pulses",
    documentType: "package_of_practices",
    url: "https://angrau.ac.in/",
    publishedYear: 2023
  },
  {
    id: "angrau-banana-bunchy-top",
    source: "angrau",
    type: "disease",
    title: "ANGRAU Banana bunchy top virus \u2014 aphid vector control",
    summary: "BTV symptoms, use virus-free TC plants, Pentalonia aphid control in AP banana zones.",
    content: `Symptoms: Stunted plant, narrow upright leaves \u2014 "bunchy" appearance; no cure.
Prevention: Tissue culture Grand Naine from certified nursery only.
Aphid vector: Spray Imidacloprid 60 ml/acre at 45-day intervals in new plantings.
Rogue: Uproot and destroy infected plants immediately; do not replant banana same pit without fallow.
Districts: Rampant in certain pockets \u2014 contact ANGRAU KVK for local resistant clones.`,
    cropTags: ["banana"],
    tags: ["bunchy-top", "virus", "aphid", "AP"],
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Plant Pathology",
    documentType: "advisory",
    url: "https://angrau.ac.in/",
    publishedYear: 2024
  },
  {
    id: "angrau-castor-kurnool",
    source: "angrau",
    type: "guide",
    title: "ANGRAU Castor hybrid cultivation \u2014 Kurnool, Anantapur rainfed",
    summary: "DCH hybrids, semilooper control, castor capsule harvesting for AP dryland farmers.",
    content: `Hybrid: DCH 177, GCH 7 \u2014 5 kg/acre seed rate.
Sowing: July with monsoon; 90\xD760 cm spacing.
Semilooper: Quinlan 150 ml/acre OR Spinosad at ETL.
No irrigation: Critical weed control first 45 days; interculture 2 times.
Yield: 4\u20136 q/acre rainfed with proper pest management.`,
    cropTags: ["castor"],
    tags: ["semilooper", "rainfed", "Kurnool", "AP"],
    season: "kharif",
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Oilseeds",
    documentType: "package_of_practices",
    url: "https://angrau.ac.in/",
    publishedYear: 2023
  },
  {
    id: "angrau-seed-distribution-ap",
    source: "angrau",
    type: "guide",
    title: "ANGRAU Certified seed availability \u2014 AP State Seed Development Corporation",
    summary: "How AP farmers obtain certified seed for paddy, groundnut, cotton through APSSDC and RBK.",
    content: `APSSDC: Certified paddy, groundnut, redgram seed \u2014 check district seed godown list.
Quality: Blue tag certified seed \u2014 germination >80%; avoid loose unlabelled seed.
Subsidy: Seed subsidy schemes through Rythu Bharosa Kendras \u2014 carry farmer ID.
Storage: Keep seed in cool dry place; treat again before sowing if stored >6 months.
Contact ADA office for variety suitability by mandal.`,
    cropTags: ["rice", "groundnut", "cotton"],
    tags: ["seed", "certified", "APSSDC", "extension"],
    state: "Andhra Pradesh",
    publisher: "ANGRAU \u2014 Seed Technology",
    documentType: "advisory",
    url: "https://angrau.ac.in/",
    publishedYear: 2024
  }
];

// src/ingestion/data/faoPublications.ts
var FAO_PUBLICATIONS = [
  {
    id: "fao-ipm-farmers-field-school",
    source: "fao",
    type: "guide",
    title: "FAO Integrated Pest Management \u2014 Farmer Field School approach",
    summary: "FAO IPM principles: observation, economic threshold, natural enemy conservation, reduced pesticide use.",
    content: `FAO Farmer Field School (FFS) model: Weekly field observation by farmers \u2014 identify pests, beneficial insects, crop stage.
Key principles: No prophylactic spraying; use ETL; rotate pesticide modes of action; record all applications.
Biological control: Conserve parasitoids and predators \u2014 avoid broad-spectrum insecticides at early crop stage.
Decision making: Farmers learn to distinguish pest damage from natural variation; spray only when economic loss expected.`,
    tags: ["IPM", "FFS", "FAO", "sustainable"],
    publisher: "FAO Plant Production and Protection Division",
    documentType: "publication",
    url: "https://www.fao.org/plant-health/ipm/en/",
    publishedYear: 2022
  },
  {
    id: "fao-water-scarcity-crops",
    source: "fao",
    type: "guide",
    title: "FAO Water management in water-scarce agriculture",
    summary: "Deficit irrigation, mulching, drought-tolerant varieties, and scheduling for water-limited farming.",
    content: `FAO recommendations for water scarcity:
1. Shift to drought-tolerant varieties and short-duration crops.
2. Mulch with crop residue \u2014 reduces evaporation 20\u201330%.
3. Deficit irrigation at non-critical stages; full irrigation only at flowering/grain filling.
4. Laser levelling and raised bed planting for uniform water distribution.
5. Monitor soil moisture; avoid irrigation when crop can extract from subsoil.`,
    tags: ["water", "drought", "irrigation", "FAO"],
    season: "kharif",
    publisher: "FAO Land and Water Division",
    documentType: "publication",
    url: "https://www.fao.org/land-water/en/",
    publishedYear: 2023
  },
  {
    id: "fao-post-harvest-losses",
    source: "fao",
    type: "guide",
    title: "FAO Reducing post-harvest losses in grains and pulses",
    summary: "Proper drying, storage moisture levels, hermetic bags, and aflatoxin prevention in stored produce.",
    content: `FAO post-harvest guidelines:
Grains: Dry to 12\u201314% moisture before storage; use metal bins or hermetic bags (PICS bags).
Pulses: 9\u201310% moisture for safe storage; sun-dry on clean surface; avoid ground contact.
Groundnut: Dry pods to 8% moisture within 3 days of harvest to prevent aflatoxin from Aspergillus.
Storage: Clean godown; no previous infested grain; neem leaves or phosphine fumigation only by trained persons.`,
    cropTags: ["rice", "wheat", "groundnut", "redgram"],
    tags: ["post-harvest", "storage", "aflatoxin", "FAO"],
    publisher: "FAO Food Systems Division",
    documentType: "publication",
    url: "https://www.fao.org/food-loss-food-waste/en/",
    publishedYear: 2022
  },
  {
    id: "fao-climate-adaptation-smallholders",
    source: "fao",
    type: "guide",
    title: "FAO Climate-smart agriculture for smallholder farmers",
    summary: "Adaptation strategies \u2014 crop diversification, agroforestry, adjusted planting dates, index insurance awareness.",
    content: `FAO climate adaptation for smallholders:
Diversify: Mix crops and integrate livestock/fish where possible.
Adjust calendar: Shift sowing dates based on monsoon onset trends.
Agroforestry: Fruit/bamboo borders reduce wind and heat stress.
Soil organic matter: Compost and green manure improve water retention.
Risk: Explore crop insurance (PMFBY) and maintain seed reserve for replanting after extreme events.`,
    tags: ["climate", "adaptation", "FAO", "smallholder"],
    publisher: "FAO Climate Change Division",
    documentType: "publication",
    url: "https://www.fao.org/climate-change/en/",
    publishedYear: 2024
  },
  {
    id: "fao-plant-health-global",
    source: "fao",
    type: "guide",
    title: "FAO International Year of Plant Health \u2014 prevention practices",
    summary: "Prevent spread of pests and diseases \u2014 certified seed, quarantine awareness, early reporting.",
    content: `FAO plant health principles:
Use certified/ treated seed from authorized sources.
Inspect planting material for pests before field introduction.
Report unusual pest/disease outbreaks to local agriculture officer \u2014 early containment prevents spread.
Clean tools and machinery between fields; destroy infected plant material by burning (not composting).
Follow international phytosanitary standards for export crops.`,
    tags: ["plant-health", "quarantine", "FAO"],
    publisher: "FAO IPPC",
    documentType: "publication",
    url: "https://www.fao.org/plant-health/en/",
    publishedYear: 2020
  },
  {
    id: "fao-fertilizer-use-efficiency",
    source: "fao",
    type: "fertilizer",
    title: "FAO 4R Nutrient Stewardship \u2014 Right source, rate, time, place",
    summary: "Global best practice for fertilizer efficiency \u2014 matches ICAR INM and reduces environmental loss.",
    content: `FAO 4R Nutrient Stewardship:
Right SOURCE: Match fertilizer type to crop need and soil test (NPK complexes, micronutrients).
Right RATE: Based on soil analysis and expected yield \u2014 avoid blanket high doses.
Right TIME: Split nitrogen application; apply P at sowing, K per crop demand curve.
Right PLACE: Band placement or fertigation for efficiency; incorporate urea to reduce volatilization.`,
    tags: ["4R", "fertilizer", "efficiency", "FAO", "INM"],
    publisher: "FAO Plant Nutrition",
    documentType: "publication",
    url: "https://www.fao.org/agriculture/crops/nutrient-stewardship/en/",
    publishedYear: 2023
  },
  {
    id: "fao-rice-production-systems",
    source: "fao",
    type: "guide",
    title: "FAO Sustainable rice production \u2014 SRI and water-saving methods",
    summary: "System of Rice Intensification principles, alternate wetting and drying, reduced seed rate.",
    content: `SRI principles: Young seedlings (8\u201312 days), single seedling/hill, wider spacing 25\xD725 cm.
AWD: Allow field to dry slightly between irrigations \u2014 saves 15\u201330% water without yield loss.
Weeder use: 2\u20133 mechanical weedings improve aeration and root growth.
Organic SRI: Combine with FYM and green manure for best results on fertile soils.`,
    cropTags: ["rice"],
    tags: ["SRI", "AWD", "water-saving", "FAO"],
    publisher: "FAO Rice Market Monitor",
    documentType: "publication",
    url: "https://www.fao.org/rice/en/",
    publishedYear: 2023
  },
  {
    id: "fao-pesticide-risk-reduction",
    source: "fao",
    type: "guide",
    title: "FAO Pesticide risk reduction toolkit for smallholders",
    summary: "Reduce operator exposure, avoid empty container reuse, integrated alternatives to high-risk chemicals.",
    content: `FAO risk reduction:
Replace WHO Class Ia/Ib pesticides with lower-risk alternatives where possible.
Use IPM before resorting to chemical \u2014 scouting and ETL mandatory.
Triple-rinse spray containers; puncture and dispose \u2014 never reuse for food/water.
Train sprayers; restrict spraying to evening hours; maintain buffer from water bodies.
Governments should maintain list of banned/restricted actives \u2014 check CIB&RC India list.`,
    tags: ["pesticide", "safety", "risk-reduction", "FAO"],
    publisher: "FAO Plant Protection",
    documentType: "publication",
    url: "https://www.fao.org/agriculture/crops/pesticides/en/",
    publishedYear: 2023
  },
  {
    id: "fao-soil-conservation-sloping",
    source: "fao",
    type: "guide",
    title: "FAO Soil conservation on sloping land \u2014 terraces and cover crops",
    summary: "Contour bunding, vegetative strips, cover crops to prevent erosion on undulating farmland.",
    content: `Contour cultivation: Plough along contour lines not up-down slope.
Vegetative strips: Vetiver, napier grass on bunds reduce runoff velocity.
Cover crops: Cowpea, dolichos in off-season protect soil from monsoon erosion.
Terracing: For slopes >8% \u2014 reduce length of slope for water to travel.
Organic matter: Every 1% increase in soil carbon improves water retention significantly.`,
    tags: ["soil-conservation", "erosion", "FAO"],
    season: "kharif",
    publisher: "FAO Land and Water",
    documentType: "publication",
    url: "https://www.fao.org/land-water/en/",
    publishedYear: 2022
  },
  {
    id: "fao-small-scale-irrigation",
    source: "fao",
    type: "guide",
    title: "FAO Small-scale irrigation technologies for smallholders",
    summary: "Drip, sprinkler, treadle pump, solar pump \u2014 selection criteria for small farms.",
    content: `Drip: Best for horticulture, 30\u201350% water saving; needs filtration and maintenance.
Sprinkler: Suitable for cereals and vegetables on flat land.
Solar pump: Rising adoption in India \u2014 size pump to peak crop water need + 20% margin.
Scheduling: Irrigate at morning/evening; avoid midday evaporation losses.
Maintenance: Clean filters weekly; flush drip lines monthly in hard water areas.`,
    cropTags: [],
    tags: ["drip", "sprinkler", "solar-pump", "FAO"],
    publisher: "FAO Land and Water",
    documentType: "publication",
    url: "https://www.fao.org/land-water/en/",
    publishedYear: 2024
  },
  {
    id: "fao-livestock-crop-integration",
    source: "fao",
    type: "guide",
    title: "FAO Crop-livestock integration for mixed farming systems",
    summary: "Use crop residues for fodder, FYM from livestock for fields, integrated nutrient cycling.",
    content: `Residue use: Paddy straw, maize stover, groundnut haulms as cattle feed \u2014 reduce burning.
FYM: 5\u201310 t/acre from farm livestock reduces fertilizer need 25\u201330%.
Silage: Excess green fodder preserved for dry season.
Biogas: Slurry from biogas unit excellent organic fertilizer \u2014 apply after composting 15 days.
Health: Vaccinate livestock; avoid grazing on pesticide-sprayed fields before PHI.`,
    cropTags: [],
    tags: ["livestock", "FYM", "mixed-farming", "FAO"],
    publisher: "FAO Animal Production",
    documentType: "publication",
    url: "https://www.fao.org/agriculture/animal-production/en/",
    publishedYear: 2022
  },
  {
    id: "fao-food-safety-farm-level",
    source: "fao",
    type: "guide",
    title: "FAO Good Agricultural Practices (GAP) \u2014 farm-level food safety",
    summary: "Hygiene at harvest, clean water for washing produce, traceability for market access.",
    content: `GAP principles:
Use clean water for washing fruits/vegetables \u2014 not canal water with sewage contamination.
Harvest containers: Food-grade plastic or clean cloth \u2014 not fertilizer bags.
Record keeping: Spray diary with date, product, dose, PHI for audit readiness.
Worker hygiene: Hand wash facilities near packing area.
Reject: Produce fallen on soil without washing/discard for premium market channels.`,
    cropTags: [],
    tags: ["GAP", "food-safety", "FAO"],
    publisher: "FAO Food Safety",
    documentType: "publication",
    url: "https://www.fao.org/food-safety/en/",
    publishedYear: 2023
  },
  {
    id: "fao-biodiversity-farm",
    source: "fao",
    type: "guide",
    title: "FAO On-farm biodiversity \u2014 hedgerows, pollinators, beneficial insects",
    summary: "Maintain field borders with flowering plants to support bees and natural pest enemies.",
    content: `Field margins: Plant sunhemp, marigold, coriander border rows to attract predators.
Pollinators: Avoid insecticide at full bloom; spray evening when bees inactive.
Beneficial insects: Ladybird beetles, lacewings, parasitoid wasps \u2014 conserve with selective pesticides.
Seed diversity: Maintain local landraces alongside hybrids for resilience.
Agroforestry: Mango, tamarind, bamboo on bunds provide income + habitat.`,
    tags: ["biodiversity", "pollinators", "IPM", "FAO"],
    publisher: "FAO Biodiversity",
    documentType: "publication",
    url: "https://www.fao.org/biodiversity/en/",
    publishedYear: 2023
  },
  {
    id: "fao-desertification-drylands",
    source: "fao",
    type: "guide",
    title: "FAO Combating desertification in dryland farming",
    summary: "Mulching, windbreaks, drought crops, rainwater harvesting for semi-arid regions like Rayalaseema.",
    content: `Dryland strategies (relevant to AP/TG semi-arid zones):
Rainwater harvesting: Farm ponds, check dams recharge groundwater.
Windbreaks: Casuarina, subabul rows reduce wind erosion.
Crop choice: Short-duration pulses, sorghum, castor over long-duration water-intensive crops in dry years.
Mulch: Crop residue cover reduces soil temperature 5\u20138\xB0C in summer.
Monitor: IMD drought bulletins + local ADA advisories before sowing decisions.`,
    cropTags: ["sorghum", "redgram", "castor"],
    tags: ["desertification", "dryland", "rainwater", "FAO"],
    season: "kharif",
    publisher: "FAO Forestry / Drylands",
    documentType: "publication",
    url: "https://www.fao.org/drylands/en/",
    publishedYear: 2024
  }
];

// src/ingestion/data/icarPublications.ts
var ICAR_PUBLICATIONS = [
  {
    id: "icar-pop-rice-kharif",
    source: "icar",
    type: "guide",
    title: "ICAR Package of Practices \u2014 Kharif rice (irrigated transplanted)",
    titleTe: "ICAR POP \u2014 Kharif vari (nati)",
    summary: "Complete rice cultivation from nursery to harvest \u2014 varieties, fertilizer splits, water management, blast/BPH control.",
    content: `Nursery: 40\u201350 days old seedlings, 20\xD715 cm spacing. Apply 5 t FYM/acre before puddling.
Basal: DAP 40 kg + Zinc sulphate 5 kg/acre. N in 3 splits \u2014 50% basal, 25% tillering (25\u201330 DAT), 25% panicle initiation (45\u201350 DAT).
Water: Maintain 2\u20135 cm during tillering; intermittent irrigation after flowering saves 30% water.
Diseases: Seed treat Tricyclazole 0.1% or Carbendazim 2 g/kg. Blast \u2014 spray Tricyclazole 75% WP 120 g/acre at boot leaf stage if symptoms appear.
Pests: BPH economic threshold 5 hoppers/hill \u2014 avoid excess nitrogen; use neem oil 5 ml/L or Buprofezin 25% SC 200 ml/acre.
Harvest: When 80% grains turn golden yellow; moisture 20\u201322% at threshing.`,
    cropTags: ["rice"],
    tags: ["package-of-practices", "kharif", "IPM", "fertilizer"],
    season: "kharif",
    state: "India",
    publisher: "ICAR \u2014 DSR / AICRIP",
    documentType: "package_of_practices",
    url: "https://www.icar.org.in/en/crop-science/rice",
    publishedYear: 2023
  },
  {
    id: "icar-pop-cotton-ipm",
    source: "icar",
    type: "guide",
    title: "ICAR Cotton IPM \u2014 bollworm, whitefly, pink bollworm management",
    titleTe: "ICAR Cotton IPM \u2014 bollworm, whitefly control",
    summary: "Integrated pest management for cotton \u2014 pheromone traps, ETL, selective insecticides, natural enemy conservation.",
    content: `Varieties: Use Bt cotton hybrids approved for your zone. Avoid same hybrid >3 seasons.
Monitoring: 5 Heliothis pheromone traps/acre + 10 yellow sticky traps for whitefly.
ETL: Bollworm \u2014 2 egg masses or 10 larvae/100 plants. Whitefly \u2014 10 adults/leaf in top canopy.
Spray only at ETL: Emamectin benzoate 5% SG 80 g/acre OR Spinosad 45% SC 150 ml/acre. Rotate chemical groups.
Pink bollworm: Deep plough after harvest; destroy crop residue; avoid late sowing.
Nutrition: NPK 12:32:16 50 kg/acre at square formation; side-dress urea 25 kg at flowering.`,
    cropTags: ["cotton"],
    tags: ["IPM", "bollworm", "whitefly", "pink-bollworm"],
    season: "kharif",
    publisher: "ICAR \u2014 CICR",
    documentType: "package_of_practices",
    url: "https://cICR.org.in/",
    publishedYear: 2022
  },
  {
    id: "icar-wheat-rust-bulletin",
    source: "icar",
    type: "disease",
    title: "ICAR Wheat Rust Alert \u2014 yellow rust monitoring and fungicide timing",
    summary: "Yellow and brown rust identification, resistant varieties, Propiconazole/Tebuconazole spray schedule.",
    content: `Yellow rust: Bright yellow stripes on leaves \u2014 appears Jan\u2013Feb in North/Central India.
Resistant varieties: HD 3086, PBW 725, DBW 187, WH 1105 (check zone suitability).
First spray: Propiconazole 25% EC 200 ml/acre OR Tebuconazole 25% EC 200 ml/acre at first pustule on flag leaf.
Repeat after 15 days if disease progresses. Do not spray after milk stage.
Cultural: Avoid late sowing; remove volunteer wheat; balanced nitrogen only.`,
    cropTags: ["wheat"],
    tags: ["yellow-rust", "fungicide", "disease-alert"],
    season: "rabi",
    publisher: "ICAR \u2014 IIWBR",
    documentType: "bulletin",
    url: "https://www.icar.org.in/",
    publishedYear: 2024
  },
  {
    id: "icar-maize-faw-management",
    source: "icar",
    type: "pest",
    title: "ICAR Fall Armyworm (FAW) management in maize",
    summary: "Early detection, pheromone traps, biological and chemical control of Spodoptera frugiperda in maize.",
    content: `Scout weekly from 15 DAS \u2014 look for "window pane" damage and frass in whorl.
Pheromone traps: 4 traps/acre for mass trapping.
Biological: Release Trichogramma 50,000/acre at 15 and 25 DAS. Neem oil 5 ml/L whorl application.
Chemical (at ETL 10% plants with whorl damage): Emamectin benzoate 5% SG 88 g/acre OR Spinetoram 11.7% SC 90 ml/acre.
Apply in evening; direct spray into whorl. Rotate modes of action to prevent resistance.`,
    cropTags: ["maize"],
    tags: ["fall-armyworm", "FAW", "IPM"],
    season: "kharif",
    publisher: "ICAR \u2014 IIMR",
    documentType: "bulletin",
    publishedYear: 2023
  },
  {
    id: "icar-groundnut-aflatoxin",
    source: "icar",
    type: "guide",
    title: "ICAR Groundnut production \u2014 gypsum, rhizobium, aflatoxin prevention",
    summary: "Groundnut package: seed treatment, gypsum at pegging, irrigation at critical stages, drying to prevent aflatoxin.",
    content: `Seed: Rhizobium + PSB culture treatment. DAP 40 kg/acre basal.
Gypsum: 400 kg/ha at peg formation \u2014 essential for pod filling and kernel quality.
Irrigation: Critical at flowering and pegging; avoid waterlogging.
Diseases: Tikka \u2014 Mancozeb 2 g/L at 15-day interval from 30 DAS. Collar rot \u2014 seed treat with Trichoderma 4 g/kg.
Harvest: When leaves turn yellow; dig carefully; dry pods to 8% moisture within 3 days to prevent aflatoxin.`,
    cropTags: ["groundnut"],
    tags: ["gypsum", "rhizobium", "aflatoxin"],
    season: "kharif",
    publisher: "ICAR \u2014 DGR",
    documentType: "package_of_practices",
    url: "https://www.icar.org.in/",
    publishedYear: 2022
  },
  {
    id: "icar-chilli-disease-ipm",
    source: "icar",
    type: "disease",
    title: "ICAR Chilli disease management \u2014 die-back, anthracnose, leaf curl",
    summary: "Chilli major diseases in India: symptom ID, nursery hygiene, fungicide and vector management.",
    content: `Die-back (Colletotrichum): Dark lesions on fruits and stems. Spray Mancozeb 2 g/L + Carbendazim 1 g/L at 10-day intervals from fruit set.
Anthracnose: Circular sunken spots on fruits. Copper oxychloride 3 g/L preventive spray.
Leaf curl (virus): Whitefly vector \u2014 yellow sticky traps 20/acre; Imidacloprid 17.8% SL 60 ml/acre at ETL.
Nursery: Treat seeds with Trichoderma 4 g/kg; avoid overhead irrigation; rogue infected seedlings.`,
    cropTags: ["chilli"],
    tags: ["anthracnose", "die-back", "leaf-curl", "whitefly"],
    season: "year-round",
    publisher: "ICAR \u2014 IIHR",
    documentType: "bulletin",
    publishedYear: 2023
  },
  {
    id: "icar-soil-health-inm",
    source: "icar",
    type: "fertilizer",
    title: "ICAR Integrated Nutrient Management (INM) \u2014 Soil Health Card based",
    summary: "Combine organic manure, bio-fertilizers and chemical fertilizers per Soil Health Card recommendations.",
    content: `Test soil every 3 years via Soil Health Card (soilhealth.dac.gov.in).
Organic: 5\u201310 t FYM/acre or 2 t compost + green manure before kharif rice.
Bio-fertilizers: Rhizobium for pulses, Azotobacter for cereals, PSB for phosphorus solubilization.
Chemical: Apply 50\u201375% recommended dose when organic carbon >0.5%. Use neem-coated urea.
Micronutrients: Zinc, boron, iron per SHC \u2014 foliar spray more efficient on alkaline soils.`,
    cropTags: [],
    tags: ["INM", "soil-health-card", "organic"],
    state: "India",
    publisher: "ICAR \u2014 CRIDA",
    documentType: "publication",
    url: "https://www.icar.org.in/",
    publishedYear: 2024
  },
  {
    id: "icar-redgram-wilt",
    source: "icar",
    type: "disease",
    title: "ICAR Redgram (tur/arhar) wilt and pod borer management",
    summary: "Fusarium wilt prevention, Maruca pod borer IPM, rhizobium seed treatment for redgram.",
    content: `Wilt: Use resistant varieties (TS-3R, ICPL 87119). Seed treat Trichoderma 4 g/kg + Carbendazim 2 g/kg. Avoid waterlogging.
Pod borer (Maruca): Install 5 pheromone traps/acre. Spray Indoxacarb 14.5% SC 200 ml/acre at 50% flowering if larval damage >5 pods/plant.
Nutrition: Rhizobium mandatory. DAP 40 kg/acre basal. No top-dress nitrogen needed.
Intercropping: Redgram + cotton or redgram + sorghum reduces pest buildup.`,
    cropTags: ["redgram", "tur", "arhar"],
    tags: ["wilt", "pod-borer", "pulses"],
    season: "kharif",
    publisher: "ICAR \u2014 IIPR",
    documentType: "bulletin",
    publishedYear: 2023
  },
  {
    id: "icar-sugarcane-redrot",
    source: "icar",
    type: "disease",
    title: "ICAR Sugarcane red rot and smut \u2014 identification and control",
    summary: "Red rot symptom (reddish internal tissues), resistant varieties, seed cane treatment, trash mulching.",
    content: `Red rot: Reddish discolouration inside cane with alcoholic smell. Use resistant varieties (Co 0238, CoS 767).
Sett treatment: Carbendazim 0.1% + Quinalphos 0.05% dip for 15 min before planting.
Smut: Black whip-like structure \u2014 rogue and burn infected clumps; treat setts with Carbendazim.
Nutrition: N 250 kg/ha in 3 splits; trash mulching conserves moisture and adds potassium.
Harvest: Avoid ratoon on heavily diseased fields.`,
    cropTags: ["sugarcane"],
    tags: ["red-rot", "smut", "disease"],
    publisher: "ICAR \u2014 SBI",
    documentType: "bulletin",
    publishedYear: 2022
  },
  {
    id: "icar-tomato-tuta-absoluta",
    source: "icar",
    type: "pest",
    title: "ICAR Tomato leaf miner (Tuta absoluta) IPM guide",
    summary: "Tuta absoluta monitoring with pheromone traps, biological control, selective insecticides.",
    content: `Monitoring: 3 pheromone traps/acre \u2014 peak activity in summer.
Biological: Release Nesidiocoris 5/adult plant in protected cultivation.
Cultural: Remove mined leaves; destroy crop residue after harvest.
Chemical (at ETL): Chlorantraniliprole 18.5% SC 60 ml/acre OR Abamectin 1.9% EC 200 ml/acre. Rotate with different IRAC groups.
Avoid broad-spectrum pyrethroids \u2014 kills natural enemies.`,
    cropTags: ["tomato"],
    tags: ["tuta-absoluta", "leaf-miner", "IPM"],
    season: "year-round",
    publisher: "ICAR \u2014 IIHR",
    documentType: "bulletin",
    publishedYear: 2024
  },
  {
    id: "icar-rice-stem-borer",
    source: "icar",
    type: "pest",
    title: "ICAR Rice stem borer (yellow stem borer, gall midge) management",
    titleTe: "ICAR \u2014 Vari stem borer control",
    summary: "Dead heart / white ear symptoms, light traps, Cartap/Chlorantraniliprole spray timing for rice stem borers.",
    content: `Yellow stem borer: Dead heart in vegetative stage; white ear at panicle stage.
Gall midge: Silver shoot / onion leaf \u2014 common in early transplanted rice.
Monitoring: Light traps 1/acre; scout for egg masses on leaf tips.
Cultural: Clip leaf tips before transplant; avoid late planting; destroy stubbles.
Chemical (at ETL): Cartap hydrochloride 4G 8 kg/acre OR Chlorantraniliprole 18.5% SC 60 ml/acre at early dead heart stage.
Seed/seedling: Treat with Chlorpyriphos 20 EC 3 ml/kg or Fipronil 0.3% GR in nursery.`,
    cropTags: ["rice"],
    tags: ["stem-borer", "gall-midge", "dead-heart"],
    season: "kharif",
    publisher: "ICAR \u2014 DSR",
    documentType: "bulletin",
    publishedYear: 2023
  },
  {
    id: "icar-greengram-blackgram",
    source: "icar",
    type: "guide",
    title: "ICAR Greengram and blackgram \u2014 kharif pulses package",
    summary: "Short-duration pulses: varieties, rhizobium, yellow mosaic virus, pod borer control.",
    content: `Greengram: VBN 8, PDM 139 (summer); Kharif sow June\u2013July, 30\xD710 cm.
Blackgram: T 9, LBG 752 \u2014 avoid waterlogging.
Seed treat: Rhizobium + Carbendazim 2 g/kg.
Yellow mosaic virus: Rogue infected plants; control whitefly \u2014 Imidacloprid 60 ml/acre.
Pod borer: Spray Indoxacarb 200 ml/acre at 50% flowering if damage >5%.
Harvest: When 80% pods turn black; spray 2 days before harvest to reduce shattering.`,
    cropTags: ["greengram", "blackgram", "pulses"],
    tags: ["rhizobium", "yellow-mosaic", "pod-borer"],
    season: "kharif",
    publisher: "ICAR \u2014 IIPR",
    documentType: "package_of_practices",
    url: "https://www.icar.org.in/",
    publishedYear: 2023
  },
  {
    id: "icar-chickpea-wilt-rootrot",
    source: "icar",
    type: "disease",
    title: "ICAR Chickpea wilt, root rot and pod borer \u2014 rabi package",
    summary: "Fusarium wilt resistant varieties, seed treatment, H. armigera pod borer IPM for chickpea.",
    content: `Wilt: JG 11, JG 16, KAK 2 \u2014 use resistant types. Seed treat Trichoderma 4 g/kg + Carbendazim 2 g/kg.
Root rot: Avoid heavy soils without drainage; treat seed with Metalaxyl 6 g/kg.
Pod borer (Helicoverpa): Pheromone traps 5/acre; ETL 5 larvae/m row.
Spray: Indoxacarb 14.5% SC 200 ml/acre OR Emamectin benzoate at pod formation.
Nutrition: DAP 40 kg/acre basal; no nitrogen top dressing.`,
    cropTags: ["chickpea"],
    tags: ["wilt", "pod-borer", "rabi"],
    season: "rabi",
    publisher: "ICAR \u2014 IIPR",
    documentType: "package_of_practices",
    publishedYear: 2023
  },
  {
    id: "icar-sunflower-seed-maggot",
    source: "icar",
    type: "pest",
    title: "ICAR Sunflower cultivation and head borer / seed maggot control",
    summary: "Sunflower hybrids, fertilizer schedule, capitulum borer and seed maggot management.",
    content: `Hybrids: KBSH 1, PAC 36, DSF 1 \u2014 sow June\u2013July or Jan\u2013Feb rabi.
Fertilizer: NPK 60:40:40 kg/ha; half N basal, half at button stage.
Irrigation: Critical at bud, flowering and seed filling.
Head borer: Spray Spinosad 45% SC 150 ml/acre at 10% capitulum damage.
Seed maggot: Seed treat Imidacloprid 70 WS 5 g/kg; avoid late sowing.
Harvest: When back of head turns yellow; dry seeds to 9% moisture.`,
    cropTags: ["sunflower"],
    tags: ["head-borer", "seed-maggot", "oilseed"],
    season: "kharif",
    publisher: "ICAR \u2014 IIOR",
    documentType: "package_of_practices",
    publishedYear: 2022
  },
  {
    id: "icar-banana-panama-wilt",
    source: "icar",
    type: "disease",
    title: "ICAR Banana Panama wilt and sigatoka leaf spot management",
    summary: "Panama wilt resistant varieties, tissue culture plants, Mancozeb spray for sigatoka.",
    content: `Panama wilt (Fusarium): Use resistant Grand Naine, Robusta TC plants from certified nurseries.
Avoid planting in wilt-history fields without fallow + Trichoderma drench.
Sigatoka: Mancozeb 2 g/L + Copper oxychloride 3 g/L alternate sprays every 15 days in monsoon.
Nematode: Carbofuran 3G 20 g/pit at planting in infested fields.
Nutrition: NPK 200:60:300 g/plant/year in 6 splits through drip.`,
    cropTags: ["banana"],
    tags: ["panama-wilt", "sigatoka", "horticulture"],
    season: "year-round",
    publisher: "ICAR \u2014 IIHR",
    documentType: "bulletin",
    publishedYear: 2023
  },
  {
    id: "icar-onion-purple-blotch",
    source: "icar",
    type: "disease",
    title: "ICAR Onion thrips and purple blotch disease management",
    summary: "Onion thrips scouting, Mancozeb/Copper for purple blotch, bulb storage guidelines.",
    content: `Thrips: Silvery streaks on leaves \u2014 ETL 5 thrips/leaf. Fipronil 400 ml/acre OR Spinosad 150 ml/acre.
Purple blotch: Brown lesions with purple margins \u2014 Mancozeb 2 g/L + Mancozeb-Carbendazim from 45 DAT.
Basal rot: Avoid over-irrigation; treat sets with Carbendazim 0.1% dip.
Storage: Cure bulbs 3\u20134 days in field; store in ventilated godown at 25\u201330\xB0C, 65\u201370% RH.`,
    cropTags: ["onion"],
    tags: ["thrips", "purple-blotch", "storage"],
    season: "rabi",
    publisher: "ICAR \u2014 IIHR",
    documentType: "bulletin",
    publishedYear: 2023
  },
  {
    id: "icar-citrus-citrus-greening",
    source: "icar",
    type: "disease",
    title: "ICAR Citrus psylla and nutrient deficiency diagnosis",
    summary: "Huanglongbing awareness, psylla control, zinc/iron/magnesium deficiency symptoms in citrus.",
    content: `Psylla vector: Monitor yellow sticky traps; Imidacloprid 17.8% SL 60 ml/acre at flush.
HLB symptoms: Asymmetric blotchy mottle, yellow shoots \u2014 rogue infected trees; no cure \u2014 prevent vector.
Zinc deficiency: Small interveinal yellow leaves \u2014 Zinc sulphate 0.5% foliar 3 sprays at flush.
Iron: Apply on calcareous soils \u2014 Ferrous sulphate 0.5% foliar.
Magnesium: Dolomite or MgSO4 foliar on acid sandy soils.`,
    cropTags: ["citrus", "sweet-orange", "lemon"],
    tags: ["psylla", "micronutrient", "HLB"],
    season: "year-round",
    publisher: "ICAR \u2014 CCRI",
    documentType: "publication",
    url: "https://www.icar.org.in/",
    publishedYear: 2024
  },
  {
    id: "icar-castor-jassids",
    source: "icar",
    type: "pest",
    title: "ICAR Castor cultivation and semilooper / jassids / capsule borer IPM",
    summary: "Castor hybrids, ricin-free varieties, semilooper and capsule borer spray schedule.",
    content: `Varieties: DCH 177, DCS 9 (hybrids); GCH 7 for rainfed.
Semilooper/capsule borer: Pheromone traps 5/acre; Spinosad 150 ml/acre at ETL.
Jassids & thrips: Neem oil 5 ml/L at early vegetative stage.
Seed treat: Carbendazim 2 g/kg + Imidacloprid 5 g/kg.
Harvest: Pick capsules in 3\u20134 pickings when they turn brown.`,
    cropTags: ["castor"],
    tags: ["semilooper", "jassids", "oilseed"],
    season: "kharif",
    publisher: "ICAR \u2014 DOR",
    documentType: "package_of_practices",
    publishedYear: 2022
  },
  {
    id: "icar-organic-farming-certification",
    source: "icar",
    type: "guide",
    title: "ICAR Organic farming \u2014 NPOP standards and conversion period",
    summary: "Organic conversion 2\u20133 years, permitted inputs, pest control with neem, Trichoderma, pheromone traps.",
    content: `Conversion: Minimum 2 years for annual crops before organic certification (NPOP/PGS).
Permitted inputs: FYM, compost, vermicompost, neem cake, bio-pesticides (Trichoderma, Pseudomonas, Bt).
Prohibited: Synthetic pesticides, herbicides, GMO seeds, sewage sludge.
Pest control: Neem oil 5 ml/L, cow urine formulations, light traps, bird perches.
Certification: Contact APEDA accredited agency or join PGS-India local group.`,
    cropTags: [],
    tags: ["organic", "NPOP", "PGS", "sustainable"],
    state: "India",
    publisher: "ICAR \u2014 NCOF",
    documentType: "publication",
    url: "https://www.icar.org.in/",
    publishedYear: 2024
  },
  {
    id: "icar-pesticide-phi-safety",
    source: "icar",
    type: "guide",
    title: "ICAR Pesticide safety \u2014 PHI, MRL, and sprayer calibration",
    summary: "Pre-harvest interval compliance, label reading, nozzle calibration, PPE for spray operators.",
    content: `Always read label for dose, crop, pest, and PHI (days before harvest).
Examples: Spinosad PHI 3 days chilli; Imidacloprid PHI 7\u201314 days varies by crop.
MRL: Export crops must meet EU/US maximum residue limits \u2014 maintain spray diary.
Calibration: 500 L/acre hydraulic sprayer \u2014 collect nozzle output 1 min, adjust pressure.
PPE: Mask with organic vapour filter, gloves, goggles, full sleeves; triple rinse empty containers.`,
    cropTags: [],
    tags: ["PHI", "MRL", "safety", "sprayer"],
    state: "India",
    publisher: "ICAR \u2014 NRCC",
    documentType: "publication",
    url: "https://www.icar.org.in/",
    publishedYear: 2024
  },
  {
    id: "icar-seed-treatment-master",
    source: "icar",
    type: "guide",
    title: "ICAR Seed treatment master guide \u2014 fungicide + insecticide + bioagents",
    summary: "Standard seed treatment doses for major crops before sowing or transplanting.",
    content: `Fungicide: Carbendazim 2 g/kg OR Thiram 2.5 g/kg \u2014 all crops.
Insecticide: Imidacloprid 70 WS 5 g/kg OR Chlorpyriphos 20 EC 3 ml/kg seed.
Bio: Trichoderma 4 g/kg + Pseudomonas 10 g/kg for pulses and vegetables.
Rhizobium: 5 packets (200 g)/10 kg seed for pulses \u2014 do not mix with chemical fungicide (apply separately).
Slurry method: Mix treatment agents in minimum water; shade-dry 30 min before sowing.`,
    cropTags: [],
    tags: ["seed-treatment", "Trichoderma", "rhizobium"],
    state: "India",
    publisher: "ICAR \u2014 IARI",
    documentType: "publication",
    publishedYear: 2023
  },
  {
    id: "icar-potato-late-blight",
    source: "icar",
    type: "disease",
    title: "ICAR Potato late blight (Phytophthora) \u2014 forecast-based fungicide spray",
    summary: "Late blight water-soaked lesions, Metalaxyl-Mancozeb/Cymoxanil spray, seed tuber treatment.",
    content: `Symptoms: Water-soaked lesions on leaves; white sporulation under humid conditions; tuber rot brown-purple.
Forecast: Spray preventive when weather favours (cool + humid) \u2014 don't wait for full epidemic.
Spray: Mancozeb 2 g/L + Metalaxyl 1 g/L OR Cymoxanil + Mancozeb at 7\u201310 day interval.
Seed tuber: Treat with Metalaxyl 0.1% dip or use certified disease-free seed.
Varieties: Kufri Jyoti, Kufri Pukhraj \u2014 moderate resistance where available.`,
    cropTags: ["potato"],
    tags: ["late-blight", "Phytophthora", "fungicide"],
    season: "rabi",
    publisher: "ICAR \u2014 CPRI",
    documentType: "bulletin",
    publishedYear: 2023
  },
  {
    id: "icar-turmeric-rhizome-rot",
    source: "icar",
    type: "disease",
    title: "ICAR Turmeric rhizome rot and leaf spot management",
    summary: "Pythium rhizome rot, leaf spot, shoot borer in turmeric \u2014 drench and spray schedule.",
    content: `Rhizome rot: Yellowing wilt; rhizome soft brown rot \u2014 seed rhizome treat Mancozeb 0.3% dip 30 min.
Drench: Metalaxyl-Mancozeb 1 g/L at rhizome formation if heavy rain.
Leaf spot: Mancozeb 2 g/L every 15 days from 60 DAP.
Shoot borer: Carbaryl 2 g/L OR Chlorantraniliprole 60 ml/acre if larval damage in pseudostem.
Planting: Raised beds with drainage; 25\xD720 cm spacing; 1500 kg rhizome/acre.`,
    cropTags: ["turmeric"],
    tags: ["rhizome-rot", "leaf-spot", "spice"],
    season: "kharif",
    publisher: "ICAR \u2014 IISR",
    documentType: "package_of_practices",
    publishedYear: 2023
  },
  {
    id: "icar-cotton-leaf-curl-virus",
    source: "icar",
    type: "disease",
    title: "ICAR Cotton leaf curl virus (CLCuD) \u2014 whitefly vector management",
    summary: "CLCuD symptoms, resistant hybrids, whitefly control, rogue infected plants early.",
    content: `Symptoms: Upward leaf curl, vein thickening, stunted plants \u2014 no cure for infected plant.
Prevention: Use CLCuD-tolerant hybrids approved for North/Central zones.
Whitefly: Yellow sticky traps 15/acre; avoid Monocrotophos repeat \u2014 Diafenthiuron 240 g/acre OR Pyriproxyfen 100 ml/acre.
Rogue: Remove infected plants early in season and bury/burn.
Avoid cotton-cotton or cotton-okra continuous cropping in same field.`,
    cropTags: ["cotton"],
    tags: ["CLCuD", "whitefly", "virus"],
    season: "kharif",
    publisher: "ICAR \u2014 CICR",
    documentType: "bulletin",
    publishedYear: 2024
  },
  {
    id: "icar-mustard-alternaria",
    source: "icar",
    type: "disease",
    title: "ICAR Mustard / rapeseed Alternaria blight and aphid management",
    summary: "Alternaria dark spots on mustard pods, Mancozeb spray, aphid control at flowering.",
    content: `Alternaria: Dark concentric spots on leaves and pods \u2014 Mancozeb 2 g/L from 45 DAS, 2\u20133 sprays.
Aphid: Curling of young inflorescence \u2014 Dimethoate 30% EC 400 ml/acre OR Neem oil 5 ml/L at ETL.
Varieties: Pusa Bold, RH 749 for Indian conditions.
Sowing: Oct\u2013Nov rabi; 30\xD710 cm; DAP 40 kg/acre basal.
Harvest: When 75% pods turn brown; cut and stack for ripening.`,
    cropTags: ["mustard", "rapeseed"],
    tags: ["alternaria", "aphid", "oilseed"],
    season: "rabi",
    publisher: "ICAR \u2014 DRMR",
    documentType: "package_of_practices",
    publishedYear: 2023
  }
];

// src/ingestion/data/pjtsauPublications.ts
var PJTSAU_PUBLICATIONS = [
  {
    id: "pjtsau-rice-varieties-tg",
    source: "pjtsau",
    type: "guide",
    title: "PJTSAU Recommended rice varieties for Telangana",
    titleTe: "PJTSAU \u2014 Telangana vari varieties",
    summary: "Telangana kharif and rabi rice varieties \u2014 RNR, JGL, Tellahamsa, fine rice for different agro-climatic zones.",
    content: `Telangana kharif: RNR 15048, JGL 1798, Tellahamsa, Kunaram Sannalu \u2014 zone-wise from PJTSAU KVK.
Irrigated tracts (Warangal, Karimnagar, Nizamabad): RNR 15048 \u2014 blast tolerant, 125-day duration.
Fine rice (premium): RNR 15048, Tellahamsa for export/scented markets.
Seed treatment: Carbendazim 2 g/kg + Chlorpyriphos 20 EC 3 ml/kg for termite/stem borer.
SRI method: 25\xD725 cm spacing saves seed and water \u2014 PJTSAU recommends for assured irrigation areas.`,
    cropTags: ["rice"],
    tags: ["varieties", "Telangana", "RNR"],
    season: "kharif",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Extension",
    documentType: "publication",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2024
  },
  {
    id: "pjtsau-cotton-pink-bollworm",
    source: "pjtsau",
    type: "pest",
    title: "PJTSAU Pink bollworm management in Telangana cotton",
    summary: "Pink bollworm pheromone trapping, mating disruption, crop termination date for Telangana cotton.",
    content: `Mandatory: Crop termination by 31 December \u2014 no ratoon/stub cotton.
Pheromone traps: 5 PBW traps/acre from 90 DAS; count males daily.
Mating disruption: PBW pheromone dispensers 100/acre in hotspot villages (Adilabad, Nalgonda, Warangal).
At ETL: Flubendiamide 20% WG 80 g/acre OR Emamectin benzoate 5% SG 88 g/acre.
Avoid late sowing after July 15 \u2014 increases PBW risk.`,
    cropTags: ["cotton"],
    tags: ["pink-bollworm", "Telangana", "IPM"],
    season: "kharif",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Entomology",
    documentType: "bulletin",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2024
  },
  {
    id: "pjtsau-maize-kharif-tg",
    source: "pjtsau",
    type: "guide",
    title: "PJTSAU Kharif maize \u2014 hybrids and FAW control for Telangana",
    summary: "Maize hybrid recommendations, fertilizer schedule, fall armyworm monitoring for TG maize belt.",
    content: `Hybrids: DHM 121, NK 6240, 3566 (check PJTSAU KVK for zone).
Sowing: June\u2013July, 60\xD720 cm, population 18,000\u201320,000/acre.
Fertilizer: DAP 50 kg basal + Urea 100 kg in 3 splits.
FAW: Pheromone traps 4/acre; whorl spray at 10% damage \u2014 Emamectin benzoate 88 g/acre.
Post-harvest: Stubble destroy within 15 days to break FAW cycle.`,
    cropTags: ["maize"],
    tags: ["FAW", "hybrids", "Telangana"],
    season: "kharif",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Agronomy",
    documentType: "package_of_practices",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2023
  },
  {
    id: "pjtsau-redgram-tur",
    source: "pjtsau",
    type: "guide",
    title: "PJTSAU Redgram (tur) cultivation \u2014 Telangana rainfed tracts",
    summary: "Redgram varieties, rhizobium, wilt management for Mahbubnagar, Nalgonda, Vikarabad districts.",
    content: `Varieties: TS-3R (wilt tolerant), ICPL 87119, LRG 30 \u2014 150\u2013180 day duration.
Seed: Rhizobium + PSB + Trichoderma 4 g/kg seed treatment.
Sowing: June\u2013July with 90\xD730 cm or 60\xD730 cm spacing.
Wilt: Use resistant varieties; avoid waterlogging; drench Carbendazim 1 g/L at root zone if wilt suspected.
Pod borer: Pheromone traps 5/acre; Indoxacarb 200 ml/acre at 50% flowering if needed.`,
    cropTags: ["redgram", "tur"],
    tags: ["wilt", "pulses", "Telangana", "rainfed"],
    season: "kharif",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Pulses Research",
    documentType: "package_of_practices",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2023
  },
  {
    id: "pjtsau-chilli-guntur-style-tg",
    source: "pjtsau",
    type: "pest",
    title: "PJTSAU Chilli production \u2014 Khammam, Warangal districts",
    summary: "Chilli thrips, anthracnose, die-back management and fertigation for Telangana chilli farmers.",
    content: `Varieties: Teja, 5531, Byadgi type for dry chilli; local KVK for fresh market hybrids.
Thrips: Blue sticky traps; Spinosad 150 ml/acre at ETL.
Die-back: Mancozeb + Carbendazim spray from fruit set; improve drainage in heavy rains.
Fertigation: NPK 19:19:19 2 kg/acre/week through drip from 30 DAT.
Drying: Dry to 10% moisture for storage; aflatoxin risk if improperly dried.`,
    cropTags: ["chilli"],
    tags: ["thrips", "anthracnose", "Khammam", "Telangana"],
    season: "year-round",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Horticulture",
    documentType: "bulletin",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2024
  },
  {
    id: "pjtsau-soybean-rust",
    source: "pjtsau",
    type: "disease",
    title: "PJTSAU Soybean rust alert \u2014 Adilabad, Komaram Bheem districts",
    summary: "Soybean rust identification, Propiconazole/Tebuconazole spray timing for Telangana soybean.",
    content: `Rust: Small brown pustules on lower leaf surface \u2014 appears in humid conditions (Aug\u2013Sep).
Spray: Propiconazole 25% EC 200 ml/acre OR Tebuconazole 200 ml/acre at first symptom.
Repeat after 15 days if needed. Do not spray after pod filling stage.
Varieties: JS 335, MACS 1407 \u2014 check PJTSAU recommendation for TG.
Rotation: Avoid soybean on same field consecutive years.`,
    cropTags: ["soybean"],
    tags: ["rust", "fungicide", "Adilabad", "Telangana"],
    season: "kharif",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Plant Pathology",
    documentType: "advisory",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2023
  },
  {
    id: "pjtsau-sorghum-shoot-fly",
    source: "pjtsau",
    type: "pest",
    title: "PJTSAU Sorghum shoot fly management \u2014 rainfed Telangana",
    summary: "Shoot fly prevention with seed treatment, early sowing, and carbofuran for Telangana rabi sorghum.",
    content: `Seed treatment: Imidacloprid 70 WS 5 g/kg + Thiram 2 g/kg mandatory.
Sowing: Early sowing (before Oct 15 rabi) reduces shoot fly damage.
Whichever: Carbofuran 3G 8 kg/acre in seed furrow at sowing in high-risk areas.
Dead heart symptom: Rogue affected plants in early stage; avoid late sowing.
Varieties: CSV 216, Maldandi for rainfed; CSV 17 for irrigated.`,
    cropTags: ["sorghum", "jowar"],
    tags: ["shoot-fly", "rainfed", "Telangana"],
    season: "rabi",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Entomology",
    documentType: "bulletin",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2023
  },
  {
    id: "pjtsau-rythu-bharosa-inputs",
    source: "pjtsau",
    type: "guide",
    title: "PJTSAU Extension \u2014 Rythu Bharosa Kendra input and advisory access",
    summary: "How Telangana farmers access seeds, fertilizers, and pest advisories through RBK and PJTSAU KVK network.",
    content: `Rythu Bharosa Kendras: Seed, fertilizer, pesticide availability at subsidized rates \u2014 carry Aadhaar and passbook.
PJTSAU KVKs: Free soil testing, training, pest identification \u2014 contact district KVK (Warangal, Palem, Jagtial, etc.).
Crop contingency: SMS/WhatsApp pest alerts from Agriculture Department during kharif peak.
PJTSAU website and agri extension app for weekly weather-based advisories.`,
    cropTags: [],
    tags: ["extension", "Rythu-Bharosa", "Telangana", "advisory"],
    state: "Telangana",
    publisher: "PJTSAU \u2014 Extension Education",
    documentType: "advisory",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2024
  },
  {
    id: "pjtsau-rice-bph-tg",
    source: "pjtsau",
    type: "pest",
    title: "PJTSAU Rice BPH management \u2014 Karimnagar, Nizamabad intensive rice areas",
    summary: "Brown planthopper control, avoid excess nitrogen, recommended tolerant varieties for TG.",
    content: `Varieties: RNR 15048, WGL 32100 \u2014 moderate tolerance; avoid susceptible late varieties.
N management: No urea after 45 DAT unless deficiency confirmed.
ETL: 5 BPH/tiller \u2014 spray Buprofezin 200 ml/acre OR Dinotefuran 20 SG 80 g/acre.
Avoid: Cypermethrin repeat \u2014 causes resurgence.
Community: Synchronous planting in village reduces BPH buildup.`,
    cropTags: ["rice"],
    tags: ["BPH", "Karimnagar", "Telangana"],
    season: "kharif",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Entomology",
    documentType: "advisory",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2024
  },
  {
    id: "pjtsau-cotton-whitefly-tg",
    source: "pjtsau",
    type: "pest",
    title: "PJTSAU Cotton whitefly management \u2014 Nalgonda, Khammam",
    summary: "Whitefly sticky honeydew, sooty mould, Diafenthiuron/Pyriproxyfen rotation for Telangana cotton.",
    content: `Monitoring: 10 yellow sticky traps/acre; check underside of 3rd leaf from top.
ETL: 10 adults/leaf top canopy.
Spray: Diafenthiuron 50% WP 240 g/acre OR Pyriproxyfen 10% EC 100 ml/acre \u2014 rotate.
Avoid: Repeated Monocrotophos/Omethoate \u2014 resistance widespread.
Harvest: Stop sprays 15 days before last picking per PHI.`,
    cropTags: ["cotton"],
    tags: ["whitefly", "Nalgonda", "Telangana"],
    season: "kharif",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Entomology",
    documentType: "bulletin",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2024
  },
  {
    id: "pjtsau-turmeric-nizamabad",
    source: "pjtsau",
    type: "guide",
    title: "PJTSAU Turmeric production \u2014 Nizamabad, Kamareddy districts",
    summary: "Telangana turmeric belt \u2014 Prabhani variety, rhizome rot prevention, boiling and drying.",
    content: `Varieties: Prabhani, Rajendra Sonia for TG; planting May\u2013July.
Rhizome: Treat Mancozeb 0.3%; plant on ridges 25 cm apart.
Irrigation: 8\u201310 irrigations if no rain; critical at rhizome development.
Leaf spot: Mancozeb 2 g/L 2 sprays from 90 DAP.
Processing: Boil 45\u201360 min until soft; dry to 8% moisture for Nizamabad market quality.`,
    cropTags: ["turmeric"],
    tags: ["Nizamabad", "spice", "Telangana"],
    season: "kharif",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Horticulture",
    documentType: "package_of_practices",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2023
  },
  {
    id: "pjtsau-onion-rabi-tg",
    source: "pjtsau",
    type: "guide",
    title: "PJTSAU Rabi onion \u2014 Medak, Mahbubnagar belt",
    summary: "Onion nursery timing, thrips, purple blotch, storage for Telangana rabi onion farmers.",
    content: `Nursery: Sept transplant to main field Oct\u2013Nov.
Varieties: Bhima Super, NHRDF red types for TG.
Thrips: Spinosad 150 ml/acre at silvery streak stage.
Purple blotch: Mancozeb + Mancozeb-Carbendazim from 45 DAT.
Top dressing: Urea 25 kg/acre at 30 and 45 DAT.
Storage: Cure 4 days; store in shade with ventilation \u2014 avoid field heap >3 days in rain.`,
    cropTags: ["onion"],
    tags: ["rabi", "thrips", "Medak", "Telangana"],
    season: "rabi",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Horticulture",
    documentType: "package_of_practices",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2023
  },
  {
    id: "pjtsau-castor-siddipet",
    source: "pjtsau",
    type: "guide",
    title: "PJTSAU Castor hybrid cultivation \u2014 Siddipet, Medak rainfed",
    summary: "DCH 177 castor, semilooper spray, intercropping with redgram in Telangana.",
    content: `Sowing: July; 90\xD760 cm; 5 kg/acre.
Intercrop: Redgram 1 row between castor rows increases income.
Semilooper: Spinosad 150 ml/acre at 10% defoliation.
Harvest: 3 pickings when capsules dry; avoid rain on harvested capsules.
Oil recovery: Sun-dry 3 days before crushing.`,
    cropTags: ["castor"],
    tags: ["semilooper", "rainfed", "Telangana"],
    season: "kharif",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Oilseeds",
    documentType: "package_of_practices",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2023
  },
  {
    id: "pjtsau-greengram-summer-tg",
    source: "pjtsau",
    type: "guide",
    title: "PJTSAU Summer greengram after rice \u2014 Telangana delta",
    summary: "Post-rice summer mung cultivation, VBN varieties, one irrigation at flowering.",
    content: `Sowing: Jan\u2013Feb in rice fallows; VBN 8, TM 96-2.
Seed: Rhizum + Carbendazim; 8 kg/acre.
Irrigation: One at flowering if dry spell >10 days.
Pest: Yellow mosaic \u2014 whitefly control; harvest 60\u201365 days.
Grain: Dry to 12% before bagging.`,
    cropTags: ["greengram"],
    tags: ["summer", "rice-fallow", "Telangana"],
    season: "rabi",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Pulses",
    documentType: "package_of_practices",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2024
  },
  {
    id: "pjtsau-cotton-harvest-timing",
    source: "pjtsau",
    type: "guide",
    title: "PJTSAU Cotton picking and crop termination \u2014 Telangana mandatory calendar",
    summary: "Optimal boll opening picks, stub destruction by Dec 31, PBW prevention post-harvest.",
    content: `Picking: 3\u20134 pickings when bolls fully open; avoid mixing immature cotton.
Last picking: Before Dec 15 preferred; destroy crop by Dec 31 mandatory for PBW control.
Stub cutting: Plough immediately; no standing cotton into January.
Storage: Dry kapas to 8% moisture; protect from pink bollworm in godown with fumigation if needed.`,
    cropTags: ["cotton"],
    tags: ["harvest", "pink-bollworm", "Telangana"],
    season: "kharif",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Extension",
    documentType: "advisory",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2024
  },
  {
    id: "pjtsau-maize-rabi-warangal",
    source: "pjtsau",
    type: "guide",
    title: "PJTSAU Rabi maize \u2014 Warangal, Hanamkonda irrigated tracts",
    summary: "Rabi maize sowing Oct\u2013Nov, irrigation schedule, FAW monitoring in Telangana.",
    content: `Hybrids: DHM 117, PAC 751; sow Oct 15 \u2013 Nov 15.
Irrigation: 8\u201310 irrigations; critical at tasseling.
FAW: Same whorl management as kharif \u2014 do not ignore rabi FAW.
Fertilizer: DAP 50 kg + Urea 100 kg/acre in splits.
Harvest: 90\u2013100 days; dry grain to 14% for storage.`,
    cropTags: ["maize"],
    tags: ["rabi", "Warangal", "Telangana"],
    season: "rabi",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Agronomy",
    documentType: "package_of_practices",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2023
  },
  {
    id: "pjtsau-sweet-orange-tg",
    source: "pjtsau",
    type: "guide",
    title: "PJTSAU Sweet orange nutrition and psylla \u2014 Nalgonda citrus belt",
    summary: "Telangana citrus micronutrient calendar, psylla spray at flush, drip irrigation rates.",
    content: `Varieties: Banganapalli types, local sweet orange clones.
Zinc + Iron foliar at pre-monsoon and post-monsoon flush.
Psylla: Imidacloprid 60 ml/acre when new flush tender.
Drip: 50 L/tree/day summer; mulching with paddy husk.
Fruit drop: 2,4-D 10 ppm at pea size if excessive drop after stress.`,
    cropTags: ["citrus", "sweet-orange"],
    tags: ["psylla", "zinc", "Nalgonda", "Telangana"],
    state: "Telangana",
    publisher: "PJTSAU \u2014 Horticulture",
    documentType: "publication",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2024
  },
  {
    id: "pjtsau-fingermillet-ragi",
    source: "pjtsau",
    type: "guide",
    title: "PJTSAU Finger millet (ragi) \u2014 tribal and rainfed Telangana tracts",
    summary: "Ragi varieties, blast control, seed treatment for Adilabad, Bhadradri tribal areas.",
    content: `Varieties: GPU 28, VR 708 for TG hills.
Blast: Seed treat Tricyclazole 0.1%; spray Tricyclazole 120 g/acre at leaf blast stage.
Sowing: June with rains; 22\xD710 cm; 4 kg/acre seed.
Nutrition: Low input \u2014 FYM 2 t/acre + 20 kg urea/acre if soil poor.
Weed: Hand weed 20 and 40 DAS critical for yield.`,
    cropTags: ["ragi", "fingermillet"],
    tags: ["blast", "rainfed", "tribal", "Telangana"],
    season: "kharif",
    state: "Telangana",
    publisher: "PJTSAU \u2014 Millets",
    documentType: "package_of_practices",
    url: "https://pjtsau.edu.in/",
    publishedYear: 2023
  }
];

// src/ingestion/sources/publicationKnowledgeSource.ts
init_publicationTypes();
init_utils();
function invertAbstract(index22) {
  if (!index22) return "";
  const pairs = [];
  for (const [word, positions] of Object.entries(index22)) {
    for (const pos of positions) pairs.push([pos, word]);
  }
  pairs.sort((a, b) => a[0] - b[0]);
  return pairs.map((p) => p[1]).join(" ").slice(0, 2e3);
}
function icarGuidelinesToPublications() {
  return ICAR_GUIDELINES.map((g) => ({
    id: g.id,
    source: "icar",
    type: g.category === "disease" ? "disease" : g.category === "pest" ? "pest" : g.category === "fertilizer" ? "fertilizer" : "guide",
    title: g.title,
    titleTe: g.titleTe,
    summary: g.content.slice(0, 300),
    content: g.content,
    url: g.sourceUrl,
    cropTags: g.cropId ? [g.cropId] : [],
    tags: g.tags,
    season: g.season,
    state: g.region,
    publisher: "ICAR",
    documentType: "publication"
  }));
}
function doaAdvisoriesToPublications() {
  return DOA_ADVISORIES.map((a) => ({
    id: a.id,
    source: "gov_advisory",
    type: a.type === "advisory" ? "guide" : a.type === "fertilizer" ? "fertilizer" : a.type === "crop" ? "guide" : "general",
    title: a.title,
    titleTe: a.titleTe,
    summary: a.description.slice(0, 300),
    content: a.description,
    url: a.sourceUrl,
    cropTags: a.cropTags,
    tags: [a.type, a.source],
    season: a.season,
    state: a.state,
    publisher: a.source === "moa" ? "Ministry of Agriculture" : "Department of Agriculture",
    documentType: "advisory"
  }));
}
function allCuratedPublications() {
  return [
    ...ICAR_PUBLICATIONS,
    ...icarGuidelinesToPublications(),
    ...PJTSAU_PUBLICATIONS,
    ...ANGRAU_PUBLICATIONS,
    ...FAO_PUBLICATIONS,
    ...doaAdvisoriesToPublications()
  ];
}
async function upsertPublication(entry) {
  const priority = publicationPriority(entry.source);
  const type = entry.type === "guide" ? "guide" : entry.type;
  await db.insert(agKnowledge).values({
    type,
    title: entry.title.slice(0, 500),
    summary: entry.summary.slice(0, 800),
    content: entry.content,
    authors: entry.authors ?? [entry.publisher ?? entry.source],
    source: entry.source,
    externalId: entry.id,
    url: entry.url,
    tags: [...entry.tags ?? [], entry.documentType ?? "publication"],
    cropTags: entry.cropTags ?? [],
    publishedAt: entry.publishedYear ? /* @__PURE__ */ new Date(`${entry.publishedYear}-06-01`) : void 0,
    citationCount: 100 - priority,
    metadata: {
      priority,
      titleTe: entry.titleTe,
      season: entry.season,
      state: entry.state,
      publisher: entry.publisher,
      documentType: entry.documentType
    },
    syncedAt: /* @__PURE__ */ new Date()
  }).onConflictDoUpdate({
    target: [agKnowledge.source, agKnowledge.externalId],
    set: {
      title: import_drizzle_orm4.sql`excluded.title`,
      summary: import_drizzle_orm4.sql`excluded.summary`,
      content: import_drizzle_orm4.sql`excluded.content`,
      tags: import_drizzle_orm4.sql`excluded.tags`,
      cropTags: import_drizzle_orm4.sql`excluded.crop_tags`,
      citationCount: import_drizzle_orm4.sql`excluded.citation_count`,
      metadata: import_drizzle_orm4.sql`excluded.metadata`,
      syncedAt: /* @__PURE__ */ new Date()
    }
  });
}
async function syncCuratedPublications() {
  const entries = allCuratedPublications();
  let upserted = 0;
  for (const entry of entries) {
    await upsertPublication(entry);
    upserted++;
  }
  return { fetched: entries.length, upserted };
}
var UNIVERSITY_RESEARCH_SOURCES = [
  {
    institution: "Indian Council of Agricultural Research",
    source: "university_research",
    tag: "ICAR",
    queries: [
      "rice blast India",
      "cotton IPM India",
      "groundnut aflatoxin India"
    ]
  },
  {
    institution: "Acharya N G Ranga Agricultural University",
    source: "university_research",
    tag: "ANGRAU",
    queries: ["chilli thrips Andhra Pradesh", "groundnut tikka AP", "cotton pink bollworm AP"]
  },
  {
    institution: "Professor Jayashankar Telangana State Agricultural University",
    source: "university_research",
    tag: "PJTSAU",
    queries: ["redgram wilt Telangana", "cotton pink bollworm Telangana", "maize fall armyworm Telangana"]
  }
];
async function syncUniversityResearch(perQuery = 5) {
  let fetched = 0;
  let upserted = 0;
  for (const uni of UNIVERSITY_RESEARCH_SOURCES) {
    for (const query of uni.queries) {
      const searchText = `${query} ${uni.institution} India`;
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(searchText)}&filter=type:article&sort=cited_by_count:desc&per_page=${perQuery}`;
      try {
        const json = await fetchJson(url);
        const results = json.results ?? [];
        fetched += results.length;
        for (const work of results) {
          const title = work.title ?? work.display_name;
          const externalId = work.id?.replace("https://openalex.org/", "") ?? `${uni.tag}_${query.replace(/\s+/g, "_").slice(0, 40)}`;
          if (!title) continue;
          const abstract = invertAbstract(work.abstract_inverted_index);
          const authors = work.authorships?.map((a) => a.author?.display_name).filter(Boolean) ?? [];
          await db.insert(agKnowledge).values({
            type: "research",
            title: title.slice(0, 500),
            summary: abstract.slice(0, 800) || `${uni.tag} research: ${query}`,
            content: abstract,
            authors: authors.slice(0, 10),
            source: uni.source,
            externalId,
            url: work.doi ? `https://doi.org/${work.doi.replace("https://doi.org/", "")}` : work.id,
            tags: [uni.tag, "research", ...query.split(" ").slice(0, 4)],
            cropTags: extractCropTags(query),
            publishedAt: work.publication_year ? /* @__PURE__ */ new Date(`${work.publication_year}-01-01`) : void 0,
            citationCount: (work.cited_by_count ?? 0) + 50,
            metadata: {
              priority: publicationPriority(uni.source),
              institution: uni.institution,
              query,
              publisher: uni.tag
            },
            syncedAt: /* @__PURE__ */ new Date()
          }).onConflictDoUpdate({
            target: [agKnowledge.source, agKnowledge.externalId],
            set: {
              citationCount: import_drizzle_orm4.sql`excluded.citation_count`,
              summary: import_drizzle_orm4.sql`excluded.summary`,
              syncedAt: /* @__PURE__ */ new Date()
            }
          });
          upserted++;
        }
      } catch (err) {
        console.warn(`University research skip ${uni.tag}/${query}:`, err.message);
      }
      await sleep(600);
    }
  }
  return { fetched, upserted };
}
function extractCropTags(text19) {
  const crops2 = [
    "rice",
    "wheat",
    "cotton",
    "tomato",
    "maize",
    "soybean",
    "sugarcane",
    "chickpea",
    "groundnut",
    "chilli",
    "redgram",
    "sorghum",
    "mango"
  ];
  const lower = text19.toLowerCase();
  return crops2.filter((c) => lower.includes(c));
}
async function syncAllPublications() {
  const curated = await syncCuratedPublications();
  const research = await syncUniversityResearch();
  return { curated, research };
}

// src/ingestion/syncAll.ts
init_env();

// src/ingestion/sources/agmarknetSource.ts
var import_drizzle_orm5 = require("drizzle-orm");
init_env();
init_db();
init_schema();

// src/services/mandiCropMapping.ts
var CROP_MANDI_SEARCH_TERMS = {
  rice: ["Paddy(Dhan)(Common)", "Paddy", "Rice"],
  wheat: ["Wheat"],
  cotton: ["Cotton"],
  soybean: ["Soyabean", "Soybean"],
  tomato: ["Tomato"],
  sugarcane: ["Sugarcane"],
  maize: ["Maize"],
  chickpea: ["Bengal Gram(Gram)(Whole)", "Bengal Gram", "Gram"]
};
function commodityToCropId(commodity) {
  const text19 = commodity.toLowerCase().trim();
  if (!text19) return null;
  for (const [cropId, terms] of Object.entries(CROP_MANDI_SEARCH_TERMS)) {
    for (const term of terms) {
      const t = term.toLowerCase();
      const head = t.split("(")[0]?.trim() ?? t;
      if (text19.includes(head) || head.includes(text19.split("(")[0]?.trim() ?? text19)) {
        return cropId;
      }
    }
  }
  if (/paddy|dhan|\brice\b/.test(text19)) return "rice";
  if (/wheat/.test(text19)) return "wheat";
  if (/cotton/.test(text19)) return "cotton";
  if (/soy/.test(text19)) return "soybean";
  if (/tomato/.test(text19)) return "tomato";
  if (/sugarcane|ganna/.test(text19)) return "sugarcane";
  if (/maize|\bcorn\b/.test(text19)) return "maize";
  if (/gram|chickpea|bengal/.test(text19)) return "chickpea";
  return null;
}
function normalizeMandiCropId(cropId, commodity) {
  const fromCommodity = commodityToCropId(commodity);
  if (fromCommodity) return fromCommodity;
  if (cropId.startsWith("ag_")) {
    const fromSlug = commodityToCropId(cropId.replace(/^ag_/, "").replace(/_/g, " "));
    if (fromSlug) return fromSlug;
  }
  return cropId;
}

// src/ingestion/sources/agmarknetSource.ts
init_utils();
var DATA_GOV_RESOURCE = "35985678-0d79-46b4-9ed6-6f13308a1d24";
var PAGE_SIZE = 100;
var MAX_PAGES = 5;
function field(row, ...keys) {
  for (const k of keys) {
    const v = row[k] ?? row[k.toLowerCase()] ?? row[k.toUpperCase()];
    if (v) return v;
  }
  return void 0;
}
function parsePrice(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
async function resolveCropId(commodity) {
  const name = commodity.trim();
  const canonical = commodityToCropId(name);
  const id = canonical ?? slugId(name.split("(")[0] ?? name, "ag");
  await db.insert(crops).values({
    id,
    name: name.split("(")[0]?.trim() || name,
    source: "agmarknet",
    externalId: name,
    regionScope: "India",
    lastSyncedAt: /* @__PURE__ */ new Date()
  }).onConflictDoUpdate({
    target: crops.id,
    set: { lastSyncedAt: /* @__PURE__ */ new Date() }
  });
  return id;
}
async function syncAgmarknetMandi(options) {
  const apiKey = options?.apiKey ?? getDataGovApiKey();
  if (!apiKey) {
    throw new Error(
      "DATA_GOV_API_KEY missing \u2014 add to backend/.env or EXPO_PUBLIC_DATA_GOV_API_KEY in root .env"
    );
  }
  const state = options?.state ?? "Andhra Pradesh";
  let fetched = 0;
  let upserted = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * PAGE_SIZE;
    const url = `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE}?api-key=${apiKey}&format=json&limit=${PAGE_SIZE}&offset=${offset}&filters[state]=${encodeURIComponent(state)}`;
    const json = await fetchJson(url);
    const records = json.records ?? [];
    if (!records.length) break;
    fetched += records.length;
    for (const row of records) {
      const modal = parsePrice(field(row, "modal_price", "Modal_Price"));
      if (!modal) continue;
      const commodity = field(row, "commodity", "Commodity") ?? "Unknown";
      const varietyName = field(row, "variety", "Variety");
      const cropId = await resolveCropId(commodity);
      const varietyId = varietyName ? slugId(varietyName, "ag") : void 0;
      if (varietyName && varietyId) {
        await db.insert(cropVarieties).values({
          id: varietyId,
          cropId,
          name: varietyName,
          agmarknetNames: [varietyName],
          source: "agmarknet",
          externalId: varietyName,
          country: "India",
          isCurated: false,
          lastSyncedAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: cropVarieties.id,
          set: {
            name: import_drizzle_orm5.sql`excluded.name`,
            lastSyncedAt: /* @__PURE__ */ new Date()
          }
        });
      }
      const market = field(row, "market", "Market") ?? "APMC";
      const district = field(row, "district", "District") ?? "";
      const priceDate = parseAgmarknetDate(field(row, "arrival_date", "Arrival_Date"));
      await db.insert(mandiPrices).values({
        cropId,
        varietyId,
        varietyName: varietyName ?? void 0,
        commodity,
        market,
        district,
        state: field(row, "state", "State") ?? state,
        priceDate,
        minPrice: String(parsePrice(field(row, "min_price", "Min_Price")) || modal * 0.96),
        maxPrice: String(parsePrice(field(row, "max_price", "Max_Price")) || modal * 1.04),
        modalPrice: String(modal),
        unit: field(row, "unit", "Unit") ?? "Quintal",
        isLive: true,
        source: "agmarknet",
        fetchedAt: /* @__PURE__ */ new Date()
      }).onConflictDoUpdate({
        target: [
          mandiPrices.cropId,
          mandiPrices.varietyName,
          mandiPrices.market,
          mandiPrices.district,
          mandiPrices.state,
          mandiPrices.priceDate
        ],
        set: {
          modalPrice: import_drizzle_orm5.sql`excluded.modal_price`,
          minPrice: import_drizzle_orm5.sql`excluded.min_price`,
          maxPrice: import_drizzle_orm5.sql`excluded.max_price`,
          fetchedAt: /* @__PURE__ */ new Date()
        }
      });
      upserted++;
    }
    await sleep(300);
    if (records.length < PAGE_SIZE) break;
  }
  return { fetched, upserted };
}

// src/ingestion/sources/faoSource.ts
var import_drizzle_orm7 = require("drizzle-orm");
init_db();
init_schema();

// src/services/cropSearch.ts
var import_drizzle_orm6 = require("drizzle-orm");
init_db();
init_schema();
function buildCropSearchAliases(id, name, nameTe, localizedNames) {
  const aliases = /* @__PURE__ */ new Set();
  const add = (v) => {
    const t = v?.trim();
    if (t && t.length > 1) aliases.add(t.toLowerCase());
  };
  add(name);
  add(nameTe);
  add(id);
  for (const v of Object.values(localizedNames ?? {})) add(v);
  const extra = {
    rice: ["vari", "vri", "paddy", "dhan", "bhatt", "\u0C35\u0C30\u0C3F"],
    wheat: ["godhuma", "godum", "\u0C17\u0C4B\u0C27\u0C41\u0C2E"],
    cotton: ["patti", "patt", "\u0C2A\u0C24\u0C4D\u0C24\u0C3F"],
    maize: ["mokka jonna", "corn", "\u0C2E\u0C4A\u0C15\u0C4D\u0C15\u0C1C\u0C4A\u0C28\u0C4D\u0C28"],
    chilli: ["mirap", "mirchi", "\u0C2E\u0C3F\u0C30\u0C2A"],
    groundnut: ["verusenaga", "peanut", "\u0C35\u0C47\u0C30\u0C41\u0C36\u0C28\u0C17"],
    tomato: ["tamata", "tamato", "\u0C1F\u0C2E\u0C3E\u0C1F"],
    onion: ["ulli", "ullipaya", "\u0C09\u0C32\u0C4D\u0C32\u0C3F"],
    redgram: ["kandi", "tur", "arhar", "\u0C15\u0C02\u0C26\u0C3F"],
    greengram: ["pesara", "moong", "\u0C2A\u0C46\u0C38\u0C30"],
    blackgram: ["minumulu", "urad", "\u0C2E\u0C3F\u0C28\u0C41\u0C2Eulos"],
    chickpea: ["senaga", "chan", "\u0C36\u0C28\u0C17"],
    sugarcane: ["cheraku", "chekka", "\u0C1A\u0C46\u0C30\u0C15\u0C41"],
    turmeric: ["pasupu", "haldi", "\u0C2A\u0C38\u0C41\u0C2A\u0C41"]
  };
  for (const a of extra[id] ?? []) add(a);
  return [...aliases];
}
async function searchCropsDb(query, limit = 500) {
  const q = query?.trim();
  if (!q) {
    return db.select().from(crops).orderBy(crops.name).limit(limit);
  }
  const pattern = `%${q}%`;
  const aliasMatch = import_drizzle_orm6.sql`EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(COALESCE(${crops.searchAliases}, '[]'::jsonb)) AS alias
    WHERE alias ILIKE ${pattern}
  )`;
  const localizedMatch = import_drizzle_orm6.sql`EXISTS (
    SELECT 1 FROM jsonb_each_text(COALESCE(${crops.localizedNames}, '{}'::jsonb)) AS loc(key, val)
    WHERE val ILIKE ${pattern}
  )`;
  return db.select().from(crops).where(
    (0, import_drizzle_orm6.or)(
      (0, import_drizzle_orm6.ilike)(crops.name, pattern),
      (0, import_drizzle_orm6.ilike)(crops.nameTe, pattern),
      (0, import_drizzle_orm6.ilike)(crops.id, pattern),
      (0, import_drizzle_orm6.ilike)(crops.category, pattern),
      (0, import_drizzle_orm6.ilike)(crops.description, pattern),
      aliasMatch,
      localizedMatch
    )
  ).orderBy(crops.name).limit(limit);
}
async function getCropByIdDb(cropId) {
  const [row] = await db.select().from(crops).where((0, import_drizzle_orm6.eq)(crops.id, cropId)).limit(1);
  return row ?? null;
}
async function countCropsDb() {
  const [row] = await db.select({ count: import_drizzle_orm6.sql`count(*)::int` }).from(crops);
  return row?.count ?? 0;
}

// src/ingestion/sources/faoSource.ts
init_utils();
var FAO_BASES = [
  "https://faostatservices.fao.org/api/v1",
  "https://fenixservices.fao.org/faostat/api/v1"
];
async function fetchFaoItems(datasource) {
  let lastError = null;
  for (const base of FAO_BASES) {
    const url = `${base}/en/definitions/types/item?datasource=${datasource}`;
    try {
      const json = await fetchJson(url);
      if (json.data?.length) return json.data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      await sleep(1500);
    }
  }
  throw lastError ?? new Error(`FAO ${datasource} returned no data`);
}
async function fetchGbifCropSpecies(limit) {
  const terms = [
    "Oryza sativa",
    "Triticum aestivum",
    "Zea mays",
    "Gossypium",
    "Solanum lycopersicum",
    "Glycine max",
    "Saccharum",
    "Cicer arietinum",
    "Arachis hypogaea",
    "Brassica",
    "Helianthus annuus",
    "Hordeum vulgare",
    "Sorghum bicolor",
    "Pennisetum glaucum",
    "Cocos nucifera"
  ];
  const rows = [];
  const seen = /* @__PURE__ */ new Set();
  for (const term of terms) {
    if (rows.length >= limit) break;
    const url = `https://api.gbif.org/v1/species/search?q=${encodeURIComponent(term)}&rank=SPECIES&limit=20`;
    try {
      const json = await fetchJson(url);
      for (const r of json.results ?? []) {
        const name = r.canonicalName ?? r.scientificName;
        if (!name || seen.has(name)) continue;
        seen.add(name);
        rows.push({
          "Item Code": String(r.key ?? name),
          Item: name,
          Domain: "crop",
          "Item Description": `GBIF \u2014 ${term}`
        });
      }
      await sleep(200);
    } catch {
    }
  }
  return rows;
}
async function resolveCropRows(limit) {
  try {
    const rows = await fetchFaoItems("QCL");
    return { rows, source: "fao" };
  } catch (faoErr) {
    console.warn("FAO unavailable, falling back to GBIF Plantae catalog:", faoErr.message);
    const rows = await fetchGbifCropSpecies(limit);
    return { rows, source: "gbif" };
  }
}
async function syncFaoCrops(limit = 500) {
  const { rows, source } = await resolveCropRows(limit);
  let upserted = 0;
  for (const row of rows.slice(0, limit)) {
    const externalId = String(row["Item Code"] ?? row["Item Code (FAO)"] ?? "");
    const name = row.Item?.trim();
    if (!externalId || !name) continue;
    const description = row["Item Description"]?.trim() ?? "";
    const id = slugId(name, source === "gbif" ? "gbif" : "fao");
    const aliases = buildCropSearchAliases(id, name, null);
    await db.insert(crops).values({
      id,
      name,
      description: description || void 0,
      category: row.Domain ?? "crop",
      searchAliases: aliases,
      metadata: { faoDescription: description, domain: row.Domain },
      source,
      externalId,
      regionScope: "global",
      lastSyncedAt: /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: crops.id,
      set: {
        name: import_drizzle_orm7.sql`excluded.name`,
        description: import_drizzle_orm7.sql`COALESCE(excluded.description, ${crops.description})`,
        category: import_drizzle_orm7.sql`COALESCE(excluded.category, ${crops.category})`,
        metadata: import_drizzle_orm7.sql`COALESCE(${crops.metadata}, '{}'::jsonb) || excluded.metadata`,
        externalId: import_drizzle_orm7.sql`excluded.external_id`,
        source: import_drizzle_orm7.sql`excluded.source`,
        lastSyncedAt: /* @__PURE__ */ new Date()
      },
      setWhere: import_drizzle_orm7.sql`${crops.source} != 'bhuvedam'`
    });
    upserted++;
    if (upserted % 50 === 0) await sleep(100);
  }
  return { fetched: rows.length, upserted };
}
async function syncFaoFertilizers(limit = 200) {
  let rows = [];
  try {
    rows = await fetchFaoItems("RFN");
  } catch {
    console.warn("FAO RFN unavailable \u2014 skipping fertilizer sync this run");
    return { fetched: 0, upserted: 0 };
  }
  const { agrochemicals: agrochemicals2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  let upserted = 0;
  for (const row of rows.slice(0, limit)) {
    const name = row.Item?.trim();
    const externalId = String(row["Item Code"] ?? "");
    if (!name || !externalId) continue;
    await db.insert(agrochemicals2).values({
      type: "fertilizer",
      name,
      source: "fao",
      externalId,
      country: "global",
      metadata: { description: row["Item Description"] ?? "" },
      lastSyncedAt: /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: [agrochemicals2.source, agrochemicals2.externalId],
      set: { name: import_drizzle_orm7.sql`excluded.name`, lastSyncedAt: /* @__PURE__ */ new Date() }
    });
    upserted++;
  }
  return { fetched: rows.length, upserted };
}

// src/ingestion/seedBhuvedamCrops.ts
var import_dotenv2 = require("dotenv");
init_db();
init_schema();

// src/data/crops.catalog.json
var crops_catalog_default = [
  {
    id: "rice",
    name: "Rice",
    nameTe: "\u0C35\u0C30\u0C3F",
    category: "cereal",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D (\u0C1C\u0C42\u0C28\u2013\u0C1C\u0C41\u0C32\u0C48)",
    icon: "grain",
    color: "#66BB6A",
    sowingPeriod: "June \u2013 July (transplant)",
    harvestPeriod: "October \u2013 November",
    waterNeeds: "High \u2014 standing water 5\u201310 cm",
    soilType: "Clay loam with good water retention",
    tips: [
      "Maintain 5 cm water level during active growth",
      "Apply NPK at tillering and panicle initiation",
      "Harvest when 80% grains turn golden yellow"
    ]
  },
  {
    id: "wheat",
    name: "Wheat",
    nameTe: "\u0C17\u0C4B\u0C27\u0C41\u0C2E",
    category: "cereal",
    season: "rabi",
    seasonLabel: "\u0C30\u0C2C\u0C40 (\u0C05\u0C15\u0C4D\u0C1F\u0C4B\u2013\u0C28\u0C35)",
    icon: "barley",
    color: "#F9A825",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "March \u2013 April",
    waterNeeds: "Moderate \u2014 4\u20136 irrigations",
    soilType: "Loamy, well-drained (pH 6\u20137.5)",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "maize",
    name: "Maize",
    nameTe: "\u0C2E\u0C4A\u0C15\u0C4D\u0C15\u0C1C\u0C4A\u0C28\u0C4D\u0C28",
    category: "cereal",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D",
    icon: "corn",
    color: "#FFB300",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "September \u2013 October",
    waterNeeds: "Moderate",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "jowar",
    name: "Jowar",
    nameTe: "\u0C1C\u0C4A\u0C28\u0C4D\u0C28",
    category: "cereal",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D / \u0C30\u0C2C\u0C40",
    icon: "grain",
    color: "#BCAAA4",
    sowingPeriod: "June \u2013 July or Oct \u2013 Nov",
    harvestPeriod: "90\u2013110 days",
    waterNeeds: "Low to moderate",
    soilType: "Black & red soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "bajra",
    name: "Bajra",
    nameTe: "\u0C38\u0C1C\u0C4D\u0C1C",
    category: "cereal",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D",
    icon: "grain",
    color: "#A1887F",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "80\u201390 days",
    waterNeeds: "Low \u2014 drought tolerant",
    soilType: "Sandy loam to black soil",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "ragi",
    name: "Ragi",
    nameTe: "\u0C30\u0C3E\u0C17\u0C3F",
    category: "cereal",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D / \u0C30abi",
    icon: "grain",
    color: "#8D6E63",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "110\u2013120 days",
    waterNeeds: "Moderate",
    soilType: "Red & sandy loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "korra",
    name: "Foxtail millet",
    nameTe: "\u0C15\u0C4A\u0C30\u0C4D\u0C30",
    category: "cereal",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D",
    icon: "grain",
    color: "#D4A574",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "80\u201390 days",
    waterNeeds: "Low",
    soilType: "Well-drained soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "barley",
    name: "Barley",
    nameTe: "\u0C2C\u0C3E\u0C30\u0C4D\u0C32\u0C40",
    category: "cereal",
    season: "rabi",
    seasonLabel: "\u0C30\u0C2C\u0C40",
    icon: "barley",
    color: "#FFE082",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "March \u2013 April",
    waterNeeds: "Moderate",
    soilType: "Loamy soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "redgram",
    name: "Red gram",
    nameTe: "\u0C15\u0C02\u0C26\u0C3F / \u0C2A\u0C2A\u0C4D\u0C2A\u0C41",
    category: "pulse",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D",
    icon: "seed",
    color: "#C62828",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "December \u2013 January",
    waterNeeds: "Moderate",
    soilType: "Black cotton & red soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "greengram",
    name: "Green gram",
    nameTe: "\u0C2A\u0C46\u0C38\u0C30",
    category: "pulse",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D / \u0C30abi",
    icon: "seed",
    color: "#7CB342",
    sowingPeriod: "June \u2013 July or Feb",
    harvestPeriod: "60\u201370 days",
    waterNeeds: "Low to moderate",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "blackgram",
    name: "Black gram",
    nameTe: "\u0C2E\u0C3F\u0C28\u0C41\u0C2E\u0C41\u0C32\u0C41",
    category: "pulse",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D / \u0C30abi",
    icon: "seed",
    color: "#424242",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "70\u201380 days",
    waterNeeds: "Moderate",
    soilType: "Black & clay loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "chickpea",
    name: "Chickpea",
    nameTe: "\u0C36\u0C28\u0C17 / \u0C1A\u0C28",
    category: "pulse",
    season: "rabi",
    seasonLabel: "\u0C30\u0C2C\u0C40",
    icon: "leaf",
    color: "#A1887F",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "February \u2013 March",
    waterNeeds: "Low",
    soilType: "Black or red soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "horsegram",
    name: "Horse gram",
    nameTe: "\u0C09\u0C32\u0C35",
    category: "pulse",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D",
    icon: "seed",
    color: "#795548",
    sowingPeriod: "August \u2013 September",
    harvestPeriod: "90 days",
    waterNeeds: "Low",
    soilType: "Red & marginal soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "cowpea",
    name: "Cowpea",
    nameTe: "\u0C05\u0C32\u0C38\u0C02\u0C26",
    category: "pulse",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D",
    icon: "seed",
    color: "#8BC34A",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "70\u201380 days",
    waterNeeds: "Low",
    soilType: "Sandy loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "lentil",
    name: "Lentil",
    nameTe: "\u0C2E\u0C38\u0C42\u0C30\u0C4D \u0C2A\u0C2A\u0C4D\u0C2A\u0C41",
    category: "pulse",
    season: "rabi",
    seasonLabel: "\u0C30\u0C2C\u0C40",
    icon: "seed",
    color: "#FF8F00",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "February \u2013 March",
    waterNeeds: "Low",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "groundnut",
    name: "Groundnut",
    nameTe: "\u0C35\u0C47\u0C30\u0C41\u0C36\u0C28\u0C17",
    category: "oilseed",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D / \u0C30abi",
    icon: "seed",
    color: "#D84315",
    sowingPeriod: "June \u2013 July or Dec \u2013 Jan",
    harvestPeriod: "110\u2013120 days",
    waterNeeds: "Moderate",
    soilType: "Sandy loam & red soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "sunflower",
    name: "Sunflower",
    nameTe: "\u0C2A\u0C41\u0C35\u0C4D\u0C35\u0C41 \u0C17\u0C3F\u0C02\u0C1C",
    category: "oilseed",
    season: "rabi",
    seasonLabel: "\u0C30abi / summer",
    icon: "flower",
    color: "#FDD835",
    sowingPeriod: "October \u2013 February",
    harvestPeriod: "90\u2013100 days",
    waterNeeds: "Moderate",
    soilType: "Black & red soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "safflower",
    name: "Safflower",
    nameTe: "\u0C15\u0C41\u0C38\u0C41\u0C2E",
    category: "oilseed",
    season: "rabi",
    seasonLabel: "\u0C30abi",
    icon: "flower",
    color: "#FF7043",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "120 days",
    waterNeeds: "Low",
    soilType: "Deep black soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "sesame",
    name: "Sesame",
    nameTe: "\u0C28\u0C41\u0C35\u0C4D\u0C35ulu",
    category: "oilseed",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D / summer",
    icon: "seed",
    color: "#FFF176",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "90 days",
    waterNeeds: "Low to moderate",
    soilType: "Well-drained soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "castor",
    name: "Castor",
    nameTe: "\u0C06\u0C2Eudamu",
    category: "oilseed",
    season: "kharif",
    seasonLabel: "year-round",
    icon: "seed",
    color: "#7E57C2",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "150+ days",
    waterNeeds: "Moderate",
    soilType: "Red & black soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "soybean",
    name: "Soybean",
    nameTe: "\u0C38\u0C4B\u0C2F\u0C3E",
    category: "oilseed",
    season: "kharif",
    seasonLabel: "\u0C16\u0C30\u0C40\u0C2B\u0C4D",
    icon: "seed",
    color: "#8D6E63",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "September \u2013 October",
    waterNeeds: "Moderate",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "mustard",
    name: "Mustard",
    nameTe: "\u0C06\u0C35alu",
    category: "oilseed",
    season: "rabi",
    seasonLabel: "\u0C30abi",
    icon: "flower",
    color: "#FFEB3B",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "February \u2013 March",
    waterNeeds: "Moderate",
    soilType: "Loamy soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "niger",
    name: "Niger",
    nameTe: "\u0C35\u0C46\u0C30\u0C4D\u0C30\u0C3F \u0C28\u0C41\u0C35vulu",
    category: "oilseed",
    season: "kharif",
    seasonLabel: "\u0C16harif",
    icon: "seed",
    color: "#616161",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "100\u2013110 days",
    waterNeeds: "Moderate",
    soilType: "Marginal & hill soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "cotton",
    name: "Cotton",
    nameTe: "\u0C2A\u0C24\u0C4D\u0C24\u0C3F",
    category: "commercial",
    season: "kharif",
    seasonLabel: "\u0C16harif",
    icon: "flower",
    color: "#7986CB",
    sowingPeriod: "May \u2013 June",
    harvestPeriod: "October \u2013 January",
    waterNeeds: "Moderate",
    soilType: "Black cotton soil",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "chilli",
    name: "Chilli",
    nameTe: "\u0C2E\u0C3F\u0C30\u0C2A",
    category: "commercial",
    season: "year-round",
    seasonLabel: "year-round",
    icon: "fruit-cherries",
    color: "#E53935",
    sowingPeriod: "June \u2013 July / Oct \u2013 Nov",
    harvestPeriod: "90\u2013120 days",
    waterNeeds: "Moderate \u2014 drip ideal",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "tobacco",
    name: "Tobacco",
    nameTe: "\u0C2A\u0C4A\u0C17\u0C3E\u0C15u",
    category: "commercial",
    season: "rabi",
    seasonLabel: "\u0C30abi / summer",
    icon: "leaf",
    color: "#8D6E63",
    sowingPeriod: "October \u2013 December",
    harvestPeriod: "100\u2013120 days",
    waterNeeds: "Moderate",
    soilType: "Light sandy loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "turmeric",
    name: "Turmeric",
    nameTe: "\u0C2A\u0C38\u0C41\u0C2A\u0C41",
    category: "commercial",
    season: "year-round",
    seasonLabel: "June planting",
    icon: "leaf",
    color: "#FF8F00",
    sowingPeriod: "May \u2013 June",
    harvestPeriod: "8\u20139 months",
    waterNeeds: "Moderate to high",
    soilType: "Red loam & well-drained",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    nameTe: "\u0C1A\u0C46\u0C30\u0C15\u0C41",
    category: "commercial",
    season: "year-round",
    seasonLabel: "year-round",
    icon: "grass",
    color: "#7CB342",
    sowingPeriod: "Oct \u2013 Nov / Feb \u2013 Mar",
    harvestPeriod: "10\u201312 months",
    waterNeeds: "Very high",
    soilType: "Deep fertile loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "tomato",
    name: "Tomato",
    nameTe: "\u0C1F\u0C2E\u0C3E\u0C1F",
    category: "vegetable",
    season: "year-round",
    seasonLabel: "year-round",
    icon: "fruit-cherries",
    color: "#E53935",
    sowingPeriod: "Nursery then transplant",
    harvestPeriod: "60\u201380 days",
    waterNeeds: "Regular \u2014 drip ideal",
    soilType: "Sandy loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "onion",
    name: "Onion",
    nameTe: "\u0C09\u0C32\u0C4D\u0C32\u0C3F",
    category: "vegetable",
    season: "rabi",
    seasonLabel: "\u0C30abi / summer",
    icon: "leaf",
    color: "#CE93D8",
    sowingPeriod: "October \u2013 December",
    harvestPeriod: "120\u2013130 days",
    waterNeeds: "Moderate",
    soilType: "Red loam & sandy loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "potato",
    name: "Potato",
    nameTe: "\u0C2C\u0C02\u0C17\u0C3E\u0C33\u0C3E\u0C26\u0C41\u0C02\u0C2A",
    category: "vegetable",
    season: "rabi",
    seasonLabel: "\u0C30abi",
    icon: "leaf",
    color: "#BCAAA4",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "90\u2013100 days",
    waterNeeds: "Moderate",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "brinjal",
    name: "Brinjal",
    nameTe: "\u0C35\u0C02\u0C15\u0C3E\u0C2F",
    category: "vegetable",
    season: "year-round",
    seasonLabel: "year-round",
    icon: "fruit-cherries",
    color: "#7E57C2",
    sowingPeriod: "Nursery transplant",
    harvestPeriod: "80\u2013100 days",
    waterNeeds: "Moderate",
    soilType: "Loamy soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "okra",
    name: "Okra",
    nameTe: "\u0C2C\u0C46\u0C02\u0C21\u0C15\u0C3E\u0C2F",
    category: "vegetable",
    season: "year-round",
    seasonLabel: "summer / kharif",
    icon: "leaf",
    color: "#66BB6A",
    sowingPeriod: "Feb \u2013 July",
    harvestPeriod: "45\u201360 days",
    waterNeeds: "Moderate",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "cabbage",
    name: "Cabbage",
    nameTe: "\u0C15o\u015Bu",
    category: "vegetable",
    season: "rabi",
    seasonLabel: "\u0C30abi",
    icon: "leaf",
    color: "#AED581",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "90 days",
    waterNeeds: "Moderate",
    soilType: "Cool season \u2014 loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "cauliflower",
    name: "Cauliflower",
    nameTe: "\u0C2Bl\u014D\u0C30\u012Bk\u014D\u1E63",
    category: "vegetable",
    season: "rabi",
    seasonLabel: "\u0C30abi",
    icon: "leaf",
    color: "#E0E0E0",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "90\u2013100 days",
    waterNeeds: "Moderate",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "beans",
    name: "Beans",
    nameTe: "\u0C1A\u0C3F\u0C15\u0C4D\u0C15\u0C41\u0C21\u0C41",
    category: "vegetable",
    season: "year-round",
    seasonLabel: "year-round",
    icon: "seed",
    color: "#81C784",
    sowingPeriod: "June \u2013 July / Oct",
    harvestPeriod: "60\u201370 days",
    waterNeeds: "Moderate",
    soilType: "Loamy soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "cucumber",
    name: "Cucumber",
    nameTe: "\u0C26osak\u0101ya",
    category: "vegetable",
    season: "year-round",
    seasonLabel: "summer",
    icon: "leaf",
    color: "#A5D6A7",
    sowingPeriod: "Jan \u2013 July",
    harvestPeriod: "50\u201360 days",
    waterNeeds: "Moderate",
    soilType: "Sandy loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "bottlegourd",
    name: "Bottle gourd",
    nameTe: "\u0C38\u0C4A\u0C30\u0C15\u0C3E\u0C2F",
    category: "vegetable",
    season: "year-round",
    seasonLabel: "summer / kharif",
    icon: "leaf",
    color: "#C5E1A5",
    sowingPeriod: "Feb \u2013 July",
    harvestPeriod: "60 days",
    waterNeeds: "Moderate",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "bittergourd",
    name: "Bitter gourd",
    nameTe: "\u0C15\u0C3E\u0C15\u0C30\u0C15\u0C3E\u0C2F",
    category: "vegetable",
    season: "year-round",
    seasonLabel: "summer",
    icon: "leaf",
    color: "#558B2F",
    sowingPeriod: "Feb \u2013 July",
    harvestPeriod: "60 days",
    waterNeeds: "Moderate",
    soilType: "Loamy soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "ridgegourd",
    name: "Ridge gourd",
    nameTe: "\u0C2C\u0C40\u0C30\u0C15\u0C3E\u0C2F",
    category: "vegetable",
    season: "year-round",
    seasonLabel: "summer",
    icon: "leaf",
    color: "#689F38",
    sowingPeriod: "Feb \u2013 July",
    harvestPeriod: "60 days",
    waterNeeds: "Moderate",
    soilType: "Loamy soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "pumpkin",
    name: "Pumpkin",
    nameTe: "\u0C17\u0C41\u0C2E\u0C4D\u0C2E\u0C21\u0C3F\u0C15\u0C3E\u0C2F",
    category: "vegetable",
    season: "year-round",
    seasonLabel: "summer",
    icon: "leaf",
    color: "#FF9800",
    sowingPeriod: "Feb \u2013 July",
    harvestPeriod: "90 days",
    waterNeeds: "Moderate",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "carrot",
    name: "Carrot",
    nameTe: "\u0C15\u0C4D\u0C2F\u0C3E\u0C30\u0C1F\u0C4D",
    category: "vegetable",
    season: "rabi",
    seasonLabel: "\u0C30abi",
    icon: "leaf",
    color: "#FF5722",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "90 days",
    waterNeeds: "Moderate",
    soilType: "Sandy loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "beetroot",
    name: "Beetroot",
    nameTe: "\u0C2C\u0C40\u0C1F\u0C4D\u0C30\u0C42\u0C1F\u0C4D",
    category: "vegetable",
    season: "rabi",
    seasonLabel: "\u0C30abi",
    icon: "leaf",
    color: "#AD1457",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "60\u201370 days",
    waterNeeds: "Moderate",
    soilType: "Loamy soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "spinach",
    name: "Spinach",
    nameTe: "\u0C2A\u0C3E\u0C32\u0C15\u0C42\u0C30",
    category: "vegetable",
    season: "year-round",
    seasonLabel: "year-round",
    icon: "leaf",
    color: "#2E7D32",
    sowingPeriod: "Year-round",
    harvestPeriod: "30\u201340 days",
    waterNeeds: "Moderate",
    soilType: "Loamy soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "drumstick",
    name: "Drumstick",
    nameTe: "\u0C2E\u0C41\u0C28\u0C17\u0C3E\u0C15\u0C41",
    category: "vegetable",
    season: "year-round",
    seasonLabel: "year-round",
    icon: "leaf",
    color: "#33691E",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "Perennial",
    waterNeeds: "Low to moderate",
    soilType: "Red & sandy loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "mango",
    name: "Mango",
    nameTe: "\u0C2E\u0C3E\u0C2E\u0C3F\u0C21\u0C3F",
    category: "fruit",
    season: "year-round",
    seasonLabel: "orchard",
    icon: "fruit-cherries",
    color: "#FFB300",
    sowingPeriod: "June \u2013 July planting",
    harvestPeriod: "April \u2013 June",
    waterNeeds: "Moderate",
    soilType: "Deep loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "banana",
    name: "Banana",
    nameTe: "\u0C05\u0C30\u0C1F\u0C3F",
    category: "fruit",
    season: "year-round",
    seasonLabel: "year-round",
    icon: "fruit-cherries",
    color: "#FFEB3B",
    sowingPeriod: "Year-round",
    harvestPeriod: "12\u201315 months",
    waterNeeds: "High",
    soilType: "Rich loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "papaya",
    name: "Papaya",
    nameTe: "\u0C2C\u0C4A\u0C2A\u0C4D\u0C2A\u0C3E\u0C2F\u0C3F",
    category: "fruit",
    season: "year-round",
    seasonLabel: "year-round",
    icon: "fruit-cherries",
    color: "#FFA726",
    sowingPeriod: "Year-round",
    harvestPeriod: "8\u201310 months",
    waterNeeds: "Moderate",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "watermelon",
    name: "Watermelon",
    nameTe: "\u0C2A\u0C41\u0C1A\u0C4D\u0C1A\u0C15\u0C3E\u0C2F",
    category: "fruit",
    season: "year-round",
    seasonLabel: "summer",
    icon: "fruit-cherries",
    color: "#EF5350",
    sowingPeriod: "Jan \u2013 March",
    harvestPeriod: "90 days",
    waterNeeds: "Moderate",
    soilType: "Sandy loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "muskmelon",
    name: "Muskmelon",
    nameTe: "\u0C16\u0C30\u0C4D\u0C2C\u0C42\u0C1C",
    category: "fruit",
    season: "year-round",
    seasonLabel: "summer",
    icon: "fruit-cherries",
    color: "#FFCC80",
    sowingPeriod: "Jan \u2013 March",
    harvestPeriod: "90 days",
    waterNeeds: "Moderate",
    soilType: "Sandy loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "citrus",
    name: "Citrus",
    nameTe: "\u0C28\u0C3F\u0C2E\u0C4D\u0C2E / \u0C28\u0C3E\u0C30\u0C3F\u0C02\u0C1C",
    category: "fruit",
    season: "year-round",
    seasonLabel: "orchard",
    icon: "fruit-cherries",
    color: "#FB8C00",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "Nov \u2013 Feb",
    waterNeeds: "Moderate",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "pomegranate",
    name: "Pomegranate",
    nameTe: "\u0C26\u0C3E\u0C28\u0C3F\u0C2E\u0C4D\u0C2E",
    category: "fruit",
    season: "year-round",
    seasonLabel: "orchard",
    icon: "fruit-cherries",
    color: "#C62828",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "July \u2013 August",
    waterNeeds: "Moderate",
    soilType: "Loamy soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "guava",
    name: "Guava",
    nameTe: "\u0C1C\u0C3E\u0C2E",
    category: "fruit",
    season: "year-round",
    seasonLabel: "orchard",
    icon: "fruit-cherries",
    color: "#66BB6A",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "Year-round bearing",
    waterNeeds: "Moderate",
    soilType: "Well-drained soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "sapota",
    name: "Sapota",
    nameTe: "\u0C38\u0C2A\u0C4B\u0C1F\u0C3E",
    category: "fruit",
    season: "year-round",
    seasonLabel: "orchard",
    icon: "fruit-cherries",
    color: "#6D4C41",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "Feb \u2013 May",
    waterNeeds: "Moderate",
    soilType: "Deep loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "grapes",
    name: "Grapes",
    nameTe: "\u0C26\u0C4D\u0C30\u0C3E\u0C15\u0C4D\u0C37",
    category: "fruit",
    season: "year-round",
    seasonLabel: "orchard",
    icon: "fruit-cherries",
    color: "#7B1FA2",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "Feb \u2013 April",
    waterNeeds: "Moderate \u2014 drip",
    soilType: "Well-drained loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "coconut",
    name: "Coconut",
    nameTe: "\u0C15\u0C4A\u0C2C\u0C4D\u0C2C\u0C30\u0C3F",
    category: "fruit",
    season: "year-round",
    seasonLabel: "coastal",
    icon: "fruit-cherries",
    color: "#795548",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "Year-round",
    waterNeeds: "High",
    soilType: "Coastal sandy loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "coriander",
    name: "Coriander",
    nameTe: "\u0C27\u0C28\u0C3F\u0C2F\u0C3E\u0C32\u0C41",
    category: "spice",
    season: "rabi",
    seasonLabel: "\u0C30abi",
    icon: "leaf",
    color: "#81C784",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "90 days",
    waterNeeds: "Moderate",
    soilType: "Loamy soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "cumin",
    name: "Cumin",
    nameTe: "\u0C1C\u0C40\u0C32\u0C15\u0C30\u0C4D\u0C30",
    category: "spice",
    season: "rabi",
    seasonLabel: "\u0C30abi",
    icon: "seed",
    color: "#BCAAA4",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "110 days",
    waterNeeds: "Low",
    soilType: "Sandy loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "fenugreek",
    name: "Fenugreek",
    nameTe: "\u0C2E\u0C46\u0C02\u0C24\u0C41\u0C32\u0C41",
    category: "spice",
    season: "rabi",
    seasonLabel: "\u0C30abi",
    icon: "seed",
    color: "#FFD54F",
    sowingPeriod: "October \u2013 November",
    harvestPeriod: "90 days",
    waterNeeds: "Moderate",
    soilType: "Loamy soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "cashew",
    name: "Cashew",
    nameTe: "\u0C1C\u0C40\u0C21\u0C3F\u0C2Aappu",
    category: "other",
    season: "year-round",
    seasonLabel: "orchard",
    icon: "seed",
    color: "#FFAB91",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "March \u2013 May",
    waterNeeds: "Low to moderate",
    soilType: "Red & sandy soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "arecanut",
    name: "Arecanut",
    nameTe: "\u0C2A\u0C15ka chekka",
    category: "other",
    season: "year-round",
    seasonLabel: "orchard",
    icon: "seed",
    color: "#8D6E63",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "Year-round",
    waterNeeds: "High",
    soilType: "Well-drained red loam",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  },
  {
    id: "tamarind",
    name: "Tamarind",
    nameTe: "\u0C1Aintapandu",
    category: "other",
    season: "year-round",
    seasonLabel: "orchard",
    icon: "leaf",
    color: "#5D4037",
    sowingPeriod: "June \u2013 July",
    harvestPeriod: "March \u2013 April",
    waterNeeds: "Low",
    soilType: "Deep red soils",
    tips: [
      "Local agriculture officer suggestions follow avvandi",
      "Certified seeds use cheyandi",
      "Weather batti neeti / spray schedule adjust cheyandi"
    ]
  }
];

// src/ingestion/seedBhuvedamCrops.ts
(0, import_dotenv2.config)({ path: ".env" });
var catalog = crops_catalog_default;
async function seedBhuvedamCrops() {
  console.log(`Seeding ${catalog.length} Bhuvedam crops into Neon...`);
  for (const crop of catalog) {
    const aliases = buildCropSearchAliases(crop.id, crop.name, crop.nameTe, { te: crop.nameTe });
    const localizedNames = { te: crop.nameTe, en: crop.name };
    await db.insert(crops).values({
      id: crop.id,
      name: crop.name,
      nameTe: crop.nameTe,
      season: crop.season,
      seasonLabel: crop.seasonLabel,
      category: crop.category,
      sowingPeriod: crop.sowingPeriod,
      harvestPeriod: crop.harvestPeriod,
      waterNeeds: crop.waterNeeds,
      soilType: crop.soilType,
      tips: crop.tips ?? [],
      searchAliases: aliases,
      localizedNames,
      icon: crop.icon,
      color: crop.color,
      source: "bhuvedam",
      regionScope: "ap-telangana",
      lastSyncedAt: /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: crops.id,
      set: {
        name: crop.name,
        nameTe: crop.nameTe,
        season: crop.season,
        seasonLabel: crop.seasonLabel,
        category: crop.category,
        sowingPeriod: crop.sowingPeriod,
        harvestPeriod: crop.harvestPeriod,
        waterNeeds: crop.waterNeeds,
        soilType: crop.soilType,
        tips: crop.tips ?? [],
        searchAliases: aliases,
        localizedNames,
        icon: crop.icon,
        color: crop.color,
        source: "bhuvedam",
        regionScope: "ap-telangana",
        lastSyncedAt: /* @__PURE__ */ new Date()
      }
    });
  }
  console.log(`\u2713 Seeded ${catalog.length} crops with Telugu + English search aliases`);
  return catalog.length;
}
var isDirectRun = process.argv[1]?.includes("seedBhuvedamCrops");
if (isDirectRun) {
  seedBhuvedamCrops().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

// src/ingestion/sources/openMeteoSource.ts
init_db();
init_schema();
init_utils();
function weatherCodeToCondition(code) {
  if (code == null) return "clear";
  if (code <= 1) return "clear";
  if (code <= 3) return "partlyCloudy";
  if (code <= 48) return "cloudy";
  return "rain";
}
async function syncWeatherAtPoint(lat, lon, locationName) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code&hourly=temperature_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
  try {
    const json = await fetchJson(url);
    const c = json.current;
    await db.insert(weather).values({
      locationName,
      latitude: String(lat),
      longitude: String(lon),
      temperature: c?.temperature_2m != null ? String(c.temperature_2m) : void 0,
      feelsLike: c?.apparent_temperature != null ? String(c.apparent_temperature) : void 0,
      condition: weatherCodeToCondition(c?.weather_code),
      humidity: c?.relative_humidity_2m ?? void 0,
      windSpeed: c?.wind_speed_10m != null ? String(c.wind_speed_10m) : void 0,
      pressure: c?.surface_pressure != null ? String(c.surface_pressure) : void 0,
      precipitation: c?.precipitation != null ? Math.round(c.precipitation) : void 0,
      hourly: [json.hourly ?? {}],
      daily: [json.daily ?? {}],
      agricultureTip: "Synced from Open-Meteo \u2014 use for irrigation & spray timing."
    });
    return true;
  } catch {
    return false;
  }
}
async function syncGlobalWeather() {
  const locations = [
    [17.38, 78.48, "Hyderabad, India"],
    [28.61, 77.21, "Delhi, India"],
    [19.08, 72.88, "Mumbai, India"],
    [13.08, 80.27, "Chennai, India"],
    [-23.55, -46.63, "S\xE3o Paulo, Brazil"],
    [41.88, -87.63, "Chicago, USA"]
  ];
  let upserted = 0;
  for (const [lat, lon, name] of locations) {
    if (await syncWeatherAtPoint(lat, lon, name)) upserted++;
  }
  return { fetched: locations.length, upserted };
}

// src/ingestion/sources/soilGridsSource.ts
var import_drizzle_orm8 = require("drizzle-orm");
init_db();
init_schema();
init_utils();
var SOILGRIDS_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query";
var PROPERTY_MAP = {
  phh2o: "ph",
  nitrogen: "nitrogenGkg",
  ocd: "organicCarbonGkg",
  clay: "clayPercent",
  sand: "sandPercent",
  silt: "siltPercent",
  cec: "cecCmol",
  bdod: "bulkDensity"
};
function scaleValue(prop, raw) {
  if (raw == null) return null;
  if (prop === "phh2o") return Math.round(raw / 10 * 100) / 100;
  if (["clay", "sand", "silt", "nitrogen", "ocd", "cec", "bdod"].includes(prop)) {
    return Math.round(raw / 10 * 100) / 100;
  }
  return raw;
}
function parseLayers(layers) {
  const out = {};
  for (const layer of layers ?? []) {
    const prop = layer.name;
    if (!prop || !(prop in PROPERTY_MAP)) continue;
    const mean = layer.depths?.[0]?.values?.mean;
    const scaled = scaleValue(prop, mean);
    out[PROPERTY_MAP[prop]] = scaled?.toString() ?? null;
  }
  return out;
}
async function fetchSingleProperty(lat, lon, property) {
  const url = `${SOILGRIDS_URL}?lat=${lat}&lon=${lon}&property=${property}&depth=0-5cm&value=mean`;
  try {
    const json = await fetchJson(url, {
      signal: AbortSignal.timeout(4e3)
    });
    return json.properties?.layers?.[0] ?? null;
  } catch {
    return null;
  }
}
async function syncSoilAtPoint(lat, lon, options) {
  const key = geoKey(lat, lon);
  const layers = [];
  const respectRateLimit = options?.respectRateLimit !== false;
  for (const prop of ["phh2o", "clay", "sand", "nitrogen", "ocd"]) {
    const layer = await fetchSingleProperty(lat, lon, prop);
    if (layer) layers.push({ ...layer, name: prop });
    if (respectRateLimit) await sleep(13e3);
  }
  const parsed = parseLayers(layers);
  const hasData = Object.values(parsed).some((v) => v != null);
  if (!hasData) {
    console.warn(`SoilGrids: no data for ${lat}, ${lon} (API may be down or urban area)`);
    return false;
  }
  await db.insert(soils).values({
    geoKey: key,
    latitude: String(lat),
    longitude: String(lon),
    depthCm: "0-5cm",
    ph: parsed.ph ?? null,
    nitrogenGkg: parsed.nitrogenGkg ?? null,
    organicCarbonGkg: parsed.organicCarbonGkg ?? null,
    clayPercent: parsed.clayPercent ?? null,
    sandPercent: parsed.sandPercent ?? null,
    siltPercent: parsed.siltPercent ?? null,
    cecCmol: parsed.cecCmol ?? null,
    bulkDensity: parsed.bulkDensity ?? null,
    source: "soilgrids",
    rawData: { layers },
    fetchedAt: /* @__PURE__ */ new Date()
  }).onConflictDoUpdate({
    target: [soils.geoKey, soils.depthCm],
    set: {
      ph: import_drizzle_orm8.sql`excluded.ph`,
      nitrogenGkg: import_drizzle_orm8.sql`excluded.nitrogen_gkg`,
      organicCarbonGkg: import_drizzle_orm8.sql`excluded.organic_carbon_gkg`,
      clayPercent: import_drizzle_orm8.sql`excluded.clay_percent`,
      sandPercent: import_drizzle_orm8.sql`excluded.sand_percent`,
      fetchedAt: /* @__PURE__ */ new Date()
    }
  });
  return true;
}
async function syncGlobalSoilGrid(options) {
  const points = [
    [17.38, 78.48, "Hyderabad"],
    [28.61, 77.21, "Delhi"],
    [19.08, 72.88, "Mumbai"],
    [13.08, 80.27, "Chennai"],
    [22.57, 88.36, "Kolkata"],
    [15.87, 74.5, "Belgaum"]
  ];
  const maxPoints = options?.maxPoints ?? 1;
  let upserted = 0;
  for (const [lat, lon, label] of points.slice(0, maxPoints)) {
    console.log(`SoilGrids: syncing ${label} (${lat}, ${lon})\u2026`);
    if (await syncSoilAtPoint(lat, lon)) upserted++;
  }
  return { fetched: Math.min(maxPoints, points.length), upserted };
}

// src/ingestion/sources/openLibrarySource.ts
var import_drizzle_orm10 = require("drizzle-orm");
init_db();
init_schema();
init_utils();
var BOOK_QUERIES = [
  "agriculture India farming",
  "crop production textbook",
  "plant pathology",
  "integrated pest management",
  "soil science agriculture",
  "horticulture India",
  "organic farming",
  "agronomy"
];
async function syncAgBooks(perQuery = 10) {
  let fetched = 0;
  let upserted = 0;
  for (const query of BOOK_QUERIES) {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${perQuery}&fields=key,title,author_name,first_publish_year,subject,publisher,isbn`;
    try {
      const json = await fetchJson(url);
      for (const doc of json.docs ?? []) {
        if (!doc.key || !doc.title) continue;
        fetched++;
        const externalId = doc.key.replace("/works/", "");
        const authors = doc.author_name ?? [];
        const subjects = (doc.subject ?? []).slice(0, 8);
        await db.insert(agKnowledge).values({
          type: "book",
          title: doc.title.slice(0, 500),
          summary: `Authors: ${authors.join(", ") || "Unknown"}. Subjects: ${subjects.join(", ")}.`,
          authors,
          source: "openlibrary",
          externalId,
          url: `https://openlibrary.org${doc.key}`,
          tags: [...subjects, query],
          publishedAt: doc.first_publish_year ? /* @__PURE__ */ new Date(`${doc.first_publish_year}-01-01`) : void 0,
          syncedAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: [agKnowledge.source, agKnowledge.externalId],
          set: { summary: import_drizzle_orm10.sql`excluded.summary`, syncedAt: /* @__PURE__ */ new Date() }
        });
        upserted++;
      }
    } catch (err) {
      console.warn(`OpenLibrary skip:`, err.message);
    }
    await sleep(300);
  }
  return { fetched, upserted };
}
async function syncScientistInsights() {
  const insights = [
    {
      id: "ipm_principle",
      title: "IPM \u2014 scientific consensus",
      summary: "Monitor weekly, spray only at economic threshold, rotate pesticide modes, combine cultural + biological + chemical control.",
      tags: ["IPM", "pest"]
    },
    {
      id: "soil_ph_rice",
      title: "Soil pH for rice",
      summary: "Optimal pH 5.5\u20136.5. Lime if pH < 5. Zinc at tillering if bronzing in alkaline soils.",
      tags: ["soil", "rice"],
      crops: ["rice"]
    },
    {
      id: "nitrogen_split",
      title: "Split nitrogen \u2014 yield research",
      summary: "50% basal, 25% active growth, 25% flowering. Improves N efficiency 15\u201320%.",
      tags: ["fertilizer"]
    }
  ];
  for (const item of insights) {
    await db.insert(agKnowledge).values({
      type: "scientist_insight",
      title: item.title,
      summary: item.summary,
      source: "icar_consensus",
      externalId: item.id,
      tags: item.tags,
      cropTags: item.crops ?? [],
      syncedAt: /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: [agKnowledge.source, agKnowledge.externalId],
      set: { summary: import_drizzle_orm10.sql`excluded.summary`, syncedAt: /* @__PURE__ */ new Date() }
    });
  }
  return { fetched: insights.length, upserted: insights.length };
}
async function syncAllKnowledge() {
  const { syncOpenAlexResearch: syncOpenAlexResearch2, syncDiseasePestKnowledge: syncDiseasePestKnowledge2, syncPesticideResearch: syncPesticideResearch2 } = await Promise.resolve().then(() => (init_openAlexSource(), openAlexSource_exports));
  let fetched = 0;
  let upserted = 0;
  for (const fn of [
    syncOpenAlexResearch2,
    syncDiseasePestKnowledge2,
    syncPesticideResearch2,
    syncAgBooks,
    syncScientistInsights
  ]) {
    const r = await fn();
    fetched += r.fetched;
    upserted += r.upserted;
  }
  return { fetched, upserted };
}

// src/ingestion/syncRunner.ts
var import_drizzle_orm11 = require("drizzle-orm");
init_db();
init_schema();
async function ensureDataSources() {
  const sources = [
    {
      id: "fao",
      name: "FAO FAOSTAT",
      type: "fao",
      baseUrl: "https://fenixservices.fao.org/faostat/api/v1",
      description: "Global crops, production, fertilizer statistics",
      regionScope: "global"
    },
    {
      id: "agmarknet",
      name: "Agmarknet / data.gov.in",
      type: "agmarknet",
      baseUrl: "https://api.data.gov.in/resource",
      description: "India mandi prices and crop varieties",
      regionScope: "India"
    },
    {
      id: "soilgrids",
      name: "ISRIC SoilGrids",
      type: "soilgrids",
      baseUrl: "https://rest.isric.org/soilgrids/v2.0",
      description: "Global soil pH, texture, organic carbon",
      regionScope: "global"
    },
    {
      id: "open_meteo",
      name: "Open-Meteo",
      type: "open_meteo",
      baseUrl: "https://api.open-meteo.com/v1",
      description: "Global weather forecasts",
      regionScope: "global"
    },
    {
      id: "openalex",
      name: "OpenAlex Research",
      type: "manual",
      baseUrl: "https://api.openalex.org",
      description: "Scientific papers \u2014 diseases, pests, fertilizers, climate",
      regionScope: "global"
    },
    {
      id: "openlibrary",
      name: "Open Library",
      type: "manual",
      baseUrl: "https://openlibrary.org",
      description: "Agriculture books and textbooks",
      regionScope: "global"
    },
    {
      id: "indian_fertilizers",
      name: "DoF / IFFCO / Coromandel / NFL",
      type: "manual",
      baseUrl: "https://dof.gov.in",
      description: "Indian fertilizer product catalog \u2014 NPK, bio, micronutrients",
      regionScope: "India"
    },
    {
      id: "bhuvedam",
      name: "Bhuvedam AP/Telangana Crop Catalog",
      type: "manual",
      baseUrl: "https://bhuvedam.com",
      description: "Curated regional crops with Telugu details",
      regionScope: "India \u2014 AP & Telangana"
    },
    {
      id: "bulk_catalog",
      name: "Bhuvedam Bulk Ag Catalog",
      type: "manual",
      baseUrl: "https://bhuvedam.com",
      description: "Generated pesticides, fungicides, fertilizers, diseases per crop",
      regionScope: "India"
    },
    {
      id: "publications",
      name: "ICAR / PJTSAU / ANGRAU / FAO / Gov Publications",
      type: "manual",
      baseUrl: "https://www.icar.org.in",
      description: "Curated publications, university research, FAO guides, government advisories",
      regionScope: "India \u2014 AP & Telangana priority"
    }
  ];
  for (const s of sources) {
    await db.insert(dataSources).values(s).onConflictDoNothing({ target: dataSources.id });
  }
}
async function startSyncJob(sourceId) {
  const [job] = await db.insert(syncJobs).values({ sourceId, status: "running" }).returning({ id: syncJobs.id });
  return job.id;
}
async function finishSyncJob(jobId, sourceId, status, stats) {
  await db.update(syncJobs).set({
    status,
    recordsFetched: stats.fetched ?? 0,
    recordsUpserted: stats.upserted ?? 0,
    errorMessage: stats.error,
    metadata: stats.metadata ?? {},
    finishedAt: /* @__PURE__ */ new Date()
  }).where((0, import_drizzle_orm11.eq)(syncJobs.id, jobId));
  if (status === "success" || status === "partial") {
    await db.update(dataSources).set({ lastSyncAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm11.eq)(dataSources.id, sourceId));
  }
}

// src/ingestion/syncAll.ts
loadEnv();
async function runFullSync() {
  await ensureDataSources();
  const results = [];
  const jobs = [
    { sourceId: "fao", run: () => syncFaoCrops(2e3) },
    { sourceId: "fao", run: () => syncFaoFertilizers(300) },
    { sourceId: "agmarknet", run: () => syncAgmarknetMandi() },
    { sourceId: "soilgrids", run: () => syncGlobalSoilGrid({ maxPoints: 1 }) },
    { sourceId: "open_meteo", run: () => syncGlobalWeather() },
    { sourceId: "openalex", run: () => syncAllKnowledge() }
  ];
  for (const { sourceId, run } of jobs) {
    const jobId = await startSyncJob(sourceId);
    try {
      const { fetched, upserted } = await run();
      await finishSyncJob(jobId, sourceId, "success", {
        fetched,
        upserted
      });
      results.push({ sourceId, fetched, upserted, errors: [] });
      console.log(`\u2713 ${sourceId}: fetched ${fetched}, stored ${upserted}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await finishSyncJob(jobId, sourceId, "failed", { error: msg });
      results.push({ sourceId, fetched: 0, upserted: 0, errors: [msg] });
      console.error(`\u2717 ${sourceId}: ${msg}`);
    }
  }
  return results;
}
async function runCompleteSync() {
  await ensureDataSources();
  const results = [];
  const jobs = [
    { label: "FAO crops", sourceId: "fao", run: () => syncFaoCrops(2e3) },
    {
      label: "Bhuvedam AP/Telangana crops",
      sourceId: "bhuvedam",
      run: async () => {
        const upserted = await seedBhuvedamCrops();
        return { fetched: upserted, upserted };
      }
    },
    { label: "FAO fertilizers", sourceId: "fao", run: () => syncFaoFertilizers(300) },
    {
      label: "Indian fertilizer catalog",
      sourceId: "indian_fertilizers",
      run: () => syncIndianFertilizerCatalog()
    },
    {
      label: "Indian ag catalog (diseases, ICAR, advisories)",
      sourceId: "indian_fertilizers",
      run: async () => {
        const parts = await syncIndianAgCatalog();
        let fetched = 0;
        let upserted = 0;
        for (const part of Object.values(parts)) {
          fetched += part.fetched;
          upserted += part.upserted;
        }
        return { fetched, upserted };
      }
    },
    { label: "Agmarknet mandi prices", sourceId: "agmarknet", run: () => syncAgmarknetMandi() },
    {
      label: "Bulk pesticides/fungicides/diseases",
      sourceId: "bulk_catalog",
      run: async () => {
        const counts = await syncBulkAgCatalog();
        const upserted = Object.values(counts).reduce((sum, n) => sum + n, 0);
        return { fetched: upserted, upserted };
      }
    },
    { label: "Research & books (OpenAlex/Open Library)", sourceId: "openalex", run: () => syncAllKnowledge() },
    {
      label: "Publications (ICAR, PJTSAU, ANGRAU, FAO, Gov)",
      sourceId: "publications",
      run: async () => {
        const parts = await syncAllPublications();
        return {
          fetched: parts.curated.fetched + parts.research.fetched,
          upserted: parts.curated.upserted + parts.research.upserted
        };
      }
    },
    { label: "Weather forecasts", sourceId: "open_meteo", run: () => syncGlobalWeather() },
    { label: "SoilGrids sample", sourceId: "soilgrids", run: () => syncGlobalSoilGrid({ maxPoints: 1 }) }
  ];
  for (const { label, sourceId, run } of jobs) {
    const jobId = await startSyncJob(sourceId);
    try {
      const out = await run();
      const fetched = "fetched" in out ? out.fetched : 0;
      const upserted = "upserted" in out ? out.upserted : 0;
      await finishSyncJob(jobId, sourceId, "success", { fetched, upserted });
      results.push({ sourceId, fetched, upserted, errors: [] });
      console.log(`\u2713 ${label}: fetched ${fetched}, stored ${upserted}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await finishSyncJob(jobId, sourceId, "failed", { error: msg });
      results.push({ sourceId, fetched: 0, upserted: 0, errors: [msg] });
      console.error(`\u2717 ${label}: ${msg}`);
    }
  }
  return results;
}
async function runDailyAutoSync() {
  await ensureDataSources();
  const results = [];
  const jobs = [
    {
      sourceId: "agmarknet",
      label: "Mandi AP",
      run: () => syncAgmarknetMandi({ state: "Andhra Pradesh" })
    },
    {
      sourceId: "agmarknet",
      label: "Mandi Telangana",
      run: () => syncAgmarknetMandi({ state: "Telangana" })
    },
    {
      sourceId: "indian_fertilizers",
      label: "Fertilizer DoF/NBS catalog",
      run: async () => {
        const r = await syncIndianFertilizerCatalog();
        return { fetched: r.fetched, upserted: r.upserted };
      }
    },
    {
      sourceId: "open_meteo",
      label: "Weather snapshots",
      run: () => syncGlobalWeather()
    },
    {
      sourceId: "bhuvedam",
      label: "AP/Telangana crops",
      run: async () => {
        const upserted = await seedBhuvedamCrops();
        return { fetched: upserted, upserted };
      }
    },
    {
      sourceId: "bhuvedam",
      label: "Nearby mandi/shops seed",
      run: async () => {
        const { seedCuratedAgPlaces: seedCuratedAgPlaces2 } = await Promise.resolve().then(() => (init_nearbyAgPlacesService(), nearbyAgPlacesService_exports));
        const r = await seedCuratedAgPlaces2();
        return { fetched: r.inserted + r.skipped, upserted: r.inserted };
      }
    }
  ];
  for (const { sourceId, label, run } of jobs) {
    const jobId = await startSyncJob(sourceId);
    try {
      const { fetched, upserted } = await run();
      await finishSyncJob(jobId, sourceId, "success", {
        fetched,
        upserted,
        metadata: { label }
      });
      results.push({ sourceId, fetched, upserted, errors: [] });
      console.log(`\u2713 ${label}: fetched ${fetched}, stored ${upserted}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await finishSyncJob(jobId, sourceId, "failed", {
        error: msg,
        metadata: { label }
      });
      results.push({ sourceId, fetched: 0, upserted: 0, errors: [msg] });
      console.error(`\u2717 ${label}: ${msg}`);
    }
  }
  return results;
}
var target = process.argv[2] ?? "all";
async function main() {
  console.log("Bhuvedam \u2014 syncing live agricultural data to Neon...\n");
  if (target === "all") {
    await runFullSync();
  } else if (target === "daily") {
    await runDailyAutoSync();
  } else if (target === "complete") {
    await runCompleteSync();
  } else if (target === "crops") {
    await ensureDataSources();
    const fao = await syncFaoCrops(2e3);
    console.log("FAO crops:", fao);
    const seeded = await seedBhuvedamCrops();
    console.log(`Bhuvedam AP/Telangana catalog: ${seeded} crops with full Telugu details`);
  } else if (target === "mandi") {
    const r = await syncAgmarknetMandi();
    console.log("Agmarknet:", r);
  } else if (target === "soil") {
    const r = await syncGlobalSoilGrid();
    console.log("SoilGrids:", r);
  } else if (target === "weather") {
    const r = await syncGlobalWeather();
    console.log("Open-Meteo:", r);
  } else if (target === "fertilizers") {
    await ensureDataSources();
    const fao = await syncFaoFertilizers(300);
    console.log("FAO fertilizers:", fao);
    const catalog2 = await syncIndianFertilizerCatalog();
    console.log("Indian fertilizer catalog:", catalog2);
  } else if (target === "fertilizer-catalog") {
    await ensureDataSources();
    const r = await syncIndianFertilizerCatalog();
    console.log("Indian fertilizer catalog:", r);
  } else if (target === "ag-catalog") {
    await ensureDataSources();
    const results = await syncIndianAgCatalog();
    console.log("Indian ag catalog:", JSON.stringify(results, null, 2));
  } else if (target === "bulk-catalog") {
    await ensureDataSources();
    const counts = await syncBulkAgCatalog();
    console.log("Bulk ag catalog:", JSON.stringify(counts, null, 2));
  } else if (target === "knowledge") {
    const r = await syncAllKnowledge();
    console.log("Knowledge (research, books, pests):", r);
  } else if (target === "publications") {
    await ensureDataSources();
    const r = await syncAllPublications();
    console.log("Publications (ICAR/PJTSAU/ANGRAU/FAO/Gov):", JSON.stringify(r, null, 2));
  } else {
    console.error(
      "Usage: tsx src/ingestion/syncAll.ts [all|daily|complete|crops|mandi|soil|weather|fertilizers|fertilizer-catalog|ag-catalog|bulk-catalog|knowledge|publications]"
    );
  }
  console.log("\nSync complete.");
}
var isDirectRun2 = process.argv[1]?.includes("syncAll");
if (isDirectRun2) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

// src/server/index.ts
init_utils();

// src/logging/logger.ts
var SENSITIVE_KEYS = /* @__PURE__ */ new Set([
  "password",
  "token",
  "otp",
  "authorization",
  "passwordhash",
  "currentpassword",
  "newpassword"
]);
function logLevel() {
  const raw = process.env.LOG_LEVEL?.trim().toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") return raw;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}
var LEVEL_RANK = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};
function shouldLog(level) {
  return LEVEL_RANK[level] >= LEVEL_RANK[logLevel()];
}
function maskPhone(phone) {
  if (!phone) return "(empty)";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `******${digits.slice(-4)}`;
}
function redactValue(key, value) {
  if (SENSITIVE_KEYS.has(key.toLowerCase())) return "[redacted]";
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (value == null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => redact(item));
  return redact(value);
}
function redact(data) {
  if (data instanceof Error) {
    return { name: data.name, message: data.message, stack: data.stack };
  }
  if (data == null || typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map((item) => redact(item));
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = redactValue(key, value);
  }
  return out;
}
function write(scope, level, message, meta) {
  if (!shouldLog(level)) return;
  const ts = (/* @__PURE__ */ new Date()).toISOString();
  const prefix = `[${ts}] [Bhuvedam:${scope}]`;
  const payload = meta !== void 0 ? redact(meta) : void 0;
  if (payload !== void 0) {
    console[level === "debug" ? "log" : level](prefix, message, payload);
  } else {
    console[level === "debug" ? "log" : level](prefix, message);
  }
}
var log = {
  debug: (scope, message, meta) => write(scope, "debug", message, meta),
  info: (scope, message, meta) => write(scope, "info", message, meta),
  warn: (scope, message, meta) => write(scope, "warn", message, meta),
  error: (scope, message, meta) => write(scope, "error", message, meta)
};
function logDbError(scope, action, err, meta) {
  const e = err;
  log.error(scope, `${action} \u2014 database error`, {
    ...meta,
    dbMessage: e.message,
    dbCode: e.code,
    detail: e.detail,
    constraint: e.constraint
  });
}

// src/middleware/adminAuth.ts
async function adminAuthMiddleware(c, next) {
  const secret = process.env.ADMIN_API_KEY?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return appError(c, "FORBIDDEN");
    }
    await next();
    return;
  }
  const headerKey = c.req.header("x-admin-key")?.trim();
  const bearer = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  const key = headerKey || bearer;
  if (!key || key !== secret) {
    return appError(c, "FORBIDDEN");
  }
  await next();
}

// src/middleware/apiLogger.ts
async function apiLoggerMiddleware(c, next) {
  if (!c.req.path.startsWith("/api")) {
    await next();
    return;
  }
  const started = Date.now();
  const method = c.req.method;
  const path3 = c.req.path;
  log.info("api/request", `${method} ${path3}`);
  try {
    await next();
  } catch (err) {
    log.error("api/unhandled", `${method} ${path3}`, { err });
    throw err;
  } finally {
    const ms = Date.now() - started;
    const status = c.res.status;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "debug";
    log[level]("api/response", `${method} ${path3} \u2192 ${status}`, { ms });
  }
}
function registerGlobalErrorHandler(app2) {
  app2.notFound((c) => appError(c, "NOT_FOUND"));
  app2.onError((err, c) => {
    log.error("api/crash", `${c.req.method} ${c.req.path}`, { err });
    return appError(c, "SERVER_ERROR");
  });
}

// src/services/farmerAuth.ts
var import_node_crypto = require("node:crypto");
var TOKEN_TTL_SEC = 60 * 60 * 24 * 30;
function jwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return "bhuvedam-dev-jwt-secret-change-me";
}
function b64urlJson(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}
function formatPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}
function phoneForDisplay(phone) {
  return phone.replace(/^\+91/, "");
}
function farmerLoginKey(farmer) {
  return farmer.phone ?? farmer.email ?? "";
}
function formatFarmerUser(farmer) {
  return {
    id: farmer.id,
    phone: farmer.phone ? phoneForDisplay(farmer.phone) : "",
    email: farmer.email ?? void 0,
    name: farmer.name,
    language: farmer.language,
    location: farmer.locationLabel ?? void 0,
    farmSize: farmer.farmSize ?? void 0,
    createdAt: farmer.createdAt.toISOString()
  };
}
function createFarmerToken(farmerId, phone) {
  const header = b64urlJson({ alg: "HS256", typ: "JWT" });
  const now = Math.floor(Date.now() / 1e3);
  const payload = b64urlJson({ sub: farmerId, phone, iat: now, exp: now + TOKEN_TTL_SEC });
  const unsigned = `${header}.${payload}`;
  const sig = (0, import_node_crypto.createHmac)("sha256", jwtSecret()).update(unsigned).digest("base64url");
  return `${unsigned}.${sig}`;
}
function parseFarmerToken(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;
  if (!header || !payload || !sig) return null;
  const expected = (0, import_node_crypto.createHmac)("sha256", jwtSecret()).update(`${header}.${payload}`).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !(0, import_node_crypto.timingSafeEqual)(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (parsed.exp != null && parsed.exp < Math.floor(Date.now() / 1e3)) return null;
    if (parsed.sub && parsed.phone) {
      return { farmerId: parsed.sub, phone: parsed.phone };
    }
  } catch {
    return null;
  }
  return null;
}

// src/middleware/farmerAuth.ts
async function farmerAuthMiddleware(c, next) {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return appError(c, "UNAUTHORIZED");
  }
  const parsed = parseFarmerToken(auth.slice(7).trim());
  if (!parsed) {
    return appError(c, "SESSION_EXPIRED");
  }
  c.set("farmerId", parsed.farmerId);
  c.set("farmerPhone", parsed.phone);
  await next();
}

// src/services/visionMessageUtils.ts
function messageText(content) {
  if (typeof content === "string") return content;
  return content.map((part) => part.text ?? "").join(" ").trim();
}
function parseOpenAIContent(content) {
  if (typeof content === "string") {
    return { text: content, images: [] };
  }
  const images = [];
  const textParts = [];
  for (const part of content) {
    if (part.type === "text" && part.text?.trim()) {
      textParts.push(part.text.trim());
    }
    if (part.type === "image_url" && part.image_url?.url) {
      const match = part.image_url.url.match(/^data:([^;]+);base64,(.+)$/i);
      if (match?.[1] && match[2]) {
        images.push({ mimeType: match[1], data: match[2] });
      }
    }
  }
  return { text: textParts.join("\n"), images };
}
function messageHasVisionContent(content) {
  return parseOpenAIContent(content).images.length > 0;
}
function historyHasVisionImage(messages) {
  return messages.some((m) => m.role === "user" && messageHasVisionContent(m.content));
}
function isValidChatMessage(message) {
  if (!message.role) return false;
  if (typeof message.content === "string") return message.content.trim().length > 0;
  if (Array.isArray(message.content)) {
    return message.content.length > 0 && (messageText(message.content).length > 0 || messageHasVisionContent(message.content));
  }
  return false;
}
function buildGeminiContents(messages) {
  const contents = [];
  for (const message of messages) {
    if (message.role === "system") continue;
    const { text: text19, images } = parseOpenAIContent(message.content);
    const parts = [];
    for (const image of images) {
      parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
    }
    if (text19) parts.push({ text: text19 });
    if (!parts.length) continue;
    contents.push({
      role: message.role === "assistant" ? "model" : "user",
      parts
    });
  }
  return contents;
}
function toOllamaVisionMessages(messages) {
  return messages.map((message) => {
    const { text: text19, images } = parseOpenAIContent(message.content);
    if (message.role === "user" && images.length) {
      return {
        role: "user",
        // Ollama vision needs non-empty content; not shown in the app chat bubble.
        content: text19 || "Analyze this image.",
        images: images.map((img) => img.data)
      };
    }
    return {
      role: message.role,
      content: messageText(message.content)
    };
  });
}

// src/services/aiProxyService.ts
function ollamaConfig() {
  return {
    url: (process.env.OLLAMA_API_URL ?? process.env.EXPO_PUBLIC_OLLAMA_API_URL ?? "https://ollama.com").replace(
      /\/$/,
      ""
    ),
    key: process.env.OLLAMA_API_KEY ?? process.env.EXPO_PUBLIC_OLLAMA_API_KEY ?? "",
    model: process.env.OLLAMA_MODEL ?? process.env.EXPO_PUBLIC_OLLAMA_MODEL ?? "gpt-oss:20b",
    visionModel: process.env.OLLAMA_VISION_MODEL ?? process.env.EXPO_PUBLIC_OLLAMA_VISION_MODEL ?? "llama3.2-vision"
  };
}
function isOllamaConfigured() {
  return Boolean(ollamaConfig().key.trim());
}
function ollamaThinkParam(model) {
  if (model.includes("gpt-oss")) return "low";
  return void 0;
}
function trimMessagesForOllama(messages) {
  const maxSystemChars = 1e4;
  return messages.map((message) => {
    if (message.role !== "system") return message;
    const text19 = messageText(message.content);
    if (text19.length <= maxSystemChars) return message;
    return {
      ...message,
      content: `${text19.slice(-maxSystemChars)}

[Earlier context trimmed for speed.]`
    };
  });
}
function extractAssistantText(message) {
  const content = message?.content?.trim() ?? "";
  if (content) return content;
  return message?.thinking?.trim() ?? "";
}
async function requestOllamaChat(messages, opts) {
  const { url, key, model, visionModel } = ollamaConfig();
  if (!key) {
    throw new Error("OLLAMA_API_KEY not configured on server");
  }
  const useVision = historyHasVisionImage(messages);
  const activeModel = useVision ? visionModel : model;
  const think = ollamaThinkParam(activeModel);
  const temperature = useVision ? opts.temperature ?? 0.25 : opts.temperature ?? (opts.voiceMode ? 0.25 : 0.15);
  const trimmed = trimMessagesForOllama(messages);
  const payload = {
    model: activeModel,
    messages: useVision ? toOllamaVisionMessages(trimmed) : trimmed,
    stream: opts.stream,
    options: {
      temperature,
      top_p: 0.85,
      repeat_penalty: 1.15,
      num_predict: opts.voiceMode ? 768 : 1536
    }
  };
  if (think) payload.think = think;
  return fetch(`${url}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(payload),
    signal: opts.signal
  });
}
async function completeOllamaChat(messages, opts = {}) {
  const response = await requestOllamaChat(messages, { ...opts, stream: false });
  if (!response.ok) {
    const text19 = await response.text();
    throw new Error(text19 || `Ollama error ${response.status}`);
  }
  const data = await response.json();
  const content = extractAssistantText(data.message);
  if (content) return content;
  if (data.error) throw new Error(data.error);
  throw new Error("Ollama returned an empty response");
}

// src/services/geminiProxyService.ts
var import_genai = require("@google/genai");
var GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
function geminiConfig() {
  return {
    key: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "",
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash"
  };
}
var client = null;
var clientKey = "";
function getClient() {
  const { key } = geminiConfig();
  if (!key) throw new Error("GEMINI_API_KEY not configured on server");
  if (!client || clientKey !== key) {
    client = new import_genai.GoogleGenAI({ apiKey: key });
    clientKey = key;
  }
  return client;
}
function isGeminiConfigured() {
  return getGeminiConfigIssue() === null;
}
function getGeminiConfigIssue() {
  const key = geminiConfig().key.trim();
  if (!key) return "GEMINI_API_KEY missing";
  if (!key.startsWith("AIza") && !key.startsWith("AQ.")) {
    return "GEMINI_API_KEY unrecognized \u2014 create one at https://aistudio.google.com/apikey";
  }
  if (key.length < 20) return "GEMINI_API_KEY too short";
  return null;
}
function trimSystemText(text19, maxChars = 1e4) {
  if (text19.length <= maxChars) return text19;
  return `${text19.slice(-maxChars)}

[Earlier context trimmed for speed.]`;
}
function extractSystemInstruction(messages) {
  const parts = messages.filter((m) => m.role === "system").map((m) => messageText(m.content)).filter(Boolean);
  const merged = parts.join("\n\n").trim();
  return trimSystemText(
    merged || "You are Bhuvedam AI \u2014 a Telugu-speaking agriculture assistant for Indian farmers."
  );
}
function buildTextPrompt(messages) {
  const turns = [];
  for (const message of messages) {
    if (message.role === "system") continue;
    const text19 = messageText(message.content);
    if (!text19) continue;
    const label = message.role === "assistant" ? "Assistant" : "Farmer";
    turns.push(`${label}: ${text19}`);
  }
  if (!turns.length) {
    throw new Error("No user messages for Gemini");
  }
  return `${turns.join("\n")}
Assistant:`;
}
function partsToRest(parts) {
  return parts.map((part) => {
    if ("text" in part) return { text: part.text };
    return {
      inlineData: {
        mimeType: part.inlineData.mimeType,
        data: part.inlineData.data
      }
    };
  });
}
async function completeGeminiChatViaRest(messages, opts, useVision, systemInstruction, temperature, maxOutputTokens) {
  const { key, model } = geminiConfig();
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent`;
  let contents;
  if (useVision) {
    const built = buildGeminiContents(messages);
    if (!built.length) throw new Error("No vision content for Gemini");
    contents = built.map((turn) => ({
      role: turn.role,
      parts: partsToRest(turn.parts)
    }));
  } else {
    contents = [{ role: "user", parts: [{ text: buildTextPrompt(messages) }] }];
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens
      }
    }),
    signal: opts.signal
  });
  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Gemini REST ${response.status}: ${raw.slice(0, 400)}`);
  }
  const data = JSON.parse(raw);
  const text19 = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
  if (text19) return text19;
  throw new Error("Gemini returned an empty response");
}
async function completeGeminiChatViaSdk(messages, opts, useVision, systemInstruction, temperature, maxOutputTokens) {
  const { model } = geminiConfig();
  const ai = getClient();
  if (useVision) {
    const contents = buildGeminiContents(messages);
    if (!contents.length) throw new Error("No vision content for Gemini");
    const response2 = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        maxOutputTokens,
        temperature,
        abortSignal: opts.signal
      }
    });
    const text20 = response2.text?.trim() ?? "";
    if (text20) return text20;
    throw new Error("Gemini returned an empty response");
  }
  const userPrompt = buildTextPrompt(messages);
  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction,
      maxOutputTokens,
      temperature,
      abortSignal: opts.signal
    }
  });
  const text19 = response.text?.trim() ?? "";
  if (text19) return text19;
  throw new Error("Gemini returned an empty response");
}
async function completeGeminiChat(messages, opts = {}) {
  const configIssue = getGeminiConfigIssue();
  if (configIssue) throw new Error(configIssue);
  const systemInstruction = extractSystemInstruction(messages);
  const useVision = historyHasVisionImage(messages);
  const temperature = useVision ? opts.temperature ?? 0.25 : opts.temperature ?? (opts.voiceMode ? 0.25 : 0.15);
  const maxOutputTokens = opts.voiceMode ? 1024 : 2048;
  try {
    return await completeGeminiChatViaRest(
      messages,
      opts,
      useVision,
      systemInstruction,
      temperature,
      maxOutputTokens
    );
  } catch (restErr) {
    console.warn(
      "[gemini] REST failed, trying SDK:",
      restErr instanceof Error ? restErr.message.slice(0, 200) : restErr
    );
  }
  return completeGeminiChatViaSdk(
    messages,
    opts,
    useVision,
    systemInstruction,
    temperature,
    maxOutputTokens
  );
}

// src/services/agents/agentTemperature.ts
var AGENT_TEMPERATURE = {
  time: 0.1,
  weather: 0.2,
  mandi: 0.15,
  pest: 0.12,
  fertilizer: 0.15,
  crop: 0.2,
  scheme: 0.18,
  general: 0.22
};
var DEFAULT_TEMPERATURE = 0.18;
function isKnownAgentId(id) {
  return Boolean(id && id in AGENT_TEMPERATURE);
}
function resolveAgentTemperature(agentId, voiceMode = false) {
  const base = isKnownAgentId(agentId) ? AGENT_TEMPERATURE[agentId] : DEFAULT_TEMPERATURE;
  return voiceMode ? Math.min(base + 0.05, 0.3) : base;
}

// src/services/aiKnowledgeCache.ts
var import_node_crypto2 = require("node:crypto");
var import_drizzle_orm13 = require("drizzle-orm");
init_db();
init_schema();
var SOURCE = "ai_cache";
var MIN_ANSWER_LEN = 80;
var MAX_QUERY_LEN = 500;
var MAX_ANSWER_LEN = 8e3;
function normalizeQuery(query) {
  return query.trim().toLowerCase().replace(/\s+/g, " ").slice(0, MAX_QUERY_LEN);
}
function queryExternalId(query) {
  return (0, import_node_crypto2.createHash)("sha256").update(normalizeQuery(query)).digest("hex").slice(0, 40);
}
function isDbContextThin(context) {
  const t = context.trim();
  if (!t) return true;
  if (/no matching entries in bhuvedam farming library/i.test(t)) return true;
  if (/no library match/i.test(t)) return true;
  if (/farming library could not be loaded/i.test(t)) return true;
  if (/backend catalog not loaded/i.test(t)) return true;
  if (/backend unreachable/i.test(t)) return true;
  return t.length < 120;
}
function shouldCacheAiAnswer(query, answer, dbContext = "") {
  const q = query.trim();
  const a = answer.trim();
  if (q.length < 8 || a.length < MIN_ANSWER_LEN) return false;
  if (/^(sorry|error|failed|unavailable)/i.test(a)) return false;
  if (!isDbContextThin(dbContext)) return false;
  return true;
}
async function cacheAiKnowledgeAnswer(query, answer, opts = {}) {
  const q = query.trim().slice(0, MAX_QUERY_LEN);
  const a = answer.trim().slice(0, MAX_ANSWER_LEN);
  const force = opts.forceStore ?? false;
  if (!force && !shouldCacheAiAnswer(q, a, opts.dbContext ?? "")) return { stored: false };
  if (q.length < 8 || a.length < MIN_ANSWER_LEN) return { stored: false };
  if (/^(sorry|error|failed|unavailable)/i.test(a)) return { stored: false };
  const provider = opts.provider ?? "ai";
  const source = provider.includes("web") || provider.includes("correction") ? "web_research" : SOURCE;
  const externalId = queryExternalId(q);
  const title = q.length > 200 ? `${q.slice(0, 197)}...` : q;
  const cropTags = (opts.cropIds ?? []).slice(0, 5);
  const topUrl = opts.webSnippets?.[0]?.url;
  const [row] = await db.insert(agKnowledge).values({
    type: "general",
    title,
    summary: a.slice(0, 600),
    content: a,
    authors: ["Bhuvedam AI"],
    source,
    externalId,
    url: topUrl ?? null,
    tags: ["ai_answer", "farmer_qa", provider],
    cropTags,
    citationCount: 1,
    metadata: {
      provider,
      query: q,
      cachedAt: (/* @__PURE__ */ new Date()).toISOString(),
      webSources: opts.webSnippets?.slice(0, 5)
    }
  }).onConflictDoUpdate({
    target: [agKnowledge.source, agKnowledge.externalId],
    set: {
      summary: a.slice(0, 600),
      content: a,
      url: topUrl ?? void 0,
      cropTags,
      citationCount: import_drizzle_orm13.sql`COALESCE(${agKnowledge.citationCount}, 0) + 1`,
      syncedAt: /* @__PURE__ */ new Date(),
      metadata: {
        provider,
        query: q,
        cachedAt: (/* @__PURE__ */ new Date()).toISOString(),
        updated: true,
        webSources: opts.webSnippets?.slice(0, 5)
      }
    }
  }).returning({ id: agKnowledge.id });
  return { stored: true, id: row?.id };
}

// src/services/correctionDetect.ts
var CORRECTION_RE = /\b(wrong|incorrect|not correct|that's wrong|actually|correct is|fix this|tappu|tappadu|kadu|kadhu|nijam|mari|cheppaledu)\b|తప్ప|కాదు|నిజం|మార/i;
var WEB_SEARCH_RE = /\b(search|find|google|internet|web|online|look up|browse)\b|search chey|web lo|internet lo|online lo|google lo|వెబ|ఇంటర్నెట|సెర్చ|వెత|ఆన్లైన/i;
var UNCERTAIN_ANSWER_RE = /\b(sorry|i don't|i do not|don't have|do not have|no information|not available|cannot find|unable to|i'm not sure|don't know|do not know|teliyadu|telisadu|ledu|kanipinchaledu|dorakaledu|naku telidu|information about that|ippudu cheppalemu)\b|క్షమ|తెలియ|లేదు|దొరక|సమాచారం లే/i;
function isCorrectionMessage(text19) {
  return CORRECTION_RE.test(text19.trim());
}
function wantsWebSearch(text19) {
  return WEB_SEARCH_RE.test(text19.trim());
}
function isUncertainLlmAnswer(text19) {
  const t = text19.trim();
  if (!t) return true;
  if (t.length < 25) return true;
  return UNCERTAIN_ANSWER_RE.test(t);
}
function hasOnlineSourcesInSystem(messages) {
  const sysText = messageText2(messages.find((m) => m.role === "system")?.content ?? "");
  return /ONLINE AGRICULTURE SOURCES/i.test(sysText);
}
function hasThinLibraryInSystem(messages) {
  const sysText = messageText2(messages.find((m) => m.role === "system")?.content ?? "");
  if (/No library match|No matching entries in Bhuvedam|could not be loaded/i.test(sysText)) {
    return true;
  }
  if (/--- FARMING LIBRARY ---/i.test(sysText) && !/MANDU|PESTICIDE|₹|dose|ml\/acre|research\/sources/i.test(sysText)) {
    return true;
  }
  return false;
}
function shouldSearchWebFirst(messages) {
  if (hasOnlineSourcesInSystem(messages)) return false;
  const sysText = messageText2(messages.find((m) => m.role === "system")?.content ?? "");
  if (/SPECIALIST MODE: Time & date helper/i.test(sysText)) return false;
  const lastUser = messageText2(
    messages.filter((m) => m.role === "user").at(-1)?.content ?? ""
  );
  if (wantsWebSearch(lastUser)) return true;
  if (hasThinLibraryInSystem(messages)) return true;
  return /SPECIALIST MODE:/i.test(sysText);
}
function extractPriorUserQuestion(messages) {
  const users = messages.filter((m) => m.role === "user").map((m) => messageText2(m.content)).filter(Boolean);
  if (users.length >= 2 && isCorrectionMessage(users[users.length - 1] ?? "")) {
    return users[users.length - 2] ?? users[users.length - 1] ?? "";
  }
  return users[users.length - 1] ?? "";
}
function messageText2(content) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content.map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) {
        return String(part.text ?? "");
      }
      return "";
    }).join(" ").trim();
  }
  return "";
}

// src/services/webResearchService.ts
init_utils();
init_knowledgeSearch();
var AG_SUFFIX = " agriculture India farmer";
function invertAbstract3(index22) {
  if (!index22) return "";
  const pairs = [];
  for (const [word, positions] of Object.entries(index22)) {
    for (const pos of positions) pairs.push([pos, word]);
  }
  pairs.sort((a, b) => a[0] - b[0]);
  return pairs.map((p) => p[1]).join(" ").slice(0, 500);
}
function scoreSnippetRelevance(query, snippet) {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const blob = `${snippet.title} ${snippet.snippet}`.toLowerCase();
  let score = 0;
  for (const w of words) {
    if (blob.includes(w)) score += 2;
  }
  if (snippet.source === "serper") score += 1;
  return score;
}
function rankSnippets(query, snippets) {
  return [...snippets].sort(
    (a, b) => scoreSnippetRelevance(query, b) - scoreSnippetRelevance(query, a)
  );
}
async function loadDbContextForQuery(query, cropIds, fullCatalog) {
  if (fullCatalog) {
    const { buildKnowledgeContextForAI: buildKnowledgeContextForAI2 } = await Promise.resolve().then(() => (init_knowledgeSearch(), knowledgeSearch_exports));
    return buildKnowledgeContextForAI2(query, cropIds).catch(() => "");
  }
  const hits = await searchKnowledge(query, 6).catch(() => []);
  return formatKnowledgeForAI(hits, query, "");
}
function buildSearchQuery(query, correctionNote) {
  const base = query.trim().slice(0, 180);
  if (correctionNote && isCorrectionMessage(correctionNote)) {
    return `${base} verified agriculture information`.slice(0, 200);
  }
  return `${base}${AG_SUFFIX}`.slice(0, 200);
}
async function searchOpenAlex(query) {
  try {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&filter=type:article&sort=cited_by_count:desc&per_page=4`;
    const json = await fetchJson(url);
    return (json.results ?? []).map((work) => {
      const title = work.title ?? work.display_name ?? "";
      if (!title) return null;
      const abstract = invertAbstract3(work.abstract_inverted_index);
      const doi = work.doi?.replace("https://doi.org/", "");
      return {
        title,
        snippet: abstract || `Research article (${work.cited_by_count ?? 0} citations)`,
        url: doi ? `https://doi.org/${doi}` : work.id ?? "",
        source: "openalex"
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}
async function searchWikipedia(query) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=2`;
    const search = await fetchJson(searchUrl);
    const titles = search.query?.search?.map((s) => s.title).filter(Boolean) ?? [];
    const snippets = [];
    for (const title of titles.slice(0, 2)) {
      if (!title) continue;
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
      const summary = await fetchJson(summaryUrl);
      if (!summary.extract) continue;
      snippets.push({
        title: summary.title ?? title,
        snippet: summary.extract.slice(0, 500),
        url: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        source: "wikipedia"
      });
    }
    return snippets;
  } catch {
    return [];
  }
}
async function searchDuckDuckGo(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + " agriculture")}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Bhuvedam/1.0 (agriculture assistant)",
        Accept: "text/html"
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    const snippets = [];
    const resultRe = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = resultRe.exec(html)) && snippets.length < 4) {
      const rawUrl = match[1]?.replace(/&amp;/g, "&") ?? "";
      const title = match[2]?.replace(/<[^>]+>/g, "").trim() ?? "";
      const snippet = match[3]?.replace(/<[^>]+>/g, "").trim() ?? "";
      if (!title || !snippet) continue;
      snippets.push({
        title,
        snippet: snippet.slice(0, 400),
        url: rawUrl,
        source: "duckduckgo"
      });
    }
    return snippets;
  } catch {
    return [];
  }
}
async function searchSerper(query) {
  const key = process.env.SERPER_API_KEY?.trim();
  if (!key) return [];
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": key, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, num: 5, gl: "in" })
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.organic ?? []).slice(0, 5).map((row) => ({
      title: row.title ?? "",
      snippet: row.snippet ?? "",
      url: row.link ?? "",
      source: "serper"
    })).filter((s) => s.title && s.snippet);
  } catch {
    return [];
  }
}
function formatWebSnippetsForAI(snippets, query, dbContext = "") {
  const parts = [];
  if (dbContext.trim().length >= 80) {
    parts.push("--- BHUvedam LIBRARY ---", dbContext.trim());
  }
  if (snippets.length) {
    parts.push(`--- ONLINE AGRICULTURE SOURCES for "${query}" ---`);
    snippets.forEach((s, i) => {
      parts.push(`${i + 1}. ${s.title} (${s.source})`);
      parts.push(`   ${s.snippet}`);
      if (s.url) parts.push(`   Source: ${s.url}`);
    });
  }
  return parts.join("\n");
}
async function researchAgricultureOnline(query, opts = {}) {
  const q = query.trim();
  if (!q) {
    return { query: q, snippets: [], formattedContext: "", dbContext: "" };
  }
  const searchQuery = buildSearchQuery(q, opts.correctionNote);
  const fullCatalog = opts.fullCatalog ?? false;
  const dbContext = await loadDbContextForQuery(q, opts.cropIds ?? [], fullCatalog);
  const [openAlex, wiki, webResults] = await Promise.all([
    searchOpenAlex(searchQuery),
    searchWikipedia(q),
    searchSerper(searchQuery).then((s) => s.length ? s : searchDuckDuckGo(searchQuery))
  ]);
  const seen = /* @__PURE__ */ new Set();
  const raw = [];
  for (const list of [webResults, wiki, openAlex]) {
    for (const s of list) {
      const key = s.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) continue;
      seen.add(key);
      raw.push(s);
    }
  }
  const snippets = rankSnippets(q, raw).slice(0, 5);
  const slimDb = dbContext.length > 2e3 && !fullCatalog ? dbContext.slice(0, 1200) : dbContext;
  const formattedContext = formatWebSnippetsForAI(snippets, q, slimDb);
  return { query: q, snippets, formattedContext, dbContext: slimDb };
}

// src/services/synthesizeFarmerAnswer.ts
var SYNTHESIS_TIMEOUT_MS = 18e3;
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("SYNTHESIS_TIMEOUT")), ms);
    })
  ]);
}
function normalizeLang(lang) {
  const code = (lang ?? "te").toLowerCase().slice(0, 2);
  if (code === "en" || code === "hi" || code === "mr" || code === "ta" || code === "kn") {
    return code;
  }
  return "te";
}
function languageLabel(lang) {
  switch (lang) {
    case "en":
      return "English";
    case "hi":
      return "Hindi (Devanagari script only)";
    case "mr":
      return "Marathi (Devanagari script only)";
    case "ta":
      return "Tamil (Tamil script only)";
    case "kn":
      return "Kannada (Kannada script only)";
    default:
      return "Telugu (\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41 script only \u2014 never Roman like meeku/mandu)";
  }
}
function voiceInstruction(lang) {
  return `Reply in 2-4 short spoken sentences in ${languageLabel(lang)}. No markdown. No Romanized Indian languages. Warm field-advisor tone. Give a clear practical next step.`;
}
function textInstruction(lang) {
  return `Reply in 1-3 short paragraphs in ${languageLabel(lang)}. Minimal markdown. Clear practical advice \u2014 diagnosis + what to do.`;
}
async function synthesizeFarmerAnswer(query, research, opts = {}) {
  const lang = normalizeLang(opts.language);
  const sources = research.snippets.slice(0, 5).map((s, i) => `${i + 1}. ${s.title}
   ${s.snippet.slice(0, 360)}`).join("\n");
  const dbHint = research.dbContext.trim().slice(0, 1e3);
  const instruction = opts.voiceMode ? voiceInstruction(lang) : textInstruction(lang);
  const prompt = `You are a skilled local agriculture advisor for Indian farmers. Talk like a real person at the field \u2014 accurate and useful.

FARMER ASKED:
"${query.slice(0, 400)}"

REFERENCE NOTES (use matching facts; ignore unrelated catalog noise):
${sources || "(no web notes)"}
${dbHint ? `
Library note:
${dbHint}` : ""}

HOW TO REPLY:
- Understand the exact question and answer THAT first.
- If it is pest/disease/yellow leaves/crop problem: say likely cause + what to do now (cultural steps and, when relevant, medicine name + dose).
- If they asked for spray/dose/product: include product + dose clearly.
- Do NOT dump random product catalogs. Do NOT copy article titles.
- Prefer actionable steps over vague "wait and see".
- If notes are weak, still give best general farming guidance for that crop/problem \u2014 do not refuse.
- ${instruction}

Your reply to the farmer:`;
  const messages = [{ role: "user", content: prompt }];
  const chatOpts = { voiceMode: opts.voiceMode, temperature: 0.35 };
  if (isGeminiConfigured()) {
    try {
      const text19 = (await withTimeout(completeGeminiChat(messages, chatOpts), SYNTHESIS_TIMEOUT_MS)).trim();
      if (text19.length >= 20) return text19;
    } catch {
    }
  }
  if (isOllamaConfigured()) {
    try {
      const text19 = (await completeOllamaChat(messages, chatOpts)).trim();
      if (text19.length >= 20) return text19;
    } catch {
    }
  }
  return null;
}
async function polishConversationalReply(draft, query, opts = {}) {
  const trimmed = draft.trim();
  if (trimmed.length < 15) return null;
  const lang = normalizeLang(opts.language);
  const instruction = opts.voiceMode ? voiceInstruction(lang) : textInstruction(lang);
  const prompt = `Polish this draft into a clear farmer-friendly reply. Keep all correct facts and doses.

FARMER ASKED:
"${query.slice(0, 400)}"
${opts.recentTurns ? `
RECENT CHAT:
${opts.recentTurns.slice(0, 700)}
` : ""}
DRAFT:
"""
${trimmed.slice(0, 2800)}
"""

RULES:
- Warm, simple, conversational \u2014 like a local advisor.
- Language: ${languageLabel(lang)}. Never use Romanized Telugu/Hindi (meeku, mandu, raithu).
- Keep useful diagnosis + solution steps. Do not strip advice into vague filler.
- Keep numbers, product names, and doses when they belong to the question.
- Do NOT invent new chemicals. Do NOT mention being AI.
- ${instruction}

Polished reply:`;
  const messages = [{ role: "user", content: prompt }];
  const chatOpts = { voiceMode: opts.voiceMode, temperature: 0.3 };
  if (isGeminiConfigured()) {
    try {
      const text19 = (await withTimeout(completeGeminiChat(messages, chatOpts), SYNTHESIS_TIMEOUT_MS)).trim();
      if (text19.length >= 15) return text19;
    } catch {
    }
  }
  if (isOllamaConfigured()) {
    try {
      const text19 = (await completeOllamaChat(messages, chatOpts)).trim();
      if (text19.length >= 15) return text19;
    } catch {
    }
  }
  return null;
}
function humanFallbackWhenNoSynthesis(query, voiceMode = false, language) {
  const lang = normalizeLang(language);
  const shortQ = query.slice(0, 60);
  if (lang === "en") {
    return voiceMode ? `I am still gathering the best answer for "${shortQ}". Please ask again with your crop name and village \u2014 I will explain clearly.` : `I am still researching **"${query.slice(0, 100)}"**.

Ask again with crop name and village \u2014 I will give a clear practical answer.`;
  }
  if (lang === "hi") {
    return voiceMode ? `"${shortQ}" \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u0938\u0939\u0940 \u091C\u0935\u093E\u092C \u091C\u092E\u093E \u0915\u0930 \u0930\u0939\u093E \u0939\u0942\u0901\u0964 \u092B\u0938\u0932 \u0915\u093E \u0928\u093E\u092E \u0914\u0930 \u0917\u093E\u0901\u0935 \u092C\u0924\u093E\u0915\u0930 \u092B\u093F\u0930 \u092A\u0942\u091B\u0947\u0902 \u2014 \u0938\u093E\u092B \u092C\u0924\u093E\u090A\u0901\u0917\u093E\u0964` : `\u0906\u092A\u0915\u093E \u0938\u0935\u093E\u0932 **"${query.slice(0, 100)}"** \u0905\u092D\u0940 \u0914\u0930 \u0936\u094B\u0927 \u092E\u0947\u0902 \u0939\u0948\u0964

\u092B\u0938\u0932 \u0915\u093E \u0928\u093E\u092E \u0914\u0930 \u0917\u093E\u0901\u0935 \u0915\u0947 \u0938\u093E\u0925 \u092B\u093F\u0930 \u092A\u0942\u091B\u0947\u0902\u0964`;
  }
  return voiceMode ? `"${shortQ}" \u0C17\u0C41\u0C30\u0C3F\u0C02\u0C1A\u0C3F \u0C38\u0C30\u0C3F\u0C17\u0C4D\u0C17\u0C3E \u0C1A\u0C46\u0C2A\u0C4D\u0C2A\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C07\u0C02\u0C15\u0C3E \u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32\u0C41 \u0C1A\u0C42\u0C38\u0C4D\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41. \u0C2A\u0C02\u0C1F \u0C2A\u0C47\u0C30\u0C41, \u0C0A\u0C30\u0C41 \u0C1A\u0C46\u0C2A\u0C4D\u0C2A\u0C3F \u0C2E\u0C33\u0C4D\u0C32\u0C40 \u0C05\u0C21\u0C17\u0C02\u0C21\u0C3F \u2014 \u0C38\u0C4D\u0C2A\u0C37\u0C4D\u0C1F\u0C02\u0C17\u0C3E \u0C1A\u0C46\u0C2A\u0C4D\u0C24\u0C3E\u0C28\u0C41.` : `\u0C2E\u0C40 \u0C2A\u0C4D\u0C30\u0C36\u0C4D\u0C28 **"${query.slice(0, 100)}"** \u0C17\u0C41\u0C30\u0C3F\u0C02\u0C1A\u0C3F \u0C07\u0C02\u0C15\u0C3E \u0C38\u0C4D\u0C2A\u0C37\u0C4D\u0C1F\u0C02\u0C17\u0C3E \u0C1A\u0C42\u0C38\u0C4D\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41.

\u0C2A\u0C02\u0C1F \u0C2A\u0C47\u0C30\u0C41, \u0C0A\u0C30\u0C41 \u0C24\u0C4B \u0C2E\u0C33\u0C4D\u0C32\u0C40 \u0C05\u0C21\u0C17\u0C02\u0C21\u0C3F \u2014 \u0C38\u0C30\u0C3F\u0C17\u0C4D\u0C17\u0C3E, \u0C2E\u0C28\u0C3F\u0C37\u0C3F\u0C32\u0C3E \u0C1A\u0C46\u0C2A\u0C4D\u0C24\u0C3E\u0C28\u0C41.`;
}

// src/services/aiChatService.ts
var CATALOG_AGENTS = /* @__PURE__ */ new Set(["pest", "fertilizer", "crop", "scheme"]);
function wantsFullCatalog(agentId) {
  return Boolean(agentId && CATALOG_AGENTS.has(agentId));
}
function resolveTemperature(opts) {
  if (opts.temperature != null) return opts.temperature;
  return resolveAgentTemperature(opts.agentId, opts.voiceMode);
}
var GEMINI_ATTEMPT_MS = 12e3;
var GEMINI_VISION_ATTEMPT_MS = 45e3;
function isGeminiAuthError(err) {
  const msg = err instanceof Error ? err.message : String(err);
  return /401|UNAUTHENTICATED|invalid authentication|API key/i.test(msg);
}
async function tryVisionLlmProviders(messages, chatOpts) {
  const geminiIssue = getGeminiConfigIssue();
  if (geminiIssue) {
    return { text: null, configIssue: geminiIssue, authFailed: false };
  }
  let authFailed = false;
  if (isGeminiConfigured()) {
    try {
      const text19 = (await withTimeout2(
        completeGeminiChat(messages, chatOpts),
        GEMINI_VISION_ATTEMPT_MS,
        "GEMINI_VISION"
      )).trim();
      if (text19.length >= 10) return { text: text19, configIssue: null, authFailed: false };
    } catch (err) {
      authFailed = isGeminiAuthError(err);
      console.error("[ai/vision] Gemini failed:", String(err instanceof Error ? err.message : err).slice(0, 300));
    }
  }
  if (isOllamaConfigured()) {
    try {
      const text19 = (await completeOllamaChat(messages, chatOpts)).trim();
      if (text19.length >= 10) return { text: text19, configIssue: null, authFailed: false };
    } catch (err) {
      console.error("[ai/vision] Ollama vision failed:", err instanceof Error ? err.message : err);
    }
  }
  if (authFailed) {
    console.error(
      "[ai/vision] Gemini key rejected (401). Regenerate at https://aistudio.google.com/apikey \u2014 check key is not Blocked."
    );
  }
  return { text: null, configIssue: null, authFailed };
}
function withTimeout2(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label}_TIMEOUT`)), ms);
    })
  ]);
}
function getAiProvider() {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (isOllamaConfigured() && explicit !== "gemini") return "ollama";
  if (explicit === "gemini" && isGeminiConfigured()) return "gemini";
  if (explicit === "ollama" && isOllamaConfigured()) return "ollama";
  if (isGeminiConfigured()) return "gemini";
  if (isOllamaConfigured()) return "ollama";
  return "ollama";
}
function isAiConfigured() {
  return true;
}
function extractResearchQuery(messages) {
  const lastUser = messageText2(messages.filter((m) => m.role === "user").at(-1)?.content ?? "");
  const correction = isCorrectionMessage(lastUser);
  const query = correction ? extractPriorUserQuestion(messages) : lastUser;
  return { query: query || lastUser, correction, correctionNote: lastUser };
}
function emptyResearch(query) {
  return { query, snippets: [], formattedContext: "", dbContext: "" };
}
function appendResearchToSystem(messages, research) {
  if (!research.formattedContext.trim()) return messages;
  const block = "\n\n--- REFERENCE NOTES (analyze \u2014 use only parts relevant to farmer question; ignore unrelated products) ---\n" + research.formattedContext;
  const out = messages.map((m) => ({ ...m }));
  const sysIdx = out.findIndex((m) => m.role === "system");
  if (sysIdx >= 0) {
    const prev = messageText2(out[sysIdx].content);
    out[sysIdx] = { ...out[sysIdx], content: `${prev}${block}` };
  } else {
    out.unshift({ role: "system", content: block.trim() });
  }
  return out;
}
function isThinDbContext(context) {
  const t = context.trim();
  if (!t) return true;
  if (/no matching entries in bhuvedam farming library/i.test(t)) return true;
  if (/no library match/i.test(t)) return true;
  return t.length < 120;
}
async function tryAllLlmProviders(messages, chatOpts) {
  const attempts = [];
  if (isGeminiConfigured()) {
    attempts.push(
      () => withTimeout2(completeGeminiChat(messages, chatOpts), GEMINI_ATTEMPT_MS, "GEMINI")
    );
  }
  if (isOllamaConfigured()) {
    attempts.push(() => completeOllamaChat(messages, chatOpts));
  }
  for (const attempt of attempts) {
    try {
      const text19 = (await attempt()).trim();
      if (text19.length >= 15) return text19;
    } catch {
    }
  }
  return null;
}
function cacheAnswerAsync(query, answer, research, opts, provider) {
  void cacheAiKnowledgeAnswer(query, answer, {
    cropIds: opts.cropIds,
    provider,
    dbContext: research.dbContext,
    webSnippets: research.snippets,
    forceStore: provider.includes("web") || provider.includes("correction")
  }).catch(() => void 0);
}
function extractRecentTurns(messages) {
  return messages.filter((m) => m.role === "user" || m.role === "assistant").slice(-6).map((m) => {
    const label = m.role === "user" ? "Farmer" : "You";
    return `${label}: ${messageText2(m.content).slice(0, 200)}`;
  }).join("\n");
}
function looksConversationalEnough(text19, query) {
  if (text19.length > 850) return false;
  const bulletCount = (text19.match(/^[\s]*[-•*]/gm) ?? []).length;
  if (bulletCount >= 4) return false;
  const doseSpam = (text19.match(/\d+\s*ml\s*\/\s*acre/gi) ?? []).length;
  if (doseSpam >= 2 && !/mandu|spray|dose|purugu|rogam|pest|fertil/i.test(query)) return false;
  return text19.length < 380 && bulletCount <= 1;
}
async function finalizeAnswer(draft, query, messages, opts, research, provider) {
  if (opts.agentId === "time" || looksConversationalEnough(draft, query)) {
    cacheAnswerAsync(query, draft, research, opts, provider);
    return { answer: draft, provider, research };
  }
  const polished = await polishConversationalReply(draft, query, {
    voiceMode: opts.voiceMode,
    recentTurns: extractRecentTurns(messages),
    language: opts.language
  });
  const answer = polished && !isUncertainLlmAnswer(polished) && polished.length >= 15 ? polished : draft;
  cacheAnswerAsync(query, answer, research, opts, provider);
  return { answer, provider, research };
}
async function loadWebResearch(query, opts, correction, correctionNote) {
  return researchAgricultureOnline(query, {
    correction,
    correctionNote,
    cropIds: opts.cropIds,
    fullCatalog: wantsFullCatalog(opts.agentId)
  });
}
async function answerFromResearch(query, research, opts, provider) {
  const synthesized = await synthesizeFarmerAnswer(query, research, {
    voiceMode: opts.voiceMode,
    language: opts.language
  });
  if (synthesized && !isUncertainLlmAnswer(synthesized)) {
    cacheAnswerAsync(query, synthesized, research, opts, provider);
    return { answer: synthesized, provider, research };
  }
  const human = humanFallbackWhenNoSynthesis(query, opts.voiceMode, opts.language);
  cacheAnswerAsync(query, human, research, opts, provider);
  return { answer: human, provider, research };
}
async function completeWithResearchFallback(messages, opts) {
  const { query, correction, correctionNote } = extractResearchQuery(messages);
  if (historyHasVisionImage(messages)) {
    const visionOpts = { ...opts, temperature: 0.25 };
    const { text: answer2, configIssue, authFailed } = await tryVisionLlmProviders(messages, visionOpts);
    if (answer2) {
      return { answer: answer2, provider: "gemini", research: emptyResearch(query) };
    }
    if (configIssue || authFailed) {
      console.error("[ai/vision] Photo scan unavailable:", configIssue ?? "Gemini auth failed");
      const fallback2 = opts.voiceMode ? "\u0C2B\u0C4B\u0C1F\u0C4B \u0C38\u0C4D\u0C15\u0C3E\u0C28\u0C4D \u0C07\u0C2A\u0C4D\u0C2A\u0C41\u0C21\u0C41 \u0C2A\u0C28\u0C3F \u0C1A\u0C47\u0C2F\u0C21\u0C02 \u0C32\u0C47\u0C26\u0C41. \u0C15\u0C4A\u0C28\u0C4D\u0C28\u0C3F \u0C28\u0C3F\u0C2E\u0C3F\u0C37\u0C3E\u0C32 \u0C24\u0C30\u0C4D\u0C35\u0C3E\u0C24 \u0C2E\u0C33\u0C4D\u0C32\u0C40 \u0C2A\u0C4D\u0C30\u0C2F\u0C24\u0C4D\u0C28\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F." : "**\u0C2B\u0C4B\u0C1F\u0C4B \u0C38\u0C4D\u0C15\u0C3E\u0C28\u0C4D \u0C07\u0C2A\u0C4D\u0C2A\u0C41\u0C21\u0C41 \u0C2A\u0C28\u0C3F \u0C1A\u0C47\u0C2F\u0C21\u0C02 \u0C32\u0C47\u0C26\u0C41**\n\n\u0C15\u0C4A\u0C28\u0C4D\u0C28\u0C3F \u0C28\u0C3F\u0C2E\u0C3F\u0C37\u0C3E\u0C32 \u0C24\u0C30\u0C4D\u0C35\u0C3E\u0C24 \u0C2E\u0C33\u0C4D\u0C32\u0C40 \u0C2A\u0C4D\u0C30\u0C2F\u0C24\u0C4D\u0C28\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F. \u0C38\u0C2E\u0C38\u0C4D\u0C2F \u0C15\u0C4A\u0C28\u0C38\u0C3E\u0C17\u0C3F\u0C24\u0C47 \u0C2F\u0C3E\u0C2A\u0C4D \u0C1F\u0C40\u0C2E\u0C4D\u200C\u0C15\u0C41 \u0C1A\u0C46\u0C2A\u0C4D\u0C2A\u0C02\u0C21\u0C3F.";
      return { answer: fallback2, provider: "vision_unavailable", research: emptyResearch(query) };
    }
    const fallback = opts.voiceMode ? "\u0C2B\u0C4B\u0C1F\u0C4B \u0C38\u0C30\u0C3F\u0C17\u0C4D\u0C17\u0C3E \u0C1A\u0C42\u0C21\u0C32\u0C47\u0C15\u0C2A\u0C4B\u0C2F\u0C3E\u0C28\u0C41. \u0C2E\u0C02\u0C1A\u0C3F \u0C35\u0C46\u0C32\u0C41\u0C24\u0C41\u0C30\u0C41\u0C32\u0C4B \u0C15\u0C4D\u0C32\u0C3F\u0C2F\u0C30\u0C4D \u0C2B\u0C4B\u0C1F\u0C4B \u0C2E\u0C33\u0C4D\u0C32\u0C40 \u0C2A\u0C02\u0C2A\u0C02\u0C21\u0C3F." : "**\u0C2B\u0C4B\u0C1F\u0C4B \u0C38\u0C30\u0C3F\u0C17\u0C4D\u0C17\u0C3E \u0C1A\u0C42\u0C21\u0C32\u0C47\u0C15\u0C2A\u0C4B\u0C2F\u0C3E\u0C28\u0C41**\n\n\u0C2E\u0C02\u0C1A\u0C3F \u0C35\u0C46\u0C32\u0C41\u0C24\u0C41\u0C30\u0C41\u0C32\u0C4B \u0C15\u0C4D\u0C32\u0C3F\u0C2F\u0C30\u0C4D \u0C2B\u0C4B\u0C1F\u0C4B \u0C2E\u0C33\u0C4D\u0C32\u0C40 \u0C2A\u0C02\u0C2A\u0C02\u0C21\u0C3F.";
    return { answer: fallback, provider: "vision_fallback", research: emptyResearch(query) };
  }
  const chatOpts = { ...opts, temperature: resolveTemperature(opts) };
  let research = emptyResearch(query);
  let workingMessages = messages;
  if (shouldSearchWebFirst(messages) || correction || wantsWebSearch(query)) {
    research = await loadWebResearch(query, opts, correction, correctionNote);
    if (research.formattedContext.trim()) {
      workingMessages = appendResearchToSystem(messages, research);
    }
  }
  const dbEmpty = isThinDbContext(research.dbContext) || hasThinLibraryInSystem(messages);
  if (research.snippets.length > 0 && dbEmpty) {
    const llmWithWeb = await tryAllLlmProviders(workingMessages, chatOpts);
    if (llmWithWeb && !isUncertainLlmAnswer(llmWithWeb)) {
      return finalizeAnswer(
        llmWithWeb,
        query,
        messages,
        opts,
        research,
        getAiProvider()
      );
    }
    return answerFromResearch(
      query,
      research,
      opts,
      correction ? "correction_research" : "web_research"
    );
  }
  let answer = await tryAllLlmProviders(workingMessages, chatOpts);
  if (answer && isUncertainLlmAnswer(answer)) {
    if (!research.formattedContext.trim()) {
      research = await loadWebResearch(query, opts, correction, correctionNote);
      workingMessages = appendResearchToSystem(messages, research);
    }
    if (research.snippets.length > 0) {
      const retry = await tryAllLlmProviders(workingMessages, chatOpts);
      if (retry && !isUncertainLlmAnswer(retry)) {
        return finalizeAnswer(retry, query, messages, opts, research, getAiProvider());
      }
      return answerFromResearch(
        query,
        research,
        opts,
        correction ? "correction_research" : "web_research"
      );
    }
  }
  if (answer && !isUncertainLlmAnswer(answer)) {
    if (correction) {
      return finalizeAnswer(answer, query, messages, opts, research, "correction");
    }
    return finalizeAnswer(answer, query, messages, opts, research, getAiProvider());
  }
  if (!research.formattedContext.trim()) {
    research = await loadWebResearch(query, opts, correction, correctionNote);
    workingMessages = appendResearchToSystem(messages, research);
  }
  if (research.snippets.length > 0) {
    const llmLast = await tryAllLlmProviders(workingMessages, chatOpts);
    if (llmLast && !isUncertainLlmAnswer(llmLast)) {
      return finalizeAnswer(llmLast, query, messages, opts, research, getAiProvider());
    }
    return answerFromResearch(
      query,
      research,
      opts,
      correction ? "correction_research" : "web_research"
    );
  }
  return answerFromResearch(query, research, opts, "web_research");
}
async function completeAiChat(messages, opts = {}) {
  const result = await completeWithResearchFallback(messages, opts);
  return result.answer;
}
async function streamAiChat(messages, opts) {
  const { answer } = await completeWithResearchFallback(messages, opts);
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: answer })}

`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }
  });
}

// src/ingestion/data/agrochemEnrichment.ts
var AGROCHEM_ENRICHMENT = {
  "Imidacloprid 17.8% SL": {
    phiDays: 7,
    whenToUse: "At ETL \u2014 early sucking pest build-up. Prefer early vegetative / seed treatment options on label.",
    packMrp: "\u20B9250\u2013400 / 100 ml"
  },
  "Lambda-cyhalothrin 5% EC": {
    phiDays: 7,
    whenToUse: "At flowering / boll formation when larvae appear.",
    packMrp: "\u20B9180\u2013320 / 100 ml"
  },
  "Chlorpyriphos 20% EC": {
    phiDays: 15,
    whenToUse: "Soil / basal for termites; foliar for stem borer as per ETL.",
    packMrp: "\u20B9220\u2013350 / 500 ml",
    status: "restricted"
  },
  "Monocrotophos 36% SL": {
    status: "banned",
    whenToUse: "Banned for agriculture use in India \u2014 do not use."
  },
  "Quinalphos 25% EC": {
    phiDays: 10,
    whenToUse: "Vegetative to flowering when chewing pests cross ETL.",
    packMrp: "\u20B9280\u2013420 / 500 ml"
  },
  "Dimethoate 30% EC": {
    phiDays: 7,
    whenToUse: "Early vegetative sucking pests.",
    packMrp: "\u20B9200\u2013320 / 500 ml"
  },
  "Triazophos 40% EC": {
    phiDays: 15,
    whenToUse: "Tillering to panicle initiation for rice stem borer / BPH.",
    packMrp: "\u20B9300\u2013450 / 500 ml"
  },
  "Profenofos 50% EC": {
    phiDays: 15,
    whenToUse: "Square / boll stage when bollworm eggs/larvae seen.",
    packMrp: "\u20B9350\u2013500 / 500 ml"
  },
  "Spinosad 45% SC": {
    phiDays: 3,
    whenToUse: "Fruiting stage \u2014 selective; follow label for beneficials.",
    packMrp: "\u20B9900\u20131,400 / 75 ml"
  },
  "Emamectin benzoate 5% SG": {
    phiDays: 5,
    whenToUse: "Flowering to fruiting at early larval stage.",
    packMrp: "\u20B9450\u2013700 / 100 g"
  },
  "Indoxacarb 14.5% SC": {
    phiDays: 7,
    whenToUse: "Mid\u2013late crop when chewing pests rise.",
    packMrp: "\u20B9700\u20131,000 / 100 ml"
  },
  "Thiamethoxam 25% WG": {
    phiDays: 7,
    whenToUse: "Early vegetative sucking pests; also seed treatment options.",
    packMrp: "\u20B9350\u2013550 / 100 g"
  },
  "Acetamiprid 20% SP": {
    phiDays: 7,
    whenToUse: "At first flush of sucking pests.",
    packMrp: "\u20B9250\u2013400 / 100 g"
  },
  "Fipronil 5% SC": {
    phiDays: 15,
    whenToUse: "Nursery / early tillering for stem borer; soil for grubs.",
    packMrp: "\u20B9400\u2013650 / 500 ml"
  },
  "Cartap hydrochloride 50% SP": {
    phiDays: 14,
    whenToUse: "Tillering\u2013booting when BPH / leaf folder exceed ETL.",
    packMrp: "\u20B9350\u2013500 / 500 g"
  },
  "Buprofezin 25% SC": {
    phiDays: 7,
    whenToUse: "Nymph stages of hoppers / whitefly \u2014 IGR timing.",
    packMrp: "\u20B9450\u2013700 / 500 ml"
  },
  "Pymetrozine 50% WG": {
    phiDays: 14,
    whenToUse: "Early hopper build-up in rice.",
    packMrp: "\u20B9800\u20131,200 / 120 g"
  },
  "Flubendiamide 39.35% SC": {
    phiDays: 7,
    whenToUse: "Egg hatch / early larva at flowering\u2013fruiting.",
    packMrp: "\u20B9900\u20131,400 / 50 ml"
  },
  "Chlorantraniliprole 18.5% SC": {
    phiDays: 7,
    whenToUse: "Preventive\u2013early larva at vulnerable crop stages.",
    packMrp: "\u20B91,100\u20131,600 / 60 ml"
  },
  "Abamectin 1.9% EC": {
    phiDays: 7,
    whenToUse: "Hot dry weather mite / thrips flare-ups.",
    packMrp: "\u20B9350\u2013550 / 250 ml"
  },
  "Spiromesifen 22.9% SC": {
    phiDays: 7,
    whenToUse: "When mites / whitefly nymphs increase.",
    packMrp: "\u20B9700\u20131,100 / 250 ml"
  },
  "Diafenthiuron 50% WP": {
    phiDays: 15,
    whenToUse: "Whitefly outbreaks in cotton / chilli.",
    packMrp: "\u20B9600\u2013900 / 250 g"
  },
  "Novaluron 10% EC": {
    phiDays: 7,
    whenToUse: "Early larval stage \u2014 IGR.",
    packMrp: "\u20B9500\u2013800 / 500 ml"
  },
  "Lufenuron 5.4% EC": {
    phiDays: 7,
    whenToUse: "Early larva at fruiting.",
    packMrp: "\u20B9550\u2013850 / 500 ml"
  },
  "Metaflumizone 22% SC": {
    phiDays: 7,
    whenToUse: "Fruiting stage chewing pests.",
    packMrp: "\u20B9800\u20131,200 / 200 ml"
  },
  "Cyantraniliprole 10.26% OD": {
    phiDays: 5,
    whenToUse: "Flowering\u2013fruit set for fruit borer / thrips.",
    packMrp: "\u20B91,200\u20131,800 / 100 ml"
  },
  "Spinetoram 11.7% SC": {
    phiDays: 3,
    whenToUse: "Fruiting; rotate modes of action.",
    packMrp: "\u20B91,000\u20131,500 / 100 ml"
  },
  "Malathion 50% EC": {
    phiDays: 7,
    whenToUse: "Orchard / vegetable sucking pests as labelled.",
    packMrp: "\u20B9180\u2013280 / 500 ml"
  },
  "Dichlorvos 76% EC": {
    status: "banned",
    whenToUse: "Banned / phased out for agriculture \u2014 do not use."
  },
  "Phosalone 35% EC": {
    phiDays: 15,
    whenToUse: "Mid-season when pests exceed ETL.",
    packMrp: "\u20B9300\u2013450 / 500 ml"
  },
  "Mancozeb 75% WP": {
    phiDays: 7,
    whenToUse: "Preventive spray before humid blight weather; repeat 7\u201310 days.",
    packMrp: "\u20B9180\u2013280 / 500 g"
  },
  "Carbendazim 50% WP": {
    phiDays: 14,
    whenToUse: "Seed treatment / early disease; rotate \u2014 resistance risk.",
    packMrp: "\u20B9200\u2013320 / 500 g"
  },
  "Tricyclazole 75% WP": {
    phiDays: 20,
    whenToUse: "Nursery to tillering for blast risk weather.",
    packMrp: "\u20B9350\u2013550 / 120 g"
  },
  "Propiconazole 25% EC": {
    phiDays: 20,
    whenToUse: "Flag leaf / ear emergence for rust.",
    packMrp: "\u20B9280\u2013420 / 250 ml"
  },
  "Tebuconazole 25% EC": {
    phiDays: 14,
    whenToUse: "At first disease symptoms or preventive flag-leaf.",
    packMrp: "\u20B9300\u2013450 / 250 ml"
  },
  "Hexaconazole 5% SC": {
    phiDays: 14,
    whenToUse: "Early powdery mildew / sheath blight.",
    packMrp: "\u20B9220\u2013350 / 500 ml"
  },
  "Difenoconazole 25% EC": {
    phiDays: 14,
    whenToUse: "Fruit development anthracnose / leaf spot.",
    packMrp: "\u20B9400\u2013600 / 250 ml"
  },
  "Azoxystrobin 23% SC": {
    phiDays: 7,
    whenToUse: "Preventive\u2013early; rotate FRAC groups.",
    packMrp: "\u20B9700\u20131,100 / 200 ml"
  },
  "Copper oxychloride 50% WP": {
    phiDays: 7,
    whenToUse: "Protective spray in wet weather.",
    packMrp: "\u20B9200\u2013320 / 500 g"
  },
  "Chlorothalonil 75% WP": {
    phiDays: 7,
    whenToUse: "Protective during humid blight periods.",
    packMrp: "\u20B9280\u2013420 / 500 g"
  },
  "Metalaxyl + Mancozeb 72% WP": {
    phiDays: 7,
    whenToUse: "Before / at first late blight warning.",
    packMrp: "\u20B9350\u2013520 / 500 g"
  },
  "Validamycin 3% L": {
    phiDays: 14,
    whenToUse: "Tillering\u2013booting for rice sheath blight.",
    packMrp: "\u20B9180\u2013280 / 500 ml"
  },
  "Kasugamycin 3% SL": {
    phiDays: 14,
    whenToUse: "Early BLB / blast symptoms.",
    packMrp: "\u20B9250\u2013400 / 500 ml"
  },
  "Streptocycline + Copper": {
    phiDays: 7,
    whenToUse: "At first bacterial symptoms; follow antibiotic rules.",
    packMrp: "\u20B980\u2013150 / 6 g"
  },
  "Sulphur 80% WP": {
    phiDays: 3,
    whenToUse: "Cool mornings for powdery mildew; avoid hot noon.",
    packMrp: "\u20B9120\u2013200 / 1 kg"
  },
  "Captan 50% WP": {
    phiDays: 7,
    whenToUse: "Fruit set to development protective sprays.",
    packMrp: "\u20B9250\u2013380 / 500 g"
  },
  "Thiophanate methyl 70% WP": {
    phiDays: 14,
    whenToUse: "Seed / soil / early wilt risk.",
    packMrp: "\u20B9300\u2013450 / 500 g"
  },
  "Pseudomonas fluorescens 2% WP": {
    whenToUse: "Seed treatment / seedling dip before transplant.",
    packMrp: "\u20B9150\u2013250 / 1 kg"
  },
  "Trichoderma viride 1% WP": {
    whenToUse: "Seed / soil enrichment before sowing.",
    packMrp: "\u20B9150\u2013250 / 1 kg"
  },
  "Bordeaux mixture 1%": {
    phiDays: 7,
    whenToUse: "Dormant / wet-season protective orchard sprays.",
    packMrp: "Prepare fresh \u2014 copper sulphate + lime"
  }
};
var AGROCHEM_CATALOG_VERIFIED_AT = "2026-03-01";

// src/services/canonicalAgCatalog.ts
var PPQS_URL = "https://www.ppqs.gov.in/divisions/cib-rc/registered-products";
function slug2(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}
function buildFromActives(type, subType, actives) {
  const rows = [];
  for (const active of actives) {
    const enrich = AGROCHEM_ENRICHMENT[active.name];
    const status = enrich?.status ?? "registered";
    if (status === "banned") continue;
    const when = enrich?.whenToUse ?? (type === "pesticide" ? "Spray at ETL. Early morning or evening \u2014 avoid bee activity." : "Spray at first disease symptoms or as preventive in risk weather.");
    const phi = enrich?.phiDays;
    const phiText = phi != null ? ` PHI about ${phi} days (verify pack label).` : " Check pack label for PHI.";
    rows.push({
      id: `ref-${type === "pesticide" ? "pest" : "fung"}-${slug2(active.name)}`,
      name: active.name,
      nameTe: null,
      type,
      subType,
      brand: null,
      activeIngredient: active.name,
      dosage: active.dose,
      crops: [...new Set(active.crops)],
      targetPest: type === "pesticide" ? active.targets.join(", ") : null,
      targetDisease: type === "fungicide" ? active.targets.join(", ") : null,
      applicationMethod: `Use ${active.dose} in ~200 L water/acre (or as label). ${when}`,
      precautions: `Follow label dose.${phiText} Wear PPE (gloves, mask). Rotate chemical groups. Do not mix unknown products.`,
      description: `CIB&RC-style registered formulation reference. Targets: ${active.targets.join(", ")}. Crops: ${active.crops.join(", ")}. Source: PPQS registered products list.`,
      price: enrich?.packMrp ?? "Typical dealer pack \u2014 verify MRP on label",
      image: resolveProductImageUrl({
        id: `ref-${type === "pesticide" ? "pest" : "fung"}-${slug2(active.name)}`,
        type,
        activeIngredient: active.name
      }),
      source: "cibrc_reference",
      sourceUrl: PPQS_URL,
      whenToUse: when,
      phiDays: phi ?? null,
      status,
      verifiedAt: AGROCHEM_CATALOG_VERIFIED_AT
    });
  }
  return rows;
}
var PESTICIDE_CACHE = buildFromActives("pesticide", "insecticide", INSECTICIDE_ACTIVES);
var FUNGICIDE_CACHE = buildFromActives("fungicide", "fungicide", FUNGICIDE_ACTIVES);
function matchesSearch(p, q) {
  const needle = q.toLowerCase();
  return [
    p.name,
    p.activeIngredient,
    p.targetPest,
    p.targetDisease,
    p.description,
    p.whenToUse,
    ...p.crops
  ].filter(Boolean).join(" ").toLowerCase().includes(needle);
}
function matchesTarget(p, target2) {
  const needle = target2.toLowerCase();
  const hay = [p.targetPest, p.targetDisease, p.name, p.activeIngredient].filter(Boolean).join(" ").toLowerCase();
  return hay.includes(needle);
}
function searchCanonicalAgProducts(query) {
  const base = query.type === "pesticide" ? PESTICIDE_CACHE : FUNGICIDE_CACHE;
  let rows = [...base];
  if (query.crop?.trim()) {
    const cropId = query.crop.trim().toLowerCase();
    rows = rows.filter((p) => p.crops.some((c) => c.toLowerCase() === cropId));
  }
  if (query.target?.trim()) {
    rows = rows.filter((p) => matchesTarget(p, query.target.trim()));
  }
  if (query.search?.trim()) {
    rows = rows.filter((p) => matchesSearch(p, query.search.trim()));
  }
  const limit = Math.min(query.limit ?? 100, 200);
  return rows.slice(0, limit);
}
function getCanonicalAgProductById(id) {
  return PESTICIDE_CACHE.find((p) => p.id === id) ?? FUNGICIDE_CACHE.find((p) => p.id === id) ?? null;
}
function canonicalAgStats() {
  return {
    pesticides: PESTICIDE_CACHE.length,
    fungicides: FUNGICIDE_CACHE.length,
    verifiedAt: AGROCHEM_CATALOG_VERIFIED_AT,
    source: "cibrc_reference"
  };
}

// src/services/cropLocalization.ts
var import_drizzle_orm16 = require("drizzle-orm");
init_db();
init_schema();

// src/services/ollamaClient.ts
function getOllamaConfig() {
  return {
    url: (process.env.EXPO_PUBLIC_OLLAMA_API_URL ?? process.env.OLLAMA_API_URL ?? "https://ollama.com").replace(
      /\/$/,
      ""
    ),
    apiKey: process.env.EXPO_PUBLIC_OLLAMA_API_KEY ?? process.env.OLLAMA_API_KEY ?? "",
    model: process.env.EXPO_PUBLIC_OLLAMA_MODEL ?? process.env.OLLAMA_MODEL ?? "llama3.2"
  };
}
function hasOllama() {
  return Boolean(getOllamaConfig().apiKey);
}
async function ollamaComplete(prompt, maxTokens = 120) {
  const { url, apiKey, model } = getOllamaConfig();
  if (!apiKey) return "";
  const response = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [{ role: "user", content: prompt }],
      options: { temperature: 0.2, num_predict: maxTokens }
    })
  });
  if (!response.ok) return "";
  const data = await response.json();
  return data.message?.content?.trim() ?? "";
}

// src/services/cropLocalization.ts
var LANG_LABELS = {
  en: "English",
  hi: "Hindi (spoken, simple)",
  mr: "Marathi (spoken, simple)",
  ta: "Tamil (spoken, simple)",
  te: "Telugu (spoken, simple \u2014 \u0C2E\u0C3E\u0C1F\u0C4D\u0C32\u0C3E\u0C21\u0C47 \u0C24\u0C46\u0C32\u0C41\u0C17\u0C41)",
  kn: "Kannada (spoken, simple)"
};
function getI18nCache(row) {
  const meta = row.metadata;
  return meta?.i18n ?? {};
}
function withDisplayFields(row, bundle, displayName) {
  return {
    ...row,
    displayName,
    displayCategory: row.category,
    displaySeasonLabel: bundle.seasonLabel ?? row.seasonLabel ?? "",
    displaySowingPeriod: bundle.sowingPeriod ?? row.sowingPeriod ?? "",
    displayHarvestPeriod: bundle.harvestPeriod ?? row.harvestPeriod ?? "",
    displayWaterNeeds: bundle.waterNeeds ?? row.waterNeeds ?? "",
    displaySoilType: bundle.soilType ?? row.soilType ?? "",
    displayTips: bundle.tips?.length ? bundle.tips : row.tips ?? []
  };
}
function pickStaticName(row, lang) {
  if (lang === "en") return row.name;
  if (lang === "te" && row.nameTe) return row.nameTe;
  const cached = (row.localizedNames ?? {})[lang];
  return cached ?? null;
}
async function translateNameWithAi(row, lang) {
  if (!hasOllama()) return lang === "te" ? row.name : row.nameTe ?? row.name;
  const langLabel = LANG_LABELS[lang];
  const prompt = `You help Indian farmers with crop name translation ONLY.
Do not include user data, illegal advice, or anything except the crop name translation.
Use the everyday name farmers use at mandi/field \u2014 NOT scientific Latin.
Crop (English): ${row.name}
${row.nameTe ? `Known Telugu name (prefer if lang is Telugu): ${row.nameTe}` : ""}
${row.description ? `Context: ${String(row.description).slice(0, 200)}` : ""}

Reply with ONLY the crop name in ${langLabel}, one short line, no explanation.`;
  const result = await ollamaComplete(prompt, 80);
  return result.split("\n")[0]?.trim() || row.nameTe || row.name;
}
async function translateDetailsWithAi(row, lang) {
  const cached = getI18nCache(row)[lang];
  if (cached?.tips?.length || cached?.seasonLabel && lang !== "en") return cached;
  const hasDetails = row.seasonLabel || row.sowingPeriod || row.harvestPeriod || row.waterNeeds || row.soilType || (row.tips?.length ?? 0) > 0;
  if (!hasDetails) {
    return { name: pickStaticName(row, lang) ?? row.name };
  }
  if (!hasOllama()) {
    return {
      seasonLabel: row.seasonLabel ?? "",
      sowingPeriod: row.sowingPeriod ?? "",
      harvestPeriod: row.harvestPeriod ?? "",
      waterNeeds: row.waterNeeds ?? "",
      soilType: row.soilType ?? "",
      tips: row.tips ?? []
    };
  }
  const langLabel = LANG_LABELS[lang];
  const prompt = `Translate this Indian crop farming info into ${langLabel} for farmers (simple spoken words).
Agriculture translation ONLY \u2014 no user data, no illegal advice, lawful registered products context only.

Crop: ${row.name}
Season: ${row.seasonLabel ?? row.season ?? ""}
Sowing: ${row.sowingPeriod ?? ""}
Harvest: ${row.harvestPeriod ?? ""}
Water: ${row.waterNeeds ?? ""}
Soil: ${row.soilType ?? ""}
Tips:
${(row.tips ?? []).map((t, i) => `${i + 1}. ${t}`).join("\n")}

Reply ONLY valid JSON:
{"seasonLabel":"","sowingPeriod":"","harvestPeriod":"","waterNeeds":"","soilType":"","tips":["tip1"]}`;
  const raw = await ollamaComplete(prompt, 500);
  try {
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
      return {
        seasonLabel: parsed.seasonLabel ?? row.seasonLabel ?? "",
        sowingPeriod: parsed.sowingPeriod ?? row.sowingPeriod ?? "",
        harvestPeriod: parsed.harvestPeriod ?? row.harvestPeriod ?? "",
        waterNeeds: parsed.waterNeeds ?? row.waterNeeds ?? "",
        soilType: parsed.soilType ?? row.soilType ?? "",
        tips: Array.isArray(parsed.tips) ? parsed.tips : row.tips ?? []
      };
    }
  } catch {
  }
  return {
    seasonLabel: row.seasonLabel ?? "",
    sowingPeriod: row.sowingPeriod ?? "",
    harvestPeriod: row.harvestPeriod ?? "",
    waterNeeds: row.waterNeeds ?? "",
    soilType: row.soilType ?? "",
    tips: row.tips ?? []
  };
}
async function persistLocalization(row, lang, displayName, details) {
  const localizedNames = { ...row.localizedNames ?? {}, [lang]: displayName };
  const i18n = { ...getI18nCache(row), [lang]: { ...details, name: displayName } };
  const metadata = { ...row.metadata, i18n };
  await db.update(crops).set({
    localizedNames,
    metadata,
    searchAliases: import_drizzle_orm16.sql`(
        SELECT COALESCE(jsonb_agg(DISTINCT val), '[]'::jsonb)
        FROM (
          SELECT jsonb_array_elements_text(COALESCE(${crops.searchAliases}, '[]'::jsonb)) AS val
          UNION ALL SELECT ${displayName.toLowerCase()}
        ) s
      )`
  }).where((0, import_drizzle_orm16.eq)(crops.id, row.id));
}
async function localizeCropRow(row, lang, mode = "full") {
  if (mode === "none") {
    return withDisplayFields(row, {}, row.name);
  }
  if (lang === "en" && mode === "names") {
    return withDisplayFields(row, {}, row.name);
  }
  if (lang === "te" && row.nameTe && mode === "names") {
    return withDisplayFields(row, getI18nCache(row).te ?? {}, row.nameTe);
  }
  const cachedBundle = getI18nCache(row)[lang];
  let displayName = pickStaticName(row, lang) ?? cachedBundle?.name ?? null;
  if (!displayName) {
    displayName = await translateNameWithAi(row, lang);
    if (mode === "names") {
      await persistLocalization(row, lang, displayName);
      return withDisplayFields(row, { name: displayName }, displayName);
    }
  }
  if (mode === "names") {
    return withDisplayFields(row, cachedBundle ?? { name: displayName }, displayName);
  }
  if (lang === "en") {
    const details2 = cachedBundle?.tips?.length ? cachedBundle : await translateDetailsWithAi(row, "en");
    if (!cachedBundle?.tips?.length && (row.tips?.length ?? 0) > 0) {
      await persistLocalization(row, "en", row.name, details2);
    }
    return withDisplayFields(row, details2, row.name);
  }
  if (lang === "te" && row.nameTe && (row.tips?.length ?? 0) > 0 && !cachedBundle?.tips?.length) {
    return withDisplayFields(
      row,
      {
        seasonLabel: row.seasonLabel ?? "",
        sowingPeriod: row.sowingPeriod ?? "",
        harvestPeriod: row.harvestPeriod ?? "",
        waterNeeds: row.waterNeeds ?? "",
        soilType: row.soilType ?? "",
        tips: row.tips ?? []
      },
      row.nameTe
    );
  }
  const details = cachedBundle?.tips?.length || cachedBundle?.seasonLabel ? cachedBundle : await translateDetailsWithAi(row, lang);
  if (!displayName) displayName = details.name ?? await translateNameWithAi(row, lang);
  if (!cachedBundle?.tips?.length && (row.tips?.length ?? 0) > 0) {
    await persistLocalization(row, lang, displayName, details);
  } else if (!pickStaticName(row, lang)) {
    await persistLocalization(row, lang, displayName, details);
  }
  return withDisplayFields(row, details, displayName);
}
async function localizeCropsForFarmer(rows, lang, mode = "names") {
  if (mode === "none") {
    return rows.map((row) => withDisplayFields(row, {}, row.name));
  }
  if (lang === "en" && mode === "names") {
    return rows.map((row) => withDisplayFields(row, {}, row.name));
  }
  if (lang === "te" && mode === "names") {
    return rows.map(
      (row) => withDisplayFields(row, {}, row.nameTe ?? row.name)
    );
  }
  if (mode === "names" && rows.length > 40) {
    return rows.map(
      (row) => withDisplayFields(row, {}, pickStaticName(row, lang) ?? row.name)
    );
  }
  const batchSize = 8;
  const out = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const localized = await Promise.all(chunk.map((row) => localizeCropRow(row, lang, mode)));
    out.push(...localized);
  }
  return out;
}
function parseFarmerLanguage(code) {
  const c = (code ?? "te").toLowerCase();
  if (c === "hi" || c === "mr" || c === "ta" || c === "te" || c === "kn" || c === "en") return c;
  return "te";
}
function parseLocalizeMode(raw, limit = 500) {
  if (raw === "false" || raw === "none") return "none";
  if (raw === "full") return "full";
  if (raw === "names") return "names";
  return limit > 200 ? "names" : "full";
}

// src/services/farmAlertPushService.ts
var import_drizzle_orm19 = require("drizzle-orm");
init_db();
init_cropCalendar();
init_farmers();
init_mandiPrices();
init_notifications();
init_pushTokens();
init_weather();

// src/services/notificationInboxService.ts
var import_drizzle_orm18 = require("drizzle-orm");
init_db();
init_cropCalendar();
init_crops();
init_farmers();
init_notifications();
init_pushTokens();

// src/services/notificationCopy.ts
var EN = {
  dailyTitle: "Bhuvedam \u2014 Your farm update",
  dailyBody: "Check weather, mandi rates and crop alerts for today.",
  dailyBodyCrops: "Check weather & mandi for your crops: {crops}.",
  heavyRainTitle: "\u26C8\uFE0F Heavy rain expected",
  heavyRainBody: "Next few hours {rain}% rain chance \u2014 avoid spraying, postpone fertilizer.",
  rainTitle: "\u{1F327}\uFE0F Rain possible today",
  rainBody: "{rain}% rain chance \u2014 not good for pesticide spray. Check irrigation plan.",
  heatTitle: "\u{1F321}\uFE0F High temperature",
  heatBody: "Current {temp}\xB0C \u2014 avoid midday spray; irrigate morning/evening.",
  windTitle: "\u{1F4A8} Strong wind",
  windBody: "Wind {wind} km/h \u2014 spraying will not be effective.",
  mandiUpTitle: "\u{1F4C8} {crop} price rose",
  mandiDownTitle: "\u{1F4C9} {crop} price fell",
  mandiBody: "{crop}{variety}: \u20B9{old} \u2192 \u20B9{new}/qtl ({change}%)"
};
var HI = {
  dailyTitle: "Bhuvedam \u2014 \u0906\u092A\u0915\u0947 \u0916\u0947\u0924 \u0915\u093E \u0905\u092A\u0921\u0947\u091F",
  dailyBody: "\u0906\u091C \u092E\u094C\u0938\u092E, \u092E\u0902\u0921\u0940 \u092D\u093E\u0935 \u0914\u0930 \u092B\u0938\u0932 \u0905\u0932\u0930\u094D\u091F \u0926\u0947\u0916\u0947\u0902\u0964",
  dailyBodyCrops: "\u0906\u092A\u0915\u0940 \u092B\u0938\u0932\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u092E\u094C\u0938\u092E \u0914\u0930 \u092E\u0902\u0921\u0940 \u0926\u0947\u0916\u0947\u0902: {crops}\u0964",
  heavyRainTitle: "\u26C8\uFE0F \u092D\u093E\u0930\u0940 \u092C\u093E\u0930\u093F\u0936 \u0915\u0940 \u0938\u0902\u092D\u093E\u0935\u0928\u093E",
  heavyRainBody: "\u0905\u0917\u0932\u0947 \u0915\u0941\u091B \u0918\u0902\u091F\u094B\u0902 \u092E\u0947\u0902 {rain}% \u092C\u093E\u0930\u093F\u0936 \u2014 \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0928 \u0915\u0930\u0947\u0902, \u0916\u093E\u0926 \u091F\u093E\u0932\u0947\u0902\u0964",
  rainTitle: "\u{1F327}\uFE0F \u0906\u091C \u092C\u093E\u0930\u093F\u0936 \u0938\u0902\u092D\u0935",
  rainBody: "{rain}% \u092C\u093E\u0930\u093F\u0936 \u2014 \u0915\u0940\u091F\u0928\u093E\u0936\u0915 \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0920\u0940\u0915 \u0928\u0939\u0940\u0902\u0964 \u0938\u093F\u0902\u091A\u093E\u0908 \u092F\u094B\u091C\u0928\u093E \u091C\u093E\u0901\u091A\u0947\u0902\u0964",
  heatTitle: "\u{1F321}\uFE0F \u0924\u0947\u091C\u093C \u0917\u0930\u094D\u092E\u0940",
  heatBody: "\u0905\u092D\u0940 {temp}\xB0C \u2014 \u0926\u094B\u092A\u0939\u0930 \u092E\u0947\u0902 \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0928 \u0915\u0930\u0947\u0902; \u0938\u0941\u092C\u0939/\u0936\u093E\u092E \u0938\u093F\u0902\u091A\u093E\u0908 \u0915\u0930\u0947\u0902\u0964",
  windTitle: "\u{1F4A8} \u0924\u0947\u091C\u093C \u0939\u0935\u093E",
  windBody: "\u0939\u0935\u093E {wind} km/h \u2014 \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0905\u0938\u0930\u0926\u093E\u0930 \u0928\u0939\u0940\u0902 \u0939\u094B\u0917\u093E\u0964",
  mandiUpTitle: "\u{1F4C8} {crop} \u092D\u093E\u0935 \u092C\u0922\u093C\u093E",
  mandiDownTitle: "\u{1F4C9} {crop} \u092D\u093E\u0935 \u0918\u091F\u093E",
  mandiBody: "{crop}{variety}: \u20B9{old} \u2192 \u20B9{new}/qtl ({change}%)"
};
var TE = {
  dailyTitle: "Bhuvedam \u2014 \u0C2E\u0C40 \u0C2A\u0C4A\u0C32\u0C02 update",
  dailyBody: "\u0C08\u0C30\u0C4B\u0C1C\u0C41 \u0C35\u0C3E\u0C24\u0C3E\u0C35\u0C30\u0C23\u0C02, \u0C2E\u0C3E\u0C30\u0C4D\u0C15\u0C46\u0C1F\u0C4D \u0C30\u0C47\u0C1F\u0C4D\u0C32\u0C41 & \u0C2A\u0C02\u0C1F alerts \u0C1A\u0C42\u0C21\u0C02\u0C21\u0C3F.",
  dailyBodyCrops: "\u0C2E\u0C40 \u0C2A\u0C02\u0C1F\u0C32\u0C15\u0C41 \u0C35\u0C3E\u0C24\u0C3E\u0C35\u0C30\u0C23\u0C02 & \u0C2E\u0C3E\u0C30\u0C4D\u0C15\u0C46\u0C1F\u0C4D \u0C1A\u0C42\u0C21\u0C02\u0C21\u0C3F: {crops}.",
  heavyRainTitle: "\u26C8\uFE0F \u0C2D\u0C3E\u0C30\u0C40 \u0C35\u0C30\u0C4D\u0C37\u0C02 \u0C05\u0C35\u0C15\u0C3E\u0C36\u0C02",
  heavyRainBody: "\u0C24\u0C30\u0C4D\u0C35\u0C3E\u0C24\u0C3F \u0C17\u0C02\u0C1F\u0C32\u0C4D\u0C32\u0C4B {rain}% \u0C35\u0C30\u0C4D\u0C37\u0C02 \u2014 \u0C38\u0C4D\u0C2A\u0C4D\u0C30\u0C47 \u0C1A\u0C47\u0C2F\u0C35\u0C26\u0C4D\u0C26\u0C41, \u0C0E\u0C30\u0C41\u0C35\u0C41 \u0C35\u0C3E\u0C2F\u0C3F\u0C26\u0C3E \u0C35\u0C47\u0C2F\u0C02\u0C21\u0C3F.",
  rainTitle: "\u{1F327}\uFE0F \u0C08\u0C30\u0C4B\u0C1C\u0C41 \u0C35\u0C30\u0C4D\u0C37\u0C02 \u0C05\u0C35\u0C15\u0C3E\u0C36\u0C02",
  rainBody: "{rain}% \u0C35\u0C30\u0C4D\u0C37\u0C02 \u2014 \u0C2A\u0C41\u0C30\u0C41\u0C17\u0C41\u0C2E\u0C02\u0C26\u0C41 \u0C38\u0C4D\u0C2A\u0C4D\u0C30\u0C47\u0C15\u0C3F \u0C2E\u0C02\u0C1A\u0C3F\u0C26\u0C3F \u0C15\u0C3E\u0C26\u0C41. \u0C28\u0C40\u0C1F\u0C3F\u0C2A\u0C3E\u0C30\u0C41\u0C26\u0C32 \u0C2A\u0C4D\u0C32\u0C3E\u0C28\u0C4D \u0C1A\u0C42\u0C21\u0C02\u0C21\u0C3F.",
  heatTitle: "\u{1F321}\uFE0F \u0C0E\u0C15\u0C4D\u0C15\u0C41\u0C35 \u0C09\u0C37\u0C4D\u0C23\u0C4B\u0C17\u0C4D\u0C30\u0C24",
  heatBody: "\u0C2A\u0C4D\u0C30\u0C38\u0C4D\u0C24\u0C41\u0C24\u0C02 {temp}\xB0C \u2014 \u0C2E\u0C27\u0C4D\u0C2F\u0C3E\u0C39\u0C4D\u0C28\u0C02 \u0C38\u0C4D\u0C2A\u0C4D\u0C30\u0C47 \u0C1A\u0C47\u0C2F\u0C35\u0C26\u0C4D\u0C26\u0C41; \u0C09\u0C26\u0C2F\u0C02/\u0C38\u0C3E\u0C2F\u0C02\u0C24\u0C4D\u0C30\u0C02 \u0C28\u0C40\u0C30\u0C41 \u0C2A\u0C46\u0C1F\u0C4D\u0C1F\u0C02\u0C21\u0C3F.",
  windTitle: "\u{1F4A8} \u0C2C\u0C32\u0C2E\u0C48\u0C28 \u0C17\u0C3E\u0C32\u0C3F",
  windBody: "\u0C17\u0C3E\u0C32\u0C3F {wind} km/h \u2014 \u0C38\u0C4D\u0C2A\u0C4D\u0C30\u0C47 \u0C2A\u0C28\u0C3F \u0C1A\u0C47\u0C2F\u0C26\u0C41.",
  mandiUpTitle: "\u{1F4C8} {crop} \u0C30\u0C47\u0C1F\u0C41 \u0C2A\u0C46\u0C30\u0C3F\u0C17\u0C3F\u0C02\u0C26\u0C3F",
  mandiDownTitle: "\u{1F4C9} {crop} \u0C30\u0C47\u0C1F\u0C41 \u0C24\u0C17\u0C4D\u0C17\u0C3F\u0C02\u0C26\u0C3F",
  mandiBody: "{crop}{variety}: \u20B9{old} \u2192 \u20B9{new}/qtl ({change}%)"
};
var BY_LANG = {
  en: EN,
  hi: HI,
  te: TE,
  mr: HI,
  ta: TE,
  kn: TE
};
function normalizeNotifLang(code) {
  const c = (code ?? "te").trim().toLowerCase().slice(0, 2);
  return c in BY_LANG ? c : "te";
}
function tNotif(lang, key, vars) {
  const code = normalizeNotifLang(lang);
  const dict = BY_LANG[code] ?? TE;
  let out = dict[key] ?? EN[key] ?? TE[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.split(`{${k}}`).join(String(v));
    }
  }
  return out;
}
function dailyReminderCopy(lang, cropNames) {
  const crops2 = (cropNames ?? []).filter(Boolean).slice(0, 4).join(", ");
  return {
    title: tNotif(lang, "dailyTitle"),
    body: crops2 ? tNotif(lang, "dailyBodyCrops", { crops: crops2 }) : tNotif(lang, "dailyBody")
  };
}

// src/services/pushNotificationService.ts
var import_expo_server_sdk = require("expo-server-sdk");
var import_drizzle_orm17 = require("drizzle-orm");
init_db();
init_pushTokens();
var expo = new import_expo_server_sdk.Expo();
async function getFarmerPushTokens(farmerId) {
  const rows = await db.select({ token: pushTokens.expoPushToken }).from(pushTokens).where((0, import_drizzle_orm17.eq)(pushTokens.farmerId, farmerId));
  return rows.map((r) => r.token).filter((t) => import_expo_server_sdk.Expo.isExpoPushToken(t));
}
async function sendExpoPush(tokens, title, body, data = {}) {
  const valid = tokens.filter((t) => import_expo_server_sdk.Expo.isExpoPushToken(t));
  if (!valid.length) return { sent: 0, failed: 0 };
  const messages = valid.map((to) => ({
    to,
    sound: "default",
    title: title.slice(0, 200),
    body: body.slice(0, 500),
    data,
    channelId: "farm-alerts"
  }));
  const chunks = expo.chunkPushNotifications(messages);
  let sent = 0;
  let failed = 0;
  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      for (const ticket of tickets) {
        if (ticket.status === "ok") sent += 1;
        else failed += 1;
      }
    } catch {
      failed += chunk.length;
    }
  }
  return { sent, failed };
}
async function sendPushToFarmer(farmerId, title, body, data = {}) {
  const tokens = await getFarmerPushTokens(farmerId);
  return sendExpoPush(tokens, title, body, data);
}

// src/services/notificationInboxService.ts
async function registerPushToken(farmerId, expoPushToken, platform) {
  const now = /* @__PURE__ */ new Date();
  await db.insert(pushTokens).values({ farmerId, expoPushToken, platform, updatedAt: now }).onConflictDoUpdate({
    target: pushTokens.expoPushToken,
    set: { farmerId, platform, updatedAt: now }
  });
}
async function removePushToken(farmerId, expoPushToken) {
  await db.delete(pushTokens).where((0, import_drizzle_orm18.and)((0, import_drizzle_orm18.eq)(pushTokens.farmerId, farmerId), (0, import_drizzle_orm18.eq)(pushTokens.expoPushToken, expoPushToken)));
}
async function listFarmerNotifications(farmerId, limit = 30) {
  return db.select().from(notifications).where((0, import_drizzle_orm18.eq)(notifications.farmerId, farmerId)).orderBy((0, import_drizzle_orm18.desc)(notifications.createdAt)).limit(limit);
}
async function markNotificationRead(farmerId, notificationId) {
  const result = await db.update(notifications).set({ isRead: true, readAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm18.and)((0, import_drizzle_orm18.eq)(notifications.id, notificationId), (0, import_drizzle_orm18.eq)(notifications.farmerId, farmerId))).returning({ id: notifications.id });
  return result.length > 0;
}
async function markAllNotificationsRead(farmerId) {
  const result = await db.update(notifications).set({ isRead: true, readAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm18.and)((0, import_drizzle_orm18.eq)(notifications.farmerId, farmerId), (0, import_drizzle_orm18.eq)(notifications.isRead, false))).returning({ id: notifications.id });
  return result.length;
}
async function createAndPushNotification(farmerId, input) {
  const [row] = await db.insert(notifications).values({
    farmerId,
    type: input.type,
    title: input.title.slice(0, 200),
    body: input.body,
    data: input.data ?? {}
  }).returning({ id: notifications.id });
  let pushSent = 0;
  if (input.sendPush !== false) {
    const result = await sendPushToFarmer(farmerId, input.title, input.body, {
      notificationId: row.id,
      type: input.type,
      ...input.data
    });
    pushSent = result.sent;
  }
  return { notificationId: row.id, pushSent };
}
async function cropNamesForFarmer(farmerId, lang) {
  const calendar = await db.select({ cropId: cropCalendar.cropId }).from(cropCalendar).where((0, import_drizzle_orm18.eq)(cropCalendar.farmerId, farmerId));
  const ids = [...new Set(calendar.map((r) => r.cropId))];
  if (!ids.length) return [];
  const rows = await db.select().from(crops).where((0, import_drizzle_orm18.inArray)(crops.id, ids));
  return rows.map((c) => {
    const localized = c.localizedNames ?? {};
    if (localized[lang]) return localized[lang];
    if (lang === "te" && c.nameTe) return c.nameTe;
    return c.name;
  });
}
async function dispatchDailyFarmReminders() {
  const rows = await db.select({ farmerId: pushTokens.farmerId }).from(pushTokens);
  const farmerIds = [...new Set(rows.map((r) => r.farmerId))];
  let sent = 0;
  for (const farmerId of farmerIds) {
    const [farmer] = await db.select({ language: farmers.language, name: farmers.name }).from(farmers).where((0, import_drizzle_orm18.eq)(farmers.id, farmerId)).limit(1);
    const lang = farmer?.language ?? "te";
    const cropNames = await cropNamesForFarmer(farmerId, lang);
    const copy = dailyReminderCopy(lang, cropNames);
    const result = await createAndPushNotification(farmerId, {
      type: "crop_calendar",
      title: copy.title,
      body: copy.body,
      data: {
        source: "daily_cron",
        language: lang,
        crops: cropNames,
        farmerName: farmer?.name ?? null
      }
    });
    sent += result.pushSent;
  }
  return { farmers: farmerIds.length, sent };
}

// src/services/farmAlertPushService.ts
var WEATHER_THRESHOLDS = {
  rainChancePercent: 60,
  heavyRainPercent: 80,
  heatTempC: 40,
  highWindKmh: 30
};
var MANDI_PRICE_CHANGE_THRESHOLD = 5;
var ALERT_DEDUPE_HOURS = 12;
var MAX_PUSH_PER_RUN = 3;
async function getFarmerCropIds(farmerId) {
  const rows = await db.select({ cropId: cropCalendar.cropId }).from(cropCalendar).where((0, import_drizzle_orm19.eq)(cropCalendar.farmerId, farmerId));
  return [...new Set(rows.map((r) => r.cropId))];
}
async function getFarmerLanguage(farmerId) {
  const [row] = await db.select({ language: farmers.language }).from(farmers).where((0, import_drizzle_orm19.eq)(farmers.id, farmerId)).limit(1);
  return row?.language ?? "te";
}
async function getFarmerLandContext(farmerId) {
  const [land] = await db.select({ state: lands.state, district: lands.district }).from(lands).where((0, import_drizzle_orm19.eq)(lands.farmerId, farmerId)).limit(1);
  return { state: land?.state ?? null, district: land?.district ?? null };
}
async function getLatestWeatherRow(farmerId) {
  const [farmerRow] = await db.select().from(weather).where((0, import_drizzle_orm19.eq)(weather.farmerId, farmerId)).orderBy((0, import_drizzle_orm19.desc)(weather.fetchedAt)).limit(1);
  if (farmerRow) return farmerRow;
  const { state, district } = await getFarmerLandContext(farmerId);
  const [globalRows] = await Promise.all([
    db.select().from(weather).where((0, import_drizzle_orm19.isNull)(weather.farmerId)).orderBy((0, import_drizzle_orm19.desc)(weather.fetchedAt)).limit(40)
  ]);
  const needle = `${district ?? ""} ${state ?? ""}`.toLowerCase();
  if (needle.trim()) {
    const match = globalRows.find((r) => {
      const label = `${r.locationName ?? ""}`.toLowerCase();
      return district && label.includes(district.toLowerCase()) || state && label.includes(state.toLowerCase().split(" ")[0] ?? "");
    });
    if (match) return match;
  }
  return globalRows.find((r) => `${r.locationName ?? ""}`.toLowerCase().includes("hyderabad")) ?? globalRows[0] ?? null;
}
function buildWeatherAlerts(row, lang) {
  const alerts = [];
  const temp = Number(row.temperature ?? 0);
  const rain = Number(row.precipitation ?? 0);
  const wind = Number(row.windSpeed ?? 0);
  const hourly = row.hourly ?? [];
  const maxHourlyRain = hourly.slice(0, 8).reduce((max, h) => Math.max(max, Number(h.precipitation ?? 0)), 0);
  const maxRain = Math.max(rain, maxHourlyRain);
  if (maxRain >= WEATHER_THRESHOLDS.heavyRainPercent) {
    alerts.push({
      alertKey: `weather-heavy-rain-${row.locationName}`,
      type: "weather_alert",
      title: tNotif(lang, "heavyRainTitle"),
      body: tNotif(lang, "heavyRainBody", { rain: maxRain }),
      data: { rainPercent: maxRain, source: "realtime_cron", language: lang }
    });
  } else if (maxRain >= WEATHER_THRESHOLDS.rainChancePercent) {
    alerts.push({
      alertKey: `weather-rain-${row.locationName}`,
      type: "weather_alert",
      title: tNotif(lang, "rainTitle"),
      body: tNotif(lang, "rainBody", { rain: maxRain }),
      data: { rainPercent: maxRain, source: "realtime_cron", language: lang }
    });
  }
  if (temp >= WEATHER_THRESHOLDS.heatTempC) {
    alerts.push({
      alertKey: `weather-heat-${row.locationName}-${Math.round(temp)}`,
      type: "weather_alert",
      title: tNotif(lang, "heatTitle"),
      body: tNotif(lang, "heatBody", { temp }),
      data: { tempC: temp, source: "realtime_cron", language: lang }
    });
  }
  if (wind >= WEATHER_THRESHOLDS.highWindKmh) {
    alerts.push({
      alertKey: `weather-wind-${row.locationName}`,
      type: "weather_alert",
      title: tNotif(lang, "windTitle"),
      body: tNotif(lang, "windBody", { wind: wind.toFixed(0) }),
      data: { windKmh: wind, source: "realtime_cron", language: lang }
    });
  }
  return alerts;
}
async function buildMandiAlerts(cropIds, lang, state, district) {
  if (!cropIds.length) return [];
  const alerts = [];
  for (const cropId of cropIds.slice(0, 6)) {
    const conditions = [(0, import_drizzle_orm19.eq)(mandiPrices.cropId, cropId)];
    if (state) conditions.push((0, import_drizzle_orm19.eq)(mandiPrices.state, state));
    if (district) conditions.push((0, import_drizzle_orm19.eq)(mandiPrices.district, district));
    let [latest] = await db.select().from(mandiPrices).where((0, import_drizzle_orm19.and)(...conditions)).orderBy((0, import_drizzle_orm19.desc)(mandiPrices.fetchedAt)).limit(1);
    if (!latest && district && state) {
      [latest] = await db.select().from(mandiPrices).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(mandiPrices.cropId, cropId), (0, import_drizzle_orm19.eq)(mandiPrices.state, state))).orderBy((0, import_drizzle_orm19.desc)(mandiPrices.fetchedAt)).limit(1);
    }
    if (!latest) {
      [latest] = await db.select().from(mandiPrices).where((0, import_drizzle_orm19.eq)(mandiPrices.cropId, cropId)).orderBy((0, import_drizzle_orm19.desc)(mandiPrices.fetchedAt)).limit(1);
    }
    if (!latest) continue;
    const [older] = await db.select().from(mandiPrices).where(
      (0, import_drizzle_orm19.and)(
        (0, import_drizzle_orm19.eq)(mandiPrices.cropId, cropId),
        (0, import_drizzle_orm19.eq)(mandiPrices.market, latest.market),
        import_drizzle_orm19.sql`${mandiPrices.fetchedAt} < ${latest.fetchedAt} - interval '20 hours'`
      )
    ).orderBy((0, import_drizzle_orm19.desc)(mandiPrices.fetchedAt)).limit(1);
    if (!older) continue;
    const newPrice = Number(latest.modalPrice);
    const oldPrice = Number(older.modalPrice);
    if (!newPrice || !oldPrice) continue;
    const changePct = (newPrice - oldPrice) / oldPrice * 100;
    if (Math.abs(changePct) < MANDI_PRICE_CHANGE_THRESHOLD) continue;
    const up = changePct > 0;
    const variety = latest.varietyName ? ` (${latest.varietyName})` : "";
    const change = `${up ? "+" : ""}${changePct.toFixed(1)}`;
    alerts.push({
      alertKey: `mandi-${cropId}-${latest.market}-${latest.varietyName ?? "default"}-${up ? "up" : "down"}`,
      type: "mandi_alert",
      title: tNotif(lang, up ? "mandiUpTitle" : "mandiDownTitle", {
        crop: latest.commodity
      }),
      body: tNotif(lang, "mandiBody", {
        crop: latest.commodity,
        variety,
        old: oldPrice,
        new: newPrice,
        change
      }),
      data: {
        cropId,
        changePct,
        oldPrice,
        newPrice,
        market: latest.market,
        district: latest.district,
        state: latest.state,
        source: "realtime_cron",
        language: lang
      }
    });
  }
  return alerts.slice(0, 5);
}
async function wasAlertSentRecently(farmerId, alertKey) {
  const since = new Date(Date.now() - ALERT_DEDUPE_HOURS * 60 * 60 * 1e3);
  const rows = await db.select({ data: notifications.data }).from(notifications).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(notifications.farmerId, farmerId), (0, import_drizzle_orm19.gte)(notifications.createdAt, since)));
  return rows.some((r) => r.data?.alertKey === alertKey);
}
async function collectPendingAlertsForFarmer(farmerId) {
  const [cropIds, lang, land] = await Promise.all([
    getFarmerCropIds(farmerId),
    getFarmerLanguage(farmerId),
    getFarmerLandContext(farmerId)
  ]);
  const weatherRow = await getLatestWeatherRow(farmerId);
  const weatherAlerts = weatherRow ? buildWeatherAlerts(weatherRow, lang) : [];
  const mandiAlerts = await buildMandiAlerts(cropIds, lang, land.state, land.district);
  return [...weatherAlerts, ...mandiAlerts];
}
async function dispatchRealtimeAlertsForFarmer(farmerId) {
  const tokens = await getFarmerPushTokens(farmerId);
  if (!tokens.length) return { pushed: 0, candidates: 0 };
  const pending = await collectPendingAlertsForFarmer(farmerId);
  let pushed = 0;
  for (const alert of pending.slice(0, MAX_PUSH_PER_RUN)) {
    if (await wasAlertSentRecently(farmerId, alert.alertKey)) continue;
    const result = await createAndPushNotification(farmerId, {
      type: alert.type,
      title: alert.title,
      body: alert.body,
      data: { ...alert.data, alertKey: alert.alertKey },
      sendPush: true
    });
    pushed += result.pushSent;
  }
  return { pushed, candidates: pending.length };
}
async function dispatchRealtimeAlertsForAll() {
  const rows = await db.select({ farmerId: pushTokens.farmerId }).from(pushTokens);
  const farmerIds = [...new Set(rows.map((r) => r.farmerId))];
  let pushed = 0;
  let candidates = 0;
  for (const farmerId of farmerIds) {
    const result = await dispatchRealtimeAlertsForFarmer(farmerId);
    pushed += result.pushed;
    candidates += result.candidates;
  }
  return { farmers: farmerIds.length, pushed, candidates };
}

// src/services/farmerSync.ts
var import_drizzle_orm20 = require("drizzle-orm");
init_db();
init_cropCalendar();
init_crops();
init_farmers();
function toSowingDate(month, year) {
  const m = Number(month);
  const y = Number(year) || (/* @__PURE__ */ new Date()).getFullYear();
  if (!Number.isFinite(m) || m < 1 || m > 12) return null;
  return `${y}-${String(m).padStart(2, "0")}-01`;
}
function averageCoordinate(points) {
  if (!points?.length) return null;
  const valid = points.filter(
    (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
  );
  if (!valid.length) return null;
  const lat = valid.reduce((sum, p) => sum + p.latitude, 0) / valid.length;
  const lon = valid.reduce((sum, p) => sum + p.longitude, 0) / valid.length;
  return { latitude: lat.toFixed(7), longitude: lon.toFixed(7) };
}
function locationLabel(input) {
  const parts = [input.village, input.mandal, input.district, input.state].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}
var MAX_FARM_SIZE_LEN = 255;
var MAX_LOCATION_LABEL_LEN = 200;
function clampText(value, maxLen) {
  const trimmed = value?.trim();
  if (!trimmed) return void 0;
  return trimmed.length <= maxLen ? trimmed : trimmed.slice(0, maxLen - 1) + "\u2026";
}
function normalizeFarmSize(input) {
  if (input.areaAcres != null && Number.isFinite(input.areaAcres)) {
    const acres = input.areaAcres;
    if (input.areaCents != null && Number.isFinite(input.areaCents)) {
      return clampText(`${acres} acres, ${input.areaCents} cents`, MAX_FARM_SIZE_LEN);
    }
    return clampText(`${acres} acres`, MAX_FARM_SIZE_LEN);
  }
  return clampText(input.farmSize, MAX_FARM_SIZE_LEN);
}
function resolveAreaAcres(input) {
  if (input.areaAcres != null && Number.isFinite(input.areaAcres)) {
    return String(input.areaAcres);
  }
  if (input.fieldMeasurement?.areaAcres != null) {
    return String(input.fieldMeasurement.areaAcres);
  }
  return null;
}
function resolveExtentAcres(input) {
  const raw = input.landExtentAcres?.trim();
  if (raw) {
    const n = Number(raw.replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) return String(n);
  }
  return null;
}
async function syncSurveyRecord(landId, input) {
  if (input.surveyNumber === void 0 && input.khataNumber === void 0 && input.landExtentAcres === void 0) {
    return;
  }
  const survey = input.surveyNumber?.trim() || "";
  const khata = input.khataNumber?.trim() || null;
  const extent = resolveExtentAcres(input);
  const revenueVillage = input.village?.trim() || null;
  await db.delete(surveyNumbers).where((0, import_drizzle_orm20.eq)(surveyNumbers.landId, landId));
  if (!survey && !khata) return;
  await db.insert(surveyNumbers).values({
    landId,
    surveyNumber: survey || "\u2014",
    khataNumber: khata,
    extentAcres: extent,
    revenueVillage
  });
}
async function upsertFarmerByPhone(phone, name, language = "te") {
  const existing = await db.query.farmers.findFirst({
    where: (0, import_drizzle_orm20.eq)(farmers.phone, phone)
  });
  if (existing) {
    const [updated] = await db.update(farmers).set({
      name,
      language: language || existing.language,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm20.eq)(farmers.id, existing.id)).returning();
    return updated;
  }
  const [created] = await db.insert(farmers).values({ phone, name, language }).returning();
  return created;
}
async function syncFarmerProfile(farmerId, input) {
  const now = /* @__PURE__ */ new Date();
  const label = clampText(locationLabel(input) ?? void 0, MAX_LOCATION_LABEL_LEN) ?? null;
  const farmSize = normalizeFarmSize(input);
  await db.update(farmers).set({
    ...input.name ? { name: input.name.trim().slice(0, 120) } : {},
    ...input.language ? { language: input.language.slice(0, 10) } : {},
    ...farmSize ? { farmSize } : {},
    ...label ? { locationLabel: label } : {},
    ...input.notes?.length ? { notes: input.notes.slice(0, 12) } : {},
    updatedAt: now
  }).where((0, import_drizzle_orm20.eq)(farmers.id, farmerId));
  const coords = averageCoordinate(input.fieldMeasurement?.points);
  const areaAcres = resolveAreaAcres(input);
  const landPatch = {
    label: input.village?.trim() ? `${input.village.trim()} field` : "Main field",
    areaAcres,
    village: input.village?.trim() || null,
    mandal: input.mandal?.trim() || null,
    district: input.district?.trim() || "Unknown",
    state: input.state?.trim() || "Andhra Pradesh",
    soilType: input.soilType?.trim() || null,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    updatedAt: now
  };
  const [existingLand] = await db.select().from(lands).where((0, import_drizzle_orm20.eq)(lands.farmerId, farmerId)).limit(1);
  let landId;
  if (existingLand) {
    await db.update(lands).set(landPatch).where((0, import_drizzle_orm20.eq)(lands.id, existingLand.id));
    landId = existingLand.id;
  } else {
    const [inserted] = await db.insert(lands).values({ farmerId, ...landPatch }).returning();
    landId = inserted.id;
  }
  await syncSurveyRecord(landId, input);
  await db.delete(cropCalendar).where((0, import_drizzle_orm20.eq)(cropCalendar.farmerId, farmerId));
  const plantings = input.cropPlantings?.length ? input.cropPlantings : (input.crops ?? []).map((cropId) => ({ cropId }));
  for (const planting of plantings) {
    const cropId = planting.cropId?.trim();
    if (!cropId) continue;
    const cropRow = await db.query.crops.findFirst({
      where: (0, import_drizzle_orm20.eq)(crops.id, cropId)
    });
    if (!cropRow) continue;
    await db.insert(cropCalendar).values({
      farmerId,
      landId,
      cropId,
      varietyName: planting.varietyName?.trim() || null,
      sowingDate: toSowingDate(planting.sowingMonth, planting.sowingYear),
      stage: "planned"
    });
  }
  return db.query.farmers.findFirst({
    where: (0, import_drizzle_orm20.eq)(farmers.id, farmerId),
    with: {
      lands: {
        with: { surveyNumbers: true }
      },
      cropCalendars: true
    }
  });
}
function formatFarmerProfileForApp(profile) {
  const land = profile.lands?.[0];
  const survey = land?.surveyNumbers?.[0];
  const landAcres = land?.areaAcres ? String(land.areaAcres) : "";
  const cropPlantings = (profile.cropCalendars ?? []).map((cal) => {
    const sowing = cal.sowingDate ? String(cal.sowingDate) : "";
    const [year, month] = sowing.split("-");
    return {
      cropId: cal.cropId,
      varietyName: cal.varietyName?.trim() ?? "",
      areaAcres: landAcres,
      areaCents: "",
      sowingMonth: month ? String(Number(month)) : "",
      sowingYear: year ?? String((/* @__PURE__ */ new Date()).getFullYear())
    };
  });
  const crops2 = [...new Set(cropPlantings.map((p) => p.cropId))];
  const locationReady = Boolean(
    land?.district?.trim() && land?.mandal?.trim() && land?.village?.trim() && land?.state?.trim()
  );
  const plantingsReady = crops2.length > 0 && cropPlantings.length >= crops2.length && cropPlantings.every(
    (p) => Boolean(p.varietyName.trim()) && Boolean(p.sowingMonth.trim()) && Boolean(p.areaAcres.trim() || p.areaCents.trim())
  );
  const surveyNumber = survey?.surveyNumber && survey.surveyNumber !== "\u2014" ? survey.surveyNumber : void 0;
  return {
    name: profile.name,
    language: profile.language,
    location: profile.locationLabel ?? void 0,
    farmSize: profile.farmSize ?? void 0,
    crops: crops2,
    cropPlantings,
    district: land?.district ?? void 0,
    mandal: land?.mandal ?? void 0,
    village: land?.village ?? void 0,
    state: land?.state ?? void 0,
    soilType: land?.soilType ?? void 0,
    surveyNumber,
    khataNumber: survey?.khataNumber ?? void 0,
    landExtentAcres: survey?.extentAcres ? String(survey.extentAcres) : void 0,
    areaAcres: land?.areaAcres ? Number(land.areaAcres) : void 0,
    notes: profile.notes ?? [],
    setupComplete: locationReady && plantingsReady
  };
}
async function getFarmerProfile(farmerId) {
  return db.query.farmers.findFirst({
    where: (0, import_drizzle_orm20.and)((0, import_drizzle_orm20.eq)(farmers.id, farmerId), (0, import_drizzle_orm20.eq)(farmers.isActive, true)),
    with: {
      lands: {
        with: { surveyNumbers: true }
      },
      cropCalendars: true
    }
  });
}

// src/services/fertilizerProductSearch.ts
var import_drizzle_orm21 = require("drizzle-orm");
init_db();
init_fertilizerProducts();
function applyOfficialMrpOverlay(row) {
  const official = resolveOfficialMrp({
    id: row.id,
    name: row.name,
    npk: row.npk
  });
  const baseMeta = row.metadata ?? {};
  if (!official) {
    const hasPrice = Boolean(row.mrp || row.price);
    return {
      ...row,
      mrp: row.mrp ?? row.price ?? null,
      price: row.price ?? row.mrp ?? null,
      priceSourceLabel: hasPrice ? typeof baseMeta.priceSourceLabel === "string" ? baseMeta.priceSourceLabel : FERTILIZER_PRICE_SOURCE.label : null,
      priceNote: hasPrice ? typeof baseMeta.priceNote === "string" ? baseMeta.priceNote : FERTILIZER_PRICE_SOURCE.note : null,
      metadata: baseMeta
    };
  }
  return {
    ...row,
    mrp: official.mrp,
    price: official.mrp,
    packSize: row.packSize || official.packSize,
    isSubsidized: official.isSubsidized || row.isSubsidized,
    priceSourceLabel: FERTILIZER_PRICE_SOURCE.label,
    priceNote: FERTILIZER_PRICE_SOURCE.note,
    metadata: {
      ...baseMeta,
      priceSource: FERTILIZER_PRICE_SOURCE.id,
      priceSourceLabel: FERTILIZER_PRICE_SOURCE.label,
      priceNote: FERTILIZER_PRICE_SOURCE.note,
      officialGrade: official.grade
    }
  };
}
async function searchFertilizerProducts(query) {
  const limit = Math.min(query.limit ?? 100, 500);
  const conditions = [];
  if (query.brand) {
    conditions.push((0, import_drizzle_orm21.ilike)(fertilizerProducts.brand, query.brand));
  }
  if (query.category) {
    conditions.push((0, import_drizzle_orm21.eq)(fertilizerProducts.category, query.category));
  }
  if (query.source) {
    conditions.push((0, import_drizzle_orm21.eq)(fertilizerProducts.source, query.source));
  }
  if (query.search?.trim()) {
    const pattern = `%${query.search.trim()}%`;
    conditions.push(
      (0, import_drizzle_orm21.or)(
        (0, import_drizzle_orm21.ilike)(fertilizerProducts.name, pattern),
        (0, import_drizzle_orm21.ilike)(fertilizerProducts.brand, pattern),
        (0, import_drizzle_orm21.ilike)(fertilizerProducts.npk, pattern),
        (0, import_drizzle_orm21.ilike)(fertilizerProducts.nutrient, pattern)
      )
    );
  }
  if (query.crop?.trim()) {
    const cropId = query.crop.trim().toLowerCase();
    conditions.push(import_drizzle_orm21.sql`${fertilizerProducts.crops} @> ${JSON.stringify([cropId])}::jsonb`);
  }
  const rows = conditions.length ? await db.select().from(fertilizerProducts).where((0, import_drizzle_orm21.and)(...conditions)).limit(limit) : await db.select().from(fertilizerProducts).limit(limit);
  return enrichProductsWithImages(
    rows.map((r) => {
      const withMrp = applyOfficialMrpOverlay(r);
      return {
        ...withMrp,
        type: "fertilizer",
        category: withMrp.category,
        sourceUrl: mergeManufacturerSourceUrl(withMrp.id, withMrp.sourceUrl) ?? withMrp.sourceUrl
      };
    })
  );
}
async function getFertilizerProductById(id) {
  const [row] = await db.select().from(fertilizerProducts).where((0, import_drizzle_orm21.eq)(fertilizerProducts.id, id)).limit(1);
  if (!row) return null;
  const withMrp = applyOfficialMrpOverlay(row);
  return enrichProductImageAsync({
    ...withMrp,
    type: "fertilizer",
    category: withMrp.category,
    sourceUrl: mergeManufacturerSourceUrl(withMrp.id, withMrp.sourceUrl) ?? withMrp.sourceUrl
  });
}

// src/server/index.ts
init_knowledgeSearch();

// src/services/otpService.ts
var import_drizzle_orm22 = require("drizzle-orm");
var import_node_crypto3 = require("node:crypto");
init_db();
init_farmers();
init_otpCodes();
var OTP_TTL_MS = 5 * 60 * 1e3;
var OTP_COOLDOWN_MS = 60 * 1e3;
var MAX_ATTEMPTS = 5;
var TWOFACTOR_SESSION_PREFIX = "tf:";
function hashOtp(code, phone) {
  return (0, import_node_crypto3.createHash)("sha256").update(`${phone}:${code}:${process.env.OTP_PEPPER ?? "bhuvedam"}`).digest("hex");
}
function generateOtp() {
  return String((0, import_node_crypto3.randomInt)(1e5, 999999));
}
function mobileTenDigits(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits.slice(-10);
}
function resolveOtpChannel() {
  const raw = process.env.OTP_CHANNEL?.trim().toLowerCase();
  if (raw === "sms") return "sms";
  return "voice";
}
async function parseTwoFactorJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}
async function sendVoiceCallOtp(phone) {
  const apiKey = process.env.TWOFACTOR_API_KEY?.trim();
  if (!apiKey) return null;
  const mobile = mobileTenDigits(phone);
  const url = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/VOICE/${mobile}/AUTOGEN`;
  try {
    const res = await fetch(url);
    const data = await parseTwoFactorJson(res);
    if (!res.ok || data.Status !== "Success" || !data.Details) {
      console.error("[OTP] Voice call failed", data.Details ?? res.status);
      return null;
    }
    console.log(`[OTP] Voice call initiated \u2192 ${phoneForDisplay(phone)}`);
    return data.Details;
  } catch (err) {
    console.error("[OTP] Voice call failed", err);
    return null;
  }
}
async function sendTransactionalSmsOtp(phone, code) {
  const apiKey = process.env.TWOFACTOR_API_KEY?.trim();
  const templateName = process.env.TWOFACTOR_OTP_TEMPLATE?.trim() || "BhuvedamLoginOTP";
  const senderId = process.env.TWOFACTOR_SENDER_ID?.trim() || "BHUVED";
  if (!apiKey) return false;
  const mobile = mobileTenDigits(phone);
  const url = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/ADDON_SERVICES/SEND/TSMS`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        From: senderId,
        To: mobile,
        TemplateName: templateName,
        VAR1: code
      })
    });
    const data = await parseTwoFactorJson(res);
    if (!res.ok || data.Status !== "Success") {
      console.error("[OTP] TSMS failed", data.Details ?? res.status);
      return false;
    }
    console.log(`[OTP] Text SMS sent (TSMS/${templateName}/${senderId}) \u2192 ${phoneForDisplay(phone)}`);
    return true;
  } catch (err) {
    console.error("[OTP] TSMS send failed", err);
    return false;
  }
}
function storeTwoFactorSession(sessionId) {
  return `${TWOFACTOR_SESSION_PREFIX}${sessionId}`;
}
function readTwoFactorSession(codeHash) {
  return codeHash.startsWith(TWOFACTOR_SESSION_PREFIX) ? codeHash.slice(TWOFACTOR_SESSION_PREFIX.length) : null;
}
async function verifyTwoFactorOtp(sessionId, otp) {
  const apiKey = process.env.TWOFACTOR_API_KEY?.trim();
  if (!apiKey || !sessionId) return false;
  const url = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/VERIFY/${encodeURIComponent(sessionId)}/${otp}`;
  try {
    const res = await fetch(url);
    const data = await parseTwoFactorJson(res);
    return res.ok && data.Status === "Success" && data.Details === "OTP Matched";
  } catch (err) {
    console.error("[OTP] 2Factor verify failed", err);
    return false;
  }
}
async function sendPhoneOtp(rawPhone) {
  const phone = formatPhone(rawPhone);
  const [recent] = await db.select().from(otpCodes).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(otpCodes.phone, phone), (0, import_drizzle_orm22.gt)(otpCodes.createdAt, new Date(Date.now() - OTP_COOLDOWN_MS)))).orderBy((0, import_drizzle_orm22.desc)(otpCodes.createdAt)).limit(1);
  if (recent) {
    const waitSec = Math.ceil(
      (recent.createdAt.getTime() + OTP_COOLDOWN_MS - Date.now()) / 1e3
    );
    throw new Error(`WAIT_${Math.max(waitSec, 1)}`);
  }
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  const twoFactorKey = process.env.TWOFACTOR_API_KEY?.trim();
  const devMode = process.env.OTP_DEV_MODE === "true";
  const channel = resolveOtpChannel();
  if (twoFactorKey && !devMode) {
    if (channel === "sms") {
      const code2 = generateOtp();
      const tsmsOk = await sendTransactionalSmsOtp(phone, code2);
      if (!tsmsOk) throw new Error("SMS_FAILED");
      await db.insert(otpCodes).values({
        phone,
        codeHash: hashOtp(code2, phone),
        expiresAt
      });
      return { sent: true, expiresInSec: OTP_TTL_MS / 1e3, channel: "sms" };
    }
    const sessionId = await sendVoiceCallOtp(phone);
    if (!sessionId) throw new Error("VOICE_FAILED");
    await db.insert(otpCodes).values({
      phone,
      codeHash: storeTwoFactorSession(sessionId),
      expiresAt
    });
    return { sent: true, expiresInSec: OTP_TTL_MS / 1e3, channel: "voice" };
  }
  const code = generateOtp();
  await db.insert(otpCodes).values({
    phone,
    codeHash: hashOtp(code, phone),
    expiresAt
  });
  if (devMode) {
    console.log(`[OTP dev] ${phoneForDisplay(phone)} \u2192 ${code}`);
    return { sent: true, expiresInSec: OTP_TTL_MS / 1e3, channel: "voice", devOtp: code };
  }
  throw new Error("SMS_FAILED");
}
async function verifyPhoneOtp(rawPhone, otp) {
  const phone = formatPhone(rawPhone);
  const code = otp.replace(/\D/g, "");
  if (code.length !== 6) return { valid: false, reason: "invalid" };
  const [row] = await db.select().from(otpCodes).where((0, import_drizzle_orm22.and)((0, import_drizzle_orm22.eq)(otpCodes.phone, phone), (0, import_drizzle_orm22.gt)(otpCodes.expiresAt, /* @__PURE__ */ new Date()))).orderBy((0, import_drizzle_orm22.desc)(otpCodes.createdAt)).limit(1);
  if (!row) return { valid: false, reason: "expired" };
  if (row.attempts >= MAX_ATTEMPTS) return { valid: false, reason: "max_attempts" };
  let match = false;
  const sessionId = readTwoFactorSession(row.codeHash);
  if (sessionId) {
    match = await verifyTwoFactorOtp(sessionId, code);
  } else {
    match = row.codeHash === hashOtp(code, phone);
  }
  await db.update(otpCodes).set({ attempts: row.attempts + 1 }).where((0, import_drizzle_orm22.eq)(otpCodes.id, row.id));
  if (!match) return { valid: false, reason: "invalid" };
  await db.update(otpCodes).set({ verifiedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm22.eq)(otpCodes.id, row.id));
  return { valid: true };
}
async function hasVerifiedOtpSession(rawPhone) {
  const phone = formatPhone(rawPhone);
  const [row] = await db.select().from(otpCodes).where(
    (0, import_drizzle_orm22.and)(
      (0, import_drizzle_orm22.eq)(otpCodes.phone, phone),
      (0, import_drizzle_orm22.gt)(otpCodes.expiresAt, /* @__PURE__ */ new Date()),
      (0, import_drizzle_orm22.isNotNull)(otpCodes.verifiedAt)
    )
  ).orderBy((0, import_drizzle_orm22.desc)(otpCodes.createdAt)).limit(1);
  return Boolean(row);
}
async function consumeOtpSession(rawPhone) {
  const phone = formatPhone(rawPhone);
  await db.delete(otpCodes).where((0, import_drizzle_orm22.eq)(otpCodes.phone, phone));
}
async function getFarmerByPhone(phone) {
  const [row] = await db.select().from(farmers).where((0, import_drizzle_orm22.eq)(farmers.phone, formatPhone(phone))).limit(1);
  return row ?? null;
}

// src/services/passwordAuth.ts
var import_node_crypto4 = require("node:crypto");
var import_drizzle_orm23 = require("drizzle-orm");
init_db();
init_farmers();
var KEY_LEN = 64;
var SCRYPT_OPTS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
var MIN_PASSWORD_LEN = 8;
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var PHONE_RE = /^[6-9]\d{9}$/;
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
function isValidEmail(email) {
  return EMAIL_RE.test(normalizeEmail(email));
}
function isValidIndianPhone(digits) {
  return PHONE_RE.test(digits.replace(/\D/g, "").slice(-10));
}
function hashPassword(password) {
  const salt = (0, import_node_crypto4.randomBytes)(16).toString("hex");
  const hash = (0, import_node_crypto4.scryptSync)(password, salt, KEY_LEN, SCRYPT_OPTS).toString("hex");
  return `scrypt:${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  try {
    const derived = (0, import_node_crypto4.scryptSync)(password, salt, KEY_LEN, SCRYPT_OPTS);
    const expected = Buffer.from(expectedHex, "hex");
    return derived.length === expected.length && (0, import_node_crypto4.timingSafeEqual)(derived, expected);
  } catch {
    return false;
  }
}
function validatePasswordStrength(password) {
  if (password.length < MIN_PASSWORD_LEN) {
    return `Password must be at least ${MIN_PASSWORD_LEN} characters`;
  }
  return null;
}
async function findFarmerByIdentifier(identifier) {
  const trimmed = identifier.trim();
  if (!trimmed) return null;
  if (trimmed.includes("@")) {
    const email = normalizeEmail(trimmed);
    const [row2] = await db.select().from(farmers).where((0, import_drizzle_orm23.eq)(farmers.email, email)).limit(1);
    return row2 ?? null;
  }
  const phone = formatPhone(trimmed);
  const [row] = await db.select().from(farmers).where((0, import_drizzle_orm23.eq)(farmers.phone, phone)).limit(1);
  return row ?? null;
}
async function findFarmerByPhoneOrEmail(phone, email) {
  const conditions = [];
  if (phone) conditions.push((0, import_drizzle_orm23.eq)(farmers.phone, phone));
  if (email) conditions.push((0, import_drizzle_orm23.eq)(farmers.email, email));
  if (!conditions.length) return null;
  const [row] = await db.select().from(farmers).where(conditions.length === 1 ? conditions[0] : (0, import_drizzle_orm23.or)(...conditions)).limit(1);
  return row ?? null;
}
async function registerFarmerWithPassword(input) {
  const name = input.name.trim();
  const phoneRaw = input.phone?.trim();
  const emailRaw = input.email?.trim();
  if (!name || name.length < 2) {
    throw new Error("INVALID_NAME");
  }
  const pwdErr = validatePasswordStrength(input.password);
  if (pwdErr) throw new Error("WEAK_PASSWORD");
  if (!phoneRaw) throw new Error("PHONE_REQUIRED");
  let phone = null;
  let email = null;
  if (phoneRaw) {
    const digits = phoneRaw.replace(/\D/g, "").slice(-10);
    if (!isValidIndianPhone(digits)) throw new Error("INVALID_PHONE");
    phone = formatPhone(digits);
  }
  if (emailRaw) {
    if (!isValidEmail(emailRaw)) throw new Error("INVALID_EMAIL");
    email = normalizeEmail(emailRaw);
  }
  if (!phone && !email) throw new Error("PHONE_REQUIRED");
  const existing = await findFarmerByPhoneOrEmail(phone, email);
  if (existing) {
    if (phone && existing.phone === phone) throw new Error("PHONE_TAKEN");
    if (email && existing.email === email) throw new Error("EMAIL_TAKEN");
  }
  const passwordHash = hashPassword(input.password);
  const language = input.language?.trim() || "te";
  log.debug("auth/register", "inserting farmer", { phone: maskPhone(phone ?? void 0), language });
  let created;
  try {
    [created] = await db.insert(farmers).values({
      phone,
      email,
      name,
      passwordHash,
      language
    }).returning();
  } catch (err) {
    logDbError("auth/register", "insert farmer", err, { phone: maskPhone(phone ?? void 0) });
    throw new Error("REGISTER_FAILED");
  }
  if (!created) {
    log.error("auth/register", "insert returned no row", { phone: maskPhone(phone ?? void 0) });
    throw new Error("REGISTER_FAILED");
  }
  return created;
}
async function loginFarmerWithPassword(identifier, password) {
  const farmer = await findFarmerByIdentifier(identifier);
  if (!farmer?.passwordHash) throw new Error("INVALID_CREDENTIALS");
  if (!verifyPassword(password, farmer.passwordHash)) {
    throw new Error("INVALID_CREDENTIALS");
  }
  if (!farmer.isActive) throw new Error("ACCOUNT_DISABLED");
  return farmer;
}
async function updateFarmerPassword(farmerId, newPassword) {
  const pwdErr = validatePasswordStrength(newPassword);
  if (pwdErr) throw new Error("WEAK_PASSWORD");
  const [updated] = await db.update(farmers).set({ passwordHash: hashPassword(newPassword), updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm23.eq)(farmers.id, farmerId)).returning();
  if (!updated) throw new Error("NOT_FOUND");
  return updated;
}
async function changeFarmerPassword(farmerId, currentPassword, newPassword) {
  const [farmer] = await db.select().from(farmers).where((0, import_drizzle_orm23.eq)(farmers.id, farmerId)).limit(1);
  if (!farmer) throw new Error("NOT_FOUND");
  if (!farmer.passwordHash) throw new Error("NO_PASSWORD");
  if (!verifyPassword(currentPassword, farmer.passwordHash)) throw new Error("WRONG_PASSWORD");
  if (currentPassword === newPassword) throw new Error("SAME_PASSWORD");
  return updateFarmerPassword(farmerId, newPassword);
}
async function resetPasswordWithPhoneOtp(rawPhone, otp, newPassword) {
  const phone = formatPhone(rawPhone);
  const farmer = await getFarmerByPhone(phone);
  if (!farmer) throw new Error("NOT_FOUND");
  const check = await verifyPhoneOtp(rawPhone, otp);
  if (!check.valid) throw new Error(`OTP_${check.reason ?? "invalid"}`);
  const updated = await updateFarmerPassword(farmer.id, newPassword);
  await consumeOtpSession(rawPhone);
  return updated;
}

// src/services/mandiAnalyticsService.ts
var import_drizzle_orm24 = require("drizzle-orm");
init_db();
init_schema();
function dateOnly(value) {
  const text19 = typeof value === "string" ? value : value.toISOString();
  return text19.slice(0, 10);
}
function average(values) {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
function dbRowToRate(row) {
  return {
    cropId: normalizeMandiCropId(row.cropId, row.commodity),
    varietyId: row.varietyId ?? void 0,
    varietyName: row.varietyName ?? void 0,
    commodity: row.commodity,
    market: row.market,
    district: row.district,
    state: row.state,
    date: dateOnly(row.priceDate),
    minPrice: num(row.minPrice),
    maxPrice: num(row.maxPrice),
    modalPrice: num(row.modalPrice),
    unit: row.unit,
    isLive: row.isLive
  };
}
function buildAnalyticsFromDbRows(rows) {
  const groups = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const mapped = dbRowToRate(row);
    const varietyKey = (mapped.varietyName ?? "generic").toLowerCase().trim();
    const key = `${mapped.cropId}:${varietyKey}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(mapped);
    groups.set(key, bucket);
  }
  const today = /* @__PURE__ */ new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const analytics = [];
  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    const dailyMap = /* @__PURE__ */ new Map();
    for (const row of sorted) {
      const day = row.date;
      const existing = dailyMap.get(day);
      if (!existing) {
        dailyMap.set(day, {
          date: day,
          modalPrice: row.modalPrice,
          minPrice: row.minPrice,
          maxPrice: row.maxPrice
        });
        continue;
      }
      existing.modalPrice = Math.round((existing.modalPrice + row.modalPrice) / 2);
      existing.minPrice = Math.min(existing.minPrice, row.minPrice);
      existing.maxPrice = Math.max(existing.maxPrice, row.maxPrice);
    }
    const dailySeries = [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date));
    if (!dailySeries.length) continue;
    const currentModal = dailySeries[dailySeries.length - 1].modalPrice;
    const previousModal = dailySeries.length >= 2 ? dailySeries[dailySeries.length - 2].modalPrice : currentModal;
    const changeAmount = currentModal - previousModal;
    const changePercent = previousModal ? changeAmount / previousModal * 100 : 0;
    const last7 = dailySeries.slice(-7);
    const last30 = dailySeries.slice(-30);
    const priceOn = (day) => dailySeries.find((point) => point.date === day)?.modalPrice ?? null;
    const pricesSince = (from) => dailySeries.filter((point) => new Date(point.date) >= from).map((point) => point.modalPrice);
    analytics.push({
      cropId: latest.cropId,
      varietyId: latest.varietyId,
      varietyName: latest.varietyName,
      commodity: latest.commodity,
      currentModal,
      previousModal,
      changeAmount,
      changePercent,
      trend: changePercent > 0.5 ? "up" : changePercent < -0.5 ? "down" : "stable",
      avg7d: average(last7.map((point) => point.modalPrice)) ?? currentModal,
      avg30d: average(last30.map((point) => point.modalPrice)) ?? currentModal,
      high30d: last30.length ? Math.max(...last30.map((point) => point.modalPrice)) : latest.maxPrice,
      low30d: last30.length ? Math.min(...last30.map((point) => point.modalPrice)) : latest.minPrice,
      dailySeries: dailySeries.slice(-30),
      unit: latest.unit,
      market: latest.market,
      state: latest.state,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      isLive: latest.isLive,
      priceToday: priceOn(todayStr) ?? currentModal,
      priceYesterday: priceOn(yesterdayStr),
      priceLastMonth: average(pricesSince(monthAgo)),
      priceLastYear: average(pricesSince(yearAgo))
    });
  }
  return analytics.sort((a, b) => (a.varietyName ?? "").localeCompare(b.varietyName ?? ""));
}
async function fetchMandiAnalyticsFromDb(options) {
  const state = options?.state ?? "Andhra Pradesh";
  const historyDays = options?.historyDays ?? 400;
  const cutoff = /* @__PURE__ */ new Date();
  cutoff.setDate(cutoff.getDate() - historyDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const rows = await db.select().from(mandiPrices).where((0, import_drizzle_orm24.and)((0, import_drizzle_orm24.eq)(mandiPrices.state, state), (0, import_drizzle_orm24.gte)(mandiPrices.priceDate, cutoffStr))).orderBy((0, import_drizzle_orm24.desc)(mandiPrices.priceDate)).limit(1e4);
  let analytics = buildAnalyticsFromDbRows(rows);
  if (options?.cropId) {
    analytics = analytics.filter((item) => item.cropId === options.cropId);
  }
  return analytics;
}

// src/server/index.ts
init_nearbyAgPlacesService();

// src/server/adminRoutes.ts
var import_hono = require("hono");

// src/services/adminAuth.ts
var import_node_crypto5 = require("node:crypto");
var ADMIN_TOKEN_TTL_SEC = 60 * 60 * 24 * 7;
function jwtSecret2() {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return "bhuvedam-dev-jwt-secret-change-me";
}
function b64urlJson2(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}
function adminEmail() {
  return (process.env.ADMIN_EMAIL?.trim() || "admin@bhuvedam.app").toLowerCase();
}
function verifyAdminCredentials(email, password) {
  const expectedEmail = adminEmail();
  if (email.trim().toLowerCase() !== expectedEmail) return false;
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (hash) {
    return verifyPassword(password, hash);
  }
  const plain = process.env.ADMIN_PASSWORD?.trim();
  if (!plain) {
    return process.env.NODE_ENV !== "production" && password === "admin123";
  }
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(plain);
    if (a.length !== b.length) return false;
    return (0, import_node_crypto5.timingSafeEqual)(a, b);
  } catch {
    return false;
  }
}
function createAdminToken(email) {
  const header = b64urlJson2({ alg: "HS256", typ: "JWT" });
  const now = Math.floor(Date.now() / 1e3);
  const payload = b64urlJson2({
    sub: "admin",
    role: "admin",
    email: email.toLowerCase(),
    iat: now,
    exp: now + ADMIN_TOKEN_TTL_SEC
  });
  const unsigned = `${header}.${payload}`;
  const sig = (0, import_node_crypto5.createHmac)("sha256", jwtSecret2()).update(unsigned).digest("base64url");
  return `${unsigned}.${sig}`;
}
function parseAdminToken(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;
  if (!header || !payload || !sig) return null;
  const expected = (0, import_node_crypto5.createHmac)("sha256", jwtSecret2()).update(`${header}.${payload}`).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !(0, import_node_crypto5.timingSafeEqual)(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (parsed.exp != null && parsed.exp < Math.floor(Date.now() / 1e3)) return null;
    if (parsed.role === "admin" && parsed.sub === "admin" && parsed.email) {
      return { email: parsed.email };
    }
  } catch {
    return null;
  }
  return null;
}

// src/middleware/adminSessionAuth.ts
async function adminSessionAuthMiddleware(c, next) {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return appError(c, "UNAUTHORIZED");
  }
  const parsed = parseAdminToken(auth.slice(7).trim());
  if (!parsed) {
    return appError(c, "SESSION_EXPIRED");
  }
  c.set("adminEmail", parsed.email);
  await next();
}

// src/services/adminDashboardService.ts
var import_drizzle_orm25 = require("drizzle-orm");
init_db();
init_adminBroadcasts();
init_cropCalendar();
init_crops();
init_farmers();
init_fertilizerProducts();
init_govtSchemes();
init_mandiPrices();
init_weather();
init_syncJobs();

// src/ingestion/data/govtSchemes.seed.json
var govtSchemes_seed_default = [
  {
    id: "pm-kisan",
    category: "support",
    region: "central",
    status: "active",
    titleEn: "PM-KISAN Samman Nidhi",
    titleTe: "\u0C2A\u0C40\u0C0E\u0C02-\u0C15\u0C3F\u0C38\u0C3E\u0C28\u0C4D \u0C38\u0C2E\u0C4D\u0C2E\u0C3E\u0C28\u0C4D \u0C28\u0C3F\u0C27\u0C3F",
    amountEn: "\u20B96,000 / year",
    amountTe: "\u0C38\u0C02\u0C35\u0C24\u0C4D\u0C38\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u20B96,000",
    benefitEn: "Landholding farmer families receive \u20B96,000 a year in three equal installments of \u20B92,000 each, transferred directly to the bank account.",
    benefitTe: "\u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C2D\u0C42\u0C2E\u0C3F \u0C09\u0C28\u0C4D\u0C28 \u0C30\u0C48\u0C24\u0C41 \u0C15\u0C41\u0C1F\u0C41\u0C02\u0C2C\u0C3E\u0C32\u0C15\u0C41 \u0C38\u0C02\u0C35\u0C24\u0C4D\u0C38\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u20B96,000 \u2014 \u0C2E\u0C42\u0C21\u0C41 \u0C38\u0C2E\u0C3E\u0C28 \u0C35\u0C3E\u0C2F\u0C3F\u0C26\u0C3E\u0C32\u0C41\u0C17\u0C3E (\u0C12\u0C15\u0C4D\u0C15\u0C4A\u0C15\u0C4D\u0C15\u0C1F\u0C3F \u20B92,000) \u0C2C\u0C4D\u0C2F\u0C3E\u0C02\u0C15\u0C41 \u0C16\u0C3E\u0C24\u0C3E\u0C32\u0C4B \u0C28\u0C47\u0C30\u0C41\u0C17\u0C3E \u0C1C\u0C2E \u0C05\u0C35\u0C41\u0C24\u0C41\u0C02\u0C26\u0C3F.",
    eligibilityEn: "Farmer families with agricultural land (husband, wife, minor children). Institutional landholders, income-tax payers, and government employees are excluded. AgriStack Farmer ID / eKYC is important.",
    eligibilityTe: "\u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C2D\u0C42\u0C2E\u0C3F \u0C09\u0C28\u0C4D\u0C28 \u0C30\u0C48\u0C24\u0C41 \u0C15\u0C41\u0C1F\u0C41\u0C02\u0C2C\u0C02 (\u0C2D\u0C30\u0C4D\u0C24, \u0C2D\u0C3E\u0C30\u0C4D\u0C2F, \u0C2E\u0C48\u0C28\u0C30\u0C4D \u0C2A\u0C3F\u0C32\u0C4D\u0C32\u0C32\u0C41). \u0C38\u0C02\u0C38\u0C4D\u0C25\u0C3E\u0C17\u0C24 \u0C2D\u0C42\u0C2E\u0C3F \u0C39\u0C4B\u0C32\u0C4D\u0C21\u0C30\u0C4D\u0C32\u0C41, \u0C06\u0C26\u0C3E\u0C2F\u0C2A\u0C41 \u0C2A\u0C28\u0C4D\u0C28\u0C41 \u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C02\u0C1A\u0C47\u0C35\u0C3E\u0C30\u0C41, \u0C2A\u0C4D\u0C30\u0C2D\u0C41\u0C24\u0C4D\u0C35 \u0C09\u0C26\u0C4D\u0C2F\u0C4B\u0C17\u0C41\u0C32\u0C41 \u0C2E\u0C3F\u0C28\u0C39\u0C3E\u0C2F\u0C3F\u0C02\u0C2A\u0C41. \u0C05\u0C17\u0C4D\u0C30\u0C3F\u0C38\u0C4D\u0C1F\u0C3E\u0C15\u0C4D \u0C30\u0C48\u0C24\u0C41 \u0C10\u0C21\u0C3F / \u0C08\u0C15\u0C47\u0C35\u0C48\u0C38\u0C3F \u0C2E\u0C41\u0C16\u0C4D\u0C2F\u0C02.",
    howToApplyEn: "Register or check status at pmkisan.gov.in. Annual eKYC is mandatory \u2014 do biometric eKYC on the portal or at the nearest CSC. In Andhra Pradesh, link Farmer ID at apfr.agristack.gov.in.",
    howToApplyTe: "pmkisan.gov.in\u0C32\u0C4B \u0C28\u0C2E\u0C4B\u0C26\u0C41 \u0C1A\u0C47\u0C38\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F \u0C32\u0C47\u0C26\u0C3E \u0C38\u0C4D\u0C25\u0C3F\u0C24\u0C3F \u0C1A\u0C42\u0C21\u0C02\u0C21\u0C3F. \u0C35\u0C3E\u0C30\u0C4D\u0C37\u0C3F\u0C15 \u0C08\u0C15\u0C47\u0C35\u0C48\u0C38\u0C3F \u0C24\u0C2A\u0C4D\u0C2A\u0C28\u0C3F\u0C38\u0C30\u0C3F \u2014 \u0C2A\u0C4B\u0C30\u0C4D\u0C1F\u0C32\u0C4D\u200C\u0C32\u0C4B \u0C32\u0C47\u0C26\u0C3E \u0C38\u0C2E\u0C40\u0C2A \u0C38\u0C40\u0C0E\u0C38\u0C4D\u200C\u0C38\u0C40\u0C32\u0C4B \u0C2C\u0C2F\u0C4B\u0C2E\u0C46\u0C1F\u0C4D\u0C30\u0C3F\u0C15\u0C4D \u0C08\u0C15\u0C47\u0C35\u0C48\u0C38\u0C3F \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F. \u0C06\u0C02\u0C27\u0C4D\u0C30\u0C2A\u0C4D\u0C30\u0C26\u0C47\u0C36\u0C4D\u200C\u0C32\u0C4B apfr.agristack.gov.in\u0C32\u0C4B \u0C30\u0C48\u0C24\u0C41 \u0C10\u0C21\u0C3F \u0C32\u0C3F\u0C02\u0C15\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F.",
    applyUrl: "https://www.pmkisan.gov.in/",
    icon: "cash-multiple",
    highlightsEn: [
      "eKYC mandatory",
      "Farmer ID / AgriStack",
      "Know Your Status portal"
    ],
    highlightsTe: [
      "\u0C08\u0C15\u0C47\u0C35\u0C48\u0C38\u0C3F \u0C24\u0C2A\u0C4D\u0C2A\u0C28\u0C3F\u0C38\u0C30\u0C3F",
      "\u0C30\u0C48\u0C24\u0C41 \u0C10\u0C21\u0C3F / \u0C05\u0C17\u0C4D\u0C30\u0C3F\u0C38\u0C4D\u0C1F\u0C3E\u0C15\u0C4D",
      "\u0C38\u0C4D\u0C25\u0C3F\u0C24\u0C3F \u0C24\u0C46\u0C32\u0C41\u0C38\u0C41\u0C15\u0C41\u0C28\u0C47 \u0C2A\u0C4B\u0C30\u0C4D\u0C1F\u0C32\u0C4D"
    ],
    eligibilityRules: {
      requiresLand: true,
      prefersLandRecords: true
    },
    verifiedAt: "2026-09-04"
  },
  {
    id: "annadata-sukhibhava",
    category: "support",
    region: "ap",
    status: "active",
    titleEn: "Annadata Sukhibhava + PM-KISAN",
    titleTe: "\u0C05\u0C28\u0C4D\u0C28\u0C26\u0C3E\u0C24 \u0C38\u0C41\u0C16\u0C40\u0C2D\u0C35 + \u0C2A\u0C40\u0C0E\u0C02-\u0C15\u0C3F\u0C38\u0C3E\u0C28\u0C4D",
    amountEn: "\u20B920,000 / family / year",
    amountTe: "\u0C15\u0C41\u0C1F\u0C41\u0C02\u0C2C\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C38\u0C02\u0C35\u0C24\u0C4D\u0C38\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u20B920,000",
    benefitEn: "Eligible farmer families in Andhra Pradesh receive \u20B920,000 a year (State \u20B914,000 + Central PM-KISAN \u20B96,000). Installments continue in 2026 \u2014 first tranche \u20B97,000 (\u20B95,000 state + \u20B92,000 PM-KISAN) has been released.",
    benefitTe: "\u0C06\u0C02\u0C27\u0C4D\u0C30\u0C2A\u0C4D\u0C30\u0C26\u0C47\u0C36\u0C4D\u200C\u0C32\u0C4B \u0C05\u0C30\u0C4D\u0C39\u0C24 \u0C09\u0C28\u0C4D\u0C28 \u0C30\u0C48\u0C24\u0C41 \u0C15\u0C41\u0C1F\u0C41\u0C02\u0C2C\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C38\u0C02\u0C35\u0C24\u0C4D\u0C38\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u20B920,000 (\u0C30\u0C3E\u0C37\u0C4D\u0C1F\u0C4D\u0C30\u0C02 \u20B914,000 + \u0C15\u0C47\u0C02\u0C26\u0C4D\u0C30 \u0C2A\u0C40\u0C0E\u0C02-\u0C15\u0C3F\u0C38\u0C3E\u0C28\u0C4D \u20B96,000). 2026\u0C32\u0C4B \u0C35\u0C3E\u0C2F\u0C3F\u0C26\u0C3E\u0C32\u0C41 \u0C15\u0C4A\u0C28\u0C38\u0C3E\u0C17\u0C41\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3F \u2014 \u0C2E\u0C4A\u0C26\u0C1F\u0C3F \u0C35\u0C3E\u0C2F\u0C3F\u0C26\u0C3E \u20B97,000 (\u0C30\u0C3E\u0C37\u0C4D\u0C1F\u0C4D\u0C30\u0C02 \u20B95,000 + \u0C2A\u0C40\u0C0E\u0C02-\u0C15\u0C3F\u0C38\u0C3E\u0C28\u0C4D \u20B92,000) \u0C35\u0C3F\u0C21\u0C41\u0C26\u0C32\u0C48\u0C02\u0C26\u0C3F.",
    eligibilityEn: "Farmer families with agricultural land in Andhra Pradesh. Tribal farmers cultivating under RoFR (Forest Rights) are also eligible. Farmer ID / land records should be linked.",
    eligibilityTe: "\u0C06\u0C02\u0C27\u0C4D\u0C30\u0C2A\u0C4D\u0C30\u0C26\u0C47\u0C36\u0C4D\u200C\u0C32\u0C4B \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C2D\u0C42\u0C2E\u0C3F \u0C09\u0C28\u0C4D\u0C28 \u0C30\u0C48\u0C24\u0C41 \u0C15\u0C41\u0C1F\u0C41\u0C02\u0C2C\u0C3E\u0C32\u0C41. \u0C05\u0C1F\u0C35\u0C40 \u0C39\u0C15\u0C4D\u0C15\u0C41\u0C32\u0C41 (RoFR) \u0C15\u0C3F\u0C02\u0C26 \u0C38\u0C3E\u0C17\u0C41 \u0C1A\u0C47\u0C38\u0C4D\u0C24\u0C41\u0C28\u0C4D\u0C28 \u0C17\u0C3F\u0C30\u0C3F\u0C1C\u0C28 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C41 \u0C15\u0C42\u0C21\u0C3E \u0C05\u0C30\u0C4D\u0C39\u0C41\u0C32\u0C41. \u0C30\u0C48\u0C24\u0C41 \u0C10\u0C21\u0C3F / \u0C2D\u0C42\u0C2E\u0C3F \u0C30\u0C3F\u0C15\u0C3E\u0C30\u0C4D\u0C21\u0C41\u0C32\u0C41 \u0C32\u0C3F\u0C02\u0C15\u0C4D \u0C05\u0C2F\u0C3F \u0C09\u0C02\u0C21\u0C3E\u0C32\u0C3F.",
    howToApplyEn: "The state identifies beneficiaries automatically \u2014 keep bank account, Aadhaar, and land linked. Confirm Farmer ID at the AP Farmer Registry (apfr.agristack.gov.in) or your RSK.",
    howToApplyTe: "\u0C30\u0C3E\u0C37\u0C4D\u0C1F\u0C4D\u0C30\u0C02 \u0C38\u0C4D\u0C35\u0C2F\u0C02\u0C1A\u0C3E\u0C32\u0C15\u0C02\u0C17\u0C3E \u0C17\u0C41\u0C30\u0C4D\u0C24\u0C3F\u0C38\u0C4D\u0C24\u0C41\u0C02\u0C26\u0C3F \u2014 \u0C2C\u0C4D\u0C2F\u0C3E\u0C02\u0C15\u0C41 \u0C16\u0C3E\u0C24\u0C3E, \u0C06\u0C27\u0C3E\u0C30\u0C4D, \u0C2D\u0C42\u0C2E\u0C3F \u0C32\u0C3F\u0C02\u0C15\u0C4D \u0C05\u0C2F\u0C3F \u0C09\u0C02\u0C21\u0C3E\u0C32\u0C3F. \u0C0F\u0C2A\u0C40 \u0C30\u0C48\u0C24\u0C41 \u0C30\u0C3F\u0C1C\u0C3F\u0C38\u0C4D\u0C1F\u0C4D\u0C30\u0C40 (apfr.agristack.gov.in) \u0C32\u0C47\u0C26\u0C3E \u0C06\u0C30\u0C4D\u0C0E\u0C38\u0C4D\u200C\u0C15\u0C47\u0C32\u0C4B \u0C30\u0C48\u0C24\u0C41 \u0C10\u0C21\u0C3F \u0C28\u0C3F\u0C30\u0C4D\u0C27\u0C3E\u0C30\u0C3F\u0C02\u0C1A\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F.",
    applyUrl: "https://apfr.agristack.gov.in/",
    icon: "hand-heart",
    highlightsEn: [
      "\u20B920,000 per family",
      "Active in 2026",
      "Farmer ID recommended"
    ],
    highlightsTe: [
      "\u0C15\u0C41\u0C1F\u0C41\u0C02\u0C2C\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u20B920,000",
      "2026\u0C32\u0C4B \u0C15\u0C4A\u0C28\u0C38\u0C3E\u0C17\u0C41\u0C24\u0C4B\u0C02\u0C26\u0C3F",
      "\u0C30\u0C48\u0C24\u0C41 \u0C10\u0C21\u0C3F \u0C38\u0C3F\u0C2B\u0C3E\u0C30\u0C4D\u0C38\u0C41"
    ],
    eligibilityRules: {
      requiresLand: true,
      prefersLandRecords: true
    },
    verifiedAt: "2026-09-04"
  },
  {
    id: "rythu-bharosa-ts",
    category: "support",
    region: "ts",
    status: "active",
    titleEn: "Rythu Bharosa",
    titleTe: "\u0C30\u0C48\u0C24\u0C41 \u0C2D\u0C30\u0C4B\u0C38\u0C3E",
    amountEn: "\u20B912,000 / acre / year",
    amountTe: "\u0C0E\u0C15\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C38\u0C02\u0C35\u0C24\u0C4D\u0C38\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u20B912,000",
    benefitEn: "Cultivable land in Telangana gets \u20B912,000 per acre per year \u2014 \u20B96,000 each for Kharif and Rabi. Extra bonus may apply for paddy.",
    benefitTe: "\u0C24\u0C46\u0C32\u0C02\u0C17\u0C3E\u0C23\u0C32\u0C4B \u0C38\u0C3E\u0C17\u0C41 \u0C2D\u0C42\u0C2E\u0C3F\u0C15\u0C3F \u0C0E\u0C15\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C38\u0C02\u0C35\u0C24\u0C4D\u0C38\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u20B912,000. \u0C16\u0C30\u0C40\u0C2B\u0C4D \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C30\u0C2C\u0C40\u0C32\u0C4B \u0C12\u0C15\u0C4D\u0C15\u0C4A\u0C15\u0C4D\u0C15\u0C1F\u0C3F \u20B96,000. \u0C35\u0C30\u0C3F\u0C15\u0C3F \u0C05\u0C26\u0C28\u0C2A\u0C41 \u0C2C\u0C4B\u0C28\u0C38\u0C4D \u0C09\u0C02\u0C21\u0C35\u0C1A\u0C4D\u0C1A\u0C41.",
    eligibilityEn: "Arable land registered in Telangana (Bhu Bharati portal). Tenant farmers with a valid lease are also eligible. Real estate and industrial plots are excluded.",
    eligibilityTe: "\u0C24\u0C46\u0C32\u0C02\u0C17\u0C3E\u0C23\u0C32\u0C4B \u0C28\u0C2E\u0C4B\u0C26\u0C48\u0C28 \u0C38\u0C3E\u0C17\u0C41 \u0C2D\u0C42\u0C2E\u0C3F (\u0C2D\u0C42 \u0C2D\u0C3E\u0C30\u0C24\u0C3F \u0C2A\u0C4B\u0C30\u0C4D\u0C1F\u0C32\u0C4D). \u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C41\u0C2C\u0C3E\u0C1F\u0C41 \u0C05\u0C2F\u0C4D\u0C2F\u0C47 \u0C32\u0C40\u0C1C\u0C41 \u0C09\u0C28\u0C4D\u0C28 \u0C15\u0C4C\u0C32\u0C41 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C41 \u0C15\u0C42\u0C21\u0C3E \u0C05\u0C30\u0C4D\u0C39\u0C41\u0C32\u0C41. \u0C30\u0C3F\u0C2F\u0C32\u0C4D \u0C0E\u0C38\u0C4D\u0C1F\u0C47\u0C1F\u0C4D / \u0C2A\u0C3E\u0C30\u0C3F\u0C36\u0C4D\u0C30\u0C3E\u0C2E\u0C3F\u0C15 \u0C2A\u0C4D\u0C32\u0C3E\u0C1F\u0C4D\u0C32\u0C41 \u0C2E\u0C3F\u0C28\u0C39\u0C3E\u0C2F\u0C3F\u0C02\u0C2A\u0C41.",
    howToApplyEn: "Usually through revenue records and Bhu Bharati verification. Landless agricultural labour may get linked Indiramma Atmiya Bharosa \u2014 \u20B912,000 a year.",
    howToApplyTe: "\u0C38\u0C3E\u0C27\u0C3E\u0C30\u0C23\u0C02\u0C17\u0C3E \u0C30\u0C46\u0C35\u0C46\u0C28\u0C4D\u0C2F\u0C42 \u0C30\u0C3F\u0C15\u0C3E\u0C30\u0C4D\u0C21\u0C41\u0C32\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C2D\u0C42 \u0C2D\u0C3E\u0C30\u0C24\u0C3F \u0C27\u0C43\u0C35\u0C40\u0C15\u0C30\u0C23 \u0C26\u0C4D\u0C35\u0C3E\u0C30\u0C3E. \u0C2D\u0C42\u0C2E\u0C3F \u0C32\u0C47\u0C28\u0C3F \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C15\u0C42\u0C32\u0C40\u0C32\u0C15\u0C41 \u0C07\u0C02\u0C26\u0C3F\u0C30\u0C2E\u0C4D\u0C2E \u0C06\u0C24\u0C4D\u0C2E\u0C40\u0C2F \u0C2D\u0C30\u0C4B\u0C38\u0C3E \u2014 \u0C38\u0C02\u0C35\u0C24\u0C4D\u0C38\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u20B912,000 \u0C05\u0C28\u0C41\u0C38\u0C02\u0C27\u0C3E\u0C28\u0C02 \u0C15\u0C3E\u0C35\u0C1A\u0C4D\u0C1A\u0C41.",
    icon: "sprout",
    highlightsEn: [
      "Per acre basis",
      "Tenant farmers eligible",
      "Telangana only"
    ],
    highlightsTe: [
      "\u0C0E\u0C15\u0C30\u0C02 \u0C2A\u0C4D\u0C30\u0C3E\u0C24\u0C3F\u0C2A\u0C26\u0C3F\u0C15",
      "\u0C15\u0C4C\u0C32\u0C41 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C41 \u0C05\u0C30\u0C4D\u0C39\u0C41\u0C32\u0C41",
      "\u0C24\u0C46\u0C32\u0C02\u0C17\u0C3E\u0C23 \u0C2E\u0C3E\u0C24\u0C4D\u0C30\u0C2E\u0C47"
    ],
    eligibilityRules: {
      requiresLand: true,
      prefersLandRecords: true
    },
    verifiedAt: "2026-09-04"
  },
  {
    id: "kcc",
    category: "loan",
    region: "central",
    status: "active",
    titleEn: "Kisan Credit Card (KCC)",
    titleTe: "\u0C15\u0C3F\u0C38\u0C3E\u0C28\u0C4D \u0C15\u0C4D\u0C30\u0C46\u0C21\u0C3F\u0C1F\u0C4D \u0C15\u0C3E\u0C30\u0C4D\u0C21\u0C41 (\u0C15\u0C46\u0C38\u0C3F\u0C38\u0C3F)",
    amountEn: "Limit about \u20B93\u20135 lakh",
    amountTe: "\u0C2A\u0C30\u0C3F\u0C2E\u0C3F\u0C24\u0C3F \u0C38\u0C41\u0C2E\u0C3E\u0C30\u0C41 \u20B93\u20135 \u0C32\u0C15\u0C4D\u0C37\u0C32\u0C41",
    benefitEn: "Revolving credit for short-term crop loans and allied activities. Limit up to about \u20B95 lakh. With timely repayment, effective interest can be around 4% a year.",
    benefitTe: "\u0C38\u0C4D\u0C35\u0C32\u0C4D\u0C2A\u0C15\u0C3E\u0C32\u0C3F\u0C15 \u0C2A\u0C02\u0C1F \u0C30\u0C41\u0C23\u0C3E\u0C32\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C05\u0C28\u0C41\u0C2C\u0C02\u0C27 \u0C15\u0C3E\u0C30\u0C4D\u0C2F\u0C15\u0C32\u0C3E\u0C2A\u0C3E\u0C32\u0C15\u0C41 \u0C30\u0C3F\u0C35\u0C3E\u0C32\u0C4D\u0C35\u0C3F\u0C02\u0C17\u0C4D \u0C15\u0C4D\u0C30\u0C46\u0C21\u0C3F\u0C1F\u0C4D. \u0C2A\u0C30\u0C3F\u0C2E\u0C3F\u0C24\u0C3F \u0C38\u0C41\u0C2E\u0C3E\u0C30\u0C41 \u20B95 \u0C32\u0C15\u0C4D\u0C37\u0C32 \u0C35\u0C30\u0C15\u0C41. \u0C38\u0C15\u0C3E\u0C32\u0C02\u0C32\u0C4B \u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C38\u0C4D\u0C24\u0C47 \u0C2A\u0C4D\u0C30\u0C2D\u0C3E\u0C35\u0C35\u0C02\u0C24\u0C2E\u0C48\u0C28 \u0C35\u0C21\u0C4D\u0C21\u0C40 \u0C38\u0C02\u0C35\u0C24\u0C4D\u0C38\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C38\u0C41\u0C2E\u0C3E\u0C30\u0C41 4%.",
    eligibilityEn: "Farmers, sharecroppers, and tenant farmers with land or crop details. Dairy, fishery, and other allied activities are also covered.",
    eligibilityTe: "\u0C30\u0C48\u0C24\u0C41\u0C32\u0C41, \u0C35\u0C3E\u0C1F\u0C3E\u0C26\u0C3E\u0C30\u0C41\u0C32\u0C41, \u0C15\u0C4C\u0C32\u0C41 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C41 \u2014 \u0C2D\u0C42\u0C2E\u0C3F \u0C32\u0C47\u0C26\u0C3E \u0C2A\u0C02\u0C1F \u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32\u0C24\u0C4B. \u0C2A\u0C3E\u0C21\u0C3F, \u0C1A\u0C47\u0C2A\u0C32 \u0C2A\u0C46\u0C02\u0C2A\u0C15\u0C02 \u0C35\u0C02\u0C1F\u0C3F \u0C05\u0C28\u0C41\u0C2C\u0C02\u0C27 \u0C30\u0C02\u0C17\u0C3E\u0C32\u0C41 \u0C15\u0C42\u0C21\u0C3E \u0C15\u0C35\u0C30\u0C4D \u0C05\u0C35\u0C41\u0C24\u0C3E\u0C2F\u0C3F.",
    howToApplyEn: "Apply for a KCC at your bank, cooperative, or RRB branch. Keep Farmer ID and land records ready.",
    howToApplyTe: "\u0C2E\u0C40 \u0C2C\u0C4D\u0C2F\u0C3E\u0C02\u0C15\u0C41 / \u0C38\u0C39\u0C15\u0C3E\u0C30 / \u0C06\u0C30\u0C4D\u0C06\u0C30\u0C4D\u0C2C\u0C3F \u0C36\u0C3E\u0C16\u0C32\u0C4B \u0C15\u0C46\u0C38\u0C3F\u0C38\u0C3F \u0C15\u0C4B\u0C38\u0C02 \u0C26\u0C30\u0C16\u0C3E\u0C38\u0C4D\u0C24\u0C41 \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F. \u0C30\u0C48\u0C24\u0C41 \u0C10\u0C21\u0C3F \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C2D\u0C42\u0C2E\u0C3F \u0C30\u0C3F\u0C15\u0C3E\u0C30\u0C4D\u0C21\u0C41\u0C32\u0C41 \u0C38\u0C3F\u0C26\u0C4D\u0C27\u0C02\u0C17\u0C3E \u0C09\u0C02\u0C1A\u0C02\u0C21\u0C3F.",
    icon: "credit-card-outline",
    highlightsEn: [
      "About 4% with timely repayment",
      "Limit up to \u20B95 lakh",
      "Crop and allied"
    ],
    highlightsTe: [
      "\u0C38\u0C15\u0C3E\u0C32 \u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C02\u0C2A\u0C41\u0C24\u0C4B \u0C38\u0C41\u0C2E\u0C3E\u0C30\u0C41 4%",
      "\u20B95 \u0C32\u0C15\u0C4D\u0C37\u0C32 \u0C35\u0C30\u0C15\u0C41 \u0C2A\u0C30\u0C3F\u0C2E\u0C3F\u0C24\u0C3F",
      "\u0C2A\u0C02\u0C1F \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C05\u0C28\u0C41\u0C2C\u0C02\u0C27\u0C02"
    ],
    eligibilityRules: {
      requiresLand: true,
      prefersLandRecords: true
    },
    verifiedAt: "2026-09-04"
  },
  {
    id: "miss-interest-subvention",
    category: "loan",
    region: "central",
    status: "active",
    titleEn: "Interest Subvention (MISS)",
    titleTe: "\u0C35\u0C21\u0C4D\u0C21\u0C40 \u0C30\u0C3E\u0C2F\u0C3F\u0C24\u0C40 (\u0C0E\u0C02\u0C10\u0C0E\u0C38\u0C4D\u0C0E\u0C38\u0C4D)",
    amountEn: "7% \u2192 about 4% effective",
    amountTe: "7% \u0C28\u0C41\u0C02\u0C1A\u0C3F \u0C38\u0C41\u0C2E\u0C3E\u0C30\u0C41 4% \u0C2A\u0C4D\u0C30\u0C2D\u0C3E\u0C35\u0C35\u0C02\u0C24\u0C02",
    benefitEn: "Interest subvention on short-term KCC loans. With the Prompt Repayment Incentive, the effective rate can be around 4% a year. The scheme continues.",
    benefitTe: "\u0C15\u0C46\u0C38\u0C3F\u0C38\u0C3F \u0C38\u0C4D\u0C35\u0C32\u0C4D\u0C2A\u0C15\u0C3E\u0C32\u0C3F\u0C15 \u0C30\u0C41\u0C23\u0C3E\u0C32\u0C2A\u0C48 \u0C35\u0C21\u0C4D\u0C21\u0C40 \u0C30\u0C3E\u0C2F\u0C3F\u0C24\u0C40. \u0C38\u0C15\u0C3E\u0C32 \u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C02\u0C2A\u0C41 \u0C2A\u0C4D\u0C30\u0C4B\u0C24\u0C4D\u0C38\u0C3E\u0C39\u0C15\u0C02\u0C24\u0C4B \u0C2A\u0C4D\u0C30\u0C2D\u0C3E\u0C35\u0C35\u0C02\u0C24\u0C2E\u0C48\u0C28 \u0C30\u0C47\u0C1F\u0C41 \u0C38\u0C02\u0C35\u0C24\u0C4D\u0C38\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C38\u0C41\u0C2E\u0C3E\u0C30\u0C41 4%. \u0C2A\u0C25\u0C15\u0C02 \u0C15\u0C4A\u0C28\u0C38\u0C3E\u0C17\u0C41\u0C24\u0C4B\u0C02\u0C26\u0C3F.",
    eligibilityEn: "Short-term crop loans through KCC. Farmers who repay on time get the full benefit.",
    eligibilityTe: "\u0C15\u0C46\u0C38\u0C3F\u0C38\u0C3F \u0C26\u0C4D\u0C35\u0C3E\u0C30\u0C3E \u0C38\u0C4D\u0C35\u0C32\u0C4D\u0C2A\u0C15\u0C3E\u0C32\u0C3F\u0C15 \u0C2A\u0C02\u0C1F \u0C30\u0C41\u0C23\u0C3E\u0C32\u0C41. \u0C38\u0C15\u0C3E\u0C32\u0C02\u0C32\u0C4B \u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C02\u0C1A\u0C47 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C15\u0C41 \u0C2A\u0C42\u0C30\u0C4D\u0C24\u0C3F \u0C2A\u0C4D\u0C30\u0C2F\u0C4B\u0C1C\u0C28\u0C02.",
    howToApplyEn: "The bank applies it automatically when you take a KCC loan. Timely repayment is important.",
    howToApplyTe: "\u0C15\u0C46\u0C38\u0C3F\u0C38\u0C3F \u0C30\u0C41\u0C23\u0C02 \u0C24\u0C40\u0C38\u0C41\u0C15\u0C41\u0C28\u0C4D\u0C28\u0C2A\u0C4D\u0C2A\u0C41\u0C21\u0C41 \u0C2C\u0C4D\u0C2F\u0C3E\u0C02\u0C15\u0C41 \u0C38\u0C4D\u0C35\u0C2F\u0C02\u0C1A\u0C3E\u0C32\u0C15\u0C02\u0C17\u0C3E \u0C35\u0C30\u0C4D\u0C24\u0C3F\u0C02\u0C2A\u0C1C\u0C47\u0C38\u0C4D\u0C24\u0C41\u0C02\u0C26\u0C3F. \u0C38\u0C15\u0C3E\u0C32\u0C02\u0C32\u0C4B \u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C02\u0C1A\u0C21\u0C02 \u0C2E\u0C41\u0C16\u0C4D\u0C2F\u0C02.",
    icon: "percent",
    highlightsEn: [
      "Active with KCC",
      "About 4% with prompt repayment",
      "Timely repayment"
    ],
    highlightsTe: [
      "\u0C15\u0C46\u0C38\u0C3F\u0C38\u0C3F\u0C24\u0C4B \u0C15\u0C4A\u0C28\u0C38\u0C3E\u0C17\u0C41\u0C24\u0C4B\u0C02\u0C26\u0C3F",
      "\u0C38\u0C15\u0C3E\u0C32 \u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C02\u0C2A\u0C41\u0C24\u0C4B \u0C38\u0C41\u0C2E\u0C3E\u0C30\u0C41 4%",
      "\u0C38\u0C15\u0C3E\u0C32 \u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C02\u0C2A\u0C41"
    ],
    eligibilityRules: {
      requiresLand: true
    },
    verifiedAt: "2026-09-04"
  },
  {
    id: "ap-zero-interest-loan",
    category: "loan",
    region: "ap",
    status: "active",
    titleEn: "AP Interest-free Crop Loan",
    titleTe: "\u0C06\u0C02\u0C27\u0C4D\u0C30\u0C2A\u0C4D\u0C30\u0C26\u0C47\u0C36\u0C4D \u0C35\u0C21\u0C4D\u0C21\u0C40 \u0C30\u0C39\u0C3F\u0C24 \u0C2A\u0C02\u0C1F \u0C30\u0C41\u0C23\u0C02",
    amountEn: "0% up to \u20B93 lakh",
    amountTe: "\u20B93 \u0C32\u0C15\u0C4D\u0C37\u0C32 \u0C35\u0C30\u0C15\u0C41 0%",
    benefitEn: "Andhra Pradesh provides additional state subvention on crop loans so eligible KCC loans can effectively become 0% interest when repaid on time.",
    benefitTe: "\u0C06\u0C02\u0C27\u0C4D\u0C30\u0C2A\u0C4D\u0C30\u0C26\u0C47\u0C36\u0C4D\u200C\u0C32\u0C4B \u0C05\u0C30\u0C4D\u0C39\u0C24 \u0C09\u0C28\u0C4D\u0C28 \u0C30\u0C48\u0C24\u0C41\u0C32 \u0C2A\u0C02\u0C1F \u0C30\u0C41\u0C23\u0C3E\u0C32\u0C15\u0C41 \u0C30\u0C3E\u0C37\u0C4D\u0C1F\u0C4D\u0C30 \u0C05\u0C26\u0C28\u0C2A\u0C41 \u0C30\u0C3E\u0C2F\u0C3F\u0C24\u0C40 \u2014 \u0C38\u0C15\u0C3E\u0C32 \u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C02\u0C2A\u0C41 \u0C37\u0C30\u0C24\u0C41\u0C24\u0C4B \u0C15\u0C46\u0C38\u0C3F\u0C38\u0C3F \u0C30\u0C41\u0C23\u0C3E\u0C32\u0C41 \u0C06\u0C1A\u0C30\u0C23\u0C32\u0C4B 0% \u0C35\u0C21\u0C4D\u0C21\u0C40 \u0C15\u0C3E\u0C35\u0C1A\u0C4D\u0C1A\u0C41.",
    eligibilityEn: "Registered farmers in Andhra Pradesh with valid land records and a bank KCC or crop loan account.",
    eligibilityTe: "\u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C41\u0C2C\u0C3E\u0C1F\u0C41 \u0C05\u0C2F\u0C4D\u0C2F\u0C47 \u0C2D\u0C42\u0C2E\u0C3F \u0C30\u0C3F\u0C15\u0C3E\u0C30\u0C4D\u0C21\u0C41\u0C32\u0C41 \u0C09\u0C28\u0C4D\u0C28 \u0C06\u0C02\u0C27\u0C4D\u0C30\u0C2A\u0C4D\u0C30\u0C26\u0C47\u0C36\u0C4D \u0C28\u0C2E\u0C4B\u0C26\u0C3F\u0C24 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C41. \u0C2C\u0C4D\u0C2F\u0C3E\u0C02\u0C15\u0C41 \u0C15\u0C46\u0C38\u0C3F\u0C38\u0C3F / \u0C2A\u0C02\u0C1F \u0C30\u0C41\u0C23 \u0C16\u0C3E\u0C24\u0C3E \u0C09\u0C02\u0C21\u0C3E\u0C32\u0C3F.",
    howToApplyEn: "Apply for a crop loan or KCC at a local cooperative or nationalised bank. State subvention is adjusted through the bank.",
    howToApplyTe: "\u0C38\u0C4D\u0C25\u0C3E\u0C28\u0C3F\u0C15 \u0C38\u0C39\u0C15\u0C3E\u0C30 \u0C32\u0C47\u0C26\u0C3E \u0C1C\u0C3E\u0C24\u0C40\u0C2F \u0C2C\u0C4D\u0C2F\u0C3E\u0C02\u0C15\u0C41\u0C32\u0C4B \u0C2A\u0C02\u0C1F \u0C30\u0C41\u0C23\u0C02 \u0C32\u0C47\u0C26\u0C3E \u0C15\u0C46\u0C38\u0C3F\u0C38\u0C3F\u0C15\u0C3F \u0C26\u0C30\u0C16\u0C3E\u0C38\u0C4D\u0C24\u0C41 \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F. \u0C30\u0C3E\u0C37\u0C4D\u0C1F\u0C4D\u0C30 \u0C30\u0C3E\u0C2F\u0C3F\u0C24\u0C40 \u0C2C\u0C4D\u0C2F\u0C3E\u0C02\u0C15\u0C41 \u0C26\u0C4D\u0C35\u0C3E\u0C30\u0C3E \u0C38\u0C30\u0C4D\u0C26\u0C41\u0C2C\u0C3E\u0C1F\u0C41 \u0C05\u0C35\u0C41\u0C24\u0C41\u0C02\u0C26\u0C3F.",
    icon: "bank-outline",
    highlightsEn: [
      "AP state top-up",
      "Up to \u20B93 lakh",
      "Timely repayment"
    ],
    highlightsTe: [
      "\u0C06\u0C02\u0C27\u0C4D\u0C30\u0C2A\u0C4D\u0C30\u0C26\u0C47\u0C36\u0C4D \u0C30\u0C3E\u0C37\u0C4D\u0C1F\u0C4D\u0C30 \u0C05\u0C26\u0C28\u0C2A\u0C41 \u0C30\u0C3E\u0C2F\u0C3F\u0C24\u0C40",
      "\u20B93 \u0C32\u0C15\u0C4D\u0C37\u0C32 \u0C35\u0C30\u0C15\u0C41",
      "\u0C38\u0C15\u0C3E\u0C32 \u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C02\u0C2A\u0C41"
    ],
    eligibilityRules: {
      requiresLand: true,
      prefersLandRecords: true
    },
    verifiedAt: "2026-09-04"
  },
  {
    id: "pmfby",
    category: "insurance",
    region: "central",
    status: "active",
    titleEn: "PM Fasal Bima Yojana (PMFBY)",
    titleTe: "\u0C2A\u0C40\u0C0E\u0C02 \u0C2B\u0C38\u0C32\u0C4D \u0C2C\u0C40\u0C2E\u0C3E \u0C2F\u0C4B\u0C1C\u0C28 (\u0C2A\u0C40\u0C0E\u0C02\u0C0E\u0C2B\u0C4D\u200C\u0C2C\u0C40\u0C35\u0C48)",
    amountEn: "Farmer premium: 2% / 1.5%",
    amountTe: "\u0C30\u0C48\u0C24\u0C41 \u0C2A\u0C4D\u0C30\u0C40\u0C2E\u0C3F\u0C2F\u0C02: 2% / 1.5%",
    benefitEn: "Crop insurance for natural disasters, drought, flood, and pest damage. Farmer premium: Kharif 2%, Rabi 1.5%, commercial/horticulture 5%. The government pays the remaining premium.",
    benefitTe: "\u0C2A\u0C4D\u0C30\u0C15\u0C43\u0C24\u0C3F \u0C35\u0C48\u0C2A\u0C30\u0C40\u0C24\u0C4D\u0C2F\u0C3E\u0C32\u0C41, \u0C15\u0C30\u0C41\u0C35\u0C41, \u0C35\u0C30\u0C26, \u0C1A\u0C40\u0C21\u0C2A\u0C40\u0C21 \u0C28\u0C37\u0C4D\u0C1F\u0C3E\u0C32\u0C15\u0C41 \u0C2A\u0C02\u0C1F \u0C2C\u0C40\u0C2E\u0C3E. \u0C30\u0C48\u0C24\u0C41 \u0C2A\u0C4D\u0C30\u0C40\u0C2E\u0C3F\u0C2F\u0C02: \u0C16\u0C30\u0C40\u0C2B\u0C4D 2%, \u0C30\u0C2C\u0C40 1.5%, \u0C35\u0C3E\u0C23\u0C3F\u0C1C\u0C4D\u0C2F/\u0C39\u0C3E\u0C30\u0C4D\u0C1F\u0C3F\u0C15\u0C32\u0C4D\u0C1A\u0C30\u0C4D 5%. \u0C2E\u0C3F\u0C17\u0C3F\u0C32\u0C3F\u0C28 \u0C2A\u0C4D\u0C30\u0C40\u0C2E\u0C3F\u0C2F\u0C02 \u0C2A\u0C4D\u0C30\u0C2D\u0C41\u0C24\u0C4D\u0C35\u0C02 \u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C38\u0C4D\u0C24\u0C41\u0C02\u0C26\u0C3F.",
    eligibilityEn: "All farmers including sharecroppers and tenant farmers \u2014 for notified crops in notified areas. From 2026, land-owning farmers need AgriStack Farmer ID for enrollment.",
    eligibilityTe: "\u0C35\u0C3E\u0C1F\u0C3E\u0C26\u0C3E\u0C30\u0C41\u0C32\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C15\u0C4C\u0C32\u0C41 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C24\u0C4B \u0C38\u0C39\u0C3E \u0C05\u0C28\u0C4D\u0C28\u0C3F \u0C30\u0C48\u0C24\u0C41\u0C32\u0C41 \u2014 \u0C28\u0C4B\u0C1F\u0C3F\u0C2B\u0C48 \u0C1A\u0C47\u0C38\u0C3F\u0C28 \u0C2A\u0C4D\u0C30\u0C3E\u0C02\u0C24\u0C3E\u0C32\u0C4D\u0C32\u0C4B \u0C28\u0C4B\u0C1F\u0C3F\u0C2B\u0C48 \u0C1A\u0C47\u0C38\u0C3F\u0C28 \u0C2A\u0C02\u0C1F\u0C32\u0C15\u0C41. 2026 \u0C28\u0C41\u0C02\u0C1A\u0C3F \u0C2D\u0C42\u0C2E\u0C3F \u0C09\u0C28\u0C4D\u0C28 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C15\u0C41 \u0C28\u0C2E\u0C4B\u0C26\u0C41\u0C15\u0C41 \u0C05\u0C17\u0C4D\u0C30\u0C3F\u0C38\u0C4D\u0C1F\u0C3E\u0C15\u0C4D \u0C30\u0C48\u0C24\u0C41 \u0C10\u0C21\u0C3F \u0C05\u0C35\u0C38\u0C30\u0C02.",
    howToApplyEn: "Through the bank (for farmers with loans) or at pmfby.gov.in. Enrol before the sowing season starts. Generate your Farmer ID.",
    howToApplyTe: "\u0C2C\u0C4D\u0C2F\u0C3E\u0C02\u0C15\u0C41 \u0C26\u0C4D\u0C35\u0C3E\u0C30\u0C3E (\u0C30\u0C41\u0C23\u0C02 \u0C09\u0C28\u0C4D\u0C28 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C41) \u0C32\u0C47\u0C26\u0C3E pmfby.gov.in\u0C32\u0C4B. \u0C35\u0C3F\u0C24\u0C4D\u0C24\u0C28 \u0C38\u0C40\u0C1C\u0C28\u0C4D \u0C2E\u0C41\u0C02\u0C26\u0C41 \u0C28\u0C2E\u0C4B\u0C26\u0C41 \u0C1A\u0C47\u0C38\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F. \u0C30\u0C48\u0C24\u0C41 \u0C10\u0C21\u0C3F \u0C24\u0C2F\u0C3E\u0C30\u0C41 \u0C1A\u0C47\u0C38\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F.",
    applyUrl: "https://pmfby.gov.in/",
    icon: "shield-check",
    highlightsEn: [
      "Active for Kharif and Rabi",
      "Farmer ID for landowners",
      "Low premium"
    ],
    highlightsTe: [
      "\u0C16\u0C30\u0C40\u0C2B\u0C4D \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C30\u0C2C\u0C40\u0C15\u0C3F \u0C15\u0C4A\u0C28\u0C38\u0C3E\u0C17\u0C41\u0C24\u0C4B\u0C02\u0C26\u0C3F",
      "\u0C2D\u0C42\u0C2E\u0C3F \u0C09\u0C28\u0C4D\u0C28\u0C35\u0C3E\u0C30\u0C3F\u0C15\u0C3F \u0C30\u0C48\u0C24\u0C41 \u0C10\u0C21\u0C3F",
      "\u0C24\u0C15\u0C4D\u0C15\u0C41\u0C35 \u0C2A\u0C4D\u0C30\u0C40\u0C2E\u0C3F\u0C2F\u0C02"
    ],
    eligibilityRules: {
      requiresLand: true,
      prefersLandRecords: true
    },
    verifiedAt: "2026-09-04"
  },
  {
    id: "rythu-bima-ts",
    category: "insurance",
    region: "ts",
    status: "active",
    titleEn: "Rythu Bima",
    titleTe: "\u0C30\u0C48\u0C24\u0C41 \u0C2C\u0C40\u0C2E\u0C3E",
    amountEn: "\u20B95 lakh to nominee",
    amountTe: "\u0C28\u0C3E\u0C2E\u0C3F\u0C28\u0C40\u0C15\u0C3F \u20B95 \u0C32\u0C15\u0C4D\u0C37\u0C32\u0C41",
    benefitEn: "Life cover for registered Telangana farmers \u2014 if the farmer dies, the nominee receives \u20B95 lakh. Linked for farmers registered under Rythu Bharosa.",
    benefitTe: "\u0C28\u0C2E\u0C4B\u0C26\u0C3F\u0C24 \u0C24\u0C46\u0C32\u0C02\u0C17\u0C3E\u0C23 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C15\u0C41 \u0C1C\u0C40\u0C35\u0C3F\u0C24 \u0C2C\u0C40\u0C2E\u0C3E \u2014 \u0C30\u0C48\u0C24\u0C41 \u0C2E\u0C30\u0C23\u0C3F\u0C38\u0C4D\u0C24\u0C47 \u0C28\u0C3E\u0C2E\u0C3F\u0C28\u0C40\u0C15\u0C3F \u20B95 \u0C32\u0C15\u0C4D\u0C37\u0C32\u0C41. \u0C30\u0C48\u0C24\u0C41 \u0C2D\u0C30\u0C4B\u0C38\u0C3E \u0C28\u0C2E\u0C4B\u0C26\u0C48\u0C28 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C15\u0C41 \u0C05\u0C28\u0C41\u0C38\u0C02\u0C27\u0C3E\u0C28\u0C02.",
    eligibilityEn: "Farmers in Telangana with Rythu Bharosa or agriculture registration.",
    eligibilityTe: "\u0C24\u0C46\u0C32\u0C02\u0C17\u0C3E\u0C23\u0C32\u0C4B \u0C30\u0C48\u0C24\u0C41 \u0C2D\u0C30\u0C4B\u0C38\u0C3E \u0C32\u0C47\u0C26\u0C3E \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C28\u0C2E\u0C4B\u0C26\u0C41 \u0C09\u0C28\u0C4D\u0C28 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C41.",
    howToApplyEn: "Usually linked automatically with Rythu Bharosa registration. Confirm details at your local agriculture office.",
    howToApplyTe: "\u0C38\u0C3E\u0C27\u0C3E\u0C30\u0C23\u0C02\u0C17\u0C3E \u0C30\u0C48\u0C24\u0C41 \u0C2D\u0C30\u0C4B\u0C38\u0C3E \u0C28\u0C2E\u0C4B\u0C26\u0C41\u0C24\u0C4B \u0C38\u0C4D\u0C35\u0C2F\u0C02\u0C1A\u0C3E\u0C32\u0C15\u0C02\u0C17\u0C3E \u0C32\u0C3F\u0C02\u0C15\u0C4D \u0C05\u0C35\u0C41\u0C24\u0C41\u0C02\u0C26\u0C3F. \u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32\u0C41 \u0C38\u0C4D\u0C25\u0C3E\u0C28\u0C3F\u0C15 \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C15\u0C3E\u0C30\u0C4D\u0C2F\u0C3E\u0C32\u0C2F\u0C02\u0C32\u0C4B \u0C28\u0C3F\u0C30\u0C4D\u0C27\u0C3E\u0C30\u0C3F\u0C02\u0C1A\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F.",
    icon: "heart-pulse",
    highlightsEn: [
      "\u20B95 lakh to nominee",
      "Linked to Rythu Bharosa",
      "Telangana only"
    ],
    highlightsTe: [
      "\u0C28\u0C3E\u0C2E\u0C3F\u0C28\u0C40\u0C15\u0C3F \u20B95 \u0C32\u0C15\u0C4D\u0C37\u0C32\u0C41",
      "\u0C30\u0C48\u0C24\u0C41 \u0C2D\u0C30\u0C4B\u0C38\u0C3E\u0C15\u0C41 \u0C32\u0C3F\u0C02\u0C15\u0C4D",
      "\u0C24\u0C46\u0C32\u0C02\u0C17\u0C3E\u0C23 \u0C2E\u0C3E\u0C24\u0C4D\u0C30\u0C2E\u0C47"
    ],
    eligibilityRules: {
      requiresLand: true
    },
    verifiedAt: "2026-09-04"
  },
  {
    id: "pmksy-micro-irrigation",
    category: "subsidy",
    region: "central",
    status: "active",
    titleEn: "PM Krishi Sinchai \u2014 Drip / Sprinkler",
    titleTe: "\u0C2A\u0C40\u0C0E\u0C02 \u0C15\u0C43\u0C37\u0C3F \u0C38\u0C3F\u0C02\u0C1A\u0C3E\u0C2F\u0C3F \u2014 \u0C21\u0C4D\u0C30\u0C3F\u0C2A\u0C4D / \u0C38\u0C4D\u0C2A\u0C4D\u0C30\u0C3F\u0C02\u0C15\u0C4D\u0C32\u0C30\u0C4D",
    amountEn: "Subsidy up to 55%",
    amountTe: "55% \u0C35\u0C30\u0C15\u0C41 \u0C38\u0C2C\u0C4D\u0C38\u0C3F\u0C21\u0C40",
    benefitEn: "Capital subsidy for drip and sprinkler systems. Small and marginal farmers: up to 55%. Others: about 45%. Helps save water and improve yield.",
    benefitTe: "\u0C21\u0C4D\u0C30\u0C3F\u0C2A\u0C4D \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C38\u0C4D\u0C2A\u0C4D\u0C30\u0C3F\u0C02\u0C15\u0C4D\u0C32\u0C30\u0C4D \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C4D\u0C25\u0C32\u0C15\u0C41 \u0C2E\u0C42\u0C32\u0C27\u0C28 \u0C38\u0C2C\u0C4D\u0C38\u0C3F\u0C21\u0C40. \u0C1A\u0C3F\u0C28\u0C4D\u0C28 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C38\u0C28\u0C4D\u0C28\u0C15\u0C3E\u0C30\u0C41 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C15\u0C41 55% \u0C35\u0C30\u0C15\u0C41. \u0C07\u0C24\u0C30\u0C41\u0C32\u0C15\u0C41 \u0C38\u0C41\u0C2E\u0C3E\u0C30\u0C41 45%. \u0C28\u0C40\u0C1F\u0C3F \u0C2A\u0C4A\u0C26\u0C41\u0C2A\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C26\u0C3F\u0C17\u0C41\u0C2C\u0C21\u0C3F \u0C2A\u0C46\u0C02\u0C2A\u0C41\u0C26\u0C32\u0C15\u0C41 \u0C38\u0C39\u0C3E\u0C2F\u0C02.",
    eligibilityEn: "Farmers with cultivable land who will install a micro-irrigation system through an empaneled company.",
    eligibilityTe: "\u0C38\u0C3E\u0C17\u0C41 \u0C2D\u0C42\u0C2E\u0C3F \u0C09\u0C28\u0C4D\u0C28 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C41 \u2014 \u0C0E\u0C02\u0C2A\u0C28\u0C46\u0C32\u0C4D\u0C21\u0C4D \u0C15\u0C02\u0C2A\u0C46\u0C28\u0C40 \u0C26\u0C4D\u0C35\u0C3E\u0C30\u0C3E \u0C2E\u0C48\u0C15\u0C4D\u0C30\u0C4B \u0C07\u0C30\u0C3F\u0C17\u0C47\u0C37\u0C28\u0C4D \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C4D\u0C25 \u0C0F\u0C30\u0C4D\u0C2A\u0C3E\u0C1F\u0C41 \u0C1A\u0C47\u0C2F\u0C3E\u0C32\u0C3F.",
    howToApplyEn: "Apply at the District Agriculture Office or horticulture department. Online portals are available state-wise.",
    howToApplyTe: "\u0C1C\u0C3F\u0C32\u0C4D\u0C32\u0C3E \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C15\u0C3E\u0C30\u0C4D\u0C2F\u0C3E\u0C32\u0C2F\u0C02 / \u0C09\u0C26\u0C4D\u0C2F\u0C3E\u0C28\u0C35\u0C28 \u0C36\u0C3E\u0C16\u0C32\u0C4B \u0C26\u0C30\u0C16\u0C3E\u0C38\u0C4D\u0C24\u0C41 \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F. \u0C30\u0C3E\u0C37\u0C4D\u0C1F\u0C4D\u0C30\u0C3E\u0C32 \u0C35\u0C3E\u0C30\u0C40\u0C17\u0C3E \u0C06\u0C28\u0C4D\u200C\u0C32\u0C48\u0C28\u0C4D \u0C2A\u0C4B\u0C30\u0C4D\u0C1F\u0C32\u0C4D\u0C38\u0C4D \u0C09\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3F.",
    icon: "water",
    highlightsEn: [
      "Drip and sprinkler",
      "55% for small farmers",
      "Active"
    ],
    highlightsTe: [
      "\u0C21\u0C4D\u0C30\u0C3F\u0C2A\u0C4D \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C38\u0C4D\u0C2A\u0C4D\u0C30\u0C3F\u0C02\u0C15\u0C4D\u0C32\u0C30\u0C4D",
      "\u0C1A\u0C3F\u0C28\u0C4D\u0C28 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C15\u0C41 55%",
      "\u0C15\u0C4A\u0C28\u0C38\u0C3E\u0C17\u0C41\u0C24\u0C4B\u0C02\u0C26\u0C3F"
    ],
    eligibilityRules: {
      requiresLand: true
    },
    verifiedAt: "2026-09-04"
  },
  {
    id: "smam-machinery",
    category: "subsidy",
    region: "central",
    status: "active",
    titleEn: "SMAM \u2014 Farm Machinery Subsidy",
    titleTe: "\u0C0E\u0C38\u0C4D\u200C\u0C0E\u0C02\u0C0F\u0C0E\u0C02 \u2014 \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C2F\u0C02\u0C24\u0C4D\u0C30\u0C3E\u0C32 \u0C38\u0C2C\u0C4D\u0C38\u0C3F\u0C21\u0C40",
    amountEn: "Subsidy up to 50%",
    amountTe: "50% \u0C35\u0C30\u0C15\u0C41 \u0C38\u0C2C\u0C4D\u0C38\u0C3F\u0C21\u0C40",
    benefitEn: "Subsidy for tractors, power tillers, harvesters, seed drills, and similar farm machinery. Higher benefit for small and marginal farmers.",
    benefitTe: "\u0C1F\u0C4D\u0C30\u0C3E\u0C15\u0C4D\u0C1F\u0C30\u0C4D, \u0C2A\u0C35\u0C30\u0C4D \u0C1F\u0C3F\u0C32\u0C4D\u0C32\u0C30\u0C4D, \u0C39\u0C3E\u0C30\u0C4D\u0C35\u0C46\u0C38\u0C4D\u0C1F\u0C30\u0C4D, \u0C38\u0C40\u0C21\u0C4D \u0C21\u0C4D\u0C30\u0C3F\u0C32\u0C4D \u0C35\u0C02\u0C1F\u0C3F \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C2F\u0C02\u0C24\u0C4D\u0C30\u0C3E\u0C32\u0C15\u0C41 \u0C38\u0C2C\u0C4D\u0C38\u0C3F\u0C21\u0C40. \u0C1A\u0C3F\u0C28\u0C4D\u0C28 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C38\u0C28\u0C4D\u0C28\u0C15\u0C3E\u0C30\u0C41 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C15\u0C41 \u0C0E\u0C15\u0C4D\u0C15\u0C41\u0C35 \u0C2A\u0C4D\u0C30\u0C2F\u0C4B\u0C1C\u0C28\u0C02.",
    eligibilityEn: "Small, marginal, and other farmers. Support is also available to set up Custom Hiring Centres (CHC).",
    eligibilityTe: "\u0C1A\u0C3F\u0C28\u0C4D\u0C28, \u0C38\u0C28\u0C4D\u0C28\u0C15\u0C3E\u0C30\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C07\u0C24\u0C30 \u0C30\u0C48\u0C24\u0C41\u0C32\u0C41. \u0C15\u0C38\u0C4D\u0C1F\u0C2E\u0C4D \u0C39\u0C48\u0C30\u0C3F\u0C02\u0C17\u0C4D \u0C38\u0C46\u0C02\u0C1F\u0C30\u0C4D\u0C32\u0C41 (\u0C38\u0C40\u0C39\u0C46\u0C1A\u0C4D\u200C\u0C38\u0C40) \u0C0F\u0C30\u0C4D\u0C2A\u0C3E\u0C1F\u0C41\u0C15\u0C41 \u0C15\u0C42\u0C21\u0C3E \u0C2E\u0C26\u0C4D\u0C26\u0C24\u0C41 \u0C09\u0C02\u0C26\u0C3F.",
    howToApplyEn: "Through the agriculture department or agrimachinery.nic.in. District-level approval applies.",
    howToApplyTe: "\u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C36\u0C3E\u0C16 \u0C32\u0C47\u0C26\u0C3E agrimachinery.nic.in \u0C2A\u0C4B\u0C30\u0C4D\u0C1F\u0C32\u0C4D \u0C26\u0C4D\u0C35\u0C3E\u0C30\u0C3E. \u0C1C\u0C3F\u0C32\u0C4D\u0C32\u0C3E \u0C38\u0C4D\u0C25\u0C3E\u0C2F\u0C3F \u0C06\u0C2E\u0C4B\u0C26 \u0C2A\u0C4D\u0C30\u0C15\u0C4D\u0C30\u0C3F\u0C2F \u0C09\u0C02\u0C26\u0C3F.",
    applyUrl: "https://agrimachinery.nic.in/",
    icon: "tractor",
    highlightsEn: [
      "Tractor and tools",
      "CHC support",
      "Small farmer priority"
    ],
    highlightsTe: [
      "\u0C1F\u0C4D\u0C30\u0C3E\u0C15\u0C4D\u0C1F\u0C30\u0C4D \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C2A\u0C30\u0C3F\u0C15\u0C30\u0C3E\u0C32\u0C41",
      "\u0C38\u0C40\u0C39\u0C46\u0C1A\u0C4D\u200C\u0C38\u0C40 \u0C2E\u0C26\u0C4D\u0C26\u0C24\u0C41",
      "\u0C1A\u0C3F\u0C28\u0C4D\u0C28 \u0C30\u0C48\u0C24\u0C41 \u0C2A\u0C4D\u0C30\u0C3E\u0C27\u0C3E\u0C28\u0C4D\u0C2F\u0C02"
    ],
    eligibilityRules: {
      requiresLand: true
    },
    verifiedAt: "2026-09-04"
  },
  {
    id: "aif",
    category: "loan",
    region: "central",
    status: "active",
    titleEn: "Agriculture Infrastructure Fund (AIF)",
    titleTe: "\u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C2E\u0C4C\u0C32\u0C3F\u0C15 \u0C38\u0C26\u0C41\u0C2A\u0C3E\u0C2F\u0C3E\u0C32 \u0C28\u0C3F\u0C27\u0C3F (\u0C0F\u0C10\u0C0E\u0C2B\u0C4D)",
    amountEn: "Loans \u20B92\u2013100 lakh",
    amountTe: "\u0C30\u0C41\u0C23\u0C3E\u0C32\u0C41 \u20B92\u2013100 \u0C32\u0C15\u0C4D\u0C37\u0C32\u0C41",
    benefitEn: "Medium to long-term loans for cold storage, warehouses, sorting, grading, and processing units. About 3% interest subvention may apply.",
    benefitTe: "\u0C15\u0C4B\u0C32\u0C4D\u0C21\u0C4D \u0C38\u0C4D\u0C1F\u0C4B\u0C30\u0C47\u0C1C\u0C4D, \u0C17\u0C4B\u0C26\u0C3E\u0C2E\u0C41\u0C32\u0C41, \u0C38\u0C3E\u0C30\u0C4D\u0C1F\u0C3F\u0C02\u0C17\u0C4D, \u0C17\u0C4D\u0C30\u0C47\u0C21\u0C3F\u0C02\u0C17\u0C4D, \u0C2A\u0C4D\u0C30\u0C3E\u0C38\u0C46\u0C38\u0C3F\u0C02\u0C17\u0C4D \u0C2F\u0C42\u0C28\u0C3F\u0C1F\u0C4D\u0C32\u0C15\u0C41 \u0C2E\u0C27\u0C4D\u0C2F-\u0C26\u0C40\u0C30\u0C4D\u0C18\u0C15\u0C3E\u0C32\u0C3F\u0C15 \u0C30\u0C41\u0C23\u0C3E\u0C32\u0C41. \u0C38\u0C41\u0C2E\u0C3E\u0C30\u0C41 3% \u0C35\u0C21\u0C4D\u0C21\u0C40 \u0C30\u0C3E\u0C2F\u0C3F\u0C24\u0C40 \u0C09\u0C02\u0C21\u0C35\u0C1A\u0C4D\u0C1A\u0C41.",
    eligibilityEn: "Farmers, FPOs, agri entrepreneurs, and startups with a viable project report.",
    eligibilityTe: "\u0C30\u0C48\u0C24\u0C41\u0C32\u0C41, \u0C0E\u0C2B\u0C4D\u200C\u0C2A\u0C40\u0C13\u0C32\u0C41, \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C4D\u0C25\u0C3E\u0C2A\u0C15\u0C41\u0C32\u0C41, \u0C38\u0C4D\u0C1F\u0C3E\u0C30\u0C4D\u0C1F\u0C2A\u0C4D\u200C\u0C32\u0C41 \u2014 \u0C38\u0C3E\u0C27\u0C4D\u0C2F\u0C2E\u0C48\u0C28 \u0C2A\u0C4D\u0C30\u0C3E\u0C1C\u0C46\u0C15\u0C4D\u0C1F\u0C4D \u0C28\u0C3F\u0C35\u0C47\u0C26\u0C3F\u0C15 \u0C05\u0C35\u0C38\u0C30\u0C02.",
    howToApplyEn: "Apply through scheduled banks or NABARD-approved projects. See details at agriinfra.dac.gov.in.",
    howToApplyTe: "\u0C37\u0C46\u0C21\u0C4D\u0C2F\u0C42\u0C32\u0C4D\u0C21\u0C4D \u0C2C\u0C4D\u0C2F\u0C3E\u0C02\u0C15\u0C41\u0C32\u0C41 / \u0C28\u0C3E\u0C2C\u0C3E\u0C30\u0C4D\u0C21\u0C4D \u0C06\u0C2E\u0C4B\u0C26\u0C3F\u0C24 \u0C2A\u0C4D\u0C30\u0C3E\u0C1C\u0C46\u0C15\u0C4D\u0C1F\u0C41\u0C32 \u0C26\u0C4D\u0C35\u0C3E\u0C30\u0C3E \u0C26\u0C30\u0C16\u0C3E\u0C38\u0C4D\u0C24\u0C41 \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F. agriinfra.dac.gov.in\u0C32\u0C4B \u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32\u0C41 \u0C1A\u0C42\u0C21\u0C02\u0C21\u0C3F.",
    applyUrl: "https://agriinfra.dac.gov.in/",
    icon: "warehouse",
    highlightsEn: [
      "Post-harvest infrastructure",
      "About 3% interest subvention",
      "FPOs eligible"
    ],
    highlightsTe: [
      "\u0C2A\u0C02\u0C1F \u0C05\u0C28\u0C02\u0C24\u0C30 \u0C2E\u0C4C\u0C32\u0C3F\u0C15 \u0C38\u0C26\u0C41\u0C2A\u0C3E\u0C2F\u0C3E\u0C32\u0C41",
      "\u0C38\u0C41\u0C2E\u0C3E\u0C30\u0C41 3% \u0C35\u0C21\u0C4D\u0C21\u0C40 \u0C30\u0C3E\u0C2F\u0C3F\u0C24\u0C40",
      "\u0C0E\u0C2B\u0C4D\u200C\u0C2A\u0C40\u0C13\u0C32\u0C41 \u0C05\u0C30\u0C4D\u0C39\u0C41\u0C32\u0C41"
    ],
    eligibilityRules: {},
    verifiedAt: "2026-09-04"
  },
  {
    id: "soil-health-card",
    category: "subsidy",
    region: "central",
    status: "active",
    titleEn: "Soil Health Card",
    titleTe: "\u0C28\u0C47\u0C32 \u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F \u0C15\u0C3E\u0C30\u0C4D\u0C21\u0C41",
    amountEn: "Free",
    amountTe: "\u0C09\u0C1A\u0C3F\u0C24\u0C02",
    benefitEn: "Free soil testing for your field with a report on N, P, K, micronutrients, and pH \u2014 to reduce fertilizer waste and guide better yield.",
    benefitTe: "\u0C2E\u0C40 \u0C2A\u0C4A\u0C32\u0C02 \u0C28\u0C47\u0C32 \u0C2A\u0C30\u0C40\u0C15\u0C4D\u0C37 \u0C1A\u0C47\u0C38\u0C3F \u0C28\u0C24\u0C4D\u0C30\u0C1C\u0C28\u0C3F, \u0C2D\u0C3E\u0C38\u0C4D\u0C35\u0C30\u0C02, \u0C2A\u0C4A\u0C1F\u0C3E\u0C37\u0C4D, \u0C38\u0C42\u0C15\u0C4D\u0C37\u0C4D\u0C2E\u0C2A\u0C4B\u0C37\u0C15\u0C3E\u0C32\u0C41, \u0C2A\u0C40\u0C39\u0C46\u0C1A\u0C4D \u0C28\u0C3F\u0C35\u0C47\u0C26\u0C3F\u0C15 \u0C07\u0C38\u0C4D\u0C24\u0C3E\u0C30\u0C41 \u2014 \u0C0E\u0C30\u0C41\u0C35\u0C41 \u0C35\u0C43\u0C25\u0C3E \u0C24\u0C17\u0C4D\u0C17\u0C3F\u0C02\u0C1A\u0C3F \u0C26\u0C3F\u0C17\u0C41\u0C2C\u0C21\u0C3F \u0C2A\u0C46\u0C02\u0C1A\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C2E\u0C3E\u0C30\u0C4D\u0C17\u0C26\u0C30\u0C4D\u0C36\u0C15\u0C02.",
    eligibilityEn: "All farmers across India who can provide a land sample.",
    eligibilityTe: "\u0C2D\u0C3E\u0C30\u0C24\u0C26\u0C47\u0C36\u0C02 \u0C05\u0C02\u0C24\u0C1F\u0C3E \u0C05\u0C28\u0C4D\u0C28\u0C3F \u0C30\u0C48\u0C24\u0C41\u0C32\u0C41 \u2014 \u0C2D\u0C42\u0C2E\u0C3F \u0C28\u0C41\u0C02\u0C1A\u0C3F \u0C28\u0C2E\u0C42\u0C28\u0C3E \u0C07\u0C35\u0C4D\u0C35\u0C17\u0C32\u0C3F\u0C17\u0C3F\u0C24\u0C47.",
    howToApplyEn: "Give a sample at the District Agriculture Office, soil testing lab, or RSK. Mobile soil testing vans are also available.",
    howToApplyTe: "\u0C1C\u0C3F\u0C32\u0C4D\u0C32\u0C3E \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C15\u0C3E\u0C30\u0C4D\u0C2F\u0C3E\u0C32\u0C2F\u0C02 / \u0C28\u0C47\u0C32 \u0C2A\u0C30\u0C40\u0C15\u0C4D\u0C37\u0C3E \u0C2A\u0C4D\u0C30\u0C2F\u0C4B\u0C17\u0C36\u0C3E\u0C32 / \u0C06\u0C30\u0C4D\u0C0E\u0C38\u0C4D\u200C\u0C15\u0C47\u0C32\u0C4B \u0C28\u0C2E\u0C42\u0C28\u0C3E \u0C07\u0C35\u0C4D\u0C35\u0C02\u0C21\u0C3F. \u0C2E\u0C4A\u0C2C\u0C48\u0C32\u0C4D \u0C28\u0C47\u0C32 \u0C2A\u0C30\u0C40\u0C15\u0C4D\u0C37\u0C3E \u0C35\u0C4D\u0C2F\u0C3E\u0C28\u0C4D\u0C32\u0C41 \u0C15\u0C42\u0C21\u0C3E \u0C09\u0C02\u0C1F\u0C3E\u0C2F\u0C3F.",
    icon: "flask-outline",
    highlightsEn: [
      "Free testing",
      "Crop-wise fertilizer advice",
      "Active"
    ],
    highlightsTe: [
      "\u0C09\u0C1A\u0C3F\u0C24 \u0C2A\u0C30\u0C40\u0C15\u0C4D\u0C37",
      "\u0C2A\u0C02\u0C1F\u0C35\u0C3E\u0C30\u0C40 \u0C0E\u0C30\u0C41\u0C35\u0C41 \u0C38\u0C32\u0C39\u0C3E",
      "\u0C15\u0C4A\u0C28\u0C38\u0C3E\u0C17\u0C41\u0C24\u0C4B\u0C02\u0C26\u0C3F"
    ],
    eligibilityRules: {
      requiresLand: true
    },
    verifiedAt: "2026-09-04"
  },
  {
    id: "indiramma-atmiya-bharosa",
    category: "support",
    region: "ts",
    status: "active",
    titleEn: "Indiramma Atmiya Bharosa",
    titleTe: "\u0C07\u0C02\u0C26\u0C3F\u0C30\u0C2E\u0C4D\u0C2E \u0C06\u0C24\u0C4D\u0C2E\u0C40\u0C2F \u0C2D\u0C30\u0C4B\u0C38\u0C3E",
    amountEn: "\u20B912,000 / year",
    amountTe: "\u0C38\u0C02\u0C35\u0C24\u0C4D\u0C38\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u20B912,000",
    benefitEn: "\u20B912,000 a year financial support for registered landless agricultural labourers in Telangana.",
    benefitTe: "\u0C24\u0C46\u0C32\u0C02\u0C17\u0C3E\u0C23\u0C32\u0C4B \u0C2D\u0C42\u0C2E\u0C3F \u0C32\u0C47\u0C28\u0C3F \u0C28\u0C2E\u0C4B\u0C26\u0C3F\u0C24 \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C15\u0C42\u0C32\u0C40\u0C32\u0C15\u0C41 \u0C38\u0C02\u0C35\u0C24\u0C4D\u0C38\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u20B912,000 \u0C06\u0C30\u0C4D\u0C25\u0C3F\u0C15 \u0C38\u0C39\u0C3E\u0C2F\u0C02.",
    eligibilityEn: "Registered landless agricultural labourers in Telangana.",
    eligibilityTe: "\u0C24\u0C46\u0C32\u0C02\u0C17\u0C3E\u0C23\u0C32\u0C4B \u0C28\u0C2E\u0C4B\u0C26\u0C48\u0C28 \u0C2D\u0C42\u0C2E\u0C3F \u0C32\u0C47\u0C28\u0C3F \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C15\u0C42\u0C32\u0C40\u0C32\u0C41.",
    howToApplyEn: "Register at the local revenue or agriculture office. Linked with the Rythu Bharosa system.",
    howToApplyTe: "\u0C38\u0C4D\u0C25\u0C3E\u0C28\u0C3F\u0C15 \u0C30\u0C46\u0C35\u0C46\u0C28\u0C4D\u0C2F\u0C42 / \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C3E\u0C2F \u0C15\u0C3E\u0C30\u0C4D\u0C2F\u0C3E\u0C32\u0C2F\u0C02\u0C32\u0C4B \u0C28\u0C2E\u0C4B\u0C26\u0C41. \u0C30\u0C48\u0C24\u0C41 \u0C2D\u0C30\u0C4B\u0C38\u0C3E \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C4D\u0C25\u0C24\u0C4B \u0C05\u0C28\u0C41\u0C38\u0C02\u0C27\u0C3E\u0C28\u0C02.",
    icon: "account-group",
    highlightsEn: [
      "Landless labourers",
      "\u20B912,000 a year",
      "Telangana only"
    ],
    highlightsTe: [
      "\u0C2D\u0C42\u0C2E\u0C3F \u0C32\u0C47\u0C28\u0C3F \u0C15\u0C42\u0C32\u0C40\u0C32\u0C41",
      "\u0C38\u0C02\u0C35\u0C24\u0C4D\u0C38\u0C30\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u20B912,000",
      "\u0C24\u0C46\u0C32\u0C02\u0C17\u0C3E\u0C23 \u0C2E\u0C3E\u0C24\u0C4D\u0C30\u0C2E\u0C47"
    ],
    eligibilityRules: {
      landlessOnly: true
    },
    verifiedAt: "2026-09-04"
  }
];

// src/services/adminDashboardService.ts
init_nearbyAgPlacesService();
async function getAdminAnalytics() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
  const [[usersTotal], [usersActive], [usersWeek], [usersMonth], [fertCount], [schemeCount], [broadcastCount]] = await Promise.all([
    db.select({ n: (0, import_drizzle_orm25.count)() }).from(farmers),
    db.select({ n: (0, import_drizzle_orm25.count)() }).from(farmers).where((0, import_drizzle_orm25.eq)(farmers.isActive, true)),
    db.select({ n: (0, import_drizzle_orm25.count)() }).from(farmers).where((0, import_drizzle_orm25.gte)(farmers.createdAt, weekAgo)),
    db.select({ n: (0, import_drizzle_orm25.count)() }).from(farmers).where((0, import_drizzle_orm25.gte)(farmers.createdAt, monthAgo)),
    db.select({ n: (0, import_drizzle_orm25.count)() }).from(fertilizerProducts),
    db.select({ n: (0, import_drizzle_orm25.count)() }).from(govtSchemes),
    db.select({ n: (0, import_drizzle_orm25.count)() }).from(adminBroadcasts)
  ]);
  const recentJobs = await db.select({
    id: syncJobs.id,
    sourceId: syncJobs.sourceId,
    status: syncJobs.status,
    startedAt: syncJobs.startedAt,
    finishedAt: syncJobs.finishedAt
  }).from(syncJobs).orderBy((0, import_drizzle_orm25.desc)(syncJobs.startedAt)).limit(8);
  const sources = await db.select({
    id: dataSources.id,
    name: dataSources.name,
    lastSyncAt: dataSources.lastSyncAt
  }).from(dataSources).limit(20);
  return {
    users: {
      total: Number(usersTotal?.n ?? 0),
      active: Number(usersActive?.n ?? 0),
      newLast7Days: Number(usersWeek?.n ?? 0),
      newLast30Days: Number(usersMonth?.n ?? 0)
    },
    catalog: {
      fertilizers: Number(fertCount?.n ?? 0),
      schemes: Number(schemeCount?.n ?? 0),
      broadcasts: Number(broadcastCount?.n ?? 0)
    },
    sync: { sources, recentJobs }
  };
}
async function listAdminUsers(opts) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 25));
  const offset = (page - 1) * limit;
  const q = opts.q?.trim();
  const where = q ? (0, import_drizzle_orm25.or)(
    (0, import_drizzle_orm25.ilike)(farmers.name, `%${q}%`),
    (0, import_drizzle_orm25.ilike)(farmers.phone, `%${q}%`),
    (0, import_drizzle_orm25.ilike)(farmers.email, `%${q}%`),
    (0, import_drizzle_orm25.ilike)(farmers.locationLabel, `%${q}%`)
  ) : void 0;
  const [totalRow] = await db.select({ n: (0, import_drizzle_orm25.count)() }).from(farmers).where(where);
  const rows = await db.select({
    id: farmers.id,
    name: farmers.name,
    phone: farmers.phone,
    email: farmers.email,
    language: farmers.language,
    locationLabel: farmers.locationLabel,
    farmSize: farmers.farmSize,
    isActive: farmers.isActive,
    createdAt: farmers.createdAt,
    updatedAt: farmers.updatedAt
  }).from(farmers).where(where).orderBy((0, import_drizzle_orm25.desc)(farmers.createdAt)).limit(limit).offset(offset);
  const ids = rows.map((r) => r.id);
  const cropMeta = ids.length === 0 ? [] : await db.select({
    farmerId: cropCalendar.farmerId,
    cropId: cropCalendar.cropId,
    cropName: crops.name,
    cropNameTe: crops.nameTe
  }).from(cropCalendar).leftJoin(crops, (0, import_drizzle_orm25.eq)(cropCalendar.cropId, crops.id)).where((0, import_drizzle_orm25.inArray)(cropCalendar.farmerId, ids));
  const byFarmer = /* @__PURE__ */ new Map();
  for (const row of cropMeta) {
    const cur = byFarmer.get(row.farmerId) ?? { cropCount: 0, cropNames: [] };
    cur.cropCount += 1;
    const label = row.cropName || row.cropId;
    if (label && !cur.cropNames.includes(label)) cur.cropNames.push(label);
    byFarmer.set(row.farmerId, cur);
  }
  return {
    data: rows.map((r) => ({
      ...r,
      cropCount: byFarmer.get(r.id)?.cropCount ?? 0,
      cropNames: byFarmer.get(r.id)?.cropNames ?? []
    })),
    page,
    limit,
    total: Number(totalRow?.n ?? 0)
  };
}
async function getAdminUserFarm(farmerId) {
  const [farmer] = await db.select({
    id: farmers.id,
    name: farmers.name,
    phone: farmers.phone,
    email: farmers.email,
    language: farmers.language,
    locationLabel: farmers.locationLabel,
    farmSize: farmers.farmSize,
    isActive: farmers.isActive,
    createdAt: farmers.createdAt
  }).from(farmers).where((0, import_drizzle_orm25.eq)(farmers.id, farmerId)).limit(1);
  if (!farmer) return null;
  const landRows = await db.select().from(lands).where((0, import_drizzle_orm25.eq)(lands.farmerId, farmerId));
  const plantings = await db.select({
    id: cropCalendar.id,
    cropId: cropCalendar.cropId,
    cropName: crops.name,
    cropNameTe: crops.nameTe,
    varietyName: cropCalendar.varietyName,
    landId: cropCalendar.landId,
    sowingDate: cropCalendar.sowingDate,
    expectedHarvestDate: cropCalendar.expectedHarvestDate,
    actualHarvestDate: cropCalendar.actualHarvestDate,
    stage: cropCalendar.stage,
    notes: cropCalendar.notes,
    updatedAt: cropCalendar.updatedAt
  }).from(cropCalendar).leftJoin(crops, (0, import_drizzle_orm25.eq)(cropCalendar.cropId, crops.id)).where((0, import_drizzle_orm25.eq)(cropCalendar.farmerId, farmerId)).orderBy((0, import_drizzle_orm25.desc)(cropCalendar.updatedAt));
  return {
    farmer,
    lands: landRows.map((l) => ({
      id: l.id,
      label: l.label,
      areaAcres: l.areaAcres,
      village: l.village,
      mandal: l.mandal,
      district: l.district,
      state: l.state,
      soilType: l.soilType
    })),
    crops: plantings.map((p) => ({
      id: p.id,
      cropId: p.cropId,
      cropName: p.cropName ?? p.cropId,
      cropNameTe: p.cropNameTe,
      varietyName: p.varietyName,
      landId: p.landId,
      sowingDate: p.sowingDate,
      expectedHarvestDate: p.expectedHarvestDate,
      actualHarvestDate: p.actualHarvestDate,
      stage: p.stage,
      notes: p.notes,
      updatedAt: p.updatedAt
    }))
  };
}
async function listAdminCropPlantings(opts) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 40));
  const offset = (page - 1) * limit;
  const q = opts.q?.trim();
  const where = q ? (0, import_drizzle_orm25.or)(
    (0, import_drizzle_orm25.ilike)(farmers.name, `%${q}%`),
    (0, import_drizzle_orm25.ilike)(farmers.phone, `%${q}%`),
    (0, import_drizzle_orm25.ilike)(crops.name, `%${q}%`),
    (0, import_drizzle_orm25.ilike)(cropCalendar.cropId, `%${q}%`),
    (0, import_drizzle_orm25.ilike)(cropCalendar.varietyName, `%${q}%`)
  ) : void 0;
  const [totalRow] = await db.select({ n: (0, import_drizzle_orm25.count)() }).from(cropCalendar).innerJoin(farmers, (0, import_drizzle_orm25.eq)(cropCalendar.farmerId, farmers.id)).leftJoin(crops, (0, import_drizzle_orm25.eq)(cropCalendar.cropId, crops.id)).where(where);
  const rows = await db.select({
    id: cropCalendar.id,
    farmerId: farmers.id,
    farmerName: farmers.name,
    farmerPhone: farmers.phone,
    cropId: cropCalendar.cropId,
    cropName: crops.name,
    cropNameTe: crops.nameTe,
    varietyName: cropCalendar.varietyName,
    sowingDate: cropCalendar.sowingDate,
    expectedHarvestDate: cropCalendar.expectedHarvestDate,
    stage: cropCalendar.stage,
    locationLabel: farmers.locationLabel,
    updatedAt: cropCalendar.updatedAt
  }).from(cropCalendar).innerJoin(farmers, (0, import_drizzle_orm25.eq)(cropCalendar.farmerId, farmers.id)).leftJoin(crops, (0, import_drizzle_orm25.eq)(cropCalendar.cropId, crops.id)).where(where).orderBy((0, import_drizzle_orm25.desc)(cropCalendar.updatedAt)).limit(limit).offset(offset);
  return {
    data: rows,
    page,
    limit,
    total: Number(totalRow?.n ?? 0)
  };
}
async function setFarmerActive(id, isActive) {
  const [row] = await db.update(farmers).set({ isActive, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm25.eq)(farmers.id, id)).returning({
    id: farmers.id,
    name: farmers.name,
    phone: farmers.phone,
    isActive: farmers.isActive
  });
  return row ?? null;
}
function slugId2(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  return `${base || "fertilizer"}-${Date.now().toString(36)}`;
}
async function listAdminFertilizers(opts) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 25));
  const offset = (page - 1) * limit;
  const search = opts.search?.trim();
  const where = search ? (0, import_drizzle_orm25.or)(
    (0, import_drizzle_orm25.ilike)(fertilizerProducts.name, `%${search}%`),
    (0, import_drizzle_orm25.ilike)(fertilizerProducts.brand, `%${search}%`),
    (0, import_drizzle_orm25.ilike)(fertilizerProducts.category, `%${search}%`)
  ) : void 0;
  const [totalRow] = await db.select({ n: (0, import_drizzle_orm25.count)() }).from(fertilizerProducts).where(where);
  const rows = await db.select().from(fertilizerProducts).where(where).orderBy((0, import_drizzle_orm25.desc)(fertilizerProducts.updatedAt)).limit(limit).offset(offset);
  return { data: rows, page, limit, total: Number(totalRow?.n ?? 0) };
}
async function createAdminFertilizer(input) {
  const id = (input.id?.trim() || slugId2(input.name)).slice(0, 80);
  const now = /* @__PURE__ */ new Date();
  const [row] = await db.insert(fertilizerProducts).values({
    id,
    name: input.name.trim(),
    nameTe: input.nameTe ?? null,
    brand: input.brand.trim(),
    category: input.category.trim(),
    type: input.type ?? null,
    npk: input.npk ?? null,
    npkRatio: input.npkRatio ?? null,
    nutrient: input.nutrient ?? null,
    dosage: input.dosage ?? null,
    crop: input.crop ?? null,
    benefits: input.benefits ?? null,
    description: input.description ?? null,
    crops: input.crops ?? [],
    soilType: input.soilType ?? [],
    seasons: input.seasons ?? [],
    application: input.application ?? [],
    applicationMethod: input.applicationMethod ?? null,
    precautions: input.precautions ?? null,
    mrp: input.mrp ?? null,
    price: input.price ?? null,
    packSize: input.packSize ?? null,
    image: input.image ?? null,
    source: input.source?.trim() || "admin",
    sourceUrl: input.sourceUrl ?? null,
    isSubsidized: input.isSubsidized ?? true,
    updatedAt: now,
    createdAt: now
  }).returning();
  return row;
}
async function updateAdminFertilizer(id, input) {
  const [row] = await db.update(fertilizerProducts).set({
    ...input.name != null ? { name: input.name.trim() } : {},
    ...input.nameTe !== void 0 ? { nameTe: input.nameTe } : {},
    ...input.brand != null ? { brand: input.brand.trim() } : {},
    ...input.category != null ? { category: input.category.trim() } : {},
    ...input.type !== void 0 ? { type: input.type } : {},
    ...input.npk !== void 0 ? { npk: input.npk } : {},
    ...input.npkRatio !== void 0 ? { npkRatio: input.npkRatio } : {},
    ...input.nutrient !== void 0 ? { nutrient: input.nutrient } : {},
    ...input.dosage !== void 0 ? { dosage: input.dosage } : {},
    ...input.crop !== void 0 ? { crop: input.crop } : {},
    ...input.benefits !== void 0 ? { benefits: input.benefits } : {},
    ...input.description !== void 0 ? { description: input.description } : {},
    ...input.crops !== void 0 ? { crops: input.crops } : {},
    ...input.soilType !== void 0 ? { soilType: input.soilType } : {},
    ...input.seasons !== void 0 ? { seasons: input.seasons } : {},
    ...input.application !== void 0 ? { application: input.application } : {},
    ...input.applicationMethod !== void 0 ? { applicationMethod: input.applicationMethod } : {},
    ...input.precautions !== void 0 ? { precautions: input.precautions } : {},
    ...input.mrp !== void 0 ? { mrp: input.mrp } : {},
    ...input.price !== void 0 ? { price: input.price } : {},
    ...input.packSize !== void 0 ? { packSize: input.packSize } : {},
    ...input.image !== void 0 ? { image: input.image } : {},
    ...input.source != null ? { source: input.source.trim() } : {},
    ...input.sourceUrl !== void 0 ? { sourceUrl: input.sourceUrl } : {},
    ...input.isSubsidized !== void 0 ? { isSubsidized: input.isSubsidized } : {},
    updatedAt: /* @__PURE__ */ new Date()
  }).where((0, import_drizzle_orm25.eq)(fertilizerProducts.id, id)).returning();
  return row ?? null;
}
async function deleteAdminFertilizer(id) {
  const result = await db.delete(fertilizerProducts).where((0, import_drizzle_orm25.eq)(fertilizerProducts.id, id)).returning({ id: fertilizerProducts.id });
  return result.length > 0;
}
function mapSchemeRow(input, id, now) {
  return {
    id,
    category: input.category.trim(),
    region: input.region.trim(),
    status: (input.status ?? "active").trim(),
    titleEn: input.titleEn.trim(),
    titleTe: input.titleTe.trim(),
    amountEn: input.amountEn ?? "",
    amountTe: input.amountTe ?? "",
    benefitEn: input.benefitEn ?? "",
    benefitTe: input.benefitTe ?? "",
    eligibilityEn: input.eligibilityEn ?? "",
    eligibilityTe: input.eligibilityTe ?? "",
    howToApplyEn: input.howToApplyEn ?? "",
    howToApplyTe: input.howToApplyTe ?? "",
    applyUrl: input.applyUrl ?? null,
    icon: input.icon ?? "sprout",
    highlightsEn: input.highlightsEn ?? [],
    highlightsTe: input.highlightsTe ?? [],
    eligibilityRules: input.eligibilityRules ?? {},
    verifiedAt: input.verifiedAt ?? null,
    updatedAt: now
  };
}
async function listAdminSchemes(opts) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 50));
  const offset = (page - 1) * limit;
  const where = opts.status ? (0, import_drizzle_orm25.eq)(govtSchemes.status, opts.status) : void 0;
  const [totalRow] = await db.select({ n: (0, import_drizzle_orm25.count)() }).from(govtSchemes).where(where);
  const rows = await db.select().from(govtSchemes).where(where).orderBy((0, import_drizzle_orm25.desc)(govtSchemes.updatedAt)).limit(limit).offset(offset);
  return { data: rows, page, limit, total: Number(totalRow?.n ?? 0) };
}
async function listPublicActiveSchemes() {
  return db.select().from(govtSchemes).where((0, import_drizzle_orm25.eq)(govtSchemes.status, "active")).orderBy(govtSchemes.titleEn);
}
async function createAdminScheme(input) {
  const id = (input.id?.trim() || slugId2(input.titleEn)).slice(0, 80);
  const now = /* @__PURE__ */ new Date();
  const [row] = await db.insert(govtSchemes).values({ ...mapSchemeRow(input, id, now), createdAt: now }).returning();
  return row;
}
async function updateAdminScheme(id, input) {
  const existing = await db.select().from(govtSchemes).where((0, import_drizzle_orm25.eq)(govtSchemes.id, id)).limit(1);
  if (!existing[0]) return null;
  const merged = {
    category: input.category ?? existing[0].category,
    region: input.region ?? existing[0].region,
    status: input.status ?? existing[0].status,
    titleEn: input.titleEn ?? existing[0].titleEn,
    titleTe: input.titleTe ?? existing[0].titleTe,
    amountEn: input.amountEn ?? existing[0].amountEn,
    amountTe: input.amountTe ?? existing[0].amountTe,
    benefitEn: input.benefitEn ?? existing[0].benefitEn,
    benefitTe: input.benefitTe ?? existing[0].benefitTe,
    eligibilityEn: input.eligibilityEn ?? existing[0].eligibilityEn,
    eligibilityTe: input.eligibilityTe ?? existing[0].eligibilityTe,
    howToApplyEn: input.howToApplyEn ?? existing[0].howToApplyEn,
    howToApplyTe: input.howToApplyTe ?? existing[0].howToApplyTe,
    applyUrl: input.applyUrl !== void 0 ? input.applyUrl : existing[0].applyUrl,
    icon: input.icon ?? existing[0].icon,
    highlightsEn: input.highlightsEn ?? existing[0].highlightsEn,
    highlightsTe: input.highlightsTe ?? existing[0].highlightsTe,
    eligibilityRules: input.eligibilityRules ?? existing[0].eligibilityRules ?? {},
    verifiedAt: input.verifiedAt !== void 0 ? input.verifiedAt : existing[0].verifiedAt
  };
  const [row] = await db.update(govtSchemes).set(mapSchemeRow(merged, id, /* @__PURE__ */ new Date())).where((0, import_drizzle_orm25.eq)(govtSchemes.id, id)).returning();
  return row ?? null;
}
async function deleteAdminScheme(id) {
  const result = await db.delete(govtSchemes).where((0, import_drizzle_orm25.eq)(govtSchemes.id, id)).returning({ id: govtSchemes.id });
  return result.length > 0;
}
async function seedGovtSchemesFromFile() {
  const schemes = govtSchemes_seed_default;
  let upserted = 0;
  const now = /* @__PURE__ */ new Date();
  for (const s of schemes) {
    await db.insert(govtSchemes).values({
      id: s.id,
      category: s.category,
      region: s.region,
      status: s.status,
      titleEn: s.titleEn,
      titleTe: s.titleTe,
      amountEn: s.amountEn,
      amountTe: s.amountTe,
      benefitEn: s.benefitEn,
      benefitTe: s.benefitTe,
      eligibilityEn: s.eligibilityEn,
      eligibilityTe: s.eligibilityTe,
      howToApplyEn: s.howToApplyEn,
      howToApplyTe: s.howToApplyTe,
      applyUrl: s.applyUrl ?? null,
      icon: s.icon,
      highlightsEn: s.highlightsEn ?? [],
      highlightsTe: s.highlightsTe ?? [],
      eligibilityRules: s.eligibilityRules ?? {},
      verifiedAt: s.verifiedAt,
      createdAt: now,
      updatedAt: now
    }).onConflictDoUpdate({
      target: govtSchemes.id,
      set: {
        category: s.category,
        region: s.region,
        status: s.status,
        titleEn: s.titleEn,
        titleTe: s.titleTe,
        amountEn: s.amountEn,
        amountTe: s.amountTe,
        benefitEn: s.benefitEn,
        benefitTe: s.benefitTe,
        eligibilityEn: s.eligibilityEn,
        eligibilityTe: s.eligibilityTe,
        howToApplyEn: s.howToApplyEn,
        howToApplyTe: s.howToApplyTe,
        applyUrl: s.applyUrl ?? null,
        icon: s.icon,
        highlightsEn: s.highlightsEn ?? [],
        highlightsTe: s.highlightsTe ?? [],
        eligibilityRules: s.eligibilityRules ?? {},
        verifiedAt: s.verifiedAt,
        updatedAt: now
      }
    });
    upserted += 1;
  }
  return { upserted };
}
var BROADCAST_TYPES = /* @__PURE__ */ new Set([
  "mandi_alert",
  "weather_alert",
  "spray_reminder",
  "fertilizer_reminder",
  "ai_insight",
  "crop_calendar"
]);
async function listAdminBroadcasts(limit = 30) {
  return db.select().from(adminBroadcasts).orderBy((0, import_drizzle_orm25.desc)(adminBroadcasts.createdAt)).limit(limit);
}
async function getAdminSyncStatus(jobLimit = 40) {
  const sources = await db.select({
    id: dataSources.id,
    name: dataSources.name,
    type: dataSources.type,
    lastSyncAt: dataSources.lastSyncAt,
    isActive: dataSources.isActive
  }).from(dataSources).orderBy(dataSources.id);
  const jobs = await db.select({
    id: syncJobs.id,
    sourceId: syncJobs.sourceId,
    status: syncJobs.status,
    recordsFetched: syncJobs.recordsFetched,
    recordsUpserted: syncJobs.recordsUpserted,
    errorMessage: syncJobs.errorMessage,
    startedAt: syncJobs.startedAt,
    finishedAt: syncJobs.finishedAt
  }).from(syncJobs).orderBy((0, import_drizzle_orm25.desc)(syncJobs.startedAt)).limit(jobLimit);
  const [mandiRow] = await db.select({ at: import_drizzle_orm25.sql`max(${mandiPrices.fetchedAt})` }).from(mandiPrices);
  const [weatherRow] = await db.select({ at: import_drizzle_orm25.sql`max(${weather.fetchedAt})` }).from(weather);
  const [fertRow] = await db.select({ at: import_drizzle_orm25.sql`max(${fertilizerProducts.lastSyncedAt})` }).from(fertilizerProducts);
  return {
    sources,
    recentJobs: jobs,
    freshness: {
      mandiLastSync: mandiRow?.at ?? null,
      weatherLastSync: weatherRow?.at ?? null,
      fertilizerLastSync: fertRow?.at ?? null
    },
    actions: [
      { id: "daily", label: "Daily sync", blurb: "Mandi, fertilizers, weather, crops, nearby places" },
      { id: "full", label: "Full live sync", blurb: "FAO, mandi, soil, weather, knowledge" },
      { id: "fertilizers", label: "Fertilizer catalog", blurb: "Indian DoF / NBS fertilizer products" },
      { id: "ag-catalog", label: "Ag catalog", blurb: "Diseases, ICAR, advisories" },
      { id: "bulk-catalog", label: "Bulk catalog", blurb: "Pesticides, fungicides, diseases" },
      { id: "publications", label: "Publications", blurb: "ICAR / PJTSAU / ANGRAU / FAO / Gov" },
      { id: "places", label: "Nearby places seed", blurb: "Curated mandi & fertilizer shop pins" }
    ]
  };
}
async function runAdminSyncAction(action) {
  switch (action) {
    case "daily":
      return { action, results: await runDailyAutoSync() };
    case "full":
      return { action, results: await runFullSync() };
    case "fertilizers": {
      const r = await syncIndianFertilizerCatalog();
      return { action, results: [{ sourceId: "indian_fertilizers", ...r, errors: [] }] };
    }
    case "ag-catalog": {
      const parts = await syncIndianAgCatalog();
      return { action, results: Object.entries(parts).map(([k, v]) => ({ sourceId: k, ...v, errors: [] })) };
    }
    case "bulk-catalog": {
      const counts = await syncBulkAgCatalog();
      return {
        action,
        results: [
          {
            sourceId: "bulk_catalog",
            fetched: Object.values(counts).reduce((s, n) => s + n, 0),
            upserted: Object.values(counts).reduce((s, n) => s + n, 0),
            errors: [],
            counts
          }
        ]
      };
    }
    case "publications": {
      const parts = await syncAllPublications();
      return {
        action,
        results: [
          {
            sourceId: "publications",
            fetched: parts.curated.fetched + parts.research.fetched,
            upserted: parts.curated.upserted + parts.research.upserted,
            errors: []
          }
        ]
      };
    }
    case "places": {
      const r = await seedCuratedAgPlaces();
      return {
        action,
        results: [
          {
            sourceId: "bhuvedam",
            fetched: r.inserted + r.skipped,
            upserted: r.inserted,
            errors: []
          }
        ]
      };
    }
    default:
      throw new Error("UNKNOWN_SYNC_ACTION");
  }
}
async function createAdminBroadcast(input) {
  const type = BROADCAST_TYPES.has(input.type ?? "") ? input.type : "ai_insight";
  const title = input.title.trim().slice(0, 200);
  const body = input.body.trim();
  if (!title || !body) throw new Error("TITLE_BODY_REQUIRED");
  const active = await db.select({ id: farmers.id }).from(farmers).where((0, import_drizzle_orm25.eq)(farmers.isActive, true));
  let pushSent = 0;
  for (const farmer of active) {
    const result = await createAndPushNotification(farmer.id, {
      type,
      title,
      body,
      data: { broadcast: true, source: "admin" },
      sendPush: true
    });
    pushSent += result.pushSent;
  }
  const [log2] = await db.insert(adminBroadcasts).values({
    title,
    body,
    type,
    recipientCount: active.length,
    pushSent,
    createdBy: input.createdBy ?? null
  }).returning();
  return log2;
}

// src/server/adminRoutes.ts
var admin = new import_hono.Hono();
admin.post("/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  if (!email || !password) return appError(c, "PASSWORD_REQUIRED");
  if (!verifyAdminCredentials(email, password)) return appError(c, "INVALID_CREDENTIALS");
  const token = createAdminToken(email);
  return c.json({ token, email: email.toLowerCase() });
});
admin.use("*", adminSessionAuthMiddleware);
admin.get("/me", (c) => c.json({ email: c.get("adminEmail") }));
admin.get("/analytics", async (c) => {
  const data = await getAdminAnalytics();
  return c.json({ data });
});
admin.get("/users", async (c) => {
  const q = c.req.query("q") ?? void 0;
  const page = Number(c.req.query("page") ?? 1);
  const limit = Number(c.req.query("limit") ?? 25);
  const result = await listAdminUsers({ q, page, limit });
  return c.json(result);
});
admin.get("/users/:id/farm", async (c) => {
  const data = await getAdminUserFarm(c.req.param("id"));
  if (!data) return appError(c, "FARMER_NOT_FOUND");
  return c.json({ data });
});
admin.get("/crop-plantings", async (c) => {
  const q = c.req.query("q") ?? void 0;
  const page = Number(c.req.query("page") ?? 1);
  const limit = Number(c.req.query("limit") ?? 40);
  const result = await listAdminCropPlantings({ q, page, limit });
  return c.json(result);
});
admin.patch("/users/:id", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  if (typeof body.isActive !== "boolean") {
    return c.json({ code: "INVALID_BODY" }, 400);
  }
  const row = await setFarmerActive(c.req.param("id"), body.isActive);
  if (!row) return appError(c, "FARMER_NOT_FOUND");
  return c.json({ data: row });
});
admin.get("/fertilizers", async (c) => {
  const search = c.req.query("search") ?? void 0;
  const page = Number(c.req.query("page") ?? 1);
  const limit = Number(c.req.query("limit") ?? 25);
  const result = await listAdminFertilizers({ search, page, limit });
  return c.json(result);
});
admin.post("/fertilizers", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const brand = typeof body.brand === "string" ? body.brand.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  if (!name || !brand || !category) return appError(c, "NAME_REQUIRED");
  const row = await createAdminFertilizer({
    id: typeof body.id === "string" ? body.id : void 0,
    name,
    brand,
    category,
    nameTe: typeof body.nameTe === "string" ? body.nameTe : null,
    type: typeof body.type === "string" ? body.type : null,
    npk: typeof body.npk === "string" ? body.npk : null,
    dosage: typeof body.dosage === "string" ? body.dosage : null,
    crop: typeof body.crop === "string" ? body.crop : null,
    benefits: typeof body.benefits === "string" ? body.benefits : null,
    description: typeof body.description === "string" ? body.description : null,
    mrp: typeof body.mrp === "string" ? body.mrp : null,
    price: typeof body.price === "string" ? body.price : null,
    packSize: typeof body.packSize === "string" ? body.packSize : null,
    source: typeof body.source === "string" ? body.source : "admin",
    isSubsidized: typeof body.isSubsidized === "boolean" ? body.isSubsidized : true
  });
  return c.json({ data: row }, 201);
});
admin.put("/fertilizers/:id", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const row = await updateAdminFertilizer(c.req.param("id"), {
    name: typeof body.name === "string" ? body.name : void 0,
    brand: typeof body.brand === "string" ? body.brand : void 0,
    category: typeof body.category === "string" ? body.category : void 0,
    nameTe: typeof body.nameTe === "string" ? body.nameTe : body.nameTe === null ? null : void 0,
    type: typeof body.type === "string" ? body.type : body.type === null ? null : void 0,
    npk: typeof body.npk === "string" ? body.npk : body.npk === null ? null : void 0,
    dosage: typeof body.dosage === "string" ? body.dosage : body.dosage === null ? null : void 0,
    crop: typeof body.crop === "string" ? body.crop : body.crop === null ? null : void 0,
    benefits: typeof body.benefits === "string" ? body.benefits : body.benefits === null ? null : void 0,
    description: typeof body.description === "string" ? body.description : body.description === null ? null : void 0,
    mrp: typeof body.mrp === "string" ? body.mrp : body.mrp === null ? null : void 0,
    price: typeof body.price === "string" ? body.price : body.price === null ? null : void 0,
    packSize: typeof body.packSize === "string" ? body.packSize : body.packSize === null ? null : void 0,
    source: typeof body.source === "string" ? body.source : void 0,
    isSubsidized: typeof body.isSubsidized === "boolean" ? body.isSubsidized : void 0
  });
  if (!row) return appError(c, "FERTILIZER_NOT_FOUND");
  return c.json({ data: row });
});
admin.delete("/fertilizers/:id", async (c) => {
  const ok = await deleteAdminFertilizer(c.req.param("id"));
  if (!ok) return appError(c, "FERTILIZER_NOT_FOUND");
  return c.json({ ok: true });
});
admin.get("/schemes", async (c) => {
  const status = c.req.query("status") ?? void 0;
  const page = Number(c.req.query("page") ?? 1);
  const limit = Number(c.req.query("limit") ?? 50);
  const result = await listAdminSchemes({ status, page, limit });
  return c.json(result);
});
admin.post("/schemes/seed", async (c) => {
  try {
    const result = await seedGovtSchemesFromFile();
    return c.json({ ok: true, ...result });
  } catch {
    return appError(c, "SERVER_ERROR");
  }
});
admin.post("/schemes", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const titleEn = typeof body.titleEn === "string" ? body.titleEn.trim() : "";
  const titleTe = typeof body.titleTe === "string" ? body.titleTe.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const region = typeof body.region === "string" ? body.region.trim() : "";
  if (!titleEn || !titleTe || !category || !region) return appError(c, "NAME_REQUIRED");
  const row = await createAdminScheme({
    id: typeof body.id === "string" ? body.id : void 0,
    titleEn,
    titleTe,
    category,
    region,
    status: typeof body.status === "string" ? body.status : "active",
    amountEn: typeof body.amountEn === "string" ? body.amountEn : "",
    amountTe: typeof body.amountTe === "string" ? body.amountTe : "",
    benefitEn: typeof body.benefitEn === "string" ? body.benefitEn : "",
    benefitTe: typeof body.benefitTe === "string" ? body.benefitTe : "",
    eligibilityEn: typeof body.eligibilityEn === "string" ? body.eligibilityEn : "",
    eligibilityTe: typeof body.eligibilityTe === "string" ? body.eligibilityTe : "",
    howToApplyEn: typeof body.howToApplyEn === "string" ? body.howToApplyEn : "",
    howToApplyTe: typeof body.howToApplyTe === "string" ? body.howToApplyTe : "",
    applyUrl: typeof body.applyUrl === "string" ? body.applyUrl : null,
    icon: typeof body.icon === "string" ? body.icon : "sprout",
    highlightsEn: Array.isArray(body.highlightsEn) ? body.highlightsEn : [],
    highlightsTe: Array.isArray(body.highlightsTe) ? body.highlightsTe : [],
    verifiedAt: typeof body.verifiedAt === "string" ? body.verifiedAt : null
  });
  return c.json({ data: row }, 201);
});
admin.put("/schemes/:id", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const row = await updateAdminScheme(c.req.param("id"), {
    titleEn: typeof body.titleEn === "string" ? body.titleEn : void 0,
    titleTe: typeof body.titleTe === "string" ? body.titleTe : void 0,
    category: typeof body.category === "string" ? body.category : void 0,
    region: typeof body.region === "string" ? body.region : void 0,
    status: typeof body.status === "string" ? body.status : void 0,
    amountEn: typeof body.amountEn === "string" ? body.amountEn : void 0,
    amountTe: typeof body.amountTe === "string" ? body.amountTe : void 0,
    benefitEn: typeof body.benefitEn === "string" ? body.benefitEn : void 0,
    benefitTe: typeof body.benefitTe === "string" ? body.benefitTe : void 0,
    eligibilityEn: typeof body.eligibilityEn === "string" ? body.eligibilityEn : void 0,
    eligibilityTe: typeof body.eligibilityTe === "string" ? body.eligibilityTe : void 0,
    howToApplyEn: typeof body.howToApplyEn === "string" ? body.howToApplyEn : void 0,
    howToApplyTe: typeof body.howToApplyTe === "string" ? body.howToApplyTe : void 0,
    applyUrl: typeof body.applyUrl === "string" ? body.applyUrl : body.applyUrl === null ? null : void 0,
    icon: typeof body.icon === "string" ? body.icon : void 0,
    highlightsEn: Array.isArray(body.highlightsEn) ? body.highlightsEn : void 0,
    highlightsTe: Array.isArray(body.highlightsTe) ? body.highlightsTe : void 0,
    verifiedAt: typeof body.verifiedAt === "string" ? body.verifiedAt : body.verifiedAt === null ? null : void 0
  });
  if (!row) return appError(c, "NOT_FOUND");
  return c.json({ data: row });
});
admin.delete("/schemes/:id", async (c) => {
  const ok = await deleteAdminScheme(c.req.param("id"));
  if (!ok) return appError(c, "NOT_FOUND");
  return c.json({ ok: true });
});
admin.get("/updates", async (c) => {
  const data = await listAdminBroadcasts(40);
  return c.json({ data });
});
admin.post("/updates", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  if (!body.title?.trim() || !body.body?.trim()) return appError(c, "NAME_REQUIRED");
  try {
    const row = await createAdminBroadcast({
      title: body.title,
      body: body.body,
      type: body.type,
      createdBy: c.get("adminEmail")
    });
    return c.json({ data: row }, 201);
  } catch {
    return appError(c, "SERVER_ERROR");
  }
});
admin.get("/sync", async (c) => {
  const limit = Number(c.req.query("limit") ?? 40);
  const data = await getAdminSyncStatus(limit);
  return c.json({ data });
});
admin.post("/sync/:action", async (c) => {
  const action = c.req.param("action");
  const allowed = [
    "daily",
    "full",
    "fertilizers",
    "ag-catalog",
    "bulk-catalog",
    "publications",
    "places"
  ];
  if (!allowed.includes(action)) return appError(c, "NOT_FOUND");
  try {
    const result = await runAdminSyncAction(action);
    return c.json({ ok: true, ...result });
  } catch {
    return appError(c, "SERVER_ERROR");
  }
});

// src/server/index.ts
(0, import_dotenv3.config)({ path: ".env" });
var app = new import_hono2.Hono();
var publicRoot = import_node_path.default.join(process.cwd(), "public");
app.use("*", (0, import_cors.cors)());
app.use("*", apiLoggerMiddleware);
app.route("/api/admin", admin);
app.get("/api/schemes", async (c) => {
  const data = await listPublicActiveSchemes();
  return c.json({ data, count: data.length });
});
app.use(
  "/static/*",
  (0, import_serve_static.serveStatic)({
    root: publicRoot,
    rewriteRequestPath: (p) => p.replace(/^\/static\/?/, "/")
  })
);
app.get(
  "/",
  (c) => c.json({
    service: "bhuvedam-api",
    health: "/health",
    docs: "Use /api/auth/* and other /api routes from the mobile app"
  })
);
app.get("/health", (c) => {
  const database = Boolean(process.env.DATABASE_URL?.trim());
  const jwt = Boolean(process.env.JWT_SECRET?.trim());
  const aiProvider = getAiProvider();
  const ai = isAiConfigured();
  return c.json({
    ok: database && jwt,
    service: "bhuvedam-api",
    config: { database, jwt, ai, aiProvider }
  });
});
app.get("/api/auth/ping", async (c) => {
  const started = Date.now();
  try {
    const rows = await Promise.race([
      db.select({ id: farmers.id }).from(farmers).limit(1),
      new Promise(
        (_, reject) => setTimeout(() => reject(new Error("FARMERS_TIMEOUT")), 5e3)
      )
    ]);
    return c.json({
      ok: true,
      ms: Date.now() - started,
      sample: rows.length
    });
  } catch (err) {
    return c.json(
      {
        ok: false,
        ms: Date.now() - started,
        error: err instanceof Error ? err.message : "unknown"
      },
      503
    );
  }
});
app.post("/api/auth/ping", async (c) => {
  const started = Date.now();
  try {
    const body = await c.req.json();
    const phone = formatPhone((body.phone ?? "6111111111").trim());
    const rows = await Promise.race([
      db.select({ id: farmers.id }).from(farmers).where((0, import_drizzle_orm26.eq)(farmers.phone, phone)).limit(1),
      new Promise(
        (_, reject) => setTimeout(() => reject(new Error("FARMERS_TIMEOUT")), 5e3)
      )
    ]);
    return c.json({
      ok: true,
      ms: Date.now() - started,
      found: rows.length > 0
    });
  } catch (err) {
    return c.json(
      {
        ok: false,
        ms: Date.now() - started,
        error: err instanceof Error ? err.message : "unknown"
      },
      503
    );
  }
});
app.post("/api/auth/login", async (c) => {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_LEGACY_LOGIN !== "true") {
    return appError(c, "LEGACY_LOGIN_DISABLED");
  }
  const body = await c.req.json();
  const phoneRaw = body.phone?.trim();
  const name = body.name?.trim();
  if (!phoneRaw || !name) {
    return appError(c, "INVALID_REQUEST");
  }
  const phone = formatPhone(phoneRaw);
  const farmer = await upsertFarmerByPhone(phone, name, body.language ?? "te");
  const token = createFarmerToken(farmer.id, phone);
  return c.json({
    success: true,
    data: {
      token,
      user: {
        id: farmer.id,
        phone: phoneForDisplay(phone),
        name: farmer.name,
        language: farmer.language,
        location: farmer.locationLabel ?? void 0,
        farmSize: farmer.farmSize ?? void 0,
        createdAt: farmer.createdAt.toISOString()
      }
    }
  });
});
app.post("/api/auth/logout", (c) => c.json({ success: true }));
app.post("/api/auth/register", async (c) => {
  const body = await c.req.json();
  const name = body.name?.trim();
  const password = body.password ?? "";
  const phoneRaw = body.phone?.trim();
  log.info("auth/register", "attempt", {
    phone: maskPhone(phoneRaw),
    nameLength: name?.length ?? 0,
    language: body.language
  });
  if (!name) {
    log.warn("auth/register", "validation failed", { code: "NAME_REQUIRED" });
    return appError(c, "NAME_REQUIRED");
  }
  if (!phoneRaw) {
    log.warn("auth/register", "validation failed", { code: "MOBILE_REQUIRED" });
    return appError(c, "MOBILE_REQUIRED");
  }
  if (!password) {
    log.warn("auth/register", "validation failed", { code: "PASSWORD_REQUIRED" });
    return appError(c, "PASSWORD_REQUIRED");
  }
  try {
    const farmer = await registerFarmerWithPassword({
      name,
      password,
      phone: phoneRaw,
      language: body.language
    });
    const loginKey = farmerLoginKey(farmer);
    const token = createFarmerToken(farmer.id, loginKey);
    log.info("auth/register", "success", { farmerId: farmer.id, phone: maskPhone(phoneRaw) });
    return c.json({
      success: true,
      data: {
        token,
        user: formatFarmerUser(farmer)
      }
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : "REGISTER_FAILED";
    const map = {
      INVALID_NAME: "INVALID_NAME",
      WEAK_PASSWORD: "WEAK_PASSWORD",
      INVALID_PHONE: "INVALID_PHONE",
      PHONE_REQUIRED: "MOBILE_REQUIRED",
      PHONE_TAKEN: "PHONE_TAKEN",
      EMAIL_TAKEN: "PHONE_TAKEN"
    };
    if (map[code]) {
      log.warn("auth/register", "rejected", { code, phone: maskPhone(phoneRaw) });
      return appError(c, map[code]);
    }
    log.error("auth/register", "unexpected failure", { phone: maskPhone(phoneRaw), err });
    return appError(c, "REGISTER_FAILED");
  }
});
async function handlePasswordLogin(c) {
  const body = await c.req.json();
  const identifier = (body.identifier ?? body.phone ?? "").trim();
  const password = body.password ?? "";
  if (!identifier) return appError(c, "MOBILE_REQUIRED");
  if (!password) return appError(c, "PASSWORD_REQUIRED");
  try {
    const farmer = await Promise.race([
      loginFarmerWithPassword(identifier, password),
      new Promise(
        (_, reject) => setTimeout(() => reject(new Error("LOGIN_TIMEOUT")), 1e4)
      )
    ]);
    const loginKey = farmerLoginKey(farmer);
    const token = createFarmerToken(farmer.id, loginKey);
    return c.json({
      success: true,
      data: {
        token,
        user: formatFarmerUser(farmer)
      }
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : "LOGIN_FAILED";
    log.warn("auth/signin", "rejected", { code, identifier: maskPhone(identifier) });
    if (code === "INVALID_CREDENTIALS") return appError(c, "INVALID_CREDENTIALS");
    if (code === "ACCOUNT_DISABLED") return appError(c, "ACCOUNT_DISABLED");
    if (code === "LOGIN_TIMEOUT") return appError(c, "SERVER_ERROR");
    log.error("auth/signin", "unexpected failure", { identifier: maskPhone(identifier), err });
    return appError(c, "LOGIN_FAILED");
  }
}
app.post("/api/auth/signin", handlePasswordLogin);
app.post("/api/auth/login-password", handlePasswordLogin);
var handlePasswordRecover = async (c) => {
  const body = await c.req.json();
  const phoneRaw = body.phone?.trim();
  if (!phoneRaw) return appError(c, "MOBILE_REQUIRED");
  const farmer = await getFarmerByPhone(formatPhone(phoneRaw));
  if (!farmer) return appError(c, "MOBILE_NOT_REGISTERED");
  try {
    const result = await sendPhoneOtp(phoneRaw);
    return c.json({ success: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "SMS_FAILED";
    log.warn("auth/recover", "otp send failed", { phone: maskPhone(phoneRaw), msg });
    if (msg.startsWith("WAIT_")) {
      const seconds = parseOtpWaitSeconds(msg) ?? 60;
      return appError(c, "OTP_WAIT", { retryAfterSec: seconds });
    }
    return appError(c, "OTP_SEND_FAILED");
  }
};
app.post("/api/auth/recover", handlePasswordRecover);
app.post("/api/auth/forgot-password", handlePasswordRecover);
var handlePasswordReset = async (c) => {
  const body = await c.req.json();
  const phoneRaw = body.phone?.trim();
  const otp = body.otp?.trim() ?? "";
  const password = body.password ?? "";
  if (!phoneRaw) return appError(c, "MOBILE_REQUIRED");
  if (!otp) return appError(c, "OTP_INVALID");
  if (!password) return appError(c, "PASSWORD_REQUIRED");
  try {
    const farmer = await resetPasswordWithPhoneOtp(phoneRaw, otp, password);
    const loginKey = farmerLoginKey(farmer);
    const token = createFarmerToken(farmer.id, loginKey);
    return c.json({
      success: true,
      data: {
        token,
        user: formatFarmerUser(farmer)
      }
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : "RESET_FAILED";
    const otpMap = {
      OTP_expired: "OTP_EXPIRED",
      OTP_invalid: "OTP_INVALID",
      OTP_max_attempts: "OTP_MAX_ATTEMPTS"
    };
    if (code.startsWith("OTP_") && otpMap[code]) return appError(c, otpMap[code]);
    if (code === "NOT_FOUND") return appError(c, "MOBILE_NOT_REGISTERED");
    if (code === "WEAK_PASSWORD") return appError(c, "WEAK_PASSWORD");
    console.error("[auth/reset] failed:", err);
    return appError(c, "RESET_FAILED");
  }
};
app.post("/api/auth/reset", handlePasswordReset);
app.post("/api/auth/reset-password", handlePasswordReset);
var handleCredentialsUpdate = async (c) => {
  const body = await c.req.json();
  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword ?? body.password ?? "";
  if (!currentPassword) return appError(c, "PASSWORD_REQUIRED");
  if (!newPassword) return appError(c, "PASSWORD_REQUIRED");
  try {
    const farmerId = c.get("farmerId");
    await changeFarmerPassword(farmerId, currentPassword, newPassword);
    return c.json({ success: true });
  } catch (err) {
    const code = err instanceof Error ? err.message : "CHANGE_PASSWORD_FAILED";
    if (code === "WRONG_PASSWORD") return appError(c, "WRONG_PASSWORD");
    if (code === "NO_PASSWORD") return appError(c, "NO_PASSWORD");
    if (code === "SAME_PASSWORD") return appError(c, "SAME_PASSWORD");
    if (code === "WEAK_PASSWORD") return appError(c, "WEAK_PASSWORD");
    console.error("[auth/update-credentials] failed:", err);
    return appError(c, "CHANGE_PASSWORD_FAILED");
  }
};
app.post("/api/auth/update-credentials", farmerAuthMiddleware, handleCredentialsUpdate);
app.post("/api/auth/change-password", farmerAuthMiddleware, handleCredentialsUpdate);
app.post("/api/auth/send-otp", async (c) => {
  const body = await c.req.json();
  const phoneRaw = body.phone?.trim();
  if (!phoneRaw) return appError(c, "MOBILE_REQUIRED");
  const farmer = await getFarmerByPhone(formatPhone(phoneRaw));
  if (!farmer) return appError(c, "MOBILE_NOT_REGISTERED");
  try {
    const result = await sendPhoneOtp(phoneRaw);
    return c.json({ success: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "SMS_FAILED";
    console.error("[OTP] send-otp failed:", err);
    if (msg.startsWith("WAIT_")) {
      const seconds = Number(msg.replace("WAIT_", "")) || 60;
      return appError(c, "OTP_WAIT", { retryAfterSec: seconds });
    }
    return appError(c, "OTP_SEND_FAILED");
  }
});
app.post("/api/auth/verify-otp", async (c) => {
  const body = await c.req.json();
  const phoneRaw = body.phone?.trim();
  const otp = body.otp?.trim() ?? "";
  const name = body.name?.trim();
  if (!phoneRaw) return appError(c, "MOBILE_REQUIRED");
  if (!otp && !name) return appError(c, "OTP_INVALID");
  const phone = formatPhone(phoneRaw);
  let otpOk = false;
  if (otp) {
    const check = await verifyPhoneOtp(phoneRaw, otp);
    if (!check.valid) {
      if (check.reason === "expired") return appError(c, "OTP_EXPIRED");
      if (check.reason === "max_attempts") return appError(c, "OTP_MAX_ATTEMPTS");
      return appError(c, "OTP_INVALID");
    }
    otpOk = true;
  } else if (name && await hasVerifiedOtpSession(phoneRaw)) {
    otpOk = true;
  } else {
    return appError(c, "OTP_INVALID");
  }
  if (!otpOk) return appError(c, "OTP_INVALID");
  const existing = await getFarmerByPhone(phone);
  if (existing?.name?.trim()) {
    const token2 = createFarmerToken(existing.id, farmerLoginKey(existing));
    await consumeOtpSession(phoneRaw);
    return c.json({
      success: true,
      data: {
        token: token2,
        user: formatFarmerUser(existing)
      }
    });
  }
  if (!name) {
    return c.json({
      success: true,
      data: {
        needsName: true,
        phone: phoneForDisplay(phone)
      }
    });
  }
  const farmer = await upsertFarmerByPhone(phone, name, body.language ?? "te");
  const token = createFarmerToken(farmer.id, farmerLoginKey(farmer));
  await consumeOtpSession(phoneRaw);
  return c.json({
    success: true,
    data: {
      token,
      user: formatFarmerUser(farmer)
    }
  });
});
app.get("/api/auth/profile", farmerAuthMiddleware, async (c) => {
  const farmerId = c.get("farmerId");
  const profile = await getFarmerProfile(farmerId);
  if (!profile) return appError(c, "FARMER_NOT_FOUND");
  return c.json({
    success: true,
    data: formatFarmerUser(profile)
  });
});
app.get("/api/farmers/me", farmerAuthMiddleware, async (c) => {
  const farmerId = c.get("farmerId");
  const profile = await getFarmerProfile(farmerId);
  if (!profile) return appError(c, "FARMER_NOT_FOUND");
  return c.json({
    success: true,
    data: formatFarmerProfileForApp(profile),
    source: "neon"
  });
});
app.put("/api/farmers/me/sync", farmerAuthMiddleware, async (c) => {
  const farmerId = c.get("farmerId");
  const body = await c.req.json();
  try {
    const profile = await syncFarmerProfile(farmerId, body);
    return c.json({
      success: true,
      data: profile,
      source: "neon"
    });
  } catch (err) {
    console.error("[farmers/sync] failed:", err);
    log.error("farmer/sync", "profile sync failed", { err, farmerId: c.get("farmerId") });
    return appError(c, "SYNC_FAILED");
  }
});
app.delete("/api/farmers/me", farmerAuthMiddleware, async (c) => {
  const farmerId = c.get("farmerId");
  try {
    await db.delete(payments).where((0, import_drizzle_orm26.eq)(payments.farmerId, farmerId));
    await db.delete(orders).where((0, import_drizzle_orm26.eq)(orders.farmerId, farmerId));
    const deleted = await db.delete(farmers).where((0, import_drizzle_orm26.eq)(farmers.id, farmerId)).returning({ id: farmers.id });
    if (!deleted.length) return appError(c, "FARMER_NOT_FOUND");
    log.info("farmer/delete", "account deleted", { farmerId });
    return c.json({ success: true, deleted: true });
  } catch (err) {
    log.error("farmer/delete", "account delete failed", { err, farmerId });
    return appError(c, "SERVER_ERROR");
  }
});
app.get("/api/crops", async (c) => {
  const search = c.req.query("search")?.trim();
  const category = c.req.query("category")?.trim();
  const limit = Math.min(Number(c.req.query("limit") ?? 500), 2e3);
  const lang = parseFarmerLanguage(c.req.query("lang"));
  const localize = parseLocalizeMode(c.req.query("localize"), limit);
  let rows = await searchCropsDb(search, limit);
  if (category) {
    rows = rows.filter((r) => r.category === category);
  }
  const total = await countCropsDb();
  const data = localize === "none" ? rows : await localizeCropsForFarmer(rows, lang, localize);
  return c.json({
    data,
    count: data.length,
    totalInDb: total,
    lang,
    source: "neon"
  });
});
app.get("/api/crops/:cropId", async (c) => {
  const cropId = c.req.param("cropId");
  const lang = parseFarmerLanguage(c.req.query("lang"));
  const row = await getCropByIdDb(cropId);
  if (!row) return appError(c, "CROP_NOT_FOUND");
  const data = await localizeCropRow(row, lang, "full");
  return c.json({ data, lang, source: "neon" });
});
app.get("/api/crops/:cropId/varieties", async (c) => {
  const cropId = c.req.param("cropId");
  const rows = await db.select().from(cropVarieties).where((0, import_drizzle_orm26.eq)(cropVarieties.cropId, cropId)).limit(500);
  return c.json({ data: rows, count: rows.length });
});
app.get("/api/mandi/prices", async (c) => {
  const cropId = c.req.query("cropId");
  const state = c.req.query("state");
  const limit = Number(c.req.query("limit") ?? 100);
  const rows = cropId ? await db.select().from(mandiPrices).where((0, import_drizzle_orm26.eq)(mandiPrices.cropId, cropId)).orderBy((0, import_drizzle_orm26.desc)(mandiPrices.fetchedAt)).limit(limit) : await db.select().from(mandiPrices).orderBy((0, import_drizzle_orm26.desc)(mandiPrices.fetchedAt)).limit(limit);
  const filtered = state ? rows.filter((r) => r.state === state) : rows;
  const data = filtered.map((row) => ({
    ...row,
    cropId: normalizeMandiCropId(row.cropId, row.commodity)
  }));
  return c.json({ data, source: "agmarknet" });
});
app.get("/api/places/nearby", async (c) => {
  const lat = Number(c.req.query("lat"));
  const lng = Number(c.req.query("lng"));
  const type = c.req.query("type") ?? "all";
  const radiusKm = Number(c.req.query("radiusKm") ?? 120);
  const limit = Number(c.req.query("limit") ?? 20);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return c.json({ error: "lat and lng required" }, 400);
  }
  try {
    let data = await findNearbyAgPlacesFromDb(lat, lng, type, radiusKm, limit);
    if (data.length === 0) {
      await seedCuratedAgPlaces();
      data = await findNearbyAgPlacesFromDb(lat, lng, type, radiusKm, limit);
    }
    return c.json({ data, source: "database", count: data.length });
  } catch (err) {
    console.error("[places/nearby]", err);
    return c.json({ data: [], source: "database", count: 0 });
  }
});
app.post("/api/places/seed", adminAuthMiddleware, async (c) => {
  const result = await seedCuratedAgPlaces();
  return c.json({ success: true, ...result });
});
app.get("/api/mandi/analytics", async (c) => {
  const cropId = c.req.query("cropId") ?? void 0;
  const state = c.req.query("state") ?? "Andhra Pradesh";
  const historyDays = Number(c.req.query("historyDays") ?? 400);
  const analytics = await fetchMandiAnalyticsFromDb({ cropId, state, historyDays });
  return c.json({ data: analytics, source: "agmarknet" });
});
app.get("/api/fertilizers", async (c) => {
  const cropId = c.req.query("cropId");
  const type = c.req.query("type") ?? "fertilizer";
  const rows = cropId ? await db.select().from(agrochemicals).where((0, import_drizzle_orm26.eq)(agrochemicals.cropId, cropId)).limit(100) : await db.select().from(agrochemicals).where((0, import_drizzle_orm26.eq)(agrochemicals.type, type)).limit(200);
  return c.json({ data: rows });
});
app.get("/api/fertilizer-products", async (c) => {
  const data = await searchFertilizerProducts({
    search: c.req.query("search"),
    brand: c.req.query("brand"),
    category: c.req.query("category"),
    crop: c.req.query("crop") ?? c.req.query("cropId"),
    source: c.req.query("source"),
    limit: Number(c.req.query("limit") ?? 100)
  });
  const [syncRow] = await db.select({ at: import_drizzle_orm26.sql`max(${fertilizerProducts.lastSyncedAt})` }).from(fertilizerProducts);
  return c.json({
    data,
    count: data.length,
    source: "neon",
    lastSyncedAt: syncRow?.at ?? null,
    priceNote: "DoF statutory urea MRP + NBS notified typical bag MRPs. Dealer may add local charges \u2014 verify on pack / POS."
  });
});
app.get("/api/fertilizer-products/:id", async (c) => {
  const row = await getFertilizerProductById(c.req.param("id"));
  if (!row) return appError(c, "FERTILIZER_NOT_FOUND");
  return c.json({ data: row, source: "neon" });
});
app.post("/api/fertilizer-products/sync", adminAuthMiddleware, async (c) => {
  const result = await syncIndianFertilizerCatalog();
  return c.json({ ok: true, ...result, source: "indian_fertilizers" });
});
app.get("/api/plant-diseases", async (c) => {
  const crop = c.req.query("crop") ?? c.req.query("cropId");
  const category = c.req.query("category");
  const search = c.req.query("search")?.trim();
  const limit = Math.min(Number(c.req.query("limit") ?? 100), 500);
  const conditions = [];
  if (crop) conditions.push((0, import_drizzle_orm26.eq)(plantDiseases.cropId, crop));
  if (category) conditions.push((0, import_drizzle_orm26.eq)(plantDiseases.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push((0, import_drizzle_orm26.or)((0, import_drizzle_orm26.ilike)(plantDiseases.name, pattern), (0, import_drizzle_orm26.ilike)(plantDiseases.symptoms, pattern)));
  }
  const rows = conditions.length > 0 ? await db.select().from(plantDiseases).where((0, import_drizzle_orm26.and)(...conditions)).limit(limit) : await db.select().from(plantDiseases).limit(limit);
  return c.json({ data: rows, count: rows.length, source: "plantvillage_icar" });
});
app.get("/api/plant-diseases/:id", async (c) => {
  const [row] = await db.select().from(plantDiseases).where((0, import_drizzle_orm26.eq)(plantDiseases.id, c.req.param("id"))).limit(1);
  if (!row) return appError(c, "DISEASE_NOT_FOUND");
  return c.json({ data: row, source: "plantvillage_icar" });
});
app.get("/api/icar/guidelines", async (c) => {
  const crop = c.req.query("crop") ?? c.req.query("cropId");
  const category = c.req.query("category");
  const limit = Math.min(Number(c.req.query("limit") ?? 50), 200);
  const conditions = [];
  if (crop) conditions.push((0, import_drizzle_orm26.eq)(icarGuidelines.cropId, crop));
  if (category) conditions.push((0, import_drizzle_orm26.eq)(icarGuidelines.category, category));
  const rows = conditions.length > 0 ? await db.select().from(icarGuidelines).where((0, import_drizzle_orm26.and)(...conditions)).limit(limit) : await db.select().from(icarGuidelines).limit(limit);
  return c.json({ data: rows, count: rows.length, source: "icar" });
});
app.get("/api/ag-advisories", async (c) => {
  const type = c.req.query("type");
  const season = c.req.query("season");
  const limit = Math.min(Number(c.req.query("limit") ?? 50), 200);
  const conditions = [];
  if (type) conditions.push((0, import_drizzle_orm26.eq)(agAdvisories.type, type));
  if (season) conditions.push((0, import_drizzle_orm26.eq)(agAdvisories.season, season));
  const rows = conditions.length > 0 ? await db.select().from(agAdvisories).where((0, import_drizzle_orm26.and)(...conditions)).limit(limit) : await db.select().from(agAdvisories).limit(limit);
  return c.json({ data: rows, count: rows.length, source: "doa" });
});
app.get("/api/soil-health/recommendations", async (c) => {
  const soilType = c.req.query("soilType") ?? c.req.query("soil_type");
  const deficiency = c.req.query("deficiency");
  const limit = Math.min(Number(c.req.query("limit") ?? 50), 200);
  const conditions = [];
  if (soilType) conditions.push((0, import_drizzle_orm26.eq)(soilHealthRecommendations.soilType, soilType));
  if (deficiency) conditions.push((0, import_drizzle_orm26.ilike)(soilHealthRecommendations.deficiency, `%${deficiency}%`));
  const rows = conditions.length > 0 ? await db.select().from(soilHealthRecommendations).where((0, import_drizzle_orm26.and)(...conditions)).limit(limit) : await db.select().from(soilHealthRecommendations).limit(limit);
  return c.json({ data: rows, count: rows.length, source: "soil_health_card" });
});
app.post("/api/ag-catalog/sync", adminAuthMiddleware, async (c) => {
  const results = await syncIndianAgCatalog();
  return c.json({ ok: true, results, source: "indian_ag_catalog" });
});
app.post("/api/knowledge/publications/sync", adminAuthMiddleware, async (c) => {
  const results = await syncAllPublications();
  return c.json({
    ok: true,
    results,
    source: "publications",
    priority: ["icar", "pjtsau", "angrau", "university_research", "fao", "gov_advisory"]
  });
});
app.post("/api/bulk-catalog/sync", adminAuthMiddleware, async (c) => {
  const counts = await syncBulkAgCatalog();
  return c.json({ ok: true, counts, source: "bulk_catalog" });
});
app.get("/api/bulk-catalog/stats", async (c) => {
  const [[{ pesticides }], [{ fungicides }], [{ fertilizers: fertilizers2 }], [{ diseases: diseases2 }], [{ cropCount }]] = await Promise.all([
    db.select({ pesticides: import_drizzle_orm26.sql`count(*)::int` }).from(agProducts).where((0, import_drizzle_orm26.eq)(agProducts.type, "pesticide")),
    db.select({ fungicides: import_drizzle_orm26.sql`count(*)::int` }).from(agProducts).where((0, import_drizzle_orm26.eq)(agProducts.type, "fungicide")),
    db.select({ fertilizers: import_drizzle_orm26.sql`count(*)::int` }).from(agProducts).where((0, import_drizzle_orm26.eq)(agProducts.type, "fertilizer")),
    db.select({ diseases: import_drizzle_orm26.sql`count(*)::int` }).from(cropDiseaseCatalog),
    db.select({ cropCount: import_drizzle_orm26.sql`count(*)::int` }).from(crops)
  ]);
  return c.json({
    data: { pesticides, fungicides, fertilizers: fertilizers2, diseases: diseases2, crops: cropCount },
    targets: { pesticides: 2e3, fungicides: 1e3, fertilizers: 1e3, diseases: 2e3, crops: 250 }
  });
});
app.get("/api/ag-products/canonical", async (c) => {
  const type = c.req.query("type");
  if (type !== "pesticide" && type !== "fungicide") {
    return appError(c, "INVALID_PRODUCT_TYPE");
  }
  const data = searchCanonicalAgProducts({
    type,
    search: c.req.query("search"),
    crop: c.req.query("crop") ?? c.req.query("cropId"),
    target: c.req.query("target"),
    limit: Number(c.req.query("limit") ?? 100)
  });
  return c.json({
    data,
    count: data.length,
    source: "cibrc_reference",
    stats: canonicalAgStats(),
    verifiedAt: canonicalAgStats().verifiedAt,
    priceNote: "Typical dealer pack price bands \u2014 verify exact MRP on the pack. Banned actives are hidden."
  });
});
app.get("/api/ag-products/canonical/:id", async (c) => {
  const row = getCanonicalAgProductById(c.req.param("id"));
  if (!row) return appError(c, "PRODUCT_NOT_FOUND");
  return c.json({ data: row, source: "cibrc_reference" });
});
app.get("/api/ag-products", async (c) => {
  const type = c.req.query("type");
  const crop = c.req.query("crop") ?? c.req.query("cropId");
  const soilType = c.req.query("soilType") ?? c.req.query("soil_type");
  const growthStage = c.req.query("growthStage") ?? c.req.query("stage");
  const search = c.req.query("search")?.trim();
  const limit = Math.min(Number(c.req.query("limit") ?? 100), 500);
  const conditions = [];
  if (type) conditions.push((0, import_drizzle_orm26.eq)(agProducts.type, type));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push((0, import_drizzle_orm26.or)((0, import_drizzle_orm26.ilike)(agProducts.name, pattern), (0, import_drizzle_orm26.ilike)(agProducts.activeIngredient, pattern)));
  }
  if (crop) conditions.push(import_drizzle_orm26.sql`${agProducts.crops} @> ${JSON.stringify([crop])}::jsonb`);
  if (soilType) conditions.push(import_drizzle_orm26.sql`${agProducts.soilTypes} @> ${JSON.stringify([soilType])}::jsonb`);
  if (growthStage) conditions.push(import_drizzle_orm26.sql`${agProducts.growthStages} @> ${JSON.stringify([growthStage])}::jsonb`);
  const rows = conditions.length > 0 ? await db.select().from(agProducts).where((0, import_drizzle_orm26.and)(...conditions)).limit(limit) : await db.select().from(agProducts).limit(limit);
  const data = enrichProductsWithImages(
    rows.map((r) => ({
      ...r,
      type: r.type,
      category: r.subType,
      activeIngredient: r.activeIngredient,
      sourceUrl: r.sourceUrl
    }))
  );
  return c.json({ data, count: data.length });
});
app.get("/api/ag-products/:id", async (c) => {
  const [row] = await db.select().from(agProducts).where((0, import_drizzle_orm26.eq)(agProducts.id, c.req.param("id"))).limit(1);
  if (!row) return appError(c, "PRODUCT_NOT_FOUND");
  const [data] = enrichProductsWithImages([
    {
      ...row,
      type: row.type,
      category: row.subType,
      activeIngredient: row.activeIngredient,
      sourceUrl: row.sourceUrl
    }
  ]);
  return c.json({ data });
});
app.get("/api/product-image/resolve", async (c) => {
  const productId = c.req.query("id");
  const sourceUrl = mergeManufacturerSourceUrl(productId ?? "", c.req.query("sourceUrl")) ?? c.req.query("sourceUrl");
  const url = await resolveProductImageUrlAsync({
    id: productId,
    image: c.req.query("image"),
    type: c.req.query("type") ?? "fertilizer",
    category: c.req.query("category"),
    activeIngredient: c.req.query("activeIngredient"),
    sourceUrl
  });
  if (!url) return appError(c, "NOT_FOUND");
  return c.json({ url });
});
app.get("/api/crop-diseases", async (c) => {
  const crop = c.req.query("crop") ?? c.req.query("cropId");
  const category = c.req.query("category");
  const search = c.req.query("search")?.trim();
  const limit = Math.min(Number(c.req.query("limit") ?? 100), 500);
  const conditions = [];
  if (crop) conditions.push((0, import_drizzle_orm26.eq)(cropDiseaseCatalog.cropId, crop));
  if (category) conditions.push((0, import_drizzle_orm26.eq)(cropDiseaseCatalog.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push((0, import_drizzle_orm26.or)((0, import_drizzle_orm26.ilike)(cropDiseaseCatalog.name, pattern), (0, import_drizzle_orm26.ilike)(cropDiseaseCatalog.symptoms, pattern)));
  }
  const rows = conditions.length > 0 ? await db.select().from(cropDiseaseCatalog).where((0, import_drizzle_orm26.and)(...conditions)).limit(limit) : await db.select().from(cropDiseaseCatalog).limit(limit);
  return c.json({ data: rows, count: rows.length });
});
app.get("/api/soils", async (c) => {
  const lat = Number(c.req.query("lat"));
  const lon = Number(c.req.query("lon"));
  if (!lat || !lon) return appError(c, "LOCATION_REQUIRED");
  const key = geoKey(lat, lon);
  const [cached] = await db.select().from(soils).where((0, import_drizzle_orm26.eq)(soils.geoKey, key)).limit(1);
  if (cached) {
    return c.json({ data: cached, source: "soilgrids" });
  }
  return c.json({ data: null, source: "soilgrids", warning: "cache_miss" });
});
app.get("/api/weather/latest", async (c) => {
  const rows = await db.select().from(weather).orderBy((0, import_drizzle_orm26.desc)(weather.fetchedAt)).limit(10);
  return c.json({ data: rows, source: "open_meteo" });
});
app.get("/api/sync/status", async (c) => {
  const sources = await db.select().from(dataSources);
  const jobs = await db.select().from(syncJobs).orderBy((0, import_drizzle_orm26.desc)(syncJobs.startedAt)).limit(20);
  const [mandiRow] = await db.select({ at: import_drizzle_orm26.sql`max(${mandiPrices.fetchedAt})` }).from(mandiPrices);
  const [weatherRow] = await db.select({ at: import_drizzle_orm26.sql`max(${weather.fetchedAt})` }).from(weather);
  const [fertRow] = await db.select({ at: import_drizzle_orm26.sql`max(${fertilizerProducts.lastSyncedAt})` }).from(fertilizerProducts);
  return c.json({
    sources,
    recentJobs: jobs,
    mandiLastSync: mandiRow?.at ?? null,
    weatherLastSync: weatherRow?.at ?? null,
    fertilizerLastSync: fertRow?.at ?? null,
    pesticideCatalogVerifiedAt: canonicalAgStats().verifiedAt
  });
});
app.get("/api/knowledge/search", async (c) => {
  const q = c.req.query("q") ?? "";
  if (!q.trim()) return appError(c, "SEARCH_REQUIRED");
  const hits = await searchKnowledge(q, Number(c.req.query("limit") ?? 15));
  return c.json({ data: hits, formatted: formatKnowledgeForAI(hits, q) });
});
app.get("/api/knowledge/ask", async (c) => {
  const q = c.req.query("q") ?? "";
  if (!q.trim()) return appError(c, "SEARCH_REQUIRED");
  const crop = c.req.query("crop") ?? c.req.query("cropId");
  const cropIds = crop ? crop.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const context = await buildKnowledgeContextForAI(q, cropIds);
  const hits = await searchKnowledge(q, 15);
  return c.json({
    data: hits,
    context,
    count: hits.length
  });
});
app.get("/api/knowledge/catalog", async (c) => {
  const q = c.req.query("q") ?? "";
  const crop = c.req.query("crop") ?? c.req.query("cropId");
  const cropIds = crop ? crop.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const { buildAgCatalogContextForAI: buildAgCatalogContextForAI2 } = await Promise.resolve().then(() => (init_agCatalogSearch(), agCatalogSearch_exports));
  const context = await buildAgCatalogContextForAI2(q || "fertilizer pesticide disease", cropIds);
  return c.json({ context, cropIds });
});
app.get("/api/knowledge/research", async (c) => {
  const q = c.req.query("q")?.trim() ?? "";
  if (!q) return appError(c, "SEARCH_REQUIRED");
  const crop = c.req.query("crop") ?? "";
  const cropIds = crop ? crop.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const correction = c.req.query("correction") === "true" || isCorrectionMessage(q);
  const priorQuery = c.req.query("priorQuery")?.trim();
  const researchQuery = correction && priorQuery ? priorQuery : q;
  const result = await researchAgricultureOnline(researchQuery, {
    correction,
    correctionNote: correction ? q : void 0,
    cropIds
  });
  return c.json({
    context: result.formattedContext,
    snippetCount: result.snippets.length,
    query: result.query
  });
});
app.post("/api/knowledge/cache", farmerAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const query = body.query?.trim() ?? "";
  const answer = body.answer?.trim() ?? "";
  if (!query || !answer) return appError(c, "SEARCH_REQUIRED");
  let dbContext = body.dbContext ?? "";
  if (!dbContext) {
    dbContext = await buildKnowledgeContextForAI(query, body.cropIds ?? []);
  }
  const result = await cacheAiKnowledgeAnswer(query, answer, {
    cropIds: body.cropIds,
    provider: getAiProvider(),
    dbContext
  });
  return c.json({ success: true, stored: result.stored, id: result.id });
});
app.post("/api/sync", adminAuthMiddleware, async (c) => {
  const results = await runFullSync();
  return c.json({ ok: true, results });
});
app.post("/api/farmers/me/push-token", farmerAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const token = body.token?.trim();
  if (!token) return appError(c, "PUSH_TOKEN_REQUIRED");
  await registerPushToken(c.get("farmerId"), token, body.platform);
  return c.json({ success: true });
});
app.delete("/api/farmers/me/push-token", farmerAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const token = body.token?.trim();
  if (!token) return appError(c, "PUSH_TOKEN_REQUIRED");
  await removePushToken(c.get("farmerId"), token);
  return c.json({ success: true });
});
app.get("/api/farmers/me/notifications", farmerAuthMiddleware, async (c) => {
  const limit = Math.min(Number(c.req.query("limit") ?? 30), 100);
  const rows = await listFarmerNotifications(c.get("farmerId"), limit);
  return c.json({
    data: rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      body: r.body,
      data: r.data,
      read: r.isRead,
      readAt: r.readAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString()
    })),
    count: rows.length
  });
});
app.patch("/api/farmers/me/notifications/:id/read", farmerAuthMiddleware, async (c) => {
  const id = c.req.param("id");
  if (!id) return appError(c, "INVALID_REQUEST");
  const ok = await markNotificationRead(c.get("farmerId"), id);
  if (!ok) return appError(c, "NOTIFICATION_NOT_FOUND");
  return c.json({ success: true });
});
app.post("/api/farmers/me/notifications/read-all", farmerAuthMiddleware, async (c) => {
  const count2 = await markAllNotificationsRead(c.get("farmerId"));
  return c.json({ success: true, count: count2 });
});
app.post("/api/farmers/me/notifications/push", farmerAuthMiddleware, async (c) => {
  const body = await c.req.json();
  if (!body.title?.trim() || !body.body?.trim()) {
    return appError(c, "NOTIFICATION_FIELDS_REQUIRED");
  }
  const typeMap = {
    mandi_price: "mandi_alert",
    weather_rain: "weather_alert",
    weather_heat: "weather_alert",
    weather_wind: "weather_alert",
    crop_sowing: "crop_calendar",
    crop_harvest: "crop_calendar",
    data_freshness: "ai_insight"
  };
  const notifType = typeMap[body.type ?? ""] ?? "ai_insight";
  const result = await createAndPushNotification(c.get("farmerId"), {
    type: notifType,
    title: body.title.trim(),
    body: body.body.trim(),
    data: body.data
  });
  return c.json({ success: true, ...result });
});
app.post("/api/farmers/me/alerts/check", farmerAuthMiddleware, async (c) => {
  const result = await dispatchRealtimeAlertsForFarmer(c.get("farmerId"));
  return c.json({ ok: true, ...result });
});
function authorizeCron(c) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  const bearer = c.req.header("authorization");
  const headerSecret = c.req.header("x-cron-secret");
  return headerSecret === secret || bearer === `Bearer ${secret}`;
}
async function runDailyNotificationCron(c) {
  if (!authorizeCron(c)) {
    return appError(c, "FORBIDDEN");
  }
  const result = await dispatchDailyFarmReminders();
  return c.json({ ok: true, ...result });
}
async function runRealtimeNotificationCron(c) {
  if (!authorizeCron(c)) {
    return appError(c, "FORBIDDEN");
  }
  const result = await dispatchRealtimeAlertsForAll();
  return c.json({ ok: true, ...result });
}
app.get("/api/notifications/cron/daily", runDailyNotificationCron);
app.post("/api/notifications/cron/daily", runDailyNotificationCron);
app.get("/api/notifications/cron/realtime", runRealtimeNotificationCron);
app.post("/api/notifications/cron/realtime", runRealtimeNotificationCron);
async function runDailyDataCron(c) {
  if (!authorizeCron(c)) {
    return appError(c, "FORBIDDEN");
  }
  const results = await runDailyAutoSync();
  const failed = results.filter((r) => r.errors.length > 0);
  return c.json({
    ok: failed.length === 0,
    results,
    pesticide: canonicalAgStats(),
    note: "Pesticides/fungicides use bundled CIB&RC reference (updates on deploy). Mandi needs DATA_GOV_API_KEY."
  });
}
app.get("/api/cron/daily-data", runDailyDataCron);
app.post("/api/cron/daily-data", runDailyDataCron);
app.get("/api/cron/agro-catalog", runDailyDataCron);
app.post("/api/cron/agro-catalog", runDailyDataCron);
app.post("/api/ai/chat", farmerAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const messages = body.messages?.filter(isValidChatMessage) ?? [];
  if (!messages.length) return appError(c, "AI_MESSAGES_REQUIRED");
  try {
    const content = await completeAiChat(messages, {
      voiceMode: body.voiceMode,
      agentId: body.agentId,
      cropIds: body.cropIds,
      language: body.language
    });
    log.info("ai/chat", "completed", {
      farmerId: c.get("farmerId"),
      agentId: body.agentId ?? "general",
      provider: getAiProvider(),
      voiceMode: Boolean(body.voiceMode),
      language: body.language ?? "te"
    });
    return c.json({ content });
  } catch (err) {
    log.error("ai/chat", "AI proxy failed", { err, farmerId: c.get("farmerId"), provider: getAiProvider() });
    return c.json({
      content: "\u0C38\u0C2E\u0C3E\u0C27\u0C3E\u0C28\u0C02 \u0C07\u0C02\u0C15\u0C3E \u0C35\u0C46\u0C24\u0C41\u0C15\u0C41\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41. \u0C2A\u0C02\u0C1F \u0C2A\u0C47\u0C30\u0C41, \u0C0A\u0C30\u0C41 \u0C1A\u0C46\u0C2A\u0C4D\u0C2A\u0C3F \u0C2E\u0C33\u0C4D\u0C32\u0C40 \u0C05\u0C21\u0C17\u0C02\u0C21\u0C3F."
    });
  }
});
app.post("/api/ai/chat/stream", farmerAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const messages = body.messages?.filter(isValidChatMessage) ?? [];
  if (!messages.length) return appError(c, "AI_MESSAGES_REQUIRED");
  try {
    const stream = await streamAiChat(messages, {
      voiceMode: body.voiceMode,
      agentId: body.agentId,
      cropIds: body.cropIds,
      language: body.language
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      }
    });
  } catch (err) {
    log.error("ai/stream", "AI proxy failed", { err, farmerId: c.get("farmerId"), provider: getAiProvider() });
    try {
      const stream = await streamAiChat(messages, {
        voiceMode: body.voiceMode,
        agentId: body.agentId,
        cropIds: body.cropIds,
        language: body.language
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        }
      });
    } catch {
      const encoder = new TextEncoder();
      const msg = "\u0C38\u0C2E\u0C3E\u0C27\u0C3E\u0C28\u0C02 \u0C07\u0C02\u0C15\u0C3E \u0C35\u0C46\u0C24\u0C41\u0C15\u0C41\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41. \u0C2A\u0C02\u0C1F \u0C2A\u0C47\u0C30\u0C41, \u0C0A\u0C30\u0C41 \u0C1A\u0C46\u0C2A\u0C4D\u0C2A\u0C3F \u0C2E\u0C33\u0C4D\u0C32\u0C40 \u0C05\u0C21\u0C17\u0C02\u0C21\u0C3F.";
      const fallback = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: msg })}

`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      });
      return new Response(fallback, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        }
      });
    }
  }
});
registerGlobalErrorHandler(app);
var server_default = app;
function isDirectServerRun() {
  const entry = (process.argv[1] ?? "").replace(/\\/g, "/");
  return entry.includes("server/index") || entry.endsWith("dist/index.js");
}
if (isDirectServerRun()) {
  const port = Number(process.env.PORT ?? 3001);
  console.log(`Bhuvedam API \u2192 http://localhost:${port}`);
  (0, import_node_server.serve)({ fetch: app.fetch, port });
}

// src/vercelHandler.cts
module.exports = (0, import_node_server2.getRequestListener)(server_default.fetch);
