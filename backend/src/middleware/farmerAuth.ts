import type { Context, Next } from 'hono';

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
    return c.json({ error: 'Unauthorized', message: 'Missing bearer token' }, 401);
  }

  const parsed = parseFarmerToken(auth.slice(7).trim());
  if (!parsed) {
    return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401);
  }

  c.set('farmerId', parsed.farmerId);
  c.set('farmerPhone', parsed.phone);
  await next();
}
