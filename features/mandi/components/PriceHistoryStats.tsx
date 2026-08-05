import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Caption } from '@/components/ui/Typography';
import { useTranslation } from '@/hooks/useTranslation';
import type { MandiAnalytics } from '@/types/mandi';
import { formatCurrency } from '@/utils/format';
import { colors, spacing } from '@/theme';

interface PriceHistoryStatsProps {
  analytics: MandiAnalytics;
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Caption style={styles.label}>{label}</Caption>
      <Body style={styles.value}>{value}</Body>
    </View>
  );
}

export function PriceHistoryStats({ analytics }: PriceHistoryStatsProps) {
  const { screens } = useTranslation();
  const missing = screens.mandiHistoryMissing;

  return (
    <Card variant="outlined" style={styles.card}>
      <Caption style={styles.title}>{screens.mandiHistoryTitle}</Caption>
      <View style={styles.grid}>
        <StatCell
          label={screens.mandiHistoryToday}
          value={formatCurrency(analytics.priceToday ?? analytics.currentModal)}
        />
        <StatCell
          label={screens.mandiHistoryYesterday}
          value={
            analytics.priceYesterday != null ? formatCurrency(analytics.priceYesterday) : missing
          }
        />
        <StatCell
          label={screens.mandiHistoryLastMonth}
          value={
            analytics.priceLastMonth != null ? formatCurrency(analytics.priceLastMonth) : missing
          }
        />
        <StatCell
          label={screens.mandiHistoryLastYear}
          value={analytics.priceLastYear != null ? formatCurrency(analytics.priceLastYear) : missing}
        />
      </View>
      <Caption style={styles.note}>{screens.mandiHistoryNote}</Caption>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  title: { fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: '47%',
    backgroundColor: `${colors.primary}08`,
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.xxs,
  },
  label: { color: colors.textTertiary },
  value: { fontFamily: 'Poppins_600SemiBold', color: colors.primary },
  note: { color: colors.textTertiary, lineHeight: 18 },
});
