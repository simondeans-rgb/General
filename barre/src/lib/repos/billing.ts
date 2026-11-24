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
