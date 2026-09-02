-- ============================================================================
-- 0015 · Moving people through the pipeline
-- ----------------------------------------------------------------------------
-- Enrolling, trialling and waiting are each more than one row. Accepting a
-- waiting-list place means creating an enrolment AND closing the entry;
-- converting a trial means creating an enrolment AND marking the trial AND
-- advancing the enquiry. Half of any of those is a studio that has taken a
-- child's place without recording it, or recorded it twice.
--
-- So they live here, as functions, in one transaction each — and the offer
-- that follows a withdrawal happens whether the place was given up through
-- this app, an import, or a future parent-facing cancellation.
-- ============================================================================

-- ── Withdrawing, and what it frees ─────────────────────────────────────────
-- Returns the id of the waiting-list entry that was offered the place, if any.
create or replace function app.withdraw_enrolment(p_id uuid, p_reason text default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; cid uuid; offered uuid;
begin
  select studio_id, class_id into sid, cid
    from enrolment where id = p_id and status = 'active' and deleted_at is null;
  if sid is null then return null; end if;
  if not app.is_admin(sid) then
    raise exception 'FORBIDDEN: only the office may withdraw a place'
      using errcode = 'insufficient_privilege';
  end if;

  update enrolment
     set status = 'left', ended_on = current_date,
         note = coalesce(nullif(btrim(p_reason), ''), note), updated_at = now()
   where id = p_id;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'withdraw', 'enrolment', p_id, coalesce(p_reason, 'place given up'));

  -- A place has just come free. Offer it to whoever has waited longest, rather
  -- than leaving it for somebody to notice.
  select id into offered from waitlist_entry
   where class_id = cid and status = 'waiting' and deleted_at is null
   order by position limit 1;

  if offered is not null then
    perform app.offer_waitlist_place(offered);
  end if;
  return offered;
end $$;

-- ── Offering a waiting-list place ──────────────────────────────────────────
create or replace function app.offer_waitlist_place(p_id uuid, p_days integer default 3)
  returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from waitlist_entry
   where id = p_id and status = 'waiting' and deleted_at is null;
  if sid is null then return false; end if;

  update waitlist_entry
     set status = 'offered', offered_at = now(),
         offer_expires_at = now() + make_interval(days => greatest(p_days, 1)),
         updated_at = now()
   where id = p_id;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'offer', 'waitlist_entry', p_id,
          format('place offered, expires in %s days', greatest(p_days, 1)));
  return true;
end $$;

-- ── Accepting one ──────────────────────────────────────────────────────────
-- The enrolment insert passes through app.enforce_capacity, so a place offered
-- twice by mistake still cannot put a thirteenth child in a class of twelve.
create or replace function app.accept_waitlist_place(p_id uuid) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare w record; new_id uuid;
begin
  select * into w from waitlist_entry
   where id = p_id and status in ('waiting','offered') and deleted_at is null;
  if not found then return null; end if;
  if not app.is_admin(w.studio_id) then
    raise exception 'FORBIDDEN: only the office may accept a place'
      using errcode = 'insufficient_privilege';
  end if;

  insert into enrolment (studio_id, class_id, student_id, status, started_on, created_by, note)
  values (w.studio_id, w.class_id, w.student_id, 'active', current_date, auth.uid(),
          'From the waiting list')
  returning id into new_id;

  update waitlist_entry
     set status = 'accepted', responded_at = now(), updated_at = now()
   where id = p_id;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (w.studio_id, auth.uid(), 'accept', 'waitlist_entry', p_id, 'place taken up');
  return new_id;
end $$;

create or replace function app.decline_waitlist_place(p_id uuid, p_note text default null)
  returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; cid uuid; nxt uuid;
begin
  select studio_id, class_id into sid, cid from waitlist_entry
   where id = p_id and status in ('waiting','offered') and deleted_at is null;
  if sid is null then return false; end if;
  if not app.is_admin(sid) then
    raise exception 'FORBIDDEN: only the office may close a waiting-list entry'
      using errcode = 'insufficient_privilege';
  end if;

  update waitlist_entry
     set status = 'declined', responded_at = now(),
         note = coalesce(nullif(btrim(p_note), ''), note), updated_at = now()
   where id = p_id;

  -- The place is free again; pass it down the list.
  select id into nxt from waitlist_entry
   where class_id = cid and status = 'waiting' and deleted_at is null
   order by position limit 1;
  if nxt is not null and app.class_enrolled_count(cid) <
       (select capacity from class where id = cid) then
    perform app.offer_waitlist_place(nxt);
  end if;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'decline', 'waitlist_entry', p_id, 'place declined');
  return true;
end $$;

-- ── Trials ─────────────────────────────────────────────────────────────────
-- A converted trial becomes an enrolment, and drags its enquiry along with it,
-- so the funnel cannot show a child as both "trial attended" and enrolled.
--
-- Most trials arrive from an enquiry and have no child record yet: the studio
-- knows a name, a date of birth and a parent's phone number, nothing more.
-- Converting one therefore has to create the family, the guardian and the
-- child before it can enrol anybody. Doing that here rather than in the UI is
-- what stops a half-finished conversion — a family with no child, or a child
-- with no place — from ever existing.
create or replace function app.convert_trial(p_id uuid, p_note text default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  t record; e record; new_id uuid; sid_student uuid; fam uuid;
begin
  select * into t from trial where id = p_id and deleted_at is null;
  if not found then return null; end if;
  if not app.is_admin(t.studio_id) then
    raise exception 'FORBIDDEN: only the office may convert a trial'
      using errcode = 'insufficient_privilege';
  end if;
  if t.status = 'converted' then
    raise exception 'ALREADY_CONVERTED: this trial has already become an enrolment'
      using errcode = 'check_violation';
  end if;

  sid_student := t.student_id;

  if sid_student is null then
    if t.enquiry_id is null then
      raise exception 'NO_STUDENT: this trial has no child record and no enquiry to build one from'
        using errcode = 'check_violation';
    end if;
    select * into e from enquiry where id = t.enquiry_id and deleted_at is null;
    if not found or e.child_name is null or e.child_dob is null then
      raise exception 'NO_CHILD_DETAILS: the enquiry has no child name and date of birth'
        using errcode = 'check_violation';
    end if;

    -- The family takes its name from the contact's surname where there is one.
    insert into family (studio_id, name, created_by)
    values (t.studio_id,
            'The ' || coalesce(nullif(split_part(btrim(e.contact_name), ' ',
                        array_length(string_to_array(btrim(e.contact_name), ' '), 1)), ''),
                        btrim(e.contact_name)) || ' family',
            auth.uid())
    returning id into fam;

    insert into guardian (studio_id, family_id, full_name, email, phone, is_primary)
    values (t.studio_id, fam, e.contact_name, e.contact_email, e.contact_phone, true);

    insert into student (studio_id, family_id, first_name, last_name, date_of_birth, created_by)
    values (t.studio_id, fam,
            split_part(btrim(e.child_name), ' ', 1),
            coalesce(nullif(substr(btrim(e.child_name),
                       length(split_part(btrim(e.child_name), ' ', 1)) + 2), ''), '—'),
            e.child_dob, auth.uid())
    returning id into sid_student;

    update trial set student_id = sid_student where id = p_id;
  end if;

  insert into enrolment (studio_id, class_id, student_id, status, started_on, created_by, note)
  values (t.studio_id, t.class_id, sid_student, 'active', current_date, auth.uid(),
          coalesce(nullif(btrim(p_note), ''), 'Converted from a trial'))
  returning id into new_id;

  update trial set status = 'converted',
                   outcome_note = coalesce(nullif(btrim(p_note), ''), outcome_note),
                   updated_at = now()
   where id = p_id;

  if t.enquiry_id is not null then
    update enquiry set stage = 'enrolled', updated_at = now() where id = t.enquiry_id;
  end if;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (t.studio_id, auth.uid(), 'convert', 'trial', p_id, 'trial became an enrolment');
  return new_id;
end $$;

-- Marking a trial attended or missed keeps the enquiry's stage honest too.
create or replace function app.record_trial_outcome(p_id uuid, p_status text, p_note text default null)
  returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare t record;
begin
  if p_status not in ('attended', 'missed', 'cancelled') then
    raise exception 'BAD_OUTCOME: %', p_status using errcode = 'check_violation';
  end if;
  select * into t from trial where id = p_id and deleted_at is null;
  if not found then return false; end if;
  if not app.is_admin(t.studio_id) then
    raise exception 'FORBIDDEN: only the office may record a trial outcome'
      using errcode = 'insufficient_privilege';
  end if;

  update trial
     set status = p_status::trial_status,
         attended_at = case when p_status = 'attended' then now() else attended_at end,
         outcome_note = coalesce(nullif(btrim(p_note), ''), outcome_note),
         updated_at = now()
   where id = p_id;

  if t.enquiry_id is not null then
    update enquiry
       set stage = (case p_status when 'attended' then 'trial_attended'
                                  when 'missed'   then 'trial_missed'
                                  else 'closed_lost' end)::enquiry_stage,
           updated_at = now()
     where id = t.enquiry_id;
  end if;
  return true;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'withdraw_enrolment(uuid, text)', 'offer_waitlist_place(uuid, integer)',
    'accept_waitlist_place(uuid)', 'decline_waitlist_place(uuid, text)',
    'convert_trial(uuid, text)', 'record_trial_outcome(uuid, text, text)'] loop
    execute format('revoke all on function app.%s from public', f);
    execute format('grant execute on function app.%s to authenticated, service_role', f);
  end loop;
end $$;
