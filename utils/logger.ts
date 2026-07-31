import { API_CONFIG } from '@/constants/app';
import type { ApiError } from '@/types/api';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'otp',
  'authorization',
  'currentpassword',
  'newpassword',
  'confirmpassword',
  'authtoken',
]);

function isDev(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

function shouldLog(level: LogLevel): boolean {
  if (level === 'error' || level === 'warn') return true;
  if (level === 'info') return true;
  return isDev();
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return '(empty)';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return `******${digits.slice(-4)}`;
}

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.has(key.toLowerCase())) return '[redacted]';
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => redact(item));
  return redact(value);
}

function redact(data: unknown): unknown {
  if (data == null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map((item) => redact(item));
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    out[key] = redactValue(key, value);
  }
  return out;
}

function write(scope: string, level: LogLevel, message: string, meta?: unknown): void {
  if (!shouldLog(level)) return;
  const prefix = `[Bhuvedam:${scope}]`;
  const payload = meta !== undefined ? redact(meta) : undefined;
  const line = payload ? `${message} ${JSON.stringify(payload)}` : message;

  switch (level) {
    case 'debug':
      console.debug(prefix, line);
      break;
    case 'info':
      console.info(prefix, line);
      break;
    case 'warn':
      console.warn(prefix, line);
      break;
    case 'error':
      console.error(prefix, line);
      break;
  }
}

function createScope(scope: string) {
  return {
    debug: (message: string, meta?: unknown) => write(scope, 'debug', message, meta),
    info: (message: string, meta?: unknown) => write(scope, 'info', message, meta),
    warn: (message: string, meta?: unknown) => write(scope, 'warn', message, meta),
    error: (message: string, meta?: unknown) => write(scope, 'error', message, meta),
  };
}

export const logger = {
  auth: createScope('Auth'),
  api: createScope('API'),
  app: createScope('App'),
};

export function logApiFailure(details: {
  method?: string;
  url?: string;
  status?: number;
  code?: string;
  message?: string;
  network?: boolean;
}): void {
  logger.api.error('Request failed', {
    apiBaseUrl: API_CONFIG.baseUrl,
    method: details.method?.toUpperCase(),
    url: details.url,
    status: details.status,
    code: details.code,
    message: details.message,
    network: details.network ?? false,
  });
}

export function logAuthApiError(action: string, err: unknown, meta?: Record<string, unknown>): void {
  const apiErr = err as ApiError;
  logger.auth.error(`${action} failed`, {
    ...meta,
    code: apiErr.code,
    message: apiErr.message,
    statusCode: apiErr.statusCode,
  });
}
