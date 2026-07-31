import type { CropProtectionGuide, SprayRecommendation } from '@/types/cropProtection';

const COMMON_WHERE_TO_BUY = [
  'Local fertilizer & pesticide shop (Raithu Kendra)',
  'Primary Agricultural Cooperative Society (PACS)',
  'Raithu Bazars / Rythu Bharosa Kendras',
  'IFFCO / KRIBHco dealer outlets',
  'Online: BigHaat, AgriBegri, DeHaat (verify authenticity)',
];

function spray(
  partial: Omit<SprayRecommendation, 'whereToBuy'> & { whereToBuy?: string[] },
): SprayRecommendation {
  return { whereToBuy: COMMON_WHERE_TO_BUY, ...partial };
}

export const CROP_PROTECTION_GUIDES: Record<string, CropProtectionGuide> = {
  rice: {
    cropId: 'rice',
    stages: [
      { id: 'nursery', name: 'Nursery', nameTe: 'నURSERY / పిల్ల పందం', daysRange: '0–25 days' },
      { id: 'tillering', name: 'Tillering', nameTe: 'కాయలు వచ్చే దశ', daysRange: '25–45 days' },
      { id: 'panicle', name: 'Panicle initiation', nameTe: 'పానicle / పుష్పించే దశ', daysRange: '45–65 days' },
      { id: 'flowering', name: 'Flowering & grain fill', nameTe: 'పుష్పించి grains నింపే దశ', daysRange: '65–90 days' },
      { id: 'maturity', name: 'Maturity', nameTe: 'పంటripe దశ', daysRange: '90–120 days' },
    ],
    fertilizersByStage: {
      nursery: [
        {
          name: 'DAP + Zinc sulphate',
          nameTe: 'DAP + Zinc sulphate',
          dose: '2 kg DAP + 500 g Zinc sulphate per nursery cent',
          method: 'Mix in nursery soil before sowing',
          timing: 'Before sowing seeds',
          estimatedPrice: '₹120–180 per cent',
          notes: 'Zinc prevents khaira disease in main field',
        },
      ],
      tillering: [
        {
          name: 'Urea (1st split)',
          nameTe: 'Urea (మొదటి dose)',
          dose: '40 kg/acre',
          method: 'Broadcast when field has thin water layer',
          timing: '20–25 days after transplant',
          estimatedPrice: '₹280–350 per 45 kg bag',
        },
        {
          name: 'NPK 20:20:0',
          nameTe: 'NPK 20:20:0',
          dose: '25 kg/acre',
          method: 'Broadcast & incorporate in soil',
          timing: 'With 1st urea application',
          estimatedPrice: '₹900–1,100 per 50 kg bag',
        },
      ],
      panicle: [
        {
          name: 'Urea (2nd split)',
          nameTe: 'Urea (రెండవ dose)',
          dose: '30 kg/acre',
          method: 'Apply at panicle initiation when water is shallow',
          timing: '45–50 days after transplant',
          estimatedPrice: '₹280–350 per 45 kg bag',
        },
        {
          name: 'Potassium (MOP)',
          nameTe: 'Potassium (MOP)',
          dose: '15 kg/acre if soil is low K',
          method: 'Broadcast before irrigation',
          timing: 'Panicle initiation stage',
          estimatedPrice: '₹650–800 per 50 kg bag',
        },
      ],
      flowering: [
        {
          name: 'Foliar NPK 19:19:19',
          nameTe: 'Foliar spray NPK 19:19:19',
          dose: '5 g/litre water, 200 litres/acre',
          method: 'Evening spray on leaves',
          timing: '50% flowering',
          estimatedPrice: '₹450–600 per kg',
        },
      ],
      maturity: [
        {
          name: 'No nitrogen',
          nameTe: 'ఎరUVU వESakandi',
          dose: 'Stop all nitrogen',
          method: 'Drain field 10–15 days before harvest',
          timing: 'Hard dough stage onwards',
          estimatedPrice: '—',
          notes: 'Excess N delays maturity and reduces grain quality',
        },
      ],
    },
    preventiveSpraysByStage: {
      nursery: [
        spray({
          id: 'rice-nur-carb',
          productName: 'Carbendazim seed treatment',
          productNameTe: 'Carbendazim seed treatment',
          type: 'fungicide',
          target: 'Seed-borne blast & sheath blight prevention',
          targetTe: 'Seed-borne diseases nundi rakshana',
          dose: '2 g/kg seed',
          howToSpray: 'Mix with water, coat seeds, shade-dry 30 min before sowing',
          howToSprayTe: 'Neellalo kalipi seed ki coat cheyandi, 30 nimisham shade lo dry cheyandi',
          bestTime: 'Before sowing in nursery',
          precautions: [
            'Use gloves while treating seeds',
            'Do not eat or smoke during handling',
            'Keep away from children and livestock',
          ],
          precautionsTe: [
            'Gloves veskondi',
            'Handling time lo tinakandi, smoke cheyakandi',
            'Pillalu, pashuvulu daggara pettakandi',
          ],
          estimatedPrice: '₹180–250 per 250 g',
        }),
      ],
      tillering: [
        spray({
          id: 'rice-till-bph',
          productName: 'Imidacloprid 17.8% SL',
          productNameTe: 'Imidacloprid 17.8% SL',
          type: 'insecticide',
          target: 'Brown plant hopper (BPH) & leaf folder',
          targetTe: 'Brown plant hopper, leaf folder',
          dose: '60 ml/acre in 200 L water',
          howToSpray: 'Flat fan nozzle, spray lower leaf sheath; avoid strong wind',
          howToSprayTe: 'Lower leaves daggar spray cheyandi, gali balam ga unte vadileyandi',
          bestTime: 'Morning 6–9 AM or evening 4–6 PM',
          precautions: [
            'Pre-harvest interval (PHI): 14 days',
            'Do not spray during peak heat (11 AM–3 PM)',
            'Wear mask, goggles, full sleeves',
            'Alternate with different insecticide groups to avoid resistance',
          ],
          precautionsTe: [
            'PHI 14 rojulu — harvest mundu 14 rojulu spray cheyakandi',
            'Madhyaahnam 11–3 vaddu',
            'Mask, goggles, full sleeves veskondi',
            'Resistance raku vere group mandu rotate cheyandi',
          ],
          estimatedPrice: '₹350–500 per 250 ml',
        }),
      ],
      panicle: [
        spray({
          id: 'rice-pan-tricy',
          productName: 'Tricyclazole 75% WP',
          productNameTe: 'Tricyclazole 75% WP',
          type: 'fungicide',
          target: 'Blast disease on neck & leaves',
          targetTe: 'Blast rogam (neck blast, leaf blast)',
          dose: '120 g/acre in 200 L water',
          howToSpray: 'Fine mist on leaves and neck region; 2 sprays 10 days apart if disease present',
          howToSprayTe: 'Leaves motta meeda fine mist, rogam unte 10 rojula gap lo 2 sarlu',
          bestTime: 'At panicle emergence or first symptom',
          precautions: [
            'PHI: 21 days',
            'Toxic to bees — avoid flowering time if possible',
            'Do not mix with alkaline pesticides',
          ],
          precautionsTe: [
            'PHI 21 rojulu',
            'Flowering time lo bees unte jagratta',
            'Alkaline mandulu tho mix cheyakandi',
          ],
          estimatedPrice: '₹400–550 per 250 g',
        }),
      ],
      flowering: [
        spray({
          id: 'rice-flow-neem',
          productName: 'Neem oil 1% + NPK foliar',
          productNameTe: 'Neem oil 1% + NPK foliar',
          type: 'bio',
          target: 'Leaf folder, stem borer (preventive)',
          targetTe: 'Leaf folder, stem borer nundi rakshana',
          dose: 'Neem 1 L/acre + NPK 19:19:19 @ 5 g/L',
          howToSpray: 'Evening spray covering whorl and leaves',
          howToSprayTe: 'Santraganam evening spray, whorl cover cheyandi',
          bestTime: 'Before grain filling',
          precautions: [
            'Safe for IPM — can use closer to harvest than chemicals',
            'Strain neem oil before mixing in sprayer',
          ],
          precautionsTe: [
            'IPM ki safe — chemicals kante harvest daggara use cheyochu',
            'Neem oil filter chesi mix cheyandi',
          ],
          estimatedPrice: 'Neem ₹180–280/L, NPK foliar ₹450–600/kg',
        }),
      ],
      maturity: [],
    },
    diseases: [
      {
        id: 'blast',
        name: 'Blast (Pyricularia)',
        nameTe: 'Blast rogam',
        symptoms: 'Diamond-shaped spots on leaves; neck turns black and breaks',
        symptomsTe: 'Leaves meeda diamond shape spots, moka nalla ga ayyi virugutundi',
        sprays: [
          spray({
            id: 'rice-blast-tricy',
            productName: 'Tricyclazole 75% WP',
            productNameTe: 'Tricyclazole 75% WP',
            type: 'fungicide',
            target: 'Blast',
            targetTe: 'Blast rogam',
            dose: '120 g/acre',
            howToSpray: 'Spray at first symptom; repeat after 10 days',
            howToSprayTe: 'Rogam kanipinchagane spray, 10 rojula tarvata malli',
            bestTime: 'Immediately on symptom',
            precautions: ['PHI 21 days', 'Avoid excess nitrogen'],
            precautionsTe: ['PHI 21 rojulu', 'Ekkuva nitrogen vaddu'],
            estimatedPrice: '₹400–550 per 250 g',
          }),
        ],
      },
      {
        id: 'bph',
        name: 'Brown Plant Hopper (BPH)',
        nameTe: 'Brown Plant Hopper (BPH)',
        symptoms: 'Hopper burn — circular yellow/brown patches; plants dry in circles',
        symptomsTe: 'Hopper burn — round ga yellow/brown, mokkalu round ga endutayi',
        sprays: [
          spray({
            id: 'rice-bph-imida',
            productName: 'Imidacloprid + Buprofezin (alternate)',
            productNameTe: 'Imidacloprid + Buprofezin (alternate)',
            type: 'insecticide',
            target: 'BPH',
            targetTe: 'BPH',
            dose: 'As per label — typically 60–100 ml/acre',
            howToSpray: 'Direct spray to base of plants; drain water before spray',
            howToSprayTe: 'Mokka base ki spray, mundu field nunchi konchem neeru drain cheyandi',
            bestTime: 'Early morning; when hoppers seen at base',
            precautions: [
              'Do not use same chemical repeatedly — rotate modes of action',
              'PHI 14–21 days depending on product',
            ],
            precautionsTe: [
              'Oke mandu repeat cheyakandi — rotate cheyandi',
              'PHI 14–21 rojulu',
            ],
            estimatedPrice: '₹350–700 per 250 ml',
          }),
        ],
      },
      {
        id: 'sheath_blight',
        name: 'Sheath Blight',
        nameTe: 'Sheath Blight',
        symptoms: 'Oval greenish-grey lesions on leaf sheath near water line',
        symptomsTe: 'Neeru unna daggar leaf sheath meeda oval grey spots',
        sprays: [
          spray({
            id: 'rice-sb-valida',
            productName: 'Validamycin 3% L',
            productNameTe: 'Validamycin 3% L',
            type: 'fungicide',
            target: 'Sheath blight',
            targetTe: 'Sheath blight',
            dose: '500 ml/acre',
            howToSpray: 'Spray on lower sheath at water level',
            howToSprayTe: 'Neeru level daggar sheath meeda spray',
            bestTime: 'Maximum tillering to panicle init',
            precautions: ['PHI 15 days', 'Ensure good drainage'],
            precautionsTe: ['PHI 15 rojulu', 'Drainage bagundali'],
            estimatedPrice: '₹450–650 per litre',
          }),
        ],
      },
    ],
  },

  cotton: {
    cropId: 'cotton',
    stages: [
      { id: 'sq', name: 'Square formation', nameTe: 'Square formation', daysRange: '30–50 days' },
      { id: 'flowering', name: 'Flowering', nameTe: 'Puvvu dongalu', daysRange: '50–80 days' },
      { id: 'boll', name: 'Boll development', nameTe: 'Boll perugudala', daysRange: '80–120 days' },
      { id: 'boll_open', name: 'Boll opening', nameTe: 'Boll open avutundi', daysRange: '120–160 days' },
    ],
    fertilizersByStage: {
      sq: [
        {
          name: 'Urea + MOP',
          nameTe: 'Urea + MOP',
          dose: 'Urea 25 kg + MOP 10 kg/acre',
          method: 'Side dressing in rows',
          timing: 'At square formation',
          estimatedPrice: '₹600–900/acre total',
        },
      ],
      flowering: [
        {
          name: 'NPK 12:32:16',
          nameTe: 'NPK 12:32:16',
          dose: '50 kg/acre',
          method: 'Broadcast & irrigate',
          timing: 'Peak flowering',
          estimatedPrice: '₹1,100–1,400 per 50 kg',
        },
      ],
      boll: [
        {
          name: 'Foliar Magnesium sulphate',
          nameTe: 'Magnesium sulphate foliar',
          dose: '5 g/L, 200 L/acre',
          method: 'Evening foliar spray',
          timing: 'Boll filling stage',
          estimatedPrice: '₹80–120 per kg',
        },
      ],
      boll_open: [],
    },
    preventiveSpraysByStage: {
      sq: [
        spray({
          id: 'cot-sq-neem',
          productName: 'Neem oil 1% + NSKE 5%',
          productNameTe: 'Neem oil + NSKE',
          type: 'bio',
          target: 'Jassids, thrips (early)',
          targetTe: 'Jassids, thrips',
          dose: '1 L neem + 5 L NSKE per acre',
          howToSpray: 'Cover underside of leaves',
          howToSprayTe: 'Leaves kinda cover cheyandi',
          bestTime: 'Evening',
          precautions: ['Repeat weekly in heavy pest pressure', 'Safe for beneficial insects at low dose'],
          precautionsTe: ['Pest ekkuva unte weekly', 'Thakku dose lo safe'],
          estimatedPrice: '₹180–300/L neem',
        }),
      ],
      flowering: [
        spray({
          id: 'cot-bollworm',
          productName: 'Emamectin benzoate 5% SG',
          productNameTe: 'Emamectin benzoate 5% SG',
          type: 'insecticide',
          target: 'American bollworm',
          targetTe: 'American bollworm',
          dose: '88 g/acre',
          howToSpray: 'Spray at egg hatch; target flowers and bolls',
          howToSprayTe: 'Eggs hatch time lo flowers & bolls meeda',
          bestTime: 'Evening 4–7 PM',
          precautions: ['PHI 7 days', 'Highly toxic — full PPE mandatory', 'Do not enter field for 24 hr without PPE after spray'],
          precautionsTe: ['PHI 7 rojulu', 'Full PPE must', '24 hr field lo vaddu sprayed area lo'],
          estimatedPrice: '₹800–1,200 per 100 g',
        }),
      ],
      boll: [
        spray({
          id: 'cot-whitefly',
          productName: 'Pyriproxyfen 10% EC',
          productNameTe: 'Pyriproxyfen 10% EC',
          type: 'insecticide',
          target: 'Whitefly (sticky cotton prevention)',
          targetTe: 'Whitefly',
          dose: '400 ml/acre',
          howToSpray: 'Fine mist on underside of leaves',
          howToSprayTe: 'Leaves kinda fine mist',
          bestTime: 'Nymph stage (before adults peak)',
          precautions: ['PHI 14 days', 'IGR — slow action, do not expect instant kill'],
          precautionsTe: ['PHI 14 rojulu', 'Slow action — ventane chanipovu expect cheyakandi'],
          estimatedPrice: '₹600–900 per 250 ml',
        }),
      ],
      boll_open: [],
    },
    diseases: [
      {
        id: 'bollworm',
        name: 'Bollworm complex',
        nameTe: 'Bollworm',
        symptoms: 'Holes in bolls, frass visible; flowers shed',
        symptomsTe: 'Bolls lo holes, puvvu ralaripovutundi',
        sprays: [
          spray({
            id: 'cot-bw-ema',
            productName: 'Emamectin benzoate + Spinosad (rotate)',
            productNameTe: 'Emamectin + Spinosad rotate',
            type: 'insecticide',
            target: 'Bollworm',
            targetTe: 'Bollworm',
            dose: 'As per label',
            howToSpray: 'Target squares and green bolls',
            howToSprayTe: 'Squares & green bolls meeda',
            bestTime: 'On ETL (2 eggs or 1 larva per plant)',
            precautions: ['Follow IPM — pheromone traps first', 'PHI 7–14 days'],
            precautionsTe: ['IPM follow — pheromone traps', 'PHI 7–14 rojulu'],
            estimatedPrice: '₹800–1,500 per treatment/acre',
          }),
        ],
      },
    ],
  },

  tomato: {
    cropId: 'tomato',
    stages: [
      { id: 'vegetative', name: 'Vegetative', nameTe: 'Vegetative perugudala', daysRange: '0–30 days after transplant' },
      { id: 'flowering', name: 'Flowering', nameTe: 'Puvvu dongalu', daysRange: '30–50 days' },
      { id: 'fruiting', name: 'Fruit development', nameTe: 'Tomato perugudala', daysRange: '50–70 days' },
      { id: 'harvest', name: 'Harvest period', nameTe: 'Koyyadam', daysRange: '70–90 days' },
    ],
    fertilizersByStage: {
      vegetative: [
        {
          name: 'NPK 19:19:19',
          nameTe: 'NPK 19:19:19',
          dose: '25 kg/acre through drip',
          method: 'Fertigation weekly',
          timing: 'First 3 weeks after transplant',
          estimatedPrice: '₹900–1,100 per 50 kg',
        },
      ],
      flowering: [
        {
          name: 'Calcium nitrate + Boron',
          nameTe: 'Calcium nitrate + Boron',
          dose: 'CaNO3 10 kg/acre drip + Boron 200 g/acre foliar',
          method: 'Drip + one foliar',
          timing: 'At first flower cluster',
          estimatedPrice: '₹800–1,200/acre',
          notes: 'Prevents blossom end rot',
        },
      ],
      fruiting: [
        {
          name: 'Potassium nitrate (13:0:45)',
          nameTe: 'Potassium nitrate',
          dose: '10 kg/acre fertigation',
          method: 'Drip every 10 days',
          timing: 'Fruit sizing stage',
          estimatedPrice: '₹1,200–1,500 per 25 kg',
        },
      ],
      harvest: [],
    },
    preventiveSpraysByStage: {
      vegetative: [],
      flowering: [
        spray({
          id: 'tom-early-blight',
          productName: 'Mancozeb 75% WP',
          productNameTe: 'Mancozeb 75% WP',
          type: 'fungicide',
          target: 'Early blight prevention',
          targetTe: 'Early blight nundi rakshana',
          dose: '400 g/acre',
          howToSpray: 'Cover all foliage; start before symptoms in humid weather',
          howToSprayTe: 'Mottam leaves cover, humidity ekkuva unte mundu nunche',
          bestTime: 'Evening',
          precautions: ['PHI 7 days', 'Wear mask — dust formulation'],
          precautionsTe: ['PHI 7 rojulu', 'Mask veskondi'],
          estimatedPrice: '₹250–350 per kg',
        }),
      ],
      fruiting: [
        spray({
          id: 'tom-fruit-borer',
          productName: 'Spinosad 45% SC',
          productNameTe: 'Spinosad 45% SC',
          type: 'insecticide',
          target: 'Fruit borer',
          targetTe: 'Fruit borer',
          dose: '60 ml/acre',
          howToSpray: 'Spray on flowers and small fruits',
          howToSprayTe: 'Puvvulu & chinna tomato meeda',
          bestTime: 'At egg lay / early larval',
          precautions: ['PHI 3 days', 'Relatively safe — still use PPE'],
          precautionsTe: ['PHI 3 rojulu', 'PPE use cheyandi'],
          estimatedPrice: '₹400–600 per 100 ml',
        }),
      ],
      harvest: [],
    },
    diseases: [
      {
        id: 'early_blight',
        name: 'Early Blight',
        nameTe: 'Early Blight',
        symptoms: 'Brown concentric rings on lower leaves first',
        symptomsTe: 'Kinda leaves meeda brown rings',
        sprays: [
          spray({
            id: 'tom-eb-azox',
            productName: 'Azoxystrobin 23% SC',
            productNameTe: 'Azoxystrobin 23% SC',
            type: 'fungicide',
            target: 'Early blight',
            targetTe: 'Early blight',
            dose: '200 ml/acre',
            howToSpray: 'Remove severely infected leaves first, then spray',
            howToSprayTe: 'Chala affect aina leaves teesesi tarvata spray',
            bestTime: 'At first spot',
            precautions: ['PHI 14 days', 'Rotate with Mancozeb'],
            precautionsTe: ['PHI 14 rojulu', 'Mancozeb tho rotate'],
            estimatedPrice: '₹700–950 per 250 ml',
          }),
        ],
      },
    ],
  },

  wheat: {
    cropId: 'wheat',
    stages: [
      { id: 'tillering', name: 'Tillering', nameTe: 'Tillering', daysRange: '21–45 days' },
      { id: 'jointing', name: 'Jointing', nameTe: 'Jointing', daysRange: '45–60 days' },
      { id: 'heading', name: 'Heading & grain fill', nameTe: 'Heading', daysRange: '60–90 days' },
    ],
    fertilizersByStage: {
      tillering: [
        {
          name: 'Urea (1st dose)',
          nameTe: 'Urea',
          dose: '40 kg/acre',
          method: 'Broadcast before irrigation',
          timing: '21–25 DAS',
          estimatedPrice: '₹280–350 per bag',
        },
      ],
      jointing: [
        {
          name: 'Urea (2nd dose) + MOP',
          nameTe: 'Urea + MOP',
          dose: '30 kg urea + 15 kg MOP/acre',
          method: 'Broadcast',
          timing: 'CRI to jointing',
          estimatedPrice: '₹600–800/acre',
        },
      ],
      heading: [
        {
          name: 'Foliar urea 2%',
          nameTe: 'Foliar urea 2%',
          dose: '20 g/L at flag leaf',
          method: 'Foliar spray',
          timing: 'Heading stage if yellowing',
          estimatedPrice: '₹50–80/acre',
        },
      ],
    },
    preventiveSpraysByStage: {
      tillering: [],
      jointing: [
        spray({
          id: 'wheat-rust-prop',
          productName: 'Propiconazole 25% EC',
          productNameTe: 'Propiconazole 25% EC',
          type: 'fungicide',
          target: 'Yellow rust prevention',
          targetTe: 'Yellow rust',
          dose: '200 ml/acre',
          howToSpray: 'Fine mist when rust pustules first appear',
          howToSprayTe: 'Rust kanipinchagane fine mist',
          bestTime: 'Early symptom on flag leaf',
          precautions: ['PHI 35 days', 'Single spray often sufficient if early'],
          precautionsTe: ['PHI 35 rojulu', 'Mundu spray aithe chalu'],
          estimatedPrice: '₹500–700 per 250 ml',
        }),
      ],
      heading: [],
    },
    diseases: [
      {
        id: 'yellow_rust',
        name: 'Yellow Rust',
        nameTe: 'Yellow Rust',
        symptoms: 'Yellow stripes of pustules on leaves',
        symptomsTe: 'Leaves meeda yellow stripes',
        sprays: [
          spray({
            id: 'wheat-yr-tebu',
            productName: 'Tebuconazole 25% EC',
            productNameTe: 'Tebuconazole 25% EC',
            type: 'fungicide',
            target: 'Yellow rust',
            targetTe: 'Yellow rust',
            dose: '200 ml/acre',
            howToSpray: 'Spray at first sign; repeat if needed after 15 days',
            howToSprayTe: 'Kanipinchagane spray, avasaram unte 15 rojula tarvata',
            bestTime: 'Tillering to heading',
            precautions: ['PHI 35 days'],
            precautionsTe: ['PHI 35 rojulu'],
            estimatedPrice: '₹450–650 per 250 ml',
          }),
        ],
      },
    ],
  },
};

/** Fallback basic guide for crops without full data */
function basicGuide(cropId: string): CropProtectionGuide {
  return {
    cropId,
    stages: [
      { id: 'early', name: 'Early growth', nameTe: 'Aarambha perugudala', daysRange: '0–40 days' },
      { id: 'mid', name: 'Mid season', nameTe: 'Madya kalam', daysRange: '40–80 days' },
      { id: 'late', name: 'Late season', nameTe: 'Chivari dasa', daysRange: '80+ days' },
    ],
    fertilizersByStage: {
      early: [
        {
          name: 'NPK basal dose',
          nameTe: 'NPK basal',
          dose: 'As per soil test — typically 50 kg NPK/acre',
          method: 'Basal at sowing',
          timing: 'At sowing',
          estimatedPrice: '₹900–1,200 per 50 kg bag',
        },
      ],
      mid: [
        {
          name: 'Top dressing urea',
          nameTe: 'Urea top dressing',
          dose: '30–40 kg/acre',
          method: 'Broadcast before irrigation',
          timing: 'Mid vegetative stage',
          estimatedPrice: '₹280–350 per bag',
        },
      ],
      late: [],
    },
    preventiveSpraysByStage: {
      early: [
        spray({
          id: `${cropId}-neem`,
          productName: 'Neem oil 1%',
          productNameTe: 'Neem oil 1%',
          type: 'bio',
          target: 'General pest prevention',
          targetTe: 'SadharaNa pest rakshana',
          dose: '1 L/acre',
          howToSpray: 'Evening foliar spray',
          howToSprayTe: 'Evening spray',
          bestTime: 'Weekly in pest season',
          precautions: ['Safe bio-input', 'Strain before use'],
          precautionsTe: ['Safe bio', 'Filter chesi use cheyandi'],
          estimatedPrice: '₹180–280/L',
        }),
      ],
      mid: [],
      late: [],
    },
    diseases: [],
  };
}

export function getCropProtectionGuide(cropId: string): CropProtectionGuide {
  return CROP_PROTECTION_GUIDES[cropId] ?? basicGuide(cropId);
}

export const ALL_PROTECTION_CROP_IDS = [
  ...Object.keys(CROP_PROTECTION_GUIDES),
  'soybean',
  'sugarcane',
  'maize',
  'chickpea',
];
