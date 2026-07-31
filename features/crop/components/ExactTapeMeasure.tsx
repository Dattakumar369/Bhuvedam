import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryInput } from '@/components/ui';
import { Body, Caption, Label } from '@/components/ui/Typography';
import { areaFromRectangleMeters, formatAreaDisplay, parseMetersInput } from '@/utils/geoArea';
import { colors, radius, spacing } from '@/theme';

interface ExactTapeMeasureProps {
  lengthInput: string;
  widthInput: string;
  onLengthChange: (v: string) => void;
  onWidthChange: (v: string) => void;
  onAreaChange: (cents: string, acres: string) => void;
  lengthM?: number;
  widthM?: number;
}

export function ExactTapeMeasure({
  lengthInput,
  widthInput,
  onLengthChange,
  onWidthChange,
  onAreaChange,
}: ExactTapeMeasureProps) {
  useEffect(() => {
    const len = parseMetersInput(lengthInput);
    const wid = parseMetersInput(widthInput);
    if (!len || !wid) return;
    const area = areaFromRectangleMeters(len, wid);
    if (!area) return;
    onAreaChange(String(area.areaCents), String(area.areaAcres));
  }, [lengthInput, widthInput, onAreaChange]);

  const len = parseMetersInput(lengthInput);
  const wid = parseMetersInput(widthInput);
  const area = len && wid ? areaFromRectangleMeters(len, wid) : null;
  const display = area ? formatAreaDisplay(area.areaAcres, area.areaCents, 'tape') : null;

  return (
    <View style={styles.wrap}>
      <Label style={styles.title}>📏 లేఖీతో కొలవండి</Label>
      <Caption style={styles.help}>
        పొలం పొడవు × వెడల్పు ని lekha tho measure chesi meters lo enter cheyandi.
        {'\n'}
        2 cent ≈ 20m×20m, 3 cent ≈ 25m×25m — chinna polam ki idi best (GPS kante exact).
      </Caption>

      <PrimaryInput
        label="పొడవు (మీటర్లు)"
        value={lengthInput}
        onChangeText={onLengthChange}
        placeholder="ఉదా: 20"
        keyboardType="numeric"
      />
      <PrimaryInput
        label="వెడల్పు (మీటర్లు)"
        value={widthInput}
        onChangeText={onWidthChange}
        placeholder="ఉదా: 20"
        keyboardType="numeric"
      />

      {display && area ? (
        <View style={styles.result}>
          <Caption style={styles.badge}>{display.badge}</Caption>
          <Body style={styles.cents}>{display.primary}</Body>
          <Caption style={styles.acres}>{display.secondary}</Caption>
          <Caption style={styles.sub}>
            {Math.round(area.areaSqMeters)} sq.m · {len}m × {wid}m exact
          </Caption>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: `${colors.success}08`,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: { color: colors.success },
  help: { color: colors.textSecondary, lineHeight: 18 },
  result: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  badge: { color: colors.success, fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  cents: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: colors.primary },
  acres: { color: colors.textSecondary },
  sub: { color: colors.textTertiary, marginTop: spacing.xxs },
});
