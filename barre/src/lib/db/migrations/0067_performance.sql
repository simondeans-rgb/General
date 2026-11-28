-- ============================================================================
-- 0067 · Attendance this term, without re-checking every row's security
-- ----------------------------------------------------------------------------
-- "Attendance this term" (teacher's My students, every register row) was a
-- subquery over attendance_record joined to class_session. Under row-level
-- security, each of those rows re-ran the full visibility rules of both
-- tables (which now include location limits, cover windows and media
-- rules), once per row, per child: about 0.7 s per child, 18 s for a class.
--
-- The figure is a summary of a child the caller can already see. So: check
-- that once (app.can_see_student), then count directly. Same result, same
-- access rule, measured in milliseconds.
-- ============================================================================

create or replace function app.term_attendance_pct(p_student uuid) returns int
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare sid uuid; v int;
begin
  if not app.can_see_student(p_student) then return null; end if;
  select studio_id into sid from student where id = p_student;
  select round(100.0 * count(*) filter (where a.status in ('present', 'late')) / nullif(count(*), 0))::int
    into v
    from attendance_record a join class_session s on s.id = a.session_id
   where a.student_id = p_student and a.deleted_at is null and s.deleted_at is null
     and s.starts_at <= now() and s.starts_at >= app.current_term_start(sid);
  return v;
end $$;

revoke all on function app.term_attendance_pct(uuid) from public;
grant execute on function app.term_attendance_pct(uuid) to authenticated;

-- The names of the caller's own classes a child is in (teacher's My students):
-- same idea, the class and enrolment rules are not re-run for every row.
create or replace function app.my_class_names_for(p_student uuid) returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select string_agg(distinct c.name, ', ')
    from enrolment e join class c on c.id = e.class_id and c.deleted_at is null
   where e.student_id = p_student and e.status = 'active' and e.deleted_at is null
     and c.id in (select app.teacher_class_ids());
$$;
revoke all on function app.my_class_names_for(uuid) from public;
grant execute on function app.my_class_names_for(uuid) to authenticated;
