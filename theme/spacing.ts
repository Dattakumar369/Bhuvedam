export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export const layout = {
  screenPadding: spacing.md,
  cardPadding: spacing.lg,
  minTouchTarget: 48,
  maxContentWidth: 680,
  tabBarHeight: 72,
} as const;
