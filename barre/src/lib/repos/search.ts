/**
 * One search across the office's records (R-044). Row-level security scopes
 * every branch, so a search can only ever surface what the person could open.
 * $1 is the typed text; matching is case- and accent-insensitive on words.
 */
export type Hit = { kind: 'family' | 'student' | 'staff' | 'invoice' | 'class' | 'enquiry'; id: string; title: string; detail: string | null; href: string };

export const SEARCH = `
with term as (select '%' || lower(btrim($1)) || '%' as p)
(select 'family' as kind, f.id, f.name as title,
        (select string_agg(g.full_name, ', ') from guardian g where g.family_id = f.id and g.deleted_at is null) as detail,
        '/people?tab=families&id=' || f.id as href
   from family f, term
  where f.deleted_at is null and (lower(f.name) like term.p or exists (
          select 1 from guardian g where g.family_id = f.id and g.deleted_at is null
             and (lower(g.full_name) like term.p or lower(coalesce(g.email, '')) like term.p
                  or regexp_replace(coalesce(g.phone, ''), '\\D', '', 'g') like '%' || nullif(regexp_replace($1, '\\D', '', 'g'), '') || '%')))
  order by f.name limit 5)
union all
(select 'student', s.id, s.first_name || ' ' || s.last_name, f.name, '/people?tab=students&id=' || s.id
   from student s join family f on f.id = s.family_id, term
  where s.deleted_at is null and lower(s.first_name || ' ' || s.last_name) like term.p
  order by s.last_name, s.first_name limit 6)
union all
(select 'staff', st.id, st.display_name, null, '/people?tab=staff&id=' || st.id
   from staff_member st, term
  where st.deleted_at is null and lower(st.display_name) like term.p limit 3)
union all
(select 'invoice', i.id, i.number, f.name || ' · ' || i.status::text, '/billing?id=' || i.id
   from invoice i join family f on f.id = i.family_id, term
  where i.deleted_at is null and (lower(i.number) like term.p or lower(f.name) like term.p)
  order by i.created_at desc limit 5)
union all
(select 'class', c.id, c.name, null, '/classes?id=' || c.id
   from class c, term
  where c.deleted_at is null and lower(c.name) like term.p limit 4)
union all
(select 'enquiry', e.id, coalesce(e.child_name, e.contact_name),
        e.contact_name || ' · ' || replace(e.stage::text, '_', ' '), '/enrolment?enquiry=' || e.id
   from enquiry e, term
  where e.deleted_at is null
    and (lower(e.contact_name) like term.p or lower(coalesce(e.child_name, '')) like term.p
         or lower(coalesce(e.contact_email, '')) like term.p
         or regexp_replace(coalesce(e.contact_phone, ''), '\\D', '', 'g') like '%' || nullif(regexp_replace($1, '\\D', '', 'g'), '') || '%')
  order by e.created_at desc limit 4)`;
