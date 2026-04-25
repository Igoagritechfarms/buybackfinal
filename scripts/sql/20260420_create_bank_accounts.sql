-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: bank_accounts table
-- Run in Supabase SQL Editor after profiles migration
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.bank_accounts (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid unique not null references public.profiles(id) on delete cascade,
  bank_name             text not null,
  account_holder_name   text not null,
  account_number        text not null,
  ifsc_code             text not null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Enable RLS
alter table public.bank_accounts enable row level security;

-- Index
create index if not exists bank_accounts_user_id_idx on public.bank_accounts (user_id);

-- ── RLS Policies ──────────────────────────────────────────────────────────────

-- Authenticated users can insert their own bank account
create policy "bank_accounts_insert_own"
  on public.bank_accounts for insert
  with check (auth.uid() = user_id);

-- Users can read their own bank account
create policy "bank_accounts_select_own"
  on public.bank_accounts for select
  using (auth.uid() = user_id);

-- Users can update their own bank account
create policy "bank_accounts_update_own"
  on public.bank_accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins can read all bank accounts
create policy "bank_accounts_admin_select_all"
  on public.bank_accounts for select
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid() and au.is_active = true
    )
  );
