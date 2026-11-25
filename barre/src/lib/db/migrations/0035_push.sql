-- ============================================================================
-- 0035 · Phone notifications (R-017)
-- ----------------------------------------------------------------------------
-- A device that accepts notifications stores its push subscription here. When
-- a notification is written, each of the person's devices gets a push queued
-- in outbound_message (channel 'push'), sent by the worker with the
-- server's VAPID key. Push follows the in-app preference and quiet hours,
-- except same-day cancellations and urgent safeguarding notices.
-- ============================================================================
create table push_subscription (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references user_account(id) on delete cascade,
  endpoint   text not null unique check (endpoint ~ '^https://'),
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_ok_at timestamptz
);
alter table push_subscription enable row level security; alter table push_subscription force row level security;
create policy push_own on push_subscription for all using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, delete on push_subscription to authenticated;
grant all on push_subscription to service_role;

create or replace function app.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text, p_agent text default null) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if auth.uid() is null then raise exception 'FORBIDDEN: sign in first' using errcode = 'insufficient_privilege'; end if;
  insert into push_subscription (user_id, endpoint, p256dh, auth, user_agent)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth, left(p_agent, 200))
  on conflict (endpoint) do update set user_id = auth.uid(), p256dh = excluded.p256dh, auth = excluded.auth;
end $$;
grant execute on function app.save_push_subscription(text, text, text, text) to authenticated;

create or replace function app.on_notification_push() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare p push_subscription; urgent boolean; at timestamptz;
begin
  if current_setting('app.quiet', true) = 'on' then return null; end if;
  urgent := new.kind in ('schedule_change', 'safeguarding') and new.title ~* '^(cancelled|urgent)';
  at := case when urgent then now() else app.after_quiet(new.user_id, new.studio_id) end;
  for p in select * from push_subscription where user_id = new.user_id loop
    insert into outbound_message (studio_id, channel, to_address, subject, body, user_id, notification_id, not_before)
    values (new.studio_id, 'push', p.endpoint, new.title,
            json_build_object('title', new.title, 'body', coalesce(new.body, ''), 'href', coalesce(new.href, ''), 'tag', new.kind)::text,
            new.user_id, new.id, at);
  end loop;
  return null;
end $$;
create trigger notification_push after insert on notification for each row execute function app.on_notification_push();

alter table outbound_message drop constraint if exists outbound_message_channel_check;
alter table outbound_message add constraint outbound_message_channel_check check (channel in ('email', 'sms', 'push'));

-- The worker reads the keys for a push it is about to send.
create or replace function app.push_keys(p_endpoint text) returns table (p256dh text, auth text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select p256dh, auth from push_subscription where endpoint = p_endpoint;
$$;
revoke all on function app.push_keys(text) from public, authenticated, anon;
grant execute on function app.push_keys(text) to service_role;
