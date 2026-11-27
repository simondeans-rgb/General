-- ============================================================================
-- 0055 · A teacher's own week across schools (UR-47)
-- ----------------------------------------------------------------------------
-- DESIGN NOTE
--
-- Problem. A teacher who works at two schools (Priya: Northstar and Kestrel)
-- has one login but sees one school at a time (0032: app.in_scope narrows
-- every helper to the chosen school). She cannot see her week, nor clashes
-- between schools, and the office arranging cover cannot see that she is
-- teaching elsewhere.
--
-- Principle kept from 0032. No school's records reach another school. The
-- only thing that crosses is the teacher's OWN timetable, to the teacher
-- herself, and at most a "busy" time to another school's office.
--
-- What crosses, and the one way it crosses:
--   app.agenda_rows(user, from, to)   internal, never granted. The teacher's
--       own sessions (teaches, assists, or covers) at every school where she
--       is an active staff member with a live staff membership. Columns:
--       session id, school, start, end, class name, site, room, status
--       (scheduled / moved / cancelled / covered), covering, handover-present
--       flag, and the school's sharing setting. Nothing about students,
--       medical needs, attendance, families, or other teachers (a class
--       covered by someone else says only "covered", never by whom).
--   app.my_agenda(from, to)           granted; the teacher's agenda for at
--       most 35 days, rows from agenda_rows(auth.uid()) filtered by each
--       school's sharing setting, with clashes worked out in the database.
--   app.cover_clashes / cover_session the office's cover check also sees the
--       teacher's sessions at other schools, as "busy" only: no class name,
--       place, school or session id.
--   app.calendar_feed                 a staff calendar link can include all
--       schools (calendar_token.all_schools), with the same filter.
--
-- Each school's choice: studio.staff_timetable_sharing, shown when the
-- teacher is NOT looking at that school (another school is selected in the
-- switcher, or it is a calendar link made from another school):
--   'details'  class name, site and room, cancellations and moves;
--   'times'    (default) only the time, as "Busy", with the school's name;
--   'none'     nothing: the school's sessions are left out of the teacher's
--              agenda elsewhere and of other schools' cover checks.
-- Whichever school the teacher is looking at shows in full, as it already
-- does on her Today screen. With no school chosen and only one school, that
-- school is "home"; with no school chosen and several, every school's
-- setting applies.
-- Other schools' cover checks only ever see "busy", and only when the
-- setting is 'details' or 'times'.
--
-- Travel: user_account.agenda_travel_min (the teacher's own setting, default
-- 30): two sessions at different schools clash when they are closer than
-- that. Within one school, different sites use the school's
-- cover_travel_min (0048) and the same site needs none.
--
-- Opening a row switches the app to that school first (the screen does it),
-- so every other path still goes through RLS and app.in_scope unchanged.
-- ============================================================================

-- ── Settings ───────────────────────────────────────────────────────────────
alter table studio add column staff_timetable_sharing text not null default 'times'
  check (staff_timetable_sharing in ('details', 'times', 'none'));
alter table user_account add column agenda_travel_min smallint not null default 30
  check (agenda_travel_min between 0 and 240);
alter table calendar_token add column all_schools boolean not null default false;

create or replace function app.my_agenda_travel() returns int
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select agenda_travel_min::int from user_account where id = auth.uid() and deleted_at is null
$$;

create or replace function app.set_agenda_travel(p_min int) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if auth.uid() is null then raise exception 'FORBIDDEN: sign in first' using errcode = 'insufficient_privilege'; end if;
  if p_min is null or p_min < 0 or p_min > 240 then
    raise exception 'INVALID: travel time is between 0 and 240 minutes' using errcode = 'check_violation';
  end if;
  update user_account set agenda_travel_min = p_min where id = auth.uid();
end $$;

-- The school's choice; owner only.
create or replace function app.set_timetable_sharing(p_studio uuid, p_sharing text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.has_role(p_studio, 'owner') then
    raise exception 'FORBIDDEN: only the owner can change this' using errcode = 'insufficient_privilege';
  end if;
  if p_sharing is null or p_sharing not in ('details', 'times', 'none') then
    raise exception 'INVALID: choose details, times or none' using errcode = 'check_violation';
  end if;
  update studio set staff_timetable_sharing = p_sharing, updated_at = now() where id = p_studio;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (p_studio, auth.uid(), 'update', 'studio', p_studio,
          'Staff timetables shown at their other schools: ' ||
          case p_sharing when 'details' then 'class details' when 'times' then 'busy times only' else 'nothing' end);
end $$;

-- ── The one cross-school read ─────────────────────────────────────────────
-- Trusts p_user, so it is never granted: my_agenda, cover_clashes and
-- calendar_feed are the only ways in.
create or replace function app.agenda_rows(p_user uuid, p_from timestamptz, p_to timestamptz)
  returns table (session_id uuid, studio_id uuid, school_name text, starts_at timestamptz, ends_at timestamptz,
                 class_name text, location text, room text, status text, covering boolean, has_handover boolean,
                 sharing text, location_id uuid, staff_id uuid)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with me as (
    select sm.id, sm.studio_id from staff_member sm
     where sm.user_id = p_user and sm.deleted_at is null and sm.status = 'active'
       and app.studio_writable(sm.studio_id)
       and exists (select 1 from membership m where m.user_id = p_user and m.studio_id = sm.studio_id
                     and m.deleted_at is null and m.role in ('owner', 'admin', 'teacher'))
  )
  select cs.id, cs.studio_id, st.name, cs.starts_at, cs.ends_at, c.name, l.name, coalesce(sr.name, r.name),
         case when cs.status = 'cancelled' then 'cancelled'
              when c.teacher_id = me.id and cs.teacher_id is not null and cs.teacher_id <> me.id then 'covered'
              when cs.status = 'rescheduled' or (cs.original_starts_at is not null and cs.original_starts_at <> cs.starts_at) then 'moved'
              else 'scheduled' end,
         (cs.teacher_id = me.id and c.teacher_id is distinct from me.id),
         nullif(btrim(coalesce(cs.handover_note, '')), '') is not null,
         st.staff_timetable_sharing, c.location_id, me.id
    from me
    join class c on c.studio_id = me.studio_id and c.deleted_at is null
    join class_session cs on cs.class_id = c.id and cs.deleted_at is null
    join studio st on st.id = cs.studio_id and st.deleted_at is null
    left join room r on r.id = c.room_id
    left join room sr on sr.id = cs.room_id
    left join location l on l.id = c.location_id
   where (c.teacher_id = me.id or c.assistant_id = me.id or cs.teacher_id = me.id)
     and cs.starts_at >= p_from and cs.starts_at < p_to
$$;
revoke all on function app.agenda_rows(uuid, timestamptz, timestamptz) from public, authenticated, anon;

-- The school whose screens the teacher is on: the one chosen, or her only one.
create or replace function app.agenda_home(p_user uuid) returns uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(app.selected_studio(),
    (select case when count(distinct sm.studio_id) = 1 then (array_agg(sm.studio_id))[1] end
       from staff_member sm where sm.user_id = p_user and sm.deleted_at is null and sm.status = 'active'))
$$;
revoke all on function app.agenda_home(uuid) from public, authenticated, anon;

-- The teacher's own agenda, across schools, filtered by each school's choice.
-- detail: 'full' or 'busy'. clash: overlaps another of her sessions, travel
-- included; clash_with: the other school(s) involved, null when the clash is
-- within the same school. Cancelled and covered rows never clash.
create or replace function app.my_agenda(p_from timestamptz, p_to timestamptz)
  returns table (session_id uuid, studio_id uuid, school_name text, starts_at timestamptz, ends_at timestamptz,
                 class_name text, location text, room text, status text, covering boolean, has_handover boolean,
                 detail text, clash boolean, clash_with text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare me uuid := auth.uid(); home uuid; travel interval;
begin
  if me is null then return; end if;
  if p_from is null or p_to is null or p_to <= p_from or p_to - p_from > interval '35 days' then
    raise exception 'INVALID: an agenda covers up to 35 days' using errcode = 'check_violation';
  end if;
  home := app.agenda_home(me);
  travel := make_interval(mins => coalesce((select agenda_travel_min from user_account where id = me), 30));
  return query
  with a as (
    select x.*, (x.studio_id = home or x.sharing = 'details') as full_view
      from app.agenda_rows(me, p_from, p_to) x
  ),
  v as (
    select a.* from a
     where a.full_view or (a.sharing = 'times' and a.status in ('scheduled', 'moved'))
  ),
  live as (select v.* from v where v.status in ('scheduled', 'moved'))
  select v.session_id, v.studio_id, v.school_name, v.starts_at, v.ends_at,
         case when v.full_view then v.class_name end,
         case when v.full_view then v.location end,
         case when v.full_view then v.room end,
         case when v.full_view then v.status else 'scheduled' end,
         v.full_view and v.covering,
         v.full_view and v.has_handover,
         case when v.full_view then 'full' else 'busy' end,
         k.n > 0,
         k.schools
    from v
    left join lateral (
      select count(*) as n,
             string_agg(distinct case when o.studio_id <> v.studio_id then o.school_name end, ', ') as schools
        from live o join studio ost on ost.id = o.studio_id
       where v.status in ('scheduled', 'moved') and o.session_id <> v.session_id
         and o.starts_at < v.ends_at + app.agenda_gap(v.studio_id, v.location_id, o.studio_id, o.location_id, ost.cover_travel_min, travel)
         and o.ends_at + app.agenda_gap(v.studio_id, v.location_id, o.studio_id, o.location_id, ost.cover_travel_min, travel) > v.starts_at
    ) k on true
   order by v.starts_at, v.school_name;
end $$;

-- Time needed between two sessions: none at one site, the school's travel
-- time between its sites, the teacher's own travel time between schools.
create or replace function app.agenda_gap(a_studio uuid, a_loc uuid, b_studio uuid, b_loc uuid, school_travel smallint, own_travel interval)
  returns interval language sql immutable as $$
  select case when a_studio <> b_studio then own_travel
              when a_loc is distinct from b_loc then make_interval(mins => school_travel)
              else interval '0' end
$$;

revoke all on function app.my_agenda(timestamptz, timestamptz), app.my_agenda_travel(), app.set_agenda_travel(int),
  app.set_timetable_sharing(uuid, text) from public;
grant execute on function app.my_agenda(timestamptz, timestamptz), app.my_agenda_travel(), app.set_agenda_travel(int),
  app.set_timetable_sharing(uuid, text), app.agenda_gap(uuid, uuid, uuid, uuid, smallint, interval) to authenticated;

-- ── Cover check sees "busy" at other schools (extends 0048) ───────────────
-- Same columns as before. A row from another school has no session id, is
-- called "Busy at another school", has no place, and always needs travel.
create or replace function app.cover_clashes(p_session uuid, p_teacher uuid)
  returns table (session_id uuid, class_name text, starts_at timestamptz, ends_at timestamptz,
                 location text, needs_travel boolean)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare sid uuid; u uuid; s0 timestamptz; e0 timestamptz; travel interval;
begin
  select cs.studio_id, cs.starts_at, cs.ends_at into sid, s0, e0 from class_session cs where cs.id = p_session;
  if sid is null or not app.is_admin(sid) then
    raise exception 'FORBIDDEN: only the office arranges cover' using errcode = 'insufficient_privilege';
  end if;
  return query
  select o.id, c2.name, o.starts_at, o.ends_at, l2.name, (c2.location_id is distinct from c.location_id)
    from class_session cs
    join class c on c.id = cs.class_id
    join studio st on st.id = cs.studio_id
    join class_session o on o.studio_id = cs.studio_id and o.id <> cs.id and o.deleted_at is null and o.status <> 'cancelled'
    join class c2 on c2.id = o.class_id and c2.deleted_at is null
    left join location l2 on l2.id = c2.location_id
   where cs.id = p_session
     and (coalesce(o.teacher_id, c2.teacher_id) = p_teacher or c2.assistant_id = p_teacher)
     and o.starts_at < cs.ends_at + case when c2.location_id is distinct from c.location_id
                                          then make_interval(mins => st.cover_travel_min) else interval '0' end
     and o.ends_at + case when c2.location_id is distinct from c.location_id
                          then make_interval(mins => st.cover_travel_min) else interval '0' end > cs.starts_at
   order by o.starts_at;

  -- The same person at other schools that share at least their busy times.
  select sm.user_id into u from staff_member sm where sm.id = p_teacher and sm.studio_id = sid and sm.deleted_at is null;
  if u is null then return; end if;
  travel := make_interval(mins => coalesce((select agenda_travel_min from user_account where id = u), 30));
  return query
  select null::uuid, 'Busy at another school'::text, x.starts_at, x.ends_at, null::text, true
    from app.agenda_rows(u, s0 - interval '1 day', e0 + interval '1 day') x
   where x.studio_id <> sid and x.sharing in ('details', 'times') and x.status in ('scheduled', 'moved')
     and x.starts_at < e0 + travel and x.ends_at + travel > s0
   order by x.starts_at;
end $$;
revoke all on function app.cover_clashes(uuid, uuid) from public;
grant execute on function app.cover_clashes(uuid, uuid) to authenticated, service_role;

-- cover_session as in 0048; the clash test no longer relies on a session id
-- (another school's busy time has none) and words that case as busy.
create or replace function app.cover_session(p_session uuid, p_teacher uuid, p_message text default null,
                                  p_notify_families boolean default false, p_handover text default null,
                                  p_override boolean default false)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; who text; lbl text; u uuid; clash record; tz text;
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
    if not p_override then
      select * into clash from app.cover_clashes(p_session, p_teacher) limit 1;
      if found then
        tz := (select timezone from studio where id = cs.studio_id);
        if clash.session_id is null then
          raise exception '%', 'CLASH: ' || who || ' is busy at another school from '
            || to_char(clash.starts_at at time zone tz, 'HH24:MI') || ' to ' || to_char(clash.ends_at at time zone tz, 'HH24:MI')
            || ', with time to travel'
            using errcode = 'check_violation';
        end if;
        raise exception '%', 'CLASH: ' || who || ' teaches ' || clash.class_name || ' from '
          || to_char(clash.starts_at at time zone tz, 'HH24:MI') || ' to ' || to_char(clash.ends_at at time zone tz, 'HH24:MI')
          || coalesce(' at ' || clash.location, '')
          || case when clash.needs_travel then ', a different site, so there is no time to travel' else '' end
          using errcode = 'check_violation';
      end if;
    end if;
    if p_teacher = cs.class_teacher then p_teacher := null; end if;   -- back to the usual teacher
  end if;
  lbl := app.session_label(p_session);
  update class_session set teacher_id = p_teacher,
         handover_note = coalesce(nullif(btrim(p_handover), ''), handover_note),
         changed_at = now(), changed_by = auth.uid(), updated_at = now()
   where id = p_session;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (cs.studio_id, auth.uid(), 'cover', 'class_session', p_session,
          lbl || coalesce(': covered by ' || who, ': back to the usual teacher')
             || case when p_override then ' (clash accepted)' else '' end);
  if p_teacher is not null then
    perform app.notify_user(cs.studio_id, u, 'cover_assigned', 'You are covering ' || lbl,
      coalesce(nullif(btrim(p_message), ''), 'The register, safety notes and handover are on your Today screen on the day.'), '/teach');
  end if;
  if p_notify_families and p_teacher is not null then
    perform app.announce_session(p_session, 'Cover: ' || lbl,
      coalesce(nullif(btrim(p_message), ''), who || ' will be teaching ' || lbl || '.'));
  end if;
  update studio_request set status = 'answered', answer = coalesce('Covered by ' || who, 'No cover needed'),
         answered_by = auth.uid(), answered_at = now()
   where session_id = p_session and status in ('open', 'in_progress');
end $$;
revoke all on function app.cover_session(uuid, uuid, text, boolean, text, boolean) from public;
grant execute on function app.cover_session(uuid, uuid, text, boolean, text, boolean) to authenticated, service_role;

-- ── Calendar link: optionally every school (extends 0041 / 0050) ──────────
-- A new link keeps the choice the old one had.
create or replace function app.issue_calendar_token(p_studio uuid) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare tok text; r text; every boolean;
begin
  r := case when app.is_staff(p_studio) then 'staff'
            when exists (select 1 from guardian g where g.user_id = auth.uid() and g.studio_id = p_studio and g.deleted_at is null) then 'guardian'
            when exists (select 1 from student s where s.user_id = auth.uid() and s.studio_id = p_studio and s.deleted_at is null) then 'student' end;
  if auth.uid() is null or r is null then raise exception 'FORBIDDEN: not a member of that school' using errcode = 'insufficient_privilege'; end if;
  select bool_or(all_schools) into every from calendar_token where user_id = auth.uid() and studio_id = p_studio and revoked_at is null;
  update calendar_token set revoked_at = now() where user_id = auth.uid() and studio_id = p_studio and revoked_at is null;
  tok := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into calendar_token (token, user_id, studio_id, role, all_schools)
  values (tok, auth.uid(), p_studio, r, r = 'staff' and coalesce(every, false));
  return tok;
end $$;

create or replace function app.set_calendar_all_schools(p_studio uuid, p_on boolean) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if auth.uid() is null or not app.is_staff(p_studio) then
    raise exception 'FORBIDDEN: only staff calendars can include other schools' using errcode = 'insufficient_privilege';
  end if;
  update calendar_token set all_schools = coalesce(p_on, false)
   where user_id = auth.uid() and studio_id = p_studio and revoked_at is null and role = 'staff';
end $$;
revoke all on function app.set_calendar_all_schools(uuid, boolean) from public;
grant execute on function app.set_calendar_all_schools(uuid, boolean) to authenticated;

create or replace function app.calendar_feed(p_token text)
  returns table (uid text, title text, starts_at timestamptz, ends_at timestamptz, location text, status text, description text, calendar_name text)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare t calendar_token; sname text; cname text;
begin
  select * into t from calendar_token where token = p_token and revoked_at is null;
  if t.token is null then raise exception 'NOT_FOUND: that calendar link has been replaced or turned off' using errcode = 'no_data_found'; end if;
  update calendar_token set last_used_at = now() where token = p_token;
  select name into sname from studio where id = t.studio_id;
  if t.role = 'staff' then
    cname := case when t.all_schools then 'Teaching, all schools' else sname end;
    return query
    select cs.id::text || '@sanaa', c.name, cs.starts_at, cs.ends_at,
           nullif(concat_ws(', ', r.name, l.name, case when t.all_schools then sname end), ''),
           case when cs.status = 'cancelled' then 'CANCELLED' else 'CONFIRMED' end,
           case when cs.status = 'cancelled' then 'This class is cancelled.' else null end, cname
      from class_session cs join class c on c.id = cs.class_id
      join staff_member sm on sm.id = coalesce(cs.teacher_id, c.teacher_id)
      left join room r on r.id = coalesce(cs.room_id, c.room_id)
      left join location l on l.id = c.location_id
     where sm.user_id = t.user_id and c.studio_id = t.studio_id and cs.deleted_at is null
       and cs.starts_at between now() - interval '14 days' and now() + interval '120 days'
    union all
    -- Other schools, as each allows: details, or a busy block, or nothing.
    select x.session_id::text || '@sanaa',
           case when x.sharing = 'details' then x.class_name else 'Busy' end || ' — ' || x.school_name,
           x.starts_at, x.ends_at,
           case when x.sharing = 'details' then nullif(concat_ws(', ', x.room, x.location, x.school_name), '') else x.school_name end,
           case when x.status = 'cancelled' then 'CANCELLED' else 'CONFIRMED' end,
           case when x.status = 'cancelled' then 'This class is cancelled.' else null end, cname
      from app.agenda_rows(t.user_id, now() - interval '14 days', now() + interval '120 days') x
     where t.all_schools and x.studio_id <> t.studio_id and x.status <> 'covered'
       and (x.sharing = 'details' or (x.sharing = 'times' and x.status in ('scheduled', 'moved')))
     order by 3;
    return;
  end if;
  return query
  select d.uid || '@sanaa',
         case d.item_kind when 'class' then '' when 'rehearsal' then 'Rehearsal: ' when 'exam' then 'Exam: '
              when 'competition' then 'Competition: ' when 'show' then 'Show: ' when 'private_lesson' then ''
              else initcap(replace(d.item_kind, '_', ' ')) || ': ' end
           || d.title || coalesce(' — ' || string_agg(distinct d.child, ', '), ''),
         d.starts_at, d.ends_at, d.location,
         case when d.status = 'cancelled' then 'CANCELLED' else 'CONFIRMED' end,
         case when d.status = 'cancelled' then 'This is cancelled.' else max(d.detail) end, sname
    from app.diary_items(t.user_id, now() - interval '14 days', now() + interval '120 days') d
   where d.studio_id = t.studio_id
   group by d.uid, d.item_kind, d.title, d.starts_at, d.ends_at, d.location, d.status
   order by d.starts_at;
end $$;
