import type { Context, Next } from 'hono';

import { appError } from '../errors/appError';
import { parseFarmerToken } from '../services/farmerAuth';

export type FarmerAuthVariables = {
  farmerId: string;
  farmerPhone: string;
};

export async function farmerAuthMiddleware(
  c: Context<{ Variables: FarmerAuthVariables }>,
  next: Next,
): Promise<Response | void> {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return appError(c, 'UNAUTHORIZED');
  }

  const parsed = parseFarmerToken(auth.slice(7).trim());
  if (!parsed) {
    return appError(c, 'SESSION_EXPIRED');
  }

  c.set('farmerId', parsed.farmerId);
  c.set('farmerPhone', parsed.phone);
  await next();
}
