// Non-personal preferences (spec Section 3.1). This is the ONLY thing SayWotNow
// writes to device storage. Keys outside this allow-list are never saved, and
// nothing typed into a template, guide checklist, tool or search box comes here.

const STORAGE_KEY = 'saywotnow.prefs.v1';

export const DEFAULTS = Object.freeze({
  onboardingComplete: false,
  disclaimerAcceptedVersion: '',
  favourites: [],
  hrContactEmail: '',
  hrContactPhone: '',
  defaultOneToOneMode: 'full',
  emailFooterEnabled: true,
  savedTimeZones: [],
  holidayNation: 'ew',
  savedCurrencyPlaces: [],
  currencyRates: null,
  contentVersionSeen: '',
  theme: 'system',
});

const ALLOWED = new Set(Object.keys(DEFAULTS));

function sanitise(key, value) {
  const d = DEFAULTS[key];
  switch (key) {
    case 'favourites':
      return Array.isArray(value) ? value.filter((v) => /^[A-Za-z0-9_-]{1,24}$/.test(v)).slice(0, 100) : d;
    case 'savedCurrencyPlaces':
      return Array.isArray(value) ? value.filter((v) => typeof v === 'string' && /^[^|]{1,60}\|[^|]{1,60}$/.test(v)).slice(0, 8) : d;
    case 'currencyRates': {
      // Downloaded exchange rates (public data, not personal). Numbers only.
      if (!value || typeof value !== 'object' || !value.rates) return null;
      const rates = {};
      for (const [k, v] of Object.entries(value.rates)) if (/^[A-Z]{3}$/.test(k) && typeof v === 'number' && Number.isFinite(v) && v > 0) rates[k] = v;
      return { base: 'USD', rates, updated: Number(value.updated) || 0, fetched: Number(value.fetched) || 0 };
    }
    case 'savedTimeZones':
      return Array.isArray(value) ? value.filter((v) => typeof v === 'string' && v.length < 64).slice(0, 6) : d;
    case 'defaultOneToOneMode':
      return value === 'quick' ? 'quick' : 'full';
    case 'holidayNation':
      return ['ew', 'sc', 'ni'].includes(value) ? value : 'ew';
    case 'theme':
      return ['system', 'light', 'dark'].includes(value) ? value : 'system';
    default:
      if (typeof d === 'boolean') return !!value;
      if (typeof d === 'string') return typeof value === 'string' ? value.slice(0, 254) : d;
      return d;
  }
}

let cache = null;
const listeners = new Set();

function storage() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function loadPrefs() {
  if (cache) return cache;
  let stored = {};
  try {
    const raw = storage()?.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) || {};
  } catch { stored = {}; }
  const out = { ...DEFAULTS };
  for (const k of Object.keys(stored)) if (ALLOWED.has(k)) out[k] = sanitise(k, stored[k]);
  cache = out;
  // Anything stored under a key that's no longer allowed (e.g. interviewPacks and
  // bradfordBands from retired tools in v1.4) is deleted from the device straight away.
  if (Object.keys(stored).some((k) => !ALLOWED.has(k))) {
    try { storage()?.setItem(STORAGE_KEY, JSON.stringify(out)); } catch { /* storage unavailable */ }
  }
  return cache;
}

export function getPrefs() {
  return loadPrefs();
}

export function setPref(key, value) {
  if (!ALLOWED.has(key)) throw new Error(`"${key}" is not an allowed preference`);
  const next = { ...loadPrefs(), [key]: sanitise(key, value) };
  cache = next;
  try { storage()?.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage unavailable: keep in memory */ }
  listeners.forEach((fn) => fn(next));
  return next;
}

export function toggleFavourite(id) {
  const favs = loadPrefs().favourites;
  return setPref('favourites', favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]);
}

export function subscribePrefs(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** For tests. */
export function _resetPrefsCache() { cache = null; }
