-- ============================================================================
-- 0029 · Progress: skills, quick class feedback, term reports, a timeline,
--        goals, reflections and milestones (R-020 – R-026)
-- ----------------------------------------------------------------------------
-- Principles kept throughout:
--   · Nothing reaches a family until a teacher shares it.
--   · Teachers record for the children they teach, not the whole school.
--   · Celebrate without pressure: milestones count what a child has done,
--     never what they missed, and nobody is ranked against anyone else.
-- ============================================================================

-- ── R-020 · Skill frameworks ───────────────────────────────────────────────
create table skill_framework (
  id             uuid primary key default gen_random_uuid(),
  studio_id      uuid not null references studio(id) on delete cascade,
  dance_style_id uuid references dance_style(id) on delete cascade,
  level_id       uuid references level(id) on delete set null,
  name           text not null,
  exam_board     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create table framework_skill (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  framework_id uuid not null references skill_framework(id) on delete cascade,
  name         text not null,
  description  text,
  position     smallint not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
alter table skill_assessment add column skill_id uuid references framework_skill(id) on delete set null;
create index skill_assessment_student_idx on skill_assessment (student_id, skill_id, assessed_on desc);

alter table skill_framework enable row level security;  alter table skill_framework force row level security;
alter table framework_skill enable row level security;  alter table framework_skill force row level security;
create policy framework_read on skill_framework for select using (deleted_at is null and studio_id in (select app.studio_ids()));
create policy framework_admin on skill_framework for all using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy framework_skill_read on framework_skill for select using (deleted_at is null and studio_id in (select app.studio_ids()));
create policy framework_skill_admin on framework_skill for all using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
grant select, insert, update on skill_framework, framework_skill to authenticated;
grant all on skill_framework, framework_skill to service_role;

-- Teachers assess the children they teach; the office anyone. (0010 let any
-- member of staff write any child's assessment.)
drop policy assessment_staff on skill_assessment;
create policy assessment_admin on skill_assessment for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy assessment_teacher_read on skill_assessment for select
  using (deleted_at is null and app.has_role(studio_id, 'teacher') and student_id in (select app.teacher_student_ids()));

-- Sensible starting frameworks, one per style, for the school to edit.
create or replace function app.ensure_frameworks(p_studio uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare ds record; fw uuid; n int := 0; skills text[]; i int;
begin
  for ds in select * from dance_style d where d.studio_id = p_studio and d.deleted_at is null
             and not exists (select 1 from skill_framework f where f.dance_style_id = d.id and f.deleted_at is null) loop
    skills := case
      when ds.name ilike '%ballet%' then array['Posture and placement', 'Turnout', 'Pointed feet', 'Pliés', 'Port de bras', 'Pirouettes', 'Allegro', 'Musicality', 'Performance']
      when ds.name ilike '%tap%' then array['Shuffles', 'Flaps', 'Paradiddles', 'Time steps', 'Rhythm and timing', 'Clarity of sounds', 'Performance']
      when ds.name ilike '%street%' or ds.name ilike '%hip%' then array['Grooves', 'Isolations', 'Footwork', 'Freestyle', 'Remembering choreography', 'Musicality', 'Performance']
      when ds.name ilike '%jazz%' then array['Isolations', 'Kicks', 'Turns', 'Leaps', 'Flexibility', 'Style', 'Performance']
      when ds.name ilike '%contemporary%' or ds.name ilike '%modern%' then array['Floorwork', 'Contraction and release', 'Spirals', 'Balance', 'Travelling', 'Musicality', 'Performance']
      else array['Technique', 'Musicality', 'Remembering choreography', 'Performance'] end;
    insert into skill_framework (studio_id, dance_style_id, name) values (p_studio, ds.id, ds.name || ' skills') returning id into fw;
    for i in 1 .. array_length(skills, 1) loop
      insert into framework_skill (studio_id, framework_id, name, position) values (p_studio, fw, skills[i], i);
    end loop;
    n := n + 1;
  end loop;
  return n;
end $$;
select app.ensure_frameworks(id) from studio;

-- Record a level. A new row each time, so the timeline can show the change.
create or replace function app.record_skill(p_student uuid, p_skill uuid, p_level assessment_level,
                                            p_note text default null, p_feedback uuid default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; k record; aid uuid; staff uuid;
begin
  select * into s from student where id = p_student and deleted_at is null;
  if s.id is null or not (app.is_admin(s.studio_id)
       or (app.has_role(s.studio_id, 'teacher') and s.id in (select app.teacher_student_ids()))) then
    raise exception 'FORBIDDEN: you record skills for children you teach' using errcode = 'insufficient_privilege';
  end if;
  select fs.id, fs.name, f.dance_style_id into k from framework_skill fs join skill_framework f on f.id = fs.framework_id
   where fs.id = p_skill and fs.studio_id = s.studio_id and fs.deleted_at is null;
  if k.id is null then raise exception 'NOT_FOUND: that skill' using errcode = 'no_data_found'; end if;
  select id into staff from staff_member where user_id = auth.uid() and studio_id = s.studio_id and deleted_at is null limit 1;
  -- Same skill, same level, same day: nothing new to say.
  if exists (select 1 from skill_assessment a where a.student_id = s.id and a.skill_id = k.id and a.deleted_at is null
              and a.assessed_on = current_date and a.level = p_level) then
    return null;
  end if;
  insert into skill_assessment (studio_id, student_id, feedback_id, dance_style_id, skill, skill_id, level, assessed_by, assessed_on, note)
  values (s.studio_id, s.id, p_feedback, k.dance_style_id, k.name, k.id, p_level, staff, current_date, nullif(btrim(p_note), ''))
  returning id into aid;
  return aid;
end $$;

-- A child's current level in each skill of the styles they dance, with the
-- level before it. Anyone who may see the child may ask.
create or replace function app.can_see_student(p_student uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from student s where s.id = p_student and s.deleted_at is null and (
    app.is_admin(s.studio_id) or s.id = app.student_self_id() or s.id in (select app.guardian_student_ids())
    or (app.has_role(s.studio_id, 'teacher') and s.id in (select app.teacher_student_ids()))));
$$;

create or replace function app.student_skills(p_student uuid)
  returns table (framework_id uuid, framework text, skill_id uuid, skill text, ord smallint,
                 level assessment_level, assessed_on date, previous assessment_level)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if not app.can_see_student(p_student) then return; end if;
  return query
  with mine as (select distinct c.dance_style_id from enrolment e join class c on c.id = e.class_id
                 where e.student_id = p_student and e.status = 'active' and e.deleted_at is null)
  select f.id, f.name, fs.id, fs.name, fs.position, l.level, l.assessed_on,
         (select a.level from skill_assessment a where a.student_id = p_student and a.skill_id = fs.id and a.deleted_at is null
           order by a.assessed_on desc, a.created_at desc offset 1 limit 1)
    from skill_framework f join framework_skill fs on fs.framework_id = f.id and fs.deleted_at is null
    left join lateral (select a.level, a.assessed_on from skill_assessment a
                        where a.student_id = p_student and a.skill_id = fs.id and a.deleted_at is null
                        order by a.assessed_on desc, a.created_at desc limit 1) l on true
   where f.deleted_at is null and f.dance_style_id in (select dance_style_id from mine)
   order by f.name, fs.position;
end $$;

-- ── R-021 · Class feedback in minutes ──────────────────────────────────────
-- Quick phrases the school chooses, in two kinds.
create table feedback_chip (
  id         uuid primary key default gen_random_uuid(),
  studio_id  uuid not null references studio(id) on delete cascade,
  kind       text not null check (kind in ('going_well', 'work_on')),
  label      text not null,
  position   smallint not null default 0,
  deleted_at timestamptz
);
alter table feedback_chip enable row level security; alter table feedback_chip force row level security;
create policy chip_read on feedback_chip for select using (deleted_at is null and studio_id in (select app.studio_ids()));
create policy chip_admin on feedback_chip for all using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
grant select, insert, update on feedback_chip to authenticated;
grant all on feedback_chip to service_role;

create or replace function app.ensure_chips(p_studio uuid) returns void
  language sql security definer set search_path = public, app, pg_temp as $$
  insert into feedback_chip (studio_id, kind, label, position)
  select p_studio, k, l, n from (values
    ('going_well', 'Great focus', 1), ('going_well', 'Lovely posture', 2), ('going_well', 'Brilliant timing', 3),
    ('going_well', 'Remembered the routine', 4), ('going_well', 'Big improvement', 5), ('going_well', 'Kind to others', 6),
    ('work_on', 'Pointed feet', 1), ('work_on', 'Listening to the music', 2), ('work_on', 'Practise at home', 3),
    ('work_on', 'Spotting in turns', 4), ('work_on', 'Using the whole space', 5), ('work_on', 'Confidence', 6)) v(k, l, n)
  where not exists (select 1 from feedback_chip c where c.studio_id = p_studio);
$$;
select app.ensure_chips(id) from studio;

-- Save a whole class's feedback at once. p_items: [{student_id, going_well:[..],
-- work_on:[..], note?, private_note?, skills?: [{skill_id, level}]}]. Drafts
-- unless p_share; a teacher can share later from the same screen.
create or replace function app.save_class_feedback(p_session uuid, p_items jsonb, p_share boolean default false)
  returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; it jsonb; sk jsonb; fid uuid; staff uuid; n int := 0; gw text; wo text;
begin
  select x.id, x.class_id, c.studio_id into cs from class_session x join class c on c.id = x.class_id where x.id = p_session;
  if cs.id is null or not (app.is_admin(cs.studio_id) or cs.class_id in (select app.teacher_class_ids())) then
    raise exception 'FORBIDDEN: not your class' using errcode = 'insufficient_privilege';
  end if;
  select id into staff from staff_member where user_id = auth.uid() and studio_id = cs.studio_id and deleted_at is null limit 1;
  for it in select * from jsonb_array_elements(p_items) loop
    if not exists (select 1 from enrolment e where e.class_id = cs.class_id and e.student_id = (it ->> 'student_id')::uuid and e.deleted_at is null)
       and not exists (select 1 from trial t where t.session_id = cs.id and t.student_id = (it ->> 'student_id')::uuid) then
      raise exception 'INVALID: a child in the list is not in this class' using errcode = 'check_violation';
    end if;
    gw := nullif(concat_ws('. ', nullif(array_to_string(array(select jsonb_array_elements_text(coalesce(it -> 'going_well', '[]'))), ', '), ''),
                                 nullif(btrim(it ->> 'note'), '')), '');
    wo := nullif(array_to_string(array(select jsonb_array_elements_text(coalesce(it -> 'work_on', '[]'))), ', '), '');
    if gw is null and wo is null and coalesce(jsonb_array_length(it -> 'skills'), 0) = 0 then continue; end if;
    -- One note per child per session: saving again updates the draft.
    select id into fid from feedback_note where session_id = cs.id and student_id = (it ->> 'student_id')::uuid and deleted_at is null;
    if fid is null then
      insert into feedback_note (studio_id, student_id, class_id, session_id, author_id, headline, going_well, work_on, private_note, shared_at)
      values (cs.studio_id, (it ->> 'student_id')::uuid, cs.class_id, cs.id, staff,
              (select name from class where id = cs.class_id), gw, wo, nullif(btrim(it ->> 'private_note'), ''),
              case when p_share then now() end)
      returning id into fid;
    else
      update feedback_note set going_well = gw, work_on = wo, private_note = nullif(btrim(it ->> 'private_note'), ''),
             shared_at = case when p_share then coalesce(shared_at, now()) else shared_at end, updated_at = now()
       where id = fid;
    end if;
    for sk in select * from jsonb_array_elements(coalesce(it -> 'skills', '[]')) loop
      perform app.record_skill((it ->> 'student_id')::uuid, (sk ->> 'skill_id')::uuid, (sk ->> 'level')::assessment_level, null, fid);
    end loop;
    n := n + 1;
  end loop;
  return n;
end $$;

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
  return n;
end $$;

-- Families hear when feedback is shared with them.
create or replace function app.on_feedback_shared() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student;
begin
  if new.shared_at is not null and (tg_op = 'INSERT' or old.shared_at is null) then
    select * into s from student where id = new.student_id;
    if new.share_with_guardian then
      perform app.notify_family(s.family_id, 'feedback_published', 'Feedback for ' || s.first_name,
                                coalesce(left(new.going_well, 120), 'From ' || coalesce(new.headline, 'class')), '/family/feedback');
    end if;
    if new.share_with_student and s.user_id is not null and s.login_enabled then
      perform app.notify_user(s.studio_id, s.user_id, 'feedback_published', 'New feedback from your teacher',
                              coalesce(left(new.going_well, 120), ''), '/learn/feedback');
    end if;
  end if;
  return null;
end $$;
create trigger feedback_shared after insert or update of shared_at on feedback_note
  for each row execute function app.on_feedback_shared();

-- ── R-022 · Term reports ───────────────────────────────────────────────────
create table progress_report (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  term_id     uuid not null references term(id) on delete cascade,
  class_id    uuid references class(id) on delete set null,
  summary     jsonb not null,          -- what the term's notes and skills say, assembled
  comment     text,                    -- the teacher's own words
  status      text not null default 'draft' check (status in ('draft', 'shared')),
  author_id   uuid references staff_member(id) on delete set null,
  shared_at   timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  unique (student_id, term_id, class_id)
);
alter table progress_report enable row level security; alter table progress_report force row level security;
create policy report_admin on progress_report for all using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy report_teacher on progress_report for all
  using (deleted_at is null and app.has_role(studio_id, 'teacher') and student_id in (select app.teacher_student_ids()))
  with check (app.has_role(studio_id, 'teacher') and student_id in (select app.teacher_student_ids()));
create policy report_family_read on progress_report for select
  using (deleted_at is null and status = 'shared' and (student_id in (select app.guardian_student_ids()) or student_id = app.student_self_id()));
grant select, update on progress_report to authenticated;
grant all on progress_report to service_role;

-- Draft one report per child in a class for its term, from the term's shared
-- and unshared notes, chips and skill changes. Existing drafts are refreshed;
-- shared reports are left alone.
create or replace function app.draft_class_reports(p_class uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c class; t term; s record; summary jsonb; staff uuid; n int := 0;
begin
  select * into c from class where id = p_class and deleted_at is null;
  if c.id is null or not (app.is_admin(c.studio_id) or c.id in (select app.teacher_class_ids())) then
    raise exception 'FORBIDDEN: not your class' using errcode = 'insufficient_privilege';
  end if;
  select * into t from term where id = c.term_id;
  select id into staff from staff_member where user_id = auth.uid() and studio_id = c.studio_id and deleted_at is null limit 1;
  for s in select st.* from enrolment e join student st on st.id = e.student_id and st.deleted_at is null
            where e.class_id = c.id and e.status = 'active' and e.deleted_at is null loop
    summary := jsonb_build_object(
      'attendance', (select jsonb_build_object('present', count(*) filter (where a.status in ('present', 'late')), 'of', count(*))
                       from attendance_record a join class_session cs on cs.id = a.session_id
                      where a.student_id = s.id and cs.class_id = c.id and a.deleted_at is null),
      'going_well', (select coalesce(jsonb_agg(distinct x), '[]') from feedback_note f,
                       lateral regexp_split_to_table(coalesce(f.going_well, ''), '[,.]\s*') x
                      where f.student_id = s.id and f.class_id = c.id and f.deleted_at is null and btrim(x) <> ''
                        and f.created_at >= t.starts_on),
      'work_on', (select coalesce(jsonb_agg(distinct x), '[]') from feedback_note f,
                    lateral regexp_split_to_table(coalesce(f.work_on, ''), ',\s*') x
                   where f.student_id = s.id and f.class_id = c.id and f.deleted_at is null and btrim(x) <> ''
                     and f.created_at >= t.starts_on),
      'skills', (select coalesce(jsonb_agg(jsonb_build_object('skill', k.skill, 'level', k.level, 'from', k.from_level) order by k.position), '[]')
                   from (select fs.name skill, fs.position,
                                (select a.level from skill_assessment a where a.student_id = s.id and a.skill_id = fs.id and a.deleted_at is null
                                  order by a.assessed_on desc, a.created_at desc limit 1) level,
                                (select a.level from skill_assessment a where a.student_id = s.id and a.skill_id = fs.id and a.deleted_at is null
                                    and a.assessed_on < t.starts_on order by a.assessed_on desc limit 1) from_level
                           from skill_framework f join framework_skill fs on fs.framework_id = f.id and fs.deleted_at is null
                          where f.dance_style_id = c.dance_style_id and f.deleted_at is null) k
                  where k.level is not null));
    insert into progress_report (studio_id, student_id, term_id, class_id, summary, author_id)
    values (c.studio_id, s.id, t.id, c.id, summary, staff)
    on conflict (student_id, term_id, class_id) do update set summary = excluded.summary, updated_at = now()
      where progress_report.status = 'draft';
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function app.share_reports(p_ids uuid[]) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r progress_report; n int := 0;
begin
  for r in select * from progress_report where id = any(p_ids) and status = 'draft' and deleted_at is null loop
    if not (app.is_admin(r.studio_id) or (app.has_role(r.studio_id, 'teacher') and r.student_id in (select app.teacher_student_ids()))) then
      raise exception 'FORBIDDEN: not your student' using errcode = 'insufficient_privilege';
    end if;
    update progress_report set status = 'shared', shared_at = now(), updated_at = now() where id = r.id;
    perform app.notify_family((select family_id from student where id = r.student_id), 'report_shared',
      'Term report for ' || (select first_name from student where id = r.student_id), coalesce(left(r.comment, 120), ''), '/family/feedback');
    n := n + 1;
  end loop;
  return n;
end $$;

-- ── R-024 · Goals ──────────────────────────────────────────────────────────
create table student_goal (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  term_id     uuid references term(id) on delete set null,
  text        text not null check (length(btrim(text)) between 3 and 200),
  status      text not null default 'proposed' check (status in ('proposed', 'agreed', 'achieved', 'dropped')),
  proposed_by uuid references user_account(id) on delete set null,
  agreed_by   uuid references user_account(id) on delete set null,
  review_note text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
alter table student_goal enable row level security; alter table student_goal force row level security;
create policy goal_staff on student_goal for all
  using (deleted_at is null and (app.is_admin(studio_id) or (app.has_role(studio_id, 'teacher') and student_id in (select app.teacher_student_ids()))))
  with check (app.is_admin(studio_id) or (app.has_role(studio_id, 'teacher') and student_id in (select app.teacher_student_ids())));
create policy goal_student on student_goal for select using (deleted_at is null and student_id = app.student_self_id());
create policy goal_student_propose on student_goal for insert
  with check (student_id = app.student_self_id() and status = 'proposed' and proposed_by = auth.uid());
create policy goal_family_read on student_goal for select
  using (deleted_at is null and status <> 'proposed' and student_id in (select app.guardian_student_ids()));
grant select, insert, update on student_goal to authenticated;
grant all on student_goal to service_role;

create or replace function app.goal_stamp() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if tg_op = 'INSERT' then
    select studio_id into new.studio_id from student where id = new.student_id;
    new.proposed_by := coalesce(auth.uid(), new.proposed_by);
    new.term_id := coalesce(new.term_id, (select t.id from term t where t.studio_id = new.studio_id
                                            and current_date between t.starts_on and t.ends_on and t.deleted_at is null limit 1));
    if (select count(*) from student_goal g where g.student_id = new.student_id and g.term_id is not distinct from new.term_id
          and g.status in ('proposed', 'agreed') and g.deleted_at is null) >= 2 then
      raise exception 'INVALID: two goals a term is plenty — finish or drop one first' using errcode = 'check_violation';
    end if;
  end if;
  if new.status = 'agreed' and (tg_op = 'INSERT' or old.status <> 'agreed') then new.agreed_by := auth.uid(); end if;
  return new;
end $$;
create trigger goal_stamp before insert or update on student_goal for each row execute function app.goal_stamp();

-- ── R-025 · Reflections ────────────────────────────────────────────────────
-- For students thirteen and over. Seen by the student and their teachers only
-- — not parents, not other students. A worrying reflection is something a
-- teacher acts on through safeguarding (0030), never by sharing it here.
create table student_reflection (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  session_id  uuid references class_session(id) on delete set null,
  mood        smallint not null check (mood between 1 and 5),
  text        text check (text is null or length(text) <= 280),
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
alter table student_reflection enable row level security; alter table student_reflection force row level security;
create policy reflection_student on student_reflection for select using (deleted_at is null and student_id = app.student_self_id());
create policy reflection_teacher on student_reflection for select
  using (deleted_at is null and app.has_role(studio_id, 'teacher') and student_id in (select app.teacher_student_ids()));
grant select on student_reflection to authenticated;
grant all on student_reflection to service_role;

create or replace function app.add_reflection(p_session uuid, p_mood int, p_text text default null) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; rid uuid;
begin
  select * into s from student where id = app.student_self_id();
  if s.id is null then raise exception 'FORBIDDEN: reflections are for students' using errcode = 'insufficient_privilege'; end if;
  if extract(year from age(current_date, s.date_of_birth)) < 13 then
    raise exception 'INVALID: reflections are for students aged 13 and over' using errcode = 'check_violation';
  end if;
  if p_session is not null and not exists (select 1 from attendance_record a where a.session_id = p_session and a.student_id = s.id
                                             and a.status in ('present', 'late') and a.deleted_at is null) then
    raise exception 'INVALID: reflect on a class you were at' using errcode = 'check_violation';
  end if;
  insert into student_reflection (studio_id, student_id, session_id, mood, text)
  values (s.studio_id, s.id, p_session, p_mood, nullif(btrim(p_text), '')) returning id into rid;
  return rid;
end $$;

-- ── R-026 · Milestones ─────────────────────────────────────────────────────
create table milestone (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  kind        text not null,      -- first_class, classes_10, classes_25, …, one_year, first_show, exam
  title       text not null,
  reached_on  date not null default current_date,
  unique (student_id, kind)
);
alter table milestone enable row level security; alter table milestone force row level security;
create policy milestone_read on milestone for select using (
  app.is_admin(studio_id) or student_id = app.student_self_id() or student_id in (select app.guardian_student_ids())
  or (app.has_role(studio_id, 'teacher') and student_id in (select app.teacher_student_ids())));
grant select on milestone to authenticated;
grant all on milestone to service_role;

create or replace function app.award_milestone(p_student uuid, p_kind text, p_title text, p_on date default current_date) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; mid uuid;
begin
  select * into s from student where id = p_student;
  insert into milestone (studio_id, student_id, kind, title, reached_on) values (s.studio_id, s.id, p_kind, p_title, p_on)
  on conflict (student_id, kind) do nothing returning id into mid;
  if mid is not null and p_on >= current_date - 1 then
    perform app.notify_family(s.family_id, 'milestone', s.first_name || ': ' || p_title, 'Well done!', '/family/feedback');
    if s.user_id is not null and s.login_enabled then
      perform app.notify_user(s.studio_id, s.user_id, 'milestone', p_title, 'Well done!', '/learn');
    end if;
  end if;
end $$;

-- Counting classes attended. Absences never take anything away.
create or replace function app.on_attendance_milestone() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare n int; first_day date; d date;
begin
  if new.status not in ('present', 'late') or new.deleted_at is not null then return null; end if;
  -- Count up to and including this class, so a register entered late (or a
  -- history loaded in one go) still awards each milestone on the right day.
  select cs.starts_at::date into d from class_session cs where cs.id = new.session_id;
  select count(*), min(cs.starts_at::date) into n, first_day from attendance_record a join class_session cs on cs.id = a.session_id
   where a.student_id = new.student_id and a.status in ('present', 'late') and a.deleted_at is null
     and cs.starts_at <= (select starts_at from class_session where id = new.session_id);
  if n = 1 then perform app.award_milestone(new.student_id, 'first_class', 'First class', d); end if;
  if n in (10, 25, 50, 100, 200, 300, 500) then
    perform app.award_milestone(new.student_id, 'classes_' || n, n || ' classes', d);
  end if;
  if first_day <= d - interval '1 year' then
    perform app.award_milestone(new.student_id, 'one_year', 'One year of dancing', d);
  end if;
  return null;
end $$;
create trigger attendance_milestone after insert or update of status on attendance_record
  for each row execute function app.on_attendance_milestone();

-- Shows and exams, once they have happened.
create or replace function app.award_event_milestones(p_studio uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare p record; n int := 0;
begin
  for p in select ep.student_id, e.kind, e.title, e.starts_at::date d from event_participant ep
             join studio_event e on e.id = ep.event_id and e.deleted_at is null and e.starts_at < now()
            where ep.studio_id = p_studio and ep.status = 'confirmed' and ep.deleted_at is null and e.kind in ('show', 'exam', 'competition')
            order by e.starts_at loop
    perform app.award_milestone(p.student_id, case p.kind when 'show' then 'first_show' when 'exam' then 'first_exam' else 'first_competition' end,
      case p.kind when 'show' then 'First show: ' when 'exam' then 'First exam: ' else 'First competition: ' end || p.title, p.d);
    n := n + 1;
  end loop;
  return n;
end $$;

-- New styles get a starting framework; new schools get the starting phrases.
create or replace function app.on_style_added() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin perform app.ensure_frameworks(new.studio_id); return null; end $$;
create trigger style_framework after insert on dance_style for each row execute function app.on_style_added();
create or replace function app.on_studio_chips() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin perform app.ensure_chips(new.id); return null; end $$;
create trigger studio_chips after insert on studio for each row execute function app.on_studio_chips();

-- ── R-023 · One timeline ───────────────────────────────────────────────────
-- Everything about a child's progress in date order. Security invoker: each
-- branch is filtered by the caller's own access, so a parent sees shared
-- feedback and never a draft, and a student never sees what was kept from them.
create or replace function app.student_timeline(p_student uuid)
  returns table (at timestamptz, kind text, title text, detail text, level text, previous text)
  language sql stable security invoker set search_path = public, app, pg_temp as $$
  select a.assessed_on::timestamptz, 'skill', a.skill, a.note, a.level::text,
         (select b.level::text from skill_assessment b where b.student_id = a.student_id and b.skill_id = a.skill_id and b.deleted_at is null
            and (b.assessed_on, b.created_at) < (a.assessed_on, a.created_at) order by b.assessed_on desc, b.created_at desc limit 1)
    from skill_assessment a where a.student_id = p_student and a.deleted_at is null
  union all
  select coalesce(f.shared_at, f.created_at), 'feedback', coalesce(f.headline, 'Feedback'),
         concat_ws(' · ', nullif(f.going_well, ''), case when f.work_on is not null then 'Next: ' || f.work_on end), null, null
    from feedback_note f where f.student_id = p_student and f.deleted_at is null
  union all
  select m.reached_on::timestamptz, 'milestone', m.title, null, null, null from milestone m where m.student_id = p_student
  union all
  select g.updated_at, 'goal', g.text, g.status, null, null from student_goal g where g.student_id = p_student and g.deleted_at is null
  union all
  select r.shared_at, 'report', 'Term report', r.comment, null, null from progress_report r
   where r.student_id = p_student and r.deleted_at is null and r.status = 'shared'
  order by 1 desc;
$$;

-- Soft delete now covers the progress settings too (RLS hides a deleted row
-- from its own update, so removal goes through this checked function).
create or replace function app.soft_delete(p_table text, p_id uuid)
  returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid;
  allowed constant text[] := array[
    'family','guardian','student','emergency_contact','consent_record','medical_record',
    'location','room','staff_member','term','term_break','dance_style','level',
    'class','class_session','enrolment','trial','waitlist_entry','enquiry',
    'invoice','invoice_item','communication','communication_template','notification',
    'skill_framework','framework_skill','feedback_chip'];
begin
  if not (p_table = any(allowed)) then
    raise exception 'SOFT_DELETE_UNSUPPORTED: %', p_table using errcode = 'feature_not_supported';
  end if;

  execute format('select studio_id from %I where id = $1 and deleted_at is null', p_table)
    into sid using p_id;
  if sid is null then return false; end if;         -- absent or already deleted

  if not app.is_admin(sid) then
    raise exception 'FORBIDDEN: soft delete requires owner or admin' using errcode = 'insufficient_privilege';
  end if;

  execute format('update %I set deleted_at = now() where id = $1', p_table) using p_id;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'soft_delete', p_table, p_id, 'soft deleted');
  return true;
end $$;

revoke all on function app.ensure_frameworks(uuid), app.ensure_chips(uuid), app.award_milestone(uuid, text, text, date),
  app.award_event_milestones(uuid) from public;
grant execute on function app.ensure_frameworks(uuid), app.ensure_chips(uuid), app.award_event_milestones(uuid) to service_role;
grant execute on function app.record_skill(uuid, uuid, assessment_level, text, uuid), app.student_skills(uuid),
  app.save_class_feedback(uuid, jsonb, boolean), app.share_session_feedback(uuid), app.draft_class_reports(uuid),
  app.share_reports(uuid[]), app.add_reflection(uuid, int, text), app.student_timeline(uuid) to authenticated;
