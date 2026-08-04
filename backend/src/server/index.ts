import { config } from 'dotenv';
import path from 'node:path';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';

config({ path: '.env' });

import { appError, appErrorFromThrown, parseOtpWaitSeconds } from '../errors/appError';
import { db } from '../db';
import { log, maskPhone } from '../logging/logger';
import {
  agAdvisories,
  icarGuidelines,
  plantDiseases,
  soilHealthRecommendations,
} from '../db/schema/agCatalog';
import { agProducts, cropDiseaseCatalog } from '../db/schema/agProducts';
import {
  agrochemicals,
  crops,
  cropVarieties,
  dataSources,
  mandiPrices,
  soils,
  syncJobs,
  weather,
} from '../db/schema';
import { runFullSync } from '../ingestion/syncAll';
import { syncIndianAgCatalog, syncIndianFertilizerCatalog } from '../ingestion/sources/indianAgCatalogSource';
import { syncBulkAgCatalog } from '../ingestion/sources/bulkAgCatalogSource';
import { syncSoilAtPoint } from '../ingestion/sources/soilGridsSource';
import { geoKey } from '../ingestion/utils';
import { farmerAuthMiddleware, type FarmerAuthVariables } from '../middleware/farmerAuth';
import { adminAuthMiddleware } from '../middleware/adminAuth';
import { apiLoggerMiddleware, registerGlobalErrorHandler } from '../middleware/apiLogger';
import {
  createFarmerToken,
  formatFarmerUser,
  farmerLoginKey,
  formatPhone,
  phoneForDisplay,
} from '../services/farmerAuth';
import {
  formatFarmerProfileForApp,
  getFarmerProfile,
  syncFarmerProfile,
  upsertFarmerByPhone,
  type FarmerSyncInput,
} from '../services/farmerSync';
import { getCropByIdDb, searchCropsDb, countCropsDb } from '../services/cropSearch';
import {
  localizeCropRow,
  localizeCropsForFarmer,
  parseFarmerLanguage,
  parseLocalizeMode,
} from '../services/cropLocalization';
import { formatKnowledgeForAI, searchKnowledge, buildKnowledgeContextForAI } from '../services/knowledgeSearch';
import { cacheAiKnowledgeAnswer } from '../services/aiKnowledgeCache';
import { researchAgricultureOnline } from '../services/webResearchService';
import { isCorrectionMessage } from '../services/correctionDetect';
import {
  getFertilizerProductById,
  searchFertilizerProducts,
} from '../services/fertilizerProductSearch';
import {
  canonicalAgStats,
  getCanonicalAgProductById,
  searchCanonicalAgProducts,
} from '../services/canonicalAgCatalog';
import {
  createAndPushNotification,
  dispatchDailyFarmReminders,
  listFarmerNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushToken,
  removePushToken,
} from '../services/notificationInboxService';
import {
  dispatchRealtimeAlertsForAll,
  dispatchRealtimeAlertsForFarmer,
} from '../services/farmAlertPushService';
import {
  consumeOtpSession,
  getFarmerByPhone,
  hasVerifiedOtpSession,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '../services/otpService';
import {
  changeFarmerPassword,
  loginFarmerWithPassword,
  registerFarmerWithPassword,
  resetPasswordWithPhoneOtp,
} from '../services/passwordAuth';
import {
  completeAiChat,
  isAiConfigured,
  getAiProvider,
  streamAiChat,
  type ProxyChatMessage,
} from '../services/aiChatService';

const app = new Hono<{ Variables: FarmerAuthVariables }>();

const publicRoot = path.join(process.cwd(), 'public');

app.use('*', cors());
app.use('*', apiLoggerMiddleware);

app.use(
  '/static/*',
  serveStatic({
    root: publicRoot,
    rewriteRequestPath: (p) => p.replace(/^\/static\/?/, '/'),
  }),
);

app.get('/', (c) =>
  c.json({
    service: 'bhuvedam-api',
    health: '/health',
    docs: 'Use /api/auth/* and other /api routes from the mobile app',
  }),
);

app.get('/health', (c) => {
  const database = Boolean(process.env.DATABASE_URL?.trim());
  const jwt = Boolean(process.env.JWT_SECRET?.trim());
  const aiProvider = getAiProvider();
  const ai = isAiConfigured();
  return c.json({
    ok: database && jwt,
    service: 'bhuvedam-api',
    config: { database, jwt, ai, aiProvider },
  });
});

/** Legacy login — disabled in production (use OTP only) */
app.post('/api/auth/login', async (c) => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LEGACY_LOGIN !== 'true') {
    return appError(c, 'LEGACY_LOGIN_DISABLED');
  }

  const body = (await c.req.json()) as {
    phone?: string;
    name?: string;
    language?: string;
  };

  const phoneRaw = body.phone?.trim();
  const name = body.name?.trim();
  if (!phoneRaw || !name) {
    return appError(c, 'INVALID_REQUEST');
  }

  const phone = formatPhone(phoneRaw);
  const farmer = await upsertFarmerByPhone(phone, name, body.language ?? 'te');
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
        location: farmer.locationLabel ?? undefined,
        farmSize: farmer.farmSize ?? undefined,
        createdAt: farmer.createdAt.toISOString(),
      },
    },
  });
});

/** Logout — client clears token */
app.post('/api/auth/logout', (c) => c.json({ success: true }));

/** Register with mobile/email + password */
app.post('/api/auth/register', async (c) => {
  const body = (await c.req.json()) as {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    language?: string;
  };

  const name = body.name?.trim();
  const password = body.password ?? '';
  const phoneRaw = body.phone?.trim();
  log.info('auth/register', 'attempt', {
    phone: maskPhone(phoneRaw),
    nameLength: name?.length ?? 0,
    language: body.language,
  });
  if (!name) {
    log.warn('auth/register', 'validation failed', { code: 'NAME_REQUIRED' });
    return appError(c, 'NAME_REQUIRED');
  }
  if (!phoneRaw) {
    log.warn('auth/register', 'validation failed', { code: 'MOBILE_REQUIRED' });
    return appError(c, 'MOBILE_REQUIRED');
  }
  if (!password) {
    log.warn('auth/register', 'validation failed', { code: 'PASSWORD_REQUIRED' });
    return appError(c, 'PASSWORD_REQUIRED');
  }

  try {
    const farmer = await registerFarmerWithPassword({
      name,
      password,
      phone: phoneRaw,
      language: body.language,
    });
    const loginKey = farmerLoginKey(farmer);
    const token = createFarmerToken(farmer.id, loginKey);

    log.info('auth/register', 'success', { farmerId: farmer.id, phone: maskPhone(phoneRaw) });

    return c.json({
      success: true,
      data: {
        token,
        user: formatFarmerUser(farmer),
      },
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : 'REGISTER_FAILED';
    const map: Record<string, Parameters<typeof appError>[1]> = {
      INVALID_NAME: 'INVALID_NAME',
      WEAK_PASSWORD: 'WEAK_PASSWORD',
      INVALID_PHONE: 'INVALID_PHONE',
      PHONE_REQUIRED: 'MOBILE_REQUIRED',
      PHONE_TAKEN: 'PHONE_TAKEN',
    };
    if (map[code]) {
      log.warn('auth/register', 'rejected', { code, phone: maskPhone(phoneRaw) });
      return appError(c, map[code]!);
    }
    log.error('auth/register', 'unexpected failure', { phone: maskPhone(phoneRaw), err });
    return appError(c, 'REGISTER_FAILED');
  }
});

/** Login with mobile/email + password */
app.post('/api/auth/login-password', async (c) => {
  const body = (await c.req.json()) as {
    identifier?: string;
    phone?: string;
    email?: string;
    password?: string;
  };

  const identifier = (body.identifier ?? body.phone ?? '').trim();
  const password = body.password ?? '';
  if (!identifier) return appError(c, 'MOBILE_REQUIRED');
  if (!password) return appError(c, 'PASSWORD_REQUIRED');

  try {
    const farmer = await loginFarmerWithPassword(identifier, password);
    const loginKey = farmerLoginKey(farmer);
    const token = createFarmerToken(farmer.id, loginKey);

    return c.json({
      success: true,
      data: {
        token,
        user: formatFarmerUser(farmer),
      },
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : 'LOGIN_FAILED';
    log.warn('auth/login-password', 'rejected', { code, identifier: maskPhone(identifier) });
    if (code === 'INVALID_CREDENTIALS') return appError(c, 'INVALID_CREDENTIALS');
    if (code === 'ACCOUNT_DISABLED') return appError(c, 'ACCOUNT_DISABLED');
    log.error('auth/login-password', 'unexpected failure', { identifier: maskPhone(identifier), err });
    return appError(c, 'LOGIN_FAILED');
  }
});

/** Send OTP for password reset — only if mobile is registered */
app.post('/api/auth/forgot-password', async (c) => {
  const body = (await c.req.json()) as { phone?: string };
  const phoneRaw = body.phone?.trim();
  if (!phoneRaw) return appError(c, 'MOBILE_REQUIRED');

  const farmer = await getFarmerByPhone(formatPhone(phoneRaw));
  if (!farmer) return appError(c, 'MOBILE_NOT_REGISTERED');

  try {
    const result = await sendPhoneOtp(phoneRaw);
    return c.json({ success: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'SMS_FAILED';
    log.warn('auth/forgot-password', 'otp send failed', { phone: maskPhone(phoneRaw), msg });
    if (msg.startsWith('WAIT_')) {
      const seconds = parseOtpWaitSeconds(msg) ?? 60;
      return appError(c, 'OTP_WAIT', { retryAfterSec: seconds });
    }
    return appError(c, 'OTP_SEND_FAILED');
  }
});

/** Reset password after OTP verification on registered mobile */
app.post('/api/auth/reset-password', async (c) => {
  const body = (await c.req.json()) as { phone?: string; otp?: string; password?: string };
  const phoneRaw = body.phone?.trim();
  const otp = body.otp?.trim() ?? '';
  const password = body.password ?? '';

  if (!phoneRaw) return appError(c, 'MOBILE_REQUIRED');
  if (!otp) return appError(c, 'OTP_INVALID');
  if (!password) return appError(c, 'PASSWORD_REQUIRED');

  try {
    const farmer = await resetPasswordWithPhoneOtp(phoneRaw, otp, password);
    const loginKey = farmerLoginKey(farmer);
    const token = createFarmerToken(farmer.id, loginKey);

    return c.json({
      success: true,
      data: {
        token,
        user: formatFarmerUser(farmer),
      },
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : 'RESET_FAILED';
    const otpMap: Record<string, Parameters<typeof appError>[1]> = {
      OTP_expired: 'OTP_EXPIRED',
      OTP_invalid: 'OTP_INVALID',
      OTP_max_attempts: 'OTP_MAX_ATTEMPTS',
    };
    if (code.startsWith('OTP_') && otpMap[code]) return appError(c, otpMap[code]!);
    if (code === 'NOT_FOUND') return appError(c, 'MOBILE_NOT_REGISTERED');
    if (code === 'WEAK_PASSWORD') return appError(c, 'WEAK_PASSWORD');
    console.error('[auth/reset-password] failed:', err);
    return appError(c, 'RESET_FAILED');
  }
});

/** Change password when logged in */
app.post('/api/auth/change-password', farmerAuthMiddleware, async (c) => {
  const body = (await c.req.json()) as {
    currentPassword?: string;
    password?: string;
    newPassword?: string;
  };

  const currentPassword = body.currentPassword ?? '';
  const newPassword = body.newPassword ?? body.password ?? '';
  if (!currentPassword) return appError(c, 'PASSWORD_REQUIRED');
  if (!newPassword) return appError(c, 'PASSWORD_REQUIRED');

  try {
    const farmerId = c.get('farmerId');
    await changeFarmerPassword(farmerId, currentPassword, newPassword);
    return c.json({ success: true });
  } catch (err) {
    const code = err instanceof Error ? err.message : 'CHANGE_PASSWORD_FAILED';
    if (code === 'WRONG_PASSWORD') return appError(c, 'WRONG_PASSWORD');
    if (code === 'NO_PASSWORD') return appError(c, 'NO_PASSWORD');
    if (code === 'SAME_PASSWORD') return appError(c, 'SAME_PASSWORD');
    if (code === 'WEAK_PASSWORD') return appError(c, 'WEAK_PASSWORD');
    console.error('[auth/change-password] failed:', err);
    return appError(c, 'CHANGE_PASSWORD_FAILED');
  }
});

/** Send 6-digit OTP to registered farmer phone only (2Factor or dev mode) */
app.post('/api/auth/send-otp', async (c) => {
  const body = (await c.req.json()) as { phone?: string };
  const phoneRaw = body.phone?.trim();
  if (!phoneRaw) return appError(c, 'MOBILE_REQUIRED');

  const farmer = await getFarmerByPhone(formatPhone(phoneRaw));
  if (!farmer) return appError(c, 'MOBILE_NOT_REGISTERED');

  try {
    const result = await sendPhoneOtp(phoneRaw);
    return c.json({ success: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'SMS_FAILED';
    console.error('[OTP] send-otp failed:', err);
    if (msg.startsWith('WAIT_')) {
      const seconds = Number(msg.replace('WAIT_', '')) || 60;
      return appError(c, 'OTP_WAIT', { retryAfterSec: seconds });
    }
    return appError(c, 'OTP_SEND_FAILED');
  }
});

/** Verify OTP — existing farmer logs in; new farmer may need name */
app.post('/api/auth/verify-otp', async (c) => {
  const body = (await c.req.json()) as {
    phone?: string;
    otp?: string;
    name?: string;
    language?: string;
  };

  const phoneRaw = body.phone?.trim();
  const otp = body.otp?.trim() ?? '';
  const name = body.name?.trim();
  if (!phoneRaw) return appError(c, 'MOBILE_REQUIRED');
  if (!otp && !name) return appError(c, 'OTP_INVALID');

  const phone = formatPhone(phoneRaw);

  let otpOk = false;
  if (otp) {
    const check = await verifyPhoneOtp(phoneRaw, otp);
    if (!check.valid) {
      if (check.reason === 'expired') return appError(c, 'OTP_EXPIRED');
      if (check.reason === 'max_attempts') return appError(c, 'OTP_MAX_ATTEMPTS');
      return appError(c, 'OTP_INVALID');
    }
    otpOk = true;
  } else if (name && (await hasVerifiedOtpSession(phoneRaw))) {
    otpOk = true;
  } else {
    return appError(c, 'OTP_INVALID');
  }

  if (!otpOk) return appError(c, 'OTP_INVALID');

  const existing = await getFarmerByPhone(phone);
  if (existing?.name?.trim()) {
    const token = createFarmerToken(existing.id, farmerLoginKey(existing));
    await consumeOtpSession(phoneRaw);
    return c.json({
      success: true,
      data: {
        token,
        user: formatFarmerUser(existing),
      },
    });
  }

  if (!name) {
    return c.json({
      success: true,
      data: {
        needsName: true,
        phone: phoneForDisplay(phone),
      },
    });
  }

  const farmer = await upsertFarmerByPhone(phone, name, body.language ?? 'te');
  const token = createFarmerToken(farmer!.id, farmerLoginKey(farmer!));
  await consumeOtpSession(phoneRaw);

  return c.json({
    success: true,
    data: {
      token,
      user: formatFarmerUser(farmer!),
    },
  });
});

/** Current farmer profile from Neon */
app.get('/api/auth/profile', farmerAuthMiddleware, async (c) => {
  const farmerId = c.get('farmerId');
  const profile = await getFarmerProfile(farmerId);
  if (!profile) return appError(c, 'FARMER_NOT_FOUND');

  return c.json({
    success: true,
    data: formatFarmerUser(profile),
  });
});

/** Current farmer farm setup from Neon (for app hydrate after login) */
app.get('/api/farmers/me', farmerAuthMiddleware, async (c) => {
  const farmerId = c.get('farmerId');
  const profile = await getFarmerProfile(farmerId);
  if (!profile) return appError(c, 'FARMER_NOT_FOUND');

  return c.json({
    success: true,
    data: formatFarmerProfileForApp(profile),
    source: 'neon',
  });
});

/** Sync farmer farm setup → `farmers`, `lands`, `crop_calendar` */
app.put('/api/farmers/me/sync', farmerAuthMiddleware, async (c) => {
  const farmerId = c.get('farmerId');
  const body = (await c.req.json()) as FarmerSyncInput;

  try {
    const profile = await syncFarmerProfile(farmerId, body);
    return c.json({
      success: true,
      data: profile,
      source: 'neon',
    });
  } catch (err) {
    console.error('[farmers/sync] failed:', err);
    log.error('farmer/sync', 'profile sync failed', { err, farmerId: c.get('farmerId') });
    return appError(c, 'SYNC_FAILED');
  }
});

/** All crops — search English/Telugu + farmer language display via AI (?lang=te) */
app.get('/api/crops', async (c) => {
  const search = c.req.query('search')?.trim();
  const category = c.req.query('category')?.trim();
  const limit = Math.min(Number(c.req.query('limit') ?? 500), 2000);
  const lang = parseFarmerLanguage(c.req.query('lang'));
  const localize = parseLocalizeMode(c.req.query('localize'), limit);

  let rows = await searchCropsDb(search, limit);
  if (category) {
    rows = rows.filter((r) => r.category === category);
  }

  const total = await countCropsDb();
  const data =
    localize === 'none' ? rows : await localizeCropsForFarmer(rows, lang, localize);

  return c.json({
    data,
    count: data.length,
    totalInDb: total,
    lang,
    source: 'neon',
  });
});

/** Single crop — localized for farmer language */
app.get('/api/crops/:cropId', async (c) => {
  const cropId = c.req.param('cropId');
  const lang = parseFarmerLanguage(c.req.query('lang'));
  const row = await getCropByIdDb(cropId);
  if (!row) return appError(c, 'CROP_NOT_FOUND');
  const data = await localizeCropRow(row, lang, 'full');
  return c.json({ data, lang, source: 'neon' });
});

/** Varieties / seeds for a crop */
app.get('/api/crops/:cropId/varieties', async (c) => {
  const cropId = c.req.param('cropId');
  const rows = await db.select().from(cropVarieties).where(eq(cropVarieties.cropId, cropId)).limit(500);
  return c.json({ data: rows, count: rows.length });
});

/** Live mandi prices from DB */
app.get('/api/mandi/prices', async (c) => {
  const cropId = c.req.query('cropId');
  const state = c.req.query('state');
  const limit = Number(c.req.query('limit') ?? 100);

  const rows = cropId
    ? await db
        .select()
        .from(mandiPrices)
        .where(eq(mandiPrices.cropId, cropId))
        .orderBy(desc(mandiPrices.fetchedAt))
        .limit(limit)
    : await db.select().from(mandiPrices).orderBy(desc(mandiPrices.fetchedAt)).limit(limit);

  const filtered = state ? rows.filter((r) => r.state === state) : rows;
  return c.json({ data: filtered, source: 'agmarknet' });
});

/** Fertilizers & agrochemicals */
app.get('/api/fertilizers', async (c) => {
  const cropId = c.req.query('cropId');
  const type = c.req.query('type') ?? 'fertilizer';
  const rows = cropId
    ? await db.select().from(agrochemicals).where(eq(agrochemicals.cropId, cropId)).limit(100)
    : await db.select().from(agrochemicals).where(eq(agrochemicals.type, type as 'fertilizer')).limit(200);
  return c.json({ data: rows });
});

/** Indian fertilizer product catalog — IFFCO, Coromandel, NFL, DoF */
app.get('/api/fertilizer-products', async (c) => {
  const data = await searchFertilizerProducts({
    search: c.req.query('search'),
    brand: c.req.query('brand'),
    category: c.req.query('category'),
    crop: c.req.query('crop') ?? c.req.query('cropId'),
    source: c.req.query('source'),
    limit: Number(c.req.query('limit') ?? 100),
  });

  return c.json({
    data,
    count: data.length,
    source: 'neon',
  });
});

app.get('/api/fertilizer-products/:id', async (c) => {
  const row = await getFertilizerProductById(c.req.param('id'));
  if (!row) return appError(c, 'FERTILIZER_NOT_FOUND');
  return c.json({ data: row, source: 'neon' });
});

/** Seed / refresh Indian fertilizer catalog */
app.post('/api/fertilizer-products/sync', adminAuthMiddleware, async (c) => {
  const result = await syncIndianFertilizerCatalog();
  return c.json({ ok: true, ...result, source: 'indian_fertilizers' });
});

/** PlantVillage + ICAR plant diseases */
app.get('/api/plant-diseases', async (c) => {
  const crop = c.req.query('crop') ?? c.req.query('cropId');
  const category = c.req.query('category');
  const search = c.req.query('search')?.trim();
  const limit = Math.min(Number(c.req.query('limit') ?? 100), 500);
  const conditions = [];
  if (crop) conditions.push(eq(plantDiseases.cropId, crop));
  if (category) conditions.push(eq(plantDiseases.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(or(ilike(plantDiseases.name, pattern), ilike(plantDiseases.symptoms, pattern)));
  }
  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(plantDiseases)
          .where(and(...conditions))
          .limit(limit)
      : await db.select().from(plantDiseases).limit(limit);
  return c.json({ data: rows, count: rows.length, source: 'plantvillage_icar' });
});

app.get('/api/plant-diseases/:id', async (c) => {
  const [row] = await db
    .select()
    .from(plantDiseases)
    .where(eq(plantDiseases.id, c.req.param('id')))
    .limit(1);
  if (!row) return appError(c, 'DISEASE_NOT_FOUND');
  return c.json({ data: row, source: 'plantvillage_icar' });
});

/** ICAR crop, fertilizer, disease guidelines */
app.get('/api/icar/guidelines', async (c) => {
  const crop = c.req.query('crop') ?? c.req.query('cropId');
  const category = c.req.query('category');
  const limit = Math.min(Number(c.req.query('limit') ?? 50), 200);
  const conditions = [];
  if (crop) conditions.push(eq(icarGuidelines.cropId, crop));
  if (category) conditions.push(eq(icarGuidelines.category, category));
  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(icarGuidelines)
          .where(and(...conditions))
          .limit(limit)
      : await db.select().from(icarGuidelines).limit(limit);
  return c.json({ data: rows, count: rows.length, source: 'icar' });
});

/** Ministry of Agriculture advisories & schemes */
app.get('/api/ag-advisories', async (c) => {
  const type = c.req.query('type');
  const season = c.req.query('season');
  const limit = Math.min(Number(c.req.query('limit') ?? 50), 200);
  const conditions = [];
  if (type) conditions.push(eq(agAdvisories.type, type));
  if (season) conditions.push(eq(agAdvisories.season, season));
  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(agAdvisories)
          .where(and(...conditions))
          .limit(limit)
      : await db.select().from(agAdvisories).limit(limit);
  return c.json({ data: rows, count: rows.length, source: 'doa' });
});

/** Soil Health Card fertilizer recommendations */
app.get('/api/soil-health/recommendations', async (c) => {
  const soilType = c.req.query('soilType') ?? c.req.query('soil_type');
  const deficiency = c.req.query('deficiency');
  const limit = Math.min(Number(c.req.query('limit') ?? 50), 200);
  const conditions = [];
  if (soilType) conditions.push(eq(soilHealthRecommendations.soilType, soilType));
  if (deficiency) conditions.push(ilike(soilHealthRecommendations.deficiency, `%${deficiency}%`));
  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(soilHealthRecommendations)
          .where(and(...conditions))
          .limit(limit)
      : await db.select().from(soilHealthRecommendations).limit(limit);
  return c.json({ data: rows, count: rows.length, source: 'soil_health_card' });
});

/** Sync full Indian ag catalog (fertilizers, diseases, ICAR, DoA, soil health) */
app.post('/api/ag-catalog/sync', adminAuthMiddleware, async (c) => {
  const results = await syncIndianAgCatalog();
  return c.json({ ok: true, results, source: 'indian_ag_catalog' });
});

/** Bulk catalog — 2000+ pesticides, 1000+ fungicides, 1000+ fertilizers, 2000+ diseases */
app.post('/api/bulk-catalog/sync', adminAuthMiddleware, async (c) => {
  const counts = await syncBulkAgCatalog();
  return c.json({ ok: true, counts, source: 'bulk_catalog' });
});

app.get('/api/bulk-catalog/stats', async (c) => {
  const [[{ pesticides }], [{ fungicides }], [{ fertilizers }], [{ diseases }], [{ cropCount }]] =
    await Promise.all([
      db.select({ pesticides: sql<number>`count(*)::int` }).from(agProducts).where(eq(agProducts.type, 'pesticide')),
      db.select({ fungicides: sql<number>`count(*)::int` }).from(agProducts).where(eq(agProducts.type, 'fungicide')),
      db.select({ fertilizers: sql<number>`count(*)::int` }).from(agProducts).where(eq(agProducts.type, 'fertilizer')),
      db.select({ diseases: sql<number>`count(*)::int` }).from(cropDiseaseCatalog),
      db.select({ cropCount: sql<number>`count(*)::int` }).from(crops),
    ]);
  return c.json({
    data: { pesticides, fungicides, fertilizers, diseases, crops: cropCount },
    targets: { pesticides: 2000, fungicides: 1000, fertilizers: 1000, diseases: 2000, crops: 250 },
  });
});

/** Real reference catalog — one entry per CIB&RC active ingredient (no fake brand×crop matrix) */
app.get('/api/ag-products/canonical', async (c) => {
  const type = c.req.query('type');
  if (type !== 'pesticide' && type !== 'fungicide') {
    return appError(c, 'INVALID_PRODUCT_TYPE');
  }
  const data = searchCanonicalAgProducts({
    type,
    search: c.req.query('search'),
    crop: c.req.query('crop') ?? c.req.query('cropId'),
    target: c.req.query('target'),
    limit: Number(c.req.query('limit') ?? 100),
  });
  return c.json({ data, count: data.length, source: 'cibrc_reference', stats: canonicalAgStats() });
});

app.get('/api/ag-products/canonical/:id', async (c) => {
  const row = getCanonicalAgProductById(c.req.param('id'));
  if (!row) return appError(c, 'PRODUCT_NOT_FOUND');
  return c.json({ data: row, source: 'cibrc_reference' });
});

/** Unified ag products — fertilizers, pesticides, fungicides */
app.get('/api/ag-products', async (c) => {
  const type = c.req.query('type');
  const crop = c.req.query('crop') ?? c.req.query('cropId');
  const soilType = c.req.query('soilType') ?? c.req.query('soil_type');
  const growthStage = c.req.query('growthStage') ?? c.req.query('stage');
  const search = c.req.query('search')?.trim();
  const limit = Math.min(Number(c.req.query('limit') ?? 100), 500);
  const conditions = [];
  if (type) conditions.push(eq(agProducts.type, type));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(or(ilike(agProducts.name, pattern), ilike(agProducts.activeIngredient, pattern)));
  }
  if (crop) conditions.push(sql`${agProducts.crops} @> ${JSON.stringify([crop])}::jsonb`);
  if (soilType) conditions.push(sql`${agProducts.soilTypes} @> ${JSON.stringify([soilType])}::jsonb`);
  if (growthStage) conditions.push(sql`${agProducts.growthStages} @> ${JSON.stringify([growthStage])}::jsonb`);

  const rows =
    conditions.length > 0
      ? await db.select().from(agProducts).where(and(...conditions)).limit(limit)
      : await db.select().from(agProducts).limit(limit);
  return c.json({ data: rows, count: rows.length });
});

app.get('/api/ag-products/:id', async (c) => {
  const [row] = await db.select().from(agProducts).where(eq(agProducts.id, c.req.param('id'))).limit(1);
  if (!row) return appError(c, 'PRODUCT_NOT_FOUND');
  return c.json({ data: row });
});

/** Expanded disease catalog (2000+) */
app.get('/api/crop-diseases', async (c) => {
  const crop = c.req.query('crop') ?? c.req.query('cropId');
  const category = c.req.query('category');
  const search = c.req.query('search')?.trim();
  const limit = Math.min(Number(c.req.query('limit') ?? 100), 500);
  const conditions = [];
  if (crop) conditions.push(eq(cropDiseaseCatalog.cropId, crop));
  if (category) conditions.push(eq(cropDiseaseCatalog.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(or(ilike(cropDiseaseCatalog.name, pattern), ilike(cropDiseaseCatalog.symptoms, pattern)));
  }
  const rows =
    conditions.length > 0
      ? await db.select().from(cropDiseaseCatalog).where(and(...conditions)).limit(limit)
      : await db.select().from(cropDiseaseCatalog).limit(limit);
  return c.json({ data: rows, count: rows.length });
});

/** Soil pH & nutrients — fetch live or return cache */
app.get('/api/soils', async (c) => {
  const lat = Number(c.req.query('lat'));
  const lon = Number(c.req.query('lon'));
  if (!lat || !lon) return appError(c, 'LOCATION_REQUIRED');

  await syncSoilAtPoint(lat, lon);
  const key = geoKey(lat, lon);
  const [row] = await db.select().from(soils).where(eq(soils.geoKey, key)).limit(1);

  return c.json({ data: row ?? null, source: 'soilgrids' });
});

/** Latest weather snapshots */
app.get('/api/weather/latest', async (c) => {
  const rows = await db.select().from(weather).orderBy(desc(weather.fetchedAt)).limit(10);
  return c.json({ data: rows, source: 'open_meteo' });
});

/** Data source status + mandi/weather freshness */
app.get('/api/sync/status', async (c) => {
  const sources = await db.select().from(dataSources);
  const jobs = await db.select().from(syncJobs).orderBy(desc(syncJobs.startedAt)).limit(20);

  const [mandiRow] = await db
    .select({ at: sql<string>`max(${mandiPrices.fetchedAt})` })
    .from(mandiPrices);
  const [weatherRow] = await db
    .select({ at: sql<string>`max(${weather.fetchedAt})` })
    .from(weather);

  return c.json({
    sources,
    recentJobs: jobs,
    mandiLastSync: mandiRow?.at ?? null,
    weatherLastSync: weatherRow?.at ?? null,
  });
});

/** Instant agriculture knowledge search — research, books, diseases, pesticides */
app.get('/api/knowledge/search', async (c) => {
  const q = c.req.query('q') ?? '';
  if (!q.trim()) return appError(c, 'SEARCH_REQUIRED');
  const hits = await searchKnowledge(q, Number(c.req.query('limit') ?? 15));
  return c.json({ data: hits, formatted: formatKnowledgeForAI(hits, q) });
});

/** AI-ready knowledge context for a farmer question */
app.get('/api/knowledge/ask', async (c) => {
  const q = c.req.query('q') ?? '';
  if (!q.trim()) return appError(c, 'SEARCH_REQUIRED');
  const crop = c.req.query('crop') ?? c.req.query('cropId');
  const cropIds = crop ? crop.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const context = await buildKnowledgeContextForAI(q, cropIds);
  const hits = await searchKnowledge(q, 15);
  return c.json({
    data: hits,
    context,
    count: hits.length,
  });
});

/** Ag catalog context only — for AI crop protection block */
app.get('/api/knowledge/catalog', async (c) => {
  const q = c.req.query('q') ?? '';
  const crop = c.req.query('crop') ?? c.req.query('cropId');
  const cropIds = crop ? crop.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const { buildAgCatalogContextForAI } = await import('../services/agCatalogSearch');
  const context = await buildAgCatalogContextForAI(q || 'fertilizer pesticide disease', cropIds);
  return c.json({ context, cropIds });
});

/** Web research for thin DB answers or farmer corrections — stores in DB */
app.get('/api/knowledge/research', async (c) => {
  const q = c.req.query('q')?.trim() ?? '';
  if (!q) return appError(c, 'SEARCH_REQUIRED');

  const crop = c.req.query('crop') ?? '';
  const cropIds = crop ? crop.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const correction = c.req.query('correction') === 'true' || isCorrectionMessage(q);
  const priorQuery = c.req.query('priorQuery')?.trim();

  const researchQuery = correction && priorQuery ? priorQuery : q;
  const result = await researchAgricultureOnline(researchQuery, {
    correction,
    correctionNote: correction ? q : undefined,
    cropIds,
  });

  return c.json({
    context: result.formattedContext,
    snippetCount: result.snippets.length,
    query: result.query,
  });
});

/** Save AI answer when DB had no match — reused for other farmers asking the same question */
app.post('/api/knowledge/cache', farmerAuthMiddleware, async (c) => {
  const body = (await c.req.json()) as {
    query?: string;
    answer?: string;
    cropIds?: string[];
    dbContext?: string;
  };

  const query = body.query?.trim() ?? '';
  const answer = body.answer?.trim() ?? '';
  if (!query || !answer) return appError(c, 'SEARCH_REQUIRED');

  let dbContext = body.dbContext ?? '';
  if (!dbContext) {
    dbContext = await buildKnowledgeContextForAI(query, body.cropIds ?? []);
  }

  const result = await cacheAiKnowledgeAnswer(query, answer, {
    cropIds: body.cropIds,
    provider: getAiProvider(),
    dbContext,
  });

  return c.json({ success: true, stored: result.stored, id: result.id });
});

/** Trigger full sync from all live sources */
app.post('/api/sync', adminAuthMiddleware, async (c) => {
  const results = await runFullSync();
  return c.json({ ok: true, results });
});

/** Register Expo push token (free — Expo Push API) */
app.post('/api/farmers/me/push-token', farmerAuthMiddleware, async (c) => {
  const body = (await c.req.json()) as { token?: string; platform?: string };
  const token = body.token?.trim();
  if (!token) return appError(c, 'PUSH_TOKEN_REQUIRED');

  await registerPushToken(c.get('farmerId'), token, body.platform);
  return c.json({ success: true });
});

app.delete('/api/farmers/me/push-token', farmerAuthMiddleware, async (c) => {
  const body = (await c.req.json()) as { token?: string };
  const token = body.token?.trim();
  if (!token) return appError(c, 'PUSH_TOKEN_REQUIRED');

  await removePushToken(c.get('farmerId'), token);
  return c.json({ success: true });
});

/** Notification inbox */
app.get('/api/farmers/me/notifications', farmerAuthMiddleware, async (c) => {
  const limit = Math.min(Number(c.req.query('limit') ?? 30), 100);
  const rows = await listFarmerNotifications(c.get('farmerId'), limit);
  return c.json({
    data: rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      body: r.body,
      data: r.data,
      read: r.isRead,
      readAt: r.readAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
    count: rows.length,
  });
});

app.patch('/api/farmers/me/notifications/:id/read', farmerAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  if (!id) return appError(c, 'INVALID_REQUEST');
  const ok = await markNotificationRead(c.get('farmerId'), id);
  if (!ok) return appError(c, 'NOTIFICATION_NOT_FOUND');
  return c.json({ success: true });
});

app.post('/api/farmers/me/notifications/read-all', farmerAuthMiddleware, async (c) => {
  const count = await markAllNotificationsRead(c.get('farmerId'));
  return c.json({ success: true, count });
});

/** App-triggered push when new farm alert is generated */
app.post('/api/farmers/me/notifications/push', farmerAuthMiddleware, async (c) => {
  const body = (await c.req.json()) as {
    type?: string;
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  };
  if (!body.title?.trim() || !body.body?.trim()) {
    return appError(c, 'NOTIFICATION_FIELDS_REQUIRED');
  }

  const typeMap: Record<string, 'mandi_alert' | 'weather_alert' | 'crop_calendar' | 'ai_insight'> = {
    mandi_price: 'mandi_alert',
    weather_rain: 'weather_alert',
    weather_heat: 'weather_alert',
    weather_wind: 'weather_alert',
    crop_sowing: 'crop_calendar',
    crop_harvest: 'crop_calendar',
    data_freshness: 'ai_insight',
  };

  const notifType = typeMap[body.type ?? ''] ?? 'ai_insight';
  const result = await createAndPushNotification(c.get('farmerId'), {
    type: notifType,
    title: body.title.trim(),
    body: body.body.trim(),
    data: body.data,
  });

  return c.json({ success: true, ...result });
});

/** Farmer device — check weather/mandi alerts and push if needed (app open/background). */
app.post('/api/farmers/me/alerts/check', farmerAuthMiddleware, async (c) => {
  const result = await dispatchRealtimeAlertsForFarmer(c.get('farmerId'));
  return c.json({ ok: true, ...result });
});

/** Low-cost cron — cron-job.org (POST) or Vercel Cron (GET + Bearer CRON_SECRET) */
function authorizeCron(c: Context): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }
  const bearer = c.req.header('authorization');
  const headerSecret = c.req.header('x-cron-secret');
  return headerSecret === secret || bearer === `Bearer ${secret}`;
}

async function runDailyNotificationCron(c: Context) {
  if (!authorizeCron(c)) {
    return appError(c, 'FORBIDDEN');
  }

  const result = await dispatchDailyFarmReminders();
  return c.json({ ok: true, ...result });
}

async function runRealtimeNotificationCron(c: Context) {
  if (!authorizeCron(c)) {
    return appError(c, 'FORBIDDEN');
  }

  const result = await dispatchRealtimeAlertsForAll();
  return c.json({ ok: true, ...result });
}

app.get('/api/notifications/cron/daily', runDailyNotificationCron);
app.post('/api/notifications/cron/daily', runDailyNotificationCron);
app.get('/api/notifications/cron/realtime', runRealtimeNotificationCron);
app.post('/api/notifications/cron/realtime', runRealtimeNotificationCron);

/** AI chat (non-stream) — reliable on React Native APK */
app.post('/api/ai/chat', farmerAuthMiddleware, async (c) => {
  const body = (await c.req.json()) as {
    messages?: ProxyChatMessage[];
    voiceMode?: boolean;
    agentId?: string;
    cropIds?: string[];
  };

  const messages = body.messages?.filter((m) => m.role && m.content) ?? [];
  if (!messages.length) return appError(c, 'AI_MESSAGES_REQUIRED');

  try {
    const content = await completeAiChat(messages, {
      voiceMode: body.voiceMode,
      agentId: body.agentId,
      cropIds: body.cropIds,
    });
    log.info('ai/chat', 'completed', {
      farmerId: c.get('farmerId'),
      agentId: body.agentId ?? 'general',
      provider: getAiProvider(),
      voiceMode: Boolean(body.voiceMode),
    });
    return c.json({ content });
  } catch (err) {
    log.error('ai/chat', 'AI proxy failed', { err, farmerId: c.get('farmerId'), provider: getAiProvider() });
    return c.json({
      content:
        'I am still searching for the best answer. Please ask again with your crop name and village.',
    });
  }
});

/** AI chat stream — keys stay on server (Ollama proxy) */
app.post('/api/ai/chat/stream', farmerAuthMiddleware, async (c) => {
  const body = (await c.req.json()) as {
    messages?: ProxyChatMessage[];
    voiceMode?: boolean;
    agentId?: string;
    cropIds?: string[];
  };

  const messages = body.messages?.filter((m) => m.role && m.content) ?? [];
  if (!messages.length) return appError(c, 'AI_MESSAGES_REQUIRED');

  try {
    const stream = await streamAiChat(messages, {
      voiceMode: body.voiceMode,
      agentId: body.agentId,
      cropIds: body.cropIds,
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    log.error('ai/stream', 'AI proxy failed', { err, farmerId: c.get('farmerId'), provider: getAiProvider() });
    try {
      const stream = await streamAiChat(messages, {
        voiceMode: body.voiceMode,
        agentId: body.agentId,
        cropIds: body.cropIds,
      });
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } catch {
      const encoder = new TextEncoder();
      const msg =
        'I am still searching for the best answer. Please ask again with your crop name and village.';
      const fallback = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: msg })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });
      return new Response(fallback, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }
  }
});

registerGlobalErrorHandler(app);

export default app;

function isDirectServerRun(): boolean {
  const entry = (process.argv[1] ?? '').replace(/\\/g, '/');
  return entry.includes('server/index') || entry.endsWith('dist/index.js');
}

/** Only bind a port when started via npm run dev / npm start — not on Vercel import */
if (isDirectServerRun()) {
  const port = Number(process.env.PORT ?? 3001);
  console.log(`Bhuvedam API → http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}
