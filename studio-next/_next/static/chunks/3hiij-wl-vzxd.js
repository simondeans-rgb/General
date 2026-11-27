(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var i=e.i(12598),s=e.i(71645);let a=s.createContext(!1);a.Provider,e.i(43476);let n=s.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var r=e.i(19273),l=e.i(40143),d=e.i(80166),o=e.i(73911),c=e.i(15823),u=e.i(75555),m=e.i(86491),_=class extends c.Subscribable{#e;#t=void 0;#i=void 0;#s=void 0;#a;#n;#r;#l;#d;#o;#c;#u;#m;#_=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#r=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),h(this.#t,this.options)?this.#h():this.updateResult(),this.#f())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,i=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,r.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,r.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let s=this.hasListeners();s&&p(this.#t,i,this.options,t)&&this.#h(),this.updateResult(),s&&(this.#t!==i||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||(0,r.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,r.resolveStaleTime)(t.staleTime,this.#t))&&this.#g();let a=this.#x();s&&(this.#t!==i||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||a!==this.#m)&&this.#w(a)}getOptimisticResult(e){var t,i;let s=this.#e.getQueryCache().build(this.#e,e),a=this.createResult(s,e);return t=this,i=a,(0,r.shallowEqualObjects)(t.getCurrentResult(),i)||(this.#s=a,this.#n=this.options,this.#a=this.#t.state),a}getCurrentResult(){return this.#s}trackResult(e,t){return new Proxy(e,{get:(e,i)=>(this.trackProp(i),t?.(i),Reflect.get(e,i))})}trackProp(e){this.#_.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,i=this.#e.defaultQueryOptions(e),s=this.#e.getQueryCache().build(this.#e,i),a=()=>{},n=new Promise(e=>{t=e,a=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===s.queryHash&&void 0!==s.state.data&&(a(),e(this.createResult(s,i)))})});return Promise.race([s.fetch().then(()=>{let e=this.createResult(s,i);return t?.(e),e}).finally(()=>{a()}),n])}fetch(e){return this.#h({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#s))}#h(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(r.noop)),t}#g(){this.#p();let e=(0,r.resolveStaleTime)(this.options.staleTime,this.#t);if(o.environmentManager.isServer()||this.#s.isStale||!(0,r.isValidTimeout)(e))return;let t=(0,r.timeUntilStale)(this.#s.dataUpdatedAt,e)+1;this.#c=d.timeoutManager.setTimeout(()=>{this.#s.isStale||this.updateResult()},t)}#x(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#w(e){this.#y(),this.#m=e,!o.environmentManager.isServer()&&!1!==(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,r.isValidTimeout)(this.#m)&&0!==this.#m&&(this.#u=d.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#h()},this.#m))}#f(){this.#g(),this.#w(this.#x())}#p(){void 0!==this.#c&&(d.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(d.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let i,s=this.#t,a=this.options,n=this.#s,l=this.#a,d=this.#n,o=e!==s?e.state:this.#i,{state:c}=e,u={...c},_=!1;if(t._optimisticResults){let i=this.hasListeners(),n=!i&&h(e,t),r=i&&p(e,s,t,a);(n||r)&&(u={...u,...(0,m.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:b,status:g}=u;i=u.data;let x=!1;if(void 0!==t.placeholderData&&void 0===i&&"pending"===g){let e;n?.isPlaceholderData&&t.placeholderData===d?.placeholderData?(e=n.data,x=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#o?.state.data,this.#o):t.placeholderData,void 0!==e&&(g="success",i=(0,r.replaceData)(n?.data,e,t),_=!0)}if(t.select&&void 0!==i&&!x)if(n&&i===l?.data&&t.select===this.#l)i=this.#d;else try{this.#l=t.select,i=t.select(i),i=(0,r.replaceData)(n?.data,i,t),this.#d=i,this.#r=null}catch(e){this.#r=e}else void 0===i&&(this.#r=null);this.#r&&(f=this.#r,i=this.#d,b=Date.now(),g="error",_=!1);let w="fetching"===u.fetchStatus,v="pending"===g,N="error"===g,E=v&&w,j=void 0!==i;return{status:g,fetchStatus:u.fetchStatus,isPending:v,isSuccess:"success"===g,isError:N,isInitialLoading:E,isLoading:E,data:i,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>o.dataUpdateCount||u.errorUpdateCount>o.errorUpdateCount,isFetching:w,isRefetching:w&&!v,isLoadingError:N&&!j,isPaused:"paused"===u.fetchStatus,isPlaceholderData:_,isRefetchError:N&&j,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,r.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#s,t=this.createResult(this.#t,this.options);if(this.#a=this.#t.state,this.#n=this.options,void 0!==this.#a.data&&(this.#o=this.#t),(0,r.shallowEqualObjects)(t,e))return;this.#s=t;let i=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,i="function"==typeof t?t():t;if("all"===i||!i&&!this.#_.size)return!0;let s=new Set(i??this.#_);return this.options.throwOnError&&s.add("error"),Object.keys(this.#s).some(t=>this.#s[t]!==e[t]&&s.has(t))};this.#v({listeners:i()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#i=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#f()}#v(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#s)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function h(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,r.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,i){if(!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,r.resolveStaleTime)(t.staleTime,e)){let s="function"==typeof i?i(e):i;return"always"===s||!1!==s&&y(e,t)}return!1}function p(e,t,i,s){return(e!==t||!1===(0,r.resolveQueryBoolean)(s.enabled,e))&&(!i.suspense||"error"!==e.state.status)&&y(e,i)}function y(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,r.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,d){let o,c=s.useContext(a),u=s.useContext(n),m=(0,i.useQueryClient)(d),_=m.defaultQueryOptions(e),h=m.getQueryCache().get(_.queryHash),f=!1!==e.subscribed;if(_._optimisticResults=c?"isRestoring":f?"optimistic":void 0,_.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=_.staleTime;_.staleTime="function"==typeof t?(...i)=>e(t(...i)):e(t),"number"==typeof _.gcTime&&(_.gcTime=Math.max(_.gcTime,1e3))}o=h?.state.error&&"function"==typeof _.throwOnError?(0,r.shouldThrowError)(_.throwOnError,[h.state.error,h]):_.throwOnError,(_.suspense||o)&&!u.isReset()&&(_.retryOnMount=!1),s.useEffect(()=>{u.clearReset()},[u]);let[p]=s.useState(()=>new t(m,_)),y=p.getOptimisticResult(_),b=!c&&f;if(s.useSyncExternalStore(s.useCallback(e=>{let t=b?p.subscribe(l.notifyManager.batchCalls(e)):r.noop;return p.updateResult(),t},[p,b]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),s.useEffect(()=>{p.setOptions(_)},[_,p]),_?.suspense&&y.isPending)throw p.fetchOptimistic(_).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:i,query:s,suspense:a})=>e.isError&&!t.isReset()&&!e.isFetching&&s&&(a&&void 0===e.data||(0,r.shouldThrowError)(i,[e.error,s])))({result:y,errorResetBoundary:u,throwOnError:_.throwOnError,query:h,suspense:_.suspense}))throw y.error;return _.notifyOnChangeProps?y:p.trackResult(y)}(e,_,t)}],66027)},72520,e=>{"use strict";let t=(0,e.i(75254).default)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);e.s(["ArrowRight",0,t],72520)},43531,e=>{"use strict";let t=(0,e.i(75254).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["Check",0,t],43531)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},95227,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(22016),a=e.i(72520),n=e.i(77326),r=e.i(13927),l=e.i(17658),d=e.i(21011),o=e.i(50293),c=e.i(75379),u=e.i(45060);function m(){let[e,s]=i.useMemo(()=>(0,c.dayRange)(0),[]),a=(0,r.useRows)(["sessions",e],d.SESSIONS_BETWEEN,[e,s]),o=(0,r.useRow)(["term-now"],d.TERM_NOW).data,u=(a.data??[]).filter(e=>"cancelled"!==e.status).find(e=>new Date(e.ends_at)>new Date)??null;return(0,t.jsx)(n.Shell,{title:"Today",allow:["owner","admin"],subtitle:(0,t.jsxs)("span",{className:"flex items-center gap-2",children:[(0,c.dateLong)(new Date),o&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("span",{"aria-hidden":!0,children:"·"}),(0,t.jsxs)("span",{children:[o.name,", week ",o.week," of ",o.weeks]}),(0,t.jsx)(l.Beats,{value:o.week,max:o.weeks,size:"sm",label:`Week ${o.week} of ${o.weeks}`,className:"hidden sm:inline-flex"})]})]}),children:(0,t.jsxs)("div",{className:"mx-auto grid max-w-[1240px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",children:[(0,t.jsx)("div",{className:"min-w-0 lg:col-start-1 lg:row-start-1",children:(0,t.jsx)(_,{s:u,loading:a.isLoading})}),(0,t.jsxs)("div",{className:"min-w-0 space-y-10 lg:col-start-2 lg:row-span-2 lg:row-start-1",children:[(0,t.jsx)(f,{}),(0,t.jsx)(p,{})]}),(0,t.jsx)("div",{className:"min-w-0 lg:col-start-1 lg:row-start-2",children:(0,t.jsx)(h,{rows:a.data,loading:a.isLoading,error:a.error,retry:()=>a.refetch()})}),(0,t.jsxs)("div",{className:"grid gap-x-12 gap-y-8 border-t border-line pt-8 md:grid-cols-3 lg:col-span-2 lg:row-start-3",children:[(0,t.jsx)(b,{}),(0,t.jsx)(g,{}),(0,t.jsx)(x,{})]})]})})}function _({s:e,loading:i}){if(i)return(0,t.jsx)(l.Skeleton,{className:"h-36"});if(!e)return(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"label",children:"Next"}),(0,t.jsx)("p",{className:"mt-2 font-display text-[28px] leading-tight",children:"No more classes today"}),(0,t.jsx)("p",{className:"mt-1 text-ink-3",children:"Tomorrow’s timetable is on the schedule."})]});let a=Math.round((new Date(e.starts_at).getTime()-Date.now())/6e4),n=a>0?a<90?`in ${a} min`:`at ${(0,c.time)(e.starts_at)}`:"on now";return(0,t.jsxs)("section",{"aria-labelledby":"next-h",className:"flex flex-col gap-x-8 gap-y-3 sm:flex-row sm:items-end",children:[(0,t.jsxs)("div",{children:[(0,t.jsxs)("p",{className:"label text-accent-text",children:["Next · ",n]}),(0,t.jsx)("p",{id:"next-h",className:"display-xl mt-1 text-[72px] text-ink sm:text-[88px]",children:(0,c.time)(e.starts_at)})]}),(0,t.jsxs)("div",{className:"min-w-0 flex-1 sm:pb-1.5",children:[(0,t.jsx)("p",{className:"font-display text-[24px] leading-tight",children:e.name}),(0,t.jsx)("p",{className:"mt-1 text-[14px] text-ink-3",children:[e.teacher,e.room,e.location].filter(Boolean).join(" · ")}),(0,t.jsxs)("p",{className:"mt-1 flex items-center gap-2 text-[14px] text-ink-2",children:[(0,t.jsx)(l.Beats,{value:e.enrolled,max:e.capacity,label:`${e.enrolled} of ${e.capacity} places`}),(0,t.jsxs)("span",{className:"tnum",children:[e.enrolled," of ",e.capacity,e.trials?` \xb7 ${e.trials} trial${1===e.trials?"":"s"}`:""]})]}),(0,t.jsxs)("div",{className:"mt-4 flex flex-wrap gap-2",children:[(0,t.jsx)(s.default,{href:`/teach/register/?session=${e.id}`,children:(0,t.jsx)(l.Button,{variant:"primary",tabIndex:-1,children:"Open register"})}),(0,t.jsx)(s.default,{href:"/schedule",children:(0,t.jsx)(l.Button,{tabIndex:-1,children:"Timetable"})})]})]})]})}function h({rows:e,loading:i,error:a,retry:n}){return(0,t.jsxs)("section",{children:[(0,t.jsx)(l.SectionHead,{title:e?`Today \xb7 ${e.length} class${1===e.length?"":"es"}`:"Today",meta:"Booked of capacity",href:"/schedule",link:"Full schedule"}),i&&(0,t.jsx)("div",{className:"space-y-3 pt-3",children:[0,1,2].map(e=>(0,t.jsx)(l.Skeleton,{className:"h-12"},e))}),null!=a&&(0,t.jsx)(l.ErrorState,{error:a,onRetry:n}),e?.length===0&&(0,t.jsx)(l.EmptyState,{title:"Nothing on today",body:"Enjoy the quiet. Tomorrow’s classes are on the schedule."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:e?.map(e=>{let i="cancelled"===e.status;return(0,t.jsx)("li",{children:(0,t.jsxs)(s.default,{href:`/teach/register/?session=${e.id}`,className:"grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 py-3 hover:bg-surface-2/60 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto_3.5rem]",children:[(0,t.jsx)("span",{className:(0,u.cn)("font-display text-[19px] tnum",i&&"text-ink-3 line-through"),children:(0,c.time)(e.starts_at)}),(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsx)("span",{className:(0,u.cn)("block truncate font-semibold",i&&"text-ink-3"),children:e.name}),(0,t.jsx)("span",{className:"block truncate text-[13px] text-ink-3",children:i?(0,t.jsxs)("span",{className:"font-semibold uppercase tracking-wide text-critical",children:["Cancelled",e.cancel_reason?` \xb7 ${e.cancel_reason}`:""]}):[e.covered?`${e.teacher} (cover)`:e.teacher,e.room].filter(Boolean).join(" · ")})]}),!i&&(0,t.jsx)(l.Beats,{value:e.enrolled,max:e.capacity,label:`${e.enrolled} of ${e.capacity} places`,className:"hidden sm:inline-flex"}),(0,t.jsx)("span",{className:"tnum text-right text-[13.5px] text-ink-2",children:i?"":`${e.enrolled}/${e.capacity}`})]})},e.id)})})]})}function f(){let e=(0,r.useRow)(["att-pay"],d.ATTENTION_PAYMENTS),i=(0,r.useRows)(["att-cap"],d.ATTENTION_CAPACITY),n=(0,r.useRows)(["att-trials"],d.ATTENTION_TRIALS),o=(0,r.useRows)(["att-lapsed"],d.ATTENTION_LAPSED),m=(0,r.useRow)(["att-requests"],d.ATTENTION_REQUESTS),_=(0,r.useRow)(["att-messages"],d.ATTENTION_MESSAGES),h=e.isLoading||i.isLoading||n.isLoading||o.isLoading||m.isLoading||_.isLoading,f=[],p=m.data;if(p&&p.medical_updates>0&&f.push({key:"med",n:p.medical_updates,tone:"critical",href:"/requests",action:"Review",headline:`Medical update${1===p.medical_updates?"":"s"} to acknowledge`,detail:"Teachers see the change once you record it"}),e.data&&e.data.failed>0&&f.push({key:"pay",n:e.data.failed,tone:"critical",href:"/billing",action:"Retry",headline:`Card payment${1===e.data.failed?"":"s"} failed`,detail:`${(0,c.money)(e.data.outstanding_minor)} outstanding in all`}),_.data&&_.data.awaiting>0&&f.push({key:"msg",n:_.data.awaiting,tone:"ink",href:"/inbox",action:"Reply",headline:`Famil${1===_.data.awaiting?"y":"ies"} waiting for a reply`,detail:(_.data.names??"")+(_.data.awaiting>3?"…":"")}),p&&(p.open_requests>0||p.pending_entries>0)&&f.push({key:"req",n:p.open_requests+p.pending_entries,tone:"ink",href:"/requests",action:"Open",headline:"Requests to answer",detail:[p.pending_entries?`${p.pending_entries} event entr${1===p.pending_entries?"y":"ies"}`:"",p.open_requests?`${p.open_requests} question${1===p.open_requests?"":"s"}`:""].filter(Boolean).join(" · ")}),n.data?.length&&f.push({key:"trial",n:n.data.length,tone:"ink",href:"/enrolment",action:"Follow up",headline:"Trials attended, not enrolled",detail:n.data.slice(0,3).map(e=>e.child_name).join(", ")+(n.data.length>3?"…":"")}),i.data?.filter(e=>e.waiting>0).forEach(e=>f.push({key:e.id,n:e.waiting,tone:"caution",href:"/classes",action:"Waiting list",headline:`Waiting for ${e.name}`,detail:`Class full \xb7 ${e.enrolled} of ${e.capacity}`})),o.data?.length){let e=new Set(o.data.map(e=>e.id)).size;f.push({key:"lapsed",n:e,tone:"caution",href:"/people?filter=lapsed",action:"See who",headline:"Missed three classes in a row",detail:o.data.slice(0,3).map(e=>`${e.first_name} ${e.last_name}`).join(", ")+(e>3?"…":"")})}return(0,t.jsxs)("section",{children:[(0,t.jsx)(l.SectionHead,{title:"Needs attention",meta:h?void 0:f.length?`${f.length} thing${1===f.length?"":"s"}`:void 0}),h&&(0,t.jsx)("div",{className:"space-y-3 pt-3",children:[0,1,2].map(e=>(0,t.jsx)(l.Skeleton,{className:"h-12"},e))}),!h&&0===f.length&&(0,t.jsx)(l.EmptyState,{title:"Nothing needs you",body:"No failed payments, no one waiting for a reply, and everyone is turning up."}),(0,t.jsx)("ul",{className:"on-count divide-y divide-line",children:f.map(e=>(0,t.jsx)("li",{children:(0,t.jsxs)(s.default,{href:e.href,className:"group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3",children:[(0,t.jsx)("span",{className:(0,u.cn)("font-display text-[28px] leading-none tnum","critical"===e.tone?"text-critical":"caution"===e.tone?"text-caution":"text-ink"),children:e.n}),(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsxs)("span",{className:"block font-semibold leading-snug",children:[e.headline,"critical"===e.tone&&(0,t.jsx)("span",{className:"sr-only",children:" (urgent)"})]}),e.detail&&(0,t.jsx)("span",{className:"block truncate text-[13px] text-ink-3",children:e.detail})]}),(0,t.jsxs)("span",{className:"flex items-center gap-1 text-[13px] font-semibold text-accent-text group-hover:underline",children:[e.action,(0,t.jsx)(a.ArrowRight,{className:"size-3.5","aria-hidden":!0})]})]})},e.key))})]})}function p(){let e=(0,r.useRow)(["billing-summary"],o.SUMMARY).data;return(0,t.jsxs)("section",{children:[(0,t.jsx)(l.SectionHead,{title:"Money",href:"/billing",link:"Billing"}),e?(0,t.jsxs)("dl",{className:"grid grid-cols-2 gap-6 pt-3",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"label",children:"Outstanding"}),(0,t.jsx)("dd",{className:"stat-number mt-1 text-[30px] leading-none",children:(0,c.money)(e.outstanding_minor)}),(0,t.jsxs)("dd",{className:"mt-1 text-[13px] text-ink-3",children:[e.owing_families," famil",1===e.owing_families?"y":"ies",Number(e.overdue_minor)>0?` \xb7 ${(0,c.money)(e.overdue_minor)} overdue`:""]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"label",children:"Collected, 30 days"}),(0,t.jsx)("dd",{className:"stat-number mt-1 text-[30px] leading-none",children:(0,c.money)(e.collected_30d_minor)}),(0,t.jsx)("dd",{className:"mt-1 text-[13px] text-ink-3",children:"Card, transfer and cash"})]})]}):(0,t.jsx)(l.Skeleton,{className:"mt-3 h-16"})]})}function y({title:e,rows:i,empty:a,render:n,href:r,link:d}){return(0,t.jsxs)("section",{className:"min-w-0",children:[(0,t.jsxs)("div",{className:"mb-1 flex items-baseline gap-3",children:[(0,t.jsx)("h2",{className:"section-title flex-1",children:e}),r&&(0,t.jsx)(s.default,{href:r,className:"text-[13px] font-semibold text-accent-text hover:underline",children:d})]}),i.isLoading&&(0,t.jsx)(l.Skeleton,{className:"mt-2 h-20"}),i.data?.length===0&&(0,t.jsx)("p",{className:"py-3 text-sm text-ink-3",children:a}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:i.data?.slice(0,4).map((e,i)=>(0,t.jsx)("li",{className:"py-2.5",children:n(e)},i))})]})}function b(){let e=(0,r.useRows)(["recent-enrolments"],d.RECENT_ENROLMENTS);return(0,t.jsx)(y,{title:"New in class",rows:e,empty:"No new enrolments yet.",render:e=>(0,t.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsxs)("span",{className:"font-medium",children:[e.first_name," ",e.last_name]}),(0,t.jsx)("span",{className:"block truncate text-[13px] text-ink-3",children:e.class_name})]}),(0,t.jsx)("span",{className:"shrink-0 text-[12.5px] text-ink-3",children:(0,c.relativeDay)(e.started_on)})]})})}function g(){let e=(0,r.useRows)(["upcoming-trials"],d.UPCOMING_TRIALS);return(0,t.jsx)(y,{title:"Trials coming up",rows:e,href:"/enrolment",link:"Enrolment",empty:"No trials booked.",render:e=>(0,t.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsx)("span",{className:"font-medium",children:e.who}),(0,t.jsx)("span",{className:"block truncate text-[13px] text-ink-3",children:e.class_name})]}),(0,t.jsx)("span",{className:"shrink-0 text-[12.5px] text-ink-3",children:e.starts_at?`${(0,c.relativeDay)(e.starts_at)} ${(0,c.time)(e.starts_at)}`:"Not booked"})]})})}function x(){let e=(0,r.useRows)(["recent-messages"],d.RECENT_MESSAGES);return(0,t.jsx)(y,{title:"Recent messages",rows:e,href:"/inbox",link:"Messages",empty:"No messages yet.",render:e=>(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,t.jsx)("span",{className:"min-w-0 truncate font-medium",children:e.subject||e.body}),(0,t.jsx)("span",{className:"shrink-0 text-[12.5px] text-ink-3",children:(0,c.relativeDay)(e.sent_at)})]}),(0,t.jsx)("span",{className:"block truncate text-[13px] text-ink-3",children:"direct"===e.kind?e.family_name:"class_broadcast"===e.kind?e.class_name:"Everyone"})]})})}e.s(["default",0,function(){return(0,t.jsx)(m,{})}],95227)},33405,54626,1844,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(87338);function a(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let n=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),r=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function l(e){let[t,i,s]=n(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*i+.0722*s}function d(e,t){let[i,s]=[l(e),l(t)].sort((e,t)=>t-e);return(i+.05)/(s+.05)}function o([e,t,i]){let s=Math.max(e/=255,t/=255,i/=255),a=Math.min(e,t,i),n=(s+a)/2;if(s===a)return[0,0,n];let r=s-a;return[(s===e?(t-i)/r+6*(t<i):s===t?(i-e)/r+2:(e-t)/r+4)/6,n>.5?r/(2-s-a):r/(s+a),n]}function c([e,t,i]){if(0===t)return r([255*i,255*i,255*i]);let s=i<.5?i*(1+t):i+t-i*t,a=2*i-s,n=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?a+(s-a)*6*e:e<.5?s:e<2/3?a+(s-a)*(2/3-e)*6:a;return r([255*n(e+1/3),255*n(e),255*n(e-1/3)])}function u(e,t="#ffffff"){var i;let s,m,_=a(e)??"#2638f0",h=.18>l(a(t)??"#ffffff"),f=4.5>d(_,"#ffffff"),[p,y,b]=o(n(_)),g=c([p,y,f?Math.min(1,b+.08):Math.max(0,b-.07)]),x=(i=h?.82:.9,s=n(_),m=n(t),r([0,1,2].map(e=>s[e]*(1-i)+m[e]*i))),w=(e,t,i)=>h?function(e,t,i){let[s,a,r]=o(n(e)),l=e;for(;d(l,t)<i&&r<1;)l=c([s,a,r=Math.min(1,r+.01)]);return l}(e,t,i):function(e,t,i){let[s,a,r]=o(n(e)),l=e;for(;d(l,t)<i&&r>0;)l=c([s,a,r=Math.max(0,r-.01)]);return l}(e,t,i),v=w(_,x,4.5),N=w(_,t,4.5),E=w(_,t,3);return{accent:_,onAccent:f?"#000000":"#ffffff",hover:g,soft:x,ink:v,text:N,line:E,darkText:f,textDeepened:N!==_}}let m=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),_=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,m,"monogram",0,_,"normaliseHex",0,a,"paletteFor",0,u],54626);let h={classic:{id:"classic",name:"Classic",tagline:"Light and clear — white studio, ink type, your colour for actions",surface:"#ffffff",canvas:"#f4f5f8",ink:"#121521",dark:!1,accent:"#2638f0",secondary:"#ffb089",presets:[{name:"Swayvo",accent:"#2638f0",secondary:"#ffb089"},{name:"Eucalyptus",accent:"#0b3b34",secondary:"#c86a4f"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and after-dark — night grounds, wide type, vivid accents",surface:"#141826",canvas:"#0b0d16",ink:"#f3f4f8",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},f=e=>h["urban"===e?"urban":"classic"];function p(e,t,i){let s=f(e);return{theme:s,accent:a(t)??s.accent,secondary:a(i)??s.secondary}}e.s(["THEMES",0,h,"schoolColours",0,p,"themeOf",0,f],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[11px] text-ink-3",e),children:["powered by",(0,t.jsx)(s.SwayvoLogo,{className:"swayvo-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Swayvo"}),(0,t.jsx)(s.SwayvoLogo,{className:"swayvo-on-dark h-[0.95em] translate-y-[0.06em]",tone:"white",title:null})]})},"SchoolHero",0,function({src:e,name:i,children:s}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${i}`,className:"aspect-[16/7] w-full object-cover"}),s&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:s})]}):null},"SchoolMark",0,function({name:e,logo:i,className:s}){return i?(0,t.jsx)("img",{src:i,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",s)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent",s),children:_(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,s=e?.brand_colour??null,a=e?.brand_secondary??null,n=!!e;i.useEffect(()=>{let e=document.documentElement,i=[...Object.keys(m(u(null))),"--color-secondary"];if(!n){i.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let r=p(t,s,a);e.dataset.theme=r.theme.id,Object.entries(m(u(r.accent,r.theme.surface))).forEach(([t,i])=>e.style.setProperty(t,i)),e.style.setProperty("--color-secondary",r.secondary);let l=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});l.setAttribute("content",r.theme.dark?r.theme.canvas:r.theme.surface),l.parentNode||document.head.appendChild(l)},[n,t,s,a])}],33405)},75379,e=>{"use strict";let t="Europe/London",i=e=>e instanceof Date?e:new Date(e),s=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(i(e)),a=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(i(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=i(e),s=new Date,a=s.getFullYear()-t.getFullYear(),n=s.getMonth()-t.getMonth();return(n<0||0===n&&s.getDate()<t.getDate())&&(a-=1),a},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(i(e)),"dateShort",0,a,"dayName",0,s,"dayRange",0,function(e=0){let t=new Date,i=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),s=new Date(i);return s.setDate(s.getDate()+1),[i.toISOString(),s.toISOString()]},"initials",0,(...e)=>{let t=e.filter(Boolean).flatMap(e=>e.trim().split(/\s+/)).filter(Boolean);return(t.length>1?[t[0],t[t.length-1]]:t).map(e=>e[0]?.toUpperCase()??"").join("")},"isoDate",0,e=>{let s=i(e),a=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(s),n=e=>a.find(t=>t.type===e)?.value??"";return`${n("year")}-${n("month")}-${n("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=i(e),n=new Date,r=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(n.getFullYear(),n.getMonth(),n.getDate()))/864e5);return 0===r?"Today":1===r?"Tomorrow":-1===r?"Yesterday":r>1&&r<7?s(t):a(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(i(e)),"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),i=(t.getDay()+6)%7;t.setDate(t.getDate()-i),t.setHours(0,0,0,0);let s=new Date(t);return s.setDate(s.getDate()+7),[t.toISOString(),s.toISOString()]}])},13927,e=>{"use strict";var t=e.i(66027),i=e.i(30224),s=e.i(31502);function a(e,n,r=[],l){let{session:d}=(0,s.useSession)();return(0,t.useQuery)({queryKey:["db",d?.userId??"anon",d?.studio??"",...e],queryFn:()=>(0,i.readAs)(d,n,r),staleTime:15e3,...l})}e.s(["useRow",0,function(e,t,i=[]){let s=a(e,t,i);return{...s,data:s.data?.[0]}},"useRows",0,a])},50293,e=>{"use strict";let t=`
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
select id, amount_minor, refunded_minor, method, provider, failure_code, succeeded_at, created_at, note
  from payment where invoice_id = $1 and deleted_at is null
 order by created_at`,r=`
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
 order by s.first_name, c.name`,d=`
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`,o=`
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`,c=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`,u=`
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`,m=`
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.ends_on is null or d.ends_on >= current_date order by f.name`,_=`
insert into family_discount (family_id, kind, amount, reason, note, starts_on, ends_on)
values ($1, $2, $3, $4, nullif($5, ''), coalesce($6::date, current_date), $7::date) returning id`,h=`
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
)
select contact as "*ContactName", coalesce(email, '') as "EmailAddress", number as "*InvoiceNumber", coalesce(term, '') as "Reference",
       to_char(inv_date, 'DD/MM/YYYY') as "*InvoiceDate", to_char(due_on, 'DD/MM/YYYY') as "*DueDate",
       description as "*Description", quantity as "*Quantity", round(total_minor / quantity / 100.0, 2) as "*UnitAmount",
       '200' as "*AccountCode", 'No VAT' as "*TaxType", 'GBP' as "Currency"
  from lines order by number, ord, created_at`,f=`
select family_name as family, round(current_minor / 100.0, 2) as "0-30 days", round(d31_60 / 100.0, 2) as "31-60 days",
       round(d61_90 / 100.0, 2) as "61-90 days", round(d90_plus / 100.0, 2) as "90+ days", round(total / 100.0, 2) as total
  from app.aged_debt((select id from studio where app.is_admin(id) order by name limit 1))`,p=`
select i.number, f.name as family, i.status::text as status, i.issued_on, i.due_on,
       round(i.subtotal_minor / 100.0, 2) as subtotal, round(i.discount_minor / 100.0, 2) as discount,
       round(i.total_minor / 100.0, 2) as total, round(i.paid_minor / 100.0, 2) as paid,
       round((i.total_minor - i.paid_minor) / 100.0, 2) as outstanding, t.name as term
  from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
 where i.deleted_at is null order by i.number`,y=`
select p.succeeded_at::date as date, f.name as family, i.number as invoice, p.method,
       round(p.amount_minor / 100.0, 2) as amount,
       case when p.failure_code is not null then 'failed' when p.succeeded_at is null then 'pending' else 'succeeded' end as status,
       p.provider_ref as reference
  from payment p join family f on f.id = p.family_id left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null order by p.created_at`;e.s(["ADD_FAMILY_DISCOUNT",0,_,"AGED_DEBT_EXPORT",0,f,"BILLING_LINES",0,"select * from app.billing_lines($1, $2::date)","BILLING_RUNS",0,u,"BILLING_TERMS",0,"select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc","CREATE_BILLING_RUN",0,"select app.create_billing_run($1, $2::date, $3::date) as id","CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","DISCARD_BILLING_RUN",0,"select app.discard_billing_run($1)","DISCOUNT_RULES",0,"select id, kind, from_nth, percent, enabled from discount_rule order by kind desc","END_FAMILY_DISCOUNT",0,"update family_discount set deleted_at = now() where id = $1 returning id","FAMILY_BILLABLE",0,l,"FAMILY_DISCOUNTS",0,m,"FAMILY_OPTIONS",0,r,"FAMILY_PICK",0,"select id, name from family where deleted_at is null and not is_prospect order by name","INVOICE",0,s,"INVOICES",0,i,"INVOICES_EXPORT",0,p,"INVOICE_ITEMS",0,a,"INVOICE_PAYMENTS",0,n,"ISSUE_BILLING_RUN",0,"select app.issue_billing_run($1) as n","ISSUE_INVOICE",0,"select app.issue_invoice($1)","PAYMENTS_EXPORT",0,y,"PRIMARY_GUARDIAN",0,o,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3)","REMINDER_TEMPLATE",0,d,"SEND_DIRECT",0,c,"SET_DISCOUNT_RULE",0,"update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id","SUMMARY",0,t,"VOID_INVOICE",0,"select app.void_invoice($1, $2)","XERO_EXPORT",0,h])},21011,e=>{"use strict";let t=`
select
  (select count(*)::int from payment
    where deleted_at is null and failure_code is not null and succeeded_at is null) as failed,
  (select coalesce(sum(total_minor - paid_minor), 0)::bigint from invoice
    where deleted_at is null and status in ('issued','part_paid')) as outstanding_minor,
  (select count(*)::int from invoice
    where deleted_at is null and status in ('issued','part_paid')) as unpaid_invoices`,i=`
select c.id, c.name,
       c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity, 0))::int as pct
  from class c
 where c.deleted_at is null
   and app.class_enrolled_count(c.id) >= greatest(c.capacity - 1, 1)
 order by waiting desc, pct desc`,s=`
select e.id, e.contact_name, e.child_name, e.next_action_on,
       c.name as class_name
  from enquiry e
  left join class c on c.id = e.interest_class_id
 where e.deleted_at is null and e.stage in ('trial_attended','follow_up')
 order by e.next_action_on nulls last`,a=`
with marks as (
  select ar.student_id, cs.class_id, ar.status,
         row_number() over (partition by ar.student_id, cs.class_id order by cs.starts_at desc) as rn
    from attendance_record ar
    join class_session cs on cs.id = ar.session_id and cs.deleted_at is null
   where ar.deleted_at is null and cs.starts_at < now()
),
runs as (
  select student_id, class_id
    from marks where rn <= 3
   group by student_id, class_id
  having count(*) = 3 and bool_and(status in ('absent'))
)
select s.id, s.first_name, s.last_name,
       min(c.name) as class_name,
       count(*)::int as classes_affected
  from runs r
  join student s on s.id = r.student_id
  join class c on c.id = r.class_id
 group by s.id, s.first_name, s.last_name
 order by s.last_name, s.first_name`,n=`
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour, lv.name as level,
       coalesce(cover.display_name, st.display_name) as teacher,
       coalesce(sr.name, r.name) as room, l.name as location,
       app.class_enrolled_count(c.id) as enrolled, c.capacity,
       (select count(*)::int from trial t
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials,
       cs.teacher_id is not null and cs.teacher_id is distinct from c.teacher_id as covered,
       cs.cancel_reason, cs.original_starts_at is not null as moved, st.display_name as usual_teacher,
       coalesce(cs.room_id, c.room_id) as room_id, cs.register_closed_at is not null as register_closed
  from class_session cs
  join class c on c.id = cs.class_id and c.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join level lv on lv.id = c.level_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by cs.starts_at, c.name`,r=n.replace("and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz","and cs.id = $1"),l=`
select e.id, e.started_on, s.first_name, s.last_name, c.name as class_name
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where e.deleted_at is null and e.status = 'active'
 order by e.started_on desc, e.created_at desc
 limit 6`,d=`
select t.id, t.status, cs.starts_at, c.name as class_name,
       coalesce(eq.child_name, s.first_name || ' ' || s.last_name) as who,
       eq.contact_name
  from trial t
  join class c on c.id = t.class_id
  left join class_session cs on cs.id = t.session_id
  left join enquiry eq on eq.id = t.enquiry_id
  left join student s on s.id = t.student_id
 where t.deleted_at is null and t.status in ('requested','booked')
 order by cs.starts_at nulls last
 limit 6`,o=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at,
       f.name as family_name, c.name as class_name
  from communication cm
  left join family f on f.id = cm.family_id
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
 order by cm.sent_at desc
 limit 5`,c=`
select count(*)::int as awaiting,
       string_agg(name, ', ' order by last_at) filter (where rn <= 3) as names
  from (select f.name, last.sent_at as last_at, row_number() over (order by last.sent_at) rn
          from family f
          join lateral (select inbound, sent_at from communication c
                         where c.family_id = f.id and c.kind = 'direct' and c.deleted_at is null
                         order by c.sent_at desc limit 1) last on last.inbound
         where f.deleted_at is null) t`,u=`
select
  (select count(*)::int from studio_request
    where deleted_at is null and status in ('open','in_progress')) as open_requests,
  (select count(*)::int from event_participant
    where deleted_at is null and status = 'requested') as pending_entries,
  (select count(*)::int from studio_request
    where deleted_at is null and status = 'open' and kind = 'medical_update') as medical_updates`,m=`select r.id, l.name || ' \xb7 ' || r.name as name from room r join location l on l.id = r.location_id
  where r.deleted_at is null order by l.name, r.name`,_=`
select count(distinct st.family_id)::int as n from enrolment e join student st on st.id = e.student_id
 where e.class_id = (select class_id from class_session where id = $1) and e.status = 'active' and e.deleted_at is null`,h=`
select t.name, (current_date - t.starts_on) / 7 + 1 as week, (t.ends_on - t.starts_on) / 7 + 1 as weeks
  from term t where t.deleted_at is null and current_date between t.starts_on and t.ends_on
 order by t.starts_on desc limit 1`;e.s(["ATTENTION_CAPACITY",0,i,"ATTENTION_LAPSED",0,a,"ATTENTION_MESSAGES",0,c,"ATTENTION_PAYMENTS",0,t,"ATTENTION_REQUESTS",0,u,"ATTENTION_TRIALS",0,s,"CANCEL_SESSION",0,"select app.cancel_session($1, $2, $3, $4)","COVER_SESSION",0,"select app.cover_session($1, $2, $3, $4)","MOVE_SESSION",0,"select app.move_session($1, $2::timestamptz, $3, $4, $5)","RECENT_ENROLMENTS",0,l,"RECENT_MESSAGES",0,o,"ROOM_OPTIONS",0,m,"SESSIONS_BETWEEN",0,n,"SESSION_BY_ID",0,r,"SESSION_FAMILIES",0,_,"STAFF_OPTIONS",0,"select id, display_name from staff_member where status = 'active' and deleted_at is null order by display_name","TERM_NOW",0,h,"UPCOMING_TRIALS",0,d])},33204,e=>{"use strict";let t=`
select f.id as family_id, f.name as family_name,
       (select g.full_name from guardian g where g.family_id = f.id and g.deleted_at is null
         order by g.is_primary desc limit 1) as guardian,
       last.body as last_body, last.subject as last_subject, last.sent_at as last_at,
       last.inbound as last_inbound,
       (select count(*)::int from communication c where c.family_id = f.id and c.kind = 'direct'
          and c.deleted_at is null and c.inbound and c.request_id is null and not exists (
            select 1 from communication_read r where r.communication_id = c.id and r.user_id = auth.uid())) as unread,
       (select count(*)::int from communication c where c.family_id = f.id and c.kind = 'direct'
          and c.deleted_at is null) as messages
  from family f
  join lateral (select body, subject, sent_at, inbound from communication c
                 where c.family_id = f.id and c.kind = 'direct' and c.deleted_at is null
                 order by c.sent_at desc limit 1) last on true
 where f.deleted_at is null
 order by last.sent_at desc`,i=`
select c.id, c.subject, c.body, c.sent_at, c.inbound, c.request_id is not null as is_request,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.family_id = $1 and c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`,s=`
select c.id, c.subject, c.body, c.sent_at, c.inbound, c.reply_to, c.request_id is not null as is_request,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`,a=`
select c.id, c.kind, c.subject, c.body, c.sent_at, c.class_id, cl.name as class_name, c.sent_at > now() as scheduled,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c left join class cl on cl.id = c.class_id
 where c.kind in ('class_broadcast', 'studio_announcement') and c.deleted_at is null
 order by c.sent_at desc
 limit 60`,n=`
select c.id, c.name, sm.display_name as teacher,
       (select count(distinct s.family_id)::int from enrolment e join student s on s.id = e.student_id
         where e.class_id = c.id and e.status = 'active' and e.deleted_at is null) as families
  from class c left join staff_member sm on sm.id = c.teacher_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`,r=`
select id, name, subject, body from communication_template
 where deleted_at is null order by name`,l=`
insert into communication_template (studio_id, name, subject, body)
select studio_id, $1, nullif(btrim($2), ''), $3 from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,d=`
update communication_template set name = $2, subject = nullif(btrim($3), ''), body = $4, updated_at = now()
 where id = $1 returning id`,o=`
insert into communication (studio_id, kind, channel, family_id, subject, body)
select studio_id, 'direct', 'in_app', id, nullif(btrim($2), ''), btrim($3) from family where id = $1
returning id`,c=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_at)
select studio_id, 'direct', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from family where id = $1
returning id`,u=`
insert into communication (studio_id, kind, channel, class_id, subject, body)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3) from class where id = $1
returning id`,m=`
insert into communication (studio_id, kind, channel, class_id, subject, body, sent_at)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from class where id = $1
returning id`,_=`
insert into communication (studio_id, kind, channel, subject, body)
select studio_id, 'studio_announcement', 'in_app', nullif(btrim($1), ''), btrim($2) from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,h=`
insert into communication (studio_id, kind, channel, subject, body, sent_at)
select studio_id, 'studio_announcement', 'in_app', nullif(btrim($1), ''), btrim($2), $3::timestamptz from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,f=`
select app.release_scheduled(m.studio_id) as n from membership m
 where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1`,p=`
insert into communication (studio_id, kind, channel, family_id, subject, body, reply_to)
select studio_id, 'direct', 'in_app', family_id, nullif(btrim($1), ''), btrim($2), $3::uuid
  from guardian where user_id = auth.uid() and deleted_at is null and app.in_scope(studio_id)
 limit 1 returning id`,y=`
select id, kind, title, body, href, read_at, created_at from notification
 where deleted_at is null order by created_at desc limit 40`,b=`
select count(*)::int as n from notification where deleted_at is null and read_at is null`,g=`
select r.id, r.event, r.enabled, r.template_id, t.name as template_name,
       (select count(*)::int from automation_run x where x.rule_id = r.id) as sent,
       (select max(ran_at) from automation_run x where x.rule_id = r.id) as last_sent,
       coalesce((select d.due from app.automation_due(r.studio_id) d where d.rule_id = r.id), 0) as due
  from automation_rule r
  left join communication_template t on t.id = r.template_id and t.deleted_at is null
 order by array_position(array['trial_booked','trial_reminder_48h','trial_reminder_same_day',
                               'trial_attended','trial_missed','waitlist_offer'], r.event)`,x=`
select app.run_automations(studio_id) as sent from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`,w=`
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,a,"CLASS_AUDIENCES",0,n,"CONVERSATION",0,i,"CREATE_TEMPLATE",0,l,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,s,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,y,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,w,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,f,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,g,"RUN_AUTOMATIONS",0,x,"SEND_CLASS",0,u,"SEND_CLASS_AT",0,m,"SEND_DIRECT",0,o,"SEND_DIRECT_AT",0,c,"SEND_STUDIO",0,_,"SEND_STUDIO_AT",0,h,"SEND_TO_STUDIO",0,p,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,r,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,b,"UPDATE_TEMPLATE",0,d])}]);