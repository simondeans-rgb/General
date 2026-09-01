-- ============================================================================
-- 0013 · Admins build the timetable, teachers run their own room
-- ----------------------------------------------------------------------------
-- Three changes, all of them narrowing or completing something that was
-- already half-present in the schema.
--
-- 1. Sessions can be regenerated safely. app.generate_class_sessions already
--    said `on conflict do nothing`, but nothing conflicted: there was no
--    unique constraint, so editing a class's day or time and regenerating
--    would have doubled up every session.
--
-- 2. A teacher may broadcast to their own classes. Until now `comm_staff_write`
--    was `for all` with `app.is_staff`, which let any teacher send a direct
--    message to any family in the studio — far wider than the job needs.
--
-- 3. A teacher may write the register's notes and close it. They could already
--    update their own sessions; this makes the intent explicit and gives the
--    close a single, auditable path.
-- ============================================================================

-- ── 1. One session per class per start ─────────────────────────────────────
-- Dedupe first: a database seeded before this index existed may hold repeats.
delete from class_session a
 using class_session b
 where a.class_id = b.class_id and a.starts_at = b.starts_at and a.id > b.id
   and a.deleted_at is null and b.deleted_at is null;

create unique index session_class_start_unique
  on class_session (class_id, starts_at) where deleted_at is null;

-- Regenerating after a class moves: retire the sessions nobody has touched and
-- rebuild from the class's current day and time. A session with a register
-- already taken is left alone — attendance is a record of what happened, and
-- moving next term's slot must not rewrite last week's.
create or replace function app.reschedule_class(p_class uuid) returns integer
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; removed integer;
begin
  select studio_id into sid from class where id = p_class and deleted_at is null;
  if sid is null then return 0; end if;
  if not app.is_admin(sid) then
    raise exception 'FORBIDDEN: only the office may reschedule a class'
      using errcode = 'insufficient_privilege';
  end if;

  with gone as (
    update class_session cs set deleted_at = now(), updated_at = now()
     where cs.class_id = p_class and cs.deleted_at is null
       and cs.starts_at > now()
       and not exists (select 1 from attendance_record ar
                        where ar.session_id = cs.id and ar.deleted_at is null)
    returning 1)
  select count(*)::int into removed from gone;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'reschedule', 'class', p_class,
          format('%s future sessions rebuilt', removed));

  return app.generate_class_sessions(p_class) - removed;
end $$;

revoke all on function app.reschedule_class(uuid) from public;
grant execute on function app.reschedule_class(uuid) to authenticated, service_role;

-- ── 2. Who may send what ───────────────────────────────────────────────────
drop policy comm_staff_write on communication;

-- The office sends anything: announcements, class broadcasts, direct messages.
create policy comm_admin_write on communication for all
  using (deleted_at is null and app.is_admin(studio_id))
  with check (app.is_admin(studio_id));

-- A teacher sends one kind of thing to one set of people: a notice to a class
-- they actually teach. Not a studio announcement, and not a message to a
-- family — a conversation with a parent belongs to the office.
create policy comm_teacher_read on communication for select
  using (deleted_at is null and app.has_role(studio_id, 'teacher')
         and (kind = 'studio_announcement'
              or (kind = 'class_broadcast' and class_id in (select app.teacher_class_ids()))));

create policy comm_teacher_broadcast on communication for insert
  with check (app.has_role(studio_id, 'teacher')
              and kind = 'class_broadcast'
              and class_id in (select app.teacher_class_ids())
              and sent_by = auth.uid());

-- Their own notice, while it is still theirs to correct.
create policy comm_teacher_amend on communication for update
  using (deleted_at is null and app.has_role(studio_id, 'teacher')
         and kind = 'class_broadcast' and sent_by = auth.uid()
         and class_id in (select app.teacher_class_ids()))
  with check (kind = 'class_broadcast' and sent_by = auth.uid()
              and class_id in (select app.teacher_class_ids()));

-- Withdrawing a notice. Same shape as retiring a resource: the author, or the
-- office, and it leaves a trail.
create or replace function app.withdraw_notice(p_id uuid) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; author uuid; k comm_kind;
begin
  select studio_id, sent_by, kind into sid, author, k
    from communication where id = p_id and deleted_at is null;
  if sid is null then return false; end if;

  if not (app.is_admin(sid)
          or (k = 'class_broadcast' and app.has_role(sid, 'teacher') and author = auth.uid())) then
    raise exception 'FORBIDDEN: only the office, or whoever sent it, may withdraw a notice'
      using errcode = 'insufficient_privilege';
  end if;

  update communication set deleted_at = now(), updated_at = now() where id = p_id;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'withdraw', 'communication', p_id, 'notice withdrawn');
  return true;
end $$;

revoke all on function app.withdraw_notice(uuid) from public;
grant execute on function app.withdraw_notice(uuid) to authenticated, service_role;

-- ── 3. Closing a register ──────────────────────────────────────────────────
-- Done as a function so "closed" always means the same thing: every enrolled
-- dancer accounted for, and a timestamp that says who decided that and when.
create or replace function app.close_register(p_session uuid) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; cid uuid; unmarked integer;
begin
  select cs.studio_id, cs.class_id into sid, cid
    from class_session cs where cs.id = p_session and cs.deleted_at is null;
  if sid is null then return false; end if;

  if not (app.is_admin(sid) or cid in (select app.teacher_class_ids())) then
    raise exception 'FORBIDDEN: not your class' using errcode = 'insufficient_privilege';
  end if;

  select count(*)::int into unmarked
    from enrolment e
   where e.class_id = cid and e.status = 'active' and e.deleted_at is null
     and not exists (select 1 from attendance_record ar
                      where ar.session_id = p_session and ar.student_id = e.student_id
                        and ar.deleted_at is null);
  if unmarked > 0 then
    raise exception 'REGISTER_INCOMPLETE: % still unmarked', unmarked
      using errcode = 'check_violation';
  end if;

  update class_session set register_closed_at = now(), updated_at = now() where id = p_session;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'close_register', 'class_session', p_session, 'register closed');
  return true;
end $$;

revoke all on function app.close_register(uuid) from public;
grant execute on function app.close_register(uuid) to authenticated, service_role;
