-- ============================================================================
-- 0033 · Drop-in classes, class packs, adult learners (R-034), and credit
--        when the school cancels a class
-- ----------------------------------------------------------------------------
-- Pay-as-you-go classes ('drop_in' pricing) are booked a session at a time.
-- A booking is paid from a class pack if the dancer has one with classes
-- left, otherwise it is invoiced at the class price. Card payment for those
-- invoices arrives through the payments module once it is connected
-- (docs/PAYMENTS.md); until then the family pays on their account.
--
-- An adult learner is simply a family whose dancer is the parent: the same
-- screens serve them, and the public page lets an adult book for themselves.
-- ============================================================================

create or replace function app.allocate_account_credit_internal(p_family uuid) returns bigint
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid; avail bigint; inv record; take bigint; total bigint := 0;
begin
  select studio_id into sid from family where id = p_family and deleted_at is null;
  avail := app.family_available_credit(p_family);
  for inv in
    select id, total_minor - paid_minor as owed from invoice
     where family_id = p_family and deleted_at is null
       and status in ('issued', 'part_paid', 'refunded') and total_minor > paid_minor
     order by due_on nulls last, issued_on, number
  loop
    exit when avail <= 0;
    take := least(avail, inv.owed);
    insert into payment (studio_id, family_id, invoice_id, amount_minor, method,
                         provider, succeeded_at, note, recorded_by)
    values (sid, p_family, inv.id, take, 'account', 'ledger', now(),
            'Credit on account applied', auth.uid());
    avail := avail - take; total := total + take;
  end loop;
  return total;
end $$;
revoke all on function app.allocate_account_credit_internal(uuid) from public, authenticated, anon;

-- Invoices raised by the system on a family's behalf (a drop-in, a pack):
-- the same as app.create_invoice without the office check. Never granted to
-- users; only callable from the checked functions below.
create or replace function app.create_invoice_internal(
  p_family uuid, p_items jsonb, p_due date default null, p_note text default null,
  p_discount_minor bigint default 0, p_issue boolean default true, p_term uuid default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid; inv uuid; num text; it jsonb; n int := 0;
begin
  select studio_id into sid from family where id = p_family and deleted_at is null;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'INVALID: an invoice needs at least one line' using errcode = 'check_violation';
  end if;
  if coalesce(p_discount_minor, 0) < 0 then
    raise exception 'INVALID: a discount cannot be negative' using errcode = 'check_violation';
  end if;

  -- Sequential per studio. The advisory lock stops two people raising
  -- invoices at the same moment from being handed the same number.
  perform pg_advisory_xact_lock(hashtext('invoice-number:' || sid::text));
  select 'INV-' || lpad((coalesce(max(nullif(regexp_replace(number, '\D', '', 'g'), '')::int), 1000) + 1)::text, 4, '0')
    into num from invoice where studio_id = sid;

  insert into invoice (studio_id, family_id, term_id, number, status, issued_on, due_on,
                       discount_minor, note, created_by)
  values (sid, p_family, p_term, num, case when p_issue then 'issued' else 'draft' end::invoice_status,
          case when p_issue then current_date end,
          coalesce(p_due, current_date + 14), coalesce(p_discount_minor, 0),
          nullif(btrim(p_note), ''), auth.uid())
  returning id into inv;

  for it in select * from jsonb_array_elements(p_items) loop
    n := n + 1;
    if coalesce(btrim(it->>'description'), '') = '' then
      raise exception 'INVALID: line % needs a description', n using errcode = 'check_violation';
    end if;
    -- A line about a child must be about a child in this family.
    if it->>'student_id' is not null and not exists (
         select 1 from student s where s.id = (it->>'student_id')::uuid
            and s.family_id = p_family and s.deleted_at is null) then
      raise exception 'INVALID: line % names a student outside this family', n
        using errcode = 'check_violation';
    end if;
    insert into invoice_item (studio_id, invoice_id, student_id, class_id, kind, description,
                              quantity, unit_minor, discount_minor)
    values (sid, inv, (it->>'student_id')::uuid, (it->>'class_id')::uuid,
            coalesce(it->>'kind', 'other')::charge_kind, btrim(it->>'description'),
            coalesce((it->>'quantity')::numeric, 1), (it->>'unit_minor')::int,
            coalesce((it->>'discount_minor')::int, 0));
  end loop;

  if exists (select 1 from invoice_item where invoice_id = inv and total_minor < 0) then
    raise exception 'INVALID: a line discount is larger than the line' using errcode = 'check_violation';
  end if;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'create', 'invoice', inv, num);

  if p_issue then perform app.allocate_account_credit_internal(p_family); end if;
  return inv;
end $$;
revoke all on function app.create_invoice_internal(uuid, jsonb, date, text, bigint, boolean, uuid) from public, authenticated, anon;

-- ── Packs ──────────────────────────────────────────────────────────────────
create table class_pack (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  name        text not null,
  classes     smallint not null check (classes between 1 and 100),
  price_minor integer not null check (price_minor >= 0),
  valid_days  smallint not null default 90 check (valid_days between 7 and 730),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create table pack_purchase (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  pack_id     uuid not null references class_pack(id) on delete restrict,
  family_id   uuid not null references family(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  remaining   smallint not null check (remaining >= 0),
  expires_on  date not null,
  invoice_id  uuid references invoice(id) on delete set null,
  created_at  timestamptz not null default now()
);
create table drop_in_booking (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  session_id  uuid not null references class_session(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  status      text not null default 'booked' check (status in ('booked', 'cancelled')),
  pack_purchase_id uuid references pack_purchase(id) on delete set null,
  invoice_id  uuid references invoice(id) on delete set null,
  price_minor integer not null default 0,
  booked_by   uuid references user_account(id) on delete set null,
  created_at  timestamptz not null default now(),
  cancelled_at timestamptz
);
create unique index drop_in_once on drop_in_booking (session_id, student_id) where status = 'booked';

alter table class_pack enable row level security;      alter table class_pack force row level security;
alter table pack_purchase enable row level security;   alter table pack_purchase force row level security;
alter table drop_in_booking enable row level security; alter table drop_in_booking force row level security;
create policy pack_read on class_pack for select using (deleted_at is null and studio_id in (select app.studio_ids()));
create policy pack_admin on class_pack for all using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy purchase_read on pack_purchase for select
  using (app.is_admin(studio_id) or family_id in (select app.guardian_family_ids()));
create policy dropin_read on drop_in_booking for select
  using (app.is_admin(studio_id) or student_id in (select app.guardian_student_ids())
         or (app.has_role(studio_id, 'teacher') and session_id in (select id from class_session where class_id in (select app.teacher_class_ids()))));
grant select, insert, update on class_pack to authenticated;
grant select on pack_purchase, drop_in_booking to authenticated;
grant all on class_pack, pack_purchase, drop_in_booking to service_role;

-- Teachers see drop-in dancers in their classes, as they do trialists.
create or replace function app.teacher_student_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select e.student_id from enrolment e
   where e.class_id in (select app.teacher_class_ids()) and e.status = 'active' and e.deleted_at is null
  union
  select t.student_id from trial t
   where t.class_id in (select app.teacher_class_ids()) and t.student_id is not null and t.deleted_at is null
     and t.status in ('booked', 'attended')
  union
  select d.student_id from drop_in_booking d join class_session cs on cs.id = d.session_id
   where cs.class_id in (select app.teacher_class_ids()) and d.status = 'booked'
     and cs.starts_at > now() - interval '30 days'
$$;

-- Places taken in one session: the enrolled, plus trials and drop-ins for it.
create or replace function app.session_taken(p_session uuid) returns int
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select app.class_enrolled_count(cs.class_id)
       + (select count(*)::int from trial t where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null)
       + (select count(*)::int from drop_in_booking d where d.session_id = cs.id and d.status = 'booked')
    from class_session cs where cs.id = p_session;
$$;

create or replace function app.buy_pack(p_pack uuid, p_student uuid) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare k class_pack; s student; inv uuid; pid uuid;
begin
  select * into k from class_pack where id = p_pack and active and deleted_at is null;
  select * into s from student where id = p_student and deleted_at is null;
  if k.id is null or s.id is null or s.studio_id <> k.studio_id then raise exception 'NOT_FOUND: that pack' using errcode = 'no_data_found'; end if;
  if not (s.id in (select app.guardian_student_ids()) or app.is_admin(s.studio_id)) then
    raise exception 'FORBIDDEN: not your dancer' using errcode = 'insufficient_privilege';
  end if;
  inv := app.create_invoice_internal(s.family_id, jsonb_build_array(jsonb_build_object('kind', 'other', 'description', k.name || ' — ' || s.first_name,
           'quantity', 1, 'unit_minor', k.price_minor, 'student_id', s.id)), current_date + 7, null, 0, true, null);
  insert into pack_purchase (studio_id, pack_id, family_id, student_id, remaining, expires_on, invoice_id)
  values (s.studio_id, k.id, s.family_id, s.id, k.classes, current_date + k.valid_days, inv) returning id into pid;
  return pid;
end $$;

-- Book one drop-in session. Uses a pack if there is one, else invoices.
create or replace function app.book_drop_in(p_session uuid, p_student uuid) returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not exists (select 1 from student s where s.id = p_student and s.deleted_at is null
                   and (s.id in (select app.guardian_student_ids()) or app.is_admin(s.studio_id))) then
    raise exception 'FORBIDDEN: not your dancer' using errcode = 'insufficient_privilege';
  end if;
  return app.book_drop_in_unchecked(p_session, p_student);
end $$;

-- The booking itself; callers have already checked who may book.
create or replace function app.book_drop_in_unchecked(p_session uuid, p_student uuid) returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; s student; pk pack_purchase; inv uuid; bid uuid;
begin
  select x.*, c.name cname, c.price_minor, c.pricing, c.capacity, c.studio_id sid into cs
    from class_session x join class c on c.id = x.class_id where x.id = p_session and x.deleted_at is null;
  select * into s from student where id = p_student and deleted_at is null;
  if cs.id is null or s.id is null or s.studio_id <> cs.sid then raise exception 'NOT_FOUND: that class' using errcode = 'no_data_found'; end if;
  if cs.pricing <> 'drop_in' then raise exception 'INVALID: % is booked by the term, not class by class', cs.cname using errcode = 'check_violation'; end if;
  if cs.status <> 'scheduled' or cs.starts_at < now() then raise exception 'INVALID: that class is not open for booking' using errcode = 'check_violation'; end if;
  if app.session_taken(cs.id) >= cs.capacity then raise exception 'INVALID: that class is full — try another date' using errcode = 'check_violation'; end if;
  if exists (select 1 from drop_in_booking where session_id = cs.id and student_id = s.id and status = 'booked') then
    raise exception 'INVALID: % is already booked in', s.first_name using errcode = 'check_violation';
  end if;
  if not exists (select 1 from emergency_contact where student_id = s.id and deleted_at is null) then
    raise exception 'INVALID: add an emergency contact for % first', s.first_name using errcode = 'check_violation';
  end if;
  select * into pk from pack_purchase where student_id = s.id and remaining > 0 and expires_on >= cs.starts_at::date
   order by expires_on limit 1 for update;
  if pk.id is not null then
    update pack_purchase set remaining = remaining - 1 where id = pk.id;
  elsif cs.price_minor > 0 then
    inv := app.create_invoice_internal(s.family_id, jsonb_build_array(jsonb_build_object('kind', 'tuition',
             'description', cs.cname || ' — ' || to_char(cs.starts_at, 'FMDD Mon') || ' — ' || s.first_name,
             'quantity', 1, 'unit_minor', cs.price_minor, 'student_id', s.id, 'class_id', cs.class_id)), cs.starts_at::date, null, 0, true, null);
  end if;
  insert into drop_in_booking (studio_id, session_id, student_id, pack_purchase_id, invoice_id, price_minor, booked_by)
  values (s.studio_id, cs.id, s.id, pk.id, inv, case when pk.id is null then cs.price_minor else 0 end, auth.uid())
  returning id into bid;
  return jsonb_build_object('id', bid, 'paid_with', case when pk.id is not null then 'pack' when inv is not null then 'invoice' else 'free' end,
                            'pack_left', case when pk.id is not null then pk.remaining - 1 end);
end $$;

-- Cancel a drop-in more than 24 hours ahead: the pack class comes back, or
-- the invoice is voided. Later than that, the place is still released.
create or replace function app.cancel_drop_in(p_booking uuid) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare b drop_in_booking; starts timestamptz; refunded boolean := false;
begin
  select * into b from drop_in_booking where id = p_booking and status = 'booked';
  if b.id is null then raise exception 'INVALID: that booking is not live' using errcode = 'check_violation'; end if;
  if not (b.student_id in (select app.guardian_student_ids()) or app.is_admin(b.studio_id)) then
    raise exception 'FORBIDDEN: not your booking' using errcode = 'insufficient_privilege';
  end if;
  select starts_at into starts from class_session where id = b.session_id;
  update drop_in_booking set status = 'cancelled', cancelled_at = now() where id = b.id;
  if starts > now() + interval '24 hours' then
    if b.pack_purchase_id is not null then
      update pack_purchase set remaining = remaining + 1 where id = b.pack_purchase_id; refunded := true;
    elsif b.invoice_id is not null and (select paid_minor from invoice where id = b.invoice_id) = 0 then
      update invoice set status = 'void', voided_at = now(), void_reason = 'Drop-in cancelled in good time' where id = b.invoice_id;
      perform app.recalc_family_balance((select family_id from invoice where id = b.invoice_id));
      refunded := true;
    end if;
  end if;
  return case when refunded then 'refunded' else 'released' end;
end $$;

-- Drop-in sessions open to book, for a family's dancer (or anyone, publicly).
create or replace function app.drop_in_sessions(p_studio uuid, p_days int default 21)
  returns table (session_id uuid, class_name text, style text, starts_at timestamptz, ends_at timestamptz,
                 price_minor int, places_left int, age_min smallint, age_max smallint)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select cs.id, c.name, ds.name, cs.starts_at, cs.ends_at, c.price_minor, (c.capacity - app.session_taken(cs.id))::int, c.age_min, c.age_max
    from class c join class_session cs on cs.class_id = c.id and cs.deleted_at is null and cs.status = 'scheduled'
    left join dance_style ds on ds.id = c.dance_style_id
   where c.studio_id = p_studio and c.deleted_at is null and c.pricing = 'drop_in' and c.visibility <> 'private'
     and cs.starts_at between now() + interval '1 hour' and now() + make_interval(days => p_days)
     and app.session_taken(cs.id) < c.capacity
   order by cs.starts_at;
$$;

-- An adult books their own first class from the public page: they are both
-- the family and the dancer.
create or replace function app.public_adult_drop_in(p_slug text, p_session uuid, p_form jsonb) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare st studio; fam uuid; kid uuid; r jsonb;
begin
  select * into st from studio where slug = lower(p_slug) and deleted_at is null;
  if st.id is null or not app.studio_writable(st.id) then raise exception 'NOT_FOUND: that school' using errcode = 'no_data_found'; end if;
  if coalesce(p_form ->> 'website', '') <> '' then return 'ok'; end if;
  if coalesce(btrim(p_form ->> 'name'), '') = '' or coalesce(btrim(p_form ->> 'phone'), '') = ''
     or coalesce(p_form ->> 'email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or coalesce(btrim(p_form ->> 'emergency_phone'), '') = '' then
    raise exception 'INVALID: please give your name, email, phone and someone to ring in an emergency' using errcode = 'check_violation';
  end if;
  if not exists (select 1 from app.drop_in_sessions(st.id) d where d.session_id = p_session) then
    raise exception 'INVALID: that class is full or no longer open — please pick another' using errcode = 'check_violation';
  end if;
  select g.family_id into fam from guardian g where g.studio_id = st.id and lower(g.email) = lower(btrim(p_form ->> 'email')) and g.deleted_at is null limit 1;
  if fam is null then
    insert into family (studio_id, name) values (st.id, regexp_replace(btrim(p_form ->> 'name'), '^.*\s', '') || ' (adult)') returning id into fam;
    insert into guardian (studio_id, family_id, full_name, email, phone, is_primary, relationship)
    values (st.id, fam, btrim(p_form ->> 'name'), lower(btrim(p_form ->> 'email')), btrim(p_form ->> 'phone'), true, 'Self');
    insert into student (studio_id, family_id, first_name, last_name, date_of_birth)
    values (st.id, fam, split_part(btrim(p_form ->> 'name'), ' ', 1),
            coalesce(nullif(regexp_replace(btrim(p_form ->> 'name'), '^\S+\s*', ''), ''), '—'),
            coalesce((p_form ->> 'date_of_birth')::date, current_date - interval '30 years')) returning id into kid;
    insert into emergency_contact (studio_id, student_id, full_name, phone, priority)
    values (st.id, kid, coalesce(nullif(btrim(p_form ->> 'emergency_name'), ''), 'Emergency contact'), btrim(p_form ->> 'emergency_phone'), 1);
  else
    select id into kid from student where family_id = fam and deleted_at is null order by created_at limit 1;
  end if;
  r := app.book_drop_in_unchecked(p_session, kid);
  return 'ok';
end $$;

-- ── Credit when the school cancels a class ─────────────────────────────────
-- Off by default; when on, every family with a child enrolled in a term- or
-- month-priced class gets that class's per-session value back as account
-- credit, once per child per cancelled session. Drop-ins are refunded by
-- cancelling the booking instead.
alter table studio add column credit_cancelled_classes boolean not null default false;
create table session_credit (
  session_id uuid not null references class_session(id) on delete cascade,
  student_id uuid not null references student(id) on delete cascade,
  payment_id uuid references payment(id) on delete set null,
  amount_minor integer not null,
  primary key (session_id, student_id)
);
alter table session_credit enable row level security; alter table session_credit force row level security;
create policy session_credit_read on session_credit for select using (
  exists (select 1 from class_session cs where cs.id = session_id and app.is_admin(cs.studio_id)) or student_id in (select app.guardian_student_ids()));
grant select on session_credit to authenticated;
grant all on session_credit to service_role;

create or replace function app.on_session_cancelled_credit() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c class; per int; e record; pay uuid;
begin
  if new.status <> 'cancelled' or old.status = 'cancelled' then return null; end if;
  if not (select credit_cancelled_classes from studio where id = new.studio_id) then return null; end if;
  select * into c from class where id = new.class_id;
  if c.pricing not in ('term', 'monthly') then return null; end if;
  per := case c.pricing
    when 'term' then round(c.price_minor::numeric / greatest(1, (select count(*) from class_session x where x.class_id = c.id and x.deleted_at is null)))::int
    else round(c.price_minor::numeric * 12 / 52)::int end;
  if per <= 0 then return null; end if;
  for e in select s.id, s.family_id, s.first_name, coalesce(en.price_minor, c.price_minor) price from enrolment en join student s on s.id = en.student_id
            where en.class_id = c.id and en.status = 'active' and en.deleted_at is null loop
    continue when exists (select 1 from session_credit where session_id = new.id and student_id = e.id);
    insert into payment (studio_id, family_id, amount_minor, method, succeeded_at, note, recorded_by)
    values (new.studio_id, e.family_id, per, 'credit', now(),
            'Credit: ' || c.name || ' cancelled ' || to_char(new.starts_at, 'FMDD Mon') || ' (' || e.first_name || ')', auth.uid())
    returning id into pay;
    insert into session_credit (session_id, student_id, payment_id, amount_minor) values (new.id, e.id, pay, per);
    perform app.allocate_account_credit(e.family_id);
    perform app.recalc_family_balance(e.family_id);
  end loop;
  return null;
end $$;
create trigger session_cancelled_credit after update of status on class_session
  for each row execute function app.on_session_cancelled_credit();

revoke all on function app.buy_pack(uuid, uuid), app.book_drop_in(uuid, uuid), app.cancel_drop_in(uuid),
  app.drop_in_sessions(uuid, int), app.public_adult_drop_in(text, uuid, jsonb), app.session_taken(uuid) from public;
revoke all on function app.book_drop_in_unchecked(uuid, uuid) from public, authenticated, anon;
grant execute on function app.buy_pack(uuid, uuid), app.book_drop_in(uuid, uuid), app.cancel_drop_in(uuid),
  app.drop_in_sessions(uuid, int), app.session_taken(uuid) to authenticated, service_role;
grant execute on function app.drop_in_sessions(uuid, int) to anon;
grant execute on function app.public_adult_drop_in(text, uuid, jsonb) to authenticated, anon;

-- A family sees the sessions it has booked into, as it does its enrolled ones.
create or replace function app.my_drop_in_session_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select d.session_id from drop_in_booking d where d.status = 'booked'
     and (d.student_id in (select app.guardian_student_ids()) or d.student_id = app.student_self_id());
$$;
grant execute on function app.my_drop_in_session_ids() to authenticated;
create policy session_dropin_read on class_session for select
  using (deleted_at is null and id in (select app.my_drop_in_session_ids()));

create or replace function app.public_drop_in_sessions(p_slug text)
  returns table (session_id uuid, class_name text, style text, starts_at timestamptz, ends_at timestamptz,
                 price_minor int, places_left int, age_min smallint, age_max smallint)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select d.* from studio s, app.drop_in_sessions(s.id) d
   where s.slug = lower(p_slug) and s.deleted_at is null and app.studio_writable(s.id);
$$;
grant execute on function app.public_drop_in_sessions(text) to authenticated, anon;
