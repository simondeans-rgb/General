/**
 * School-branded documents rendered from data: the printed show programme
 * (round-2 review, F7 print part) and email / notice templates (F15).
 *
 * Pure string templates, no DOM and no React, so the same code runs in the
 * browser (print, preview) and in the hosted delivery worker. Every value
 * that came from a person is escaped. Brand rules (docs/brand/GUIDELINES.md):
 * the school leads, Swayvo signs off quietly; Archivo for titles and numbers,
 * Inter for text; the school's colour, fitted for contrast on white.
 */
import { monogram, normaliseHex, paletteFor } from './brand';
import { LOCKUP, MARK_BARS, BAR_W, SWAYVO, WORD_PATHS, WORD_STROKE, WORD_TRANSFORM } from './swayvo-logo';

export const esc = (s: string | number | null | undefined) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export type BrandSchool = { name: string; brand_colour?: string | null; logo_url?: string | null };

/** The colours a printed or emailed page uses: always on white paper. */
export function printColours(school: BrandSchool) {
  const p = paletteFor(normaliseHex(school.brand_colour));
  return { accent: p.accent, onAccent: p.onAccent, text: p.text, line: p.line, ink: SWAYVO.ink, muted: '#5b6070', hair: '#dfe1e8' };
}

/** Only images we can trust in a document someone else opens: data: images and http(s). */
export const safeImage = (url: string | null | undefined) =>
  !url ? null : /^data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]/i.test(url) || /^https?:\/\//i.test(url) ? url : null;

/** "powered by swayvo", drawn from the logo geometry (never a font). */
export function poweredBySvg(height = 12) {
  const w = Math.round(height * LOCKUP.width / LOCKUP.height);
  const bars = MARK_BARS.map(b => `<rect x="${b.x}" y="${b.y}" width="${BAR_W}" height="${b.h}" rx="1" fill="${b.downbeat ? SWAYVO.blue : SWAYVO.ink}"/>`).join('');
  const word = WORD_PATHS.map(p => `<path d="${p.d}"${p.transform ? ` transform="${p.transform}"` : ''}/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOCKUP.width} ${LOCKUP.height}" width="${w}" height="${height}" role="img" aria-label="Swayvo" style="vertical-align:-2px">`
    + `<g transform="translate(${LOCKUP.markX} ${LOCKUP.markY}) scale(${LOCKUP.markScale})">${bars}</g>`
    + `<g transform="translate(${LOCKUP.wordX} ${LOCKUP.wordY})"><g transform="${WORD_TRANSFORM}" fill="none" stroke="${SWAYVO.ink}" stroke-width="${WORD_STROKE}" stroke-linejoin="bevel">${word}</g></g></svg>`;
}

/** The school's logo, or its initials on its colour. */
function schoolMark(school: BrandSchool, size: number) {
  const c = printColours(school);
  const logo = safeImage(school.logo_url);
  if (logo) return `<img src="${esc(logo)}" alt="${esc(school.name)} logo" style="height:${size}px;width:auto;max-width:${size * 3}px;object-fit:contain;display:block">`;
  return `<span aria-hidden="true" style="display:inline-grid;place-items:center;width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.22)}px;background:${c.accent};color:${c.onAccent};font:800 ${Math.round(size * 0.4)}px/1 var(--display);letter-spacing:-0.01em">${esc(monogram(school.name))}</span>`;
}

/** Browser only: the app's own Archivo and Inter @font-face rules, for a document in a new window or frame. */
export function documentFontFaces(): string {
  if (typeof document === 'undefined') return '';
  const out: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try { rules = sheet.cssRules; } catch { continue; }   // another origin's sheet
    for (const r of Array.from(rules)) if (r.constructor.name === 'CSSFontFaceRule' && /Archivo|Inter/.test(r.cssText)) out.push(r.cssText);
  }
  return out.join('\n');
}

const FONTS = `--display:"Archivo Variable",Archivo,"Arial Black","Helvetica Neue",Arial,sans-serif;--text:"Inter Variable",Inter,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;`;

/* ── The printed show programme ─────────────────────────────────────────── */

export type ProgrammeInput = {
  school: BrandSchool;
  event: { title: string; when: string; venue: string | null };
  rows: { routine: string; class_name: string | null; dancers: string | null; unnamed: number }[];
  /** @font-face rules from the app, so the print uses the real Archivo and Inter. */
  fontFaces?: string;
  /** Print as soon as the fonts are in (false in previews and tests). */
  autoPrint?: boolean;
};

/** Dancers without photography consent are counted, not named (the existing rule). */
export const dancersLine = (r: { dancers: string | null; unnamed: number }) =>
  [r.dancers ?? '', r.unnamed ? `${r.dancers ? 'and ' : ''}${r.unnamed} dancer${r.unnamed === 1 ? '' : 's'}` : ''].filter(Boolean).join(' ');

export function programmeHtml({ school, event, rows, fontFaces = '', autoPrint = true }: ProgrammeInput): string {
  const c = printColours(school);
  const items = rows.map((r, i) => `
  <li>
    <span class="n">${i + 1}</span>
    <div class="body">
      <p class="routine">${esc(r.routine)}</p>
      ${r.class_name ? `<p class="class">${esc(r.class_name)}</p>` : ''}
      ${dancersLine(r) ? `<p class="dancers">${esc(dancersLine(r))}</p>` : ''}
    </div>
  </li>`).join('');
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8">
<title>${esc(event.title)} · ${esc(school.name)} · programme</title>
<style>
${fontFaces}
:root{${FONTS}--accent:${c.accent};--accent-text:${c.text};--ink:${c.ink};--muted:${c.muted};--hair:${c.hair}}
@page{size:A4;margin:16mm 16mm 18mm}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0 auto;max-width:680px;padding:40px 20px;background:#fff;color:var(--ink);font:400 15px/1.5 var(--text)}
header{display:flex;align-items:center;gap:16px;padding-bottom:20px;border-bottom:4px solid var(--accent)}
.school{font:800 13px/1.2 var(--display);font-stretch:112%;letter-spacing:.04em;text-transform:uppercase;color:var(--accent-text);margin:0}
h1{font:850 44px/0.95 var(--display);font-stretch:118%;letter-spacing:-0.025em;margin:22px 0 0}
.when{margin:10px 0 0;color:var(--muted);font-size:16px}
h2{font:800 20px/1.1 var(--display);font-stretch:112%;margin:34px 0 0;padding-bottom:8px;border-bottom:2px solid var(--ink)}
ol{list-style:none;margin:0;padding:0}
li{display:grid;grid-template-columns:3rem minmax(0,1fr);gap:12px;padding:14px 0;border-bottom:1px solid var(--hair);break-inside:avoid}
.n{font:850 28px/1 var(--display);font-stretch:118%;color:var(--accent-text);font-variant-numeric:tabular-nums lining-nums}
.routine{margin:0;font:800 18px/1.2 var(--display);font-stretch:112%}
.class{margin:2px 0 0;font-weight:600}
.dancers{margin:4px 0 0;color:var(--muted);font-size:14px}
.empty{color:var(--muted);padding:14px 0}
footer{margin-top:32px;display:flex;justify-content:space-between;align-items:center;gap:12px;color:var(--muted);font-size:12px}
@media print{body{padding:0;max-width:none}}
</style></head>
<body>
<header>${schoolMark(school, 56)}<p class="school">${esc(school.name)}</p></header>
<h1>${esc(event.title)}</h1>
<p class="when">${esc([event.when, event.venue].filter(Boolean).join(' · '))}</p>
<h2>Running order</h2>
${rows.length ? `<ol>${items}</ol>` : `<p class="empty">The running order is still being set.</p>`}
<footer><span>${esc(school.name)}</span><span>powered by ${poweredBySvg(12)}</span></footer>
${autoPrint ? `<script>(document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ setTimeout(function(){ window.print() }, 50) })</script>` : ''}
</body></html>`;
}

/* ── Email and notice templates (F15) ───────────────────────────────────── */

/**
 * The messages a school sends, ready for when delivery is connected
 * (decision R-003). GUIDELINES §8: white, the school's name first, plain
 * text first, no images required, Swayvo signs off. The Notice word leads
 * the subject in capitals ("MOVED: Grade 2 Ballet…"), as it does in the app.
 */
export type TemplateKind = 'class_moved' | 'class_cancelled' | 'cover' | 'fee_due' | 'invitation' | 'absence_received';

export type MessageInput = {
  kind: TemplateKind;
  school: BrandSchool & { contact_email?: string | null };
  /** "Hannah" — the reader's first name. */
  to: string;
  /** What it is about: the class, the invoice, the child. */
  title: string;
  /** One or two plain sentences with the detail. */
  detail: string;
  /** Where the button goes, and what it says. */
  action?: { label: string; url: string };
  /** For fee_due: "4 Dec". */
  due?: string;
};

export const TEMPLATE_WORDS: Record<TemplateKind, { word: string; tone: 'ink' | 'critical' | 'caution' | 'accent' }> = {
  class_moved: { word: 'Moved', tone: 'ink' },
  class_cancelled: { word: 'Cancelled', tone: 'critical' },
  cover: { word: 'Changed', tone: 'ink' },
  fee_due: { word: 'Due', tone: 'caution' },
  invitation: { word: 'Invited', tone: 'accent' },
  absence_received: { word: 'Received', tone: 'ink' },
};

export const TEMPLATE_LABELS: Record<TemplateKind, string> = {
  class_moved: 'A class moves', class_cancelled: 'A class is cancelled', cover: 'A cover teacher',
  fee_due: 'A fee is due', invitation: 'An invitation to the app', absence_received: 'An absence report received',
};

const wordFor = (m: MessageInput) => {
  const w = TEMPLATE_WORDS[m.kind].word;
  return m.kind === 'fee_due' && m.due ? `${w} ${m.due}` : w;
};

export function renderMessage(m: MessageInput): { subject: string; text: string; html: string } {
  const c = printColours(m.school);
  const word = wordFor(m);
  const subject = `${word.toUpperCase()}: ${m.title}`.slice(0, 140);
  const tone = TEMPLATE_WORDS[m.kind].tone;
  const wordColour = tone === 'critical' ? '#b42318' : tone === 'caution' ? '#9a5b00' : tone === 'accent' ? c.text : c.ink;
  const signoff = `${m.school.name}${m.school.contact_email ? ` · ${m.school.contact_email}` : ''}`;

  const text = [
    m.school.name, '',
    `${word.toUpperCase()}`, m.title, '',
    `Hi ${m.to},`, '', m.detail, '',
    ...(m.action ? [`${m.action.label}: ${m.action.url}`, ''] : []),
    signoff,
    'Sent with Swayvo. You get this because your family is at the school; change what you get under Settings in the app.',
  ].join('\n');

  const button = m.action
    ? `<tr><td style="padding:8px 0 4px"><a href="${esc(m.action.url)}" style="display:inline-block;background:${c.accent};color:${c.onAccent};font:600 15px/1 ${'Inter,Arial,sans-serif'};text-decoration:none;padding:14px 20px;border-radius:10px">${esc(m.action.label)}</a></td></tr>`
    : '';
  const html = `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#ffffff;color:${c.ink}">
<span style="display:none;max-height:0;overflow:hidden">${esc(m.title)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff">
<tr><td align="center" style="padding:24px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font:15px/1.5 Inter,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${c.ink}">
<tr><td style="padding-bottom:14px;border-bottom:4px solid ${c.accent}">
  <p style="margin:0;font:800 14px/1.2 Archivo,'Arial Black',Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:${c.text}">${esc(m.school.name)}</p>
</td></tr>
<tr><td style="padding-top:22px">
  <p style="margin:0;font:800 26px/1 Archivo,'Arial Narrow','Arial Black',Arial,sans-serif;text-transform:uppercase;letter-spacing:-0.01em;color:${wordColour}">${esc(word)}</p>
  <p style="margin:8px 0 0;font-weight:600;font-size:17px;line-height:1.35">${esc(m.title)}</p>
</td></tr>
<tr><td style="padding-top:18px">
  <p style="margin:0">Hi ${esc(m.to)},</p>
  <p style="margin:10px 0 0">${esc(m.detail)}</p>
</td></tr>
${button}
<tr><td style="padding-top:28px;border-bottom:1px solid #dfe1e8"></td></tr>
<tr><td style="padding-top:14px;font-size:13px;color:#5b6070">
  <p style="margin:0">${esc(signoff)}</p>
  <p style="margin:6px 0 0">Sent with Swayvo. You get this because your family is at the school; change what you get under Settings in the app.</p>
</td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}

/** Sample content for previews: one per template, about Northstar's sample families. */
export function sampleMessage(kind: TemplateKind, school: MessageInput['school'], appUrl = 'https://app.example/family/'): MessageInput {
  const base = { kind, school, to: 'Hannah' };
  switch (kind) {
    case 'class_moved': return { ...base, title: 'Grade 2 Ballet on Tue 8 Dec moves to Studio Two', detail: 'Same time, same teacher. Nia’s class is in Studio Two this week only, while the main hall floor is repaired.', action: { label: 'See Nia’s week', url: appUrl } };
    case 'class_cancelled': return { ...base, title: 'Street Seniors, Friday 11 December', detail: 'The class is cancelled this week because the teacher is unwell. Amir’s other classes go ahead as usual.', action: { label: 'See Amir’s week', url: appUrl } };
    case 'cover': return { ...base, title: 'Priya Raman teaches Senior Tap on Thu 10 Dec', detail: 'Marcus is away, so Priya covers. Same time and room.', action: { label: 'See Amir’s week', url: appUrl } };
    case 'fee_due': return { ...base, due: '4 Dec', title: 'Spring term fees · £162.00', detail: 'Invoice NDA-0142 for Amir, Clara and Nia. Pay by bank transfer; the details are on your Payments page.', action: { label: 'See how to pay', url: appUrl + 'payments/' } };
    case 'invitation': return { ...base, title: `Join ${school.name} on the app`, detail: 'Your children’s classes, changes and notices in one place. The link works once and lasts 14 days.', action: { label: 'Accept the invitation', url: appUrl.replace(/family\/$/, 'invite/') } };
    case 'absence_received': return { ...base, title: 'Nia won’t be at Grade 2 Ballet on Tue 8 Dec', detail: 'Thanks for telling us. Her teacher sees it on the register. If a make-up place comes up, it will show on your home screen.' };
  }
}
