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
