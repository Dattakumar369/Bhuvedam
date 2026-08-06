import type { PublicationEntry } from './publicationTypes';

/**
 * ICAR publications — Package of Practices, research bulletins, IPM guides.
 * Sources: ICAR institutes, AICRIP, DSR, CICR, IIHR, CRIDA.
 */
export const ICAR_PUBLICATIONS: PublicationEntry[] = [
  {
    id: 'icar-pop-rice-kharif',
    source: 'icar',
    type: 'guide',
    title: 'ICAR Package of Practices — Kharif rice (irrigated transplanted)',
    titleTe: 'ICAR POP — Kharif vari (nati)',
    summary: 'Complete rice cultivation from nursery to harvest — varieties, fertilizer splits, water management, blast/BPH control.',
    content: `Nursery: 40–50 days old seedlings, 20×15 cm spacing. Apply 5 t FYM/acre before puddling.
Basal: DAP 40 kg + Zinc sulphate 5 kg/acre. N in 3 splits — 50% basal, 25% tillering (25–30 DAT), 25% panicle initiation (45–50 DAT).
Water: Maintain 2–5 cm during tillering; intermittent irrigation after flowering saves 30% water.
Diseases: Seed treat Tricyclazole 0.1% or Carbendazim 2 g/kg. Blast — spray Tricyclazole 75% WP 120 g/acre at boot leaf stage if symptoms appear.
Pests: BPH economic threshold 5 hoppers/hill — avoid excess nitrogen; use neem oil 5 ml/L or Buprofezin 25% SC 200 ml/acre.
Harvest: When 80% grains turn golden yellow; moisture 20–22% at threshing.`,
    cropTags: ['rice'],
    tags: ['package-of-practices', 'kharif', 'IPM', 'fertilizer'],
    season: 'kharif',
    state: 'India',
    publisher: 'ICAR — DSR / AICRIP',
    documentType: 'package_of_practices',
    url: 'https://www.icar.org.in/en/crop-science/rice',
    publishedYear: 2023,
  },
  {
    id: 'icar-pop-cotton-ipm',
    source: 'icar',
    type: 'guide',
    title: 'ICAR Cotton IPM — bollworm, whitefly, pink bollworm management',
    titleTe: 'ICAR Cotton IPM — bollworm, whitefly control',
    summary: 'Integrated pest management for cotton — pheromone traps, ETL, selective insecticides, natural enemy conservation.',
    content: `Varieties: Use Bt cotton hybrids approved for your zone. Avoid same hybrid >3 seasons.
Monitoring: 5 Heliothis pheromone traps/acre + 10 yellow sticky traps for whitefly.
ETL: Bollworm — 2 egg masses or 10 larvae/100 plants. Whitefly — 10 adults/leaf in top canopy.
Spray only at ETL: Emamectin benzoate 5% SG 80 g/acre OR Spinosad 45% SC 150 ml/acre. Rotate chemical groups.
Pink bollworm: Deep plough after harvest; destroy crop residue; avoid late sowing.
Nutrition: NPK 12:32:16 50 kg/acre at square formation; side-dress urea 25 kg at flowering.`,
    cropTags: ['cotton'],
    tags: ['IPM', 'bollworm', 'whitefly', 'pink-bollworm'],
    season: 'kharif',
    publisher: 'ICAR — CICR',
    documentType: 'package_of_practices',
    url: 'https://cICR.org.in/',
    publishedYear: 2022,
  },
  {
    id: 'icar-wheat-rust-bulletin',
    source: 'icar',
    type: 'disease',
    title: 'ICAR Wheat Rust Alert — yellow rust monitoring and fungicide timing',
    summary: 'Yellow and brown rust identification, resistant varieties, Propiconazole/Tebuconazole spray schedule.',
    content: `Yellow rust: Bright yellow stripes on leaves — appears Jan–Feb in North/Central India.
Resistant varieties: HD 3086, PBW 725, DBW 187, WH 1105 (check zone suitability).
First spray: Propiconazole 25% EC 200 ml/acre OR Tebuconazole 25% EC 200 ml/acre at first pustule on flag leaf.
Repeat after 15 days if disease progresses. Do not spray after milk stage.
Cultural: Avoid late sowing; remove volunteer wheat; balanced nitrogen only.`,
    cropTags: ['wheat'],
    tags: ['yellow-rust', 'fungicide', 'disease-alert'],
    season: 'rabi',
    publisher: 'ICAR — IIWBR',
    documentType: 'bulletin',
    url: 'https://www.icar.org.in/',
    publishedYear: 2024,
  },
  {
    id: 'icar-maize-faw-management',
    source: 'icar',
    type: 'pest',
    title: 'ICAR Fall Armyworm (FAW) management in maize',
    summary: 'Early detection, pheromone traps, biological and chemical control of Spodoptera frugiperda in maize.',
    content: `Scout weekly from 15 DAS — look for "window pane" damage and frass in whorl.
Pheromone traps: 4 traps/acre for mass trapping.
Biological: Release Trichogramma 50,000/acre at 15 and 25 DAS. Neem oil 5 ml/L whorl application.
Chemical (at ETL 10% plants with whorl damage): Emamectin benzoate 5% SG 88 g/acre OR Spinetoram 11.7% SC 90 ml/acre.
Apply in evening; direct spray into whorl. Rotate modes of action to prevent resistance.`,
    cropTags: ['maize'],
    tags: ['fall-armyworm', 'FAW', 'IPM'],
    season: 'kharif',
    publisher: 'ICAR — IIMR',
    documentType: 'bulletin',
    publishedYear: 2023,
  },
  {
    id: 'icar-groundnut-aflatoxin',
    source: 'icar',
    type: 'guide',
    title: 'ICAR Groundnut production — gypsum, rhizobium, aflatoxin prevention',
    summary: 'Groundnut package: seed treatment, gypsum at pegging, irrigation at critical stages, drying to prevent aflatoxin.',
    content: `Seed: Rhizobium + PSB culture treatment. DAP 40 kg/acre basal.
Gypsum: 400 kg/ha at peg formation — essential for pod filling and kernel quality.
Irrigation: Critical at flowering and pegging; avoid waterlogging.
Diseases: Tikka — Mancozeb 2 g/L at 15-day interval from 30 DAS. Collar rot — seed treat with Trichoderma 4 g/kg.
Harvest: When leaves turn yellow; dig carefully; dry pods to 8% moisture within 3 days to prevent aflatoxin.`,
    cropTags: ['groundnut'],
    tags: ['gypsum', 'rhizobium', 'aflatoxin'],
    season: 'kharif',
    publisher: 'ICAR — DGR',
    documentType: 'package_of_practices',
    url: 'https://www.icar.org.in/',
    publishedYear: 2022,
  },
  {
    id: 'icar-chilli-disease-ipm',
    source: 'icar',
    type: 'disease',
    title: 'ICAR Chilli disease management — die-back, anthracnose, leaf curl',
    summary: 'Chilli major diseases in India: symptom ID, nursery hygiene, fungicide and vector management.',
    content: `Die-back (Colletotrichum): Dark lesions on fruits and stems. Spray Mancozeb 2 g/L + Carbendazim 1 g/L at 10-day intervals from fruit set.
Anthracnose: Circular sunken spots on fruits. Copper oxychloride 3 g/L preventive spray.
Leaf curl (virus): Whitefly vector — yellow sticky traps 20/acre; Imidacloprid 17.8% SL 60 ml/acre at ETL.
Nursery: Treat seeds with Trichoderma 4 g/kg; avoid overhead irrigation; rogue infected seedlings.`,
    cropTags: ['chilli'],
    tags: ['anthracnose', 'die-back', 'leaf-curl', 'whitefly'],
    season: 'year-round',
    publisher: 'ICAR — IIHR',
    documentType: 'bulletin',
    publishedYear: 2023,
  },
  {
    id: 'icar-soil-health-inm',
    source: 'icar',
    type: 'fertilizer',
    title: 'ICAR Integrated Nutrient Management (INM) — Soil Health Card based',
    summary: 'Combine organic manure, bio-fertilizers and chemical fertilizers per Soil Health Card recommendations.',
    content: `Test soil every 3 years via Soil Health Card (soilhealth.dac.gov.in).
Organic: 5–10 t FYM/acre or 2 t compost + green manure before kharif rice.
Bio-fertilizers: Rhizobium for pulses, Azotobacter for cereals, PSB for phosphorus solubilization.
Chemical: Apply 50–75% recommended dose when organic carbon >0.5%. Use neem-coated urea.
Micronutrients: Zinc, boron, iron per SHC — foliar spray more efficient on alkaline soils.`,
    cropTags: [],
    tags: ['INM', 'soil-health-card', 'organic'],
    state: 'India',
    publisher: 'ICAR — CRIDA',
    documentType: 'publication',
    url: 'https://www.icar.org.in/',
    publishedYear: 2024,
  },
  {
    id: 'icar-redgram-wilt',
    source: 'icar',
    type: 'disease',
    title: 'ICAR Redgram (tur/arhar) wilt and pod borer management',
    summary: 'Fusarium wilt prevention, Maruca pod borer IPM, rhizobium seed treatment for redgram.',
    content: `Wilt: Use resistant varieties (TS-3R, ICPL 87119). Seed treat Trichoderma 4 g/kg + Carbendazim 2 g/kg. Avoid waterlogging.
Pod borer (Maruca): Install 5 pheromone traps/acre. Spray Indoxacarb 14.5% SC 200 ml/acre at 50% flowering if larval damage >5 pods/plant.
Nutrition: Rhizobium mandatory. DAP 40 kg/acre basal. No top-dress nitrogen needed.
Intercropping: Redgram + cotton or redgram + sorghum reduces pest buildup.`,
    cropTags: ['redgram', 'tur', 'arhar'],
    tags: ['wilt', 'pod-borer', 'pulses'],
    season: 'kharif',
    publisher: 'ICAR — IIPR',
    documentType: 'bulletin',
    publishedYear: 2023,
  },
  {
    id: 'icar-sugarcane-redrot',
    source: 'icar',
    type: 'disease',
    title: 'ICAR Sugarcane red rot and smut — identification and control',
    summary: 'Red rot symptom (reddish internal tissues), resistant varieties, seed cane treatment, trash mulching.',
    content: `Red rot: Reddish discolouration inside cane with alcoholic smell. Use resistant varieties (Co 0238, CoS 767).
Sett treatment: Carbendazim 0.1% + Quinalphos 0.05% dip for 15 min before planting.
Smut: Black whip-like structure — rogue and burn infected clumps; treat setts with Carbendazim.
Nutrition: N 250 kg/ha in 3 splits; trash mulching conserves moisture and adds potassium.
Harvest: Avoid ratoon on heavily diseased fields.`,
    cropTags: ['sugarcane'],
    tags: ['red-rot', 'smut', 'disease'],
    publisher: 'ICAR — SBI',
    documentType: 'bulletin',
    publishedYear: 2022,
  },
  {
    id: 'icar-tomato-tuta-absoluta',
    source: 'icar',
    type: 'pest',
    title: 'ICAR Tomato leaf miner (Tuta absoluta) IPM guide',
    summary: 'Tuta absoluta monitoring with pheromone traps, biological control, selective insecticides.',
    content: `Monitoring: 3 pheromone traps/acre — peak activity in summer.
Biological: Release Nesidiocoris 5/adult plant in protected cultivation.
Cultural: Remove mined leaves; destroy crop residue after harvest.
Chemical (at ETL): Chlorantraniliprole 18.5% SC 60 ml/acre OR Abamectin 1.9% EC 200 ml/acre. Rotate with different IRAC groups.
Avoid broad-spectrum pyrethroids — kills natural enemies.`,
    cropTags: ['tomato'],
    tags: ['tuta-absoluta', 'leaf-miner', 'IPM'],
    season: 'year-round',
    publisher: 'ICAR — IIHR',
    documentType: 'bulletin',
    publishedYear: 2024,
  },
  {
    id: 'icar-rice-stem-borer',
    source: 'icar',
    type: 'pest',
    title: 'ICAR Rice stem borer (yellow stem borer, gall midge) management',
    titleTe: 'ICAR — Vari stem borer control',
    summary: 'Dead heart / white ear symptoms, light traps, Cartap/Chlorantraniliprole spray timing for rice stem borers.',
    content: `Yellow stem borer: Dead heart in vegetative stage; white ear at panicle stage.
Gall midge: Silver shoot / onion leaf — common in early transplanted rice.
Monitoring: Light traps 1/acre; scout for egg masses on leaf tips.
Cultural: Clip leaf tips before transplant; avoid late planting; destroy stubbles.
Chemical (at ETL): Cartap hydrochloride 4G 8 kg/acre OR Chlorantraniliprole 18.5% SC 60 ml/acre at early dead heart stage.
Seed/seedling: Treat with Chlorpyriphos 20 EC 3 ml/kg or Fipronil 0.3% GR in nursery.`,
    cropTags: ['rice'],
    tags: ['stem-borer', 'gall-midge', 'dead-heart'],
    season: 'kharif',
    publisher: 'ICAR — DSR',
    documentType: 'bulletin',
    publishedYear: 2023,
  },
  {
    id: 'icar-greengram-blackgram',
    source: 'icar',
    type: 'guide',
    title: 'ICAR Greengram and blackgram — kharif pulses package',
    summary: 'Short-duration pulses: varieties, rhizobium, yellow mosaic virus, pod borer control.',
    content: `Greengram: VBN 8, PDM 139 (summer); Kharif sow June–July, 30×10 cm.
Blackgram: T 9, LBG 752 — avoid waterlogging.
Seed treat: Rhizobium + Carbendazim 2 g/kg.
Yellow mosaic virus: Rogue infected plants; control whitefly — Imidacloprid 60 ml/acre.
Pod borer: Spray Indoxacarb 200 ml/acre at 50% flowering if damage >5%.
Harvest: When 80% pods turn black; spray 2 days before harvest to reduce shattering.`,
    cropTags: ['greengram', 'blackgram', 'pulses'],
    tags: ['rhizobium', 'yellow-mosaic', 'pod-borer'],
    season: 'kharif',
    publisher: 'ICAR — IIPR',
    documentType: 'package_of_practices',
    url: 'https://www.icar.org.in/',
    publishedYear: 2023,
  },
  {
    id: 'icar-chickpea-wilt-rootrot',
    source: 'icar',
    type: 'disease',
    title: 'ICAR Chickpea wilt, root rot and pod borer — rabi package',
    summary: 'Fusarium wilt resistant varieties, seed treatment, H. armigera pod borer IPM for chickpea.',
    content: `Wilt: JG 11, JG 16, KAK 2 — use resistant types. Seed treat Trichoderma 4 g/kg + Carbendazim 2 g/kg.
Root rot: Avoid heavy soils without drainage; treat seed with Metalaxyl 6 g/kg.
Pod borer (Helicoverpa): Pheromone traps 5/acre; ETL 5 larvae/m row.
Spray: Indoxacarb 14.5% SC 200 ml/acre OR Emamectin benzoate at pod formation.
Nutrition: DAP 40 kg/acre basal; no nitrogen top dressing.`,
    cropTags: ['chickpea'],
    tags: ['wilt', 'pod-borer', 'rabi'],
    season: 'rabi',
    publisher: 'ICAR — IIPR',
    documentType: 'package_of_practices',
    publishedYear: 2023,
  },
  {
    id: 'icar-sunflower-seed-maggot',
    source: 'icar',
    type: 'pest',
    title: 'ICAR Sunflower cultivation and head borer / seed maggot control',
    summary: 'Sunflower hybrids, fertilizer schedule, capitulum borer and seed maggot management.',
    content: `Hybrids: KBSH 1, PAC 36, DSF 1 — sow June–July or Jan–Feb rabi.
Fertilizer: NPK 60:40:40 kg/ha; half N basal, half at button stage.
Irrigation: Critical at bud, flowering and seed filling.
Head borer: Spray Spinosad 45% SC 150 ml/acre at 10% capitulum damage.
Seed maggot: Seed treat Imidacloprid 70 WS 5 g/kg; avoid late sowing.
Harvest: When back of head turns yellow; dry seeds to 9% moisture.`,
    cropTags: ['sunflower'],
    tags: ['head-borer', 'seed-maggot', 'oilseed'],
    season: 'kharif',
    publisher: 'ICAR — IIOR',
    documentType: 'package_of_practices',
    publishedYear: 2022,
  },
  {
    id: 'icar-banana-panama-wilt',
    source: 'icar',
    type: 'disease',
    title: 'ICAR Banana Panama wilt and sigatoka leaf spot management',
    summary: 'Panama wilt resistant varieties, tissue culture plants, Mancozeb spray for sigatoka.',
    content: `Panama wilt (Fusarium): Use resistant Grand Naine, Robusta TC plants from certified nurseries.
Avoid planting in wilt-history fields without fallow + Trichoderma drench.
Sigatoka: Mancozeb 2 g/L + Copper oxychloride 3 g/L alternate sprays every 15 days in monsoon.
Nematode: Carbofuran 3G 20 g/pit at planting in infested fields.
Nutrition: NPK 200:60:300 g/plant/year in 6 splits through drip.`,
    cropTags: ['banana'],
    tags: ['panama-wilt', 'sigatoka', 'horticulture'],
    season: 'year-round',
    publisher: 'ICAR — IIHR',
    documentType: 'bulletin',
    publishedYear: 2023,
  },
  {
    id: 'icar-onion-purple-blotch',
    source: 'icar',
    type: 'disease',
    title: 'ICAR Onion thrips and purple blotch disease management',
    summary: 'Onion thrips scouting, Mancozeb/Copper for purple blotch, bulb storage guidelines.',
    content: `Thrips: Silvery streaks on leaves — ETL 5 thrips/leaf. Fipronil 400 ml/acre OR Spinosad 150 ml/acre.
Purple blotch: Brown lesions with purple margins — Mancozeb 2 g/L + Mancozeb-Carbendazim from 45 DAT.
Basal rot: Avoid over-irrigation; treat sets with Carbendazim 0.1% dip.
Storage: Cure bulbs 3–4 days in field; store in ventilated godown at 25–30°C, 65–70% RH.`,
    cropTags: ['onion'],
    tags: ['thrips', 'purple-blotch', 'storage'],
    season: 'rabi',
    publisher: 'ICAR — IIHR',
    documentType: 'bulletin',
    publishedYear: 2023,
  },
  {
    id: 'icar-citrus-citrus-greening',
    source: 'icar',
    type: 'disease',
    title: 'ICAR Citrus psylla and nutrient deficiency diagnosis',
    summary: 'Huanglongbing awareness, psylla control, zinc/iron/magnesium deficiency symptoms in citrus.',
    content: `Psylla vector: Monitor yellow sticky traps; Imidacloprid 17.8% SL 60 ml/acre at flush.
HLB symptoms: Asymmetric blotchy mottle, yellow shoots — rogue infected trees; no cure — prevent vector.
Zinc deficiency: Small interveinal yellow leaves — Zinc sulphate 0.5% foliar 3 sprays at flush.
Iron: Apply on calcareous soils — Ferrous sulphate 0.5% foliar.
Magnesium: Dolomite or MgSO4 foliar on acid sandy soils.`,
    cropTags: ['citrus', 'sweet-orange', 'lemon'],
    tags: ['psylla', 'micronutrient', 'HLB'],
    season: 'year-round',
    publisher: 'ICAR — CCRI',
    documentType: 'publication',
    url: 'https://www.icar.org.in/',
    publishedYear: 2024,
  },
  {
    id: 'icar-castor-jassids',
    source: 'icar',
    type: 'pest',
    title: 'ICAR Castor cultivation and semilooper / jassids / capsule borer IPM',
    summary: 'Castor hybrids, ricin-free varieties, semilooper and capsule borer spray schedule.',
    content: `Varieties: DCH 177, DCS 9 (hybrids); GCH 7 for rainfed.
Semilooper/capsule borer: Pheromone traps 5/acre; Spinosad 150 ml/acre at ETL.
Jassids & thrips: Neem oil 5 ml/L at early vegetative stage.
Seed treat: Carbendazim 2 g/kg + Imidacloprid 5 g/kg.
Harvest: Pick capsules in 3–4 pickings when they turn brown.`,
    cropTags: ['castor'],
    tags: ['semilooper', 'jassids', 'oilseed'],
    season: 'kharif',
    publisher: 'ICAR — DOR',
    documentType: 'package_of_practices',
    publishedYear: 2022,
  },
  {
    id: 'icar-organic-farming-certification',
    source: 'icar',
    type: 'guide',
    title: 'ICAR Organic farming — NPOP standards and conversion period',
    summary: 'Organic conversion 2–3 years, permitted inputs, pest control with neem, Trichoderma, pheromone traps.',
    content: `Conversion: Minimum 2 years for annual crops before organic certification (NPOP/PGS).
Permitted inputs: FYM, compost, vermicompost, neem cake, bio-pesticides (Trichoderma, Pseudomonas, Bt).
Prohibited: Synthetic pesticides, herbicides, GMO seeds, sewage sludge.
Pest control: Neem oil 5 ml/L, cow urine formulations, light traps, bird perches.
Certification: Contact APEDA accredited agency or join PGS-India local group.`,
    cropTags: [],
    tags: ['organic', 'NPOP', 'PGS', 'sustainable'],
    state: 'India',
    publisher: 'ICAR — NCOF',
    documentType: 'publication',
    url: 'https://www.icar.org.in/',
    publishedYear: 2024,
  },
  {
    id: 'icar-pesticide-phi-safety',
    source: 'icar',
    type: 'guide',
    title: 'ICAR Pesticide safety — PHI, MRL, and sprayer calibration',
    summary: 'Pre-harvest interval compliance, label reading, nozzle calibration, PPE for spray operators.',
    content: `Always read label for dose, crop, pest, and PHI (days before harvest).
Examples: Spinosad PHI 3 days chilli; Imidacloprid PHI 7–14 days varies by crop.
MRL: Export crops must meet EU/US maximum residue limits — maintain spray diary.
Calibration: 500 L/acre hydraulic sprayer — collect nozzle output 1 min, adjust pressure.
PPE: Mask with organic vapour filter, gloves, goggles, full sleeves; triple rinse empty containers.`,
    cropTags: [],
    tags: ['PHI', 'MRL', 'safety', 'sprayer'],
    state: 'India',
    publisher: 'ICAR — NRCC',
    documentType: 'publication',
    url: 'https://www.icar.org.in/',
    publishedYear: 2024,
  },
  {
    id: 'icar-seed-treatment-master',
    source: 'icar',
    type: 'guide',
    title: 'ICAR Seed treatment master guide — fungicide + insecticide + bioagents',
    summary: 'Standard seed treatment doses for major crops before sowing or transplanting.',
    content: `Fungicide: Carbendazim 2 g/kg OR Thiram 2.5 g/kg — all crops.
Insecticide: Imidacloprid 70 WS 5 g/kg OR Chlorpyriphos 20 EC 3 ml/kg seed.
Bio: Trichoderma 4 g/kg + Pseudomonas 10 g/kg for pulses and vegetables.
Rhizobium: 5 packets (200 g)/10 kg seed for pulses — do not mix with chemical fungicide (apply separately).
Slurry method: Mix treatment agents in minimum water; shade-dry 30 min before sowing.`,
    cropTags: [],
    tags: ['seed-treatment', 'Trichoderma', 'rhizobium'],
    state: 'India',
    publisher: 'ICAR — IARI',
    documentType: 'publication',
    publishedYear: 2023,
  },
  {
    id: 'icar-potato-late-blight',
    source: 'icar',
    type: 'disease',
    title: 'ICAR Potato late blight (Phytophthora) — forecast-based fungicide spray',
    summary: 'Late blight water-soaked lesions, Metalaxyl-Mancozeb/Cymoxanil spray, seed tuber treatment.',
    content: `Symptoms: Water-soaked lesions on leaves; white sporulation under humid conditions; tuber rot brown-purple.
Forecast: Spray preventive when weather favours (cool + humid) — don't wait for full epidemic.
Spray: Mancozeb 2 g/L + Metalaxyl 1 g/L OR Cymoxanil + Mancozeb at 7–10 day interval.
Seed tuber: Treat with Metalaxyl 0.1% dip or use certified disease-free seed.
Varieties: Kufri Jyoti, Kufri Pukhraj — moderate resistance where available.`,
    cropTags: ['potato'],
    tags: ['late-blight', 'Phytophthora', 'fungicide'],
    season: 'rabi',
    publisher: 'ICAR — CPRI',
    documentType: 'bulletin',
    publishedYear: 2023,
  },
  {
    id: 'icar-turmeric-rhizome-rot',
    source: 'icar',
    type: 'disease',
    title: 'ICAR Turmeric rhizome rot and leaf spot management',
    summary: 'Pythium rhizome rot, leaf spot, shoot borer in turmeric — drench and spray schedule.',
    content: `Rhizome rot: Yellowing wilt; rhizome soft brown rot — seed rhizome treat Mancozeb 0.3% dip 30 min.
Drench: Metalaxyl-Mancozeb 1 g/L at rhizome formation if heavy rain.
Leaf spot: Mancozeb 2 g/L every 15 days from 60 DAP.
Shoot borer: Carbaryl 2 g/L OR Chlorantraniliprole 60 ml/acre if larval damage in pseudostem.
Planting: Raised beds with drainage; 25×20 cm spacing; 1500 kg rhizome/acre.`,
    cropTags: ['turmeric'],
    tags: ['rhizome-rot', 'leaf-spot', 'spice'],
    season: 'kharif',
    publisher: 'ICAR — IISR',
    documentType: 'package_of_practices',
    publishedYear: 2023,
  },
  {
    id: 'icar-cotton-leaf-curl-virus',
    source: 'icar',
    type: 'disease',
    title: 'ICAR Cotton leaf curl virus (CLCuD) — whitefly vector management',
    summary: 'CLCuD symptoms, resistant hybrids, whitefly control, rogue infected plants early.',
    content: `Symptoms: Upward leaf curl, vein thickening, stunted plants — no cure for infected plant.
Prevention: Use CLCuD-tolerant hybrids approved for North/Central zones.
Whitefly: Yellow sticky traps 15/acre; avoid Monocrotophos repeat — Diafenthiuron 240 g/acre OR Pyriproxyfen 100 ml/acre.
Rogue: Remove infected plants early in season and bury/burn.
Avoid cotton-cotton or cotton-okra continuous cropping in same field.`,
    cropTags: ['cotton'],
    tags: ['CLCuD', 'whitefly', 'virus'],
    season: 'kharif',
    publisher: 'ICAR — CICR',
    documentType: 'bulletin',
    publishedYear: 2024,
  },
  {
    id: 'icar-mustard-alternaria',
    source: 'icar',
    type: 'disease',
    title: 'ICAR Mustard / rapeseed Alternaria blight and aphid management',
    summary: 'Alternaria dark spots on mustard pods, Mancozeb spray, aphid control at flowering.',
    content: `Alternaria: Dark concentric spots on leaves and pods — Mancozeb 2 g/L from 45 DAS, 2–3 sprays.
Aphid: Curling of young inflorescence — Dimethoate 30% EC 400 ml/acre OR Neem oil 5 ml/L at ETL.
Varieties: Pusa Bold, RH 749 for Indian conditions.
Sowing: Oct–Nov rabi; 30×10 cm; DAP 40 kg/acre basal.
Harvest: When 75% pods turn brown; cut and stack for ripening.`,
    cropTags: ['mustard', 'rapeseed'],
    tags: ['alternaria', 'aphid', 'oilseed'],
    season: 'rabi',
    publisher: 'ICAR — DRMR',
    documentType: 'package_of_practices',
    publishedYear: 2023,
  },
];
