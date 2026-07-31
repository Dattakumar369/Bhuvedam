import type { ImageSourcePropType } from 'react-native';

import { API_CONFIG } from '@/constants/app';
import type { AgCatalogType } from '@/types/agCatalogProduct';

/** Only use remote URLs — never fake generic stock photos */
export function resolveAgProductImageSource(
  _type: AgCatalogType,
  imagePath?: string | null,
): ImageSourcePropType | null {
  if (!imagePath?.trim()) return null;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return { uri: imagePath };
  }

  if (API_CONFIG.baseUrl && !imagePath.includes('ag/pesticide') && !imagePath.includes('ag/fungicide')) {
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return { uri: `${API_CONFIG.baseUrl.replace(/\/$/, '')}/static${path}` };
  }

  return null;
}
