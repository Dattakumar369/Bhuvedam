import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryInput } from '@/components/ui';
import { Body, Caption, Title } from '@/components/ui/Typography';
import { CROPS } from '@/constants/crops';
import { getCuratedVarieties } from '@/constants/cropVarieties';
import { cropLabelForLanguage, monthLabelForLanguage } from '@/constants/i18n/farmTranslations';
import { SOWING_MONTHS } from '@/constants/sowingMonths';
import { useTranslation } from '@/hooks/useTranslation';
import type { FarmerCropPlanting } from '@/types/farmerCrop';
import { colors, radius, spacing } from '@/theme';

interface CropPlantingDetailsStepProps {
  plantings: FarmerCropPlanting[];
  onChange: (plantings: FarmerCropPlanting[]) => void;
}

export function CropPlantingDetailsStep({ plantings, onChange }: CropPlantingDetailsStepProps) {
  const { farm, language } = useTranslation();

  const updatePlanting = (cropId: string, patch: Partial<FarmerCropPlanting>) => {
    onChange(plantings.map((p) => (p.cropId === cropId ? { ...p, ...patch } : p)));
  };

  return (
    <ScrollView style={styles.scroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
      {plantings.map((planting, index) => {
        const crop = CROPS.find((c) => c.id === planting.cropId);
        const cropLabel = crop ? cropLabelForLanguage(crop, language) : planting.cropId;
        const varieties = getCuratedVarieties(planting.cropId).slice(0, 4);

        return (
          <View key={planting.cropId} style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name={crop?.icon ?? 'sprout'} size={24} color={colors.primary} />
              <Title style={styles.cropName}>
                {index + 1}. {cropLabel}
              </Title>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <PrimaryInput
                  label={farm.acres}
                  value={planting.areaAcres}
                  onChangeText={(v) => updatePlanting(planting.cropId, { areaAcres: v })}
                  placeholder="2"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <PrimaryInput
                  label={farm.centsOptional}
                  value={planting.areaCents}
                  onChangeText={(v) => updatePlanting(planting.cropId, { areaCents: v })}
                  placeholder="50"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <PrimaryInput
              label={farm.variety}
              value={planting.varietyName}
              onChangeText={(v) => updatePlanting(planting.cropId, { varietyName: v })}
              placeholder={farm.varietyPh}
            />

            {varieties.length > 0 ? (
              <View style={styles.chipRow}>
                <Caption style={styles.chipHint}>{farm.quickPick}</Caption>
                <View style={styles.chips}>
                  {varieties.map((v) => {
                    const vLabel = language === 'te' ? v.nameTe || v.name : v.name;
                    const selected = planting.varietyName === v.nameTe || planting.varietyName === v.name;
                    return (
                      <Pressable
                        key={v.id}
                        onPress={() =>
                          updatePlanting(planting.cropId, { varietyName: v.nameTe || v.name })
                        }
                        style={[styles.chip, selected && styles.chipSelected]}
                      >
                        <Caption style={[styles.chipText, selected && styles.chipTextSelected]}>
                          {vLabel}
                        </Caption>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <Caption style={styles.monthLabel}>{farm.sowingMonth}</Caption>
            <View style={styles.monthGrid}>
              {SOWING_MONTHS.map((month) => {
                const selected = planting.sowingMonth === month.id;
                return (
                  <Pressable
                    key={month.id}
                    onPress={() => updatePlanting(planting.cropId, { sowingMonth: month.id })}
                    style={[styles.monthChip, selected && styles.monthChipSelected]}
                  >
                    <Caption style={[styles.monthText, selected && styles.monthTextSelected]}>
                      {monthLabelForLanguage(month, language)}
                    </Caption>
                  </Pressable>
                );
              })}
            </View>

            <PrimaryInput
              label={farm.year}
              value={planting.sowingYear}
              onChangeText={(v) => updatePlanting(planting.cropId, { sowingYear: v })}
              placeholder={String(new Date().getFullYear())}
              keyboardType="numeric"
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 420 },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cropName: { fontSize: 18, color: colors.primary, flex: 1 },
  row: { flexDirection: 'row', gap: spacing.sm },
  halfInput: { flex: 1 },
  chipRow: { gap: spacing.xxs },
  chipHint: { color: colors.textTertiary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceVariant,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12 },
  chipTextSelected: { color: colors.surface },
  monthLabel: { color: colors.textSecondary, fontFamily: 'Poppins_600SemiBold', marginTop: spacing.xxs },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  monthChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceVariant,
  },
  monthChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  monthText: { fontSize: 11 },
  monthTextSelected: { color: colors.surface },
});
