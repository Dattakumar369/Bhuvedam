import type { PublicationEntry } from './publicationTypes';

/**
 * ANGRAU (Acharya N G Ranga Agricultural University) — Andhra Pradesh publications.
 * Regional package of practices, pest alerts, and extension bulletins for AP farmers.
 */
export const ANGRAU_PUBLICATIONS: PublicationEntry[] = [
  {
    id: 'angrau-rice-bpt-varieties',
    source: 'angrau',
    type: 'guide',
    title: 'ANGRAU Recommended rice varieties for Andhra Pradesh',
    titleTe: 'ANGRAU — AP ki vari varieties',
    summary: 'High-yielding and disease-resistant rice varieties for AP kharif and rabi — BPT, Swarna, RNR zones.',
    content: `Kharif (Coastal AP): BPT 5204, Swarna, RNR 15048, DRR Dhan 50 — check local AAO recommendation.
Kharif (Rayalaseema): RNR 15048, MTU 1010, NLR 34449 — short duration for tank irrigation.
Rabi (Nellore/Krishna): BPT 5204, MTU 1061 — sow Dec–Jan with assured irrigation.
Blast-prone areas: Prefer RNR 15048, DRR Dhan 50 (moderate resistance).
Seed rate: 40 kg/acre for transplanted; treat with Carbendazim 2 g/kg + Imidacloprid 70 WS 5 g/kg for BPH.`,
    cropTags: ['rice'],
    tags: ['varieties', 'AP', 'seed'],
    season: 'kharif',
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Extension Education',
    documentType: 'publication',
    url: 'https://angrau.ac.in/',
    publishedYear: 2024,
  },
  {
    id: 'angrau-cotton-ap-ipm',
    source: 'angrau',
    type: 'pest',
    title: 'ANGRAU Cotton IPM for Guntur, Prakasam, Kurnool districts',
    summary: 'District-specific cotton pest calendar — pink bollworm, spotted bollworm, whitefly in AP cotton belt.',
    content: `Sowing window: June 15 – July 15 (avoid late sowing for pink bollworm).
Pre-sowing: Deep summer plough; destroy previous crop residue.
60–90 DAS: Peak bollworm — pheromone traps 5/acre; ETL 2 egg masses/100 plants.
Whitefly (Oct–Nov): Yellow sticky traps; avoid repeated Monocrotophos — use Diafenthiuron 50% WP 240 g/acre.
Pink bollworm: Install PBW pheromone traps 5/acre from 90 DAS; spray Flubendiamide 20% WG 80 g/acre at ETL.
Contact: Local ANGRAU KVK or ADA office for weekly pest scouting bulletins.`,
    cropTags: ['cotton'],
    tags: ['IPM', 'pink-bollworm', 'Guntur', 'AP'],
    season: 'kharif',
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Entomology',
    documentType: 'bulletin',
    url: 'https://angrau.ac.in/',
    publishedYear: 2023,
  },
  {
    id: 'angrau-chilli-thrips',
    source: 'angrau',
    type: 'pest',
    title: 'ANGRAU Chilli thrips and leaf curl management — Guntur belt',
    summary: 'Thrips Scirtothrips dorsalis control, virus vector management, nursery and field spray schedule for AP chilli.',
    content: `Thrips: Silvery streaks on leaves, flower drop. Blue sticky traps 15/acre for monitoring.
ETL: 5 thrips/leaf. Spray Fipronil 5% SC 400 ml/acre OR Spinosad 45% SC 150 ml/acre.
Leaf curl virus: Rogue infected plants; control whitefly vector — Imidacloprid 17.8% SL 60 ml/acre.
Nursery (Kadiri/Guntur): Raise on raised beds; mulching; avoid mixed age seedlings.
Harvest: Follow PHI — 7 days after last spray before picking.`,
    cropTags: ['chilli'],
    tags: ['thrips', 'leaf-curl', 'Guntur', 'AP'],
    season: 'year-round',
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Horticulture',
    documentType: 'bulletin',
    url: 'https://angrau.ac.in/',
    publishedYear: 2024,
  },
  {
    id: 'angrau-groundnut-tikka',
    source: 'angrau',
    type: 'disease',
    title: 'ANGRAU Groundnut tikka (early & late leaf spot) — Anantapur, Kurnool',
    summary: 'Tikka disease identification, Mancozeb + Carbendazim spray schedule, gypsum timing for AP groundnut.',
    content: `Early leaf spot: Brown spots with yellow halo. Late leaf spot: Dark brown, no halo.
Spray: Mancozeb 75% WP 2 g/L + Carbendazim 50% WP 1 g/L at 15-day interval from 30 DAS (2–3 sprays).
Gypsum: 400 kg/ha at peg formation — critical in Anantapur red soils.
Varieties: Kadiri-6, Dharani, Kadiri-9 for AP rainfed tracts.
Rotation: Avoid groundnut on same field >2 consecutive years.`,
    cropTags: ['groundnut'],
    tags: ['tikka', 'leaf-spot', 'Anantapur', 'AP'],
    season: 'kharif',
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Plant Pathology',
    documentType: 'bulletin',
    url: 'https://angrau.ac.in/',
    publishedYear: 2023,
  },
  {
    id: 'angrau-maize-rabi-hybrids',
    source: 'angrau',
    type: 'guide',
    title: 'ANGRAU Rabi maize production — Krishna, West Godavari',
    summary: 'Rabi maize hybrids, irrigation schedule, FAW vigilance for AP delta districts.',
    content: `Hybrids: DHM 117, NK 6240, PAC 751 (check local availability).
Sowing: Oct–Nov with assured irrigation; 60×20 cm spacing.
Fertilizer: DAP 50 kg + Urea 100 kg/acre (3 splits for N).
FAW: Scout from 15 DAS; whorl spray Emamectin benzoate at ETL.
Water: Critical at knee-high, tasseling, and grain filling stages.`,
    cropTags: ['maize'],
    tags: ['rabi', 'hybrids', 'Krishna', 'AP'],
    season: 'rabi',
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Agronomy',
    documentType: 'package_of_practices',
    url: 'https://angrau.ac.in/',
    publishedYear: 2023,
  },
  {
    id: 'angrau-mango-anthracnose',
    source: 'angrau',
    type: 'disease',
    title: 'ANGRAU Mango anthracnose and powdery mildew — Krishna district',
    summary: 'Mango flowering spray schedule for anthracnose and powdery mildew in AP mango belt.',
    content: `Anthracnose: Black spots on panicles and young fruits. Spray Copper oxychloride 3 g/L at panicle emergence.
Powdery mildew: White powder on panicles. Wettable sulphur 3 g/L OR Hexaconazole 5% EC 2 ml/L at 10-day interval.
Timing: First spray at 25% flower opening; repeat after 10–12 days if humid.
Fruit fly: Methyl eugenol traps 5/acre + bagging of fruits in high-value orchards.
Post-harvest: Hot water treatment 52°C for 5 min for export quality.`,
    cropTags: ['mango'],
    tags: ['anthracnose', 'powdery-mildew', 'Krishna', 'AP'],
    season: 'year-round',
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Horticulture',
    documentType: 'bulletin',
    url: 'https://angrau.ac.in/',
    publishedYear: 2024,
  },
  {
    id: 'angrau-sugarcane-redrot-ap',
    source: 'angrau',
    type: 'disease',
    title: 'ANGRAU Sugarcane red rot alert — East Godavari, West Godavari',
    summary: 'Red rot resistant varieties and sett treatment for AP sugarcane growing districts.',
    content: `Resistant varieties: Co 86032, CoC 671 (check factory area recommendation).
Sett treatment: Carbendazim 0.1% dip 15 min + avoid setts from diseased fields.
Symptoms: Reddish internal tissues, sour smell — rogue and burn immediately.
Ratoon: Avoid >2 ratoon crops in red rot affected fields; plough out and rotate with pulses.`,
    cropTags: ['sugarcane'],
    tags: ['red-rot', 'East-Godavari', 'AP'],
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Crop Science',
    documentType: 'advisory',
    url: 'https://angrau.ac.in/',
    publishedYear: 2023,
  },
  {
    id: 'angrau-drip-fertigation',
    source: 'angrau',
    type: 'fertilizer',
    title: 'ANGRAU Drip fertigation guide — chilli, tomato, cotton (AP)',
    summary: 'Fertigation schedule through drip for horticulture and cotton in water-scarce AP districts.',
    content: `System: 4 LPH drippers, 1 dripper/plant (chilli/tomato) or 2 drippers/cotton plant.
NPK 19:19:19: 2–3 kg/acre/week from transplant/square formation to peak flowering.
EC target: 1.5–2.0 dS/m; flush lines weekly to prevent clogging.
Reduce nitrogen 30% after first harvest (chilli/tomato) to improve fruit quality.
Micronutrients: 0.5% chelated micronutrient mix monthly through drip.`,
    cropTags: ['chilli', 'tomato', 'cotton'],
    tags: ['drip', 'fertigation', 'water-saving', 'AP'],
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Soil Science',
    documentType: 'guide',
    url: 'https://angrau.ac.in/',
    publishedYear: 2024,
  },
  {
    id: 'angrau-tobacco-nursery',
    source: 'angrau',
    type: 'guide',
    title: 'ANGRAU Flue-cured tobacco — nursery and field production (Prakasam, Ongole)',
    summary: 'AP tobacco belt nursery management, black shank, hornworm, aphid control.',
    content: `Nursery: Sterilized soil + raised beds; 400 m² nursery/acre field.
Transplant: 60×60 cm spacing; 6000 plants/acre.
Black shank: Use resistant varieties; Metalaxyl seedling drench 0.1%.
Hornworm: Hand pick small larvae; Spinosad 150 ml/acre at ETL.
Aphids/mosaic: Rogue infected plants; Imidacloprid 60 ml/acre at early vegetative.
Curing: Follow Tobacco Board grade standards for barn curing.`,
    cropTags: ['tobacco'],
    tags: ['black-shank', 'hornworm', 'Prakasam', 'AP'],
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Tobacco Research',
    documentType: 'package_of_practices',
    url: 'https://angrau.ac.in/',
    publishedYear: 2023,
  },
  {
    id: 'angrau-rice-bph-coastal',
    source: 'angrau',
    type: 'pest',
    title: 'ANGRAU Rice BPH outbreak alert — Krishna, Godavari delta',
    summary: 'Brown planthopper hopper burn prevention in high-rice-intensity AP coastal districts.',
    content: `Symptoms: Hopper burn — circular yellow patches; BPH at base of tillers.
Avoid: Excess urea after tillering; dense planting.
Monitoring: Sweep net 5 hills/sample; ETL 5 BPH/tiller.
Drain field briefly if safe; spray Buprofezin 200 ml/acre OR Pymetrozine 150 g/acre.
Do not use broad pyrethroids — kills predators and triggers resurgence.`,
    cropTags: ['rice'],
    tags: ['BPH', 'hopper-burn', 'Krishna', 'AP'],
    season: 'kharif',
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Entomology',
    documentType: 'advisory',
    url: 'https://angrau.ac.in/',
    publishedYear: 2024,
  },
  {
    id: 'angrau-turmeric-e-godavari',
    source: 'angrau',
    type: 'guide',
    title: 'ANGRAU Turmeric cultivation — East Godavari, Vizianagaram spice belt',
    summary: 'Turmeric varieties, rhizome treatment, leaf spot and rhizome rot for AP farmers.',
    content: `Varieties: Pragati, Suguna, Roma for AP; sow May–June with pre-monsoon rain.
Rhizome treat: Mancozeb 0.3% + Quinalphos dip before planting.
Fertilizer: FYM 10 t/acre + NPK 80:40:60 kg/acre.
Rhizome rot: Drench Metalaxyl-Mancozeb if waterlogging; raised bed mandatory.
Harvest: 8–9 months; boil and dry to 8–10% moisture for bright colour.`,
    cropTags: ['turmeric'],
    tags: ['spice', 'rhizome-rot', 'East-Godavari', 'AP'],
    season: 'kharif',
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Horticulture',
    documentType: 'package_of_practices',
    url: 'https://angrau.ac.in/',
    publishedYear: 2023,
  },
  {
    id: 'angrau-coconut-root-wilt',
    source: 'angrau',
    type: 'disease',
    title: 'ANGRAU Coconut root wilt and rhinoceros beetle — coastal AP',
    summary: 'Root wilt management, neem cake, beetle hook trapping in East/West Godavari coconut gardens.',
    content: `Root wilt: No cure — remove and replant with disease-free seedlings after 6-month fallow.
Beetle: Hook traps on crown; apply neem cake 5 kg/palm twice yearly.
Nutrition: Apply 1.3 kg urea + 2 kg MOP + 2 kg superphosphate/palm/year in basin.
Irrigation: 45 L/palm/day in summer through drip where available.
Intercrop: Cocoa or pineapple in young gardens for income.`,
    cropTags: ['coconut'],
    tags: ['root-wilt', 'rhinoceros-beetle', 'coastal', 'AP'],
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Horticulture',
    documentType: 'bulletin',
    url: 'https://angrau.ac.in/',
    publishedYear: 2023,
  },
  {
    id: 'angrau-rayalaseema-drought',
    source: 'angrau',
    type: 'guide',
    title: 'ANGRAU Drought contingency crops — Anantapur, Kadapa, Kurnool',
    summary: 'Short-duration crops, mulching, tank silt application for Rayalaseema drought-prone areas.',
    content: `Crops: Redgram 120-day, horsegram, sorghum, groundnut short-duration.
Sowing: Immediately after first effective rain; wider spacing saves moisture.
Tank silt: 10 t/acre improves water holding in red soils.
Mulch: Groundnut haulms or sorghum stover at 3 t/acre reduces evaporation 25%.
Fertilizer: Reduce N 25%; apply full P and K at sowing; foliar K at drought stress.`,
    cropTags: ['redgram', 'sorghum', 'groundnut'],
    tags: ['drought', 'Rayalaseema', 'rainfed', 'AP'],
    season: 'kharif',
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Agronomy',
    documentType: 'advisory',
    url: 'https://angrau.ac.in/',
    publishedYear: 2024,
  },
  {
    id: 'angrau-sweet-orange-citrus',
    source: 'angrau',
    type: 'guide',
    title: 'ANGRAU Sweet orange (Sathgudi) — pest and nutrient calendar',
    summary: 'AP citrus belt psylla, leaf miner, zinc deficiency schedule for Sathgudi orchards.',
    content: `Psylla/leaf miner: Monocrotophos avoid — use Imidacloprid 17.8% SL 60 ml/acre at flush.
Zinc: 0.5% Zinc sulphate foliar at Feb–Mar and Aug–Sep flushes.
Irrigation: Drip 40–60 L/tree/day in summer; mulching with dry leaves.
Fruit borer: Spinosad 150 ml/acre at pea-size fruit if damage observed.
Harvest: Dec–Feb depending on region; do not mix fallen and tree-picked for market.`,
    cropTags: ['citrus', 'sweet-orange'],
    tags: ['psylla', 'zinc', 'Sathgudi', 'AP'],
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Horticulture',
    documentType: 'publication',
    url: 'https://angrau.ac.in/',
    publishedYear: 2024,
  },
  {
    id: 'angrau-blackgram-greengram-summer',
    source: 'angrau',
    type: 'guide',
    title: 'ANGRAU Summer greengram/blackgram — rice fallows (AP)',
    summary: 'Post-rice summer pulses in Krishna delta — VBN varieties, irrigation at flowering.',
    content: `Sowing: Jan–Feb after rice harvest; VBN 8, LGG 460 for summer.
Irrigation: One light irrigation at flowering if no rain — critical for pod set.
Yellow mosaic: Control whitefly early; rogue infected plants.
Harvest: 60–65 days; whole plant cut and dried on tarpaulin.
Seed rate: 8 kg/acre; seed treat Rhizobium + Carbendazim.`,
    cropTags: ['greengram', 'blackgram'],
    tags: ['summer', 'rice-fallow', 'pulses', 'AP'],
    season: 'rabi',
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Pulses',
    documentType: 'package_of_practices',
    url: 'https://angrau.ac.in/',
    publishedYear: 2023,
  },
  {
    id: 'angrau-banana-bunchy-top',
    source: 'angrau',
    type: 'disease',
    title: 'ANGRAU Banana bunchy top virus — aphid vector control',
    summary: 'BTV symptoms, use virus-free TC plants, Pentalonia aphid control in AP banana zones.',
    content: `Symptoms: Stunted plant, narrow upright leaves — "bunchy" appearance; no cure.
Prevention: Tissue culture Grand Naine from certified nursery only.
Aphid vector: Spray Imidacloprid 60 ml/acre at 45-day intervals in new plantings.
Rogue: Uproot and destroy infected plants immediately; do not replant banana same pit without fallow.
Districts: Rampant in certain pockets — contact ANGRAU KVK for local resistant clones.`,
    cropTags: ['banana'],
    tags: ['bunchy-top', 'virus', 'aphid', 'AP'],
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Plant Pathology',
    documentType: 'advisory',
    url: 'https://angrau.ac.in/',
    publishedYear: 2024,
  },
  {
    id: 'angrau-castor-kurnool',
    source: 'angrau',
    type: 'guide',
    title: 'ANGRAU Castor hybrid cultivation — Kurnool, Anantapur rainfed',
    summary: 'DCH hybrids, semilooper control, castor capsule harvesting for AP dryland farmers.',
    content: `Hybrid: DCH 177, GCH 7 — 5 kg/acre seed rate.
Sowing: July with monsoon; 90×60 cm spacing.
Semilooper: Quinlan 150 ml/acre OR Spinosad at ETL.
No irrigation: Critical weed control first 45 days; interculture 2 times.
Yield: 4–6 q/acre rainfed with proper pest management.`,
    cropTags: ['castor'],
    tags: ['semilooper', 'rainfed', 'Kurnool', 'AP'],
    season: 'kharif',
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Oilseeds',
    documentType: 'package_of_practices',
    url: 'https://angrau.ac.in/',
    publishedYear: 2023,
  },
  {
    id: 'angrau-seed-distribution-ap',
    source: 'angrau',
    type: 'guide',
    title: 'ANGRAU Certified seed availability — AP State Seed Development Corporation',
    summary: 'How AP farmers obtain certified seed for paddy, groundnut, cotton through APSSDC and RBK.',
    content: `APSSDC: Certified paddy, groundnut, redgram seed — check district seed godown list.
Quality: Blue tag certified seed — germination >80%; avoid loose unlabelled seed.
Subsidy: Seed subsidy schemes through Rythu Bharosa Kendras — carry farmer ID.
Storage: Keep seed in cool dry place; treat again before sowing if stored >6 months.
Contact ADA office for variety suitability by mandal.`,
    cropTags: ['rice', 'groundnut', 'cotton'],
    tags: ['seed', 'certified', 'APSSDC', 'extension'],
    state: 'Andhra Pradesh',
    publisher: 'ANGRAU — Seed Technology',
    documentType: 'advisory',
    url: 'https://angrau.ac.in/',
    publishedYear: 2024,
  },
];
