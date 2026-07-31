import { CROPS } from '@/constants/crops';
import type { FarmAlert } from '@/types/alerts';
import { generateId } from '@/utils/format';

const MONTH_NAMES = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

const MONTH_ALIASES: Record<number, string[]> = {
  0: ['jan', 'january'],
  1: ['feb', 'february'],
  2: ['mar', 'march'],
  3: ['apr', 'april'],
  4: ['may'],
  5: ['jun', 'june'],
  6: ['jul', 'july'],
  7: ['aug', 'august'],
  8: ['sep', 'sept', 'september'],
  9: ['oct', 'october'],
  10: ['nov', 'november'],
  11: ['dec', 'december'],
};

function periodMatchesMonth(period: string, monthIndex: number): boolean {
  const lower = period.toLowerCase();
  const aliases = MONTH_ALIASES[monthIndex] ?? [];
  if (aliases.some((a) => lower.includes(a))) return true;

  const rangeMatch = lower.match(/(\w+)\s*[-–to]+\s*(\w+)/);
  if (!rangeMatch) return false;

  const startIdx = MONTH_NAMES.findIndex((m) => rangeMatch[1]?.includes(m.slice(0, 3)));
  const endIdx = MONTH_NAMES.findIndex((m) => rangeMatch[2]?.includes(m.slice(0, 3)));
  if (startIdx < 0 || endIdx < 0) return false;

  if (startIdx <= endIdx) return monthIndex >= startIdx && monthIndex <= endIdx;
  return monthIndex >= startIdx || monthIndex <= endIdx;
}

function seasonWindowAlert(cropId: string, kind: 'sowing' | 'harvest'): FarmAlert | null {
  const crop = CROPS.find((c) => c.id === cropId);
  if (!crop) return null;

  const month = new Date().getMonth();
  const period = kind === 'sowing' ? crop.sowingPeriod : crop.harvestPeriod;
  if (!period || !periodMatchesMonth(period, month)) return null;

  const isSowing = kind === 'sowing';
  return {
    id: generateId(),
    type: isSowing ? 'crop_sowing' : 'crop_harvest',
    severity: isSowing ? 'info' : 'warning',
    title: isSowing ? `${crop.nameTe} — విత్తన కాలం` : `${crop.nameTe} — కోత కాలం`,
    body: isSowing
      ? `ఈ నెల ${crop.name} (${crop.nameTe}) విత్తడానికి సమయం. విత్తన కాలం: ${crop.sowingPeriod}`
      : `ఈ నెల ${crop.name} (${crop.nameTe}) కోత కాలం. Harvest: ${crop.harvestPeriod}`,
    createdAt: new Date().toISOString(),
    read: false,
    data: { cropId: crop.id, kind },
  };
}

export function buildCropCalendarAlerts(farmerCropIds: string[]): FarmAlert[] {
  const alerts: FarmAlert[] = [];
  const seen = new Set<string>();

  for (const cropId of farmerCropIds) {
    for (const kind of ['sowing', 'harvest'] as const) {
      const key = `${cropId}-${kind}`;
      if (seen.has(key)) continue;
      const alert = seasonWindowAlert(cropId, kind);
      if (alert) {
        seen.add(key);
        alerts.push(alert);
      }
    }
  }

  return alerts;
}
