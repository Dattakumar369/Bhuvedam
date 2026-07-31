import { useThemeStore } from '@/store/themeStore';
import { getAppColors, type AppColorPalette } from '@/theme/colorPalettes';

/** Theme-aware colors — use instead of static `colors` import in UI components */
export function useAppColors(): AppColorPalette {
  const isDark = useThemeStore((s) => s.isDark);
  return getAppColors(isDark);
}
