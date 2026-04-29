import './env.js';

import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

let cachedClient;
let cachedUrl = '';
let cachedServiceRoleKey = '';

function normalizeEnvValue(value) {
  return String(value || '').trim();
}

export function getSupabaseAdminConfig(env = process.env) {
  return {
    url: normalizeEnvValue(env['SUPABASE_URL'] || env['VITE_SUPABASE_URL']),
    serviceRoleKey: normalizeEnvValue(env['SUPABASE_SERVICE_ROLE_KEY']),
  };
}

export function createSupabaseAdminClient(env = process.env) {
  const config = getSupabaseAdminConfig(env);
  const isValidUrl = config.url.startsWith('https://') || config.url.startsWith('http://');
  if (!config.url || !isValidUrl || !config.serviceRoleKey) return null;

  if (
    cachedClient &&
    cachedUrl === config.url &&
    cachedServiceRoleKey === config.serviceRoleKey
  ) {
    return cachedClient;
  }

  cachedUrl = config.url;
  cachedServiceRoleKey = config.serviceRoleKey;
  cachedClient = createClient(config.url, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return cachedClient;
}

// ─── Phone → deterministic Supabase credentials ───────────────────────────────

/**
 * Convert a phone number into a deterministic email + password pair.
 */
export function phoneToCredentials(phone) {
  const digits = String(phone).replace(/\D/g, '');
  const national = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  const e164 = `+91${national}`;
  const email = `91${national}@phone.farmgate`;
  const secret = process.env['OTP_JWT_SECRET'] || 'farmgate-otp-change-me-in-production';
  const password = createHmac('sha256', secret).update(e164).digest('hex');
  return { email, password, e164 };
}

// ─── Profile helpers ──────────────────────────────────────────────────────────

/**
 * Upsert a row in public.profiles using the service-role client.
 * Exported so otpRoutes.js can call it directly.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} id        Supabase auth user UUID
 * @param {string} phone     E.164 (+91XXXXXXXXXX)
 * @param {string} fullName
 * @param {string} email
 */
export async function upsertProfileRecord(admin, id, phone, fullName, email) {
  const { error } = await admin
    .from('profiles')
    .upsert(
      {
        id,
        email,
        phone,
        full_name: fullName,
        role: 'user',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.warn('[supabaseAdmin] upsertProfileRecord failed:', error.message);
  }
}

function normalizePhoneDigits(value) {
  return String(value || '').replace(/\D/g, '').slice(-10);
}

async function findAuthUser(admin, email, phone) {
  const targetEmail = String(email || '').toLowerCase();
  const targetPhone = normalizePhoneDigits(phone);
  if (!targetEmail && !targetPhone) return null;

  const perPage = 200;
  const maxPages = 10;

  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.warn('[supabaseAdmin] listUsers failed:', error.message);
      return null;
    }

    const users = data?.users ?? [];
    const matched = users.find((u) => {
      const emailMatch = targetEmail && String(u.email || '').toLowerCase() === targetEmail;
      if (emailMatch) return true;

      const phoneCandidates = [
        u.phone,
        u.user_metadata?.phone,
        u.user_metadata?.phone_number,
      ];
      return Boolean(
        targetPhone &&
          phoneCandidates.some((candidate) => normalizePhoneDigits(candidate) === targetPhone)
      );
    });
    if (matched) return matched;
    if (users.length < perPage) break;
  }

  return null;
}

/**
 * Check if a phone number is already registered by querying public.profiles.
 * Much faster than listUsers() — no pagination, no admin quota issues.
 *
 * @param {string} e164  E.164 phone number (+91XXXXXXXXXX)
 * @returns {Promise<{ userId: string, email: string } | null>}
 */
export async function findUserByPhone(e164) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const normalizedPhone = String(e164 || '').trim();
  const { email } = phoneToCredentials(normalizedPhone);

  const { data, error } = await admin
    .from('profiles')
    .select('id,email')
    .eq('phone', normalizedPhone)
    .maybeSingle();

  if (!error && data?.id) {
    return {
      userId: data.id,
      email: typeof data.email === 'string' && data.email ? data.email : email,
    };
  }

  const authUser = await findAuthUser(admin, email, normalizedPhone);
  if (authUser?.id) {
    return {
      userId: authUser.id,
      email: String(authUser.email || email),
    };
  }

  return null;
}

export async function findUserByEmail(email) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const normalizedEmail = String(email || '').trim().toLowerCase();
  const { data, error } = await admin
    .from('profiles')
    .select('id,email')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (!error && data?.id) {
    return {
      userId: data.id,
      email: typeof data.email === 'string' && data.email ? data.email : normalizedEmail,
    };
  }

  const authUser = await findAuthUser(admin, normalizedEmail, '');
  if (authUser?.id) {
    return {
      userId: authUser.id,
      email: String(authUser.email || normalizedEmail),
    };
  }

  return null;
}

/**
 * Get or create a Supabase auth user for a verified phone number.
 * Fast path: checks profiles table first (never calls listUsers()).
 *
 * @param {string} phone            E.164 or 10-digit Indian number
 * @param {string} [customPassword] Use this password instead of the deterministic one
 * @param {string} [fullName]       Display name to store in profiles
 * @returns {Promise<{ email: string, password: string, userId: string, isNew: boolean }>}
 */
export async function getOrCreateUserByPhone(phone, customPassword, fullName) {
  const { email, password: deterministicPassword, e164 } = phoneToCredentials(phone);
  const finalPassword = customPassword || deterministicPassword;
  const national = e164.replace(/^\+91/, '');
  const username = `91${national}`;
  const displayName = fullName || `User ${national}`;

  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error(
      'Supabase admin client not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env'
    );
  }

  // ── Fast path: look up existing user in profiles ────────────────────────────
  const existing = await findUserByPhone(e164);

  if (existing) {
    const existingEmail = existing.email || email;

    if (customPassword) {
      const { error: updateError } = await admin.auth.admin.updateUserById(existing.userId, {
        password: customPassword,
      });
      if (updateError) console.warn('[supabaseAdmin] Password update failed:', updateError.message);
    }

    if (fullName) {
      // Refresh name/phone in profile if provided.
      await upsertProfileRecord(admin, existing.userId, e164, displayName, existingEmail);
    }

    return { email: existingEmail, password: finalPassword, userId: existing.userId, isNew: false };
  }

  // ── Create new auth user ────────────────────────────────────────────────────
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: finalPassword,
    email_confirm: true,
    user_metadata: {
      phone: e164,
      phone_number: e164,
      username,
      full_name: displayName,
      phone_verified: true,
      is_admin: false,
    },
  });

  if (createError) throw new Error(createError.message);

  const newUserId = created.user.id;

  // ── Upsert profile row (may not exist yet if DB trigger hasn't run) ─────────
  await upsertProfileRecord(admin, newUserId, e164, displayName, email);

  return { email, password: finalPassword, userId: newUserId, isNew: true };
}

/**
 * Update a user's password using Supabase Admin.
 */
export async function setUserPassword(userId, newPassword) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error('Supabase admin client not configured.');
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) throw new Error(error.message);
  return { success: true };
}

/**
 * Generate a one-time email OTP / magic token for an existing auth user.
 * Used by phone OTP login flow after phone OTP validation.
 */
export async function createMagicLinkOtpForEmail(email) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error('Supabase admin client not configured.');

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (error) throw new Error(error.message);

  const properties = data?.properties ?? {};
  const emailOtp =
    (typeof properties.email_otp === 'string' && properties.email_otp) ||
    (typeof data?.email_otp === 'string' && data.email_otp) ||
    null;

  let tokenHash =
    (typeof properties.hashed_token === 'string' && properties.hashed_token) ||
    (typeof data?.hashed_token === 'string' && data.hashed_token) ||
    null;

  const actionLink =
    (typeof properties.action_link === 'string' && properties.action_link) ||
    (typeof data?.action_link === 'string' && data.action_link) ||
    '';

  // Fallback: derive token hash from action_link query param if SDK omitted hashed_token field.
  if (!tokenHash && actionLink) {
    try {
      const parsed = new URL(actionLink);
      tokenHash = parsed.searchParams.get('token');
    } catch {
      // Non-URL string fallback
      const match = actionLink.match(/[?&]token=([^&]+)/i);
      tokenHash = match?.[1] ? decodeURIComponent(match[1]) : null;
    }
  }

  if (!emailOtp && !tokenHash) {
    throw new Error('Failed to generate one-time login token.');
  }

  return { emailOtp, tokenHash };
}
