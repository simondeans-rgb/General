'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays, LayoutGrid, Users, GraduationCap, Route, ClipboardCheck,
  Home, LogOut, Baby, Settings2, Rocket,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useSession, type Role } from '@/lib/auth/session';
import { BarreMark } from './database-gate';
import { EmptyState, Button } from '@/components/ui';

type NavItem = { href: string; label: string; icon: React.ElementType };

/* Each role gets the navigation for the job it actually does. A teacher has no
   use for an enrolment funnel, and showing it only to disable it is worse than
   not showing it. */
const NAV: Record<Role, NavItem[]> = {
  owner: [
    { href: '/today', label: 'Today', icon: LayoutGrid },
    { href: '/schedule', label: 'Schedule', icon: CalendarDays },
    { href: '/people', label: 'People', icon: Users },
    { href: '/classes', label: 'Classes', icon: GraduationCap },
    { href: '/enrolment', label: 'Enrolment', icon: Route },
    { href: '/studio', label: 'Studio', icon: Settings2 },
  ],
  admin: [
    { href: '/today', label: 'Today', icon: LayoutGrid },
    { href: '/schedule', label: 'Schedule', icon: CalendarDays },
    { href: '/people', label: 'People', icon: Users },
    { href: '/classes', label: 'Classes', icon: GraduationCap },
    { href: '/enrolment', label: 'Enrolment', icon: Route },
    { href: '/studio', label: 'Studio', icon: Settings2 },
  ],
  teacher: [
    { href: '/teach', label: 'Today', icon: ClipboardCheck },
    { href: '/teach/students', label: 'Students', icon: Users },
  ],
  guardian: [
    { href: '/family', label: 'Home', icon: Home },
    { href: '/family/schedule', label: 'Schedule', icon: CalendarDays },
    { href: '/family/children', label: 'Family', icon: Baby },
  ],
};

const ROLE_HOME: Record<Role, string> = {
  owner: '/today', admin: '/today', teacher: '/teach', guardian: '/family',
};

export function Shell({
  title, subtitle, actions, children, allow,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  allow: Role[];
}) {
  const { session, signOut, loaded } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (loaded && !session) router.replace('/');
  }, [loaded, session, router]);

  if (!loaded || !session) return <div className="min-h-dvh" />;

  // A route the signed-in role may not use is a redirect, not a 403 page: the
  // person is not an intruder, they are simply in the wrong place.
  if (!allow.includes(session.role)) {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <EmptyState
          title="Not part of your role"
          body={`Signed in as ${session.name}. This area belongs to a different role.`}
          action={<Button variant="primary" onClick={() => router.replace(ROLE_HOME[session.role])}>
            Go to your home
          </Button>}
        />
      </div>
    );
  }

  const nav = NAV[session.role];

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop rail */}
      <aside className="hidden lg:flex w-[236px] shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-line">
          <span className="grid size-7 place-items-center rounded-md bg-accent text-white" aria-hidden>
            <BarreMark className="size-4" />
          </span>
          <span className="font-semibold tracking-tight">Barre</span>
        </div>
        <p className="px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
          Northstar Dance
        </p>
        <nav className="flex-1 px-2" aria-label="Main">
          {nav.map(item => <RailLink key={item.href} item={item} pathname={pathname} />)}
          {(session.role === 'owner' || session.role === 'admin') && (
            <RailLink item={{ href: '/onboarding', label: 'Setup', icon: Rocket }} pathname={pathname} />
          )}
        </nav>
        <div className="border-t border-line p-3">
          <p className="truncate text-sm font-medium">{session.name}</p>
          <p className="text-[12.5px] capitalize text-ink-3">{session.role}</p>
          <button onClick={() => { signOut(); router.replace('/'); }}
                  className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-ink-2 hover:text-ink">
            <LogOut className="size-3.5" aria-hidden /> Switch person
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur
                           supports-[backdrop-filter]:bg-surface/70">
          <div className="flex min-h-14 items-center gap-3 px-4 py-2.5 lg:px-6">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-accent text-white lg:hidden" aria-hidden>
              <BarreMark className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[17px] font-semibold tracking-tight lg:text-[19px]">{title}</h1>
              {subtitle && <div className="truncate text-[13px] text-ink-2">{subtitle}</div>}
            </div>
            {actions}
          </div>
        </header>

        <main id="main" className="flex-1 px-4 pb-24 pt-4 lg:px-6 lg:pb-10">{children}</main>
      </div>

      {/* Mobile tab bar */}
      <nav aria-label="Main"
           className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/95
                      pb-safe backdrop-blur lg:hidden">
        {nav.slice(0, 5).map(item => <TabLink key={item.href} item={item} pathname={pathname} />)}
      </nav>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  const clean = pathname.replace(/\/$/, '');
  return clean === href || (href !== '/teach' && href !== '/family' && clean.startsWith(href + '/'));
}

function RailLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link href={item.href} aria-current={active ? 'page' : undefined}
      className={cn('flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-sm',
        active ? 'bg-accent-soft font-medium text-accent-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink')}>
      <Icon className="size-[17px]" aria-hidden /> {item.label}
    </Link>
  );
}

function TabLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link href={item.href} aria-current={active ? 'page' : undefined}
      className={cn('flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 pt-1.5 text-[11px]',
        active ? 'text-accent' : 'text-ink-3')}>
      <Icon className="size-[19px]" aria-hidden strokeWidth={active ? 2.4 : 1.9} />
      <span className={active ? 'font-medium' : undefined}>{item.label}</span>
    </Link>
  );
}

export { ROLE_HOME };
