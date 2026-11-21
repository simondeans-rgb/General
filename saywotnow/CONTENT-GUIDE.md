# Editing SayWotNow content

All the words in SayWotNow (guides, templates, home tiles, tool help and the
static pages) live in six files in `content/`. You can change them without
touching any code.

| File | What's in it |
|---|---|
| `home.json` | The "I need to…" tiles and favourites wording |
| `templates.json` | Meeting templates: sections, fields, email subject and opening, HR banners |
| `guides.json` | Conversation guides: Before / During / After, HR triggers, summary prompts |
| `prep.json` | 1-minute prep cards: three questions to ask, one thing to avoid, one to remember |
| `reactions.json` | The shared "If they react…" library |
| `tools.json` | Toolkit names, "How this works" text, notes and SBI examples |
| `pages.json` | Onboarding, disclaimer, privacy statement, About, support email |
| `timezones.json` | Places you can search in the time zone and currency converters, and the time zone defaults |
| `currencies.json` | Each country's currency, the currency converter's default locations, and the fallback exchange rates |

## Making a change

1. Edit the file in any text editor (or on GitHub, using the pencil icon). Keep
   the quotes, commas and brackets exactly as they are around your text.
2. Use UK spelling, plain English and short sentences. Speak to the manager as "you".
3. Update `lastReviewed` (e.g. `"2027-01-20"`) at the top of the file. If the change
   is significant, bump `contentVersion` (e.g. `"1.0.0"` → `"1.1.0"`).
4. Run `npm run validate`. It tells you exactly what's wrong and where, for example
   `content/guides.json at .guides[3]: unknown property "flagLevle" (check the spelling)`.
5. Bump `VERSION` in `sw.js` (e.g. `saywotnow-1.0.0-2`) so installed apps pick up the
   change, then ask for a release.

## Common changes

**Change a guide's wording.** Find the guide by its `id` (e.g. `"G02"`) in
`guides.json` and edit the text in `before`, `opening`, `during`, `donts`,
`hrTriggers` or `after`. Each is a list, with one item per line in quotes,
separated by commas.

**Change a "Say it like this" line.** Each guide has a `sayIt` list. Each item
has `when` (a short label, e.g. `"Raising it"`) and `line` (the words to say).
Don't add quote marks around `line`: the app adds them. Use [square brackets]
for anything the manager should change.

**Change a 1-minute prep card.** Find the card in `prep.json` (e.g. `"P-G05"`).
`ask` must have exactly three questions; `avoid` is one line; `remember` is
optional. `target` says which guide or template the card belongs to and where
its button goes: `{ "type": "guide", "id": "G05" }`,
`{ "type": "template", "id": "T03" }`, or `{ "type": "oneToOne" }` for the
regular 1:1 (shared by the full and quick versions). Every guide needs a card;
the check will tell you if one is missing.

**Change an HR flag level.** Set `flagLevel` to `1` (Good to know), `2` (Consider
HR advice) or `3` (Contact HR first).

**Change the disclaimer.** Edit `disclaimer.text` in `pages.json` and change
`disclaimer.version` (e.g. `"1.1"`). Everyone will see the disclaimer again and
must accept it.

**Change a home tile.** Edit `label`, or point `target` at a different item:
`{ "type": "guide", "id": "G05" }`, `{ "type": "template", "id": "T03" }`,
`{ "type": "tool", "id": "holiday" }` or `{ "type": "screen", "id": "conversations" }`.

**Add a field to a template.** Copy a similar field in `templates.json` and give it
a new, unique `id` (letters and numbers, no spaces). Field types: `shortText`,
`longText`, `email`, `date`, `dateRange`, `number`, `rating`, `singleChoice`,
`multiChoice`, `checklist`, `actionList`, `repeater`. To show a field only
sometimes, add for example
`"showIf": { "field": "outcome", "equals": "Probation extended" }`.
Make it required in the same way with `requiredIf`.

**Add a guide.** Copy an existing guide in `guides.json`, give it the next id
(`"G16"`) and fill in every part, including `sayIt`. It appears in Conversations
and search automatically. Add a 1-minute prep card for it in `prep.json` too.

If `npm run validate` says "Content OK", the app will load your changes.
