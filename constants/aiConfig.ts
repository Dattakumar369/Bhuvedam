import { Platform } from 'react-native';

import type { LanguageCode } from '@/constants/languages';
import { API_CONFIG } from '@/constants/app';
import { getLocaleConfig } from '@/constants/i18n/localeConfig';
import { getSpokenStylePrompt } from '@/constants/i18n/spokenStyle';
import { AI_TRUST_AND_LEGAL_RULES } from '@/constants/trustPolicy';

export type AIProvider = 'ollama' | 'openai';

function resolveUseBackend(): boolean {
  if (process.env.EXPO_PUBLIC_USE_BACKEND_AI === 'true') return true;
  // Direct Ollama streaming breaks on Android/iOS APK — always proxy via Vercel.
  if (Platform.OS !== 'web') return true;
  if (!process.env.EXPO_PUBLIC_OLLAMA_API_KEY?.trim()) return true;
  const api = API_CONFIG.baseUrl;
  return api.includes('vercel.app') || api.includes('bhuvedam.com');
}

export const AI_CONFIG = {
  provider: (process.env.EXPO_PUBLIC_AI_PROVIDER ?? 'ollama') as AIProvider,
  ollamaUrl: process.env.EXPO_PUBLIC_OLLAMA_API_URL ?? 'https://ollama.com',
  ollamaApiKey: process.env.EXPO_PUBLIC_OLLAMA_API_KEY ?? '',
  /** llama3.2 / qwen2.5:7b = faster & more factual; gpt-oss:20b can hallucinate on small facts */
  ollamaModel: process.env.EXPO_PUBLIC_OLLAMA_MODEL ?? 'llama3.2',
  apiUrl: process.env.EXPO_PUBLIC_AI_API_URL ?? 'https://api.openai.com/v1',
  apiKey: process.env.EXPO_PUBLIC_AI_API_KEY ?? '',
  model: process.env.EXPO_PUBLIC_AI_MODEL ?? 'gpt-4o-mini',
  /** Vision model for image analysis (Ollama: llama3.2-vision, llava, etc.) */
  ollamaVisionModel: process.env.EXPO_PUBLIC_OLLAMA_VISION_MODEL ?? 'llama3.2-vision',
  useBackend: resolveUseBackend(),
};

export function hasRealAIProvider(): boolean {
  if (AI_CONFIG.useBackend && API_CONFIG.baseUrl) return true;
  if (AI_CONFIG.provider === 'ollama') return Boolean(AI_CONFIG.ollamaApiKey);
  return Boolean(AI_CONFIG.apiKey);
}

const ACCURACY_RULES = `HOW YOU TALK (mandatory):
1. You are a warm local agriculture advisor — talk like a REAL person at the field, not a robot or product list.
2. This is an ongoing conversation — use chat history for follow-ups ("that crop", "same mandi").
3. FIRST understand what the farmer asked. Answer ONLY that question — nothing extra.
4. Do NOT mention sprays, pesticides, doses, ml/acre, or ekar/acres UNLESS they asked about those.
5. Reply in the farmer's language — simple spoken words (Telugu: మాట్లాడే తెలుగు), not textbook style.
6. When they ask about disease/pest — then give product name + dose. Otherwise skip product lists.
7. Use LIVE DATA and library sources when relevant — analyze them, don't copy-paste.`;

const AI_SYSTEM_PROMPT_VOICE = `You are Bhuvedam — a friendly Telugu-speaking agriculture helper. Talk like a real person, not AI.

${ACCURACY_RULES}

${AI_TRUST_AND_LEGAL_RULES}

Voice: 2–4 short spoken sentences in pure Telugu script. Warm village tone — "సరే అన్న", "మీకు చెప్పాలంటే..."
Answer ONLY what they asked. No product lists unless they asked about mandu/spray.`;

const AI_SYSTEM_PROMPT_BASE = `You are Bhuvedam — a friendly agriculture advisor for Indian farmers. Talk like a real person helping at the field.

${ACCURACY_RULES}

${AI_TRUST_AND_LEGAL_RULES}

Answer the farmer's exact question first. Short, natural paragraphs — not a catalog of sprays and doses unless they asked for that.`;

export function getSystemPrompt(language: LanguageCode, voiceMode = false): string {
  const { aiLanguage } = getLocaleConfig(language);
  const spokenStyle = getSpokenStylePrompt(language, voiceMode);
  const base = voiceMode ? AI_SYSTEM_PROMPT_VOICE : AI_SYSTEM_PROMPT_BASE;

  return `${base}
${spokenStyle}

LANGUAGE: Reply entirely in ${aiLanguage}. Match the farmer's language style but stay in ${aiLanguage}.`;
}

/** @deprecated Use getSystemPrompt(language) */
export const AI_SYSTEM_PROMPT = getSystemPrompt('en');
