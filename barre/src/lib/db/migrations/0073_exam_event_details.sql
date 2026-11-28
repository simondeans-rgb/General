-- ============================================================================
-- 0073 · An exam made as an event keeps its examining body
-- ----------------------------------------------------------------------------
-- Since 0066 an "Exam" event is the exam session's public face, and creating
-- one makes the session. But the event form had no place for the examining
-- body (RAD, ISTD…), so the session guessed it from the title or said "Board
-- to set". The form now asks for it, and for invoice-on-entry (0072), and
-- saves both to the exam session behind the event.
-- ============================================================================

create or replace function app.set_exam_details(p_event uuid, p_board text, p_bill_on_entry boolean) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare x exam_session;
begin
  select * into x from exam_session where event_id = p_event and deleted_at is null;
  if x.id is null then raise exception 'NOT_FOUND: that exam' using errcode = 'no_data_found'; end if;
  perform app.require_admin(x.studio_id);
  update exam_session
     set board = coalesce(nullif(btrim(p_board), ''), board),
         bill_on_entry = coalesce(p_bill_on_entry, bill_on_entry)
   where id = x.id;
end $$;
revoke all on function app.set_exam_details(uuid, text, boolean) from public;
grant execute on function app.set_exam_details(uuid, text, boolean) to authenticated;
