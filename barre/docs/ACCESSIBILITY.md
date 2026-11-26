# Accessibility

Target: WCAG 2.2 AA, in both styles (Classic and Urban) and with any school colours.

## Automated (every change)

- `npm test` checks the contrast of both styles' tokens and of the colours a school picks (`tests/themes.test.ts`).
- `npm run a11y` runs axe-core in Chromium over every main screen, for the public page, the office,
  teachers, families and an Urban-style school, at desktop and phone sizes. It fails on any serious or
  critical WCAG 2.2 AA issue. Start the app first (`npx next dev -p 3000`), or set `BASE_URL`.

Last run: no serious or critical issues on 58 screen checks. Fixed on the way: amber text contrast,
faded (opacity) cancelled sessions, unlabelled icon-only buttons on phones, an unlabelled file input,
a link distinguished only by colour, and a help button whose tap target was partly covered.

## Manual (before the pilot, and after large changes)

Automated tools find perhaps a third of real problems. A person should check, with:

| Tool | Platform | Screens |
|---|---|---|
| VoiceOver | iPhone (Safari) | Family home, messages, children, payments; teacher register and feedback grid |
| TalkBack | Android (Chrome) | The same |
| NVDA | Windows (Firefox/Chrome) | Office: billing runs, enrolment board, schedule grid, settings |
| Keyboard only | Any desktop browser | Everything above; every dialog closes with Escape and returns focus |
| 200% and 400% zoom, 320px width | Any | No loss of content or function |

Known points to check by hand:
- The enrolment board and week grid support drag and drop; each card also has a "Move to" menu (board)
  or opens a sheet with Move (grid), so neither depends on dragging.
- Register marking uses grouped buttons with `aria-pressed`; confirm the state is announced.
- Notifications and toasts use `role="status"`; confirm they are announced once.
