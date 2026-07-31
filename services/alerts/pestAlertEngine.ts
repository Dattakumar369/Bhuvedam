import type { FarmAlert } from '@/types/alerts';
import type { DigestItem } from '@/types/digest';
import { generateId } from '@/utils/format';

const CATEGORY_LABEL: Record<string, string> = {
  market: 'మార్కెట్',
  global: 'ప్రపంచం',
  pest: 'తégulu/rogalu',
  research: 'పరిశోధన',
};

export function buildPestAlertsFromDigest(
  items: DigestItem[],
  farmerCropIds: string[],
): FarmAlert[] {
  const pestItems = items.filter((i) => i.category === 'pest' || i.type === 'pest' || i.type === 'disease');
  if (!pestItems.length) return [];

  const alerts: FarmAlert[] = [];
  const seen = new Set<string>();

  for (const item of pestItems) {
    if (farmerCropIds.length && item.cropTags.length) {
      if (!item.cropTags.some((t) => farmerCropIds.includes(t))) continue;
    }

    const key = item.title.slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);

    const cropLabel = item.cropTags.join(', ') || 'general';
    alerts.push({
      id: generateId(),
      type: 'pest_risk',
      severity: item.type === 'disease' ? 'warning' : 'urgent',
      title: `${CATEGORY_LABEL.pest}: ${cropLabel}`,
      body: (item.summary ?? item.title).slice(0, 180),
      createdAt: item.updatedAt,
      read: false,
      data: { digestId: item.id, cropTags: item.cropTags, url: item.url },
    });

    if (alerts.length >= 3) break;
  }

  return alerts;
}

export function buildMarketNewsAlerts(items: DigestItem[]): FarmAlert[] {
  const marketItems = items.filter((i) => i.category === 'market').slice(0, 2);
  return marketItems.map((item) => ({
    id: generateId(),
    type: 'market_news',
    severity: 'info' as const,
    title: `మార్కెట్: ${item.title.slice(0, 60)}`,
    body: (item.summary ?? item.title).slice(0, 160),
    createdAt: item.updatedAt,
    read: false,
    data: { digestId: item.id, url: item.url },
  }));
}
