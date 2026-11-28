# Swayvo design system

The rules every screen follows. Read with `GUIDELINES.md` (the brand) and look at the reference screen,
`src/components/app/today-view.tsx` (owner Today), before building or changing a screen. The live
component showcase is at `/design`.

Approved direction: **B · Counts**, refined, with **E's notices**. Owner/office screens borrow restraint
(white, rules not boxes, one blue thing per screen); student and parent screens borrow warmth in words.

## 1. Principles
1. **One blue thing per screen.** The accent (Count blue, or the school's own colour) marks the primary
   action and the "now". Not headings, not icons, not decoration.
2. **Rules, not boxes.** Group with spacing, a 2px ink rule under a section heading, and hairline
   dividers between rows. Use a bordered surface (`.card`) only for things that are genuinely separate
   objects (a dialog, a form, a list that sits beside other content on a coloured ground). Never nest them.
3. **Type does the hierarchy.** Archivo (display) for page titles, big numbers and times; Inter for
   everything else. No uppercase micro-labels above every block: section titles are sentence case.
4. **Big numbers only where a decision hangs on them**: the next class time, an amount due, a count that
   needs action. Everything else is a dense, aligned list.
5. **Status is a word, then a colour.** Never colour alone. Changes people must not miss (moved,
   cancelled, due) are **Notices**: an uppercase verb set in display type.
6. **Each screen gets the layout its job needs.** A register is a fast list of big targets; a timetable
   is a grid; progress can be expressive; payment is calm and exact.
7. **Phones first for teachers, parents and students; desktop first for the office.**

## 2. Tokens (`src/app/globals.css`)
| Token | Value | Use |
|---|---|---|
| `canvas` | #F4F5F8 Studio white | page ground |
| `surface` | #FFFFFF | sheets, inputs, bordered surfaces |
| `surface-2/3` | #EEF0F4 / #E3E6ED | hover, empty beats, skeletons |
| `line` / `line-strong` | #E2E4EB / #C9CDD8 | dividers / input borders |
| `ink` / `ink-2` / `ink-3` | #121521 / #3C4150 / #5B6072 | text: primary / body secondary / meta (6.2:1) |
| `accent` | #2638F0 Count blue (school colour at runtime) | primary action, now, active nav beat |
| `accent-text` | accent fitted for text on white | links, inline actions |
| `peach` | #FFB089 Rosin peach | the downbeat, celebration; never text on white |
| `positive` `caution` `critical` `info` | #0E7A4A #9A5A00 #C42339 #0A6A88 | status only, each with a word |
| Style hues | violet, amber, teal, rose, indigo, lime | dance-style marks beside the style name |

Radii: 4 / 6 / 8 / 14px (`radius-sm…xl`). Shadows only on floating layers (`shadow-md`, `shadow-lg`).
Dark style (`data-theme="urban"`) redefines the same tokens; never hard-code a colour.

## 3. Type
| Role | Class | Notes |
|---|---|---|
| Page title | `.page-title` (Shell) | Archivo 800, width 112%, 20/26px |
| Hero number / time | `.display-xl` | Archivo 850, width 125%, 64–96px, tabular |
| Big figure | `.stat-number` | Archivo 800, 24–32px |
| Display small | `.font-display` | names in heroes, times in lists (17–24px) |
| Section title | `.section-title` | Inter 650, 15px, sentence case |
| Body | default | Inter 15px; 14–14.5px in dense lists |
| Meta | `text-[0.8125rem] text-ink-3` | second lines |
| Label | `.label` | 12px uppercase, tracked — sparingly: column heads, "Next", figure captions |
| Sheet title | `RecordSheet` | Inter 600, 17px — display type is too loud inside a form |
Phone minimum 15px body; inputs 16px (enforced globally). Every text size is in rem (`text-[0.8125rem]`),
never px, so it follows the reader's text size; the lint fails on `text-[13px]`.

## 4. Layout
- Page content: `mx-auto max-w-[1240px]` for office dashboards; `max-w-2xl`/`max-w-lg` for phone-first roles.
- Section pattern: `SectionHead` (title + optional meta + link, `border-b-2 border-ink pb-2`) then a
  `divide-y divide-line` list. See `today-view.tsx`.
- Two-column office layout: `lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-x-12 gap-y-10`.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48px (`gap-1…12`). Sections 40px apart.
- Rows: 44px+ tall on touch, `py-3`; time column fixed width (`4.25rem`) so times align.

## 5. Components (`src/components/ui`, `src/components/app`)
- **Button**: `primary` (one per view), `secondary`, `ghost`, `danger`. Heights 36/40 (44 on touch).
- **Beats** (`<Beats value max label />`): the eight-count meter for "how full / how far". Always with a
  number or words beside it.
- **Notice** (`<Notice word="Moved" title detail />`): changes, deadlines and things that need action, as
  type. The word is a typed allow-list (`NOTICE_WORDS`, `NoticeWord`): MOVED, CANCELLED, CHANGED, NEW, CLASH,
  FULL, DUE {date}, CLOSED, PAID, BOOKED, HELD, OFFLINE, NOT SAVED, NOT SENT, ACT NOW, CHECK, LIMITED.
  Any other word fails the type check and the lint. Tone: critical for cancelled/failed, caution for due, ink
  otherwise. Adding a word is a design-system change: add it here, in `components/ui` and on `/design`.
- **StatusLine** (`<StatusLine title detail />`): a quiet confirmation with a tick — "Sent to 7 families",
  "Saved". Confirmations are never Notices (no DONE, SAVED, SENT, IMPORTED). Announced politely.
- **Badge**: small status or category marker (4px radius). Use sparingly — at most one per row.
- **Field / Input / Select**: label above, hint or error below; errors are announced.
- **EmptyState**: left-aligned, display-type title, one sentence, one action.
- **Card / CardHeader**: a bordered surface with a sentence-case header. Prefer sections and rules on
  the page ground; keep cards for dialogs, forms and side panels.
- **Shell**: title, optional subtitle, actions, `help`. Active nav is marked by one accent beat.
- **SectionHead**: the standard section heading (title, meta, one link or action, 2px ink rule).
- **StyleMark** (`colour`, `name`): a dance style's hue as a small square, always beside its name.
  `styleColour()` gives the hue as a token for bars and borders.
- **Word** (`size="sm" | "md"`): a status or change set as an uppercase word (CANCELLED, MOVED, CLASH, PAID).
- **ViewTabs** (`options={[[value, label, count?]]}`): quiet text tabs with an ink rule, for switching
  views of the same thing (List / Week grid, Families / Students / Staff, one child at a time). A real tab
  list (arrow keys move).
- **FilterTabs**: the same look with a count, for narrowing one list (Needs action 8 · Open · Paid).
  Pressed buttons, not tabs. No filled pills, no accent.
- **Choice** (`value`, `onChange`, `options={[{ value, label, hint? }]}`, `multiple?`, `layout`): single or
  multiple choice as chips. Selected = ink outline + tick + semibold, never an accent fill (the accent is the
  one primary action). Single choice is a radio group; `layout="grid"` for segmented rows, `"stack"` for
  choices with a hint, `tick="corner"` for narrow equal chips (D / S / M).
- **FileField**: a file picker as an outlined drop zone with an icon and words ("Choose a video, music or a
  document"); the native input stays for keyboard and screen readers. Never the unstyled "Choose File".
- **LocationSelect**: which location a list shows, label inside the control ("All locations ▾"). The same on
  Classes, Schedule and Billing (`useLocationFilter().control`).
- No screen hand-rolls a tab list, segmented control or chip toggle: the lint fails on `role="tablist"`
  outside `components/ui`. The register's Here / Absent targets are a pattern of their own (§6).
- **SwayvoLogo / SwayvoMark / SwayvoIcon** (`src/components/app/swayvo.tsx`): never redraw the logo.
All of the above live in `src/components/ui`; do not copy them into screen files.

## 6. Patterns
- **Times** in display type, tabular, fixed-width column. **Money** `stat-number`, two decimals.
- **Attention list**: big number (colour by urgency + text), headline, detail, one text action.
- **Register row**: name (+ medical line in words), two big targets: Here / Absent (≥44px).
- **Progress**: skills as Beats (developing 3 / secure 6 / mastered 8 beats), "not yet" shown as an
  empty meter with the word "Not yet" — never red, never "failed".
- **Notices** for moves, cancellations, due dates — never a coloured pill.
- **Icons**: lucide, 1.8px stroke (2.2 active), only in navigation and controls, not beside headings.

## 7. Motion
One beat = 120ms. Built:
- **Beats fill** bar by bar when they first appear (`.beat-fill`, 30ms apart, 2 beats each).
- **On the count**: `.on-count` on a list steps its first rows in one beat apart (Today's attention
  list, the parent's notices). Use it for at most one list per screen.
- **Completion**: the register's count turns green and full when everyone is marked.
No page transitions on office screens. `prefers-reduced-motion` turns all of it off.

## 8. Voice in the interface
Plain, specific, kind. Name real things. Buttons say what happens ("Open register", "Send 4 invoices").
Office: calm and exact. Teacher: brisk. Student: encouraging and specific. Parent: reassuring and complete.
No exclamation marks in system text. No "Oops". Errors say what happened and what to do.

**Content rules (one style sheet).**
- **Dates** (`lib/format`): "Today", "Tomorrow" or "Yesterday" when it is one; otherwise always the weekday
  *and* the date: "Thu 3 Dec" (`relativeDay`, `dayDate`). Never a bare weekday — "Thursday" on a Saturday
  could be this week or next. With a time: "Thu 3 Dec, 18:30" (`dayDateTime`). The year only when it is not
  this year: "Fri 8 Jan 2027". In sheets, headings and confirmations where there is room: "Thursday 3
  December" (`dateLong`). "3 Dec" (`dateShort`) only in dense tables and DUE words.
- **Times** 24-hour, "18:30"; ranges "18:30–19:15". **Money** always two decimals, "£186.00".
- **Words**: children in a class are "booked" (not "expected"); "Expected" for costs is said once, in the
  section head, not on every row.
- **Notices** only for changes and deadlines (§5); confirmations are a StatusLine.
- **Big numbers** only where a decision hangs on them: no £0.00 hero — "Paid. Nothing is due." instead.

## 9. Accessibility
WCAG 2.2 AA. `npm run a11y` must report no serious or critical issues. Contrast is enforced by tokens and
`lib/brand.ts` for school colours. Targets ≥44px on touch. Status never by colour alone. Focus visible.

**Large text (200%).** Check phone screens at 390px with the root font at 200%. The Shell keeps chrome to
about a quarter of the screen: at 150% text and above the phone header is one row — a 28px school mark, the
title (two lines at most), the bell and "More for this screen" (the page's actions, help, search, person
switcher); the subtitle moves to the top of the page. Header icons are sized in rem with a 44px floor.
Bottom tab labels grow to 14px and wrap to two lines rather than truncate. Rows with a price or count on the
right stack under the name when the row gets narrow (container queries, `@container` / `@xs:`), so nothing
overlaps.

**Phone office header.** The avatar is in More; the primary action is a "+" in the title row; an area's
other screens open from the title ("People ▾") rather than a second tab row, so a page has one tab row.

## 10. Governance
- `/design` shows every component above, the Notice words and the date rule, live. Change it with the code.
- `node scripts/design-lint.mjs` (`npm run lint:design`, also run by `tests/design-system.test.ts`) fails on:
  hard-coded hex colours in `src/app` or `src/components` (outside the tokens and a short, reasoned list of
  files), px font sizes, `role="tablist"` outside `components/ui`, and Notice words not in the list.
- New UI reuses `components/ui`; if something is missing, add it there (and here, and on `/design`) rather
  than in a screen.

## 11. Do not
Rounded-card dashboards; cards inside cards; uppercase micro-labels on every block; gradients; decorative
illustrations or emoji; icon circles; more than one primary button per view; badges on every row;
greeting banners; decorative statistics; colour as the only signal; hard-coded colours; accent-filled
selected states; hand-rolled tabs or chips; Notices for confirmations; bare weekdays for dates.
