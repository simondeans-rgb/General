/** Families, students and staff. The Family record is the core CRM record. */

export type FamilyRow = {
  id: string; name: string; balance_minor: string;
  children: number; guardians: number;
  primary_guardian: string | null; primary_email: string | null; primary_phone: string | null;
  failed_payments: number; child_names: string | null;
};

export const FAMILIES = `
select f.id, f.name, f.balance_minor,
       (select count(*)::int from student s where s.family_id = f.id and s.deleted_at is null) as children,
       (select count(*)::int from guardian g where g.family_id = f.id and g.deleted_at is null) as guardians,
       (select g.full_name from guardian g where g.family_id = f.id and g.deleted_at is null
         order by g.is_primary desc limit 1) as primary_guardian,
       (select g.email from guardian g where g.family_id = f.id and g.deleted_at is null
         order by g.is_primary desc limit 1) as primary_email,
       (select g.phone from guardian g where g.family_id = f.id and g.deleted_at is null
         order by g.is_primary desc limit 1) as primary_phone,
       (select count(*)::int from payment p where p.family_id = f.id and p.deleted_at is null
         and p.failure_code is not null and p.succeeded_at is null) as failed_payments,
       (select string_agg(s.first_name, ', ' order by s.date_of_birth)
          from student s where s.family_id = f.id and s.deleted_at is null) as child_names
  from family f
 where f.deleted_at is null
 order by f.name`;

export type StudentRow = {
  id: string; first_name: string; last_name: string; preferred_name: string | null;
  date_of_birth: string; family_id: string; family_name: string;
  classes: number; attendance_pct: number | null; has_alert: boolean;
  photo_consent: boolean | null;
};

export const STUDENTS = `
select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth,
       s.family_id, f.name as family_name,
       (select count(*)::int from enrolment e
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null) as classes,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*), 0))::int
          from attendance_record ar where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       (select cr.granted from consent_record cr
         where cr.student_id = s.id and cr.kind = 'photography' and cr.deleted_at is null) as photo_consent
  from student s
  join family f on f.id = s.family_id
 where s.deleted_at is null
 order by s.last_name, s.first_name`;

export const FAMILY_DETAIL = `
select f.id, f.name, f.address_line1, f.city, f.postcode, f.balance_minor, f.notes
  from family f where f.id = $1 and f.deleted_at is null`;

export const FAMILY_GUARDIANS = `
select g.id, g.full_name, g.email, g.phone, g.relationship, g.is_primary, g.receives_billing,
       g.user_id is not null as has_login
  from guardian g where g.family_id = $1 and g.deleted_at is null
 order by g.is_primary desc, g.full_name`;

export const FAMILY_STUDENTS = `
select s.id, s.first_name, s.last_name, s.date_of_birth, s.joined_on,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       (select string_agg(c.name, ', ' order by c.name) from enrolment e
          join class c on c.id = e.class_id
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null) as class_names
  from student s where s.family_id = $1 and s.deleted_at is null
 order by s.date_of_birth`;

export const FAMILY_INVOICES = `
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor
  from invoice i where i.family_id = $1 and i.deleted_at is null
 order by i.issued_on desc nulls last limit 10`;

export const FAMILY_MESSAGES = `
select cm.id, cm.subject, cm.body, cm.sent_at, cm.kind
  from communication cm where cm.family_id = $1 and cm.deleted_at is null
 order by cm.sent_at desc limit 10`;

/** Safety information a teacher is allowed to see, from the narrow view. */
export const STUDENT_SAFETY = `
select student_id, allergies, action_plan, requires_alert,
       emergency_contact_name, emergency_contact_phone
  from student_safety_brief where student_id = $1`;

export const STAFF = `
select sm.id, sm.display_name, sm.email, sm.phone, sm.status, sm.colour, sm.bio,
       sm.user_id is not null as has_login,
       (select count(*)::int from class c
         where (c.teacher_id = sm.id or c.assistant_id = sm.id) and c.deleted_at is null) as classes,
       (select count(distinct e.student_id)::int from enrolment e
         join class c on c.id = e.class_id
        where (c.teacher_id = sm.id or c.assistant_id = sm.id)
          and e.status = 'active' and e.deleted_at is null) as students
  from staff_member sm
 where sm.deleted_at is null
 order by sm.status, sm.display_name`;

/* ── Writing people ──────────────────────────────────────────────────────
   Admin-only, by policy. medical_record, consent_record and staff_member
   carry an audit trigger, so every change to health data or to who has
   access is recorded with the actor and the time — nothing here has to
   remember to write that trail.
   ------------------------------------------------------------------------ */

export const CREATE_FAMILY = `
insert into family (studio_id, name, address_line1, city, postcode, notes, created_by)
select id, $1, nullif(btrim($2),''), nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), auth.uid()
  from studio where deleted_at is null limit 1
returning id`;

export const UPDATE_FAMILY = `
update family set name = $2, address_line1 = nullif(btrim($3),''),
       city = nullif(btrim($4),''), postcode = nullif(btrim($5),''),
       notes = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`;

export type GuardianRow = {
  id: string; full_name: string; email: string | null; phone: string | null;
  relationship: string | null; is_primary: boolean; receives_billing: boolean;
  has_login: boolean;
};

export const CREATE_GUARDIAN = `
insert into guardian (studio_id, family_id, full_name, email, phone, relationship,
                      is_primary, receives_billing)
select f.studio_id, f.id, $2, nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), $6, $7
  from family f where f.id = $1
returning id`;

export const UPDATE_GUARDIAN = `
update guardian set full_name = $2, email = nullif(btrim($3),''),
       phone = nullif(btrim($4),''), relationship = nullif(btrim($5),''),
       is_primary = $6, receives_billing = $7, updated_at = now()
 where id = $1 returning id`;

export const REMOVE_GUARDIAN = `select app.soft_delete('guardian', $1) as ok`;

export type StudentDetail = {
  id: string; first_name: string; last_name: string; preferred_name: string | null;
  date_of_birth: string; pronouns: string | null; school: string | null;
  joined_on: string; left_on: string | null; notes: string | null;
  family_id: string; family_name: string;
};

export const STUDENT_DETAIL = `
select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, s.pronouns,
       s.school, s.joined_on, s.left_on, s.notes, s.family_id, f.name as family_name
  from student s join family f on f.id = s.family_id
 where s.id = $1 and s.deleted_at is null`;

export const CREATE_STUDENT = `
insert into student (studio_id, family_id, first_name, last_name, preferred_name,
                     date_of_birth, pronouns, school, joined_on, notes, created_by)
select f.studio_id, f.id, $2, $3, nullif(btrim($4),''), $5::date, nullif(btrim($6),''),
       nullif(btrim($7),''), coalesce($8::date, current_date), nullif(btrim($9),''), auth.uid()
  from family f where f.id = $1
returning id`;

export const UPDATE_STUDENT = `
update student set first_name = $2, last_name = $3, preferred_name = nullif(btrim($4),''),
       date_of_birth = $5::date, pronouns = nullif(btrim($6),''),
       school = nullif(btrim($7),''), notes = nullif(btrim($8),''),
       left_on = $9::date, updated_at = now()
 where id = $1 returning id`;

/* ── Health and emergencies ─────────────────────────────────────────────── */

export type Medical = {
  id: string | null; allergies: string | null; conditions: string | null;
  medications: string | null; action_plan: string | null; requires_alert: boolean;
  doctor_name: string | null; doctor_phone: string | null;
  updated_at: string | null; updated_by_name: string | null;
};

export const MEDICAL = `
select m.id, m.allergies, m.conditions, m.medications, m.action_plan, m.requires_alert,
       m.doctor_name, m.doctor_phone, m.updated_at, u.full_name as updated_by_name
  from medical_record m
  left join user_account u on u.id = m.updated_by
 where m.student_id = $1 and m.deleted_at is null`;

/** One row per child, so this is an upsert rather than an insert. */
export const SAVE_MEDICAL = `
insert into medical_record (studio_id, student_id, allergies, conditions, medications,
                            action_plan, requires_alert, doctor_name, doctor_phone, updated_by)
select s.studio_id, s.id, nullif(btrim($2),''), nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), $6, nullif(btrim($7),''), nullif(btrim($8),''), auth.uid()
  from student s where s.id = $1
on conflict (student_id) do update
  set allergies = excluded.allergies, conditions = excluded.conditions,
      medications = excluded.medications, action_plan = excluded.action_plan,
      requires_alert = excluded.requires_alert, doctor_name = excluded.doctor_name,
      doctor_phone = excluded.doctor_phone, updated_by = excluded.updated_by,
      updated_at = now(), deleted_at = null
returning id`;

export type Emergency = {
  id: string; full_name: string; relationship: string | null; phone: string; priority: number;
};

export const EMERGENCY_CONTACTS = `
select id, full_name, relationship, phone, priority
  from emergency_contact
 where student_id = $1 and deleted_at is null
 order by priority, full_name`;

export const CREATE_EMERGENCY = `
insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
select s.studio_id, s.id, $2, nullif(btrim($3),''), $4,
       coalesce((select max(priority) + 1 from emergency_contact
                  where student_id = s.id and deleted_at is null), 1)
  from student s where s.id = $1
returning id`;

export const REMOVE_EMERGENCY = `select app.soft_delete('emergency_contact', $1) as ok`;

/* ── Staff ──────────────────────────────────────────────────────────────── */

export type StaffRow = {
  id: string; display_name: string; email: string | null; colour: string;
  status: string; bio: string | null; classes: number; user_id: string | null;
};

export const STAFF_FULL = `
select sm.id, sm.display_name, sm.email, sm.colour, sm.status::text as status, sm.bio, sm.user_id,
       (select count(*)::int from class c
         where (c.teacher_id = sm.id or c.assistant_id = sm.id) and c.deleted_at is null) as classes
  from staff_member sm where sm.deleted_at is null
 order by sm.status, sm.display_name`;

export const CREATE_STAFF = `
insert into staff_member (studio_id, display_name, email, colour, status, bio)
select id, $1, nullif(btrim($2),''), $3, $4::staff_status, nullif(btrim($5),'')
  from studio where deleted_at is null limit 1
returning id`;

export const UPDATE_STAFF = `
update staff_member set display_name = $2, email = nullif(btrim($3),''), colour = $4,
       status = $5::staff_status, bio = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`;

export const REMOVE_STAFF = `select app.soft_delete('staff_member', $1) as ok`;
