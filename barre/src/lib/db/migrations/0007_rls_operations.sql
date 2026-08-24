-- ============================================================================
-- 0007 · RLS for scheduling, enrolment, attendance, billing, comms
-- ============================================================================

-- NOTE ON `for all` WRITE POLICIES
-- Permissive policies are OR-ed, and `for all` covers SELECT too. A write
-- policy whose USING clause omitted `deleted_at is null` therefore re-exposed
-- soft-deleted rows through the back door, regardless of what the read policy
-- said. USING is evaluated against the OLD row, so adding the condition here
-- closes that hole while still allowing a row to be soft-deleted.
-- (A RESTRICTIVE select policy looks tidier but cannot be used: Postgres
-- applies it to the NEW row on UPDATE, which makes soft deletion impossible.)

-- ── Classes and sessions ───────────────────────────────────────────────────
-- Guardians see a class if their child is in it, trialling it, waitlisted for
-- it, or if it is publicly listed (so they can browse and book a trial).
create policy class_read on class for select
  using (deleted_at is null and studio_id in (select app.studio_ids()) and (
    app.is_staff(studio_id)
    or visibility = 'public'
    or exists (select 1 from enrolment e
                where e.class_id = class.id and e.deleted_at is null
                  and e.student_id in (select app.guardian_student_ids()))));
create policy class_write on class for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));

create policy session_read on class_session for select
  using (deleted_at is null and studio_id in (select app.studio_ids()) and (
    app.is_admin(studio_id)
    or class_id in (select app.teacher_class_ids())
    or exists (select 1 from enrolment e
                where e.class_id = class_session.class_id and e.deleted_at is null
                  and e.student_id in (select app.guardian_student_ids()))
    or exists (select 1 from trial t
                where t.session_id = class_session.id and t.deleted_at is null
                  and t.student_id in (select app.guardian_student_ids()))));
create policy session_admin_write on class_session for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
-- A teacher may annotate or close their own session, not create or delete one.
create policy session_teacher_update on class_session for update
  using (class_id in (select app.teacher_class_ids()))
  with check (class_id in (select app.teacher_class_ids()));

-- ── Enrolment, trials, waitlists, enquiries ────────────────────────────────
create policy enrolment_read on enrolment for select
  using (deleted_at is null and studio_id in (select app.studio_ids()) and (
    app.is_admin(studio_id)
    or class_id in (select app.teacher_class_ids())
    or student_id in (select app.guardian_student_ids())));
create policy enrolment_write on enrolment for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));

create policy trial_read on trial for select
  using (deleted_at is null and studio_id in (select app.studio_ids()) and (
    app.is_admin(studio_id)
    or class_id in (select app.teacher_class_ids())
    or student_id in (select app.guardian_student_ids())));
create policy trial_admin_write on trial for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
-- A guardian may request a trial for their own child.
create policy trial_guardian_insert on trial for insert
  with check (student_id in (select app.guardian_student_ids())
              and status in ('requested', 'booked'));

create policy waitlist_read on waitlist_entry for select
  using (deleted_at is null and studio_id in (select app.studio_ids()) and (
    app.is_admin(studio_id)
    or class_id in (select app.teacher_class_ids())
    or student_id in (select app.guardian_student_ids())));
create policy waitlist_admin_write on waitlist_entry for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy waitlist_guardian_insert on waitlist_entry for insert
  with check (student_id in (select app.guardian_student_ids()) and status = 'waiting');

create policy enquiry_rw on enquiry for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));

-- ── Attendance ─────────────────────────────────────────────────────────────
-- Teachers write registers for their own classes. Guardians may read their own
-- child's attendance but never write it — reporting an absence in advance goes
-- through a request, not a direct register edit.
create policy attendance_read on attendance_record for select
  using (deleted_at is null and studio_id in (select app.studio_ids()) and (
    app.is_admin(studio_id)
    or exists (select 1 from class_session cs
                where cs.id = attendance_record.session_id
                  and cs.class_id in (select app.teacher_class_ids()))
    or student_id in (select app.guardian_student_ids())));
create policy attendance_admin_write on attendance_record for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy attendance_teacher_write on attendance_record for all
  using (deleted_at is null and exists (select 1 from class_session cs
                  where cs.id = attendance_record.session_id
                    and cs.class_id in (select app.teacher_class_ids())))
  with check (exists (select 1 from class_session cs
                       where cs.id = attendance_record.session_id
                         and cs.class_id in (select app.teacher_class_ids())));

-- ── Billing. Guardians read their own; only admins write. ──────────────────
create policy invoice_read on invoice for select
  using (deleted_at is null and studio_id in (select app.studio_ids()) and (
    app.is_admin(studio_id) or family_id in (select app.guardian_family_ids())));
create policy invoice_write on invoice for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));

create policy invoice_item_read on invoice_item for select
  using (deleted_at is null and (
    app.is_admin(studio_id)
    or exists (select 1 from invoice i where i.id = invoice_item.invoice_id
                and i.family_id in (select app.guardian_family_ids()))));
create policy invoice_item_write on invoice_item for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));

create policy payment_read on payment for select
  using (deleted_at is null and studio_id in (select app.studio_ids()) and (
    app.is_admin(studio_id) or family_id in (select app.guardian_family_ids())));
create policy payment_write on payment for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));

-- ── Communications and notifications ───────────────────────────────────────
create policy comm_read on communication for select
  using (deleted_at is null and studio_id in (select app.studio_ids()) and (
    app.is_staff(studio_id)
    or kind = 'studio_announcement'
    or family_id in (select app.guardian_family_ids())
    or (kind = 'class_broadcast' and exists (
          select 1 from enrolment e where e.class_id = communication.class_id
            and e.deleted_at is null
            and e.student_id in (select app.guardian_student_ids())))));
create policy comm_staff_write on communication for all
  using (deleted_at is null and app.is_staff(studio_id)) with check (app.is_staff(studio_id));
create policy comm_guardian_insert on communication for insert
  with check (kind = 'direct' and family_id in (select app.guardian_family_ids()));

create policy comm_read_marker on communication_read for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy notification_own on notification for select
  using (deleted_at is null and user_id = auth.uid());
create policy notification_own_update on notification for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── Audit log: readable by owners, insertable by anyone acting, never
--    updatable or deletable by any role. ─────────────────────────────────────
create policy audit_read on audit_log for select
  using (studio_id is not null and app.has_role(studio_id, 'owner'));
create policy audit_insert on audit_log for insert
  with check (studio_id in (select app.studio_ids()));

-- ---------------------------------------------------------------------------
-- The teacher's safety brief.
-- A SECURITY DEFINER view: teachers cannot read medical_record directly, but
-- may see the few fields needed to keep a child safe in the room, and only for
-- children in their own classes. Diagnoses, medication lists and doctor
-- details are not exposed here — data minimisation in practice, not in prose.
-- ---------------------------------------------------------------------------
create view student_safety_brief
  with (security_invoker = false) as
select s.id            as student_id,
       s.studio_id,
       s.first_name,
       s.last_name,
       m.allergies,
       m.action_plan,
       m.requires_alert,
       (select ec.full_name from emergency_contact ec
         where ec.student_id = s.id and ec.deleted_at is null
         order by ec.priority limit 1) as emergency_contact_name,
       (select ec.phone from emergency_contact ec
         where ec.student_id = s.id and ec.deleted_at is null
         order by ec.priority limit 1) as emergency_contact_phone
  from student s
  left join medical_record m on m.student_id = s.id and m.deleted_at is null
 where s.deleted_at is null
   and (app.is_admin(s.studio_id)
        or (app.has_role(s.studio_id, 'teacher') and s.id in (select app.teacher_student_ids()))
        or s.id in (select app.guardian_student_ids()));

grant select on student_safety_brief to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke insert, update, delete on audit_log from authenticated;
grant insert on audit_log to authenticated;

-- The trusted role used by migrations, seeds and future server-side jobs.
-- BYPASSRLS removes the policies but not the grants, so it needs both.
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant select on student_safety_brief to service_role;
