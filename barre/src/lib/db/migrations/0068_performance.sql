-- ============================================================================
-- 0068 · Screens in milliseconds: access checked once per query, not per row
-- ----------------------------------------------------------------------------
-- Measured (tests/perf-budget.test.ts): with the policies as they were, every
-- row of a table read by an owner or administrator ran app.is_admin(studio_id)
-- again: a security-definer function that looks up the caller's memberships,
-- the school's status, the chosen school and any location limit. About 0.2 ms
-- a row, so 1,700 register marks cost 350 ms before any real work, and a
-- report that touches the register four times took seconds. Postgres then
-- judged those plans expensive enough to compile them (JIT), adding ~0.4 s.
--
-- The answer to "is the caller an administrator of school X" does not depend
-- on the row, only on X. So each per-row call
--
--     app.is_admin(studio_id)
--
-- is rewritten to the same question asked once per query, as a set:
--
--     coalesce(studio_id in (select app.admin_studio_ids()), false)
--
-- where app.admin_studio_ids() is exactly the schools for which
-- app.is_admin() is true (it tests app.is_admin itself, over the caller's own
-- memberships, which is the only place a true answer can come from). The
-- coalesce keeps a null school answering false, as before, so the rewrite is
-- the same rule under NOT and OR too. The same is done for app.is_staff and
-- app.has_role(..., VARIADIC ARRAY[...]).
--
-- Nothing about who may see what changes; tests/perf-budget.test.ts restores
-- the original policies inside a transaction and checks every table returns
-- the same rows for every role.
--
-- app.speed_up_policies() does the rewrite and records each original in
-- app.policy_rewrite. It is idempotent: a later migration that adds a policy
-- in the old style can call it again.
-- ============================================================================

create or replace function app.admin_studio_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select distinct m.studio_id from app.memberships() m where app.is_admin(m.studio_id)
$$;

create or replace function app.staff_studio_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select distinct m.studio_id from app.memberships() m where app.is_staff(m.studio_id)
$$;

create or replace function app.role_studio_ids(p_roles app_role[]) returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select distinct m.studio_id from app.memberships() m where app.has_role(m.studio_id, variadic p_roles)
$$;

create table if not exists app.policy_rewrite (
  schemaname text not null, tablename text not null, policyname text not null,
  old_qual text, old_check text, new_qual text, new_check text,
  rewritten_at timestamptz not null default now(),
  primary key (schemaname, tablename, policyname)
);
revoke all on app.policy_rewrite from public;

create or replace function app.rewrite_policy_expr(p text) returns text
  language sql immutable as $$
  select regexp_replace(regexp_replace(regexp_replace(p,
    'app\.is_admin\(((?:\w+\.)?\w+)\)', 'COALESCE((\1 IN (SELECT app.admin_studio_ids())), false)', 'g'),
    'app\.is_staff\(((?:\w+\.)?\w+)\)', 'COALESCE((\1 IN (SELECT app.staff_studio_ids())), false)', 'g'),
    'app\.has_role\(((?:\w+\.)?\w+), VARIADIC (ARRAY\[[^]]*\])\)', 'COALESCE((\1 IN (SELECT app.role_studio_ids(\2))), false)', 'g')
$$;

create or replace function app.speed_up_policies() returns int
  language plpgsql as $$
declare r record; nq text; nc text; n int := 0; roles text;
begin
  for r in select * from pg_policies
            where schemaname = 'public'
              and (coalesce(qual, '') ~ 'app\.(is_admin|is_staff|has_role)\('
                   or coalesce(with_check, '') ~ 'app\.(is_admin|is_staff|has_role)\(')
  loop
    nq := case when r.qual is null then null else app.rewrite_policy_expr(r.qual) end;
    nc := case when r.with_check is null then null else app.rewrite_policy_expr(r.with_check) end;
    if nq is not distinct from r.qual and nc is not distinct from r.with_check then continue; end if;
    select string_agg(case when x = 'public' then 'public' else quote_ident(x) end, ', ') into roles
      from unnest(r.roles) x;
    insert into app.policy_rewrite (schemaname, tablename, policyname, old_qual, old_check, new_qual, new_check)
    values (r.schemaname, r.tablename, r.policyname, r.qual, r.with_check, nq, nc)
    on conflict (schemaname, tablename, policyname) do update
       set old_qual = excluded.old_qual, old_check = excluded.old_check,
           new_qual = excluded.new_qual, new_check = excluded.new_check, rewritten_at = now();
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
    execute format('create policy %I on %I.%I as %s for %s to %s%s%s',
      r.policyname, r.schemaname, r.tablename, r.permissive, r.cmd, roles,
      case when nq is null then '' else ' using (' || nq || ')' end,
      case when nc is null then '' else ' with check (' || nc || ')' end);
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function app.speed_up_policies() from public;

select app.speed_up_policies();

-- ============================================================================
-- Per-child summaries, for a whole list at once
-- ----------------------------------------------------------------------------
-- My students and the register showed, for every child, attendance this term
-- (app.term_attendance_pct), who may collect them (app.collection_brief) and
-- the teacher's classes they are in (app.my_class_names_for). Each of those
-- checks access for its one child, and each check rebuilds the caller's whole
-- set of children (app.teacher_student_ids and friends): ~10 ms a child, and
-- 8 s in the browser for a teacher's 23 children.
--
-- These take the list, work out once which of those children the caller may
-- see (the same rule as app.can_see_student / app.collection_brief, asked as a
-- set), then compute every child's figure in one pass. A child the caller may
-- not see simply has no row.
-- ============================================================================

-- Exactly the children in p_ids for whom app.can_see_student() is true.
create or replace function app.visible_student_ids(p_ids uuid[]) returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id from student s
   where s.id = any(p_ids) and s.deleted_at is null and (
         s.studio_id in (select app.admin_studio_ids())
      or s.id = (select app.student_self_id())
      or s.id in (select app.guardian_student_ids())
      or (s.studio_id in (select app.role_studio_ids(array['teacher']::app_role[]))
          and s.id in (select app.teacher_student_ids())))
$$;

-- app.term_attendance_pct for many children.
create or replace function app.term_attendance_pcts(p_ids uuid[]) returns table (student_id uuid, pct int)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with v as (select s.id, app.current_term_start(s.studio_id) as since from student s
              where s.id in (select app.visible_student_ids(p_ids)))
  select v.id, round(100.0 * count(*) filter (where a.status in ('present', 'late')) / nullif(count(a.id), 0))::int
    from v
    left join attendance_record a on a.student_id = v.id and a.deleted_at is null
     and exists (select 1 from class_session s where s.id = a.session_id and s.deleted_at is null
                    and s.starts_at <= now() and s.starts_at >= v.since)
   group by v.id
$$;

-- app.collection_brief for many children.
create or replace function app.collection_briefs(p_ids uuid[]) returns table (student_id uuid, brief jsonb)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with s as (
    select s.id, s.family_id,
           (s.studio_id in (select app.admin_studio_ids())
            or (s.studio_id in (select app.role_studio_ids(array['teacher']::app_role[]))
                and (s.id in (select app.teacher_student_ids()) or s.id in (select app.teacher_event_student_ids())))) as staff
      from student s where s.id = any(p_ids) and s.deleted_at is null),
  ok as (select * from s where staff or id in (select app.guardian_student_ids()))
  select ok.id, coalesce((
    select jsonb_agg(jsonb_build_object('name', x.name, 'relationship', x.relationship, 'allowed', x.allowed)
                     order by x.allowed desc, x.name)
      from (select c.full_name as name, c.relationship, c.allowed from collection_permission c
             where c.student_id = ok.id and c.deleted_at is null and (c.allowed or ok.staff)
            union all
            select g.full_name, g.relationship, false from guardian g join guardian_access a on a.guardian_id = g.id
             where ok.staff and g.family_id = ok.family_id and g.deleted_at is null and not a.may_collect) x), '[]'::jsonb)
    from ok
$$;

-- app.my_class_names_for for many children.
create or replace function app.my_class_names(p_ids uuid[]) returns table (student_id uuid, names text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select e.student_id, string_agg(distinct c.name, ', ')
    from enrolment e join class c on c.id = e.class_id and c.deleted_at is null
   where e.student_id = any(p_ids) and e.status = 'active' and e.deleted_at is null
     and c.id in (select app.teacher_class_ids())
   group by e.student_id
$$;

-- app.consent_now for many children: the same visibility rule as
-- app.can_see_consent, asked as a set, then each visible child's consent.
create or replace function app.consents_now(p_ids uuid[], p_kind text) returns table (student_id uuid, granted boolean)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id, (select e.granted from app.consent_effective(s.id, p_kind) e)
    from student s
   where s.id = any(p_ids) and s.deleted_at is null
     and not app.is_support_viewer(s.studio_id)
     and (s.studio_id in (select app.admin_studio_ids())
          or s.id in (select app.guardian_student_ids())
          or s.id = (select app.student_self_id())
          or (s.studio_id in (select app.role_studio_ids(array['teacher']::app_role[]))
              and (s.id in (select app.teacher_student_ids()) or s.id in (select app.teacher_event_student_ids()))))
$$;
revoke all on function app.consents_now(uuid[], text) from public;
grant execute on function app.consents_now(uuid[], text) to authenticated;

revoke all on function app.visible_student_ids(uuid[]) from public;
revoke all on function app.term_attendance_pcts(uuid[]) from public;
revoke all on function app.collection_briefs(uuid[]) from public;
revoke all on function app.my_class_names(uuid[]) from public;
grant execute on function app.visible_student_ids(uuid[]) to authenticated;
grant execute on function app.term_attendance_pcts(uuid[]) to authenticated;
grant execute on function app.collection_briefs(uuid[]) to authenticated;
grant execute on function app.my_class_names(uuid[]) to authenticated;

-- ============================================================================
-- No JIT compilation for this database
-- ----------------------------------------------------------------------------
-- Postgres compiles a query to machine code when its estimated cost passes
-- jit_above_cost. Row-level security makes the estimates of ordinary screen
-- queries look enormous (each policy function is costed as if it ran per row),
-- so small, fast queries were being compiled: 0.4 to 6 s of compiling for a
-- query that then ran in 20 ms (measured: the family home's children, the
-- student list). This app only runs short queries; JIT never pays for itself.
-- The in-browser database has no JIT, so this changes nothing there. Where the
-- migration may not alter the database (a hosted service), it says so and
-- carries on; set jit = off in the service's settings instead.
-- ============================================================================
do $$
begin
  execute format('alter database %I set jit = off', current_database());
exception when others then
  raise notice 'could not turn JIT off for this database (%); set jit = off in its settings', sqlerrm;
end $$;
-- And for the connection running the migrations, which has already started.
set jit = off;
