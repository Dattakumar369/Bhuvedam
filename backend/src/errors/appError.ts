import type { Context } from 'hono';

/** Stable codes for the app — never show HTTP status numbers to users */
export const APP_ERROR = {
  MOBILE_REQUIRED: {
    code: 'MOBILE_REQUIRED',
    message: 'Mobile number is required',
    status: 400,
  },
  NAME_REQUIRED: {
    code: 'NAME_REQUIRED',
    message: 'Please enter your name',
    status: 400,
  },
  PASSWORD_REQUIRED: {
    code: 'PASSWORD_REQUIRED',
    message: 'Password is required',
    status: 400,
  },
  INVALID_NAME: {
    code: 'INVALID_NAME',
    message: 'Please enter a valid name (at least 2 characters)',
    status: 400,
  },
  WEAK_PASSWORD: {
    code: 'WEAK_PASSWORD',
    message: 'Password must be at least 8 characters',
    status: 400,
  },
  INVALID_PHONE: {
    code: 'INVALID_PHONE',
    message: 'Enter a valid 10-digit mobile number',
    status: 400,
  },
  INVALID_EMAIL: {
    code: 'INVALID_EMAIL',
    message: 'Enter a valid email address',
    status: 400,
  },
  PHONE_TAKEN: {
    code: 'PHONE_TAKEN',
    message: 'This mobile number is already registered. Try logging in.',
    status: 409,
  },
  MOBILE_NOT_REGISTERED: {
    code: 'MOBILE_NOT_REGISTERED',
    message: 'This mobile number is not registered. Please sign up first.',
    status: 404,
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Wrong mobile number or password',
    status: 401,
  },
  ACCOUNT_DISABLED: {
    code: 'ACCOUNT_DISABLED',
    message: 'Account is disabled. Contact support.',
    status: 403,
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Please log in again to continue',
    status: 401,
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    message: 'Your session expired. Please log in again.',
    status: 401,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'You do not have permission for this action',
    status: 403,
  },
  OTP_EXPIRED: {
    code: 'OTP_EXPIRED',
    message: 'OTP expired. Request a new one.',
    status: 401,
  },
  OTP_INVALID: {
    code: 'OTP_INVALID',
    message: 'Wrong OTP. Please try again.',
    status: 401,
  },
  OTP_MAX_ATTEMPTS: {
    code: 'OTP_MAX_ATTEMPTS',
    message: 'Too many attempts. Request a new OTP.',
    status: 401,
  },
  OTP_WAIT: {
    code: 'OTP_WAIT',
    message: 'Please wait before requesting another OTP',
    status: 429,
  },
  OTP_SEND_FAILED: {
    code: 'OTP_SEND_FAILED',
    message: 'Could not send OTP. Try again later.',
    status: 503,
  },
  WRONG_PASSWORD: {
    code: 'WRONG_PASSWORD',
    message: 'Current password is wrong',
    status: 401,
  },
  NO_PASSWORD: {
    code: 'NO_PASSWORD',
    message: 'No password set. Use Forgot Password on the login screen.',
    status: 400,
  },
  SAME_PASSWORD: {
    code: 'SAME_PASSWORD',
    message: 'New password must be different from current password',
    status: 400,
  },
  REGISTER_FAILED: {
    code: 'REGISTER_FAILED',
    message: 'Could not create account. Please try again.',
    status: 500,
  },
  LOGIN_FAILED: {
    code: 'LOGIN_FAILED',
    message: 'Login failed. Please try again.',
    status: 500,
  },
  RESET_FAILED: {
    code: 'RESET_FAILED',
    message: 'Could not reset password. Please try again.',
    status: 500,
  },
  CHANGE_PASSWORD_FAILED: {
    code: 'CHANGE_PASSWORD_FAILED',
    message: 'Could not change password. Please try again.',
    status: 500,
  },
  LEGACY_LOGIN_DISABLED: {
    code: 'LEGACY_LOGIN_DISABLED',
    message: 'This login method is not available. Use password or OTP login.',
    status: 403,
  },
  INVALID_REQUEST: {
    code: 'INVALID_REQUEST',
    message: 'Some information is missing or invalid. Please check and try again.',
    status: 400,
  },
  FARMER_NOT_FOUND: {
    code: 'FARMER_NOT_FOUND',
    message: 'Farm profile not found. Please log in again.',
    status: 404,
  },
  SYNC_FAILED: {
    code: 'SYNC_FAILED',
    message: 'Could not save your farm details. Please try again.',
    status: 500,
  },
  CROP_NOT_FOUND: {
    code: 'CROP_NOT_FOUND',
    message: 'Crop information is not available right now.',
    status: 404,
  },
  FERTILIZER_NOT_FOUND: {
    code: 'FERTILIZER_NOT_FOUND',
    message: 'Fertilizer product not found.',
    status: 404,
  },
  DISEASE_NOT_FOUND: {
    code: 'DISEASE_NOT_FOUND',
    message: 'Disease information not found.',
    status: 404,
  },
  PRODUCT_NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    message: 'Product not found.',
    status: 404,
  },
  INVALID_PRODUCT_TYPE: {
    code: 'INVALID_PRODUCT_TYPE',
    message: 'Invalid product type selected.',
    status: 400,
  },
  LOCATION_REQUIRED: {
    code: 'LOCATION_REQUIRED',
    message: 'Location is required for this feature.',
    status: 400,
  },
  SEARCH_REQUIRED: {
    code: 'SEARCH_REQUIRED',
    message: 'Please enter a search word.',
    status: 400,
  },
  PUSH_TOKEN_REQUIRED: {
    code: 'PUSH_TOKEN_REQUIRED',
    message: 'Could not register notifications on this device.',
    status: 400,
  },
  NOTIFICATION_NOT_FOUND: {
    code: 'NOTIFICATION_NOT_FOUND',
    message: 'Notification not found.',
    status: 404,
  },
  NOTIFICATION_FIELDS_REQUIRED: {
    code: 'NOTIFICATION_FIELDS_REQUIRED',
    message: 'Notification title and message are required.',
    status: 400,
  },
  AI_MESSAGES_REQUIRED: {
    code: 'AI_MESSAGES_REQUIRED',
    message: 'Please type a message to send to the assistant.',
    status: 400,
  },
  AI_NOT_CONFIGURED: {
    code: 'AI_NOT_CONFIGURED',
    message: 'AI assistant is not configured on the server.',
    status: 503,
  },
  AI_UNAVAILABLE: {
    code: 'AI_UNAVAILABLE',
    message: 'AI assistant is temporarily unavailable. Try again later.',
    status: 503,
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Could not connect to server. Check your internet and try again.',
    status: 503,
  },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    message: 'Something went wrong. Please try again.',
    status: 500,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'The requested information was not found.',
    status: 404,
  },
} as const;

export type AppErrorCode = keyof typeof APP_ERROR;

export function appError(
  c: Context,
  key: AppErrorCode,
  extras?: { retryAfterSec?: number },
) {
  const entry = APP_ERROR[key];
  return c.json(
    {
      code: entry.code,
      ...(extras?.retryAfterSec != null ? { retryAfterSec: extras.retryAfterSec } : {}),
    },
    entry.status as 400 | 401 | 403 | 404 | 409 | 429 | 500 | 503,
  );
}

/** Map thrown service codes (e.g. PHONE_TAKEN) to app error keys */
export function appErrorFromThrown(
  c: Context,
  err: unknown,
  fallback: AppErrorCode,
  map: Record<string, AppErrorCode> = {},
): Response {
  const code = err instanceof Error ? err.message : String(err);
  const key = map[code] ?? (code in APP_ERROR ? (code as AppErrorCode) : undefined);
  if (key) return appError(c, key);
  return appError(c, fallback);
}

export function parseOtpWaitSeconds(message: string): number | undefined {
  const m = /^WAIT_(\d+)$/.exec(message);
  return m ? Number(m[1]) : undefined;
}
