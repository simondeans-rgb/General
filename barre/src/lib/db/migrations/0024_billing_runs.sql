-- ============================================================================
-- 0024 · Term billing runs and discount rules (R-010, R-011)
-- ----------------------------------------------------------------------------
-- A billing run turns the term's enrolments into one draft invoice per family.
-- The office previews it, raises the drafts, checks them, then issues them all
-- together. Nothing is charged twice: a child is only billed for a class if no
-- live invoice line already covers that child in that class this term, so a
-- second run mid-term picks up new joiners and nothing else.
--
-- Discounts are rules, not hand edits:
--   sibling      the Nth child in a family (and after) gets X% off their classes
--   multi_class  a child's Nth class (and after) gets X% off
-- When both apply to a line the larger one is used. They do not stack — a
-- studio that wants stacking can say so and it is one line to change.
-- ============================================================================

create table discount_rule (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  kind        text not null check (kind in ('sibling', 'multi_class')),
  from_nth    smallint not null default 2 check (from_nth between 2 and 10),
  percent     smallint not null default 10 check (percent between 1 and 100),
  enabled     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  unique (studio_id, kind)
);

create table billing_run (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  term_id      uuid not null references term(id) on delete restrict,
  status       text not null default 'draft' check (status in ('draft', 'issued', 'discarded')),
  due_on       date not null,
  invoice_count int not null default 0,
  total_minor  bigint not null default 0,
  created_by   uuid references user_account(id) on delete set null,
  created_at   timestamptz not null default now(),
  issued_at    timestamptz,
  issued_by    uuid references user_account(id) on delete set null
);

alter table invoice add column billing_run_id uuid references billing_run(id) on delete set null;
create index invoice_billing_run_idx on invoice (billing_run_id) where billing_run_id is not null;

alter table discount_rule enable row level security;
alter table discount_rule force row level security;
alter table billing_run   enable row level security;
alter table billing_run   force row level security;

create policy discount_rule_read on discount_rule for select
  using (deleted_at is null and app.is_admin(studio_id));
create policy discount_rule_write on discount_rule for update
  using (deleted_at is null and app.is_admin(studio_id) and app.studio_writable(studio_id))
  with check (app.is_admin(studio_id));
create policy billing_run_read on billing_run for select using (app.is_admin(studio_id));

grant select, update (from_nth, percent, enabled) on discount_rule to authenticated;
grant select on billing_run to authenticated;
grant all on discount_rule, billing_run to service_role;

create trigger discount_rule_touch before update on discount_rule
  for each row execute function app.touch_updated_at();

-- Every school starts with the two common rules, switched off, so nobody is
-- discounted until the office decides to.
create or replace function app.default_discount_rules() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  insert into discount_rule (studio_id, kind, from_nth, percent, enabled)
  values (new.id, 'sibling', 2, 10, false), (new.id, 'multi_class', 3, 15, false)
  on conflict do nothing;
  return new;
end $$;
create trigger studio_default_discounts after insert on studio
  for each row execute function app.default_discount_rules();
insert into discount_rule (studio_id, kind, from_nth, percent, enabled)
  select id, k.kind, k.n, k.p, false from studio,
    (values ('sibling', 2, 10), ('multi_class', 3, 15)) k(kind, n, p)
  on conflict do nothing;

-- ── What a run would raise ─────────────────────────────────────────────────
-- One row per line. Pure: reads only, writes nothing, so the preview and the
-- run itself can never disagree.
--
-- Pricing by the class's model:
--   term     the term price; a child who joined after the term began pays for
--            the sessions left (pro rata by session, rounded to the penny)
--   monthly  the monthly price × the months the term spans
--   one_off  the course price
--   drop_in  nothing — paid class by class
create or replace function app.billing_lines(p_term uuid)
  returns table (family_id uuid, family_name text, student_id uuid, student_name text,
                 class_id uuid, class_name text, description text, quantity numeric,
                 unit_minor int, discount_minor int, discount_reason text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare sid uuid; t term;
begin
  select * into t from term where id = p_term and deleted_at is null;
  sid := t.studio_id;
  perform app.require_admin(sid);
  return query
  with base as (
    select f.id fam, f.name fname, s.id stu, s.first_name || ' ' || s.last_name sname,
           c.id cls, c.name cname, c.pricing,
           coalesce(e.price_minor, c.price_minor) price, greatest(e.started_on, t.starts_on) from_day,
           (select count(*) from class_session cs where cs.class_id = c.id and cs.deleted_at is null
              and cs.status <> 'cancelled') total_sessions,
           (select count(*) from class_session cs where cs.class_id = c.id and cs.deleted_at is null
              and cs.status <> 'cancelled' and cs.starts_at::date >= greatest(e.started_on, t.starts_on)) left_sessions
      from enrolment e
      join class c on c.id = e.class_id and c.deleted_at is null and c.term_id = t.id
      join student s on s.id = e.student_id and s.deleted_at is null
      join family f on f.id = s.family_id and f.deleted_at is null and not f.is_prospect
     where e.deleted_at is null and e.status = 'active' and c.pricing <> 'drop_in'
       and coalesce(e.price_minor, c.price_minor) > 0
       -- Already billed this term (a live invoice line for this child and class).
       and not exists (
         select 1 from invoice_item ii join invoice i on i.id = ii.invoice_id
          where ii.student_id = s.id and ii.class_id = c.id and ii.deleted_at is null
            and i.deleted_at is null and i.status not in ('void', 'refunded') and i.term_id = t.id)
  ),
  priced as (
    select b.*,
      case b.pricing
        when 'monthly' then greatest(1, (extract(year from age(t.ends_on, t.starts_on)) * 12
                                         + extract(month from age(t.ends_on, t.starts_on))
                                         + case when extract(day from age(t.ends_on, t.starts_on)) > 0 then 1 else 0 end))::numeric
        else 1::numeric end qty,
      case when b.pricing = 'term' and b.from_day > t.starts_on and b.total_sessions > 0
           then round(b.price::numeric * b.left_sessions / b.total_sessions)::int
           else b.price end unit,
      case b.pricing
        when 'term' then case when b.from_day > t.starts_on and b.total_sessions > 0
                              then format('%s — %s, %s of %s classes from %s', b.cname, t.name, b.left_sessions,
                                          b.total_sessions, to_char(b.from_day, 'FMDD Mon'))
                              else b.cname || ' — ' || t.name end
        when 'monthly' then b.cname || ' — monthly, ' || t.name
        else b.cname || ' — course fee' end descr
      from base b
  ),
  ranked as (
    select p.*,
      -- Siblings: the child with the most tuition counts as the first child.
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
      case when rules.mc_pct is not null and r.class_rank >= rules.mc_n then rules.mc_pct else 0 end mc
      from ranked r, rules
  )
  select d.fam, d.fname, d.stu, d.sname, d.cls, d.cname, d.descr, d.qty, d.unit,
         round(d.unit * d.qty * greatest(d.sib, d.mc) / 100.0)::int,
         case when greatest(d.sib, d.mc) = 0 then null
              when d.sib >= d.mc then d.sib || '% sibling discount'
              else d.mc || '% multi-class discount' end
    from disc d
   order by d.fname, d.sname, d.cname;
end $$;

-- Raise the drafts. One invoice per family, numbered as usual, not yet sent.
create or replace function app.create_billing_run(p_term uuid, p_due date default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; run uuid; fam record; inv uuid; n int := 0; tot bigint := 0;
begin
  select studio_id into sid from term where id = p_term and deleted_at is null;
  perform app.require_admin(sid);
  if not app.studio_writable(sid) then
    raise exception 'FORBIDDEN: this school is read-only' using errcode = 'insufficient_privilege';
  end if;
  if exists (select 1 from billing_run where term_id = p_term and status = 'draft') then
    raise exception 'INVALID: there is already a draft run for this term — issue or discard it first'
      using errcode = 'check_violation';
  end if;

  insert into billing_run (studio_id, term_id, due_on, created_by)
  values (sid, p_term, coalesce(p_due, current_date + 14), auth.uid()) returning id into run;

  for fam in
    select l.family_id, jsonb_agg(jsonb_build_object(
             'kind', 'tuition', 'description', l.description, 'quantity', l.quantity,
             'unit_minor', l.unit_minor, 'discount_minor', l.discount_minor,
             'student_id', l.student_id, 'class_id', l.class_id)) items
      from app.billing_lines(p_term) l group by l.family_id
  loop
    inv := app.create_invoice(fam.family_id, fam.items, coalesce(p_due, current_date + 14),
                              null, 0, false, p_term);
    update invoice set billing_run_id = run where id = inv;
    n := n + 1;
    tot := tot + (select total_minor from invoice where id = inv);
  end loop;

  if n = 0 then
    delete from billing_run where id = run;
    raise exception 'INVALID: everyone enrolled this term has already been invoiced'
      using errcode = 'check_violation';
  end if;
  update billing_run set invoice_count = n, total_minor = tot where id = run;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'create', 'billing_run', run, n || ' draft invoices');
  return run;
end $$;

-- Send them all. Each family's account credit is drawn down as usual.
create or replace function app.issue_billing_run(p_run uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r billing_run; i uuid; n int := 0;
begin
  select * into r from billing_run where id = p_run;
  perform app.require_admin(r.studio_id);
  if r.status <> 'draft' then
    raise exception 'INVALID: this run has already been %', r.status using errcode = 'check_violation';
  end if;
  for i in select id from invoice where billing_run_id = p_run and status = 'draft' and deleted_at is null loop
    perform app.issue_invoice(i);
    n := n + 1;
  end loop;
  update billing_run set status = 'issued', issued_at = now(), issued_by = auth.uid(),
         invoice_count = n,
         total_minor = (select coalesce(sum(total_minor), 0) from invoice where billing_run_id = p_run and deleted_at is null)
   where id = p_run;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (r.studio_id, auth.uid(), 'issue', 'billing_run', p_run, n || ' invoices issued');
  return n;
end $$;

-- Throw the drafts away (nothing has been sent, so nothing to void).
create or replace function app.discard_billing_run(p_run uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r billing_run;
begin
  select * into r from billing_run where id = p_run;
  perform app.require_admin(r.studio_id);
  if r.status <> 'draft' then
    raise exception 'INVALID: only a draft run can be discarded' using errcode = 'check_violation';
  end if;
  update invoice set deleted_at = now() where billing_run_id = p_run and status = 'draft';
  update billing_run set status = 'discarded' where id = p_run;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (r.studio_id, auth.uid(), 'delete', 'billing_run', p_run, 'Draft run discarded');
end $$;

revoke all on function app.billing_lines(uuid), app.create_billing_run(uuid, date),
  app.issue_billing_run(uuid), app.discard_billing_run(uuid) from public;
grant execute on function app.billing_lines(uuid), app.create_billing_run(uuid, date),
  app.issue_billing_run(uuid), app.discard_billing_run(uuid) to authenticated;
