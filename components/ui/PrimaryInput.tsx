import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

import { colors, radius } from '@/theme';

interface PrimaryInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'phone-pad' | 'numeric' | 'email-address';
  secureTextEntry?: boolean;
  disabled?: boolean;
  left?: React.ReactNode;
  maxLength?: number;
  autoComplete?: 'off' | 'tel' | 'password' | 'name' | 'username';
  textContentType?: 'none' | 'telephoneNumber' | 'password' | 'name' | 'username';
}

export function PrimaryInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  secureTextEntry,
  disabled,
  left,
  maxLength,
  autoComplete,
  textContentType,
}: PrimaryInputProps) {
  return (
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
      outlineColor={colors.border}
      activeOutlineColor={colors.primary}
      style={styles.input}
      contentStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: colors.surface, marginBottom: 4 },
  content: { fontFamily: 'Poppins_400Regular' },
});
