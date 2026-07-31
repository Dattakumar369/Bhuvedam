import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui';
import { Body, Caption, Title } from '@/components/ui/Typography';
import { CROPS } from '@/constants/crops';
import { sowingMonthLabel } from '@/constants/sowingMonths';
import { getSoilTypeLabel } from '@/constants/soilTypes';
import { cropLabelForLanguage } from '@/constants/i18n/farmTranslations';
import {
  FarmSetupWizard,
  type FarmSetupWizardValues,
} from '@/features/crop/components/FarmSetupWizard';
import { useTranslation } from '@/hooks/useTranslation';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useWeatherStore } from '@/store/weatherStore';
import { colors, radius, spacing } from '@/theme';

export function FarmerFarmSetup() {
  const { farm, app, language } = useTranslation();
  const crops = useFarmerContextStore((s) => s.crops);
  const cropPlantings = useFarmerContextStore((s) => s.cropPlantings);
  const district = useFarmerContextStore((s) => s.district);
  const mandal = useFarmerContextStore((s) => s.mandal);
  const village = useFarmerContextStore((s) => s.village);
  const state = useFarmerContextStore((s) => s.state);
  const soilType = useFarmerContextStore((s) => s.soilType);
  const soilProfile = useFarmerContextStore((s) => s.soilProfile);
  const soilLoading = useFarmerContextStore((s) => s.soilLoading);
  const setupComplete = useFarmerContextStore((s) => s.setupComplete);
  const syncError = useFarmerContextStore((s) => s.syncError);
  const clearSyncError = useFarmerContextStore((s) => s.clearSyncError);
  const saveFarmSetup = useFarmerContextStore((s) => s.saveFarmSetup);
  const fetchSoilFromLocation = useFarmerContextStore((s) => s.fetchSoilFromLocation);
  const needsSetup = useFarmerContextStore((s) => s.needsSetup);

  const weatherLocation = useWeatherStore((s) => s.location);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!weatherLocation) return;
    if (soilProfile || soilLoading) return;
    void fetchSoilFromLocation(weatherLocation.latitude, weatherLocation.longitude);
  }, [weatherLocation, soilProfile, soilLoading, fetchSoilFromLocation]);

  const showForm = needsSetup() || editing;

  const wizardInitial: FarmSetupWizardValues = {
    selectedCrops: crops,
    cropPlantings: cropPlantings.length
      ? cropPlantings
      : crops.map((id) => ({
          cropId: id,
          varietyName: '',
          areaAcres: '',
          areaCents: '',
          sowingMonth: '',
          sowingYear: String(new Date().getFullYear()),
        })),
    districtInput: district ?? '',
    mandalInput: mandal ?? '',
    villageInput: village ?? '',
    stateInput: state ?? '',
    selectedSoil: soilType ?? '',
  };

  const handleSave = async (values: FarmSetupWizardValues) => {
    if (!values.selectedCrops.length) return;

    setSaving(true);
    try {
      await saveFarmSetup({
        crops: values.selectedCrops,
        cropPlantings: values.cropPlantings,
        district: values.districtInput.trim(),
        mandal: values.mandalInput.trim(),
        village: values.villageInput.trim(),
        state: values.stateInput.trim(),
        soilType: values.selectedSoil || undefined,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const cropSummary =
    cropPlantings.length > 0
      ? cropPlantings
          .map((p) => {
            const c = CROPS.find((crop) => crop.id === p.cropId);
            const name = c ? cropLabelForLanguage(c, language) : p.cropId;
            const area = p.areaAcres
              ? `${p.areaAcres} ${farm.acresShort}`
              : p.areaCents
                ? `${p.areaCents} ${farm.centsShort}`
                : '';
            const month = p.sowingMonth ? sowingMonthLabel(p.sowingMonth, language) : '';
            const variety = p.varietyName.trim();
            return [name, area, variety, month].filter(Boolean).join(' · ');
          })
          .join('\n')
      : crops
          .map((id) => {
            const c = CROPS.find((crop) => crop.id === id);
            return c ? cropLabelForLanguage(c, language) : id;
          })
          .join(', ');

  const locationLabel = [village, mandal, district, state].filter(Boolean).join(', ');
  const soilLabel = getSoilTypeLabel(soilType, language);

  if (!showForm && setupComplete) {
    return (
      <Card variant="elevated" style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <MaterialCommunityIcons name="barley" size={28} color={colors.primary} />
          <Title style={styles.summaryTitle}>{farm.myFarm}</Title>
          <Pressable onPress={() => setEditing(true)} style={styles.editBtn}>
            <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
            <Caption style={styles.editLink}>{farm.edit}</Caption>
          </Pressable>
        </View>

        <SummaryTile icon="sprout" label={farm.crops} value={cropSummary} />
        {locationLabel ? (
          <SummaryTile icon="map-marker" label={farm.address} value={locationLabel} />
        ) : null}
        {soilLabel ? <SummaryTile icon="terrain" label={farm.soil} value={soilLabel} /> : null}
        {soilProfile?.ph != null ? (
          <Caption style={styles.phHint}>{farm.soilPh(soilProfile.ph)}</Caption>
        ) : soilLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Caption>{farm.soilLoading}</Caption>
          </View>
        ) : null}

        {syncError ? (
          <Pressable onPress={() => clearSyncError()} style={styles.syncError}>
            <MaterialCommunityIcons name="cloud-off-outline" size={18} color={colors.error} />
            <Caption style={styles.syncErrorText}>{app.syncFailed}</Caption>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => router.push('/pathakalu' as Href)}
          style={styles.measureLink}
        >
          <MaterialCommunityIcons name="bank-outline" size={20} color={colors.primary} />
          <Body style={styles.measureLinkText}>{farm.schemesLink}</Body>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
        </Pressable>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={styles.setupCard}>
      <View style={styles.setupBanner}>
        <MaterialCommunityIcons name="seed-outline" size={32} color={colors.primary} />
        <Title style={styles.welcomeTitle}>
          {setupComplete ? farm.welcomeEdit : farm.welcome}
        </Title>
        <Body style={styles.welcomeHint}>
          {setupComplete ? farm.welcomeHint : farm.welcomeHintNew}
        </Body>
      </View>

      <FarmSetupWizard
        key={editing ? 'edit' : setupComplete ? 'done' : 'new'}
        initial={wizardInitial}
        setupComplete={setupComplete}
        saving={saving}
        onSave={handleSave}
      />

      {setupComplete && editing ? (
        <Pressable onPress={() => setEditing(false)} style={styles.cancelBtn}>
          <Caption style={styles.cancelText}>{farm.cancel}</Caption>
        </Pressable>
      ) : null}
    </Card>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.tile}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
      <View style={styles.tileText}>
        <Caption style={styles.tileLabel}>{label}</Caption>
        <Body style={styles.tileValue}>{value}</Body>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  setupCard: { gap: spacing.md, padding: spacing.lg },
  setupBanner: { alignItems: 'center', gap: spacing.xs },
  welcomeTitle: { fontSize: 22, color: colors.primary, textAlign: 'center' },
  welcomeHint: { textAlign: 'center', color: colors.textSecondary, lineHeight: 22 },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  cancelText: { color: colors.textTertiary, fontSize: 15 },
  summaryCard: { gap: spacing.md, padding: spacing.lg },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  summaryTitle: { flex: 1, fontSize: 20, color: colors.primary },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editLink: { color: colors.primary, fontFamily: 'Poppins_600SemiBold' },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  tileText: { flex: 1, gap: 2 },
  tileLabel: { color: colors.textTertiary, fontSize: 12 },
  tileValue: { fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
  phHint: { textAlign: 'center', color: colors.textSecondary },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  measureLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    backgroundColor: `${colors.primary}08`,
  },
  measureLinkText: { flex: 1, color: colors.primary, fontFamily: 'Poppins_600SemiBold' },
  syncError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: `${colors.error}10`,
  },
  syncErrorText: { flex: 1, color: colors.error },
});
