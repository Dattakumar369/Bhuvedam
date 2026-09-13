import { and, desc, eq, inArray } from 'drizzle-orm';

import { db } from '../db';
import { cropCalendar } from '../db/schema/cropCalendar';
import { crops } from '../db/schema/crops';
import { farmers } from '../db/schema/farmers';
import { notifications } from '../db/schema/notifications';
import { pushTokens } from '../db/schema/pushTokens';
import { dailyReminderCopy } from './notificationCopy';
import { sendPushToFarmer } from './pushNotificationService';

export async function registerPushToken(
  farmerId: string,
  expoPushToken: string,
  platform?: string,
): Promise<void> {
  const now = new Date();
  await db
    .insert(pushTokens)
    .values({ farmerId, expoPushToken, platform, updatedAt: now })
    .onConflictDoUpdate({
      target: pushTokens.expoPushToken,
      set: { farmerId, platform, updatedAt: now },
    });
}

export async function removePushToken(farmerId: string, expoPushToken: string): Promise<void> {
  await db
    .delete(pushTokens)
    .where(and(eq(pushTokens.farmerId, farmerId), eq(pushTokens.expoPushToken, expoPushToken)));
}

export async function listFarmerNotifications(farmerId: string, limit = 30) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.farmerId, farmerId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationRead(farmerId: string, notificationId: string): Promise<boolean> {
  const result = await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.farmerId, farmerId)))
    .returning({ id: notifications.id });
  return result.length > 0;
}

export async function markAllNotificationsRead(farmerId: string): Promise<number> {
  const result = await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.farmerId, farmerId), eq(notifications.isRead, false)))
    .returning({ id: notifications.id });
  return result.length;
}

export async function createAndPushNotification(
  farmerId: string,
  input: {
    type:
      | 'mandi_alert'
      | 'weather_alert'
      | 'spray_reminder'
      | 'fertilizer_reminder'
      | 'ai_insight'
      | 'crop_calendar';
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sendPush?: boolean;
  },
): Promise<{ notificationId: string; pushSent: number }> {
  const [row] = await db
    .insert(notifications)
    .values({
      farmerId,
      type: input.type,
      title: input.title.slice(0, 200),
      body: input.body,
      data: input.data ?? {},
    })
    .returning({ id: notifications.id });

  let pushSent = 0;
  if (input.sendPush !== false) {
    const result = await sendPushToFarmer(farmerId, input.title, input.body, {
      notificationId: row!.id,
      type: input.type,
      ...input.data,
    });
    pushSent = result.sent;
  }

  return { notificationId: row!.id, pushSent };
}

async function cropNamesForFarmer(farmerId: string, lang: string): Promise<string[]> {
  const calendar = await db
    .select({ cropId: cropCalendar.cropId })
    .from(cropCalendar)
    .where(eq(cropCalendar.farmerId, farmerId));
  const ids = [...new Set(calendar.map((r) => r.cropId))];
  if (!ids.length) return [];

  const rows = await db.select().from(crops).where(inArray(crops.id, ids));
  return rows.map((c) => {
    const localized = (c.localizedNames ?? {}) as Record<string, string>;
    if (localized[lang]) return localized[lang];
    if (lang === 'te' && c.nameTe) return c.nameTe;
    return c.name;
  });
}

/** Morning reminder — one message per farmer, in that farmer's language, mentioning their crops. */
export async function dispatchDailyFarmReminders(): Promise<{ farmers: number; sent: number }> {
  const rows = await db.select({ farmerId: pushTokens.farmerId }).from(pushTokens);
  const farmerIds = [...new Set(rows.map((r) => r.farmerId))];

  let sent = 0;
  for (const farmerId of farmerIds) {
    const [farmer] = await db
      .select({ language: farmers.language, name: farmers.name })
      .from(farmers)
      .where(eq(farmers.id, farmerId))
      .limit(1);
    const lang = farmer?.language ?? 'te';
    const cropNames = await cropNamesForFarmer(farmerId, lang);
    const copy = dailyReminderCopy(lang, cropNames);

    const result = await createAndPushNotification(farmerId, {
      type: 'crop_calendar',
      title: copy.title,
      body: copy.body,
      data: {
        source: 'daily_cron',
        language: lang,
        crops: cropNames,
        farmerName: farmer?.name ?? null,
      },
    });
    sent += result.pushSent;
  }

  return { farmers: farmerIds.length, sent };
}
