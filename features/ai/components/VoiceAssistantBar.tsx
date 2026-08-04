import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { Caption } from '@/components/ui/Typography';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, radius, spacing } from '@/theme';

interface VoiceAssistantBarProps {
  isListening: boolean;
  isSpeaking: boolean;
  isTyping: boolean;
  voiceModeEnabled: boolean;
  transcript?: string;
  onToggleVoiceMode: () => void;
  onStopSpeaking: () => void;
  onConfirmListening?: () => void;
  onCancelListening?: () => void;
  /** @deprecated Use onConfirmListening */
  onStopListening?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function VoiceAssistantBar({
  isListening,
  isSpeaking,
  isTyping,
  voiceModeEnabled,
  transcript,
  onToggleVoiceMode,
  onStopSpeaking,
  onConfirmListening,
  onCancelListening,
  onStopListening,
  confirmLabel = 'Done',
  cancelLabel = 'Cancel',
}: VoiceAssistantBarProps) {
  const { t } = useTranslation();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isListening || isSpeaking || isTyping) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.15, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        true,
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [isListening, isSpeaking, isTyping, pulse]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const statusText = isListening
    ? t.voiceBarStopHint
    : isTyping
      ? t.voiceBarThinking
      : isSpeaking
        ? t.voiceBarSpeaking
        : voiceModeEnabled
          ? t.voiceModeOn
          : t.voiceModeOff;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={onToggleVoiceMode}
          style={[styles.modeToggle, voiceModeEnabled && styles.modeToggleActive]}
          accessibilityLabel="Toggle voice mode"
        >
          <MaterialCommunityIcons
            name={voiceModeEnabled ? 'volume-high' : 'volume-off'}
            size={18}
            color={voiceModeEnabled ? colors.primary : colors.textTertiary}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.orb,
            isListening && styles.orbListening,
            isSpeaking && styles.orbSpeaking,
            isTyping && styles.orbThinking,
            orbStyle,
          ]}
        >
          <MaterialCommunityIcons
            name={isListening ? 'microphone' : isSpeaking ? 'account-voice' : 'robot'}
            size={22}
            color={colors.white}
          />
        </Animated.View>

        <View style={styles.statusCol}>
          <Caption style={styles.status}>{statusText}</Caption>
          {transcript && isListening ? (
            <Caption style={styles.transcript} numberOfLines={2}>
              "{transcript}"
            </Caption>
          ) : null}
        </View>

        {isSpeaking ? (
          <Pressable onPress={onStopSpeaking} style={styles.stopBtn} accessibilityLabel="Stop speaking">
            <MaterialCommunityIcons name="stop-circle" size={28} color={colors.error} />
          </Pressable>
        ) : isListening ? (
          <View style={styles.listenActions}>
            {onCancelListening ? (
              <Pressable
                onPress={onCancelListening}
                style={styles.cancelBtn}
                accessibilityLabel={cancelLabel}
              >
                <Caption style={styles.cancelBtnText}>{cancelLabel}</Caption>
              </Pressable>
            ) : null}
            {(onConfirmListening ?? onStopListening) ? (
              <Pressable
                onPress={onConfirmListening ?? onStopListening}
                style={styles.stopBtn}
                accessibilityLabel={confirmLabel}
              >
                <MaterialCommunityIcons name="check-circle" size={28} color={colors.primary} />
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.stopBtn} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
  },
  modeToggleActive: {
    backgroundColor: `${colors.primary}18`,
  },
  orb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbListening: { backgroundColor: colors.error },
  orbSpeaking: { backgroundColor: colors.accent },
  orbThinking: { backgroundColor: colors.info },
  statusCol: { flex: 1 },
  status: { fontFamily: 'Poppins_500Medium', color: colors.textSecondary, fontSize: 11 },
  transcript: { color: colors.textPrimary, fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  stopBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  listenActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cancelBtn: { paddingHorizontal: spacing.xs, paddingVertical: 4 },
  cancelBtnText: { color: colors.error, fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
});
