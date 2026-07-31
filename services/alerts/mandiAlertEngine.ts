import { MANDI_PRICE_CHANGE_THRESHOLD } from '@/constants/alertConfig';
import { MANDI_CROPS } from '@/constants/mandiCommodities';
import type { FarmAlert, MandiPriceSnapshot } from '@/types/alerts';
import type { MandiAnalytics } from '@/types/mandi';
import { generateId } from '@/utils/format';

export function snapshotFromAnalytics(analytics: MandiAnalytics[]): MandiPriceSnapshot[] {
  return analytics
    .filter((a) => a.currentModal > 0)
    .map((a) => ({
      cropId: a.cropId,
      varietyName: a.varietyName,
      price: a.currentModal,
      fetchedAt: new Date().toISOString(),
    }));
}

export function buildMandiPriceAlerts(
  current: MandiAnalytics[],
  previous: MandiPriceSnapshot[],
  farmerCropIds: string[],
): FarmAlert[] {
  if (!previous.length) return [];

  const cropFilter = farmerCropIds.length ? new Set(farmerCropIds) : null;
  const alerts: FarmAlert[] = [];

  for (const item of current) {
    if (cropFilter && !cropFilter.has(item.cropId)) continue;

    const prev = previous.find(
      (p) =>
        p.cropId === item.cropId &&
        (p.varietyName ?? '') === (item.varietyName ?? ''),
    );
    if (!prev || prev.price <= 0) continue;

    const changePct = ((item.currentModal - prev.price) / prev.price) * 100;
    if (Math.abs(changePct) < MANDI_PRICE_CHANGE_THRESHOLD) continue;

    const crop = MANDI_CROPS.find((c) => c.id === item.cropId);
    const up = changePct > 0;
    const variety = item.varietyName ? ` (${item.varietyName})` : '';

    alerts.push({
      id: generateId(),
      type: 'mandi_price',
      severity: Math.abs(changePct) >= 10 ? 'urgent' : 'warning',
      title: up ? `📈 ${crop?.name ?? item.commodity} rate perigindi` : `📉 ${crop?.name ?? item.commodity} rate taggindi`,
      body: `${item.commodity}${variety}: ₹${prev.price} → ₹${item.currentModal}/qtl (${up ? '+' : ''}${changePct.toFixed(1)}%)`,
      createdAt: new Date().toISOString(),
      read: false,
      data: {
        cropId: item.cropId,
        changePct,
        oldPrice: prev.price,
        newPrice: item.currentModal,
      },
    });
  }

  return alerts.slice(0, 5);
}
