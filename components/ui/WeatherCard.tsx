import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Card } from '@/components/ui/Card';
import { Caption, Display, Subtitle, Title } from '@/components/ui/Typography';
import { WEATHER_CONDITIONS } from '@/constants/weather';
import type { WeatherData } from '@/types/weather';
import { formatPercentage, formatTemperature, formatWindSpeed } from '@/utils/format';
import { colors, radius, spacing } from '@/theme';

interface WeatherCardProps {
  data: WeatherData;
  compact?: boolean;
}

export function WeatherCard({ data, compact = false }: WeatherCardProps) {
  const condition = WEATHER_CONDITIONS[data.current.condition];
  const iconName = condition?.icon ?? 'weather-partly-cloudy';

  if (compact) {
    return (
      <Card variant="elevated" animate delay={100}>
        <LinearGradient
          colors={[...colors.gradient.nature]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactGradient}
        >
          <View style={styles.compactHeader}>
            <View>
              <Caption style={styles.onGradientMuted}>Today&apos;s Weather</Caption>
              <Title style={styles.onGradient}>{data.location}</Title>
            </View>
            <MaterialCommunityIcons name={iconName as never} size={48} color={colors.white} />
          </View>
          <Display style={styles.compactTemp}>{formatTemperature(data.current.temperature)}</Display>
          <Subtitle style={styles.onGradient}>{condition?.label}</Subtitle>
          <View style={styles.statsRow}>
            <StatItem icon="water-percent" label="Humidity" value={formatPercentage(data.current.humidity)} />
            <StatItem icon="weather-windy" label="Wind" value={formatWindSpeed(data.current.windSpeed)} />
            <StatItem icon="weather-rainy" label="Rain" value={formatPercentage(data.current.precipitation)} />
          </View>
        </LinearGradient>
      </Card>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(600)}>
      <LinearGradient colors={[...colors.gradient.header]} style={styles.fullHeader}>
        <Caption style={styles.onGradientMuted}>{data.location}</Caption>
        <MaterialCommunityIcons name={iconName as never} size={80} color={colors.white} style={styles.mainIcon} />
        <Display style={[styles.onGradient, styles.mainTemp]}>
          {formatTemperature(data.current.temperature)}
        </Display>
        <Subtitle style={styles.onGradient}>{condition?.label}</Subtitle>
        <Caption style={styles.feelsLike}>Feels like {formatTemperature(data.current.feelsLike)}</Caption>
      </LinearGradient>
    </Animated.View>
  );
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <MaterialCommunityIcons name={icon as never} size={18} color="rgba(255,255,255,0.9)" />
      <Caption style={styles.statLabel}>{label}</Caption>
      <Subtitle style={styles.onGradient}>{value}</Subtitle>
    </View>
  );
}

const styles = StyleSheet.create({
  compactGradient: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  compactTemp: {
    color: colors.white,
    fontSize: 48,
    lineHeight: 56,
    marginTop: spacing.sm,
  },
  onGradient: { color: colors.white },
  onGradientMuted: { color: 'rgba(255,255,255,0.75)' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: { alignItems: 'center', flex: 1, gap: 2 },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
  fullHeader: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  mainIcon: { marginVertical: spacing.md },
  mainTemp: { fontSize: 72, lineHeight: 80 },
  feelsLike: { color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs },
});
