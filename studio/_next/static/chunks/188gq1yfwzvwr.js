(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,17068,e=>{"use strict";let t=(0,e.i(75254).default)("calendar-x-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]]);e.s(["CalendarX2",0,t],17068)},46897,e=>{"use strict";let t=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,t],46897)},84614,e=>{"use strict";let t=(0,e.i(75254).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,t],84614)},52112,e=>{"use strict";var t=e.i(43476),s=e.i(71645),r=e.i(17068),i=e.i(46897),a=e.i(84614),n=e.i(77326),l=e.i(13927),o=e.i(17658),u=e.i(27389),d=e.i(75379),c=e.i(45060);let h={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"};e.s(["default",0,function(){let[e]=s.useMemo(()=>(0,d.dayRange)(0),[]),p=s.useMemo(()=>{let t=new Date(e);return t.setDate(t.getDate()+28),t.toISOString()},[e]),f=(0,l.useRows)(["student-timetable",e],u.MY_TIMETABLE,[e,p]),m=s.useMemo(()=>{let e=new Map;return(f.data??[]).forEach(t=>{let s=(0,d.isoDate)(t.starts_at);e.set(s,[...e.get(s)??[],t])}),[...e.entries()].sort()},[f.data]);return(0,t.jsx)(n.Shell,{title:"Timetable",subtitle:"Your classes and anything you're down for",allow:["student"],children:(0,t.jsxs)("div",{className:"mx-auto max-w-lg space-y-4",children:[f.isLoading&&(0,t.jsx)(o.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,t.jsx)(o.Skeleton,{className:"h-14"},e))}),f.error&&(0,t.jsx)(o.ErrorState,{error:f.error,onRetry:()=>f.refetch()}),0===m.length&&!f.isLoading&&(0,t.jsx)(o.Card,{children:(0,t.jsx)(o.EmptyState,{icon:(0,t.jsx)(r.CalendarX2,{className:"size-5"}),title:"Nothing scheduled",body:"Your classes will show here once you're enrolled."})}),m.map(([e,s])=>(0,t.jsxs)(o.Card,{children:[(0,t.jsxs)("div",{className:"flex items-baseline gap-2 border-b border-line px-4 py-2.5",children:[(0,t.jsx)("h2",{className:"font-semibold",children:(0,d.relativeDay)(s[0].starts_at)}),(0,t.jsx)("span",{className:"text-[13px] text-ink-3",children:(0,d.dateLong)(s[0].starts_at)})]}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:s.map((e,s)=>{let r="cancelled"===e.status,n="event"===e.entry_kind;return(0,t.jsxs)("li",{className:(0,c.cn)("flex items-start gap-3 px-4 py-3",r&&"opacity-60"),children:[(0,t.jsx)("span",{className:(0,c.cn)("tnum w-14 shrink-0 font-semibold",r&&"line-through"),children:(0,d.time)(e.starts_at)}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)("span",{className:(0,c.cn)("font-medium",r&&"line-through"),children:e.name}),n?(0,t.jsx)(o.Badge,{tone:"indigo",children:"Event"}):e.style&&(0,t.jsx)(o.Badge,{tone:h[e.colour]??"neutral",children:e.style}),r&&(0,t.jsx)(o.Badge,{tone:"critical",children:"Cancelled"})]}),(0,t.jsxs)("span",{className:"mt-0.5 flex flex-wrap items-center gap-x-3 text-[12.5px] text-ink-2",children:[e.teacher&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(a.User,{className:"size-3.5","aria-hidden":!0}),e.teacher]}),(e.room||e.location)&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(i.MapPin,{className:"size-3.5","aria-hidden":!0}),[e.location,e.room].filter(Boolean).join(" · ")]})]})]})]},`${e.id}-${s}`)})})]},e))]})})}])},13927,e=>{"use strict";let t;var s=e.i(12598),r=e.i(71645);let i=r.createContext(!1);i.Provider,e.i(43476);let a=r.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),l=e.i(40143),o=e.i(80166),u=e.i(73911),d=e.i(15823),c=e.i(75555),h=e.i(86491),p=class extends d.Subscribable{#e;#t=void 0;#s=void 0;#r=void 0;#i;#a;#n;#l;#o;#u;#d;#c;#h;#p=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#n=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),f(this.#t,this.options)?this.#f():this.updateResult(),this.#m())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return m(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return m(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#_(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#v(),this.#t.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let r=this.hasListeners();r&&_(this.#t,s,this.options,t)&&this.#f(),this.updateResult(),r&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||(0,n.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,n.resolveStaleTime)(t.staleTime,this.#t))&&this.#R();let i=this.#b();r&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||i!==this.#h)&&this.#g(i)}getOptimisticResult(e){var t,s;let r=this.#e.getQueryCache().build(this.#e,e),i=this.createResult(r,e);return t=this,s=i,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#r=i,this.#a=this.options,this.#i=this.#t.state),i}getCurrentResult(){return this.#r}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#p.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),r=this.#e.getQueryCache().build(this.#e,s),i=()=>{},a=new Promise(e=>{t=e,i=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===r.queryHash&&void 0!==r.state.data&&(i(),e(this.createResult(r,s)))})});return Promise.race([r.fetch().then(()=>{let e=this.createResult(r,s);return t?.(e),e}).finally(()=>{i()}),a])}fetch(e){return this.#f({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#r))}#f(e){this.#v();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#R(){this.#_();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#t);if(u.environmentManager.isServer()||this.#r.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#r.dataUpdatedAt,e)+1;this.#d=o.timeoutManager.setTimeout(()=>{this.#r.isStale||this.updateResult()},t)}#b(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#g(e){this.#y(),this.#h=e,!u.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,n.isValidTimeout)(this.#h)&&0!==this.#h&&(this.#c=o.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||c.focusManager.isFocused())&&this.#f()},this.#h))}#m(){this.#R(),this.#g(this.#b())}#_(){void 0!==this.#d&&(o.timeoutManager.clearTimeout(this.#d),this.#d=void 0)}#y(){void 0!==this.#c&&(o.timeoutManager.clearInterval(this.#c),this.#c=void 0)}createResult(e,t){let s,r=this.#t,i=this.options,a=this.#r,l=this.#i,o=this.#a,u=e!==r?e.state:this.#s,{state:d}=e,c={...d},p=!1;if(t._optimisticResults){let s=this.hasListeners(),a=!s&&f(e,t),n=s&&_(e,r,t,i);(a||n)&&(c={...c,...(0,h.fetchState)(d.data,e.options)}),"isRestoring"===t._optimisticResults&&(c.fetchStatus="idle")}let{error:m,errorUpdatedAt:v,status:R}=c;s=c.data;let b=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===R){let e;a?.isPlaceholderData&&t.placeholderData===o?.placeholderData?(e=a.data,b=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#u?.state.data,this.#u):t.placeholderData,void 0!==e&&(R="success",s=(0,n.replaceData)(a?.data,e,t),p=!0)}if(t.select&&void 0!==s&&!b)if(a&&s===l?.data&&t.select===this.#l)s=this.#o;else try{this.#l=t.select,s=t.select(s),s=(0,n.replaceData)(a?.data,s,t),this.#o=s,this.#n=null}catch(e){this.#n=e}else void 0===s&&(this.#n=null);this.#n&&(m=this.#n,s=this.#o,v=Date.now(),R="error",p=!1);let g="fetching"===c.fetchStatus,w="pending"===R,Q="error"===R,E=w&&g,S=void 0!==s;return{status:R,fetchStatus:c.fetchStatus,isPending:w,isSuccess:"success"===R,isError:Q,isInitialLoading:E,isLoading:E,data:s,dataUpdatedAt:c.dataUpdatedAt,error:m,errorUpdatedAt:v,failureCount:c.fetchFailureCount,failureReason:c.fetchFailureReason,errorUpdateCount:c.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:c.dataUpdateCount>u.dataUpdateCount||c.errorUpdateCount>u.errorUpdateCount,isFetching:g,isRefetching:g&&!w,isLoadingError:Q&&!S,isPaused:"paused"===c.fetchStatus,isPlaceholderData:p,isRefetchError:Q&&S,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#r,t=this.createResult(this.#t,this.options);if(this.#i=this.#t.state,this.#a=this.options,void 0!==this.#i.data&&(this.#u=this.#t),(0,n.shallowEqualObjects)(t,e))return;this.#r=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#p.size)return!0;let r=new Set(s??this.#p);return this.options.throwOnError&&r.add("error"),Object.keys(this.#r).some(t=>this.#r[t]!==e[t]&&r.has(t))};this.#w({listeners:s()})}#v(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#m()}#w(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#r)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function f(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&m(e,t,t.refetchOnMount)}function m(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let r="function"==typeof s?s(e):s;return"always"===r||!1!==r&&y(e,t)}return!1}function _(e,t,s,r){return(e!==t||!1===(0,n.resolveQueryBoolean)(r.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}var v=e.i(30224),R=e.i(31502);function b(e,t,o=[],u){let{session:d}=(0,R.useSession)();return function(e,t,o){let u,d=r.useContext(i),c=r.useContext(a),h=(0,s.useQueryClient)(o),p=h.defaultQueryOptions(e),f=h.getQueryCache().get(p.queryHash),m=!1!==e.subscribed;if(p._optimisticResults=d?"isRestoring":m?"optimistic":void 0,p.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=p.staleTime;p.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof p.gcTime&&(p.gcTime=Math.max(p.gcTime,1e3))}u=f?.state.error&&"function"==typeof p.throwOnError?(0,n.shouldThrowError)(p.throwOnError,[f.state.error,f]):p.throwOnError,(p.suspense||u)&&!c.isReset()&&(p.retryOnMount=!1),r.useEffect(()=>{c.clearReset()},[c]);let[_]=r.useState(()=>new t(h,p)),y=_.getOptimisticResult(p),v=!d&&m;if(r.useSyncExternalStore(r.useCallback(e=>{let t=v?_.subscribe(l.notifyManager.batchCalls(e)):n.noop;return _.updateResult(),t},[_,v]),()=>_.getCurrentResult(),()=>_.getCurrentResult()),r.useEffect(()=>{_.setOptions(p)},[p,_]),p?.suspense&&y.isPending)throw _.fetchOptimistic(p).catch(()=>{c.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:r,suspense:i})=>e.isError&&!t.isReset()&&!e.isFetching&&r&&(i&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,r])))({result:y,errorResetBoundary:c,throwOnError:p.throwOnError,query:f,suspense:p.suspense}))throw y.error;return p.notifyOnChangeProps?y:_.trackResult(y)}({queryKey:["db",d?.userId??"anon",...e],queryFn:()=>(0,v.readAs)(d,t,o),staleTime:15e3,...u},p,void 0)}e.s(["useRow",0,function(e,t,s=[]){let r=b(e,t,s);return{...r,data:r.data?.[0]}},"useRows",0,b],13927)},27389,e=>{"use strict";let t=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url, r.duration_sec,
       (select string_agg(distinct coalesce(c.name, lv.name, 'Everyone'), ', ')
          from resource_assignment a
          left join class c on c.id = a.class_id
          left join level lv on lv.id = a.level_id
         where a.resource_id = r.id and a.deleted_at is null) as scope_label
  from resource r
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
 order by f.shared_at desc`,r=`
select a.id, a.skill, a.level, a.assessed_on, a.note,
       ds.name as style, s.first_name as student_name
  from skill_assessment a
  join student s on s.id = a.student_id
  left join dance_style ds on ds.id = a.dance_style_id
 where a.deleted_at is null
 order by s.first_name, a.skill`,i=`
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
select cs.id, c.name, cs.starts_at, cs.ends_at, cs.status,
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
select ev.id, ev.title, ev.starts_at, ev.ends_at, 'scheduled',
       ev.kind::text, 'indigo', null, ev.venue, sm.display_name, 'event'
  from studio_event ev
  join event_participant p on p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at >= $1::timestamptz and ev.starts_at < $2::timestamptz
 order by starts_at`,u=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`,d=`
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
returning id, status`,p=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`;e.s(["ANSWER_REQUEST",0,p,"DECIDE_ENTRY",0,h,"EVENTS",0,i,"MY_ASSESSMENTS",0,r,"MY_REQUESTS",0,n,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,d,"RAISE_REQUEST",0,l,"REQUEST_PLACE",0,a,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,u])}]);