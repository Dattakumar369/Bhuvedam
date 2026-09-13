import { StyleSheet, Text, View, Image } from 'react-native';

import { colors } from '@/theme';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  /** Use on green headers — translucent ring + white initials */
  tone?: 'solid' | 'onBrand';
}

export function Avatar({ name, uri, size = 48, tone = 'solid' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        accessibilityLabel={`${name}'s avatar`}
      />
    );
  }

  const onBrand = tone === 'onBrand';

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: onBrand ? 'rgba(255,255,255,0.22)' : colors.primary,
          borderWidth: onBrand ? 2 : 0,
          borderColor: 'rgba(255,255,255,0.55)',
        },
      ]}
      accessibilityLabel={`${name}'s avatar`}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: size * 0.36,
            lineHeight: size * 0.42,
            color: colors.white,
          },
        ]}
      >
        {initials || '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surfaceVariant },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
});
