import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, PrimaryInput, SearchInput } from '@/components/ui';
import { Body, Caption, Title } from '@/components/ui/Typography';
import { CROP_CATEGORY_EN, CROP_CATEGORY_TELUGU, CROPS } from '@/constants/crops';
import { cropLabelForLanguage, soilLabelForLanguage } from '@/constants/i18n/farmTranslations';
import { useTranslation } from '@/hooks/useTranslation';
import { useCropCatalogStore } from '@/store/cropCatalogStore';
import { SOIL_TYPE_OPTIONS } from '@/constants/soilTypes';
import { CropPlantingDetailsStep } from '@/features/crop/components/CropPlantingDetailsStep';
import type { FarmerCropPlanting } from '@/types/farmerCrop';
import { plantingIsComplete, syncPlantingsForCrops, farmLocationIsComplete } from '@/types/farmerCrop';
import { colors, radius, spacing } from '@/theme';

export interface FarmSetupWizardValues {
  selectedCrops: string[];
  cropPlantings: FarmerCropPlanting[];
  districtInput: string;
  mandalInput: string;
  villageInput: string;
  stateInput: string;
  selectedSoil: string;
}

interface FarmSetupWizardProps {
  initial: FarmSetupWizardValues;
  setupComplete: boolean;
  saving: boolean;
  onSave: (values: FarmSetupWizardValues) => Promise<void>;
}

export function FarmSetupWizard({
  initial,
  setupComplete,
  saving,
  onSave,
}: FarmSetupWizardProps) {
  const catalogCrops = useCropCatalogStore((s) => s.crops);
  const hydrateCrops = useCropCatalogStore((s) => s.hydrate);
  const cropsGroupedFn = useCropCatalogStore((s) => s.cropsGrouped);
  const catalogLoading = useCropCatalogStore((s) => s.loading);
  const { farm, language } = useTranslation();

  const [step, setStep] = useState(1);
  const [selectedCrops, setSelectedCrops] = useState(initial.selectedCrops);
  const [cropPlantings, setCropPlantings] = useState(initial.cropPlantings);
  const [districtInput, setDistrictInput] = useState(initial.districtInput);
  const [mandalInput, setMandalInput] = useState(initial.mandalInput);
  const [villageInput, setVillageInput] = useState(initial.villageInput);
  const [stateInput, setStateInput] = useState(initial.stateInput);
  const [selectedSoil, setSelectedSoil] = useState(initial.selectedSoil);
  const [cropSearch, setCropSearch] = useState('');

  useEffect(() => {
    void hydrateCrops(language);
  }, [hydrateCrops, language]);

  const cropsByGroup = useMemo(
    () => cropsGroupedFn(cropSearch),
    [cropSearch, cropsGroupedFn],
  );

  const totalCropCount = catalogCrops.length;
  const setupSteps = farm.setupSteps;
  const stepInfo = setupSteps[step - 1];
  const totalSteps = setupSteps.length;

  const toggleCrop = (cropId: string) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId) ? prev.filter((id) => id !== cropId) : [...prev, cropId],
    );
  };

  const canGoNext = (): boolean => {
    if (step === 1) return selectedCrops.length > 0;
    if (step === 2) return cropPlantings.every(plantingIsComplete);
    if (step === 3) {
      return farmLocationIsComplete({
        district: districtInput,
        mandal: mandalInput,
        village: villageInput,
        state: stateInput,
      });
    }
    return true;
  };

  const locationReady = farmLocationIsComplete({
    district: districtInput,
    mandal: mandalInput,
    village: villageInput,
    state: stateInput,
  });

  const goNext = () => {
    if (!canGoNext()) return;
    if (step === 1) {
      setCropPlantings((prev) => syncPlantingsForCrops(selectedCrops, prev));
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    void onSave({
      selectedCrops,
      cropPlantings,
      districtInput,
      mandalInput,
      villageInput,
      stateInput,
      selectedSoil,
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.progressRow}>
        {setupSteps.map((s, i) => (
          <View
            key={i}
            style={[styles.progressDot, i + 1 <= step && styles.progressDotActive]}
          />
        ))}
      </View>

      <Caption style={styles.stepCount}>{farm.stepCount(step, totalSteps)}</Caption>
      <Title style={styles.stepTitle}>{stepInfo?.title}</Title>
      <Body style={styles.stepHint}>{stepInfo?.hint}</Body>

      {step === 1 ? (
        <View style={styles.cropStep}>
          <Caption style={styles.cropCount}>{farm.cropSearchHint(totalCropCount)}</Caption>
          <SearchInput
            value={cropSearch}
            onChangeText={setCropSearch}
            placeholder={farm.cropSearchPlaceholder}
          />
          {selectedCrops.length > 0 ? (
            <Caption style={styles.selectedHint}>{farm.cropsSelected(selectedCrops.length)}</Caption>
          ) : null}
          <ScrollView style={styles.cropScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {catalogLoading && !catalogCrops.length ? (
              <Caption style={styles.noCrop}>{farm.cropsLoading}</Caption>
            ) : null}
            {[...cropsByGroup.entries()].map(([category, categoryCrops]) => (
              <View key={category} style={styles.categoryBlock}>
                <Body style={styles.categoryTitle}>
                  {language === 'te' ? CROP_CATEGORY_TELUGU[category as keyof typeof CROP_CATEGORY_TELUGU] : CROP_CATEGORY_EN[category as keyof typeof CROP_CATEGORY_EN]}
                </Body>
                <View style={styles.cropGrid}>
                  {categoryCrops.map((crop) => {
                    const selected = selectedCrops.includes(crop.id);
                    return (
                      <Pressable
                        key={crop.id}
                        onPress={() => toggleCrop(crop.id)}
                        style={[styles.cropTile, selected && styles.cropTileSelected]}
                      >
                        <MaterialCommunityIcons
                          name={crop.icon}
                          size={28}
                          color={selected ? colors.surface : colors.primary}
                        />
                        <Body style={[styles.cropTileText, selected && styles.cropTileTextSelected]}>
                          {cropLabelForLanguage(crop, language)}
                        </Body>
                        {selected ? (
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={18}
                            color={colors.surface}
                            style={styles.cropCheck}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
            {!catalogLoading && cropsByGroup.size === 0 ? (
              <Caption style={styles.noCrop}>{farm.noCropMatch}</Caption>
            ) : null}
          </ScrollView>
        </View>
      ) : null}

      {step === 2 ? (
        <CropPlantingDetailsStep plantings={cropPlantings} onChange={setCropPlantings} />
      ) : null}

      {step === 3 ? (
        <View style={styles.stepBody}>
          <PrimaryInput
            label={farm.district}
            value={districtInput}
            onChangeText={setDistrictInput}
            placeholder={farm.districtPh}
          />
          <PrimaryInput
            label={farm.mandal}
            value={mandalInput}
            onChangeText={setMandalInput}
            placeholder={farm.mandalPh}
          />
          <PrimaryInput
            label={farm.village}
            value={villageInput}
            onChangeText={setVillageInput}
            placeholder={farm.villagePh}
          />
          <PrimaryInput
            label={farm.state}
            value={stateInput}
            onChangeText={setStateInput}
            placeholder={farm.statePh}
          />
          <Caption style={styles.requiredHint}>{farm.addressRequiredHint}</Caption>
        </View>
      ) : null}

      {step === 4 ? (
        <View style={styles.soilGrid}>
          {SOIL_TYPE_OPTIONS.map((option) => {
            const selected = selectedSoil === option.id;
            const label = soilLabelForLanguage(option, language);
            return (
              <Pressable
                key={option.id}
                onPress={() => setSelectedSoil(selected ? '' : option.id)}
                style={[styles.soilTile, selected && styles.soilTileSelected]}
              >
                <Body style={[styles.soilTileText, selected && styles.soilTileTextSelected]}>
                  {label}
                </Body>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={styles.navRow}>
        {step > 1 ? (
          <Pressable onPress={goBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={22} color={colors.primary} />
            <Body style={styles.backText}>{farm.back}</Body>
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}

        {step < totalSteps ? (
          <Button
            label={farm.next}
            onPress={goNext}
            disabled={!canGoNext()}
            size="lg"
            fullWidth
            style={styles.nextBtn}
          />
        ) : (
          <Button
            label={saving ? farm.saving : setupComplete ? farm.saveChanges : farm.saveComplete}
            onPress={handleSave}
            loading={saving}
            disabled={
              !selectedCrops.length ||
              !cropPlantings.every(plantingIsComplete) ||
              !locationReady
            }
            size="lg"
            fullWidth
            style={styles.nextBtn}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  progressRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  progressDot: {
    width: 36,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  progressDotActive: { backgroundColor: colors.primary },
  stepCount: { textAlign: 'center', color: colors.textTertiary, fontSize: 12 },
  stepTitle: { textAlign: 'center', fontSize: 22, color: colors.primary },
  stepHint: { textAlign: 'center', color: colors.textSecondary, lineHeight: 22, fontSize: 15 },
  stepBody: { gap: spacing.sm },
  cropStep: { gap: spacing.sm, maxHeight: 420 },
  cropCount: { textAlign: 'center', color: colors.textSecondary, lineHeight: 18 },
  selectedHint: { textAlign: 'center', color: colors.success, fontFamily: 'Poppins_600SemiBold' },
  cropScroll: { maxHeight: 340 },
  categoryBlock: { gap: spacing.sm, marginBottom: spacing.md },
  categoryTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: colors.primary,
    paddingLeft: spacing.xxs,
  },
  noCrop: { textAlign: 'center', color: colors.textTertiary, paddingVertical: spacing.lg },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  cropTile: {
    width: '30%',
    minWidth: 96,
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    gap: spacing.xxs,
  },
  cropTileSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cropTileText: {
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
  },
  cropTileTextSelected: { color: colors.surface },
  cropCheck: { position: 'absolute', top: 6, right: 6 },
  optionalHint: { textAlign: 'center', color: colors.textTertiary },
  requiredHint: { textAlign: 'center', color: colors.textSecondary, lineHeight: 18 },
  soilGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  soilTile: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  soilTileSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  soilTileText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  soilTileTextSelected: { color: colors.surface },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minWidth: 80,
  },
  backText: { color: colors.primary, fontFamily: 'Poppins_600SemiBold' },
  nextBtn: { flex: 1 },
});
