(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,40160,e=>{"use strict";let i=(0,e.i(75254).default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);e.s(["Download",0,i],40160)},7233,e=>{"use strict";let i=(0,e.i(75254).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,i],7233)},55436,e=>{"use strict";let i=(0,e.i(75254).default)("search",[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]);e.s(["Search",0,i],55436)},57850,e=>{"use strict";var i=e.i(43476),a=e.i(71645),t=e.i(37727),n=e.i(45060);e.s(["DetailPanel",0,function({open:e,onClose:s,title:r,subtitle:d,children:l,actions:o}){return(a.useEffect(()=>{if(!e)return;let i=e=>{"Escape"===e.key&&s()};return document.addEventListener("keydown",i),()=>document.removeEventListener("keydown",i)},[e,s]),e)?(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("div",{className:"fixed inset-0 z-40 bg-ink/25 lg:hidden",onClick:s,"aria-hidden":!0}),(0,i.jsxs)("aside",{role:"dialog","aria-modal":"true","aria-label":"string"==typeof r?r:"Details",className:(0,n.cn)("fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-[var(--radius-xl)]","border-t border-line bg-surface shadow-lg pb-safe","lg:sticky lg:top-4 lg:z-auto lg:max-h-[calc(100dvh-2rem)] lg:rounded-[var(--radius-lg)] lg:border lg:shadow-md"),children:[(0,i.jsxs)("div",{className:"sticky top-0 z-10 flex items-start gap-3 border-b border-line bg-surface px-5 pb-3 pt-4",children:[(0,i.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,i.jsx)("h2",{className:"truncate font-display text-[1.25rem] leading-tight",children:r}),d&&(0,i.jsx)("div",{className:"mt-1 truncate text-[0.8438rem] text-ink-3",children:d})]}),o,(0,i.jsx)("button",{onClick:s,"aria-label":"Close details",className:"grid size-9 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink",children:(0,i.jsx)(t.X,{className:"size-4","aria-hidden":!0})})]}),(0,i.jsx)("div",{className:"px-5 py-4",children:l})]})]}):null},"DetailSection",0,function({title:e,children:a,action:t}){return(0,i.jsxs)("section",{className:"mb-7 last:mb-0",children:[(0,i.jsxs)("div",{className:"mb-2 flex min-h-[28px] items-center gap-2 border-b border-ink pb-1.5",children:[(0,i.jsx)("h3",{className:"section-title text-[0.875rem]",children:e}),t&&(0,i.jsx)("div",{className:"ml-auto",children:t})]}),a]})},"KeyValue",0,function({rows:e}){return(0,i.jsx)("dl",{className:"divide-y divide-line",children:e.map(([e,a])=>(0,i.jsxs)("div",{className:"flex gap-3 py-2 text-[0.875rem]",children:[(0,i.jsx)("dt",{className:"w-28 shrink-0 text-ink-3",children:e}),(0,i.jsx)("dd",{className:"min-w-0 flex-1 break-words",children:a??(0,i.jsx)("span",{className:"text-ink-3",children:"—"})})]},e))})}])},9627,87378,e=>{"use strict";var i=e.i(43476),a=e.i(71645),t=e.i(54616),n=e.i(12598),s=e.i(75254);let r=(0,s.default)("banknote",[["rect",{width:"20",height:"12",x:"2",y:"6",rx:"2",key:"9lu3g6"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"M6 12h.01M18 12h.01",key:"113zkx"}]]);e.s(["Banknote",0,r],87378);var d=e.i(64659);let l=(0,s.default)("gift",[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1",key:"bkv52"}],["path",{d:"M12 8v13",key:"1c76mn"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",key:"6wjy6b"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",key:"1ihvrl"}]]);var o=e.i(65712),c=e.i(13927),m=e.i(30224),u=e.i(31502),_=e.i(17658),p=e.i(50293),f=e.i(75379),h=e.i(45060);let b={invoice:"Invoice",payment:"Payment",credit:"Credit",credit_note:"Credit note",refund:"Refund"},y={card:"Card",direct_debit:"Direct debit",bank_transfer:"Bank transfer",cash:"Cash"};function x({familyId:e}){let a=(0,c.useRows)(["family-statement",e],p.FAMILY_STATEMENT,[e]);return a.isLoading?(0,i.jsx)(_.Skeleton,{className:"mt-3 h-24"}):a.error?(0,i.jsx)("div",{className:"mt-3",children:(0,i.jsx)(_.ErrorState,{error:a.error})}):a.data?.length?(0,i.jsx)("div",{className:"mt-3 overflow-x-auto",children:(0,i.jsxs)("table",{className:"w-full text-[0.8438rem]",children:[(0,i.jsx)("caption",{className:"sr-only",children:"Statement"}),(0,i.jsx)("thead",{className:"border-b border-line text-left",children:(0,i.jsxs)("tr",{children:[(0,i.jsx)("th",{scope:"col",className:"label py-1.5 pr-2 font-semibold",children:"Date"}),(0,i.jsx)("th",{scope:"col",className:"label px-2 py-1.5 font-semibold",children:"What"}),(0,i.jsx)("th",{scope:"col",className:"label px-2 py-1.5 text-right font-semibold",children:"Amount"}),(0,i.jsx)("th",{scope:"col",className:"label py-1.5 pl-2 text-right font-semibold",children:"Balance"})]})}),(0,i.jsx)("tbody",{className:"divide-y divide-line",children:a.data.map((e,a)=>{let t=Number(e.amount_minor),n="payment"===e.kind?y[e.detail??""]??e.detail:e.detail;return(0,i.jsxs)("tr",{className:"align-top",children:[(0,i.jsx)("td",{className:"tnum whitespace-nowrap py-1.5 pr-2 text-ink-2",children:(0,f.dateShort)(e.on_date)}),(0,i.jsxs)("td",{className:"min-w-0 px-2 py-1.5",children:[(0,i.jsx)("span",{className:"font-medium",children:b[e.kind]}),e.ref&&(0,i.jsxs)("span",{className:"tnum text-ink-2",children:[" ",e.ref]}),n&&(0,i.jsx)("span",{className:"block text-[0.7812rem] text-ink-3",children:n})]}),(0,i.jsx)("td",{className:(0,h.cn)("tnum whitespace-nowrap px-2 py-1.5 text-right",t<0&&"text-positive"),children:t<0?`−${(0,f.money)(-t)}`:(0,f.money)(t)}),(0,i.jsx)("td",{className:"tnum whitespace-nowrap py-1.5 pl-2 text-right font-medium",children:0>Number(e.balance_minor)?`${(0,f.money)(-Number(e.balance_minor))} credit`:(0,f.money)(e.balance_minor)})]},a)})})]})}):(0,i.jsx)("p",{className:"mt-3 text-[0.8438rem] text-ink-3",children:"Nothing on this account yet."})}function v(e,i){let{session:a}=(0,u.useSession)(),s=(0,n.useQueryClient)();return(0,t.useMutation)({mutationFn:i=>(0,m.runAs)(a,a=>a(e,i)),onSuccess:()=>{s.invalidateQueries({queryKey:["db"]}),i()}})}function g({account:e,onClose:t}){let[n,s]=a.useState(""),[r,d]=a.useState(""),l=(0,f.toMinor)(n),c=v(p.ADD_FAMILY_CREDIT,t);return(0,i.jsxs)(o.RecordSheet,{title:"Add credit",subtitle:`${e.name}. It comes off what they owe now, then their next invoices.`,onClose:t,onSave:()=>c.mutate([e.id,l,r.trim()]),saving:c.isPending,error:c.error,canSave:null!=l&&l>0&&r.trim().length>=3,saveLabel:"Add credit",children:[(0,i.jsx)(_.Field,{label:"Amount",htmlFor:"cr-a",required:!0,error:n&&null==l?"Enter an amount like 5.00":void 0,children:(0,i.jsx)(_.Input,{id:"cr-a",inputMode:"decimal",placeholder:"0.00",value:n,onChange:e=>s(e.target.value),className:"tnum"})}),(0,i.jsx)(_.Field,{label:"Why",htmlFor:"cr-r",required:!0,hint:"Kept in the account history. The family sees “Credit from the studio”.",children:(0,i.jsx)(_.Input,{id:"cr-r",value:r,onChange:e=>d(e.target.value),maxLength:200,placeholder:"Class cancelled 1 Dec"})})]})}function j({account:e,onClose:t}){let[n,s]=a.useState(Number(e.open_minor)>0?(Number(e.open_minor)/100).toFixed(2):""),[r,d]=a.useState("bank_transfer"),[l,c]=a.useState(""),m=(0,f.toMinor)(n),u=v(p.RECORD_PAYMENT,t);return(0,i.jsxs)(o.RecordSheet,{title:"Record a payment",subtitle:`${e.name}. Applied to their oldest open invoices first; anything over is held as credit.`,onClose:t,onSave:()=>u.mutate([e.id,m,r,null,l||null]),saving:u.isPending,error:u.error,canSave:null!=m&&m>0,saveLabel:"Record payment",children:[(0,i.jsx)(_.Field,{label:"Amount",htmlFor:"poa-a",required:!0,error:n&&null==m?"Enter an amount like 45.00":void 0,children:(0,i.jsx)(_.Input,{id:"poa-a",inputMode:"decimal",value:n,onChange:e=>s(e.target.value),className:"tnum"})}),(0,i.jsx)(_.Field,{label:"How it was paid",htmlFor:"poa-m",children:(0,i.jsxs)(_.Select,{id:"poa-m",value:r,onChange:e=>d(e.target.value),children:[(0,i.jsx)("option",{value:"bank_transfer",children:"Bank transfer"}),(0,i.jsx)("option",{value:"cash",children:"Cash"})]})}),(0,i.jsx)(_.Field,{label:"Note",htmlFor:"poa-n",hint:`Their reference is ${e.reference}.`,children:(0,i.jsx)(_.Input,{id:"poa-n",value:l,onChange:e=>c(e.target.value),maxLength:200})})]})}e.s(["FamilyAccount",0,function({familyId:e}){let t=(0,c.useRow)(["family-account",e],p.FAMILY_ACCOUNT,[e]),[n,s]=a.useState(null),[o,m]=a.useState(!1),u=t.data,b=Number(u?.balance_minor??0);return(0,i.jsxs)("div",{children:[t.isLoading&&(0,i.jsx)(_.Skeleton,{className:"h-10"}),null!=t.error&&(0,i.jsx)(_.ErrorState,{error:t.error}),u&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)("p",{className:"text-sm",children:[b>0&&(0,i.jsxs)(i.Fragment,{children:["Owes ",(0,i.jsx)("span",{className:"tnum font-medium",children:(0,f.money)(b)})," in total."]}),0===b&&"Nothing owed.",b<0&&(0,i.jsxs)(i.Fragment,{children:["In credit by ",(0,i.jsx)("span",{className:"tnum font-medium",children:(0,f.money)(-b)}),". It comes off their next invoice."]})]}),(0,i.jsxs)("p",{className:"mt-0.5 text-[0.8125rem] text-ink-3",children:["Payment reference ",(0,i.jsx)("span",{className:"tnum font-medium text-ink-2",children:u.reference})]}),(0,i.jsxs)("div",{className:"mt-2 flex flex-wrap gap-2",children:[(0,i.jsxs)(_.Button,{size:"sm",onClick:()=>s("pay"),children:[(0,i.jsx)(r,{className:"size-4","aria-hidden":!0})," Record payment"]}),(0,i.jsxs)(_.Button,{size:"sm",variant:"ghost",onClick:()=>s("credit"),children:[(0,i.jsx)(l,{className:"size-4","aria-hidden":!0})," Add credit"]}),(0,i.jsxs)(_.Button,{size:"sm",variant:"ghost","aria-expanded":o,onClick:()=>m(e=>!e),children:["Statement ",(0,i.jsx)(d.ChevronDown,{className:(0,h.cn)("size-4 transition-transform",o&&"rotate-180"),"aria-hidden":!0})]})]}),o&&(0,i.jsx)(x,{familyId:e})]}),u&&"credit"===n&&(0,i.jsx)(g,{account:u,onClose:()=>s(null)}),u&&"pay"===n&&(0,i.jsx)(j,{account:u,onClose:()=>s(null)})]})}],9627)},85351,e=>{"use strict";var i=e.i(43476),a=e.i(71645),t=e.i(54616),n=e.i(12598),s=e.i(7233),r=e.i(37727),d=e.i(17658),l=e.i(45060),o=e.i(13927),c=e.i(30224),m=e.i(31502),u=e.i(36261);function _({className:e,children:a,...t}){return(0,i.jsx)("section",{...t,className:(0,l.cn)("min-w-0",e),children:a})}function p({title:e,subtitle:a,action:t,className:n}){return(0,i.jsxs)("div",{className:(0,l.cn)("border-b-2 border-ink pb-2",n),children:[(0,i.jsxs)("div",{className:"flex min-h-9 items-center gap-3",children:[(0,i.jsx)("h2",{className:"section-title min-w-0 flex-1",children:e}),t]}),a&&(0,i.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:a})]})}function f(){let{session:e}=(0,m.useSession)(),i=(0,n.useQueryClient)();return(0,t.useMutation)({mutationFn:i=>(0,c.runAs)(e,e=>e(i.sql,i.params)),onSuccess:()=>i.invalidateQueries({queryKey:["db"]})})}function h(){let e=(0,o.useRows)(["skill-publish"],u.SKILL_PUBLISH),a=f(),t=e.data?.[0];return t?(0,i.jsxs)("fieldset",{className:"pt-4",children:[(0,i.jsx)("legend",{className:"text-[0.875rem] font-semibold",children:"When families see a new level"}),null!=a.error&&(0,i.jsx)("div",{className:"pt-2",children:(0,i.jsx)(d.ErrorState,{error:a.error})}),[["with_share","When the teacher shares it","Levels wait with the class feedback until the teacher taps Share. A mistake can be put right first."],["immediate","Straight away","Each level is visible to the family as soon as it is set."]].map(([e,n,s])=>(0,i.jsxs)("label",{className:"flex min-h-11 cursor-pointer items-start gap-3 py-1",children:[(0,i.jsx)("input",{type:"radio",name:"skill-publish",className:"mt-1 size-4 accent-[var(--color-accent)]",checked:t.skill_publish===e,onChange:()=>a.mutate({sql:u.SET_SKILL_PUBLISH,params:[t.id,e]})}),(0,i.jsxs)("span",{children:[(0,i.jsx)("span",{className:"block text-[0.9375rem] font-medium",children:n}),(0,i.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:s})]})]},e))]}):null}e.s(["ChipSettings",0,function(){let e=(0,o.useRows)(["chips"],u.CHIPS),t=f(),[n,l]=a.useState({});return(0,i.jsxs)(_,{children:[(0,i.jsx)(p,{title:"Feedback phrases",subtitle:"What teachers tap after class. Keep them short and kind. Teachers can keep their own set for a class."}),null!=t.error&&(0,i.jsx)("div",{className:"pt-3",children:(0,i.jsx)(d.ErrorState,{error:t.error})}),["standard","under_8"].map(a=>(0,i.jsxs)("div",{className:"pt-4",children:["under_8"===a&&(0,i.jsxs)("p",{className:"mb-1 text-[0.875rem] font-semibold",children:["For classes up to age 8 ",(0,i.jsx)("span",{className:"font-normal text-ink-3",children:"· simple words, a sticker each"})]}),(0,i.jsx)("div",{className:"grid gap-x-10 gap-y-6 pt-2 sm:grid-cols-2",children:["going_well","work_on"].map(o=>{let c=`${a}-${o}`;return(0,i.jsxs)("div",{children:[(0,i.jsx)("p",{className:"mb-2 font-semibold",children:"going_well"===o?"Going well":"To work on"}),(0,i.jsx)("div",{className:"flex flex-wrap gap-1.5",children:e.data?.filter(e=>e.kind===o&&(e.band??"standard")===a).map(e=>(0,i.jsxs)("span",{className:"inline-flex items-center gap-0.5 rounded-[var(--radius-md)] border border-line-strong bg-surface py-0.5 pl-2.5 pr-0.5 text-[0.875rem]",children:[e.sticker&&(0,i.jsx)("span",{"aria-hidden":!0,className:"mr-1",children:e.sticker}),e.label,(0,i.jsx)("button",{"aria-label":`Remove ${e.label}`,onClick:()=>t.mutate({sql:u.REMOVE_CHIP,params:[e.id]}),className:"grid size-8 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical",children:(0,i.jsx)(r.X,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),(0,i.jsxs)("form",{className:"mt-2 flex gap-1.5",onSubmit:e=>{e.preventDefault();let i=(n[c]??"").trim();i&&(t.mutate("standard"===a?{sql:u.ADD_CHIP,params:[o,i]}:{sql:u.ADD_YOUNG_CHIP,params:[o,i,""]}),l(e=>({...e,[c]:""})))},children:[(0,i.jsx)(d.Input,{"aria-label":`Add a ${"going_well"===o?"going well":"to work on"} phrase${"under_8"===a?" for young classes":""}`,placeholder:"Add a phrase",maxLength:40,value:n[c]??"",onChange:e=>l(i=>({...i,[c]:e.target.value})),className:"h-9 text-[0.875rem]"}),(0,i.jsx)(d.Button,{size:"sm",type:"submit","aria-label":"Add",children:(0,i.jsx)(s.Plus,{className:"size-4","aria-hidden":!0})})]})]},o)})})]},a))]})},"FrameworkSettings",0,function(){let e=(0,o.useRows)(["frameworks"],u.FRAMEWORKS),t=f(),[n,l]=a.useState({});return(0,i.jsxs)(_,{children:[(0,i.jsx)(p,{title:"Skills teachers assess",subtitle:"One list per style. Teachers set each child’s level; families and students see it."}),(0,i.jsx)(h,{}),e.isLoading&&(0,i.jsx)("div",{className:"pt-3",children:(0,i.jsx)(d.Skeleton,{className:"h-24"})}),null!=t.error&&(0,i.jsx)("div",{className:"pt-3",children:(0,i.jsx)(d.ErrorState,{error:t.error})}),(0,i.jsx)("div",{className:"grid gap-x-10 gap-y-6 pt-4 sm:grid-cols-2",children:e.data?.map(e=>(0,i.jsxs)("div",{className:"min-w-0",children:[(0,i.jsx)("p",{className:"border-b border-line pb-1.5 font-semibold",children:e.style??e.name}),(0,i.jsx)("ul",{className:"divide-y divide-line",children:e.skills.map(e=>(0,i.jsxs)("li",{className:"group flex min-h-10 items-center gap-1 text-[0.875rem]",children:[(0,i.jsx)("input",{"aria-label":`Rename ${e.name}`,defaultValue:e.name,onBlur:i=>i.target.value.trim()&&i.target.value.trim()!==e.name&&t.mutate({sql:u.RENAME_SKILL,params:[e.id,i.target.value]}),className:"min-w-0 flex-1 rounded-[var(--radius-sm)] bg-transparent px-1 py-1.5 hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-line"}),(0,i.jsx)("button",{"aria-label":`Remove ${e.name}`,onClick:()=>t.mutate({sql:u.REMOVE_SKILL,params:[e.id]}),className:"grid size-9 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical",children:(0,i.jsx)(r.X,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),(0,i.jsxs)("form",{className:"mt-2 flex gap-1.5",onSubmit:i=>{i.preventDefault();let a=(n[e.id]??"").trim();a&&(t.mutate({sql:u.ADD_SKILL,params:[e.id,a]}),l(i=>({...i,[e.id]:""})))},children:[(0,i.jsx)(d.Input,{"aria-label":`Add a skill to ${e.style}`,placeholder:"Add a skill",value:n[e.id]??"",onChange:i=>l(a=>({...a,[e.id]:i.target.value})),className:"h-9 text-[0.875rem]"}),(0,i.jsx)(d.Button,{size:"sm",type:"submit","aria-label":"Add",children:(0,i.jsx)(s.Plus,{className:"size-4","aria-hidden":!0})})]})]},e.id))})]})},"SettingsHead",0,p,"SettingsSection",0,_])},80505,e=>{"use strict";let i=/^-?\d+(\.\d+)?$/;function a(e){if(null==e)return"";let a=e instanceof Date?e.toISOString().slice(0,10):String(e);return/^[=+\-@\t\r]/.test(a)&&!i.test(a)&&(a=`'${a}`),/[",\n\r]/.test(a)?`"${a.replace(/"/g,'""')}"`:a}e.s(["downloadCsv",0,function(e,i,t){let n,s=new Blob(["\uFEFF"+([(n=t??(i[0]?Object.keys(i[0]):[])).map(e=>a(e.replace(/_/g," "))).join(","),...i.map(e=>n.map(i=>a(e[i])).join(","))].join("\r\n")+"\r\n")],{type:"text/csv;charset=utf-8"}),r=URL.createObjectURL(s),d=Object.assign(document.createElement("a"),{href:r,download:e});document.body.appendChild(d),d.click(),d.remove(),setTimeout(()=>URL.revokeObjectURL(r),1e3)},"parseCsv",0,function(e){let i=[],a=[],t="",n=!1,s=e.replace(/^﻿/,"");for(let e=0;e<s.length;e++){let r=s[e];n?'"'===r?'"'===s[e+1]?(t+='"',e++):n=!1:t+=r:'"'===r&&""===t?n=!0:","===r?(a.push(t),t=""):"\n"===r||"\r"===r?("\r"===r&&"\n"===s[e+1]&&e++,a.push(t),t="",a.some(e=>""!==e.trim())&&i.push(a),a=[]):t+=r}return a.push(t),a.some(e=>""!==e.trim())&&i.push(a),i}])},59130,e=>{"use strict";let i={draft:{label:"Draft",tone:"neutral"},issued:{label:"Due",tone:"caution"},part_paid:{label:"Part paid",tone:"caution"},paid:{label:"Paid",tone:"positive"},void:{label:"Void",tone:"neutral"},refunded:{label:"Refunded",tone:"info"}};e.s(["invoiceState",0,function(e,a=new Date){return e.failed?{label:"Card declined",tone:"critical"}:e.overdue??function(e,i=new Date){let a,t;return!("issued"!==(a=e.status)&&"part_paid"!==a&&"refunded"!==a||!e.due_on||null!=e.total_minor&&null!=e.paid_minor&&Number(e.total_minor)<=Number(e.paid_minor))&&((t=e.due_on)instanceof Date?t.toISOString():String(t??"")).slice(0,10)<i.toISOString().slice(0,10)}(e,a)?{label:"part_paid"===e.status?"Overdue · part paid":"Overdue",tone:"caution"}:i[e.status]??i.draft}])},50293,e=>{"use strict";let i=`
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
 where i.id = $1`,r=`
select it.id, it.kind, it.description, it.quantity, it.unit_minor, it.discount_minor, it.total_minor,
       s.first_name as student_name
  from invoice_item it left join student s on s.id = it.student_id
 where it.invoice_id = $1 and it.deleted_at is null
 order by it.created_at`,d=`
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
 order by f.created_at limit 1`,b=`
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`,y=`
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`,x=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`,v=`
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`,g=`
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.deleted_at is null and d.ended_at is null and (d.ends_on is null or d.ends_on >= current_date)
 order by f.name`,j=`
insert into family_discount (family_id, kind, amount, reason, note, starts_on, ends_on)
values ($1, $2, $3, $4, nullif($5, ''), coalesce($6::date, current_date), $7::date) returning id`,N=`
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
 where i.deleted_at is null order by i.number`,S=`
select p.succeeded_at::date as date, f.name as family, i.number as invoice, p.method,
       round(p.amount_minor / 100.0, 2) as amount,
       case when p.failure_code is not null then 'failed' when p.succeeded_at is null then 'pending' else 'succeeded' end as status,
       p.provider_ref as reference
  from payment p join family f on f.id = p.family_id left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null order by p.created_at`,$=`
select coalesce(b.mode, 'family') as mode, b.guardian_a, b.guardian_b, b.percent_a
  from family f left join family_billing b on b.family_id = f.id
 where f.id = $1`,k=`
select id, full_name from guardian where family_id = $1 and deleted_at is null order by is_primary desc, full_name`,E=`
select s.id, s.first_name, x.guardian_id
  from student s left join family_billing_child x on x.student_id = s.id
 where s.family_id = $1 and s.deleted_at is null order by s.date_of_birth`,C=`
select ac.id, ac.created_at, ac.family_id, f.name as family_name, s.first_name as child,
       app.session_label(ac.session_id) as session_label, ac.amount_minor, ac.status
  from absence_credit ac join family f on f.id = ac.family_id join student s on s.id = ac.student_id
 order by ac.created_at desc limit 50`,A=`
select id, absence_credit, absence_credit_fixed_minor, makeup_policy from studio where id in (select app.studio_ids()) limit 1`,L=`
update studio set absence_credit = $2, absence_credit_fixed_minor = $3 where id = $1 returning id`;e.s(["ABSENCE_CREDITS",0,C,"ABSENCE_CREDIT_SETTING",0,A,"ADD_FAMILY_CREDIT",0,"select app.add_family_credit($1, $2, $3) as id","ADD_FAMILY_DISCOUNT",0,j,"AGED_DEBT_EXPORT",0,w,"BANK_DETAILS",0,f,"BILLING_LINES",0,"select * from app.billing_lines($1, $2::date, $3::uuid[])","BILLING_RUNS",0,v,"BILLING_SKIPPED",0,"select * from app.billing_skipped($1, $2::date)","BILLING_TERMS",0,"select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc","CLASS_LOCATIONS",0,"select c.id, l.name as location from class c join location l on l.id = c.location_id where c.deleted_at is null","CREATE_BILLING_RUN",0,"select app.create_billing_run($1, $2::date, $3::date, $4::uuid[], $5) as id","CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","DISCARD_BILLING_RUN",0,"select app.discard_billing_run($1)","DISCOUNT_RULES",0,"select id, kind, from_nth, percent, enabled from discount_rule order by kind desc","END_FAMILY_DISCOUNT",0,"select app.end_family_discount($1)","FAMILY_ACCOUNT",0,m,"FAMILY_BILLABLE",0,o,"FAMILY_BILLING",0,$,"FAMILY_BILLING_CHILDREN",0,E,"FAMILY_DISCOUNTS",0,g,"FAMILY_GUARDIANS",0,k,"FAMILY_OPTIONS",0,l,"FAMILY_PICK",0,"select id, name from family where deleted_at is null and not is_prospect order by name","FAMILY_STATEMENT",0,u,"INVOICE",0,s,"INVOICES",0,n,"INVOICES_EXPORT",0,I,"INVOICE_CREDIT_NOTES",0,c,"INVOICE_ITEMS",0,r,"INVOICE_PAYMENTS",0,d,"ISSUE_BILLING_RUN",0,"select app.issue_billing_run($1) as n","ISSUE_CREDIT_NOTE",0,"select app.issue_credit_note($1, $2, $3, $4) as id","ISSUE_INVOICE",0,"select app.issue_invoice($1)","MY_PAYMENT_INFO",0,h,"NOTIFY_DUE",0,"select app.notify_invoices_due() as n","OVERDUE_FAMILIES",0,_,"PAYMENTS_EXPORT",0,S,"PRIMARY_GUARDIAN",0,y,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3, $4)","REMINDER_PREVIEW",0,p,"REMINDER_TEMPLATE",0,b,"SEND_DIRECT",0,x,"SEND_REMINDERS",0,"select app.send_payment_reminders($1::uuid[], $2, $3) as sent","SET_ABSENCE_CREDIT",0,L,"SET_BANK_DETAILS",0,"select app.set_bank_details($1, $2, $3, $4, $5)","SET_DISCOUNT_RULE",0,"update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id","SET_FAMILY_BILLING",0,"select app.set_family_billing($1, $2, $3, $4, $5, $6::jsonb)","SUMMARY",0,i,"UPCOMING_COSTS",0,"select * from app.upcoming_costs($1::uuid)","VOID_INVOICE",0,"select app.void_invoice($1, $2)","XERO_EXPORT",0,N])},55831,e=>{"use strict";var i=e.i(71645),a=e.i(18566);e.s(["useSelection",0,function(e="id"){let t=(0,a.useRouter)(),n=(0,a.usePathname)(),s=(0,a.useSearchParams)();return{selected:s.get(e),select:i.useCallback(i=>{let a=new URLSearchParams(Array.from(s.entries()));i?a.set(e,i):a.delete(e);let r=a.toString();t.replace(r?`${n}?${r}`:n,{scroll:!1})},[s,n,t,e])}}])}]);