(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54616,e=>{"use strict";var t=e.i(12598),s=e.i(71645),i=e.i(19273),a=e.i(15823),n=e.i(40143),r=e.i(14272),d=class extends a.Subscribable{#e;#t=void 0;#s;#i;constructor(e,t){super(),this.#e=e,this.setOptions(t),this.bindMethods(),this.#a()}bindMethods(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)}setOptions(e){let t=this.options;this.options=this.#e.defaultMutationOptions(e),(0,i.shallowEqualObjects)(this.options,t)||this.#e.getMutationCache().notify({type:"observerOptionsUpdated",mutation:this.#s,observer:this}),t?.mutationKey&&this.options.mutationKey&&(0,i.hashKey)(t.mutationKey)!==(0,i.hashKey)(this.options.mutationKey)?this.reset():this.#s?.state.status==="pending"&&this.#s.setOptions(this.options)}onSubscribe(){1===this.listeners.size&&this.#s&&(this.#s.addObserver(this),this.#a())}onUnsubscribe(){this.hasListeners()||this.#s?.removeObserver(this)}onMutationUpdate(e){this.#a(),this.#n(e)}getCurrentResult(){return this.#t}reset(){this.#s?.removeObserver(this),this.#s=void 0,this.#a(),this.#n()}mutate(e,t){return this.#i=t,this.#s?.removeObserver(this),this.#s=this.#e.getMutationCache().build(this.#e,this.options),this.#s.addObserver(this),this.#s.execute(e)}#a(){let e=this.#s?.state??(0,r.getDefaultState)();this.#t={...e,isPending:"pending"===e.status,isSuccess:"success"===e.status,isError:"error"===e.status,isIdle:"idle"===e.status,mutate:this.mutate,reset:this.reset}}#n(e){n.notifyManager.batch(()=>{if(this.#i&&this.hasListeners()){let t=this.#t.variables,s=this.#t.context,i={client:this.#e,meta:this.options.meta,mutationKey:this.options.mutationKey};if(e?.type==="success"){try{this.#i.onSuccess?.(e.data,t,s,i)}catch(e){Promise.reject(e)}try{this.#i.onSettled?.(e.data,null,t,s,i)}catch(e){Promise.reject(e)}}else if(e?.type==="error"){try{this.#i.onError?.(e.error,t,s,i)}catch(e){Promise.reject(e)}try{this.#i.onSettled?.(void 0,e.error,t,s,i)}catch(e){Promise.reject(e)}}}this.listeners.forEach(e=>{e(this.#t)})})}};e.s(["useMutation",0,function(e,a){let r=(0,t.useQueryClient)(a),[l]=s.useState(()=>new d(r,e));s.useEffect(()=>{l.setOptions(e)},[l,e]);let o=s.useSyncExternalStore(s.useCallback(e=>l.subscribe(n.notifyManager.batchCalls(e)),[l]),()=>l.getCurrentResult(),()=>l.getCurrentResult()),c=s.useCallback((...e)=>{l.mutate(e[0],e[1]).catch(i.noop)},[l]);if(o.error&&(0,i.shouldThrowError)(l.options.throwOnError,[o.error]))throw o.error;return{...o,mutate:c,mutateAsync:o.mutate}}],54616)},59208,e=>{"use strict";let t=(0,e.i(75254).default)("calendar-clock",[["path",{d:"M16 14v2.2l1.6 1",key:"fo4ql5"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5",key:"1osxxc"}],["path",{d:"M3 10h5",key:"r794hk"}],["path",{d:"M8 2v4",key:"1cmpym"}],["circle",{cx:"16",cy:"16",r:"6",key:"qoo3c4"}]]);e.s(["CalendarClock",0,t],59208)},3116,e=>{"use strict";let t=(0,e.i(75254).default)("clock",[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);e.s(["Clock",0,t],3116)},46897,e=>{"use strict";let t=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,t],46897)},24253,e=>{"use strict";var t=e.i(43476),s=e.i(72769);e.s(["default",0,function(){return(0,t.jsx)(s.EventsView,{allow:["guardian"],title:"Events"})}])},72769,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(54616),a=e.i(12598),n=e.i(64030),r=e.i(46897),d=e.i(3116),l=e.i(43531),o=e.i(59208),c=e.i(77326),u=e.i(13927),m=e.i(30224),_=e.i(31502),h=e.i(17658),p=e.i(27389),f=e.i(75379);let v={competition:"amber",show:"violet",exam:"critical",workshop:"teal",private_lesson:"indigo",rehearsal:"neutral",social:"lime"},y={competition:"Competition",show:"Show",exam:"Exam",workshop:"Workshop",private_lesson:"Private lesson",rehearsal:"Rehearsal",social:"Social"},x={requested:{label:"Requested — waiting on the studio",tone:"caution"},confirmed:{label:"Confirmed",tone:"positive"},invited:{label:"Invited",tone:"info"},declined:{label:"Not this time",tone:"neutral"},waitlisted:{label:"Waiting list",tone:"caution"},withdrawn:{label:"Withdrawn",tone:"neutral"}};function j({event:e,children:a,onClose:n,onDone:r}){let{session:d}=(0,_.useSession)(),[o,c]=s.useState(a[0]?.id??""),[u,v]=s.useState(""),[y,x]=s.useState(!1),b=(0,i.useMutation)({mutationFn:async()=>(0,m.runAs)(d,t=>t(p.REQUEST_PLACE,[e.id,o,u.trim()||null])),onSuccess:()=>x(!0)});return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:n,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"ask-title",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:y?(0,t.jsxs)("div",{className:"py-4 text-center",children:[(0,t.jsx)("span",{className:"mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive","aria-hidden":!0,children:(0,t.jsx)(l.Check,{className:"size-5"})}),(0,t.jsx)("p",{id:"ask-title",className:"font-medium",children:"Request sent"}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:"The studio will confirm. Nothing is booked until they do."}),(0,t.jsx)(h.Button,{className:"mt-4 w-full",variant:"primary",onClick:r,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("h2",{id:"ask-title",className:"text-[17px] font-semibold tracking-tight",children:"Ask to take part"}),(0,t.jsx)("p",{className:"mt-0.5 text-sm text-ink-2",children:e.title}),(0,t.jsxs)("div",{className:"mt-4 space-y-3",children:[a.length>1&&(0,t.jsx)(h.Field,{label:"Who for",htmlFor:"ask-student",children:(0,t.jsx)(h.Select,{id:"ask-student",value:o,onChange:e=>c(e.target.value),children:a.map(e=>(0,t.jsxs)("option",{value:e.id,children:[e.first_name," ",e.last_name]},e.id))})}),(0,t.jsx)(h.Field,{label:"Anything the studio should know",htmlFor:"ask-note",hint:"Optional — availability, which piece, that sort of thing.",children:(0,t.jsx)(h.Input,{id:"ask-note",value:u,onChange:e=>v(e.target.value),placeholder:"Free most evenings except Thursday"})}),null!=e.cost_minor&&(0,t.jsxs)("p",{className:"rounded-[var(--radius-md)] bg-surface-2 p-3 text-[13px] text-ink-2",children:["This costs ",(0,f.money)(e.cost_minor),". You will be invoiced only once the studio confirms."]})]}),b.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(h.ErrorState,{error:b.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(h.Button,{className:"flex-1",onClick:n,children:"Cancel"}),(0,t.jsx)(h.Button,{className:"flex-1",variant:"primary",loading:b.isPending,disabled:!o,onClick:()=>b.mutate(),children:"Send request"})]})]})})})}e.s(["EventsView",0,function({allow:e,title:i}){let{session:l}=(0,_.useSession)(),m=(0,a.useQueryClient)(),b=(0,u.useRows)(["events"],p.EVENTS),g=(0,u.useRows)(["event-children"],"select id, first_name, last_name from student where deleted_at is null order by date_of_birth"),[w,k]=s.useState(null);return(0,t.jsxs)(c.Shell,{title:i,subtitle:"Competitions, shows, exams and private lessons",allow:e,children:[(0,t.jsxs)("div",{className:"mx-auto max-w-2xl space-y-4",children:[b.isLoading&&(0,t.jsx)(h.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,t.jsx)(h.Skeleton,{className:"h-24"},e))}),b.error&&(0,t.jsx)(h.ErrorState,{error:b.error,onRetry:()=>b.refetch()}),b.data?.length===0&&!b.isLoading&&(0,t.jsx)(h.Card,{children:(0,t.jsx)(h.EmptyState,{icon:(0,t.jsx)(n.Trophy,{className:"size-5"}),title:"Nothing in the diary",body:"Competitions, shows and workshops will appear here when the studio adds them."})}),b.data?.map(e=>{let s=e.my_status?x[e.my_status]:null,i=e.entries_close_on&&new Date(e.entries_close_on)<new Date,a=null!=e.capacity&&e.going>=e.capacity;return(0,t.jsxs)(h.Card,{children:[(0,t.jsxs)("div",{className:"p-4",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)(h.Badge,{tone:v[e.kind]??"neutral",children:y[e.kind]??e.kind}),s&&(0,t.jsx)(h.Badge,{tone:s.tone,children:s.label})]}),(0,t.jsx)("h2",{className:"mt-2 text-[17px] font-semibold tracking-tight",children:e.title}),(0,t.jsxs)("p",{className:"mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-ink-2",children:[(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(o.CalendarClock,{className:"size-3.5","aria-hidden":!0}),(0,f.relativeDay)(e.starts_at),", ",(0,f.dateLong)(e.starts_at)]}),(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(d.Clock,{className:"size-3.5","aria-hidden":!0}),(0,f.time)(e.starts_at)]}),e.venue&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(r.MapPin,{className:"size-3.5","aria-hidden":!0}),e.venue]})]}),e.description&&(0,t.jsx)("p",{className:"mt-2.5 text-sm leading-relaxed text-ink-2",children:e.description}),(0,t.jsxs)("dl",{className:"mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px]",children:[null!=e.cost_minor&&(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"inline text-ink-3",children:"Cost "}),(0,t.jsx)("dd",{className:"inline font-medium",children:(0,f.money)(e.cost_minor)})]}),null!=e.capacity&&(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"inline text-ink-3",children:"Places "}),(0,t.jsxs)("dd",{className:"inline font-medium",children:[e.going," of ",e.capacity]})]}),e.entries_close_on&&(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"inline text-ink-3",children:"Entries close "}),(0,t.jsx)("dd",{className:"inline font-medium",children:(0,f.dateShort)(e.entries_close_on)})]}),e.teacher&&(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"inline text-ink-3",children:"With "}),(0,t.jsx)("dd",{className:"inline font-medium",children:e.teacher})]})]})]}),"private_lesson"!==e.kind&&!s&&(0,t.jsx)("div",{className:"border-t border-line p-3",children:!e.requests_open||i||a?(0,t.jsxs)("p",{className:"text-[13px] text-ink-3",children:[a?"This one is full.":i?"Entries have closed.":"Not taking requests."," ","Message the studio if you would still like to be considered."]}):(0,t.jsx)(h.Button,{size:"sm",onClick:()=>k(e),children:"Ask to take part"})}),s?.tone==="caution"&&"requested"===e.my_status&&(0,t.jsxs)("p",{className:"border-t border-line px-4 py-2.5 text-[12.5px] text-ink-3",children:["The studio has your request",e.my_student?` for ${e.my_student}`:""," and will confirm."]})]},e.id)})]}),w&&(0,t.jsx)(j,{event:w,children:g.data??[],onClose:()=>k(null),onDone:()=>{k(null),m.invalidateQueries({queryKey:["db"]})}})]})}])},27389,e=>{"use strict";let t=`
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
 order by f.shared_at desc`,i=`
select a.id, a.skill, a.level, a.assessed_on, a.note,
       ds.name as style, s.first_name as student_name
  from skill_assessment a
  join student s on s.id = a.student_id
  left join dance_style ds on ds.id = a.dance_style_id
 where a.deleted_at is null
 order by s.first_name, a.skill`,a=`
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
 order by ev.starts_at`,m=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,_=`
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
 order by (a.id is null), r.kind, r.created_at desc`,f=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,v=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,y=`
select app.retire_resource($1) as ok`,x=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ANSWER_REQUEST",0,_,"ASSIGN_RESOURCE_TO_CLASS",0,v,"CLASS_DETAIL",0,h,"CLASS_RESOURCES",0,p,"CREATE_RESOURCE",0,f,"DECIDE_ENTRY",0,m,"DELETE_RESOURCE",0,y,"EVENTS",0,a,"MY_ASSESSMENTS",0,i,"MY_REQUESTS",0,r,"MY_TEACHING_CLASSES",0,x,"MY_TIMETABLE",0,l,"PENDING_ENTRIES",0,u,"PENDING_REQUESTS",0,c,"RAISE_REQUEST",0,d,"REQUEST_PLACE",0,n,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,o])}]);