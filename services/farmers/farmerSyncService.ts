import { API_CONFIG } from '@/constants/app';
import type { FarmerContext } from '@/store/farmerContextStore';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useUserStore } from '@/store/userStore';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';

export interface FarmerSyncPayload {
  crops?: string[];
  cropPlantings?: FarmerContext['cropPlantings'];
  district?: string;
  mandal?: string;
  village?: string;
  state?: string;
  soilType?: string;
  farmSize?: string;
  areaAcres?: number;
  areaCents?: number;
  notes?: string[];
  fieldMeasurement?: FarmerContext['fieldMeasurement'];
  language?: string;
  name?: string;
}

function isBackendToken(token: string | null): boolean {
  return Boolean(token && token !== 'demo-auth-token');
}

export function buildFarmerSyncPayload(
  context: FarmerContext,
  extras?: Pick<FarmerSyncPayload, 'name' | 'language'>,
): FarmerSyncPayload {
  return {
    crops: context.crops,
    cropPlantings: context.cropPlantings,
    district: context.district,
    mandal: context.mandal,
    village: context.village,
    state: context.state,
    soilType: context.soilType,
    farmSize: context.farmSize,
    areaAcres: context.areaAcres,
    areaCents: context.areaCents,
    notes: context.notes,
    fieldMeasurement: context.fieldMeasurement,
    name: extras?.name,
    language: extras?.language,
  };
}

import type { FarmerCropPlanting } from '@/types/farmerCrop';

export interface FarmerServerProfile {
  name?: string;
  language?: string;
  location?: string;
  farmSize?: string;
  crops: string[];
  cropPlantings: FarmerCropPlanting[];
  district?: string;
  mandal?: string;
  village?: string;
  state?: string;
  soilType?: string;
  areaAcres?: number;
  notes?: string[];
  setupComplete?: boolean;
}

/** Pull farmer farm setup from Neon into the app. */
export async function fetchFarmerProfileFromDatabase(): Promise<FarmerServerProfile | null> {
  const { token } = useUserStore.getState();
  if (!isBackendToken(token)) return null;

  try {
    const response = await apiClient.get<{ success: boolean; data: FarmerServerProfile }>(
      ENDPOINTS.farmers.me,
      { timeout: 12000 },
    );
    return response.data.data;
  } catch {
    return null;
  }
}

/** Push local farmer profile to Neon (`farmers`, `lands`, `crop_calendar`). */
export async function syncFarmerProfileToDatabase(
  payload?: FarmerSyncPayload,
): Promise<boolean> {
  const { token, user } = useUserStore.getState();
  if (!isBackendToken(token)) return false;

  const context = useFarmerContextStore.getState();
  const body =
    payload ??
    buildFarmerSyncPayload(context, {
      name: user?.name,
      language: user?.language,
    });

  try {
    await apiClient.put(ENDPOINTS.farmers.sync, body, { timeout: 12000 });
    return true;
  } catch {
    return false;
  }
}

export function shouldSyncFarmerToDatabase(): boolean {
  if (!API_CONFIG.baseUrl) return false;
  return isBackendToken(useUserStore.getState().token);
}
