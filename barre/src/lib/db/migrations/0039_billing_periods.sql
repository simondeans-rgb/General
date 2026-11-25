-- ============================================================================
-- 0039 · Monthly billing runs, family discounts, aged debt (R-050, R-056, R-055)
-- ----------------------------------------------------------------------------
-- Billing runs now cover a period: the term, or one month of it.
--   · A term run bills term-priced and course-priced classes.
--   · A month run bills monthly-priced classes for that month only, pro rata
--     by sessions for a child who joins part-way through the month.
-- Each line records the period it covers, so re-running a period raises
-- nothing new — exactly as term runs already behaved.
--
-- Family discounts sit alongside the school-wide rules: a bursary or staff
-- rate as a percentage (applied after the sibling/multi-class rule) or a
-- fixed amount off each invoice. A bursary is shown to the family simply as
-- "Discount", never with its reason.
-- ============================================================================

alter table invoice_item add column period_start date;
alter table billing_run add column period_month date;

create table family_discount (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  family_id   uuid not null references family(id) on delete cascade,
  kind        text not null check (kind in ('percent', 'fixed')),
  amount      integer not null check (amount > 0),            -- percent (1–100) or pence per invoice
  reason      text not null check (reason in ('bursary', 'staff', 'loyalty', 'other')),
  note        text,                                            -- office only
  starts_on   date not null default current_date,
  ends_on     date,
  created_by  uuid references user_account(id) on delete set null,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  check (kind <> 'percent' or amount <= 100),
  check (ends_on is null or ends_on >= starts_on)
);
alter table family_discount enable row level security; alter table family_discount force row level security;
create policy family_discount_admin on family_discount for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
grant select, insert, update on family_discount to authenticated;
grant all on family_discount to service_role;
create or replace function app.stamp_family_discount() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin select studio_id into new.studio_id from family where id = new.family_id; new.created_by := coalesce(new.created_by, auth.uid()); return new; end $$;
create trigger family_discount_stamp before insert on family_discount for each row execute function app.stamp_family_discount();

-- The discount a family has during a period (one of each kind at most counts).
create or replace function app.family_discounts_on(p_family uuid, p_from date, p_to date)
  returns table (pct int, fixed int)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(max(amount) filter (where kind = 'percent'), 0)::int, coalesce(max(amount) filter (where kind = 'fixed'), 0)::int
    from family_discount where family_id = p_family and deleted_at is null
     and starts_on <= p_to and (ends_on is null or ends_on >= p_from);
$$;

drop function if exists app.billing_lines(uuid);
create function app.billing_lines(p_term uuid, p_month date default null)
  returns table (family_id uuid, family_name text, student_id uuid, student_name text,
                 class_id uuid, class_name text, description text, quantity numeric,
                 unit_minor int, discount_minor int, discount_reason text, period_start date)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare sid uuid; t term; m0 date; m1 date; pstart date;
begin
  select * into t from term where id = p_term and deleted_at is null;
  sid := t.studio_id;
  perform app.require_admin(sid);
  if p_month is not null then
    m0 := greatest(date_trunc('month', p_month)::date, t.starts_on);
    m1 := least((date_trunc('month', p_month) + interval '1 month - 1 day')::date, t.ends_on);
    if m0 > m1 then raise exception 'INVALID: that month is outside the term' using errcode = 'check_violation'; end if;
    pstart := date_trunc('month', p_month)::date;
  else
    m0 := t.starts_on; m1 := t.ends_on; pstart := t.starts_on;
  end if;
  return query
  with base as (
    select f.id fam, f.name fname, s.id stu, s.first_name || ' ' || s.last_name sname,
           c.id cls, c.name cname, c.pricing,
           coalesce(e.price_minor, c.price_minor) price, greatest(e.started_on, m0) from_day,
           (select count(*) from class_session cs where cs.class_id = c.id and cs.deleted_at is null and cs.status <> 'cancelled'
              and cs.starts_at::date between m0 and m1) total_sessions,
           (select count(*) from class_session cs where cs.class_id = c.id and cs.deleted_at is null and cs.status <> 'cancelled'
              and cs.starts_at::date between greatest(e.started_on, m0) and m1) left_sessions
      from enrolment e
      join class c on c.id = e.class_id and c.deleted_at is null and c.term_id = t.id
      join student s on s.id = e.student_id and s.deleted_at is null
      join family f on f.id = s.family_id and f.deleted_at is null and not f.is_prospect
     where e.deleted_at is null and e.status = 'active' and e.started_on <= m1
       and coalesce(e.price_minor, c.price_minor) > 0
       and (case when p_month is null then c.pricing in ('term', 'one_off') else c.pricing = 'monthly' end)
       -- Already billed for this period.
       and not exists (
         select 1 from invoice_item ii join invoice i on i.id = ii.invoice_id
          where ii.student_id = s.id and ii.class_id = c.id and ii.deleted_at is null
            and i.deleted_at is null and i.status not in ('void', 'refunded') and i.term_id = t.id
            and (p_month is null or ii.period_start = pstart))
  ),
  priced as (
    select b.*, 1::numeric qty,
      case when b.pricing in ('term', 'monthly') and b.from_day > m0 and b.total_sessions > 0
           then round(b.price::numeric * b.left_sessions / b.total_sessions)::int else b.price end unit,
      case when b.pricing = 'one_off' then b.cname || ' — course fee'
           when b.from_day > m0 and b.total_sessions > 0
             then format('%s — %s, %s of %s classes from %s', b.cname,
                         case when p_month is null then t.name else to_char(pstart, 'FMMonth YYYY') end,
                         b.left_sessions, b.total_sessions, to_char(b.from_day, 'FMDD Mon'))
           else b.cname || ' — ' || case when p_month is null then t.name else to_char(pstart, 'FMMonth YYYY') end end descr
      from base b
  ),
  ranked as (
    select p.*,
      dense_rank() over (partition by p.fam order by child_total desc, p.stu) child_rank,
      row_number() over (partition by p.stu order by p.unit * p.qty desc, p.cls) class_rank
      from (select p.*, sum(p.unit * p.qty) over (partition by p.stu) child_total from priced p) p
  ),
  rules as (
    select (select percent from discount_rule where studio_id = sid and kind = 'sibling' and enabled and deleted_at is null) sib_pct,
           (select from_nth from discount_rule where studio_id = sid and kind = 'sibling' and enabled and deleted_at is null) sib_n,
           (select percent from discount_rule where studio_id = sid and kind = 'multi_class' and enabled and deleted_at is null) mc_pct,
           (select from_nth from discount_rule where studio_id = sid and kind = 'multi_class' and enabled and deleted_at is null) mc_n
  ),
  disc as (
    select r.*,
      case when rules.sib_pct is not null and r.child_rank >= rules.sib_n then rules.sib_pct else 0 end sib,
      case when rules.mc_pct is not null and r.class_rank >= rules.mc_n then rules.mc_pct else 0 end mc,
      (select fd.pct from app.family_discounts_on(r.fam, m0, m1) fd) fam_pct
      from ranked r, rules
  )
  select d.fam, d.fname, d.stu, d.sname, d.cls, d.cname, d.descr, d.qty, d.unit,
         -- The rule first, then the family's own percentage on what remains.
         round(d.unit * d.qty * (1 - (1 - greatest(d.sib, d.mc) / 100.0) * (1 - d.fam_pct / 100.0)))::int,
         nullif(concat_ws(' + ',
           case when greatest(d.sib, d.mc) = 0 then null
                when d.sib >= d.mc then d.sib || '% sibling discount' else d.mc || '% multi-class discount' end,
           case when d.fam_pct > 0 then d.fam_pct || '% discount' end), ''),
         pstart
    from disc d
   order by d.fname, d.sname, d.cname;
end $$;

drop function if exists app.create_billing_run(uuid, date);
create function app.create_billing_run(p_term uuid, p_due date default null, p_month date default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; run uuid; fam record; inv uuid; n int := 0; tot bigint := 0; fixed int; pm date := date_trunc('month', p_month)::date; t term;
begin
  select * into t from term where id = p_term and deleted_at is null;
  sid := t.studio_id;
  perform app.require_admin(sid);
  if not app.studio_writable(sid) then
    raise exception 'FORBIDDEN: this school is read-only' using errcode = 'insufficient_privilege';
  end if;
  if exists (select 1 from billing_run where term_id = p_term and status = 'draft' and period_month is not distinct from pm) then
    raise exception 'INVALID: there is already a draft run for this period — issue or discard it first' using errcode = 'check_violation';
  end if;
  insert into billing_run (studio_id, term_id, due_on, created_by, period_month)
  values (sid, p_term, coalesce(p_due, current_date + 14), auth.uid(), pm) returning id into run;

  for fam in
    select l.family_id, jsonb_agg(jsonb_build_object(
             'kind', 'tuition', 'description', l.description, 'quantity', l.quantity,
             'unit_minor', l.unit_minor, 'discount_minor', l.discount_minor,
             'student_id', l.student_id, 'class_id', l.class_id)) items, min(l.period_start) ps
      from app.billing_lines(p_term, pm) l group by l.family_id
  loop
    select fd.fixed into fixed from app.family_discounts_on(fam.family_id, coalesce(pm, t.starts_on),
                                                         coalesce((pm + interval '1 month - 1 day')::date, t.ends_on)) fd;
    inv := app.create_invoice(fam.family_id, fam.items, coalesce(p_due, current_date + 14), null,
                              least(coalesce(fixed, 0), (select sum((x ->> 'unit_minor')::int * (x ->> 'quantity')::numeric - (x ->> 'discount_minor')::int)
                                                          from jsonb_array_elements(fam.items) x)::int),
                              false, p_term);
    update invoice set billing_run_id = run where id = inv;
    update invoice_item set period_start = fam.ps where invoice_id = inv;
    n := n + 1;
    tot := tot + (select total_minor from invoice where id = inv);
  end loop;
  if n = 0 then
    delete from billing_run where id = run;
    raise exception 'INVALID: everyone has already been invoiced for this period' using errcode = 'check_violation';
  end if;
  update billing_run set invoice_count = n, total_minor = tot where id = run;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'create', 'billing_run', run, n || ' draft invoices' || coalesce(' for ' || to_char(pm, 'FMMonth YYYY'), ''));
  return run;
end $$;

-- Who owes what, by how long it has been owed (R-055).
create or replace function app.aged_debt(p_studio uuid)
  returns table (family_id uuid, family_name text, current_minor bigint, d31_60 bigint, d61_90 bigint, d90_plus bigint, total bigint)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  perform app.require_admin(p_studio);
  return query
  select f.id, f.name,
         coalesce(sum(i.total_minor - i.paid_minor) filter (where current_date - i.due_on <= 30), 0)::bigint,
         coalesce(sum(i.total_minor - i.paid_minor) filter (where current_date - i.due_on between 31 and 60), 0)::bigint,
         coalesce(sum(i.total_minor - i.paid_minor) filter (where current_date - i.due_on between 61 and 90), 0)::bigint,
         coalesce(sum(i.total_minor - i.paid_minor) filter (where current_date - i.due_on > 90), 0)::bigint,
         sum(i.total_minor - i.paid_minor)::bigint
    from invoice i join family f on f.id = i.family_id
   where i.studio_id = p_studio and i.deleted_at is null and i.status in ('issued', 'part_paid', 'refunded')
     and i.total_minor > i.paid_minor
   group by f.id, f.name order by 7 desc;
end $$;

revoke all on function app.billing_lines(uuid, date), app.create_billing_run(uuid, date, date), app.aged_debt(uuid),
  app.family_discounts_on(uuid, date, date) from public;
grant execute on function app.billing_lines(uuid, date), app.create_billing_run(uuid, date, date), app.aged_debt(uuid) to authenticated;
