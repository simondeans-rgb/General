# Accessibility assessment (WCAG 2.2 AA), v1.7

Plan item P2.5. Carried out 21 November 2026 on the v1.7 build.

## How it was tested

| Check | Tool / method | Coverage | Result |
|---|---|---|---|
| WCAG 2.0/2.1/2.2 A and AA rules | axe-core 4.10.2 in Chromium (Playwright) | 38 screens (incl. the v1.8 guides) × light and dark × 375px and 1440px (152 runs) | **0 violations** after fixes |
| Best-practice rules | axe-core `best-practice` tag | 21 screens at 375px | 0 violations after fixes |
| Colour contrast | axe-core `color-contrast` (text and UI) | as above, both themes | Pass |
| Touch target size (2.5.8, AA) | axe-core `target-size` + `npm run e2e` check | all main screens | Pass (24px minimum; most controls are 44px) |
| Reflow (1.4.10) | No horizontal scrolling at 320, 375, 500 and 1440px | 22 screens | Pass |
| Resize text (1.4.4) | Root text set to 200% at 375px | 22 screens | Pass, no sideways scrolling or clipped controls |
| Focus visible (2.4.7) | Script focuses each control and checks for an outline, ring or focus-within style | 21 screens | Pass |
| Headings | One `h1` per screen (`npm run e2e`) | 22 screens | Pass |
| Labels and names | Every input has a label; every button has a name (`npm run e2e`) | main forms and tools | Pass |
| Keyboard | Tabs use arrow keys, Home and End; dialogs trap focus, close with Escape and return focus; skip link | e2e checks plus manual review in Chromium | Pass |
| Reduced motion | `prefers-reduced-motion` turns off animation | CSS review | Pass |

The axe runs are repeatable: see the commands in the README. The size, heading, label and reflow checks run on every `npm run e2e`.

## Fixed in this audit

- Checkboxes were 22×22px (below the 24px minimum): now 24px.
- Home had no `h1`: the logo is now the page heading, so focus moves there after navigation.
- At 200% text: the Search box, form section headings (with their "Included" switch) and guide cards pushed past the screen edge. They now wrap and shrink.
- The search box's focus indicator was a border colour change only: it now has the same focus ring as other fields.
- Desktop: lists and tiles use the width (two-up lists, wider tiles) from 1024px; reading screens (guides, forms, preview, tools, info pages) stay at a comfortable 760px measure.

## Documented exceptions and limits

- **Screen readers have not been tested on real devices.** Semantics were checked automatically: roles, names, headings, live regions, warnings marked "Warning:" for screen readers, and dialog labelling. Testing with VoiceOver (iOS) and TalkBack (Android) is still needed and is a human release gate (spec AC-17).
- **Browser zoom and the operating system's text size** behave like the 200% root-size test in Chromium, but haven't been tried on iOS Safari or Android Chrome devices.
- **Third-party pickers:** the native date picker is the browser's own; its accessibility depends on the device.
- **Privacy cover (P3):** it can briefly hide content when switching apps; that's intended.
