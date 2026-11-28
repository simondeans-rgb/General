'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { RecordSheet } from '@/components/app/record-sheet';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, ErrorState, Field, Input, Skeleton } from '@/components/ui';
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
      <div className="mx-auto max-w-[1240px]"><div className="max-w-4xl space-y-6">
        {plans.isLoading && <Skeleton className="h-40" />}
        {plans.error && <ErrorState error={plans.error} />}
        {plans.data && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[0.9062rem]">
              <caption className="sr-only">Plans</caption>
              <thead className="border-b-2 border-ink text-left">
                <tr>
                  <th scope="col" className="label py-2.5 pr-3 font-semibold">Plan</th>
                  <th scope="col" className="label px-3 py-2.5 text-right font-semibold">Price</th>
                  <th scope="col" className="label px-3 py-2.5 text-right font-semibold">Students</th>
                  <th scope="col" className="label px-3 py-2.5 text-right font-semibold">Locations</th>
                  <th scope="col" className="label px-3 py-2.5 text-right font-semibold">Staff</th>
                  <th scope="col" className="label px-3 py-2.5 text-right font-semibold">Schools</th>
                  {amSuper && <th scope="col" className="w-12"><span className="sr-only">Edit</span></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {plans.data.map(p => {
                  const on = schools.data?.filter(s => s.plan_code === p.code && s.status !== 'cancelled').length ?? 0;
                  return (
                    <tr key={p.id}>
                      <th scope="row" className="py-3 pr-3 text-left font-semibold">{p.name}
                        {/* The trial's own name usually says it already; only say so when it doesn't. */}
                        {p.is_trial && !/trial/i.test(p.name) && <span className="ml-2 text-[0.8125rem] font-medium text-info">Free trial</span>}
                        <span className="block text-[0.8125rem] font-normal text-ink-3">{p.is_trial ? 'New schools start here' : 'Chosen by the owner, or set here'}</span></th>
                      <td className="px-3 py-3 text-right">
                        {p.is_trial
                          ? <><span className="stat-number text-[1.25rem]">Free</span><span className="block text-[0.8125rem] text-ink-3">30 days</span></>
                          : <><span className="stat-number text-[1.25rem]">{money(p.price_minor)}</span><span className="block text-[0.8125rem] text-ink-3">a month</span></>}
                      </td>
                      <td className="tnum px-3 py-3 text-right">{limit(p.max_students)}</td>
                      <td className="tnum px-3 py-3 text-right">{limit(p.max_locations)}</td>
                      <td className="tnum px-3 py-3 text-right">{limit(p.max_staff)}</td>
                      <td className="tnum px-3 py-3 text-right text-ink-2">{on}</td>
                      {amSuper && <td className="py-2 pl-2 text-right">
                        <Button size="sm" variant="ghost" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}>
                          <Pencil className="size-4" aria-hidden />
                        </Button></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="max-w-2xl text-[0.8125rem] text-ink-3">
          Taking payment from schools (Stripe Billing) is not connected yet: plans set limits and the console’s revenue
          figure, and you invoice schools yourself for now. Owners can move their own school to a paid plan that fits it,
          from Settings › Plan; every change is in the school’s history. Moving a school to a smaller plan never deletes
          anything — it only stops new additions past the limit. Children who have left do not count towards the student limit.
          A trial school started from the console lasts as long as you choose; one started online lasts 30 days.
        </p>
        <Signups canChange={!!amSuper} />
      </div></div>
      {editing && <PlanSheet plan={editing} onClose={() => setEditing(null)} />}
    </Shell>
  );
}

/** Whether schools can start themselves at /start (F11). */
function Signups({ canChange }: { canChange: boolean }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const open = useRows<{ open: boolean }>(['signups-open'], `select app.signups_open() as open`).data?.[0]?.open;
  const set = useMutation({
    mutationFn: (v: boolean) => runAs(session, q => q(`select app.platform_set_signups($1)`, [v])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  if (open == null) return null;
  return (
    <section aria-labelledby="pl-signup" className="max-w-2xl">
      <h2 id="pl-signup" className="border-b-2 border-ink pb-2 section-title">Schools starting online</h2>
      <div className="flex flex-wrap items-center gap-3 pt-3">
        <p className="min-w-0 flex-1 text-[0.9062rem] text-ink-2">
          {open
            ? 'Open: anyone can start a school on the free trial from the Start your school page. Each one appears in Schools, and its history says it was started online.'
            : 'Closed: the Start your school page asks people to contact Swayvo instead.'}
        </p>
        {canChange && <Button size="sm" loading={set.isPending} onClick={() => set.mutate(!open)}>{open ? 'Close signups' : 'Open signups'}</Button>}
      </div>
      {set.error != null && <ErrorState error={set.error} />}
    </section>
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
