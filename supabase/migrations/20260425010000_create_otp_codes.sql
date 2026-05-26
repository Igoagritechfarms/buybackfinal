create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_code text not null,
  used boolean default false,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists otp_codes_phone_created_idx
  on public.otp_codes (phone, created_at desc);

create index if not exists otp_codes_expires_idx
  on public.otp_codes (expires_at);

alter table public.otp_codes enable row level security;

drop policy if exists "Service role can manage otp codes" on public.otp_codes;

create policy "Service role can manage otp codes"
on public.otp_codes
for all
using (true)
with check (true);
