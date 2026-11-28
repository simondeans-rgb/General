(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,42009,e=>{"use strict";let s=(0,e.i(75254).default)("award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);e.s(["Award",0,s],42009)},64659,e=>{"use strict";let s=(0,e.i(75254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["ChevronDown",0,s],64659)},95468,e=>{"use strict";let s=(0,e.i(75254).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,s],95468)},83086,e=>{"use strict";let s=(0,e.i(75254).default)("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]);e.s(["Sparkles",0,s],83086)},25652,e=>{"use strict";let s=(0,e.i(75254).default)("trending-up",[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]]);e.s(["TrendingUp",0,s],25652)},84524,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(54616),i=e.i(12598),l=e.i(42009),n=e.i(95468),r=e.i(64659),d=e.i(78583),o=e.i(75254);let c=(0,o.default)("flag",[["path",{d:"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528",key:"1jaruq"}]]),_=(0,o.default)("message-square-heart",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}],["path",{d:"M7.5 9.5c0 .687.265 1.383.697 1.844l3.009 3.264a1.14 1.14 0 0 0 .407.314 1 1 0 0 0 .783-.004 1.14 1.14 0 0 0 .398-.31l3.008-3.264A2.77 2.77 0 0 0 16.5 9.5 2.5 2.5 0 0 0 12 8a2.5 2.5 0 0 0-4.5 1.5",key:"1faxuh"}]]);var m=e.i(17697),u=e.i(83086),h=e.i(25652),p=e.i(17658),f=e.i(13927),x=e.i(30224),k=e.i(31502),g=e.i(36261),v=e.i(75379),b=e.i(45060);let j=e=>g.LEVELS.find(s=>s.key===e)?.label??"Not yet assessed";function y(){let{session:e}=(0,k.useSession)(),s=(0,i.useQueryClient)();return(0,a.useMutation)({mutationFn:s=>(0,x.runAs)(e,e=>e(s.sql,s.params)),onSuccess:()=>s.invalidateQueries({queryKey:["db"]})})}let w={not_started:0,developing:3,secure:6,mastered:8};function S({groups:e,demos:a,headingLevel:i,history:l}){let n=3===i?"h3":"h4",d=e.reduce((e,[,s])=>e+s.filter(e=>e.level&&"not_started"!==e.level).length,0),o=t.useMemo(()=>{let e=new Map;return l.filter(e=>e.skill_id&&"full"===e.depth).forEach(s=>e.set(s.skill_id,[...e.get(s.skill_id)??[],s])),e},[l]);return 0===d?(0,s.jsx)("p",{className:"pt-2 text-[0.9062rem] text-ink-2",children:"No skills marked yet. As the teacher assesses each one it shows here as a count of eight: developing, secure, then mastered."}):(0,s.jsx)("div",{className:"space-y-6 pt-2",children:e.map(([e,t])=>{let i=t.filter(e=>e.level&&"not_started"!==e.level),l=t.length-i.length;return i.length?(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-baseline gap-3 border-b border-line pb-1.5",children:[(0,s.jsx)(n,{className:"min-w-0 flex-1 font-semibold",children:e.replace(/ skills$/i,"")}),(0,s.jsxs)("span",{className:"text-[0.8125rem] text-ink-3 tnum",children:[i.length," assessed"]})]}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:i.map(e=>{let t=e.previous&&e.previous!==e.level&&"not_started"!==e.previous,i=o.get(e.skill_id)??[];return(0,s.jsxs)("li",{className:"py-2.5",children:[(0,s.jsxs)("div",{className:"flex min-h-[36px] items-center gap-3",children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsx)("span",{className:"block font-medium leading-snug",children:e.skill}),(0,s.jsxs)("span",{className:"block text-[0.8125rem] text-ink-3",children:[(0,s.jsx)("span",{className:"font-semibold text-ink-2",children:j(e.level)}),t&&(0,s.jsxs)("span",{className:"text-positive",children:[" · up from ",j(e.previous).toLowerCase()]}),a.get(e.skill_id)&&(0,s.jsxs)(s.Fragment,{children:[" · ",(0,s.jsx)("a",{href:a.get(e.skill_id),target:"_blank",rel:"noreferrer",className:"font-semibold text-accent-text underline",children:"Watch"})]})]})]}),(0,s.jsx)(p.Beats,{value:w[e.level],max:8,label:`${e.skill}: ${j(e.level)}`,tone:"mastered"===e.level?"accent":"ink"})]}),i.length>1&&(0,s.jsxs)("details",{className:"group mt-1",children:[(0,s.jsxs)("summary",{className:"inline-flex min-h-[32px] cursor-pointer list-none items-center gap-1 text-[0.8125rem] font-semibold text-accent-text [&::-webkit-details-marker]:hidden",children:["History · ",i.length," ",(0,s.jsx)(r.ChevronDown,{className:"size-3.5 transition-transform group-open:rotate-180","aria-hidden":!0})]}),(0,s.jsx)("ol",{className:"mt-1 space-y-0.5 text-[0.8438rem] text-ink-2",children:i.map((e,t)=>(0,s.jsxs)("li",{className:"flex gap-3",children:[(0,s.jsx)("span",{className:"w-20 shrink-0 tnum text-ink-3",children:(0,v.dateShort)(e.assessed_on)}),j(e.level)]},t))})]})]},e.skill_id)})}),l>0&&(0,s.jsxs)("p",{className:"pt-2 text-[0.8125rem] text-ink-3",children:[l," more to come as the teacher assesses them."]})]},e):null})})}function N({history:e,headingLevel:a}){let i=t.useMemo(()=>{let s=new Map;return e.filter(e=>!e.current_style&&"not_started"!==e.level).forEach(e=>s.set(`${e.style}|${e.skill}`,e)),[...s.values()]},[e]);if(!i.length)return null;let l=[...new Set(i.map(e=>e.style??"Other"))];return(0,s.jsxs)("details",{className:"group mt-6",children:[(0,s.jsxs)("summary",{className:"flex min-h-[44px] cursor-pointer list-none items-center gap-3 border-b border-line pb-1.5 [&::-webkit-details-marker]:hidden",children:[(0,s.jsx)(3===a?"h3":"h4",{className:"min-w-0 flex-1 font-semibold",children:"Earlier styles"}),(0,s.jsx)("span",{className:"text-[0.8125rem] text-ink-3",children:l.join(", ")}),(0,s.jsx)(r.ChevronDown,{className:"size-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180","aria-hidden":!0})]}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:i.map(e=>(0,s.jsxs)("li",{className:"flex items-baseline gap-3 py-2 text-[0.875rem]",children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[e.skill," ",(0,s.jsxs)("span",{className:"text-ink-3",children:["· ",e.style]})]}),(0,s.jsx)("span",{className:"font-semibold text-ink-2",children:j(e.level)}),(0,s.jsx)("span",{className:"w-16 shrink-0 text-right text-[0.8125rem] text-ink-3 tnum",children:(0,v.dateShort)(e.assessed_on)})]},`${e.style}|${e.skill}`))})]})}let E=e=>{let s=new Date(e);return`${s.getFullYear()}-${s.getMonth()}-${s.getDate()}`},$={skill:h.TrendingUp,feedback:_,milestone:l.Award,goal:c,report:d.FileText};e.s(["Goals",0,function({studentId:e,mode:a}){let i=(0,f.useRows)(["goals",e],g.GOALS,[e]),l=y(),[r,d]=t.useState(""),o=(i.data??[]).filter(e=>"proposed"===e.status||"agreed"===e.status),_=(i.data??[]).filter(e=>"achieved"===e.status);return(0,s.jsxs)("div",{className:"space-y-2",children:[null!=l.error&&(0,s.jsx)(p.ErrorState,{error:l.error}),0===o.length&&0===_.length&&(0,s.jsxs)("p",{className:"py-2 text-[0.875rem] text-ink-3",children:["No goals this term","student"===a?" yet. Pick one thing to get better at.":"."]}),(0,s.jsxs)("ul",{className:(0,b.cn)("teacher"===a?"space-y-1.5":"divide-y divide-line"),children:[o.map(e=>(0,s.jsxs)("li",{className:(0,b.cn)("flex flex-wrap items-center gap-2","teacher"===a?"text-sm":"min-h-[44px] py-2.5"),children:["teacher"===a&&(0,s.jsx)(c,{className:"size-3.5 text-accent-text","aria-hidden":!0}),(0,s.jsx)("span",{className:"min-w-0 flex-1",children:e.text}),"proposed"===e.status&&("teacher"===a?(0,s.jsx)(p.Badge,{tone:"caution",children:"Waiting for your teacher"}):(0,s.jsx)("span",{className:"text-[0.8125rem] font-semibold text-caution",children:"student"===a?"Waiting for your teacher":"Waiting for the teacher"})),"agreed"===e.status&&"teacher"!==a&&(0,s.jsx)("span",{className:"text-[0.8125rem] font-semibold text-ink-2",children:"Agreed"}),"teacher"===a&&"proposed"===e.status&&(0,s.jsx)(p.Button,{size:"sm",onClick:()=>l.mutate({sql:g.SET_GOAL,params:[e.id,"agreed",null]}),children:"Agree"}),"teacher"===a&&"agreed"===e.status&&(0,s.jsxs)(p.Button,{size:"sm",variant:"primary",onClick:()=>l.mutate({sql:g.SET_GOAL,params:[e.id,"achieved",null]}),children:[(0,s.jsx)(n.CheckCircle2,{className:"size-4","aria-hidden":!0})," Achieved"]}),"teacher"===a&&(0,s.jsx)(p.Button,{size:"sm",variant:"ghost",onClick:()=>l.mutate({sql:g.SET_GOAL,params:[e.id,"dropped",null]}),children:"Drop"})]},e.id)),_.slice(0,3).map(e=>(0,s.jsxs)("li",{className:(0,b.cn)("flex items-center gap-2 text-ink-2","teacher"===a?"text-sm":"min-h-[44px] py-2.5"),children:["teacher"===a?(0,s.jsx)(n.CheckCircle2,{className:"size-3.5 text-positive","aria-hidden":!0}):null,(0,s.jsx)("span",{className:"min-w-0 flex-1",children:e.text}),"teacher"!==a&&(0,s.jsx)("span",{className:"text-[0.8125rem] font-semibold text-positive",children:"Achieved"})]},e.id))]}),"family"!==a&&o.length<2&&(0,s.jsxs)("form",{className:"flex gap-2 pt-2",onSubmit:s=>{s.preventDefault(),r.trim().length>=3&&(l.mutate({sql:g.PROPOSE_GOAL,params:[e,r,"teacher"===a?"agreed":"proposed"]}),d(""))},children:[(0,s.jsx)(p.Input,{"aria-label":"A goal for this term",value:r,onChange:e=>d(e.target.value),maxLength:200,placeholder:"student"===a?"Something you want to get better at":"A goal for this term"}),(0,s.jsx)(p.Button,{type:"submit",disabled:r.trim().length<3,children:"Add"})]})]})},"Milestones",0,function({studentId:e,celebrate:t}){let a=(0,f.useRows)(["milestones",e],g.MILESTONES,[e]);if(!a.data?.length)return null;let i=a.data.length;return t?(0,s.jsxs)("div",{children:[(0,s.jsxs)("p",{className:"flex items-baseline gap-3",children:[(0,s.jsx)("span",{className:"display-xl text-[length:min(3.5rem,22vw)] leading-none",children:i}),(0,s.jsxs)("span",{className:"text-[0.9375rem] font-semibold leading-snug",children:["milestone",1===i?"":"s"," reached.",(0,s.jsx)("span",{className:"block font-normal text-ink-3",children:i>=8?"That’s a full count. Keep moving.":`${8-i} more to a full count.`})]})]}),(0,s.jsx)(p.Beats,{value:Math.min(i,8),max:8,size:"lg",label:`${i} milestone${1===i?"":"s"}`,className:"mt-3"}),(0,s.jsx)("ul",{className:"mt-3 divide-y divide-line","aria-label":"Milestones",children:a.data.map(e=>(0,s.jsxs)("li",{className:"flex items-baseline gap-3 py-2.5",children:[(0,s.jsx)("span",{className:"min-w-0 flex-1 font-medium",children:e.title}),(0,s.jsx)("span",{className:"shrink-0 text-[0.8125rem] text-ink-3 tnum",children:(0,v.dateShort)(e.reached_on)})]},e.id))})]}):(0,s.jsx)("ul",{className:"flex flex-wrap gap-2","aria-label":"Milestones",children:a.data.map(e=>(0,s.jsxs)("li",{className:"inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[0.8125rem] text-accent-ink",children:[(0,s.jsx)(l.Award,{className:"size-3.5","aria-hidden":!0})," ",e.title," ",(0,s.jsx)("span",{className:"text-[0.7188rem] opacity-70",children:(0,v.dateShort)(e.reached_on)})]},e.id))})},"Reflections",0,function({studentId:e}){let t=(0,f.useRows)(["reflections",e],g.REFLECTIONS,[e]);return t.data?.length?(0,s.jsx)("ul",{className:"space-y-1.5",children:t.data.map(e=>(0,s.jsxs)("li",{className:"flex gap-2 text-sm",children:[(0,s.jsx)("span",{"aria-label":`Mood ${e.mood} of 5`,className:"text-base leading-5",children:g.MOODS[e.mood-1]}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[e.text??(0,s.jsx)("span",{className:"text-ink-3",children:"No words"}),(0,s.jsxs)("span",{className:"block text-[0.75rem] text-ink-3",children:[e.class_name??""," · ",(0,v.relativeDay)(e.created_at)]})]})]},e.id))}):(0,s.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"No reflections."})},"ReportCard",0,function({r:e}){let t=e.summary;return(0,s.jsxs)("article",{className:"space-y-2 text-sm print:break-inside-avoid",children:[(0,s.jsxs)("header",{children:[(0,s.jsxs)("h3",{className:"font-semibold",children:[e.student_name," — ",e.class_name]}),(0,s.jsxs)("p",{className:"text-[0.7812rem] text-ink-3",children:[e.term_name,e.shared_at?` \xb7 shared ${(0,v.dateShort)(e.shared_at)}`:""]})]}),t.attendance&&t.attendance.of>0&&(0,s.jsxs)("p",{children:["Came to ",t.attendance.present," of ",t.attendance.of," classes."]}),!!t.skills?.length&&(0,s.jsx)("ul",{className:"grid gap-1 sm:grid-cols-2",children:t.skills.map(e=>(0,s.jsxs)("li",{className:"flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-surface-2 px-2 py-1",children:[(0,s.jsx)("span",{children:e.skill}),(0,s.jsxs)("span",{className:"text-[0.7812rem]",children:[e.from&&e.from!==e.level?`${j(e.from)} → `:"",(0,s.jsx)("b",{children:j(e.level)})]})]},e.skill))}),!!t.going_well?.length&&(0,s.jsxs)("p",{children:[(0,s.jsx)("b",{children:"Going well:"})," ",t.going_well.join(", "),"."]}),!!t.work_on?.length&&(0,s.jsxs)("p",{children:[(0,s.jsx)("b",{children:"To work on:"})," ",t.work_on.join(", "),"."]}),e.comment&&(0,s.jsx)("p",{className:"whitespace-pre-wrap rounded-[var(--radius-md)] border border-line p-2.5 italic",children:e.comment})]})},"SkillsPanel",0,function({studentId:e,editable:a,headingLevel:i=3}){let l=(0,f.useRows)(["skills",e],g.STUDENT_SKILLS,[e]),n=new Map(((0,f.useRows)(["skill-demos"],g.SKILL_DEMOS).data??[]).map(e=>[e.id,e.demo_url])),r=(0,f.useRows)(["skill-history",e],g.SKILL_HISTORY,[e]),d=(0,f.useRows)(["skill-publish"],g.SKILL_PUBLISH,[],{enabled:!!a}),o=(0,f.useRows)(["skills-unshared",e],g.UNSHARED_SKILLS,[e],{enabled:!!a}),c=y(),_=t.useMemo(()=>{let e=new Map;return(l.data??[]).forEach(s=>e.set(s.framework,[...e.get(s.framework)??[],s])),[...e.entries()]},[l.data]);if(l.isLoading)return(0,s.jsx)(p.Skeleton,{className:"h-24"});let u=(0,s.jsx)(N,{history:r.data??[],headingLevel:i});if(!_.length)return(0,s.jsxs)("div",{children:[(0,s.jsx)("p",{className:"py-3 text-[0.875rem] text-ink-3",children:a?"No skill levels to record here: the class keeps notes only, or the family chose notes only.":"No skills yet. They appear once the class starts."}),u]});if(!a)return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(S,{groups:_,demos:n,headingLevel:i,history:r.data??[]}),u]});let x=o.data?.[0]?.n??0,k=d.data?.[0]?.skill_publish==="immediate";return(0,s.jsxs)("div",{className:"space-y-3",children:[null!=c.error&&(0,s.jsx)(p.ErrorState,{error:c.error}),_.map(([t,a])=>(0,s.jsxs)("div",{children:[(0,s.jsx)("p",{className:"mb-1 text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-ink-3",children:t}),(0,s.jsx)("ul",{className:"space-y-1.5",children:a.map(t=>(0,s.jsxs)("li",{className:"flex flex-wrap items-center gap-2 text-sm",children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[t.skill,t.previous&&t.level&&t.previous!==t.level&&(0,s.jsx)(h.TrendingUp,{className:"ml-1 inline size-3.5 text-positive","aria-label":"Improved"}),n.get(t.skill_id)&&(0,s.jsxs)("a",{href:n.get(t.skill_id),target:"_blank",rel:"noreferrer",className:"ml-2 inline-flex items-center gap-0.5 text-[0.75rem] font-medium text-accent-text underline",children:[(0,s.jsx)(m.PlayCircle,{className:"size-3.5","aria-hidden":!0})," Watch"]}),(0,s.jsx)("button",{className:"ml-2 text-[0.7188rem] text-ink-3 underline","aria-label":`Demonstration link for ${t.skill}`,onClick:()=>{let e=window.prompt(`A secure link (https://) to a demonstration of ${t.skill} by a teacher or professional, not a video of pupils (share those in the class library, where consent is checked). Leave empty to remove.`,n.get(t.skill_id)??"");null!==e&&c.mutate({sql:g.SET_SKILL_DEMO,params:[t.skill_id,e]})},children:n.get(t.skill_id)?"change link":"add demo"})]}),(0,s.jsx)("span",{role:"radiogroup","aria-label":`${t.skill} level`,className:"inline-flex rounded-[var(--radius-md)] border border-line p-0.5",children:g.LEVELS.slice(1).map(a=>(0,s.jsx)("button",{role:"radio","aria-checked":t.level===a.key,title:a.label,onClick:()=>c.mutate({sql:g.RECORD_SKILL,params:[e,t.skill_id,a.key,null]}),className:(0,b.cn)("h-7 min-w-[2rem] rounded-[calc(var(--radius-md)-2px)] px-1.5 text-[0.75rem]",t.level===a.key?"bg-accent font-semibold text-on-accent":"text-ink-2 hover:bg-surface-2"),children:a.short},a.key))})]},t.skill_id))})]},t)),(0,s.jsxs)("p",{className:"text-[0.75rem] text-ink-3",children:["D developing · S secure · M mastered.",k?" Families see levels straight away.":" Families see levels once you share them."]}),!k&&x>0&&(0,s.jsxs)("div",{className:"flex flex-wrap items-center gap-3 border-t border-line pt-2",children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1 text-[0.875rem]",children:[(0,s.jsxs)("span",{className:"font-semibold",children:[x," change",1===x?"":"s"]})," not shared yet"]}),(0,s.jsx)(p.Button,{size:"sm",variant:"primary",loading:c.isPending,onClick:()=>c.mutate({sql:g.SHARE_SKILLS,params:[e]}),children:"Share with the family"})]}),u]})},"ThenAndNow",0,function({studentId:e,name:a}){let i=(0,f.useRows)(["skill-history",e],g.SKILL_HISTORY,[e]),[l,n]=t.useState(3),r=t.useMemo(()=>{let e=new Date;e.setMonth(e.getMonth()-l);let s=e.getTime(),t=new Map;return(i.data??[]).filter(e=>"full"===e.depth&&e.current_style).forEach(e=>{let a=e.skill_id??e.skill,i=t.get(a)??{skill:e.skill,style:e.style,then:null,now:e.level};new Date(e.assessed_on).getTime()<=s&&(i.then=e.level),i.now=e.level,t.set(a,i)}),[...t.values()].filter(e=>e.then!==e.now&&"not_started"!==e.now)},[i.data,l]);return i.isLoading?null:(i.data??[]).some(e=>"full"===e.depth&&e.current_style)?(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex flex-wrap items-center gap-2 pb-2",children:[(0,s.jsx)("label",{htmlFor:`tn-${e}`,className:"text-[0.875rem] text-ink-2",children:"Over the last"}),(0,s.jsx)("select",{id:`tn-${e}`,value:l,onChange:e=>n(Number(e.target.value)),className:"h-10 rounded-[var(--radius-md)] border border-line-strong bg-surface px-2 text-[0.875rem]",children:[1,3,6,12].map(e=>(0,s.jsx)("option",{value:e,children:12===e?"year":`${e} month${1===e?"":"s"}`},e))})]}),0===r.length?(0,s.jsxs)("p",{className:"text-[0.875rem] text-ink-3",children:["No levels changed in this time",a?` for ${a}`:"",". Steady work counts too."]}):(0,s.jsx)("ul",{className:"divide-y divide-line",children:r.map(e=>(0,s.jsxs)("li",{className:"flex flex-wrap items-baseline gap-x-3 py-2.5",children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsx)("span",{className:"font-medium",children:e.skill})," ",(0,s.jsxs)("span",{className:"text-[0.8125rem] text-ink-3",children:["· ",e.style]})]}),(0,s.jsxs)("span",{className:"text-[0.875rem]",children:[(0,s.jsx)("span",{className:"text-ink-3",children:e.then?j(e.then):"New"})," → ",(0,s.jsx)("span",{className:"font-semibold",children:j(e.now)})]})]},`${e.style}|${e.skill}`))})]}):(0,s.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Levels over time are kept for classes set to full tracking."})},"Timeline",0,function({studentId:e,limit:a=30}){let i=(0,f.useRows)(["timeline",e],g.TIMELINE,[e]),[l,n]=t.useState(!1),d=t.useMemo(()=>{let e=Date.now()-7776e6;return(i.data??[]).filter(s=>"skill"===s.kind&&new Date(s.at).getTime()>e&&s.previous&&s.level!==s.previous).length},[i.data]);if(i.isLoading)return(0,s.jsx)(p.Skeleton,{className:"h-24"});if(!i.data?.length)return(0,s.jsx)(p.EmptyState,{title:"Nothing yet",body:"Skills, feedback and milestones appear here as they happen."});let o=l?i.data:i.data.slice(0,a);return(0,s.jsxs)("div",{children:[d>0&&(0,s.jsxs)("p",{className:"mb-3 text-[0.875rem]",children:[(0,s.jsxs)("span",{className:"font-semibold text-positive",children:[d," skill",1===d?"":"s"," moved up"]})," in the last three months."]}),(0,s.jsx)("ol",{className:"relative space-y-3 border-l border-line pl-4",children:(function(e){let s=[];for(let t of e){let e=s[s.length-1];"skill"===t.kind&&e&&"skill"===e[0].kind&&E(e[0].at)===E(t.at)?e.push(t):s.push([t])}return s})(o).map((e,t)=>{let a=e[0],i=$[a.kind]??u.Sparkles;return(0,s.jsxs)("li",{className:"relative",children:[(0,s.jsx)("span",{className:"absolute -left-[25px] top-0.5 grid size-[18px] place-items-center rounded-full bg-surface ring-1 ring-line",children:(0,s.jsx)(i,{className:"size-3 text-accent-text","aria-hidden":!0})}),(0,s.jsx)("p",{className:"text-[0.75rem] text-ink-3",children:(0,v.relativeDay)(a.at)}),e.length>1?(0,s.jsxs)("details",{className:"group",children:[(0,s.jsxs)("summary",{className:"cursor-pointer list-none text-sm font-medium [&::-webkit-details-marker]:hidden",children:[e.length," skills assessed ",(0,s.jsx)(r.ChevronDown,{className:"inline size-3.5 text-ink-3 transition-transform group-open:rotate-180","aria-hidden":!0})]}),(0,s.jsx)("ul",{className:"mt-1 space-y-0.5 text-[0.8125rem] text-ink-2",children:e.map((e,t)=>(0,s.jsxs)("li",{children:[e.title," — ",e.previous?`${j(e.previous)} → `:"",j(e.level)]},t))})]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("p",{className:"text-sm font-medium",children:[a.title,"skill"===a.kind&&(0,s.jsxs)(s.Fragment,{children:[" — ",a.previous?`${j(a.previous)} → `:"",j(a.level)]}),"goal"===a.kind&&a.detail&&(0,s.jsx)(p.Badge,{tone:"achieved"===a.detail?"positive":"neutral",className:"ml-2",children:a.detail})]}),"goal"!==a.kind&&a.detail&&(0,s.jsx)("p",{className:"text-[0.8125rem] text-ink-2",children:a.detail})]})]},t)})}),!l&&i.data.length>a&&(0,s.jsx)(p.Button,{size:"sm",variant:"ghost",className:"mt-2",onClick:()=>n(!0),children:"Show everything"})]})}],84524)},27389,e=>{"use strict";let s=`r.shows_children, r.for_all_staff, r.no_identifiable_children,
       cs.named, cs.without_consent, cs.family_visible, cs.needs_names`,t="left join lateral app.resource_child_status(r.id) cs on r.shows_children",a=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url, r.duration_sec,
       r.storage_path, f.file_name, f.mime_type, f.size_bytes, ${s},
       (select string_agg(distinct coalesce(c.name, lv.name, 'Everyone'), ', ')
          from resource_assignment a
          left join class c on c.id = a.class_id
          left join level lv on lv.id = a.level_id
         where a.resource_id = r.id and a.deleted_at is null) as scope_label
  from resource r
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  ${t}
 where r.deleted_at is null
 order by r.kind, r.category nulls last, r.title`,i=`
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
 order by f.shared_at desc`,l=`
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
returning id, status`,r=`
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
returning id`,o=`
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
 order by starts_at`,c=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`,_=`
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
 order by (r.kind = 'medical_update') desc, r.created_at`,m=`
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`,u=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,h=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,p=`
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
 where c.id = $1 and c.deleted_at is null`,f=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url,
       r.duration_sec, r.storage_path, r.created_at,
       f.file_name, f.mime_type, f.size_bytes, ${s},
       u.full_name as added_by,
       (r.created_by = auth.uid()) as mine,
       case when a.class_id is null then 'Everyone' else null end as scope_label
  from resource r
  left join resource_assignment a
         on a.resource_id = r.id and a.deleted_at is null and a.class_id = $1
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  left join user_account u on u.id = r.created_by
  ${t}
 where r.deleted_at is null
   and (a.id is not null
        or not exists (select 1 from resource_assignment a2
                        where a2.resource_id = r.id and a2.deleted_at is null))
 order by (a.id is null), r.kind, r.created_at desc`,x=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by,
                      shows_children, for_all_staff)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid(),
       coalesce($10::boolean, false), coalesce($11::boolean, false)
  from class c where c.id = $1
returning id, studio_id`,k=`
with kids as (
  select e.student_id as id, true as in_class from enrolment e
   where e.class_id = $1 and e.status = 'active' and e.deleted_at is null
  union
  select rc.student_id, false from resource_child rc where rc.resource_id = $2::uuid
)
select s.id, s.first_name || ' ' || s.last_name as name,
       bool_or(k.in_class) as in_class,
       exists (select 1 from resource_child rc where rc.resource_id = $2::uuid and rc.student_id = s.id) as named,
       app.consent_now(s.id, 'video') as video, app.consent_now(s.id, 'photography') as photo
  from kids k join student s on s.id = k.id and s.deleted_at is null
 group by s.id, s.first_name, s.last_name
 order by s.first_name, s.last_name`,g=`
delete from resource_child where resource_id = $1 and not (student_id = any($2::uuid[]))`,v=`
insert into resource_child (studio_id, resource_id, student_id)
select r.studio_id, r.id, x from resource r, unnest($2::uuid[]) x where r.id = $1
on conflict (resource_id, student_id) do nothing`,b=`
update resource set shows_children = $2, no_identifiable_children = $3 and $2,
                    for_all_staff = $4, updated_at = now()
 where id = $1 returning id`,j=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,y=`
select app.retire_resource($1) as ok`,w=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ADD_RESOURCE_CHILDREN",0,v,"ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,h,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,j,"CLASS_CHILDREN_CONSENT",0,k,"CLASS_DETAIL",0,p,"CLASS_RESOURCES",0,f,"CLEAR_RESOURCE_CHILDREN",0,g,"CREATE_RESOURCE",0,x,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,y,"EVENTS",0,l,"MY_REQUESTS",0,r,"MY_TEACHING_CLASSES",0,w,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,m,"PENDING_REQUESTS",0,_,"RAISE_REQUEST",0,d,"REQUEST_PLACE",0,n,"RESOURCES",0,a,"STUDENT_FEEDBACK",0,i,"UPDATE_RESOURCE_MEDIA",0,b,"WRITE_FEEDBACK",0,c])},36261,e=>{"use strict";let s=`select id, kind, label, position, band, sticker from feedback_chip where class_id is null
                       order by band, kind, position, label`,t=`
insert into feedback_chip (studio_id, kind, label, position)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'standard'), 1)
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,a=`
insert into feedback_chip (studio_id, kind, label, position, band, sticker)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'under_8'), 1),
       'under_8', nullif(btrim($3), '')
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,i=`select c.id, c.tracking_depth, app.class_depth(c.id) as depth, c.age_min, c.age_max,
       app.age_band_depth(c.age_max) as default_depth from class c where c.id = $1`,l=`
select f.id, f.name, ds.name as style,
       coalesce((select jsonb_agg(jsonb_build_object('id', fs.id, 'name', fs.name, 'position', fs.position) order by fs.position)
                   from framework_skill fs where fs.framework_id = f.id and fs.deleted_at is null), '[]') as skills
  from skill_framework f left join dance_style ds on ds.id = f.dance_style_id
 where f.deleted_at is null order by ds.name`,n=`
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
 where r.deleted_at is null and r.status = 'shared' order by r.shared_at desc`,m=`select id, student_id, text, status, review_note, created_at from student_goal
                       where student_id = $1 and deleted_at is null order by created_at desc`,u=`
select r.id, r.mood, r.text, r.created_at, c.name as class_name from student_reflection r
  left join class_session cs on cs.id = r.session_id left join class c on c.id = cs.class_id
 where r.student_id = $1 and r.deleted_at is null order by r.created_at desc limit 20`,h=`
select cs.id, c.name, cs.starts_at from attendance_record a join class_session cs on cs.id = a.session_id
  join class c on c.id = cs.class_id
 where a.student_id = app.student_self_id() and a.status in ('present', 'late') and a.deleted_at is null
   and cs.starts_at > now() - interval '14 days'
   and not exists (select 1 from student_reflection r where r.session_id = cs.id and r.deleted_at is null)
 order by cs.starts_at desc limit 5`;e.s(["ADD_CHIP",0,t,"ADD_CLASS_CHIP",0,"select app.add_class_chip($1, $2, $3, $4) as id","ADD_REFLECTION",0,"select app.add_reflection($1, $2, $3) as id","ADD_SKILL",0,n,"ADD_YOUNG_CHIP",0,a,"CHIPS",0,s,"CLASS_CHIPS",0,"select * from app.class_chips($1)","CLASS_DEPTH",0,i,"CLASS_REPORTS",0,c,"DEPTHS",0,[{key:"notes",label:"Notes",hint:"Feedback notes only. No skill levels."},{key:"notes_skills",label:"Notes and skills",hint:"Notes and current skill levels."},{key:"full",label:"Full",hint:"Notes, skill levels and their history over time."}],"DRAFT_REPORTS",0,"select app.draft_class_reports($1) as n","FRAMEWORKS",0,l,"GOALS",0,m,"LAST_FEEDBACK",0,o,"LEVELS",0,[{key:"not_started",label:"Not started",short:"–"},{key:"developing",label:"Developing",short:"D"},{key:"secure",label:"Secure",short:"S"},{key:"mastered",label:"Mastered",short:"M"}],"MILESTONES",0,"select id, kind, title, reached_on from milestone where student_id = $1 order by reached_on desc","MOODS",0,["😣","😕","😐","🙂","🤩"],"MY_RECENT_CLASSES",0,h,"MY_REPORTS",0,_,"PREVIOUS_SESSION_CHIPS",0,d,"PROPOSE_GOAL",0,"insert into student_goal (student_id, text, status, proposed_by) values ($1, btrim($2), $3, auth.uid()) returning id","RECORD_SKILL",0,"select app.record_skill($1, $2, $3::assessment_level, $4) as id","REFLECTIONS",0,u,"REMOVE_CHIP",0,"select app.soft_delete('feedback_chip', $1)","REMOVE_CLASS_CHIP",0,"select app.remove_class_chip($1, $2, $3) as ok","REMOVE_SKILL",0,"select app.soft_delete('framework_skill', $1)","RENAME_SKILL",0,"update framework_skill set name = btrim($2), updated_at = now() where id = $1 returning id","RESET_CLASS_CHIPS",0,"select app.reset_class_chips($1) as n","SAVE_CLASS_FEEDBACK",0,"select app.save_class_feedback($1, $2::jsonb, $3) as n","SESSION_FEEDBACK",0,r,"SET_CLASS_DEPTH",0,"select app.set_class_depth($1, $2) as depth","SET_GOAL",0,"update student_goal set status = $2, review_note = coalesce(nullif(btrim($3), ''), review_note), updated_at = now() where id = $1 returning id","SET_REPORT_COMMENT",0,"update progress_report set comment = nullif(btrim($2), ''), updated_at = now() where id = $1 returning id","SET_SKILL_DEMO",0,"select app.set_skill_demo($1, nullif(btrim($2), ''))","SET_SKILL_PUBLISH",0,"select app.set_skill_publish($1, $2) as mode","SET_SKILL_TRACKING",0,"select app.set_skill_tracking($1, $2) as tracked","SET_SUPPORT_NOTE",0,"select app.set_support_note($1, $2) as ok","SHARE_REPORTS",0,"select app.share_reports($1::uuid[]) as n","SHARE_SESSION_FEEDBACK",0,"select app.share_session_feedback($1) as n","SHARE_SKILLS",0,"select app.share_skills($1) as n","SKILL_DEMOS",0,"select id, demo_url from framework_skill where demo_url is not null and deleted_at is null","SKILL_HISTORY",0,"select * from app.skill_history($1)","SKILL_PUBLISH",0,"select id, skill_publish from studio where id in (select app.studio_ids()) limit 1","STUDENT_SKILLS",0,"select * from app.student_skills($1)","SUPPORT_NEEDS",0,"select * from app.support_needs()","TIMELINE",0,"select * from app.student_timeline($1) limit 200","UNSHARED_SKILLS",0,"select count(*)::int as n from skill_assessment where student_id = $1 and published_at is null and deleted_at is null"])}]);