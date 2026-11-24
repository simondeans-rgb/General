-- ============================================================================
-- 0031 · Shows and events, run from the office (R-015)
-- ----------------------------------------------------------------------------
-- The office creates a show (or exam, competition, workshop), invites whole
-- classes, and families accept or decline. Rehearsals hang off the show and
-- appear in families' and teachers' diaries. Routines give the running order,
-- with a costume note and who dances in each. Chaperones are listed against
-- the event. Fees are billed in one step to every confirmed dancer's family,
-- once each.
-- ============================================================================

alter table studio_event add column parent_event_id uuid references studio_event(id) on delete cascade;
alter table event_participant add column invited_class_id uuid references class(id) on delete set null;
alter table invoice_item add column event_id uuid references studio_event(id) on delete set null;

create table event_routine (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  event_id    uuid not null references studio_event(id) on delete cascade,
  class_id    uuid references class(id) on delete set null,
  title       text not null,
  position    smallint not null default 0,
  costume     text,
  music       text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create table routine_dancer (
  routine_id  uuid not null references event_routine(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  primary key (routine_id, student_id)
);
create table event_chaperone (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  event_id    uuid not null references studio_event(id) on delete cascade,
  name        text not null,
  phone       text,
  role        text,
  checked     boolean not null default false,     -- DBS or equivalent seen by the office
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

alter table event_routine enable row level security;   alter table event_routine force row level security;
alter table routine_dancer enable row level security;  alter table routine_dancer force row level security;
alter table event_chaperone enable row level security; alter table event_chaperone force row level security;

create policy routine_admin on event_routine for all using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy routine_read on event_routine for select using (deleted_at is null and studio_id in (select app.studio_ids())
  and exists (select 1 from studio_event e where e.id = event_id and e.deleted_at is null and (e.status = 'published' or app.is_staff(e.studio_id))));
create policy dancer_admin on routine_dancer for all
  using (exists (select 1 from event_routine r where r.id = routine_id and app.is_admin(r.studio_id)))
  with check (exists (select 1 from event_routine r where r.id = routine_id and app.is_admin(r.studio_id)));
create policy dancer_read on routine_dancer for select
  using (student_id in (select app.guardian_student_ids()) or student_id = app.student_self_id()
         or exists (select 1 from event_routine r where r.id = routine_id and app.is_staff(r.studio_id)));
-- Chaperone phone numbers are for the office and the teachers on the day.
create policy chaperone_staff on event_chaperone for select using (deleted_at is null and app.is_staff(studio_id));
create policy chaperone_admin on event_chaperone for all using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));

grant select, insert, update, delete on event_routine, routine_dancer, event_chaperone to authenticated;
grant all on event_routine, routine_dancer, event_chaperone to service_role;

create or replace function app.stamp_event_child() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin select studio_id into new.studio_id from studio_event where id = new.event_id; return new; end $$;
create trigger routine_stamp before insert on event_routine for each row execute function app.stamp_event_child();
create trigger chaperone_stamp before insert on event_chaperone for each row execute function app.stamp_event_child();

-- Invite whole classes. Families are told; each child appears as "invited".
create or replace function app.invite_classes(p_event uuid, p_classes uuid[]) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare ev studio_event; n int := 0; r record; fam uuid;
begin
  select * into ev from studio_event where id = p_event and deleted_at is null;
  perform app.require_admin(ev.studio_id);
  for r in select distinct on (e.student_id) e.student_id, e.class_id, s.family_id, s.first_name
             from enrolment e join student s on s.id = e.student_id and s.deleted_at is null
            where e.class_id = any(p_classes) and e.status = 'active' and e.deleted_at is null
              and exists (select 1 from class c where c.id = e.class_id and c.studio_id = ev.studio_id) loop
    insert into event_participant (studio_id, event_id, student_id, status, invited_class_id, decided_by, decided_at)
    values (ev.studio_id, ev.id, r.student_id, 'invited', r.class_id, auth.uid(), now())
    on conflict (event_id, student_id) do nothing;
    if found then
      n := n + 1;
      perform app.notify_family(r.family_id, 'event_invite', r.first_name || ' is invited: ' || ev.title,
        to_char(ev.starts_at, 'FMDay DD Month') || coalesce(' · ' || ev.venue, ''), '/family/events');
    end if;
  end loop;
  return n;
end $$;

-- A family answers an invitation.
create or replace function app.answer_invitation(p_participant uuid, p_yes boolean) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare p event_participant;
begin
  select * into p from event_participant where id = p_participant and deleted_at is null;
  if p.id is null or p.student_id not in (select app.guardian_student_ids()) then
    raise exception 'FORBIDDEN: not your child' using errcode = 'insufficient_privilege';
  end if;
  if p.status <> 'invited' then raise exception 'INVALID: that invitation has already been answered' using errcode = 'check_violation'; end if;
  update event_participant set status = case when p_yes then 'confirmed' else 'declined' end::participant_status,
         decided_at = now(), updated_at = now() where id = p.id;
  return case when p_yes then 'confirmed' else 'declined' end;
end $$;

-- Bill every confirmed dancer's family the event fee, once.
create or replace function app.bill_event(p_event uuid, p_due date default null) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare ev studio_event; f record; inv uuid; n int := 0;
begin
  select * into ev from studio_event where id = p_event and deleted_at is null;
  perform app.require_admin(ev.studio_id);
  if coalesce(ev.cost_minor, 0) = 0 then raise exception 'INVALID: this event has no fee' using errcode = 'check_violation'; end if;
  for f in select s.family_id, jsonb_agg(jsonb_build_object('kind', case ev.kind when 'exam' then 'exam_fee' when 'show' then 'show_fee' else 'workshop' end,
                    'description', ev.title || ' — ' || s.first_name, 'quantity', 1, 'unit_minor', ev.cost_minor, 'student_id', s.id)) items,
                  array_agg(s.id) kids
             from event_participant p join student s on s.id = p.student_id
            where p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null
              and not exists (select 1 from invoice_item ii join invoice i on i.id = ii.invoice_id
                               where ii.event_id = ev.id and ii.student_id = s.id and ii.deleted_at is null
                                 and i.deleted_at is null and i.status not in ('void', 'refunded'))
            group by s.family_id loop
    inv := app.create_invoice(f.family_id, f.items, coalesce(p_due, (ev.starts_at::date - 7), current_date + 14), null, 0, true, null);
    update invoice_item set event_id = ev.id where invoice_id = inv;
    n := n + 1;
  end loop;
  return n;
end $$;

-- Rehearsals in the diary: a family sees those of shows their child is in;
-- a teacher those of shows their classes are invited to.
create or replace function app.my_rehearsals(p_from timestamptz, p_to timestamptz)
  returns table (id uuid, title text, show_title text, starts_at timestamptz, ends_at timestamptz, venue text, child text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select r.id, r.title, sh.title, r.starts_at, r.ends_at, coalesce(r.venue, sh.venue),
         (select string_agg(distinct s.first_name, ' & ') from event_participant p join student s on s.id = p.student_id
           where p.event_id = sh.id and p.status = 'confirmed' and p.deleted_at is null and s.id in (select app.guardian_student_ids()))
    from studio_event r join studio_event sh on sh.id = r.parent_event_id and sh.deleted_at is null
   where r.deleted_at is null and r.status = 'published' and r.starts_at >= p_from and r.starts_at < p_to
     and (exists (select 1 from event_participant p where p.event_id = sh.id and p.status = 'confirmed' and p.deleted_at is null
                   and (p.student_id in (select app.guardian_student_ids()) or p.student_id = app.student_self_id()))
       or exists (select 1 from event_participant p where p.event_id = sh.id and p.invited_class_id in (select app.teacher_class_ids()))
       or app.is_admin(r.studio_id))
   order by r.starts_at;
$$;

revoke all on function app.invite_classes(uuid, uuid[]), app.answer_invitation(uuid, boolean), app.bill_event(uuid, date),
  app.my_rehearsals(timestamptz, timestamptz) from public;
grant execute on function app.invite_classes(uuid, uuid[]), app.answer_invitation(uuid, boolean), app.bill_event(uuid, date),
  app.my_rehearsals(timestamptz, timestamptz) to authenticated;
