-- ============================================================================
-- 0070 · Reminders for registers left incomplete
-- ----------------------------------------------------------------------------
-- A register is complete when it has been closed (app.close_register refuses
-- while anyone is unmarked, so "closed" means every child is accounted for).
--
--   1. The morning after the class (default 08:00, school time), if the
--      register is still not complete, the teacher who took the class (the
--      cover teacher when there was one) is reminded.
--   2. If it is still not complete a set time after that (default 24 hours,
--      i.e. the next morning), the owner and administrators are told it is
--      incomplete and that the teacher was reminded.
--
-- Each step happens once per session (register_reminder). Cancelled classes
-- never count. Only classes in the last 14 days are looked at, so turning the
-- feature on does not flood anyone with old registers. Runs from app.tick.
-- ============================================================================

alter table studio
  add column if not exists register_reminders boolean not null default true,
  add column if not exists register_reminder_hour smallint not null default 8
    check (register_reminder_hour between 0 and 23),
  add column if not exists register_escalate_hours smallint not null default 24
    check (register_escalate_hours between 2 and 96);

create table if not exists register_reminder (
  session_id          uuid primary key references class_session(id) on delete cascade,
  studio_id           uuid not null references studio(id) on delete cascade,
  teacher_user_id     uuid references user_account(id) on delete set null,
  teacher_reminded_at timestamptz,
  escalated_at        timestamptz
);
alter table register_reminder enable row level security;
alter table register_reminder force row level security;
create policy register_reminder_office on register_reminder for select
  using (app.is_admin(studio_id));
grant select on register_reminder to authenticated;
grant all on register_reminder to service_role;

-- Sessions whose register is still incomplete, with when each step falls due.
create or replace function app.incomplete_registers(p_studio uuid, p_now timestamptz default now())
  returns table (session_id uuid, class_name text, starts_at timestamptz, teacher_user_id uuid, teacher_name text,
                 remind_at timestamptz, escalate_at timestamptz, teacher_reminded_at timestamptz, escalated_at timestamptz)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select cs.id, c.name, cs.starts_at,
         sm.user_id, sm.display_name,
         (((cs.starts_at at time zone st.timezone)::date + 1) + make_time(st.register_reminder_hour, 0, 0)) at time zone st.timezone,
         (((cs.starts_at at time zone st.timezone)::date + 1) + make_time(st.register_reminder_hour, 0, 0)) at time zone st.timezone
           + make_interval(hours => st.register_escalate_hours),
         rr.teacher_reminded_at, rr.escalated_at
    from class_session cs
    join class c on c.id = cs.class_id and c.deleted_at is null
    join studio st on st.id = cs.studio_id
    left join staff_member sm on sm.id = coalesce(cs.teacher_id, c.teacher_id)
    left join register_reminder rr on rr.session_id = cs.id
   where cs.studio_id = p_studio and cs.deleted_at is null and cs.status <> 'cancelled'
     and cs.register_closed_at is null
     and cs.ends_at < p_now and cs.starts_at > p_now - interval '14 days';
$$;

-- One pass for one school: remind teachers, then tell the office. Returns how many notices went out.
create or replace function app.register_reminders(p_studio uuid, p_now timestamptz default now()) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare st studio; r record; n int := 0; day text;
begin
  select * into st from studio where id = p_studio and deleted_at is null;
  if st.id is null or not st.register_reminders then return 0; end if;
  for r in select * from app.incomplete_registers(p_studio, p_now) loop
    day := to_char(r.starts_at at time zone st.timezone, 'FMDy FMDD FMMon');
    -- Step 1: the teacher, the morning after.
    if r.teacher_reminded_at is null and p_now >= r.remind_at and r.teacher_user_id is not null then
      perform app.notify_user(p_studio, r.teacher_user_id, 'register_overdue',
        'Register not completed: ' || r.class_name || ', ' || day,
        'Please mark everyone and close the register.', '/teach/register/?session=' || r.session_id);
      insert into register_reminder (session_id, studio_id, teacher_user_id, teacher_reminded_at)
      values (r.session_id, p_studio, r.teacher_user_id, p_now)
      on conflict (session_id) do update set teacher_reminded_at = excluded.teacher_reminded_at,
                                             teacher_user_id = excluded.teacher_user_id;
      n := n + 1;
    -- Step 2: the office, once the teacher has had the set time.
    elsif r.escalated_at is null and p_now >= r.escalate_at
          and (r.teacher_reminded_at is not null or r.teacher_user_id is null) then
      perform app.notify_admins(p_studio, 'register_overdue',
        'Incomplete register: ' || r.class_name || ', ' || day,
        coalesce(r.teacher_name, 'No teacher') ||
          case when r.teacher_reminded_at is not null then ' was reminded ' || to_char(r.teacher_reminded_at at time zone st.timezone, 'FMDy FMDD FMMon "at" HH24:MI') || '.'
               else ' was not set for this class.' end,
        '/teach/register/?session=' || r.session_id);
      insert into register_reminder (session_id, studio_id, teacher_user_id, escalated_at)
      values (r.session_id, p_studio, r.teacher_user_id, p_now)
      on conflict (session_id) do update set escalated_at = excluded.escalated_at;
      n := n + 1;
    end if;
  end loop;
  return n;
end $$;

-- What the owner's Today shows: registers the office has been told about, still open.
create or replace function app.overdue_registers(p_studio uuid)
  returns table (session_id uuid, class_name text, starts_at timestamptz, teacher_name text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select i.session_id, i.class_name, i.starts_at, i.teacher_name
    from app.incomplete_registers(p_studio) i
   where app.is_admin(p_studio) and i.escalated_at is not null
   order by i.starts_at;
$$;

revoke all on function app.incomplete_registers(uuid, timestamptz) from public, authenticated, anon;
revoke all on function app.register_reminders(uuid, timestamptz) from public, authenticated, anon;
grant execute on function app.incomplete_registers(uuid, timestamptz), app.register_reminders(uuid, timestamptz) to service_role;
revoke all on function app.overdue_registers(uuid) from public;
grant execute on function app.overdue_registers(uuid) to authenticated;

-- The scheduled tick (as in 0058) also sends register reminders.
create or replace function app.tick() returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s record; auto int := 0; released int := 0; checks int := 0; holds int; digests int;
        due int := 0; offers int := 0; n int; moves int := 0; ret int := 0; regs int := 0;
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
    -- Planned class moves whose day has come (UR-52).
    begin
      moves := moves + coalesce(app.complete_class_moves(s.id), 0);
    exception when others then null;
    end;
    due := due + coalesce(app.notify_invoices_due(s.id), 0);
    -- Monthly retention preview, and the opt-in automatic apply.
    begin
      if app.retention_tick(s.id) is not null then ret := ret + 1; end if;
    exception when others then null;
    end;
    -- Registers left incomplete: the teacher, then the office (0070).
    begin
      regs := regs + coalesce(app.register_reminders(s.id), 0);
    exception when others then null;
    end;
  end loop;
  digests := app.send_digests();
  return jsonb_build_object('automations', auto, 'released', released, 'staff_checks', checks,
                            'holds_lapsed', holds, 'digests', digests, 'invoices_due', due,
                            'offers_expired', offers, 'moves', moves, 'retention', ret,
                            'register_reminders', regs, 'at', now());
end $$;
