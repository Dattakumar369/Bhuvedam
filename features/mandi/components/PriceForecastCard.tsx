import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Caption, Title } from '@/components/ui/Typography';
import type { PriceForecast } from '@/types/mandi';
import { formatCurrency } from '@/utils/format';
import { colors, radius, spacing } from '@/theme';

interface PriceForecastCardProps {
  forecast: PriceForecast;
  cropName: string;
  monthsAhead: number;
  onMonthsChange: (months: number) => void;
}

const MONTH_OPTIONS = [1, 2, 3, 4, 5, 6];

export function PriceForecastCard({
  forecast,
  cropName,
  monthsAhead,
  onMonthsChange,
}: PriceForecastCardProps) {
  const targetLabel = new Date(forecast.targetDate).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const confidenceColor =
    forecast.confidence === 'high'
      ? colors.success
      : forecast.confidence === 'medium'
        ? colors.warning
        : colors.textSecondary;

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="crystal-ball" size={24} color={colors.accent} />
        <View style={styles.headerText}>
          <Title>Price estimation</Title>
          <Caption>
            If you sow {cropName} now — estimated rate in {monthsAhead} month
            {monthsAhead > 1 ? 's' : ''} ({targetLabel})
          </Caption>
        </View>
      </View>

      <View style={styles.monthRow}>
        {MONTH_OPTIONS.map((m) => (
          <Pressable
            key={m}
            onPress={() => onMonthsChange(m)}
            style={[styles.monthChip, monthsAhead === m && styles.monthChipActive]}
          >
            <Caption style={monthsAhead === m ? styles.monthChipTextActive : undefined}>
              {m}M
            </Caption>
          </Pressable>
        ))}
      </View>

      <View style={styles.estimateBox}>
        <Caption>Estimated modal price</Caption>
        <Title style={styles.estimatePrice}>{formatCurrency(forecast.estimatedPrice)}</Title>
        <Caption>
          Range: {formatCurrency(forecast.estimatedLow)} – {formatCurrency(forecast.estimatedHigh)} /
          quintal
        </Caption>
      </View>

      <View style={styles.compareRow}>
        <CompareItem label="Today" value={formatCurrency(forecast.currentPrice)} />
        <MaterialCommunityIcons name="arrow-right" size={18} color={colors.textTertiary} />
        <CompareItem
          label={`After ${monthsAhead}M`}
          value={formatCurrency(forecast.estimatedPrice)}
          highlight
        />
      </View>

      <View style={[styles.confidenceBadge, { backgroundColor: `${confidenceColor}15` }]}>
        <Caption style={{ color: confidenceColor }}>
          {forecast.confidence.toUpperCase()} confidence · Seasonal ×{forecast.seasonalFactor} · Trend{' '}
          {forecast.trendPercent > 0 ? '+' : ''}
          {forecast.trendPercent}%
        </Caption>
      </View>

      <View style={styles.factors}>
        {forecast.factors.map((factor) => (
          <View key={factor} style={styles.factorRow}>
            <MaterialCommunityIcons name="check-circle-outline" size={14} color={colors.primary} />
            <Caption style={styles.factorText}>{factor}</Caption>
          </View>
        ))}
      </View>

      <Caption style={styles.disclaimer}>
        Estimate based on seasonal statistics & recent trends. Actual mandi rates may vary. Source:
        Agmarknet / data.gov.in
      </Caption>
    </Card>
  );
}

function CompareItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.compareItem}>
      <Caption>{label}</Caption>
      <Body style={[styles.compareValue, highlight && { color: colors.primary }]}>
        {value}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  headerText: { flex: 1 },
  monthRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  monthChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  monthChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  monthChipTextActive: { color: colors.white, fontFamily: 'Poppins_600SemiBold' },
  estimateBox: {
    backgroundColor: `${colors.primary}08`,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  estimatePrice: { color: colors.primary, marginVertical: spacing.xs },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  compareItem: { alignItems: 'center' },
  compareValue: { fontFamily: 'Poppins_600SemiBold' },
  confidenceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  factors: { gap: spacing.xs },
  factorRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  factorText: { flex: 1 },
  disclaimer: { color: colors.textTertiary, fontStyle: 'italic' },
});
