-- ==============================================================================
-- ScholarTrack: per-user saved data for signed-in users
-- Run once in the Supabase SQL Editor. Safe to re-run.
--
-- One row per user. Each column holds one part of that user's data:
--   profile             academic profile (CGPA, IELTS, degree, preferences)
--   document_checklist  ticked application documents
--   saved_scholarships  shortlist of scholarship ids
--   outreach_contacts   saved supervisors and outreach entries
--   outreach_sender     sender details used in email drafts
--   guide               getting-started progress
-- Row-Level Security limits every user to their own row (auth.uid() = user_id).
-- ==============================================================================

create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  profile jsonb,
  document_checklist jsonb not null default '{}'::jsonb,
  saved_scholarships jsonb not null default '[]'::jsonb,
  outreach_contacts jsonb not null default '[]'::jsonb,
  outreach_sender jsonb,
  guide jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

drop policy if exists "Users read own state" on public.user_state;
drop policy if exists "Users insert own state" on public.user_state;
drop policy if exists "Users update own state" on public.user_state;
drop policy if exists "Users delete own state" on public.user_state;

create policy "Users read own state"
  on public.user_state for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own state"
  on public.user_state for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own state"
  on public.user_state for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own state"
  on public.user_state for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Guests (anon) get no access at all.
revoke all on public.user_state from anon;
grant select, insert, update, delete on public.user_state to authenticated;
