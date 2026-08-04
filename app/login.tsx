import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button, Display, KeyboardSafeView, PhoneInput, PrimaryInput, Subtitle, sanitizePhoneInput } from '@/components/ui';
import { AppLogo } from '@/components/brand';
import { APP } from '@/constants/app';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useTranslation } from '@/hooks/useTranslation';
import { userRepository } from '@/services/api/repositories';
import { getUserFacingError } from '@/services/api/userFacingError';
import { useUserStore } from '@/store/userStore';
import { colors, layout, radius, spacing } from '@/theme';
import { logAuthApiError, logger, maskPhone } from '@/utils/logger';

const mobileSchema = z
  .string()
  .min(10, 'Enter a valid 10-digit mobile number')
  .max(10, 'Enter a valid 10-digit mobile number')
  .regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number');

const passwordLoginSchema = z.object({
  phone: mobileSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your name').max(60, 'Name is too long'),
    phone: mobileSchema,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordLoginForm = z.infer<typeof passwordLoginSchema>;
type SignupForm = z.infer<typeof signupSchema>;
type AuthTab = 'login' | 'signup';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const { app } = useTranslation();
  const login = useUserStore((s) => s.login);
  const storedUser = useUserStore((s) => s.user);
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordForm = useForm<PasswordLoginForm>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { phone: sanitizePhoneInput(storedUser?.phone ?? ''), password: '' },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const finishLogin = async (token: string, user: Parameters<typeof login>[0]) => {
    await login(user, token);
    router.replace('/(tabs)');
  };

  const switchTab = (tab: AuthTab) => {
    setAuthTab(tab);
    setErrorMessage(null);
  };

  const onPasswordLogin = async (data: PasswordLoginForm) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await userRepository.loginWithPassword({
        identifier: data.phone,
        password: data.password,
      });
      await finishLogin(result.token, result.user);
    } catch (err: unknown) {
      logAuthApiError('Login', err, { phone: maskPhone(data.phone) });
      setErrorMessage(getUserFacingError(err, app, app.wrongPassword));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignup = async (data: SignupForm) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    logger.auth.info('Signup form submit', {
      phone: maskPhone(data.phone),
      nameLength: data.name.trim().length,
    });
    try {
      const result = await userRepository.register({
        name: data.name.trim(),
        phone: data.phone,
        password: data.password,
        language: storedUser?.language ?? 'te',
      });
      logger.auth.info('Signup complete', { userId: result.user.id });
      await finishLogin(result.token, result.user);
    } catch (err: unknown) {
      logAuthApiError('Signup', err, { phone: maskPhone(data.phone) });
      setErrorMessage(getUserFacingError(err, app, app.signupFailed));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardSafeView style={styles.flex}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xxl + keyboardHeight },
        ]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <LinearGradient
          colors={[...colors.gradient.header]}
          style={[styles.header, { paddingTop: insets.top + spacing.xxxl }]}
        >
          <Animated.View entering={FadeInDown.springify()} style={styles.headerBrand}>
            <AppLogo size={104} withPlate style={styles.logo} />
            <Display style={styles.title}>{APP.name}</Display>
            <Subtitle style={styles.tagline}>{APP.tagline}</Subtitle>
          </Animated.View>
        </LinearGradient>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          pointerEvents="box-none"
          style={[styles.form, { paddingBottom: insets.bottom + spacing.xl }]}
        >
          <View style={styles.tabRow}>
            {(['login', 'signup'] as AuthTab[]).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => switchTab(tab)}
                style={[styles.tabChip, authTab === tab && styles.tabChipActive]}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.9}
                  style={[styles.tabChipText, authTab === tab && styles.tabChipTextActive]}
                >
                  {tab === 'login' ? app.loginTab : app.signupTab}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={authTab === 'login' ? styles.tabPanel : styles.tabPanelHidden}>
            <Controller
              control={passwordForm.control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  label={app.mobileNumber}
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={passwordForm.formState.errors.phone?.message}
                />
              )}
            />
            <Controller
              control={passwordForm.control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  label={app.password}
                  value={value ?? ''}
                  onChangeText={onChange}
                  placeholder="••••••••"
                  secureTextEntry
                  error={passwordForm.formState.errors.password?.message}
                />
              )}
            />
            <Button
              label={isSubmitting ? app.loggingIn : app.loginBtn}
              onPress={passwordForm.handleSubmit(onPasswordLogin)}
              loading={isSubmitting}
              fullWidth
              size="lg"
              style={styles.button}
            />
            <Pressable onPress={() => router.push('/forgot-password')} style={styles.textLink}>
              <Text style={styles.linkText}>{app.forgotPassword}</Text>
            </Pressable>
          </View>

          <View style={authTab === 'signup' ? styles.tabPanel : styles.tabPanelHidden}>
            <Controller
              control={signupForm.control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  label={app.yourName}
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={signupForm.formState.errors.name?.message}
                />
              )}
            />
            <Controller
              control={signupForm.control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  label={app.mobileNumber}
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={signupForm.formState.errors.phone?.message}
                />
              )}
            />
            <Controller
              control={signupForm.control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  label={app.password}
                  value={value ?? ''}
                  onChangeText={onChange}
                  placeholder="••••••••"
                  secureTextEntry
                  error={signupForm.formState.errors.password?.message}
                />
              )}
            />
            <Controller
              control={signupForm.control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  label={app.confirmPassword}
                  value={value ?? ''}
                  onChangeText={onChange}
                  placeholder="••••••••"
                  secureTextEntry
                  error={signupForm.formState.errors.confirmPassword?.message}
                />
              )}
            />
            <Button
              label={isSubmitting ? app.creatingAccount : app.createAccountBtn}
              onPress={signupForm.handleSubmit(onSignup)}
              loading={isSubmitting}
              fullWidth
              size="lg"
              style={styles.button}
            />
          </View>

          {errorMessage ? <Subtitle style={styles.error}>{errorMessage}</Subtitle> : null}

          <Subtitle style={styles.disclaimer}>
            {app.loginDisclaimerPrefix}{' '}
            <Text style={styles.link} onPress={() => router.push('/terms')}>
              {app.terms}
            </Text>{' '}
            &{' '}
            <Text style={styles.link} onPress={() => router.push('/privacy')}>
              {app.privacy}
            </Text>
            . {app.loginDisclaimerSuffix}
          </Subtitle>
        </Animated.View>
      </ScrollView>
    </KeyboardSafeView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xxxl + spacing.lg,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    alignItems: 'center',
  },
  headerBrand: { alignItems: 'center' },
  logo: { marginBottom: spacing.md },
  title: { color: colors.white, textAlign: 'center' },
  tagline: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: spacing.xs },
  form: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xxl,
    marginTop: -spacing.xl,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    flex: 1,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  tabChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  tabChipActive: {
    backgroundColor: colors.primary,
  },
  tabChipText: {
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabChipTextActive: {
    color: colors.white,
  },
  tabPanel: {
    width: '100%',
  },
  tabPanelHidden: {
    display: 'none',
  },
  textLink: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: {
    color: colors.primary,
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  error: { color: colors.error, marginTop: spacing.lg, textAlign: 'center' },
  button: { marginTop: spacing.md },
  disclaimer: { textAlign: 'center', marginTop: spacing.xxl, fontSize: 12 },
  link: { color: colors.primary, textDecorationLine: 'underline' },
});
