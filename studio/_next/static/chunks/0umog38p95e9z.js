(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,95468,e=>{"use strict";let i=(0,e.i(75254).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,i],95468)},78583,e=>{"use strict";let i=(0,e.i(75254).default)("file-text",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);e.s(["FileText",0,i],78583)},78894,e=>{"use strict";let i=(0,e.i(75254).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);e.s(["AlertTriangle",0,i],78894)},26639,e=>{"use strict";var i=e.i(43476),t=e.i(71645),a=e.i(61659),s=e.i(95468),n=e.i(78894),d=e.i(78583),l=e.i(77326),r=e.i(13927),c=e.i(50293);let o=(0,e.i(75254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);var m=e.i(45060),u=e.i(17658),_=e.i(8199),p=e.i(75379);let f={paid:{label:"Paid",tone:"positive"},issued:{label:"Due",tone:"caution"},part_paid:{label:"Part paid",tone:"caution"},draft:{label:"Draft",tone:"neutral"},void:{label:"Void",tone:"neutral"},refunded:{label:"Refunded",tone:"info"}},h={card:"Card",direct_debit:"Direct debit",bank_transfer:"Bank transfer",cash:"Cash",credit:"Credit from the studio",account:"Credit on your account"};function y({i:e}){let[a,s]=t.useState(!1),n=(0,r.useRows)(["invoice-items",e.id],c.INVOICE_ITEMS,[e.id],{enabled:a}),d=(0,r.useRows)(["invoice-payments",e.id],c.INVOICE_PAYMENTS,[e.id],{enabled:a}),l=f[e.status]??f.draft,_=Number(e.total_minor)-Number(e.paid_minor);return(0,i.jsxs)("li",{children:[(0,i.jsxs)("button",{onClick:()=>s(e=>!e),"aria-expanded":a,className:"flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2",children:[(0,i.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,i.jsxs)("span",{className:"flex items-center gap-2",children:[(0,i.jsx)("span",{className:"tnum font-medium",children:e.number}),(0,i.jsx)(u.Badge,{tone:l.tone,children:l.label})]}),(0,i.jsxs)("span",{className:"mt-0.5 block text-[12.5px] text-ink-2",children:["Issued ",(0,p.dateShort)(e.issued_on)," · due ",(0,p.dateShort)(e.due_on)]})]}),(0,i.jsxs)("span",{className:"shrink-0 text-right",children:[(0,i.jsx)("span",{className:"tnum block font-medium",children:(0,p.money)(e.total_minor)}),_>0&&"void"!==e.status&&(0,i.jsxs)("span",{className:"tnum block text-[12px] text-caution",children:[(0,p.money)(_)," left"]})]}),(0,i.jsx)(o,{className:(0,m.cn)("size-4 shrink-0 text-ink-3 transition-transform",a&&"rotate-180"),"aria-hidden":!0})]}),a&&(0,i.jsxs)("div",{className:"space-y-3 bg-surface-2/60 px-4 pb-4 pt-1",children:[n.isLoading&&(0,i.jsx)(u.Skeleton,{className:"h-10"}),(0,i.jsx)("ul",{className:"space-y-1.5 text-sm",children:n.data?.map(e=>(0,i.jsxs)("li",{className:"flex gap-3",children:[(0,i.jsx)("span",{className:"min-w-0 flex-1",children:e.description}),(0,i.jsx)("span",{className:"tnum",children:(0,p.money)(e.total_minor)})]},e.id))}),d.data&&d.data.length>0&&(0,i.jsx)("ul",{className:"space-y-1.5 border-t border-line pt-3 text-[13px] text-ink-2",children:d.data.map(e=>(0,i.jsxs)("li",{className:"flex gap-3",children:[(0,i.jsxs)("span",{className:"flex-1",children:[e.succeeded_at?`${h[e.method]??e.method}, ${(0,p.dateShort)(e.succeeded_at)}`:`${h[e.method]??e.method} did not go through`,Number(e.refunded_minor)>0&&` \xb7 ${(0,p.money)(e.refunded_minor)} refunded`]}),(0,i.jsx)("span",{className:(0,m.cn)("tnum",!e.succeeded_at&&"line-through"),children:(0,p.money)(e.amount_minor)})]},e.id))})]})]})}e.s(["default",0,function(){let e=(0,r.useRow)(["my-balance"],_.MY_BALANCE),t=(0,r.useRows)(["my-invoices"],_.MY_INVOICES),c=e.data&&Number(e.data.balance_minor)>0;return(0,i.jsx)(l.Shell,{title:"Payments",allow:["guardian"],children:(0,i.jsxs)("div",{className:"mx-auto max-w-lg space-y-4",children:[(0,i.jsxs)(u.Card,{children:[(0,i.jsxs)("div",{className:"p-4",children:[e.isLoading&&(0,i.jsx)(u.Skeleton,{className:"h-12"}),e.data&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("p",{className:"text-[13px] text-ink-3",children:"Balance"}),(0,i.jsx)("p",{className:`tnum mt-0.5 text-[30px] font-semibold leading-none tracking-[-0.02em] ${c?"text-caution":"text-positive"}`,children:c?(0,p.money)(e.data.balance_minor):"£0.00"}),(0,i.jsx)("p",{className:"mt-2 flex items-center gap-1.5 text-sm text-ink-2",children:c?(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.AlertTriangle,{className:"size-4 text-caution","aria-hidden":!0}),e.data.failed>0?"A card payment did not go through.":`${e.data.unpaid} invoice${1===e.data.unpaid?"":"s"} outstanding.`]}):(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(s.CheckCircle2,{className:"size-4 text-positive","aria-hidden":!0})," Everything is paid."]})})]})]}),(0,i.jsxs)("div",{className:"flex items-start gap-2.5 border-t border-line bg-surface-2 p-3",children:[(0,i.jsx)(a.CreditCard,{className:"mt-0.5 size-4 shrink-0 text-ink-3","aria-hidden":!0}),(0,i.jsx)("p",{className:"text-[13px] text-ink-2",children:"Card payment in the app opens once the studio connects its payment provider. Until then, pay the studio by bank transfer or in person; they record it and it shows here straight away."})]})]}),(0,i.jsxs)(u.Card,{children:[(0,i.jsx)(u.CardHeader,{title:"Invoices"}),t.isLoading&&(0,i.jsx)("div",{className:"space-y-2 p-4",children:[0,1].map(e=>(0,i.jsx)(u.Skeleton,{className:"h-12"},e))}),t.error&&(0,i.jsx)("div",{className:"p-4",children:(0,i.jsx)(u.ErrorState,{error:t.error})}),t.data?.length===0&&(0,i.jsx)(u.EmptyState,{icon:(0,i.jsx)(d.FileText,{className:"size-5"}),title:"No invoices yet",body:"They will appear here as the studio issues them."}),(0,i.jsx)("ul",{className:"divide-y divide-line",children:t.data?.map(e=>(0,i.jsx)(y,{i:e},e.id))})]})]})})}],26639)},50293,e=>{"use strict";let i=`
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
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       f.id as family_id, f.name as family_name,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue,
       exists (select 1 from payment p where p.invoice_id = i.id and p.deleted_at is null
                and p.failure_code is not null and p.succeeded_at is null)
         and i.status in ('issued','part_paid') as failed,
       (select string_agg(description, ', ' order by created_at) from invoice_item it
         where it.invoice_id = i.id and it.deleted_at is null) as lines
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null
 order by (i.status = 'draft') desc,
          (i.status in ('issued','part_paid','refunded')) desc,
          i.due_on desc nulls last, i.number desc`,a=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       i.subtotal_minor, i.discount_minor, i.note, i.void_reason,
       f.id as family_id, f.name as family_name, f.balance_minor as family_balance_minor,
       app.family_available_credit(f.id) as available_credit_minor,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue
  from invoice i join family f on f.id = i.family_id
 where i.id = $1`,s=`
select it.id, it.kind, it.description, it.quantity, it.unit_minor, it.discount_minor, it.total_minor,
       s.first_name as student_name
  from invoice_item it left join student s on s.id = it.student_id
 where it.invoice_id = $1 and it.deleted_at is null
 order by it.created_at`,n=`
select id, amount_minor, refunded_minor, method, provider, failure_code, succeeded_at, created_at, note
  from payment where invoice_id = $1 and deleted_at is null
 order by created_at`,d=`
select f.id, f.name, f.balance_minor,
       (select g.full_name from guardian g
         where g.family_id = f.id and g.deleted_at is null order by g.is_primary desc limit 1) as guardian
  from family f where f.deleted_at is null order by f.name`,l=`
select s.id as student_id, s.first_name as student_name, c.id as class_id, c.name as class_name,
       coalesce(e.price_minor, c.price_minor) as price_minor, c.pricing
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where s.family_id = $1 and e.status = 'active' and e.deleted_at is null and c.deleted_at is null
 order by s.first_name, c.name`,r=`
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`,c=`
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`,o=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`;e.s(["CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","FAMILY_BILLABLE",0,l,"FAMILY_OPTIONS",0,d,"INVOICE",0,a,"INVOICES",0,t,"INVOICE_ITEMS",0,s,"INVOICE_PAYMENTS",0,n,"ISSUE_INVOICE",0,"select app.issue_invoice($1)","PRIMARY_GUARDIAN",0,c,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3)","REMINDER_TEMPLATE",0,r,"SEND_DIRECT",0,o,"SUMMARY",0,i,"VOID_INVOICE",0,"select app.void_invoice($1, $2)"])},8199,e=>{"use strict";let i=`
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
 order by cs.starts_at`,t=`
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
 order by s.date_of_birth`,a=`
select f.id, f.name, f.balance_minor,
       (select count(*)::int from invoice i
         where i.family_id = f.id and i.deleted_at is null and i.status in ('issued','part_paid')) as unpaid,
       (select count(*)::int from payment p
         where p.family_id = f.id and p.deleted_at is null
           and p.failure_code is not null and p.succeeded_at is null) as failed
  from family f where f.deleted_at is null`,s=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor
  from invoice i where i.deleted_at is null
 order by i.issued_on desc nulls last limit 8`,n=`
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
returning id`;e.s(["MY_BALANCE",0,a,"MY_CHILDREN",0,t,"MY_INVOICES",0,s,"MY_MESSAGES",0,n,"MY_SCHEDULE",0,i,"REPORT_ABSENCE",0,d])}]);