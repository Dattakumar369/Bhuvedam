import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Caption, Title } from '@/components/ui/Typography';
import type { MandiAnalytics } from '@/types/mandi';
import { formatCurrency, formatPercentChange } from '@/utils/format';
import { colors, radius, spacing } from '@/theme';

interface MandiRateCardProps {
  analytics: MandiAnalytics;
  cropName: string;
  cropColor: string;
  compact?: boolean;
}

export function MandiRateCard({ analytics, cropName, cropColor, compact }: MandiRateCardProps) {
  const isUp = analytics.trend === 'up';
  const isDown = analytics.trend === 'down';
  const trendColor = isUp ? colors.success : isDown ? colors.error : colors.textSecondary;
  const trendIcon = isUp ? 'trending-up' : isDown ? 'trending-down' : 'minus';

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${cropColor}18` }]}>
          <MaterialCommunityIcons name="storefront-outline" size={22} color={cropColor} />
        </View>
        <View style={styles.headerText}>
          <Title>{analytics.varietyName ?? cropName}</Title>
          {analytics.varietyName ? <Caption>{cropName}</Caption> : null}
          <Caption>{analytics.market}, {analytics.state}</Caption>
          {!analytics.isLive ? (
            <Caption style={styles.refBadge}>Reference rate — live Agmarknet lo ledu</Caption>
          ) : (
            <Caption style={styles.liveBadge}>Live Agmarknet variety rate</Caption>
          )}
        </View>
        <View style={[styles.trendBadge, { backgroundColor: `${trendColor}15` }]}>
          <MaterialCommunityIcons name={trendIcon} size={16} color={trendColor} />
          <Caption style={{ color: trendColor, fontFamily: 'Poppins_600SemiBold' }}>
            {formatPercentChange(analytics.changePercent)}
          </Caption>
        </View>
      </View>

      {analytics.priceNote ? <Caption style={styles.priceNote}>ℹ️ {analytics.priceNote}</Caption> : null}

      <View style={styles.priceRow}>
        <View>
          <Caption>Modal rate (today)</Caption>
          <Title style={styles.modalPrice}>{formatCurrency(analytics.currentModal)}</Title>
          <Caption>{analytics.unit}</Caption>
        </View>
        {!compact ? (
          <View style={styles.rangeCol}>
            <View style={styles.rangeItem}>
              <Caption>Min</Caption>
              <Body style={styles.rangeValue}>{formatCurrency(analytics.low30d)}</Body>
            </View>
            <View style={styles.rangeItem}>
              <Caption>Max</Caption>
              <Body style={styles.rangeValue}>{formatCurrency(analytics.high30d)}</Body>
            </View>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  refBadge: { color: colors.warning, fontFamily: 'Poppins_500Medium' },
  liveBadge: { color: colors.success, fontFamily: 'Poppins_500Medium' },
  priceNote: { color: colors.textSecondary, fontStyle: 'italic', marginTop: spacing.xs },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  modalPrice: { color: colors.primary, marginTop: 2 },
  rangeCol: { flexDirection: 'row', gap: spacing.lg },
  rangeItem: { alignItems: 'flex-end' },
  rangeValue: { fontFamily: 'Poppins_600SemiBold' },
});
