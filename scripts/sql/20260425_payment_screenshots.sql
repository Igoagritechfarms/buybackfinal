-- Payment screenshot uploads for admin-to-user payment proof.
-- Run this in Supabase SQL Editor.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and is_active = true
  );
$$;

create table if not exists public.payment_screenshots (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  bank_account_id uuid references public.bank_accounts(id) on delete set null,
  uploaded_by     uuid references auth.users(id) on delete set null,
  file_name       text not null,
  file_path       text not null unique,
  file_type       text,
  file_size       integer not null check (file_size <= 5242880),
  created_at      timestamptz not null default now()
);

create index if not exists payment_screenshots_user_created_idx
  on public.payment_screenshots (user_id, created_at desc);

alter table public.payment_screenshots enable row level security;

drop policy if exists "payment_screenshots: owner select" on public.payment_screenshots;
drop policy if exists "payment_screenshots: admin select" on public.payment_screenshots;
drop policy if exists "payment_screenshots: admin insert" on public.payment_screenshots;

create policy "payment_screenshots: owner select"
  on public.payment_screenshots for select
  using (auth.uid() = user_id);

create policy "payment_screenshots: admin select"
  on public.payment_screenshots for select
  using (public.is_admin());

create policy "payment_screenshots: admin insert"
  on public.payment_screenshots for insert
  with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-screenshots',
  'payment-screenshots',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "payment_screenshots_storage: owner select" on storage.objects;
drop policy if exists "payment_screenshots_storage: admin select" on storage.objects;
drop policy if exists "payment_screenshots_storage: admin insert" on storage.objects;

create policy "payment_screenshots_storage: owner select"
  on storage.objects for select
  using (
    bucket_id = 'payment-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "payment_screenshots_storage: admin select"
  on storage.objects for select
  using (
    bucket_id = 'payment-screenshots'
    and public.is_admin()
  );

create policy "payment_screenshots_storage: admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-screenshots'
    and public.is_admin()
  );
