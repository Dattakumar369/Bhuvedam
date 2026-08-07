import { requireOptionalNativeModule } from 'expo-modules-core';
import type { EventSubscription } from 'expo-modules-core';

export type SpeechRecognitionResultEvent = {
  isFinal: boolean;
  results: { transcript: string; confidence: number }[];
};

export type SpeechRecognitionErrorEvent = {
  error: string;
  message: string;
};

export interface NativeSpeechRecognitionModule {
  start: (options: {
    lang: string;
    interimResults?: boolean;
    continuous?: boolean;
    maxAlternatives?: number;
    iosTaskHint?: 'unspecified' | 'dictation' | 'search' | 'confirmation';
    androidIntentOptions?: Record<string, string | number | boolean>;
    androidRecognitionServicePackage?: string;
  }) => void;
  stop: () => void;
  abort: () => void;
  requestPermissionsAsync: () => Promise<{ granted: boolean; status?: string }>;
  addListener: (
    eventName: 'start' | 'end' | 'result' | 'error',
    listener: (event: unknown) => void,
  ) => EventSubscription;
}

let cachedModule: NativeSpeechRecognitionModule | null | undefined;

/** Safe loader — never throws in Expo Go (no native module bundled). */
export function getNativeSpeechRecognition(): NativeSpeechRecognitionModule | null {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  try {
    cachedModule =
      requireOptionalNativeModule<NativeSpeechRecognitionModule>('ExpoSpeechRecognition');
  } catch {
    cachedModule = null;
  }

  return cachedModule;
}

export function isNativeSpeechRecognitionAvailable(): boolean {
  return getNativeSpeechRecognition() !== null;
}

export async function requestNativeSpeechPermissions(): Promise<boolean> {
  const module = getNativeSpeechRecognition();
  if (!module) return false;

  try {
    const result = await module.requestPermissionsAsync();
    return result.granted;
  } catch {
    return false;
  }
}
