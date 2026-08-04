import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Badge, Chip, DataFreshnessBadge, Header, KeyboardSafeView, ListSkeleton, SearchInput, SectionTitle } from '@/components/ui';
import { Body, Caption } from '@/components/ui/Typography';
import { MANDI_CROPS } from '@/constants/mandiCommodities';
import { MandiRateCard } from '@/features/mandi/components/MandiRateCard';
import { PriceForecastCard } from '@/features/mandi/components/PriceForecastCard';
import { PriceTrendChart } from '@/features/mandi/components/PriceTrendChart';
import { VarietyDetailCard } from '@/features/mandi/components/VarietyDetailCard';
import { VarietyPicker } from '@/features/mandi/components/VarietyPicker';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useMandiRates } from '@/hooks/useMandiRates';
import { useAlertStore } from '@/store/alertStore';
import { colors, layout, spacing } from '@/theme';

export default function MandiRatesScreen() {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const [refreshing, setRefreshing] = useState(false);
  const [varietySearch, setVarietySearch] = useState('');
  const {
    selectedCropId,
    selectedVarietyId,
    forecastMonths,
    source,
    isLoading,
    error,
    lastFetched,
    load,
    refresh,
    setSelectedCrop,
    setSelectedVariety,
    setForecastMonths,
    varietyList,
    cropAnalytics,
    selectedAnalytics,
    selectedForecast,
  } = useMandiRates();
  const syncStatus = useAlertStore((s) => s.syncStatus);
  const refreshAlerts = useAlertStore((s) => s.refreshAlerts);

  useEffect(() => {
    load();
  }, [load]);

  const selectedCrop = MANDI_CROPS.find((c) => c.id === selectedCropId);
  const selectedEntry = varietyList.find((v) => v.id === selectedVarietyId);
  const curated = selectedEntry?.curated;

  const liveVarietyIds = useMemo(() => {
    const set = new Set<string>();
    for (const a of cropAnalytics) {
      if (a.isLive && a.varietyId) set.add(a.varietyId);
    }
    return set;
  }, [cropAnalytics]);

  const sourceLabel =
    source === 'live'
      ? `Live Agmarknet · ${cropAnalytics.length} varieties`
      : source === 'cached'
        ? 'Cached'
        : 'Reference avg — pull to refresh for live';

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    await refreshAlerts({
      force: true,
      notify: useAlertStore.getState().notificationsEnabled,
    });
    setRefreshing(false);
  };

  const handleCropSelect = (cropId: string) => {
    setVarietySearch('');
    setSelectedCrop(cropId);
  };

  return (
    <KeyboardSafeView style={styles.container}>
      <View style={styles.headerWrap}>
        <Header title="Mandi Rates" showBack onBack={() => router.back()} />
      </View>

      <View style={styles.searchWrap}>
        <SearchInput
          placeholder="Variety search — Masoori, 1010, BPT, hybrid..."
          value={varietySearch}
          onChangeText={setVarietySearch}
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl + keyboardHeight }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.content}>
          <Caption style={styles.subtitle}>
            Prati panta ki 100+ varieties untayi — Agmarknet nunchi live ga anni varieties fetch
            chestam. Okko rakam ki okko rate.
          </Caption>

          <View style={styles.sourceRow}>
            <Badge label={sourceLabel} variant={source === 'live' ? 'primary' : 'accent'} />
            <DataFreshnessBadge
              label="Mandi data"
              updatedAt={syncStatus?.mandiLastSync ?? lastFetched}
              icon="store-outline"
            />
            {lastFetched ? (
              <Caption>
                Updated{' '}
                {new Date(lastFetched).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Caption>
            ) : null}
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Body style={styles.errorText}>{error}</Body>
            </View>
          ) : null}

          <SectionTitle title="Select crop / Panta" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <View style={styles.chipRow}>
              {MANDI_CROPS.map((crop) => (
                <Chip
                  key={crop.id}
                  label={crop.name}
                  selected={selectedCropId === crop.id}
                  onPress={() => handleCropSelect(crop.id)}
                />
              ))}
            </View>
          </ScrollView>

          {isLoading && !selectedAnalytics ? (
            <ListSkeleton count={3} />
          ) : (
            <>
              <SectionTitle title="Variety / Rakam — select" />
              <VarietyPicker
                varieties={varietyList}
                selectedId={selectedVarietyId}
                onSelect={setSelectedVariety}
                liveVarietyIds={liveVarietyIds}
                search={varietySearch}
              />

              {selectedAnalytics && selectedCrop ? (
                <Animated.View entering={FadeInDown.springify()} style={styles.section}>
                  <MandiRateCard
                    analytics={selectedAnalytics}
                    cropName={selectedCrop.name}
                    cropColor={selectedCrop.color}
                  />
                  {curated ? <VarietyDetailCard variety={curated} /> : null}

                  {selectedForecast && selectedAnalytics ? (
                    <>
                      <PriceTrendChart analytics={selectedAnalytics} />
                      <PriceForecastCard
                        forecast={selectedForecast}
                        cropName={selectedAnalytics.varietyName ?? selectedCrop.name}
                        monthsAhead={forecastMonths}
                        onMonthsChange={setForecastMonths}
                      />
                    </>
                  ) : null}

                  <SectionTitle title={`All ${selectedCrop.name} varieties today (${cropAnalytics.length})`} />
                  {cropAnalytics.map((item) => (
                    <View key={`${item.cropId}-${item.varietyId}-${item.varietyName}`} style={styles.listItem}>
                      <MandiRateCard
                        analytics={item}
                        cropName={selectedCrop.name}
                        cropColor={selectedCrop.color}
                        compact
                      />
                    </View>
                  ))}
                </Animated.View>
              ) : null}
            </>
          )}

          <View style={styles.footerNote}>
            <MaterialCommunityIcons name="information-outline" size={16} color={colors.textTertiary} />
            <Caption style={styles.footerText}>
              Curated varieties (Full guide) = complete fertilizer & spray data. Other varieties =
              live Agmarknet rates + general crop advice. Data refreshes from government mandi
              records daily.
            </Caption>
          </View>
        </View>
      </ScrollView>
    </KeyboardSafeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerWrap: {
    zIndex: 2,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  searchWrap: {
    zIndex: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  subtitle: { color: colors.textSecondary, lineHeight: 20 },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBox: {
    backgroundColor: `${colors.error}12`,
    padding: spacing.md,
    borderRadius: 8,
  },
  errorText: { color: colors.error },
  chipScroll: { marginHorizontal: -layout.screenPadding },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPadding,
  },
  section: { gap: spacing.lg },
  listItem: { marginBottom: spacing.sm },
  footerNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  footerText: { flex: 1, color: colors.textTertiary },
});
