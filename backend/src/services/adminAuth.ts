import { createHmac, timingSafeEqual } from 'node:crypto';

import { verifyPassword } from './passwordAuth';

const ADMIN_TOKEN_TTL_SEC = 60 * 60 * 24 * 7; // 7 days

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
  return 'bhuvedam-dev-jwt-secret-change-me';
}

function b64urlJson(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export function adminEmail(): string {
  return (process.env.ADMIN_EMAIL?.trim() || 'admin@bhuvedam.app').toLowerCase();
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = adminEmail();
  if (email.trim().toLowerCase() !== expectedEmail) return false;

  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (hash) {
    return verifyPassword(password, hash);
  }

  const plain = process.env.ADMIN_PASSWORD?.trim();
  if (!plain) {
    return process.env.NODE_ENV !== 'production' && password === 'admin123';
  }

  try {
    const a = Buffer.from(password);
    const b = Buffer.from(plain);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function createAdminToken(email: string): string {
  const header = b64urlJson({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload = b64urlJson({
    sub: 'admin',
    role: 'admin',
    email: email.toLowerCase(),
    iat: now,
    exp: now + ADMIN_TOKEN_TTL_SEC,
  });
  const unsigned = `${header}.${payload}`;
  const sig = createHmac('sha256', jwtSecret()).update(unsigned).digest('base64url');
  return `${unsigned}.${sig}`;
}

export function parseAdminToken(token: string): { email: string } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, sig] = parts;
  if (!header || !payload || !sig) return null;

  const expected = createHmac('sha256', jwtSecret()).update(`${header}.${payload}`).digest('base64url');

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub?: string;
      role?: string;
      email?: string;
      exp?: number;
    };
    if (parsed.exp != null && parsed.exp < Math.floor(Date.now() / 1000)) return null;
    if (parsed.role === 'admin' && parsed.sub === 'admin' && parsed.email) {
      return { email: parsed.email };
    }
  } catch {
    return null;
  }

  return null;
}
