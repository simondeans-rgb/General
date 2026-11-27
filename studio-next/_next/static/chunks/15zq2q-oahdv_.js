(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,95227,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(22016),n=e.i(72520),i=e.i(77326),l=e.i(13927),d=e.i(17658),c=e.i(21011),r=e.i(18086),o=e.i(50293),m=e.i(75379),_=e.i(45060),u=e.i(90514);function h(){let[e,a]=t.useMemo(()=>(0,m.dayRange)(0),[]),n=(0,l.useRows)(["sessions",e],c.SESSIONS_BETWEEN,[e,a]),r=(0,l.useRow)(["term-now"],c.TERM_NOW).data,o=(n.data??[]).filter(e=>"cancelled"!==e.status).find(e=>new Date(e.ends_at)>new Date)??null;return(0,s.jsx)(i.Shell,{title:"Today",allow:["owner","admin"],subtitle:(0,s.jsxs)("span",{className:"flex flex-wrap items-center gap-x-2",children:[(0,m.dateLong)(new Date),r&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("span",{"aria-hidden":!0,className:"hidden sm:inline",children:"·"}),(0,s.jsxs)("span",{children:[r.name,", week ",r.week," of ",r.weeks]}),(0,s.jsx)(d.Beats,{value:r.week,max:r.weeks,size:"sm",label:`Week ${r.week} of ${r.weeks}`,className:"hidden sm:inline-flex"})]})]}),children:(0,s.jsxs)("div",{className:"mx-auto grid max-w-[1240px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",children:[(0,s.jsx)("div",{className:"min-w-0 lg:col-start-1 lg:row-start-1",children:(0,s.jsx)(p,{s:o,loading:n.isLoading})}),(0,s.jsxs)("div",{className:"min-w-0 space-y-10 lg:col-start-2 lg:row-span-2 lg:row-start-1",children:[(0,s.jsx)(f,{}),(0,s.jsx)(g,{})]}),(0,s.jsx)("div",{className:"min-w-0 lg:col-start-1 lg:row-start-2",children:(0,s.jsx)(x,{rows:n.data,loading:n.isLoading,error:n.error,retry:()=>n.refetch()})}),(0,s.jsxs)("div",{className:"grid gap-x-12 gap-y-8 border-t border-line pt-8 md:grid-cols-3 lg:col-span-2 lg:row-start-3",children:[(0,s.jsx)(N,{}),(0,s.jsx)(y,{}),(0,s.jsx)(w,{})]})]})})}function p({s:e,loading:t}){if(t)return(0,s.jsx)(d.Skeleton,{className:"h-36"});if(!e)return(0,s.jsxs)("div",{children:[(0,s.jsx)("p",{className:"label",children:"Next"}),(0,s.jsx)("p",{className:"mt-2 font-display text-[1.75rem] leading-tight",children:"No more classes today"}),(0,s.jsx)("p",{className:"mt-1 text-ink-3",children:"Tomorrow’s timetable is on the schedule."})]});let n=Math.round((new Date(e.starts_at).getTime()-Date.now())/6e4),i=n>0?n<90?`in ${n} min`:`at ${(0,m.time)(e.starts_at)}`:"on now";return(0,s.jsxs)("section",{"aria-labelledby":"next-h",className:"flex flex-col gap-x-8 gap-y-3 sm:flex-row sm:items-end",children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)("p",{className:"label text-accent-text",children:["Next · ",i]}),(0,s.jsx)("p",{id:"next-h",className:"display-xl mt-1 text-[length:min(4.5rem,22vw)] text-ink sm:text-[length:min(5.5rem,22vw)]",children:(0,m.time)(e.starts_at)})]}),(0,s.jsxs)("div",{className:"min-w-0 flex-1 sm:pb-1.5",children:[(0,s.jsx)("p",{className:"font-display text-[1.5rem] leading-tight",children:e.name}),(0,s.jsx)("p",{className:"mt-1 text-[0.875rem] text-ink-3",children:[e.teacher,e.room,e.location].filter(Boolean).join(" · ")}),(0,s.jsxs)("p",{className:"mt-1 flex items-center gap-2 text-[0.875rem] text-ink-2",children:[(0,s.jsx)(d.Beats,{value:e.enrolled,max:e.capacity,label:`${e.enrolled} of ${e.capacity} places`}),(0,s.jsxs)("span",{className:"tnum",children:[e.enrolled," of ",e.capacity,e.trials?` \xb7 ${e.trials} trial${1===e.trials?"":"s"}`:""]})]}),(0,s.jsxs)("div",{className:"mt-4 flex flex-wrap gap-2",children:[(0,s.jsx)(a.default,{href:`/teach/register/?session=${e.id}`,children:(0,s.jsx)(d.Button,{variant:"primary",tabIndex:-1,children:"Open register"})}),(0,s.jsx)(a.default,{href:"/schedule",children:(0,s.jsx)(d.Button,{tabIndex:-1,children:"Timetable"})})]})]})]})}function x({rows:e,loading:t,error:n,retry:i}){return(0,s.jsxs)("section",{children:[(0,s.jsx)(d.SectionHead,{title:e?`Today \xb7 ${e.length} class${1===e.length?"":"es"}`:"Today",meta:"Booked of capacity",href:"/schedule",link:"Full schedule"}),t&&(0,s.jsx)("div",{className:"space-y-3 pt-3",children:[0,1,2].map(e=>(0,s.jsx)(d.Skeleton,{className:"h-12"},e))}),null!=n&&(0,s.jsx)(d.ErrorState,{error:n,onRetry:i}),e?.length===0&&(0,s.jsx)(d.EmptyState,{title:"Nothing on today",body:"Enjoy the quiet. Tomorrow’s classes are on the schedule."}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:e?.map(e=>{let t="cancelled"===e.status;return(0,s.jsx)("li",{children:(0,s.jsxs)(a.default,{href:`/teach/register/?session=${e.id}`,className:"grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 py-3 hover:bg-surface-2/60 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto_3.5rem]",children:[(0,s.jsx)("span",{className:(0,_.cn)("font-display text-[1.1875rem] tnum",t&&"text-ink-3 line-through"),children:(0,m.time)(e.starts_at)}),(0,s.jsxs)("span",{className:"min-w-0",children:[(0,s.jsx)("span",{className:(0,_.cn)("block truncate font-semibold",t&&"text-ink-3"),children:e.name}),(0,s.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:t?(0,s.jsxs)("span",{className:"font-semibold uppercase tracking-wide text-critical",children:["Cancelled",e.cancel_reason?` \xb7 ${e.cancel_reason}`:""]}):[e.covered?`${e.teacher} (cover)`:e.teacher,e.room].filter(Boolean).join(" · ")})]}),!t&&(0,s.jsx)(d.Beats,{value:e.enrolled,max:e.capacity,label:`${e.enrolled} of ${e.capacity} places`,className:"hidden sm:inline-flex"}),(0,s.jsx)("span",{className:"tnum text-right text-[0.8438rem] text-ink-2",children:t?"":`${e.enrolled}/${e.capacity}`})]})},e.id)})})]})}function f(){let e=(0,l.useRow)(["att-pay"],c.ATTENTION_PAYMENTS),t=(0,l.useRows)(["att-cap"],c.ATTENTION_CAPACITY),i=(0,l.useRows)(["att-trials"],c.ATTENTION_TRIALS),o=(0,l.useRows)(["att-lapsed"],c.ATTENTION_LAPSED),h=(0,l.useRow)(["att-requests"],c.ATTENTION_REQUESTS),p=(0,l.useRow)(["att-messages"],c.ATTENTION_MESSAGES),x=(0,l.useRows)(["att-checks"],r.CHECK_GAPS_TODAY),f=x.isLoading||e.isLoading||t.isLoading||i.isLoading||o.isLoading||h.isLoading||p.isLoading,g=[],j=h.data;if(j&&j.medical_updates>0&&g.push({key:"med",n:j.medical_updates,tone:"critical",href:"/requests",action:"Review",headline:`Medical update${1===j.medical_updates?"":"s"} to acknowledge`,detail:"Teachers see the change once you record it"}),x.data?.length&&g.push({key:"checks",n:x.data.length,tone:"critical",href:"/safeguarding",action:"See who",headline:"Staff checks to sort",detail:x.data.slice(0,2).map(e=>`${e.name}: ${e.issue}`).join(" · ")+(x.data.length>2?"…":"")}),e.data&&e.data.failed>0&&g.push({key:"pay",n:e.data.failed,tone:"critical",href:"/billing",action:(0,u.cardPaymentsEnabled)()?"Retry":"See invoices",headline:`Card payment${1===e.data.failed?"":"s"} failed`,detail:`${(0,m.money)(e.data.failed_minor)} declined`}),p.data&&p.data.awaiting>0&&g.push({key:"msg",n:p.data.awaiting,tone:"ink",href:"/inbox",action:"Reply",headline:`Famil${1===p.data.awaiting?"y":"ies"} waiting for a reply`,detail:(p.data.names??"")+(p.data.awaiting>3?"…":"")}),j&&(j.open_requests>0||j.pending_entries>0)&&g.push({key:"req",n:j.open_requests+j.pending_entries,tone:"ink",href:"/requests",action:"Open",headline:"Requests to answer",detail:[j.pending_entries?`${j.pending_entries} event entr${1===j.pending_entries?"y":"ies"}`:"",j.open_requests?`${j.open_requests} question${1===j.open_requests?"":"s"}`:""].filter(Boolean).join(" · ")}),i.data?.length&&g.push({key:"trial",n:i.data.length,tone:"ink",href:"/enrolment",action:"Follow up",headline:"Trials attended, not enrolled",detail:i.data.slice(0,3).map(e=>e.child_name).join(", ")+(i.data.length>3?"…":"")}),t.data?.filter(e=>e.waiting>0).forEach(e=>g.push({key:e.id,n:e.waiting,tone:"caution",href:"/classes",action:"Waiting list",headline:`Waiting for ${e.name}`,detail:`Class full \xb7 ${e.enrolled} of ${e.capacity}`})),o.data?.length){let e=new Set(o.data.map(e=>e.id)).size;g.push({key:"lapsed",n:e,tone:"caution",href:"/people?filter=lapsed",action:"See who",headline:"Missed three classes in a row",detail:o.data.slice(0,3).map(e=>`${e.first_name} ${e.last_name}`).join(", ")+(e>3?"…":"")})}return(0,s.jsxs)("section",{children:[(0,s.jsx)(d.SectionHead,{title:"Needs attention",meta:f?void 0:g.length?`${g.length} thing${1===g.length?"":"s"}`:void 0}),f&&(0,s.jsx)("div",{className:"space-y-3 pt-3",children:[0,1,2].map(e=>(0,s.jsx)(d.Skeleton,{className:"h-12"},e))}),!f&&0===g.length&&(0,s.jsx)(d.EmptyState,{title:"Nothing needs you",body:"No failed payments, no one waiting for a reply, and everyone is turning up."}),(0,s.jsx)("ul",{className:"on-count divide-y divide-line",children:g.map(e=>(0,s.jsx)("li",{children:(0,s.jsxs)(a.default,{href:e.href,className:"group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3",children:[(0,s.jsx)("span",{className:(0,_.cn)("font-display text-[1.75rem] leading-none tnum","critical"===e.tone?"text-critical":"caution"===e.tone?"text-caution":"text-ink"),children:e.n}),(0,s.jsxs)("span",{className:"min-w-0",children:[(0,s.jsxs)("span",{className:"block font-semibold leading-snug",children:[e.headline,"critical"===e.tone&&(0,s.jsx)("span",{className:"sr-only",children:" (urgent)"})]}),e.detail&&(0,s.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:e.detail})]}),(0,s.jsxs)("span",{className:"flex items-center gap-1 text-[0.8125rem] font-semibold text-accent-text group-hover:underline",children:[e.action,(0,s.jsx)(n.ArrowRight,{className:"size-3.5","aria-hidden":!0})]})]})},e.key))})]})}function g(){let e=(0,l.useRow)(["billing-summary"],o.SUMMARY).data;return(0,s.jsxs)("section",{children:[(0,s.jsx)(d.SectionHead,{title:"Money",href:"/billing",link:"Billing"}),e?(0,s.jsxs)("dl",{className:"grid grid-cols-2 gap-6 pt-3",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("dt",{className:"label",children:"Outstanding"}),(0,s.jsx)("dd",{className:"stat-number mt-1 text-[1.875rem] leading-none",children:(0,m.money)(e.outstanding_minor)}),(0,s.jsxs)("dd",{className:"mt-1 text-[0.8125rem] text-ink-3",children:[e.owing_families," famil",1===e.owing_families?"y":"ies",Number(e.overdue_minor)>0?` \xb7 ${(0,m.money)(e.overdue_minor)} overdue`:""]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("dt",{className:"label",children:"Collected, 30 days"}),(0,s.jsx)("dd",{className:"stat-number mt-1 text-[1.875rem] leading-none",children:(0,m.money)(e.collected_30d_minor)}),(0,s.jsx)("dd",{className:"mt-1 text-[0.8125rem] text-ink-3",children:"Card, transfer and cash"})]})]}):(0,s.jsx)(d.Skeleton,{className:"mt-3 h-16"})]})}function j({title:e,rows:t,empty:n,render:i,href:l,link:c}){return(0,s.jsxs)("section",{className:"min-w-0",children:[(0,s.jsxs)("div",{className:"mb-1 flex items-baseline gap-3",children:[(0,s.jsx)("h2",{className:"section-title flex-1",children:e}),l&&(0,s.jsx)(a.default,{href:l,className:"text-[0.8125rem] font-semibold text-accent-text hover:underline",children:c})]}),t.isLoading&&(0,s.jsx)(d.Skeleton,{className:"mt-2 h-20"}),t.data?.length===0&&(0,s.jsx)("p",{className:"py-3 text-sm text-ink-3",children:n}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:t.data?.slice(0,4).map((e,t)=>(0,s.jsx)("li",{className:"py-2.5",children:i(e)},t))})]})}function N(){let e=(0,l.useRows)(["recent-enrolments"],c.RECENT_ENROLMENTS);return(0,s.jsx)(j,{title:"New in class",rows:e,empty:"No new enrolments yet.",render:e=>(0,s.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,s.jsxs)("span",{className:"min-w-0",children:[(0,s.jsxs)("span",{className:"font-medium",children:[e.first_name," ",e.last_name]}),(0,s.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:e.class_name})]}),(0,s.jsx)("span",{className:"shrink-0 text-[0.7812rem] text-ink-3",children:(0,m.relativeDay)(e.started_on)})]})})}function y(){let e=(0,l.useRows)(["upcoming-trials"],c.UPCOMING_TRIALS);return(0,s.jsx)(j,{title:"Trials coming up",rows:e,href:"/enrolment",link:"Enrolment",empty:"No trials booked.",render:e=>(0,s.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,s.jsxs)("span",{className:"min-w-0",children:[(0,s.jsx)("span",{className:"font-medium",children:e.who}),(0,s.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:e.class_name})]}),(0,s.jsx)("span",{className:"shrink-0 text-[0.7812rem] text-ink-3",children:e.starts_at?`${(0,m.relativeDay)(e.starts_at)} ${(0,m.time)(e.starts_at)}`:"Not booked"})]})})}function w(){let e=(0,l.useRows)(["recent-messages"],c.RECENT_MESSAGES);return(0,s.jsx)(j,{title:"Recent messages",rows:e,href:"/inbox",link:"Messages",empty:"No messages yet.",render:e=>(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,s.jsx)("span",{className:"min-w-0 truncate font-medium",children:e.subject||e.body}),(0,s.jsx)("span",{className:"shrink-0 text-[0.7812rem] text-ink-3",children:(0,m.relativeDay)(e.sent_at)})]}),(0,s.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:"direct"===e.kind?e.family_name:"class_broadcast"===e.kind?e.class_name:"Everyone"})]})})}e.s(["default",0,function(){return(0,s.jsx)(h,{})}],95227)},48848,e=>{e.v(s=>Promise.all(["static/chunks/3dix2i414jv7b.js"].map(s=>e.l(s))).then(()=>s(39726)))},56166,e=>{e.v(s=>Promise.all(["static/chunks/13ze2qin-jud_.js"].map(s=>e.l(s))).then(()=>s(52715)))},21011,e=>{"use strict";let s=`
select
  (select count(*)::int from payment p
    where p.deleted_at is null and p.failure_code is not null and p.succeeded_at is null
      and exists (select 1 from invoice i where i.id = p.invoice_id and i.status in ('issued','part_paid'))) as failed,
  -- What the declined cards were for, as Billing shows it (UR-54, admins D11).
  (select coalesce(sum(p.amount_minor), 0)::bigint from payment p
    where p.deleted_at is null and p.failure_code is not null and p.succeeded_at is null
      and exists (select 1 from invoice i where i.id = p.invoice_id and i.status in ('issued','part_paid'))) as failed_minor,
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
 order by waiting desc, pct desc`,a=`
select e.id, e.contact_name, e.child_name, e.next_action_on,
       c.name as class_name
  from enquiry e
  left join class c on c.id = e.interest_class_id
 where e.deleted_at is null and e.stage in ('trial_attended','follow_up')
 order by e.next_action_on nulls last`,n=`
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
 order by s.last_name, s.first_name`,i=`
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
 order by cs.starts_at, c.name`,l=i.replace("and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz","and cs.id = $1"),d=`
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
    where deleted_at is null and status = 'open' and kind = 'medical_update') as medical_updates`,_=`select r.id, l.name || ' \xb7 ' || r.name as name from room r join location l on l.id = r.location_id
  where r.deleted_at is null order by l.name, r.name`,u=`
select count(distinct st.family_id)::int as n from enrolment e join student st on st.id = e.student_id
 where e.class_id = (select class_id from class_session where id = $1) and e.status = 'active' and e.deleted_at is null`,h=`
select t.name, (current_date - t.starts_on) / 7 + 1 as week, (t.ends_on - t.starts_on) / 7 + 1 as weeks
  from term t where t.deleted_at is null and current_date between t.starts_on and t.ends_on
 order by t.starts_on desc limit 1`;e.s(["ATTENTION_CAPACITY",0,t,"ATTENTION_LAPSED",0,n,"ATTENTION_MESSAGES",0,o,"ATTENTION_PAYMENTS",0,s,"ATTENTION_REQUESTS",0,m,"ATTENTION_TRIALS",0,a,"CANCEL_SESSION",0,"select app.cancel_session($1, $2, $3, $4)","COVER_CLASHES",0,"select session_id, class_name, starts_at, ends_at, location, needs_travel from app.cover_clashes($1, $2)","COVER_SESSION",0,"select app.cover_session($1, $2, $3, $4, $5, $6)","MOVE_SESSION",0,"select app.move_session($1, $2::timestamptz, $3, $4, $5)","RECENT_ENROLMENTS",0,d,"RECENT_MESSAGES",0,r,"ROOM_OPTIONS",0,_,"SESSIONS_BETWEEN",0,i,"SESSION_BY_ID",0,l,"SESSION_FAMILIES",0,u,"SESSION_HANDOVER",0,"select handover_note from class_session where id = $1","STAFF_OPTIONS",0,"select id, display_name from staff_member where status = 'active' and deleted_at is null order by display_name","TERM_NOW",0,h,"UPCOMING_TRIALS",0,c])}]);