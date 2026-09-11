/** Compact LGD geography (AP / TS). Codes are Local Government Directory IDs. */

export type GeographyStateKey = 'ap' | 'ts';

export interface LgdVillage {
  /** Official English / transliterated name */
  n: string;
  /** Native (Telugu) name when available */
  t?: string;
  /** LGD village code */
  c: number;
}

export interface LgdMandal {
  n: string;
  c: number;
  v: LgdVillage[];
}

export interface LgdDistrict {
  n: string;
  c: number;
  m: LgdMandal[];
}

export interface LgdStateBundle {
  key: GeographyStateKey;
  nameEn: string;
  nameTe: string;
  source: string;
  updated: string;
  counts: { districts: number; mandals: number; villages: number };
  districts: LgdDistrict[];
}

export interface GeographyOption {
  label: string;
  value: string;
  code: number;
  nativeLabel?: string;
}
