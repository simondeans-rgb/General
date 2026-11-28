(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,85721,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(22016),i=e.i(54616),n=e.i(12598),r=e.i(77326),l=e.i(17658),d=e.i(13927),o=e.i(30224),c=e.i(31502),_=e.i(29074),m=e.i(11772),u=e.i(75379),p=e.i(45060);let f=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],h={proposed:["Waiting","caution"],confirmed:["Confirmed","positive"],declined:["Not returning","muted"],released:["Released","muted"],placed:["Placed","positive"],waitlisted:["Waiting list","caution"]},$={draft:"Not sent yet",open:"Families replying",closed:"Replies closed",published:"Published",cancelled:"Cancelled"},E=e=>{let t=new Date;return t.setDate(t.getDate()+e),t.toISOString().slice(0,10)};function x(e){let{session:t}=(0,c.useSession)(),s=(0,n.useQueryClient)();return(0,i.useMutation)({mutationFn:async e=>(await (0,o.runAs)(t,t=>t(e.sql,e.params)))[0],onSuccess:t=>{s.invalidateQueries({queryKey:["db"]}),e?.(t)}})}function w(){let e=(0,d.useRows)(["term-tabs"],_.TERM_TABS),i=[...e.data??[]].sort((e,t)=>(0,u.toDateInput)(e.starts_on).localeCompare((0,u.toDateInput)(t.starts_on))),n=i.find(e=>e.current)??i.find(e=>e.classes>0),r=i.filter(e=>n&&(0,u.toDateInput)(e.starts_on)>(0,u.toDateInput)(n.starts_on)),[o,c]=s.useState(""),p=r.find(e=>e.id===o)??r[0],[f,h]=s.useState(E(21)),$=x();return e.isLoading?(0,t.jsx)(l.Skeleton,{className:"h-24"}):n?(0,t.jsxs)("section",{"aria-labelledby":"start-h",children:[(0,t.jsx)(l.SectionHead,{id:"start-h",title:"Start re-enrolment",meta:`From ${n.name}`}),0===r.length?(0,t.jsxs)("p",{className:"py-3 text-[0.9062rem] text-ink-2",children:["Add the next term first, in ",(0,t.jsx)(a.default,{href:"/studio",className:"font-semibold text-accent-text underline",children:"School settings"}),", with its dates and breaks. Its classes can be copied from ",n.name," in the next step."]}):(0,t.jsxs)("div",{className:"grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end",children:[(0,t.jsx)(l.Field,{label:"Into",htmlFor:"re-to",hint:p&&0===p.classes?`${n.name}’s classes are copied in first`:void 0,children:(0,t.jsx)(l.Select,{id:"re-to",value:p?.id??"",onChange:e=>c(e.target.value),children:r.map(e=>(0,t.jsxs)("option",{value:e.id,children:[e.name," · from ",(0,u.dateShort)(e.starts_on)]},e.id))})}),(0,t.jsx)(l.Field,{label:"Families reply by",htmlFor:"re-by",hint:"Unanswered places are released after this date",children:(0,t.jsx)(l.Input,{id:"re-by",type:"date",value:f,min:E(0),max:p?(0,u.toDateInput)(p.starts_on):void 0,onChange:e=>h(e.target.value)})}),(0,t.jsx)(l.Button,{variant:"primary",loading:$.isPending,disabled:!p||!f,onClick:()=>$.mutate({sql:m.START_REENROLMENT,params:[n.id,p.id,f]}),children:"Propose next classes"}),null!=$.error&&(0,t.jsx)("div",{className:"sm:col-span-3",children:(0,t.jsx)(l.ErrorState,{error:$.error})})]})]}):(0,t.jsx)(l.EmptyState,{title:"No term to re-enrol from",body:"Add a term with classes first."})}function y({r:e}){let i=(0,d.useRows)(["reenrol-offers",e.id],m.OFFERS,[e.id]),n=(0,d.useRows)(["reenrol-classes",e.to_term_id,e.id],m.NEXT_TERM_CLASSES,[e.to_term_id,e.id]),[r,o]=s.useState(null),c=x(),_=(e,t,s)=>c.mutate({sql:e,params:t},{onSuccess:e=>s&&o(s(e))}),E="draft"===e.status||"open"===e.status||"closed"===e.status,w=new Date(e.respond_by)<new Date(new Date().toDateString()),S=s.useMemo(()=>{let e=new Map;for(let t of i.data??[])e.set(t.from_class??"No class",[...e.get(t.from_class??"No class")??[],t]);return[...e.entries()]},[i.data]);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("section",{"aria-labelledby":"round-h",children:[(0,t.jsx)(l.SectionHead,{id:"round-h",title:`${e.from_term} → ${e.to_term}`,meta:`${$[e.status]} \xb7 reply by ${(0,u.dateLong)(e.respond_by)}`}),r&&(0,t.jsx)("div",{role:"status",className:"py-3",children:(0,t.jsx)(l.StatusLine,{live:!1,title:r})}),null!=c.error&&(0,t.jsx)("div",{className:"py-3",children:(0,t.jsx)(l.ErrorState,{error:c.error})}),(0,t.jsx)("dl",{className:"grid grid-cols-3 gap-4 py-4 sm:grid-cols-6",children:[["Children",e.offers],["Confirmed",e.confirmed+e.placed],["Waiting to reply",e.proposed],["Not returning",e.declined+e.released],["Waiting list",e.waitlisted],["No class proposed",e.no_class]].map(([e,s])=>(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"label",children:e}),(0,t.jsx)("dd",{className:(0,p.cn)("stat-number mt-1 text-[1.625rem] leading-none","No class proposed"===e&&s>0&&"text-caution"),children:s})]},e))}),(0,t.jsxs)("div",{className:"flex flex-wrap gap-2",children:["draft"===e.status&&(0,t.jsx)(l.Button,{variant:"primary",onClick:()=>_(m.OPEN_REENROLMENT,[e.id],e=>`Sent to ${e.n} famil${1===e.n?"y":"ies"}, one message each. They reply from their home screen.`),children:"Send to families"}),"open"===e.status&&(w?(0,t.jsx)(l.Button,{variant:"primary",onClick:()=>_(m.CLOSE_REENROLMENT,[e.id,!1],e=>`Replies closed. ${e.n} unanswered place${1===e.n?"":"s"} released.`),children:"Close replies and release unanswered places"}):(0,t.jsx)(l.Button,{onClick:()=>_(m.CLOSE_REENROLMENT,[e.id,!0],e=>`Replies closed early. ${e.n} unanswered place${1===e.n?"":"s"} released.`),children:"Close replies early"})),"closed"===e.status&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(l.Button,{variant:"primary",onClick:()=>_(m.PUBLISH_REENROLMENT,[e.id],t=>{let s=t.r;return`${e.to_term} is published: ${s.placed} placed, ${s.waitlisted} on waiting lists, ${s.offered} place${1===s.offered?"":"s"} offered from waiting lists.`}),children:["Publish ",e.to_term," places"]}),(0,t.jsx)(l.Button,{onClick:()=>_(m.REOPEN_REENROLMENT,[e.id,null],()=>"Replies reopened. Released places are proposed again."),children:"Reopen replies"})]}),E&&(0,t.jsx)(l.Button,{variant:"ghost",onClick:()=>_(m.CANCEL_REENROLMENT,[e.id],()=>"Cancelled. Nobody was enrolled; you can start again."),children:"Cancel re-enrolment"})]}),"published"===e.status&&(0,t.jsxs)("p",{className:"pt-3 text-[0.875rem] text-ink-2",children:["Next term’s enrolments are made. Change a place from ",(0,t.jsx)(a.default,{href:"/classes",className:"font-semibold text-accent-text underline",children:"Classes"}),"."]})]}),(0,t.jsxs)("div",{className:"grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",children:[(0,t.jsxs)("section",{"aria-labelledby":"offers-h",className:"min-w-0",children:[(0,t.jsx)(l.SectionHead,{id:"offers-h",title:"Each child’s next class",meta:E?"Change any proposal":void 0}),i.isLoading&&(0,t.jsx)(l.Skeleton,{className:"h-40"}),S.map(([s,a])=>(0,t.jsxs)("div",{className:"mt-4",children:[(0,t.jsxs)("h3",{className:"text-[0.875rem] font-semibold",children:["From ",s," ",(0,t.jsxs)("span",{className:"font-normal text-ink-3",children:["· ",a.length]})]}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:a.map(s=>(0,t.jsxs)("li",{className:"grid gap-x-3 gap-y-1 py-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_auto] sm:items-center",children:[(0,t.jsxs)("span",{className:"min-w-0 text-[0.875rem]",children:[(0,t.jsx)("b",{className:"font-semibold",children:s.student}),null!=s.age&&(0,t.jsxs)("span",{className:"text-ink-3",children:[" · age ",s.age," next term"]}),(0,t.jsx)("span",{className:"block text-[0.7812rem] text-ink-3",children:m.REASON[s.reason]??s.reason})]}),E&&!["placed","waitlisted"].includes(s.status)?(0,t.jsxs)(l.Select,{"aria-label":`Next class for ${s.student}`,className:"h-9 text-[0.8125rem]",value:s.class_id??"",onChange:e=>_(m.SET_REENROLMENT_CLASS,[s.id,e.target.value||null]),children:[(0,t.jsx)("option",{value:"",children:"No class"}),n.data?.map(e=>(0,t.jsxs)("option",{value:e.id,children:[e.name," · ",f[e.day_of_week]," ",e.start_time.slice(0,5)]},e.id))]}):(0,t.jsx)("span",{className:"text-[0.875rem]",children:s.class_name??"No class"}),(0,t.jsxs)("span",{className:"flex items-center gap-1.5",children:[(0,t.jsx)(l.Word,{tone:h[s.status]?.[1]??"muted",children:h[s.status]?.[0]??s.status}),E&&"draft"!==e.status&&s.class_id&&"confirmed"!==s.status&&(0,t.jsx)(l.Button,{size:"sm",variant:"ghost","aria-label":`Confirm for ${s.student}`,onClick:()=>_(m.ANSWER_REENROLMENT,[s.id,!0]),children:"Confirm"})]})]},s.id))})]},s))]}),(0,t.jsxs)("aside",{className:"min-w-0 space-y-10",children:[(0,t.jsxs)("section",{"aria-labelledby":"load-h",children:[(0,t.jsx)(l.SectionHead,{id:"load-h",title:`${e.to_term} classes`,meta:"Confirmed of places"}),(0,t.jsx)("ul",{className:"divide-y divide-line text-[0.875rem]",children:n.data?.map(e=>(0,t.jsxs)("li",{className:"flex items-center gap-3 py-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("b",{className:"font-semibold",children:e.name}),(0,t.jsxs)("span",{className:"block text-[0.7812rem] text-ink-3",children:[f[e.day_of_week]," ",e.start_time.slice(0,5),null!=e.age_min?` \xb7 ages ${e.age_min}${null!=e.age_max?`–${e.age_max}`:"+"}`:""," · ",e.proposed," proposed"]})]}),(0,t.jsx)(l.Beats,{value:Math.min(e.confirmed,e.capacity),max:e.capacity,label:`${e.confirmed} of ${e.capacity} places confirmed`}),(0,t.jsxs)("span",{className:(0,p.cn)("w-14 text-right tnum",e.proposed>e.capacity&&"font-semibold text-caution"),children:[e.confirmed,"/",e.capacity]})]},e.id))})]}),E&&(0,t.jsx)(b,{})]})]})]})}function b(){let e=(0,d.useRows)(["levels-progression"],m.LEVELS),s=x();return(0,t.jsxs)("section",{"aria-labelledby":"prog-h",children:[(0,t.jsx)(l.SectionHead,{id:"prog-h",title:"Moves up to"}),(0,t.jsx)("p",{className:"py-2 text-[0.8125rem] text-ink-3",children:"Used for new proposals. Blank means the next level in your list."}),null!=s.error&&(0,t.jsx)(l.ErrorState,{error:s.error}),(0,t.jsx)("ul",{className:"divide-y divide-line text-[0.875rem]",children:e.data?.map(a=>(0,t.jsxs)("li",{className:"grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 py-1.5",children:[(0,t.jsx)("span",{children:a.name}),(0,t.jsxs)(l.Select,{"aria-label":`${a.name} moves up to`,className:"h-9 text-[0.8125rem]",value:a.next_level_id??"",onChange:e=>s.mutate({sql:m.SET_NEXT_LEVEL,params:[a.id,e.target.value||null]}),children:[(0,t.jsx)("option",{value:"",children:"Next in the list"}),e.data.filter(e=>e.id!==a.id).map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))]})]},a.id))})]})}e.s(["default",0,function(){let e=(0,d.useRows)(["reenrol-rounds"],m.ROUNDS),a=(e.data??[]).filter(e=>"cancelled"!==e.status&&"published"!==e.status),i=(e.data??[]).filter(e=>"cancelled"===e.status||"published"===e.status),[n,o]=s.useState(null),c=(e.data??[]).find(e=>e.id===n)??a[0];return(0,t.jsx)(r.Shell,{title:"Re-enrolment",subtitle:"Move children up and confirm next term’s places",allow:["owner","admin"],help:(0,t.jsx)(t.Fragment,{children:"Proposals follow each level’s “moves up to” and the age range of the next term’s classes. Families reply from their home screen. Nobody is enrolled until you publish: before that you can change proposals, close or reopen replies, or cancel."}),children:(0,t.jsxs)("div",{className:"mx-auto max-w-[1080px] space-y-10",children:[e.isLoading&&(0,t.jsx)(l.Skeleton,{className:"h-32"}),null!=e.error&&(0,t.jsx)(l.ErrorState,{error:e.error,onRetry:()=>e.refetch()}),e.data&&0===a.length&&(0,t.jsx)(w,{}),c&&(0,t.jsx)(y,{r:c}),i.length>0&&(0,t.jsxs)("section",{"aria-labelledby":"past-h",children:[(0,t.jsx)(l.SectionHead,{id:"past-h",title:"Earlier"}),(0,t.jsx)("ul",{className:"divide-y divide-line text-[0.875rem]",children:i.map(e=>(0,t.jsx)("li",{children:(0,t.jsxs)("button",{className:"flex min-h-[48px] w-full items-center gap-3 py-2 text-left hover:bg-surface-2/60","aria-current":c?.id===e.id||void 0,onClick:()=>o(e.id),children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("b",{children:[e.from_term," → ",e.to_term]}),(0,t.jsxs)("span",{className:"block text-[0.8125rem] text-ink-3",children:[e.placed," placed · ",e.waitlisted," waiting list · ",e.released+e.declined," not returning"]})]}),(0,t.jsx)(l.Word,{tone:"published"===e.status?"positive":"muted",children:$[e.status]})]})},e.id))})]})]})})}])},48848,e=>{e.v(t=>Promise.all(["static/chunks/03n1mi23bfzdq.js"].map(t=>e.l(t))).then(()=>t(39726)))},56166,e=>{e.v(t=>Promise.all(["static/chunks/1sfki9bryb301.js"].map(t=>e.l(t))).then(()=>t(52715)))},29074,e=>{"use strict";let t=`
select c.id, c.name, ds.name as style, ds.colour, lv.name as level,
       st.display_name as teacher, l.name as location, r.name as room,
       c.day_of_week, c.start_time, c.duration_min, c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity,0))::int as pct,
       c.age_min, c.age_max, c.price_minor, c.trials_enabled, c.term_id, c.pricing::text as pricing,
       (select count(*)::int from class_session cs
         where cs.class_id = c.id and cs.deleted_at is null
           and cs.starts_at > now() and cs.status = 'scheduled') as sessions_left
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
  left join level lv on lv.id = c.level_id
  left join staff_member st on st.id = c.teacher_id
  left join location l on l.id = c.location_id
  left join room r on r.id = c.room_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`,s=`
select s.id, e.id as enrolment_id, s.first_name, s.last_name, s.date_of_birth, e.started_on,
       -- A planned move (UR-52): leaving on ended_on, or joining on started_on.
       case when e.moved_to is not null then e.ended_on end as leaving_on,
       (select c2.name from enrolment e2 join class c2 on c2.id = e2.class_id where e2.id = e.moved_to) as leaving_to,
       case when e.moved_from is not null and e.started_on > current_date then e.started_on end as joining_on,
       f.name as family_name, f.id as family_id,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record ar
          join class_session cs on cs.id = ar.session_id and cs.class_id = e.class_id
         where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct
  from enrolment e
  join student s on s.id = e.student_id
  join family f on f.id = s.family_id
 where e.class_id = $1 and e.status = 'active' and e.deleted_at is null
 order by s.last_name, s.first_name`,a=`
select w.id, (row_number() over (order by w.position))::int as position, w.status, w.offer_expires_at,
       s.first_name, s.last_name, s.date_of_birth, f.name as family_name
  from waitlist_entry w
  join student s on s.id = w.student_id
  join family f on f.id = s.family_id
 where w.class_id = $1 and w.status in ('waiting','offered') and w.deleted_at is null
 order by w.position`,i=`
select
  count(*)::int as total,
  count(*) filter (where stage in ('trial_booked','trial_attended','trial_missed','enrolled'))::int as booked,
  count(*) filter (where stage in ('trial_attended','enrolled'))::int as attended,
  count(*) filter (where stage = 'enrolled')::int as converted,
  count(*) filter (where stage = 'closed_lost')::int as lost
from enquiry where deleted_at is null`,n=`
select e.id, e.stage, e.contact_name, e.contact_email, e.contact_phone,
       e.child_name, e.child_dob, e.source, e.next_action_on, e.created_at,
       c.name as class_name, ds.colour, e.interest_class_id, e.student_id, e.closed_reason,
       exists (select 1 from trial t where t.enquiry_id = e.id and t.deleted_at is null
                 and t.status in ('requested','booked')) as live_trial,
       (select cs.starts_at from trial t join class_session cs on cs.id = t.session_id
         where t.enquiry_id = e.id and t.deleted_at is null and t.status in ('requested','booked')
         order by cs.starts_at limit 1) as trial_starts_at
  from enquiry e
  left join class c on c.id = e.interest_class_id
  left join dance_style ds on ds.id = c.dance_style_id
 where e.deleted_at is null
 order by
   array_position(array['trial_attended','follow_up','trial_booked','trial_requested',
                        'enquiry','trial_missed','enrolled','closed_lost']::text[], e.stage::text),
   e.next_action_on nulls last`,r=`
select l.id, l.name, l.address_line1, l.city, l.postcode,
       (select count(*)::int from room r where r.location_id = l.id and r.deleted_at is null) as rooms,
       (select count(*)::int from class c where c.location_id = l.id and c.deleted_at is null) as classes
  from location l where l.deleted_at is null order by l.name`,l=`select r.id, r.name, r.location_id, r.capacity, l.name as location
                            from room r join location l on l.id = r.location_id
                           where r.deleted_at is null order by l.name, r.name`,d=`select id, display_name from staff_member
                           where deleted_at is null and status = 'active' order by display_name`,o=`select id, name, starts_on, ends_on from term
                            where deleted_at is null and status <> 'archived'
                            order by starts_on desc`,c=`
insert into class (studio_id, term_id, dance_style_id, level_id, location_id, room_id,
                   teacher_id, name, day_of_week, start_time, duration_min, capacity,
                   age_min, age_max, price_minor, pricing, trials_enabled, waitlist_enabled,
                   visibility, trial_price_minor, assistant_id, prerequisites,
                   description, trial_needs_approval)
select t.studio_id, t.id, $2, $3, $4, $5, $6, $7, $8, $9::time, $10, $11,
       $12, $13, $14, $18::pricing_model, $15, $16, $17::class_visibility,
       $19, $20, nullif(btrim($21), ''), nullif(btrim($22), ''), $23
  from term t where t.id = $1
returning id`,_=`
update class set dance_style_id = $2, level_id = $3, location_id = $4, room_id = $5,
                 teacher_id = $6, name = $7, day_of_week = $8, start_time = $9::time,
                 duration_min = $10, capacity = $11, age_min = $12, age_max = $13,
                 price_minor = $14, trials_enabled = $15, waitlist_enabled = $16,
                 visibility = $17::class_visibility, pricing = $18::pricing_model,
                 trial_price_minor = $19, assistant_id = $20, prerequisites = nullif(btrim($21), ''),
                 description = nullif(btrim($22), ''), trial_needs_approval = $23, updated_at = now()
 where id = $1
returning id`,m=`
select c.id, c.name, c.term_id, c.dance_style_id, c.level_id, c.location_id, c.room_id,
       c.teacher_id, c.day_of_week, c.start_time, c.duration_min, c.capacity,
       c.age_min, c.age_max, c.price_minor, c.trials_enabled, c.waitlist_enabled,
       c.visibility::text as visibility, c.pricing::text as pricing, c.trial_price_minor,
       c.assistant_id, c.prerequisites, c.description, c.trial_needs_approval,
       (select count(*)::int from class_session cs
         where cs.class_id = c.id and cs.deleted_at is null and cs.starts_at > now()) as future_sessions
  from class c where c.id = $1 and c.deleted_at is null`,u=`
insert into enrolment (studio_id, class_id, student_id, status, started_on, note, created_by)
select c.studio_id, c.id, $2, 'active', coalesce($3::date, current_date),
       nullif(btrim($4),''), auth.uid()
  from class c where c.id = $1
returning id`,p=`
insert into waitlist_entry (studio_id, class_id, student_id, status, position, note)
select c.studio_id, c.id, $2, 'waiting', 0, nullif(btrim($3),'')
  from class c where c.id = $1
returning id, position`,f=`
select c.id, c.name, app.class_enrolled_count(c.id) as enrolled, c.capacity
  from class c where c.deleted_at is null order by c.day_of_week, c.start_time`,h=`
select c.id, c.name, c.day_of_week, c.start_time, c.age_min, c.age_max, c.price_minor, c.pricing::text as pricing,
       c.capacity, app.class_free_places(c.id) as free
  from class c
 where c.deleted_at is null and c.id <> $1
   and c.term_id in (select t.id from term t where t.deleted_at is null and t.status <> 'archived')
 order by c.day_of_week, c.start_time`,$=`
select e.id as enrolment_id, c.id as class_id, c.name, c.day_of_week, c.start_time, c.price_minor, c.pricing::text as pricing,
       case when e.moved_to is not null then e.ended_on end as leaving_on,
       case when e.moved_from is not null and e.started_on > current_date then e.started_on end as joining_on
  from enrolment e join class c on c.id = e.class_id
 where e.student_id = $1 and e.status = 'active' and e.deleted_at is null
 order by c.day_of_week, c.start_time`,E=`
select t.id, t.status::text as status, cs.starts_at, c.name as class_name,
       case when s.id is null then null
            else s.first_name || ' ' || s.last_name end as student_name,
       s.id as student_id, e.contact_name, t.enquiry_id
  from trial t
  join class c on c.id = t.class_id
  left join class_session cs on cs.id = t.session_id
  left join student s on s.id = t.student_id
  left join enquiry e on e.id = t.enquiry_id
 where t.deleted_at is null
 order by (t.status in ('requested','booked')) desc, cs.starts_at nulls last`,x=`
select cs.id, cs.starts_at
  from class_session cs
 where cs.class_id = $1 and cs.deleted_at is null
   and cs.starts_at > now() and cs.status = 'scheduled'
 order by cs.starts_at limit 8`,w=`
select s.id, s.first_name, s.last_name, s.date_of_birth, f.name as family_name
  from student s
  join family f on f.id = s.family_id
 where s.deleted_at is null and s.left_on is null
   and not exists (select 1 from enrolment e
                    where e.student_id = s.id and e.class_id = $1
                      and e.status = 'active' and e.deleted_at is null)
 order by s.last_name, s.first_name`,y=`
select app.class_free_places($1) as free, app.class_live_offers($1) as offers,
       (select waitlist_offer_days from studio s join class c on c.studio_id = s.id where c.id = $1) as offer_days`,b=`
select n.id, n.body, n.created_at, u.full_name as author
  from enquiry_note n left join user_account u on u.id = n.created_by
 where n.enquiry_id = $1 and n.deleted_at is null
 order by n.created_at desc, n.id`,S=`
update enquiry set stage = $2::enquiry_stage, updated_at = now(),
       next_action_on = $3::date
 where id = $1
returning id`,g=`
select t.id, t.name, t.starts_on, t.ends_on, current_date between t.starts_on and t.ends_on as current,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes
  from term t where t.deleted_at is null and t.status <> 'archived' order by t.starts_on desc`,N=`
insert into enquiry (studio_id, contact_name, contact_phone, contact_email, child_name, child_dob,
                     interest_class_id, source, next_action_on, created_by)
select s.id, btrim($1), nullif(btrim($2), ''), nullif(lower(btrim($3)), ''), nullif(btrim($4), ''), $5::date,
       $6::uuid, $7, coalesce($8::date, current_date + 2), auth.uid()
  from studio s where s.deleted_at is null and app.is_admin(s.id) limit 1
returning id`,j=`
update class set level_note = nullif(btrim($2), ''), what_to_bring = nullif(btrim($3), ''), updated_at = now()
 where id = $1 returning id`;e.s(["ACCEPT_PLACE",0,"select app.accept_waitlist_place($1) as enrolment_id","ADD_ENQUIRY_NOTE",0,"select app.add_enquiry_note($1, $2, $3::date) as id","BOOK_TRIAL",0,"select app.book_trial($1, $2, $3::jsonb) as id","CANCEL_MOVE",0,"select app.cancel_class_move($1)","CLASSES",0,t,"CLASS_CANDIDATES",0,"select * from app.class_candidates($1) where not enrolled and not waiting","CLASS_FOR_EDIT",0,m,"CLASS_FREE",0,y,"CLASS_OPTIONS",0,f,"CLASS_PUBLIC_EXTRA",0,"select level_note, what_to_bring from class where id = $1","CLASS_ROSTER",0,s,"CLASS_SESSIONS_AHEAD",0,x,"CLASS_WAITLIST",0,a,"CLOSE_ENQUIRY",0,"select app.close_enquiry($1, $2) as ok","CONVERT_TRIAL",0,"select app.convert_trial($1, $2) as enrolment_id","COPY_CLASSES",0,"select app.copy_classes($1::uuid[], $2, $3) as r","CREATE_CLASS",0,c,"CREATE_ENQUIRY",0,N,"DECLINE_PLACE",0,"select app.decline_waitlist_place($1, $2) as ok","ENQUIRIES",0,n,"ENQUIRY_NOTES",0,b,"ENROL",0,u,"ENROLLABLE_STUDENTS",0,w,"FUNNEL",0,i,"GENERATE_SESSIONS",0,"select app.generate_class_sessions($1) as made","JOIN_WAITLIST",0,p,"LEVELS",0,"select id, name from level where deleted_at is null order by sort_order, name","LOCATIONS",0,r,"MOVE_OPTIONS",0,h,"MOVE_PREVIEW",0,"select * from app.move_preview($1, $2, $3::date)","OFFER_PLACE",0,"select app.offer_waitlist_place($1, $2) as ok","OPEN_TERMS",0,o,"RESCHEDULE_CLASS",0,"select app.reschedule_class($1) as net","ROOMS",0,l,"SET_CLASS_PUBLIC_EXTRA",0,j,"SET_ENQUIRY_FOLLOW_UP",0,"select app.set_enquiry_follow_up($1, $2::date) as ok","SET_ENQUIRY_STAGE",0,S,"STUDENT_PLACES",0,$,"STYLES",0,"select id, name, colour from dance_style where deleted_at is null order by name","TEACHERS",0,d,"TERM_TABS",0,g,"TRANSFER",0,"select app.transfer_enrolment($1, $2, $3, $4::date) as id","TRIALS",0,E,"TRIAL_OUTCOME",0,"select app.record_trial_outcome($1, $2, $3) as ok","UPDATE_CLASS",0,_,"WITHDRAW",0,"select app.withdraw_enrolment($1, $2) as offered"])},11772,e=>{"use strict";let t=`
select x.id, x.board, x.title, x.exam_on, x.venue, x.entries_close_on, x.fee_minor, x.event_id, x.bill_on_entry,
       count(e.*) filter (where e.status <> 'withdrawn')::int as entries,
       count(e.*) filter (where e.result is not null)::int as results,
       count(e.*) filter (where e.status <> 'withdrawn' and e.invoice_id is null and e.fee_minor > 0)::int as unbilled
  from exam_session x left join exam_entry e on e.session_id = x.id
 where x.event_id = $1 and x.deleted_at is null group by x.id`,s=`
select r.id, r.from_term_id, r.to_term_id, ft.name as from_term, tt.name as to_term, tt.starts_on as to_starts, r.respond_by, r.status,
       count(o.*)::int as offers,
       count(o.*) filter (where o.status = 'confirmed')::int as confirmed,
       count(o.*) filter (where o.status = 'declined')::int as declined,
       count(o.*) filter (where o.status = 'proposed')::int as proposed,
       count(o.*) filter (where o.status = 'released')::int as released,
       count(o.*) filter (where o.status = 'placed')::int as placed,
       count(o.*) filter (where o.status = 'waitlisted')::int as waitlisted,
       count(o.*) filter (where o.class_id is null and o.status not in ('placed', 'waitlisted'))::int as no_class
  from reenrolment_round r join term ft on ft.id = r.from_term_id join term tt on tt.id = r.to_term_id
  left join reenrolment_offer o on o.round_id = r.id
 group by r.id, ft.name, tt.name, tt.starts_on order by r.created_at desc`,a=`
select o.id, o.student_id, s.first_name || ' ' || s.last_name as student,
       extract(year from age(t.starts_on, s.date_of_birth))::int as age,
       fc.name as from_class, o.class_id, c.name as class_name, o.reason, o.status, o.answered_at
  from reenrolment_offer o join reenrolment_round r on r.id = o.round_id join term t on t.id = r.to_term_id
  join student s on s.id = o.student_id
  left join class fc on fc.id = o.from_class_id left join class c on c.id = o.class_id
 where o.round_id = $1
 order by fc.day_of_week, fc.start_time, fc.name, s.first_name, s.last_name`,i=`
select c.id, c.name, l.name as level, c.age_min, c.age_max, c.capacity, c.day_of_week, c.start_time::text,
       (select count(*)::int from reenrolment_offer o where o.round_id = $2 and o.class_id = c.id and o.status not in ('declined', 'released')) as proposed,
       (select count(*)::int from reenrolment_offer o where o.round_id = $2 and o.class_id = c.id and o.status in ('confirmed', 'placed')) as confirmed
  from class c left join level l on l.id = c.level_id
 where c.term_id = $1 and c.deleted_at is null and c.pricing <> 'drop_in'
 order by c.day_of_week, c.start_time, c.name`,n=`insert into event_routine (event_id, class_id, title, music, duration_sec, position)
  select $1, $2, btrim($3), nullif(btrim($4), ''), $5, coalesce((select max(position) + 1 from event_routine where event_id = $1 and deleted_at is null), 1) returning id`,r=`update event_routine set title = btrim($2), class_id = $3, music = nullif(btrim($4), ''), duration_sec = $5,
  notes = nullif(btrim($6), ''), updated_at = now() where id = $1 returning id`,l=`
select s.id as student_id, s.first_name || ' ' || s.last_name as name,
       exists (select 1 from routine_dancer d where d.routine_id = $2 and d.student_id = s.id) as in_item
  from event_participant p join student s on s.id = p.student_id and s.deleted_at is null
 where p.event_id = $1 and p.status = 'confirmed' and p.deleted_at is null order by s.first_name, s.last_name`,d=`insert into event_helper_slot (studio_id, event_id, role, needed, routine_id)
  select e.studio_id, e.id, btrim($3), $4, $2 from studio_event e where e.id = $1 returning id`,o=`select i.id, i.name, r.title as routine, i.price_minor, i.charge_families
  from costume_item i left join event_routine r on r.id = i.routine_id where i.event_id = $1 and i.deleted_at is null order by r.position nulls first, i.name`;e.s(["ADD_COSTUME_ITEM",0,"insert into costume_item (event_id, routine_id, name, price_minor, charge_families) values ($1, $2, btrim($3), $4, $5) returning id","ADD_DANCER",0,"insert into routine_dancer (routine_id, student_id) values ($1, $2)","ADD_ITEM",0,n,"ANSWER_REENROLMENT",0,"select app.answer_reenrolment($1, $2) as r","BILL_COSTUMES",0,"select app.bill_costumes($1) as n","CANCEL_REENROLMENT",0,"select app.cancel_reenrolment($1)","CHILD_UNIFORM",0,"select * from app.child_uniform($1)","CLASS_UNIFORM",0,"select uniform, uniform_url from class where id = $1","CLOSE_REENROLMENT",0,"select app.close_reenrolment($1, $2) as n","CONFIRM_EXAM_ENTRY",0,"select app.confirm_exam_entry($1, $2)","COSTUME_BUDGET",0,"select * from app.costume_budget($1)","COSTUME_ITEMS",0,o,"EXAM_CERTIFICATE",0,"select app.exam_certificate($1, $2)","FAMILY_REENROLMENT",0,"select * from app.family_reenrolment()","ITEM_DANCERS",0,l,"ITEM_SLOT",0,d,"LEVELS",0,"select id, name, sort_order, next_level_id from level where deleted_at is null order by sort_order, name","LICENCES",0,"select * from app.licence_tracker($1)","NEXT_TERM_CLASSES",0,i,"OFFERS",0,a,"OPEN_REENROLMENT",0,"select app.open_reenrolment($1) as n","PUBLISH_REENROLMENT",0,"select app.publish_reenrolment($1) as r","REASON",0,{moves_up:"Moves up",stays:"Same class",by_age:"By age",office:"Chosen by the office",none:"No class proposed"},"REMOVE_DANCER",0,"delete from routine_dancer where routine_id = $1 and student_id = $2","REOPEN_REENROLMENT",0,"select app.reopen_reenrolment($1, $2::date)","ROUNDS",0,s,"RUNNING_ORDER",0,"select * from app.running_order($1)","SESSION_FOR_EVENT",0,t,"SET_CLASS_UNIFORM",0,"select app.set_class_uniform($1, $2::text[], $3)","SET_COSTUME_BUDGET",0,"update studio_event set costume_budget_minor = $2, updated_at = now() where id = $1 returning id","SET_LICENCE",0,"select app.set_licence($1, $2, $3, $4, $5, $6, $7::date, $8::date, $9, $10)","SET_LICENCE_ALL",0,"select app.set_licence_needed_all($1, $2) as n","SET_NEXT_LEVEL",0,"update level set next_level_id = $2, updated_at = now() where id = $1 returning id","SET_REENROLMENT_CLASS",0,"select app.set_reenrolment_class($1, $2)","STAGE_WORD",0,{withdrawn:"Withdrawn",entered:"Entered",confirmed:"Confirmed",sat:"Sat",result:"Result"},"START_REENROLMENT",0,"select app.start_reenrolment($1, $2, $3::date) as id","UPDATE_COSTUME_ITEM",0,"update costume_item set price_minor = $2, charge_families = $3 where id = $1 returning id","UPDATE_EXAM_ENTRY",0,"select app.update_exam_entry($1, $2, $3, $4::timestamptz)","UPDATE_ITEM",0,r,"clockTime",0,e=>null==e?"":`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`,"examStage",0,function(e){return"withdrawn"===e.status?"withdrawn":e.result?"result":"sat"===e.status?"sat":e.confirmed_at?"confirmed":"entered"},"parseClock",0,function(e){let t=e.trim();if(!t)return null;let s=t.match(/^(\d+)\s*[:m.]\s*(\d{1,2})\s*s?$/);return s?60*Number(s[1])+Number(s[2]):/^\d+$/.test(t)?Number(t):null}])}]);