import { CROPS } from '@/constants/crops';
import { CROP_SPEECH_ALIASES } from '@/constants/cropVoiceTasks';
import type { Href } from 'expo-router';

export type VoiceNavigateTarget =
  | '/mandi-rates'
  | '/weather'
  | '/measure-field'
  | '/nearby-places'
  | '/(tabs)/crop'
  | '/fertilizers'
  | '/pesticides'
  | '/crop-protection';

export interface VoiceNavigateAction {
  type: 'navigate';
  path: Href;
  confirmTe: string;
}

export interface VoiceAddCropAction {
  type: 'add_crop';
  cropId: string;
  areaAcres?: string;
  areaCents?: string;
  confirmTe: string;
}

export interface VoiceRememberAction {
  type: 'remember';
  note: string;
  confirmTe: string;
}

export type VoiceAction = VoiceNavigateAction | VoiceAddCropAction | VoiceRememberAction;

const NAV_RULES: { pattern: RegExp; path: Href; confirmTe: string }[] = [
  { pattern: /mandi|మండి|rates|ధర|modal|market/i, path: '/mandi-rates', confirmTe: 'Mandi rates open chestunnanu.' },
  { pattern: /weather|vaana|rain|వర్ష|weather|vaana/i, path: '/weather', confirmTe: 'Weather chupistunnanu.' },
  { pattern: /polam|field|measure|koluv|కొల|polam/i, path: '/measure-field', confirmTe: 'Polam koluvu open chestunnanu.' },
  { pattern: /shop|dealer|fertilizer shop|mandi.*shop|shops/i, path: '/nearby-places', confirmTe: 'Daggara shops chupistunnanu.' },
  { pattern: /fertilizer|eruvu|ఎరువ|urea/i, path: '/fertilizers', confirmTe: 'Fertilizers page open chestunnanu.' },
  { pattern: /pesticide|purugu|pest|mandu|మంద/i, path: '/pesticides', confirmTe: 'Pesticides page open chestunnanu.' },
  { pattern: /spray|crop protection/i, path: '/crop-protection', confirmTe: 'Spray guide open chestunnanu.' },
  { pattern: /crop guide|panta guide|పంట/i, path: '/(tabs)/crop', confirmTe: 'Crop guide open chestunnanu.' },
];

function detectCropId(text: string): string | null {
  const lower = text.toLowerCase();
  for (const crop of CROPS) {
    if (lower.includes(crop.id) || lower.includes(crop.name.toLowerCase()) || lower.includes(crop.nameTe)) {
      return crop.id;
    }
  }
  for (const [alias, id] of Object.entries(CROP_SPEECH_ALIASES)) {
    if (lower.includes(alias)) return id;
  }
  return null;
}

function parseArea(text: string): { acres?: string; cents?: string } {
  const ekara = text.match(/(\d+(?:\.\d+)?)\s*(?:ekara|acre|ఎకర|ekar)/i);
  if (ekara) return { acres: ekara[1] };

  const cent = text.match(/(\d+(?:\.\d+)?)\s*(?:cent|cents|సెంట)/i);
  if (cent) return { cents: cent[1] };

  return {};
}

const ADD_CROP_RE =
  /\b(add|save|pettu|vei|undhi|undi|unnadi|plant|panta|crop)\b|add chey|save chey|pett(u|andi)|ve(y|yi)|undhi/i;

const REMEMBER_RE =
  /\b(gurtu pettu|remember|ninna|repu|cheppanu|cheppali|gurthu)\b|గుర్త|నిన్న|రేప/i;

export function parseVoiceActions(transcript: string): VoiceAction[] {
  const text = transcript.trim();
  if (!text) return [];

  const actions: VoiceAction[] = [];

  for (const rule of NAV_RULES) {
    if (rule.pattern.test(text)) {
      actions.push({ type: 'navigate', path: rule.path, confirmTe: rule.confirmTe });
      break;
    }
  }

  const cropId = detectCropId(text);
  const area = parseArea(text);

  if (cropId && (ADD_CROP_RE.test(text) || area.acres || area.cents)) {
    actions.push({
      type: 'add_crop',
      cropId,
      areaAcres: area.acres,
      areaCents: area.cents,
      confirmTe: `Sare, ${cropId} panta mee farm lo save chestunnanu.`,
    });
  }

  if (REMEMBER_RE.test(text) && text.length >= 15) {
    actions.push({
      type: 'remember',
      note: text.slice(0, 160),
      confirmTe: 'Gurtu pettukunna — repu kuda cheppagalanu.',
    });
  }

  return actions;
}
