'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays, LayoutGrid, Users, GraduationCap, Route, ClipboardCheck,
  Home, Baby, User, MessageSquare, CreditCard, PlayCircle, Trophy, Inbox, Settings2, Rocket,
  MoreHorizontal, MoreVertical, ChevronDown, FolderOpen, Receipt, BarChart3, Building2, Layers, KeyRound, ShieldCheck, LogOut, FileText, ShieldAlert, CircleHelp, Check,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useSession, type Role } from '@/lib/auth/session';
import { SwayvoLogo, SwayvoIcon } from './swayvo';
import { SchoolMark, PoweredBy, useSchoolTheme, logoFor } from './brand';
import { EmptyState, Button } from '@/components/ui';
import { useRows } from '@/lib/query';
import { MY_CHILDREN } from '@/lib/repos/family';
import { runAs } from '@/lib/db/client';
import { useQueryClient } from '@tanstack/react-query';
import { dateShort, time } from '@/lib/format';
import { PersonSwitcher } from './person-switcher';
import { SchoolSwitcher } from './school-switcher';
import { useBrandedInstall } from './pwa';
import { NotificationBell } from './notifications';
import { ScopeNotice } from './role-scope';
import { useLocationHash, sectionActive, onSectionClick } from './section-hash';
import dynamic from 'next/dynamic';
// Office-only, so families and teachers never download it (R-062).
const AssistantLauncher = dynamic(() => import('./assistant').then(m => m.AssistantLauncher), { ssr: false });

type NavItem = {
  href: string; label: string; icon: React.ElementType;
  /** Shown directly in the phone tab bar. Anything else goes behind "More" —
   *  previously the list was simply truncated at five, which left Classes,
   *  Enrolment and Studio unreachable on a phone. */
  primary?: boolean;
  /** Screens grouped under this area, shown as tabs at the top of each (R-027). */
  sub?: { href: string; label: string; ownerOnly?: boolean }[];
};

/* Each role gets the navigation for the job it actually does. A teacher has no
   use for an enrolment funnel, and showing it only to disable it is worse than
   not showing it. */
const OFFICE_NAV: NavItem[] = [
  { href: '/today', label: 'Today', icon: LayoutGrid, primary: true },
  { href: '/schedule', label: 'Timetable', icon: CalendarDays, primary: true,
    sub: [{ href: '/schedule', label: 'Schedule' }, { href: '/classes', label: 'Classes' }, { href: '/events', label: 'Events' }] },
  { href: '/people', label: 'People', icon: Users, primary: true,
    sub: [{ href: '/people', label: 'Families and students' }, { href: '/enrolment', label: 'Enrolment' }] },
  { href: '/inbox', label: 'Messages', icon: MessageSquare, primary: true,
    sub: [{ href: '/inbox', label: 'Inbox' }, { href: '/requests', label: 'Requests' }] },
  { href: '/billing', label: 'Money', icon: Receipt,
    sub: [{ href: '/billing', label: 'Billing' }, { href: '/reports', label: 'Reports' }] },
  { href: '/studio', label: 'Settings', icon: Settings2,
    // One row of settings tabs (U4): school settings and account sections
    // are sections of their pages, addressed by the hash.
    sub: [{ href: '/studio', label: 'Details' }, { href: '/studio#places', label: 'Places' }, { href: '/studio#terms', label: 'Terms' },
          { href: '/studio#teaching', label: 'Teaching' }, { href: '/studio#money', label: 'Money' },
          { href: '/safeguarding', label: 'Safeguarding' },
          { href: '/account', label: 'Brand' }, { href: '/account#plan', label: 'Plan' }, { href: '/account#people', label: 'People and access' },
          { href: '/account#data', label: 'Data and privacy', ownerOnly: true }, { href: '/account#history', label: 'History' },
          { href: '/onboarding', label: 'Setup' }] },
];

const NAV: Record<Role, NavItem[]> = {
  owner: OFFICE_NAV,
  admin: OFFICE_NAV,
  teacher: [
    { href: '/teach', label: 'Today', icon: ClipboardCheck },
    { href: '/teach/students', label: 'Students', icon: Users },
    { href: '/teach/messages', label: 'Messages', icon: MessageSquare },
    { href: '/teach/material', label: 'Material', icon: FolderOpen },
    { href: '/teach/reports', label: 'Reports', icon: FileText },
  ],
  guardian: [
    { href: '/family', label: 'Home', icon: Home },
    { href: '/family/schedule', label: 'Schedule', icon: CalendarDays },
    { href: '/family/messages', label: 'Messages', icon: MessageSquare },
    { href: '/family/payments', label: 'Payments', icon: CreditCard },
    { href: '/family/children', label: 'Family', icon: Baby },
  ],
  platform: [
    { href: '/platform', label: 'Schools', icon: Building2 },
    { href: '/platform/plans', label: 'Plans', icon: Layers },
    { href: '/platform/pilot', label: 'Pilot', icon: Rocket },
  ],
  student: [
    { href: '/learn', label: 'Today', icon: Home },
    { href: '/learn/timetable', label: 'Timetable', icon: CalendarDays },
    { href: '/learn/library', label: 'Library', icon: PlayCircle },
    { href: '/learn/feedback', label: 'Feedback', icon: MessageSquare },
    { href: '/learn/events', label: 'Events', icon: Trophy },
  ],
};

const ROLE_HOME: Record<Role, string> = {
  owner: '/today', admin: '/today', teacher: '/teach',
  guardian: '/family', student: '/learn', platform: '/platform',
};

/** Root text size in px, tracked live (browser or OS text size, or a zoom
 *  that changes it). Large text is 150% or more of the 16px default (U1). */
function useLargeText(): boolean {
  const read = () => typeof window === 'undefined' ? 16 : parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const [px, setPx] = React.useState(read);
  React.useEffect(() => {
    const probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:absolute;visibility:hidden;width:1rem;height:0;pointer-events:none';
    document.body.appendChild(probe);
    const ro = new ResizeObserver(() => setPx(probe.getBoundingClientRect().width || read()));
    ro.observe(probe);
    return () => { ro.disconnect(); probe.remove(); };
  }, []);
  return px >= 24;
}

/** Whether the desktop layout (rail, tab rows) is showing: Tailwind's lg. */
function useDesktop(): boolean {
  const q = '(min-width: 64rem)';
  const [on, setOn] = React.useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  React.useEffect(() => {
    const m = window.matchMedia(q);
    const fn = () => setOn(m.matches);
    fn(); m.addEventListener('change', fn);
    return () => m.removeEventListener('change', fn);
  }, []);
  return on;
}

/** Header icon buttons: at least 44px, growing with the text but not doubling (U1). */
export const HEADER_ICON = 'grid size-[max(44px,1.5rem)] shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-ink';

export function Shell({
  title, subtitle, actions, children, allow, help, actionsInline, noSchoolSwitch,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  allow: Role[];
  /** A short "what is this screen for" note (R-061). */
  help?: React.ReactNode;
  /** Icon-only actions stay in the top row on a phone instead of taking a row of their own. */
  actionsInline?: boolean;
  /** Inside a register, switching school is never right: no switcher row on a phone. */
  noSchoolSwitch?: boolean;
}) {
  const [helpOpen, setHelpOpen] = React.useState(false);
  // Phone header menus: the area's screens under the title, and (at large
  // text) everything that is not the title or the bell (U1, U10).
  const [menu, setMenu] = React.useState<null | 'area' | 'more'>(null);
  const hash = useLocationHash();
  const large = useLargeText();
  const desktop = useDesktop();
  const compact = large && !desktop;
  const { session, signOut, loaded } = useSession();
  // The school this person is in (or, for Swayvo support, viewing).
  const studio = useRows<{ name: string; status: string; data_deletion_due_on: string | null;
                           brand_colour: string | null; logo_url: string | null; theme: string; brand_secondary: string | null; logo_light_url: string | null }>(
    ['shell-studio'], `select name, status, data_deletion_due_on, brand_colour, logo_url, theme, brand_secondary, logo_light_url from studio order by created_at limit 1`, [],
    { enabled: !!session && (!session.platform || !!session.support), staleTime: 60_000 }).data?.[0];
  const branded = !!studio && (!session?.platform || !!session?.support);
  useSchoolTheme(branded ? studio! : null);
  useBrandedInstall(branded ? studio : null);
  const router = useRouter();
  const pathname = usePathname();
  // A student's access ends the moment a parent switches their login off, or
  // until one approves it (UR-16): the database already returns nothing.
  const self = useRows<{ id: string | null }>(['student-self-check'], `select app.student_self_id() as id`, [],
    { enabled: session?.role === 'student' });
  const loginOff = session?.role === 'student' && self.isSuccess && !self.data?.[0]?.id;
  // An adult student with no children: their tab is about them, not a family (UR-21).
  const people = useRows<{ is_me: boolean }>(['my-children'], MY_CHILDREN, [], { enabled: session?.role === 'guardian' });
  const adultAlone = !!people.data?.length && people.data.every(p => p.is_me);
  // A teacher's "just registers" setting (F14): Today alone in the tab bar, the rest under More.
  const regOnly = useRows<{ on: boolean }>(['register-only'], `select app.my_register_only() as on`, [],
    { enabled: session?.role === 'teacher' }).data?.[0]?.on === true;

  React.useEffect(() => {
    if (loaded && !session) router.replace('/');
  }, [loaded, session, router]);
  React.useEffect(() => { setMenu(null); }, [pathname]);
  React.useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menu]);

  if (!loaded || !session) return <div className="min-h-dvh" />;

  // A route the signed-in role may not use is a redirect, not a 403 page: the
  // person is not an intruder, they are simply in the wrong place.
  if (loginOff) {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <EmptyState title="Your login is off"
          body="A parent or carer needs to approve your login, or has switched it off. Ask them, or the school, if you think this is wrong."
          action={<Button variant="primary" onClick={() => { signOut(); router.replace('/'); }}>Sign out</Button>} />
      </div>
    );
  }

  if (!allow.includes(session.role)) {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <EmptyState
          title="Not part of your role"
          body={`Signed in as ${session.name}. This area belongs to a different role.`}
          action={
            /* The switcher belongs here too. Without it this screen is a dead
               end: the one place you land when you are the wrong person is the
               one place you cannot become someone else. */
            <div className="flex items-center justify-center gap-2">
              <Button variant="primary" onClick={() => router.replace(ROLE_HOME[session.role])}>
                Go to your home
              </Button>
              <PersonSwitcher />
            </div>
          }
        />
      </div>
    );
  }

  const nav = (adultAlone
    ? NAV[session.role].map(n => n.href === '/family/children' ? { ...n, label: 'You', icon: User } : n)
    : regOnly && session.role === 'teacher'
      ? NAV.teacher.map(n => n.href === '/teach' ? { ...n, primary: true } : n)
      : NAV[session.role]).map(n => n.sub && (session.role !== 'owner' || session.platform || session.support)
      ? { ...n, sub: n.sub.filter(x => !x.ownerOnly) } : n);

  const office = session.role === 'owner' || session.role === 'admin';
  const area = nav.find(i => i.sub && i.sub.length > 1 && groupActive(pathname, i));

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh lg:flex w-[232px] shrink-0 flex-col border-r border-line bg-surface">
        {/* The school's own name and logo; Swayvo steps back to a credit. */}
        <div className="px-5 pb-4 pt-5">
          {branded ? (
            <div className="flex items-center gap-2.5">
              <SchoolMark name={studio!.name} logo={logoFor(studio!)} className="size-9" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[0.875rem] font-semibold leading-tight tracking-tight">{studio!.name}</span>
                <PoweredBy />
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <SwayvoLogo className="h-6" />
              <span className="min-w-0">
                <span className="sr-only">Swayvo</span>
                {session.platform && !session.support && <span className="block text-[0.7188rem] text-ink-3">Platform</span>}
              </span>
            </div>
          )}
        </div>
        <SchoolSwitcher className="border-b border-line" />
        <nav className="flex-1 overflow-y-auto px-3 pt-2" aria-label="Main">
          {nav.map(item => <RailLink key={item.href} item={item} pathname={pathname} />)}
        </nav>
        <div className="flex items-center gap-2.5 border-t border-line p-3">
          <PersonSwitcher />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{session.name}</p>
            <p className="text-[0.7812rem] capitalize text-ink-3">{session.support ? "Swayvo support" : session.platform ? "Swayvo platform" : session.role}</p>
            <PersonSwitcher label="Switch person" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-surface">
          <div className={cn('relative flex flex-wrap items-center gap-x-2 gap-y-2 px-4 lg:min-h-[68px] lg:flex-nowrap lg:gap-x-3 lg:px-8 lg:py-2.5',
            compact ? 'py-1' : 'min-h-14 py-2.5')}>
            {branded
              ? <SchoolMark name={studio!.name} logo={logoFor(studio!)} className={cn('shrink-0 lg:hidden', compact ? 'size-[28px]' : 'size-8')} />
              : <SwayvoIcon className={cn('shrink-0 lg:hidden', compact ? 'size-[28px]' : 'size-8')} />}
            {/* At least 7rem for the title: with large text the buttons wrap to a second row instead. */}
            <div className={cn('min-w-0 flex-1', !compact && 'min-w-[min(100%,7rem)]')}>
              <h1 className="page-title line-clamp-2 break-words tracking-tight [hyphens:auto]">
                {area && !desktop && !compact ? (
                  /* On a phone the area's other screens sit under the title, not in a second tab row (U10). */
                  <button onClick={() => setMenu(m => m === 'area' ? null : 'area')} aria-expanded={menu === 'area'} aria-controls="area-menu"
                    className="inline-flex max-w-full items-center gap-1 text-left">
                    <span className="line-clamp-2 min-w-0 break-words">{title}</span>
                    <ChevronDown aria-hidden className={cn('size-[0.8em] shrink-0 text-ink-3 transition-transform', menu === 'area' && 'rotate-180')} />
                    <span className="sr-only">, {area.label}: other screens</span>
                  </button>
                ) : title}
              </h1>
              {subtitle && !compact && <div className="mt-0.5 line-clamp-2 text-[0.8125rem] text-ink-3">{subtitle}</div>}
            </div>
            {help && !compact && !(area && !desktop) && (
              <button onClick={() => setHelpOpen(o => !o)} aria-expanded={helpOpen} aria-controls="page-help"
                aria-label={`About ${title}`} className={HEADER_ICON}>
                <CircleHelp className="size-[1.125rem]" aria-hidden />
              </button>
            )}
            {office && !compact && <AssistantLauncher />}
            {/* Students get a bell too, for cancellations and cover (UR-49). */}
            <NotificationBell />
            {/* Office people switch person from More; others keep their avatar here (U10). */}
            {!office && !compact && <PersonSwitcher className="lg:hidden" />}
            {compact && (
              <button onClick={() => setMenu(m => m === 'more' ? null : 'more')} aria-expanded={menu === 'more'} aria-controls="header-more"
                aria-label="More for this screen" className={HEADER_ICON}>
                <MoreVertical className="size-[1.125rem]" aria-hidden />
              </button>
            )}
            {/* The page's own buttons: in the title row when they fit, else on a row of their own. */}
            {actions && !compact && (
              <div className={cn('flex justify-end', actionsInline ? '' : 'order-last ml-auto lg:order-none lg:ml-0')}>{actions}</div>
            )}
          </div>
          {compact && (
            /* Kept mounted while closed, so a sheet an action opens keeps its state. */
            <div id="header-more" hidden={menu !== 'more'} className="space-y-3 border-t border-line px-4 py-3"
              onClick={e => { if ((e.target as HTMLElement).closest('button, a')) setTimeout(() => setMenu(null), 0); }}>
              {subtitle && <div className="text-[0.8125rem] text-ink-3">{subtitle}</div>}
              {/* There is room here for the words a phone header hides ("+" becomes "+ New family"). */}
              {actions && <div className="flex flex-wrap gap-2 [&>*]:flex-wrap [&_.hidden.sm\:inline]:inline [&_.sm\:hidden]:hidden">{actions}</div>}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {help && (
                  <button onClick={() => setHelpOpen(o => !o)} aria-expanded={helpOpen} aria-controls="page-help"
                    className="inline-flex min-h-11 items-center gap-2 text-[0.875rem] font-semibold text-ink-2">
                    <CircleHelp className="size-[1.125rem]" aria-hidden /> About this screen
                  </button>
                )}
                {office && <AssistantLauncher />}
                {!office && <span className="inline-flex min-h-11 items-center gap-2"><PersonSwitcher /> <PersonSwitcher label="Switch person" /></span>}
              </div>
              {!noSchoolSwitch && <SchoolSwitcher className="-mx-3" />}
            </div>
          )}
          {area && !desktop && (
            <nav id="area-menu" aria-label={area.label} hidden={menu !== (compact ? 'more' : 'area')} className="border-t border-line px-2 py-2">
              <ul className="grid gap-0.5 sm:grid-cols-2">
                {area.sub!.map(x => {
                  const active = subActive(area, x.href, pathname, hash);
                  return (
                    <li key={x.href}>
                      <Link href={x.href} aria-current={active ? 'page' : undefined}
                        onClick={e => { onSectionClick(e, x.href, pathname); setMenu(null); }}
                        className={cn('flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-2 text-[0.9375rem]',
                          active ? 'font-semibold text-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink')}>
                        <Check aria-hidden className={cn('size-[1em] shrink-0', active ? 'text-ink' : 'text-transparent')} />
                        {x.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {help && !compact && (
                <button onClick={() => { setHelpOpen(o => !o); setMenu(null); }} aria-expanded={helpOpen} aria-controls="page-help"
                  className="mt-1 flex min-h-11 w-full items-center gap-2 border-t border-line px-2 pt-1 text-[0.9375rem] text-ink-2 hover:text-ink">
                  <CircleHelp className="size-[1em] shrink-0" aria-hidden /> About this screen
                </button>
              )}
            </nav>
          )}
          {!noSchoolSwitch && !compact && <SchoolSwitcher className="border-t border-line lg:hidden" />}
          {desktop && <SubTabs nav={nav} pathname={pathname} />}
        </header>

        {help && helpOpen && (
          <div id="page-help" role="note" className="border-b border-line bg-info-soft px-4 py-3 text-[0.8438rem] leading-relaxed text-ink-2 lg:px-6">
            <div className="mx-auto flex max-w-3xl gap-2"><CircleHelp className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
              <div className="min-w-0 flex-1">{help}</div>
              <button onClick={() => setHelpOpen(false)} className="text-[0.7812rem] font-medium text-ink-2 underline">Close</button></div>
          </div>
        )}
        {session.support && <SupportBanner view={session.support} />}
        {!session.platform && studio && (studio.status === 'suspended' || studio.status === 'cancelled') && (
          <div role="status" className="border-b border-caution/30 bg-caution-soft px-4 py-2.5 text-[0.8125rem] lg:px-6">
            <strong className="font-semibold">
              {studio.status === 'suspended' ? 'This account is paused and read-only.' : 'This account has been closed and is read-only.'}
            </strong>{' '}
            {studio.status === 'cancelled' && studio.data_deletion_due_on
              ? `Everything can still be viewed and exported until ${dateShort(studio.data_deletion_due_on)}, when it will be deleted.`
              : 'Everything can still be viewed, but nothing can be changed.'}
            {(session.role === 'owner') && <> <Link href="/account" className="font-medium underline">Account</Link></>}
          </div>
        )}
        <main id="main" className="flex-1 px-4 pb-24 pt-5 lg:px-8 lg:pb-12 lg:pt-7">
          <ScopeNotice />
          {/* At large text the subtitle leaves the header for the top of the page (U1). */}
          {compact && subtitle && <div className="-mt-1 mb-4 text-[0.8125rem] text-ink-3">{subtitle}</div>}
          {children}
          {/* On a phone the sidebar's name and credit are not visible. */}
          {branded && (
            <p className="mt-8 flex flex-col items-center gap-0.5 text-center lg:hidden">
              <span className="text-[0.7812rem] font-medium text-ink-2">{studio!.name}</span>
              <PoweredBy className="mt-0" />
            </p>
          )}
        </main>
      </div>

      <MobileTabs nav={nav} pathname={pathname} who={office ? session.name : null} />
    </div>
  );
}

function isActive(pathname: string, href: string) {
  href = href.split('#')[0]!;
  const clean = pathname.replace(/\/$/, '');
  return clean === href || (!['/teach','/family','/learn','/platform'].includes(href) && clean.startsWith(href + '/'));
}
const groupActive = (pathname: string, item: NavItem) =>
  item.sub ? item.sub.some(x => isActive(pathname, x.href)) : isActive(pathname, item.href);

/** Whether one of an area's screens is the current one (some are sections of a page, by hash). */
function subActive(group: NavItem, href: string, pathname: string, hash: string) {
  return href.includes('#') || group.sub!.some(o => o.href !== href && o.href.startsWith(href + '#'))
    ? sectionActive(group.sub!, href, pathname, hash) : isActive(pathname, href);
}

/** The screens of the current area, as tabs (R-027). */
function SubTabs({ nav, pathname }: { nav: NavItem[]; pathname: string }) {
  const hash = useLocationHash();
  const group = nav.find(i => i.sub && i.sub.length > 1 && groupActive(pathname, i));
  if (!group) return null;
  return (
    <nav aria-label={group.label} className="relative -mb-px flex gap-4 overflow-x-auto px-4 lg:px-8">
      {group.sub!.map(x => {
        const active = subActive(group, x.href, pathname, hash);
        return (
          <Link key={x.href} href={x.href} aria-current={active ? 'page' : undefined} onClick={e => onSectionClick(e, x.href, pathname)}
            className={cn('shrink-0 border-b-2 py-2.5 text-[0.8438rem]',
              active ? 'border-accent-line font-semibold text-ink' : 'border-transparent font-medium text-ink-3 hover:text-ink')}>
            {x.label}
          </Link>
        );
      })}
    </nav>
  );
}

function RailLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = groupActive(pathname, item);
  const Icon = item.icon;
  return (
    <Link href={item.href} aria-current={active ? 'page' : undefined}
      className={cn('relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[0.875rem]',
        active ? 'font-semibold text-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink')}>
      {/* The active area is marked by one beat, in the school's colour. */}
      {active && <span aria-hidden className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-[2px] bg-accent" />}
      <Icon className={cn('size-[18px]', active ? 'text-ink' : 'text-ink-3')} aria-hidden strokeWidth={active ? 2.2 : 1.8} /> {item.label}
    </Link>
  );
}

/** At most five targets in the bar; the remainder live behind More. */
function MobileTabs({ nav, pathname, who }: { nav: NavItem[]; pathname: string; who: string | null }) {
  const [open, setOpen] = React.useState(false);
  const hash = useLocationHash();
  const marked = nav.filter(i => i.primary);
  const shown = marked.length ? marked : nav.length <= 5 ? nav : nav.slice(0, 4);
  const rest = nav.filter(i => !shown.includes(i));

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <nav aria-label="Main"
           className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/95
                      pb-safe backdrop-blur lg:hidden">
        {shown.map(item => <TabLink key={item.href} item={item} pathname={pathname} />)}
        {rest.length > 0 && (
          <button onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label="More sections"
            className={cn(TAB_CLASS, 'font-medium', rest.some(i => groupActive(pathname, i)) ? 'text-ink' : 'text-ink-3')}>
            {rest.some(i => groupActive(pathname, i)) && <span aria-hidden className="absolute left-1/2 top-0 h-[3px] w-6 -translate-x-1/2 rounded-b-[2px] bg-accent" />}
            <MoreHorizontal className={TAB_ICON} aria-hidden />
            <span className={TAB_LABEL}>More</span>
          </button>
        )}
      </nav>

      {open && createPortal(
        <div className="fixed inset-0 z-[60] flex items-end bg-ink/30 lg:hidden" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="More sections"
               onClick={e => e.stopPropagation()}
               className="max-h-[80dvh] w-full overflow-y-auto rounded-t-[var(--radius-xl)] border-t
                          border-line bg-surface p-3 pb-safe shadow-lg">
            {/* On a phone the office switches person here, not from the header (U10). */}
            {who && (
              <div className="mb-2 flex items-center gap-3 border-b border-line px-3 pb-3 pt-1">
                <PersonSwitcher />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{who}</span>
                  <PersonSwitcher label="Switch person" />
                </span>
              </div>
            )}
            <ul className="space-y-1">
              {rest.map(item => {
                const Icon = item.icon;
                // Each area's screens are listed, so any screen is two taps away.
                const links = item.sub ?? [{ href: item.href, label: item.label }];
                return (
                  <li key={item.href}>
                    {item.sub && <p className="flex items-center gap-2 px-3 pb-1 pt-2 text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-ink-3">
                      <Icon className="size-3.5" aria-hidden /> {item.label}</p>}
                    <ul>
                      {links.map(x => {
                        const active = x.href.includes('#') || links.some(o => o !== x && o.href.startsWith(x.href + '#'))
                          ? sectionActive(links, x.href, pathname, hash) : isActive(pathname, x.href);
                        return (
                          <li key={x.href}>
                            <Link href={x.href} onClick={e => { onSectionClick(e, x.href, pathname); setOpen(false); }} aria-current={active ? 'page' : undefined}
                              className={cn('flex min-h-[48px] items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm',
                                active ? 'bg-accent-soft font-medium text-accent-ink' : 'hover:bg-surface-2')}>
                              {!item.sub && <Icon className="size-[18px]" aria-hidden />} {x.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/* Tab bar labels grow with the text up to 14px, then wrap to a second line
   rather than truncate ("Mes…"); icons grow up to 28px. Five labels at 14px
   fit a 320px phone (U1). */
const TAB_CLASS = 'relative flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 pb-1 pt-2 text-[min(0.6875rem,14px)]';
const TAB_ICON = 'size-[min(1.25rem,28px)] shrink-0';
const TAB_LABEL = 'max-w-full text-center leading-tight [overflow-wrap:anywhere]';

function TabLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = groupActive(pathname, item);
  const Icon = item.icon;
  return (
    <Link href={item.href} aria-current={active ? 'page' : undefined}
      className={cn(TAB_CLASS, active ? 'text-ink' : 'text-ink-3')}>
      {active && <span aria-hidden className="absolute left-1/2 top-0 h-[3px] w-6 -translate-x-1/2 rounded-b-[2px] bg-accent" />}
      <Icon className={TAB_ICON} aria-hidden strokeWidth={active ? 2.3 : 1.8} />
      <span className={cn(TAB_LABEL, active ? 'font-semibold' : 'font-medium')}>{item.label}</span>
    </Link>
  );
}

export { ROLE_HOME };

/** Always on screen while Swayvo support is inside a school. */
function SupportBanner({ view }: { view: { studioId: string; studioName: string; until: string } }) {
  const { session, exitSupport } = useSession();
  const router = useRouter();
  const qc = useQueryClient();
  const exit = async () => {
    try { await runAs(session, q => q('select app.end_support_session()')); } catch { /* ends on expiry anyway */ }
    exitSupport();
    qc.clear();
    router.push('/platform');
  };
  return (
    <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-ink/10 bg-ink px-4 py-2 text-[0.8125rem] text-surface lg:px-6">
      <ShieldCheck className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">
        <strong className="font-semibold">Viewing {view.studioName} as Swayvo support.</strong>{' '}
        Read-only, with the owner’s permission, until {dateShort(view.until)} {time(view.until)}. Health records are not shown.
      </span>
      <button onClick={exit} className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full bg-surface/15 px-3 font-medium hover:bg-surface/25">
        <LogOut className="size-3.5" aria-hidden /> Leave
      </button>
    </div>
  );
}

/** Each theme's signature, quietly behind the page title. Decorative only. */
