import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Headline, Subtitle } from '@/components/ui/Typography';
import { useAppColors } from '@/hooks/useAppColors';
import { spacing } from '@/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export function Header({
  title,
  subtitle,
  showBack,
  onBack,
  rightAction,
  transparent = false,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const c = useAppColors();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.sm, backgroundColor: transparent ? 'transparent' : c.background },
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={onBack} style={styles.backButton} accessibilityLabel="Go back">
            <MaterialCommunityIcons name="arrow-left" size={24} color={c.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
        <View style={styles.titleContainer}>
          <Headline numberOfLines={1}>{title}</Headline>
          {subtitle ? <Subtitle numberOfLines={1}>{subtitle}</Subtitle> : null}
        </View>
        {rightAction ?? <View style={styles.spacer} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  spacer: { width: 44 },
  titleContainer: { flex: 1, alignItems: 'center' },
});
