import { TextStyle } from 'react-native';

import { colors } from './colors';

export const fontFamily = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export const typography = {
  display: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  } satisfies TextStyle,
  headline: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.25,
    color: colors.textPrimary,
  } satisfies TextStyle,
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
  } satisfies TextStyle,
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  } satisfies TextStyle,
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  } satisfies TextStyle,
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  } satisfies TextStyle,
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
    color: colors.textSecondary,
  } satisfies TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;
