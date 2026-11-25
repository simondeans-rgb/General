-- ============================================================================
-- 0036 · Pilot schools and activation (R-040)
-- ----------------------------------------------------------------------------
-- What the platform team needs to run a pilot: which schools are in it, and
-- how far each has got with the things that predict a school staying —
-- set up, families in, registers taken weekly, parents signed in, invoices
-- sent, messages flowing. Counts only, never names: a school's people are the
-- school's data (0019).
-- ============================================================================

alter table studio add column pilot_cohort text;
alter table studio add column pilot_started_on date;
alter table studio add column pilot_notes text;

create or replace function app.platform_activation()
  returns table (id uuid, name text, status text, pilot_cohort text, pilot_started_on date, days_in int,
                 classes int, families int, parents_signed_in_pct int, registers_7d int, registers_28d int,
                 invoices_sent int, messages_28d int, feedback_shared_28d int,
                 setup_done boolean, families_in boolean, registers_weekly boolean, parents_on boolean,
                 billing_on boolean, talking boolean, score int, stuck_on text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  perform app.require_platform_admin();
  return query
  with base as (
    select s.id, s.name, s.status, s.pilot_cohort, s.pilot_started_on,
           (current_date - coalesce(s.pilot_started_on, s.created_at::date))::int days_in,
           (select count(*)::int from class c where c.studio_id = s.id and c.deleted_at is null) classes,
           (select count(*)::int from family f where f.studio_id = s.id and f.deleted_at is null and not f.is_prospect) families,
           (select round(100.0 * count(*) filter (where exists (select 1 from guardian g where g.family_id = f.id and g.user_id is not null and g.deleted_at is null))
                    / nullif(count(*), 0))::int
              from family f where f.studio_id = s.id and f.deleted_at is null and not f.is_prospect) parents_pct,
           (select count(*)::int from class_session cs where cs.studio_id = s.id and cs.register_closed_at > now() - interval '7 days') reg7,
           (select count(*)::int from class_session cs where cs.studio_id = s.id and cs.register_closed_at > now() - interval '28 days') reg28,
           (select count(*)::int from invoice i where i.studio_id = s.id and i.deleted_at is null and i.status <> 'draft') invoices,
           (select count(*)::int from communication c where c.studio_id = s.id and c.deleted_at is null and c.sent_at > now() - interval '28 days') msgs,
           (select count(*)::int from feedback_note f where f.studio_id = s.id and f.shared_at > now() - interval '28 days') fb
      from studio s where s.deleted_at is null
  ), flags as (
    select b.*, b.classes >= 3 setup, b.families >= 10 fam, b.reg7 >= 1 and b.reg28 >= 4 reg,
           coalesce(b.parents_pct, 0) >= 50 parents, b.invoices >= 1 billing, b.msgs >= 4 talk
      from base b
  )
  select f.id, f.name, f.status, f.pilot_cohort, f.pilot_started_on, f.days_in, f.classes, f.families, f.parents_pct,
         f.reg7, f.reg28, f.invoices, f.msgs, f.fb, f.setup, f.fam, f.reg, f.parents, f.billing, f.talk,
         (f.setup::int + f.fam::int + f.reg::int + f.parents::int + f.billing::int + f.talk::int) * 100 / 6,
         case when not f.setup then 'Setting up classes' when not f.fam then 'Bringing families in'
              when not f.reg then 'Taking registers each week' when not f.parents then 'Getting parents signed in'
              when not f.billing then 'Sending invoices' when not f.talk then 'Messaging families' end
    from flags f
   order by f.pilot_cohort nulls last, f.name;
end $$;

create or replace function app.platform_set_pilot(p_studio uuid, p_cohort text, p_started date, p_notes text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  perform app.require_platform_admin();
  update studio set pilot_cohort = nullif(btrim(p_cohort), ''), pilot_started_on = case when nullif(btrim(p_cohort), '') is null then null else coalesce(p_started, current_date) end,
         pilot_notes = nullif(btrim(p_notes), ''), updated_at = now() where id = p_studio;
end $$;

revoke all on function app.platform_activation(), app.platform_set_pilot(uuid, text, date, text) from public;
grant execute on function app.platform_activation(), app.platform_set_pilot(uuid, text, date, text) to authenticated;
