import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

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

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

export function phoneForDisplay(phone: string): string {
  return phone.replace(/^\+91/, '');
}

export function farmerLoginKey(farmer: { phone?: string | null; email?: string | null }): string {
  return farmer.phone ?? farmer.email ?? '';
}

export function formatFarmerUser(farmer: {
  id: string;
  phone?: string | null;
  email?: string | null;
  name: string;
  language: string;
  locationLabel?: string | null;
  farmSize?: string | null;
  createdAt: Date;
}) {
  return {
    id: farmer.id,
    phone: farmer.phone ? phoneForDisplay(farmer.phone) : '',
    email: farmer.email ?? undefined,
    name: farmer.name,
    language: farmer.language,
    location: farmer.locationLabel ?? undefined,
    farmSize: farmer.farmSize ?? undefined,
    createdAt: farmer.createdAt.toISOString(),
  };
}

export function createFarmerToken(farmerId: string, phone: string): string {
  const header = b64urlJson({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload = b64urlJson({ sub: farmerId, phone, iat: now, exp: now + TOKEN_TTL_SEC });
  const unsigned = `${header}.${payload}`;
  const sig = createHmac('sha256', jwtSecret()).update(unsigned).digest('base64url');
  return `${unsigned}.${sig}`;
}

export function parseFarmerToken(token: string): { farmerId: string; phone: string } | null {
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
      phone?: string;
      exp?: number;
    };
    if (parsed.exp != null && parsed.exp < Math.floor(Date.now() / 1000)) return null;
    if (parsed.sub && parsed.phone) {
      return { farmerId: parsed.sub, phone: parsed.phone };
    }
  } catch {
    return null;
  }

  return null;
}
