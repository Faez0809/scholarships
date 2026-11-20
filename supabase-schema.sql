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
-- The public (anon) key may only READ. All writes go through the Next.js API
-- routes, which check the admin passcode and use the server-only
-- SUPABASE_SERVICE_ROLE_KEY (the service role bypasses RLS).
-- Safe to re-run: old open write policies are dropped if they exist.
drop policy if exists "Allow public insert" on public.scholarships;
drop policy if exists "Allow public update" on public.scholarships;
drop policy if exists "Allow public delete" on public.scholarships;
drop policy if exists "Allow public read access" on public.scholarships;

create policy "Allow public read access"
  on public.scholarships
  for select
  to anon, authenticated
  using (true);

-- Defence in depth: remove write privileges from the public roles entirely.
revoke insert, update, delete, truncate on public.scholarships from anon, authenticated;

-- 5. Enable Realtime broadcast (optional for live multi-client updates)
alter publication supabase_realtime add table public.scholarships;
