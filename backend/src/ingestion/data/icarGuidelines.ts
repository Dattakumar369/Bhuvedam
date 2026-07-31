export interface IcarGuidelineEntry {
  id: string;
  category: 'crop_recommendation' | 'fertilizer' | 'disease' | 'pest' | 'best_practice';
  cropId?: string;
  title: string;
  titleTe?: string;
  content: string;
  season?: string;
  region?: string;
  sourceUrl?: string;
  tags?: string[];
}

/** ICAR-aligned crop, fertilizer, disease and IPM guidelines for Indian farmers */
export const ICAR_GUIDELINES: IcarGuidelineEntry[] = [
  {
    id: 'icar-rice-n-split',
    category: 'fertilizer',
    cropId: 'rice',
    title: 'Split nitrogen application in rice',
    titleTe: 'వరిలో nitrogen split application',
    content:
      'Apply 50% N as basal, 25% at tillering (25–30 DAT), 25% at panicle initiation (45–50 DAT). Use neem-coated urea. Avoid late nitrogen after flowering — causes lodging and blast.',
    season: 'kharif',
    region: 'India',
    sourceUrl: 'https://www.icar.org.in/',
    tags: ['urea', 'nitrogen', 'split-dose'],
  },
  {
    id: 'icar-rice-zn',
    category: 'fertilizer',
    cropId: 'rice',
    title: 'Zinc application for rice (khaira prevention)',
    titleTe: 'వరిలో zinc — khaira nundi rakshana',
    content:
      'Apply Zinc sulphate 25 kg/ha or 0.5% foliar spray at tillering if soil Zn is low. Essential on alkaline and sodic soils. Combine with organic matter for better uptake.',
    season: 'kharif',
    tags: ['zinc', 'micronutrient', 'khaira'],
  },
  {
    id: 'icar-rice-blast-ipm',
    category: 'disease',
    cropId: 'rice',
    title: 'IPM for rice blast',
    content:
      'Use resistant varieties (BPT 5204, MTU 1010 where suitable). Seed treatment with Tricyclazole. Avoid excess nitrogen. Spray Tricyclazole 75% WP @ 120 g/acre at panicle emergence if symptoms appear.',
    season: 'kharif',
    tags: ['blast', 'fungicide', 'IPM'],
  },
  {
    id: 'icar-wheat-rust',
    category: 'disease',
    cropId: 'wheat',
    title: 'Yellow rust management in wheat',
    content:
      'Monitor for yellow stripes from January onwards. Spray Propiconazole 25% EC @ 200 ml/acre at first pustule sight. Prefer resistant varieties: HD 3086, PBW 725, DBW 187.',
    season: 'rabi',
    tags: ['yellow-rust', 'fungicide'],
  },
  {
    id: 'icar-wheat-fertilizer',
    category: 'fertilizer',
    cropId: 'wheat',
    title: 'Wheat fertilizer schedule (irrigated)',
    content:
      'DAP 50 kg/acre basal + Urea 50 kg/acre in two splits (CRI stage + late tillering). MOP 15 kg/acre if soil K is low. Apply full phosphorus at sowing.',
    season: 'rabi',
    tags: ['DAP', 'urea', 'MOP'],
  },
  {
    id: 'icar-cotton-ipm',
    category: 'pest',
    cropId: 'cotton',
    title: 'Cotton bollworm IPM with pheromone traps',
    content:
      'Install 5 Heliothis pheromone traps/acre. Economic threshold: 2 egg masses/100 plants. Use Emamectin benzoate or Spinosad when threshold crossed. Conserve natural enemies — avoid calendar spraying.',
    season: 'kharif',
    tags: ['bollworm', 'IPM', 'pheromone'],
  },
  {
    id: 'icar-cotton-fertilizer',
    category: 'fertilizer',
    cropId: 'cotton',
    title: 'Cotton nutrient management',
    content:
      'NPK 12:32:16 50 kg/acre at square formation. Urea 25 kg + MOP 10 kg/acre side dressing at flowering. Foliar magnesium sulphate 5 g/L at boll development if deficiency observed.',
    season: 'kharif',
    tags: ['NPK', 'magnesium'],
  },
  {
    id: 'icar-groundnut-ca-b',
    category: 'fertilizer',
    cropId: 'groundnut',
    title: 'Groundnut calcium and boron',
    content:
      'Apply gypsum 400 kg/ha at peg formation for pod filling. Boron 0.1% foliar at flowering if hollow heart observed. Rhizobium seed treatment reduces nitrogen need by 25%.',
    season: 'kharif',
    tags: ['gypsum', 'boron', 'rhizobium'],
  },
  {
    id: 'icar-tomato-drip-fertigation',
    category: 'fertilizer',
    cropId: 'tomato',
    title: 'Tomato fertigation schedule (drip)',
    content:
      'NPK 19:19:19 water-soluble @ 2–3 kg/acre/week through drip from transplant to fruit set. Reduce nitrogen after first pick to improve fruit quality. Maintain EC 1.5–2.0 dS/m.',
    season: 'year-round',
    tags: ['fertigation', 'drip', 'NPK'],
  },
  {
    id: 'icar-soil-ph-rice',
    category: 'best_practice',
    cropId: 'rice',
    title: 'Soil pH management for rice',
    content:
      'Optimal pH 5.5–6.5 for rice. On alkaline soils apply gypsum or organic matter. On acid soils liming may be needed. Test soil every 3 years via Soil Health Card.',
    tags: ['soil-pH', 'soil-health-card'],
  },
  {
    id: 'icar-ipm-general',
    category: 'best_practice',
    title: 'ICAR IPM principles for all crops',
    titleTe: 'ICAR IPM — anni pantala ki',
    content:
      '1. Use resistant varieties 2. Monitor pests weekly 3. Economic threshold based spraying 4. Rotate pesticide groups 5. Conserve natural enemies 6. Record all sprays for PHI compliance.',
    region: 'India',
    sourceUrl: 'https://www.icar.org.in/',
    tags: ['IPM', 'general'],
  },
  {
    id: 'icar-organic-manure',
    category: 'fertilizer',
    title: 'Integrated nutrient management with FYM',
    content:
      'Apply 5–10 tonnes FYM/acre before kharif/rabi. Combine with 50% recommended chemical fertilizer dose on soils with good organic carbon (>0.5%). Green manuring with dhaincha before rice saves 25 kg N/acre.',
    tags: ['FYM', 'organic', 'green-manure'],
  },
  {
    id: 'icar-maize-n-management',
    category: 'fertilizer',
    cropId: 'maize',
    title: 'Maize nitrogen management',
    content:
      'Full dose P and K at sowing. Urea in 3 splits: 1/3 basal, 1/3 at knee-high (30 DAS), 1/3 at tasseling. Zinc sulphate 10 kg/ha on zinc-deficient soils.',
    season: 'kharif',
    tags: ['maize', 'urea', 'zinc'],
  },
  {
    id: 'icar-chickpea-rhizobium',
    category: 'fertilizer',
    cropId: 'chickpea',
    title: 'Chickpea bio-fertilizer and phosphorus',
    content:
      'Rhizobium seed treatment mandatory. DAP 40–50 kg/acre basal. Avoid nitrogen top dressing. MOP 10 kg/acre if soil K is medium-low.',
    season: 'rabi',
    tags: ['rhizobium', 'DAP', 'pulses'],
  },
  {
    id: 'icar-sugarcane-npk',
    category: 'fertilizer',
    cropId: 'sugarcane',
    title: 'Sugarcane nutrient schedule',
    content:
      'N 250–300 kg/ha in 3 splits, P₂O₅ 80 kg/ha basal, K₂O 100 kg/ha in 2 splits. Apply trash mulching to conserve moisture and recycle nutrients. Earthing up at 120 days.',
    season: 'year-round',
    tags: ['sugarcane', 'NPK'],
  },
];
