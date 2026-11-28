# Swayvo brand guidelines

Approved 26 November 2026: name **Swayvo**, creative direction **B · Counts** (refined) with **E's notices**.
Strategy: `STRATEGY.md`. Product rules: `DESIGN-SYSTEM.md`. Concept boards: `concepts/`.

## 1. The brand in one page
- **Name:** Swayvo — always one word, capital S in running text, lowercase in the logo. Never "SwayVo",
  "Sway-vo" or "Swayvo app". Say it SWAY-voh.
- **Purpose:** more time for dance.
- **Proposition:** everything a dance school runs on — timetable, register, money, messages — kept on the
  count, plus the part nobody else offers: each student's progress, told to them and their family.
- **Idea:** *the count.* Every dancer, in every style, counts in eights. Swayvo keeps the school on the
  count so everyone can move.
- **Personality:** energetic, confident, direct, encouraging.
- **Values:** craft, care, momentum, every style and every age.
- **Primary tagline:** *Five, six, seven, eight.* Secondary: *More time for dance.*

## 2. Logo
Assets: `public/brand/` (generated from `src/lib/swayvo-logo.ts` by `scripts/brand-assets.mts` — edit
the geometry there, never the files). In the app use `<SwayvoLogo>`, `<SwayvoMark>`, `<SwayvoIcon>`.

| Asset | File | Use |
|---|---|---|
| Primary lockup | `swayvo-logo.svg` / `.png` | light grounds: ink wordmark and count, blue downbeat |
| Reversed | `swayvo-logo-white.svg`, `swayvo-logo-on-blue.svg` | blue or dark grounds: white, peach downbeat |
| Single colour | `swayvo-logo-mono-ink/white/blue.svg` | one-colour print, embroidery, partner pages |
| Wordmark | `swayvo-wordmark(-white).svg` | where the mark already appears nearby |
| Mark | `swayvo-mark(-white/-blue).svg` | social avatars, small spaces |
| App icon | `swayvo-app-icon.svg`, `-square.svg`, `-1024.png`, `public/icons/*` | home screens, stores |
| Favicon | `swayvo-favicon.svg`, `-16/-32.png`, `src/app/icon.svg` | browser tabs |

**The mark** is the eight-count: eight bars in two groups of four with a clear gap. Beat 1 (the downbeat)
is full height and coloured; beat 5 is lifted. The gap between the groups is what stops it reading as a
signal-strength icon — never close it. Below 24px use the four-beat favicon form (beats 1, 2, 5, 6).

**Wordmark v2** (28 Nov 2026): y–v respaced, seamless bowls, a more open count on the app icon. See
`wordmark-v2.md`.

**Clear space:** the height of a short bar (the x-height of the wordmark) on every side.
**Minimum size:** lockup 96px / 22mm wide; wordmark 64px / 15mm; below that use the mark.

**Never:** recolour outside the palette; put the logo on photography without a solid ground; stretch,
outline, shadow or animate the wordmark; close the gap in the count; use the downbeat colour on the
other bars; set "swayvo" in a font instead of using the artwork.

**With a school:** the school leads. In the app the school's own name and logo sit at the top; Swayvo
signs off as "powered by swayvo". A school never recolours the Swayvo logo.

## 3. Colour
| Name | HEX | Role |
|---|---|---|
| Count blue | #2638F0 | brand ground in marketing; the one primary action and the "now" in the product |
| Count blue deep | #1A27B8 | pressed states, text on light blue |
| Rosin peach | #FFB089 | the downbeat, celebration; large type on blue only (4.1:1) |
| Ink | #121521 | text, the wordmark |
| Studio white | #F4F5F8 | page ground |
| White | #FFFFFF | surfaces |
| Slate | #5B6072 | secondary text (6.2:1 on white) |
| Success / Warning / Critical / Info | #0E7A4A / #9A5A00 / #C42339 / #0A6A88 | status only, always with a word |

In marketing, Count blue can fill a whole ground. In the product it appears once per screen. Peach is
never body text on white. Each school may set its own main colour; the product fits it for contrast.

## 4. Typography
- **Archivo** (variable, OFL): display. Headlines at width 112–125%, weight 800–900, tight tracking.
  Times, money and counts at large sizes. Notices at width 80%, uppercase.
- **Inter** (variable, OFL): interface and body, 400–650, tabular figures for data.
Both self-hosted via Fontsource; no third-party font requests.
Scale: 12 · 13 · 15 · 17 · 20 · 26 · 34 · 48 · 72 · 104.

## 5. Graphic language
- **The count (Beats):** eight bars, two groups of four. Use it to show *how full* (places in a class),
  *how far* (week of term), *how strong* (a skill: 3 developing, 6 secure, 8 mastered). Always beside a
  number or words.
- **Notices (from Press):** changes people must not miss are set as one uppercase verb in condensed
  Archivo — MOVED, CANCELLED, DUE 4 DEC — with the detail beneath. Never a pill.
- **Rules, not boxes:** a 2px ink rule under a section title, hairlines between rows.
- **Icons:** lucide line icons, 1.8px stroke, 24px grid, in navigation and controls only.
- **Photography:** real classes of every style and age, natural light, movement mid-phrase, faces only
  with consent; no stock smiles, no silhouettes, no ballet-shoe still lifes. Crop tight on hands, feet,
  floor. Never place the logo over a busy photo.

## 6. Motion
One beat = 120ms. Things arrive on the count (staggered, ≤2 beats); success fills the count to eight;
loading lights the beats in turn. Nothing loops in the product. Reduced-motion: no movement at all.

## 7. Voice
Plain, warm, specific, short. Name real things. Encourage without gushing; never blame.
| Audience | Example |
|---|---|
| Owner | "3 card payments failed overnight — £162.00. Retry now or send each family a pay link." |
| Teacher | "Junior Tap is done. Two lines of feedback while it's fresh?" |
| Student | "50 classes. That's a full count — keep moving." |
| Parent | "Tuesday 1 December: Grade 2 Ballet moves to Studio Two. Same time, same teacher." |
Avoid: "Oops", exclamation marks in system text, jargon ("entity", "record", "sync"), blame ("You failed to…").

## 8. Applications
- **App store:** one big product moment per screenshot (the next class time, the register, the
  student's count), cropped tight so the product is about 70% of the image, headline in Archivo:
  "Register in seconds." "Progress you can see." Grounds alternate Count blue and studio white, and one
  image shows a school in the dark Urban style. Phone 1290 × 2796, tablet 2048 × 2732, Google Play
  feature graphic 1024 × 500, all made by `scripts/store-shots.mts` from the current app with a fixed clock.
  Never a state the product can't do (no card payments until they exist).
- **Website:** hero on Count blue: "Five, six, seven, eight." then the proposition; product shown at
  real size; one call to action ("Book a demo"), with "Try the demo" beside it and a way through for
  families ("Looking for classes? Find your school"). No photography until there are real, consented
  photos: type carries those sections. Claims only about Swayvo, true of the current build.
- **Social:** square posts in blue or white, one idea each, the count as a recurring device.
- **Email:** white, school name first, Swayvo sign-off; plain text first, no images required.
  Templates: `src/lib/branded-print.ts`, previewed on `/design`.
- **Print:** the show programme is the school's: logo, name and colour, Archivo running order, Inter
  details, "powered by swayvo" at the foot.
- **Home screen:** signed in to a school, the installed app is the school's (its short name, its logo
  or initials on its colour). Swayvo's own icon only for Swayvo's own pages.

## 9. Trademark and naming status
Preliminary research found no conflicting SWAYVO marks; this is not clearance. Before launch: official
searches (UK IPO, EUIPO, USPTO, WIPO; classes 9, 41, 42) and secure swayvo.com (parked) or swayvo.app /
swayvo.co.uk (appeared unregistered). Technical identifiers (database names, storage keys, calendar
event ids, the `barre` folder) keep their original names on purpose.
