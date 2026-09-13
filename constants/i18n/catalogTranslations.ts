import type { LanguageCode } from '@/constants/languages';
import type { FertilizerCategory } from '@/types/fertilizerProduct';

export interface CatalogBrowseCopy {
  fertilizersTitle: string;
  fertilizersSubtitle: string;
  fertilizersBanner: string;
  fertilizersSearch: string;
  fertilizersPricesLabel: string;
  fertilizersSource: string;
  fertilizersOfflineSource: string;
  pesticidesTitle: string;
  pesticidesSubtitle: string;
  pesticidesSearch: string;
  pesticidesSource: string;
  pesticidesTargetLabel: string;
  pesticidesRefLabel: string;
  fungicidesTitle: string;
  fungicidesSubtitle: string;
  fungicidesSearch: string;
  fungicidesSource: string;
  fungicidesTargetLabel: string;
  fungicidesRefLabel: string;
  categoryLabel: string;
  brandLabel: string;
  cropLabel: string;
  allBrands: string;
  allCrops: string;
  loading: string;
  productsCount: (n: number) => string;
  emptyTitle: string;
  emptyHint: string;
  offline: string;
  category: (id: FertilizerCategory | string) => string;
}

const FERT_CAT_EN: Record<string, string> = {
  all: 'All',
  Nitrogen: 'Nitrogen',
  Phosphatic: 'Phosphatic',
  Potassic: 'Potassic',
  'NPK Complex': 'NPK Complex',
  Nano: 'Nano',
  Micronutrient: 'Micronutrient',
  'Bio-fertilizer': 'Bio-fertilizer',
  Organic: 'Organic',
};

const FERT_CAT_HI: Record<string, string> = {
  all: 'सभी',
  Nitrogen: 'नाइट्रोजन',
  Phosphatic: 'फॉस्फेटिक',
  Potassic: 'पोटाश',
  'NPK Complex': 'NPK कॉम्प्लेक्स',
  Nano: 'नैनो',
  Micronutrient: 'सूक्ष्म पोषक',
  'Bio-fertilizer': 'बायो-उर्वरक',
  Organic: 'जैविक',
};

const FERT_CAT_TE: Record<string, string> = {
  all: 'అన్నీ',
  Nitrogen: 'నత్రజని',
  Phosphatic: 'భాస్వరం',
  Potassic: 'పొటాష్',
  'NPK Complex': 'NPK',
  Nano: 'నానో',
  Micronutrient: 'సూక్ష్మ',
  'Bio-fertilizer': 'బయో',
  Organic: 'సేంద్రియ',
};

const en: CatalogBrowseCopy = {
  fertilizersTitle: 'Fertilizers',
  fertilizersSubtitle: 'Urea, DAP, NPK, Nano — find the right fertilizer for your crop',
  fertilizersBanner:
    'DoF statutory urea + NBS notified bag MRPs · dose & when to apply. Verify pack / POS price.',
  fertilizersSearch: 'Search by name — Urea, DAP, Nano...',
  fertilizersPricesLabel: 'Fertilizer prices',
  fertilizersSource: 'IFFCO · Coromandel · NFL — official grades',
  fertilizersOfflineSource: 'Offline — sync fertilizer catalog',
  pesticidesTitle: 'Pesticides',
  pesticidesSubtitle: 'Bollworm, BPH, Aphids — find the right insecticide for your crop',
  pesticidesSearch: 'Search — Monocil, Confidor, Imidacloprid...',
  pesticidesSource: 'CIB&RC insecticides — reference catalog',
  pesticidesTargetLabel: 'Pest',
  pesticidesRefLabel: 'Pesticide reference',
  fungicidesTitle: 'Fungicides',
  fungicidesSubtitle: 'Blight, Mildew, Rust — find fungicides for disease control',
  fungicidesSearch: 'Search — Mancozeb, Carbendazim, Tricyclazole...',
  fungicidesSource: 'CIB&RC fungicide actives — dose & target',
  fungicidesTargetLabel: 'Disease',
  fungicidesRefLabel: 'Fungicide reference',
  categoryLabel: 'Category',
  brandLabel: 'Brand',
  cropLabel: 'Crop',
  allBrands: 'All brands',
  allCrops: 'All crops',
  loading: 'Loading...',
  productsCount: (n) => `${n} products`,
  emptyTitle: 'No products found',
  emptyHint: 'Try a different search or filter',
  offline: 'Offline',
  category: (id) => FERT_CAT_EN[id] ?? id,
};

const hi: CatalogBrowseCopy = {
  fertilizersTitle: 'उर्वरक',
  fertilizersSubtitle: 'यूरिया, DAP, NPK, नैनो — अपनी फसल के सही उर्वरक देखें',
  fertilizersBanner:
    'DoF वैधानिक यूरिया + NBS अधिसूचित बैग MRP · मात्रा व कब डालें। पैक / POS पर कीमत जाँचें।',
  fertilizersSearch: 'नाम से खोजें — यूरिया, DAP, नैनो...',
  fertilizersPricesLabel: 'उर्वरक कीमतें',
  fertilizersSource: 'IFFCO · Coromandel · NFL — आधिकारिक ग्रेड',
  fertilizersOfflineSource: 'ऑफ़लाइन — कैटलॉग सिंक करें',
  pesticidesTitle: 'कीटनाशक',
  pesticidesSubtitle: 'बॉलवर्म, BPH, एफिड — फसल के सही कीटनाशक देखें',
  pesticidesSearch: 'खोजें — Monocil, Confidor, Imidacloprid...',
  pesticidesSource: 'CIB&RC कीटनाशक — संदर्भ कैटलॉग',
  pesticidesTargetLabel: 'कीट',
  pesticidesRefLabel: 'कीटनाशक संदर्भ',
  fungicidesTitle: 'फफूंदनाशक',
  fungicidesSubtitle: 'ब्लाइट, मिल्ड्यू, रस्ट — रोग नियंत्रण के लिए देखें',
  fungicidesSearch: 'खोजें — Mancozeb, Carbendazim...',
  fungicidesSource: 'CIB&RC फफूंदनाशक — मात्रा व लक्ष्य',
  fungicidesTargetLabel: 'रोग',
  fungicidesRefLabel: 'फफूंदनाशक संदर्भ',
  categoryLabel: 'श्रेणी',
  brandLabel: 'ब्रांड',
  cropLabel: 'फसल',
  allBrands: 'सभी ब्रांड',
  allCrops: 'सभी फसलें',
  loading: 'लोड हो रहा है...',
  productsCount: (n) => `${n} उत्पाद`,
  emptyTitle: 'कोई उत्पाद नहीं मिला',
  emptyHint: 'दूसरा खोज या फ़िल्टर आज़माएँ',
  offline: 'ऑफ़लाइन',
  category: (id) => FERT_CAT_HI[id] ?? id,
};

const te: CatalogBrowseCopy = {
  fertilizersTitle: 'ఎరువులు',
  fertilizersSubtitle: 'యూరియా, DAP, NPK, నానో — మీ పంటకు సరైన ఎరువులు చూడండి',
  fertilizersBanner:
    'DoF యూరియా + NBS బ్యాగ్ MRP · మోతాదు & ఎప్పుడు వేయాలి. ప్యాక్ / POS ధర నిర్ధారించండి.',
  fertilizersSearch: 'పేరుతో వెతకండి — యూరియా, DAP, నానో...',
  fertilizersPricesLabel: 'ఎరువు ధరలు',
  fertilizersSource: 'IFFCO · Coromandel · NFL — అధికారిక గ్రేడ్‌లు',
  fertilizersOfflineSource: 'ఆఫ్‌లైన్ — కేటలాగ్ సింక్ చేయండి',
  pesticidesTitle: 'కీటకనాశినులు',
  pesticidesSubtitle: 'బాల్‌వార్మ్, BPH, అఫిడ్స్ — మీ పంటకు సరైన మందులు చూడండి',
  pesticidesSearch: 'వెతకండి — Monocil, Confidor, Imidacloprid...',
  pesticidesSource: 'CIB&RC కీటకనాశినులు — రిఫరెన్స్ కేటలాగ్',
  pesticidesTargetLabel: 'పురుగు',
  pesticidesRefLabel: 'కీటకనాశిని రిఫరెన్స్',
  fungicidesTitle: 'శిలీంధ్ర నాశినులు',
  fungicidesSubtitle: 'బ్లైట్, మిల్డ్యూ, రస్ట్ — రోగ నివారణ మందులు చూడండి',
  fungicidesSearch: 'వెతకండి — Mancozeb, Carbendazim...',
  fungicidesSource: 'CIB&RC శిలీంధ్ర నాశినులు — మోతాదు & లక్ష్యం',
  fungicidesTargetLabel: 'రోగం',
  fungicidesRefLabel: 'శిలీంధ్ర నాశిని రిఫరెన్స్',
  categoryLabel: 'రకం',
  brandLabel: 'బ్రాండ్',
  cropLabel: 'పంట',
  allBrands: 'అన్ని బ్రాండ్‌లు',
  allCrops: 'అన్ని పంటలు',
  loading: 'లోడ్ అవుతోంది...',
  productsCount: (n) => `${n} ఉత్పత్తులు`,
  emptyTitle: 'ఉత్పత్తులు కనిపించలేదు',
  emptyHint: 'వేరే సెర్చ్ లేదా ఫిల్టర్ ప్రయత్నించండి',
  offline: 'ఆఫ్‌లైన్',
  category: (id) => FERT_CAT_TE[id] ?? id,
};

const BY_LANG: Partial<Record<LanguageCode, CatalogBrowseCopy>> = {
  en,
  hi,
  te,
  mr: hi,
  ta: te,
  kn: te,
};

export function getCatalogBrowseCopy(language: LanguageCode): CatalogBrowseCopy {
  return BY_LANG[language] ?? en;
}

export function categoryLabelForLang(language: LanguageCode, category: string): string {
  return getCatalogBrowseCopy(language).category(category);
}
