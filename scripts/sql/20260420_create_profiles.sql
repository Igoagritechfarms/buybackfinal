-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: profiles table
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  phone         text unique,
  email         text,
  full_name     text,
  avatar_url    text,
  role          text not null default 'user' check (role in ('user', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Indexes
create index if not exists profiles_phone_idx on public.profiles (phone);
create index if not exists profiles_role_idx  on public.profiles (role);

-- ── RLS Policies ──────────────────────────────────────────────────────────────

-- Users can read their own profile
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can insert their own profile (used in trigger fallback)
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Admins can read all profiles (uses is_admin() helper defined in rls_policies migration)
create policy "profiles_admin_select_all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid() and au.is_active = true
    )
  );
