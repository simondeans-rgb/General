(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,17068,e=>{"use strict";let t=(0,e.i(75254).default)("calendar-x-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]]);e.s(["CalendarX2",0,t],17068)},63059,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,t],63059)},46897,e=>{"use strict";let t=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,t],46897)},84614,e=>{"use strict";let t=(0,e.i(75254).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,t],84614)},10629,e=>{"use strict";var t=e.i(43476),s=e.i(71645);let a=(0,e.i(75254).default)("chevron-left",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);var i=e.i(63059),r=e.i(17068),n=e.i(77326),l=e.i(47741),c=e.i(13927),o=e.i(17658),d=e.i(21011),u=e.i(75379),h=e.i(45060);function m({sessions:e,view:a}){let i=s.useMemo(()=>{let t=new Map,s=e=>"teacher"===a?e.teacher??"Unassigned":"room"===a?[e.location,e.room].filter(Boolean).join(" · ")||"No room set":`${(0,u.isoDate)(e.starts_at)}|${(0,u.dayName)(e.starts_at)}`;for(let i of e){if("day"===a&&(0,u.isoDate)(i.starts_at)!==(0,u.isoDate)(new Date))continue;let e=s(i);t.set(e,[...t.get(e)??[],i])}return[...t.entries()].sort((e,t)=>e[0].localeCompare(t[0]))},[e,a]);return 0===i.length?(0,t.jsx)(o.Card,{children:(0,t.jsx)(o.EmptyState,{icon:(0,t.jsx)(r.CalendarX2,{className:"size-5"}),title:"Nothing today",body:"Switch to the week view to see the rest of the timetable."})}):(0,t.jsx)("div",{className:"space-y-4",children:i.map(([e,s])=>{let a=e.includes("|")?e.split("|")[1]:e,i=e.includes("|")?e.split("|")[0]:null,r=s.reduce((e,t)=>e+("cancelled"===t.status?0:t.enrolled),0);return(0,t.jsxs)(o.Card,{children:[(0,t.jsxs)("div",{className:"flex items-baseline gap-2.5 border-b border-line px-4 py-2.5",children:[(0,t.jsx)("h2",{className:"font-semibold",children:a}),i&&(0,t.jsx)("span",{className:"text-[13px] text-ink-3",children:(0,u.dateLong)(i)}),(0,t.jsxs)("span",{className:"ml-auto text-[12.5px] text-ink-3",children:[s.length," class",1===s.length?"":"es"," · ",r," places"]})]}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:s.map(e=>(0,t.jsx)("li",{children:(0,t.jsx)(l.SessionRow,{session:e})},e.id))})]},e)})})}e.s(["default",0,function(){let[e,l]=s.useState(()=>new Date),[p,f]=s.useState("week"),[y,_]=s.useMemo(()=>(0,u.weekRange)(e),[e]),v=(0,c.useRows)(["week",y],d.SESSIONS_BETWEEN,[y,_]),b=t=>{let s=new Date(e);s.setDate(s.getDate()+7*t),l(s)},x=new Date(y).toDateString()===new Date((0,u.weekRange)(new Date)[0]).toDateString();return(0,t.jsx)(n.Shell,{title:"Schedule",subtitle:`${(0,u.dateLong)(y)} – ${(0,u.dateLong)(new Date(new Date(_).getTime()-864e5))}`,allow:["owner","admin"],actions:(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)(o.Button,{size:"sm",variant:"ghost",onClick:()=>b(-1),"aria-label":"Previous week",children:(0,t.jsx)(a,{className:"size-4","aria-hidden":!0})}),(0,t.jsx)(o.Button,{size:"sm",variant:x?"secondary":"primary",onClick:()=>l(new Date),children:x?"This week":"Back to today"}),(0,t.jsx)(o.Button,{size:"sm",variant:"ghost",onClick:()=>b(1),"aria-label":"Next week",children:(0,t.jsx)(i.ChevronRight,{className:"size-4","aria-hidden":!0})})]}),children:(0,t.jsxs)("div",{className:"mx-auto max-w-6xl space-y-4",children:[(0,t.jsx)("div",{role:"tablist","aria-label":"Schedule view",className:"inline-flex rounded-[var(--radius-md)] border border-line bg-surface p-0.5",children:["week","day","teacher","room"].map(e=>(0,t.jsx)("button",{role:"tab","aria-selected":p===e,onClick:()=>f(e),className:(0,h.cn)("min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium capitalize transition-colors",p===e?"bg-accent-soft text-accent-ink":"text-ink-2 hover:text-ink"),children:"room"===e?"Room":e},e))}),v.isLoading&&(0,t.jsx)(o.Card,{className:"space-y-3 p-4",children:[0,1,2,3].map(e=>(0,t.jsx)(o.Skeleton,{className:"h-14"},e))}),v.error&&(0,t.jsx)(o.ErrorState,{error:v.error,onRetry:()=>v.refetch()}),v.data&&0===v.data.length&&(0,t.jsx)(o.Card,{children:(0,t.jsx)(o.EmptyState,{icon:(0,t.jsx)(r.CalendarX2,{className:"size-5"}),title:"No classes this week",body:"Either the term has not started or this week falls in a break."})}),v.data&&v.data.length>0&&(0,t.jsx)(m,{sessions:v.data,view:p})]})})}],10629)},47741,e=>{"use strict";var t=e.i(43476),s=e.i(22016),a=e.i(46897),i=e.i(84614),r=e.i(61911),n=e.i(17658),l=e.i(75379),c=e.i(45060);let o={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"},d={violet:"bg-violet",amber:"bg-amber",teal:"bg-teal",rose:"bg-rose",indigo:"bg-indigo",lime:"bg-lime"};e.s(["SessionRow",0,function({session:e,href:u}){let h="cancelled"===e.status,m=e.enrolled>=e.capacity,p=(0,t.jsxs)("div",{className:(0,c.cn)("flex items-stretch gap-3 px-4 py-3",h&&"opacity-60"),children:[(0,t.jsx)("span",{"aria-hidden":!0,className:(0,c.cn)("w-1 shrink-0 rounded-full",d[e.colour??""]??"bg-surface-3")}),(0,t.jsxs)("span",{className:"w-[52px] shrink-0 pt-0.5",children:[(0,t.jsx)("span",{className:(0,c.cn)("tnum block text-sm font-semibold",h&&"line-through"),children:(0,l.time)(e.starts_at)}),(0,t.jsx)("span",{className:"tnum block text-[12px] text-ink-3",children:(0,l.time)(e.ends_at)})]}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"flex flex-wrap items-center gap-x-2 gap-y-1",children:[(0,t.jsx)("span",{className:(0,c.cn)("font-medium",h&&"line-through"),children:e.name}),e.style&&(0,t.jsx)(n.Badge,{tone:o[e.colour??""]??"neutral",children:e.style}),h&&(0,t.jsx)(n.Badge,{tone:"critical",children:"Cancelled"}),!h&&e.trials>0&&(0,t.jsxs)(n.Badge,{tone:"info",children:[e.trials," trial",1===e.trials?"":"s"]})]}),(0,t.jsxs)("span",{className:"mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-ink-2",children:[e.teacher&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(i.User,{className:"size-3.5","aria-hidden":!0}),e.teacher]}),e.room&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(a.MapPin,{className:"size-3.5","aria-hidden":!0}),e.room]}),(0,t.jsxs)("span",{className:(0,c.cn)("inline-flex items-center gap-1",m&&"font-medium text-caution"),children:[(0,t.jsx)(r.Users,{className:"size-3.5","aria-hidden":!0}),e.enrolled,"/",e.capacity,m?" · full":""]})]})]})]});return u?(0,t.jsx)(s.default,{href:u,className:"block transition-colors hover:bg-surface-2",children:p}):p}])},13927,e=>{"use strict";let t;var s=e.i(12598),a=e.i(71645);let i=a.createContext(!1);i.Provider,e.i(43476);let r=a.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),l=e.i(40143),c=e.i(80166),o=e.i(73911),d=e.i(15823),u=e.i(75555),h=e.i(86491),m=class extends d.Subscribable{#e;#t=void 0;#s=void 0;#a=void 0;#i;#r;#n;#l;#c;#o;#d;#u;#h;#m=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#n=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),p(this.#t,this.options)?this.#p():this.updateResult(),this.#f())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#y(),this.#_(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#v(),this.#t.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let a=this.hasListeners();a&&y(this.#t,s,this.options,t)&&this.#p(),this.updateResult(),a&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||(0,n.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,n.resolveStaleTime)(t.staleTime,this.#t))&&this.#b();let i=this.#x();a&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||i!==this.#h)&&this.#g(i)}getOptimisticResult(e){var t,s;let a=this.#e.getQueryCache().build(this.#e,e),i=this.createResult(a,e);return t=this,s=i,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#a=i,this.#r=this.options,this.#i=this.#t.state),i}getCurrentResult(){return this.#a}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#m.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),a=this.#e.getQueryCache().build(this.#e,s),i=()=>{},r=new Promise(e=>{t=e,i=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===a.queryHash&&void 0!==a.state.data&&(i(),e(this.createResult(a,s)))})});return Promise.race([a.fetch().then(()=>{let e=this.createResult(a,s);return t?.(e),e}).finally(()=>{i()}),r])}fetch(e){return this.#p({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#a))}#p(e){this.#v();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#b(){this.#y();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#t);if(o.environmentManager.isServer()||this.#a.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#a.dataUpdatedAt,e)+1;this.#d=c.timeoutManager.setTimeout(()=>{this.#a.isStale||this.updateResult()},t)}#x(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#g(e){this.#_(),this.#h=e,!o.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,n.isValidTimeout)(this.#h)&&0!==this.#h&&(this.#u=c.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#p()},this.#h))}#f(){this.#b(),this.#g(this.#x())}#y(){void 0!==this.#d&&(c.timeoutManager.clearTimeout(this.#d),this.#d=void 0)}#_(){void 0!==this.#u&&(c.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let s,a=this.#t,i=this.options,r=this.#a,l=this.#i,c=this.#r,o=e!==a?e.state:this.#s,{state:d}=e,u={...d},m=!1;if(t._optimisticResults){let s=this.hasListeners(),r=!s&&p(e,t),n=s&&y(e,a,t,i);(r||n)&&(u={...u,...(0,h.fetchState)(d.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:v,status:b}=u;s=u.data;let x=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===b){let e;r?.isPlaceholderData&&t.placeholderData===c?.placeholderData?(e=r.data,x=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#o?.state.data,this.#o):t.placeholderData,void 0!==e&&(b="success",s=(0,n.replaceData)(r?.data,e,t),m=!0)}if(t.select&&void 0!==s&&!x)if(r&&s===l?.data&&t.select===this.#l)s=this.#c;else try{this.#l=t.select,s=t.select(s),s=(0,n.replaceData)(r?.data,s,t),this.#c=s,this.#n=null}catch(e){this.#n=e}else void 0===s&&(this.#n=null);this.#n&&(f=this.#n,s=this.#c,v=Date.now(),b="error",m=!1);let g="fetching"===u.fetchStatus,R="pending"===b,w="error"===b,S=R&&g,j=void 0!==s;return{status:b,fetchStatus:u.fetchStatus,isPending:R,isSuccess:"success"===b,isError:w,isInitialLoading:S,isLoading:S,data:s,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:v,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>o.dataUpdateCount||u.errorUpdateCount>o.errorUpdateCount,isFetching:g,isRefetching:g&&!R,isLoadingError:w&&!j,isPaused:"paused"===u.fetchStatus,isPlaceholderData:m,isRefetchError:w&&j,isStale:_(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#a,t=this.createResult(this.#t,this.options);if(this.#i=this.#t.state,this.#r=this.options,void 0!==this.#i.data&&(this.#o=this.#t),(0,n.shallowEqualObjects)(t,e))return;this.#a=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#m.size)return!0;let a=new Set(s??this.#m);return this.options.throwOnError&&a.add("error"),Object.keys(this.#a).some(t=>this.#a[t]!==e[t]&&a.has(t))};this.#R({listeners:s()})}#v(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#f()}#R(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#a)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function p(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let a="function"==typeof s?s(e):s;return"always"===a||!1!==a&&_(e,t)}return!1}function y(e,t,s,a){return(e!==t||!1===(0,n.resolveQueryBoolean)(a.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&_(e,s)}function _(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}var v=e.i(30224),b=e.i(31502);function x(e,t,c=[],o){let{session:d}=(0,b.useSession)();return function(e,t,c){let o,d=a.useContext(i),u=a.useContext(r),h=(0,s.useQueryClient)(c),m=h.defaultQueryOptions(e),p=h.getQueryCache().get(m.queryHash),f=!1!==e.subscribed;if(m._optimisticResults=d?"isRestoring":f?"optimistic":void 0,m.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=m.staleTime;m.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof m.gcTime&&(m.gcTime=Math.max(m.gcTime,1e3))}o=p?.state.error&&"function"==typeof m.throwOnError?(0,n.shouldThrowError)(m.throwOnError,[p.state.error,p]):m.throwOnError,(m.suspense||o)&&!u.isReset()&&(m.retryOnMount=!1),a.useEffect(()=>{u.clearReset()},[u]);let[y]=a.useState(()=>new t(h,m)),_=y.getOptimisticResult(m),v=!d&&f;if(a.useSyncExternalStore(a.useCallback(e=>{let t=v?y.subscribe(l.notifyManager.batchCalls(e)):n.noop;return y.updateResult(),t},[y,v]),()=>y.getCurrentResult(),()=>y.getCurrentResult()),a.useEffect(()=>{y.setOptions(m)},[m,y]),m?.suspense&&_.isPending)throw y.fetchOptimistic(m).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:a,suspense:i})=>e.isError&&!t.isReset()&&!e.isFetching&&a&&(i&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,a])))({result:_,errorResetBoundary:u,throwOnError:m.throwOnError,query:p,suspense:m.suspense}))throw _.error;return m.notifyOnChangeProps?_:y.trackResult(_)}({queryKey:["db",d?.userId??"anon",...e],queryFn:()=>(0,v.readAs)(d,t,c),staleTime:15e3,...o},m,void 0)}e.s(["useRow",0,function(e,t,s=[]){let a=x(e,t,s);return{...a,data:a.data?.[0]}},"useRows",0,x],13927)},21011,e=>{"use strict";let t=`
with todays as (
  select cs.* from class_session cs
   where cs.deleted_at is null
     and (cs.starts_at at time zone 'Europe/London')::date = (now() at time zone 'Europe/London')::date
)
select
  count(*) filter (where status <> 'cancelled')::int as classes,
  coalesce((select count(*) from enrolment e
             where e.status = 'active' and e.deleted_at is null
               and e.class_id in (select class_id from todays where status <> 'cancelled')), 0)::int
    as students_expected,
  coalesce((select count(*) from trial t
             where t.deleted_at is null and t.status = 'booked'
               and t.session_id in (select id from todays)), 0)::int as trials,
  count(*) filter (where status = 'cancelled')::int as cancelled,
  count(*) filter (where teacher_id is not null)::int as covered
from todays`,s=`
select
  (select count(*)::int from payment
    where deleted_at is null and failure_code is not null and succeeded_at is null) as failed,
  (select coalesce(sum(total_minor - paid_minor), 0)::bigint from invoice
    where deleted_at is null and status in ('issued','part_paid')) as outstanding_minor,
  (select count(*)::int from invoice
    where deleted_at is null and status in ('issued','part_paid')) as unpaid_invoices`,a=`
select c.id, c.name,
       c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity, 0))::int as pct
  from class c
 where c.deleted_at is null
   and app.class_enrolled_count(c.id) >= greatest(c.capacity - 1, 1)
 order by waiting desc, pct desc`,i=`
select e.id, e.contact_name, e.child_name, e.next_action_on,
       c.name as class_name
  from enquiry e
  left join class c on c.id = e.interest_class_id
 where e.deleted_at is null and e.stage in ('trial_attended','follow_up')
 order by e.next_action_on nulls last`,r=`
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
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials
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
 order by cs.starts_at, c.name`,l=`
select e.id, e.started_on, s.first_name, s.last_name, c.name as class_name
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where e.deleted_at is null and e.status = 'active'
 order by e.started_on desc, e.created_at desc
 limit 6`,c=`
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
 limit 5`,d=`
select
  (select count(*)::int from studio_request
    where deleted_at is null and status in ('open','in_progress')) as open_requests,
  (select count(*)::int from event_participant
    where deleted_at is null and status = 'requested') as pending_entries,
  (select count(*)::int from studio_request
    where deleted_at is null and status = 'open' and kind = 'medical_update') as medical_updates`;e.s(["ATTENTION_CAPACITY",0,a,"ATTENTION_LAPSED",0,r,"ATTENTION_PAYMENTS",0,s,"ATTENTION_REQUESTS",0,d,"ATTENTION_TRIALS",0,i,"RECENT_ENROLMENTS",0,l,"RECENT_MESSAGES",0,o,"SESSIONS_BETWEEN",0,n,"TODAY_COUNTS",0,t,"UPCOMING_TRIALS",0,c])}]);