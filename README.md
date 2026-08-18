# Placemap

A custom map builder. Pick a home location, plot the places that matter, and see
**walking, cycling and driving** routes and times to every one of them at once.

Everything lives in a single self-contained `index.html`. No build step, no
server, no API keys, no account.

![Placemap](docs/screenshot.jpg)

## Try it

Open `index.html` in a browser, or host the file anywhere static (GitHub Pages,
Netlify, an S3 bucket). Hosting it is preferable to opening it from disk — some
browsers restrict `localStorage` on `file://` URLs, which disables the save
feature.

## What it does

**Home location** — search for an address, use your device's location, or click
the map. Drag the pin to nudge it; routes recalculate automatically.

**Places** — add them one at a time:
- type an address, place name or postcode and pick from the suggestions
- arm "Click map to add" and drop as many pins as you like
- paste a whole list at once (`Label | Address` per line, or raw `lat, lon`)

Each place gets its own colour, an editable name and a free-text note. Pins are
draggable.

**Travel modes** — walking, cycling and driving are each a toggle. Every enabled
mode is drawn for *every* place simultaneously:

| | |
|---|---|
| Colour | which place the route goes to |
| Line style | dotted = walking, dashed = cycling, solid = driving |

Hover a route, a place card or a summary row and everything else dims, so a busy
map stays readable.

**Summary table** — time and distance for every place × mode, with the quickest
mode for each place highlighted. Export it as CSV.

**Save & share** — maps are kept in `localStorage` (auto-saved, plus named saves
you can reload), exportable as a JSON file, and shareable as a link that encodes
the whole map in its fragment. Nothing is ever sent to a server of ours, because
there isn't one.

Distances switch between kilometres and miles from the header.

## Services used

All key-free and free to use:

| Purpose | Service |
|---|---|
| Map tiles | [OpenStreetMap](https://www.openstreetmap.org/copyright) |
| Address search / reverse geocoding | [Nominatim](https://nominatim.openstreetmap.org/) |
| Routing (foot / bike / car profiles) | [OSRM](https://project-osrm.org/) hosted by [FOSSGIS](https://routing.openstreetmap.de/) |
| Map library | [Leaflet 1.9.4](https://leafletjs.com/) via unpkg (SRI-pinned) |

These are volunteer-funded public endpoints, so the app plays by their rules:
geocoding requests are funnelled through a single queue spaced 1.1 s apart, and
routing requests are capped at four in flight. For heavy or commercial use,
swap in a paid provider — `MODES[].hosts` and the `NOMINATIM` constant are the
only two places that need to change.

## Caveats

- Times are model estimates. There is no live traffic, and cycling times ignore
  hills and your legs.
- Routes are calculated one-way, home → place.
- OSRM occasionally can't connect a dropped pin to the road network (an island,
  a pedestrianised courtyard); those cells read "no route".

## Licence

Map data © OpenStreetMap contributors, [ODbL](https://www.openstreetmap.org/copyright).
