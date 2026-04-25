import { supabase, isSupabaseConfigured } from './supabaseClient';

export { supabase, isSupabaseConfigured };

const MARKET_PRICES_TABLE = 'market_prices';
const PAYMENT_SCREENSHOTS_BUCKET = 'payment-screenshots';
export const MAX_PAYMENT_SCREENSHOT_BYTES = 5 * 1024 * 1024;

// ─── Type Definitions ───────────────────────────────────────────────────────

export type BuyBackLead = {
  name: string;
  phone: string;
  age?: number;
  pincode?: string;
  zone?: string;
  crop_type?: string;
  acreage?: number;
  farming_method?: 'organic' | 'inorganic' | 'mixed';
  language?: string;
};

export type MarketPrice = {
  id?: string;
  product_id: string;
  name: string;
  price: number;
  prev_price?: number;
  unit: string;
  category?: string;
  demand?: 'Low' | 'Medium' | 'High' | 'Very High';
  updated_at?: string;
};

export type Transaction = {
  id?: string;
  name: string;
  phone: string;
  location: string;
  product_id: string;
  quantity: number;
  price: number;
  type: 'sell' | 'buy';
  otp?: string;
  otp_verified?: boolean;
  status?: 'pending' | 'verified' | 'matched' | 'completed' | 'cancelled';
  transport?: 'self';
  harvest_date?: string;
  notes?: string;
};

export type ContactMessage = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status?: 'new' | 'seen' | 'responded';
};

export type Profile = {
  id: string;
  phone: string | null;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
};

export type BuybackSubmission = {
  id?: string;
  user_id?: string | null;
  contact_name: string;
  contact_phone: string;
  product_id: string;
  product_name: string;
  quantity: number;
  quantity_unit: string;
  expected_price?: number | null;
  harvest_date?: string | null;
  location: string;
  site_visit_date?: string | null;
  schedule_notes?: string | null;
  submission_type: 'sell' | 'buy';
  status?: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  form_payload?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type BankAccount = {
  id?: string;
  user_id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name?: string;
  upi_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PaymentScreenshot = {
  id?: string;
  user_id: string;
  bank_account_id?: string | null;
  uploaded_by?: string | null;
  file_name: string;
  file_path: string;
  file_type?: string | null;
  file_size: number;
  created_at?: string;
};

export type UserFormDetails = {
  id?: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  crop_type?: string;
  acreage?: number;
  farming_method?: 'organic' | 'inorganic' | 'mixed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type AdminUser = {
  user_id: string;
  is_active: boolean;
  created_at: string;
};

// ─── Helper ──────────────────────────────────────────────────────────────────

function requireSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
  }
}

function logSupabaseFailure(context: string, details: Record<string, unknown>) {
  if (!import.meta.env.DEV) return;
  console.error(`[supabase] ${context}`, details);
}

function sanitizeStorageFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120) || 'payment-proof';
}

function createStorageObjectId() {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) return randomUuid;

  const randomBytes = globalThis.crypto?.getRandomValues?.(new Uint8Array(16));
  if (randomBytes) {
    return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  return `fallback-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mapPaymentScreenshotStorageError(error: { message?: string | null } | null | undefined) {
  const message = error?.message?.trim() || 'Storage operation failed.';
  const normalized = message.toLowerCase();

  if (normalized.includes('bucket not found')) {
    return 'Supabase storage bucket "payment-screenshots" is missing. Run scripts/sql/20260425_payment_screenshots.sql in Supabase SQL Editor.';
  }

  if (normalized.includes('not found')) {
    return `Payment screenshot storage is not ready. ${message}`;
  }

  return message;
}

export function validatePaymentScreenshotFile(file: File) {
  if (file.size > MAX_PAYMENT_SCREENSHOT_BYTES) {
    throw new Error('Payment screenshot must be 5 MB or smaller.');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Upload a JPG, PNG, WebP, or PDF payment proof.');
  }
}

// ─── Auth helpers ────────────────────────────────────────────────────────────

/**
 * Get the currently authenticated Supabase user session.
 */
export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Get the current user ID from the active session.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// ─── Profile API ─────────────────────────────────────────────────────────────

/**
 * Upsert a user profile after authentication.
 */
export async function upsertProfile(updates: Partial<Profile> & { id: string }): Promise<Profile> {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...updates, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

/**
 * Fetch the current user's profile.
 */
export async function getMyProfile(): Promise<Profile | null> {
  requireSupabaseConfig();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (error) {
    logSupabaseFailure('getMyProfile failed', { error: error.message });
    return null;
  }
  return data as Profile | null;
}

// ─── Buyback Submissions API ──────────────────────────────────────────────────

/**
 * Save a buyback submission. Links to authenticated user if available.
 */
export async function saveBuybackSubmission(submission: Omit<BuybackSubmission, 'id' | 'created_at' | 'updated_at'>): Promise<BuybackSubmission> {
  requireSupabaseConfig();
  const { data: { user } } = await supabase.auth.getUser();
  const payload = {
    ...submission,
    user_id: user?.id ?? null,
    status: 'pending' as const,
  };
  const { data, error } = await supabase
    .from('buyback_submissions')
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data as BuybackSubmission;
}

/**
 * Fetch all submissions for the current authenticated user.
 * Also auto-links anonymous submissions where contact_phone matches the profile phone.
 */
export async function getMySubmissions(): Promise<BuybackSubmission[]> {
  requireSupabaseConfig();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get the user's phone to claim any anonymous submissions
  const { data: profileData } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', user.id)
    .maybeSingle();

  const userPhone = profileData?.phone ?? null;

  // Auto-link any anonymous submissions with matching phone to this user
  if (userPhone) {
    await supabase
      .from('buyback_submissions')
      .update({ user_id: user.id })
      .is('user_id', null)
      .eq('contact_phone', userPhone);
  }

  // Now fetch all submissions for this user
  const { data, error } = await supabase
    .from('buyback_submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    logSupabaseFailure('getMySubmissions failed', { error: error.message });
    return [];
  }
  return (data ?? []) as BuybackSubmission[];
}

// ─── Bank Accounts API ────────────────────────────────────────────────────────

/**
 * Save or update bank details for the current user.
 */
export async function saveBankDetails(details: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<BankAccount> {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('bank_accounts')
    .upsert({ ...details, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data as BankAccount;
}

/**
 * Fetch the current user's bank details.
 */
export async function getMyBankDetails(): Promise<BankAccount | null> {
  requireSupabaseConfig();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    logSupabaseFailure('getMyBankDetails failed', { error: error.message });
    return null;
  }
  return data as BankAccount | null;
}

export async function getMyPaymentScreenshots(): Promise<PaymentScreenshot[]> {
  requireSupabaseConfig();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('payment_screenshots')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    logSupabaseFailure('getMyPaymentScreenshots failed', { error: error.message });
    return [];
  }
  return (data ?? []) as PaymentScreenshot[];
}

export async function getPaymentScreenshotDownloadUrl(filePath: string): Promise<string> {
  requireSupabaseConfig();
  const { data, error } = await supabase.storage
    .from(PAYMENT_SCREENSHOTS_BUCKET)
    .createSignedUrl(filePath, 300, { download: true });

  if (error || !data?.signedUrl) {
    throw new Error(mapPaymentScreenshotStorageError(error) || 'Could not create download link.');
  }
  return data.signedUrl;
}

// ─── Admin API ────────────────────────────────────────────────────────────────

/**
 * Check if the current authenticated user is an admin.
 */
export async function checkIsAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();
  if (error) return false;
  return data !== null;
}

/**
 * Fetch all profiles (admin only).
 */
export async function adminGetAllProfiles(): Promise<Profile[]> {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

/**
 * Fetch all buyback submissions (admin only).
 */
export async function adminGetAllSubmissions(): Promise<BuybackSubmission[]> {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('buyback_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as BuybackSubmission[];
}

/**
 * Update a submission's status (admin only).
 */
export async function adminUpdateSubmissionStatus(
  id: string,
  status: BuybackSubmission['status']
): Promise<void> {
  requireSupabaseConfig();
  const { error } = await supabase
    .from('buyback_submissions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ─── User Form Details API ────────────────────────────────────────────────────

/**
 * Save or update the current user's form details (upsert by user_id).
 */
export async function saveUserFormDetails(
  details: Omit<UserFormDetails, 'id' | 'created_at' | 'updated_at'>
): Promise<UserFormDetails> {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('user_form_details')
    .upsert({ ...details, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data as UserFormDetails;
}

/**
 * Fetch the current user's form details.
 */
export async function getMyFormDetails(): Promise<UserFormDetails | null> {
  requireSupabaseConfig();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('user_form_details')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    logSupabaseFailure('getMyFormDetails failed', { error: error.message });
    return null;
  }
  return data as UserFormDetails | null;
}

/**
 * Fetch all user form details (admin only).
 */
export async function adminGetAllFormDetails(): Promise<UserFormDetails[]> {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('user_form_details')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as UserFormDetails[];
}

/**
 * Fetch all bank accounts (admin only).
 */
export async function adminGetAllBankAccounts(): Promise<BankAccount[]> {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as BankAccount[];
}

export async function adminGetAllPaymentScreenshots(): Promise<PaymentScreenshot[]> {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('payment_screenshots')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PaymentScreenshot[];
}

export async function adminUploadPaymentScreenshot({
  userId,
  bankAccountId,
  file,
}: {
  userId: string;
  bankAccountId?: string | null;
  file: File;
}): Promise<PaymentScreenshot> {
  requireSupabaseConfig();
  validatePaymentScreenshotFile(file);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Admin session expired. Please login again.');

  const safeName = sanitizeStorageFileName(file.name);
  const filePath = `${userId}/${Date.now()}-${createStorageObjectId()}-${safeName}`;

  const upload = await supabase.storage
    .from(PAYMENT_SCREENSHOTS_BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (upload.error) {
    throw new Error(mapPaymentScreenshotStorageError(upload.error));
  }

  const payload: Omit<PaymentScreenshot, 'id' | 'created_at'> = {
    user_id: userId,
    bank_account_id: bankAccountId ?? null,
    uploaded_by: user.id,
    file_name: file.name,
    file_path: filePath,
    file_type: file.type,
    file_size: file.size,
  };

  const { data, error } = await supabase
    .from('payment_screenshots')
    .insert(payload)
    .select()
    .single();

  if (error) {
    await supabase.storage.from(PAYMENT_SCREENSHOTS_BUCKET).remove([filePath]);
    throw error;
  }

  return data as PaymentScreenshot;
}

// ─── Legacy API (kept for backward compat) ───────────────────────────────────

export async function submitLead(lead: BuyBackLead) {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('buy_back_leads')
    .insert([lead])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function submitTransaction(transaction: Transaction) {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function upsertUserPhone(phone: string) {
  requireSupabaseConfig();
  // After phone OTP auth, update profile phone via upsertProfile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await upsertProfile({ id: user.id, phone: String(phone || '').trim() });
}

export async function updateTransactionStatus(
  transactionId: string,
  status: Transaction['status'],
  updates?: Partial<Transaction>
) {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('transactions')
    .update({ status, ...updates })
    .eq('id', transactionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function verifyOtp(transactionId: string, otp: string) {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('transactions')
    .update({ otp_verified: true })
    .eq('id', transactionId)
    .eq('otp', otp)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function submitContactMessage(message: ContactMessage) {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([message])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMarketPrices(category?: string) {
  requireSupabaseConfig();
  let query = supabase.from(MARKET_PRICES_TABLE).select('*');
  if (category) {
    query = query.eq('category', category);
  }
  const { data, error, status } = await query.order('name', { ascending: true });
  if (error) {
    logSupabaseFailure('Market prices fetch failed.', {
      table: MARKET_PRICES_TABLE,
      category: category || null,
      status,
      code: error.code,
      message: error.message,
    });
    if (error.code === '42P01' || error.code === 'PGRST205') {
      throw new Error(
        `Supabase table "${MARKET_PRICES_TABLE}" is missing. Run the market prices SQL migration.`
      );
    }
    throw new Error(error.message || 'Failed to fetch market prices.');
  }
  return (data || []) as MarketPrice[];
}

export function subscribeToMarketPrices(
  callback: (prices: MarketPrice[]) => void,
  onError?: (error: Error) => void
) {
  if (!isSupabaseConfigured) return () => {};
  const subscription = supabase
    .channel('market_prices_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: MARKET_PRICES_TABLE },
      () => {
        getMarketPrices()
          .then(callback)
          .catch(onError || console.error);
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' && onError) {
        onError(new Error('Failed to setup market price subscription.'));
      }
    });
  return () => {
    void supabase.removeChannel(subscription);
  };
}
