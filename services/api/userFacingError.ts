import { getUserErrorMessage } from '@/constants/i18n/userErrorMessages';
import type { AppTranslations } from '@/constants/i18n/appTranslations';
import { useLanguageStore } from '@/store/languageStore';
import type { ApiError } from '@/types/api';

/**
 * Converts API errors into plain language for farmers.
 * Never shows HTTP status, axios text, or developer messages.
 */
export function getUserFacingError(
  err: unknown,
  _app?: AppTranslations,
  _fallback?: string,
): string {
  return resolveApiError(err);
}

/** Use in stores and services (no React hook needed) */
export function resolveApiError(
  err: unknown,
  fallbackCode = 'DEFAULT',
): string {
  const apiErr = err as ApiError;
  const language = useLanguageStore.getState().language;

  if (!apiErr.code && !apiErr.statusCode && err instanceof Error) {
    // Offline / no response — always friendly network message
    if (!('statusCode' in apiErr) || apiErr.statusCode === 0) {
      return getUserErrorMessage('NETWORK_ERROR', language);
    }
  }

  return getUserErrorMessage(apiErr.code, language, {
    retryAfterSec: apiErr.retryAfterSec,
    fallbackCode: apiErr.code ? undefined : fallbackCode,
  });
}
