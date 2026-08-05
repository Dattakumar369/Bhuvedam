import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Header } from '@/components/ui';
import { Body, Caption, Title } from '@/components/ui/Typography';
import { FieldGpsMeasure } from '@/features/crop/components/FieldGpsMeasure';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import type { FieldMeasurement } from '@/types/fieldMeasure';
import { formatAreaDisplay } from '@/utils/geoArea';
import { colors, layout, spacing } from '@/theme';

export default function MeasureFieldScreen() {
  const insets = useSafeAreaInsets();
  const fieldMeasurement = useFarmerContextStore((s) => s.fieldMeasurement);
  const setFieldMeasurement = useFarmerContextStore((s) => s.setFieldMeasurement);
  const [saved, setSaved] = useState(false);

  const handleApply = async (measurement: FieldMeasurement) => {
    await setFieldMeasurement(measurement);
    setSaved(true);
  };

  const lastDisplay =
    fieldMeasurement != null
      ? formatAreaDisplay(fieldMeasurement.areaAcres, fieldMeasurement.areaCents, 'gps')
      : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Polam Koluvu" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="elevated" style={styles.intro}>
          <Title style={styles.introTitle}>GPS tho polam kolavandi</Title>
          <Body style={styles.introBody}>
            Moolalu pin mode (★) — prati corner daggar “add” nokki, 3–5 sec nilchondi (stable ayyaka
            auto save). Walk mode lo polam chuttu tirigi start point daggariki vachaka Stop nokki.
          </Body>
          <Caption style={styles.introNote}>
            GPS ±2–5m error untundi — exact size ki patta/tape measure use cheyandi. Open sky must.
          </Caption>
        </Card>

        {lastDisplay && !saved ? (
          <Card variant="outlined" style={styles.lastBox}>
            <Caption style={styles.lastLabel}>Last GPS measurement</Caption>
            <Body style={styles.lastValue}>{lastDisplay.primary}</Body>
            <Caption style={styles.lastSub}>{lastDisplay.secondary}</Caption>
          </Card>
        ) : null}

        {saved && lastDisplay ? (
          <Card variant="elevated" style={styles.savedBox}>
            <Caption style={styles.savedLabel}>✓ Saved</Caption>
            <Body style={styles.savedValue}>{lastDisplay.primary}</Body>
            <Caption style={styles.savedSub}>{lastDisplay.secondary}</Caption>
          </Card>
        ) : null}

        <FieldGpsMeasure
          initialPoints={fieldMeasurement?.points ?? []}
          onApply={(m) => void handleApply(m)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  intro: { gap: spacing.sm, padding: spacing.lg },
  introTitle: { fontSize: 20, color: colors.primary },
  introBody: { color: colors.textSecondary, lineHeight: 22 },
  introNote: { color: colors.textTertiary, lineHeight: 18 },
  lastBox: { gap: spacing.xxs, padding: spacing.md, alignItems: 'center' },
  lastLabel: { color: colors.textTertiary },
  lastValue: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: colors.primary },
  lastSub: { color: colors.textSecondary },
  savedBox: {
    gap: spacing.xxs,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: `${colors.success}10`,
    borderColor: `${colors.success}40`,
  },
  savedLabel: { color: colors.success, fontFamily: 'Poppins_600SemiBold' },
  savedValue: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: colors.primary },
  savedSub: { color: colors.textSecondary },
});
