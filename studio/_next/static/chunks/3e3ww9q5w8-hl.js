(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54616,e=>{"use strict";var t=e.i(12598),s=e.i(71645),i=e.i(19273),r=e.i(15823),a=e.i(40143),n=e.i(14272),o=class extends r.Subscribable{#e;#t=void 0;#s;#i;constructor(e,t){super(),this.#e=e,this.setOptions(t),this.bindMethods(),this.#r()}bindMethods(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)}setOptions(e){let t=this.options;this.options=this.#e.defaultMutationOptions(e),(0,i.shallowEqualObjects)(this.options,t)||this.#e.getMutationCache().notify({type:"observerOptionsUpdated",mutation:this.#s,observer:this}),t?.mutationKey&&this.options.mutationKey&&(0,i.hashKey)(t.mutationKey)!==(0,i.hashKey)(this.options.mutationKey)?this.reset():this.#s?.state.status==="pending"&&this.#s.setOptions(this.options)}onSubscribe(){1===this.listeners.size&&this.#s&&(this.#s.addObserver(this),this.#r())}onUnsubscribe(){this.hasListeners()||this.#s?.removeObserver(this)}onMutationUpdate(e){this.#r(),this.#a(e)}getCurrentResult(){return this.#t}reset(){this.#s?.removeObserver(this),this.#s=void 0,this.#r(),this.#a()}mutate(e,t){return this.#i=t,this.#s?.removeObserver(this),this.#s=this.#e.getMutationCache().build(this.#e,this.options),this.#s.addObserver(this),this.#s.execute(e)}#r(){let e=this.#s?.state??(0,n.getDefaultState)();this.#t={...e,isPending:"pending"===e.status,isSuccess:"success"===e.status,isError:"error"===e.status,isIdle:"idle"===e.status,mutate:this.mutate,reset:this.reset}}#a(e){a.notifyManager.batch(()=>{if(this.#i&&this.hasListeners()){let t=this.#t.variables,s=this.#t.context,i={client:this.#e,meta:this.options.meta,mutationKey:this.options.mutationKey};if(e?.type==="success"){try{this.#i.onSuccess?.(e.data,t,s,i)}catch(e){Promise.reject(e)}try{this.#i.onSettled?.(e.data,null,t,s,i)}catch(e){Promise.reject(e)}}else if(e?.type==="error"){try{this.#i.onError?.(e.error,t,s,i)}catch(e){Promise.reject(e)}try{this.#i.onSettled?.(void 0,e.error,t,s,i)}catch(e){Promise.reject(e)}}}this.listeners.forEach(e=>{e(this.#t)})})}};e.s(["useMutation",0,function(e,r){let n=(0,t.useQueryClient)(r),[l]=s.useState(()=>new o(n,e));s.useEffect(()=>{l.setOptions(e)},[l,e]);let d=s.useSyncExternalStore(s.useCallback(e=>l.subscribe(a.notifyManager.batchCalls(e)),[l]),()=>l.getCurrentResult(),()=>l.getCurrentResult()),u=s.useCallback((...e)=>{l.mutate(e[0],e[1]).catch(i.noop)},[l]);if(d.error&&(0,i.shouldThrowError)(l.options.throwOnError,[d.error]))throw d.error;return{...d,mutate:u,mutateAsync:d.mutate}}],54616)},78583,e=>{"use strict";let t=(0,e.i(75254).default)("file-text",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);e.s(["FileText",0,t],78583)},87066,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(17697),r=e.i(77326),a=e.i(15790),n=e.i(13927),o=e.i(17658),l=e.i(27389),d=e.i(45060);function u({allow:e,title:c}){let[h,m]=s.useState("all"),[p,f]=s.useState(""),_=(0,n.useRows)(["resources"],l.RESOURCES),y=(_.data??[]).filter(e=>("all"===h||e.kind===h||"document"===h&&"link"===e.kind)&&(!p||`${e.title} ${e.category??""}`.toLowerCase().includes(p.toLowerCase()))),v={all:_.data?.length??0,video:_.data?.filter(e=>"video"===e.kind).length??0,audio:_.data?.filter(e=>"audio"===e.kind).length??0,document:_.data?.filter(e=>"document"===e.kind||"link"===e.kind).length??0};return(0,t.jsx)(r.Shell,{title:c,subtitle:"Everything your teachers have shared with you",allow:e,children:(0,t.jsxs)("div",{className:"mx-auto max-w-2xl space-y-4",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-3",children:[(0,t.jsx)("div",{role:"tablist","aria-label":"Kind",className:"inline-flex rounded-[var(--radius-md)] border border-line bg-surface p-0.5",children:[["all","All"],["video","Videos"],["audio","Tracks"],["document","Resources"]].map(([e,s])=>(0,t.jsxs)("button",{role:"tab","aria-selected":h===e,onClick:()=>m(e),className:(0,d.cn)("min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium",h===e?"bg-accent-soft text-accent-ink":"text-ink-2 hover:text-ink"),children:[s," ",(0,t.jsx)("span",{className:"tnum text-ink-3",children:v[e]})]},e))}),(0,t.jsx)(o.Input,{type:"search",value:p,onChange:e=>f(e.target.value),className:"min-w-[180px] flex-1",placeholder:"Search","aria-label":"Search the library"})]}),_.isLoading&&(0,t.jsx)(o.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,t.jsx)(o.Skeleton,{className:"h-16"},e))}),_.error&&(0,t.jsx)(o.ErrorState,{error:_.error,onRetry:()=>_.refetch()}),0===y.length&&!_.isLoading&&(0,t.jsx)(o.Card,{children:(0,t.jsx)(o.EmptyState,{icon:(0,t.jsx)(i.PlayCircle,{className:"size-5"}),title:p?"Nothing matches that search":"Nothing here yet",body:p?void 0:"Your teachers can share videos, music and handouts with your classes."})}),y.length>0&&(0,t.jsx)(o.Card,{children:(0,t.jsx)("ul",{className:"divide-y divide-line",children:y.map(e=>(0,t.jsx)(a.ResourceRow,{r:e},e.id))})}),(0,t.jsx)("p",{className:"px-1 text-[12.5px] text-ink-3",children:"Uploaded files play here. Links open in a new tab."})]})})}e.s(["LibraryView",0,u,"default",0,function(){return(0,t.jsx)(u,{allow:["student"],title:"Library"})}])},15790,3053,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(54616),r=e.i(12598),a=e.i(17697),n=e.i(75254);let o=(0,n.default)("music-2",[["circle",{cx:"8",cy:"18",r:"4",key:"1fc0mg"}],["path",{d:"M12 18V2l7 4",key:"g04rme"}]]);var l=e.i(78583);let d=(0,n.default)("link-2",[["path",{d:"M9 17H7A5 5 0 0 1 7 7h2",key:"8i5ue5"}],["path",{d:"M15 7h2a5 5 0 1 1 0 10h-2",key:"1b9ql8"}],["line",{x1:"8",x2:"16",y1:"12",y2:"12",key:"1jonct"}]]),u=(0,n.default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]),c=(0,n.default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]),h=(0,n.default)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);var m=e.i(17658),p=e.i(30224),f=e.i(31502),_=e.i(27389);let y={label:"this browser",maxBytes:0x1400000,async upload(e,{q:t,resourceId:s,studioId:i}){if(e.size>0x1400000)throw Error(`That file is ${v(e.size)}. The demo stores files in the browser, so it caps them at ${v(0x1400000)}.`);let r=new Uint8Array(await e.arrayBuffer()),a=e.type||g(e.name),[n]=await t(`insert into resource_file (studio_id, resource_id, file_name, mime_type, size_bytes, bytes, uploaded_by)
       values ($1, $2, $3, $4, $5, $6, auth.uid())
       on conflict (resource_id) do update
         set file_name = excluded.file_name, mime_type = excluded.mime_type,
             size_bytes = excluded.size_bytes, bytes = excluded.bytes, updated_at = now()
       returning id`,[i,s,e.name,a,e.size,r]);if(!n)throw Error("The database refused the upload.");let o=`local:${n.id}`;return await t("update resource set storage_path = $2, url = null where id = $1",[s,o]),{path:o,size:e.size,mime:a,name:e.name}},async resolve(e,t){let s=e.startsWith("local:")?e.slice(6):null;if(!s)return null;let i=(await (0,p.runAs)(t,e=>e("select bytes, mime_type from resource_file where id = $1 and deleted_at is null",[s])))[0];return i?URL.createObjectURL(new Blob([function(e){if(e instanceof Uint8Array||e instanceof ArrayBuffer)return new Uint8Array(e);if("string"==typeof e){let t=e.startsWith("\\x")?e.slice(2):e,s=new Uint8Array(t.length/2);for(let e=0;e<s.length;e++)s[e]=parseInt(t.substr(2*e,2),16);return s}throw Error("Unrecognised binary value from the database")}(i.bytes)],{type:i.mime_type})):null},release(e){e.startsWith("blob:")&&URL.revokeObjectURL(e)}};function v(e){return e<1024?`${e} B`:e<1048576?`${Math.round(e/1024)} KB`:`${(e/1048576).toFixed(+(e<0xa00000))} MB`}let b={mp4:"video/mp4",mov:"video/quicktime",webm:"video/webm",m4v:"video/x-m4v",mp3:"audio/mpeg",m4a:"audio/mp4",wav:"audio/wav",aac:"audio/aac",pdf:"application/pdf",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"};function g(e){return b[e.split(".").pop()?.toLowerCase()??""]??"application/octet-stream"}function R(e){let t=e.type||g(e.name);return t.startsWith("video/")?"video":t.startsWith("audio/")?"audio":"document"}e.s(["formatBytes",0,v,"kindForFile",0,R,"probeDuration",0,function(e){return new Promise(t=>{let s=R(e);if("document"===s)return t(null);let i=URL.createObjectURL(e),r=document.createElement("video"===s?"video":"audio"),a=e=>{URL.revokeObjectURL(i),t(e)};r.preload="metadata",r.onloadedmetadata=()=>{let e=Number.isFinite(r.duration)?Math.round(r.duration):0;a(e>0?e:null)},r.onerror=()=>a(null),setTimeout(()=>a(null),5e3),r.src=i})},"storage",0,y],3053);var x=e.i(45060);let w={video:a.PlayCircle,audio:o,document:l.FileText,link:d},E={video:"Video",audio:"Track",document:"Document",link:"Link"};e.s(["ResourceRow",0,function({r:e,canManage:a}){let{session:n}=(0,f.useSession)(),o=(0,r.useQueryClient)(),d=w[e.kind]??l.FileText,b=(e=>{if(!e)return null;let t=Math.floor(e/60);return t>=60?`${Math.floor(t/60)}h ${t%60}m`:`${t}:${String(e%60).padStart(2,"0")}`})(e.duration_sec),g=!!e.storage_path,[R,k]=s.useState(null),[j,S]=s.useState(!1),[Q,O]=s.useState(null);s.useEffect(()=>()=>{R&&y.release(R)},[R]);let T=async()=>{if(e.storage_path&&!R){S(!0),O(null);try{let t=await y.resolve(e.storage_path,n);if(!t)throw Error("That file is no longer available.");k(t)}catch(e){O(e instanceof Error?e.message:"Could not open that file.")}finally{S(!1)}}},C=(0,i.useMutation)({mutationFn:async()=>(0,p.runAs)(n,t=>t(_.DELETE_RESOURCE,[e.id])),onSuccess:()=>o.invalidateQueries({queryKey:["db"]})});return(0,t.jsxs)("li",{className:"px-4 py-3.5",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsx)("span",{"aria-hidden":!0,className:(0,x.cn)("grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]","video"===e.kind?"bg-violet-soft text-violet":"audio"===e.kind?"bg-amber-soft text-amber":"bg-surface-2 text-ink-2"),children:(0,t.jsx)(d,{className:"size-5"})}),(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("p",{className:"font-medium",children:e.title}),e.description&&(0,t.jsx)("p",{className:"mt-0.5 text-[13px] leading-relaxed text-ink-2",children:e.description}),(0,t.jsxs)("p",{className:"mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[12.5px] text-ink-3",children:[(0,t.jsx)("span",{children:E[e.kind]??e.kind}),e.category&&(0,t.jsx)("span",{children:e.category}),e.scope_label&&(0,t.jsx)("span",{children:e.scope_label}),b&&(0,t.jsx)("span",{className:"tnum",children:b}),null!=e.size_bytes&&(0,t.jsx)("span",{className:"tnum",children:v(e.size_bytes)}),e.added_by&&(0,t.jsxs)("span",{children:["added by ",e.added_by]})]})]}),(0,t.jsxs)("div",{className:"flex shrink-0 items-center gap-1",children:[g&&!R&&(0,t.jsx)(m.Button,{size:"sm",onClick:T,loading:j,children:"video"===e.kind||"audio"===e.kind?"Play":"Open"}),!g&&e.url&&(0,t.jsxs)(m.Button,{size:"sm",onClick:()=>window.open(e.url,"_blank","noopener,noreferrer"),children:[(0,t.jsx)(u,{className:"size-3.5","aria-hidden":!0})," Open"]}),a&&(0,t.jsx)(m.Button,{size:"sm",variant:"ghost","aria-label":`Remove ${e.title}`,loading:C.isPending,onClick:()=>C.mutate(),children:(0,t.jsx)(h,{className:"size-4","aria-hidden":!0})})]})]}),Q&&(0,t.jsx)("p",{role:"alert",className:"mt-2 text-[12.5px] text-critical",children:Q}),C.isError&&(0,t.jsx)("div",{className:"mt-2",children:(0,t.jsx)(m.ErrorState,{error:C.error})}),R&&(0,t.jsxs)("div",{className:"mt-3",children:["video"===e.kind&&(0,t.jsx)("video",{src:R,controls:!0,playsInline:!0,preload:"metadata",className:"w-full rounded-[var(--radius-md)] bg-ink"}),"audio"===e.kind&&(0,t.jsx)("audio",{src:R,controls:!0,className:"w-full"}),"video"!==e.kind&&"audio"!==e.kind&&(0,t.jsxs)("a",{href:R,download:e.file_name??e.title,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 text-sm font-medium text-accent-ink hover:underline",children:[(0,t.jsx)(c,{className:"size-4","aria-hidden":!0}),e.file_name??"Download"]})]})]})}],15790)},13927,e=>{"use strict";let t;var s=e.i(12598),i=e.i(71645);let r=i.createContext(!1);r.Provider,e.i(43476);let a=i.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),o=e.i(40143),l=e.i(80166),d=e.i(73911),u=e.i(15823),c=e.i(75555),h=e.i(86491),m=class extends u.Subscribable{#e;#n=void 0;#o=void 0;#t=void 0;#l;#d;#u;#c;#h;#m;#p;#f;#_;#y=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#u=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#n.addObserver(this),p(this.#n,this.options)?this.#v():this.updateResult(),this.#b())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#n,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#n,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#g(),this.#R(),this.#n.removeObserver(this)}setOptions(e){let t=this.options,s=this.#n;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#n))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#x(),this.#n.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#n,observer:this});let i=this.hasListeners();i&&_(this.#n,s,this.options,t)&&this.#v(),this.updateResult(),i&&(this.#n!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#n)!==(0,n.resolveQueryBoolean)(t.enabled,this.#n)||(0,n.resolveStaleTime)(this.options.staleTime,this.#n)!==(0,n.resolveStaleTime)(t.staleTime,this.#n))&&this.#w();let r=this.#E();i&&(this.#n!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#n)!==(0,n.resolveQueryBoolean)(t.enabled,this.#n)||r!==this.#_)&&this.#k(r)}getOptimisticResult(e){var t,s;let i=this.#e.getQueryCache().build(this.#e,e),r=this.createResult(i,e);return t=this,s=r,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#t=r,this.#d=this.options,this.#l=this.#n.state),r}getCurrentResult(){return this.#t}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#y.add(e)}getCurrentQuery(){return this.#n}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),i=this.#e.getQueryCache().build(this.#e,s),r=()=>{},a=new Promise(e=>{t=e,r=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===i.queryHash&&void 0!==i.state.data&&(r(),e(this.createResult(i,s)))})});return Promise.race([i.fetch().then(()=>{let e=this.createResult(i,s);return t?.(e),e}).finally(()=>{r()}),a])}fetch(e){return this.#v({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#t))}#v(e){this.#x();let t=this.#n.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#w(){this.#g();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#n);if(d.environmentManager.isServer()||this.#t.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#t.dataUpdatedAt,e)+1;this.#p=l.timeoutManager.setTimeout(()=>{this.#t.isStale||this.updateResult()},t)}#E(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#n):this.options.refetchInterval)??!1}#k(e){this.#R(),this.#_=e,!d.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#n)&&(0,n.isValidTimeout)(this.#_)&&0!==this.#_&&(this.#f=l.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||c.focusManager.isFocused())&&this.#v()},this.#_))}#b(){this.#w(),this.#k(this.#E())}#g(){void 0!==this.#p&&(l.timeoutManager.clearTimeout(this.#p),this.#p=void 0)}#R(){void 0!==this.#f&&(l.timeoutManager.clearInterval(this.#f),this.#f=void 0)}createResult(e,t){let s,i=this.#n,r=this.options,a=this.#t,o=this.#l,l=this.#d,d=e!==i?e.state:this.#o,{state:u}=e,c={...u},m=!1;if(t._optimisticResults){let s=this.hasListeners(),a=!s&&p(e,t),n=s&&_(e,i,t,r);(a||n)&&(c={...c,...(0,h.fetchState)(u.data,e.options)}),"isRestoring"===t._optimisticResults&&(c.fetchStatus="idle")}let{error:f,errorUpdatedAt:v,status:b}=c;s=c.data;let g=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===b){let e;a?.isPlaceholderData&&t.placeholderData===l?.placeholderData?(e=a.data,g=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#m?.state.data,this.#m):t.placeholderData,void 0!==e&&(b="success",s=(0,n.replaceData)(a?.data,e,t),m=!0)}if(t.select&&void 0!==s&&!g)if(a&&s===o?.data&&t.select===this.#c)s=this.#h;else try{this.#c=t.select,s=t.select(s),s=(0,n.replaceData)(a?.data,s,t),this.#h=s,this.#u=null}catch(e){this.#u=e}else void 0===s&&(this.#u=null);this.#u&&(f=this.#u,s=this.#h,v=Date.now(),b="error",m=!1);let R="fetching"===c.fetchStatus,x="pending"===b,w="error"===b,E=x&&R,k=void 0!==s;return{status:b,fetchStatus:c.fetchStatus,isPending:x,isSuccess:"success"===b,isError:w,isInitialLoading:E,isLoading:E,data:s,dataUpdatedAt:c.dataUpdatedAt,error:f,errorUpdatedAt:v,failureCount:c.fetchFailureCount,failureReason:c.fetchFailureReason,errorUpdateCount:c.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:c.dataUpdateCount>d.dataUpdateCount||c.errorUpdateCount>d.errorUpdateCount,isFetching:R,isRefetching:R&&!x,isLoadingError:w&&!k,isPaused:"paused"===c.fetchStatus,isPlaceholderData:m,isRefetchError:w&&k,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#t,t=this.createResult(this.#n,this.options);if(this.#l=this.#n.state,this.#d=this.options,void 0!==this.#l.data&&(this.#m=this.#n),(0,n.shallowEqualObjects)(t,e))return;this.#t=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#y.size)return!0;let i=new Set(s??this.#y);return this.options.throwOnError&&i.add("error"),Object.keys(this.#t).some(t=>this.#t[t]!==e[t]&&i.has(t))};this.#a({listeners:s()})}#x(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#n)return;let t=this.#n;this.#n=e,this.#o=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#b()}#a(e){o.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#t)}),this.#e.getQueryCache().notify({query:this.#n,type:"observerResultsUpdated"})})}};function p(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let i="function"==typeof s?s(e):s;return"always"===i||!1!==i&&y(e,t)}return!1}function _(e,t,s,i){return(e!==t||!1===(0,n.resolveQueryBoolean)(i.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}var v=e.i(30224),b=e.i(31502);function g(e,t,l=[],d){let{session:u}=(0,b.useSession)();return function(e,t,l){let d,u=i.useContext(r),c=i.useContext(a),h=(0,s.useQueryClient)(l),m=h.defaultQueryOptions(e),p=h.getQueryCache().get(m.queryHash),f=!1!==e.subscribed;if(m._optimisticResults=u?"isRestoring":f?"optimistic":void 0,m.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=m.staleTime;m.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof m.gcTime&&(m.gcTime=Math.max(m.gcTime,1e3))}d=p?.state.error&&"function"==typeof m.throwOnError?(0,n.shouldThrowError)(m.throwOnError,[p.state.error,p]):m.throwOnError,(m.suspense||d)&&!c.isReset()&&(m.retryOnMount=!1),i.useEffect(()=>{c.clearReset()},[c]);let[_]=i.useState(()=>new t(h,m)),y=_.getOptimisticResult(m),v=!u&&f;if(i.useSyncExternalStore(i.useCallback(e=>{let t=v?_.subscribe(o.notifyManager.batchCalls(e)):n.noop;return _.updateResult(),t},[_,v]),()=>_.getCurrentResult(),()=>_.getCurrentResult()),i.useEffect(()=>{_.setOptions(m)},[m,_]),m?.suspense&&y.isPending)throw _.fetchOptimistic(m).catch(()=>{c.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:i,suspense:r})=>e.isError&&!t.isReset()&&!e.isFetching&&i&&(r&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,i])))({result:y,errorResetBoundary:c,throwOnError:m.throwOnError,query:p,suspense:m.suspense}))throw y.error;return m.notifyOnChangeProps?y:_.trackResult(y)}({queryKey:["db",u?.userId??"anon",...e],queryFn:()=>(0,v.readAs)(u,t,l),staleTime:15e3,...d},m,void 0)}e.s(["useRow",0,function(e,t,s=[]){let i=g(e,t,s);return{...i,data:i.data?.[0]}},"useRows",0,g],13927)},27389,e=>{"use strict";let t=`
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
select f.id, f.headline, f.going_well, f.work_on, f.created_at, f.shared_at,
       c.name as class_name, sm.display_name as author,
       s.first_name || ' ' || s.last_name as student_name, s.id as student_id
  from feedback_note f
  join student s on s.id = f.student_id
  left join class c on c.id = f.class_id
  left join staff_member sm on sm.id = f.author_id
 where f.deleted_at is null and f.shared_at is not null
 order by f.shared_at desc`,i=`
select a.id, a.skill, a.level, a.assessed_on, a.note,
       ds.name as style, s.first_name as student_name
  from skill_assessment a
  join student s on s.id = a.student_id
  left join dance_style ds on ds.id = a.dance_style_id
 where a.deleted_at is null
 order by s.first_name, a.skill`,r=`
select ev.id, ev.kind, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.venue,
       ev.cost_minor, ev.capacity, ev.entries_close_on, ev.requests_open,
       sm.display_name as teacher, ev.student_id,
       (select count(*)::int from event_participant p
         where p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null) as going,
       (select p.status::text from event_participant p
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_status,
       (select s.first_name from event_participant p join student s on s.id = p.student_id
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_student
  from studio_event ev
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at > now() - interval '1 day'
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
 order by r.created_at desc`,o=`
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
returning id`,u=`
select r.id, r.kind, r.status, r.subject, r.body, r.created_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null and r.status in ('open','in_progress')
 order by r.created_at`,c=`
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`,h=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,m=`
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
 order by (a.id is null), r.kind, r.created_at desc`,_=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,y=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,v=`
select app.retire_resource($1) as ok`,b=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ANSWER_REQUEST",0,m,"ASSIGN_RESOURCE_TO_CLASS",0,y,"CLASS_DETAIL",0,p,"CLASS_RESOURCES",0,f,"CREATE_RESOURCE",0,_,"DECIDE_ENTRY",0,h,"DELETE_RESOURCE",0,v,"EVENTS",0,r,"MY_ASSESSMENTS",0,i,"MY_REQUESTS",0,n,"MY_TEACHING_CLASSES",0,b,"MY_TIMETABLE",0,l,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,u,"RAISE_REQUEST",0,o,"REQUEST_PLACE",0,a,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,d])}]);