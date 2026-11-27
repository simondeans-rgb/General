'use client';

import * as React from 'react';
import { StudentExams } from '@/components/app/exams';
import { PracticeLog } from '@/components/app/practice';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CalendarOff, Sparkles, UserPlus } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Beats, Button, EmptyState, Field, Input, Skeleton, ErrorState,
} from '@/components/ui';
import * as F from '@/lib/repos/family';
import { YourDetails, EmergencyContacts } from '@/components/app/family-details';
import { ChildClassesSheet, AddChildSheet } from '@/components/app/family-classes';
import { DropIns } from '@/components/app/drop-ins';
import { FamilyConsents } from '@/components/app/consents';
import { ChildLogin, CollectionList } from '@/components/app/family-care';
import { ageFrom, dateShort } from '@/lib/format';

type Child = {
  id: string; first_name: string; last_name: string; date_of_birth: string;
  class_names: string | null; attendance_pct: number | null;
  has_alert: boolean; allergies: string | null; photo_consent: boolean | null;
  /** An adult participant (UR-21); is_me when that adult is the signed-in guardian. */
  is_adult?: boolean; is_me?: boolean;
};

export default function FamilyChildren() {
  const children = useRows<Child>(['my-children'], F.MY_CHILDREN);
  const [reporting, setReporting] = React.useState<Child | null>(null);
  const [browsing, setBrowsing] = React.useState<Child | null>(null);
  const [adding, setAdding] = React.useState(false);

  return (
    <Shell title="Your family" allow={['guardian']}
      actions={<Button size="sm" onClick={() => setAdding(true)}><UserPlus className="size-4" aria-hidden /> Add a child</Button>}>
      <div className="mx-auto max-w-2xl space-y-12 lg:max-w-[1180px]">
        {children.isLoading && <Skeleton className="h-40" />}
        {children.error != null && <ErrorState error={children.error} />}
        {children.data?.length === 0 && <EmptyState title="No children on your account yet"
          body="Add a child and the studio will set them up." action={<Button onClick={() => setAdding(true)}>Add a child</Button>} />}

        {children.data?.map(c => (
          <section key={c.id} aria-labelledby={`child-${c.id}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 border-ink pb-2">
              <h2 id={`child-${c.id}`} className="font-display text-[24px] leading-none">{c.first_name} {c.last_name}{c.is_me ? ' (you)' : ''}</h2>
              <span className="text-[13px] text-ink-3">{c.is_adult ? 'Adult' : `${ageFrom(c.date_of_birth)} · born ${dateShort(c.date_of_birth)}`}</span>
            </div>
            {/* Desktop: details on the left, actions and practice alongside. */}
            <div className="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
            <div className="min-w-0">
            <dl className="divide-y divide-line text-[14.5px]">
              <Row label="Classes">{c.class_names ?? <span className="text-ink-3">Not in a class yet</span>}</Row>
              {c.attendance_pct != null && (
                <Row label="Attendance">
                  <span className="flex items-center gap-2.5">
                    <span className="tnum font-semibold">{c.attendance_pct}%</span>
                    <Beats value={c.attendance_pct} max={100} tone="ink" label={`Attended ${c.attendance_pct}% of classes`} />
                  </span>
                </Row>
              )}
              <FamilyConsents studentId={c.id} name={c.first_name} />
              {c.has_alert && (
                <Row label="Medical">
                  <span className="font-semibold text-critical">{c.allergies ?? 'On record'}</span>
                  <p className="mt-1 text-[13px] text-ink-3">
                    {c.first_name}’s teachers see allergies, conditions, medication, the emergency plan, emergency contacts and photo consent, for the classes they teach. The family doctor and the rest of the record stay with the office.
                    To change any of it,{' '}
                    <Link href="/family/enquiries" className="font-semibold text-accent-text underline">tell the studio</Link>,
                    so there is a record of who changed what.
                  </p>
                </Row>
              )}
              <Row label="Exams"><StudentExams studentId={c.id} /></Row>
              <EmergencyContacts studentId={c.id} name={c.first_name} />
              {!c.is_adult && <CollectionList studentId={c.id} name={c.first_name} />}
              {!c.is_adult && <ChildLogin studentId={c.id} name={c.first_name} />}
            </dl>
            </div>
            <aside className="min-w-0 lg:pt-3">
            <div className="flex flex-wrap gap-2 border-t border-line py-3 lg:border-t-0 lg:pt-0">
              <Button onClick={() => setBrowsing(c)}>
                <Sparkles className="size-4" aria-hidden /> Classes and trials
              </Button>
              <Button onClick={() => setReporting(c)}>
                <CalendarOff className="size-4" aria-hidden /> Report an absence
              </Button>
            </div>
            <div className="pt-4"><PracticeLog studentId={c.id} who={c.first_name} bare /></div>
            </aside>
            </div>
          </section>
        ))}

        <div className="grid gap-12 lg:grid-cols-2">
          {children.data && <div className="min-w-0"><DropIns children={children.data} /></div>}
          <div className="min-w-0"><YourDetails /></div>
        </div>

        {/* Everything about the family that is not a child, one tap away. */}
        <nav aria-label="More" className="divide-y divide-line border-t-2 border-ink">
          {[
            ['/family/feedback', 'Teacher feedback', 'Notes, skills and milestones'],
            ['/family/events', 'Shows and events', 'What’s coming up, and entries'],
            ['/family/enquiries', 'Requests', 'Private lessons, questions, medical updates'],
            ['/family/privacy', 'Privacy and your data', 'Who sees what, download your data, ask to delete'],
          ].map(([href, title, body]) => (
            <Link key={href} href={href!} className="group flex min-h-[56px] items-center gap-3 py-3">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{title}</span>
                <span className="block text-[13px] text-ink-3">{body}</span>
              </span>
              <ArrowRight className="size-4 text-ink-3 group-hover:text-ink" aria-hidden />
            </Link>
          ))}
        </nav>
      </div>

      {reporting && <AbsenceDialog child={reporting} onClose={() => setReporting(null)} />}
      {browsing && <ChildClassesSheet child={browsing} onClose={() => setBrowsing(null)} />}
      {adding && <AddChildSheet onClose={() => setAdding(false)} />}
    </Shell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3">
      <dt className="text-ink-3">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

/** Reporting an absence sends a message to the studio; it does not write the
 *  register. A parent marking their own child absent in advance is a request,
 *  and the teacher still takes the register on the day. */
function AbsenceDialog({ child, onClose }: { child: Child; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [when, setWhen] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [reason, setReason] = React.useState('');
  const [done, setDone] = React.useState(false);

  const send = useMutation({
    mutationFn: async () => runAs(session, q => q(F.REPORT_ABSENCE, [
      child.id, new Date(when).toISOString(),
      reason.trim() || `${child.first_name} will not be at class.`,
    ])),
    onSuccess: () => { setDone(true); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="absence-title"
           onClick={e => e.stopPropagation()}
           className="max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)] border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        {done ? (
          <div className="py-2">
            <p className="font-display text-[22px] uppercase leading-none tracking-[-0.01em] text-positive [font-stretch:80%]">Sent</p>
            <p id="absence-title" className="mt-1.5 font-semibold">The studio has been told</p>
            <p className="mt-1 text-sm text-ink-2">
              Your message is in {child.first_name}&rsquo;s file. The teacher will see it before class.
            </p>
            <Button className="mt-4 w-full" variant="primary" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <h2 id="absence-title" className="text-[17px] font-semibold tracking-tight">
              Report an absence
            </h2>
            <p className="mt-0.5 text-sm text-ink-2">For {child.first_name}</p>
            <div className="mt-4 space-y-3">
              <Field label="Which day" htmlFor="absence-date">
                <Input id="absence-date" type="date" value={when} onChange={e => setWhen(e.target.value)} />
              </Field>
              <Field label="Anything the teacher should know" htmlFor="absence-reason"
                     hint="Optional. A short note is plenty.">
                <Input id="absence-reason" value={reason} onChange={e => setReason(e.target.value)}
                       placeholder="School trip, unwell, family holiday…" />
              </Field>
            </div>
            {send.isError && <div className="mt-3"><ErrorState error={send.error} /></div>}
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" variant="primary" loading={send.isPending}
                      onClick={() => send.mutate()}>Send</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
