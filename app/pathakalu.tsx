import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, Header, SearchInput } from '@/components/ui';
import { Body, Caption, Title } from '@/components/ui/Typography';
import {
  GOVT_SCHEME_CATEGORIES,
  GOVT_SCHEME_REGIONS,
  GOVT_SCHEMES,
  GOVT_SCHEMES_UPDATED,
} from '@/constants/govtSchemes';
import { SchemeCard } from '@/features/schemes/components/SchemeCard';
import type { GovtSchemeCategory, GovtSchemeRegion } from '@/types/govtScheme';
import { colors, layout, spacing } from '@/theme';

export default function PathakaluScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<GovtSchemeCategory | 'all'>('all');
  const [region, setRegion] = useState<GovtSchemeRegion | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GOVT_SCHEMES.filter((s) => {
      if (category !== 'all' && s.category !== category) return false;
      if (region !== 'all' && s.region !== region) return false;
      if (!q) return true;
      const haystack = [
        s.titleTe,
        s.titleEn,
        s.benefitTe,
        s.amountTe,
        s.eligibilityTe,
        ...s.highlights,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [search, category, region]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="ప్రభుత్వ Pathakalu" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.intro}>
          <Title style={styles.introTitle}>Subsidy, Loans & Insurance</Title>
          <Body style={styles.introBody}>
            PM-KISAN, KCC, crop insurance, Rythu Bharosa, Annadata Sukhibhava — latest government
            pathakalu ikkada chudandi. Meeru add/update cheyalsina avasaram ledu.
          </Body>
          <Caption style={styles.updated}>
            Last updated: {GOVT_SCHEMES_UPDATED} · {GOVT_SCHEMES.length} schemes
          </Caption>
        </View>

        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search — PM-KISAN, KCC, insurance..."
        />

        <Caption style={styles.filterLabel}>రకం</Caption>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {GOVT_SCHEME_CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                label={c.labelTe}
                selected={category === c.id}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </View>
        </ScrollView>

        <Caption style={styles.filterLabel}>రాష్ట్రం</Caption>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {GOVT_SCHEME_REGIONS.map((r) => (
              <Chip
                key={r.id}
                label={r.labelTe}
                selected={region === r.id}
                onPress={() => setRegion(r.id)}
              />
            ))}
          </View>
        </ScrollView>

        <Caption style={styles.resultCount}>
          {filtered.length} pathakalu kanipistunnayi
        </Caption>

        <View style={styles.list}>
          {filtered.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </View>

        {!filtered.length ? (
          <Caption style={styles.empty}>Search or filter marchi try cheyandi</Caption>
        ) : null}

        <Caption style={styles.disclaimer}>
          Information only — exact eligibility & amounts official government portals lo verify
          cheyandi. Schemes update avuthu untayi.
        </Caption>
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
