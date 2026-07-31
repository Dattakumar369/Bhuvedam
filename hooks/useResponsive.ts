import { useWindowDimensions } from 'react-native';

import { isSmallScreen as checkSmall, isTablet as checkTablet, getContentWidth } from '@/utils/responsive';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isTablet: checkTablet(),
    isSmallScreen: checkSmall(),
    contentWidth: getContentWidth(),
    columns: checkTablet() ? 2 : 1,
  };
}
