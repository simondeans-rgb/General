-- ============================================================================
-- 0045 · Billing integrity, payment instructions, money notifications
--        (panel review: UR-10, UR-22, UR-23, UR-24, UR-46)
-- ----------------------------------------------------------------------------
-- 1. Credit notes. A refund on an invoice no longer turns a settled invoice
--    into debt: it issues a credit note that lowers what the invoice charges,
--    and records the money going back as a refund. A credit note can instead
--    be kept as credit on the family's account. Every refund is now a row,
--    so a family statement can list it with its date.
-- 2. Billing runs refuse to bill a family twice for a period. Invoices whose
--    lines name the class are still matched line by line (so a mid-term
--    joiner is billed); any other tuition invoice for the period — imported,
--    hand-made — skips the whole family, unless the office overrides it for
--    that family with a reason.
-- 3. Ending a family discount works. It used to soft-delete the row, which
--    the row-level policy then hid from its own RETURNING clause, so the
--    update failed. Ending now stamps ended_at and keeps the history.
-- 4. Goodwill credit has an entry point with a reason, and is logged.
-- 5. The school's bank details, so families can actually pay by transfer,
--    and a family reference for paying several invoices at once.
-- 6. Families hear about money in the app: a new invoice, a payment
--    received, an invoice due in three days, and a confirmed event place.
-- 7. A confirmed private lesson with a price raises a draft invoice, and
--    families can see everything coming up, with its state.
-- 8. Payment reminders to many overdue families at once, one per family,
--    each logged.
-- ============================================================================

-- Formatting money in messages written by the database.
create or replace function app.gbp(p_minor bigint) returns text
  language sql immutable as $$ select '£' || to_char(coalesce(p_minor, 0) / 100.0, 'FM999,999,990.00') $$;

-- ── 1. Credit notes and refunds ─────────────────────────────────────────────
create table credit_note (
  id             uuid primary key default gen_random_uuid(),
  studio_id      uuid not null references studio(id) on delete cascade,
  family_id      uuid not null references family(id) on delete restrict,
  invoice_id     uuid not null references invoice(id) on delete restrict,
  number         text not null,
  amount_minor   bigint not null check (amount_minor > 0),
  reason         text not null,
  -- Where the value went: off what the invoice still wanted, back to the
  -- family as money, or held on their account for the next invoice.
  applied_minor  bigint not null default 0,
  refunded_minor bigint not null default 0,
  account_minor  bigint not null default 0,
  created_by     uuid references user_account(id) on delete set null,
  created_at     timestamptz not null default now(),
  unique (studio_id, number),
  check (applied_minor + refunded_minor + account_minor = amount_minor)
);
create index credit_note_invoice on credit_note (invoice_id);
create index credit_note_family on credit_note (family_id);

create table refund (
  id             uuid primary key default gen_random_uuid(),
  studio_id      uuid not null references studio(id) on delete cascade,
  family_id      uuid not null references family(id) on delete restrict,
  payment_id     uuid not null references payment(id) on delete restrict,
  credit_note_id uuid references credit_note(id) on delete set null,
  amount_minor   bigint not null check (amount_minor > 0),
  reason         text not null,
  created_by     uuid references user_account(id) on delete set null,
  created_at     timestamptz not null default now()
);
create index refund_family on refund (family_id);
create index refund_payment on refund (payment_id);

-- The credit a credit note puts against an invoice (or on account) is a
-- `credit` payment row, as goodwill credit always was; this says which note.
alter table payment add column credit_note_id uuid references credit_note(id) on delete set null;

alter table credit_note enable row level security; alter table credit_note force row level security;
alter table refund      enable row level security; alter table refund      force row level security;
create policy credit_note_read on credit_note for select
  using (studio_id in (select app.studio_ids()) and (app.is_admin(studio_id) or family_id in (select app.guardian_family_ids())));
create policy refund_read on refund for select
  using (studio_id in (select app.studio_ids()) and (app.is_admin(studio_id) or family_id in (select app.guardian_family_ids())));
-- Written only by the functions below.
grant select on credit_note, refund to authenticated;
grant all on credit_note, refund to service_role;

-- Hand money back from an invoice's transfer and cash payments (newest
-- first, or the one named first). Card money goes back through the provider.
create or replace function app.refund_from_invoice(p_invoice uuid, p_amount bigint, p_reason text,
                                                   p_credit_note uuid, p_first uuid default null)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare p record; left_ bigint := p_amount; take bigint; avail bigint;
begin
  select coalesce(sum(amount_minor - refunded_minor), 0) into avail from payment
   where invoice_id = p_invoice and deleted_at is null and succeeded_at is not null
     and method in ('bank_transfer', 'cash');
  if avail < p_amount then
    raise exception 'INVALID: only % of this invoice was paid by transfer or cash, so only that can be handed back here — keep the rest as credit, or refund a card through the payment provider', app.gbp(avail)
      using errcode = 'check_violation';
  end if;
  for p in select * from payment
            where invoice_id = p_invoice and deleted_at is null and succeeded_at is not null
              and method in ('bank_transfer', 'cash') and amount_minor > refunded_minor
            order by (id = p_first) desc nulls last, created_at desc
  loop
    exit when left_ <= 0;
    take := least(left_, p.amount_minor - p.refunded_minor);
    update payment set refunded_minor = refunded_minor + take,
                       note = concat_ws(' · ', note, 'Refunded ' || app.gbp(take) || ': ' || btrim(p_reason))
     where id = p.id;
    insert into refund (studio_id, family_id, payment_id, credit_note_id, amount_minor, reason, created_by)
    values (p.studio_id, p.family_id, p.id, p_credit_note, take, btrim(p_reason), auth.uid());
    left_ := left_ - take;
  end loop;
end $$;
revoke all on function app.refund_from_invoice(uuid, bigint, text, uuid, uuid) from public, authenticated, anon;

-- p_settle: 'refund' — the whole amount comes off the invoice and goes back
--           to the family as money;
--           'account' — it comes off what the invoice still wants, and any
--           rest is held on the family's account for their next invoices.
create or replace function app.credit_note_internal(p_invoice uuid, p_amount bigint, p_reason text,
                                                    p_settle text, p_refund_first uuid default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare inv invoice; credited bigint; owed bigint; applied bigint; rest bigint; num text; cn uuid;
begin
  select * into inv from invoice where id = p_invoice and deleted_at is null;
  if inv.id is null then raise exception 'NOT_FOUND: invoice' using errcode = 'no_data_found'; end if;
  if inv.status in ('draft', 'void') then
    raise exception 'INVALID: a credit note is for an issued invoice — change or void a draft instead'
      using errcode = 'check_violation';
  end if;
  if p_settle not in ('refund', 'account') then
    raise exception 'INVALID: say whether the money goes back or stays as credit' using errcode = 'check_violation';
  end if;
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'INVALID: say why the family is being credited' using errcode = 'check_violation';
  end if;
  select coalesce(sum(amount_minor), 0) into credited from credit_note where invoice_id = inv.id;
  if coalesce(p_amount, 0) <= 0 or p_amount > inv.total_minor - credited then
    raise exception 'INVALID: at most % can be credited on this invoice', app.gbp(greatest(inv.total_minor - credited, 0))
      using errcode = 'check_violation';
  end if;

  owed := greatest(inv.total_minor - inv.paid_minor, 0);
  applied := case when p_settle = 'refund' then 0 else least(p_amount, owed) end;
  rest := p_amount - applied;

  perform pg_advisory_xact_lock(hashtext('credit-note-number:' || inv.studio_id::text));
  select 'CN-' || lpad((coalesce(max(nullif(regexp_replace(number, '\D', '', 'g'), '')::int), 1000) + 1)::text, 4, '0')
    into num from credit_note where studio_id = inv.studio_id;

  insert into credit_note (studio_id, family_id, invoice_id, number, amount_minor, reason,
                           applied_minor, refunded_minor, account_minor, created_by)
  values (inv.studio_id, inv.family_id, inv.id, num, p_amount, btrim(p_reason),
          applied, case when p_settle = 'refund' then rest else 0 end,
          case when p_settle = 'account' then rest else 0 end, auth.uid())
  returning id into cn;

  -- The credit itself. Against the invoice it lowers what is owed; held on
  -- account it waits for the next invoice.
  if p_settle = 'refund' or applied > 0 then
    insert into payment (studio_id, family_id, invoice_id, amount_minor, method, provider, succeeded_at,
                         note, recorded_by, credit_note_id)
    values (inv.studio_id, inv.family_id, inv.id, case when p_settle = 'refund' then p_amount else applied end,
            'credit', 'ledger', now(), num || ': ' || btrim(p_reason), auth.uid(), cn);
  end if;
  if p_settle = 'account' and rest > 0 then
    insert into payment (studio_id, family_id, invoice_id, amount_minor, method, provider, succeeded_at,
                         note, recorded_by, credit_note_id)
    values (inv.studio_id, inv.family_id, null, rest, 'credit', 'ledger', now(),
            num || ' (' || inv.number || '): ' || btrim(p_reason), auth.uid(), cn);
  end if;
  -- The money that goes back.
  if p_settle = 'refund' then
    perform app.refund_from_invoice(inv.id, p_amount, p_reason, cn, p_refund_first);
  end if;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (inv.studio_id, auth.uid(), 'credit', 'invoice', inv.id,
          num || ' on ' || inv.number || ', ' || app.gbp(p_amount)
          || case when p_settle = 'refund' then ' refunded' else ' as credit' end || ': ' || btrim(p_reason));

  if p_settle = 'account' and rest > 0 then perform app.allocate_account_credit_internal(inv.family_id); end if;
  return cn;
end $$;
revoke all on function app.credit_note_internal(uuid, bigint, text, text, uuid) from public, authenticated, anon;

create or replace function app.issue_credit_note(p_invoice uuid, p_amount bigint, p_reason text, p_settle text default 'account')
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  perform app.require_admin((select studio_id from invoice where id = p_invoice));
  return app.credit_note_internal(p_invoice, p_amount, p_reason, p_settle);
end $$;

-- Refunds. On an invoice, handing money back means the family was charged
-- less: a credit note, and the invoice stays settled (p_mode 'credit_note',
-- the default). An overpayment is simply handed back. 'mistake' is for a
-- payment recorded in error: it is reversed and the invoice is owed again.
drop function if exists app.refund_payment(uuid, bigint, text);
create function app.refund_payment(p_payment uuid, p_amount_minor bigint, p_reason text,
                                   p_mode text default 'credit_note')
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare p payment; left_ bigint; inv invoice; over bigint; plain bigint;
begin
  select * into p from payment where id = p_payment and deleted_at is null and succeeded_at is not null;
  if p.id is null then raise exception 'NOT_FOUND: payment' using errcode = 'no_data_found'; end if;
  perform app.require_admin(p.studio_id);
  if p.method in ('card', 'direct_debit') then
    raise exception 'INVALID: card and direct debit refunds are made with the payment provider'
      using errcode = 'check_violation';
  end if;
  if p.method in ('account', 'credit') then
    raise exception 'INVALID: credit is not money that can be refunded' using errcode = 'check_violation';
  end if;
  if p_mode not in ('credit_note', 'mistake') then
    raise exception 'INVALID: unknown kind of refund' using errcode = 'check_violation';
  end if;
  left_ := p.amount_minor - p.refunded_minor;
  if coalesce(p_amount_minor, 0) <= 0 or p_amount_minor > left_ then
    raise exception 'INVALID: a refund must be between 1p and the % not already refunded', app.gbp(left_)
      using errcode = 'check_violation';
  end if;
  if p.invoice_id is null and p_amount_minor > app.family_available_credit(p.family_id) then
    raise exception 'INVALID: that money has already been applied to invoices' using errcode = 'check_violation';
  end if;
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'INVALID: say why the payment is being refunded' using errcode = 'check_violation';
  end if;

  if p.invoice_id is not null and p_mode = 'credit_note' then
    select * into inv from invoice where id = p.invoice_id;
    over := greatest(inv.paid_minor - inv.total_minor, 0);
    plain := least(p_amount_minor, over);
  else
    plain := p_amount_minor;
  end if;

  if plain > 0 then
    update payment set refunded_minor = refunded_minor + plain,
                       note = concat_ws(' · ', note, 'Refunded ' || app.gbp(plain) || ': ' || btrim(p_reason))
     where id = p_payment;
    insert into refund (studio_id, family_id, payment_id, amount_minor, reason, created_by)
    values (p.studio_id, p.family_id, p.id, plain, btrim(p_reason), auth.uid());
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (p.studio_id, auth.uid(), 'refund', 'payment', p.id,
            app.gbp(plain) || case when p_mode = 'mistake' then ' reversed (recorded by mistake): ' else ' refunded: ' end || btrim(p_reason));
  end if;
  if p_amount_minor > plain then
    perform app.credit_note_internal(p.invoice_id, p_amount_minor - plain, p_reason, 'refund', p.id);
  end if;
end $$;

-- ── 4. Goodwill credit, with a reason, logged ───────────────────────────────
create or replace function app.add_family_credit(p_family uuid, p_amount_minor bigint, p_reason text)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; pid uuid;
begin
  select studio_id into sid from family where id = p_family and deleted_at is null;
  perform app.require_admin(sid);
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'INVALID: say why the family is being given credit' using errcode = 'check_violation';
  end if;
  pid := app.record_payment(p_family, p_amount_minor, 'credit', null, btrim(p_reason));
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'credit', 'family', p_family, app.gbp(p_amount_minor) || ' credit: ' || btrim(p_reason));
  return pid;
end $$;

grant execute on function app.issue_credit_note(uuid, bigint, text, text),
                          app.refund_payment(uuid, bigint, text, text),
                          app.add_family_credit(uuid, bigint, text) to authenticated;

-- ── 2. Billing runs: one bill per family per period ────────────────────────
-- Live tuition invoices for a period that the line-by-line check cannot see,
-- because their lines do not name a class: imported, hand-made, or from
-- before runs existed. For a term: invoices for that term, or with no term
-- and dated from four weeks before it starts to its end. For a month: lines
-- that say they cover that month, or undated invoices from that month whose
-- line names the month.
create or replace function app.billing_period_invoices(p_term uuid, p_month date default null)
  returns table (family_id uuid, invoice_ids uuid[], numbers text, total_minor bigint)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with w as (
    select t.id, t.studio_id,
           case when p_month is null then t.starts_on - 28 else date_trunc('month', p_month)::date end w0,
           case when p_month is null then t.ends_on else (date_trunc('month', p_month) + interval '1 month - 1 day')::date end w1,
           date_trunc('month', p_month)::date pm,
           to_char(p_month, 'FMMonth') mname
      from term t where t.id = p_term and t.deleted_at is null)
  select i.family_id, array_agg(i.id order by i.number), string_agg(i.number, ', ' order by i.number),
         sum(i.total_minor)::bigint
    from invoice i, w
   where i.studio_id = w.studio_id and i.deleted_at is null and i.status <> 'void'
     and exists (
       select 1 from invoice_item ii
        where ii.invoice_id = i.id and ii.deleted_at is null and ii.class_id is null
          and ii.kind in ('tuition', 'term_fee')
          and case
                when p_month is null then
                  ii.period_start is null and (
                    i.term_id = w.id
                    or (i.term_id is null and coalesce(i.issued_on, i.due_on, i.created_at::date) between w.w0 and w.w1))
                else
                  ii.period_start = w.pm
                  or (ii.period_start is null and i.term_id is null
                      and coalesce(i.issued_on, i.due_on, i.created_at::date) between w.w0 and w.w1
                      and ii.description ilike '%' || w.mname || '%')
              end)
   group by i.family_id
$$;
revoke all on function app.billing_period_invoices(uuid, date) from public, authenticated, anon;

-- As 0039, with families already billed for the period left out unless the
-- office includes them (p_include).
drop function if exists app.billing_lines(uuid, date);
create function app.billing_lines(p_term uuid, p_month date default null, p_include uuid[] default null)
  returns table (family_id uuid, family_name text, student_id uuid, student_name text,
                 class_id uuid, class_name text, description text, quantity numeric,
                 unit_minor int, discount_minor int, discount_reason text, period_start date)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare sid uuid; t term; m0 date; m1 date; pstart date; skip uuid[];
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
  skip := array(select g.family_id from app.billing_period_invoices(p_term, p_month) g
                 where not (g.family_id = any(coalesce(p_include, '{}'::uuid[]))));
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
       -- Already billed for this period by an invoice that does not name the class.
       and not (f.id = any(skip))
       -- Already billed for this period (a live invoice line for this child and class).
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
         round(d.unit * d.qty * (1 - (1 - greatest(d.sib, d.mc) / 100.0) * (1 - d.fam_pct / 100.0)))::int,
         nullif(concat_ws(' + ',
           case when greatest(d.sib, d.mc) = 0 then null
                when d.sib >= d.mc then d.sib || '% sibling discount' else d.mc || '% multi-class discount' end,
           case when d.fam_pct > 0 then d.fam_pct || '% discount' end), ''),
         pstart
    from disc d
   order by d.fname, d.sname, d.cname;
end $$;

-- Who the run leaves out, what they were already billed, and what the run
-- would raise for them if included anyway.
create or replace function app.billing_skipped(p_term uuid, p_month date default null)
  returns table (family_id uuid, family_name text, invoices text, invoice_ids uuid[],
                 billed_minor bigint, would_raise_minor bigint)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare g uuid[];
begin
  perform app.require_admin((select studio_id from term where id = p_term));
  g := array(select x.family_id from app.billing_period_invoices(p_term, p_month) x);
  return query
  select b.family_id, f.name, b.numbers, b.invoice_ids, b.total_minor, l.amt
    from app.billing_period_invoices(p_term, p_month) b
    join family f on f.id = b.family_id
    join (select l.family_id, sum(round(l.quantity * l.unit_minor) - l.discount_minor)::bigint amt
            from app.billing_lines(p_term, p_month, g) l where l.family_id = any(g) group by l.family_id) l
      on l.family_id = b.family_id
   order by f.name;
end $$;

drop function if exists app.create_billing_run(uuid, date, date);
create function app.create_billing_run(p_term uuid, p_due date default null, p_month date default null,
                                       p_include uuid[] default null, p_reason text default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; run uuid; fam record; inv uuid; n int := 0; tot bigint := 0; fixed int;
        pm date := date_trunc('month', p_month)::date; t term; inc uuid[]; o record;
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
  -- Only families that really were skipped count as overrides.
  inc := array(select g.family_id from app.billing_period_invoices(p_term, pm) g
                where g.family_id = any(coalesce(p_include, '{}'::uuid[])));
  if cardinality(inc) > 0 and length(coalesce(btrim(p_reason), '')) < 3 then
    raise exception 'INVALID: say why these families should be billed again for this period' using errcode = 'check_violation';
  end if;

  insert into billing_run (studio_id, term_id, due_on, created_by, period_month)
  values (sid, p_term, coalesce(p_due, current_date + 14), auth.uid(), pm) returning id into run;

  for fam in
    select l.family_id, jsonb_agg(jsonb_build_object(
             'kind', 'tuition', 'description', l.description, 'quantity', l.quantity,
             'unit_minor', l.unit_minor, 'discount_minor', l.discount_minor,
             'student_id', l.student_id, 'class_id', l.class_id)) items, min(l.period_start) ps
      from app.billing_lines(p_term, pm, inc) l group by l.family_id
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
  for o in select g.family_id, g.numbers from app.billing_period_invoices(p_term, pm) g where g.family_id = any(inc) loop
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (sid, auth.uid(), 'override', 'family', o.family_id,
            'Billed again for ' || coalesce(to_char(pm, 'FMMonth YYYY'), t.name) || ' despite ' || o.numbers || ': ' || btrim(p_reason));
  end loop;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'create', 'billing_run', run, n || ' draft invoices' || coalesce(' for ' || to_char(pm, 'FMMonth YYYY'), ''));
  return run;
end $$;

revoke all on function app.billing_lines(uuid, date, uuid[]), app.billing_skipped(uuid, date),
  app.create_billing_run(uuid, date, date, uuid[], text) from public;
grant execute on function app.billing_lines(uuid, date, uuid[]), app.billing_skipped(uuid, date),
  app.create_billing_run(uuid, date, date, uuid[], text) to authenticated;

-- ── 3. Ending a family discount ─────────────────────────────────────────────
alter table family_discount add column ended_at timestamptz;
alter table family_discount add column ended_by uuid references user_account(id) on delete set null;

-- An ended discount applies to no run from then on, whatever its dates said.
create or replace function app.family_discounts_on(p_family uuid, p_from date, p_to date)
  returns table (pct int, fixed int)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(max(amount) filter (where kind = 'percent'), 0)::int, coalesce(max(amount) filter (where kind = 'fixed'), 0)::int
    from family_discount where family_id = p_family and deleted_at is null and ended_at is null
     and starts_on <= p_to and (ends_on is null or ends_on >= p_from);
$$;

create or replace function app.end_family_discount(p_id uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare d family_discount; fam text;
begin
  select * into d from family_discount where id = p_id and deleted_at is null;
  if d.id is null then raise exception 'NOT_FOUND: that discount' using errcode = 'no_data_found'; end if;
  perform app.require_admin(d.studio_id);
  if d.ended_at is not null then
    raise exception 'INVALID: that discount has already ended' using errcode = 'check_violation';
  end if;
  update family_discount
     set ended_at = now(), ended_by = auth.uid(),
         ends_on = greatest(starts_on, least(coalesce(ends_on, current_date), current_date))
   where id = p_id;
  select name into fam from family where id = d.family_id;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (d.studio_id, auth.uid(), 'end', 'family_discount', d.id,
          fam || ': ' || case when d.kind = 'percent' then d.amount || '%' else app.gbp(d.amount) end || ' discount ended');
end $$;
revoke all on function app.end_family_discount(uuid) from public;
grant execute on function app.end_family_discount(uuid) to authenticated;

-- ── 5. Paying by bank transfer ──────────────────────────────────────────────
create table studio_bank_details (
  studio_id      uuid primary key references studio(id) on delete cascade,
  payee_name     text not null check (length(btrim(payee_name)) between 2 and 140),
  sort_code      text not null check (sort_code ~ '^\d{2}-\d{2}-\d{2}$'),
  account_number text not null check (account_number ~ '^\d{8}$'),
  iban           text check (iban is null or iban ~ '^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$'),
  updated_by     uuid references user_account(id) on delete set null,
  updated_at     timestamptz not null default now()
);
alter table studio_bank_details enable row level security; alter table studio_bank_details force row level security;
-- Everyone at the school may read them: families need them to pay.
create policy bank_details_read on studio_bank_details for select using (studio_id in (select app.studio_ids()));
grant select on studio_bank_details to authenticated;
grant all on studio_bank_details to service_role;

-- Only the owner changes where the money goes.
create or replace function app.set_bank_details(p_studio uuid, p_payee text, p_sort_code text,
                                                p_account text, p_iban text default null)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sc text := regexp_replace(coalesce(p_sort_code, ''), '\D', '', 'g');
        acc text := regexp_replace(coalesce(p_account, ''), '\D', '', 'g');
        ib text := nullif(upper(regexp_replace(coalesce(p_iban, ''), '\s', '', 'g')), '');
begin
  if p_studio is null or not app.has_role(p_studio, 'owner') then
    raise exception 'FORBIDDEN: only the studio owner can change the bank details' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(btrim(p_payee), '') = '' and sc = '' and acc = '' and ib is null then
    delete from studio_bank_details where studio_id = p_studio;
  else
    if length(coalesce(btrim(p_payee), '')) < 2 then
      raise exception 'INVALID: enter the name on the account' using errcode = 'check_violation';
    end if;
    if length(sc) <> 6 then raise exception 'INVALID: a sort code has six digits' using errcode = 'check_violation'; end if;
    if length(acc) <> 8 then raise exception 'INVALID: an account number has eight digits' using errcode = 'check_violation'; end if;
    if ib is not null and ib !~ '^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$' then
      raise exception 'INVALID: that IBAN does not look right' using errcode = 'check_violation';
    end if;
    insert into studio_bank_details (studio_id, payee_name, sort_code, account_number, iban, updated_by, updated_at)
    values (p_studio, btrim(p_payee), substr(sc, 1, 2) || '-' || substr(sc, 3, 2) || '-' || substr(sc, 5, 2), acc, ib, auth.uid(), now())
    on conflict (studio_id) do update set payee_name = excluded.payee_name, sort_code = excluded.sort_code,
      account_number = excluded.account_number, iban = excluded.iban, updated_by = excluded.updated_by, updated_at = now();
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (p_studio, auth.uid(), 'update', 'studio', p_studio, 'Bank details for payments changed');
end $$;
revoke all on function app.set_bank_details(uuid, text, text, text, text) from public;
grant execute on function app.set_bank_details(uuid, text, text, text, text) to authenticated;

-- One reference for paying several invoices at once: the family's name and
-- the end of its id, short enough for any banking app (UK limit 18).
create or replace function app.payment_reference(p_name text, p_id uuid) returns text
  language sql immutable as $$
  select coalesce(nullif(upper(left(regexp_replace(regexp_replace(coalesce(p_name, ''), '\s+family\s*$', '', 'i'), '[^A-Za-z]', '', 'g'), 10)), ''), 'FAMILY')
         || '-' || upper(right(replace(p_id::text, '-', ''), 4))
$$;

-- ── 6. Notifications about money and places ─────────────────────────────────
-- What has already been announced, so nothing is said twice.
create table invoice_notice (
  invoice_id uuid not null references invoice(id) on delete cascade,
  kind       text not null check (kind in ('issued', 'due_soon')),
  sent_at    timestamptz not null default now(),
  primary key (invoice_id, kind)
);
alter table invoice_notice enable row level security; alter table invoice_notice force row level security;
grant all on invoice_notice to service_role;

-- A new invoice. Deferred to the end of the transaction, so the lines (and
-- any credit taken off) are in place when the total is read. Invoices dated
-- in the past (an import, the demo history) are not announced.
create or replace function app.on_invoice_issued_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare i invoice; what text;
begin
  select * into i from invoice where id = new.id;
  if i.id is null or i.deleted_at is not null or i.status not in ('issued', 'part_paid', 'paid') then return null; end if;
  if coalesce(i.issued_on, current_date) < current_date - 1 then return null; end if;
  insert into invoice_notice (invoice_id, kind) values (i.id, 'issued') on conflict do nothing;
  if not found then return null; end if;
  select string_agg(description, ', ' order by created_at) into what from invoice_item
   where invoice_id = i.id and deleted_at is null;
  perform app.notify_family(i.family_id, 'invoice_issued',
    'New invoice ' || i.number || ' ' || app.gbp(i.total_minor)
      || case when i.status = 'paid' then ', paid from your credit' else ' due ' || to_char(i.due_on, 'FMDD Mon') end,
    left(what, 140), '/family/payments');
  return null;
end $$;
create constraint trigger invoice_issued_notify after insert or update of status on invoice
  deferrable initially deferred
  for each row execute function app.on_invoice_issued_notify();

-- Money received (not credit moving about inside the ledger).
create or replace function app.on_payment_received_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare num text;
begin
  if new.succeeded_at is null or new.method not in ('card', 'direct_debit', 'bank_transfer', 'cash') then return null; end if;
  if tg_op = 'UPDATE' and old.succeeded_at is not null then return null; end if;
  select number into num from invoice where id = new.invoice_id;
  perform app.notify_family(new.family_id, 'payment_received', 'Payment received: ' || app.gbp(new.amount_minor),
    case when num is not null then 'Paid towards ' || num || '. Thank you.' else 'Held on your account for your next invoice. Thank you.' end,
    '/family/payments');
  return null;
end $$;
create trigger payment_received_notify after insert or update of succeeded_at on payment
  for each row execute function app.on_payment_received_notify();

-- Invoices due within three days. Each invoice is mentioned once. A family
-- calling it hears about their own invoices (the bell is where they look);
-- the office, or a scheduled job (no user), covers the whole school.
-- Unlike app.notify_family this does not skip the caller: they are asking.
create or replace function app.notify_invoices_due(p_studio uuid default null) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r record; g record; n int := 0;
begin
  for r in select i.* from invoice i
            where i.deleted_at is null and i.status in ('issued', 'part_paid') and i.total_minor > i.paid_minor
              and i.due_on between current_date and current_date + 3
              and (p_studio is null or i.studio_id = p_studio)
              and (auth.uid() is null or app.is_admin(i.studio_id) or i.family_id in (select app.guardian_family_ids()))
              and not exists (select 1 from invoice_notice x where x.invoice_id = i.id and x.kind = 'due_soon')
  loop
    insert into invoice_notice (invoice_id, kind) values (r.id, 'due_soon');
    for g in select gu.studio_id, gu.user_id from guardian gu
              where gu.family_id = r.family_id and gu.user_id is not null and gu.deleted_at is null loop
      continue when not app.wants(g.user_id, 'invoice_issued', 'in_app');
      insert into notification (studio_id, user_id, kind, title, body, href)
      values (g.studio_id, g.user_id, 'invoice_issued',
              r.number || ' is due ' || case when r.due_on = current_date then 'today' when r.due_on = current_date + 1 then 'tomorrow'
                                             else 'on ' || to_char(r.due_on, 'FMDay DD Mon') end,
              app.gbp(r.total_minor - r.paid_minor) || ' to pay. Bank details are in Payments.', '/family/payments');
    end loop;
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function app.notify_invoices_due(uuid) from public;
grant execute on function app.notify_invoices_due(uuid) to authenticated, service_role;

-- A place confirmed for an event, competition or show.
create or replace function app.on_participant_confirmed_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare ev studio_event; s student;
begin
  if new.status <> 'confirmed' or new.deleted_at is not null then return null; end if;
  if tg_op = 'UPDATE' and old.status = 'confirmed' then return null; end if;
  select * into ev from studio_event where id = new.event_id;
  select * into s from student where id = new.student_id;
  if ev.id is null or s.id is null or ev.starts_at < now() then return null; end if;
  perform app.notify_family(s.family_id, 'event_invite', s.first_name || '’s place is confirmed: ' || ev.title,
    to_char(ev.starts_at, 'FMDay DD FMMonth') || coalesce(' · ' || ev.venue, '')
      || case when coalesce(ev.cost_minor, 0) > 0 then ' · fee ' || app.gbp(ev.cost_minor) else '' end,
    '/family/events');
  return null;
end $$;
create trigger participant_confirmed_notify after insert or update of status on event_participant
  for each row execute function app.on_participant_confirmed_notify();

-- ── 7. Private lessons are charged, and families see what is coming ────────
-- A confirmed (published) private lesson with a price raises a draft invoice
-- for the office to check and send. A changed price updates the draft; a
-- cancelled lesson takes its draft away. Anything already sent is left to
-- the office (a credit note).
create or replace function app.on_private_lesson_charge() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; it record; inv uuid; descr text;
begin
  if new.kind <> 'private_lesson' or new.student_id is null then return null; end if;
  -- Loading history (an import, the demo) raises nothing.
  if auth.uid() is null and current_setting('app.quiet', true) = 'on' then return null; end if;
  select * into s from student where id = new.student_id;
  descr := 'Private lesson — ' || s.first_name || ', ' || to_char(new.starts_at, 'FMDy DD Mon');
  select ii.id, ii.invoice_id, i.status into it from invoice_item ii join invoice i on i.id = ii.invoice_id
   where ii.event_id = new.id and ii.deleted_at is null and i.deleted_at is null and i.status <> 'void'
   order by i.created_at desc limit 1;

  if new.status = 'published' and new.deleted_at is null and coalesce(new.cost_minor, 0) > 0 then
    if it.id is null then
      inv := app.create_invoice_internal(s.family_id, jsonb_build_array(jsonb_build_object(
               'kind', 'private_lesson', 'description', descr, 'quantity', 1,
               'unit_minor', new.cost_minor, 'student_id', s.id)),
             greatest(new.starts_at::date, current_date + 7), null, 0, false, null);
      update invoice_item set event_id = new.id where invoice_id = inv;
    elsif it.status = 'draft' then
      update invoice_item set unit_minor = new.cost_minor, description = descr where id = it.id;
    end if;
  elsif it.id is not null and it.status = 'draft' then
    update invoice set deleted_at = now() where id = it.invoice_id and status = 'draft';
  end if;
  return null;
end $$;
create trigger private_lesson_charge after insert or update of status, cost_minor, starts_at, deleted_at on studio_event
  for each row execute function app.on_private_lesson_charge();

-- Everything a family can expect to pay soon, per child, with its state:
-- 'expected' (nothing sent yet), 'invoiced' or 'paid'.
create or replace function app.upcoming_costs(p_family uuid default null)
  returns table (family_id uuid, student_id uuid, child text, kind text, title text, due_on date,
                 amount_minor bigint, state text, invoice_number text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare fams uuid[]; nt term; cur term; nm date := (date_trunc('month', current_date) + interval '1 month')::date;
begin
  if p_family is not null then
    if not (p_family in (select app.guardian_family_ids())
            or app.is_admin((select f.studio_id from family f where f.id = p_family))) then
      raise exception 'FORBIDDEN: not your family' using errcode = 'insufficient_privilege';
    end if;
    fams := array[p_family];
  else
    fams := array(select app.guardian_family_ids());
  end if;

  return query
  with kids as (
    select s.id, s.family_id, s.first_name, s.studio_id from student s
     where s.family_id = any(fams) and s.deleted_at is null
  ),
  inv_state as (
    -- The state of an invoice line, by what it is for.
    select ii.student_id, ii.event_id, ii.class_id, ii.period_start, i.term_id, i.number, i.due_on, i.status
      from invoice_item ii join invoice i on i.id = ii.invoice_id
     where ii.deleted_at is null and i.deleted_at is null and i.status <> 'void'
       and i.family_id = any(fams)
  ),
  nxt as (
    select t.* from term t where t.deleted_at is null and t.starts_on > current_date
       and t.studio_id in (select k.studio_id from kids k)
     order by t.starts_on limit 1
  ),
  items as (
    -- Next term's fees: classes already set up for it, or an estimate from
    -- this term's term-priced classes.
    select k.family_id, k.id sid, k.first_name, 'term'::text kd,
           c.name || ' — ' || t.name title, t.starts_on d, coalesce(e.price_minor, c.price_minor)::bigint amt,
           x.status st, x.number num
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
           sum(coalesce(e.price_minor, c.price_minor))::bigint, null, null
      from kids k join enrolment e on e.student_id = k.id and e.deleted_at is null and e.status = 'active'
      join class c on c.id = e.class_id and c.deleted_at is null and c.pricing = 'term'
      join term t on t.id = c.term_id and current_date between t.starts_on and t.ends_on
     where not exists (select 1 from enrolment e2 join class c2 on c2.id = e2.class_id join nxt n on n.id = c2.term_id
                        where e2.student_id = k.id and e2.deleted_at is null)
     group by k.family_id, k.id, k.first_name
    union all
    -- Next month's fee for monthly classes.
    select k.family_id, k.id, k.first_name, 'month', c.name || ' — ' || to_char(nm, 'FMMonth'), nm,
           coalesce(e.price_minor, c.price_minor)::bigint, x.status, x.number
      from kids k join enrolment e on e.student_id = k.id and e.deleted_at is null and e.status = 'active'
      join class c on c.id = e.class_id and c.deleted_at is null and c.pricing = 'monthly'
      join term t on t.id = c.term_id and nm between t.starts_on and t.ends_on
      left join lateral (select s.status, s.number from inv_state s where s.student_id = k.id and s.class_id = c.id
                          and s.period_start = nm limit 1) x on true
     where coalesce(e.price_minor, c.price_minor) > 0
    union all
    -- Confirmed events, competitions and shows with a fee.
    select k.family_id, k.id, k.first_name, ev.kind::text, ev.title, coalesce(x.due_on, ev.starts_at::date),
           ev.cost_minor::bigint, x.status, x.number
      from kids k join event_participant p on p.student_id = k.id and p.status = 'confirmed' and p.deleted_at is null
      join studio_event ev on ev.id = p.event_id and ev.deleted_at is null and ev.status <> 'cancelled'
      left join lateral (select s.status, s.number, s.due_on from inv_state s where s.event_id = ev.id and s.student_id = k.id
                          order by s.status = 'paid' desc limit 1) x on true
     where coalesce(ev.cost_minor, 0) > 0 and ev.kind <> 'private_lesson'
       and (ev.starts_at >= current_date or (x.status is not null and x.status <> 'paid'))
    union all
    -- Private lessons.
    select k.family_id, k.id, k.first_name, 'private_lesson', 'Private lesson', coalesce(x.due_on, ev.starts_at::date),
           ev.cost_minor::bigint, x.status, x.number
      from kids k join studio_event ev on ev.student_id = k.id and ev.kind = 'private_lesson'
                   and ev.deleted_at is null and ev.status = 'published'
      left join lateral (select s.status, s.number, s.due_on from inv_state s where s.event_id = ev.id
                          order by s.status = 'paid' desc limit 1) x on true
     where coalesce(ev.cost_minor, 0) > 0
       and (ev.starts_at >= current_date or (x.status is not null and x.status not in ('paid', 'draft')))
    union all
    -- Exams entered.
    select k.family_id, k.id, k.first_name, 'exam', x0.board || ' ' || en.grade || ' exam', coalesce(i.due_on, x0.exam_on),
           en.fee_minor::bigint, i.status, i.number
      from kids k join exam_entry en on en.student_id = k.id and en.status = 'entered' and en.fee_minor > 0
      join exam_session x0 on x0.id = en.session_id and x0.deleted_at is null
      left join invoice i on i.id = en.invoice_id and i.deleted_at is null and i.status <> 'void'
     where x0.exam_on >= current_date or (i.status is not null and i.status <> 'paid')
    union all
    -- Costumes for upcoming shows (the office collects these separately).
    select k.family_id, k.id, k.first_name, 'costume', ci.name || ' — ' || ev.title, ev.starts_at::date,
           ci.price_minor::bigint, null, null
      from kids k join costume_order co on co.student_id = k.id and co.status <> 'returned'
      join costume_item ci on ci.id = co.item_id and ci.deleted_at is null and ci.price_minor > 0
      join studio_event ev on ev.id = ci.event_id and ev.deleted_at is null and ev.starts_at >= current_date
  )
  select r.family_id, r.sid, r.first_name, r.kd, r.title, r.d, r.amt,
         case when r.st = 'paid' then 'paid' when r.st in ('issued', 'part_paid', 'refunded') then 'invoiced' else 'expected' end,
         case when r.st in ('issued', 'part_paid', 'refunded', 'paid') then r.num end
    from items r
   order by r.first_name, r.d nulls last, r.title;
end $$;
revoke all on function app.upcoming_costs(uuid) from public;
grant execute on function app.upcoming_costs(uuid) to authenticated;

-- ── 8. Payment reminders, many families at once ─────────────────────────────
-- The same words for everyone, filled in per family from what they owe:
-- {{guardian_name}}, {{amount}}, {{invoice_number}}, {{due_date}}.
create or replace function app.fill_payment_reminder(p_family uuid, p_text text) returns text
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare f family; who text; amt bigint; nums text; due date;
begin
  select * into f from family where id = p_family and deleted_at is null;
  perform app.require_admin(f.studio_id);
  select split_part(full_name, ' ', 1) into who from guardian
   where family_id = p_family and deleted_at is null order by is_primary desc, created_at limit 1;
  select sum(total_minor - paid_minor), string_agg(number, ', ' order by due_on, number), min(due_on)
    into amt, nums, due from invoice
   where family_id = p_family and deleted_at is null and status in ('issued', 'part_paid', 'refunded')
     and total_minor > paid_minor and due_on < current_date;
  if amt is null then
    select sum(total_minor - paid_minor), string_agg(number, ', ' order by due_on, number), min(due_on)
      into amt, nums, due from invoice
     where family_id = p_family and deleted_at is null and status in ('issued', 'part_paid', 'refunded')
       and total_minor > paid_minor;
  end if;
  return replace(replace(replace(replace(coalesce(p_text, ''),
           '{{guardian_name}}', coalesce(who, 'there')),
           '{{amount}}', app.gbp(coalesce(amt, 0))),
           '{{invoice_number}}', coalesce(nums, '')),
           '{{due_date}}', coalesce(to_char(due, 'FMDD Mon'), ''));
end $$;

create or replace function app.send_payment_reminders(p_families uuid[], p_subject text, p_body text) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare fid uuid; f family; n int := 0; subj text; body text; cid uuid; owed bigint;
begin
  if length(coalesce(btrim(p_body), '')) < 10 or coalesce(btrim(p_subject), '') = '' then
    raise exception 'INVALID: a reminder needs a subject and a message' using errcode = 'check_violation';
  end if;
  foreach fid in array coalesce(p_families, '{}'::uuid[]) loop
    select * into f from family where id = fid and deleted_at is null;
    continue when f.id is null;
    perform app.require_admin(f.studio_id);
    select sum(total_minor - paid_minor) into owed from invoice
     where family_id = fid and deleted_at is null and status in ('issued', 'part_paid', 'refunded') and total_minor > paid_minor;
    continue when coalesce(owed, 0) <= 0;
    subj := app.fill_payment_reminder(fid, p_subject);
    body := app.fill_payment_reminder(fid, p_body);
    insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
    values (f.studio_id, 'direct', 'in_app', fid, subj, body, auth.uid()) returning id into cid;
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (f.studio_id, auth.uid(), 'remind', 'family', fid, 'Payment reminder, ' || app.gbp(owed) || ' owed');
    n := n + 1;
  end loop;
  return n;
end $$;
-- When the family was last sent one (the audit trail itself is the owner's).
create or replace function app.last_payment_reminder(p_family uuid) returns timestamptz
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select max(a.at) from audit_log a join family f on f.id = a.entity_id
   where a.entity = 'family' and a.entity_id = p_family and a.action = 'remind' and app.is_admin(f.studio_id)
$$;

revoke all on function app.fill_payment_reminder(uuid, text), app.send_payment_reminders(uuid[], text, text),
  app.last_payment_reminder(uuid) from public;
grant execute on function app.fill_payment_reminder(uuid, text), app.send_payment_reminders(uuid[], text, text),
  app.last_payment_reminder(uuid) to authenticated;
