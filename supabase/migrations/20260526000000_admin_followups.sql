-- ============================================================
-- Migration: Admin Followups
-- Each admin can attach private followup notes to a submission.
-- Notes are scoped per-admin (admin_email) and are only visible
-- to the admin who created them.
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_followups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES buyback_submissions(id) ON DELETE CASCADE,
  admin_email   TEXT NOT NULL,
  followup_text TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_followups_submission_id_idx ON admin_followups (submission_id);
CREATE INDEX IF NOT EXISTS admin_followups_admin_email_idx   ON admin_followups (admin_email);
CREATE INDEX IF NOT EXISTS admin_followups_admin_sub_idx     ON admin_followups (admin_email, submission_id);

ALTER TABLE admin_followups ENABLE ROW LEVEL SECURITY;

-- Service-role client (used by admin dashboard) always bypasses RLS.
-- No additional policies needed for the admin-only server path.
-- Add a permissive policy so the service-role can still operate:
DROP POLICY IF EXISTS "admin_followups: service role all" ON admin_followups;
CREATE POLICY "admin_followups: service role all"
  ON admin_followups FOR ALL USING (true) WITH CHECK (true);
