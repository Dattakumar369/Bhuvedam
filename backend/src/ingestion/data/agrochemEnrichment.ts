export type AgrochemStatus = 'registered' | 'banned' | 'restricted';

export interface AgrochemEnrichment {
  phiDays?: number;
  whenToUse: string;
  packMrp?: string;
  status?: AgrochemStatus;
}

/** Extra real-world guidance keyed by active ingredient name in bulkMasters */
export const AGROCHEM_ENRICHMENT: Record<string, AgrochemEnrichment> = {
  'Imidacloprid 17.8% SL': {
    phiDays: 7,
    whenToUse: 'At ETL — early sucking pest build-up. Prefer early vegetative / seed treatment options on label.',
    packMrp: '₹250–400 / 100 ml',
  },
  'Lambda-cyhalothrin 5% EC': {
    phiDays: 7,
    whenToUse: 'At flowering / boll formation when larvae appear.',
    packMrp: '₹180–320 / 100 ml',
  },
  'Chlorpyriphos 20% EC': {
    phiDays: 15,
    whenToUse: 'Soil / basal for termites; foliar for stem borer as per ETL.',
    packMrp: '₹220–350 / 500 ml',
    status: 'restricted',
  },
  'Monocrotophos 36% SL': {
    status: 'banned',
    whenToUse: 'Banned for agriculture use in India — do not use.',
  },
  'Quinalphos 25% EC': {
    phiDays: 10,
    whenToUse: 'Vegetative to flowering when chewing pests cross ETL.',
    packMrp: '₹280–420 / 500 ml',
  },
  'Dimethoate 30% EC': {
    phiDays: 7,
    whenToUse: 'Early vegetative sucking pests.',
    packMrp: '₹200–320 / 500 ml',
  },
  'Triazophos 40% EC': {
    phiDays: 15,
    whenToUse: 'Tillering to panicle initiation for rice stem borer / BPH.',
    packMrp: '₹300–450 / 500 ml',
  },
  'Profenofos 50% EC': {
    phiDays: 15,
    whenToUse: 'Square / boll stage when bollworm eggs/larvae seen.',
    packMrp: '₹350–500 / 500 ml',
  },
  'Spinosad 45% SC': {
    phiDays: 3,
    whenToUse: 'Fruiting stage — selective; follow label for beneficials.',
    packMrp: '₹900–1,400 / 75 ml',
  },
  'Emamectin benzoate 5% SG': {
    phiDays: 5,
    whenToUse: 'Flowering to fruiting at early larval stage.',
    packMrp: '₹450–700 / 100 g',
  },
  'Indoxacarb 14.5% SC': {
    phiDays: 7,
    whenToUse: 'Mid–late crop when chewing pests rise.',
    packMrp: '₹700–1,000 / 100 ml',
  },
  'Thiamethoxam 25% WG': {
    phiDays: 7,
    whenToUse: 'Early vegetative sucking pests; also seed treatment options.',
    packMrp: '₹350–550 / 100 g',
  },
  'Acetamiprid 20% SP': {
    phiDays: 7,
    whenToUse: 'At first flush of sucking pests.',
    packMrp: '₹250–400 / 100 g',
  },
  'Fipronil 5% SC': {
    phiDays: 15,
    whenToUse: 'Nursery / early tillering for stem borer; soil for grubs.',
    packMrp: '₹400–650 / 500 ml',
  },
  'Cartap hydrochloride 50% SP': {
    phiDays: 14,
    whenToUse: 'Tillering–booting when BPH / leaf folder exceed ETL.',
    packMrp: '₹350–500 / 500 g',
  },
  'Buprofezin 25% SC': {
    phiDays: 7,
    whenToUse: 'Nymph stages of hoppers / whitefly — IGR timing.',
    packMrp: '₹450–700 / 500 ml',
  },
  'Pymetrozine 50% WG': {
    phiDays: 14,
    whenToUse: 'Early hopper build-up in rice.',
    packMrp: '₹800–1,200 / 120 g',
  },
  'Flubendiamide 39.35% SC': {
    phiDays: 7,
    whenToUse: 'Egg hatch / early larva at flowering–fruiting.',
    packMrp: '₹900–1,400 / 50 ml',
  },
  'Chlorantraniliprole 18.5% SC': {
    phiDays: 7,
    whenToUse: 'Preventive–early larva at vulnerable crop stages.',
    packMrp: '₹1,100–1,600 / 60 ml',
  },
  'Abamectin 1.9% EC': {
    phiDays: 7,
    whenToUse: 'Hot dry weather mite / thrips flare-ups.',
    packMrp: '₹350–550 / 250 ml',
  },
  'Spiromesifen 22.9% SC': {
    phiDays: 7,
    whenToUse: 'When mites / whitefly nymphs increase.',
    packMrp: '₹700–1,100 / 250 ml',
  },
  'Diafenthiuron 50% WP': {
    phiDays: 15,
    whenToUse: 'Whitefly outbreaks in cotton / chilli.',
    packMrp: '₹600–900 / 250 g',
  },
  'Novaluron 10% EC': {
    phiDays: 7,
    whenToUse: 'Early larval stage — IGR.',
    packMrp: '₹500–800 / 500 ml',
  },
  'Lufenuron 5.4% EC': {
    phiDays: 7,
    whenToUse: 'Early larva at fruiting.',
    packMrp: '₹550–850 / 500 ml',
  },
  'Metaflumizone 22% SC': {
    phiDays: 7,
    whenToUse: 'Fruiting stage chewing pests.',
    packMrp: '₹800–1,200 / 200 ml',
  },
  'Cyantraniliprole 10.26% OD': {
    phiDays: 5,
    whenToUse: 'Flowering–fruit set for fruit borer / thrips.',
    packMrp: '₹1,200–1,800 / 100 ml',
  },
  'Spinetoram 11.7% SC': {
    phiDays: 3,
    whenToUse: 'Fruiting; rotate modes of action.',
    packMrp: '₹1,000–1,500 / 100 ml',
  },
  'Malathion 50% EC': {
    phiDays: 7,
    whenToUse: 'Orchard / vegetable sucking pests as labelled.',
    packMrp: '₹180–280 / 500 ml',
  },
  'Dichlorvos 76% EC': {
    status: 'banned',
    whenToUse: 'Banned / phased out for agriculture — do not use.',
  },
  'Phosalone 35% EC': {
    phiDays: 15,
    whenToUse: 'Mid-season when pests exceed ETL.',
    packMrp: '₹300–450 / 500 ml',
  },
  'Mancozeb 75% WP': {
    phiDays: 7,
    whenToUse: 'Preventive spray before humid blight weather; repeat 7–10 days.',
    packMrp: '₹180–280 / 500 g',
  },
  'Carbendazim 50% WP': {
    phiDays: 14,
    whenToUse: 'Seed treatment / early disease; rotate — resistance risk.',
    packMrp: '₹200–320 / 500 g',
  },
  'Tricyclazole 75% WP': {
    phiDays: 20,
    whenToUse: 'Nursery to tillering for blast risk weather.',
    packMrp: '₹350–550 / 120 g',
  },
  'Propiconazole 25% EC': {
    phiDays: 20,
    whenToUse: 'Flag leaf / ear emergence for rust.',
    packMrp: '₹280–420 / 250 ml',
  },
  'Tebuconazole 25% EC': {
    phiDays: 14,
    whenToUse: 'At first disease symptoms or preventive flag-leaf.',
    packMrp: '₹300–450 / 250 ml',
  },
  'Hexaconazole 5% SC': {
    phiDays: 14,
    whenToUse: 'Early powdery mildew / sheath blight.',
    packMrp: '₹220–350 / 500 ml',
  },
  'Difenoconazole 25% EC': {
    phiDays: 14,
    whenToUse: 'Fruit development anthracnose / leaf spot.',
    packMrp: '₹400–600 / 250 ml',
  },
  'Azoxystrobin 23% SC': {
    phiDays: 7,
    whenToUse: 'Preventive–early; rotate FRAC groups.',
    packMrp: '₹700–1,100 / 200 ml',
  },
  'Copper oxychloride 50% WP': {
    phiDays: 7,
    whenToUse: 'Protective spray in wet weather.',
    packMrp: '₹200–320 / 500 g',
  },
  'Chlorothalonil 75% WP': {
    phiDays: 7,
    whenToUse: 'Protective during humid blight periods.',
    packMrp: '₹280–420 / 500 g',
  },
  'Metalaxyl + Mancozeb 72% WP': {
    phiDays: 7,
    whenToUse: 'Before / at first late blight warning.',
    packMrp: '₹350–520 / 500 g',
  },
  'Validamycin 3% L': {
    phiDays: 14,
    whenToUse: 'Tillering–booting for rice sheath blight.',
    packMrp: '₹180–280 / 500 ml',
  },
  'Kasugamycin 3% SL': {
    phiDays: 14,
    whenToUse: 'Early BLB / blast symptoms.',
    packMrp: '₹250–400 / 500 ml',
  },
  'Streptocycline + Copper': {
    phiDays: 7,
    whenToUse: 'At first bacterial symptoms; follow antibiotic rules.',
    packMrp: '₹80–150 / 6 g',
  },
  'Sulphur 80% WP': {
    phiDays: 3,
    whenToUse: 'Cool mornings for powdery mildew; avoid hot noon.',
    packMrp: '₹120–200 / 1 kg',
  },
  'Captan 50% WP': {
    phiDays: 7,
    whenToUse: 'Fruit set to development protective sprays.',
    packMrp: '₹250–380 / 500 g',
  },
  'Thiophanate methyl 70% WP': {
    phiDays: 14,
    whenToUse: 'Seed / soil / early wilt risk.',
    packMrp: '₹300–450 / 500 g',
  },
  'Pseudomonas fluorescens 2% WP': {
    whenToUse: 'Seed treatment / seedling dip before transplant.',
    packMrp: '₹150–250 / 1 kg',
  },
  'Trichoderma viride 1% WP': {
    whenToUse: 'Seed / soil enrichment before sowing.',
    packMrp: '₹150–250 / 1 kg',
  },
  'Bordeaux mixture 1%': {
    phiDays: 7,
    whenToUse: 'Dormant / wet-season protective orchard sprays.',
    packMrp: 'Prepare fresh — copper sulphate + lime',
  },
};

export const AGROCHEM_CATALOG_VERIFIED_AT = '2026-03-01';
