import type { PublicationEntry } from './publicationTypes';

/**
 * PJTSAU (Professor Jayashankar Telangana State Agricultural University) publications.
 * Telangana-specific varieties, pest alerts, and extension recommendations.
 */
export const PJTSAU_PUBLICATIONS: PublicationEntry[] = [
  {
    id: 'pjtsau-rice-varieties-tg',
    source: 'pjtsau',
    type: 'guide',
    title: 'PJTSAU Recommended rice varieties for Telangana',
    titleTe: 'PJTSAU — Telangana vari varieties',
    summary: 'Telangana kharif and rabi rice varieties — RNR, JGL, Tellahamsa, fine rice for different agro-climatic zones.',
    content: `Telangana kharif: RNR 15048, JGL 1798, Tellahamsa, Kunaram Sannalu — zone-wise from PJTSAU KVK.
Irrigated tracts (Warangal, Karimnagar, Nizamabad): RNR 15048 — blast tolerant, 125-day duration.
Fine rice (premium): RNR 15048, Tellahamsa for export/scented markets.
Seed treatment: Carbendazim 2 g/kg + Chlorpyriphos 20 EC 3 ml/kg for termite/stem borer.
SRI method: 25×25 cm spacing saves seed and water — PJTSAU recommends for assured irrigation areas.`,
    cropTags: ['rice'],
    tags: ['varieties', 'Telangana', 'RNR'],
    season: 'kharif',
    state: 'Telangana',
    publisher: 'PJTSAU — Extension',
    documentType: 'publication',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2024,
  },
  {
    id: 'pjtsau-cotton-pink-bollworm',
    source: 'pjtsau',
    type: 'pest',
    title: 'PJTSAU Pink bollworm management in Telangana cotton',
    summary: 'Pink bollworm pheromone trapping, mating disruption, crop termination date for Telangana cotton.',
    content: `Mandatory: Crop termination by 31 December — no ratoon/stub cotton.
Pheromone traps: 5 PBW traps/acre from 90 DAS; count males daily.
Mating disruption: PBW pheromone dispensers 100/acre in hotspot villages (Adilabad, Nalgonda, Warangal).
At ETL: Flubendiamide 20% WG 80 g/acre OR Emamectin benzoate 5% SG 88 g/acre.
Avoid late sowing after July 15 — increases PBW risk.`,
    cropTags: ['cotton'],
    tags: ['pink-bollworm', 'Telangana', 'IPM'],
    season: 'kharif',
    state: 'Telangana',
    publisher: 'PJTSAU — Entomology',
    documentType: 'bulletin',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2024,
  },
  {
    id: 'pjtsau-maize-kharif-tg',
    source: 'pjtsau',
    type: 'guide',
    title: 'PJTSAU Kharif maize — hybrids and FAW control for Telangana',
    summary: 'Maize hybrid recommendations, fertilizer schedule, fall armyworm monitoring for TG maize belt.',
    content: `Hybrids: DHM 121, NK 6240, 3566 (check PJTSAU KVK for zone).
Sowing: June–July, 60×20 cm, population 18,000–20,000/acre.
Fertilizer: DAP 50 kg basal + Urea 100 kg in 3 splits.
FAW: Pheromone traps 4/acre; whorl spray at 10% damage — Emamectin benzoate 88 g/acre.
Post-harvest: Stubble destroy within 15 days to break FAW cycle.`,
    cropTags: ['maize'],
    tags: ['FAW', 'hybrids', 'Telangana'],
    season: 'kharif',
    state: 'Telangana',
    publisher: 'PJTSAU — Agronomy',
    documentType: 'package_of_practices',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2023,
  },
  {
    id: 'pjtsau-redgram-tur',
    source: 'pjtsau',
    type: 'guide',
    title: 'PJTSAU Redgram (tur) cultivation — Telangana rainfed tracts',
    summary: 'Redgram varieties, rhizobium, wilt management for Mahbubnagar, Nalgonda, Vikarabad districts.',
    content: `Varieties: TS-3R (wilt tolerant), ICPL 87119, LRG 30 — 150–180 day duration.
Seed: Rhizobium + PSB + Trichoderma 4 g/kg seed treatment.
Sowing: June–July with 90×30 cm or 60×30 cm spacing.
Wilt: Use resistant varieties; avoid waterlogging; drench Carbendazim 1 g/L at root zone if wilt suspected.
Pod borer: Pheromone traps 5/acre; Indoxacarb 200 ml/acre at 50% flowering if needed.`,
    cropTags: ['redgram', 'tur'],
    tags: ['wilt', 'pulses', 'Telangana', 'rainfed'],
    season: 'kharif',
    state: 'Telangana',
    publisher: 'PJTSAU — Pulses Research',
    documentType: 'package_of_practices',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2023,
  },
  {
    id: 'pjtsau-chilli-guntur-style-tg',
    source: 'pjtsau',
    type: 'pest',
    title: 'PJTSAU Chilli production — Khammam, Warangal districts',
    summary: 'Chilli thrips, anthracnose, die-back management and fertigation for Telangana chilli farmers.',
    content: `Varieties: Teja, 5531, Byadgi type for dry chilli; local KVK for fresh market hybrids.
Thrips: Blue sticky traps; Spinosad 150 ml/acre at ETL.
Die-back: Mancozeb + Carbendazim spray from fruit set; improve drainage in heavy rains.
Fertigation: NPK 19:19:19 2 kg/acre/week through drip from 30 DAT.
Drying: Dry to 10% moisture for storage; aflatoxin risk if improperly dried.`,
    cropTags: ['chilli'],
    tags: ['thrips', 'anthracnose', 'Khammam', 'Telangana'],
    season: 'year-round',
    state: 'Telangana',
    publisher: 'PJTSAU — Horticulture',
    documentType: 'bulletin',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2024,
  },
  {
    id: 'pjtsau-soybean-rust',
    source: 'pjtsau',
    type: 'disease',
    title: 'PJTSAU Soybean rust alert — Adilabad, Komaram Bheem districts',
    summary: 'Soybean rust identification, Propiconazole/Tebuconazole spray timing for Telangana soybean.',
    content: `Rust: Small brown pustules on lower leaf surface — appears in humid conditions (Aug–Sep).
Spray: Propiconazole 25% EC 200 ml/acre OR Tebuconazole 200 ml/acre at first symptom.
Repeat after 15 days if needed. Do not spray after pod filling stage.
Varieties: JS 335, MACS 1407 — check PJTSAU recommendation for TG.
Rotation: Avoid soybean on same field consecutive years.`,
    cropTags: ['soybean'],
    tags: ['rust', 'fungicide', 'Adilabad', 'Telangana'],
    season: 'kharif',
    state: 'Telangana',
    publisher: 'PJTSAU — Plant Pathology',
    documentType: 'advisory',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2023,
  },
  {
    id: 'pjtsau-sorghum-shoot-fly',
    source: 'pjtsau',
    type: 'pest',
    title: 'PJTSAU Sorghum shoot fly management — rainfed Telangana',
    summary: 'Shoot fly prevention with seed treatment, early sowing, and carbofuran for Telangana rabi sorghum.',
    content: `Seed treatment: Imidacloprid 70 WS 5 g/kg + Thiram 2 g/kg mandatory.
Sowing: Early sowing (before Oct 15 rabi) reduces shoot fly damage.
Whichever: Carbofuran 3G 8 kg/acre in seed furrow at sowing in high-risk areas.
Dead heart symptom: Rogue affected plants in early stage; avoid late sowing.
Varieties: CSV 216, Maldandi for rainfed; CSV 17 for irrigated.`,
    cropTags: ['sorghum', 'jowar'],
    tags: ['shoot-fly', 'rainfed', 'Telangana'],
    season: 'rabi',
    state: 'Telangana',
    publisher: 'PJTSAU — Entomology',
    documentType: 'bulletin',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2023,
  },
  {
    id: 'pjtsau-rythu-bharosa-inputs',
    source: 'pjtsau',
    type: 'guide',
    title: 'PJTSAU Extension — Rythu Bharosa Kendra input and advisory access',
    summary: 'How Telangana farmers access seeds, fertilizers, and pest advisories through RBK and PJTSAU KVK network.',
    content: `Rythu Bharosa Kendras: Seed, fertilizer, pesticide availability at subsidized rates — carry Aadhaar and passbook.
PJTSAU KVKs: Free soil testing, training, pest identification — contact district KVK (Warangal, Palem, Jagtial, etc.).
Crop contingency: SMS/WhatsApp pest alerts from Agriculture Department during kharif peak.
PJTSAU website and agri extension app for weekly weather-based advisories.`,
    cropTags: [],
    tags: ['extension', 'Rythu-Bharosa', 'Telangana', 'advisory'],
    state: 'Telangana',
    publisher: 'PJTSAU — Extension Education',
    documentType: 'advisory',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2024,
  },
  {
    id: 'pjtsau-rice-bph-tg',
    source: 'pjtsau',
    type: 'pest',
    title: 'PJTSAU Rice BPH management — Karimnagar, Nizamabad intensive rice areas',
    summary: 'Brown planthopper control, avoid excess nitrogen, recommended tolerant varieties for TG.',
    content: `Varieties: RNR 15048, WGL 32100 — moderate tolerance; avoid susceptible late varieties.
N management: No urea after 45 DAT unless deficiency confirmed.
ETL: 5 BPH/tiller — spray Buprofezin 200 ml/acre OR Dinotefuran 20 SG 80 g/acre.
Avoid: Cypermethrin repeat — causes resurgence.
Community: Synchronous planting in village reduces BPH buildup.`,
    cropTags: ['rice'],
    tags: ['BPH', 'Karimnagar', 'Telangana'],
    season: 'kharif',
    state: 'Telangana',
    publisher: 'PJTSAU — Entomology',
    documentType: 'advisory',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2024,
  },
  {
    id: 'pjtsau-cotton-whitefly-tg',
    source: 'pjtsau',
    type: 'pest',
    title: 'PJTSAU Cotton whitefly management — Nalgonda, Khammam',
    summary: 'Whitefly sticky honeydew, sooty mould, Diafenthiuron/Pyriproxyfen rotation for Telangana cotton.',
    content: `Monitoring: 10 yellow sticky traps/acre; check underside of 3rd leaf from top.
ETL: 10 adults/leaf top canopy.
Spray: Diafenthiuron 50% WP 240 g/acre OR Pyriproxyfen 10% EC 100 ml/acre — rotate.
Avoid: Repeated Monocrotophos/Omethoate — resistance widespread.
Harvest: Stop sprays 15 days before last picking per PHI.`,
    cropTags: ['cotton'],
    tags: ['whitefly', 'Nalgonda', 'Telangana'],
    season: 'kharif',
    state: 'Telangana',
    publisher: 'PJTSAU — Entomology',
    documentType: 'bulletin',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2024,
  },
  {
    id: 'pjtsau-turmeric-nizamabad',
    source: 'pjtsau',
    type: 'guide',
    title: 'PJTSAU Turmeric production — Nizamabad, Kamareddy districts',
    summary: 'Telangana turmeric belt — Prabhani variety, rhizome rot prevention, boiling and drying.',
    content: `Varieties: Prabhani, Rajendra Sonia for TG; planting May–July.
Rhizome: Treat Mancozeb 0.3%; plant on ridges 25 cm apart.
Irrigation: 8–10 irrigations if no rain; critical at rhizome development.
Leaf spot: Mancozeb 2 g/L 2 sprays from 90 DAP.
Processing: Boil 45–60 min until soft; dry to 8% moisture for Nizamabad market quality.`,
    cropTags: ['turmeric'],
    tags: ['Nizamabad', 'spice', 'Telangana'],
    season: 'kharif',
    state: 'Telangana',
    publisher: 'PJTSAU — Horticulture',
    documentType: 'package_of_practices',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2023,
  },
  {
    id: 'pjtsau-onion-rabi-tg',
    source: 'pjtsau',
    type: 'guide',
    title: 'PJTSAU Rabi onion — Medak, Mahbubnagar belt',
    summary: 'Onion nursery timing, thrips, purple blotch, storage for Telangana rabi onion farmers.',
    content: `Nursery: Sept transplant to main field Oct–Nov.
Varieties: Bhima Super, NHRDF red types for TG.
Thrips: Spinosad 150 ml/acre at silvery streak stage.
Purple blotch: Mancozeb + Mancozeb-Carbendazim from 45 DAT.
Top dressing: Urea 25 kg/acre at 30 and 45 DAT.
Storage: Cure 4 days; store in shade with ventilation — avoid field heap >3 days in rain.`,
    cropTags: ['onion'],
    tags: ['rabi', 'thrips', 'Medak', 'Telangana'],
    season: 'rabi',
    state: 'Telangana',
    publisher: 'PJTSAU — Horticulture',
    documentType: 'package_of_practices',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2023,
  },
  {
    id: 'pjtsau-castor-siddipet',
    source: 'pjtsau',
    type: 'guide',
    title: 'PJTSAU Castor hybrid cultivation — Siddipet, Medak rainfed',
    summary: 'DCH 177 castor, semilooper spray, intercropping with redgram in Telangana.',
    content: `Sowing: July; 90×60 cm; 5 kg/acre.
Intercrop: Redgram 1 row between castor rows increases income.
Semilooper: Spinosad 150 ml/acre at 10% defoliation.
Harvest: 3 pickings when capsules dry; avoid rain on harvested capsules.
Oil recovery: Sun-dry 3 days before crushing.`,
    cropTags: ['castor'],
    tags: ['semilooper', 'rainfed', 'Telangana'],
    season: 'kharif',
    state: 'Telangana',
    publisher: 'PJTSAU — Oilseeds',
    documentType: 'package_of_practices',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2023,
  },
  {
    id: 'pjtsau-greengram-summer-tg',
    source: 'pjtsau',
    type: 'guide',
    title: 'PJTSAU Summer greengram after rice — Telangana delta',
    summary: 'Post-rice summer mung cultivation, VBN varieties, one irrigation at flowering.',
    content: `Sowing: Jan–Feb in rice fallows; VBN 8, TM 96-2.
Seed: Rhizum + Carbendazim; 8 kg/acre.
Irrigation: One at flowering if dry spell >10 days.
Pest: Yellow mosaic — whitefly control; harvest 60–65 days.
Grain: Dry to 12% before bagging.`,
    cropTags: ['greengram'],
    tags: ['summer', 'rice-fallow', 'Telangana'],
    season: 'rabi',
    state: 'Telangana',
    publisher: 'PJTSAU — Pulses',
    documentType: 'package_of_practices',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2024,
  },
  {
    id: 'pjtsau-cotton-harvest-timing',
    source: 'pjtsau',
    type: 'guide',
    title: 'PJTSAU Cotton picking and crop termination — Telangana mandatory calendar',
    summary: 'Optimal boll opening picks, stub destruction by Dec 31, PBW prevention post-harvest.',
    content: `Picking: 3–4 pickings when bolls fully open; avoid mixing immature cotton.
Last picking: Before Dec 15 preferred; destroy crop by Dec 31 mandatory for PBW control.
Stub cutting: Plough immediately; no standing cotton into January.
Storage: Dry kapas to 8% moisture; protect from pink bollworm in godown with fumigation if needed.`,
    cropTags: ['cotton'],
    tags: ['harvest', 'pink-bollworm', 'Telangana'],
    season: 'kharif',
    state: 'Telangana',
    publisher: 'PJTSAU — Extension',
    documentType: 'advisory',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2024,
  },
  {
    id: 'pjtsau-maize-rabi-warangal',
    source: 'pjtsau',
    type: 'guide',
    title: 'PJTSAU Rabi maize — Warangal, Hanamkonda irrigated tracts',
    summary: 'Rabi maize sowing Oct–Nov, irrigation schedule, FAW monitoring in Telangana.',
    content: `Hybrids: DHM 117, PAC 751; sow Oct 15 – Nov 15.
Irrigation: 8–10 irrigations; critical at tasseling.
FAW: Same whorl management as kharif — do not ignore rabi FAW.
Fertilizer: DAP 50 kg + Urea 100 kg/acre in splits.
Harvest: 90–100 days; dry grain to 14% for storage.`,
    cropTags: ['maize'],
    tags: ['rabi', 'Warangal', 'Telangana'],
    season: 'rabi',
    state: 'Telangana',
    publisher: 'PJTSAU — Agronomy',
    documentType: 'package_of_practices',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2023,
  },
  {
    id: 'pjtsau-sweet-orange-tg',
    source: 'pjtsau',
    type: 'guide',
    title: 'PJTSAU Sweet orange nutrition and psylla — Nalgonda citrus belt',
    summary: 'Telangana citrus micronutrient calendar, psylla spray at flush, drip irrigation rates.',
    content: `Varieties: Banganapalli types, local sweet orange clones.
Zinc + Iron foliar at pre-monsoon and post-monsoon flush.
Psylla: Imidacloprid 60 ml/acre when new flush tender.
Drip: 50 L/tree/day summer; mulching with paddy husk.
Fruit drop: 2,4-D 10 ppm at pea size if excessive drop after stress.`,
    cropTags: ['citrus', 'sweet-orange'],
    tags: ['psylla', 'zinc', 'Nalgonda', 'Telangana'],
    state: 'Telangana',
    publisher: 'PJTSAU — Horticulture',
    documentType: 'publication',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2024,
  },
  {
    id: 'pjtsau-fingermillet-ragi',
    source: 'pjtsau',
    type: 'guide',
    title: 'PJTSAU Finger millet (ragi) — tribal and rainfed Telangana tracts',
    summary: 'Ragi varieties, blast control, seed treatment for Adilabad, Bhadradri tribal areas.',
    content: `Varieties: GPU 28, VR 708 for TG hills.
Blast: Seed treat Tricyclazole 0.1%; spray Tricyclazole 120 g/acre at leaf blast stage.
Sowing: June with rains; 22×10 cm; 4 kg/acre seed.
Nutrition: Low input — FYM 2 t/acre + 20 kg urea/acre if soil poor.
Weed: Hand weed 20 and 40 DAS critical for yield.`,
    cropTags: ['ragi', 'fingermillet'],
    tags: ['blast', 'rainfed', 'tribal', 'Telangana'],
    season: 'kharif',
    state: 'Telangana',
    publisher: 'PJTSAU — Millets',
    documentType: 'package_of_practices',
    url: 'https://pjtsau.edu.in/',
    publishedYear: 2023,
  },
];
