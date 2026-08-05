import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, Header, SearchInput, SectionTitle } from '@/components/ui';
import { Body, Caption } from '@/components/ui/Typography';
import { CROPS } from '@/constants/crops';
import { FertilizerCard } from '@/features/cropProtection/components/FertilizerCard';
import { GenericVarietyAdviceCard } from '@/features/cropProtection/components/GenericVarietyAdviceCard';
import { SprayAdvisoryCard } from '@/features/cropProtection/components/SprayAdvisoryCard';
import { VarietyDetailCard } from '@/features/mandi/components/VarietyDetailCard';
import { VarietyPicker } from '@/features/mandi/components/VarietyPicker';
import { useMandiStore } from '@/store/mandiStore';
import {
  agCatalogService,
  type BulkCatalogStats,
  type DbCropDisease,
} from '@/services/cropProtection/agCatalogService';
import {
  getAdviceByDisease,
  getAdviceByStage,
  getDiseasesForCrop,
  getStagesForCrop,
} from '@/services/cropProtection/protectionAdvisor';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { CropDisease, FertilizerRecommendation, SprayRecommendation } from '@/types/cropProtection';
import { colors, layout, radius, spacing } from '@/theme';

type Mode = 'stage' | 'disease';

export default function CropProtectionScreen() {
  const insets = useSafeAreaInsets();
  const { screens } = useTranslation();
  const farmerCrops = useFarmerContextStore((s) => s.crops);
  const defaultCrop = farmerCrops[0] ?? 'rice';
  const fetchRates = useMandiStore((s) => s.fetchRates);
  const getVarietyList = useMandiStore((s) => s.getVarietyList);

  const [cropId, setCropId] = useState(defaultCrop);
  const [mode, setMode] = useState<Mode>('stage');
  const [stageId, setStageId] = useState('');
  const [diseaseId, setDiseaseId] = useState('');
  const [varietyId, setVarietyId] = useState('');
  const [varietySearch, setVarietySearch] = useState('');
  const [search, setSearch] = useState('');
  const [catalogStats, setCatalogStats] = useState<BulkCatalogStats | null>(null);
  const [apiDiseases, setApiDiseases] = useState<DbCropDisease[]>([]);
  const [apiFertilizers, setApiFertilizers] = useState<FertilizerRecommendation[]>([]);
  const [apiSprays, setApiSprays] = useState<SprayRecommendation[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  useEffect(() => {
    void fetchRates();
    void agCatalogService.getStats().then(setCatalogStats);
  }, [fetchRates]);

  const stages = getStagesForCrop(cropId);
  const staticDiseases = getDiseasesForCrop(cropId);

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const dbDiseases = await agCatalogService.getDiseases({
        cropId,
        search: search.trim() || undefined,
        limit: 80,
      });
      setApiDiseases(dbDiseases);

      if (mode === 'stage') {
        const stageKey = stageId || stages[0]?.id || 'vegetative';
        const advice = await agCatalogService.getAdviceForStage(cropId, stageKey);
        if (advice.fertilizers.length || advice.sprays.length) {
          setApiFertilizers(advice.fertilizers);
          setApiSprays(advice.sprays);
        } else {
          const fallback = getAdviceByStage(cropId, stageKey);
          setApiFertilizers(fallback.fertilizers);
          setApiSprays(fallback.sprays);
        }
      } else {
        const activeId = diseaseId || dbDiseases[0]?.id || staticDiseases[0]?.id;
        const dbDis = dbDiseases.find((d) => d.id === activeId);
        if (dbDis) {
          const { sprays } = await agCatalogService.getAdviceForDisease(cropId, dbDis);
          setApiFertilizers([]);
          setApiSprays(sprays);
        } else if (activeId) {
          const fallback = getAdviceByDisease(cropId, activeId);
          setApiFertilizers(fallback.fertilizers);
          setApiSprays(fallback.sprays);
        }
      }
    } catch {
      const stageKey = stageId || stages[0]?.id || '';
      if (mode === 'stage' && stageKey) {
        const fallback = getAdviceByStage(cropId, stageKey);
        setApiFertilizers(fallback.fertilizers);
        setApiSprays(fallback.sprays);
      }
      setApiDiseases([]);
    } finally {
      setCatalogLoading(false);
    }
  }, [cropId, mode, stageId, diseaseId, search, stages, staticDiseases]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const varietyList = getVarietyList(cropId);
  const selectedEntry = varietyList.find((v) => v.id === varietyId) ?? varietyList[0];
  const cropName = CROPS.find((c) => c.id === cropId)?.name ?? cropId;

  const diseases: CropDisease[] = useMemo(() => {
    if (apiDiseases.length) {
      return apiDiseases.map((d) =>
        agCatalogService.mapDisease(d, apiSprays.slice(0, 3)),
      );
    }
    const q = search.trim().toLowerCase();
    if (!q) return staticDiseases;
    return staticDiseases.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.nameTe.toLowerCase().includes(q) ||
        d.symptoms.toLowerCase().includes(q),
    );
  }, [apiDiseases, apiSprays, search, staticDiseases]);

  const activeStageId = stageId || stages[0]?.id || '';
  const activeDiseaseId = diseaseId || diseases[0]?.id || '';

  const fertilizers = apiFertilizers;
  const sprays = apiSprays;

  return (
    <View style={styles.container}>
      <Header title={screens.cropProtTitle} showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Caption style={styles.subtitle}>{screens.cropProtSubtitle}</Caption>

          {catalogStats ? (
            <View style={styles.statsRow}>
              <StatPill label={screens.statFertilizers} value={catalogStats.fertilizers} target={1000} />
              <StatPill label={screens.statPesticides} value={catalogStats.pesticides} target={2000} />
              <StatPill label={screens.statFungicides} value={catalogStats.fungicides} target={1000} />
              <StatPill label={screens.statDiseases} value={catalogStats.diseases} target={2000} />
              <StatPill label={screens.statCrops} value={catalogStats.crops} target={250} />
            </View>
          ) : null}

          {catalogLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.sm }} />
          ) : null}

          <SectionTitle title={screens.cropProtSelectCrop} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {CROPS.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  selected={cropId === c.id}
                  onPress={() => {
                    setCropId(c.id);
                    setStageId('');
                    setDiseaseId('');
                    setVarietyId('');
                    setVarietySearch('');
                  }}
                />
              ))}
            </View>
          </ScrollView>

          {varietyList.length > 0 ? (
            <>
              <SectionTitle title={screens.cropProtSelectVariety} />
              <SearchInput
                placeholder={screens.cropProtVarietySearch}
                value={varietySearch}
                onChangeText={setVarietySearch}
              />
              <VarietyPicker
                varieties={varietyList}
                selectedId={selectedEntry?.id ?? null}
                onSelect={setVarietyId}
                search={varietySearch}
              />
              {selectedEntry?.isCurated && selectedEntry.curated ? (
                <VarietyDetailCard variety={selectedEntry.curated} />
              ) : selectedEntry ? (
                <GenericVarietyAdviceCard entry={selectedEntry} cropName={cropName} />
              ) : null}
            </>
          ) : null}

          <View style={styles.modeRow}>
            <ModeButton
              label={screens.cropProtByStage}
              icon="timeline-clock-outline"
              active={mode === 'stage'}
              onPress={() => setMode('stage')}
            />
            <ModeButton
              label={screens.cropProtByDisease}
              icon="bug-outline"
              active={mode === 'disease'}
              onPress={() => setMode('disease')}
            />
          </View>

          {mode === 'stage' ? (
            <>
              <SectionTitle title={screens.cropProtStage} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {stages.map((s) => (
                    <Chip
                      key={s.id}
                      label={`${s.nameTe} (${s.daysRange})`}
                      selected={activeStageId === s.id}
                      onPress={() => setStageId(s.id)}
                    />
                  ))}
                </View>
              </ScrollView>
            </>
          ) : (
            <>
              <SearchInput
                placeholder={screens.cropProtDiseaseSearch}
                value={search}
                onChangeText={setSearch}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {diseases.map((d) => (
                    <Chip
                      key={d.id}
                      label={d.nameTe}
                      selected={activeDiseaseId === d.id}
                      onPress={() => setDiseaseId(d.id)}
                    />
                  ))}
                </View>
              </ScrollView>
              {diseases[0] ? (
                <CardHint
                  title={screens.cropProtSymptoms}
                  text={
                    diseases.find((d) => d.id === activeDiseaseId)?.symptomsTe ??
                    diseases[0].symptomsTe
                  }
                />
              ) : (
                <Caption style={styles.empty}>{screens.cropProtNoDisease}</Caption>
              )}
            </>
          )}

          {fertilizers.length > 0 ? (
            <>
              <SectionTitle title={screens.cropProtFertilizers} />
              {fertilizers.map((f) => (
                <FertilizerCard key={`${f.name}-${f.timing}`} item={f} />
              ))}
            </>
          ) : null}

          {sprays.length > 0 ? (
            <>
              <SectionTitle title={screens.cropProtSprays} />
              {sprays.map((s) => (
                <SprayAdvisoryCard key={s.id} item={s} />
              ))}
            </>
          ) : (
            <Caption style={styles.empty}>{screens.cropProtNoSpray}</Caption>
          )}

          <View style={styles.disclaimer}>
            <MaterialCommunityIcons name="information-outline" size={16} color={colors.textTertiary} />
            <Caption style={styles.disclaimerText}>{screens.cropProtDisclaimer}</Caption>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ModeButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.modeBtn, active && styles.modeBtnActive]}
    >
      <MaterialCommunityIcons name={icon} size={18} color={active ? colors.primary : colors.textSecondary} />
      <Caption style={active ? { color: colors.primary, fontFamily: 'Poppins_600SemiBold' } : undefined}>
        {label}
      </Caption>
    </Pressable>
  );
}

function CardHint({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.hintBox}>
      <Body style={styles.hintTitle}>{title}</Body>
      <Caption>{text}</Caption>
    </View>
  );
}

function StatPill({ label, value, target }: { label: string; value: number; target: number }) {
  const ok = value >= target;
  return (
    <View style={[styles.statPill, ok && styles.statPillOk]}>
      <Caption style={styles.statValue}>{value.toLocaleString()}</Caption>
      <Caption style={styles.statLabel}>{label}</Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: layout.screenPadding, gap: spacing.lg, paddingTop: spacing.md },
  subtitle: { color: colors.textSecondary, lineHeight: 20 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 72,
    alignItems: 'center',
  },
  statPillOk: { borderColor: colors.success, backgroundColor: `${colors.success}10` },
  statValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  statLabel: { fontSize: 10, color: colors.textTertiary },
  chipRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeBtnActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
  hintBox: {
    backgroundColor: `${colors.warning}12`,
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.xs,
  },
  hintTitle: { fontFamily: 'Poppins_600SemiBold' },
  empty: { textAlign: 'center', color: colors.textTertiary, padding: spacing.lg },
  disclaimer: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  disclaimerText: { flex: 1, color: colors.textTertiary, fontStyle: 'italic' },
});
