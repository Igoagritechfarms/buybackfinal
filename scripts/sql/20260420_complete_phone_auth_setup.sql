-- =============================================================================
-- COMPLETE SUPABASE SETUP FOR PHONE OTP LOGIN + ACCOUNT DASHBOARD
-- Run this entire script in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- ── 1. profiles table ─────────────────────────────────────────────────────────
-- One row per auth.users row (1-to-1 relationship, no duplicates possible).
-- The same phone number always maps to the same auth user → same profile.

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone       text UNIQUE,           -- taken from auth session (never manual)
  email       text,
  full_name   text,
  avatar_url  text,
  role        text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS profiles_phone_idx ON public.profiles (phone);
CREATE INDEX IF NOT EXISTS profiles_role_idx  ON public.profiles (role);

-- ── 2. profiles RLS policies ──────────────────────────────────────────────────

-- Users can read their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (name, email, avatar)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (fallback if trigger hasn't fired yet)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- ── 3. bank_accounts table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bank_name           text NOT NULL,
  account_holder_name text NOT NULL,
  account_number      text NOT NULL,
  ifsc_code           text NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS bank_accounts_user_id_idx ON public.bank_accounts (user_id);

DROP POLICY IF EXISTS "bank_accounts_insert_own" ON public.bank_accounts;
CREATE POLICY "bank_accounts_insert_own" ON public.bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bank_accounts_select_own" ON public.bank_accounts;
CREATE POLICY "bank_accounts_select_own" ON public.bank_accounts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bank_accounts_update_own" ON public.bank_accounts;
CREATE POLICY "bank_accounts_update_own" ON public.bank_accounts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bank_accounts_admin_select_all" ON public.bank_accounts;
CREATE POLICY "bank_accounts_admin_select_all" ON public.bank_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- ── 4. buyback_submissions table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.buyback_submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  contact_name    text NOT NULL,
  contact_phone   text NOT NULL,
  product_id      text NOT NULL,
  product_name    text NOT NULL,
  quantity        numeric NOT NULL CHECK (quantity > 0),
  quantity_unit   text NOT NULL DEFAULT 'kg',
  expected_price  numeric CHECK (expected_price > 0),
  harvest_date    date,
  location        text NOT NULL,
  site_visit_date date,
  schedule_notes  text,
  submission_type text NOT NULL CHECK (submission_type IN ('sell', 'buy')),
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'completed')),
  form_payload    jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.buyback_submissions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS buyback_user_id_idx    ON public.buyback_submissions (user_id);
CREATE INDEX IF NOT EXISTS buyback_status_idx     ON public.buyback_submissions (status);
CREATE INDEX IF NOT EXISTS buyback_created_at_idx ON public.buyback_submissions (created_at DESC);

-- Allow both logged-in and anonymous form submissions
DROP POLICY IF EXISTS "buyback_submissions_insert_own" ON public.buyback_submissions;
CREATE POLICY "buyback_submissions_insert_own" ON public.buyback_submissions
  FOR INSERT WITH CHECK (
    user_id IS NULL
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- Users can only read their own submissions
DROP POLICY IF EXISTS "buyback_submissions_select_own" ON public.buyback_submissions;
CREATE POLICY "buyback_submissions_select_own" ON public.buyback_submissions
  FOR SELECT USING (user_id = auth.uid());

-- Admins can read all submissions
DROP POLICY IF EXISTS "buyback_submissions_admin_select_all" ON public.buyback_submissions;
CREATE POLICY "buyback_submissions_admin_select_all" ON public.buyback_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid() AND au.is_active = true)
  );

-- Admins can update submission status
DROP POLICY IF EXISTS "buyback_submissions_admin_update_all" ON public.buyback_submissions;
CREATE POLICY "buyback_submissions_admin_update_all" ON public.buyback_submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid() AND au.is_active = true)
  );

-- ── 5. admin_users table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id     uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_select_self" ON public.admin_users;
CREATE POLICY "admin_users_select_self" ON public.admin_users
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_users_admin_select_all" ON public.admin_users;
CREATE POLICY "admin_users_admin_select_all" ON public.admin_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid() AND au.is_active = true)
  );

-- ── 6. Auto-create profile on new auth user (including phone OTP signup) ──────
-- This trigger runs whenever a new user is created in auth.users.
-- It inserts a matching row in public.profiles using auth user id + phone + email.
-- ON CONFLICT DO NOTHING ensures no duplicates if the profile was already created.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, email, full_name)
  VALUES (
    NEW.id,
    NEW.phone,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ── 7. Auto-update updated_at on row changes ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at          ON public.profiles;
DROP TRIGGER IF EXISTS bank_accounts_updated_at     ON public.bank_accounts;
DROP TRIGGER IF EXISTS buyback_submissions_updated_at ON public.buyback_submissions;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER buyback_submissions_updated_at
  BEFORE UPDATE ON public.buyback_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- HOW TO CREATE YOUR FIRST ADMIN USER:
--
-- 1. Create a user via Supabase Auth dashboard (Email/Password) OR via phone OTP login.
-- 2. Go to Supabase → Authentication → Users → copy the user UUID.
-- 3. Run this query (replace the UUID):
--
--    INSERT INTO public.admin_users (user_id)
--    SELECT id FROM auth.users WHERE email = 'your-admin@email.com'
--    ON CONFLICT DO NOTHING;
--
-- That user can now log in at /admin and access /admin/dashboard.
-- =============================================================================
