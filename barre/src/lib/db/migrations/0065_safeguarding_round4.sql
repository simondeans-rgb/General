-- ============================================================================
-- 0065 · Safeguarding, round 4 (docs/review/round2/REPORT.md F1, F13, N-01 to
--        N-06, and the consent snapshot for shows)
-- ----------------------------------------------------------------------------
-- 1. A deputy safeguarding lead, and the school's route outside the app (the
--    local authority designated officer, LADO). The deputy reads and acts on
--    concerns exactly as the lead does.
-- 2. Concerns are routed from who is actually there. Each concern records who
--    was told; the raiser's receipt says exactly that. With no lead named it
--    goes to the owner, and the outside route is shown. An allegation about
--    the owner with no lead (or about the only reader) is still recorded,
--    nobody in the school is told, the raiser is shown the outside route, and
--    a lead named later is told it is waiting.
-- 3. Every member of staff can be the subject of an allegation: owners and
--    office staff with no timetable record too (subject_user_id). Staff checks
--    can be recorded for anyone on the staff, not only teachers.
-- 4. Concerns about adults and staff can name the children involved. The
--    child's record shows the link to the lead and the owner only, and
--    retention holds those children while the concern is kept.
-- 5. Referral fields on actions, and a printable chronology for a concern,
--    logged when opened, printed or exported.
-- 6. A school setting, on by default: material marked as showing children
--    cannot be an outside link. Existing ones are hidden from families while
--    it is on and listed for the office.
-- 7. Holds have a review date, so a hold is looked at again rather than kept
--    for ever by default.
-- 8. A consent snapshot for an event: who may be photographed or filmed, as
--    at a chosen time.
-- ============================================================================

-- ── 1. Lead, deputy, outside route ─────────────────────────────────────────
alter table studio add column if not exists dsl_deputy_user_id uuid references user_account(id) on delete set null;
alter table studio add column if not exists safeguarding_outside_route text
  check (safeguarding_outside_route is null or length(safeguarding_outside_route) <= 600);
alter table studio add column if not exists block_child_media_links boolean not null default true;

-- Internal: is this user a live member of staff here?
create or replace function app.staff_user_live(p_user uuid, p_studio uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select p_user is not null and exists (select 1 from membership m where m.user_id = p_user and m.studio_id = p_studio
                   and m.deleted_at is null and m.role in ('owner', 'admin', 'teacher'));
$$;

-- As 0030, plus the deputy.
create or replace function app.is_safeguarding_lead(p_studio uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select auth.uid() is not null and (app.has_role(p_studio, 'owner')
    or exists (select 1 from studio s where s.id = p_studio
                  and (s.dsl_user_id = auth.uid() or s.dsl_deputy_user_id = auth.uid()) and app.is_staff(p_studio)));
$$;

-- ── 2./3. Concerns: subject user, who was told, children involved ─────────
alter table safeguarding_concern add column if not exists subject_user_id uuid references user_account(id) on delete set null;
alter table safeguarding_concern add column if not exists told_user_ids uuid[] not null default '{}';
alter table safeguarding_concern add column if not exists routing_note text;
update safeguarding_concern c set subject_user_id = sm.user_id
  from staff_member sm where sm.id = c.subject_staff_id and c.subject_user_id is null and sm.user_id is not null;

create table if not exists safeguarding_concern_child (
  concern_id  uuid not null references safeguarding_concern(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  studio_id   uuid not null references studio(id) on delete cascade,
  added_by    uuid references user_account(id) on delete set null,
  added_at    timestamptz not null default now(),
  primary key (concern_id, student_id)
);
create index if not exists safeguarding_concern_child_student on safeguarding_concern_child (student_id);
alter table safeguarding_concern_child enable row level security;
alter table safeguarding_concern_child force row level security;
grant all on safeguarding_concern_child to service_role;

-- The subject of an allegation never reads it: by their staff record or,
-- for office staff and owners with none, by their login.
create or replace function app.can_read_concern(p_concern uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from safeguarding_concern c
                  where c.id = p_concern and app.is_safeguarding_lead(c.studio_id)
                    and c.subject_user_id is distinct from auth.uid()
                    and not exists (select 1 from staff_member sm where sm.id = c.subject_staff_id and sm.user_id = auth.uid()));
$$;

-- Who reads concerns here, for the raise form and the receipt. Any member of
-- staff may ask: it names the lead, the deputy and the owners, and the route
-- outside the app.
create or replace function app.concern_routing(p_studio uuid) returns jsonb
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare s record;
begin
  if not app.is_staff(p_studio) then return null; end if;
  select st.dsl_user_id, st.dsl_deputy_user_id, st.safeguarding_outside_route into s from studio st where st.id = p_studio;
  return jsonb_build_object(
    'lead', (select jsonb_build_object('user_id', u.id, 'name', u.full_name) from user_account u
              where u.id = s.dsl_user_id and app.staff_user_live(u.id, p_studio)),
    'deputy', (select jsonb_build_object('user_id', u.id, 'name', u.full_name) from user_account u
              where u.id = s.dsl_deputy_user_id and app.staff_user_live(u.id, p_studio)),
    'owners', coalesce((select jsonb_agg(jsonb_build_object('user_id', u.id, 'name', u.full_name) order by u.full_name)
              from membership m join user_account u on u.id = m.user_id
             where m.studio_id = p_studio and m.role = 'owner' and m.deleted_at is null), '[]'::jsonb),
    'outside_route', nullif(btrim(coalesce(s.safeguarding_outside_route, '')), ''));
end $$;

-- Everyone on the staff, for the allegation picker and staff checks: each
-- login with a staff role (owner, office, teacher), plus timetable-only
-- teachers with no login. One row per person.
create or replace function app.safeguarding_staff(p_studio uuid)
  returns table (staff_id uuid, user_id uuid, name text, role text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_staff(p_studio) then return; end if;
  return query
  with logins as (
    select distinct on (m.user_id) m.user_id, u.full_name, m.role::text as role
      from membership m join user_account u on u.id = m.user_id
     where m.studio_id = p_studio and m.deleted_at is null and m.role in ('owner', 'admin', 'teacher')
     order by m.user_id, case m.role when 'owner' then 1 when 'admin' then 2 else 3 end)
  select (select sm.id from staff_member sm where sm.studio_id = p_studio and sm.user_id = l.user_id
             and sm.deleted_at is null order by (sm.status = 'active') desc, sm.created_at limit 1),
         l.user_id, coalesce((select sm.display_name from staff_member sm where sm.studio_id = p_studio and sm.user_id = l.user_id
             and sm.deleted_at is null and sm.status = 'active' limit 1), l.full_name), l.role
    from logins l
  union all
  select sm.id, null::uuid, sm.display_name, 'teacher'
    from staff_member sm
   where sm.studio_id = p_studio and sm.deleted_at is null and sm.status = 'active' and sm.user_id is null
   order by 3;
end $$;

-- Raise a concern. Returns the receipt: who was told, who was not and why,
-- and the route outside the app. p_subject_user names a member of staff by
-- login (office staff and owners have no timetable record).
create or replace function app.record_concern(
  p_studio uuid, p_subject_kind text, p_student uuid, p_staff uuid, p_subject_user uuid, p_subject_text text,
  p_category text, p_summary text, p_immediate boolean default false, p_children uuid[] default null) returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; cid uuid; subject_user uuid; subject_staff uuid; is_alleg boolean := false; t text;
        st record; told uuid[] := '{}'; not_told jsonb := '[]'::jsonb; u record; kid uuid; note text;
        lead_ok boolean; deputy_ok boolean; route text;
begin
  if p_subject_kind = 'child' then
    select studio_id into sid from student where id = p_student and deleted_at is null;
  elsif p_subject_kind = 'staff' then
    is_alleg := true;
    if p_staff is not null then
      select studio_id, user_id, id into sid, subject_user, subject_staff from staff_member where id = p_staff and deleted_at is null;
    elsif p_subject_user is not null and app.staff_user_live(p_subject_user, p_studio) then
      sid := p_studio; subject_user := p_subject_user;
      select id into subject_staff from staff_member where studio_id = p_studio and user_id = p_subject_user and deleted_at is null
       order by (status = 'active') desc limit 1;
    end if;
  elsif p_subject_kind = 'adult' then
    sid := p_studio;
    if length(btrim(coalesce(p_subject_text, ''))) < 2 then
      raise exception 'INVALID: say who the concern is about' using errcode = 'check_violation';
    end if;
  else
    raise exception 'INVALID: unknown subject' using errcode = 'check_violation';
  end if;
  if sid is null or not app.is_staff(sid) then
    raise exception 'FORBIDDEN: staff raise concerns at their own school' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(length(btrim(p_summary)), 0) < 10 then
    raise exception 'INVALID: say what happened' using errcode = 'check_violation';
  end if;

  select s.dsl_user_id, s.dsl_deputy_user_id, nullif(btrim(coalesce(s.safeguarding_outside_route, '')), '') as route
    into st from studio s where s.id = sid;
  route := st.route;
  lead_ok := app.staff_user_live(st.dsl_user_id, sid);
  deputy_ok := app.staff_user_live(st.dsl_deputy_user_id, sid);

  insert into safeguarding_concern (studio_id, student_id, raised_by, category, summary, immediate_risk,
                                    subject_kind, subject_staff_id, subject_user_id, subject_text, allegation)
  values (sid, case when p_subject_kind = 'child' then p_student end, auth.uid(),
          case when is_alleg and coalesce(p_category, 'other') in ('other', 'wellbeing') then 'allegation' else coalesce(p_category, 'other') end,
          btrim(p_summary), coalesce(p_immediate, false),
          p_subject_kind, subject_staff, subject_user, nullif(btrim(p_subject_text), ''), is_alleg)
  returning id into cid;

  -- The children involved in a concern about an adult or a member of staff.
  if p_subject_kind <> 'child' and p_children is not null then
    foreach kid in array p_children loop
      if not exists (select 1 from student s where s.id = kid and s.studio_id = sid and s.deleted_at is null) then
        raise exception 'INVALID: that child is not at this school' using errcode = 'check_violation';
      end if;
      insert into safeguarding_concern_child (concern_id, student_id, studio_id, added_by) values (cid, kid, sid, auth.uid())
      on conflict do nothing;
    end loop;
  end if;

  t := case when is_alleg then 'Allegation about a member of staff: follow the LADO process'
            when p_immediate then 'URGENT safeguarding concern raised' else 'Safeguarding concern raised' end;
  if is_alleg and p_immediate then t := 'URGENT allegation about a member of staff: follow the LADO process'; end if;

  -- Readers: the lead, the deputy and the owners, never the subject. The
  -- notification names nobody.
  for u in
    select x.user_id, x.part, ua.full_name from (
      select st.dsl_user_id as user_id, 'lead'::text as part, 1 as o where lead_ok
      union all select st.dsl_deputy_user_id, 'deputy', 2 where deputy_ok
      union all select m.user_id, 'owner', 3 from membership m where m.studio_id = sid and m.role = 'owner' and m.deleted_at is null) x
    join user_account ua on ua.id = x.user_id
    order by x.o
  loop
    if u.user_id = any(told) then continue; end if;
    if u.user_id is not distinct from subject_user then
      not_told := not_told || jsonb_build_object('name', u.full_name, 'part', u.part, 'why', 'subject');
      continue;
    end if;
    told := told || u.user_id;
    perform app.notify_user(sid, u.user_id, 'safeguarding', t, 'Open the safeguarding log to read it.', '/safeguarding');
  end loop;

  note := case
    when cardinality(told) = 0 then 'Nobody in the school was told: there is no other safeguarding lead, deputy or owner who may read it. The person who raised it was shown the route outside the app.'
    when not lead_ok and not deputy_ok then 'No safeguarding lead named: sent to the owner.'
    else null end;
  if jsonb_array_length(not_told) > 0 then
    note := coalesce(note || ' ', '') || 'Not told, because it is about them: '
            || (select string_agg(e ->> 'name', ', ') from jsonb_array_elements(not_told) e) || '.';
  end if;
  update safeguarding_concern set told_user_ids = told, routing_note = note where id = cid;
  insert into safeguarding_access (studio_id, user_id, concern_id, what)
  values (sid, auth.uid(), cid, case when cardinality(told) = 0 then 'raised a concern that nobody in the school could be told about'
                                     else 'raised a concern' end);

  return jsonb_build_object(
    'id', cid,
    'told', coalesce((select jsonb_agg(jsonb_build_object('name', ua.full_name,
                 'part', case when ua.id = st.dsl_user_id and lead_ok then 'lead' when ua.id = st.dsl_deputy_user_id and deputy_ok then 'deputy' else 'owner' end)
                 order by array_position(told, ua.id))
               from user_account ua where ua.id = any(told)), '[]'::jsonb),
    'not_told', not_told,
    'no_lead', not lead_ok and not deputy_ok,
    'nobody', cardinality(told) = 0,
    'outside_route', route);
end $$;

-- As 0047, now through record_concern.
create or replace function app.raise_concern_about(
  p_studio uuid, p_subject_kind text, p_student uuid, p_staff uuid, p_subject_text text,
  p_category text, p_summary text, p_immediate boolean default false) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  return (app.record_concern(p_studio, p_subject_kind, p_student, p_staff, null, p_subject_text,
                             p_category, p_summary, p_immediate, null) ->> 'id')::uuid;
end $$;

-- The lead adds or removes a child involved, later.
create or replace function app.link_concern_child(p_concern uuid, p_student uuid, p_linked boolean default true) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from safeguarding_concern where id = p_concern;
  if sid is null or not app.can_read_concern(p_concern) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner change a concern' using errcode = 'insufficient_privilege';
  end if;
  if p_linked then
    if not exists (select 1 from student s where s.id = p_student and s.studio_id = sid and s.deleted_at is null) then
      raise exception 'INVALID: that child is not at this school' using errcode = 'check_violation';
    end if;
    insert into safeguarding_concern_child (concern_id, student_id, studio_id, added_by) values (p_concern, p_student, sid, auth.uid())
    on conflict do nothing;
    insert into safeguarding_access (studio_id, user_id, concern_id, what) values (sid, auth.uid(), p_concern, 'linked a child to the concern');
  else
    delete from safeguarding_concern_child where concern_id = p_concern and student_id = p_student;
    insert into safeguarding_access (studio_id, user_id, concern_id, what) values (sid, auth.uid(), p_concern, 'unlinked a child from the concern');
  end if;
end $$;

-- A child's concerns, for the child's record: their own and those they are
-- named in. Lead and owner only (nothing for anyone else), and logged.
create or replace function app.child_concerns(p_student uuid)
  returns table (concern_id uuid, created_at timestamptz, subject_kind text, subject_name text, category text,
                 status text, allegation boolean, linked boolean)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select s.studio_id into sid from student s where s.id = p_student;
  if sid is null or not app.is_safeguarding_lead(sid) then return; end if;
  insert into safeguarding_access (studio_id, user_id, what) values (sid, auth.uid(), 'viewed a child’s concerns');
  return query
  select c.id, c.created_at, c.subject_kind,
         case c.subject_kind when 'child' then s.first_name || ' ' || s.last_name
              when 'staff' then coalesce(sm.display_name, su.full_name, 'Member of staff')
              else coalesce(c.subject_text, 'An adult') end,
         c.category, c.status, c.allegation, c.student_id is distinct from p_student
    from safeguarding_concern c
    left join student s on s.id = c.student_id
    left join staff_member sm on sm.id = c.subject_staff_id
    left join user_account su on su.id = c.subject_user_id
   where c.studio_id = sid
     and (c.student_id = p_student or exists (select 1 from safeguarding_concern_child cc where cc.concern_id = c.id and cc.student_id = p_student))
     and app.can_read_concern(c.id)
   order by c.created_at desc;
end $$;

-- The log, as 0047, plus the children involved and how it was routed.
drop function if exists app.safeguarding_log(uuid, uuid);
create function app.safeguarding_log(p_studio uuid, p_opening uuid default null)
  returns table (id uuid, student_name text, category text, summary text, immediate_risk boolean, status text,
                 raised_by text, created_at timestamptz, actions int, subject_kind text, subject_name text,
                 allegation boolean, student_id uuid, children text, routing_note text)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_safeguarding_lead(p_studio) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner can read concerns' using errcode = 'insufficient_privilege';
  end if;
  if p_opening is null or not exists (select 1 from safeguarding_access a where a.user_id = auth.uid() and a.opening = p_opening
                                                                          and a.what = 'viewed the log') then
    insert into safeguarding_access (studio_id, user_id, what, opening) values (p_studio, auth.uid(), 'viewed the log', p_opening);
  end if;
  return query
  select c.id, s.first_name || ' ' || s.last_name, c.category, c.summary, c.immediate_risk, c.status,
         coalesce(u.full_name, 'Unknown'), c.created_at, (select count(*)::int from safeguarding_action a where a.concern_id = c.id),
         c.subject_kind,
         case c.subject_kind when 'child' then s.first_name || ' ' || s.last_name
                             when 'staff' then coalesce(sm.display_name, su.full_name, c.subject_text, 'Member of staff')
                             else coalesce(c.subject_text, 'An adult') end,
         c.allegation, c.student_id,
         (select string_agg(k.first_name || ' ' || k.last_name, ', ' order by k.first_name, k.last_name)
            from safeguarding_concern_child cc join student k on k.id = cc.student_id where cc.concern_id = c.id),
         c.routing_note
    from safeguarding_concern c left join student s on s.id = c.student_id left join user_account u on u.id = c.raised_by
    left join staff_member sm on sm.id = c.subject_staff_id
    left join user_account su on su.id = c.subject_user_id
   where c.studio_id = p_studio
     and c.subject_user_id is distinct from auth.uid()
     and (sm.user_id is null or sm.user_id <> auth.uid())
   order by (c.status = 'closed'), c.immediate_risk desc, c.created_at desc;
end $$;

-- A lead named after a concern nobody could be told about is told it waits.
create or replace function app.tell_new_lead(p_studio uuid, p_user uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare n int;
begin
  if p_user is null then return; end if;
  select count(*)::int into n from safeguarding_concern c
   where c.studio_id = p_studio and c.status <> 'closed' and cardinality(c.told_user_ids) = 0
     and c.subject_user_id is distinct from p_user
     and not exists (select 1 from staff_member sm where sm.id = c.subject_staff_id and sm.user_id = p_user);
  if n > 0 then
    perform app.notify_user(p_studio, p_user, 'safeguarding',
      n || case when n = 1 then ' concern was' else ' concerns were' end || ' recorded when nobody could be told',
      'Open the safeguarding log to read and act on it.', '/safeguarding');
    update safeguarding_concern c set told_user_ids = c.told_user_ids || p_user
     where c.studio_id = p_studio and c.status <> 'closed' and cardinality(c.told_user_ids) = 0
       and c.subject_user_id is distinct from p_user
       and not exists (select 1 from staff_member sm where sm.id = c.subject_staff_id and sm.user_id = p_user);
  end if;
end $$;

-- As 0030, plus telling the new lead what is waiting.
create or replace function app.set_safeguarding_lead(p_user uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select m.studio_id into sid from membership m where m.user_id = auth.uid() and m.role = 'owner' and m.deleted_at is null limit 1;
  if sid is null then raise exception 'FORBIDDEN: only the owner names the safeguarding lead' using errcode = 'insufficient_privilege'; end if;
  if p_user is not null and not app.staff_user_live(p_user, sid) then
    raise exception 'INVALID: the lead must be a member of staff' using errcode = 'check_violation';
  end if;
  update studio set dsl_user_id = p_user,
         dsl_deputy_user_id = case when dsl_deputy_user_id = p_user then null else dsl_deputy_user_id end,
         updated_at = now() where id = sid;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'update', 'studio', sid, 'Safeguarding lead changed');
  perform app.tell_new_lead(sid, p_user);
end $$;

create or replace function app.set_safeguarding_deputy(p_user uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select m.studio_id into sid from membership m where m.user_id = auth.uid() and m.role = 'owner' and m.deleted_at is null limit 1;
  if sid is null then raise exception 'FORBIDDEN: only the owner names the deputy safeguarding lead' using errcode = 'insufficient_privilege'; end if;
  if p_user is not null and not app.staff_user_live(p_user, sid) then
    raise exception 'INVALID: the deputy must be a member of staff' using errcode = 'check_violation';
  end if;
  if p_user is not null and exists (select 1 from studio where id = sid and dsl_user_id = p_user) then
    raise exception 'INVALID: the deputy must be someone other than the lead' using errcode = 'check_violation';
  end if;
  update studio set dsl_deputy_user_id = p_user, updated_at = now() where id = sid;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'update', 'studio', sid, 'Deputy safeguarding lead changed');
  perform app.tell_new_lead(sid, p_user);
end $$;

-- The owner or the lead records how to reach the LADO / local authority.
create or replace function app.set_safeguarding_outside_route(p_studio uuid, p_route text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_safeguarding_lead(p_studio) then
    raise exception 'FORBIDDEN: only the owner and the safeguarding lead change this' using errcode = 'insufficient_privilege';
  end if;
  update studio set safeguarding_outside_route = nullif(btrim(coalesce(p_route, '')), ''), updated_at = now() where id = p_studio;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (p_studio, auth.uid(), 'update', 'studio', p_studio, 'Safeguarding contact outside the school changed');
end $$;

-- ── Staff checks for everyone on the staff ─────────────────────────────────
alter table staff_check alter column staff_id drop not null;
alter table staff_check add column if not exists user_id uuid references user_account(id) on delete cascade;
alter table staff_check drop constraint if exists staff_check_person;
alter table staff_check add constraint staff_check_person check (staff_id is not null or user_id is not null);
create index if not exists staff_check_user on staff_check (user_id) where user_id is not null;

-- As 0030: the school comes from the staff record or, for someone with only a
-- login, from the studio_id given, which must be a school they are staff at.
create or replace function app.staff_check_stamp() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.staff_id is not null then
    select studio_id into new.studio_id from staff_member where id = new.staff_id;
  elsif (tg_op = 'INSERT' or new.user_id is distinct from old.user_id or new.studio_id is distinct from old.studio_id)
        and (new.studio_id is null or not app.staff_user_live(new.user_id, new.studio_id)) then
    raise exception 'INVALID: record checks for a member of staff at this school' using errcode = 'check_violation';
  end if;
  if tg_op = 'UPDATE' and new.expires_on is distinct from old.expires_on then new.reminded_at := null; end if;
  return new;
end $$;

-- As 0047, for every person from app.safeguarding_staff; user_id is new.
drop function if exists app.staff_check_summary(uuid);
create function app.staff_check_summary(p_studio uuid)
  returns table (staff_id uuid, name text, dbs_expires date, issue text, due date, user_id uuid)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if not (app.is_admin(p_studio) or app.is_safeguarding_lead(p_studio)) then return; end if;
  return query
  with people as (select * from app.safeguarding_staff(p_studio)),
  latest as (
    select distinct on (p.name, p.staff_id, p.user_id, k.kind) p.staff_id as sid, p.user_id as uid, k.kind, k.checked_on, k.expires_on
      from people p join staff_check k on k.studio_id = p_studio and k.deleted_at is null
                                      and (k.staff_id = p.staff_id or (p.user_id is not null and k.user_id = p.user_id))
     order by p.name, p.staff_id, p.user_id, k.kind, k.checked_on desc, k.created_at desc)
  select p.staff_id, p.name, d.expires_on,
         case when d.kind is null then 'No DBS on file'
              when d.expires_on is not null and d.expires_on < current_date then 'DBS expired'
              when soon.kind is not null then
                case when soon.expires_on < current_date then 'Expired: ' else 'Expires soon: ' end ||
                case soon.kind when 'dbs' then 'DBS' when 'safeguarding_training' then 'safeguarding training'
                               when 'first_aid' then 'first aid' else 'a check' end
         end,
         coalesce(case when d.expires_on < current_date then d.expires_on end, soon.expires_on),
         p.user_id
    from people p
    left join latest d on d.sid is not distinct from p.staff_id and d.uid is not distinct from p.user_id and d.kind = 'dbs'
    left join lateral (select l.kind, l.expires_on from latest l
                        where l.sid is not distinct from p.staff_id and l.uid is not distinct from p.user_id
                          and l.expires_on is not null and l.expires_on <= current_date + 30
                        order by l.expires_on limit 1) soon on true
   order by (d.kind is null) desc, coalesce(soon.expires_on, d.expires_on) nulls last, p.name;
end $$;

-- As 0047, for checks recorded against a login too, and telling the deputy.
create or replace function app.remind_staff_checks(p_studio uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c record; n int := 0; u uuid;
begin
  if auth.uid() is not null and not app.is_staff(p_studio) then return 0; end if;
  for c in select k.*, coalesce(sm.display_name, ua.full_name, 'A member of staff') as display_name
             from staff_check k
             left join staff_member sm on sm.id = k.staff_id
             left join user_account ua on ua.id = k.user_id
            where k.studio_id = p_studio and k.deleted_at is null and k.reminded_at is null
              and k.expires_on is not null and k.expires_on <= current_date + 30
              and (case when k.staff_id is not null then sm.deleted_at is null and sm.status = 'active'
                        else app.staff_user_live(k.user_id, p_studio) end)
              and not exists (select 1 from staff_check newer
                               where newer.kind = k.kind and newer.deleted_at is null and newer.checked_on > k.checked_on
                                 and (newer.staff_id = k.staff_id or newer.user_id = k.user_id)) loop
    for u in select distinct x from (select m.user_id x from membership m where m.studio_id = p_studio and m.role = 'owner' and m.deleted_at is null
                                     union select s.dsl_user_id from studio s where s.id = p_studio
                                     union select s.dsl_deputy_user_id from studio s where s.id = p_studio) y where x is not null loop
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

-- ── 5. Referrals and the chronology (F13) ──────────────────────────────────
alter table safeguarding_action add column if not exists referred_to text;
alter table safeguarding_action add column if not exists referred_on date;
alter table safeguarding_action add column if not exists referral_ref text;
alter table safeguarding_action add column if not exists outcome text;

create or replace function app.record_concern_action(p_concern uuid, p_note text, p_status text default null,
  p_referred_to text default null, p_referred_on date default null, p_referral_ref text default null, p_outcome text default null)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from safeguarding_concern where id = p_concern;
  if sid is null or not app.can_read_concern(p_concern) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner act on concerns' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(btrim(p_note), '') = '' then raise exception 'INVALID: record what was done' using errcode = 'check_violation'; end if;
  if p_status is not null and p_status not in ('open', 'monitoring', 'referred', 'closed') then
    raise exception 'INVALID: unknown status' using errcode = 'check_violation';
  end if;
  if p_status = 'referred' and coalesce(btrim(p_referred_to), '') = '' then
    raise exception 'INVALID: say who it was referred to' using errcode = 'check_violation';
  end if;
  if p_referred_on is not null and p_referred_on > current_date then
    raise exception 'INVALID: the referral date cannot be in the future' using errcode = 'check_violation';
  end if;
  -- clock_timestamp: two actions in one transaction still keep their order.
  insert into safeguarding_action (concern_id, by_user, note, status_to, referred_to, referred_on, referral_ref, outcome, at)
  values (p_concern, auth.uid(), btrim(p_note), p_status, nullif(btrim(p_referred_to), ''),
          case when nullif(btrim(p_referred_to), '') is not null then coalesce(p_referred_on, current_date) end,
          nullif(btrim(p_referral_ref), ''), nullif(btrim(p_outcome), ''), clock_timestamp());
  if p_status is not null then update safeguarding_concern set status = p_status, updated_at = now() where id = p_concern; end if;
  insert into safeguarding_access (studio_id, user_id, concern_id, what) values (sid, auth.uid(), p_concern, 'recorded an action');
end $$;

create or replace function app.safeguarding_act(p_concern uuid, p_note text, p_status text default null) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  perform app.record_concern_action(p_concern, p_note, p_status, case when p_status = 'referred' then 'Not recorded' end);
end $$;

-- As 0047, plus the referral fields.
drop function if exists app.safeguarding_actions(uuid, uuid);
create function app.safeguarding_actions(p_concern uuid, p_opening uuid default null)
  returns table (note text, status_to text, by_name text, at timestamptz,
                 referred_to text, referred_on date, referral_ref text, outcome text)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select c.studio_id into sid from safeguarding_concern c where c.id = p_concern;
  if sid is null or not app.can_read_concern(p_concern) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner can read concerns' using errcode = 'insufficient_privilege';
  end if;
  if p_opening is null or not exists (select 1 from safeguarding_access a where a.user_id = auth.uid() and a.opening = p_opening
                                                                          and a.concern_id = p_concern) then
    insert into safeguarding_access (studio_id, user_id, concern_id, what, opening) values (sid, auth.uid(), p_concern, 'opened a concern', p_opening);
  end if;
  return query select a.note, a.status_to, coalesce(u.full_name, 'Unknown'), a.at, a.referred_to, a.referred_on, a.referral_ref, a.outcome
    from safeguarding_action a left join user_account u on u.id = a.by_user where a.concern_id = p_concern order by a.at;
end $$;

-- One concern, in order, for printing or export. p_purpose: 'view' (the
-- print page opened), 'print' or 'export'. Each is logged.
create or replace function app.concern_chronology(p_concern uuid, p_purpose text default 'view') returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; out jsonb;
begin
  select c.studio_id into sid from safeguarding_concern c where c.id = p_concern;
  if sid is null or not app.can_read_concern(p_concern) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner can read concerns' using errcode = 'insufficient_privilege';
  end if;
  if p_purpose not in ('view', 'print', 'export') then
    raise exception 'INVALID: unknown purpose' using errcode = 'check_violation';
  end if;
  insert into safeguarding_access (studio_id, user_id, concern_id, what)
  values (sid, auth.uid(), p_concern, case p_purpose when 'print' then 'printed the chronology'
                                                    when 'export' then 'exported the chronology'
                                                    else 'opened the chronology to print' end);
  select jsonb_build_object(
    'id', c.id, 'reference', upper(left(c.id::text, 8)),
    'school', st.name,
    'prepared_at', now(), 'prepared_by', (select full_name from user_account where id = auth.uid()),
    'created_at', c.created_at, 'status', c.status, 'category', c.category, 'immediate_risk', c.immediate_risk,
    'allegation', c.allegation, 'subject_kind', c.subject_kind,
    'subject', case c.subject_kind when 'child' then s.first_name || ' ' || s.last_name
                    when 'staff' then coalesce(sm.display_name, su.full_name, c.subject_text, 'Member of staff')
                    else coalesce(c.subject_text, 'An adult') end,
    'children', coalesce((select jsonb_agg(k.first_name || ' ' || k.last_name order by k.first_name, k.last_name)
                   from safeguarding_concern_child cc join student k on k.id = cc.student_id where cc.concern_id = c.id), '[]'::jsonb),
    'raised_by', ru.full_name, 'summary', c.summary, 'routing_note', c.routing_note,
    'hold', (select jsonb_build_object('reason', h.reason, 'set_at', h.set_at, 'review_on', h.review_on)
               from safeguarding_concern_hold h where h.concern_id = c.id),
    'actions', coalesce((select jsonb_agg(jsonb_build_object('at', a.at, 'by', au.full_name, 'note', a.note, 'status_to', a.status_to,
                   'referred_to', a.referred_to, 'referred_on', a.referred_on, 'referral_ref', a.referral_ref, 'outcome', a.outcome) order by a.at)
                 from safeguarding_action a left join user_account au on au.id = a.by_user where a.concern_id = c.id), '[]'::jsonb))
    into out
    from safeguarding_concern c join studio st on st.id = c.studio_id
    left join student s on s.id = c.student_id
    left join staff_member sm on sm.id = c.subject_staff_id
    left join user_account su on su.id = c.subject_user_id
    left join user_account ru on ru.id = c.raised_by
   where c.id = p_concern;
  return out;
end $$;

-- ── 7. Hold review dates ───────────────────────────────────────────────────
alter table safeguarding_hold add column if not exists review_on date not null default (current_date + 365);
alter table safeguarding_concern_hold add column if not exists review_on date not null default (current_date + 365);

-- Every hold the caller may see, with its review date. Lead and owner.
create or replace function app.hold_reviews(p_studio uuid)
  returns table (hold_kind text, id uuid, name text, reason text, set_at timestamptz, review_on date, due boolean)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_safeguarding_lead(p_studio) then return; end if;
  return query
  select 'child'::text, h.student_id, s.first_name || ' ' || s.last_name, h.reason, h.set_at, h.review_on, h.review_on <= current_date
    from safeguarding_hold h join student s on s.id = h.student_id where h.studio_id = p_studio
  union all
  select 'concern', h.concern_id, 'Concern ' || upper(left(h.concern_id::text, 8)), h.reason, h.set_at, h.review_on, h.review_on <= current_date
    from safeguarding_concern_hold h where h.studio_id = p_studio and app.can_read_concern(h.concern_id)
  order by 6, 5;
end $$;

-- The lead reviews a hold: keep it, with the next review date. Logged.
create or replace function app.review_hold(p_kind text, p_id uuid, p_next date) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  if p_next is null or p_next <= current_date or p_next > current_date + 365 * 5 then
    raise exception 'INVALID: choose the next review date, within five years' using errcode = 'check_violation';
  end if;
  if p_kind = 'child' then
    select studio_id into sid from safeguarding_hold where student_id = p_id;
    if sid is null or not app.is_safeguarding_lead(sid) then
      raise exception 'FORBIDDEN: only the safeguarding lead and the owner review holds' using errcode = 'insufficient_privilege';
    end if;
    update safeguarding_hold set review_on = p_next where student_id = p_id;
    insert into safeguarding_access (studio_id, user_id, what) values (sid, auth.uid(), 'reviewed a legal hold and kept it');
  elsif p_kind = 'concern' then
    select studio_id into sid from safeguarding_concern_hold where concern_id = p_id;
    if sid is null or not app.can_read_concern(p_id) then
      raise exception 'FORBIDDEN: only the safeguarding lead and the owner review holds' using errcode = 'insufficient_privilege';
    end if;
    update safeguarding_concern_hold set review_on = p_next where concern_id = p_id;
    insert into safeguarding_access (studio_id, user_id, concern_id, what) values (sid, auth.uid(), p_id, 'reviewed the legal hold on the concern and kept it');
  else
    raise exception 'INVALID: unknown hold' using errcode = 'check_violation';
  end if;
end $$;

-- ── 4. Retention holds the children linked to a kept concern ───────────────
-- As 0058, plus concerns the child is named in.
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
    when exists (select 1 from safeguarding_concern_child cc join safeguarding_concern c on c.id = cc.concern_id
                  where cc.student_id = p_student
                    and (c.status <> 'closed'
                         or exists (select 1 from safeguarding_concern_hold h where h.concern_id = c.id)
                         or p_concern_months is null or c.updated_at >= now() - make_interval(months => p_concern_months)))
      then 'Named in a safeguarding concern still kept'
  end;
$$;

-- Access-log rows of a deleted allegation stay hidden from its subject, also
-- when the subject is office staff or an owner with no staff record.
create or replace function app.concern_delete_detach() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if old.subject_user_id is not null then
    update safeguarding_access set concern_subject_user = old.subject_user_id
     where (concern_id = old.id or deleted_concern_id = old.id) and concern_subject_user is null;
  end if;
  return old;
end $$;
drop trigger if exists concern_delete_detach on safeguarding_concern;
create trigger concern_delete_detach before delete on safeguarding_concern
  for each row execute function app.concern_delete_detach();

-- Checks recorded against a login, once that person has left the staff
-- (no live staff role here): references cleared, then the checks deleted,
-- on the same periods as staff records (0058). Anyone a concern is about is
-- kept while it is. The 0059 run is kept under a new name and wrapped.
alter function app.retention_run(uuid, boolean, text[], timestamptz) rename to retention_run_media;

create or replace function app.retention_run(p_studio uuid, p_apply boolean, p_only text[] default null,
                                             p_as_of timestamptz default now())
  returns table (step text, student_id uuid, who text, left_on date, reason text, entity_id uuid)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare pol retention_policy; r record; d_del boolean; d_ref boolean;
begin
  return query select * from app.retention_run_media(p_studio, p_apply, p_only, p_as_of);

  select * into pol from retention_policy rp where rp.studio_id = p_studio;
  if pol.studio_id is null then return; end if;
  for r in
    select k.user_id, coalesce(u.full_name, 'Former member of staff') as name,
           (select max(m.deleted_at) from membership m where m.studio_id = p_studio and m.user_id = k.user_id
               and m.role in ('owner', 'admin', 'teacher'))::date as gone,
           bool_or(k.reference is not null or k.note is not null) as has_ref,
           exists (select 1 from safeguarding_concern c where c.studio_id = p_studio and c.subject_user_id = k.user_id) as has_concern
      from staff_check k left join user_account u on u.id = k.user_id
     where k.studio_id = p_studio and k.staff_id is null and k.user_id is not null
       and not app.staff_user_live(k.user_id, p_studio)
     group by k.user_id, u.full_name
  loop
    continue when r.gone is null;
    d_del := r.gone < current_date - make_interval(months => pol.staff_months);
    d_ref := r.has_ref and r.gone < current_date - make_interval(months => pol.staff_check_months);
    continue when not (d_del or d_ref);
    student_id := null; who := r.name; left_on := r.gone; entity_id := r.user_id; reason := null;
    if r.has_concern then
      step := 'held'; reason := 'Safeguarding record about this member of staff still kept'; return next; reason := null; continue;
    end if;
    if d_del then
      continue when p_only is not null and not app.retention_key('staff', r.user_id) = any(p_only);
      step := 'staff'; return next;
      if p_apply then
        delete from staff_check k where k.studio_id = p_studio and k.staff_id is null and k.user_id = r.user_id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'staff_check', r.user_id, 'Staff checks deleted: left ' || r.gone);
      end if;
    else
      continue when p_only is not null and not app.retention_key('staff_check', r.user_id) = any(p_only);
      step := 'staff_check'; return next;
      if p_apply then
        update staff_check k set reference = null, note = null where k.studio_id = p_studio and k.staff_id is null and k.user_id = r.user_id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'staff_check', r.user_id, 'Check references cleared: left ' || r.gone);
      end if;
    end if;
  end loop;
end $$;

-- ── 6. Outside links for media of children ─────────────────────────────────
-- With the setting on (the default), material marked as showing children
-- cannot be added as a link, or have its link changed: upload the file.
-- Server jobs (no signed-in user) are trusted, as elsewhere.
create or replace function app.child_media_link_guard() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if auth.uid() is not null and new.shows_children and new.url is not null
     and (tg_op = 'INSERT' or new.url is distinct from old.url)
     and coalesce((select s.block_child_media_links from studio s where s.id = new.studio_id), true) then
    raise exception 'FORBIDDEN: material that shows children cannot be a link to another site. Upload the file instead, so only the families allowed can see it.'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end $$;
drop trigger if exists child_media_link_guard on resource;
create trigger child_media_link_guard before insert or update of url, shows_children on resource
  for each row execute function app.child_media_link_guard();

-- As 0057, plus: while the setting is on, an outside link that shows children
-- never reaches families or students.
create or replace function app.resource_family_visible(p_resource uuid) returns boolean
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare r record; named int;
begin
  select res.id, res.kind, res.shows_children, res.no_identifiable_children, res.url, s.block_child_media_links as blocked
    into r from resource res join studio s on s.id = res.studio_id where res.id = p_resource;
  if r.id is null then return false; end if;
  if not r.shows_children then return true; end if;
  if r.url is not null and r.blocked then return false; end if;
  select count(*) into named from resource_child rc where rc.resource_id = p_resource;
  if named = 0 then return r.no_identifiable_children; end if;
  return not exists (
    select 1 from resource_child rc
     where rc.resource_id = p_resource
       and coalesce((select e.granted from app.consent_effective(rc.student_id, app.media_consent_kind(r.kind)) e), false) is not true);
end $$;

-- For the office and the lead: outside links marked as showing children.
create or replace function app.child_media_links(p_studio uuid)
  returns table (id uuid, title text, kind text, url text, added_by text, created_at timestamptz, hidden boolean)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if not (app.is_admin(p_studio) or app.is_safeguarding_lead(p_studio)) then return; end if;
  return query
  select r.id, r.title, r.kind::text, r.url, coalesce(u.full_name, 'The school'), r.created_at, s.block_child_media_links
    from resource r join studio s on s.id = r.studio_id left join user_account u on u.id = r.created_by
   where r.studio_id = p_studio and r.deleted_at is null and r.shows_children and r.url is not null
   order by r.created_at desc;
end $$;

create or replace function app.set_block_child_media_links(p_studio uuid, p_block boolean) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not (app.has_role(p_studio, 'owner') or app.is_safeguarding_lead(p_studio)) then
    raise exception 'FORBIDDEN: only the owner and the safeguarding lead change this' using errcode = 'insufficient_privilege';
  end if;
  update studio set block_child_media_links = coalesce(p_block, true), updated_at = now() where id = p_studio;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (p_studio, auth.uid(), 'update', 'studio', p_studio,
          case when coalesce(p_block, true) then 'Outside links for media of children blocked'
               else 'Outside links for media of children allowed' end);
end $$;

-- ── 8. Consent snapshot for an event ───────────────────────────────────────
-- Internal: consent_effective (0047) as it stood at p_at.
create or replace function app.consent_effective_at(p_student uuid, p_kind text, p_at timestamptz)
  returns table (granted boolean, disputed boolean, changed_at timestamptz)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare fam uuid; o_granted boolean; o_at timestamptz; v record; n_yes int := 0; n_no int := 0; latest timestamptz;
begin
  select s.family_id into fam from student s where s.id = p_student;
  select c.granted, c.granted_at into o_granted, o_at from consent_record c
   where c.student_id = p_student and c.kind::text = p_kind and c.deleted_at is null and c.granted_at <= p_at
     and (c.expires_at is null or c.expires_at > p_at)
     and (c.granted_by is null or c.granted_by not in
            (select g.user_id from guardian g where g.family_id = fam and g.user_id is not null and g.deleted_at is null))
   order by c.granted_at desc, c.created_at desc limit 1;
  for v in select distinct on (c.granted_by) c.granted_by, c.granted, c.granted_at from consent_record c
            where c.student_id = p_student and c.kind::text = p_kind and c.deleted_at is null and c.granted_at <= p_at
              and (c.expires_at is null or c.expires_at > p_at)
              and c.granted_by in (select g.user_id from guardian g where g.family_id = fam and g.user_id is not null and g.deleted_at is null)
              and c.granted_at > coalesce(o_at, '-infinity'::timestamptz)
            order by c.granted_by, c.granted_at desc, c.created_at desc loop
    if v.granted then n_yes := n_yes + 1; else n_no := n_no + 1; end if;
    latest := greatest(latest, v.granted_at);
  end loop;
  if n_yes + n_no = 0 then
    granted := o_granted; disputed := false; changed_at := o_at;
  else
    granted := n_no = 0; disputed := n_yes > 0 and n_no > 0; changed_at := latest;
  end if;
  return next;
end $$;

-- Everyone invited to or going to an event, with photo, video and social
-- media consent as at p_as_of (now if empty or in the future). The office,
-- the lead and the event's own teacher. Not answered = null = not allowed.
create or replace function app.event_consent_snapshot(p_event uuid, p_as_of timestamptz default null)
  returns table (student_id uuid, name text, class_name text, participation text,
                 photography boolean, video boolean, social_media boolean, disputed boolean, as_of timestamptz)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare ev record; at_ts timestamptz := least(coalesce(p_as_of, now()), now());
begin
  select e.id, e.studio_id, sm.user_id as teacher_user into ev
    from studio_event e left join staff_member sm on sm.id = e.teacher_id where e.id = p_event and e.deleted_at is null;
  if ev.id is null or app.is_support_viewer(ev.studio_id)
     or not (app.is_admin(ev.studio_id) or app.is_safeguarding_lead(ev.studio_id)
             or (ev.teacher_user = auth.uid() and app.is_staff(ev.studio_id))) then
    raise exception 'FORBIDDEN: the office, the safeguarding lead and the event’s teacher see this list' using errcode = 'insufficient_privilege';
  end if;
  return query
  select s.id, s.first_name || ' ' || s.last_name, cl.name, ep.status::text,
         ph.granted, vd.granted, so.granted, coalesce(ph.disputed or vd.disputed or so.disputed, false), at_ts
    from event_participant ep
    join student s on s.id = ep.student_id and s.deleted_at is null
    left join class cl on cl.id = ep.invited_class_id
    left join lateral app.consent_effective_at(s.id, 'photography', at_ts) ph on true
    left join lateral app.consent_effective_at(s.id, 'video', at_ts) vd on true
    left join lateral app.consent_effective_at(s.id, 'social_media', at_ts) so on true
   where ep.event_id = p_event and ep.deleted_at is null and ep.status in ('confirmed', 'invited', 'requested')
   order by cl.name nulls last, s.last_name, s.first_name;
end $$;

-- ── The export, as 0047, plus links, routing, referrals and review dates ───
create or replace function app.safeguarding_export(p_studio uuid) returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare out jsonb;
begin
  if not app.is_safeguarding_lead(p_studio) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner export safeguarding records' using errcode = 'insufficient_privilege';
  end if;
  insert into safeguarding_access (studio_id, user_id, what) values (p_studio, auth.uid(), 'exported the safeguarding record');
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (p_studio, auth.uid(), 'export', 'safeguarding', p_studio, 'Safeguarding record exported');
  select jsonb_build_object(
    'exported_at', now(),
    'exported_by', (select full_name from user_account where id = auth.uid()),
    'concerns', coalesce((select jsonb_agg(jsonb_build_object(
        'id', c.id, 'created_at', c.created_at, 'status', c.status, 'category', c.category, 'immediate_risk', c.immediate_risk,
        'subject_kind', c.subject_kind, 'allegation', c.allegation,
        'child', case when s.id is not null then s.first_name || ' ' || s.last_name end, 'child_id', c.student_id,
        'staff_member', coalesce(sm.display_name, su.full_name), 'subject_text', c.subject_text,
        'children_involved', coalesce((select jsonb_agg(k.first_name || ' ' || k.last_name) from safeguarding_concern_child cc
                                         join student k on k.id = cc.student_id where cc.concern_id = c.id), '[]'::jsonb),
        'summary', c.summary, 'raised_by', ru.full_name, 'routing_note', c.routing_note,
        'actions', coalesce((select jsonb_agg(jsonb_build_object('at', a.at, 'by', au.full_name, 'note', a.note, 'status_to', a.status_to,
                               'referred_to', a.referred_to, 'referred_on', a.referred_on, 'referral_ref', a.referral_ref, 'outcome', a.outcome) order by a.at)
                               from safeguarding_action a left join user_account au on au.id = a.by_user where a.concern_id = c.id), '[]'::jsonb))
        order by c.created_at)
      from safeguarding_concern c left join student s on s.id = c.student_id left join staff_member sm on sm.id = c.subject_staff_id
      left join user_account su on su.id = c.subject_user_id
      left join user_account ru on ru.id = c.raised_by
     where c.studio_id = p_studio and app.can_read_concern(c.id)), '[]'::jsonb),
    'staff_checks', coalesce((select jsonb_agg(jsonb_build_object('staff_member', coalesce(sm.display_name, u.full_name), 'kind', k.kind, 'reference', k.reference,
        'checked_on', k.checked_on, 'expires_on', k.expires_on, 'note', k.note) order by coalesce(sm.display_name, u.full_name), k.checked_on)
      from staff_check k left join staff_member sm on sm.id = k.staff_id left join user_account u on u.id = k.user_id
     where k.studio_id = p_studio and k.deleted_at is null), '[]'::jsonb),
    'legal_holds', coalesce((select jsonb_agg(jsonb_build_object('child', s.first_name || ' ' || s.last_name, 'reason', h.reason, 'set_at', h.set_at, 'review_on', h.review_on))
      from safeguarding_hold h join student s on s.id = h.student_id where h.studio_id = p_studio), '[]'::jsonb),
    'concern_holds', coalesce((select jsonb_agg(jsonb_build_object('concern_id', h.concern_id, 'reason', h.reason, 'set_at', h.set_at, 'review_on', h.review_on))
      from safeguarding_concern_hold h where h.studio_id = p_studio and app.can_read_concern(h.concern_id)), '[]'::jsonb),
    'access_log', coalesce((select jsonb_agg(jsonb_build_object('at', a.at, 'who', u.full_name, 'what', a.what, 'concern_id', coalesce(a.concern_id, a.deleted_concern_id)) order by a.at, a.id)
      from safeguarding_access a left join user_account u on u.id = a.user_id
     where a.studio_id = p_studio and (a.concern_id is null or app.can_read_concern(a.concern_id))
       and (a.concern_subject_user is null or a.concern_subject_user is distinct from auth.uid())), '[]'::jsonb),
    'audit_log', coalesce((select jsonb_agg(jsonb_build_object('at', l.at, 'who', u.full_name, 'action', l.action, 'entity', l.entity,
        'entity_id', l.entity_id, 'summary', l.summary) order by l.at, l.id)
      from audit_log l left join user_account u on u.id = l.actor_id where l.studio_id = p_studio), '[]'::jsonb)
  ) into out;
  return out;
end $$;

-- ── Grants ─────────────────────────────────────────────────────────────────
revoke all on function app.staff_user_live(uuid, uuid), app.consent_effective_at(uuid, text, timestamptz),
  app.tell_new_lead(uuid, uuid), app.concern_delete_detach(), app.child_media_link_guard() from public;
revoke all on function app.retention_run_media(uuid, boolean, text[], timestamptz) from public, authenticated, anon;
revoke all on function app.retention_run(uuid, boolean, text[], timestamptz) from public, authenticated, anon;
grant execute on function app.retention_run(uuid, boolean, text[], timestamptz), app.retention_hold_reason(uuid, smallint) to service_role;
revoke all on function app.concern_routing(uuid), app.safeguarding_staff(uuid),
  app.record_concern(uuid, text, uuid, uuid, uuid, text, text, text, boolean, uuid[]),
  app.link_concern_child(uuid, uuid, boolean), app.child_concerns(uuid), app.safeguarding_log(uuid, uuid),
  app.set_safeguarding_deputy(uuid), app.set_safeguarding_outside_route(uuid, text),
  app.staff_check_summary(uuid), app.record_concern_action(uuid, text, text, text, date, text, text),
  app.safeguarding_actions(uuid, uuid), app.concern_chronology(uuid, text), app.hold_reviews(uuid), app.review_hold(text, uuid, date),
  app.child_media_links(uuid), app.set_block_child_media_links(uuid, boolean),
  app.event_consent_snapshot(uuid, timestamptz) from public;
grant execute on function app.concern_routing(uuid), app.safeguarding_staff(uuid),
  app.record_concern(uuid, text, uuid, uuid, uuid, text, text, text, boolean, uuid[]),
  app.link_concern_child(uuid, uuid, boolean), app.child_concerns(uuid), app.safeguarding_log(uuid, uuid),
  app.set_safeguarding_deputy(uuid), app.set_safeguarding_outside_route(uuid, text),
  app.staff_check_summary(uuid), app.record_concern_action(uuid, text, text, text, date, text, text),
  app.safeguarding_actions(uuid, uuid), app.concern_chronology(uuid, text), app.hold_reviews(uuid), app.review_hold(text, uuid, date),
  app.child_media_links(uuid), app.set_block_child_media_links(uuid, boolean),
  app.event_consent_snapshot(uuid, timestamptz) to authenticated;
