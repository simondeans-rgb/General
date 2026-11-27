'use client';
import { StaffChecks, RaiseConcernSheet } from '@/components/app/safeguarding';
import { InitialConsents } from '@/components/app/consents';
import { SET_CONSENT, type ConsentKind } from '@/lib/repos/consent';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Plus, ShieldAlert } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, Field, Input, Select, Skeleton } from '@/components/ui';
import * as P from '@/lib/repos/people';
import { LOG_MEDICAL_VIEW } from '@/lib/repos/office';
import { ageFrom, dateShort, toDateInput } from '@/lib/format';

const COLOURS = ['violet', 'amber', 'teal', 'rose', 'indigo', 'lime'];

function useWrite(sql: string, onDone?: () => void) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: unknown[]) => runAs(session, q => q(sql, params)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onDone?.(); },
  });
}

const textarea =
  'w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm ' +
  'focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12';

/* ── Family ─────────────────────────────────────────────────────────────── */
export function FamilySheet({ row, onClose }: {
  row: { id: string; name: string; address_line1?: string | null; city?: string | null;
         postcode?: string | null; notes?: string | null } | null;
  onClose: () => void;
}) {
  const [name, setName] = React.useState(row?.name ?? '');
  const [line1, setLine1] = React.useState(row?.address_line1 ?? '');
  const [city, setCity] = React.useState(row?.city ?? '');
  const [postcode, setPostcode] = React.useState(row?.postcode ?? '');
  const [notes, setNotes] = React.useState(row?.notes ?? '');
  const save = useWrite(row ? P.UPDATE_FAMILY : P.CREATE_FAMILY, onClose);

  return (
    <RecordSheet title={row ? 'Edit family' : 'New family'} onClose={onClose}
      subtitle={row ? undefined : 'A family holds the children, the guardians and the bill.'}
      error={save.error} saving={save.isPending} canSave={name.trim().length >= 2}
      onSave={() => save.mutate(row
        ? [row.id, name.trim(), line1, city, postcode, notes]
        : [name.trim(), line1, city, postcode, notes])}>
      <Field label="Family name" htmlFor="fam-name" required
             hint="How you refer to them — usually the surname.">
        <Input id="fam-name" value={name} onChange={e => setName(e.target.value)}
               placeholder="The Wright family" />
      </Field>
      <Field label="Address" htmlFor="fam-line1">
        <Input id="fam-line1" value={line1} onChange={e => setLine1(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Town or city" htmlFor="fam-city">
          <Input id="fam-city" value={city} onChange={e => setCity(e.target.value)} />
        </Field>
        <Field label="Postcode" htmlFor="fam-postcode">
          <Input id="fam-postcode" value={postcode} onChange={e => setPostcode(e.target.value)} />
        </Field>
      </div>
      <Field label="Notes" htmlFor="fam-notes" hint="Office notes. Families never see these.">
        <textarea id="fam-notes" rows={2} value={notes}
                  onChange={e => setNotes(e.target.value)} className={textarea} />
      </Field>
    </RecordSheet>
  );
}

/* ── Guardian ───────────────────────────────────────────────────────────── */
export function GuardianSheet({ familyId, row, onClose }: {
  familyId: string;
  row: (P.GuardianRow & { id: string }) | null;
  onClose: () => void;
}) {
  const [name, setName] = React.useState(row?.full_name ?? '');
  const [email, setEmail] = React.useState(row?.email ?? '');
  const [phone, setPhone] = React.useState(row?.phone ?? '');
  const [rel, setRel] = React.useState(row?.relationship ?? '');
  const [primary, setPrimary] = React.useState(row?.is_primary ?? false);
  const [billing, setBilling] = React.useState(row?.receives_billing ?? true);
  const save = useWrite(row ? P.UPDATE_GUARDIAN : P.CREATE_GUARDIAN, onClose);
  const remove = useWrite(P.REMOVE_GUARDIAN, onClose);

  return (
    <RecordSheet title={row ? 'Edit guardian' : 'Add a guardian'} onClose={onClose}
      error={save.error ?? remove.error} saving={save.isPending}
      canSave={name.trim().length >= 2}
      onSave={() => save.mutate(row
        ? [row.id, name.trim(), email, phone, rel, primary, billing]
        : [familyId, name.trim(), email, phone, rel, primary, billing])}
      onRemove={row ? () => remove.mutate([row.id]) : undefined}
      removing={remove.isPending}
      removeHint={row?.has_login
        ? 'This guardian has a login. Removing them here would leave that account without a family, so take the login away first.'
        : null}>
      <Field label="Full name" htmlFor="g-name" required>
        <Input id="g-name" value={name} onChange={e => setName(e.target.value)} />
      </Field>
      <Field label="Relationship" htmlFor="g-rel" hint="Mother, father, grandparent, carer…">
        <Input id="g-rel" value={rel} onChange={e => setRel(e.target.value)} />
      </Field>
      <Field label="Email" htmlFor="g-email">
        <Input id="g-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </Field>
      <Field label="Phone" htmlFor="g-phone">
        <Input id="g-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
      </Field>
      <fieldset>
        <legend className="mb-1 text-[13px] font-medium text-ink-2">Their role</legend>
        <label className="flex min-h-[44px] items-center gap-3 text-[14px]">
          <input type="checkbox" checked={primary} className="size-[18px] accent-[var(--color-accent)]"
                 onChange={e => setPrimary(e.target.checked)} />
          Main contact for the family
        </label>
        <label className="flex min-h-[44px] items-center gap-3 text-[14px]">
          <input type="checkbox" checked={billing} className="size-[18px] accent-[var(--color-accent)]"
                 onChange={e => setBilling(e.target.checked)} />
          Receives invoices
        </label>
      </fieldset>
    </RecordSheet>
  );
}

/* ── Child ──────────────────────────────────────────────────────────────── */
export function StudentSheet({ familyId, familyName, row, onClose }: {
  familyId?: string; familyName?: string;
  row: P.StudentDetail | null; onClose: () => void;
}) {
  const families = useRows<{ id: string; name: string }>(['family-picker'],
    `select id, name from family where deleted_at is null order by name`,
    [], { enabled: !familyId && !row });

  const [family, setFamily] = React.useState(row?.family_id ?? familyId ?? '');
  const [first, setFirst] = React.useState(row?.first_name ?? '');
  const [last, setLast] = React.useState(row?.last_name ?? '');
  const [preferred, setPreferred] = React.useState(row?.preferred_name ?? '');
  const [dob, setDob] = React.useState(toDateInput(row?.date_of_birth));
  const [pronouns, setPronouns] = React.useState(row?.pronouns ?? '');
  const [school, setSchool] = React.useState(row?.school ?? '');
  const [notes, setNotes] = React.useState(row?.notes ?? '');
  const [left, setLeft] = React.useState(toDateInput(row?.left_on));
  const save = useWrite(row ? P.UPDATE_STUDENT : P.CREATE_STUDENT, onClose);
  // A new child starts with the consent the family gave on joining (UR-08).
  const [consent, setConsent] = React.useState<Partial<Record<ConsentKind, boolean>>>({});
  const { session } = useSession();
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: (params: unknown[]) => runAs(session, async q => {
      const [r] = await q<{ id: string }>(P.CREATE_STUDENT, params);
      for (const [k, v] of Object.entries(consent)) await q(SET_CONSENT, [r!.id, k, v, 'Recorded when the child was added', false]);
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); },
  });
  const saving = row ? save : create;

  React.useEffect(() => {
    if (!family && families.data?.[0]) setFamily(families.data[0].id);
  }, [families.data, family]);

  const age = dob ? ageFrom(dob) : null;
  const dobSane = !!dob && age != null && age >= 1 && age <= 100;

  return (
    <RecordSheet title={row ? 'Edit child' : 'Add a child'} onClose={onClose}
      subtitle={familyName ? `In ${familyName}` : undefined}
      error={saving.error} saving={saving.isPending}
      canSave={first.trim().length >= 1 && last.trim().length >= 1 && dobSane && !!family}
      saveHint={!first.trim() || !last.trim() ? 'Add a first and last name.'
        : !dobSane ? 'Add a date of birth that looks right.' : !family ? 'Choose a family.' : null}
      onSave={() => saving.mutate(row
        ? [row.id, first.trim(), last.trim(), preferred, dob, pronouns, school, notes, left || null]
        : [family, first.trim(), last.trim(), preferred, dob, pronouns, school, null, notes])}>
      {!familyId && !row && (
        <Field label="Family" htmlFor="s-family" required>
          <Select id="s-family" value={family} onChange={e => setFamily(e.target.value)}>
            {families.data?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </Select>
        </Field>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" htmlFor="s-first" required>
          <Input id="s-first" value={first} onChange={e => setFirst(e.target.value)} />
        </Field>
        <Field label="Last name" htmlFor="s-last" required>
          <Input id="s-last" value={last} onChange={e => setLast(e.target.value)} />
        </Field>
      </div>
      <Field label="Known as" htmlFor="s-preferred"
             hint="Optional. What they are actually called in class.">
        <Input id="s-preferred" value={preferred} onChange={e => setPreferred(e.target.value)} />
      </Field>
      <Field label="Date of birth" htmlFor="s-dob" required
             hint={age != null && dobSane ? `${age} years old` : 'Decides which classes suit them.'}
             error={dob && !dobSane ? 'That date does not look right.' : undefined}>
        <Input id="s-dob" type="date" value={dob} onChange={e => setDob(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Pronouns" htmlFor="s-pronouns">
          <Input id="s-pronouns" value={pronouns} onChange={e => setPronouns(e.target.value)}
                 placeholder="she/her" />
        </Field>
        <Field label="School" htmlFor="s-school">
          <Input id="s-school" value={school} onChange={e => setSchool(e.target.value)} />
        </Field>
      </div>
      <Field label="Notes" htmlFor="s-notes" hint="Office notes. Not shown to the family.">
        <textarea id="s-notes" rows={2} value={notes}
                  onChange={e => setNotes(e.target.value)} className={textarea} />
      </Field>
      {!row && <InitialConsents value={consent} onChange={setConsent} />}
      {row && (
        <Field label="Left the studio on" htmlFor="s-left"
               hint="Leave empty while they are still dancing.">
          <Input id="s-left" type="date" value={left} onChange={e => setLeft(e.target.value)} />
        </Field>
      )}
    </RecordSheet>
  );
}

/* ── Health ─────────────────────────────────────────────────────────────── */
/**
 * Medical details are special-category data under UK GDPR, held in their own
 * table so a teacher can be given the register without them. Every change is
 * recorded by a trigger on the table — the actor, the time, and what changed —
 * so this form does not have to remember to write a trail, and cannot forget.
 */
export function MedicalSheet({ studentId, studentName, onClose }: {
  studentId: string; studentName: string; onClose: () => void;
}) {
  const current = useRows<P.Medical>(['medical', studentId], P.MEDICAL, [studentId]);
  const contacts = useRows<P.Emergency>(['emergency', studentId], P.EMERGENCY_CONTACTS, [studentId]);
  const m = current.data?.[0];

  // Opening the full record is logged for the owner to see (UR-35). Silent:
  // the database writes at most one entry an hour, and a refusal (a read-only
  // support view, say) must not get in the way of reading.
  const { session } = useSession();
  React.useEffect(() => {
    if (session?.role !== 'owner' && session?.role !== 'admin') return;
    runAs(session, q => q(LOG_MEDICAL_VIEW, [studentId])).catch(() => undefined);
  }, [session, studentId]);

  const [loaded, setLoaded] = React.useState(false);
  const [allergies, setAllergies] = React.useState('');
  const [conditions, setConditions] = React.useState('');
  const [medications, setMedications] = React.useState('');
  const [plan, setPlan] = React.useState('');
  const [alert, setAlert] = React.useState(false);
  const [doctor, setDoctor] = React.useState('');
  const [doctorPhone, setDoctorPhone] = React.useState('');

  React.useEffect(() => {
    if (loaded || current.isPending) return;
    setAllergies(m?.allergies ?? ''); setConditions(m?.conditions ?? '');
    setMedications(m?.medications ?? ''); setPlan(m?.action_plan ?? '');
    setAlert(m?.requires_alert ?? false); setDoctor(m?.doctor_name ?? '');
    setDoctorPhone(m?.doctor_phone ?? ''); setLoaded(true);
  }, [m, current.isPending, loaded]);

  const save = useWrite(P.SAVE_MEDICAL, onClose);


  return (
    <RecordSheet title="Medical details" subtitle={studentName} onClose={onClose}
      error={save.error} saving={save.isPending} canSave={loaded}
      onSave={() => save.mutate([studentId, allergies, conditions, medications, plan,
                                 alert, doctor, doctorPhone])}>
      {!loaded && <Skeleton className="h-24" />}
      {loaded && (
        <>
          <p className="flex gap-2 border-l-2 border-line-strong pl-3 text-[13px] text-ink-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
            <span>
              Health data. Teachers of this child’s classes see the allergies,
              conditions, medication and emergency plan, with a marker beside the
              child’s name. GP details stay with the office. Every change here is
              recorded against your name.
            </span>
          </p>

          <label className="flex min-h-[44px] items-start gap-3 text-[14px]">
            <input type="checkbox" checked={alert} className="mt-0.5 size-[18px] accent-[var(--color-accent)]"
                   onChange={e => setAlert(e.target.checked)} />
            <span>
              <span className="font-semibold">Urgent — show a red alert</span>
              <span className="mt-0.5 block text-[13px] text-ink-3">
                For anything a teacher must act on quickly. Without it, teachers still see an amber
                marker and every detail below.
              </span>
            </span>
          </label>

          <Field label="Allergies" htmlFor="med-allergies">
            <textarea id="med-allergies" rows={2} value={allergies}
                      onChange={e => setAllergies(e.target.value)} className={textarea}
                      placeholder="Severe nut allergy — carries an EpiPen" />
          </Field>
          <Field label="What to do in an emergency" htmlFor="med-plan">
            <textarea id="med-plan" rows={3} value={plan}
                      onChange={e => setPlan(e.target.value)} className={textarea}
                      placeholder="EpiPen is in the front pocket of her bag. Use it, then call 999." />
          </Field>
          <Field label="Conditions" htmlFor="med-conditions">
            <textarea id="med-conditions" rows={2} value={conditions}
                      onChange={e => setConditions(e.target.value)} className={textarea} />
          </Field>
          <Field label="Medications" htmlFor="med-medications">
            <textarea id="med-medications" rows={2} value={medications}
                      onChange={e => setMedications(e.target.value)} className={textarea} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="GP (office only)" htmlFor="med-doctor">
              <Input id="med-doctor" value={doctor} onChange={e => setDoctor(e.target.value)} />
            </Field>
            <Field label="GP phone" htmlFor="med-doctor-phone">
              <Input id="med-doctor-phone" type="tel" value={doctorPhone}
                     onChange={e => setDoctorPhone(e.target.value)} />
            </Field>
          </div>

          {m?.updated_at && (
            <p className="text-[12.5px] text-ink-3">
              Last changed {dateShort(m.updated_at)}
              {m.updated_by_name ? ` by ${m.updated_by_name}` : ''}.
            </p>
          )}

          <EmergencyContacts studentId={studentId} rows={contacts.data ?? []} />
        </>
      )}
    </RecordSheet>
  );
}

function EmergencyContacts({ studentId, rows }: { studentId: string; rows: P.Emergency[] }) {
  const [adding, setAdding] = React.useState(false);
  const [name, setName] = React.useState('');
  const [rel, setRel] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const add = useWrite(P.CREATE_EMERGENCY, () => {
    setName(''); setRel(''); setPhone(''); setAdding(false);
  });
  const remove = useWrite(P.REMOVE_EMERGENCY);

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-ink pb-1">
        <p className="flex-1 text-[14px] font-semibold">Emergency contacts</p>
        {!adding && <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
          <Plus className="size-4" aria-hidden /> Add
        </Button>}
      </div>

      {rows.length === 0 && !adding && (
        <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-caution">
          <AlertTriangle className="size-3.5" aria-hidden />
          None recorded. A teacher has nobody to ring.
        </p>
      )}

      {rows.length > 0 && (
        <ul className="mt-2 divide-y divide-line">
          {rows.map(c => (
            <li key={c.id} className="flex items-center gap-2 py-2">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{c.full_name}</span>
                <span className="block text-[12.5px] text-ink-2">
                  {[c.relationship, c.phone].filter(Boolean).join(' · ')}
                </span>
              </span>
              <Button size="sm" variant="ghost" aria-label={`Remove ${c.full_name}`}
                      onClick={() => remove.mutate([c.id])}>Remove</Button>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div className="mt-2 space-y-2">
          <Input value={name} onChange={e => setName(e.target.value)}
                 aria-label="Contact name" placeholder="Name" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={rel} onChange={e => setRel(e.target.value)}
                   aria-label="Relationship" placeholder="Relationship" />
            <Input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
                   aria-label="Phone number" placeholder="Phone" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="flex-1" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" className="flex-1" loading={add.isPending}
                    disabled={name.trim().length < 2 || phone.trim().length < 5}
                    onClick={() => add.mutate([studentId, name.trim(), rel, phone.trim()])}>
              Add contact
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Staff ──────────────────────────────────────────────────────────────── */
export function StaffSheet({ row, onClose }: { row: P.StaffRow | null; onClose: () => void }) {
  const [name, setName] = React.useState(row?.display_name ?? '');
  const [email, setEmail] = React.useState(row?.email ?? '');
  const [colour, setColour] = React.useState(row?.colour ?? 'violet');
  const [status, setStatus] = React.useState(row?.status ?? 'active');
  const [bio, setBio] = React.useState(row?.bio ?? '');
  const save = useWrite(row ? P.UPDATE_STAFF : P.CREATE_STAFF, onClose);
  const remove = useWrite(P.REMOVE_STAFF, onClose);
  const role = useSession().session?.role;
  const isOwner = role === 'owner';
  const [concern, setConcern] = React.useState(false);

  return (
    <RecordSheet title={row ? 'Edit teacher' : 'Add a teacher'} onClose={onClose}
      error={save.error ?? remove.error} saving={save.isPending}
      canSave={name.trim().length >= 2}
      onSave={() => save.mutate(row
        ? [row.id, name.trim(), email, colour, status, bio]
        : [name.trim(), email, colour, status, bio])}
      onRemove={row ? () => remove.mutate([row.id]) : undefined}
      removing={remove.isPending}
      removeHint={row && row.classes > 0
        ? `They teach ${row.classes} class${row.classes === 1 ? '' : 'es'}. Set them to inactive instead — removing them would leave those classes without a teacher.`
        : null}>
      <Field label="Name" htmlFor="staff-name" required
             hint="As it appears on the timetable and to families.">
        <Input id="staff-name" value={name} onChange={e => setName(e.target.value)} />
      </Field>
      <Field label="Email" htmlFor="staff-email">
        <Input id="staff-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Colour" htmlFor="staff-colour" hint="Their band on the schedule.">
          <Select id="staff-colour" value={colour} onChange={e => setColour(e.target.value)}>
            {COLOURS.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Status" htmlFor="staff-status">
          <Select id="staff-status" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
      </div>
      <Field label="About" htmlFor="staff-bio" hint="Shown to families on the class page.">
        <textarea id="staff-bio" rows={2} value={bio}
                  onChange={e => setBio(e.target.value)} className={textarea} />
      </Field>

      {/* Adding someone to the timetable and giving them a login are different
          decisions, and the database treats them differently: staff_member is
          admin-writable, membership is owner-only. */}
      <p className="border-l-2 border-line-strong pl-3 text-[13px] text-ink-2">
        {row?.user_id
          ? 'This teacher has a login and can take their own registers.'
          : 'They will appear on the timetable straight away. Giving them a login to take registers is a separate step, and only the owner can do it.'}
      </p>
      {row && (isOwner || role === 'admin') && (
        <div className="pt-2">
          <p className="mb-2 border-b border-ink pb-1 text-[14px] font-semibold">Checks and training</p>
          <StaffChecks staffId={row.id} readOnly={!isOwner} />
        </div>
      )}
      {row && (
        <div className="pt-2">
          <Button size="sm" variant="ghost" onClick={() => setConcern(true)}>
            <ShieldAlert className="size-4" aria-hidden /> Raise a concern about {row.display_name}
          </Button>
          <p className="mt-1 text-[12.5px] text-ink-3">Goes to the safeguarding lead and the owner, never to them.</p>
        </div>
      )}
      {concern && row && <RaiseConcernSheet staff={{ id: row.id, name: row.display_name }} onClose={() => setConcern(false)} />}
    </RecordSheet>
  );
}
