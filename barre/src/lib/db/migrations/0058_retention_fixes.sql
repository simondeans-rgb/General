-- Retention fixes from the draft retention policy and DPIA (docs/compliance).
--
-- 1. A legal hold, an open concern or a kept concern protects ALL of a child's
--    data: the medical record, support note and attendance as well as the
--    details anonymised at the end. (Before, medical went before the check.)
-- 2. Soft-deleted children, and soft-deleted medical, emergency and consent
--    rows, are no longer skipped: once their period passes they are purged.
-- 3. A legal hold on a single concern, so concerns about adults and staff
--    (no child to hold) can be kept too. Lead and owner only, logged.
-- 4. Deleting a concern keeps its access-log rows, detached and marked, for
--    the audit-log period.
-- 5. Periods for messages, attendance, support notes, staff records and
--    checks after a member of staff leaves, audit and access logs, and the
--    lead's shared-care note. Defaults are deliberately long; the owner sets
--    them, with their data protection adviser.
-- 6. A monthly automatic preview from app.tick that tells the owner what is
--    due, and an opt-in setting to apply it 14 days later. Every automatic
--    run is in the audit log.
--
-- Media (resource, resource_file) is not touched here: it follows 0057.

-- ── Settings ────────────────────────────────────────────────────────────────
alter table retention_policy
  add column message_months    smallint not null default 36 check (message_months between 6 and 120),
  add column attendance_months smallint not null default 72 check (attendance_months between 12 and 240),
  add column support_months    smallint not null default 12 check (support_months between 1 and 120),
  add column staff_months      smallint not null default 72 check (staff_months between 12 and 240),
  add column staff_check_months smallint not null default 12 check (staff_check_months between 6 and 120),
  add column audit_months      smallint not null default 72 check (audit_months between 24 and 240),
  add column dsl_note_months   smallint not null default 72 check (dsl_note_months between 12 and 300),
  add column auto_apply        boolean not null default false,
  -- The latest automatic preview: when, how many, and exactly which items, so
  -- an automatic apply never does more than the owner was shown.
  add column auto_preview_at    timestamptz,
  add column auto_preview_count integer,
  add column auto_preview_items text[],
  add column auto_applied_at    timestamptz;

-- When a member of staff left: stamped when they are made inactive or
-- removed (updated_at moves with every edit, so it cannot start a clock).
alter table staff_member add column left_at timestamptz;
update staff_member set left_at = coalesce(deleted_at, updated_at) where status = 'inactive' or deleted_at is not null;
create or replace function app.staff_left_stamp() returns trigger
  language plpgsql as $$
begin
  if new.status = 'active' and new.deleted_at is null then
    new.left_at := null;                                   -- back on the staff
  elsif new.left_at is null or (old.status = 'active' and old.deleted_at is null and new.left_at is not distinct from old.left_at) then
    new.left_at := now();                                  -- leaving now, unless a date was given
  end if;
  return new;
end $$;
create trigger staff_left_stamp before update of status, deleted_at, left_at on staff_member
  for each row execute function app.staff_left_stamp();
create or replace function app.staff_left_insert() returns trigger
  language plpgsql as $$
begin
  if (new.status = 'inactive' or new.deleted_at is not null) and new.left_at is null then new.left_at := now(); end if;
  return new;
end $$;
create trigger staff_left_insert before insert on staff_member for each row execute function app.staff_left_insert();

-- ── 3. A hold on one concern ───────────────────────────────────────────────
create table safeguarding_concern_hold (
  concern_id  uuid primary key references safeguarding_concern(id) on delete cascade,
  studio_id   uuid not null references studio(id) on delete cascade,
  reason      text not null check (length(btrim(reason)) >= 3),
  set_by      uuid references user_account(id) on delete set null,
  set_at      timestamptz not null default now()
);
alter table safeguarding_concern_hold enable row level security; alter table safeguarding_concern_hold force row level security;
grant all on safeguarding_concern_hold to service_role;

create or replace function app.set_concern_hold(p_concern uuid, p_reason text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from safeguarding_concern where id = p_concern;
  if sid is null or not app.can_read_concern(p_concern) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner set a hold' using errcode = 'insufficient_privilege';
  end if;
  if length(btrim(coalesce(p_reason, ''))) < 3 then
    raise exception 'INVALID: say why the concern is held' using errcode = 'check_violation';
  end if;
  insert into safeguarding_concern_hold (concern_id, studio_id, reason, set_by) values (p_concern, sid, btrim(p_reason), auth.uid())
  on conflict (concern_id) do update set reason = excluded.reason, set_by = excluded.set_by, set_at = now();
  insert into safeguarding_access (studio_id, user_id, concern_id, what) values (sid, auth.uid(), p_concern, 'placed a legal hold on the concern');
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'update', 'safeguarding_concern_hold', p_concern, 'Legal hold placed on a concern');
end $$;

create or replace function app.release_concern_hold(p_concern uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from safeguarding_concern_hold where concern_id = p_concern;
  if sid is null then return; end if;
  if not app.can_read_concern(p_concern) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner release a hold' using errcode = 'insufficient_privilege';
  end if;
  delete from safeguarding_concern_hold where concern_id = p_concern;
  insert into safeguarding_access (studio_id, user_id, concern_id, what) values (sid, auth.uid(), p_concern, 'released the legal hold on the concern');
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'update', 'safeguarding_concern_hold', p_concern, 'Legal hold on a concern released');
end $$;

-- Held concerns the caller may read (an allegation stays hidden from its subject).
create or replace function app.concern_holds(p_studio uuid)
  returns table (concern_id uuid, reason text, set_by text, set_at timestamptz)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_safeguarding_lead(p_studio) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner see holds' using errcode = 'insufficient_privilege';
  end if;
  return query select h.concern_id, h.reason, coalesce(u.full_name, 'Unknown'), h.set_at
    from safeguarding_concern_hold h left join user_account u on u.id = h.set_by
   where h.studio_id = p_studio and app.can_read_concern(h.concern_id) order by h.set_at desc;
end $$;

-- As 0047, plus a hold on any of the child's concerns.
create or replace function app.retention_hold_reason(p_student uuid, p_concern_months smallint) returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select case
    when exists (select 1 from safeguarding_hold h where h.student_id = p_student) then 'Legal hold set by the safeguarding lead'
    when exists (select 1 from safeguarding_concern_hold h join safeguarding_concern c on c.id = h.concern_id
                  where c.student_id = p_student) then 'Legal hold on a safeguarding concern'
    when exists (select 1 from safeguarding_concern c where c.student_id = p_student and c.status <> 'closed') then 'Safeguarding concern still open'
    when exists (select 1 from safeguarding_concern c where c.student_id = p_student and c.status = 'closed'
                   and (p_concern_months is null or c.updated_at >= now() - make_interval(months => p_concern_months)))
      then 'Safeguarding record still kept'
  end;
$$;

-- ── 4. Access-log rows outlive the concern ─────────────────────────────────
alter table safeguarding_access
  add column deleted_concern_id uuid,
  add column detached_at        timestamptz,
  add column retention_note     text,
  -- The member of staff a deleted allegation was about: still never shown
  -- the rows, as while the concern existed.
  add column concern_subject_user uuid;
do $$ declare c text; begin
  for c in select conname from pg_constraint where conrelid = 'safeguarding_access'::regclass and contype = 'f'
              and pg_get_constraintdef(oid) like '%safeguarding_concern%' loop
    execute format('alter table safeguarding_access drop constraint %I', c);
  end loop;
end $$;
alter table safeguarding_access add constraint safeguarding_access_concern_id_fkey
  foreign key (concern_id) references safeguarding_concern(id) on delete set null;

-- As 0047, with detached rows shown with their marker and the deleted
-- concern's id.
create or replace function app.safeguarding_access_log(p_studio uuid)
  returns table (who text, what text, concern uuid, at timestamptz)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_safeguarding_lead(p_studio) then
    raise exception 'FORBIDDEN: only the owner and the safeguarding lead review who has read the log' using errcode = 'insufficient_privilege';
  end if;
  return query select coalesce(u.full_name, 'Unknown'),
                      a.what || coalesce(' (' || a.retention_note || ')', ''),
                      coalesce(a.concern_id, a.deleted_concern_id), a.at
    from safeguarding_access a left join user_account u on u.id = a.user_id
   where a.studio_id = p_studio
     and (a.concern_id is null or app.can_read_concern(a.concern_id))
     and (a.concern_subject_user is null or a.concern_subject_user is distinct from auth.uid())
   order by a.at desc, a.id desc limit 500;
end $$;

-- ── The run ────────────────────────────────────────────────────────────────
-- When a child's clock starts: the leaving date, or for a soft-deleted child
-- the later of that and the deletion.
create or replace function app.retention_left_on(p_student uuid) returns date
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select case when s.deleted_at is null then app.leaver_since(s.id)
              else greatest(app.leaver_since(s.id), s.deleted_at::date) end
    from student s where s.id = p_student;
$$;

create or replace function app.retention_key(p_step text, p_id uuid) returns text
  language sql immutable as $$ select p_step || ':' || coalesce(p_id::text, '-') $$;

-- Internal: the whole run, with no caller check. p_only limits it to items
-- from an earlier preview (keys from app.retention_key); p_as_of is when that
-- preview was made, for the log periods.
create or replace function app.retention_run(p_studio uuid, p_apply boolean, p_only text[] default null,
                                             p_as_of timestamptz default now())
  returns table (step text, student_id uuid, who text, left_on date, reason text, entity_id uuid)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare pol retention_policy; r record; held text; n int;
        d_med boolean; d_anon boolean; d_sup boolean; d_att boolean;
        med_cut date; pers_cut date; sup_cut date; att_cut date;
begin
  select * into pol from retention_policy rp where rp.studio_id = p_studio;
  if pol.studio_id is null then return; end if;
  med_cut  := current_date - make_interval(months => pol.medical_months);
  pers_cut := current_date - make_interval(months => pol.personal_months);
  sup_cut  := current_date - make_interval(months => pol.support_months);
  att_cut  := current_date - make_interval(months => pol.attendance_months);

  -- Children, including soft-deleted ones.
  for r in select s.id, s.first_name || ' ' || s.last_name as name, app.retention_left_on(s.id) as since,
                  exists (select 1 from medical_record m where m.student_id = s.id) as has_medical,
                  exists (select 1 from student_support_note sn where sn.student_id = s.id) as has_support,
                  (exists (select 1 from attendance_record a where a.student_id = s.id)
                   or exists (select 1 from absence_report a where a.student_id = s.id)
                   or exists (select 1 from attendance_history a where a.student_id = s.id)
                   or exists (select 1 from makeup_offer a where a.student_id = s.id)) as has_attendance,
                  (exists (select 1 from medical_record m where m.student_id = s.id and m.deleted_at < now() - make_interval(months => pol.medical_months))
                   or exists (select 1 from emergency_contact x where x.student_id = s.id and x.deleted_at < now() - make_interval(months => pol.personal_months))
                   or exists (select 1 from consent_record x where x.student_id = s.id and x.deleted_at < now() - make_interval(months => pol.personal_months)))
                    as old_deleted_rows,
                  s.first_name = 'Former' as anonymised
             from student s join family f on f.id = s.family_id
            where s.studio_id = p_studio and not f.is_prospect loop
    student_id := r.id; who := r.name; left_on := r.since; entity_id := r.id; reason := null;
    if r.since is null then
      -- Still coming: only rows the office soft-deleted long ago.
      continue when not r.old_deleted_rows;
      held := app.retention_hold_reason(r.id, pol.concern_months);
      if held is not null then step := 'held'; reason := held; return next; continue; end if;
      step := 'purge';
      continue when p_only is not null and not app.retention_key(step, r.id) = any(p_only);
      return next;
      if p_apply then
        delete from medical_record m where m.student_id = r.id and m.deleted_at < now() - make_interval(months => pol.medical_months);
        delete from emergency_contact x where x.student_id = r.id and x.deleted_at < now() - make_interval(months => pol.personal_months);
        delete from consent_record x where x.student_id = r.id and x.deleted_at < now() - make_interval(months => pol.personal_months);
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'student', r.id, 'Deleted records removed for good');
      end if;
      continue;
    end if;
    d_med  := r.has_medical and r.since < med_cut;
    d_anon := not r.anonymised and r.since < pers_cut;
    d_sup  := r.has_support and r.since < sup_cut;
    d_att  := r.has_attendance and r.since < att_cut;
    continue when not (d_med or d_anon or d_sup or d_att);
    -- A hold keeps everything about the child, the medical record included.
    held := app.retention_hold_reason(r.id, pol.concern_months);
    if held is not null then step := 'held'; reason := held; return next; continue; end if;

    if d_med and (p_only is null or app.retention_key('medical', r.id) = any(p_only)) then
      step := 'medical'; return next;
      if p_apply then
        delete from medical_record m where m.student_id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'medical_record', r.id, 'Medical record deleted: left ' || r.since);
      end if;
    end if;
    if d_anon and (p_only is null or app.retention_key('anonymise', r.id) = any(p_only)) then
      step := 'anonymise'; return next;
      if p_apply then
        delete from emergency_contact x where x.student_id = r.id;
        delete from consent_record x where x.student_id = r.id;
        delete from student_reflection x where x.student_id = r.id;
        delete from welfare_watch x where x.student_id = r.id;
        update feedback_note set private_note = null, going_well = null, work_on = null where feedback_note.student_id = r.id;
        update student set first_name = 'Former', last_name = 'student',
               date_of_birth = make_date(extract(year from date_of_birth)::int, 1, 1), user_id = null, login_enabled = false,
               updated_at = now() where id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'student', r.id, 'Details anonymised: left ' || r.since);
      end if;
    end if;
    if d_sup and (p_only is null or app.retention_key('support', r.id) = any(p_only)) then
      step := 'support'; return next;
      if p_apply then
        delete from student_support_note x where x.student_id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'student_support_note', r.id, 'Support note deleted: left ' || r.since);
      end if;
    end if;
    if d_att and (p_only is null or app.retention_key('attendance', r.id) = any(p_only)) then
      step := 'attendance'; return next;
      if p_apply then
        delete from attendance_record x where x.student_id = r.id;
        delete from absence_report x where x.student_id = r.id;
        delete from attendance_history x where x.student_id = r.id;
        delete from makeup_offer x where x.student_id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'attendance_record', r.id, 'Attendance deleted: left ' || r.since);
      end if;
    end if;
  end loop;
  student_id := null; reason := null;

  -- Enquiries and prospect families, as 0047.
  for r in select e.id, e.child_name, e.contact_name, greatest(e.updated_at, (select max(cs.starts_at) from trial t
                  join class_session cs on cs.id = t.session_id where t.enquiry_id = e.id))::date last_seen
             from enquiry e where e.studio_id = p_studio and e.deleted_at is null and e.stage <> 'enrolled' loop
    continue when r.last_seen >= current_date - pol.prospect_days;
    continue when p_only is not null and not app.retention_key('prospect', r.id) = any(p_only);
    step := 'prospect'; who := coalesce(r.child_name, r.contact_name); left_on := r.last_seen; entity_id := r.id; return next;
    if p_apply then
      delete from enquiry where id = r.id;
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'enquiry', r.id, 'Enquiry removed: no activity since ' || r.last_seen);
    end if;
  end loop;
  for r in select f.id, f.name, f.created_at::date made from family f
            where f.studio_id = p_studio and f.deleted_at is null and f.is_prospect
              and f.created_at < now() - make_interval(days => pol.prospect_days)
              and not exists (select 1 from student s join trial t on t.student_id = s.id join class_session cs on cs.id = t.session_id
                               where s.family_id = f.id and cs.starts_at > now() - make_interval(days => pol.prospect_days))
              and not exists (select 1 from invoice i where i.family_id = f.id and i.deleted_at is null)
              and not exists (select 1 from student s where s.family_id = f.id
                                and app.retention_hold_reason(s.id, pol.concern_months) is not null) loop
    continue when p_only is not null and not app.retention_key('prospect', r.id) = any(p_only);
    step := 'prospect'; who := r.name; left_on := r.made; entity_id := r.id; return next;
    if p_apply then
      delete from emergency_contact where emergency_contact.student_id in (select id from student where family_id = r.id);
      delete from medical_record where medical_record.student_id in (select id from student where family_id = r.id);
      update student set first_name = 'Former', last_name = 'prospect', date_of_birth = make_date(extract(year from date_of_birth)::int, 1, 1),
             deleted_at = now() where family_id = r.id;
      update guardian set full_name = 'Former prospect', email = null, phone = null, user_id = null, deleted_at = now() where family_id = r.id;
      update family set name = 'Former prospect', address_line1 = null, address_line2 = null, city = null, postcode = null,
             notes = null, deleted_at = now() where id = r.id;
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'family', r.id, 'Prospect record removed');
    end if;
  end loop;

  -- Families once every child, soft-deleted ones included, is anonymised.
  for r in select f.id, f.name, (select max(coalesce(i.issued_on, i.created_at::date)) from invoice i where i.family_id = f.id) last_inv
             from family f where f.studio_id = p_studio and f.deleted_at is null and not f.is_prospect and f.name <> 'Former family'
              and exists (select 1 from student s where s.family_id = f.id)
              and not exists (select 1 from student s where s.family_id = f.id and s.first_name <> 'Former') loop
    continue when r.last_inv is not null and r.last_inv >= current_date - make_interval(months => pol.financial_months);
    continue when p_only is not null and not app.retention_key('financial', r.id) = any(p_only);
    step := 'financial'; who := r.name; left_on := r.last_inv; entity_id := r.id; return next;
    if p_apply then
      update guardian set full_name = 'Former guardian', email = null, phone = null, user_id = null where family_id = r.id;
      update family set name = 'Former family', address_line1 = null, address_line2 = null, city = null, postcode = null, notes = null
       where id = r.id;
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'family', r.id, 'Family details anonymised; invoices kept');
    end if;
  end loop;

  -- The lead's shared-care note, once every child in the family has been gone
  -- for the period.
  for r in select ga.guardian_id, g.full_name, g.family_id,
                  (select max(app.retention_left_on(s.id)) from student s where s.family_id = g.family_id) last_left,
                  exists (select 1 from student s where s.family_id = g.family_id and app.retention_left_on(s.id) is null) still_here,
                  (select app.retention_hold_reason(s.id, pol.concern_months) from student s where s.family_id = g.family_id
                     and app.retention_hold_reason(s.id, pol.concern_months) is not null limit 1) hold
             from guardian_access ga join guardian g on g.id = ga.guardian_id
            where ga.studio_id = p_studio and ga.dsl_note is not null loop
    continue when r.still_here or r.last_left is null
               or r.last_left >= current_date - make_interval(months => pol.dsl_note_months);
    who := 'Shared-care note for ' || r.full_name; left_on := r.last_left; entity_id := r.guardian_id;
    if r.hold is not null then step := 'held'; reason := r.hold; return next; reason := null; continue; end if;
    continue when p_only is not null and not app.retention_key('dsl_note', r.guardian_id) = any(p_only);
    step := 'dsl_note'; return next;
    if p_apply then
      update guardian_access set dsl_note = null, updated_at = now() where guardian_id = r.guardian_id;
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'guardian_access', r.guardian_id, 'Shared-care note cleared: family left ' || r.last_left);
    end if;
  end loop;

  -- Messages older than the period, per family conversation (class notices
  -- and announcements together). A family with a held child keeps them.
  for r in select c.family_id, max(f.name) fname, count(*)::int n, max(c.sent_at)::date last_sent
             from communication c left join family f on f.id = c.family_id
            where c.studio_id = p_studio and c.sent_at < now() - make_interval(months => pol.message_months)
            group by c.family_id loop
    who := case when r.family_id is null then 'Class notices and announcements' else 'Messages with ' || coalesce(r.fname, 'a family') end
           || ' (' || r.n || ')';
    left_on := r.last_sent; entity_id := r.family_id;
    held := case when r.family_id is null then null else
              (select app.retention_hold_reason(s.id, pol.concern_months) from student s where s.family_id = r.family_id
                 and app.retention_hold_reason(s.id, pol.concern_months) is not null limit 1) end;
    if held is not null then step := 'held'; reason := held; return next; reason := null; continue; end if;
    continue when p_only is not null and not app.retention_key('messages', r.family_id) = any(p_only);
    step := 'messages'; return next;
    if p_apply then
      delete from communication c where c.studio_id = p_studio and c.family_id is not distinct from r.family_id
         and c.sent_at < now() - make_interval(months => pol.message_months);
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'communication', r.family_id, r.n || ' messages deleted: sent before ' || r.last_sent);
    end if;
  end loop;

  -- Staff who have left (inactive or removed, with no staff login left):
  -- certificate references and notes cleared first, the record anonymised
  -- and the checks deleted later. Anyone a concern is about is kept while
  -- that concern is.
  for r in select sm.id, sm.display_name, coalesce(sm.left_at, sm.deleted_at, sm.updated_at)::date gone,
                  exists (select 1 from staff_check k where k.staff_id = sm.id and (k.reference is not null or k.note is not null)) has_ref,
                  exists (select 1 from safeguarding_concern c where c.subject_staff_id = sm.id) has_concern
             from staff_member sm
            where sm.studio_id = p_studio and (sm.status = 'inactive' or sm.deleted_at is not null) and sm.display_name <> 'Former staff'
              and not exists (select 1 from membership m where m.studio_id = p_studio and m.user_id = sm.user_id
                                and m.deleted_at is null and m.role in ('owner', 'admin', 'teacher')) loop
    who := r.display_name; left_on := r.gone; entity_id := r.id;
    d_anon := r.gone < current_date - make_interval(months => pol.staff_months);
    d_sup  := r.has_ref and r.gone < current_date - make_interval(months => pol.staff_check_months);
    continue when not (d_anon or d_sup);
    if r.has_concern then
      step := 'held'; reason := 'Safeguarding record about this member of staff still kept'; return next; reason := null; continue;
    end if;
    if d_anon then
      continue when p_only is not null and not app.retention_key('staff', r.id) = any(p_only);
      step := 'staff'; return next;
      if p_apply then
        delete from staff_check where staff_id = r.id;
        update staff_member set display_name = 'Former staff', email = null, phone = null, bio = null, user_id = null,
               dbs_checked_on = null where id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'staff_member', r.id, 'Staff record anonymised: left ' || r.gone);
      end if;
    else
      continue when p_only is not null and not app.retention_key('staff_check', r.id) = any(p_only);
      step := 'staff_check'; return next;
      if p_apply then
        update staff_check set reference = null, note = null where staff_id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'staff_check', r.id, 'Check references cleared: left ' || r.gone);
      end if;
    end if;
  end loop;

  -- Closed concerns, if the school set a period. A hold on the child or on
  -- the concern keeps it. Its access-log rows stay, detached and marked.
  if pol.concern_months is not null then
    for r in select c.id, c.updated_at::date closed, sm.user_id subject_user from safeguarding_concern c
               left join staff_member sm on sm.id = c.subject_staff_id
              where c.studio_id = p_studio and c.status = 'closed'
                and c.updated_at < now() - make_interval(months => pol.concern_months)
                and not exists (select 1 from safeguarding_hold h where h.student_id = c.student_id)
                and not exists (select 1 from safeguarding_concern_hold h where h.concern_id = c.id) loop
      continue when p_only is not null and not app.retention_key('concern', r.id) = any(p_only);
      step := 'concern'; who := 'Closed concern'; left_on := r.closed; entity_id := r.id; return next;
      if p_apply then
        update safeguarding_access set deleted_concern_id = r.id, concern_id = null, detached_at = now(),
               concern_subject_user = r.subject_user,
               retention_note = 'concern deleted under retention on ' || to_char(current_date, 'FMDD FMMonth YYYY')
         where concern_id = r.id;
        delete from safeguarding_concern where id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'safeguarding_concern', r.id, 'Closed concern deleted: closed ' || r.closed);
      end if;
    end loop;
  end if;

  -- Logs older than the period. Rows about a held child, a concern that is
  -- still kept or a member of staff a concern is about stay.
  who := null; left_on := (p_as_of - make_interval(months => pol.audit_months))::date; entity_id := null;
  select count(*)::int into n from audit_log a
   where a.studio_id = p_studio and a.at < p_as_of - make_interval(months => pol.audit_months)
     and not exists (select 1 from student s where s.id = a.entity_id and app.retention_hold_reason(s.id, pol.concern_months) is not null)
     and not exists (select 1 from safeguarding_concern c where c.id = a.entity_id or c.subject_staff_id = a.entity_id);
  if n > 0 and (p_only is null or app.retention_key('audit', null) = any(p_only)) then
    step := 'audit'; who := n || ' audit log entr' || case when n = 1 then 'y' else 'ies' end; return next;
    if p_apply then
      delete from audit_log a
       where a.studio_id = p_studio and a.at < p_as_of - make_interval(months => pol.audit_months)
         and not exists (select 1 from student s where s.id = a.entity_id and app.retention_hold_reason(s.id, pol.concern_months) is not null)
         and not exists (select 1 from safeguarding_concern c where c.id = a.entity_id or c.subject_staff_id = a.entity_id);
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'audit_log', null, n || ' audit log entries deleted: older than ' || left_on);
    end if;
  end if;
  -- Access-log rows still attached to a concern stay with it; detached rows
  -- are counted from when their concern was deleted.
  select count(*)::int into n from safeguarding_access a
   where a.studio_id = p_studio and a.concern_id is null
     and coalesce(a.detached_at, a.at) < p_as_of - make_interval(months => pol.audit_months);
  if n > 0 and (p_only is null or app.retention_key('access_log', null) = any(p_only)) then
    step := 'access_log'; who := n || ' safeguarding access log entr' || case when n = 1 then 'y' else 'ies' end; return next;
    if p_apply then
      delete from safeguarding_access a
       where a.studio_id = p_studio and a.concern_id is null
         and coalesce(a.detached_at, a.at) < p_as_of - make_interval(months => pol.audit_months);
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'safeguarding_access', null, n || ' access log entries deleted: older than ' || left_on);
    end if;
  end if;

  if p_apply then update retention_policy set last_run_at = now() where retention_policy.studio_id = p_studio; end if;
end $$;

-- The owner's preview and run. entity_id is new; the rest is as 0047.
drop function if exists app.apply_retention(uuid, boolean);
create function app.apply_retention(p_studio uuid, p_apply boolean default false)
  returns table (step text, student_id uuid, who text, left_on date, reason text, entity_id uuid)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.has_role(p_studio, 'owner') then
    raise exception 'FORBIDDEN: only the owner runs data retention' using errcode = 'insufficient_privilege';
  end if;
  return query select * from app.retention_run(p_studio, p_apply);
end $$;

-- ── 6. Monthly preview, and an opt-in automatic apply ──────────────────────
-- Called by app.tick for each school. Once a month it previews and tells the
-- owner what is due. With auto_apply on, it applies exactly the previewed
-- items (those still due) 14 days later. Every run is in the audit log.
create or replace function app.retention_tick(p_studio uuid) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare pol retention_policy; n int; items text[]; u uuid; title text; body text;
begin
  select * into pol from retention_policy where studio_id = p_studio for update;
  if pol.studio_id is null then return null; end if;

  if pol.auto_apply and pol.auto_preview_at is not null and pol.auto_applied_at is null
     and pol.auto_preview_at <= now() - interval '14 days' then
    if coalesce(array_length(pol.auto_preview_items, 1), 0) > 0 then
      select count(*)::int into n from app.retention_run(p_studio, true, pol.auto_preview_items, pol.auto_preview_at) x where x.step <> 'held';
    else
      n := 0;
    end if;
    update retention_policy set auto_applied_at = now(), last_run_at = case when n > 0 then now() else last_run_at end
     where studio_id = p_studio;
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (p_studio, null, 'retention', 'retention_policy', p_studio,
            'Automatic retention applied: ' || n || ' change' || case when n = 1 then '' else 's' end
            || ' from the preview of ' || to_char(pol.auto_preview_at, 'FMDD FMMonth YYYY'));
    if n > 0 then
      for u in select m.user_id from membership m where m.studio_id = p_studio and m.role = 'owner' and m.deleted_at is null loop
        perform app.notify_user(p_studio, u, 'retention_applied',
          n || case when n = 1 then ' record was' else ' records were' end || ' handled under your retention policy',
          'Applied automatically, 14 days after the preview. Each change is in the audit log.', '/account');
      end loop;
    end if;
    return 'applied';
  end if;

  if pol.auto_preview_at is null or pol.auto_preview_at <= now() - interval '1 month' then
    select coalesce(array_agg(app.retention_key(x.step, x.entity_id)), '{}'), count(*)::int into items, n
      from app.retention_run(p_studio, false) x where x.step <> 'held';
    update retention_policy set auto_preview_at = now(), auto_preview_count = n, auto_preview_items = items, auto_applied_at = null
     where studio_id = p_studio;
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (p_studio, null, 'retention', 'retention_policy', p_studio,
            'Automatic retention preview: ' || n || ' record' || case when n = 1 then '' else 's' end || ' due');
    if n > 0 then
      title := n || case when n = 1 then ' record is' else ' records are' end || ' due under your retention policy — review and apply';
      body := case when pol.auto_apply
                   then 'They will be applied automatically on ' || to_char(now() + interval '14 days', 'FMDD FMMonth YYYY')
                        || ' unless you apply them first or turn that off.'
                   else 'Review them under Keeping data on your account page, then apply.' end;
      for u in select m.user_id from membership m where m.studio_id = p_studio and m.role = 'owner' and m.deleted_at is null loop
        perform app.notify_user(p_studio, u, 'retention_due', title, body, '/account');
      end loop;
    end if;
    return 'preview';
  end if;
  return null;
end $$;

-- As 0052, plus retention.
create or replace function app.tick() returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s record; auto int := 0; released int := 0; checks int := 0; holds int; digests int;
        due int := 0; offers int := 0; n int; moves int := 0; ret int := 0;
begin
  holds := app.expire_held_drop_ins();
  for s in select id from studio where deleted_at is null and app.studio_writable(id) loop
    auto := auto + coalesce(app.run_automations(s.id), 0);
    released := released + app.release_scheduled(s.id);
    checks := checks + app.remind_staff_checks(s.id);
    perform app.award_event_milestones(s.id);
    -- Waiting-list offers past their expiry go to the next family (UR-19).
    begin
      n := app.expire_waitlist_offers(s.id);
      offers := offers + coalesce(n, 0);
    exception when others then null;   -- one school's data must not stop the rest
    end;
    -- Planned class moves whose day has come (UR-52).
    begin
      moves := moves + coalesce(app.complete_class_moves(s.id), 0);
    exception when others then null;
    end;
    due := due + coalesce(app.notify_invoices_due(s.id), 0);
    -- Monthly retention preview, and the opt-in automatic apply.
    begin
      if app.retention_tick(s.id) is not null then ret := ret + 1; end if;
    exception when others then null;
    end;
  end loop;
  digests := app.send_digests();
  return jsonb_build_object('automations', auto, 'released', released, 'staff_checks', checks,
                            'holds_lapsed', holds, 'digests', digests, 'invoices_due', due,
                            'offers_expired', offers, 'moves', moves, 'retention', ret, 'at', now());
end $$;

revoke all on function app.retention_run(uuid, boolean, text[], timestamptz), app.retention_tick(uuid),
  app.retention_left_on(uuid), app.retention_key(text, uuid), app.retention_hold_reason(uuid, smallint),
  app.apply_retention(uuid, boolean), app.set_concern_hold(uuid, text), app.release_concern_hold(uuid),
  app.concern_holds(uuid) from public;
revoke all on function app.retention_run(uuid, boolean, text[], timestamptz), app.retention_tick(uuid) from authenticated, anon;
grant execute on function app.retention_run(uuid, boolean, text[], timestamptz), app.retention_tick(uuid) to service_role;
grant execute on function app.apply_retention(uuid, boolean), app.set_concern_hold(uuid, text), app.release_concern_hold(uuid),
  app.concern_holds(uuid), app.retention_key(text, uuid) to authenticated;
