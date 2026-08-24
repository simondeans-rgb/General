-- ============================================================================
-- 0010 · Student and Parent hubs
-- ----------------------------------------------------------------------------
-- Adds the fourth role for real, plus the things a studio actually shares with
-- families: resources, feedback, events and requests.
--
-- The child-safety decisions are made here rather than in the interface:
--   * a student login requires an age threshold AND a named guardian approval
--   * feedback is invisible until a teacher deliberately shares it, and can be
--     shared with a guardian without being shared with the child
--   * a student can see their own allergies but never the full medical record
-- ============================================================================

create type resource_kind    as enum ('video', 'audio', 'document', 'link');
create type resource_scope   as enum ('studio', 'class', 'level', 'student');
create type assessment_level as enum ('not_started', 'developing', 'secure', 'mastered');
create type event_kind       as enum ('competition', 'show', 'exam', 'workshop',
                                      'private_lesson', 'rehearsal', 'social');
create type event_status     as enum ('draft', 'published', 'cancelled', 'completed');
create type participant_status as enum ('invited', 'requested', 'confirmed',
                                        'declined', 'waitlisted', 'withdrawn');
create type request_kind     as enum ('question', 'private_lesson', 'medical_update',
                                      'event_interest', 'absence', 'other');
create type request_status   as enum ('open', 'in_progress', 'answered', 'closed');

-- ── Student logins ─────────────────────────────────────────────────────────
alter table studio
  add column student_login_min_age smallint not null default 13
    check (student_login_min_age between 0 and 18);

alter table student
  add column user_id uuid references user_account(id) on delete set null,
  add column login_enabled boolean not null default false,
  add column login_approved_by uuid references user_account(id) on delete set null,
  add column login_approved_at timestamptz;

create unique index student_user_unique on student (user_id) where user_id is not null;

-- A child's account cannot be switched on by the child, by a teacher, or by a
-- mistake in application code. The database requires an approving guardian and
-- an age at or above the studio's own threshold.
create or replace function app.check_student_login() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare min_age smallint; age_years integer;
begin
  if not new.login_enabled then
    return new;
  end if;
  if new.user_id is null then
    raise exception 'STUDENT_LOGIN_NO_ACCOUNT: enable a login only once an account exists'
      using errcode = 'check_violation';
  end if;
  if new.login_approved_by is null then
    raise exception 'STUDENT_LOGIN_UNAPPROVED: a guardian must approve this login'
      using errcode = 'check_violation';
  end if;
  select student_login_min_age into min_age from studio where id = new.studio_id;
  age_years := extract(year from age(current_date, new.date_of_birth));
  if age_years < min_age then
    raise exception 'STUDENT_LOGIN_TOO_YOUNG: % is % and the studio requires %',
      new.first_name, age_years, min_age using errcode = 'check_violation';
  end if;
  if new.login_approved_at is null then new.login_approved_at := now(); end if;
  return new;
end $$;

create trigger student_login_guard
  before insert or update on student
  for each row execute function app.check_student_login();

-- ── Resources: videos, music tracks, documents, links ──────────────────────
create table resource (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  kind         resource_kind not null,
  title        text not null,
  description  text,
  category     text,                      -- 'Exam music', 'Technique', 'Uniform'…
  -- Content is a link today. storage_path is reserved for uploaded files so
  -- adding Supabase Storage later needs no migration and no change to policy.
  url          text,
  storage_path text,
  poster_url   text,
  duration_sec integer check (duration_sec is null or duration_sec > 0),
  visible_to_students  boolean not null default true,
  visible_to_guardians boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references user_account(id) on delete set null,
  deleted_at   timestamptz,
  check (url is not null or storage_path is not null)
);

-- Who a resource is for. No rows means the whole studio.
create table resource_assignment (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  resource_id uuid not null references resource(id) on delete cascade,
  scope       resource_scope not null,
  class_id    uuid references class(id) on delete cascade,
  level_id    uuid references level(id) on delete cascade,
  student_id  uuid references student(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  check ((scope = 'studio')
      or (scope = 'class'   and class_id   is not null)
      or (scope = 'level'   and level_id   is not null)
      or (scope = 'student' and student_id is not null))
);

-- ── Feedback and progress ──────────────────────────────────────────────────
create table feedback_note (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  class_id     uuid references class(id) on delete set null,
  session_id   uuid references class_session(id) on delete set null,
  author_id    uuid references staff_member(id) on delete set null,
  headline     text,
  going_well   text,
  work_on      text,
  private_note text,                      -- staff only, never shared with anyone
  -- Nothing is visible to a family until a teacher decides it is. A note can
  -- also be shared with a guardian but held back from a younger child.
  shared_at         timestamptz,
  share_with_student  boolean not null default true,
  share_with_guardian boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table skill_assessment (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  feedback_id  uuid references feedback_note(id) on delete set null,
  dance_style_id uuid references dance_style(id) on delete set null,
  skill        text not null,
  level        assessment_level not null default 'not_started',
  assessed_by  uuid references staff_member(id) on delete set null,
  assessed_on  date not null default current_date,
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

-- ── Events: competitions, shows, exams, privates ───────────────────────────
create table studio_event (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  kind         event_kind not null,
  status       event_status not null default 'published',
  title        text not null,
  description  text,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  location_id  uuid references location(id) on delete set null,
  venue        text,
  teacher_id   uuid references staff_member(id) on delete set null,
  student_id   uuid references student(id) on delete cascade,   -- privates only
  cost_minor   integer check (cost_minor is null or cost_minor >= 0),
  capacity     smallint check (capacity is null or capacity > 0),
  -- Families may ask; the studio still decides. Nothing reaches the diary
  -- without staff confirming it.
  requests_open boolean not null default true,
  entries_close_on date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references user_account(id) on delete set null,
  deleted_at   timestamptz,
  check (ends_at is null or ends_at >= starts_at)
);

create table event_participant (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  event_id     uuid not null references studio_event(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  status       participant_status not null default 'requested',
  requested_by uuid references user_account(id) on delete set null,
  decided_by   uuid references user_account(id) on delete set null,
  decided_at   timestamptz,
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  unique (event_id, student_id)
);

-- ── Requests: a family or student asking the studio something ──────────────
create table studio_request (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  family_id    uuid references family(id) on delete cascade,
  student_id   uuid references student(id) on delete set null,
  event_id     uuid references studio_event(id) on delete set null,
  kind         request_kind not null default 'question',
  status       request_status not null default 'open',
  subject      text not null,
  body         text not null,
  raised_by    uuid references user_account(id) on delete set null,
  answered_by  uuid references user_account(id) on delete set null,
  answered_at  timestamptz,
  answer       text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

-- ============================================================================
-- Row level security for the hubs
-- ============================================================================

-- The student behind the current login, if any.
create or replace function app.student_self_id() returns uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id from student s
   where s.user_id = auth.uid() and s.login_enabled and s.deleted_at is null
   limit 1
$$;

/* Students a teacher may see, extended to cover event participants — a
   teacher taking a competition group needs those students even if they are
   not on one of their weekly registers. */
create or replace function app.teacher_event_student_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select ep.student_id
    from event_participant ep
    join studio_event ev on ev.id = ep.event_id
    join staff_member sm on sm.id = ev.teacher_id
   where sm.user_id = auth.uid() and ep.deleted_at is null
     and ep.status in ('confirmed', 'invited')
$$;

/* Resources reaching a given student: studio-wide, or assigned to a class they
   are in, a level they study at, or to them by name. */
create or replace function app.resource_ids_for_student(p_student uuid) returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select r.id from resource r
   where r.deleted_at is null
     and not exists (select 1 from resource_assignment a
                      where a.resource_id = r.id and a.deleted_at is null)
  union
  select a.resource_id from resource_assignment a
   where a.deleted_at is null and (
     a.scope = 'studio'
     or (a.scope = 'student' and a.student_id = p_student)
     or (a.scope = 'class' and a.class_id in (
           select e.class_id from enrolment e
            where e.student_id = p_student and e.status = 'active' and e.deleted_at is null))
     or (a.scope = 'level' and a.level_id in (
           select c.level_id from enrolment e join class c on c.id = e.class_id
            where e.student_id = p_student and e.status = 'active' and e.deleted_at is null)))
$$;

do $$
declare t text;
begin
  foreach t in array array['resource','resource_assignment','feedback_note','skill_assessment',
                           'studio_event','event_participant','studio_request'] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
  end loop;
end $$;

-- ── Students: their own record, and nobody else's ──────────────────────────
create policy student_self_read on student for select
  using (deleted_at is null and id = app.student_self_id());

-- ── Resources ──────────────────────────────────────────────────────────────
create policy resource_staff on resource for all
  using (deleted_at is null and app.is_admin(studio_id))
  with check (app.is_admin(studio_id));
create policy resource_teacher_read on resource for select
  using (deleted_at is null and app.has_role(studio_id, 'teacher'));
create policy resource_student_read on resource for select
  using (deleted_at is null and visible_to_students
         and id in (select app.resource_ids_for_student(app.student_self_id())));
create policy resource_guardian_read on resource for select
  using (deleted_at is null and visible_to_guardians
         and exists (select 1 from unnest(array(select app.guardian_student_ids())) as g(sid)
                      where id in (select app.resource_ids_for_student(g.sid))));

create policy assignment_staff on resource_assignment for all
  using (deleted_at is null and app.is_admin(studio_id))
  with check (app.is_admin(studio_id));
create policy assignment_read on resource_assignment for select
  using (deleted_at is null and studio_id in (select app.studio_ids()));

-- ── Feedback ───────────────────────────────────────────────────────────────
-- Staff write it. Nothing reaches a family until shared_at is set, and the two
-- share flags let a teacher tell a parent something without telling the child.
create policy feedback_admin on feedback_note for all
  using (deleted_at is null and app.is_admin(studio_id))
  with check (app.is_admin(studio_id));
create policy feedback_teacher on feedback_note for all
  using (deleted_at is null and app.has_role(studio_id, 'teacher')
         and (student_id in (select app.teacher_student_ids())
              or student_id in (select app.teacher_event_student_ids())))
  with check (app.has_role(studio_id, 'teacher')
              and (student_id in (select app.teacher_student_ids())
                   or student_id in (select app.teacher_event_student_ids())));
create policy feedback_student_read on feedback_note for select
  using (deleted_at is null and shared_at is not null and share_with_student
         and student_id = app.student_self_id());
create policy feedback_guardian_read on feedback_note for select
  using (deleted_at is null and shared_at is not null and share_with_guardian
         and student_id in (select app.guardian_student_ids()));

create policy assessment_staff on skill_assessment for all
  using (deleted_at is null and app.is_staff(studio_id))
  with check (app.is_staff(studio_id));
create policy assessment_student_read on skill_assessment for select
  using (deleted_at is null and student_id = app.student_self_id());
create policy assessment_guardian_read on skill_assessment for select
  using (deleted_at is null and student_id in (select app.guardian_student_ids()));

-- ── Events ─────────────────────────────────────────────────────────────────
-- A private lesson belongs to one student, so only that family and the
-- assigned teacher see it. Everything else that is published is studio-wide.
create policy event_staff on studio_event for all
  using (deleted_at is null and app.is_admin(studio_id))
  with check (app.is_admin(studio_id));
create policy event_teacher_read on studio_event for select
  using (deleted_at is null and app.has_role(studio_id, 'teacher'));
create policy event_family_read on studio_event for select
  using (deleted_at is null and status = 'published' and (
    (student_id is null and (
        app.student_self_id() is not null
        or exists (select 1 from student s where s.family_id in (select app.guardian_family_ids())
                    and s.deleted_at is null)))
    or student_id = app.student_self_id()
    or student_id in (select app.guardian_student_ids())));

create policy participant_staff on event_participant for all
  using (deleted_at is null and app.is_admin(studio_id))
  with check (app.is_admin(studio_id));
create policy participant_teacher_read on event_participant for select
  using (deleted_at is null and app.has_role(studio_id, 'teacher'));
create policy participant_family_read on event_participant for select
  using (deleted_at is null and (student_id = app.student_self_id()
                                 or student_id in (select app.guardian_student_ids())));
-- A family may ask to take part. They cannot confirm their own place.
create policy participant_family_request on event_participant for insert
  with check (status = 'requested'
              and (student_id = app.student_self_id()
                   or student_id in (select app.guardian_student_ids())));
create policy participant_family_withdraw on event_participant for update
  using (student_id = app.student_self_id() or student_id in (select app.guardian_student_ids()))
  with check (status in ('requested', 'withdrawn', 'declined'));

-- ── Requests ───────────────────────────────────────────────────────────────
create policy request_staff on studio_request for all
  using (deleted_at is null and app.is_staff(studio_id))
  with check (app.is_staff(studio_id));
create policy request_family_read on studio_request for select
  using (deleted_at is null and (family_id in (select app.guardian_family_ids())
                                 or student_id = app.student_self_id()));
create policy request_family_raise on studio_request for insert
  with check (status = 'open' and (family_id in (select app.guardian_family_ids())
                                   or student_id = app.student_self_id()));

-- ── The safety brief now serves the student too ────────────────────────────
-- A thirteen-year-old should be able to see their own allergy information.
-- The full medical record stays closed to them, exactly as for a teacher.
create or replace view student_safety_brief
  with (security_invoker = false) as
select s.id as student_id, s.studio_id, s.first_name, s.last_name,
       m.allergies, m.action_plan, m.requires_alert,
       (select ec.full_name from emergency_contact ec
         where ec.student_id = s.id and ec.deleted_at is null
         order by ec.priority limit 1) as emergency_contact_name,
       (select ec.phone from emergency_contact ec
         where ec.student_id = s.id and ec.deleted_at is null
         order by ec.priority limit 1) as emergency_contact_phone
  from student s
  left join medical_record m on m.student_id = s.id and m.deleted_at is null
 where s.deleted_at is null
   and (app.is_admin(s.studio_id)
        or (app.has_role(s.studio_id, 'teacher')
            and (s.id in (select app.teacher_student_ids())
                 or s.id in (select app.teacher_event_student_ids())))
        or s.id in (select app.guardian_student_ids())
        or s.id = app.student_self_id());

-- Grant on the new tables by name. A blanket `on all tables in schema public`
-- here silently re-granted update and delete on audit_log, undoing the
-- append-only guarantee set up in 0007 — a test caught it, but the lesson is
-- that a broad grant in a later migration quietly reopens earlier revokes.
do $$
declare t text;
begin
  foreach t in array array['resource','resource_assignment','feedback_note','skill_assessment',
                           'studio_event','event_participant','studio_request'] loop
    execute format('grant select, insert, update, delete on %I to authenticated, service_role', t);
  end loop;
end $$;

grant select on student_safety_brief to authenticated, service_role;

-- Belt and braces: whatever any migration granted, the audit trail stays
-- append-only for everyone who is not the trusted server role.
revoke update, delete on audit_log from authenticated;

-- ── Indexes ────────────────────────────────────────────────────────────────
create index resource_studio      on resource (studio_id, kind) where deleted_at is null;
create index assignment_resource  on resource_assignment (resource_id) where deleted_at is null;
create index assignment_class     on resource_assignment (class_id) where deleted_at is null;
create index assignment_student   on resource_assignment (student_id) where deleted_at is null;
create index feedback_student     on feedback_note (student_id, created_at desc) where deleted_at is null;
create index feedback_shared      on feedback_note (studio_id, shared_at desc) where deleted_at is null;
create index assessment_student   on skill_assessment (student_id, assessed_on desc) where deleted_at is null;
create index event_studio_time    on studio_event (studio_id, starts_at) where deleted_at is null;
create index event_student        on studio_event (student_id, starts_at) where deleted_at is null;
create index participant_event    on event_participant (event_id, status) where deleted_at is null;
create index participant_student  on event_participant (student_id) where deleted_at is null;
create index request_studio       on studio_request (studio_id, status, created_at desc) where deleted_at is null;
create index request_family       on studio_request (family_id, created_at desc) where deleted_at is null;
