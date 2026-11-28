'use client';

import * as React from 'react';
import { Badge, Beats, Button, EmptyState, ErrorState, Field, Input, Notice, Select, Skeleton, Spinner, Choice } from '@/components/ui';
import { SwayvoIcon, SwayvoLogo, SwayvoMark } from '@/components/app/swayvo';
import { SWAYVO } from '@/lib/swayvo-logo';
import { MessagePreview, ProgrammePreview } from '@/components/app/message-preview';

/** Sample schools for the document previews: the same three as /welcome. */
const DOC_SCHOOLS = [
  { name: 'Northstar Dance Academy', brand_colour: '#1e3a8a', contact_email: null },
  { name: 'Hollybrook School of Dance', brand_colour: '#6b2155', contact_email: null },
  { name: 'Kestrel Ballet School', brand_colour: '#c6f432', contact_email: null },
];

/**
 * The Swayvo design system, live. Every component here is the real one the
 * product uses. Reference: docs/brand/DESIGN-SYSTEM.md.
 */
export default function DesignSystem() {
  const [theme, setTheme] = React.useState<'classic' | 'urban'>('classic');
  const [docSchool, setDocSchool] = React.useState(0);
  React.useEffect(() => { document.documentElement.dataset.theme = theme; return () => { delete document.documentElement.dataset.theme; }; }, [theme]);
  return (
    <main className="mx-auto max-w-[1120px] px-4 pb-24 pt-10 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-5">
        <div>
          <SwayvoLogo className="h-9 swayvo-on-light" />
          <SwayvoLogo tone="white" className="h-9 swayvo-on-dark" title={null} />
          <h1 className="display-xl mt-6 text-[2.75rem] sm:text-[4rem]">Design system</h1>
          <p className="mt-2 max-w-xl text-ink-2">The real components the product is built from. Rules and reasons are in docs/brand/DESIGN-SYSTEM.md.</p>
        </div>
        <Choice label="School style" size="sm" value={theme} onChange={setTheme}
          options={[{ value: 'classic', label: 'Classic (light)' }, { value: 'urban', label: 'Urban (dark)' }]} />
      </header>

      <Section title="Identity">
        <div className="grid gap-8 sm:grid-cols-3">
          <Spec name="Primary lockup"><SwayvoLogo className="h-10" /></Spec>
          <Spec name="On Count blue"><div className="rounded-[var(--radius-md)] p-4" style={{ background: SWAYVO.blue }}><SwayvoLogo tone="white" className="h-8" /></div></Spec>
          <Spec name="Mark · app icon · favicon"><div className="flex items-end gap-4"><SwayvoMark className="h-10" /><SwayvoIcon className="size-14" /><SwayvoMark small className="size-4" /></div></Spec>
        </div>
      </Section>

      <Section title="Colour">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-4">
          {[['accent', 'Count blue / school colour', 'one primary action, the now'], ['peach', 'Rosin peach', 'the downbeat, celebration'],
            ['ink', 'Ink', 'text'], ['canvas', 'Studio white', 'page ground'], ['positive', 'Success', 'with a word'],
            ['caution', 'Warning', 'with a word'], ['critical', 'Critical', 'with a word'], ['info', 'Info', 'with a word']].map(([t, n, u]) => (
            <div key={t} className="bg-surface p-3">
              <div className="h-12 rounded-[var(--radius-sm)] border border-line" style={{ background: `var(--color-${t})` }} />
              <p className="mt-2 text-[0.8438rem] font-semibold">{n}</p><p className="text-[0.7812rem] text-ink-3">{u}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <div className="space-y-5">
          <p className="display-xl text-[4.5rem]">18:30</p>
          <p className="page-title">Page title · Archivo 800</p>
          <p className="stat-number text-[1.875rem]">£2,088.00</p>
          <p className="font-display text-[1.375rem]">Contemporary Seniors</p>
          <p className="section-title">Section title, sentence case</p>
          <p className="max-w-prose">Body text in Inter at 15px. Plain, warm and specific: “Junior Tap is done. Two lines of feedback while it’s fresh?”</p>
          <p className="text-[0.8125rem] text-ink-3">Meta line · Studio Two · Marcus Bell</p>
          <p className="label">Label · sparingly</p>
        </div>
      </Section>

      <Section title="Actions">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary">Open register</Button><Button>Timetable</Button><Button variant="ghost">Not now</Button>
          <Button variant="danger">Cancel class</Button><Button variant="primary" loading>Saving</Button><Button disabled>Disabled</Button>
          <Button size="sm">Small</Button><Button size="lg" variant="primary">Pay £186.00</Button>
        </div>
      </Section>

      <Section title="The count (Beats)">
        <ul className="divide-y divide-line">
          {[[11, 16, 'Places · 11 of 16'], [7, 13, 'Term · week 7 of 13'], [3, 8, 'Skill · developing'], [6, 8, 'Skill · secure'], [8, 8, 'Skill · mastered'], [0, 8, 'Skill · not yet']].map(([v, m, l]) => (
            <li key={String(l)} className="flex items-center gap-4 py-3"><Beats value={Number(v)} max={Number(m)} label={String(l)} /><span className="text-[0.875rem]">{l}</span></li>
          ))}
          <li className="flex items-center gap-4 py-3"><Beats value={8} max={8} size="lg" tone="positive" label="Register complete" /><span className="text-[0.875rem]">Large · success</span></li>
        </ul>
      </Section>

      <Section title="Notices">
        <div className="grid gap-8 sm:grid-cols-3">
          <Notice word="Moved" title="Grade 2 Ballet, Tue 1 Dec" detail="Studio Two · same time, same teacher" />
          <Notice word="Cancelled" tone="critical" title="Street Seniors, Fri 27 Nov" detail="Teacher unwell · credit added" />
          <Notice word="Due 10 Dec" tone="caution" title="Spring term · £186.00" detail="Card, Apple Pay or bank transfer" action={<Button size="sm" variant="primary">Pay</Button>} />
        </div>
      </Section>

      <Section title="Status and categories">
        <div className="flex flex-wrap gap-2"><Badge tone="positive">Paid</Badge><Badge tone="caution">Due</Badge><Badge tone="critical">Card declined</Badge>
          <Badge tone="info">Trial</Badge><Badge>Draft</Badge><Badge tone="violet">Tap</Badge><Badge tone="rose">Ballet</Badge><Badge tone="teal">Contemporary</Badge></div>
      </Section>

      <Section title="Forms">
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="ds-email" required hint="We’ll send a sign-in link."><Input id="ds-email" type="email" placeholder="you@example.com" /></Field>
          <Field label="Class" htmlFor="ds-class"><Select id="ds-class"><option>Junior Tap</option><option>Senior Tap</option></Select></Field>
          <Field label="Amount" htmlFor="ds-amount" error="Enter an amount above £0."><Input id="ds-amount" inputMode="decimal" defaultValue="0" /></Field>
        </div>
      </Section>

      <Section title="States">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="card"><EmptyState title="Nothing needs you" body="No failed payments, and everyone is turning up." action={<Button size="sm">View timetable</Button>} /></div>
          <div className="space-y-3"><Skeleton className="h-6 w-1/2" /><Skeleton className="h-12" /><Skeleton className="h-12" /><p className="flex items-center gap-2 text-[0.8125rem] text-ink-3"><Spinner /> Loading</p></div>
          <ErrorState error={new Error('INVALID: that class is full — try another date')} onRetry={() => undefined} />
        </div>
      </Section>

      <Section title="School documents">
        <p className="mb-4 max-w-2xl text-[0.9375rem] text-ink-2">
          What a school sends and prints, in its own name and colour: white, the school first, Archivo for the
          word and the numbers, Inter for the text, and Swayvo signing off. Rendered from data by lib/branded-print.
        </p>
        <div className="mb-6 max-w-xs">
          <Field label="School" htmlFor="ds-doc-school">
            <Select id="ds-doc-school" value={docSchool} onChange={e => setDocSchool(Number(e.target.value))}>
              {DOC_SCHOOLS.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid gap-10 lg:grid-cols-2">
          <div><h3 className="mb-3 font-semibold">Emails and notices</h3><MessagePreview school={DOC_SCHOOLS[docSchool]!} idPrefix="ds-mp" /></div>
          <div><h3 className="mb-3 font-semibold">Printed show programme</h3><ProgrammePreview school={DOC_SCHOOLS[docSchool]!} /></div>
        </div>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="section-title mb-4 border-b-2 border-ink pb-2">{title}</h2>
      {children}
    </section>
  );
}

function Spec({ name, children }: { name: string; children: React.ReactNode }) {
  return <div><div className="flex min-h-20 items-center">{children}</div><p className="label mt-3">{name}</p></div>;
}
