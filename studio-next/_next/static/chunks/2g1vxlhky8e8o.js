(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,40160,e=>{"use strict";let t=(0,e.i(75254).default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);e.s(["Download",0,t],40160)},87066,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(77326),a=e.i(15790),n=e.i(13927),r=e.i(17658),d=e.i(27389),l=e.i(45060);function o({allow:e,title:c}){let[u,m]=s.useState("all"),[_,h]=s.useState(""),f=(0,n.useRows)(["resources"],d.RESOURCES),p=(f.data??[]).filter(e=>("all"===u||e.kind===u||"document"===u&&"link"===e.kind)&&(!_||`${e.title} ${e.category??""}`.toLowerCase().includes(_.toLowerCase()))),x={all:f.data?.length??0,video:f.data?.filter(e=>"video"===e.kind).length??0,audio:f.data?.filter(e=>"audio"===e.kind).length??0,document:f.data?.filter(e=>"document"===e.kind||"link"===e.kind).length??0};return(0,t.jsx)(i.Shell,{title:c,subtitle:"Everything your teachers have shared with you",allow:e,children:(0,t.jsxs)("div",{className:"mx-auto max-w-2xl space-y-4",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-3",children:[(0,t.jsx)(r.Input,{type:"search",value:_,onChange:e=>h(e.target.value),className:"h-11 w-full",placeholder:"Search videos, tracks and handouts","aria-label":"Search the library"}),(0,t.jsx)("div",{role:"tablist","aria-label":"Kind",className:"-mb-px flex w-full gap-5 overflow-x-auto border-b border-line",children:[["all","All"],["video","Videos"],["audio","Tracks"],["document","Resources"]].map(([e,s])=>(0,t.jsxs)("button",{role:"tab","aria-selected":u===e,onClick:()=>m(e),className:(0,l.cn)("-mb-px min-h-[44px] shrink-0 border-b-2 px-0.5 text-[0.9062rem]",u===e?"border-accent font-semibold text-ink":"border-transparent text-ink-3 hover:text-ink"),children:[s," ",(0,t.jsx)("span",{className:"tnum text-[0.8125rem] text-ink-3",children:x[e]})]},e))})]}),f.isLoading&&(0,t.jsx)("div",{className:"space-y-3",children:[0,1,2].map(e=>(0,t.jsx)(r.Skeleton,{className:"h-16"},e))}),f.error&&(0,t.jsx)(r.ErrorState,{error:f.error,onRetry:()=>f.refetch()}),0===p.length&&!f.isLoading&&(0,t.jsx)(r.EmptyState,{title:_?"Nothing matches that search":"Nothing here yet",body:_?"Try a class name or a step.":"Videos, music and handouts your teachers share show here."}),p.length>0&&(0,t.jsx)("ul",{className:"-mx-4 divide-y divide-line",children:p.map(e=>(0,t.jsx)(a.ResourceRow,{r:e},e.id))}),(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Uploaded files play here. Links open in a new tab."})]})})}e.s(["LibraryView",0,o,"default",0,function(){return(0,t.jsx)(o,{allow:["student"],title:"Library"})}])},48848,e=>{e.v(t=>Promise.all(["static/chunks/3e350uomau313.js"].map(t=>e.l(t))).then(()=>t(39726)))},56166,e=>{e.v(t=>Promise.all(["static/chunks/1sfki9bryb301.js"].map(t=>e.l(t))).then(()=>t(52715)))},15790,3053,61807,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(54616),a=e.i(12598);let n=(0,e.i(75254).default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);var r=e.i(40160),d=e.i(27612),l=e.i(61911),o=e.i(17658),c=e.i(30224),u=e.i(31502),m=e.i(27389);let _={label:"this browser",maxBytes:0x1400000,async upload(e,{q:t,resourceId:s,studioId:i}){if(e.size>0x1400000)throw Error(`That file is ${h(e.size)}. The demo stores files in the browser, so it caps them at ${h(0x1400000)}.`);let a=new Uint8Array(await e.arrayBuffer()),n=e.type||p(e.name),[r]=await t(`insert into resource_file (studio_id, resource_id, file_name, mime_type, size_bytes, bytes, uploaded_by)
       values ($1, $2, $3, $4, $5, $6, auth.uid())
       on conflict (resource_id) do update
         set file_name = excluded.file_name, mime_type = excluded.mime_type,
             size_bytes = excluded.size_bytes, bytes = excluded.bytes, updated_at = now()
       returning id`,[i,s,e.name,n,e.size,a]);if(!r)throw Error("The database refused the upload.");let d=`local:${r.id}`;return await t("update resource set storage_path = $2, url = null where id = $1",[s,d]),{path:d,size:e.size,mime:n,name:e.name}},async resolve(e,t){let s=e.startsWith("local:")?e.slice(6):null;if(!s)return null;let i=(await (0,c.runAs)(t,e=>e("select bytes, mime_type from resource_file where id = $1 and deleted_at is null",[s])))[0];return i?URL.createObjectURL(new Blob([function(e){if(e instanceof Uint8Array||e instanceof ArrayBuffer)return new Uint8Array(e);if("string"==typeof e){let t=e.startsWith("\\x")?e.slice(2):e,s=new Uint8Array(t.length/2);for(let e=0;e<s.length;e++)s[e]=parseInt(t.substr(2*e,2),16);return s}throw Error("Unrecognised binary value from the database")}(i.bytes)],{type:i.mime_type})):null},release(e){e.startsWith("blob:")&&URL.revokeObjectURL(e)}};function h(e){return e<1024?`${e} B`:e<1048576?`${Math.round(e/1024)} KB`:`${(e/1048576).toFixed(+(e<0xa00000))} MB`}let f={mp4:"video/mp4",mov:"video/quicktime",webm:"video/webm",m4v:"video/x-m4v",mp3:"audio/mpeg",m4a:"audio/mp4",wav:"audio/wav",aac:"audio/aac",pdf:"application/pdf",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"};function p(e){return f[e.split(".").pop()?.toLowerCase()??""]??"application/octet-stream"}function x(e){let t=e.type||p(e.name);return t.startsWith("video/")?"video":t.startsWith("audio/")?"audio":"document"}e.s(["formatBytes",0,h,"kindForFile",0,x,"probeDuration",0,function(e){return new Promise(t=>{let s=x(e);if("document"===s)return t(null);let i=URL.createObjectURL(e),a=document.createElement("video"===s?"video":"audio"),n=e=>{URL.revokeObjectURL(i),t(e)};a.preload="metadata",a.onloadedmetadata=()=>{let e=Number.isFinite(a.duration)?Math.round(a.duration):0;n(e>0?e:null)},a.onerror=()=>n(null),setTimeout(()=>n(null),5e3),a.src=i})},"storage",0,_],3053);var v=e.i(45060),y=e.i(37727),b=e.i(13927);let w=e=>"video"===e||"audio"===e?"video":"photography",j={video:"video",photography:"photo"};function g({value:e,kind:s}){let i=`${j[s]} consent: `;return!0===e?(0,t.jsxs)(o.Word,{tone:"positive",children:[(0,t.jsx)("span",{className:"sr-only",children:i}),"Given"]}):!1===e?(0,t.jsxs)(o.Word,{tone:"critical",children:[(0,t.jsx)("span",{className:"sr-only",children:i}),"Withdrawn"]}):(0,t.jsxs)(o.Word,{tone:"caution",children:[(0,t.jsx)("span",{className:"sr-only",children:i}),"Not recorded"]})}function k({classId:e,resourceId:s,consentKind:i,shows:a,onShows:n,picked:r,onPicked:d,isOffice:l,noneIdentifiable:c,onNoneIdentifiable:u,lockedYes:_,required:h}){let f=(0,b.useRows)(["class-children-consent",e,s??""],m.CLASS_CHILDREN_CONSENT,[e,s],{enabled:!0===a}),p=f.data??[],x=p.filter(e=>r.includes(e.id)&&("video"===i?e.video:e.photo)!==!0).length;return(0,t.jsxs)("fieldset",{className:"space-y-2",children:[(0,t.jsxs)("legend",{className:"mb-1 text-[0.8125rem] font-medium text-ink-2",children:["Does this show children?",h&&(0,t.jsx)("span",{className:"text-critical",children:" *"})]}),(0,t.jsxs)("div",{className:"flex flex-wrap gap-x-6",children:[(0,t.jsxs)("label",{className:"flex min-h-[44px] items-center gap-3 text-[0.875rem]",children:[(0,t.jsx)("input",{type:"radio",name:"shows-children",checked:!0===a,onChange:()=>n(!0),className:"size-[18px] accent-[var(--color-accent)]"}),"Yes, children can be seen"]}),(0,t.jsxs)("label",{className:"flex min-h-[44px] items-center gap-3 text-[0.875rem]",children:[(0,t.jsx)("input",{type:"radio",name:"shows-children",checked:!1===a,disabled:_,onChange:()=>n(!1),className:"size-[18px] accent-[var(--color-accent)]"}),"No children in it"]})]}),_&&(0,t.jsx)("p",{className:"text-[0.7812rem] text-ink-3",children:"Only the office can change this back once it is set."}),!0===a&&(0,t.jsxs)("div",{className:"space-y-2 border-l-2 border-line pl-3",children:[(0,t.jsxs)("p",{className:"text-[0.8125rem] text-ink-2",children:["Who is in it? Families see it only while every child named has ",j[i]," consent."]}),f.isLoading&&(0,t.jsx)(o.Skeleton,{className:"h-20"}),null!=f.error&&(0,t.jsx)(o.ErrorState,{error:f.error}),f.isSuccess&&0===p.length&&(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"No children in this class yet."}),p.length>0&&(0,t.jsx)("ul",{className:"divide-y divide-line","aria-label":"Children in this class",children:p.map(e=>(0,t.jsx)("li",{children:(0,t.jsxs)("label",{className:"flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 py-1.5 text-[0.875rem]",children:[(0,t.jsx)("input",{type:"checkbox",checked:r.includes(e.id),onChange:t=>{let s;return s=e.id,d(t.target.checked?[...new Set([...r,s])]:r.filter(e=>e!==s))},className:"size-[18px] accent-[var(--color-accent)]"}),(0,t.jsxs)("span",{className:"min-w-0 flex-1 font-medium",children:[e.name,!e.in_class&&(0,t.jsx)("span",{className:"font-normal text-ink-3",children:" · not in this class now"})]}),(0,t.jsx)(g,{value:"video"===i?e.video:e.photo,kind:i})]})},e.id))}),0===r.length&&(l?(0,t.jsxs)("label",{className:"flex min-h-[44px] items-center gap-3 text-[0.875rem]",children:[(0,t.jsx)("input",{type:"checkbox",checked:c,onChange:e=>u(e.target.checked),className:"size-[18px] accent-[var(--color-accent)]"}),"No child can be identified in it (backs, silhouettes, far away)"]}):(0,t.jsx)("p",{className:"text-[0.7812rem] text-ink-3",children:"With nobody named it stays with staff until you name the children, or the office confirms none can be identified."})),x>0&&(0,t.jsxs)("p",{className:"text-[0.8125rem] font-semibold text-caution",children:["Hidden from families: consent not given for ",x," ",1===x?"child":"children","."]})]})]})}async function E(e,t,s){await e(m.CLEAR_RESOURCE_CHILDREN,[t,s]),s.length&&await e(m.ADD_RESOURCE_CHILDREN,[t,s])}function N({r:e}){if(!e.shows_children||!1!==e.family_visible)return null;let s=e.without_consent??0,i=e.needs_names?"Hidden from families: nobody named yet":`Hidden from families: consent not given for ${s} ${1===s?"child":"children"}`,a=e.needs_names?"Name the children in it, or the office can confirm none can be identified.":"It shows again on its own once every named child has consent.";return(0,t.jsx)(o.Notice,{className:"mt-2",word:"Staff only",tone:"caution",title:i,detail:a})}function $({r:e,classId:n,isOffice:r,onClose:d}){let{session:l}=(0,u.useSession)(),_=(0,a.useQueryClient)(),h=w(e.kind),f=(0,b.useRows)(["class-children-consent",n,e.id],m.CLASS_CHILDREN_CONSENT,[n,e.id]),[p,x]=s.useState(e.shows_children??!1),[v,j]=s.useState(null),[g,N]=s.useState(!!e.no_identifiable_children),[S,C]=s.useState(!!e.for_all_staff),R=v??(f.data??[]).filter(e=>e.named).map(e=>e.id),L=(0,i.useMutation)({mutationFn:()=>(0,c.runAs)(l,async t=>{let[s]=await t(m.UPDATE_RESOURCE_MEDIA,[e.id,!!p,g&&0===R.length,S]);if(!s)throw Error("You cannot change this material.");await E(t,e.id,p?R:[])}),onSuccess:()=>{_.invalidateQueries({queryKey:["db"]}),d()}});return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6",onClick:d,children:(0,t.jsxs)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"edit-children-t",onClick:e=>e.stopPropagation(),className:"flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3 border-b border-line px-5 pb-3 pt-4",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{id:"edit-children-t",className:"font-display text-[1.25rem] leading-tight",children:"Who can see it"}),(0,t.jsx)("p",{className:"mt-1 truncate text-[0.8438rem] text-ink-3",children:e.title})]}),(0,t.jsx)(o.Button,{size:"sm",variant:"ghost","aria-label":"Close",onClick:d,className:"-mr-2 -mt-1",children:(0,t.jsx)(y.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsxs)("div",{className:"min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4",children:[f.isLoading?(0,t.jsx)(o.Skeleton,{className:"h-24"}):(0,t.jsx)(k,{classId:n,resourceId:e.id,consentKind:h,shows:p,onShows:x,picked:R,onPicked:j,isOffice:r,noneIdentifiable:g,onNoneIdentifiable:N,lockedYes:!r&&!!e.shows_children}),r&&(0,t.jsxs)("label",{className:"flex min-h-[44px] items-center gap-3 text-[0.875rem]",children:[(0,t.jsx)("input",{type:"checkbox",checked:S,onChange:e=>C(e.target.checked),className:"size-[18px] accent-[var(--color-accent)]"}),"For all staff, not only this class’s teachers"]}),L.isError&&(0,t.jsx)(o.ErrorState,{error:L.error})]}),(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2 border-t border-line px-5 py-3 pb-safe sm:justify-end",children:[(0,t.jsx)(o.Button,{className:"flex-1 sm:flex-none",variant:"ghost",onClick:d,children:"Cancel"}),(0,t.jsx)(o.Button,{className:"flex-[2] sm:flex-none",variant:"primary",loading:L.isPending,disabled:f.isLoading,onClick:()=>L.mutate(),children:"Save"})]})]})})}e.s(["ChildrenQuestion",0,k,"EditChildren",0,$,"HiddenFromFamilies",0,N,"consentKindFor",0,w,"saveChildren",0,E],61807);let S={video:"Video",audio:"Track",document:"Document",link:"Link"};e.s(["ResourceRow",0,function({r:e,canManage:f,classId:p,isOffice:x}){let{session:y}=(0,u.useSession)(),b=(0,a.useQueryClient)(),w=(e=>{if(!e)return null;let t=Math.floor(e/60);return t>=60?`${Math.floor(t/60)}h ${t%60}m`:`${t}:${String(e%60).padStart(2,"0")}`})(e.duration_sec),j=!!e.storage_path,g=y?.role==="guardian"||y?.role==="student",k=g&&!!e.shows_children,E=(e.mime_type??"").startsWith("image/"),[C,R]=s.useState(!1),[L,A]=s.useState(null),[T,U]=s.useState(!1),[D,z]=s.useState(null);s.useEffect(()=>()=>{L&&_.release(L)},[L]);let I=async()=>{if(e.storage_path&&!L){U(!0),z(null);try{let t=await _.resolve(e.storage_path,y);if(!t)throw Error("That file is no longer available.");A(t)}catch(e){z(e instanceof Error?e.message:"Could not open that file.")}finally{U(!1)}}},O=(0,i.useMutation)({mutationFn:async()=>(0,c.runAs)(y,t=>t(m.DELETE_RESOURCE,[e.id])),onSuccess:()=>b.invalidateQueries({queryKey:["db"]})});return(0,t.jsxs)("li",{className:"px-4 py-3.5",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("p",{className:"font-semibold",children:e.title}),e.description&&(0,t.jsx)("p",{className:"mt-0.5 text-[0.875rem] leading-relaxed text-ink-2",children:e.description}),(0,t.jsxs)("p",{className:"mt-0.5 text-[0.8125rem] text-ink-3",children:[(0,t.jsx)("span",{className:(0,v.cn)("font-semibold","video"===e.kind||"audio"===e.kind?"text-ink-2":"text-ink-3"),children:S[e.kind]??e.kind}),[e.category,e.scope_label,w,null!=e.size_bytes?h(e.size_bytes):null,e.added_by?`added by ${e.added_by}`:null].filter(Boolean).map((e,s)=>(0,t.jsxs)("span",{className:"tnum",children:[" · ",e]},s))]})]}),(0,t.jsxs)("div",{className:"flex shrink-0 items-center gap-1",children:[j&&!L&&(0,t.jsx)(o.Button,{size:"sm",onClick:I,loading:T,children:"video"===e.kind||"audio"===e.kind?"Play":"Open"}),!j&&e.url&&(0,t.jsxs)(o.Button,{size:"sm",onClick:()=>window.open(e.url,"_blank","noopener,noreferrer"),children:[(0,t.jsx)(n,{className:"size-3.5","aria-hidden":!0})," Open"]}),f&&p&&(0,t.jsx)(o.Button,{size:"sm",variant:"ghost",className:"size-10 p-0","aria-label":`Children in ${e.title}`,onClick:()=>R(!0),children:(0,t.jsx)(l.Users,{className:"size-4","aria-hidden":!0})}),f&&(0,t.jsx)(o.Button,{size:"sm",variant:"ghost",className:"size-10 p-0","aria-label":`Remove ${e.title}`,loading:O.isPending,onClick:()=>O.mutate(),children:(0,t.jsx)(d.Trash2,{className:"size-4","aria-hidden":!0})})]})]}),!g&&(0,t.jsx)(N,{r:e}),C&&p&&(0,t.jsx)($,{r:e,classId:p,isOffice:!!x,onClose:()=>R(!1)}),D&&(0,t.jsx)("p",{role:"alert",className:"mt-2 text-[0.7812rem] text-critical",children:D}),O.isError&&(0,t.jsx)("div",{className:"mt-2",children:(0,t.jsx)(o.ErrorState,{error:O.error})}),L&&(0,t.jsxs)("div",{className:"mt-3",children:["video"===e.kind&&(0,t.jsx)("video",{src:L,controls:!0,playsInline:!0,preload:"metadata",...k?{controlsList:"nodownload",disablePictureInPicture:!0,onContextMenu:e=>e.preventDefault()}:{},className:"w-full rounded-[var(--radius-md)] bg-ink"}),"audio"===e.kind&&(0,t.jsx)("audio",{src:L,controls:!0,className:"w-full",...k?{controlsList:"nodownload",onContextMenu:e=>e.preventDefault()}:{}}),"video"!==e.kind&&"audio"!==e.kind&&k&&E&&(0,t.jsx)("img",{src:L,alt:e.title,draggable:!1,onContextMenu:e=>e.preventDefault(),className:"w-full select-none rounded-[var(--radius-md)]"}),"video"!==e.kind&&"audio"!==e.kind&&k&&!E&&(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"This shows children, so it is view-only. Ask the studio if you need a copy."}),"video"!==e.kind&&"audio"!==e.kind&&!k&&(0,t.jsxs)("a",{href:L,download:e.file_name??e.title,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 text-sm font-medium text-accent-ink hover:underline",children:[(0,t.jsx)(r.Download,{className:"size-4","aria-hidden":!0}),e.file_name??"Download"]})]})]})}],15790)},27389,e=>{"use strict";let t=`r.shows_children, r.for_all_staff, r.no_identifiable_children,
       cs.named, cs.without_consent, cs.family_visible, cs.needs_names`,s="left join lateral app.resource_child_status(r.id) cs on r.shows_children",i=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url, r.duration_sec,
       r.storage_path, f.file_name, f.mime_type, f.size_bytes, ${t},
       (select string_agg(distinct coalesce(c.name, lv.name, 'Everyone'), ', ')
          from resource_assignment a
          left join class c on c.id = a.class_id
          left join level lv on lv.id = a.level_id
         where a.resource_id = r.id and a.deleted_at is null) as scope_label
  from resource r
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  ${s}
 where r.deleted_at is null
 order by r.kind, r.category nulls last, r.title`,a=`
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
 order by f.shared_at desc`,n=`
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
 order by ev.starts_at`,r=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,d=`
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`,l=`
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
returning id`,u=`
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
 order by ev.starts_at`,_=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,h=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,f=`
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
       f.file_name, f.mime_type, f.size_bytes, ${t},
       u.full_name as added_by,
       (r.created_by = auth.uid()) as mine,
       case when a.class_id is null then 'Everyone' else null end as scope_label
  from resource r
  left join resource_assignment a
         on a.resource_id = r.id and a.deleted_at is null and a.class_id = $1
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  left join user_account u on u.id = r.created_by
  ${s}
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
returning id, studio_id`,v=`
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
 order by s.first_name, s.last_name`,y=`
delete from resource_child where resource_id = $1 and not (student_id = any($2::uuid[]))`,b=`
insert into resource_child (studio_id, resource_id, student_id)
select r.studio_id, r.id, x from resource r, unnest($2::uuid[]) x where r.id = $1
on conflict (resource_id, student_id) do nothing`,w=`
update resource set shows_children = $2, no_identifiable_children = $3 and $2,
                    for_all_staff = $4, updated_at = now()
 where id = $1 returning id`,j=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,g=`
select app.retire_resource($1) as ok`,k=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ADD_RESOURCE_CHILDREN",0,b,"ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,h,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,j,"CLASS_CHILDREN_CONSENT",0,v,"CLASS_DETAIL",0,f,"CLASS_RESOURCES",0,p,"CLEAR_RESOURCE_CHILDREN",0,y,"CREATE_RESOURCE",0,x,"DECIDE_ENTRY",0,_,"DELETE_RESOURCE",0,g,"EVENTS",0,n,"MY_REQUESTS",0,d,"MY_TEACHING_CLASSES",0,k,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,m,"PENDING_REQUESTS",0,u,"RAISE_REQUEST",0,l,"REQUEST_PLACE",0,r,"RESOURCES",0,i,"STUDENT_FEEDBACK",0,a,"UPDATE_RESOURCE_MEDIA",0,w,"WRITE_FEEDBACK",0,c])}]);