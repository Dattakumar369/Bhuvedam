import type { ApiError } from '@/types/api';

/** Throw errors that map to farmer-friendly messages — never expose stack or vendor names. */
export function userApiError(code: string): Error & ApiError {
  const err = new Error(code) as Error & ApiError;
  err.code = code;
  err.message = code;
  err.statusCode = 0;
  return err;
}
