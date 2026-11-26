-- ============================================================================
-- 0043 · School imagery: a hero photo and a light logo (R-060)
-- ----------------------------------------------------------------------------
-- A hero photo for the public page and the family and student home screens,
-- and an optional light version of the logo for the dark Urban style. Both
-- are redrawn and compressed on the owner's device before they are stored,
-- exactly as the logo is (0022), so only pixels are kept.
-- ============================================================================
alter table studio add column hero_url text check (
  hero_url is null
  or (hero_url ~ '^data:image/(jpeg|webp);base64,[A-Za-z0-9+/=]+$' and length(hero_url) <= 700000)
  or hero_url ~ '^https://');
alter table studio add column logo_light_url text check (
  logo_light_url is null
  or (logo_light_url ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$' and length(logo_light_url) <= 400000)
  or logo_light_url ~ '^https://');

drop function if exists app.public_school(text);
create function app.public_school(p_slug text)
  returns table (name text, brand_colour text, logo_url text, open boolean, theme text, brand_secondary text,
                 privacy_notice_url text, hero_url text, logo_light_url text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.name, s.brand_colour, s.logo_url, app.studio_writable(s.id), s.theme, s.brand_secondary, s.privacy_notice_url,
         s.hero_url, s.logo_light_url
    from studio s where s.slug = lower(p_slug) and s.deleted_at is null;
$$;
revoke all on function app.public_school(text) from public;
grant execute on function app.public_school(text) to authenticated, anon;
