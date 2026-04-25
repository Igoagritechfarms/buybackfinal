-- Supabase Schema Migration

-- 1. Create OTP logs table
CREATE TABLE IF NOT EXISTS otp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    purpose TEXT NOT NULL, -- 'signup' or 'login'
    is_verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create users table (public extension of auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create bank_details table
CREATE TABLE IF NOT EXISTS bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    account_holder_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    upi_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Disable RLS for otp_logs to allow demo fetching (or create permissive policies)
CREATE POLICY "Allow public select for demo" ON otp_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert for demo" ON otp_logs;
CREATE POLICY "Allow public insert for demo" ON otp_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update for demo" ON otp_logs;
CREATE POLICY "Allow public update for demo" ON otp_logs FOR UPDATE USING (true);

-- Polices for users (Self access)
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
CREATE POLICY "Users can view own record" ON public.users FOR SELECT USING (auth.uid() = id);

-- Polices for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Polices for bank_details
DROP POLICY IF EXISTS "Users can view own bank record" ON bank_details;
CREATE POLICY "Users can view own bank record" ON bank_details FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own bank record" ON bank_details;
CREATE POLICY "Users can insert own bank record" ON bank_details FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own bank record" ON bank_details;
CREATE POLICY "Users can update own bank record" ON bank_details FOR UPDATE USING (auth.uid() = user_id);

-- Polices for form_submissions
DROP POLICY IF EXISTS "Users can view own submissions" ON form_submissions;
CREATE POLICY "Users can view own submissions" ON form_submissions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own submissions" ON form_submissions;
CREATE POLICY "Users can insert own submissions" ON form_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies
DROP POLICY IF EXISTS "Admin view all users" ON public.users;
CREATE POLICY "Admin view all users" ON public.users FOR SELECT USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = TRUE
);
DROP POLICY IF EXISTS "Admin view all profiles" ON user_profiles;
CREATE POLICY "Admin view all profiles" ON user_profiles FOR SELECT USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = TRUE
);
DROP POLICY IF EXISTS "Admin view all bank details" ON bank_details;
CREATE POLICY "Admin view all bank details" ON bank_details FOR SELECT USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = TRUE
);
DROP POLICY IF EXISTS "Admin view all submissions" ON form_submissions;
CREATE POLICY "Admin view all submissions" ON form_submissions FOR SELECT USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = TRUE
);

-- Trigger to sync auth.users with public.users and user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone_number, username, is_admin)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'phone_number', 
    NEW.raw_user_meta_data->>'username',
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false)
  );

  INSERT INTO public.user_profiles (user_id, full_name, phone_number)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'phone_number'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
