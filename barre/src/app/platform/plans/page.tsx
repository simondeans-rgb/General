'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { RecordSheet } from '@/components/app/record-sheet';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, Card, ErrorState, Field, Input, Skeleton } from '@/components/ui';
import * as P from '@/lib/repos/platform';
import { money, toMinor } from '@/lib/format';

/** What schools pay for. Limits are enforced by the database (migration 0019). */
export default function PlansPage() {
  const plans = useRows<P.Plan>(['plans'], P.PLANS);
  const schools = useRows<P.School>(['schools'], P.SCHOOLS);
  const amSuper = useRows<{ yes: boolean }>(['am-super'], P.AM_SUPER).data?.[0]?.yes;
  const [editing, setEditing] = React.useState<P.Plan | null>(null);
  const limit = (n: number | null) => (n == null ? 'Unlimited' : n.toLocaleString('en-GB'));

  return (
    <Shell title="Plans" subtitle="What each school pays, and what it includes" allow={['platform']}>
      <div className="mx-auto max-w-4xl space-y-4">
        {plans.isLoading && <Skeleton className="h-40" />}
        {plans.error && <ErrorState error={plans.error} />}
        <div className="grid gap-3 sm:grid-cols-2">
          {plans.data?.map(p => {
            const on = schools.data?.filter(s => s.plan_code === p.code && s.status !== 'cancelled').length ?? 0;
            return (
              <Card key={p.id} className="p-4">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="flex items-center gap-2 font-semibold">{p.name}{p.is_trial && <Badge tone="info">Trial</Badge>}</h2>
                    <p className="tnum mt-1 text-[22px] font-semibold tracking-[-0.02em]">
                      {p.price_minor ? money(p.price_minor) : 'Free'}<span className="text-sm font-normal text-ink-3">{p.price_minor ? ' a month' : ''}</span>
                    </p>
                  </div>
                  {amSuper && (
                    <Button size="sm" variant="ghost" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}>
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                  )}
                </div>
                <dl className="mt-3 space-y-1 text-sm">
                  {([['Students', p.max_students], ['Locations', p.max_locations], ['Staff', p.max_staff]] as const).map(([k, v]) => (
                    <div key={k} className="flex justify-between"><dt className="text-ink-2">{k}</dt><dd className="tnum">{limit(v)}</dd></div>
                  ))}
                </dl>
                <p className="mt-3 border-t border-line pt-2 text-[12.5px] text-ink-3">{on} school{on === 1 ? '' : 's'} on this plan</p>
              </Card>
            );
          })}
        </div>
        <p className="text-[12.5px] text-ink-3">
          Taking payment from schools (Stripe Billing) is not connected yet: plans set limits and the console’s revenue
          figure, and you invoice schools yourself for now. Moving a school to a smaller plan never deletes anything — it
          only stops new additions past the limit.
        </p>
      </div>
      {editing && <PlanSheet plan={editing} onClose={() => setEditing(null)} />}
    </Shell>
  );
}

function PlanSheet({ plan, onClose }: { plan: P.Plan; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [name, setName] = React.useState(plan.name);
  const [price, setPrice] = React.useState((plan.price_minor / 100).toFixed(2));
  const [students, setStudents] = React.useState(plan.max_students?.toString() ?? '');
  const [locations, setLocations] = React.useState(plan.max_locations?.toString() ?? '');
  const [staff, setStaff] = React.useState(plan.max_staff?.toString() ?? '');
  const num = (v: string) => (v.trim() === '' ? null : /^\d+$/.test(v.trim()) && Number(v) > 0 ? Number(v) : NaN);
  const minor = toMinor(price);
  const vals = [num(students), num(locations), num(staff)];
  const valid = name.trim().length >= 2 && minor != null && vals.every(v => v === null || Number.isFinite(v));
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(P.SET_PLAN_LIMITS, [plan.code, name.trim(), minor, ...vals])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); },
  });
  return (
    <RecordSheet title={`Edit ${plan.name}`} subtitle="Changes apply to every school on this plan straight away."
      onClose={onClose} onSave={() => save.mutate()} saving={save.isPending} error={save.error} canSave={valid}>
      <Field label="Name" htmlFor="pl-n"><Input id="pl-n" value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="Price per month (£)" htmlFor="pl-p" error={minor == null ? 'Enter an amount like 49.00' : undefined}>
        <Input id="pl-p" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} className="tnum" />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Students" htmlFor="pl-s" hint="Blank = no limit"><Input id="pl-s" inputMode="numeric" value={students} onChange={e => setStudents(e.target.value)} /></Field>
        <Field label="Locations" htmlFor="pl-l"><Input id="pl-l" inputMode="numeric" value={locations} onChange={e => setLocations(e.target.value)} /></Field>
        <Field label="Staff" htmlFor="pl-t"><Input id="pl-t" inputMode="numeric" value={staff} onChange={e => setStaff(e.target.value)} /></Field>
      </div>
    </RecordSheet>
  );
}
