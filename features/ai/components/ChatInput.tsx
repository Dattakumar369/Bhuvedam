import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'react-native';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { colors, radius, spacing } from '@/theme';
import { Caption } from '@/components/ui/Typography';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onVoicePress?: () => void;
  isListening?: boolean;
  disabled?: boolean;
  placeholder?: string;
  listeningPlaceholder?: string;
  editing?: boolean;
  editingLabel?: string;
  onCancelEdit?: () => void;
  cancelEditLabel?: string;
  pendingImageUri?: string | null;
  onAttachImage?: () => void;
  onRemoveImage?: () => void;
  attachImageLabel?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ChatInput({
  value,
  onChangeText,
  onSend,
  onVoicePress,
  isListening = false,
  disabled = false,
  placeholder = 'Ask about farming, crops, weather...',
  listeningPlaceholder = 'Listening...',
  editing = false,
  editingLabel = 'Editing message',
  onCancelEdit,
  cancelEditLabel = 'Cancel',
  pendingImageUri,
  onAttachImage,
  onRemoveImage,
  attachImageLabel = 'Upload photo',
}: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const sendScale = useSharedValue(1);
  const micPulse = useSharedValue(1);
  const hasImage = Boolean(pendingImageUri);
  const canSend = (value.trim().length > 0 || hasImage) && !disabled && !isListening;

  useEffect(() => {
    if (isListening) {
      micPulse.value = withRepeat(
        withSequence(withTiming(1.2, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        true,
      );
    } else {
      micPulse.value = withTiming(1);
    }
  }, [isListening, micPulse]);

  const sendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micPulse.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom:
            keyboardHeight > 0
              ? keyboardHeight + spacing.xs
              : insets.bottom + spacing.sm,
        },
      ]}
    >
      {editing ? (
        <View style={styles.editBanner}>
          <MaterialCommunityIcons name="pencil" size={16} color={colors.primary} />
          <Caption style={styles.editBannerText}>{editingLabel}</Caption>
          {onCancelEdit ? (
            <Pressable onPress={onCancelEdit} hitSlop={8}>
              <Caption style={styles.cancelEdit}>{cancelEditLabel}</Caption>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {hasImage && pendingImageUri ? (
        <View style={styles.imagePreviewWrap}>
          <Image source={{ uri: pendingImageUri }} style={styles.imagePreview} />
          {onRemoveImage ? (
            <Pressable onPress={onRemoveImage} style={styles.removeImageBtn} hitSlop={8}>
              <MaterialCommunityIcons name="close-circle" size={22} color={colors.error} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.inputRow}>
        {onAttachImage ? (
          <Pressable
            onPress={onAttachImage}
            disabled={disabled || isListening || editing}
            style={styles.attachButton}
            accessibilityLabel={attachImageLabel}
          >
            <MaterialCommunityIcons
              name="camera-plus-outline"
              size={22}
              color={disabled || editing ? colors.textTertiary : colors.primary}
            />
          </Pressable>
        ) : null}

        {onVoicePress ? (
          <AnimatedPressable
            onPress={onVoicePress}
            disabled={disabled && !isListening}
            style={[styles.micButton, isListening && styles.micActive, micStyle]}
            accessibilityLabel={isListening ? 'Stop listening' : 'Start voice input'}
          >
            <MaterialCommunityIcons
              name={isListening ? 'microphone' : 'microphone-outline'}
              size={22}
              color={isListening ? colors.white : colors.primary}
            />
          </AnimatedPressable>
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={isListening ? listeningPlaceholder : placeholder}
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          multiline
          maxLength={2000}
          editable={!disabled && !isListening}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={() => {
            if (canSend) onSend();
          }}
        />

        <Animated.View style={sendStyle}>
          <Pressable
            onPress={() => {
              if (canSend) {
                Keyboard.dismiss();
                onSend();
              }
            }}
            onPressIn={() => {
              sendScale.value = withSpring(0.9);
            }}
            onPressOut={() => {
              sendScale.value = withSpring(1);
            }}
            disabled={!canSend}
            style={[styles.sendButton, canSend && styles.sendActive]}
            accessibilityLabel="Send message"
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={canSend ? colors.white : colors.textTertiary}
            />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}10`,
  },
  editBannerText: { flex: 1, color: colors.primary, fontFamily: 'Poppins_600SemiBold' },
  cancelEdit: { color: colors.error, fontFamily: 'Poppins_600SemiBold' },
  imagePreviewWrap: {
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  imagePreview: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceVariant,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.surface,
    borderRadius: 11,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}12`,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}12`,
  },
  micActive: {
    backgroundColor: colors.error,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    maxHeight: 120,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
  },
  sendActive: { backgroundColor: colors.primary },
});
