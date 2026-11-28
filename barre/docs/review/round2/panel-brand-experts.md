# Round 2 panel: brand and design experts

**Group slug:** `brand-experts` · **Date:** 28 November 2026 · **Build reviewed:** preview at `/General/studio-next/`, branch head `0f2b6eb`.

**Who this panel is (simulated).** The panel speaks as the team that created the Swayvo identity and design system on 26 November (`docs/brand/*`). Its six members are simulated professional perspectives, not real people:

| # | Persona (simulated) | Lens |
|---|---|---|
| E1 | Creative director and brand strategist | Promise, positioning, marketing, store |
| E2 | Identity and type designer | Wordmark, mark, icons, favicon |
| E3 | UI and visual designer | Screens, hierarchy, density, craft |
| E4 | Design-systems lead | Tokens, components, drift, `/design` |
| E5 | Motion and interaction designer | States, feedback, controls, transitions |
| E6 | UX writer and content designer | Voice, labels, notices, consistency |

**Conflict of interest.** We are marking our own work. To guard against that, we have scored the brand/design scorecard lower where the evidence says so, and we name our own earlier misses.

Labels used below:
- **Observed:** seen in a screenshot or in the code.
- **Opinion:** professional judgement.
- **Unverified:** inferred but not confirmed.

---

## 1. Method and limitations

**Screens.** We drove the live preview with Playwright and Chromium:
- **Viewports:** phone 390×844 (touch), desktop 1440×900, and phone with root text at 200%.
- **Roles:** owner (Freya), teacher (Marcus), teacher in the dark Urban style at Kestrel (Priya), guardian (Hannah), student (Amir), and the public `/`, `/welcome`, `/join` and `/design`.
- **Screenshots:** 20 kept, in `docs/review/round2/shots/brand-experts-NN-*.jpg`.
- **Scripts:** `scratchpad/panel2/brand-experts/`.

**Code audit.**
- We compared `src/` at the brand hand-off commit (`03b56ff`, 26 Nov, the marketing and store images) with HEAD.
- We counted pattern use: `Card`, `border border-line`, `variant="primary"`, `Notice`/`Word` vocabulary, hand-rolled tabs, hard-coded colours and type sizes.
- We read the new components: `child-details-sheet`, `teacher-week`, `cross-school-agenda`, `billing-split`, `consents`, `media-children`, `location-filter`, `absence-credit`, and `RetentionCard` in `safeguarding.tsx`.

**Assets.** We rendered `public/brand/*.svg`, the icons and the five store images plus `og.png` side by side (shots 17 and 18). We measured the wordmark geometry in `src/lib/swayvo-logo.ts`.

**Limitations.**
- Only emulated devices were used: no real iOS or Android, no screen reader.
- We did not open every one of the ~30 sheets. The billing credit/split UI was seen inside the family record only. Bank-statement and import flows were not opened.
- The cross-school agenda took more than 30 seconds to load in a shared, busy preview. Our first capture showed only skeletons; the retake (shot 14) is loaded.
- 200% text was simulated by setting the root font size, not by the OS text-size setting.
- Full-page captures show the fixed sidebar and bottom bar mid-page. That is an artefact of the capture, not a bug.
- **No round-1 scores exist for this group.** Round 1 used end-user panels only. Our baseline is our own `FINAL-ASSESSMENT.md` (84.6/100) and the five items it said were "still needed".

---

## 2. What changed since round 1

The brand hand-off (26 Nov) listed open weaknesses. The round-1 user panels also raised a few brand and UI points. Status now:

| Earlier issue (source) | Status | Evidence |
|---|---|---|
| "Some secondary sheets still dense" (FINAL-ASSESSMENT, visual) | **Regressed** | Settings → Account is now a 7,394 px page: brand, photos, plan, people, ~50 rows of audit history, support, 13 retention fields, export (shot 03). School settings has two stacked tab rows, "School" inside "School" (shot 06). |
| Photography for sign-in, parent home and marketing (FINAL-ASSESSMENT §5.3) | **Not fixed, and now publicly visible** | `/welcome` "For every style" shows three empty grey boxes captioned with the art direction ("Photography: street class mid-routine, low side light…"). |
| Type-designer pass on the wordmark, "yv" spacing and stroke joins (§5.4) | **Not fixed** | `swayvo-logo.ts` is unchanged since 26 Nov. Measured gaps and the `o` seam: see §5, shot 18. |
| Text does not scale (round-1 students D4, UR-30) | **Partly fixed** | Everything is in rem now (0 px sizes left, from 130). At 200%, the parent header stacks the title, bell and avatar on three lines, and the tab labels truncate to "Sch… Mes… Pay…" (shot 20). |
| Sheets do not trap focus (UR-31) | **Fixed** (code; not tested with assistive technology) | Global `focus-manager.tsx`. |
| Design system: shared helpers in `components/ui` (§4) | **Regressed in places** | See the drift audit below. |
| Motion: "no page or sheet transitions" | **Unchanged** | It was deliberate. New screens add no motion, and the success "count to eight" is still only on the register. |
| Store images and marketing from one system | **Stale** | Store images are dated "Tuesday 1 December" and predate round-2 features. All five share one composition (shot 17). |

**Drift audit, brand hand-off → HEAD (observed counts in `src/**/*.tsx`).**

| Signal | 26 Nov | Now | Reading |
|---|---|---|---|
| `variant="primary"` | 72 | 88 | Mostly one per view. New screens that hold two are listed in §3. |
| `border border-line` (hand-drawn boxes) | 74 | 92 | +18, spread across new components: absence report, first timetable, payment reminders, media, role scope, support needs. |
| `<Card>` (incl. aliases) | 25 | 35 | Most "Cards" are actually `SettingsSection as Card`: a rule section with a misleading name. One real boxed card was added: "Students' own logins" in `family-care.tsx` (shot 06). |
| Distinct Notice/Word words | 30 | 47 | The system defined 7. It now includes "Done", "Saved", "Sent", "Downloaded", "Nothing new", "Fix first", "Everyone", "Read only". |
| Hand-rolled tab sets (`role="tab"` outside `ui`) | — | 8 files | Billing, Studio, Account, Platform, family messages, learn library, learn feedback, enrolment. Three visual styles: underline, filled black pill, filled blue selected. |
| Hard-coded colours | — | 1 real case | The printable programme (`show-tools.tsx:149`) uses Georgia serif and the *old Sanaa palette* (`#14211e`, `#e4dbcc`). There is no school name or logo on it. |
| Off-scale type sizes | ~45% | ~45% | Not new. The scale (12·13·15·17·20·26…) was never enforced; 14, 12.5, 13.5 and 14.5 px dominate. There are 5 uses of 10 px in the brand preview. |
| `/design` and `DESIGN-SYSTEM.md` | 26 Nov | unchanged | Neither documents the new patterns: choice toggles, location filter, detail panel, week grid, upload, retention fields. |

---

## 3. UI review, screen by screen

Severity: **H** high · **M** medium · **L** low.

| # | Screen / route | Observation (observed unless marked) | Sev | Shot | Concrete improvement |
|---|---|---|---|---|---|
| U1 | Settings → Account `/account` | 7,394 px. Nine unrelated jobs on one page. The audit history shows ~50 "Swayvo (automatic) created…" seed rows before "Show more". Retention adds 13 numeric fields. "Check with your data protection adviser" is repeated 8 times. | H | 03, 05 | Split into four settings pages in the left settings tab row: **Brand**, **People and access**, **Data and privacy** (support access, keeping data, export), **History**. History defaults to "changes by people" and hides automatic imports. Say the adviser line once, as section meta. |
| U2 | School settings `/studio` | Two tab rows ("School · Safeguarding · Account · Setup", then "School · Places · Terms · Teaching · Money"). "Students' own logins" is the only boxed card, and its input touches the card edge (no body padding). The "Save" for waiting lists floats beside the hint. | M | 06 | Flatten to one settings nav: a left list on desktop, one tab row on phone. Replace the boxed card with `SettingsSection`. One "Save" pattern per section: right-aligned under the fields, or autosave with a "Saved" word. |
| U3 | Parent Payments `/family/payments` | A £0.00 hero in 64 px display type. **EXPECTED** in uppercase on all five rows. Child names in uppercase micro-labels (AMIR / CLARA / NIA). | M | 08 | Big numbers only where a decision hangs. When nothing is due, lead with "Paid. Nothing is due." in body type and make **Total coming up £707.00** the figure. Drop the per-row Word: put one "Expected — estimates" line in the section head. Child names as sentence-case sub-heads. |
| U4 | Update details sheet (parent) | Good structure: label above, hint below, one primary "Save details". But the consent toggle shows the selected "Don't allow" as a filled blue button, which reads as a second primary. Consents "apply straight away" while the rest needs Save, so two save models share one sheet. The "Consent" label sits in a left column, unlike every other field. | M | 07 | Use a shared `Choice` (segmented) component: selected = ink outline + check + bold, never accent fill. Move consents to their own sheet ("Photos and filming") from the child row, or make the whole sheet save-on-Save with a note. Labels above, as elsewhere. |
| U5 | Teacher Week grid, phone `/teach` | A rooms × days grid at 390 px shows Mon and part of Tue, mostly empty cells, and "Swipe sideways…". The "This week" button is a grey filled box unlike any other button. | M | 10 | On phone, render the week as a day-grouped list: the same component as "All my schools" (shot 14), which already works. Keep the grid for tablet and desktop. "This week" should be a `ghost` button, disabled with no fill. |
| U6 | Teacher Week grid, desktop | Mon–Fri only. Today (Saturday) is not in view and is not marked. Rooms down the side for a teacher with 2 classes wastes 80% of the grid. | L | 12 | For teachers, use days as columns and time as rows (their question is "when", not "where"). Always include today and mark it with the accent beat, as the office grid does. |
| U7 | Cross-school agenda (Urban) | Clear. Day sections with a rule, times in display type, **CLASH** set as a Word, "Busy" rows. The school mark appears twice (header and switcher). The switcher is a native `<select>` with an OS arrow on the dark ground. | L | 13, 14 | Drop the header mark when the switcher shows it. Style the switcher as the shared `Select`. Make the CLASH line name the pair ("Clashes with Junior Tap at Northstar, 16:30"). |
| U8 | Media upload sheet | Good: two quiet tabs (file / link), label-above fields, a dashed demo hint. The native "Choose File" control is unstyled. "Stored in this browser, up to 20 MB" is demo plumbing showing in product copy. | M | 11 | Use a drop-zone `FileField` (ink outline, icon, "Choose a video, music or document"). Move storage detail into the demo banner. Show the consent consequence inline once a child is tagged (media-children already computes it). |
| U9 | Owner Billing `/billing` | Three tab styles on one screen: Billing/Reports underline, "Needs action" filled black pill, and the location filter as a bold label + select. "Remind overdue" is in the section head beside the filter. | M | 02 | One `ViewTabs` for Billing/Reports and one `FilterTabs` for status (underline + count). Location as a `Select` with the label inside the control ("All locations ▾"), the same everywhere (Classes, Schedule, Billing). |
| U10 | Family record (office) + split billing | "Invoices go to the whole family" / "Change who pays" is a bare text button with no affordance. Record payment is secondary and Add credit is ghost in the same row. Detail panel: OK. | L | 04 | Make "Who pays" a row (label · value · Change link) like the other definition rows. Make the two money actions the same weight. |
| U11 | Parent home `/family` | Still the strongest screen: Notices first, each child's week aligned. But day names have no dates ("Thursday 18:30" on a Saturday: this or next week?). Clara's Monday **CANCELLED** shows only inline, not as a top Notice. | M | 20 (and §5) | Use "Thu 3 Dec" whenever the day is not this week. A cancellation within 7 days always appears in Notices, above NEW. |
| U12 | Teacher Today `/teach` | Hero intact. In "Next two weeks", dates mix three formats ("Tuesday", "8 Dec", "10 Dec"). The hero says "11 booked" while rows say "11 expected" for the same idea. | L | 09, 13 | One date rule: weekday this week, "Tue 8 Dec" beyond. One word: "booked". |
| U13 | Student home `/learn` | Promise shows: "2 milestones reached. 6 more to a full count." But the practice block leads with a big "0 min this week". A "Photos and filming" legal block sits on a 15-year-old's home screen. | L | 15 | Big number only after the first log. Move consents to "You" or Settings, with a one-line summary on home only when something changed. |
| U14 | 200% text, parent phone | The header stacks into three rows (mark / title / bell + avatar). Bottom-tab labels truncate. Content itself reflows well. | M | 20 | At large text sizes, hide the school mark in the header, put bell and avatar on the title row at icon size, and switch the tab bar to icons with labels on long-press, or a two-line label at a smaller fixed size with `aria-label`s. |
| U15 | Printable programme (events) | Georgia serif, Sanaa-era colours, no school name or logo, no Swayvo sign-off. It is the most public printed artefact a school makes. | M | code `show-tools.tsx:149` | Rebuild as a branded print stylesheet: the school's logo and colour, Archivo running order, Inter details, "powered by swayvo" in the footer. See feature F2. |
| U16 | `/welcome` | The hero is excellent: interactive register, peach CTA, the count. The empty photo boxes undercut it. "The part nobody else does" is an absolute competitor claim. | H | 16 | Replace the boxes with real, consented photography, or remove the section until you have it. Never ship the art-direction captions. Soften to "the part most school software leaves out" unless legally checked. |
| U17 | Empty and loading states | Agenda skeletons can sit for 30 s+ with no words (shot 14, first capture). EmptyStates elsewhere follow the pattern (64 uses). | L | — | After 3 s, add "Fetching your classes from each school…" under skeletons. |

**One blue thing per screen (spot check).**
- Held on Today, the parent home, Payments, Billing (New invoice) and the media sheet.
- Broken by the selected states: the consent toggle (shot 07) and the `/design` Classic/Urban toggle (shot 19). Neither is a primary action, but both are styled like one.

---

## 4. Feature ideas (brand and experience)

| # | Feature | Problem it solves | Who | Rating | Size / code area | Risk |
|---|---|---|---|---|---|---|
| F1 | **School-branded parent app**: home-screen icon, splash and name from the school's logo and colour | The PWA manifest already swaps the name and theme colour, but the icon is always the Swayvo bars (`pwa.tsx:44`). Parents see "Northstar" under a Swayvo icon. | Owners, parents | Highly desirable | M: `pwa.tsx`, a canvas/SVG icon generator from `brand.ts`, `school-hero.tsx` | Low-contrast school logos; keep a fitted backplate. App-store builds (if ever) need per-school binaries; stay PWA. |
| F2 | **Printable and shareable show programme**: branded PDF/print with running order, consent-safe names, sponsor and QR | It turns the off-brand print (U15) into a marketing moment for the school. | Owners, parents | Highly desirable | S–M: `show-tools.tsx`, a new print stylesheet | Consent: already counts unnamed dancers. Keep that rule. |
| F3 | **Onboarding polish: "Your school in 10 minutes"**. Logo → colour (with live fit preview) → first class → invite one family, with the count filling as each step completes | `/onboarding` and the guided first timetable exist; brand setup is buried in Account (U1). | New owners | Highly desirable | M: `onboarding`, `brand-settings.tsx`, `first-timetable.tsx` | Low |
| F4 | **Branded email and notice templates** (ready for UR-14): school name first, plain text, Notice word as subject prefix ("MOVED: Grade 2 Ballet…") | When delivery arrives, messages would otherwise ship unbranded. | Parents, office | Essential (when R-003 decided) | M: outbox renderer, templates | Notification fatigue; one digest option |
| F5 | **Term-end progress card**: a shareable, school-branded card per student ("A full count: 8 skills secure") for families, print or download | Makes the brand promise visible at home and on the fridge. It is the differentiator. | Students, parents | Useful | M: `progress.tsx`, image render | Child images: name only, no photo unless consented. Never public by default. |
| F6 | **Photography kit and consent-aware gallery**: a shot list + consent filter for schools to supply real images to `/join` and the parent home | Fills the biggest brand gap (no photography) with each school's own images. | Owners | Useful | M: `brand-settings`, `media-children` | Safeguarding: consent filter must be the database rule, not UI |
| F7 | **Design-system lint**: a CI check for off-scale type, hand-rolled tabs, new hex colours and second primaries per file | Stops drift as more engineers ship features. | Engineering | Highly desirable | S: ESLint rule + `scripts/` | False positives; allow-list |
| F8 | **"What's new" notice for families** after a school changes its brand or style | Families otherwise see a sudden reskin. | Parents | Nice to have | XS | Low |

---

## 5. Branding feedback

**Name: Swayvo.**
- **Keep.** Opinion: it has worn well across 60 features.
- It reads well in system copy: "powered by swayvo", "Swayvo support", "Swayvo (automatic)".
- The "-vo playful" risk we flagged in `NAMING.md` is carried by the serious product. Owners see a credible billing ledger and a safeguarding log, not a toy.
- Trademark clearance is still outstanding (GUIDELINES §9). That is a launch blocker, not a design question.

**Mark (the eight-count).** Keep it. Observed at 16, 32, 60, 96 px and in the maskable circle (shot 18):
- The four-beat favicon form reads clearly.
- The gap between the two groups holds at every size.
- The peach downbeat on blue is distinctive in a browser tab.
- One refinement: on the 180 px apple-touch icon, bars 2–4 and 6–8 come close to merging. Widen the inter-bar gap from 2 to 3 units at icon sizes (`swayvo-logo.ts`, an icon-specific bar spacing).

**Wordmark: refine (E2).** Measured from `WORD_PATHS` with a 14-unit stroke. Gap between stroke edges at x-height:

| Pair | Gap (units) |
|---|---|
| s–w | 6 |
| w–a | 6 |
| a–y | 4 |
| **y–v** | **1** |
| v–o | 5 |

- **y–v is visibly the tightest pair.** At the top the strokes nearly touch, and a large white wedge opens below. That makes the "yv" read as one unit at small sizes and as a gap at large sizes.
- **The `o` (and `a` bowl) has a seam.** The arc starts and ends at 3 o'clock (`M49 28A21 21 0 1 1 49 27.9`), which leaves a hairline notch, visible at 1,100 px (shot 18).

Fixes:
1. Move `v` and `o` right by about 4 units, so y–v is about 5 at the top, and optically match the a–y pair.
2. Draw `o` as two semicircle arcs (or a `circle` with a stroke) to remove the seam.
3. Then regenerate the assets (`scripts/brand-assets.mts`).

This is a half-day job and should happen before any store submission.

**Colour.**
- Count blue as "the now" still works.
- School colours layer correctly. Kestrel's lime accent with dark text on Urban is legible and feels like *their* school (shot 13).
- Drift is in *selected states* using accent fill (U4) and in amber used at display size for "Overdue £612.00" (shot 02). The amber is acceptable with the word beside it.
- Peach stays a marketing-only colour in product. Good.

**Type.**
- Archivo for times and money is the strongest part of the identity. It is consistent on every new screen we saw (agenda, week grid, retention fields excepted).
- Inter body is fine.
- The scale is not enforced (§2). Recommendation: map the 14/14.5/13.5 px sizes to 13 or 15 and add F7.

**Voice (E6).**
- Still plain, specific and blame-free.
- We found no "Oops" and no exclamation marks.
- New copy is mostly good: "Name they go by — If it's not Amir. Teachers see it on the register."
- Problems:
  - Notice vocabulary inflation: 7 → 47 words. "Done", "Saved" and "Sent" are confirmations, not notices.
  - Date formats are inconsistent (U11, U12).
  - Demo plumbing leaks into product copy (U8).
  - The adviser caveat is repeated (U1).
  - The absolute claim on `/welcome` (U16).
- Rule to add to `DESIGN-SYSTEM.md` §8:
  - Notices are for **changes and deadlines** only.
  - Confirmations use a quiet status line (✓ + sentence, positive colour).

**School branding layering.**
- Correct in the app shell ("Northstar Dance Academy / powered by swayvo"), on `/join` and in Urban.
- Gaps:
  - The home-screen icon (F1).
  - The printed programme (U15).
  - The school mark is duplicated in the header and switcher (U7).

**`/welcome`.**
- The hero and the interactive register are the best marketing artefact we have made: one idea, product at real size, one CTA.
- Fix the photo placeholders (H) and the claim.
- Add a pricing signal, or "from £x/month", before launch. Opinion: owners look for it.

**Store images (shot 17).**
- Correct size (1290×2796) and on-system.
- Problems:
  - All five share one template: same phone, same ground, same scale. The phone occupies about 45% of the height, so UI text is tiny at store-thumbnail size.
  - The blue "Open register" button inside the phone sits on a blue ground, which reduces contrast for the one action.
  - The dates and content predate round 2 (no absence reports, no cross-school, no consent).
- Improvements:
  - Crop tighter: one product moment at 70% height.
  - Alternate blue and white grounds.
  - Add one Urban (dark) shot to show "looks like your school".
  - Regenerate from `scripts/store-shots.mts` against current seed data.

**Favicon and app icons.**
- Correct and crisp (shot 18).
- `layout.tsx` sets `themeColor: '#ffffff'` while the manifest uses Count blue. Pick one; Opinion: studio white for the browser chrome.

---

## 6. Individual panel member reports (simulated)

### E1: Creative director and brand strategist

**Better.** The product now *keeps* the brand promise in places that matter: absence reports reach the register, consent is respected, the cross-school agenda exists. "More time for dance" was a promise about reliability, and round 2 made it truer. The parent home still says "nothing is left out" without saying it.

**Still frustrates me.**
- The marketing page shows three grey boxes with our own art-direction notes in them. I would not send that link to a prospect.
- The store set looks like one image five times.
- "The part nobody else does" is a claim I can't defend in front of a regulator.

**Top 5 UI improvements.**
1. Real photography, or remove the section on `/welcome`.
2. Split the Account page.
3. Store images rebuilt: tighter crop, alternating grounds, one Urban.
4. Cancellations always in parent Notices.
5. Soften the competitor claim.

**Top 3 features.** School-branded parent app (F1) · Printable branded programme (F2) · Term-end progress card (F5).

**Branding view.** Keep the strategy and identity. Refine the execution of marketing.

**Scores:** Relevance 9 · Quality 8 · Completeness 7 · Ease 8 · Efficiency 8 · Usefulness 9 · Adoption 7 · Continued use 8 · Visual design 8 · Brand appeal 8 → **Overall 8.0.** Function caught up with the brand; marketing assets now lag behind the product. Round-1: n/a (team self-assessment 84.6/100).

### E2: Identity and type designer

**Better.** The identity holds in every new screen. Archivo times in the agenda and week grid look like they belong. The favicon form is still the right call at 16 px.

**Still frustrates me.** The two wordmark issues I raised were never actioned: the y–v pair (1 unit between stroke edges versus 4–6 elsewhere) and the `o` seam. They are small, but a wordmark is forever, and they will be on every store listing.

**Top 5 UI improvements.**
1. Respace y–v.
2. Redraw `o` and the `a` bowl without the seam.
3. Icon-specific bar spacing at 180 px.
4. One `themeColor`.
5. No 10 px type in the brand preview.

**Top 3 features.** Branded app icon generator (F1) · Branded programme (F2) · Branded email templates (F4).

**Branding view.** Keep. Refine the wordmark before launch.

**Scores:** Relevance 9 · Quality 7 · Completeness 7 · Ease 8 · Efficiency 8 · Usefulness 8 · Adoption 7 · Continued use 8 · Visual design 8 · Brand appeal 8 → **Overall 7.5.** Round-1: n/a.

### E3: UI and visual designer

**Better.**
- The new screens mostly speak the language: rules not boxes, label-above forms, display times.
- The Update details sheet is a good sheet.
- The Urban agenda is handsome.

**Still frustrates me.**
- Density creep on Settings: Account has nine jobs and is 7,400 px.
- A boxed card with no padding in School settings.
- £0.00 in hero type.
- **EXPECTED** shouting on every payment row.
- The teacher week grid on a phone is a mostly empty spreadsheet.

**Top 5 UI improvements.**
1. Split Settings → Account.
2. Phone week as a list.
3. Payments: big number only when owed.
4. One settings nav, not nested tabs.
5. Selected states never in accent fill.

**Top 3 features.** Onboarding polish (F3) · Branded programme (F2) · Design-system lint (F7).

**Branding view.** Keep. Refine the product's secondary screens.

**Scores:** Relevance 9 · Quality 7 · Completeness 8 · Ease 7 · Efficiency 7 · Usefulness 8 · Adoption 7 · Continued use 8 · Visual design 7 · Brand appeal 8 → **Overall 7.5.** Round-1: n/a.

### E4: Design-systems lead

**Better.**
- No hard-coded colours crept into screens; tokens held, and Urban still works by token alone.
- Every px size moved to rem.
- Notice, SectionHead and EmptyState are used widely.

**Still frustrates me.**
- Eight hand-rolled tab sets in three visual styles.
- `SettingsSection as Card`: a rule section aliased as a box, which will confuse the next engineer.
- Notice words went from 7 to 47.
- `/design` and `DESIGN-SYSTEM.md` haven't moved since 26 Nov, so new engineers copy whatever is nearest.
- The printable programme still carries the *old* palette.

**Top 5 UI improvements.**
1. `FilterTabs` + `Choice` + `FileField` + `LocationSelect` added to `components/ui` and `/design`.
2. Rename `SettingsSection`/`SettingsHead` to `Section`/`SectionHead` usage, and delete the aliases.
3. A Notice word allow-list (a typed union).
4. Snap type to the scale.
5. Update `DESIGN-SYSTEM.md` with the new patterns.

**Top 3 features.** Design-system lint (F7) · Branded email templates (F4) · Branded programme (F2).

**Branding view.** Keep. The system needs governance more than redesign.

**Scores:** Relevance 9 · Quality 7 · Completeness 7 · Ease 8 · Efficiency 7 · Usefulness 8 · Adoption 7 · Continued use 7 · Visual design 7 · Brand appeal 8 → **Overall 7.0.** Round-1: n/a.

### E5: Motion and interaction designer

**Better.**
- The offline register states, the undo for merges, and the "Excused · reported by parent" pre-mark are honest interaction design.
- Focus is trapped in sheets now.
- Reduced motion is still respected.

**Still frustrates me.**
- The count, our signature, still only completes on the register. Saving details, sending a billing run or finishing onboarding gets no "on the count" moment.
- The agenda skeleton pulses for 30 s+ without words.
- Consent toggles save instantly inside a sheet whose other fields need Save. That is two mental models in one surface.
- The native file picker and native school switcher break the tactile consistency.

**Top 5 UI improvements.**
1. One save model per sheet.
2. A count-fill confirmation for onboarding steps and billing runs (≤2 beats, no loop).
3. Skeleton + words after 3 s.
4. Styled file and school pickers.
5. The selected state as check + outline.

**Top 3 features.** Onboarding polish with the count (F3) · Term-end progress card (F5) · What's-new notice (F8).

**Branding view.** Keep. Extend the motion signature carefully.

**Scores:** Relevance 9 · Quality 7 · Completeness 7 · Ease 8 · Efficiency 8 · Usefulness 8 · Adoption 7 · Continued use 8 · Visual design 7 · Brand appeal 7 → **Overall 7.5.** Round-1: n/a.

### E6: UX writer and content designer

**Better.**
- New copy is plain and caring: "Name they go by — If it's not Amir. Teachers see it on the register."
- "Only you see this. Each school chooses whether its classes show here in full or as busy times."
- No exclamation marks or blame anywhere we looked.

**Still frustrates me.**
- Dates: "Thursday" with no date on a Saturday, and three formats in one list.
- "booked" versus "expected" for the same thing.
- "Check with your data protection adviser" eight times.
- "Stored in this browser" in product copy.
- Notices used as toasts ("Done", "Saved").
- "Not recorded, so not allowed" is accurate but cold for a teen.
- The `/welcome` claim.

**Top 5 UI improvements.**
1. One date style guide: weekday this week, "Thu 3 Dec" beyond, full date in sheets.
2. Notices only for changes and deadlines.
3. One adviser caveat per section.
4. "Booked" everywhere.
5. Remove demo plumbing from copy.

**Top 3 features.** Branded email/notice templates (F4) · Branded programme (F2) · Onboarding polish (F3).

**Branding view.** Keep the voice. Write a content style sheet (dates, numbers, Notice words) into `DESIGN-SYSTEM.md`.

**Scores:** Relevance 9 · Quality 8 · Completeness 7 · Ease 8 · Efficiency 8 · Usefulness 8 · Adoption 7 · Continued use 8 · Visual design 8 · Brand appeal 8 → **Overall 8.0.** Round-1: n/a.

---

## 7. Votes

| Persona | UI #1 | UI #2 | UI #3 | Feature #1 (rating) | Feature #2 (rating) | Feature #3 (rating) | Remove / simplify | Greatest-impact change |
|---|---|---|---|---|---|---|---|---|
| E1 | welcome-photography | split-account-settings | store-images-rebuild | branded-parent-app (Highly desirable) | branded-programme (Highly desirable) | progress-card (Useful) | welcome-photo-placeholders | welcome-photography |
| E2 | wordmark-yv-spacing | wordmark-o-seam | icon-bar-spacing | branded-parent-app (Highly desirable) | branded-programme (Highly desirable) | branded-email-templates (Essential) | duplicate-school-mark-header | wordmark-refine |
| E3 | split-account-settings | phone-week-as-list | payments-hero-only-when-owed | onboarding-polish (Highly desirable) | branded-programme (Highly desirable) | ds-lint (Highly desirable) | nested-settings-tabs | split-account-settings |
| E4 | shared-tabs-choice-components | notice-word-allowlist | update-design-docs-and-showcase | ds-lint (Highly desirable) | branded-email-templates (Essential) | branded-programme (Highly desirable) | settingssection-card-alias | shared-tabs-choice-components |
| E5 | one-save-model-per-sheet | count-fill-confirmations | skeleton-with-words | onboarding-polish (Highly desirable) | progress-card (Useful) | whats-new-notice (Nice to have) | native-file-and-school-pickers | one-save-model-per-sheet |
| E6 | date-format-rule | notices-only-for-changes | one-adviser-caveat | branded-email-templates (Essential) | branded-programme (Highly desirable) | onboarding-polish (Highly desirable) | notices-as-toasts | date-format-rule |

---

## 8. Group summary

**Consensus.**
- **Keep the brand.** Name, mark, colour, type and voice survived about 60 functional changes without a single hard-coded screen colour, and the school layering works in both styles.
- **The drift is in governance, not identity:**
  - shared components missing for tabs, choices, uploads and location;
  - Notice vocabulary inflation;
  - settings sprawl;
  - stale `/design` and `DESIGN-SYSTEM.md`.
- **The outward-facing brand now lags the product.** `/welcome` shows photo placeholders, the store images are templated and stale, the printable programme is off-brand, and the home-screen icon is not school-branded.
- **The brand promise shows most** on the parent home (Notices), the teacher hero and the student milestones ("6 more to a full count"). It is weakest on Settings and in print.

**Disagreements, kept.**
- **E2 vs E1** on whether the wordmark fix blocks launch. E2: yes, before store submission. E1: no, before paid marketing.
- **E5 vs E3** on motion. E5 wants count-fill confirmations on more completions. E3 fears "celebration creep" on office screens and would limit it to onboarding and the register.
- **E4 vs E6** on Notices. E4 wants a hard typed allow-list of ~10 words. E6 would allow free words for *changes* but ban confirmations.

**Prioritised design changes (what, where, why).**

| P | Change | Where | Why |
|---|---|---|---|
| 1 | Real photography, or remove the section; soften the "nobody else" claim | `src/app/welcome/page.tsx` | Visible placeholders and an absolute claim on the sales page |
| 2 | Split Settings → Account into Brand / People and access / Data and privacy / History; history hides automatic rows | `src/app/account/page.tsx`, `safeguarding.tsx` RetentionCard | 7,400 px density creep; retention needs its own calm page |
| 3 | Add `FilterTabs`, `Choice`, `FileField`, `LocationSelect` to `components/ui`; replace the 8 hand-rolled tab sets; selected state = ink outline + check | `components/ui/index.tsx`, billing, studio, account, platform, family/messages, learn/*, enrolment, consents | Three tab styles; accent used as a selected state |
| 4 | Notices for changes and deadlines only; confirmations as a status line; typed word list | `components/ui` Notice/Word, ~15 call sites | 47 words dilute the signature device |
| 5 | Date and number content rule; "booked" everywhere | `lib/format`, teach, family, learn | Ambiguous "Thursday", mixed formats |
| 6 | Parent Notices always include cancellations within 7 days | `family/page.tsx` | The promise "nobody is left out of the loop" |
| 7 | Phone week as a list; teacher grid by time; today marked | `teacher-week.tsx` | An empty grid at 390 px |
| 8 | Payments: hero only when owed; one "Expected" note | `family/payments/page.tsx` | Big numbers only where a decision hangs |
| 9 | Branded print programme | `show-tools.tsx` | Old Sanaa palette, no school identity |
| 10 | Wordmark y–v respacing, `o` seam, icon bar spacing; one `themeColor` | `swayvo-logo.ts`, `layout.tsx`, `brand-assets.mts` | Open since 26 Nov |
| 11 | 200% header and tab bar | `shell.tsx` | Header stacks; labels truncate |
| 12 | Rebuild store images (tighter, alternating grounds, one Urban, current data) | `scripts/store-shots.mts` | Templated and stale |
| 13 | Update `/design` and `DESIGN-SYSTEM.md`; add a lint (F7) | `app/design`, `docs/brand` | Stops the next 60 changes drifting |

**Branding verdict: KEEP the identity and strategy. REFINE the execution. No rethink.**
- **Keep:** the name, the count, Archivo/Inter, Count blue as "the now", and the voice are distinctive and have proved robust.
- **Refine:**
  - the wordmark (two measurable flaws);
  - the outward assets (photography, store, print, icon);
  - the system's governance.

**Brand/design scorecard re-scored (from `FINAL-ASSESSMENT.md`, same weights).**

| Area | Weight | 26 Nov | Now | Why it moved |
|---|---|---|---|---|
| Visual design and UI craftsmanship | 20% | 8.7 | 8.2 | New sheets are on-system. Settings sprawl, the boxed card without padding, the £0.00 hero, the empty phone grid. |
| User experience and ease of use | 20% | 8.3 | 8.1 | Functional gains are large (absence → register, consent, agenda). Mixed save models, ambiguous dates, settings depth. |
| Brand identity and consistency | 15% | 8.5 | 8.0 | Layering holds. Placeholders on `/welcome`, off-brand print, Swayvo icon on a school-named PWA, wordmark unrefined. |
| Creative direction and originality | 10% | 8.3 | 8.3 | Unchanged. The count and notices are still distinctive. |
| Mobile and responsive | 10% | 8.5 | 8.2 | Rem everywhere (good). 200% header/tabs; phone week grid. |
| Design system and components | 10% | 8.5 | 7.4 | 8 hand-rolled tab sets, 47 notice words, misleading Card alias, `/design` and docs stale, type scale unenforced. |
| Accessibility and inclusion | 5% | 8.0 | 8.3 | Focus trapping, rem text, more statuses in words. Still no assistive-technology review. |
| Motion and interaction | 3% | 7.5 | 7.4 | No new motion. The wordless long skeleton. |
| Commercial credibility | 4% | 9.0 | 8.4 | The product reads more complete. Public placeholders and an unverified claim. |
| Technical implementation | 3% | 9.0 | 9.0 | 590 tests; tokens held; no new colours in screens. |
| **Weighted total** | | **84.6** | **80.9 / 100** | Still band 80–89. Lower because we measured drift we did not see on 26 Nov. |

Arithmetic: 1.64 + 1.62 + 1.20 + 0.83 + 0.82 + 0.74 + 0.415 + 0.222 + 0.336 + 0.27 = 8.093 → 80.9.

**Group scores now vs round 1 (simulated).**

| Persona | Overall now | Round 1 |
|---|---|---|
| E1 | 8.0 | n/a |
| E2 | 7.5 | n/a |
| E3 | 7.5 | n/a |
| E4 | 7.0 | n/a |
| E5 | 7.5 | n/a |
| E6 | 8.0 | n/a |
| **Mean** | **7.6** | n/a (brand self-assessment 84.6 → 80.9 now) |

**To get back above 85:**
- priorities 1–4 and 10 above (about M in total);
- a content style sheet;
- the lint;
- then the evidence the 26 Nov assessment already named: real photography, real users and assistive-technology testing.
