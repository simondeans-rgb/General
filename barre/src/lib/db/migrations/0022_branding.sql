-- ============================================================================
-- 0022 · A school's own brand
-- ----------------------------------------------------------------------------
-- Each school shows its own name, logo and colour to its people, "powered by
-- Swayvo". The owner sets them (studio_write already limits updates to
-- owners; a suspended school cannot change them).
--
-- The logo is stored as a raster image. Uploads are redrawn to PNG in the
-- browser before saving, so an SVG with script in it never reaches anyone —
-- and the constraint below refuses anything that is not a PNG, JPEG or WebP
-- data URL (the demo) or an https URL (file storage, in production).
-- ============================================================================

alter table studio add column brand_colour text
  check (brand_colour is null or brand_colour ~ '^#[0-9a-f]{6}$');

alter table studio add constraint studio_logo_safe check (
  logo_url is null
  or (logo_url ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$' and length(logo_url) <= 400000)
  or logo_url ~ '^https://');
