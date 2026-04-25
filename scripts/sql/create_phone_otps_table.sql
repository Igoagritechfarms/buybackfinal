-- Create phone_otps table for OTP storage
-- Run this in Supabase SQL Editor

create table if not exists public.phone_otps (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  otp_code text not null,
  expires_at timestamptz not null,
  is_used boolean not null default false,
  created_at timestamptz not null default now()
);

-- Create index for fast lookups by phone number
create index if not exists idx_phone_otps_phone_number on public.phone_otps(phone_number);
create index if not exists idx_phone_otps_phone_used on public.phone_otps(phone_number, is_used);

-- Enable RLS
alter table public.phone_otps enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Service role can manage OTPs" on public.phone_otps;

-- Allow service role to manage OTPs (backend only)
create policy "Service role can manage OTPs"
  on public.phone_otps
  for all
  to service_role
  using (true)
  with check (true);

-- Grant permissions to service role
grant all on public.phone_otps to service_role;
