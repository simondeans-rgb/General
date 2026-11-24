-- ============================================================================
-- 0027 · Importing families from a spreadsheet (R-013)
-- ----------------------------------------------------------------------------
-- One row per child. The browser maps the school's columns onto ours and
-- sends rows as JSON objects with these keys (all text):
--   parent_name*, parent_email, parent_phone, second_parent_name,
--   second_parent_email, second_parent_phone, child_first_name*,
--   child_last_name, child_dob*, emergency_name, emergency_phone,
--   allergies, medical_notes, photo_consent, classes (names separated by ; or ,)
--
-- Rows are grouped into families by the parent's email (else phone, else
-- name). A family whose parent email already exists here is added to, not
-- duplicated (matched by email, else phone); a child already in that family (same name and birthday) is
-- skipped, so a file can be imported twice safely.
--
-- p_commit = false validates only and returns the problems row by row; it
-- writes nothing. p_commit = true imports everything or nothing: one bad row
-- and the whole import is refused. Plan limits are enforced by the existing
-- student trigger, so an import that would pass the plan fails cleanly.
-- Medical notes are written to the medical record and the import is audited.
-- ============================================================================

create or replace function app.import_families(p_rows jsonb, p_commit boolean default false)
  returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid; r jsonb; i int := 0; errs jsonb := '[]'::jsonb; warns jsonb := '[]'::jsonb;
  fam_key text; fam_id uuid; kid uuid; dob date; cls text; cid uuid;
  fams jsonb := '{}'::jsonb; n_fam int := 0; n_kid int := 0; n_enrol int := 0; n_skip int := 0; n_med int := 0;
  existing uuid; adds jsonb := '{}'::jsonb; ecphone text;
begin
  select id into sid from studio where deleted_at is null and app.is_admin(id) limit 1;
  perform app.require_admin(sid);
  if p_commit and not app.studio_writable(sid) then
    raise exception 'FORBIDDEN: this school is read-only' using errcode = 'insufficient_privilege';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'INVALID: the file has no rows' using errcode = 'check_violation';
  end if;
  if jsonb_array_length(p_rows) > 2000 then
    raise exception 'INVALID: import at most 2,000 rows at a time' using errcode = 'check_violation';
  end if;

  -- ── Pass 1: check every row; write nothing ──
  for r in select * from jsonb_array_elements(p_rows) loop
    i := i + 1;
    if coalesce(btrim(r ->> 'parent_name'), '') = '' then
      errs := errs || jsonb_build_object('row', i, 'message', 'No parent name'); end if;
    if coalesce(btrim(r ->> 'child_first_name'), '') = '' then
      errs := errs || jsonb_build_object('row', i, 'message', 'No child first name'); end if;
    begin
      dob := app.parse_date(r ->> 'child_dob');
      if dob is null then errs := errs || jsonb_build_object('row', i, 'message', 'No date of birth');
      elsif dob > current_date or dob < current_date - interval '100 years' then
        errs := errs || jsonb_build_object('row', i, 'message', 'Date of birth ' || (r ->> 'child_dob') || ' does not look right'); end if;
    exception when others then
      errs := errs || jsonb_build_object('row', i, 'message', 'Cannot read the date of birth "' || (r ->> 'child_dob') || '" — use DD/MM/YYYY');
    end;
    if nullif(btrim(r ->> 'parent_email'), '') is not null and btrim(r ->> 'parent_email') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
      errs := errs || jsonb_build_object('row', i, 'message', 'Email "' || (r ->> 'parent_email') || '" is not valid'); end if;
    if coalesce(nullif(btrim(r ->> 'emergency_phone'), ''), nullif(btrim(r ->> 'parent_phone'), '')) is null then
      errs := errs || jsonb_build_object('row', i, 'message', 'No phone number to ring in an emergency'); end if;
    for cls in select btrim(x) from regexp_split_to_table(coalesce(r ->> 'classes', ''), '[;,]') x where btrim(x) <> '' loop
      select id into cid from class where studio_id = sid and deleted_at is null and lower(name) = lower(cls)
        order by (select starts_on from term where id = class.term_id) desc limit 1;
      if cid is null then
        errs := errs || jsonb_build_object('row', i, 'message', 'No class called "' || cls || '"');
      else
        adds := jsonb_set(adds, array[cid::text], to_jsonb(coalesce((adds ->> cid::text)::int, 0) + 1));
      end if;
    end loop;
  end loop;

  -- Classes the import would overfill.
  for cid in select (k)::uuid from jsonb_object_keys(adds) k loop
    if app.class_enrolled_count(cid) + (adds ->> cid::text)::int > (select capacity from class where id = cid) then
      warns := warns || jsonb_build_object('message', (select name from class where id = cid) || ' would be over its '
               || (select capacity from class where id = cid) || ' places — the extra children go on its waiting list');
    end if;
  end loop;

  if not p_commit or jsonb_array_length(errs) > 0 then
    if p_commit then
      raise exception 'INVALID: % row(s) need fixing before anything is imported', jsonb_array_length(errs)
        using errcode = 'check_violation';
    end if;
    return jsonb_build_object('ok', jsonb_array_length(errs) = 0, 'rows', i, 'errors', errs, 'warnings', warns,
      'families', (select count(distinct coalesce(nullif(lower(btrim(x ->> 'parent_email')), ''),
                                                  nullif(regexp_replace(x ->> 'parent_phone', '\D', '', 'g'), ''),
                                                  lower(btrim(x ->> 'parent_name'))))
                     from jsonb_array_elements(p_rows) x));
  end if;

  -- ── Pass 2: import ──
  i := 0;
  for r in select * from jsonb_array_elements(p_rows) loop
    i := i + 1;
    fam_key := coalesce(nullif(lower(btrim(r ->> 'parent_email')), ''),
                        nullif(regexp_replace(r ->> 'parent_phone', '\D', '', 'g'), ''), lower(btrim(r ->> 'parent_name')));
    fam_id := (fams ->> fam_key)::uuid;
    if fam_id is null then
      -- An existing family: same parent email, else same parent phone number.
      select g.family_id into fam_id from guardian g where g.studio_id = sid and g.deleted_at is null
         and ((nullif(lower(btrim(r ->> 'parent_email')), '') is not null and lower(g.email) = lower(btrim(r ->> 'parent_email')))
           or (length(regexp_replace(coalesce(r ->> 'parent_phone', ''), '\D', '', 'g')) >= 6
               and regexp_replace(coalesce(g.phone, ''), '\D', '', 'g') = regexp_replace(r ->> 'parent_phone', '\D', '', 'g')))
       order by (lower(g.email) = lower(btrim(r ->> 'parent_email'))) desc nulls last limit 1;
      if fam_id is null then
        insert into family (studio_id, name, created_by)
        values (sid, coalesce(nullif(btrim(r ->> 'child_last_name'), ''),
                              regexp_replace(btrim(r ->> 'parent_name'), '^.*\s', '')) || ' family', auth.uid())
        returning id into fam_id;
        insert into guardian (studio_id, family_id, full_name, email, phone, is_primary)
        values (sid, fam_id, btrim(r ->> 'parent_name'), nullif(lower(btrim(r ->> 'parent_email')), ''),
                nullif(btrim(r ->> 'parent_phone'), ''), true);
        if nullif(btrim(r ->> 'second_parent_name'), '') is not null then
          insert into guardian (studio_id, family_id, full_name, email, phone, is_primary)
          values (sid, fam_id, btrim(r ->> 'second_parent_name'), nullif(lower(btrim(r ->> 'second_parent_email')), ''),
                  nullif(btrim(r ->> 'second_parent_phone'), ''), false);
        end if;
        n_fam := n_fam + 1;
      end if;
      fams := jsonb_set(fams, array[fam_key], to_jsonb(fam_id::text));
    end if;

    dob := app.parse_date(r ->> 'child_dob');
    select id into existing from student where family_id = fam_id and deleted_at is null
       and lower(first_name) = lower(btrim(r ->> 'child_first_name')) and date_of_birth = dob;
    if existing is not null then n_skip := n_skip + 1; continue; end if;

    insert into student (studio_id, family_id, first_name, last_name, date_of_birth, created_by)
    values (sid, fam_id, btrim(r ->> 'child_first_name'),
            coalesce(nullif(btrim(r ->> 'child_last_name'), ''), regexp_replace(btrim(r ->> 'parent_name'), '^.*\s', '')),
            dob, auth.uid())
    returning id into kid;
    n_kid := n_kid + 1;

    ecphone := coalesce(nullif(btrim(r ->> 'emergency_phone'), ''), btrim(r ->> 'parent_phone'));
    insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
    values (sid, kid, coalesce(nullif(btrim(r ->> 'emergency_name'), ''), btrim(r ->> 'parent_name')),
            case when nullif(btrim(r ->> 'emergency_name'), '') is null then 'Parent/carer' end, ecphone, 1);

    if nullif(btrim(r ->> 'allergies'), '') is not null or nullif(btrim(r ->> 'medical_notes'), '') is not null then
      insert into medical_record (studio_id, student_id, allergies, conditions, requires_alert, updated_by)
      values (sid, kid, nullif(btrim(r ->> 'allergies'), ''), nullif(btrim(r ->> 'medical_notes'), ''),
              nullif(btrim(r ->> 'allergies'), '') is not null and lower(btrim(r ->> 'allergies')) not in ('none', 'no', 'n/a', 'none known'),
              auth.uid());
      n_med := n_med + 1;
    end if;

    if lower(coalesce(r ->> 'photo_consent', '')) in ('yes', 'y', 'true', '1', 'no', 'n', 'false', '0') then
      insert into consent_record (studio_id, student_id, kind, granted, granted_by, note)
      values (sid, kid, 'photography', lower(r ->> 'photo_consent') in ('yes', 'y', 'true', '1'), auth.uid(), 'Imported');
    end if;

    for cls in select btrim(x) from regexp_split_to_table(coalesce(r ->> 'classes', ''), '[;,]') x where btrim(x) <> '' loop
      select id into cid from class where studio_id = sid and deleted_at is null and lower(name) = lower(cls)
        order by (select starts_on from term where id = class.term_id) desc limit 1;
      if app.class_enrolled_count(cid) < (select capacity from class where id = cid) then
        insert into enrolment (studio_id, class_id, student_id, status, note, created_by)
        values (sid, cid, kid, 'active', 'Imported', auth.uid());
        n_enrol := n_enrol + 1;
      else
        insert into waitlist_entry (studio_id, class_id, student_id, status, position, note)
        values (sid, cid, kid, 'waiting', 0, 'Imported — class was full');
      end if;
    end loop;
  end loop;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'import', 'family', null,
          format('Imported %s families, %s children (%s with medical notes), %s enrolments; %s already here', n_fam, n_kid, n_med, n_enrol, n_skip));

  return jsonb_build_object('ok', true, 'rows', i, 'families', n_fam, 'children', n_kid, 'enrolled', n_enrol,
                            'skipped', n_skip, 'medical', n_med, 'errors', '[]'::jsonb, 'warnings', warns);
end $$;

-- Dates as schools actually type them: 2018-03-14, 14/03/2018, 14-03-2018, 14.3.18.
create or replace function app.parse_date(p text) returns date
  language plpgsql immutable as $$
declare t text := btrim(coalesce(p, '')); m text[];
begin
  if t = '' then return null; end if;
  if t ~ '^\d{4}-\d{1,2}-\d{1,2}$' then return t::date; end if;
  m := regexp_match(t, '^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2}|\d{4})$');
  if m is null then raise exception 'unreadable date'; end if;
  return make_date(case when length(m[3]) = 2 then
                     case when m[3]::int > extract(year from current_date)::int % 100 then 1900 else 2000 end + m[3]::int
                   else m[3]::int end, m[2]::int, m[1]::int);
end $$;

revoke all on function app.import_families(jsonb, boolean) from public;
grant execute on function app.import_families(jsonb, boolean) to authenticated;
grant execute on function app.parse_date(text) to authenticated;
