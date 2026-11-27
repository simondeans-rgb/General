(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,48241,e=>{"use strict";let t=(0,e.i(75254).default)("calendar-off",[["path",{d:"M4.2 4.2A2 2 0 0 0 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.82-1.18",key:"16swn3"}],["path",{d:"M21 15.5V6a2 2 0 0 0-2-2H9.5",key:"yhw86o"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M3 10h7",key:"1wap6i"}],["path",{d:"M21 10h-5.5",key:"quycpq"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);e.s(["CalendarOff",0,t],48241)},74886,e=>{"use strict";let t=(0,e.i(75254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",0,t],74886)},88699,e=>{"use strict";let t=(0,e.i(75254).default)("pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);e.s(["Pencil",0,t],88699)},7233,e=>{"use strict";let t=(0,e.i(75254).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,t],7233)},67240,e=>{"use strict";let t=(0,e.i(75254).default)("rotate-ccw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);e.s(["RotateCcw",0,t],67240)},10033,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(22016),a=e.i(54616),n=e.i(12598),d=e.i(7233),l=e.i(27612),r=e.i(65712),o=e.i(399),c=e.i(17658),_=e.i(13927),m=e.i(30224),u=e.i(31502),p=e.i(27830),f=e.i(8199);function h(e,t){let{session:i}=(0,u.useSession)(),s=(0,n.useQueryClient)();return(0,a.useMutation)({mutationFn:async t=>{let s=e(t);return(await (0,m.runAs)(i,e=>e(s.sql,s.params)))[0]},onSuccess:e=>{s.invalidateQueries({queryKey:["db"]}),t?.(e)}})}function b({studentId:e,name:s,onClose:a}){let[n,d]=i.useState(""),[l,_]=i.useState(null),m=h(t=>({sql:f.INVITE_STUDENT,params:[e,t]}),e=>_((0,p.inviteLink)(e.token)));return l?(0,t.jsxs)(r.RecordSheet,{title:`Invitation for ${s}`,onClose:a,onSave:a,saveLabel:"Done",children:[(0,t.jsxs)("p",{className:"text-[0.9062rem] text-ink-2",children:["Because you sent it, ",s,"’s login works as soon as they accept."]}),(0,t.jsx)(o.InviteLink,{link:l})]}):(0,t.jsx)(r.RecordSheet,{title:`Invite ${s}`,subtitle:"Their own login",onClose:a,saving:m.isPending,error:m.error,saveLabel:"Make the invitation",canSave:/@.+\./.test(n),onSave:()=>m.mutate(n.trim()),children:(0,t.jsx)(c.Field,{label:`${s}’s email`,htmlFor:"ci-e",required:!0,hint:"They accept the invitation to make their login.",children:(0,t.jsx)(c.Input,{id:"ci-e",type:"email",value:n,onChange:e=>d(e.target.value)})})})}function y({studentId:e,name:s,onClose:a,office:n}){let[d,l]=i.useState(""),[o,_]=i.useState(""),[m,u]=i.useState(""),[p,b]=i.useState("yes"),g=h(()=>n?{sql:$,params:[e,d,o,m,"yes"===p]}:{sql:f.ADD_COLLECTOR,params:[e,d,o,m]},a);return(0,t.jsxs)(r.RecordSheet,{title:n?"Add to the collection list":"Someone who may collect",subtitle:`For ${s}`,onClose:a,saving:g.isPending,error:g.error,canSave:d.trim().length>1,onSave:()=>g.mutate(void 0),children:[(0,t.jsx)(c.Field,{label:"Name",htmlFor:"col-n",required:!0,children:(0,t.jsx)(c.Input,{id:"col-n",value:d,onChange:e=>l(e.target.value)})}),(0,t.jsx)(c.Field,{label:"Relationship",htmlFor:"col-r",children:(0,t.jsx)(c.Input,{id:"col-r",value:o,onChange:e=>_(e.target.value),placeholder:"Grandmother, childminder…"})}),(0,t.jsx)(c.Field,{label:"Phone",htmlFor:"col-p",children:(0,t.jsx)(c.Input,{id:"col-p",type:"tel",value:m,onChange:e=>u(e.target.value)})}),n&&(0,t.jsx)(c.Field,{label:"May they collect?",htmlFor:"col-a",hint:"“May not collect” is shown to the teacher. Families do not see it.",children:(0,t.jsxs)(c.Select,{id:"col-a",value:p,onChange:e=>b(e.target.value),children:[(0,t.jsx)("option",{value:"yes",children:"May collect"}),(0,t.jsx)("option",{value:"no",children:"May not collect"})]})})]})}let g=`
select id, full_name, relationship, phone, allowed from collection_permission
 where student_id = $1 and deleted_at is null order by allowed desc, full_name`,$=`
insert into collection_permission (student_id, full_name, relationship, phone, allowed)
values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), $5) returning id`,w=[["see_schedule","Sees the schedule"],["see_payments","Sees invoices and payments"],["see_feedback","Sees teacher feedback"],["see_medical","Sees medical details"],["may_contact","May be contacted by the studio"],["may_collect","May collect the children"]];e.s(["ChildLogin",0,function({studentId:e,name:s}){let a=(0,_.useRows)(["my-children-logins"],f.MY_CHILDREN_LOGINS),n=a.data?.find(t=>t.student_id===e),[d,l]=i.useState(!1),r=h(t=>({sql:f.SET_STUDENT_LOGIN,params:[e,t]}));if(!n||"too_young"===n.state)return null;let o={too_young:null,none:(0,t.jsxs)("span",{className:"text-ink-3",children:["No login. ",s," uses the app through you."]}),invited:(0,t.jsxs)("span",{className:"[overflow-wrap:anywhere]",children:["Invited",n.email?` at ${n.email}`:"",". Once ",s," accepts, you approve it here."]}),pending:(0,t.jsxs)("span",{children:[(0,t.jsx)(c.Word,{tone:"caution",children:"Waiting for you"})," ",(0,t.jsxs)("span",{className:"ml-1",children:[s," has accepted the school’s invitation. The login stays off until a parent or carer approves it."]})]}),on:(0,t.jsxs)("span",{children:[(0,t.jsx)(c.Word,{tone:"positive",children:"On"})," ",(0,t.jsxs)("span",{className:"ml-1 [overflow-wrap:anywhere]",children:[s," signs in",n.email?` as ${n.email}`:"",". Either parent can switch it off at any time."]})]}),off:(0,t.jsxs)("span",{children:[(0,t.jsx)(c.Word,{tone:"muted",children:"Off"})," ",(0,t.jsxs)("span",{className:"ml-1",children:["A parent or carer switched it off. ",s," cannot sign in."]})]})};return(0,t.jsxs)("div",{className:"grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3",children:[(0,t.jsx)("dt",{className:"text-ink-3",children:"Own login"}),(0,t.jsxs)("dd",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[0.9062rem]",children:o[n.state]}),null!=r.error&&(0,t.jsx)("div",{className:"mt-2",children:(0,t.jsx)(c.ErrorState,{error:r.error})}),(0,t.jsxs)("div",{className:"mt-2 flex flex-wrap gap-2",children:[("pending"===n.state||"off"===n.state)&&(0,t.jsx)(c.Button,{size:"sm",variant:"primary",loading:r.isPending&&!0===r.variables,onClick:()=>r.mutate(!0),children:"pending"===n.state?"Approve":"Switch back on"}),("on"===n.state||"pending"===n.state||"invited"===n.state)&&(0,t.jsx)(c.Button,{size:"sm",loading:r.isPending&&!1===r.variables,onClick:()=>r.mutate(!1),children:"on"===n.state?"Switch off":"pending"===n.state?"Not now":"Withdraw the invitation"}),"none"===n.state&&(0,t.jsxs)(c.Button,{size:"sm",onClick:()=>l(!0),children:["Invite ",s]})]}),(0,t.jsxs)("p",{className:"mt-1.5 text-[0.7812rem] text-ink-3",children:["The school gives students their own login from age ",n.min_age,". They see their classes, feedback and practice, never payments."]})]}),d&&(0,t.jsx)(b,{studentId:e,name:s,onClose:()=>l(!1)})]})},"CollectionList",0,function({studentId:e,name:a}){let n=((0,_.useRows)(["my-collectors"],f.MY_COLLECTORS).data??[]).filter(t=>t.student_id===e),[r,o]=i.useState(!1),m=h(e=>({sql:f.REMOVE_COLLECTOR,params:[e]}));return(0,t.jsxs)("div",{className:"grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3",children:[(0,t.jsx)("dt",{className:"text-ink-3",children:"Who may collect"}),(0,t.jsxs)("dd",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"You, and anyone listed here. The teacher sees this list at the register."}),(0,t.jsx)("ul",{className:"mt-1 space-y-0.5",children:n.map(e=>(0,t.jsxs)("li",{className:"flex items-center gap-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"font-medium",children:e.full_name}),e.relationship?(0,t.jsxs)("span",{className:"text-ink-3",children:[" (",e.relationship,")"]}):null,e.phone?(0,t.jsx)("span",{className:"block tnum text-[0.8438rem] text-ink-2",children:e.phone}):null]}),(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",loading:m.isPending&&m.variables===e.id,onClick:()=>m.mutate(e.id),"aria-label":`Remove ${e.full_name}`,children:(0,t.jsx)(l.Trash2,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),(0,t.jsxs)(c.Button,{size:"sm",variant:"ghost",className:"-ml-3 mt-1",onClick:()=>o(!0),children:[(0,t.jsx)(d.Plus,{className:"size-4","aria-hidden":!0})," Add someone"]}),(0,t.jsxs)("p",{className:"mt-1 text-[0.7812rem] text-ink-3",children:["If someone must not collect ",a,", ",(0,t.jsx)(s.default,{href:"/family/enquiries",className:"font-semibold text-accent-text underline",children:"tell the office"}),"."]})]}),r&&(0,t.jsx)(y,{studentId:e,name:a,onClose:()=>o(!1)})]})},"GuardianAccessFields",0,function({guardianId:e}){let s=(0,_.useRows)(["guardian-access",e],"select * from app.guardian_access_for($1)",[e]),a=s.data?.[0],[n,d]=i.useState(null),l=h(t=>({sql:"select app.set_guardian_access($1, $2::jsonb, $3)",params:[e,JSON.stringify(t.flags),t.note??null]}));return a?(0,t.jsxs)("fieldset",{children:[(0,t.jsx)("legend",{className:"mb-1 text-[0.8125rem] font-medium text-ink-2",children:"Shared care"}),(0,t.jsx)("p",{className:"mb-1 text-[0.7812rem] text-ink-3",children:"Everything is on unless the office restricts it, for example under a court order. Changes apply at once."}),w.map(([e,i])=>(0,t.jsxs)("label",{className:"flex min-h-[44px] items-center gap-3 text-[0.875rem]",children:[(0,t.jsx)("input",{type:"checkbox",checked:!!a[e],className:"size-[18px] accent-[var(--color-accent)]",onChange:t=>l.mutate({flags:{[e]:t.target.checked}})}),i]},e)),a.can_note?(0,t.jsx)(c.Field,{label:"Safeguarding note",htmlFor:"ga-note",hint:"Only the safeguarding lead sees this.",children:(0,t.jsxs)("div",{className:"flex gap-2",children:[(0,t.jsx)(c.Input,{id:"ga-note",value:n??a.dsl_note??"",onChange:e=>d(e.target.value)}),(0,t.jsx)(c.Button,{size:"sm",disabled:null===n,loading:l.isPending,onClick:()=>{l.mutate({flags:{},note:n??""}),d(null)},children:"Save note"})]})}):a.has_note?(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"The safeguarding lead holds a note about this."}):null,null!=l.error&&(0,t.jsx)(c.ErrorState,{error:l.error})]}):s.isLoading?(0,t.jsx)(c.Skeleton,{className:"h-24"}):null},"OfficeCollection",0,function({studentId:e,name:s}){let a=(0,_.useRows)(["office-collection",e],g,[e]),[n,r]=i.useState(!1),o=h(e=>({sql:f.REMOVE_COLLECTOR,params:[e]}));return(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 border-b border-ink pb-1",children:[(0,t.jsx)("h3",{className:"min-w-0 flex-1 text-[0.875rem] font-semibold",children:"Who may collect"}),(0,t.jsxs)(c.Button,{size:"sm",variant:"ghost",onClick:()=>r(!0),children:[(0,t.jsx)(d.Plus,{className:"size-4","aria-hidden":!0})," Add"]})]}),a.isLoading&&(0,t.jsx)(c.Skeleton,{className:"mt-2 h-8"}),a.data?.length===0&&(0,t.jsx)("p",{className:"mt-1 text-[0.8438rem] text-ink-3",children:"Only the family’s guardians."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:a.data?.map(e=>(0,t.jsxs)("li",{className:"flex min-h-[44px] items-center gap-2 text-[0.875rem]",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[!e.allowed&&(0,t.jsx)(c.Word,{tone:"critical",className:"mr-1.5",children:"May not collect"}),(0,t.jsx)("span",{className:"font-medium",children:e.full_name}),e.relationship?(0,t.jsxs)("span",{className:"text-ink-3",children:[" (",e.relationship,")"]}):null]}),(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",onClick:()=>o.mutate(e.id),"aria-label":`Remove ${e.full_name}`,children:(0,t.jsx)(l.Trash2,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),n&&(0,t.jsx)(y,{office:!0,studentId:e,name:s,onClose:()=>r(!1)})]})},"PendingLogins",0,function(){let e=((0,_.useRows)(["my-children-logins"],f.MY_CHILDREN_LOGINS).data??[]).filter(e=>"pending"===e.state);return e.length?(0,t.jsx)(t.Fragment,{children:e.map(e=>(0,t.jsx)("li",{className:"py-3.5",children:(0,t.jsx)(s.default,{href:"/family/children",className:"block rounded-[var(--radius-sm)] hover:bg-surface-2/60",children:(0,t.jsx)(c.Notice,{tone:"accent",word:"Approve?",title:`${e.first_name} has been invited to their own login`,detail:"It stays off until a parent or carer approves it. Open Your family to approve or say not now."})})},e.student_id))}):null},"StudentLoginAge",0,function(){let{session:e}=(0,u.useSession)(),i=(0,_.useRows)(["student-login-age"],"select id, student_login_min_age from studio where id in (select app.studio_ids()) limit 1"),s=i.data?.[0],a=h(e=>({sql:"select app.set_student_login_min_age($1, $2)",params:[s.id,e]}));if(!s)return null;let n=e?.role==="owner";return(0,t.jsxs)(c.Card,{children:[(0,t.jsx)(c.CardHeader,{title:"Students’ own logins",subtitle:`From age ${s.student_login_min_age}`}),(0,t.jsxs)("div",{className:"pt-3",children:[n?(0,t.jsx)(c.Field,{label:"Students may have their own login from age",htmlFor:"sl-age",hint:"A student’s login works only once a parent or carer approves it, and either parent can switch it off. Many schools choose 13; choose higher if your safeguarding policy asks for it.",children:(0,t.jsx)(c.Select,{id:"sl-age",value:String(s.student_login_min_age),onChange:e=>a.mutate(Number(e.target.value)),className:"max-w-[8rem]",children:Array.from({length:6},(e,t)=>13+t).map(e=>(0,t.jsx)("option",{value:e,children:e},e))})}):(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Only the studio owner can change this."}),null!=a.error&&(0,t.jsx)(c.ErrorState,{error:a.error})]})]})}])},399,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(74886),a=e.i(43531),n=e.i(17658);e.s(["InviteLink",0,function({link:e}){let[d,l]=i.useState(!1);return(0,t.jsxs)("div",{className:"mt-3 border-l-2 border-ink pl-3",children:[(0,t.jsxs)("p",{className:"text-[0.875rem] font-semibold",children:["Invitation link ",(0,t.jsx)("span",{className:"font-normal text-ink-3",children:"· works once, for 14 days"})]}),(0,t.jsxs)("div",{className:"mt-2 flex gap-2",children:[(0,t.jsx)(n.Input,{readOnly:!0,value:e,"aria-label":"Invitation link",onFocus:e=>e.currentTarget.select(),className:"text-[0.7812rem]"}),(0,t.jsxs)(n.Button,{size:"sm",onClick:async()=>{try{await navigator.clipboard.writeText(e),l(!0),setTimeout(()=>l(!1),1800)}catch{}},children:[d?(0,t.jsx)(a.Check,{className:"size-4","aria-hidden":!0}):(0,t.jsx)(s.Copy,{className:"size-4","aria-hidden":!0}),d?"Copied":"Copy"]})]}),(0,t.jsx)("p",{className:"mt-2 text-[0.8125rem] text-ink-3",children:"Email delivery isn’t connected yet, so send this link yourself. It’s shown only now."})]})}])},85351,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(54616),a=e.i(12598),n=e.i(7233),d=e.i(37727),l=e.i(17658),r=e.i(45060),o=e.i(13927),c=e.i(30224),_=e.i(31502),m=e.i(36261);function u({className:e,children:i,...s}){return(0,t.jsx)("section",{...s,className:(0,r.cn)("min-w-0",e),children:i})}function p({title:e,subtitle:i,action:s,className:a}){return(0,t.jsxs)("div",{className:(0,r.cn)("border-b-2 border-ink pb-2",a),children:[(0,t.jsxs)("div",{className:"flex min-h-9 items-center gap-3",children:[(0,t.jsx)("h2",{className:"section-title min-w-0 flex-1",children:e}),s]}),i&&(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:i})]})}function f(){let{session:e}=(0,_.useSession)(),t=(0,a.useQueryClient)();return(0,s.useMutation)({mutationFn:t=>(0,c.runAs)(e,e=>e(t.sql,t.params)),onSuccess:()=>t.invalidateQueries({queryKey:["db"]})})}function h(){let e=(0,o.useRows)(["skill-publish"],m.SKILL_PUBLISH),i=f(),s=e.data?.[0];return s?(0,t.jsxs)("fieldset",{className:"pt-4",children:[(0,t.jsx)("legend",{className:"text-[0.875rem] font-semibold",children:"When families see a new level"}),null!=i.error&&(0,t.jsx)("div",{className:"pt-2",children:(0,t.jsx)(l.ErrorState,{error:i.error})}),[["with_share","When the teacher shares it","Levels wait with the class feedback until the teacher taps Share. A mistake can be put right first."],["immediate","Straight away","Each level is visible to the family as soon as it is set."]].map(([e,a,n])=>(0,t.jsxs)("label",{className:"flex min-h-11 cursor-pointer items-start gap-3 py-1",children:[(0,t.jsx)("input",{type:"radio",name:"skill-publish",className:"mt-1 size-4 accent-[var(--color-accent)]",checked:s.skill_publish===e,onChange:()=>i.mutate({sql:m.SET_SKILL_PUBLISH,params:[s.id,e]})}),(0,t.jsxs)("span",{children:[(0,t.jsx)("span",{className:"block text-[0.9375rem] font-medium",children:a}),(0,t.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:n})]})]},e))]}):null}e.s(["ChipSettings",0,function(){let e=(0,o.useRows)(["chips"],m.CHIPS),s=f(),[a,r]=i.useState({});return(0,t.jsxs)(u,{children:[(0,t.jsx)(p,{title:"Feedback phrases",subtitle:"What teachers tap after class. Keep them short and kind. Teachers can keep their own set for a class."}),null!=s.error&&(0,t.jsx)("div",{className:"pt-3",children:(0,t.jsx)(l.ErrorState,{error:s.error})}),["standard","under_8"].map(i=>(0,t.jsxs)("div",{className:"pt-4",children:["under_8"===i&&(0,t.jsxs)("p",{className:"mb-1 text-[0.875rem] font-semibold",children:["For classes up to age 8 ",(0,t.jsx)("span",{className:"font-normal text-ink-3",children:"· simple words, a sticker each"})]}),(0,t.jsx)("div",{className:"grid gap-x-10 gap-y-6 pt-2 sm:grid-cols-2",children:["going_well","work_on"].map(o=>{let c=`${i}-${o}`;return(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"mb-2 font-semibold",children:"going_well"===o?"Going well":"To work on"}),(0,t.jsx)("div",{className:"flex flex-wrap gap-1.5",children:e.data?.filter(e=>e.kind===o&&(e.band??"standard")===i).map(e=>(0,t.jsxs)("span",{className:"inline-flex items-center gap-0.5 rounded-[var(--radius-md)] border border-line-strong bg-surface py-0.5 pl-2.5 pr-0.5 text-[0.875rem]",children:[e.sticker&&(0,t.jsx)("span",{"aria-hidden":!0,className:"mr-1",children:e.sticker}),e.label,(0,t.jsx)("button",{"aria-label":`Remove ${e.label}`,onClick:()=>s.mutate({sql:m.REMOVE_CHIP,params:[e.id]}),className:"grid size-8 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical",children:(0,t.jsx)(d.X,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),(0,t.jsxs)("form",{className:"mt-2 flex gap-1.5",onSubmit:e=>{e.preventDefault();let t=(a[c]??"").trim();t&&(s.mutate("standard"===i?{sql:m.ADD_CHIP,params:[o,t]}:{sql:m.ADD_YOUNG_CHIP,params:[o,t,""]}),r(e=>({...e,[c]:""})))},children:[(0,t.jsx)(l.Input,{"aria-label":`Add a ${"going_well"===o?"going well":"to work on"} phrase${"under_8"===i?" for young classes":""}`,placeholder:"Add a phrase",maxLength:40,value:a[c]??"",onChange:e=>r(t=>({...t,[c]:e.target.value})),className:"h-9 text-[0.875rem]"}),(0,t.jsx)(l.Button,{size:"sm",type:"submit","aria-label":"Add",children:(0,t.jsx)(n.Plus,{className:"size-4","aria-hidden":!0})})]})]},o)})})]},i))]})},"FrameworkSettings",0,function(){let e=(0,o.useRows)(["frameworks"],m.FRAMEWORKS),s=f(),[a,r]=i.useState({});return(0,t.jsxs)(u,{children:[(0,t.jsx)(p,{title:"Skills teachers assess",subtitle:"One list per style. Teachers set each child’s level; families and students see it."}),(0,t.jsx)(h,{}),e.isLoading&&(0,t.jsx)("div",{className:"pt-3",children:(0,t.jsx)(l.Skeleton,{className:"h-24"})}),null!=s.error&&(0,t.jsx)("div",{className:"pt-3",children:(0,t.jsx)(l.ErrorState,{error:s.error})}),(0,t.jsx)("div",{className:"grid gap-x-10 gap-y-6 pt-4 sm:grid-cols-2",children:e.data?.map(e=>(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"border-b border-line pb-1.5 font-semibold",children:e.style??e.name}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:e.skills.map(e=>(0,t.jsxs)("li",{className:"group flex min-h-10 items-center gap-1 text-[0.875rem]",children:[(0,t.jsx)("input",{"aria-label":`Rename ${e.name}`,defaultValue:e.name,onBlur:t=>t.target.value.trim()&&t.target.value.trim()!==e.name&&s.mutate({sql:m.RENAME_SKILL,params:[e.id,t.target.value]}),className:"min-w-0 flex-1 rounded-[var(--radius-sm)] bg-transparent px-1 py-1.5 hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-line"}),(0,t.jsx)("button",{"aria-label":`Remove ${e.name}`,onClick:()=>s.mutate({sql:m.REMOVE_SKILL,params:[e.id]}),className:"grid size-9 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical",children:(0,t.jsx)(d.X,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),(0,t.jsxs)("form",{className:"mt-2 flex gap-1.5",onSubmit:t=>{t.preventDefault();let i=(a[e.id]??"").trim();i&&(s.mutate({sql:m.ADD_SKILL,params:[e.id,i]}),r(t=>({...t,[e.id]:""})))},children:[(0,t.jsx)(l.Input,{"aria-label":`Add a skill to ${e.style}`,placeholder:"Add a skill",value:a[e.id]??"",onChange:t=>r(i=>({...i,[e.id]:t.target.value})),className:"h-9 text-[0.875rem]"}),(0,t.jsx)(l.Button,{size:"sm",type:"submit","aria-label":"Add",children:(0,t.jsx)(n.Plus,{className:"size-4","aria-hidden":!0})})]})]},e.id))})]})},"SettingsHead",0,p,"SettingsSection",0,u])},50293,e=>{"use strict";let t=`
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
  coalesce((select -sum(balance_minor) from family where deleted_at is null and balance_minor < 0), 0)::bigint as credit_minor`,i=`
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
          i.due_on desc nulls last, i.number desc`,s=`
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
  from family f where f.deleted_at is null order by f.name`,l=`
select s.id as student_id, s.first_name as student_name, c.id as class_id, c.name as class_name,
       coalesce(e.price_minor, c.price_minor) as price_minor, c.pricing
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where s.family_id = $1 and e.status = 'active' and e.deleted_at is null and c.deleted_at is null
 order by s.first_name, c.name`,r=`
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
  from l order by at, array_position(array['invoice','payment','credit','credit_note','refund'], kind)`,_=`
select f.id as family_id, f.name as family_name, sum(i.total_minor - i.paid_minor)::bigint as overdue_minor,
       string_agg(i.number, ', ' order by i.due_on, i.number) as invoices, min(i.due_on) as oldest_due,
       app.last_payment_reminder(f.id) as last_reminded,
       exists (select 1 from guardian g where g.family_id = f.id and g.user_id is not null and g.deleted_at is null) as uses_app
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null and i.status in ('issued','part_paid','refunded')
   and i.total_minor > i.paid_minor and i.due_on < current_date
 group by f.id, f.name order by min(i.due_on), f.name`,m=`
select app.fill_payment_reminder($1, $2) as subject, app.fill_payment_reminder($1, $3) as body`,u=`
select b.studio_id, b.payee_name, b.sort_code, b.account_number, b.iban, b.updated_at
  from studio_bank_details b where b.studio_id = $1`,p=`
select f.id as family_id, app.payment_reference(f.name, f.id) as reference,
       b.payee_name, b.sort_code, b.account_number, b.iban
  from family f left join studio_bank_details b on b.studio_id = f.studio_id
 where f.deleted_at is null and f.id in (select app.guardian_family_ids())
 order by f.created_at limit 1`,f=`
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`,h=`
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`,b=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`,y=`
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`,g=`
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.deleted_at is null and d.ended_at is null and (d.ends_on is null or d.ends_on >= current_date)
 order by f.name`,$=`
insert into family_discount (family_id, kind, amount, reason, note, starts_on, ends_on)
values ($1, $2, $3, $4, nullif($5, ''), coalesce($6::date, current_date), $7::date) returning id`,w=`
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
  from lines order by number, ord, created_at`,x=`
select family_name as family, round(current_minor / 100.0, 2) as "0-30 days", round(d31_60 / 100.0, 2) as "31-60 days",
       round(d61_90 / 100.0, 2) as "61-90 days", round(d90_plus / 100.0, 2) as "90+ days", round(total / 100.0, 2) as total
  from app.aged_debt((select id from studio where app.is_admin(id) order by name limit 1))`,v=`
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
 where p.deleted_at is null order by p.created_at`;e.s(["ADD_FAMILY_CREDIT",0,"select app.add_family_credit($1, $2, $3) as id","ADD_FAMILY_DISCOUNT",0,$,"AGED_DEBT_EXPORT",0,x,"BANK_DETAILS",0,u,"BILLING_LINES",0,"select * from app.billing_lines($1, $2::date, $3::uuid[])","BILLING_RUNS",0,y,"BILLING_SKIPPED",0,"select * from app.billing_skipped($1, $2::date)","BILLING_TERMS",0,"select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc","CREATE_BILLING_RUN",0,"select app.create_billing_run($1, $2::date, $3::date, $4::uuid[], $5) as id","CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","DISCARD_BILLING_RUN",0,"select app.discard_billing_run($1)","DISCOUNT_RULES",0,"select id, kind, from_nth, percent, enabled from discount_rule order by kind desc","END_FAMILY_DISCOUNT",0,"select app.end_family_discount($1)","FAMILY_ACCOUNT",0,o,"FAMILY_BILLABLE",0,l,"FAMILY_DISCOUNTS",0,g,"FAMILY_OPTIONS",0,d,"FAMILY_PICK",0,"select id, name from family where deleted_at is null and not is_prospect order by name","FAMILY_STATEMENT",0,c,"INVOICE",0,s,"INVOICES",0,i,"INVOICES_EXPORT",0,v,"INVOICE_CREDIT_NOTES",0,r,"INVOICE_ITEMS",0,a,"INVOICE_PAYMENTS",0,n,"ISSUE_BILLING_RUN",0,"select app.issue_billing_run($1) as n","ISSUE_CREDIT_NOTE",0,"select app.issue_credit_note($1, $2, $3, $4) as id","ISSUE_INVOICE",0,"select app.issue_invoice($1)","MY_PAYMENT_INFO",0,p,"NOTIFY_DUE",0,"select app.notify_invoices_due() as n","OVERDUE_FAMILIES",0,_,"PAYMENTS_EXPORT",0,S,"PRIMARY_GUARDIAN",0,h,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3, $4)","REMINDER_PREVIEW",0,m,"REMINDER_TEMPLATE",0,f,"SEND_DIRECT",0,b,"SEND_REMINDERS",0,"select app.send_payment_reminders($1::uuid[], $2, $3) as sent","SET_BANK_DETAILS",0,"select app.set_bank_details($1, $2, $3, $4, $5)","SET_DISCOUNT_RULE",0,"update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id","SUMMARY",0,t,"UPCOMING_COSTS",0,"select * from app.upcoming_costs($1::uuid)","VOID_INVOICE",0,"select app.void_invoice($1, $2)","XERO_EXPORT",0,w])},8199,e=>{"use strict";let t=`
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
 order by 4`,i=`
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
 order by s.date_of_birth`,s=`
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
 order by (g.user_id = auth.uid()) desc nulls last, g.is_primary desc, g.full_name`,l=`
update guardian set full_name = $2, email = nullif($3, ''), phone = nullif($4, ''), updated_at = now() where id = $1`,r=`
select c.id, c.student_id, c.full_name, c.relationship, c.phone from collection_permission c
 where c.deleted_at is null and c.allowed order by c.created_at`,o=`
insert into collection_permission (student_id, full_name, relationship, phone, allowed)
values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), true) returning id`,c=`
select ec.id, ec.student_id, ec.full_name, ec.relationship, ec.phone from emergency_contact ec
 where ec.deleted_at is null and ec.student_id in (select app.guardian_student_ids())
 order by ec.priority, ec.created_at`,_=`
insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
select s.studio_id, s.id, $2, nullif($3, ''), $4,
       coalesce((select max(priority) + 1 from emergency_contact where student_id = s.id and deleted_at is null), 1)
  from student s where s.id = $1`,m=`
update emergency_contact set full_name = $2, relationship = nullif($3, ''), phone = $4, updated_at = now() where id = $1`,u=`
select d.id, d.student_id, s.first_name, c.name as class_name, cs.starts_at,
       case when d.pack_purchase_id is not null then 'pack' when d.invoice_id is not null then 'invoice' else 'free' end as paid_with
  from drop_in_booking d join student s on s.id = d.student_id join class_session cs on cs.id = d.session_id join class c on c.id = cs.class_id
 where d.status = 'booked' and cs.starts_at > now() order by cs.starts_at`,p=`select p.id, s.first_name, k.name, p.remaining, p.expires_on from pack_purchase p
  join student s on s.id = p.student_id join class_pack k on k.id = p.pack_id
 where p.remaining > 0 and p.expires_on >= current_date order by p.expires_on`;e.s(["ADD_COLLECTOR",0,o,"ADD_CONTACT",0,_,"ASK_TO_CHANGE_GUARDIAN",0,"select app.ask_to_change_guardian($1, $2) as id","BOOK_DROP_IN",0,"select app.book_drop_in($1, $2) as r","BOOK_TRIAL",0,"select app.parent_book_trial($1, $2) as result","BUY_PACK",0,"select app.buy_pack($1, $2) as id","CANCEL_DROP_IN",0,"select app.cancel_drop_in($1) as r","CLASS_OPTIONS",0,"select * from app.class_options_for_child($1)","DROP_IN_SESSIONS",0,"select d.* from studio s, app.drop_in_sessions(s.id) d where s.id in (select app.studio_ids()) order by d.starts_at","INVITE_STUDENT",0,"select app.guardian_invite_student($1, $2) as token","JOIN_WAITLIST",0,"select app.parent_join_waitlist($1, $2) as position","MY_BALANCE",0,s,"MY_CHILDREN",0,i,"MY_CHILDREN_LOGINS",0,"select * from app.my_children_logins()","MY_COLLECTORS",0,r,"MY_CONTACTS",0,c,"MY_DROP_INS",0,u,"MY_GUARDIANS",0,d,"MY_INVOICES",0,a,"MY_MESSAGES",0,n,"MY_PACKS",0,p,"MY_SCHEDULE",0,t,"PACKS",0,"select id, name, classes, price_minor, valid_days from class_pack where active order by classes","REMOVE_COLLECTOR",0,"select app.remove_collection_person($1)","REMOVE_CONTACT",0,"select app.remove_emergency_contact($1)","REQUEST_CHILD",0,"select app.request_new_child($1::jsonb) as id","REQUEST_PLACE",0,"select app.request_class_place($1, $2, $3) as id","SET_STUDENT_LOGIN",0,"select app.set_student_login($1, $2) as r","UPDATE_CONTACT",0,m,"UPDATE_GUARDIAN",0,l])},27830,e=>{"use strict";e.i(47167);let t=`select id, code, name, price_minor, max_students, max_locations, max_staff, is_trial, active
  from plan order by sort`;e.s(["AM_SUPER",0,"select app.is_platform_super() as yes","CREATE_SCHOOL",0,"select * from app.platform_create_studio($1, $2, $3, $4, $5)","EVENTS",0,"select * from app.platform_events($1)","EXTEND_TRIAL",0,"select app.platform_extend_trial($1, $2)","INVITE",0,"select app.create_invitation($1, $2, $3::app_role, $4) as token","INVITES",0,"select * from app.platform_invitations($1)","PLANS",0,t,"PURGE",0,"select app.platform_purge_studio($1, $2)","REVOKE_INVITE",0,"select app.revoke_invitation($1)","SCHOOLS",0,"select * from app.platform_studios()","SET_PLAN",0,"select app.platform_set_plan($1, $2)","SET_PLAN_LIMITS",0,"select app.platform_set_plan_limits($1, $2, $3, $4, $5, $6)","SET_STATUS",0,"select app.platform_set_status($1, $2, $3)","START_SUPPORT",0,"select app.start_support_session($1) as until","inviteLink",0,e=>`${window.location.origin}/General/studio-next/invite/?token=${e}`])},36261,e=>{"use strict";let t=`select id, kind, label, position, band, sticker from feedback_chip where class_id is null
                       order by band, kind, position, label`,i=`
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
 order by (a.status in ('present', 'late', 'trial')) desc nulls last, s.first_name`,r=`
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
 where r.student_id = $1 and r.deleted_at is null order by r.created_at desc limit 20`,p=`
select cs.id, c.name, cs.starts_at from attendance_record a join class_session cs on cs.id = a.session_id
  join class c on c.id = cs.class_id
 where a.student_id = app.student_self_id() and a.status in ('present', 'late') and a.deleted_at is null
   and cs.starts_at > now() - interval '14 days'
   and not exists (select 1 from student_reflection r where r.session_id = cs.id and r.deleted_at is null)
 order by cs.starts_at desc limit 5`;e.s(["ADD_CHIP",0,i,"ADD_CLASS_CHIP",0,"select app.add_class_chip($1, $2, $3, $4) as id","ADD_REFLECTION",0,"select app.add_reflection($1, $2, $3) as id","ADD_SKILL",0,d,"ADD_YOUNG_CHIP",0,s,"CHIPS",0,t,"CLASS_CHIPS",0,"select * from app.class_chips($1)","CLASS_DEPTH",0,a,"CLASS_REPORTS",0,c,"DEPTHS",0,[{key:"notes",label:"Notes",hint:"Feedback notes only. No skill levels."},{key:"notes_skills",label:"Notes and skills",hint:"Notes and current skill levels."},{key:"full",label:"Full",hint:"Notes, skill levels and their history over time."}],"DRAFT_REPORTS",0,"select app.draft_class_reports($1) as n","FRAMEWORKS",0,n,"GOALS",0,m,"LAST_FEEDBACK",0,o,"LEVELS",0,[{key:"not_started",label:"Not started",short:"–"},{key:"developing",label:"Developing",short:"D"},{key:"secure",label:"Secure",short:"S"},{key:"mastered",label:"Mastered",short:"M"}],"MILESTONES",0,"select id, kind, title, reached_on from milestone where student_id = $1 order by reached_on desc","MOODS",0,["😣","😕","😐","🙂","🤩"],"MY_RECENT_CLASSES",0,p,"MY_REPORTS",0,_,"PREVIOUS_SESSION_CHIPS",0,r,"PROPOSE_GOAL",0,"insert into student_goal (student_id, text, status, proposed_by) values ($1, btrim($2), $3, auth.uid()) returning id","RECORD_SKILL",0,"select app.record_skill($1, $2, $3::assessment_level, $4) as id","REFLECTIONS",0,u,"REMOVE_CHIP",0,"select app.soft_delete('feedback_chip', $1)","REMOVE_CLASS_CHIP",0,"select app.remove_class_chip($1, $2, $3) as ok","REMOVE_SKILL",0,"select app.soft_delete('framework_skill', $1)","RENAME_SKILL",0,"update framework_skill set name = btrim($2), updated_at = now() where id = $1 returning id","RESET_CLASS_CHIPS",0,"select app.reset_class_chips($1) as n","SAVE_CLASS_FEEDBACK",0,"select app.save_class_feedback($1, $2::jsonb, $3) as n","SESSION_FEEDBACK",0,l,"SET_CLASS_DEPTH",0,"select app.set_class_depth($1, $2) as depth","SET_GOAL",0,"update student_goal set status = $2, review_note = coalesce(nullif(btrim($3), ''), review_note), updated_at = now() where id = $1 returning id","SET_REPORT_COMMENT",0,"update progress_report set comment = nullif(btrim($2), ''), updated_at = now() where id = $1 returning id","SET_SKILL_DEMO",0,"select app.set_skill_demo($1, nullif(btrim($2), ''))","SET_SKILL_PUBLISH",0,"select app.set_skill_publish($1, $2) as mode","SET_SKILL_TRACKING",0,"select app.set_skill_tracking($1, $2) as tracked","SET_SUPPORT_NOTE",0,"select app.set_support_note($1, $2) as ok","SHARE_REPORTS",0,"select app.share_reports($1::uuid[]) as n","SHARE_SESSION_FEEDBACK",0,"select app.share_session_feedback($1) as n","SHARE_SKILLS",0,"select app.share_skills($1) as n","SKILL_DEMOS",0,"select id, demo_url from framework_skill where demo_url is not null and deleted_at is null","SKILL_HISTORY",0,"select * from app.skill_history($1)","SKILL_PUBLISH",0,"select id, skill_publish from studio where id in (select app.studio_ids()) limit 1","STUDENT_SKILLS",0,"select * from app.student_skills($1)","SUPPORT_NEEDS",0,"select * from app.support_needs()","TIMELINE",0,"select * from app.student_timeline($1) limit 200","UNSHARED_SKILLS",0,"select count(*)::int as n from skill_assessment where student_id = $1 and published_at is null and deleted_at is null"])},35632,e=>{"use strict";let t=`
select l.id, l.name, l.address_line1, l.address_line2, l.city, l.postcode, l.notes,
       (select count(*)::int from room r where r.location_id = l.id and r.deleted_at is null) as rooms,
       (select count(*)::int from class c where c.location_id = l.id and c.deleted_at is null) as classes
  from location l where l.deleted_at is null order by l.name`,i=`
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
update room set name = $2, capacity = $3, updated_at = now() where id = $1 returning id`,l=`
select t.id, t.name, t.starts_on, t.ends_on, t.status::text as status,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes,
       (select count(*)::int from term_break b where b.term_id = t.id and b.deleted_at is null) as breaks
  from term t where t.deleted_at is null order by t.starts_on desc`,r=`
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
returning id`,p=`
update dance_style set name = $2, colour = $3, updated_at = now() where id = $1 returning id`,f=`
select lv.id, lv.name, lv.sort_order,
       (select count(*)::int from class c where c.level_id = lv.id and c.deleted_at is null) as classes
  from level lv where lv.deleted_at is null order by lv.sort_order, lv.name`,h=`
insert into level (studio_id, name, sort_order)
select id, $1, coalesce((select max(sort_order) + 1 from level where deleted_at is null), 0)
  from studio where deleted_at is null limit 1
returning id`,b=`
update level set name = $2, updated_at = now() where id = $1 returning id`,y=`
select id, name, timezone, currency, contact_email, contact_phone, onboarded_at, privacy_notice_url
  from studio where deleted_at is null limit 1`,g=`
update studio set name = $2, timezone = $3, contact_email = nullif(btrim($4),''),
       contact_phone = nullif(btrim($5),''), privacy_notice_url = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`;e.s(["BREAKS",0,c,"CREATE_BREAK",0,_,"CREATE_LEVEL",0,h,"CREATE_LOCATION",0,i,"CREATE_ROOM",0,n,"CREATE_STYLE",0,u,"CREATE_TERM",0,r,"LEVELS_FULL",0,f,"LOCATIONS_FULL",0,t,"RETIRE_SETUP",0,"select app.retire_setup($1, $2) as ok","ROOMS_FULL",0,a,"SET_WAITLIST_DAYS",0,"update studio set waitlist_offer_days = $2, updated_at = now() where id = $1 returning id","STUDIO",0,y,"STYLES_FULL",0,m,"TERMS_FULL",0,l,"UPDATE_LEVEL",0,b,"UPDATE_LOCATION",0,s,"UPDATE_ROOM",0,d,"UPDATE_STUDIO",0,g,"UPDATE_STYLE",0,p,"UPDATE_TERM",0,o,"WAITLIST_SETTING",0,"select id, waitlist_offer_days from studio where deleted_at is null limit 1"])}]);