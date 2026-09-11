import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, Header, SearchInput } from '@/components/ui';
import { Body, Caption, Title } from '@/components/ui/Typography';
import {
  GOVT_SCHEME_CATEGORIES,
  GOVT_SCHEME_REGIONS,
  GOVT_SCHEMES_UPDATED,
  getActiveGovtSchemes,
  schemeLocaleText,
} from '@/constants/govtSchemes';
import { SchemeCard } from '@/features/schemes/components/SchemeCard';
import { useTranslation } from '@/hooks/useTranslation';
import { sortSchemesByEligibility } from '@/services/schemes/schemeEligibility';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import type { GovtSchemeCategory, GovtSchemeRegion } from '@/types/govtScheme';
import { colors, layout, spacing } from '@/theme';

export default function PathakaluScreen() {
  const insets = useSafeAreaInsets();
  const { screens, language } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<GovtSchemeCategory | 'all'>('all');
  const [region, setRegion] = useState<GovtSchemeRegion | 'all'>('all');

  const state = useFarmerContextStore((s) => s.state);
  const surveyNumber = useFarmerContextStore((s) => s.surveyNumber);
  const khataNumber = useFarmerContextStore((s) => s.khataNumber);
  const landExtentAcres = useFarmerContextStore((s) => s.landExtentAcres);
  const areaAcres = useFarmerContextStore((s) => s.areaAcres);
  const farmSize = useFarmerContextStore((s) => s.farmSize);
  const setupComplete = useFarmerContextStore((s) => s.setupComplete);

  const farmerProfile = useMemo(
    () => ({
      state,
      surveyNumber,
      khataNumber,
      landExtentAcres,
      areaAcres,
      farmSize,
      setupComplete,
    }),
    [state, surveyNumber, khataNumber, landExtentAcres, areaAcres, farmSize, setupComplete],
  );

  const activeSchemes = useMemo(() => getActiveGovtSchemes(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = activeSchemes.filter((s) => {
      if (category !== 'all' && s.category !== category) return false;
      if (region !== 'all' && s.region !== region) return false;
      if (!q) return true;
      const haystack = [
        s.titleEn,
        s.titleTe,
        s.benefitEn,
        s.benefitTe,
        s.amountEn,
        s.amountTe,
        s.eligibilityEn,
        s.eligibilityTe,
        ...s.highlightsEn,
        ...s.highlightsTe,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    return sortSchemesByEligibility(base, farmerProfile);
  }, [search, category, region, activeSchemes, farmerProfile]);

  const likelyCount = filtered.filter((s) => s.eligibility.level === 'likely').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title={screens.pathakaluTitle} showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.intro}>
          <Title style={styles.introTitle}>{screens.pathakaluIntroTitle}</Title>
          <Body style={styles.introBody}>{screens.pathakaluIntroBody}</Body>
          <Caption style={styles.updated}>
            {screens.pathakaluUpdated(GOVT_SCHEMES_UPDATED, activeSchemes.length)}
          </Caption>
          {likelyCount > 0 ? (
            <Caption style={styles.eligibleSummary}>
              {screens.pathakaluEligibleCount(likelyCount)}
            </Caption>
          ) : (
            <Caption style={styles.eligibleHint}>{screens.pathakaluEligibilityHint}</Caption>
          )}
        </View>

        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder={screens.pathakaluSearch}
        />

        <Caption style={styles.filterLabel}>{screens.pathakaluCategory}</Caption>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {GOVT_SCHEME_CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                label={schemeLocaleText(language, c.labelEn, c.labelTe)}
                selected={category === c.id}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </View>
        </ScrollView>

        <Caption style={styles.filterLabel}>{screens.pathakaluRegion}</Caption>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {GOVT_SCHEME_REGIONS.map((r) => (
              <Chip
                key={r.id}
                label={schemeLocaleText(language, r.labelEn, r.labelTe)}
                selected={region === r.id}
                onPress={() => setRegion(r.id)}
              />
            ))}
          </View>
        </ScrollView>

        <Caption style={styles.resultCount}>
          {screens.pathakaluResultCount(filtered.length)}
        </Caption>

        <View style={styles.list}>
          {filtered.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              language={language}
              eligibility={scheme.eligibility}
              eligibleLabel={screens.pathakaluEligibleBadge}
              possibleLabel={screens.pathakaluPossibleBadge}
              activeLabel={screens.pathakaluActiveBadge}
              whoEligibleLabel={screens.pathakaluWhoEligible}
              howToApplyLabel={screens.pathakaluHowToApply}
              openPortalLabel={screens.pathakaluOpenPortal}
              reasonLabel={screens.pathakaluReason}
            />
          ))}
        </View>

        {!filtered.length ? (
          <Caption style={styles.empty}>{screens.pathakaluEmpty}</Caption>
        ) : null}

        <Caption style={styles.disclaimer}>{screens.pathakaluDisclaimer}</Caption>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  intro: { gap: spacing.xs },
  introTitle: { fontSize: 20, color: colors.primary },
  introBody: { color: colors.textSecondary, lineHeight: 22 },
  updated: { color: colors.textTertiary },
  eligibleSummary: {
    color: colors.success,
    fontFamily: 'Poppins_600SemiBold',
    marginTop: spacing.xxs,
  },
  eligibleHint: { color: colors.textSecondary, lineHeight: 18, marginTop: spacing.xxs },
  filterLabel: { fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary },
  chipRow: { flexDirection: 'row', gap: spacing.xs, paddingRight: spacing.md },
  resultCount: { color: colors.textTertiary },
  list: { gap: spacing.md },
  empty: { textAlign: 'center', color: colors.textTertiary, paddingVertical: spacing.xl },
  disclaimer: {
    textAlign: 'center',
    color: colors.textTertiary,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});
