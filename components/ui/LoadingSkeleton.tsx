import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { useShimmer } from '@/hooks/useShimmer';
import { colors, radius, spacing } from '@/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = radius.sm, style }: SkeletonProps) {
  const animatedStyle = useShimmer();

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function WeatherSkeleton() {
  return (
    <View style={styles.weatherContainer}>
      <Skeleton height={180} borderRadius={radius.lg} />
      <View style={styles.row}>
        <Skeleton width="30%" height={60} borderRadius={radius.md} />
        <Skeleton width="30%" height={60} borderRadius={radius.md} />
        <Skeleton width="30%" height={60} borderRadius={radius.md} />
      </View>
    </View>
  );
}

export function ChatSkeleton() {
  return (
    <View style={styles.chatContainer}>
      <Skeleton width="70%" height={48} borderRadius={radius.lg} />
      <Skeleton width="85%" height={72} borderRadius={radius.lg} style={styles.chatBubble} />
      <Skeleton width="60%" height={48} borderRadius={radius.lg} />
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.listItem}>
          <Skeleton width={48} height={48} borderRadius={radius.full} />
          <View style={styles.listContent}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={12} style={{ marginTop: spacing.xs }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: colors.border },
  weatherContainer: { gap: spacing.md, padding: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  chatContainer: { padding: spacing.md, gap: spacing.md },
  chatBubble: { alignSelf: 'flex-start' },
  listContainer: { gap: spacing.md, padding: spacing.md },
  listItem: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  listContent: { flex: 1 },
});
