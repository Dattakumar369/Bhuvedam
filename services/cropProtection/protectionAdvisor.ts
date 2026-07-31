import { getCropProtectionGuide } from '@/constants/cropProtection/guides';
import { getCuratedVarieties } from '@/constants/cropVarieties';
import { useMandiStore } from '@/store/mandiStore';
import type {
  CropDisease,
  CropGrowthStage,
  FertilizerRecommendation,
  ProtectionAdviceBundle,
  SprayRecommendation,
} from '@/types/cropProtection';

export function getAdviceByStage(
  cropId: string,
  stageId: string,
): ProtectionAdviceBundle {
  const guide = getCropProtectionGuide(cropId);
  const stage = guide.stages.find((s) => s.id === stageId);

  return {
    cropId,
    stage,
    fertilizers: guide.fertilizersByStage[stageId] ?? [],
    sprays: guide.preventiveSpraysByStage[stageId] ?? [],
  };
}

export function getAdviceByDisease(
  cropId: string,
  diseaseId: string,
): ProtectionAdviceBundle {
  const guide = getCropProtectionGuide(cropId);
  const disease = guide.diseases.find((d) => d.id === diseaseId);

  return {
    cropId,
    disease,
    fertilizers: [],
    sprays: disease?.sprays ?? [],
  };
}

export function searchDiseases(cropId: string, query: string): CropDisease[] {
  const guide = getCropProtectionGuide(cropId);
  const q = query.trim().toLowerCase();
  if (!q) return guide.diseases;

  return guide.diseases.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.nameTe.toLowerCase().includes(q) ||
      d.symptoms.toLowerCase().includes(q) ||
      d.symptomsTe.toLowerCase().includes(q),
  );
}

export function getStagesForCrop(cropId: string): CropGrowthStage[] {
  return getCropProtectionGuide(cropId).stages;
}

export function getDiseasesForCrop(cropId: string): CropDisease[] {
  return getCropProtectionGuide(cropId).diseases;
}

export function formatProtectionSummaryForAI(cropId: string): string {
  const guide = getCropProtectionGuide(cropId);
  const curated = getCuratedVarieties(cropId);
  const allVarieties = useMandiStore.getState().getVarietyList(cropId);
  const lines: string[] = [`Crop protection guide for ${cropId}:`];

  if (allVarieties.length) {
    lines.push(
      `\nVARIETIES: ${allVarieties.length} total from Agmarknet catalog (${curated.length} with full curated fertilizer/spray guides). Each variety has different mandi rate — never give one rate for whole crop.`,
    );
    for (const v of curated) {
      lines.push(
        `\n• ${v.name} (${v.nameTe}) [FULL GUIDE]: duration ${v.duration}, yield ${v.yieldPotential}, ref price ~₹${v.referenceBaselineQtl}/qtl — ${v.priceNote}`,
      );
      lines.push(`  Fertilizer: ${v.fertilizerNotes.join('; ')}`);
      lines.push(`  Spray: ${v.sprayNotes.join('; ')}`);
      lines.push(`  Susceptible: ${v.diseaseSusceptibility.join(', ')}`);
    }
    const dynamicOnly = allVarieties.filter((v) => !v.isCurated).slice(0, 15);
    if (dynamicOnly.length) {
      lines.push('\nOther Agmarknet varieties (live mandi rate; use general crop stage/disease advice):');
      dynamicOnly.forEach((v) => lines.push(`  - ${v.name}`));
      if (allVarieties.length - curated.length > 15) {
        lines.push(`  ... and ${allVarieties.length - curated.length - 15} more — search in app`);
      }
    }
  }

  for (const stage of guide.stages) {
    const fert = guide.fertilizersByStage[stage.id] ?? [];
    const sprays = guide.preventiveSpraysByStage[stage.id] ?? [];
    if (!fert.length && !sprays.length) continue;

    lines.push(`\n[${stage.name} / ${stage.nameTe} — ${stage.daysRange}]`);
    fert.forEach((f) => lines.push(`  Fertilizer: ${f.name} — ${f.dose}, ${f.timing}, ~${f.estimatedPrice}`));
    sprays.forEach((s) =>
      lines.push(
        `  Spray: ${s.productName} for ${s.target} — ${s.dose}, ${s.bestTime}, ~${s.estimatedPrice}, PHI precautions: ${s.precautions[0] ?? 'see label'}`,
      ),
    );
  }

  if (guide.diseases.length) {
    lines.push('\nDiseases & treatments:');
    guide.diseases.forEach((d) => {
      const product = d.sprays[0]?.productName ?? 'consult local officer';
      lines.push(`  - ${d.name} (${d.nameTe}): ${d.symptomsTe || d.symptoms} → ${product}`);
    });
  }

  return lines.join('\n');
}

export type { FertilizerRecommendation, SprayRecommendation, CropDisease, CropGrowthStage };
