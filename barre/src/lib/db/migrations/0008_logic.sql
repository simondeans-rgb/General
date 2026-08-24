-- ============================================================================
-- 0008 · Business rules enforced in the database
-- ----------------------------------------------------------------------------
-- Capacity, waitlist ordering and the audit trail live here rather than only
-- in application code. A rule that matters is a rule that must hold no matter
-- which client wrote the row.
-- ============================================================================

-- Counting must see every row, not the caller's RLS-filtered slice, or a class
-- would appear to have space simply because the reader cannot see who is in it.
create or replace function app.class_enrolled_count(p_class uuid) returns integer
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select count(*)::int from enrolment
   where class_id = p_class and status = 'active' and deleted_at is null
$$;

create or replace function app.class_waitlist_count(p_class uuid) returns integer
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select count(*)::int from waitlist_entry
   where class_id = p_class and status in ('waiting','offered') and deleted_at is null
$$;

create or replace function app.enforce_capacity() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cap integer; taken integer;
begin
  if new.status <> 'active' or new.deleted_at is not null then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'active' and old.class_id = new.class_id then
    return new;                              -- already counted, not a new place
  end if;
  select capacity into cap from class where id = new.class_id;
  if cap is null then return new; end if;
  select count(*) into taken from enrolment
   where class_id = new.class_id and status = 'active' and deleted_at is null
     and id <> new.id;
  if taken >= cap then
    raise exception 'CLASS_FULL: class % is at capacity (%/%)', new.class_id, taken, cap
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger enrolment_capacity
  before insert or update on enrolment
  for each row execute function app.enforce_capacity();

-- Waitlist positions are assigned by the database so two simultaneous joins
-- cannot both claim position 4.
create or replace function app.assign_waitlist_position() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.position is null or new.position = 0 then
    select coalesce(max(position), 0) + 1 into new.position
      from waitlist_entry
     where class_id = new.class_id and deleted_at is null;
  end if;
  return new;
end $$;

create trigger waitlist_position
  before insert on waitlist_entry
  for each row execute function app.assign_waitlist_position();

-- ---------------------------------------------------------------------------
-- Session generation. Produces one class_session per matching date in the
-- term, skipping breaks. Times are built in the studio's own timezone so an
-- 18:00 class stays at 18:00 across a daylight-saving change.
-- ---------------------------------------------------------------------------
create or replace function app.generate_class_sessions(p_class uuid)
  returns integer
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  c record; tz text; made integer := 0; d date;
begin
  select cl.*, t.starts_on, t.ends_on into c
    from class cl join term t on t.id = cl.term_id
   where cl.id = p_class and cl.deleted_at is null;
  if not found then return 0; end if;

  select timezone into tz from studio where id = c.studio_id;

  for d in
    select gs::date from generate_series(c.starts_on, c.ends_on, interval '1 day') gs
     where extract(dow from gs) = c.day_of_week
       and not exists (select 1 from term_break b
                        where b.term_id = c.term_id and b.deleted_at is null
                          and gs::date between b.starts_on and b.ends_on)
  loop
    insert into class_session (studio_id, class_id, starts_at, ends_at)
    values (
      c.studio_id, c.id,
      ((d + c.start_time) at time zone tz),
      ((d + c.start_time + make_interval(mins => c.duration_min)) at time zone tz)
    )
    on conflict do nothing;
    made := made + 1;
  end loop;
  return made;
end $$;

-- ---------------------------------------------------------------------------
-- updated_at on every table that has the column
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  for t in select table_name from information_schema.columns
            where table_schema = 'public' and column_name = 'updated_at'
  loop
    execute format(
      'create trigger %1$s_touch before update on %1$I
         for each row execute function app.touch_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Audit trail on the tables where "who changed this, and when" actually
-- matters: health data, consent, enrolment, payments and staff access.
-- ---------------------------------------------------------------------------
create or replace function app.write_audit() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare rec record; sid uuid;
begin
  rec := coalesce(new, old);
  begin sid := rec.studio_id; exception when others then sid := null; end;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), lower(tg_op), tg_table_name, rec.id,
          case tg_op when 'DELETE' then 'removed' when 'INSERT' then 'created'
                     else 'updated' end);
  return rec;
end $$;

do $$
declare t text;
begin
  foreach t in array array['medical_record','consent_record','enrolment',
                           'payment','membership','staff_member'] loop
    execute format(
      'create trigger %1$s_audit after insert or update or delete on %1$I
         for each row execute function app.write_audit()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Soft deletion
-- ---------------------------------------------------------------------------
-- Under FORCE row level security Postgres requires the row produced by an
-- UPDATE to still satisfy the table's SELECT policies. Since those policies
-- hide `deleted_at is not null`, a plain `update ... set deleted_at = now()`
-- is rejected: the writer would no longer be able to see what they just wrote.
--
-- The tempting fix is to stop hiding deleted rows in the policy and filter in
-- application queries instead — which moves a security guarantee out of the
-- database and into whichever query someone writes next. Instead deletion goes
-- through one authorised, audited entry point. The caller's rights are checked
-- explicitly here precisely because SECURITY DEFINER bypasses RLS.
create or replace function app.soft_delete(p_table text, p_id uuid)
  returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid;
  allowed constant text[] := array[
    'family','guardian','student','emergency_contact','consent_record','medical_record',
    'location','room','staff_member','term','term_break','dance_style','level',
    'class','class_session','enrolment','trial','waitlist_entry','enquiry',
    'invoice','invoice_item','communication','communication_template','notification'];
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

revoke all on function app.soft_delete(text, uuid) from public;
grant execute on function app.soft_delete(text, uuid) to authenticated, service_role;
