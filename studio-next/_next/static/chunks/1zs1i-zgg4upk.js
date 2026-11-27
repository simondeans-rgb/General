(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,63059,e=>{"use strict";let s=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,s],63059)},2607,e=>{"use strict";var s=e.i(43476),t=e.i(22016),i=e.i(63059),a=e.i(77326),d=e.i(13927),n=e.i(17658),r=e.i(27389),l=e.i(45060);let o={violet:"bg-violet",amber:"bg-amber",teal:"bg-teal",rose:"bg-rose",indigo:"bg-indigo",lime:"bg-lime"};e.s(["default",0,function(){let e=(0,d.useRows)(["my-teaching-classes"],r.MY_TEACHING_CLASSES);return(0,s.jsx)(a.Shell,{title:"Material",subtitle:"Videos, music and notes, class by class",allow:["owner","admin","teacher"],children:(0,s.jsxs)("div",{className:"mx-auto max-w-2xl",children:[null!=e.error&&(0,s.jsx)(n.ErrorState,{error:e.error,onRetry:()=>e.refetch()}),(0,s.jsxs)("section",{"aria-labelledby":"mat-h",children:[(0,s.jsxs)("div",{className:"mb-1 flex items-baseline gap-3 border-b-2 border-ink pb-2",children:[(0,s.jsx)("h2",{id:"mat-h",className:"section-title flex-1",children:"Your classes"}),!!e.data?.length&&(0,s.jsx)("span",{className:"text-[0.8125rem] text-ink-3",children:e.data.length})]}),e.isLoading&&(0,s.jsx)("div",{className:"space-y-3 pt-3",children:[0,1,2].map(e=>(0,s.jsx)(n.Skeleton,{className:"h-12"},e))}),e.data?.length===0&&(0,s.jsx)(n.EmptyState,{title:"No classes yet",body:"When the office puts you down as teacher or assistant on a class, it appears here."}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:e.data?.map(e=>(0,s.jsx)("li",{children:(0,s.jsxs)(t.default,{href:`/class/?id=${e.id}`,className:"grid min-h-14 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 py-3 hover:bg-surface-2/60",children:[(0,s.jsxs)("span",{className:"min-w-0",children:[(0,s.jsx)("span",{className:"block truncate font-semibold",children:e.name}),e.style&&(0,s.jsxs)("span",{className:"flex items-center gap-1.5 text-[0.8125rem] text-ink-3",children:[(0,s.jsx)("span",{"aria-hidden":!0,className:(0,l.cn)("size-2 rounded-[2px]",o[e.colour??""]??"bg-surface-3")}),e.style]})]}),(0,s.jsx)("span",{className:(0,l.cn)("tnum text-right text-[0.8438rem]",e.resources?"text-ink-2":"text-ink-3"),children:0===e.resources?"Nothing shared":`${e.resources} item${1===e.resources?"":"s"}`}),(0,s.jsx)(i.ChevronRight,{className:"size-4 shrink-0 text-ink-3","aria-hidden":!0})]})},e.id))})]})]})})}])},48848,e=>{e.v(s=>Promise.all(["static/chunks/3e350uomau313.js"].map(s=>e.l(s))).then(()=>s(39726)))},56166,e=>{e.v(s=>Promise.all(["static/chunks/1sfki9bryb301.js"].map(s=>e.l(s))).then(()=>s(52715)))},27389,e=>{"use strict";let s=`r.shows_children, r.for_all_staff, r.no_identifiable_children,
       cs.named, cs.without_consent, cs.family_visible, cs.needs_names`,t="left join lateral app.resource_child_status(r.id) cs on r.shows_children",i=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url, r.duration_sec,
       r.storage_path, f.file_name, f.mime_type, f.size_bytes, ${s},
       (select string_agg(distinct coalesce(c.name, lv.name, 'Everyone'), ', ')
          from resource_assignment a
          left join class c on c.id = a.class_id
          left join level lv on lv.id = a.level_id
         where a.resource_id = r.id and a.deleted_at is null) as scope_label
  from resource r
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  ${t}
 where r.deleted_at is null
 order by r.kind, r.category nulls last, r.title`,a=`
select f.id, f.headline, f.going_well, f.work_on, f.created_at, f.shared_at, f.edited_at,
       c.name as class_name, sm.display_name as author, ds.name as style, f.class_id,
       r.title as resource_title, r.url as resource_url,
       s.first_name || ' ' || s.last_name as student_name, s.id as student_id
  from feedback_note f
  join student s on s.id = f.student_id
  left join class c on c.id = f.class_id
  left join dance_style ds on ds.id = c.dance_style_id
  left join resource r on r.id = f.work_on_resource_id and r.deleted_at is null
  left join staff_member sm on sm.id = f.author_id
 where f.deleted_at is null and f.shared_at is not null
 order by f.shared_at desc`,d=`
select ev.id, ev.kind, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.venue,
       ev.cost_minor, ev.capacity, ev.entries_close_on, ev.requests_open,
       sm.display_name as teacher, ev.student_id,
       app.event_places(ev.id) as going,
       -- Each of my children on this event, with their own status (UR-50).
       -- RLS keeps event_participant to my own children.
       coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'student_id', s.id, 'first_name', s.first_name, 'status', p.status::text)
                                  order by s.date_of_birth)
                   from event_participant p join student s on s.id = p.student_id
                  where p.event_id = ev.id and p.deleted_at is null), '[]') as mine,
       (select p.status::text from event_participant p
         where p.event_id = ev.id and p.deleted_at is null
         order by array_position(array['confirmed','invited','requested','waitlisted','declined','withdrawn'], p.status::text) limit 1) as my_status,
       (select string_agg(s.first_name, ' & ' order by s.date_of_birth) from event_participant p join student s on s.id = p.student_id
         where p.event_id = ev.id and p.deleted_at is null and p.status not in ('declined', 'withdrawn')) as my_student,
       (select p.id from event_participant p where p.event_id = ev.id and p.deleted_at is null
           and p.status = 'invited' limit 1) as my_invite,
       coalesce((select jsonb_agg(jsonb_build_object('subject', cm.subject, 'body', cm.body, 'sent_at', cm.sent_at) order by cm.sent_at desc)
                   from communication cm where cm.event_id = ev.id and cm.deleted_at is null), '[]') as notices,
       coalesce((select jsonb_agg(jsonb_build_object('title', r.title, 'starts_at', r.starts_at) order by r.starts_at)
                   from studio_event r where r.parent_event_id = ev.id and r.deleted_at is null and r.status = 'published'), '[]') as rehearsals,
       coalesce((select jsonb_agg(jsonb_build_object('title', rt.title, 'costume', rt.costume, 'position', rt.position) order by rt.position)
                   from event_routine rt where rt.event_id = ev.id and rt.deleted_at is null
                    and (exists (select 1 from routine_dancer d where d.routine_id = rt.id)
                         or rt.class_id in (select e.class_id from enrolment e where e.status = 'active' and e.deleted_at is null))), '[]') as routines
  from studio_event ev
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at > now() - interval '1 day' and ev.parent_event_id is null
 order by ev.starts_at`,n=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,r=`
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`,l=`
insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
select s.studio_id, s.family_id, s.id, $2::request_kind, $3, $4, auth.uid()
  from student s where s.id = $1
returning id`,o=`
select cs.id, c.id as class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour, coalesce(sr.name, r.name) as room, l.name as location,
       coalesce(cover.display_name, st.display_name) as teacher,
       'class' as entry_kind
  from class_session cs
  join class c on c.id = cs.class_id
  join enrolment e on e.class_id = c.id and e.status = 'active' and e.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
union all
select ev.id, null::uuid, ev.title, ev.starts_at, ev.ends_at, 'scheduled',
       ev.kind::text, 'indigo', null, ev.venue, sm.display_name, 'event'
  from studio_event ev
  join event_participant p on p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at >= $1::timestamptz and ev.starts_at < $2::timestamptz
 order by starts_at`,c=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`,_=`
select r.id, r.kind, r.status, r.subject, r.body, r.created_at, r.session_id, r.action,
       (select name from class where id = r.class_id) as class_name,
       r.student_id, s.first_name || ' ' || s.last_name as student_name,
       r.family_id, f.name as family_name,
       coalesce(u.full_name, (select g.full_name from guardian g where g.family_id = r.family_id
                                and g.deleted_at is null order by g.is_primary desc limit 1)) as guardian_name,
       coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.first_name || ' ' || c.last_name)
                                  order by c.date_of_birth)
                   from student c where c.family_id = r.family_id and c.deleted_at is null), '[]'::jsonb) as children
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
  left join user_account u on u.id = r.raised_by
 where r.deleted_at is null and r.status in ('open','in_progress')
 order by (r.kind = 'medical_update') desc, r.created_at`,u=`
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`,m=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,f=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,h=`
select c.id, c.name, c.description,
       ds.name as style, ds.colour, lv.name as level,
       st.display_name as teacher, asst.display_name as assistant,
       r.name as room, l.name as location,
       c.day_of_week, c.start_time, c.duration_min, c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       t.name as term_name,
       (c.id in (select app.teacher_class_ids())) as i_teach
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
  left join level lv on lv.id = c.level_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member asst on asst.id = c.assistant_id
  left join room r on r.id = c.room_id
  left join location l on l.id = c.location_id
  left join term t on t.id = c.term_id
 where c.id = $1 and c.deleted_at is null`,p=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url,
       r.duration_sec, r.storage_path, r.created_at,
       f.file_name, f.mime_type, f.size_bytes, ${s},
       u.full_name as added_by,
       (r.created_by = auth.uid()) as mine,
       case when a.class_id is null then 'Everyone' else null end as scope_label
  from resource r
  left join resource_assignment a
         on a.resource_id = r.id and a.deleted_at is null and a.class_id = $1
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  left join user_account u on u.id = r.created_by
  ${t}
 where r.deleted_at is null
   and (a.id is not null
        or not exists (select 1 from resource_assignment a2
                        where a2.resource_id = r.id and a2.deleted_at is null))
 order by (a.id is null), r.kind, r.created_at desc`,v=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by,
                      shows_children, for_all_staff)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid(),
       coalesce($10::boolean, false), coalesce($11::boolean, false)
  from class c where c.id = $1
returning id, studio_id`,b=`
with kids as (
  select e.student_id as id, true as in_class from enrolment e
   where e.class_id = $1 and e.status = 'active' and e.deleted_at is null
  union
  select rc.student_id, false from resource_child rc where rc.resource_id = $2::uuid
)
select s.id, s.first_name || ' ' || s.last_name as name,
       bool_or(k.in_class) as in_class,
       exists (select 1 from resource_child rc where rc.resource_id = $2::uuid and rc.student_id = s.id) as named,
       app.consent_now(s.id, 'video') as video, app.consent_now(s.id, 'photography') as photo
  from kids k join student s on s.id = k.id and s.deleted_at is null
 group by s.id, s.first_name, s.last_name
 order by s.first_name, s.last_name`,y=`
delete from resource_child where resource_id = $1 and not (student_id = any($2::uuid[]))`,w=`
insert into resource_child (studio_id, resource_id, student_id)
select r.studio_id, r.id, x from resource r, unnest($2::uuid[]) x where r.id = $1
on conflict (resource_id, student_id) do nothing`,j=`
update resource set shows_children = $2, no_identifiable_children = $3 and $2,
                    for_all_staff = $4, updated_at = now()
 where id = $1 returning id`,g=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,E=`
select app.retire_resource($1) as ok`,$=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ADD_RESOURCE_CHILDREN",0,w,"ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,f,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,g,"CLASS_CHILDREN_CONSENT",0,b,"CLASS_DETAIL",0,h,"CLASS_RESOURCES",0,p,"CLEAR_RESOURCE_CHILDREN",0,y,"CREATE_RESOURCE",0,v,"DECIDE_ENTRY",0,m,"DELETE_RESOURCE",0,E,"EVENTS",0,d,"MY_REQUESTS",0,r,"MY_TEACHING_CLASSES",0,$,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,u,"PENDING_REQUESTS",0,_,"RAISE_REQUEST",0,l,"REQUEST_PLACE",0,n,"RESOURCES",0,i,"STUDENT_FEEDBACK",0,a,"UPDATE_RESOURCE_MEDIA",0,j,"WRITE_FEEDBACK",0,c])}]);