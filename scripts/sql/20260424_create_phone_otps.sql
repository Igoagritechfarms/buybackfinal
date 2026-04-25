-- Migration: Create phone_otps table for OTP verification
-- Run this in Supabase SQL Editor before starting the OTP server.

-- 1. Create table
create table if not exists public.phone_otps (
  id           uuid        primary key default gen_random_uuid(),
  phone_number text        not null,
  otp_code     text        not null,
  expires_at   timestamptz not null,
  is_used      boolean     not null default false,
  created_at   timestamptz not null default now()
);

-- 2. Index for fast lookup by phone (most recent first)
create index if not exists phone_otps_phone_created_idx
  on public.phone_otps (phone_number, created_at desc);

-- 3. Index to speed up expiry cleanup
create index if not exists phone_otps_expires_at_idx
  on public.phone_otps (expires_at);

-- 4. Enable RLS (service role bypasses RLS, so backend can still insert)
alter table public.phone_otps enable row level security;

-- 5. Allow service role full access (backend uses service role key)
--    No extra policy needed — service role bypasses RLS by default.

-- 6. Auto-cleanup job: delete OTPs older than 24 hours
--    (Optional — run manually or schedule via pg_cron)
-- delete from public.phone_otps where created_at < now() - interval '24 hours';

-- 7. Verify setup
select 'phone_otps table created successfully' as status;
