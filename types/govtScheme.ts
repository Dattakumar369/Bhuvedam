export type GovtSchemeCategory = 'subsidy' | 'loan' | 'insurance' | 'support';

export type GovtSchemeRegion = 'central' | 'ap' | 'ts';

export type GovtSchemeStatus = 'active' | 'closed';

/** Rules used to match against farmer profile in the app */
export interface GovtSchemeEligibilityRules {
  /** Scheme needs agricultural land / land records */
  requiresLand?: boolean;
  /** Only for landless agricultural labour */
  landlessOnly?: boolean;
  /** Prefer farmers with survey / khata entered */
  prefersLandRecords?: boolean;
}

export interface GovtScheme {
  id: string;
  category: GovtSchemeCategory;
  region: GovtSchemeRegion;
  /** Only `active` schemes are shown in Pathakalu */
  status: GovtSchemeStatus;
  titleEn: string;
  titleTe: string;
  amountEn: string;
  amountTe: string;
  benefitEn: string;
  benefitTe: string;
  eligibilityEn: string;
  eligibilityTe: string;
  howToApplyEn: string;
  howToApplyTe: string;
  applyUrl?: string;
  icon: string;
  highlightsEn: string[];
  highlightsTe: string[];
  eligibilityRules?: GovtSchemeEligibilityRules;
  /** ISO date when scheme details were last verified */
  verifiedAt: string;
}

export type SchemeEligibilityLevel = 'likely' | 'possible' | 'not_matching';

export type SchemeEligibilityReasonCode =
  | 'ap_only'
  | 'ts_only'
  | 'add_state'
  | 'state_ap'
  | 'state_ts'
  | 'central'
  | 'landless_only'
  | 'for_landless'
  | 'needs_land'
  | 'has_land'
  | 'has_records'
  | 'add_records';

export interface SchemeEligibilityResult {
  level: SchemeEligibilityLevel;
  reasons: SchemeEligibilityReasonCode[];
}
