(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var i=e.i(12598),a=e.i(71645);let n=a.createContext(!1);n.Provider,e.i(43476);let s=a.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var r=e.i(19273),d=e.i(40143),o=e.i(80166),l=e.i(73911),c=e.i(15823),u=e.i(75555),m=e.i(86491),_=class extends c.Subscribable{#e;#t=void 0;#i=void 0;#a=void 0;#n;#s;#r;#d;#o;#l;#c;#u;#m;#_=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#r=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),h(this.#t,this.options)?this.#h():this.updateResult(),this.#p())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return p(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return p(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#f(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,i=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,r.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,r.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let a=this.hasListeners();a&&f(this.#t,i,this.options,t)&&this.#h(),this.updateResult(),a&&(this.#t!==i||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||(0,r.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,r.resolveStaleTime)(t.staleTime,this.#t))&&this.#g();let n=this.#v();a&&(this.#t!==i||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||n!==this.#m)&&this.#x(n)}getOptimisticResult(e){var t,i;let a=this.#e.getQueryCache().build(this.#e,e),n=this.createResult(a,e);return t=this,i=n,(0,r.shallowEqualObjects)(t.getCurrentResult(),i)||(this.#a=n,this.#s=this.options,this.#n=this.#t.state),n}getCurrentResult(){return this.#a}trackResult(e,t){return new Proxy(e,{get:(e,i)=>(this.trackProp(i),t?.(i),Reflect.get(e,i))})}trackProp(e){this.#_.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,i=this.#e.defaultQueryOptions(e),a=this.#e.getQueryCache().build(this.#e,i),n=()=>{},s=new Promise(e=>{t=e,n=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===a.queryHash&&void 0!==a.state.data&&(n(),e(this.createResult(a,i)))})});return Promise.race([a.fetch().then(()=>{let e=this.createResult(a,i);return t?.(e),e}).finally(()=>{n()}),s])}fetch(e){return this.#h({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#a))}#h(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(r.noop)),t}#g(){this.#f();let e=(0,r.resolveStaleTime)(this.options.staleTime,this.#t);if(l.environmentManager.isServer()||this.#a.isStale||!(0,r.isValidTimeout)(e))return;let t=(0,r.timeUntilStale)(this.#a.dataUpdatedAt,e)+1;this.#c=o.timeoutManager.setTimeout(()=>{this.#a.isStale||this.updateResult()},t)}#v(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#x(e){this.#y(),this.#m=e,!l.environmentManager.isServer()&&!1!==(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,r.isValidTimeout)(this.#m)&&0!==this.#m&&(this.#u=o.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#h()},this.#m))}#p(){this.#g(),this.#x(this.#v())}#f(){void 0!==this.#c&&(o.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(o.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let i,a=this.#t,n=this.options,s=this.#a,d=this.#n,o=this.#s,l=e!==a?e.state:this.#i,{state:c}=e,u={...c},_=!1;if(t._optimisticResults){let i=this.hasListeners(),s=!i&&h(e,t),r=i&&f(e,a,t,n);(s||r)&&(u={...u,...(0,m.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:p,errorUpdatedAt:b,status:g}=u;i=u.data;let v=!1;if(void 0!==t.placeholderData&&void 0===i&&"pending"===g){let e;s?.isPlaceholderData&&t.placeholderData===o?.placeholderData?(e=s.data,v=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#l?.state.data,this.#l):t.placeholderData,void 0!==e&&(g="success",i=(0,r.replaceData)(s?.data,e,t),_=!0)}if(t.select&&void 0!==i&&!v)if(s&&i===d?.data&&t.select===this.#d)i=this.#o;else try{this.#d=t.select,i=t.select(i),i=(0,r.replaceData)(s?.data,i,t),this.#o=i,this.#r=null}catch(e){this.#r=e}else void 0===i&&(this.#r=null);this.#r&&(p=this.#r,i=this.#o,b=Date.now(),g="error",_=!1);let x="fetching"===u.fetchStatus,w="pending"===g,N="error"===g,j=w&&x,S=void 0!==i;return{status:g,fetchStatus:u.fetchStatus,isPending:w,isSuccess:"success"===g,isError:N,isInitialLoading:j,isLoading:j,data:i,dataUpdatedAt:u.dataUpdatedAt,error:p,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>l.dataUpdateCount||u.errorUpdateCount>l.errorUpdateCount,isFetching:x,isRefetching:x&&!w,isLoadingError:N&&!S,isPaused:"paused"===u.fetchStatus,isPlaceholderData:_,isRefetchError:N&&S,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,r.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#a,t=this.createResult(this.#t,this.options);if(this.#n=this.#t.state,this.#s=this.options,void 0!==this.#n.data&&(this.#l=this.#t),(0,r.shallowEqualObjects)(t,e))return;this.#a=t;let i=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,i="function"==typeof t?t():t;if("all"===i||!i&&!this.#_.size)return!0;let a=new Set(i??this.#_);return this.options.throwOnError&&a.add("error"),Object.keys(this.#a).some(t=>this.#a[t]!==e[t]&&a.has(t))};this.#w({listeners:i()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#i=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#p()}#w(e){d.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#a)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function h(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,r.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&p(e,t,t.refetchOnMount)}function p(e,t,i){if(!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,r.resolveStaleTime)(t.staleTime,e)){let a="function"==typeof i?i(e):i;return"always"===a||!1!==a&&y(e,t)}return!1}function f(e,t,i,a){return(e!==t||!1===(0,r.resolveQueryBoolean)(a.enabled,e))&&(!i.suspense||"error"!==e.state.status)&&y(e,i)}function y(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,r.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,o){let l,c=a.useContext(n),u=a.useContext(s),m=(0,i.useQueryClient)(o),_=m.defaultQueryOptions(e),h=m.getQueryCache().get(_.queryHash),p=!1!==e.subscribed;if(_._optimisticResults=c?"isRestoring":p?"optimistic":void 0,_.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=_.staleTime;_.staleTime="function"==typeof t?(...i)=>e(t(...i)):e(t),"number"==typeof _.gcTime&&(_.gcTime=Math.max(_.gcTime,1e3))}l=h?.state.error&&"function"==typeof _.throwOnError?(0,r.shouldThrowError)(_.throwOnError,[h.state.error,h]):_.throwOnError,(_.suspense||l)&&!u.isReset()&&(_.retryOnMount=!1),a.useEffect(()=>{u.clearReset()},[u]);let[f]=a.useState(()=>new t(m,_)),y=f.getOptimisticResult(_),b=!c&&p;if(a.useSyncExternalStore(a.useCallback(e=>{let t=b?f.subscribe(d.notifyManager.batchCalls(e)):r.noop;return f.updateResult(),t},[f,b]),()=>f.getCurrentResult(),()=>f.getCurrentResult()),a.useEffect(()=>{f.setOptions(_)},[_,f]),_?.suspense&&y.isPending)throw f.fetchOptimistic(_).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:i,query:a,suspense:n})=>e.isError&&!t.isReset()&&!e.isFetching&&a&&(n&&void 0===e.data||(0,r.shouldThrowError)(i,[e.error,a])))({result:y,errorResetBoundary:u,throwOnError:_.throwOnError,query:h,suspense:_.suspense}))throw y.error;return _.notifyOnChangeProps?y:f.trackResult(y)}(e,_,t)}],66027)},43531,e=>{"use strict";let t=(0,e.i(75254).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["Check",0,t],43531)},64659,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["ChevronDown",0,t],64659)},74886,e=>{"use strict";let t=(0,e.i(75254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",0,t],74886)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},28345,e=>{"use strict";var t=e.i(43476),i=e.i(71645),a=e.i(22016),n=e.i(13927),s=e.i(45060),r=e.i(17658);let d=`
select cs.id, cs.original_starts_at, cs.cancel_reason, cs.changed_at,
       (cs.room_id is not null and cs.room_id is distinct from c.room_id) as room_moved,
       (cs.teacher_id is not null and cs.teacher_id is distinct from c.teacher_id) as covered
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = any($1::uuid[])`;function o({word:e,tone:i="ink"}){return(0,t.jsx)(r.Word,{size:"md",tone:i,children:e})}e.s(["SessionRow",0,function({time:e,name:i,meta:n,href:d,cancelled:l,reason:c,moved:u,style:m,colour:_,extra:h}){let p=(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("span",{className:(0,s.cn)("font-display text-[1.1875rem] leading-tight tnum",l&&"text-ink-3 line-through"),children:e}),(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsx)("span",{className:(0,s.cn)("block font-semibold leading-snug",l&&"text-ink-3"),children:i}),(0,t.jsxs)("span",{className:"mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-ink-3",children:[l&&(0,t.jsx)(o,{word:"Cancelled",tone:"critical"}),!l&&u&&(0,t.jsx)(o,{word:"Moved"}),l&&c?(0,t.jsx)("span",{children:c}):(0,t.jsx)("span",{className:"min-w-0",children:n.filter(Boolean).join(" · ")}),!l&&(0,t.jsx)(r.StyleMark,{style:m??null,colour:_}),h]})]})]}),f="grid min-h-[56px] grid-cols-[4.25rem_minmax(0,1fr)] items-start gap-x-4 py-3";return(0,t.jsx)("li",{children:d?(0,t.jsx)(a.default,{href:d,"aria-label":`${i}, ${e}${l?", cancelled":""}${u?", moved":""}`,className:(0,s.cn)(f,"hover:bg-surface-2/60"),children:p}):(0,t.jsx)("div",{className:f,children:p})})},"dayDate",0,function(e){return new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:"Europe/London"}).format(new Date(e))},"dueWord",0,function(e){return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:"Europe/London"}).format(new Date(e))},"useSessionChanges",0,function(e){let t=[...new Set(e)].sort(),a=(0,n.useRows)(["session-changes",t.join(",")],d,[t],{enabled:t.length>0});return i.useMemo(()=>new Map((a.data??[]).map(e=>[e.id,e])),[a.data])}])},26639,e=>{"use strict";var t=e.i(43476),i=e.i(71645),a=e.i(64659),n=e.i(74886),s=e.i(28793),r=e.i(59130),d=e.i(77326),o=e.i(13927),l=e.i(50293),c=e.i(45060),u=e.i(17658),m=e.i(8199),_=e.i(75379),h=e.i(28345);let p={positive:"text-positive",caution:"text-caution",critical:"text-critical",neutral:"text-ink-3",info:"text-info"};function f({i:e}){let a=(0,o.useRows)(["invoice-items",e.id],l.INVOICE_ITEMS,[e.id]),n=i.useMemo(()=>{let e=new Map;return(a.data??[]).forEach(t=>{let i=t.student_name??"";e.set(i,[...e.get(i)??[],t])}),[...e.entries()]},[a.data]),s=Number(e.total_minor)-Number(e.paid_minor);return(0,t.jsxs)("section",{"aria-label":`Invoice ${e.number}`,children:[(0,t.jsx)(u.SectionHead,{title:(0,t.jsx)("span",{className:"tnum",children:e.number}),meta:`Issued ${(0,_.dateShort)(e.issued_on)} \xb7 due ${(0,_.dateShort)(e.due_on)}`}),a.isLoading&&(0,t.jsx)(u.Skeleton,{className:"mt-3 h-20"}),(0,t.jsxs)("dl",{className:"text-[0.9062rem]",children:[n.map(([e,i])=>(0,t.jsxs)("div",{className:"border-b border-line py-2",children:[e&&(0,t.jsx)("dt",{className:"label pb-1 pt-1",children:e}),i.map(e=>(0,t.jsxs)("dd",{className:"flex gap-4 py-1",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[e.description,Number(e.quantity)>1&&(0,t.jsxs)("span",{className:"text-ink-3",children:[" × ",Number(e.quantity)]})]}),(0,t.jsx)("span",{className:(0,c.cn)("tnum",0>Number(e.total_minor)&&"text-positive"),children:(0,_.money)(e.total_minor)})]},e.id))]},e)),Number(e.paid_minor)>0&&(0,t.jsxs)("div",{className:"flex gap-4 border-b border-line py-2 text-ink-2",children:[(0,t.jsx)("dt",{className:"flex-1",children:"Paid so far"}),(0,t.jsxs)("dd",{className:"tnum",children:["−",(0,_.money)(e.paid_minor)]})]}),(0,t.jsxs)("div",{className:"flex gap-4 pt-2.5 font-semibold",children:[(0,t.jsx)("dt",{className:"flex-1",children:Number(e.paid_minor)>0?"Left to pay":"Total"}),(0,t.jsx)("dd",{className:"tnum",children:(0,_.money)(s)})]})]})]})}function y({label:e,value:a,big:s}){let[r,d]=i.useState(!1);return(0,t.jsxs)("div",{className:"flex items-center gap-3 py-2",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:e}),(0,t.jsx)("p",{className:(0,c.cn)("tnum break-all",s?"font-display text-[1.375rem] leading-tight":"text-[1rem] font-semibold"),children:a})]}),(0,t.jsxs)(u.Button,{size:"sm","aria-label":`Copy ${e.toLowerCase()} ${a}`,onClick:()=>navigator.clipboard?.writeText(a.replace(/\s/g,"Account name"===e?" ":"")).then(()=>{d(!0),setTimeout(()=>d(!1),2e3)}).catch(()=>{}),children:[(0,t.jsx)(n.Copy,{className:"size-4","aria-hidden":!0})," ",r?"Copied":"Copy"]}),(0,t.jsx)("span",{role:"status",className:"sr-only",children:r?`${e} copied`:""})]})}function b({info:e,invoices:i}){let a=i.length>1,n=a?e?.reference??i[0]??"":i[0]??e?.reference??"";return(0,t.jsxs)("section",{"aria-labelledby":"how-h",children:[(0,t.jsx)(u.SectionHead,{id:"how-h",title:"How to pay"}),(0,t.jsxs)("div",{className:"divide-y divide-line",children:[(0,t.jsxs)("div",{className:"py-3",children:[(0,t.jsx)("p",{className:"font-semibold",children:"Bank transfer"}),e?.payee_name?(0,t.jsxs)("div",{className:"mt-1 divide-y divide-line",children:[(0,t.jsx)(y,{label:"Account name",value:e.payee_name}),(0,t.jsx)(y,{label:"Sort code",value:e.sort_code}),(0,t.jsx)(y,{label:"Account number",value:e.account_number}),e.iban&&(0,t.jsx)(y,{label:"IBAN",value:e.iban}),(0,t.jsx)(y,{label:"Reference",value:n,big:!0})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("p",{className:"mt-0.5 text-[0.8438rem] text-ink-3",children:"The studio has not added its bank details here yet. Ask them for the account details, and use this reference."}),(0,t.jsx)(y,{label:"Reference",value:n,big:!0})]}),(0,t.jsx)("p",{className:"mt-1 text-[0.8438rem] text-ink-3",children:a?`This reference covers all ${i.length} invoices (${i.join(", ")}), so one transfer is enough. The studio matches it to them.`:"Use this reference so the studio can match your payment. It shows here once they have recorded it."})]}),(0,t.jsxs)("div",{className:"py-3",children:[(0,t.jsx)("p",{className:"font-semibold",children:"Card or Apple Pay"}),(0,t.jsx)("p",{className:"mt-0.5 text-[0.8438rem] text-ink-3",children:"Not available yet: the studio has not connected card payments. Until then, pay by transfer or at the studio; they record it and it shows here straight away."})]})]})]})}let g={expected:"Expected",invoiced:"Invoiced",paid:"Paid"},v={expected:"muted",invoiced:"caution",paid:"positive"};function x(){let e=(0,o.useRows)(["upcoming-costs"],l.UPCOMING_COSTS,[null]),a=i.useMemo(()=>{let t=new Map;return(e.data??[]).forEach(e=>t.set(e.child,[...t.get(e.child)??[],e])),[...t.entries()]},[e.data]),n=(e.data??[]).reduce((e,t)=>e+Number(t.amount_minor),0),s=(e.data??[]).filter(e=>"paid"!==e.state).reduce((e,t)=>e+Number(t.amount_minor),0);return(0,t.jsxs)("section",{"aria-labelledby":"up-h",children:[(0,t.jsx)(u.SectionHead,{id:"up-h",title:"Coming up",meta:e.data?.length?"Fees, events and lessons ahead":void 0}),e.isLoading&&(0,t.jsx)(u.Skeleton,{className:"mt-3 h-20"}),null!=e.error&&(0,t.jsx)(u.ErrorState,{error:e.error}),e.data?.length===0&&(0,t.jsx)("p",{className:"py-3 text-[0.9062rem] text-ink-3",children:"Nothing else is planned yet."}),a.map(([e,i])=>(0,t.jsxs)("div",{className:"border-b border-line py-2",children:[(0,t.jsx)("p",{className:"label pb-1 pt-1",children:e}),(0,t.jsx)("ul",{children:i.map((e,i)=>(0,t.jsxs)("li",{className:"grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-1.5 text-[0.9062rem]",children:[(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsx)("span",{className:"block",children:e.title}),(0,t.jsxs)("span",{className:"flex flex-wrap items-baseline gap-x-2 text-[0.7812rem] text-ink-3",children:[(0,t.jsx)(u.Word,{tone:v[e.state],children:g[e.state]}),(0,t.jsx)("span",{children:e.due_on?"expected"===e.state?(0,_.dateShort)(e.due_on):`due ${(0,_.dateShort)(e.due_on)}`:"Date to be set"}),e.invoice_number&&(0,t.jsx)("span",{className:"tnum",children:e.invoice_number})]})]}),(0,t.jsx)("span",{className:(0,c.cn)("tnum","paid"===e.state&&"text-ink-3"),children:(0,_.money)(e.amount_minor)})]},i))})]},e)),!!e.data?.length&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("dl",{className:"pt-2.5 text-[0.9062rem]",children:[(0,t.jsxs)("div",{className:"flex gap-4 font-semibold",children:[(0,t.jsx)("dt",{className:"flex-1",children:"Total coming up"}),(0,t.jsx)("dd",{className:"tnum",children:(0,_.money)(n)})]}),s!==n&&(0,t.jsxs)("div",{className:"flex gap-4 text-ink-2",children:[(0,t.jsx)("dt",{className:"flex-1",children:"Not yet paid"}),(0,t.jsx)("dd",{className:"tnum",children:(0,_.money)(s)})]})]}),(0,t.jsx)("p",{className:"mt-1 text-[0.7812rem] text-ink-3",children:"Estimates use this term’s prices. The studio confirms the amount on each invoice."})]})]})}let w={card:"Card",direct_debit:"Direct debit",bank_transfer:"Bank transfer",cash:"Cash",credit:"Credit from the studio",account:"Credit on your account"};function N({i:e}){let[n,s]=i.useState(!1),d=(0,o.useRows)(["invoice-items",e.id],l.INVOICE_ITEMS,[e.id],{enabled:n}),m=(0,o.useRows)(["invoice-payments",e.id],l.INVOICE_PAYMENTS,[e.id],{enabled:n}),h=(0,r.invoiceState)(e),f=Number(e.total_minor)-Number(e.paid_minor);return(0,t.jsxs)("li",{children:[(0,t.jsxs)("button",{onClick:()=>s(e=>!e),"aria-expanded":n,className:"grid min-h-[56px] w-full grid-cols-[minmax(0,1fr)_auto_1rem] items-center gap-x-3 py-3 text-left hover:bg-surface-2/60",children:[(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsxs)("span",{className:"flex items-baseline gap-2",children:[(0,t.jsx)("span",{className:"tnum font-semibold",children:e.number}),(0,t.jsx)("span",{className:(0,c.cn)("text-[0.8125rem] font-semibold",p[h.tone]),children:h.label})]}),(0,t.jsxs)("span",{className:"mt-0.5 block text-[0.8125rem] text-ink-3",children:["Issued ",(0,_.dateShort)(e.issued_on)," · due ",(0,_.dateShort)(e.due_on)]})]}),(0,t.jsxs)("span",{className:"text-right",children:[(0,t.jsx)("span",{className:"tnum block font-semibold",children:(0,_.money)(e.total_minor)}),f>0&&"void"!==e.status&&(0,t.jsxs)("span",{className:"tnum block text-[0.7812rem] text-caution",children:[(0,_.money)(f)," left"]})]}),(0,t.jsx)(a.ChevronDown,{className:(0,c.cn)("size-4 text-ink-3 transition-transform",n&&"rotate-180"),"aria-hidden":!0})]}),n&&(0,t.jsxs)("div",{className:"space-y-3 pb-4 pl-3 text-[0.875rem]",children:[d.isLoading&&(0,t.jsx)(u.Skeleton,{className:"h-10"}),(0,t.jsx)("ul",{className:"space-y-1.5 border-l-2 border-line pl-3",children:d.data?.map(e=>(0,t.jsxs)("li",{className:"flex gap-3",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[e.student_name?(0,t.jsxs)("span",{className:"text-ink-3",children:[e.student_name," · "]}):null,e.description]}),(0,t.jsx)("span",{className:"tnum",children:(0,_.money)(e.total_minor)})]},e.id))}),m.data&&m.data.length>0&&(0,t.jsx)("ul",{className:"space-y-1.5 border-l-2 border-line pl-3 text-[0.8125rem] text-ink-2",children:m.data.map(e=>(0,t.jsxs)("li",{className:"flex gap-3",children:[(0,t.jsxs)("span",{className:"flex-1",children:[e.succeeded_at?`${w[e.method]??e.method}, ${(0,_.dateShort)(e.succeeded_at)}`:`${w[e.method]??e.method} did not go through`,Number(e.refunded_minor)>0&&` \xb7 ${(0,_.money)(e.refunded_minor)} refunded`]}),(0,t.jsx)("span",{className:(0,c.cn)("tnum",!e.succeeded_at&&"line-through"),children:(0,_.money)(e.amount_minor)})]},e.id))})]})]})}e.s(["default",0,function(){let e=(0,o.useRow)(["my-balance"],m.MY_BALANCE),i=(0,o.useRows)(["my-invoices"],m.MY_INVOICES),a=(0,o.useRow)(["my-payment-info"],l.MY_PAYMENT_INFO);(0,s.useDueReminders)();let n=!!e.data&&Number(e.data.balance_minor)>0,r=!!e.data&&0>Number(e.data.balance_minor),p=(i.data??[]).filter(e=>"issued"===e.status||"part_paid"===e.status).sort((e,t)=>String(e.due_on).localeCompare(String(t.due_on))),y=p[0]?.due_on;return(0,t.jsx)(d.Shell,{title:"Payments",allow:["guardian"],children:(0,t.jsxs)("div",{className:"mx-auto grid max-w-[1080px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",children:[(0,t.jsxs)("div",{className:"min-w-0 space-y-10",children:[(0,t.jsxs)("section",{"aria-labelledby":"due-h",children:[e.isLoading&&(0,t.jsx)(u.Skeleton,{className:"h-28"}),null!=e.error&&(0,t.jsx)(u.ErrorState,{error:e.error,onRetry:()=>e.refetch()}),e.data&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("p",{id:"due-h",className:(0,c.cn)("label",n&&"text-caution"),children:n?y?`Due ${(0,h.dueWord)(y)}`:"To pay":r?"In credit":"Balance"}),(0,t.jsx)("p",{className:"display-xl mt-1 text-[length:min(3.5rem,13vw)] leading-none sm:text-[length:min(4.5rem,13vw)]",children:n?(0,_.money)(e.data.balance_minor):r?(0,_.money)(-Number(e.data.balance_minor)):"£0.00"}),(0,t.jsx)("p",{className:"mt-2 text-[0.9375rem] text-ink-2",children:n?e.data.failed>0?"A card payment did not go through. Nothing was taken.":`${e.data.unpaid} invoice${1===e.data.unpaid?"":"s"} outstanding.`:r?"Credit on your account comes off the next invoice.":"Everything is paid. Nothing is due."})]})]}),p.map(e=>(0,t.jsx)(f,{i:e},e.id))]}),(0,t.jsxs)("div",{className:"min-w-0 space-y-10",children:[n&&(0,t.jsx)(b,{info:a.data,invoices:p.map(e=>e.number)}),(0,t.jsx)(x,{}),(0,t.jsxs)("section",{"aria-labelledby":"hist-h",children:[(0,t.jsx)(u.SectionHead,{id:"hist-h",title:"Invoices",meta:i.data?.length?"Latest eight":void 0}),i.isLoading&&(0,t.jsx)("div",{className:"space-y-2 pt-3",children:[0,1].map(e=>(0,t.jsx)(u.Skeleton,{className:"h-12"},e))}),null!=i.error&&(0,t.jsx)(u.ErrorState,{error:i.error}),i.data?.length===0&&(0,t.jsx)(u.EmptyState,{title:"No invoices yet",body:"They appear here as the studio issues them."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:i.data?.map(e=>(0,t.jsx)(N,{i:e},e.id))})]})]})]})})}])},33405,54626,1844,e=>{"use strict";var t=e.i(43476),i=e.i(71645),a=e.i(87338);function n(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let s=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),r=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function d(e){let[t,i,a]=s(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*i+.0722*a}function o(e,t){let[i,a]=[d(e),d(t)].sort((e,t)=>t-e);return(i+.05)/(a+.05)}function l([e,t,i]){let a=Math.max(e/=255,t/=255,i/=255),n=Math.min(e,t,i),s=(a+n)/2;if(a===n)return[0,0,s];let r=a-n;return[(a===e?(t-i)/r+6*(t<i):a===t?(i-e)/r+2:(e-t)/r+4)/6,s>.5?r/(2-a-n):r/(a+n),s]}function c([e,t,i]){if(0===t)return r([255*i,255*i,255*i]);let a=i<.5?i*(1+t):i+t-i*t,n=2*i-a,s=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?n+(a-n)*6*e:e<.5?a:e<2/3?n+(a-n)*(2/3-e)*6:n;return r([255*s(e+1/3),255*s(e),255*s(e-1/3)])}function u(e,t="#ffffff"){var i;let a,m,_=n(e)??"#2638f0",h=.18>d(n(t)??"#ffffff"),p=4.5>o(_,"#ffffff"),[f,y,b]=l(s(_)),g=c([f,y,p?Math.min(1,b+.08):Math.max(0,b-.07)]),v=(i=h?.82:.9,a=s(_),m=s(t),r([0,1,2].map(e=>a[e]*(1-i)+m[e]*i))),x=(e,t,i)=>h?function(e,t,i){let[a,n,r]=l(s(e)),d=e;for(;o(d,t)<i&&r<1;)d=c([a,n,r=Math.min(1,r+.01)]);return d}(e,t,i):function(e,t,i){let[a,n,r]=l(s(e)),d=e;for(;o(d,t)<i&&r>0;)d=c([a,n,r=Math.max(0,r-.01)]);return d}(e,t,i),w=x(_,v,4.5),N=x(_,t,4.5),j=x(_,t,3);return{accent:_,onAccent:p?"#000000":"#ffffff",hover:g,soft:v,ink:w,text:N,line:j,darkText:p,textDeepened:N!==_}}let m=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),_=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,m,"monogram",0,_,"normaliseHex",0,n,"paletteFor",0,u],54626);let h={classic:{id:"classic",name:"Classic",tagline:"Light and clear — white studio, ink type, your colour for actions",surface:"#ffffff",canvas:"#f4f5f8",ink:"#121521",dark:!1,accent:"#2638f0",secondary:"#ffb089",presets:[{name:"Swayvo",accent:"#2638f0",secondary:"#ffb089"},{name:"Eucalyptus",accent:"#0b3b34",secondary:"#c86a4f"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and after-dark — night grounds, wide type, vivid accents",surface:"#141826",canvas:"#0b0d16",ink:"#f3f4f8",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},p=e=>h["urban"===e?"urban":"classic"];function f(e,t,i){let a=p(e);return{theme:a,accent:n(t)??a.accent,secondary:n(i)??a.secondary}}e.s(["THEMES",0,h,"schoolColours",0,f,"themeOf",0,p],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[0.6875rem] text-ink-3",e),children:["powered by",(0,t.jsx)(a.SwayvoLogo,{className:"swayvo-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Swayvo"}),(0,t.jsx)(a.SwayvoLogo,{className:"swayvo-on-dark h-[0.95em] translate-y-[0.06em]",tone:"white",title:null})]})},"SchoolHero",0,function({src:e,name:i,children:a}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${i}`,className:"aspect-[16/7] w-full object-cover"}),a&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:a})]}):null},"SchoolMark",0,function({name:e,logo:i,className:a}){return i?(0,t.jsx)("img",{src:i,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",a)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[0.8125rem] font-semibold text-on-accent",a),children:_(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,a=e?.brand_colour??null,n=e?.brand_secondary??null,s=!!e;i.useEffect(()=>{let e=document.documentElement,i=[...Object.keys(m(u(null))),"--color-secondary"];if(!s){i.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let r=f(t,a,n);e.dataset.theme=r.theme.id,Object.entries(m(u(r.accent,r.theme.surface))).forEach(([t,i])=>e.style.setProperty(t,i)),e.style.setProperty("--color-secondary",r.secondary);let d=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});d.setAttribute("content",r.theme.dark?r.theme.canvas:r.theme.surface),d.parentNode||document.head.appendChild(d)},[s,t,a,n])}],33405)},28793,e=>{"use strict";var t=e.i(71645),i=e.i(12598),a=e.i(30224),n=e.i(31502),s=e.i(50293);let r="";e.s(["useDueReminders",0,function(){let{session:e}=(0,n.useSession)(),d=(0,i.useQueryClient)();t.useEffect(()=>{e&&"guardian"===e.role&&r!==e.userId&&(r=e.userId,(0,a.runAs)(e,e=>e(s.NOTIFY_DUE)).then(e=>{e[0]?.n&&d.invalidateQueries({queryKey:["db"]})}).catch(()=>void 0))},[e,d])}])},75379,e=>{"use strict";let t="Europe/London",i=e=>e instanceof Date?e:new Date(e),a=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(i(e)),n=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(i(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=i(e),a=new Date,n=a.getFullYear()-t.getFullYear(),s=a.getMonth()-t.getMonth();return(s<0||0===s&&a.getDate()<t.getDate())&&(n-=1),n},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(i(e)),"dateShort",0,n,"dayName",0,a,"dayRange",0,function(e=0){let t=new Date,i=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),a=new Date(i);return a.setDate(a.getDate()+1),[i.toISOString(),a.toISOString()]},"initials",0,(...e)=>{let t=e.filter(Boolean).flatMap(e=>e.trim().split(/\s+/)).filter(Boolean);return(t.length>1?[t[0],t[t.length-1]]:t).map(e=>e[0]?.toUpperCase()??"").join("")},"isoDate",0,e=>{let a=i(e),n=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(a),s=e=>n.find(t=>t.type===e)?.value??"";return`${s("year")}-${s("month")}-${s("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=i(e),s=new Date,r=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(s.getFullYear(),s.getMonth(),s.getDate()))/864e5);return 0===r?"Today":1===r?"Tomorrow":-1===r?"Yesterday":r>1&&r<7?a(t):n(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(i(e)),"toDateInput",0,function(e){if(null==e||""===e)return"";if(e instanceof Date){if(Number.isNaN(e.getTime()))return"";let t=0===e.getUTCHours()&&0===e.getUTCMinutes()&&0===e.getUTCSeconds()&&0===e.getUTCMilliseconds(),i=t?e.getUTCFullYear():e.getFullYear(),a=(t?e.getUTCMonth():e.getMonth())+1,n=t?e.getUTCDate():e.getDate();return`${String(i).padStart(4,"0")}-${String(a).padStart(2,"0")}-${String(n).padStart(2,"0")}`}let t=String(e);return/^\d{4}-\d{2}-\d{2}/.test(t)?t.slice(0,10):""},"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),i=(t.getDay()+6)%7;t.setDate(t.getDate()-i),t.setHours(0,0,0,0);let a=new Date(t);return a.setDate(a.getDate()+7),[t.toISOString(),a.toISOString()]}])},59130,e=>{"use strict";let t={draft:{label:"Draft",tone:"neutral"},issued:{label:"Due",tone:"caution"},part_paid:{label:"Part paid",tone:"caution"},paid:{label:"Paid",tone:"positive"},void:{label:"Void",tone:"neutral"},refunded:{label:"Refunded",tone:"info"}};e.s(["invoiceState",0,function(e,i=new Date){return e.failed?{label:"Card declined",tone:"critical"}:e.overdue??function(e,t=new Date){let i,a;return!("issued"!==(i=e.status)&&"part_paid"!==i&&"refunded"!==i||!e.due_on||null!=e.total_minor&&null!=e.paid_minor&&Number(e.total_minor)<=Number(e.paid_minor))&&((a=e.due_on)instanceof Date?a.toISOString():String(a??"")).slice(0,10)<t.toISOString().slice(0,10)}(e,i)?{label:"part_paid"===e.status?"Overdue · part paid":"Overdue",tone:"caution"}:t[e.status]??t.draft}])},13927,e=>{"use strict";var t=e.i(66027),i=e.i(30224),a=e.i(31502);function n(e,s,r=[],d){let{session:o}=(0,a.useSession)();return(0,t.useQuery)({queryKey:["db",o?.userId??"anon",o?.studio??"",...e],queryFn:()=>(0,i.readAs)(o,s,r),staleTime:15e3,...d})}e.s(["useRow",0,function(e,t,i=[]){let a=n(e,t,i);return{...a,data:a.data?.[0]}},"useRows",0,n])},50293,e=>{"use strict";let t=`
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
          i.due_on desc nulls last, i.number desc`,a=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       i.subtotal_minor, i.discount_minor, i.note, i.void_reason,
       f.id as family_id, f.name as family_name, f.balance_minor as family_balance_minor,
       app.family_available_credit(f.id) as available_credit_minor,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue
  from invoice i join family f on f.id = i.family_id
 where i.id = $1`,n=`
select it.id, it.kind, it.description, it.quantity, it.unit_minor, it.discount_minor, it.total_minor,
       s.first_name as student_name
  from invoice_item it left join student s on s.id = it.student_id
 where it.invoice_id = $1 and it.deleted_at is null
 order by it.created_at`,s=`
select id, amount_minor, refunded_minor, method, provider, failure_code, succeeded_at, created_at, note, credit_note_id
  from payment where invoice_id = $1 and deleted_at is null
 order by created_at`,r=`
select f.id, f.name, f.balance_minor,
       (select g.full_name from guardian g
         where g.family_id = f.id and g.deleted_at is null order by g.is_primary desc limit 1) as guardian
  from family f where f.deleted_at is null order by f.name`,d=`
select s.id as student_id, s.first_name as student_name, c.id as class_id, c.name as class_name,
       coalesce(e.price_minor, c.price_minor) as price_minor, c.pricing
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where s.family_id = $1 and e.status = 'active' and e.deleted_at is null and c.deleted_at is null
 order by s.first_name, c.name`,o=`
select id, number, amount_minor, reason, applied_minor, refunded_minor, account_minor, created_at
  from credit_note where invoice_id = $1 order by created_at`,l=`
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
  from l order by at, array_position(array['invoice','payment','credit','credit_note','refund'], kind)`,u=`
select f.id as family_id, f.name as family_name, sum(i.total_minor - i.paid_minor)::bigint as overdue_minor,
       string_agg(i.number, ', ' order by i.due_on, i.number) as invoices, min(i.due_on) as oldest_due,
       app.last_payment_reminder(f.id) as last_reminded,
       exists (select 1 from guardian g where g.family_id = f.id and g.user_id is not null and g.deleted_at is null) as uses_app
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null and i.status in ('issued','part_paid','refunded')
   and i.total_minor > i.paid_minor and i.due_on < current_date
 group by f.id, f.name order by min(i.due_on), f.name`,m=`
select app.fill_payment_reminder($1, $2) as subject, app.fill_payment_reminder($1, $3) as body`,_=`
select b.studio_id, b.payee_name, b.sort_code, b.account_number, b.iban, b.updated_at
  from studio_bank_details b where b.studio_id = $1`,h=`
select f.id as family_id, app.payment_reference(f.name, f.id) as reference,
       b.payee_name, b.sort_code, b.account_number, b.iban
  from family f left join studio_bank_details b on b.studio_id = f.studio_id
 where f.deleted_at is null and f.id in (select app.guardian_family_ids())
 order by f.created_at limit 1`,p=`
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`,f=`
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`,y=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`,b=`
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`,g=`
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.deleted_at is null and d.ended_at is null and (d.ends_on is null or d.ends_on >= current_date)
 order by f.name`,v=`
insert into family_discount (family_id, kind, amount, reason, note, starts_on, ends_on)
values ($1, $2, $3, $4, nullif($5, ''), coalesce($6::date, current_date), $7::date) returning id`,x=`
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
  from lines order by number, ord, created_at`,w=`
select family_name as family, round(current_minor / 100.0, 2) as "0-30 days", round(d31_60 / 100.0, 2) as "31-60 days",
       round(d61_90 / 100.0, 2) as "61-90 days", round(d90_plus / 100.0, 2) as "90+ days", round(total / 100.0, 2) as total
  from app.aged_debt((select id from studio where app.is_admin(id) order by name limit 1))`,N=`
select i.number, f.name as family, i.status::text as status, i.issued_on, i.due_on,
       round(i.subtotal_minor / 100.0, 2) as subtotal, round(i.discount_minor / 100.0, 2) as discount,
       round(i.total_minor / 100.0, 2) as total, round(i.paid_minor / 100.0, 2) as paid,
       round((i.total_minor - i.paid_minor) / 100.0, 2) as outstanding, t.name as term
  from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
 where i.deleted_at is null order by i.number`,j=`
select p.succeeded_at::date as date, f.name as family, i.number as invoice, p.method,
       round(p.amount_minor / 100.0, 2) as amount,
       case when p.failure_code is not null then 'failed' when p.succeeded_at is null then 'pending' else 'succeeded' end as status,
       p.provider_ref as reference
  from payment p join family f on f.id = p.family_id left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null order by p.created_at`;e.s(["ADD_FAMILY_CREDIT",0,"select app.add_family_credit($1, $2, $3) as id","ADD_FAMILY_DISCOUNT",0,v,"AGED_DEBT_EXPORT",0,w,"BANK_DETAILS",0,_,"BILLING_LINES",0,"select * from app.billing_lines($1, $2::date, $3::uuid[])","BILLING_RUNS",0,b,"BILLING_SKIPPED",0,"select * from app.billing_skipped($1, $2::date)","BILLING_TERMS",0,"select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc","CREATE_BILLING_RUN",0,"select app.create_billing_run($1, $2::date, $3::date, $4::uuid[], $5) as id","CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","DISCARD_BILLING_RUN",0,"select app.discard_billing_run($1)","DISCOUNT_RULES",0,"select id, kind, from_nth, percent, enabled from discount_rule order by kind desc","END_FAMILY_DISCOUNT",0,"select app.end_family_discount($1)","FAMILY_ACCOUNT",0,l,"FAMILY_BILLABLE",0,d,"FAMILY_DISCOUNTS",0,g,"FAMILY_OPTIONS",0,r,"FAMILY_PICK",0,"select id, name from family where deleted_at is null and not is_prospect order by name","FAMILY_STATEMENT",0,c,"INVOICE",0,a,"INVOICES",0,i,"INVOICES_EXPORT",0,N,"INVOICE_CREDIT_NOTES",0,o,"INVOICE_ITEMS",0,n,"INVOICE_PAYMENTS",0,s,"ISSUE_BILLING_RUN",0,"select app.issue_billing_run($1) as n","ISSUE_CREDIT_NOTE",0,"select app.issue_credit_note($1, $2, $3, $4) as id","ISSUE_INVOICE",0,"select app.issue_invoice($1)","MY_PAYMENT_INFO",0,h,"NOTIFY_DUE",0,"select app.notify_invoices_due() as n","OVERDUE_FAMILIES",0,u,"PAYMENTS_EXPORT",0,j,"PRIMARY_GUARDIAN",0,f,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3, $4)","REMINDER_PREVIEW",0,m,"REMINDER_TEMPLATE",0,p,"SEND_DIRECT",0,y,"SEND_REMINDERS",0,"select app.send_payment_reminders($1::uuid[], $2, $3) as sent","SET_BANK_DETAILS",0,"select app.set_bank_details($1, $2, $3, $4, $5)","SET_DISCOUNT_RULE",0,"update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id","SUMMARY",0,t,"UPCOMING_COSTS",0,"select * from app.upcoming_costs($1::uuid)","VOID_INVOICE",0,"select app.void_invoice($1, $2)","XERO_EXPORT",0,x])},8199,e=>{"use strict";let t=`
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
 order by s.date_of_birth`,a=`
select f.id, f.name, f.balance_minor,
       (select count(*)::int from invoice i
         where i.family_id = f.id and i.deleted_at is null and i.status in ('issued','part_paid')) as unpaid,
       (select count(*)::int from payment p
         where p.family_id = f.id and p.deleted_at is null
           and p.failure_code is not null and p.succeeded_at is null) as failed
  from family f where f.deleted_at is null`,n=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor
  from invoice i where i.deleted_at is null and i.status <> 'draft'   -- drafts are the office's until sent
 order by i.issued_on desc nulls last limit 8`,s=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at, c.name as class_name
  from communication cm
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
   and not cm.inbound          -- only what the studio sent, never the family's own messages (R-047)
 order by cm.sent_at desc limit 8`,r=`
select g.id, g.full_name, g.email, g.phone, g.relationship, g.user_id = auth.uid() as is_me
  from guardian g where g.deleted_at is null and g.family_id in (select app.guardian_family_ids())
 order by (g.user_id = auth.uid()) desc nulls last, g.is_primary desc, g.full_name`,d=`
update guardian set full_name = $2, email = nullif($3, ''), phone = nullif($4, ''), updated_at = now() where id = $1`,o=`
select c.id, c.student_id, c.full_name, c.relationship, c.phone from collection_permission c
 where c.deleted_at is null and c.allowed order by c.created_at`,l=`
insert into collection_permission (student_id, full_name, relationship, phone, allowed)
values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), true) returning id`,c=`
select ec.id, ec.student_id, ec.full_name, ec.relationship, ec.phone from emergency_contact ec
 where ec.deleted_at is null and ec.student_id in (select app.guardian_student_ids())
 order by ec.priority, ec.created_at`,u=`
insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
select s.studio_id, s.id, $2, nullif($3, ''), $4,
       coalesce((select max(priority) + 1 from emergency_contact where student_id = s.id and deleted_at is null), 1)
  from student s where s.id = $1`,m=`
update emergency_contact set full_name = $2, relationship = nullif($3, ''), phone = $4, updated_at = now() where id = $1`,_=`
select d.id, d.student_id, s.first_name, c.name as class_name, cs.starts_at,
       case when d.pack_purchase_id is not null then 'pack' when d.invoice_id is not null then 'invoice' else 'free' end as paid_with
  from drop_in_booking d join student s on s.id = d.student_id join class_session cs on cs.id = d.session_id join class c on c.id = cs.class_id
 where d.status = 'booked' and cs.starts_at > now() order by cs.starts_at`,h=`select p.id, s.first_name, k.name, p.remaining, p.expires_on from pack_purchase p
  join student s on s.id = p.student_id join class_pack k on k.id = p.pack_id
 where p.remaining > 0 and p.expires_on >= current_date order by p.expires_on`;e.s(["ADD_COLLECTOR",0,l,"ADD_CONTACT",0,u,"ASK_TO_CHANGE_GUARDIAN",0,"select app.ask_to_change_guardian($1, $2) as id","BOOK_DROP_IN",0,"select app.book_drop_in($1, $2) as r","BOOK_TRIAL",0,"select app.parent_book_trial($1, $2) as result","BUY_PACK",0,"select app.buy_pack($1, $2) as id","CANCEL_DROP_IN",0,"select app.cancel_drop_in($1) as r","CLASS_OPTIONS",0,"select * from app.class_options_for_child($1)","DROP_IN_SESSIONS",0,"select d.* from studio s, app.drop_in_sessions(s.id) d where s.id in (select app.studio_ids()) order by d.starts_at","INVITE_STUDENT",0,"select app.guardian_invite_student($1, $2) as token","JOIN_WAITLIST",0,"select app.parent_join_waitlist($1, $2) as position","MY_BALANCE",0,a,"MY_CHILDREN",0,i,"MY_CHILDREN_LOGINS",0,"select * from app.my_children_logins()","MY_COLLECTORS",0,o,"MY_CONTACTS",0,c,"MY_DROP_INS",0,_,"MY_GUARDIANS",0,r,"MY_INVOICES",0,n,"MY_MESSAGES",0,s,"MY_PACKS",0,h,"MY_SCHEDULE",0,t,"PACKS",0,"select id, name, classes, price_minor, valid_days from class_pack where active order by classes","REMOVE_COLLECTOR",0,"select app.remove_collection_person($1)","REMOVE_CONTACT",0,"select app.remove_emergency_contact($1)","REQUEST_CHILD",0,"select app.request_new_child($1::jsonb) as id","REQUEST_PLACE",0,"select app.request_class_place($1, $2, $3) as id","SET_STUDENT_LOGIN",0,"select app.set_student_login($1, $2) as r","UPDATE_CONTACT",0,m,"UPDATE_GUARDIAN",0,d])},33204,e=>{"use strict";let t=`
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
       c.private_to is not null as private, app.sender_name(c.private_to, c.studio_id) as private_name,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.family_id = $1 and c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`,a=`
select c.id, c.subject, c.body, c.sent_at, c.inbound, c.reply_to, c.request_id is not null as is_request,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`,n=`
select c.id, c.kind, c.subject, c.body, c.sent_at, c.class_id, cl.name as class_name, c.sent_at > now() as scheduled,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c left join class cl on cl.id = c.class_id
 where c.kind in ('class_broadcast', 'studio_announcement') and c.deleted_at is null
 order by c.sent_at desc
 limit 60`,s=`
select c.id, c.name, sm.display_name as teacher,
       (select count(distinct s.family_id)::int from enrolment e join student s on s.id = e.student_id
         where e.class_id = c.id and e.status = 'active' and e.deleted_at is null) as families
  from class c left join staff_member sm on sm.id = c.teacher_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`,r=`
select id, name, subject, body from communication_template
 where deleted_at is null order by name`,d=`
insert into communication_template (studio_id, name, subject, body)
select studio_id, $1, nullif(btrim($2), ''), $3 from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,o=`
update communication_template set name = $2, subject = nullif(btrim($3), ''), body = $4, updated_at = now()
 where id = $1 returning id`,l=`
insert into communication (studio_id, kind, channel, family_id, subject, body)
select studio_id, 'direct', 'in_app', id, nullif(btrim($2), ''), btrim($3) from family where id = $1
returning id`,c=`
insert into communication (studio_id, kind, channel, family_id, body, reply_to)
select studio_id, 'direct', 'in_app', id, btrim($2), $3::uuid from family where id = $1
returning id`,u=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_at)
select studio_id, 'direct', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from family where id = $1
returning id`,m=`
insert into communication (studio_id, kind, channel, class_id, subject, body)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3) from class where id = $1
returning id`,_=`
insert into communication (studio_id, kind, channel, class_id, subject, body, sent_at)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from class where id = $1
returning id`,h=`
insert into communication (studio_id, kind, channel, subject, body)
select studio_id, 'studio_announcement', 'in_app', nullif(btrim($1), ''), btrim($2) from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,p=`
insert into communication (studio_id, kind, channel, subject, body, sent_at)
select studio_id, 'studio_announcement', 'in_app', nullif(btrim($1), ''), btrim($2), $3::timestamptz from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,f=`
select app.release_scheduled(m.studio_id) as n from membership m
 where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1`,y=`
insert into communication (studio_id, kind, channel, family_id, subject, body, reply_to)
select studio_id, 'direct', 'in_app', family_id, nullif(btrim($1), ''), btrim($2), $3::uuid
  from guardian where user_id = auth.uid() and deleted_at is null and app.in_scope(studio_id)
 limit 1 returning id`,b=`
select id, kind, title, body, href, read_at, created_at from notification
 where deleted_at is null order by created_at desc limit 40`,g=`
select count(*)::int as n from notification where deleted_at is null and read_at is null`,v=`
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
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,n,"CLASS_AUDIENCES",0,s,"CONVERSATION",0,i,"CREATE_TEMPLATE",0,d,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,a,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,b,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,w,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,f,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,v,"RUN_AUTOMATIONS",0,x,"SEND_CLASS",0,m,"SEND_CLASS_AT",0,_,"SEND_DIRECT",0,l,"SEND_DIRECT_AT",0,u,"SEND_REPLY",0,c,"SEND_STUDIO",0,h,"SEND_STUDIO_AT",0,p,"SEND_TO_STUDIO",0,y,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,r,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,g,"UPDATE_TEMPLATE",0,o])}]);