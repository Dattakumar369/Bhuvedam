import type { ImageSourcePropType } from 'react-native';

import { API_CONFIG } from '@/constants/app';
import type { AgCatalogType } from '@/types/agCatalogProduct';

/** Resolve product pack photo — HTTPS from API, or /static fallback for legacy paths */
export function resolveAgProductImageSource(
  _type: AgCatalogType,
  imagePath?: string | null,
): ImageSourcePropType | null {
  if (!imagePath?.trim()) return null;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return { uri: imagePath };
  }

  if (API_CONFIG.baseUrl) {
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return { uri: `${API_CONFIG.baseUrl.replace(/\/$/, '')}/static${path}` };
  }

  return null;
}
