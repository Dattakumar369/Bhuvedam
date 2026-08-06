import type { Href } from 'expo-router';
import { router } from 'expo-router';

import { CROPS } from '@/constants/crops';
import type { VoiceAction } from '@/services/voice/voiceActionRouter';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import type { FarmerCropPlanting } from '@/types/farmerCrop';
import { emptyPlanting, syncPlantingsForCrops } from '@/types/farmerCrop';

export async function executeVoiceActions(actions: VoiceAction[]): Promise<string[]> {
  const confirmations: string[] = [];
  const store = useFarmerContextStore.getState();

  for (const action of actions) {
    if (action.type === 'navigate') {
      router.push(action.path as Href);
      confirmations.push(action.confirmTe);
      continue;
    }

    if (action.type === 'remember') {
      await store.rememberNote(action.note);
      await store.learnFromUserMessage(action.note);
      confirmations.push(action.confirmTe);
      continue;
    }

    if (action.type === 'add_crop') {
      const cropIds = store.crops.includes(action.cropId)
        ? store.crops
        : [...store.crops, action.cropId];

      let plantings = syncPlantingsForCrops(cropIds, store.cropPlantings);
      plantings = plantings.map((p): FarmerCropPlanting => {
        if (p.cropId !== action.cropId) return p;
        return {
          ...p,
          areaAcres: action.areaAcres ?? p.areaAcres,
          areaCents: action.areaCents ?? p.areaCents,
          sowingMonth: p.sowingMonth || String(new Date().getMonth() + 1),
          sowingYear: p.sowingYear || String(new Date().getFullYear()),
          sowingDate: p.sowingDate ?? new Date().toISOString().slice(0, 10),
        };
      });

      if (!plantings.find((p) => p.cropId === action.cropId)) {
        plantings.push({
          ...emptyPlanting(action.cropId),
          areaAcres: action.areaAcres ?? '',
          areaCents: action.areaCents ?? '',
          sowingMonth: String(new Date().getMonth() + 1),
          sowingYear: String(new Date().getFullYear()),
          sowingDate: new Date().toISOString().slice(0, 10),
        });
      }

      await store.saveFarmSetup({
        crops: cropIds,
        cropPlantings: plantings,
        district: store.district,
        mandal: store.mandal,
        village: store.village,
        state: store.state,
        soilType: store.soilType,
      });

      const cropName = CROPS.find((c) => c.id === action.cropId)?.nameTe ?? action.cropId;
      confirmations.push(`${cropName} save chesanu. ${action.confirmTe}`);
    }
  }

  return confirmations;
}
