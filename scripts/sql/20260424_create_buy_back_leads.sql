-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Create buy_back_leads table
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.buy_back_leads (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            text NOT NULL,
    phone           text NOT NULL,
    age             integer,
    pincode         text,
    zone            text,
    crop_type       text,
    acreage         numeric,
    farming_method  text CHECK (farming_method IN ('organic', 'inorganic', 'mixed')),
    language        text,
    status          text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buy_back_leads ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ──────────────────────────────────────────────────────────────

-- Allow anyone to insert (Public Lead Form)
CREATE POLICY "Allow public insert for buy_back_leads"
ON public.buy_back_leads FOR INSERT
WITH CHECK (true);

-- Only Admins can view/update leads
-- Note: Reusing the admin check logic from other tables
CREATE POLICY "Admins can view all buy_back_leads"
ON public.buy_back_leads FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users au
        WHERE au.user_id = auth.uid() AND au.is_active = true
    )
);

CREATE POLICY "Admins can update buy_back_leads"
ON public.buy_back_leads FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users au
        WHERE au.user_id = auth.uid() AND au.is_active = true
    )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS buy_back_leads_updated_at ON public.buy_back_leads;
CREATE TRIGGER buy_back_leads_updated_at
  BEFORE UPDATE ON public.buy_back_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
