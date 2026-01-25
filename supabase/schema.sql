-- Supabase schema for FuatAtolye (single-tenant, multi-user)

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.work_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  default_price numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  job_type text,
  quantity integer not null default 1,
  milyem text,
  gold_weight numeric,
  price numeric,
  has numeric,
  is_paid boolean not null default false,
  note text,
  date date not null,
  is_edited boolean not null default false,
  last_edited_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  has_amount numeric,
  silver_amount numeric,
  cash_amount numeric,
  date date not null,
  note text,
  is_auto_generated boolean not null default false,
  is_edited boolean not null default false,
  last_edited_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  description text,
  amount numeric not null default 0,
  date date not null,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.customers enable row level security;
alter table public.transactions enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.work_types enable row level security;

-- Policies: allow all authenticated AND anon users to read/write (single-tenant shared data)
-- Both authenticated and anon roles can access for flexibility

-- Customers policies
create policy "customers_select" on public.customers for select to authenticated, anon using (true);
create policy "customers_insert" on public.customers for insert to authenticated, anon with check (true);
create policy "customers_update" on public.customers for update to authenticated, anon using (true);
create policy "customers_delete" on public.customers for delete to authenticated, anon using (true);

-- Transactions policies
create policy "transactions_select" on public.transactions for select to authenticated, anon using (true);
create policy "transactions_insert" on public.transactions for insert to authenticated, anon with check (true);
create policy "transactions_update" on public.transactions for update to authenticated, anon using (true);
create policy "transactions_delete" on public.transactions for delete to authenticated, anon using (true);

-- Payments policies
create policy "payments_select" on public.payments for select to authenticated, anon using (true);
create policy "payments_insert" on public.payments for insert to authenticated, anon with check (true);
create policy "payments_update" on public.payments for update to authenticated, anon using (true);
create policy "payments_delete" on public.payments for delete to authenticated, anon using (true);

-- Expenses policies
create policy "expenses_select" on public.expenses for select to authenticated, anon using (true);
create policy "expenses_insert" on public.expenses for insert to authenticated, anon with check (true);
create policy "expenses_update" on public.expenses for update to authenticated, anon using (true);
create policy "expenses_delete" on public.expenses for delete to authenticated, anon using (true);

-- Work_types policies
create policy "work_types_select" on public.work_types for select to authenticated, anon using (true);
create policy "work_types_insert" on public.work_types for insert to authenticated, anon with check (true);
create policy "work_types_update" on public.work_types for update to authenticated, anon using (true);
create policy "work_types_delete" on public.work_types for delete to authenticated, anon using (true);
