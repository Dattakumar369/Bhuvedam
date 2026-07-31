export interface DoaAdvisoryEntry {
  id: string;
  type: 'scheme' | 'advisory' | 'fertilizer' | 'crop' | 'soil';
  title: string;
  titleTe?: string;
  description: string;
  state?: string;
  season?: string;
  cropTags?: string[];
  source: 'doa' | 'moa' | 'state_agri';
  sourceUrl?: string;
}

/** Ministry of Agriculture & Farmers Welfare — schemes and advisories */
export const DOA_ADVISORIES: DoaAdvisoryEntry[] = [
  {
    id: 'doa-pm-kisan',
    type: 'scheme',
    title: 'PM-KISAN — Income support for farmers',
    titleTe: 'PM-KISAN — Rythu dhanaharam',
    description:
      '₹6,000 per year in 3 instalments to eligible landholding farmer families. Apply via pmkisan.gov.in or visit agriculture office with land records and Aadhaar.',
    state: 'All India',
    source: 'moa',
    sourceUrl: 'https://pmkisan.gov.in/',
  },
  {
    id: 'doa-soil-health-card',
    type: 'soil',
    title: 'Soil Health Card Scheme',
    titleTe: 'Soil Health Card Scheme',
    description:
      'Free soil testing every 3 years. Card shows N, P, K, pH, EC, organic carbon and micronutrient status with crop-wise fertilizer recommendations. Apply at District Agriculture Office or through SHC portal.',
    state: 'All India',
    source: 'moa',
    sourceUrl: 'https://soilhealth.dac.gov.in/',
  },
  {
    id: 'doa-pm-pranam',
    type: 'fertilizer',
    title: 'PM-PRANAM — Reduce chemical fertilizer subsidy',
    description:
      'Incentive to states for reducing urea and chemical fertilizer consumption through alternative fertilizers and balanced nutrient management.',
    state: 'All India',
    source: 'moa',
    sourceUrl: 'https://agriwelfare.gov.in/',
  },
  {
    id: 'doa-nfsm-pulses',
    type: 'crop',
    title: 'NFSM — Pulses and oilseeds area expansion',
    description:
      'National Food Security Mission supports seed distribution, INM/IPM demonstrations and training for pulses (chickpea, redgram, greengram) and oilseeds (groundnut, mustard).',
    cropTags: ['chickpea', 'redgram', 'greengram', 'groundnut', 'mustard'],
    season: 'kharif',
    source: 'doa',
    sourceUrl: 'https://agriwelfare.gov.in/',
  },
  {
    id: 'doa-kharif-advisory-rice',
    type: 'advisory',
    title: 'Kharif rice — pre-monsoon land preparation',
    titleTe: 'Kharif vari — varsham mundu panulu',
    description:
      'Level field for uniform irrigation. Apply green manure (dhaincha) 15 days before transplant. Use 5 kg zinc sulphate/acre on Zn-deficient soils. Treat seeds with Tricyclazole or Carbendazim.',
    cropTags: ['rice'],
    season: 'kharif',
    state: 'All India',
    source: 'doa',
  },
  {
    id: 'doa-rabi-wheat-sowing',
    type: 'advisory',
    title: 'Rabi wheat — timely sowing advisory',
    description:
      'Optimal sowing window: Nov 1–25 for North India, Nov 15–Dec 15 for Central India. Delay reduces yield 1–1.5% per week. Treat seed with Vitavax or Carbendazim @ 2 g/kg.',
    cropTags: ['wheat'],
    season: 'rabi',
    source: 'doa',
  },
  {
    id: 'doa-fertilizer-balanced-use',
    type: 'fertilizer',
    title: 'Balanced fertilizer use advisory',
    titleTe: 'Samatulya fertilizer vaada — salaha',
    description:
      'Do not apply urea alone every season. Maintain N:P:K ratio based on Soil Health Card. Use complex fertilizers (NPK) and micronutrients. Adopt split application of nitrogen.',
    state: 'All India',
    source: 'doa',
    sourceUrl: 'https://dof.gov.in/',
  },
  {
    id: 'doa-neem-coated-urea',
    type: 'fertilizer',
    title: 'Neem-coated urea mandate',
    description:
      '100% neem-coated urea is supplied under subsidy. Neem coating reduces nitrogen loss by 10–15% and improves use efficiency. Available at PACS and authorized dealers via iFMS/e-Urvarak.',
    source: 'doa',
    sourceUrl: 'https://dof.gov.in/',
  },
  {
    id: 'doa-ap-rythu-bharosa',
    type: 'scheme',
    title: 'Telangana Rythu Bharosa / AP input support',
    description:
      'State input assistance for farmers — seed, fertilizer and pesticide support through Rythu Bharosa Kendras. Check eligibility at local agriculture extension officer.',
    state: 'Telangana / Andhra Pradesh',
    cropTags: ['rice', 'cotton', 'maize', 'chilli'],
    source: 'state_agri',
  },
  {
    id: 'doa-pesticide-safety',
    type: 'advisory',
    title: 'Pesticide application safety advisory',
    description:
      'Always read label before use. Wear mask, gloves and full sleeves. Observe Pre-Harvest Interval (PHI). Do not spray during peak heat (11 AM–3 PM). Store pesticides away from food and children.',
    state: 'All India',
    source: 'doa',
  },
  {
    id: 'doa-drought-management',
    type: 'advisory',
    title: 'Drought contingency crop advisory',
    description:
      'Shift to short-duration varieties. Mulch with crop residue. Apply potassium to improve drought tolerance. Use drip/sprinkler if available. Delay nitrogen until moisture assured.',
    season: 'kharif',
    source: 'doa',
  },
  {
    id: 'doa-organic-farming',
    type: 'crop',
    title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    description:
      'Cluster-based organic farming support — ₹50,000/hectare over 3 years for organic inputs, certification and marketing. Contact District Agriculture Officer.',
    state: 'All India',
    source: 'moa',
    sourceUrl: 'https://agriwelfare.gov.in/',
  },
];
