import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Caption, Title } from '@/components/ui/Typography';
import type { CropVariety } from '@/types/cropVariety';
import { colors, radius, spacing } from '@/theme';

interface VarietyDetailCardProps {
  variety: CropVariety;
}

export function VarietyDetailCard({ variety }: VarietyDetailCardProps) {
  return (
    <Card variant="outlined" style={styles.card}>
      <Title>{variety.name}</Title>
      <Caption>{variety.nameTe}</Caption>

      <InfoRow icon="calendar-range" label="Duration" value={variety.duration} />
      <InfoRow icon="grain" label="Grain type" value={variety.grainType} />
      <InfoRow icon="chart-line" label="Yield" value={variety.yieldPotential} />
      <InfoRow icon="seed" label="Seed rate" value={variety.seedRate} />
      <InfoRow icon="cash" label="Price note" value={variety.priceNoteTe} highlight />

      <View style={styles.section}>
        <Body style={styles.sectionTitle}>Fertilizer (variety-specific)</Body>
        {variety.fertilizerNotesTe.map((n) => (
          <Caption key={n} style={styles.bullet}>• {n}</Caption>
        ))}
      </View>

      <View style={styles.section}>
        <Body style={styles.sectionTitle}>Spray / Mandu</Body>
        {variety.sprayNotesTe.map((n) => (
          <Caption key={n} style={styles.bullet}>• {n}</Caption>
        ))}
      </View>

      <View style={styles.section}>
        <Body style={styles.sectionTitle}>Rogalu susceptibility</Body>
        <Caption>{variety.diseaseSusceptibility.join(', ')}</Caption>
      </View>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name={icon} size={16} color={highlight ? colors.primary : colors.textTertiary} />
      <Caption style={styles.rowLabel}>{label}</Caption>
      <Body style={[styles.rowValue, highlight && { color: colors.primary }]}>{value}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  section: { gap: 4, marginTop: spacing.xs },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  bullet: { lineHeight: 20, paddingLeft: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  rowLabel: { color: colors.textTertiary, minWidth: 70 },
  rowValue: { flex: 1, fontFamily: 'Poppins_500Medium', fontSize: 13 },
});
