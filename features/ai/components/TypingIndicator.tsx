import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Caption } from '@/components/ui/Typography';
import { useTranslation } from '@/hooks/useTranslation';
import { colors } from '@/theme';

export function TypingIndicator() {
  const { t } = useTranslation();

  return (
    <View style={styles.container} accessibilityLabel={t.typingIndicator}>
      <View style={styles.bubble}>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, { opacity: 0.4 + i * 0.2 }]} />
          ))}
        </View>
      </View>
      <Caption style={styles.label}>{t.typingIndicator}</Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16, alignItems: 'flex-start' },
  bubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  label: { marginTop: 4, color: colors.textTertiary },
});
