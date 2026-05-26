-- ============================================================
-- IGO Buyback — Complete Admin Dashboard Fix
-- Run this entire script in Supabase SQL Editor.
-- It is fully idempotent (safe to run multiple times).
-- ============================================================

-- ─── 1. Core tables ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone         TEXT,
  email         TEXT,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  referral_code TEXT UNIQUE,
  referred_by   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add referral columns if profiles was already created without them
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by   TEXT;

CREATE TABLE IF NOT EXISTS admin_users (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

CREATE TABLE IF NOT EXISTS payment_screenshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  uploaded_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name       TEXT NOT NULL,
  file_path       TEXT NOT NULL UNIQUE,
  file_type       TEXT,
  file_size       INTEGER NOT NULL CHECK (file_size <= 5242880),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referred_phone   TEXT,
  referred_name    TEXT,
  status           TEXT NOT NULL DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'completed')),
  bonus_amount     INTEGER NOT NULL DEFAULT 100,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Indexes ───────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique
  ON profiles (phone)
  WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS payment_screenshots_user_created_idx
  ON payment_screenshots (user_id, created_at DESC);

-- ─── 3. Enable RLS on all tables ─────────────────────────────

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyback_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_form_details    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_screenshots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals            ENABLE ROW LEVEL SECURITY;

-- ─── 4. is_admin() helper function ───────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   admin_users
    WHERE  user_id   = auth.uid()
    AND    is_active = TRUE
  );
$$;

-- Grant execute permission so RLS policies can call this function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- ─── 5. RLS policies — profiles ──────────────────────────────

DROP POLICY IF EXISTS "profiles: owner select" ON profiles;
DROP POLICY IF EXISTS "profiles: owner insert" ON profiles;
DROP POLICY IF EXISTS "profiles: owner update" ON profiles;
DROP POLICY IF EXISTS "profiles: admin select" ON profiles;

CREATE POLICY "profiles: owner select"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles: owner insert"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: owner update"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles: admin select"
  ON profiles FOR SELECT USING (public.is_admin());

-- ─── 6. RLS policies — admin_users ───────────────────────────

DROP POLICY IF EXISTS "admin_users: self select" ON admin_users;

CREATE POLICY "admin_users: self select"
  ON admin_users FOR SELECT USING (auth.uid() = user_id);

-- ─── 7. RLS policies — buyback_submissions ───────────────────

DROP POLICY IF EXISTS "submissions: owner select" ON buyback_submissions;
DROP POLICY IF EXISTS "submissions: owner insert" ON buyback_submissions;
DROP POLICY IF EXISTS "submissions: owner update" ON buyback_submissions;
DROP POLICY IF EXISTS "submissions: anon insert"  ON buyback_submissions;
DROP POLICY IF EXISTS "submissions: admin select" ON buyback_submissions;
DROP POLICY IF EXISTS "submissions: admin update" ON buyback_submissions;

CREATE POLICY "submissions: owner select"
  ON buyback_submissions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "submissions: owner insert"
  ON buyback_submissions FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "submissions: anon insert"
  ON buyback_submissions FOR INSERT WITH CHECK (user_id IS NULL);

CREATE POLICY "submissions: owner update"
  ON buyback_submissions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "submissions: admin select"
  ON buyback_submissions FOR SELECT USING (public.is_admin());

CREATE POLICY "submissions: admin update"
  ON buyback_submissions FOR UPDATE USING (public.is_admin());

-- ─── 8. RLS policies — bank_accounts ─────────────────────────

DROP POLICY IF EXISTS "bank: owner select" ON bank_accounts;
DROP POLICY IF EXISTS "bank: owner insert" ON bank_accounts;
DROP POLICY IF EXISTS "bank: owner update" ON bank_accounts;
DROP POLICY IF EXISTS "bank: admin select" ON bank_accounts;

CREATE POLICY "bank: owner select"
  ON bank_accounts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bank: owner insert"
  ON bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bank: owner update"
  ON bank_accounts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "bank: admin select"
  ON bank_accounts FOR SELECT USING (public.is_admin());

-- ─── 9. RLS policies — user_form_details ─────────────────────

DROP POLICY IF EXISTS "form_details: owner select" ON user_form_details;
DROP POLICY IF EXISTS "form_details: owner insert" ON user_form_details;
DROP POLICY IF EXISTS "form_details: owner update" ON user_form_details;
DROP POLICY IF EXISTS "form_details: admin select" ON user_form_details;

CREATE POLICY "form_details: owner select"
  ON user_form_details FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "form_details: owner insert"
  ON user_form_details FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "form_details: owner update"
  ON user_form_details FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "form_details: admin select"
  ON user_form_details FOR SELECT USING (public.is_admin());

-- ─── 10. RLS policies — payment_screenshots ──────────────────

DROP POLICY IF EXISTS "payment_screenshots: owner select" ON payment_screenshots;
DROP POLICY IF EXISTS "payment_screenshots: admin select" ON payment_screenshots;
DROP POLICY IF EXISTS "payment_screenshots: admin insert" ON payment_screenshots;

CREATE POLICY "payment_screenshots: owner select"
  ON payment_screenshots FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payment_screenshots: admin select"
  ON payment_screenshots FOR SELECT USING (public.is_admin());

CREATE POLICY "payment_screenshots: admin insert"
  ON payment_screenshots FOR INSERT WITH CHECK (public.is_admin());

-- ─── 11. RLS policies — referrals ────────────────────────────

DROP POLICY IF EXISTS "Users view own referrals"  ON referrals;
DROP POLICY IF EXISTS "Referrals insert open"     ON referrals;
DROP POLICY IF EXISTS "Admins view all referrals" ON referrals;

CREATE POLICY "Users view own referrals"
  ON referrals FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Referrals insert open"
  ON referrals FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins view all referrals"
  ON referrals FOR SELECT USING (public.is_admin());

-- ─── 12. Storage bucket — payment-screenshots ────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-screenshots',
  'payment-screenshots',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public            = EXCLUDED.public,
  file_size_limit   = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "payment_screenshots_storage: owner select" ON storage.objects;
DROP POLICY IF EXISTS "payment_screenshots_storage: admin select" ON storage.objects;
DROP POLICY IF EXISTS "payment_screenshots_storage: admin insert" ON storage.objects;

CREATE POLICY "payment_screenshots_storage: owner select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "payment_screenshots_storage: admin select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-screenshots' AND public.is_admin());

CREATE POLICY "payment_screenshots_storage: admin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-screenshots' AND public.is_admin());

-- ─── 13. Triggers ────────────────────────────────────────────

-- Auto-generate referral_code on new profile insert
CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_code  TEXT;
  final_code TEXT;
  ctr        INT := 0;
BEGIN
  IF NEW.referral_code IS NOT NULL THEN RETURN NEW; END IF;
  base_code  := 'IGO-' || UPPER(SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 8));
  final_code := base_code;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE referral_code = final_code AND id != NEW.id) LOOP
    ctr        := ctr + 1;
    final_code := base_code || ctr::TEXT;
  END LOOP;
  NEW.referral_code := final_code;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_profile_insert_set_code ON profiles;
CREATE TRIGGER before_profile_insert_set_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();

-- Auto-create profile row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone     TEXT;
  v_full_name TEXT;
  v_email     TEXT;
BEGIN
  v_phone     := NEW.raw_user_meta_data->>'phone_number';
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');
  v_email     := NEW.email;

  BEGIN
    INSERT INTO profiles (id, phone, email, full_name, role, created_at, updated_at)
    VALUES (NEW.id, v_phone, v_email, v_full_name, 'user', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      phone      = COALESCE(EXCLUDED.phone,      profiles.phone),
      email      = COALESCE(EXCLUDED.email,      profiles.email),
      full_name  = COALESCE(EXCLUDED.full_name,  profiles.full_name),
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: profiles insert failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Back-fill referral codes for any existing profiles that are missing one
UPDATE profiles
SET referral_code = 'IGO-' || UPPER(SUBSTRING(REPLACE(id::TEXT, '-', ''), 1, 8))
WHERE referral_code IS NULL;

-- ─── 14. Grant admin access ───────────────────────────────────
-- IMPORTANT: Replace <YOUR_AUTH_USER_ID> with your actual auth.users UUID.
-- Find it in Supabase → Authentication → Users.
-- Then uncomment and run these two lines:

-- INSERT INTO admin_users (user_id, is_active)
-- VALUES ('<YOUR_AUTH_USER_ID>', true)
-- ON CONFLICT (user_id) DO UPDATE SET is_active = true;
