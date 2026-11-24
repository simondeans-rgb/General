-- ============================================================================
-- 0037 · School themes: Classic or Urban, then the school's own colours
-- ============================================================================
alter table studio add column theme text not null default 'classic' check (theme in ('classic', 'urban'));
alter table studio add column brand_secondary text check (brand_secondary is null or brand_secondary ~ '^#[0-9a-f]{6}$');

-- The public page shows the school in its own theme too.
drop function if exists app.public_school(text);
create function app.public_school(p_slug text)
  returns table (name text, brand_colour text, logo_url text, open boolean, theme text, brand_secondary text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.name, s.brand_colour, s.logo_url, app.studio_writable(s.id), s.theme, s.brand_secondary
    from studio s where s.slug = lower(p_slug) and s.deleted_at is null;
$$;
revoke all on function app.public_school(text) from public;
grant execute on function app.public_school(text) to authenticated, anon;

-- The switcher shows each school's look.
drop function if exists app.my_schools();
create function app.my_schools()
  returns table (studio_id uuid, name text, logo_url text, brand_colour text, roles text[], since timestamptz, theme text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id, s.name, s.logo_url, s.brand_colour, array_agg(distinct r order by r), min(x.since), s.theme
    from (select m.studio_id, m.role::text r, m.created_at since from membership m where m.user_id = auth.uid() and m.deleted_at is null
          union select g.studio_id, 'guardian', g.created_at from guardian g where g.user_id = auth.uid() and g.deleted_at is null
          union select st.studio_id, 'student', st.created_at from student st where st.user_id = auth.uid() and st.login_enabled and st.deleted_at is null) x
    join studio s on s.id = x.studio_id and s.deleted_at is null and app.studio_writable(s.id)
   group by s.id order by min(x.since), s.name;
$$;
grant execute on function app.my_schools() to authenticated;
