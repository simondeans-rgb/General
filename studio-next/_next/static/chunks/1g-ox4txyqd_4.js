(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,64659,e=>{"use strict";let i=(0,e.i(75254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["ChevronDown",0,i],64659)},74886,e=>{"use strict";let i=(0,e.i(75254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",0,i],74886)},28345,e=>{"use strict";var i=e.i(43476),a=e.i(71645),t=e.i(22016),n=e.i(13927),s=e.i(45060),d=e.i(17658);let r=`
select cs.id, cs.original_starts_at, cs.cancel_reason, cs.changed_at,
       (cs.room_id is not null and cs.room_id is distinct from c.room_id) as room_moved,
       (cs.teacher_id is not null and cs.teacher_id is distinct from c.teacher_id) as covered
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = any($1::uuid[])`;function l({word:e,tone:a="ink"}){return(0,i.jsx)(d.Word,{size:"md",tone:a,children:e})}e.s(["SessionRow",0,function({time:e,name:a,meta:n,href:r,cancelled:o,reason:c,moved:m,style:u,colour:_,extra:p}){let f=(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("span",{className:(0,s.cn)("font-display text-[1.1875rem] leading-tight tnum",o&&"text-ink-3 line-through"),children:e}),(0,i.jsxs)("span",{className:"min-w-0",children:[(0,i.jsx)("span",{className:(0,s.cn)("block font-semibold leading-snug",o&&"text-ink-3"),children:a}),(0,i.jsxs)("span",{className:"mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-ink-3",children:[o&&(0,i.jsx)(l,{word:"Cancelled",tone:"critical"}),!o&&m&&(0,i.jsx)(l,{word:"Moved"}),o&&c?(0,i.jsx)("span",{children:c}):(0,i.jsx)("span",{className:"min-w-0",children:n.filter(Boolean).join(" · ")}),!o&&(0,i.jsx)(d.StyleMark,{style:u??null,colour:_}),p]})]})]}),h="grid min-h-[56px] grid-cols-[4.25rem_minmax(0,1fr)] items-start gap-x-4 py-3";return(0,i.jsx)("li",{children:r?(0,i.jsx)(t.default,{href:r,"aria-label":`${a}, ${e}${o?", cancelled":""}${m?", moved":""}`,className:(0,s.cn)(h,"hover:bg-surface-2/60"),children:f}):(0,i.jsx)("div",{className:h,children:f})})},"dayDate",0,function(e){return new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:"Europe/London"}).format(new Date(e))},"dueWord",0,function(e){return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:"Europe/London"}).format(new Date(e))},"useSessionChanges",0,function(e){let i=[...new Set(e)].sort(),t=(0,n.useRows)(["session-changes",i.join(",")],r,[i],{enabled:i.length>0});return a.useMemo(()=>new Map((t.data??[]).map(e=>[e.id,e])),[t.data])}])},26639,e=>{"use strict";var i=e.i(43476),a=e.i(71645),t=e.i(64659),n=e.i(74886),s=e.i(28793),d=e.i(97214),r=e.i(59130),l=e.i(77326),o=e.i(13927),c=e.i(50293),m=e.i(45060),u=e.i(17658),_=e.i(8199),p=e.i(75379),f=e.i(28345);let h={positive:"text-positive",caution:"text-caution",critical:"text-critical",neutral:"text-ink-3",info:"text-info"};function y({i:e}){let t=(0,o.useRows)(["invoice-items",e.id],c.INVOICE_ITEMS,[e.id]),n=a.useMemo(()=>{let e=new Map;return(t.data??[]).forEach(i=>{let a=i.student_name??"";e.set(a,[...e.get(a)??[],i])}),[...e.entries()]},[t.data]),s=Number(e.total_minor)-Number(e.paid_minor);return(0,i.jsxs)("section",{"aria-label":`Invoice ${e.number}`,children:[(0,i.jsx)(u.SectionHead,{title:(0,i.jsx)("span",{className:"tnum",children:e.number}),meta:`Issued ${(0,p.dateShort)(e.issued_on)} \xb7 due ${(0,p.dateShort)(e.due_on)}`}),t.isLoading&&(0,i.jsx)(u.Skeleton,{className:"mt-3 h-20"}),(0,i.jsxs)("dl",{className:"text-[0.9062rem]",children:[n.map(([e,a])=>(0,i.jsxs)("div",{className:"border-b border-line py-2",children:[e&&(0,i.jsx)("dt",{className:"label pb-1 pt-1",children:e}),a.map(e=>(0,i.jsxs)("dd",{className:"flex gap-4 py-1",children:[(0,i.jsxs)("span",{className:"min-w-0 flex-1",children:[e.description,Number(e.quantity)>1&&(0,i.jsxs)("span",{className:"text-ink-3",children:[" × ",Number(e.quantity)]})]}),(0,i.jsx)("span",{className:(0,m.cn)("tnum",0>Number(e.total_minor)&&"text-positive"),children:(0,p.money)(e.total_minor)})]},e.id))]},e)),Number(e.paid_minor)>0&&(0,i.jsxs)("div",{className:"flex gap-4 border-b border-line py-2 text-ink-2",children:[(0,i.jsx)("dt",{className:"flex-1",children:"Paid so far"}),(0,i.jsxs)("dd",{className:"tnum",children:["−",(0,p.money)(e.paid_minor)]})]}),(0,i.jsxs)("div",{className:"flex gap-4 pt-2.5 font-semibold",children:[(0,i.jsx)("dt",{className:"flex-1",children:Number(e.paid_minor)>0?"Left to pay":"Total"}),(0,i.jsx)("dd",{className:"tnum",children:(0,p.money)(s)})]})]})]})}function b({label:e,value:t,big:s}){let[d,r]=a.useState(!1);return(0,i.jsxs)("div",{className:"flex items-center gap-3 py-2",children:[(0,i.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,i.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:e}),(0,i.jsx)("p",{className:(0,m.cn)("tnum break-all",s?"font-display text-[1.375rem] leading-tight":"text-[1rem] font-semibold"),children:t})]}),(0,i.jsxs)(u.Button,{size:"sm","aria-label":`Copy ${e.toLowerCase()} ${t}`,onClick:()=>navigator.clipboard?.writeText(t.replace(/\s/g,"Account name"===e?" ":"")).then(()=>{r(!0),setTimeout(()=>r(!1),2e3)}).catch(()=>{}),children:[(0,i.jsx)(n.Copy,{className:"size-4","aria-hidden":!0})," ",d?"Copied":"Copy"]}),(0,i.jsx)("span",{role:"status",className:"sr-only",children:d?`${e} copied`:""})]})}function x({info:e,invoices:a}){let t=a.length>1,n=t?e?.reference??a[0]??"":a[0]??e?.reference??"";return(0,i.jsxs)("section",{"aria-labelledby":"how-h",children:[(0,i.jsx)(u.SectionHead,{id:"how-h",title:"How to pay"}),(0,i.jsxs)("div",{className:"divide-y divide-line",children:[(0,i.jsxs)("div",{className:"py-3",children:[(0,i.jsx)("p",{className:"font-semibold",children:"Bank transfer"}),e?.payee_name?(0,i.jsxs)("div",{className:"mt-1 divide-y divide-line",children:[(0,i.jsx)(b,{label:"Account name",value:e.payee_name}),(0,i.jsx)(b,{label:"Sort code",value:e.sort_code}),(0,i.jsx)(b,{label:"Account number",value:e.account_number}),e.iban&&(0,i.jsx)(b,{label:"IBAN",value:e.iban}),(0,i.jsx)(b,{label:"Reference",value:n,big:!0})]}):(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("p",{className:"mt-0.5 text-[0.8438rem] text-ink-3",children:"The studio has not added its bank details here yet. Ask them for the account details, and use this reference."}),(0,i.jsx)(b,{label:"Reference",value:n,big:!0})]}),(0,i.jsx)("p",{className:"mt-1 text-[0.8438rem] text-ink-3",children:t?`This reference covers all ${a.length} invoices (${a.join(", ")}), so one transfer is enough. The studio matches it to them.`:"Use this reference so the studio can match your payment. It shows here once they have recorded it."})]}),(0,i.jsxs)("div",{className:"py-3",children:[(0,i.jsx)("p",{className:"font-semibold",children:"Card or Apple Pay"}),(0,i.jsx)("p",{className:"mt-0.5 text-[0.8438rem] text-ink-3",children:"Not available yet: the studio has not connected card payments. Until then, pay by transfer or at the studio; they record it and it shows here straight away."})]})]})]})}let N={expected:"Expected",invoiced:"Invoiced",paid:"Paid"},j={expected:"muted",invoiced:"caution",paid:"positive"};function g(){let e=(0,o.useRows)(["upcoming-costs"],c.UPCOMING_COSTS,[null]),t=a.useMemo(()=>{let i=new Map;return(e.data??[]).forEach(e=>i.set(e.child,[...i.get(e.child)??[],e])),[...i.entries()]},[e.data]),n=(e.data??[]).reduce((e,i)=>e+Number(i.amount_minor),0),s=(e.data??[]).filter(e=>"paid"!==e.state).reduce((e,i)=>e+Number(i.amount_minor),0);return(0,i.jsxs)("section",{"aria-labelledby":"up-h",children:[(0,i.jsx)(u.SectionHead,{id:"up-h",title:"Coming up",meta:e.data?.length?"Fees, events and lessons ahead":void 0}),e.isLoading&&(0,i.jsx)(u.Skeleton,{className:"mt-3 h-20"}),null!=e.error&&(0,i.jsx)(u.ErrorState,{error:e.error}),e.data?.length===0&&(0,i.jsx)("p",{className:"py-3 text-[0.9062rem] text-ink-3",children:"Nothing else is planned yet."}),t.map(([e,a])=>(0,i.jsxs)("div",{className:"border-b border-line py-2",children:[(0,i.jsx)("p",{className:"label pb-1 pt-1",children:e}),(0,i.jsx)("ul",{children:a.map((e,a)=>(0,i.jsxs)("li",{className:"grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-1.5 text-[0.9062rem]",children:[(0,i.jsxs)("span",{className:"min-w-0",children:[(0,i.jsx)("span",{className:"block",children:e.title}),(0,i.jsxs)("span",{className:"flex flex-wrap items-baseline gap-x-2 text-[0.7812rem] text-ink-3",children:[(0,i.jsx)(u.Word,{tone:j[e.state],children:N[e.state]}),(0,i.jsx)("span",{children:e.due_on?"expected"===e.state?(0,p.dateShort)(e.due_on):`due ${(0,p.dateShort)(e.due_on)}`:"Date to be set"}),e.invoice_number&&(0,i.jsx)("span",{className:"tnum",children:e.invoice_number})]})]}),(0,i.jsx)("span",{className:(0,m.cn)("tnum","paid"===e.state&&"text-ink-3"),children:(0,p.money)(e.amount_minor)})]},a))})]},e)),!!e.data?.length&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)("dl",{className:"pt-2.5 text-[0.9062rem]",children:[(0,i.jsxs)("div",{className:"flex gap-4 font-semibold",children:[(0,i.jsx)("dt",{className:"flex-1",children:"Total coming up"}),(0,i.jsx)("dd",{className:"tnum",children:(0,p.money)(n)})]}),s!==n&&(0,i.jsxs)("div",{className:"flex gap-4 text-ink-2",children:[(0,i.jsx)("dt",{className:"flex-1",children:"Not yet paid"}),(0,i.jsx)("dd",{className:"tnum",children:(0,p.money)(s)})]})]}),(0,i.jsx)("p",{className:"mt-1 text-[0.7812rem] text-ink-3",children:"Estimates use this term’s prices. The studio confirms the amount on each invoice."})]})]})}let v={card:"Card",direct_debit:"Direct debit",bank_transfer:"Bank transfer",cash:"Cash",credit:"Credit from the studio",account:"Credit on your account"};function w({i:e}){let[n,s]=a.useState(!1),d=(0,o.useRows)(["invoice-items",e.id],c.INVOICE_ITEMS,[e.id],{enabled:n}),l=(0,o.useRows)(["invoice-payments",e.id],c.INVOICE_PAYMENTS,[e.id],{enabled:n}),_=(0,r.invoiceState)(e),f=Number(e.total_minor)-Number(e.paid_minor);return(0,i.jsxs)("li",{children:[(0,i.jsxs)("button",{onClick:()=>s(e=>!e),"aria-expanded":n,className:"grid min-h-[56px] w-full grid-cols-[minmax(0,1fr)_auto_1rem] items-center gap-x-3 py-3 text-left hover:bg-surface-2/60",children:[(0,i.jsxs)("span",{className:"min-w-0",children:[(0,i.jsxs)("span",{className:"flex items-baseline gap-2",children:[(0,i.jsx)("span",{className:"tnum font-semibold",children:e.number}),(0,i.jsx)("span",{className:(0,m.cn)("text-[0.8125rem] font-semibold",h[_.tone]),children:_.label})]}),(0,i.jsxs)("span",{className:"mt-0.5 block text-[0.8125rem] text-ink-3",children:["Issued ",(0,p.dateShort)(e.issued_on)," · due ",(0,p.dateShort)(e.due_on)]})]}),(0,i.jsxs)("span",{className:"text-right",children:[(0,i.jsx)("span",{className:"tnum block font-semibold",children:(0,p.money)(e.total_minor)}),f>0&&"void"!==e.status&&(0,i.jsxs)("span",{className:"tnum block text-[0.7812rem] text-caution",children:[(0,p.money)(f)," left"]})]}),(0,i.jsx)(t.ChevronDown,{className:(0,m.cn)("size-4 text-ink-3 transition-transform",n&&"rotate-180"),"aria-hidden":!0})]}),n&&(0,i.jsxs)("div",{className:"space-y-3 pb-4 pl-3 text-[0.875rem]",children:[d.isLoading&&(0,i.jsx)(u.Skeleton,{className:"h-10"}),(0,i.jsx)("ul",{className:"space-y-1.5 border-l-2 border-line pl-3",children:d.data?.map(e=>(0,i.jsxs)("li",{className:"flex gap-3",children:[(0,i.jsxs)("span",{className:"min-w-0 flex-1",children:[e.student_name?(0,i.jsxs)("span",{className:"text-ink-3",children:[e.student_name," · "]}):null,e.description]}),(0,i.jsx)("span",{className:"tnum",children:(0,p.money)(e.total_minor)})]},e.id))}),l.data&&l.data.length>0&&(0,i.jsx)("ul",{className:"space-y-1.5 border-l-2 border-line pl-3 text-[0.8125rem] text-ink-2",children:l.data.map(e=>(0,i.jsxs)("li",{className:"flex gap-3",children:[(0,i.jsxs)("span",{className:"flex-1",children:[e.succeeded_at?`${v[e.method]??e.method}, ${(0,p.dateShort)(e.succeeded_at)}`:`${v[e.method]??e.method} did not go through`,Number(e.refunded_minor)>0&&` \xb7 ${(0,p.money)(e.refunded_minor)} refunded`]}),(0,i.jsx)("span",{className:(0,m.cn)("tnum",!e.succeeded_at&&"line-through"),children:(0,p.money)(e.amount_minor)})]},e.id))})]})]})}e.s(["default",0,function(){let e=(0,o.useRow)(["my-balance"],_.MY_BALANCE),a=(0,o.useRows)(["my-invoices"],_.MY_INVOICES),t=(0,o.useRow)(["my-payment-info"],c.MY_PAYMENT_INFO);(0,s.useDueReminders)();let n=(0,d.useFamilyVoice)(),r=!!e.data&&Number(e.data.balance_minor)>0,h=!!e.data&&0>Number(e.data.balance_minor),b=(a.data??[]).filter(e=>"issued"===e.status||"part_paid"===e.status).sort((e,i)=>String(e.due_on).localeCompare(String(i.due_on))),N=b[0]?.due_on;return(0,i.jsx)(l.Shell,{title:n.solo?"Your payments":"Payments",allow:["guardian"],children:(0,i.jsxs)("div",{className:"mx-auto grid max-w-[1080px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",children:[(0,i.jsxs)("div",{className:"min-w-0 space-y-10",children:[(0,i.jsxs)("section",{"aria-labelledby":"due-h",children:[e.isLoading&&(0,i.jsx)(u.Skeleton,{className:"h-28"}),null!=e.error&&(0,i.jsx)(u.ErrorState,{error:e.error,onRetry:()=>e.refetch()}),e.data&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("p",{id:"due-h",className:(0,m.cn)("label",r&&"text-caution"),children:r?N?`Due ${(0,f.dueWord)(N)}`:"To pay":h?"In credit":"Balance"}),(0,i.jsx)("p",{className:"display-xl mt-1 text-[length:min(3.5rem,13vw)] leading-none sm:text-[length:min(4.5rem,13vw)]",children:r?(0,p.money)(e.data.balance_minor):h?(0,p.money)(-Number(e.data.balance_minor)):"£0.00"}),(0,i.jsx)("p",{className:"mt-2 text-[0.9375rem] text-ink-2",children:r?e.data.failed>0?"A card payment did not go through. Nothing was taken.":`${e.data.unpaid} invoice${1===e.data.unpaid?"":"s"} outstanding.`:h?"Credit on your account comes off the next invoice.":"Everything is paid. Nothing is due."})]})]}),b.map(e=>(0,i.jsx)(y,{i:e},e.id))]}),(0,i.jsxs)("div",{className:"min-w-0 space-y-10",children:[r&&(0,i.jsx)(x,{info:t.data,invoices:b.map(e=>e.number)}),(0,i.jsx)(g,{}),(0,i.jsxs)("section",{"aria-labelledby":"hist-h",children:[(0,i.jsx)(u.SectionHead,{id:"hist-h",title:"Invoices",meta:a.data?.length?"Latest eight":void 0}),a.isLoading&&(0,i.jsx)("div",{className:"space-y-2 pt-3",children:[0,1].map(e=>(0,i.jsx)(u.Skeleton,{className:"h-12"},e))}),null!=a.error&&(0,i.jsx)(u.ErrorState,{error:a.error}),a.data?.length===0&&(0,i.jsx)(u.EmptyState,{title:"No invoices yet",body:"They appear here as the studio issues them."}),(0,i.jsx)("ul",{className:"divide-y divide-line",children:a.data?.map(e=>(0,i.jsx)(w,{i:e},e.id))})]})]})]})})}])},97214,e=>{"use strict";var i=e.i(43476),a=e.i(71645),t=e.i(54616),n=e.i(12598),s=e.i(65712),d=e.i(17658),r=e.i(13927),l=e.i(30224),o=e.i(31502),c=e.i(8199);function m(){let e=(0,r.useRows)(["my-children"],c.MY_CHILDREN);return a.useMemo(()=>{let i=e.data??[],a=i.find(e=>e.is_me)??null;return{self:a,solo:!!a&&i.every(e=>e.is_me),name:(e,i)=>a&&e===a.id?"you":i}},[e.data])}function u({onClose:e,onDone:r}){let{session:m}=(0,o.useSession)(),_=(0,n.useQueryClient)(),[p,f]=a.useState(""),[h,y]=a.useState(!1),[b,x]=a.useState(""),[N,j]=a.useState(""),g=(0,t.useMutation)({mutationFn:()=>(0,l.runAs)(m,e=>e(c.BOOK_FOR_MYSELF,[p||null,h,b||null,N||null])),onSuccess:()=>{_.invalidateQueries({queryKey:["db"]}),r()}});return(0,i.jsxs)(s.RecordSheet,{title:"Book for myself",subtitle:"For adult classes and drop-ins",onClose:e,saving:g.isPending,error:g.error,canSave:(!!p||h)&&N.trim().length>0,saveLabel:"Add me",onSave:()=>g.mutate(),children:[(0,i.jsx)("p",{className:"text-[0.8438rem] text-ink-2",children:"The school keeps a short record for you as a dancer, with someone to ring in an emergency. Nothing about your children changes."}),(0,i.jsx)(d.Field,{label:"Date of birth",htmlFor:"me-dob",hint:"Optional. Or tick the box below.",children:(0,i.jsx)(d.Input,{id:"me-dob",type:"date",value:p,onChange:e=>f(e.target.value)})}),(0,i.jsxs)("label",{className:"flex min-h-11 items-center gap-2.5 text-sm",children:[(0,i.jsx)("input",{type:"checkbox",className:"size-5 accent-[var(--color-accent)]",checked:h,onChange:e=>y(e.target.checked)}),"I am 18 or over"]}),(0,i.jsx)(d.Field,{label:"Emergency contact",htmlFor:"me-ec-name",hint:"Someone other than you.",children:(0,i.jsx)(d.Input,{id:"me-ec-name",value:b,onChange:e=>x(e.target.value),autoComplete:"off"})}),(0,i.jsx)(d.Field,{label:"Their phone",htmlFor:"me-ec-phone",required:!0,children:(0,i.jsx)(d.Input,{id:"me-ec-phone",type:"tel",value:N,onChange:e=>j(e.target.value),autoComplete:"off"})})]})}e.s(["BookForMyself",0,function(){let e=m(),[t,n]=a.useState(!1),[s,r]=a.useState(!1);return e.self&&!s?null:(0,i.jsxs)("section",{id:"for-me","aria-labelledby":"for-me-h",children:[(0,i.jsxs)("div",{className:"mb-1 border-b-2 border-ink pb-2",children:[(0,i.jsx)("h2",{id:"for-me-h",className:"section-title",children:"Classes for you"}),(0,i.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Adult classes and drop-ins, booked in your own name."})]}),s?(0,i.jsxs)("p",{role:"status",className:"pt-3 text-[0.9062rem]",children:[(0,i.jsx)("span",{className:"font-semibold text-positive",children:"Done."})," You’re on the account as an adult student. Choose a class under your name, or book a drop-in."]}):(0,i.jsxs)("div",{className:"pt-3",children:[(0,i.jsx)("p",{className:"text-[0.9062rem] text-ink-2",children:"Your children’s details stay as they are. Your bookings and payments show alongside theirs."}),(0,i.jsx)(d.Button,{className:"mt-3",onClick:()=>n(!0),children:"Book for myself"})]}),t&&(0,i.jsx)(u,{onClose:()=>n(!1),onDone:()=>{n(!1),r(!0)}})]})},"useFamilyVoice",0,m])},28793,e=>{"use strict";var i=e.i(71645),a=e.i(12598),t=e.i(30224),n=e.i(31502),s=e.i(50293);let d="";e.s(["useDueReminders",0,function(){let{session:e}=(0,n.useSession)(),r=(0,a.useQueryClient)();i.useEffect(()=>{e&&"guardian"===e.role&&d!==e.userId&&(d=e.userId,(0,t.runAs)(e,e=>e(s.NOTIFY_DUE)).then(e=>{e[0]?.n&&r.invalidateQueries({queryKey:["db"]})}).catch(()=>void 0))},[e,r])}])},59130,e=>{"use strict";let i={draft:{label:"Draft",tone:"neutral"},issued:{label:"Due",tone:"caution"},part_paid:{label:"Part paid",tone:"caution"},paid:{label:"Paid",tone:"positive"},void:{label:"Void",tone:"neutral"},refunded:{label:"Refunded",tone:"info"}};e.s(["invoiceState",0,function(e,a=new Date){return e.failed?{label:"Card declined",tone:"critical"}:e.overdue??function(e,i=new Date){let a,t;return!("issued"!==(a=e.status)&&"part_paid"!==a&&"refunded"!==a||!e.due_on||null!=e.total_minor&&null!=e.paid_minor&&Number(e.total_minor)<=Number(e.paid_minor))&&((t=e.due_on)instanceof Date?t.toISOString():String(t??"")).slice(0,10)<i.toISOString().slice(0,10)}(e,a)?{label:"part_paid"===e.status?"Overdue · part paid":"Overdue",tone:"caution"}:i[e.status]??i.draft}])},50293,e=>{"use strict";let i=`
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
  from credit_note where invoice_id = $1 order by created_at`,m=`
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
  from l order by at, array_position(array['invoice','payment','credit','credit_note','refund'], kind)`,_=`
select f.id as family_id, f.name as family_name, sum(i.total_minor - i.paid_minor)::bigint as overdue_minor,
       string_agg(i.number, ', ' order by i.due_on, i.number) as invoices, min(i.due_on) as oldest_due,
       app.last_payment_reminder(f.id) as last_reminded,
       exists (select 1 from guardian g where g.family_id = f.id and g.user_id is not null and g.deleted_at is null) as uses_app,
       ${a("f.id")} as locations
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null and i.status in ('issued','part_paid','refunded')
   and i.total_minor > i.paid_minor and i.due_on < current_date
 group by f.id, f.name order by min(i.due_on), f.name`,p=`
select app.fill_payment_reminder($1, $2) as subject, app.fill_payment_reminder($1, $3) as body`,f=`
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
returning id`,N=`
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`,j=`
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.deleted_at is null and d.ended_at is null and (d.ends_on is null or d.ends_on >= current_date)
 order by f.name`,g=`
insert into family_discount (family_id, kind, amount, reason, note, starts_on, ends_on)
values ($1, $2, $3, $4, nullif($5, ''), coalesce($6::date, current_date), $7::date) returning id`,v=`
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
  from lines order by number, ord, created_at`,w=`
select family_name as family, round(current_minor / 100.0, 2) as "0-30 days", round(d31_60 / 100.0, 2) as "31-60 days",
       round(d61_90 / 100.0, 2) as "61-90 days", round(d90_plus / 100.0, 2) as "90+ days", round(total / 100.0, 2) as total
  from app.aged_debt((select id from studio where app.is_admin(id) order by name limit 1)) a
 where $1::text is null or $1::text = any(${a("a.family_id")})`,I=`
select i.number, f.name as family, i.status::text as status, i.issued_on, i.due_on,
       round(i.subtotal_minor / 100.0, 2) as subtotal, round(i.discount_minor / 100.0, 2) as discount,
       round(i.total_minor / 100.0, 2) as total, round(i.paid_minor / 100.0, 2) as paid,
       round((i.total_minor - i.paid_minor) / 100.0, 2) as outstanding, t.name as term
  from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
 where i.deleted_at is null order by i.number`,$=`
select p.succeeded_at::date as date, f.name as family, i.number as invoice, p.method,
       round(p.amount_minor / 100.0, 2) as amount,
       case when p.failure_code is not null then 'failed' when p.succeeded_at is null then 'pending' else 'succeeded' end as status,
       p.provider_ref as reference
  from payment p join family f on f.id = p.family_id left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null order by p.created_at`,S=`
select coalesce(b.mode, 'family') as mode, b.guardian_a, b.guardian_b, b.percent_a
  from family f left join family_billing b on b.family_id = f.id
 where f.id = $1`,E=`
select id, full_name from guardian where family_id = $1 and deleted_at is null order by is_primary desc, full_name`,C=`
select s.id, s.first_name, x.guardian_id
  from student s left join family_billing_child x on x.student_id = s.id
 where s.family_id = $1 and s.deleted_at is null order by s.date_of_birth`,k=`
select ac.id, ac.created_at, ac.family_id, f.name as family_name, s.first_name as child,
       app.session_label(ac.session_id) as session_label, ac.amount_minor, ac.status
  from absence_credit ac join family f on f.id = ac.family_id join student s on s.id = ac.student_id
 order by ac.created_at desc limit 50`,T=`
select id, absence_credit, absence_credit_fixed_minor, makeup_policy from studio where id in (select app.studio_ids()) limit 1`,D=`
update studio set absence_credit = $2, absence_credit_fixed_minor = $3 where id = $1 returning id`;e.s(["ABSENCE_CREDITS",0,k,"ABSENCE_CREDIT_SETTING",0,T,"ADD_FAMILY_CREDIT",0,"select app.add_family_credit($1, $2, $3) as id","ADD_FAMILY_DISCOUNT",0,g,"AGED_DEBT_EXPORT",0,w,"BANK_DETAILS",0,f,"BILLING_LINES",0,"select * from app.billing_lines($1, $2::date, $3::uuid[])","BILLING_RUNS",0,N,"BILLING_SKIPPED",0,"select * from app.billing_skipped($1, $2::date)","BILLING_TERMS",0,"select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc","CLASS_LOCATIONS",0,"select c.id, l.name as location from class c join location l on l.id = c.location_id where c.deleted_at is null","CREATE_BILLING_RUN",0,"select app.create_billing_run($1, $2::date, $3::date, $4::uuid[], $5) as id","CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","DISCARD_BILLING_RUN",0,"select app.discard_billing_run($1)","DISCOUNT_RULES",0,"select id, kind, from_nth, percent, enabled from discount_rule order by kind desc","END_FAMILY_DISCOUNT",0,"select app.end_family_discount($1)","FAMILY_ACCOUNT",0,m,"FAMILY_BILLABLE",0,o,"FAMILY_BILLING",0,S,"FAMILY_BILLING_CHILDREN",0,C,"FAMILY_DISCOUNTS",0,j,"FAMILY_GUARDIANS",0,E,"FAMILY_OPTIONS",0,l,"FAMILY_PICK",0,"select id, name from family where deleted_at is null and not is_prospect order by name","FAMILY_STATEMENT",0,u,"INVOICE",0,s,"INVOICES",0,n,"INVOICES_EXPORT",0,I,"INVOICE_CREDIT_NOTES",0,c,"INVOICE_ITEMS",0,d,"INVOICE_PAYMENTS",0,r,"ISSUE_BILLING_RUN",0,"select app.issue_billing_run($1) as n","ISSUE_CREDIT_NOTE",0,"select app.issue_credit_note($1, $2, $3, $4) as id","ISSUE_INVOICE",0,"select app.issue_invoice($1)","MY_PAYMENT_INFO",0,h,"NOTIFY_DUE",0,"select app.notify_invoices_due() as n","OVERDUE_FAMILIES",0,_,"PAYMENTS_EXPORT",0,$,"PRIMARY_GUARDIAN",0,b,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3, $4)","REMINDER_PREVIEW",0,p,"REMINDER_TEMPLATE",0,y,"SEND_DIRECT",0,x,"SEND_REMINDERS",0,"select app.send_payment_reminders($1::uuid[], $2, $3) as sent","SET_ABSENCE_CREDIT",0,D,"SET_BANK_DETAILS",0,"select app.set_bank_details($1, $2, $3, $4, $5)","SET_DISCOUNT_RULE",0,"update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id","SET_FAMILY_BILLING",0,"select app.set_family_billing($1, $2, $3, $4, $5, $6::jsonb)","SUMMARY",0,i,"UPCOMING_COSTS",0,"select * from app.upcoming_costs($1::uuid)","VOID_INVOICE",0,"select app.void_invoice($1, $2)","XERO_EXPORT",0,v])}]);