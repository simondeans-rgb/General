# Third-party components

| Component | Version | Licence | Where |
|---|---|---|---|
| htm (with bundled Preact standalone build) | 3.1.1 | Apache-2.0 (htm), MIT (Preact) | `src/vendor/preact-htm.js`, licences in `src/vendor/LICENSE-htm.txt` and `src/vendor/LICENSE-preact.txt` |
| Nunito typeface (via @fontsource/nunito) | 5.1.0 | SIL Open Font License 1.1 | `assets/fonts/`, licence in `assets/fonts/OFL.txt` |

There are no runtime dependencies beyond these, no analytics and no network calls.
Development-only tools: Node.js (built-in test runner) and Playwright with
Chromium for the end-to-end checks and icon rendering. Neither ships with the app.
