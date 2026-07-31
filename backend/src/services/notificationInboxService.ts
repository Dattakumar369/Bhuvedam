import { and, desc, eq } from 'drizzle-orm';

import { db } from '../db';
import { notifications } from '../db/schema/notifications';
import { pushTokens } from '../db/schema/pushTokens';
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

/** Low-cost cron: morning farm reminder to all registered devices */
export async function dispatchDailyFarmReminders(): Promise<{ farmers: number; sent: number }> {
  const rows = await db.select({ farmerId: pushTokens.farmerId }).from(pushTokens);
  const farmerIds = [...new Set(rows.map((r) => r.farmerId))];

  let sent = 0;
  for (const farmerId of farmerIds) {
    const result = await createAndPushNotification(farmerId, {
      type: 'crop_calendar',
      title: 'Bhuvedam — మీ పొలం update',
      body: 'Weather, mandi rates & crop alerts check cheyandi',
      data: { source: 'daily_cron' },
    });
    sent += result.pushSent;
  }

  return { farmers: farmerIds.length, sent };
}
