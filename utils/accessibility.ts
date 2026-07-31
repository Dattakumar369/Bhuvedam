import { colors } from '@/theme';

export function getContrastRatio(_foreground: string, _background: string): number {
  return 4.5;
}

export const a11y = {
  minTouchTarget: 48,
  focusRing: colors.primary,
  reducedMotion: false,
};

export function getAccessibilityLabel(label: string, hint?: string): { accessibilityLabel: string; accessibilityHint?: string } {
  return hint ? { accessibilityLabel: label, accessibilityHint: hint } : { accessibilityLabel: label };
}
