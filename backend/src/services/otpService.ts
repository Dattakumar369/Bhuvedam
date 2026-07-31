import { createHash, randomInt } from 'node:crypto';
import { and, desc, eq, gt, isNotNull } from 'drizzle-orm';

import { db } from '../db';
import { farmers } from '../db/schema/farmers';
import { otpCodes } from '../db/schema/otpCodes';
import { formatPhone, phoneForDisplay } from './farmerAuth';

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const TWOFACTOR_SESSION_PREFIX = 'tf:';

type OtpChannel = 'voice' | 'sms';
type TwoFactorResponse = { Status?: string; Details?: string; OTP?: string };

function hashOtp(code: string, phone: string): string {
  return createHash('sha256')
    .update(`${phone}:${code}:${process.env.OTP_PEPPER ?? 'bhuvedam'}`)
    .digest('hex');
}

function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

function mobileTenDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits.slice(-10);
}

function resolveOtpChannel(): OtpChannel {
  const raw = process.env.OTP_CHANNEL?.trim().toLowerCase();
  if (raw === 'sms') return 'sms';
  return 'voice';
}

async function parseTwoFactorJson(res: Response): Promise<TwoFactorResponse> {
  try {
    return (await res.json()) as TwoFactorResponse;
  } catch {
    return {};
  }
}

/**
 * Voice OTP call — no DLT template required (use until SMS DLT is approved).
 * 2Factor generates OTP and reads it on the call; returns a session id for verify.
 */
async function sendVoiceCallOtp(phone: string): Promise<string | null> {
  const apiKey = process.env.TWOFACTOR_API_KEY?.trim();
  if (!apiKey) return null;

  const mobile = mobileTenDigits(phone);
  const url = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/VOICE/${mobile}/AUTOGEN`;

  try {
    const res = await fetch(url);
    const data = await parseTwoFactorJson(res);
    if (!res.ok || data.Status !== 'Success' || !data.Details) {
      console.error('[OTP] Voice call failed', data.Details ?? res.status);
      return null;
    }

    console.log(`[OTP] Voice call initiated → ${phoneForDisplay(phone)}`);
    return data.Details;
  } catch (err) {
    console.error('[OTP] Voice call failed', err);
    return null;
  }
}

/**
 * Transactional SMS — requires approved DLT template + sender id.
 */
async function sendTransactionalSmsOtp(phone: string, code: string): Promise<boolean> {
  const apiKey = process.env.TWOFACTOR_API_KEY?.trim();
  const templateName = process.env.TWOFACTOR_OTP_TEMPLATE?.trim() || 'BhuvedamLoginOTP';
  const senderId = process.env.TWOFACTOR_SENDER_ID?.trim() || 'BHUVED';
  if (!apiKey) return false;

  const mobile = mobileTenDigits(phone);
  const url = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/ADDON_SERVICES/SEND/TSMS`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        From: senderId,
        To: mobile,
        TemplateName: templateName,
        VAR1: code,
      }),
    });

    const data = await parseTwoFactorJson(res);
    if (!res.ok || data.Status !== 'Success') {
      console.error('[OTP] TSMS failed', data.Details ?? res.status);
      return false;
    }

    console.log(`[OTP] Text SMS sent (TSMS/${templateName}/${senderId}) → ${phoneForDisplay(phone)}`);
    return true;
  } catch (err) {
    console.error('[OTP] TSMS send failed', err);
    return false;
  }
}

function storeTwoFactorSession(sessionId: string): string {
  return `${TWOFACTOR_SESSION_PREFIX}${sessionId}`;
}

function readTwoFactorSession(codeHash: string): string | null {
  return codeHash.startsWith(TWOFACTOR_SESSION_PREFIX)
    ? codeHash.slice(TWOFACTOR_SESSION_PREFIX.length)
    : null;
}

async function verifyTwoFactorOtp(sessionId: string, otp: string): Promise<boolean> {
  const apiKey = process.env.TWOFACTOR_API_KEY?.trim();
  if (!apiKey || !sessionId) return false;

  const url = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/VERIFY/${encodeURIComponent(sessionId)}/${otp}`;

  try {
    const res = await fetch(url);
    const data = await parseTwoFactorJson(res);
    return res.ok && data.Status === 'Success' && data.Details === 'OTP Matched';
  } catch (err) {
    console.error('[OTP] 2Factor verify failed', err);
    return false;
  }
}

export async function sendPhoneOtp(rawPhone: string): Promise<{
  sent: boolean;
  expiresInSec: number;
  channel?: OtpChannel;
  devOtp?: string;
}> {
  const phone = formatPhone(rawPhone);

  const [recent] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), gt(otpCodes.createdAt, new Date(Date.now() - OTP_COOLDOWN_MS))))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (recent) {
    const waitSec = Math.ceil(
      (recent.createdAt.getTime() + OTP_COOLDOWN_MS - Date.now()) / 1000,
    );
    throw new Error(`WAIT_${Math.max(waitSec, 1)}`);
  }

  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  const twoFactorKey = process.env.TWOFACTOR_API_KEY?.trim();
  const devMode = process.env.OTP_DEV_MODE === 'true';
  const channel = resolveOtpChannel();

  if (twoFactorKey && !devMode) {
    if (channel === 'sms') {
      const code = generateOtp();
      const tsmsOk = await sendTransactionalSmsOtp(phone, code);
      if (!tsmsOk) throw new Error('SMS_FAILED');

      await db.insert(otpCodes).values({
        phone,
        codeHash: hashOtp(code, phone),
        expiresAt,
      });
      return { sent: true, expiresInSec: OTP_TTL_MS / 1000, channel: 'sms' };
    }

    const sessionId = await sendVoiceCallOtp(phone);
    if (!sessionId) throw new Error('VOICE_FAILED');

    await db.insert(otpCodes).values({
      phone,
      codeHash: storeTwoFactorSession(sessionId),
      expiresAt,
    });
    return { sent: true, expiresInSec: OTP_TTL_MS / 1000, channel: 'voice' };
  }

  const code = generateOtp();
  await db.insert(otpCodes).values({
    phone,
    codeHash: hashOtp(code, phone),
    expiresAt,
  });

  if (devMode) {
    console.log(`[OTP dev] ${phoneForDisplay(phone)} → ${code}`);
    return { sent: true, expiresInSec: OTP_TTL_MS / 1000, channel: 'voice', devOtp: code };
  }

  throw new Error('SMS_FAILED');
}

export async function verifyPhoneOtp(
  rawPhone: string,
  otp: string,
): Promise<{ valid: boolean; reason?: 'expired' | 'invalid' | 'max_attempts' }> {
  const phone = formatPhone(rawPhone);
  const code = otp.replace(/\D/g, '');

  if (code.length !== 6) return { valid: false, reason: 'invalid' };

  const [row] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), gt(otpCodes.expiresAt, new Date())))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (!row) return { valid: false, reason: 'expired' };

  if (row.attempts >= MAX_ATTEMPTS) return { valid: false, reason: 'max_attempts' };

  let match = false;
  const sessionId = readTwoFactorSession(row.codeHash);
  if (sessionId) {
    match = await verifyTwoFactorOtp(sessionId, code);
  } else {
    match = row.codeHash === hashOtp(code, phone);
  }

  await db
    .update(otpCodes)
    .set({ attempts: row.attempts + 1 })
    .where(eq(otpCodes.id, row.id));

  if (!match) return { valid: false, reason: 'invalid' };

  await db
    .update(otpCodes)
    .set({ verifiedAt: new Date() })
    .where(eq(otpCodes.id, row.id));

  return { valid: true };
}

/** Name step after OTP — OTP already verified, not deleted yet */
export async function hasVerifiedOtpSession(rawPhone: string): Promise<boolean> {
  const phone = formatPhone(rawPhone);
  const [row] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.phone, phone),
        gt(otpCodes.expiresAt, new Date()),
        isNotNull(otpCodes.verifiedAt),
      ),
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);
  return Boolean(row);
}

export async function consumeOtpSession(rawPhone: string): Promise<void> {
  const phone = formatPhone(rawPhone);
  await db.delete(otpCodes).where(eq(otpCodes.phone, phone));
}

export async function getFarmerByPhone(phone: string) {
  return db.query.farmers.findFirst({
    where: eq(farmers.phone, formatPhone(phone)),
  });
}
