(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,72520,e=>{"use strict";let t=(0,e.i(75254).default)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);e.s(["ArrowRight",0,t],72520)},63939,e=>{"use strict";let t=(0,e.i(75254).default)("corner-down-left",[["path",{d:"M20 4v7a4 4 0 0 1-4 4H4",key:"6o5b7l"}],["path",{d:"m9 10-5 5 5 5",key:"1kshq7"}]]);e.s(["CornerDownLeft",0,t],63939)},80163,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(74080),r=e.i(18566),i=e.i(55436),n=e.i(63939),l=e.i(72520),o=e.i(13927);let d="(nullif(case when $1 ~ '[A-Za-z]' then '' else regexp_replace($1, '\\D', '', 'g') end, ''))",m=`
with term as (select '%' || lower(btrim($1)) || '%' as p, lower(btrim($1)) as x)
select kind, id, title, detail, href from (
(select 'family' as kind, f.id, f.name as title,
        (select string_agg(g.full_name, ', ') from guardian g where g.family_id = f.id and g.deleted_at is null) as detail,
        '/people?tab=families&id=' || f.id as href, 1 as k, row_number() over (order by f.name) as n, term.x
   from family f, term
  where f.deleted_at is null and (lower(f.name) like term.p or exists (
          select 1 from guardian g where g.family_id = f.id and g.deleted_at is null
             and (lower(g.full_name) like term.p or lower(coalesce(g.email, '')) like term.p
                  or regexp_replace(coalesce(g.phone, ''), '\\D', '', 'g') like '%' || ${d} || '%')))
  order by f.name limit 5)
union all
(select 'student', s.id, s.first_name || ' ' || s.last_name, f.name, '/people?tab=students&id=' || s.id,
        2, row_number() over (order by s.last_name, s.first_name), term.x
   from student s join family f on f.id = s.family_id, term
  where s.deleted_at is null and lower(s.first_name || ' ' || s.last_name) like term.p
  order by s.last_name, s.first_name limit 6)
union all
(select 'staff', st.id, st.display_name, null, '/people?tab=staff&id=' || st.id, 3, row_number() over (order by st.display_name), term.x
   from staff_member st, term
  where st.deleted_at is null and lower(st.display_name) like term.p limit 3)
union all
(select 'invoice', i.id, i.number,
        -- The same words as Billing (UR-54): overdue is said, not "issued".
        f.name || ' \xb7 ' || case
          when i.status in ('issued','part_paid','refunded') and i.due_on < current_date then 'Overdue'
          when i.status = 'issued' then 'Due' when i.status = 'part_paid' then 'Part paid'
          when i.status = 'paid' then 'Paid' when i.status = 'void' then 'Void'
          when i.status = 'refunded' then 'Refunded' else 'Draft' end,
        '/billing?id=' || i.id, 4, row_number() over (order by i.created_at desc), term.x
   from invoice i join family f on f.id = i.family_id, term
  where i.deleted_at is null and (lower(i.number) like term.p or lower(f.name) like term.p)
  order by (lower(i.number) = term.x) desc, i.created_at desc limit 5)
union all
(select 'class', c.id, c.name, null, '/classes?id=' || c.id, 5, row_number() over (order by c.name), term.x
   from class c, term
  where c.deleted_at is null and lower(c.name) like term.p limit 4)
union all
(select 'enquiry', e.id, coalesce(e.child_name, e.contact_name),
        e.contact_name || ' \xb7 ' || replace(e.stage::text, '_', ' '), '/enrolment?enquiry=' || e.id,
        6, row_number() over (order by e.created_at desc), term.x
   from enquiry e, term
  where e.deleted_at is null
    and (lower(e.contact_name) like term.p or lower(coalesce(e.child_name, '')) like term.p
         or lower(coalesce(e.contact_email, '')) like term.p
         or regexp_replace(coalesce(e.contact_phone, ''), '\\D', '', 'g') like '%' || ${d} || '%')
  order by e.created_at desc limit 4)
) h
order by (lower(h.title) = h.x) desc, (lower(h.title) like h.x || '%') desc, h.k, h.n`;var c=e.i(31502);let u={available:!1,async ask(){throw Error("The studio assistant is not connected in this build.")}},h=[{question:"What needs my attention today?",answer:"Today → Needs attention",href:"/today",roles:["owner","admin"],keywords:"today urgent attention problems"},{question:"Who hasn’t paid?",answer:"Billing → Needs action",href:"/billing",roles:["owner","admin"],keywords:"paid unpaid owe outstanding fees show money invoices overdue"},{question:"Which payments failed?",answer:"Billing → card declined",href:"/billing",roles:["owner","admin"],keywords:"failed declined card payment"},{question:"Which classes have waiting lists?",answer:"Reports → Classes, fullest first",href:"/reports",roles:["owner","admin"],keywords:"waiting list waitlist full capacity"},{question:"Which students have poor attendance?",answer:"Today → missed three in a row",href:"/today",roles:["owner","admin"],keywords:"attendance absent missing poor"},{question:"How many trials converted?",answer:"Enrolment → funnel",href:"/enrolment",roles:["owner","admin"],keywords:"trial conversion enquiries funnel"},{question:"Message a class’s parents",answer:"Inbox → new message to a class",href:"/inbox?compose=class",roles:["owner","admin"],keywords:"draft message email parents class broadcast"},{question:"Who is in my class today?",answer:"Today → your registers",href:"/teach",roles:["teacher"],keywords:"class register today students"}];var f=e.i(45060);let w={family:"Family",student:"Student",staff:"Staff",invoice:"Invoice",class:"Class",enquiry:"Enquiry"};e.s(["AssistantLauncher",0,function(){let{session:e}=(0,c.useSession)(),d=(0,r.useRouter)(),[p,y]=s.useState(!1),[x,b]=s.useState(""),[k,g]=s.useState(0),v=s.useRef(null);s.useEffect(()=>{let e=e=>{(e.metaKey||e.ctrlKey)&&"k"===e.key.toLowerCase()&&(e.preventDefault(),y(e=>!e)),"Escape"===e.key&&y(!1)};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[]),s.useEffect(()=>{p&&(b(""),g(0),setTimeout(()=>v.current?.focus(),0))},[p]);let _=e?.role==="owner"||e?.role==="admin",[j,q]=s.useState("");s.useEffect(()=>{let e=setTimeout(()=>q(x.trim()),150);return()=>clearTimeout(e)},[x]);let N=(0,o.useRows)(["search",j],m,[j],{enabled:p&&_&&j.length>=2});if(!e)return null;let C=x.toLowerCase().split(/\s+/).filter(e=>e.length>2),A=[...(j.length>=2?N.data??[]:[]).map(e=>({question:e.title,answer:[w[e.kind],e.detail].filter(Boolean).join(" · "),href:e.href,kind:e.kind})),...h.filter(t=>t.roles.includes(e.role)).filter(e=>!C.length||C.some(t=>`${e.question} ${e.keywords}`.toLowerCase().includes(t))).map(e=>({...e,kind:void 0}))],T=e=>{y(!1),d.push(e)};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("button",{onClick:()=>y(!0),"aria-label":"Ask or jump (Command K)",className:"hidden h-9 items-center gap-2 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-[0.8125rem] text-ink-3 hover:border-ink-3 hover:text-ink sm:flex",children:[(0,t.jsx)(i.Search,{className:"size-4","aria-hidden":!0})," Ask or jump",(0,t.jsx)("kbd",{className:"rounded-[var(--radius-sm)] bg-surface-2 px-1.5 text-[0.6875rem] font-semibold text-ink-2",children:"⌘K"})]}),(0,t.jsx)("button",{onClick:()=>y(!0),"aria-label":"Ask or jump",className:"grid size-[max(44px,1.5rem)] shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-2 sm:hidden",children:(0,t.jsx)(i.Search,{className:"size-[1.125rem]","aria-hidden":!0})}),p&&(0,a.createPortal)((0,t.jsx)("div",{className:"fixed inset-0 z-[70] flex items-start justify-center bg-ink/30 p-3 pt-[12dvh]",onClick:()=>y(!1),children:(0,t.jsxs)("div",{role:"dialog","aria-modal":"true","aria-label":"Ask or jump",onClick:e=>e.stopPropagation(),className:"w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface shadow-lg",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 border-b-2 border-ink px-4",children:[(0,t.jsx)(i.Search,{className:"size-4 text-ink-3","aria-hidden":!0}),(0,t.jsx)("input",{ref:v,value:x,onChange:e=>{b(e.target.value),g(0)},role:"combobox","aria-expanded":"true","aria-controls":"ask-list","aria-label":"Ask a question about the studio",placeholder:_?"A name, phone number, invoice — or a question":"Who hasn’t paid? Which classes are full?",onKeyDown:e=>{"ArrowDown"===e.key&&(e.preventDefault(),g(e=>Math.min(e+1,A.length-1))),"ArrowUp"===e.key&&(e.preventDefault(),g(e=>Math.max(e-1,0))),"Enter"===e.key&&A[k]&&T(A[k].href)},className:"h-12 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-ink-3"})]}),(0,t.jsx)("ul",{id:"ask-list",role:"listbox",className:"max-h-[50dvh] overflow-y-auto p-1.5",children:A.map((e,s)=>(0,t.jsx)("li",{role:"option","aria-selected":s===k,children:(0,t.jsxs)("button",{onClick:()=>T(e.href),onMouseEnter:()=>g(s),className:(0,f.cn)("flex min-h-12 w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left",s===k&&"bg-surface-2"),children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"block text-[0.9062rem] font-semibold",children:e.question}),(0,t.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:e.answer})]}),s===k?(0,t.jsx)(n.CornerDownLeft,{className:"size-4 text-ink-3","aria-hidden":!0}):(0,t.jsx)(l.ArrowRight,{className:"size-4 text-ink-3","aria-hidden":!0})]})},e.href+e.question))}),!u.available&&(0,t.jsx)("div",{className:"border-t border-line px-4 py-3",children:(0,t.jsxs)("p",{className:"text-[0.8125rem] text-ink-3",children:[x&&!A.length?"No saved view answers that yet. ":"","The studio assistant is not connected. When it is, it will answer free-text questions from your studio’s data — seeing only what you can see — and show where each answer came from."]})})]})}),document.body)]})}],80163)},39726,function(e){e.n(e.i(80163))}]);