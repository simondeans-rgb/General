-- 0060 · Family screens, round 4 (round-2 panel review: U7, U4, U8, U12, F5, F8)
--
-- 1. Message privacy holds for older and imported messages too: a guardian's
--    own message is private to them however it got into the table (insert,
--    a later update, an import, or before 0046 existed). Replies inherit.
-- 2. Invitations know when the family is one adult on their own (U12).
-- 3. Booking references, add-to-calendar and a manage-booking link for trials
--    and drop-ins (F5): public confirmation and the family's own screens.
-- 4. "Your share" for split-billed guardians, and Coming up that counts only
--    this guardian's share and never shows the other payer's invoice numbers.
-- 5. Home's "Coming up" strip per child (U7) and clashes in a child's diary (U8).

-- ════════════════════════════════════════════════════════════════════════════
-- 1 · Message privacy, applied consistently
-- ════════════════════════════════════════════════════════════════════════════
-- The insert trigger (0046) only sees a row as it is inserted. Rows whose
-- sender or direction is filled in afterwards (the demo seed, imports, an
-- office correction) or that predate 0046 stayed shared with co-parents. The
-- same rule now runs on update, and once over everything already stored.
-- It only ever narrows: a filled-in private_to is never cleared here.
create or replace function app.message_private_to(p_kind text, p_family uuid, p_inbound boolean, p_sent_by uuid,
                                                  p_reply_to uuid, p_request uuid)
  returns uuid
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare v uuid;
begin
  if p_kind <> 'direct' or p_family is null then return null; end if;
  if p_inbound and p_sent_by is not null and exists (select 1 from guardian g where g.family_id = p_family
                                                       and g.user_id = p_sent_by and g.deleted_at is null) then
    return p_sent_by;
  end if;
  if p_reply_to is not null then
    select private_to into v from communication where id = p_reply_to;
    if v is not null then return v; end if;
  end if;
  if p_request is not null then
    select r.raised_by into v from studio_request r where r.id = p_request;
    if v is not null and exists (select 1 from guardian g where g.family_id = p_family
                                   and g.user_id = v and g.deleted_at is null) then
      return v;
    end if;
  end if;
  return null;
end $$;
revoke all on function app.message_private_to(text, uuid, boolean, uuid, uuid, uuid) from public, authenticated, anon;

create or replace function app.communication_privacy_update() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.private_to is null then
    new.private_to := app.message_private_to(new.kind::text, new.family_id, new.inbound, new.sent_by, new.reply_to, new.request_id);
  end if;
  return new;
end $$;
drop trigger if exists communication_to_guardian_update on communication;
create trigger communication_to_guardian_update before update of inbound, sent_by, reply_to, request_id, family_id, kind
  on communication for each row execute function app.communication_privacy_update();

-- Stamps every stored message by the same rule, replies following their
-- thread. Runs below for what is already stored; the office (or a job) can
-- run it again after loading history from another system.
create or replace function app.restamp_message_privacy(p_studio uuid default null) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare n int := 0; k int;
begin
  if auth.uid() is not null and not (p_studio is not null and app.is_admin(p_studio)) then
    raise exception 'FORBIDDEN: only the office can do this' using errcode = 'insufficient_privilege';
  end if;
  update communication c
     set private_to = app.message_private_to(c.kind::text, c.family_id, c.inbound, c.sent_by, null, c.request_id)
   where c.private_to is null and c.kind = 'direct' and c.family_id is not null
     and (p_studio is null or c.studio_id = p_studio)
     and app.message_private_to(c.kind::text, c.family_id, c.inbound, c.sent_by, null, c.request_id) is not null;
  get diagnostics k = row_count; n := n + k;
  -- Replies, thread by thread (a chain is followed to any depth).
  loop
    update communication c set private_to = p.private_to
      from communication p
     where c.reply_to = p.id and c.private_to is null and p.private_to is not null
       and c.kind = 'direct' and c.family_id = p.family_id
       and (p_studio is null or c.studio_id = p_studio);
    get diagnostics k = row_count;
    exit when k = 0;
    n := n + k;
  end loop;
  return n;
end $$;
revoke all on function app.restamp_message_privacy(uuid) from public, anon;
grant execute on function app.restamp_message_privacy(uuid) to authenticated, service_role;

select app.restamp_message_privacy(null);

-- ════════════════════════════════════════════════════════════════════════════
-- 2 · Invitations for an adult on their own (U12)
-- ════════════════════════════════════════════════════════════════════════════
-- adult_only: the family's only dancers are adults, so the person is invited
-- to manage their own bookings, not "as a parent in the Hughes (adult)".
drop function if exists app.invitation_preview(text);
create function app.invitation_preview(p_token text)
  returns table (studio_name text, role app_role, email text, full_name text, family_name text,
                 student_name text, state text, adult_only boolean)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.name, i.role, i.email, i.full_name,
         nullif(regexp_replace(f.name, '\s*\(adult\)\s*$', ''), ''), st.first_name,
         case when i.accepted_at is not null then 'accepted'
              when i.revoked_at is not null then 'revoked'
              when i.expires_at <= now() then 'expired'
              when s.status in ('suspended', 'cancelled') then 'unavailable'
              else 'valid' end,
         f.id is not null
           and exists (select 1 from student x where x.family_id = f.id and x.deleted_at is null)
           and not exists (select 1 from student x where x.family_id = f.id and x.deleted_at is null and not x.is_adult)
    from studio_invitation i
    join studio s on s.id = i.studio_id
    left join family f on f.id = i.family_id
    left join student st on st.id = i.student_id
   where i.token_hash = app.hash_token(p_token)
$$;
grant execute on function app.invitation_preview(text) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- 3 · Booking references and the manage-booking link (F5)
-- ════════════════════════════════════════════════════════════════════════════
-- A reference is derived from the booking, so it never changes and needs no
-- storage: T- for a trial, D- for a drop-in, then six characters.
create or replace function app.booking_reference(p_kind text, p_id uuid) returns text
  language sql immutable as $$
  select case p_kind when 'trial' then 'T-' else 'D-' end || upper(left(md5(p_id::text), 6))
$$;
grant execute on function app.booking_reference(text, uuid) to anon, authenticated;

-- The manage link carries a secret token; only its hash is kept. It works
-- until a day after the class, then stops.
create table booking_link (
  token_hash  text primary key,
  studio_id   uuid not null references studio(id) on delete cascade,
  trial_id    uuid references trial(id) on delete cascade,
  drop_in_id  uuid references drop_in_booking(id) on delete cascade,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now(),
  check ((trial_id is null) <> (drop_in_id is null))
);
alter table booking_link enable row level security; alter table booking_link force row level security;
grant all on booking_link to service_role;
-- No policies: read and written only through the functions below.

create or replace function app.issue_booking_link(p_trial uuid, p_drop_in uuid) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare tok text := app.new_token(); sid uuid; ends timestamptz;
begin
  if p_trial is not null then
    select t.studio_id, coalesce(cs.ends_at, cs.starts_at, now() + interval '30 days') into sid, ends
      from trial t left join class_session cs on cs.id = t.session_id where t.id = p_trial;
  else
    select d.studio_id, cs.ends_at into sid, ends
      from drop_in_booking d join class_session cs on cs.id = d.session_id where d.id = p_drop_in;
  end if;
  if sid is null then return null; end if;
  insert into booking_link (token_hash, studio_id, trial_id, drop_in_id, expires_at)
  values (app.hash_token(tok), sid, p_trial, p_drop_in, ends + interval '1 day');
  return tok;
end $$;
revoke all on function app.issue_booking_link(uuid, uuid) from public, authenticated, anon;

-- The public trial booking, with its reference and a manage link. The link is
-- issued only for a booking made in this very call (created_at = now() is the
-- transaction's time), never for one that already existed: knowing someone's
-- email and child's name must not hand over their booking.
create or replace function app.public_book_trial_ref(p_slug text, p_session uuid, p_form jsonb) returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r text; t trial;
begin
  r := app.public_book_trial(p_slug, p_session, p_form);
  select tr.* into t from trial tr join enquiry e on e.id = tr.enquiry_id
   where tr.session_id = p_session and tr.deleted_at is null
     and lower(e.contact_email) = lower(btrim(p_form ->> 'contact_email'))
     and lower(e.child_name) = lower(btrim(p_form ->> 'child_name'))
   order by tr.created_at desc limit 1;
  if t.id is null then return jsonb_build_object('result', r); end if;
  return jsonb_build_object('result', r, 'reference', app.booking_reference('trial', t.id),
    'token', case when t.created_at = now() then app.issue_booking_link(t.id, null) end);
end $$;
revoke all on function app.public_book_trial_ref(text, uuid, jsonb) from public;
grant execute on function app.public_book_trial_ref(text, uuid, jsonb) to anon, authenticated;

create or replace function app.public_adult_drop_in_ref(p_slug text, p_session uuid, p_form jsonb) returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r text; bid uuid;
begin
  r := app.public_adult_drop_in(p_slug, p_session, p_form);
  select d.id into bid from drop_in_booking d
   where d.session_id = p_session and d.created_at = now() and d.status in ('booked', 'held')
   order by d.created_at desc limit 1;
  if bid is null then return jsonb_build_object('result', r); end if;
  return jsonb_build_object('result', r, 'reference', app.booking_reference('drop_in', bid),
                            'token', app.issue_booking_link(null, bid));
end $$;
revoke all on function app.public_adult_drop_in_ref(text, uuid, jsonb) from public;
grant execute on function app.public_adult_drop_in_ref(text, uuid, jsonb) to anon, authenticated;

-- What the manage page shows. Nothing about anyone else, and nothing medical.
create or replace function app.public_booking(p_token text)
  returns table (reference text, kind text, status text, studio_name text, studio_slug text, class_name text,
                 starts_at timestamptz, ends_at timestamptz, location text, address text, dancer text,
                 price_minor int, can_cancel boolean, free_until timestamptz, contact_email text, contact_phone text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with l as (select * from booking_link where token_hash = app.hash_token(p_token) and expires_at > now())
  select app.booking_reference('trial', t.id), 'trial', t.status::text, st.name, st.slug, c.name,
         cs.starts_at, cs.ends_at, loc.name, nullif(concat_ws(', ', loc.address_line1, loc.postcode), ''),
         split_part(coalesce(e.child_name, s.first_name), ' ', 1), t.price_minor,
         t.status in ('booked', 'requested') and coalesce(cs.starts_at, now() + interval '1 day') > now(),
         cs.starts_at, st.contact_email, st.contact_phone
    from l join trial t on t.id = l.trial_id and t.deleted_at is null
    join studio st on st.id = t.studio_id
    join class c on c.id = t.class_id
    left join class_session cs on cs.id = t.session_id
    left join location loc on loc.id = c.location_id
    left join enquiry e on e.id = t.enquiry_id
    left join student s on s.id = t.student_id
  union all
  select app.booking_reference('drop_in', d.id), 'drop_in', d.status, st.name, st.slug, c.name,
         cs.starts_at, cs.ends_at, loc.name, nullif(concat_ws(', ', loc.address_line1, loc.postcode), ''),
         s.first_name, d.price_minor,
         d.status in ('booked', 'held') and cs.starts_at > now(),
         cs.starts_at - interval '24 hours', st.contact_email, st.contact_phone
    from l join drop_in_booking d on d.id = l.drop_in_id
    join studio st on st.id = d.studio_id
    join class_session cs on cs.id = d.session_id
    join class c on c.id = cs.class_id
    left join location loc on loc.id = c.location_id
    join student s on s.id = d.student_id
$$;
revoke all on function app.public_booking(text) from public;
grant execute on function app.public_booking(text) to anon, authenticated;

-- Cancelling within the school's policy. A trial can be cancelled until it
-- starts. A drop-in more than 24 hours ahead is not charged (the pack class
-- is given back, or the unpaid invoice is voided); later than that the place
-- is released and the charge stands, as in app.cancel_drop_in.
create or replace function app.cancel_drop_in_internal(p_booking uuid, p_by text) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare b drop_in_booking; starts timestamptz; refunded boolean := false;
begin
  select * into b from drop_in_booking where id = p_booking and status in ('booked', 'held') for update;
  if b.id is null then raise exception 'INVALID: that booking is not live' using errcode = 'check_violation'; end if;
  select starts_at into starts from class_session where id = b.session_id;
  if starts <= now() then raise exception 'INVALID: that class has already started' using errcode = 'check_violation'; end if;
  update drop_in_booking set status = 'cancelled', cancelled_at = now() where id = b.id;
  if starts > now() + interval '24 hours' or b.status = 'held' then
    if b.pack_purchase_id is not null then
      update pack_purchase set remaining = remaining + 1 where id = b.pack_purchase_id; refunded := true;
    elsif b.invoice_id is not null and (select paid_minor from invoice where id = b.invoice_id) = 0 then
      update invoice set status = 'void', voided_at = now(), void_reason = 'Drop-in cancelled in good time' where id = b.invoice_id;
      perform app.recalc_family_balance((select family_id from invoice where id = b.invoice_id));
      refunded := true;
    end if;
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (b.studio_id, auth.uid(), 'cancel', 'drop_in_booking', b.id, 'Drop-in cancelled ' || p_by);
  return case when refunded then 'refunded' else 'released' end;
end $$;
revoke all on function app.cancel_drop_in_internal(uuid, text) from public, authenticated, anon;

create or replace function app.cancel_trial_internal(p_trial uuid, p_by text) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare t trial; starts timestamptz; who text;
begin
  select * into t from trial where id = p_trial and deleted_at is null for update;
  if t.id is null or t.status not in ('booked', 'requested') then
    raise exception 'INVALID: that trial is not booked' using errcode = 'check_violation';
  end if;
  select starts_at into starts from class_session where id = t.session_id;
  if starts is not null and starts <= now() then
    raise exception 'INVALID: that class has already started' using errcode = 'check_violation';
  end if;
  update trial set status = 'cancelled', outcome_note = 'Cancelled ' || p_by, updated_at = now() where id = t.id;
  select coalesce(e.child_name, s.first_name) into who from trial x
    left join enquiry e on e.id = x.enquiry_id left join student s on s.id = x.student_id where x.id = t.id;
  perform app.notify_admins(t.studio_id, 'new_trial', 'Trial cancelled: ' || coalesce(who, 'a dancer'),
    (select c.name from class c where c.id = t.class_id) || coalesce(', ' || to_char(starts at time zone
      (select timezone from studio where id = t.studio_id), 'FMDy DD Mon HH24:MI'), '') || ' · ' || p_by,
    '/people');
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (t.studio_id, auth.uid(), 'cancel', 'trial', t.id, 'Trial cancelled ' || p_by);
  return 'cancelled';
end $$;
revoke all on function app.cancel_trial_internal(uuid, text) from public, authenticated, anon;

create or replace function app.public_cancel_booking(p_token text) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare l booking_link;
begin
  select * into l from booking_link where token_hash = app.hash_token(p_token) and expires_at > now();
  if l.token_hash is null then
    raise exception 'NOT_FOUND: this booking link has expired or is not valid' using errcode = 'no_data_found';
  end if;
  if l.trial_id is not null then return app.cancel_trial_internal(l.trial_id, 'from the booking link'); end if;
  return app.cancel_drop_in_internal(l.drop_in_id, 'from the booking link');
end $$;
revoke all on function app.public_cancel_booking(text) from public;
grant execute on function app.public_cancel_booking(text) to anon, authenticated;

-- A family's own trials and drop-ins ahead, with their references.
create or replace function app.my_bookings()
  returns table (kind text, id uuid, reference text, student_id uuid, first_name text, class_name text,
                 starts_at timestamptz, ends_at timestamptz, location text, status text, paid_with text,
                 free_until timestamptz)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select 'trial', t.id, app.booking_reference('trial', t.id), s.id, s.first_name, c.name, cs.starts_at, cs.ends_at,
         nullif(concat_ws(', ', coalesce(r.name, null), l.name), ''), t.status::text,
         case when coalesce(t.price_minor, 0) > 0 then 'trial_fee' else 'free' end, cs.starts_at
    from trial t join student s on s.id = t.student_id and s.deleted_at is null
    join class c on c.id = t.class_id
    join class_session cs on cs.id = t.session_id
    left join room r on r.id = c.room_id left join location l on l.id = c.location_id
   where t.deleted_at is null and t.status = 'booked' and cs.starts_at > now()
     and s.id in (select app.guardian_student_ids())
  union all
  select 'drop_in', d.id, app.booking_reference('drop_in', d.id), s.id, s.first_name, c.name, cs.starts_at, cs.ends_at,
         nullif(concat_ws(', ', coalesce(sr.name, r.name), l.name), ''), d.status,
         case when d.pack_purchase_id is not null then 'pack' when d.invoice_id is not null then 'invoice' else 'free' end,
         cs.starts_at - interval '24 hours'
    from drop_in_booking d join student s on s.id = d.student_id and s.deleted_at is null
    join class_session cs on cs.id = d.session_id join class c on c.id = cs.class_id
    left join room r on r.id = c.room_id left join room sr on sr.id = cs.room_id left join location l on l.id = c.location_id
   where d.status in ('booked', 'held') and cs.starts_at > now()
     and s.id in (select app.guardian_student_ids())
   order by 7
$$;
revoke all on function app.my_bookings() from public;
grant execute on function app.my_bookings() to authenticated;

create or replace function app.guardian_cancel_trial(p_trial uuid) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not exists (select 1 from trial t where t.id = p_trial and t.student_id in (select app.guardian_student_ids())) then
    raise exception 'FORBIDDEN: not your booking' using errcode = 'insufficient_privilege';
  end if;
  return app.cancel_trial_internal(p_trial, 'by the family');
end $$;
revoke all on function app.guardian_cancel_trial(uuid) from public;
grant execute on function app.guardian_cancel_trial(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- 4 · "Your share" for split billing
-- ════════════════════════════════════════════════════════════════════════════
-- What the signed-in guardian pays of their family's class fees, and what the
-- other guardian covers, in shares and children only: never the other
-- guardian's invoices or amounts. No row when the family pays together.
create or replace function app.my_billing_share()
  returns table (mode text, my_pct int, other_pct int, other_name text, my_children text[], other_children text[])
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare me guardian; b family_billing; other uuid; oname text; mine text[]; theirs text[];
begin
  select g.* into me from guardian g where g.user_id = auth.uid() and g.deleted_at is null
     and g.family_id in (select app.guardian_family_ids()) order by g.created_at limit 1;
  if me.id is null then return; end if;
  select * into b from family_billing where family_id = me.family_id;
  if b.family_id is null or b.mode = 'family' then return; end if;
  other := case when b.guardian_a = me.id then b.guardian_b else b.guardian_a end;
  select split_part(full_name, ' ', 1) into oname from guardian where id = other and deleted_at is null;
  if b.mode = 'per_child' then
    select array_agg(s.first_name order by s.date_of_birth) filter (where py.guardian_id = me.id),
           array_agg(s.first_name order by s.date_of_birth) filter (where py.guardian_id is distinct from me.id)
      into mine, theirs
      from student s cross join lateral app.billing_payers(s.family_id, s.id) py
     where s.family_id = me.family_id and s.deleted_at is null;
    if oname is null then
      select split_part(g.full_name, ' ', 1) into oname from guardian g join family_billing_child x on x.guardian_id = g.id
       where x.family_id = me.family_id and g.id <> me.id and g.deleted_at is null limit 1;
    end if;
    return query select 'per_child'::text, null::int, null::int, oname, coalesce(mine, '{}'), coalesce(theirs, '{}');
  elsif b.mode = 'one' then
    return query select 'one'::text, case when b.guardian_a = me.id then 100 else 0 end,
                        case when b.guardian_a = me.id then 0 else 100 end,
                        case when b.guardian_a = me.id then null else (select split_part(full_name, ' ', 1) from guardian where id = b.guardian_a) end,
                        '{}'::text[], '{}'::text[];
  else
    return query select 'percent'::text,
                        case when b.guardian_a = me.id then b.percent_a::int else 100 - b.percent_a end,
                        case when b.guardian_a = me.id then 100 - b.percent_a else b.percent_a::int end,
                        oname, '{}'::text[], '{}'::text[];
  end if;
end $$;
revoke all on function app.my_billing_share() from public;
grant execute on function app.my_billing_share() to authenticated;

-- Coming up, as 0045, with two changes for a guardian whose family splits the
-- fees: invoices addressed to the other payer are not read (so their numbers
-- and states never show), and class fees count only this guardian's share.
create or replace function app.upcoming_costs(p_family uuid default null)
  returns table (family_id uuid, student_id uuid, child text, kind text, title text, due_on date,
                 amount_minor bigint, state text, invoice_number text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare fams uuid[]; nm date := (date_trunc('month', current_date) + interval '1 month')::date;
        office boolean := false; hidden uuid[];
begin
  if p_family is not null then
    office := app.is_admin((select f.studio_id from family f where f.id = p_family));
    if not (p_family in (select app.guardian_family_ids()) or office) then
      raise exception 'FORBIDDEN: not your family' using errcode = 'insufficient_privilege';
    end if;
    fams := array[p_family];
  else
    fams := array(select app.guardian_family_ids());
  end if;
  hidden := case when office then '{}'::uuid[] else array(select app.payer_hidden_invoice_ids()) end;

  return query
  with kids as (
    select s.id, s.family_id, s.first_name, s.studio_id,
           -- This guardian's share of the child's class fees, in percent.
           case when office then 100 else coalesce((
             select max(py.share_pct) from app.billing_payers(s.family_id, s.id) py
              where py.guardian_id is null
                 or py.guardian_id in (select g.id from guardian g where g.user_id = auth.uid() and g.deleted_at is null)), 0) end as pct
      from student s
     where s.family_id = any(fams) and s.deleted_at is null
  ),
  inv_state as (
    select ii.student_id, ii.event_id, ii.class_id, ii.period_start, i.term_id, i.number, i.due_on, i.status
      from invoice_item ii join invoice i on i.id = ii.invoice_id
     where ii.deleted_at is null and i.deleted_at is null and i.status <> 'void'
       and i.family_id = any(fams) and not (i.id = any(hidden))
  ),
  nxt as (
    select t.* from term t where t.deleted_at is null and t.starts_on > current_date
       and t.studio_id in (select k.studio_id from kids k)
     order by t.starts_on limit 1
  ),
  items as (
    select k.family_id, k.id sid, k.first_name, 'term'::text kd,
           c.name || ' — ' || t.name title, t.starts_on d, coalesce(e.price_minor, c.price_minor)::bigint amt,
           x.status st, x.number num, k.pct
      from kids k join enrolment e on e.student_id = k.id and e.deleted_at is null and e.status = 'active'
      join class c on c.id = e.class_id and c.deleted_at is null and c.pricing in ('term', 'one_off')
      join nxt t on t.id = c.term_id
      left join lateral (select s.status, s.number from inv_state s where s.student_id = k.id and s.class_id = c.id
                          and s.term_id = t.id order by s.status = 'paid' desc limit 1) x on true
     where coalesce(e.price_minor, c.price_minor) > 0
    union all
    select k.family_id, k.id, k.first_name, 'term',
           coalesce((select t.name from nxt t), 'Next term') || ' fees (estimate)',
           (select t.starts_on from nxt t),
           sum(coalesce(e.price_minor, c.price_minor))::bigint, null, null, k.pct
      from kids k join enrolment e on e.student_id = k.id and e.deleted_at is null and e.status = 'active'
      join class c on c.id = e.class_id and c.deleted_at is null and c.pricing = 'term'
      join term t on t.id = c.term_id and current_date between t.starts_on and t.ends_on
     where not exists (select 1 from enrolment e2 join class c2 on c2.id = e2.class_id join nxt n on n.id = c2.term_id
                        where e2.student_id = k.id and e2.deleted_at is null)
     group by k.family_id, k.id, k.first_name, k.pct
    union all
    select k.family_id, k.id, k.first_name, 'month', c.name || ' — ' || to_char(nm, 'FMMonth'), nm,
           coalesce(e.price_minor, c.price_minor)::bigint, x.status, x.number, k.pct
      from kids k join enrolment e on e.student_id = k.id and e.deleted_at is null and e.status = 'active'
      join class c on c.id = e.class_id and c.deleted_at is null and c.pricing = 'monthly'
      join term t on t.id = c.term_id and nm between t.starts_on and t.ends_on
      left join lateral (select s.status, s.number from inv_state s where s.student_id = k.id and s.class_id = c.id
                          and s.period_start = nm limit 1) x on true
     where coalesce(e.price_minor, c.price_minor) > 0
    union all
    select k.family_id, k.id, k.first_name, ev.kind::text, ev.title, coalesce(x.due_on, ev.starts_at::date),
           ev.cost_minor::bigint, x.status, x.number, 100
      from kids k join event_participant p on p.student_id = k.id and p.status = 'confirmed' and p.deleted_at is null
      join studio_event ev on ev.id = p.event_id and ev.deleted_at is null and ev.status <> 'cancelled'
      left join lateral (select s.status, s.number, s.due_on from inv_state s where s.event_id = ev.id and s.student_id = k.id
                          order by s.status = 'paid' desc limit 1) x on true
     where coalesce(ev.cost_minor, 0) > 0 and ev.kind <> 'private_lesson'
       and (ev.starts_at >= current_date or (x.status is not null and x.status <> 'paid'))
    union all
    select k.family_id, k.id, k.first_name, 'private_lesson', 'Private lesson', coalesce(x.due_on, ev.starts_at::date),
           ev.cost_minor::bigint, x.status, x.number, 100
      from kids k join studio_event ev on ev.student_id = k.id and ev.kind = 'private_lesson'
                   and ev.deleted_at is null and ev.status = 'published'
      left join lateral (select s.status, s.number, s.due_on from inv_state s where s.event_id = ev.id
                          order by s.status = 'paid' desc limit 1) x on true
     where coalesce(ev.cost_minor, 0) > 0
       and (ev.starts_at >= current_date or (x.status is not null and x.status not in ('paid', 'draft')))
    union all
    select k.family_id, k.id, k.first_name, 'exam', x0.board || ' ' || en.grade || ' exam', coalesce(i.due_on, x0.exam_on),
           en.fee_minor::bigint, i.status, i.number, 100
      from kids k join exam_entry en on en.student_id = k.id and en.status = 'entered' and en.fee_minor > 0
      join exam_session x0 on x0.id = en.session_id and x0.deleted_at is null
      left join invoice i on i.id = en.invoice_id and i.deleted_at is null and i.status <> 'void' and not (i.id = any(hidden))
     where x0.exam_on >= current_date or (i.status is not null and i.status <> 'paid')
    union all
    select k.family_id, k.id, k.first_name, 'costume', ci.name || ' — ' || ev.title, ev.starts_at::date,
           ci.price_minor::bigint, null, null, 100
      from kids k join costume_order co on co.student_id = k.id and co.status <> 'returned'
      join costume_item ci on ci.id = co.item_id and ci.deleted_at is null and ci.price_minor > 0
      join studio_event ev on ev.id = ci.event_id and ev.deleted_at is null and ev.starts_at >= current_date
  )
  select r.family_id, r.sid, r.first_name, r.kd,
         r.title || case when r.kd in ('term', 'month') and r.pct between 1 and 99 then ' (your ' || r.pct || '%)' else '' end,
         r.d,
         case when r.kd in ('term', 'month') and r.st is null then round(r.amt * r.pct / 100.0)::bigint else r.amt end,
         case when r.st = 'paid' then 'paid' when r.st in ('issued', 'part_paid', 'refunded') then 'invoiced' else 'expected' end,
         case when r.st in ('issued', 'part_paid', 'refunded', 'paid') then r.num end
    from items r
   where not (r.kd in ('term', 'month') and r.pct = 0)
   order by r.first_name, r.d nulls last, r.title;
end $$;
revoke all on function app.upcoming_costs(uuid) from public;
grant execute on function app.upcoming_costs(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- 5 · Home: Coming up per child (U7), and clashes (U8)
-- ════════════════════════════════════════════════════════════════════════════
-- Per child, the next of each: show (or competition or workshop), exam,
-- costume still needed (by the first dress rehearsal, else the show), and fee.
create or replace function app.my_coming_up()
  returns table (student_id uuid, child text, kind text, title text, on_date date, detail text, state text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if auth.uid() is null then return; end if;
  return query
  with kids as (select s.id, s.first_name from student s
                 where s.deleted_at is null and s.id in (select app.guardian_student_ids())),
  ev as (
    select distinct on (k.id) k.id sid, k.first_name, 'show'::text kd, e.title, (e.starts_at at time zone st.timezone)::date d,
           nullif(concat_ws(' · ', initcap(replace(e.kind::text, '_', ' ')), e.venue), '') det, null::text stt
      from kids k join event_participant p on p.student_id = k.id and p.status = 'confirmed' and p.deleted_at is null
      join studio_event e on e.id = p.event_id and e.deleted_at is null and e.status = 'published'
           and e.parent_event_id is null and e.kind in ('show', 'competition', 'workshop') and e.starts_at >= now()
      join studio st on st.id = e.studio_id
     order by k.id, e.starts_at
  ),
  ex as (
    select distinct on (k.id) k.id sid, k.first_name, 'exam'::text kd, x.board || ' ' || en.grade, x.exam_on,
           x.venue, null::text
      from kids k join exam_entry en on en.student_id = k.id and en.status = 'entered'
      join exam_session x on x.id = en.session_id and x.deleted_at is null and x.exam_on >= current_date
     order by k.id, x.exam_on
  ),
  co as (
    select distinct on (k.id) k.id sid, k.first_name, 'costume'::text kd, ci.name || ' for ' || e.title,
           coalesce((select min(r.starts_at at time zone st.timezone)::date from studio_event r
                      where r.parent_event_id = e.id and r.deleted_at is null and r.status = 'published'
                        and r.starts_at >= now() and r.title ilike '%dress%'), (e.starts_at at time zone st.timezone)::date),
           case co.status when 'needed' then 'Still needed' when 'ordered' then 'Ordered' else 'Arrived' end, co.status
      from kids k join costume_order co on co.student_id = k.id and co.status in ('needed', 'ordered', 'arrived')
      join costume_item ci on ci.id = co.item_id and ci.deleted_at is null
      join studio_event e on e.id = ci.event_id and e.deleted_at is null and e.starts_at >= now()
      join studio st on st.id = e.studio_id
     order by k.id, e.starts_at
  ),
  fee as (
    select distinct on (u.student_id) u.student_id sid, u.child, 'fee'::text kd, u.title, u.due_on,
           app.gbp(u.amount_minor) || coalesce(' · ' || u.invoice_number, ''), u.state
      from app.upcoming_costs(null) u
     where u.state <> 'paid' and u.student_id in (select id from kids)
     order by u.student_id, (u.state = 'invoiced') desc, u.due_on nulls last
  )
  select * from ev union all select * from ex union all select * from co union all select * from fee
  order by 2, 5 nulls last;
end $$;
revoke all on function app.my_coming_up() from public;
grant execute on function app.my_coming_up() to authenticated;

-- Two things for the same child at overlapping times (a private lesson over
-- a class, two schools' classes), within the window. Exams are a whole day
-- and are not counted; nor is anything cancelled.
create or replace function app.my_clashes(p_from timestamptz, p_to timestamptz)
  returns table (student_id uuid, child text, a_title text, a_kind text, a_starts timestamptz,
                 b_title text, b_kind text, b_starts timestamptz)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with d as (
    select distinct on (x.uid, x.student_id) x.* from app.my_diary(p_from, p_to) x
     where x.status <> 'cancelled' and x.item_kind <> 'exam'
  )
  select a.student_id, a.child, a.title, a.item_kind, a.starts_at, b.title, b.item_kind, b.starts_at
    from d a join d b on b.student_id = a.student_id and a.uid < b.uid
     and a.starts_at < coalesce(b.ends_at, b.starts_at + interval '1 hour')
     and b.starts_at < coalesce(a.ends_at, a.starts_at + interval '1 hour')
     -- A show and its own rehearsal are one thing, not a clash.
     and not ((a.item_kind = 'rehearsal' and b.item_kind in ('show', 'competition'))
           or (b.item_kind = 'rehearsal' and a.item_kind in ('show', 'competition')))
   order by a.starts_at
$$;
revoke all on function app.my_clashes(timestamptz, timestamptz) from public;
grant execute on function app.my_clashes(timestamptz, timestamptz) to authenticated;
