import type {
  GovtScheme,
  GovtSchemeRegion,
  SchemeEligibilityReasonCode,
  SchemeEligibilityResult,
} from '@/types/govtScheme';

export interface FarmerSchemeProfile {
  state?: string;
  district?: string;
  surveyNumber?: string;
  khataNumber?: string;
  landExtentAcres?: string;
  areaAcres?: number;
  farmSize?: string;
  setupComplete?: boolean;
}

function normalizeState(state?: string): GovtSchemeRegion | 'other' | null {
  const s = (state ?? '').trim().toLowerCase();
  if (!s) return null;
  if (s.includes('andhra') || s.includes('ఆంధ్ర') || s === 'ap' || s.includes('andra')) {
    return 'ap';
  }
  if (s.includes('telangana') || s.includes('తెలంగాణ') || s === 'ts' || s.includes('tg')) {
    return 'ts';
  }
  return 'other';
}

function hasLandSignal(profile: FarmerSchemeProfile): boolean {
  const extent = Number(String(profile.landExtentAcres ?? '').replace(/,/g, ''));
  if (Number.isFinite(extent) && extent > 0) return true;
  if (profile.areaAcres != null && profile.areaAcres > 0) return true;
  if (profile.farmSize?.trim()) return true;
  if (profile.surveyNumber?.trim()) return true;
  if (profile.khataNumber?.trim()) return true;
  return false;
}

function hasLandRecords(profile: FarmerSchemeProfile): boolean {
  return Boolean(profile.surveyNumber?.trim() || profile.khataNumber?.trim());
}

/**
 * Match a scheme against the farmer profile.
 * State schemes that don't match the farmer's state are marked not_matching (hidden).
 */
export function evaluateSchemeEligibility(
  scheme: GovtScheme,
  profile: FarmerSchemeProfile,
): SchemeEligibilityResult {
  const reasons: SchemeEligibilityReasonCode[] = [];
  const farmerRegion = normalizeState(profile.state);
  const rules = scheme.eligibilityRules ?? {};

  if (scheme.region === 'ap' || scheme.region === 'ts') {
    if (farmerRegion && farmerRegion !== scheme.region) {
      return {
        level: 'not_matching',
        reasons: [scheme.region === 'ap' ? 'ap_only' : 'ts_only'],
      };
    }
    if (!farmerRegion) {
      reasons.push('add_state');
    } else {
      reasons.push(scheme.region === 'ap' ? 'state_ap' : 'state_ts');
    }
  } else {
    reasons.push('central');
  }

  if (rules.landlessOnly) {
    if (hasLandSignal(profile)) {
      return {
        level: 'not_matching',
        reasons: ['landless_only'],
      };
    }
    reasons.push('for_landless');
    return {
      level: farmerRegion === 'ts' || !farmerRegion ? 'likely' : 'possible',
      reasons,
    };
  }

  if (rules.requiresLand && !hasLandSignal(profile)) {
    reasons.push('needs_land');
    return { level: 'possible', reasons };
  }

  if (rules.requiresLand && hasLandSignal(profile)) {
    reasons.push('has_land');
  }

  if (rules.prefersLandRecords) {
    reasons.push(hasLandRecords(profile) ? 'has_records' : 'add_records');
  }

  const regionOk =
    scheme.region === 'central' || !farmerRegion || farmerRegion === scheme.region;
  const landOk = !rules.requiresLand || hasLandSignal(profile);

  if (regionOk && landOk) {
    return { level: 'likely', reasons };
  }

  return { level: 'possible', reasons };
}

export function sortSchemesByEligibility(
  schemes: GovtScheme[],
  profile: FarmerSchemeProfile,
): Array<GovtScheme & { eligibility: SchemeEligibilityResult }> {
  const rank = { likely: 0, possible: 1, not_matching: 2 } as const;
  return schemes
    .map((scheme) => ({
      ...scheme,
      eligibility: evaluateSchemeEligibility(scheme, profile),
    }))
    .filter((s) => s.eligibility.level !== 'not_matching')
    .sort((a, b) => rank[a.eligibility.level] - rank[b.eligibility.level]);
}
