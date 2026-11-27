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
import { AbsenceDialog as SharedAbsenceDialog } from '@/components/app/absence-report';
import { ageFrom, dateShort } from '@/lib/format';

type Child = {
  id: string; first_name: string; last_name: string; date_of_birth: string;
  class_names: string | null; attendance_pct: number | null;
  has_alert: boolean; allergies: string | null; photo_consent: boolean | null;
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
              <h2 id={`child-${c.id}`} className="font-display text-[24px] leading-none">{c.first_name} {c.last_name}</h2>
              <span className="text-[13px] text-ink-3">{ageFrom(c.date_of_birth)} · born {dateShort(c.date_of_birth)}</span>
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
              <Row label="Photos">
                {c.photo_consent === false
                  ? <span className="font-semibold">Not permitted</span>
                  : c.photo_consent ? <span>Permitted</span>
                    : <span className="text-ink-3">Not recorded</span>}
              </Row>
              {c.has_alert && (
                <Row label="Medical">
                  <span className="font-semibold text-critical">{c.allergies ?? 'On record'}</span>
                  <p className="mt-1 text-[13px] text-ink-3">
                    Teachers see allergies and the emergency plan only, never the full record.
                    To change any of it,{' '}
                    <Link href="/family/enquiries" className="font-semibold text-accent-text underline">tell the studio</Link>,
                    so there is a record of who changed what.
                  </p>
                </Row>
              )}
              <Row label="Exams"><StudentExams studentId={c.id} /></Row>
              <EmergencyContacts studentId={c.id} name={c.first_name} />
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

/** Reporting an absence reaches the session: the register is pre-marked
 *  "Excused · reported by parent", which the teacher can change, the teacher
 *  sees it on Today, and the office gets a copy (UR-07). The form lives in
 *  components/app/absence-report, shared with students of 13 and over. */
function AbsenceDialog({ child, onClose }: { child: Child; onClose: () => void }) {
  return <SharedAbsenceDialog studentId={child.id} firstName={child.first_name} onClose={onClose} />;
}
