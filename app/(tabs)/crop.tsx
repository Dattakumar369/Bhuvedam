import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { GradientHeader, SearchInput } from '@/components/ui';
import { Body, Caption, Title } from '@/components/ui/Typography';
import { SEASON_EN, SEASON_TELUGU } from '@/constants/cropDisplay';
import { CROPS, CROP_SEASONS, type CropSeason } from '@/constants/crops';
import { cropMatchesQuery } from '@/constants/cropSearchAliases';
import { CropCard } from '@/features/crop/components/CropCard';
import { FarmerFarmSetup } from '@/features/crop/components/FarmerFarmSetup';
import { useAppColors } from '@/hooks/useAppColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useCropCatalogStore } from '@/store/cropCatalogStore';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useWeatherStore } from '@/store/weatherStore';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { layout, radius, spacing } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SeasonFilter = 'all' | CropSeason;

export default function CropScreen() {
  const insets = useSafeAreaInsets();
  const c = useAppColors();
  const keyboardHeight = useKeyboardHeight();
  const [search, setSearch] = useState('');
  const [season, setSeason] = useState<SeasonFilter>('all');
  const [showAllCrops, setShowAllCrops] = useState(false);
  const [wizardActive, setWizardActive] = useState(false);

  const fetchWeather = useWeatherStore((s) => s.fetchWeather);
  const farmerCrops = useFarmerContextStore((s) => s.crops);
  const setupComplete = useFarmerContextStore((s) => s.setupComplete);

  const catalogCrops = useCropCatalogStore((s) => s.crops);
  const hydrateCrops = useCropCatalogStore((s) => s.hydrate);
  const { farm, language } = useTranslation();

  useEffect(() => {
    void fetchWeather();
    void hydrateCrops(language);
  }, [fetchWeather, hydrateCrops, language]);

  const allCrops = catalogCrops.length ? catalogCrops : CROPS;

  const filteredCrops = useMemo(() => {
    return allCrops.filter((crop) => {
      const matchesSearch = cropMatchesQuery(crop, search);
      const matchesSeason = season === 'all' || crop.season === season;
      return matchesSearch && matchesSeason;
    });
  }, [search, season, allCrops]);

  const myCrops = useMemo(
    () => allCrops.filter((crop) => farmerCrops.includes(crop.id)),
    [farmerCrops, allCrops],
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <GradientHeader title={farm.cropTabTitle} subtitle={farm.cropTabSubtitle} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl + keyboardHeight },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        scrollEnabled={!wizardActive}
      >
        <FarmerFarmSetup onWizardActiveChange={setWizardActive} />

        {!setupComplete ? (
          <View style={[styles.lockedBox, { backgroundColor: c.surfaceVariant }]}>
            <MaterialCommunityIcons name="lock-outline" size={32} color={c.textTertiary} />
            <Body style={styles.lockedText}>{farm.lockedMessage}</Body>
          </View>
        ) : (
          <>
            {myCrops.length > 0 ? (
              <View style={styles.section}>
                <Title style={[styles.sectionTitle, { color: c.primary }]}>
                  🌾 {farm.myCropInfo}
                </Title>
                {myCrops.map((crop, index) => (
                  <CropCard key={crop.id} crop={crop} index={index} expanded />
                ))}
              </View>
            ) : null}

            <Pressable
              onPress={() => setShowAllCrops((v) => !v)}
              style={[styles.expandBtn, { backgroundColor: `${c.primary}10` }]}
            >
              <MaterialCommunityIcons
                name={showAllCrops ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={c.primary}
              />
              <Body style={[styles.expandText, { color: c.primary }]}>
                {showAllCrops ? farm.hideOtherCrops : farm.showOtherCrops}
              </Body>
            </Pressable>

            {showAllCrops ? (
              <View style={styles.section}>
                <SearchInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder={farm.searchCrops}
                />

                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.seasonRow}
                >
                  {CROP_SEASONS.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => setSeason(item.id)}
                      style={[
                        styles.seasonChip,
                        { backgroundColor: c.surface, borderColor: c.border },
                        season === item.id && {
                          backgroundColor: c.primary,
                          borderColor: c.primary,
                        },
                      ]}
                    >
                      <Caption
                        style={[
                          styles.seasonChipText,
                          season === item.id && styles.seasonChipTextOn,
                        ]}
                      >
                        {language === 'te'
                          ? (SEASON_TELUGU[item.id] ?? item.label)
                          : (SEASON_EN[item.id] ?? item.label)}
                      </Caption>
                    </Pressable>
                  ))}
                </ScrollView>

                {filteredCrops.length === 0 ? (
                  <Body style={styles.empty}>{farm.noCropFound}</Body>
                ) : (
                  filteredCrops.map((crop, index) => (
                    <CropCard key={crop.id} crop={crop} index={index} />
                  ))
                )}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenPadding,
    marginTop: -spacing.lg,
    gap: spacing.lg,
  },
  lockedBox: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
  },
  lockedText: { textAlign: 'center', lineHeight: 22 },
  section: { gap: spacing.md },
  sectionTitle: { fontSize: 18 },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  expandText: { fontFamily: 'Poppins_600SemiBold' },
  seasonRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  seasonChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  seasonChipText: { fontFamily: 'Poppins_500Medium' },
  seasonChipTextOn: { color: '#FFFFFF' },
  empty: { textAlign: 'center', paddingVertical: spacing.lg },
});
