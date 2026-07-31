import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button, Header, KeyboardSafeView, PrimaryInput, Subtitle } from '@/components/ui';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useTranslation } from '@/hooks/useTranslation';
import { userRepository } from '@/services/api/repositories';
import { getUserFacingError } from '@/services/api/userFacingError';
import { colors, layout, spacing } from '@/theme';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter current password'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different',
    path: ['newPassword'],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const { app } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await userRepository.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccessMessage(app.passwordChanged);
      form.reset();
      setTimeout(() => router.back(), 1200);
    } catch (err: unknown) {
      setErrorMessage(getUserFacingError(err, app, app.passwordChangeFailed));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardSafeView style={styles.flex}>
      <Header title={app.changePassword} showBack onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xxl + keyboardHeight },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Subtitle style={styles.hint}>{app.changePasswordHint}</Subtitle>

        <Controller
          control={form.control}
          name="currentPassword"
          render={({ field: { onChange, value } }) => (
            <PrimaryInput
              label={app.currentPassword}
              value={value}
              onChangeText={onChange}
              placeholder="••••••••"
              secureTextEntry
              error={form.formState.errors.currentPassword?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="newPassword"
          render={({ field: { onChange, value } }) => (
            <PrimaryInput
              label={app.newPassword}
              value={value}
              onChangeText={onChange}
              placeholder="••••••••"
              secureTextEntry
              error={form.formState.errors.newPassword?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <PrimaryInput
              label={app.confirmPassword}
              value={value}
              onChangeText={onChange}
              placeholder="••••••••"
              secureTextEntry
              error={form.formState.errors.confirmPassword?.message}
            />
          )}
        />

        <Button
          label={isSubmitting ? app.creatingAccount : app.changePassword}
          onPress={form.handleSubmit(onSubmit)}
          loading={isSubmitting}
          fullWidth
          size="lg"
          style={styles.button}
        />

        {errorMessage ? <Subtitle style={styles.error}>{errorMessage}</Subtitle> : null}
        {successMessage ? <Subtitle style={styles.success}>{successMessage}</Subtitle> : null}
      </ScrollView>
    </KeyboardSafeView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xl,
  },
  hint: { textAlign: 'center', marginBottom: spacing.xl },
  button: { marginTop: spacing.lg },
  error: { color: colors.error, marginTop: spacing.lg, textAlign: 'center' },
  success: { color: colors.primary, marginTop: spacing.lg, textAlign: 'center' },
});
