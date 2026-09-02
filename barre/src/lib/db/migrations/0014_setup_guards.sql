-- ============================================================================
-- 0014 · Removing setup rows safely
-- ----------------------------------------------------------------------------
-- Admins could already write locations, rooms, terms, breaks, styles and
-- levels — migration 0006 gave every reference table an is_admin `for all`
-- policy. What was missing was a safe way to remove one.
--
-- app.soft_delete would happily retire a room that twelve classes are taught
-- in. The class rows keep pointing at it, the timetable still renders it, and
-- the studio is left with a room that exists everywhere except in its own
-- settings. A studio's setup is referenced by its operations, so removal has
-- to ask what depends on it first.
-- ============================================================================

create or replace function app.retire_setup(p_table text, p_id uuid) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid;
  used integer := 0;
  what text;
  allowed constant text[] := array['location','room','term','term_break','dance_style','level'];
begin
  if not (p_table = any(allowed)) then
    raise exception 'RETIRE_UNSUPPORTED: %', p_table using errcode = 'feature_not_supported';
  end if;

  execute format('select studio_id from %I where id = $1 and deleted_at is null', p_table)
    into sid using p_id;
  if sid is null then return false; end if;               -- absent or already gone

  if not app.is_admin(sid) then
    raise exception 'FORBIDDEN: only the office may change studio setup'
      using errcode = 'insufficient_privilege';
  end if;

  -- What still points at this row. A term_break is the one thing nothing
  -- depends on: it is only ever read while generating sessions.
  case p_table
    when 'location' then
      select count(*)::int into used from class
       where location_id = p_id and deleted_at is null;
      what := 'class';
      if used = 0 then
        select count(*)::int into used from room where location_id = p_id and deleted_at is null;
        what := 'room';
      end if;
    when 'room' then
      select count(*)::int into used from class where room_id = p_id and deleted_at is null;
      what := 'class';
    when 'term' then
      select count(*)::int into used from class where term_id = p_id and deleted_at is null;
      what := 'class';
    when 'dance_style' then
      select count(*)::int into used from class where dance_style_id = p_id and deleted_at is null;
      what := 'class';
    when 'level' then
      select count(*)::int into used from class where level_id = p_id and deleted_at is null;
      what := 'class';
    else used := 0;
  end case;

  if used > 0 then
    raise exception 'IN_USE: % % still use this', used, what
      using errcode = 'foreign_key_violation';
  end if;

  execute format('update %I set deleted_at = now(), updated_at = now() where id = $1', p_table)
    using p_id;

  -- Retiring a term takes its breaks with it; they mean nothing on their own.
  if p_table = 'term' then
    update term_break set deleted_at = now(), updated_at = now()
     where term_id = p_id and deleted_at is null;
  end if;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'retire', p_table, p_id, 'setup row retired');
  return true;
end $$;

revoke all on function app.retire_setup(text, uuid) from public;
grant execute on function app.retire_setup(text, uuid) to authenticated, service_role;
