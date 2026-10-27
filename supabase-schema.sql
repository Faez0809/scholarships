-- ==============================================================================
-- ScholarTrack - Supabase PostgreSQL Schema
-- Project: skuopdhtzyfcrvvjhkej
-- Description: Creates the 'scholarships' table with JSONB document storage,
-- updated_at timestamps, and Row-Level Security policies.
-- ==============================================================================

-- 1. Create table
create table if not exists public.scholarships (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 2. Create index on updated_at for fast descending sorting
create index if not exists idx_scholarships_updated_at on public.scholarships (updated_at desc);

-- 3. Enable Row-Level Security (RLS)
alter table public.scholarships enable row level security;

-- 4. Set RLS Policies
-- Allow public read access to all users
create policy "Allow public read access"
  on public.scholarships
  for select
  using (true);

-- Allow insert (Write operations are also verified at the server API level via x-admin-pin)
create policy "Allow public insert"
  on public.scholarships
  for insert
  with check (true);

-- Allow update
create policy "Allow public update"
  on public.scholarships
  for update
  using (true)
  with check (true);

-- Allow delete
create policy "Allow public delete"
  on public.scholarships
  for delete
  using (true);

-- 5. Enable Realtime broadcast (optional for live multi-client updates)
alter publication supabase_realtime add table public.scholarships;
