import type { ApplicationVerifier, ConfirmationResult } from 'firebase/auth';
import { signInWithPhoneNumber } from 'firebase/auth';
import type { User } from '@supabase/supabase-js';
import { supabase, type Profile } from './supabase';
import { firebaseAuth } from './firebase';

const INDIAN_PHONE_PATTERN = /^[6-9]\d{9}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (isRecord(error) && typeof error['message'] === 'string') return error['message'];
  return '';
}

// ─── Phone formatting ─────────────────────────────────────────────────────────

export function formatIndianPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  const national = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;

  if (!INDIAN_PHONE_PATTERN.test(national)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number.');
  }

  return `+91${national}`;
}

// ─── API call helper (Express server) ────────────────────────────────────────

async function apiPost(endpoint: string, body: Record<string, string>) {
  const res = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({})) as Record<string, unknown>;

  if (!res.ok) {
    // Log detailed error info in development
    if (import.meta.env.DEV) {
      console.error(`[apiPost] POST /api/${endpoint} failed:`, {
        status: res.status,
        error: json['error'],
        message: json['message'],
        details: json['details'],
        fullResponse: json,
      });
    }

    // Surface specific errors clearly
    const message = typeof json['message'] === 'string'
      ? json['message']
      : `Request failed (${res.status})`;
    const err = new Error(message);
    // Attach the error code for programmatic checks
    (err as Error & { code?: string; status?: number })['code'] =
      typeof json['error'] === 'string' ? json['error'] : undefined;
    (err as Error & { status?: number })['status'] = res.status;
    throw err;
  }

  return json;
}

// ─── Firebase OTP state ───────────────────────────────────────────────────────

let _pendingConfirmation: ConfirmationResult | null = null;

// ─── OTP: Send ───────────────────────────────────────────────────────────────

export type SendOtpResult = { phone: string };

/**
 * Send OTP via Firebase Phone Auth.
 * Firebase sends the SMS automatically — no external SMS API needed.
 */
export async function sendOtp(
  phone: string,
  appVerifier: ApplicationVerifier
): Promise<SendOtpResult> {
  const normalizedPhone = formatIndianPhone(phone);

  _pendingConfirmation = await signInWithPhoneNumber(
    firebaseAuth,
    normalizedPhone,
    appVerifier
  );

  return { phone: normalizedPhone };
}

// ─── OTP: Verify ─────────────────────────────────────────────────────────────

export type VerifyOtpResult = { phone: string; user: User };

/**
 * Verify OTP via Firebase, then sign into Supabase.
 * Firebase proves phone ownership; Supabase manages the app session.
 */
export async function verifyOtp(phone: string, token: string): Promise<VerifyOtpResult> {
  if (!_pendingConfirmation) {
    throw new Error('No OTP request found. Please request a new OTP.');
  }

  if (!/^\d{6}$/.test(token.trim())) {
    throw new Error('Please enter a valid 6-digit OTP.');
  }

  // Step 1: Firebase confirms OTP — proves the user owns the phone
  const credential = await _pendingConfirmation.confirm(token.trim());
  const verifiedPhone = credential.user.phoneNumber ?? formatIndianPhone(phone);

  // Sign out of Firebase — we use Supabase for the actual app session
  await firebaseAuth.signOut();
  _pendingConfirmation = null;

  // Step 2: Exchange verified phone for Supabase credentials via Express
  const digits = verifiedPhone.replace(/^\+91/, '');
  const json = await apiPost('supabase-credentials', { phone: digits });

  const email = typeof json['email'] === 'string' ? json['email'] : null;
  const password = typeof json['password'] === 'string' ? json['password'] : null;

  if (!email || !password) {
    throw new Error('Account setup failed. Check SUPABASE_SERVICE_ROLE_KEY in server/.env');
  }

  // Step 3: Sign into Supabase — creates the real app session
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(`Supabase login failed: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('Login succeeded but no user returned. Please try again.');
  }

  return { phone: verifiedPhone, user: data.user };
}

// ─── Profile helpers ──────────────────────────────────────────────────────────

export async function getOrCreateProfile(user: User): Promise<Profile> {
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (existingProfile) return existingProfile as Profile;

  let phone: string | null = user.phone ?? null;
  if (!phone && user.email?.endsWith('@phone.farmgate')) {
    const digits = user.email.replace('@phone.farmgate', '');
    phone = `+${digits}`;
  }

  const fullName =
    (user.user_metadata?.['full_name'] as string | undefined) ??
    (user.user_metadata?.['name'] as string | undefined) ??
    null;

  const payload = {
    id: user.id,
    phone,
    email: user.email ?? null,
    full_name: fullName,
  };

  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .insert(payload)
    .select('*')
    .single();

  if (!createError && createdProfile) return createdProfile as Profile;

  if (createError?.code === '23505') {
    const { data: racedProfile, error: raceErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (raceErr) throw new Error(raceErr.message);
    return racedProfile as Profile;
  }

  throw new Error(createError?.message ?? 'Failed to create profile.');
}

// ─── Buyback-form compat exports ─────────────────────────────────────────────
// The buyback form verifies phone ownership inline (not login).
// It uses the Express OTP endpoints directly (no Firebase RecaptchaVerifier needed).

export async function sendPhoneOtp(phone: string): Promise<{ phone: string; otp?: string }> {
  const normalizedPhone = formatIndianPhone(phone);
  const digits = normalizedPhone.replace('+91', '');

  if (import.meta.env.DEV) {
    console.log('[OTP] Sending OTP for phone:', digits, '(normalized:', normalizedPhone, ')');
  }

  const json = await apiPost('send-otp', { phone: digits });

  // Extract OTP from response (support both 'otp' and 'devOtp' fields)
  const otpValue = typeof json['otp'] === 'string' ? json['otp'] : undefined;

  if (import.meta.env.DEV && otpValue) {
    console.log('[OTP] Received OTP from server:', otpValue);
  }

  return {
    phone: normalizedPhone,
    otp: otpValue,
  };
}

// Options for OTP verification with account creation
export type VerifyPhoneOtpOptions = {
  /** User's display name — stored on the profile row */
  fullName?: string;
  /** Custom password. Omit to use the deterministic phone-based password. */
  password?: string;
};

export type VerifyPhoneOtpResult = {
  phone: string;
  /** Authenticated Supabase user — present when auto-login succeeded */
  user?: User;
  /** Whether a new account was created (vs. existing account found) */
  isNew?: boolean;
  /** Supabase email credential (for manual sign-in if auto-login is skipped) */
  email?: string;
};

/**
 * Verify an OTP that was sent via sendPhoneOtp().
 *
 * After successful OTP validation the server creates (or retrieves) a Supabase
 * auth account for this phone number, then this function automatically signs
 * the user into Supabase so a session is active on the frontend.
 *
 * @param phone     E.164 or 10-digit Indian phone
 * @param token     The 6-digit OTP the user entered
 * @param options   Optional fullName / password for richer account creation
 */
export async function verifyPhoneOtp(
  phone: string,
  token: string,
  options: VerifyPhoneOtpOptions = {}
): Promise<VerifyPhoneOtpResult> {
  const normalizedPhone = formatIndianPhone(phone);
  const digits = normalizedPhone.replace('+91', '');

  // Build request body — only include optional fields if they have values
  const body: Record<string, string> = { phone: digits, otp: token.trim() };
  if (options.fullName) body['fullName'] = options.fullName;
  if (options.password) body['password'] = options.password;

  const json = await apiPost('verify-otp', body);

  const returnedPhone =
    typeof json['phone'] === 'string' ? json['phone'] : normalizedPhone;
  const email =
    typeof json['email'] === 'string' ? json['email'] : undefined;
  const serverPassword =
    typeof json['password'] === 'string' ? json['password'] : undefined;
  const emailOtp =
    typeof json['emailOtp'] === 'string'
      ? json['emailOtp']
      : typeof json['email_otp'] === 'string'
      ? json['email_otp']
      : undefined;
  let tokenHash =
    typeof json['tokenHash'] === 'string'
      ? json['tokenHash']
      : typeof json['token_hash'] === 'string'
      ? json['token_hash']
      : undefined;
  const isNew =
    typeof json['isNew'] === 'boolean' ? json['isNew'] : undefined;

  if (!tokenHash) {
    const actionLink =
      typeof json['actionLink'] === 'string'
        ? json['actionLink']
        : typeof json['action_link'] === 'string'
        ? json['action_link']
        : '';
    if (actionLink) {
      try {
        tokenHash = new URL(actionLink).searchParams.get('token') ?? undefined;
      } catch {
        const match = actionLink.match(/[?&]token=([^&]+)/i);
        tokenHash = match?.[1] ? decodeURIComponent(match[1]) : undefined;
      }
    }
  }

  // Auto-login: sign into Supabase so the session is active immediately
  let user: User | undefined;
  if (email && (tokenHash || emailOtp)) {
    const auth = tokenHash
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' })
      : await supabase.auth.verifyOtp({ email, token: emailOtp as string, type: 'magiclink' });

    if (auth.error) {
      throw new Error(`Supabase login failed: ${auth.error.message}`);
    }
    if (auth.data.user) {
      user = auth.data.user;
    }
  } else if (email && serverPassword) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: serverPassword,
      });
      if (authError) {
        throw new Error(authError.message);
      } else if (authData.user) {
        user = authData.user;
      }
    } catch (loginErr) {
      const message = loginErr instanceof Error ? loginErr.message : String(loginErr);
      throw new Error(`Supabase login failed: ${message}`);
    }
  }

  if (!user) {
    throw new Error('OTP verified but session creation failed.');
  }

  return { phone: returnedPhone, user, isNew, email };
}

// ─── Account Management (Bypasses Firebase reCAPTCHA) ────────────────────────

export type SignupData = {
  name: string;
  phone: string;
  otp: string;
  password?: string; // Optional if we want to allow OTP-only signup
};

/**
 * Sign up a new user using Name, Phone, OTP, and a custom Password.
 */
export async function signupAccount(data: {
  name: string;
  phone: string;
  otp: string;
  password?: string;
}): Promise<User> {
  const digits = data.phone.replace(/\D/g, '').slice(-10);
  const json = await apiPost('signup', {
    name: data.name,
    phone: digits,
    otp: data.otp,
    password: data.password || '',
  });

  const email = json['email'] as string;
  const password = json['password'] as string;

  // Sign into Supabase with the credentials returned by our backend
  const { data: auth, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!auth.user) throw new Error('Signup succeeded but session creation failed.');

  return auth.user;
}

/**
 * Login using Phone and Password.
 */
export async function loginWithPassword(phone: string, password: string): Promise<User> {
  const digits = phone.replace(/\D/g, '').slice(-10);
  // Get the matching email for this phone number
  const json = await apiPost('login', { phone: digits, password });

  const email = json['email'] as string;

  const { data: auth, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Invalid credentials. Please check your phone/password.');
  if (!auth.user) throw new Error('Login failed. Please try again.');

  return auth.user;
}

/**
 * Login using Phone and OTP.
 */
export async function loginWithOtp(phone: string, otp: string): Promise<User> {
  const digits = phone.replace(/\D/g, '').slice(-10);
  const json = await apiPost('login-otp', { phone: digits, otp });

  const email = typeof json['email'] === 'string' ? json['email'] : '';
  const emailOtp =
    typeof json['emailOtp'] === 'string'
      ? json['emailOtp']
      : typeof json['email_otp'] === 'string'
      ? json['email_otp']
      : '';
  let tokenHash =
    typeof json['tokenHash'] === 'string'
      ? json['tokenHash']
      : typeof json['token_hash'] === 'string'
      ? json['token_hash']
      : '';
  const password =
    typeof json['password'] === 'string'
      ? json['password']
      : '';

  if (!tokenHash) {
    const actionLink =
      typeof json['actionLink'] === 'string'
        ? json['actionLink']
        : typeof json['action_link'] === 'string'
        ? json['action_link']
        : '';
    if (actionLink) {
      try {
        tokenHash = new URL(actionLink).searchParams.get('token') ?? '';
      } catch {
        const match = actionLink.match(/[?&]token=([^&]+)/i);
        tokenHash = match?.[1] ? decodeURIComponent(match[1]) : '';
      }
    }
  }

  if (!email) {
    throw new Error('OTP verified but account lookup failed.');
  }
  if (!tokenHash && !emailOtp && password) {
    const legacyAuth = await supabase.auth.signInWithPassword({ email, password });
    if (legacyAuth.error) throw legacyAuth.error;
    if (legacyAuth.data.user) return legacyAuth.data.user;
  }
  if (!tokenHash && !emailOtp) {
    throw new Error('OTP verified but login token was not generated.');
  }

  const auth = tokenHash
    ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' })
    : await supabase.auth.verifyOtp({ email, token: emailOtp, type: 'magiclink' });

  if (auth.error) throw auth.error;
  if (!auth.data.user) throw new Error('OTP verified but session creation failed.');

  return auth.data.user;
}

// ─── Error mapping ────────────────────────────────────────────────────────────

export function mapPhoneAuthError(error: unknown, _phase: 'send' | 'verify' | 'login' | 'signup'): string {
  const raw = getErrorMessage(error).toLowerCase();

  if (raw.includes('account not found')) return 'Account not found. Please sign up first.';
  if (raw.includes('phone number already registered') || raw.includes('phone_exists')) {
    return 'Phone number already registered. Please login.';
  }
  if (raw.includes('missing_fields')) return 'Please fill in all required fields.';
  if (raw.includes('invalid otp') || raw.includes('invalid_otp') || raw.includes('otp_invalid')) {
    return 'Invalid OTP.';
  }
  if (raw.includes('otp verification failed')) return 'Invalid OTP.';
  if (raw.includes('otp_expired')) return 'OTP has expired. Please request a new one.';
  if (raw.includes('otp_not_found') || raw.includes('no otp found')) return 'No OTP found. Please request a new one.';
  if (raw.includes('invalid_phone')) return 'Please enter a valid 10-digit mobile number.';
  if (raw.includes('invalid credentials')) return 'Incorrect phone or password.';
  if (raw.includes('already registered')) return 'This phone number is already registered. Please login.';

  // Firebase error codes (keep for fallback)
  if (raw.includes('auth/invalid-verification-code') || raw.includes('auth/invalid-verification-id')) {
    return 'Invalid OTP. Please check and try again.';
  }
  if (raw.includes('auth/code-expired')) {
    return 'OTP expired. Please request a new OTP.';
  }
  if (raw.includes('auth/too-many-requests')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  if (raw.includes('auth/quota-exceeded')) {
    return 'SMS quota exceeded. Please try again later.';
  }

  // Server / network errors
  if (raw.includes('network') || raw.includes('failed to fetch')) {
    return 'Network error. Please check your internet connection.';
  }

  return getErrorMessage(error) || 'Something went wrong. Please try again.';
}
