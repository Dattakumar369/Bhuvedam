/**
 * Department of Fertilizers (DoF) — statutory / notified MRP reference.
 * Urea MRP is government-fixed; P&K grades are NBS company-notified typical bag MRPs.
 *
 * There is no public hourly dealer-price API in India. This file is the authoritative
 * overlay we re-apply on every fertilizer catalog sync so farmers see real DoF-linked
 * prices, not stale hardcoded brand pages alone.
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
  /** Fertilizer product ids in indianFertilizerCatalog */
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
    productIds: ['iffco-urea', 'nfl-urea', 'coromandel-urea'],
    aliases: ['neem coated urea', 'urea', '46-0-0'],
    mrp: '₹242/bag (45 kg) — DoF statutory',
    packSize: '45 kg',
    isSubsidized: true,
    grade: 'Urea (Neem coated)',
  },
  {
    productIds: ['iffco-dap', 'coromandel-dap', 'nfl-dap'],
    aliases: ['dap', 'diammonium phosphate', '18-46-0'],
    mrp: '₹1,350/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'DAP 18-46-0',
  },
  {
    productIds: ['iffco-mop', 'coromandel-mop'],
    aliases: ['mop', 'muriate of potash', '0-0-60', 'potash'],
    mrp: '₹1,700/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'MOP 0-0-60',
  },
  {
    productIds: ['iffco-ssp', 'coromandel-ssp'],
    aliases: ['ssp', 'single super phosphate'],
    mrp: '₹400/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'SSP',
  },
  {
    productIds: ['iffco-npk-10-26-26', 'coromandel-npk-10-26-26'],
    aliases: ['10-26-26', 'npk 10-26-26'],
    mrp: '₹1,450/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'NPK 10-26-26',
  },
  {
    productIds: ['iffco-npk-12-32-16', 'coromandel-npk-12-32-16'],
    aliases: ['12-32-16', 'npk 12-32-16'],
    mrp: '₹1,480/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'NPK 12-32-16',
  },
  {
    productIds: ['iffco-npk-20-20-0', 'coromandel-20-20-0-13'],
    aliases: ['20-20-0', '20-20-0-13', 'npk 20-20-0'],
    mrp: '₹1,200/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'NPK 20-20-0',
  },
  {
    productIds: ['iffco-npk-19-19-19'],
    aliases: ['19-19-19', 'npk 19-19-19'],
    mrp: '₹1,250/bag (50 kg) — NBS notified (typical)',
    packSize: '50 kg',
    isSubsidized: true,
    grade: 'NPK 19-19-19',
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
  return (
    OFFICIAL_FERTILIZER_MRPS.find((row) =>
      row.aliases.some((alias) => hay.includes(alias.toLowerCase())),
    ) ?? null
  );
}
