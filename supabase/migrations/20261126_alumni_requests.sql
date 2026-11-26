-- ==============================================================================
-- ScholarTrack: Bangladeshi alumni contacts
-- Run once in the Supabase SQL Editor. Safe to re-run.
--
-- Alumni can ask to be added (kind = 'add') and anyone listed can ask to be
-- removed (kind = 'remove'). Every request waits for the admin. Visitors can only
-- insert; the site reads approved rows through the server (service-role key) and
-- returns public fields only, never the contact email or the note.
-- ==============================================================================

create table if not exists public.alumni_requests (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('add', 'remove')),
  program text not null check (char_length(program) between 1 and 120),
  scholarship_id text not null check (char_length(scholarship_id) between 1 and 120),
  target_id text check (target_id is null or char_length(target_id) <= 200),
  name text check (name is null or char_length(name) <= 120),
  university text check (university is null or char_length(university) <= 160),
  detail text check (detail is null or char_length(detail) <= 160),
  profile_url text check (profile_url is null or char_length(profile_url) <= 500),
  evidence_url text check (evidence_url is null or char_length(evidence_url) <= 500),
  note text check (note is null or char_length(note) <= 1000),
  contact text check (contact is null or char_length(contact) <= 200),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists alumni_requests_program_status_idx
  on public.alumni_requests (program, status);
create index if not exists alumni_requests_status_created_idx
  on public.alumni_requests (status, created_at desc);

alter table public.alumni_requests enable row level security;

drop policy if exists "Anyone can send an alumni request" on public.alumni_requests;

create policy "Anyone can send an alumni request"
  on public.alumni_requests for insert
  to anon, authenticated
  with check (status = 'pending');

revoke select, update, delete on public.alumni_requests from anon, authenticated;
grant insert on public.alumni_requests to anon, authenticated;
