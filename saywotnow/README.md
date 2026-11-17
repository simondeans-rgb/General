# SayWotNow

> Lost for words? We've got you.

Practical, in-the-moment support for line managers: 1:1s, reviews and difficult
conversations. **Nothing a manager types is ever stored or sent anywhere.**

Built from the *Pocket HR App Build Specification v1.0 (MVP)*, as an installable,
fully offline web app (PWA) with the SayWotNow brand (Plum, Teal, Amber, Lilac,
Cream; Nunito).

| | |
|---|---|
| Meetings | 8 templates (T01–T08) rendered by one form engine from `content/templates.json` |
| Conversations | 15 guides (G01–G15) rendered by one guide screen from `content/guides.json`, plus the shared "If they react…" library |
| Toolkit | Holiday, notice period, Bradford Factor and SBI feedback builder. The time zone converter and interview pack generator are placeholders until their existing code is supplied (spec Q3). |
| Settings | HR contact, default 1:1 format, email footer, Bradford bands, appearance, About / Disclaimer / Privacy / Content information |

## Run it

No build step and no dependencies. Serve the folder with any static server:

```sh
cd saywotnow
npm run serve          # python3 -m http.server 8765
# open http://127.0.0.1:8765/
```

It must be served over `http(s)`, not opened as a `file://`, because the service
worker and ES modules need an origin. On GitHub Pages it's served at
`/saywotnow/`. On a phone, open the URL and choose **Add to Home Screen**.
After the first visit it works in airplane mode.

## Check it

```sh
npm run validate   # content files against content/schema/*.json + cross-references + offline file list
npm test           # unit tests: template engine, email builder, search, all calculators (node --test)
npm run e2e        # browser acceptance checks in Chromium (needs Playwright)
```

`npm run e2e -- --shots <dir>` also saves screenshots of the key screens in light and dark.

## How it's built

```
index.html            CSP allows only the app's own files (no third-party requests)
sw.js                 caches every file on install, so it runs offline
content/*.json        ALL text content (see CONTENT-GUIDE.md) + schema/ for validation
src/lib/              pure logic, unit tested: engine, email, search, rules, dates, calc/*
src/ui/               screens (Preact + htm, vendored, no build)
src/prefs.js          the ONLY thing written to device storage: an allow-list of preferences
src/strings.js        en-GB interface strings (buttons, errors)
assets/               stylesheet, Nunito fonts (OFL), app icons
scripts/              content validator, e2e checks, icon renderer
```

## Privacy safeguards (spec Section 3) on the web

| # | Requirement | How it's met here |
|---|---|---|
| P1 | Form data in memory only | Held in a JavaScript object. Cleared on send, discard, leaving the form, reload or close. |
| P2 | No state restoration | Nothing is written to `localStorage`, `sessionStorage`, IndexedDB, cookies or the URL. Inputs use `autocomplete="off"`. The e2e suite checks storage and URL after typing. |
| P3 | Privacy screen | A branded cover is shown on `visibilitychange`/`pagehide` (and `blur` on touch devices). **Best effort:** browsers don't guarantee the cover is painted before the OS takes its app-switcher snapshot. |
| P4 | No network | Content Security Policy only allows the app's own origin. Once installed, the service worker serves everything from cache. The first visit must download the app. |
| P5 | No third-party SDKs | None. The only third-party code is the vendored Preact/htm UI library and the Nunito font, both served locally. |
| P6 | Clipboard expiry | Copy fallback asks the browser to clear the clipboard after 2 minutes. **Best effort:** this only works while the app is open and in front. Browsers can't mark clipboard content as sensitive. |
| P7 | No keyboard learning | `spellcheck="false"` (which also stops browsers sending text to cloud spellcheckers), `autocorrect="off"`. Web pages can't switch off the keyboard's own learning. |
| P8 | Backups | Only the preferences allow-list is ever stored. |

## Where the web differs from the native spec

- **Mail result.** `mailto:` doesn't report whether the email was sent, so the app
  uses the spec's Android behaviour on every platform. When you come back it asks
  "Did your email send?" ("Yes, clear the form" / "It's in my drafts" / "No, go
  back"), with a "Mail didn't open?" route to the Share and Copy fallbacks. Those
  fallbacks are also always available from "No mail app?" on the preview screen.
- **Rate the app** isn't shown (there's no store). **Send feedback** appears once
  `supportEmail` is set in `content/pages.json`.
- **Very long emails.** Some mail apps truncate very long `mailto:` links. If that
  happens, the Share and Copy fallbacks send the full text.
- **Appearance** has an Automatic / Light / Dark setting (Automatic follows the system).

## Decisions and assumptions

- "Pocket HR" copy is renamed to SayWotNow throughout, including the email footer.
- HR flag colours stay as the spec's semantic blue/amber/red (darkened slightly
  for text contrast) so warning levels stay distinct from the brand palette.
- The spec only gives the end labels for some rating scales. I filled in the
  middle labels: Stay interview 1–5 = Not at all, A little, Somewhat, Quite, Very.
  New starter 1–5 = Finding it hard, Getting there, OK, Settling in well,
  Settling in really well.
- G07 Bereavement opens a short version of T08 (topic and "what we discussed"
  only). G10's "What we discussed" prompt isn't in the spec, so I wrote one.
- T04 "Not confirming" sends to HR only, with a short covering line asking for
  advice. "Send to employee instead" is behind a confirmation.
- For the holiday statutory check, when the entitlement excludes bank holidays,
  8 bank holidays (England and Wales), pro-rated, are added before comparing.
- A checklist with nothing ticked counts as empty and is left out of the email.

## Still needed from the client

1. Time zone converter and interview pack generator source (spec Q3).
2. Support email (spec Q5): set `supportEmail` in `content/pages.json`.
3. Content review by an HR professional or employment lawyer (spec Q4).
