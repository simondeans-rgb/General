-- ============================================================================
-- 0025 · Duplicating classes and rolling a term over (R-008)
-- ----------------------------------------------------------------------------
-- One function does both: copy these classes into that term. A class copied
-- into its own term is a duplicate ("Grade 3 Ballet (copy)"); copied into the
-- next term it is the same class carrying on, and its current students can
-- come with it. Sessions are laid down for the new term, skipping its breaks.
--
-- Safe to run twice: a class already carried into a term is not copied again
-- (copied_from remembers where each class came from), and a child is never
-- enrolled twice. Re-enrolment respects capacity — longest-standing first —
-- and reports anyone it could not fit, rather than squeezing them in.
-- ============================================================================

alter table class add column copied_from uuid references class(id) on delete set null;
create index class_copied_from_idx on class (copied_from) where copied_from is not null;

create or replace function app.copy_classes(p_classes uuid[], p_term uuid, p_reenrol boolean default false)
  returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  t term; src class; new_id uuid; n_classes int := 0; n_sessions int := 0; n_enrolled int := 0;
  n_skipped int := 0; not_fitted jsonb := '[]'::jsonb; e record; free int;
begin
  select * into t from term where id = p_term and deleted_at is null;
  if t.id is null then raise exception 'INVALID: no such term' using errcode = 'check_violation'; end if;
  perform app.require_admin(t.studio_id);
  if not app.studio_writable(t.studio_id) then
    raise exception 'FORBIDDEN: this school is read-only' using errcode = 'insufficient_privilege';
  end if;

  for src in select * from class where id = any(p_classes) and deleted_at is null order by day_of_week, start_time loop
    if src.studio_id <> t.studio_id then
      raise exception 'FORBIDDEN: that class belongs to another school' using errcode = 'insufficient_privilege';
    end if;
    -- Already carried into this term: leave it be.
    if src.term_id <> p_term and exists (select 1 from class where copied_from = src.id and term_id = p_term and deleted_at is null) then
      n_skipped := n_skipped + 1;
      continue;
    end if;

    insert into class (studio_id, term_id, dance_style_id, level_id, location_id, room_id, teacher_id,
                       assistant_id, name, description, day_of_week, start_time, duration_min, capacity,
                       age_min, age_max, price_minor, pricing, trial_price_minor, trials_enabled,
                       trial_needs_approval, waitlist_enabled, visibility, prerequisites, created_by, copied_from)
    values (src.studio_id, p_term, src.dance_style_id, src.level_id, src.location_id, src.room_id, src.teacher_id,
            src.assistant_id, case when src.term_id = p_term then src.name || ' (copy)' else src.name end,
            src.description, src.day_of_week, src.start_time, src.duration_min, src.capacity,
            src.age_min, src.age_max, src.price_minor, src.pricing, src.trial_price_minor, src.trials_enabled,
            src.trial_needs_approval, src.waitlist_enabled, src.visibility, src.prerequisites, auth.uid(), src.id)
    returning id into new_id;
    n_classes := n_classes + 1;
    n_sessions := n_sessions + app.generate_class_sessions(new_id);

    if p_reenrol and src.term_id <> p_term then
      free := src.capacity;
      for e in select en.student_id, en.price_minor, s.first_name || ' ' || s.last_name as name
                 from enrolment en join student s on s.id = en.student_id and s.deleted_at is null
                where en.class_id = src.id and en.status = 'active' and en.deleted_at is null
                order by en.started_on, en.created_at loop
        if free <= 0 then
          not_fitted := not_fitted || jsonb_build_object('student', e.name, 'class', src.name);
          continue;
        end if;
        insert into enrolment (studio_id, class_id, student_id, status, started_on, price_minor, note, created_by)
        values (src.studio_id, new_id, e.student_id, 'active', t.starts_on, e.price_minor,
                'Carried over from ' || (select name from term where id = src.term_id), auth.uid());
        free := free - 1;
        n_enrolled := n_enrolled + 1;
      end loop;
    end if;
  end loop;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (t.studio_id, auth.uid(), 'create', 'term', p_term,
          format('%s classes copied in, %s students carried over', n_classes, n_enrolled));

  return jsonb_build_object('classes', n_classes, 'sessions', n_sessions, 'enrolled', n_enrolled,
                            'skipped', n_skipped, 'not_fitted', not_fitted);
end $$;

revoke all on function app.copy_classes(uuid[], uuid, boolean) from public;
grant execute on function app.copy_classes(uuid[], uuid, boolean) to authenticated;
