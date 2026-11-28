(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,42009,e=>{"use strict";let t=(0,e.i(75254).default)("award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);e.s(["Award",0,t],42009)},90119,e=>{"use strict";let t=(0,e.i(75254).default)("calendar-plus",[["path",{d:"M16 19h6",key:"xwg31i"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M19 16v6",key:"tddt3s"}],["path",{d:"M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8.5",key:"1glfrc"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 2v4",key:"1cmpym"}]]);e.s(["CalendarPlus",0,t],90119)},64659,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["ChevronDown",0,t],64659)},7233,e=>{"use strict";let t=(0,e.i(75254).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,t],7233)},3281,e=>{"use strict";let t=(0,e.i(75254).default)("printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);e.s(["Printer",0,t],3281)},83086,e=>{"use strict";let t=(0,e.i(75254).default)("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]);e.s(["Sparkles",0,t],83086)},14979,e=>{"use strict";var t=e.i(43476),a=e.i(22016),s=e.i(17658),i=e.i(75379),n=e.i(45060);e.s(["SessionRow",0,function({session:e,href:r,onSelect:l}){let o="cancelled"===e.status,d=!o&&e.enrolled>=e.capacity,c=(0,t.jsxs)("span",{className:"grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 px-1 py-3 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto_3.75rem]",children:[(0,t.jsxs)("span",{className:"self-start pt-0.5",children:[(0,t.jsx)("span",{className:(0,n.cn)("block font-display text-[1.1875rem] leading-none tnum",o&&"text-ink-3 line-through"),children:(0,i.time)(e.starts_at)}),(0,t.jsx)("span",{className:"mt-1 block text-[0.7812rem] text-ink-3 tnum",children:(0,i.time)(e.ends_at)})]}),(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsxs)("span",{className:"flex min-w-0 flex-wrap items-baseline gap-x-2",children:[(0,t.jsx)("span",{className:(0,n.cn)("truncate font-semibold",o&&"text-ink-3 line-through"),children:e.name}),e.style&&(0,t.jsx)(s.StyleMark,{colour:e.colour,name:e.style,className:"text-[0.8125rem] text-ink-3"})]}),(0,t.jsx)("span",{className:"mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-2 text-[0.8125rem] text-ink-3",children:o?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(s.Word,{tone:"critical",children:"Cancelled"}),e.cancel_reason&&(0,t.jsx)("span",{className:"text-ink-2",children:e.cancel_reason})]}):(0,t.jsxs)(t.Fragment,{children:[e.moved&&(0,t.jsx)(s.Word,{children:"Moved"}),e.covered&&(0,t.jsx)(s.Word,{tone:"caution",children:"Cover"}),(0,t.jsxs)("span",{className:"truncate",children:[[e.teacher,e.room].filter(Boolean).join(" · "),e.trials>0?` \xb7 ${e.trials} trial${1===e.trials?"":"s"}`:""]})]})})]}),!o&&(0,t.jsx)(s.Beats,{value:e.enrolled,max:e.capacity,label:`${e.enrolled} of ${e.capacity} places`,tone:d?"caution":"accent",className:"hidden sm:inline-flex"}),(0,t.jsx)("span",{className:(0,n.cn)("text-right text-[0.8438rem] tnum",d?"font-semibold text-caution":"text-ink-2",o&&"sm:col-span-2"),children:o?"":(0,t.jsxs)(t.Fragment,{children:[e.enrolled,"/",e.capacity,d&&(0,t.jsx)("span",{className:"block text-[0.75rem]",children:"Full"})]})})]}),m="block w-full text-left transition-colors hover:bg-surface-2/60";return l?(0,t.jsx)("button",{onClick:l,className:m,children:c}):r?(0,t.jsx)(a.default,{href:r,className:m,children:c}):c}])},24098,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(74080),i=e.i(54616),n=e.i(12598),r=e.i(54385),l=e.i(61574),o=e.i(3281),d=e.i(37727),c=e.i(13927),m=e.i(30224),u=e.i(31502),p=e.i(57850),_=e.i(17658),h=e.i(84315),f=e.i(75379),x=e.i(45060),g=e.i(70448);function y(){let{session:e}=(0,u.useSession)(),t=(0,n.useQueryClient)();return(0,i.useMutation)({mutationFn:async t=>(await (0,m.runAs)(e,e=>e(t.sql,t.params)))[0],onSuccess:()=>t.invalidateQueries({queryKey:["db"]})})}let b=[["needed","Needed","caution"],["ordered","Ordered","info"],["arrived","Arrived","info"],["given","With dancer","positive"],["returned","Returned","neutral"]],w=[["present","Here"],["late","Late"],["absent","Absent"]];function v({rehearsal:e,onClose:a}){let s=(0,c.useRows)(["rehearsal-register",e.id],h.REHEARSAL_REGISTER,[e.id]),i=y(),n=s.data?.filter(e=>e.status).length??0;return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6",onClick:a,children:(0,t.jsxs)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"rr-t",onClick:e=>e.stopPropagation(),className:"flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-xl)] border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3 border-b border-line px-5 pb-3 pt-4",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{id:"rr-t",className:"font-display text-[1.25rem] leading-tight",children:e.title}),(0,t.jsxs)("p",{className:"mt-1 text-[0.8438rem] text-ink-3",children:[(0,f.dateLong)(e.starts_at),", ",(0,f.time)(e.starts_at)," · ",(0,t.jsxs)("span",{className:"tnum",children:[n," of ",s.data?.length??0]})," marked"]})]}),(0,t.jsx)(_.Button,{size:"sm",variant:"ghost",onClick:a,"aria-label":"Close",className:"-mr-2 -mt-1",children:(0,t.jsx)(d.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsxs)("div",{className:"min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-2 pb-safe",children:[null!=i.error&&(0,t.jsx)(_.ErrorState,{error:i.error}),s.error&&(0,t.jsx)(_.ErrorState,{error:s.error}),s.data?.length===0&&(0,t.jsx)("p",{className:"py-4 text-[0.875rem] text-ink-2",children:"No confirmed dancers yet."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:s.data?.map(a=>(0,t.jsxs)("li",{className:"flex items-center gap-3 py-2.5",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"block font-semibold",children:[a.first_name," ",a.last_name]}),a.has_medical&&(0,t.jsxs)("span",{className:(0,x.cn)("block text-[0.7812rem] font-semibold",a.requires_alert?"text-critical":"text-caution"),children:[(0,t.jsx)(l.HeartPulse,{className:"mr-1 inline size-3.5 align-[-2px]","aria-hidden":!0}),a.requires_alert?"Medical alert":"Medical information"]}),a.routines&&(0,t.jsx)("span",{className:"block truncate text-[0.7812rem] text-ink-3",children:a.routines})]}),(0,t.jsx)("div",{role:"group","aria-label":`Mark ${a.first_name}`,className:"flex gap-1",children:w.map(([s,n])=>(0,t.jsx)("button",{"aria-pressed":a.status===s,onClick:()=>i.mutate({sql:h.MARK_REHEARSAL,params:[e.id,a.student_id,s]}),className:(0,x.cn)("h-11 min-w-[3.25rem] rounded-[var(--radius-md)] border px-2.5 text-[0.8125rem] font-semibold",a.status===s?"absent"===s?"border-critical bg-critical text-surface":"late"===s?"border-caution bg-caution text-surface":"border-positive bg-positive text-surface":"border-line-strong text-ink-2 hover:border-ink-3"),children:n},s))})]},a.student_id))})]})]})})}e.s(["BuyTickets",0,function({eventId:e}){let s=(0,c.useRows)(["ticket-types",e],h.TICKET_TYPES,[e]),i=(0,c.useRows)(["my-tickets"],h.MY_TICKETS),n=y(),[r,l]=a.useState({});if(!s.data?.length)return null;let o=(i.data??[]).filter(t=>t.event_id===e);return(0,t.jsxs)("div",{className:"space-y-2 border-t border-line pt-3",children:[(0,t.jsx)("p",{className:"font-semibold",children:"Tickets for family and friends"}),o.length>0&&(0,t.jsxs)("p",{className:"text-[0.875rem]",children:[(0,t.jsx)("span",{className:"font-semibold text-positive",children:"Booked:"})," ",o.map(e=>`${e.quantity} \xd7 ${e.name}`).join(", "),"."]}),s.data.map(e=>(0,t.jsxs)("div",{className:"flex items-center gap-2 text-[0.9062rem]",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[e.name," ",(0,t.jsx)("span",{className:"tnum font-semibold",children:(0,f.money)(e.price_minor)}),null!=e.left&&e.left<20?(0,t.jsx)("span",{className:"block text-[0.8125rem] font-semibold text-caution",children:0===e.left?"Sold out":`${e.left} left`}):null]}),(0,t.jsx)(_.Input,{"aria-label":`How many ${e.name} tickets`,type:"number",min:1,max:e.per_family_max,className:"h-10 w-16",value:r[e.id]??1,onChange:t=>l({...r,[e.id]:Number(t.target.value)})}),(0,t.jsx)(_.Button,{size:"sm",disabled:0===e.left,loading:n.isPending,onClick:()=>n.mutate({sql:h.BOOK_TICKETS,params:[e.id,r[e.id]??1]}),children:"Book"})]},e.id)),null!=n.error&&(0,t.jsx)(_.ErrorState,{error:n.error}),(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Added to your account, to pay with your next invoice."})]})},"CostumeSection",0,function({eventId:e,routines:s,hideAdd:i}){let n=(0,c.useRows)(["costumes",e],h.COSTUME_LIST,[e]),r=y(),[l,o]=a.useState({name:"",routine:"",price:""}),d=a.useMemo(()=>{let e=new Map;for(let t of n.data??[])e.set(t.item_id,{name:t.item,routine:t.routine,lines:[...e.get(t.item_id)?.lines??[],t]});return[...e.entries()]},[n.data]);return(0,t.jsxs)(p.DetailSection,{title:"Costumes",children:[null!=r.error&&(0,t.jsx)(_.ErrorState,{error:r.error}),d.map(([e,a])=>{let s=a.lines.filter(e=>e.size).length;return(0,t.jsxs)("details",{className:"border-b border-line",children:[(0,t.jsxs)("summary",{className:"flex min-h-[44px] cursor-pointer items-center gap-2 py-2 text-[0.875rem]",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("b",{className:"font-semibold",children:a.name}),a.routine?(0,t.jsxs)("span",{className:"text-ink-3",children:[" · ",a.routine]}):""]}),(0,t.jsxs)("span",{className:(0,x.cn)("text-[0.8125rem] tnum",s<a.lines.length?"font-semibold text-caution":"text-ink-3"),children:[s," of ",a.lines.length," sizes"]})]}),(0,t.jsx)("ul",{className:"divide-y divide-line border-t border-line pb-2 pl-3 text-[0.8438rem]",children:a.lines.map(s=>(0,t.jsxs)("li",{className:"flex items-center gap-2 py-1.5",children:[(0,t.jsx)("span",{className:"min-w-0 flex-1 truncate",children:s.dancer}),(0,t.jsx)("span",{className:(0,x.cn)("w-20 shrink-0",!s.size&&"text-ink-3"),children:s.size??"No size"}),(0,t.jsx)(_.Select,{"aria-label":`${a.name} for ${s.dancer}`,className:"h-8 w-32 text-[0.7812rem]",value:s.status,onChange:t=>r.mutate({sql:h.SET_COSTUME_STATUS,params:[e,s.student_id,t.target.value]}),children:b.map(([e,a])=>(0,t.jsx)("option",{value:e,children:a},e))})]},s.student_id))})]},e)}),(0,t.jsx)("p",{className:"mt-2 text-[0.8125rem] text-ink-3",children:"Families give sizes from their app. Status here is for the office."}),!i&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("div",{className:"mt-3 grid grid-cols-2 gap-2",children:[(0,t.jsx)(_.Input,{"aria-label":"Costume item",placeholder:"Item, e.g. Red waistcoat",value:l.name,onChange:e=>o({...l,name:e.target.value})}),(0,t.jsxs)(_.Select,{"aria-label":"For routine",value:l.routine,onChange:e=>o({...l,routine:e.target.value}),children:[(0,t.jsx)("option",{value:"",children:"Everyone in the show"}),s.map(e=>(0,t.jsx)("option",{value:e.id,children:e.title},e.id))]})]}),(0,t.jsx)(_.Button,{size:"sm",className:"mt-2",disabled:!l.name.trim(),onClick:()=>{r.mutate({sql:h.ADD_COSTUME,params:[e,l.routine||null,l.name,Math.round(100*Number(l.price||0))]}),o({name:"",routine:"",price:""})},children:"Add costume item"})]})]})},"MyCostumes",0,function({eventId:e}){let a=(0,c.useRows)(["my-costumes",e],h.MY_COSTUMES,[e]),s=y();return a.data?.length?(0,t.jsxs)("div",{className:"space-y-2 border-t border-line pt-3 text-[0.9062rem]",children:[(0,t.jsx)("p",{className:"font-semibold",children:"Costume sizes"}),a.data.map(e=>(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[e.first_name," · ",e.name,e.status&&"needed"!==e.status&&(0,t.jsxs)("span",{className:"text-ink-3",children:[" · ",b.find(t=>t[0]===e.status)?.[1]]})]}),(0,t.jsxs)(_.Select,{"aria-label":`${e.name} size for ${e.first_name}`,className:"h-10 w-36",value:e.size??"",onChange:t=>s.mutate({sql:h.SET_COSTUME_SIZE,params:[e.id,e.student_id,t.target.value||null]}),children:[(0,t.jsx)("option",{value:"",children:"Choose size…"}),e.sizes.map(e=>(0,t.jsx)("option",{value:e,children:e},e))]})]},e.id+e.student_id)),null!=s.error&&(0,t.jsx)(_.ErrorState,{error:s.error})]}):null},"ProgrammeButton",0,function({event:e}){let{session:a}=(0,u.useSession)(),s=async()=>{let t,s,i=window.open("","_blank");if(i){try{[t,s]=await Promise.all([(0,m.readAs)(a,h.PROGRAMME,[e.id]),(0,m.readAs)(a,"select name, brand_colour, logo_url from studio order by created_at limit 1")])}catch{i.document.write('<!doctype html><meta charset="utf-8"><title>Programme</title><p style="font:16px sans-serif;padding:24px">The programme could not be loaded. Close this window and try again.</p>'),i.document.close();return}i.document.write((0,g.programmeHtml)({school:s[0]??{name:"Programme"},event:{title:e.title,when:`${(0,f.dateLong)(e.starts_at)} \xb7 ${(0,f.time)(e.starts_at)}`,venue:e.venue},rows:t,fontFaces:(0,g.documentFontFaces)()})),i.document.close()}};return(0,t.jsxs)(_.Button,{size:"sm",variant:"ghost",onClick:s,children:[(0,t.jsx)(o.Printer,{className:"size-4","aria-hidden":!0})," Print programme"]})},"RehearsalRegisterButton",0,function({rehearsal:e}){let[i,n]=a.useState(!1);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(_.Button,{size:"sm",variant:"ghost",onClick:()=>n(!0),"aria-label":`Register for ${e.title}`,children:[(0,t.jsx)(r.ClipboardCheck,{className:"size-4","aria-hidden":!0})," Register"]}),i&&(0,s.createPortal)((0,t.jsx)(v,{rehearsal:e,onClose:()=>n(!1)}),document.body)]})},"TicketSection",0,function({eventId:e}){let s=(0,c.useRows)(["ticket-types",e],h.TICKET_TYPES,[e]),i=y(),[n,r]=a.useState({name:"Adult",price:"",cap:"",max:"6"});return(0,t.jsxs)(p.DetailSection,{title:"Tickets",children:[null!=i.error&&(0,t.jsx)(_.ErrorState,{error:i.error}),(0,t.jsx)("ul",{className:"divide-y divide-line text-[0.875rem]",children:s.data?.map(e=>(0,t.jsxs)("li",{className:"flex min-h-[40px] items-center gap-2 py-1.5",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"font-semibold",children:e.name})," ",(0,t.jsx)("span",{className:"text-ink-3 tnum",children:(0,f.money)(e.price_minor)})]}),(0,t.jsxs)("span",{className:"tnum text-[0.8125rem] text-ink-2",children:[e.sold," sold",null!=e.left?` \xb7 ${e.left} left`:""]})]},e.id))}),(0,t.jsxs)("div",{className:"mt-3 grid grid-cols-4 gap-2",children:[(0,t.jsx)(_.Input,{"aria-label":"Ticket name",className:"col-span-2",value:n.name,onChange:e=>r({...n,name:e.target.value})}),(0,t.jsx)(_.Input,{"aria-label":"Price in pounds",type:"number",min:0,step:.5,placeholder:"£",value:n.price,onChange:e=>r({...n,price:e.target.value})}),(0,t.jsx)(_.Input,{"aria-label":"Seats",type:"number",min:1,placeholder:"Seats",value:n.cap,onChange:e=>r({...n,cap:e.target.value})})]}),(0,t.jsx)(_.Button,{size:"sm",className:"mt-2",disabled:!n.name.trim()||""===n.price,onClick:()=>{i.mutate({sql:h.ADD_TICKET_TYPE,params:[e,n.name,Math.round(100*Number(n.price)),n.cap?Number(n.cap):null,Number(n.max)||6]}),r({name:"Child",price:"",cap:"",max:"6"})},children:"Add ticket type"}),(0,t.jsx)("p",{className:"mt-2 text-[0.8125rem] text-ink-3",children:"Families book from their Events page; tickets go on their account until card payment is switched on."})]})}])},57715,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(18566),i=e.i(42009),n=e.i(90119),r=e.i(64659),l=e.i(7233),o=e.i(83086),d=e.i(17658),c=e.i(45060);let m=[{kind:"class",label:"New class",hint:"A weekly class on the timetable",page:"/classes",icon:n.CalendarPlus},{kind:"event",label:"New event",hint:"A show, competition, workshop or social",page:"/events",icon:o.Sparkles},{kind:"exam",label:"New exam",hint:"An examiner’s visit, with fees and a register",page:"/events",icon:i.Award}];e.s(["TimetableAdd",0,function({here:e,onAdd:i}){let n=(0,s.useRouter)(),[o,u]=a.useState(!1),p=a.useRef(null);return a.useEffect(()=>{if(!o)return;let e=e=>{p.current?.contains(e.target)||u(!1)},t=e=>{"Escape"===e.key&&u(!1)};return document.addEventListener("mousedown",e),document.addEventListener("keydown",t),()=>{document.removeEventListener("mousedown",e),document.removeEventListener("keydown",t)}},[o]),(0,t.jsxs)("div",{ref:p,className:"relative",children:[(0,t.jsxs)(d.Button,{size:"sm",variant:"primary","aria-haspopup":"menu","aria-expanded":o,onClick:()=>u(e=>!e),children:[(0,t.jsx)(l.Plus,{className:"size-4","aria-hidden":!0})," Add ",(0,t.jsx)(r.ChevronDown,{className:(0,c.cn)("size-3.5 transition-transform",o&&"rotate-180"),"aria-hidden":!0})]}),o&&(0,t.jsx)("div",{role:"menu","aria-label":"Add to the timetable",className:"absolute right-0 top-full z-40 mt-1.5 w-[min(18rem,calc(100vw-2rem))] rounded-[var(--radius-lg)] border border-line bg-surface p-1.5 shadow-lg",children:m.map(({kind:a,label:s,hint:r,page:l,icon:o})=>(0,t.jsxs)("button",{role:"menuitem",onClick:()=>((t,a)=>{u(!1),("events"===e?"class"!==t:"class"===t)?i(t):n.push(`${a}/?new=${t}`)})(a,l),className:"flex w-full items-start gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left hover:bg-surface-2 focus-visible:bg-surface-2",children:[(0,t.jsx)(o,{className:"mt-0.5 size-4 shrink-0 text-ink-2","aria-hidden":!0}),(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsx)("span",{className:"block text-[0.9375rem] font-semibold",children:s}),(0,t.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:r})]})]},a))})]})},"useAddParam",0,function(e){let t=a.useRef(e);t.current=e,a.useEffect(()=>{let e=new URL(window.location.href),a=e.searchParams.get("new");("class"===a||"event"===a||"exam"===a)&&(e.searchParams.delete("new"),window.history.replaceState(window.history.state,"",e.pathname+e.search+e.hash),t.current(a))},[])}])},70448,e=>{"use strict";var t=e.i(54626),a=e.i(7989);let s=e=>String(e??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]);function i(e){let s=(0,t.paletteFor)((0,t.normaliseHex)(e.brand_colour));return{accent:s.accent,onAccent:s.onAccent,text:s.text,line:s.line,ink:a.SWAYVO.ink,muted:"#5b6070",hair:"#dfe1e8"}}let n=e=>[e.dancers??"",e.unnamed?`${e.dancers?"and ":""}${e.unnamed} dancer${1===e.unnamed?"":"s"}`:""].filter(Boolean).join(" "),r={class_moved:{word:"Moved",tone:"ink"},class_cancelled:{word:"Cancelled",tone:"critical"},cover:{word:"Changed",tone:"ink"},fee_due:{word:"Due",tone:"caution"},invitation:{word:"Invited",tone:"accent"},absence_received:{word:"Received",tone:"ink"}};e.s(["TEMPLATE_LABELS",0,{class_moved:"A class moves",class_cancelled:"A class is cancelled",cover:"A cover teacher",fee_due:"A fee is due",invitation:"An invitation to the app",absence_received:"An absence report received"},"documentFontFaces",0,function(){if("u"<typeof document)return"";let e=[];for(let t of Array.from(document.styleSheets)){let a;try{a=t.cssRules}catch{continue}for(let t of Array.from(a))"CSSFontFaceRule"===t.constructor.name&&/Archivo|Inter/.test(t.cssText)&&e.push(t.cssText)}return e.join("\n")},"programmeHtml",0,function({school:e,event:r,rows:l,fontFaces:o="",autoPrint:d=!0}){let c,m,u,p=i(e),_=l.map((e,t)=>`
  <li>
    <span class="n">${t+1}</span>
    <div class="body">
      <p class="routine">${s(e.routine)}</p>
      ${e.class_name?`<p class="class">${s(e.class_name)}</p>`:""}
      ${n(e)?`<p class="dancers">${s(n(e))}</p>`:""}
    </div>
  </li>`).join("");return`<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8">
<title>${s(r.title)} \xb7 ${s(e.name)} \xb7 programme</title>
<style>
${o}
:root{--display:"Archivo Variable",Archivo,"Arial Black","Helvetica Neue",Arial,sans-serif;--text:"Inter Variable",Inter,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;--accent:${p.accent};--accent-text:${p.text};--ink:${p.ink};--muted:${p.muted};--hair:${p.hair}}
@page{size:A4;margin:16mm 16mm 18mm}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0 auto;max-width:680px;padding:40px 20px;background:#fff;color:var(--ink);font:400 15px/1.5 var(--text)}
header{display:flex;align-items:center;gap:16px;padding-bottom:20px;border-bottom:4px solid var(--accent)}
.school{font:800 13px/1.2 var(--display);font-stretch:112%;letter-spacing:.04em;text-transform:uppercase;color:var(--accent-text);margin:0}
h1{font:850 44px/0.95 var(--display);font-stretch:118%;letter-spacing:-0.025em;margin:22px 0 0}
.when{margin:10px 0 0;color:var(--muted);font-size:16px}
h2{font:800 20px/1.1 var(--display);font-stretch:112%;margin:34px 0 0;padding-bottom:8px;border-bottom:2px solid var(--ink)}
ol{list-style:none;margin:0;padding:0}
li{display:grid;grid-template-columns:3rem minmax(0,1fr);gap:12px;padding:14px 0;border-bottom:1px solid var(--hair);break-inside:avoid}
.n{font:850 28px/1 var(--display);font-stretch:118%;color:var(--accent-text);font-variant-numeric:tabular-nums lining-nums}
.routine{margin:0;font:800 18px/1.2 var(--display);font-stretch:112%}
.class{margin:2px 0 0;font-weight:600}
.dancers{margin:4px 0 0;color:var(--muted);font-size:14px}
.empty{color:var(--muted);padding:14px 0}
footer{margin-top:32px;display:flex;justify-content:space-between;align-items:center;gap:12px;color:var(--muted);font-size:12px}
@media print{body{padding:0;max-width:none}}
</style></head>
<body>
<header>${c=i(e),(u=(m=e.logo_url)&&(/^data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]/i.test(m)||/^https?:\/\//i.test(m))?m:null)?`<img src="${s(u)}" alt="${s(e.name)} logo" style="height:56px;width:auto;max-width:168px;object-fit:contain;display:block">`:`<span aria-hidden="true" style="display:inline-grid;place-items:center;width:56px;height:56px;border-radius:${Math.round(12.32)}px;background:${c.accent};color:${c.onAccent};font:800 ${Math.round(.4*56)}px/1 var(--display);letter-spacing:-0.01em">${s((0,t.monogram)(e.name))}</span>`}<p class="school">${s(e.name)}</p></header>
<h1>${s(r.title)}</h1>
<p class="when">${s([r.when,r.venue].filter(Boolean).join(" · "))}</p>
<h2>Running order</h2>
${l.length?`<ol>${_}</ol>`:'<p class="empty">The running order is still being set.</p>'}
<footer><span>${s(e.name)}</span><span>powered by ${function(e=12){let t=Math.round(e*a.LOCKUP.width/a.LOCKUP.height),s=a.MARK_BARS.map(e=>`<rect x="${e.x}" y="${e.y}" width="${a.BAR_W}" height="${e.h}" rx="1" fill="${e.downbeat?a.SWAYVO.blue:a.SWAYVO.ink}"/>`).join(""),i=a.WORD_PATHS.map(e=>`<path d="${e.d}"${e.transform?` transform="${e.transform}"`:""}/>`).join("");return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a.LOCKUP.width} ${a.LOCKUP.height}" width="${t}" height="${e}" role="img" aria-label="Swayvo" style="vertical-align:-2px"><g transform="translate(${a.LOCKUP.markX} ${a.LOCKUP.markY}) scale(${a.LOCKUP.markScale})">${s}</g><g transform="translate(${a.LOCKUP.wordX} ${a.LOCKUP.wordY})"><g transform="${a.WORD_TRANSFORM}" fill="none" stroke="${a.SWAYVO.ink}" stroke-width="${a.WORD_STROKE}" stroke-linejoin="bevel">${i}</g></g></svg>`}(12)}</span></footer>
${d?"<script>(document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ setTimeout(function(){ window.print() }, 50) })</script>":""}
</body></html>`},"renderMessage",0,function(e){let t,a=i(e.school),n=(t=r[e.kind].word,"fee_due"===e.kind&&e.due?`${t} ${e.due}`:t),l=`${n.toUpperCase()}: ${e.title}`.slice(0,140),o=r[e.kind].tone,d="critical"===o?"#b42318":"caution"===o?"#9a5b00":"accent"===o?a.text:a.ink,c=`${e.school.name}${e.school.contact_email?` \xb7 ${e.school.contact_email}`:""}`,m=[e.school.name,"",`${n.toUpperCase()}`,e.title,"",`Hi ${e.to},`,"",e.detail,"",...e.action?[`${e.action.label}: ${e.action.url}`,""]:[],c,"Sent with Swayvo. You get this because your family is at the school; change what you get under Settings in the app."].join("\n"),u=e.action?`<tr><td style="padding:8px 0 4px"><a href="${s(e.action.url)}" style="display:inline-block;background:${a.accent};color:${a.onAccent};font:600 15px/1 Inter,Arial,sans-serif;text-decoration:none;padding:14px 20px;border-radius:10px">${s(e.action.label)}</a></td></tr>`:"",p=`<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${s(l)}</title></head>
<body style="margin:0;padding:0;background:#ffffff;color:${a.ink}">
<span style="display:none;max-height:0;overflow:hidden">${s(e.title)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff">
<tr><td align="center" style="padding:24px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font:15px/1.5 Inter,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${a.ink}">
<tr><td style="padding-bottom:14px;border-bottom:4px solid ${a.accent}">
  <p style="margin:0;font:800 14px/1.2 Archivo,'Arial Black',Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:${a.text}">${s(e.school.name)}</p>
</td></tr>
<tr><td style="padding-top:22px">
  <p style="margin:0;font:800 26px/1 Archivo,'Arial Narrow','Arial Black',Arial,sans-serif;text-transform:uppercase;letter-spacing:-0.01em;color:${d}">${s(n)}</p>
  <p style="margin:8px 0 0;font-weight:600;font-size:17px;line-height:1.35">${s(e.title)}</p>
</td></tr>
<tr><td style="padding-top:18px">
  <p style="margin:0">Hi ${s(e.to)},</p>
  <p style="margin:10px 0 0">${s(e.detail)}</p>
</td></tr>
${u}
<tr><td style="padding-top:28px;border-bottom:1px solid #dfe1e8"></td></tr>
<tr><td style="padding-top:14px;font-size:13px;color:#5b6070">
  <p style="margin:0">${s(c)}</p>
  <p style="margin:6px 0 0">Sent with Swayvo. You get this because your family is at the school; change what you get under Settings in the app.</p>
</td></tr>
</table></td></tr></table></body></html>`;return{subject:l,text:m,html:p}},"sampleMessage",0,function(e,t,a="https://app.example/family/"){let s={kind:e,school:t,to:"Hannah"};switch(e){case"class_moved":return{...s,title:"Grade 2 Ballet on Tue 8 Dec moves to Studio Two",detail:"Same time, same teacher. Nia’s class is in Studio Two this week only, while the main hall floor is repaired.",action:{label:"See Nia’s week",url:a}};case"class_cancelled":return{...s,title:"Street Seniors, Friday 11 December",detail:"The class is cancelled this week because the teacher is unwell. Amir’s other classes go ahead as usual.",action:{label:"See Amir’s week",url:a}};case"cover":return{...s,title:"Priya Raman teaches Senior Tap on Thu 10 Dec",detail:"Marcus is away, so Priya covers. Same time and room.",action:{label:"See Amir’s week",url:a}};case"fee_due":return{...s,due:"4 Dec",title:"Spring term fees · £162.00",detail:"Invoice NDA-0142 for Amir, Clara and Nia. Pay by bank transfer; the details are on your Payments page.",action:{label:"See how to pay",url:a+"payments/"}};case"invitation":return{...s,title:`Join ${t.name} on the app`,detail:"Your children’s classes, changes and notices in one place. The link works once and lasts 14 days.",action:{label:"Accept the invitation",url:a.replace(/family\/$/,"invite/")}};case"absence_received":return{...s,title:"Nia won’t be at Grade 2 Ballet on Tue 8 Dec",detail:"Thanks for telling us. Her teacher sees it on the register. If a make-up place comes up, it will show on your home screen."}}}])},29074,e=>{"use strict";let t=`
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
 order by c.day_of_week, c.start_time`,a=`
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
 order by s.last_name, s.first_name`,s=`
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
                           where r.deleted_at is null order by l.name, r.name`,o=`select id, display_name from staff_member
                           where deleted_at is null and status = 'active' order by display_name`,d=`select id, name, starts_on, ends_on from term
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
returning id`,m=`
update class set dance_style_id = $2, level_id = $3, location_id = $4, room_id = $5,
                 teacher_id = $6, name = $7, day_of_week = $8, start_time = $9::time,
                 duration_min = $10, capacity = $11, age_min = $12, age_max = $13,
                 price_minor = $14, trials_enabled = $15, waitlist_enabled = $16,
                 visibility = $17::class_visibility, pricing = $18::pricing_model,
                 trial_price_minor = $19, assistant_id = $20, prerequisites = nullif(btrim($21), ''),
                 description = nullif(btrim($22), ''), trial_needs_approval = $23, updated_at = now()
 where id = $1
returning id`,u=`
select c.id, c.name, c.term_id, c.dance_style_id, c.level_id, c.location_id, c.room_id,
       c.teacher_id, c.day_of_week, c.start_time, c.duration_min, c.capacity,
       c.age_min, c.age_max, c.price_minor, c.trials_enabled, c.waitlist_enabled,
       c.visibility::text as visibility, c.pricing::text as pricing, c.trial_price_minor,
       c.assistant_id, c.prerequisites, c.description, c.trial_needs_approval,
       (select count(*)::int from class_session cs
         where cs.class_id = c.id and cs.deleted_at is null and cs.starts_at > now()) as future_sessions
  from class c where c.id = $1 and c.deleted_at is null`,p=`
insert into enrolment (studio_id, class_id, student_id, status, started_on, note, created_by)
select c.studio_id, c.id, $2, 'active', coalesce($3::date, current_date),
       nullif(btrim($4),''), auth.uid()
  from class c where c.id = $1
returning id`,_=`
insert into waitlist_entry (studio_id, class_id, student_id, status, position, note)
select c.studio_id, c.id, $2, 'waiting', 0, nullif(btrim($3),'')
  from class c where c.id = $1
returning id, position`,h=`
select c.id, c.name, app.class_enrolled_count(c.id) as enrolled, c.capacity
  from class c where c.deleted_at is null order by c.day_of_week, c.start_time`,f=`
select c.id, c.name, c.day_of_week, c.start_time, c.age_min, c.age_max, c.price_minor, c.pricing::text as pricing,
       c.capacity, app.class_free_places(c.id) as free
  from class c
 where c.deleted_at is null and c.id <> $1
   and c.term_id in (select t.id from term t where t.deleted_at is null and t.status <> 'archived')
 order by c.day_of_week, c.start_time`,x=`
select e.id as enrolment_id, c.id as class_id, c.name, c.day_of_week, c.start_time, c.price_minor, c.pricing::text as pricing,
       case when e.moved_to is not null then e.ended_on end as leaving_on,
       case when e.moved_from is not null and e.started_on > current_date then e.started_on end as joining_on
  from enrolment e join class c on c.id = e.class_id
 where e.student_id = $1 and e.status = 'active' and e.deleted_at is null
 order by c.day_of_week, c.start_time`,g=`
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
 order by (t.status in ('requested','booked')) desc, cs.starts_at nulls last`,y=`
select cs.id, cs.starts_at
  from class_session cs
 where cs.class_id = $1 and cs.deleted_at is null
   and cs.starts_at > now() and cs.status = 'scheduled'
 order by cs.starts_at limit 8`,b=`
select s.id, s.first_name, s.last_name, s.date_of_birth, f.name as family_name
  from student s
  join family f on f.id = s.family_id
 where s.deleted_at is null and s.left_on is null
   and not exists (select 1 from enrolment e
                    where e.student_id = s.id and e.class_id = $1
                      and e.status = 'active' and e.deleted_at is null)
 order by s.last_name, s.first_name`,w=`
select app.class_free_places($1) as free, app.class_live_offers($1) as offers,
       (select waitlist_offer_days from studio s join class c on c.studio_id = s.id where c.id = $1) as offer_days`,v=`
select n.id, n.body, n.created_at, u.full_name as author
  from enquiry_note n left join user_account u on u.id = n.created_by
 where n.enquiry_id = $1 and n.deleted_at is null
 order by n.created_at desc, n.id`,$=`
update enquiry set stage = $2::enquiry_stage, updated_at = now(),
       next_action_on = $3::date
 where id = $1
returning id`,k=`
select t.id, t.name, t.starts_on, t.ends_on, current_date between t.starts_on and t.ends_on as current,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes
  from term t where t.deleted_at is null and t.status <> 'archived' order by t.starts_on desc`,j=`
insert into enquiry (studio_id, contact_name, contact_phone, contact_email, child_name, child_dob,
                     interest_class_id, source, next_action_on, created_by)
select s.id, btrim($1), nullif(btrim($2), ''), nullif(lower(btrim($3)), ''), nullif(btrim($4), ''), $5::date,
       $6::uuid, $7, coalesce($8::date, current_date + 2), auth.uid()
  from studio s where s.deleted_at is null and app.is_admin(s.id) limit 1
returning id`,S=`
update class set level_note = nullif(btrim($2), ''), what_to_bring = nullif(btrim($3), ''), updated_at = now()
 where id = $1 returning id`;e.s(["ACCEPT_PLACE",0,"select app.accept_waitlist_place($1) as enrolment_id","ADD_ENQUIRY_NOTE",0,"select app.add_enquiry_note($1, $2, $3::date) as id","BOOK_TRIAL",0,"select app.book_trial($1, $2, $3::jsonb) as id","CANCEL_MOVE",0,"select app.cancel_class_move($1)","CLASSES",0,t,"CLASS_CANDIDATES",0,"select * from app.class_candidates($1) where not enrolled and not waiting","CLASS_FOR_EDIT",0,u,"CLASS_FREE",0,w,"CLASS_OPTIONS",0,h,"CLASS_PUBLIC_EXTRA",0,"select level_note, what_to_bring from class where id = $1","CLASS_ROSTER",0,a,"CLASS_SESSIONS_AHEAD",0,y,"CLASS_WAITLIST",0,s,"CLOSE_ENQUIRY",0,"select app.close_enquiry($1, $2) as ok","CONVERT_TRIAL",0,"select app.convert_trial($1, $2) as enrolment_id","COPY_CLASSES",0,"select app.copy_classes($1::uuid[], $2, $3) as r","CREATE_CLASS",0,c,"CREATE_ENQUIRY",0,j,"DECLINE_PLACE",0,"select app.decline_waitlist_place($1, $2) as ok","ENQUIRIES",0,n,"ENQUIRY_NOTES",0,v,"ENROL",0,p,"ENROLLABLE_STUDENTS",0,b,"FUNNEL",0,i,"GENERATE_SESSIONS",0,"select app.generate_class_sessions($1) as made","JOIN_WAITLIST",0,_,"LEVELS",0,"select id, name from level where deleted_at is null order by sort_order, name","LOCATIONS",0,r,"MOVE_OPTIONS",0,f,"MOVE_PREVIEW",0,"select * from app.move_preview($1, $2, $3::date)","OFFER_PLACE",0,"select app.offer_waitlist_place($1, $2) as ok","OPEN_TERMS",0,d,"RESCHEDULE_CLASS",0,"select app.reschedule_class($1) as net","ROOMS",0,l,"SET_CLASS_PUBLIC_EXTRA",0,S,"SET_ENQUIRY_FOLLOW_UP",0,"select app.set_enquiry_follow_up($1, $2::date) as ok","SET_ENQUIRY_STAGE",0,$,"STUDENT_PLACES",0,x,"STYLES",0,"select id, name, colour from dance_style where deleted_at is null order by name","TEACHERS",0,o,"TERM_TABS",0,k,"TRANSFER",0,"select app.transfer_enrolment($1, $2, $3, $4::date) as id","TRIALS",0,g,"TRIAL_OUTCOME",0,"select app.record_trial_outcome($1, $2, $3) as ok","UPDATE_CLASS",0,m,"WITHDRAW",0,"select app.withdraw_enrolment($1, $2) as offered"])}]);