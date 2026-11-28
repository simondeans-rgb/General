'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, CornerDownLeft, ArrowRight } from 'lucide-react';
import { useRows } from '@/lib/query';
import { SEARCH, type Hit } from '@/lib/repos/search';
import { useSession } from '@/lib/auth/session';
import { SAVED_VIEWS, assistant } from '@/lib/assistant';
import { cn } from '@/lib/cn';

/**
 * ⌘K. Today it finds the screen that answers a question; when an assistant
 * backend exists, free-text questions go to it. Nothing here pretends to be
 * an AI answer.
 */
const HIT_LABEL: Record<Hit['kind'], string> = { family: 'Family', student: 'Student', staff: 'Staff', invoice: 'Invoice', class: 'Class', enquiry: 'Enquiry' };

export function AssistantLauncher() {
  const { session } = useSession();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);
  const input = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  React.useEffect(() => { if (open) { setQ(''); setActive(0); setTimeout(() => input.current?.focus(), 0); } }, [open]);

  // People and records, for the office. Debounced so each keystroke is not a query.
  const office = session?.role === 'owner' || session?.role === 'admin';
  const [term, setTerm] = React.useState('');
  React.useEffect(() => { const t = setTimeout(() => setTerm(q.trim()), 150); return () => clearTimeout(t); }, [q]);
  const found = useRows<Hit>(['search', term], SEARCH, [term], { enabled: open && office && term.length >= 2 });

  if (!session) return null;
  const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const hits = term.length >= 2 ? (found.data ?? []) : [];
  const views = [
    ...hits.map(h => ({ question: h.title, answer: [HIT_LABEL[h.kind], h.detail].filter(Boolean).join(' · '), href: h.href, kind: h.kind })),
    ...SAVED_VIEWS.filter(v => v.roles.includes(session.role))
      .filter(v => !words.length || words.some(w => `${v.question} ${v.keywords}`.toLowerCase().includes(w)))
      .map(v => ({ ...v, kind: undefined as Hit['kind'] | undefined })),
  ];

  const go = (href: string) => { setOpen(false); router.push(href); };

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Ask or jump (Command K)"
        className="hidden h-9 items-center gap-2 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-[0.8125rem] text-ink-3 hover:border-ink-3 hover:text-ink sm:flex">
        <Search className="size-4" aria-hidden /> Ask or jump
        <kbd className="rounded-[var(--radius-sm)] bg-surface-2 px-1.5 text-[0.6875rem] font-semibold text-ink-2">⌘K</kbd>
      </button>
      <button onClick={() => setOpen(true)} aria-label="Ask or jump"
        className="grid size-[max(44px,1.5rem)] shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-2 sm:hidden">
        <Search className="size-[1.125rem]" aria-hidden />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/30 p-3 pt-[12dvh]" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Ask or jump" onClick={e => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface shadow-lg">
            <div className="flex items-center gap-2 border-b-2 border-ink px-4">
              <Search className="size-4 text-ink-3" aria-hidden />
              <input ref={input} value={q} onChange={e => { setQ(e.target.value); setActive(0); }}
                role="combobox" aria-expanded="true" aria-controls="ask-list" aria-label="Ask a question about the studio"
                placeholder={office ? 'A name, phone number, invoice — or a question' : 'Who hasn’t paid? Which classes are full?'}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, views.length - 1)); }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
                  if (e.key === 'Enter' && views[active]) go(views[active].href);
                }}
                className="h-12 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-ink-3" />
            </div>
            <ul id="ask-list" role="listbox" className="max-h-[50dvh] overflow-y-auto p-1.5">
              {views.map((v, n) => (
                <li key={v.href + v.question} role="option" aria-selected={n === active}>
                  <button onClick={() => go(v.href)} onMouseEnter={() => setActive(n)}
                    className={cn('flex min-h-12 w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left',
                      n === active && 'bg-surface-2')}>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9062rem] font-semibold">{v.question}</span>
                      <span className="block text-[0.8125rem] text-ink-3">{v.answer}</span>
                    </span>
                    {n === active ? <CornerDownLeft className="size-4 text-ink-3" aria-hidden /> : <ArrowRight className="size-4 text-ink-3" aria-hidden />}
                  </button>
                </li>
              ))}
            </ul>
            {/* Honest about the gap: no generated answers without a backend. */}
            {!assistant.available && (
              <div className="border-t border-line px-4 py-3">
                <p className="text-[0.8125rem] text-ink-3">
                  {q && !views.length ? 'No saved view answers that yet. ' : ''}
                  The studio assistant is not connected. When it is, it will answer free-text questions from your
                  studio’s data — seeing only what you can see — and show where each answer came from.
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
