import type { Context, Next } from 'hono';

import { appError } from '../errors/appError';
import { parseAdminToken } from '../services/adminAuth';

export type AdminAuthVariables = {
  adminEmail: string;
};

export async function adminSessionAuthMiddleware(
  c: Context<{ Variables: AdminAuthVariables }>,
  next: Next,
): Promise<Response | void> {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return appError(c, 'UNAUTHORIZED');
  }

  const parsed = parseAdminToken(auth.slice(7).trim());
  if (!parsed) {
    return appError(c, 'SESSION_EXPIRED');
  }

  c.set('adminEmail', parsed.email);
  await next();
}
