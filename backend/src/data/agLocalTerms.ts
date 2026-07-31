/** Local Telugu names farmers use — for AI replies & catalog context */

export const DISEASE_LOCAL_TE: Record<string, { nameTe: string; symptomsTe: string }> = {
  'leaf-blight': {
    nameTe: 'ఆకు కాల్చే / Leaf blight రోగం',
    symptomsTe: 'ఆకులపై గోడువ మచ్చలు, ఆకులు ముందుగా పడిపోతాయి',
  },
  rust: {
    nameTe: 'తగadu / Rust రోగం',
    symptomsTe: 'ఆకులపై నారింజ/గోధుమ రంగు మచ్చలు',
  },
  'powdery-mildew': {
    nameTe: 'పొడి పేనుబుట్ట / Powdery mildew',
    symptomsTe: 'ఆకులపై తెల్లటి పొడి పేనుబుట్ట',
  },
  'downy-mildew': {
    nameTe: 'తడి పేనుబుట్ట / Downy mildew',
    symptomsTe: 'ఆకులపై పసుపు మచ్చలు, కింద తెల్లటి fungus',
  },
  wilt: {
    nameTe: 'వెలగ / Wilt రోగం',
    symptomsTe: 'మొక్క వైపు వైపు వాడిపోవడం, ఆకులు మాడిపోవడం',
  },
  'root-rot': {
    nameTe: 'వేరు కుళ్ళ / Root rot',
    symptomsTe: 'మొక్క చిన్నగా, వేర్లు గోధుమ రంగు, నాటిన మొక్కలు చనిపోవడం',
  },
  'bacterial-blight': {
    nameTe: 'బ్యాక్టీరియా Blight',
    symptomsTe: 'ఆకులపై నీటి soaked మచ్చలు, పసుపు చుట్టుకోలు',
  },
  'viral-mosaic': {
    nameTe: 'మొక్క / Mosaic virus',
    symptomsTe: 'ఆకులపై పచ్చ-పసుపు మచ్చలు, ఆకు curl',
  },
  'leaf-spot': {
    nameTe: 'ఆకు మచ్చ / Leaf spot',
    symptomsTe: 'ఆకులపై చిన్న dark spots, ఆకులు పడిపోతాయి',
  },
  'stem-borer': {
    nameTe: 'కాండం పొద / Stem borer (తెగ)',
    symptomsTe: 'కాండం లోపల పురుగు, dead heart, white earheads',
  },
  aphids: {
    nameTe: 'ఎద్ద పురుగు / Aphids',
    symptomsTe: 'ఆకులు curl, honeydew, sooty mould',
  },
  'deficiency-n': {
    nameTe: 'నత్రజని లోపం',
    symptomsTe: 'పాత ఆకులు పసుపు, మొక్క stunt',
  },
  'deficiency-p': {
    nameTe: 'భాస్వరం లోపం',
    symptomsTe: 'ఆకులు నీల/ఎరుపు రంగు, root weak',
  },
  'deficiency-k': {
    nameTe: 'పొటాష్ లోపం',
    symptomsTe: 'ఆకు అంచుల scorch, fruit quality poor',
  },
  'deficiency-zn': {
    nameTe: 'జింక్ లోపం / Khaira',
    symptomsTe: 'ఆకుల మధ్య పసుపు, rosette leaves',
  },
};

export const PEST_LOCAL_TE: Record<string, string> = {
  bph: 'గోధుమ పొద / Brown Plant Hopper (BPH)',
  bollworm: 'పొదపురుగు / Bollworm',
  aphids: 'ఎద్ద పురుగు / Aphids',
  jassids: 'పచ్చ పురుగు / Jassids',
  whitefly: 'తెల్ల పురుగు / Whitefly',
  thrips: 'త్రిప్స్ / Thrips',
  'stem borer': 'కాండం పొద / Stem borer',
  'leaf folder': 'ఆకు fold / Leaf folder',
  'fruit borer': 'పండు పొద / Fruit borer',
  mites: 'చేతి పురుగు / Mites',
  'pod borer': 'బియ్యం పొద / Pod borer',
  blast: 'గడ్డమ / Blast',
  'sheath blight': 'Sheath blight / గడ్డమ',
};

export const CROP_LOCAL_TE: Record<string, string> = {
  rice: 'వరి / Rice',
  cotton: 'పత్తి / Cotton',
  chilli: 'మిరప / Chilli',
  tomato: 'టమాట / Tomato',
  groundnut: 'వేరుశనగ / Groundnut',
  maize: 'మొక్కజొన్న / Maize',
  wheat: 'గోధుమ / Wheat',
  soybean: 'సోయా / Soybean',
  sugarcane: 'చెరకు / Sugarcane',
  mustard: 'ఆవాల / Mustard',
};

export function localDiseaseLabel(diseaseId: string, englishName: string): string {
  for (const key of Object.keys(DISEASE_LOCAL_TE)) {
    if (diseaseId.includes(key) || englishName.toLowerCase().includes(key.replace(/-/g, ' '))) {
      return DISEASE_LOCAL_TE[key]!.nameTe;
    }
  }
  return englishName;
}

export function localSymptomsTe(diseaseId: string, englishSymptoms: string): string {
  for (const key of Object.keys(DISEASE_LOCAL_TE)) {
    if (diseaseId.includes(key)) return DISEASE_LOCAL_TE[key]!.symptomsTe;
  }
  return englishSymptoms.slice(0, 150);
}

export function localPestLabel(target: string): string {
  const lower = target.toLowerCase();
  for (const [key, te] of Object.entries(PEST_LOCAL_TE)) {
    if (lower.includes(key)) return te;
  }
  return target;
}

export function localCropLabel(cropId: string): string {
  return CROP_LOCAL_TE[cropId] ?? cropId;
}
