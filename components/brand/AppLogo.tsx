import { Image, StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { APP_ASSETS } from '@/constants/assets';

interface AppLogoProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  /** Show soft plate behind logo — good on green gradient headers */
  withPlate?: boolean;
}

export function AppLogo({ size = 96, style, imageStyle, withPlate = false }: AppLogoProps) {
  const imageSize = withPlate ? size * 0.72 : size;

  return (
    <View
      style={[
        withPlate && styles.plate,
        withPlate && { width: size, height: size, borderRadius: size * 0.22 },
        style,
      ]}
    >
      <Image
        source={APP_ASSETS.logo}
        accessibilityLabel="Bhuvedam logo"
        style={[{ width: imageSize, height: imageSize }, imageStyle]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});
