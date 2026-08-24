-- ============================================================================
-- 0011 · What a student may read
-- ----------------------------------------------------------------------------
-- 0010 gave the student role a policy on `student` and on the hub tables, but
-- not on the ordinary operational tables their own timetable is built from.
-- The result was a student who could see their feedback and their library and
-- had no classes at all — the query joined enrolment and class_session, and
-- both were closed to them.
--
-- Each policy below is scoped to the signed-in student's own rows. A student
-- gains no view of anybody else: no other child, no family, no billing.
-- ============================================================================

create policy enrolment_student_read on enrolment for select
  using (deleted_at is null and student_id = app.student_self_id());

create policy class_student_read on class for select
  using (deleted_at is null and id in (
    select e.class_id from enrolment e
     where e.student_id = app.student_self_id()
       and e.status = 'active' and e.deleted_at is null));

create policy session_student_read on class_session for select
  using (deleted_at is null and class_id in (
    select e.class_id from enrolment e
     where e.student_id = app.student_self_id()
       and e.status = 'active' and e.deleted_at is null));

create policy attendance_student_read on attendance_record for select
  using (deleted_at is null and student_id = app.student_self_id());

-- Teacher names appear on a student's timetable. Only what is needed to say
-- who is taking the class — the staff table's contact details are not exposed
-- to students by any query, and this policy grants read on the row, so the
-- repositories select display_name and nothing more.
create policy staff_student_read on staff_member for select
  using (deleted_at is null and status = 'active'
         and app.student_self_id() is not null
         and studio_id in (select app.studio_ids()));

-- Studio-wide announcements, and broadcasts to a class they are actually in.
create policy comm_student_read on communication for select
  using (deleted_at is null and app.student_self_id() is not null and (
    kind = 'studio_announcement'
    or (kind = 'class_broadcast' and class_id in (
          select e.class_id from enrolment e
           where e.student_id = app.student_self_id()
             and e.status = 'active' and e.deleted_at is null))));

-- A student may see their own trial and waiting-list entries.
create policy trial_student_read on trial for select
  using (deleted_at is null and student_id = app.student_self_id());
create policy waitlist_student_read on waitlist_entry for select
  using (deleted_at is null and student_id = app.student_self_id());
