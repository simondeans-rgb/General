-- ============================================================================
-- 0001 · Foundation: extensions, auth compatibility, roles, enums, helpers
-- ----------------------------------------------------------------------------
-- The `auth` schema mirrors the surface Supabase exposes to RLS policies, so
-- every policy in 0003 is written once and runs unchanged against a hosted
-- Supabase project, a plain Postgres server, or PGlite in the browser.
-- ============================================================================

-- No extensions. gen_random_uuid() has been core Postgres since 13, and
-- case-insensitive columns are handled with lower() unique indexes rather than
-- text, so this schema runs unchanged on Supabase, a plain server, and the
-- WASM build that powers the browser demo — none of which share an extension set.

create schema if not exists auth;
create schema if not exists app;

-- Claims are set per transaction by the data layer (see lib/db/session.ts).
create or replace function auth.jwt() returns jsonb
  language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;

create or replace function auth.uid() returns uuid
  language sql stable as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid
$$;

create or replace function auth.role() returns text
  language sql stable as $$
  select coalesce(auth.jwt() ->> 'role', 'anon')
$$;

-- ---------------------------------------------------------------------------
-- Enums. Named types rather than check constraints so the TypeScript layer can
-- generate unions from them and a bad value fails at the database boundary.
-- ---------------------------------------------------------------------------
create type app_role          as enum ('owner', 'admin', 'teacher', 'guardian', 'student');
create type staff_status      as enum ('active', 'inactive');
create type term_status       as enum ('draft', 'published', 'archived');
create type class_visibility  as enum ('public', 'unlisted', 'private');
create type session_status    as enum ('scheduled', 'cancelled', 'rescheduled', 'completed');
create type enrolment_status  as enum ('active', 'left', 'cancelled');
create type trial_status      as enum ('requested', 'booked', 'attended', 'missed', 'converted', 'cancelled');
create type waitlist_status   as enum ('waiting', 'offered', 'accepted', 'declined', 'expired', 'withdrawn');
create type attendance_status as enum ('present', 'absent', 'late', 'excused', 'trial');
create type enquiry_stage     as enum ('enquiry', 'trial_requested', 'trial_booked', 'trial_attended',
                                       'trial_missed', 'follow_up', 'enrolled', 'closed_lost');
create type invoice_status    as enum ('draft', 'issued', 'part_paid', 'paid', 'void', 'refunded');
create type charge_kind       as enum ('tuition', 'term_fee', 'membership', 'exam_fee', 'show_fee',
                                       'costume', 'workshop', 'private_lesson', 'merchandise', 'other');
create type pricing_model     as enum ('term', 'monthly', 'one_off', 'drop_in');
create type comm_channel      as enum ('in_app', 'email', 'sms', 'push');
create type comm_kind         as enum ('direct', 'class_broadcast', 'studio_announcement');
create type consent_kind      as enum ('photography', 'social_media', 'medical_treatment',
                                       'data_processing', 'marketing', 'collection_by_other');

-- ---------------------------------------------------------------------------
-- Shared trigger helpers
-- ---------------------------------------------------------------------------
create or replace function app.touch_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Database roles. `authenticated` is the role every user query runs as; RLS is
-- what separates them. `service_role` bypasses RLS for migrations and trusted
-- server jobs only, and is never used from client code.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end $$;

grant usage on schema public, auth, app to authenticated, anon, service_role;
