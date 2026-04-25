-- ============================================================
-- Migration: Fix RLS policies for profiles, buyback_submissions,
--            bank_accounts, user_form_details so that:
--
--  1. Service-role (server-side) can always bypass RLS (default
--     Supabase behaviour — no policy change needed, included as a
--     comment for clarity).
--
--  2. Authenticated users can read/write their own rows.
--
--  3. Admin users (rows in admin_users with is_active = TRUE) can
--     SELECT all rows in every table.
--
--  4. otp_logs allows anon INSERT/SELECT/UPDATE so the custom OTP
--     flow works without a session.
--
--  5. profiles allows INSERT for newly-authenticated users
--     (handle_new_user trigger uses SECURITY DEFINER and already
--     works, but direct frontend inserts need a policy too).
-- ============================================================

-- ─── Ensure tables exist ─────────────────────────────────────────────────────
-- These are created by the application but may be missing on fresh installs.

CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone        TEXT,
  email        TEXT,
  full_name    TEXT,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buyback_submissions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_name     TEXT NOT NULL,
  contact_phone    TEXT NOT NULL,
  product_id       TEXT NOT NULL,
  product_name     TEXT NOT NULL,
  quantity         NUMERIC NOT NULL,
  quantity_unit    TEXT NOT NULL DEFAULT 'kg',
  expected_price   NUMERIC,
  harvest_date     DATE,
  location         TEXT NOT NULL,
  site_visit_date  DATE,
  schedule_notes   TEXT,
  submission_type  TEXT NOT NULL CHECK (submission_type IN ('sell', 'buy')),
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','reviewing','approved','rejected','completed')),
  form_payload     JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name            TEXT NOT NULL,
  account_holder_name  TEXT NOT NULL,
  account_number       TEXT NOT NULL,
  ifsc_code            TEXT NOT NULL,
  branch_name          TEXT,
  upi_id               TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_form_details (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT,
  phone          TEXT,
  address        TEXT,
  city           TEXT,
  state          TEXT,
  pincode        TEXT,
  crop_type      TEXT,
  acreage        NUMERIC,
  farming_method TEXT CHECK (farming_method IN ('organic','inorganic','mixed')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Enable RLS on all tables ─────────────────────────────────────────────────

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyback_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_form_details    ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users          ENABLE ROW LEVEL SECURITY;

-- ─── Helper: is the current user an active admin? ─────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   admin_users
    WHERE  user_id  = auth.uid()
    AND    is_active = TRUE
  );
$$;

-- ─── profiles ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "profiles: owner select"  ON profiles;
DROP POLICY IF EXISTS "profiles: owner insert"  ON profiles;
DROP POLICY IF EXISTS "profiles: owner update"  ON profiles;
DROP POLICY IF EXISTS "profiles: admin select"  ON profiles;

CREATE POLICY "profiles: owner select"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow a newly-authenticated user to insert their own profile row.
CREATE POLICY "profiles: owner insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: owner update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can see all profiles
CREATE POLICY "profiles: admin select"
  ON profiles FOR SELECT
  USING (is_admin());

-- ─── buyback_submissions ──────────────────────────────────────────────────────

DROP POLICY IF EXISTS "submissions: owner select"  ON buyback_submissions;
DROP POLICY IF EXISTS "submissions: owner insert"  ON buyback_submissions;
DROP POLICY IF EXISTS "submissions: owner update"  ON buyback_submissions;
DROP POLICY IF EXISTS "submissions: anon insert"   ON buyback_submissions;
DROP POLICY IF EXISTS "submissions: admin select"  ON buyback_submissions;
DROP POLICY IF EXISTS "submissions: admin update"  ON buyback_submissions;

-- Authenticated users can see and insert their own submissions
CREATE POLICY "submissions: owner select"
  ON buyback_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "submissions: owner insert"
  ON buyback_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow anonymous submissions (user_id will be NULL, linked later)
CREATE POLICY "submissions: anon insert"
  ON buyback_submissions FOR INSERT
  WITH CHECK (user_id IS NULL);

CREATE POLICY "submissions: owner update"
  ON buyback_submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can see and update all submissions
CREATE POLICY "submissions: admin select"
  ON buyback_submissions FOR SELECT
  USING (is_admin());

CREATE POLICY "submissions: admin update"
  ON buyback_submissions FOR UPDATE
  USING (is_admin());

-- ─── bank_accounts ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "bank: owner select"  ON bank_accounts;
DROP POLICY IF EXISTS "bank: owner insert"  ON bank_accounts;
DROP POLICY IF EXISTS "bank: owner update"  ON bank_accounts;
DROP POLICY IF EXISTS "bank: admin select"  ON bank_accounts;

CREATE POLICY "bank: owner select"
  ON bank_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "bank: owner insert"
  ON bank_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bank: owner update"
  ON bank_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "bank: admin select"
  ON bank_accounts FOR SELECT
  USING (is_admin());

-- ─── user_form_details ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "form_details: owner select"  ON user_form_details;
DROP POLICY IF EXISTS "form_details: owner insert"  ON user_form_details;
DROP POLICY IF EXISTS "form_details: owner update"  ON user_form_details;
DROP POLICY IF EXISTS "form_details: admin select"  ON user_form_details;

CREATE POLICY "form_details: owner select"
  ON user_form_details FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "form_details: owner insert"
  ON user_form_details FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "form_details: owner update"
  ON user_form_details FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "form_details: admin select"
  ON user_form_details FOR SELECT
  USING (is_admin());

-- ─── admin_users ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "admin_users: self select" ON admin_users;

CREATE POLICY "admin_users: self select"
  ON admin_users FOR SELECT
  USING (auth.uid() = user_id);

-- ─── otp_logs (existing table, ensure permissive policies stay in place) ───────

DROP POLICY IF EXISTS "Allow public select for demo"  ON otp_logs;
DROP POLICY IF EXISTS "Allow public insert for demo"  ON otp_logs;
DROP POLICY IF EXISTS "Allow public update for demo"  ON otp_logs;

CREATE POLICY "otp_logs: public select"  ON otp_logs FOR SELECT  USING (TRUE);
CREATE POLICY "otp_logs: public insert"  ON otp_logs FOR INSERT  WITH CHECK (TRUE);
CREATE POLICY "otp_logs: public update"  ON otp_logs FOR UPDATE  USING (TRUE);

-- ─── profiles: add phone unique index (idempotent) ───────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique
  ON profiles (phone)
  WHERE phone IS NOT NULL;

-- ─── Trigger: auto-create profile row on auth.users INSERT ───────────────────
-- Replaces the old handle_new_user that only wrote to public.users / user_profiles.
-- This version ALSO writes to profiles so the admin dashboard sees new users
-- immediately, without waiting for the first frontend sign-in.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone      TEXT;
  v_username   TEXT;
  v_full_name  TEXT;
  v_email      TEXT;
BEGIN
  v_phone     := NEW.raw_user_meta_data->>'phone_number';
  v_username  := NEW.raw_user_meta_data->>'username';
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');
  v_email     := NEW.email;

  -- Insert into public.users (legacy table — skip if phone/username missing)
  BEGIN
    IF v_phone IS NOT NULL AND v_username IS NOT NULL THEN
      INSERT INTO public.users (id, phone_number, username, is_admin)
      VALUES (
        NEW.id,
        v_phone,
        v_username,
        COALESCE((NEW.raw_user_meta_data->>'is_admin')::BOOLEAN, FALSE)
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Non-fatal: log and continue so auth.users insert always succeeds
    RAISE WARNING 'handle_new_user: public.users insert failed: %', SQLERRM;
  END;

  -- Insert into profiles (main table used by the app)
  BEGIN
    INSERT INTO profiles (id, phone, email, full_name, role, created_at, updated_at)
    VALUES (
      NEW.id,
      v_phone,
      v_email,
      v_full_name,
      'user',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
      SET
        phone      = COALESCE(EXCLUDED.phone,      profiles.phone),
        email      = COALESCE(EXCLUDED.email,      profiles.email),
        full_name  = COALESCE(EXCLUDED.full_name,  profiles.full_name),
        updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: profiles insert failed: %', SQLERRM;
  END;

  -- Insert into user_profiles (legacy table)
  BEGIN
    IF v_phone IS NOT NULL THEN
      INSERT INTO user_profiles (user_id, full_name, phone_number)
      VALUES (NEW.id, v_full_name, v_phone)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: user_profiles insert failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
