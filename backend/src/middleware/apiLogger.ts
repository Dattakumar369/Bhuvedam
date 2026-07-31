import type { Context, Next } from 'hono';

import { appError } from '../errors/appError';
import { log } from '../logging/logger';

/** Log every API request — duration and status (passwords/OTP never logged) */
export async function apiLoggerMiddleware(c: Context, next: Next): Promise<void> {
  if (!c.req.path.startsWith('/api')) {
    await next();
    return;
  }

  const started = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  log.info('api/request', `${method} ${path}`);

  try {
    await next();
  } catch (err) {
    log.error('api/unhandled', `${method} ${path}`, { err });
    throw err;
  } finally {
    const ms = Date.now() - started;
    const status = c.res.status;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'debug';
    log[level]('api/response', `${method} ${path} → ${status}`, { ms });
  }
}

/** Global fallback — never leak stack traces or DB errors to clients */
export function registerGlobalErrorHandler(app: {
  onError: (handler: (err: Error, c: Context) => Response | Promise<Response>) => void;
  notFound: (handler: (c: Context) => Response) => void;
}): void {
  app.notFound((c) => appError(c, 'NOT_FOUND'));

  app.onError((err, c) => {
    log.error('api/crash', `${c.req.method} ${c.req.path}`, { err });
    return appError(c, 'SERVER_ERROR');
  });
}
