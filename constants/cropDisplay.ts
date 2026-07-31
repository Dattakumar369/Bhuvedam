import { getFarmTranslations } from '@/constants/i18n/farmTranslations';

/** Simple Telugu labels for farmers — no English jargon on main screens */
export const CROP_TELUGU: Record<string, string> = {
  rice: 'వరి',
  cotton: 'పత్తి',
  wheat: 'గోధుమ',
  soybean: 'సోయాబీన్',
  maize: 'మొక్కజొన్న',
  tomato: 'టమాట',
  chilli: 'మిరప',
  groundnut: 'వేరుశనగ',
  sugarcane: 'చెరకు',
  onion: 'ఉల్లి',
  potato: 'బంగాళాదుంప',
  sunflower: 'పువ్వు గింజ',
};

export function cropTeluguLabel(cropId: string, englishName: string, nameTe?: string): string {
  if (nameTe) return nameTe;
  return CROP_TELUGU[cropId] ?? englishName;
}

/** @deprecated Use getFarmTranslations(language) */
export const FARM_SETUP_STEPS = getFarmTranslations('te').setupSteps;

export const SEASON_TELUGU: Record<string, string> = {
  all: 'అన్ని',
  kharif: 'ఖరీఫ్',
  rabi: 'రబీ',
  'year-round': 'అన్ని కాలాలు',
};

export const SEASON_EN: Record<string, string> = {
  all: 'All',
  kharif: 'Kharif',
  rabi: 'Rabi',
  'year-round': 'Year round',
};
