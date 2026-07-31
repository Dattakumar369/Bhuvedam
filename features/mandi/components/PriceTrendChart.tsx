import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Caption, Title } from '@/components/ui/Typography';
import type { MandiAnalytics } from '@/types/mandi';
import { formatCurrency } from '@/utils/format';
import { colors, radius, spacing } from '@/theme';

interface PriceTrendChartProps {
  analytics: MandiAnalytics;
}

export function PriceTrendChart({ analytics }: PriceTrendChartProps) {
  const series = analytics.dailySeries.slice(-14);
  const max = Math.max(...series.map((p) => p.modalPrice));
  const min = Math.min(...series.map((p) => p.modalPrice));
  const range = max - min || 1;

  return (
    <Card variant="outlined" style={styles.card}>
      <Title style={styles.title}>14-day price trend</Title>
      <View style={styles.chartRow}>
        {series.map((point) => {
          const height = 24 + ((point.modalPrice - min) / range) * 72;
          const isToday = point.date === series[series.length - 1]?.date;
          return (
            <View key={point.date} style={styles.barCol}>
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: isToday ? colors.primary : `${colors.primary}55`,
                  },
                ]}
              />
              <Caption style={styles.barLabel}>
                {new Date(point.date).getDate()}
              </Caption>
            </View>
          );
        })}
      </View>
      <View style={styles.statsRow}>
        <Stat label="7-day avg" value={formatCurrency(analytics.avg7d)} />
        <Stat label="30-day avg" value={formatCurrency(analytics.avg30d)} />
        <Stat label="30-day low" value={formatCurrency(analytics.low30d)} />
        <Stat label="30-day high" value={formatCurrency(analytics.high30d)} />
      </View>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Caption>{label}</Caption>
      <Body style={styles.statValue}>{value}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  title: { marginBottom: spacing.xs },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110,
    paddingHorizontal: spacing.xs,
  },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 10, borderRadius: radius.sm, minHeight: 8 },
  barLabel: { marginTop: 4, fontSize: 10 },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  stat: { width: '46%' },
  statValue: { fontFamily: 'Poppins_600SemiBold' },
});
