-- ============================================================================
-- 0056 · Parents keep their child's everyday details current
-- ----------------------------------------------------------------------------
-- A parent can change the name their child likes to be called, their
-- pronouns and their school directly. These are everyday details the family
-- knows best, and nothing depends on them. The office is told, and the audit
-- trail (0044) records who changed what.
--
-- The legal name, date of birth and medical record stay with the office
-- (billing, exam entries, ages for classes and the safety brief all hang off
-- them). Parents ask for those through a request, which already exists.
-- Consent has its own controls (0047).
-- ============================================================================

create or replace function app.guardian_update_child(
  p_student uuid, p_preferred text, p_pronouns text, p_school text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s record; changed text[] := '{}';
begin
  select id, studio_id, first_name, preferred_name, pronouns, school into s
    from student where id = p_student and deleted_at is null;
  if s.id is null or app.is_support_viewer(s.studio_id)
     or not (p_student in (select app.guardian_student_ids())) then
    raise exception 'FORBIDDEN: you can only update your own children' using errcode = 'insufficient_privilege';
  end if;
  if length(coalesce(p_preferred, '')) > 60 or length(coalesce(p_pronouns, '')) > 40 or length(coalesce(p_school, '')) > 120 then
    raise exception 'INVALID: that is longer than we can keep' using errcode = 'check_violation';
  end if;

  if s.preferred_name is distinct from nullif(btrim(p_preferred), '') then changed := array_append(changed, 'name they go by'); end if;
  if s.pronouns is distinct from nullif(btrim(p_pronouns), '') then changed := array_append(changed, 'pronouns'); end if;
  if s.school is distinct from nullif(btrim(p_school), '') then changed := array_append(changed, 'school'); end if;
  if cardinality(changed) = 0 then return; end if;

  update student set preferred_name = nullif(btrim(p_preferred), ''),
                     pronouns = nullif(btrim(p_pronouns), ''),
                     school = nullif(btrim(p_school), ''),
                     updated_at = now()
   where id = p_student;

  perform app.notify_admins(s.studio_id, 'contact_updated',
    'Details updated for ' || s.first_name,
    'A parent changed: ' || array_to_string(changed, ', ') || '.',
    '/people?tab=students&student=' || s.id);
end $$;

revoke all on function app.guardian_update_child(uuid, text, text, text) from public;
grant execute on function app.guardian_update_child(uuid, text, text, text) to authenticated;
