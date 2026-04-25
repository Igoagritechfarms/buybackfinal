create extension if not exists pgcrypto;

create table if not exists public.otp_verifications (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  verified boolean not null default false,
  attempts integer not null default 0 check (attempts >= 0),
  verified_at timestamptz,
  invalidated_at timestamptz,
  request_ip text,
  twilio_message_sid text
);

create index if not exists otp_verifications_phone_created_idx
  on public.otp_verifications (phone, created_at desc);

create index if not exists otp_verifications_expires_at_idx
  on public.otp_verifications (expires_at);

create index if not exists otp_verifications_request_ip_created_idx
  on public.otp_verifications (request_ip, created_at desc);

alter table public.otp_verifications enable row level security;
