import { and, desc, eq, gte, inArray, isNull, sql } from 'drizzle-orm';

import { db } from '../db';
import { cropCalendar } from '../db/schema/cropCalendar';
import { farmers, lands } from '../db/schema/farmers';
import { mandiPrices } from '../db/schema/mandiPrices';
import { notifications } from '../db/schema/notifications';
import { pushTokens } from '../db/schema/pushTokens';
import { weather } from '../db/schema/weather';
import { createAndPushNotification } from './notificationInboxService';
import { tNotif } from './notificationCopy';
import { getFarmerPushTokens } from './pushNotificationService';

const WEATHER_THRESHOLDS = {
  rainChancePercent: 60,
  heavyRainPercent: 80,
  heatTempC: 40,
  highWindKmh: 30,
} as const;

const MANDI_PRICE_CHANGE_THRESHOLD = 5;
const ALERT_DEDUPE_HOURS = 12;
const MAX_PUSH_PER_RUN = 3;

export interface PendingFarmAlert {
  alertKey: string;
  type: 'mandi_alert' | 'weather_alert' | 'crop_calendar';
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

async function getFarmerCropIds(farmerId: string): Promise<string[]> {
  const rows = await db
    .select({ cropId: cropCalendar.cropId })
    .from(cropCalendar)
    .where(eq(cropCalendar.farmerId, farmerId));
  return [...new Set(rows.map((r) => r.cropId))];
}

async function getFarmerLanguage(farmerId: string): Promise<string> {
  const [row] = await db
    .select({ language: farmers.language })
    .from(farmers)
    .where(eq(farmers.id, farmerId))
    .limit(1);
  return row?.language ?? 'te';
}

async function getFarmerLandContext(farmerId: string): Promise<{
  state: string | null;
  district: string | null;
}> {
  const [land] = await db
    .select({ state: lands.state, district: lands.district })
    .from(lands)
    .where(eq(lands.farmerId, farmerId))
    .limit(1);
  return { state: land?.state ?? null, district: land?.district ?? null };
}

async function getLatestWeatherRow(farmerId: string) {
  const [farmerRow] = await db
    .select()
    .from(weather)
    .where(eq(weather.farmerId, farmerId))
    .orderBy(desc(weather.fetchedAt))
    .limit(1);
  if (farmerRow) return farmerRow;

  // Prefer global snapshot matching farmer state/district label — never a random other farmer's row.
  const { state, district } = await getFarmerLandContext(farmerId);
  const [globalRows] = await Promise.all([
    db
      .select()
      .from(weather)
      .where(isNull(weather.farmerId))
      .orderBy(desc(weather.fetchedAt))
      .limit(40),
  ]);

  const needle = `${district ?? ''} ${state ?? ''}`.toLowerCase();
  if (needle.trim()) {
    const match = globalRows.find((r) => {
      const label = `${r.locationName ?? ''}`.toLowerCase();
      return (
        (district && label.includes(district.toLowerCase())) ||
        (state && label.includes(state.toLowerCase().split(' ')[0] ?? ''))
      );
    });
    if (match) return match;
  }

  // Hyderabad is the default AP/TG snapshot used by weather sync.
  return (
    globalRows.find((r) => `${r.locationName ?? ''}`.toLowerCase().includes('hyderabad')) ??
    globalRows[0] ??
    null
  );
}

function buildWeatherAlerts(
  row: typeof weather.$inferSelect,
  lang: string,
): PendingFarmAlert[] {
  const alerts: PendingFarmAlert[] = [];
  const temp = Number(row.temperature ?? 0);
  const rain = Number(row.precipitation ?? 0);
  const wind = Number(row.windSpeed ?? 0);
  const hourly = (row.hourly ?? []) as Array<{ precipitation?: number }>;
  const maxHourlyRain = hourly
    .slice(0, 8)
    .reduce((max, h) => Math.max(max, Number(h.precipitation ?? 0)), 0);
  const maxRain = Math.max(rain, maxHourlyRain);

  if (maxRain >= WEATHER_THRESHOLDS.heavyRainPercent) {
    alerts.push({
      alertKey: `weather-heavy-rain-${row.locationName}`,
      type: 'weather_alert',
      title: tNotif(lang, 'heavyRainTitle'),
      body: tNotif(lang, 'heavyRainBody', { rain: maxRain }),
      data: { rainPercent: maxRain, source: 'realtime_cron', language: lang },
    });
  } else if (maxRain >= WEATHER_THRESHOLDS.rainChancePercent) {
    alerts.push({
      alertKey: `weather-rain-${row.locationName}`,
      type: 'weather_alert',
      title: tNotif(lang, 'rainTitle'),
      body: tNotif(lang, 'rainBody', { rain: maxRain }),
      data: { rainPercent: maxRain, source: 'realtime_cron', language: lang },
    });
  }

  if (temp >= WEATHER_THRESHOLDS.heatTempC) {
    alerts.push({
      alertKey: `weather-heat-${row.locationName}-${Math.round(temp)}`,
      type: 'weather_alert',
      title: tNotif(lang, 'heatTitle'),
      body: tNotif(lang, 'heatBody', { temp }),
      data: { tempC: temp, source: 'realtime_cron', language: lang },
    });
  }

  if (wind >= WEATHER_THRESHOLDS.highWindKmh) {
    alerts.push({
      alertKey: `weather-wind-${row.locationName}`,
      type: 'weather_alert',
      title: tNotif(lang, 'windTitle'),
      body: tNotif(lang, 'windBody', { wind: wind.toFixed(0) }),
      data: { windKmh: wind, source: 'realtime_cron', language: lang },
    });
  }

  return alerts;
}

async function buildMandiAlerts(
  cropIds: string[],
  lang: string,
  state: string | null,
  district: string | null,
): Promise<PendingFarmAlert[]> {
  if (!cropIds.length) return [];

  const alerts: PendingFarmAlert[] = [];

  for (const cropId of cropIds.slice(0, 6)) {
    const conditions = [eq(mandiPrices.cropId, cropId)];
    if (state) conditions.push(eq(mandiPrices.state, state));
    if (district) conditions.push(eq(mandiPrices.district, district));

    let [latest] = await db
      .select()
      .from(mandiPrices)
      .where(and(...conditions))
      .orderBy(desc(mandiPrices.fetchedAt))
      .limit(1);

    // Fall back to state-only, then any market for that crop.
    if (!latest && district && state) {
      [latest] = await db
        .select()
        .from(mandiPrices)
        .where(and(eq(mandiPrices.cropId, cropId), eq(mandiPrices.state, state)))
        .orderBy(desc(mandiPrices.fetchedAt))
        .limit(1);
    }
    if (!latest) {
      [latest] = await db
        .select()
        .from(mandiPrices)
        .where(eq(mandiPrices.cropId, cropId))
        .orderBy(desc(mandiPrices.fetchedAt))
        .limit(1);
    }
    if (!latest) continue;

    const [older] = await db
      .select()
      .from(mandiPrices)
      .where(
        and(
          eq(mandiPrices.cropId, cropId),
          eq(mandiPrices.market, latest.market),
          sql`${mandiPrices.fetchedAt} < ${latest.fetchedAt} - interval '20 hours'`,
        ),
      )
      .orderBy(desc(mandiPrices.fetchedAt))
      .limit(1);
    if (!older) continue;

    const newPrice = Number(latest.modalPrice);
    const oldPrice = Number(older.modalPrice);
    if (!newPrice || !oldPrice) continue;

    const changePct = ((newPrice - oldPrice) / oldPrice) * 100;
    if (Math.abs(changePct) < MANDI_PRICE_CHANGE_THRESHOLD) continue;

    const up = changePct > 0;
    const variety = latest.varietyName ? ` (${latest.varietyName})` : '';
    const change = `${up ? '+' : ''}${changePct.toFixed(1)}`;
    alerts.push({
      alertKey: `mandi-${cropId}-${latest.market}-${latest.varietyName ?? 'default'}-${up ? 'up' : 'down'}`,
      type: 'mandi_alert',
      title: tNotif(lang, up ? 'mandiUpTitle' : 'mandiDownTitle', {
        crop: latest.commodity,
      }),
      body: tNotif(lang, 'mandiBody', {
        crop: latest.commodity,
        variety,
        old: oldPrice,
        new: newPrice,
        change,
      }),
      data: {
        cropId,
        changePct,
        oldPrice,
        newPrice,
        market: latest.market,
        district: latest.district,
        state: latest.state,
        source: 'realtime_cron',
        language: lang,
      },
    });
  }

  return alerts.slice(0, 5);
}

async function wasAlertSentRecently(farmerId: string, alertKey: string): Promise<boolean> {
  const since = new Date(Date.now() - ALERT_DEDUPE_HOURS * 60 * 60 * 1000);
  const rows = await db
    .select({ data: notifications.data })
    .from(notifications)
    .where(and(eq(notifications.farmerId, farmerId), gte(notifications.createdAt, since)));

  return rows.some((r) => (r.data as Record<string, unknown> | null)?.alertKey === alertKey);
}

export async function collectPendingAlertsForFarmer(farmerId: string): Promise<PendingFarmAlert[]> {
  const [cropIds, lang, land] = await Promise.all([
    getFarmerCropIds(farmerId),
    getFarmerLanguage(farmerId),
    getFarmerLandContext(farmerId),
  ]);
  const weatherRow = await getLatestWeatherRow(farmerId);
  const weatherAlerts = weatherRow ? buildWeatherAlerts(weatherRow, lang) : [];
  const mandiAlerts = await buildMandiAlerts(cropIds, lang, land.state, land.district);
  return [...weatherAlerts, ...mandiAlerts];
}

export async function dispatchRealtimeAlertsForFarmer(
  farmerId: string,
): Promise<{ pushed: number; candidates: number }> {
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
      sendPush: true,
    });
    pushed += result.pushSent;
  }

  return { pushed, candidates: pending.length };
}

export async function dispatchRealtimeAlertsForAll(): Promise<{
  farmers: number;
  pushed: number;
  candidates: number;
}> {
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

/** Push only farmers who grow any of the crops that had fresh mandi sync. */
export async function dispatchMandiAlertsAfterSync(cropIds: string[]): Promise<{ pushed: number }> {
  if (!cropIds.length) return { pushed: 0 };

  const calendarRows = await db
    .select({ farmerId: cropCalendar.farmerId })
    .from(cropCalendar)
    .where(inArray(cropCalendar.cropId, cropIds));

  const farmerIds = [...new Set(calendarRows.map((r) => r.farmerId))];
  let pushed = 0;

  for (const farmerId of farmerIds) {
    const result = await dispatchRealtimeAlertsForFarmer(farmerId);
    pushed += result.pushed;
  }

  return { pushed };
}
