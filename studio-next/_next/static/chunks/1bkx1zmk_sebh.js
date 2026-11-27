(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,72520,e=>{"use strict";let t=(0,e.i(75254).default)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);e.s(["ArrowRight",0,t],72520)},74886,e=>{"use strict";let t=(0,e.i(75254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",0,t],74886)},7233,e=>{"use strict";let t=(0,e.i(75254).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,t],7233)},28345,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(22016),a=e.i(13927),n=e.i(45060),d=e.i(17658);let r=`
select cs.id, cs.original_starts_at, cs.cancel_reason, cs.changed_at,
       (cs.room_id is not null and cs.room_id is distinct from c.room_id) as room_moved,
       (cs.teacher_id is not null and cs.teacher_id is distinct from c.teacher_id) as covered
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = any($1::uuid[])`;function l({word:e,tone:s="ink"}){return(0,t.jsx)(d.Word,{size:"md",tone:s,children:e})}e.s(["SessionRow",0,function({time:e,name:s,meta:a,href:r,cancelled:o,reason:c,moved:m,style:_,colour:u,extra:p}){let h=(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("span",{className:(0,n.cn)("font-display text-[1.1875rem] leading-tight tnum",o&&"text-ink-3 line-through"),children:e}),(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsx)("span",{className:(0,n.cn)("block font-semibold leading-snug",o&&"text-ink-3"),children:s}),(0,t.jsxs)("span",{className:"mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-ink-3",children:[o&&(0,t.jsx)(l,{word:"Cancelled",tone:"critical"}),!o&&m&&(0,t.jsx)(l,{word:"Moved"}),o&&c?(0,t.jsx)("span",{children:c}):(0,t.jsx)("span",{className:"min-w-0",children:a.filter(Boolean).join(" · ")}),!o&&(0,t.jsx)(d.StyleMark,{style:_??null,colour:u}),p]})]})]}),f="grid min-h-[56px] grid-cols-[4.25rem_minmax(0,1fr)] items-start gap-x-4 py-3";return(0,t.jsx)("li",{children:r?(0,t.jsx)(i.default,{href:r,"aria-label":`${s}, ${e}${o?", cancelled":""}${m?", moved":""}`,className:(0,n.cn)(f,"hover:bg-surface-2/60"),children:h}):(0,t.jsx)("div",{className:f,children:h})})},"dayDate",0,function(e){return new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:"Europe/London"}).format(new Date(e))},"dueWord",0,function(e){return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:"Europe/London"}).format(new Date(e))},"useSessionChanges",0,function(e){let t=[...new Set(e)].sort(),i=(0,a.useRows)(["session-changes",t.join(",")],r,[t],{enabled:t.length>0});return s.useMemo(()=>new Map((i.data??[]).map(e=>[e.id,e])),[i.data])}])},79624,e=>{"use strict";var t=e.i(43476),s=e.i(40284),i=e.i(71645),a=e.i(22016),n=e.i(72520),d=e.i(77326),r=e.i(12004),l=e.i(13927),o=e.i(17658),c=e.i(8199),m=e.i(27389),_=e.i(33204),u=e.i(75379),p=e.i(45060),h=e.i(10033),f=e.i(28345),y=e.i(90514),x=e.i(28793);function g({s:e,c:s,later:i}){let n="cancelled"===e.status,d=(0,u.relativeDay)(e.starts_at),r="Today"===d,l=!!s&&(!!s.original_starts_at||s.room_moved);return(0,t.jsx)("li",{children:(0,t.jsxs)(a.default,{href:`/class/?id=${e.class_id}`,"aria-label":`${e.name}, ${d} ${(0,u.time)(e.starts_at)}${n?", cancelled":""}`,className:"grid min-h-[56px] grid-cols-[4.75rem_minmax(0,1fr)] items-start gap-x-4 py-3 hover:bg-surface-2/60",children:[(0,t.jsxs)("span",{children:[(0,t.jsx)("span",{className:(0,p.cn)("block text-[0.7812rem]",r?"font-semibold text-ink":"text-ink-3"),children:i?(0,f.dayDate)(e.starts_at):d.length>9?d.slice(0,3):d}),(0,t.jsx)("span",{className:(0,p.cn)("block font-display text-[1.1875rem] leading-tight tnum",n&&"text-ink-3 line-through"),children:(0,u.time)(e.starts_at)})]}),(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsx)("span",{className:(0,p.cn)("block truncate font-semibold",n&&"text-ink-3"),children:e.name}),n?(0,t.jsxs)("span",{className:"mt-0.5 block text-[0.8125rem] text-ink-3",children:[(0,t.jsx)("span",{className:"font-display text-[0.9375rem] uppercase leading-none tracking-[-0.01em] text-critical [font-stretch:80%]",children:"Cancelled"}),b(s)]}):(0,t.jsxs)("span",{className:"mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-ink-3",children:[l&&(0,t.jsx)("span",{className:"font-display text-[0.9375rem] uppercase leading-none tracking-[-0.01em] text-ink [font-stretch:80%]",children:"Moved"}),(0,t.jsx)("span",{className:"min-w-0 truncate",children:[s?.covered&&e.teacher?`${e.teacher} (cover)`:e.teacher,e.room].filter(Boolean).join(" · ")}),(0,t.jsx)(o.StyleMark,{style:e.style,colour:e.colour,className:"hidden sm:inline-flex"})]})]})]})})}let b=e=>e?.cancel_reason?(0,t.jsxs)(t.Fragment,{children:[" · ",e.cancel_reason]}):null;e.s(["default",0,function(){let e,[p]=i.useMemo(()=>(0,u.dayRange)(0),[]),b=i.useMemo(()=>{let e=new Date(p);return e.setDate(e.getDate()+14),e.toISOString()},[p]),v=i.useMemo(()=>{let e=new Date(p);return e.setDate(e.getDate()+7),e.getTime()},[p]),j=(0,l.useRows)(["my-schedule",p],c.MY_SCHEDULE,[p,b]),w=(0,l.useRows)(["my-children"],c.MY_CHILDREN);(0,x.useDueReminders)();let N=(0,l.useRow)(["my-balance"],c.MY_BALANCE),$=(0,l.useRows)(["my-invoices"],c.MY_INVOICES),k=(0,l.useRows)(["my-messages"],c.MY_MESSAGES),E=(0,l.useRows)(["broadcasts"],_.BROADCASTS),S=(0,l.useRows)(["feedback"],m.STUDENT_FEEDBACK),I=((0,l.useRows)(["my-children-logins"],c.MY_CHILDREN_LOGINS).data??[]).filter(e=>"pending"===e.state).length,C=j.data??[],T=(0,f.useSessionChanges)(C.map(e=>e.id)),R=i.useMemo(()=>(w.data??[]).map(e=>{let t=C.filter(t=>t.student_id===e.id),s=t.filter(e=>new Date(e.starts_at).getTime()<v);return{child:e,week:s,later:s.length?[]:t.slice(0,1)}}),[w.data,C,v]),A=i.useMemo(()=>{let e=new Map;return C.forEach(t=>{let s=T.get(t.id);if(!s||"cancelled"===t.status||!(s.original_starts_at||s.room_moved||s.covered))return;let i=e.get(t.id);i?i.kids.push(t.child):e.set(t.id,{s:t,kids:[t.child],c:s})}),[...e.values()]},[C,T]),D=!!N.data&&Number(N.data.balance_minor)>0,L=($.data??[]).filter(e=>"issued"===e.status||"part_paid"===e.status),M=L.map(e=>e.due_on).filter(Boolean).sort()[0],O=(E.data??[]).filter(e=>!e.read_by_me&&!e.scheduled),P=j.isLoading||w.isLoading,Y=Math.min(2,Math.max(1,4-A.length-!!D));return(0,t.jsx)(d.Shell,{title:"This week",subtitle:(0,u.dateLong)(new Date),allow:["guardian"],children:(0,t.jsxs)("div",{className:"mx-auto grid max-w-[1080px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",children:[(0,t.jsxs)("div",{className:"min-w-0 space-y-10",children:[(A.length>0||D||O.length>0||I>0)&&(0,t.jsxs)("section",{"aria-labelledby":"notices-h",children:[(0,t.jsx)(o.SectionHead,{id:"notices-h",title:"Notices"}),(0,t.jsxs)("ul",{className:"on-count divide-y divide-line",children:[(0,t.jsx)(h.PendingLogins,{}),A.map(({s:e,kids:s,c:i})=>{var n,d,r,l;let c;return(0,t.jsx)("li",{className:"py-3.5",children:(0,t.jsx)(a.default,{href:`/class/?id=${e.class_id}`,className:"block rounded-[var(--radius-sm)] hover:bg-surface-2/60",children:(0,t.jsx)(o.Notice,{word:i.original_starts_at||i.room_moved?"Moved":"Changed",title:(n=e,d=i,c=(0,f.dayDate)(n.starts_at),d.original_starts_at&&new Date(d.original_starts_at).getTime()!==new Date(n.starts_at).getTime()?(0,f.dayDate)(d.original_starts_at)===c?`${n.name} on ${c} moves to ${(0,u.time)(n.starts_at)}`:`${n.name} on ${(0,f.dayDate)(d.original_starts_at)} moves to ${c}, ${(0,u.time)(n.starts_at)}`:d.room_moved&&n.room?`${n.name} on ${c} moves to ${n.room}`:d.covered&&n.teacher?`${n.teacher} teaches ${n.name} on ${c}`:`${n.name} on ${c} has changed`),detail:[s.join(" and "),(r=e,(l=i).original_starts_at?l.room_moved&&r.room?`In ${r.room}`:null:l.room_moved?"Same time":l.covered?"Cover teacher, same time and room":null)].filter(Boolean).join(" · ")})})},e.id)}),D&&(0,t.jsx)("li",{className:"py-3.5",children:(0,t.jsx)(a.default,{href:"/family/payments",className:"block rounded-[var(--radius-sm)] hover:bg-surface-2/60",children:(0,t.jsx)(o.Notice,{tone:"caution",word:M?`Due ${(0,f.dueWord)(M)}`:"Due",title:`${(0,u.money)(N.data.balance_minor)} to pay`,detail:N.data.failed>0?"A card payment did not go through.":`${L.length||N.data.unpaid} invoice${1===(L.length||N.data.unpaid)?"":"s"}${L[0]?` \xb7 ${L.map(e=>e.number).join(", ")}`:""}`})})}),O.slice(0,Y).map(e=>(0,t.jsx)("li",{className:"py-3.5",children:(0,t.jsx)(a.default,{href:"/family/messages",className:"block rounded-[var(--radius-sm)] hover:bg-surface-2/60",children:(0,t.jsx)(o.Notice,{word:"New",title:e.subject||e.body,detail:`${e.class_name??"The studio"} \xb7 ${(0,u.relativeDay)(e.sent_at)}`})})},e.id))]}),O.length>Y&&(0,t.jsxs)(a.default,{href:"/family/messages",className:"mt-1 inline-flex min-h-[44px] items-center gap-1 text-[0.8438rem] font-semibold text-accent-text hover:underline",children:[O.length-Y," more new notice",O.length-Y==1?"":"s",(0,t.jsx)(n.ArrowRight,{className:"size-3.5","aria-hidden":!0})]})]}),P&&(0,t.jsx)("div",{className:"space-y-3",children:[0,1,2].map(e=>(0,t.jsx)(o.Skeleton,{className:"h-14"},e))}),null!=j.error&&(0,t.jsx)(o.ErrorState,{error:j.error,onRetry:()=>j.refetch()}),!P&&0===R.length&&(0,t.jsx)(o.EmptyState,{title:"No children on your account yet",body:"Add a child and choose their classes. Their week shows here.",action:(0,t.jsx)(a.default,{href:"/family/children",children:(0,t.jsx)(o.Button,{tabIndex:-1,children:"Your family"})})}),R.map(({child:e,week:s,later:i})=>{let n=(0,u.ageFrom)(e.date_of_birth),d=s.filter(e=>"cancelled"!==e.status).length;return(0,t.jsxs)("section",{"aria-labelledby":`kid-${e.id}`,children:[(0,t.jsxs)("div",{className:"mb-1 flex items-baseline gap-3 border-b-2 border-ink pb-2",children:[(0,t.jsx)("h2",{id:`kid-${e.id}`,className:"font-display text-[1.375rem] leading-none",children:e.first_name}),(0,t.jsxs)("span",{className:"min-w-0 flex-1 truncate text-[0.8125rem] text-ink-3",children:[null!=n?`${n} \xb7 `:"",s.length?`${d} class${1===d?"":"es"} this week`:i.length?"Nothing this week":"No classes booked"]}),(0,t.jsx)(a.default,{href:"/family/schedule",className:"shrink-0 text-[0.8125rem] font-semibold text-accent-text hover:underline",children:"Schedule"})]}),0===s.length&&0===i.length?(0,t.jsxs)("p",{className:"py-3 text-[0.9062rem] text-ink-2",children:[e.class_names?"No classes in the next two weeks.":`${e.first_name} isn’t in a class yet. `,!e.class_names&&(0,t.jsx)(a.default,{href:"/family/children",className:"font-semibold text-accent-text hover:underline",children:"Find a class"})]}):(0,t.jsx)("ul",{className:"divide-y divide-line",children:[...s,...i].map(e=>(0,t.jsx)(g,{s:e,c:T.get(e.id),later:!s.length},`${e.id}-${e.student_id}`))})]},e.id)})]}),(0,t.jsxs)("div",{className:"min-w-0 space-y-10",children:[(0,t.jsx)(r.MakeUpOffers,{}),(0,t.jsxs)("section",{"aria-labelledby":"pay-h",children:[(0,t.jsx)(o.SectionHead,{id:"pay-h",title:"Payments",href:"/family/payments",link:D?"Invoices":"History"}),N.isLoading&&(0,t.jsx)(o.Skeleton,{className:"mt-3 h-16"}),N.data&&(D?(0,t.jsxs)("div",{className:"flex flex-wrap items-end gap-x-6 gap-y-3 pt-3",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("p",{className:"label",children:["Due",M?` ${(0,f.dueWord)(M)}`:""]}),(0,t.jsx)("p",{className:"stat-number mt-1 text-[2rem] leading-none tnum",children:(0,u.money)(N.data.balance_minor)}),(0,t.jsx)("p",{className:"mt-1.5 text-[0.8125rem] text-ink-3",children:N.data.failed>0?"A card payment did not go through.":`${N.data.unpaid} invoice${1===N.data.unpaid?"":"s"} outstanding`})]}),(0,t.jsx)(a.default,{href:"/family/payments",children:(0,t.jsx)(o.Button,{variant:"primary",size:"lg",tabIndex:-1,children:(0,y.cardPaymentsEnabled)()?`Pay ${(0,u.money)(N.data.balance_minor)}`:"See how to pay"})})]}):(0,t.jsxs)("p",{className:"py-3 text-[0.9375rem] text-ink-2",children:[(0,t.jsx)("span",{className:"font-semibold text-positive",children:"Paid."})," Nothing is due."]}))]}),(S.data?.length??0)>0&&(e=S.data[0],(0,t.jsxs)("section",{"aria-labelledby":"fb-h",children:[(0,t.jsx)(o.SectionHead,{id:"fb-h",title:"Latest feedback",href:`/family/feedback?child=${e.student_id}`,link:"All feedback"}),(0,t.jsxs)("figure",{className:"pt-3",children:[(0,t.jsxs)("blockquote",{className:"text-[1rem] leading-snug text-ink",children:["“",e.going_well??e.headline,"”"]}),(0,t.jsx)("figcaption",{className:"mt-1.5 text-[0.8125rem] text-ink-3",children:[e.author,`about ${e.student_name.split(" ")[0]}`,e.class_name,e.shared_at?(0,u.relativeDay)(e.shared_at):null].filter(Boolean).join(" · ")})]})]})),(0,t.jsxs)("section",{"aria-labelledby":"studio-h",children:[(0,t.jsx)(o.SectionHead,{id:"studio-h",title:"From the studio",href:"/family/messages",link:"Messages"}),k.isLoading&&(0,t.jsx)(o.Skeleton,{className:"mt-3 h-16"}),k.data?.length===0&&(0,t.jsx)("p",{className:"py-3 text-[0.9062rem] text-ink-3",children:"Nothing from the studio yet."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:k.data?.filter(e=>!O.slice(0,Y).some(t=>t.id===e.id)).slice(0,3).map(e=>(0,t.jsxs)("li",{className:"py-3",children:[(0,t.jsx)("p",{className:"font-semibold leading-snug",children:e.subject}),(0,t.jsx)("p",{className:"mt-0.5 line-clamp-2 text-[0.875rem] text-ink-2",children:e.body}),(0,t.jsxs)("p",{className:"mt-1 text-[0.7812rem] text-ink-3",children:[e.class_name?`${e.class_name} \xb7 `:"",(0,u.relativeDay)(e.sent_at)]})]},e.id))})]}),(0,t.jsx)("nav",{"aria-label":"More",className:"divide-y divide-line border-t border-line",children:[["/family/events","Shows and events","Shows, exams, competitions, privates"],["/family/enquiries","Ask the studio","Questions, private lessons, medical updates"]].map(([e,s,i])=>(0,t.jsxs)(a.default,{href:e,className:"group flex min-h-[56px] items-center gap-3 py-3",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"block font-semibold",children:s}),(0,t.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:i})]}),(0,t.jsx)(n.ArrowRight,{className:"size-4 text-ink-3 group-hover:text-ink","aria-hidden":!0})]},e))}),(0,t.jsx)(s.MySchoolHero,{})]})]})})}])},12004,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(54616),a=e.i(12598),n=e.i(13927),d=e.i(30224),r=e.i(31502),l=e.i(17658),o=e.i(75379),c=e.i(45060);function m({studentId:e,firstName:_,self:u=!1,onDone:p}){let{session:h}=(0,r.useSession)(),f=(0,a.useQueryClient)(),y=(0,n.useRows)(["absence-options",e],"select * from app.absence_options($1, 42)",[e]),[x,g]=s.useState(new Set),[b,v]=s.useState(""),[j,w]=s.useState(null),N=(0,i.useMutation)({mutationFn:async()=>(0,d.runAs)(h,t=>t("select app.report_absence($1, $2::uuid[], $3) as n",[e,[...x],b.trim()||null])),onSuccess:e=>{w(e[0]?.n??x.size),f.invalidateQueries({queryKey:["db"]})}}),$=(0,i.useMutation)({mutationFn:async e=>(0,d.runAs)(h,t=>t("select app.withdraw_absence($1)",[e])),onSuccess:()=>f.invalidateQueries({queryKey:["db"]})});if(null!=j)return(0,t.jsxs)("div",{className:"py-2",children:[(0,t.jsx)(l.Notice,{word:"Done",tone:"positive",title:u?"Your teacher will see this on the register.":`${_}’s teacher will see this on the register.`,detail:`${1===j?"The class is":`${j} classes are`} marked “reported absent”. ${u?"Your family and the office have":"The office has"} a copy too. You can withdraw it here until the class starts.`}),(0,t.jsx)(l.Button,{className:"mt-4 w-full",variant:"primary",onClick:p,children:"Close"})]});let k=y.data??[],E=new Map;for(let e of k){let t=(0,o.dateLong)(e.starts_at);E.set(t,[...E.get(t)??[],e])}return(0,t.jsxs)("div",{className:"space-y-4",children:[y.isLoading&&(0,t.jsx)(l.Skeleton,{className:"h-32"}),null!=y.error&&(0,t.jsx)(l.ErrorState,{error:y.error}),y.data&&0===k.length&&(0,t.jsxs)("p",{className:"text-[0.9062rem] text-ink-2",children:[u?"You have":`${_} has`," no classes in the next six weeks. For anything else, send the studio a message."]}),k.length>0&&(0,t.jsxs)("fieldset",{children:[(0,t.jsxs)("legend",{className:"text-[0.875rem] font-semibold",children:["Which classes",u?" can’t you make":` will ${_} miss`,"?"]}),(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Tick each class. For several days in a row, tick each one."}),(0,t.jsx)("ul",{className:"mt-2 max-h-[40dvh] divide-y divide-line overflow-y-auto border-y border-line",children:[...E.entries()].map(([e,s])=>(0,t.jsxs)("li",{className:"py-2",children:[(0,t.jsx)("p",{className:"text-[0.8125rem] font-semibold text-ink-3",children:e}),s.map(e=>e.report_id?(0,t.jsxs)("div",{className:"flex min-h-11 items-center gap-3",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1 text-[0.9062rem]",children:[(0,t.jsx)("span",{className:"tnum",children:(0,o.time)(e.starts_at)})," ",e.class_name,(0,t.jsxs)("span",{className:"block text-[0.8125rem] text-ink-3",children:["Reported absent",e.note?` — ${e.note}`:""]})]}),e.withdrawable&&(0,t.jsx)(l.Button,{size:"sm",variant:"ghost",loading:$.isPending&&$.variables===e.report_id,onClick:()=>$.mutate(e.report_id),children:"Withdraw"})]},e.session_id):(0,t.jsxs)("label",{className:"flex min-h-11 items-center gap-3 text-[0.9062rem]",children:[(0,t.jsx)("input",{type:"checkbox",checked:x.has(e.session_id),onChange:()=>{let t;return t=e.session_id,g(e=>{let s=new Set(e);return s.has(t)?s.delete(t):s.add(t),s})},className:"size-[18px] shrink-0 accent-[var(--color-accent)]"}),(0,t.jsxs)("span",{className:(0,c.cn)("min-w-0 flex-1"),children:[(0,t.jsx)("span",{className:"tnum",children:(0,o.time)(e.starts_at)})," ",e.class_name]})]},e.session_id))]},e))})]}),k.length>0&&(0,t.jsx)(l.Field,{label:"Anything the teacher should know",htmlFor:"absence-reason",hint:"Optional. The teacher and the office see this.",children:(0,t.jsx)(l.Input,{id:"absence-reason",value:b,onChange:e=>v(e.target.value),placeholder:"School trip, unwell, family holiday…"})}),N.isError&&(0,t.jsx)(l.ErrorState,{error:N.error}),$.isError&&(0,t.jsx)(l.ErrorState,{error:$.error}),(0,t.jsxs)("div",{className:"flex gap-2",children:[(0,t.jsx)(l.Button,{className:"flex-1",onClick:p,children:"Cancel"}),(0,t.jsx)(l.Button,{className:"flex-1",variant:"primary",loading:N.isPending,disabled:0===x.size,onClick:()=>N.mutate(),children:"Send"})]})]})}let _=`
select o.id, o.student_id, s.first_name, o.reason, o.expires_on,
       c.name || ', ' || to_char(cs.starts_at at time zone 'Europe/London', 'FMDy FMDD Mon') as from_label
  from makeup_offer o join student s on s.id = o.student_id
  join class_session cs on cs.id = o.from_session_id join class c on c.id = cs.class_id
 where o.status = 'open' and o.expires_on >= current_date
 order by o.created_at`;function u({o:e}){let{session:c}=(0,r.useSession)(),m=(0,a.useQueryClient)(),[_,p]=s.useState(!1),h=(0,n.useRows)(["makeup-options",e.id],"select * from app.makeup_options($1)",[e.id],{enabled:_}),f=(0,i.useMutation)({mutationFn:async t=>(0,d.runAs)(c,s=>s("select app.book_makeup($1, $2)",[e.id,t])),onSuccess:()=>m.invalidateQueries({queryKey:["db"]})}),y=(0,i.useMutation)({mutationFn:async()=>(0,d.runAs)(c,t=>t("select app.decline_makeup($1)",[e.id])),onSuccess:()=>m.invalidateQueries({queryKey:["db"]})});return(0,t.jsxs)("div",{className:"py-3",children:[(0,t.jsxs)("p",{className:"font-semibold",children:[e.first_name,": instead of ",e.from_label]}),(0,t.jsxs)("p",{className:"text-[0.8125rem] text-ink-3",children:["cancelled"===e.reason?"The studio cancelled it.":"Reported absent."," Choose a class with space by ",(0,o.dateLong)(e.expires_on),"."]}),_?(0,t.jsxs)("div",{className:"mt-2",children:[h.isLoading&&(0,t.jsx)(l.Skeleton,{className:"h-16"}),h.data?.length===0&&(0,t.jsx)("p",{className:"text-[0.875rem] text-ink-2",children:"No suitable class has space before then. The office can help — send them a message."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:h.data?.map(e=>(0,t.jsxs)("li",{className:"flex min-h-12 items-center gap-3 py-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1 text-[0.9062rem]",children:[(0,t.jsx)("span",{className:"block font-semibold",children:e.class_name}),(0,t.jsxs)("span",{className:"block text-[0.8125rem] text-ink-3",children:[(0,o.dateLong)(e.starts_at)," · ",(0,o.time)(e.starts_at),e.location?` \xb7 ${e.location}`:""," · ",e.spaces," space",1===e.spaces?"":"s"]})]}),(0,t.jsx)(l.Button,{size:"sm",loading:f.isPending&&f.variables===e.session_id,onClick:()=>f.mutate(e.session_id),children:"Book"})]},e.session_id))}),f.isError&&(0,t.jsx)(l.ErrorState,{error:f.error})]}):(0,t.jsxs)("div",{className:"mt-2 flex gap-2",children:[(0,t.jsx)(l.Button,{size:"sm",variant:"primary",onClick:()=>p(!0),children:"See classes"}),(0,t.jsx)(l.Button,{size:"sm",variant:"ghost",loading:y.isPending,onClick:()=>y.mutate(),children:"No thanks"})]})]})}e.s(["AbsenceDialog",0,function({studentId:e,firstName:i,self:a,onClose:n}){return s.useEffect(()=>{let e=e=>{"Escape"===e.key&&n()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[n]),(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:n,children:(0,t.jsxs)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"absence-title",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)] border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:[(0,t.jsx)("h2",{id:"absence-title",className:"text-[1.0625rem] font-semibold tracking-tight",children:a?"I can’t make it":"Report an absence"}),!a&&(0,t.jsxs)("p",{className:"mb-3 mt-0.5 text-sm text-ink-2",children:["For ",i]}),a&&(0,t.jsx)("p",{className:"mb-3 mt-0.5 text-sm text-ink-2",children:"Your teacher, your family and the office are told."}),(0,t.jsx)(m,{studentId:e,firstName:i,self:a,onDone:n})]})})},"MakeUpOffers",0,function(){let e=(0,n.useRows)(["makeup-offers"],_);return e.data?.length?(0,t.jsxs)("section",{"aria-labelledby":"makeup-h",className:"space-y-3",children:[(0,t.jsx)("div",{className:"border-b-2 border-ink pb-2",children:(0,t.jsx)("h2",{id:"makeup-h",className:"section-title",children:"Make-up classes"})}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:e.data.map(e=>(0,t.jsx)("li",{children:(0,t.jsx)(u,{o:e})},e.id))})]}):null}])},10033,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(22016),a=e.i(54616),n=e.i(12598),d=e.i(7233),r=e.i(27612),l=e.i(65712),o=e.i(399),c=e.i(17658),m=e.i(13927),_=e.i(30224),u=e.i(31502),p=e.i(27830),h=e.i(8199);function f(e,t){let{session:s}=(0,u.useSession)(),i=(0,n.useQueryClient)();return(0,a.useMutation)({mutationFn:async t=>{let i=e(t);return(await (0,_.runAs)(s,e=>e(i.sql,i.params)))[0]},onSuccess:e=>{i.invalidateQueries({queryKey:["db"]}),t?.(e)}})}function y({studentId:e,name:i,onClose:a}){let[n,d]=s.useState(""),[r,m]=s.useState(null),_=f(t=>({sql:h.INVITE_STUDENT,params:[e,t]}),e=>m((0,p.inviteLink)(e.token)));return r?(0,t.jsxs)(l.RecordSheet,{title:`Invitation for ${i}`,onClose:a,onSave:a,saveLabel:"Done",children:[(0,t.jsxs)("p",{className:"text-[0.9062rem] text-ink-2",children:["Because you sent it, ",i,"’s login works as soon as they accept."]}),(0,t.jsx)(o.InviteLink,{link:r})]}):(0,t.jsx)(l.RecordSheet,{title:`Invite ${i}`,subtitle:"Their own login",onClose:a,saving:_.isPending,error:_.error,saveLabel:"Make the invitation",canSave:/@.+\./.test(n),onSave:()=>_.mutate(n.trim()),children:(0,t.jsx)(c.Field,{label:`${i}’s email`,htmlFor:"ci-e",required:!0,hint:"They accept the invitation to make their login.",children:(0,t.jsx)(c.Input,{id:"ci-e",type:"email",value:n,onChange:e=>d(e.target.value)})})})}function x({studentId:e,name:i,onClose:a,office:n}){let[d,r]=s.useState(""),[o,m]=s.useState(""),[_,u]=s.useState(""),[p,y]=s.useState("yes"),g=f(()=>n?{sql:b,params:[e,d,o,_,"yes"===p]}:{sql:h.ADD_COLLECTOR,params:[e,d,o,_]},a);return(0,t.jsxs)(l.RecordSheet,{title:n?"Add to the collection list":"Someone who may collect",subtitle:`For ${i}`,onClose:a,saving:g.isPending,error:g.error,canSave:d.trim().length>1,onSave:()=>g.mutate(void 0),children:[(0,t.jsx)(c.Field,{label:"Name",htmlFor:"col-n",required:!0,children:(0,t.jsx)(c.Input,{id:"col-n",value:d,onChange:e=>r(e.target.value)})}),(0,t.jsx)(c.Field,{label:"Relationship",htmlFor:"col-r",children:(0,t.jsx)(c.Input,{id:"col-r",value:o,onChange:e=>m(e.target.value),placeholder:"Grandmother, childminder…"})}),(0,t.jsx)(c.Field,{label:"Phone",htmlFor:"col-p",children:(0,t.jsx)(c.Input,{id:"col-p",type:"tel",value:_,onChange:e=>u(e.target.value)})}),n&&(0,t.jsx)(c.Field,{label:"May they collect?",htmlFor:"col-a",hint:"“May not collect” is shown to the teacher. Families do not see it.",children:(0,t.jsxs)(c.Select,{id:"col-a",value:p,onChange:e=>y(e.target.value),children:[(0,t.jsx)("option",{value:"yes",children:"May collect"}),(0,t.jsx)("option",{value:"no",children:"May not collect"})]})})]})}let g=`
select id, full_name, relationship, phone, allowed from collection_permission
 where student_id = $1 and deleted_at is null order by allowed desc, full_name`,b=`
insert into collection_permission (student_id, full_name, relationship, phone, allowed)
values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), $5) returning id`,v=[["see_schedule","Sees the schedule"],["see_payments","Sees invoices and payments"],["see_feedback","Sees teacher feedback"],["see_medical","Sees medical details"],["may_contact","May be contacted by the studio"],["may_collect","May collect the children"]];e.s(["ChildLogin",0,function({studentId:e,name:i}){let a=(0,m.useRows)(["my-children-logins"],h.MY_CHILDREN_LOGINS),n=a.data?.find(t=>t.student_id===e),[d,r]=s.useState(!1),l=f(t=>({sql:h.SET_STUDENT_LOGIN,params:[e,t]}));if(!n||"too_young"===n.state)return null;let o={too_young:null,none:(0,t.jsxs)("span",{className:"text-ink-3",children:["No login. ",i," uses the app through you."]}),invited:(0,t.jsxs)("span",{className:"[overflow-wrap:anywhere]",children:["Invited",n.email?` at ${n.email}`:"",". Once ",i," accepts, you approve it here."]}),pending:(0,t.jsxs)("span",{children:[(0,t.jsx)(c.Word,{tone:"caution",children:"Waiting for you"})," ",(0,t.jsxs)("span",{className:"ml-1",children:[i," has accepted the school’s invitation. The login stays off until a parent or carer approves it."]})]}),on:(0,t.jsxs)("span",{children:[(0,t.jsx)(c.Word,{tone:"positive",children:"On"})," ",(0,t.jsxs)("span",{className:"ml-1 [overflow-wrap:anywhere]",children:[i," signs in",n.email?` as ${n.email}`:"",". Either parent can switch it off at any time."]})]}),off:(0,t.jsxs)("span",{children:[(0,t.jsx)(c.Word,{tone:"muted",children:"Off"})," ",(0,t.jsxs)("span",{className:"ml-1",children:["A parent or carer switched it off. ",i," cannot sign in."]})]})};return(0,t.jsxs)("div",{className:"grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3",children:[(0,t.jsx)("dt",{className:"text-ink-3",children:"Own login"}),(0,t.jsxs)("dd",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[0.9062rem]",children:o[n.state]}),null!=l.error&&(0,t.jsx)("div",{className:"mt-2",children:(0,t.jsx)(c.ErrorState,{error:l.error})}),(0,t.jsxs)("div",{className:"mt-2 flex flex-wrap gap-2",children:[("pending"===n.state||"off"===n.state)&&(0,t.jsx)(c.Button,{size:"sm",variant:"primary",loading:l.isPending&&!0===l.variables,onClick:()=>l.mutate(!0),children:"pending"===n.state?"Approve":"Switch back on"}),("on"===n.state||"pending"===n.state||"invited"===n.state)&&(0,t.jsx)(c.Button,{size:"sm",loading:l.isPending&&!1===l.variables,onClick:()=>l.mutate(!1),children:"on"===n.state?"Switch off":"pending"===n.state?"Not now":"Withdraw the invitation"}),"none"===n.state&&(0,t.jsxs)(c.Button,{size:"sm",onClick:()=>r(!0),children:["Invite ",i]})]}),(0,t.jsxs)("p",{className:"mt-1.5 text-[0.7812rem] text-ink-3",children:["The school gives students their own login from age ",n.min_age,". They see their classes, feedback and practice, never payments."]})]}),d&&(0,t.jsx)(y,{studentId:e,name:i,onClose:()=>r(!1)})]})},"CollectionList",0,function({studentId:e,name:a}){let n=((0,m.useRows)(["my-collectors"],h.MY_COLLECTORS).data??[]).filter(t=>t.student_id===e),[l,o]=s.useState(!1),_=f(e=>({sql:h.REMOVE_COLLECTOR,params:[e]}));return(0,t.jsxs)("div",{className:"grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3",children:[(0,t.jsx)("dt",{className:"text-ink-3",children:"Who may collect"}),(0,t.jsxs)("dd",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"You, and anyone listed here. The teacher sees this list at the register."}),(0,t.jsx)("ul",{className:"mt-1 space-y-0.5",children:n.map(e=>(0,t.jsxs)("li",{className:"flex items-center gap-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"font-medium",children:e.full_name}),e.relationship?(0,t.jsxs)("span",{className:"text-ink-3",children:[" (",e.relationship,")"]}):null,e.phone?(0,t.jsx)("span",{className:"block tnum text-[0.8438rem] text-ink-2",children:e.phone}):null]}),(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",loading:_.isPending&&_.variables===e.id,onClick:()=>_.mutate(e.id),"aria-label":`Remove ${e.full_name}`,children:(0,t.jsx)(r.Trash2,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),(0,t.jsxs)(c.Button,{size:"sm",variant:"ghost",className:"-ml-3 mt-1",onClick:()=>o(!0),children:[(0,t.jsx)(d.Plus,{className:"size-4","aria-hidden":!0})," Add someone"]}),(0,t.jsxs)("p",{className:"mt-1 text-[0.7812rem] text-ink-3",children:["If someone must not collect ",a,", ",(0,t.jsx)(i.default,{href:"/family/enquiries",className:"font-semibold text-accent-text underline",children:"tell the office"}),"."]})]}),l&&(0,t.jsx)(x,{studentId:e,name:a,onClose:()=>o(!1)})]})},"GuardianAccessFields",0,function({guardianId:e}){let i=(0,m.useRows)(["guardian-access",e],"select * from app.guardian_access_for($1)",[e]),a=i.data?.[0],[n,d]=s.useState(null),r=f(t=>({sql:"select app.set_guardian_access($1, $2::jsonb, $3)",params:[e,JSON.stringify(t.flags),t.note??null]}));return a?(0,t.jsxs)("fieldset",{children:[(0,t.jsx)("legend",{className:"mb-1 text-[0.8125rem] font-medium text-ink-2",children:"Shared care"}),(0,t.jsx)("p",{className:"mb-1 text-[0.7812rem] text-ink-3",children:"Everything is on unless the office restricts it, for example under a court order. Changes apply at once."}),v.map(([e,s])=>(0,t.jsxs)("label",{className:"flex min-h-[44px] items-center gap-3 text-[0.875rem]",children:[(0,t.jsx)("input",{type:"checkbox",checked:!!a[e],className:"size-[18px] accent-[var(--color-accent)]",onChange:t=>r.mutate({flags:{[e]:t.target.checked}})}),s]},e)),a.can_note?(0,t.jsx)(c.Field,{label:"Safeguarding note",htmlFor:"ga-note",hint:"Only the safeguarding lead sees this.",children:(0,t.jsxs)("div",{className:"flex gap-2",children:[(0,t.jsx)(c.Input,{id:"ga-note",value:n??a.dsl_note??"",onChange:e=>d(e.target.value)}),(0,t.jsx)(c.Button,{size:"sm",disabled:null===n,loading:r.isPending,onClick:()=>{r.mutate({flags:{},note:n??""}),d(null)},children:"Save note"})]})}):a.has_note?(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"The safeguarding lead holds a note about this."}):null,null!=r.error&&(0,t.jsx)(c.ErrorState,{error:r.error})]}):i.isLoading?(0,t.jsx)(c.Skeleton,{className:"h-24"}):null},"OfficeCollection",0,function({studentId:e,name:i}){let a=(0,m.useRows)(["office-collection",e],g,[e]),[n,l]=s.useState(!1),o=f(e=>({sql:h.REMOVE_COLLECTOR,params:[e]}));return(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 border-b border-ink pb-1",children:[(0,t.jsx)("h3",{className:"min-w-0 flex-1 text-[0.875rem] font-semibold",children:"Who may collect"}),(0,t.jsxs)(c.Button,{size:"sm",variant:"ghost",onClick:()=>l(!0),children:[(0,t.jsx)(d.Plus,{className:"size-4","aria-hidden":!0})," Add"]})]}),a.isLoading&&(0,t.jsx)(c.Skeleton,{className:"mt-2 h-8"}),a.data?.length===0&&(0,t.jsx)("p",{className:"mt-1 text-[0.8438rem] text-ink-3",children:"Only the family’s guardians."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:a.data?.map(e=>(0,t.jsxs)("li",{className:"flex min-h-[44px] items-center gap-2 text-[0.875rem]",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[!e.allowed&&(0,t.jsx)(c.Word,{tone:"critical",className:"mr-1.5",children:"May not collect"}),(0,t.jsx)("span",{className:"font-medium",children:e.full_name}),e.relationship?(0,t.jsxs)("span",{className:"text-ink-3",children:[" (",e.relationship,")"]}):null]}),(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",onClick:()=>o.mutate(e.id),"aria-label":`Remove ${e.full_name}`,children:(0,t.jsx)(r.Trash2,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),n&&(0,t.jsx)(x,{office:!0,studentId:e,name:i,onClose:()=>l(!1)})]})},"PendingLogins",0,function(){let e=((0,m.useRows)(["my-children-logins"],h.MY_CHILDREN_LOGINS).data??[]).filter(e=>"pending"===e.state);return e.length?(0,t.jsx)(t.Fragment,{children:e.map(e=>(0,t.jsx)("li",{className:"py-3.5",children:(0,t.jsx)(i.default,{href:"/family/children",className:"block rounded-[var(--radius-sm)] hover:bg-surface-2/60",children:(0,t.jsx)(c.Notice,{tone:"accent",word:"Approve?",title:`${e.first_name} has been invited to their own login`,detail:"It stays off until a parent or carer approves it. Open Your family to approve or say not now."})})},e.student_id))}):null},"StudentLoginAge",0,function(){let{session:e}=(0,u.useSession)(),s=(0,m.useRows)(["student-login-age"],"select id, student_login_min_age from studio where id in (select app.studio_ids()) limit 1"),i=s.data?.[0],a=f(e=>({sql:"select app.set_student_login_min_age($1, $2)",params:[i.id,e]}));if(!i)return null;let n=e?.role==="owner";return(0,t.jsxs)(c.Card,{children:[(0,t.jsx)(c.CardHeader,{title:"Students’ own logins",subtitle:`From age ${i.student_login_min_age}`}),(0,t.jsxs)("div",{className:"pt-3",children:[n?(0,t.jsx)(c.Field,{label:"Students may have their own login from age",htmlFor:"sl-age",hint:"A student’s login works only once a parent or carer approves it, and either parent can switch it off. Many schools choose 13; choose higher if your safeguarding policy asks for it.",children:(0,t.jsx)(c.Select,{id:"sl-age",value:String(i.student_login_min_age),onChange:e=>a.mutate(Number(e.target.value)),className:"max-w-[8rem]",children:Array.from({length:6},(e,t)=>13+t).map(e=>(0,t.jsx)("option",{value:e,children:e},e))})}):(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Only the studio owner can change this."}),null!=a.error&&(0,t.jsx)(c.ErrorState,{error:a.error})]})]})}])},28793,e=>{"use strict";var t=e.i(71645),s=e.i(12598),i=e.i(30224),a=e.i(31502),n=e.i(50293);let d="";e.s(["useDueReminders",0,function(){let{session:e}=(0,a.useSession)(),r=(0,s.useQueryClient)();t.useEffect(()=>{e&&"guardian"===e.role&&d!==e.userId&&(d=e.userId,(0,i.runAs)(e,e=>e(n.NOTIFY_DUE)).then(e=>{e[0]?.n&&r.invalidateQueries({queryKey:["db"]})}).catch(()=>void 0))},[e,r])}])},399,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(74886),a=e.i(43531),n=e.i(17658);e.s(["InviteLink",0,function({link:e}){let[d,r]=s.useState(!1);return(0,t.jsxs)("div",{className:"mt-3 border-l-2 border-ink pl-3",children:[(0,t.jsxs)("p",{className:"text-[0.875rem] font-semibold",children:["Invitation link ",(0,t.jsx)("span",{className:"font-normal text-ink-3",children:"· works once, for 14 days"})]}),(0,t.jsxs)("div",{className:"mt-2 flex gap-2",children:[(0,t.jsx)(n.Input,{readOnly:!0,value:e,"aria-label":"Invitation link",onFocus:e=>e.currentTarget.select(),className:"text-[0.7812rem]"}),(0,t.jsxs)(n.Button,{size:"sm",onClick:async()=>{try{await navigator.clipboard.writeText(e),r(!0),setTimeout(()=>r(!1),1800)}catch{}},children:[d?(0,t.jsx)(a.Check,{className:"size-4","aria-hidden":!0}):(0,t.jsx)(i.Copy,{className:"size-4","aria-hidden":!0}),d?"Copied":"Copy"]})]}),(0,t.jsx)("p",{className:"mt-2 text-[0.8125rem] text-ink-3",children:"Email delivery isn’t connected yet, so send this link yourself. It’s shown only now."})]})}])},40284,e=>{"use strict";var t=e.i(43476),s=e.i(13927),i=e.i(33405);e.s(["MySchoolHero",0,function(){let e=(0,s.useRows)(["school-hero"],"select name, hero_url from studio where app.in_scope(id) order by created_at limit 1",[],{staleTime:6e4}).data?.[0];return e?(0,t.jsx)(i.SchoolHero,{src:e.hero_url,name:e.name}):null}])},90514,e=>{"use strict";var t=e.i(47167);e.s(["cardPaymentsEnabled",0,()=>"stripe"===t.default.env.NEXT_PUBLIC_PAYMENTS_PROVIDER])},50293,e=>{"use strict";let t=`
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
  coalesce((select -sum(balance_minor) from family where deleted_at is null and balance_minor < 0), 0)::bigint as credit_minor`,s=`
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
          i.due_on desc nulls last, i.number desc`,i=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       i.subtotal_minor, i.discount_minor, i.note, i.void_reason,
       f.id as family_id, f.name as family_name, f.balance_minor as family_balance_minor,
       app.family_available_credit(f.id) as available_credit_minor,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue
  from invoice i join family f on f.id = i.family_id
 where i.id = $1`,a=`
select it.id, it.kind, it.description, it.quantity, it.unit_minor, it.discount_minor, it.total_minor,
       s.first_name as student_name
  from invoice_item it left join student s on s.id = it.student_id
 where it.invoice_id = $1 and it.deleted_at is null
 order by it.created_at`,n=`
select id, amount_minor, refunded_minor, method, provider, failure_code, succeeded_at, created_at, note, credit_note_id
  from payment where invoice_id = $1 and deleted_at is null
 order by created_at`,d=`
select f.id, f.name, f.balance_minor,
       (select g.full_name from guardian g
         where g.family_id = f.id and g.deleted_at is null order by g.is_primary desc limit 1) as guardian
  from family f where f.deleted_at is null order by f.name`,r=`
select s.id as student_id, s.first_name as student_name, c.id as class_id, c.name as class_name,
       coalesce(e.price_minor, c.price_minor) as price_minor, c.pricing
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where s.family_id = $1 and e.status = 'active' and e.deleted_at is null and c.deleted_at is null
 order by s.first_name, c.name`,l=`
select id, number, amount_minor, reason, applied_minor, refunded_minor, account_minor, created_at
  from credit_note where invoice_id = $1 order by created_at`,o=`
select f.id, f.name, f.balance_minor, app.family_available_credit(f.id) as credit_minor,
       coalesce((select sum(total_minor - paid_minor) from invoice i where i.family_id = f.id and i.deleted_at is null
                  and i.status in ('issued','part_paid','refunded')), 0)::bigint as open_minor,
       app.payment_reference(f.name, f.id) as reference
  from family f where f.id = $1 and f.deleted_at is null`,c=`
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
  from l order by at, array_position(array['invoice','payment','credit','credit_note','refund'], kind)`,m=`
select f.id as family_id, f.name as family_name, sum(i.total_minor - i.paid_minor)::bigint as overdue_minor,
       string_agg(i.number, ', ' order by i.due_on, i.number) as invoices, min(i.due_on) as oldest_due,
       app.last_payment_reminder(f.id) as last_reminded,
       exists (select 1 from guardian g where g.family_id = f.id and g.user_id is not null and g.deleted_at is null) as uses_app
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null and i.status in ('issued','part_paid','refunded')
   and i.total_minor > i.paid_minor and i.due_on < current_date
 group by f.id, f.name order by min(i.due_on), f.name`,_=`
select app.fill_payment_reminder($1, $2) as subject, app.fill_payment_reminder($1, $3) as body`,u=`
select b.studio_id, b.payee_name, b.sort_code, b.account_number, b.iban, b.updated_at
  from studio_bank_details b where b.studio_id = $1`,p=`
select f.id as family_id, app.payment_reference(f.name, f.id) as reference,
       b.payee_name, b.sort_code, b.account_number, b.iban
  from family f left join studio_bank_details b on b.studio_id = f.studio_id
 where f.deleted_at is null and f.id in (select app.guardian_family_ids())
 order by f.created_at limit 1`,h=`
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`,f=`
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`,y=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`,x=`
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`,g=`
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.deleted_at is null and d.ended_at is null and (d.ends_on is null or d.ends_on >= current_date)
 order by f.name`,b=`
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
  from lines order by number, ord, created_at`,j=`
select family_name as family, round(current_minor / 100.0, 2) as "0-30 days", round(d31_60 / 100.0, 2) as "31-60 days",
       round(d61_90 / 100.0, 2) as "61-90 days", round(d90_plus / 100.0, 2) as "90+ days", round(total / 100.0, 2) as total
  from app.aged_debt((select id from studio where app.is_admin(id) order by name limit 1))`,w=`
select i.number, f.name as family, i.status::text as status, i.issued_on, i.due_on,
       round(i.subtotal_minor / 100.0, 2) as subtotal, round(i.discount_minor / 100.0, 2) as discount,
       round(i.total_minor / 100.0, 2) as total, round(i.paid_minor / 100.0, 2) as paid,
       round((i.total_minor - i.paid_minor) / 100.0, 2) as outstanding, t.name as term
  from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
 where i.deleted_at is null order by i.number`,N=`
select p.succeeded_at::date as date, f.name as family, i.number as invoice, p.method,
       round(p.amount_minor / 100.0, 2) as amount,
       case when p.failure_code is not null then 'failed' when p.succeeded_at is null then 'pending' else 'succeeded' end as status,
       p.provider_ref as reference
  from payment p join family f on f.id = p.family_id left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null order by p.created_at`;e.s(["ADD_FAMILY_CREDIT",0,"select app.add_family_credit($1, $2, $3) as id","ADD_FAMILY_DISCOUNT",0,b,"AGED_DEBT_EXPORT",0,j,"BANK_DETAILS",0,u,"BILLING_LINES",0,"select * from app.billing_lines($1, $2::date, $3::uuid[])","BILLING_RUNS",0,x,"BILLING_SKIPPED",0,"select * from app.billing_skipped($1, $2::date)","BILLING_TERMS",0,"select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc","CREATE_BILLING_RUN",0,"select app.create_billing_run($1, $2::date, $3::date, $4::uuid[], $5) as id","CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","DISCARD_BILLING_RUN",0,"select app.discard_billing_run($1)","DISCOUNT_RULES",0,"select id, kind, from_nth, percent, enabled from discount_rule order by kind desc","END_FAMILY_DISCOUNT",0,"select app.end_family_discount($1)","FAMILY_ACCOUNT",0,o,"FAMILY_BILLABLE",0,r,"FAMILY_DISCOUNTS",0,g,"FAMILY_OPTIONS",0,d,"FAMILY_PICK",0,"select id, name from family where deleted_at is null and not is_prospect order by name","FAMILY_STATEMENT",0,c,"INVOICE",0,i,"INVOICES",0,s,"INVOICES_EXPORT",0,w,"INVOICE_CREDIT_NOTES",0,l,"INVOICE_ITEMS",0,a,"INVOICE_PAYMENTS",0,n,"ISSUE_BILLING_RUN",0,"select app.issue_billing_run($1) as n","ISSUE_CREDIT_NOTE",0,"select app.issue_credit_note($1, $2, $3, $4) as id","ISSUE_INVOICE",0,"select app.issue_invoice($1)","MY_PAYMENT_INFO",0,p,"NOTIFY_DUE",0,"select app.notify_invoices_due() as n","OVERDUE_FAMILIES",0,m,"PAYMENTS_EXPORT",0,N,"PRIMARY_GUARDIAN",0,f,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3, $4)","REMINDER_PREVIEW",0,_,"REMINDER_TEMPLATE",0,h,"SEND_DIRECT",0,y,"SEND_REMINDERS",0,"select app.send_payment_reminders($1::uuid[], $2, $3) as sent","SET_BANK_DETAILS",0,"select app.set_bank_details($1, $2, $3, $4, $5)","SET_DISCOUNT_RULE",0,"update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id","SUMMARY",0,t,"UPCOMING_COSTS",0,"select * from app.upcoming_costs($1::uuid)","VOID_INVOICE",0,"select app.void_invoice($1, $2)","XERO_EXPORT",0,v])},8199,e=>{"use strict";let t=`
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
union all
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name, ds.colour, coalesce(sr.name, r.name), l.name, coalesce(cover.display_name, st.display_name),
       s.first_name, s.id
  from drop_in_booking d
  join class_session cs on cs.id = d.session_id
  join class c on c.id = cs.class_id
  join student s on s.id = d.student_id
  left join dance_style ds on ds.id = c.dance_style_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where d.status = 'booked' and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by 4`,s=`
select s.id, s.first_name, s.last_name, s.date_of_birth, s.is_adult,
       s.self_guardian_id in (select g.id from guardian g where g.user_id = auth.uid()) as is_me,
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
       app.consent_now(s.id, 'photography') as photo_consent   -- latest settled choice, one row (UR-08)
  from student s
 where s.deleted_at is null
 order by s.date_of_birth`,i=`
select f.id, f.name, f.balance_minor,
       (select count(*)::int from invoice i
         where i.family_id = f.id and i.deleted_at is null and i.status in ('issued','part_paid')) as unpaid,
       (select count(*)::int from payment p
         where p.family_id = f.id and p.deleted_at is null
           and p.failure_code is not null and p.succeeded_at is null) as failed
  from family f where f.deleted_at is null`,a=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor
  from invoice i where i.deleted_at is null and i.status <> 'draft'   -- drafts are the office's until sent
 order by i.issued_on desc nulls last limit 8`,n=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at, c.name as class_name
  from communication cm
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
   and not cm.inbound          -- only what the studio sent, never the family's own messages (R-047)
 order by cm.sent_at desc limit 8`,d=`
select g.id, g.full_name, g.email, g.phone, g.relationship, g.user_id = auth.uid() as is_me
  from guardian g where g.deleted_at is null and g.family_id in (select app.guardian_family_ids())
 order by (g.user_id = auth.uid()) desc nulls last, g.is_primary desc, g.full_name`,r=`
update guardian set full_name = $2, email = nullif($3, ''), phone = nullif($4, ''), updated_at = now() where id = $1`,l=`
select c.id, c.student_id, c.full_name, c.relationship, c.phone from collection_permission c
 where c.deleted_at is null and c.allowed order by c.created_at`,o=`
insert into collection_permission (student_id, full_name, relationship, phone, allowed)
values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), true) returning id`,c=`
select ec.id, ec.student_id, ec.full_name, ec.relationship, ec.phone from emergency_contact ec
 where ec.deleted_at is null and ec.student_id in (select app.guardian_student_ids())
 order by ec.priority, ec.created_at`,m=`
insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
select s.studio_id, s.id, $2, nullif($3, ''), $4,
       coalesce((select max(priority) + 1 from emergency_contact where student_id = s.id and deleted_at is null), 1)
  from student s where s.id = $1`,_=`
update emergency_contact set full_name = $2, relationship = nullif($3, ''), phone = $4, updated_at = now() where id = $1`,u=`
select d.id, d.student_id, s.first_name, c.name as class_name, cs.starts_at,
       case when d.pack_purchase_id is not null then 'pack' when d.invoice_id is not null then 'invoice' else 'free' end as paid_with
  from drop_in_booking d join student s on s.id = d.student_id join class_session cs on cs.id = d.session_id join class c on c.id = cs.class_id
 where d.status = 'booked' and cs.starts_at > now() order by cs.starts_at`,p=`select p.id, s.first_name, k.name, p.remaining, p.expires_on from pack_purchase p
  join student s on s.id = p.student_id join class_pack k on k.id = p.pack_id
 where p.remaining > 0 and p.expires_on >= current_date order by p.expires_on`;e.s(["ADD_COLLECTOR",0,o,"ADD_CONTACT",0,m,"ASK_TO_CHANGE_GUARDIAN",0,"select app.ask_to_change_guardian($1, $2) as id","BOOK_DROP_IN",0,"select app.book_drop_in($1, $2) as r","BOOK_TRIAL",0,"select app.parent_book_trial($1, $2) as result","BUY_PACK",0,"select app.buy_pack($1, $2) as id","CANCEL_DROP_IN",0,"select app.cancel_drop_in($1) as r","CLASS_OPTIONS",0,"select * from app.class_options_for_child($1)","DROP_IN_SESSIONS",0,"select d.* from studio s, app.drop_in_sessions(s.id) d where s.id in (select app.studio_ids()) order by d.starts_at","INVITE_STUDENT",0,"select app.guardian_invite_student($1, $2) as token","JOIN_WAITLIST",0,"select app.parent_join_waitlist($1, $2) as position","MY_BALANCE",0,i,"MY_CHILDREN",0,s,"MY_CHILDREN_LOGINS",0,"select * from app.my_children_logins()","MY_COLLECTORS",0,l,"MY_CONTACTS",0,c,"MY_DROP_INS",0,u,"MY_GUARDIANS",0,d,"MY_INVOICES",0,a,"MY_MESSAGES",0,n,"MY_PACKS",0,p,"MY_SCHEDULE",0,t,"PACKS",0,"select id, name, classes, price_minor, valid_days from class_pack where active order by classes","REMOVE_COLLECTOR",0,"select app.remove_collection_person($1)","REMOVE_CONTACT",0,"select app.remove_emergency_contact($1)","REQUEST_CHILD",0,"select app.request_new_child($1::jsonb) as id","REQUEST_PLACE",0,"select app.request_class_place($1, $2, $3) as id","SET_STUDENT_LOGIN",0,"select app.set_student_login($1, $2) as r","UPDATE_CONTACT",0,_,"UPDATE_GUARDIAN",0,r])},27389,e=>{"use strict";let t=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url, r.duration_sec,
       r.storage_path, f.file_name, f.mime_type, f.size_bytes,
       (select string_agg(distinct coalesce(c.name, lv.name, 'Everyone'), ', ')
          from resource_assignment a
          left join class c on c.id = a.class_id
          left join level lv on lv.id = a.level_id
         where a.resource_id = r.id and a.deleted_at is null) as scope_label
  from resource r
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
 where r.deleted_at is null
 order by r.kind, r.category nulls last, r.title`,s=`
select f.id, f.headline, f.going_well, f.work_on, f.created_at, f.shared_at, f.edited_at,
       c.name as class_name, sm.display_name as author, ds.name as style, f.class_id,
       r.title as resource_title, r.url as resource_url,
       s.first_name || ' ' || s.last_name as student_name, s.id as student_id
  from feedback_note f
  join student s on s.id = f.student_id
  left join class c on c.id = f.class_id
  left join dance_style ds on ds.id = c.dance_style_id
  left join resource r on r.id = f.work_on_resource_id and r.deleted_at is null
  left join staff_member sm on sm.id = f.author_id
 where f.deleted_at is null and f.shared_at is not null
 order by f.shared_at desc`,i=`
select ev.id, ev.kind, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.venue,
       ev.cost_minor, ev.capacity, ev.entries_close_on, ev.requests_open,
       sm.display_name as teacher, ev.student_id,
       app.event_places(ev.id) as going,
       -- Each of my children on this event, with their own status (UR-50).
       -- RLS keeps event_participant to my own children.
       coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'student_id', s.id, 'first_name', s.first_name, 'status', p.status::text)
                                  order by s.date_of_birth)
                   from event_participant p join student s on s.id = p.student_id
                  where p.event_id = ev.id and p.deleted_at is null), '[]') as mine,
       (select p.status::text from event_participant p
         where p.event_id = ev.id and p.deleted_at is null
         order by array_position(array['confirmed','invited','requested','waitlisted','declined','withdrawn'], p.status::text) limit 1) as my_status,
       (select string_agg(s.first_name, ' & ' order by s.date_of_birth) from event_participant p join student s on s.id = p.student_id
         where p.event_id = ev.id and p.deleted_at is null and p.status not in ('declined', 'withdrawn')) as my_student,
       (select p.id from event_participant p where p.event_id = ev.id and p.deleted_at is null
           and p.status = 'invited' limit 1) as my_invite,
       coalesce((select jsonb_agg(jsonb_build_object('subject', cm.subject, 'body', cm.body, 'sent_at', cm.sent_at) order by cm.sent_at desc)
                   from communication cm where cm.event_id = ev.id and cm.deleted_at is null), '[]') as notices,
       coalesce((select jsonb_agg(jsonb_build_object('title', r.title, 'starts_at', r.starts_at) order by r.starts_at)
                   from studio_event r where r.parent_event_id = ev.id and r.deleted_at is null and r.status = 'published'), '[]') as rehearsals,
       coalesce((select jsonb_agg(jsonb_build_object('title', rt.title, 'costume', rt.costume, 'position', rt.position) order by rt.position)
                   from event_routine rt where rt.event_id = ev.id and rt.deleted_at is null
                    and (exists (select 1 from routine_dancer d where d.routine_id = rt.id)
                         or rt.class_id in (select e.class_id from enrolment e where e.status = 'active' and e.deleted_at is null))), '[]') as routines
  from studio_event ev
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at > now() - interval '1 day' and ev.parent_event_id is null
 order by ev.starts_at`,a=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,n=`
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`,d=`
insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
select s.studio_id, s.family_id, s.id, $2::request_kind, $3, $4, auth.uid()
  from student s where s.id = $1
returning id`,r=`
select cs.id, c.id as class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour, coalesce(sr.name, r.name) as room, l.name as location,
       coalesce(cover.display_name, st.display_name) as teacher,
       'class' as entry_kind
  from class_session cs
  join class c on c.id = cs.class_id
  join enrolment e on e.class_id = c.id and e.status = 'active' and e.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
union all
select ev.id, null::uuid, ev.title, ev.starts_at, ev.ends_at, 'scheduled',
       ev.kind::text, 'indigo', null, ev.venue, sm.display_name, 'event'
  from studio_event ev
  join event_participant p on p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at >= $1::timestamptz and ev.starts_at < $2::timestamptz
 order by starts_at`,l=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`,o=`
select r.id, r.kind, r.status, r.subject, r.body, r.created_at, r.session_id, r.action,
       (select name from class where id = r.class_id) as class_name,
       r.student_id, s.first_name || ' ' || s.last_name as student_name,
       r.family_id, f.name as family_name,
       coalesce(u.full_name, (select g.full_name from guardian g where g.family_id = r.family_id
                                and g.deleted_at is null order by g.is_primary desc limit 1)) as guardian_name,
       coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.first_name || ' ' || c.last_name)
                                  order by c.date_of_birth)
                   from student c where c.family_id = r.family_id and c.deleted_at is null), '[]'::jsonb) as children
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
  left join user_account u on u.id = r.raised_by
 where r.deleted_at is null and r.status in ('open','in_progress')
 order by (r.kind = 'medical_update') desc, r.created_at`,c=`
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`,m=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,_=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,u=`
select c.id, c.name, c.description,
       ds.name as style, ds.colour, lv.name as level,
       st.display_name as teacher, asst.display_name as assistant,
       r.name as room, l.name as location,
       c.day_of_week, c.start_time, c.duration_min, c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       t.name as term_name,
       (c.id in (select app.teacher_class_ids())) as i_teach
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
  left join level lv on lv.id = c.level_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member asst on asst.id = c.assistant_id
  left join room r on r.id = c.room_id
  left join location l on l.id = c.location_id
  left join term t on t.id = c.term_id
 where c.id = $1 and c.deleted_at is null`,p=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url,
       r.duration_sec, r.storage_path, r.created_at,
       f.file_name, f.mime_type, f.size_bytes,
       u.full_name as added_by,
       (r.created_by = auth.uid()) as mine,
       case when a.class_id is null then 'Everyone' else null end as scope_label
  from resource r
  left join resource_assignment a
         on a.resource_id = r.id and a.deleted_at is null and a.class_id = $1
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  left join user_account u on u.id = r.created_by
 where r.deleted_at is null
   and (a.id is not null
        or not exists (select 1 from resource_assignment a2
                        where a2.resource_id = r.id and a2.deleted_at is null))
 order by (a.id is null), r.kind, r.created_at desc`,h=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,f=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,y=`
select app.retire_resource($1) as ok`,x=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,_,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,f,"CLASS_DETAIL",0,u,"CLASS_RESOURCES",0,p,"CREATE_RESOURCE",0,h,"DECIDE_ENTRY",0,m,"DELETE_RESOURCE",0,y,"EVENTS",0,i,"MY_REQUESTS",0,n,"MY_TEACHING_CLASSES",0,x,"MY_TIMETABLE",0,r,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,o,"RAISE_REQUEST",0,d,"REQUEST_PLACE",0,a,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,l])},27830,e=>{"use strict";e.i(47167);let t=`select id, code, name, price_minor, max_students, max_locations, max_staff, is_trial, active
  from plan order by sort`;e.s(["AM_SUPER",0,"select app.is_platform_super() as yes","CREATE_SCHOOL",0,"select * from app.platform_create_studio($1, $2, $3, $4, $5)","EVENTS",0,"select * from app.platform_events($1)","EXTEND_TRIAL",0,"select app.platform_extend_trial($1, $2)","INVITE",0,"select app.create_invitation($1, $2, $3::app_role, $4) as token","INVITES",0,"select * from app.platform_invitations($1)","PLANS",0,t,"PURGE",0,"select app.platform_purge_studio($1, $2)","REVOKE_INVITE",0,"select app.revoke_invitation($1)","SCHOOLS",0,"select * from app.platform_studios()","SET_PLAN",0,"select app.platform_set_plan($1, $2)","SET_PLAN_LIMITS",0,"select app.platform_set_plan_limits($1, $2, $3, $4, $5, $6)","SET_STATUS",0,"select app.platform_set_status($1, $2, $3)","START_SUPPORT",0,"select app.start_support_session($1) as until","inviteLink",0,e=>`${window.location.origin}/General/studio-next/invite/?token=${e}`])}]);