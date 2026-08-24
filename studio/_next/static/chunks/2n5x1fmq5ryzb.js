(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,3116,e=>{"use strict";let t=(0,e.i(75254).default)("clock",[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);e.s(["Clock",0,t],3116)},78583,e=>{"use strict";let t=(0,e.i(75254).default)("file-text",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);e.s(["FileText",0,t],78583)},87066,e=>{"use strict";var t=e.i(43476),s=e.i(71645),r=e.i(17697),i=e.i(75254);let a=(0,i.default)("music-2",[["circle",{cx:"8",cy:"18",r:"4",key:"1fc0mg"}],["path",{d:"M12 18V2l7 4",key:"g04rme"}]]);var n=e.i(78583);let l=(0,i.default)("link-2",[["path",{d:"M9 17H7A5 5 0 0 1 7 7h2",key:"8i5ue5"}],["path",{d:"M15 7h2a5 5 0 1 1 0 10h-2",key:"1b9ql8"}],["line",{x1:"8",x2:"16",y1:"12",y2:"12",key:"1jonct"}]]),o=(0,i.default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);var d=e.i(3116),u=e.i(77326),c=e.i(13927),h=e.i(17658),p=e.i(27389),f=e.i(45060);let m={video:r.PlayCircle,audio:a,document:n.FileText,link:l};function y({allow:e,title:i}){let[a,n]=s.useState("all"),[l,_]=s.useState(""),v=(0,c.useRows)(["resources"],p.RESOURCES),b=(v.data??[]).filter(e=>("all"===a||e.kind===a||"document"===a&&"link"===e.kind)&&(!l||`${e.title} ${e.category??""}`.toLowerCase().includes(l.toLowerCase()))),R={all:v.data?.length??0,video:v.data?.filter(e=>"video"===e.kind).length??0,audio:v.data?.filter(e=>"audio"===e.kind).length??0,document:v.data?.filter(e=>"document"===e.kind||"link"===e.kind).length??0};return(0,t.jsx)(u.Shell,{title:i,subtitle:"Everything your teachers have shared with you",allow:e,children:(0,t.jsxs)("div",{className:"mx-auto max-w-2xl space-y-4",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-3",children:[(0,t.jsx)("div",{role:"tablist","aria-label":"Kind",className:"inline-flex rounded-[var(--radius-md)] border border-line bg-surface p-0.5",children:[["all","All"],["video","Videos"],["audio","Tracks"],["document","Resources"]].map(([e,s])=>(0,t.jsxs)("button",{role:"tab","aria-selected":a===e,onClick:()=>n(e),className:(0,f.cn)("min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium",a===e?"bg-accent-soft text-accent-ink":"text-ink-2 hover:text-ink"),children:[s," ",(0,t.jsx)("span",{className:"tnum text-ink-3",children:R[e]})]},e))}),(0,t.jsx)(h.Input,{type:"search",value:l,onChange:e=>_(e.target.value),className:"min-w-[180px] flex-1",placeholder:"Search","aria-label":"Search the library"})]}),v.isLoading&&(0,t.jsx)(h.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,t.jsx)(h.Skeleton,{className:"h-16"},e))}),v.error&&(0,t.jsx)(h.ErrorState,{error:v.error,onRetry:()=>v.refetch()}),0===b.length&&!v.isLoading&&(0,t.jsx)(h.Card,{children:(0,t.jsx)(h.EmptyState,{icon:(0,t.jsx)(r.PlayCircle,{className:"size-5"}),title:l?"Nothing matches that search":"Nothing here yet",body:l?void 0:"Your teachers can share videos, music and handouts with your classes."})}),b.length>0&&(0,t.jsx)(h.Card,{children:(0,t.jsx)("ul",{className:"divide-y divide-line",children:b.map(e=>{let s=m[e.kind],r=(e=>{if(!e)return null;let t=Math.floor(e/60);return t>=60?`${Math.floor(t/60)}h ${t%60}m`:`${t}:${String(e%60).padStart(2,"0")}`})(e.duration_sec);return(0,t.jsx)("li",{children:(0,t.jsxs)("a",{href:e.url??"#",target:"_blank",rel:"noopener noreferrer",className:"flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2",children:[(0,t.jsx)("span",{"aria-hidden":!0,className:(0,f.cn)("grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]","video"===e.kind?"bg-violet-soft text-violet":"audio"===e.kind?"bg-amber-soft text-amber":"bg-surface-2 text-ink-2"),children:(0,t.jsx)(s,{className:"size-5"})}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"block truncate font-medium",children:e.title}),(0,t.jsxs)("span",{className:"mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[12.5px] text-ink-2",children:[e.category&&(0,t.jsx)("span",{children:e.category}),e.scope_label&&(0,t.jsx)("span",{className:"text-ink-3",children:e.scope_label}),r&&(0,t.jsxs)("span",{className:"tnum inline-flex items-center gap-1 text-ink-3",children:[(0,t.jsx)(d.Clock,{className:"size-3","aria-hidden":!0}),r]})]})]}),(0,t.jsx)(o,{className:"size-4 shrink-0 text-ink-3","aria-hidden":!0})]})},e.id)})})}),(0,t.jsx)("p",{className:"px-1 text-[12.5px] text-ink-3",children:"Links open in a new tab. Uploaded files are coming — the studio shares links for now."})]})})}e.s(["LibraryView",0,y,"default",0,function(){return(0,t.jsx)(y,{allow:["student"],title:"Library"})}],87066)},13927,e=>{"use strict";let t;var s=e.i(12598),r=e.i(71645);let i=r.createContext(!1);i.Provider,e.i(43476);let a=r.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),l=e.i(40143),o=e.i(80166),d=e.i(73911),u=e.i(15823),c=e.i(75555),h=e.i(86491),p=class extends u.Subscribable{#e;#t=void 0;#s=void 0;#r=void 0;#i;#a;#n;#l;#o;#d;#u;#c;#h;#p=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#n=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),f(this.#t,this.options)?this.#f():this.updateResult(),this.#m())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return m(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return m(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#y(),this.#_(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#v(),this.#t.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let r=this.hasListeners();r&&y(this.#t,s,this.options,t)&&this.#f(),this.updateResult(),r&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||(0,n.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,n.resolveStaleTime)(t.staleTime,this.#t))&&this.#b();let i=this.#R();r&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||i!==this.#h)&&this.#g(i)}getOptimisticResult(e){var t,s;let r=this.#e.getQueryCache().build(this.#e,e),i=this.createResult(r,e);return t=this,s=i,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#r=i,this.#a=this.options,this.#i=this.#t.state),i}getCurrentResult(){return this.#r}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#p.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),r=this.#e.getQueryCache().build(this.#e,s),i=()=>{},a=new Promise(e=>{t=e,i=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===r.queryHash&&void 0!==r.state.data&&(i(),e(this.createResult(r,s)))})});return Promise.race([r.fetch().then(()=>{let e=this.createResult(r,s);return t?.(e),e}).finally(()=>{i()}),a])}fetch(e){return this.#f({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#r))}#f(e){this.#v();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#b(){this.#y();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#t);if(d.environmentManager.isServer()||this.#r.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#r.dataUpdatedAt,e)+1;this.#u=o.timeoutManager.setTimeout(()=>{this.#r.isStale||this.updateResult()},t)}#R(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#g(e){this.#_(),this.#h=e,!d.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,n.isValidTimeout)(this.#h)&&0!==this.#h&&(this.#c=o.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||c.focusManager.isFocused())&&this.#f()},this.#h))}#m(){this.#b(),this.#g(this.#R())}#y(){void 0!==this.#u&&(o.timeoutManager.clearTimeout(this.#u),this.#u=void 0)}#_(){void 0!==this.#c&&(o.timeoutManager.clearInterval(this.#c),this.#c=void 0)}createResult(e,t){let s,r=this.#t,i=this.options,a=this.#r,l=this.#i,o=this.#a,d=e!==r?e.state:this.#s,{state:u}=e,c={...u},p=!1;if(t._optimisticResults){let s=this.hasListeners(),a=!s&&f(e,t),n=s&&y(e,r,t,i);(a||n)&&(c={...c,...(0,h.fetchState)(u.data,e.options)}),"isRestoring"===t._optimisticResults&&(c.fetchStatus="idle")}let{error:m,errorUpdatedAt:v,status:b}=c;s=c.data;let R=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===b){let e;a?.isPlaceholderData&&t.placeholderData===o?.placeholderData?(e=a.data,R=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#d?.state.data,this.#d):t.placeholderData,void 0!==e&&(b="success",s=(0,n.replaceData)(a?.data,e,t),p=!0)}if(t.select&&void 0!==s&&!R)if(a&&s===l?.data&&t.select===this.#l)s=this.#o;else try{this.#l=t.select,s=t.select(s),s=(0,n.replaceData)(a?.data,s,t),this.#o=s,this.#n=null}catch(e){this.#n=e}else void 0===s&&(this.#n=null);this.#n&&(m=this.#n,s=this.#o,v=Date.now(),b="error",p=!1);let g="fetching"===c.fetchStatus,x="pending"===b,k="error"===b,w=x&&g,S=void 0!==s;return{status:b,fetchStatus:c.fetchStatus,isPending:x,isSuccess:"success"===b,isError:k,isInitialLoading:w,isLoading:w,data:s,dataUpdatedAt:c.dataUpdatedAt,error:m,errorUpdatedAt:v,failureCount:c.fetchFailureCount,failureReason:c.fetchFailureReason,errorUpdateCount:c.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:c.dataUpdateCount>d.dataUpdateCount||c.errorUpdateCount>d.errorUpdateCount,isFetching:g,isRefetching:g&&!x,isLoadingError:k&&!S,isPaused:"paused"===c.fetchStatus,isPlaceholderData:p,isRefetchError:k&&S,isStale:_(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#r,t=this.createResult(this.#t,this.options);if(this.#i=this.#t.state,this.#a=this.options,void 0!==this.#i.data&&(this.#d=this.#t),(0,n.shallowEqualObjects)(t,e))return;this.#r=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#p.size)return!0;let r=new Set(s??this.#p);return this.options.throwOnError&&r.add("error"),Object.keys(this.#r).some(t=>this.#r[t]!==e[t]&&r.has(t))};this.#x({listeners:s()})}#v(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#m()}#x(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#r)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function f(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&m(e,t,t.refetchOnMount)}function m(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let r="function"==typeof s?s(e):s;return"always"===r||!1!==r&&_(e,t)}return!1}function y(e,t,s,r){return(e!==t||!1===(0,n.resolveQueryBoolean)(r.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&_(e,s)}function _(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}var v=e.i(30224),b=e.i(31502);function R(e,t,o=[],d){let{session:u}=(0,b.useSession)();return function(e,t,o){let d,u=r.useContext(i),c=r.useContext(a),h=(0,s.useQueryClient)(o),p=h.defaultQueryOptions(e),f=h.getQueryCache().get(p.queryHash),m=!1!==e.subscribed;if(p._optimisticResults=u?"isRestoring":m?"optimistic":void 0,p.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=p.staleTime;p.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof p.gcTime&&(p.gcTime=Math.max(p.gcTime,1e3))}d=f?.state.error&&"function"==typeof p.throwOnError?(0,n.shouldThrowError)(p.throwOnError,[f.state.error,f]):p.throwOnError,(p.suspense||d)&&!c.isReset()&&(p.retryOnMount=!1),r.useEffect(()=>{c.clearReset()},[c]);let[y]=r.useState(()=>new t(h,p)),_=y.getOptimisticResult(p),v=!u&&m;if(r.useSyncExternalStore(r.useCallback(e=>{let t=v?y.subscribe(l.notifyManager.batchCalls(e)):n.noop;return y.updateResult(),t},[y,v]),()=>y.getCurrentResult(),()=>y.getCurrentResult()),r.useEffect(()=>{y.setOptions(p)},[p,y]),p?.suspense&&_.isPending)throw y.fetchOptimistic(p).catch(()=>{c.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:r,suspense:i})=>e.isError&&!t.isReset()&&!e.isFetching&&r&&(i&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,r])))({result:_,errorResetBoundary:c,throwOnError:p.throwOnError,query:f,suspense:p.suspense}))throw _.error;return p.notifyOnChangeProps?_:y.trackResult(_)}({queryKey:["db",u?.userId??"anon",...e],queryFn:()=>(0,v.readAs)(u,t,o),staleTime:15e3,...d},p,void 0)}e.s(["useRow",0,function(e,t,s=[]){let r=R(e,t,s);return{...r,data:r.data?.[0]}},"useRows",0,R],13927)},27389,e=>{"use strict";let t=`
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
returning id, status`,p=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`;e.s(["ANSWER_REQUEST",0,p,"DECIDE_ENTRY",0,h,"EVENTS",0,i,"MY_ASSESSMENTS",0,r,"MY_REQUESTS",0,n,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,u,"RAISE_REQUEST",0,l,"REQUEST_PLACE",0,a,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,d])}]);