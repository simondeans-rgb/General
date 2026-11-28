(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,72520,e=>{"use strict";let i=(0,e.i(75254).default)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);e.s(["ArrowRight",0,i],72520)},95227,e=>{"use strict";var i=e.i(43476),t=e.i(71645),a=e.i(22016),n=e.i(72520),s=e.i(77326),d=e.i(13927),l=e.i(17658),r=e.i(21011),o=e.i(18086),c=e.i(50293),m=e.i(75379),_=e.i(45060),u=e.i(90514),f=e.i(886);let p={ready:"ready to join",other_class:"better in another class",not_ready:"not ready yet"};function h(){let[e,a]=t.useMemo(()=>(0,m.dayRange)(0),[]),n=(0,d.useRows)(["sessions",e],r.SESSIONS_BETWEEN,[e,a]),o=(0,d.useRow)(["term-now"],r.TERM_NOW).data,c=(n.data??[]).filter(e=>"cancelled"!==e.status).find(e=>new Date(e.ends_at)>new Date)??null;return(0,i.jsx)(s.Shell,{title:"Today",allow:["owner","admin"],subtitle:(0,i.jsxs)("span",{className:"flex flex-wrap items-center gap-x-2",children:[(0,m.dateLong)(new Date),o&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("span",{"aria-hidden":!0,className:"hidden sm:inline",children:"·"}),(0,i.jsxs)("span",{children:[o.name,", week ",o.week," of ",o.weeks]}),(0,i.jsx)(l.Beats,{value:o.week,max:o.weeks,size:"sm",label:`Week ${o.week} of ${o.weeks}`,className:"hidden sm:inline-flex"})]})]}),children:(0,i.jsxs)("div",{className:"mx-auto grid max-w-[1240px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",children:[(0,i.jsx)("div",{className:"min-w-0 lg:col-start-1 lg:row-start-1",children:(0,i.jsx)(y,{s:c,loading:n.isLoading})}),(0,i.jsxs)("div",{className:"min-w-0 space-y-10 lg:col-start-2 lg:row-span-2 lg:row-start-1",children:[(0,i.jsx)(w,{}),(0,i.jsx)(b,{})]}),(0,i.jsx)("div",{className:"min-w-0 lg:col-start-1 lg:row-start-2",children:(0,i.jsx)(g,{rows:n.data,loading:n.isLoading,error:n.error,retry:()=>n.refetch()})}),(0,i.jsxs)("div",{className:"grid gap-x-12 gap-y-8 border-t border-line pt-8 md:grid-cols-3 lg:col-span-2 lg:row-start-3",children:[(0,i.jsx)(N,{}),(0,i.jsx)(j,{}),(0,i.jsx)($,{})]})]})})}function y({s:e,loading:t}){if(t)return(0,i.jsx)(l.Skeleton,{className:"h-36"});if(!e)return(0,i.jsxs)("div",{children:[(0,i.jsx)("p",{className:"label",children:"Next"}),(0,i.jsx)("p",{className:"mt-2 font-display text-[1.75rem] leading-tight",children:"No more classes today"}),(0,i.jsx)("p",{className:"mt-1 text-ink-3",children:"Tomorrow’s timetable is on the schedule."})]});let n=Math.round((new Date(e.starts_at).getTime()-Date.now())/6e4),s=n>0?n<90?`in ${n} min`:`at ${(0,m.time)(e.starts_at)}`:"on now";return(0,i.jsxs)("section",{"aria-labelledby":"next-h",className:"flex flex-col gap-x-8 gap-y-3 sm:flex-row sm:items-end",children:[(0,i.jsxs)("div",{children:[(0,i.jsxs)("p",{className:"label text-accent-text",children:["Next · ",s]}),(0,i.jsx)("p",{id:"next-h",className:"display-xl mt-1 text-[length:min(4.5rem,22vw)] text-ink sm:text-[length:min(5.5rem,22vw)]",children:(0,m.time)(e.starts_at)})]}),(0,i.jsxs)("div",{className:"min-w-0 flex-1 sm:pb-1.5",children:[(0,i.jsx)("p",{className:"font-display text-[1.5rem] leading-tight",children:e.name}),(0,i.jsx)("p",{className:"mt-1 text-[0.875rem] text-ink-3",children:[e.teacher,e.room,e.location].filter(Boolean).join(" · ")}),(0,i.jsxs)("p",{className:"mt-1 flex items-center gap-2 text-[0.875rem] text-ink-2",children:[(0,i.jsx)(l.Beats,{value:e.enrolled,max:e.capacity,label:`${e.enrolled} of ${e.capacity} places`}),(0,i.jsxs)("span",{className:"tnum",children:[e.enrolled," of ",e.capacity,e.trials?` \xb7 ${e.trials} trial${1===e.trials?"":"s"}`:""]})]}),(0,i.jsxs)("div",{className:"mt-4 flex flex-wrap gap-2",children:[(0,i.jsx)(a.default,{href:`/teach/register/?session=${e.id}`,children:(0,i.jsx)(l.Button,{variant:"primary",tabIndex:-1,children:"Open register"})}),(0,i.jsx)(a.default,{href:"/schedule",children:(0,i.jsx)(l.Button,{tabIndex:-1,children:"Timetable"})})]})]})]})}function g({rows:e,loading:t,error:n,retry:s}){return(0,i.jsxs)("section",{children:[(0,i.jsx)(l.SectionHead,{title:e?`Today \xb7 ${e.length} class${1===e.length?"":"es"}`:"Today",meta:"Booked of capacity",href:"/schedule",link:"Full schedule"}),t&&(0,i.jsx)("div",{className:"space-y-3 pt-3",children:[0,1,2].map(e=>(0,i.jsx)(l.Skeleton,{className:"h-12"},e))}),null!=n&&(0,i.jsx)(l.ErrorState,{error:n,onRetry:s}),e?.length===0&&(0,i.jsx)(l.EmptyState,{title:"Nothing on today",body:"Enjoy the quiet. Tomorrow’s classes are on the schedule."}),(0,i.jsx)("ul",{className:"divide-y divide-line",children:e?.map(e=>{let t="cancelled"===e.status;return(0,i.jsx)("li",{children:(0,i.jsxs)(a.default,{href:`/teach/register/?session=${e.id}`,className:"grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 py-3 hover:bg-surface-2/60 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto_3.5rem]",children:[(0,i.jsx)("span",{className:(0,_.cn)("font-display text-[1.1875rem] tnum",t&&"text-ink-3 line-through"),children:(0,m.time)(e.starts_at)}),(0,i.jsxs)("span",{className:"min-w-0",children:[(0,i.jsx)("span",{className:(0,_.cn)("block truncate font-semibold",t&&"text-ink-3"),children:e.name}),(0,i.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:t?(0,i.jsxs)("span",{className:"font-semibold uppercase tracking-wide text-critical",children:["Cancelled",e.cancel_reason?` \xb7 ${e.cancel_reason}`:""]}):[e.covered?`${e.teacher} (cover)`:e.teacher,e.room].filter(Boolean).join(" · ")})]}),!t&&(0,i.jsx)(l.Beats,{value:e.enrolled,max:e.capacity,label:`${e.enrolled} of ${e.capacity} places`,className:"hidden sm:inline-flex"}),(0,i.jsx)("span",{className:"tnum text-right text-[0.8438rem] text-ink-2",children:t?"":`${e.enrolled}/${e.capacity}`})]})},e.id)})})]})}function w(){let e=(0,d.useRow)(["att-pay"],r.ATTENTION_PAYMENTS),s=(0,d.useRows)(["att-cap"],r.ATTENTION_CAPACITY),c=(0,d.useRows)(["att-trials"],r.ATTENTION_TRIALS),h=(0,d.useRows)(["att-lapsed"],r.ATTENTION_LAPSED),y=(0,d.useRow)(["att-requests"],r.ATTENTION_REQUESTS),g=(0,d.useRow)(["att-messages"],r.ATTENTION_MESSAGES),w=(0,d.useRows)(["att-follow-ups"],r.ATTENTION_FOLLOW_UPS),b=(0,d.useRows)(["att-checks"],o.CHECK_GAPS_TODAY),x=(0,d.useRows)(["att-registers"],r.ATTENTION_REGISTERS),N=(0,d.useRows)(["att-trial-feedback"],r.ATTENTION_TRIAL_FEEDBACK),j=(0,d.useRows)(["att-exam-fees"],r.ATTENTION_EXAM_FEES),$=(0,d.useRow)(["att-safeguarding"],o.SAFEGUARDING_TODAY),[v,E]=t.useState(!1),T=$.isLoading||x.isLoading||N.isLoading||j.isLoading||b.isLoading||e.isLoading||s.isLoading||c.isLoading||h.isLoading||y.isLoading||g.isLoading||w.isLoading,S=(e,i=3)=>e.slice(0,i).join(", ")+(e.length>i?"…":""),I=[],k=y.data;for(let e of(k&&k.medical_updates>0&&I.push({key:"med",n:k.medical_updates,when:"today",urgent:!0,href:"/requests",action:"Review",headline:`Medical update${1===k.medical_updates?"":"s"} to acknowledge`,detail:"Teachers see the change once you record it"}),x.data?.length&&I.push({key:"registers",n:x.data.length,when:"today",urgent:!0,href:`/teach/register/?session=${x.data[0].session_id}`,action:"Open",headline:`Register${1===x.data.length?"":"s"} not completed`,detail:x.data.slice(0,2).map(e=>`${e.class_name}, ${(0,m.relativeDay)(e.starts_at)}${e.teacher_name?` (${e.teacher_name})`:""}`).join(" · ")+(x.data.length>2?"…":"")}),j.data??[])){let i=e.unpaid+e.unbilled,t=new Date(e.exam_on).getTime()-Date.now()<1728e5;I.push({key:`exam-fees-${e.session_id}`,n:i,when:t?"today":"week",urgent:t,href:`/exams/register/?session=${e.session_id}`,action:"See who",headline:`Exam fee${1===i?"":"s"} unpaid: ${e.title}`,detail:`${(0,m.relativeDay)(e.exam_on)} \xb7 ${(0,m.money)(e.owed_minor)} owed${e.unbilled?` \xb7 ${e.unbilled} not billed yet`:""}`})}N.data?.length&&I.push({key:"trial-feedback",n:N.data.length,when:"today",href:"/enrolment",action:"Decide",headline:`Trial${1===N.data.length?"":"s"} to decide`,detail:N.data.slice(0,2).map(e=>`${e.child}, ${e.class_name}: ${p[e.recommendation??""]??"teacher’s comments in"}`).join(" · ")+(N.data.length>2?"…":"")}),$.data?.no_lead&&I.push({key:"dsl",n:1,when:"today",urgent:!0,href:"/safeguarding",action:"Name your lead",headline:"No safeguarding lead named",detail:"Concerns come only to the owner, and one about the owner reaches nobody"}),$.data&&$.data.media_links>0&&I.push({key:"media-links",n:$.data.media_links,when:"week",href:"/safeguarding",action:"See which",headline:`Link${1===$.data.media_links?"":"s"} to another site showing children`,detail:"Hidden from families. Upload the file instead"}),$.data&&$.data.holds_due>0&&I.push({key:"holds",n:$.data.holds_due,when:"week",href:"/safeguarding",action:"Review",headline:`Legal hold${1===$.data.holds_due?"":"s"} to review`,detail:"Keep a hold only while it is still needed"}),b.data?.length&&I.push({key:"checks",n:b.data.length,when:"today",urgent:!0,href:"/safeguarding",action:"See who",headline:"Staff checks to sort",detail:b.data.slice(0,2).map(e=>`${e.name}: ${e.issue}`).join(" · ")+(b.data.length>2?"…":"")}),(0,u.cardPaymentsEnabled)()&&e.data&&e.data.failed>0&&I.push({key:"pay",n:e.data.failed,when:"today",urgent:!0,href:"/billing",action:"Retry",headline:`Card payment${1===e.data.failed?"":"s"} failed`,detail:`${(0,m.money)(e.data.failed_minor)} declined`});let A=(w.data??[]).filter(e=>e.due_now),R=(w.data??[]).filter(e=>!e.due_now);if(A.length&&I.push({key:"follow-now",n:A.length,when:"today",href:"/enrolment",action:"Follow up",headline:`Enquir${1===A.length?"y":"ies"} to follow up`,detail:S(A.map(e=>e.child_name??e.contact_name))}),g.data&&g.data.awaiting>0&&I.push({key:"msg",n:g.data.awaiting,when:"today",href:"/inbox",action:"Reply",headline:`Famil${1===g.data.awaiting?"y":"ies"} waiting for a reply`,detail:(g.data.names??"")+(g.data.awaiting>3?"…":"")}),k&&(k.open_requests>0||k.pending_entries>0)&&I.push({key:"req",n:k.open_requests+k.pending_entries,when:"today",href:"/requests",action:"Open",headline:"Requests to answer",detail:[k.pending_entries?`${k.pending_entries} event entr${1===k.pending_entries?"y":"ies"}`:"",k.open_requests?`${k.open_requests} question${1===k.open_requests?"":"s"}`:""].filter(Boolean).join(" · ")}),R.length&&I.push({key:"follow-soon",n:R.length,when:"week",href:"/enrolment",action:"See who",headline:`Enquiry follow-up${1===R.length?"":"s"} later this week`,detail:R.slice(0,3).map(e=>`${e.child_name??e.contact_name} (${(0,m.relativeDay)(e.next_action_on)})`).join(", ")+(R.length>3?"…":"")}),c.data?.length&&I.push({key:"trial",n:c.data.length,when:"week",href:"/enrolment",action:"Follow up",headline:"Trials attended, not enrolled",detail:S(c.data.map(e=>e.child_name))}),s.data?.filter(e=>e.waiting>0).forEach(e=>I.push({key:e.id,n:e.waiting,when:"week",href:"/classes",action:"Waiting list",headline:`Waiting for ${e.name}`,detail:`Class full \xb7 ${e.enrolled} of ${e.capacity}`})),h.data?.length){let e=new Set(h.data.map(e=>e.id)).size;I.push({key:"lapsed",n:e,when:"week",href:"/people?filter=lapsed",action:"See who",headline:"Missed three classes in a row",detail:h.data.slice(0,3).map(e=>`${e.first_name} ${e.last_name}`).join(", ")+(e>3?"…":"")})}let O=(0,f.groupAttention)(I,5,v),L=I.some(e=>e.urgent),C=e=>(0,i.jsx)("li",{children:(0,i.jsxs)(a.default,{href:e.href,className:"group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-start gap-x-3 py-3",children:[(0,i.jsx)("span",{className:(0,_.cn)("font-display text-[1.75rem] leading-none tnum",e.urgent?"text-critical":"text-ink"),children:e.n}),(0,i.jsxs)("span",{className:"min-w-0",children:[(0,i.jsxs)("span",{className:"block font-semibold leading-snug",children:[e.headline,e.urgent&&(0,i.jsx)("span",{className:"sr-only",children:" (urgent)"})]}),e.detail&&(0,i.jsx)("span",{className:"line-clamp-2 text-[0.8125rem] text-ink-3",children:e.detail})]}),(0,i.jsxs)("span",{className:"flex items-center gap-1 pt-0.5 text-[0.8125rem] font-semibold text-accent-text group-hover:underline",children:[e.action,(0,i.jsx)(n.ArrowRight,{className:"size-3.5","aria-hidden":!0})]})]})},e.key),D=(e,t)=>t.length>0&&(0,i.jsxs)("div",{children:[(0,i.jsx)("h3",{className:"label pt-3",children:e}),(0,i.jsx)("ul",{className:"on-count divide-y divide-line",children:t.map(C)})]});return(0,i.jsxs)("section",{children:[(0,i.jsx)(l.SectionHead,{title:"Needs attention",meta:T?void 0:I.length?`${I.length} thing${1===I.length?"":"s"}`:void 0}),T&&(0,i.jsx)("div",{className:"space-y-3 pt-3",children:[0,1,2].map(e=>(0,i.jsx)(l.Skeleton,{className:"h-12"},e))}),!T&&0===I.length&&(0,i.jsx)(l.EmptyState,{title:"Nothing needs you",body:"No one waiting for a reply, no follow-ups due, and everyone is turning up."}),D("Today",O.today),D("This week",O.week),!T&&L&&(0,i.jsx)("p",{className:"pt-2 text-[0.7812rem] text-ink-3",children:"Red numbers are urgent: deal with them first."}),O.hidden>0&&(0,i.jsxs)(l.Button,{size:"sm",variant:"ghost",className:"-ml-2 mt-1",onClick:()=>E(!0),children:[O.hidden," more"]}),v&&I.length>5&&(0,i.jsx)(l.Button,{size:"sm",variant:"ghost",className:"-ml-2 mt-1",onClick:()=>E(!1),children:"Show fewer"})]})}function b(){let e=(0,d.useRow)(["billing-summary"],c.SUMMARY).data;return(0,i.jsxs)("section",{children:[(0,i.jsx)(l.SectionHead,{title:"Money",href:"/billing",link:"Billing"}),e?(0,i.jsxs)("dl",{className:"grid grid-cols-2 gap-6 pt-3",children:[(0,i.jsxs)("div",{children:[(0,i.jsx)("dt",{className:"label",children:"Outstanding"}),(0,i.jsx)("dd",{className:"stat-number mt-1 text-[1.875rem] leading-none",children:(0,m.money)(e.outstanding_minor)}),(0,i.jsxs)("dd",{className:"mt-1 text-[0.8125rem] text-ink-3",children:[e.owing_families," famil",1===e.owing_families?"y":"ies",Number(e.overdue_minor)>0?` \xb7 ${(0,m.money)(e.overdue_minor)} overdue`:""]})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("dt",{className:"label",children:"Collected, 30 days"}),(0,i.jsx)("dd",{className:"stat-number mt-1 text-[1.875rem] leading-none",children:(0,m.money)(e.collected_30d_minor)}),(0,i.jsx)("dd",{className:"mt-1 text-[0.8125rem] text-ink-3",children:"Card, transfer and cash"})]})]}):(0,i.jsx)(l.Skeleton,{className:"mt-3 h-16"})]})}function x({title:e,rows:t,empty:n,render:s,href:d,link:r}){return(0,i.jsxs)("section",{className:"min-w-0",children:[(0,i.jsxs)("div",{className:"mb-1 flex items-baseline gap-3",children:[(0,i.jsx)("h2",{className:"section-title flex-1",children:e}),d&&(0,i.jsx)(a.default,{href:d,className:"text-[0.8125rem] font-semibold text-accent-text hover:underline",children:r})]}),t.isLoading&&(0,i.jsx)(l.Skeleton,{className:"mt-2 h-20"}),t.data?.length===0&&(0,i.jsx)("p",{className:"py-3 text-sm text-ink-3",children:n}),(0,i.jsx)("ul",{className:"divide-y divide-line",children:t.data?.slice(0,4).map((e,t)=>(0,i.jsx)("li",{className:"py-2.5",children:s(e)},t))})]})}function N(){let e=(0,d.useRows)(["recent-enrolments"],r.RECENT_ENROLMENTS);return(0,i.jsx)(x,{title:"New in class",rows:e,empty:"No new enrolments yet.",render:e=>(0,i.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,i.jsxs)("span",{className:"min-w-0",children:[(0,i.jsxs)("span",{className:"font-medium",children:[e.first_name," ",e.last_name]}),(0,i.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:e.class_name})]}),(0,i.jsx)("span",{className:"shrink-0 text-[0.7812rem] text-ink-3",children:(0,m.relativeDay)(e.started_on)})]})})}function j(){let e=(0,d.useRows)(["upcoming-trials"],r.UPCOMING_TRIALS);return(0,i.jsx)(x,{title:"Trials coming up",rows:e,href:"/enrolment",link:"Enrolment",empty:"No trials booked.",render:e=>(0,i.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,i.jsxs)("span",{className:"min-w-0",children:[(0,i.jsx)("span",{className:"font-medium",children:e.who}),(0,i.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:e.class_name})]}),(0,i.jsx)("span",{className:"shrink-0 text-[0.7812rem] text-ink-3",children:e.starts_at?(0,m.dayDateTime)(e.starts_at):"Not booked"})]})})}function $(){let e=(0,d.useRows)(["recent-messages"],r.RECENT_MESSAGES);return(0,i.jsx)(x,{title:"Recent messages",rows:e,href:"/inbox",link:"Messages",empty:"No messages yet.",render:e=>(0,i.jsxs)("div",{children:[(0,i.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,i.jsx)("span",{className:"min-w-0 truncate font-medium",children:e.subject||e.body}),(0,i.jsx)("span",{className:"shrink-0 text-[0.7812rem] text-ink-3",children:(0,m.relativeDay)(e.sent_at)})]}),(0,i.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:"direct"===e.kind?e.family_name:"class_broadcast"===e.kind?e.class_name:"Everyone"})]})})}e.s(["default",0,function(){return(0,i.jsx)(h,{})}],95227)},886,e=>{"use strict";e.s(["dateWithYear",0,function(e){if(!e)return"—";let i=e instanceof Date?e:new Date(10===String(e).length?`${e}T12:00:00Z`:e);return Number.isNaN(i.getTime())?"—":new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"Europe/London"}).format(i)},"groupAttention",0,function(e,i=5,t=!1){let a=[...e.filter(e=>"today"===e.when),...e.filter(e=>"week"===e.when)],n=t?a:a.slice(0,i);return{today:n.filter(e=>"today"===e.when),week:n.filter(e=>"week"===e.when),hidden:a.length-n.length}},"officeAgeFit",0,function(e,i){return null==e||null==i.age_min&&null==i.age_max?"fits":null!=i.age_min&&i.age_min>=18&&e<18||null!=i.age_max&&i.age_max<18&&e>=18?"never":null!=i.age_min&&e<i.age_min||null!=i.age_max&&e>i.age_max?"teacher":"fits"},"paidAndCredited",0,function(e){let i=Math.max(0,Number(e.credited_minor??0)),t=Math.max(0,Number(e.paid_minor)-i),a=Math.max(0,Number(e.total_minor)-Number(e.paid_minor));return{total:Number(e.total_minor),credited:i,paid:t,toPay:a}},"pastTense",0,function(e){return e.replace(/\bwill be\b/g,"were")},"pickerLabels",0,function(e){let i=new Map;for(let t of e)i.set(t.name.trim().toLowerCase(),(i.get(t.name.trim().toLowerCase())??0)+1);let t=new Map;for(let a of e){if((i.get(a.name.trim().toLowerCase())??0)<2){t.set(a.id,a.name);continue}let e=[a.guardian,a.children,a.postcode].map(e=>e?.trim()).filter(Boolean);t.set(a.id,e.length?`${a.name} (${e.join("; ")})`:a.name)}return t},"plural",0,function(e,i,t){let a=Number(e??0);return`${a.toLocaleString("en-GB")} ${1===a?i:t??i+"s"}`},"reminderReach",0,function(e){return{reached:e.filter(e=>e.uses_app),unreached:e.filter(e=>!e.uses_app)}}])},90514,e=>{"use strict";var i=e.i(47167);e.s(["cardPaymentsEnabled",0,()=>"stripe"===i.default.env.NEXT_PUBLIC_PAYMENTS_PROVIDER])},50293,e=>{"use strict";let i=`
select
  coalesce((select sum(balance_minor) from family where deleted_at is null and balance_minor > 0), 0)::bigint as outstanding_minor,
  (select count(*)::int from family where deleted_at is null and balance_minor > 0) as owing_families,
  coalesce((select sum(total_minor - paid_minor) from invoice where deleted_at is null
             and status in ('issued','part_paid','refunded') and due_on < current_date), 0)::bigint as overdue_minor,
  (select count(*)::int from invoice where deleted_at is null
     and status in ('issued','part_paid','refunded') and due_on < current_date) as overdue_invoices,
  (select count(*)::int from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and exists (select 1 from invoice i where i.id = p.invoice_id
       and i.status in ('issued','part_paid'))) as failed_payments,
  coalesce((select sum(p.amount_minor) from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and exists (select 1 from invoice i where i.id = p.invoice_id
       and i.status in ('issued','part_paid'))), 0)::bigint as failed_minor,
  coalesce((select sum(amount_minor - refunded_minor) from payment where deleted_at is null
     and succeeded_at >= now() - interval '30 days' and method not in ('account','credit')), 0)::bigint
     as collected_30d_minor,
  coalesce((select -sum(balance_minor) from family where deleted_at is null and balance_minor < 0), 0)::bigint as credit_minor`,t=`
with loc as (select id from location where name = $1 and deleted_at is null),
m as (select lm.* from location_money lm where lm.location_id in (select id from loc)),
fam_here as (select distinct s.family_id from enrolment e join student s on s.id = e.student_id join class c on c.id = e.class_id
              where e.status = 'active' and e.deleted_at is null and c.location_id in (select id from loc)),
inv_here as (select i.* from invoice i where i.deleted_at is null and (
               exists (select 1 from invoice_item ii join class c on c.id = ii.class_id
                        where ii.invoice_id = i.id and ii.deleted_at is null and c.location_id in (select id from loc))
               or (not exists (select 1 from invoice_item ii where ii.invoice_id = i.id and ii.deleted_at is null and ii.class_id is not null)
                   and i.family_id in (select family_id from fam_here))))
select
  coalesce((select sum(outstanding_minor) from m), 0)::bigint as outstanding_minor,
  (select count(distinct family_id)::int from inv_here where status in ('issued','part_paid')) as owing_families,
  coalesce((select sum(overdue_minor) from m), 0)::bigint as overdue_minor,
  (select count(*)::int from inv_here where status in ('issued','part_paid','refunded') and due_on < current_date) as overdue_invoices,
  (select count(*)::int from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and p.invoice_id in (select id from inv_here where status in ('issued','part_paid'))) as failed_payments,
  coalesce((select sum(p.amount_minor) from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and p.invoice_id in (select id from inv_here where status in ('issued','part_paid'))), 0)::bigint as failed_minor,
  coalesce((select sum(collected_30d_minor) from m), 0)::bigint as collected_30d_minor,
  coalesce((select -sum(balance_minor) from family where deleted_at is null and balance_minor < 0
     and id in (select family_id from fam_here)), 0)::bigint as credit_minor`,a=e=>`array(select distinct l.name from student s
   join enrolment e on e.student_id = s.id and e.status = 'active' and e.deleted_at is null
   join class c on c.id = e.class_id join location l on l.id = c.location_id
  where s.family_id = ${e} and s.deleted_at is null order by l.name)`,n=`coalesce(nullif(array(select distinct l.name from invoice_item it
   join class c on c.id = it.class_id join location l on l.id = c.location_id
  where it.invoice_id = i.id and it.deleted_at is null order by l.name), '{}'), ${a("f.id")})`,s=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       f.id as family_id, f.name as family_name,
       (select g.full_name from guardian g where g.id = i.billed_guardian_id) as billed_to,
       (select coalesce(sum(p.amount_minor - p.refunded_minor), 0) from payment p
         where p.invoice_id = i.id and p.deleted_at is null and p.credit_note_id is not null)::bigint as credited_minor,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue,
       exists (select 1 from payment p where p.invoice_id = i.id and p.deleted_at is null
                and p.failure_code is not null and p.succeeded_at is null)
         and i.status in ('issued','part_paid') as failed,
       (select string_agg(description, ', ' order by created_at) from invoice_item it
         where it.invoice_id = i.id and it.deleted_at is null) as lines,
       ${n} as locations
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null
 order by (i.status = 'draft') desc,
          (i.status in ('issued','part_paid','refunded')) desc,
          i.due_on desc nulls last, i.number desc`,d=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       i.subtotal_minor, i.discount_minor, i.note, i.void_reason,
       f.id as family_id, f.name as family_name, f.balance_minor as family_balance_minor,
       (select g.full_name from guardian g where g.id = i.billed_guardian_id) as billed_to,
       app.family_available_credit(f.id) as available_credit_minor,
       (select coalesce(sum(p.amount_minor - p.refunded_minor), 0) from payment p
         where p.invoice_id = i.id and p.deleted_at is null and p.credit_note_id is not null)::bigint as credited_minor,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue
  from invoice i join family f on f.id = i.family_id
 where i.id = $1`,l=`
select it.id, it.kind, it.description, it.quantity, it.unit_minor, it.discount_minor, it.total_minor,
       s.first_name as student_name
  from invoice_item it left join student s on s.id = it.student_id
 where it.invoice_id = $1 and it.deleted_at is null
 order by it.created_at`,r=`
select id, amount_minor, refunded_minor, method, provider, failure_code, succeeded_at, created_at, note, credit_note_id
  from payment where invoice_id = $1 and deleted_at is null
 order by created_at`,o=`
select f.id, f.name, f.balance_minor,
       (select g.full_name from guardian g
         where g.family_id = f.id and g.deleted_at is null order by g.is_primary desc, g.created_at limit 1) as guardian,
       (select string_agg(s.first_name, ', ' order by s.first_name) from student s
         where s.family_id = f.id and s.deleted_at is null) as children,
       f.postcode
  from family f where f.deleted_at is null order by f.name`,c=`
select s.id as student_id, s.first_name as student_name, c.id as class_id, c.name as class_name,
       coalesce(e.price_minor, c.price_minor) as price_minor, c.pricing
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where s.family_id = $1 and e.status = 'active' and e.deleted_at is null and c.deleted_at is null
 order by s.first_name, c.name`,m=`
select id, number, amount_minor, reason, applied_minor, refunded_minor, account_minor, created_at
  from credit_note where invoice_id = $1 order by created_at`,_=`
select f.id, f.name, f.balance_minor, app.family_available_credit(f.id) as credit_minor,
       coalesce((select sum(total_minor - paid_minor) from invoice i where i.family_id = f.id and i.deleted_at is null
                  and i.status in ('issued','part_paid','refunded')), 0)::bigint as open_minor,
       app.payment_reference(f.name, f.id) as reference
  from family f where f.id = $1 and f.deleted_at is null`,u=`
with l as (
  select i.created_at as at, coalesce(i.issued_on, i.created_at::date) as on_date, 'invoice' as kind, i.number as ref,
         (select string_agg(it.description, ', ' order by it.created_at) from invoice_item it
           where it.invoice_id = i.id and it.deleted_at is null) as detail,
         i.total_minor as amount_minor
    from invoice i where i.family_id = $1 and i.deleted_at is null and i.status not in ('draft', 'void')
  union all
  select p.succeeded_at, p.succeeded_at::date, 'payment', i.number, p.method, -p.amount_minor
    from payment p left join invoice i on i.id = p.invoice_id
   where p.family_id = $1 and p.deleted_at is null and p.succeeded_at is not null
     and p.method in ('card', 'direct_debit', 'bank_transfer', 'cash')
  union all
  select p.succeeded_at, p.succeeded_at::date, 'credit', null, p.note, -p.amount_minor
    from payment p where p.family_id = $1 and p.deleted_at is null and p.succeeded_at is not null
     and p.method = 'credit' and p.credit_note_id is null
  union all
  select cn.created_at, cn.created_at::date, 'credit_note', cn.number, i.number || ' \xb7 ' || cn.reason, -cn.amount_minor
    from credit_note cn join invoice i on i.id = cn.invoice_id where cn.family_id = $1
  union all
  select r.created_at, r.created_at::date, 'refund', i.number, r.reason, r.amount_minor
    from refund r join payment p on p.id = r.payment_id left join invoice i on i.id = p.invoice_id
   where r.family_id = $1
  union all
  -- Refunds from before they were itemised, and card refunds from the provider.
  select p.updated_at, p.updated_at::date, 'refund', i.number, null,
         p.refunded_minor - coalesce((select sum(r.amount_minor) from refund r where r.payment_id = p.id), 0)
    from payment p left join invoice i on i.id = p.invoice_id
   where p.family_id = $1 and p.deleted_at is null
     and p.refunded_minor > coalesce((select sum(r.amount_minor) from refund r where r.payment_id = p.id), 0)
)
select on_date, kind, ref, detail, amount_minor,
       sum(amount_minor) over (order by at, array_position(array['invoice','payment','credit','credit_note','refund'], kind)
                               rows unbounded preceding) as balance_minor
  from l order by at, array_position(array['invoice','payment','credit','credit_note','refund'], kind)`,f=`
select f.id as family_id, f.name as family_name, sum(i.total_minor - i.paid_minor)::bigint as overdue_minor,
       string_agg(i.number, ', ' order by i.due_on, i.number) as invoices, min(i.due_on) as oldest_due,
       app.last_payment_reminder(f.id) as last_reminded,
       exists (select 1 from guardian g where g.family_id = f.id and g.user_id is not null and g.deleted_at is null) as uses_app,
       ${a("f.id")} as locations
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null and i.status in ('issued','part_paid','refunded')
   and i.total_minor > i.paid_minor and i.due_on < current_date
 group by f.id, f.name order by min(i.due_on), f.name`,p=`
select app.fill_payment_reminder($1, $2) as subject, app.fill_payment_reminder($1, $3) as body`,h=`
select b.studio_id, b.payee_name, b.sort_code, b.account_number, b.iban, b.updated_at
  from studio_bank_details b where b.studio_id = $1`,y=`
select f.id as family_id, app.payment_reference(f.name, f.id) as reference,
       b.payee_name, b.sort_code, b.account_number, b.iban
  from family f left join studio_bank_details b on b.studio_id = f.studio_id
 where f.deleted_at is null and f.id in (select app.guardian_family_ids())
 order by f.created_at limit 1`,g=`
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`,w=`
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`,b=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`,x=`
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`,N=`
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.deleted_at is null and d.ended_at is null and (d.ends_on is null or d.ends_on >= current_date)
 order by f.name`,j=`
insert into family_discount (family_id, kind, amount, reason, note, starts_on, ends_on)
values ($1, $2, $3, $4, nullif($5, ''), coalesce($6::date, current_date), $7::date) returning id`,$=`
select f.id, f.name,
       (select g.full_name from guardian g
         where g.family_id = f.id and g.deleted_at is null order by g.is_primary desc, g.created_at limit 1) as guardian,
       (select string_agg(s.first_name, ', ' order by s.first_name) from student s
         where s.family_id = f.id and s.deleted_at is null) as children,
       f.postcode
  from family f where f.deleted_at is null and not f.is_prospect order by f.name`,v=`
with lines as (
  select i.id, i.number, f.name as contact, (select g.email from guardian g where g.family_id = f.id and g.deleted_at is null
            order by g.is_primary desc, g.created_at limit 1) as email,
         coalesce(i.issued_on, i.created_at::date) as inv_date, i.due_on, t.name as term,
         ii.description, ii.quantity, ii.total_minor, ii.created_at, 0 as ord
    from invoice i join family f on f.id = i.family_id join invoice_item ii on ii.invoice_id = i.id and ii.deleted_at is null
    left join term t on t.id = i.term_id
   where i.deleted_at is null and i.status not in ('draft', 'void')
  union all
  select i.id, i.number, f.name, null, coalesce(i.issued_on, i.created_at::date), i.due_on, t.name,
         'Discount', 1, -i.discount_minor, i.created_at, 1
    from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
   where i.deleted_at is null and i.status not in ('draft', 'void') and i.discount_minor > 0
  union all
  -- Credit notes: a negative sales invoice, which Xero imports as a credit note.
  select cn.id, cn.number, f.name, null, cn.created_at::date, cn.created_at::date, i.number,
         'Credit note for ' || i.number || ': ' || cn.reason, 1, -cn.amount_minor, cn.created_at, 2
    from credit_note cn join invoice i on i.id = cn.invoice_id join family f on f.id = cn.family_id
)
select contact as "*ContactName", coalesce(email, '') as "EmailAddress", number as "*InvoiceNumber", coalesce(term, '') as "Reference",
       to_char(inv_date, 'DD/MM/YYYY') as "*InvoiceDate", to_char(due_on, 'DD/MM/YYYY') as "*DueDate",
       description as "*Description", quantity as "*Quantity", round(total_minor / quantity / 100.0, 2) as "*UnitAmount",
       '200' as "*AccountCode", 'No VAT' as "*TaxType", 'GBP' as "Currency"
  from lines order by number, ord, created_at`,E=`
select family_name as family, round(current_minor / 100.0, 2) as "0-30 days", round(d31_60 / 100.0, 2) as "31-60 days",
       round(d61_90 / 100.0, 2) as "61-90 days", round(d90_plus / 100.0, 2) as "90+ days", round(total / 100.0, 2) as total
  from app.aged_debt((select id from studio where app.is_admin(id) order by name limit 1)) a
 where $1::text is null or $1::text = any(${a("a.family_id")})`,T=`
select i.number, f.name as family, i.status::text as status, i.issued_on, i.due_on,
       round(i.subtotal_minor / 100.0, 2) as subtotal, round(i.discount_minor / 100.0, 2) as discount,
       round(i.total_minor / 100.0, 2) as total, round(i.paid_minor / 100.0, 2) as paid,
       round((i.total_minor - i.paid_minor) / 100.0, 2) as outstanding, t.name as term
  from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
 where i.deleted_at is null order by i.number`,S=`
select p.succeeded_at::date as date, f.name as family, i.number as invoice, p.method,
       round(p.amount_minor / 100.0, 2) as amount,
       case when p.failure_code is not null then 'failed' when p.succeeded_at is null then 'pending' else 'succeeded' end as status,
       p.provider_ref as reference
  from payment p join family f on f.id = p.family_id left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null order by p.created_at`,I=`
select coalesce(b.mode, 'family') as mode, b.guardian_a, b.guardian_b, b.percent_a
  from family f left join family_billing b on b.family_id = f.id
 where f.id = $1`,k=`
select id, full_name from guardian where family_id = $1 and deleted_at is null order by is_primary desc, full_name`,A=`
select s.id, s.first_name, x.guardian_id
  from student s left join family_billing_child x on x.student_id = s.id
 where s.family_id = $1 and s.deleted_at is null order by s.date_of_birth`,R=`
select ac.id, ac.created_at, ac.family_id, f.name as family_name, s.first_name as child,
       app.session_label(ac.session_id) as session_label, ac.amount_minor, ac.status
  from absence_credit ac join family f on f.id = ac.family_id join student s on s.id = ac.student_id
 order by ac.created_at desc limit 50`,O=`
select id, absence_credit, absence_credit_fixed_minor, makeup_policy from studio where id in (select app.studio_ids()) limit 1`,L=`
update studio set absence_credit = $2, absence_credit_fixed_minor = $3 where id = $1 returning id`;e.s(["ABSENCE_CREDITS",0,R,"ABSENCE_CREDIT_SETTING",0,O,"ADD_FAMILY_CREDIT",0,"select app.add_family_credit($1, $2, $3) as id","ADD_FAMILY_DISCOUNT",0,j,"AGED_DEBT_EXPORT",0,E,"BANK_DETAILS",0,h,"BILLING_LINES",0,"select * from app.billing_lines($1, $2::date, $3::uuid[])","BILLING_RUNS",0,x,"BILLING_SKIPPED",0,"select * from app.billing_skipped($1, $2::date)","BILLING_TERMS",0,"select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc","CLASS_LOCATIONS",0,"select c.id, l.name as location from class c join location l on l.id = c.location_id where c.deleted_at is null","CREATE_BILLING_RUN",0,"select app.create_billing_run($1, $2::date, $3::date, $4::uuid[], $5) as id","CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","DISCARD_BILLING_RUN",0,"select app.discard_billing_run($1)","DISCOUNT_RULES",0,"select id, kind, from_nth, percent, enabled from discount_rule order by kind desc","END_FAMILY_DISCOUNT",0,"select app.end_family_discount($1)","FAMILY_ACCOUNT",0,_,"FAMILY_BILLABLE",0,c,"FAMILY_BILLING",0,I,"FAMILY_BILLING_CHILDREN",0,A,"FAMILY_DISCOUNTS",0,N,"FAMILY_GUARDIANS",0,k,"FAMILY_OPTIONS",0,o,"FAMILY_PICK",0,$,"FAMILY_STATEMENT",0,u,"INVOICE",0,d,"INVOICES",0,s,"INVOICES_EXPORT",0,T,"INVOICE_CREDIT_NOTES",0,m,"INVOICE_ITEMS",0,l,"INVOICE_PAYMENTS",0,r,"ISSUE_BILLING_RUN",0,"select app.issue_billing_run($1) as n","ISSUE_CREDIT_NOTE",0,"select app.issue_credit_note($1, $2, $3, $4) as id","ISSUE_INVOICE",0,"select app.issue_invoice($1)","MY_PAYMENT_INFO",0,y,"NOTIFY_DUE",0,"select app.notify_invoices_due() as n","OVERDUE_FAMILIES",0,f,"PAYMENTS_EXPORT",0,S,"PRIMARY_GUARDIAN",0,w,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3, $4)","REMINDER_PREVIEW",0,p,"REMINDER_TEMPLATE",0,g,"SEND_DIRECT",0,b,"SEND_REMINDERS",0,"select app.send_payment_reminders($1::uuid[], $2, $3) as sent","SET_ABSENCE_CREDIT",0,L,"SET_BANK_DETAILS",0,"select app.set_bank_details($1, $2, $3, $4, $5)","SET_DISCOUNT_RULE",0,"update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id","SET_FAMILY_BILLING",0,"select app.set_family_billing($1, $2, $3, $4, $5, $6::jsonb)","SUMMARY",0,i,"SUMMARY_AT",0,t,"UPCOMING_COSTS",0,"select * from app.upcoming_costs($1::uuid)","VOID_INVOICE",0,"select app.void_invoice($1, $2)","XERO_EXPORT",0,v])},21011,e=>{"use strict";let i=`
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
 order by s.last_name, s.first_name`,s=`
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
 order by cs.starts_at, c.name`,d=s.replace("and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz","and cs.id = $1"),l=`
select e.id, e.started_on, s.first_name, s.last_name, c.name as class_name
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where e.deleted_at is null and e.status = 'active'
 order by e.started_on desc, e.created_at desc
 limit 6`,r=`
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
 limit 6`,o=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at,
       f.name as family_name, c.name as class_name
  from communication cm
  left join family f on f.id = cm.family_id
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
 order by cm.sent_at desc
 limit 5`,c=`
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
 where e.class_id = (select class_id from class_session where id = $1) and e.status = 'active' and e.deleted_at is null`,f=`
select t.name, (current_date - t.starts_on) / 7 + 1 as week, (t.ends_on - t.starts_on) / 7 + 1 as weeks
  from term t where t.deleted_at is null and current_date between t.starts_on and t.ends_on
 order by t.starts_on desc limit 1`,p=`
select e.id, e.stage::text as stage, e.contact_name, e.child_name, e.next_action_on,
       e.next_action_on <= current_date as due_now
  from enquiry e
 where e.deleted_at is null and e.stage not in ('enrolled', 'closed_lost')
   and e.next_action_on is not null and e.next_action_on < current_date + 7
 order by e.next_action_on, e.created_at`,h=`
select cs.starts_at, t.name as term_name,
       not exists (select 1 from class_session e join class ec on ec.id = e.class_id
                    where ec.term_id = c.term_id and e.deleted_at is null and e.starts_at < cs.starts_at) as term_start
  from class_session cs join class c on c.id = cs.class_id
  left join term t on t.id = c.term_id
 where cs.deleted_at is null and c.deleted_at is null and cs.status <> 'cancelled' and cs.starts_at >= $1::timestamptz
 order by cs.starts_at limit 1`,y=`select r.* from app.overdue_registers(
  (select id from studio where id in (select app.studio_ids()) limit 1)) r`,g=`select * from app.trials_to_decide(
  (select id from studio where id in (select app.studio_ids()) limit 1))`,w=`select * from app.exam_fees_unpaid(
  (select id from studio where id in (select app.studio_ids()) limit 1))`;e.s(["ATTENTION_CAPACITY",0,t,"ATTENTION_EXAM_FEES",0,w,"ATTENTION_FOLLOW_UPS",0,p,"ATTENTION_LAPSED",0,n,"ATTENTION_MESSAGES",0,c,"ATTENTION_PAYMENTS",0,i,"ATTENTION_REGISTERS",0,y,"ATTENTION_REQUESTS",0,m,"ATTENTION_TRIALS",0,a,"ATTENTION_TRIAL_FEEDBACK",0,g,"CANCEL_SESSION",0,"select app.cancel_session($1, $2, $3, $4)","COVER_CLASHES",0,"select session_id, class_name, starts_at, ends_at, location, needs_travel from app.cover_clashes($1, $2)","COVER_SESSION",0,"select app.cover_session($1, $2, $3, $4, $5, $6)","MOVE_SESSION",0,"select app.move_session($1, $2::timestamptz, $3, $4, $5)","NEXT_CLASS_WEEK",0,h,"RECENT_ENROLMENTS",0,l,"RECENT_MESSAGES",0,o,"ROOM_OPTIONS",0,_,"SESSIONS_BETWEEN",0,s,"SESSION_BY_ID",0,d,"SESSION_FAMILIES",0,u,"SESSION_HANDOVER",0,"select handover_note from class_session where id = $1","STAFF_OPTIONS",0,"select id, display_name from staff_member where status = 'active' and deleted_at is null order by display_name","TERM_NOW",0,f,"UPCOMING_TRIALS",0,r])}]);