# Seven-Zone Time Converter

Converts times and money between the places you work with. Time is on the left
and currency on the right; on a phone they stack.

## Time

Set the time or date in any location and the others update to match. It starts
with seven regions:

| Region | Time zone used |
|---|---|
| USA (Maryland) | US Eastern (`America/New_York`) |
| UK | GMT / BST (`Europe/London`) |
| Europe | Central European (`Europe/Paris`) |
| Dubai | Gulf Standard (`Asia/Dubai`) |
| India | India Standard (`Asia/Kolkata`) |
| China | China Standard (`Asia/Shanghai`) |
| Australia | Australian Eastern (`Australia/Sydney`) |

- Opens on the current time and keeps ticking until you change something. **Back to now** returns to it.
- Daylight saving is worked out by the browser for whatever date you pick.
- The **Across the day** grid shows the next 24 hours for every region, shaded for
  office hours, early morning or evening, and night. Select any hour to jump to it.
- **Copy all times** copies a plain-text list for an email or meeting invite.
- **+ Add a location** searches about 70 cities and countries. Use the × on a row
  to remove it, and **Reset to the original seven** to go back. The list is saved
  in the visitor's browser.

## Currency

Shows one amount in the currency of every listed location, starting at £1 GBP.
Typing an amount in any currency updates all the others. Adding a location adds
its currency, unless it's already listed.

- Rates come from the free [Exchange Rate API](https://www.exchangerate-api.com)
  (`open.er-api.com`). It needs no key and updates once a day. If it can't be
  reached, the page tries the free
  [currency-api](https://github.com/fawazahmed0/exchange-api) project.
- If neither source loads, the page uses saved rates from 18 Nov 2026 and says so.
  That also happens inside Claude, where pages can't fetch outside data.
- Rates refresh every hour while the page is open, or straight away with **Refresh rates**.

Everything is in `index.html`, with no build step. The only outside requests are
two Google Fonts and the exchange-rate API. On GitHub Pages it is served at `/time-converter/`.
