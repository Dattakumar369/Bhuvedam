import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card } from '@/components/ui/Card';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import type { CropInfo } from '@/constants/crops';
import { fetchCropByIdFromBackend } from '@/services/crops/cropService';
import { useLanguageStore } from '@/store/languageStore';
import { colors, radius, spacing } from '@/theme';

interface CropCardProps {
  crop: CropInfo;
  index: number;
  onPress?: () => void;
  expanded?: boolean;
}

export function CropCard({ crop, index, onPress, expanded = false }: CropCardProps) {
  const language = useLanguageStore((s) => s.language);
  const [detail, setDetail] = useState<CropInfo | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const showFull = expanded || !onPress;
  const display = detail ?? crop;

  useEffect(() => {
    if (!showFull) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoadingDetail(true);

    void fetchCropByIdFromBackend(crop.id, language)
      .then((row) => {
        if (!cancelled && row) setDetail(row);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showFull, crop.id, language]);

  const card = (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${display.color}22` }]}>
          <MaterialCommunityIcons name={display.icon} size={28} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Title style={styles.name}>{display.nameTe}</Title>
          <Caption>{display.name}</Caption>
        </View>
        <View style={[styles.seasonBadge, seasonBadgeStyle(display.season)]}>
          <Label style={styles.seasonBadgeText}>{display.season.toUpperCase()}</Label>
        </View>
      </View>

      {showFull && (
        <>
          {loadingDetail && !detail ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            <>
              <View style={styles.metaRow}>
                <MetaItem icon="calendar-start" label="Sowing" value={display.sowingPeriod} />
                <MetaItem icon="calendar-check" label="Harvest" value={display.harvestPeriod} />
              </View>

              <View style={styles.metaRow}>
                <MetaItem icon="water" label="Water" value={display.waterNeeds} />
                <MetaItem icon="terrain" label="Soil" value={display.soilType} />
              </View>

              {display.tips.length > 0 && (
                <View style={styles.tipsSection}>
                  <Label style={styles.tipsTitle}>Farming Tips</Label>
                  {display.tips.map((tip) => (
                    <View key={tip} style={styles.tipRow}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={16}
                        color={colors.primaryLight}
                      />
                      <Body style={styles.tipText}>{tip}</Body>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </>
      )}

      {!showFull && (display.sowingPeriod || display.harvestPeriod) && (
        <View style={styles.metaRow}>
          <MetaItem icon="calendar-start" label="Sowing" value={display.sowingPeriod} />
          <MetaItem icon="calendar-check" label="Harvest" value={display.harvestPeriod} />
        </View>
      )}
    </Card>
  );

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      {onPress ? (
        <Pressable onPress={onPress}>{card}</Pressable>
      ) : (
        card
      )}
    </Animated.View>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  if (!value) return null;

  return (
    <View style={styles.metaItem}>
      <MaterialCommunityIcons name={icon} size={14} color={colors.primary} />
      <Caption style={styles.metaLabel}>{label}</Caption>
      <Body style={styles.metaValue} numberOfLines={2}>
        {value}
      </Body>
    </View>
  );
}

function seasonBadgeStyle(season: CropInfo['season']) {
  if (season === 'kharif') return { backgroundColor: `${colors.info}18` };
  if (season === 'rabi') return { backgroundColor: `${colors.accent}18` };
  return { backgroundColor: `${colors.primary}18` };
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  name: { fontSize: 18 },
  seasonBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  seasonBadgeText: { fontSize: 9, letterSpacing: 0.5 },
  loader: { marginVertical: spacing.md },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  metaItem: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 2,
  },
  metaLabel: { fontSize: 10, color: colors.textTertiary },
  metaValue: { fontSize: 12, lineHeight: 16, fontFamily: 'Poppins_500Medium' },
  tipsSection: { marginTop: spacing.sm, gap: spacing.sm },
  tipsTitle: { color: colors.primary, letterSpacing: 0.5 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  tipText: { flex: 1, color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
