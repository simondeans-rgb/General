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
| Home | "I need to…" tiles, search, favourites, and **1-minute prep**: a card for each meeting type and guide with three questions to ask, one thing to avoid and one to remember (`content/prep.json`). It opens from Home as its own screen, or as a sheet from a guide or template, so nothing typed into a form is lost |
| Conversations | 15 guides (G01–G15) rendered by one guide screen from `content/guides.json`, plus the shared "If they react…" library. Each guide's During tab has **Say it like this**: copy-ready lines (`sayIt`), each with Copy and a large-text view for reading straight off the screen |
| Toolkit | Time zone converter (ported from the Worldly Explorer world clock), currency converter (live rates), holiday and notice period calculators (UK rules), and SBI feedback builder. The Interview Pack Builder and Bradford Factor were removed in v1.5 (owner decision). |
| Settings | HR contact, default 1:1 format, email footer, appearance, About / Disclaimer / Privacy / Content information |
| Safety | **HR-first gate** on "Contact HR first" guides (G03, G13): a warning panel above all scripts, with triage questions and holding words that never certify a situation as safe. "UK guidance" labels on guides and UK calculators. |

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
npm run register   # writes review/REGISTER.md from review/register.json
```

Baseline for v1.5 Phase 0 (21 Nov 2026, before changes): validator OK, 92 unit tests, 28 browser checks.

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
| P2 | No state restoration | Nothing typed into a template, guide or tool is written to `localStorage`, `sessionStorage`, IndexedDB, cookies or the URL. Inputs use `autocomplete="off"`. The e2e suite checks storage and URL after typing. |
| P3 | Privacy screen | A branded cover is shown on `visibilitychange`/`pagehide` (and `blur` on touch devices). **Best effort:** browsers don't guarantee the cover is painted before the OS takes its app-switcher snapshot. |
| P4 | No network | **One agreed exception: the currency converter's exchange rates** (see below). Otherwise the Content Security Policy only allows the app's own origin, and once installed the service worker serves everything from cache. The first visit must download the app. |
| P5 | No third-party SDKs | None. The only third-party code is the vendored Preact/htm UI library and the Nunito font, both served locally. |
| P6 | Clipboard expiry | Copy fallback asks the browser to clear the clipboard after 2 minutes. **Best effort:** this only works while the app is open and in front. Browsers can't mark clipboard content as sensitive. |
| P7 | No keyboard learning | `spellcheck="false"` (which also stops browsers sending text to cloud spellcheckers), `autocorrect="off"`. Web pages can't switch off the keyboard's own learning. |
| P8 | Backups | Only the preferences allow-list is ever stored (see the storage inventory below). |

### Local storage inventory (P0, v1.5)

Everything SayWotNow keeps on the device is one `localStorage` entry, `saywotnow.prefs.v1`, plus the service worker's offline cache of the app's own files (`saywotnow-<version>`).

| Key in `saywotnow.prefs.v1` | What it holds |
|---|---|
| `onboardingComplete`, `disclaimerAcceptedVersion` | Whether the introduction was seen and which disclaimer version was accepted |
| `favourites` | IDs of favourite guides, templates and tools |
| `hrContactEmail`, `hrContactPhone` | The HR contact the manager enters |
| `defaultOneToOneMode`, `emailFooterEnabled`, `theme` | Preferences |
| `savedTimeZones`, `savedCurrencyPlaces`, `currencyRates` | Chosen places and the last downloaded exchange rates (numbers only) |
| `holidayNation` | England and Wales, Scotland or Northern Ireland |
| `contentVersionSeen` | Content version shown in "what's new" |

Never stored: anything typed into a form, guide checklist or tool, search terms, gate answers, the "include wellbeing" choice. Keys from retired features (`interviewPacks`, `bradfordBands`) are deleted on first launch of v1.5.

### Currency converter: the one network request

At the client's request, the currency converter uses live rates. This is a
deliberate exception to P4 and acceptance test AC-05. It's kept as small as possible:

- **What's sent.** One fixed request, `GET https://open.er-api.com/v6/latest/USD`
  (the Exchange Rate API's free open endpoint, no key), sent without cookies or a
  referrer. Amounts and locations are never sent. The service can see the device's
  internet address, as with any website.
- **When.** Only when the currency page is opened, and at most once an hour.
  "Update rates" fetches on demand.
- **Content Security Policy.** It allows that one host for `connect-src`, and the
  validator checks the policy and the URL match `content/currencies.json`.
- **Offline.** The app uses the last downloaded rates (saved as the
  `currencyRates` preference, which is public data), then the rates bundled in
  `content/currencies.json`. The page always says which rates it's using and how
  old they are.
- **Credit.** The free terms require the on-screen credit "Rates by Exchange Rate API".
- **Store declarations.** "Data Not Collected" still holds, since no user data is
  sent. But the privacy statement and the app review notes must mention the rates
  request. The in-app privacy statement already does.
- **Bundled rates.** Refresh them each release by updating
  `bundledRates` in `content/currencies.json`.


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
  the usual number of bank holidays for the nation chosen in the calculator is
  added, pro-rated, before comparing: 8 in England and Wales, 9 in Scotland,
  10 in Northern Ireland. The chosen nation is remembered (`holidayNation`, a
  non-personal preference); the figures entered are not.
- **New content written for v1.3** (needs the same HR review as the rest, see
  "Still needed"): the "Say it like this" lines in each guide and every card in
  `content/prep.json`. They're drawn from each guide's own advice, and words in
  [square brackets] are for the manager to fill in.
- A checklist with nothing ticked counts as empty and is left out of the email.
- **Wellbeing and health in emails (v1.5).** Fields marked `sensitive` in
  `content/templates.json` (T01/T02 wellbeing rating and comments, T03 reason for
  absence and fit note) are left out of the email, copy and share unless the manager
  switches on "Include wellbeing and health details" for that email.
- **HR-first gate (v1.5).** Its wording (`escalation` in G03 and G13) is new, drafted
  from each guide's own advice and marked as draft until reviewed.
- **Currency converter.** It uses the same places as the time zone converter. Each
  place's currency comes from its country, via `countryCurrency` in
  `content/currencies.json`. The defaults are the same seven locations: USD, GBP,
  EUR, AED, INR, CNY and AUD. You can compare up to 8 locations, saved as
  `savedCurrencyPlaces`. The amount you type isn't stored.
- **Time zone converter.** This is ported from worldly-explorer.com/worldclock.html and
  keeps its Intl-based maths, live "now", ±15 min / ±1 h buttons, "Copy all times"
  and tappable 24-hour planner. Its seven regions are the defaults: the device's
  zone plus the other six. The spec's rules are followed where the two differ:
  working hours are 08:00–18:00 (green), 07:00–08:00 and 18:00–20:00 (amber), and
  grey otherwise, rather than the original's 9–6 office hours. Weekends are grey.
  You can compare up to 6 zones, searched by city or country from
  `content/timezones.json`, or by any time zone name the device knows. The list is
  saved as `savedTimeZones`. The "from" zone and the time you set are not saved.

## Still needed from the client

1. Support email (spec Q5): set `supportEmail` in `content/pages.json`.
2. Content review by an HR professional or employment lawyer (spec Q4). The
   register in `review/` lists every item, its risk and the issues found; the
   release gate is a named reviewer approving the high-risk items.
3. An owner for the review register (every entry is "Unassigned" for now).
