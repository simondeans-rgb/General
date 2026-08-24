'use client';

import * as React from 'react';
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
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium',
        'transition-[background-color,border-color,box-shadow,transform] duration-100',
        'active:translate-y-px disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
        size === 'sm' && 'h-8 px-2.5 text-[13px]',
        size === 'md' && 'h-10 px-3.5 text-sm min-h-[40px]',
        size === 'lg' && 'h-12 px-5 text-[15px]',
        variant === 'primary' && 'bg-accent text-white hover:bg-accent-hover shadow-xs',
        variant === 'secondary' && 'bg-surface text-ink border border-line-strong hover:bg-surface-2 shadow-xs',
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
    <div className={cn('flex items-start gap-3 px-4 py-3 border-b border-line', className)}>
      <div className="min-w-0 flex-1">
        <h2 className="text-[13px] font-semibold tracking-[0.04em] uppercase text-ink-3">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────
const TONES = {
  neutral:  'bg-surface-2 text-ink-2 border-line',
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
      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium leading-5 whitespace-nowrap',
      TONES[tone] ?? TONES.neutral, className)}>
      {icon}{children}
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
          'focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12',
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
          'px-3 pr-8 text-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12',
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
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && <div className="mb-3 grid size-11 place-items-center rounded-full bg-surface-2 text-ink-3">{icon}</div>}
      <p className="font-medium text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-ink-2">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden />;
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div role="alert" className="rounded-[var(--radius-lg)] border border-critical/25 bg-critical-soft p-4">
      <p className="font-medium text-critical">Something went wrong</p>
      <p className="mt-1 text-sm text-ink-2 break-words">{message}</p>
      {onRetry && <Button className="mt-3" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
