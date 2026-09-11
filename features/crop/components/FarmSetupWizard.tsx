import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, PrimaryInput, SearchInput } from '@/components/ui';
import { Body, Caption, Title } from '@/components/ui/Typography';
import { CROP_CATEGORY_EN, CROP_CATEGORY_TELUGU, CROPS } from '@/constants/crops';
import {
  GEOGRAPHY_STATE_KEYS,
  geographyStateLabel,
  geographyStateNameEn,
  getDistrictOptions,
  getMandalOptions,
  getVillageOptions,
  matchAddressToLgd,
  resolveGeographyState,
} from '@/constants/geography';
import type { GeographyStateKey } from '@/constants/geography/types';
import { cropLabelForLanguage, soilLabelForLanguage } from '@/constants/i18n/farmTranslations';
import { MEEBHOOMI_URL } from '@/constants/meebhoomi';
import { GeographySelectField } from '@/features/farm/components/GeographySelectField';
import { useTranslation } from '@/hooks/useTranslation';
import { searchPlaces } from '@/services/geo/placeSearchService';
import { getCurrentLocation } from '@/services/location/locationService';
import type { PlaceSearchResult } from '@/types/location';
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
  surveyNumber: string;
  khataNumber: string;
  landExtentAcres: string;
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
  const [surveyNumber, setSurveyNumber] = useState(initial.surveyNumber);
  const [khataNumber, setKhataNumber] = useState(initial.khataNumber);
  const [landExtentAcres, setLandExtentAcres] = useState(initial.landExtentAcres);
  const [cropSearch, setCropSearch] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<PlaceSearchResult[]>([]);
  const [placeSearching, setPlaceSearching] = useState(false);
  const [addressHint, setAddressHint] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState(
    () => !resolveGeographyState(initial.stateInput),
  );

  const geoStateKey = resolveGeographyState(stateInput);
  const useLgdPickers = !manualAddress && geoStateKey != null;

  const districtOptions = useMemo(
    () => (geoStateKey ? getDistrictOptions(geoStateKey, language) : []),
    [geoStateKey, language],
  );
  const mandalOptions = useMemo(
    () =>
      geoStateKey && districtInput
        ? getMandalOptions(geoStateKey, districtInput, language)
        : [],
    [geoStateKey, districtInput, language],
  );
  const villageOptions = useMemo(
    () =>
      geoStateKey && districtInput && mandalInput
        ? getVillageOptions(geoStateKey, districtInput, mandalInput, language)
        : [],
    [geoStateKey, districtInput, mandalInput, language],
  );

  useEffect(() => {
    void hydrateCrops(language);
  }, [hydrateCrops, language]);

  const applyLgdMatch = (partial: {
    state?: string;
    district?: string;
    mandal?: string;
    village?: string;
  }) => {
    const matched = matchAddressToLgd(partial);
    if (matched.stateKey) {
      setManualAddress(false);
      setStateInput(matched.state ?? geographyStateNameEn(matched.stateKey));
      if (matched.district) setDistrictInput(matched.district);
      if (matched.mandal) setMandalInput(matched.mandal);
      if (matched.village) setVillageInput(matched.village);
      return true;
    }
    return false;
  };

  const selectGeographyState = (key: GeographyStateKey) => {
    setManualAddress(false);
    const nextName = geographyStateNameEn(key);
    if (resolveGeographyState(stateInput) !== key) {
      setDistrictInput('');
      setMandalInput('');
      setVillageInput('');
    }
    setStateInput(nextName);
  };

  const applyPlace = (place: PlaceSearchResult) => {
    const matched = applyLgdMatch({
      state: place.state,
      district: place.district,
      mandal: place.mandal,
      village: place.village,
    });
    if (!matched) {
      if (place.village) setVillageInput(place.village);
      if (place.mandal) setMandalInput(place.mandal);
      if (place.district) setDistrictInput(place.district);
      if (place.state) setStateInput(place.state);
      setManualAddress(true);
    }
    setPlaceQuery(place.label);
    setPlaceResults([]);
    setAddressHint(null);
  };

  const fillFromGps = async () => {
    setGpsLoading(true);
    setAddressHint(null);
    try {
      const loc = await getCurrentLocation();
      const matched = applyLgdMatch({
        state: loc.state,
        district: loc.district,
        mandal: loc.mandal,
        village: loc.village,
      });
      if (!matched) {
        if (loc.village) setVillageInput(loc.village);
        if (loc.mandal) setMandalInput(loc.mandal);
        if (loc.district) setDistrictInput(loc.district);
        if (loc.state) setStateInput(loc.state);
        setManualAddress(true);
      }
      if (!loc.village && !loc.mandal && loc.label) {
        setPlaceQuery(loc.label);
      }
    } catch {
      setAddressHint(farm.gpsFillFailed);
    } finally {
      setGpsLoading(false);
    }
  };

  useEffect(() => {
    const q = placeQuery.trim();
    if (q.length < 2) {
      setPlaceResults([]);
      setPlaceSearching(false);
      return;
    }

    setPlaceSearching(true);
    const timer = setTimeout(() => {
      void searchPlaces(q, { limit: 6, countryCode: 'in' }).then((results) => {
        setPlaceResults(results);
        setPlaceSearching(false);
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [placeQuery]);

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
    Keyboard.dismiss();
    if (step === 1) {
      setCropPlantings((prev) => syncPlantingsForCrops(selectedCrops, prev));
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const goBack = () => {
    Keyboard.dismiss();
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    Keyboard.dismiss();
    void onSave({
      selectedCrops,
      cropPlantings,
      districtInput,
      mandalInput,
      villageInput,
      stateInput,
      selectedSoil,
      surveyNumber,
      khataNumber,
      landExtentAcres,
    });
  };

  const openMeebhoomi = () => {
    void Linking.openURL(MEEBHOOMI_URL);
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
        <ScrollView
          style={styles.stepScroll}
          contentContainerStyle={styles.stepBody}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator
        >
          <Button
            label={gpsLoading ? farm.gpsFillLoading : farm.gpsFillAddress}
            onPress={() => void fillFromGps()}
            loading={gpsLoading}
            fullWidth
            size="md"
          />
          <SearchInput
            value={placeQuery}
            onChangeText={setPlaceQuery}
            placeholder={farm.placeSearchPlaceholder}
          />
          <Caption style={styles.placeHint}>{farm.placeSearchHint}</Caption>
          {placeSearching ? (
            <Caption style={styles.placeStatus}>{farm.placeSearchLoading}</Caption>
          ) : null}
          {placeResults.length > 0 ? (
            <View style={styles.placeList}>
              {placeResults.map((place) => (
                <Pressable
                  key={`${place.latitude}-${place.longitude}-${place.label}`}
                  onPress={() => applyPlace(place)}
                  style={styles.placeRow}
                >
                  <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
                  <Caption style={styles.placeRowText}>{place.label}</Caption>
                </Pressable>
              ))}
            </View>
          ) : placeQuery.trim().length >= 2 && !placeSearching ? (
            <Caption style={styles.placeStatus}>{farm.placeSearchNoResults}</Caption>
          ) : null}

          <Caption style={styles.filterLabel}>{farm.state}</Caption>
          <View style={styles.stateRow}>
            {GEOGRAPHY_STATE_KEYS.map((key) => {
              const selected = !manualAddress && geoStateKey === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => selectGeographyState(key)}
                  style={[styles.stateChip, selected && styles.stateChipSelected]}
                >
                  <Body style={[styles.stateChipText, selected && styles.stateChipTextSelected]}>
                    {geographyStateLabel(key, language)}
                  </Body>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => {
                setManualAddress(true);
                if (geoStateKey) setStateInput('');
              }}
              style={[styles.stateChip, manualAddress && styles.stateChipSelected]}
            >
              <Body style={[styles.stateChipText, manualAddress && styles.stateChipTextSelected]}>
                {farm.geographyManualEntry}
              </Body>
            </Pressable>
          </View>

          {useLgdPickers ? (
            <>
              <Caption style={styles.placeHint}>{farm.geographyLgdHint}</Caption>
              <GeographySelectField
                label={farm.district}
                value={districtInput}
                placeholder={farm.districtPh}
                searchPlaceholder={farm.geographySearchDistrict}
                options={districtOptions}
                onSelect={(opt) => {
                  setDistrictInput(opt.value);
                  setMandalInput('');
                  setVillageInput('');
                }}
              />
              <GeographySelectField
                label={farm.mandal}
                value={mandalInput}
                placeholder={farm.mandalPh}
                searchPlaceholder={farm.geographySearchMandal}
                options={mandalOptions}
                disabled={!districtInput}
                emptyMessage={farm.geographySelectDistrictFirst}
                onSelect={(opt) => {
                  setMandalInput(opt.value);
                  setVillageInput('');
                }}
              />
              <GeographySelectField
                label={farm.village}
                value={
                  villageOptions.find((o) => o.value === villageInput)?.label || villageInput
                }
                placeholder={farm.villagePh}
                searchPlaceholder={farm.geographySearchVillage}
                options={villageOptions}
                disabled={!mandalInput}
                emptyMessage={farm.geographySelectMandalFirst}
                onSelect={(opt) => setVillageInput(opt.value)}
              />
            </>
          ) : (
            <>
              <Caption style={styles.placeHint}>{farm.geographyManualHint}</Caption>
              <PrimaryInput
                label={farm.state}
                value={stateInput}
                onChangeText={setStateInput}
                placeholder={farm.statePh}
              />
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
            </>
          )}

          <Caption style={styles.requiredHint}>{farm.addressRequiredHint}</Caption>
          {addressHint ? <Caption style={styles.addressError}>{addressHint}</Caption> : null}

          <View style={styles.landRecordsBlock}>
            <Body style={styles.landRecordsTitle}>{farm.landRecordsTitle}</Body>
            <Caption style={styles.landRecordsHint}>{farm.landRecordsHint}</Caption>
            <Button
              label={farm.meebhoomiLookup}
              onPress={openMeebhoomi}
              fullWidth
              size="md"
              variant="outline"
            />
            <Caption style={styles.meebhoomiHint}>{farm.meebhoomiLookupHint}</Caption>
            <PrimaryInput
              label={farm.surveyNumber}
              value={surveyNumber}
              onChangeText={setSurveyNumber}
              placeholder={farm.surveyNumberPh}
            />
            <PrimaryInput
              label={farm.khataNumber}
              value={khataNumber}
              onChangeText={setKhataNumber}
              placeholder={farm.khataNumberPh}
            />
            <PrimaryInput
              label={farm.landExtent}
              value={landExtentAcres}
              onChangeText={setLandExtentAcres}
              placeholder={farm.landExtentPh}
              keyboardType="numeric"
            />
          </View>
        </ScrollView>
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
  stepScroll: { maxHeight: 440 },
  stepBody: { gap: spacing.sm, paddingBottom: spacing.md },
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
  filterLabel: { fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary, fontSize: 13 },
  stateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  stateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  stateChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stateChipText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: colors.textPrimary },
  stateChipTextSelected: { color: colors.surface },
  placeHint: { color: colors.textTertiary, lineHeight: 18, fontSize: 11 },
  placeStatus: { color: colors.textSecondary, textAlign: 'center' },
  placeList: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  placeRowText: { flex: 1, color: colors.textPrimary, lineHeight: 18 },
  addressError: { color: colors.error, textAlign: 'center', lineHeight: 18 },
  landRecordsBlock: {
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    backgroundColor: `${colors.primary}08`,
  },
  landRecordsTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: colors.primary,
  },
  landRecordsHint: { color: colors.textSecondary, lineHeight: 18, fontSize: 12 },
  meebhoomiHint: { color: colors.textTertiary, lineHeight: 16, fontSize: 11 },
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
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
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
