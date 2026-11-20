# QA report: ScholarTrack

Tested on 20 Nov 2026 against the local production build and https://scholartrack-olive.vercel.app.
Viewports: 375×812 (phone), 768×1024 (tablet), 1280×800 (desktop). First-time visitor (empty storage), returning visitor, admin.

Flows covered: search, region, quick filters, sort, cards, detail panel (partner switch, documents, next steps), shortlist, profile panel and sheet, Get started guide, supervisor search, outreach (add, validate, status, email draft), admin passcode, admin menu, add/edit modal, sign-in and sign-up validation, console and network errors, horizontal overflow, colour contrast (WCAG AA), touch targets, headings and ids, data spot-checks against official sources.

What already passed: no console errors on a clean load; no horizontal scrolling at any width; one `h1` per view; no duplicate ids; all quick-filter counts match results; search, region and empty state work; wrong admin PIN is rejected with a clear message; outreach and supervisor forms validate empty input; sign-in shows plain errors.

Severity: **High** = wrong information or blocks some users. **Medium** = confusing, inconsistent or below a standard. **Low** = polish.

| # | Severity | Area | Finding | Status |
|---|----------|------|---------|--------|
| 1 | High | Data | Stipends in the original 12 programs are wrong. CSC shows $880 (real: RMB 3,000–3,500 ≈ $440–515), KAIST $1,050 (real: KRW 1,000,000 Master's ≈ $740, KRW 300,000 PhD), MEXT $1,100 (¥143,000 ≈ $890), Eiffel $1,650 and "tuition covered" (real: €1,200 Master's / €2,100 PhD, tuition not covered), DAAD EPOS $1,400 (€992 Master's ≈ $1,090 / €1,400 PhD). Savings and eligibility are calculated from these. | Fixed |
| 2 | High | Data | Partner-university notes make unverifiable ranking claims ("Top #1 in Asia", "World #12 in Engineering & AI"). | Fixed |
| 3 | High | Accessibility | Dialogs (detail panel, profile sheet, contact editor, sign-in) don't move focus inside, don't keep Tab inside, and don't return focus when closed. The detail panel doesn't stop the page behind it from scrolling on phones. | Fixed |
| 4 | Medium | UX, phone | On a first visit the Get started guide fills the whole first screen; no scholarship is visible without scrolling. | Fixed |
| 5 | Medium | Layout, tablet | At 768–1023px the header labels wrap onto two lines ("Browse / scholarships"). | Fixed |
| 6 | Medium | Function | Sort "Name A–Z" sorts by university, so "Singapore International Graduate Award" appears first (its host is "A*STAR"). | Fixed |
| 7 | Medium | Function | Sort "Most left over" uses the program average, so ranges like "+$550 to +$1,050" sort below "+$1,250" inconsistently with what the card shows. | Not a bug: re-checked, the sort already uses the best option shown on the card |
| 8 | Medium | Contrast | Filter-chip counts and "(expected)" use light grey text at 2.6:1 (needs 4.5:1). | Fixed |
| 9 | Medium | Touch targets | "Find supervisors" on cards (16px tall) and the footer refresh link are below the 24px minimum. | Fixed |
| 10 | Medium | Keyboard | Card focus is only an underline on the title; hard to see which card is focused. | Fixed |
| 11 | Medium | Visual density | Detail panel: every benefit sits in its own bordered box, monospaced labels ("Frugal (-$300)"), marketing headings ("Full Scholarship Facilities & Perks", "University Overview & Academic Prestige"). Feels busy. | Fixed |
| 12 | Medium | Admin | The add/edit form still uses the old style (indigo blocks, "Flag Emoji" field, jargon) and cannot edit the new deadline and stipend notes. Saving an edit also silently reset "tuition, health, flights covered" to yes (found while testing). | Fixed |
| 13 | Low | Wayfinding | "Admin" sits next to "Sign in" for every visitor and competes with it, especially on phones. | Open |
| 14 | Low | Phone | The footer (data sources, refresh) is hidden on phones. | Open |

Fixes are made one per commit, in the order above, and ticked off here.
