-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: buyback_submissions RLS — users can also see phone-matched submissions
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Allow users to see their own submissions OR anonymous submissions where
-- their profile phone matches the submission contact_phone
DROP POLICY IF EXISTS "buyback_submissions_select_own" ON public.buyback_submissions;
CREATE POLICY "buyback_submissions_select_own"
  ON public.buyback_submissions FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      user_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.phone = contact_phone
      )
    )
  );

-- Also allow users to update/claim anonymous submissions by their phone
DROP POLICY IF EXISTS "buyback_submissions_update_own" ON public.buyback_submissions;
CREATE POLICY "buyback_submissions_update_own"
  ON public.buyback_submissions FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (
      user_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.phone = contact_phone
      )
    )
  );
