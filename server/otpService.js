import { createHash, randomInt, randomUUID } from 'crypto';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

const otpSessions = new Map();
const phoneToSession = new Map();

function hashOtp(otp) {
  return createHash('sha256').update(otp).digest('hex');
}

function nowMs() {
  return Date.now();
}

function generateOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

function cleanupExpiredSessions() {
  const now = nowMs();
  for (const [sessionId, session] of otpSessions.entries()) {
    if (session.expiresAt <= now) {
      otpSessions.delete(sessionId);
      phoneToSession.delete(`${session.role}:${session.e164Phone}`);
    }
  }
}

function normalizeCountryCode(countryCode) {
  const raw = String(countryCode || '').trim();
  const withPlus = raw ? (raw.startsWith('+') ? raw : `+${raw}`) : '+91';
  if (withPlus !== '+91') {
    return null;
  }
  return withPlus;
}

function normalizePhoneDigits(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!/^\d{10}$/.test(digits)) {
    return null;
  }
  return digits;
}

function isValidIndianMobile(phoneDigits) {
  return /^[6-9]\d{9}$/.test(phoneDigits);
}

function isAllowedTestNumber(phoneDigits, allowTestNumber) {
  return Boolean(allowTestNumber && phoneDigits === '1234567890');
}

function toE164(countryCode, phone, allowTestNumber = false) {
  const normalizedCode = normalizeCountryCode(countryCode);
  const normalizedPhone = normalizePhoneDigits(phone);
  if (!normalizedCode || !normalizedPhone) {
    return null;
  }

  if (!isValidIndianMobile(normalizedPhone) && !isAllowedTestNumber(normalizedPhone, allowTestNumber)) {
    return null;
  }

  const e164 = `${normalizedCode}${normalizedPhone}`;
  if (!/^\+91\d{10}$/.test(e164)) {
    return null;
  }
  return e164;
}

export function buildOtpMessage(template, otp, role) {
  const safeRole = role === 'vendor' ? 'Vendor' : role === 'farmer' ? 'Farmer' : 'User';
  const fallbackTemplate = 'IGO verification code: {{OTP}}. This code is valid for 5 minutes.';
  const finalTemplate = String(template || fallbackTemplate).trim();

  return finalTemplate.replaceAll('{{OTP}}', otp).replaceAll('{{ROLE}}', safeRole);
}

function normalizeE164Phone(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const compact = raw.replace(/[\s()-]/g, '');
  const hasLeadingPlus = compact.startsWith('+');
  const digits = compact.replace(/\D/g, '');
  const normalized = hasLeadingPlus ? `+${digits}` : `+${digits}`;

  if (!/^\+\d{8,15}$/.test(normalized)) {
    return '';
  }

  return normalized;
}

function mapProviderErrorMessage(message) {
  const normalized = String(message || '').trim();
  const lowered = normalized.toLowerCase();

  if (
    lowered.includes('trial accounts cannot send messages to unverified numbers') ||
    (lowered.includes('unverified') && lowered.includes('twilio'))
  ) {
    return 'Cannot send OTP to this number right now. This SMS account can only send to verified numbers. Please verify the number in Twilio or upgrade the account.';
  }

  return normalized || 'Failed to send SMS OTP.';
}

function getSessionByPhoneRole(role, e164Phone) {
  const lookupKey = `${role}:${e164Phone}`;
  const existingSessionId = phoneToSession.get(lookupKey);
  if (!existingSessionId) return null;

  const session = otpSessions.get(existingSessionId);
  if (!session) {
    phoneToSession.delete(lookupKey);
    return null;
  }

  return session;
}

export function createOrResendOtpSession({
  countryCode,
  phone,
  role = 'user',
  allowTestNumber = false,
  otpOverride,
}) {
  cleanupExpiredSessions();

  const e164Phone = toE164(countryCode, phone, allowTestNumber);
  if (!e164Phone) {
    return {
      ok: false,
      status: 400,
      error: 'Please enter a valid 10-digit Indian mobile number.',
    };
  }

  const normalizedRole = String(role || 'user').trim().toLowerCase() || 'user';
  const now = nowMs();
  const existing = getSessionByPhoneRole(normalizedRole, e164Phone);

  if (existing && !existing.verified && existing.resendAvailableAt > now) {
    const retryAfterSeconds = Math.ceil((existing.resendAvailableAt - now) / 1000);
    return {
      ok: false,
      status: 429,
      error: `Please wait ${retryAfterSeconds}s before resending OTP.`,
      retryAfterSeconds,
    };
  }

  const sessionId = existing?.sessionId || randomUUID();
  const normalizedOtpOverride = String(otpOverride || '').trim();
  const otp = /^\d{6}$/.test(normalizedOtpOverride) ? normalizedOtpOverride : generateOtp();
  const session = {
    sessionId,
    role: normalizedRole,
    e164Phone,
    otpHash: hashOtp(otp),
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    resendAvailableAt: now + RESEND_COOLDOWN_MS,
    attemptsRemaining: MAX_VERIFY_ATTEMPTS,
    verified: false,
  };

  otpSessions.set(sessionId, session);
  phoneToSession.set(`${normalizedRole}:${e164Phone}`, sessionId);

  return {
    ok: true,
    status: 200,
    sessionId,
    e164Phone,
    otp,
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    resendAfterSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
  };
}

export function verifyOtpSession({ sessionId, otp }) {
  cleanupExpiredSessions();

  const normalizedSessionId = String(sessionId || '').trim();
  const normalizedOtp = String(otp || '').trim();
  if (!normalizedSessionId) {
    return {
      ok: false,
      status: 400,
      error: 'OTP session is missing. Please request a new OTP.',
    };
  }

  if (!/^\d{6}$/.test(normalizedOtp)) {
    return {
      ok: false,
      status: 400,
      error: 'Please enter a valid 6-digit OTP.',
    };
  }

  const session = otpSessions.get(normalizedSessionId);
  if (!session) {
    return {
      ok: false,
      status: 400,
      error: 'OTP expired. Please request a new OTP.',
    };
  }

  const now = nowMs();
  if (session.expiresAt <= now) {
    otpSessions.delete(normalizedSessionId);
    phoneToSession.delete(`${session.role}:${session.e164Phone}`);
    return {
      ok: false,
      status: 410,
      error: 'OTP expired. Please request a new OTP.',
    };
  }

  if (session.attemptsRemaining <= 0) {
    return {
      ok: false,
      status: 429,
      error: 'Too many invalid attempts. Please request a new OTP.',
      attemptsRemaining: 0,
    };
  }

  if (session.otpHash !== hashOtp(normalizedOtp)) {
    session.attemptsRemaining -= 1;
    otpSessions.set(normalizedSessionId, session);

    if (session.attemptsRemaining <= 0) {
      otpSessions.delete(normalizedSessionId);
      phoneToSession.delete(`${session.role}:${session.e164Phone}`);
      return {
        ok: false,
        status: 429,
        error: 'Too many invalid attempts. Please request a new OTP.',
        attemptsRemaining: 0,
      };
    }

    return {
      ok: false,
      status: 401,
      error: 'Invalid OTP. Please try again.',
      attemptsRemaining: session.attemptsRemaining,
    };
  }

  session.verified = true;
  session.verifiedAt = now;
  otpSessions.set(normalizedSessionId, session);

  return {
    ok: true,
    status: 200,
    e164Phone: session.e164Phone,
    role: session.role,
    verifiedAt: new Date(now).toISOString(),
  };
}

export function invalidateOtpSession(sessionId) {
  const normalizedSessionId = String(sessionId || '').trim();
  if (!normalizedSessionId) return;

  const session = otpSessions.get(normalizedSessionId);
  if (!session) return;

  otpSessions.delete(normalizedSessionId);
  phoneToSession.delete(`${session.role}:${session.e164Phone}`);
}

export async function sendSmsOtpMessage({
  accountSid,
  authToken,
  smsFrom,
  toPhoneE164,
  body,
}) {
  const from = normalizeE164Phone(smsFrom);
  const to = normalizeE164Phone(toPhoneE164);
  if (!from || !to) {
    return {
      ok: false,
      status: 500,
      error: 'SMS sender configuration is invalid.',
    };
  }

  const form = new URLSearchParams();
  form.set('To', to);
  form.set('From', from);
  form.set('Body', body);

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      }
    );

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const providerMessage =
        typeof result.message === 'string' && result.message.trim().length > 0
          ? result.message
          : 'Failed to send SMS OTP.';
      return {
        ok: false,
        status: response.status,
        error: mapProviderErrorMessage(providerMessage),
      };
    }

    return {
      ok: true,
      status: 200,
      sid: result.sid,
    };
  } catch (err) {
    return {
      ok: false,
      status: 500,
      error: err instanceof Error ? err.message : 'Unexpected server error',
    };
  }
}

export function getOtpPolicy() {
  return {
    expirySeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    resendAfterSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
    maxVerifyAttempts: MAX_VERIFY_ATTEMPTS,
  };
}
