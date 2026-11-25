-- ============================================================================
-- 0040 · Public forms, pay before use, retention completeness
--        (R-048, R-049, R-052)
-- ----------------------------------------------------------------------------
-- Public forms
--   · The form must confirm the visitor has read who collects their data and
--     why (the school's privacy notice, linked from the form). Contact for
--     news and offers is a separate, unticked choice.
--   · A submission log limits each email and each network address to five
--     public bookings an hour, and each school to 100. The hosted server
--     route that fronts these functions passes the caller's address as
--     `_ip`; the browser's own value is overwritten there.
--
-- Pay before use (school setting, off by default)
--   · A class pack can be used once its invoice is paid, or while the family
--     owes no more than the school's "on account" limit.
--   · A drop-in with no pack needs the same: within the limit, or paid first.
--   · A public adult booking is held for 30 minutes against its invoice and
--     confirmed when the invoice is paid; an unpaid hold lapses.
--
-- Retention
--   · Prospects: enquiries with no activity for 90 days (school-adjustable),
--     and the prospect records made for their trials, are removed.
--   · Financial: once every child in a family has been anonymised and the
--     newest invoice is older than the financial period, the family and
--     guardian names and contact details are replaced; amounts stay.
--   · Closed safeguarding concerns: kept until the school sets a period from
--     its safeguarding policy (often until the child is 25); then deleted.
-- ============================================================================

-- ── Public forms ───────────────────────────────────────────────────────────
alter table studio add column privacy_notice_url text
  check (privacy_notice_url is null or privacy_notice_url ~ '^https?://');
alter table enquiry add column marketing_consent boolean not null default false;
alter table guardian add column marketing_consent boolean not null default false;

create table public_submission (
  id         bigint generated always as identity primary key,
  studio_id  uuid not null references studio(id) on delete cascade,
  kind       text not null,
  email      text,
  ip         text,
  at         timestamptz not null default now()
);
create index public_submission_recent on public_submission (studio_id, at);
alter table public_submission enable row level security; alter table public_submission force row level security;
grant all on public_submission to service_role;   -- no user reads it

create or replace function app.public_guard(p_studio uuid, p_kind text, p_form jsonb) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare em text := lower(btrim(p_form ->> 'contact_email')); v_ip text := nullif(btrim(p_form ->> '_ip'), '');
begin
  em := coalesce(em, lower(btrim(p_form ->> 'email')));
  if coalesce(p_form ->> 'privacy_ack', '') not in ('true', 't', 'yes', 'on') then
    raise exception 'INVALID: please confirm you have read how the school uses your details' using errcode = 'check_violation';
  end if;
  delete from public_submission where at < now() - interval '1 day';
  if (select count(*) from public_submission ps where ps.studio_id = p_studio and ps.at > now() - interval '1 hour'
        and ((em is not null and ps.email = em) or (v_ip is not null and ps.ip = v_ip))) >= 5
     or (select count(*) from public_submission where studio_id = p_studio and at > now() - interval '1 hour') >= 100 then
    raise exception 'RATE_LIMITED: too many bookings in a short time — please try again later or call the school'
      using errcode = 'check_violation';
  end if;
  insert into public_submission (studio_id, kind, email, ip) values (p_studio, p_kind, em, v_ip);
end $$;
revoke all on function app.public_guard(uuid, text, jsonb) from public, authenticated, anon;

drop function if exists app.public_school(text);
create function app.public_school(p_slug text)
  returns table (name text, brand_colour text, logo_url text, open boolean, theme text, brand_secondary text, privacy_notice_url text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.name, s.brand_colour, s.logo_url, app.studio_writable(s.id), s.theme, s.brand_secondary, s.privacy_notice_url
    from studio s where s.slug = lower(p_slug) and s.deleted_at is null;
$$;
revoke all on function app.public_school(text) from public;
grant execute on function app.public_school(text) to authenticated, anon;

create or replace function app.public_book_trial(p_slug text, p_session uuid, p_form jsonb) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare st studio; cs record; enq uuid; tid uuid; dob date;
begin
  select * into st from studio where slug = lower(p_slug) and deleted_at is null;
  if st.id is null or not app.studio_writable(st.id) then
    raise exception 'NOT_FOUND: that school' using errcode = 'no_data_found';
  end if;
  if coalesce(p_form ->> 'website', '') <> '' then return 'ok'; end if;   -- quietly drop bots
  if coalesce(btrim(p_form ->> 'contact_name'), '') = '' or coalesce(btrim(p_form ->> 'child_name'), '') = ''
     or coalesce(btrim(p_form ->> 'contact_phone'), '') = '' or coalesce(p_form ->> 'contact_email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'INVALID: please give your name, email, a phone number and your child''s name' using errcode = 'check_violation';
  end if;
  dob := (p_form ->> 'child_dob')::date;
  if dob is null or dob > current_date or dob < current_date - interval '100 years' then
    raise exception 'INVALID: please check your child''s date of birth' using errcode = 'check_violation';
  end if;
  select s.id, s.class_id, c.trial_price_minor into cs
    from app.public_trial_sessions(p_slug) p join class_session s on s.id = p.session_id
    join class c on c.id = s.class_id where p.session_id = p_session;
  if cs.id is null then
    raise exception 'INVALID: that class is full or no longer open for trials — please pick another' using errcode = 'check_violation';
  end if;
  -- One booking per email per session, so a double-click is not two trials.
  if exists (select 1 from trial t join enquiry e on e.id = t.enquiry_id
              where t.session_id = cs.id and lower(e.contact_email) = lower(btrim(p_form ->> 'contact_email'))
                and lower(e.child_name) = lower(btrim(p_form ->> 'child_name')) and t.deleted_at is null) then
    return 'ok';
  end if;
  perform app.public_guard(st.id, 'trial', p_form);
  insert into enquiry (studio_id, stage, contact_name, contact_email, contact_phone, child_name, child_dob,
                       interest_class_id, source, marketing_consent)
  values (st.id, 'trial_booked', btrim(p_form ->> 'contact_name'), lower(btrim(p_form ->> 'contact_email')),
          btrim(p_form ->> 'contact_phone'), btrim(p_form ->> 'child_name'), dob, cs.class_id, 'website',
          coalesce(p_form ->> 'marketing', '') in ('true', 't', 'yes', 'on'))
  returning id into enq;
  insert into trial (studio_id, class_id, session_id, enquiry_id, status, price_minor)
  values (st.id, cs.class_id, cs.id, enq, 'booked', cs.trial_price_minor)
  returning id into tid;
  perform app.ensure_trial_student(tid);
  return 'ok';
end $$;

-- ── Pay before use ─────────────────────────────────────────────────────────
alter table studio add column pay_before_use boolean not null default false;
alter table studio add column account_limit_minor integer not null default 0 check (account_limit_minor >= 0);

alter table drop_in_booking drop constraint drop_in_booking_status_check;
alter table drop_in_booking add constraint drop_in_booking_status_check check (status in ('booked', 'held', 'cancelled'));
alter table drop_in_booking add column held_until timestamptz;
drop index drop_in_once;
create unique index drop_in_once on drop_in_booking (session_id, student_id) where status in ('booked', 'held');

create or replace function app.family_owed(p_family uuid) returns bigint
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(sum(total_minor - paid_minor), 0)::bigint from invoice
   where family_id = p_family and deleted_at is null and status in ('issued', 'part_paid') and total_minor > paid_minor;
$$;

-- May this family take something worth p_extra now and pay later?
create or replace function app.on_account_ok(p_family uuid, p_extra bigint) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select not st.pay_before_use or app.family_owed(f.id) + p_extra <= st.account_limit_minor
    from family f join studio st on st.id = f.studio_id where f.id = p_family;
$$;

-- Lapsed holds give their place back and their invoice is voided.
create or replace function app.expire_held_drop_ins() returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare b record; n int := 0;
begin
  for b in update drop_in_booking set status = 'cancelled', cancelled_at = now()
            where status = 'held' and held_until < now() returning invoice_id loop
    n := n + 1;
    if b.invoice_id is not null then
      update invoice set status = 'void', voided_at = now(), void_reason = 'Unpaid booking hold lapsed'
       where id = b.invoice_id and paid_minor = 0 and status = 'issued';
      perform app.recalc_family_balance((select family_id from invoice where id = b.invoice_id));
    end if;
  end loop;
  return n;
end $$;

create or replace function app.session_taken(p_session uuid) returns int
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select app.class_enrolled_count(cs.class_id)
       + (select count(*)::int from trial t where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null)
       + (select count(*)::int from drop_in_booking d where d.session_id = cs.id
            and (d.status = 'booked' or (d.status = 'held' and d.held_until > now())))
    from class_session cs where cs.id = p_session;
$$;

-- p_hold: a public booking that waits for payment instead of being refused.
drop function if exists app.book_drop_in_unchecked(uuid, uuid);
create function app.book_drop_in_unchecked(p_session uuid, p_student uuid, p_hold boolean default false) returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; s student; pk pack_purchase; inv uuid; bid uuid; held boolean := false;
begin
  perform app.expire_held_drop_ins();
  select x.*, c.name cname, c.price_minor, c.pricing, c.capacity, c.studio_id sid into cs
    from class_session x join class c on c.id = x.class_id where x.id = p_session and x.deleted_at is null;
  select * into s from student where id = p_student and deleted_at is null;
  if cs.id is null or s.id is null or s.studio_id <> cs.sid then raise exception 'NOT_FOUND: that class' using errcode = 'no_data_found'; end if;
  if cs.pricing <> 'drop_in' then raise exception 'INVALID: % is booked by the term, not class by class', cs.cname using errcode = 'check_violation'; end if;
  if cs.status <> 'scheduled' or cs.starts_at < now() then raise exception 'INVALID: that class is not open for booking' using errcode = 'check_violation'; end if;
  if app.session_taken(cs.id) >= cs.capacity then raise exception 'INVALID: that class is full — try another date' using errcode = 'check_violation'; end if;
  if exists (select 1 from drop_in_booking where session_id = cs.id and student_id = s.id and status in ('booked', 'held')) then
    raise exception 'INVALID: % is already booked in', s.first_name using errcode = 'check_violation';
  end if;
  if not exists (select 1 from emergency_contact where student_id = s.id and deleted_at is null) then
    raise exception 'INVALID: add an emergency contact for % first', s.first_name using errcode = 'check_violation';
  end if;
  -- A pack counts once paid, or while the family is within its limit.
  select p.* into pk from pack_purchase p left join invoice i on i.id = p.invoice_id
   where p.student_id = s.id and p.remaining > 0 and p.expires_on >= cs.starts_at::date
     and (i.id is null or i.status = 'paid' or app.on_account_ok(s.family_id, 0))
   order by p.expires_on limit 1 for update of p;
  if pk.id is not null then
    update pack_purchase set remaining = remaining - 1 where id = pk.id;
  elsif cs.price_minor > 0 then
    if not app.on_account_ok(s.family_id, cs.price_minor) then
      if not p_hold then
        raise exception 'INVALID: PAY_FIRST: please settle what is owed before booking more classes on account' using errcode = 'check_violation';
      end if;
      held := true;
    end if;
    inv := app.create_invoice_internal(s.family_id, jsonb_build_array(jsonb_build_object('kind', 'tuition',
             'description', cs.cname || ' — ' || to_char(cs.starts_at, 'FMDD Mon') || ' — ' || s.first_name,
             'quantity', 1, 'unit_minor', cs.price_minor, 'student_id', s.id, 'class_id', cs.class_id)),
             case when held then current_date else cs.starts_at::date end, null, 0, true, null);
  end if;
  insert into drop_in_booking (studio_id, session_id, student_id, pack_purchase_id, invoice_id, price_minor, booked_by, status, held_until)
  values (s.studio_id, cs.id, s.id, pk.id, inv, case when pk.id is null then cs.price_minor else 0 end, auth.uid(),
          case when held then 'held' else 'booked' end, case when held then now() + interval '30 minutes' end)
  returning id into bid;
  return jsonb_build_object('id', bid, 'paid_with', case when held then 'hold' when pk.id is not null then 'pack' when inv is not null then 'invoice' else 'free' end,
                            'invoice_id', inv, 'pack_left', case when pk.id is not null then pk.remaining - 1 end);
end $$;
revoke all on function app.book_drop_in_unchecked(uuid, uuid, boolean) from public, authenticated, anon;

create or replace function app.book_drop_in(p_session uuid, p_student uuid) returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not exists (select 1 from student s where s.id = p_student and s.deleted_at is null
                   and (s.id in (select app.guardian_student_ids()) or app.is_admin(s.studio_id))) then
    raise exception 'FORBIDDEN: not your dancer' using errcode = 'insufficient_privilege';
  end if;
  return app.book_drop_in_unchecked(p_session, p_student, false);
end $$;

-- Paying the invoice confirms a held place.
create or replace function app.on_invoice_paid_confirm_hold() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.status = 'paid' and old.status <> 'paid' then
    update drop_in_booking set status = 'booked', held_until = null where invoice_id = new.id and status = 'held';
  end if;
  return null;
end $$;
create trigger invoice_paid_confirm_hold after update of status on invoice
  for each row execute function app.on_invoice_paid_confirm_hold();

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
  perform app.public_guard(st.id, 'drop_in', p_form);
  select g.family_id into fam from guardian g where g.studio_id = st.id and lower(g.email) = lower(btrim(p_form ->> 'email')) and g.deleted_at is null limit 1;
  if fam is null then
    insert into family (studio_id, name) values (st.id, regexp_replace(btrim(p_form ->> 'name'), '^.*\s', '') || ' (adult)') returning id into fam;
    insert into guardian (studio_id, family_id, full_name, email, phone, is_primary, relationship, marketing_consent)
    values (st.id, fam, btrim(p_form ->> 'name'), lower(btrim(p_form ->> 'email')), btrim(p_form ->> 'phone'), true, 'Self',
            coalesce(p_form ->> 'marketing', '') in ('true', 't', 'yes', 'on'));
    insert into student (studio_id, family_id, first_name, last_name, date_of_birth)
    values (st.id, fam, split_part(btrim(p_form ->> 'name'), ' ', 1),
            coalesce(nullif(regexp_replace(btrim(p_form ->> 'name'), '^\S+\s*', ''), ''), '—'),
            coalesce((p_form ->> 'date_of_birth')::date, current_date - interval '30 years')) returning id into kid;
    insert into emergency_contact (studio_id, student_id, full_name, phone, priority)
    values (st.id, kid, coalesce(nullif(btrim(p_form ->> 'emergency_name'), ''), 'Emergency contact'), btrim(p_form ->> 'emergency_phone'), 1);
  else
    select id into kid from student where family_id = fam and deleted_at is null order by created_at limit 1;
  end if;
  r := app.book_drop_in_unchecked(p_session, kid, true);
  return case when r ->> 'paid_with' = 'hold' then 'held' else 'ok' end;
end $$;

-- ── Retention ──────────────────────────────────────────────────────────────
alter table retention_policy add column prospect_days smallint not null default 90 check (prospect_days between 30 and 730);
alter table retention_policy add column concern_months smallint check (concern_months is null or concern_months between 12 and 600);

drop function if exists app.apply_retention(uuid, boolean);
create function app.apply_retention(p_studio uuid, p_apply boolean default false)
  returns table (step text, student_id uuid, who text, left_on date)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare pol retention_policy; r record;
begin
  if not app.has_role(p_studio, 'owner') then
    raise exception 'FORBIDDEN: only the owner runs data retention' using errcode = 'insufficient_privilege';
  end if;
  select * into pol from retention_policy where studio_id = p_studio;
  for r in select s.id, s.first_name || ' ' || s.last_name as who, app.leaver_since(s.id) as since,
                  exists (select 1 from medical_record m where m.student_id = s.id and m.deleted_at is null) as has_medical,
                  s.first_name = 'Former' as anonymised
             from student s join family f on f.id = s.family_id
            where s.studio_id = p_studio and s.deleted_at is null and not f.is_prospect loop
    continue when r.since is null;
    if r.has_medical and r.since < current_date - make_interval(months => pol.medical_months) then
      step := 'medical'; student_id := r.id; who := r.who; left_on := r.since; return next;
      if p_apply then
        delete from medical_record where medical_record.student_id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'medical_record', r.id, 'Medical record deleted: left ' || r.since);
      end if;
    end if;
    if not r.anonymised and r.since < current_date - make_interval(months => pol.personal_months) then
      step := 'anonymise'; student_id := r.id; who := r.who; left_on := r.since; return next;
      if p_apply then
        delete from emergency_contact where emergency_contact.student_id = r.id;
        delete from consent_record where consent_record.student_id = r.id;
        delete from student_reflection where student_reflection.student_id = r.id;
        update feedback_note set private_note = null, going_well = null, work_on = null where feedback_note.student_id = r.id;
        update student set first_name = 'Former', last_name = 'student',
               date_of_birth = make_date(extract(year from date_of_birth)::int, 1, 1), user_id = null, login_enabled = false,
               updated_at = now() where id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'student', r.id, 'Details anonymised: left ' || r.since);
      end if;
    end if;
  end loop;

  -- Prospects who never went further.
  for r in select e.id, e.child_name, e.contact_name, greatest(e.updated_at, (select max(cs.starts_at) from trial t
                  join class_session cs on cs.id = t.session_id where t.enquiry_id = e.id))::date last_seen
             from enquiry e where e.studio_id = p_studio and e.deleted_at is null and e.stage <> 'enrolled' loop
    continue when r.last_seen >= current_date - pol.prospect_days;
    step := 'prospect'; student_id := null; who := coalesce(r.child_name, r.contact_name); left_on := r.last_seen; return next;
    if p_apply then
      delete from enquiry where id = r.id;
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'enquiry', r.id, 'Enquiry removed: no activity since ' || r.last_seen);
    end if;
  end loop;
  for r in select f.id, f.name, f.created_at::date made from family f
            where f.studio_id = p_studio and f.deleted_at is null and f.is_prospect
              and f.created_at < now() - make_interval(days => pol.prospect_days)
              and not exists (select 1 from student s join trial t on t.student_id = s.id join class_session cs on cs.id = t.session_id
                               where s.family_id = f.id and cs.starts_at > now() - make_interval(days => pol.prospect_days))
              and not exists (select 1 from invoice i where i.family_id = f.id and i.deleted_at is null) loop
    step := 'prospect'; student_id := null; who := r.name; left_on := r.made; return next;
    if p_apply then
      delete from emergency_contact where emergency_contact.student_id in (select id from student where family_id = r.id);
      delete from medical_record where medical_record.student_id in (select id from student where family_id = r.id);
      update student set first_name = 'Former', last_name = 'prospect', date_of_birth = make_date(extract(year from date_of_birth)::int, 1, 1),
             deleted_at = now() where family_id = r.id;
      update guardian set full_name = 'Former prospect', email = null, phone = null, user_id = null, deleted_at = now() where family_id = r.id;
      update family set name = 'Former prospect', address_line1 = null, address_line2 = null, city = null, postcode = null,
             notes = null, deleted_at = now() where id = r.id;
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'family', r.id, 'Prospect record removed');
    end if;
  end loop;

  -- Families whose children have all been anonymised and whose last invoice
  -- is past the financial period.
  for r in select f.id, f.name, (select max(coalesce(i.issued_on, i.created_at::date)) from invoice i where i.family_id = f.id) last_inv
             from family f where f.studio_id = p_studio and f.deleted_at is null and not f.is_prospect and f.name <> 'Former family'
              and exists (select 1 from student s where s.family_id = f.id)
              and not exists (select 1 from student s where s.family_id = f.id and s.deleted_at is null and s.first_name <> 'Former') loop
    continue when r.last_inv is not null and r.last_inv >= current_date - make_interval(months => pol.financial_months);
    step := 'financial'; student_id := null; who := r.name; left_on := r.last_inv; return next;
    if p_apply then
      update guardian set full_name = 'Former guardian', email = null, phone = null, user_id = null where family_id = r.id;
      update family set name = 'Former family', address_line1 = null, address_line2 = null, city = null, postcode = null, notes = null
       where id = r.id;
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'family', r.id, 'Family details anonymised; invoices kept');
    end if;
  end loop;

  -- Closed safeguarding concerns, once the school has set a period.
  if pol.concern_months is not null then
    for r in select c.id, c.updated_at::date closed from safeguarding_concern c
              where c.studio_id = p_studio and c.status = 'closed'
                and c.updated_at < now() - make_interval(months => pol.concern_months) loop
      step := 'concern'; student_id := null; who := 'Closed concern'; left_on := r.closed; return next;
      if p_apply then
        delete from safeguarding_concern where id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'safeguarding_concern', r.id, 'Closed concern deleted: closed ' || r.closed);
      end if;
    end loop;
  end if;

  if p_apply then update retention_policy set last_run_at = now() where studio_id = p_studio; end if;
end $$;

create or replace function app.tick() returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s record; auto int := 0; released int := 0; checks int := 0; holds int;
begin
  holds := app.expire_held_drop_ins();
  for s in select id from studio where deleted_at is null and app.studio_writable(id) loop
    auto := auto + coalesce(app.run_automations(s.id), 0);
    released := released + app.release_scheduled(s.id);
    checks := checks + app.remind_staff_checks(s.id);
    perform app.award_event_milestones(s.id);
  end loop;
  return jsonb_build_object('automations', auto, 'released', released, 'staff_checks', checks, 'holds_lapsed', holds, 'at', now());
end $$;

revoke all on function app.family_owed(uuid), app.on_account_ok(uuid, bigint), app.expire_held_drop_ins(), app.apply_retention(uuid, boolean) from public;
revoke all on function app.expire_held_drop_ins() from authenticated, anon;
grant execute on function app.family_owed(uuid), app.on_account_ok(uuid, bigint) to authenticated;
grant execute on function app.apply_retention(uuid, boolean) to authenticated;
grant execute on function app.expire_held_drop_ins() to service_role;
