import { useCallback, useEffect, useRef, useState } from 'react';

import { buildFarmBriefing, briefingToSpeech } from '@/services/voice/farmBriefingService';
import { executeVoiceActions } from '@/services/voice/voiceActionExecutor';
import { parseVoiceActions } from '@/services/voice/voiceActionRouter';
import { speak, stopSpeaking } from '@/services/ai/speechService';
import { useChat } from '@/hooks/useChat';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useAIStore } from '@/store/aiStore';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useLanguageStore } from '@/store/languageStore';
import { useUserStore } from '@/store/userStore';

export function useVoiceCompanion(conversationId: string | undefined) {
  const language = useLanguageStore((s) => s.language);
  const user = useUserStore((s) => s.user);
  const farmerCtx = useFarmerContextStore();
  const setVoiceModeEnabled = useAIStore((s) => s.setVoiceModeEnabled);
  const { send, isTyping, create, init } = useChat(conversationId);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [briefingDone, setBriefingDone] = useState(false);
  const [statusLine, setStatusLine] = useState('');
  const briefingStartedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startListeningRef = useRef<() => Promise<void>>(async () => {});

  const speakAlways = useCallback(
    (text: string, onDone?: () => void) => {
      if (!text.trim()) {
        onDone?.();
        return;
      }
      setIsSpeaking(true);
      setStatusLine(language === 'te' ? 'Matladutunnanu…' : 'Speaking…');
      speak(text, language, () => {
        setIsSpeaking(false);
        onDone?.();
      });
    },
    [language],
  );

  const stopSpeakingNow = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const resumeListening = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      resumeTimerRef.current = null;
      setStatusLine(language === 'te' ? 'Vinutunnanu — matladandi' : 'Listening…');
      void startListeningRef.current();
    }, 900);
  }, [language]);

  const handleAiComplete = useCallback(
    (response: string) => {
      stopSpeakingNow();
      speakAlways(response, () => resumeListening());
    },
    [speakAlways, stopSpeakingNow, resumeListening],
  );

  const handleVoiceResult = useCallback(
    async (transcript: string) => {
      const text = transcript.trim();
      if (!text || isTyping || isSpeaking) return;

      stopSpeakingNow();
      setStatusLine(language === 'te' ? 'Alochistunnanu…' : 'Thinking…');

      const actions = parseVoiceActions(text);
      const confirms = actions.length ? await executeVoiceActions(actions) : [];

      await farmerCtx.learnFromUserMessage(text);

      if (!conversationId) return;

      const runAi = () => {
        void send(text, handleAiComplete, undefined, {
          defaultImagePrompt: text,
        });
      };

      if (confirms.length) {
        speakAlways(confirms.join(' '), runAi);
      } else {
        runAi();
      }
    },
    [
      conversationId,
      farmerCtx,
      handleAiComplete,
      isSpeaking,
      isTyping,
      language,
      send,
      speakAlways,
      stopSpeakingNow,
    ],
  );

  const { isListening, transcript, startListening, confirmListening, cancelListening } =
    useVoiceInput({
      onResult: (t) => void handleVoiceResult(t),
      blocked: isSpeaking || isTyping,
    });

  startListeningRef.current = startListening;

  const playBriefing = useCallback(() => {
    if (briefingStartedRef.current) return;
    briefingStartedRef.current = true;

    const lines = buildFarmBriefing({
      farmerName: user?.name,
      language,
      cropPlantings: farmerCtx.cropPlantings,
      crops: farmerCtx.crops,
      learnedFacts: farmerCtx.learnedFacts ?? [],
      notes: farmerCtx.notes,
    });

    const speech = briefingToSpeech(lines);
    speakAlways(speech, () => {
      setBriefingDone(true);
      resumeListening();
    });
  }, [farmerCtx, language, resumeListening, speakAlways, user?.name]);

  useEffect(() => {
    setVoiceModeEnabled(true);
    init();
    return () => {
      setVoiceModeEnabled(false);
      stopSpeakingNow();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [init, setVoiceModeEnabled, stopSpeakingNow]);

  useEffect(() => {
    if (conversationId) {
      const t = setTimeout(() => playBriefing(), 600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [conversationId, playBriefing]);

  return {
    isListening,
    isSpeaking,
    isTyping,
    transcript,
    briefingDone,
    statusLine,
    startListening,
    confirmListening,
    cancelListening,
    stopSpeakingNow,
    createConversation: create,
    language,
  };
}
