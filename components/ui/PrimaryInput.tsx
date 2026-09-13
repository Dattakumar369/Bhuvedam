import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';

import { Caption } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

interface PrimaryInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  keyboardType?: 'default' | 'phone-pad' | 'numeric' | 'email-address';
  secureTextEntry?: boolean;
  disabled?: boolean;
  left?: React.ReactNode;
  maxLength?: number;
  autoComplete?: 'off' | 'tel' | 'password' | 'name' | 'username' | 'new-password';
  textContentType?: 'none' | 'telephoneNumber' | 'password' | 'newPassword' | 'name' | 'username';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function PrimaryInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  keyboardType = 'default',
  secureTextEntry,
  disabled,
  left,
  maxLength,
  autoComplete,
  textContentType,
  autoCapitalize,
}: PrimaryInputProps) {
  return (
    <View style={styles.wrap}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        mode="outlined"
        error={!!error}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        disabled={disabled}
        left={left}
        maxLength={maxLength}
        autoComplete={autoComplete}
        textContentType={textContentType}
        autoCapitalize={autoCapitalize}
        outlineColor={colors.border}
        activeOutlineColor={error ? colors.error : colors.primary}
        style={styles.input}
        contentStyle={styles.content}
      />
      {error ? <Caption style={styles.error}>{error}</Caption> : null}
      {!error && hint ? <Caption style={styles.hint}>{hint}</Caption> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface, marginBottom: 0 },
  content: { fontFamily: 'Poppins_400Regular' },
  error: {
    color: colors.error,
    marginTop: 2,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  hint: {
    color: colors.textTertiary,
    marginTop: 2,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
    fontSize: 11,
  },
});
