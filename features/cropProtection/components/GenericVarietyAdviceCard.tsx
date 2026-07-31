import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Caption, Title } from '@/components/ui/Typography';
import { getCropProtectionGuide } from '@/constants/cropProtection/guides';
import type { VarietyEntry } from '@/constants/cropVarieties';
import { colors, spacing } from '@/theme';

interface GenericVarietyAdviceCardProps {
  entry: VarietyEntry;
  cropName: string;
}

/** Advice for Agmarknet-discovered varieties without a curated full guide */
export function GenericVarietyAdviceCard({ entry, cropName }: GenericVarietyAdviceCardProps) {
  const guide = getCropProtectionGuide(entry.cropId);
  const stageCount = guide.stages.length;
  const diseaseCount = guide.diseases.length;

  return (
    <Card variant="outlined" style={styles.card}>
      <Title>{entry.name}</Title>
      <Caption>{cropName} — Agmarknet variety</Caption>

      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="information-outline" size={18} color={colors.info} />
        <Caption style={styles.infoText}>
          Ee variety ki curated guide ippatiki ledu. Kinda {cropName} panta ki general fertilizer,
          spray, rogam advice apply avutundi. Seed company label & local agriculture officer
          recommendation follow cheyandi.
        </Caption>
      </View>

      <Body style={styles.sectionTitle}>Available for this crop</Body>
      <Caption>• {stageCount} growth stages — eruvu & preventive spray schedule</Caption>
      <Caption>• {diseaseCount} common diseases / pests with mandu advice</Caption>
      <Caption>• Live mandi rate (Agmarknet) — variety-wise</Caption>
      <Caption style={styles.hint}>
        Meeru ee variety gurinchi AI chat lo adagandi — variety name + crop cheppandi, detailed
        answer istundi.
      </Caption>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  infoRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  infoText: { flex: 1, lineHeight: 20, color: colors.textSecondary },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', marginTop: spacing.xs },
  hint: { fontStyle: 'italic', color: colors.textTertiary, marginTop: spacing.xs },
});
