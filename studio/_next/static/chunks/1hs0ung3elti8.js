(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,95468,e=>{"use strict";let s=(0,e.i(75254).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,s],95468)},61659,e=>{"use strict";let s=(0,e.i(75254).default)("credit-card",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]]);e.s(["CreditCard",0,s],61659)},79624,e=>{"use strict";var s=e.i(43476),a=e.i(71645),t=e.i(89853),i=e.i(61659);let d=(0,e.i(75254).default)("megaphone",[["path",{d:"M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",key:"q8bfy3"}],["path",{d:"M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14",key:"1853fq"}],["path",{d:"M8 6v8",key:"15ugcq"}]]);var n=e.i(95468),l=e.i(77326),c=e.i(13927),r=e.i(31502),m=e.i(17658),o=e.i(8199),h=e.i(75379);e.s(["default",0,function(){let{session:e}=(0,r.useSession)(),[u]=a.useMemo(()=>(0,h.dayRange)(0),[]),x=a.useMemo(()=>{let e=new Date(u);return e.setDate(e.getDate()+14),e.toISOString()},[u]),_=(0,c.useRows)(["my-schedule",u],o.MY_SCHEDULE,[u,x]),p=(0,c.useRow)(["my-balance"],o.MY_BALANCE),f=(0,c.useRows)(["my-messages"],o.MY_MESSAGES),j=(_.data??[]).filter(e=>"cancelled"!==e.status),y=j[0],g=j.filter(e=>"Today"===(0,h.relativeDay)(e.starts_at)),N=p.data&&Number(p.data.balance_minor)>0;return(0,s.jsx)(l.Shell,{title:`${(0,h.greeting)()}, ${e?.name.split(" ")[0]??""}`,allow:["guardian"],children:(0,s.jsxs)("div",{className:"mx-auto max-w-lg space-y-4",children:[_.isLoading&&(0,s.jsx)(m.Card,{className:"p-4",children:(0,s.jsx)(m.Skeleton,{className:"h-24"})}),_.error&&(0,s.jsx)(m.ErrorState,{error:_.error,onRetry:()=>_.refetch()}),y&&(0,s.jsxs)(m.Card,{className:"overflow-hidden",children:[(0,s.jsxs)("div",{className:"bg-accent px-4 py-3 text-white",children:[(0,s.jsx)("p",{className:"text-[12px] font-medium uppercase tracking-[0.06em] text-white/75",children:"Today"===(0,h.relativeDay)(y.starts_at)?"Next up today":"Next class"}),(0,s.jsxs)("p",{className:"mt-0.5 text-[19px] font-semibold tracking-tight",children:[y.child," · ",y.name]}),(0,s.jsxs)("p",{className:"mt-0.5 text-white/85",children:[(0,h.relativeDay)(y.starts_at)," at ",(0,h.time)(y.starts_at)]})]}),(0,s.jsxs)("dl",{className:"grid grid-cols-2 gap-x-4 gap-y-2 p-4 text-sm",children:[y.teacher&&(0,s.jsxs)("div",{children:[(0,s.jsx)("dt",{className:"text-ink-3",children:"Teacher"}),(0,s.jsx)("dd",{className:"font-medium",children:y.teacher})]}),y.room&&(0,s.jsxs)("div",{children:[(0,s.jsx)("dt",{className:"text-ink-3",children:"Where"}),(0,s.jsx)("dd",{className:"font-medium",children:[y.location,y.room].filter(Boolean).join(" · ")})]})]})]}),!y&&!_.isLoading&&(0,s.jsx)(m.Card,{children:(0,s.jsx)(m.EmptyState,{icon:(0,s.jsx)(t.CalendarDays,{className:"size-5"}),title:"No classes coming up",body:"When your child is enrolled in a class, it will appear here."})}),g.length>1&&(0,s.jsxs)(m.Card,{children:[(0,s.jsx)(m.CardHeader,{title:"Also today"}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:g.slice(1).map(e=>(0,s.jsxs)("li",{className:"flex items-center gap-3 px-4 py-3",children:[(0,s.jsx)("span",{className:"tnum w-14 shrink-0 font-semibold",children:(0,h.time)(e.starts_at)}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsx)("span",{className:"block truncate font-medium",children:e.name}),(0,s.jsxs)("span",{className:"block truncate text-[13px] text-ink-2",children:[e.child,e.room?` \xb7 ${e.room}`:""]})]})]},`${e.id}-${e.student_id}`))})]}),(0,s.jsxs)(m.Card,{children:[(0,s.jsx)(m.CardHeader,{title:"Payments"}),(0,s.jsxs)("div",{className:"p-4",children:[p.isLoading&&(0,s.jsx)(m.Skeleton,{className:"h-10"}),p.data&&(N?(0,s.jsxs)("div",{className:"flex items-center gap-3",children:[(0,s.jsx)("span",{className:"grid size-9 shrink-0 place-items-center rounded-full bg-caution-soft text-caution","aria-hidden":!0,children:(0,s.jsx)(i.CreditCard,{className:"size-4"})}),(0,s.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("p",{className:"font-medium",children:[(0,h.money)(p.data.balance_minor)," due"]}),(0,s.jsx)("p",{className:"text-[13px] text-ink-2",children:p.data.failed>0?"A card payment did not go through.":`${p.data.unpaid} invoice${1===p.data.unpaid?"":"s"} outstanding.`})]}),(0,s.jsx)(m.Badge,{tone:"neutral",children:"Card payments coming soon"})]}):(0,s.jsxs)("p",{className:"flex items-center gap-2 text-sm text-positive",children:[(0,s.jsx)(n.CheckCircle2,{className:"size-4","aria-hidden":!0})," Everything is paid. Nothing due."]}))]})]}),(0,s.jsxs)(m.Card,{children:[(0,s.jsx)(m.CardHeader,{title:"From the studio"}),f.isLoading&&(0,s.jsx)("div",{className:"space-y-2 p-4",children:[0,1].map(e=>(0,s.jsx)(m.Skeleton,{className:"h-12"},e))}),f.data?.length===0&&(0,s.jsx)(m.EmptyState,{title:"No messages yet"}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:f.data?.map(e=>(0,s.jsx)("li",{className:"px-4 py-3",children:(0,s.jsxs)("div",{className:"flex items-start gap-2",children:[(0,s.jsx)("span",{className:"mt-0.5 shrink-0 text-ink-3","aria-hidden":!0,children:(0,s.jsx)(d,{className:"size-3.5"})}),(0,s.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,s.jsx)("p",{className:"font-medium",children:e.subject}),(0,s.jsx)("p",{className:"mt-0.5 text-[13px] leading-relaxed text-ink-2",children:e.body}),(0,s.jsxs)("p",{className:"mt-1 text-[12px] text-ink-3",children:[e.class_name?`${e.class_name} \xb7 `:"",(0,h.relativeDay)(e.sent_at)]})]})]})},e.id))})]})]})})}],79624)},8199,e=>{"use strict";let s=`
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour,
       coalesce(sr.name, r.name) as room, l.name as location,
       coalesce(cover.display_name, st.display_name) as teacher,
       s.first_name as child, s.id as student_id
  from class_session cs
  join class c on c.id = cs.class_id
  join enrolment e on e.class_id = c.id and e.status = 'active' and e.deleted_at is null
  join student s on s.id = e.student_id
  left join dance_style ds on ds.id = c.dance_style_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by cs.starts_at`,a=`
select s.id, s.first_name, s.last_name, s.date_of_birth,
       (select string_agg(c.name, ', ' order by c.name) from enrolment e
          join class c on c.id = e.class_id
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null) as class_names,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record ar where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       (select m.allergies from medical_record m
         where m.student_id = s.id and m.deleted_at is null) as allergies,
       (select cr.granted from consent_record cr
         where cr.student_id = s.id and cr.kind = 'photography' and cr.deleted_at is null) as photo_consent
  from student s
 where s.deleted_at is null
 order by s.date_of_birth`,t=`
select f.id, f.name, f.balance_minor,
       (select count(*)::int from invoice i
         where i.family_id = f.id and i.deleted_at is null and i.status in ('issued','part_paid')) as unpaid,
       (select count(*)::int from payment p
         where p.family_id = f.id and p.deleted_at is null
           and p.failure_code is not null and p.succeeded_at is null) as failed
  from family f where f.deleted_at is null`,i=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at, c.name as class_name
  from communication cm
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
 order by cm.sent_at desc limit 8`,d=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select s.studio_id, 'direct', 'in_app', s.family_id,
       'Absence: ' || s.first_name || ' — ' || to_char($2::timestamptz, 'FMDay DD Mon'),
       $3, auth.uid()
  from student s where s.id = $1
returning id`;e.s(["MY_BALANCE",0,t,"MY_CHILDREN",0,a,"MY_MESSAGES",0,i,"MY_SCHEDULE",0,s,"REPORT_ABSENCE",0,d])}]);