'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Upload } from 'lucide-react';
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
        size === 'sm' && 'h-9 px-3 text-[0.8125rem] [@media(pointer:coarse)]:h-10',
        size === 'md' && 'h-10 px-4 text-sm [@media(pointer:coarse)]:h-11',
        size === 'lg' && 'h-12 px-5 text-[0.9375rem]',
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
        {subtitle && <p className="mt-0.5 text-[0.8438rem] text-ink-3">{subtitle}</p>}
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
      'inline-flex min-w-0 max-w-full items-center gap-1 rounded-[var(--radius-sm)] border px-1.5 py-px text-[0.75rem] font-semibold leading-5 whitespace-nowrap',
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
      <label htmlFor={htmlFor} className="block text-[0.8125rem] font-medium text-ink-2">
        {label}{required && <span className="text-critical ml-0.5" aria-hidden>*</span>}
      </label>
      {children}
      {/* Errors are announced, not merely coloured. */}
      {error
        ? <p role="alert" className="text-[0.7812rem] text-critical">{error}</p>
        : hint && <p className="text-[0.7812rem] text-ink-3">{hint}</p>}
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
      <p className="font-display text-[1.1875rem] leading-tight text-ink">{title}</p>
      {body && <p className="mt-1.5 max-w-md text-[0.9062rem] text-ink-2">{body}</p>}
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
 * The words a Notice may use (U9). Notices are for changes, deadlines and
 * things that need action — never for confirmations ("Done", "Saved",
 * "Sent"): those are a quiet `StatusLine`. Keep this list short; adding a
 * word is a design-system change (update /design and DESIGN-SYSTEM.md).
 */
export const NOTICE_WORDS = [
  'Moved', 'Cancelled', 'Changed', 'New', 'Clash', 'Full', 'Due', 'Closed',
  'Paid', 'Booked', 'Held', 'Offline', 'Not saved', 'Not sent', 'Act now', 'Check', 'Limited',
] as const;
/** One of `NOTICE_WORDS`, or a deadline: "Due 10 Dec". */
export type NoticeWord = (typeof NOTICE_WORDS)[number] | `Due ${string}`;
export const isNoticeWord = (w: string): w is NoticeWord =>
  (NOTICE_WORDS as readonly string[]).includes(w) || /^Due \S/.test(w);

/**
 * A change people must not miss — a class moved or cancelled, a date due —
 * set as a short uppercase verb in display type, with the detail beneath.
 * The word carries the meaning; colour only supports it.
 */
export function Notice({ word, tone = 'ink', title, detail, action, className }: {
  word: NoticeWord; tone?: 'ink' | 'critical' | 'caution' | 'accent' | 'positive'; title: React.ReactNode;
  detail?: React.ReactNode; action?: React.ReactNode; className?: string;
}) {
  const colour = { ink: 'text-ink', critical: 'text-critical', caution: 'text-caution', accent: 'text-accent-text', positive: 'text-positive' }[tone];
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="min-w-0 flex-1">
        <p className={cn('font-display text-[1.375rem] uppercase leading-none tracking-[-0.01em] [font-stretch:80%]', colour)}>{word}</p>
        <p className="mt-1.5 text-[0.9375rem] font-semibold leading-snug text-ink">{title}</p>
        {detail && <p className="mt-0.5 text-[0.8438rem] text-ink-3">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * A quiet confirmation: what just happened, in a sentence, with a tick
 * (U9). Use it for "Saved", "Sent", "Imported" — never a Notice. Announced
 * politely to screen readers.
 */
export function StatusLine({ title, detail, tone = 'positive', action, className, live = true }: {
  title: React.ReactNode; detail?: React.ReactNode; tone?: 'positive' | 'ink' | 'critical';
  action?: React.ReactNode; className?: string; live?: boolean;
}) {
  return (
    <div role={live ? 'status' : undefined} className={cn('flex items-start gap-2 text-[0.875rem]', className)}>
      {tone === 'positive' && <Check aria-hidden className="mt-[0.2em] size-[1em] shrink-0 text-positive" strokeWidth={2.4} />}
      <div className="min-w-0 flex-1">
        <p className={cn('font-medium leading-snug', tone === 'critical' ? 'text-critical' : 'text-ink')}>{title}</p>
        {detail && <p className="mt-0.5 text-[0.8125rem] text-ink-3">{detail}</p>}
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
      {meta && <span className="text-[0.8125rem] text-ink-3">{meta}</span>}
      {href && link && <Link href={href} className="text-[0.8125rem] font-semibold text-accent-text hover:underline">{link}</Link>}
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
  return <span className={cn('font-display uppercase leading-none', size === 'md' ? 'text-[0.9375rem] tracking-[-0.01em] [font-stretch:80%]' : 'text-[0.75rem] tracking-[0.02em] [font-stretch:85%]', c, className)}>{children}</span>;
}

/** [value, label, count?] — the count may be a node, e.g. a number with hidden words ("3 unread"). */
type TabOption<T extends string> = [T, React.ReactNode] | [T, React.ReactNode, React.ReactNode];

function TabText({ text, count, on }: { text: React.ReactNode; count?: React.ReactNode; on: boolean }) {
  return (
    <>
      {text}
      {count != null && count !== false && <span className={cn('ml-1.5 tnum text-[0.8125rem]', on ? 'text-ink-2' : 'text-ink-3')}>{count}</span>}
    </>
  );
}

const tabClass = (on: boolean) => cn('min-h-[44px] shrink-0 border-b-2 px-2 text-[0.875rem] transition-colors',
  on ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-3 hover:text-ink');

/**
 * Quiet text tabs with an ink rule under the current one: switching between
 * views of the same thing (List / Week grid, Families / Students). The only
 * tab list in the app — screens never hand-roll their own (U9).
 */
export function ViewTabs<T extends string>({ value, onChange, options, label, className }: {
  value: T; onChange: (v: T) => void; options: TabOption<T>[]; label: string; className?: string;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const n = (i + step + options.length) % options.length;
    onChange(options[n]![0]);
    refs.current[n]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className={cn('-mx-1 flex max-w-full gap-1 overflow-x-auto', className)}>
      {options.map(([v, text, count], i) => (
        <button key={v} ref={el => { refs.current[i] = el; }} type="button" role="tab" aria-selected={value === v}
          tabIndex={value === v ? 0 : -1} onKeyDown={e => onKey(e, i)} onClick={() => onChange(v)} className={tabClass(value === v)}>
          <TabText text={text} count={count} on={value === v} />
        </button>
      ))}
    </div>
  );
}

/**
 * Filters within a list (Needs action · Open · Paid), with an optional
 * count. They look like ViewTabs, but they narrow one list rather than
 * switching views, so they are pressed buttons, not tabs.
 */
export function FilterTabs<T extends string>({ value, onChange, options, label, className }: {
  value: T; onChange: (v: T) => void; options: TabOption<T>[]; label: string; className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn('-mx-1 flex max-w-full gap-1 overflow-x-auto', className)}>
      {options.map(([v, text, count]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)} className={tabClass(value === v)}>
          <TabText text={text} count={count} on={value === v} />
        </button>
      ))}
    </div>
  );
}

export type ChoiceOption<T extends string> = { value: T; label: React.ReactNode; hint?: React.ReactNode; disabled?: boolean; 'aria-label'?: string };
type ChoiceBase<T extends string> = {
  label: string; options: ChoiceOption<T>[]; className?: string; size?: 'sm' | 'md';
  /** `row` wraps chips; `grid` gives equal columns (set them with className); `stack` is one per line. */
  layout?: 'row' | 'grid' | 'stack'; disabled?: boolean; id?: string;
  /** `corner` puts the tick in the top corner, for narrow equal-width chips. */
  tick?: 'inline' | 'corner';
};

/**
 * Single or multiple choice as chips (U9). The selected one has an ink
 * outline and a tick — never the accent fill, which is kept for the one
 * primary action on a screen. Single choice is a radio group (arrow keys
 * move); multiple choice is a group of pressed buttons.
 */
export function Choice<T extends string>(props: ChoiceBase<T> & (
  | { multiple?: false; value: T | null | undefined; onChange: (v: T) => void }
  | { multiple: true; value: T[]; onChange: (v: T[]) => void })) {
  const { label, options, className, size = 'md', layout = 'row', disabled, id, tick = 'inline' } = props;
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const on = (v: T) => props.multiple ? props.value.includes(v) : props.value === v;
  const pick = (v: T) => {
    if (props.multiple) props.onChange(props.value.includes(v) ? props.value.filter(x => x !== v) : [...props.value, v]);
    else props.onChange(v);
  };
  const focusable = props.multiple ? -1 : Math.max(0, options.findIndex(o => on(o.value)));
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (props.multiple) return;
    const step = ['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    let n = i;
    for (let k = 0; k < options.length; k++) {
      n = (n + step + options.length) % options.length;
      if (!options[n]!.disabled) break;
    }
    pick(options[n]!.value);
    refs.current[n]?.focus();
  };
  return (
    <div id={id} role={props.multiple ? 'group' : 'radiogroup'} aria-label={label}
      className={cn(layout === 'row' ? 'flex flex-wrap gap-2' : layout === 'grid' ? 'grid gap-2' : 'grid gap-2', className)}>
      {options.map((o, i) => {
        const selected = on(o.value);
        return (
          <button key={o.value} ref={el => { refs.current[i] = el; }} type="button"
            role={props.multiple ? undefined : 'radio'}
            aria-checked={props.multiple ? undefined : selected}
            aria-pressed={props.multiple ? selected : undefined}
            aria-label={o['aria-label']}
            tabIndex={props.multiple ? undefined : i === focusable ? 0 : -1}
            disabled={disabled || o.disabled} onClick={() => pick(o.value)} onKeyDown={e => onKey(e, i)}
            className={cn('relative inline-flex min-w-0 items-start gap-2 rounded-[var(--radius-md)] border bg-surface text-left transition-colors',
              tick === 'corner' && 'justify-center text-center',
              'disabled:opacity-50 disabled:pointer-events-none',
              size === 'sm' ? 'min-h-9 px-2.5 py-1.5 text-[0.8125rem] [@media(pointer:coarse)]:min-h-11' : 'min-h-11 px-3 py-2 text-[0.875rem]',
              o.hint ? 'items-start' : 'items-center',
              selected ? 'border-ink font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-ink)]'
                : 'border-line-strong text-ink-2 hover:border-ink-3 hover:text-ink')}>
            {tick === 'corner'
              ? selected && <Check aria-hidden className="absolute right-1 top-1 size-[0.75em] text-ink" strokeWidth={3} />
              : <span aria-hidden className={cn('grid shrink-0 place-items-center', o.hint && 'mt-[0.15em]', selected ? 'text-ink' : 'text-transparent')}>
                  <Check className="size-[1em]" strokeWidth={2.6} />
                </span>}
            <span className="min-w-0">
              <span className="block">{o.label}</span>
              {o.hint && <span className="mt-0.5 block text-[0.8125rem] font-normal text-ink-3">{o.hint}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * A file picker as a drop zone: an outlined target with an icon and words,
 * the native input kept for keyboard and screen readers (U9).
 */
export function FileField({ id, label, hint, accept, multiple, onFiles, chosen, disabled, className, inputRef }: {
  id?: string; label: string; hint?: React.ReactNode; accept?: string; multiple?: boolean;
  onFiles: (files: File[]) => void; chosen?: React.ReactNode; disabled?: boolean; className?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const auto = React.useId();
  const inputId = id ?? auto;
  const [over, setOver] = React.useState(false);
  return (
    <label htmlFor={inputId}
      onDragOver={e => { e.preventDefault(); if (!disabled) setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); if (!disabled && e.dataTransfer.files.length) onFiles([...e.dataTransfer.files]); }}
      className={cn('flex min-h-[4.5rem] cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-dashed bg-surface px-4 py-3',
        'focus-within:border-accent-line focus-within:ring-4 focus-within:ring-accent-line/12',
        over ? 'border-ink bg-surface-2' : 'border-line-strong hover:border-ink-3',
        disabled && 'pointer-events-none opacity-50', className)}>
      <Upload aria-hidden className="size-5 shrink-0 text-ink-2" />
      <span className="min-w-0 flex-1">
        <span className="block text-[0.875rem] font-semibold text-ink">{label}</span>
        {chosen ? <span className="block truncate text-[0.8125rem] text-ink-2">{chosen}</span>
          : hint && <span className="block text-[0.8125rem] text-ink-3">{hint}</span>}
      </span>
      <input ref={inputRef} id={inputId} type="file" accept={accept} multiple={multiple} disabled={disabled} className="sr-only"
        onChange={e => { const f = e.target.files ? [...e.target.files] : []; if (f.length) onFiles(f); e.target.value = ''; }} />
    </label>
  );
}

/**
 * Which location a list shows, with the label inside the control
 * ("All locations"). The same on Classes, Schedule and Billing (U9).
 */
export function LocationSelect({ locations, value, onChange, className }: {
  locations: { id: string; name: string }[]; value: string; onChange: (name: string) => void; className?: string;
}) {
  return (
    <Select aria-label="Location" value={value} onChange={e => onChange(e.target.value)}
      className={cn('w-auto min-w-[10rem] max-w-full font-medium', className)}>
      <option value="">All locations</option>
      {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
    </Select>
  );
}
