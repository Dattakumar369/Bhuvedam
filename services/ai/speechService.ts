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
    voiceCache.set(language, enhanced?.identifier ?? defaultVoice?.identifier ?? matching[0]?.identifier);
  } catch {
    voiceCache.set(language, undefined);
  }
}

export function speak(text: string, language: LanguageCode = 'en', onDone?: () => void): void {
  const cleaned = prepareTextForSpeech(text, language);
  if (!cleaned) {
    onDone?.();
    return;
  }

  stopSpeaking();

  speakQueue = splitForTts(cleaned);
  speakDoneCallback = onDone;
  isSpeaking = true;
  speakNextChunk(language);
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
