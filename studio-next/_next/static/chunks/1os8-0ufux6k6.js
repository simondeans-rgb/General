(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var i=e.i(12598),n=e.i(71645);let a=n.createContext(!1);a.Provider,e.i(43476);let s=n.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var r=e.i(19273),d=e.i(40143),o=e.i(80166),l=e.i(73911),c=e.i(15823),u=e.i(75555),_=e.i(86491),m=class extends c.Subscribable{#e;#t=void 0;#i=void 0;#n=void 0;#a;#s;#r;#d;#o;#l;#c;#u;#_;#m=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#r=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),f(this.#t,this.options)?this.#f():this.updateResult(),this.#p())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return p(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return p(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#h(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,i=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,r.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,r.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let n=this.hasListeners();n&&h(this.#t,i,this.options,t)&&this.#f(),this.updateResult(),n&&(this.#t!==i||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||(0,r.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,r.resolveStaleTime)(t.staleTime,this.#t))&&this.#g();let a=this.#v();n&&(this.#t!==i||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||a!==this.#_)&&this.#w(a)}getOptimisticResult(e){var t,i;let n=this.#e.getQueryCache().build(this.#e,e),a=this.createResult(n,e);return t=this,i=a,(0,r.shallowEqualObjects)(t.getCurrentResult(),i)||(this.#n=a,this.#s=this.options,this.#a=this.#t.state),a}getCurrentResult(){return this.#n}trackResult(e,t){return new Proxy(e,{get:(e,i)=>(this.trackProp(i),t?.(i),Reflect.get(e,i))})}trackProp(e){this.#m.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,i=this.#e.defaultQueryOptions(e),n=this.#e.getQueryCache().build(this.#e,i),a=()=>{},s=new Promise(e=>{t=e,a=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===n.queryHash&&void 0!==n.state.data&&(a(),e(this.createResult(n,i)))})});return Promise.race([n.fetch().then(()=>{let e=this.createResult(n,i);return t?.(e),e}).finally(()=>{a()}),s])}fetch(e){return this.#f({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#n))}#f(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(r.noop)),t}#g(){this.#h();let e=(0,r.resolveStaleTime)(this.options.staleTime,this.#t);if(l.environmentManager.isServer()||this.#n.isStale||!(0,r.isValidTimeout)(e))return;let t=(0,r.timeUntilStale)(this.#n.dataUpdatedAt,e)+1;this.#c=o.timeoutManager.setTimeout(()=>{this.#n.isStale||this.updateResult()},t)}#v(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#w(e){this.#y(),this.#_=e,!l.environmentManager.isServer()&&!1!==(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,r.isValidTimeout)(this.#_)&&0!==this.#_&&(this.#u=o.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#f()},this.#_))}#p(){this.#g(),this.#w(this.#v())}#h(){void 0!==this.#c&&(o.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(o.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let i,n=this.#t,a=this.options,s=this.#n,d=this.#a,o=this.#s,l=e!==n?e.state:this.#i,{state:c}=e,u={...c},m=!1;if(t._optimisticResults){let i=this.hasListeners(),s=!i&&f(e,t),r=i&&h(e,n,t,a);(s||r)&&(u={...u,...(0,_.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:p,errorUpdatedAt:b,status:g}=u;i=u.data;let v=!1;if(void 0!==t.placeholderData&&void 0===i&&"pending"===g){let e;s?.isPlaceholderData&&t.placeholderData===o?.placeholderData?(e=s.data,v=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#l?.state.data,this.#l):t.placeholderData,void 0!==e&&(g="success",i=(0,r.replaceData)(s?.data,e,t),m=!0)}if(t.select&&void 0!==i&&!v)if(s&&i===d?.data&&t.select===this.#d)i=this.#o;else try{this.#d=t.select,i=t.select(i),i=(0,r.replaceData)(s?.data,i,t),this.#o=i,this.#r=null}catch(e){this.#r=e}else void 0===i&&(this.#r=null);this.#r&&(p=this.#r,i=this.#o,b=Date.now(),g="error",m=!1);let w="fetching"===u.fetchStatus,I="pending"===g,$="error"===g,R=I&&w,E=void 0!==i;return{status:g,fetchStatus:u.fetchStatus,isPending:I,isSuccess:"success"===g,isError:$,isInitialLoading:R,isLoading:R,data:i,dataUpdatedAt:u.dataUpdatedAt,error:p,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>l.dataUpdateCount||u.errorUpdateCount>l.errorUpdateCount,isFetching:w,isRefetching:w&&!I,isLoadingError:$&&!E,isPaused:"paused"===u.fetchStatus,isPlaceholderData:m,isRefetchError:$&&E,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,r.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#n,t=this.createResult(this.#t,this.options);if(this.#a=this.#t.state,this.#s=this.options,void 0!==this.#a.data&&(this.#l=this.#t),(0,r.shallowEqualObjects)(t,e))return;this.#n=t;let i=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,i="function"==typeof t?t():t;if("all"===i||!i&&!this.#m.size)return!0;let n=new Set(i??this.#m);return this.options.throwOnError&&n.add("error"),Object.keys(this.#n).some(t=>this.#n[t]!==e[t]&&n.has(t))};this.#I({listeners:i()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#i=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#p()}#I(e){d.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#n)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function f(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,r.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&p(e,t,t.refetchOnMount)}function p(e,t,i){if(!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,r.resolveStaleTime)(t.staleTime,e)){let n="function"==typeof i?i(e):i;return"always"===n||!1!==n&&y(e,t)}return!1}function h(e,t,i,n){return(e!==t||!1===(0,r.resolveQueryBoolean)(n.enabled,e))&&(!i.suspense||"error"!==e.state.status)&&y(e,i)}function y(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,r.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,o){let l,c=n.useContext(a),u=n.useContext(s),_=(0,i.useQueryClient)(o),m=_.defaultQueryOptions(e),f=_.getQueryCache().get(m.queryHash),p=!1!==e.subscribed;if(m._optimisticResults=c?"isRestoring":p?"optimistic":void 0,m.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=m.staleTime;m.staleTime="function"==typeof t?(...i)=>e(t(...i)):e(t),"number"==typeof m.gcTime&&(m.gcTime=Math.max(m.gcTime,1e3))}l=f?.state.error&&"function"==typeof m.throwOnError?(0,r.shouldThrowError)(m.throwOnError,[f.state.error,f]):m.throwOnError,(m.suspense||l)&&!u.isReset()&&(m.retryOnMount=!1),n.useEffect(()=>{u.clearReset()},[u]);let[h]=n.useState(()=>new t(_,m)),y=h.getOptimisticResult(m),b=!c&&p;if(n.useSyncExternalStore(n.useCallback(e=>{let t=b?h.subscribe(d.notifyManager.batchCalls(e)):r.noop;return h.updateResult(),t},[h,b]),()=>h.getCurrentResult(),()=>h.getCurrentResult()),n.useEffect(()=>{h.setOptions(m)},[m,h]),m?.suspense&&y.isPending)throw h.fetchOptimistic(m).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:i,query:n,suspense:a})=>e.isError&&!t.isReset()&&!e.isFetching&&n&&(a&&void 0===e.data||(0,r.shouldThrowError)(i,[e.error,n])))({result:y,errorResetBoundary:u,throwOnError:m.throwOnError,query:f,suspense:m.suspense}))throw y.error;return m.notifyOnChangeProps?y:h.trackResult(y)}(e,m,t)}],66027)},3281,e=>{"use strict";let t=(0,e.i(75254).default)("printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);e.s(["Printer",0,t],3281)},24137,e=>{"use strict";var t=e.i(43476),i=e.i(71645),n=e.i(22016),a=e.i(18566),s=e.i(3281),r=e.i(13927),d=e.i(31502),o=e.i(17658),l=e.i(8199),c=e.i(50293),u=e.i(75379);let _={card:"Card",direct_debit:"Direct debit",bank_transfer:"Bank transfer",cash:"Cash",credit:"Credit from the studio",account:"Credit on your account"};function m(){let e=(0,a.useSearchParams)().get("id")??"",{session:i}=(0,d.useSession)(),m=(0,r.useRow)(["receipt",e],l.MY_RECEIPT,[e]),f=(0,r.useRows)(["invoice-items",m.data?.invoice_id??""],c.INVOICE_ITEMS,[m.data?.invoice_id??null],{enabled:!!m.data?.invoice_id}),p=m.data;return(0,t.jsx)("main",{id:"main",className:"min-h-dvh bg-surface px-4 pb-12 pt-6 print:p-0",children:(0,t.jsxs)("div",{className:"mx-auto max-w-xl",children:[(0,t.jsxs)("div",{className:"mb-6 flex items-center gap-3 print:hidden",children:[(0,t.jsx)(n.default,{href:"/family/payments",className:"text-[0.875rem] font-semibold text-accent-text hover:underline",children:"Back to payments"}),p&&(0,t.jsxs)(o.Button,{size:"sm",className:"ml-auto",onClick:()=>window.print(),children:[(0,t.jsx)(s.Printer,{className:"size-4","aria-hidden":!0})," Print or save as PDF"]})]}),!i&&(0,t.jsx)(o.EmptyState,{title:"Sign in to see this receipt",body:"Receipts are shown to the family who paid."}),i&&m.isLoading&&(0,t.jsx)(o.Skeleton,{className:"h-64"}),null!=m.error&&(0,t.jsx)(o.ErrorState,{error:m.error}),i&&!m.isLoading&&!p&&!m.error&&(0,t.jsx)(o.EmptyState,{title:"Receipt not found",body:"It may belong to another account. Open it from your payments."}),p&&(0,t.jsxs)("article",{"aria-labelledby":"rc-h",children:[(0,t.jsxs)("header",{className:"border-b-2 border-ink pb-3",children:[(0,t.jsx)("p",{className:"font-display text-[1.375rem] leading-tight",children:p.studio_name}),(0,t.jsxs)("h1",{id:"rc-h",className:"mt-3 text-[1.0625rem] font-semibold",children:["Receipt ",(0,t.jsx)("span",{className:"tnum",children:p.reference})]})]}),(0,t.jsx)("dl",{className:"divide-y divide-line text-[0.9375rem]",children:[["Amount received",(0,t.jsx)("span",{className:"stat-number text-[1.75rem] leading-none tnum",children:(0,u.money)(p.amount_minor)},"a")],["Date",`${(0,u.dateLong)(p.succeeded_at)}, ${(0,u.time)(p.succeeded_at)}`],["Paid by",p.payer??p.family_name],["Account",p.family_name],["Method",_[p.method]??p.method],["For",p.invoice_number?`Invoice ${p.invoice_number}`:"Held on account for the next invoice"],...Number(p.refunded_minor)>0?[["Refunded",(0,u.money)(p.refunded_minor)]]:[]].map(([e,i])=>(0,t.jsxs)("div",{className:"grid grid-cols-[9rem_minmax(0,1fr)] gap-x-4 py-2.5",children:[(0,t.jsx)("dt",{className:"text-ink-3",children:e}),(0,t.jsx)("dd",{className:"min-w-0",children:i})]},e))}),!!f.data?.length&&(0,t.jsxs)("section",{"aria-labelledby":"rc-items",className:"mt-6",children:[(0,t.jsxs)("h2",{id:"rc-items",className:"section-title border-b-2 border-ink pb-2",children:["Invoice ",p.invoice_number]}),(0,t.jsxs)("ul",{className:"divide-y divide-line text-[0.9062rem]",children:[f.data.map(e=>(0,t.jsxs)("li",{className:"flex gap-4 py-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[e.student_name?(0,t.jsxs)("span",{className:"text-ink-3",children:[e.student_name," · "]}):null,e.description]}),(0,t.jsx)("span",{className:"tnum",children:(0,u.money)(e.total_minor)})]},e.id)),(0,t.jsxs)("li",{className:"flex gap-4 py-2 font-semibold",children:[(0,t.jsx)("span",{className:"flex-1",children:"Invoice total"}),(0,t.jsx)("span",{className:"tnum",children:(0,u.money)(p.invoice_total)})]}),(0,t.jsxs)("li",{className:"flex gap-4 py-2 text-ink-2",children:[(0,t.jsx)("span",{className:"flex-1",children:"Left to pay on this invoice"}),(0,t.jsx)("span",{className:"tnum",children:(0,u.money)(Math.max(0,Number(p.invoice_total)-Number(p.invoice_paid)))})]})]})]}),(0,t.jsxs)("p",{className:"mt-8 text-[0.7812rem] text-ink-3",children:["Issued by ",p.studio_name," through Swayvo. Keep this receipt for your records."]})]})]})})}e.s(["default",0,function(){return(0,t.jsx)(i.Suspense,{fallback:(0,t.jsx)("div",{className:"min-h-dvh"}),children:(0,t.jsx)(m,{})})}])},75379,e=>{"use strict";let t="Europe/London",i=e=>e instanceof Date?e:new Date(e),n=e=>{let n=i(e),a=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(n),s=e=>a.find(t=>t.type===e)?.value??"";return`${s("year")}-${s("month")}-${s("day")}`},a=e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(i(e)),s=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(i(e)):"—";function r(e,a=new Date){let s=i(e),d=n(s).slice(0,4)!==n(a).slice(0,4),o=new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:t,...d?{year:"numeric"}:{}}).formatToParts(s),l=e=>o.find(t=>t.type===e)?.value??"";return`${l("weekday")} ${l("day")} ${l("month")}${d?` ${l("year")}`:""}`}function d(e,t=new Date){let i=function(e,t=new Date){let i=e=>Date.parse(n(e)+"T00:00:00Z");return Math.round((i(e)-i(t))/864e5)}(e,t);return 0===i?"Today":1===i?"Tomorrow":-1===i?"Yesterday":r(e,t)}e.s(["ageFrom",0,function(e){if(!e)return null;let t=i(e),n=new Date,a=n.getFullYear()-t.getFullYear(),s=n.getMonth()-t.getMonth();return(s<0||0===s&&n.getDate()<t.getDate())&&(a-=1),a},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(i(e)),"dateShort",0,s,"dayDate",0,r,"dayDateTime",0,(e,t=new Date)=>`${d(e,t)}, ${a(e)}`,"dayHeading",0,function(e,t=new Date){let i=d(e,t);return"Today"===i||"Tomorrow"===i||"Yesterday"===i?`${i} \xb7 ${s(e)}`:i},"dayName",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(i(e)),"dayRange",0,function(e=0){let t=new Date,i=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),n=new Date(i);return n.setDate(n.getDate()+1),[i.toISOString(),n.toISOString()]},"initials",0,(...e)=>{let t=e.filter(Boolean).flatMap(e=>e.trim().split(/\s+/)).filter(Boolean);return(t.length>1?[t[0],t[t.length-1]]:t).map(e=>e[0]?.toUpperCase()??"").join("")},"isoDate",0,n,"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,d,"time",0,a,"toDate",0,i,"toDateInput",0,function(e){if(null==e||""===e)return"";if(e instanceof Date){if(Number.isNaN(e.getTime()))return"";let t=0===e.getUTCHours()&&0===e.getUTCMinutes()&&0===e.getUTCSeconds()&&0===e.getUTCMilliseconds(),i=t?e.getUTCFullYear():e.getFullYear(),n=(t?e.getUTCMonth():e.getMonth())+1,a=t?e.getUTCDate():e.getDate();return`${String(i).padStart(4,"0")}-${String(n).padStart(2,"0")}-${String(a).padStart(2,"0")}`}let t=String(e);return/^\d{4}-\d{2}-\d{2}/.test(t)?t.slice(0,10):""},"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),i=(t.getDay()+6)%7;t.setDate(t.getDate()-i),t.setHours(0,0,0,0);let n=new Date(t);return n.setDate(n.getDate()+7),[t.toISOString(),n.toISOString()]}])},13927,e=>{"use strict";var t=e.i(66027),i=e.i(30224),n=e.i(31502);function a(e,s,r=[],d){let{session:o}=(0,n.useSession)();return(0,t.useQuery)({queryKey:["db",o?.userId??"anon",o?.studio??"",...e],queryFn:()=>(0,i.readAs)(o,s,r),staleTime:15e3,...d})}e.s(["useRow",0,function(e,t,i=[]){let n=a(e,t,i);return{...n,data:n.data?.[0]}},"useRows",0,a])},50293,e=>{"use strict";let t=`
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
with loc as (select id from location where name = $1 and deleted_at is null),
m as (select lm.* from location_money lm where lm.location_id in (select id from loc)),
fam_here as (select distinct s.family_id from enrolment e join student s on s.id = e.student_id join class c on c.id = e.class_id
              where e.status = 'active' and e.deleted_at is null and c.location_id in (select id from loc)),
inv_here as (select i.* from invoice i where i.deleted_at is null and (
               exists (select 1 from invoice_item ii join class c on c.id = ii.class_id
                        where ii.invoice_id = i.id and ii.deleted_at is null and c.location_id in (select id from loc))
               or (not exists (select 1 from invoice_item ii where ii.invoice_id = i.id and ii.deleted_at is null and ii.class_id is not null)
                   and i.family_id in (select family_id from fam_here))))
select
  coalesce((select sum(outstanding_minor) from m), 0)::bigint as outstanding_minor,
  (select count(distinct family_id)::int from inv_here where status in ('issued','part_paid')) as owing_families,
  coalesce((select sum(overdue_minor) from m), 0)::bigint as overdue_minor,
  (select count(*)::int from inv_here where status in ('issued','part_paid','refunded') and due_on < current_date) as overdue_invoices,
  (select count(*)::int from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and p.invoice_id in (select id from inv_here where status in ('issued','part_paid'))) as failed_payments,
  coalesce((select sum(p.amount_minor) from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and p.invoice_id in (select id from inv_here where status in ('issued','part_paid'))), 0)::bigint as failed_minor,
  coalesce((select sum(collected_30d_minor) from m), 0)::bigint as collected_30d_minor,
  coalesce((select -sum(balance_minor) from family where deleted_at is null and balance_minor < 0
     and id in (select family_id from fam_here)), 0)::bigint as credit_minor`,n=e=>`array(select distinct l.name from student s
   join enrolment e on e.student_id = s.id and e.status = 'active' and e.deleted_at is null
   join class c on c.id = e.class_id join location l on l.id = c.location_id
  where s.family_id = ${e} and s.deleted_at is null order by l.name)`,a=`coalesce(nullif(array(select distinct l.name from invoice_item it
   join class c on c.id = it.class_id join location l on l.id = c.location_id
  where it.invoice_id = i.id and it.deleted_at is null order by l.name), '{}'), ${n("f.id")})`,s=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       f.id as family_id, f.name as family_name,
       (select g.full_name from guardian g where g.id = i.billed_guardian_id) as billed_to,
       (select coalesce(sum(p.amount_minor - p.refunded_minor), 0) from payment p
         where p.invoice_id = i.id and p.deleted_at is null and p.credit_note_id is not null)::bigint as credited_minor,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue,
       exists (select 1 from payment p where p.invoice_id = i.id and p.deleted_at is null
                and p.failure_code is not null and p.succeeded_at is null)
         and i.status in ('issued','part_paid') as failed,
       (select string_agg(description, ', ' order by created_at) from invoice_item it
         where it.invoice_id = i.id and it.deleted_at is null) as lines,
       ${a} as locations
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null
 order by (i.status = 'draft') desc,
          (i.status in ('issued','part_paid','refunded')) desc,
          i.due_on desc nulls last, i.number desc`,r=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       i.subtotal_minor, i.discount_minor, i.note, i.void_reason,
       f.id as family_id, f.name as family_name, f.balance_minor as family_balance_minor,
       (select g.full_name from guardian g where g.id = i.billed_guardian_id) as billed_to,
       app.family_available_credit(f.id) as available_credit_minor,
       (select coalesce(sum(p.amount_minor - p.refunded_minor), 0) from payment p
         where p.invoice_id = i.id and p.deleted_at is null and p.credit_note_id is not null)::bigint as credited_minor,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue
  from invoice i join family f on f.id = i.family_id
 where i.id = $1`,d=`
select it.id, it.kind, it.description, it.quantity, it.unit_minor, it.discount_minor, it.total_minor,
       s.first_name as student_name
  from invoice_item it left join student s on s.id = it.student_id
 where it.invoice_id = $1 and it.deleted_at is null
 order by it.created_at`,o=`
select id, amount_minor, refunded_minor, method, provider, failure_code, succeeded_at, created_at, note, credit_note_id
  from payment where invoice_id = $1 and deleted_at is null
 order by created_at`,l=`
select f.id, f.name, f.balance_minor,
       (select g.full_name from guardian g
         where g.family_id = f.id and g.deleted_at is null order by g.is_primary desc, g.created_at limit 1) as guardian,
       (select string_agg(s.first_name, ', ' order by s.first_name) from student s
         where s.family_id = f.id and s.deleted_at is null) as children,
       f.postcode
  from family f where f.deleted_at is null order by f.name`,c=`
select s.id as student_id, s.first_name as student_name, c.id as class_id, c.name as class_name,
       coalesce(e.price_minor, c.price_minor) as price_minor, c.pricing
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where s.family_id = $1 and e.status = 'active' and e.deleted_at is null and c.deleted_at is null
 order by s.first_name, c.name`,u=`
select id, number, amount_minor, reason, applied_minor, refunded_minor, account_minor, created_at
  from credit_note where invoice_id = $1 order by created_at`,_=`
select f.id, f.name, f.balance_minor, app.family_available_credit(f.id) as credit_minor,
       coalesce((select sum(total_minor - paid_minor) from invoice i where i.family_id = f.id and i.deleted_at is null
                  and i.status in ('issued','part_paid','refunded')), 0)::bigint as open_minor,
       app.payment_reference(f.name, f.id) as reference
  from family f where f.id = $1 and f.deleted_at is null`,m=`
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
  from l order by at, array_position(array['invoice','payment','credit','credit_note','refund'], kind)`,f=`
select f.id as family_id, f.name as family_name, sum(i.total_minor - i.paid_minor)::bigint as overdue_minor,
       string_agg(i.number, ', ' order by i.due_on, i.number) as invoices, min(i.due_on) as oldest_due,
       app.last_payment_reminder(f.id) as last_reminded,
       exists (select 1 from guardian g where g.family_id = f.id and g.user_id is not null and g.deleted_at is null) as uses_app,
       ${n("f.id")} as locations
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null and i.status in ('issued','part_paid','refunded')
   and i.total_minor > i.paid_minor and i.due_on < current_date
 group by f.id, f.name order by min(i.due_on), f.name`,p=`
select app.fill_payment_reminder($1, $2) as subject, app.fill_payment_reminder($1, $3) as body`,h=`
select b.studio_id, b.payee_name, b.sort_code, b.account_number, b.iban, b.updated_at
  from studio_bank_details b where b.studio_id = $1`,y=`
select f.id as family_id, app.payment_reference(f.name, f.id) as reference,
       b.payee_name, b.sort_code, b.account_number, b.iban
  from family f left join studio_bank_details b on b.studio_id = f.studio_id
 where f.deleted_at is null and f.id in (select app.guardian_family_ids())
 order by f.created_at limit 1`,b=`
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`,g=`
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`,v=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`,w=`
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`,I=`
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.deleted_at is null and d.ended_at is null and (d.ends_on is null or d.ends_on >= current_date)
 order by f.name`,$=`
insert into family_discount (family_id, kind, amount, reason, note, starts_on, ends_on)
values ($1, $2, $3, $4, nullif($5, ''), coalesce($6::date, current_date), $7::date) returning id`,R=`
select f.id, f.name,
       (select g.full_name from guardian g
         where g.family_id = f.id and g.deleted_at is null order by g.is_primary desc, g.created_at limit 1) as guardian,
       (select string_agg(s.first_name, ', ' order by s.first_name) from student s
         where s.family_id = f.id and s.deleted_at is null) as children,
       f.postcode
  from family f where f.deleted_at is null and not f.is_prospect order by f.name`,E=`
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
  from lines order by number, ord, created_at`,S=`
select family_name as family, round(current_minor / 100.0, 2) as "0-30 days", round(d31_60 / 100.0, 2) as "31-60 days",
       round(d61_90 / 100.0, 2) as "61-90 days", round(d90_plus / 100.0, 2) as "90+ days", round(total / 100.0, 2) as total
  from app.aged_debt((select id from studio where app.is_admin(id) order by name limit 1)) a
 where $1::text is null or $1::text = any(${n("a.family_id")})`,T=`
select i.number, f.name as family, i.status::text as status, i.issued_on, i.due_on,
       round(i.subtotal_minor / 100.0, 2) as subtotal, round(i.discount_minor / 100.0, 2) as discount,
       round(i.total_minor / 100.0, 2) as total, round(i.paid_minor / 100.0, 2) as paid,
       round((i.total_minor - i.paid_minor) / 100.0, 2) as outstanding, t.name as term
  from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
 where i.deleted_at is null order by i.number`,N=`
select p.succeeded_at::date as date, f.name as family, i.number as invoice, p.method,
       round(p.amount_minor / 100.0, 2) as amount,
       case when p.failure_code is not null then 'failed' when p.succeeded_at is null then 'pending' else 'succeeded' end as status,
       p.provider_ref as reference
  from payment p join family f on f.id = p.family_id left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null order by p.created_at`,D=`
select coalesce(b.mode, 'family') as mode, b.guardian_a, b.guardian_b, b.percent_a
  from family f left join family_billing b on b.family_id = f.id
 where f.id = $1`,C=`
select id, full_name from guardian where family_id = $1 and deleted_at is null order by is_primary desc, full_name`,j=`
select s.id, s.first_name, x.guardian_id
  from student s left join family_billing_child x on x.student_id = s.id
 where s.family_id = $1 and s.deleted_at is null order by s.date_of_birth`,O=`
select ac.id, ac.created_at, ac.family_id, f.name as family_name, s.first_name as child,
       app.session_label(ac.session_id) as session_label, ac.amount_minor, ac.status
  from absence_credit ac join family f on f.id = ac.family_id join student s on s.id = ac.student_id
 order by ac.created_at desc limit 50`,x=`
select id, absence_credit, absence_credit_fixed_minor, makeup_policy from studio where id in (select app.studio_ids()) limit 1`,M=`
update studio set absence_credit = $2, absence_credit_fixed_minor = $3 where id = $1 returning id`;e.s(["ABSENCE_CREDITS",0,O,"ABSENCE_CREDIT_SETTING",0,x,"ADD_FAMILY_CREDIT",0,"select app.add_family_credit($1, $2, $3) as id","ADD_FAMILY_DISCOUNT",0,$,"AGED_DEBT_EXPORT",0,S,"BANK_DETAILS",0,h,"BILLING_LINES",0,"select * from app.billing_lines($1, $2::date, $3::uuid[])","BILLING_RUNS",0,w,"BILLING_SKIPPED",0,"select * from app.billing_skipped($1, $2::date)","BILLING_TERMS",0,"select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc","CLASS_LOCATIONS",0,"select c.id, l.name as location from class c join location l on l.id = c.location_id where c.deleted_at is null","CREATE_BILLING_RUN",0,"select app.create_billing_run($1, $2::date, $3::date, $4::uuid[], $5) as id","CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","DISCARD_BILLING_RUN",0,"select app.discard_billing_run($1)","DISCOUNT_RULES",0,"select id, kind, from_nth, percent, enabled from discount_rule order by kind desc","END_FAMILY_DISCOUNT",0,"select app.end_family_discount($1)","FAMILY_ACCOUNT",0,_,"FAMILY_BILLABLE",0,c,"FAMILY_BILLING",0,D,"FAMILY_BILLING_CHILDREN",0,j,"FAMILY_DISCOUNTS",0,I,"FAMILY_GUARDIANS",0,C,"FAMILY_OPTIONS",0,l,"FAMILY_PICK",0,R,"FAMILY_STATEMENT",0,m,"INVOICE",0,r,"INVOICES",0,s,"INVOICES_EXPORT",0,T,"INVOICE_CREDIT_NOTES",0,u,"INVOICE_ITEMS",0,d,"INVOICE_PAYMENTS",0,o,"ISSUE_BILLING_RUN",0,"select app.issue_billing_run($1) as n","ISSUE_CREDIT_NOTE",0,"select app.issue_credit_note($1, $2, $3, $4) as id","ISSUE_INVOICE",0,"select app.issue_invoice($1)","MY_PAYMENT_INFO",0,y,"NOTIFY_DUE",0,"select app.notify_invoices_due() as n","OVERDUE_FAMILIES",0,f,"PAYMENTS_EXPORT",0,N,"PRIMARY_GUARDIAN",0,g,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3, $4)","REMINDER_PREVIEW",0,p,"REMINDER_TEMPLATE",0,b,"SEND_DIRECT",0,v,"SEND_REMINDERS",0,"select app.send_payment_reminders($1::uuid[], $2, $3) as sent","SET_ABSENCE_CREDIT",0,M,"SET_BANK_DETAILS",0,"select app.set_bank_details($1, $2, $3, $4, $5)","SET_DISCOUNT_RULE",0,"update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id","SET_FAMILY_BILLING",0,"select app.set_family_billing($1, $2, $3, $4, $5, $6::jsonb)","SUMMARY",0,t,"SUMMARY_AT",0,i,"UPCOMING_COSTS",0,"select * from app.upcoming_costs($1::uuid)","VOID_INVOICE",0,"select app.void_invoice($1, $2)","XERO_EXPORT",0,E])},8199,e=>{"use strict";let t=`
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
       s.preferred_name, s.pronouns, s.school,
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
 order by s.date_of_birth`,n=`
-- Worked out from the invoices this guardian can see, so a guardian who pays
-- part of a split family's fees sees their own balance (UR-17). For any other
-- family it is the same as family.balance_minor.
select f.id, f.name,
       (coalesce((select sum(i.total_minor - i.paid_minor) from invoice i
                   where i.family_id = f.id and i.deleted_at is null and i.status in ('issued','part_paid','refunded')), 0)
        - app.family_available_credit(f.id))::bigint as balance_minor,
       (select count(*)::int from invoice i
         where i.family_id = f.id and i.deleted_at is null and i.status in ('issued','part_paid')) as unpaid,
       (select count(*)::int from payment p
         where p.family_id = f.id and p.deleted_at is null
           and p.failure_code is not null and p.succeeded_at is null) as failed
  from family f where f.deleted_at is null`,a=`
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
  from student s where s.id = $1`,_=`
update emergency_contact set full_name = $2, relationship = nullif($3, ''), phone = $4, updated_at = now() where id = $1`,m=`
select d.id, d.student_id, s.first_name, c.name as class_name, cs.starts_at,
       case when d.pack_purchase_id is not null then 'pack' when d.invoice_id is not null then 'invoice' else 'free' end as paid_with
  from drop_in_booking d join student s on s.id = d.student_id join class_session cs on cs.id = d.session_id join class c on c.id = cs.class_id
 where d.status = 'booked' and cs.starts_at > now() order by cs.starts_at`,f=`select p.id, s.first_name, k.name, p.remaining, p.expires_on from pack_purchase p
  join student s on s.id = p.student_id join class_pack k on k.id = p.pack_id
 where p.remaining > 0 and p.expires_on >= current_date order by p.expires_on`,p=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor
  from invoice i where i.deleted_at is null and i.status <> 'draft'
 order by i.issued_on desc nulls last, i.number desc`,h=`
select p.id, p.amount_minor, p.refunded_minor, p.method, p.succeeded_at, i.number as invoice_number,
       'RCPT-' || upper(left(md5(p.id::text), 8)) as reference
  from payment p left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null and p.succeeded_at is not null and p.amount_minor > 0
 order by p.succeeded_at desc`,y=`
select id, number, issued_on, due_on, description, total_minor, paid_minor
  from imported_invoice order by issued_on desc, number desc`,b=`
select p.id, 'RCPT-' || upper(left(md5(p.id::text), 8)) as reference,
       p.amount_minor, p.refunded_minor, p.method, p.succeeded_at,
       st.name as studio_name, regexp_replace(f.name, '\\s*\\(adult\\)\\s*$', '') as family_name,
       (select g.full_name from guardian g where g.user_id = auth.uid() and g.family_id = f.id and g.deleted_at is null limit 1) as payer,
       i.id as invoice_id, i.number as invoice_number, i.total_minor as invoice_total, i.paid_minor as invoice_paid
  from payment p join family f on f.id = p.family_id join studio st on st.id = p.studio_id
  left join invoice i on i.id = p.invoice_id
 where p.id = $1 and p.deleted_at is null and p.succeeded_at is not null`;e.s(["ADD_COLLECTOR",0,l,"ADD_CONTACT",0,u,"ASK_TO_CHANGE_GUARDIAN",0,"select app.ask_to_change_guardian($1, $2) as id","BOOK_DROP_IN",0,"select app.book_drop_in($1, $2) as r","BOOK_FOR_MYSELF",0,"select app.book_for_myself($1::date, coalesce($2::boolean, false), $3, $4) as id","BOOK_TRIAL",0,"select app.parent_book_trial($1, $2) as result","BUY_PACK",0,"select app.buy_pack($1, $2) as id","CANCEL_DROP_IN",0,"select app.cancel_drop_in($1) as r","CANCEL_TRIAL",0,"select app.guardian_cancel_trial($1) as r","CLASS_OPTIONS",0,"select * from app.class_options_for_child($1)","DROP_IN_SESSIONS",0,"select d.* from studio s, app.drop_in_sessions(s.id) d where s.id in (select app.studio_ids()) order by d.starts_at","INVITE_STUDENT",0,"select app.guardian_invite_student($1, $2) as token","JOIN_WAITLIST",0,"select app.parent_join_waitlist($1, $2) as position","MY_ALL_INVOICES",0,p,"MY_BALANCE",0,n,"MY_BILLING_SHARE",0,"select * from app.my_billing_share()","MY_BOOKINGS",0,"select * from app.my_bookings()","MY_CHILDREN",0,i,"MY_CHILDREN_LOGINS",0,"select * from app.my_children_logins()","MY_CLASHES",0,"select * from app.my_family_clashes($1::timestamptz, $2::timestamptz)","MY_COLLECTORS",0,o,"MY_COMING_UP",0,"select * from app.my_coming_up()","MY_CONTACTS",0,c,"MY_DROP_INS",0,m,"MY_GUARDIANS",0,r,"MY_IMPORTED_INVOICES",0,y,"MY_INVOICES",0,a,"MY_MESSAGES",0,s,"MY_PACKS",0,f,"MY_PAYMENTS",0,h,"MY_RECEIPT",0,b,"MY_SCHEDULE",0,t,"PACKS",0,"select id, name, classes, price_minor, valid_days from class_pack where active order by classes","REMOVE_COLLECTOR",0,"select app.remove_collection_person($1)","REMOVE_CONTACT",0,"select app.remove_emergency_contact($1)","REQUEST_CHILD",0,"select app.request_new_child($1::jsonb) as id","REQUEST_PLACE",0,"select app.request_class_place($1, $2, $3) as id","SET_STUDENT_LOGIN",0,"select app.set_student_login($1, $2) as r","UPDATE_CHILD_DETAILS",0,"select app.guardian_update_child($1, $2, $3, $4)","UPDATE_CONTACT",0,_,"UPDATE_GUARDIAN",0,d])}]);