-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: user_form_details table + bank_accounts new columns
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. user_form_details table ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_form_details (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name       text,
  phone           text,
  address         text,
  city            text,
  state           text,
  pincode         text,
  crop_type       text,
  acreage         numeric,
  farming_method  text CHECK (farming_method IN ('organic', 'inorganic', 'mixed')),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_form_details_user_id_key UNIQUE (user_id)
);

ALTER TABLE public.user_form_details ENABLE ROW LEVEL SECURITY;

-- Users read their own
CREATE POLICY "user_form_details_select_own"
  ON public.user_form_details FOR SELECT
  USING (auth.uid() = user_id);

-- Users insert their own
CREATE POLICY "user_form_details_insert_own"
  ON public.user_form_details FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users update their own
CREATE POLICY "user_form_details_update_own"
  ON public.user_form_details FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins read all
CREATE POLICY "user_form_details_admin_select_all"
  ON public.user_form_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- ── 2. Add branch_name + upi_id to bank_accounts ─────────────────────────────

ALTER TABLE public.bank_accounts
  ADD COLUMN IF NOT EXISTS branch_name text,
  ADD COLUMN IF NOT EXISTS upi_id      text;

-- ── 3. updated_at auto-trigger for user_form_details ─────────────────────────

-- Reuse existing set_updated_at function if present, else create it
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_form_details_updated_at ON public.user_form_details;
CREATE TRIGGER user_form_details_updated_at
  BEFORE UPDATE ON public.user_form_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
