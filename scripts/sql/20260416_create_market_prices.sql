create extension if not exists pgcrypto;

create table if not exists public.market_prices (
  id uuid primary key default gen_random_uuid(),
  product_id text not null unique,
  name text not null,
  price numeric not null,
  prev_price numeric,
  unit text not null,
  category text,
  demand text check (demand in ('Low', 'Medium', 'High', 'Very High')),
  updated_at timestamptz not null default now()
);

create index if not exists market_prices_category_idx on public.market_prices (category);
create index if not exists market_prices_updated_at_idx on public.market_prices (updated_at desc);

alter table public.market_prices enable row level security;

drop policy if exists "Public read prices" on public.market_prices;
create policy "Public read prices" on public.market_prices
  for select using (true);

drop policy if exists "Admin update prices" on public.market_prices;
create policy "Admin update prices" on public.market_prices
  for update using (auth.role() = 'authenticated');

drop policy if exists "Admin insert prices" on public.market_prices;
create policy "Admin insert prices" on public.market_prices
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admin delete prices" on public.market_prices;
create policy "Admin delete prices" on public.market_prices
  for delete using (auth.role() = 'authenticated');

alter publication supabase_realtime add table public.market_prices;

-- Seed default market prices (insert only if table is empty)
insert into public.market_prices (product_id, name, price, prev_price, unit, category, demand)
select v.product_id, v.name, v.price, v.prev_price, v.unit, v.category, v.demand
from (values
  ('cucumber',       'Cucumber',         28,  26,  'kg', 'Vegetables', 'High'),
  ('oyster-mushroom','Oyster Mushroom',  198, 177,  'kg', 'Mushroom',   'Very High'),
  ('microgreens',    'Microgreens',      289, 268,  'kg', 'Greens',     'Very High'),
  ('button-mushroom','Button Mushroom',  220, 215,  'kg', 'Mushroom',   'High'),
  ('tomato',         'Tomato',            42,  40,  'kg', 'Vegetables', 'High'),
  ('spinach',        'Spinach',           35,  36,  'kg', 'Greens',     'Medium'),
  ('onion',          'Onion',             58,  55,  'kg', 'Vegetables', 'High'),
  ('toor-dal',       'Toor Dal',         145, 140,  'kg', 'Pulses',     'Medium'),
  ('ragi',           'Ragi',              48,  47,  'kg', 'Millets',    'Low'),
  ('jowar',          'Jowar',             38,  37,  'kg', 'Millets',    'Low'),
  ('mango',          'Mango',             90,  85,  'kg', 'Fruits',     'High'),
  ('banana',         'Banana',            32,  30,  'kg', 'Fruits',     'High')
) as v(product_id, name, price, prev_price, unit, category, demand)
where not exists (select 1 from public.market_prices limit 1);
