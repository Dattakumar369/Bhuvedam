import * as Speech from 'expo-speech';
import { VoiceQuality } from 'expo-speech';

import type { LanguageCode } from '@/constants/languages';
import { getLocaleConfig } from '@/constants/i18n/localeConfig';

let isSpeaking = false;
let speakQueue: string[] = [];
let speakDoneCallback: (() => void) | undefined;
const voiceCache = new Map<LanguageCode, string | undefined>();

function splitForTts(text: string, maxLen = 320): string[] {
  if (text.length <= maxLen) return [text];

  const parts: string[] = [];
  let rest = text;

  while (rest.length > maxLen) {
    const slice = rest.slice(0, maxLen);
    const breakAt = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('। '), slice.lastIndexOf(' '));
    const cut = breakAt > 40 ? breakAt + 1 : maxLen;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  if (rest) parts.push(rest);
  return parts.filter(Boolean);
}

function finishSpeakQueue(): void {
  isSpeaking = false;
  speakQueue = [];
  const done = speakDoneCallback;
  speakDoneCallback = undefined;
  done?.();
}

function speakNextChunk(language: LanguageCode): void {
  const chunk = speakQueue.shift();
  if (!chunk) {
    finishSpeakQueue();
    return;
  }

  const { speech, speechRate, speechPitch } = getLocaleConfig(language);
  const voice = voiceCache.get(language);

  Speech.speak(chunk, {
    language: speech,
    ...(voice ? { voice } : {}),
    pitch: speechPitch,
    rate: speechRate,
    onDone: () => speakNextChunk(language),
    onStopped: () => finishSpeakQueue(),
    onError: () => finishSpeakQueue(),
  });
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[•·▪▸►]/g, '')
    .replace(/---+/g, '. ')
    .trim();
}

function latinLetterRatio(text: string): number {
  const letters = text.replace(/[^A-Za-z\u0C00-\u0C7F\u0900-\u097F]/g, '');
  if (!letters.length) return 0;
  const latin = (letters.match(/[A-Za-z]/g) ?? []).length;
  return latin / letters.length;
}

function hasTeluguScript(text: string): boolean {
  return /[\u0C00-\u0C7F]/.test(text);
}

function hasDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

/** Prefer a TTS language that matches the script actually in the reply. */
export function resolveSpeechLanguage(text: string, preferred: LanguageCode): LanguageCode {
  if (hasTeluguScript(text)) return 'te';
  if (hasDevanagari(text) && (preferred === 'hi' || preferred === 'mr')) return preferred;
  if (latinLetterRatio(text) > 0.55) return 'en';
  return preferred;
}

/** Shape AI text so TTS sounds like natural speech, especially for Telugu. */
export function prepareTextForSpeech(text: string, language: LanguageCode): string {
  let cleaned = stripMarkdown(text);
  cleaned = cleaned.replace(/\n+/g, '. ').replace(/(\d+)\.\s/g, '$1, ');

  if (language === 'te') {
    cleaned = cleaned
      .replace(/°C/g, ' డిగ్రీలు')
      .replace(/(\d+)\s*%/g, '$1 శాతం')
      .replace(/km\/h/g, ' కిలోమీటర్లు గంటకు')
      .replace(/:\s*/g, ', ')
      .replace(/\s{2,}/g, ' ');

    // Full Telugu script only — never mix Latin into Telugu syllables (breaks TTS).
    const romanToTe: [RegExp, string][] = [
      [/\bmeeku\b/gi, 'మీకు'],
      [/\bmee\b/gi, 'మీ'],
      [/\bcheppali\b/gi, 'చెప్పాలి'],
      [/\bcheppandi\b/gi, 'చెప్పండి'],
      [/\bcheyali\b/gi, 'చేయాలి'],
      [/\bcheyandi\b/gi, 'చేయండి'],
      [/\beppudu\b/gi, 'ఎప్పుడు'],
      [/\bmandu\b/gi, 'మందు'],
      [/\brogam\b/gi, 'రోగం'],
      [/\bpurugu\b/gi, 'పురుగు'],
      [/\braithu\b/gi, 'రైతు'],
      [/\brythu\b/gi, 'రైతు'],
      [/\bledu\b/gi, 'లేదు'],
      [/\bundi\b/gi, 'ఉంది'],
      [/\bvellandi\b/gi, 'వెళ్లండి'],
      [/\badagandi\b/gi, 'అడగండి'],
      [/\bmalli\b/gi, 'మళ్లీ'],
      [/\btry cheyandi\b/gi, 'ప్రయత్నించండి'],
      [/\bacre\b/gi, 'ఎకరం'],
      [/\bacres\b/gi, 'ఎకరాలు'],
      [/\bml\b/gi, 'మిలీ'],
      [/\blitre\b/gi, 'లీటరు'],
      [/\bliter\b/gi, 'లీటరు'],
      [/\bgaru\b/gi, ''],
    ];
    for (const [pattern, replacement] of romanToTe) {
      cleaned = cleaned.replace(pattern, replacement);
    }
  }

  return cleaned.replace(/\s+/g, ' ').trim();
}

export async function warmUpSpeechVoice(language: LanguageCode): Promise<void> {
  if (voiceCache.has(language)) return;

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const { speech } = getLocaleConfig(language);
    const langPrefix = speech.split('-')[0].toLowerCase();

    const matching = voices.filter((v) => v.language.toLowerCase().startsWith(langPrefix));
    const enhanced = matching.find((v) => v.quality === VoiceQuality.Enhanced);
    const defaultVoice = matching.find((v) => v.identifier.toLowerCase().includes('default'));
    const network = matching.find((v) => /network|google|online/i.test(v.identifier));
    voiceCache.set(
      language,
      enhanced?.identifier ??
        network?.identifier ??
        defaultVoice?.identifier ??
        matching[0]?.identifier,
    );
  } catch {
    voiceCache.set(language, undefined);
  }
}

export function hasCachedSpeechVoice(language: LanguageCode): boolean {
  return Boolean(voiceCache.get(language));
}

export function speak(text: string, language: LanguageCode = 'en', onDone?: () => void): void {
  const speechLang = resolveSpeechLanguage(text, language);
  const cleaned = prepareTextForSpeech(text, speechLang);
  if (!cleaned) {
    onDone?.();
    return;
  }

  // Romanized Telugu with te-IN voice is unintelligible — speak clearly in English instead.
  if (speechLang === 'te' && latinLetterRatio(cleaned) > 0.45 && !hasTeluguScript(cleaned)) {
    const englishClean = prepareTextForSpeech(text, 'en');
    stopSpeaking();
    speakQueue = splitForTts(englishClean || cleaned);
    speakDoneCallback = onDone;
    isSpeaking = true;
    speakNextChunk('en');
    return;
  }

  stopSpeaking();

  speakQueue = splitForTts(cleaned);
  speakDoneCallback = onDone;
  isSpeaking = true;
  speakNextChunk(speechLang);
}

export function stopSpeaking(): void {
  Speech.stop();
  speakQueue = [];
  speakDoneCallback = undefined;
  isSpeaking = false;
}

export function getIsSpeaking(): boolean {
  return isSpeaking;
}

export async function isSpeechAvailable(): Promise<boolean> {
  return Speech.isSpeakingAsync()
    .then(() => true)
    .catch(() => true);
}
