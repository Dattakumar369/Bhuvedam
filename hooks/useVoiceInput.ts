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
  /** @deprecated Live transcript is exposed via `transcript` — do not mirror into TextInput (maxLength truncates). */
  onPartialResult?: (transcript: string) => void;
  language?: LanguageCode;
  enabled?: boolean;
  /** When true, ignore mic results and stop any active session (during TTS / AI reply). */
  blocked?: boolean;
}

/** Long pauses while thinking — Android default ~5s ends the session too early. */
const ANDROID_SILENCE_MS = 60_000;

function joinSegments(committed: string, segment: string): string {
  const next = segment.trim();
  if (!next) return committed;
  if (!committed) return next;
  if (committed.endsWith(next)) return committed;
  if (next.startsWith(committed)) return next;
  return `${committed} ${next}`;
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
  const discardSessionRef = useRef(false);
  /** Committed text from prior Android segments / finals. */
  const transcriptTallyRef = useRef('');
  /** Current segment partial hypothesis (replaced each interim event). */
  const sessionInterimRef = useRef('');
  const speechLangRef = useRef(speechRecognition);

  onResultRef.current = onResult;
  onPartialResultRef.current = onPartialResult;
  blockedRef.current = blocked;
  speechLangRef.current = speechRecognition;

  const updateLiveTranscript = useCallback(() => {
    const live = joinSegments(transcriptTallyRef.current, sessionInterimRef.current);
    setTranscript(live);
    onPartialResultRef.current?.(live);
  }, []);

  /** Save in-progress words before Android restarts a segmented session. */
  const commitInterimToTally = useCallback(() => {
    const interim = sessionInterimRef.current.trim();
    if (!interim) return;
    transcriptTallyRef.current = joinSegments(transcriptTallyRef.current, interim);
    sessionInterimRef.current = '';
    updateLiveTranscript();
  }, [updateLiveTranscript]);

  const resetSessionTranscript = useCallback(() => {
    transcriptTallyRef.current = '';
    sessionInterimRef.current = '';
    setTranscript('');
  }, []);

  const finalizeListening = useCallback(() => {
    commitInterimToTally();
    const text = transcriptTallyRef.current.trim();
    resetSessionTranscript();
    if (text && !blockedRef.current) {
      onResultRef.current(text);
    }
  }, [commitInterimToTally, resetSessionTranscript]);

  const getStartOptions = useCallback(
    () => ({
      lang: speechLangRef.current,
      interimResults: true,
      continuous: true,
      maxAlternatives: 1,
      iosTaskHint: 'dictation' as const,
      androidIntentOptions: {
        EXTRA_LANGUAGE_MODEL: 'free_form',
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: ANDROID_SILENCE_MS,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: ANDROID_SILENCE_MS,
        EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: ANDROID_SILENCE_MS,
      },
    }),
    [],
  );

  const restartRecognition = useCallback(
    (module: NonNullable<ReturnType<typeof getNativeSpeechRecognition>>) => {
      commitInterimToTally();
      try {
        module.start(getStartOptions());
      } catch {
        isListeningRef.current = false;
        setIsListening(false);
      }
    },
    [commitInterimToTally, getStartOptions],
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
          if (discardSessionRef.current) {
            discardSessionRef.current = false;
            resetSessionTranscript();
            return;
          }
          finalizeListening();
          return;
        }

        // Platform ended early (silence) — keep listening until farmer taps Done.
        if (isListeningRef.current && !blockedRef.current) {
          restartRecognition(module);
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
            transcriptTallyRef.current = joinSegments(transcriptTallyRef.current, segment);
          }
          sessionInterimRef.current = '';
        } else {
          sessionInterimRef.current = segment;
        }

        updateLiveTranscript();
      }),
      module.addListener('error', (event) => {
        const payload = event as SpeechRecognitionErrorEvent;
        if (payload.error === 'aborted') {
          isListeningRef.current = false;
          setIsListening(false);
          if (discardSessionRef.current) {
            discardSessionRef.current = false;
            resetSessionTranscript();
          }
          return;
        }

        if (payload.error === 'no-speech' || payload.error === 'speech-timeout') {
          if (isListeningRef.current && !userStopRequestedRef.current && !blockedRef.current) {
            restartRecognition(module);
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
  }, [finalizeListening, getStartOptions, restartRecognition, resetSessionTranscript, updateLiveTranscript]);

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

  const confirmListening = useCallback(() => {
    const module = getNativeSpeechRecognition();
    if (!module || !isListeningRef.current) return;
    discardSessionRef.current = false;
    userStopRequestedRef.current = true;
    module.stop();
  }, []);

  const cancelListening = useCallback(() => {
    const module = getNativeSpeechRecognition();
    if (!module) return;
    discardSessionRef.current = true;
    userStopRequestedRef.current = false;
    if (isListeningRef.current) {
      module.abort();
    }
    isListeningRef.current = false;
    setIsListening(false);
    resetSessionTranscript();
  }, [resetSessionTranscript]);

  const toggleListening = useCallback(async () => {
    if (isListeningRef.current) {
      confirmListening();
      return;
    }
    await startListening();
  }, [startListening, confirmListening]);

  return {
    isListening,
    transcript,
    error,
    speechAvailable,
    startListening,
    confirmListening,
    cancelListening,
    /** @deprecated Use confirmListening */
    stopListening: confirmListening,
    toggleListening,
  };
}

export async function requestVoicePermissions(): Promise<boolean> {
  return requestNativeSpeechPermissions();
}
