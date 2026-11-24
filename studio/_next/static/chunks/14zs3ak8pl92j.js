(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,17068,e=>{"use strict";let s=(0,e.i(75254).default)("calendar-x-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]]);e.s(["CalendarX2",0,s],17068)},63059,e=>{"use strict";let s=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,s],63059)},46897,e=>{"use strict";let s=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,s],46897)},84614,e=>{"use strict";let s=(0,e.i(75254).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,s],84614)},95227,e=>{"use strict";var s=e.i(43476),a=e.i(71645),t=e.i(22016),n=e.i(61659),i=e.i(61911),l=e.i(79002);let d=(0,e.i(75254).default)("trending-down",[["path",{d:"M16 17h6v-6",key:"t6n2it"}],["path",{d:"m22 17-8.5-8.5-5 5L2 7",key:"x473p"}]]);var c=e.i(63059),r=e.i(17068),o=e.i(32102),m=e.i(86311),u=e.i(77326),p=e.i(13927),h=e.i(31502),_=e.i(17658),x=e.i(21011),f=e.i(75379),j=e.i(47741);function g(){let{session:e}=(0,h.useSession)(),[n,i]=a.useMemo(()=>(0,f.dayRange)(0),[]),l=(0,p.useRow)(["today-counts"],x.TODAY_COUNTS),d=(0,p.useRows)(["sessions",n],x.SESSIONS_BETWEEN,[n,i]),c=e?.name.split(" ")[0]??"";return(0,s.jsx)(u.Shell,{title:`${(0,f.greeting)()}, ${c}`,subtitle:(0,f.dateLong)(new Date),allow:["owner","admin"],children:(0,s.jsxs)("div",{className:"mx-auto max-w-6xl space-y-5",children:[(0,s.jsx)(N,{counts:l.data,loading:l.isLoading}),(0,s.jsx)(y,{}),(0,s.jsxs)("div",{className:"grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]",children:[(0,s.jsxs)(_.Card,{children:[(0,s.jsx)(_.CardHeader,{title:"Today's timetable",action:(0,s.jsx)(t.default,{href:"/schedule",className:"text-[13px] font-medium text-accent hover:underline",children:"Full schedule"})}),d.isLoading&&(0,s.jsx)("div",{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,s.jsx)(_.Skeleton,{className:"h-14"},e))}),d.error&&(0,s.jsx)("div",{className:"p-4",children:(0,s.jsx)(_.ErrorState,{error:d.error,onRetry:()=>d.refetch()})}),d.data&&0===d.data.length&&(0,s.jsx)(_.EmptyState,{icon:(0,s.jsx)(r.CalendarX2,{className:"size-5"}),title:"Nothing scheduled today",body:"Enjoy the quiet. Tomorrow's classes are on the schedule."}),d.data&&d.data.length>0&&(0,s.jsx)("ul",{className:"divide-y divide-line",children:d.data.map(e=>(0,s.jsx)("li",{children:(0,s.jsx)(j.SessionRow,{session:e})},e.id))})]}),(0,s.jsxs)("div",{className:"space-y-5",children:[(0,s.jsx)(v,{}),(0,s.jsx)(k,{}),(0,s.jsx)(T,{})]})]})]})})}function N({counts:e,loading:a}){if(a)return(0,s.jsx)("div",{className:"grid grid-cols-2 gap-3 sm:grid-cols-4",children:[0,1,2,3].map(e=>(0,s.jsxs)(_.Card,{className:"p-4",children:[(0,s.jsx)(_.Skeleton,{className:"h-7 w-12"}),(0,s.jsx)(_.Skeleton,{className:"mt-2 h-3 w-20"})]},e))});if(!e)return null;let t=[[e.classes,1===e.classes?"class":"classes"],[e.students_expected,"students expected"],[e.trials,1===e.trials?"trial":"trials"]];return e.cancelled>0?t.push([e.cancelled,1===e.cancelled?"class cancelled":"classes cancelled","critical"]):e.covered>0&&t.push([e.covered,1===e.covered?"class covered":"classes covered","caution"]),(0,s.jsx)("div",{className:"grid grid-cols-2 gap-3 sm:grid-cols-4",children:t.map(([e,a,t],n)=>(0,s.jsxs)(_.Card,{className:"p-4",children:[(0,s.jsx)("p",{className:`tnum text-[26px] font-semibold leading-none tracking-[-0.02em] ${"critical"===t?"text-critical":"caution"===t?"text-caution":""}`,children:e}),(0,s.jsx)("p",{className:"mt-1.5 text-[13px] text-ink-2",children:a})]},n))})}function y(){let e=(0,p.useRow)(["att-pay"],x.ATTENTION_PAYMENTS),a=(0,p.useRows)(["att-cap"],x.ATTENTION_CAPACITY),t=(0,p.useRows)(["att-trials"],x.ATTENTION_TRIALS),c=(0,p.useRows)(["att-lapsed"],x.ATTENTION_LAPSED),r=(0,p.useRow)(["att-requests"],x.ATTENTION_REQUESTS),u=(0,p.useRow)(["att-messages"],x.ATTENTION_MESSAGES);if(e.isLoading||a.isLoading||t.isLoading||c.isLoading||r.isLoading||u.isLoading)return(0,s.jsxs)(_.Card,{className:"p-4",children:[(0,s.jsx)(_.Skeleton,{className:"h-5 w-40"}),(0,s.jsx)(_.Skeleton,{className:"mt-3 h-16"})]});let h=[];if(r.data&&(r.data.open_requests>0||r.data.pending_entries>0)){let e=[r.data.pending_entries>0?`${r.data.pending_entries} event ${1===r.data.pending_entries?"entry":"entries"} to confirm`:null,r.data.open_requests>0?`${r.data.open_requests} question${1===r.data.open_requests?"":"s"} unanswered`:null].filter(Boolean);h.push((0,s.jsx)(w,{href:"/requests",tone:r.data.medical_updates>0?"critical":"info",icon:(0,s.jsx)(o.Inbox,{className:"size-4"}),headline:r.data.medical_updates>0?`${r.data.medical_updates} medical update${1===r.data.medical_updates?"":"s"} to record`:"Families are waiting on you",detail:e.join(" · ")},"reqs"))}if(u.data&&u.data.awaiting>0&&h.push((0,s.jsx)(w,{href:"/inbox",tone:"info",icon:(0,s.jsx)(m.MessageSquare,{className:"size-4"}),headline:`${u.data.awaiting} famil${1===u.data.awaiting?"y is":"ies are"} waiting for a reply`,detail:(u.data.names??"")+(u.data.awaiting>3?"…":"")},"msgs")),e.data&&(e.data.failed>0||Number(e.data.outstanding_minor)>0)&&h.push((0,s.jsx)(w,{href:"/billing",tone:"critical",icon:(0,s.jsx)(n.CreditCard,{className:"size-4"}),headline:e.data.failed>0?`${e.data.failed} failed payment${1===e.data.failed?"":"s"}`:`${e.data.unpaid_invoices} unpaid invoices`,detail:`${(0,f.money)(e.data.outstanding_minor)} outstanding across ${e.data.unpaid_invoices} invoice${1===e.data.unpaid_invoices?"":"s"}`},"pay")),a.data?.forEach(e=>h.push((0,s.jsx)(w,{href:"/classes",tone:e.waiting>0?"caution":"neutral",icon:(0,s.jsx)(i.Users,{className:"size-4"}),headline:e.name,detail:`${e.pct}% full \xb7 ${e.enrolled}/${e.capacity}${e.waiting>0?` \xb7 ${e.waiting} waiting`:""}`},e.id))),t.data&&t.data.length>0&&h.push((0,s.jsx)(w,{href:"/enrolment",tone:"info",icon:(0,s.jsx)(l.UserPlus,{className:"size-4"}),headline:`${t.data.length} trial${1===t.data.length?"":"s"} attended, not yet enrolled`,detail:t.data.slice(0,3).map(e=>e.child_name).join(", ")+(t.data.length>3?"…":"")},"trials")),c.data&&c.data.length>0){let e=new Set(c.data.map(e=>e.id));h.push((0,s.jsx)(w,{href:"/people?filter=lapsed",tone:"caution",icon:(0,s.jsx)(d,{className:"size-4"}),headline:`${e.size} student${1===e.size?"":"s"} missed three classes in a row`,detail:c.data.slice(0,3).map(e=>`${e.first_name} ${e.last_name}`).join(", ")+(c.data.length>3?"…":"")},"lapsed"))}return(0,s.jsxs)(_.Card,{children:[(0,s.jsx)(_.CardHeader,{title:"Needs attention",subtitle:0===h.length?void 0:`${h.length} thing${1===h.length?"":"s"} to look at`}),0===h.length?(0,s.jsx)(_.EmptyState,{title:"Nothing needs you right now",body:"No failed payments, no full classes with people waiting, and everyone is turning up."}):(0,s.jsx)("ul",{className:"divide-y divide-line",children:h.map((e,a)=>(0,s.jsx)("li",{children:e},a))})]})}function w({href:e,tone:a,icon:n,headline:i,detail:l}){return(0,s.jsxs)(t.default,{href:e,className:"flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2",children:[(0,s.jsx)("span",{className:`grid size-8 shrink-0 place-items-center rounded-full ${{critical:"bg-critical-soft text-critical",caution:"bg-caution-soft text-caution",info:"bg-info-soft text-info",neutral:"bg-surface-2 text-ink-2"}[a]}`,"aria-hidden":!0,children:n}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsx)("span",{className:"block truncate font-medium",children:i}),(0,s.jsx)("span",{className:"block truncate text-[13px] text-ink-2",children:l})]}),(0,s.jsx)(c.ChevronRight,{className:"size-4 shrink-0 text-ink-3","aria-hidden":!0})]})}function b({title:e,rows:a,empty:n,render:i,href:l,linkLabel:d}){return(0,s.jsxs)(_.Card,{children:[(0,s.jsx)(_.CardHeader,{title:e,action:l&&(0,s.jsx)(t.default,{href:l,className:"text-[13px] font-medium text-accent hover:underline",children:d})}),a.isLoading&&(0,s.jsx)("div",{className:"space-y-2.5 p-4",children:[0,1,2].map(e=>(0,s.jsx)(_.Skeleton,{className:"h-8"},e))}),a.error&&(0,s.jsx)("div",{className:"p-4",children:(0,s.jsx)(_.ErrorState,{error:a.error})}),a.data&&0===a.data.length&&(0,s.jsx)("p",{className:"px-4 py-6 text-center text-sm text-ink-3",children:n}),a.data&&a.data.length>0&&(0,s.jsx)("ul",{className:"divide-y divide-line",children:a.data.map((e,a)=>(0,s.jsx)("li",{className:"px-4 py-2.5",children:i(e)},a))})]})}function v(){let e=(0,p.useRows)(["recent-enrolments"],x.RECENT_ENROLMENTS);return(0,s.jsx)(b,{title:"Recent enrolments",rows:e,empty:"No new enrolments yet.",render:e=>(0,s.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,s.jsxs)("span",{className:"min-w-0",children:[(0,s.jsxs)("span",{className:"font-medium",children:[e.first_name," ",e.last_name]}),(0,s.jsx)("span",{className:"block truncate text-[13px] text-ink-2",children:e.class_name})]}),(0,s.jsx)("span",{className:"shrink-0 text-[12.5px] text-ink-3",children:(0,f.relativeDay)(e.started_on)})]})})}function k(){let e=(0,p.useRows)(["upcoming-trials"],x.UPCOMING_TRIALS);return(0,s.jsx)(b,{title:"Upcoming trials",rows:e,href:"/enrolment",linkLabel:"Pipeline",empty:"No trials booked.",render:e=>(0,s.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,s.jsxs)("span",{className:"min-w-0",children:[(0,s.jsx)("span",{className:"font-medium",children:e.who}),(0,s.jsx)("span",{className:"block truncate text-[13px] text-ink-2",children:e.class_name})]}),(0,s.jsx)("span",{className:"shrink-0 text-[12.5px] text-ink-3",children:e.starts_at?`${(0,f.relativeDay)(e.starts_at)} ${(0,f.time)(e.starts_at)}`:"Not booked"})]})})}function T(){let e=(0,p.useRows)(["recent-messages"],x.RECENT_MESSAGES);return(0,s.jsx)(b,{title:"Recent messages",rows:e,empty:"No messages yet.",render:e=>(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,s.jsx)("span",{className:"min-w-0 truncate font-medium",children:e.subject||e.body}),(0,s.jsx)("span",{className:"shrink-0 text-[12.5px] text-ink-3",children:(0,f.relativeDay)(e.sent_at)})]}),(0,s.jsx)("span",{className:"block truncate text-[13px] text-ink-2",children:"direct"===e.kind?e.family_name:"class_broadcast"===e.kind?e.class_name:"Everyone"})]})})}e.s(["default",0,function(){return(0,s.jsx)(g,{})}],95227)},47741,e=>{"use strict";var s=e.i(43476),a=e.i(22016),t=e.i(46897),n=e.i(84614),i=e.i(61911),l=e.i(17658),d=e.i(75379),c=e.i(45060);let r={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"},o={violet:"bg-violet",amber:"bg-amber",teal:"bg-teal",rose:"bg-rose",indigo:"bg-indigo",lime:"bg-lime"};e.s(["SessionRow",0,function({session:e,href:m}){let u="cancelled"===e.status,p=e.enrolled>=e.capacity,h=(0,s.jsxs)("div",{className:(0,c.cn)("flex items-stretch gap-3 px-4 py-3",u&&"opacity-60"),children:[(0,s.jsx)("span",{"aria-hidden":!0,className:(0,c.cn)("w-1 shrink-0 rounded-full",o[e.colour??""]??"bg-surface-3")}),(0,s.jsxs)("span",{className:"w-[52px] shrink-0 pt-0.5",children:[(0,s.jsx)("span",{className:(0,c.cn)("tnum block text-sm font-semibold",u&&"line-through"),children:(0,d.time)(e.starts_at)}),(0,s.jsx)("span",{className:"tnum block text-[12px] text-ink-3",children:(0,d.time)(e.ends_at)})]}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("span",{className:"flex flex-wrap items-center gap-x-2 gap-y-1",children:[(0,s.jsx)("span",{className:(0,c.cn)("font-medium",u&&"line-through"),children:e.name}),e.style&&(0,s.jsx)(l.Badge,{tone:r[e.colour??""]??"neutral",children:e.style}),u&&(0,s.jsx)(l.Badge,{tone:"critical",children:"Cancelled"}),!u&&e.trials>0&&(0,s.jsxs)(l.Badge,{tone:"info",children:[e.trials," trial",1===e.trials?"":"s"]})]}),(0,s.jsxs)("span",{className:"mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-ink-2",children:[e.teacher&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,s.jsx)(n.User,{className:"size-3.5","aria-hidden":!0}),e.teacher]}),e.room&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,s.jsx)(t.MapPin,{className:"size-3.5","aria-hidden":!0}),e.room]}),(0,s.jsxs)("span",{className:(0,c.cn)("inline-flex items-center gap-1",p&&"font-medium text-caution"),children:[(0,s.jsx)(i.Users,{className:"size-3.5","aria-hidden":!0}),e.enrolled,"/",e.capacity,p?" · full":""]})]})]})]});return m?(0,s.jsx)(a.default,{href:m,className:"block transition-colors hover:bg-surface-2",children:h}):h}])},21011,e=>{"use strict";let s=`
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
from todays`,a=`
select
  (select count(*)::int from payment
    where deleted_at is null and failure_code is not null and succeeded_at is null) as failed,
  (select coalesce(sum(total_minor - paid_minor), 0)::bigint from invoice
    where deleted_at is null and status in ('issued','part_paid')) as outstanding_minor,
  (select count(*)::int from invoice
    where deleted_at is null and status in ('issued','part_paid')) as unpaid_invoices`,t=`
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
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials
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
 order by cs.starts_at, c.name`,d=`
select e.id, e.started_on, s.first_name, s.last_name, c.name as class_name
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where e.deleted_at is null and e.status = 'active'
 order by e.started_on desc, e.created_at desc
 limit 6`,c=`
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
 limit 6`,r=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at,
       f.name as family_name, c.name as class_name
  from communication cm
  left join family f on f.id = cm.family_id
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
 order by cm.sent_at desc
 limit 5`,o=`
select count(*)::int as awaiting,
       string_agg(name, ', ' order by last_at) filter (where rn <= 3) as names
  from (select f.name, last.sent_at as last_at, row_number() over (order by last.sent_at) rn
          from family f
          join lateral (select inbound, sent_at from communication c
                         where c.family_id = f.id and c.kind = 'direct' and c.deleted_at is null
                         order by c.sent_at desc limit 1) last on last.inbound
         where f.deleted_at is null) t`,m=`
select
  (select count(*)::int from studio_request
    where deleted_at is null and status in ('open','in_progress')) as open_requests,
  (select count(*)::int from event_participant
    where deleted_at is null and status = 'requested') as pending_entries,
  (select count(*)::int from studio_request
    where deleted_at is null and status = 'open' and kind = 'medical_update') as medical_updates`;e.s(["ATTENTION_CAPACITY",0,t,"ATTENTION_LAPSED",0,i,"ATTENTION_MESSAGES",0,o,"ATTENTION_PAYMENTS",0,a,"ATTENTION_REQUESTS",0,m,"ATTENTION_TRIALS",0,n,"RECENT_ENROLMENTS",0,d,"RECENT_MESSAGES",0,r,"SESSIONS_BETWEEN",0,l,"TODAY_COUNTS",0,s,"UPCOMING_TRIALS",0,c])}]);