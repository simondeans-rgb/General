'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

/* ==========================================================================
   Primitives
   --------------------------------------------------------------------------
   Deliberately few. Every control here is reachable by keyboard, states are
   distinguished by more than colour, and interactive targets are at least
   44px on touch.
   ========================================================================== */

// ── Button ────────────────────────────────────────────────────────────────
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
};

export function Button({
  className, variant = 'secondary', size = 'md', loading, children, disabled, ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold tracking-[-0.005em]',
        'transition-[background-color,border-color,color,transform] duration-100',
        'active:translate-y-px disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
        size === 'sm' && 'h-9 px-3 text-[13px] [@media(pointer:coarse)]:h-10',
        size === 'md' && 'h-10 px-4 text-sm [@media(pointer:coarse)]:h-11',
        size === 'lg' && 'h-12 px-5 text-[15px]',
        variant === 'primary' && 'bg-accent text-on-accent hover:bg-accent-hover',
        variant === 'secondary' && 'bg-surface text-ink border border-line-strong hover:border-ink-3 hover:bg-surface-2',
        variant === 'ghost' && 'text-ink-2 hover:bg-surface-2 hover:text-ink',
        variant === 'danger' && 'bg-surface text-critical border border-line-strong hover:bg-critical-soft',
        className,
      )}
    >
      {loading && <Spinner className="size-3.5" />}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-block size-4 rounded-full border-2 border-current/25 border-t-current animate-spin', className)}
    />
  );
}

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cn('card', className)} />;
}

export function CardHeader({
  title, subtitle, action, className,
}: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-3 px-4 pb-2.5 pt-3.5 border-b border-line', className)}>
      <div className="min-w-0 flex-1">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13.5px] text-ink-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────
const TONES = {
  neutral:  'bg-surface-2 text-ink-2 border-transparent',
  accent:   'bg-accent-soft text-accent-ink border-transparent',
  positive: 'bg-positive-soft text-positive border-transparent',
  caution:  'bg-caution-soft text-caution border-transparent',
  critical: 'bg-critical-soft text-critical border-transparent',
  info:     'bg-info-soft text-info border-transparent',
  violet:   'bg-violet-soft text-violet border-transparent',
  amber:    'bg-amber-soft text-amber border-transparent',
  teal:     'bg-teal-soft text-teal border-transparent',
  rose:     'bg-rose-soft text-rose border-transparent',
  indigo:   'bg-indigo-soft text-indigo border-transparent',
  lime:     'bg-lime-soft text-lime border-transparent',
} as const;
export type Tone = keyof typeof TONES;

export function Badge({
  tone = 'neutral', children, className, icon,
}: { tone?: Tone; children: React.ReactNode; className?: string; icon?: React.ReactNode }) {
  return (
    <span className={cn(
      'inline-flex min-w-0 max-w-full items-center gap-1 rounded-[var(--radius-sm)] border px-1.5 py-px text-[12px] font-semibold leading-5 whitespace-nowrap',
      TONES[tone] ?? TONES.neutral, className)}>
      {icon}<span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

// ── Form controls ─────────────────────────────────────────────────────────
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        {...rest}
        className={cn(
          'h-10 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-sm',
          'placeholder:text-ink-3 transition-shadow',
          'focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12',
          'aria-[invalid=true]:border-critical aria-[invalid=true]:ring-critical/12',
          className,
        )}
      />
    );
  });

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...rest }, ref) {
    return (
      <select
        ref={ref}
        {...rest}
        className={cn(
          'h-10 w-full appearance-none rounded-[var(--radius-md)] border border-line-strong bg-surface',
          'px-3 pr-8 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12',
          "bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238a8a9c' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>\")]",
          'bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat',
          className,
        )}
      />
    );
  });

export function Field({
  label, hint, error, required, children, htmlFor,
}: { label: string; hint?: string; error?: string; required?: boolean;
     children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink-2">
        {label}{required && <span className="text-critical ml-0.5" aria-hidden>*</span>}
      </label>
      {children}
      {/* Errors are announced, not merely coloured. */}
      {error
        ? <p role="alert" className="text-[12.5px] text-critical">{error}</p>
        : hint && <p className="text-[12.5px] text-ink-3">{hint}</p>}
    </div>
  );
}

// ── States ────────────────────────────────────────────────────────────────
export function EmptyState({
  icon, title, body, action,
}: { icon?: React.ReactNode; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start justify-center px-5 py-10">
      {icon && <div aria-hidden className="mb-3 text-ink-3 [&_svg]:size-5">{icon}</div>}
      <p className="font-display text-[19px] leading-tight text-ink">{title}</p>
      {body && <p className="mt-1.5 max-w-md text-[14.5px] text-ink-2">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden />;
}

/** The sentence a person should read for an error thrown by the database. */
export function errorText(error: unknown): string {
  // Database rules raise "CODE: sentence". The sentence is written for people;
  // the code is for tests and logs.
  let message = (error instanceof Error ? error.message : String(error))
    .replace(/^([A-Z_]{3,}:\s*)+/, '');
  // Refusals from row level security are correct but unreadable.
  if (/row-level security|read-only transaction|permission denied/i.test(message)) {
    message = 'You don’t have permission to change this. If the account is read-only, nothing here can be changed.';
  }
  return message;
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = errorText(error);
  return (
    <div role="alert" className="rounded-[var(--radius-lg)] border border-critical/25 bg-critical-soft p-4">
      <p className="font-medium text-critical">Something went wrong</p>
      <p className="mt-1 text-sm text-ink-2 break-words">{message}</p>
      {onRetry && <Button className="mt-3" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

// ── Beats: the eight-count meter ──────────────────────────────────────────
/**
 * A value shown as eight beats in two groups of four (the Swayvo count). Use
 * for "how full / how far": places in a class, weeks of term, a skill's level.
 * Always pair with words or a number — the beats alone are not the value.
 */
export function Beats({ value, max = 1, label, size = 'md', tone = 'accent', className }: {
  value: number; max?: number; label: string; size?: 'sm' | 'md' | 'lg'; tone?: 'accent' | 'ink' | 'caution' | 'critical' | 'positive'; className?: string;
}) {
  const filled = Math.max(0, Math.min(8, (value / (max || 1)) * 8));
  const colour = { accent: 'var(--color-accent)', ink: 'var(--color-ink)', caution: 'var(--color-caution)',
    critical: 'var(--color-critical)', positive: 'var(--color-positive)' }[tone];
  const h = size === 'sm' ? 10 : size === 'lg' ? 22 : 14;
  return (
    <span role="img" aria-label={label} className={cn('inline-flex shrink-0 items-end', className)} style={{ height: h, gap: size === 'lg' ? 3 : 2 }}>
      {Array.from({ length: 8 }, (_, i) => {
        const part = Math.max(0, Math.min(1, filled - i));
        return (
          <span key={i} aria-hidden className="relative block overflow-hidden rounded-[1px] bg-surface-3"
            style={{ width: size === 'lg' ? 5 : size === 'sm' ? 3 : 4, height: '100%', marginLeft: i === 4 ? (size === 'lg' ? 5 : 3) : 0 }}>
            {part > 0 && <span className="beat-fill absolute inset-x-0 bottom-0" style={{ height: `${part * 100}%`, background: colour, animationDelay: `${i * 30}ms` }} />}
          </span>
        );
      })}
    </span>
  );
}

// ── Notice: changes set as type, not badges (from the Press direction) ─────
/**
 * A change people must not miss — a class moved or cancelled, a date due —
 * set as a short uppercase verb in display type, with the detail beneath.
 * The word carries the meaning; colour only supports it.
 */
export function Notice({ word, tone = 'ink', title, detail, action, className }: {
  word: string; tone?: 'ink' | 'critical' | 'caution' | 'accent' | 'positive'; title: React.ReactNode;
  detail?: React.ReactNode; action?: React.ReactNode; className?: string;
}) {
  const colour = { ink: 'text-ink', critical: 'text-critical', caution: 'text-caution', accent: 'text-accent-text', positive: 'text-positive' }[tone];
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="min-w-0 flex-1">
        <p className={cn('font-display text-[22px] uppercase leading-none tracking-[-0.01em] [font-stretch:80%]', colour)}>{word}</p>
        <p className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">{title}</p>
        {detail && <p className="mt-0.5 text-[13.5px] text-ink-3">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

// ── SectionHead: the standard section heading ────────────────────────────
/** Sentence-case title, optional meta, one link or action, a 2px ink rule beneath. */
export function SectionHead({ title, meta, action, href, link, as: H = 'h2', id, className }: {
  title: React.ReactNode; meta?: React.ReactNode; action?: React.ReactNode; href?: string; link?: string;
  as?: 'h2' | 'h3'; id?: string; className?: string;
}) {
  return (
    <div className={cn('mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 border-ink pb-2', className)}>
      <H id={id} className="section-title min-w-0 flex-1">{title}</H>
      {meta && <span className="text-[13px] text-ink-3">{meta}</span>}
      {href && link && <Link href={href} className="text-[13px] font-semibold text-accent-text hover:underline">{link}</Link>}
      {action && <span className="-my-2 flex items-center">{action}</span>}
    </div>
  );
}

// ── Dance styles, status words, view tabs ─────────────────────────────────
const STYLE_HUES = ['violet', 'amber', 'teal', 'rose', 'indigo', 'lime'] as const;

/** A dance style's hue as a CSS colour (always a token). */
export function styleColour(colour?: string | null) {
  return colour && (STYLE_HUES as readonly string[]).includes(colour) ? `var(--color-${colour})` : 'var(--color-line-strong)';
}

/** A dance-style mark: a small square in the style's hue, always beside the style's name. */
export function StyleMark({ colour, name, style, className }: { colour?: string | null; name?: string | null; style?: string | null; className?: string }) {
  const label = name ?? style;
  if (style !== undefined && !label) return null;
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap', className)}>
      <span aria-hidden className="size-2 shrink-0 rounded-[2px]" style={{ background: styleColour(colour) }} />
      {label && <span className="truncate">{label}</span>}
    </span>
  );
}

/**
 * A change or status set as a word (MOVED, COVER, CANCELLED, CLASH, PAID).
 * The word carries the meaning; colour supports it. `md` for rows a family
 * reads on a phone, `sm` for dense office lists.
 */
export function Word({ children, tone = 'ink', size = 'sm', className }: {
  children: React.ReactNode; tone?: 'ink' | 'critical' | 'caution' | 'positive' | 'muted'; size?: 'sm' | 'md'; className?: string;
}) {
  const c = { ink: 'text-ink', critical: 'text-critical', caution: 'text-caution', positive: 'text-positive', muted: 'text-ink-3' }[tone];
  return <span className={cn('font-display uppercase leading-none', size === 'md' ? 'text-[15px] tracking-[-0.01em] [font-stretch:80%]' : 'text-[12px] tracking-[0.02em] [font-stretch:85%]', c, className)}>{children}</span>;
}

/** Quiet text tabs with an ink rule under the current one. */
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
