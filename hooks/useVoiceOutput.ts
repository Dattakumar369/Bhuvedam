import { useCallback, useEffect, useState } from 'react';

import { speak, stopSpeaking, warmUpSpeechVoice } from '@/services/ai/speechService';
import { useAIStore } from '@/store/aiStore';
import { useLanguageStore } from '@/store/languageStore';

export function useVoiceOutput() {
  const voiceModeEnabled = useAIStore((s) => s.voiceModeEnabled);
  const language = useLanguageStore((s) => s.language);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    void warmUpSpeechVoice(language);
  }, [language]);

  const speakText = useCallback(
    (text: string, onDone?: () => void) => {
      if (!voiceModeEnabled || !text.trim()) {
        onDone?.();
        return;
      }

      setIsSpeaking(true);
      speak(text, language, () => {
        setIsSpeaking(false);
        onDone?.();
      });
    },
    [voiceModeEnabled, language],
  );

  const stopSpeakingNow = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    voiceModeEnabled,
    speakText,
    stopSpeakingNow,
  };
}
