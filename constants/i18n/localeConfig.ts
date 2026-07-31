import type { LanguageCode } from '@/constants/languages';

export interface LocaleConfig {
  /** BCP-47 code for text-to-speech (expo-speech) */
  speech: string;
  /** BCP-47 code for speech recognition */
  speechRecognition: string;
  /** Human-readable language name for AI system prompt */
  aiLanguage: string;
  /** TTS rate (0.0–1.0 on iOS, Android may differ) */
  speechRate: number;
  /** TTS pitch multiplier */
  speechPitch: number;
}

export const LOCALE_CONFIG: Record<LanguageCode, LocaleConfig> = {
  en: {
    speech: 'en-IN',
    speechRecognition: 'en-IN',
    aiLanguage: 'English',
    speechRate: 0.92,
    speechPitch: 1.0,
  },
  hi: {
    speech: 'hi-IN',
    speechRecognition: 'hi-IN',
    aiLanguage: 'Hindi',
    speechRate: 0.9,
    speechPitch: 1.0,
  },
  mr: {
    speech: 'mr-IN',
    speechRecognition: 'mr-IN',
    aiLanguage: 'Marathi',
    speechRate: 0.9,
    speechPitch: 1.0,
  },
  ta: {
    speech: 'ta-IN',
    speechRecognition: 'ta-IN',
    aiLanguage: 'Tamil',
    speechRate: 0.88,
    speechPitch: 1.0,
  },
  te: {
    speech: 'te-IN',
    speechRecognition: 'te-IN',
    aiLanguage: 'Telugu',
    speechRate: 0.94,
    speechPitch: 1.02,
  },
  kn: {
    speech: 'kn-IN',
    speechRecognition: 'kn-IN',
    aiLanguage: 'Kannada',
    speechRate: 0.88,
    speechPitch: 1.0,
  },
};

export function getLocaleConfig(code: LanguageCode): LocaleConfig {
  return LOCALE_CONFIG[code] ?? LOCALE_CONFIG.en;
}
