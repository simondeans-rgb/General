-- ============================================================================
-- 0051 · Joining up the panel-review fixes (0044–0050)
-- ----------------------------------------------------------------------------
-- The fixes were built in parallel. This migration connects the pieces that
-- each stream deliberately left to whoever brought them together:
--   · the scheduled tick now sends "invoice due in 3 days" notices (0045) and
--     expires waiting-list offers that have run out (0044), so the next family
--     is offered the place without anyone opening the app.
-- ============================================================================

create or replace function app.tick() returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s record; auto int := 0; released int := 0; checks int := 0; holds int; digests int;
        due int := 0; offers int := 0; n int;
begin
  holds := app.expire_held_drop_ins();
  for s in select id from studio where deleted_at is null and app.studio_writable(id) loop
    auto := auto + coalesce(app.run_automations(s.id), 0);
    released := released + app.release_scheduled(s.id);
    checks := checks + app.remind_staff_checks(s.id);
    perform app.award_event_milestones(s.id);
    -- Waiting-list offers past their expiry go to the next family (UR-19).
    begin
      n := app.expire_waitlist_offers(s.id);
      offers := offers + coalesce(n, 0);
    exception when others then null;   -- one school's data must not stop the rest
    end;
    due := due + coalesce(app.notify_invoices_due(s.id), 0);
  end loop;
  digests := app.send_digests();
  return jsonb_build_object('automations', auto, 'released', released, 'staff_checks', checks,
                            'holds_lapsed', holds, 'digests', digests, 'invoices_due', due,
                            'offers_expired', offers, 'at', now());
end $$;
