import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Linking from 'expo-linking';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import { categoryLabelTe, regionLabelTe } from '@/constants/govtSchemes';
import type { GovtScheme } from '@/types/govtScheme';
import { colors, radius, spacing } from '@/theme';

interface SchemeCardProps {
  scheme: GovtScheme;
}

const REGION_COLORS: Record<string, string> = {
  central: '#1565C0',
  ap: '#E65100',
  ts: '#2E7D32',
};

export function SchemeCard({ scheme }: SchemeCardProps) {
  const regionColor = REGION_COLORS[scheme.region] ?? colors.primary;

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${regionColor}18` }]}>
          <MaterialCommunityIcons
            name={scheme.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={24}
            color={regionColor}
          />
        </View>
        <View style={styles.headerText}>
          <Title style={styles.title}>{scheme.titleTe}</Title>
          <Caption>{scheme.titleEn}</Caption>
        </View>
        <View style={[styles.amountBadge, { backgroundColor: `${regionColor}12` }]}>
          <Label style={[styles.amountText, { color: regionColor }]}>{scheme.amountTe}</Label>
        </View>
      </View>

      <View style={styles.tags}>
        <View style={[styles.tag, { borderColor: regionColor }]}>
          <Caption style={{ color: regionColor }}>{regionLabelTe(scheme.region)}</Caption>
        </View>
        <View style={styles.tag}>
          <Caption>{categoryLabelTe(scheme.category)}</Caption>
        </View>
      </View>

      <Body style={styles.benefit}>{scheme.benefitTe}</Body>

      {scheme.highlights.length ? (
        <View style={styles.highlights}>
          {scheme.highlights.map((h) => (
            <View key={h} style={styles.highlightRow}>
              <MaterialCommunityIcons name="check-circle" size={14} color={colors.success} />
              <Caption style={styles.highlightText}>{h}</Caption>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Label style={styles.sectionLabel}>ఎవరు eligible?</Label>
        <Caption style={styles.sectionBody}>{scheme.eligibilityTe}</Caption>
      </View>

      <View style={styles.section}>
        <Label style={styles.sectionLabel}>ఎలా apply cheyali?</Label>
        <Caption style={styles.sectionBody}>{scheme.howToApplyTe}</Caption>
      </View>

      {scheme.applyUrl ? (
        <Pressable
          onPress={() => void Linking.openURL(scheme.applyUrl!)}
          style={[styles.applyBtn, { borderColor: regionColor }]}
        >
          <MaterialCommunityIcons name="open-in-new" size={16} color={regionColor} />
          <Label style={[styles.applyText, { color: regionColor }]}>Official portal open cheyandi</Label>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  title: { fontSize: 17 },
  amountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    maxWidth: 110,
  },
  amountText: { fontSize: 12, textAlign: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  benefit: { color: colors.textSecondary, lineHeight: 22 },
  highlights: { gap: 4, marginTop: spacing.xs },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  highlightText: { flex: 1, color: colors.textSecondary, lineHeight: 18 },
  section: { gap: 2, marginTop: spacing.xs },
  sectionLabel: { color: colors.primary, fontSize: 13 },
  sectionBody: { color: colors.textTertiary, lineHeight: 20 },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  applyText: { fontSize: 13 },
});
