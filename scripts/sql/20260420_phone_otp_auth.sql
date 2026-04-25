-- ============================================================================
-- Supabase Phone OTP Auth Setup (Vite + React)
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1) User profiles table (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create index if not exists profiles_phone_idx on public.profiles (phone);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

-- 2) RLS policies
-- Each authenticated user can read/insert/update only their own profile row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3) Generic updated_at trigger for profiles
create or replace function public.handle_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_profiles_updated_at();

-- 4) Auto-create/maintain profile row whenever a new auth user is created
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_full_name text;
begin
  user_full_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), '')
  );

  insert into public.profiles (id, phone, email, full_name)
  values (new.id, new.phone, new.email, user_full_name)
  on conflict (id) do update set
    phone = excluded.phone,
    email = excluded.email,
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- ============================================================================
-- Notes:
-- - Enable Phone provider in Supabase Auth settings.
-- - Configure SMS provider credentials in Supabase Auth.
-- - Same phone number logs into the same auth user and same dashboard profile.
-- ============================================================================
