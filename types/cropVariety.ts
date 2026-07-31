export interface CropVariety {
  id: string;
  cropId: string;
  name: string;
  nameTe: string;
  /** Common local names farmers use */
  aliases: string[];
  /** Names used in Agmarknet / data.gov.in variety field */
  agmarknetNames: string[];
  duration: string;
  grainType: string;
  yieldPotential: string;
  sowingWindow: string;
  harvestWindow: string;
  /** Reference baseline ₹/quintal — ONLY used when live mandi API has no data for this variety */
  referenceBaselineQtl: number;
  /** How this variety's price typically compares to common paddy */
  priceNote: string;
  priceNoteTe: string;
  seedRate: string;
  fertilizerNotes: string[];
  fertilizerNotesTe: string[];
  sprayNotes: string[];
  sprayNotesTe: string[];
  diseaseSusceptibility: string[];
  specialCare: string[];
  specialCareTe: string[];
}

export interface VarietyMandiAnalytics {
  varietyId: string;
  varietyName: string;
  cropId: string;
  commodity: string;
  currentModal: number;
  previousModal: number;
  changeAmount: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  avg7d: number;
  avg30d: number;
  high30d: number;
  low30d: number;
  dailySeries: import('@/types/mandi').DailyPricePoint[];
  unit: string;
  market: string;
  state: string;
  agmarknetVariety?: string;
  updatedAt: string;
  isLive: boolean;
}
