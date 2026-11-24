(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,23622,e=>{"use strict";let s=(0,e.i(75254).default)("ban",[["path",{d:"M4.929 4.929 19.07 19.071",key:"196cmz"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);e.s(["Ban",0,s],23622)},17068,e=>{"use strict";let s=(0,e.i(75254).default)("calendar-x-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]]);e.s(["CalendarX2",0,s],17068)},63059,e=>{"use strict";let s=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,s],63059)},46897,e=>{"use strict";let s=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,s],46897)},10629,e=>{"use strict";var s=e.i(43476),t=e.i(71645);let a=(0,e.i(75254).default)("chevron-left",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);var n=e.i(63059),i=e.i(17068),l=e.i(7233),r=e.i(77326),c=e.i(47741),o=e.i(7725),d=e.i(78215),m=e.i(13927),u=e.i(17658),h=e.i(21011),_=e.i(75379),p=e.i(45060);function x({sessions:e,view:a}){let[n,l]=t.useState(null),r=t.useMemo(()=>{let s=new Map,t=e=>"teacher"===a?e.teacher??"Unassigned":"room"===a?[e.location,e.room].filter(Boolean).join(" · ")||"No room set":`${(0,_.isoDate)(e.starts_at)}|${(0,_.dayName)(e.starts_at)}`;for(let n of e){if("day"===a&&(0,_.isoDate)(n.starts_at)!==(0,_.isoDate)(new Date))continue;let e=t(n);s.set(e,[...s.get(e)??[],n])}return[...s.entries()].sort((e,s)=>e[0].localeCompare(s[0]))},[e,a]);return 0===r.length?(0,s.jsx)(u.Card,{children:(0,s.jsx)(u.EmptyState,{icon:(0,s.jsx)(i.CalendarX2,{className:"size-5"}),title:"Nothing today",body:"Switch to the week view to see the rest of the timetable."})}):(0,s.jsxs)("div",{className:"space-y-4",children:[n&&(0,s.jsx)(o.SessionSheet,{session:n,onClose:()=>l(null)}),r.map(([e,t])=>{let a=e.includes("|")?e.split("|")[1]:e,n=e.includes("|")?e.split("|")[0]:null,i=t.reduce((e,s)=>e+("cancelled"===s.status?0:s.enrolled),0);return(0,s.jsxs)(u.Card,{children:[(0,s.jsxs)("div",{className:"flex items-baseline gap-2.5 border-b border-line px-4 py-2.5",children:[(0,s.jsx)("h2",{className:"font-semibold",children:a}),n&&(0,s.jsx)("span",{className:"text-[13px] text-ink-3",children:(0,_.dateLong)(n)}),(0,s.jsxs)("span",{className:"ml-auto text-[12.5px] text-ink-3",children:[t.length," class",1===t.length?"":"es"," · ",i," places"]})]}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:t.map(e=>(0,s.jsx)("li",{children:(0,s.jsx)(c.SessionRow,{session:e,onSelect:()=>l(e)})},e.id))})]},e)})]})}e.s(["default",0,function(){let[e,c]=t.useState(()=>new Date),[o,f]=t.useState(!1),[g,v]=t.useState("week"),[y,j]=t.useMemo(()=>(0,_.weekRange)(e),[e]),b=(0,m.useRows)(["week",y],h.SESSIONS_BETWEEN,[y,j]),S=s=>{let t=new Date(e);t.setDate(t.getDate()+7*s),c(t)},w=new Date(y).toDateString()===new Date((0,_.weekRange)(new Date)[0]).toDateString();return(0,s.jsxs)(r.Shell,{title:"Schedule",subtitle:`${(0,_.dateLong)(y)} – ${(0,_.dateLong)(new Date(new Date(j).getTime()-864e5))}`,allow:["owner","admin"],actions:(0,s.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,s.jsx)(u.Button,{size:"sm",variant:"ghost",onClick:()=>S(-1),"aria-label":"Previous week",children:(0,s.jsx)(a,{className:"size-4","aria-hidden":!0})}),(0,s.jsx)(u.Button,{size:"sm",variant:"secondary",onClick:()=>c(new Date),disabled:w,children:w?"This week":"Back to today"}),(0,s.jsx)(u.Button,{size:"sm",variant:"ghost",onClick:()=>S(1),"aria-label":"Next week",children:(0,s.jsx)(n.ChevronRight,{className:"size-4","aria-hidden":!0})}),(0,s.jsxs)(u.Button,{size:"sm",variant:"primary",onClick:()=>f(!0),children:[(0,s.jsx)(l.Plus,{className:"size-4","aria-hidden":!0})," New class"]})]}),children:[(0,s.jsxs)("div",{className:"mx-auto max-w-6xl space-y-4",children:[(0,s.jsx)("div",{role:"tablist","aria-label":"Schedule view",className:"inline-flex rounded-[var(--radius-md)] border border-line bg-surface p-0.5",children:["week","day","teacher","room"].map(e=>(0,s.jsx)("button",{role:"tab","aria-selected":g===e,onClick:()=>v(e),className:(0,p.cn)("min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium capitalize transition-colors",g===e?"bg-accent-soft text-accent-ink":"text-ink-2 hover:text-ink"),children:"room"===e?"Room":e},e))}),b.isLoading&&(0,s.jsx)(u.Card,{className:"space-y-3 p-4",children:[0,1,2,3].map(e=>(0,s.jsx)(u.Skeleton,{className:"h-14"},e))}),b.error&&(0,s.jsx)(u.ErrorState,{error:b.error,onRetry:()=>b.refetch()}),b.data&&0===b.data.length&&(0,s.jsx)(u.Card,{children:(0,s.jsx)(u.EmptyState,{icon:(0,s.jsx)(i.CalendarX2,{className:"size-5"}),title:"No classes this week",body:"Either the term has not started or this week falls in a break."})}),b.data&&b.data.length>0&&(0,s.jsx)(x,{sessions:b.data,view:g})]}),o&&(0,s.jsx)(d.ClassForm,{onClose:()=>f(!1)})]})}],10629)},47741,e=>{"use strict";var s=e.i(43476),t=e.i(22016),a=e.i(46897),n=e.i(84614),i=e.i(61911),l=e.i(17658),r=e.i(75379),c=e.i(45060);let o={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"},d={violet:"bg-violet",amber:"bg-amber",teal:"bg-teal",rose:"bg-rose",indigo:"bg-indigo",lime:"bg-lime"};e.s(["SessionRow",0,function({session:e,href:m,onSelect:u}){let h="cancelled"===e.status,_=e.enrolled>=e.capacity,p=(0,s.jsxs)("div",{className:(0,c.cn)("flex items-stretch gap-3 px-4 py-3",h&&"opacity-60"),children:[(0,s.jsx)("span",{"aria-hidden":!0,className:(0,c.cn)("w-1 shrink-0 rounded-full",d[e.colour??""]??"bg-surface-3")}),(0,s.jsxs)("span",{className:"w-[52px] shrink-0 pt-0.5",children:[(0,s.jsx)("span",{className:(0,c.cn)("tnum block text-sm font-semibold",h&&"line-through"),children:(0,r.time)(e.starts_at)}),(0,s.jsx)("span",{className:"tnum block text-[12px] text-ink-3",children:(0,r.time)(e.ends_at)})]}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("span",{className:"flex flex-wrap items-center gap-x-2 gap-y-1",children:[(0,s.jsx)("span",{className:(0,c.cn)("font-medium",h&&"line-through"),children:e.name}),e.style&&(0,s.jsx)(l.Badge,{tone:o[e.colour??""]??"neutral",children:e.style}),h&&(0,s.jsxs)(l.Badge,{tone:"critical",children:["Cancelled",e.cancel_reason?` \xb7 ${e.cancel_reason}`:""]}),!h&&e.covered&&(0,s.jsx)(l.Badge,{tone:"caution",children:"Cover"}),!h&&e.moved&&(0,s.jsx)(l.Badge,{tone:"info",children:"Moved"}),!h&&e.trials>0&&(0,s.jsxs)(l.Badge,{tone:"info",children:[e.trials," trial",1===e.trials?"":"s"]})]}),(0,s.jsxs)("span",{className:"mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-ink-2",children:[e.teacher&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,s.jsx)(n.User,{className:"size-3.5","aria-hidden":!0}),e.teacher]}),e.room&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,s.jsx)(a.MapPin,{className:"size-3.5","aria-hidden":!0}),e.room]}),(0,s.jsxs)("span",{className:(0,c.cn)("inline-flex items-center gap-1",_&&"font-medium text-caution"),children:[(0,s.jsx)(i.Users,{className:"size-3.5","aria-hidden":!0}),e.enrolled,"/",e.capacity,_?" · full":""]})]})]})]});return u?(0,s.jsx)("button",{onClick:u,className:"block w-full text-left transition-colors hover:bg-surface-2",children:p}):m?(0,s.jsx)(t.default,{href:m,className:"block transition-colors hover:bg-surface-2",children:p}):p}])},7725,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(22016),n=e.i(54616),i=e.i(12598),l=e.i(23622),r=e.i(59208);let c=(0,e.i(75254).default)("user-round-cog",[["path",{d:"m14.305 19.53.923-.382",key:"3m78fa"}],["path",{d:"m15.228 16.852-.923-.383",key:"npixar"}],["path",{d:"m16.852 15.228-.383-.923",key:"5xggr7"}],["path",{d:"m16.852 20.772-.383.924",key:"dpfhf9"}],["path",{d:"m19.148 15.228.383-.923",key:"1reyyz"}],["path",{d:"m19.53 21.696-.382-.924",key:"1goivc"}],["path",{d:"M2 21a8 8 0 0 1 10.434-7.62",key:"1yezr2"}],["path",{d:"m20.772 16.852.924-.383",key:"htqkph"}],["path",{d:"m20.772 19.148.924.383",key:"9w9pjp"}],["circle",{cx:"10",cy:"8",r:"5",key:"o932ke"}],["circle",{cx:"18",cy:"18",r:"3",key:"1xkwt0"}]]);var o=e.i(54385),d=e.i(95468),m=e.i(65712),u=e.i(13927),h=e.i(30224),_=e.i(31502),p=e.i(17658),x=e.i(21011),f=e.i(75379),g=e.i(45060);e.s(["SessionSheet",0,function({session:e,onClose:v,initial:y="menu"}){let{session:j}=(0,_.useSession)(),b=(0,i.useQueryClient)(),[S,w]=t.useState(y),[N,k]=t.useState(null),C=(0,u.useRows)(["session-families",e.id],x.SESSION_FAMILIES,[e.id]).data?.[0]?.n??0,$=(0,u.useRows)(["staff-options"],x.STAFF_OPTIONS,[],{enabled:"cover"===S}),E=(0,u.useRows)(["room-options"],x.ROOM_OPTIONS,[],{enabled:"move"===S}),T=`${e.name} on ${(0,f.dateLong)(e.starts_at)} at ${(0,f.time)(e.starts_at)}`,[O,I]=t.useState(""),[M,A]=t.useState(""),[R,z]=t.useState(!0),[B,D]=t.useState((0,f.isoDate)(e.starts_at)),[F,L]=t.useState((0,f.time)(e.starts_at)),[q,P]=t.useState(e.room_id??""),[U,V]=t.useState("");t.useEffect(()=>{"cancel"===S&&A(`Sorry — ${T} is cancelled${O?` (${O.trim()})`:""}. We will see you next week.`)},[S,O,T]),t.useEffect(()=>{"move"===S&&A(`${T} is moving to ${B?(0,f.dateLong)(B):"…"} at ${F}${E.data?.find(e=>e.id===q)?`, ${E.data.find(e=>e.id===q).name}`:""}.`)},[S,B,F,q,E.data,T]),t.useEffect(()=>{let e=$.data?.find(e=>e.id===U)?.display_name;"cover"===S&&A(e?`${e} will be teaching ${T}.`:"")},[S,U,$.data,T]);let W=(0,n.useMutation)({mutationFn:async()=>(0,h.runAs)(j,s=>{if("cancel"===S)return s(x.CANCEL_SESSION,[e.id,O.trim(),M,R]);if("move"===S){let t=new Date(`${B}T${F}:00`);return s(x.MOVE_SESSION,[e.id,t.toISOString(),q||null,M,R])}return s(x.COVER_SESSION,[e.id,U||null,M,R])}),onSuccess:()=>{b.invalidateQueries({queryKey:["db"]}),k("cancel"===S?`Cancelled.${R?` ${C} famil${1===C?"y has":"ies have"} been told, and the teacher.`:""}`:"move"===S?`Moved.${R?` ${C} famil${1===C?"y has":"ies have"} been told.`:""}`:"Cover arranged. The teacher has the register and safety notes on their Today screen.")}});if(N)return(0,s.jsx)(m.RecordSheet,{title:"Done",onClose:v,onSave:v,saveLabel:"Close",children:(0,s.jsxs)("p",{className:"flex items-start gap-2 text-sm",children:[(0,s.jsx)(d.CheckCircle2,{className:"mt-0.5 size-4 text-positive","aria-hidden":!0}),N]})});if("menu"===S){let t="cancelled"===e.status;return(0,s.jsxs)(m.RecordSheet,{title:e.name,subtitle:`${(0,f.dateLong)(e.starts_at)} \xb7 ${(0,f.time)(e.starts_at)}–${(0,f.time)(e.ends_at)}${e.room?` \xb7 ${e.room}`:""}`,onClose:v,onSave:v,saveLabel:"Close",children:[(0,s.jsxs)("div",{className:"flex flex-wrap gap-1.5",children:[e.teacher&&(0,s.jsxs)(p.Badge,{children:[e.teacher,e.covered?` (covering for ${e.usual_teacher})`:""]}),(0,s.jsxs)(p.Badge,{children:[e.enrolled,"/",e.capacity," booked",e.trials?` \xb7 ${e.trials} trial`:""]}),t&&(0,s.jsxs)(p.Badge,{tone:"critical",children:["Cancelled",e.cancel_reason?`: ${e.cancel_reason}`:""]})]}),(0,s.jsx)("ul",{className:"divide-y divide-line rounded-[var(--radius-md)] border border-line",children:[["register",o.ClipboardCheck,"Open the register","Mark attendance for this session"],["cancel",l.Ban,"Cancel this session","Just this one — the rest of the term is unchanged"],["move",r.CalendarClock,"Move this session","Another day, time or room"],["cover",c,e.covered?"Change cover":"Arrange cover","Another teacher for this session only"]].map(([n,i,l,r])=>{let c=t?"register"!==n:e.register_closed&&"register"!==n,o=(0,s.jsxs)("span",{className:(0,g.cn)("flex min-h-[52px] items-center gap-3 px-3 py-2.5 text-left",c&&"opacity-50"),children:[(0,s.jsx)(i,{className:(0,g.cn)("size-4 shrink-0","cancel"===n?"text-critical":"text-ink-3"),"aria-hidden":!0}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsx)("span",{className:"block text-sm font-medium",children:l}),(0,s.jsx)("span",{className:"block text-[12.5px] text-ink-3",children:r})]})]});return(0,s.jsx)("li",{children:"register"===n?(0,s.jsx)(a.default,{href:`/teach/register/?session=${e.id}`,className:"block hover:bg-surface-2",children:o}):(0,s.jsx)("button",{disabled:c,onClick:()=>w(n),className:"block w-full hover:bg-surface-2 disabled:pointer-events-none",children:o})},n)})}),e.register_closed&&!t&&(0,s.jsx)("p",{className:"text-[12.5px] text-ink-3",children:"This session has been taught, so it can no longer be changed."})]})}let Y="cancel"===S?"Cancel this session":"move"===S?"Move this session":"Arrange cover",G="cancel"===S?O.trim().length>=3:"move"!==S||!!B&&/^\d{2}:\d{2}$/.test(F);return(0,s.jsxs)(m.RecordSheet,{title:Y,subtitle:T,onClose:v,onSave:()=>W.mutate(),saving:W.isPending,error:W.error,canSave:G&&M.trim().length>3||"cover"===S&&!U&&e.covered,saveLabel:"cancel"===S?R?`Cancel and tell ${C} famil${1===C?"y":"ies"}`:"Cancel session":"move"===S?R?`Move and tell ${C} famil${1===C?"y":"ies"}`:"Move session":U||!e.covered?"Arrange cover":"Back to the usual teacher",children:["cancel"===S&&(0,s.jsx)(p.Field,{label:"Reason",htmlFor:"ss-reason",required:!0,hint:"Families see this.",children:(0,s.jsx)(p.Input,{id:"ss-reason",value:O,onChange:e=>I(e.target.value),placeholder:"Teacher unwell",maxLength:120})}),"move"===S&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-3",children:[(0,s.jsx)(p.Field,{label:"Date",htmlFor:"ss-date",required:!0,children:(0,s.jsx)(p.Input,{id:"ss-date",type:"date",value:B,onChange:e=>D(e.target.value)})}),(0,s.jsx)(p.Field,{label:"Starts",htmlFor:"ss-time",required:!0,children:(0,s.jsx)(p.Input,{id:"ss-time",type:"time",value:F,onChange:e=>L(e.target.value)})})]}),(0,s.jsx)(p.Field,{label:"Room",htmlFor:"ss-room",children:(0,s.jsxs)(p.Select,{id:"ss-room",value:q,onChange:e=>P(e.target.value),children:[(0,s.jsx)("option",{value:"",children:"Same room"}),E.data?.map(e=>(0,s.jsx)("option",{value:e.id,children:e.name},e.id))]})}),(0,s.jsx)("p",{className:"text-[12.5px] text-ink-3",children:"The session keeps its length. Only this session moves."})]}),"cover"===S&&(0,s.jsx)(p.Field,{label:"Who will teach it",htmlFor:"ss-teacher",hint:"They get the register and the safety notes for this session's children.",children:(0,s.jsxs)(p.Select,{id:"ss-teacher",value:U,onChange:e=>V(e.target.value),children:[(0,s.jsx)("option",{value:"",children:e.covered?`Back to ${e.usual_teacher??"the usual teacher"}`:"Choose a teacher…"}),$.data?.map(e=>(0,s.jsx)("option",{value:e.id,children:e.display_name},e.id))]})}),(0,s.jsxs)("label",{className:"flex items-start gap-2.5 text-sm",children:[(0,s.jsx)("input",{type:"checkbox",checked:R,onChange:e=>z(e.target.checked),className:"mt-0.5 size-4"}),(0,s.jsxs)("span",{children:["cover"===S?"Tell the families too":`Tell the ${C} famil${1===C?"y":"ies"} and the teacher`,(0,s.jsx)("span",{className:"block text-[12.5px] text-ink-3",children:"cover"===S?"The covering teacher is always told.":"A class notice, plus a notification each."})]})]}),(R||"cover"===S)&&(0,s.jsx)(p.Field,{label:"Message",htmlFor:"ss-msg",children:(0,s.jsx)("textarea",{id:"ss-msg",rows:3,value:M,onChange:e=>A(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12"})}),(0,s.jsx)(p.Button,{variant:"ghost",size:"sm",onClick:()=>w("menu"),children:"← Other options"})]})}],7725)},21011,e=>{"use strict";let s=`
with todays as (
  select cs.* from class_session cs
   where cs.deleted_at is null
     and (cs.starts_at at time zone 'Europe/London')::date = (now() at time zone 'Europe/London')::date
)
select
  count(*) filter (where status <> 'cancelled')::int as classes,
  coalesce((select count(*) from enrolment e
             where e.status = 'active' and e.deleted_at is null
               and e.class_id in (select class_id from todays where status <> 'cancelled')), 0)::int
    as students_expected,
  coalesce((select count(*) from trial t
             where t.deleted_at is null and t.status = 'booked'
               and t.session_id in (select id from todays)), 0)::int as trials,
  count(*) filter (where status = 'cancelled')::int as cancelled,
  count(*) filter (where teacher_id is not null)::int as covered
from todays`,t=`
select
  (select count(*)::int from payment
    where deleted_at is null and failure_code is not null and succeeded_at is null) as failed,
  (select coalesce(sum(total_minor - paid_minor), 0)::bigint from invoice
    where deleted_at is null and status in ('issued','part_paid')) as outstanding_minor,
  (select count(*)::int from invoice
    where deleted_at is null and status in ('issued','part_paid')) as unpaid_invoices`,a=`
select c.id, c.name,
       c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity, 0))::int as pct
  from class c
 where c.deleted_at is null
   and app.class_enrolled_count(c.id) >= greatest(c.capacity - 1, 1)
 order by waiting desc, pct desc`,n=`
select e.id, e.contact_name, e.child_name, e.next_action_on,
       c.name as class_name
  from enquiry e
  left join class c on c.id = e.interest_class_id
 where e.deleted_at is null and e.stage in ('trial_attended','follow_up')
 order by e.next_action_on nulls last`,i=`
with marks as (
  select ar.student_id, cs.class_id, ar.status,
         row_number() over (partition by ar.student_id, cs.class_id order by cs.starts_at desc) as rn
    from attendance_record ar
    join class_session cs on cs.id = ar.session_id and cs.deleted_at is null
   where ar.deleted_at is null and cs.starts_at < now()
),
runs as (
  select student_id, class_id
    from marks where rn <= 3
   group by student_id, class_id
  having count(*) = 3 and bool_and(status in ('absent'))
)
select s.id, s.first_name, s.last_name,
       min(c.name) as class_name,
       count(*)::int as classes_affected
  from runs r
  join student s on s.id = r.student_id
  join class c on c.id = r.class_id
 group by s.id, s.first_name, s.last_name
 order by s.last_name, s.first_name`,l=`
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour, lv.name as level,
       coalesce(cover.display_name, st.display_name) as teacher,
       coalesce(sr.name, r.name) as room, l.name as location,
       app.class_enrolled_count(c.id) as enrolled, c.capacity,
       (select count(*)::int from trial t
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials,
       cs.teacher_id is not null and cs.teacher_id is distinct from c.teacher_id as covered,
       cs.cancel_reason, cs.original_starts_at is not null as moved, st.display_name as usual_teacher,
       coalesce(cs.room_id, c.room_id) as room_id, cs.register_closed_at is not null as register_closed
  from class_session cs
  join class c on c.id = cs.class_id and c.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join level lv on lv.id = c.level_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by cs.starts_at, c.name`,r=l.replace("and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz","and cs.id = $1"),c=`
select e.id, e.started_on, s.first_name, s.last_name, c.name as class_name
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where e.deleted_at is null and e.status = 'active'
 order by e.started_on desc, e.created_at desc
 limit 6`,o=`
select t.id, t.status, cs.starts_at, c.name as class_name,
       coalesce(eq.child_name, s.first_name || ' ' || s.last_name) as who,
       eq.contact_name
  from trial t
  join class c on c.id = t.class_id
  left join class_session cs on cs.id = t.session_id
  left join enquiry eq on eq.id = t.enquiry_id
  left join student s on s.id = t.student_id
 where t.deleted_at is null and t.status in ('requested','booked')
 order by cs.starts_at nulls last
 limit 6`,d=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at,
       f.name as family_name, c.name as class_name
  from communication cm
  left join family f on f.id = cm.family_id
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
 order by cm.sent_at desc
 limit 5`,m=`
select count(*)::int as awaiting,
       string_agg(name, ', ' order by last_at) filter (where rn <= 3) as names
  from (select f.name, last.sent_at as last_at, row_number() over (order by last.sent_at) rn
          from family f
          join lateral (select inbound, sent_at from communication c
                         where c.family_id = f.id and c.kind = 'direct' and c.deleted_at is null
                         order by c.sent_at desc limit 1) last on last.inbound
         where f.deleted_at is null) t`,u=`
select
  (select count(*)::int from studio_request
    where deleted_at is null and status in ('open','in_progress')) as open_requests,
  (select count(*)::int from event_participant
    where deleted_at is null and status = 'requested') as pending_entries,
  (select count(*)::int from studio_request
    where deleted_at is null and status = 'open' and kind = 'medical_update') as medical_updates`,h=`select r.id, l.name || ' \xb7 ' || r.name as name from room r join location l on l.id = r.location_id
  where r.deleted_at is null order by l.name, r.name`,_=`
select count(distinct st.family_id)::int as n from enrolment e join student st on st.id = e.student_id
 where e.class_id = (select class_id from class_session where id = $1) and e.status = 'active' and e.deleted_at is null`;e.s(["ATTENTION_CAPACITY",0,a,"ATTENTION_LAPSED",0,i,"ATTENTION_MESSAGES",0,m,"ATTENTION_PAYMENTS",0,t,"ATTENTION_REQUESTS",0,u,"ATTENTION_TRIALS",0,n,"CANCEL_SESSION",0,"select app.cancel_session($1, $2, $3, $4)","COVER_SESSION",0,"select app.cover_session($1, $2, $3, $4)","MOVE_SESSION",0,"select app.move_session($1, $2::timestamptz, $3, $4, $5)","RECENT_ENROLMENTS",0,c,"RECENT_MESSAGES",0,d,"ROOM_OPTIONS",0,h,"SESSIONS_BETWEEN",0,l,"SESSION_BY_ID",0,r,"SESSION_FAMILIES",0,_,"STAFF_OPTIONS",0,"select id, display_name from staff_member where status = 'active' and deleted_at is null order by display_name","TODAY_COUNTS",0,s,"UPCOMING_TRIALS",0,o])}]);