'use client';

import * as React from 'react';
import { StudentExams } from '@/components/app/exams';
import { ChildUniform } from '@/components/app/uniform';
import { PracticeLog } from '@/components/app/practice';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CalendarOff, Pencil, Sparkles, UserPlus } from 'lucide-react';
import { ChildDetailsSheet } from '@/components/app/child-details-sheet';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Beats, Button, EmptyState, Field, Input, Skeleton, ErrorState, ViewTabs,
} from '@/components/ui';
import { BookingList, useBookings } from '@/components/app/bookings';
import * as F from '@/lib/repos/family';
import { YourDetails, EmergencyContacts } from '@/components/app/family-details';
import { ChildClassesSheet, AddChildSheet } from '@/components/app/family-classes';
import { DropIns } from '@/components/app/drop-ins';
import { FamilyConsents } from '@/components/app/consents';
import { ChildLogin, CollectionList } from '@/components/app/family-care';
import { BookForMyself, useFamilyVoice } from '@/components/app/adult-self';
import { AbsenceDialog as SharedAbsenceDialog } from '@/components/app/absence-report';
import { ageFrom, dateShort } from '@/lib/format';

type Child = {
  id: string; first_name: string; last_name: string; date_of_birth: string;
  class_names: string | null; attendance_pct: number | null;
  has_alert: boolean; allergies: string | null; photo_consent: boolean | null;
  /** An adult participant (UR-21); is_me when that adult is the signed-in guardian. */
  is_adult?: boolean; is_me?: boolean;
  preferred_name?: string | null; pronouns?: string | null; school?: string | null;
};

export default function FamilyChildren() {
  const children = useRows<Child>(['my-children'], F.MY_CHILDREN);
  const [reporting, setReporting] = React.useState<Child | null>(null);
  const [browsing, setBrowsing] = React.useState<Child | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [editing, setEditing] = React.useState<Child | null>(null);
  // An adult student on their own reads about themselves, not a family (UR-21).
  const voice = useFamilyVoice();
  // One person at a time, chosen with chips at the top (U4). A link from
  // elsewhere can open a given child: /family/children?child=<id>.
  const [pick, setPick] = React.useState<string>('');
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('child');
    if (id) setPick(id);
  }, []);
  const list = children.data ?? [];
  const current = list.find(c => c.id === pick) ?? list[0];
  const bookings = useBookings();

  return (
    <Shell title={voice.solo ? 'Your details' : 'Your family'} allow={['guardian']}
      // An adult on their own is never asked to add a child (U12).
      actions={voice.solo ? undefined : <Button size="sm" onClick={() => setAdding(true)}><UserPlus className="size-4" aria-hidden /> Add a child</Button>}>
      <div className="mx-auto max-w-2xl space-y-12 lg:max-w-[1180px]">
        {list.length > 1 && current && (
          <ViewTabs label="Whose details" value={current.id} onChange={setPick}
            options={list.map(c => [c.id, c.is_me ? 'You' : c.first_name] as [string, string])} />
        )}
        {children.isLoading && <Skeleton className="h-40" />}
        {children.error != null && <ErrorState error={children.error} />}
        {children.data?.length === 0 && <EmptyState title="No children on your account yet"
          body="Add a child and the studio will set them up." action={<Button onClick={() => setAdding(true)}>Add a child</Button>} />}

        {current && [current].map(c => (
          <section key={c.id} aria-labelledby={`child-${c.id}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 border-ink pb-2">
              <h2 id={`child-${c.id}`} className="font-display text-[1.5rem] leading-none">{c.first_name} {c.last_name}{c.is_me && !voice.solo ? ' (you)' : ''}</h2>
              <span className="text-[0.8125rem] text-ink-3">{c.is_me ? 'Adult student' : c.is_adult ? 'Adult' : `${ageFrom(c.date_of_birth)} · born ${dateShort(c.date_of_birth)}`}</span>
            </div>
            {/* What a parent comes here to do, first (U4). */}
            <div className="flex flex-wrap gap-2 py-3">
              <Button onClick={() => setReporting(c)}>
                <CalendarOff className="size-4" aria-hidden /> {c.is_me ? 'I can’t make it' : 'Report an absence'}
              </Button>
              <Button onClick={() => setEditing(c)}>
                <Pencil className="size-4" aria-hidden /> Update details
              </Button>
              <Button onClick={() => setBrowsing(c)}>
                <Sparkles className="size-4" aria-hidden /> {c.is_me ? 'Book a class' : 'Classes and trials'}
              </Button>
            </div>
            {/* Desktop: details on the left, actions and practice alongside. */}
            <div className="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
            <div className="min-w-0">
            <dl className="divide-y divide-line text-[0.9062rem]">
              {(c.preferred_name || c.pronouns || c.school) && (
                <Row label="Details">
                  {[c.preferred_name && `Goes by ${c.preferred_name}`, c.pronouns, c.school].filter(Boolean).join(' · ')}
                </Row>
              )}
              <Row label="Classes">{c.class_names
                ?? (bookings.data.some(b => b.student_id === c.id)
                  ? <span className="text-ink-3">No term classes. {c.is_me ? 'Your' : 'Their'} bookings are below.</span>
                  : <span className="text-ink-3">{c.is_me ? 'You’re not in a class yet' : 'Not in a class yet'}</span>)}</Row>
              {/* Drop-ins and trials, with references, calendar and cancel (U12, F5). */}
              <BookingList studentId={c.id} who={c.is_me ? 'you' : c.first_name} />
              {c.attendance_pct != null && (
                <Row label="Attendance">
                  <span className="flex items-center gap-2.5">
                    <span className="tnum font-semibold">{c.attendance_pct}%</span>
                    <Beats value={c.attendance_pct} max={100} tone="ink" label={`Attended ${c.attendance_pct}% of classes`} />
                  </span>
                </Row>
              )}
              <FamilyConsents studentId={c.id} name={c.is_me ? 'you' : c.first_name} summary />
              {c.has_alert && (
                <Row label="Medical">
                  <span className="font-semibold text-critical">{c.allergies ?? 'On record'}</span>
                  <p className="mt-1 text-[0.8125rem] text-ink-3">
                    {c.is_me ? 'Your' : `${c.first_name}’s`} teachers see allergies, conditions, medication, the emergency plan, emergency contacts and photo consent, for the classes they teach. The family doctor and the rest of the record stay with the office.
                    To change any of it,{' '}
                    <Link href="/family/enquiries" className="font-semibold text-accent-text underline">tell the studio</Link>,
                    so there is a record of who changed what.
                  </p>
                </Row>
              )}
              <ChildUniform studentId={c.id} wrap={x => <Row label="Uniform">{x}</Row>} />
              <Row label="Exams"><StudentExams studentId={c.id} /></Row>
              <EmergencyContacts studentId={c.id} name={c.first_name} />
              {!c.is_adult && <CollectionList studentId={c.id} name={c.first_name} />}
              {!c.is_adult && <ChildLogin studentId={c.id} name={c.first_name} />}
            </dl>
            </div>
            <aside className="min-w-0 lg:pt-3">
            <div className="border-t border-line pt-4 lg:border-t-0 lg:pt-0"><PracticeLog studentId={c.id} who={c.is_me ? 'you' : c.first_name} bare /></div>
            </aside>
            </div>
          </section>
        ))}

        {/* A parent who dances too books in their own name (UR-21). */}
        {children.data && <BookForMyself />}

        <div className="grid gap-12 lg:grid-cols-2">
          {children.data && <div className="min-w-0"><DropIns children={children.data} /></div>}
          <div className="min-w-0"><YourDetails /></div>
        </div>

        {/* Everything else, one tap away. */}
        <nav aria-label="More" className="divide-y divide-line border-t-2 border-ink">
          {[
            ['/family/feedback', voice.solo ? 'Feedback from your teachers' : 'Teacher feedback', 'Notes, skills and milestones'],
            ['/family/events', 'Shows and events', 'What’s coming up, and entries'],
            ['/family/enquiries', 'Requests', 'Private lessons, questions, medical updates'],
            ['/family/privacy', 'Privacy and your data', 'Who sees what, download your data, ask to delete'],
          ].map(([href, title, body]) => (
            <Link key={href} href={href!} className="group flex min-h-[56px] items-center gap-3 py-3">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{title}</span>
                <span className="block text-[0.8125rem] text-ink-3">{body}</span>
              </span>
              <ArrowRight className="size-4 text-ink-3 group-hover:text-ink" aria-hidden />
            </Link>
          ))}
        </nav>
      </div>

      {reporting && <AbsenceDialog child={reporting} onClose={() => setReporting(null)} />}
      {browsing && <ChildClassesSheet child={browsing} onClose={() => setBrowsing(null)} />}
      {adding && <AddChildSheet onClose={() => setAdding(false)} />}
      {editing && <ChildDetailsSheet child={editing} onClose={() => setEditing(null)} />}
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

/** Reporting an absence reaches the session: the register is pre-marked
 *  "Excused · reported by parent", which the teacher can change, the teacher
 *  sees it on Today, and the office gets a copy (UR-07). The form lives in
 *  components/app/absence-report, shared with students of 13 and over. */
function AbsenceDialog({ child, onClose }: { child: Child; onClose: () => void }) {
  return <SharedAbsenceDialog studentId={child.id} firstName={child.first_name} self={!!child.is_me} onClose={onClose} />;
}
