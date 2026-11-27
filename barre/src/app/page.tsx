'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { PERSONA_GROUPS, useSession, type Persona } from '@/lib/auth/session';
import { ROLE_HOME } from '@/components/app/shell';
import { SwayvoLogo } from '@/components/app/swayvo';
import { useSchoolTheme } from '@/components/app/brand';
import { SWAYVO } from '@/lib/swayvo-logo';

/**
 * The first screen. Swayvo at full volume once — Count blue, the count, the
 * tagline — then a white sheet with the people you can be. It stands in for
 * real sign-in (R-001): the permissions behind each person are real.
 */
export default function SignIn() {
  const { signIn, session, loaded } = useSession();
  const router = useRouter();
  // This page is Swayvo's own, whatever school the last person belonged to.
  useSchoolTheme(null);

  const choose = (p: Persona) => { signIn(p); router.push(ROLE_HOME[p.role]); };

  return (
    <main id="main" className="min-h-dvh bg-surface lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand side: Count blue, white logo, peach downbeat. */}
      <section aria-labelledby="tagline" style={{ background: SWAYVO.blue, color: SWAYVO.white }}
        className="flex flex-col px-6 pb-8 pt-8 sm:px-10 lg:sticky lg:top-0 lg:h-dvh lg:px-14 lg:pb-14 lg:pt-12">
        <h1><SwayvoLogo tone="white" className="h-8 lg:h-10" /></h1>
        <div className="mt-10 lg:mt-auto">
          <p id="tagline" className="font-display text-[2.75rem] font-[850] leading-[0.92] tracking-[-0.02em] [font-stretch:112%] sm:text-[3.5rem] lg:text-[4.5rem]">
            Five, six, seven, <span style={{ color: SWAYVO.peach }}>eight.</span>
          </p>
          <Count />
          <p className="font-display text-[1.25rem] font-[800] leading-tight [font-stretch:112%] lg:text-[1.5rem]">More time for dance.</p>
          <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-white/85">
            Classes, registers, payments, messages and progress for dance schools.
          </p>
        </div>
      </section>

      {/* The picker: who to be. */}
      <section aria-labelledby="pick-h" className="-mt-4 rounded-t-[20px] bg-surface px-5 pb-12 pt-7 sm:px-10 lg:mt-0 lg:rounded-none lg:px-16 lg:pt-14">
        <div className="mx-auto max-w-xl">
          <h2 id="pick-h" className="font-display text-[1.625rem] font-[800] leading-tight [font-stretch:112%]">Sign in</h2>
          <p className="mt-1 text-[0.9375rem] text-ink-2">This is a demo, so there’s no password. Choose a person and you see exactly what they would.</p>

          {loaded && session && (
            <button onClick={() => router.push(session.platform && !session.support ? '/platform' : ROLE_HOME[session.role])}
              className="group mt-6 flex min-h-12 w-full items-center gap-3 rounded-[var(--radius-md)] bg-accent px-4 py-3 text-left text-on-accent hover:bg-accent-hover">
              <span className="min-w-0 flex-1 font-semibold">Continue as {session.name}</span>
              <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          )}

          {PERSONA_GROUPS().map(g => (
            <section key={g.title} className="mt-9" aria-labelledby={`grp-${g.title}`}>
              <div className="border-b-2 border-ink pb-2">
                <h3 id={`grp-${g.title}`} className="section-title">{g.title}</h3>
                <p className="text-[0.8125rem] text-ink-3">{g.blurb}</p>
              </div>
              <ul className="divide-y divide-line">
                {g.people.map(p => (
                  <li key={p.userId}>
                    <button onClick={() => choose(p)}
                      className="group grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3.5 py-3.5 text-left hover:bg-surface-2/60 focus-visible:bg-surface-2/60">
                      <span aria-hidden className="grid size-11 place-items-center rounded-full bg-surface-2 font-display text-[0.9375rem] font-[800] text-ink-2">
                        {p.name.split(' ').map(w => w[0]).join('')}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-[0.8125rem] text-ink-3">{p.title}</span>
                        </span>
                        <span className="mt-0.5 block text-[0.875rem] leading-snug text-ink-2">{p.blurb}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-text" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* Being straight about what this is. The permissions are real; the
              password check is the part that is missing. */}
          <div className="mt-10 border-t border-line pt-4">
            <p className="text-[0.8125rem] font-semibold text-ink">A demo on a real database</p>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-3">
              Postgres runs in your browser with the same schema and row level security as the production app.
              Choosing a person skips the password, not the permissions: Marcus cannot see another teacher’s
              students and Hannah cannot see another family’s invoices — the database refuses, not the interface.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/** The eight-count, drawn large: peach downbeat, beat five lifted. */
function Count() {
  const h = [100, 40, 40, 40, 72, 40, 40, 40];
  return (
    <div aria-hidden className="my-7 flex h-14 items-end gap-1.5 lg:my-9 lg:h-[72px]">
      {h.map((v, i) => (
        <span key={i} className="block w-3 rounded-[2px] lg:w-3.5"
          style={{ height: `${v}%`, marginLeft: i === 4 ? 8 : 0, background: i === 0 ? SWAYVO.peach : 'rgb(255 255 255 / 0.32)' }} />
      ))}
    </div>
  );
}
