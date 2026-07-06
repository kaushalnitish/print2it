-- =====================================================================
-- PRINTFLOW SUPABASE DATABASE SCHEMA & SECURITY POLICIES
-- =====================================================================
-- This file provides the complete database foundation for PrintFlow.
-- Copy-paste this code into the SQL Editor in your Supabase Dashboard.
-- =====================================================================

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. PROFILES TABLE (Shop Owners)
-- ---------------------------------------------------------------------
-- Links to Supabase Auth.users table.
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    email text not null,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Owners can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Owners can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 2. SHOPS TABLE
-- ---------------------------------------------------------------------
create table public.shops (
    id uuid default gen_random_uuid() primary key,
    shop_id text unique not null, -- External ID representation (e.g., 'SH-1234')
    shop_slug text unique not null,
    shop_name text not null,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    phone text not null,
    address text not null,
    subscription text default 'Starter' not null, -- 'Starter', 'Professional', 'Enterprise', 'Trial Active'
    pairing_key text not null,
    printer_status text default 'Not Connected' not null, -- 'online', 'offline', 'Not Connected'
    agent_status text default 'Not Installed' not null, -- 'connected', 'disconnected', 'Not Installed'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on shops
alter table public.shops enable row level security;

-- Create policies for shops
create policy "Anyone can view shop profiles"
    on public.shops for select
    using (true); -- Required for walk-in customers visiting the portal

create policy "Owners can manage their own shops"
    on public.shops for all
    using (auth.uid() = owner_id)
    with check (auth.uid() = owner_id);

-- ---------------------------------------------------------------------
-- 3. PRINT JOBS TABLE
-- ---------------------------------------------------------------------
create table public.print_jobs (
    id uuid default gen_random_uuid() primary key,
    job_id text unique not null, -- External ID representation (e.g., 'job-demo-1')
    token text not null, -- Client-facing pick-up token (e.g., 'PF-1001')
    file_name text not null,
    file_size text not null,
    pages integer not null,
    copies integer not null,
    color_mode text not null, -- 'bw', 'color'
    paper_size text not null, -- 'a4', 'a3'
    side_mode text not null, -- 'single', 'double'
    status text default 'submitted' not null, -- 'submitted', 'waiting', 'printing', 'ready', 'picked_up', 'cancelled'
    shop_id uuid references public.shops(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on print_jobs
alter table public.print_jobs enable row level security;

-- Create policies for print_jobs
create policy "Anyone can insert new print jobs"
    on public.print_jobs for insert
    with check (true); -- Required so walk-in customer portal can submit files

create policy "Customers can view their specific jobs by token"
    on public.print_jobs for select
    using (true); -- In practice, filter by token on the client, or restrict if using customer sessions

create policy "Shop owners can manage jobs for their shops"
    on public.print_jobs for all
    using (
        exists (
            select 1 from public.shops
            where shops.id = print_jobs.shop_id
            and shops.owner_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.shops
            where shops.id = print_jobs.shop_id
            and shops.owner_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------
-- 4. DATABASE TRIGGERS & FUNCTIONS
-- ---------------------------------------------------------------------
-- Automatically create a profile row in public.profiles when a user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Valued Owner'),
    new.email,
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to hook the function to auth.users signups
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- 5. USEFUL INDEXES FOR QUERY OPTIMIZATION
-- ---------------------------------------------------------------------
create index idx_shops_slug on public.shops(shop_slug);
create index idx_shops_owner on public.shops(owner_id);
create index idx_print_jobs_shop on public.print_jobs(shop_id);
create index idx_print_jobs_token on public.print_jobs(token);
create index idx_print_jobs_status on public.print_jobs(status);
