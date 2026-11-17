import { html } from '../vendor/preact-htm.js';

// Outlined 24px icons (stroke = currentColor). Decorative unless given a label.
const P = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  meetings: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 12h8M8 16h5',
  conversations: 'M4 5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM16 9h4a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1v3l-4-3h-4a1 1 0 0 1-1-1v-1',
  toolkit: 'M3 9h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM8 9V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M3 13h18M10 12v3M14 12v3',
  toolbox: 'M3 9h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM8 9V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M3 13h18M10 12v3M14 12v3',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  back: 'M15 5l-7 7 7 7',
  chevron: 'M9 5l7 7-7 7',
  down: 'M5 9l7 7 7-7',
  close: 'M6 6l12 12M18 6 6 18',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5',
  warning: 'M12 3.5 2.5 20h19zM12 10v4.5M12 17.2v.3',
  alert: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v6.5M12 16.5v.5',
  copy: 'M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  mail: 'M3 6h18v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 6l9 7 9-7',
  phone: 'M5 4h3.5l1.5 4.5-2 1.5a11 11 0 0 0 6 6l1.5-2 4.5 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  more: 'M12 6v.5M12 12v.5M12 18v.5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  share: 'M12 15V3M8 7l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7',
  chat: 'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 10h8M8 13h5',
  bolt: 'M13 3 5 13.5h6L10 21l8-10.5h-6z',
  door: 'M5 21V4a1 1 0 0 1 1-1h9l3 2v16M3 21h18M12 12v1.5M15 5v16',
  clipboard: 'M9 4h6v3H9zM9 5.5H6a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1h-3M8.5 13l2.5 2.5 4.5-5',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8',
  wave: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7 6 6 0 0 1-5-3l-2.5-4.5a1.5 1.5 0 0 1 2.6-1.5L8 15',
  calendar: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM12 11v4l2.5 1.5',
  coins: 'M9 10a6 3 0 1 0 0-.01zM3 10v4c0 1.66 2.69 3 6 3s6-1.34 6-3v-4M9 17v3c0 .5.3 1 1 1.4M15 13c3.31 0 6 1.34 6 3s-2.69 3-6 3-6-1.34-6-3M21 16v3c0 1.66-2.69 3-6 3-1.7 0-3.2-.35-4.3-.9',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  doc: 'M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v4h4M8.5 12h7M8.5 16h7',
  sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4',
  hourglass: 'M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9',
  chart: 'M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6',
  lock: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V8a4 4 0 0 1 8 0v3M12 15v2',
  quote: 'M10 8H6.5A1.5 1.5 0 0 0 5 9.5V13h4v4H5M19 8h-3.5A1.5 1.5 0 0 0 14 9.5V13h4v4h-4',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
};

export const FLAG_ICON = { 1: 'info', 2: 'warning', 3: 'alert' };

export function Icon({ name, size = 24, label, filled = false, class: cls = '' }) {
  const d = P[name] || P.info;
  return html`<svg class=${`icon ${cls}`} width=${size} height=${size} viewBox="0 0 24 24" fill=${filled ? 'currentColor' : 'none'}
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden=${label ? undefined : 'true'} role=${label ? 'img' : undefined} aria-label=${label} focusable="false"><path d=${d} /></svg>`;
}

/** The SayWotNow wordmark. Text is real text, so it scales and reads correctly. */
export function Logo({ size = 40, stacked = false, tagline = false }) {
  return html`<div class=${`logo ${stacked ? 'logo-stacked' : ''}`} style=${`--logo-size:${size}px`} role="img" aria-label="SayWotNow">
    <span class="logo-word" aria-hidden="true">
      <span class="logo-say">Say</span><span class="logo-wot">Wot</span>${stacked ? html`<br />` : null}<span class="logo-now">Now</span><span class="logo-q">?<${Sparks} /></span>
    </span>
    ${tagline ? html`<span class="logo-tagline" aria-hidden="true">Lost for words? <span class="underline">We've got you.</span></span>` : null}
  </div>`;
}

export function Sparks() {
  return html`<svg class="sparks" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <path d="M10 22 7 9M20 19l5-12M27 26l10-6" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" /></svg>`;
}

/** The app icon mark: a question mark with sparks. */
export function Mark({ size = 64 }) {
  return html`<svg class="mark" width=${size} height=${size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <path d="M22 24c0-6 4.5-10 10.5-10S43 18 43 23.5c0 4.6-3 6.7-6 8.5-2.7 1.6-4 3-4 6v1.5" fill="none" stroke="currentColor" stroke-width="7.5" stroke-linecap="round" />
    <circle cx="33" cy="50" r="4.6" fill="currentColor" />
    <path d="M44 13 43 6M50 17l5-5M52 24l7-2" fill="none" stroke="var(--amber)" stroke-width="4" stroke-linecap="round" /></svg>`;
}
