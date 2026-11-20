# Changelog

## 2026-11-20 (evening)

### Interface redesign
- New navigation: Browse scholarships, Find supervisors and My outreach in the header, and a bottom tab bar (with Profile) on phones.
- Get started checklist, saved shortlist, page headers with next actions, plain-language labels and tooltips.
- Cards rebuilt around the name, your fit, the money and the deadline; the detail panel opens with "What to do next".
- Admin actions grouped in one menu. Plan and audit in `docs/UX_REDESIGN.md`.

### Accounts
- Optional sign-in with email and password or an email link (Google button appears when `NEXT_PUBLIC_ENABLE_GOOGLE_SIGNIN=true`).
- Signed-in users get their profile, document checklist, shortlist, outreach contacts, sender details and guide progress saved to their own row in `user_state` (Row-Level Security: only the owner can read or write it).
- On first sign-in the data already in this browser is copied into the account. Guests keep using browser storage.
- If the `user_state` table has not been created yet, the app keeps working and says so in the account menu.
- SQL: `supabase/migrations/20261120_user_accounts.sql`.

## 2026-11-20

### Security
- Admin passcode is checked only on the server against `ADMIN_PIN`; no default value and no passcode hints in the UI.
- The URL import endpoint now requires the admin passcode.
- Database writes go through a server-only client using `SUPABASE_SERVICE_ROLE_KEY`; the public key is read-only (see `supabase-schema.sql`).
- Saved admin sessions are re-checked with the server on page load.

### Reliability
- Daily keep-alive (`/api/keep-alive`, Vercel cron at 06:00 UTC) so the free Supabase project is not paused for inactivity.

### Feature A: Expanded catalog (25 programs)
- Added Stipendium Hungaricum, Türkiye Bursları, Fulbright Foreign Student Program, Global Korea Scholarship, Commonwealth Master's & PhD, Swedish Institute (SISGP), Swiss Government Excellence, Canada Graduate Research Scholarship – Doctoral (formerly Vanier), Australia Awards, NL Scholarship, VLIR-UOS, Taiwan MOE/ICDF and SINGA.
- Replaced generated "today + N days" deadlines with current-cycle dates. Dates that are not announced yet are marked "est." and explained in the detail panel.
- New fields: `deadlineIsEstimate`, `deadlineNote`, `stipendIsEstimate`, `stipendNote`, `lastVerified`.
- Admin "Sync Programs" adds missing built-in programs and refreshes dated deadline facts without removing custom entries. "Reset Seed" now asks for confirmation.

### Feature B: Find Supervisors
- University autocomplete and topic search on the free OpenAlex API (called from the browser, no key).
- Ranks researchers by recent on-topic papers at the institution; shows h-index, works, topics, recent papers and links to Google Scholar, ORCID, OpenAlex and a faculty-page search.
- Flags researchers whose latest affiliation has changed.
- "Find supervisors" shortcuts on supervisor-funded cards and in the detail panel prefill the search.

### Feature C: My Outreach
- Status pipeline (Drafting → Email Sent → Follow-up Due → Replied / Interview → Declined) with a summary of contacts, emails sent, response rate and follow-ups due.
- Contact editor with notes, follow-up date, profile link and status history.
- Email drafts (first email, follow-up, thank-you) built from the academic profile and the sender's details, with copy and open-in-email-app actions.
- Save researchers straight from Find Supervisors. Marking an email as sent schedules a follow-up 10 days later.
- Stored in the browser (localStorage), like the profile.

### Design and quality
- Removed decorative emoji, emoji flags and gradients for a calmer, classic look.
- Negative savings now display correctly (for example "-$168/mo") instead of "+$-168".
- Deadlines no longer shift by a day in time zones west of UTC.
- No horizontal scrolling at 375px on any section.
- Accessibility: dialog roles, labelled sliders, combobox semantics for the university search.
- ESLint passes with no errors or warnings.

### Notes and decisions
- Vanier CGS was discontinued in 2025 and merged into CGRS-D, which is mainly for Canadian citizens and permanent residents; it is listed with that warning.
- The NL Scholarship is a one-time €5,000 partial award; it is listed honestly as partial funding.
- USD figures for non-USD stipends use mid-November 2026 reference rates and are marked approximate where relevant.
