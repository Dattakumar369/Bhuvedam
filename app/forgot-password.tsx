import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button, Header, KeyboardSafeView, PhoneInput, PrimaryInput, Subtitle } from '@/components/ui';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useTranslation } from '@/hooks/useTranslation';
import { userRepository } from '@/services/api/repositories';
import { getUserFacingError } from '@/services/api/userFacingError';
import { useUserStore } from '@/store/userStore';
import { colors, layout, spacing } from '@/theme';

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Enter a valid 10-digit phone number')
    .max(10, 'Enter a valid 10-digit phone number')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number'),
});

const resetSchema = z
  .object({
    otp: z
      .string()
      .length(6, 'Enter 6-digit OTP')
      .regex(/^\d{6}$/, 'OTP must be 6 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PhoneForm = z.infer<typeof phoneSchema>;
type ResetForm = z.infer<typeof resetSchema>;

type Step = 'phone' | 'reset';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const { app } = useTranslation();
  const login = useUserStore((s) => s.login);
  const [step, setStep] = useState<Step>('phone');
  const [pendingPhone, setPendingPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendSec, setResendSec] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (resendSec <= 0) return;
    const timer = setInterval(() => {
      setResendSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSec]);

  const sendResetOtp = async (phone: string) => {
    setErrorMessage(null);
    setDevOtpHint(null);
    const result = await userRepository.forgotPassword(phone);
    setResendSec(result.expiresInSec >= 60 ? 60 : result.expiresInSec);
    if (__DEV__ && result.devOtp) setDevOtpHint(result.devOtp);
    setPendingPhone(phone);
    resetForm.reset({ otp: '', password: '', confirmPassword: '' });
    setStep('reset');
  };

  const onPhoneSubmit = async (data: PhoneForm) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await sendResetOtp(data.phone);
    } catch (err: unknown) {
      setErrorMessage(getUserFacingError(err, app, app.mobileNotRegistered));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (data: ResetForm) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await userRepository.resetPassword({
        phone: pendingPhone,
        otp: data.otp,
        password: data.password,
      });
      await login(result.user, result.token);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      setErrorMessage(getUserFacingError(err, app, app.resetPasswordFailed));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResendOtp = async () => {
    if (resendSec > 0 || !pendingPhone) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await sendResetOtp(pendingPhone);
    } catch (err: unknown) {
      setErrorMessage(getUserFacingError(err, app, app.otpSendFailed));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardSafeView style={styles.flex}>
      <Header title={app.resetPassword} showBack onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xxl + keyboardHeight },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'phone' ? (
          <View style={styles.form}>
            <Subtitle style={styles.hint}>{app.resetPasswordHint}</Subtitle>
            <Controller
              control={phoneForm.control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  label={app.mobileNumber}
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={phoneForm.formState.errors.phone?.message}
                />
              )}
            />
            <Button
              label={isSubmitting ? app.sendingOtp : app.sendOtp}
              onPress={phoneForm.handleSubmit(onPhoneSubmit)}
              loading={isSubmitting}
              fullWidth
              size="lg"
              style={styles.button}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <Pressable onPress={() => setStep('phone')} style={styles.backLink}>
              <Subtitle style={styles.link}>{app.changeNumber(pendingPhone)}</Subtitle>
            </Pressable>
            <Subtitle style={styles.hint}>{app.loginOtpHint(pendingPhone)}</Subtitle>
            {__DEV__ && devOtpHint ? (
              <Subtitle style={styles.devHint}>Dev OTP: {devOtpHint}</Subtitle>
            ) : null}
            <Controller
              control={resetForm.control}
              name="otp"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  label={app.otp}
                  value={value}
                  onChangeText={onChange}
                  placeholder="123456"
                  keyboardType="numeric"
                  maxLength={6}
                  error={resetForm.formState.errors.otp?.message}
                />
              )}
            />
            <Controller
              control={resetForm.control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  label={app.newPassword}
                  value={value}
                  onChangeText={onChange}
                  placeholder="••••••••"
                  secureTextEntry
                  error={resetForm.formState.errors.password?.message}
                />
              )}
            />
            <Controller
              control={resetForm.control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  label={app.confirmPassword}
                  value={value}
                  onChangeText={onChange}
                  placeholder="••••••••"
                  secureTextEntry
                  error={resetForm.formState.errors.confirmPassword?.message}
                />
              )}
            />
            <Button
              label={isSubmitting ? app.creatingAccount : app.resetPassword}
              onPress={resetForm.handleSubmit(onResetSubmit)}
              loading={isSubmitting}
              fullWidth
              size="lg"
              style={styles.button}
            />
            <Pressable onPress={() => void onResendOtp()} disabled={resendSec > 0 || isSubmitting}>
              <Subtitle style={[styles.link, resendSec > 0 && styles.linkDisabled]}>
                {resendSec > 0 ? app.resendIn(resendSec) : app.resendOtp}
              </Subtitle>
            </Pressable>
          </View>
        )}

        {errorMessage ? <Subtitle style={styles.error}>{errorMessage}</Subtitle> : null}

        <Pressable onPress={() => router.replace('/login')} style={styles.backToLogin}>
          <Subtitle style={styles.link}>{app.backToLogin}</Subtitle>
        </Pressable>
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
  form: { marginTop: spacing.md },
  hint: { textAlign: 'center', marginBottom: spacing.lg },
  note: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 12,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  devHint: {
    textAlign: 'center',
    color: colors.primary,
    marginBottom: spacing.md,
    fontFamily: 'Poppins_600SemiBold',
  },
  backLink: { marginBottom: spacing.md },
  link: { color: colors.primary, textAlign: 'center' },
  linkDisabled: { color: colors.textTertiary },
  backToLogin: { marginTop: spacing.xl },
  error: { color: colors.error, marginTop: spacing.lg, textAlign: 'center' },
  button: { marginTop: spacing.md },
});
