-- ============================================================================
-- 0049 · Progress fixes from the end-user panel (UR-25, UR-43, UR-44, UR-45,
--        UR-48, UR-54 in part, UR-55)
-- ----------------------------------------------------------------------------
--   UR-25  feedback keeps its parts (chips, note, own words) so a teacher can
--          reopen it; saving merges instead of replacing; an edit to shared
--          feedback is stamped edited_at for families to see.
--   UR-44  chip sets a teacher owns per class, an under-8 preset with simple
--          words and stickers, and the class's effective set in one call.
--   UR-48  a school setting: skill levels reach families at once, or with the
--          share step (the default).
--   UR-55  tracking depth per class (notes / notes + skills / full), defaulted
--          by age band; families can opt a child out of skill tracking.
--   UR-43  a dated history of every level, and "to work on" linked to a
--          library resource.
--   UR-45  support notes the office sets, and a support-needs summary for a
--          teacher's own students. Staff only.
--   UR-54  trial and drop-in children can receive class feedback; the
--          notification about feedback opens the child it was about.
-- ============================================================================

-- ── Tracking depth (UR-55) ─────────────────────────────────────────────────
alter table class add column tracking_depth text
  check (tracking_depth is null or tracking_depth in ('notes', 'notes_skills', 'full'));
alter table student add column skill_tracking_opt_out boolean not null default false;

create or replace function app.depth_rank(p_depth text) returns int
  language sql immutable as $$
  select case p_depth when 'notes' then 1 when 'notes_skills' then 2 when 'full' then 3 else 3 end
$$;

-- By age band unless the class says otherwise: up to 8 notes only, up to 12
-- notes and skills, older (or no upper age) everything.
create or replace function app.age_band_depth(p_age_max int) returns text
  language sql immutable as $$
  select case when p_age_max is null then 'full' when p_age_max <= 8 then 'notes'
              when p_age_max <= 12 then 'notes_skills' else 'full' end
$$;

create or replace function app.class_depth(p_class uuid) returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(c.tracking_depth, app.age_band_depth(c.age_max)) from class c where c.id = p_class
$$;

-- How deeply one child's progress in one style is tracked: the deepest of the
-- classes they take in it; in a style they no longer take, by their age.
create or replace function app.style_depth(p_student uuid, p_style uuid) returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(
    (select c2.d from (select app.class_depth(c.id) d from enrolment e join class c on c.id = e.class_id
                        where e.student_id = p_student and e.status = 'active' and e.deleted_at is null
                          and c.dance_style_id = p_style) c2
      order by app.depth_rank(c2.d) desc limit 1),
    (select case when a < 8 then 'notes' when a < 13 then 'notes_skills' else 'full' end
       from (select extract(year from age(current_date, s.date_of_birth))::int a from student s where s.id = p_student) x))
$$;

create or replace function app.set_class_depth(p_class uuid, p_depth text) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c class;
begin
  select * into c from class where id = p_class and deleted_at is null;
  if c.id is null or not (app.is_admin(c.studio_id) or c.id in (select app.teacher_class_ids())) then
    raise exception 'FORBIDDEN: not your class' using errcode = 'insufficient_privilege';
  end if;
  if p_depth is not null and p_depth not in ('notes', 'notes_skills', 'full') then
    raise exception 'INVALID: tracking is notes, notes_skills or full' using errcode = 'check_violation';
  end if;
  update class set tracking_depth = p_depth, updated_at = now() where id = c.id;
  return app.class_depth(c.id);
end $$;

-- A family chooses whether their child's skill levels are recorded at all.
-- Notes and milestones carry on either way.
create or replace function app.set_skill_tracking(p_student uuid, p_tracked boolean) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student;
begin
  select * into s from student where id = p_student and deleted_at is null;
  if s.id is null or not (app.is_admin(s.studio_id) or s.id in (select app.guardian_student_ids())) then
    raise exception 'FORBIDDEN: only the family or the office can change this' using errcode = 'insufficient_privilege';
  end if;
  update student set skill_tracking_opt_out = not p_tracked, updated_at = now() where id = s.id;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (s.studio_id, auth.uid(), 'update', 'student', s.id,
          case when p_tracked then 'skill tracking switched on' else 'skill tracking switched off by the family' end);
  return p_tracked;
end $$;

create or replace function app.skills_tracked(p_student uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce((select not s.skill_tracking_opt_out from student s where s.id = p_student), true)
$$;

-- ── Draft-then-publish skill levels (UR-48) ────────────────────────────────
alter table studio add column skill_publish text not null default 'with_share'
  check (skill_publish in ('immediate', 'with_share'));
-- Everything recorded before this setting existed has already been seen.
alter table skill_assessment add column published_at timestamptz default now();

create or replace function app.set_skill_publish(p_studio uuid, p_mode text) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_admin(p_studio) then
    raise exception 'FORBIDDEN: a school setting' using errcode = 'insufficient_privilege';
  end if;
  update studio set skill_publish = p_mode, updated_at = now() where id = p_studio;
  return p_mode;
end $$;

-- Families and students see a level once it is published; staff see drafts.
drop policy if exists assessment_student_read on skill_assessment;
create policy assessment_student_read on skill_assessment for select
  using (deleted_at is null and published_at is not null and student_id = app.student_self_id()
         and app.skills_tracked(student_id));
drop policy if exists assessment_guardian_read on skill_assessment;
create policy assessment_guardian_read on skill_assessment for select
  using (deleted_at is null and published_at is not null and student_id in (select app.guardian_student_ids())
         and app.skills_tracked(student_id));

create or replace function app.is_student_staff(p_student uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from student s where s.id = p_student and (app.is_admin(s.studio_id)
    or (app.has_role(s.studio_id, 'teacher') and s.id in (select app.teacher_student_ids()))))
$$;

-- Record a level. Teachers record in the styles they teach; nothing is
-- recorded for a child whose family opted out, or in a notes-only class.
create or replace function app.record_skill(p_student uuid, p_skill uuid, p_level assessment_level,
                                            p_note text default null, p_feedback uuid default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; k record; aid uuid; staff uuid; mode text;
begin
  select * into s from student where id = p_student and deleted_at is null;
  if s.id is null or not (app.is_admin(s.studio_id)
       or (app.has_role(s.studio_id, 'teacher') and s.id in (select app.teacher_student_ids()))) then
    raise exception 'FORBIDDEN: you record skills for children you teach' using errcode = 'insufficient_privilege';
  end if;
  select fs.id, fs.name, f.dance_style_id into k from framework_skill fs join skill_framework f on f.id = fs.framework_id
   where fs.id = p_skill and fs.studio_id = s.studio_id and fs.deleted_at is null;
  if k.id is null then raise exception 'NOT_FOUND: that skill' using errcode = 'no_data_found'; end if;
  if s.skill_tracking_opt_out then
    raise exception 'INVALID: the family has chosen not to have skill levels recorded' using errcode = 'check_violation';
  end if;
  if not app.is_admin(s.studio_id) and k.dance_style_id not in
       (select c.dance_style_id from class c where c.id in (select app.teacher_class_ids()) and c.dance_style_id is not null) then
    raise exception 'FORBIDDEN: you record skills in the styles you teach' using errcode = 'insufficient_privilege';
  end if;
  if app.depth_rank(app.style_depth(s.id, k.dance_style_id)) < 2 then
    raise exception 'INVALID: this class keeps notes only, not skill levels' using errcode = 'check_violation';
  end if;
  select id into staff from staff_member where user_id = auth.uid() and studio_id = s.studio_id and deleted_at is null limit 1;
  if exists (select 1 from skill_assessment a where a.student_id = s.id and a.skill_id = k.id and a.deleted_at is null
              and a.assessed_on = current_date and a.level = p_level) then
    return null;
  end if;
  select skill_publish into mode from studio where id = s.studio_id;
  insert into skill_assessment (studio_id, student_id, feedback_id, dance_style_id, skill, skill_id, level, assessed_by,
                                assessed_on, note, published_at)
  values (s.studio_id, s.id, p_feedback, k.dance_style_id, k.name, k.id, p_level, staff, current_date,
          nullif(btrim(p_note), ''), case when mode = 'immediate' then now() end)
  returning id into aid;
  return aid;
end $$;

-- Share a child's unshared skill changes with their family.
create or replace function app.share_skills(p_student uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare n int;
begin
  if not app.is_student_staff(p_student) then
    raise exception 'FORBIDDEN: not your student' using errcode = 'insufficient_privilege';
  end if;
  update skill_assessment set published_at = now(), updated_at = now()
   where student_id = p_student and published_at is null and deleted_at is null;
  get diagnostics n = row_count;
  return n;
end $$;

-- A child's current level in each skill of the styles they dance. Teachers
-- see the styles they teach the child (D11); families see published levels
-- only, and only where the class tracks skills; nothing if they opted out.
create or replace function app.student_skills(p_student uuid)
  returns table (framework_id uuid, framework text, skill_id uuid, skill text, ord smallint,
                 level assessment_level, assessed_on date, previous assessment_level)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
#variable_conflict use_column
declare st student; adm boolean; staff boolean;
begin
  if not app.can_see_student(p_student) then return; end if;
  select * into st from student s where s.id = p_student;
  if st.skill_tracking_opt_out then return; end if;
  adm := app.is_admin(st.studio_id);
  staff := app.is_student_staff(p_student);
  return query
  with mine as (select distinct c.dance_style_id from enrolment e join class c on c.id = e.class_id
                 where e.student_id = p_student and e.status = 'active' and e.deleted_at is null
                   and app.depth_rank(app.class_depth(c.id)) >= 2
                   and (adm or not staff or c.id in (select app.teacher_class_ids()))),
       asm as (select a.skill_id sid, a.level lv, a.assessed_on dt, a.created_at ca from skill_assessment a
                where a.student_id = p_student and a.deleted_at is null and (staff or a.published_at is not null))
  select f.id, f.name, fs.id, fs.name, fs.position, l.lv, l.dt,
         (select b.lv from asm b where b.sid = fs.id order by b.dt desc, b.ca desc offset 1 limit 1)
    from skill_framework f join framework_skill fs on fs.framework_id = f.id and fs.deleted_at is null
    left join lateral (select a.lv, a.dt from asm a where a.sid = fs.id order by a.dt desc, a.ca desc limit 1) l on true
   where f.deleted_at is null and f.dance_style_id in (select m.dance_style_id from mine m)
   order by f.name, fs.position;
end $$;

-- Every level ever recorded, dated (UR-43), with the style, whether the child
-- still dances it (D6: orphaned skills) and how deeply that style is tracked.
create or replace function app.skill_history(p_student uuid)
  returns table (skill_id uuid, skill text, style_id uuid, style text, level assessment_level, assessed_on date,
                 current_style boolean, depth text, published boolean)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
#variable_conflict use_column
declare st student; staff boolean;
begin
  if not app.can_see_student(p_student) then return; end if;
  select * into st from student s where s.id = p_student;
  if st.skill_tracking_opt_out then return; end if;
  staff := app.is_student_staff(p_student);
  return query
  select a.skill_id, coalesce(fs.name, a.skill), a.dance_style_id, ds.name, a.level, a.assessed_on,
         exists (select 1 from enrolment e join class c on c.id = e.class_id where e.student_id = p_student
                   and e.status = 'active' and e.deleted_at is null and c.dance_style_id = a.dance_style_id),
         app.style_depth(p_student, a.dance_style_id), a.published_at is not null
    from skill_assessment a
    left join framework_skill fs on fs.id = a.skill_id
    left join dance_style ds on ds.id = a.dance_style_id
   where a.student_id = p_student and a.deleted_at is null and (staff or a.published_at is not null)
     and (staff or app.depth_rank(app.style_depth(p_student, a.dance_style_id)) >= 2)
   order by a.assessed_on, a.created_at;
end $$;

-- ── Feedback that keeps its parts (UR-25) ──────────────────────────────────
alter table feedback_note
  add column going_well_chips text[],
  add column work_on_chips    text[],
  add column note             text,     -- the teacher's own words under "going well"
  add column work_on_note     text,     -- and under "to work on"
  add column edited_at        timestamptz,
  add column work_on_resource_id uuid references resource(id) on delete set null;

-- Split text written before the parts were kept: "Chip, Chip. Own words"
-- becomes chips and words when every leading phrase is one of the school's.
create or replace function app.split_feedback(p_studio uuid, p_text text, out chips text[], out rest text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare pos int; head text; pieces text[];
begin
  chips := '{}'; rest := null;
  if p_text is null or btrim(p_text) = '' then return; end if;
  pos := strpos(p_text, '. ');
  head := case when pos > 0 then left(p_text, pos - 1) else p_text end;
  pieces := string_to_array(head, ', ');
  if pieces <@ array(select fc.label from feedback_chip fc where fc.studio_id = p_studio) then
    chips := pieces;
    rest := case when pos > 0 then nullif(btrim(substr(p_text, pos + 2)), '') end;
  else
    rest := p_text;
  end if;
end $$;

create or replace function app.compose_feedback(p_chips text[], p_words text) returns text
  language sql immutable as $$
  select nullif(concat_ws('. ', nullif(array_to_string(coalesce(p_chips, '{}'), ', '), ''), nullif(btrim(p_words), '')), '')
$$;

-- Keeps the parts and the text in step whoever writes the row, and marks an
-- edit to something a family has already seen.
create or replace function app.feedback_note_parts() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare p record;
begin
  if tg_op = 'INSERT' then
    if new.going_well_chips is null and new.note is null then
      select * into p from app.split_feedback(new.studio_id, new.going_well);
      new.going_well_chips := p.chips; new.note := p.rest;
    end if;
    if new.work_on_chips is null and new.work_on_note is null then
      select * into p from app.split_feedback(new.studio_id, new.work_on);
      new.work_on_chips := p.chips; new.work_on_note := p.rest;
    end if;
    return new;
  end if;
  -- A writer that changed the text and not the parts (an older screen, or
  -- erasure under the retention policy): the parts follow the text.
  if new.going_well is distinct from old.going_well and new.going_well_chips is not distinct from old.going_well_chips
     and new.note is not distinct from old.note then
    select * into p from app.split_feedback(new.studio_id, new.going_well);
    new.going_well_chips := case when new.going_well is null then null else p.chips end;
    new.note := p.rest;
  end if;
  if new.work_on is distinct from old.work_on and new.work_on_chips is not distinct from old.work_on_chips
     and new.work_on_note is not distinct from old.work_on_note then
    select * into p from app.split_feedback(new.studio_id, new.work_on);
    new.work_on_chips := case when new.work_on is null then null else p.chips end;
    new.work_on_note := p.rest;
  end if;
  if old.shared_at is not null and (new.going_well is distinct from old.going_well or new.work_on is distinct from old.work_on
       or new.work_on_resource_id is distinct from old.work_on_resource_id) then
    new.edited_at := now();
  end if;
  return new;
end $$;
create trigger feedback_note_parts before insert or update on feedback_note
  for each row execute function app.feedback_note_parts();

update feedback_note f set going_well_chips = (app.split_feedback(f.studio_id, f.going_well)).chips,
                           note = (app.split_feedback(f.studio_id, f.going_well)).rest,
                           work_on_chips = (app.split_feedback(f.studio_id, f.work_on)).chips,
                           work_on_note = (app.split_feedback(f.studio_id, f.work_on)).rest
 where going_well_chips is null;

-- Who may receive feedback for a session: the enrolled, and anyone trialling
-- or dropping in to it (D12).
create or replace function app.session_has_student(p_session uuid, p_student uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from class_session cs join enrolment e on e.class_id = cs.class_id and e.deleted_at is null
                  where cs.id = p_session and e.student_id = p_student)
      or exists (select 1 from trial t where t.session_id = p_session and t.student_id = p_student and t.deleted_at is null
                    and t.status in ('booked', 'attended', 'converted'))
      or exists (select 1 from drop_in_booking d where d.session_id = p_session and d.student_id = p_student and d.status = 'booked')
$$;

-- Save a class's feedback. p_items: [{student_id, going_well:[..], work_on:[..],
-- note?, work_on_note?, private_note?, work_on_resource_id?, skills?:[{skill_id, level}],
-- replace?}]. Without "replace" a save MERGES into what is there: chips are
-- added, never dropped, and new words join the old ones. With "replace" (the
-- screen loaded the saved parts and the teacher edited them) the item is the
-- whole new state. Keys that are absent leave their column alone.
create or replace function app.save_class_feedback(p_session uuid, p_items jsonb, p_share boolean default false)
  returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; it jsonb; sk jsonb; f feedback_note; fid uuid; staff uuid; n int := 0; sid uuid;
        in_gw text[]; in_wo text[]; in_note text; in_wnote text; repl boolean;
        gw text[]; wo text[]; nt text; wn text; pn text; res uuid; style uuid;
begin
  select x.id, x.class_id, c.studio_id, c.name, c.dance_style_id into cs
    from class_session x join class c on c.id = x.class_id where x.id = p_session;
  if cs.id is null or not (app.is_admin(cs.studio_id) or cs.class_id in (select app.teacher_class_ids())) then
    raise exception 'FORBIDDEN: not your class' using errcode = 'insufficient_privilege';
  end if;
  select id into staff from staff_member where user_id = auth.uid() and studio_id = cs.studio_id and deleted_at is null limit 1;
  for it in select * from jsonb_array_elements(p_items) loop
    sid := (it ->> 'student_id')::uuid;
    if not app.session_has_student(cs.id, sid) then
      raise exception 'INVALID: a child in the list is not in this class' using errcode = 'check_violation';
    end if;
    in_gw := array(select jsonb_array_elements_text(coalesce(it -> 'going_well', '[]')));
    in_wo := array(select jsonb_array_elements_text(coalesce(it -> 'work_on', '[]')));
    in_note := nullif(btrim(it ->> 'note'), '');
    in_wnote := nullif(btrim(it ->> 'work_on_note'), '');
    repl := coalesce((it ->> 'replace')::boolean, false);
    select * into f from feedback_note where session_id = cs.id and student_id = sid and deleted_at is null;

    if f.id is null or repl then
      gw := in_gw; wo := in_wo; nt := in_note; wn := in_wnote;
    else
      gw := coalesce(f.going_well_chips, '{}') || array(select x from unnest(in_gw) x where not x = any(coalesce(f.going_well_chips, '{}')));
      wo := coalesce(f.work_on_chips, '{}') || array(select x from unnest(in_wo) x where not x = any(coalesce(f.work_on_chips, '{}')));
      nt := case when in_note is null or in_note = f.note then f.note when f.note is null then in_note
                 when position(f.note in in_note) = 1 then in_note else f.note || ' ' || in_note end;
      wn := case when in_wnote is null or in_wnote = f.work_on_note then f.work_on_note when f.work_on_note is null then in_wnote
                 when position(f.work_on_note in in_wnote) = 1 then in_wnote else f.work_on_note || ' ' || in_wnote end;
    end if;
    pn := case when it ? 'private_note' then nullif(btrim(it ->> 'private_note'), '') else f.private_note end;
    res := case when it ? 'work_on_resource_id' then nullif(it ->> 'work_on_resource_id', '')::uuid else f.work_on_resource_id end;

    if f.id is null and coalesce(array_length(gw, 1), 0) = 0 and coalesce(array_length(wo, 1), 0) = 0 and nt is null and wn is null
       and coalesce(jsonb_array_length(it -> 'skills'), 0) = 0 then
      continue;
    end if;

    if f.id is null then
      insert into feedback_note (studio_id, student_id, class_id, session_id, author_id, headline, going_well, work_on,
                                 going_well_chips, work_on_chips, note, work_on_note, private_note, work_on_resource_id, shared_at)
      values (cs.studio_id, sid, cs.class_id, cs.id, staff, cs.name, app.compose_feedback(gw, nt), app.compose_feedback(wo, wn),
              gw, wo, nt, wn, pn, res, case when p_share then now() end)
      returning id into fid;
    else
      fid := f.id;
      update feedback_note set going_well = app.compose_feedback(gw, nt), work_on = app.compose_feedback(wo, wn),
             going_well_chips = gw, work_on_chips = wo, note = nt, work_on_note = wn, private_note = pn,
             work_on_resource_id = res,
             shared_at = case when p_share then coalesce(shared_at, now()) else shared_at end, updated_at = now()
       where id = fid;
    end if;
    for sk in select * from jsonb_array_elements(coalesce(it -> 'skills', '[]')) loop
      -- A notes-only class (UR-55), or a family that opted out, records no levels.
      select f2.dance_style_id into style from framework_skill fs2 join skill_framework f2 on f2.id = fs2.framework_id
       where fs2.id = (sk ->> 'skill_id')::uuid;
      if app.skills_tracked(sid) and app.depth_rank(app.style_depth(sid, style)) >= 2 then
        perform app.record_skill(sid, (sk ->> 'skill_id')::uuid, (sk ->> 'level')::assessment_level, null, fid);
      end if;
    end loop;
    if p_share then
      update skill_assessment set published_at = now() where feedback_id = fid and published_at is null;
    end if;
    n := n + 1;
  end loop;
  return n;
end $$;

-- Sharing a session's feedback also shares the skill levels recorded with it.
create or replace function app.share_session_feedback(p_session uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; n int;
begin
  select x.id, x.class_id, c.studio_id into cs from class_session x join class c on c.id = x.class_id where x.id = p_session;
  if cs.id is null or not (app.is_admin(cs.studio_id) or cs.class_id in (select app.teacher_class_ids())) then
    raise exception 'FORBIDDEN: not your class' using errcode = 'insufficient_privilege';
  end if;
  update feedback_note set shared_at = now() where session_id = p_session and shared_at is null and deleted_at is null;
  get diagnostics n = row_count;
  update skill_assessment set published_at = now()
   where published_at is null and deleted_at is null
     and feedback_id in (select id from feedback_note where session_id = p_session and deleted_at is null);
  return n;
end $$;

-- The notice about feedback opens the child it is about (parents D14).
create or replace function app.on_feedback_shared() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student;
begin
  if new.shared_at is not null and (tg_op = 'INSERT' or old.shared_at is null) then
    select * into s from student where id = new.student_id;
    if new.share_with_guardian then
      perform app.notify_family(s.family_id, 'feedback_published', 'Feedback for ' || s.first_name,
                                coalesce(left(new.going_well, 120), 'From ' || coalesce(new.headline, 'class')),
                                '/family/feedback?child=' || s.id);
    end if;
    if new.share_with_student and s.user_id is not null and s.login_enabled then
      perform app.notify_user(s.studio_id, s.user_id, 'feedback_published', 'New feedback from your teacher',
                              coalesce(left(new.going_well, 120), ''), '/learn/feedback');
    end if;
  end if;
  return null;
end $$;

-- ── Chip sets (UR-44) ──────────────────────────────────────────────────────
alter table feedback_chip
  add column class_id   uuid references class(id) on delete cascade,
  add column band       text not null default 'standard' check (band in ('standard', 'under_8')),
  add column sticker    text check (sticker is null or length(sticker) <= 8),
  add column created_by uuid references user_account(id) on delete set null;
create index feedback_chip_class on feedback_chip (class_id) where deleted_at is null;

-- A teacher keeps their own set for a class they teach.
drop policy if exists chip_teacher on feedback_chip;
create policy chip_teacher on feedback_chip for all
  using (deleted_at is null and class_id in (select app.teacher_class_ids()))
  with check (class_id in (select app.teacher_class_ids()));

-- Simple words, with a sticker each, for the youngest classes.
create or replace function app.ensure_young_chips(p_studio uuid) returns void
  language sql security definer set search_path = public, app, pg_temp as $$
  insert into feedback_chip (studio_id, kind, label, position, band, sticker)
  select p_studio, k, l, n, 'under_8', st from (values
    ('going_well', 'Listened beautifully', 1, '👂'), ('going_well', 'Tried something new', 2, '🌱'),
    ('going_well', 'Lovely pointed toes', 3, '🩰'), ('going_well', 'Kind to friends', 4, '💛'),
    ('going_well', 'Danced to the music', 5, '🎵'), ('going_well', 'Kept trying', 6, '⭐'),
    ('work_on', 'Good listening', 1, '👂'), ('work_on', 'Pointy toes', 2, '🦶'),
    ('work_on', 'Moving to the beat', 3, '🥁'), ('work_on', 'Taking turns', 4, '🤝'),
    ('work_on', 'Show a grown-up at home', 5, '🏠'), ('work_on', 'Being brave', 6, '🦁')) v(k, l, n, st)
  where not exists (select 1 from feedback_chip c where c.studio_id = p_studio and c.band = 'under_8' and c.class_id is null);
$$;
select app.ensure_young_chips(id) from studio;
create or replace function app.on_studio_young_chips() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin perform app.ensure_young_chips(new.id); return null; end $$;
create trigger studio_young_chips after insert on studio for each row execute function app.on_studio_young_chips();

create or replace function app.class_band(p_class uuid) returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select case when c.age_max is not null and c.age_max <= 8 then 'under_8' else 'standard' end from class c where c.id = p_class
$$;

-- The phrases for one class: its own set if the teacher made one, otherwise
-- the school's set for the class's age band.
create or replace function app.class_chips(p_class uuid)
  returns table (id uuid, kind text, label text, sticker text, chip_position smallint, own boolean)
  language sql stable security invoker set search_path = public, app, pg_temp as $$
  select fc.id, fc.kind, fc.label, fc.sticker, fc.position, true from feedback_chip fc
   where fc.class_id = p_class and fc.deleted_at is null
  union all
  select fc.id, fc.kind, fc.label, fc.sticker, fc.position, false from feedback_chip fc
   where fc.class_id is null and fc.deleted_at is null and fc.band = app.class_band(p_class)
     and fc.studio_id = (select c.studio_id from class c where c.id = p_class)
     and not exists (select 1 from feedback_chip o where o.class_id = p_class and o.deleted_at is null)
  order by 2, 5, 3
$$;

create or replace function app.check_class_teacher(p_class uuid) returns class
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare c class;
begin
  select * into c from class where id = p_class and deleted_at is null;
  if c.id is null or not (app.is_admin(c.studio_id) or c.id in (select app.teacher_class_ids())) then
    raise exception 'FORBIDDEN: not your class' using errcode = 'insufficient_privilege';
  end if;
  return c;
end $$;

-- Start a class's own set from what it uses now (does nothing if it has one).
create or replace function app.customise_class_chips(p_class uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c class; n int := 0;
begin
  c := app.check_class_teacher(p_class);
  if exists (select 1 from feedback_chip where class_id = c.id and deleted_at is null) then return 0; end if;
  insert into feedback_chip (studio_id, class_id, kind, label, position, band, sticker, created_by)
  select c.studio_id, c.id, fc.kind, fc.label, fc.position, fc.band, fc.sticker, auth.uid() from feedback_chip fc
   where fc.studio_id = c.studio_id and fc.class_id is null and fc.deleted_at is null and fc.band = app.class_band(c.id);
  get diagnostics n = row_count;
  return n;
end $$;

create or replace function app.add_class_chip(p_class uuid, p_kind text, p_label text, p_sticker text default null) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c class; cid uuid;
begin
  c := app.check_class_teacher(p_class);
  if p_kind not in ('going_well', 'work_on') or length(btrim(coalesce(p_label, ''))) not between 2 and 40 then
    raise exception 'INVALID: a phrase is 2 to 40 characters' using errcode = 'check_violation';
  end if;
  perform app.customise_class_chips(c.id);
  select id into cid from feedback_chip where class_id = c.id and kind = p_kind and lower(label) = lower(btrim(p_label)) and deleted_at is null;
  if cid is not null then return cid; end if;
  insert into feedback_chip (studio_id, class_id, kind, label, position, band, sticker, created_by)
  values (c.studio_id, c.id, p_kind, btrim(p_label),
          coalesce((select max(position) + 1 from feedback_chip where class_id = c.id and kind = p_kind and deleted_at is null), 1),
          app.class_band(c.id), nullif(btrim(p_sticker), ''), auth.uid())
  returning id into cid;
  return cid;
end $$;

create or replace function app.remove_class_chip(p_class uuid, p_kind text, p_label text) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c class;
begin
  c := app.check_class_teacher(p_class);
  perform app.customise_class_chips(c.id);
  update feedback_chip set deleted_at = now()
   where class_id = c.id and kind = p_kind and label = p_label and deleted_at is null;
  return found;
end $$;

-- Back to the school's phrases.
create or replace function app.reset_class_chips(p_class uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c class; n int;
begin
  c := app.check_class_teacher(p_class);
  update feedback_chip set deleted_at = now() where class_id = c.id and deleted_at is null;
  get diagnostics n = row_count;
  return n;
end $$;

-- ── Support needs (UR-45) ──────────────────────────────────────────────────
-- Set by the office, read by the child's teachers. Never shown to a family
-- or the child: it is a note for the people teaching them.
create table student_support_note (
  student_id uuid primary key references student(id) on delete cascade,
  studio_id  uuid not null references studio(id) on delete cascade,
  note       text not null check (length(btrim(note)) between 1 and 500),
  updated_by uuid references user_account(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table student_support_note enable row level security; alter table student_support_note force row level security;
create policy support_admin on student_support_note for all
  using (app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy support_teacher_read on student_support_note for select
  using (app.has_role(studio_id, 'teacher') and student_id in (select app.teacher_student_ids()));
grant select on student_support_note to authenticated;
grant all on student_support_note to service_role;

create or replace function app.set_support_note(p_student uuid, p_note text) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student;
begin
  select * into s from student where id = p_student and deleted_at is null;
  if s.id is null or not app.is_admin(s.studio_id) then
    raise exception 'FORBIDDEN: support notes are set by the office' using errcode = 'insufficient_privilege';
  end if;
  if nullif(btrim(p_note), '') is null then
    delete from student_support_note where student_id = s.id;
  else
    insert into student_support_note (student_id, studio_id, note, updated_by) values (s.id, s.studio_id, btrim(p_note), auth.uid())
    on conflict (student_id) do update set note = excluded.note, updated_by = excluded.updated_by, updated_at = now();
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (s.studio_id, auth.uid(), 'update', 'student_support_note', s.id, 'support note updated');
  return true;
end $$;

-- For each of the caller's own students (every student, for the office): the
-- run of absences up to the latest register in the caller's classes, skills
-- assessed "not started", and the office's support note.
create or replace function app.support_needs()
  returns table (student_id uuid, absence_streak int, last_here date, not_yet int, support_note text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with mine as (
    select s.id, s.studio_id, app.is_admin(s.studio_id) adm from student s
     where s.deleted_at is null and app.in_scope(s.studio_id)
       and (app.is_admin(s.studio_id) or (app.has_role(s.studio_id, 'teacher') and s.id in (select app.teacher_student_ids())))
  )
  select m.id,
         (select count(*)::int from (
            select a.status, count(*) filter (where a.status in ('present', 'late'))
                     over (order by cs.starts_at desc rows unbounded preceding) seen
              from attendance_record a join class_session cs on cs.id = a.session_id
             where a.student_id = m.id and a.deleted_at is null and cs.starts_at <= now()
               and (m.adm or cs.class_id in (select app.teacher_class_ids()))) x
           where x.seen = 0 and x.status in ('absent', 'excused')),
         (select max(cs.starts_at)::date from attendance_record a join class_session cs on cs.id = a.session_id
           where a.student_id = m.id and a.deleted_at is null and a.status in ('present', 'late')),
         (select count(*)::int from (
            select distinct on (a.skill_id) a.level from skill_assessment a
             where a.student_id = m.id and a.deleted_at is null and a.skill_id is not null
             order by a.skill_id, a.assessed_on desc, a.created_at desc) l where l.level = 'not_started'),
         (select n.note from student_support_note n where n.student_id = m.id)
    from mine m
$$;

-- ── Grants ─────────────────────────────────────────────────────────────────
revoke all on function app.split_feedback(uuid, text), app.session_has_student(uuid, uuid), app.check_class_teacher(uuid)
  from public;
grant execute on function app.depth_rank(text), app.age_band_depth(int), app.class_depth(uuid), app.style_depth(uuid, uuid),
  app.set_class_depth(uuid, text), app.set_skill_tracking(uuid, boolean), app.skills_tracked(uuid),
  app.set_skill_publish(uuid, text), app.is_student_staff(uuid), app.share_skills(uuid), app.skill_history(uuid),
  app.compose_feedback(text[], text), app.class_band(uuid), app.class_chips(uuid), app.customise_class_chips(uuid),
  app.add_class_chip(uuid, text, text, text), app.remove_class_chip(uuid, text, text), app.reset_class_chips(uuid),
  app.set_support_note(uuid, text), app.support_needs() to authenticated;
grant execute on function app.split_feedback(uuid, text), app.session_has_student(uuid, uuid), app.check_class_teacher(uuid)
  to authenticated;
