(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,86255,e=>{"use strict";var s=e.i(43476),t=e.i(41775);e.s(["default",0,function(){return(0,s.jsx)(t.FeedbackView,{allow:["guardian"],title:"Feedback",showStudent:!0})}])},41775,e=>{"use strict";var s=e.i(43476),t=e.i(86311),a=e.i(83086);let i=(0,e.i(75254).default)("target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);var d=e.i(77326),n=e.i(13927),r=e.i(17658),l=e.i(27389),o=e.i(75379),c=e.i(45060);let _={not_started:{label:"Not started",tone:"neutral",pct:8},developing:{label:"Developing",tone:"caution",pct:40},secure:{label:"Secure",tone:"info",pct:72},mastered:{label:"Mastered",tone:"positive",pct:100}};function u({allow:e,title:m,showStudent:f}){let p=(0,n.useRows)(["feedback"],l.STUDENT_FEEDBACK),h=(0,n.useRows)(["assessments"],l.MY_ASSESSMENTS);return(0,s.jsx)(d.Shell,{title:m,allow:e,children:(0,s.jsxs)("div",{className:"mx-auto max-w-2xl space-y-4",children:[p.isLoading&&(0,s.jsx)(r.Card,{className:"space-y-3 p-4",children:[0,1].map(e=>(0,s.jsx)(r.Skeleton,{className:"h-24"},e))}),p.error&&(0,s.jsx)(r.ErrorState,{error:p.error,onRetry:()=>p.refetch()}),p.data?.length===0&&!p.isLoading&&(0,s.jsx)(r.Card,{children:(0,s.jsx)(r.EmptyState,{icon:(0,s.jsx)(t.MessageSquare,{className:"size-5"}),title:"No feedback yet",body:"Teachers share notes after class. They appear here once they do."})}),p.data?.map(e=>(0,s.jsx)(r.Card,{children:(0,s.jsxs)("div",{className:"p-4",children:[(0,s.jsxs)("div",{className:"flex flex-wrap items-baseline gap-x-2 gap-y-1",children:[(0,s.jsx)("h2",{className:"font-semibold",children:e.headline}),f&&(0,s.jsx)(r.Badge,{tone:"accent",children:e.student_name.split(" ")[0]}),(0,s.jsx)("span",{className:"ml-auto text-[12.5px] text-ink-3",children:(0,o.relativeDay)(e.shared_at)})]}),e.going_well&&(0,s.jsxs)("p",{className:"mt-2.5 flex gap-2 text-sm",children:[(0,s.jsx)(a.Sparkles,{className:"mt-0.5 size-4 shrink-0 text-positive","aria-hidden":!0}),(0,s.jsx)("span",{children:e.going_well})]}),e.work_on&&(0,s.jsxs)("p",{className:"mt-2 flex gap-2 rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm",children:[(0,s.jsx)(i,{className:"mt-0.5 size-4 shrink-0 text-accent","aria-hidden":!0}),(0,s.jsxs)("span",{children:[(0,s.jsx)("span",{className:"font-medium",children:"To work on: "}),e.work_on]})]}),(0,s.jsxs)("p",{className:"mt-2.5 text-[12px] text-ink-3",children:[e.author,e.class_name?` \xb7 ${e.class_name}`:""]})]})},e.id)),(h.data?.length??0)>0&&(0,s.jsxs)(r.Card,{children:[(0,s.jsx)(r.CardHeader,{title:"Progress",subtitle:"Where your teacher thinks you are with each skill"}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:h.data.map(e=>{let t=_[e.level]??_.not_started;return(0,s.jsxs)("li",{className:"px-4 py-3",children:[(0,s.jsxs)("div",{className:"flex items-center gap-3",children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsx)("span",{className:"block truncate font-medium",children:e.skill}),(0,s.jsxs)("span",{className:"block text-[12px] text-ink-3",children:[f?`${e.student_name} \xb7 `:"",e.style," · ",(0,o.dateShort)(e.assessed_on)]})]}),(0,s.jsx)(r.Badge,{tone:t.tone,children:t.label})]}),(0,s.jsx)("span",{"aria-hidden":!0,className:"mt-2 block h-1.5 overflow-hidden rounded-full bg-surface-3",children:(0,s.jsx)("span",{className:(0,c.cn)("block h-full rounded-full","mastered"===e.level?"bg-positive":"secure"===e.level?"bg-info":"developing"===e.level?"bg-caution":"bg-surface-3"),style:{width:`${t.pct}%`}})})]},e.id)})})]})]})})}e.s(["FeedbackView",0,u,"default",0,function(){return(0,s.jsx)(u,{allow:["student"],title:"Your feedback"})}],41775)},27389,e=>{"use strict";let s=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url, r.duration_sec,
       r.storage_path, f.file_name, f.mime_type, f.size_bytes,
       (select string_agg(distinct coalesce(c.name, lv.name, 'Everyone'), ', ')
          from resource_assignment a
          left join class c on c.id = a.class_id
          left join level lv on lv.id = a.level_id
         where a.resource_id = r.id and a.deleted_at is null) as scope_label
  from resource r
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
 where r.deleted_at is null
 order by r.kind, r.category nulls last, r.title`,t=`
select f.id, f.headline, f.going_well, f.work_on, f.created_at, f.shared_at,
       c.name as class_name, sm.display_name as author,
       s.first_name || ' ' || s.last_name as student_name, s.id as student_id
  from feedback_note f
  join student s on s.id = f.student_id
  left join class c on c.id = f.class_id
  left join staff_member sm on sm.id = f.author_id
 where f.deleted_at is null and f.shared_at is not null
 order by f.shared_at desc`,a=`
select a.id, a.skill, a.level, a.assessed_on, a.note,
       ds.name as style, s.first_name as student_name
  from skill_assessment a
  join student s on s.id = a.student_id
  left join dance_style ds on ds.id = a.dance_style_id
 where a.deleted_at is null
 order by s.first_name, a.skill`,i=`
select ev.id, ev.kind, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.venue,
       ev.cost_minor, ev.capacity, ev.entries_close_on, ev.requests_open,
       sm.display_name as teacher, ev.student_id,
       (select count(*)::int from event_participant p
         where p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null) as going,
       (select p.status::text from event_participant p
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_status,
       (select s.first_name from event_participant p join student s on s.id = p.student_id
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_student
  from studio_event ev
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at > now() - interval '1 day'
 order by ev.starts_at`,d=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,n=`
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`,r=`
insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
select s.studio_id, s.family_id, s.id, $2::request_kind, $3, $4, auth.uid()
  from student s where s.id = $1
returning id`,l=`
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
 order by starts_at`,o=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`,c=`
select r.id, r.kind, r.status, r.subject, r.body, r.created_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null and r.status in ('open','in_progress')
 order by r.created_at`,_=`
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`,u=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,m=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,f=`
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
       f.file_name, f.mime_type, f.size_bytes,
       u.full_name as added_by,
       (r.created_by = auth.uid()) as mine,
       case when a.class_id is null then 'Everyone' else null end as scope_label
  from resource r
  left join resource_assignment a
         on a.resource_id = r.id and a.deleted_at is null and a.class_id = $1
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  left join user_account u on u.id = r.created_by
 where r.deleted_at is null
   and (a.id is not null
        or not exists (select 1 from resource_assignment a2
                        where a2.resource_id = r.id and a2.deleted_at is null))
 order by (a.id is null), r.kind, r.created_at desc`,h=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,v=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,y=`
select app.retire_resource($1) as ok`,j=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ANSWER_REQUEST",0,m,"ASSIGN_RESOURCE_TO_CLASS",0,v,"CLASS_DETAIL",0,f,"CLASS_RESOURCES",0,p,"CREATE_RESOURCE",0,h,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,y,"EVENTS",0,i,"MY_ASSESSMENTS",0,a,"MY_REQUESTS",0,n,"MY_TEACHING_CLASSES",0,j,"MY_TIMETABLE",0,l,"PENDING_ENTRIES",0,_,"PENDING_REQUESTS",0,c,"RAISE_REQUEST",0,r,"REQUEST_PLACE",0,d,"RESOURCES",0,s,"STUDENT_FEEDBACK",0,t,"WRITE_FEEDBACK",0,o])}]);