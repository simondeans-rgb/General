'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Check, LogOut, ArrowLeftRight } from 'lucide-react';
import { PERSONAS, useSession, type Persona } from '@/lib/auth/session';
import { Badge, Button } from '@/components/ui';
import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';

const TONE = { owner: 'accent', admin: 'info', teacher: 'teal', guardian: 'rose' } as const;
const ROLE_HOME = { owner: '/today', admin: '/today', teacher: '/teach', guardian: '/family' } as const;

/**
 * Switching between the demo people.
 *
 * Sign out and sign in again would be the literal equivalent, but the thing
 * someone actually wants here is to see the same studio through a different
 * pair of eyes — so this switches directly and lands on that role's own home.
 * It sits in the header, which is the one part of the shell present at every
 * screen size; the desktop rail opens the same panel.
 *
 * The panel is portalled to document.body deliberately. The header uses
 * backdrop-blur, and a backdrop-filter establishes a containing block for
 * fixed-position descendants — so `fixed inset-0` inside it resolves to the
 * 56px header rather than the viewport, and the sheet renders off-screen.
 */
export function PersonSwitcher({ className }: { className?: string }) {
  const { session, signIn, signOut } = useSession();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { setMounted(true); }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!session) return null;

  const choose = (p: Persona) => {
    setOpen(false);
    if (p.userId === session.userId) return;
    signIn(p);
    router.push(ROLE_HOME[p.role]);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Signed in as ${session.name}. Switch to another person.`}
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[13px] font-semibold',
          'text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink',
          className,
        )}
      >
        {initials(session.name)}
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/30 sm:items-center"
             onClick={() => setOpen(false)}>
          <div
            ref={panelRef} tabIndex={-1}
            role="dialog" aria-modal="true" aria-labelledby="switch-title"
            onClick={e => e.stopPropagation()}
            className="max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain
                       rounded-t-[var(--radius-xl)] border border-line bg-surface
                       p-4 pb-safe shadow-lg outline-none sm:rounded-[var(--radius-xl)]"
          >
            <div className="mb-1 flex items-center gap-2">
              <ArrowLeftRight className="size-4 text-ink-3" aria-hidden />
              <h2 id="switch-title" className="text-[17px] font-semibold tracking-tight">Switch person</h2>
            </div>
            <p className="mb-3 text-[13px] text-ink-2">
              The same studio, seen by someone else. What each person can read is
              decided by the database, not by this menu.
            </p>

            <ul className="space-y-1.5">
              {PERSONAS.map(p => {
                const current = p.userId === session.userId;
                return (
                  <li key={p.userId}>
                    <button
                      onClick={() => choose(p)}
                      aria-current={current ? 'true' : undefined}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-[var(--radius-lg)] border p-3 text-left transition-colors',
                        current ? 'border-accent bg-accent-soft/60' : 'border-line hover:bg-surface-2',
                      )}
                    >
                      <span aria-hidden className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold',
                        current ? 'bg-accent text-white' : 'bg-surface-2 text-ink-2')}>
                        {current ? <Check className="size-4" /> : initials(p.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{p.name}</span>
                          <Badge tone={TONE[p.role]}>{p.title}</Badge>
                        </span>
                        <span className="mt-0.5 block text-[12.5px] text-ink-2">{p.blurb}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex gap-2 border-t border-line pt-3">
              <Button className="flex-1" onClick={() => setOpen(false)}>Close</Button>
              <Button className="flex-1" variant="secondary"
                      onClick={() => { setOpen(false); signOut(); router.replace('/'); }}>
                <LogOut className="size-4" aria-hidden /> Sign out
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
