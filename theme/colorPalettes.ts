import { colors as lightColors } from './colors';

export { lightColors };

/** Dark palette — mirrors paperTheme dark surfaces */
export const darkColors = {
  ...lightColors,
  background: '#0D1F12',
  surface: '#152819',
  surfaceVariant: '#1E3A24',
  textPrimary: '#E8F5E9',
  textSecondary: '#A5D6A7',
  textTertiary: '#6B9B72',
  border: '#2E4A35',
  overlay: 'rgba(0, 0, 0, 0.55)',
  glass: 'rgba(21, 40, 25, 0.85)',
  gradient: {
    nature: ['#1B5E20', '#2E7D32', '#388E3C'] as const,
    sunrise: ['#E65100', '#F57C00', '#FFB74D'] as const,
    sky: ['#0D47A1', '#1565C0', '#42A5F5'] as const,
    header: ['#0D1F12', '#1B4332', '#2E7D32'] as const,
  },
} as const;

export type AppColorPalette = typeof lightColors;

export function getAppColors(isDark: boolean): AppColorPalette {
  return isDark ? darkColors : lightColors;
}
