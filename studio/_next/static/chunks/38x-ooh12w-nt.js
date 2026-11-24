(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54616,e=>{"use strict";var t=e.i(12598),s=e.i(71645),i=e.i(19273),a=e.i(15823),n=e.i(40143),r=e.i(14272),d=class extends a.Subscribable{#e;#t=void 0;#s;#i;constructor(e,t){super(),this.#e=e,this.setOptions(t),this.bindMethods(),this.#a()}bindMethods(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)}setOptions(e){let t=this.options;this.options=this.#e.defaultMutationOptions(e),(0,i.shallowEqualObjects)(this.options,t)||this.#e.getMutationCache().notify({type:"observerOptionsUpdated",mutation:this.#s,observer:this}),t?.mutationKey&&this.options.mutationKey&&(0,i.hashKey)(t.mutationKey)!==(0,i.hashKey)(this.options.mutationKey)?this.reset():this.#s?.state.status==="pending"&&this.#s.setOptions(this.options)}onSubscribe(){1===this.listeners.size&&this.#s&&(this.#s.addObserver(this),this.#a())}onUnsubscribe(){this.hasListeners()||this.#s?.removeObserver(this)}onMutationUpdate(e){this.#a(),this.#n(e)}getCurrentResult(){return this.#t}reset(){this.#s?.removeObserver(this),this.#s=void 0,this.#a(),this.#n()}mutate(e,t){return this.#i=t,this.#s?.removeObserver(this),this.#s=this.#e.getMutationCache().build(this.#e,this.options),this.#s.addObserver(this),this.#s.execute(e)}#a(){let e=this.#s?.state??(0,r.getDefaultState)();this.#t={...e,isPending:"pending"===e.status,isSuccess:"success"===e.status,isError:"error"===e.status,isIdle:"idle"===e.status,mutate:this.mutate,reset:this.reset}}#n(e){n.notifyManager.batch(()=>{if(this.#i&&this.hasListeners()){let t=this.#t.variables,s=this.#t.context,i={client:this.#e,meta:this.options.meta,mutationKey:this.options.mutationKey};if(e?.type==="success"){try{this.#i.onSuccess?.(e.data,t,s,i)}catch(e){Promise.reject(e)}try{this.#i.onSettled?.(e.data,null,t,s,i)}catch(e){Promise.reject(e)}}else if(e?.type==="error"){try{this.#i.onError?.(e.error,t,s,i)}catch(e){Promise.reject(e)}try{this.#i.onSettled?.(void 0,e.error,t,s,i)}catch(e){Promise.reject(e)}}}this.listeners.forEach(e=>{e(this.#t)})})}};e.s(["useMutation",0,function(e,a){let r=(0,t.useQueryClient)(a),[l]=s.useState(()=>new d(r,e));s.useEffect(()=>{l.setOptions(e)},[l,e]);let o=s.useSyncExternalStore(s.useCallback(e=>l.subscribe(n.notifyManager.batchCalls(e)),[l]),()=>l.getCurrentResult(),()=>l.getCurrentResult()),c=s.useCallback((...e)=>{l.mutate(e[0],e[1]).catch(i.noop)},[l]);if(o.error&&(0,i.shouldThrowError)(l.options.throwOnError,[o.error]))throw o.error;return{...o,mutate:c,mutateAsync:o.mutate}}],54616)},95468,e=>{"use strict";let t=(0,e.i(75254).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,t],95468)},37345,e=>{"use strict";let t=(0,e.i(75254).default)("message-square-plus",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}],["path",{d:"M12 8v6",key:"1ib9pf"}],["path",{d:"M9 11h6",key:"1fldmi"}]]);e.s(["MessageSquarePlus",0,t],37345)},70009,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(54616),a=e.i(12598),n=e.i(37345),r=e.i(43531),d=e.i(95468),l=e.i(61574),o=e.i(77326),c=e.i(13927),u=e.i(30224),m=e.i(31502),_=e.i(17658),h=e.i(27389),p=e.i(75379);let f={question:"Question",private_lesson:"Private lesson",medical_update:"Medical update",event_interest:"Event",absence:"Absence",other:"Other"},v={open:{label:"Waiting on the studio",tone:"caution"},in_progress:{label:"Being looked at",tone:"info"},answered:{label:"Answered",tone:"positive"},closed:{label:"Closed",tone:"neutral"}};function y({onClose:e}){let{session:n}=(0,m.useSession)(),d=(0,a.useQueryClient)(),o=(0,c.useRows)(["ask-children"],"select id, first_name, last_name from student where deleted_at is null order by date_of_birth"),[p,f]=s.useState(""),[v,b]=s.useState("question"),[j,x]=s.useState(""),[g,k]=s.useState(""),[w,S]=s.useState(!1);s.useEffect(()=>{!p&&o.data?.[0]&&f(o.data[0].id)},[o.data,p]);let E=(0,i.useMutation)({mutationFn:async()=>(0,u.runAs)(n,e=>e(h.RAISE_REQUEST,[p,v,j.trim(),g.trim()])),onSuccess:()=>{S(!0),d.invalidateQueries({queryKey:["db"]})}}),C=p&&j.trim().length>=3&&g.trim().length>=5;return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:e,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"ask-t",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:w?(0,t.jsxs)("div",{className:"py-4 text-center",children:[(0,t.jsx)("span",{className:"mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive","aria-hidden":!0,children:(0,t.jsx)(r.Check,{className:"size-5"})}),(0,t.jsx)("p",{id:"ask-t",className:"font-medium",children:"Sent to the studio"}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:"You will see the reply here."}),(0,t.jsx)(_.Button,{className:"mt-4 w-full",variant:"primary",onClick:e,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("h2",{id:"ask-t",className:"text-[17px] font-semibold tracking-tight",children:"Ask the studio"}),(0,t.jsxs)("div",{className:"mt-4 space-y-3",children:[(o.data?.length??0)>1&&(0,t.jsx)(_.Field,{label:"About which child",htmlFor:"ask-child",children:(0,t.jsx)(_.Select,{id:"ask-child",value:p,onChange:e=>f(e.target.value),children:o.data?.map(e=>(0,t.jsxs)("option",{value:e.id,children:[e.first_name," ",e.last_name]},e.id))})}),(0,t.jsx)(_.Field,{label:"What is it about",htmlFor:"ask-kind",children:(0,t.jsxs)(_.Select,{id:"ask-kind",value:v,onChange:e=>b(e.target.value),children:[(0,t.jsx)("option",{value:"question",children:"A question"}),(0,t.jsx)("option",{value:"private_lesson",children:"A private lesson"}),(0,t.jsx)("option",{value:"medical_update",children:"A medical or allergy update"}),(0,t.jsx)("option",{value:"event_interest",children:"A competition or event"}),(0,t.jsx)("option",{value:"other",children:"Something else"})]})}),"medical_update"===v&&(0,t.jsxs)("p",{className:"flex gap-2 rounded-[var(--radius-md)] bg-caution-soft p-3 text-[13px] text-ink-2",children:[(0,t.jsx)(l.HeartPulse,{className:"mt-0.5 size-4 shrink-0 text-caution","aria-hidden":!0}),(0,t.jsx)("span",{children:"Studio staff update the medical record themselves so there is a record of who changed what. Tell them here and they will make the change."})]}),(0,t.jsx)(_.Field,{label:"Subject",htmlFor:"ask-subject",required:!0,children:(0,t.jsx)(_.Input,{id:"ask-subject",value:j,onChange:e=>x(e.target.value),placeholder:"Shoes for the exam"})}),(0,t.jsx)(_.Field,{label:"Message",htmlFor:"ask-body",required:!0,children:(0,t.jsx)("textarea",{id:"ask-body",value:g,onChange:e=>k(e.target.value),rows:4,placeholder:"As much or as little as you like.",className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                             focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12"})})]}),E.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(_.ErrorState,{error:E.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(_.Button,{className:"flex-1",onClick:e,children:"Cancel"}),(0,t.jsx)(_.Button,{className:"flex-1",variant:"primary",loading:E.isPending,disabled:!C,onClick:()=>E.mutate(),children:"Send"})]})]})})})}e.s(["default",0,function(){let e=(0,c.useRows)(["my-requests"],h.MY_REQUESTS),[i,a]=s.useState(!1);return(0,t.jsxs)(o.Shell,{title:"Ask the studio",allow:["guardian"],actions:(0,t.jsxs)(_.Button,{size:"sm",variant:"primary",onClick:()=>a(!0),children:[(0,t.jsx)(n.MessageSquarePlus,{className:"size-4","aria-hidden":!0})," New"]}),children:[(0,t.jsxs)("div",{className:"mx-auto max-w-2xl space-y-4",children:[e.isLoading&&(0,t.jsx)(_.Card,{className:"space-y-3 p-4",children:[0,1].map(e=>(0,t.jsx)(_.Skeleton,{className:"h-20"},e))}),e.error&&(0,t.jsx)(_.ErrorState,{error:e.error,onRetry:()=>e.refetch()}),e.data?.length===0&&!e.isLoading&&(0,t.jsx)(_.Card,{children:(0,t.jsx)(_.EmptyState,{icon:(0,t.jsx)(n.MessageSquarePlus,{className:"size-5"}),title:"Nothing asked yet",body:"Questions about classes, uniform, private lessons or medical details all go here.",action:(0,t.jsx)(_.Button,{variant:"primary",onClick:()=>a(!0),children:"Ask a question"})})}),e.data?.map(e=>{let s=v[e.status]??v.open;return(0,t.jsx)(_.Card,{children:(0,t.jsxs)("div",{className:"p-4",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)(_.Badge,{tone:"neutral",children:f[e.kind]??e.kind}),(0,t.jsx)(_.Badge,{tone:s.tone,children:s.label}),e.student_name&&(0,t.jsxs)("span",{className:"text-[12.5px] text-ink-3",children:["about ",e.student_name]}),(0,t.jsx)("span",{className:"ml-auto text-[12.5px] text-ink-3",children:(0,p.relativeDay)(e.created_at)})]}),(0,t.jsx)("h2",{className:"mt-2 font-semibold",children:e.subject}),(0,t.jsx)("p",{className:"mt-1 text-sm leading-relaxed text-ink-2",children:e.body}),e.answer&&(0,t.jsxs)("div",{className:"mt-3 rounded-[var(--radius-md)] border-l-2 border-positive bg-positive-soft/50 p-3",children:[(0,t.jsxs)("p",{className:"flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.05em] text-positive",children:[(0,t.jsx)(d.CheckCircle2,{className:"size-3.5","aria-hidden":!0})," The studio replied"]}),(0,t.jsx)("p",{className:"mt-1 text-sm",children:e.answer})]})]})},e.id)})]}),i&&(0,t.jsx)(y,{onClose:()=>a(!1)})]})}])},27389,e=>{"use strict";let t=`
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
select app.retire_resource($1) as ok`,b=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ANSWER_REQUEST",0,_,"ASSIGN_RESOURCE_TO_CLASS",0,v,"CLASS_DETAIL",0,h,"CLASS_RESOURCES",0,p,"CREATE_RESOURCE",0,f,"DECIDE_ENTRY",0,m,"DELETE_RESOURCE",0,y,"EVENTS",0,a,"MY_ASSESSMENTS",0,i,"MY_REQUESTS",0,r,"MY_TEACHING_CLASSES",0,b,"MY_TIMETABLE",0,l,"PENDING_ENTRIES",0,u,"PENDING_REQUESTS",0,c,"RAISE_REQUEST",0,d,"REQUEST_PLACE",0,n,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,o])}]);