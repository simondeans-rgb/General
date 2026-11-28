'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Award, CalendarPlus, ChevronDown, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

export type AddKind = 'class' | 'event' | 'exam';

const ITEMS: { kind: AddKind; label: string; hint: string; page: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { kind: 'class', label: 'New class', hint: 'A weekly class on the timetable', page: '/classes', icon: CalendarPlus },
  { kind: 'event', label: 'New event', hint: 'A show, competition, workshop or social', page: '/events', icon: Sparkles },
  { kind: 'exam', label: 'New exam', hint: 'An examiner’s visit, with fees and a register', page: '/events', icon: Award },
];

/**
 * One "Add" on every Timetable screen (Schedule, Classes, Events): a class,
 * an event or an exam can be started from whichever of them is open. On its
 * own screen the form opens in place; otherwise this goes to that screen
 * with ?new=…, which opens the form there (useAddParam).
 */
export function TimetableAdd({ here, onAdd }: { here: 'schedule' | 'classes' | 'events'; onAdd: (k: AddKind) => void }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [open]);
  const local = (k: AddKind) => here === 'events' ? k !== 'class' : k === 'class';
  const pick = (k: AddKind, page: string) => {
    setOpen(false);
    if (local(k)) onAdd(k); else router.push(`${page}/?new=${k}`);
  };
  return (
    <div ref={ref} className="relative">
      <Button size="sm" variant="primary" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Plus className="size-4" aria-hidden /> Add <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} aria-hidden />
      </Button>
      {open && (
        <div role="menu" aria-label="Add to the timetable"
          className="absolute right-0 top-full z-40 mt-1.5 w-[min(18rem,calc(100vw-2rem))] rounded-[var(--radius-lg)] border border-line bg-surface p-1.5 shadow-lg">
          {ITEMS.map(({ kind, label, hint, page, icon: Icon }) => (
            <button key={kind} role="menuitem" onClick={() => pick(kind, page)}
              className="flex w-full items-start gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left hover:bg-surface-2 focus-visible:bg-surface-2">
              <Icon className="mt-0.5 size-4 shrink-0 text-ink-2" aria-hidden />
              <span className="min-w-0">
                <span className="block text-[0.9375rem] font-semibold">{label}</span>
                <span className="block text-[0.8125rem] text-ink-3">{hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Opens the form a ?new=… link asked for, once, then tidies the address. */
export function useAddParam(onAdd: (k: AddKind) => void) {
  const fn = React.useRef(onAdd);
  fn.current = onAdd;
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const k = url.searchParams.get('new') as AddKind | null;
    if (k !== 'class' && k !== 'event' && k !== 'exam') return;
    url.searchParams.delete('new');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    fn.current(k);
  }, []);
}
