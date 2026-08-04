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

function mergeTranscript(finalParts: string, interim: string): string {
  return [finalParts, interim].filter(Boolean).join(' ').trim();
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
  const userStopRequestedRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const speechLangRef = useRef(speechRecognition);

  onResultRef.current = onResult;
  onPartialResultRef.current = onPartialResult;
  blockedRef.current = blocked;
  speechLangRef.current = speechRecognition;

  const updateLiveTranscript = useCallback(() => {
    const live = mergeTranscript(finalTranscriptRef.current, interimTranscriptRef.current);
    setTranscript(live);
    onPartialResultRef.current?.(live);
  }, []);

  const resetSessionTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    setTranscript('');
  }, []);

  const finalizeListening = useCallback(() => {
    const text = mergeTranscript(finalTranscriptRef.current, interimTranscriptRef.current);
    resetSessionTranscript();
    if (text && !blockedRef.current) {
      onResultRef.current(text);
    }
  }, [resetSessionTranscript]);

  const getStartOptions = useCallback(
    () => ({
      lang: speechLangRef.current,
      interimResults: true,
      continuous: true,
      maxAlternatives: 1,
      androidIntentOptions: {
        EXTRA_LANGUAGE_MODEL: 'free_form',
      },
    }),
    [],
  );

  useEffect(() => {
    if (!blocked) return;
    const module = getNativeSpeechRecognition();
    if (module && isListeningRef.current) {
      userStopRequestedRef.current = false;
      module.abort();
      isListeningRef.current = false;
      setIsListening(false);
      resetSessionTranscript();
    }
  }, [blocked, resetSessionTranscript]);

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
        const userStopped = userStopRequestedRef.current;
        userStopRequestedRef.current = false;

        if (userStopped) {
          isListeningRef.current = false;
          setIsListening(false);
          finalizeListening();
          return;
        }

        // Platform ended early (silence timeout) — keep mic open until farmer taps Stop.
        if (isListeningRef.current && !blockedRef.current) {
          try {
            module.start(getStartOptions());
          } catch {
            isListeningRef.current = false;
            setIsListening(false);
          }
          return;
        }

        isListeningRef.current = false;
        setIsListening(false);
      }),
      module.addListener('result', (event) => {
        if (blockedRef.current) return;

        const payload = event as SpeechRecognitionResultEvent;
        const segment = payload.results[0]?.transcript ?? '';

        if (payload.isFinal) {
          if (segment.trim()) {
            finalTranscriptRef.current = finalTranscriptRef.current
              ? `${finalTranscriptRef.current} ${segment.trim()}`
              : segment.trim();
          }
          interimTranscriptRef.current = '';
        } else {
          interimTranscriptRef.current = segment;
        }

        updateLiveTranscript();
      }),
      module.addListener('error', (event) => {
        const payload = event as SpeechRecognitionErrorEvent;
        if (payload.error === 'aborted') {
          isListeningRef.current = false;
          setIsListening(false);
          return;
        }

        // Silence / no-speech — do not end session; farmer may still be thinking.
        if (payload.error === 'no-speech' || payload.error === 'speech-timeout') {
          if (isListeningRef.current && !userStopRequestedRef.current && !blockedRef.current) {
            try {
              module.start(getStartOptions());
            } catch {
              /* ignore */
            }
          }
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
        userStopRequestedRef.current = false;
        module.abort();
      }
    };
  }, [finalizeListening, getStartOptions, updateLiveTranscript]);

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

      if (isListeningRef.current) return;

      resetSessionTranscript();
      userStopRequestedRef.current = false;
      module.start(getStartOptions());
    } catch {
      showDevBuildAlert();
    }
  }, [
    enabled,
    getStartOptions,
    language,
    resetSessionTranscript,
    showDevBuildAlert,
    strings.voiceInputTitle,
  ]);

  const stopListening = useCallback(() => {
    const module = getNativeSpeechRecognition();
    if (!module || !isListeningRef.current) return;
    userStopRequestedRef.current = true;
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
