import { Expo, type ExpoPushMessage } from 'expo-server-sdk';
import { eq } from 'drizzle-orm';

import { db } from '../db';
import { pushTokens } from '../db/schema/pushTokens';

const expo = new Expo();

export async function getFarmerPushTokens(farmerId: string): Promise<string[]> {
  const rows = await db
    .select({ token: pushTokens.expoPushToken })
    .from(pushTokens)
    .where(eq(pushTokens.farmerId, farmerId));
  return rows.map((r) => r.token).filter((t) => Expo.isExpoPushToken(t));
}

export async function sendExpoPush(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<{ sent: number; failed: number }> {
  const valid = tokens.filter((t) => Expo.isExpoPushToken(t));
  if (!valid.length) return { sent: 0, failed: 0 };

  const messages: ExpoPushMessage[] = valid.map((to) => ({
    to,
    sound: 'default',
    title: title.slice(0, 200),
    body: body.slice(0, 500),
    data,
    channelId: 'farm-alerts',
  }));

  const chunks = expo.chunkPushNotifications(messages);
  let sent = 0;
  let failed = 0;

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      for (const ticket of tickets) {
        if (ticket.status === 'ok') sent += 1;
        else failed += 1;
      }
    } catch {
      failed += chunk.length;
    }
  }

  return { sent, failed };
}

export async function sendPushToFarmer(
  farmerId: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<{ sent: number; failed: number }> {
  const tokens = await getFarmerPushTokens(farmerId);
  return sendExpoPush(tokens, title, body, data);
}
