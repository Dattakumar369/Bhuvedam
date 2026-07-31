import { config } from 'dotenv';

config({ path: '.env' });

import { db } from '../db';
import { crops } from '../db/schema';
import { buildCropSearchAliases } from '../services/cropSearch';
import catalogData from '../data/crops.catalog.json';

type CatalogCrop = {
  id: string;
  name: string;
  nameTe: string;
  category: string;
  season: 'kharif' | 'rabi' | 'year-round';
  seasonLabel: string;
  icon: string;
  color: string;
  sowingPeriod: string;
  harvestPeriod: string;
  waterNeeds: string;
  soilType: string;
  tips: string[];
};

const catalog = catalogData as CatalogCrop[];

export async function seedBhuvedamCrops() {
  console.log(`Seeding ${catalog.length} Bhuvedam crops into Neon...`);

  for (const crop of catalog) {
    const aliases = buildCropSearchAliases(crop.id, crop.name, crop.nameTe, { te: crop.nameTe });
    const localizedNames: Record<string, string> = { te: crop.nameTe, en: crop.name };

    await db
      .insert(crops)
      .values({
        id: crop.id,
        name: crop.name,
        nameTe: crop.nameTe,
        season: crop.season,
        seasonLabel: crop.seasonLabel,
        category: crop.category,
        sowingPeriod: crop.sowingPeriod,
        harvestPeriod: crop.harvestPeriod,
        waterNeeds: crop.waterNeeds,
        soilType: crop.soilType,
        tips: crop.tips ?? [],
        searchAliases: aliases,
        localizedNames,
        icon: crop.icon,
        color: crop.color,
        source: 'bhuvedam',
        regionScope: 'ap-telangana',
        lastSyncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: crops.id,
        set: {
          name: crop.name,
          nameTe: crop.nameTe,
          season: crop.season,
          seasonLabel: crop.seasonLabel,
          category: crop.category,
          sowingPeriod: crop.sowingPeriod,
          harvestPeriod: crop.harvestPeriod,
          waterNeeds: crop.waterNeeds,
          soilType: crop.soilType,
          tips: crop.tips ?? [],
          searchAliases: aliases,
          localizedNames,
          icon: crop.icon,
          color: crop.color,
          source: 'bhuvedam',
          regionScope: 'ap-telangana',
          lastSyncedAt: new Date(),
        },
      });
  }

  console.log(`✓ Seeded ${catalog.length} crops with Telugu + English search aliases`);
  return catalog.length;
}

const isDirectRun = process.argv[1]?.includes('seedBhuvedamCrops');
if (isDirectRun) {
  seedBhuvedamCrops()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
