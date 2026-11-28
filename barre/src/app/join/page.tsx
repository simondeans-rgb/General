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
/** What a prospect needs to choose a class (UR-20). */
type ClassInfo = { class_name: string; style: string | null; description: string | null; level: string | null; level_note: string | null;
  what_to_bring: string | null; age_min: number | null; age_max: number | null; price_minor: number; pricing: string;
  trial_price_minor: number | null; prerequisites: string | null; location: string | null; address: string | null; postcode: string | null;
  /** Uniform per class (0066), merged in from app.public_class_uniform. */
  uniform?: string[]; uniform_url?: string | null };
type SchoolInfo = { contact_email: string | null; contact_phone: string | null; arrival_note: string; cancellation_note: string };

const PER: Record<string, string> = { term: 'a term', monthly: 'a month', one_off: 'for the course', drop_in: 'a class' };
/** "then £54.00 a term" — the price after the trial. */
const ongoing = (c?: ClassInfo | null) => c && c.price_minor > 0 ? `${money(c.price_minor)} ${PER[c.pricing] ?? ''}`.trim() : null;
const ages = (min: number | null, max: number | null) => min != null ? `Ages ${min}${max != null ? `–${max}` : '+'}` : max != null ? `Up to ${max}` : null;
/** Adult classes: for people booking for themselves. */
const forAdults = (s: { age_min: number | null }) => s.age_min != null && s.age_min >= 16;
const mapLink = (c?: ClassInfo | null) => {
  const q = [c?.location, c?.address, c?.postcode].filter(Boolean).join(', ');
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
};
const yes = (v: string) => v === 'yes';
/** The class uniform, for after the trial (0066). */
const uniformText = (c?: ClassInfo | null): React.ReactNode => c && (c.uniform?.length || c.uniform_url) ? <>
  {c.uniform?.join(', ')}{c.uniform_url && <>{c.uniform?.length ? ' · ' : ''}<a href={c.uniform_url} target="_blank" rel="noreferrer" className="font-medium text-accent-text underline">Where to buy it</a></>}
  {c.what_to_bring && <span className="block text-[0.8125rem] text-ink-3">For once you join. For a first class, “Wear or bring” is enough.</span>}
</> : null;

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
  const info = useQuery({ queryKey: ['public-classes', slug], enabled: !!school.data?.open,
    queryFn: () => readAs<ClassInfo>(null, `select * from app.public_class_info($1)`, [slug]) });
  const sinfo = useQuery({ queryKey: ['public-school-info', slug], enabled: !!school.data?.open,
    queryFn: async () => (await readAs<SchoolInfo>(null, `select * from app.public_school_info($1)`, [slug]))[0] ?? null });
  const uniform = useQuery({ queryKey: ['public-uniform', slug], enabled: !!school.data?.open,
    queryFn: () => readAs<{ class_name: string; uniform: string[]; uniform_url: string | null }>(null, `select * from app.public_class_uniform($1)`, [slug]) });
  const about = React.useMemo(() => {
    const u = new Map((uniform.data ?? []).map(x => [x.class_name, x]));
    return new Map((info.data ?? []).map(c => [c.class_name, { ...c, uniform: u.get(c.class_name)?.uniform, uniform_url: u.get(c.class_name)?.uniform_url }]));
  }, [info.data, uniform.data]);
  useSchoolTheme(school.data ?? null);

  // Who the class is for comes first: an adult is never asked their child's age.
  const [who, setWho] = React.useState<'self' | 'child' | null>(null);
  const [age, setAge] = React.useState('');
  const [pick, setPick] = React.useState<Slot | null>(null);
  const [allDates, setAllDates] = React.useState(false);
  const [form, setForm] = React.useState({ contact_name: '', contact_email: '', contact_phone: '', child_name: '', child_dob: '', website: '', privacy_ack: false, marketing: false,
    has_medical: '', allergies: '', medical: '', emergency_name: '', emergency_phone: '', photo_consent: '' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const tick = (k: 'privacy_ack' | 'marketing') => (v: boolean) => setForm(f => ({ ...f, [k]: v }));
  const self = who === 'self';
  const book = useMutation({
    mutationFn: () => runAs(null, q => q(`select app.public_book_trial($1, $2, $3::jsonb)`, [slug, pick!.session_id, JSON.stringify({
      ...form,
      // Booking for yourself: you are the dancer.
      child_name: self ? form.contact_name : form.child_name,
      allergies: yes(form.has_medical) ? form.allergies : '', medical: yes(form.has_medical) ? form.medical : '',
      emergency_relationship: self ? 'Emergency contact' : '',
    })])),
  });

  // The list can be long: bring the details form to the person who chose.
  const formRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { if (pick) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [pick]);
  const n = Number(age);
  const shown = (slots.data ?? []).filter(s => self ? forAdults(s)
    : !forAdults(s) && (!age || ((s.age_min == null || n >= s.age_min) && (s.age_max == null || n <= s.age_max))));
  const s = school.data;
  const ready = form.contact_name.trim() && (self || form.child_name.trim()) && form.child_dob && form.contact_phone.trim()
    && /@.+\./.test(form.contact_email) && form.privacy_ack && form.has_medical && form.photo_consent
    && (!yes(form.has_medical) || form.allergies.trim() || form.medical.trim())
    && (self ? form.emergency_name.trim() && form.emergency_phone.trim() : !form.emergency_name.trim() === !form.emergency_phone.trim());
  const chosen = (pick ? about.get(pick.class_name) : null) ?? null;

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
                <h1 className="font-display text-[1.625rem] font-[800] leading-tight [font-stretch:112%] sm:text-[1.875rem]">{s.name}</h1>
                <p className="text-[0.9375rem] text-ink-2">Book a trial class. No account needed.</p>
              </div>
            </div>
          </header>
        )}
        {s && !s.open && <EmptyState title="Not taking bookings online just now" body="Please contact the school directly." />}

        {book.isSuccess ? (
          <section aria-live="polite" className="space-y-5 border-t-2 border-ink pt-4">
            <Notice word="Booked" tone="positive"
              title={self ? `You’re booked into ${pick!.class_name}` : `${form.child_name.split(' ')[0]} is coming to ${pick!.class_name}`}
              detail={`${s?.name} has your details${form.contact_email ? ` and will write to ${form.contact_email}` : ''}.`} />
            <Confirmation when={pick!.starts_at} until={pick!.ends_at} cls={chosen} school={sinfo.data ?? null} schoolName={s?.name ?? ''}
              next={`After the class, ${s?.name ?? 'the school'} will be in touch to offer ${self ? 'you' : form.child_name.split(' ')[0]} a place${ongoing(chosen) ? ` (${ongoing(chosen)})` : ''}. Nothing is booked beyond this class until you say yes.`} />
          </section>
        ) : s?.open && (
          <section aria-labelledby="j-trials" className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="section-title pb-2 text-[1.0625rem]">Who is the class for?</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {([['self', 'I’m booking for myself', 'Adult classes and drop-ins'], ['child', 'For my child', 'Children’s and teens’ classes']] as const).map(([v, label, hint]) => (
                  <button key={v} type="button" aria-pressed={who === v} onClick={() => { setWho(v); setPick(null); }}
                    className={cn('min-h-[56px] rounded-[var(--radius-md)] border px-4 py-2.5 text-left',
                      who === v ? 'border-ink bg-accent-soft' : 'border-line-strong hover:border-ink-3')}>
                    <span className="block font-semibold">{label}</span>
                    <span className="block text-[0.8125rem] text-ink-3">{hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            {who && (
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3 border-b-2 border-ink pb-3">
              <h2 id="j-trials" className="section-title flex-1 text-[1.0625rem]">{self ? 'Try a class' : 'Trial classes'}</h2>
              {!self && (
                <Field label="Your child’s age" htmlFor="j-age">
                  <Input id="j-age" type="number" inputMode="numeric" min={2} max={17} value={age} onChange={e => setAge(e.target.value)} className="w-24" placeholder="Any" />
                </Field>
              )}
            </div>
            )}
            {who && slots.isLoading && <Skeleton className="h-24" />}
            {who && slots.data && shown.length === 0 && (self
              ? <p className="text-[0.875rem] text-ink-2">No adult trial classes in the next three weeks{school.data?.open ? '. Drop in to a class below instead.' : '.'}</p>
              : <EmptyState title="No trial places in the next three weeks" body="Please contact the school — they may have a place soon." />)}
            {/* Grouped by day; the first week shows, later dates one tap away. */}
            {who && (() => {
              const days = new Map<string, Slot[]>();
              for (const x of shown) { const k = new Date(x.starts_at).toDateString(); days.set(k, [...(days.get(k) ?? []), x]); }
              const list = [...days.entries()];
              const cutoff = Date.now() + 7 * 86400_000;
              const visible = allDates ? list : list.filter(([, xs]) => new Date(xs[0]!.starts_at).getTime() < cutoff || xs.some(x => x.session_id === pick?.session_id));
              return (
                <div className="space-y-6">
                  {visible.map(([k, xs]) => (
                    <div key={k}>
                      <h3 className="label pb-1">{new Date(xs[0]!.starts_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                      <ul className="divide-y divide-line border-t border-line" aria-label={`Trial classes, ${new Date(xs[0]!.starts_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`}>
                        {xs.map(x => {
                          const on = pick?.session_id === x.session_id;
                return (
                            <li key={x.session_id}>
                              <button onClick={() => setPick(x)} aria-pressed={on}
                                className={cn('grid w-full grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3.5 text-left hover:bg-surface-2/60',
                                  on && 'bg-accent-soft hover:bg-accent-soft')}>
                                <span className="pl-1">
                                  <span className="block font-display text-[1.25rem] leading-none tnum">{time(x.starts_at)}</span>
                                </span>
                                <span className="min-w-0">
                                  <span className="block font-semibold">{x.class_name}</span>
                                  <span className="block text-[0.8125rem] text-ink-3">
                                    {[ages(x.age_min, x.age_max), about.get(x.class_name)?.level_note ?? about.get(x.class_name)?.level, x.location].filter(Boolean).join(' · ')}
                                  </span>
                                  {about.get(x.class_name)?.description && (
                                    <span className="mt-0.5 line-clamp-2 block text-[0.8125rem] text-ink-2">{about.get(x.class_name)!.description}</span>
                                  )}
                                  {on && <span className="block text-[0.8125rem] font-semibold text-accent-text">Chosen — add your details below</span>}
                                </span>
                                <span className="shrink-0 pr-1 text-right text-[0.8438rem]">
                                  <span className="block font-semibold">{x.trial_price_minor ? `Trial ${money(x.trial_price_minor)}` : 'Free trial'}</span>
                                  {ongoing(about.get(x.class_name)) && <span className="block text-ink-2">then {ongoing(about.get(x.class_name))}</span>}
                                  <span className={cn('block', x.places_left <= 2 ? 'font-semibold text-caution' : 'text-ink-3')}>{x.places_left} place{x.places_left === 1 ? '' : 's'} left</span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                  {!allDates && visible.length < list.length && list.length > 0 && (
                    <Button onClick={() => setAllDates(true)}>Show later dates ({list.length - visible.length} more day{list.length - visible.length === 1 ? '' : 's'})</Button>
                  )}
                </div>
              );
            })()}
            {pick && (
              <div ref={formRef} className="card scroll-mt-4 space-y-4 p-4 sm:p-5">
                <div>
                  <h2 className="section-title">{pick.class_name}</h2>
                  <p className="text-[0.8125rem] text-ink-3">{dateLong(pick.starts_at)} at {time(pick.starts_at)}{pick.location ? ` · ${pick.location}` : ''}</p>
                </div>
                {chosen && <ClassFacts c={chosen} />}
                <h3 className="border-b border-ink pb-1.5 text-[0.875rem] font-semibold">{self ? 'Your details' : 'Your child'}</h3>
                {!self && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Child’s name" htmlFor="j-cn" required><Input id="j-cn" value={form.child_name} onChange={set('child_name')} /></Field>
                    <Field label="Date of birth" htmlFor="j-cd" required><Input id="j-cd" type="date" value={form.child_dob} onChange={set('child_dob')} /></Field>
                  </div>
                )}
                {!self && <h3 className="border-b border-ink pb-1.5 text-[0.875rem] font-semibold">You</h3>}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Your name" htmlFor="j-pn" required><Input id="j-pn" value={form.contact_name} onChange={set('contact_name')} autoComplete="name" /></Field>
                  {self && <Field label="Your date of birth" htmlFor="j-cd" required><Input id="j-cd" type="date" value={form.child_dob} onChange={set('child_dob')} autoComplete="bday" /></Field>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Email" htmlFor="j-pe" required><Input id="j-pe" type="email" value={form.contact_email} onChange={set('contact_email')} autoComplete="email" /></Field>
                  <Field label="Mobile" htmlFor="j-pp" required hint={self ? undefined : 'Rung in an emergency.'}><Input id="j-pp" type="tel" value={form.contact_phone} onChange={set('contact_phone')} autoComplete="tel" /></Field>
                </div>
                <SafetyQuestions self={self} form={form} set={set} setForm={setForm} />
                {/* Honeypot: hidden from people, filled in by bots. */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0"
                       value={form.website} onChange={set('website')} />
                <Consent school={s!} ack={form.privacy_ack} marketing={form.marketing} onAck={tick('privacy_ack')} onMarketing={tick('marketing')} who={self ? 'you' : 'you and your child'} />
                {book.error != null && <ErrorState error={book.error} />}
                <Button variant="primary" size="lg" className="w-full whitespace-normal" disabled={!ready} loading={book.isPending} onClick={() => book.mutate()}>
                  Book {pick.class_name}, {dateLong(pick.starts_at)}
                </Button>
              </div>
            )}
          </section>
        )}
        {s?.open && !book.isSuccess && who === 'self' && <AdultDropIn slug={slug} school={s} about={about} info={sinfo.data ?? null} />}
        <PoweredBy className="justify-center border-t border-line pt-6" />
      </div>
    </main>
  );
}

type DropIn = { session_id: string; class_name: string; starts_at: string; ends_at: string; price_minor: number; places_left: number };

/** Adults book a single class for themselves (R-034). */
function AdultDropIn({ slug, school, about, info }: { slug: string; school: School; about: Map<string, ClassInfo>; info: SchoolInfo | null }) {
  const rows = useQuery({ queryKey: ['public-dropins', slug],
    queryFn: () => readAs<DropIn>(null, `select * from app.public_drop_in_sessions($1)`, [slug]) });
  const [pick, setPick] = React.useState<DropIn | null>(null);
  const [f, setF] = React.useState({ name: '', email: '', phone: '', emergency_name: '', emergency_phone: '', website: '', privacy_ack: false, marketing: false, adult_confirm: false });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF(x => ({ ...x, [k]: e.target.value }));
  const book = useMutation({
    mutationFn: async () => (await runAs(null, q => q<{ r: string }>(`select app.public_adult_drop_in($1, $2, $3::jsonb) r`, [slug, pick!.session_id, JSON.stringify(f)])))[0]?.r,
  });
  if (!rows.data?.length) return null;
  if (book.isSuccess) return (
    <section aria-live="polite" className="space-y-5 border-t-2 border-ink pt-4">
      <Notice word={book.data === 'held' ? 'Held' : 'Booked'} tone={book.data === 'held' ? 'caution' : 'positive'}
        title={`See you at ${pick!.class_name}`}
        detail={book.data === 'held'
          ? `Your place is held for 30 minutes. The school will send your ${money(pick!.price_minor)} invoice now — the place is confirmed once it is paid.`
          : `${money(pick!.price_minor)} — pay on the night or online once the school sends your invoice.`} />
      <Confirmation when={pick!.starts_at} until={pick!.ends_at} cls={about.get(pick!.class_name) ?? null} school={info} schoolName={school.name}
        next="Come again whenever you like: book each class here, or ask the school about a class pack." />
    </section>
  );
  const ok = f.name.trim() && /@.+\./.test(f.email) && f.phone.trim() && f.emergency_phone.trim() && f.privacy_ack && f.adult_confirm;
  return (
    <section aria-labelledby="j-adults" className="space-y-4">
      <div className="border-b-2 border-ink pb-2">
        <h2 id="j-adults" className="section-title text-[1.0625rem]">Drop in</h2>
        <p className="text-[0.8125rem] text-ink-3">Book a single class for yourself. No commitment.</p>
      </div>
      <ul className="divide-y divide-line" aria-label="Drop-in classes">
        {rows.data.map(x => (
          <li key={x.session_id}>
            <button onClick={() => setPick(x)} aria-pressed={pick?.session_id === x.session_id}
              className={cn('grid w-full grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3.5 text-left hover:bg-surface-2/60', pick?.session_id === x.session_id && 'bg-accent-soft hover:bg-accent-soft')}>
              <span className="pl-1">
                <span className="block font-display text-[1.25rem] leading-none tnum">{time(x.starts_at)}</span>
                <span className="mt-1 block text-[0.7812rem] text-ink-3">{new Date(x.starts_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </span>
              <span className="min-w-0"><span className="block font-semibold">{x.class_name}</span>
                <span className="block text-[0.8125rem] text-ink-3">{[about.get(x.class_name)?.level_note, `${x.places_left} place${x.places_left === 1 ? '' : 's'} left`].filter(Boolean).join(' · ')}</span>
                {about.get(x.class_name)?.description && <span className="mt-0.5 line-clamp-2 block text-[0.8125rem] text-ink-2">{about.get(x.class_name)!.description}</span>}</span>
              <span className="pr-1 text-[0.8438rem] font-semibold">{money(x.price_minor)}</span>
            </button>
          </li>
        ))}
      </ul>
      {pick && (
        <div className="card space-y-4 p-4 sm:p-5">
          {about.get(pick.class_name) && <ClassFacts c={about.get(pick.class_name)!} />}
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
          {/* Adult classes book the adult, never a child on the same email (UR-06). */}
          <label className="flex min-h-[44px] items-center gap-3 text-[0.875rem]">
            <input type="checkbox" checked={f.adult_confirm} className="size-[18px] accent-[var(--color-accent)]"
                   onChange={e => setF(x => ({ ...x, adult_confirm: e.target.checked }))} />
            I am 18 or over, and booking for myself
          </label>
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
    <div className="space-y-2 border-l-2 border-line-strong py-1 pl-3 text-[0.8438rem] text-ink-2">
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

/** A class in plain words: what it is, who it suits, what to bring, what it costs. */
function ClassFacts({ c }: { c: ClassInfo }) {
  const rows: [string, React.ReactNode][] = ([
    ['Level', c.level_note ?? c.level],
    ['Ages', ages(c.age_min, c.age_max)],
    ['Before joining', c.prerequisites],
    ['Wear or bring', c.what_to_bring],
    ['Uniform', uniformText(c)],
    ['Price', [c.trial_price_minor != null ? (c.trial_price_minor ? `Trial ${money(c.trial_price_minor)}` : 'Free trial') : null, ongoing(c) ? `then ${ongoing(c)}` : null].filter(Boolean).join(', ') || null],
  ] as [string, React.ReactNode][]).filter(([, v]) => v);
  return (
    <div className="space-y-2 text-[0.875rem]">
      {c.description && <p className="text-ink-2">{c.description}</p>}
      <dl className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-3 gap-y-1">
        {rows.map(([k, v]) => <React.Fragment key={k}><dt className="text-ink-3">{k}</dt><dd>{v}</dd></React.Fragment>)}
      </dl>
    </div>
  );
}

/** After booking: when, where (with a map), what to bring, arriving, cancelling, and what happens next. */
function Confirmation({ when, until, cls, school, schoolName, next }: {
  when: string; until?: string | null; cls: ClassInfo | null; school: SchoolInfo | null; schoolName: string; next: string;
}) {
  const map = mapLink(cls);
  const where = [cls?.location, cls?.address, cls?.postcode].filter(Boolean).join(', ');
  const contact = [school?.contact_phone, school?.contact_email].filter(Boolean).join(' or ');
  const rows: [string, React.ReactNode][] = ([
    ['When', `${dateLong(when)}, ${time(when)}${until ? `–${time(until)}` : ''}`],
    ['Where', where ? <>{where}{map && <> · <a href={map} target="_blank" rel="noreferrer" className="font-medium text-accent-text underline">Open in maps</a></>}</> : null],
    ['Wear or bring', cls?.what_to_bring],
    ['Uniform', uniformText(cls)],
    ['Arriving', school?.arrival_note],
    ['If you can’t come', school ? `${school.cancellation_note}${contact ? ` Contact ${schoolName}: ${contact}.` : ''}` : null],
    ['What happens next', next],
  ] as [string, React.ReactNode][]).filter(([, v]) => v);
  return (
    <dl className="divide-y divide-line border-y border-line text-[0.9062rem]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-x-4 py-2.5 sm:grid-cols-[10rem_minmax(0,1fr)]">
          <dt className="font-semibold text-ink">{k}</dt><dd className="text-ink-2">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

type SafetyForm = { has_medical: string; allergies: string; medical: string; emergency_name: string; emergency_phone: string; photo_consent: string };

/**
 * What the teacher needs to know for a first class (UR-42): allergies and
 * medical needs, someone else to ring, and whether photos are all right. It
 * goes on the teacher's register brief exactly as for any other dancer.
 */
function SafetyQuestions<F extends SafetyForm>({ self, form, set, setForm }: {
  self: boolean; form: F;
  set: (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setForm: React.Dispatch<React.SetStateAction<F>>;
}) {
  const choose = (k: 'has_medical' | 'photo_consent', v: string) => setForm(f => ({ ...f, [k]: v }));
  const who = self ? 'you' : 'your child';
  const area = 'w-full rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12';
  return (
    <div className="space-y-4">
      <h3 className="border-b border-ink pb-1.5 text-[0.875rem] font-semibold">For the teacher</h3>
      <fieldset>
        <legend className="mb-1 text-[0.875rem] font-medium">Does {who} have any allergies or medical needs? <span className="text-critical" aria-hidden>*</span></legend>
        <div className="flex flex-wrap gap-x-6">
          {([['no', 'No'], ['yes', 'Yes']] as const).map(([v, l]) => (
            <label key={v} className="flex min-h-11 items-center gap-2 text-[0.875rem]">
              <input type="radio" name="j-med" className="size-5 accent-[var(--color-accent)]" checked={form.has_medical === v} onChange={() => choose('has_medical', v)} /> {l}
            </label>
          ))}
        </div>
      </fieldset>
      {form.has_medical === 'yes' && (
        <div className="grid gap-3">
          <Field label="Allergies" htmlFor="j-al" hint="For example: peanuts, carries an EpiPen.">
            <Input id="j-al" value={form.allergies} maxLength={500} onChange={set('allergies')} />
          </Field>
          <Field label="Other medical needs" htmlFor="j-md" hint="Conditions, medication, or anything the teacher should do.">
            <textarea id="j-md" rows={2} maxLength={1000} value={form.medical} onChange={set('medical')} className={area} />
          </Field>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={self ? 'Emergency contact' : 'Another emergency contact'} htmlFor="j-en" required={self}
               hint={self ? 'Someone we can ring if you are unwell.' : 'Optional: someone else to ring if we can’t reach you.'}>
          <Input id="j-en" value={form.emergency_name} maxLength={120} onChange={set('emergency_name')} />
        </Field>
        <Field label="Their phone" htmlFor="j-ep" required={self || !!form.emergency_name.trim()}>
          <Input id="j-ep" type="tel" value={form.emergency_phone} maxLength={40} onChange={set('emergency_phone')} />
        </Field>
      </div>
      <fieldset>
        <legend className="mb-1 text-[0.875rem] font-medium">May the school take photos of {who} in class for its own use? <span className="text-critical" aria-hidden>*</span></legend>
        <div className="flex flex-wrap gap-x-6">
          {([['true', 'Yes'], ['false', 'No']] as const).map(([v, l]) => (
            <label key={v} className="flex min-h-11 items-center gap-2 text-[0.875rem]">
              <input type="radio" name="j-photo" className="size-5 accent-[var(--color-accent)]" checked={form.photo_consent === v} onChange={() => choose('photo_consent', v)} /> {l}
            </label>
          ))}
        </div>
        <p className="text-[0.8125rem] text-ink-3">You can change this at any time.</p>
      </fieldset>
    </div>
  );
}
