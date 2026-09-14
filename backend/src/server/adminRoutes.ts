import { Hono } from 'hono';

import { appError } from '../errors/appError';
import {
  adminSessionAuthMiddleware,
  type AdminAuthVariables,
} from '../middleware/adminSessionAuth';
import {
  createAdminToken,
  verifyAdminCredentials,
} from '../services/adminAuth';
import {
  createAdminBroadcast,
  createAdminFertilizer,
  createAdminScheme,
  deleteAdminFertilizer,
  deleteAdminScheme,
  getAdminAnalytics,
  getAdminSyncStatus,
  getAdminUserFarm,
  listAdminBroadcasts,
  listAdminCropPlantings,
  listAdminFertilizers,
  listAdminSchemes,
  listAdminUsers,
  runAdminSyncAction,
  seedGovtSchemesFromFile,
  setFarmerActive,
  updateAdminFertilizer,
  updateAdminScheme,
  type AdminSyncActionId,
} from '../services/adminDashboardService';

const admin = new Hono<{ Variables: AdminAuthVariables }>();

admin.post('/login', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const email = body.email?.trim() ?? '';
  const password = body.password ?? '';
  if (!email || !password) return appError(c, 'PASSWORD_REQUIRED');
  if (!verifyAdminCredentials(email, password)) return appError(c, 'INVALID_CREDENTIALS');

  const token = createAdminToken(email);
  return c.json({ token, email: email.toLowerCase() });
});

admin.use('*', adminSessionAuthMiddleware);

admin.get('/me', (c) => c.json({ email: c.get('adminEmail') }));

admin.get('/analytics', async (c) => {
  const data = await getAdminAnalytics();
  return c.json({ data });
});

admin.get('/users', async (c) => {
  const q = c.req.query('q') ?? undefined;
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 25);
  const result = await listAdminUsers({ q, page, limit });
  return c.json(result);
});

admin.get('/users/:id/farm', async (c) => {
  const data = await getAdminUserFarm(c.req.param('id'));
  if (!data) return appError(c, 'FARMER_NOT_FOUND');
  return c.json({ data });
});

admin.get('/crop-plantings', async (c) => {
  const q = c.req.query('q') ?? undefined;
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 40);
  const result = await listAdminCropPlantings({ q, page, limit });
  return c.json(result);
});

admin.patch('/users/:id', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { isActive?: boolean };
  if (typeof body.isActive !== 'boolean') {
    return c.json({ code: 'INVALID_BODY' }, 400);
  }
  const row = await setFarmerActive(c.req.param('id'), body.isActive);
  if (!row) return appError(c, 'FARMER_NOT_FOUND');
  return c.json({ data: row });
});

admin.get('/fertilizers', async (c) => {
  const search = c.req.query('search') ?? undefined;
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 25);
  const result = await listAdminFertilizers({ search, page, limit });
  return c.json(result);
});

admin.post('/fertilizers', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const brand = typeof body.brand === 'string' ? body.brand.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  if (!name || !brand || !category) return appError(c, 'NAME_REQUIRED');
  const row = await createAdminFertilizer({
    id: typeof body.id === 'string' ? body.id : undefined,
    name,
    brand,
    category,
    nameTe: typeof body.nameTe === 'string' ? body.nameTe : null,
    type: typeof body.type === 'string' ? body.type : null,
    npk: typeof body.npk === 'string' ? body.npk : null,
    dosage: typeof body.dosage === 'string' ? body.dosage : null,
    crop: typeof body.crop === 'string' ? body.crop : null,
    benefits: typeof body.benefits === 'string' ? body.benefits : null,
    description: typeof body.description === 'string' ? body.description : null,
    mrp: typeof body.mrp === 'string' ? body.mrp : null,
    price: typeof body.price === 'string' ? body.price : null,
    packSize: typeof body.packSize === 'string' ? body.packSize : null,
    source: typeof body.source === 'string' ? body.source : 'admin',
    isSubsidized: typeof body.isSubsidized === 'boolean' ? body.isSubsidized : true,
  });
  return c.json({ data: row }, 201);
});

admin.put('/fertilizers/:id', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const row = await updateAdminFertilizer(c.req.param('id'), {
    name: typeof body.name === 'string' ? body.name : undefined,
    brand: typeof body.brand === 'string' ? body.brand : undefined,
    category: typeof body.category === 'string' ? body.category : undefined,
    nameTe: typeof body.nameTe === 'string' ? body.nameTe : body.nameTe === null ? null : undefined,
    type: typeof body.type === 'string' ? body.type : body.type === null ? null : undefined,
    npk: typeof body.npk === 'string' ? body.npk : body.npk === null ? null : undefined,
    dosage: typeof body.dosage === 'string' ? body.dosage : body.dosage === null ? null : undefined,
    crop: typeof body.crop === 'string' ? body.crop : body.crop === null ? null : undefined,
    benefits:
      typeof body.benefits === 'string' ? body.benefits : body.benefits === null ? null : undefined,
    description:
      typeof body.description === 'string'
        ? body.description
        : body.description === null
          ? null
          : undefined,
    mrp: typeof body.mrp === 'string' ? body.mrp : body.mrp === null ? null : undefined,
    price: typeof body.price === 'string' ? body.price : body.price === null ? null : undefined,
    packSize:
      typeof body.packSize === 'string' ? body.packSize : body.packSize === null ? null : undefined,
    source: typeof body.source === 'string' ? body.source : undefined,
    isSubsidized: typeof body.isSubsidized === 'boolean' ? body.isSubsidized : undefined,
  });
  if (!row) return appError(c, 'FERTILIZER_NOT_FOUND');
  return c.json({ data: row });
});

admin.delete('/fertilizers/:id', async (c) => {
  const ok = await deleteAdminFertilizer(c.req.param('id'));
  if (!ok) return appError(c, 'FERTILIZER_NOT_FOUND');
  return c.json({ ok: true });
});

admin.get('/schemes', async (c) => {
  const status = c.req.query('status') ?? undefined;
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 50);
  const result = await listAdminSchemes({ status, page, limit });
  return c.json(result);
});

admin.post('/schemes/seed', async (c) => {
  try {
    const result = await seedGovtSchemesFromFile();
    return c.json({ ok: true, ...result });
  } catch {
    return appError(c, 'SERVER_ERROR');
  }
});

admin.post('/schemes', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const titleEn = typeof body.titleEn === 'string' ? body.titleEn.trim() : '';
  const titleTe = typeof body.titleTe === 'string' ? body.titleTe.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const region = typeof body.region === 'string' ? body.region.trim() : '';
  if (!titleEn || !titleTe || !category || !region) return appError(c, 'NAME_REQUIRED');
  const row = await createAdminScheme({
    id: typeof body.id === 'string' ? body.id : undefined,
    titleEn,
    titleTe,
    category,
    region,
    status: typeof body.status === 'string' ? body.status : 'active',
    amountEn: typeof body.amountEn === 'string' ? body.amountEn : '',
    amountTe: typeof body.amountTe === 'string' ? body.amountTe : '',
    benefitEn: typeof body.benefitEn === 'string' ? body.benefitEn : '',
    benefitTe: typeof body.benefitTe === 'string' ? body.benefitTe : '',
    eligibilityEn: typeof body.eligibilityEn === 'string' ? body.eligibilityEn : '',
    eligibilityTe: typeof body.eligibilityTe === 'string' ? body.eligibilityTe : '',
    howToApplyEn: typeof body.howToApplyEn === 'string' ? body.howToApplyEn : '',
    howToApplyTe: typeof body.howToApplyTe === 'string' ? body.howToApplyTe : '',
    applyUrl: typeof body.applyUrl === 'string' ? body.applyUrl : null,
    icon: typeof body.icon === 'string' ? body.icon : 'sprout',
    highlightsEn: Array.isArray(body.highlightsEn) ? (body.highlightsEn as string[]) : [],
    highlightsTe: Array.isArray(body.highlightsTe) ? (body.highlightsTe as string[]) : [],
    verifiedAt: typeof body.verifiedAt === 'string' ? body.verifiedAt : null,
  });
  return c.json({ data: row }, 201);
});

admin.put('/schemes/:id', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const row = await updateAdminScheme(c.req.param('id'), {
    titleEn: typeof body.titleEn === 'string' ? body.titleEn : undefined,
    titleTe: typeof body.titleTe === 'string' ? body.titleTe : undefined,
    category: typeof body.category === 'string' ? body.category : undefined,
    region: typeof body.region === 'string' ? body.region : undefined,
    status: typeof body.status === 'string' ? body.status : undefined,
    amountEn: typeof body.amountEn === 'string' ? body.amountEn : undefined,
    amountTe: typeof body.amountTe === 'string' ? body.amountTe : undefined,
    benefitEn: typeof body.benefitEn === 'string' ? body.benefitEn : undefined,
    benefitTe: typeof body.benefitTe === 'string' ? body.benefitTe : undefined,
    eligibilityEn: typeof body.eligibilityEn === 'string' ? body.eligibilityEn : undefined,
    eligibilityTe: typeof body.eligibilityTe === 'string' ? body.eligibilityTe : undefined,
    howToApplyEn: typeof body.howToApplyEn === 'string' ? body.howToApplyEn : undefined,
    howToApplyTe: typeof body.howToApplyTe === 'string' ? body.howToApplyTe : undefined,
    applyUrl:
      typeof body.applyUrl === 'string' ? body.applyUrl : body.applyUrl === null ? null : undefined,
    icon: typeof body.icon === 'string' ? body.icon : undefined,
    highlightsEn: Array.isArray(body.highlightsEn) ? (body.highlightsEn as string[]) : undefined,
    highlightsTe: Array.isArray(body.highlightsTe) ? (body.highlightsTe as string[]) : undefined,
    verifiedAt:
      typeof body.verifiedAt === 'string'
        ? body.verifiedAt
        : body.verifiedAt === null
          ? null
          : undefined,
  });
  if (!row) return appError(c, 'NOT_FOUND');
  return c.json({ data: row });
});

admin.delete('/schemes/:id', async (c) => {
  const ok = await deleteAdminScheme(c.req.param('id'));
  if (!ok) return appError(c, 'NOT_FOUND');
  return c.json({ ok: true });
});

admin.get('/updates', async (c) => {
  const data = await listAdminBroadcasts(40);
  return c.json({ data });
});

admin.post('/updates', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    title?: string;
    body?: string;
    type?: string;
  };
  if (!body.title?.trim() || !body.body?.trim()) return appError(c, 'NAME_REQUIRED');
  try {
    const row = await createAdminBroadcast({
      title: body.title,
      body: body.body,
      type: body.type,
      createdBy: c.get('adminEmail'),
    });
    return c.json({ data: row }, 201);
  } catch {
    return appError(c, 'SERVER_ERROR');
  }
});

admin.get('/sync', async (c) => {
  const limit = Number(c.req.query('limit') ?? 40);
  const data = await getAdminSyncStatus(limit);
  return c.json({ data });
});

admin.post('/sync/:action', async (c) => {
  const action = c.req.param('action') as AdminSyncActionId;
  const allowed: AdminSyncActionId[] = [
    'daily',
    'full',
    'fertilizers',
    'ag-catalog',
    'bulk-catalog',
    'publications',
    'places',
  ];
  if (!allowed.includes(action)) return appError(c, 'NOT_FOUND');
  try {
    const result = await runAdminSyncAction(action);
    return c.json({ ok: true, ...result });
  } catch {
    return appError(c, 'SERVER_ERROR');
  }
});

export { admin as adminRoutes };
