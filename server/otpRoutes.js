import { Router } from 'express';
import { createOtp, validateOtp, isTwilioConfigured } from './otpService.js';
import {
  createMagicLinkOtpForEmail,
  createSupabaseAdminClient,
  findUserByPhone,
  getOrCreateUserByPhone,
  phoneToCredentials,
  upsertProfileRecord,
} from './supabaseAdmin.js';

const router = Router();

const INDIAN_PHONE_RE = /^[6-9]\d{9}$/;
const OTP_RE = /^\d{6}$/;

/**
 * Normalize raw phone input → E.164 (+91XXXXXXXXXX).
 * Returns null if invalid.
 */
function parseIndianPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10 && INDIAN_PHONE_RE.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) {
    const national = digits.slice(2);
    if (INDIAN_PHONE_RE.test(national)) return `+${digits}`;
  }
  return null;
}

// ─── POST /api/send-otp ────────────────────────────────────────────────────────

router.post('/send-otp', async (req, res) => {
  try {
    const phone = parseIndianPhone(req.body?.phone);

    if (!phone) {
      return res.status(400).json({
        error: 'INVALID_PHONE',
        message: 'Please enter a valid 10-digit Indian mobile number.',
      });
    }

    const otp = await createOtp(phone);

    return res.json({
      success: true,
      message: isTwilioConfigured()
        ? 'OTP sent to your mobile number via SMS.'
        : 'OTP generated. Enter the code shown below.',
      // Only expose OTP in dev mode (no Twilio)
      ...(!isTwilioConfigured() && { otp, devMode: true }),
    });
  } catch (err) {
    console.error('[send-otp] SEND OTP ERROR:', err);
    console.error('[send-otp] Stack:', err.stack);

    // Return detailed error in development for debugging
    return res.status(500).json({
      error: 'SEND_OTP_FAILED',
      message: process.env['NODE_ENV'] === 'production'
        ? 'Could not send OTP. Please try again.'
        : `Error: ${err.message}`,
      // Include full error details in development
      ...(process.env['NODE_ENV'] !== 'production' && {
        details: {
          message: err.message,
          stack: err.stack,
          code: err.code,
        }
      }),
    });
  }
});

// ─── POST /api/verify-otp ──────────────────────────────────────────────────────
//
// Verifies OTP and creates (or retrieves) the Supabase account for this phone.
// Accepts optional fullName and password for richer account creation.
// Returns credentials so the frontend can call supabase.auth.signInWithPassword().

router.post('/verify-otp', async (req, res) => {
  try {
    const phone = parseIndianPhone(req.body?.phone);
    const otp = String(req.body?.otp || '').trim();
    // Optional enrichment fields (from registration / buyback forms)
    const fullName = String(req.body?.fullName || '').trim() || undefined;
    const password = String(req.body?.password || '').trim() || undefined;

    if (!phone) {
      return res.status(400).json({
        error: 'INVALID_PHONE',
        message: 'Please enter a valid 10-digit Indian mobile number.',
      });
    }

    if (!OTP_RE.test(otp)) {
      return res.status(400).json({
        error: 'INVALID_OTP_FORMAT',
        message: 'OTP must be exactly 6 digits.',
      });
    }

    // ── Validate OTP (async — checks Supabase DB then memory) ─────────────────
    const result = await validateOtp(phone, otp);

    if (!result.ok) {
      const errorMap = {
        NOT_FOUND: { status: 404, error: 'OTP_NOT_FOUND', message: 'No OTP found. Please request a new one.' },
        EXPIRED:   { status: 410, error: 'OTP_EXPIRED',   message: 'OTP has expired. Please request a new one.' },
        INVALID:   { status: 422, error: 'OTP_INVALID',   message: 'Invalid OTP. Please check and try again.' },
      };
      const { status, ...body } = errorMap[result.reason] ?? { status: 422, error: 'OTP_INVALID', message: 'Invalid OTP.' };
      return res.status(status).json(body);
    }

    // ── OTP valid — get or create Supabase user ────────────────────────────────
    const credentials = await getOrCreateUserByPhone(phone, password, fullName);
    const loginToken = !credentials.isNew && !password
      ? await createMagicLinkOtpForEmail(credentials.email)
      : {};

    // ── Update profile with fullName if provided ───────────────────────────────
    if (fullName && credentials.userId) {
      const admin = createSupabaseAdminClient();
      if (admin) {
        await upsertProfileRecord(admin, credentials.userId, phone, fullName, credentials.email);
      }
    }

    return res.json({
      success: true,
      message: credentials.isNew ? 'Account created successfully.' : 'Phone number verified successfully.',
      phone,
      email: credentials.email,
      password: credentials.password,
      userId: credentials.userId,
      isNew: credentials.isNew,
      ...loginToken,
    });
  } catch (err) {
    console.error('[verify-otp] Error:', err.message);
    if (
      err.message?.toLowerCase().includes('already registered') ||
      err.message?.toLowerCase().includes('already been registered') ||
      err.message?.toLowerCase().includes('unique constraint')
    ) {
      return res.status(409).json({ error: 'PHONE_EXISTS', message: 'Phone number already registered. Please login.' });
    }
    return res.status(500).json({ error: 'AUTH_SETUP_FAILED', message: 'OTP verified but account setup failed. Please try again.' });
  }
});

// ─── POST /api/signup ────────────────────────────────────────────────────────
// Verifies OTP and creates/updates user with custom password and profile.

router.post('/signup', async (req, res) => {
  try {
    const phone = parseIndianPhone(req.body?.phone);
    const otp = String(req.body?.otp || '').trim();
    const password = String(req.body?.password || '');
    const name = String(req.body?.name || '').trim();

    if (!phone || !otp || !password || !name) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'All fields (name, phone, otp, password) are required.',
      });
    }

    // ── Check for duplicate phone before validating OTP ──────────────────────
    // ── Validate OTP (async) ─────────────────────────────────────────────────
    const otpResult = await validateOtp(phone, otp);
    if (!otpResult.ok) {
      const messages = {
        NOT_FOUND: 'No OTP found. Please request a new OTP.',
        EXPIRED:   'OTP has expired. Please request a new OTP.',
        INVALID:   'Invalid OTP. Please check and try again.',
      };
      return res.status(422).json({
        error: 'INVALID_OTP',
        message: messages[otpResult.reason] ?? 'OTP verification failed.',
      });
    }

    // ── Create user + profile ─────────────────────────────────────────────────
    const credentials = await getOrCreateUserByPhone(phone, password, name);

    return res.json({
      success: true,
      message: credentials.isNew ? 'Account created successfully.' : 'Account verified successfully.',
      email: credentials.email,
      password: credentials.password,
      userId: credentials.userId,
      isNew: credentials.isNew,
    });
  } catch (err) {
    console.error('[signup] Error:', err.message);
    return res.status(500).json({ error: 'SIGNUP_FAILED', message: err.message });
  }
});

// ─── POST /api/login ─────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const phone = parseIndianPhone(req.body?.phone);
    const password = String(req.body?.password || '');

    if (!phone || !password) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Phone and password required.' });
    }

    const existing = await findUserByPhone(phone);
    if (!existing) {
      return res.status(404).json({
        error: 'ACCOUNT_NOT_FOUND',
        message: 'Account not found. Please sign up first.',
      });
    }

    const email = existing.email || phoneToCredentials(phone).email;
    return res.json({ success: true, email, phone, userId: existing.userId });
  } catch (err) {
    return res.status(500).json({ error: 'LOGIN_FAILED', message: err.message });
  }
});

// ─── POST /api/login-otp ─────────────────────────────────────────────────────

router.post('/login-otp', async (req, res) => {
  try {
    const phone = parseIndianPhone(req.body?.phone);
    const otp = String(req.body?.otp || '').trim();

    if (!phone || !otp) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Phone and OTP required.' });
    }

    if (!OTP_RE.test(otp)) {
      return res.status(400).json({
        error: 'INVALID_OTP_FORMAT',
        message: 'OTP must be exactly 6 digits.',
      });
    }

    const otpResult = await validateOtp(phone, otp);
    if (!otpResult.ok) {
      const errorMap = {
        NOT_FOUND: { status: 404, error: 'OTP_NOT_FOUND', message: 'No OTP found. Please request a new one.' },
        EXPIRED: { status: 410, error: 'OTP_EXPIRED', message: 'OTP has expired. Please request a new OTP.' },
        INVALID: { status: 422, error: 'OTP_INVALID', message: 'Invalid OTP.' },
      };
      const { status, ...body } = errorMap[otpResult.reason] ?? errorMap.INVALID;
      return res.status(status).json(body);
    }

    const existing = await findUserByPhone(phone);
    if (!existing) {
      return res.status(404).json({
        error: 'ACCOUNT_NOT_FOUND',
        message: 'Account not found. Please sign up first.',
      });
    }

    const email = existing.email || phoneToCredentials(phone).email;
    const { emailOtp, tokenHash } = await createMagicLinkOtpForEmail(email);

    return res.json({
      success: true,
      email,
      userId: existing.userId,
      emailOtp,
      tokenHash,
    });
  } catch (err) {
    return res.status(500).json({ error: 'LOGIN_OTP_FAILED', message: err.message });
  }
});

export default router;
