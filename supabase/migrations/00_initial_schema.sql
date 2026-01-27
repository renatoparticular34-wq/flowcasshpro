-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Companies Table
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Profiles Table (Links Auth Users to Companies)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  company_id uuid references public.companies on delete cascade,
  full_name text,
  role text default 'admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Account Plans (Chart of Accounts)
create table public.accounts_plan (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies on delete cascade not null,
  name text not null,
  type text check (type in ('Entrada', 'Saída')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Transactions (Cash Movements)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies on delete cascade not null,
  account_id uuid references public.accounts_plan on delete set null,
  description text not null,
  amount numeric(15, 2) not null,
  date date not null,
  status text check (status in ('SIM', 'NÃO')) default 'NÃO', -- 'SIM' = Paid, 'NÃO' = Pending
  type text check (type in ('Entrada', 'Saída')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Settings
create table public.settings (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies on delete cascade not null unique,
  initial_balance numeric(15, 2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for Performance
create index idx_profiles_company_id on public.profiles(company_id);
create index idx_transactions_company_id on public.transactions(company_id);
create index idx_transactions_date on public.transactions(date);
create index idx_accounts_plan_company_id on public.accounts_plan(company_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.accounts_plan enable row level security;
alter table public.transactions enable row level security;
alter table public.settings enable row level security;

-- RLS POLICIES

-- Helper function to get current user's company_id
create or replace function get_auth_user_company_id()
returns uuid
language sql security definer
as $$
  select company_id from public.profiles where id = auth.uid() limit 1;
$$;

-- Companies: Users can view their own company
create policy "Users can view their own company"
  on public.companies for select
  using (id = get_auth_user_company_id());

-- Profiles: Users can view/edit their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Accounts Plan: Access based on Company ID
create policy "Access accounts of own company"
  on public.accounts_plan for all
  using (company_id = get_auth_user_company_id())
  with check (company_id = get_auth_user_company_id());

-- Transactions: Access based on Company ID
create policy "Access transactions of own company"
  on public.transactions for all
  using (company_id = get_auth_user_company_id())
  with check (company_id = get_auth_user_company_id());

-- Settings: Access based on Company ID
create policy "Access settings of own company"
  on public.settings for all
  using (company_id = get_auth_user_company_id())
  with check (company_id = get_auth_user_company_id());

-- TRIGGER: New User Setup
-- When a new user signs up via Supabase Auth, create a Company and Profile for them.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_company_id uuid;
begin
  -- 1. Create a new Company for the user
  insert into public.companies (name)
  values ('Minha Empresa')
  returning id into new_company_id;

  -- 2. Create a Profile linking the user to the company
  insert into public.profiles (id, company_id, full_name, role)
  values (new.id, new_company_id, new.raw_user_meta_data->>'full_name', 'admin');

  -- 3. Create Default Accounts (Optional but helpful)
  insert into public.accounts_plan (company_id, name, type) values
  (new_company_id, 'Vendas', 'Entrada'),
  (new_company_id, 'Serviços', 'Entrada'),
  (new_company_id, 'Aluguel', 'Saída'),
  (new_company_id, 'Marketing', 'Saída'),
  (new_company_id, 'Impostos', 'Saída'),
  (new_company_id, 'Salários', 'Saída');

  -- 4. Create Default Settings
  insert into public.settings (company_id, initial_balance)
  values (new_company_id, 0);

  return new;
end;
$$;

-- Bind the trigger to auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
