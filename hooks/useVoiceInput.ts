import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { getLocaleConfig } from '@/constants/i18n/localeConfig';
import { getTranslations } from '@/constants/i18n/translations';
import { getUserErrorMessage } from '@/constants/i18n/userErrorMessages';
import type { LanguageCode } from '@/constants/languages';
import {
  getNativeSpeechRecognition,
  isNativeSpeechRecognitionAvailable,
  requestNativeSpeechPermissions,
  type SpeechRecognitionErrorEvent,
  type SpeechRecognitionResultEvent,
} from '@/services/voice/nativeSpeechRecognition';
import { useLanguageStore } from '@/store/languageStore';

interface UseVoiceInputOptions {
  onResult: (transcript: string) => void;
  onPartialResult?: (transcript: string) => void;
  language?: LanguageCode;
  enabled?: boolean;
  /** When true, ignore mic results and stop any active session (during TTS / AI reply). */
  blocked?: boolean;
}

export function useVoiceInput({
  onResult,
  onPartialResult,
  language: languageOverride,
  enabled = true,
  blocked = false,
}: UseVoiceInputOptions) {
  const storeLanguage = useLanguageStore((s) => s.language);
  const language = languageOverride ?? storeLanguage;
  const { speechRecognition } = getLocaleConfig(language);
  const strings = getTranslations(language);
  const speechAvailable = isNativeSpeechRecognitionAvailable();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const onResultRef = useRef(onResult);
  const onPartialResultRef = useRef(onPartialResult);
  const isListeningRef = useRef(false);
  const blockedRef = useRef(blocked);

  onResultRef.current = onResult;
  onPartialResultRef.current = onPartialResult;
  blockedRef.current = blocked;

  useEffect(() => {
    if (!blocked) return;
    const module = getNativeSpeechRecognition();
    if (module && isListeningRef.current) {
      module.abort();
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [blocked]);

  useEffect(() => {
    const module = getNativeSpeechRecognition();
    if (!module) return;

    const subscriptions = [
      module.addListener('start', () => {
        isListeningRef.current = true;
        setIsListening(true);
        setError(null);
      }),
      module.addListener('end', () => {
        isListeningRef.current = false;
        setIsListening(false);
      }),
      module.addListener('result', (event) => {
        if (blockedRef.current) return;

        const payload = event as SpeechRecognitionResultEvent;
        const text = payload.results[0]?.transcript ?? '';
        setTranscript(text);
        onPartialResultRef.current?.(text);

        if (payload.isFinal && text.trim()) {
          onResultRef.current(text.trim());
          setTranscript('');
        }
      }),
      module.addListener('error', (event) => {
        const payload = event as SpeechRecognitionErrorEvent;
        if (payload.error === 'aborted' || payload.error === 'no-speech') {
          isListeningRef.current = false;
          setIsListening(false);
          return;
        }
        setError(payload.message);
        isListeningRef.current = false;
        setIsListening(false);
      }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
      if (isListeningRef.current) {
        module.abort();
      }
    };
  }, []);

  const showDevBuildAlert = useCallback(() => {
    Alert.alert(strings.voiceInputTitle, strings.voiceInputMessage, [
      { text: strings.voiceInputOk, style: 'default' },
    ]);
  }, [strings]);

  const startListening = useCallback(async () => {
    if (!enabled || blockedRef.current) return;

    const module = getNativeSpeechRecognition();
    if (!module) {
      showDevBuildAlert();
      return;
    }

    try {
      const permission = await module.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission denied');
        Alert.alert(strings.voiceInputTitle, getUserErrorMessage('MIC_PERMISSION_DENIED', language));
        return;
      }

      if (isListeningRef.current) {
        module.stop();
        return;
      }

      module.start({
        lang: speechRecognition,
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
        androidIntentOptions: {
          EXTRA_LANGUAGE_MODEL: 'free_form',
        },
      });
    } catch {
      showDevBuildAlert();
    }
  }, [enabled, speechRecognition, showDevBuildAlert, strings.voiceInputTitle, language]);

  const stopListening = useCallback(() => {
    const module = getNativeSpeechRecognition();
    if (!module || !isListeningRef.current) return;
    module.stop();
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListeningRef.current) {
      stopListening();
      return;
    }
    await startListening();
  }, [startListening, stopListening]);

  return {
    isListening,
    transcript,
    error,
    speechAvailable,
    startListening,
    stopListening,
    toggleListening,
  };
}

export async function requestVoicePermissions(): Promise<boolean> {
  return requestNativeSpeechPermissions();
}
