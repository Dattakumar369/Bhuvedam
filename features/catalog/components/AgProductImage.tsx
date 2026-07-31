import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Image, StyleSheet, View, type ImageStyle, type StyleProp } from 'react-native';

import { AgProductBadge } from '@/features/catalog/components/AgProductBadge';
import type { AgCatalogType } from '@/types/agCatalogProduct';
import { resolveAgProductImageSource } from '@/utils/agProductImage';
import { radius } from '@/theme';

interface AgProductImageProps {
  type: AgCatalogType;
  name: string;
  subtitle?: string | null;
  dose?: string | null;
  imagePath?: string | null;
  size?: 'card' | 'detail';
  style?: StyleProp<ImageStyle>;
}

/** Real remote image if available; otherwise honest badge with product name + dose */
export function AgProductImage({
  type,
  name,
  subtitle,
  dose,
  imagePath,
  size = 'card',
  style,
}: AgProductImageProps) {
  const remote = resolveAgProductImageSource(type, imagePath);
  const [failed, setFailed] = useState(false);

  if (!remote || failed) {
    return (
      <AgProductBadge type={type} name={name} subtitle={subtitle} dose={dose} size={size} />
    );
  }

  return (
    <View style={[styles.wrap, size === 'detail' && styles.wrapDetail]}>
      <Image
        source={remote}
        style={[styles.image, size === 'detail' && styles.imageDetail, style]}
        resizeMode="cover"
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 96, overflow: 'hidden' },
  wrapDetail: { height: 180, borderRadius: radius.lg },
  image: { width: '100%', height: '100%' },
  imageDetail: { borderRadius: radius.lg },
});
