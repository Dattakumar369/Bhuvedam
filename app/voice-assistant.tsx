import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/ui';
import { Body, Caption, Title } from '@/components/ui/Typography';
import { useVoiceCompanion } from '@/hooks/useVoiceCompanion';
import { useAIStore } from '@/store/aiStore';
import { colors, layout, radius, spacing } from '@/theme';

export default function VoiceAssistantScreen() {
  const insets = useSafeAreaInsets();
  const createConversation = useAIStore((s) => s.createConversation);
  const [conversationId, setConversationId] = useState<string | undefined>();

  useEffect(() => {
    setConversationId(createConversation());
  }, [createConversation]);

  const {
    isListening,
    isSpeaking,
    isTyping,
    transcript,
    statusLine,
    startListening,
    confirmListening,
    cancelListening,
    stopSpeakingNow,
    language,
  } = useVoiceCompanion(conversationId);

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isListening || isSpeaking || isTyping) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.12, { duration: 700 }), withTiming(1, { duration: 700 })),
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

  const orbColor = isListening
    ? colors.error
    : isSpeaking
      ? colors.accent
      : isTyping
        ? colors.info
        : colors.primary;

  const hint =
    language === 'te'
      ? 'Mic nokki matladandi — "rendu ekarala mirapa undi", "mandi rates chuppu", "eeroju mandu kottali" laga cheppochu.'
      : 'Tap mic and speak — add crops, open mandi, ask farm advice.';

  const status =
    statusLine ||
    (isListening
      ? language === 'te'
        ? 'Vinutunnanu… Done nokkandi pampadaniki'
        : 'Listening… tap Done to send'
      : isTyping
        ? language === 'te'
          ? 'Alochistunnanu…'
          : 'Thinking…'
        : isSpeaking
          ? language === 'te'
            ? 'Matladutunnanu…'
            : 'Speaking…'
          : language === 'te'
            ? 'Matladadaniki mic nokkandi'
            : 'Tap mic to speak');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title={language === 'te' ? 'Matladandi' : 'Talk to Bhuvedam'} showBack onBack={() => router.back()} />

      <View style={[styles.body, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Title style={styles.title}>
          {language === 'te' ? '🎤 Bhuvedam tho matladandi' : '🎤 Talk to Bhuvedam'}
        </Title>
        <Body style={styles.subtitle}>{hint}</Body>

        <View style={styles.center}>
          <Animated.View style={[styles.orb, { backgroundColor: orbColor }, orbStyle]}>
            <MaterialCommunityIcons
              name={isListening ? 'microphone' : isSpeaking ? 'account-voice' : 'robot-happy'}
              size={56}
              color={colors.white}
            />
          </Animated.View>
          <Caption style={styles.status}>{status}</Caption>
          {transcript && isListening ? (
            <Caption style={styles.transcript} numberOfLines={4}>
              "{transcript}"
            </Caption>
          ) : null}
        </View>

        <View style={styles.actions}>
          {isSpeaking ? (
            <Pressable style={styles.actionBtn} onPress={stopSpeakingNow}>
              <MaterialCommunityIcons name="stop-circle" size={32} color={colors.error} />
              <Caption style={styles.actionLabel}>{language === 'te' ? 'Stop' : 'Stop'}</Caption>
            </Pressable>
          ) : isListening ? (
            <>
              <Pressable style={styles.actionBtn} onPress={cancelListening}>
                <MaterialCommunityIcons name="close-circle" size={32} color={colors.error} />
                <Caption style={styles.actionLabel}>{language === 'te' ? 'Cancel' : 'Cancel'}</Caption>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={confirmListening}>
                <MaterialCommunityIcons name="check-circle" size={40} color={colors.primary} />
                <Caption style={styles.actionLabel}>{language === 'te' ? 'Done' : 'Done'}</Caption>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[styles.micMainBtn, isTyping && styles.micBtnDisabled]}
              disabled={isTyping}
              onPress={() => void startListening()}
            >
              <MaterialCommunityIcons name="microphone" size={36} color={colors.white} />
              <Caption style={styles.micMainLabel}>
                {language === 'te' ? 'Matladandi' : 'Speak'}
              </Caption>
            </Pressable>
          )}
        </View>

        <Caption style={styles.footer}>
          {language === 'te'
            ? 'Typing avasaram ledu — matladite chalu. Crop add, mandi, weather, polam — anni cheppochu.'
            : 'No typing needed — just speak. Crops, mandi, weather, field measure by voice.'}
        </Caption>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    gap: spacing.lg,
  },
  title: { textAlign: 'center', color: colors.primary, fontSize: 22 },
  subtitle: { textAlign: 'center', color: colors.textSecondary, lineHeight: 22 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  orb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  status: {
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    fontSize: 14,
    paddingHorizontal: spacing.md,
  },
  transcript: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingHorizontal: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    minHeight: 72,
  },
  actionBtn: { alignItems: 'center', gap: spacing.xxs },
  actionLabel: { fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary },
  micMainBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.xs,
    minWidth: 160,
  },
  micMainLabel: { color: colors.white, fontFamily: 'Poppins_600SemiBold' },
  micBtnDisabled: { opacity: 0.4 },
  footer: { textAlign: 'center', color: colors.textTertiary, lineHeight: 18 },
});
