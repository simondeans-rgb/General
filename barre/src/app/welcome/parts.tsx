'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { Beats, Button } from '@/components/ui';
import { PoweredBy, useSchoolTheme } from '@/components/app/brand';
import { cssVars, monogram, paletteFor } from '@/lib/brand';
import { THEMES, type ThemeId } from '@/lib/theme';
import { cn } from '@/lib/cn';

/** This page is Swayvo's own, whatever school the last visitor belonged to. */
export function SwayvoOwnTheme() {
  useSchoolTheme(null);
  return null;
}

/* ── The register, live: the hero's product moment ────────────────────────
   The real register row (app/teach/register) at real size, with sample
   Northstar dancers. Tapping works; nothing is saved anywhere. */
type Mark = 'here' | 'absent' | null;
const DANCERS: { name: string; meta: string; med?: string; trial?: boolean; start: Mark }[] = [
  { name: 'Nell Ackah', meta: 'Age 5 · 100% attendance', med: 'Mild eczema; Emollient cream', start: 'here' },
  { name: 'Elias Bennett', meta: 'Age 8 · 83% attendance', start: 'absent' },
  { name: 'Nia Doherty', meta: 'Age 7 · 100% attendance', start: 'here' },
  { name: 'Zara Ellery', meta: 'Age 7 · 83% attendance', start: null },
  { name: 'Jonah Grant', meta: 'Age 8 · 100% attendance', med: 'Allergy: Plasters (latex)', start: null },
  { name: 'Layla Haddad', meta: 'Age 6 · first class', trial: true, start: null },
];

export function RegisterDemo() {
  const [marks, setMarks] = React.useState<Mark[]>(() => DANCERS.map(d => d.start));
  const here = marks.filter(m => m === 'here').length;
  const absent = marks.filter(m => m === 'absent').length;
  const left = marks.length - here - absent;
  const set = (i: number, m: Mark) => setMarks(ms => ms.map((x, j) => (j === i ? m : x)));

  return (
    <div className="w-full max-w-[390px] rounded-[var(--radius-xl)] bg-surface text-ink shadow-lg">
      <div className="border-b border-line px-4 pb-3 pt-4">
        <p className="font-display text-[22px] leading-tight">Junior Tap</p>
        <p className="text-[14px] text-ink-3">Tuesday 1 December · 16:30 · Studio Two</p>
      </div>
      <div className="px-4 pb-2">
        <div className="flex items-center gap-3 border-b-2 border-ink py-3" aria-live="polite">
          <p className="min-w-0 flex-1 text-[15px] tnum">
            <span className="font-semibold">{here} here · {absent} absent</span>
            <span className="text-ink-3"> · {left ? `${left} to mark` : 'all marked'}</span>
          </p>
          <Beats value={here + absent} max={marks.length} label={`${here + absent} of ${marks.length} marked`} />
        </div>
        <ul className="divide-y divide-line">
          {DANCERS.map((d, i) => {
            const m = marks[i];
            return (
              <li key={d.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-[17px] font-semibold leading-tight">{d.name}</span>
                  {d.med && <span className="mt-0.5 block text-[14px] font-semibold leading-snug text-caution">{d.med}</span>}
                  <span className="mt-0.5 block text-[13px] text-ink-3">
                    {d.trial && <span className="mr-1.5 rounded-[var(--radius-sm)] bg-peach-soft px-1.5 py-px font-semibold text-ink">Trial</span>}
                    {d.meta}
                  </span>
                </span>
                <span role="group" aria-label={`Mark ${d.name}`}
                  className={cn('grid h-12 w-[8.75rem] grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border-[1.5px] min-[400px]:w-[9.5rem]',
                    m === 'here' ? 'border-positive' : m === 'absent' ? 'border-critical' : 'border-line-strong')}>
                  <button type="button" aria-pressed={m === 'here'} aria-label={`Here — ${d.name}`} onClick={() => set(i, 'here')}
                    className={cn('flex items-center justify-center gap-1 text-[15px] font-semibold transition-colors',
                      m === 'here' ? 'bg-positive-soft text-positive' : 'text-ink-2 hover:bg-surface-2')}>
                    {m === 'here' && <Check className="size-4" strokeWidth={2.5} aria-hidden />}Here
                  </button>
                  <button type="button" aria-pressed={m === 'absent'} aria-label={`Absent — ${d.name}`} onClick={() => set(i, 'absent')}
                    className={cn('flex items-center justify-center gap-1 border-l-[1.5px] text-[15px] font-semibold transition-colors',
                      m === 'here' ? 'border-positive' : m === 'absent' ? 'border-critical' : 'border-line-strong',
                      m === 'absent' ? 'bg-critical-soft text-critical' : 'text-ink-2 hover:bg-surface-2')}>
                    {m === 'absent' && <X className="size-4" strokeWidth={2.5} aria-hidden />}Absent
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex items-center gap-3 border-t border-line px-4 py-3">
        <p className="min-w-0 flex-1 text-[14px] text-ink-3">{left ? `${left} to mark` : <span className="font-semibold text-ink">Everyone is marked.</span>}</p>
        <Button type="button" variant="primary" disabled={!left}
          onClick={() => setMarks(ms => ms.map(x => x ?? 'here'))}>Mark the rest here</Button>
      </div>
    </div>
  );
}

/* ── Looks like your school: one screen, three schools ───────────────────
   Each sample takes its colours from the real presets (lib/theme) through
   the same fitting the app uses (lib/brand), so contrast is the app's. */
const SAMPLES: { school: string; theme: ThemeId; preset: string; cls: string; when: string; room: string; n: number; cap: number }[] = [
  { school: 'Northstar Dance Academy', theme: 'classic', preset: 'Midnight', cls: 'Grade 3 Ballet', when: '17:15', room: 'Studio One', n: 14, cap: 16 },
  { school: 'Hollybrook School of Dance', theme: 'classic', preset: 'Plum', cls: 'Musical Theatre Juniors', when: '10:00', room: 'Main Hall', n: 9, cap: 18 },
  { school: 'Kestrel Ballet School', theme: 'urban', preset: 'Volt & violet', cls: 'Senior Contemporary', when: '11:30', room: 'Kestrel Hall', n: 20, cap: 20 },
];

export function SchoolSamples() {
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {SAMPLES.map(s => {
        const t = THEMES[s.theme];
        const p = t.presets.find(x => x.name === s.preset) ?? t.presets[0]!;
        const vars = cssVars(paletteFor(p.accent, t.surface)) as React.CSSProperties;
        return (
          <li key={s.school} className="min-w-0">
            <div data-theme={s.theme} style={vars} inert
              className="overflow-hidden rounded-[var(--radius-xl)] border border-line bg-canvas">
              <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent">
                  {monogram(s.school)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-[16px] leading-tight">{s.school}</span>
                  <PoweredBy />
                </span>
              </div>
              <div className="px-4 pb-5 pt-4">
                <p className="label text-accent-text">Next · Saturday</p>
                <p className="display-xl mt-1 text-[56px]">{s.when}</p>
                <p className="mt-2 font-display text-[19px] leading-tight">{s.cls}</p>
                <p className="mt-1 flex items-center gap-2 text-[14px] text-ink-2">
                  <Beats value={s.n} max={s.cap} label={`${s.n} of ${s.cap} places`} />
                  <span className="tnum">{s.n} of {s.cap}{s.n === s.cap ? ' · full' : ''}</span>
                  <span className="text-ink-3">· {s.room}</span>
                </p>
                <Button variant="primary" className="mt-4 w-full" tabIndex={-1}>Open register</Button>
              </div>
            </div>
            <p className="mt-2 text-[13px] text-ink-3">
              {s.school} · {t.name} style, {p.name.toLowerCase()} colours
            </p>
          </li>
        );
      })}
    </ul>
  );
}
