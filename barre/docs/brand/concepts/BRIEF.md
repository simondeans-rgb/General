# Concept board brief (shared by all three concepts)

You are a senior brand + product designer at an independent design studio. You are building ONE of three
competing creative concepts for a dance-school management app. Your concept's identity is defined in the
"Your concept" section of your task. This file defines what every concept must show, so the three can be
compared fairly: same screens, same content, same order.

## The product (real, already built — you are re-imagining its look and feel only)
A web app (installable on phones) for dance schools. Four roles:
- **Owner/office** (desktop + phone): today's classes, what needs attention (failed payments, medical updates,
  families waiting for a reply, trials to follow up, waiting lists), timetable by room, families, billing runs,
  enrolment pipeline, events/shows, reports, safeguarding.
- **Teacher** (phone first, used between classes in a busy studio): today's classes, one-tap register with
  medical markers, quick feedback after class, messages with families (office can read them).
- **Student** (teen/adult, phone): next class, teacher feedback, skills progress (levels: developing / secure /
  mastered; "not yet" is never shown as failure), personal goals, milestones (classes attended, first show),
  practice log.
- **Parent** (phone): each child's week, notices (moves, cancellations), payments, feedback for their children.
The product's idea: the technology carries the admin quietly so people can focus on dancing and teaching.
It must work for ballet, tap, contemporary, jazz, street/hip-hop, commercial, musical theatre, ballroom.

## Deliverable
ONE self-contained HTML file: `concept-<letter>.html` in your concept folder, plus the logo assets as separate
SVG files in the same folder: `logo.svg` (primary horizontal), `mark.svg` (standalone mark), `app-icon.svg`
(1024×1024, the icon), `logo-mono-light.svg`, `logo-mono-dark.svg`. The HTML embeds the same SVGs inline.
- Fonts: Google Fonts only (`<link href="https://fonts.googleapis.com/css2?...">`), all OFL-licensed, with
  fallback stacks. No other external resources: no images from the web, no JS libraries. Inline everything.
- Photography direction: you cannot use real photos. Where your concept relies on photography, make
  tasteful art-directed placeholders (CSS gradients/shapes suggesting the shot) AND label them in small text
  like "Photography: rehearsal, low side light, 35mm" so it's clearly a placeholder brief, never pretending to be a photo.
- The page commits to its own visual world (single theme is fine), but set `body` background and every colour explicitly.
- The page body must never scroll sideways at any width; it must be viewable on a phone (~400px): frames scale down.
- Put `<title>` = the concept's name (e.g. "Swayvo — Counts") near the top.

## Page structure (in this order)
1. **Cover**: name, logo, one-line concept, tagline.
2. **Strategy strip** (short): concept idea in 2–3 sentences, personality (3–5 words), tone-of-voice examples
   (one sentence each for: an owner alert, a teacher prompt, a student encouragement, a parent notice).
3. **Identity**: primary logo, alternative lockup (stacked or compact), standalone mark, app icon (at 180px and
   at 60px, plus a 32px and 16px favicon render), logo on dark and on light, monochrome versions, minimum size
   note, clear-space note. The logo must be ORIGINAL vector work (hand-built SVG paths/shapes), legible at 16px.
4. **Colour**: palette swatches with HEX and role (primary, secondary, accent, neutrals, semantic: success /
   warning / critical / info). State the rule for when brand colour is used in the UI (sparingly).
   Text on each background must meet WCAG AA (4.5:1 for body text) — check your values.
5. **Type**: display / body / numerals specimen with sizes, weights, the type scale.
6. **Graphic language**: the motif(s), icon style (stroke, size), motion principle (describe + one small CSS
   animation demo that respects `prefers-reduced-motion`).
7. **Product screens** (realistic content below — use it, don't invent other data):
   a. Sign in / first run — phone
   b. Owner "Today" — desktop (1280×800 artboard)
   c. Teacher today + the register open for 16:30 Junior Tap — phone (two screens side by side is fine)
   d. Student progress (Amir) — phone
   e. Parent home (Hannah, two children) — phone
   f. Week timetable by room — desktop (1280×800)
   g. Payment (Hannah pays INV-1088) — phone
8. **Marketing**: website landing hero (desktop 1280×720), an App Store screenshot (portrait), and one
   Instagram post (1080×1080 scaled).
9. **Concept notes**: strengths, weaknesses, risks, implementation complexity (low/medium/high) — honest.

Artboards: build each screen at its real size (phone 390×844, desktop 1280×800) inside a frame, and scale
frames down to fit the column with a small script (set a CSS variable to containerWidth/artboardWidth on load
and resize; use `transform: scale()` with a wrapper whose height is set accordingly). Phones may sit 2–3 per row
on desktop and stack on narrow screens. Give each artboard a small caption (e.g. "c · Teacher — register").

## Quality bar (non-negotiable — the client explicitly rejects these)
- No rounded-card-everything dashboards, no containers inside containers, no repeated identical stat tiles,
  no generic gradients, no heavy shadows, no icon beside every heading, no badge/pill overload, no
  oversized "Good morning" greeting banners, no decorative statistics, no stock illustration, no emoji.
- Each screen gets the layout its job needs (a register is a fast list with big tap targets; a timetable is a
  grid; progress can be expressive; payment is calm and exact). Screens differ but are clearly one product.
- Confident typography and hierarchy; real information density; deliberate negative space; aligned grid.
- Brand colour used sparingly in UI; functional colour (semantic) separate from brand.
- Touch targets ≥ 44px on phones. Body text ≥ 15px on phone screens, 16px for inputs.
- Status never by colour alone (pair with text or shape).
- Avoid dance clichés: no dancer silhouettes, ballet shoes, music notes, spotlights, generic figures.
  Avoid looking like a children's club. Must suit street dance as much as ballet.
- Avoid the common AI-generated looks: warm cream + serif + terracotta; near-black + single acid-green pop;
  broadsheet hairline-rule newspaper layouts; purple-to-blue gradient heroes; everything centred.

## Shared content (synthetic demo data — use exactly)
School: **Northstar Dance Academy**, Greenwich & Blackheath, London. Autumn term, week 11 of 13.
Today is **Thursday 26 November**.

Owner (Freya Lindqvist) — Today:
- Classes today: 16:30 Junior Tap (Marcus Bell, Studio Two, 12/16, 1 trial); 18:30 Senior Tap (Marcus, Main Hall, 11/16);
  19:00 Contemporary Seniors (Priya Raman, Studio One, 14/18); 20:00 Adult Contemporary drop-in (Priya, Studio One, 9/20).
- Needs attention: 3 card payments failed (£162.00); 1 medical update to acknowledge (Nia Wright — new inhaler);
  4 families waiting for a reply (oldest 2 days); 5 trials attended, not yet enrolled; Grade 3 Ballet full — 8 waiting.
- Money: £612.00 outstanding across 8 families; £2,088.00 collected in the last 30 days.
- Attendance last 4 weeks: 91%. Places filled: 68% (143 of 210).

Teacher (Marcus Bell) — today: 16:30 Junior Tap (Studio Two), 18:30 Senior Tap (Main Hall). Register for
Junior Tap (12 + 1 trial): Sofia Ackah, Idris Adeyemi, Elias Bennett, Kai Doherty (medical: asthma — inhaler in bag),
Nia Doherty, Zara Ellery, Ottilie Ferreira, Jonah Grant (medical: nut allergy — urgent), Sena Hussain, Leo Mensah,
Ruby Okafor, Amara Quinn, and **Layla Haddad (trial)**. Show 7 marked present, 1 absent (Elias), rest unmarked.

Student (Amir Wright, 15) — Contemporary Seniors (Thu 19:00, Priya Raman, Studio One), Senior Tap, Street Seniors.
Latest feedback from Priya (Thu 19 Nov): "Your spirals have real control now. Keep the breath going through the release."
Contemporary skills: Floorwork — secure; Contraction and release — secure (up from developing); Spirals — secure;
Balance — developing; Travelling — developing; Musicality — mastered.
Goal: "Clean double pirouette by the spring show" (set with Priya). Milestone just reached: 50 classes. Practice this week: 45 min.

Parent (Hannah Wright) — children: **Nia (9)**: Grade 2 Ballet Tue 17:30 (Freya, Studio One), Grade 3 Ballet Wed 17:30;
**Amir (15)**: as above. Notices: "Grade 2 Ballet on Tue 1 Dec moves to Studio Two"; "Summer Show costume sizes due by 4 Dec".
Payments: INV-1088, Spring term, **£186.00 due 10 Dec** (Nia: Grade 2 Ballet £84.00, Grade 3 Ballet £96.00 less
sibling discount £9.60; Amir: Senior Tap drop-in pack £15.60 — total £186.00). Last paid: INV-1041 £54.00 on 5 Nov.
Pay by card or Apple Pay; or bank transfer, reference NDA-1088.

Week timetable (Mon 23 – Sat 28 Nov), rooms: Greenwich · Studio One, Greenwich · Studio Two, Blackheath · Main Hall:
Mon 16:00 Pre-School Ballet (Freya, Studio One); Mon 17:00 Primary Ballet (Freya, Studio One);
Tue 16:00 Modern Juniors (Priya, Main Hall); Tue 16:30 Junior Tap (Marcus, Studio Two); Tue 17:30 Grade 2 Ballet (Freya, Studio One);
Wed 16:30 Street Juniors (Tomasz Wójcik, Main Hall); Wed 17:30 Grade 3 Ballet (Freya, Studio One) — full, 8 waiting;
Thu 16:30 Junior Tap (Marcus, Studio Two); Thu 18:30 Senior Tap (Marcus, Main Hall); Thu 19:00 Contemporary Seniors (Priya, Studio One);
Thu 20:00 Adult Contemporary drop-in (Priya, Studio One);
Fri 17:30 Street Seniors (Tomasz, Main Hall) — **cancelled: teacher unwell**;
Sat 09:15 Grade 1 Ballet (Freya, Studio One); Sat 10:30 Jazz Intermediate (Tomasz, Main Hall).
Style colours/marks may distinguish ballet, tap, contemporary/modern, street, jazz — but always with the name.

## Process
1. Read this brief and your concept section. Plan tokens first (colour, type, spacing) at the top of the CSS.
2. Build the HTML and SVGs.
3. Render it once with Playwright (pre-installed: `require('playwright')` works; `chromium.launch()` needs no options)
   at 1440px wide (full page) and at 400px wide, look at the screenshots, fix what is broken or below the bar.
   Then do ONE more check-and-fix pass at most. Save the final screenshots as `board-desktop.png` and `board-phone.png`
   in your folder.
4. Reply with: file paths, the colour + type choices, and an honest 5-line self-critique.
Do not touch anything outside your concept folder. Do not edit the app repository.
