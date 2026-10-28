# Seven-Zone Time Converter

Set the time or date in any of seven regions and the other six update to match:

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

Everything is in `index.html`, with no build step and no dependencies apart from
two Google Fonts. On GitHub Pages it is served at `/time-converter/`.
