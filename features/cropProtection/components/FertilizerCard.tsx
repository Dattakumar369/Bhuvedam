import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Caption, Title } from '@/components/ui/Typography';
import type { FertilizerRecommendation } from '@/types/cropProtection';
import { colors, radius, spacing } from '@/theme';

interface FertilizerCardProps {
  item: FertilizerRecommendation;
}

export function FertilizerCard({ item }: FertilizerCardProps) {
  return (
    <Card variant="outlined" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: `${colors.success}15` }]}>
          <MaterialCommunityIcons name="leaf" size={20} color={colors.success} />
        </View>
        <View style={styles.headerText}>
          <Title>{item.name}</Title>
          <Caption>{item.nameTe}</Caption>
        </View>
      </View>

      <Row label="Dose / మోతాదు" value={item.dose} />
      <Row label="Method / వIDhanaM" value={item.method} />
      <Row label="Timing / ఎప్పుడు" value={item.timing} />
      <Row label="Est. price / ధర" value={item.estimatedPrice} highlight />
      {item.notes ? <Caption style={styles.note}>💡 {item.notes}</Caption> : null}
    </Card>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Caption style={styles.rowLabel}>{label}</Caption>
      <Body style={[styles.rowValue, highlight && { color: colors.primary }]}>{value}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', marginBottom: spacing.xs },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  row: { gap: 2 },
  rowLabel: { color: colors.textTertiary },
  rowValue: { fontFamily: 'Poppins_500Medium' },
  note: { marginTop: spacing.xs, color: colors.textSecondary, fontStyle: 'italic' },
});
