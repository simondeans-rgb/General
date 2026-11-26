import * as React from 'react';
import {
  BAR_W, LOCKUP, MARK_BARS, MARK_VIEWBOX, SMALL_MARK_BARS, SMALL_MARK_VIEWBOX, SWAYVO, WORD_PATHS, WORD_STROKE,
  WORD_TRANSFORM, logoColours, type LogoTone,
} from '@/lib/swayvo-logo';
import { cn } from '@/lib/cn';

function Bars({ tone, mono }: { tone: LogoTone; mono?: boolean }) {
  const c = logoColours(tone);
  return <>{MARK_BARS.map((b, i) => (
    <rect key={i} x={b.x} y={b.y} width={BAR_W} height={b.h} rx={1} fill={b.downbeat && !mono ? c.downbeat : c.bars} />
  ))}</>;
}

function Word({ tone }: { tone: LogoTone }) {
  return (
    <g transform={WORD_TRANSFORM} fill="none" stroke={logoColours(tone).word} strokeWidth={WORD_STROKE} strokeLinejoin="bevel">
      {WORD_PATHS.map((p, i) => <path key={i} d={p.d} transform={p.transform} />)}
    </g>
  );
}

/**
 * The Swayvo logo: the eight-count mark and the wordmark. Always in Swayvo's
 * own colours, whatever the school's colours. `ink` on light grounds, `white`
 * on blue or dark, `blue` for single-colour use on light.
 */
export function SwayvoLogo({ tone = 'ink', mono, className, title = 'Swayvo' }:
  { tone?: LogoTone; mono?: boolean; className?: string; title?: string | null }) {
  return (
    <svg viewBox={`0 0 ${LOCKUP.width} ${LOCKUP.height}`} className={cn('h-6 w-auto', className)}
      role={title ? 'img' : undefined} aria-label={title ?? undefined} aria-hidden={title ? undefined : true}>
      <g transform={`translate(${LOCKUP.markX} ${LOCKUP.markY}) scale(${LOCKUP.markScale})`}><Bars tone={tone} mono={mono} /></g>
      <g transform={`translate(${LOCKUP.wordX} ${LOCKUP.wordY})`}><Word tone={tone} /></g>
    </svg>
  );
}

/** The wordmark alone, for places where the mark is already present. */
export function SwayvoWordmark({ tone = 'ink', className, title = 'Swayvo' }: { tone?: LogoTone; className?: string; title?: string | null }) {
  return (
    <svg viewBox="0 0 410 96" className={cn('h-5 w-auto', className)} role={title ? 'img' : undefined}
      aria-label={title ?? undefined} aria-hidden={title ? undefined : true}>
      <Word tone={tone} />
    </svg>
  );
}

/** The mark alone. Below 24px use `small` (four beats survive pixel snapping). */
export function SwayvoMark({ tone = 'ink', small, className }: { tone?: LogoTone; small?: boolean; className?: string }) {
  const c = logoColours(tone);
  if (small) return (
    <svg viewBox={SMALL_MARK_VIEWBOX} className={cn('size-4 shrink-0', className)} aria-hidden>
      {SMALL_MARK_BARS.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.downbeat ? c.downbeat : c.bars} />)}
    </svg>
  );
  return <svg viewBox={MARK_VIEWBOX} className={cn('h-6 w-auto shrink-0', className)} aria-hidden><Bars tone={tone} /></svg>;
}

/** The app icon: white count with a peach downbeat on Count blue. */
export function SwayvoIcon({ className, rounded = true }: { className?: string; rounded?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={cn('size-8 shrink-0', className)} aria-hidden>
      <rect width={100} height={100} rx={rounded ? 22 : 0} fill={SWAYVO.blue} />
      <g transform="translate(19 24) scale(0.886)"><Bars tone="white" /></g>
    </svg>
  );
}
