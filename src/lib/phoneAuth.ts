import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

const INDIAN_PHONE_PATTERN = /^[6-9]\d{9}$/;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) return String((error as Record<string, unknown>)['message']);
  return '';
}

// ─── Phone formatting ──────────────────────────────────────────────────────────

export function formatIndianPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  const national = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  if (!INDIAN_PHONE_PATTERN.test(national)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number.');
  }
  return `+91${national}`;
}

// ─── Send OTP via Supabase Phone Auth ─────────────────────────────────────────

export type SendOtpResult = { phone: string };

export async function sendPhoneOtp(phone: string): Promise<SendOtpResult> {
  const normalized = formatIndianPhone(phone);
  const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
  if (error) throw new Error(error.message);
  return { phone: normalized };
}

// ─── Verify OTP via Supabase ───────────────────────────────────────────────────

export async function verifyPhoneOtp(phone: string, token: string): Promise<User> {
  const normalized = formatIndianPhone(phone);
  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalized,
    token: token.trim(),
    type: 'sms',
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('OTP verified but session creation failed. Please try again.');
  return data.user;
}

// ─── Login with OTP (alias for login page) ────────────────────────────────────

export async function loginWithOtp(phone: string, token: string): Promise<User> {
  return verifyPhoneOtp(phone, token);
}

// ─── Login with Password ──────────────────────────────────────────────────────

export async function loginWithPassword(phoneOrEmail: string, password: string): Promise<User> {
  const input = phoneOrEmail.trim();
  // If it looks like an email, use directly; otherwise derive from phone number
  const email = input.includes('@')
    ? input.toLowerCase()
    : `91${input.replace(/\D/g, '').slice(-10)}@phone.farmgate`;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Invalid credentials. Please check your details and try again.');
  if (!data.user) throw new Error('Login failed. Please try again.');
  return data.user;
}

// ─── Email OTP (magic link) ───────────────────────────────────────────────────

export async function sendEmailOtp(email: string): Promise<{ email: string }> {
  const normalized = email.trim().toLowerCase();
  const { error } = await supabase.auth.signInWithOtp({ email: normalized });
  if (error) throw new Error(error.message);
  return { email: normalized };
}

export async function loginWithEmailOtp(email: string, token: string): Promise<User> {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'magiclink',
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('OTP verified but session creation failed.');
  return data.user;
}

// ─── Error mapping ────────────────────────────────────────────────────────────

export function mapPhoneAuthError(error: unknown, _phase: 'send' | 'verify' | 'login' | 'signup'): string {
  const raw = getErrorMessage(error).toLowerCase();

  if (raw.includes('invalid otp') || raw.includes('token has expired') || raw.includes('otp expired')) return 'OTP expired or invalid. Please request a new one.';
  if (raw.includes('phone') && raw.includes('invalid')) return 'Please enter a valid 10-digit mobile number.';
  if (raw.includes('rate limit') || raw.includes('too many')) return 'Too many attempts. Please wait a moment before trying again.';
  if (raw.includes('network') || raw.includes('failed to fetch')) return 'Network error. Please check your internet connection.';
  if (raw.includes('invalid credentials')) return 'Incorrect phone or password.';
  if (raw.includes('sms')) return 'Could not send SMS. Please try again.';

  return getErrorMessage(error) || 'Something went wrong. Please try again.';
}

// ─── Profile helper ───────────────────────────────────────────────────────────

export type { Profile } from './supabase';

export async function getOrCreateProfile(user: User) {
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (existing) return existing;

  let phone: string | null = user.phone ?? null;
  if (!phone && user.email?.endsWith('@phone.farmgate')) {
    phone = `+${user.email.replace('@phone.farmgate', '')}`;
  }

  const fullName =
    (user.user_metadata?.['full_name'] as string | undefined) ??
    (user.user_metadata?.['name'] as string | undefined) ?? null;

  const { data: created, error: createError } = await supabase
    .from('profiles')
    .insert({ id: user.id, phone, email: user.email ?? null, full_name: fullName })
    .select('*')
    .single();

  if (!createError && created) return created;

  if (createError?.code === '23505') {
    const { data: raced } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (raced) return raced;
  }

  throw new Error(createError?.message ?? 'Failed to create profile.');
}

// ─── Legacy exports (kept for compatibility) ──────────────────────────────────

export type VerifyPhoneOtpOptions = { fullName?: string; password?: string };
export type VerifyPhoneOtpResult = { phone: string; user?: User; isNew?: boolean; email?: string };

export async function sendOtp(phone: string): Promise<SendOtpResult> {
  return sendPhoneOtp(phone);
}

export async function signupAccount(data: { name: string; phone: string; otp: string; password?: string }): Promise<User> {
  return verifyPhoneOtp(data.phone, data.otp);
}
