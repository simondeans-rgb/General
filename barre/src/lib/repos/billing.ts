/* The office's view of the ledger. Every figure is a sum over rows the
   database derived (see migration 0016) — nothing here does arithmetic that
   could drift from what a family is shown. */

export type BillingSummary = {
  outstanding_minor: string; owing_families: number; overdue_minor: string; overdue_invoices: number;
  failed_payments: number; failed_minor: string; collected_30d_minor: string; credit_minor: string;
};

export const SUMMARY = `
select
  coalesce((select sum(balance_minor) from family where deleted_at is null and balance_minor > 0), 0)::bigint as outstanding_minor,
  (select count(*)::int from family where deleted_at is null and balance_minor > 0) as owing_families,
  coalesce((select sum(total_minor - paid_minor) from invoice where deleted_at is null
             and status in ('issued','part_paid','refunded') and due_on < current_date), 0)::bigint as overdue_minor,
  (select count(*)::int from invoice where deleted_at is null
     and status in ('issued','part_paid','refunded') and due_on < current_date) as overdue_invoices,
  (select count(*)::int from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and exists (select 1 from invoice i where i.id = p.invoice_id
       and i.status in ('issued','part_paid'))) as failed_payments,
  coalesce((select sum(p.amount_minor) from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and exists (select 1 from invoice i where i.id = p.invoice_id
       and i.status in ('issued','part_paid'))), 0)::bigint as failed_minor,
  coalesce((select sum(amount_minor - refunded_minor) from payment where deleted_at is null
     and succeeded_at >= now() - interval '30 days' and method not in ('account','credit')), 0)::bigint
     as collected_30d_minor,
  coalesce((select -sum(balance_minor) from family where deleted_at is null and balance_minor < 0), 0)::bigint as credit_minor`;

export type InvoiceRow = {
  id: string; number: string; status: string; issued_on: string | null; due_on: string | null;
  total_minor: string; paid_minor: string; family_id: string; family_name: string;
  overdue: boolean; failed: boolean; lines: string | null;
};

export const INVOICES = `
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       f.id as family_id, f.name as family_name,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue,
       exists (select 1 from payment p where p.invoice_id = i.id and p.deleted_at is null
                and p.failure_code is not null and p.succeeded_at is null)
         and i.status in ('issued','part_paid') as failed,
       (select string_agg(description, ', ' order by created_at) from invoice_item it
         where it.invoice_id = i.id and it.deleted_at is null) as lines
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null
 order by (i.status = 'draft') desc,
          (i.status in ('issued','part_paid','refunded')) desc,
          i.due_on desc nulls last, i.number desc`;

export type InvoiceDetail = InvoiceRow & {
  subtotal_minor: string; discount_minor: string; note: string | null; void_reason: string | null;
  family_balance_minor: string; available_credit_minor: string;
};

export const INVOICE = `
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       i.subtotal_minor, i.discount_minor, i.note, i.void_reason,
       f.id as family_id, f.name as family_name, f.balance_minor as family_balance_minor,
       app.family_available_credit(f.id) as available_credit_minor,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue
  from invoice i join family f on f.id = i.family_id
 where i.id = $1`;

export type ItemRow = { id: string; kind: string; description: string; quantity: string;
  unit_minor: number; discount_minor: number; total_minor: string; student_name: string | null };

export const INVOICE_ITEMS = `
select it.id, it.kind, it.description, it.quantity, it.unit_minor, it.discount_minor, it.total_minor,
       s.first_name as student_name
  from invoice_item it left join student s on s.id = it.student_id
 where it.invoice_id = $1 and it.deleted_at is null
 order by it.created_at`;

export type PaymentRow = { id: string; amount_minor: string; refunded_minor: string; method: string;
  provider: string | null; failure_code: string | null; succeeded_at: string | null;
  created_at: string; note: string | null };

export const INVOICE_PAYMENTS = `
select id, amount_minor, refunded_minor, method, provider, failure_code, succeeded_at, created_at, note
  from payment where invoice_id = $1 and deleted_at is null
 order by created_at`;

export type FamilyOption = { id: string; name: string; balance_minor: string; guardian: string | null };
export const FAMILY_OPTIONS = `
select f.id, f.name, f.balance_minor,
       (select g.full_name from guardian g
         where g.family_id = f.id and g.deleted_at is null order by g.is_primary desc limit 1) as guardian
  from family f where f.deleted_at is null order by f.name`;

/** What a family is enrolled in, priced — the raw material for a term invoice. */
export type BillableRow = { student_id: string; student_name: string; class_id: string;
  class_name: string; price_minor: number; pricing: string };
export const FAMILY_BILLABLE = `
select s.id as student_id, s.first_name as student_name, c.id as class_id, c.name as class_name,
       coalesce(e.price_minor, c.price_minor) as price_minor, c.pricing
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where s.family_id = $1 and e.status = 'active' and e.deleted_at is null and c.deleted_at is null
 order by s.first_name, c.name`;

export const CREATE_INVOICE =
  `select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id`;
export const ISSUE_INVOICE = `select app.issue_invoice($1)`;
export const VOID_INVOICE = `select app.void_invoice($1, $2)`;
export const RECORD_PAYMENT = `select app.record_payment($1, $2, $3, $4, $5) as id`;
export const REFUND_PAYMENT = `select app.refund_payment($1, $2, $3)`;

export const REMINDER_TEMPLATE = `
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`;
export const PRIMARY_GUARDIAN = `
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`;
export const SEND_DIRECT = `
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`;

/* ── Term billing runs and discount rules (migration 0024) ──────────────── */
export type BillingLine = {
  family_id: string; family_name: string; student_id: string; student_name: string;
  class_id: string; class_name: string; description: string; quantity: string;
  unit_minor: number; discount_minor: number; discount_reason: string | null; period_start: string | null;
};
export type DiscountRule = { id: string; kind: 'sibling' | 'multi_class'; from_nth: number; percent: number; enabled: boolean };
export type BillingRun = { id: string; term_name: string; period_month: string | null; status: string; due_on: string; invoice_count: number; total_minor: string; created_at: string; issued_at: string | null };

export const BILLING_TERMS = `select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc`;
export const BILLING_LINES = `select * from app.billing_lines($1, $2::date)`;
export const DISCOUNT_RULES = `select id, kind, from_nth, percent, enabled from discount_rule order by kind desc`;
export const SET_DISCOUNT_RULE = `update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id`;
export const BILLING_RUNS = `
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`;
export const CREATE_BILLING_RUN = `select app.create_billing_run($1, $2::date, $3::date) as id`;
export const ISSUE_BILLING_RUN = `select app.issue_billing_run($1) as n`;
export const DISCARD_BILLING_RUN = `select app.discard_billing_run($1)`;

/* ── Family discounts, aged debt and Xero (migration 0039) ───────────────── */
export type FamilyDiscount = { id: string; family_id: string; family_name: string; kind: 'percent' | 'fixed'; amount: number;
  reason: 'bursary' | 'staff' | 'loyalty' | 'other'; note: string | null; starts_on: string; ends_on: string | null };
export const FAMILY_DISCOUNTS = `
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.ends_on is null or d.ends_on >= current_date order by f.name`;
export const ADD_FAMILY_DISCOUNT = `
insert into family_discount (family_id, kind, amount, reason, note, starts_on, ends_on)
values ($1, $2, $3, $4, nullif($5, ''), coalesce($6::date, current_date), $7::date) returning id`;
export const END_FAMILY_DISCOUNT = `update family_discount set deleted_at = now() where id = $1 returning id`;
export const FAMILY_PICK = `select id, name from family where deleted_at is null and not is_prospect order by name`;

export type AgedDebt = { family_id: string; family_name: string; current_minor: string; d31_60: string; d61_90: string; d90_plus: string; total: string };
const MY_STUDIO = `(select id from studio where app.is_admin(id) order by name limit 1)`;
export const AGED_DEBT = `select * from app.aged_debt(${MY_STUDIO})`;

/** Sales invoices in Xero's import layout: one row per line, UK dates. */
export const XERO_EXPORT = `
with lines as (
  select i.id, i.number, f.name as contact, (select g.email from guardian g where g.family_id = f.id and g.deleted_at is null
            order by g.is_primary desc, g.created_at limit 1) as email,
         coalesce(i.issued_on, i.created_at::date) as inv_date, i.due_on, t.name as term,
         ii.description, ii.quantity, ii.total_minor, ii.created_at, 0 as ord
    from invoice i join family f on f.id = i.family_id join invoice_item ii on ii.invoice_id = i.id and ii.deleted_at is null
    left join term t on t.id = i.term_id
   where i.deleted_at is null and i.status not in ('draft', 'void')
  union all
  select i.id, i.number, f.name, null, coalesce(i.issued_on, i.created_at::date), i.due_on, t.name,
         'Discount', 1, -i.discount_minor, i.created_at, 1
    from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
   where i.deleted_at is null and i.status not in ('draft', 'void') and i.discount_minor > 0
)
select contact as "*ContactName", coalesce(email, '') as "EmailAddress", number as "*InvoiceNumber", coalesce(term, '') as "Reference",
       to_char(inv_date, 'DD/MM/YYYY') as "*InvoiceDate", to_char(due_on, 'DD/MM/YYYY') as "*DueDate",
       description as "*Description", quantity as "*Quantity", round(total_minor / quantity / 100.0, 2) as "*UnitAmount",
       '200' as "*AccountCode", 'No VAT' as "*TaxType", 'GBP' as "Currency"
  from lines order by number, ord, created_at`;
export const AGED_DEBT_EXPORT = `
select family_name as family, round(current_minor / 100.0, 2) as "0-30 days", round(d31_60 / 100.0, 2) as "31-60 days",
       round(d61_90 / 100.0, 2) as "61-90 days", round(d90_plus / 100.0, 2) as "90+ days", round(total / 100.0, 2) as total
  from app.aged_debt(${MY_STUDIO})`;

/** Every invoice, flat, for the accountant (R-012). */
export const INVOICES_EXPORT = `
select i.number, f.name as family, i.status::text as status, i.issued_on, i.due_on,
       round(i.subtotal_minor / 100.0, 2) as subtotal, round(i.discount_minor / 100.0, 2) as discount,
       round(i.total_minor / 100.0, 2) as total, round(i.paid_minor / 100.0, 2) as paid,
       round((i.total_minor - i.paid_minor) / 100.0, 2) as outstanding, t.name as term
  from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
 where i.deleted_at is null order by i.number`;
export const PAYMENTS_EXPORT = `
select p.succeeded_at::date as date, f.name as family, i.number as invoice, p.method,
       round(p.amount_minor / 100.0, 2) as amount,
       case when p.failure_code is not null then 'failed' when p.succeeded_at is null then 'pending' else 'succeeded' end as status,
       p.provider_ref as reference
  from payment p join family f on f.id = p.family_id left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null order by p.created_at`;
