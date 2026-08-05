export interface MandiRateRecord {
  id: string;
  commodity: string;
  cropId: string;
  varietyId?: string;
  varietyName?: string;
  market: string;
  district: string;
  state: string;
  variety?: string;
  date: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  arrivalQty?: number;
  isLive?: boolean;
}

export interface DailyPricePoint {
  date: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface MandiAnalytics {
  cropId: string;
  varietyId?: string;
  varietyName?: string;
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
  dailySeries: DailyPricePoint[];
  unit: string;
  market: string;
  state: string;
  updatedAt: string;
  isLive: boolean;
  priceNote?: string;
  priceToday?: number | null;
  priceYesterday?: number | null;
  priceLastMonth?: number | null;
  priceLastYear?: number | null;
}

export interface PriceForecast {
  cropId: string;
  varietyId?: string;
  varietyName?: string;
  commodity: string;
  currentPrice: number;
  estimatedPrice: number;
  estimatedLow: number;
  estimatedHigh: number;
  targetDate: string;
  monthsAhead: number;
  confidence: 'high' | 'medium' | 'low';
  trendPercent: number;
  seasonalFactor: number;
  unit: string;
  factors: string[];
}

export interface MandiRatesBundle {
  rates: MandiRateRecord[];
  analytics: MandiAnalytics[];
  source: 'live' | 'cached' | 'estimated';
  fetchedAt: string;
}
