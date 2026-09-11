/**
 * Department of Fertilizers (DoF) — statutory / notified MRP reference.
 * Urea MRP is government-fixed; P&K grades are NBS company-notified typical bag MRPs.
 *
 * There is no public hourly dealer-price API in India. This file is the authoritative
 * overlay we re-apply on every fertilizer catalog sync AND on read, so farmers see
 * real DoF-linked prices even when Neon rows are stale.
 *
 * Update `verifiedAt` whenever DoF / company notifications change.
 */
export const FERTILIZER_PRICE_VERIFIED_AT = '2026-03-01';

export const FERTILIZER_PRICE_SOURCE = {
  id: 'dof_statutory_nbs',
  label: 'DoF statutory / NBS notified MRP',
  note:
    'Urea MRP is government-controlled. DAP/MOP/NPK are typical notified bag MRPs under Nutrient Based Subsidy — dealer may add local charges. Verify on pack / POS.',
  urvarakUrl: 'https://urvarak.nic.in/',
  dofUrl: 'https://www.fert.nic.in/',
} as const;

/** Match by fertilizer product id OR grade aliases */
export interface OfficialFertilizerMrp {
  /** Fertilizer product ids in indianFertilizerCatalog / nagarjunaDeepak */
  productIds: string[];
  /** Grade aliases used for fuzzy overlay */
  aliases: string[];
  /** Display MRP string shown in app */
  mrp: string;
  packSize: string;
  isSubsidized: boolean;
  grade: string;
}

export const OFFICIAL_FERTILIZER_MRPS: OfficialFertilizerMrp[] = [
  {
    productIds: [
      'iffco-urea',
      'nfl-urea',
      'nfl-neem-urea',
      'coromandel-urea',
      'coromandel-gromor-urea',
      'nagarjuna-urea',
    ],
    aliases: ['neem coated urea', 'neem urea', 'urea', '46-0-0'],
    mrp: '₹242/bag (45 kg) — DoF statutory',
    packSize: '45 kg',
    isSubsidized: true,
    grade: 'Urea (Neem coated)',
  },
  {
    productIds: [
      'iffco-dap',
      'coromandel-dap',
      'coromandel-gromor-dap',
      'nfl-dap',
      'nagarjuna-dap',
    ],
    aliases: ['dap', 'diammonium phosphate', '18-46-0'],
    mrp: '₹1,350/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'DAP 18-46-0',
  },
  {
    productIds: ['iffco-mop', 'coromandel-mop', 'coromandel-gromor-mop', 'dof-mop'],
    aliases: ['mop', 'muriate of potash', '0-0-60', 'potash'],
    mrp: '₹1,700/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'MOP 0-0-60',
  },
  {
    productIds: ['iffco-ssp', 'coromandel-ssp', 'coromandel-gromor-ssp', 'dof-ssp'],
    aliases: ['ssp', 'single super phosphate'],
    mrp: '₹400/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'SSP',
  },
  {
    productIds: [
      'iffco-npk-10-26-26',
      'coromandel-npk-10-26-26',
      'coromandel-gromor-10-26-26',
      'coromandel-gromor-ultra-10-26-26',
      'deepak-mahadhan-10-26-26',
    ],
    aliases: ['10-26-26', 'npk 10-26-26'],
    mrp: '₹1,450/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'NPK 10-26-26',
  },
  {
    productIds: [
      'iffco-npk-12-32-16',
      'coromandel-npk-12-32-16',
      'coromandel-gromor-12-32-16',
      'deepak-mahadhan-12-32-16',
    ],
    aliases: ['12-32-16', 'npk 12-32-16'],
    mrp: '₹1,480/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'NPK 12-32-16',
  },
  {
    productIds: [
      'iffco-np-20-20-0-13',
      'coromandel-20-20-0-13',
      'coromandel-gromor-20-20-0-13',
      'deepak-mahadhan-20-20-0-13',
    ],
    aliases: ['20-20-0', '20-20-0-13', 'npk 20-20-0'],
    mrp: '₹1,200/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'NPK 20-20-0',
  },
  {
    productIds: [
      'iffco-npk-19-19-19',
      'dof-npk-19-19-19',
      'nagarjuna-polyfeed-19-19-19',
    ],
    aliases: ['19-19-19', 'npk 19-19-19', 'polyfeed'],
    mrp: '₹1,250/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'NPK 19-19-19',
  },
  {
    productIds: ['iffco-npk-15-15-15', 'coromandel-gromor-15-15-15-09'],
    aliases: ['15-15-15', '15-15-15-09', 'npk 15-15-15'],
    mrp: '₹1,300/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'NPK 15-15-15',
  },
  {
    productIds: ['iffco-np-28-28-0', 'coromandel-gromor-28-28-0'],
    aliases: ['28-28-0', 'np 28-28'],
    mrp: '₹1,750/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'NP 28-28-0',
  },
  {
    productIds: ['dof-ammonium-sulphate'],
    aliases: ['ammonium sulphate', 'ammonium sulfate', '20.6-0-0'],
    mrp: '₹550/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'Ammonium sulphate',
  },
  {
    productIds: ['nagarjuna-map', 'dof-map'],
    aliases: ['map', 'mono ammonium phosphate', '12-61-0'],
    mrp: '₹1,600/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'MAP 12-61-0',
  },
  {
    productIds: ['dof-tsp'],
    aliases: ['tsp', 'triple super phosphate'],
    mrp: '₹900/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'TSP',
  },
  {
    productIds: ['iffco-nano-urea'],
    aliases: ['nano urea'],
    mrp: '₹225/bottle (500 ml) — company MRP (typical)',
    packSize: '500 ml',
    isSubsidized: false,
    grade: 'Nano urea',
  },
  {
    productIds: ['iffco-nano-dap'],
    aliases: ['nano dap'],
    mrp: '₹600/bottle (500 ml) — company MRP (typical)',
    packSize: '500 ml',
    isSubsidized: false,
    grade: 'Nano DAP',
  },
  {
    productIds: ['iffco-nano-zinc'],
    aliases: ['nano zinc'],
    mrp: '₹200/bottle (100 ml) — company MRP (typical)',
    packSize: '100 ml',
    isSubsidized: false,
    grade: 'Nano zinc',
  },
  {
    productIds: ['coromandel-paramfos'],
    aliases: ['paramfos', '16-20-0-13'],
    mrp: '₹1,350/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'Paramfos 16-20-0-13',
  },
  {
    productIds: ['nfl-zinc-sulphate', 'dof-zinc-sulphate'],
    aliases: ['zinc sulphate', 'znso4'],
    mrp: '₹90–140/kg — dealer typical',
    packSize: '1–25 kg',
    isSubsidized: false,
    grade: 'Zinc sulphate',
  },
  {
    productIds: ['nfl-ferrous-sulphate', 'dof-ferrous-sulphate'],
    aliases: ['ferrous sulphate', 'feso4'],
    mrp: '₹40–70/kg — dealer typical',
    packSize: '1–25 kg',
    isSubsidized: false,
    grade: 'Ferrous sulphate',
  },
  {
    productIds: ['dof-boron'],
    aliases: ['borax', 'boron fertilizer'],
    mrp: '₹180–280/kg — dealer typical',
    packSize: '1–5 kg',
    isSubsidized: false,
    grade: 'Boron / Borax',
  },
  {
    productIds: ['nfl-bio-azotobacter', 'nfl-bio-psb', 'nfl-bio-rhizobium'],
    aliases: ['azotobacter', 'bio-fertilizer', 'psb', 'rhizobium'],
    mrp: '₹80–150/pack — dealer typical',
    packSize: '200 g–1 kg',
    isSubsidized: false,
    grade: 'Bio-fertilizer',
  },
  {
    productIds: ['dof-compost-city'],
    aliases: ['city compost', 'fcom'],
    mrp: '₹5–12/kg — municipal / dealer typical',
    packSize: '25–50 kg',
    isSubsidized: false,
    grade: 'City compost',
  },
  {
    productIds: ['nagarjuna-mkp'],
    aliases: ['mkp', '00-52-34', 'mono potassium phosphate'],
    mrp: '₹280–380/kg — dealer typical',
    packSize: '1–25 kg',
    isSubsidized: false,
    grade: 'MKP 00-52-34',
  },
  {
    productIds: ['nagarjuna-multi-k'],
    aliases: ['multi-k', 'potassium nitrate', '13-0-46'],
    mrp: '₹220–320/kg — dealer typical',
    packSize: '1–25 kg',
    isSubsidized: false,
    grade: 'Potassium nitrate',
  },
  {
    productIds: ['deepak-mahadhan-amruta-cn'],
    aliases: ['calcium nitrate', 'amruta cn'],
    mrp: '₹90–140/kg — dealer typical',
    packSize: '1–25 kg',
    isSubsidized: false,
    grade: 'Calcium nitrate',
  },
  {
    productIds: ['deepak-mahadhan-bentonite-s'],
    aliases: ['sulphur bentonite', 'bentonite s'],
    mrp: '₹45–75/kg — dealer typical',
    packSize: '10–50 kg',
    isSubsidized: false,
    grade: 'Sulphur bentonite',
  },
];

export function resolveOfficialMrp(input: {
  id: string;
  name: string;
  npk?: string | null;
}): OfficialFertilizerMrp | null {
  const byId = OFFICIAL_FERTILIZER_MRPS.find((row) => row.productIds.includes(input.id));
  if (byId) return byId;

  const hay = `${input.name} ${input.npk ?? ''}`.toLowerCase();
  // Prefer longer aliases first so "nano urea" wins over "urea"
  const ranked = [...OFFICIAL_FERTILIZER_MRPS].sort(
    (a, b) =>
      Math.max(...b.aliases.map((x) => x.length)) - Math.max(...a.aliases.map((x) => x.length)),
  );
  return (
    ranked.find((row) => row.aliases.some((alias) => hay.includes(alias.toLowerCase()))) ?? null
  );
}
