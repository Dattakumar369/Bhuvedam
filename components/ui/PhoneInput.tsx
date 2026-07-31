import { StyleSheet, TextInput, View } from 'react-native';

import { Caption, Label } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

interface PhoneInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}

export function sanitizePhoneInput(text: string): string {
  return text.replace(/\D/g, '').slice(0, 10);
}

/** Native TextInput — more reliable for mobile numbers than Paper on some Android devices */
export function PhoneInput({
  label,
  value,
  onChangeText,
  placeholder = '9876543210',
  error,
}: PhoneInputProps) {
  const safeValue = value ?? '';

  return (
    <View style={styles.wrap}>
      <Label style={styles.label}>{label}</Label>
      <TextInput
        value={safeValue}
        onChangeText={(text) => onChangeText(sanitizePhoneInput(text))}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={10}
        autoCorrect={false}
        autoCapitalize="none"
        autoComplete="off"
        importantForAutofill="no"
        textContentType="none"
        returnKeyType="done"
        style={[styles.input, error ? styles.inputError : null]}
      />
      {error ? <Caption style={styles.error}>{error}</Caption> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: colors.textPrimary,
    minHeight: 52,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
    marginTop: spacing.xs,
  },
});
