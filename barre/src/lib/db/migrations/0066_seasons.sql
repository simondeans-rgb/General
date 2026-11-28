-- ============================================================================
-- 0066 · Seasons: one exam model, September re-enrolment, the show
--        production pack, and a uniform list per class (round 2 F2, F3, F7)
-- ----------------------------------------------------------------------------
-- F2 · One exam model. An exam session (0042) is the record; the "Exam" event
--   in families' diaries is its date. Each is created from the other, and an
--   entry (entered → confirmed → sat → result) keeps the child's place on the
--   event in step, so Events, the child card, the student timetable and
--   "Coming up" read the same thing. Fees bill once, through bill_exam, from
--   either screen. Examining bodies are free text.
-- F3 · Re-enrolment. The office picks the next term; every child in this
--   term's classes gets a proposed next class (by level progression and age;
--   editable). Families confirm or opt out by a deadline. Nothing is enrolled
--   until the office publishes, so a round can be closed, reopened or
--   cancelled. Publishing enrols the confirmed, puts the over-full on waiting
--   lists, releases the unanswered, and offers freed places to waiting lists.
-- F7 · Production pack. Running order with music, durations and quick-change
--   warnings; dancers per item; costume budget and charges billed once;
--   performer licence tracker (England and Wales rules; whether a licence is
--   needed is the school's decision); helpers and chaperones per item reuse
--   the helper rota (0050).
-- Uniform · what to wear per class, with an optional shop link, for the
--   public page, the class page and the family child card.
-- ============================================================================

-- ── F2 · One exam model ────────────────────────────────────────────────────
alter table exam_session add column event_id uuid unique references studio_event(id) on delete set null;
alter table exam_session add column fee_minor integer not null default 0 check (fee_minor >= 0);
alter table exam_entry add column confirmed_at timestamptz;
alter table exam_entry add column sits_at timestamptz;                 -- the examiner's timetable

create or replace function app.exam_syncing() returns boolean
  language sql stable as $$ select coalesce(current_setting('app.exam_sync', true), '') = 'on' $$;

-- An event title already naming the body keeps it; otherwise the body leads.
create or replace function app.exam_event_title(p_board text, p_title text) returns text
  language sql immutable as $$
  select case when position(lower(btrim(p_board)) in lower(p_title)) > 0 then p_title else btrim(p_board) || ' ' || p_title end
$$;

-- What grade a child is sitting, when nobody has typed it yet.
create or replace function app.exam_grade_guess(p_event uuid, p_student uuid, p_class uuid default null) returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(
    initcap((regexp_match((select title from studio_event where id = p_event), '(?i)\m(grade\s*[0-9]+)'))[1]),
    (select l.name from class c join level l on l.id = c.level_id where c.id = p_class),
    (select l.name from enrolment en join class c on c.id = en.class_id join level l on l.id = c.level_id
      where en.student_id = p_student and en.status = 'active' and en.deleted_at is null and c.deleted_at is null
      order by l.sort_order desc limit 1),
    'To be confirmed')
$$;

-- A session made in the office gets its date in the diary.
create or replace function app.exam_session_diary() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare tz text; eid uuid;
begin
  if new.event_id is not null or new.imported or app.exam_syncing() then return new; end if;
  select timezone into tz from studio where id = new.studio_id;
  perform set_config('app.exam_sync', 'on', true);
  insert into studio_event (studio_id, kind, status, title, starts_at, venue, entries_close_on, requests_open, cost_minor, created_by)
  values (new.studio_id, 'exam', 'published', app.exam_event_title(new.board, new.title),
          (new.exam_on + time '09:00') at time zone coalesce(tz, 'Europe/London'), new.venue, new.entries_close_on,
          false, nullif(new.fee_minor, 0), coalesce(new.created_by, auth.uid()))
  returning id into eid;
  perform set_config('app.exam_sync', 'off', true);
  new.event_id := eid;
  return new;
end $$;
create trigger exam_session_diary before insert on exam_session for each row execute function app.exam_session_diary();

create or replace function app.exam_session_to_event() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.event_id is null or app.exam_syncing() then return null; end if;
  perform set_config('app.exam_sync', 'on', true);
  update studio_event set
         title = case when new.title is distinct from old.title or new.board is distinct from old.board
                      then app.exam_event_title(new.board, new.title) else title end,
         starts_at = starts_at + (new.exam_on - old.exam_on) * interval '1 day',
         ends_at = ends_at + (new.exam_on - old.exam_on) * interval '1 day',
         venue = new.venue, entries_close_on = new.entries_close_on, cost_minor = nullif(new.fee_minor, 0),
         deleted_at = new.deleted_at, updated_at = now()
   where id = new.event_id;
  if new.fee_minor is distinct from old.fee_minor then
    update exam_entry set fee_minor = new.fee_minor where session_id = new.id and invoice_id is null and fee_minor = old.fee_minor;
  end if;
  perform set_config('app.exam_sync', 'off', true);
  return null;
end $$;
create trigger exam_session_to_event after update of board, title, exam_on, venue, entries_close_on, fee_minor, deleted_at on exam_session
  for each row execute function app.exam_session_to_event();

-- An "Exam" event made on the Events screen is a session too.
create or replace function app.exam_event_to_session() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare tz text; x exam_session;
begin
  if app.exam_syncing() or new.kind <> 'exam' or new.parent_event_id is not null then return null; end if;
  select timezone into tz from studio where id = new.studio_id;
  select * into x from exam_session where event_id = new.id;
  perform set_config('app.exam_sync', 'on', true);
  if x.id is null then
    if new.deleted_at is null then
      insert into exam_session (studio_id, board, title, exam_on, venue, entries_close_on, fee_minor, event_id, created_by)
      values (new.studio_id, coalesce((regexp_match(new.title, '^([A-Z]{2,6})\M'))[1], 'Board to set'), new.title,
              (new.starts_at at time zone coalesce(tz, 'Europe/London'))::date, new.venue, new.entries_close_on,
              coalesce(new.cost_minor, 0), new.id, new.created_by);
    end if;
  else
    update exam_session set
           title = case when tg_op = 'UPDATE' and new.title is distinct from old.title then new.title else title end,
           exam_on = (new.starts_at at time zone coalesce(tz, 'Europe/London'))::date,
           venue = new.venue, entries_close_on = new.entries_close_on, fee_minor = coalesce(new.cost_minor, 0),
           deleted_at = new.deleted_at
     where id = x.id;
    if tg_op = 'UPDATE' and new.cost_minor is distinct from old.cost_minor then
      update exam_entry set fee_minor = coalesce(new.cost_minor, 0)
       where session_id = x.id and invoice_id is null and fee_minor = coalesce(old.cost_minor, 0);
    end if;
  end if;
  perform set_config('app.exam_sync', 'off', true);
  return null;
end $$;
create trigger exam_event_to_session after insert or update of kind, title, starts_at, venue, entries_close_on, cost_minor, deleted_at
  on studio_event for each row execute function app.exam_event_to_session();

-- A child's place on the event follows their entries: any confirmed or sat
-- entry → confirmed; only unconfirmed entries → invited (the family can
-- accept); all withdrawn → withdrawn.
create or replace function app.exam_sync_entry(p_session uuid, p_student uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare x exam_session; st participant_status;
begin
  select * into x from exam_session where id = p_session;
  if x.event_id is null then return; end if;
  select case when bool_or(status = 'sat' or (status = 'entered' and confirmed_at is not null)) then 'confirmed'
              when bool_or(status = 'entered') then 'invited' else 'withdrawn' end::participant_status
    into st from exam_entry where session_id = p_session and student_id = p_student;
  if st is null then return; end if;
  perform set_config('app.exam_sync', 'on', true);
  insert into event_participant (studio_id, event_id, student_id, status, decided_by, decided_at)
  values (x.studio_id, x.event_id, p_student, st, auth.uid(), now())
  on conflict (event_id, student_id) do update
     set status = excluded.status, deleted_at = null, decided_by = excluded.decided_by, decided_at = now(), updated_at = now()
   where event_participant.status is distinct from excluded.status or event_participant.deleted_at is not null;
  perform set_config('app.exam_sync', 'off', true);
end $$;

create or replace function app.exam_entry_to_participant() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.exam_syncing() then perform app.exam_sync_entry(new.session_id, new.student_id); end if;
  return null;
end $$;
create trigger exam_entry_to_participant after insert or update of status, confirmed_at on exam_entry
  for each row execute function app.exam_entry_to_participant();

-- And the other way: inviting a class, a family accepting, the office
-- confirming or declining on the Events screen all land on the entries.
create or replace function app.exam_sync_participant(p event_participant) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare x exam_session; inv uuid;
begin
  select * into x from exam_session where event_id = p.event_id and deleted_at is null;
  if x.id is null then return; end if;
  perform set_config('app.exam_sync', 'on', true);
  if p.deleted_at is not null or p.status in ('declined', 'withdrawn') then
    update exam_entry set status = 'withdrawn' where session_id = x.id and student_id = p.student_id and status = 'entered';
  elsif p.status in ('confirmed', 'invited') then
    if exists (select 1 from exam_entry where session_id = x.id and student_id = p.student_id) then
      update exam_entry set status = case when status = 'withdrawn' then 'entered' else status end,
             confirmed_at = case when p.status = 'confirmed' then coalesce(confirmed_at, now()) else confirmed_at end
       where session_id = x.id and student_id = p.student_id and status <> 'sat';
    else
      -- A fee already billed on the event counts as this entry's.
      select ii.invoice_id into inv from invoice_item ii join invoice i on i.id = ii.invoice_id
       where ii.event_id = p.event_id and ii.student_id = p.student_id and ii.deleted_at is null
         and i.deleted_at is null and i.status not in ('void', 'refunded') limit 1;
      insert into exam_entry (studio_id, session_id, student_id, grade, fee_minor, confirmed_at, invoice_id, entered_by)
      values (x.studio_id, x.id, p.student_id, app.exam_grade_guess(p.event_id, p.student_id, p.invited_class_id),
              x.fee_minor, case when p.status = 'confirmed' then coalesce(p.decided_at, now()) end, inv, auth.uid())
      on conflict (session_id, student_id, grade) do nothing;
    end if;
  end if;
  perform set_config('app.exam_sync', 'off', true);
end $$;

create or replace function app.exam_participant_to_entry() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.exam_syncing() then perform app.exam_sync_participant(new); end if;
  return null;
end $$;
create trigger exam_participant_to_entry after insert or update of status, deleted_at on event_participant
  for each row execute function app.exam_participant_to_entry();

-- Entering a child: no fee given means the session's fee.
create or replace function app.enter_exam(p_session uuid, p_student uuid, p_grade text, p_fee int default null, p_framework uuid default null) returns uuid
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
  values (x.studio_id, x.id, s.id, btrim(p_grade), greatest(coalesce(p_fee, x.fee_minor, 0), 0), p_framework, auth.uid())
  on conflict (session_id, student_id, grade) do update set status = 'entered' returning id into eid;
  perform app.notify_family(s.family_id, 'milestone', s.first_name || ' is entered for ' || x.board || ' ' || btrim(p_grade),
                            to_char(x.exam_on, 'FMDay DD FMMonth') || coalesce(' at ' || x.venue, '') || ' · please confirm in Shows and events',
                            '/family/events');
  return eid;
end $$;

-- An exam already sat cannot be withdrawn from.
create or replace function app.withdraw_exam(p_entry uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare e exam_entry;
begin
  select * into e from exam_entry where id = p_entry;
  if e.id is null or not (app.is_admin(e.studio_id) or (app.has_role(e.studio_id, 'teacher') and e.student_id in (select app.teacher_student_ids()))) then
    raise exception 'FORBIDDEN: not your student' using errcode = 'insufficient_privilege';
  end if;
  if e.status = 'sat' then raise exception 'INVALID: this exam has been sat' using errcode = 'check_violation'; end if;
  update exam_entry set status = 'withdrawn' where id = e.id;
end $$;

-- Confirming an entry (the board has accepted it, or the family has said yes).
create or replace function app.confirm_exam_entry(p_entry uuid, p_yes boolean default true) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare e exam_entry;
begin
  select * into e from exam_entry where id = p_entry;
  if e.id is null or not (app.is_admin(e.studio_id) or (app.has_role(e.studio_id, 'teacher') and e.student_id in (select app.teacher_student_ids()))) then
    raise exception 'FORBIDDEN: not your student' using errcode = 'insufficient_privilege';
  end if;
  if e.status <> 'entered' then raise exception 'INVALID: only an entry not yet sat can be confirmed' using errcode = 'check_violation'; end if;
  update exam_entry set confirmed_at = case when p_yes then coalesce(confirmed_at, now()) end where id = e.id;
end $$;

-- Grade, fee and the candidate's time. A billed fee stays as billed.
create or replace function app.update_exam_entry(p_entry uuid, p_grade text, p_fee int, p_sits_at timestamptz) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare e exam_entry;
begin
  select * into e from exam_entry where id = p_entry;
  if e.id is null or not (app.is_admin(e.studio_id) or (app.has_role(e.studio_id, 'teacher') and e.student_id in (select app.teacher_student_ids()))) then
    raise exception 'FORBIDDEN: not your student' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(btrim(p_grade), '') = '' then raise exception 'INVALID: which grade?' using errcode = 'check_violation'; end if;
  if p_fee is distinct from e.fee_minor then
    if not app.is_admin(e.studio_id) then raise exception 'FORBIDDEN: the office sets exam fees' using errcode = 'insufficient_privilege'; end if;
    if e.invoice_id is not null then raise exception 'INVALID: this fee is already billed — use a credit note to change it' using errcode = 'check_violation'; end if;
  end if;
  update exam_entry set grade = btrim(p_grade), fee_minor = greatest(coalesce(p_fee, e.fee_minor), 0), sits_at = p_sits_at where id = e.id;
end $$;

create or replace function app.exam_certificate(p_entry uuid, p_received boolean) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare e exam_entry;
begin
  select * into e from exam_entry where id = p_entry;
  if e.id is null or not (app.is_admin(e.studio_id) or (app.has_role(e.studio_id, 'teacher') and e.student_id in (select app.teacher_student_ids()))) then
    raise exception 'FORBIDDEN: not your student' using errcode = 'insufficient_privilege';
  end if;
  update exam_entry set certificate_received = p_received where id = e.id;
end $$;

-- One invoice per family, once per entry; the lines carry the event so the
-- Events screen and "Coming up" know they are billed.
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
    if x.event_id is not null then update invoice_item set event_id = x.event_id where invoice_id = inv; end if;
    n := n + 1;
  end loop;
  return n;
end $$;

-- "Bill the fee" on an exam event bills the entries, so nobody pays twice.
create or replace function app.bill_event(p_event uuid, p_due date default null) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare ev studio_event; f record; inv uuid; n int := 0; xs uuid;
begin
  select * into ev from studio_event where id = p_event and deleted_at is null;
  perform app.require_admin(ev.studio_id);
  select id into xs from exam_session where event_id = ev.id and deleted_at is null;
  if xs is not null then return app.bill_exam(xs); end if;
  if coalesce(ev.cost_minor, 0) = 0 then raise exception 'INVALID: this event has no fee' using errcode = 'check_violation'; end if;
  for f in select s.family_id, jsonb_agg(jsonb_build_object('kind', case ev.kind when 'exam' then 'exam_fee' when 'show' then 'show_fee' else 'workshop' end,
                    'description', ev.title || ' — ' || s.first_name, 'quantity', 1, 'unit_minor', ev.cost_minor, 'student_id', s.id)) items,
                  array_agg(s.id) kids
             from event_participant p join student s on s.id = p.student_id
            where p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null
              and not exists (select 1 from invoice_item ii join invoice i on i.id = ii.invoice_id
                               where ii.event_id = ev.id and ii.student_id = s.id and ii.deleted_at is null
                                 and i.deleted_at is null and i.status not in ('void', 'refunded'))
            group by s.family_id loop
    inv := app.create_invoice(f.family_id, f.items, coalesce(p_due, (ev.starts_at::date - 7), current_date + 14), null, 0, true, null);
    update invoice_item set event_id = ev.id where invoice_id = inv;
    n := n + 1;
  end loop;
  return n;
end $$;

-- Exams already held as events or as sessions before this migration.
create or replace function app.reconcile_exams(p_studio uuid default null) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare ev studio_event; x exam_session; p event_participant; e record; tz text; n int := 0;
begin
  for ev in select * from studio_event se where se.kind = 'exam' and se.parent_event_id is null and se.deleted_at is null
              and (p_studio is null or se.studio_id = p_studio)
              and not exists (select 1 from exam_session s where s.event_id = se.id) loop
    select timezone into tz from studio where id = ev.studio_id;
    perform set_config('app.exam_sync', 'on', true);
    insert into exam_session (studio_id, board, title, exam_on, venue, entries_close_on, fee_minor, event_id, created_by)
    values (ev.studio_id, coalesce((regexp_match(ev.title, '^([A-Z]{2,6})\M'))[1], 'Board to set'), ev.title,
            (ev.starts_at at time zone coalesce(tz, 'Europe/London'))::date, ev.venue, ev.entries_close_on,
            coalesce(ev.cost_minor, 0), ev.id, ev.created_by);
    perform set_config('app.exam_sync', 'off', true);
    for p in select * from event_participant where event_id = ev.id loop perform app.exam_sync_participant(p); end loop;
    n := n + 1;
  end loop;
  for x in select * from exam_session s where s.event_id is null and not s.imported and s.deleted_at is null
             and (p_studio is null or s.studio_id = p_studio) loop
    select timezone into tz from studio where id = x.studio_id;
    perform set_config('app.exam_sync', 'on', true);
    insert into studio_event (studio_id, kind, status, title, starts_at, venue, entries_close_on, requests_open, cost_minor, created_by)
    values (x.studio_id, 'exam', 'published', app.exam_event_title(x.board, x.title),
            (x.exam_on + time '09:00') at time zone coalesce(tz, 'Europe/London'), x.venue, x.entries_close_on, false,
            nullif(x.fee_minor, 0), x.created_by)
    returning id into x.event_id;
    update exam_session set event_id = x.event_id where id = x.id;
    perform set_config('app.exam_sync', 'off', true);
    for e in select distinct student_id from exam_entry where session_id = x.id loop perform app.exam_sync_entry(x.id, e.student_id); end loop;
    n := n + 1;
  end loop;
  return n;
end $$;
select app.reconcile_exams();

revoke all on function app.confirm_exam_entry(uuid, boolean), app.update_exam_entry(uuid, text, int, timestamptz),
  app.exam_certificate(uuid, boolean), app.reconcile_exams(uuid), app.exam_sync_entry(uuid, uuid),
  app.exam_sync_participant(event_participant), app.exam_grade_guess(uuid, uuid, uuid) from public;
grant execute on function app.confirm_exam_entry(uuid, boolean), app.update_exam_entry(uuid, text, int, timestamptz),
  app.exam_certificate(uuid, boolean) to authenticated;
grant execute on function app.reconcile_exams(uuid) to service_role;

-- ── Uniform ────────────────────────────────────────────────────────────────
alter table class add column uniform text[] not null default '{}'
  check (cardinality(uniform) <= 20 and array_to_string(uniform, '') !~ '[<>]');
alter table class add column uniform_url text check (uniform_url is null or (uniform_url ~ '^https://' and length(uniform_url) <= 300));

create or replace function app.set_class_uniform(p_class uuid, p_items text[], p_url text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c class; items text[];
begin
  select * into c from class where id = p_class and deleted_at is null;
  if c.id is null then raise exception 'NOT_FOUND: that class' using errcode = 'no_data_found'; end if;
  perform app.require_admin(c.studio_id);
  items := array(select btrim(i) from unnest(coalesce(p_items, '{}')) i where btrim(i) <> '');
  if exists (select 1 from unnest(items) i where length(i) > 120) then
    raise exception 'INVALID: keep each item under 120 characters' using errcode = 'check_violation';
  end if;
  if nullif(btrim(p_url), '') is not null and btrim(p_url) !~ '^https://' then
    raise exception 'INVALID: the shop link must start with https://' using errcode = 'check_violation';
  end if;
  update class set uniform = items, uniform_url = nullif(btrim(p_url), ''), updated_at = now() where id = c.id;
end $$;

-- The public page: uniform by class name, for open classes only.
create or replace function app.public_class_uniform(p_slug text)
  returns table (class_name text, uniform text[], uniform_url text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select distinct on (c.name) c.name, c.uniform, c.uniform_url
    from class c join studio st on st.id = c.studio_id and st.slug = p_slug and st.deleted_at is null
    join term t on t.id = c.term_id and t.deleted_at is null and t.ends_on >= current_date
   where c.deleted_at is null and c.visibility = 'public' and (cardinality(c.uniform) > 0 or c.uniform_url is not null)
   order by c.name, t.starts_on
$$;

-- A family's children: the uniform for each class they are in.
create or replace function app.child_uniform(p_student uuid)
  returns table (class_id uuid, class_name text, uniform text[], uniform_url text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select c.id, c.name, c.uniform, c.uniform_url
    from enrolment e join class c on c.id = e.class_id and c.deleted_at is null
   where e.student_id = p_student and e.status = 'active' and e.deleted_at is null
     and (cardinality(c.uniform) > 0 or c.uniform_url is not null)
     and (p_student in (select app.guardian_student_ids()) or p_student = app.student_self_id() or app.is_staff(c.studio_id))
   order by c.day_of_week, c.start_time
$$;

-- A class carried into a new term keeps its uniform and public notes.
create or replace function app.class_copy_extras() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare src class;
begin
  if new.copied_from is null then return new; end if;
  select * into src from class where id = new.copied_from;
  if cardinality(new.uniform) = 0 then new.uniform := src.uniform; end if;
  new.uniform_url := coalesce(new.uniform_url, src.uniform_url);
  new.what_to_bring := coalesce(new.what_to_bring, src.what_to_bring);
  new.level_note := coalesce(new.level_note, src.level_note);
  return new;
end $$;
create trigger class_copy_extras before insert on class for each row execute function app.class_copy_extras();

revoke all on function app.set_class_uniform(uuid, text[], text), app.public_class_uniform(text), app.child_uniform(uuid) from public;
grant execute on function app.set_class_uniform(uuid, text[], text), app.child_uniform(uuid) to authenticated;
grant execute on function app.public_class_uniform(text) to authenticated, anon, service_role;

-- ── F3 · Re-enrolment and moving up ────────────────────────────────────────
alter table level add column next_level_id uuid references level(id) on delete set null;

create table reenrolment_round (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  from_term_id uuid not null references term(id) on delete cascade,
  to_term_id   uuid not null references term(id) on delete cascade,
  respond_by   date not null,
  status       text not null default 'draft' check (status in ('draft', 'open', 'closed', 'published', 'cancelled')),
  opened_at    timestamptz,
  closed_at    timestamptz,
  published_at timestamptz,
  created_by   uuid references user_account(id) on delete set null,
  created_at   timestamptz not null default now(),
  check (from_term_id <> to_term_id)
);
create unique index reenrolment_one_live_round on reenrolment_round (from_term_id, to_term_id) where status in ('draft', 'open', 'closed');

create table reenrolment_offer (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  round_id     uuid not null references reenrolment_round(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  from_class_id uuid references class(id) on delete set null,
  from_enrolment_id uuid references enrolment(id) on delete set null,
  class_id     uuid references class(id) on delete set null,      -- proposed; null = no class proposed
  reason       text not null default 'stays',                     -- moves_up, stays, by_age, office, none
  status       text not null default 'proposed'
               check (status in ('proposed', 'confirmed', 'declined', 'released', 'placed', 'waitlisted')),
  answered_by  uuid references user_account(id) on delete set null,
  answered_at  timestamptz,
  enrolment_id uuid references enrolment(id) on delete set null,
  waitlist_id  uuid references waitlist_entry(id) on delete set null,
  updated_at   timestamptz not null default now(),
  unique (round_id, from_enrolment_id)
);
create index reenrolment_offer_round on reenrolment_offer (round_id);
create index reenrolment_offer_student on reenrolment_offer (student_id);

alter table reenrolment_round enable row level security; alter table reenrolment_round force row level security;
alter table reenrolment_offer enable row level security; alter table reenrolment_offer force row level security;
-- Families read their own children's places once the office opens a round
-- (app.family_reenrolment); everything is changed through the functions below.
create or replace function app.reenrolment_shown(p_round uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from reenrolment_round r where r.id = p_round and r.status in ('open', 'closed', 'published'))
$$;
create policy reenrol_round_admin on reenrolment_round for select using (app.is_admin(studio_id));
create policy reenrol_offer_read on reenrolment_offer for select using (
  app.is_admin(studio_id) or (student_id in (select app.guardian_student_ids()) and app.reenrolment_shown(round_id)));
grant select on reenrolment_round, reenrolment_offer to authenticated;
grant all on reenrolment_round, reenrolment_offer to service_role;

-- The class a child would go into next: the next level up in the same style
-- (the school's own "moves up to", or the next level by order), within its
-- age range; otherwise the same class carried on; otherwise any class of the
-- style that fits their age. Ties go to the same location and time.
create or replace function app.propose_next_class(p_student uuid, p_from_class uuid, p_to_term uuid,
                                                  out class_id uuid, out reason text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare s student; c class; t term; lv level; nxt uuid; yrs int;
begin
  select * into s from student where id = p_student;
  select * into c from class where id = p_from_class;
  select * into t from term where id = p_to_term;
  yrs := case when s.date_of_birth is null then null else extract(year from age(t.starts_on, s.date_of_birth))::int end;
  select * into lv from level where id = c.level_id;
  if lv.id is not null then
    nxt := coalesce(lv.next_level_id, (select l2.id from level l2 where l2.studio_id = c.studio_id and l2.deleted_at is null
                                        and l2.sort_order > lv.sort_order order by l2.sort_order limit 1));
  end if;
  -- 1. Moves up.
  if nxt is not null then
    select k.id into class_id from class k
     where k.term_id = p_to_term and k.deleted_at is null and k.pricing <> 'drop_in'
       and k.dance_style_id is not distinct from c.dance_style_id and k.level_id = nxt
       and (yrs is null or ((k.age_min is null or yrs >= k.age_min) and (k.age_max is null or yrs <= k.age_max)))
     order by (k.location_id = c.location_id) desc, (k.day_of_week = c.day_of_week) desc, abs(extract(epoch from k.start_time - c.start_time)), k.name
     limit 1;
    if class_id is not null then reason := 'moves_up'; return; end if;
  end if;
  -- 2. Stays in the same class, carried on.
  select k.id into class_id from class k
   where k.term_id = p_to_term and k.deleted_at is null and k.pricing <> 'drop_in'
     and (k.copied_from = c.id or (k.dance_style_id is not distinct from c.dance_style_id and k.level_id is not distinct from c.level_id
                                   and k.name = c.name))
     and (yrs is null or ((k.age_min is null or yrs >= k.age_min) and (k.age_max is null or yrs <= k.age_max)))
   order by (k.copied_from = c.id) desc limit 1;
  if class_id is not null then reason := 'stays'; return; end if;
  -- 3. Whatever of the style fits their age, nearest level first.
  select k.id into class_id from class k left join level kl on kl.id = k.level_id
   where k.term_id = p_to_term and k.deleted_at is null and k.pricing <> 'drop_in'
     and k.dance_style_id is not distinct from c.dance_style_id
     and (yrs is null or ((k.age_min is null or yrs >= k.age_min) and (k.age_max is null or yrs <= k.age_max)))
   order by abs(coalesce(kl.sort_order, 0) - coalesce(lv.sort_order, 0)), (k.location_id = c.location_id) desc, k.name
   limit 1;
  if class_id is not null then reason := 'by_age'; return; end if;
  reason := 'none';
end $$;

create or replace function app.start_reenrolment(p_from_term uuid, p_to_term uuid, p_respond_by date) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare ft term; tt term; rid uuid; e record; pr record;
begin
  select * into ft from term where id = p_from_term and deleted_at is null;
  select * into tt from term where id = p_to_term and deleted_at is null;
  if ft.id is null or tt.id is null or ft.studio_id <> tt.studio_id then raise exception 'NOT_FOUND: that term' using errcode = 'no_data_found'; end if;
  perform app.require_admin(ft.studio_id);
  if tt.starts_on <= ft.starts_on then raise exception 'INVALID: choose a term that starts after %', ft.name using errcode = 'check_violation'; end if;
  if p_respond_by is null or p_respond_by < current_date or p_respond_by >= tt.starts_on then
    raise exception 'INVALID: the reply date must be between today and the start of %', tt.name using errcode = 'check_violation';
  end if;
  if exists (select 1 from reenrolment_round where from_term_id = ft.id and to_term_id = tt.id and status in ('draft', 'open', 'closed')) then
    raise exception 'INVALID: re-enrolment into % is already under way' , tt.name using errcode = 'check_violation';
  end if;
  -- No classes in the new term yet: lay them down from this term's.
  if not exists (select 1 from class where term_id = tt.id and deleted_at is null) then
    perform app.copy_classes(array(select id from class where term_id = ft.id and deleted_at is null and pricing <> 'drop_in'), tt.id, false);
  end if;
  insert into reenrolment_round (studio_id, from_term_id, to_term_id, respond_by, created_by)
  values (ft.studio_id, ft.id, tt.id, p_respond_by, auth.uid()) returning id into rid;
  for e in select en.id, en.student_id, en.class_id from enrolment en
             join class c on c.id = en.class_id and c.term_id = ft.id and c.deleted_at is null and c.pricing <> 'drop_in'
             join student s on s.id = en.student_id and s.deleted_at is null
            where en.status = 'active' and en.deleted_at is null and (en.ended_on is null or en.ended_on >= ft.ends_on)
            order by en.started_on loop
    select * into pr from app.propose_next_class(e.student_id, e.class_id, tt.id);
    -- One place per child per class: two of this term's classes leading to
    -- the same next class give one proposal.
    continue when pr.class_id is not null and exists (select 1 from reenrolment_offer x where x.round_id = rid
                                                         and x.student_id = e.student_id and x.class_id = pr.class_id);
    insert into reenrolment_offer (studio_id, round_id, student_id, from_class_id, from_enrolment_id, class_id, reason)
    values (ft.studio_id, rid, e.student_id, e.class_id, e.id, pr.class_id, pr.reason);
  end loop;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (ft.studio_id, auth.uid(), 'create', 'term', tt.id, format('Re-enrolment from %s into %s prepared', ft.name, tt.name));
  return rid;
end $$;

create or replace function app.reenrolment_round_for(p_round uuid, p_states text[]) returns reenrolment_round
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare r reenrolment_round;
begin
  select * into r from reenrolment_round where id = p_round;
  if r.id is null then raise exception 'NOT_FOUND: that re-enrolment' using errcode = 'no_data_found'; end if;
  perform app.require_admin(r.studio_id);
  if not (r.status = any(p_states)) then
    raise exception 'INVALID: this re-enrolment is %', case r.status when 'published' then 'already published' when 'cancelled' then 'cancelled'
      when 'open' then 'open to families' when 'closed' then 'closed' else 'not open yet' end using errcode = 'check_violation';
  end if;
  return r;
end $$;

create or replace function app.set_reenrolment_class(p_offer uuid, p_class uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare o reenrolment_offer; r reenrolment_round;
begin
  select * into o from reenrolment_offer where id = p_offer;
  if o.id is null then raise exception 'NOT_FOUND: that place' using errcode = 'no_data_found'; end if;
  r := app.reenrolment_round_for(o.round_id, array['draft', 'open', 'closed']);
  if p_class is not null and not exists (select 1 from class where id = p_class and term_id = r.to_term_id and deleted_at is null) then
    raise exception 'INVALID: choose a class in the new term' using errcode = 'check_violation';
  end if;
  update reenrolment_offer set class_id = p_class, reason = case when p_class is null then 'none' else 'office' end,
         status = case when status in ('confirmed', 'declined', 'released') and p_class is distinct from o.class_id then 'proposed' else status end,
         answered_at = case when p_class is distinct from o.class_id then null else answered_at end,
         answered_by = case when p_class is distinct from o.class_id then null else answered_by end,
         updated_at = now()
   where id = o.id;
end $$;

-- One message per family, however many children.
create or replace function app.open_reenrolment(p_round uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r reenrolment_round; t term; f record; n int := 0;
begin
  r := app.reenrolment_round_for(p_round, array['draft']);
  select * into t from term where id = r.to_term_id;
  update reenrolment_round set status = 'open', opened_at = now() where id = r.id;
  for f in select s.family_id, string_agg(distinct s.first_name, ' and ') kids
             from reenrolment_offer o join student s on s.id = o.student_id
            where o.round_id = r.id and o.class_id is not null group by s.family_id loop
    perform app.notify_family(f.family_id, 'new_enrolment', 'Confirm ' || f.kids || '’s classes for ' || t.name,
      'Please confirm or let us know by ' || to_char(r.respond_by, 'FMDay DD FMMonth') || '. Places not confirmed are offered to others.', '/family');
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function app.answer_reenrolment(p_offer uuid, p_yes boolean) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare o reenrolment_offer; r reenrolment_round; office boolean;
begin
  select * into o from reenrolment_offer where id = p_offer;
  select * into r from reenrolment_round where id = o.round_id;
  office := r.id is not null and app.is_admin(r.studio_id);
  if o.id is null or not (o.student_id in (select app.guardian_student_ids()) or office) then
    raise exception 'FORBIDDEN: not your child' using errcode = 'insufficient_privilege';
  end if;
  if not (r.status = 'open' or (office and r.status in ('draft', 'closed'))) then
    raise exception 'INVALID: replies for % are closed — please contact the office', (select name from term where id = r.to_term_id) using errcode = 'check_violation';
  end if;
  if not office and current_date > r.respond_by then
    raise exception 'INVALID: the reply date has passed — please contact the office' using errcode = 'check_violation';
  end if;
  if o.class_id is null and p_yes then raise exception 'INVALID: no class is proposed yet — the office will be in touch' using errcode = 'check_violation'; end if;
  if o.status not in ('proposed', 'confirmed', 'declined', 'released') then
    raise exception 'INVALID: this place is already settled' using errcode = 'check_violation';
  end if;
  update reenrolment_offer set status = case when p_yes then 'confirmed' else 'declined' end,
         answered_by = auth.uid(), answered_at = now(), updated_at = now() where id = o.id;
  return case when p_yes then 'confirmed' else 'declined' end;
end $$;

-- After the reply date, unanswered places go back to the school.
create or replace function app.close_reenrolment(p_round uuid, p_early boolean default false) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r reenrolment_round; n int;
begin
  r := app.reenrolment_round_for(p_round, array['open']);
  if current_date <= r.respond_by and not p_early then
    raise exception 'INVALID: families have until % to reply', to_char(r.respond_by, 'FMDD FMMonth') using errcode = 'check_violation';
  end if;
  update reenrolment_offer set status = 'released', updated_at = now() where round_id = r.id and status = 'proposed';
  get diagnostics n = row_count;
  update reenrolment_round set status = 'closed', closed_at = now() where id = r.id;
  return n;
end $$;

-- Undo a close: released places are proposed again, families can reply.
create or replace function app.reopen_reenrolment(p_round uuid, p_respond_by date default null) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r reenrolment_round;
begin
  r := app.reenrolment_round_for(p_round, array['closed']);
  update reenrolment_offer set status = 'proposed', updated_at = now() where round_id = r.id and status = 'released';
  update reenrolment_round set status = 'open', closed_at = null,
         respond_by = greatest(coalesce(p_respond_by, r.respond_by), current_date) where id = r.id;
end $$;

create or replace function app.cancel_reenrolment(p_round uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r reenrolment_round;
begin
  r := app.reenrolment_round_for(p_round, array['draft', 'open', 'closed']);
  update reenrolment_round set status = 'cancelled' where id = r.id;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (r.studio_id, auth.uid(), 'cancel', 'term', r.to_term_id, 'Re-enrolment cancelled before publishing; nobody was enrolled');
end $$;

-- Publishing makes next term's enrolments: the confirmed, longest-standing
-- first, never beyond a class's places (the rest join its waiting list);
-- then free places are offered to waiting lists.
create or replace function app.publish_reenrolment(p_round uuid) returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r reenrolment_round; t term; o record; eid uuid; wid uuid; placed int := 0; waiting int := 0; released int := 0;
        offered int := 0; k record; nxt uuid; f record;
begin
  r := app.reenrolment_round_for(p_round, array['open', 'closed']);
  if r.status = 'open' then
    if current_date <= r.respond_by then
      raise exception 'INVALID: families have until % to reply — close replies early first', to_char(r.respond_by, 'FMDD FMMonth') using errcode = 'check_violation';
    end if;
    released := app.close_reenrolment(r.id);
  end if;
  select * into t from term where id = r.to_term_id;
  perform set_config('app.bulk_enrol', 'on', true);
  for o in select ro.*, s.first_name, s.family_id from reenrolment_offer ro
             join student s on s.id = ro.student_id and s.deleted_at is null
             left join enrolment fe on fe.id = ro.from_enrolment_id
            where ro.round_id = r.id and ro.status = 'confirmed' and ro.class_id is not null
            order by fe.started_on nulls last, ro.answered_at loop
    if exists (select 1 from enrolment where class_id = o.class_id and student_id = o.student_id and status = 'active' and deleted_at is null) then
      update reenrolment_offer set status = 'placed', updated_at = now() where id = o.id;
      placed := placed + 1;
    elsif app.class_free_places(o.class_id) > 0 then
      insert into enrolment (studio_id, class_id, student_id, status, started_on, note, created_by)
      values (r.studio_id, o.class_id, o.student_id, 'active', t.starts_on,
              'Re-enrolled from ' || coalesce((select name from class where id = o.from_class_id), 'last term'), auth.uid())
      returning id into eid;
      update reenrolment_offer set status = 'placed', enrolment_id = eid, updated_at = now() where id = o.id;
      placed := placed + 1;
    else
      select id into wid from waitlist_entry where class_id = o.class_id and student_id = o.student_id
         and status in ('waiting', 'offered') and deleted_at is null;
      if wid is null then
        insert into waitlist_entry (studio_id, class_id, student_id, status, position, note)
        values (r.studio_id, o.class_id, o.student_id, 'waiting', 0, 'Re-enrolment: confirmed, class full') returning id into wid;
      end if;
      update reenrolment_offer set status = 'waitlisted', waitlist_id = wid, updated_at = now() where id = o.id;
      waiting := waiting + 1;
    end if;
  end loop;
  perform set_config('app.bulk_enrol', 'off', true);
  -- Places nobody took go to whoever is waiting.
  for k in select id from class where term_id = r.to_term_id and deleted_at is null and waitlist_enabled loop
    loop
      nxt := app.offer_next_place(k.id);
      exit when nxt is null;
      offered := offered + 1;
    end loop;
  end loop;
  update reenrolment_round set status = 'published', published_at = now() where id = r.id;
  -- One note per family with a child placed.
  for f in select s.family_id, string_agg(distinct s.first_name, ' and ') kids from reenrolment_offer ro join student s on s.id = ro.student_id
            where ro.round_id = r.id and ro.status = 'placed' group by s.family_id loop
    perform app.notify_family(f.family_id, 'new_enrolment', f.kids || '’s classes for ' || t.name || ' are booked',
      'They start the week of ' || to_char(t.starts_on, 'FMDD FMMonth') || '.', '/family/children');
  end loop;
  perform app.notify_admins(r.studio_id, 'new_enrolment', 'Re-enrolment for ' || t.name || ' published',
    format('%s placed, %s on waiting lists, %s places released', placed, waiting,
           (select count(*) from reenrolment_offer where round_id = r.id and status = 'released')), '/classes');
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (r.studio_id, auth.uid(), 'create', 'term', r.to_term_id, format('Re-enrolment published: %s placed, %s waiting, %s offered from waiting lists', placed, waiting, offered));
  return jsonb_build_object('placed', placed, 'waitlisted', waiting, 'released',
    (select count(*) from reenrolment_offer where round_id = r.id and status = 'released'), 'offered', offered);
end $$;

-- Publishing enrols many children at once: one summary, not one note each.
create or replace function app.on_enrolment_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cname text; child text; teacher uuid;
begin
  if new.status <> 'active' or current_setting('app.bulk_enrol', true) = 'on' then return null; end if;
  select c.name, sm.user_id into cname, teacher
    from class c left join staff_member sm on sm.id = c.teacher_id where c.id = new.class_id;
  select first_name || ' ' || last_name into child from student where id = new.student_id;
  perform app.notify_admins(new.studio_id, 'new_enrolment', child || ' joined ' || cname,
    null, '/classes?id=' || new.class_id);
  perform app.notify_user(new.studio_id, teacher, 'new_enrolment', 'New in ' || cname,
    child || ' joins your class.', '/teach');
  return null;
end $$;

-- What a family sees: each child's proposed class for the next term.
create or replace function app.family_reenrolment()
  returns table (offer_id uuid, round_id uuid, student_id uuid, child text, from_class text, class_id uuid, class_name text,
                 day_of_week smallint, start_time time, location text, price_minor int, pricing text, reason text, status text,
                 respond_by date, term_name text, term_starts date, round_status text, uniform text[])
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select o.id, r.id, s.id, coalesce(s.preferred_name, s.first_name), fc.name, c.id, c.name, c.day_of_week, c.start_time,
         l.name, c.price_minor, c.pricing::text, o.reason, o.status, r.respond_by, t.name, t.starts_on, r.status, c.uniform
    from reenrolment_offer o join reenrolment_round r on r.id = o.round_id and r.status in ('open', 'closed', 'published')
    join term t on t.id = r.to_term_id
    join student s on s.id = o.student_id and s.deleted_at is null
    left join class fc on fc.id = o.from_class_id
    left join class c on c.id = o.class_id
    left join location l on l.id = c.location_id
   where o.student_id in (select app.guardian_student_ids())
     and (r.status <> 'published' or r.published_at > now() - interval '30 days')
   order by t.starts_on, s.first_name, c.day_of_week, c.start_time
$$;

revoke all on function app.propose_next_class(uuid, uuid, uuid), app.start_reenrolment(uuid, uuid, date),
  app.reenrolment_round_for(uuid, text[]), app.set_reenrolment_class(uuid, uuid), app.open_reenrolment(uuid),
  app.answer_reenrolment(uuid, boolean), app.close_reenrolment(uuid, boolean), app.reopen_reenrolment(uuid, date),
  app.cancel_reenrolment(uuid), app.publish_reenrolment(uuid), app.family_reenrolment(), app.reenrolment_shown(uuid) from public;
grant execute on function app.propose_next_class(uuid, uuid, uuid), app.start_reenrolment(uuid, uuid, date),
  app.set_reenrolment_class(uuid, uuid), app.open_reenrolment(uuid), app.answer_reenrolment(uuid, boolean),
  app.close_reenrolment(uuid, boolean), app.reopen_reenrolment(uuid, date), app.cancel_reenrolment(uuid),
  app.publish_reenrolment(uuid), app.family_reenrolment(), app.reenrolment_shown(uuid) to authenticated;

-- ── F7 · Show production pack ──────────────────────────────────────────────
alter table event_routine add column duration_sec smallint check (duration_sec is null or duration_sec between 5 and 3600);
alter table studio_event add column costume_budget_minor integer check (costume_budget_minor is null or costume_budget_minor >= 0);
alter table costume_item add column charge_families boolean not null default true;
alter table costume_order add column invoice_id uuid references invoice(id) on delete set null;
alter table event_helper_slot add column routine_id uuid references event_routine(id) on delete set null;

-- Adding a dancer who is already in an item is a no-op, not an error.
create or replace function app.routine_dancer_once() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if exists (select 1 from routine_dancer where routine_id = new.routine_id and student_id = new.student_id) then return null; end if;
  return new;
end $$;
create trigger routine_dancer_once before insert on routine_dancer for each row execute function app.routine_dancer_once();

-- Dancers in an item follow the class dancing it: confirmed dancers from
-- that class are added; a dancer who drops out of the show leaves its items.
create or replace function app.routine_fill_from_class() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.class_id is null or new.deleted_at is not null then return null; end if;
  if tg_op = 'UPDATE' and new.class_id is not distinct from old.class_id then return null; end if;
  insert into routine_dancer (routine_id, student_id)
  select new.id, p.student_id from event_participant p
   where p.event_id = new.event_id and p.status = 'confirmed' and p.deleted_at is null
     and (p.invited_class_id = new.class_id or exists (select 1 from enrolment en where en.class_id = new.class_id
            and en.student_id = p.student_id and en.status = 'active' and en.deleted_at is null))
  on conflict do nothing;
  return null;
end $$;
create trigger routine_fill_from_class after insert or update of class_id on event_routine
  for each row execute function app.routine_fill_from_class();

create or replace function app.participant_routines() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.status = 'confirmed' and new.deleted_at is null then
    insert into routine_dancer (routine_id, student_id)
    select r.id, new.student_id from event_routine r
     where r.event_id = new.event_id and r.deleted_at is null and r.class_id is not null
       and (new.invited_class_id = r.class_id or exists (select 1 from enrolment en where en.class_id = r.class_id
              and en.student_id = new.student_id and en.status = 'active' and en.deleted_at is null))
    on conflict do nothing;
  elsif tg_op = 'UPDATE' and old.status = 'confirmed' then
    delete from routine_dancer d using event_routine r
     where r.id = d.routine_id and r.event_id = new.event_id and d.student_id = new.student_id;
  end if;
  return null;
end $$;
create trigger participant_routines after insert or update of status, deleted_at on event_participant
  for each row execute function app.participant_routines();

-- The running order: what, who, music and running time, with a quick-change
-- warning when someone dances in two items in a row, and the helpers and
-- chaperones assigned to each item.
create or replace function app.running_order(p_event uuid)
  returns table (id uuid, item_no int, title text, class_id uuid, class_name text, music text, costume text, notes text,
                 duration_sec int, starts_after_sec int, dancers int, quick_change text, quick_change_count int, helpers text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare ev studio_event;
begin
  select * into ev from studio_event e where e.id = p_event and e.deleted_at is null;
  if ev.id is null or not app.is_staff(ev.studio_id) then raise exception 'FORBIDDEN: staff only' using errcode = 'insufficient_privilege'; end if;
  return query
  with items as (
    select r.*, row_number() over (order by r.position, r.title, r.id)::int n
      from event_routine r where r.event_id = ev.id and r.deleted_at is null
  )
  select i.id, i.n, i.title, i.class_id, c.name, i.music, i.costume, i.notes, i.duration_sec::int,
         coalesce(sum(i.duration_sec) over (order by i.n rows between unbounded preceding and 1 preceding), 0)::int,
         (select count(*)::int from routine_dancer d where d.routine_id = i.id),
         (select string_agg(coalesce(s.preferred_name, s.first_name) || ' ' || left(s.last_name, 1) || '.', ', ' order by s.first_name)
            from routine_dancer d join routine_dancer d2 on d2.student_id = d.student_id
            join items p on p.id = d2.routine_id and p.n = i.n - 1
            join student s on s.id = d.student_id where d.routine_id = i.id),
         (select count(*)::int from routine_dancer d join routine_dancer d2 on d2.student_id = d.student_id
            join items p on p.id = d2.routine_id and p.n = i.n - 1 where d.routine_id = i.id),
         (select string_agg(sl.role || ': ' || coalesce((select string_agg(u.name, ', ' order by u.created_at) from event_helper_signup u where u.slot_id = sl.id), 'nobody yet'), '; ' order by sl.role)
            from event_helper_slot sl where sl.routine_id = i.id and sl.deleted_at is null)
    from items i left join class c on c.id = i.class_id
   order by i.n;
end $$;

-- Costume budget: what the costumes cost, what families are charged, what
-- the school pays, and what has been billed.
create or replace function app.costume_budget(p_event uuid)
  returns table (budget_minor int, total_minor bigint, families_minor bigint, school_minor bigint, billed_minor bigint,
                 to_bill int, lines int, sized int)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare ev studio_event;
begin
  select * into ev from studio_event where id = p_event;
  if not app.is_staff(ev.studio_id) then raise exception 'FORBIDDEN: staff only' using errcode = 'insufficient_privilege'; end if;
  return query
  select ev.costume_budget_minor,
         coalesce(sum(i.price_minor), 0)::bigint,
         coalesce(sum(i.price_minor) filter (where i.charge_families), 0)::bigint,
         coalesce(sum(i.price_minor) filter (where not i.charge_families), 0)::bigint,
         coalesce(sum(i.price_minor) filter (where o.invoice_id is not null), 0)::bigint,
         (count(*) filter (where i.charge_families and i.price_minor > 0 and o.invoice_id is null))::int,
         count(l.*)::int, (count(*) filter (where l.size is not null))::int
    from app.costume_list(p_event) l join costume_item i on i.id = l.item_id
    left join costume_order o on o.item_id = l.item_id and o.student_id = l.student_id;
end $$;

-- Costume charges on families' accounts, once per dancer and item.
create or replace function app.bill_costumes(p_event uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare ev studio_event; f record; inv uuid; n int := 0;
begin
  select * into ev from studio_event where id = p_event and deleted_at is null;
  perform app.require_admin(ev.studio_id);
  for f in select s.family_id,
                  jsonb_agg(jsonb_build_object('kind', 'costume', 'description', i.name || ' — ' || ev.title || ' — ' || s.first_name,
                    'quantity', 1, 'unit_minor', i.price_minor, 'student_id', s.id)) items
             from app.costume_list(p_event) l join costume_item i on i.id = l.item_id
             join student s on s.id = l.student_id
             left join costume_order o on o.item_id = l.item_id and o.student_id = l.student_id
            where i.charge_families and i.price_minor > 0 and o.invoice_id is null
            group by s.family_id loop
    inv := app.create_invoice(f.family_id, f.items, greatest(ev.starts_at::date - 14, current_date + 7), null, 0, true, null);
    update invoice_item set event_id = ev.id where invoice_id = inv;
    insert into costume_order (item_id, student_id, invoice_id)
    select l.item_id, l.student_id, inv
      from app.costume_list(p_event) l join costume_item i on i.id = l.item_id
      join student s on s.id = l.student_id and s.family_id = f.family_id
      left join costume_order o on o.item_id = l.item_id and o.student_id = l.student_id
     where i.charge_families and i.price_minor > 0 and o.invoice_id is null
    on conflict (item_id, student_id) do update set invoice_id = excluded.invoice_id, updated_at = now();
    n := n + 1;
  end loop;
  return n;
end $$;

-- Child performance licences. In England and Wales many public performances
-- by children of compulsory school age need a licence from the local
-- authority, with exemptions; whether one is needed is the school's decision.
create table performer_licence (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  event_id    uuid not null references studio_event(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  needed      text not null default 'unknown' check (needed in ('unknown', 'needed', 'not_needed')),
  status      text not null default 'not_applied' check (status in ('not_applied', 'applied', 'issued', 'refused')),
  authority   text check (authority is null or length(authority) <= 120),
  reference   text check (reference is null or length(reference) <= 80),
  issued_on   date,
  expires_on  date,
  performance_days smallint check (performance_days is null or performance_days between 0 and 366),
  note        text check (note is null or length(note) <= 300),
  updated_by  uuid references user_account(id) on delete set null,
  updated_at  timestamptz not null default now(),
  unique (event_id, student_id),
  check (expires_on is null or issued_on is null or expires_on >= issued_on)
);
alter table performer_licence enable row level security; alter table performer_licence force row level security;
create policy performer_licence_staff on performer_licence for select using (app.is_staff(studio_id));
grant select on performer_licence to authenticated;
grant all on performer_licence to service_role;

create or replace function app.licence_tracker(p_event uuid)
  returns table (student_id uuid, dancer text, age_on_day int, items int, needed text, status text, authority text,
                 reference text, issued_on date, expires_on date, performance_days int, note text, flag text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare ev studio_event;
begin
  select * into ev from studio_event e where e.id = p_event and e.deleted_at is null;
  if ev.id is null or not app.is_staff(ev.studio_id) then raise exception 'FORBIDDEN: staff only' using errcode = 'insufficient_privilege'; end if;
  return query
  select s.id, s.first_name || ' ' || s.last_name,
         case when s.date_of_birth is null then null else extract(year from age(ev.starts_at::date, s.date_of_birth))::int end,
         (select count(*)::int from routine_dancer d join event_routine r on r.id = d.routine_id and r.event_id = ev.id and r.deleted_at is null
           where d.student_id = s.id),
         coalesce(l.needed, 'unknown'), coalesce(l.status, 'not_applied'), l.authority, l.reference, l.issued_on, l.expires_on,
         l.performance_days::int, l.note,
         case when coalesce(l.needed, 'unknown') = 'not_needed' then 'not_needed'
              when coalesce(l.needed, 'unknown') = 'unknown' then 'decide'
              when l.status = 'issued' and (l.expires_on is null or l.expires_on >= ev.starts_at::date) then 'ok'
              when l.status = 'issued' then 'expired'
              when l.status = 'refused' then 'refused'
              else 'missing' end
    from event_participant p join student s on s.id = p.student_id and s.deleted_at is null
    left join performer_licence l on l.event_id = ev.id and l.student_id = s.id
   where p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null
   order by s.first_name, s.last_name;
end $$;

create or replace function app.set_licence(p_event uuid, p_student uuid, p_needed text, p_status text, p_authority text,
                                           p_reference text, p_issued date, p_expires date, p_days int, p_note text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare ev studio_event;
begin
  select * into ev from studio_event where id = p_event and deleted_at is null;
  if ev.id is null then raise exception 'NOT_FOUND: that event' using errcode = 'no_data_found'; end if;
  perform app.require_admin(ev.studio_id);
  if not exists (select 1 from event_participant where event_id = ev.id and student_id = p_student and status = 'confirmed' and deleted_at is null) then
    raise exception 'INVALID: that dancer is not in this show' using errcode = 'check_violation';
  end if;
  if p_status = 'issued' and p_issued is null then raise exception 'INVALID: add the date the licence was issued' using errcode = 'check_violation'; end if;
  if p_expires is not null and p_issued is not null and p_expires < p_issued then
    raise exception 'INVALID: the licence cannot end before it was issued' using errcode = 'check_violation';
  end if;
  insert into performer_licence (studio_id, event_id, student_id, needed, status, authority, reference, issued_on, expires_on, performance_days, note, updated_by)
  values (ev.studio_id, ev.id, p_student, coalesce(p_needed, 'unknown'), coalesce(p_status, 'not_applied'), nullif(btrim(p_authority), ''),
          nullif(btrim(p_reference), ''), p_issued, p_expires, p_days, nullif(btrim(p_note), ''), auth.uid())
  on conflict (event_id, student_id) do update set needed = excluded.needed, status = excluded.status, authority = excluded.authority,
     reference = excluded.reference, issued_on = excluded.issued_on, expires_on = excluded.expires_on,
     performance_days = excluded.performance_days, note = excluded.note, updated_by = excluded.updated_by, updated_at = now();
end $$;

-- One decision for every dancer at once ("all need one", "none need one").
create or replace function app.set_licence_needed_all(p_event uuid, p_needed text) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare ev studio_event; n int;
begin
  select * into ev from studio_event where id = p_event and deleted_at is null;
  perform app.require_admin(ev.studio_id);
  if p_needed not in ('unknown', 'needed', 'not_needed') then raise exception 'INVALID: needed, not needed or unknown' using errcode = 'check_violation'; end if;
  insert into performer_licence (studio_id, event_id, student_id, needed, updated_by)
  select ev.studio_id, ev.id, p.student_id, p_needed, auth.uid() from event_participant p
   where p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null
  on conflict (event_id, student_id) do update set needed = excluded.needed, updated_by = excluded.updated_by, updated_at = now();
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function app.running_order(uuid), app.costume_budget(uuid), app.bill_costumes(uuid), app.licence_tracker(uuid),
  app.set_licence(uuid, uuid, text, text, text, text, date, date, int, text), app.set_licence_needed_all(uuid, text) from public;
grant execute on function app.running_order(uuid), app.costume_budget(uuid), app.bill_costumes(uuid), app.licence_tracker(uuid),
  app.set_licence(uuid, uuid, text, text, text, text, date, date, int, text), app.set_licence_needed_all(uuid, text) to authenticated;

-- app.upcoming_costs: the exam and costume rules are folded into the 0060 version
-- (which also handles split-billing shares), so it is not redefined here.
revoke all on function app.upcoming_costs(uuid) from public;
grant execute on function app.upcoming_costs(uuid) to authenticated;
