(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54616,e=>{"use strict";var t=e.i(12598),s=e.i(71645),i=e.i(19273),r=e.i(15823),a=e.i(40143),n=e.i(14272),l=class extends r.Subscribable{#e;#t=void 0;#s;#i;constructor(e,t){super(),this.#e=e,this.setOptions(t),this.bindMethods(),this.#r()}bindMethods(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)}setOptions(e){let t=this.options;this.options=this.#e.defaultMutationOptions(e),(0,i.shallowEqualObjects)(this.options,t)||this.#e.getMutationCache().notify({type:"observerOptionsUpdated",mutation:this.#s,observer:this}),t?.mutationKey&&this.options.mutationKey&&(0,i.hashKey)(t.mutationKey)!==(0,i.hashKey)(this.options.mutationKey)?this.reset():this.#s?.state.status==="pending"&&this.#s.setOptions(this.options)}onSubscribe(){1===this.listeners.size&&this.#s&&(this.#s.addObserver(this),this.#r())}onUnsubscribe(){this.hasListeners()||this.#s?.removeObserver(this)}onMutationUpdate(e){this.#r(),this.#a(e)}getCurrentResult(){return this.#t}reset(){this.#s?.removeObserver(this),this.#s=void 0,this.#r(),this.#a()}mutate(e,t){return this.#i=t,this.#s?.removeObserver(this),this.#s=this.#e.getMutationCache().build(this.#e,this.options),this.#s.addObserver(this),this.#s.execute(e)}#r(){let e=this.#s?.state??(0,n.getDefaultState)();this.#t={...e,isPending:"pending"===e.status,isSuccess:"success"===e.status,isError:"error"===e.status,isIdle:"idle"===e.status,mutate:this.mutate,reset:this.reset}}#a(e){a.notifyManager.batch(()=>{if(this.#i&&this.hasListeners()){let t=this.#t.variables,s=this.#t.context,i={client:this.#e,meta:this.options.meta,mutationKey:this.options.mutationKey};if(e?.type==="success"){try{this.#i.onSuccess?.(e.data,t,s,i)}catch(e){Promise.reject(e)}try{this.#i.onSettled?.(e.data,null,t,s,i)}catch(e){Promise.reject(e)}}else if(e?.type==="error"){try{this.#i.onError?.(e.error,t,s,i)}catch(e){Promise.reject(e)}try{this.#i.onSettled?.(void 0,e.error,t,s,i)}catch(e){Promise.reject(e)}}}this.listeners.forEach(e=>{e(this.#t)})})}};e.s(["useMutation",0,function(e,r){let n=(0,t.useQueryClient)(r),[o]=s.useState(()=>new l(n,e));s.useEffect(()=>{o.setOptions(e)},[o,e]);let d=s.useSyncExternalStore(s.useCallback(e=>o.subscribe(a.notifyManager.batchCalls(e)),[o]),()=>o.getCurrentResult(),()=>o.getCurrentResult()),u=s.useCallback((...e)=>{o.mutate(e[0],e[1]).catch(i.noop)},[o]);if(d.error&&(0,i.shouldThrowError)(o.options.throwOnError,[d.error]))throw d.error;return{...d,mutate:u,mutateAsync:d.mutate}}],54616)},95468,e=>{"use strict";let t=(0,e.i(75254).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,t],95468)},37727,e=>{"use strict";let t=(0,e.i(75254).default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);e.s(["X",0,t],37727)},21840,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(54616),r=e.i(12598),a=e.i(32102),n=e.i(43531),l=e.i(37727),o=e.i(86311),d=e.i(64030),u=e.i(95468),c=e.i(77326),h=e.i(13927),m=e.i(30224),p=e.i(31502),f=e.i(17658),_=e.i(27389),y=e.i(75379);let v={question:"Question",private_lesson:"Private lesson",medical_update:"Medical update",event_interest:"Event",absence:"Absence",other:"Other"};function b({request:e,onClose:a}){let{session:n}=(0,p.useSession)(),l=(0,r.useQueryClient)(),[o,d]=s.useState(""),[c,h]=s.useState(!1),y=(0,i.useMutation)({mutationFn:async()=>(0,m.runAs)(n,t=>t(_.ANSWER_REQUEST,[e.id,o.trim()])),onSuccess:()=>{h(!0),l.invalidateQueries({queryKey:["db"]})}});return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:a,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"ans-t",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:c?(0,t.jsxs)("div",{className:"py-4 text-center",children:[(0,t.jsx)("span",{className:"mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive","aria-hidden":!0,children:(0,t.jsx)(u.CheckCircle2,{className:"size-5"})}),(0,t.jsx)("p",{id:"ans-t",className:"font-medium",children:"Replied"}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:"The family sees your answer in their hub."}),(0,t.jsx)(f.Button,{className:"mt-4 w-full",variant:"primary",onClick:a,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("h2",{id:"ans-t",className:"text-[17px] font-semibold tracking-tight",children:"Reply"}),(0,t.jsx)("p",{className:"mt-0.5 text-sm text-ink-2",children:e.subject}),(0,t.jsx)("p",{className:"mt-2 rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm text-ink-2",children:e.body}),(0,t.jsx)("textarea",{value:o,onChange:e=>d(e.target.value),rows:4,"aria-label":"Your reply",placeholder:"Write your reply…",className:"mt-3 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                         focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12"}),y.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(f.ErrorState,{error:y.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(f.Button,{className:"flex-1",onClick:a,children:"Cancel"}),(0,t.jsx)(f.Button,{className:"flex-1",variant:"primary",loading:y.isPending,disabled:o.trim().length<2,onClick:()=>y.mutate(),children:"Send reply"})]})]})})})}e.s(["default",0,function(){let{session:e}=(0,p.useSession)(),u=(0,r.useQueryClient)(),g=(0,h.useRows)(["pending-requests"],_.PENDING_REQUESTS),R=(0,h.useRows)(["pending-entries"],_.PENDING_ENTRIES),[x,E]=s.useState(null),S=(0,i.useMutation)({mutationFn:async t=>(0,m.runAs)(e,e=>e(_.DECIDE_ENTRY,[t.id,t.status])),onSuccess:()=>u.invalidateQueries({queryKey:["db"]})}),j=(g.data?.length??0)+(R.data?.length??0);return(0,t.jsxs)(c.Shell,{title:"Requests",allow:["owner","admin"],subtitle:j?`${j} waiting on you`:"Nothing waiting",children:[(0,t.jsxs)("div",{className:"mx-auto max-w-3xl space-y-5",children:[(0,t.jsxs)(f.Card,{children:[(0,t.jsx)(f.CardHeader,{title:"Event and competition entries",subtitle:"Nothing is in the diary until you confirm it"}),R.isLoading&&(0,t.jsx)("div",{className:"space-y-2 p-4",children:[0,1].map(e=>(0,t.jsx)(f.Skeleton,{className:"h-14"},e))}),R.error&&(0,t.jsx)("div",{className:"p-4",children:(0,t.jsx)(f.ErrorState,{error:R.error})}),R.data?.length===0&&!R.isLoading&&(0,t.jsx)(f.EmptyState,{icon:(0,t.jsx)(d.Trophy,{className:"size-5"}),title:"No entries waiting",body:"Requests from families appear here."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:R.data?.map(e=>(0,t.jsxs)("li",{className:"flex flex-wrap items-center gap-3 px-4 py-3",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"block truncate font-medium",children:e.student_name}),(0,t.jsxs)("span",{className:"block truncate text-[13px] text-ink-2",children:[e.event_title," · ",(0,y.dateLong)(e.starts_at),", ",(0,y.time)(e.starts_at)]})]}),(0,t.jsxs)("span",{className:"flex shrink-0 gap-2",children:[(0,t.jsxs)(f.Button,{size:"sm",variant:"secondary",loading:S.isPending,onClick:()=>S.mutate({id:e.id,status:"declined"}),children:[(0,t.jsx)(l.X,{className:"size-4","aria-hidden":!0})," Decline"]}),(0,t.jsxs)(f.Button,{size:"sm",variant:"primary",loading:S.isPending,onClick:()=>S.mutate({id:e.id,status:"confirmed"}),children:[(0,t.jsx)(n.Check,{className:"size-4","aria-hidden":!0})," Confirm"]})]})]},e.id))})]}),(0,t.jsxs)(f.Card,{children:[(0,t.jsx)(f.CardHeader,{title:"Questions from families"}),g.isLoading&&(0,t.jsx)("div",{className:"space-y-2 p-4",children:[0,1].map(e=>(0,t.jsx)(f.Skeleton,{className:"h-20"},e))}),g.data?.length===0&&!g.isLoading&&(0,t.jsx)(f.EmptyState,{icon:(0,t.jsx)(a.Inbox,{className:"size-5"}),title:"Nothing unanswered",body:"Questions from parents and students land here."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:g.data?.map(e=>(0,t.jsxs)("li",{className:"px-4 py-3",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)(f.Badge,{tone:"medical_update"===e.kind?"critical":"neutral",children:v[e.kind]??e.kind}),(0,t.jsxs)("span",{className:"text-[12.5px] text-ink-3",children:[e.family_name,e.student_name?` \xb7 about ${e.student_name}`:""]}),(0,t.jsx)("span",{className:"ml-auto text-[12.5px] text-ink-3",children:(0,y.relativeDay)(e.created_at)})]}),(0,t.jsx)("p",{className:"mt-1.5 font-medium",children:e.subject}),(0,t.jsx)("p",{className:"mt-0.5 text-sm text-ink-2",children:e.body}),(0,t.jsxs)(f.Button,{size:"sm",className:"mt-2.5",onClick:()=>E(e),children:[(0,t.jsx)(o.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply"]})]},e.id))})]})]}),x&&(0,t.jsx)(b,{request:x,onClose:()=>E(null)})]})}])},13927,e=>{"use strict";let t;var s=e.i(12598),i=e.i(71645);let r=i.createContext(!1);r.Provider,e.i(43476);let a=i.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),l=e.i(40143),o=e.i(80166),d=e.i(73911),u=e.i(15823),c=e.i(75555),h=e.i(86491),m=class extends u.Subscribable{#e;#n=void 0;#l=void 0;#t=void 0;#o;#d;#u;#c;#h;#m;#p;#f;#_;#y=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#u=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#n.addObserver(this),p(this.#n,this.options)?this.#v():this.updateResult(),this.#b())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#n,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#n,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#g(),this.#R(),this.#n.removeObserver(this)}setOptions(e){let t=this.options,s=this.#n;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#n))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#x(),this.#n.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#n,observer:this});let i=this.hasListeners();i&&_(this.#n,s,this.options,t)&&this.#v(),this.updateResult(),i&&(this.#n!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#n)!==(0,n.resolveQueryBoolean)(t.enabled,this.#n)||(0,n.resolveStaleTime)(this.options.staleTime,this.#n)!==(0,n.resolveStaleTime)(t.staleTime,this.#n))&&this.#E();let r=this.#S();i&&(this.#n!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#n)!==(0,n.resolveQueryBoolean)(t.enabled,this.#n)||r!==this.#_)&&this.#j(r)}getOptimisticResult(e){var t,s;let i=this.#e.getQueryCache().build(this.#e,e),r=this.createResult(i,e);return t=this,s=r,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#t=r,this.#d=this.options,this.#o=this.#n.state),r}getCurrentResult(){return this.#t}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#y.add(e)}getCurrentQuery(){return this.#n}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),i=this.#e.getQueryCache().build(this.#e,s),r=()=>{},a=new Promise(e=>{t=e,r=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===i.queryHash&&void 0!==i.state.data&&(r(),e(this.createResult(i,s)))})});return Promise.race([i.fetch().then(()=>{let e=this.createResult(i,s);return t?.(e),e}).finally(()=>{r()}),a])}fetch(e){return this.#v({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#t))}#v(e){this.#x();let t=this.#n.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#E(){this.#g();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#n);if(d.environmentManager.isServer()||this.#t.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#t.dataUpdatedAt,e)+1;this.#p=o.timeoutManager.setTimeout(()=>{this.#t.isStale||this.updateResult()},t)}#S(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#n):this.options.refetchInterval)??!1}#j(e){this.#R(),this.#_=e,!d.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#n)&&(0,n.isValidTimeout)(this.#_)&&0!==this.#_&&(this.#f=o.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||c.focusManager.isFocused())&&this.#v()},this.#_))}#b(){this.#E(),this.#j(this.#S())}#g(){void 0!==this.#p&&(o.timeoutManager.clearTimeout(this.#p),this.#p=void 0)}#R(){void 0!==this.#f&&(o.timeoutManager.clearInterval(this.#f),this.#f=void 0)}createResult(e,t){let s,i=this.#n,r=this.options,a=this.#t,l=this.#o,o=this.#d,d=e!==i?e.state:this.#l,{state:u}=e,c={...u},m=!1;if(t._optimisticResults){let s=this.hasListeners(),a=!s&&p(e,t),n=s&&_(e,i,t,r);(a||n)&&(c={...c,...(0,h.fetchState)(u.data,e.options)}),"isRestoring"===t._optimisticResults&&(c.fetchStatus="idle")}let{error:f,errorUpdatedAt:v,status:b}=c;s=c.data;let g=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===b){let e;a?.isPlaceholderData&&t.placeholderData===o?.placeholderData?(e=a.data,g=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#m?.state.data,this.#m):t.placeholderData,void 0!==e&&(b="success",s=(0,n.replaceData)(a?.data,e,t),m=!0)}if(t.select&&void 0!==s&&!g)if(a&&s===l?.data&&t.select===this.#c)s=this.#h;else try{this.#c=t.select,s=t.select(s),s=(0,n.replaceData)(a?.data,s,t),this.#h=s,this.#u=null}catch(e){this.#u=e}else void 0===s&&(this.#u=null);this.#u&&(f=this.#u,s=this.#h,v=Date.now(),b="error",m=!1);let R="fetching"===c.fetchStatus,x="pending"===b,E="error"===b,S=x&&R,j=void 0!==s;return{status:b,fetchStatus:c.fetchStatus,isPending:x,isSuccess:"success"===b,isError:E,isInitialLoading:S,isLoading:S,data:s,dataUpdatedAt:c.dataUpdatedAt,error:f,errorUpdatedAt:v,failureCount:c.fetchFailureCount,failureReason:c.fetchFailureReason,errorUpdateCount:c.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:c.dataUpdateCount>d.dataUpdateCount||c.errorUpdateCount>d.errorUpdateCount,isFetching:R,isRefetching:R&&!x,isLoadingError:E&&!j,isPaused:"paused"===c.fetchStatus,isPlaceholderData:m,isRefetchError:E&&j,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#t,t=this.createResult(this.#n,this.options);if(this.#o=this.#n.state,this.#d=this.options,void 0!==this.#o.data&&(this.#m=this.#n),(0,n.shallowEqualObjects)(t,e))return;this.#t=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#y.size)return!0;let i=new Set(s??this.#y);return this.options.throwOnError&&i.add("error"),Object.keys(this.#t).some(t=>this.#t[t]!==e[t]&&i.has(t))};this.#a({listeners:s()})}#x(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#n)return;let t=this.#n;this.#n=e,this.#l=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#b()}#a(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#t)}),this.#e.getQueryCache().notify({query:this.#n,type:"observerResultsUpdated"})})}};function p(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let i="function"==typeof s?s(e):s;return"always"===i||!1!==i&&y(e,t)}return!1}function _(e,t,s,i){return(e!==t||!1===(0,n.resolveQueryBoolean)(i.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}var v=e.i(30224),b=e.i(31502);function g(e,t,o=[],d){let{session:u}=(0,b.useSession)();return function(e,t,o){let d,u=i.useContext(r),c=i.useContext(a),h=(0,s.useQueryClient)(o),m=h.defaultQueryOptions(e),p=h.getQueryCache().get(m.queryHash),f=!1!==e.subscribed;if(m._optimisticResults=u?"isRestoring":f?"optimistic":void 0,m.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=m.staleTime;m.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof m.gcTime&&(m.gcTime=Math.max(m.gcTime,1e3))}d=p?.state.error&&"function"==typeof m.throwOnError?(0,n.shouldThrowError)(m.throwOnError,[p.state.error,p]):m.throwOnError,(m.suspense||d)&&!c.isReset()&&(m.retryOnMount=!1),i.useEffect(()=>{c.clearReset()},[c]);let[_]=i.useState(()=>new t(h,m)),y=_.getOptimisticResult(m),v=!u&&f;if(i.useSyncExternalStore(i.useCallback(e=>{let t=v?_.subscribe(l.notifyManager.batchCalls(e)):n.noop;return _.updateResult(),t},[_,v]),()=>_.getCurrentResult(),()=>_.getCurrentResult()),i.useEffect(()=>{_.setOptions(m)},[m,_]),m?.suspense&&y.isPending)throw _.fetchOptimistic(m).catch(()=>{c.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:i,suspense:r})=>e.isError&&!t.isReset()&&!e.isFetching&&i&&(r&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,i])))({result:y,errorResetBoundary:c,throwOnError:m.throwOnError,query:p,suspense:m.suspense}))throw y.error;return m.notifyOnChangeProps?y:_.trackResult(y)}({queryKey:["db",u?.userId??"anon",...e],queryFn:()=>(0,v.readAs)(u,t,o),staleTime:15e3,...d},m,void 0)}e.s(["useRow",0,function(e,t,s=[]){let i=g(e,t,s);return{...i,data:i.data?.[0]}},"useRows",0,g],13927)},27389,e=>{"use strict";let t=`
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
 order by c.day_of_week, c.start_time`;e.s(["ANSWER_REQUEST",0,m,"ASSIGN_RESOURCE_TO_CLASS",0,y,"CLASS_DETAIL",0,p,"CLASS_RESOURCES",0,f,"CREATE_RESOURCE",0,_,"DECIDE_ENTRY",0,h,"DELETE_RESOURCE",0,v,"EVENTS",0,r,"MY_ASSESSMENTS",0,i,"MY_REQUESTS",0,n,"MY_TEACHING_CLASSES",0,b,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,u,"RAISE_REQUEST",0,l,"REQUEST_PLACE",0,a,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,d])}]);