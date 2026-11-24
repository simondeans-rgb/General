-- ============================================================================
-- 0021 · Acting on a parent's medical update in one step
-- ----------------------------------------------------------------------------
-- A parent tells the studio something about their child's health. The office
-- either acknowledges it, or acknowledges it AND puts it on the child's
-- record. Doing the second as two separate actions invites the failure that
-- matters: the parent is told "done" and the record never changes, or the
-- record changes and the parent is never told. So it is one function, one
-- transaction.
--
-- Only the office may do it. Teachers can read requests (0010) but health
-- records are not theirs to write.
-- ============================================================================

create or replace function app.acknowledge_medical_update(
  p_request uuid, p_record jsonb default null, p_message text default null, p_student uuid default null)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  r studio_request; kid uuid; child text; msg text;
begin
  select * into r from studio_request where id = p_request and deleted_at is null;
  if r.id is null then raise exception 'NOT_FOUND: request' using errcode = 'no_data_found'; end if;
  if not app.is_admin(r.studio_id) then
    raise exception 'FORBIDDEN: only the studio office can act on medical updates' using errcode = 'insufficient_privilege';
  end if;
  if r.kind <> 'medical_update' then
    raise exception 'INVALID: this is not a medical update' using errcode = 'check_violation';
  end if;
  if r.status not in ('open', 'in_progress') then
    raise exception 'INVALID: this update has already been answered' using errcode = 'check_violation';
  end if;

  -- Which child. The request usually says; if not, the office chooses one of
  -- that family's children.
  kid := coalesce(r.student_id, p_student);
  if kid is not null and not exists (select 1 from student s where s.id = kid and s.family_id = r.family_id
                                       and s.studio_id = r.studio_id and s.deleted_at is null) then
    raise exception 'INVALID: that child is not in this family' using errcode = 'check_violation';
  end if;
  select first_name into child from student where id = kid;

  if p_record is not null then
    if kid is null then
      raise exception 'INVALID: choose which child this update is about' using errcode = 'check_violation';
    end if;
    -- Only the fields the office sent are changed; anything left out stays.
    insert into medical_record (studio_id, student_id, allergies, conditions, medications, action_plan,
                                requires_alert, updated_by)
    values (r.studio_id, kid,
            nullif(btrim(p_record ->> 'allergies'), ''), nullif(btrim(p_record ->> 'conditions'), ''),
            nullif(btrim(p_record ->> 'medications'), ''), nullif(btrim(p_record ->> 'action_plan'), ''),
            coalesce((p_record ->> 'requires_alert')::boolean, false), auth.uid())
    on conflict (student_id) do update set
      allergies      = case when p_record ? 'allergies'   then nullif(btrim(p_record ->> 'allergies'), '')   else medical_record.allergies end,
      conditions     = case when p_record ? 'conditions'  then nullif(btrim(p_record ->> 'conditions'), '')  else medical_record.conditions end,
      medications    = case when p_record ? 'medications' then nullif(btrim(p_record ->> 'medications'), '') else medical_record.medications end,
      action_plan    = case when p_record ? 'action_plan' then nullif(btrim(p_record ->> 'action_plan'), '') else medical_record.action_plan end,
      requires_alert = case when p_record ? 'requires_alert' then (p_record ->> 'requires_alert')::boolean else medical_record.requires_alert end,
      updated_by = auth.uid(), updated_at = now(), deleted_at = null;
  end if;

  msg := nullif(btrim(coalesce(p_message, '')), '');
  if msg is null then
    msg := case when p_record is not null
      then 'Thank you — we have updated ' || coalesce(child || '''s', 'your child''s')
           || ' medical record, and their teachers can now see it.'
      else 'Thank you — we have received your update' || coalesce(' about ' || child, '')
           || ' and will add it to their record.' end;
  end if;

  update studio_request
     set status = case when p_record is not null then 'closed'::request_status else 'answered'::request_status end,
         student_id = coalesce(student_id, kid),
         answer = msg, answered_by = auth.uid(), answered_at = now(), updated_at = now()
   where id = r.id;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (r.studio_id, auth.uid(), case when p_record is not null then 'record' else 'acknowledge' end,
          'studio_request', r.id,
          case when p_record is not null then 'Medical update acknowledged and added to the record'
               else 'Medical update acknowledged' end);

  perform app.notify_family(r.family_id, 'request_answered', 'The studio replied: ' || r.subject,
                            left(msg, 120), '/family/enquiries');
end $$;

grant execute on function app.acknowledge_medical_update(uuid, jsonb, text, uuid) to authenticated;
