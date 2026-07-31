import { StyleSheet, View } from 'react-native';

import { Caption, Label } from '@/components/ui/Typography';
import { AreaInput } from '@/features/crop/components/AreaInput';
import { colors, radius, spacing } from '@/theme';

interface PattaExactAreaProps {
  centsValue: string;
  acresValue: string;
  onCentsChange: (v: string) => void;
  onAcresChange: (v: string) => void;
}

/** Exact area from land patta / survey / passbook document */
export function PattaExactArea({
  centsValue,
  acresValue,
  onCentsChange,
  onAcresChange,
}: PattaExactAreaProps) {
  return (
    <View style={styles.wrap}>
      <Label style={styles.title}>📄 పట్టా / పాస్‌బుక్ నుండి</Label>
      <Caption style={styles.help}>
        Papers lo rasina సెంట్లు or ఎకరాలు type cheyandi. Idi exact — government record.
        {'\n'}
        2–3 cent chinna polam unte kuda — direct ga “2” or “3” cents enter cheyandi. GPS avasaram ledu.
      </Caption>
      <AreaInput
        centsValue={centsValue}
        acresValue={acresValue}
        onCentsChange={onCentsChange}
        onAcresChange={onAcresChange}
        compact
        centsPlaceholder="ఉదా: 2"
      />
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
    gap: spacing.xs,
  },
  title: { color: colors.success },
  help: { color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.xs },
});
