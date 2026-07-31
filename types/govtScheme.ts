export type GovtSchemeCategory = 'subsidy' | 'loan' | 'insurance' | 'support';

export type GovtSchemeRegion = 'central' | 'ap' | 'ts';

export interface GovtScheme {
  id: string;
  category: GovtSchemeCategory;
  region: GovtSchemeRegion;
  titleTe: string;
  titleEn: string;
  amountTe: string;
  benefitTe: string;
  eligibilityTe: string;
  howToApplyTe: string;
  applyUrl?: string;
  icon: string;
  highlights: string[];
  /** ISO date when scheme details were last verified */
  verifiedAt: string;
}
