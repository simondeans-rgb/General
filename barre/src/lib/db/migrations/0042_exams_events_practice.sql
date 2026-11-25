-- ============================================================================
-- 0042 · Exams, show depth, practice (R-058, R-057, R-059)
-- ----------------------------------------------------------------------------
-- Exams: a school records an exam session (board, date, venue, fee) and
-- enters children for a grade. Grade names are typed by the school — no
-- syllabus text is copied. Results arrive as a band (pass, merit,
-- distinction…) and an optional mark; a pass becomes a milestone. Fees go
-- on the family's account in one step.
--
-- Shows: costume items with each dancer's size and where the costume is;
-- a register for rehearsals with medical markers; a printable programme that
-- names a child only with their family's photography consent; and audience
-- tickets, which families book against an invoice (card payment comes with
-- the payments module).
--
-- Practice: a student (or their parent) logs practice; their teachers see a
-- weekly total. A teacher or the office can attach a demonstration link to a
-- skill. Students never upload video.
-- ============================================================================

-- ── Exams ──────────────────────────────────────────────────────────────────
create table exam_session (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  board       text not null,                         -- RAD, ISTD, IDTA, BTDA, or the school's own
  title       text not null,
  exam_on     date not null,
  venue       text,
  entries_close_on date,
  created_by  uuid references user_account(id) on delete set null,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create table exam_entry (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  session_id  uuid not null references exam_session(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  grade       text not null,                         -- "Grade 3", "Intermediate Foundation"…
  framework_id uuid references skill_framework(id) on delete set null,
  fee_minor   integer not null default 0 check (fee_minor >= 0),
  status      text not null default 'entered' check (status in ('entered', 'withdrawn', 'sat')),
  result      text check (result is null or result in ('distinction', 'merit', 'pass', 'commended', 'highly_commended', 'not_yet')),
  mark        smallint check (mark is null or mark between 0 and 100),
  certificate_received boolean not null default false,
  invoice_id  uuid references invoice(id) on delete set null,
  entered_by  uuid references user_account(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (session_id, student_id, grade)
);
alter table exam_session enable row level security; alter table exam_session force row level security;
alter table exam_entry enable row level security;   alter table exam_entry force row level security;
create policy exam_session_read on exam_session for select using (deleted_at is null and studio_id in (select app.studio_ids()));
create policy exam_session_admin on exam_session for all using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy exam_entry_read on exam_entry for select using (
  app.is_admin(studio_id) or student_id in (select app.guardian_student_ids()) or student_id = app.student_self_id()
  or (app.has_role(studio_id, 'teacher') and student_id in (select app.teacher_student_ids())));
grant select, insert, update on exam_session to authenticated;
grant select on exam_entry to authenticated;
grant all on exam_session, exam_entry to service_role;
create or replace function app.stamp_exam_session() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin new.created_by := coalesce(new.created_by, auth.uid()); return new; end $$;
create trigger exam_session_stamp before insert on exam_session for each row execute function app.stamp_exam_session();

-- Teachers enter children they teach; the office anyone.
create or replace function app.enter_exam(p_session uuid, p_student uuid, p_grade text, p_fee int default 0, p_framework uuid default null) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare x exam_session; s student; eid uuid;
begin
  select * into x from exam_session where id = p_session and deleted_at is null;
  select * into s from student where id = p_student and deleted_at is null;
  if x.id is null or s.id is null or s.studio_id <> x.studio_id then raise exception 'NOT_FOUND: that exam' using errcode = 'no_data_found'; end if;
  if not (app.is_admin(x.studio_id) or (app.has_role(x.studio_id, 'teacher') and s.id in (select app.teacher_student_ids()))) then
    raise exception 'FORBIDDEN: you can enter children you teach' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(btrim(p_grade), '') = '' then raise exception 'INVALID: which grade?' using errcode = 'check_violation'; end if;
  if x.entries_close_on is not null and x.entries_close_on < current_date and not app.is_admin(x.studio_id) then
    raise exception 'INVALID: entries for this exam have closed — ask the office' using errcode = 'check_violation';
  end if;
  insert into exam_entry (studio_id, session_id, student_id, grade, fee_minor, framework_id, entered_by)
  values (x.studio_id, x.id, s.id, btrim(p_grade), greatest(coalesce(p_fee, 0), 0), p_framework, auth.uid())
  on conflict (session_id, student_id, grade) do update set status = 'entered' returning id into eid;
  perform app.notify_family(s.family_id, 'milestone', s.first_name || ' is entered for ' || x.board || ' ' || btrim(p_grade),
                            to_char(x.exam_on, 'FMDay DD FMMonth') || coalesce(' at ' || x.venue, ''), '/family/children');
  return eid;
end $$;

create or replace function app.exam_result(p_entry uuid, p_result text, p_mark int default null) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare e exam_entry; x exam_session; s student;
begin
  select * into e from exam_entry where id = p_entry;
  select * into x from exam_session where id = e.session_id;
  select * into s from student where id = e.student_id;
  if e.id is null or not (app.is_admin(e.studio_id) or (app.has_role(e.studio_id, 'teacher') and e.student_id in (select app.teacher_student_ids()))) then
    raise exception 'FORBIDDEN: not your student' using errcode = 'insufficient_privilege';
  end if;
  update exam_entry set result = p_result, mark = p_mark, status = 'sat' where id = e.id;
  if p_result is not null and p_result <> 'not_yet' then
    perform app.award_milestone(s.id, 'exam:' || lower(x.board) || ':' || lower(e.grade),
      x.board || ' ' || e.grade || ' — ' || initcap(replace(p_result, '_', ' ')), x.exam_on);
  end if;
end $$;

create or replace function app.withdraw_exam(p_entry uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare e exam_entry;
begin
  select * into e from exam_entry where id = p_entry;
  if e.id is null or not (app.is_admin(e.studio_id) or (app.has_role(e.studio_id, 'teacher') and e.student_id in (select app.teacher_student_ids()))) then
    raise exception 'FORBIDDEN: not your student' using errcode = 'insufficient_privilege';
  end if;
  update exam_entry set status = 'withdrawn' where id = e.id;
end $$;

-- One invoice per family for the session's fees, once each.
create or replace function app.bill_exam(p_session uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare x exam_session; f record; inv uuid; n int := 0;
begin
  select * into x from exam_session where id = p_session;
  perform app.require_admin(x.studio_id);
  for f in select s.family_id, jsonb_agg(jsonb_build_object('kind', 'exam_fee', 'description', x.board || ' ' || e.grade || ' — ' || s.first_name,
                    'quantity', 1, 'unit_minor', e.fee_minor, 'student_id', s.id)) items, array_agg(e.id) ids
             from exam_entry e join student s on s.id = e.student_id
            where e.session_id = x.id and e.status <> 'withdrawn' and e.invoice_id is null and e.fee_minor > 0
            group by s.family_id loop
    inv := app.create_invoice(f.family_id, f.items, greatest(coalesce(x.entries_close_on, current_date + 14), current_date + 7), null, 0, true, null);
    update exam_entry set invoice_id = inv where id = any(f.ids);
    n := n + 1;
  end loop;
  return n;
end $$;

-- ── Shows: costumes ────────────────────────────────────────────────────────
create table costume_item (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  event_id    uuid not null references studio_event(id) on delete cascade,
  routine_id  uuid references event_routine(id) on delete cascade,
  name        text not null,
  sizes       text[] not null default array['Age 3–4', 'Age 5–6', 'Age 7–8', 'Age 9–10', 'Age 11–12', 'Age 13+', 'Adult S', 'Adult M', 'Adult L'],
  price_minor integer not null default 0 check (price_minor >= 0),
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create table costume_order (
  item_id     uuid not null references costume_item(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  size        text,
  status      text not null default 'needed' check (status in ('needed', 'ordered', 'arrived', 'given', 'returned')),
  note        text,
  updated_at  timestamptz not null default now(),
  primary key (item_id, student_id)
);
alter table costume_item enable row level security;  alter table costume_item force row level security;
alter table costume_order enable row level security; alter table costume_order force row level security;
create policy costume_item_read on costume_item for select using (deleted_at is null and studio_id in (select app.studio_ids()));
create policy costume_item_admin on costume_item for all using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy costume_order_read on costume_order for select using (
  student_id in (select app.guardian_student_ids())
  or exists (select 1 from costume_item i where i.id = item_id and app.is_staff(i.studio_id)));
create policy costume_order_admin on costume_order for all
  using (exists (select 1 from costume_item i where i.id = item_id and app.is_admin(i.studio_id)))
  with check (exists (select 1 from costume_item i where i.id = item_id and app.is_admin(i.studio_id)));
grant select, insert, update on costume_item to authenticated;
grant select, insert, update, delete on costume_order to authenticated;
grant all on costume_item, costume_order to service_role;
create trigger costume_item_stamp before insert on costume_item for each row execute function app.stamp_event_child();

-- Who needs what: every dancer in the routine (or, with no routine, every
-- confirmed dancer in the show) gets a line.
create or replace function app.costume_list(p_event uuid)
  returns table (item_id uuid, item text, routine text, student_id uuid, dancer text, size text, status text, sizes text[])
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare ev studio_event;
begin
  select * into ev from studio_event where id = p_event;
  if not app.is_staff(ev.studio_id) then raise exception 'FORBIDDEN: staff only' using errcode = 'insufficient_privilege'; end if;
  return query
  select i.id, i.name, r.title, s.id, s.first_name || ' ' || s.last_name, o.size, coalesce(o.status, 'needed'), i.sizes
    from costume_item i
    left join event_routine r on r.id = i.routine_id
    join student s on s.id in (
      select rd.student_id from routine_dancer rd where rd.routine_id = i.routine_id
      union select p.student_id from event_participant p where i.routine_id is null and p.event_id = i.event_id
             and p.status = 'confirmed' and p.deleted_at is null)
    left join costume_order o on o.item_id = i.id and o.student_id = s.id
   where i.event_id = p_event and i.deleted_at is null
   order by i.name, s.first_name, s.last_name;
end $$;

-- A parent gives their child's size; the office tracks the rest.
create or replace function app.set_costume_size(p_item uuid, p_student uuid, p_size text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare i costume_item;
begin
  select * into i from costume_item where id = p_item and deleted_at is null;
  if i.id is null or not (p_student in (select app.guardian_student_ids()) or app.is_admin(i.studio_id)) then
    raise exception 'FORBIDDEN: not your dancer' using errcode = 'insufficient_privilege';
  end if;
  if p_size is not null and not (p_size = any(i.sizes)) then raise exception 'INVALID: choose one of the sizes listed' using errcode = 'check_violation'; end if;
  insert into costume_order (item_id, student_id, size) values (i.id, p_student, p_size)
  on conflict (item_id, student_id) do update set size = excluded.size, updated_at = now();
end $$;

-- ── Shows: rehearsal registers ─────────────────────────────────────────────
create table rehearsal_attendance (
  rehearsal_id uuid not null references studio_event(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  status       attendance_status not null,
  marked_by    uuid references user_account(id) on delete set null,
  marked_at    timestamptz not null default now(),
  primary key (rehearsal_id, student_id)
);
alter table rehearsal_attendance enable row level security; alter table rehearsal_attendance force row level security;
create policy rehearsal_attendance_read on rehearsal_attendance for select using (
  student_id in (select app.guardian_student_ids())
  or exists (select 1 from studio_event e where e.id = rehearsal_id and app.is_staff(e.studio_id)));
grant select on rehearsal_attendance to authenticated;
grant all on rehearsal_attendance to service_role;

create or replace function app.rehearsal_register(p_rehearsal uuid)
  returns table (student_id uuid, first_name text, last_name text, routines text, status attendance_status,
                 has_medical boolean, requires_alert boolean)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare r studio_event;
begin
  select * into r from studio_event where id = p_rehearsal and parent_event_id is not null and deleted_at is null;
  if r.id is null then raise exception 'NOT_FOUND: that rehearsal' using errcode = 'no_data_found'; end if;
  if not app.is_staff(r.studio_id) then raise exception 'FORBIDDEN: staff only' using errcode = 'insufficient_privilege'; end if;
  return query
  select s.id, coalesce(s.preferred_name, s.first_name), s.last_name,
         (select string_agg(rt.title, ', ' order by rt.position) from event_routine rt join routine_dancer rd on rd.routine_id = rt.id
           where rt.event_id = r.parent_event_id and rd.student_id = s.id and rt.deleted_at is null),
         ra.status,
         exists (select 1 from medical_record m where m.student_id = s.id and m.deleted_at is null),
         coalesce((select bool_or(m.requires_alert) from medical_record m where m.student_id = s.id and m.deleted_at is null), false)
    from event_participant p join student s on s.id = p.student_id and s.deleted_at is null
    left join rehearsal_attendance ra on ra.rehearsal_id = r.id and ra.student_id = s.id
   where p.event_id = r.parent_event_id and p.status = 'confirmed' and p.deleted_at is null
   order by s.first_name, s.last_name;
end $$;

create or replace function app.mark_rehearsal(p_rehearsal uuid, p_student uuid, p_status attendance_status) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r studio_event;
begin
  select * into r from studio_event where id = p_rehearsal and parent_event_id is not null;
  if r.id is null or not app.is_staff(r.studio_id) then raise exception 'FORBIDDEN: staff only' using errcode = 'insufficient_privilege'; end if;
  if not exists (select 1 from event_participant p where p.event_id = r.parent_event_id and p.student_id = p_student and p.status = 'confirmed') then
    raise exception 'INVALID: that dancer is not in this show' using errcode = 'check_violation';
  end if;
  insert into rehearsal_attendance (rehearsal_id, student_id, status, marked_by) values (r.id, p_student, p_status, auth.uid())
  on conflict (rehearsal_id, student_id) do update set status = excluded.status, marked_by = excluded.marked_by, marked_at = now();
end $$;

-- ── Shows: programme ───────────────────────────────────────────────────────
-- Names appear only with photography consent (the school's proxy for being
-- identified at a public performance); otherwise the routine says how many
-- other dancers are in it.
create or replace function app.event_programme(p_event uuid)
  returns table (running_order smallint, routine text, class_name text, dancers text, unnamed int)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare ev studio_event;
begin
  select * into ev from studio_event where id = p_event and deleted_at is null;
  if ev.id is null or not app.is_staff(ev.studio_id) then raise exception 'FORBIDDEN: staff only' using errcode = 'insufficient_privilege'; end if;
  return query
  select r.position, r.title, c.name,
         string_agg(coalesce(s.preferred_name, s.first_name) || ' ' || left(s.last_name, 1) || '.', ', ' order by s.first_name)
           filter (where app.has_consent(s.id, 'photography')),
         (count(s.id) filter (where not app.has_consent(s.id, 'photography')))::int
    from event_routine r left join class c on c.id = r.class_id
    left join routine_dancer rd on rd.routine_id = r.id
    left join student s on s.id = rd.student_id and s.deleted_at is null
   where r.event_id = ev.id and r.deleted_at is null
   group by r.id, r.position, r.title, c.name
   order by r.position, r.title;
end $$;

create or replace function app.has_consent(p_student uuid, p_kind consent_kind) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce((select c.granted from consent_record c where c.student_id = p_student and c.kind = p_kind
                    order by c.created_at desc limit 1), false);
$$;

-- ── Shows: audience tickets ────────────────────────────────────────────────
create table ticket_type (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  event_id    uuid not null references studio_event(id) on delete cascade,
  name        text not null,                         -- "Adult", "Child", "Matinee — adult"
  price_minor integer not null check (price_minor >= 0),
  capacity    integer check (capacity is null or capacity > 0),
  per_family_max smallint not null default 6 check (per_family_max between 1 and 50),
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create table ticket_booking (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  ticket_type_id uuid not null references ticket_type(id) on delete cascade,
  family_id   uuid not null references family(id) on delete cascade,
  quantity    smallint not null check (quantity > 0),
  invoice_id  uuid references invoice(id) on delete set null,
  status      text not null default 'booked' check (status in ('booked', 'cancelled')),
  booked_by   uuid references user_account(id) on delete set null,
  created_at  timestamptz not null default now()
);
alter table ticket_type enable row level security;    alter table ticket_type force row level security;
alter table ticket_booking enable row level security; alter table ticket_booking force row level security;
create policy ticket_type_read on ticket_type for select using (deleted_at is null and studio_id in (select app.studio_ids()));
create policy ticket_type_admin on ticket_type for all using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy ticket_booking_read on ticket_booking for select using (app.is_admin(studio_id) or family_id in (select app.guardian_family_ids()));
grant select, insert, update on ticket_type to authenticated;
grant select on ticket_booking to authenticated;
grant all on ticket_type, ticket_booking to service_role;
create trigger ticket_type_stamp before insert on ticket_type for each row execute function app.stamp_event_child();

create or replace function app.tickets_left(p_type uuid) returns int
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select case when t.capacity is null then null
              else t.capacity - coalesce((select sum(quantity) from ticket_booking b where b.ticket_type_id = t.id and b.status = 'booked'), 0) end::int
    from ticket_type t where t.id = p_type;
$$;

create or replace function app.book_tickets(p_type uuid, p_quantity int) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare t ticket_type; ev studio_event; fam uuid; had int; bid uuid; inv uuid;
begin
  select * into t from ticket_type where id = p_type and deleted_at is null for update;
  select * into ev from studio_event where id = t.event_id and deleted_at is null;
  if t.id is null or ev.id is null or ev.starts_at < now() then raise exception 'INVALID: tickets for this show are not on sale' using errcode = 'check_violation'; end if;
  select g.family_id into fam from guardian g where g.user_id = auth.uid() and g.studio_id = t.studio_id and g.deleted_at is null limit 1;
  if fam is null then raise exception 'FORBIDDEN: tickets are booked by families of the school' using errcode = 'insufficient_privilege'; end if;
  if coalesce(p_quantity, 0) < 1 then raise exception 'INVALID: how many tickets?' using errcode = 'check_violation'; end if;
  select coalesce(sum(quantity), 0) into had from ticket_booking where ticket_type_id = t.id and family_id = fam and status = 'booked';
  if had + p_quantity > t.per_family_max then
    raise exception 'INVALID: up to % % tickets per family', t.per_family_max, lower(t.name) using errcode = 'check_violation';
  end if;
  if app.tickets_left(t.id) is not null and app.tickets_left(t.id) < p_quantity then
    raise exception 'INVALID: only % left', app.tickets_left(t.id) using errcode = 'check_violation';
  end if;
  if t.price_minor > 0 then
    inv := app.create_invoice_internal(fam, jsonb_build_array(jsonb_build_object('kind', 'show_fee',
             'description', ev.title || ' — ' || p_quantity || ' × ' || t.name || ' ticket' || case when p_quantity = 1 then '' else 's' end,
             'quantity', p_quantity, 'unit_minor', t.price_minor, 'event_id', ev.id)), least(ev.starts_at::date, current_date + 7), null, 0, true, null);
  end if;
  insert into ticket_booking (studio_id, ticket_type_id, family_id, quantity, invoice_id, booked_by)
  values (t.studio_id, t.id, fam, p_quantity, inv, auth.uid()) returning id into bid;
  return bid;
end $$;

-- ── Practice and demonstrations ────────────────────────────────────────────
alter table framework_skill add column demo_url text check (demo_url is null or demo_url ~ '^https://');

create table practice_log (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  practised_on date not null default current_date,
  minutes     smallint not null check (minutes between 1 and 600),
  what        text check (what is null or length(what) <= 200),
  logged_by   uuid references user_account(id) on delete set null,
  created_at  timestamptz not null default now(),
  check (practised_on <= current_date + 1)
);
create index practice_student on practice_log (student_id, practised_on desc);
alter table practice_log enable row level security; alter table practice_log force row level security;
create policy practice_read on practice_log for select using (
  student_id = app.student_self_id() or student_id in (select app.guardian_student_ids()) or app.is_admin(studio_id)
  or (app.has_role(studio_id, 'teacher') and student_id in (select app.teacher_student_ids())));
create policy practice_own_delete on practice_log for delete using (logged_by = auth.uid());
grant select, delete on practice_log to authenticated;
grant all on practice_log to service_role;

create or replace function app.log_practice(p_student uuid, p_minutes int, p_what text default null, p_on date default current_date) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; pid uuid;
begin
  select * into s from student where id = p_student and deleted_at is null;
  if s.id is null or not (s.id = app.student_self_id() or s.id in (select app.guardian_student_ids())) then
    raise exception 'FORBIDDEN: log practice for yourself or your own child' using errcode = 'insufficient_privilege';
  end if;
  insert into practice_log (studio_id, student_id, practised_on, minutes, what, logged_by)
  values (s.studio_id, s.id, coalesce(p_on, current_date), p_minutes, nullif(btrim(p_what), ''), auth.uid()) returning id into pid;
  return pid;
end $$;

-- Weekly totals for the children a teacher teaches (or the office: all).
create or replace function app.practice_weekly(p_weeks int default 4)
  returns table (student_id uuid, student_name text, week_start date, minutes int, sessions int)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id, s.first_name || ' ' || s.last_name, date_trunc('week', p.practised_on)::date, sum(p.minutes)::int, count(*)::int
    from practice_log p join student s on s.id = p.student_id
   where p.practised_on >= date_trunc('week', current_date)::date - (greatest(p_weeks, 1) - 1) * 7
     and app.in_scope(p.studio_id)
     and (app.is_admin(p.studio_id) or (app.has_role(p.studio_id, 'teacher') and s.id in (select app.teacher_student_ids()))
          or s.id = app.student_self_id() or s.id in (select app.guardian_student_ids()))
   group by s.id, s.first_name, s.last_name, 3
   order by 3 desc, 2;
$$;

-- Teachers set a demonstration link on a skill in a framework they teach.
create or replace function app.set_skill_demo(p_skill uuid, p_url text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare k framework_skill;
begin
  select * into k from framework_skill where id = p_skill and deleted_at is null;
  if k.id is null or not app.is_staff(k.studio_id) then raise exception 'FORBIDDEN: staff only' using errcode = 'insufficient_privilege'; end if;
  if p_url is not null and p_url !~ '^https://' then raise exception 'INVALID: use a secure link (https://)' using errcode = 'check_violation'; end if;
  update framework_skill set demo_url = nullif(btrim(p_url), ''), updated_at = now() where id = k.id;
end $$;

revoke all on function app.enter_exam(uuid, uuid, text, int, uuid), app.exam_result(uuid, text, int), app.withdraw_exam(uuid),
  app.bill_exam(uuid), app.costume_list(uuid), app.set_costume_size(uuid, uuid, text), app.rehearsal_register(uuid),
  app.mark_rehearsal(uuid, uuid, attendance_status), app.event_programme(uuid), app.has_consent(uuid, consent_kind),
  app.tickets_left(uuid), app.book_tickets(uuid, int), app.log_practice(uuid, int, text, date), app.practice_weekly(int),
  app.set_skill_demo(uuid, text) from public;
grant execute on function app.enter_exam(uuid, uuid, text, int, uuid), app.exam_result(uuid, text, int), app.withdraw_exam(uuid),
  app.bill_exam(uuid), app.costume_list(uuid), app.set_costume_size(uuid, uuid, text), app.rehearsal_register(uuid),
  app.mark_rehearsal(uuid, uuid, attendance_status), app.event_programme(uuid), app.tickets_left(uuid), app.book_tickets(uuid, int),
  app.log_practice(uuid, int, text, date), app.practice_weekly(int), app.set_skill_demo(uuid, text) to authenticated;
