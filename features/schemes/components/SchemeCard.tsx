import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Linking from 'expo-linking';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import {
  categoryLabel,
  regionLabel,
  schemeLocaleText,
} from '@/constants/govtSchemes';
import type { LanguageCode } from '@/constants/languages';
import type {
  GovtScheme,
  SchemeEligibilityReasonCode,
  SchemeEligibilityResult,
} from '@/types/govtScheme';
import { colors, radius, spacing } from '@/theme';

interface SchemeCardProps {
  scheme: GovtScheme;
  language: LanguageCode;
  eligibility?: SchemeEligibilityResult;
  eligibleLabel: string;
  possibleLabel: string;
  activeLabel: string;
  whoEligibleLabel: string;
  howToApplyLabel: string;
  openPortalLabel: string;
  reasonLabel: (code: SchemeEligibilityReasonCode) => string;
}

const REGION_COLORS: Record<string, string> = {
  central: '#1565C0',
  ap: '#E65100',
  ts: '#2E7D32',
};

export function SchemeCard({
  scheme,
  language,
  eligibility,
  eligibleLabel,
  possibleLabel,
  activeLabel,
  whoEligibleLabel,
  howToApplyLabel,
  openPortalLabel,
  reasonLabel,
}: SchemeCardProps) {
  const regionColor = REGION_COLORS[scheme.region] ?? colors.primary;
  const isLikely = eligibility?.level === 'likely';
  const isPossible = eligibility?.level === 'possible';
  const title = schemeLocaleText(language, scheme.titleEn, scheme.titleTe);
  const amount = schemeLocaleText(language, scheme.amountEn, scheme.amountTe);
  const benefit = schemeLocaleText(language, scheme.benefitEn, scheme.benefitTe);
  const eligibilityText = schemeLocaleText(
    language,
    scheme.eligibilityEn,
    scheme.eligibilityTe,
  );
  const howToApply = schemeLocaleText(language, scheme.howToApplyEn, scheme.howToApplyTe);
  const highlights =
    language === 'te' ? scheme.highlightsTe : scheme.highlightsEn;

  return (
    <Card
      variant="elevated"
      style={[
        styles.card,
        isLikely && styles.cardEligible,
        isPossible && !isLikely && styles.cardPossible,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${regionColor}18` }]}>
          <MaterialCommunityIcons
            name={scheme.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={24}
            color={regionColor}
          />
        </View>
        <View style={styles.headerText}>
          <Title style={styles.title}>{title}</Title>
        </View>
        <View style={[styles.amountBadge, { backgroundColor: `${regionColor}12` }]}>
          <Label style={[styles.amountText, { color: regionColor }]}>{amount}</Label>
        </View>
      </View>

      {isLikely || isPossible ? (
        <View
          style={[
            styles.eligibilityBanner,
            isLikely ? styles.eligibilityLikely : styles.eligibilityPossible,
          ]}
        >
          <MaterialCommunityIcons
            name={isLikely ? 'check-decagram' : 'information-outline'}
            size={18}
            color={isLikely ? colors.success : colors.primary}
          />
          <Caption
            style={[
              styles.eligibilityBannerText,
              { color: isLikely ? colors.success : colors.primary },
            ]}
          >
            {isLikely ? eligibleLabel : possibleLabel}
          </Caption>
        </View>
      ) : null}

      {eligibility?.reasons?.length ? (
        <View style={styles.reasonList}>
          {eligibility.reasons.map((reason) => (
            <Caption key={reason} style={styles.reasonText}>
              • {reasonLabel(reason)}
            </Caption>
          ))}
        </View>
      ) : null}

      <View style={styles.tags}>
        <View style={[styles.tag, { borderColor: regionColor }]}>
          <Caption style={{ color: regionColor }}>
            {regionLabel(language, scheme.region)}
          </Caption>
        </View>
        <View style={styles.tag}>
          <Caption>{categoryLabel(language, scheme.category)}</Caption>
        </View>
        <View style={[styles.tag, styles.activeTag]}>
          <Caption style={styles.activeTagText}>{activeLabel}</Caption>
        </View>
      </View>

      <Body style={styles.benefit}>{benefit}</Body>

      {highlights.length ? (
        <View style={styles.highlights}>
          {highlights.map((h) => (
            <View key={h} style={styles.highlightRow}>
              <MaterialCommunityIcons name="check-circle" size={14} color={colors.success} />
              <Caption style={styles.highlightText}>{h}</Caption>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Label style={styles.sectionLabel}>{whoEligibleLabel}</Label>
        <Caption style={styles.sectionBody}>{eligibilityText}</Caption>
      </View>

      <View style={styles.section}>
        <Label style={styles.sectionLabel}>{howToApplyLabel}</Label>
        <Caption style={styles.sectionBody}>{howToApply}</Caption>
      </View>

      {scheme.applyUrl ? (
        <Pressable
          onPress={() => void Linking.openURL(scheme.applyUrl!)}
          style={[styles.applyBtn, { borderColor: isLikely ? colors.success : regionColor }]}
        >
          <MaterialCommunityIcons
            name="open-in-new"
            size={16}
            color={isLikely ? colors.success : regionColor}
          />
          <Label
            style={[styles.applyText, { color: isLikely ? colors.success : regionColor }]}
          >
            {openPortalLabel}
          </Label>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, padding: spacing.lg },
  cardEligible: {
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: `${colors.success}08`,
  },
  cardPossible: {
    borderWidth: 1,
    borderColor: `${colors.primary}50`,
  },
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
  eligibilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  eligibilityLikely: { backgroundColor: `${colors.success}18` },
  eligibilityPossible: { backgroundColor: `${colors.primary}12` },
  eligibilityBannerText: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  reasonList: { gap: 2, paddingHorizontal: spacing.xxs },
  reasonText: { color: colors.textSecondary, lineHeight: 18, fontSize: 11 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTag: {
    backgroundColor: `${colors.success}15`,
    borderColor: colors.success,
  },
  activeTagText: { color: colors.success, fontFamily: 'Poppins_600SemiBold' },
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
