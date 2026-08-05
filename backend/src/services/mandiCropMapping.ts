/** Agmarknet commodity → canonical app crop id (mirrors app constants/mandiCommodities.ts) */
const CROP_MANDI_SEARCH_TERMS: Record<string, string[]> = {
  rice: ['Paddy(Dhan)(Common)', 'Paddy', 'Rice'],
  wheat: ['Wheat'],
  cotton: ['Cotton'],
  soybean: ['Soyabean', 'Soybean'],
  tomato: ['Tomato'],
  sugarcane: ['Sugarcane'],
  maize: ['Maize'],
  chickpea: ['Bengal Gram(Gram)(Whole)', 'Bengal Gram', 'Gram'],
};

export function commodityToCropId(commodity: string): string | null {
  const text = commodity.toLowerCase().trim();
  if (!text) return null;

  for (const [cropId, terms] of Object.entries(CROP_MANDI_SEARCH_TERMS)) {
    for (const term of terms) {
      const t = term.toLowerCase();
      const head = t.split('(')[0]?.trim() ?? t;
      if (text.includes(head) || head.includes(text.split('(')[0]?.trim() ?? text)) {
        return cropId;
      }
    }
  }

  if (/paddy|dhan|\brice\b/.test(text)) return 'rice';
  if (/wheat/.test(text)) return 'wheat';
  if (/cotton/.test(text)) return 'cotton';
  if (/soy/.test(text)) return 'soybean';
  if (/tomato/.test(text)) return 'tomato';
  if (/sugarcane|ganna/.test(text)) return 'sugarcane';
  if (/maize|\bcorn\b/.test(text)) return 'maize';
  if (/gram|chickpea|bengal/.test(text)) return 'chickpea';
  return null;
}

export function normalizeMandiCropId(cropId: string, commodity: string): string {
  const fromCommodity = commodityToCropId(commodity);
  if (fromCommodity) return fromCommodity;
  if (cropId.startsWith('ag_')) {
    const fromSlug = commodityToCropId(cropId.replace(/^ag_/, '').replace(/_/g, ' '));
    if (fromSlug) return fromSlug;
  }
  return cropId;
}
