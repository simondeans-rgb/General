-- ============================================================================
-- 0038 · Column guards found by the second expert review (R-045, R-046)
-- ----------------------------------------------------------------------------
-- Row policies decide WHICH rows a person may update; they say nothing about
-- WHICH COLUMNS. Two tables let people change columns that are not theirs:
--
--   studio  an owner could change their own plan, status, trial end and
--           deletion date (R-045)
--   family  a parent could overwrite the family's stored balance (R-046)
--
-- The guards below are SECURITY INVOKER on purpose. When a person updates a
-- row directly, current_user is 'authenticated' and the guard applies. When
-- a trusted database function does it (a platform action, a balance
-- recalculation after a payment), current_user is that function's owner and
-- the change goes through. So the rules live in the functions, as intended.
-- ============================================================================

create or replace function app.guard_studio_columns() returns trigger
  language plpgsql security invoker set search_path = public, app, pg_temp as $$
begin
  if current_user = 'authenticated' and (
       new.id is distinct from old.id or new.slug is distinct from old.slug
    or new.plan_id is distinct from old.plan_id or new.status is distinct from old.status
    or new.status_reason is distinct from old.status_reason or new.trial_ends_on is distinct from old.trial_ends_on
    or new.suspended_at is distinct from old.suspended_at or new.cancelled_at is distinct from old.cancelled_at
    or new.data_deletion_due_on is distinct from old.data_deletion_due_on or new.currency is distinct from old.currency
    or new.pilot_cohort is distinct from old.pilot_cohort or new.pilot_started_on is distinct from old.pilot_started_on
    or new.pilot_notes is distinct from old.pilot_notes
    or new.created_at is distinct from old.created_at or new.created_by is distinct from old.created_by
    or new.deleted_at is distinct from old.deleted_at) then
    raise exception 'FORBIDDEN: plan, account status and dates are managed by Swayvo' using errcode = 'insufficient_privilege';
  end if;
  return new;
end $$;
create trigger studio_column_guard before update on studio
  for each row execute function app.guard_studio_columns();

create or replace function app.guard_family_columns() returns trigger
  language plpgsql security invoker set search_path = public, app, pg_temp as $$
begin
  if current_user = 'authenticated' then
    -- Nobody writes the balance directly: it is derived from invoices and payments.
    if new.balance_minor is distinct from old.balance_minor then
      raise exception 'FORBIDDEN: the balance is worked out from invoices and payments' using errcode = 'insufficient_privilege';
    end if;
    if not app.is_admin(old.studio_id) and (
         new.studio_id is distinct from old.studio_id or new.is_prospect is distinct from old.is_prospect
      or new.deleted_at is distinct from old.deleted_at or new.created_at is distinct from old.created_at) then
      raise exception 'FORBIDDEN: only the office can change that' using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end $$;
create trigger family_column_guard before update on family
  for each row execute function app.guard_family_columns();
