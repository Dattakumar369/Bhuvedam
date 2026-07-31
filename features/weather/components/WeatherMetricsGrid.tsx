import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Caption, Subtitle } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

interface WeatherMetricProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}

export function WeatherMetric({ icon, label, value }: WeatherMetricProps) {
  return (
    <Card variant="outlined" padding={spacing.md} style={styles.metric}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
      <Caption style={styles.label}>{label}</Caption>
      <Subtitle style={styles.value}>{value}</Subtitle>
    </Card>
  );
}

interface WeatherMetricsGridProps {
  metrics: WeatherMetricProps[];
}

export function WeatherMetricsGrid({ metrics }: WeatherMetricsGridProps) {
  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <WeatherMetric key={metric.label} {...metric} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    width: '48%',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  label: { color: colors.textTertiary, marginTop: spacing.xs },
  value: { fontFamily: 'Poppins_600SemiBold' },
});
