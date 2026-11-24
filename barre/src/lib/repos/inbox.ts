/* Conversations with families, broadcasts and templates. Direct messages are
   readable by the office and the family only (migration 0017). */

export type Thread = {
  family_id: string; family_name: string; guardian: string | null;
  last_body: string; last_subject: string | null; last_at: string; last_inbound: boolean;
  unread: number; messages: number;
};

export const THREADS = `
select f.id as family_id, f.name as family_name,
       (select g.full_name from guardian g where g.family_id = f.id and g.deleted_at is null
         order by g.is_primary desc limit 1) as guardian,
       last.body as last_body, last.subject as last_subject, last.sent_at as last_at,
       last.inbound as last_inbound,
       (select count(*)::int from communication c where c.family_id = f.id and c.kind = 'direct'
          and c.deleted_at is null and c.inbound and c.request_id is null and not exists (
            select 1 from communication_read r where r.communication_id = c.id and r.user_id = auth.uid())) as unread,
       (select count(*)::int from communication c where c.family_id = f.id and c.kind = 'direct'
          and c.deleted_at is null) as messages
  from family f
  join lateral (select body, subject, sent_at, inbound from communication c
                 where c.family_id = f.id and c.kind = 'direct' and c.deleted_at is null
                 order by c.sent_at desc limit 1) last on true
 where f.deleted_at is null
 order by last.sent_at desc`;

export type Message = {
  id: string; subject: string | null; body: string; sent_at: string; inbound: boolean;
  sender: string | null; read_by_me: boolean; is_request?: boolean;
};

export const CONVERSATION = `
select c.id, c.subject, c.body, c.sent_at, c.inbound, c.request_id is not null as is_request,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.family_id = $1 and c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`;

/** The guardian's own conversation: RLS limits it to their family. */
export const MY_CONVERSATION = `
select c.id, c.subject, c.body, c.sent_at, c.inbound, c.request_id is not null as is_request,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`;

export type Broadcast = {
  id: string; kind: 'class_broadcast' | 'studio_announcement'; subject: string | null; body: string;
  sent_at: string; class_id: string | null; class_name: string | null; sender: string | null;
  read_by_me: boolean; scheduled?: boolean;
};

export const BROADCASTS = `
select c.id, c.kind, c.subject, c.body, c.sent_at, c.class_id, cl.name as class_name, c.sent_at > now() as scheduled,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c left join class cl on cl.id = c.class_id
 where c.kind in ('class_broadcast', 'studio_announcement') and c.deleted_at is null
 order by c.sent_at desc
 limit 60`;

export type Audience = { id: string; name: string; families: number; teacher: string | null };
export const CLASS_AUDIENCES = `
select c.id, c.name, sm.display_name as teacher,
       (select count(distinct s.family_id)::int from enrolment e join student s on s.id = e.student_id
         where e.class_id = c.id and e.status = 'active' and e.deleted_at is null) as families
  from class c left join staff_member sm on sm.id = c.teacher_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`;

export const FAMILY_COUNT = `select count(*)::int as n from family where deleted_at is null`;

export type Template = { id: string; name: string; subject: string | null; body: string };
export const TEMPLATES = `
select id, name, subject, body from communication_template
 where deleted_at is null order by name`;
export const CREATE_TEMPLATE = `
insert into communication_template (studio_id, name, subject, body)
select studio_id, $1, nullif(btrim($2), ''), $3 from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`;
export const UPDATE_TEMPLATE = `
update communication_template set name = $2, subject = nullif(btrim($3), ''), body = $4, updated_at = now()
 where id = $1 returning id`;
export const REMOVE_TEMPLATE = `select app.soft_delete('communication_template', $1)`;

export const SEND_DIRECT = `
insert into communication (studio_id, kind, channel, family_id, subject, body)
select studio_id, 'direct', 'in_app', id, nullif(btrim($2), ''), btrim($3) from family where id = $1
returning id`;
/** As above, at a chosen time (R-037). $4 is when. */
export const SEND_DIRECT_AT = `
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_at)
select studio_id, 'direct', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from family where id = $1
returning id`;
export const SEND_CLASS = `
insert into communication (studio_id, kind, channel, class_id, subject, body)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3) from class where id = $1
returning id`;
export const SEND_CLASS_AT = `
insert into communication (studio_id, kind, channel, class_id, subject, body, sent_at)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from class where id = $1
returning id`;
export const SEND_STUDIO = `
insert into communication (studio_id, kind, channel, subject, body)
select studio_id, 'studio_announcement', 'in_app', nullif(btrim($1), ''), btrim($2) from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`;
export const SEND_STUDIO_AT = `
insert into communication (studio_id, kind, channel, subject, body, sent_at)
select studio_id, 'studio_announcement', 'in_app', nullif(btrim($1), ''), btrim($2), $3::timestamptz from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`;

/* ── Who has seen it, and nudging those who haven't (R-018) ─────────────── */
export type Reach = { family_id: string; family_name: string; has_login: boolean; seen: boolean; seen_at: string | null };
export const REACH = `select * from app.message_reach($1)`;
export const REMIND_UNREAD = `select app.remind_unread($1) as n`;
export const RELEASE_SCHEDULED = `
select app.release_scheduled(m.studio_id) as n from membership m
 where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1`;
/** Teacher → a child's family, in the family's conversation (R-028). */
export const TEACHER_MESSAGE = `select app.teacher_message_family($1, $2, $3) as id`;
export const MY_SENT_TO_FAMILIES = `
select c.id, c.subject, c.body, c.sent_at,
       (select string_agg(s.first_name, ', ' order by s.first_name) from student s
         where s.family_id = c.family_id and s.deleted_at is null) as children,
       exists (select 1 from app.message_reach(c.id) r where r.seen) as seen
  from communication c
 where c.kind = 'direct' and c.sent_by = auth.uid() and c.deleted_at is null
 order by c.sent_at desc limit 20`;

/* ── Notification preferences (R-019) ───────────────────────────────────── */
export type Pref = { category: string; in_app: boolean; email: boolean };
export const MY_PREFS = `select category, in_app, email from notification_preference where user_id = auth.uid()`;
export const SET_PREF = `select app.set_notification_preference($1, $2, $3)`;
export const MY_QUIET = `select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to from user_account where id = auth.uid()`;
export const SET_QUIET = `select app.set_quiet_hours($1::time, $2::time)`;
/** A guardian writing to the studio. Their family is the only one they can name. */
export const SEND_TO_STUDIO = `
insert into communication (studio_id, kind, channel, family_id, subject, body)
select studio_id, 'direct', 'in_app', family_id, nullif(btrim($1), ''), btrim($2)
  from guardian where user_id = auth.uid() and deleted_at is null
 limit 1 returning id`;

export const MARK_READ = `select app.mark_read($1::uuid[])`;

export const UNREAD_FOR_ME = `
select count(*)::int as n from communication c
 where c.deleted_at is null and c.sent_by is distinct from auth.uid()
   and (c.inbound or c.kind <> 'direct' or not app.is_admin(c.studio_id))
   and (c.request_id is null or not app.is_admin(c.studio_id)) and c.sent_at <= now()
   and not exists (select 1 from communication_read r where r.communication_id = c.id and r.user_id = auth.uid())
   and c.sent_at > now() - interval '60 days'`;

// ── Notifications ───────────────────────────────────────────────────────
export type Note = { id: string; kind: string; title: string; body: string | null;
  href: string | null; read_at: string | null; created_at: string };
export const NOTIFICATIONS = `
select id, kind, title, body, href, read_at, created_at from notification
 where deleted_at is null order by created_at desc limit 40`;
export const UNREAD_NOTIFICATIONS = `
select count(*)::int as n from notification where deleted_at is null and read_at is null`;
export const MARK_NOTIFICATIONS = `select app.mark_notifications_read($1::uuid[])`;

// ── Automations ─────────────────────────────────────────────────────────
export type Rule = { id: string; event: string; enabled: boolean; template_id: string | null;
  template_name: string | null; sent: number; last_sent: string | null; due: number };
export const RULES = `
select r.id, r.event, r.enabled, r.template_id, t.name as template_name,
       (select count(*)::int from automation_run x where x.rule_id = r.id) as sent,
       (select max(ran_at) from automation_run x where x.rule_id = r.id) as last_sent,
       coalesce((select d.due from app.automation_due(r.studio_id) d where d.rule_id = r.id), 0) as due
  from automation_rule r
  left join communication_template t on t.id = r.template_id and t.deleted_at is null
 order by array_position(array['trial_booked','trial_reminder_48h','trial_reminder_same_day',
                               'trial_attended','trial_missed','waitlist_offer'], r.event)`;
export const SET_RULE = `update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id`;
export const RUN_AUTOMATIONS = `
select app.run_automations(studio_id) as sent from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`;

export type Outbound = { id: string; to_name: string | null; to_address: string; subject: string | null;
  status: string; created_at: string };
export const OUTBOX = `
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;
