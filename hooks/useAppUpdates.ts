import * as Updates from 'expo-updates';
import { useEffect } from 'react';

import { logger } from '@/utils/logger';

/**
 * Checks EAS for a JS bundle update on app open.
 * Farmers keep the same APK — no new install link needed for UI fixes.
 */
export function useAppUpdates(): void {
  useEffect(() => {
    if (__DEV__) return;
    if (!Updates.isEnabled) return;

    void (async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (!result.isAvailable) return;

        logger.app.info('OTA update downloading');
        await Updates.fetchUpdateAsync();
        logger.app.info('OTA update ready — reloading');
        await Updates.reloadAsync();
      } catch (error) {
        logger.app.warn('OTA update check failed', { error });
      }
    })();
  }, []);
}
