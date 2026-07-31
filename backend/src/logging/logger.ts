type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'otp',
  'authorization',
  'passwordhash',
  'currentpassword',
  'newpassword',
]);

function logLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL?.trim().toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') return raw;
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[logLevel()];
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return '(empty)';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return `******${digits.slice(-4)}`;
}

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.has(key.toLowerCase())) return '[redacted]';
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => redact(item));
  return redact(value);
}

function redact(data: unknown): unknown {
  if (data instanceof Error) {
    return { name: data.name, message: data.message, stack: data.stack };
  }
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
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [Bhuvedam:${scope}]`;
  const payload = meta !== undefined ? redact(meta) : undefined;

  if (payload !== undefined) {
    console[level === 'debug' ? 'log' : level](prefix, message, payload);
  } else {
    console[level === 'debug' ? 'log' : level](prefix, message);
  }
}

export const log = {
  debug: (scope: string, message: string, meta?: unknown) => write(scope, 'debug', message, meta),
  info: (scope: string, message: string, meta?: unknown) => write(scope, 'info', message, meta),
  warn: (scope: string, message: string, meta?: unknown) => write(scope, 'warn', message, meta),
  error: (scope: string, message: string, meta?: unknown) => write(scope, 'error', message, meta),
};

export function logDbError(scope: string, action: string, err: unknown, meta?: Record<string, unknown>): void {
  const e = err as { message?: string; code?: string; detail?: string; constraint?: string };
  log.error(scope, `${action} — database error`, {
    ...meta,
    dbMessage: e.message,
    dbCode: e.code,
    detail: e.detail,
    constraint: e.constraint,
  });
}
