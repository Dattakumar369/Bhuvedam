/** Growth stages used across product & disease catalogs */
export const GROWTH_STAGES = [
  'seedling',
  'vegetative',
  'tillering',
  'flowering',
  'fruiting',
  'maturity',
  'harvest',
] as const;

export const SOIL_TYPES = [
  'black_cotton',
  'red',
  'alluvial',
  'sandy_loam',
  'clay_loam',
  'laterite',
  'alkaline',
  'saline',
] as const;

export const NUTRIENT_DEFICIENCY_SYMPTOMS: Record<string, string[]> = {
  nitrogen: ['Yellowing of older leaves', 'Stunted growth', 'Pale green plant'],
  phosphorus: ['Purple/reddish leaves', 'Poor root development', 'Delayed maturity'],
  potassium: ['Leaf edge scorching', 'Weak stems', 'Poor fruit quality'],
  zinc: ['Interveinal chlorosis', 'Rosette leaves', 'Khaira in rice'],
  iron: ['Young leaf chlorosis', 'Veins stay green', 'Stunted shoots'],
  boron: ['Hollow stem', 'Poor fruit set', 'Cracked fruit'],
  sulphur: ['Uniform yellowing', 'Stunted growth', 'Reduced oil in oilseeds'],
  manganese: ['Grey speckled leaves', 'Interveinal chlorosis on young leaves'],
};

/** CIB&RC-style insecticide active ingredients (India registered) */
export const INSECTICIDE_ACTIVES: Array<{
  name: string;
  dose: string;
  targets: string[];
  crops: string[];
}> = [
  { name: 'Imidacloprid 17.8% SL', dose: '60 ml/acre', targets: ['Aphids', 'Jassids', 'Whitefly', 'BPH'], crops: ['cotton', 'rice', 'chilli', 'tomato', 'groundnut'] },
  { name: 'Lambda-cyhalothrin 5% EC', dose: '80 ml/acre', targets: ['Bollworm', 'Pod borer', 'Stem borer'], crops: ['cotton', 'chickpea', 'maize', 'tomato'] },
  { name: 'Chlorpyriphos 20% EC', dose: '250 ml/acre', targets: ['Stem borer', 'Root grubs', 'Termites'], crops: ['rice', 'sugarcane', 'groundnut', 'cotton'] },
  { name: 'Monocrotophos 36% SL', dose: '200 ml/acre', targets: ['Aphids', 'Thrips', 'Leaf hopper'], crops: ['cotton', 'chilli', 'brinjal', 'okra'] },
  { name: 'Quinalphos 25% EC', dose: '400 ml/acre', targets: ['Bollworm', 'Leaf roller', 'Gall fly'], crops: ['cotton', 'rice', 'mustard'] },
  { name: 'Dimethoate 30% EC', dose: '300 ml/acre', targets: ['Aphids', 'Mites', 'Jassids'], crops: ['cotton', 'chilli', 'citrus', 'vegetables'] },
  { name: 'Triazophos 40% EC', dose: '250 ml/acre', targets: ['Stem borer', 'Leaf folder', 'BPH'], crops: ['rice', 'cotton', 'soybean'] },
  { name: 'Profenofos 50% EC', dose: '200 ml/acre', targets: ['Bollworm', 'Spodoptera', 'Mites'], crops: ['cotton', 'chilli', 'soybean', 'tomato'] },
  { name: 'Spinosad 45% SC', dose: '80 ml/acre', targets: ['Fruit borer', 'Spodoptera', 'Thrips'], crops: ['cotton', 'chilli', 'tomato', 'cabbage'] },
  { name: 'Emamectin benzoate 5% SG', dose: '80 g/acre', targets: ['Bollworm', 'Fruit borer', 'DBM'], crops: ['cotton', 'chilli', 'tomato', 'cabbage'] },
  { name: 'Indoxacarb 14.5% SC', dose: '150 ml/acre', targets: ['Bollworm', 'Spodoptera', 'Leaf folder'], crops: ['cotton', 'rice', 'chilli'] },
  { name: 'Thiamethoxam 25% WG', dose: '40 g/acre', targets: ['Aphids', 'Jassids', 'Whitefly'], crops: ['cotton', 'rice', 'wheat', 'vegetables'] },
  { name: 'Acetamiprid 20% SP', dose: '40 g/acre', targets: ['Aphids', 'Whitefly', 'Jassids'], crops: ['cotton', 'chilli', 'brinjal', 'citrus'] },
  { name: 'Fipronil 5% SC', dose: '400 ml/acre', targets: ['Stem borer', 'White grubs', 'Termites'], crops: ['rice', 'sugarcane', 'groundnut'] },
  { name: 'Cartap hydrochloride 50% SP', dose: '500 g/acre', targets: ['BPH', 'Leaf folder', 'Stem borer'], crops: ['rice', 'cotton'] },
  { name: 'Buprofezin 25% SC', dose: '400 ml/acre', targets: ['BPH', 'Planthopper', 'Whitefly nymphs'], crops: ['rice', 'cotton', 'citrus'] },
  { name: 'Pymetrozine 50% WG', dose: '120 g/acre', targets: ['BPH', 'Aphids', 'Whitefly'], crops: ['rice', 'cotton', 'potato'] },
  { name: 'Flubendiamide 39.35% SC', dose: '60 ml/acre', targets: ['Bollworm', 'Fruit borer', 'Stem borer'], crops: ['cotton', 'chilli', 'tomato', 'rice'] },
  { name: 'Chlorantraniliprole 18.5% SC', dose: '60 ml/acre', targets: ['Bollworm', 'Spodoptera', 'Stem borer'], crops: ['cotton', 'rice', 'maize', 'soybean'] },
  { name: 'Abamectin 1.9% EC', dose: '200 ml/acre', targets: ['Mites', 'Thrips', 'Leaf miner'], crops: ['cotton', 'chilli', 'tomato', 'grapes'] },
  { name: 'Spiromesifen 22.9% SC', dose: '300 ml/acre', targets: ['Mites', 'Whitefly'], crops: ['cotton', 'chilli', 'tomato', 'citrus'] },
  { name: 'Diafenthiuron 50% WP', dose: '200 g/acre', targets: ['Whitefly', 'Mites', 'Thrips'], crops: ['cotton', 'chilli', 'citrus'] },
  { name: 'Novaluron 10% EC', dose: '400 ml/acre', targets: ['Bollworm', 'DBM', 'Fruit borer'], crops: ['cotton', 'cabbage', 'tomato'] },
  { name: 'Lufenuron 5.4% EC', dose: '400 ml/acre', targets: ['Bollworm', 'Spodoptera'], crops: ['cotton', 'chilli', 'tomato'] },
  { name: 'Metaflumizone 22% SC', dose: '200 ml/acre', targets: ['Bollworm', 'Beetle'], crops: ['cotton', 'potato', 'tomato'] },
  { name: 'Cyantraniliprole 10.26% OD', dose: '150 ml/acre', targets: ['Fruit borer', 'Thrips', 'Whitefly'], crops: ['cotton', 'chilli', 'vegetables'] },
  { name: 'Spinetoram 11.7% SC', dose: '100 ml/acre', targets: ['Fruit borer', 'Thrips', 'Leaf miner'], crops: ['cotton', 'chilli', 'apple'] },
  { name: 'Malathion 50% EC', dose: '500 ml/acre', targets: ['Aphids', 'Mealybug', 'Scale'], crops: ['citrus', 'mango', 'vegetables'] },
  { name: 'Dichlorvos 76% EC', dose: '250 ml/acre', targets: ['Stem borer', 'Pod borer'], crops: ['rice', 'pulses', 'vegetables'] },
  { name: 'Phosalone 35% EC', dose: '500 ml/acre', targets: ['Bollworm', 'Aphids'], crops: ['cotton', 'chilli', 'brinjal'] },
];

/** CIB&RC-style fungicide active ingredients */
export const FUNGICIDE_ACTIVES: Array<{
  name: string;
  dose: string;
  targets: string[];
  crops: string[];
}> = [
  { name: 'Mancozeb 75% WP', dose: '2 g/L', targets: ['Early blight', 'Late blight', 'Downy mildew'], crops: ['tomato', 'potato', 'grapes', 'chilli'] },
  { name: 'Carbendazim 50% WP', dose: '1 g/L', targets: ['Smut', 'Bunt', 'Root rot'], crops: ['wheat', 'rice', 'cotton', 'groundnut'] },
  { name: 'Tricyclazole 75% WP', dose: '120 g/acre', targets: ['Blast', 'Sheath blight'], crops: ['rice', 'wheat'] },
  { name: 'Propiconazole 25% EC', dose: '200 ml/acre', targets: ['Rust', 'Karnal bunt', 'Leaf spot'], crops: ['wheat', 'maize', 'groundnut'] },
  { name: 'Tebuconazole 25% EC', dose: '200 ml/acre', targets: ['Rust', 'Powdery mildew', 'Leaf spot'], crops: ['wheat', 'chilli', 'grapes'] },
  { name: 'Hexaconazole 5% SC', dose: '400 ml/acre', targets: ['Powdery mildew', 'Rust', 'Sheath blight'], crops: ['grapes', 'chilli', 'rice', 'mango'] },
  { name: 'Difenoconazole 25% EC', dose: '200 ml/acre', targets: ['Leaf spot', 'Anthracnose', 'Rust'], crops: ['grapes', 'mango', 'tomato', 'chilli'] },
  { name: 'Azoxystrobin 23% SC', dose: '200 ml/acre', targets: ['Leaf blight', 'Rust', 'Anthracnose'], crops: ['grapes', 'wheat', 'tomato', 'potato'] },
  { name: 'Copper oxychloride 50% WP', dose: '3 g/L', targets: ['Bacterial spot', 'Blight', 'Downy mildew'], crops: ['citrus', 'tomato', 'chilli', 'grapes'] },
  { name: 'Chlorothalonil 75% WP', dose: '2 g/L', targets: ['Early blight', 'Leaf spot', 'Anthracnose'], crops: ['tomato', 'potato', 'grapes', 'groundnut'] },
  { name: 'Metalaxyl + Mancozeb 72% WP', dose: '500 g/acre', targets: ['Late blight', 'Downy mildew', 'Damping off'], crops: ['potato', 'tomato', 'grapes', 'onion'] },
  { name: 'Validamycin 3% L', dose: '500 ml/acre', targets: ['Sheath blight', 'Root rot'], crops: ['rice', 'potato', 'vegetables'] },
  { name: 'Kasugamycin 3% SL', dose: '400 ml/acre', targets: ['Bacterial leaf blight', 'Blast'], crops: ['rice', 'citrus'] },
  { name: 'Streptocycline + Copper', dose: '0.5 g/L', targets: ['Bacterial blight', 'Canker'], crops: ['citrus', 'rice', 'tomato'] },
  { name: 'Sulphur 80% WP', dose: '2 g/L', targets: ['Powdery mildew', 'Rust'], crops: ['grapes', 'chilli', 'mango', 'vegetables'] },
  { name: 'Captan 50% WP', dose: '2 g/L', targets: ['Anthracnose', 'Fruit rot', 'Scab'], crops: ['grapes', 'apple', 'mango', 'tomato'] },
  { name: 'Thiophanate methyl 70% WP', dose: '500 g/acre', targets: ['Root rot', 'Collar rot', 'Wilt'], crops: ['groundnut', 'cotton', 'pulses'] },
  { name: 'Pseudomonas fluorescens 2% WP', dose: '5 g/kg seed', targets: ['Root rot', 'Wilt', 'Seed rot'], crops: ['rice', 'cotton', 'pulses', 'vegetables'] },
  { name: 'Trichoderma viride 1% WP', dose: '5 g/kg seed', targets: ['Root rot', 'Collar rot', 'Wilt'], crops: ['cotton', 'vegetables', 'pulses'] },
  { name: 'Bordeaux mixture 1%', dose: '1% spray', targets: ['Downy mildew', 'Anthracnose', 'Canker'], crops: ['grapes', 'citrus', 'mango'] },
];

/** Disease templates applied per crop category */
export const DISEASE_TEMPLATES: Array<{
  suffix: string;
  category: string;
  pathogen: string;
  symptoms: string;
  treatment: string;
  prevention: string;
  growthStage: string;
}> = [
  { suffix: 'leaf-blight', category: 'fungal', pathogen: 'Alternaria / Helminthosporium', symptoms: 'Brown lesions on leaves with concentric rings; premature defoliation', treatment: 'Mancozeb 75% WP @ 2 g/L or Azoxystrobin 23% SC', prevention: 'Crop rotation; remove infected debris; balanced fertilization', growthStage: 'vegetative' },
  { suffix: 'rust', category: 'fungal', pathogen: 'Puccinia spp.', symptoms: 'Orange-brown pustules on leaves and stems; reduced photosynthesis', treatment: 'Propiconazole 25% EC @ 200 ml/acre or Tebuconazole 25% EC', prevention: 'Resistant varieties; timely sowing; avoid excess nitrogen', growthStage: 'flowering' },
  { suffix: 'powdery-mildew', category: 'fungal', pathogen: 'Erysiphales', symptoms: 'White powdery patches on upper leaf surface; leaf curling', treatment: 'Sulphur 80% WP @ 2 g/L or Hexaconazole 5% SC', prevention: 'Adequate spacing; avoid shade; resistant varieties', growthStage: 'flowering' },
  { suffix: 'downy-mildew', category: 'fungal', pathogen: 'Peronospora / Plasmopara', symptoms: 'Yellow patches on upper leaf; grey mould on underside in humid weather', treatment: 'Metalaxyl + Mancozeb 72% WP @ 500 g/acre', prevention: 'Improve drainage; avoid overhead irrigation; crop rotation', growthStage: 'vegetative' },
  { suffix: 'wilt', category: 'fungal', pathogen: 'Fusarium / Verticillium', symptoms: 'One-sided wilting; yellowing; vascular browning; plant death', treatment: 'Carbendazim seed treatment; Trichoderma @ 5 g/kg seed; soil drench', prevention: 'Resistant varieties; crop rotation; avoid waterlogging', growthStage: 'vegetative' },
  { suffix: 'root-rot', category: 'fungal', pathogen: 'Rhizoctonia / Pythium', symptoms: 'Stunted growth; root browning; seedling damping off', treatment: 'Validamycin 3% L soil drench; Pseudomonas seed treatment', prevention: 'Well-drained soil; treat seeds; avoid excess moisture', growthStage: 'seedling' },
  { suffix: 'bacterial-blight', category: 'bacterial', pathogen: 'Xanthomonas / Pseudomonas', symptoms: 'Water-soaked angular lesions; yellow halos; leaf drying', treatment: 'Streptocycline + Copper oxychloride @ 0.5 g/L', prevention: 'Disease-free seed; copper preventive spray; field sanitation', growthStage: 'vegetative' },
  { suffix: 'viral-mosaic', category: 'viral', pathogen: 'Mosaic virus', symptoms: 'Mottled leaf pattern; leaf distortion; stunted growth', treatment: 'Rogue infected plants; control vector (aphids/whitefly)', prevention: 'Virus-free seed; vector control; resistant varieties', growthStage: 'seedling' },
  { suffix: 'leaf-spot', category: 'fungal', pathogen: 'Cercospora / Septoria', symptoms: 'Small dark spots with grey centres on leaves; defoliation', treatment: 'Mancozeb 75% WP @ 2 g/L; remove lower infected leaves', prevention: 'Field hygiene; balanced nutrition; crop rotation', growthStage: 'vegetative' },
  { suffix: 'stem-borer', category: 'pest', pathogen: 'Scirpophaga / Chilo', symptoms: 'Dead hearts in vegetative stage; white earheads at maturity', treatment: 'Cartap 50% SP @ 500 g/acre or Chlorantraniliprole 18.5% SC', prevention: 'Early planting; remove stubble; light traps', growthStage: 'tillering' },
  { suffix: 'aphids', category: 'pest', pathogen: 'Aphididae', symptoms: 'Curled leaves; honeydew; sooty mould; virus transmission', treatment: 'Imidacloprid 17.8% SL @ 60 ml/acre or Thiamethoxam 25% WG', prevention: 'Monitor regularly; conserve natural enemies; reflective mulch', growthStage: 'vegetative' },
  { suffix: 'deficiency-n', category: 'nutrient', pathogen: 'Nitrogen deficiency', symptoms: 'Yellowing of older leaves from tip; stunted plant; low yield', treatment: 'Urea split application 40+30 kg N/acre as per crop stage', prevention: 'Soil test; balanced NPK; organic matter addition', growthStage: 'vegetative' },
  { suffix: 'deficiency-p', category: 'nutrient', pathogen: 'Phosphorus deficiency', symptoms: 'Purple/reddish older leaves; poor root; delayed flowering', treatment: 'DAP 50–65 kg/acre basal or SSP 100 kg/acre', prevention: 'Apply P at sowing; maintain soil pH 6–7', growthStage: 'seedling' },
  { suffix: 'deficiency-k', category: 'nutrient', pathogen: 'Potassium deficiency', symptoms: 'Leaf edge scorching; lodging; poor grain/fruit quality', treatment: 'MOP 20–40 kg/acre at flowering or fruit set', prevention: 'Soil test; return crop residue; avoid excess N without K', growthStage: 'flowering' },
  { suffix: 'deficiency-zn', category: 'nutrient', pathogen: 'Zinc deficiency', symptoms: 'Interveinal chlorosis; rosette leaves; khaira in rice', treatment: 'Zinc sulphate 21% @ 10–25 kg/acre or 0.5% foliar spray', prevention: 'Soil test; apply Zn on alkaline/calcareous soils', growthStage: 'vegetative' },
];

/** Fertilizer base products for crop×soil×stage expansion */
export const FERTILIZER_BASES: Array<{
  id: string;
  name: string;
  brand: string;
  type: string;
  npk: string;
  nutrient: string;
  baseDose: string;
  application: string[];
}> = [
  { id: 'urea', name: 'Neem Coated Urea', brand: 'IFFCO', type: 'Nitrogen', npk: '46-0-0', nutrient: 'N 46%', baseDose: '45 kg/acre', application: ['Basal', 'Top dressing'] },
  { id: 'nano-urea', name: 'Nano Urea (IFFCO)', brand: 'IFFCO', type: 'Nano-fertilizer', npk: '4-0-0', nutrient: 'N 4% nano — 500 ml bottle ≈ 1 bag (45 kg) urea/acre', baseDose: '500 ml/acre foliar spray', application: ['Foliar'] },
  { id: 'nano-dap', name: 'Nano DAP (IFFCO)', brand: 'IFFCO', type: 'Nano-fertilizer', npk: '8-16-0', nutrient: 'N 8%, P 16% nano form', baseDose: '500 ml/acre', application: ['Foliar', 'Seed treatment'] },
  { id: 'dap', name: 'DAP', brand: 'IFFCO', type: 'Phosphatic', npk: '18-46-0', nutrient: 'N 18%, P₂O₅ 46%', baseDose: '50 kg/acre', application: ['Basal'] },
  { id: 'mop', name: 'MOP (Muriate of Potash)', brand: 'Coromandel', type: 'Potassic', npk: '0-0-60', nutrient: 'K₂O 60%', baseDose: '25 kg/acre', application: ['Basal', 'Top dressing'] },
  { id: 'ssp', name: 'SSP', brand: 'Coromandel', type: 'Phosphatic', npk: '0-16-0', nutrient: 'P 16%, S 11%, Ca 19%', baseDose: '100 kg/acre', application: ['Basal'] },
  { id: 'npk-10-26-26', name: 'NPK 10-26-26', brand: 'IFFCO', type: 'NPK Complex', npk: '10-26-26', nutrient: 'N 10%, P 26%, K 26%', baseDose: '60 kg/acre', application: ['Basal'] },
  { id: 'npk-12-32-16', name: 'NPK 12-32-16', brand: 'Coromandel', type: 'NPK Complex', npk: '12-32-16', nutrient: 'N 12%, P 32%, K 16%', baseDose: '60 kg/acre', application: ['Basal'] },
  { id: 'npk-15-15-15', name: 'NPK 15-15-15', brand: 'IFFCO', type: 'NPK Complex', npk: '15-15-15', nutrient: 'N 15%, P 15%, K 15%', baseDose: '80 kg/acre', application: ['Basal'] },
  { id: 'npk-20-20-0-13', name: 'NP(S) 20-20-0-13', brand: 'Coromandel', type: 'NPK Complex', npk: '20-20-0-13', nutrient: 'N 20%, P 20%, S 13%', baseDose: '100 kg/acre', application: ['Basal'] },
  { id: 'zinc-sulphate', name: 'Zinc Sulphate 21%', brand: 'NFL', type: 'Micronutrient', npk: '0-0-0', nutrient: 'Zn 21%', baseDose: '10 kg/acre', application: ['Basal', 'Foliar'] },
  { id: 'boron', name: 'Borax / Boron', brand: 'Nagarjuna', type: 'Micronutrient', npk: '0-0-0', nutrient: 'B 10–15%', baseDose: '3 kg/acre', application: ['Basal', 'Foliar'] },
  { id: 'fym', name: 'Farm Yard Manure', brand: 'Organic', type: 'Organic', npk: '0.5-0.2-0.5', nutrient: 'Organic matter 15–25%', baseDose: '5 t/acre', application: ['Basal'] },
  { id: 'vermicompost', name: 'Vermicompost', brand: 'Organic', type: 'Organic', npk: '1.5-0.8-0.9', nutrient: 'Organic carbon rich', baseDose: '2 t/acre', application: ['Basal'] },
  { id: 'rhizobium', name: 'Rhizobium Bio-fertilizer', brand: 'NFL', type: 'Bio-fertilizer', npk: '0-0-0', nutrient: 'Rhizobium bacteria', baseDose: '200 g/acre seed treat', application: ['Seed treatment'] },
  { id: 'psb', name: 'PSB Bio-fertilizer', brand: 'NFL', type: 'Bio-fertilizer', npk: '0-0-0', nutrient: 'Phosphate solubilizing bacteria', baseDose: '200 g/acre', application: ['Seed treatment', 'Soil'] },
  { id: 'azotobacter', name: 'Azotobacter Bio-fertilizer', brand: 'NFL', type: 'Bio-fertilizer', npk: '0-0-0', nutrient: 'Azotobacter', baseDose: '200 g/acre', application: ['Seed treatment'] },
  { id: 'calcium-nitrate', name: 'Calcium Nitrate', brand: 'Deepak', type: 'Nitrogen', npk: '15.5-0-0', nutrient: 'N 15.5%, Ca 19%', baseDose: '5 kg/acre fertigation', application: ['Fertigation', 'Foliar'] },
  { id: 'npk-19-19-19', name: 'NPK 19-19-19 (Water soluble)', brand: 'Nagarjuna', type: 'NPK Complex', npk: '19-19-19', nutrient: 'N 19%, P 19%, K 19%', baseDose: '2 kg/acre/week drip', application: ['Fertigation', 'Foliar'] },
  { id: 'ammonium-sulphate', name: 'Ammonium Sulphate', brand: 'DoF', type: 'Nitrogen', npk: '21-0-0', nutrient: 'N 21%, S 24%', baseDose: '75 kg/acre', application: ['Basal', 'Top dressing'] },
  { id: 'map', name: 'MAP 12-61-0', brand: 'Nagarjuna', type: 'Phosphatic', npk: '12-61-0', nutrient: 'N 12%, P 61%', baseDose: '50 kg/acre', application: ['Basal', 'Fertigation'] },
  { id: 'sop', name: 'Sulphate of Potash', brand: 'Deepak', type: 'Potassic', npk: '0-0-50', nutrient: 'K₂O 50%, S 18%', baseDose: '25 kg/acre', application: ['Basal'] },
];

/** Indian agrochemical brands for product name variants */
export const AGRO_BRANDS = [
  'IFFCO', 'Coromandel', 'NFL', 'Nagarjuna', 'Deepak', 'UPL', 'Rallis', 'Bayer',
  'Syngenta', 'Corteva', 'PI Industries', 'Dhanuka', 'Meghmani', 'Crystal', 'Indofil',
  'Biostadt', 'Krishi Rasayan', 'Tagros', 'Heranba', 'Gharda', 'Sumitomo', 'Adama',
  'NACL', 'Shreeji', 'Willowood', 'Insecticides India', 'BASF', 'FMC', 'Tata Rallis',
];
