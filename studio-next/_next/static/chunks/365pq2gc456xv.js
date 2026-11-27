(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,71689,e=>{"use strict";let s=(0,e.i(75254).default)("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);e.s(["ArrowLeft",0,s],71689)},64659,e=>{"use strict";let s=(0,e.i(75254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["ChevronDown",0,s],64659)},7233,e=>{"use strict";let s=(0,e.i(75254).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,s],7233)},49381,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(22016),i=e.i(18566),n=e.i(54616),r=e.i(12598),l=e.i(71689),d=e.i(43531),o=e.i(64659),c=e.i(7233),_=e.i(37727),u=e.i(77326),m=e.i(43805),h=e.i(13927),f=e.i(30224),p=e.i(31502),b=e.i(17658),g=e.i(36261),w=e.i(27389),k=e.i(75379),x=e.i(45060);let j=e=>({going_well:e.going_well_chips??[],work_on:e.work_on_chips??[],note:e.note??"",work_on_note:e.work_on_note??"",resource:e.work_on_resource_id??null,skills:{}}),v=(e,s)=>e.going_well.join("|")===s.going_well.join("|")&&e.work_on.join("|")===s.work_on.join("|")&&e.note.trim()===s.note.trim()&&e.work_on_note.trim()===s.work_on_note.trim()&&e.resource===s.resource&&0===Object.keys(e.skills).length&&0===Object.keys(s.skills).length;function S(){let e=(0,i.useSearchParams)().get("session")??"",{session:c}=(0,p.useSession)(),S=(0,r.useQueryClient)(),N=(0,h.useRows)(["session-meta",e],"select cs.id, cs.class_id, c.name, cs.starts_at from class_session cs join class c on c.id = cs.class_id where cs.id = $1",[e],{enabled:!!e}),C=N.data?.[0],L=C?.class_id??"",A=(0,h.useRows)(["session-feedback",e],g.SESSION_FEEDBACK,[e],{enabled:!!e}),R=(0,h.useRows)(["class-chips",L],g.CLASS_CHIPS,[L],{enabled:!!L}),T=(0,h.useRows)(["class-depth",L],g.CLASS_DEPTH,[L],{enabled:!!L}),I=(0,h.useRows)(["previous-chips",e],g.PREVIOUS_SESSION_CHIPS,[e],{enabled:!!e}),D=(0,h.useRows)(["class-resources",L],w.CLASS_RESOURCES,[L],{enabled:!!L}),P=T.data?.[0]?.depth??"full",[O,H]=t.useState({}),[K,z]=t.useState(null),[M,F]=t.useState(new Set),[U,B]=t.useState(null),q=(A.data??[]).filter(e=>"absent"!==e.status&&"excused"!==e.status),G=new Map(q.map(e=>[e.student_id,e])),V=e=>O[e]??(G.get(e)?j(G.get(e)):j({})),Q=Object.entries(O).filter(([e,s])=>G.get(e)&&!v(s,j(G.get(e)))),Y=(e,s)=>H(t=>({...t,[e]:s(t[e]??V(e))})),W=(I.data??[]).filter(e=>G.has(e.student_id)&&(e.going_well_chips?.length??0)+(e.work_on_chips?.length??0)>0),X=(0,n.useMutation)({mutationFn:async s=>{let t=Q.map(([e,s])=>({student_id:e,going_well:s.going_well,work_on:s.work_on,note:s.note,work_on_note:s.work_on_note,work_on_resource_id:s.resource,replace:!0,skills:Object.entries(s.skills).map(([e,s])=>({skill_id:e,level:s}))})),a=Q.filter(([e])=>G.get(e)?.shared).length;return(0,f.runAs)(c,async i=>{let[n]=await i(g.SAVE_CLASS_FEEDBACK,[e,JSON.stringify(t),!1]);return s&&await i(g.SHARE_SESSION_FEEDBACK,[e]),{n:n?.n??0,share:s,edits:a}})},onSuccess:async({n:s,share:t,edits:a})=>{S.setQueriesData({predicate:s=>s.queryKey.includes("session-feedback")&&s.queryKey.includes(e)},e=>e?.map(e=>{let s=O[e.student_id],a=s?s.going_well.length||s.work_on.length||s.note.trim()||s.work_on_note.trim():e.going_well||e.work_on,i=s?{...e,going_well_chips:s.going_well,work_on_chips:s.work_on,note:s.note,work_on_note:s.work_on_note,work_on_resource_id:s.resource,going_well:a?e.going_well??"…":null,work_on:s.work_on.length||s.work_on_note?e.work_on??"…":null}:e;return t&&a?{...i,shared:!0}:i})),H({}),z(null),F(new Set),B(t?"Families can see it now, and have been told.":a&&a===s?"Saved. Families see the change, marked as edited.":`${s-a} draft${s-a==1?"":"s"} saved. Nothing new is shared yet.${a?` ${a} shared note${1===a?"":"s"} updated, marked as edited.`:""}`),await S.invalidateQueries({queryKey:["db"]})}}),J=(A.data??[]).filter(e=>G.has(e.student_id)&&(e.going_well||e.work_on)).length,Z=(A.data??[]).filter(e=>G.has(e.student_id)&&e.shared).length,ee=(A.data??[]).filter(e=>(e.going_well||e.work_on)&&!e.shared).length,es=q.length>0&&q.every(e=>M.has(e.student_id)),et=e=>(R.data??[]).filter(s=>s.kind===e);return(0,s.jsx)(u.Shell,{title:C?C.name:"Class feedback",subtitle:C?`Feedback \xb7 ${(0,k.dateLong)(C.starts_at)} \xb7 ${(0,k.time)(C.starts_at)}`:void 0,allow:["owner","admin","teacher"],actions:(0,s.jsx)(a.default,{href:`/teach/register/?session=${e}`,"aria-label":"Back to the register",className:"grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-2",children:(0,s.jsx)(l.ArrowLeft,{className:"size-5","aria-hidden":!0})}),children:(0,s.jsxs)("div",{className:"mx-auto max-w-2xl space-y-6",children:[U&&(0,s.jsx)("div",{role:"status",children:(0,s.jsx)(b.Notice,{word:U.startsWith("Families can")?"Shared":"Saved",tone:"positive",title:U})}),null!=X.error&&(0,s.jsx)(b.ErrorState,{error:X.error}),A.isLoading&&(0,s.jsx)(b.Skeleton,{className:"h-40"}),A.data&&0===q.length&&(0,s.jsx)(b.EmptyState,{title:"Nobody to give feedback to",body:"Take the register first. Feedback is for the children who were there.",action:(0,s.jsx)(a.default,{href:`/teach/register/?session=${e}`,children:(0,s.jsx)(b.Button,{tabIndex:-1,children:"Open register"})})}),q.length>0&&(0,s.jsxs)("section",{"aria-labelledby":"fb-h",children:[(0,s.jsxs)("div",{className:"mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-ink pb-2",children:[(0,s.jsx)("h2",{id:"fb-h",className:"section-title flex-1",children:"Tap a child, or select several"}),(0,s.jsxs)("span",{className:"tnum text-[0.8125rem] text-ink-3",children:[J," of ",q.length," done",Z?` \xb7 ${Z} shared`:""]}),(0,s.jsx)(b.Beats,{value:J,max:q.length,label:`${J} of ${q.length} have feedback`})]}),(0,s.jsxs)("div",{className:"flex flex-wrap items-center gap-2 py-3",children:[(0,s.jsx)(b.Button,{size:"sm","aria-pressed":es,onClick:()=>F(es?new Set:new Set(q.map(e=>e.student_id))),children:es?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(_.X,{className:"size-4","aria-hidden":!0})," Clear selection"]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(d.Check,{className:"size-4","aria-hidden":!0})," Select all ",q.length]})}),W.length>0&&(0,s.jsx)(b.Button,{size:"sm",onClick:()=>H(e=>{let s={...e};return W.forEach(e=>{let t=s[e.student_id]??V(e.student_id);s[e.student_id]={...t,going_well:[...t.going_well,...(e.going_well_chips??[]).filter(e=>!t.going_well.includes(e))],work_on:[...t.work_on,...(e.work_on_chips??[]).filter(e=>!t.work_on.includes(e))]}}),s}),children:"Same as last week"}),W.length>0&&(0,s.jsxs)("span",{className:"text-[0.8125rem] text-ink-3",children:[W.length," had phrases on ",(0,k.dateShort)(I.data[0].starts_at)]})]}),M.size>0&&(0,s.jsxs)("div",{className:"space-y-3 border-y border-line bg-surface-2/50 px-3 py-3",role:"region","aria-label":"Phrases for the selected children",children:[(0,s.jsxs)("p",{className:"text-[0.875rem] font-semibold",children:["For ",M.size===q.length?`all ${M.size}`:`${M.size} selected`]}),["going_well","work_on"].map(e=>(0,s.jsx)(y,{kind:e,chips:et(e),on:s=>[...M].every(t=>V(t)[e].includes(s)),onTap:s=>{let t,a;return a=(t=[...M]).every(t=>V(t)[e].includes(s)),void H(i=>{let n={...i};return t.forEach(t=>{let i=n[t]??V(t);n[t]={...i,[e]:a?i[e].filter(e=>e!==s):i[e].includes(s)?i[e]:[...i[e],s]}}),n})}},e))]}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:q.map(t=>{let a=V(t.student_id),i=K===t.student_id,n=O[t.student_id]&&!v(O[t.student_id],j(t))?["Not saved yet","text-accent-text font-semibold"]:t.shared?[t.edited_at?"Shared · edited":"Shared","text-positive font-semibold"]:t.going_well||t.work_on?["Draft","text-ink-2"]:null,r=[...a.going_well,...a.work_on].join(", ");return(0,s.jsxs)("li",{className:"flex items-start gap-1",children:[(0,s.jsx)("label",{className:"grid min-h-14 w-11 shrink-0 cursor-pointer place-items-center",children:(0,s.jsx)("input",{type:"checkbox",className:"size-5 accent-[var(--color-accent)]",checked:M.has(t.student_id),"aria-label":`Select ${t.first_name} ${t.last_name}`,onChange:()=>F(e=>{let s=new Set(e);return s.has(t.student_id)?s.delete(t.student_id):s.add(t.student_id),s})})}),(0,s.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("button",{className:"flex min-h-14 w-full items-center gap-3 py-3 text-left hover:bg-surface-2/60","aria-expanded":i,onClick:()=>z(i?null:t.student_id),children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("span",{className:"block text-[1rem] font-semibold",children:[t.first_name," ",t.last_name,t.visiting&&(0,s.jsx)("span",{className:"ml-2 rounded-[var(--radius-sm)] bg-peach-soft px-1.5 py-px text-[0.75rem] font-semibold text-ink",children:"trial"===t.visiting?"Trial":"Drop-in"})]}),r&&!i&&(0,s.jsx)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:r})]}),n&&(0,s.jsx)("span",{className:(0,x.cn)("text-[0.8125rem]",n[1]),children:n[0]}),(0,s.jsx)(o.ChevronDown,{className:(0,x.cn)("size-4 shrink-0 text-ink-3 transition-transform",i&&"rotate-180"),"aria-hidden":!0})]}),i&&(0,s.jsxs)("div",{className:"space-y-4 pb-5 pr-1",children:[(0,s.jsx)(m.LastFeedback,{studentId:t.student_id,exceptSession:e,name:t.first_name}),["going_well","work_on"].map(e=>(0,s.jsx)(y,{kind:e,chips:et(e),on:s=>a[e].includes(s),onTap:s=>{let a;return a=t.student_id,Y(a,t=>({...t,[e]:t[e].includes(s)?t[e].filter(e=>e!==s):[...t[e],s]}))}},e)),(0,s.jsx)(b.Input,{"aria-label":`Going well, in your words, for ${t.first_name}`,placeholder:"Going well, in your words (optional)",value:a.note,onChange:e=>Y(t.student_id,s=>({...s,note:e.target.value}))}),(0,s.jsx)(b.Input,{"aria-label":`To work on, in your words, for ${t.first_name}`,placeholder:"To work on, in your words (optional)",value:a.work_on_note,onChange:e=>Y(t.student_id,s=>({...s,work_on_note:e.target.value}))}),!!D.data?.length&&(0,s.jsxs)("select",{"aria-label":`Class material for ${t.first_name} to practise with`,value:a.resource??"",onChange:e=>Y(t.student_id,s=>({...s,resource:e.target.value||null})),className:"h-10 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-[0.875rem]",children:[(0,s.jsx)("option",{value:"",children:"Link “to work on” to class material (optional)"}),D.data.map(e=>(0,s.jsx)("option",{value:e.id,children:e.title},e.id))]}),"notes"!==P&&(0,s.jsx)(E,{studentId:t.student_id,value:a.skills,onChange:e=>Y(t.student_id,s=>({...s,skills:e}))}),t.shared&&(0,s.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Already shared. If you change it, the family sees it marked as edited."})]})]})]},t.student_id)})})]}),q.length>0&&(0,s.jsxs)("div",{className:"space-y-2 border-t border-line pt-4",children:[(0,s.jsxs)("div",{className:"flex flex-col-reverse gap-2 sm:flex-row",children:[(0,s.jsxs)(b.Button,{className:"sm:flex-1",size:"lg",disabled:!Q.length,loading:X.isPending&&!1===X.variables,onClick:()=>X.mutate(!1),children:["Save ",Q.length||""," draft",1===Q.length?"":"s"]}),(0,s.jsx)(b.Button,{className:"sm:flex-1",size:"lg",variant:"primary",disabled:!Q.length&&!ee,loading:X.isPending&&!0===X.variables,onClick:()=>X.mutate(!0),children:"Share with families"})]}),(0,s.jsxs)("p",{className:"text-[0.8125rem] text-ink-3",children:["Nothing reaches a family until you share.",ee?` ${ee} saved draft${1===ee?"":"s"} waiting.`:""]})]}),L&&(0,s.jsx)($,{classId:L,chips:R.data??[],depthRow:T.data?.[0]})]})})}function y({kind:e,chips:t,on:a,onTap:i}){return(0,s.jsxs)("div",{role:"group","aria-label":"going_well"===e?"Going well":"To work on",children:[(0,s.jsx)("p",{className:"mb-1.5 text-[0.8125rem] font-semibold text-ink-2",children:"going_well"===e?"Going well":"To work on"}),(0,s.jsx)("div",{className:"flex flex-wrap gap-2",children:t.map(e=>{let t=a(e.label);return(0,s.jsxs)("button",{"aria-pressed":t,onClick:()=>i(e.label),className:(0,x.cn)("inline-flex min-h-10 items-center rounded-full border px-3.5 text-[0.875rem] font-medium",t?"border-ink bg-ink text-surface":"border-line-strong bg-surface text-ink hover:bg-surface-2"),children:[t&&(0,s.jsx)(d.Check,{className:"mr-1 size-3.5","aria-hidden":!0}),e.sticker&&(0,s.jsx)("span",{"aria-hidden":!0,className:"mr-1.5",children:e.sticker}),e.label]},e.id)})})]})}function E({studentId:e,value:a,onChange:i}){let n=(0,h.useRows)(["skills",e],g.STUDENT_SKILLS,[e]),[r,l]=t.useState("");if(!n.data?.length)return null;let d=n.data.find(e=>e.skill_id===r);return(0,s.jsxs)("div",{className:"flex flex-wrap items-center gap-2 text-sm",children:[(0,s.jsxs)("select",{"aria-label":"Skill",value:r,onChange:e=>l(e.target.value),className:"h-10 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-[0.875rem]",children:[(0,s.jsx)("option",{value:"",children:"Move a skill on…"}),n.data.map(e=>(0,s.jsxs)("option",{value:e.skill_id,children:[e.skill,e.level?` (${g.LEVELS.find(s=>s.key===e.level)?.label})`:""]},e.skill_id))]}),d&&g.LEVELS.slice(1).map(e=>(0,s.jsx)("button",{"aria-pressed":a[d.skill_id]===e.key,onClick:()=>i({...a,[d.skill_id]:e.key}),className:(0,x.cn)("inline-flex min-h-10 items-center rounded-full border px-3.5 text-[0.875rem] font-medium",a[d.skill_id]===e.key?"border-ink bg-ink text-surface":"border-line-strong bg-surface"),children:e.label},e.key))]})}function $({classId:e,chips:a,depthRow:i}){let{session:l}=(0,p.useSession)(),d=(0,r.useQueryClient)(),u=(0,n.useMutation)({mutationFn:e=>(0,f.runAs)(l,s=>s(e.sql,e.params)),onSuccess:()=>d.invalidateQueries({queryKey:["db"]})}),[m,h]=t.useState({going_well:"",work_on:""}),w=a.some(e=>e.own),k=i&&(null!=i.age_min||null!=i.age_max)?`ages ${i.age_min??""}–${i.age_max??""}`:"this class";return(0,s.jsxs)("details",{className:"group border-t border-line pt-2",children:[(0,s.jsxs)("summary",{className:"flex min-h-11 cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden",children:[(0,s.jsx)("span",{className:"section-title flex-1",children:"Phrases and tracking for this class"}),(0,s.jsx)(o.ChevronDown,{className:"size-4 text-ink-3 transition-transform group-open:rotate-180","aria-hidden":!0})]}),(0,s.jsxs)("div",{className:"space-y-6 pb-4 pt-2",children:[null!=u.error&&(0,s.jsx)(b.ErrorState,{error:u.error}),(0,s.jsxs)("fieldset",{children:[(0,s.jsx)("legend",{className:"mb-1 text-[0.875rem] font-semibold",children:"How much to track"}),(0,s.jsxs)("p",{className:"mb-2 text-[0.8125rem] text-ink-3",children:["The default for ",k," is ",g.DEPTHS.find(e=>e.key===i?.default_depth)?.label.toLowerCase(),"."]}),(0,s.jsx)("div",{className:"space-y-1",children:g.DEPTHS.map(t=>(0,s.jsxs)("label",{className:"flex min-h-11 cursor-pointer items-start gap-3 py-1",children:[(0,s.jsx)("input",{type:"radio",name:"depth",className:"mt-1 size-4 accent-[var(--color-accent)]",checked:i?.depth===t.key,onChange:()=>u.mutate({sql:g.SET_CLASS_DEPTH,params:[e,t.key===i?.default_depth?null:t.key]})}),(0,s.jsxs)("span",{children:[(0,s.jsx)("span",{className:"block text-[0.9375rem] font-medium",children:t.label}),(0,s.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:t.hint})]})]},t.key))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("p",{className:"text-[0.875rem] font-semibold",children:"Phrases"}),(0,s.jsx)("p",{className:"mb-2 text-[0.8125rem] text-ink-3",children:w?"Your own set for this class.":"The school’s set for this age. Change one and the class gets its own copy."}),["going_well","work_on"].map(t=>(0,s.jsxs)("div",{className:"mb-3",children:[(0,s.jsx)("p",{className:"mb-1.5 text-[0.8125rem] font-semibold text-ink-2",children:"going_well"===t?"Going well":"To work on"}),(0,s.jsx)("div",{className:"flex flex-wrap gap-1.5",children:a.filter(e=>e.kind===t).map(a=>(0,s.jsxs)("span",{className:"inline-flex items-center gap-0.5 rounded-[var(--radius-md)] border border-line-strong bg-surface py-0.5 pl-2.5 pr-0.5 text-[0.875rem]",children:[a.sticker&&(0,s.jsx)("span",{"aria-hidden":!0,className:"mr-1",children:a.sticker}),a.label,(0,s.jsx)("button",{"aria-label":`Remove ${a.label}`,onClick:()=>u.mutate({sql:g.REMOVE_CLASS_CHIP,params:[e,t,a.label]}),className:"grid size-9 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical",children:(0,s.jsx)(_.X,{className:"size-3.5","aria-hidden":!0})})]},a.id))}),(0,s.jsxs)("form",{className:"mt-2 flex gap-1.5",onSubmit:s=>{s.preventDefault();let a=m[t].trim();a.length>=2&&(u.mutate({sql:g.ADD_CLASS_CHIP,params:[e,t,a,null]}),h(e=>({...e,[t]:""})))},children:[(0,s.jsx)(b.Input,{"aria-label":`Add a ${"going_well"===t?"going well":"to work on"} phrase for this class`,placeholder:"Add a phrase",maxLength:40,value:m[t],onChange:e=>h(s=>({...s,[t]:e.target.value})),className:"h-10 text-[0.875rem]"}),(0,s.jsx)(b.Button,{type:"submit","aria-label":"Add",children:(0,s.jsx)(c.Plus,{className:"size-4","aria-hidden":!0})})]})]},t)),w&&(0,s.jsx)(b.Button,{size:"sm",variant:"ghost",onClick:()=>u.mutate({sql:g.RESET_CLASS_CHIPS,params:[e]}),children:"Go back to the school’s phrases"})]})]})]})}e.s(["default",0,function(){return(0,s.jsx)(t.Suspense,{fallback:(0,s.jsx)("div",{className:"min-h-dvh"}),children:(0,s.jsx)(S,{})})}])},48848,e=>{e.v(s=>Promise.all(["static/chunks/3e350uomau313.js"].map(s=>e.l(s))).then(()=>s(39726)))},43805,e=>{"use strict";var s=e.i(43476),t=e.i(64659),a=e.i(13927),i=e.i(36261),n=e.i(75379);e.s(["LastFeedback",0,function({studentId:e,exceptSession:r,name:l,empty:d}){let o=(0,a.useRows)(["last-feedback",e,r??""],i.LAST_FEEDBACK,[e,r??null]),c=o.data?.[0];return c?(0,s.jsxs)("details",{className:"group border-l-2 border-line-strong pl-3",children:[(0,s.jsxs)("summary",{className:"flex min-h-11 cursor-pointer list-none items-center gap-2 text-[0.875rem] [&::-webkit-details-marker]:hidden",children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("span",{className:"block text-[0.8125rem] text-ink-3",children:["Last feedback",l?(0,s.jsxs)("span",{className:"sr-only",children:[" for ",l]}):null," · ",(0,n.relativeDay)(c.at),c.class_name?` \xb7 ${c.class_name}`:""]}),c.work_on?(0,s.jsxs)("span",{className:"block truncate",children:[(0,s.jsx)("span",{className:"font-semibold",children:"To work on:"})," ",c.work_on]}):(0,s.jsx)("span",{className:"block truncate text-ink-2",children:c.going_well})]}),(0,s.jsx)(t.ChevronDown,{className:"size-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180","aria-hidden":!0})]}),(0,s.jsxs)("div",{className:"space-y-1 pb-2 text-[0.875rem]",children:[c.going_well&&(0,s.jsxs)("p",{children:[(0,s.jsx)("span",{className:"font-semibold",children:"Going well:"})," ",c.going_well]}),c.work_on&&(0,s.jsxs)("p",{children:[(0,s.jsx)("span",{className:"font-semibold",children:"To work on:"})," ",c.work_on,c.resource_title?` \xb7 ${c.resource_title}`:""]}),(0,s.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:c.shared?"Shared with the family":"Draft, not shared yet"})]})]}):d&&o.data?(0,s.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:d}):null}])},56166,e=>{e.v(s=>Promise.all(["static/chunks/1sfki9bryb301.js"].map(s=>e.l(s))).then(()=>s(52715)))},27389,e=>{"use strict";let s=`
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
 order by r.kind, r.category nulls last, r.title`,t=`
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
 order by f.shared_at desc`,a=`
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
 order by ev.starts_at`,i=`
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
 order by r.created_at desc`,r=`
insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
select s.studio_id, s.family_id, s.id, $2::request_kind, $3, $4, auth.uid()
  from student s where s.id = $1
returning id`,l=`
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
 order by starts_at`,d=`
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
 order by ev.starts_at`,_=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,u=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,m=`
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
 where c.id = $1 and c.deleted_at is null`,h=`
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
 order by (a.id is null), r.kind, r.created_at desc`,f=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,p=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,b=`
select app.retire_resource($1) as ok`,g=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,u,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,p,"CLASS_DETAIL",0,m,"CLASS_RESOURCES",0,h,"CREATE_RESOURCE",0,f,"DECIDE_ENTRY",0,_,"DELETE_RESOURCE",0,b,"EVENTS",0,a,"MY_REQUESTS",0,n,"MY_TEACHING_CLASSES",0,g,"MY_TIMETABLE",0,l,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,o,"RAISE_REQUEST",0,r,"REQUEST_PLACE",0,i,"RESOURCES",0,s,"STUDENT_FEEDBACK",0,t,"WRITE_FEEDBACK",0,d])},36261,e=>{"use strict";let s=`select id, kind, label, position, band, sticker from feedback_chip where class_id is null
                       order by band, kind, position, label`,t=`
insert into feedback_chip (studio_id, kind, label, position)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'standard'), 1)
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,a=`
insert into feedback_chip (studio_id, kind, label, position, band, sticker)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'under_8'), 1),
       'under_8', nullif(btrim($3), '')
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,i=`select c.id, c.tracking_depth, app.class_depth(c.id) as depth, c.age_min, c.age_max,
       app.age_band_depth(c.age_max) as default_depth from class c where c.id = $1`,n=`
select f.id, f.name, ds.name as style,
       coalesce((select jsonb_agg(jsonb_build_object('id', fs.id, 'name', fs.name, 'position', fs.position) order by fs.position)
                   from framework_skill fs where fs.framework_id = f.id and fs.deleted_at is null), '[]') as skills
  from skill_framework f left join dance_style ds on ds.id = f.dance_style_id
 where f.deleted_at is null order by ds.name`,r=`
insert into framework_skill (studio_id, framework_id, name, position)
select f.studio_id, f.id, btrim($2), coalesce((select max(position) + 1 from framework_skill where framework_id = f.id), 1)
  from skill_framework f where f.id = $1 returning id`,l=`
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
 order by (a.status in ('present', 'late', 'trial')) desc nulls last, s.first_name`,d=`
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
 where r.deleted_at is null and r.status = 'shared' order by r.shared_at desc`,u=`select id, student_id, text, status, review_note, created_at from student_goal
                       where student_id = $1 and deleted_at is null order by created_at desc`,m=`
select r.id, r.mood, r.text, r.created_at, c.name as class_name from student_reflection r
  left join class_session cs on cs.id = r.session_id left join class c on c.id = cs.class_id
 where r.student_id = $1 and r.deleted_at is null order by r.created_at desc limit 20`,h=`
select cs.id, c.name, cs.starts_at from attendance_record a join class_session cs on cs.id = a.session_id
  join class c on c.id = cs.class_id
 where a.student_id = app.student_self_id() and a.status in ('present', 'late') and a.deleted_at is null
   and cs.starts_at > now() - interval '14 days'
   and not exists (select 1 from student_reflection r where r.session_id = cs.id and r.deleted_at is null)
 order by cs.starts_at desc limit 5`;e.s(["ADD_CHIP",0,t,"ADD_CLASS_CHIP",0,"select app.add_class_chip($1, $2, $3, $4) as id","ADD_REFLECTION",0,"select app.add_reflection($1, $2, $3) as id","ADD_SKILL",0,r,"ADD_YOUNG_CHIP",0,a,"CHIPS",0,s,"CLASS_CHIPS",0,"select * from app.class_chips($1)","CLASS_DEPTH",0,i,"CLASS_REPORTS",0,c,"DEPTHS",0,[{key:"notes",label:"Notes",hint:"Feedback notes only. No skill levels."},{key:"notes_skills",label:"Notes and skills",hint:"Notes and current skill levels."},{key:"full",label:"Full",hint:"Notes, skill levels and their history over time."}],"DRAFT_REPORTS",0,"select app.draft_class_reports($1) as n","FRAMEWORKS",0,n,"GOALS",0,u,"LAST_FEEDBACK",0,o,"LEVELS",0,[{key:"not_started",label:"Not started",short:"–"},{key:"developing",label:"Developing",short:"D"},{key:"secure",label:"Secure",short:"S"},{key:"mastered",label:"Mastered",short:"M"}],"MILESTONES",0,"select id, kind, title, reached_on from milestone where student_id = $1 order by reached_on desc","MOODS",0,["😣","😕","😐","🙂","🤩"],"MY_RECENT_CLASSES",0,h,"MY_REPORTS",0,_,"PREVIOUS_SESSION_CHIPS",0,d,"PROPOSE_GOAL",0,"insert into student_goal (student_id, text, status, proposed_by) values ($1, btrim($2), $3, auth.uid()) returning id","RECORD_SKILL",0,"select app.record_skill($1, $2, $3::assessment_level, $4) as id","REFLECTIONS",0,m,"REMOVE_CHIP",0,"select app.soft_delete('feedback_chip', $1)","REMOVE_CLASS_CHIP",0,"select app.remove_class_chip($1, $2, $3) as ok","REMOVE_SKILL",0,"select app.soft_delete('framework_skill', $1)","RENAME_SKILL",0,"update framework_skill set name = btrim($2), updated_at = now() where id = $1 returning id","RESET_CLASS_CHIPS",0,"select app.reset_class_chips($1) as n","SAVE_CLASS_FEEDBACK",0,"select app.save_class_feedback($1, $2::jsonb, $3) as n","SESSION_FEEDBACK",0,l,"SET_CLASS_DEPTH",0,"select app.set_class_depth($1, $2) as depth","SET_GOAL",0,"update student_goal set status = $2, review_note = coalesce(nullif(btrim($3), ''), review_note), updated_at = now() where id = $1 returning id","SET_REPORT_COMMENT",0,"update progress_report set comment = nullif(btrim($2), ''), updated_at = now() where id = $1 returning id","SET_SKILL_DEMO",0,"select app.set_skill_demo($1, nullif(btrim($2), ''))","SET_SKILL_PUBLISH",0,"select app.set_skill_publish($1, $2) as mode","SET_SKILL_TRACKING",0,"select app.set_skill_tracking($1, $2) as tracked","SET_SUPPORT_NOTE",0,"select app.set_support_note($1, $2) as ok","SHARE_REPORTS",0,"select app.share_reports($1::uuid[]) as n","SHARE_SESSION_FEEDBACK",0,"select app.share_session_feedback($1) as n","SHARE_SKILLS",0,"select app.share_skills($1) as n","SKILL_DEMOS",0,"select id, demo_url from framework_skill where demo_url is not null and deleted_at is null","SKILL_HISTORY",0,"select * from app.skill_history($1)","SKILL_PUBLISH",0,"select id, skill_publish from studio where id in (select app.studio_ids()) limit 1","STUDENT_SKILLS",0,"select * from app.student_skills($1)","SUPPORT_NEEDS",0,"select * from app.support_needs()","TIMELINE",0,"select * from app.student_timeline($1) limit 200","UNSHARED_SKILLS",0,"select count(*)::int as n from skill_assessment where student_id = $1 and published_at is null and deleted_at is null"])}]);