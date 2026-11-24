'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, MapPin } from 'lucide-react';
import { readAs, runAs } from '@/lib/db/client';
import { SchoolMark, PoweredBy, useSchoolTheme } from '@/components/app/brand';
import { Button, Card, EmptyState, ErrorState, Field, Input, Skeleton } from '@/components/ui';
import { money, dateLong, time } from '@/lib/format';
import { cn } from '@/lib/cn';

type School = { name: string; brand_colour: string | null; logo_url: string | null; open: boolean; theme: string; brand_secondary: string | null };
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
  const [form, setForm] = React.useState({ contact_name: '', contact_email: '', contact_phone: '', child_name: '', child_dob: '', website: '' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const book = useMutation({
    mutationFn: () => runAs(null, q => q(`select app.public_book_trial($1, $2, $3::jsonb)`, [slug, pick!.session_id, JSON.stringify(form)])),
  });

  const n = Number(age);
  const shown = (slots.data ?? []).filter(s => !age || ((s.age_min == null || n >= s.age_min) && (s.age_max == null || n <= s.age_max)));
  const s = school.data;
  const ready = form.contact_name.trim() && form.child_name.trim() && form.child_dob && form.contact_phone.trim() && /@.+\./.test(form.contact_email);

  return (
    <main className="min-h-dvh bg-surface-2 px-4 py-8">
      <div className="mx-auto max-w-xl space-y-5">
        {!slug && <Card className="p-6"><EmptyState title="Which school?" body="This link is missing the school’s name. Use the link from the school’s website." /></Card>}
        {school.isLoading && <Skeleton className="h-24" />}
        {school.error && <ErrorState error={school.error} />}
        {slug && school.data === null && <Card className="p-6"><EmptyState title="School not found" body="Check the link, or ask the school for theirs." /></Card>}
        {s && (
          <header className="flex items-center gap-3">
            <SchoolMark name={s.name} logo={s.logo_url} className="size-12" />
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight">{s.name}</h1>
              <p className="text-sm text-ink-2">Book a trial class</p>
            </div>
          </header>
        )}
        {s && !s.open && <Card className="p-6"><EmptyState title="Not taking bookings online just now" body="Please contact the school directly." /></Card>}

        {book.isSuccess ? (
          <Card className="p-6 text-center">
            <CheckCircle2 className="mx-auto mb-2 size-8 text-positive" aria-hidden />
            <h2 className="text-lg font-semibold">You are booked in</h2>
            <p className="mt-1 text-sm text-ink-2">
              {form.child_name.split(' ')[0]} is coming to {pick!.class_name} on {dateLong(pick!.starts_at)} at {time(pick!.starts_at)}.
              {' '}{s?.name} will be in touch by email with what to bring.
            </p>
          </Card>
        ) : s?.open && (
          <>
            <Card className="p-4">
              <Field label="How old is your child?" htmlFor="j-age" hint="We will show the classes that suit them.">
                <Input id="j-age" type="number" inputMode="numeric" min={2} max={99} value={age} onChange={e => setAge(e.target.value)} className="w-24" />
              </Field>
            </Card>
            <Card>
              {slots.isLoading && <div className="p-4"><Skeleton className="h-24" /></div>}
              {slots.data && shown.length === 0 && <EmptyState title="No trial places in the next three weeks" body="Please contact the school — they may have a place soon." />}
              <ul className="divide-y divide-line" aria-label="Trial classes">
                {shown.map(x => (
                  <li key={x.session_id}>
                    <button onClick={() => setPick(x)} aria-pressed={pick?.session_id === x.session_id}
                      className={cn('flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2',
                        pick?.session_id === x.session_id && 'bg-accent-soft')}>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{x.class_name}</span>
                        <span className="block text-[13px] text-ink-2">
                          {dateLong(x.starts_at)} · {time(x.starts_at)}
                          {x.age_min != null && ` · ages ${x.age_min}${x.age_max != null ? `–${x.age_max}` : '+'}`}
                        </span>
                        {x.location && <span className="flex items-center gap-1 text-[12.5px] text-ink-3"><MapPin className="size-3" aria-hidden /> {x.location}</span>}
                      </span>
                      <span className="shrink-0 text-right text-[13px]">
                        <span className="block font-medium">{x.trial_price_minor ? money(x.trial_price_minor) : 'Free'}</span>
                        <span className="block text-ink-3">{x.places_left} place{x.places_left === 1 ? '' : 's'}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
            {pick && (
              <Card className="space-y-3 p-4">
                <h2 className="font-semibold">Your details</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Child’s name" htmlFor="j-cn" required><Input id="j-cn" value={form.child_name} onChange={set('child_name')} /></Field>
                  <Field label="Date of birth" htmlFor="j-cd" required><Input id="j-cd" type="date" value={form.child_dob} onChange={set('child_dob')} /></Field>
                </div>
                <Field label="Your name" htmlFor="j-pn" required><Input id="j-pn" value={form.contact_name} onChange={set('contact_name')} autoComplete="name" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email" htmlFor="j-pe" required><Input id="j-pe" type="email" value={form.contact_email} onChange={set('contact_email')} autoComplete="email" /></Field>
                  <Field label="Mobile" htmlFor="j-pp" required hint="Rung in an emergency."><Input id="j-pp" type="tel" value={form.contact_phone} onChange={set('contact_phone')} autoComplete="tel" /></Field>
                </div>
                {/* Honeypot: hidden from people, filled in by bots. */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0"
                       value={form.website} onChange={set('website')} />
                {book.error != null && <ErrorState error={book.error} />}
                <Button variant="primary" className="w-full" disabled={!ready} loading={book.isPending} onClick={() => book.mutate()}>
                  Book {pick.class_name}, {dateLong(pick.starts_at)}
                </Button>
                <p className="text-[12.5px] text-ink-3">The school uses these details to arrange the trial and to contact you in an emergency.</p>
              </Card>
            )}
          </>
        )}
        {s?.open && !book.isSuccess && <AdultDropIn slug={slug} />}
        <PoweredBy className="justify-center" />
      </div>
    </main>
  );
}

type DropIn = { session_id: string; class_name: string; starts_at: string; price_minor: number; places_left: number };

/** Adults book a single class for themselves (R-034). */
function AdultDropIn({ slug }: { slug: string }) {
  const rows = useQuery({ queryKey: ['public-dropins', slug],
    queryFn: () => readAs<DropIn>(null, `select * from app.public_drop_in_sessions($1)`, [slug]) });
  const [pick, setPick] = React.useState<DropIn | null>(null);
  const [f, setF] = React.useState({ name: '', email: '', phone: '', emergency_name: '', emergency_phone: '', website: '' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF(x => ({ ...x, [k]: e.target.value }));
  const book = useMutation({
    mutationFn: () => runAs(null, q => q(`select app.public_adult_drop_in($1, $2, $3::jsonb)`, [slug, pick!.session_id, JSON.stringify(f)])),
  });
  if (!rows.data?.length) return null;
  if (book.isSuccess) return (
    <Card className="p-6 text-center">
      <CheckCircle2 className="mx-auto mb-2 size-8 text-positive" aria-hidden />
      <h2 className="text-lg font-semibold">See you at {pick!.class_name}</h2>
      <p className="mt-1 text-sm text-ink-2">{dateLong(pick!.starts_at)} at {time(pick!.starts_at)}. {money(pick!.price_minor)} — pay on the night or online once the school sends your invoice.</p>
    </Card>
  );
  const ok = f.name.trim() && /@.+\./.test(f.email) && f.phone.trim() && f.emergency_phone.trim();
  return (
    <Card>
      <div className="p-4 pb-2"><h2 className="font-semibold">Adults: drop in</h2><p className="text-[13px] text-ink-2">Book a single class for yourself. No commitment.</p></div>
      <ul className="divide-y divide-line" aria-label="Drop-in classes">
        {rows.data.map(x => (
          <li key={x.session_id}>
            <button onClick={() => setPick(x)} aria-pressed={pick?.session_id === x.session_id}
              className={cn('flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2', pick?.session_id === x.session_id && 'bg-accent-soft')}>
              <span className="min-w-0 flex-1"><span className="block font-medium">{x.class_name}</span>
                <span className="block text-[13px] text-ink-2">{dateLong(x.starts_at)} · {time(x.starts_at)}</span></span>
              <span className="text-[13px] font-medium">{money(x.price_minor)}</span>
            </button>
          </li>
        ))}
      </ul>
      {pick && (
        <div className="space-y-3 border-t border-line p-4">
          <Field label="Your name" htmlFor="ad-n" required><Input id="ad-n" value={f.name} onChange={set('name')} autoComplete="name" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" htmlFor="ad-e" required><Input id="ad-e" type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
            <Field label="Mobile" htmlFor="ad-p" required><Input id="ad-p" type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Emergency contact" htmlFor="ad-en"><Input id="ad-en" value={f.emergency_name} onChange={set('emergency_name')} /></Field>
            <Field label="Their phone" htmlFor="ad-ep" required><Input id="ad-ep" type="tel" value={f.emergency_phone} onChange={set('emergency_phone')} /></Field>
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" value={f.website} onChange={set('website')} />
          {book.error != null && <ErrorState error={book.error} />}
          <Button variant="primary" className="w-full" disabled={!ok} loading={book.isPending} onClick={() => book.mutate()}>
            Book {pick.class_name}, {money(pick.price_minor)}
          </Button>
        </div>
      )}
    </Card>
  );
}
