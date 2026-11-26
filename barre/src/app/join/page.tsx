'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { readAs, runAs } from '@/lib/db/client';
import { SchoolMark, PoweredBy, useSchoolTheme, logoFor, SchoolHero } from '@/components/app/brand';
import { Button, EmptyState, ErrorState, Field, Input, Notice, Skeleton } from '@/components/ui';
import { money, dateLong, time } from '@/lib/format';
import { cn } from '@/lib/cn';

type School = { name: string; brand_colour: string | null; logo_url: string | null; open: boolean; theme: string; brand_secondary: string | null; privacy_notice_url: string | null; hero_url: string | null; logo_light_url: string | null };
type Slot = { session_id: string; class_name: string; style: string | null; starts_at: string; ends_at: string;
  age_min: number | null; age_max: number | null; location: string | null; trial_price_minor: number | null; places_left: number };

export default function JoinPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><Join /></Suspense>;
}

/**
 * The school's public page: book a trial class without an account (R-014).
 * Linked from the school's own website as /join?school=<slug>. Everything here
 * runs as an anonymous visitor through two narrow functions; nothing else in
 * the database is visible to it.
 */
function Join() {
  const slug = useSearchParams().get('school') ?? '';
  const school = useQuery({ queryKey: ['public-school', slug], enabled: !!slug,
    queryFn: async () => (await readAs<School>(null, `select * from app.public_school($1)`, [slug]))[0] ?? null });
  const slots = useQuery({ queryKey: ['public-slots', slug], enabled: !!school.data?.open,
    queryFn: () => readAs<Slot>(null, `select * from app.public_trial_sessions($1)`, [slug]) });
  useSchoolTheme(school.data ?? null);

  const [age, setAge] = React.useState('');
  const [pick, setPick] = React.useState<Slot | null>(null);
  const [form, setForm] = React.useState({ contact_name: '', contact_email: '', contact_phone: '', child_name: '', child_dob: '', website: '', privacy_ack: false, marketing: false });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const tick = (k: 'privacy_ack' | 'marketing') => (v: boolean) => setForm(f => ({ ...f, [k]: v }));
  const book = useMutation({
    mutationFn: () => runAs(null, q => q(`select app.public_book_trial($1, $2, $3::jsonb)`, [slug, pick!.session_id, JSON.stringify(form)])),
  });

  // The list can be long: bring the details form to the person who chose.
  const formRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { if (pick) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [pick]);
  const n = Number(age);
  const shown = (slots.data ?? []).filter(s => !age || ((s.age_min == null || n >= s.age_min) && (s.age_max == null || n <= s.age_max)));
  const s = school.data;
  const ready = form.contact_name.trim() && form.child_name.trim() && form.child_dob && form.contact_phone.trim() && /@.+\./.test(form.contact_email) && form.privacy_ack;

  return (
    <main id="main" className="min-h-dvh bg-surface px-4 pb-10 pt-6 sm:pt-10">
      <div className="mx-auto max-w-2xl space-y-10">
        {!slug && <EmptyState title="Which school?" body="This link is missing the school’s name. Use the link from the school’s website." />}
        {school.isLoading && <Skeleton className="h-24" />}
        {school.error && <ErrorState error={school.error} />}
        {slug && school.data === null && <EmptyState title="School not found" body="Check the link, or ask the school for theirs." />}
        {s && (
          <header className="space-y-5">
            <SchoolHero src={s.hero_url} name={s.name} />
            <div className="flex items-center gap-3">
              <SchoolMark name={s.name} logo={logoFor(s)} className="size-12" />
              <div className="min-w-0">
                <h1 className="font-display text-[26px] font-[800] leading-tight [font-stretch:112%] sm:text-[30px]">{s.name}</h1>
                <p className="text-[15px] text-ink-2">Book a trial class. No account needed.</p>
              </div>
            </div>
          </header>
        )}
        {s && !s.open && <EmptyState title="Not taking bookings online just now" body="Please contact the school directly." />}

        {book.isSuccess ? (
          <section aria-live="polite" className="border-t-2 border-ink pt-4">
            <Notice word="Booked" tone="positive"
              title={`${form.child_name.split(' ')[0]} is coming to ${pick!.class_name}`}
              detail={`${dateLong(pick!.starts_at)} at ${time(pick!.starts_at)}. ${s?.name} will be in touch by email with what to bring.`} />
          </section>
        ) : s?.open && (
          <section aria-labelledby="j-trials" className="space-y-4">
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3 border-b-2 border-ink pb-3">
              <h2 id="j-trials" className="section-title flex-1 text-[17px]">Trial classes</h2>
              <Field label="Your child’s age" htmlFor="j-age">
                <Input id="j-age" type="number" inputMode="numeric" min={2} max={99} value={age} onChange={e => setAge(e.target.value)} className="w-24" placeholder="Any" />
              </Field>
            </div>
            {slots.isLoading && <Skeleton className="h-24" />}
            {slots.data && shown.length === 0 && <EmptyState title="No trial places in the next three weeks" body="Please contact the school — they may have a place soon." />}
            <ul className="divide-y divide-line" aria-label="Trial classes">
              {shown.map(x => {
                const on = pick?.session_id === x.session_id;
                return (
                  <li key={x.session_id}>
                    <button onClick={() => setPick(x)} aria-pressed={on}
                      className={cn('grid w-full grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3.5 text-left hover:bg-surface-2/60',
                        on && 'bg-accent-soft hover:bg-accent-soft')}>
                      <span className="pl-1">
                        <span className="block font-display text-[20px] leading-none tnum">{time(x.starts_at)}</span>
                        <span className="mt-1 block text-[12.5px] text-ink-3">{new Date(x.starts_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold">{x.class_name}</span>
                        <span className="block text-[13px] text-ink-3">
                          {[x.age_min != null ? `Ages ${x.age_min}${x.age_max != null ? `–${x.age_max}` : '+'}` : null, x.location].filter(Boolean).join(' · ')}
                        </span>
                        {on && <span className="block text-[13px] font-semibold text-accent-text">Chosen — add your details below</span>}
                      </span>
                      <span className="shrink-0 pr-1 text-right text-[13.5px]">
                        <span className="block font-semibold">{x.trial_price_minor ? money(x.trial_price_minor) : 'Free'}</span>
                        <span className={cn('block', x.places_left <= 2 ? 'font-semibold text-caution' : 'text-ink-3')}>{x.places_left} place{x.places_left === 1 ? '' : 's'} left</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {pick && (
              <div ref={formRef} className="card scroll-mt-4 space-y-4 p-4 sm:p-5">
                <div>
                  <h2 className="section-title">Your details</h2>
                  <p className="text-[13px] text-ink-3">For {pick.class_name}, {dateLong(pick.starts_at)} at {time(pick.starts_at)}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Child’s name" htmlFor="j-cn" required><Input id="j-cn" value={form.child_name} onChange={set('child_name')} /></Field>
                  <Field label="Date of birth" htmlFor="j-cd" required><Input id="j-cd" type="date" value={form.child_dob} onChange={set('child_dob')} /></Field>
                </div>
                <Field label="Your name" htmlFor="j-pn" required><Input id="j-pn" value={form.contact_name} onChange={set('contact_name')} autoComplete="name" /></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Email" htmlFor="j-pe" required><Input id="j-pe" type="email" value={form.contact_email} onChange={set('contact_email')} autoComplete="email" /></Field>
                  <Field label="Mobile" htmlFor="j-pp" required hint="Rung in an emergency."><Input id="j-pp" type="tel" value={form.contact_phone} onChange={set('contact_phone')} autoComplete="tel" /></Field>
                </div>
                {/* Honeypot: hidden from people, filled in by bots. */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0"
                       value={form.website} onChange={set('website')} />
                <Consent school={s!} ack={form.privacy_ack} marketing={form.marketing} onAck={tick('privacy_ack')} onMarketing={tick('marketing')} who="you and your child" />
                {book.error != null && <ErrorState error={book.error} />}
                <Button variant="primary" size="lg" className="w-full whitespace-normal" disabled={!ready} loading={book.isPending} onClick={() => book.mutate()}>
                  Book {pick.class_name}, {dateLong(pick.starts_at)}
                </Button>
              </div>
            )}
          </section>
        )}
        {s?.open && !book.isSuccess && <AdultDropIn slug={slug} school={s} />}
        <PoweredBy className="justify-center border-t border-line pt-6" />
      </div>
    </main>
  );
}

type DropIn = { session_id: string; class_name: string; starts_at: string; price_minor: number; places_left: number };

/** Adults book a single class for themselves (R-034). */
function AdultDropIn({ slug, school }: { slug: string; school: School }) {
  const rows = useQuery({ queryKey: ['public-dropins', slug],
    queryFn: () => readAs<DropIn>(null, `select * from app.public_drop_in_sessions($1)`, [slug]) });
  const [pick, setPick] = React.useState<DropIn | null>(null);
  const [f, setF] = React.useState({ name: '', email: '', phone: '', emergency_name: '', emergency_phone: '', website: '', privacy_ack: false, marketing: false });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF(x => ({ ...x, [k]: e.target.value }));
  const book = useMutation({
    mutationFn: async () => (await runAs(null, q => q<{ r: string }>(`select app.public_adult_drop_in($1, $2, $3::jsonb) r`, [slug, pick!.session_id, JSON.stringify(f)])))[0]?.r,
  });
  if (!rows.data?.length) return null;
  if (book.isSuccess) return (
    <section aria-live="polite" className="border-t-2 border-ink pt-4">
      <Notice word={book.data === 'held' ? 'Held' : 'Booked'} tone={book.data === 'held' ? 'caution' : 'positive'}
        title={`See you at ${pick!.class_name}`}
        detail={`${dateLong(pick!.starts_at)} at ${time(pick!.starts_at)}. ${book.data === 'held'
          ? `Your place is held for 30 minutes. The school will send your ${money(pick!.price_minor)} invoice now — the place is confirmed once it is paid.`
          : `${money(pick!.price_minor)} — pay on the night or online once the school sends your invoice.`}`} />
    </section>
  );
  const ok = f.name.trim() && /@.+\./.test(f.email) && f.phone.trim() && f.emergency_phone.trim() && f.privacy_ack;
  return (
    <section aria-labelledby="j-adults" className="space-y-4">
      <div className="border-b-2 border-ink pb-2">
        <h2 id="j-adults" className="section-title text-[17px]">Adults: drop in</h2>
        <p className="text-[13px] text-ink-3">Book a single class for yourself. No commitment.</p>
      </div>
      <ul className="divide-y divide-line" aria-label="Drop-in classes">
        {rows.data.map(x => (
          <li key={x.session_id}>
            <button onClick={() => setPick(x)} aria-pressed={pick?.session_id === x.session_id}
              className={cn('grid w-full grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3.5 text-left hover:bg-surface-2/60', pick?.session_id === x.session_id && 'bg-accent-soft hover:bg-accent-soft')}>
              <span className="pl-1">
                <span className="block font-display text-[20px] leading-none tnum">{time(x.starts_at)}</span>
                <span className="mt-1 block text-[12.5px] text-ink-3">{new Date(x.starts_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </span>
              <span className="min-w-0"><span className="block font-semibold">{x.class_name}</span>
                <span className="block text-[13px] text-ink-3">{x.places_left} place{x.places_left === 1 ? '' : 's'} left</span></span>
              <span className="pr-1 text-[13.5px] font-semibold">{money(x.price_minor)}</span>
            </button>
          </li>
        ))}
      </ul>
      {pick && (
        <div className="card space-y-4 p-4 sm:p-5">
          <Field label="Your name" htmlFor="ad-n" required><Input id="ad-n" value={f.name} onChange={set('name')} autoComplete="name" /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Email" htmlFor="ad-e" required><Input id="ad-e" type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
            <Field label="Mobile" htmlFor="ad-p" required><Input id="ad-p" type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" /></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Emergency contact" htmlFor="ad-en"><Input id="ad-en" value={f.emergency_name} onChange={set('emergency_name')} /></Field>
            <Field label="Their phone" htmlFor="ad-ep" required><Input id="ad-ep" type="tel" value={f.emergency_phone} onChange={set('emergency_phone')} /></Field>
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" value={f.website} onChange={set('website')} />
          <Consent school={school} ack={f.privacy_ack} marketing={f.marketing} who="you"
                   onAck={v => setF(x => ({ ...x, privacy_ack: v }))} onMarketing={v => setF(x => ({ ...x, marketing: v }))} />
          {book.error != null && <ErrorState error={book.error} />}
          <Button variant="primary" size="lg" className="w-full whitespace-normal" disabled={!ok} loading={book.isPending} onClick={() => book.mutate()}>
            Book {pick.class_name}, {money(pick.price_minor)}
          </Button>
        </div>
      )}
    </section>
  );
}

/**
 * Said at the point of collection (R-048): who holds the details, why, and
 * where to read more. Contact for news is a separate choice, off by default.
 */
function Consent({ school, ack, marketing, onAck, onMarketing, who }: {
  school: School; ack: boolean; marketing: boolean; onAck: (v: boolean) => void; onMarketing: (v: boolean) => void; who: string;
}) {
  return (
    <div className="space-y-2 border-l-2 border-line-strong py-1 pl-3 text-[13.5px] text-ink-2">
      <p>
        <strong className="text-ink">{school.name}</strong> keeps these details about {who} to arrange the class, to reach someone in an emergency,
        and to follow up afterwards. Swayvo stores them for the school. If you don’t join, they are deleted after 90 days.
        {school.privacy_notice_url && <> <a href={school.privacy_notice_url} target="_blank" rel="noreferrer" className="font-medium text-accent-text underline">Read the school’s privacy notice</a>.</>}
      </p>
      <label className="flex min-h-11 items-start gap-2.5 py-1">
        <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]" checked={ack} onChange={e => onAck(e.target.checked)} />
        <span>I have read how the school uses these details <span className="text-critical" aria-hidden>*</span></span>
      </label>
      <label className="flex min-h-11 items-start gap-2.5 py-1">
        <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]" checked={marketing} onChange={e => onMarketing(e.target.checked)} />
        <span>Send me news about classes and shows (optional)</span>
      </label>
    </div>
  );
}
