import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

export const screenWidth = width;
export const screenHeight = height;

export function isTablet(): boolean {
  return Math.min(width, height) >= 600;
}

export function isSmallScreen(): boolean {
  return width < 360;
}

export function scale(size: number): number {
  const baseWidth = 375;
  return Math.round(PixelRatio.roundToNearestPixel((width / baseWidth) * size));
}

export function responsiveValue<T>(phone: T, tablet: T): T {
  return isTablet() ? tablet : phone;
}

export function getContentWidth(): number {
  const maxWidth = 680;
  return Math.min(width - 32, maxWidth);
}
