(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,61574,e=>{"use strict";let t=(0,e.i(75254).default)("heart-pulse",[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",key:"mvr1a0"}],["path",{d:"M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27",key:"auskq0"}]]);e.s(["HeartPulse",0,t],61574)},3281,e=>{"use strict";let t=(0,e.i(75254).default)("printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);e.s(["Printer",0,t],3281)},57850,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(37727),n=e.i(45060);e.s(["DetailPanel",0,function({open:e,onClose:a,title:r,subtitle:d,children:l,actions:o}){return(s.useEffect(()=>{if(!e)return;let t=e=>{"Escape"===e.key&&a()};return document.addEventListener("keydown",t),()=>document.removeEventListener("keydown",t)},[e,a]),e)?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{className:"fixed inset-0 z-40 bg-ink/25 lg:hidden",onClick:a,"aria-hidden":!0}),(0,t.jsxs)("aside",{role:"dialog","aria-modal":"true","aria-label":"string"==typeof r?r:"Details",className:(0,n.cn)("fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-[var(--radius-xl)]","border-t border-line bg-surface shadow-lg pb-safe","lg:sticky lg:top-4 lg:z-auto lg:max-h-[calc(100dvh-2rem)] lg:rounded-[var(--radius-lg)] lg:border lg:shadow-md"),children:[(0,t.jsxs)("div",{className:"sticky top-0 z-10 flex items-start gap-3 border-b border-line bg-surface px-5 pb-3 pt-4",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{className:"truncate font-display text-[1.25rem] leading-tight",children:r}),d&&(0,t.jsx)("div",{className:"mt-1 truncate text-[0.8438rem] text-ink-3",children:d})]}),o,(0,t.jsx)("button",{onClick:a,"aria-label":"Close details",className:"grid size-9 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink",children:(0,t.jsx)(i.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsx)("div",{className:"px-5 py-4",children:l})]})]}):null},"DetailSection",0,function({title:e,children:s,action:i}){return(0,t.jsxs)("section",{className:"mb-7 last:mb-0",children:[(0,t.jsxs)("div",{className:"mb-2 flex min-h-[28px] items-center gap-2 border-b border-ink pb-1.5",children:[(0,t.jsx)("h3",{className:"section-title text-[0.875rem]",children:e}),i&&(0,t.jsx)("div",{className:"ml-auto",children:i})]}),s]})},"KeyValue",0,function({rows:e}){return(0,t.jsx)("dl",{className:"divide-y divide-line",children:e.map(([e,s])=>(0,t.jsxs)("div",{className:"flex gap-3 py-2 text-[0.875rem]",children:[(0,t.jsx)("dt",{className:"w-28 shrink-0 text-ink-3",children:e}),(0,t.jsx)("dd",{className:"min-w-0 flex-1 break-words",children:s??(0,t.jsx)("span",{className:"text-ink-3",children:"—"})})]},e))})}])},72769,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(54616),n=e.i(12598),a=e.i(45060),r=e.i(77326),d=e.i(13927),l=e.i(30224),o=e.i(31502),c=e.i(17658),m=e.i(27389),u=e.i(24098),_=e.i(75379);let p={competition:"Competition",show:"Show",exam:"Exam",workshop:"Workshop",private_lesson:"Private lesson",rehearsal:"Rehearsal",social:"Social"},h={requested:{label:"Requested — waiting on the studio",tone:"caution"},confirmed:{label:"Confirmed",tone:"positive"},invited:{label:"Invited",tone:"info"},declined:{label:"Not this time",tone:"neutral"},waitlisted:{label:"Waiting list",tone:"caution"},withdrawn:{label:"Withdrawn",tone:"neutral"}},x={caution:"text-caution",positive:"text-positive",info:"text-info",neutral:"text-ink-2"};function f({event:e,children:n,onClose:a,onDone:r}){let{session:d}=(0,o.useSession)(),[u,p]=s.useState(n[0]?.id??""),[h,x]=s.useState(""),[v,b]=s.useState(!1),j=(0,i.useMutation)({mutationFn:async()=>(0,l.runAs)(d,t=>t(m.REQUEST_PLACE,[e.id,u,h.trim()||null])),onSuccess:()=>b(!0)});return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:a,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"ask-title",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:v?(0,t.jsxs)("div",{className:"py-2",children:[(0,t.jsx)("p",{className:"font-display text-[1.375rem] uppercase leading-none tracking-[-0.01em] [font-stretch:80%]",children:"Sent"}),(0,t.jsx)("p",{id:"ask-title",className:"mt-1.5 font-semibold",children:"Request sent"}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:"The studio will confirm. Nothing is booked until they do."}),(0,t.jsx)(c.Button,{className:"mt-4 w-full",variant:"primary",onClick:r,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("h2",{id:"ask-title",className:"text-[1.0625rem] font-semibold tracking-tight",children:"Ask to take part"}),(0,t.jsx)("p",{className:"mt-0.5 text-sm text-ink-2",children:e.title}),(0,t.jsxs)("div",{className:"mt-4 space-y-3",children:[n.length>1&&(0,t.jsx)(c.Field,{label:"Who for",htmlFor:"ask-student",children:(0,t.jsx)(c.Select,{id:"ask-student",value:u,onChange:e=>p(e.target.value),children:n.map(e=>(0,t.jsxs)("option",{value:e.id,children:[e.first_name," ",e.last_name]},e.id))})}),(0,t.jsx)(c.Field,{label:"Anything the studio should know",htmlFor:"ask-note",hint:"Optional. Availability, which piece, that sort of thing.",children:(0,t.jsx)(c.Input,{id:"ask-note",value:h,onChange:e=>x(e.target.value),placeholder:"Free most evenings except Thursday"})}),null!=e.cost_minor&&(0,t.jsxs)("p",{className:"rounded-[var(--radius-md)] bg-surface-2 p-3 text-[0.8125rem] text-ink-2",children:["This costs ",(0,_.money)(e.cost_minor),". You will be invoiced only once the studio confirms."]})]}),j.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(c.ErrorState,{error:j.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(c.Button,{className:"flex-1",onClick:a,children:"Cancel"}),(0,t.jsx)(c.Button,{className:"flex-1",variant:"primary",loading:j.isPending,disabled:!u,onClick:()=>j.mutate(),children:"Send request"})]})]})})})}function v({eventId:e}){let{session:s}=(0,o.useSession)(),a=(0,n.useQueryClient)(),r=(0,d.useRows)(["helper-slots",e],"select * from app.helper_slots($1)",[e]),m=(0,i.useMutation)({mutationFn:e=>(0,l.runAs)(s,t=>t("select app.volunteer($1, $2)",[e.id,e.on])),onSuccess:()=>a.invalidateQueries({queryKey:["db"]})});return r.data?.length?(0,t.jsxs)("div",{className:"space-y-2 border-t border-line pt-3",children:[(0,t.jsx)("h3",{className:"text-[0.8125rem] font-semibold text-ink-2",children:"Helpers needed"}),(0,t.jsx)("ul",{className:"divide-y divide-line text-[0.875rem]",children:r.data.map(e=>{let s=e.needed-e.filled;return(0,t.jsxs)("li",{className:"flex flex-wrap items-center gap-x-3 gap-y-1 py-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"font-semibold",children:e.role}),(0,t.jsxs)("span",{className:"text-ink-3",children:[e.starts_at?` \xb7 ${(0,_.time)(e.starts_at)}${e.ends_at?`–${(0,_.time)(e.ends_at)}`:""}`:""," · ",s>0?`${s} more needed`:"filled"]}),e.note&&(0,t.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:e.note})]}),e.mine?(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",loading:m.isPending,onClick:()=>m.mutate({id:e.id,on:!1}),children:"You’re helping · drop out"}):s>0&&(0,t.jsx)(c.Button,{size:"sm",loading:m.isPending,onClick:()=>m.mutate({id:e.id,on:!0}),children:"I can help"})]},e.id)})}),null!=m.error&&(0,t.jsx)(c.ErrorState,{error:m.error})]}):null}e.s(["EventsView",0,function({allow:e,title:b}){let{session:j}=(0,o.useSession)(),y=(0,n.useQueryClient)(),g=(0,d.useRows)(["events"],m.EVENTS),w=(0,d.useRows)(["event-children"],"select id, first_name, last_name from student where deleted_at is null order by date_of_birth"),[E,N]=s.useState(null),k=(0,i.useMutation)({mutationFn:e=>(0,l.runAs)(j,t=>t(m.ANSWER_INVITE,[e.id,e.yes])),onSuccess:()=>y.invalidateQueries({queryKey:["db"]})});return(0,t.jsxs)(r.Shell,{title:b,subtitle:"Competitions, shows, exams and private lessons",allow:e,children:[(0,t.jsxs)("div",{className:"mx-auto max-w-2xl",children:[g.isLoading&&(0,t.jsx)("div",{className:"space-y-3",children:[0,1,2].map(e=>(0,t.jsx)(c.Skeleton,{className:"h-24"},e))}),null!=g.error&&(0,t.jsx)(c.ErrorState,{error:g.error,onRetry:()=>g.refetch()}),g.data?.length===0&&!g.isLoading&&(0,t.jsx)(c.EmptyState,{title:"Nothing in the diary",body:"Competitions, shows and workshops show here when the studio adds them."}),(0,t.jsx)("ul",{className:"divide-y divide-line border-t-2 border-ink",children:g.data?.map(s=>{let i=s.mine??[],n=(w.data??[]).filter(e=>!i.some(t=>t.student_id===e.id)),r=s.entries_close_on&&new Date(s.entries_close_on)<new Date,d=null!=s.capacity&&s.going>=s.capacity,l=new Date(s.starts_at);return(0,t.jsxs)("li",{className:"grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 py-5",children:[(0,t.jsxs)("p",{"aria-hidden":!0,className:"text-center leading-none",children:[(0,t.jsx)("span",{className:"block font-display text-[1.875rem] tnum",children:new Intl.DateTimeFormat("en-GB",{day:"numeric",timeZone:"Europe/London"}).format(l)}),(0,t.jsx)("span",{className:"mt-1 block text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-ink-3",children:new Intl.DateTimeFormat("en-GB",{month:"short",timeZone:"Europe/London"}).format(l)})]}),(0,t.jsxs)("article",{className:"min-w-0 space-y-3",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:(0,t.jsx)("span",{className:"font-semibold text-ink-2",children:p[s.kind]??s.kind})}),(0,t.jsx)("h2",{className:"mt-0.5 font-display text-[1.1875rem] leading-tight",children:s.title}),(0,t.jsxs)("p",{className:"mt-1 text-[0.875rem] text-ink-2",children:[["Today","Tomorrow"].includes((0,_.relativeDay)(s.starts_at))?`${(0,_.relativeDay)(s.starts_at)}, `:"",(0,_.dateLong)(s.starts_at)," · ",(0,_.time)(s.starts_at),s.venue?` \xb7 ${s.venue}`:""]}),s.description&&(0,t.jsx)("p",{className:"mt-2 text-[0.9062rem] leading-relaxed text-ink-2",children:s.description}),(0,t.jsxs)("dl",{className:"mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.8438rem]",children:[null!=s.cost_minor&&(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"inline text-ink-3",children:"Cost "}),(0,t.jsx)("dd",{className:"inline font-semibold tnum",children:(0,_.money)(s.cost_minor)})]}),null!=s.capacity&&(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"inline text-ink-3",children:"Places "}),(0,t.jsxs)("dd",{className:"inline font-semibold tnum",children:[Math.max(0,s.capacity-s.going)," left of ",s.capacity,d?" · full":""]})]}),s.entries_close_on&&(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"inline text-ink-3",children:"Entries close "}),(0,t.jsx)("dd",{className:"inline font-semibold",children:(0,_.dateShort)(s.entries_close_on)})]}),s.teacher&&(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"inline text-ink-3",children:"With "}),(0,t.jsx)("dd",{className:"inline font-semibold",children:s.teacher})]})]})]}),i.length>0&&(0,t.jsx)("ul",{className:"space-y-2 border-t border-line pt-3","aria-label":"Your entries",children:i.map(s=>{let i=h[s.status];return(0,t.jsxs)("li",{className:"flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.875rem]",children:[(0,t.jsx)("span",{className:"font-semibold",children:s.first_name}),(0,t.jsx)("span",{className:(0,a.cn)("font-semibold",x[i?.tone??"neutral"]),children:i?.label??s.status}),"invited"===s.status&&e.includes("guardian")&&(0,t.jsxs)("span",{className:"flex gap-2",children:[(0,t.jsxs)(c.Button,{size:"sm",variant:"primary",onClick:()=>k.mutate({id:s.id,yes:!0}),children:[s.first_name," will be there"]}),(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",onClick:()=>k.mutate({id:s.id,yes:!1}),children:"Not this time"})]})]},s.id)})}),null!=k.error&&(0,t.jsx)(c.ErrorState,{error:k.error}),"private_lesson"!==s.kind&&n.length>0&&(!s.requests_open||r||d?0===i.length&&(0,t.jsxs)("p",{className:"text-[0.8438rem] text-ink-3",children:[d?"This one is full.":r?"Entries have closed.":"Not taking requests."," ","Message the studio if you’d still like to be considered."]}):(0,t.jsx)(c.Button,{onClick:()=>N(s),children:i.length?`Ask for ${1===n.length?n[0].first_name:"another child"} too`:"Ask to take part"})),!!s.notices?.length&&(0,t.jsxs)("div",{className:"space-y-2 border-t border-line pt-3",children:[(0,t.jsx)("h3",{className:"text-[0.8125rem] font-semibold text-ink-2",children:"Notices about this"}),s.notices.map((e,s)=>(0,t.jsxs)("div",{className:"border-l-2 border-ink pl-3 text-[0.875rem]",children:[(0,t.jsxs)("p",{className:"font-semibold",children:[e.subject," ",(0,t.jsxs)("span",{className:"font-normal text-ink-3",children:["· ",(0,_.dateShort)(e.sent_at)]})]}),(0,t.jsx)("p",{className:"whitespace-pre-line text-ink-2",children:e.body})]},s))]}),s.rehearsals?.length||"confirmed"===s.my_status&&s.routines?.length?(0,t.jsxs)("ul",{className:"space-y-1 border-t border-line pt-3 text-[0.875rem]",children:[s.rehearsals?.map((e,s)=>(0,t.jsxs)("li",{children:[(0,t.jsx)("span",{className:"font-semibold",children:e.title})," ",(0,t.jsxs)("span",{className:"text-ink-3",children:["· ",(0,_.dateLong)(e.starts_at),", ",(0,_.time)(e.starts_at)]})]},s)),"confirmed"===s.my_status&&s.routines?.map((e,s)=>(0,t.jsxs)("li",{children:["Dance ",e.position,": ",(0,t.jsx)("span",{className:"font-semibold",children:e.title}),e.costume?(0,t.jsxs)("span",{className:"text-ink-3",children:[" · costume: ",e.costume]}):""]},s))]}):null,e.includes("guardian")&&"confirmed"===s.my_status&&(0,t.jsx)(u.MyCostumes,{eventId:s.id}),e.includes("guardian")&&new Date(s.starts_at)>new Date&&(0,t.jsx)(v,{eventId:s.id}),e.includes("guardian")&&("show"===s.kind||"competition"===s.kind)&&new Date(s.starts_at)>new Date&&(0,t.jsx)(u.BuyTickets,{eventId:s.id})]})]},s.id)})})]}),E&&(0,t.jsx)(f,{event:E,children:(w.data??[]).filter(e=>!(E.mine??[]).some(t=>t.student_id===e.id)),onClose:()=>N(null),onDone:()=>{N(null),y.invalidateQueries({queryKey:["db"]})}})]})}])},24098,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(74080),n=e.i(54616),a=e.i(12598),r=e.i(54385),d=e.i(61574),l=e.i(3281),o=e.i(37727),c=e.i(13927),m=e.i(30224),u=e.i(31502),_=e.i(57850),p=e.i(17658),h=e.i(84315),x=e.i(75379),f=e.i(45060);function v(){let{session:e}=(0,u.useSession)(),t=(0,a.useQueryClient)();return(0,n.useMutation)({mutationFn:async t=>(await (0,m.runAs)(e,e=>e(t.sql,t.params)))[0],onSuccess:()=>t.invalidateQueries({queryKey:["db"]})})}let b=[["needed","Needed","caution"],["ordered","Ordered","info"],["arrived","Arrived","info"],["given","With dancer","positive"],["returned","Returned","neutral"]],j=[["present","Here"],["late","Late"],["absent","Absent"]];function y({rehearsal:e,onClose:s}){let i=(0,c.useRows)(["rehearsal-register",e.id],h.REHEARSAL_REGISTER,[e.id]),n=v(),a=i.data?.filter(e=>e.status).length??0;return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6",onClick:s,children:(0,t.jsxs)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"rr-t",onClick:e=>e.stopPropagation(),className:"flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-xl)] border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3 border-b border-line px-5 pb-3 pt-4",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{id:"rr-t",className:"font-display text-[1.25rem] leading-tight",children:e.title}),(0,t.jsxs)("p",{className:"mt-1 text-[0.8438rem] text-ink-3",children:[(0,x.dateLong)(e.starts_at),", ",(0,x.time)(e.starts_at)," · ",(0,t.jsxs)("span",{className:"tnum",children:[a," of ",i.data?.length??0]})," marked"]})]}),(0,t.jsx)(p.Button,{size:"sm",variant:"ghost",onClick:s,"aria-label":"Close",className:"-mr-2 -mt-1",children:(0,t.jsx)(o.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsxs)("div",{className:"min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-2 pb-safe",children:[null!=n.error&&(0,t.jsx)(p.ErrorState,{error:n.error}),i.error&&(0,t.jsx)(p.ErrorState,{error:i.error}),i.data?.length===0&&(0,t.jsx)("p",{className:"py-4 text-[0.875rem] text-ink-2",children:"No confirmed dancers yet."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:i.data?.map(s=>(0,t.jsxs)("li",{className:"flex items-center gap-3 py-2.5",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"block font-semibold",children:[s.first_name," ",s.last_name]}),s.has_medical&&(0,t.jsxs)("span",{className:(0,f.cn)("block text-[0.7812rem] font-semibold",s.requires_alert?"text-critical":"text-caution"),children:[(0,t.jsx)(d.HeartPulse,{className:"mr-1 inline size-3.5 align-[-2px]","aria-hidden":!0}),s.requires_alert?"Medical alert":"Medical information"]}),s.routines&&(0,t.jsx)("span",{className:"block truncate text-[0.7812rem] text-ink-3",children:s.routines})]}),(0,t.jsx)("div",{role:"group","aria-label":`Mark ${s.first_name}`,className:"flex gap-1",children:j.map(([i,a])=>(0,t.jsx)("button",{"aria-pressed":s.status===i,onClick:()=>n.mutate({sql:h.MARK_REHEARSAL,params:[e.id,s.student_id,i]}),className:(0,f.cn)("h-11 min-w-[3.25rem] rounded-[var(--radius-md)] border px-2.5 text-[0.8125rem] font-semibold",s.status===i?"absent"===i?"border-critical bg-critical text-surface":"late"===i?"border-caution bg-caution text-surface":"border-positive bg-positive text-surface":"border-line-strong text-ink-2 hover:border-ink-3"),children:a},i))})]},s.student_id))})]})]})})}e.s(["BuyTickets",0,function({eventId:e}){let i=(0,c.useRows)(["ticket-types",e],h.TICKET_TYPES,[e]),n=(0,c.useRows)(["my-tickets"],h.MY_TICKETS),a=v(),[r,d]=s.useState({});if(!i.data?.length)return null;let l=(n.data??[]).filter(t=>t.event_id===e);return(0,t.jsxs)("div",{className:"space-y-2 border-t border-line pt-3",children:[(0,t.jsx)("p",{className:"font-semibold",children:"Tickets for family and friends"}),l.length>0&&(0,t.jsxs)("p",{className:"text-[0.875rem]",children:[(0,t.jsx)("span",{className:"font-semibold text-positive",children:"Booked:"})," ",l.map(e=>`${e.quantity} \xd7 ${e.name}`).join(", "),"."]}),i.data.map(e=>(0,t.jsxs)("div",{className:"flex items-center gap-2 text-[0.9062rem]",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[e.name," ",(0,t.jsx)("span",{className:"tnum font-semibold",children:(0,x.money)(e.price_minor)}),null!=e.left&&e.left<20?(0,t.jsx)("span",{className:"block text-[0.8125rem] font-semibold text-caution",children:0===e.left?"Sold out":`${e.left} left`}):null]}),(0,t.jsx)(p.Input,{"aria-label":`How many ${e.name} tickets`,type:"number",min:1,max:e.per_family_max,className:"h-10 w-16",value:r[e.id]??1,onChange:t=>d({...r,[e.id]:Number(t.target.value)})}),(0,t.jsx)(p.Button,{size:"sm",disabled:0===e.left,loading:a.isPending,onClick:()=>a.mutate({sql:h.BOOK_TICKETS,params:[e.id,r[e.id]??1]}),children:"Book"})]},e.id)),null!=a.error&&(0,t.jsx)(p.ErrorState,{error:a.error}),(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Added to your account, to pay with your next invoice."})]})},"CostumeSection",0,function({eventId:e,routines:i}){let n=(0,c.useRows)(["costumes",e],h.COSTUME_LIST,[e]),a=v(),[r,d]=s.useState({name:"",routine:"",price:""}),l=s.useMemo(()=>{let e=new Map;for(let t of n.data??[])e.set(t.item_id,{name:t.item,routine:t.routine,lines:[...e.get(t.item_id)?.lines??[],t]});return[...e.entries()]},[n.data]);return(0,t.jsxs)(_.DetailSection,{title:"Costumes",children:[null!=a.error&&(0,t.jsx)(p.ErrorState,{error:a.error}),l.map(([e,s])=>{let i=s.lines.filter(e=>e.size).length;return(0,t.jsxs)("details",{className:"border-b border-line",children:[(0,t.jsxs)("summary",{className:"flex min-h-[44px] cursor-pointer items-center gap-2 py-2 text-[0.875rem]",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("b",{className:"font-semibold",children:s.name}),s.routine?(0,t.jsxs)("span",{className:"text-ink-3",children:[" · ",s.routine]}):""]}),(0,t.jsxs)("span",{className:(0,f.cn)("text-[0.8125rem] tnum",i<s.lines.length?"font-semibold text-caution":"text-ink-3"),children:[i," of ",s.lines.length," sizes"]})]}),(0,t.jsx)("ul",{className:"divide-y divide-line border-t border-line pb-2 pl-3 text-[0.8438rem]",children:s.lines.map(i=>(0,t.jsxs)("li",{className:"flex items-center gap-2 py-1.5",children:[(0,t.jsx)("span",{className:"min-w-0 flex-1 truncate",children:i.dancer}),(0,t.jsx)("span",{className:(0,f.cn)("w-20 shrink-0",!i.size&&"text-ink-3"),children:i.size??"No size"}),(0,t.jsx)(p.Select,{"aria-label":`${s.name} for ${i.dancer}`,className:"h-8 w-32 text-[0.7812rem]",value:i.status,onChange:t=>a.mutate({sql:h.SET_COSTUME_STATUS,params:[e,i.student_id,t.target.value]}),children:b.map(([e,s])=>(0,t.jsx)("option",{value:e,children:s},e))})]},i.student_id))})]},e)}),(0,t.jsx)("p",{className:"mt-2 text-[0.8125rem] text-ink-3",children:"Families give sizes from their app. Status here is for the office."}),(0,t.jsxs)("div",{className:"mt-3 grid grid-cols-2 gap-2",children:[(0,t.jsx)(p.Input,{"aria-label":"Costume item",placeholder:"Item, e.g. Red waistcoat",value:r.name,onChange:e=>d({...r,name:e.target.value})}),(0,t.jsxs)(p.Select,{"aria-label":"For routine",value:r.routine,onChange:e=>d({...r,routine:e.target.value}),children:[(0,t.jsx)("option",{value:"",children:"Everyone in the show"}),i.map(e=>(0,t.jsx)("option",{value:e.id,children:e.title},e.id))]})]}),(0,t.jsx)(p.Button,{size:"sm",className:"mt-2",disabled:!r.name.trim(),onClick:()=>{a.mutate({sql:h.ADD_COSTUME,params:[e,r.routine||null,r.name,Math.round(100*Number(r.price||0))]}),d({name:"",routine:"",price:""})},children:"Add costume item"})]})},"MyCostumes",0,function({eventId:e}){let s=(0,c.useRows)(["my-costumes",e],h.MY_COSTUMES,[e]),i=v();return s.data?.length?(0,t.jsxs)("div",{className:"space-y-2 border-t border-line pt-3 text-[0.9062rem]",children:[(0,t.jsx)("p",{className:"font-semibold",children:"Costume sizes"}),s.data.map(e=>(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[e.first_name," · ",e.name,e.status&&"needed"!==e.status&&(0,t.jsxs)("span",{className:"text-ink-3",children:[" · ",b.find(t=>t[0]===e.status)?.[1]]})]}),(0,t.jsxs)(p.Select,{"aria-label":`${e.name} size for ${e.first_name}`,className:"h-10 w-36",value:e.size??"",onChange:t=>i.mutate({sql:h.SET_COSTUME_SIZE,params:[e.id,e.student_id,t.target.value||null]}),children:[(0,t.jsx)("option",{value:"",children:"Choose size…"}),e.sizes.map(e=>(0,t.jsx)("option",{value:e,children:e},e))]})]},e.id+e.student_id)),null!=i.error&&(0,t.jsx)(p.ErrorState,{error:i.error})]}):null},"ProgrammeButton",0,function({event:e}){let{session:s}=(0,u.useSession)(),i=async()=>{let t=await (0,m.readAs)(s,h.PROGRAMME,[e.id]),i=e=>e.replace(/[&<>"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[e]),n=window.open("","_blank");n&&(n.document.write(`<!doctype html><meta charset="utf-8"><title>${i(e.title)} — programme</title>
<style>body{font:15px/1.5 Georgia,serif;max-width:640px;margin:40px auto;padding:0 16px;color:#14211e}h1{font-weight:400;font-size:32px;margin:0}
.sub{color:#5b645e;margin-bottom:28px}ol{padding:0;list-style:none}li{border-top:1px solid #e4dbcc;padding:12px 0}
.n{display:inline-block;width:2em;color:#5b645e}.d{color:#4e5a55;font-size:14px;margin-left:2em}</style>
<h1>${i(e.title)}</h1><p class="sub">${i((0,x.dateLong)(e.starts_at))} \xb7 ${i((0,x.time)(e.starts_at))}${e.venue?" · "+i(e.venue):""}</p>
<ol>${t.map((e,t)=>`<li><span class="n">${t+1}.</span><b>${i(e.routine)}</b>${e.class_name?" — "+i(e.class_name):""}
<div class="d">${[e.dancers?i(e.dancers):"",e.unnamed?`${e.dancers?"and ":""}${e.unnamed} dancer${1===e.unnamed?"":"s"}`:""].filter(Boolean).join(" ")}</div></li>`).join("")}</ol>
<script>window.print()</script>`),n.document.close())};return(0,t.jsxs)(p.Button,{size:"sm",variant:"ghost",onClick:i,children:[(0,t.jsx)(l.Printer,{className:"size-4","aria-hidden":!0})," Print programme"]})},"RehearsalRegisterButton",0,function({rehearsal:e}){let[n,a]=s.useState(!1);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(p.Button,{size:"sm",variant:"ghost",onClick:()=>a(!0),"aria-label":`Register for ${e.title}`,children:[(0,t.jsx)(r.ClipboardCheck,{className:"size-4","aria-hidden":!0})," Register"]}),n&&(0,i.createPortal)((0,t.jsx)(y,{rehearsal:e,onClose:()=>a(!1)}),document.body)]})},"TicketSection",0,function({eventId:e}){let i=(0,c.useRows)(["ticket-types",e],h.TICKET_TYPES,[e]),n=v(),[a,r]=s.useState({name:"Adult",price:"",cap:"",max:"6"});return(0,t.jsxs)(_.DetailSection,{title:"Tickets",children:[null!=n.error&&(0,t.jsx)(p.ErrorState,{error:n.error}),(0,t.jsx)("ul",{className:"divide-y divide-line text-[0.875rem]",children:i.data?.map(e=>(0,t.jsxs)("li",{className:"flex min-h-[40px] items-center gap-2 py-1.5",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"font-semibold",children:e.name})," ",(0,t.jsx)("span",{className:"text-ink-3 tnum",children:(0,x.money)(e.price_minor)})]}),(0,t.jsxs)("span",{className:"tnum text-[0.8125rem] text-ink-2",children:[e.sold," sold",null!=e.left?` \xb7 ${e.left} left`:""]})]},e.id))}),(0,t.jsxs)("div",{className:"mt-3 grid grid-cols-4 gap-2",children:[(0,t.jsx)(p.Input,{"aria-label":"Ticket name",className:"col-span-2",value:a.name,onChange:e=>r({...a,name:e.target.value})}),(0,t.jsx)(p.Input,{"aria-label":"Price in pounds",type:"number",min:0,step:.5,placeholder:"£",value:a.price,onChange:e=>r({...a,price:e.target.value})}),(0,t.jsx)(p.Input,{"aria-label":"Seats",type:"number",min:1,placeholder:"Seats",value:a.cap,onChange:e=>r({...a,cap:e.target.value})})]}),(0,t.jsx)(p.Button,{size:"sm",className:"mt-2",disabled:!a.name.trim()||""===a.price,onClick:()=>{n.mutate({sql:h.ADD_TICKET_TYPE,params:[e,a.name,Math.round(100*Number(a.price)),a.cap?Number(a.cap):null,Number(a.max)||6]}),r({name:"Child",price:"",cap:"",max:"6"})},children:"Add ticket type"}),(0,t.jsx)("p",{className:"mt-2 text-[0.8125rem] text-ink-3",children:"Families book from their Events page; tickets go on their account until card payment is switched on."})]})}])},84315,e=>{"use strict";let t=`
select e.id, e.kind::text as kind, e.status::text as status, e.title, e.description, e.starts_at, e.ends_at, e.venue,
       e.cost_minor, e.capacity, e.entries_close_on, e.requests_open,
       count(p.*) filter (where p.status = 'invited')::int as invited,
       count(p.*) filter (where p.status = 'confirmed')::int as confirmed,
       count(p.*) filter (where p.status = 'requested')::int as requested,
       count(p.*) filter (where p.status = 'declined')::int as declined,
       (select count(distinct ii.student_id)::int from invoice_item ii where ii.event_id = e.id and ii.deleted_at is null) as billed
  from studio_event e left join event_participant p on p.event_id = e.id and p.deleted_at is null
 where e.deleted_at is null and e.parent_event_id is null and e.kind <> 'private_lesson'
 group by e.id order by (e.starts_at < now()), e.starts_at`,s=`
insert into studio_event (studio_id, kind, status, title, description, starts_at, ends_at, venue, cost_minor, capacity, entries_close_on, requests_open, created_by)
select m.studio_id, $1::event_kind, $2::event_status, btrim($3), nullif(btrim($4), ''), $5::timestamptz, $6::timestamptz, nullif(btrim($7), ''),
       $8, $9, $10::date, $11, auth.uid()
  from membership m where m.user_id = auth.uid() and m.role in ('owner','admin') and m.deleted_at is null limit 1 returning id`,i=`
update studio_event set kind = $2::event_kind, status = $3::event_status, title = btrim($4), description = nullif(btrim($5), ''),
       starts_at = $6::timestamptz, ends_at = $7::timestamptz, venue = nullif(btrim($8), ''), cost_minor = $9, capacity = $10,
       entries_close_on = $11::date, requests_open = $12, updated_at = now() where id = $1 returning id`,n=`
select p.id, p.status::text as status, s.first_name || ' ' || s.last_name as student, c.name as class_name
  from event_participant p join student s on s.id = p.student_id left join class c on c.id = p.invited_class_id
 where p.event_id = $1 and p.deleted_at is null order by p.status, s.first_name`,a=`select r.id, r.title, r.position, r.costume, r.music, c.name as class_name, r.class_id
  from event_routine r left join class c on c.id = r.class_id where r.event_id = $1 and r.deleted_at is null order by r.position, r.title`,r=`insert into event_routine (event_id, class_id, title, costume, position)
  select $1, $2, btrim($3), nullif(btrim($4), ''), coalesce((select max(position) + 1 from event_routine where event_id = $1 and deleted_at is null), 1) returning id`,d=`
with me as (select id, event_id, position from event_routine where id = $1),
     other as (select r.id, r.position from event_routine r, me where r.event_id = me.event_id and r.deleted_at is null and r.id <> me.id
                 and case when $2 < 0 then r.position < me.position else r.position > me.position end
               order by case when $2 < 0 then -r.position else r.position end limit 1)
update event_routine r set position = case when r.id = (select id from me) then (select position from other) else (select position from me) end
 where r.id in ((select id from me), (select id from other)) returning r.id`,l=`insert into studio_event (studio_id, kind, title, starts_at, ends_at, venue, parent_event_id, requests_open, created_by)
  select studio_id, 'rehearsal', btrim($2), $3::timestamptz, $4::timestamptz, nullif(btrim($5), ''), id, false, auth.uid() from studio_event where id = $1 returning id`,o=`
insert into costume_order (item_id, student_id, status) values ($1, $2, $3)
on conflict (item_id, student_id) do update set status = excluded.status, updated_at = now() returning item_id`,c=`
select t.id, t.name, t.price_minor, t.capacity, t.per_family_max, app.tickets_left(t.id) as left,
       coalesce((select sum(quantity) from ticket_booking b where b.ticket_type_id = t.id and b.status = 'booked'), 0)::int as sold
  from ticket_type t where t.event_id = $1 and t.deleted_at is null order by t.price_minor desc, t.name`,m=`
select x.id, x.board, x.title, x.exam_on, x.venue, x.entries_close_on,
       count(e.*) filter (where e.status <> 'withdrawn')::int as entries,
       count(e.*) filter (where e.result is not null)::int as results,
       count(e.*) filter (where e.status <> 'withdrawn' and e.invoice_id is null and e.fee_minor > 0)::int as unbilled
  from exam_session x left join exam_entry e on e.session_id = x.id
 where x.deleted_at is null group by x.id order by (x.exam_on < current_date), x.exam_on`,u=`
insert into exam_session (studio_id, board, title, exam_on, venue, entries_close_on)
select m.studio_id, btrim($1), btrim($2), $3::date, nullif(btrim($4), ''), $5::date
  from membership m where m.user_id = auth.uid() and m.role in ('owner','admin') and m.deleted_at is null and app.in_scope(m.studio_id) limit 1 returning id`,_=`e.id, e.session_id, e.student_id, s.first_name || ' ' || s.last_name as student, e.grade, e.fee_minor, e.status, e.result, e.mark,
       x.board, x.title as exam_title, x.exam_on`,p=`
select ${_} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.session_id = $1 order by e.grade, s.first_name`,h=`
select ${_} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.student_id = $1 and e.status <> 'withdrawn' order by x.exam_on desc`,x=`
select ${_} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.status <> 'withdrawn' order by x.exam_on desc`,f=`
select i.id, i.name, i.sizes, s.id as student_id, s.first_name, o.size, o.status
  from costume_item i
  join student s on s.id in (select rd.student_id from routine_dancer rd where rd.routine_id = i.routine_id
                             union select p.student_id from event_participant p where i.routine_id is null and p.event_id = i.event_id
                                     and p.status = 'confirmed' and p.deleted_at is null)
  left join costume_order o on o.item_id = i.id and o.student_id = s.id
 where i.event_id = $1 and i.deleted_at is null and s.deleted_at is null
 order by i.name, s.first_name`,v=`insert into event_helper_slot (studio_id, event_id, role, starts_at, needed)
  select studio_id, id, btrim($2), $3::timestamptz, $4 from studio_event where id = $1 returning id`;e.s(["ADD_CHAPERONE",0,"insert into event_chaperone (event_id, name, phone, role, checked) values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), $5) returning id","ADD_COSTUME",0,"insert into costume_item (event_id, routine_id, name, price_minor) values ($1, $2, btrim($3), $4) returning id","ADD_EXAM_SESSION",0,u,"ADD_HELPER_SLOT",0,v,"ADD_REHEARSAL",0,l,"ADD_ROUTINE",0,r,"ADD_TICKET_TYPE",0,"insert into ticket_type (event_id, name, price_minor, capacity, per_family_max) values ($1, btrim($2), $3, $4, $5) returning id","BILL_EVENT",0,"select app.bill_event($1) as n","BILL_EXAM",0,"select app.bill_exam($1) as n","BOOK_TICKETS",0,"select app.book_tickets($1, $2) as id","CHAPERONES",0,"select id, name, phone, role, checked from event_chaperone where event_id = $1 and deleted_at is null order by name","COSTUME_LIST",0,"select * from app.costume_list($1)","CREATE_EVENT",0,s,"ENTER_EXAM",0,"select app.enter_exam($1, $2, $3, $4) as id","EVENTS",0,t,"EXAM_ENTRIES",0,p,"EXAM_RESULT",0,"select app.exam_result($1, $2, $3)","EXAM_SESSIONS",0,m,"HELPER_SLOTS",0,"select * from app.helper_slots($1)","INVITE_CLASSES",0,"select app.invite_classes($1, $2::uuid[]) as n","LOG_PRACTICE",0,"select app.log_practice($1, $2, $3) as id","MARK_REHEARSAL",0,"select app.mark_rehearsal($1, $2, $3::attendance_status)","MOVE_ROUTINE",0,d,"MY_COSTUMES",0,f,"MY_EXAMS",0,x,"MY_PRACTICE",0,"select id, practised_on, minutes, what from practice_log where student_id = $1 order by practised_on desc, created_at desc limit 10","MY_TICKETS",0,"select b.id, t.event_id, t.name, b.quantity from ticket_booking b join ticket_type t on t.id = b.ticket_type_id where b.status = 'booked'","PARTICIPANTS",0,n,"PRACTICE_WEEKLY",0,"select * from app.practice_weekly($1)","PROGRAMME",0,"select * from app.event_programme($1)","REHEARSALS",0,"select id, title, starts_at, ends_at, venue from studio_event where parent_event_id = $1 and deleted_at is null order by starts_at","REHEARSAL_REGISTER",0,"select * from app.rehearsal_register($1)","REMOVE_CHAPERONE",0,"delete from event_chaperone where id = $1","REMOVE_HELPER_SLOT",0,"update event_helper_slot set deleted_at = now() where id = $1 returning id","REMOVE_ROUTINE",0,"delete from event_routine where id = $1","RESULTS",0,[["distinction","Distinction"],["merit","Merit"],["pass","Pass"],["highly_commended","Highly commended"],["commended","Commended"],["not_yet","Not yet"]],"ROUTINES",0,a,"SEND_EVENT_NOTICE",0,"select app.send_event_notice($1, $2, $3) as n","SET_COSTUME_SIZE",0,"select app.set_costume_size($1, $2, $3)","SET_COSTUME_STATUS",0,o,"SET_PARTICIPANT",0,"update event_participant set status = $2::participant_status, decided_by = auth.uid(), decided_at = now() where id = $1 returning id","STUDENT_EXAMS",0,h,"STUDENT_PICK",0,"select id, first_name || ' ' || last_name as name from student where deleted_at is null order by first_name, last_name","TICKET_TYPES",0,c,"UPCOMING_EXAMS",0,"select id, board, title, exam_on from exam_session where deleted_at is null and exam_on >= current_date order by exam_on","UPDATE_EVENT",0,i])},27389,e=>{"use strict";let t=`
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
 order by ev.starts_at`,n=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,a=`
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`,r=`
insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
select s.studio_id, s.family_id, s.id, $2::request_kind, $3, $4, auth.uid()
  from student s where s.id = $1
returning id`,d=`
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
returning id, status`,u=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,_=`
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
returning id, studio_id`,x=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,f=`
select app.retire_resource($1) as ok`,v=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,u,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,x,"CLASS_DETAIL",0,_,"CLASS_RESOURCES",0,p,"CREATE_RESOURCE",0,h,"DECIDE_ENTRY",0,m,"DELETE_RESOURCE",0,f,"EVENTS",0,i,"MY_REQUESTS",0,a,"MY_TEACHING_CLASSES",0,v,"MY_TIMETABLE",0,d,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,o,"RAISE_REQUEST",0,r,"REQUEST_PLACE",0,n,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,l])}]);