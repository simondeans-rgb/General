-- ============================================================================
-- 0018 · Automations: the messages a studio sends on a schedule
-- ----------------------------------------------------------------------------
-- A trial confirmation, a 48-hour reminder, a same-day reminder, a follow-up
-- after the class, a note when a trial was missed, a waiting-list offer. Each
-- is a RULE (which event, which template, on or off) evaluated by ONE runner.
--
-- Adding a new automation is adding an `event` value and one branch in
-- app.automation_candidates — the runner, idempotency, rendering, history
-- and the screen do not change.
--
-- The runner is idempotent: automation_run is unique on (rule, subject), so
-- running it every five minutes from a scheduler, or pressing "Run now" twice,
-- never sends the same family the same message twice.
-- ============================================================================

create table automation_rule (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  event        text not null check (event in (
                 'trial_booked', 'trial_reminder_48h', 'trial_reminder_same_day',
                 'trial_attended', 'trial_missed', 'waitlist_offer')),
  template_id  uuid references communication_template(id) on delete set null,
  enabled      boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references user_account(id) on delete set null,
  deleted_at   timestamptz,
  unique (studio_id, event)
);

create table automation_run (
  id               uuid primary key default gen_random_uuid(),
  studio_id        uuid not null references studio(id) on delete cascade,
  rule_id          uuid not null references automation_rule(id) on delete cascade,
  subject_id       uuid not null,            -- the trial or waiting-list entry
  family_id        uuid references family(id) on delete set null,
  communication_id uuid references communication(id) on delete set null,
  ran_at           timestamptz not null default now(),
  unique (rule_id, subject_id)
);

create index automation_run_studio on automation_run (studio_id, ran_at desc);

-- Messages to people who have no account yet (a prospect booking a first
-- trial) can only go by email or text. They wait here for a delivery
-- provider. Nothing in this build sends them; the screen says so.
create table outbound_message (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  channel      comm_channel not null check (channel in ('email', 'sms')),
  to_name      text,
  to_address   text not null,
  subject      text,
  body         text not null,
  enquiry_id   uuid references enquiry(id) on delete set null,
  status       text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'cancelled')),
  provider_ref text,
  error        text,
  created_at   timestamptz not null default now(),
  sent_at      timestamptz
);
create index outbound_queued on outbound_message (studio_id, created_at) where status = 'queued';
alter table outbound_message enable row level security;
alter table outbound_message force row level security;
create policy outbound_read on outbound_message for select using (app.is_admin(studio_id));
grant select on outbound_message to authenticated;
grant all on outbound_message to service_role;

alter table automation_run add column outbound_id uuid references outbound_message(id) on delete set null;

alter table automation_rule enable row level security;
alter table automation_rule force row level security;
alter table automation_run  enable row level security;
alter table automation_run  force row level security;

create policy automation_rule_read on automation_rule for select
  using (deleted_at is null and app.is_admin(studio_id));
create policy automation_rule_write on automation_rule for update
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy automation_run_read on automation_run for select
  using (app.is_admin(studio_id));

grant select, update on automation_rule to authenticated;
grant select on automation_run to authenticated;
grant all on automation_rule, automation_run to service_role;

create trigger automation_rule_touch before update on automation_rule
  for each row execute function app.touch_updated_at();

-- ── What each rule would act on right now ──────────────────────────────────
-- One row per (rule, subject) that is due and has not been sent.
create or replace function app.automation_candidates(p_studio uuid, p_now timestamptz default now())
  returns table (rule_id uuid, event text, subject_id uuid, family_id uuid, student_id uuid,
                 class_id uuid, starts_at timestamptz, expires_at timestamptz,
                 contact_name text, contact_email text, child_name text, enquiry_id uuid)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with tz as (select timezone from studio where id = p_studio),
  trials as (
    -- A trial is either for a child already on the books (in-app) or for a
    -- prospect known only through their enquiry (email). Neither: skipped.
    select t.id, t.status, t.attended_at, t.created_at, t.class_id, t.student_id,
           s.family_id, cs.starts_at, e.contact_name, e.contact_email, e.child_name, e.id as enquiry_id
      from trial t
      left join student s on s.id = t.student_id and s.deleted_at is null
      left join enquiry e on e.id = t.enquiry_id and e.deleted_at is null
      left join class_session cs on cs.id = t.session_id
     where t.studio_id = p_studio and t.deleted_at is null
       and (s.family_id is not null or e.contact_email is not null)
  )
  select r.id, r.event, x.subject_id, x.family_id, x.student_id, x.class_id, x.starts_at, x.expires_at,
         x.contact_name, x.contact_email, x.child_name, x.enquiry_id
    from automation_rule r
    cross join lateral (
      -- Confirmation: booked, and the class has not happened yet.
      select t.id as subject_id, t.family_id, t.student_id, t.class_id, t.starts_at, null::timestamptz as expires_at,
             t.contact_name, t.contact_email, t.child_name, t.enquiry_id
        from trials t
       where r.event = 'trial_booked' and t.status = 'booked' and t.starts_at > p_now
      union all
      -- 48 hours before, but not if the booking was made inside that window.
      select t.id, t.family_id, t.student_id, t.class_id, t.starts_at, null,
             t.contact_name, t.contact_email, t.child_name, t.enquiry_id
        from trials t
       where r.event = 'trial_reminder_48h' and t.status = 'booked'
         and p_now >= t.starts_at - interval '48 hours' and p_now < t.starts_at - interval '12 hours'
         and t.created_at < t.starts_at - interval '48 hours'
      union all
      -- The morning of the class.
      select t.id, t.family_id, t.student_id, t.class_id, t.starts_at, null,
             t.contact_name, t.contact_email, t.child_name, t.enquiry_id
        from trials t, tz
       where r.event = 'trial_reminder_same_day' and t.status = 'booked'
         and (t.starts_at at time zone tz.timezone)::date = (p_now at time zone tz.timezone)::date
         and p_now < t.starts_at
      union all
      -- After the class, while it is still fresh — not weeks later.
      select t.id, t.family_id, t.student_id, t.class_id, t.starts_at, null,
             t.contact_name, t.contact_email, t.child_name, t.enquiry_id
        from trials t
       where r.event = 'trial_attended' and t.status = 'attended'
         and coalesce(t.attended_at, t.starts_at) > p_now - interval '7 days'
      union all
      select t.id, t.family_id, t.student_id, t.class_id, t.starts_at, null,
             t.contact_name, t.contact_email, t.child_name, t.enquiry_id
        from trials t
       where r.event = 'trial_missed' and t.status = 'missed'
         and t.starts_at > p_now - interval '7 days'
      union all
      select w.id, s.family_id, w.student_id, w.class_id, null, w.offer_expires_at,
             null, null, null, null
        from waitlist_entry w join student s on s.id = w.student_id and s.deleted_at is null
       where r.event = 'waitlist_offer' and w.studio_id = p_studio and w.deleted_at is null
         and w.status = 'offered' and (w.offer_expires_at is null or w.offer_expires_at > p_now)
    ) x
   where r.studio_id = p_studio and r.enabled and r.deleted_at is null
     and r.template_id is not null
     and not exists (select 1 from automation_run ar where ar.rule_id = r.id and ar.subject_id = x.subject_id)
$$;

-- Fill a template for one family. Unknown placeholders are left visible
-- rather than silently blanked, so a broken template is noticed.
create or replace function app.render_template(
  p_text text, p_family uuid, p_student uuid, p_class uuid,
  p_starts timestamptz, p_expires timestamptz, p_tz text,
  p_guardian text default null, p_child text default null)
  returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select replace(replace(replace(replace(replace(replace(coalesce(p_text, ''),
    '{{guardian_name}}', coalesce((select split_part(full_name, ' ', 1) from guardian
                                    where family_id = p_family and deleted_at is null
                                    order by is_primary desc limit 1),
                                  split_part(p_guardian, ' ', 1), 'there')),
    '{{child_name}}',   coalesce((select first_name from student where id = p_student),
                                 split_part(p_child, ' ', 1), 'your child')),
    '{{class_name}}',   coalesce((select name from class where id = p_class), 'class')),
    '{{session_date}}', coalesce(to_char(p_starts at time zone p_tz, 'FMDay FMDD FMMonth'), '')),
    '{{session_time}}', coalesce(to_char(p_starts at time zone p_tz, 'HH24:MI'), '')),
    '{{expires_at}}',   coalesce(to_char(p_expires at time zone p_tz, 'FMDay FMDD FMMonth'), 'the end of the week'))
$$;

-- ── Expiring offers, and passing the place on ──────────────────────────────
create or replace function app.expire_waitlist_offers(p_studio uuid, p_now timestamptz default now())
  returns integer
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare e record; n integer := 0; next_id uuid;
begin
  for e in select id, class_id from waitlist_entry
            where studio_id = p_studio and status = 'offered' and deleted_at is null
              and offer_expires_at is not null and offer_expires_at <= p_now
  loop
    update waitlist_entry set status = 'expired', responded_at = p_now where id = e.id;
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (p_studio, auth.uid(), 'expire', 'waitlist_entry', e.id, 'offer lapsed unanswered');
    n := n + 1;
    -- The place is still free: offer it to whoever is next, if the class has room.
    if app.class_enrolled_count(e.class_id) < (select capacity from class where id = e.class_id) then
      select id into next_id from waitlist_entry
       where class_id = e.class_id and status = 'waiting' and deleted_at is null
       order by position limit 1;
      if next_id is not null then perform app.offer_waitlist_place(next_id); end if;
    end if;
  end loop;
  return n;
end $$;

-- ── The runner ─────────────────────────────────────────────────────────────
-- Called by a scheduler (as service_role) or by the office ("Run now").
create or replace function app.run_automations(p_studio uuid, p_now timestamptz default now())
  returns integer
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c record; tpl record; tz text; cid uuid; oid uuid; sent integer := 0;
        caller text := coalesce(current_setting('request.jwt.claims', true), '');
begin
  if current_setting('role', true) is distinct from 'service_role' and not app.is_admin(p_studio) then
    raise exception 'FORBIDDEN: only the office runs automations' using errcode = 'insufficient_privilege';
  end if;
  select timezone into tz from studio where id = p_studio;

  perform app.expire_waitlist_offers(p_studio, p_now);

  for c in select * from app.automation_candidates(p_studio, p_now) loop
    select t.subject, t.body into tpl
      from automation_rule r join communication_template t on t.id = r.template_id and t.deleted_at is null
     where r.id = c.rule_id;
    continue when tpl.body is null;

    if c.family_id is not null then
      -- Sent by the studio, not by whoever pressed Run: drop the caller's
      -- identity for this one insert. (Clearing claims can only ever take
      -- privileges away, so this is not something a user could abuse.)
      perform set_config('request.jwt.claims', '', true);
      insert into communication (studio_id, kind, channel, family_id, subject, body, inbound)
      values (p_studio, 'direct', 'in_app', c.family_id,
              app.render_template(tpl.subject, c.family_id, c.student_id, c.class_id, c.starts_at, c.expires_at, tz),
              app.render_template(tpl.body,    c.family_id, c.student_id, c.class_id, c.starts_at, c.expires_at, tz),
              false)
      returning id into cid;
      perform set_config('request.jwt.claims', caller, true);
      insert into automation_run (studio_id, rule_id, subject_id, family_id, communication_id, ran_at)
      values (p_studio, c.rule_id, c.subject_id, c.family_id, cid, p_now)
      on conflict (rule_id, subject_id) do nothing;
    else
      insert into outbound_message (studio_id, channel, to_name, to_address, subject, body, enquiry_id)
      values (p_studio, 'email', c.contact_name, c.contact_email,
              app.render_template(tpl.subject, null, null, c.class_id, c.starts_at, c.expires_at, tz, c.contact_name, c.child_name),
              app.render_template(tpl.body,    null, null, c.class_id, c.starts_at, c.expires_at, tz, c.contact_name, c.child_name),
              c.enquiry_id)
      returning id into oid;
      insert into automation_run (studio_id, rule_id, subject_id, outbound_id, ran_at)
      values (p_studio, c.rule_id, c.subject_id, oid, p_now)
      on conflict (rule_id, subject_id) do nothing;
    end if;
    sent := sent + 1;
  end loop;
  return sent;
end $$;

revoke execute on function app.automation_candidates(uuid, timestamptz),
                           app.render_template(text, uuid, uuid, uuid, timestamptz, timestamptz, text, text, text),
                           app.expire_waitlist_offers(uuid, timestamptz)
  from public, anon;
revoke execute on function app.render_template(text, uuid, uuid, uuid, timestamptz, timestamptz, text, text, text),
                           app.expire_waitlist_offers(uuid, timestamptz)
  from authenticated;
-- Candidates are readable by the office so the screen can say what is due;
-- the function itself checks nothing, so it only answers for admins.
create or replace function app.automation_due(p_studio uuid)
  returns table (rule_id uuid, due integer)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select rule_id, count(*)::int from app.automation_candidates(p_studio)
   where app.is_admin(p_studio) group by rule_id
$$;
revoke execute on function app.automation_candidates(uuid, timestamptz) from authenticated;
grant execute on function app.automation_due(uuid), app.run_automations(uuid, timestamptz) to authenticated;
grant execute on function app.run_automations(uuid, timestamptz) to service_role;
