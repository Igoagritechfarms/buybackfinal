import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env['VITE_SUPABASE_URL']?.trim();
const SUPABASE_ANON_KEY = import.meta.env['VITE_SUPABASE_ANON_KEY']?.trim();
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env['VITE_SUPABASE_SERVICE_ROLE_KEY']?.trim();
const FALLBACK_SUPABASE_URL = 'https://placeholder.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const isAdminConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Create a .env file to enable backend features.'
  );
}

export const supabase = createClient(
  isSupabaseConfigured ? SUPABASE_URL! : FALLBACK_SUPABASE_URL,
  isSupabaseConfigured ? SUPABASE_ANON_KEY! : FALLBACK_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Bypass the Web Locks API used by GoTrue — it causes 5-second hangs
      // when locks are orphaned (multiple tabs, hot reload, etc.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lock: (async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn()) as any,
    },
  }
);

// Service-role client: bypasses RLS entirely — use only for admin operations.
export const adminSupabase = isAdminConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : supabase; // fallback to anon if key not set
