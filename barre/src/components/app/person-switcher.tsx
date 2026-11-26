'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Check, LogOut } from 'lucide-react';
import { PERSONA_GROUPS, useSession, type Persona } from '@/lib/auth/session';
import { Button } from '@/components/ui';
import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';

const ROLE_HOME = { owner: '/today', admin: '/today', teacher: '/teach',
                    guardian: '/family', student: '/learn', platform: '/platform' } as const;

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
export function PersonSwitcher({ className, label }: { className?: string; label?: string }) {
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
      {label ? (
        <button onClick={() => setOpen(true)} aria-haspopup="dialog"
          className={cn('text-[13px] font-semibold text-accent-text hover:underline', className)}>
          {label}
        </button>
      ) : (
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
      )}

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
            <h2 id="switch-title" className="font-display text-[22px] font-[800] leading-tight [font-stretch:112%]">Switch person</h2>
            <p className="mb-4 mt-1 text-[13.5px] text-ink-3">
              What each person can read is decided by the database, not by this menu.
            </p>

            {PERSONA_GROUPS().map(g => (
            <section key={g.title} className="mb-5">
            <h3 className="section-title border-b-2 border-ink pb-1.5">{g.title}</h3>
            <ul className="divide-y divide-line">
              {g.people.map(p => {
                const current = p.userId === session.userId;
                return (
                  <li key={p.userId}>
                    <button
                      onClick={() => choose(p)}
                      aria-current={current ? 'true' : undefined}
                      className={cn(
                        'flex min-h-14 w-full items-center gap-3 py-2.5 text-left transition-colors',
                        current ? 'bg-accent-soft/60' : 'hover:bg-surface-2/70',
                      )}
                    >
                      <span aria-hidden className={cn(
                        'grid size-10 shrink-0 place-items-center rounded-full font-display text-[14px] font-[800]',
                        current ? 'bg-accent text-on-accent' : 'bg-surface-2 text-ink-2')}>
                        {current ? <Check className="size-4" /> : initials(p.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-[13px] text-ink-3">{p.title}{current ? ' · you now' : ''}</span>
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-ink-2">{p.blurb}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            </section>
            ))}

            <div className="mt-2 flex gap-2 border-t border-line pt-3">
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
