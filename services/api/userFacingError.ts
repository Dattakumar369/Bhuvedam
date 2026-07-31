import type { AppTranslations } from '@/constants/i18n/appTranslations';
import type { ApiError } from '@/types/api';

const TECHNICAL_MESSAGE =
  /request failed with status code \d+|network error|^timeout|^axios|^error \d{3}/i;

/** Map backend error codes → app translations (never show HTTP status to user) */
const CODE_MESSAGES: Partial<Record<string, (app: AppTranslations) => string>> = {
  MOBILE_NOT_REGISTERED: (app) => app.mobileNotRegistered,
  INVALID_CREDENTIALS: (app) => app.wrongPassword,
  WRONG_PASSWORD: (app) => app.wrongPassword,
  PHONE_TAKEN: (app) => app.phoneAlreadyRegistered,
  OTP_INVALID: (app) => app.otpInvalid,
  OTP_EXPIRED: (app) => app.otpInvalid,
  OTP_MAX_ATTEMPTS: (app) => app.otpInvalid,
  OTP_SEND_FAILED: (app) => app.otpSendFailed,
  OTP_WAIT: (app) => app.otpSendFailed,
  REGISTER_FAILED: (app) => app.signupFailed,
  LOGIN_FAILED: (app) => app.loginFailed,
  RESET_FAILED: (app) => app.resetPasswordFailed,
  CHANGE_PASSWORD_FAILED: (app) => app.passwordChangeFailed,
  WEAK_PASSWORD: (app) => app.passwordTooShort,
  INVALID_PHONE: (app) => app.invalidMobile,
  MOBILE_REQUIRED: (app) => app.mobileRequired,
  NAME_REQUIRED: (app) => app.nameRequired,
  PASSWORD_REQUIRED: (app) => app.passwordRequired,
  NO_PASSWORD: (app) => app.noPasswordSet,
  SAME_PASSWORD: (app) => app.samePassword,
  ACCOUNT_DISABLED: (app) => app.accountDisabled,
};

function isSafeUserMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  if (TECHNICAL_MESSAGE.test(trimmed)) return false;
  if (/\b\d{3}\b/.test(trimmed) && /status|code|http|error/i.test(trimmed)) return false;
  if (/db:push|npm run|server database|neon|sql/i.test(trimmed)) return false;
  return true;
}

export function getUserFacingError(
  err: unknown,
  app: AppTranslations,
  fallback: string,
): string {
  const apiErr = err as ApiError;

  if (apiErr.code) {
    const mapped = CODE_MESSAGES[apiErr.code];
    if (mapped) return mapped(app);
  }

  if (apiErr.message && isSafeUserMessage(apiErr.message)) {
    return apiErr.message;
  }

  return fallback;
}
