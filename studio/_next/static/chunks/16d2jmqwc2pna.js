(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,63939,e=>{"use strict";let t=(0,e.i(75254).default)("corner-down-left",[["path",{d:"M20 4v7a4 4 0 0 1-4 4H4",key:"6o5b7l"}],["path",{d:"m9 10-5 5 5 5",key:"1kshq7"}]]);e.s(["CornerDownLeft",0,t],63939)},21840,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(54616),a=e.i(12598),n=e.i(32102),d=e.i(43531),r=e.i(37727),l=e.i(86311),o=e.i(64030),c=e.i(95468),u=e.i(61574);let m=(0,e.i(75254).default)("clipboard-plus",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M9 14h6",key:"159ibu"}],["path",{d:"M12 17v-6",key:"1y8rbf"}]]);var _=e.i(63939),f=e.i(86866),h=e.i(45060),p=e.i(65712),y=e.i(42268),g=e.i(77326),b=e.i(13927),x=e.i(30224),v=e.i(31502),j=e.i(17658),w=e.i(27389),$=e.i(21011),E=e.i(7725),N=e.i(75379);let S={question:"Question",private_lesson:"Private lesson",medical_update:"Medical update",event_interest:"Event",absence:"Absence",other:"Other"};function k({request:e,onClose:n}){let{session:d}=(0,v.useSession)(),r=(0,a.useQueryClient)(),[l,o]=s.useState(""),[u,m]=s.useState(!1),_=(0,i.useMutation)({mutationFn:async()=>(0,x.runAs)(d,t=>t(w.ANSWER_REQUEST,[e.id,l.trim()])),onSuccess:()=>{m(!0),r.invalidateQueries({queryKey:["db"]})}});return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:n,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"ans-t",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:u?(0,t.jsxs)("div",{className:"py-4 text-center",children:[(0,t.jsx)("span",{className:"mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive","aria-hidden":!0,children:(0,t.jsx)(c.CheckCircle2,{className:"size-5"})}),(0,t.jsx)("p",{id:"ans-t",className:"font-medium",children:"Replied"}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:"The family sees your answer in their hub."}),(0,t.jsx)(j.Button,{className:"mt-4 w-full",variant:"primary",onClick:n,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("h2",{id:"ans-t",className:"text-[17px] font-semibold tracking-tight",children:"Reply"}),(0,t.jsx)("p",{className:"mt-0.5 text-sm text-ink-2",children:e.subject}),(0,t.jsx)("p",{className:"mt-2 rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm text-ink-2",children:e.body}),(0,t.jsx)("textarea",{value:l,onChange:e=>o(e.target.value),rows:4,"aria-label":"Your reply",placeholder:"Write your reply…",className:"mt-3 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                         focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"}),_.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(j.ErrorState,{error:_.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(j.Button,{className:"flex-1",onClick:n,children:"Cancel"}),(0,t.jsx)(j.Button,{className:"flex-1",variant:"primary",loading:_.isPending,disabled:l.trim().length<2,onClick:()=>_.mutate(),children:"Send reply"})]})]})})})}function A({request:e,onClose:n,onDone:d}){let{session:r}=(0,v.useSession)(),l=(0,a.useQueryClient)(),[o,c]=s.useState(e.student_id??(1===e.children.length?e.children[0].id:"")),u=e.children.find(e=>e.id===o),m=(0,b.useRows)(["medical",o],y.MEDICAL,[o],{enabled:!!o}),f=m.data?.[0],[h,g]=s.useState({}),[$,E]=s.useState(!1),[N,S]=s.useState(null);s.useEffect(()=>{o&&!m.isPending&&N!==o&&(g({allergies:f?.allergies??"",conditions:f?.conditions??"",medications:f?.medications??"",action_plan:f?.action_plan??""}),E(f?.requires_alert??!1),S(o))},[o,m.isPending,f,N]);let k=(u?.name??e.student_name??"").split(" ")[0]||"your child",C=(e.guardian_name??"").split(" ")[0],[T,R]=s.useState("");s.useEffect(()=>{R(`Thank you${C?`, ${C}`:""} — we have updated ${k}'s medical record, and their teachers can now see it.`)},[k,C]);let I=(0,i.useMutation)({mutationFn:()=>(0,x.runAs)(r,t=>t(w.ACK_MEDICAL,[e.id,JSON.stringify({...h,requires_alert:$}),T,e.student_id?null:o])),onSuccess:()=>{l.invalidateQueries({queryKey:["db"]}),d(`${k}’s record is updated, ${e.guardian_name??"the family"} has been told, and teachers can see it.`)}}),D=!!o&&N===o,M=D&&($!==(f?.requires_alert??!1)||["allergies","conditions","medications","action_plan"].some(e=>(h[e]??"").trim()!==(f?.[e]??"").trim()));return(0,t.jsxs)(p.RecordSheet,{title:"Add to the medical record",subtitle:`${e.guardian_name??e.family_name}${u?` \xb7 ${u.name}`:""}`,onClose:n,onSave:()=>I.mutate(),saving:I.isPending,error:I.error,canSave:M&&T.trim().length>3,saveLabel:"Update record and tell the parent",children:[(0,t.jsxs)("figure",{className:"rounded-[var(--radius-md)] border-l-4 border-caution bg-caution-soft p-3",children:[(0,t.jsxs)("figcaption",{className:"text-[12px] font-medium text-ink-3",children:[e.guardian_name??"The parent"," wrote · ",e.subject]}),(0,t.jsx)("blockquote",{className:"mt-1 text-sm",children:e.body})]}),!e.student_id&&e.children.length>1&&(0,t.jsx)(j.Field,{label:"Which child",htmlFor:"ru-child",required:!0,children:(0,t.jsxs)(j.Select,{id:"ru-child",value:o,onChange:e=>c(e.target.value),children:[(0,t.jsx)("option",{value:"",children:"Choose…"}),e.children.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))]})}),o&&!D&&(0,t.jsx)(j.Skeleton,{className:"h-40"}),D&&(0,t.jsxs)(t.Fragment,{children:[[["allergies","Allergies","Peanuts — carries an EpiPen"],["conditions","Conditions","Asthma"],["medications","Medication","Blue inhaler, front pocket of her bag"],["action_plan","What to do in an emergency","Two puffs of the inhaler, sit her down, call home"]].map(([s,i,a])=>(0,t.jsxs)(j.Field,{label:i,htmlFor:`ru-${s}`,children:[(0,t.jsx)("textarea",{id:`ru-${s}`,rows:2,value:h[s]??"",placeholder:a,onChange:e=>g(t=>({...t,[s]:e.target.value})),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                           focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"}),(0,t.jsxs)("button",{type:"button",onClick:()=>g(t=>({...t,[s]:t[s]?.trim()?`${t[s].trim()}
${e.body}`:e.body})),className:"mt-1 inline-flex min-h-[32px] items-center gap-1 rounded-full px-2 text-[12.5px] font-medium text-accent-text hover:bg-accent-soft",children:[(0,t.jsx)(_.CornerDownLeft,{className:"size-3.5","aria-hidden":!0})," Add the parent’s words here"]})]},s)),(0,t.jsxs)("label",{className:"flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line p-3 text-sm",children:[(0,t.jsx)("input",{type:"checkbox",checked:$,onChange:e=>E(e.target.checked),className:"mt-0.5 size-4"}),(0,t.jsxs)("span",{children:[(0,t.jsx)("span",{className:"font-medium",children:"Urgent — show a red alert"}),(0,t.jsx)("span",{className:"mt-0.5 block text-[12.5px] text-ink-2",children:"Teachers see every detail above either way."})]})]}),(0,t.jsx)(j.Field,{label:"Message to the parent",htmlFor:"ru-msg",required:!0,children:(0,t.jsx)("textarea",{id:"ru-msg",rows:3,value:T,onChange:e=>R(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                         focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"})}),!M&&(0,t.jsx)("p",{className:"text-[12.5px] text-ink-3",children:"Change the record above to save — or use Acknowledge if nothing needs changing."})]})]})}e.s(["default",0,function(){let{session:e}=(0,v.useSession)(),_=(0,a.useQueryClient)(),p=(0,b.useRows)(["pending-requests"],w.PENDING_REQUESTS),y=(0,b.useRows)(["pending-entries"],w.PENDING_ENTRIES),[C,T]=s.useState(null),[R,I]=s.useState(null),[D,M]=s.useState(null),[q,P]=s.useState(null),L=(0,i.useMutation)({mutationFn:async t=>(await (0,x.readAs)(e,$.SESSION_BY_ID,[t]))[0],onSuccess:e=>e&&P(e)}),F=(0,i.useMutation)({mutationFn:async t=>(0,x.runAs)(e,e=>e(w.ACK_MEDICAL,[t.id,null,null,null])),onSuccess:(e,t)=>{M(`${t.guardian_name??t.family_name} has been told you received it. It is still to be added to ${t.student_name??"the child"}’s record.`),_.invalidateQueries({queryKey:["db"]})}}),z=(0,i.useMutation)({mutationFn:async t=>{let s="join_class"===t.action?w.APPROVE_PLACE:"add_child"===t.action?w.APPROVE_CHILD:w.APPROVE_TRIAL,i=await (0,x.runAs)(e,e=>e(s,"join_class"===t.action?[t.id,null]:[t.id]));return{r:t,outcome:i[0]?.outcome}},onSuccess:({r:e,outcome:t})=>{M("join_class"===e.action?"enrolled"===t?`Done — enrolled in ${e.class_name}, and the family has been told.`:`${e.class_name} is full, so they are on the waiting list. The family has been told.`:"add_child"===e.action?"Added to the family, with the parent as emergency contact. They have been told.":"Trial booked and the family told."),_.invalidateQueries({queryKey:["db"]})}}),U=(0,i.useMutation)({mutationFn:async t=>(0,x.runAs)(e,e=>e(w.DECIDE_ENTRY,[t.id,t.status])),onSuccess:()=>_.invalidateQueries({queryKey:["db"]})}),B=(p.data?.length??0)+(y.data?.length??0);return(0,t.jsxs)(g.Shell,{title:"Requests",allow:["owner","admin"],subtitle:B?`${B} waiting on you`:"Nothing waiting",children:[(0,t.jsxs)("div",{className:"mx-auto max-w-3xl space-y-5",children:[(0,t.jsxs)(j.Card,{children:[(0,t.jsx)(j.CardHeader,{title:"From families",subtitle:"Medical updates first — they are what a teacher needs before the next class"}),p.isLoading&&(0,t.jsx)("div",{className:"space-y-2 p-4",children:[0,1].map(e=>(0,t.jsx)(j.Skeleton,{className:"h-20"},e))}),p.data?.length===0&&!p.isLoading&&(0,t.jsx)(j.EmptyState,{icon:(0,t.jsx)(n.Inbox,{className:"size-5"}),title:"Nothing unanswered",body:"Questions from parents and students land here."}),D&&(0,t.jsxs)("p",{role:"status",className:"flex items-center gap-2 border-b border-line bg-positive-soft px-4 py-2.5 text-[13px]",children:[(0,t.jsx)(c.CheckCircle2,{className:"size-4 shrink-0 text-positive","aria-hidden":!0})," ",D]}),null!=F.error&&(0,t.jsx)("div",{className:"p-3",children:(0,t.jsx)(j.ErrorState,{error:F.error})}),null!=z.error&&(0,t.jsx)("div",{className:"p-3",children:(0,t.jsx)(j.ErrorState,{error:z.error})}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:p.data?.map(e=>{let s="medical_update"===e.kind;return(0,t.jsxs)("li",{className:(0,h.cn)("px-4 py-3",s&&"bg-caution-soft/40"),children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)(j.Badge,{tone:s?"critical":"neutral",icon:s?(0,t.jsx)(u.HeartPulse,{className:"size-3","aria-hidden":!0}):void 0,children:S[e.kind]??e.kind}),(0,t.jsxs)("span",{className:"text-[12.5px] text-ink-3",children:[e.guardian_name??e.family_name,e.student_name?` \xb7 about ${e.student_name}`:""]}),(0,t.jsx)("span",{className:"ml-auto text-[12.5px] text-ink-3",children:(0,N.relativeDay)(e.created_at)})]}),(0,t.jsx)("p",{className:"mt-1.5 font-medium",children:e.subject}),(0,t.jsx)("p",{className:"mt-0.5 text-sm text-ink-2",children:e.body}),(0,t.jsx)("div",{className:"mt-2.5 flex flex-wrap gap-2",children:s?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(j.Button,{size:"sm",variant:"primary",onClick:()=>I(e),children:[(0,t.jsx)(m,{className:"size-4","aria-hidden":!0})," Acknowledge & add to record"]}),(0,t.jsxs)(j.Button,{size:"sm",loading:F.isPending&&F.variables?.id===e.id,onClick:()=>F.mutate(e),children:[(0,t.jsx)(d.Check,{className:"size-4","aria-hidden":!0})," Acknowledge"]}),(0,t.jsxs)(j.Button,{size:"sm",variant:"ghost",onClick:()=>T(e),children:[(0,t.jsx)(l.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply"]})]}):e.action?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(j.Button,{size:"sm",variant:"primary",loading:z.isPending&&z.variables?.id===e.id,onClick:()=>z.mutate(e),children:[(0,t.jsx)(d.Check,{className:"size-4","aria-hidden":!0}),"join_class"===e.action?"Give them a place":"add_child"===e.action?"Add to the family":"Book the trial"]}),(0,t.jsxs)(j.Button,{size:"sm",variant:"ghost",onClick:()=>T(e),children:[(0,t.jsx)(l.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply instead"]})]}):e.session_id?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(j.Button,{size:"sm",variant:"primary",loading:L.isPending&&L.variables===e.session_id,onClick:()=>L.mutate(e.session_id),children:[(0,t.jsx)(f.UserRoundCheck,{className:"size-4","aria-hidden":!0})," Arrange cover"]}),(0,t.jsxs)(j.Button,{size:"sm",variant:"ghost",onClick:()=>T(e),children:[(0,t.jsx)(l.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply"]})]}):(0,t.jsxs)(j.Button,{size:"sm",onClick:()=>T(e),children:[(0,t.jsx)(l.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply"]})})]},e.id)})})]}),(0,t.jsxs)(j.Card,{children:[(0,t.jsx)(j.CardHeader,{title:"Event and competition entries",subtitle:"Nothing is in the diary until you confirm it"}),y.isLoading&&(0,t.jsx)("div",{className:"space-y-2 p-4",children:[0,1].map(e=>(0,t.jsx)(j.Skeleton,{className:"h-14"},e))}),y.error&&(0,t.jsx)("div",{className:"p-4",children:(0,t.jsx)(j.ErrorState,{error:y.error})}),y.data?.length===0&&!y.isLoading&&(0,t.jsx)(j.EmptyState,{icon:(0,t.jsx)(o.Trophy,{className:"size-5"}),title:"No entries waiting",body:"Requests from families appear here."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:y.data?.map(e=>(0,t.jsxs)("li",{className:"flex flex-wrap items-center gap-3 px-4 py-3",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"block truncate font-medium",children:e.student_name}),(0,t.jsxs)("span",{className:"block truncate text-[13px] text-ink-2",children:[e.event_title," · ",(0,N.dateLong)(e.starts_at),", ",(0,N.time)(e.starts_at)]})]}),(0,t.jsxs)("span",{className:"flex shrink-0 gap-2",children:[(0,t.jsxs)(j.Button,{size:"sm",variant:"secondary",loading:U.isPending,onClick:()=>U.mutate({id:e.id,status:"declined"}),children:[(0,t.jsx)(r.X,{className:"size-4","aria-hidden":!0})," Decline"]}),(0,t.jsxs)(j.Button,{size:"sm",variant:"primary",loading:U.isPending,onClick:()=>U.mutate({id:e.id,status:"confirmed"}),children:[(0,t.jsx)(d.Check,{className:"size-4","aria-hidden":!0})," Confirm"]})]})]},e.id))})]})]}),q&&(0,t.jsx)(E.SessionSheet,{session:q,initial:"cover",onClose:()=>P(null)}),C&&(0,t.jsx)(k,{request:C,onClose:()=>T(null)}),R&&(0,t.jsx)(A,{request:R,onClose:()=>I(null),onDone:e=>{I(null),M(e)}})]})}],21840)},48848,e=>{e.v(t=>Promise.all(["static/chunks/3nhlwy-u1j2hl.js"].map(t=>e.l(t))).then(()=>t(39726)))},56166,e=>{e.v(t=>Promise.all(["static/chunks/07646-1w_v3wj.js"].map(t=>e.l(t))).then(()=>t(52715)))},27389,e=>{"use strict";let t=`
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
select ev.id, ev.kind, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.venue,
       ev.cost_minor, ev.capacity, ev.entries_close_on, ev.requests_open,
       sm.display_name as teacher, ev.student_id,
       (select count(*)::int from event_participant p
         where p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null) as going,
       (select p.status::text from event_participant p
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_status,
       (select s.first_name from event_participant p join student s on s.id = p.student_id
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_student,
       (select p.id from event_participant p where p.event_id = ev.id and p.deleted_at is null
           and p.status = 'invited' limit 1) as my_invite,
       coalesce((select jsonb_agg(jsonb_build_object('title', r.title, 'starts_at', r.starts_at) order by r.starts_at)
                   from studio_event r where r.parent_event_id = ev.id and r.deleted_at is null and r.status = 'published'), '[]') as rehearsals,
       coalesce((select jsonb_agg(jsonb_build_object('title', rt.title, 'costume', rt.costume, 'position', rt.position) order by rt.position)
                   from event_routine rt where rt.event_id = ev.id and rt.deleted_at is null
                    and (exists (select 1 from routine_dancer d where d.routine_id = rt.id)
                         or rt.class_id in (select e.class_id from enrolment e where e.status = 'active' and e.deleted_at is null))), '[]') as routines
  from studio_event ev
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at > now() - interval '1 day' and ev.parent_event_id is null
 order by ev.starts_at`,a=`
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
 order by r.created_at desc`,d=`
insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
select s.studio_id, s.family_id, s.id, $2::request_kind, $3, $4, auth.uid()
  from student s where s.id = $1
returning id`,r=`
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
 order by starts_at`,l=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`,o=`
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
 order by (r.kind = 'medical_update') desc, r.created_at`,c=`
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
returning id`,_=`
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
 order by (a.id is null), r.kind, r.created_at desc`,h=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,p=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,y=`
select app.retire_resource($1) as ok`,g=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,m,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,p,"CLASS_DETAIL",0,_,"CLASS_RESOURCES",0,f,"CREATE_RESOURCE",0,h,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,y,"EVENTS",0,i,"MY_REQUESTS",0,n,"MY_TEACHING_CLASSES",0,g,"MY_TIMETABLE",0,r,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,o,"RAISE_REQUEST",0,d,"REQUEST_PLACE",0,a,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,l])},42268,e=>{"use strict";let t=`
select f.id, f.name, f.balance_minor,
       (select count(*)::int from student s where s.family_id = f.id and s.deleted_at is null) as children,
       (select count(*)::int from guardian g where g.family_id = f.id and g.deleted_at is null) as guardians,
       (select g.full_name from guardian g where g.family_id = f.id and g.deleted_at is null
         order by g.is_primary desc limit 1) as primary_guardian,
       (select g.email from guardian g where g.family_id = f.id and g.deleted_at is null
         order by g.is_primary desc limit 1) as primary_email,
       (select g.phone from guardian g where g.family_id = f.id and g.deleted_at is null
         order by g.is_primary desc limit 1) as primary_phone,
       (select count(*)::int from payment p where p.family_id = f.id and p.deleted_at is null
         and p.failure_code is not null and p.succeeded_at is null) as failed_payments,
       (select string_agg(s.first_name, ', ' order by s.date_of_birth)
          from student s where s.family_id = f.id and s.deleted_at is null) as child_names
  from family f
 where f.deleted_at is null
 order by f.name`,s=`
select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth,
       s.family_id, f.name as family_name,
       (select count(*)::int from enrolment e
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null) as classes,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*), 0))::int
          from attendance_record ar where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       coalesce((select b.has_medical_need from student_safety_brief b where b.student_id = s.id), false) as has_need,
       (select cr.granted from consent_record cr
         where cr.student_id = s.id and cr.kind = 'photography' and cr.deleted_at is null) as photo_consent
  from student s
  join family f on f.id = s.family_id
 where s.deleted_at is null
 order by s.last_name, s.first_name`,i=`
select f.id, f.name, f.address_line1, f.city, f.postcode, f.balance_minor, f.notes
  from family f where f.id = $1 and f.deleted_at is null`,a=`
select g.id, g.full_name, g.email, g.phone, g.relationship, g.is_primary, g.receives_billing,
       g.user_id is not null as has_login
  from guardian g where g.family_id = $1 and g.deleted_at is null
 order by g.is_primary desc, g.full_name`,n=`
select s.id, s.first_name, s.last_name, s.date_of_birth, s.joined_on,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       (select string_agg(c.name, ', ' order by c.name) from enrolment e
          join class c on c.id = e.class_id
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null) as class_names
  from student s where s.family_id = $1 and s.deleted_at is null
 order by s.date_of_birth`,d=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor
  from invoice i where i.family_id = $1 and i.deleted_at is null
 order by i.issued_on desc nulls last limit 10`,r=`
select cm.id, cm.subject, cm.body, cm.sent_at, cm.kind
  from communication cm where cm.family_id = $1 and cm.deleted_at is null
 order by cm.sent_at desc limit 10`,l=`
select student_id, allergies, conditions, medications, action_plan, requires_alert, has_medical_need,
       emergency_contact_name, emergency_contact_phone, emergency_contacts, photo_consent
  from student_safety_brief where student_id = $1`,o=`
insert into family (studio_id, name, address_line1, city, postcode, notes, created_by)
select id, $1, nullif(btrim($2),''), nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), auth.uid()
  from studio where deleted_at is null limit 1
returning id`,c=`
update family set name = $2, address_line1 = nullif(btrim($3),''),
       city = nullif(btrim($4),''), postcode = nullif(btrim($5),''),
       notes = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`,u=`
insert into guardian (studio_id, family_id, full_name, email, phone, relationship,
                      is_primary, receives_billing)
select f.studio_id, f.id, $2, nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), $6, $7
  from family f where f.id = $1
returning id`,m=`
update guardian set full_name = $2, email = nullif(btrim($3),''),
       phone = nullif(btrim($4),''), relationship = nullif(btrim($5),''),
       is_primary = $6, receives_billing = $7, updated_at = now()
 where id = $1 returning id`,_=`
select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, s.pronouns,
       s.school, s.joined_on, s.left_on, s.notes, s.family_id, f.name as family_name
  from student s join family f on f.id = s.family_id
 where s.id = $1 and s.deleted_at is null`,f=`
insert into student (studio_id, family_id, first_name, last_name, preferred_name,
                     date_of_birth, pronouns, school, joined_on, notes, created_by)
select f.studio_id, f.id, $2, $3, nullif(btrim($4),''), $5::date, nullif(btrim($6),''),
       nullif(btrim($7),''), coalesce($8::date, current_date), nullif(btrim($9),''), auth.uid()
  from family f where f.id = $1
returning id`,h=`
update student set first_name = $2, last_name = $3, preferred_name = nullif(btrim($4),''),
       date_of_birth = $5::date, pronouns = nullif(btrim($6),''),
       school = nullif(btrim($7),''), notes = nullif(btrim($8),''),
       left_on = $9::date, updated_at = now()
 where id = $1 returning id`,p=`
select m.id, m.allergies, m.conditions, m.medications, m.action_plan, m.requires_alert,
       m.doctor_name, m.doctor_phone, m.updated_at, u.full_name as updated_by_name
  from medical_record m
  left join user_account u on u.id = m.updated_by
 where m.student_id = $1 and m.deleted_at is null`,y=`
insert into medical_record (studio_id, student_id, allergies, conditions, medications,
                            action_plan, requires_alert, doctor_name, doctor_phone, updated_by)
select s.studio_id, s.id, nullif(btrim($2),''), nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), $6, nullif(btrim($7),''), nullif(btrim($8),''), auth.uid()
  from student s where s.id = $1
on conflict (student_id) do update
  set allergies = excluded.allergies, conditions = excluded.conditions,
      medications = excluded.medications, action_plan = excluded.action_plan,
      requires_alert = excluded.requires_alert, doctor_name = excluded.doctor_name,
      doctor_phone = excluded.doctor_phone, updated_by = excluded.updated_by,
      updated_at = now(), deleted_at = null
returning id`,g=`
select id, full_name, relationship, phone, priority
  from emergency_contact
 where student_id = $1 and deleted_at is null
 order by priority, full_name`,b=`
insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
select s.studio_id, s.id, $2, nullif(btrim($3),''), $4,
       coalesce((select max(priority) + 1 from emergency_contact
                  where student_id = s.id and deleted_at is null), 1)
  from student s where s.id = $1
returning id`,x=`
select sm.id, sm.display_name, sm.email, sm.colour, sm.status::text as status, sm.bio, sm.user_id,
       (select count(*)::int from class c
         where (c.teacher_id = sm.id or c.assistant_id = sm.id) and c.deleted_at is null) as classes
  from staff_member sm where sm.deleted_at is null
 order by sm.status, sm.display_name`,v=`
insert into staff_member (studio_id, display_name, email, colour, status, bio)
select id, $1, nullif(btrim($2),''), $3, $4::staff_status, nullif(btrim($5),'')
  from studio where deleted_at is null limit 1
returning id`,j=`
update staff_member set display_name = $2, email = nullif(btrim($3),''), colour = $4,
       status = $5::staff_status, bio = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`;e.s(["CREATE_EMERGENCY",0,b,"CREATE_FAMILY",0,o,"CREATE_GUARDIAN",0,u,"CREATE_STAFF",0,v,"CREATE_STUDENT",0,f,"EMERGENCY_CONTACTS",0,g,"FAMILIES",0,t,"FAMILY_DETAIL",0,i,"FAMILY_GUARDIANS",0,a,"FAMILY_INVOICES",0,d,"FAMILY_MESSAGES",0,r,"FAMILY_STUDENTS",0,n,"MEDICAL",0,p,"REMOVE_EMERGENCY",0,"select app.soft_delete('emergency_contact', $1) as ok","REMOVE_GUARDIAN",0,"select app.soft_delete('guardian', $1) as ok","REMOVE_STAFF",0,"select app.soft_delete('staff_member', $1) as ok","SAVE_MEDICAL",0,y,"STAFF_FULL",0,x,"STUDENTS",0,s,"STUDENT_DETAIL",0,_,"STUDENT_SAFETY",0,l,"UPDATE_FAMILY",0,c,"UPDATE_GUARDIAN",0,m,"UPDATE_STAFF",0,j,"UPDATE_STUDENT",0,h])}]);