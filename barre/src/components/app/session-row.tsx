'use client';

import * as React from 'react';
import Link from 'next/link';
import { Beats } from '@/components/ui';
import { time } from '@/lib/format';
import { cn } from '@/lib/cn';
export { SectionHead, StyleMark, Word, ViewTabs, styleColour } from '@/components/ui';
import { StyleMark, Word, styleColour } from '@/components/ui';
import type { SessionRow as S } from '@/lib/repos/dashboard';

/* The small building blocks once kept here now live in components/ui and
   are re-exported for existing imports. */

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
