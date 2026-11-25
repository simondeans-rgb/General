-- ============================================================================
-- 0023 · The weekly realities: trials, cancellations, cover, moves, contacts
-- ----------------------------------------------------------------------------
-- R-005  Every child in a session is on its register. A trial booking always
--        creates (or links) a child record with an emergency contact.
-- R-004  Cancel, move or cover ONE session, telling everyone affected.
-- R-030  Teachers can ask the office for cover.
-- R-042  Move a student to another class in one step.
-- R-016  Parents keep their own details and emergency contacts current; the
--        office is told. Parents cannot re-link logins or move records.
-- ============================================================================

-- ── Prospects ──────────────────────────────────────────────────────────────
-- A family that has only booked a trial. It is real enough to hold a child,
-- an emergency contact and a register line, and becomes an ordinary family
-- when the trial converts.
alter table family add column is_prospect boolean not null default false;

-- Make (or find) the child record a trial needs. Used when booking, and to
-- bring trials booked before this migration into line.
create or replace function app.ensure_trial_student(p_trial uuid) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare t trial; e enquiry; fam uuid; kid uuid; last_ text;
begin
  select * into t from trial where id = p_trial;
  if t.student_id is not null then return t.student_id; end if;
  if t.enquiry_id is null then return null; end if;
  select * into e from enquiry where id = t.enquiry_id;
  if e.child_name is null or e.child_dob is null then return null; end if;

  fam := e.family_id;
  if fam is null then
    last_ := nullif(split_part(btrim(e.contact_name), ' ',
                     array_length(string_to_array(btrim(e.contact_name), ' '), 1)), '');
    insert into family (studio_id, name, is_prospect)
    values (t.studio_id, coalesce(last_, btrim(e.contact_name)) || ' family', true)
    returning id into fam;
    insert into guardian (studio_id, family_id, full_name, email, phone, is_primary)
    values (t.studio_id, fam, e.contact_name, e.contact_email, e.contact_phone, true);
  end if;

  insert into student (studio_id, family_id, first_name, last_name, date_of_birth)
  values (t.studio_id, fam, split_part(btrim(e.child_name), ' ', 1),
          coalesce(nullif(substr(btrim(e.child_name), length(split_part(btrim(e.child_name), ' ', 1)) + 2), ''),
                   coalesce(last_, '—')),
          e.child_dob)
  returning id into kid;

  -- The enquirer is the person to ring until the family says otherwise.
  if e.contact_phone is not null then
    insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
    values (t.studio_id, kid, e.contact_name, 'Parent/carer', e.contact_phone, 1);
  end if;

  update trial set student_id = kid where id = t.id;
  update enquiry set family_id = fam, student_id = kid where id = e.id;
  return kid;
end $$;

-- Booking a trial. Either an existing child, or a new one described in
-- p_child: {first_name, last_name, date_of_birth, contact_name, contact_email,
-- contact_phone, emergency_name?, emergency_phone?, enquiry_id?}.
create or replace function app.book_trial(p_session uuid, p_student uuid default null, p_child jsonb default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; kid uuid := p_student; fam uuid; tid uuid; enq uuid := (p_child ->> 'enquiry_id')::uuid;
        ephone text; ename text;
begin
  select s.*, c.trial_price_minor, c.name as class_name into cs
    from class_session s join class c on c.id = s.class_id
   where s.id = p_session and s.deleted_at is null;
  if cs.id is null then raise exception 'NOT_FOUND: that session' using errcode = 'no_data_found'; end if;
  if not app.is_admin(cs.studio_id) then
    raise exception 'FORBIDDEN: only the office books trials here' using errcode = 'insufficient_privilege';
  end if;
  if cs.status = 'cancelled' then raise exception 'INVALID: that session is cancelled' using errcode = 'check_violation'; end if;

  if kid is null then
    if p_child is null or coalesce(btrim(p_child ->> 'first_name'), '') = ''
       or (p_child ->> 'date_of_birth') is null or coalesce(btrim(p_child ->> 'contact_name'), '') = '' then
      raise exception 'INVALID: a new child needs a name, date of birth and a parent or carer' using errcode = 'check_violation';
    end if;
    ephone := coalesce(nullif(btrim(p_child ->> 'emergency_phone'), ''), nullif(btrim(p_child ->> 'contact_phone'), ''));
    if ephone is null then
      raise exception 'INVALID: a phone number to ring in an emergency is needed before a child joins a class'
        using errcode = 'check_violation';
    end if;
    insert into family (studio_id, name, is_prospect, created_by)
    values (cs.studio_id, coalesce(nullif(btrim(p_child ->> 'last_name'), ''), split_part(p_child ->> 'contact_name', ' ', 2), 'New') || ' family', true, auth.uid())
    returning id into fam;
    insert into guardian (studio_id, family_id, full_name, email, phone, is_primary)
    values (cs.studio_id, fam, btrim(p_child ->> 'contact_name'), nullif(btrim(p_child ->> 'contact_email'), ''),
            nullif(btrim(p_child ->> 'contact_phone'), ''), true);
    insert into student (studio_id, family_id, first_name, last_name, date_of_birth, created_by)
    values (cs.studio_id, fam, btrim(p_child ->> 'first_name'), coalesce(nullif(btrim(p_child ->> 'last_name'), ''), '—'),
            (p_child ->> 'date_of_birth')::date, auth.uid())
    returning id into kid;
    ename := coalesce(nullif(btrim(p_child ->> 'emergency_name'), ''), btrim(p_child ->> 'contact_name'));
    insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
    values (cs.studio_id, kid, ename, case when ename = btrim(p_child ->> 'contact_name') then 'Parent/carer' end, ephone, 1);
    if enq is not null then
      update enquiry set family_id = fam, student_id = kid, stage = 'trial_booked', updated_at = now()
       where id = enq and studio_id = cs.studio_id;
    end if;
  else
    if not exists (select 1 from student where id = kid and studio_id = cs.studio_id and deleted_at is null) then
      raise exception 'NOT_FOUND: that child' using errcode = 'no_data_found';
    end if;
    if not exists (select 1 from emergency_contact where student_id = kid and deleted_at is null) then
      raise exception 'INVALID: % has no emergency contact — add one before they join a class',
        (select first_name from student where id = kid) using errcode = 'check_violation';
    end if;
  end if;

  insert into trial (studio_id, class_id, session_id, student_id, enquiry_id, status, price_minor, created_by)
  values (cs.studio_id, cs.class_id, cs.id, kid, enq, 'booked', cs.trial_price_minor, auth.uid())
  returning id into tid;
  return tid;
end $$;

-- Converting reuses the child the trial already has, and the family stops
-- being a prospect.
create or replace function app.on_trial_converted() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.status = 'converted' and old.status <> 'converted' and new.student_id is not null then
    update family set is_prospect = false
     where id = (select family_id from student where id = new.student_id) and is_prospect;
  end if;
  return null;
end $$;
create trigger trial_converted after update of status on trial
  for each row execute function app.on_trial_converted();

-- ── One session at a time ──────────────────────────────────────────────────
alter table class_session add column original_starts_at timestamptz;
alter table class_session add column changed_at timestamptz;
alter table class_session add column changed_by uuid references user_account(id) on delete set null;

-- Tell a session's families and teachers what changed. A class notice for
-- the record, plus a notification each so it is seen.
create or replace function app.announce_session(p_session uuid, p_subject text, p_body text)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; fam uuid; u uuid;
begin
  select s.*, c.name, c.teacher_id as class_teacher into cs
    from class_session s join class c on c.id = s.class_id where s.id = p_session;
  insert into communication (studio_id, kind, channel, class_id, subject, body)
  values (cs.studio_id, 'class_broadcast', 'in_app', cs.class_id, p_subject, p_body);
  for fam in
    select distinct st.family_id from enrolment e join student st on st.id = e.student_id
     where e.class_id = cs.class_id and e.status = 'active' and e.deleted_at is null
    union
    select distinct st.family_id from trial t join student st on st.id = t.student_id
     where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null
  loop
    perform app.notify_family(fam, 'schedule_change', p_subject, left(p_body, 140), '/family/schedule');
  end loop;
  for u in
    select distinct sm.user_id from staff_member sm
     where sm.id in (cs.class_teacher, cs.teacher_id) and sm.user_id is not null
  loop
    perform app.notify_user(cs.studio_id, u, 'schedule_change', p_subject, left(p_body, 140), '/teach');
  end loop;
end $$;

create or replace function app.session_label(p_session uuid) returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select c.name || ' on ' || to_char(s.starts_at at time zone st.timezone, 'FMDay FMDD FMMonth "at" HH24:MI')
    from class_session s join class c on c.id = s.class_id join studio st on st.id = s.studio_id
   where s.id = p_session
$$;

create or replace function app.cancel_session(p_session uuid, p_reason text, p_message text default null, p_notify boolean default true)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs class_session; lbl text;
begin
  select * into cs from class_session where id = p_session and deleted_at is null;
  if cs.id is null then raise exception 'NOT_FOUND: session' using errcode = 'no_data_found'; end if;
  if not app.is_admin(cs.studio_id) then raise exception 'FORBIDDEN: only the office can cancel a class' using errcode = 'insufficient_privilege'; end if;
  if cs.status = 'cancelled' then raise exception 'INVALID: already cancelled' using errcode = 'check_violation'; end if;
  if cs.register_closed_at is not null then
    raise exception 'INVALID: this class has already been taught — its register is closed' using errcode = 'check_violation';
  end if;
  if coalesce(btrim(p_reason), '') = '' then raise exception 'INVALID: give a reason' using errcode = 'check_violation'; end if;
  lbl := app.session_label(p_session);
  update class_session set status = 'cancelled', cancel_reason = btrim(p_reason),
         changed_at = now(), changed_by = auth.uid(), updated_at = now() where id = p_session;
  update trial set status = 'cancelled', outcome_note = 'Session cancelled: ' || btrim(p_reason), updated_at = now()
   where session_id = p_session and status = 'booked';
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (cs.studio_id, auth.uid(), 'cancel', 'class_session', p_session, lbl || ': ' || btrim(p_reason));
  if p_notify then
    perform app.announce_session(p_session, 'Cancelled: ' || lbl,
      coalesce(nullif(btrim(p_message), ''), 'Sorry — ' || lbl || ' is cancelled (' || btrim(p_reason) || ').'));
  end if;
end $$;

create or replace function app.move_session(p_session uuid, p_starts timestamptz, p_room uuid default null,
                                            p_message text default null, p_notify boolean default true)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs class_session; was text; now_ text;
begin
  select * into cs from class_session where id = p_session and deleted_at is null;
  if cs.id is null then raise exception 'NOT_FOUND: session' using errcode = 'no_data_found'; end if;
  if not app.is_admin(cs.studio_id) then raise exception 'FORBIDDEN: only the office can move a class' using errcode = 'insufficient_privilege'; end if;
  if cs.status = 'cancelled' then raise exception 'INVALID: a cancelled class cannot be moved' using errcode = 'check_violation'; end if;
  if cs.register_closed_at is not null then raise exception 'INVALID: this class has already been taught' using errcode = 'check_violation'; end if;
  if p_starts is null then raise exception 'INVALID: choose when it moves to' using errcode = 'check_violation'; end if;
  if p_room is not null and not exists (select 1 from room where id = p_room and studio_id = cs.studio_id and deleted_at is null) then
    raise exception 'INVALID: unknown room' using errcode = 'check_violation';
  end if;
  was := app.session_label(p_session);
  update class_session set original_starts_at = coalesce(original_starts_at, starts_at),
         ends_at = p_starts + (ends_at - starts_at), starts_at = p_starts,
         room_id = coalesce(p_room, room_id), changed_at = now(), changed_by = auth.uid(), updated_at = now()
   where id = p_session;
  now_ := app.session_label(p_session);
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (cs.studio_id, auth.uid(), 'move', 'class_session', p_session, was || ' → ' || now_);
  if p_notify then
    perform app.announce_session(p_session, 'Moved: ' || now_,
      coalesce(nullif(btrim(p_message), ''), was || ' has moved to ' || now_ || '.'));
  end if;
end $$;

create or replace function app.cover_session(p_session uuid, p_teacher uuid, p_message text default null, p_notify_families boolean default false)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; who text; lbl text; u uuid;
begin
  select s.*, c.teacher_id as class_teacher into cs from class_session s join class c on c.id = s.class_id
   where s.id = p_session and s.deleted_at is null;
  if cs.id is null then raise exception 'NOT_FOUND: session' using errcode = 'no_data_found'; end if;
  if not app.is_admin(cs.studio_id) then raise exception 'FORBIDDEN: only the office can arrange cover' using errcode = 'insufficient_privilege'; end if;
  if cs.status = 'cancelled' then raise exception 'INVALID: that class is cancelled' using errcode = 'check_violation'; end if;
  if p_teacher is not null then
    select display_name, user_id into who, u from staff_member
     where id = p_teacher and studio_id = cs.studio_id and status = 'active' and deleted_at is null;
    if who is null then raise exception 'INVALID: choose an active teacher at this school' using errcode = 'check_violation'; end if;
    if p_teacher = cs.class_teacher then p_teacher := null; end if;   -- back to the usual teacher
  end if;
  lbl := app.session_label(p_session);
  update class_session set teacher_id = p_teacher, changed_at = now(), changed_by = auth.uid(), updated_at = now()
   where id = p_session;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (cs.studio_id, auth.uid(), 'cover', 'class_session', p_session,
          lbl || coalesce(': covered by ' || who, ': back to the usual teacher'));
  -- The covering teacher must hear directly; families only if the office wants.
  if p_teacher is not null then
    perform app.notify_user(cs.studio_id, u, 'cover_assigned', 'You are covering ' || lbl,
      coalesce(nullif(btrim(p_message), ''), 'The register and safety notes for this class are on your Today screen.'), '/teach');
  end if;
  if p_notify_families and p_teacher is not null then
    perform app.announce_session(p_session, 'Cover: ' || lbl,
      coalesce(nullif(btrim(p_message), ''), who || ' will be teaching ' || lbl || '.'));
  end if;
  -- Any open cover request for this session is settled.
  update studio_request set status = 'answered', answer = coalesce('Covered by ' || who, 'No cover needed'),
         answered_by = auth.uid(), answered_at = now()
   where session_id = p_session and status in ('open', 'in_progress');
end $$;

-- A covering teacher may see that class — around the date they cover it.
-- (Access is per class in the policies; bounding it in time keeps a one-off
-- cover from becoming a standing view of someone else's students.)
create or replace function app.teacher_class_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select c.id from class c
    join staff_member s on s.id in (c.teacher_id, c.assistant_id)
   where s.user_id = auth.uid() and s.deleted_at is null and c.deleted_at is null
     and app.studio_writable(c.studio_id)
  union
  select cs.class_id from class_session cs
    join staff_member s on s.id = cs.teacher_id
   where s.user_id = auth.uid() and s.deleted_at is null and cs.deleted_at is null
     and cs.status <> 'cancelled'
     and cs.starts_at between now() - interval '2 days' and now() + interval '14 days'
     and app.studio_writable(cs.studio_id)
$$;

-- ── Cover requests from teachers ───────────────────────────────────────────
alter table studio_request add column session_id uuid references class_session(id) on delete set null;

create or replace function app.request_cover(p_session uuid, p_reason text) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; rid uuid; me uuid;
begin
  select s.*, c.teacher_id as class_teacher into cs from class_session s join class c on c.id = s.class_id
   where s.id = p_session and s.deleted_at is null;
  select id into me from staff_member where user_id = auth.uid() and studio_id = cs.studio_id and deleted_at is null;
  if me is null or me <> coalesce(cs.teacher_id, cs.class_teacher) then
    raise exception 'FORBIDDEN: you can only ask for cover for a class you are teaching' using errcode = 'insufficient_privilege';
  end if;
  if cs.starts_at < now() then raise exception 'INVALID: that class has already started' using errcode = 'check_violation'; end if;
  insert into studio_request (studio_id, session_id, kind, subject, body, raised_by)
  values (cs.studio_id, p_session, 'other', 'Cover needed: ' || app.session_label(p_session),
          coalesce(nullif(btrim(p_reason), ''), 'Cover requested.'), auth.uid())
  returning id into rid;
  return rid;
end $$;

-- ── Moving a student between classes ───────────────────────────────────────
create or replace function app.transfer_enrolment(p_enrolment uuid, p_to_class uuid, p_note text default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare e enrolment; to_name text; from_name text; new_id uuid;
begin
  select * into e from enrolment where id = p_enrolment and status = 'active' and deleted_at is null;
  if e.id is null then raise exception 'NOT_FOUND: an active place' using errcode = 'no_data_found'; end if;
  if not app.is_admin(e.studio_id) then raise exception 'FORBIDDEN: only the office can move a student' using errcode = 'insufficient_privilege'; end if;
  if p_to_class = e.class_id then raise exception 'INVALID: that is the same class' using errcode = 'check_violation'; end if;
  select name into to_name from class where id = p_to_class and studio_id = e.studio_id and deleted_at is null;
  if to_name is null then raise exception 'INVALID: choose a class at this school' using errcode = 'check_violation'; end if;
  select name into from_name from class where id = e.class_id;
  -- Join first: if the new class is full, nothing changes.
  insert into enrolment (studio_id, class_id, student_id, status, started_on, created_by, note)
  values (e.studio_id, p_to_class, e.student_id, 'active', current_date, auth.uid(),
          coalesce(nullif(btrim(p_note), ''), 'Moved from ' || from_name))
  returning id into new_id;
  perform app.withdraw_enrolment(p_enrolment, 'Moved to ' || to_name);
  return new_id;
end $$;

-- ── Parents keeping their details current ──────────────────────────────────
-- guardian_self_update (0006) lets a parent edit their family's guardian
-- rows. It must not let them re-link a login, move the row to another family,
-- or make themselves primary over someone else's objection — only contact
-- details change.
create or replace function app.guardian_self_edit_guard() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if auth.uid() is null or app.is_admin(old.studio_id) then return new; end if;
  if new.user_id is distinct from old.user_id or new.family_id is distinct from old.family_id
     or new.studio_id is distinct from old.studio_id or new.deleted_at is distinct from old.deleted_at then
    raise exception 'FORBIDDEN: only the office can change who is linked to a family' using errcode = 'insufficient_privilege';
  end if;
  return new;
end $$;
create trigger guardian_self_edit before update on guardian
  for each row execute function app.guardian_self_edit_guard();

-- The office hears when a family changes contact details.
create or replace function app.on_contact_change() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare fam uuid; fname text; sid uuid;
begin
  if auth.uid() is null or app.is_staff(coalesce(new.studio_id, old.studio_id)) then return null; end if;
  if tg_table_name = 'guardian' then fam := coalesce(new.family_id, old.family_id);
  else select family_id into fam from student where id = coalesce(new.student_id, old.student_id); end if;
  select name, studio_id into fname, sid from family where id = fam;
  perform app.notify_admins(sid, 'contact_updated', 'Contact details updated',
    'The ' || fname || ' updated ' || case tg_table_name when 'guardian' then 'their contact details.' else 'an emergency contact.' end,
    '/people?id=' || fam);
  return null;
end $$;
create trigger guardian_contact_notify after update on guardian for each row execute function app.on_contact_change();
create trigger emergency_contact_notify after insert or update on emergency_contact for each row execute function app.on_contact_change();

grant execute on function app.book_trial(uuid, uuid, jsonb), app.cancel_session(uuid, text, text, boolean),
  app.move_session(uuid, timestamptz, uuid, text, boolean), app.cover_session(uuid, uuid, text, boolean),
  app.request_cover(uuid, text), app.transfer_enrolment(uuid, uuid, text), app.session_label(uuid)
  to authenticated;
revoke execute on function app.ensure_trial_student(uuid), app.announce_session(uuid, text, text) from public, authenticated, anon;
grant execute on function app.ensure_trial_student(uuid) to service_role;

-- A parent (or the office) removes an emergency contact. Soft delete through a
-- function because the row would no longer be visible to the caller under RLS.
-- The last contact cannot be removed: someone must always be reachable.
create or replace function app.remove_emergency_contact(p_contact uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare ec emergency_contact;
begin
  select * into ec from emergency_contact where id = p_contact and deleted_at is null;
  if ec.id is null or not (app.is_admin(ec.studio_id) or ec.student_id in (select app.guardian_student_ids())) then
    raise exception 'FORBIDDEN: not your contact' using errcode = '42501';
  end if;
  if (select count(*) from emergency_contact where student_id = ec.student_id and deleted_at is null) <= 1 then
    raise exception 'A child needs at least one emergency contact — add another before removing this one.';
  end if;
  update emergency_contact set deleted_at = now(), updated_at = now() where id = p_contact;
  if not app.is_staff(ec.studio_id) then
    perform app.notify_admins(ec.studio_id, 'contact_updated', 'Emergency contact removed',
      ec.full_name || ' was removed as a contact for ' || (select first_name || ' ' || last_name from student where id = ec.student_id), '/people');
  end if;
end $$;
revoke all on function app.remove_emergency_contact(uuid) from public;
grant execute on function app.remove_emergency_contact(uuid) to authenticated;
