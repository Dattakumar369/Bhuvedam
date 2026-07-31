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
} as const;

export type AppErrorCode = keyof typeof APP_ERROR;

export function appError(
  c: Context,
  key: AppErrorCode,
  extras?: { message?: string; retryAfterSec?: number },
) {
  const entry = APP_ERROR[key];
  return c.json(
    {
      error: extras?.message ?? entry.message,
      code: entry.code,
      ...(extras?.retryAfterSec != null ? { retryAfterSec: extras.retryAfterSec } : {}),
    },
    entry.status as 400 | 401 | 403 | 404 | 409 | 429 | 500 | 503,
  );
}
