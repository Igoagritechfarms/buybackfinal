import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const FALLBACK_SUPABASE_URL = 'https://placeholder.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'placeholder-anon-key';
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Avoid app-level crash on startup when .env is not configured.
if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Create a .env file to enable backend features.'
  );
}

export const supabase = createClient(
  isSupabaseConfigured ? SUPABASE_URL! : FALLBACK_SUPABASE_URL,
  isSupabaseConfigured ? SUPABASE_ANON_KEY! : FALLBACK_SUPABASE_ANON_KEY
);

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

/* ─── Supabase Schema (run in Supabase SQL editor) ───────────────────────────

-- Enrollment leads table
create table if not exists buy_back_leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text not null,
  phone       text not null,
  age         int,
  pincode     text,
  zone        text,
  crop_type   text,
  acreage     numeric,
  farming_method text check (farming_method in ('organic', 'inorganic', 'mixed')),
  language    text default 'en',
  status      text default 'new' check (status in ('new', 'contacted', 'enrolled', 'rejected')),
  notes       text
);

-- Market prices (realtime updates)
create table if not exists market_prices (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null unique,
  name        text not null,
  price       numeric not null,
  prev_price  numeric,
  unit        text not null,
  category    text,
  demand      text check (demand in ('Low', 'Medium', 'High', 'Very High')),
  updated_at  timestamptz default now()
);

-- Transactions (sell/buy)
create table if not exists transactions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  name        text not null,
  phone       text not null,
  location    text not null,
  product_id  text not null,
  quantity    numeric not null,
  price       numeric not null,
  type        text check (type in ('sell', 'buy')),
  otp         text,
  otp_verified boolean default false,
  status      text default 'pending' check (status in ('pending', 'verified', 'matched', 'completed', 'cancelled')),
  transport   text check (transport in ('self')),
  harvest_date date,
  notes       text
);

-- Contact messages
create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text not null,
  email       text not null,
  phone       text not null,
  subject     text not null,
  message     text not null,
  status      text default 'new' check (status in ('new', 'seen', 'responded')),
  responded_at timestamptz
);

-- Row-level security policies
alter table buy_back_leads enable row level security;
alter table market_prices enable row level security;
alter table transactions enable row level security;
alter table contact_messages enable row level security;

-- Buy back leads policies
create policy "Public insert leads" on buy_back_leads
  for insert with check (true);
create policy "Admin select leads" on buy_back_leads
  for select using (auth.role() = 'authenticated');

-- Market prices policies (public read, admin write)
create policy "Public read prices" on market_prices
  for select using (true);
create policy "Admin update prices" on market_prices
  for update using (auth.role() = 'authenticated');
create policy "Admin insert prices" on market_prices
  for insert using (auth.role() = 'authenticated');

-- Transactions policies
create policy "Public insert transactions" on transactions
  for insert with check (true);
create policy "Admin select transactions" on transactions
  for select using (auth.role() = 'authenticated');
create policy "Admin update transactions" on transactions
  for update using (auth.role() = 'authenticated');

-- Contact messages policies
create policy "Public insert messages" on contact_messages
  for insert with check (true);
create policy "Admin select messages" on contact_messages
  for select using (auth.role() = 'authenticated');

──────────────────────────────────────────────────────────────────────────── */

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

// ─── API Functions ──────────────────────────────────────────────────────────

function requireSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
  }
}

/**
 * Enrollment/Lead submission
 */
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

/**
 * Submit a transaction (sell or buy)
 */
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

/**
 * Update transaction status
 */
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

/**
 * Verify OTP for transaction
 */
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

/**
 * Submit contact message
 */
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

/**
 * Get market prices with optional filters
 */
export async function getMarketPrices(category?: string) {
  requireSupabaseConfig();
  let query = supabase.from('market_prices').select('*');
  if (category) {
    query = query.eq('category', category);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as MarketPrice[];
}

/**
 * Subscribe to market price updates (realtime)
 */
export function subscribeToMarketPrices(
  callback: (prices: MarketPrice[]) => void,
  onError?: (error: Error) => void
) {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const subscription = supabase
    .channel('market_prices_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'market_prices' },
      () => {
        // Fetch fresh data on any change
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
