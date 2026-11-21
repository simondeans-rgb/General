# Third-party components

| Component | Version | Licence | Where |
|---|---|---|---|
| htm (with bundled Preact standalone build) | 3.1.1 | Apache-2.0 (htm), MIT (Preact) | `src/vendor/preact-htm.js`, licences in `src/vendor/LICENSE-htm.txt` and `src/vendor/LICENSE-preact.txt` |
| docx (browser build, minified, loaded only when exporting a Word pack) | 9.5.1 | MIT. Its bundled helpers (JSZip, pako, xml-js, sax, nanoid, hash.js and Node polyfills) are MIT, ISC or Zlib licensed; JSZip is dual MIT/GPLv3 and is used under MIT | `src/vendor/docx.min.js`, licence in `src/vendor/LICENSE-docx.txt` |
| Nunito typeface (via @fontsource/nunito) | 5.1.0 | SIL Open Font License 1.1 | `assets/fonts/`, licence in `assets/fonts/OFL.txt` |

There are no runtime dependencies beyond these and no analytics. The only network call is the currency converter's exchange-rate request (see the README).
Development-only tools: Node.js (built-in test runner) and Playwright with
Chromium for the end-to-end checks and icon rendering. Neither ships with the app.

The ACTED competency library, interview questions and guidance in `content/interview.json`
are the client's own content (from the aHRcade interview pack tool), used with permission.
