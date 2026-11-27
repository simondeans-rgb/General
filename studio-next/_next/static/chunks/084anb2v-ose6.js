(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,72520,e=>{"use strict";let i=(0,e.i(75254).default)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);e.s(["ArrowRight",0,i],72520)},95227,e=>{"use strict";var i=e.i(43476),a=e.i(71645),t=e.i(22016),n=e.i(72520),s=e.i(77326),d=e.i(13927),l=e.i(17658),r=e.i(21011),o=e.i(18086),c=e.i(50293),m=e.i(75379),_=e.i(45060),u=e.i(90514);function f(){let[e,t]=a.useMemo(()=>(0,m.dayRange)(0),[]),n=(0,d.useRows)(["sessions",e],r.SESSIONS_BETWEEN,[e,t]),o=(0,d.useRow)(["term-now"],r.TERM_NOW).data,c=(n.data??[]).filter(e=>"cancelled"!==e.status).find(e=>new Date(e.ends_at)>new Date)??null;return(0,i.jsx)(s.Shell,{title:"Today",allow:["owner","admin"],subtitle:(0,i.jsxs)("span",{className:"flex flex-wrap items-center gap-x-2",children:[(0,m.dateLong)(new Date),o&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("span",{"aria-hidden":!0,className:"hidden sm:inline",children:"·"}),(0,i.jsxs)("span",{children:[o.name,", week ",o.week," of ",o.weeks]}),(0,i.jsx)(l.Beats,{value:o.week,max:o.weeks,size:"sm",label:`Week ${o.week} of ${o.weeks}`,className:"hidden sm:inline-flex"})]})]}),children:(0,i.jsxs)("div",{className:"mx-auto grid max-w-[1240px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",children:[(0,i.jsx)("div",{className:"min-w-0 lg:col-start-1 lg:row-start-1",children:(0,i.jsx)(p,{s:c,loading:n.isLoading})}),(0,i.jsxs)("div",{className:"min-w-0 space-y-10 lg:col-start-2 lg:row-span-2 lg:row-start-1",children:[(0,i.jsx)(y,{}),(0,i.jsx)(b,{})]}),(0,i.jsx)("div",{className:"min-w-0 lg:col-start-1 lg:row-start-2",children:(0,i.jsx)(h,{rows:n.data,loading:n.isLoading,error:n.error,retry:()=>n.refetch()})}),(0,i.jsxs)("div",{className:"grid gap-x-12 gap-y-8 border-t border-line pt-8 md:grid-cols-3 lg:col-span-2 lg:row-start-3",children:[(0,i.jsx)(g,{}),(0,i.jsx)(N,{}),(0,i.jsx)(w,{})]})]})})}function p({s:e,loading:a}){if(a)return(0,i.jsx)(l.Skeleton,{className:"h-36"});if(!e)return(0,i.jsxs)("div",{children:[(0,i.jsx)("p",{className:"label",children:"Next"}),(0,i.jsx)("p",{className:"mt-2 font-display text-[1.75rem] leading-tight",children:"No more classes today"}),(0,i.jsx)("p",{className:"mt-1 text-ink-3",children:"Tomorrow’s timetable is on the schedule."})]});let n=Math.round((new Date(e.starts_at).getTime()-Date.now())/6e4),s=n>0?n<90?`in ${n} min`:`at ${(0,m.time)(e.starts_at)}`:"on now";return(0,i.jsxs)("section",{"aria-labelledby":"next-h",className:"flex flex-col gap-x-8 gap-y-3 sm:flex-row sm:items-end",children:[(0,i.jsxs)("div",{children:[(0,i.jsxs)("p",{className:"label text-accent-text",children:["Next · ",s]}),(0,i.jsx)("p",{id:"next-h",className:"display-xl mt-1 text-[length:min(4.5rem,22vw)] text-ink sm:text-[length:min(5.5rem,22vw)]",children:(0,m.time)(e.starts_at)})]}),(0,i.jsxs)("div",{className:"min-w-0 flex-1 sm:pb-1.5",children:[(0,i.jsx)("p",{className:"font-display text-[1.5rem] leading-tight",children:e.name}),(0,i.jsx)("p",{className:"mt-1 text-[0.875rem] text-ink-3",children:[e.teacher,e.room,e.location].filter(Boolean).join(" · ")}),(0,i.jsxs)("p",{className:"mt-1 flex items-center gap-2 text-[0.875rem] text-ink-2",children:[(0,i.jsx)(l.Beats,{value:e.enrolled,max:e.capacity,label:`${e.enrolled} of ${e.capacity} places`}),(0,i.jsxs)("span",{className:"tnum",children:[e.enrolled," of ",e.capacity,e.trials?` \xb7 ${e.trials} trial${1===e.trials?"":"s"}`:""]})]}),(0,i.jsxs)("div",{className:"mt-4 flex flex-wrap gap-2",children:[(0,i.jsx)(t.default,{href:`/teach/register/?session=${e.id}`,children:(0,i.jsx)(l.Button,{variant:"primary",tabIndex:-1,children:"Open register"})}),(0,i.jsx)(t.default,{href:"/schedule",children:(0,i.jsx)(l.Button,{tabIndex:-1,children:"Timetable"})})]})]})]})}function h({rows:e,loading:a,error:n,retry:s}){return(0,i.jsxs)("section",{children:[(0,i.jsx)(l.SectionHead,{title:e?`Today \xb7 ${e.length} class${1===e.length?"":"es"}`:"Today",meta:"Booked of capacity",href:"/schedule",link:"Full schedule"}),a&&(0,i.jsx)("div",{className:"space-y-3 pt-3",children:[0,1,2].map(e=>(0,i.jsx)(l.Skeleton,{className:"h-12"},e))}),null!=n&&(0,i.jsx)(l.ErrorState,{error:n,onRetry:s}),e?.length===0&&(0,i.jsx)(l.EmptyState,{title:"Nothing on today",body:"Enjoy the quiet. Tomorrow’s classes are on the schedule."}),(0,i.jsx)("ul",{className:"divide-y divide-line",children:e?.map(e=>{let a="cancelled"===e.status;return(0,i.jsx)("li",{children:(0,i.jsxs)(t.default,{href:`/teach/register/?session=${e.id}`,className:"grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 py-3 hover:bg-surface-2/60 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto_3.5rem]",children:[(0,i.jsx)("span",{className:(0,_.cn)("font-display text-[1.1875rem] tnum",a&&"text-ink-3 line-through"),children:(0,m.time)(e.starts_at)}),(0,i.jsxs)("span",{className:"min-w-0",children:[(0,i.jsx)("span",{className:(0,_.cn)("block truncate font-semibold",a&&"text-ink-3"),children:e.name}),(0,i.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:a?(0,i.jsxs)("span",{className:"font-semibold uppercase tracking-wide text-critical",children:["Cancelled",e.cancel_reason?` \xb7 ${e.cancel_reason}`:""]}):[e.covered?`${e.teacher} (cover)`:e.teacher,e.room].filter(Boolean).join(" · ")})]}),!a&&(0,i.jsx)(l.Beats,{value:e.enrolled,max:e.capacity,label:`${e.enrolled} of ${e.capacity} places`,className:"hidden sm:inline-flex"}),(0,i.jsx)("span",{className:"tnum text-right text-[0.8438rem] text-ink-2",children:a?"":`${e.enrolled}/${e.capacity}`})]})},e.id)})})]})}function y(){let e=(0,d.useRow)(["att-pay"],r.ATTENTION_PAYMENTS),a=(0,d.useRows)(["att-cap"],r.ATTENTION_CAPACITY),s=(0,d.useRows)(["att-trials"],r.ATTENTION_TRIALS),c=(0,d.useRows)(["att-lapsed"],r.ATTENTION_LAPSED),f=(0,d.useRow)(["att-requests"],r.ATTENTION_REQUESTS),p=(0,d.useRow)(["att-messages"],r.ATTENTION_MESSAGES),h=(0,d.useRows)(["att-checks"],o.CHECK_GAPS_TODAY),y=h.isLoading||e.isLoading||a.isLoading||s.isLoading||c.isLoading||f.isLoading||p.isLoading,b=[],x=f.data;if(x&&x.medical_updates>0&&b.push({key:"med",n:x.medical_updates,tone:"critical",href:"/requests",action:"Review",headline:`Medical update${1===x.medical_updates?"":"s"} to acknowledge`,detail:"Teachers see the change once you record it"}),h.data?.length&&b.push({key:"checks",n:h.data.length,tone:"critical",href:"/safeguarding",action:"See who",headline:"Staff checks to sort",detail:h.data.slice(0,2).map(e=>`${e.name}: ${e.issue}`).join(" · ")+(h.data.length>2?"…":"")}),e.data&&e.data.failed>0&&b.push({key:"pay",n:e.data.failed,tone:"critical",href:"/billing",action:(0,u.cardPaymentsEnabled)()?"Retry":"See invoices",headline:`Card payment${1===e.data.failed?"":"s"} failed`,detail:`${(0,m.money)(e.data.failed_minor)} declined`}),p.data&&p.data.awaiting>0&&b.push({key:"msg",n:p.data.awaiting,tone:"ink",href:"/inbox",action:"Reply",headline:`Famil${1===p.data.awaiting?"y":"ies"} waiting for a reply`,detail:(p.data.names??"")+(p.data.awaiting>3?"…":"")}),x&&(x.open_requests>0||x.pending_entries>0)&&b.push({key:"req",n:x.open_requests+x.pending_entries,tone:"ink",href:"/requests",action:"Open",headline:"Requests to answer",detail:[x.pending_entries?`${x.pending_entries} event entr${1===x.pending_entries?"y":"ies"}`:"",x.open_requests?`${x.open_requests} question${1===x.open_requests?"":"s"}`:""].filter(Boolean).join(" · ")}),s.data?.length&&b.push({key:"trial",n:s.data.length,tone:"ink",href:"/enrolment",action:"Follow up",headline:"Trials attended, not enrolled",detail:s.data.slice(0,3).map(e=>e.child_name).join(", ")+(s.data.length>3?"…":"")}),a.data?.filter(e=>e.waiting>0).forEach(e=>b.push({key:e.id,n:e.waiting,tone:"caution",href:"/classes",action:"Waiting list",headline:`Waiting for ${e.name}`,detail:`Class full \xb7 ${e.enrolled} of ${e.capacity}`})),c.data?.length){let e=new Set(c.data.map(e=>e.id)).size;b.push({key:"lapsed",n:e,tone:"caution",href:"/people?filter=lapsed",action:"See who",headline:"Missed three classes in a row",detail:c.data.slice(0,3).map(e=>`${e.first_name} ${e.last_name}`).join(", ")+(e>3?"…":"")})}return(0,i.jsxs)("section",{children:[(0,i.jsx)(l.SectionHead,{title:"Needs attention",meta:y?void 0:b.length?`${b.length} thing${1===b.length?"":"s"}`:void 0}),y&&(0,i.jsx)("div",{className:"space-y-3 pt-3",children:[0,1,2].map(e=>(0,i.jsx)(l.Skeleton,{className:"h-12"},e))}),!y&&0===b.length&&(0,i.jsx)(l.EmptyState,{title:"Nothing needs you",body:"No failed payments, no one waiting for a reply, and everyone is turning up."}),(0,i.jsx)("ul",{className:"on-count divide-y divide-line",children:b.map(e=>(0,i.jsx)("li",{children:(0,i.jsxs)(t.default,{href:e.href,className:"group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3",children:[(0,i.jsx)("span",{className:(0,_.cn)("font-display text-[1.75rem] leading-none tnum","critical"===e.tone?"text-critical":"caution"===e.tone?"text-caution":"text-ink"),children:e.n}),(0,i.jsxs)("span",{className:"min-w-0",children:[(0,i.jsxs)("span",{className:"block font-semibold leading-snug",children:[e.headline,"critical"===e.tone&&(0,i.jsx)("span",{className:"sr-only",children:" (urgent)"})]}),e.detail&&(0,i.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:e.detail})]}),(0,i.jsxs)("span",{className:"flex items-center gap-1 text-[0.8125rem] font-semibold text-accent-text group-hover:underline",children:[e.action,(0,i.jsx)(n.ArrowRight,{className:"size-3.5","aria-hidden":!0})]})]})},e.key))})]})}function b(){let e=(0,d.useRow)(["billing-summary"],c.SUMMARY).data;return(0,i.jsxs)("section",{children:[(0,i.jsx)(l.SectionHead,{title:"Money",href:"/billing",link:"Billing"}),e?(0,i.jsxs)("dl",{className:"grid grid-cols-2 gap-6 pt-3",children:[(0,i.jsxs)("div",{children:[(0,i.jsx)("dt",{className:"label",children:"Outstanding"}),(0,i.jsx)("dd",{className:"stat-number mt-1 text-[1.875rem] leading-none",children:(0,m.money)(e.outstanding_minor)}),(0,i.jsxs)("dd",{className:"mt-1 text-[0.8125rem] text-ink-3",children:[e.owing_families," famil",1===e.owing_families?"y":"ies",Number(e.overdue_minor)>0?` \xb7 ${(0,m.money)(e.overdue_minor)} overdue`:""]})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("dt",{className:"label",children:"Collected, 30 days"}),(0,i.jsx)("dd",{className:"stat-number mt-1 text-[1.875rem] leading-none",children:(0,m.money)(e.collected_30d_minor)}),(0,i.jsx)("dd",{className:"mt-1 text-[0.8125rem] text-ink-3",children:"Card, transfer and cash"})]})]}):(0,i.jsx)(l.Skeleton,{className:"mt-3 h-16"})]})}function x({title:e,rows:a,empty:n,render:s,href:d,link:r}){return(0,i.jsxs)("section",{className:"min-w-0",children:[(0,i.jsxs)("div",{className:"mb-1 flex items-baseline gap-3",children:[(0,i.jsx)("h2",{className:"section-title flex-1",children:e}),d&&(0,i.jsx)(t.default,{href:d,className:"text-[0.8125rem] font-semibold text-accent-text hover:underline",children:r})]}),a.isLoading&&(0,i.jsx)(l.Skeleton,{className:"mt-2 h-20"}),a.data?.length===0&&(0,i.jsx)("p",{className:"py-3 text-sm text-ink-3",children:n}),(0,i.jsx)("ul",{className:"divide-y divide-line",children:a.data?.slice(0,4).map((e,a)=>(0,i.jsx)("li",{className:"py-2.5",children:s(e)},a))})]})}function g(){let e=(0,d.useRows)(["recent-enrolments"],r.RECENT_ENROLMENTS);return(0,i.jsx)(x,{title:"New in class",rows:e,empty:"No new enrolments yet.",render:e=>(0,i.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,i.jsxs)("span",{className:"min-w-0",children:[(0,i.jsxs)("span",{className:"font-medium",children:[e.first_name," ",e.last_name]}),(0,i.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:e.class_name})]}),(0,i.jsx)("span",{className:"shrink-0 text-[0.7812rem] text-ink-3",children:(0,m.relativeDay)(e.started_on)})]})})}function N(){let e=(0,d.useRows)(["upcoming-trials"],r.UPCOMING_TRIALS);return(0,i.jsx)(x,{title:"Trials coming up",rows:e,href:"/enrolment",link:"Enrolment",empty:"No trials booked.",render:e=>(0,i.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,i.jsxs)("span",{className:"min-w-0",children:[(0,i.jsx)("span",{className:"font-medium",children:e.who}),(0,i.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:e.class_name})]}),(0,i.jsx)("span",{className:"shrink-0 text-[0.7812rem] text-ink-3",children:e.starts_at?`${(0,m.relativeDay)(e.starts_at)} ${(0,m.time)(e.starts_at)}`:"Not booked"})]})})}function w(){let e=(0,d.useRows)(["recent-messages"],r.RECENT_MESSAGES);return(0,i.jsx)(x,{title:"Recent messages",rows:e,href:"/inbox",link:"Messages",empty:"No messages yet.",render:e=>(0,i.jsxs)("div",{children:[(0,i.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,i.jsx)("span",{className:"min-w-0 truncate font-medium",children:e.subject||e.body}),(0,i.jsx)("span",{className:"shrink-0 text-[0.7812rem] text-ink-3",children:(0,m.relativeDay)(e.sent_at)})]}),(0,i.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:"direct"===e.kind?e.family_name:"class_broadcast"===e.kind?e.class_name:"Everyone"})]})})}e.s(["default",0,function(){return(0,i.jsx)(f,{})}],95227)},90514,e=>{"use strict";var i=e.i(47167);e.s(["cardPaymentsEnabled",0,()=>"stripe"===i.default.env.NEXT_PUBLIC_PAYMENTS_PROVIDER])},50293,e=>{"use strict";let i=`
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
  coalesce((select -sum(balance_minor) from family where deleted_at is null and balance_minor < 0), 0)::bigint as credit_minor`,a=e=>`array(select distinct l.name from student s
   join enrolment e on e.student_id = s.id and e.status = 'active' and e.deleted_at is null
   join class c on c.id = e.class_id join location l on l.id = c.location_id
  where s.family_id = ${e} and s.deleted_at is null order by l.name)`,t=`coalesce(nullif(array(select distinct l.name from invoice_item it
   join class c on c.id = it.class_id join location l on l.id = c.location_id
  where it.invoice_id = i.id and it.deleted_at is null order by l.name), '{}'), ${a("f.id")})`,n=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       f.id as family_id, f.name as family_name,
       (select g.full_name from guardian g where g.id = i.billed_guardian_id) as billed_to,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue,
       exists (select 1 from payment p where p.invoice_id = i.id and p.deleted_at is null
                and p.failure_code is not null and p.succeeded_at is null)
         and i.status in ('issued','part_paid') as failed,
       (select string_agg(description, ', ' order by created_at) from invoice_item it
         where it.invoice_id = i.id and it.deleted_at is null) as lines,
       ${t} as locations
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null
 order by (i.status = 'draft') desc,
          (i.status in ('issued','part_paid','refunded')) desc,
          i.due_on desc nulls last, i.number desc`,s=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       i.subtotal_minor, i.discount_minor, i.note, i.void_reason,
       f.id as family_id, f.name as family_name, f.balance_minor as family_balance_minor,
       (select g.full_name from guardian g where g.id = i.billed_guardian_id) as billed_to,
       app.family_available_credit(f.id) as available_credit_minor,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue
  from invoice i join family f on f.id = i.family_id
 where i.id = $1`,d=`
select it.id, it.kind, it.description, it.quantity, it.unit_minor, it.discount_minor, it.total_minor,
       s.first_name as student_name
  from invoice_item it left join student s on s.id = it.student_id
 where it.invoice_id = $1 and it.deleted_at is null
 order by it.created_at`,l=`
select id, amount_minor, refunded_minor, method, provider, failure_code, succeeded_at, created_at, note, credit_note_id
  from payment where invoice_id = $1 and deleted_at is null
 order by created_at`,r=`
select f.id, f.name, f.balance_minor,
       (select g.full_name from guardian g
         where g.family_id = f.id and g.deleted_at is null order by g.is_primary desc limit 1) as guardian
  from family f where f.deleted_at is null order by f.name`,o=`
select s.id as student_id, s.first_name as student_name, c.id as class_id, c.name as class_name,
       coalesce(e.price_minor, c.price_minor) as price_minor, c.pricing
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where s.family_id = $1 and e.status = 'active' and e.deleted_at is null and c.deleted_at is null
 order by s.first_name, c.name`,c=`
select id, number, amount_minor, reason, applied_minor, refunded_minor, account_minor, created_at
  from credit_note where invoice_id = $1 order by created_at`,m=`
select f.id, f.name, f.balance_minor, app.family_available_credit(f.id) as credit_minor,
       coalesce((select sum(total_minor - paid_minor) from invoice i where i.family_id = f.id and i.deleted_at is null
                  and i.status in ('issued','part_paid','refunded')), 0)::bigint as open_minor,
       app.payment_reference(f.name, f.id) as reference
  from family f where f.id = $1 and f.deleted_at is null`,_=`
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
  from l order by at, array_position(array['invoice','payment','credit','credit_note','refund'], kind)`,u=`
select f.id as family_id, f.name as family_name, sum(i.total_minor - i.paid_minor)::bigint as overdue_minor,
       string_agg(i.number, ', ' order by i.due_on, i.number) as invoices, min(i.due_on) as oldest_due,
       app.last_payment_reminder(f.id) as last_reminded,
       exists (select 1 from guardian g where g.family_id = f.id and g.user_id is not null and g.deleted_at is null) as uses_app,
       ${a("f.id")} as locations
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null and i.status in ('issued','part_paid','refunded')
   and i.total_minor > i.paid_minor and i.due_on < current_date
 group by f.id, f.name order by min(i.due_on), f.name`,f=`
select app.fill_payment_reminder($1, $2) as subject, app.fill_payment_reminder($1, $3) as body`,p=`
select b.studio_id, b.payee_name, b.sort_code, b.account_number, b.iban, b.updated_at
  from studio_bank_details b where b.studio_id = $1`,h=`
select f.id as family_id, app.payment_reference(f.name, f.id) as reference,
       b.payee_name, b.sort_code, b.account_number, b.iban
  from family f left join studio_bank_details b on b.studio_id = f.studio_id
 where f.deleted_at is null and f.id in (select app.guardian_family_ids())
 order by f.created_at limit 1`,y=`
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`,b=`
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`,x=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`,g=`
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`,N=`
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.deleted_at is null and d.ended_at is null and (d.ends_on is null or d.ends_on >= current_date)
 order by f.name`,w=`
insert into family_discount (family_id, kind, amount, reason, note, starts_on, ends_on)
values ($1, $2, $3, $4, nullif($5, ''), coalesce($6::date, current_date), $7::date) returning id`,j=`
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
  from lines order by number, ord, created_at`,$=`
select family_name as family, round(current_minor / 100.0, 2) as "0-30 days", round(d31_60 / 100.0, 2) as "31-60 days",
       round(d61_90 / 100.0, 2) as "61-90 days", round(d90_plus / 100.0, 2) as "90+ days", round(total / 100.0, 2) as total
  from app.aged_debt((select id from studio where app.is_admin(id) order by name limit 1)) a
 where $1::text is null or $1::text = any(${a("a.family_id")})`,v=`
select i.number, f.name as family, i.status::text as status, i.issued_on, i.due_on,
       round(i.subtotal_minor / 100.0, 2) as subtotal, round(i.discount_minor / 100.0, 2) as discount,
       round(i.total_minor / 100.0, 2) as total, round(i.paid_minor / 100.0, 2) as paid,
       round((i.total_minor - i.paid_minor) / 100.0, 2) as outstanding, t.name as term
  from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
 where i.deleted_at is null order by i.number`,E=`
select p.succeeded_at::date as date, f.name as family, i.number as invoice, p.method,
       round(p.amount_minor / 100.0, 2) as amount,
       case when p.failure_code is not null then 'failed' when p.succeeded_at is null then 'pending' else 'succeeded' end as status,
       p.provider_ref as reference
  from payment p join family f on f.id = p.family_id left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null order by p.created_at`,I=`
select coalesce(b.mode, 'family') as mode, b.guardian_a, b.guardian_b, b.percent_a
  from family f left join family_billing b on b.family_id = f.id
 where f.id = $1`,S=`
select id, full_name from guardian where family_id = $1 and deleted_at is null order by is_primary desc, full_name`,T=`
select s.id, s.first_name, x.guardian_id
  from student s left join family_billing_child x on x.student_id = s.id
 where s.family_id = $1 and s.deleted_at is null order by s.date_of_birth`,k=`
select ac.id, ac.created_at, ac.family_id, f.name as family_name, s.first_name as child,
       app.session_label(ac.session_id) as session_label, ac.amount_minor, ac.status
  from absence_credit ac join family f on f.id = ac.family_id join student s on s.id = ac.student_id
 order by ac.created_at desc limit 50`,A=`
select id, absence_credit, absence_credit_fixed_minor, makeup_policy from studio where id in (select app.studio_ids()) limit 1`,R=`
update studio set absence_credit = $2, absence_credit_fixed_minor = $3 where id = $1 returning id`;e.s(["ABSENCE_CREDITS",0,k,"ABSENCE_CREDIT_SETTING",0,A,"ADD_FAMILY_CREDIT",0,"select app.add_family_credit($1, $2, $3) as id","ADD_FAMILY_DISCOUNT",0,w,"AGED_DEBT_EXPORT",0,$,"BANK_DETAILS",0,p,"BILLING_LINES",0,"select * from app.billing_lines($1, $2::date, $3::uuid[])","BILLING_RUNS",0,g,"BILLING_SKIPPED",0,"select * from app.billing_skipped($1, $2::date)","BILLING_TERMS",0,"select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc","CLASS_LOCATIONS",0,"select c.id, l.name as location from class c join location l on l.id = c.location_id where c.deleted_at is null","CREATE_BILLING_RUN",0,"select app.create_billing_run($1, $2::date, $3::date, $4::uuid[], $5) as id","CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","DISCARD_BILLING_RUN",0,"select app.discard_billing_run($1)","DISCOUNT_RULES",0,"select id, kind, from_nth, percent, enabled from discount_rule order by kind desc","END_FAMILY_DISCOUNT",0,"select app.end_family_discount($1)","FAMILY_ACCOUNT",0,m,"FAMILY_BILLABLE",0,o,"FAMILY_BILLING",0,I,"FAMILY_BILLING_CHILDREN",0,T,"FAMILY_DISCOUNTS",0,N,"FAMILY_GUARDIANS",0,S,"FAMILY_OPTIONS",0,r,"FAMILY_PICK",0,"select id, name from family where deleted_at is null and not is_prospect order by name","FAMILY_STATEMENT",0,_,"INVOICE",0,s,"INVOICES",0,n,"INVOICES_EXPORT",0,v,"INVOICE_CREDIT_NOTES",0,c,"INVOICE_ITEMS",0,d,"INVOICE_PAYMENTS",0,l,"ISSUE_BILLING_RUN",0,"select app.issue_billing_run($1) as n","ISSUE_CREDIT_NOTE",0,"select app.issue_credit_note($1, $2, $3, $4) as id","ISSUE_INVOICE",0,"select app.issue_invoice($1)","MY_PAYMENT_INFO",0,h,"NOTIFY_DUE",0,"select app.notify_invoices_due() as n","OVERDUE_FAMILIES",0,u,"PAYMENTS_EXPORT",0,E,"PRIMARY_GUARDIAN",0,b,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3, $4)","REMINDER_PREVIEW",0,f,"REMINDER_TEMPLATE",0,y,"SEND_DIRECT",0,x,"SEND_REMINDERS",0,"select app.send_payment_reminders($1::uuid[], $2, $3) as sent","SET_ABSENCE_CREDIT",0,R,"SET_BANK_DETAILS",0,"select app.set_bank_details($1, $2, $3, $4, $5)","SET_DISCOUNT_RULE",0,"update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id","SET_FAMILY_BILLING",0,"select app.set_family_billing($1, $2, $3, $4, $5, $6::jsonb)","SUMMARY",0,i,"UPCOMING_COSTS",0,"select * from app.upcoming_costs($1::uuid)","VOID_INVOICE",0,"select app.void_invoice($1, $2)","XERO_EXPORT",0,j])},21011,e=>{"use strict";let i=`
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
    where deleted_at is null and status in ('issued','part_paid')) as unpaid_invoices`,a=`
select c.id, c.name,
       c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity, 0))::int as pct
  from class c
 where c.deleted_at is null
   and app.class_enrolled_count(c.id) >= greatest(c.capacity - 1, 1)
 order by waiting desc, pct desc`,t=`
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
 order by t.starts_on desc limit 1`;e.s(["ATTENTION_CAPACITY",0,a,"ATTENTION_LAPSED",0,n,"ATTENTION_MESSAGES",0,c,"ATTENTION_PAYMENTS",0,i,"ATTENTION_REQUESTS",0,m,"ATTENTION_TRIALS",0,t,"CANCEL_SESSION",0,"select app.cancel_session($1, $2, $3, $4)","COVER_CLASHES",0,"select session_id, class_name, starts_at, ends_at, location, needs_travel from app.cover_clashes($1, $2)","COVER_SESSION",0,"select app.cover_session($1, $2, $3, $4, $5, $6)","MOVE_SESSION",0,"select app.move_session($1, $2::timestamptz, $3, $4, $5)","RECENT_ENROLMENTS",0,l,"RECENT_MESSAGES",0,o,"ROOM_OPTIONS",0,_,"SESSIONS_BETWEEN",0,s,"SESSION_BY_ID",0,d,"SESSION_FAMILIES",0,u,"SESSION_HANDOVER",0,"select handover_note from class_session where id = $1","STAFF_OPTIONS",0,"select id, display_name from staff_member where status = 'active' and deleted_at is null order by display_name","TERM_NOW",0,f,"UPCOMING_TRIALS",0,r])}]);