/**
 * OTP Service — creates and validates one-time passwords.
 *
 * Storage strategy (in priority order):
 *   1. Supabase `phone_otps` table (if admin client is configured)
 *   2. In-memory Map fallback (dev / no DB)
 *
 * SMS delivery:
 *   - TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN set → sends real SMS
 *   - Otherwise → OTP printed to console + returned in API response (dev mode)
 *
 * Required table (run migration in Supabase SQL Editor):
 *   create table public.phone_otps (
 *     id          uuid primary key default gen_random_uuid(),
 *     phone_number text not null,
 *     otp_code    text not null,
 *     expires_at  timestamptz not null,
 *     is_used     boolean not null default false,
 *     created_at  timestamptz not null default now()
 *   );
 */

import './env.js';
import { createSupabaseAdminClient } from './supabaseAdmin.js';
import { sendSmsOtp } from './smsService.js';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_LENGTH = 6;

// ─── In-memory fallback ────────────────────────────────────────────────────────
/** @type {Map<string, { otp: string, expiresAt: number }>} */
const memStore = new Map();

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function isTwilioConfigured() {
  return !!(process.env['TWILIO_ACCOUNT_SID'] && process.env['TWILIO_AUTH_TOKEN']);
}

export function isSmsConfigured() {
  return isTwilioConfigured() || !!process.env['FAST2SMS_API_KEY'];
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function generateOtp() {
  return String(Math.floor(Math.random() * 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
}

function normalizeOtp(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === OTP_LENGTH) return digits;
  if (digits.length < OTP_LENGTH) return digits.padStart(OTP_LENGTH, '0');
  return digits.slice(-OTP_LENGTH);
}

// ─── Supabase OTP storage ──────────────────────────────────────────────────────

async function storeOtpInSupabase(phone, otp, expiresAt) {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;

  try {
    // Mark old OTPs as used
    await admin.from('phone_otps').update({ is_used: true }).eq('phone_number', phone).eq('is_used', false);

    // Insert new OTP
    const { error } = await admin.from('phone_otps').insert({
      phone_number: phone,
      otp_code: otp,
      expires_at: new Date(expiresAt).toISOString(),
      is_used: false,
    });
    if (error) {
      console.error('[OTP] Supabase insert error:', error.message, '| code:', error.code);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[OTP] Supabase store exception:', err.message);
    return false;
  }
}

async function validateOtpFromSupabase(phone, token) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  try {
    const { data, error } = await admin
      .from('phone_otps')
      .select('id, otp_code, expires_at, is_used')
      .eq('phone_number', phone)
      .eq('is_used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[OTP] Supabase validate error:', error.message);
      return null; // fall through to memory
    }
    if (!data) return { ok: false, reason: 'NOT_FOUND' };
    if (new Date(data.expires_at).getTime() < Date.now()) {
      await admin.from('phone_otps').update({ is_used: true }).eq('id', data.id);
      return { ok: false, reason: 'EXPIRED' };
    }
    const expectedOtp = normalizeOtp(data.otp_code);
    const providedOtp = normalizeOtp(token);
    if (!expectedOtp || !providedOtp || expectedOtp !== providedOtp) {
      return { ok: false, reason: 'INVALID' };
    }

    await admin.from('phone_otps').update({ is_used: true }).eq('id', data.id);
    return { ok: true };
  } catch (err) {
    console.error('[OTP] Supabase validate exception:', err.message);
    return null; // fall through to memory
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Create + store an OTP, then deliver via SMS or console.
 * @param {string} phone  E.164 or 10-digit number
 * @returns {Promise<string>} The OTP (caller decides if it exposes it)
 */
export async function createOtp(phone) {
  const key = normalizePhone(phone);
  const otp = generateOtp();
  const expiresAt = Date.now() + OTP_TTL_MS;

  const savedToDb = await storeOtpInSupabase(phone, otp, expiresAt);
  if (!savedToDb) {
    // Memory fallback
    memStore.set(key, { otp, expiresAt });
    console.warn('[OTP] Falling back to in-memory store (table missing or DB unavailable).');
  }

  // ── SMS delivery ──────────────────────────────────────────────────────────
  if (isTwilioConfigured()) {
    try {
      const { default: twilio } = await import('twilio');
      const client = twilio(process.env['TWILIO_ACCOUNT_SID'], process.env['TWILIO_AUTH_TOKEN']);
      const toNumber = phone.startsWith('+') ? phone : `+${key}`;
      await client.messages.create({
        body: `Your Farmgate Mandi OTP is: ${otp}. Valid for 5 minutes. Do not share.`,
        from: process.env['TWILIO_PHONE_NUMBER'],
        to: toNumber,
      });
      console.log(`[OTP] SMS sent to ${toNumber} via Twilio`);
    } catch (smsErr) {
      console.error('[OTP] Twilio SMS failed:', smsErr.message);
      throw smsErr;
    }
  } else if (process.env['FAST2SMS_API_KEY']) {
    await sendSmsOtp(phone, otp);
  } else {
    // Dev mode — no SMS provider configured
    console.log('\n[OTP] ─────────────────────────────────────────');
    console.log(`[OTP]  Phone   : +${key}`);
    console.log(`[OTP]  Code    : ${otp}`);
    console.log(`[OTP]  Expires : ${new Date(expiresAt).toLocaleTimeString('en-IN')}`);
    console.log('[OTP] ─────────────────────────────────────────\n');
  }

  return otp;
}

/**
 * Validate an OTP. Checks Supabase first, falls back to memory.
 * Always async.
 * @param {string} phone
 * @param {string} token
 * @returns {Promise<{ ok: boolean, reason?: 'NOT_FOUND'|'EXPIRED'|'INVALID' }>}
 */
export async function validateOtp(phone, token) {
  // Try DB first
  const dbResult = await validateOtpFromSupabase(phone, token);
  if (dbResult !== null) return dbResult;

  // Memory fallback
  const key = normalizePhone(phone);
  const record = memStore.get(key);
  if (!record) return { ok: false, reason: 'NOT_FOUND' };
  if (Date.now() > record.expiresAt) {
    memStore.delete(key);
    return { ok: false, reason: 'EXPIRED' };
  }
  const expectedOtp = normalizeOtp(record.otp);
  const providedOtp = normalizeOtp(token);
  if (!expectedOtp || !providedOtp || expectedOtp !== providedOtp) {
    return { ok: false, reason: 'INVALID' };
  }
  memStore.delete(key);
  return { ok: true };
}
