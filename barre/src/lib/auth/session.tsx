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
export type Role = 'owner' | 'admin' | 'teacher' | 'guardian' | 'student' | 'platform';

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
    blurb: 'Three children at the studio. Sees her family and nobody else’s.' },
  { userId: uid(NS.user, 40), name: 'Amir Wright', role: 'student', title: 'Student',
    blurb: 'Fifteen, and old enough for his own login — which his mum approved.' },
  { userId: uid(NS.user, 190), name: 'Jordan Ellis', role: 'platform', title: 'Barre platform admin',
    blurb: 'Runs Barre itself: every school’s account, plan and owner — but no child’s records.' },
];

/** Barre support looking at one school, read-only, under its owner's grant. */
export type SupportView = { studioId: string; studioName: string; until: string };

type Stored = { userId: string; role: Role; name: string; support?: SupportView };

/**
 * `session.role` is the role the app should behave as. For Barre staff
 * viewing a school that is 'admin' — so every office screen works as it
 * would for the school — while `platform` stays true and the database keeps
 * the view read-only (migration 0019).
 */
export type Session = { userId: string; role: Role; name: string; platform: boolean; support?: SupportView } | null;

type Ctx = {
  session: Session;
  signIn: (p: { userId: string; role: Role; name: string }) => void;
  signOut: () => void;
  enterSupport: (v: SupportView) => void;
  exitSupport: () => void;
  loaded: boolean;
};

const SessionContext = React.createContext<Ctx | null>(null);
const KEY = 'barre.session.v1';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = React.useState<Stored | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStored(JSON.parse(raw) as Stored);
    } catch { /* private mode — the app still works, it just will not remember */ }
    setLoaded(true);
  }, []);

  const save = (next: Stored | null) => {
    setStored(next);
    try { next ? localStorage.setItem(KEY, JSON.stringify(next)) : localStorage.removeItem(KEY); } catch {}
  };

  const value = React.useMemo<Ctx>(() => {
    const live = stored?.support && new Date(stored.support.until) > new Date() ? stored.support : undefined;
    const session: Session = stored ? {
      userId: stored.userId, name: stored.name,
      platform: stored.role === 'platform',
      role: stored.role === 'platform' && live ? 'admin' : stored.role,
      support: stored.role === 'platform' ? live : undefined,
    } : null;
    return {
      session,
      loaded,
      signIn: p => save({ userId: p.userId, role: p.role, name: p.name }),
      signOut: () => save(null),
      enterSupport: v => stored && save({ ...stored, support: v }),
      exitSupport: () => stored && save({ ...stored, support: undefined }),
    };
  }, [stored, loaded]);

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
  learn:      ['student'],
};

export const allows = (area: keyof typeof CAN, role: Role | undefined) =>
  !!role && (CAN[area] ?? []).includes(role);
