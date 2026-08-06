import { CROPS } from '@/constants/crops';
import { CROP_SPEECH_ALIASES, CROP_VOICE_TASKS } from '@/constants/cropVoiceTasks';
import { getLocalizedGreeting } from '@/constants/i18n/appTranslations';
import type { LanguageCode } from '@/constants/languages';
import type { FarmerCropPlanting } from '@/types/farmerCrop';
import { formatAreaLabel } from '@/utils/geoArea';

export interface FarmBriefingInput {
  farmerName?: string;
  language: LanguageCode;
  cropPlantings: FarmerCropPlanting[];
  crops: string[];
  learnedFacts: Array<{ text: string; learnedAt: string }>;
  notes: string[];
}

export interface FarmBriefingLine {
  kind: 'greeting' | 'question' | 'reminder' | 'memory' | 'tip';
  text: string;
}

function cropLabel(cropId: string): string {
  const c = CROPS.find((x) => x.id === cropId);
  return c?.nameTe ?? c?.name ?? cropId;
}

function resolveCropId(token: string): string | null {
  const lower = token.toLowerCase().trim();
  if (CROPS.some((c) => c.id === lower)) return lower;
  return CROP_SPEECH_ALIASES[lower] ?? null;
}

export function daysSinceSowing(planting: FarmerCropPlanting, now = new Date()): number | null {
  if (planting.sowingDate) {
    const d = new Date(planting.sowingDate);
    if (Number.isNaN(d.getTime())) return null;
    return Math.floor((now.getTime() - d.getTime()) / 86400000);
  }
  const month = parseInt(planting.sowingMonth, 10);
  const year = parseInt(planting.sowingYear, 10);
  if (!month || !year) return null;
  const estimated = new Date(year, month - 1, 15);
  return Math.floor((now.getTime() - estimated.getTime()) / 86400000);
}

function areaPhrase(planting: FarmerCropPlanting): string {
  const acres = planting.areaAcres?.trim();
  const cents = planting.areaCents?.trim();
  if (acres || cents) {
    return formatAreaLabel(acres || '0', cents || '0', 'manual').primary;
  }
  return '';
}

function buildTaskReminders(
  plantings: FarmerCropPlanting[],
  language: LanguageCode,
): FarmBriefingLine[] {
  const lines: FarmBriefingLine[] = [];
  const now = new Date();

  for (const planting of plantings) {
    const days = daysSinceSowing(planting, now);
    if (days == null || days < 0) continue;

    const tasks = CROP_VOICE_TASKS[planting.cropId] ?? CROP_VOICE_TASKS[resolveCropId(planting.cropId) ?? ''] ?? [];
    for (const task of tasks) {
      if (Math.abs(days - task.day) <= task.tolerance) {
        const area = areaPhrase(planting);
        const crop = cropLabel(planting.cropId);
        const msg =
          language === 'te'
            ? `${area ? `${area} ` : ''}${crop} — ${task.messageTe}. Ippudu ${days} rojulu ayyayi.`
            : `${crop}${area ? ` (${area})` : ''}: ${task.messageEn}. Day ${days}.`;
        lines.push({ kind: 'reminder', text: msg });
      }
    }
  }

  return lines.slice(0, 3);
}

function buildMemoryReminders(
  learnedFacts: FarmBriefingInput['learnedFacts'],
  notes: string[],
  language: LanguageCode,
): FarmBriefingLine[] {
  const lines: FarmBriefingLine[] = [];
  const yesterday = Date.now() - 86400000 * 2;

  const recentFacts = learnedFacts
    .filter((f) => new Date(f.learnedAt).getTime() >= yesterday)
    .slice(0, 2);

  for (const fact of recentFacts) {
    lines.push({
      kind: 'memory',
      text:
        language === 'te'
          ? `Ninna meeru chepparu: "${fact.text.slice(0, 80)}" — eeroju idi gurthu pettukondi.`
          : `You mentioned: "${fact.text.slice(0, 80)}" — remember this today.`,
    });
  }

  if (notes[0]) {
    lines.push({
      kind: 'memory',
      text:
        language === 'te'
          ? `Mee notepad lo: ${notes[0].slice(0, 100)}`
          : `Your note: ${notes[0].slice(0, 100)}`,
    });
  }

  return lines.slice(0, 2);
}

export function buildFarmBriefing(input: FarmBriefingInput): FarmBriefingLine[] {
  const { farmerName, language, cropPlantings, crops, learnedFacts, notes } = input;
  const firstName = farmerName?.split(' ')[0] ?? (language === 'te' ? 'raithu' : 'farmer');
  const greetingWord = getLocalizedGreeting(language);

  const lines: FarmBriefingLine[] = [
    {
      kind: 'greeting',
      text:
        language === 'te'
          ? `${greetingWord} ${firstName} garu! Nenu Bhuvedam — mee saayam.`
          : `${greetingWord} ${firstName}! I am Bhuvedam, your farm helper.`,
    },
    {
      kind: 'question',
      text:
        language === 'te'
          ? 'Eeroju em cheyali anukuntunnaru? Naku cheppandi — matladandi, nenu vinutha.'
          : 'What do you want to do today? Speak to me — I will listen.',
    },
  ];

  if (!crops.length) {
    lines.push({
      kind: 'tip',
      text:
        language === 'te'
          ? 'Mee panta add cheyamani cheppandi — "rendu ekarala mirapa undi" laga cheppochu.'
          : 'Tell me your crops — e.g. "I have two acres of cotton".',
    });
  }

  lines.push(...buildTaskReminders(cropPlantings, language));
  lines.push(...buildMemoryReminders(learnedFacts, notes, language));

  return lines;
}

export function briefingToSpeech(lines: FarmBriefingLine[]): string {
  return lines.map((l) => l.text).join(' ');
}
