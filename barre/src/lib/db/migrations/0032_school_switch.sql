-- ============================================================================
-- 0032 · People in more than one school (R-031)
-- ----------------------------------------------------------------------------
-- A teacher who works at two schools, or a parent with children at two, uses
-- one login. The app sends which school they are looking at; every access
-- helper then narrows to it, so no screen can mix one school's data into
-- another's — however a query is written.
--
-- This is a filter, never a grant: app.in_scope() can only ever remove
-- schools from what a person may already see. Sending another school's id
-- simply shows nothing, because the person has no membership there.
-- In production the selection travels as the x-barre-studio request header.
-- ============================================================================

create or replace function app.selected_studio() returns uuid
  language plpgsql stable as $$
declare v text;
begin
  v := coalesce(auth.jwt() ->> 'studio',
                nullif(current_setting('request.headers', true), '')::json ->> 'x-barre-studio');
  if v is null or v = '' then return null; end if;
  return v::uuid;
exception when others then return null;
end $$;

create or replace function app.in_scope(p_studio uuid) returns boolean
  language sql stable as $$ select app.selected_studio() is null or app.selected_studio() = p_studio $$;

create or replace function app.memberships()
  returns table (studio_id uuid, role app_role)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select m.studio_id, m.role
    from membership m
   where m.user_id = auth.uid() and m.deleted_at is null and app.studio_writable(m.studio_id) and app.in_scope(m.studio_id)
  union
  select app.support_studio_id(), 'admin'::app_role
   where app.support_studio_id() is not null
$$;

create or replace function app.guardian_family_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select g.family_id from guardian g
   where g.user_id = auth.uid() and g.deleted_at is null and app.studio_writable(g.studio_id) and app.in_scope(g.studio_id)
$$;

create or replace function app.teacher_class_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select c.id from class c
    join staff_member s on s.id in (c.teacher_id, c.assistant_id)
   where s.user_id = auth.uid() and s.deleted_at is null and c.deleted_at is null
     and app.studio_writable(c.studio_id) and app.in_scope(c.studio_id)
  union
  select cs.class_id from class_session cs
    join staff_member s on s.id = cs.teacher_id
   where s.user_id = auth.uid() and s.deleted_at is null and cs.deleted_at is null
     and cs.status <> 'cancelled'
     and cs.starts_at between now() - interval '2 days' and now() + interval '14 days'
     and app.studio_writable(cs.studio_id) and app.in_scope(cs.studio_id)
$$;

create or replace function app.student_self_id() returns uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id from student s
   where s.user_id = auth.uid() and s.login_enabled and s.deleted_at is null
     and app.studio_writable(s.studio_id) and app.in_scope(s.studio_id)
   limit 1
$$;

-- Every school a person belongs to, whatever is selected: for the switcher.
create or replace function app.my_schools()
  returns table (studio_id uuid, name text, logo_url text, brand_colour text, roles text[], since timestamptz)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id, s.name, s.logo_url, s.brand_colour, array_agg(distinct r order by r), min(x.since)
    from (select m.studio_id, m.role::text r, m.created_at since from membership m where m.user_id = auth.uid() and m.deleted_at is null
          union select g.studio_id, 'guardian', g.created_at from guardian g where g.user_id = auth.uid() and g.deleted_at is null
          union select st.studio_id, 'student', st.created_at from student st where st.user_id = auth.uid() and st.login_enabled and st.deleted_at is null) x
    join studio s on s.id = x.studio_id and s.deleted_at is null and app.studio_writable(s.id)
   group by s.id order by min(x.since), s.name;
$$;
grant execute on function app.my_schools(), app.selected_studio(), app.in_scope(uuid) to authenticated;
