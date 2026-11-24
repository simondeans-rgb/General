(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,63059,e=>{"use strict";let s=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,s],63059)},46897,e=>{"use strict";let s=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,s],46897)},84614,e=>{"use strict";let s=(0,e.i(75254).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,s],84614)},94266,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(22016),i=e.i(89853),n=e.i(17697),d=e.i(64030),r=e.i(63059),l=e.i(83086),o=e.i(46897),c=e.i(84614),_=e.i(75505),m=e.i(77326),u=e.i(13927),f=e.i(31502),h=e.i(17658),p=e.i(27389),v=e.i(75379);let x={competition:"amber",show:"violet",exam:"critical",workshop:"teal",private_lesson:"indigo",rehearsal:"neutral",social:"lime"},y={competition:"Competition",show:"Show",exam:"Exam",workshop:"Workshop",private_lesson:"Private lesson",rehearsal:"Rehearsal",social:"Social"};function j({href:e,icon:t,label:i,count:n}){return(0,s.jsxs)(a.default,{href:e,className:"card flex flex-col gap-2 p-4 transition-colors hover:bg-surface-2",children:[(0,s.jsx)("span",{className:"grid size-9 place-items-center rounded-full bg-accent-soft text-accent-ink","aria-hidden":!0,children:t}),(0,s.jsx)("span",{className:"text-sm font-medium leading-tight",children:i}),null!=n&&(0,s.jsxs)("span",{className:"text-[12.5px] text-ink-3",children:[n," available"]})]})}e.s(["default",0,function(){let{session:e}=(0,f.useSession)(),[g]=t.useMemo(()=>(0,v.dayRange)(0),[]),w=t.useMemo(()=>{let e=new Date(g);return e.setDate(e.getDate()+14),e.toISOString()},[g]),b=(0,u.useRows)(["learn-timetable",g],p.MY_TIMETABLE,[g,w]),E=(0,u.useRows)(["learn-feedback"],p.STUDENT_FEEDBACK),k=(0,u.useRows)(["learn-events"],p.EVENTS),N=(0,u.useRows)(["learn-resources"],p.RESOURCES),S=(b.data??[]).filter(e=>"cancelled"!==e.status)[0],$=E.data?.[0],R=(k.data??[]).filter(e=>"confirmed"===e.my_status||"private_lesson"===e.kind);return(0,s.jsx)(m.Shell,{title:`${(0,v.greeting)()}, ${e?.name.split(" ")[0]??""}`,subtitle:(0,v.dateLong)(new Date),allow:["student"],children:(0,s.jsxs)("div",{className:"mx-auto max-w-lg space-y-4",children:[b.isLoading&&(0,s.jsx)(h.Card,{className:"p-4",children:(0,s.jsx)(h.Skeleton,{className:"h-24"})}),b.error&&(0,s.jsx)(h.ErrorState,{error:b.error,onRetry:()=>b.refetch()}),S&&(0,s.jsxs)(h.Card,{className:"overflow-hidden",children:[(0,s.jsxs)("div",{className:"bg-accent px-4 py-3 text-white",children:[(0,s.jsx)("p",{className:"text-[12px] font-medium uppercase tracking-[0.06em] text-white/75",children:"Today"===(0,v.relativeDay)(S.starts_at)?"Next up today":"Next"}),(0,s.jsx)("p",{className:"mt-0.5 text-[19px] font-semibold tracking-tight",children:S.name}),(0,s.jsxs)("p",{className:"mt-0.5 text-white/85",children:[(0,v.relativeDay)(S.starts_at)," at ",(0,v.time)(S.starts_at)]})]}),(0,s.jsxs)("div",{className:"flex flex-wrap gap-x-5 gap-y-1 p-4 text-sm text-ink-2",children:[S.teacher&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1.5",children:[(0,s.jsx)(c.User,{className:"size-3.5","aria-hidden":!0}),S.teacher]}),(S.room||S.location)&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1.5",children:[(0,s.jsx)(o.MapPin,{className:"size-3.5","aria-hidden":!0}),[S.location,S.room].filter(Boolean).join(" · ")]})]}),S.class_id&&(0,s.jsxs)(a.default,{href:`/class/?id=${S.class_id}`,className:"flex items-center gap-2 border-t border-line px-4 py-3 text-sm font-medium hover:bg-surface-2",children:[(0,s.jsx)(_.FolderOpen,{className:"size-4 text-ink-3","aria-hidden":!0}),"Videos, music and notes for this class",(0,s.jsx)(r.ChevronRight,{className:"ml-auto size-4 text-ink-3","aria-hidden":!0})]})]}),!S&&!b.isLoading&&(0,s.jsx)(h.Card,{children:(0,s.jsx)(h.EmptyState,{icon:(0,s.jsx)(i.CalendarDays,{className:"size-5"}),title:"Nothing coming up",body:"Your classes will show here once the next term is published."})}),$&&(0,s.jsxs)(h.Card,{children:[(0,s.jsx)(h.CardHeader,{title:"Latest feedback",action:(0,s.jsx)(a.default,{href:"/learn/feedback",className:"text-[13px] font-medium text-accent hover:underline",children:"All"})}),(0,s.jsxs)("div",{className:"p-4",children:[(0,s.jsxs)("p",{className:"flex items-center gap-1.5 font-medium",children:[(0,s.jsx)(l.Sparkles,{className:"size-4 text-accent","aria-hidden":!0}),$.headline]}),$.going_well&&(0,s.jsx)("p",{className:"mt-1.5 text-sm text-ink-2",children:$.going_well}),$.work_on&&(0,s.jsxs)("p",{className:"mt-2 rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm",children:[(0,s.jsx)("span",{className:"font-medium",children:"To work on: "}),$.work_on]}),(0,s.jsxs)("p",{className:"mt-2 text-[12px] text-ink-3",children:[$.author,$.class_name?` \xb7 ${$.class_name}`:""," · ",(0,v.relativeDay)($.shared_at)]})]})]}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-3",children:[(0,s.jsx)(j,{href:"/learn/library",icon:(0,s.jsx)(n.PlayCircle,{className:"size-5"}),label:"Videos and tracks",count:N.data?.length}),(0,s.jsx)(j,{href:"/learn/events",icon:(0,s.jsx)(d.Trophy,{className:"size-5"}),label:"Competitions and events",count:k.data?.length})]}),R.length>0&&(0,s.jsxs)(h.Card,{children:[(0,s.jsx)(h.CardHeader,{title:"You're down for"}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:R.slice(0,4).map(e=>(0,s.jsx)("li",{className:"flex items-center gap-3 px-4 py-3",children:(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("span",{className:"flex flex-wrap items-center gap-2",children:[(0,s.jsx)("span",{className:"truncate font-medium",children:e.title}),(0,s.jsx)(h.Badge,{tone:x[e.kind]??"neutral",children:y[e.kind]??e.kind})]}),(0,s.jsxs)("span",{className:"mt-0.5 block truncate text-[12.5px] text-ink-2",children:[(0,v.relativeDay)(e.starts_at)," · ",(0,v.time)(e.starts_at),e.venue?` \xb7 ${e.venue}`:""]})]})},e.id))})]})]})})}])},27389,e=>{"use strict";let s=`
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
 order by ev.starts_at`,n=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,d=`
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
 order by ev.starts_at`,m=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,u=`
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
 where c.id = $1 and c.deleted_at is null`,h=`
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
 order by (a.id is null), r.kind, r.created_at desc`,p=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,v=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,x=`
select app.retire_resource($1) as ok`,y=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ANSWER_REQUEST",0,u,"ASSIGN_RESOURCE_TO_CLASS",0,v,"CLASS_DETAIL",0,f,"CLASS_RESOURCES",0,h,"CREATE_RESOURCE",0,p,"DECIDE_ENTRY",0,m,"DELETE_RESOURCE",0,x,"EVENTS",0,i,"MY_ASSESSMENTS",0,a,"MY_REQUESTS",0,d,"MY_TEACHING_CLASSES",0,y,"MY_TIMETABLE",0,l,"PENDING_ENTRIES",0,_,"PENDING_REQUESTS",0,c,"RAISE_REQUEST",0,r,"REQUEST_PLACE",0,n,"RESOURCES",0,s,"STUDENT_FEEDBACK",0,t,"WRITE_FEEDBACK",0,o])}]);