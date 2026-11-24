-- ==============================================================================
-- ScholarTrack: reports of wrong or outdated scholarship information
-- Run once in the Supabase SQL Editor. Safe to re-run.
--
-- Visitors can only add a report (INSERT). They cannot read, change or delete
-- reports. The admin panel reads and updates them through the server, which uses
-- the service-role key and is not limited by these policies.
-- ==============================================================================

create table if not exists public.error_reports (
  id uuid primary key default gen_random_uuid(),
  scholarship_id text not null,
  field text not null check (field in ('Deadline', 'CGPA/IELTS', 'Stipend/funding', 'Eligible countries', 'Link broken', 'Other')),
  message text not null check (char_length(message) between 1 and 1000),
  contact text check (contact is null or char_length(contact) <= 200),
  status text not null default 'open' check (status in ('open', 'fixed', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists error_reports_status_created_idx
  on public.error_reports (status, created_at desc);

alter table public.error_reports enable row level security;

drop policy if exists "Anyone can submit a report" on public.error_reports;

-- Insert only. No select, update or delete policy exists for anon or authenticated,
-- so those operations are denied for visitors.
create policy "Anyone can submit a report"
  on public.error_reports for insert
  to anon, authenticated
  with check (status = 'open');

revoke select, update, delete on public.error_reports from anon, authenticated;
grant insert on public.error_reports to anon, authenticated;
