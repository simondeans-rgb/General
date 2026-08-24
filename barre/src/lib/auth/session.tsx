'use client';

import * as React from 'react';
import { uid, NS } from '@/lib/db/seed/data';

/**
 * Who is using the app.
 *
 * In this build the identity is chosen from a list of seeded people rather
 * than proven with a password: there is no server to prove it to. What is NOT
 * simulated is what that identity may see — every query still runs through row
 * level security as that user, so the parent genuinely cannot read another
 * family's records.
 *
 * Moving to Supabase Auth replaces this file and nothing else: the rest of the
 * app only ever asks for `session.userId`.
 */
export type Role = 'owner' | 'admin' | 'teacher' | 'guardian';

export type Persona = {
  userId: string;
  name: string;
  role: Role;
  title: string;
  blurb: string;
};

export const PERSONAS: Persona[] = [
  { userId: uid(NS.user, 1), name: 'Freya Lindqvist', role: 'owner', title: 'Studio owner',
    blurb: 'Runs Northstar. Sees everything: people, money, the whole timetable.' },
  { userId: uid(NS.user, 5), name: 'Nadia Okafor', role: 'admin', title: 'Administrator',
    blurb: 'Day-to-day operations. Everything except studio-level settings.' },
  { userId: uid(NS.user, 2), name: 'Marcus Bell', role: 'teacher', title: 'Teacher',
    blurb: 'Teaches the two tap classes. Sees only his own students — and no billing.' },
  { userId: uid(NS.user, 11), name: 'Hannah Wright', role: 'guardian', title: 'Parent',
    blurb: 'Two children at the studio. Sees her family and nobody else’s.' },
];

export type Session = { userId: string; role: Role; name: string } | null;

type Ctx = {
  session: Session;
  signIn: (p: Persona) => void;
  signOut: () => void;
  loaded: boolean;
};

const SessionContext = React.createContext<Ctx | null>(null);
const KEY = 'barre.session.v1';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch { /* private mode — the app still works, it just will not remember */ }
    setLoaded(true);
  }, []);

  const value = React.useMemo<Ctx>(() => ({
    session,
    loaded,
    signIn: (p) => {
      const next = { userId: p.userId, role: p.role, name: p.name };
      setSession(next);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    },
    signOut: () => {
      setSession(null);
      try { localStorage.removeItem(KEY); } catch {}
    },
  }), [session, loaded]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Ctx {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

/** Roles that may reach each area. Navigation and route guards share this. */
export const CAN: Record<string, Role[]> = {
  dashboard:  ['owner', 'admin'],
  schedule:   ['owner', 'admin'],
  people:     ['owner', 'admin'],
  classes:    ['owner', 'admin'],
  enrolment:  ['owner', 'admin'],
  settings:   ['owner'],
  teach:      ['owner', 'admin', 'teacher'],
  family:     ['guardian'],
};

export const allows = (area: keyof typeof CAN, role: Role | undefined) =>
  !!role && (CAN[area] ?? []).includes(role);
