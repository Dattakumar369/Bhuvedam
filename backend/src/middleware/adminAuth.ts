import type { Context, Next } from 'hono';

import { appError } from '../errors/appError';

/** Protects sync/admin routes — set ADMIN_API_KEY in production */
export async function adminAuthMiddleware(c: Context, next: Next): Promise<Response | void> {
  const secret = process.env.ADMIN_API_KEY?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return appError(c, 'FORBIDDEN');
    }
    await next();
    return;
  }

  const headerKey = c.req.header('x-admin-key')?.trim();
  const bearer = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '').trim();
  const key = headerKey || bearer;

  if (!key || key !== secret) {
    return appError(c, 'FORBIDDEN');
  }

  await next();
}
