-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: buyback_submissions table
-- Run in Supabase SQL Editor after profiles migration
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.buyback_submissions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete set null,
  contact_name    text not null,
  contact_phone   text not null,
  product_id      text not null,
  product_name    text not null,
  quantity        numeric not null check (quantity > 0),
  quantity_unit   text not null default 'kg',
  expected_price  numeric check (expected_price > 0),
  harvest_date    date,
  location        text not null,
  site_visit_date date,
  schedule_notes  text,
  submission_type text not null check (submission_type in ('sell', 'buy')),
  status          text not null default 'pending'
                    check (status in ('pending', 'reviewing', 'approved', 'rejected', 'completed')),
  form_payload    jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Enable RLS
alter table public.buyback_submissions enable row level security;

-- Indexes
create index if not exists buyback_submissions_user_id_idx    on public.buyback_submissions (user_id);
create index if not exists buyback_submissions_status_idx     on public.buyback_submissions (status);
create index if not exists buyback_submissions_created_at_idx on public.buyback_submissions (created_at desc);
create index if not exists buyback_submissions_type_idx       on public.buyback_submissions (submission_type);

-- ── RLS Policies ──────────────────────────────────────────────────────────────

-- Allow both authenticated and anonymous submissions
-- user_id can be null (guest) or must match the authenticated user
create policy "buyback_submissions_insert_own"
  on public.buyback_submissions for insert
  with check (
    user_id is null
    or (auth.uid() is not null and user_id = auth.uid())
  );

-- Users can read their own submissions
create policy "buyback_submissions_select_own"
  on public.buyback_submissions for select
  using (user_id = auth.uid());

-- Users can update their own pending submissions
create policy "buyback_submissions_update_own"
  on public.buyback_submissions for update
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid());

-- Admins can read all submissions
create policy "buyback_submissions_admin_select_all"
  on public.buyback_submissions for select
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid() and au.is_active = true
    )
  );

-- Admins can update any submission (e.g. change status)
create policy "buyback_submissions_admin_update_all"
  on public.buyback_submissions for update
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid() and au.is_active = true
    )
  );
