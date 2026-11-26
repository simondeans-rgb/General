-- ============================================================================
-- 0034 · Delivering email and text (R-003), and the server's clock (R-002)
-- ----------------------------------------------------------------------------
-- The queue was already there (0018). This adds what a delivery worker needs:
--   · claiming a batch safely, so two workers never send the same message
--   · retries with back-off, and a final 'failed' after five attempts
--   · quiet hours: a message for someone in their quiet hours waits
--   · email copies of notifications, for people who asked for email in their
--     preferences (0028)
-- and one function the hosted scheduler calls every few minutes.
--
-- The worker itself (scripts/deliver.mts) talks to the provider. Which
-- provider is configuration: Postmark, Resend or Twilio, chosen by
-- environment variables, or 'log' to print instead of sending.
-- ============================================================================

alter table outbound_message add column user_id uuid references user_account(id) on delete set null;
alter table outbound_message add column attempts smallint not null default 0;
alter table outbound_message add column not_before timestamptz not null default now();
alter table outbound_message add column claimed_until timestamptz;
alter table outbound_message add column notification_id uuid references notification(id) on delete set null;
create index outbound_due on outbound_message (not_before) where status = 'queued';

-- When a user's quiet hours end, in the school's time zone.
create or replace function app.after_quiet(p_user uuid, p_studio uuid, p_at timestamptz default now()) returns timestamptz
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare u user_account; tz text; local_t time; local_d date;
begin
  select * into u from user_account where id = p_user;
  if u.id is null or u.quiet_from is null or u.quiet_to is null then return p_at; end if;
  select coalesce(timezone, 'Europe/London') into tz from studio where id = p_studio;
  local_t := (p_at at time zone tz)::time;
  local_d := (p_at at time zone tz)::date;
  if u.quiet_from < u.quiet_to then                         -- e.g. 13:00–14:00
    if local_t >= u.quiet_from and local_t < u.quiet_to then return (local_d + u.quiet_to) at time zone tz; end if;
  else                                                       -- e.g. 21:00–07:00, across midnight
    if local_t >= u.quiet_from then return (local_d + 1 + u.quiet_to) at time zone tz; end if;
    if local_t < u.quiet_to then return (local_d + u.quiet_to) at time zone tz; end if;
  end if;
  return p_at;
end $$;

-- Email copies of notifications, for those who asked. Safety and schedule
-- notices always go (they cannot be switched off), and ignore quiet hours
-- only when they are about a class today.
create or replace function app.on_notification_email() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare u user_account; urgent boolean;
begin
  if current_setting('app.quiet', true) = 'on' then return null; end if;
  select * into u from user_account where id = new.user_id and deleted_at is null;
  if u.id is null or coalesce(u.email, '') !~ '@' then return null; end if;
  if not app.wants(new.user_id, new.kind, 'email') then return null; end if;
  urgent := new.kind in ('schedule_change', 'safeguarding') and new.title ~* '^(cancelled|urgent)';
  insert into outbound_message (studio_id, channel, to_name, to_address, subject, body, user_id, notification_id, not_before)
  values (new.studio_id, 'email', u.full_name, u.email, new.title,
          coalesce(new.body, '') || E'\n\nOpen Swayvo to see more.', u.id, new.id,
          case when urgent then now() else app.after_quiet(u.id, new.studio_id) end);
  return null;
end $$;
create trigger notification_email after insert on notification for each row execute function app.on_notification_email();

-- The worker claims a batch: due, queued, not claimed by someone else.
create or replace function app.claim_outbound(p_limit int default 50, p_lease interval default '5 minutes')
  returns setof outbound_message
  language sql security definer set search_path = public, app, pg_temp as $$
  update outbound_message o set claimed_until = now() + p_lease, attempts = o.attempts + 1
   where o.id in (select id from outbound_message
                   where status = 'queued' and not_before <= now() and (claimed_until is null or claimed_until < now())
                   order by not_before limit p_limit for update skip locked)
  returning o.*;
$$;

create or replace function app.outbound_result(p_id uuid, p_ok boolean, p_ref text default null, p_error text default null) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare m outbound_message;
begin
  select * into m from outbound_message where id = p_id;
  if p_ok then
    update outbound_message set status = 'sent', sent_at = now(), provider_ref = p_ref, error = null, claimed_until = null where id = p_id;
  elsif m.attempts >= 5 then
    update outbound_message set status = 'failed', error = p_error, claimed_until = null where id = p_id;
  else
    -- 1, 4, 9, 16 minutes.
    update outbound_message set error = p_error, claimed_until = null,
           not_before = now() + make_interval(mins => m.attempts * m.attempts) where id = p_id;
  end if;
end $$;

-- Everything time-driven, for every school, in one call. The hosted
-- scheduler runs it every five minutes; it is safe to run more often.
create or replace function app.tick() returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s record; auto int := 0; released int := 0; checks int := 0;
begin
  for s in select id from studio where deleted_at is null and app.studio_writable(id) loop
    auto := auto + coalesce(app.run_automations(s.id), 0);
    released := released + app.release_scheduled(s.id);
    checks := checks + app.remind_staff_checks(s.id);
    perform app.award_event_milestones(s.id);
  end loop;
  return jsonb_build_object('automations', auto, 'released', released, 'staff_checks', checks, 'at', now());
end $$;

revoke all on function app.after_quiet(uuid, uuid, timestamptz), app.claim_outbound(int, interval),
  app.outbound_result(uuid, boolean, text, text), app.tick() from public, authenticated, anon;
grant execute on function app.claim_outbound(int, interval), app.outbound_result(uuid, boolean, text, text), app.tick() to service_role;
