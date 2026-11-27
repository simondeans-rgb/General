import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Beats, Button, Notice } from '@/components/ui';
import { SwayvoLogo } from '@/components/app/swayvo';
import { SWAYVO } from '@/lib/swayvo-logo';
import { cn } from '@/lib/cn';
import { RegisterDemo, SchoolSamples, SwayvoOwnTheme } from './parts';
import './welcome.css';

export const metadata: Metadata = {
  title: 'Swayvo · More time for dance',
  description: 'Timetable, registers, payments, messages and each student’s progress, in one place for dance schools.',
  openGraph: {
    title: 'Swayvo · More time for dance',
    description: 'Everything a dance school runs on, kept on the count.',
    images: [{ url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/brand/store/og.png`, width: 1200, height: 628 }],
  },
};

/**
 * Swayvo's own website (GUIDELINES §8): the hero on Count blue, then the
 * messaging hierarchy from STRATEGY.md in order, each point shown with the
 * product's real components at real size and Northstar's sample content.
 * One call to action: Book a demo.
 */
export default function Welcome() {
  return (
    <div className="welcome-page bg-surface text-ink">
      <SwayvoOwnTheme />
      <main id="main">
        <Hero />
        <RunsOn />
        <Progress />
        <Safe />
        <YourSchool />
        <EveryStyle />
        <HowItStarts />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

const WRAP = 'mx-auto w-full max-w-[1240px] px-4 sm:px-8 lg:px-12';
/** Focus on Count blue: the usual blue ring would vanish, so it turns white. */
const ON_BLUE = '[&_a:focus-visible]:outline-white [&_button:focus-visible]:outline-white';

function SectionIntro({ id, title, children, className }: { id: string; title: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('max-w-2xl', className)}>
      <h2 id={id} className="font-display text-[2.125rem] leading-[1.02] tracking-[-0.02em] lg:text-[3rem]">{title}</h2>
      {children && <div className="mt-4 space-y-3 text-[1.0625rem] leading-relaxed text-ink-2">{children}</div>}
    </div>
  );
}

/** A product screen at real size, on the app's own ground, with a caption. */
function Screen({ caption, children, className }: { caption: string; children: React.ReactNode; className?: string }) {
  return (
    <figure className={cn('min-w-0', className)}>
      <div inert className="overflow-hidden rounded-[var(--radius-xl)] border border-line bg-canvas">{children}</div>
      <figcaption className="mt-2 text-[0.8125rem] text-ink-3">{caption}</figcaption>
    </figure>
  );
}

function ScreenTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="border-b border-line bg-surface px-4 py-3 sm:px-5">
      <p className="page-title">{title}</p>
      {sub && <p className="mt-0.5 text-[0.8438rem] text-ink-3">{sub}</p>}
    </div>
  );
}

/** Sentence-case heading with the 2px ink rule, as SectionHead draws it, without adding to the page outline. */
function Head({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="mb-1 flex items-baseline gap-3 border-b-2 border-ink pb-2">
      <p className="section-title min-w-0 flex-1">{title}</p>
      {meta && <span className="text-[0.8125rem] text-ink-3">{meta}</span>}
    </div>
  );
}

/* ── 1 · Hero: the count, the purpose, one action ───────────────────────── */
function Hero() {
  return (
    <section aria-labelledby="hero-h" style={{ background: SWAYVO.blue, color: SWAYVO.white }} className={ON_BLUE}>
      <header className={cn(WRAP, 'flex items-center justify-between gap-4 py-5 lg:py-7')}>
        <SwayvoLogo tone="white" className="h-7 lg:h-8" />
        <nav aria-label="Swayvo">
          <Link href="/" className="rounded-[var(--radius-sm)] px-1 text-[0.9375rem] font-semibold underline-offset-4 hover:underline">Sign in</Link>
        </nav>
      </header>
      <div className={cn(WRAP, 'grid items-center gap-x-16 gap-y-12 pb-16 pt-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:pb-24 lg:pt-14')}>
        <div className="min-w-0">
          <h1 id="hero-h" className="font-display text-[3rem] font-[850] leading-[0.92] tracking-[-0.025em] [font-stretch:118%] sm:text-[4.5rem] xl:text-[6rem]">
            Five, six, seven, <span style={{ color: SWAYVO.peach }}>eight.</span>
          </h1>
          <Count />
          <p className="font-display text-[1.625rem] leading-tight lg:text-[2.125rem]">More time for dance.</p>
          <p className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-white/90 lg:text-[1.25rem]">
            Timetable, registers, money and messages for dance schools, kept on the count. And the part nobody
            else does: each student’s progress, shown to them and their family.
          </p>
          <a href="#contact"
            className="mt-8 inline-flex h-14 items-center gap-2 rounded-[var(--radius-md)] bg-peach px-6 text-[1.0625rem] font-semibold text-ink transition-transform active:translate-y-px">
            Book a demo <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>
        <figure className="min-w-0 justify-self-center lg:justify-self-end">
          <RegisterDemo />
          <figcaption className="mt-3 max-w-[390px] text-[0.8125rem] text-white/85">
            The register, as a teacher sees it on a phone. Tap Here or Absent: it works.
          </figcaption>
        </figure>
      </div>
    </section>
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

/* ── 2 · Everything the school runs on, in one place ────────────────────── */
const RUNS_ON: [string, string][] = [
  ['Timetable', 'Move or cancel a class and every family in it is told, in words.'],
  ['Register', 'One tap for each dancer, with medical notes beside the name.'],
  ['Money', 'Term and monthly fees, discounts, and failed cards you can retry.'],
  ['Messages', 'Notices to a class, and one inbox for every family’s replies.'],
  ['Enrolment', 'From the first enquiry to a trial class to a place.'],
  ['Shows and exams', 'Entries, rehearsals and events in the same place as the classes.'],
];

function RunsOn() {
  return (
    <section aria-labelledby="runs-h" className="py-16 lg:py-24">
      <div className={cn(WRAP, 'grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')}>
        <div className="min-w-0">
          <SectionIntro id="runs-h" title="Everything the school runs on, in one place.">
            <p>Most schools run on a spreadsheet, a payments app, a group chat and an evening a week. Swayvo puts it in
              one place and keeps it exact, so Monday morning starts with what needs you, not a search.</p>
          </SectionIntro>
          <dl className="mt-8 divide-y divide-line border-t-2 border-ink">
            {RUNS_ON.map(([k, v]) => (
              <div key={k} className="grid gap-x-6 gap-y-0.5 py-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
                <dt className="font-semibold">{k}</dt>
                <dd className="text-[0.9375rem] text-ink-2">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="min-w-0 space-y-10">
          <Screen caption="The owner’s Today screen at Northstar Dance Academy: the next class, then only what needs a decision.">
            <OwnerToday />
          </Screen>
        </div>
      </div>

      <div className={cn(WRAP, 'mt-16 grid items-center gap-x-16 gap-y-8 lg:mt-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')}>
        <div className="min-w-0 lg:order-2">
          <h3 className="font-display text-[1.625rem] leading-tight lg:text-[2.125rem]">When something changes, families hear it plainly.</h3>
          <p className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-ink-2">
            A moved class, a cover teacher, a fee coming due: each is set as one word that can’t be missed, with the
            detail underneath. No more lost emails and long chat threads.
          </p>
        </div>
        <Screen className="max-w-[420px] lg:order-1" caption="A parent’s home screen: notices first, then each child’s week.">
          <ParentNotices />
        </Screen>
      </div>
    </section>
  );
}

function OwnerToday() {
  const items: { n: number; tone: 'critical' | 'ink'; headline: string; detail: string; action: string }[] = [
    { n: 1, tone: 'critical', headline: 'Medical update to acknowledge', detail: 'Teachers see the change once you record it', action: 'Review' },
    { n: 3, tone: 'critical', headline: 'Card payments failed', detail: '£612.00 outstanding in all', action: 'Retry' },
    { n: 4, tone: 'ink', headline: 'Families waiting for a reply', detail: 'Doherty family, Osei family, Wright family…', action: 'Reply' },
    { n: 5, tone: 'ink', headline: 'Trials attended, not enrolled', detail: 'Layla Haddad, Ada Okonkwo…', action: 'Follow up' },
  ];
  return (
    <>
      <ScreenTitle title="Today" sub="Thursday 26 November" />
      <div className="space-y-10 px-4 pb-6 pt-6 sm:px-5">
        <div className="flex flex-col gap-x-8 gap-y-3 sm:flex-row sm:items-end">
          <div>
            <p className="label text-accent-text">Next · in 40 min</p>
            <p className="display-xl mt-1 text-[4.5rem] text-ink sm:text-[5.5rem]">18:30</p>
          </div>
          <div className="min-w-0 flex-1 sm:pb-1.5">
            <p className="font-display text-[1.5rem] leading-tight">Senior Tap</p>
            <p className="mt-1 text-[0.875rem] text-ink-3">Priya Raman (cover) · Main Hall · Blackheath Studio</p>
            <p className="mt-1 flex items-center gap-2 text-[0.875rem] text-ink-2">
              <Beats value={11} max={18} label="11 of 18 places" />
              <span className="tnum">11 of 18</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" tabIndex={-1}>Open register</Button>
              <Button tabIndex={-1}>Timetable</Button>
            </div>
          </div>
        </div>
        <div>
          <Head title="Needs attention" meta="7 things" />
          <ul className="divide-y divide-line">
            {items.map(i => (
              <li key={i.headline} className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3">
                <span className={cn('font-display text-[1.75rem] leading-none tnum', i.tone === 'critical' ? 'text-critical' : 'text-ink')}>{i.n}</span>
                <span className="min-w-0">
                  <span className="block font-semibold leading-snug">{i.headline}</span>
                  <span className="block truncate text-[0.8125rem] text-ink-3">{i.detail}</span>
                </span>
                <span className="flex items-center gap-1 text-[0.8125rem] font-semibold text-accent-text">{i.action}<ArrowRight className="size-3.5" aria-hidden /></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function ParentNotices() {
  return (
    <>
      <ScreenTitle title="This week" sub="Thursday 26 November" />
      <div className="px-4 pb-5 pt-5">
        <Head title="Notices" />
        <ul className="divide-y divide-line">
          <li className="py-4"><Notice word="Changed" title="Priya Raman teaches Senior Tap on Thu 26 Nov" detail="Amir · Cover teacher, same time and room" /></li>
          <li className="py-4"><Notice word="Cancelled" tone="critical" title="Street Seniors, Friday 27 November" detail="Amir · Teacher unwell — this week only" /></li>
          <li className="py-4"><Notice word="Due 4 Dec" tone="caution" title="Spring term fees · £162.00" detail="Pay by card or bank transfer" /></li>
        </ul>
        <div className="mt-4">
          <div className="mb-1 flex items-baseline gap-3 border-b-2 border-ink pb-2">
            <p className="font-display text-[1.375rem] leading-none">Amir</p>
            <span className="text-[0.8125rem] text-ink-3">15 · 2 classes this week</span>
          </div>
          <ul className="divide-y divide-line">
            {[['Today', '18:30', 'Senior Tap', 'Priya Raman (cover) · Main Hall'], ['Today', '19:00', 'Contemporary Seniors', 'Priya Raman · Studio One']].map(([d, t, n, m]) => (
              <li key={t} className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-x-4 py-3">
                <span><span className="block text-[0.8125rem] text-ink-2">{d}</span><span className="font-display text-[1.1875rem] tnum">{t}</span></span>
                <span className="min-w-0"><span className="block truncate font-semibold">{n}</span><span className="block truncate text-[0.8125rem] text-ink-3">{m}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/* ── 3 · Progress students and families can see ─────────────────────────── */
const SKILLS: { name: string; level: string; beats: number }[] = [
  { name: 'Spirals', level: 'Mastered', beats: 8 },
  { name: 'Floorwork', level: 'Secure', beats: 6 },
  { name: 'Contraction and release', level: 'Developing', beats: 3 },
  { name: 'Turns in parallel', level: 'Not yet', beats: 0 },
];

function Progress() {
  return (
    <section aria-labelledby="progress-h" className="border-t border-line bg-canvas py-16 lg:py-24">
      <div className={cn(WRAP, 'grid items-start gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')}>
        <div className="min-w-0 lg:sticky lg:top-10">
          <SectionIntro id="progress-h" title="Progress students and families can see.">
            <p>Between grade exams, most dancers never see how far they’ve come. In Swayvo, teachers leave two lines
              of feedback while the class is fresh, and mark each skill as it grows: developing, secure, mastered.</p>
            <p>Students see their own story. Parents see it too, so the conversation at home is about the turn that
              finally landed, not the invoice.</p>
          </SectionIntro>
          <p className="mt-8 border-l-[3px] border-peach pl-4 text-[1.0625rem] leading-relaxed">
            <span className="font-display text-[1.625rem] leading-none">50 classes.</span><br />
            That’s a full count — keep moving.
          </p>
          <p className="mt-2 text-[0.8125rem] text-ink-3">A milestone, as a student sees it.</p>
        </div>
        <Screen className="max-w-[560px]" caption="Amir’s feedback screen: a teacher’s note, then each Contemporary skill as a count of eight.">
          <ScreenTitle title="Your feedback" />
          <div className="space-y-10 px-4 pb-6 pt-5 sm:px-5">
            <div>
              <Head title="Notes from class" />
              <div className="py-4">
                <p className="flex items-baseline gap-3"><span className="flex-1 font-semibold">Really strong week</span><span className="text-[0.8125rem] text-ink-3">24 Nov</span></p>
                <p className="mt-1.5 text-[1rem] leading-relaxed">“Your timing in the fast section is spot on now, and you kept the shoulders down through the whole barre.”</p>
                <p className="mt-3 border-l-2 border-accent pl-3 text-[0.9375rem] text-ink-2"><span className="font-semibold text-ink">To work on:</span> Spotting on the turns — pick one point on the back wall and stay with it.</p>
                <p className="mt-3 text-[0.8125rem] text-ink-3">Marcus Bell · Senior Tap</p>
              </div>
            </div>
            <div>
              <Head title="Your skills" meta="Developing · secure · mastered" />
              <p className="pt-3 font-semibold">Contemporary <span className="font-normal text-ink-3">· 3 of 4 assessed</span></p>
              <ul className="mt-1 divide-y divide-line">
                {SKILLS.map(s => (
                  <li key={s.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-3">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{s.name}</span>
                      <span className={cn('block text-[0.8125rem]', s.beats ? 'text-ink-2' : 'text-ink-3')}>{s.level}</span>
                    </span>
                    <Beats value={s.beats} max={8} size="lg" label={`${s.name}: ${s.level}, ${s.beats} of 8`} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Screen>
      </div>
    </section>
  );
}

/* ── 4 · Safe by design ─────────────────────────────────────────────────── */
const SAFE: [string, string][] = [
  ['Medical notes where they’re needed.', 'Allergies and conditions sit beside the dancer’s name on the register. When a family updates one, the office records it and every teacher sees the change.'],
  ['No private staff–child messages.', 'Teachers write to a class or a family. Nothing is said to a child that the school can’t see.'],
  ['A safeguarding log, kept close.', 'Any member of staff can raise a concern. Only the school’s safeguarding lead can read the log, and every look at it is recorded.'],
  ['Staff checks with dates.', 'DBS, safeguarding training and first aid, each with its expiry, so nothing lapses quietly.'],
  ['Each family sees only its own.', 'Permissions are enforced by the database itself, not just hidden in the screens. Children’s data is kept to what the school needs.'],
];

function Safe() {
  return (
    <section aria-labelledby="safe-h" className="py-16 lg:py-24">
      <div className={cn(WRAP, 'grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')}>
        <SectionIntro id="safe-h" title="Safe by design.">
          <p>A dance school looks after other people’s children. Swayvo is built around that, not bolted on afterwards.</p>
        </SectionIntro>
        <ul className="min-w-0 divide-y divide-line border-t-2 border-ink">
          {SAFE.map(([k, v]) => (
            <li key={k} className="py-4">
              <h3 className="text-[1.0625rem] font-semibold">{k}</h3>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">{v}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 5 · Looks like your school ─────────────────────────────────────────── */
function YourSchool() {
  return (
    <section aria-labelledby="yours-h" className="border-t border-line bg-canvas py-16 lg:py-24">
      <div className={WRAP}>
        <SectionIntro id="yours-h" title="Looks like your school.">
          <p>Your logo, your colours, a light or a dark style. Families see your school first; Swayvo signs off
            quietly underneath. Colours are fitted for contrast automatically, so every word stays readable.</p>
        </SectionIntro>
        <div className="mt-10"><SchoolSamples /></div>
      </div>
    </section>
  );
}

/* ── 6 · For every style ────────────────────────────────────────────────── */
const STYLES = ['Ballet', 'Tap', 'Contemporary', 'Jazz', 'Street', 'Commercial', 'Musical theatre', 'Ballroom', 'Breaking'];
const PHOTOS = [
  'Photography: street class mid-routine, low side light, motion blur on the hands only. Mixed ages, no posing.',
  'Photography: pre-school ballet, tight crop on feet and floor, natural light from the studio windows.',
  'Photography: adult beginners’ tap, shoes and floor mid-shuffle. Faces only with consent.',
];

function EveryStyle() {
  return (
    <section aria-labelledby="styles-h" className="py-16 lg:py-24">
      <div className={WRAP}>
        <SectionIntro id="styles-h" title="For every style, and every age.">
          <p>Ballet to breaking, three-year-olds to adult beginners. Grade exams, festivals, battles and the summer
            show all run on the same count.</p>
        </SectionIntro>
        <ul aria-label="Styles" className="mt-8 flex flex-wrap gap-x-5 gap-y-1 font-display text-[1.625rem] leading-[1.2] text-ink-2 lg:text-[2.125rem]">
          {STYLES.map(s => <li key={s}>{s}</li>)}
        </ul>
        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {PHOTOS.map((p, i) => (
            <li key={p} className={cn('flex aspect-[16/9] items-end sm:aspect-[4/3]', i === 2 && 'hidden sm:flex',
              'rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-surface-2 p-4')}>
              <p className="text-[0.8125rem] leading-snug text-ink-2">{p}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 7 · How it starts ──────────────────────────────────────────────────── */
const STEPS: [string, string][] = [
  ['We set you up.', 'Your classes, rooms, terms and fees, entered with you on one call.'],
  ['We bring your families across.', 'From a spreadsheet or your old system: families, children and medical notes, checked with you.'],
  ['You invite them.', 'Each family gets a link, signs in, and sees their own children’s week from the first day.'],
];

function HowItStarts() {
  return (
    <section aria-labelledby="starts-h" className="border-t border-line py-16 lg:py-24">
      <div className={WRAP}>
        <SectionIntro id="starts-h" title="How it starts." />
        <ol className="mt-8 grid gap-x-12 border-t-2 border-ink md:grid-cols-3">
          {STEPS.map(([k, v], i) => (
            <li key={k} className="border-b border-line py-5 md:border-b-0">
              <p aria-hidden className="display-xl text-[3rem] text-ink">{i + 1}</p>
              <h3 className="mt-3 text-[1.0625rem] font-semibold">{k}</h3>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">{v}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 8 · Contact: where "Book a demo" lands ─────────────────────────────── */
function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-h" style={{ background: SWAYVO.blue, color: SWAYVO.white }}
      className={cn('scroll-mt-4 py-16 lg:py-24', ON_BLUE)}>
      <div className={cn(WRAP, 'grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end')}>
        <div className="min-w-0">
          <h2 id="contact-h" className="font-display text-[3rem] font-[850] leading-[0.95] tracking-[-0.025em] [font-stretch:118%] lg:text-[4.5rem]">
            Book a <span style={{ color: SWAYVO.peach }}>demo.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-white/90 lg:text-[1.25rem]">
            Thirty minutes, with your own timetable on the screen. Email us, say when suits, and tell us a little
            about your school.
          </p>
          <p className="mt-8 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-white/85">Email</p>
          <p className="mt-1 select-all break-all font-display text-[1.625rem] leading-tight sm:text-[2.125rem] lg:text-[3rem]">hello@swayvo.example</p>
        </div>
        <div className="min-w-0 border-t border-white/30 pt-6">
          <p className="font-display text-[1.375rem] leading-tight">Can’t wait?</p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/90">
            The demo runs in your browser with no sign-up. Choose a person at Northstar Dance Academy, our sample
            school, and see exactly what they would.
          </p>
          <Link href="/" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] text-[1.0625rem] font-semibold underline underline-offset-4">
            Try the demo <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-surface">
      <div className={cn(WRAP, 'flex flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between')}>
        <div>
          <SwayvoLogo className="h-7" />
          <p className="mt-3 font-display text-[1.0625rem]">More time for dance.</p>
        </div>
        <p className="max-w-md text-[0.8125rem] text-ink-3 sm:text-right">
          © 2026 Swayvo. Northstar Dance Academy and the people in it are sample data, made up for the demo.
        </p>
      </div>
    </footer>
  );
}
