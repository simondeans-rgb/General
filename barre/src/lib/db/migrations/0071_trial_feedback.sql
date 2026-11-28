-- ============================================================================
-- 0071 · The teacher's view of a trial
-- ----------------------------------------------------------------------------
-- A child on a trial is highlighted on the register, and the teacher (or the
-- cover teacher) can say how it went: a recommendation (ready to join, better
-- in another class, not ready yet) and comments. It is for the school's
-- decision about enrolling the child, so it is staff-only: the owner and
-- administrators and the class's teachers read it; families and students
-- never do. Saving it tells the office, and the trial shows the teacher's
-- view wherever the office sees it (enrolment, the class page, Today).
-- ============================================================================

create table if not exists trial_feedback (
  trial_id        uuid primary key references trial(id) on delete cascade,
  studio_id       uuid not null references studio(id) on delete cascade,
  recommendation  text check (recommendation in ('ready', 'other_class', 'not_ready')),
  comments        text check (comments is null or length(comments) <= 2000),
  written_by      uuid references user_account(id) on delete set null,
  written_by_name text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (recommendation is not null or nullif(btrim(comments), '') is not null)
);
alter table trial_feedback enable row level security;
alter table trial_feedback force row level security;

-- Who may write it: the office, or a teacher of the class or the trial's session (cover included).
create or replace function app.can_write_trial_feedback(p_trial uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (
    select 1 from trial t
      left join class_session cs on cs.id = t.session_id
      left join staff_member sm on sm.id = cs.teacher_id and sm.deleted_at is null
     where t.id = p_trial and t.deleted_at is null and not app.is_support_viewer(t.studio_id)
       and (app.is_admin(t.studio_id)
            or t.class_id in (select app.teacher_class_ids())
            or sm.user_id = auth.uid()));
$$;

create policy trial_feedback_staff_read on trial_feedback for select
  using (app.can_write_trial_feedback(trial_id));
grant select on trial_feedback to authenticated;
grant all on trial_feedback to service_role;

create or replace function app.save_trial_feedback(p_trial uuid, p_recommendation text, p_comments text)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare t record; who text; child text; word text; first boolean;
begin
  if not app.can_write_trial_feedback(p_trial) then
    raise exception 'FORBIDDEN: only the class''s teacher or the office can write about this trial' using errcode = 'insufficient_privilege';
  end if;
  if p_recommendation is not null and p_recommendation not in ('ready', 'other_class', 'not_ready') then
    raise exception 'INVALID: unknown recommendation' using errcode = 'check_violation';
  end if;
  if p_recommendation is null and nullif(btrim(p_comments), '') is null then
    raise exception 'INVALID: choose how it went or write a comment' using errcode = 'check_violation';
  end if;
  select tr.id, tr.studio_id, tr.student_id, c.name as class_name into t
    from trial tr join class c on c.id = tr.class_id where tr.id = p_trial;
  select coalesce(display_name, (select full_name from user_account where id = auth.uid())) into who
    from staff_member where user_id = auth.uid() and studio_id = t.studio_id and deleted_at is null limit 1;
  who := coalesce(who, (select full_name from user_account where id = auth.uid()), 'Staff');
  select coalesce(preferred_name, first_name) || ' ' || last_name into child from student where id = t.student_id;
  first := not exists (select 1 from trial_feedback where trial_id = p_trial);

  insert into trial_feedback (trial_id, studio_id, recommendation, comments, written_by, written_by_name)
  values (p_trial, t.studio_id, p_recommendation, nullif(btrim(p_comments), ''), auth.uid(), who)
  on conflict (trial_id) do update set recommendation = excluded.recommendation, comments = excluded.comments,
         written_by = excluded.written_by, written_by_name = excluded.written_by_name, updated_at = now();

  word := case p_recommendation when 'ready' then 'Ready to join' when 'other_class' then 'Better in another class'
                                when 'not_ready' then 'Not ready yet' else 'Comments' end;
  perform app.notify_admins(t.studio_id, 'trial_feedback',
    case when first then 'Trial feedback: ' else 'Trial feedback updated: ' end || coalesce(child, 'trial') || ' — ' || word,
    who || ' on ' || t.class_name || coalesce(': “' || left(nullif(btrim(p_comments), ''), 140) || '”', '.'),
    '/enrolment');
end $$;

-- For the office's Today: trials the teacher has written about, not yet decided.
create or replace function app.trials_to_decide(p_studio uuid)
  returns table (trial_id uuid, child text, class_name text, recommendation text, written_by_name text, updated_at timestamptz)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select tr.id, coalesce(s.preferred_name, s.first_name) || ' ' || s.last_name, c.name, f.recommendation, f.written_by_name, f.updated_at
    from trial_feedback f
    join trial tr on tr.id = f.trial_id and tr.deleted_at is null and tr.status in ('booked', 'attended')
    join class c on c.id = tr.class_id
    left join student s on s.id = tr.student_id
   where f.studio_id = p_studio and app.is_admin(p_studio)
   order by f.updated_at desc;
$$;

revoke all on function app.can_write_trial_feedback(uuid), app.save_trial_feedback(uuid, text, text), app.trials_to_decide(uuid) from public;
grant execute on function app.can_write_trial_feedback(uuid), app.save_trial_feedback(uuid, text, text), app.trials_to_decide(uuid) to authenticated;
