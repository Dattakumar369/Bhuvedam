import { StyleSheet, View } from 'react-native';

import { PrimaryInput } from '@/components/ui';
import { Caption, Label } from '@/components/ui/Typography';
import {
  acresToCents,
  centsToAcres,
  parseAcresInput,
  parseCentsInput,
  roundAcres,
  roundCents,
} from '@/utils/geoArea';
import { colors, radius, spacing } from '@/theme';

interface AreaInputProps {
  centsValue: string;
  acresValue: string;
  onCentsChange: (cents: string) => void;
  onAcresChange: (acres: string) => void;
  compact?: boolean;
  centsPlaceholder?: string;
  acresPlaceholder?: string;
}

export function AreaInput({
  centsValue,
  acresValue,
  onCentsChange,
  onAcresChange,
  compact = false,
  centsPlaceholder = 'ఉదా: 250',
  acresPlaceholder = 'ఉదా: 2.5',
}: AreaInputProps) {
  const handleCentsChange = (text: string) => {
    onCentsChange(text);
    const cents = parseCentsInput(text);
    if (cents != null) {
      onAcresChange(String(roundAcres(centsToAcres(cents))));
    } else if (!text.trim()) {
      onAcresChange('');
    }
  };

  const handleAcresChange = (text: string) => {
    onAcresChange(text);
    const acres = parseAcresInput(text);
    if (acres != null) {
      onCentsChange(String(roundCents(acresToCents(acres))));
    } else if (!text.trim()) {
      onCentsChange('');
    }
  };

  const cents = parseCentsInput(centsValue);
  const acres = parseAcresInput(acresValue);
  const hasValue = cents != null || acres != null;

  return (
    <View style={styles.wrap}>
      {!compact ? (
        <>
          <Label style={styles.title}>Polam size / పొలం విస్తీర్ణం *</Label>
          <Caption style={styles.hint}>1 acre = 100 cents</Caption>
        </>
      ) : null}

      <PrimaryInput
        label="సెంట్లు"
        value={centsValue}
        onChangeText={handleCentsChange}
        placeholder={centsPlaceholder}
        keyboardType="numeric"
      />

      <PrimaryInput
        label="ఎకరాలు"
        value={acresValue}
        onChangeText={handleAcresChange}
        placeholder={acresPlaceholder}
        keyboardType="numeric"
      />

      {hasValue && cents != null ? (
        <View style={styles.preview}>
          <Caption style={styles.previewPrimary}>{cents} సెంట్లు</Caption>
          <Caption style={styles.previewSecondary}>
            = {acres ?? roundAcres(centsToAcres(cents))} ఎకరాలు
          </Caption>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  title: { color: colors.primary, letterSpacing: 0.3 },
  hint: { color: colors.textTertiary, marginBottom: spacing.xs, lineHeight: 18 },
  preview: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 2,
  },
  previewPrimary: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: colors.primary,
  },
  previewSecondary: { color: colors.textSecondary },
});
