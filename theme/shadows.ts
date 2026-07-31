import { Platform, ViewStyle } from 'react-native';

import { colors } from './colors';

const shadowColor = colors.textPrimary;

export const shadows = {
  sm: {
    ...Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }),
  } satisfies ViewStyle,
  md: {
    ...Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
      default: {},
    }),
  } satisfies ViewStyle,
  lg: {
    ...Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 8 },
      default: {},
    }),
  } satisfies ViewStyle,
} as const;
