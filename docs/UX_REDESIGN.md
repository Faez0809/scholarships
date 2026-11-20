# Interface redesign plan (Nov 2026)

## Audit: where first-time visitors get lost

Checked as a new visitor at 375px and on desktop.

1. **No sense of place.** Section tabs sit inside the page, under a header full of stats, a sync badge and a search box. On phones the tabs scroll away.
2. **No starting point.** The page opens on 25 cards with three rows of filters above them. Nothing says "set your profile first", although every eligibility badge depends on it.
3. **Profile hidden on phones.** It is a collapsed bar labelled "Filter", so people treat it as a filter rather than "about me".
4. **Jargon.** "Gov / Multi-Uni", "RA/TA", "Net savings", "Supervisor Rec." and "Central Admission" have no explanation.
5. **Cards compete with themselves.** Location, region, degrees, field, funding type, supervisor type, partner count, eligibility, minimums, three money figures and a deadline all have similar visual weight. The scholarship name is not the first thing you see.
6. **No next step.** After opening a scholarship there is no "what now?". Saving, supervisors and outreach are not connected into a journey.
7. **Admin controls mixed with visitor controls** in the main header.
8. **Too many accent colours** (indigo, violet, purple, blue, emerald, amber) with no consistent meaning.

## Information architecture

- **Three sections**, always visible: Browse scholarships, Find supervisors, My outreach.
  - Desktop: in the sticky header with a clear active underline.
  - Phones: a fixed bottom tab bar (Browse, Supervisors, Outreach, Profile).
- **Your profile** is a first-class panel: a sticky sidebar on desktop, a bottom sheet on phones, opened from the tab bar or any "Edit profile" link.
- **Admin** actions move into one admin menu in the header.

## Guidance

- **Get started checklist** (dismissible, remembered in the browser):
  1. Set your profile
  2. Open a scholarship
  3. Save one to your shortlist
  4. Find a supervisor
  5. Track your outreach
  Each step has a button that takes you there; completed steps tick themselves.
- **Page headers** on every section: what this page is, one sentence of help, and the main next action.
- **Saved shortlist**: a bookmark on every card and in the detail panel, plus a "Saved" filter.
- **Detail panel "What to do next"**: check requirements, gather documents, contact a supervisor (when needed), apply on the official site.
- **Plain language and tooltips**: "Government program", "University scholarship", "Professor-funded (RA/TA)", "Left each month", with short explanations behind an info button.
- **Helpful empty states** that always offer the next action.

## Visual system

- One accent colour (indigo 600) for links, active navigation, focus rings and selected states. Primary buttons are near-black. Green, amber and red only mean status.
- Type scale: page title 20/24, section title 16, card title 15, body 14, meta 12, micro 11.
- Spacing on a 4px grid; cards with 16px padding, 12px radius, hairline borders, no gradients, no glow, no emoji.
- Visible focus rings on every control; text contrast at least 4.5:1.
- Everything works at 375px with no horizontal scrolling; bottom tab bar leaves safe space for content.
