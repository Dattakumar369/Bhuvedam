import type { LanguageCode } from '@/constants/languages';
import { hiFarm } from '@/constants/i18n/locales/hiFarm';
import { mrFarm } from '@/constants/i18n/locales/mrFarm';
import { taFarm } from '@/constants/i18n/locales/taFarm';
import { knFarm } from '@/constants/i18n/locales/knFarm';

export interface FarmSetupStepCopy {
  title: string;
  hint: string;
}

export interface FarmTranslations {
  cropTabTitle: string;
  cropTabSubtitle: string;
  myFarm: string;
  welcome: string;
  welcomeEdit: string;
  welcomeHint: string;
  welcomeHintNew: string;
  edit: string;
  cancel: string;
  crops: string;
  address: string;
  soil: string;
  schemesLink: string;
  lockedMessage: string;
  myCropInfo: string;
  showOtherCrops: string;
  hideOtherCrops: string;
  searchCrops: string;
  noCropFound: string;
  stepCount: (current: number, total: number) => string;
  setupSteps: readonly FarmSetupStepCopy[];
  back: string;
  next: string;
  saving: string;
  saveChanges: string;
  saveComplete: string;
  cropSearchHint: (count: number) => string;
  cropSearchPlaceholder: string;
  cropsSelected: (count: number) => string;
  cropsLoading: string;
  noCropMatch: string;
  district: string;
  mandal: string;
  village: string;
  state: string;
  districtPh: string;
  mandalPh: string;
  villagePh: string;
  statePh: string;
  addressRequiredHint: string;
  gpsFillAddress: string;
  gpsFillLoading: string;
  gpsFillFailed: string;
  placeSearchPlaceholder: string;
  placeSearchLoading: string;
  placeSearchNoResults: string;
  placeSearchHint: string;
  acres: string;
  cents: string;
  centsOptional: string;
  variety: string;
  varietyPh: string;
  quickPick: string;
  sowingMonth: string;
  year: string;
  acresShort: string;
  centsShort: string;
  soilLoading: string;
  soilPh: (ph: number) => string;
}

const enFarm: FarmTranslations = {
  cropTabTitle: 'My Farm',
  cropTabSubtitle: 'Your details & crop information',
  myFarm: 'My Farm ✓',
  welcome: 'Welcome!',
  welcomeEdit: 'Your farm details',
  welcomeHint: 'Make changes below and save',
  welcomeHintNew: '4 steps — crop details, address, soil. Field measure is on the home screen.',
  edit: 'Edit',
  cancel: 'Cancel',
  crops: 'Crops',
  address: 'Address',
  soil: 'Soil',
  schemesLink: 'View government schemes',
  lockedMessage: 'Complete all 4 steps above first — then your crop information will appear',
  myCropInfo: 'Your crop information',
  showOtherCrops: 'Browse other crop information',
  hideOtherCrops: 'Hide',
  searchCrops: 'Search — rice, cotton, chilli...',
  noCropFound: 'No crop found — try another name',
  stepCount: (c, t) => `Step ${c} / ${t}`,
  setupSteps: [
    { title: 'Your crops', hint: 'Tap the crops you grow — 60+ crops available' },
    { title: 'Crop details', hint: 'For each crop — acres, variety, sowing month' },
    { title: 'Address', hint: 'District, mandal, village, state — needed for mandi & weather' },
    { title: 'Soil', hint: 'Your field soil type (select if you know)' },
  ],
  back: 'Back',
  next: 'Next →',
  saving: 'Saving...',
  saveChanges: 'Save changes',
  saveComplete: '✓ Complete — Save',
  cropSearchHint: (n) => `${n} crops — search in English or Telugu`,
  cropSearchPlaceholder: 'Search — rice, vari, cotton, mirchi...',
  cropsSelected: (n) => `✓ ${n} crop(s) selected — you can add more`,
  cropsLoading: 'Loading crops...',
  noCropMatch: 'No crop matched — try another name',
  district: 'District *',
  mandal: 'Mandal *',
  village: 'Village *',
  state: 'State *',
  districtPh: 'e.g. Guntur, Kurnool',
  mandalPh: 'e.g. Tenali, Nandigama',
  villagePh: 'e.g. Pedakurapadu',
  statePh: 'Andhra Pradesh / Telangana',
  addressRequiredHint: 'Fill all fields for accurate mandi rates & weather',
  gpsFillAddress: 'Use GPS — fill village',
  gpsFillLoading: 'Getting GPS location…',
  gpsFillFailed: 'Could not get location — check GPS permission',
  placeSearchPlaceholder: 'Search village or place…',
  placeSearchLoading: 'Searching places…',
  placeSearchNoResults: 'No places found — try another spelling',
  placeSearchHint: 'Type village name and pick from the list',
  acres: 'Acres *',
  cents: 'Cents (optional)',
  centsOptional: 'Cents (optional)',
  variety: 'Variety *',
  varietyPh: 'e.g. BPT 5204, Swarna',
  quickPick: 'Quick pick:',
  sowingMonth: 'When did you sow? (month)',
  year: 'Year',
  acresShort: 'ac',
  centsShort: 'c',
  soilLoading: 'Loading soil details...',
  soilPh: (ph) => `Soil pH: ${ph} (location based)`,
};

const teFarm: FarmTranslations = {
  cropTabTitle: 'నా పొలం',
  cropTabSubtitle: 'మీ వివరాలు + పంట సమాచారం',
  myFarm: 'నా పొలం ✓',
  welcome: 'స్వాగతం!',
  welcomeEdit: 'మీ పొలం వివరాలు',
  welcomeHint: 'కింద మార్పులు చేసి సేవ్ చేయండి',
  welcomeHintNew: '4 అడుగులు — పంట వివరాలు, చిరునామా, నేల. పొలం కొలత home screen లో వేరుగా ఉంది.',
  edit: 'మార్చు',
  cancel: 'రద్దు',
  crops: 'పంటలు',
  address: 'చిరునామా',
  soil: 'నేల',
  schemesLink: 'ప్రభుత్వ పథకాలు చూడండి',
  lockedMessage: 'ముందు పై 4 అడుగులు పూర్తి చేయండి — తర్వాత మీ పంట సమాచారం కనిపిస్తుంది',
  myCropInfo: 'మీ పంటల సమాచారం',
  showOtherCrops: 'ఇతర పంటల సమాచారం చూడండి',
  hideOtherCrops: 'మూసివేయండి',
  searchCrops: 'వెతకండి — వరి, పత్తి, మిరప...',
  noCropFound: 'పంట కనిపించలేదు — మరొక పేరు ప్రయత్నించండి',
  stepCount: (c, t) => `అడుగు ${c} / ${t}`,
  setupSteps: [
    { title: 'మీ పంటలు', hint: 'మీరు పండించే పంటలను ఎంచుకోండి — 60+ పంటలు ఉన్నాయి' },
    { title: 'పంట వివరాలు', hint: 'ప్రతి పంటకు — ఎకరాలు, రకం, ఎప్పుడు వేశారో నెల' },
    { title: 'చిరునామా', hint: 'జిల్లా, మండలం, గ్రామం, రాష్ట్రం — మండి & వాతావరణం కోసం' },
    { title: 'నేల', hint: 'మీ పొలం నేల రకం (తెలిస్తే ఎంచుకోండి)' },
  ],
  back: 'వెనక',
  next: 'తర్వాత →',
  saving: 'సేవ్ చేస్తున్నాం...',
  saveChanges: 'మార్పులు సేవ్',
  saveComplete: '✓ పూర్తి — సేవ్',
  cropSearchHint: (n) => `${n} పంటలు — తెలుగు లేదా English లో వెతకండి`,
  cropSearchPlaceholder: 'వెతకండి — vari, వరి, cotton, మిరప...',
  cropsSelected: (n) => `✓ ${n} పంట(లు) ఎంచుకున్నారు — మరింత చేర్చవచ్చు`,
  cropsLoading: 'పంటలు లోడ్ అవుతున్నాయి...',
  noCropMatch: 'ఈ పేరుతో పంట కనిపించలేదు — మరొక పేరు ప్రయత్నించండి',
  district: 'జిల్లా *',
  mandal: 'మండలం *',
  village: 'గ్రామం *',
  state: 'రాష్ట్రం *',
  districtPh: 'ఉదా: గుంటూరు, కర్నూలు',
  mandalPh: 'ఉదా: తెనాలి, నందిగామ',
  villagePh: 'ఉదా: పెదకూరపాడు',
  statePh: 'ఆంధ్ర ప్రదేశ్ / తెలంగాణ',
  addressRequiredHint: 'మండి ధరలు మరియు వాతావరణం సరిగా రావాలి — అన్నీ పూరించండి',
  gpsFillAddress: 'GPS — గ్రామం auto fill',
  gpsFillLoading: 'GPS location తీసుకుంటున్నాం…',
  gpsFillFailed: 'Location రాలేదు — GPS permission చూడండి',
  placeSearchPlaceholder: 'గ్రామం / place వెతకండి…',
  placeSearchLoading: 'Places search…',
  placeSearchNoResults: 'ఏ place కనిపించలేదు — spelling మార్చండి',
  placeSearchHint: 'Gramam peru type chesi list nundi select cheyandi',
  acres: 'ఎకరాలు *',
  cents: 'సెంట్లు (ఐచ్ఛికం)',
  centsOptional: 'సెంట్లు (ఐచ్ఛికం)',
  variety: 'పంట రకం *',
  varietyPh: 'ఉదా: BPT 5204, Swarna',
  quickPick: 'త్వరగా ఎంచుకోండి:',
  sowingMonth: 'ఎప్పుడు వేశారు? (నెల)',
  year: 'సంవత్సరం',
  acresShort: 'ఎ',
  centsShort: 'సె',
  soilLoading: 'నేల వివరాలు లోడ్ అవుతున్నాయి...',
  soilPh: (ph) => `నేల pH: ${ph} (స్థానం ఆధారంగా)`,
};

export const FARM_TRANSLATIONS: Record<LanguageCode, FarmTranslations> = {
  en: enFarm,
  te: teFarm,
  hi: hiFarm,
  mr: mrFarm,
  ta: taFarm,
  kn: knFarm,
};

export function getFarmTranslations(language: LanguageCode): FarmTranslations {
  return FARM_TRANSLATIONS[language] ?? enFarm;
}

/** Crop display name for selected UI language */
export function cropLabelForLanguage(
  crop: { name: string; nameTe?: string },
  language: LanguageCode,
): string {
  if (language === 'en') return crop.name;
  return crop.nameTe || crop.name;
}

/** Soil type label for selected language */
export function soilLabelForLanguage(
  option: { label: string; labelTe?: string },
  language: LanguageCode,
): string {
  if (language === 'te') return option.labelTe ?? option.label;
  return option.label;
}

/** Sowing month label for selected language */
export function monthLabelForLanguage(
  month: { labelEn: string; labelTe: string },
  language: LanguageCode,
): string {
  if (language === 'te') return month.labelTe;
  return month.labelEn;
}

/** Crop category heading for selected language */
export function cropCategoryForLanguage(
  category: string,
  language: LanguageCode,
  teMap: Record<string, string>,
  enMap: Record<string, string>,
): string {
  if (language === 'te') return teMap[category] ?? category;
  return enMap[category] ?? category;
}
