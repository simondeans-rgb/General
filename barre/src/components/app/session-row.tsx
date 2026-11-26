'use client';

import * as React from 'react';
import Link from 'next/link';
import { Beats } from '@/components/ui';
import { time } from '@/lib/format';
import { cn } from '@/lib/cn';
export { SectionHead } from '@/components/ui';
import type { SessionRow as S } from '@/lib/repos/dashboard';

/* ── Small office building blocks, shared by the office screens ──────────
   Kept here (not in components/ui) so the office group can use them without
   touching the shared primitives. Candidates to promote later. */

const HUES = ['violet', 'amber', 'teal', 'rose', 'indigo', 'lime'] as const;

/** The style hue as a CSS colour (a token, never a hex). */
export function styleColour(colour?: string | null) {
  return colour && (HUES as readonly string[]).includes(colour) ? `var(--color-${colour})` : 'var(--color-line-strong)';
}

/** A dance-style mark: a small square in the style's hue, always beside the style's name. */
export function StyleMark({ colour, name, className }: { colour?: string | null; name?: string | null; className?: string }) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5', className)}>
      <span aria-hidden className="size-2 shrink-0 rounded-[2px]" style={{ background: styleColour(colour) }} />
      {name && <span className="truncate">{name}</span>}
    </span>
  );
}


/** A change set as a word (MOVED, COVER, CANCELLED, CLASH). The word carries the meaning; colour supports it. */
export function Word({ children, tone = 'ink', className }: { children: React.ReactNode; tone?: 'ink' | 'critical' | 'caution' | 'positive' | 'muted'; className?: string }) {
  const c = { ink: 'text-ink', critical: 'text-critical', caution: 'text-caution', positive: 'text-positive', muted: 'text-ink-3' }[tone];
  return <span className={cn('font-display text-[12px] uppercase leading-none tracking-[0.02em] [font-stretch:85%]', c, className)}>{children}</span>;
}

/** Segmented view switch: quiet text tabs with an ink rule under the current one. */
export function ViewTabs<T extends string>({ value, onChange, options, label, className }: {
  value: T; onChange: (v: T) => void; options: [T, string][]; label: string; className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn('-mx-1 flex max-w-full gap-1 overflow-x-auto', className)}>
      {options.map(([v, text]) => (
        <button key={v} role="tab" aria-selected={value === v} onClick={() => onChange(v)}
          className={cn('min-h-[40px] shrink-0 border-b-2 px-2 text-[14px] transition-colors',
            value === v ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-3 hover:text-ink')}>
          {text}
        </button>
      ))}
    </div>
  );
}

/** One class in a list: time column, name and style, who and where, how full. */
export function SessionRow({ session: s, href, onSelect }: { session: S; href?: string; onSelect?: () => void }) {
  const cancelled = s.status === 'cancelled';
  const full = !cancelled && s.enrolled >= s.capacity;
  const body = (
    <span className="grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 px-1 py-3 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto_3.75rem]">
      <span className="self-start pt-0.5">
        <span className={cn('block font-display text-[19px] leading-none tnum', cancelled && 'text-ink-3 line-through')}>{time(s.starts_at)}</span>
        <span className="mt-1 block text-[12.5px] text-ink-3 tnum">{time(s.ends_at)}</span>
      </span>
      <span className="min-w-0">
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <span className={cn('truncate font-semibold', cancelled && 'text-ink-3 line-through')}>{s.name}</span>
          {s.style && <StyleMark colour={s.colour} name={s.style} className="text-[13px] text-ink-3" />}
        </span>
        <span className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-2 text-[13px] text-ink-3">
          {cancelled
            ? <><Word tone="critical">Cancelled</Word>{s.cancel_reason && <span className="text-ink-2">{s.cancel_reason}</span>}</>
            : <>
                {s.moved && <Word>Moved</Word>}
                {s.covered && <Word tone="caution">Cover</Word>}
                <span className="truncate">{[s.teacher, s.room].filter(Boolean).join(' · ')}{s.trials > 0 ? ` · ${s.trials} trial${s.trials === 1 ? '' : 's'}` : ''}</span>
              </>}
        </span>
      </span>
      {!cancelled && <Beats value={s.enrolled} max={s.capacity} label={`${s.enrolled} of ${s.capacity} places`} tone={full ? 'caution' : 'accent'} className="hidden sm:inline-flex" />}
      <span className={cn('text-right text-[13.5px] tnum', full ? 'font-semibold text-caution' : 'text-ink-2', cancelled && 'sm:col-span-2')}>
        {cancelled ? '' : <>{s.enrolled}/{s.capacity}{full && <span className="block text-[12px]">Full</span>}</>}
      </span>
    </span>
  );
  const cls = 'block w-full text-left transition-colors hover:bg-surface-2/60';
  if (onSelect) return <button onClick={onSelect} className={cls}>{body}</button>;
  return href ? <Link href={href} className={cls}>{body}</Link> : body;
}
