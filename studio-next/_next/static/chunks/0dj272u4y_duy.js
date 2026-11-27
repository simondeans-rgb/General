(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,48241,e=>{"use strict";let i=(0,e.i(75254).default)("calendar-off",[["path",{d:"M4.2 4.2A2 2 0 0 0 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.82-1.18",key:"16swn3"}],["path",{d:"M21 15.5V6a2 2 0 0 0-2-2H9.5",key:"yhw86o"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M3 10h7",key:"1wap6i"}],["path",{d:"M21 10h-5.5",key:"quycpq"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);e.s(["CalendarOff",0,i],48241)},67240,e=>{"use strict";let i=(0,e.i(75254).default)("rotate-ccw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);e.s(["RotateCcw",0,i],67240)},63238,e=>{"use strict";var i=e.i(43476),t=e.i(71645),s=e.i(54616),a=e.i(12598),n=e.i(17658),d=e.i(85351),r=e.i(13927),l=e.i(30224),o=e.i(31502),c=e.i(50293),_=e.i(45060),m=e.i(75379);e.s(["AbsenceCreditSettings",0,function(){let{session:e}=(0,o.useSession)(),_=(0,a.useQueryClient)(),m=(0,r.useRows)(["absence-credit-setting"],c.ABSENCE_CREDIT_SETTING).data?.[0],u=e?.role==="owner",[f,p]=t.useState(null),[h,b]=t.useState(null),y=(0,s.useMutation)({mutationFn:i=>(0,l.runAs)(e,e=>e(c.SET_ABSENCE_CREDIT,[m.id,i.mode,i.fixed])),onSuccess:()=>{_.invalidateQueries({queryKey:["db"]}),p(null),b(null)}});if(!m)return null;let $=f??m.absence_credit,w=h??String(m.absence_credit_fixed_minor/100),g=Math.max(0,Math.round(100*Number(w))),E=$!==m.absence_credit||"fixed"===$&&g!==m.absence_credit_fixed_minor,S="cancelled_and_absence"===m.makeup_policy;return(0,i.jsxs)(d.SettingsSection,{children:[(0,i.jsx)(d.SettingsHead,{title:"Credit for reported absences",subtitle:"When a family tells you in advance that a child will miss a class"}),(0,i.jsxs)("div",{className:"space-y-3 pt-3 text-[0.9062rem]",children:[(0,i.jsxs)("label",{className:"grid gap-2 sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-center",children:[(0,i.jsxs)("span",{children:[(0,i.jsx)("span",{className:"font-semibold",children:"Credit on their account"}),(0,i.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:"Once per child per class, for term and monthly classes. It is taken back if they withdraw the report before the class."})]}),(0,i.jsxs)(n.Select,{"aria-label":"Credit for reported absences",value:$,disabled:!u,onChange:e=>p(e.target.value),children:[(0,i.jsx)("option",{value:"off",children:"No credit"}),(0,i.jsx)("option",{value:"session",children:"The class’s per-session price"}),(0,i.jsx)("option",{value:"fixed",children:"A fixed amount"})]})]}),"fixed"===$&&(0,i.jsxs)("label",{className:"flex flex-wrap items-center gap-2 text-[0.8125rem]",children:["Amount £",(0,i.jsx)(n.Input,{"aria-label":"Fixed credit in pounds",className:"w-24",type:"number",min:0,step:.5,value:w,disabled:!u,onChange:e=>b(e.target.value)}),(0,i.jsx)("span",{className:"text-ink-3",children:"never more than the class’s own price"})]}),S&&$===m.absence_credit&&"off"===$&&(0,i.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Make-ups are offered for reported absences (Registers settings). Choosing credit here replaces them: families get one or the other."}),S&&"off"!==$&&$!==m.absence_credit&&(0,i.jsx)("p",{className:"text-[0.8125rem] text-caution",children:"Saving switches make-ups for reported absences off. Make-ups after a cancellation stay as they are."}),null!=y.error&&(0,i.jsx)(n.ErrorState,{error:y.error}),u?(0,i.jsx)(n.Button,{size:"sm",variant:"primary",disabled:!E,loading:y.isPending,onClick:()=>y.mutate({mode:$,fixed:"fixed"===$?g:m.absence_credit_fixed_minor}),children:"Save"}):(0,i.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Only the owner can change this."})]})]})},"AbsenceCredits",0,function(){let e=(0,r.useRows)(["absence-credits"],c.ABSENCE_CREDITS);if(!e.data?.length)return null;let t=e.data.filter(e=>"active"===e.status).reduce((e,i)=>e+Number(i.amount_minor),0);return(0,i.jsxs)("section",{"aria-labelledby":"absence-credit-h",className:"mt-10 min-w-0",children:[(0,i.jsxs)("div",{className:"flex items-baseline gap-3 border-b-2 border-ink pb-2",children:[(0,i.jsx)("h2",{id:"absence-credit-h",className:"section-title flex-1",children:"Credit for reported absences"}),(0,i.jsxs)("span",{className:"tnum text-[0.8125rem] text-ink-3",children:[(0,m.money)(t)," given, latest 50"]})]}),(0,i.jsx)("ul",{className:"divide-y divide-line",children:e.data.map(e=>(0,i.jsxs)("li",{className:"grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-2.5 text-[0.875rem]",children:[(0,i.jsxs)("span",{className:"min-w-0",children:[(0,i.jsxs)("span",{className:"block truncate font-semibold",children:[e.family_name," · ",e.child]}),(0,i.jsxs)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:[e.session_label," · reported ",(0,m.dateShort)(e.created_at)]})]}),(0,i.jsxs)("span",{className:"text-right",children:[(0,i.jsx)("span",{className:(0,_.cn)("tnum block","reversed"===e.status&&"text-ink-3 line-through"),children:(0,m.money)(e.amount_minor)}),"reversed"===e.status&&(0,i.jsx)("span",{className:"block text-[0.75rem] text-ink-3",children:"Taken back"})]})]},e.id))})]})}])},85351,e=>{"use strict";var i=e.i(43476),t=e.i(71645),s=e.i(54616),a=e.i(12598),n=e.i(7233),d=e.i(37727),r=e.i(17658),l=e.i(45060),o=e.i(13927),c=e.i(30224),_=e.i(31502),m=e.i(36261);function u({className:e,children:t,...s}){return(0,i.jsx)("section",{...s,className:(0,l.cn)("min-w-0",e),children:t})}function f({title:e,subtitle:t,action:s,className:a}){return(0,i.jsxs)("div",{className:(0,l.cn)("border-b-2 border-ink pb-2",a),children:[(0,i.jsxs)("div",{className:"flex min-h-9 items-center gap-3",children:[(0,i.jsx)("h2",{className:"section-title min-w-0 flex-1",children:e}),s]}),t&&(0,i.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:t})]})}function p(){let{session:e}=(0,_.useSession)(),i=(0,a.useQueryClient)();return(0,s.useMutation)({mutationFn:i=>(0,c.runAs)(e,e=>e(i.sql,i.params)),onSuccess:()=>i.invalidateQueries({queryKey:["db"]})})}function h(){let e=(0,o.useRows)(["skill-publish"],m.SKILL_PUBLISH),t=p(),s=e.data?.[0];return s?(0,i.jsxs)("fieldset",{className:"pt-4",children:[(0,i.jsx)("legend",{className:"text-[0.875rem] font-semibold",children:"When families see a new level"}),null!=t.error&&(0,i.jsx)("div",{className:"pt-2",children:(0,i.jsx)(r.ErrorState,{error:t.error})}),[["with_share","When the teacher shares it","Levels wait with the class feedback until the teacher taps Share. A mistake can be put right first."],["immediate","Straight away","Each level is visible to the family as soon as it is set."]].map(([e,a,n])=>(0,i.jsxs)("label",{className:"flex min-h-11 cursor-pointer items-start gap-3 py-1",children:[(0,i.jsx)("input",{type:"radio",name:"skill-publish",className:"mt-1 size-4 accent-[var(--color-accent)]",checked:s.skill_publish===e,onChange:()=>t.mutate({sql:m.SET_SKILL_PUBLISH,params:[s.id,e]})}),(0,i.jsxs)("span",{children:[(0,i.jsx)("span",{className:"block text-[0.9375rem] font-medium",children:a}),(0,i.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:n})]})]},e))]}):null}e.s(["ChipSettings",0,function(){let e=(0,o.useRows)(["chips"],m.CHIPS),s=p(),[a,l]=t.useState({});return(0,i.jsxs)(u,{children:[(0,i.jsx)(f,{title:"Feedback phrases",subtitle:"What teachers tap after class. Keep them short and kind. Teachers can keep their own set for a class."}),null!=s.error&&(0,i.jsx)("div",{className:"pt-3",children:(0,i.jsx)(r.ErrorState,{error:s.error})}),["standard","under_8"].map(t=>(0,i.jsxs)("div",{className:"pt-4",children:["under_8"===t&&(0,i.jsxs)("p",{className:"mb-1 text-[0.875rem] font-semibold",children:["For classes up to age 8 ",(0,i.jsx)("span",{className:"font-normal text-ink-3",children:"· simple words, a sticker each"})]}),(0,i.jsx)("div",{className:"grid gap-x-10 gap-y-6 pt-2 sm:grid-cols-2",children:["going_well","work_on"].map(o=>{let c=`${t}-${o}`;return(0,i.jsxs)("div",{children:[(0,i.jsx)("p",{className:"mb-2 font-semibold",children:"going_well"===o?"Going well":"To work on"}),(0,i.jsx)("div",{className:"flex flex-wrap gap-1.5",children:e.data?.filter(e=>e.kind===o&&(e.band??"standard")===t).map(e=>(0,i.jsxs)("span",{className:"inline-flex items-center gap-0.5 rounded-[var(--radius-md)] border border-line-strong bg-surface py-0.5 pl-2.5 pr-0.5 text-[0.875rem]",children:[e.sticker&&(0,i.jsx)("span",{"aria-hidden":!0,className:"mr-1",children:e.sticker}),e.label,(0,i.jsx)("button",{"aria-label":`Remove ${e.label}`,onClick:()=>s.mutate({sql:m.REMOVE_CHIP,params:[e.id]}),className:"grid size-8 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical",children:(0,i.jsx)(d.X,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),(0,i.jsxs)("form",{className:"mt-2 flex gap-1.5",onSubmit:e=>{e.preventDefault();let i=(a[c]??"").trim();i&&(s.mutate("standard"===t?{sql:m.ADD_CHIP,params:[o,i]}:{sql:m.ADD_YOUNG_CHIP,params:[o,i,""]}),l(e=>({...e,[c]:""})))},children:[(0,i.jsx)(r.Input,{"aria-label":`Add a ${"going_well"===o?"going well":"to work on"} phrase${"under_8"===t?" for young classes":""}`,placeholder:"Add a phrase",maxLength:40,value:a[c]??"",onChange:e=>l(i=>({...i,[c]:e.target.value})),className:"h-9 text-[0.875rem]"}),(0,i.jsx)(r.Button,{size:"sm",type:"submit","aria-label":"Add",children:(0,i.jsx)(n.Plus,{className:"size-4","aria-hidden":!0})})]})]},o)})})]},t))]})},"FrameworkSettings",0,function(){let e=(0,o.useRows)(["frameworks"],m.FRAMEWORKS),s=p(),[a,l]=t.useState({});return(0,i.jsxs)(u,{children:[(0,i.jsx)(f,{title:"Skills teachers assess",subtitle:"One list per style. Teachers set each child’s level; families and students see it."}),(0,i.jsx)(h,{}),e.isLoading&&(0,i.jsx)("div",{className:"pt-3",children:(0,i.jsx)(r.Skeleton,{className:"h-24"})}),null!=s.error&&(0,i.jsx)("div",{className:"pt-3",children:(0,i.jsx)(r.ErrorState,{error:s.error})}),(0,i.jsx)("div",{className:"grid gap-x-10 gap-y-6 pt-4 sm:grid-cols-2",children:e.data?.map(e=>(0,i.jsxs)("div",{className:"min-w-0",children:[(0,i.jsx)("p",{className:"border-b border-line pb-1.5 font-semibold",children:e.style??e.name}),(0,i.jsx)("ul",{className:"divide-y divide-line",children:e.skills.map(e=>(0,i.jsxs)("li",{className:"group flex min-h-10 items-center gap-1 text-[0.875rem]",children:[(0,i.jsx)("input",{"aria-label":`Rename ${e.name}`,defaultValue:e.name,onBlur:i=>i.target.value.trim()&&i.target.value.trim()!==e.name&&s.mutate({sql:m.RENAME_SKILL,params:[e.id,i.target.value]}),className:"min-w-0 flex-1 rounded-[var(--radius-sm)] bg-transparent px-1 py-1.5 hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-line"}),(0,i.jsx)("button",{"aria-label":`Remove ${e.name}`,onClick:()=>s.mutate({sql:m.REMOVE_SKILL,params:[e.id]}),className:"grid size-9 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical",children:(0,i.jsx)(d.X,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),(0,i.jsxs)("form",{className:"mt-2 flex gap-1.5",onSubmit:i=>{i.preventDefault();let t=(a[e.id]??"").trim();t&&(s.mutate({sql:m.ADD_SKILL,params:[e.id,t]}),l(i=>({...i,[e.id]:""})))},children:[(0,i.jsx)(r.Input,{"aria-label":`Add a skill to ${e.style}`,placeholder:"Add a skill",value:a[e.id]??"",onChange:i=>l(t=>({...t,[e.id]:i.target.value})),className:"h-9 text-[0.875rem]"}),(0,i.jsx)(r.Button,{size:"sm",type:"submit","aria-label":"Add",children:(0,i.jsx)(n.Plus,{className:"size-4","aria-hidden":!0})})]})]},e.id))})]})},"SettingsHead",0,f,"SettingsSection",0,u])},26138,e=>{"use strict";let i=`select studio_id, name, roles from app.my_schools()
  where roles && array['owner','admin','teacher']`,t=`select id, staff_timetable_sharing as sharing from studio
  where id in (select app.studio_ids()) and app.in_scope(id) order by name limit 1`;e.s(["MY_AGENDA",0,"select * from app.my_agenda($1::timestamptz, $2::timestamptz)","MY_STAFF_SCHOOLS",0,i,"MY_TRAVEL",0,"select app.my_agenda_travel() as minutes","SET_SHARING",0,"select app.set_timetable_sharing($1, $2)","SET_TRAVEL",0,"select app.set_agenda_travel($1::int)","SHARING",0,t])},50293,e=>{"use strict";let i=`
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
  coalesce((select -sum(balance_minor) from family where deleted_at is null and balance_minor < 0), 0)::bigint as credit_minor`,t=e=>`array(select distinct l.name from student s
   join enrolment e on e.student_id = s.id and e.status = 'active' and e.deleted_at is null
   join class c on c.id = e.class_id join location l on l.id = c.location_id
  where s.family_id = ${e} and s.deleted_at is null order by l.name)`,s=`coalesce(nullif(array(select distinct l.name from invoice_item it
   join class c on c.id = it.class_id join location l on l.id = c.location_id
  where it.invoice_id = i.id and it.deleted_at is null order by l.name), '{}'), ${t("f.id")})`,a=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       f.id as family_id, f.name as family_name,
       (select g.full_name from guardian g where g.id = i.billed_guardian_id) as billed_to,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue,
       exists (select 1 from payment p where p.invoice_id = i.id and p.deleted_at is null
                and p.failure_code is not null and p.succeeded_at is null)
         and i.status in ('issued','part_paid') as failed,
       (select string_agg(description, ', ' order by created_at) from invoice_item it
         where it.invoice_id = i.id and it.deleted_at is null) as lines,
       ${s} as locations
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null
 order by (i.status = 'draft') desc,
          (i.status in ('issued','part_paid','refunded')) desc,
          i.due_on desc nulls last, i.number desc`,n=`
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
 order by it.created_at`,r=`
select id, amount_minor, refunded_minor, method, provider, failure_code, succeeded_at, created_at, note, credit_note_id
  from payment where invoice_id = $1 and deleted_at is null
 order by created_at`,l=`
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
  from credit_note where invoice_id = $1 order by created_at`,_=`
select f.id, f.name, f.balance_minor, app.family_available_credit(f.id) as credit_minor,
       coalesce((select sum(total_minor - paid_minor) from invoice i where i.family_id = f.id and i.deleted_at is null
                  and i.status in ('issued','part_paid','refunded')), 0)::bigint as open_minor,
       app.payment_reference(f.name, f.id) as reference
  from family f where f.id = $1 and f.deleted_at is null`,m=`
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
       ${t("f.id")} as locations
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
 order by f.created_at limit 1`,b=`
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`,y=`
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`,$=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`,w=`
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`,g=`
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.deleted_at is null and d.ended_at is null and (d.ends_on is null or d.ends_on >= current_date)
 order by f.name`,E=`
insert into family_discount (family_id, kind, amount, reason, note, starts_on, ends_on)
values ($1, $2, $3, $4, nullif($5, ''), coalesce($6::date, current_date), $7::date) returning id`,S=`
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
  from lines order by number, ord, created_at`,v=`
select family_name as family, round(current_minor / 100.0, 2) as "0-30 days", round(d31_60 / 100.0, 2) as "31-60 days",
       round(d61_90 / 100.0, 2) as "61-90 days", round(d90_plus / 100.0, 2) as "90+ days", round(total / 100.0, 2) as total
  from app.aged_debt((select id from studio where app.is_admin(id) order by name limit 1)) a
 where $1::text is null or $1::text = any(${t("a.family_id")})`,x=`
select i.number, f.name as family, i.status::text as status, i.issued_on, i.due_on,
       round(i.subtotal_minor / 100.0, 2) as subtotal, round(i.discount_minor / 100.0, 2) as discount,
       round(i.total_minor / 100.0, 2) as total, round(i.paid_minor / 100.0, 2) as paid,
       round((i.total_minor - i.paid_minor) / 100.0, 2) as outstanding, t.name as term
  from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
 where i.deleted_at is null order by i.number`,k=`
select p.succeeded_at::date as date, f.name as family, i.number as invoice, p.method,
       round(p.amount_minor / 100.0, 2) as amount,
       case when p.failure_code is not null then 'failed' when p.succeeded_at is null then 'pending' else 'succeeded' end as status,
       p.provider_ref as reference
  from payment p join family f on f.id = p.family_id left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null order by p.created_at`,N=`
select coalesce(b.mode, 'family') as mode, b.guardian_a, b.guardian_b, b.percent_a
  from family f left join family_billing b on b.family_id = f.id
 where f.id = $1`,I=`
select id, full_name from guardian where family_id = $1 and deleted_at is null order by is_primary desc, full_name`,j=`
select s.id, s.first_name, x.guardian_id
  from student s left join family_billing_child x on x.student_id = s.id
 where s.family_id = $1 and s.deleted_at is null order by s.date_of_birth`,L=`
select ac.id, ac.created_at, ac.family_id, f.name as family_name, s.first_name as child,
       app.session_label(ac.session_id) as session_label, ac.amount_minor, ac.status
  from absence_credit ac join family f on f.id = ac.family_id join student s on s.id = ac.student_id
 order by ac.created_at desc limit 50`,T=`
select id, absence_credit, absence_credit_fixed_minor, makeup_policy from studio where id in (select app.studio_ids()) limit 1`,A=`
update studio set absence_credit = $2, absence_credit_fixed_minor = $3 where id = $1 returning id`;e.s(["ABSENCE_CREDITS",0,L,"ABSENCE_CREDIT_SETTING",0,T,"ADD_FAMILY_CREDIT",0,"select app.add_family_credit($1, $2, $3) as id","ADD_FAMILY_DISCOUNT",0,E,"AGED_DEBT_EXPORT",0,v,"BANK_DETAILS",0,p,"BILLING_LINES",0,"select * from app.billing_lines($1, $2::date, $3::uuid[])","BILLING_RUNS",0,w,"BILLING_SKIPPED",0,"select * from app.billing_skipped($1, $2::date)","BILLING_TERMS",0,"select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc","CLASS_LOCATIONS",0,"select c.id, l.name as location from class c join location l on l.id = c.location_id where c.deleted_at is null","CREATE_BILLING_RUN",0,"select app.create_billing_run($1, $2::date, $3::date, $4::uuid[], $5) as id","CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","DISCARD_BILLING_RUN",0,"select app.discard_billing_run($1)","DISCOUNT_RULES",0,"select id, kind, from_nth, percent, enabled from discount_rule order by kind desc","END_FAMILY_DISCOUNT",0,"select app.end_family_discount($1)","FAMILY_ACCOUNT",0,_,"FAMILY_BILLABLE",0,o,"FAMILY_BILLING",0,N,"FAMILY_BILLING_CHILDREN",0,j,"FAMILY_DISCOUNTS",0,g,"FAMILY_GUARDIANS",0,I,"FAMILY_OPTIONS",0,l,"FAMILY_PICK",0,"select id, name from family where deleted_at is null and not is_prospect order by name","FAMILY_STATEMENT",0,m,"INVOICE",0,n,"INVOICES",0,a,"INVOICES_EXPORT",0,x,"INVOICE_CREDIT_NOTES",0,c,"INVOICE_ITEMS",0,d,"INVOICE_PAYMENTS",0,r,"ISSUE_BILLING_RUN",0,"select app.issue_billing_run($1) as n","ISSUE_CREDIT_NOTE",0,"select app.issue_credit_note($1, $2, $3, $4) as id","ISSUE_INVOICE",0,"select app.issue_invoice($1)","MY_PAYMENT_INFO",0,h,"NOTIFY_DUE",0,"select app.notify_invoices_due() as n","OVERDUE_FAMILIES",0,u,"PAYMENTS_EXPORT",0,k,"PRIMARY_GUARDIAN",0,y,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3, $4)","REMINDER_PREVIEW",0,f,"REMINDER_TEMPLATE",0,b,"SEND_DIRECT",0,$,"SEND_REMINDERS",0,"select app.send_payment_reminders($1::uuid[], $2, $3) as sent","SET_ABSENCE_CREDIT",0,A,"SET_BANK_DETAILS",0,"select app.set_bank_details($1, $2, $3, $4, $5)","SET_DISCOUNT_RULE",0,"update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id","SET_FAMILY_BILLING",0,"select app.set_family_billing($1, $2, $3, $4, $5, $6::jsonb)","SUMMARY",0,i,"UPCOMING_COSTS",0,"select * from app.upcoming_costs($1::uuid)","VOID_INVOICE",0,"select app.void_invoice($1, $2)","XERO_EXPORT",0,S])},36261,e=>{"use strict";let i=`select id, kind, label, position, band, sticker from feedback_chip where class_id is null
                       order by band, kind, position, label`,t=`
insert into feedback_chip (studio_id, kind, label, position)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'standard'), 1)
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,s=`
insert into feedback_chip (studio_id, kind, label, position, band, sticker)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'under_8'), 1),
       'under_8', nullif(btrim($3), '')
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,a=`select c.id, c.tracking_depth, app.class_depth(c.id) as depth, c.age_min, c.age_max,
       app.age_band_depth(c.age_max) as default_depth from class c where c.id = $1`,n=`
select f.id, f.name, ds.name as style,
       coalesce((select jsonb_agg(jsonb_build_object('id', fs.id, 'name', fs.name, 'position', fs.position) order by fs.position)
                   from framework_skill fs where fs.framework_id = f.id and fs.deleted_at is null), '[]') as skills
  from skill_framework f left join dance_style ds on ds.id = f.dance_style_id
 where f.deleted_at is null order by ds.name`,d=`
insert into framework_skill (studio_id, framework_id, name, position)
select f.studio_id, f.id, btrim($2), coalesce((select max(position) + 1 from framework_skill where framework_id = f.id), 1)
  from skill_framework f where f.id = $1 returning id`,r=`
with cs as (select * from class_session where id = $1),
kids as (
  select e.student_id, null::text as visiting, 0 as pri from cs
    join enrolment e on e.class_id = cs.class_id and e.deleted_at is null
         and (e.status = 'active' or e.ended_on >= cs.starts_at::date)
  union all
  select t.student_id, 'trial', 1 from cs join trial t on t.session_id = cs.id and t.student_id is not null
         and t.deleted_at is null and t.status in ('booked', 'attended', 'converted')
  union all
  select d.student_id, 'drop_in', 2 from cs join drop_in_booking d on d.session_id = cs.id and d.status = 'booked'
),
one as (select distinct on (student_id) student_id, visiting from kids order by student_id, pri)
select s.id as student_id, s.first_name, s.last_name, a.status::text as status, one.visiting,
       f.going_well, f.work_on, f.shared_at is not null as shared, f.edited_at,
       f.going_well_chips, f.work_on_chips, f.note, f.work_on_note, f.work_on_resource_id
  from one
  join cs on true
  join student s on s.id = one.student_id and s.deleted_at is null
  left join attendance_record a on a.session_id = cs.id and a.student_id = s.id and a.deleted_at is null
  left join feedback_note f on f.session_id = cs.id and f.student_id = s.id and f.deleted_at is null
 order by (a.status in ('present', 'late', 'trial')) desc nulls last, s.first_name`,l=`
select f.student_id, f.going_well_chips, f.work_on_chips, p.starts_at
  from class_session me
  join lateral (select cs.id, cs.starts_at from class_session cs
                 where cs.class_id = me.class_id and cs.starts_at < me.starts_at and cs.deleted_at is null
                   and exists (select 1 from feedback_note f2 where f2.session_id = cs.id and f2.deleted_at is null)
                 order by cs.starts_at desc limit 1) p on true
  join feedback_note f on f.session_id = p.id and f.deleted_at is null
 where me.id = $1`,o=`
select f.id, f.going_well, f.work_on, coalesce(cs.starts_at, f.shared_at, f.created_at) as at, c.name as class_name,
       f.shared_at is not null as shared, r.title as resource_title
  from feedback_note f
  left join class_session cs on cs.id = f.session_id
  left join class c on c.id = f.class_id
  left join resource r on r.id = f.work_on_resource_id and r.deleted_at is null
 where f.student_id = $1 and f.deleted_at is null and (f.going_well is not null or f.work_on is not null)
   and f.session_id is distinct from $2::uuid
 order by coalesce(cs.starts_at, f.created_at) desc limit 1`,c=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.class_id = $1 and r.deleted_at is null order by s.first_name`,_=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.deleted_at is null and r.status = 'shared' order by r.shared_at desc`,m=`select id, student_id, text, status, review_note, created_at from student_goal
                       where student_id = $1 and deleted_at is null order by created_at desc`,u=`
select r.id, r.mood, r.text, r.created_at, c.name as class_name from student_reflection r
  left join class_session cs on cs.id = r.session_id left join class c on c.id = cs.class_id
 where r.student_id = $1 and r.deleted_at is null order by r.created_at desc limit 20`,f=`
select cs.id, c.name, cs.starts_at from attendance_record a join class_session cs on cs.id = a.session_id
  join class c on c.id = cs.class_id
 where a.student_id = app.student_self_id() and a.status in ('present', 'late') and a.deleted_at is null
   and cs.starts_at > now() - interval '14 days'
   and not exists (select 1 from student_reflection r where r.session_id = cs.id and r.deleted_at is null)
 order by cs.starts_at desc limit 5`;e.s(["ADD_CHIP",0,t,"ADD_CLASS_CHIP",0,"select app.add_class_chip($1, $2, $3, $4) as id","ADD_REFLECTION",0,"select app.add_reflection($1, $2, $3) as id","ADD_SKILL",0,d,"ADD_YOUNG_CHIP",0,s,"CHIPS",0,i,"CLASS_CHIPS",0,"select * from app.class_chips($1)","CLASS_DEPTH",0,a,"CLASS_REPORTS",0,c,"DEPTHS",0,[{key:"notes",label:"Notes",hint:"Feedback notes only. No skill levels."},{key:"notes_skills",label:"Notes and skills",hint:"Notes and current skill levels."},{key:"full",label:"Full",hint:"Notes, skill levels and their history over time."}],"DRAFT_REPORTS",0,"select app.draft_class_reports($1) as n","FRAMEWORKS",0,n,"GOALS",0,m,"LAST_FEEDBACK",0,o,"LEVELS",0,[{key:"not_started",label:"Not started",short:"–"},{key:"developing",label:"Developing",short:"D"},{key:"secure",label:"Secure",short:"S"},{key:"mastered",label:"Mastered",short:"M"}],"MILESTONES",0,"select id, kind, title, reached_on from milestone where student_id = $1 order by reached_on desc","MOODS",0,["😣","😕","😐","🙂","🤩"],"MY_RECENT_CLASSES",0,f,"MY_REPORTS",0,_,"PREVIOUS_SESSION_CHIPS",0,l,"PROPOSE_GOAL",0,"insert into student_goal (student_id, text, status, proposed_by) values ($1, btrim($2), $3, auth.uid()) returning id","RECORD_SKILL",0,"select app.record_skill($1, $2, $3::assessment_level, $4) as id","REFLECTIONS",0,u,"REMOVE_CHIP",0,"select app.soft_delete('feedback_chip', $1)","REMOVE_CLASS_CHIP",0,"select app.remove_class_chip($1, $2, $3) as ok","REMOVE_SKILL",0,"select app.soft_delete('framework_skill', $1)","RENAME_SKILL",0,"update framework_skill set name = btrim($2), updated_at = now() where id = $1 returning id","RESET_CLASS_CHIPS",0,"select app.reset_class_chips($1) as n","SAVE_CLASS_FEEDBACK",0,"select app.save_class_feedback($1, $2::jsonb, $3) as n","SESSION_FEEDBACK",0,r,"SET_CLASS_DEPTH",0,"select app.set_class_depth($1, $2) as depth","SET_GOAL",0,"update student_goal set status = $2, review_note = coalesce(nullif(btrim($3), ''), review_note), updated_at = now() where id = $1 returning id","SET_REPORT_COMMENT",0,"update progress_report set comment = nullif(btrim($2), ''), updated_at = now() where id = $1 returning id","SET_SKILL_DEMO",0,"select app.set_skill_demo($1, nullif(btrim($2), ''))","SET_SKILL_PUBLISH",0,"select app.set_skill_publish($1, $2) as mode","SET_SKILL_TRACKING",0,"select app.set_skill_tracking($1, $2) as tracked","SET_SUPPORT_NOTE",0,"select app.set_support_note($1, $2) as ok","SHARE_REPORTS",0,"select app.share_reports($1::uuid[]) as n","SHARE_SESSION_FEEDBACK",0,"select app.share_session_feedback($1) as n","SHARE_SKILLS",0,"select app.share_skills($1) as n","SKILL_DEMOS",0,"select id, demo_url from framework_skill where demo_url is not null and deleted_at is null","SKILL_HISTORY",0,"select * from app.skill_history($1)","SKILL_PUBLISH",0,"select id, skill_publish from studio where id in (select app.studio_ids()) limit 1","STUDENT_SKILLS",0,"select * from app.student_skills($1)","SUPPORT_NEEDS",0,"select * from app.support_needs()","TIMELINE",0,"select * from app.student_timeline($1) limit 200","UNSHARED_SKILLS",0,"select count(*)::int as n from skill_assessment where student_id = $1 and published_at is null and deleted_at is null"])},35632,e=>{"use strict";let i=`
select l.id, l.name, l.address_line1, l.address_line2, l.city, l.postcode, l.notes,
       (select count(*)::int from room r where r.location_id = l.id and r.deleted_at is null) as rooms,
       (select count(*)::int from class c where c.location_id = l.id and c.deleted_at is null) as classes
  from location l where l.deleted_at is null order by l.name`,t=`
insert into location (studio_id, name, address_line1, address_line2, city, postcode, notes)
select id, $1, nullif(btrim($2),''), nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), nullif(btrim($6),'')
  from studio where deleted_at is null limit 1
returning id`,s=`
update location set name = $2, address_line1 = nullif(btrim($3),''),
       address_line2 = nullif(btrim($4),''), city = nullif(btrim($5),''),
       postcode = nullif(btrim($6),''), notes = nullif(btrim($7),''), updated_at = now()
 where id = $1 returning id`,a=`
select r.id, r.name, r.location_id, r.capacity, l.name as location,
       (select count(*)::int from class c where c.room_id = r.id and c.deleted_at is null) as classes
  from room r join location l on l.id = r.location_id
 where r.deleted_at is null order by l.name, r.name`,n=`
insert into room (studio_id, location_id, name, capacity)
select l.studio_id, l.id, $2, $3 from location l where l.id = $1
returning id`,d=`
update room set name = $2, capacity = $3, updated_at = now() where id = $1 returning id`,r=`
select t.id, t.name, t.starts_on, t.ends_on, t.status::text as status,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes,
       (select count(*)::int from term_break b where b.term_id = t.id and b.deleted_at is null) as breaks
  from term t where t.deleted_at is null order by t.starts_on desc`,l=`
insert into term (studio_id, name, starts_on, ends_on, status)
select id, $1, $2::date, $3::date, $4::term_status
  from studio where deleted_at is null limit 1
returning id`,o=`
update term set name = $2, starts_on = $3::date, ends_on = $4::date,
       status = $5::term_status, updated_at = now()
 where id = $1 returning id`,c=`
select b.id, b.term_id, b.name, b.starts_on, b.ends_on
  from term_break b where b.deleted_at is null and b.term_id = $1
 order by b.starts_on`,_=`
insert into term_break (studio_id, term_id, name, starts_on, ends_on)
select t.studio_id, t.id, $2, $3::date, $4::date from term t where t.id = $1
returning id`,m=`
select s.id, s.name, s.colour, s.sort_order,
       (select count(*)::int from class c where c.dance_style_id = s.id and c.deleted_at is null) as classes
  from dance_style s where s.deleted_at is null order by s.sort_order, s.name`,u=`
insert into dance_style (studio_id, name, colour, sort_order)
select id, $1, $2, coalesce((select max(sort_order) + 1 from dance_style where deleted_at is null), 0)
  from studio where deleted_at is null limit 1
returning id`,f=`
update dance_style set name = $2, colour = $3, updated_at = now() where id = $1 returning id`,p=`
select lv.id, lv.name, lv.sort_order,
       (select count(*)::int from class c where c.level_id = lv.id and c.deleted_at is null) as classes
  from level lv where lv.deleted_at is null order by lv.sort_order, lv.name`,h=`
insert into level (studio_id, name, sort_order)
select id, $1, coalesce((select max(sort_order) + 1 from level where deleted_at is null), 0)
  from studio where deleted_at is null limit 1
returning id`,b=`
update level set name = $2, updated_at = now() where id = $1 returning id`,y=`
select id, name, timezone, currency, contact_email, contact_phone, onboarded_at, privacy_notice_url
  from studio where deleted_at is null limit 1`,$=`
update studio set name = $2, timezone = $3, contact_email = nullif(btrim($4),''),
       contact_phone = nullif(btrim($5),''), privacy_notice_url = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`;e.s(["BREAKS",0,c,"CREATE_BREAK",0,_,"CREATE_LEVEL",0,h,"CREATE_LOCATION",0,t,"CREATE_ROOM",0,n,"CREATE_STYLE",0,u,"CREATE_TERM",0,l,"LEVELS_FULL",0,p,"LOCATIONS_FULL",0,i,"RETIRE_SETUP",0,"select app.retire_setup($1, $2) as ok","ROOMS_FULL",0,a,"SET_WAITLIST_DAYS",0,"update studio set waitlist_offer_days = $2, updated_at = now() where id = $1 returning id","STUDIO",0,y,"STYLES_FULL",0,m,"TERMS_FULL",0,r,"UPDATE_LEVEL",0,b,"UPDATE_LOCATION",0,s,"UPDATE_ROOM",0,d,"UPDATE_STUDIO",0,$,"UPDATE_STYLE",0,f,"UPDATE_TERM",0,o,"WAITLIST_SETTING",0,"select id, waitlist_offer_days from studio where deleted_at is null limit 1"])}]);