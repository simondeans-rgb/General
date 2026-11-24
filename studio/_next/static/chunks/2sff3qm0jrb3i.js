(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54616,e=>{"use strict";var t=e.i(12598),s=e.i(71645),a=e.i(19273),i=e.i(15823),n=e.i(40143),r=e.i(14272),d=class extends i.Subscribable{#e;#t=void 0;#s;#a;constructor(e,t){super(),this.#e=e,this.setOptions(t),this.bindMethods(),this.#i()}bindMethods(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)}setOptions(e){let t=this.options;this.options=this.#e.defaultMutationOptions(e),(0,a.shallowEqualObjects)(this.options,t)||this.#e.getMutationCache().notify({type:"observerOptionsUpdated",mutation:this.#s,observer:this}),t?.mutationKey&&this.options.mutationKey&&(0,a.hashKey)(t.mutationKey)!==(0,a.hashKey)(this.options.mutationKey)?this.reset():this.#s?.state.status==="pending"&&this.#s.setOptions(this.options)}onSubscribe(){1===this.listeners.size&&this.#s&&(this.#s.addObserver(this),this.#i())}onUnsubscribe(){this.hasListeners()||this.#s?.removeObserver(this)}onMutationUpdate(e){this.#i(),this.#n(e)}getCurrentResult(){return this.#t}reset(){this.#s?.removeObserver(this),this.#s=void 0,this.#i(),this.#n()}mutate(e,t){return this.#a=t,this.#s?.removeObserver(this),this.#s=this.#e.getMutationCache().build(this.#e,this.options),this.#s.addObserver(this),this.#s.execute(e)}#i(){let e=this.#s?.state??(0,r.getDefaultState)();this.#t={...e,isPending:"pending"===e.status,isSuccess:"success"===e.status,isError:"error"===e.status,isIdle:"idle"===e.status,mutate:this.mutate,reset:this.reset}}#n(e){n.notifyManager.batch(()=>{if(this.#a&&this.hasListeners()){let t=this.#t.variables,s=this.#t.context,a={client:this.#e,meta:this.options.meta,mutationKey:this.options.mutationKey};if(e?.type==="success"){try{this.#a.onSuccess?.(e.data,t,s,a)}catch(e){Promise.reject(e)}try{this.#a.onSettled?.(e.data,null,t,s,a)}catch(e){Promise.reject(e)}}else if(e?.type==="error"){try{this.#a.onError?.(e.error,t,s,a)}catch(e){Promise.reject(e)}try{this.#a.onSettled?.(void 0,e.error,t,s,a)}catch(e){Promise.reject(e)}}}this.listeners.forEach(e=>{e(this.#t)})})}};e.s(["useMutation",0,function(e,i){let r=(0,t.useQueryClient)(i),[l]=s.useState(()=>new d(r,e));s.useEffect(()=>{l.setOptions(e)},[l,e]);let o=s.useSyncExternalStore(s.useCallback(e=>l.subscribe(n.notifyManager.batchCalls(e)),[l]),()=>l.getCurrentResult(),()=>l.getCurrentResult()),c=s.useCallback((...e)=>{l.mutate(e[0],e[1]).catch(a.noop)},[l]);if(o.error&&(0,a.shouldThrowError)(l.options.throwOnError,[o.error]))throw o.error;return{...o,mutate:c,mutateAsync:o.mutate}}],54616)},37345,e=>{"use strict";let t=(0,e.i(75254).default)("message-square-plus",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}],["path",{d:"M12 8v6",key:"1ib9pf"}],["path",{d:"M9 11h6",key:"1fldmi"}]]);e.s(["MessageSquarePlus",0,t],37345)},78894,e=>{"use strict";let t=(0,e.i(75254).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);e.s(["AlertTriangle",0,t],78894)},28887,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(78894),i=e.i(61911),n=e.i(37345),r=e.i(77326),d=e.i(13927),l=e.i(17658),o=e.i(54616),c=e.i(12598),u=e.i(43531),_=e.i(75254);let m=(0,_.default)("eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]),h=(0,_.default)("eye-off",[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);var f=e.i(30224),p=e.i(31502),b=e.i(27389);function y({student:e,classId:a,onClose:i}){let{session:n}=(0,p.useSession)(),r=(0,c.useQueryClient)(),[d,_]=s.useState(""),[v,g]=s.useState(""),[j,w]=s.useState(""),[x,S]=s.useState(""),[E,k]=s.useState(!0),[$,N]=s.useState(!1),C=(0,o.useMutation)({mutationFn:async()=>(0,f.runAs)(n,t=>t(b.WRITE_FEEDBACK,[e.id,a??null,d.trim(),v.trim()||null,j.trim()||null,x.trim()||null,E])),onSuccess:()=>{N(!0),r.invalidateQueries({queryKey:["db"]})}}),R=d.trim().length>=3&&(v.trim()||j.trim());return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:i,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"fb-title",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:$?(0,t.jsxs)("div",{className:"py-4 text-center",children:[(0,t.jsx)("span",{className:"mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive","aria-hidden":!0,children:(0,t.jsx)(u.Check,{className:"size-5"})}),(0,t.jsx)("p",{id:"fb-title",className:"font-medium",children:E?"Shared with the family":"Saved as a draft"}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:E?`${e.first_name} and their guardians can see this now.`:"Only studio staff can see this until you share it."}),(0,t.jsx)(l.Button,{className:"mt-4 w-full",variant:"primary",onClick:i,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("h2",{id:"fb-title",className:"text-[17px] font-semibold tracking-tight",children:["Feedback for ",e.first_name]}),(0,t.jsxs)("div",{className:"mt-4 space-y-3",children:[(0,t.jsx)(l.Field,{label:"Headline",htmlFor:"fb-head",required:!0,hint:"What this week was about, in a few words.",children:(0,t.jsx)(l.Input,{id:"fb-head",value:d,onChange:e=>_(e.target.value),placeholder:"Lovely week",maxLength:80})}),(0,t.jsx)(l.Field,{label:"Going well",htmlFor:"fb-well",children:(0,t.jsx)("textarea",{id:"fb-well",rows:3,value:v,onChange:e=>g(e.target.value),placeholder:"Be specific — it means more than 'good work'.",className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                             focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12"})}),(0,t.jsx)(l.Field,{label:"To work on",htmlFor:"fb-work",children:(0,t.jsx)("textarea",{id:"fb-work",rows:3,value:j,onChange:e=>w(e.target.value),placeholder:"One thing to practise before next week.",className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                             focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12"})}),(0,t.jsx)(l.Field,{label:"Private note",htmlFor:"fb-priv",hint:"Studio staff only. Never shown to the family, whatever you choose below.",children:(0,t.jsx)("textarea",{id:"fb-priv",rows:2,value:x,onChange:e=>S(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface-2 p-3 text-sm\n                             focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12"})}),(0,t.jsxs)("label",{className:"flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-line p-3",children:[(0,t.jsx)("input",{type:"checkbox",checked:E,onChange:e=>k(e.target.checked),className:"mt-0.5 size-4 accent-[var(--color-accent)]"}),(0,t.jsxs)("span",{children:[(0,t.jsxs)("span",{className:"flex items-center gap-1.5 text-sm font-medium",children:[E?(0,t.jsx)(m,{className:"size-3.5","aria-hidden":!0}):(0,t.jsx)(h,{className:"size-3.5","aria-hidden":!0}),"Share with ",e.first_name," and their guardians"]}),(0,t.jsx)("span",{className:"mt-0.5 block text-[12.5px] text-ink-2",children:E?"They will see it as soon as you save.":"Saved as a draft. Nothing reaches the family until you share it."})]})]})]}),C.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(l.ErrorState,{error:C.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(l.Button,{className:"flex-1",onClick:i,children:"Cancel"}),(0,t.jsx)(l.Button,{className:"flex-1",variant:"primary",loading:C.isPending,disabled:!R,onClick:()=>C.mutate(),children:E?"Save and share":"Save draft"})]})]})})})}var v=e.i(94512),g=e.i(75379);e.s(["default",0,function(){let[e,o]=s.useState(""),[c,u]=s.useState(null),_=(0,d.useRows)(["my-students"],v.MY_STUDENTS),m=(_.data??[]).filter(t=>!e||`${t.first_name} ${t.last_name}`.toLowerCase().includes(e.toLowerCase()));return(0,t.jsxs)(r.Shell,{title:"My students",subtitle:_.data?`${_.data.length} across your classes`:void 0,allow:["owner","admin","teacher"],children:[(0,t.jsxs)("div",{className:"mx-auto max-w-2xl space-y-4",children:[(0,t.jsx)(l.Input,{type:"search",value:e,onChange:e=>o(e.target.value),placeholder:"Search your students","aria-label":"Search your students"}),_.isLoading&&(0,t.jsx)(l.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,t.jsx)(l.Skeleton,{className:"h-12"},e))}),_.error&&(0,t.jsx)(l.ErrorState,{error:_.error}),0===m.length&&!_.isLoading&&(0,t.jsx)(l.Card,{children:(0,t.jsx)(l.EmptyState,{icon:(0,t.jsx)(i.Users,{className:"size-5"}),title:"No students found",body:"You only see children in classes you teach."})}),m.length>0&&(0,t.jsx)(l.Card,{children:(0,t.jsx)("ul",{className:"divide-y divide-line",children:m.map(e=>(0,t.jsxs)("li",{className:"flex items-center gap-3 px-4 py-3",children:[(0,t.jsx)("span",{"aria-hidden":!0,className:"grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[13px] font-semibold text-ink-2",children:(0,g.initials)(e.first_name,e.last_name)}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"flex items-center gap-1.5",children:[(0,t.jsxs)("span",{className:"truncate font-medium",children:[e.first_name," ",e.last_name]}),e.requires_alert&&(0,t.jsx)(a.AlertTriangle,{className:"size-3.5 shrink-0 text-critical","aria-label":"Medical alert"})]}),(0,t.jsxs)("span",{className:"block truncate text-[12.5px] text-ink-2",children:[(0,g.ageFrom)(e.date_of_birth)," · ",e.class_names??"—"]})]}),null!=e.attendance_pct&&(0,t.jsxs)(l.Badge,{tone:e.attendance_pct>=85?"positive":e.attendance_pct>=70?"caution":"critical",children:[e.attendance_pct,"%"]}),(0,t.jsx)(l.Button,{size:"sm",variant:"ghost","aria-label":`Write feedback for ${e.first_name} ${e.last_name}`,onClick:()=>u(e),children:(0,t.jsx)(n.MessageSquarePlus,{className:"size-4","aria-hidden":!0})})]},e.id))})})]}),c&&(0,t.jsx)(y,{student:c,onClose:()=>u(null)})]})}],28887)},27389,e=>{"use strict";let t=`
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
 order by r.kind, r.category nulls last, r.title`,s=`
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
returning id, status`,r=`
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`,d=`
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
 order by r.created_at`,u=`
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`,_=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,m=`
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
 where c.id = $1 and c.deleted_at is null`,f=`
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
returning id, studio_id`,b=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,y=`
select app.retire_resource($1) as ok`,v=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ANSWER_REQUEST",0,m,"ASSIGN_RESOURCE_TO_CLASS",0,b,"CLASS_DETAIL",0,h,"CLASS_RESOURCES",0,f,"CREATE_RESOURCE",0,p,"DECIDE_ENTRY",0,_,"DELETE_RESOURCE",0,y,"EVENTS",0,i,"MY_ASSESSMENTS",0,a,"MY_REQUESTS",0,r,"MY_TEACHING_CLASSES",0,v,"MY_TIMETABLE",0,l,"PENDING_ENTRIES",0,u,"PENDING_REQUESTS",0,c,"RAISE_REQUEST",0,d,"REQUEST_PLACE",0,n,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,o])},94512,e=>{"use strict";let t=`
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour,
       coalesce(sr.name, r.name) as room, l.name as location,
       app.class_enrolled_count(c.id) as enrolled, c.capacity,
       (select count(*)::int from trial t
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials,
       (select count(*)::int from attendance_record ar
         where ar.session_id = cs.id and ar.deleted_at is null) as marked,
       cs.register_closed_at
  from class_session cs
  join class c on c.id = cs.class_id and c.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by cs.starts_at`,s=`
with roll as (
  select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, false as is_trial
    from enrolment e
    join student s on s.id = e.student_id
   where e.class_id = (select class_id from class_session where id = $1)
     and e.status = 'active' and e.deleted_at is null
  union all
  select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, true
    from trial t
    join student s on s.id = t.student_id
   where t.session_id = $1 and t.status in ('booked','attended') and t.deleted_at is null
)
select roll.id as student_id, roll.first_name, roll.last_name, roll.preferred_name,
       roll.date_of_birth, roll.is_trial,
       ar.status, ar.reason,
       coalesce(b.requires_alert, false) as requires_alert,
       b.allergies, b.action_plan, b.emergency_contact_name, b.emergency_contact_phone,
       (select round(100.0 * count(*) filter (where a2.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record a2 where a2.student_id = roll.id and a2.deleted_at is null) as attendance_pct
  from roll
  left join attendance_record ar on ar.student_id = roll.id and ar.session_id = $1 and ar.deleted_at is null
  left join student_safety_brief b on b.student_id = roll.id
 order by roll.last_name, roll.first_name`,a=`
insert into attendance_record (studio_id, session_id, student_id, status, reason, marked_by, client_marked_at)
select c.studio_id, $1, $2, $3::attendance_status, $4, auth.uid(), coalesce($5::timestamptz, now())
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = $1
on conflict (session_id, student_id) do update
  set status = excluded.status, reason = excluded.reason,
      marked_by = excluded.marked_by, marked_at = now(),
      client_marked_at = excluded.client_marked_at
  where attendance_record.client_marked_at is null
     or excluded.client_marked_at >= attendance_record.client_marked_at
returning id, status`,i=`
select s.id, s.first_name, s.last_name, s.date_of_birth,
       coalesce(b.requires_alert, false) as requires_alert, b.allergies,
       (select string_agg(distinct c.name, ', ') from enrolment e
          join class c on c.id = e.class_id
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null
           and c.id in (select app.teacher_class_ids())) as class_names,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record ar where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct
  from student s
  left join student_safety_brief b on b.student_id = s.id
 where s.deleted_at is null
 order by s.last_name, s.first_name`,n=`
update class_session set notes = nullif(btrim($2), ''), updated_at = now()
 where id = $1
returning id, notes`,r=`
update attendance_record set reason = nullif(btrim($3), ''), updated_at = now()
 where session_id = $1 and student_id = $2 and deleted_at is null
returning id, reason`,d=`
update class_session set register_closed_at = null, updated_at = now()
 where id = $1
returning id`,l=`
select cm.id, cm.subject, cm.body, cm.sent_at,
       coalesce(sm.display_name, u.full_name) as sent_by_name,
       c.name as class_name,
       (cm.sent_by = auth.uid()) as mine
  from communication cm
  left join class c on c.id = cm.class_id
  left join user_account u on u.id = cm.sent_by
  left join staff_member sm on sm.user_id = cm.sent_by and sm.deleted_at is null
 where cm.deleted_at is null and cm.kind = 'class_broadcast' and cm.class_id = $1
 order by cm.sent_at desc`,o=`
insert into communication (studio_id, kind, channel, class_id, subject, body, sent_by)
select c.studio_id, 'class_broadcast', 'in_app', c.id, nullif(btrim($2), ''), btrim($3), auth.uid()
  from class c where c.id = $1
returning id`,c=`
update communication set subject = nullif(btrim($2), ''), body = btrim($3), updated_at = now()
 where id = $1
returning id`;e.s(["CLASS_NOTICES",0,l,"CLOSE_REGISTER",0,"select app.close_register($1) as ok","EDIT_NOTICE",0,c,"MARK_ATTENDANCE",0,a,"MY_SESSIONS",0,t,"MY_STUDENTS",0,i,"POST_NOTICE",0,o,"REGISTER",0,s,"REOPEN_REGISTER",0,d,"SAVE_SESSION_NOTES",0,n,"SET_REASON",0,r,"WITHDRAW_NOTICE",0,"select app.withdraw_notice($1) as ok"])}]);