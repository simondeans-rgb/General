-- ============================================================================
-- 0030 · Safeguarding concerns, staff checks and leaver retention
--        (R-033, R-035, R-041)
-- ============================================================================

-- ── R-033 · Safeguarding concern log ───────────────────────────────────────
-- Any member of staff can raise a concern. Only the owner and the school's
-- Designated Safeguarding Lead can read the log, and every time they do it is
-- recorded. The tables have no read policy at all: the only way in is through
-- the functions below, which check who is asking and write the access log.
alter table studio add column dsl_user_id uuid references user_account(id) on delete set null;

create table safeguarding_concern (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  student_id  uuid references student(id) on delete set null,
  raised_by   uuid references user_account(id) on delete set null,
  category    text not null check (category in ('wellbeing', 'injury', 'disclosure', 'behaviour', 'attendance', 'online', 'other')),
  summary     text not null check (length(btrim(summary)) >= 10),
  immediate_risk boolean not null default false,
  status      text not null default 'open' check (status in ('open', 'monitoring', 'referred', 'closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create table safeguarding_action (
  id          uuid primary key default gen_random_uuid(),
  concern_id  uuid not null references safeguarding_concern(id) on delete cascade,
  by_user     uuid references user_account(id) on delete set null,
  note        text not null,
  status_to   text,
  at          timestamptz not null default now()
);
create table safeguarding_access (
  id          bigserial primary key,
  studio_id   uuid not null references studio(id) on delete cascade,
  user_id     uuid references user_account(id) on delete set null,
  concern_id  uuid references safeguarding_concern(id) on delete cascade,
  what        text not null,
  at          timestamptz not null default now()
);
alter table safeguarding_concern enable row level security; alter table safeguarding_concern force row level security;
alter table safeguarding_action  enable row level security; alter table safeguarding_action  force row level security;
alter table safeguarding_access  enable row level security; alter table safeguarding_access  force row level security;
grant all on safeguarding_concern, safeguarding_action, safeguarding_access to service_role;

create or replace function app.is_safeguarding_lead(p_studio uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select auth.uid() is not null and (app.has_role(p_studio, 'owner')
    or exists (select 1 from studio s where s.id = p_studio and s.dsl_user_id = auth.uid() and app.is_staff(p_studio)));
$$;

create or replace function app.raise_concern(p_student uuid, p_category text, p_summary text, p_immediate boolean default false)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; cid uuid; u uuid;
begin
  select studio_id into sid from student where id = p_student and deleted_at is null;
  if sid is null or not app.is_staff(sid) then
    raise exception 'FORBIDDEN: staff raise concerns about children at their school' using errcode = 'insufficient_privilege';
  end if;
  insert into safeguarding_concern (studio_id, student_id, raised_by, category, summary, immediate_risk)
  values (sid, p_student, auth.uid(), p_category, btrim(p_summary), coalesce(p_immediate, false)) returning id into cid;
  -- The lead and the owner hear at once; the notification names no child.
  for u in select distinct x from (select s.dsl_user_id x from studio s where s.id = sid
                                   union select m.user_id from membership m where m.studio_id = sid and m.role = 'owner' and m.deleted_at is null) y
            where x is not null loop
    perform app.notify_user(sid, u, 'safeguarding', case when p_immediate then 'URGENT safeguarding concern raised' else 'Safeguarding concern raised' end,
                            'Open the safeguarding log to read it.', '/safeguarding');
  end loop;
  return cid;
end $$;

create or replace function app.safeguarding_log(p_studio uuid)
  returns table (id uuid, student_name text, category text, summary text, immediate_risk boolean, status text,
                 raised_by text, created_at timestamptz, actions int)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_safeguarding_lead(p_studio) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner can read concerns' using errcode = 'insufficient_privilege';
  end if;
  insert into safeguarding_access (studio_id, user_id, what) values (p_studio, auth.uid(), 'viewed the log');
  return query
  select c.id, s.first_name || ' ' || s.last_name, c.category, c.summary, c.immediate_risk, c.status,
         coalesce(u.full_name, 'Unknown'), c.created_at, (select count(*)::int from safeguarding_action a where a.concern_id = c.id)
    from safeguarding_concern c left join student s on s.id = c.student_id left join user_account u on u.id = c.raised_by
   where c.studio_id = p_studio order by (c.status = 'closed'), c.immediate_risk desc, c.created_at desc;
end $$;

create or replace function app.safeguarding_actions(p_concern uuid)
  returns table (note text, status_to text, by_name text, at timestamptz)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from safeguarding_concern where id = p_concern;
  if sid is null or not app.is_safeguarding_lead(sid) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner can read concerns' using errcode = 'insufficient_privilege';
  end if;
  insert into safeguarding_access (studio_id, user_id, concern_id, what) values (sid, auth.uid(), p_concern, 'opened a concern');
  return query select a.note, a.status_to, coalesce(u.full_name, 'Unknown'), a.at
    from safeguarding_action a left join user_account u on u.id = a.by_user where a.concern_id = p_concern order by a.at;
end $$;

create or replace function app.safeguarding_act(p_concern uuid, p_note text, p_status text default null) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from safeguarding_concern where id = p_concern;
  if sid is null or not app.is_safeguarding_lead(sid) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner act on concerns' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(btrim(p_note), '') = '' then raise exception 'INVALID: record what was done' using errcode = 'check_violation'; end if;
  insert into safeguarding_action (concern_id, by_user, note, status_to) values (p_concern, auth.uid(), btrim(p_note), p_status);
  if p_status is not null then update safeguarding_concern set status = p_status, updated_at = now() where id = p_concern; end if;
  insert into safeguarding_access (studio_id, user_id, concern_id, what) values (sid, auth.uid(), p_concern, 'recorded an action');
end $$;

create or replace function app.safeguarding_access_log(p_studio uuid)
  returns table (who text, what text, concern uuid, at timestamptz)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.has_role(p_studio, 'owner') then
    raise exception 'FORBIDDEN: only the owner reviews who has read the log' using errcode = 'insufficient_privilege';
  end if;
  return query select coalesce(u.full_name, 'Unknown'), a.what, a.concern_id, a.at from safeguarding_access a
    left join user_account u on u.id = a.user_id where a.studio_id = p_studio order by a.at desc limit 200;
end $$;

create or replace function app.set_safeguarding_lead(p_user uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select m.studio_id into sid from membership m where m.user_id = auth.uid() and m.role = 'owner' and m.deleted_at is null limit 1;
  if sid is null then raise exception 'FORBIDDEN: only the owner names the safeguarding lead' using errcode = 'insufficient_privilege'; end if;
  if p_user is not null and not exists (select 1 from membership m where m.user_id = p_user and m.studio_id = sid
                                          and m.role in ('owner', 'admin', 'teacher') and m.deleted_at is null) then
    raise exception 'INVALID: the lead must be a member of staff' using errcode = 'check_violation';
  end if;
  update studio set dsl_user_id = p_user, updated_at = now() where id = sid;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'update', 'studio', sid, 'Safeguarding lead changed');
end $$;

-- ── R-035 · Staff checks ───────────────────────────────────────────────────
-- DBS, safeguarding training and first aid, with expiry dates. Owner only: a
-- certificate number is sensitive. The owner hears 30 days before anything
-- runs out, once per check.
create table staff_check (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  staff_id    uuid not null references staff_member(id) on delete cascade,
  kind        text not null check (kind in ('dbs', 'safeguarding_training', 'first_aid', 'other')),
  reference   text,
  checked_on  date not null,
  expires_on  date,
  note        text,
  reminded_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  check (expires_on is null or expires_on >= checked_on)
);
alter table staff_check enable row level security; alter table staff_check force row level security;
create policy staff_check_owner on staff_check for all
  using (deleted_at is null and app.has_role(studio_id, 'owner')) with check (app.has_role(studio_id, 'owner'));
grant select, insert, update on staff_check to authenticated;
grant all on staff_check to service_role;

create or replace function app.staff_check_stamp() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  select studio_id into new.studio_id from staff_member where id = new.staff_id;
  if tg_op = 'UPDATE' and new.expires_on is distinct from old.expires_on then new.reminded_at := null; end if;
  return new;
end $$;
create trigger staff_check_stamp before insert or update on staff_check for each row execute function app.staff_check_stamp();

-- Called by the office's open app (and by the scheduler, once hosted).
create or replace function app.remind_staff_checks(p_studio uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c record; n int := 0; u uuid;
begin
  if auth.uid() is not null and not app.is_staff(p_studio) then return 0; end if;
  for c in select k.*, sm.display_name from staff_check k join staff_member sm on sm.id = k.staff_id and sm.deleted_at is null and sm.status = 'active'
            where k.studio_id = p_studio and k.deleted_at is null and k.reminded_at is null
              and k.expires_on is not null and k.expires_on <= current_date + 30
              and not exists (select 1 from staff_check newer where newer.staff_id = k.staff_id and newer.kind = k.kind
                                and newer.deleted_at is null and newer.checked_on > k.checked_on) loop
    for u in select m.user_id from membership m where m.studio_id = p_studio and m.role = 'owner' and m.deleted_at is null loop
      perform app.notify_user(p_studio, u, 'staff_check_due',
        case when c.expires_on < current_date then 'Expired: ' else 'Due soon: ' end || c.display_name || '’s ' ||
        replace(case c.kind when 'dbs' then 'DBS check' else c.kind end, '_', ' '),
        'Expires ' || to_char(c.expires_on, 'FMDD Month YYYY'), '/people?tab=staff');
    end loop;
    update staff_check set reminded_at = now() where id = c.id;
    n := n + 1;
  end loop;
  return n;
end $$;

-- ── R-041 · Keeping leavers' data only as long as needed ───────────────────
-- A leaver is a child with no live enrolment, waiting-list place or trial,
-- whose last class ended some time ago. Periods are per school, with
-- defaults to confirm with the school's own adviser:
--   medical record deleted          12 months after leaving
--   child's details anonymised      36 months after leaving
--   family financial records kept   72 months (six years) after the last invoice
create table retention_policy (
  studio_id         uuid primary key references studio(id) on delete cascade,
  medical_months    smallint not null default 12 check (medical_months between 1 and 120),
  personal_months   smallint not null default 36 check (personal_months between 6 and 240),
  financial_months  smallint not null default 72 check (financial_months between 12 and 240),
  last_run_at       timestamptz,
  updated_at        timestamptz not null default now()
);
alter table retention_policy enable row level security; alter table retention_policy force row level security;
create policy retention_owner on retention_policy for all
  using (app.has_role(studio_id, 'owner')) with check (app.has_role(studio_id, 'owner'));
create policy retention_admin_read on retention_policy for select using (app.is_admin(studio_id));
grant select, insert, update on retention_policy to authenticated;
grant all on retention_policy to service_role;
insert into retention_policy (studio_id) select id from studio on conflict do nothing;
create or replace function app.on_studio_retention() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin insert into retention_policy (studio_id) values (new.id) on conflict do nothing; return null; end $$;
create trigger studio_retention after insert on studio for each row execute function app.on_studio_retention();

create or replace function app.leaver_since(p_student uuid) returns date
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select case when exists (select 1 from enrolment e where e.student_id = p_student and e.status = 'active' and e.deleted_at is null)
                or exists (select 1 from waitlist_entry w where w.student_id = p_student and w.status in ('waiting', 'offered') and w.deleted_at is null)
                or exists (select 1 from trial t where t.student_id = p_student and t.status in ('booked', 'requested') and t.deleted_at is null)
              then null
              else coalesce((select max(coalesce(e.ended_on, e.updated_at::date)) from enrolment e where e.student_id = p_student),
                            (select max(t.created_at::date) from trial t where t.student_id = p_student),
                            (select created_at::date from student where id = p_student)) end;
$$;

-- What a run would do (p_apply = false), or does it. Each step is audited.
create or replace function app.apply_retention(p_studio uuid, p_apply boolean default false)
  returns table (step text, student_id uuid, who text, left_on date)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare pol retention_policy; r record;
begin
  if not app.has_role(p_studio, 'owner') then
    raise exception 'FORBIDDEN: only the owner runs data retention' using errcode = 'insufficient_privilege';
  end if;
  select * into pol from retention_policy where studio_id = p_studio;
  for r in select s.id, s.first_name || ' ' || s.last_name as who, app.leaver_since(s.id) as since,
                  exists (select 1 from medical_record m where m.student_id = s.id and m.deleted_at is null) as has_medical,
                  s.first_name = 'Former' as anonymised
             from student s where s.studio_id = p_studio and s.deleted_at is null loop
    continue when r.since is null;
    if r.has_medical and r.since < current_date - make_interval(months => pol.medical_months) then
      step := 'medical'; student_id := r.id; who := r.who; left_on := r.since; return next;
      if p_apply then
        delete from medical_record where medical_record.student_id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'medical_record', r.id, 'Medical record deleted: left ' || r.since);
      end if;
    end if;
    if not r.anonymised and r.since < current_date - make_interval(months => pol.personal_months) then
      step := 'anonymise'; student_id := r.id; who := r.who; left_on := r.since; return next;
      if p_apply then
        delete from emergency_contact where emergency_contact.student_id = r.id;
        delete from consent_record where consent_record.student_id = r.id;
        delete from student_reflection where student_reflection.student_id = r.id;
        update feedback_note set private_note = null, going_well = null, work_on = null where feedback_note.student_id = r.id;
        update student set first_name = 'Former', last_name = 'student',
               date_of_birth = make_date(extract(year from date_of_birth)::int, 1, 1), user_id = null, login_enabled = false,
               updated_at = now() where id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'student', r.id, 'Details anonymised: left ' || r.since);
      end if;
    end if;
  end loop;
  if p_apply then update retention_policy set last_run_at = now() where studio_id = p_studio; end if;
end $$;

revoke all on function app.is_safeguarding_lead(uuid), app.raise_concern(uuid, text, text, boolean), app.safeguarding_log(uuid),
  app.safeguarding_actions(uuid), app.safeguarding_act(uuid, text, text), app.safeguarding_access_log(uuid),
  app.set_safeguarding_lead(uuid), app.remind_staff_checks(uuid), app.leaver_since(uuid), app.apply_retention(uuid, boolean) from public;
grant execute on function app.is_safeguarding_lead(uuid), app.raise_concern(uuid, text, text, boolean), app.safeguarding_log(uuid),
  app.safeguarding_actions(uuid), app.safeguarding_act(uuid, text, text), app.safeguarding_access_log(uuid),
  app.set_safeguarding_lead(uuid), app.remind_staff_checks(uuid), app.apply_retention(uuid, boolean) to authenticated;
