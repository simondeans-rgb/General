import * as React from 'react';
import { SANAA, SANAA_DOT, SANAA_S, SANAA_S_DOT, SANAA_S_VIEWBOX, SANAA_VIEWBOX, SANAA_WORD } from '@/lib/sanaa-logo';
import { cn } from '@/lib/cn';

/**
 * The Sanaa wordmark — always in Sanaa's own colours, whatever the school's
 * theme. `tone` picks the variation from the brand board: eucalyptus on light,
 * ivory on dark. The full stop is always terracotta.
 */
export function SanaaLogo({ tone = 'ink', className, title = 'Sanaa' }: { tone?: 'ink' | 'ivory'; className?: string; title?: string | null }) {
  return (
    <svg viewBox={SANAA_VIEWBOX} className={cn('h-6 w-auto', className)} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}
         aria-label={title ?? undefined}>
      <path d={SANAA_WORD} fill={tone === 'ivory' ? SANAA.ivory : SANAA.eucalyptus} />
      <circle {...SANAA_DOT} fill={SANAA.terracotta} />
    </svg>
  );
}

/** The square "s." mark, on eucalyptus — app icons and small spaces. */
export function SanaaMark({ className }: { className?: string }) {
  const [x, y, w, h] = SANAA_S_VIEWBOX.split(' ').map(Number) as [number, number, number, number];
  const side = Math.max(w, h) * 1.9;
  return (
    <svg viewBox={`${x + w / 2 - side / 2} ${y + h / 2 - side / 2 - h * 0.04} ${side} ${side}`} className={cn('size-8 shrink-0', className)} aria-hidden>
      <rect x={x + w / 2 - side / 2} y={y + h / 2 - side / 2 - h * 0.04} width={side} height={side} rx={side * 0.24} fill={SANAA.eucalyptus} />
      <path d={SANAA_S} fill={SANAA.ivory} />
      <circle {...SANAA_S_DOT} fill={SANAA.terracotta} />
    </svg>
  );
}

/** The wordmark in its dark box, as on the brand board. */
export function SanaaBadge({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-[22%/40%] px-[0.9em] py-[0.55em]', className)} style={{ background: SANAA.eucalyptus }}>
      <SanaaLogo tone="ivory" className="h-[1em]" />
    </span>
  );
}
