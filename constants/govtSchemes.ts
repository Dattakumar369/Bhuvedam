import type { GovtScheme, GovtSchemeCategory, GovtSchemeRegion } from '@/types/govtScheme';

export const GOVT_SCHEMES_UPDATED = '2026-07-22';

export const GOVT_SCHEME_CATEGORIES: { id: GovtSchemeCategory | 'all'; labelTe: string }[] = [
  { id: 'all', labelTe: 'అన్నీ' },
  { id: 'support', labelTe: 'ఆర్థిక సహాయం' },
  { id: 'subsidy', labelTe: 'Subsidy' },
  { id: 'loan', labelTe: 'Loans' },
  { id: 'insurance', labelTe: 'Insurance' },
];

export const GOVT_SCHEME_REGIONS: { id: GovtSchemeRegion | 'all'; labelTe: string }[] = [
  { id: 'all', labelTe: 'అన్నీ' },
  { id: 'central', labelTe: 'కేంద్రం' },
  { id: 'ap', labelTe: 'ఆంధ్ర ప్రదేశ్' },
  { id: 'ts', labelTe: 'తెలంగాణ' },
];

export const GOVT_SCHEMES: GovtScheme[] = [
  {
    id: 'pm-kisan',
    category: 'support',
    region: 'central',
    titleTe: 'PM-KISAN Samman Nidhi',
    titleEn: 'Direct income support',
    amountTe: '₹6,000 / year',
    benefitTe:
      'Landholding farmer families ki year ki ₹6,000 — 3 equal installments lo (₹2,000 + ₹2,000 + ₹2,000) bank account ki direct transfer.',
    eligibilityTe:
      'Agricultural land unna farmer family (husband, wife, minor children). Institutional land holders, income tax payers, government employees excluded.',
    howToApplyTe:
      'pmkisan.gov.in lo register / status chudandi. Annual eKYC mandatory — portal or nearest CSC lo biometric eKYC cheyandi.',
    applyUrl: 'https://www.pmkisan.gov.in/',
    icon: 'cash-multiple',
    highlights: ['eKYC mandatory', '22nd installment Mar 2026', 'Know Your Status portal lo check cheyandi'],
    verifiedAt: '2026-07-22',
  },
  {
    id: 'annadata-sukhibhava',
    category: 'support',
    region: 'ap',
    titleTe: 'PM-KISAN — Annadata Sukhibhava',
    titleEn: 'AP farmer investment support',
    amountTe: '₹20,000 / family / year',
    benefitTe:
      'AP lo eligible farmer family ki year ki ₹20,000. Central PM-KISAN ₹6,000 kuda ee amount lo include. 2026 Kharif first installment ₹7,000 release ayyindi.',
    eligibilityTe:
      'AP lo agricultural land unna farmer families. RoFR (Forest Rights) kinda sagu chestunna tribal farmers kuda eligible.',
    howToApplyTe:
      'State automatic ga identify chestundi — bank account linked undali. Status AP agriculture department / official portals lo verify cheyandi.',
    icon: 'hand-heart',
    highlights: ['₹20,000 per family', 'PM-KISAN included', '2026 Kharif: ₹7,000 1st installment'],
    verifiedAt: '2026-07-22',
  },
  {
    id: 'rythu-bharosa-ts',
    category: 'support',
    region: 'ts',
    titleTe: 'Rythu Bharosa',
    titleEn: 'Telangana investment support',
    amountTe: '₹12,000 / acre / year',
    benefitTe:
      'Telangana lo cultivable land ki acre ki year ki ₹12,000. Kharif & Rabi — rendu seasons lo ₹6,000 + ₹6,000. Paddy ki extra ₹500/quintal bonus.',
    eligibilityTe:
      'Telangana lo arable land registered (Bhu Bharati portal). Valid lease unna tenant farmers kuda eligible. Real estate / industrial plots excluded.',
    howToApplyTe:
      'Revenue records & Bhu Bharati verification dwara automatic. Landless ag labor ki linked Indiramma Atmiya Bharosa — ₹12,000/year.',
    icon: 'sprout',
    highlights: ['Per acre basis', 'Tenant farmers eligible', 'Paddy bonus ₹500/quintal'],
    verifiedAt: '2026-07-22',
  },
  {
    id: 'kcc',
    category: 'loan',
    region: 'central',
    titleTe: 'Kisan Credit Card (KCC)',
    titleEn: 'Affordable crop credit',
    amountTe: '₹3–5 lakh limit',
    benefitTe:
      'Short-term crop loans & allied activities ki revolving credit. 2025-26 nunchi limit ₹5 lakh varaku penchadam approve ayyindi. Timely repayment unte effective interest 4% p.a.',
    eligibilityTe:
      'Farmers, sharecroppers, tenant farmers — land / crop details tho. Dairy, fishery allied activities kuda cover avuthayi.',
    howToApplyTe:
      'Meeku najamaina bank / cooperative / RRB branch lo KCC apply cheyandi. PM-KISAN beneficiaries ki KCC saturation campaign undi.',
    icon: 'credit-card-outline',
    highlights: ['Effective 4% on timely pay', 'Limit up to ₹5 lakh', 'Crop + allied activities'],
    verifiedAt: '2026-07-22',
  },
  {
    id: 'miss-interest-subvention',
    category: 'loan',
    region: 'central',
    titleTe: 'Interest Subvention (MISS)',
    titleEn: 'Low interest on KCC loans',
    amountTe: '7% → 4% effective',
    benefitTe:
      'KCC short-term loans ki 1.5% interest subvention — base rate 7%. Prompt Repayment Incentive (PRI) 3% extra unte effective rate 4% p.a. 2025-26 continue ayyindi.',
    eligibilityTe:
      '₹3 lakh varaku short-term crop loans through KCC. Prompt repayment chese farmers ki full benefit.',
    howToApplyTe:
      'KCC loan teesukunetappudu bank automatic ga apply chestundi. Time ki repay cheyadam important.',
    icon: 'percent',
    highlights: ['Continued 2025-26', 'PRI = 4% effective rate', '₹15,640 crore allocation'],
    verifiedAt: '2026-07-22',
  },
  {
    id: 'ap-zero-interest-loan',
    category: 'loan',
    region: 'ap',
    titleTe: 'AP Interest-free Crop Loan',
    titleEn: '0% crop loan (AP)',
    amountTe: '₹3 lakh varaku 0%',
    benefitTe:
      'Andhra Pradesh lo eligible farmers ki crop loans ki state additional subvention — KCC loans practically 0% interest rate ki reach avuthayi (timely repayment condition).',
    eligibilityTe:
      'AP lo registered farmers with valid land records. Bank KCC / crop loan account undali.',
    howToApplyTe:
      'Local cooperative / nationalized bank lo crop loan or KCC apply cheyandi. AP state subvention bank dwara adjust avuthundi.',
    icon: 'bank-outline',
    highlights: ['State top-up on central KCC', 'Up to ₹3 lakh', 'Timely repayment important'],
    verifiedAt: '2026-07-22',
  },
  {
    id: 'pmfby',
    category: 'insurance',
    region: 'central',
    titleTe: 'PM Fasal Bima Yojana (PMFBY)',
    titleEn: 'Crop insurance',
    amountTe: 'Farmer premium: 2% / 1.5%',
    benefitTe:
      'Natural disasters, drought, flood, pest damage ki crop insurance. Kharif: 2% premium, Rabi: 1.5%, commercial/horticulture: 5%. Government remaining premium pay chestundi.',
    eligibilityTe:
      'All farmers including sharecroppers & tenant farmers — notified crops in notified areas. Loanee farmers ki compulsory (notified areas lo).',
    howToApplyTe:
      'Bank dwara (loan unna farmers) or pmfby.gov.in / crop insurance portal. Sowing season start mundu enroll cheyandi.',
    applyUrl: 'https://pmfby.gov.in/',
    icon: 'shield-check',
    highlights: ['Low farmer premium', 'Covers sowing to harvest', 'Voluntary for non-loanee farmers'],
    verifiedAt: '2026-07-22',
  },
  {
    id: 'rythu-bima-ts',
    category: 'insurance',
    region: 'ts',
    titleTe: 'Rythu Bima',
    titleEn: 'Telangana farmer life cover',
    amountTe: '₹5 lakh nominee ki',
    benefitTe:
      'Registered Telangana farmers ki life insurance — farmer death aithe nominee ki ₹5 lakh payout. Rythu Bharosa registered farmers ki linked.',
    eligibilityTe:
      'Telangana lo Rythu Bharosa / agriculture registration unna farmers.',
    howToApplyTe:
      'Rythu Bharosa registration tho automatic link avuthundi. Details mee local agriculture office lo confirm cheyandi.',
    icon: 'heart-pulse',
    highlights: ['₹5 lakh to nominee', 'Linked to Rythu Bharosa', 'Family safety net'],
    verifiedAt: '2026-07-22',
  },
  {
    id: 'pmksy-micro-irrigation',
    category: 'subsidy',
    region: 'central',
    titleTe: 'PM Krishi Sinchai — Drip / Sprinkler',
    titleEn: 'Micro irrigation subsidy',
    amountTe: '55% varaku subsidy',
    benefitTe:
      'Drip & sprinkler systems ki capital subsidy. Small & marginal farmers: 55% varaku. Others: 45%. Water save + yield penchadaniki.',
    eligibilityTe:
      'Farmers with cultivable land. Micro irrigation system install cheyali — empaneled company dwara.',
    howToApplyTe:
      'District Agriculture Office / horticulture department lo apply cheyandi. Online portals state-wise available.',
    icon: 'water',
    highlights: ['Drip & sprinkler', '55% for small farmers', 'Per drop more crop'],
    verifiedAt: '2026-07-22',
  },
  {
    id: 'smam-machinery',
    category: 'subsidy',
    region: 'central',
    titleTe: 'SMAM — Farm Machinery Subsidy',
    titleEn: 'Tractor & equipment subsidy',
    amountTe: '50% varaku subsidy',
    benefitTe:
      'Tractor, power tiller, harvester, seed drill lanti farm machinery ki subsidy. Small & marginal farmers ki ekkuva benefit.',
    eligibilityTe:
      'Small, marginal & other farmers. Custom Hiring Centres (CHC) establish cheyadaniki kuda support undi.',
    howToApplyTe:
      'Agriculture department / agrimachinery.nic.in portal. District level approval process undi.',
    applyUrl: 'https://agrimachinery.nic.in/',
    icon: 'tractor',
    highlights: ['Tractor & tools', 'CHC support', 'Small farmer priority'],
    verifiedAt: '2026-07-22',
  },
  {
    id: 'aif',
    category: 'loan',
    region: 'central',
    titleTe: 'Agriculture Infrastructure Fund (AIF)',
    titleEn: 'Agri infra financing',
    amountTe: '₹2–100 lakh loans',
    benefitTe:
      'Cold storage, warehouse, sorting, grading, processing units lanti agri infrastructure ki medium-long term loans. 3% interest subvention possible.',
    eligibilityTe:
      'Farmers, FPOs, agri entrepreneurs, startups. Viable project report kavali.',
    howToApplyTe:
      'Scheduled banks / NABARD approved projects dwara apply cheyandi. aif.gov.in lo details chudandi.',
    applyUrl: 'https://agriinfra.dac.gov.in/',
    icon: 'warehouse',
    highlights: ['Post-harvest infra', '3% interest subvention', 'FPOs eligible'],
    verifiedAt: '2026-07-22',
  },
  {
    id: 'soil-health-card',
    category: 'subsidy',
    region: 'central',
    titleTe: 'Soil Health Card',
    titleEn: 'Free soil testing',
    amountTe: 'Free',
    benefitTe:
      'Mee polam soil test chesi N, P, K, micronutrients, pH report istaru. Fertilizer waste tagginchi, yield penchadaniki guide.',
    eligibilityTe:
      'All farmers — India wide scheme.',
    howToApplyTe:
      'District Agriculture Office / soil testing lab lo sample ivvandi. Mobile soil testing vans kuda untayi.',
    icon: 'flask-outline',
    highlights: ['Free testing', 'Crop-wise fertilizer advice', 'Every 2 years recommended'],
    verifiedAt: '2026-07-22',
  },
  {
    id: 'indiramma-atmiya-bharosa',
    category: 'support',
    region: 'ts',
    titleTe: 'Indiramma Atmiya Bharosa',
    titleEn: 'Landless farmer support (TS)',
    amountTe: '₹12,000 / year',
    benefitTe:
      'Telangana lo land lekapoina registered agricultural laborers ki year ki ₹12,000 financial support.',
    eligibilityTe:
      'Registered landless agricultural laborers in Telangana.',
    howToApplyTe:
      'Local revenue / agriculture office lo registration. Rythu Bharosa system tho linked.',
    icon: 'account-group',
    highlights: ['Landless laborers', '₹12,000/year', 'Telangana only'],
    verifiedAt: '2026-07-22',
  },
];

export function categoryLabelTe(category: GovtSchemeCategory): string {
  const map: Record<GovtSchemeCategory, string> = {
    support: 'ఆర్థిక సహాయం',
    subsidy: 'Subsidy',
    loan: 'Loan',
    insurance: 'Insurance',
  };
  return map[category];
}

export function regionLabelTe(region: GovtSchemeRegion): string {
  const map: Record<GovtSchemeRegion, string> = {
    central: 'కేంద్రం',
    ap: 'ఆంధ్ర ప్రదేశ్',
    ts: 'తెలంగాణ',
  };
  return map[region];
}
