import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

import { colors } from './colors';
import { fontFamily } from './typography';

const fontConfig = {
  displayLarge: { fontFamily: fontFamily.bold },
  displayMedium: { fontFamily: fontFamily.bold },
  displaySmall: { fontFamily: fontFamily.semiBold },
  headlineLarge: { fontFamily: fontFamily.semiBold },
  headlineMedium: { fontFamily: fontFamily.semiBold },
  headlineSmall: { fontFamily: fontFamily.semiBold },
  titleLarge: { fontFamily: fontFamily.semiBold },
  titleMedium: { fontFamily: fontFamily.medium },
  titleSmall: { fontFamily: fontFamily.medium },
  bodyLarge: { fontFamily: fontFamily.regular },
  bodyMedium: { fontFamily: fontFamily.regular },
  bodySmall: { fontFamily: fontFamily.regular },
  labelLarge: { fontFamily: fontFamily.medium },
  labelMedium: { fontFamily: fontFamily.medium },
  labelSmall: { fontFamily: fontFamily.medium },
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.white,
    primaryContainer: colors.primaryLight,
    onPrimaryContainer: colors.textPrimary,
    secondary: colors.accent,
    onSecondary: colors.textPrimary,
    secondaryContainer: '#FFF3E0',
    onSecondaryContainer: colors.textPrimary,
    tertiary: colors.primaryLight,
    background: colors.background,
    onBackground: colors.textPrimary,
    surface: colors.surface,
    onSurface: colors.textPrimary,
    surfaceVariant: colors.surfaceVariant,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    error: colors.error,
    onError: colors.white,
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 16,
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    onPrimary: colors.textPrimary,
    primaryContainer: colors.primaryDark,
    secondary: colors.accent,
    background: '#0D1F12',
    onBackground: '#E8F5E9',
    surface: '#152819',
    onSurface: '#E8F5E9',
    surfaceVariant: '#1E3A24',
    onSurfaceVariant: '#A5D6A7',
    outline: '#2E4A35',
    error: '#EF5350',
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 16,
};
