-- ============================================================================
-- 0016 · The family ledger, made to add up
-- ----------------------------------------------------------------------------
-- 0005 gave billing its shape. This gives it arithmetic. Until now an invoice
-- total, the amount paid against it and a family's balance were three numbers
-- written independently by whoever inserted the row — so nothing stopped them
-- disagreeing. Here they are derived, in the database, from the rows that
-- justify them:
--
--   invoice.subtotal   = sum of its live items
--   invoice.total      = subtotal − invoice-level discount (never below zero)
--   invoice.paid       = sum of its succeeded payments, net of refunds
--   invoice.status     = follows from total and paid, unless draft or void
--   family.balance     = what open invoices still want − credit held on account
--
-- Money held on account (a payment not tied to an invoice, or a goodwill
-- credit) is drawn down by `account` allocation rows, oldest invoice first.
-- Nothing is ever edited to make the sums work: every movement is a row.
--
-- No card data is stored. A card payment arrives from the provider's webhook
-- as a provider name and reference (see docs/PAYMENTS.md).
-- ============================================================================

alter table invoice add column voided_at   timestamptz;
alter table invoice add column void_reason text;

-- What a payment row may be. `account` is an internal transfer: credit the
-- family already holds, allocated to an invoice. `credit` is goodwill credit
-- the studio grants. Neither moves real money.
alter table payment add constraint payment_method_known
  check (method in ('card', 'direct_debit', 'bank_transfer', 'cash', 'credit', 'account'));
alter table payment add constraint payment_amount_positive check (amount_minor > 0);
alter table payment add constraint payment_refund_bounded
  check (refunded_minor >= 0 and refunded_minor <= amount_minor);
alter table payment add column note text;
alter table payment add column recorded_by uuid references user_account(id) on delete set null;

create index payment_invoice  on payment (invoice_id) where deleted_at is null;
create index payment_unallocated on payment (family_id)
  where deleted_at is null and invoice_id is null;

-- ── Derivation ─────────────────────────────────────────────────────────────
-- A BEFORE trigger owns total and status, so they are right however the row
-- was written — by a function below, an import, or a provider webhook.
create or replace function app.invoice_derive() returns trigger
  language plpgsql as $$
declare had_refund boolean;
begin
  new.total_minor := greatest(new.subtotal_minor - new.discount_minor, 0);
  if new.status in ('draft', 'void') then return new; end if;

  if new.paid_minor >= new.total_minor then
    new.status := 'paid';
  elsif new.paid_minor > 0 then
    new.status := 'part_paid';
  else
    select exists (select 1 from payment p where p.invoice_id = new.id
                     and p.deleted_at is null and p.refunded_minor > 0)
      into had_refund;
    new.status := case when had_refund then 'refunded' else 'issued' end;
  end if;
  return new;
end $$;

create trigger invoice_derive before insert or update on invoice
  for each row execute function app.invoice_derive();

-- What the family holds on account and has not yet allocated.
create or replace function app.family_available_credit(p_family uuid) returns bigint
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce((select sum(amount_minor - refunded_minor) from payment
                    where family_id = p_family and invoice_id is null
                      and succeeded_at is not null and deleted_at is null), 0)
       - coalesce((select sum(amount_minor - refunded_minor) from payment
                    where family_id = p_family and invoice_id is not null and method = 'account'
                      and succeeded_at is not null and deleted_at is null), 0)
$$;

create or replace function app.recalc_family_balance(p_family uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  update family f set balance_minor =
      coalesce((select sum(i.total_minor - i.paid_minor) from invoice i
                 where i.family_id = p_family and i.deleted_at is null
                   and i.status in ('issued', 'part_paid', 'refunded')), 0)
    - app.family_available_credit(p_family),
    updated_at = now()
   where f.id = p_family;
end $$;

create or replace function app.recalc_invoice(p_invoice uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  update invoice i set
    subtotal_minor = coalesce((select sum(it.total_minor) from invoice_item it
                                where it.invoice_id = i.id and it.deleted_at is null), 0),
    paid_minor     = coalesce((select sum(p.amount_minor - p.refunded_minor) from payment p
                                where p.invoice_id = i.id and p.deleted_at is null
                                  and p.succeeded_at is not null), 0),
    updated_at = now()
   where i.id = p_invoice;
end $$;

create or replace function app.on_invoice_item_change() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  perform app.recalc_invoice(coalesce(new.invoice_id, old.invoice_id));
  if tg_op = 'UPDATE' and new.invoice_id is distinct from old.invoice_id then
    perform app.recalc_invoice(old.invoice_id);
  end if;
  return null;
end $$;

create trigger invoice_item_recalc after insert or update or delete on invoice_item
  for each row execute function app.on_invoice_item_change();

create or replace function app.on_payment_change() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r payment;
begin
  r := coalesce(new, old);
  if r.invoice_id is not null then perform app.recalc_invoice(r.invoice_id); end if;
  if tg_op = 'UPDATE' and old.invoice_id is distinct from new.invoice_id and old.invoice_id is not null then
    perform app.recalc_invoice(old.invoice_id);
  end if;
  -- Unallocated money changes the balance without touching any invoice.
  perform app.recalc_family_balance(r.family_id);
  return null;
end $$;

create trigger payment_recalc after insert or update or delete on payment
  for each row execute function app.on_payment_change();

create or replace function app.on_invoice_change() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if tg_op = 'INSERT'
     or new.total_minor  is distinct from old.total_minor
     or new.paid_minor   is distinct from old.paid_minor
     or new.status       is distinct from old.status
     or new.deleted_at   is distinct from old.deleted_at then
    perform app.recalc_family_balance(new.family_id);
  end if;
  return null;
end $$;

create trigger invoice_balance after insert or update on invoice
  for each row execute function app.on_invoice_change();

-- ── Guard ──────────────────────────────────────────────────────────────────
create or replace function app.require_admin(p_studio uuid) returns void
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if p_studio is null or not app.is_admin(p_studio) then
    raise exception 'FORBIDDEN: only the studio office may change billing'
      using errcode = 'insufficient_privilege';
  end if;
end $$;

-- ── Allocating credit ──────────────────────────────────────────────────────
-- Draws the family's credit down against its open invoices, oldest due first.
-- Returns what was allocated. Called after any money lands on account.
create or replace function app.allocate_account_credit(p_family uuid) returns bigint
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid; avail bigint; inv record; take bigint; total bigint := 0;
begin
  select studio_id into sid from family where id = p_family and deleted_at is null;
  perform app.require_admin(sid);
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

-- ── Creating an invoice ────────────────────────────────────────────────────
-- p_items: [{kind, description, quantity, unit_minor, discount_minor?,
--            student_id?, class_id?}]
create or replace function app.create_invoice(
  p_family uuid, p_items jsonb, p_due date default null, p_note text default null,
  p_discount_minor bigint default 0, p_issue boolean default true, p_term uuid default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid; inv uuid; num text; it jsonb; n int := 0;
begin
  select studio_id into sid from family where id = p_family and deleted_at is null;
  perform app.require_admin(sid);

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

  if p_issue then perform app.allocate_account_credit(p_family); end if;
  return inv;
end $$;

create or replace function app.issue_invoice(p_invoice uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; fam uuid;
begin
  select studio_id, family_id into sid, fam from invoice
   where id = p_invoice and status = 'draft' and deleted_at is null;
  if sid is null then
    raise exception 'INVALID: only a draft invoice can be issued' using errcode = 'check_violation';
  end if;
  perform app.require_admin(sid);
  update invoice set status = 'issued', issued_on = current_date where id = p_invoice;
  perform app.allocate_account_credit(fam);
end $$;

-- Voiding is for an invoice raised in error. One that has been paid against is
-- refunded instead, so the money trail stays intact.
create or replace function app.void_invoice(p_invoice uuid, p_reason text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; paid bigint; num text;
begin
  select studio_id, paid_minor, number into sid, paid, num from invoice
   where id = p_invoice and deleted_at is null and status <> 'void';
  if sid is null then raise exception 'NOT_FOUND: invoice' using errcode = 'no_data_found'; end if;
  perform app.require_admin(sid);
  if paid > 0 then
    raise exception 'INVALID: this invoice has payments against it — refund them first'
      using errcode = 'check_violation';
  end if;
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'INVALID: say why the invoice is being voided' using errcode = 'check_violation';
  end if;
  update invoice set status = 'void', voided_at = now(), void_reason = btrim(p_reason)
   where id = p_invoice;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'void', 'invoice', p_invoice, num || ': ' || btrim(p_reason));
end $$;

-- ── Recording money the studio received itself ─────────────────────────────
-- Bank transfer and cash. Card money only ever arrives from the provider.
-- Without an invoice, or beyond what the invoice still wants, the money goes
-- on account and is allocated to the oldest open invoices.
create or replace function app.record_payment(
  p_family uuid, p_amount_minor bigint, p_method text,
  p_invoice uuid default null, p_note text default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; owed bigint; pid uuid;
begin
  select studio_id into sid from family where id = p_family and deleted_at is null;
  perform app.require_admin(sid);
  if p_method not in ('bank_transfer', 'cash', 'credit') then
    raise exception 'INVALID: record bank transfers, cash or a credit here — card payments come from the provider'
      using errcode = 'check_violation';
  end if;
  if coalesce(p_amount_minor, 0) <= 0 then
    raise exception 'INVALID: the amount must be more than zero' using errcode = 'check_violation';
  end if;
  if p_method = 'credit' and p_invoice is not null then
    raise exception 'INVALID: a credit is held on account, not against one invoice'
      using errcode = 'check_violation';
  end if;

  if p_invoice is not null then
    select total_minor - paid_minor into owed from invoice
     where id = p_invoice and family_id = p_family and deleted_at is null
       and status in ('issued', 'part_paid', 'refunded');
    if owed is null then
      raise exception 'INVALID: that invoice is not open for this family' using errcode = 'check_violation';
    end if;
    if p_amount_minor > owed then
      raise exception 'INVALID: that is more than the % still owed on this invoice', owed
        using errcode = 'check_violation';
    end if;
  end if;

  insert into payment (studio_id, family_id, invoice_id, amount_minor, method, provider,
                       succeeded_at, note, recorded_by)
  values (sid, p_family, p_invoice, p_amount_minor, p_method, 'manual', now(),
          nullif(btrim(p_note), ''), auth.uid())
  returning id into pid;

  if p_invoice is null then perform app.allocate_account_credit(p_family); end if;
  return pid;
end $$;

-- ── Refunds ────────────────────────────────────────────────────────────────
-- Money the studio took itself, it can hand back here. A card refund is made
-- through the provider, whose webhook then writes refunded_minor — so the
-- ledger can never claim a refund the bank has not made.
create or replace function app.refund_payment(p_payment uuid, p_amount_minor bigint, p_reason text)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare p payment; left_ bigint;
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
  left_ := p.amount_minor - p.refunded_minor;
  if coalesce(p_amount_minor, 0) <= 0 or p_amount_minor > left_ then
    raise exception 'INVALID: a refund must be between 1p and the % not already refunded', left_
      using errcode = 'check_violation';
  end if;
  -- Money on account that has already been allocated to invoices is no longer
  -- the family's to take back.
  if p.invoice_id is null and p_amount_minor > app.family_available_credit(p.family_id) then
    raise exception 'INVALID: that money has already been applied to invoices' using errcode = 'check_violation';
  end if;
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'INVALID: say why the payment is being refunded' using errcode = 'check_violation';
  end if;
  update payment set refunded_minor = refunded_minor + p_amount_minor,
                     note = concat_ws(' · ', note, 'Refunded: ' || btrim(p_reason))
   where id = p_payment;
end $$;

grant execute on function app.create_invoice(uuid, jsonb, date, text, bigint, boolean, uuid),
                          app.issue_invoice(uuid), app.void_invoice(uuid, text),
                          app.record_payment(uuid, bigint, text, uuid, text),
                          app.refund_payment(uuid, bigint, text),
                          app.allocate_account_credit(uuid),
                          app.family_available_credit(uuid) to authenticated;

-- The internals are not entry points.
revoke execute on function app.recalc_invoice(uuid), app.recalc_family_balance(uuid)
  from public, authenticated, anon;

-- Bring rows written before this migration into line with the rules.
do $$ declare r record; begin
  for r in select id from invoice loop perform app.recalc_invoice(r.id); end loop;
  for r in select id from family loop perform app.recalc_family_balance(r.id); end loop;
end $$;

-- ── The payment provider's entry point ─────────────────────────────────────
-- Called by the webhook handler running as service_role — never by a user.
-- Idempotent on (provider, provider_ref): providers retry webhooks, and the
-- same event arriving twice must not take a family's money twice.
create unique index payment_provider_ref on payment (provider, provider_ref)
  where provider_ref is not null and deleted_at is null;

create or replace function app.apply_provider_event(
  p_provider text, p_ref text, p_invoice uuid, p_amount_minor bigint,
  p_outcome text, p_failure_code text default null, p_refunded_minor bigint default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare inv invoice; pid uuid;
begin
  if p_outcome not in ('succeeded', 'failed', 'refunded') then
    raise exception 'INVALID: unknown outcome %', p_outcome;
  end if;
  select * into inv from invoice where id = p_invoice and deleted_at is null;
  if inv.id is null then raise exception 'NOT_FOUND: invoice %', p_invoice; end if;

  select id into pid from payment where provider = p_provider and provider_ref = p_ref
                                      and deleted_at is null;
  if pid is null then
    insert into payment (studio_id, family_id, invoice_id, amount_minor, method, provider,
                         provider_ref, failure_code, succeeded_at)
    values (inv.studio_id, inv.family_id, inv.id, p_amount_minor, 'card', p_provider, p_ref,
            case when p_outcome = 'failed' then coalesce(p_failure_code, 'failed') end,
            case when p_outcome <> 'failed' then now() end)
    returning id into pid;
  elsif p_outcome = 'succeeded' then
    update payment set succeeded_at = coalesce(succeeded_at, now()), failure_code = null where id = pid;
  elsif p_outcome = 'failed' then
    update payment set failure_code = coalesce(p_failure_code, 'failed') where id = pid and succeeded_at is null;
  end if;

  if p_outcome = 'refunded' then
    -- The provider reports the cumulative refunded amount, so this is a set,
    -- not an increment: replaying the event changes nothing.
    update payment set refunded_minor = least(coalesce(p_refunded_minor, amount_minor), amount_minor)
     where id = pid;
  end if;
  return pid;
end $$;

revoke execute on function app.apply_provider_event(text, text, uuid, bigint, text, text, bigint)
  from public, authenticated, anon;
grant execute on function app.apply_provider_event(text, text, uuid, bigint, text, text, bigint)
  to service_role;
