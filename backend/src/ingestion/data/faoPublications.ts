import type { PublicationEntry } from './publicationTypes';

/**
 * FAO agricultural documents and guides — global best practices adapted for reference.
 */
export const FAO_PUBLICATIONS: PublicationEntry[] = [
  {
    id: 'fao-ipm-farmers-field-school',
    source: 'fao',
    type: 'guide',
    title: 'FAO Integrated Pest Management — Farmer Field School approach',
    summary: 'FAO IPM principles: observation, economic threshold, natural enemy conservation, reduced pesticide use.',
    content: `FAO Farmer Field School (FFS) model: Weekly field observation by farmers — identify pests, beneficial insects, crop stage.
Key principles: No prophylactic spraying; use ETL; rotate pesticide modes of action; record all applications.
Biological control: Conserve parasitoids and predators — avoid broad-spectrum insecticides at early crop stage.
Decision making: Farmers learn to distinguish pest damage from natural variation; spray only when economic loss expected.`,
    tags: ['IPM', 'FFS', 'FAO', 'sustainable'],
    publisher: 'FAO Plant Production and Protection Division',
    documentType: 'publication',
    url: 'https://www.fao.org/plant-health/ipm/en/',
    publishedYear: 2022,
  },
  {
    id: 'fao-water-scarcity-crops',
    source: 'fao',
    type: 'guide',
    title: 'FAO Water management in water-scarce agriculture',
    summary: 'Deficit irrigation, mulching, drought-tolerant varieties, and scheduling for water-limited farming.',
    content: `FAO recommendations for water scarcity:
1. Shift to drought-tolerant varieties and short-duration crops.
2. Mulch with crop residue — reduces evaporation 20–30%.
3. Deficit irrigation at non-critical stages; full irrigation only at flowering/grain filling.
4. Laser levelling and raised bed planting for uniform water distribution.
5. Monitor soil moisture; avoid irrigation when crop can extract from subsoil.`,
    tags: ['water', 'drought', 'irrigation', 'FAO'],
    season: 'kharif',
    publisher: 'FAO Land and Water Division',
    documentType: 'publication',
    url: 'https://www.fao.org/land-water/en/',
    publishedYear: 2023,
  },
  {
    id: 'fao-post-harvest-losses',
    source: 'fao',
    type: 'guide',
    title: 'FAO Reducing post-harvest losses in grains and pulses',
    summary: 'Proper drying, storage moisture levels, hermetic bags, and aflatoxin prevention in stored produce.',
    content: `FAO post-harvest guidelines:
Grains: Dry to 12–14% moisture before storage; use metal bins or hermetic bags (PICS bags).
Pulses: 9–10% moisture for safe storage; sun-dry on clean surface; avoid ground contact.
Groundnut: Dry pods to 8% moisture within 3 days of harvest to prevent aflatoxin from Aspergillus.
Storage: Clean godown; no previous infested grain; neem leaves or phosphine fumigation only by trained persons.`,
    cropTags: ['rice', 'wheat', 'groundnut', 'redgram'],
    tags: ['post-harvest', 'storage', 'aflatoxin', 'FAO'],
    publisher: 'FAO Food Systems Division',
    documentType: 'publication',
    url: 'https://www.fao.org/food-loss-food-waste/en/',
    publishedYear: 2022,
  },
  {
    id: 'fao-climate-adaptation-smallholders',
    source: 'fao',
    type: 'guide',
    title: 'FAO Climate-smart agriculture for smallholder farmers',
    summary: 'Adaptation strategies — crop diversification, agroforestry, adjusted planting dates, index insurance awareness.',
    content: `FAO climate adaptation for smallholders:
Diversify: Mix crops and integrate livestock/fish where possible.
Adjust calendar: Shift sowing dates based on monsoon onset trends.
Agroforestry: Fruit/bamboo borders reduce wind and heat stress.
Soil organic matter: Compost and green manure improve water retention.
Risk: Explore crop insurance (PMFBY) and maintain seed reserve for replanting after extreme events.`,
    tags: ['climate', 'adaptation', 'FAO', 'smallholder'],
    publisher: 'FAO Climate Change Division',
    documentType: 'publication',
    url: 'https://www.fao.org/climate-change/en/',
    publishedYear: 2024,
  },
  {
    id: 'fao-plant-health-global',
    source: 'fao',
    type: 'guide',
    title: 'FAO International Year of Plant Health — prevention practices',
    summary: 'Prevent spread of pests and diseases — certified seed, quarantine awareness, early reporting.',
    content: `FAO plant health principles:
Use certified/ treated seed from authorized sources.
Inspect planting material for pests before field introduction.
Report unusual pest/disease outbreaks to local agriculture officer — early containment prevents spread.
Clean tools and machinery between fields; destroy infected plant material by burning (not composting).
Follow international phytosanitary standards for export crops.`,
    tags: ['plant-health', 'quarantine', 'FAO'],
    publisher: 'FAO IPPC',
    documentType: 'publication',
    url: 'https://www.fao.org/plant-health/en/',
    publishedYear: 2020,
  },
  {
    id: 'fao-fertilizer-use-efficiency',
    source: 'fao',
    type: 'fertilizer',
    title: 'FAO 4R Nutrient Stewardship — Right source, rate, time, place',
    summary: 'Global best practice for fertilizer efficiency — matches ICAR INM and reduces environmental loss.',
    content: `FAO 4R Nutrient Stewardship:
Right SOURCE: Match fertilizer type to crop need and soil test (NPK complexes, micronutrients).
Right RATE: Based on soil analysis and expected yield — avoid blanket high doses.
Right TIME: Split nitrogen application; apply P at sowing, K per crop demand curve.
Right PLACE: Band placement or fertigation for efficiency; incorporate urea to reduce volatilization.`,
    tags: ['4R', 'fertilizer', 'efficiency', 'FAO', 'INM'],
    publisher: 'FAO Plant Nutrition',
    documentType: 'publication',
    url: 'https://www.fao.org/agriculture/crops/nutrient-stewardship/en/',
    publishedYear: 2023,
  },
  {
    id: 'fao-rice-production-systems',
    source: 'fao',
    type: 'guide',
    title: 'FAO Sustainable rice production — SRI and water-saving methods',
    summary: 'System of Rice Intensification principles, alternate wetting and drying, reduced seed rate.',
    content: `SRI principles: Young seedlings (8–12 days), single seedling/hill, wider spacing 25×25 cm.
AWD: Allow field to dry slightly between irrigations — saves 15–30% water without yield loss.
Weeder use: 2–3 mechanical weedings improve aeration and root growth.
Organic SRI: Combine with FYM and green manure for best results on fertile soils.`,
    cropTags: ['rice'],
    tags: ['SRI', 'AWD', 'water-saving', 'FAO'],
    publisher: 'FAO Rice Market Monitor',
    documentType: 'publication',
    url: 'https://www.fao.org/rice/en/',
    publishedYear: 2023,
  },
  {
    id: 'fao-pesticide-risk-reduction',
    source: 'fao',
    type: 'guide',
    title: 'FAO Pesticide risk reduction toolkit for smallholders',
    summary: 'Reduce operator exposure, avoid empty container reuse, integrated alternatives to high-risk chemicals.',
    content: `FAO risk reduction:
Replace WHO Class Ia/Ib pesticides with lower-risk alternatives where possible.
Use IPM before resorting to chemical — scouting and ETL mandatory.
Triple-rinse spray containers; puncture and dispose — never reuse for food/water.
Train sprayers; restrict spraying to evening hours; maintain buffer from water bodies.
Governments should maintain list of banned/restricted actives — check CIB&RC India list.`,
    tags: ['pesticide', 'safety', 'risk-reduction', 'FAO'],
    publisher: 'FAO Plant Protection',
    documentType: 'publication',
    url: 'https://www.fao.org/agriculture/crops/pesticides/en/',
    publishedYear: 2023,
  },
  {
    id: 'fao-soil-conservation-sloping',
    source: 'fao',
    type: 'guide',
    title: 'FAO Soil conservation on sloping land — terraces and cover crops',
    summary: 'Contour bunding, vegetative strips, cover crops to prevent erosion on undulating farmland.',
    content: `Contour cultivation: Plough along contour lines not up-down slope.
Vegetative strips: Vetiver, napier grass on bunds reduce runoff velocity.
Cover crops: Cowpea, dolichos in off-season protect soil from monsoon erosion.
Terracing: For slopes >8% — reduce length of slope for water to travel.
Organic matter: Every 1% increase in soil carbon improves water retention significantly.`,
    tags: ['soil-conservation', 'erosion', 'FAO'],
    season: 'kharif',
    publisher: 'FAO Land and Water',
    documentType: 'publication',
    url: 'https://www.fao.org/land-water/en/',
    publishedYear: 2022,
  },
  {
    id: 'fao-small-scale-irrigation',
    source: 'fao',
    type: 'guide',
    title: 'FAO Small-scale irrigation technologies for smallholders',
    summary: 'Drip, sprinkler, treadle pump, solar pump — selection criteria for small farms.',
    content: `Drip: Best for horticulture, 30–50% water saving; needs filtration and maintenance.
Sprinkler: Suitable for cereals and vegetables on flat land.
Solar pump: Rising adoption in India — size pump to peak crop water need + 20% margin.
Scheduling: Irrigate at morning/evening; avoid midday evaporation losses.
Maintenance: Clean filters weekly; flush drip lines monthly in hard water areas.`,
    cropTags: [],
    tags: ['drip', 'sprinkler', 'solar-pump', 'FAO'],
    publisher: 'FAO Land and Water',
    documentType: 'publication',
    url: 'https://www.fao.org/land-water/en/',
    publishedYear: 2024,
  },
  {
    id: 'fao-livestock-crop-integration',
    source: 'fao',
    type: 'guide',
    title: 'FAO Crop-livestock integration for mixed farming systems',
    summary: 'Use crop residues for fodder, FYM from livestock for fields, integrated nutrient cycling.',
    content: `Residue use: Paddy straw, maize stover, groundnut haulms as cattle feed — reduce burning.
FYM: 5–10 t/acre from farm livestock reduces fertilizer need 25–30%.
Silage: Excess green fodder preserved for dry season.
Biogas: Slurry from biogas unit excellent organic fertilizer — apply after composting 15 days.
Health: Vaccinate livestock; avoid grazing on pesticide-sprayed fields before PHI.`,
    cropTags: [],
    tags: ['livestock', 'FYM', 'mixed-farming', 'FAO'],
    publisher: 'FAO Animal Production',
    documentType: 'publication',
    url: 'https://www.fao.org/agriculture/animal-production/en/',
    publishedYear: 2022,
  },
  {
    id: 'fao-food-safety-farm-level',
    source: 'fao',
    type: 'guide',
    title: 'FAO Good Agricultural Practices (GAP) — farm-level food safety',
    summary: 'Hygiene at harvest, clean water for washing produce, traceability for market access.',
    content: `GAP principles:
Use clean water for washing fruits/vegetables — not canal water with sewage contamination.
Harvest containers: Food-grade plastic or clean cloth — not fertilizer bags.
Record keeping: Spray diary with date, product, dose, PHI for audit readiness.
Worker hygiene: Hand wash facilities near packing area.
Reject: Produce fallen on soil without washing/discard for premium market channels.`,
    cropTags: [],
    tags: ['GAP', 'food-safety', 'FAO'],
    publisher: 'FAO Food Safety',
    documentType: 'publication',
    url: 'https://www.fao.org/food-safety/en/',
    publishedYear: 2023,
  },
  {
    id: 'fao-biodiversity-farm',
    source: 'fao',
    type: 'guide',
    title: 'FAO On-farm biodiversity — hedgerows, pollinators, beneficial insects',
    summary: 'Maintain field borders with flowering plants to support bees and natural pest enemies.',
    content: `Field margins: Plant sunhemp, marigold, coriander border rows to attract predators.
Pollinators: Avoid insecticide at full bloom; spray evening when bees inactive.
Beneficial insects: Ladybird beetles, lacewings, parasitoid wasps — conserve with selective pesticides.
Seed diversity: Maintain local landraces alongside hybrids for resilience.
Agroforestry: Mango, tamarind, bamboo on bunds provide income + habitat.`,
    tags: ['biodiversity', 'pollinators', 'IPM', 'FAO'],
    publisher: 'FAO Biodiversity',
    documentType: 'publication',
    url: 'https://www.fao.org/biodiversity/en/',
    publishedYear: 2023,
  },
  {
    id: 'fao-desertification-drylands',
    source: 'fao',
    type: 'guide',
    title: 'FAO Combating desertification in dryland farming',
    summary: 'Mulching, windbreaks, drought crops, rainwater harvesting for semi-arid regions like Rayalaseema.',
    content: `Dryland strategies (relevant to AP/TG semi-arid zones):
Rainwater harvesting: Farm ponds, check dams recharge groundwater.
Windbreaks: Casuarina, subabul rows reduce wind erosion.
Crop choice: Short-duration pulses, sorghum, castor over long-duration water-intensive crops in dry years.
Mulch: Crop residue cover reduces soil temperature 5–8°C in summer.
Monitor: IMD drought bulletins + local ADA advisories before sowing decisions.`,
    cropTags: ['sorghum', 'redgram', 'castor'],
    tags: ['desertification', 'dryland', 'rainwater', 'FAO'],
    season: 'kharif',
    publisher: 'FAO Forestry / Drylands',
    documentType: 'publication',
    url: 'https://www.fao.org/drylands/en/',
    publishedYear: 2024,
  },
];
