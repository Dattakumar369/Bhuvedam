import type { LanguageCode } from '@/constants/languages';

/** Plain-language messages for farmers — never show HTTP codes or tech errors */
const EN: Record<string, string | ((sec: number) => string)> = {
  MOBILE_REQUIRED: 'Please enter your mobile number.',
  NAME_REQUIRED: 'Please enter your name.',
  PASSWORD_REQUIRED: 'Please enter your password.',
  INVALID_NAME: 'Please enter your name (at least 2 letters).',
  WEAK_PASSWORD: 'Password should be at least 8 characters.',
  INVALID_PHONE: 'Please enter a valid 10-digit mobile number.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PHONE_TAKEN: 'This mobile number is already registered. Please log in.',
  MOBILE_NOT_REGISTERED: 'This number is not registered. Please sign up first.',
  INVALID_CREDENTIALS: 'Mobile number or password is wrong. Please check and try again.',
  ACCOUNT_DISABLED: 'Your account is blocked. Please contact support.',
  UNAUTHORIZED: 'Please log in to continue.',
  SESSION_EXPIRED: 'Your login expired. Please log in again.',
  FORBIDDEN: 'You cannot do this action right now.',
  OTP_EXPIRED: 'Your OTP expired. Please request a new call.',
  OTP_INVALID: 'Wrong OTP. Please check the number from the call and try again.',
  OTP_MAX_ATTEMPTS: 'Too many wrong tries. Please request a new OTP call.',
  OTP_WAIT: (sec) => `Please wait ${sec} seconds before requesting another OTP call.`,
  OTP_SEND_FAILED: 'We could not call you with the OTP. Check signal and try again.',
  WRONG_PASSWORD: 'Your current password is wrong.',
  NO_PASSWORD: 'No password saved. Use Forgot password on the login screen.',
  SAME_PASSWORD: 'New password must be different from the old one.',
  REGISTER_FAILED: 'Could not create your account. Please try again in a minute.',
  LOGIN_FAILED: 'Could not log in. Please try again.',
  RESET_FAILED: 'Could not reset password. Please try again.',
  CHANGE_PASSWORD_FAILED: 'Could not change password. Please try again.',
  LEGACY_LOGIN_DISABLED: 'Please use password or OTP to log in.',
  INVALID_REQUEST: 'Please check the details you entered and try again.',
  FARMER_NOT_FOUND: 'We could not find your farm profile. Please log in again.',
  SYNC_FAILED: 'Could not save your farm details. We will try again later.',
  CROP_NOT_FOUND: 'Crop details are not available right now.',
  FERTILIZER_NOT_FOUND: 'Fertilizer details are not available.',
  DISEASE_NOT_FOUND: 'Disease details are not available.',
  PRODUCT_NOT_FOUND: 'Product details are not available.',
  INVALID_PRODUCT_TYPE: 'Please choose a valid product type.',
  LOCATION_REQUIRED: 'Please turn on location to use this feature.',
  SEARCH_REQUIRED: 'Please type a word to search.',
  PUSH_TOKEN_REQUIRED: 'Notifications could not be set up on this phone.',
  NOTIFICATION_NOT_FOUND: 'This notification is no longer available.',
  NOTIFICATION_FIELDS_REQUIRED: 'Notification could not be sent. Missing details.',
  AI_MESSAGES_REQUIRED: 'Please type your question for the AI assistant.',
  AI_UNAVAILABLE: 'AI assistant is busy right now. Please try again later.',
  NETWORK_ERROR: 'No internet or server not reachable. Check connection and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again in a minute.',
  NOT_FOUND: 'Information not found.',
  CROPS_LOAD_FAILED: 'Could not load crop list. Showing saved crops on phone.',
  MANDI_LOAD_FAILED: 'Could not load mandi prices. Please try again.',
  WEATHER_LOAD_FAILED: 'Could not load weather. Please try again.',
  PRODUCTS_LOAD_FAILED: 'Could not load products. Please try again.',
  PRODUCTS_OFFLINE: 'Latest products could not load. Showing saved list on your phone.',
  AI_NOT_CONFIGURED: 'AI assistant is not ready right now. Please try again later.',
  MIC_PERMISSION_DENIED: 'Microphone permission is needed for voice chat. Allow it in phone settings.',
  OOPS_TITLE: 'Something went wrong',
  TRY_AGAIN: 'Try again',
  AI_CHAT_FAILED: 'AI could not reply. Please try again.',
  DEFAULT: 'Something went wrong. Please try again.',
};

const TE: Record<string, string | ((sec: number) => string)> = {
  MOBILE_REQUIRED: 'Mobile number enter cheyandi.',
  NAME_REQUIRED: 'Mee peru enter cheyandi.',
  PASSWORD_REQUIRED: 'Password enter cheyandi.',
  INVALID_NAME: 'Peru kam se 2 letters enter cheyandi.',
  WEAK_PASSWORD: 'Password kam se 8 characters undali.',
  INVALID_PHONE: 'Sariyaina 10-digit mobile number enter cheyandi.',
  INVALID_EMAIL: 'Sariyaina email enter cheyandi.',
  PHONE_TAKEN: 'Ee number already register ayyindi. Login cheyandi.',
  MOBILE_NOT_REGISTERED: 'Ee number register cheyaledu. Sign up cheyandi.',
  INVALID_CREDENTIALS: 'Mobile number leda password wrong. Malli check cheyandi.',
  ACCOUNT_DISABLED: 'Account block ayyindi. Support contact cheyandi.',
  UNAUTHORIZED: 'Continue cheyadaniki login avvali.',
  SESSION_EXPIRED: 'Login expire ayyindi. Malli login cheyandi.',
  FORBIDDEN: 'Ippudu ee action cheyyaleru.',
  OTP_EXPIRED: 'OTP expire ayyindi. Kotha OTP call cheyandi.',
  OTP_INVALID: 'OTP wrong. Call lo vachina number malli enter cheyandi.',
  OTP_MAX_ATTEMPTS: 'Chala sarlu try chesaru. Kotha OTP call cheyandi.',
  OTP_WAIT: (sec) => `Inko OTP call ki ${sec} seconds wait cheyandi.`,
  OTP_SEND_FAILED: 'OTP call raaledu. Signal check chesi malli try cheyandi.',
  WRONG_PASSWORD: 'Current password wrong.',
  NO_PASSWORD: 'Password set cheyaledu. Login lo Forgot password use cheyandi.',
  SAME_PASSWORD: 'Kotha password old password la undakudadhu.',
  REGISTER_FAILED: 'Account create avvaledu. Konchem time tarvata malli try cheyandi.',
  LOGIN_FAILED: 'Login avvaledu. Malli try cheyandi.',
  RESET_FAILED: 'Password reset avvaledu. Malli try cheyandi.',
  CHANGE_PASSWORD_FAILED: 'Password change avvaledu. Malli try cheyandi.',
  LEGACY_LOGIN_DISABLED: 'Password leda OTP tho login cheyandi.',
  INVALID_REQUEST: 'Enter chesina details check chesi malli try cheyandi.',
  FARMER_NOT_FOUND: 'Mee farm profile dorakaledu. Malli login cheyandi.',
  SYNC_FAILED: 'Farm details save avvaledu. Tarvata malli try chestam.',
  CROP_NOT_FOUND: 'Crop details ippudu available ledu.',
  FERTILIZER_NOT_FOUND: 'Fertilizer details available ledu.',
  DISEASE_NOT_FOUND: 'Disease details available ledu.',
  PRODUCT_NOT_FOUND: 'Product details available ledu.',
  INVALID_PRODUCT_TYPE: 'Sariyaina product type select cheyandi.',
  LOCATION_REQUIRED: 'Ee feature ki location on cheyandi.',
  SEARCH_REQUIRED: 'Search cheyadaniki oka word type cheyandi.',
  PUSH_TOKEN_REQUIRED: 'Ee phone lo notifications setup avvaledu.',
  NOTIFICATION_NOT_FOUND: 'Ee notification ippudu ledu.',
  NOTIFICATION_FIELDS_REQUIRED: 'Notification pampalemu. Details missing.',
  AI_MESSAGES_REQUIRED: 'AI ki mee question type cheyandi.',
  AI_UNAVAILABLE: 'AI assistant ippudu busy. Tarvata try cheyandi.',
  NETWORK_ERROR: 'Internet leda server connect avvaledu. Connection check chesi malli try cheyandi.',
  SERVER_ERROR: 'Emaina problem vachindi. Konchem time tarvata malli try cheyandi.',
  NOT_FOUND: 'Information dorakaledu.',
  CROPS_LOAD_FAILED: 'Crop list load avvaledu. Phone lo unna crops chupistunnam.',
  MANDI_LOAD_FAILED: 'Mandi rates load avvaledu. Malli try cheyandi.',
  WEATHER_LOAD_FAILED: 'Weather load avvaledu. Malli try cheyandi.',
  AI_CHAT_FAILED: 'AI reply ivvaledu. Malli try cheyandi.',
  PRODUCTS_LOAD_FAILED: 'Products load avvaledu. Malli try cheyandi.',
  PRODUCTS_OFFLINE: 'Latest products load avvaledu. Phone lo unna list chupistunnam.',
  AI_NOT_CONFIGURED: 'AI assistant ippudu ready ledu. Tarvata try cheyandi.',
  MIC_PERMISSION_DENIED: 'Voice chat ki microphone permission kavali. Phone settings lo allow cheyandi.',
  OOPS_TITLE: 'Emaina problem vachindi',
  TRY_AGAIN: 'Malli try cheyandi',
  DEFAULT: 'Emaina problem vachindi. Malli try cheyandi.',
};

function pick(lang: LanguageCode): Record<string, string | ((sec: number) => string)> {
  return lang === 'te' ? TE : EN;
}

function resolveEntry(
  entry: string | ((sec: number) => string) | undefined,
  retryAfterSec?: number,
): string | undefined {
  if (!entry) return undefined;
  if (typeof entry === 'function') return entry(retryAfterSec ?? 60);
  return entry;
}

/** User-facing text only — ignores raw server/axios messages */
export function getUserErrorMessage(
  code: string | undefined,
  language: LanguageCode,
  options?: { retryAfterSec?: number; fallbackCode?: string },
): string {
  const table = pick(language);
  const key = code && table[code] ? code : options?.fallbackCode;
  const fromCode = resolveEntry(key ? table[key] : undefined, options?.retryAfterSec);
  if (fromCode) return fromCode;

  if (code === 'OTP_WAIT' && options?.retryAfterSec) {
    return resolveEntry(table.OTP_WAIT, options.retryAfterSec) ?? table.DEFAULT as string;
  }

  return table.DEFAULT as string;
}
