export const AGRO_BRAND_FILTERS = [
  { id: 'all', label: 'All brands' },
  { id: 'UPL', label: 'UPL' },
  { id: 'Bayer', label: 'Bayer' },
  { id: 'Syngenta', label: 'Syngenta' },
  { id: 'Dhanuka', label: 'Dhanuka' },
  { id: 'Indofil', label: 'Indofil' },
  { id: 'IFFCO', label: 'IFFCO' },
  { id: 'Coromandel', label: 'Coromandel' },
  { id: 'PI Industries', label: 'PI Industries' },
  { id: 'Rallis', label: 'Rallis' },
] as const;

export const PEST_TARGET_FILTERS = [
  { id: 'all', labelTe: 'అన్నీ', label: 'All pests' },
  { id: 'bollworm', labelTe: 'పొదపురుగు', label: 'Bollworm' },
  { id: 'bph', labelTe: 'గోధుమ పొద', label: 'BPH' },
  { id: 'aphid', labelTe: 'ఎద్ద పురుగు', label: 'Aphids' },
  { id: 'whitefly', labelTe: 'తెల్ల పురుగు', label: 'Whitefly' },
  { id: 'thrips', labelTe: 'త్రిప్స్', label: 'Thrips' },
  { id: 'stem borer', labelTe: 'తెగ', label: 'Stem borer' },
  { id: 'mite', labelTe: 'చేతి పురుగు', label: 'Mites' },
  { id: 'spodoptera', labelTe: 'స్పోడో', label: 'Spodoptera' },
] as const;

export const FUNG_TARGET_FILTERS = [
  { id: 'all', labelTe: 'అన్నీ', label: 'All diseases' },
  { id: 'blight', labelTe: 'ఆకు కాల్చే', label: 'Blight' },
  { id: 'mildew', labelTe: 'పేనుబుట్ట', label: 'Mildew' },
  { id: 'rust', labelTe: 'తగadu', label: 'Rust' },
  { id: 'wilt', labelTe: 'వెలగ', label: 'Wilt' },
  { id: 'rot', labelTe: 'కుళ్ళ', label: 'Rot' },
  { id: 'anthracnose', labelTe: 'ఆంత్రక్నోజ్', label: 'Anthracnose' },
  { id: 'blast', labelTe: 'గడ్డమ', label: 'Blast' },
] as const;

export const BRAND_COLORS: Record<string, string> = {
  IFFCO: '#2E7D32',
  Coromandel: '#1565C0',
  NFL: '#E65100',
  Nagarjuna: '#6A1B9A',
  Deepak: '#00838F',
  UPL: '#283593',
  Bayer: '#0D47A1',
  Syngenta: '#F57F17',
  Dhanuka: '#558B2F',
  Indofil: '#00695C',
  Rallis: '#4527A0',
  'PI Industries': '#37474F',
};
