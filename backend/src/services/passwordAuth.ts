import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

import { eq, or } from 'drizzle-orm';

import { db } from '../db';
import { farmers } from '../db/schema/farmers';
import { log, logDbError, maskPhone } from '../logging/logger';
import { formatPhone } from './farmerAuth';
import { consumeOtpSession, getFarmerByPhone, verifyPhoneOtp } from './otpService';

const KEY_LEN = 64;
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;
const MIN_PASSWORD_LEN = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(normalizeEmail(email));
}

export function isValidIndianPhone(digits: string): boolean {
  return PHONE_RE.test(digits.replace(/\D/g, '').slice(-10));
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LEN, SCRYPT_OPTS).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;

  try {
    const derived = scryptSync(password, salt, KEY_LEN, SCRYPT_OPTS);
    const expected = Buffer.from(expectedHex, 'hex');
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < MIN_PASSWORD_LEN) {
    return `Password must be at least ${MIN_PASSWORD_LEN} characters`;
  }
  return null;
}

export async function findFarmerByIdentifier(identifier: string) {
  const trimmed = identifier.trim();
  if (!trimmed) return null;

  if (trimmed.includes('@')) {
    const email = normalizeEmail(trimmed);
    return db.query.farmers.findFirst({ where: eq(farmers.email, email) });
  }

  const phone = formatPhone(trimmed);
  return db.query.farmers.findFirst({ where: eq(farmers.phone, phone) });
}

export async function findFarmerByPhoneOrEmail(phone?: string | null, email?: string | null) {
  const conditions = [];
  if (phone) conditions.push(eq(farmers.phone, phone));
  if (email) conditions.push(eq(farmers.email, email));
  if (!conditions.length) return null;

  return db.query.farmers.findFirst({
    where: conditions.length === 1 ? conditions[0] : or(...conditions),
  });
}

export interface RegisterFarmerInput {
  name: string;
  password: string;
  phone?: string;
  email?: string;
  language?: string;
}

export async function registerFarmerWithPassword(input: RegisterFarmerInput) {
  const name = input.name.trim();
  const phoneRaw = input.phone?.trim();
  const emailRaw = input.email?.trim();

  if (!name || name.length < 2) {
    throw new Error('INVALID_NAME');
  }

  const pwdErr = validatePasswordStrength(input.password);
  if (pwdErr) throw new Error('WEAK_PASSWORD');

  if (!phoneRaw) throw new Error('PHONE_REQUIRED');

  let phone: string | null = null;
  let email: string | null = null;

  if (phoneRaw) {
    const digits = phoneRaw.replace(/\D/g, '').slice(-10);
    if (!isValidIndianPhone(digits)) throw new Error('INVALID_PHONE');
    phone = formatPhone(digits);
  }

  if (emailRaw) {
    if (!isValidEmail(emailRaw)) throw new Error('INVALID_EMAIL');
    email = normalizeEmail(emailRaw);
  }

  if (!phone && !email) throw new Error('PHONE_REQUIRED');

  const existing = await findFarmerByPhoneOrEmail(phone, email);
  if (existing) {
    if (phone && existing.phone === phone) throw new Error('PHONE_TAKEN');
    if (email && existing.email === email) throw new Error('EMAIL_TAKEN');
  }

  const passwordHash = hashPassword(input.password);
  const language = input.language?.trim() || 'te';

  log.debug('auth/register', 'inserting farmer', { phone: maskPhone(phone ?? undefined), language });

  let created;
  try {
    [created] = await db
      .insert(farmers)
      .values({
        phone,
        email,
        name,
        passwordHash,
        language,
      })
      .returning();
  } catch (err) {
    logDbError('auth/register', 'insert farmer', err, { phone: maskPhone(phone ?? undefined) });
    throw new Error('REGISTER_FAILED');
  }

  if (!created) {
    log.error('auth/register', 'insert returned no row', { phone: maskPhone(phone ?? undefined) });
    throw new Error('REGISTER_FAILED');
  }

  return created;
}

export async function loginFarmerWithPassword(identifier: string, password: string) {
  const farmer = await findFarmerByIdentifier(identifier);
  if (!farmer?.passwordHash) throw new Error('INVALID_CREDENTIALS');

  if (!verifyPassword(password, farmer.passwordHash)) {
    throw new Error('INVALID_CREDENTIALS');
  }

  if (!farmer.isActive) throw new Error('ACCOUNT_DISABLED');

  return farmer;
}

export async function updateFarmerPassword(farmerId: string, newPassword: string) {
  const pwdErr = validatePasswordStrength(newPassword);
  if (pwdErr) throw new Error('WEAK_PASSWORD');

  const [updated] = await db
    .update(farmers)
    .set({ passwordHash: hashPassword(newPassword), updatedAt: new Date() })
    .where(eq(farmers.id, farmerId))
    .returning();

  if (!updated) throw new Error('NOT_FOUND');
  return updated;
}

export async function changeFarmerPassword(
  farmerId: string,
  currentPassword: string,
  newPassword: string,
) {
  const farmer = await db.query.farmers.findFirst({ where: eq(farmers.id, farmerId) });
  if (!farmer) throw new Error('NOT_FOUND');
  if (!farmer.passwordHash) throw new Error('NO_PASSWORD');
  if (!verifyPassword(currentPassword, farmer.passwordHash)) throw new Error('WRONG_PASSWORD');
  if (currentPassword === newPassword) throw new Error('SAME_PASSWORD');

  return updateFarmerPassword(farmerId, newPassword);
}

export async function resetPasswordWithPhoneOtp(rawPhone: string, otp: string, newPassword: string) {
  const phone = formatPhone(rawPhone);
  const farmer = await getFarmerByPhone(phone);
  if (!farmer) throw new Error('NOT_FOUND');

  const check = await verifyPhoneOtp(rawPhone, otp);
  if (!check.valid) throw new Error(`OTP_${check.reason ?? 'invalid'}`);

  const updated = await updateFarmerPassword(farmer.id, newPassword);
  await consumeOtpSession(rawPhone);
  return updated;
}
