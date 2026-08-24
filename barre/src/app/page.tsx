'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { PERSONAS, useSession, type Persona } from '@/lib/auth/session';
import { ROLE_HOME } from '@/components/app/shell';
import { BarreMark } from '@/components/app/database-gate';
import { Badge } from '@/components/ui';

const TONE = { owner: 'accent', admin: 'info', teacher: 'teal', guardian: 'rose', student: 'amber' } as const;

export default function SignIn() {
  const { signIn, session, loaded } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (loaded && session) router.replace(ROLE_HOME[session.role]);
  }, [loaded, session, router]);

  const choose = (p: Persona) => { signIn(p); router.push(ROLE_HOME[p.role]); };

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-5 py-10">
      <div className="mb-8">
        <span className="mb-5 grid size-11 place-items-center rounded-[var(--radius-lg)] bg-accent text-white shadow-sm" aria-hidden>
          <BarreMark className="size-6" />
        </span>
        <h1 className="text-[27px] font-semibold tracking-[-0.022em]">Barre</h1>
        <p className="mt-1 text-ink-2">The operating system for running a dance studio.</p>
      </div>

      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-3">
        Choose who to sign in as
      </h2>

      <ul className="space-y-2.5">
        {PERSONAS.map(p => (
          <li key={p.userId}>
            <button
              onClick={() => choose(p)}
              className="group flex w-full items-center gap-3.5 rounded-[var(--radius-lg)] border border-line
                         bg-surface p-3.5 text-left shadow-xs transition-[border-color,box-shadow]
                         hover:border-line-strong hover:shadow-sm focus-visible:border-accent">
              <span aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2
                               text-[15px] font-semibold text-ink-2">
                {p.name.split(' ').map(w => w[0]).join('')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  <Badge tone={TONE[p.role]}>{p.title}</Badge>
                </span>
                <span className="mt-0.5 block text-[13px] text-ink-2">{p.blurb}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      {/* Being straight about what this is. The permissions are real; the
          password check is the part that is missing, and pretending otherwise
          would be the wrong kind of demo. */}
      <div className="mt-7 flex gap-3 rounded-[var(--radius-lg)] border border-line bg-surface-2 p-4">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
        <p className="text-[13px] leading-relaxed text-ink-2">
          <strong className="font-medium text-ink">This is a demo, and it runs on a real database.</strong>{' '}
          Postgres is compiled to WebAssembly and running in your browser, with the same
          schema and the same row level security policies the production app uses. Picking a
          person here skips the password, but not the permissions: Marcus really cannot see
          another teacher's students, and Hannah really cannot see another family's invoices —
          the database refuses, not the interface.
        </p>
      </div>
    </div>
  );
}
