'use client';

import * as React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CameraOff, Camera, Check, CalendarOff } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Badge, Button, Card, CardHeader, EmptyState, Field, Input, Select, Skeleton, ErrorState,
} from '@/components/ui';
import * as F from '@/lib/repos/family';
import { ageFrom, dateShort, initials, time, dateLong, dayRange } from '@/lib/format';

type Child = {
  id: string; first_name: string; last_name: string; date_of_birth: string;
  class_names: string | null; attendance_pct: number | null;
  has_alert: boolean; allergies: string | null; photo_consent: boolean | null;
};

export default function FamilyChildren() {
  const children = useRows<Child>(['my-children'], F.MY_CHILDREN);
  const [reporting, setReporting] = React.useState<Child | null>(null);

  return (
    <Shell title="Your family" allow={['guardian']}>
      <div className="mx-auto max-w-lg space-y-4">
        {children.isLoading && <Card className="p-4"><Skeleton className="h-24" /></Card>}
        {children.error && <ErrorState error={children.error} />}
        {children.data?.length === 0 && <Card><EmptyState title="No children on your account yet" /></Card>}

        {children.data?.map(c => (
          <Card key={c.id}>
            <div className="flex items-center gap-3 p-4">
              <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-[15px] font-semibold text-accent-ink">
                {initials(c.first_name, c.last_name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-semibold tracking-tight">{c.first_name} {c.last_name}</p>
                <p className="text-[13px] text-ink-2">{ageFrom(c.date_of_birth)} years old · born {dateShort(c.date_of_birth)}</p>
              </div>
            </div>
            <dl className="space-y-2.5 border-t border-line px-4 py-3 text-sm">
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-ink-3">Classes</dt>
                <dd className="flex-1">{c.class_names ?? <span className="text-ink-3">Not enrolled yet</span>}</dd>
              </div>
              {c.attendance_pct != null && (
                <div className="flex gap-3">
                  <dt className="w-28 shrink-0 text-ink-3">Attendance</dt>
                  <dd className="flex-1">
                    <Badge tone={c.attendance_pct >= 85 ? 'positive' : c.attendance_pct >= 70 ? 'caution' : 'critical'}>
                      {c.attendance_pct}%
                    </Badge>
                  </dd>
                </div>
              )}
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-ink-3">Photos</dt>
                <dd className="flex-1">
                  {c.photo_consent === false
                    ? <span className="inline-flex items-center gap-1.5 font-medium text-critical">
                        <CameraOff className="size-3.5" aria-hidden /> Not permitted</span>
                    : c.photo_consent
                      ? <span className="inline-flex items-center gap-1.5 text-ink-2">
                          <Camera className="size-3.5" aria-hidden /> Permitted</span>
                      : <span className="text-ink-3">Not recorded</span>}
                </dd>
              </div>
              {c.has_alert && (
                <div className="flex gap-3">
                  <dt className="w-28 shrink-0 text-ink-3">Medical</dt>
                  <dd className="flex-1">
                    <span className="inline-flex items-center gap-1.5 font-medium text-critical">
                      <AlertTriangle className="size-3.5" aria-hidden /> {c.allergies ?? 'On record'}
                    </span>
                    <p className="mt-1 text-[12.5px] text-ink-3">
                      Teachers see allergies and the emergency plan only — never the full record.
                      To change any of it,{' '}
                      <Link href="/family/enquiries" className="text-accent hover:underline">
                        tell the studio</Link>, so there is a record of who changed what.
                    </p>
                  </dd>
                </div>
              )}
            </dl>
            <div className="border-t border-line p-3">
              <Button size="sm" onClick={() => setReporting(c)}>
                <CalendarOff className="size-4" aria-hidden /> Report an absence
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {reporting && <AbsenceDialog child={reporting} onClose={() => setReporting(null)} />}
    </Shell>
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
          <div className="py-4 text-center">
            <span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive" aria-hidden>
              <Check className="size-5" />
            </span>
            <p id="absence-title" className="font-medium">The studio has been told</p>
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
