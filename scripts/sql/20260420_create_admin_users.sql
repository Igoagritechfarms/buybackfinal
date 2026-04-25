-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: admin_users table
-- Run in Supabase SQL Editor after profiles migration
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.admin_users (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Enable RLS
alter table public.admin_users enable row level security;

-- Only admins can read the admin_users table (bootstrapped by service role)
-- The first admin must be inserted using service role key or directly via Supabase dashboard SQL:
--
--   INSERT INTO public.admin_users (user_id)
--   VALUES ('<uuid of the auth user you want to be admin>');
--
-- Then that user must also have their profile row (auto-created by trigger).

-- Admins can read the admin list (to verify they are admin)
create policy "admin_users_select_self"
  on public.admin_users for select
  using (auth.uid() = user_id);

-- Admins can read all admin users
create policy "admin_users_admin_select_all"
  on public.admin_users for select
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid() and au.is_active = true
    )
  );

-- ── HOW TO SET UP FIRST ADMIN ─────────────────────────────────────────────────
-- 1. Create a Supabase Auth user (email/password) via the Supabase Auth dashboard
--    or via: supabase.auth.signUp({ email: 'admin@yoursite.com', password: '...' })
-- 2. Note the UUID of that user from Supabase Auth → Users
-- 3. Run in Supabase SQL Editor:
--
--   INSERT INTO public.admin_users (user_id)
--   SELECT id FROM auth.users WHERE email = 'admin@yoursite.com'
--   ON CONFLICT DO NOTHING;
--
-- That user can now log in at /admin and access /admin/dashboard.
-- ─────────────────────────────────────────────────────────────────────────────
