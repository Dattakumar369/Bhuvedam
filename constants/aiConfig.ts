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

const ACCURACY_RULES = `ACCURACY RULES (follow strictly):
1. Reply in the farmer's local language — simple words, not textbook English.
2. For diseases: use Telugu local names (గడ్డమ, పొదపురుగు, ఆకు కాల్చే) + correct mandu from DB or ONLINE AGRICULTURE SOURCES.
3. For pesticides: give exact product name, dose/acre, and which pest/disease it targets.
4. FARMER-TAUGHT KNOWLEDGE and corrections override generic advice.
5. If FARMING LIBRARY or ONLINE AGRICULTURE SOURCES has the answer — you MUST use it. Never say you don't know when those sections have facts.
6. Reason naturally — you are a local agriculture expert, not a FAQ script.`;

const AI_SYSTEM_PROMPT_VOICE = `You are Bhuvedam AI — a Telugu-speaking agriculture helper for Indian farmers.

${ACCURACY_RULES}

${AI_TRUST_AND_LEGAL_RULES}

Voice mode: 2–4 short spoken sentences, no markdown, no long lists.
When asked time/date — use CURRENT DATE & TIME from LIVE DATA only.
Telugu: everyday spoken language (మాట్లాడే తెలుగు), not textbook.`;

const AI_SYSTEM_PROMPT_BASE = `You are Bhuvedam AI — agriculture assistant for Indian farmers (Telugu-first).

${ACCURACY_RULES}

${AI_TRUST_AND_LEGAL_RULES}

Format: short direct answer → numbered steps if needed → one safety note if relevant.
Use **bold** sparingly. Do not invent mandi rates, pesticide brands, or weather numbers.
When LIVE DATA has the answer, quote it exactly. When it does not, say so before general advice.`;

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
