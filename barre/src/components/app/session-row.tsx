'use client';

import Link from 'next/link';
import { MapPin, User, Users } from 'lucide-react';
import { Badge, type Tone } from '@/components/ui';
import { time } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { SessionRow as S } from '@/lib/repos/dashboard';

const TONES: Record<string, Tone> = {
  violet: 'violet', amber: 'amber', teal: 'teal',
  rose: 'rose', indigo: 'indigo', lime: 'lime',
};

const BARS: Record<string, string> = {
  violet: 'bg-violet', amber: 'bg-amber', teal: 'bg-teal',
  rose: 'bg-rose', indigo: 'bg-indigo', lime: 'bg-lime',
};

/** One class in a list. Used by the dashboard and the schedule. */
export function SessionRow({ session: s, href }: { session: S; href?: string }) {
  const cancelled = s.status === 'cancelled';
  const full = s.enrolled >= s.capacity;
  const body = (
    <div className={cn('flex items-stretch gap-3 px-4 py-3', cancelled && 'opacity-60')}>
      {/* Colour marks the dance style, but never carries meaning on its own —
          the style is always named next to it. */}
      <span aria-hidden className={cn('w-1 shrink-0 rounded-full', BARS[s.colour ?? ''] ?? 'bg-surface-3')} />
      <span className="w-[52px] shrink-0 pt-0.5">
        <span className={cn('tnum block text-sm font-semibold', cancelled && 'line-through')}>
          {time(s.starts_at)}
        </span>
        <span className="tnum block text-[12px] text-ink-3">{time(s.ends_at)}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={cn('font-medium', cancelled && 'line-through')}>{s.name}</span>
          {s.style && <Badge tone={TONES[s.colour ?? ''] ?? 'neutral'}>{s.style}</Badge>}
          {cancelled && <Badge tone="critical">Cancelled</Badge>}
          {!cancelled && s.trials > 0 && <Badge tone="info">{s.trials} trial{s.trials === 1 ? '' : 's'}</Badge>}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-ink-2">
          {s.teacher && <span className="inline-flex items-center gap-1"><User className="size-3.5" aria-hidden />{s.teacher}</span>}
          {s.room && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{s.room}</span>}
          <span className={cn('inline-flex items-center gap-1', full && 'font-medium text-caution')}>
            <Users className="size-3.5" aria-hidden />{s.enrolled}/{s.capacity}{full ? ' · full' : ''}
          </span>
        </span>
      </span>
    </div>
  );
  return href ? <Link href={href} className="block transition-colors hover:bg-surface-2">{body}</Link> : body;
}
