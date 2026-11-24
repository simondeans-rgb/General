-- ============================================================================
-- 0020 · What a teacher knows about a child's health
-- ----------------------------------------------------------------------------
-- Decision (studio owner, Nov 2026): a teacher in the room needs the whole of
-- a child's recorded medical need — allergies, conditions, medications and
-- the emergency plan — not only the allergy line, and needs to see at a
-- glance which children have one. The family doctor stays with the office.
--
-- Still true:
--   * teachers cannot read medical_record; this view is their only route
--   * only for children in classes they teach (or trial in, or take to an
--     event); a student sees their own, a guardian their children's
--   * Sanaa support never sees any of it, grant or no grant
--
-- Changes:
--   * conditions and medications are now in the brief
--   * has_medical_need: anything recorded at all, so a teacher sees a marker
--     for every child with a need; requires_alert stays the "urgent" flag
--   * every emergency contact, in order, with relationship
--   * photo consent, so a teacher knows whom not to photograph
-- ============================================================================

create or replace view student_safety_brief
  with (security_invoker = false) as
select s.id as student_id,
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
         order by ec.priority limit 1) as emergency_contact_phone,
       m.conditions,
       m.medications,
       coalesce(m.requires_alert, false)
         or coalesce(nullif(btrim(m.allergies), ''), nullif(btrim(m.conditions), ''),
                     nullif(btrim(m.medications), ''), nullif(btrim(m.action_plan), '')) is not null
         as has_medical_need,
       coalesce((select jsonb_agg(jsonb_build_object(
                   'name', ec.full_name, 'relationship', ec.relationship, 'phone', ec.phone)
                   order by ec.priority, ec.created_at)
                  from emergency_contact ec where ec.student_id = s.id and ec.deleted_at is null),
                '[]'::jsonb) as emergency_contacts,
       (select c.granted from consent_record c
         where c.student_id = s.id and c.kind = 'photography' and c.deleted_at is null
           and (c.expires_at is null or c.expires_at > now())
         order by c.granted_at desc limit 1) as photo_consent
  from student s
  left join medical_record m on m.student_id = s.id and m.deleted_at is null
 where s.deleted_at is null
   and not app.is_support_viewer(s.studio_id)
   and (app.is_admin(s.studio_id)
        or (app.has_role(s.studio_id, 'teacher')
            and (s.id in (select app.teacher_student_ids())
                 or s.id in (select app.teacher_event_student_ids())))
        or s.id in (select app.guardian_student_ids())
        or s.id = app.student_self_id());

grant select on student_safety_brief to authenticated, service_role;
