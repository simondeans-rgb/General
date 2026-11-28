-- ============================================================================
-- 0063 · Teaching, round 4 (round-2 panel: U6, U10, U11, U14, F9, F14)
-- ----------------------------------------------------------------------------
-- U6   app.my_clashes: which of a teacher's sessions overlap which other one
--      (travel time included, the same rule as app.my_agenda), so Today's list
--      can say "Clash · overlaps Junior Tap 16:30" and not only the grid.
-- U11  app.support_needs gains this term's attendance, so children with low
--      attendance are on "May need support" with the reason in words.
-- U14  app.request_media_consent: from the material sheet, ask the families of
--      named children with no consent recorded, in the app. Neutral wording;
--      never asks a family who has said no; at most once a fortnight.
-- F9   app.class_progress: a class's children × skills, read only, for staff
--      who teach it. Nothing for a notes-only class; draft levels flagged.
-- F14  staff_member.register_only: a teacher's own "just registers" setting.
-- ============================================================================

-- ── U6 · Clash partners ────────────────────────────────────────────────────
-- For each of the caller's live sessions starting in [p_from, p_to): the other
-- sessions of hers it overlaps, or comes too close to for travel. A session at
-- a school that shares busy times only is named "Busy".
create or replace function app.my_clashes(p_from timestamptz, p_to timestamptz)
  returns table (session_id uuid, other_session_id uuid, other_name text, other_starts_at timestamptz,
                 other_ends_at timestamptz, other_school text, other_location text, same_school boolean)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare me uuid := auth.uid(); home uuid; travel interval;
begin
  if me is null then return; end if;
  if p_from is null or p_to is null or p_to <= p_from or p_to - p_from > interval '35 days' then
    raise exception 'INVALID: clashes are checked over up to 35 days' using errcode = 'check_violation';
  end if;
  home := app.agenda_home(me);
  travel := make_interval(mins => coalesce((select agenda_travel_min from user_account where id = me), 30));
  return query
  with a as (
    select x.*, (x.studio_id = home or x.sharing = 'details') as full_view
      from app.agenda_rows(me, p_from - interval '1 day', p_to + interval '1 day') x
  ),
  live as (select a.* from a where a.status in ('scheduled', 'moved') and (a.full_view or a.sharing = 'times'))
  select v.session_id, o.session_id,
         case when o.full_view then o.class_name else 'Busy' end,
         o.starts_at, o.ends_at, o.school_name,
         case when o.full_view then o.location end,
         o.studio_id = v.studio_id
    from live v
    join live o on o.session_id <> v.session_id
    join studio ost on ost.id = o.studio_id
   where v.starts_at >= p_from and v.starts_at < p_to
     and o.starts_at < v.ends_at + app.agenda_gap(v.studio_id, v.location_id, o.studio_id, o.location_id, ost.cover_travel_min, travel)
     and o.ends_at + app.agenda_gap(v.studio_id, v.location_id, o.studio_id, o.location_id, ost.cover_travel_min, travel) > v.starts_at
   order by v.starts_at, o.starts_at;
end $$;

-- ── U11 · Support needs, with attendance ───────────────────────────────────
-- As 0049, plus attendance this term (present or late, of the registers taken
-- since the term began) in the caller's own classes, the same figure as the
-- teacher's student list shows. The list is staff only, as before.
drop function if exists app.support_needs();
-- Written as set-wide steps rather than a subquery per child: the same
-- answers as 0049, read once for the whole list.
create function app.support_needs()
  returns table (student_id uuid, absence_streak int, last_here date, not_yet int, support_note text, attendance_pct int)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with mine as materialized (
    select s.id, s.studio_id, app.is_admin(s.studio_id) adm from student s
     where s.deleted_at is null and app.in_scope(s.studio_id)
       and (app.is_admin(s.studio_id) or (app.has_role(s.studio_id, 'teacher') and s.id in (select app.teacher_student_ids())))
  ),
  tc as materialized (select x as id from app.teacher_class_ids() x),
  recs as materialized (
    select a.student_id, a.status, cs.starts_at, cs.class_id, cs.studio_id
      from attendance_record a join class_session cs on cs.id = a.session_id
     where a.deleted_at is null and cs.starts_at <= now() and a.student_id in (select m.id from mine m)
  ),
  -- Registers in the caller's own classes (all of them, for the office).
  own as (select r.* from recs r join mine m on m.id = r.student_id where m.adm or r.class_id in (select t.id from tc t)),
  streak as (
    select x.student_id, count(*) filter (where x.seen = 0 and x.status in ('absent', 'excused'))::int n
      from (select o.student_id, o.status,
                   count(*) filter (where o.status in ('present', 'late'))
                     over (partition by o.student_id order by o.starts_at desc rows unbounded preceding) seen
              from own o) x
     group by x.student_id
  ),
  here as (select r.student_id, max(r.starts_at)::date d from recs r where r.status in ('present', 'late') group by r.student_id),
  terms as materialized (select st.id, app.current_term_start(st.id) ts from studio st where st.id in (select m.studio_id from mine m)),
  att as (
    select o.student_id, round(100.0 * count(*) filter (where o.status in ('present', 'late')) / nullif(count(*), 0))::int pct
      from own o join terms t on t.id = o.studio_id
     where o.starts_at >= t.ts
     group by o.student_id
  ),
  nys as (
    select l.student_id, count(*)::int n from (
      select distinct on (a.student_id, a.skill_id) a.student_id, a.level from skill_assessment a
       where a.student_id in (select m.id from mine m) and a.deleted_at is null and a.skill_id is not null
       order by a.student_id, a.skill_id, a.assessed_on desc, a.created_at desc) l
     where l.level = 'not_started' group by l.student_id
  )
  select m.id, coalesce(streak.n, 0), here.d, coalesce(nys.n, 0), n.note, att.pct
    from mine m
    left join streak on streak.student_id = m.id
    left join here on here.student_id = m.id
    left join nys on nys.student_id = m.id
    left join att on att.student_id = m.id
    left join student_support_note n on n.student_id = m.id
$$;
revoke all on function app.support_needs() from public;
grant execute on function app.support_needs() to authenticated;

-- ── U14 · Ask families for media consent ───────────────────────────────────
create table if not exists media_consent_request (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  resource_id  uuid not null references resource(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  kind         text not null,
  requested_by uuid references user_account(id) on delete set null,
  requested_at timestamptz not null default now()
);
create index if not exists media_consent_request_student on media_consent_request (student_id, kind, requested_at desc);
alter table media_consent_request enable row level security;
alter table media_consent_request force row level security;
drop policy if exists media_consent_request_staff on media_consent_request;
create policy media_consent_request_staff on media_consent_request for select using (app.is_staff(studio_id));
grant select on media_consent_request to authenticated;
grant all on media_consent_request to service_role;

-- Each named child with no consent recorded: tell their family's signed-up
-- guardians in the app. A child whose family said no is never asked again
-- from here (that is the family's answer), and nobody is asked twice about
-- the same kind of consent within 14 days.
create or replace function app.request_media_consent(p_resource uuid)
  returns table (asked int, families int, already_asked int, declined int, unreachable int)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r record; k text; ch record; eff boolean; n_g int; fams uuid[] := '{}';
begin
  asked := 0; already_asked := 0; declined := 0; unreachable := 0;
  select res.id, res.studio_id, res.kind, res.created_by, res.shows_children into r
    from resource res where res.id = p_resource and res.deleted_at is null;
  if r.id is null or not app.is_staff(r.studio_id) or not (
       app.is_admin(r.studio_id) or r.created_by = auth.uid()
       or exists (select 1 from resource_assignment a where a.resource_id = r.id and a.deleted_at is null
                    and a.scope = 'class' and a.class_id in (select app.teacher_class_ids()))) then
    raise exception 'FORBIDDEN: only staff who teach with this material can ask' using errcode = 'insufficient_privilege';
  end if;
  k := app.media_consent_kind(r.kind);
  for ch in select s.id, s.family_id, coalesce(s.preferred_name, s.first_name) as name
              from resource_child rc join student s on s.id = rc.student_id and s.deleted_at is null
             where rc.resource_id = r.id loop
    select e.granted into eff from app.consent_effective(ch.id, k) e;
    if eff is true then continue; end if;
    if eff is false then declined := declined + 1; continue; end if;
    if exists (select 1 from media_consent_request m where m.student_id = ch.id and m.kind = k
                 and m.requested_at > now() - interval '14 days') then
      already_asked := already_asked + 1; continue;
    end if;
    select count(*) into n_g from guardian g where g.family_id = ch.family_id and g.user_id is not null and g.deleted_at is null;
    if n_g = 0 then unreachable := unreachable + 1; continue; end if;
    perform app.notify_user(r.studio_id, g.user_id, 'consent_request',
              format('%s consent for %s', case k when 'video' then 'Video' else 'Photo' end, ch.name),
              format('%s''s class has material that shows %s. It stays with staff unless you give %s consent. You can answer on the Family page; either answer is fine.',
                     ch.name, ch.name, case k when 'video' then 'video' else 'photo' end),
              '/family/children/')
       from guardian g where g.family_id = ch.family_id and g.user_id is not null and g.deleted_at is null;
    insert into media_consent_request (studio_id, resource_id, student_id, kind, requested_by)
    values (r.studio_id, r.id, ch.id, k, auth.uid());
    asked := asked + 1;
    if not ch.family_id = any(fams) then fams := fams || ch.family_id; end if;
  end loop;
  families := coalesce(array_length(fams, 1), 0);
  if asked > 0 then
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (r.studio_id, auth.uid(), 'create', 'media_consent_request', r.id,
            format('Asked %s %s for %s consent', families, case when families = 1 then 'family' else 'families' end, k));
  end if;
  return next;
end $$;
revoke all on function app.request_media_consent(uuid) from public;
grant execute on function app.request_media_consent(uuid) to authenticated;

-- ── F9 · Class progress matrix ─────────────────────────────────────────────
-- Every active child in the class × every skill of the class's style, with
-- the latest level (drafts included, flagged), and the level before it when
-- the class tracks in full. Empty for a notes-only class, for children whose
-- family opted out of skill tracking, and for anyone who doesn't teach it.
create or replace function app.class_progress(p_class uuid)
  returns table (student_id uuid, student_name text, framework_id uuid, framework text, skill_id uuid, skill text,
                 ord smallint, level assessment_level, assessed_on date, published boolean, previous assessment_level, depth text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
#variable_conflict use_column
declare c record; d text;
begin
  select cl.id, cl.studio_id, cl.dance_style_id into c from class cl where cl.id = p_class and cl.deleted_at is null;
  if c.id is null or not app.in_scope(c.studio_id) then return; end if;
  if not (app.is_admin(c.studio_id) or (app.has_role(c.studio_id, 'teacher') and p_class in (select app.teacher_class_ids()))) then
    return;
  end if;
  d := app.class_depth(p_class);
  if app.depth_rank(d) < 2 then return; end if;
  return query
  with kids as (
    select distinct s.id, coalesce(s.preferred_name, s.first_name) || ' ' || s.last_name as nm, s.last_name ln, s.first_name fn
      from enrolment e join student s on s.id = e.student_id and s.deleted_at is null
     where e.class_id = p_class and e.status = 'active' and e.deleted_at is null and not s.skill_tracking_opt_out
  ),
  sk as (
    select f.id fid, f.name fname, fs.id sid, fs.name sname, fs.position pos
      from skill_framework f join framework_skill fs on fs.framework_id = f.id and fs.deleted_at is null
     where f.deleted_at is null and f.studio_id = c.studio_id and f.dance_style_id = c.dance_style_id
  )
  select k.id, k.nm, sk.fid, sk.fname, sk.sid, sk.sname, sk.pos, l.level, l.assessed_on, l.published_at is not null,
         case when d = 'full' then pv.level end, d
    from kids k cross join sk
    left join lateral (select a.level, a.assessed_on, a.published_at from skill_assessment a
                        where a.student_id = k.id and a.skill_id = sk.sid and a.deleted_at is null
                        order by a.assessed_on desc, a.created_at desc limit 1) l on true
    left join lateral (select a.level from skill_assessment a
                        where a.student_id = k.id and a.skill_id = sk.sid and a.deleted_at is null
                        order by a.assessed_on desc, a.created_at desc offset 1 limit 1) pv on true
   order by k.ln, k.fn, k.id, sk.fname, sk.pos;
end $$;
revoke all on function app.class_progress(uuid) from public;
grant execute on function app.class_progress(uuid) to authenticated;

-- ── F14 · Register-only mode, per teacher ──────────────────────────────────
alter table staff_member add column if not exists register_only boolean not null default false;

create or replace function app.my_register_only() returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(bool_or(sm.register_only), false) from staff_member sm
   where sm.user_id = auth.uid() and sm.deleted_at is null and sm.studio_id in (select app.studio_ids())
$$;

-- A personal preference: it follows the teacher to every school she works at.
create or replace function app.set_register_only(p_on boolean) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare n int;
begin
  if auth.uid() is null or p_on is null then
    raise exception 'INVALID: sign in and choose on or off' using errcode = 'check_violation';
  end if;
  update staff_member set register_only = p_on, updated_at = now() where user_id = auth.uid() and deleted_at is null;
  get diagnostics n = row_count;
  if n = 0 then raise exception 'FORBIDDEN: only staff have this setting' using errcode = 'insufficient_privilege'; end if;
  return p_on;
end $$;
revoke all on function app.my_register_only(), app.set_register_only(boolean), app.my_clashes(timestamptz, timestamptz) from public;
grant execute on function app.my_register_only(), app.set_register_only(boolean), app.my_clashes(timestamptz, timestamptz) to authenticated;
