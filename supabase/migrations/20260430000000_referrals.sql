-- Add referral_code + referred_by to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Back-fill existing profiles with UUID-based codes
UPDATE profiles
SET referral_code = 'IGO-' || UPPER(SUBSTRING(REPLACE(id::TEXT, '-', ''), 1, 8))
WHERE referral_code IS NULL;

-- Trigger: auto-generate referral_code on new profile insert
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  ctr INT := 0;
BEGIN
  IF NEW.referral_code IS NOT NULL THEN
    RETURN NEW;
  END IF;
  base_code := 'IGO-' || UPPER(SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 8));
  final_code := base_code;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE referral_code = final_code AND id != NEW.id) LOOP
    ctr := ctr + 1;
    final_code := base_code || ctr::TEXT;
  END LOOP;
  NEW.referral_code := final_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_profile_insert_set_code ON profiles;
CREATE TRIGGER before_profile_insert_set_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_referral_code();

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referred_phone TEXT,
  referred_name TEXT,
  status TEXT NOT NULL DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'completed')),
  bonus_amount INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own referrals" ON referrals;
CREATE POLICY "Users view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Referrals insert open" ON referrals;
CREATE POLICY "Referrals insert open" ON referrals
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins view all referrals" ON referrals;
CREATE POLICY "Admins view all referrals" ON referrals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );
