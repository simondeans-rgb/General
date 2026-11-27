# Final assessment — Swayvo transformation

Date: 26 November 2026. Branch `studio` (baseline frozen on `sanaa-v1`). Preview: `/General/studio-next/`.
This is the team's internal assessment, not independent certification. "User perspectives" throughout
were simulated professional judgement; no real users were tested.

## 1. What was delivered
| Phase | Deliverable | Where |
|---|---|---|
| Discovery | Audit, screen and component inventory, 76 baseline screenshots | `AUDIT.md`, `baseline/` |
| Naming | Research and weighted scorecard; Swayvo approved | `NAMING.md` |
| Strategy | Purpose, proposition, audiences, voice, messaging | `STRATEGY.md` |
| Concepts | Five concept boards (A–E), equivalent screens; B + E's notices approved | `concepts/` |
| Identity | Logo geometry in code; 14 SVGs + PNG renders; app icons; favicons | `src/lib/swayvo-logo.ts`, `public/brand/` |
| Guidelines | Brand guidelines; design system rules | `GUIDELINES.md`, `DESIGN-SYSTEM.md` |
| Design system | Tokens, type, primitives (Beats, Notice, SectionHead), live showcase | `globals.css`, `components/ui`, `/design` |
| Product | Every role's screens redesigned (43 routes, ~30 sheets) | `src/app`, `src/components/app` |
| Evidence | Before/after comparisons; this assessment | `before-after/` |

## 2. User-experience improvements
- **Owner Today:** greeting banner and stat tiles replaced by the next class as one big time, an attention
  list ordered by consequence (number, meaning, one action), today's classes with fill as the count, and
  money in two figures. Phone order: next class → attention → money → classes.
- **Teacher:** the next class is the hero with medical notes in words before "Open register"; the register is
  a fast list of 48px Here/Absent targets with progress as the count; late/excused one tap in.
- **Parent:** changes are Notices first (MOVED, CHANGED, CANCELLED, DUE); each child's week is a time-aligned
  list; one Pay action; payments as a calm ledger with the transfer reference to copy.
- **Student:** teacher notes first as quotes; skills as the count (developing 3, secure 6, mastered 8);
  unassessed skills grouped into one "Not yet" line instead of up to 30 repeated rows; milestones celebrated.
- **Office:** five areas + Settings (kept), every screen rebuilt on rules and aligned lists; billing as a
  ledger; week grid with clashes named in words and today marked; one sheet layout with one primary action.
- **First impression:** sign-in page on Count blue with the tagline; demo picker as plain rows.

## 3. Testing performed
| Check | Result |
|---|---|
| Database and permission tests (`npx vitest run`) | **378 / 378 pass** (row security, billing, safeguarding, roles unchanged) |
| Type check (`tsc --noEmit`) | Pass |
| Accessibility (`npm run a11y`, axe-core, WCAG 2.2 AA, 64 checks incl. phone and dark style) | **No serious or critical issues** (one found and fixed: Reports definition lists) |
| Sideways overflow, every route, 360px and 320px | **None** |
| Browser journeys (Playwright): register marking, billing runs, timetable sheet, parent message, parent home notices, student practice, public trial booking with consent, sign-in | **8 / 8 work** (one test selector matched hidden text; the screen was verified by screenshot) |
| Static preview build served as GitHub Pages will | Pass; favicons linked; separate demo storage |
| Page weight (gzipped JS, first load) | ~230 KB per page — unchanged by the redesign |

**Not tested:** real iOS/Android devices (emulated only); VoiceOver, TalkBack, NVDA; real users; card
payments, email/SMS/push delivery and real sign-in (not connected — decisions R-001, R-003, R-006).

## 4. Weighted scorecard
Re-scored after the refinement round (section 5). The first-round score was 82.2.

| Area | Weight | Score | Evidence | Remaining weakness |
|---|---|---|---|---|
| Visual design and UI craftsmanship | 20% | 8.7 | Before/after set; rules-and-type system; children page two columns on desktop; timetable compact view; register action bar | Some secondary sheets still dense |
| User experience and ease of use | 20% | 8.3 | Journeys pass; task-first layouts; trials grouped by day; register "Mark the rest" always in reach | No real-user testing |
| Brand identity and consistency | 15% | 8.5 | One identity source; guidelines; school colours layered correctly; marketing page and store images from the same system | No photography; wordmark not reviewed by a type designer; trademark not cleared |
| Creative direction and originality | 10% | 8.3 | The count and notices are specific to dance; the count now moves | — |
| Mobile and responsive | 10% | 8.5 | Phone-first roles; 320/360 checks clean; 44px targets | Emulated devices only |
| Design system and components | 10% | 8.5 | StyleMark, Word, SectionHead, ViewTabs now shared in `components/ui`; local copies removed | — |
| Accessibility and inclusion | 5% | 8.0 | Automated checks clean; status always in words; reduced motion respected | No assistive-technology review |
| Motion and interaction | 3% | 7.5 | Beats fill on the count; attention lists step in a beat apart; register completes in green | No page or sheet transitions (deliberate on office screens) |
| Commercial credibility | 4% | 9.0 | Sign-in, Today, billing read as established; marketing page `/welcome`; App Store and social images | Real customer quotes and photography |
| Technical implementation | 3% | 9.0 | 378 tests, journeys, no weight increase, no new dependencies | — |
| **Weighted total** | | **84.6 / 100** | | |

**Interpretation: 80–89 — a premium commercial product requiring limited refinement.** The 90 target is still
not met, and the score has not been inflated to meet it. What remains is evidence that cannot be produced from
here: real users, real devices, assistive technology, photography and a type designer.

## 5. To reach 90+
Done in the refinement round:
- Shared helpers moved into `components/ui` (StyleMark, Word, SectionHead, ViewTabs); local copies removed.
- Motion signature: Beats fill on the count; on-count entry for attention lists; register completion.
- Children page in two columns on desktop; public trial slots grouped by day, the first week shown.
- Marketing page (`/welcome`) and App Store / social images (`public/brand/store/`, `scripts/store-shots.mts`).
- Flagged fixes: sticky register action bar, compact timetable for busy days, board select sized for touch,
  shorter Reports and demo text, initials from first and last names.

Still needed, outside what the team can do here:
1. Usability sessions with 2–3 owners, teachers, parents and teens on the preview; fix what they hit.
2. Screen-reader and keyboard review (VoiceOver, TalkBack, NVDA) per `docs/ACCESSIBILITY.md`.
3. A small photography set (real classes, every style, with consent) for sign-in, parent home and marketing.
4. A type-designer pass on the wordmark (spacing of "yv", stroke joins); then regenerate assets.
5. Real-device checks on iOS and Android phones and tablets.

## 6. Technical summary
No business logic, permissions, payment or data structures changed. Changes: design tokens and fonts
(`globals.css`, Fraunces removed), primitives (`components/ui`), shell and navigation styling, every page's
presentation and copy, logo components and generated assets, metadata and manifest, product name in
database message text (no production database exists), favicons. Technical identifiers (storage keys,
calendar event ids, `barre` folder) unchanged by design. Maintenance: edit the logo only in
`src/lib/swayvo-logo.ts` and run `npx tsx scripts/brand-assets.mts`; follow `DESIGN-SYSTEM.md` for new screens
and check them on `/design`, with `npm run a11y`, and with the before/after screenshot scripts.
