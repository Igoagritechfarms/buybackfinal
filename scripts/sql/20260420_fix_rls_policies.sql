-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: RLS policies for anonymous submissions + admin access
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- Fix 1: Allow anonymous users to submit buyback forms (user_id = null)
DROP POLICY IF EXISTS "buyback_submissions_insert_own" ON public.buyback_submissions;
CREATE POLICY "buyback_submissions_insert_own"
  ON public.buyback_submissions FOR INSERT
  WITH CHECK (
    user_id IS NULL
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- Fix 2: Admins can read all profiles
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
CREATE POLICY "profiles_admin_select_all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- Fix 3: Admins can read all submissions
DROP POLICY IF EXISTS "buyback_submissions_admin_select_all" ON public.buyback_submissions;
CREATE POLICY "buyback_submissions_admin_select_all"
  ON public.buyback_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- Fix 4: Admins can update any submission status
DROP POLICY IF EXISTS "buyback_submissions_admin_update_all" ON public.buyback_submissions;
CREATE POLICY "buyback_submissions_admin_update_all"
  ON public.buyback_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- Fix 5: Admins can read all bank accounts
DROP POLICY IF EXISTS "bank_accounts_admin_select_all" ON public.bank_accounts;
CREATE POLICY "bank_accounts_admin_select_all"
  ON public.bank_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- Fix 6: Auto-create profile trigger (handles new auth users including anonymous)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, email, full_name)
  VALUES (
    NEW.id,
    NEW.phone,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
