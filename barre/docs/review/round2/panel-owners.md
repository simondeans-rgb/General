# Round 2 panel report: school owners (personas 19–22)

> **These are simulated findings.** The four personas are the same invented composites as in round 1 (`docs/review/panel-owners.md`). They are not real users and this is not real user research. Each point below is marked as one of three things:
> - **Observed:** driven in the preview with Playwright.
> - **Code:** read in the source, not driven.
> - **Opinion:** the persona's judgement.
>
> No competitor product was checked. Any comparison is marked as an assumption.

---

## 1. Method and limitations

**Build and tools**
- The build was the preview at `http://127.0.0.1:8080/General/studio-next/`, driven by headless Chromium through Playwright.
- Each persona run used a fresh browser context. The new-school flows used one persistent profile, so the in-browser database carried over between scripts.
- Scripts are in `/tmp/claude-0/-home-user-General/b4a48a5e-78db-50c3-ae22-e03d809e9579/scratchpad/panel2/owners/`.
- Screenshots are in `docs/review/round2/shots/owners-NN-*.jpg`.

**What was driven**
1. **New school.** As Jordan (platform), I created a school on `/platform` and opened the invitation link signed out, becoming "Sam Okoye", owner of Harbour Lane Dance. I then:
   - set up the school on `/onboarding` using the new "Your first timetable" form;
   - ran all five steps of the migration toolkit (timetable, families, balances, past invoices, invitation links), using CSV files with deliberate problems.
2. **Freya (owner, Northstar).** I visited `/today`, `/reports` (location filter, the under-filled filter, Retention), `/classes`, `/schedule`, `/events` (Summer Show panel), `/studio` (School, Places, Teaching, Money tabs, consent wording, timetable sharing), `/account` (plan, people and access, History, support, Keeping data) and `/safeguarding`. I also:
   - created a class with **New class**;
   - added a third and then a fourth location.
3. **Nadia (admin).** Opened `/people`, as a first step toward checking how medical reads are logged.
4. **Signed out, as a buyer.** Opened `/welcome`. I also looked at the store images in `public/brand/store/`.

**Viewports**
- Desktop 1440×900 throughout.
- Phone 390×844 for `/today` and `/reports`. Neither scrolled sideways (`scrollWidth` 390).

**Limitations**
- **Medical-read logging was not verified.** My script could not open a family record as Nadia, because the rows are not links with the family name. The History filter for "Medical record" showed only "created" rows from the seed. FIXES.md says office reads of medical records are logged; I did not confirm it.
- **Retention could not be demonstrated.** The seed has one term, so `/reports` says: "This is the first term in Swayvo, so there is nothing to compare with yet."
- **Location-limited admin was only partly checked.** I saw the "Every location" control on each staff row but did not sign in as a location-limited admin.
- **Not testable, as in round 1:** real sign-in, email delivery, card and Direct Debit payments.
- **Locale.** Headless Chromium ran in the en-US locale, so date inputs showed `mm/dd/yyyy` and time inputs showed a 12-hour clock. A UK browser would probably show `dd/mm/yyyy` and 24-hour time (unverified).
- **Load times.** The first load of the in-browser database took about 35–67 s per fresh context. That is a property of the demo, not a measure of a hosted product.

---

## 2. What changed since round 1 (verified against these personas' complaints)

| Round-1 complaint (persona) | Status | Evidence |
|---|---|---|
| D1: creating a class fails, "pricing specified more than once" (all) | **Fixed** | Observed. "Boys Breakdance" was created at Northstar with New class: no error, and it appears on Tuesday in `/classes`. The new school's first-timetable form built 4 classes. |
| D2: form error below the fold (19) | **Fixed for the cases seen** | Observed. The plan-limit notice appears inside the dialog, just above the buttons (shot 10). The first-timetable submit stays disabled, with an inline hint ("Say where you teach."). |
| D3: "created with sample data" shown to an empty school (19) | **Fixed** | Observed. The new school's `/onboarding` shows no sample-data copy (shot 02). |
| Setup is a list of links into Settings tabs (19) | **Fixed (big improvement)** | Observed. "Your first timetable" takes place, term, style and every weekly class on one page, with "Copy to…" another day. Four classes took 27 interactions and about 7.5 s, against 32 interactions and a failure in round 1. The term is published straight away and 9 starter skills were added (shots 03, 04). |
| Draft term not explained (19) | **Fixed** | Observed. The form says: "The term is published straight away, so families see its classes." |
| No retention trend or cohort (20) | **Built, not demonstrable** | Code. There is term-on-term "Carried on / Did not come back / New", broken down by class, style or age, plus a "To contact" list of lapsed students with a CSV download (`reports/page.tsx` `Retention`). Observed: it shows only the first-term message in the demo. |
| No under-filled filter or revenue gap (20) | **Fixed** | Observed. The filter offers "Under 50/60/75% full", sorts emptiest first and shows the trend over 4 weeks and "£441.00 in empty places" (shot 18). |
| Drop-in class shown as 0/16 (20) | **Fixed** | Observed. It now reads "Drop-in: booked by the class". |
| No location dimension (21) | **Mostly fixed** | Observed: a location filter on Reports, Classes and Schedule, and a "By location" table on Reports (shot 18). Gaps: money figures say "whole school" when a location is selected; Retention ignores the location (code: `Retention()` takes no `loc`); "Billed, 30 days" shows £0.00 for both sites while Collected shows £2,088. |
| No location-scoped managers (21) | **Partly fixed** | Observed: an "Every location" control on each admin and teacher row (shot 12). Per FIXES.md, a location-limited admin is **read-only**. Not driven. |
| No audit-log screen (21) | **Fixed** | Observed. Account › History: "Who changed or opened what, and when. Only owners see this." It has filters by person, record kind, name and date range, plus a CSV export (shot 11). Weakness: it is flooded with "Swayvo (automatic) created …" rows. |
| Medical reads not logged (21) | **Claimed fixed, not verified** | See limitations. |
| Plan limit shown as "Something went wrong" (21) | **Fixed** | Observed. A calm "LIMIT · Your plan is full here … Nothing is lost" notice with an **Ask to upgrade** button (shot 10). Remaining gaps: Account › Plan still says "To change plan, contact Swayvo", and there is no self-serve upgrade or price. |
| Unmapped columns dropped silently (22) | **Fixed** | Observed. "2 columns will not be imported: 'Balance owed', 'Direct debit mandate'". Import is blocked until "I understand these columns will not be imported" is ticked (shot 06). |
| No timetable, balance or history import (22) | **Fixed** | Observed, all imported successfully: 1. Timetable (2 classes, 24 sessions, new styles and rooms added), 2. Families, 3. Opening balances (£90), 4. History (past invoices; attendance and exam results are also offered). |
| Invitations by hand, one at a time (22) | **Partly fixed** | Observed. Step "5. Invitations" makes a spreadsheet of single-use links, valid for 14 days, "to send from your own email or mailing tool" (shot 08). Swayvo still sends no email (R-003). |
| Direct Debit mandate migration (22) | **Not fixed** | Payments not connected (R-006). |
| Event panel too long; no volunteer rota (20) | **Rota fixed; length not fixed** | Observed. "Helpers · Add helper slot" now exists. The panel is still one long scroll with no tabs (shot 13). |
| Two exam concepts side by side (D8) | **Explained, not merged** | Observed. The copy now says: "An event of kind Exam above is only the date in families' diaries; add the session here to enter children." |
| Phone Today subtitle cut off (D10) | **Fixed in app; regressed in store image** | Observed. The app wraps it to "Current Term, week 7 of 15" (shot 16). The store image `public/brand/store/04-today.png` still shows "Curre". |
| Template named `barre-import-template.csv` (D9) | **Fixed** | Code: `swayvo-<kind>-template.csv`. |
| Studio Pulse cluttering Reports (19, 21) | **Not changed** | Observed. Still at the foot of `/reports`: "Needs 180 days … Swayvo has 49". |

---

## 3. UI review

| # | Screen | Observation (observed unless marked) | Sev. | Shot | Concrete improvement |
|---|---|---|---|---|---|
| U1 | `/welcome` | Three large empty grey boxes with art-direction notes as captions: "Photography: street class mid-routine, low side light, motion blur on the hands only…". A paying owner reads this as an unfinished site. | **High** | 15 | Commission or license three photos before any buyer sees the page. Until then, remove the row or replace it with real product screens. Never ship brief text as captions. |
| U2 | `/welcome` | No price, no plan table, no proof (testimonials, school count, security or GDPR page link). The contact is `hello@swayvo.example`. The "Money" tile promises "failed cards you can retry", which this build cannot do (R-006). | High | 14 | Add a "Plans" section that mirrors `/platform/plans` (Starter, Studio, Academy with limits). Add a "Status of payments" line or a "coming" tag. Add a security and data page link. Use a real domain. |
| U3 | Store images | `04-today.png` still shows the clipped "Curre" subtitle and a "£612.00 outstanding in all · Retry" row that differs from the live app ("£162.00 declined · See invoices"). | Medium | (store) | Regenerate the store images from the current build. Add a check that fails when a store image's source screen changes. |
| U4 | `/studio`, `/account`, `/onboarding` | Two stacked tab bars: Settings (School, Safeguarding, Account, Setup), then School settings (School, Places, Terms, Teaching, Money). **"School" appears twice**, one bar above the other. | Medium | 10 | Rename the inner first tab "Details", or flatten into a single left-hand settings nav (Details, Places, Terms, Teaching, Money, Safeguarding, Account, Setup). |
| U5 | `/account` | One page about 7,400 px tall at desktop, holding Brand, Photos, Plan, People with access, History, Support, Keeping data and Your data. History alone lists 50 seed rows before "Show more". | Medium | 11, 12 | Split Account into tabs (Brand · Plan · People · History · Data). In History, hide "Swayvo (automatic)" rows by default and group imports as one row ("Import: 3 children, 2 families"). |
| U6 | `/onboarding` first timetable | In each class row, Day is cut off ("Wednes", "Saturda") and the time input shows "05:00" with AM/PM cut off (12-hour locale), so 17:00 could be misread as 05:00. The form uses about 670 px of a 1440 px screen. | Medium | 03 | Widen the row (the form can use 960 px+), give Day a minimum width of 7.5rem, and force 24-hour display or show "17:00 (5 pm)" next to the time. |
| U7 | `/schedule` (new school) | With a term starting in January the page shows "No classes this week… The term hasn't started yet", with no way to see the classes just created. | Medium | — | Add a "Go to first week of Spring 2027" button to this empty state. |
| U8 | `/reports` with a location selected | Outstanding and Collected switch to "whole school" labels. "By location" shows "Billed, 30 days £0.00" for both sites next to £2,088 collected. Retention does not filter by location. | Medium | 18 | Allocate invoice lines to class locations so money filters too. Show "Collected, 30 days" in By location rather than "Billed". Pass `loc` to Retention. |
| U9 | Plan limit | The limit appears only after the owner has typed the new location and pressed Save. Save stays enabled, and the footer repeats "See above to ask for a larger plan". Account › Plan still says "To change plan, contact Swayvo". | Low–Med | 10 | Show "3 of 3 locations used · Ask to upgrade" on the Add button before the form opens. Put the same button in Account › Plan. Drop the duplicate footer line. |
| U10 | Sticky header (all) | The 85%-opaque blurred header lets large headings show through as ghost text (visible in shots 03, 11 and 12). It looks smudged in a sales demo. | Low | 11 | Use a solid `bg-surface` for the header, or raise the opacity to 97%. |
| U11 | Import wizard | Plurals are not handled: "1 opening-balance invoices", "Import 1 families", "1 past invoices", "All 1 rows are fine", "1 medical notes". "About 2 families." is odd. After import, the summary still says "New dance styles **will be** added". On a fresh school it opens on "Import families" although step 1 is Timetable. | Low | 06, 08 | Use a `plural()` helper. Use past tense after import. On a school with no classes, open on step 1. |
| U12 | Import: unmapped columns | The warning names "Balance owed" but does not point to the Balances step. | Low | 06 | When a column matches /balance|owed|credit/, add "Import balances in step 3" with a link that carries the file over. |
| U13 | `/events` panel | Still one long side panel: invite chips for all 13 classes, then dancers, running order, costumes, rehearsals, tickets, helpers, chaperones. The title is cut off ("Summer Show — Greenwich Th…"). | Medium (for 20) | 13 | Turn the panel into a full page with tabs (Dancers · Running order · Costumes · Rehearsals · Tickets · Helpers), and let the title wrap. |
| U14 | `/today` desktop | The big "09:15" hero leaves about 180 px of dead space under the class card. "Saturday Ballet Grade 1" wraps with "1" alone on a line. | Low | — | Let the class name use the full hero width, or reduce the type size one step at lg. Tighten the gap to the class list. |
| U15 | `/reports` | Studio Pulse still sits at the foot of every Reports view, showing "Not enough data" for six months. | Low | 18 | Hide it until 180 days of history exist, or include imported attendance history in that count. |
| U16 | `/safeguarding` | The Watch and Legal hold pickers are plain `<select>` lists of every child (about 64 here; hundreds for persona 21). | Low | — | Use the type-ahead person picker used elsewhere. |

**What works well (observed)**
- `/today` on phone and desktop: a clear order of next class, then needs attention, then money.
- Form copy throughout is plain and accurate, for example: "Nothing is lost: you can add more once the plan is larger."
- Every route checked on phone had no sideways scroll.
- Consent wording can be edited per kind ("Only the words change").
- Timetable sharing for teachers at other schools is explained in one sentence, with three choices.

---

## 4. Feature and function ideas

| Feature | Problem solved | Who | Rating | Size / area | Risks |
|---|---|---|---|---|---|
| **Swayvo sends invitations and tracks them** (sent, opened, accepted, resend) | Persona 22 must still paste 200 links into her own mail tool | 19, 22 | Essential | M · R-003, `import-wizard.tsx` BulkInvites, outbox | Sending to families mid-migration. Needs a scheduled send and a test batch. |
| **Card and Direct Debit payments, with a mandate-migration path** | No collection, so switching is impossible for 22 | all | Essential | XL · R-006, billing | Regulatory and provider dependency. Assumption: providers support bulk mandate transfer; unverified. |
| **Retention from imported history** | A switcher gets no retention figure for a full term | 20, 22 | Highly desirable | S · `0027_import`/history tables → `RETENTION_SUMMARY` | Imported data quality. Label figures "from imported records". |
| **Self-serve plan change** (see prices, upgrade, pro-rata) | "Ask to upgrade" is still a request queue | 21 | Highly desirable | M · `/account` Plan, `/platform/plans`, Stripe Billing | Billing disputes. Needs a confirmation step. |
| **Location money: revenue, outstanding and collected per site** | Per-site P&L | 21 | Highly desirable | M · `reports.ts`, invoice item → class link | Allocating family-level discounts across sites. |
| **Location-limited admins who can act**, not just read | A site manager who can only read is no manager | 21 | Highly desirable | M · RLS by `location_id` on write policies | RLS complexity; test every write path. |
| **Migration readiness checklist and "go-live day" mode** (parallel-run dates, what's left, test invites to staff first) | Persona 22's fear of a broken switch | 22 | Useful | S · `/onboarding`, import wizard | None significant. |
| **Multi-school owner view** (deferred UR-59) | Owners of separate legal entities | 21 | Useful | L · school switcher, cross-school reports | Data isolation across schools. |
| **Event as a page with tabs, plus a licence and hours tracker** for child performers | The show panel does not scale; chaperone licensing is a single tick | 20 | Useful | M · `/events` | Legal accuracy of licensing rules. Needs specialist input. |
| **History digest**: weekly "who opened what" summary, and alerts for unusual access (for example, 30 medical records opened in an hour) | An audit trail nobody reads | 21 | Nice to have | S · `audit_log`, scheduled job | Notification fatigue. Weekly by default. |

---

## 5. Branding feedback

**Name ("Swayvo")**
- Persona 19 and 20 (opinion): short, energetic and easy to say on the phone.
- Persona 22: it doesn't say "dance school software" on its own. She relies on the strapline.
- Persona 21: neutral. Fine for a B2B tool, provided the school's own name leads, which it does.

**Mark and wordmark**
- The bar-graph "count" mark (the "Beats" bars) is reused for capacity and progress throughout the app (observed).
- It is coherent, and it makes the brand feel like a system, not a logo stuck on.
- At sidebar size ("powered by swayvo") it is small and quiet, which owners want (observed). Their families see *their* school first.

**Colour and type**
- `/welcome` is Count blue with peach and a wide display face ("Five, six, seven, eight."). Confident and recognisable.
- Inside the app, Northstar's own midnight navy takes over, and the layering works as promised (observed in shots 14 and 16).
- The wide display face for big numbers (09:15, £612.00) reads well. Overused for section eyebrows like "LIMIT" inside a small dialog (shot 10), it shouts.

**Voice**
- Plain, honest and specific. Examples: "Nothing is lost…", "Card payments start once Stripe is connected", "check every period with your data protection adviser".
- Persona 22 trusts this more than polish.
- Small grammar slips (plurals, U11) undercut it.

**School branding layering**
- Strong: Classic and Urban styles, colour pairings, logo, hero photo, light logo, and a live parent-app preview in Account › Your brand (observed).
- Persona 19 sees it as the single most "this is mine" feature.

**`/welcome` as a buyer**
- **Not yet commercially credible.**
- The hero and the live register are excellent, and "How it starts" (we set you up on one call; we bring your families across; you invite them) speaks directly to persona 22.
- Against that:
  - empty photo boxes with brief captions (U1);
  - no pricing (U2);
  - no proof (U2);
  - a `.example` email (U2);
  - capability claims ahead of the build (U2).
- A paying owner would pause at the photo row.

**Store images**
- Good composition, same blue and peach, and the strapline "Your school's day, on the count." is good.
- Stale content (U3) is the one issue.

**Consistency**
- Strong across in-app screens.
- The marketing mock-ups (welcome Today on "Thursday 26 November", "£612 · Retry") drift from the live app.

---

## 6. Individual panel member reports

### Persona 19: small independent owner (simulated)
*One room, about 70 pupils, 9 classes, mild dyslexia, Sunday-night admin.*

**What's better.** I typed my whole week onto one page and pressed one button: "Done · 4 added". Last time I couldn't make a single class. The "Copy to Saturday" trick saved me retyping. Nothing says my empty school has sample data any more.

**Still frustrating.**
- The day box cut "Wednesday" to "Wednes", and my 5 o'clock class showed as "05:00". I nearly thought it had saved as five in the morning.
- After setup, the Timetable said "No classes this week" because my term starts in January, and nothing took me to January.
- There are two rows of tabs that both start with "School".

**Top 5 UI improvements**
1. Wider class rows with a 24-hour time.
2. A "Go to first week" button on the empty Timetable.
3. One settings menu, not two tab bars.
4. Hide Studio Pulse until it has a score.
5. Fix "1 families" style grammar.

**Top 3 feature requests**
1. Card and Direct Debit payments (Essential).
2. Swayvo emails the invitations for me (Essential).
3. Tell me before the form that I'm at my plan limit (Useful).

**Branding.** I love that families see my logo and colours first. The marketing page's empty photo boxes looked unfinished. I'd want to see a price before booking a demo.

**Scores:** Relevance 9 · Quality 7 · Completeness 6 · Ease of use 8 · Efficiency 7 · Usefulness 7 · Adoption 6 · Continued use 7 · Visual design 8 · Brand appeal 7.
**Overall: 7/10 (round 1: 4/10).** Setup now works and is quicker than my spreadsheet. Money collection is still the blocker.

### Persona 20: growing owner (simulated)
*260 students, 28 classes, two halls, annual show.*

**What's better.**
- "Under 60% full" shows exactly what I asked for: emptiest first, "up 2 in 4 weeks", "£441.00 in empty places".
- The drop-in class no longer pretends to be empty.
- Helpers are on the show at last.
- Retention by class, style and age, with a "To contact" list, is what I'd steer by. I just couldn't see it in the demo.

**Still frustrating.**
- The show is still one endless side panel, with all 13 class chips at the top.
- The title is cut off.
- There is no performance-licence tracking beyond a "DBS or licence seen" tick.

**Top 5 UI improvements**
1. Event as a full page with tabs.
2. Retention visible from imported history.
3. Hide Studio Pulse until meaningful.
4. "Collected" rather than "Billed" in By location.
5. Event titles that wrap.

**Top 3 feature requests**
1. Retention from imported history (Highly desirable).
2. Licence and hours tracker for child performers (Useful).
3. Ticket card payments (Useful).

**Branding.** "Five, six, seven, eight" is the right tone for dance people. I'd show it to my teachers. The store images are tidy, but the Today one is out of date.

**Scores:** Relevance 9 · Quality 8 · Completeness 7 · Ease of use 7 · Efficiency 8 · Usefulness 8 · Adoption 7 · Continued use 8 · Visual design 8 · Brand appeal 8.
**Overall: 7/10 (round 1: 6/10).** Capacity and show tooling are now genuinely useful. Events need a layout rethink for big shows.

### Persona 21: multi-location owner (simulated)
*Four studios, about 900 students, 22 staff, inspection-minded.*

**What's better.**
- Reports has a Location selector and a "By location" table.
- Classes and Schedule filter by site.
- History is a proper audit screen with person, record, name and date filters and CSV export.
- The fourth-studio refusal is now a calm "Your plan is full here" with **Ask to upgrade**.
- Staff rows have an "Every location" scope.

**Still frustrating.**
- Pick Blackheath and the money still says "whole school". "Billed, 30 days" is £0.00 at both sites while £2,088 was collected. Retention ignores the location.
- A location-limited admin can only read (per FIXES). I can't make a site manager.
- History is buried 5,000 px down a single Account page, flooded with "Swayvo (automatic) created …".
- I couldn't confirm from the screen that a medical-record *view* is logged.
- Plan still says "contact Swayvo", with no price to compare.

**Top 5 UI improvements**
1. Money per location.
2. History on its own tab, with automatic rows hidden by default.
3. Account split into tabs.
4. Plan usage and upgrade on the Add button.
5. Type-ahead pickers on Safeguarding.

**Top 3 feature requests**
1. Location-limited admins who can act (Highly desirable).
2. Self-serve plan change with prices (Highly desirable).
3. Multi-school consolidated view (Useful).

**Branding.** Owner-first branding with Swayvo underneath is right for a group like mine. The marketing site lacks the security and data-protection page and the references a group buyer needs. The placeholders would stop me forwarding it to my business partner.

**Scores:** Relevance 8 · Quality 7 · Completeness 6 · Ease of use 7 · Efficiency 6 · Usefulness 7 · Adoption 5 · Continued use 7 · Visual design 7 · Brand appeal 6.
**Overall: 6/10 (round 1: 4/10).** The foundations I asked for exist now. Per-site money and real site managers are what's left before a four-site group can commit.

### Persona 22: owner considering switching (simulated)
*300 students, 11 years, burned by a previous migration.*

**What's better.**
- There is a five-step "Moving from another system" path: 1. Timetable, 2. Families, 3. Balances, 4. History, 5. Invitations.
- My "Balance owed" and "Direct debit mandate" columns were flagged, and the import was blocked until I ticked "I understand these columns will not be imported".
- Opening balances came in labelled "Opening balance as at …".
- Past invoices are kept as history and kept out of billing runs.
- Every link works once and lasts 14 days.
- The marketing page's "We set you up… on one call" is exactly what I want to hear.

**Still frustrating.**
- I still have to send 300 invitation emails myself from a spreadsheet.
- Direct Debit mandates can't move, because payments aren't connected.
- The balance warning doesn't send me to the Balances step.
- The counts in the summaries don't read well ("1 families"), and I notice that kind of thing.
- Retention won't show until my second term in Swayvo, even though I imported attendance.

**Top 5 UI improvements**
1. Link the unmapped Balance column to step 3.
2. Open the import on step 1 for an empty school.
3. Fix plurals and tense in import summaries.
4. A migration checklist with go-live date.
5. Show imported invoices on the parent's payments page (gap noted in FIXES).

**Top 3 feature requests**
1. Swayvo-sent, tracked invitations (Essential).
2. Payments plus a mandate-migration path (Essential).
3. Retention from imported history (Highly desirable).

**Branding.** The voice is honest. It tells me what isn't connected, which I trust. The photo placeholders and the `.example` address make the company look not quite ready.

**Scores:** Relevance 8 · Quality 7 · Completeness 6 · Ease of use 7 · Efficiency 6 · Usefulness 7 · Adoption 4 · Continued use 7 · Visual design 7 · Brand appeal 6.
**Overall: 5/10 (round 1: 3/10).** The data migration is now careful and complete enough. The money migration is still the reason I'd wait.

---

## 7. Votes (machine-readable)

| Persona | Top UI improvements (1–3) | Top new features (rating) | Remove / simplify | Greatest impact |
|---|---|---|---|---|
| 19 | first-timetable-row-width-24h; empty-schedule-go-to-term; single-settings-nav | card-dd-payments (Essential); swayvo-sent-invites (Essential); limit-before-form (Useful) | studio-pulse-until-data | card-dd-payments |
| 20 | event-page-tabs; retention-from-import; hide-studio-pulse | retention-from-import (Highly desirable); performer-licence-tracker (Useful); ticket-card-payments (Useful) | event-side-panel | event-page-tabs |
| 21 | money-per-location; history-own-tab-filter-automatic; account-tabs | location-admins-can-act (Highly desirable); self-serve-plan-change (Highly desirable); multi-school-view (Useful) | duplicate-settings-tab-bars | money-per-location |
| 22 | unmapped-balance-to-step3; import-opens-step1; import-plurals-tense | swayvo-sent-invites (Essential); payments-mandate-migration (Essential); retention-from-import (Highly desirable) | separate-onboarding-vs-import-paths | swayvo-sent-invites |
| Group (branding) | welcome-real-photos; welcome-pricing-proof; refresh-store-images | — | welcome-photo-placeholders | welcome-real-photos |

---

## 8. Group summary

**Consensus**
- Round 1's blockers for owners are gone: class creation, setup, silent column loss, the error-styled plan limit, the audit screen and the under-filled view.
- The first-timetable page and the five-step migration toolkit are the standout improvements.
- What remains is outside the UI: payments (R-006) and Swayvo-sent email (R-003). After those, location money and scoped managers for persona 21.
- **Commercial credibility.** The in-app UI now looks like a paid product. The public face does not yet:
  - `/welcome` has empty photo placeholders with brief captions;
  - no pricing or proof;
  - a `.example` contact;
  - store images out of date.

  This is the cheapest high-impact fix in this report.

**Disagreements (kept)**
- **Account page.** Persona 19 wants fewer settings surfaces. Persona 21 wants *more* depth (per-site P&L, acting site managers), with the Account page split up rather than trimmed.
- **Events panel.** Persona 20 wants it as a full page with tabs. Persona 19 would rather it stayed out of her way entirely.
- **Brand appeal.** Persona 22 rates the honest voice above visual polish. Persona 21 says unfinished marketing would stop a group purchase.

**Group scores (simulated)**

| | Round 1 | Round 2 |
|---|---|---|
| Overall satisfaction (mean) | 4.25 | **6.25** |
| Adoption likelihood (mean) | 3.5 | **5.5** |
| Continued use (mean) | 5.75 | **7.25** |
| Visual design / UI (new) | — | 7.5 |
| Brand appeal (new) | — | 6.75 |

**Screenshots** (`docs/review/round2/shots/`)

| Shot | Shows |
|---|---|
| owners-01 | Platform invitation |
| owners-02 | New-school onboarding |
| owners-03, 04 | First timetable |
| owners-06 | Unmapped-column warning |
| owners-08 | Invitation links |
| owners-10 | Plan limit notice |
| owners-11 | History |
| owners-12 | People and access |
| owners-13 | Event panel |
| owners-14, 15 | `/welcome` hero and photo placeholders |
| owners-16 | Phone Today |
| owners-18 | Reports by location and under-filled |
