(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var i=e.i(12598),s=e.i(71645);let a=s.createContext(!1);a.Provider,e.i(43476);let r=s.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),o=e.i(40143),l=e.i(80166),d=e.i(73911),c=e.i(15823),u=e.i(75555),m=e.i(86491),_=class extends c.Subscribable{#e;#t=void 0;#i=void 0;#s=void 0;#a;#r;#n;#o;#l;#d;#c;#u;#m;#_=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#n=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),h(this.#t,this.options)?this.#h():this.updateResult(),this.#p())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return p(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return p(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#f(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,i=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#g(),this.#t.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let s=this.hasListeners();s&&f(this.#t,i,this.options,t)&&this.#h(),this.updateResult(),s&&(this.#t!==i||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||(0,n.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,n.resolveStaleTime)(t.staleTime,this.#t))&&this.#b();let a=this.#v();s&&(this.#t!==i||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||a!==this.#m)&&this.#w(a)}getOptimisticResult(e){var t,i;let s=this.#e.getQueryCache().build(this.#e,e),a=this.createResult(s,e);return t=this,i=a,(0,n.shallowEqualObjects)(t.getCurrentResult(),i)||(this.#s=a,this.#r=this.options,this.#a=this.#t.state),a}getCurrentResult(){return this.#s}trackResult(e,t){return new Proxy(e,{get:(e,i)=>(this.trackProp(i),t?.(i),Reflect.get(e,i))})}trackProp(e){this.#_.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,i=this.#e.defaultQueryOptions(e),s=this.#e.getQueryCache().build(this.#e,i),a=()=>{},r=new Promise(e=>{t=e,a=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===s.queryHash&&void 0!==s.state.data&&(a(),e(this.createResult(s,i)))})});return Promise.race([s.fetch().then(()=>{let e=this.createResult(s,i);return t?.(e),e}).finally(()=>{a()}),r])}fetch(e){return this.#h({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#s))}#h(e){this.#g();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#b(){this.#f();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#t);if(d.environmentManager.isServer()||this.#s.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#s.dataUpdatedAt,e)+1;this.#c=l.timeoutManager.setTimeout(()=>{this.#s.isStale||this.updateResult()},t)}#v(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#w(e){this.#y(),this.#m=e,!d.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,n.isValidTimeout)(this.#m)&&0!==this.#m&&(this.#u=l.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#h()},this.#m))}#p(){this.#b(),this.#w(this.#v())}#f(){void 0!==this.#c&&(l.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(l.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let i,s=this.#t,a=this.options,r=this.#s,o=this.#a,l=this.#r,d=e!==s?e.state:this.#i,{state:c}=e,u={...c},_=!1;if(t._optimisticResults){let i=this.hasListeners(),r=!i&&h(e,t),n=i&&f(e,s,t,a);(r||n)&&(u={...u,...(0,m.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:p,errorUpdatedAt:g,status:b}=u;i=u.data;let v=!1;if(void 0!==t.placeholderData&&void 0===i&&"pending"===b){let e;r?.isPlaceholderData&&t.placeholderData===l?.placeholderData?(e=r.data,v=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#d?.state.data,this.#d):t.placeholderData,void 0!==e&&(b="success",i=(0,n.replaceData)(r?.data,e,t),_=!0)}if(t.select&&void 0!==i&&!v)if(r&&i===o?.data&&t.select===this.#o)i=this.#l;else try{this.#o=t.select,i=t.select(i),i=(0,n.replaceData)(r?.data,i,t),this.#l=i,this.#n=null}catch(e){this.#n=e}else void 0===i&&(this.#n=null);this.#n&&(p=this.#n,i=this.#l,g=Date.now(),b="error",_=!1);let w="fetching"===u.fetchStatus,S="pending"===b,E="error"===b,T=S&&w,R=void 0!==i;return{status:b,fetchStatus:u.fetchStatus,isPending:S,isSuccess:"success"===b,isError:E,isInitialLoading:T,isLoading:T,data:i,dataUpdatedAt:u.dataUpdatedAt,error:p,errorUpdatedAt:g,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>d.dataUpdateCount||u.errorUpdateCount>d.errorUpdateCount,isFetching:w,isRefetching:w&&!S,isLoadingError:E&&!R,isPaused:"paused"===u.fetchStatus,isPlaceholderData:_,isRefetchError:E&&R,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#s,t=this.createResult(this.#t,this.options);if(this.#a=this.#t.state,this.#r=this.options,void 0!==this.#a.data&&(this.#d=this.#t),(0,n.shallowEqualObjects)(t,e))return;this.#s=t;let i=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,i="function"==typeof t?t():t;if("all"===i||!i&&!this.#_.size)return!0;let s=new Set(i??this.#_);return this.options.throwOnError&&s.add("error"),Object.keys(this.#s).some(t=>this.#s[t]!==e[t]&&s.has(t))};this.#S({listeners:i()})}#g(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#i=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#p()}#S(e){o.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#s)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function h(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&p(e,t,t.refetchOnMount)}function p(e,t,i){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let s="function"==typeof i?i(e):i;return"always"===s||!1!==s&&y(e,t)}return!1}function f(e,t,i,s){return(e!==t||!1===(0,n.resolveQueryBoolean)(s.enabled,e))&&(!i.suspense||"error"!==e.state.status)&&y(e,i)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,l){let d,c=s.useContext(a),u=s.useContext(r),m=(0,i.useQueryClient)(l),_=m.defaultQueryOptions(e),h=m.getQueryCache().get(_.queryHash),p=!1!==e.subscribed;if(_._optimisticResults=c?"isRestoring":p?"optimistic":void 0,_.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=_.staleTime;_.staleTime="function"==typeof t?(...i)=>e(t(...i)):e(t),"number"==typeof _.gcTime&&(_.gcTime=Math.max(_.gcTime,1e3))}d=h?.state.error&&"function"==typeof _.throwOnError?(0,n.shouldThrowError)(_.throwOnError,[h.state.error,h]):_.throwOnError,(_.suspense||d)&&!u.isReset()&&(_.retryOnMount=!1),s.useEffect(()=>{u.clearReset()},[u]);let[f]=s.useState(()=>new t(m,_)),y=f.getOptimisticResult(_),g=!c&&p;if(s.useSyncExternalStore(s.useCallback(e=>{let t=g?f.subscribe(o.notifyManager.batchCalls(e)):n.noop;return f.updateResult(),t},[f,g]),()=>f.getCurrentResult(),()=>f.getCurrentResult()),s.useEffect(()=>{f.setOptions(_)},[_,f]),_?.suspense&&y.isPending)throw f.fetchOptimistic(_).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:i,query:s,suspense:a})=>e.isError&&!t.isReset()&&!e.isFetching&&s&&(a&&void 0===e.data||(0,n.shouldThrowError)(i,[e.error,s])))({result:y,errorResetBoundary:u,throwOnError:_.throwOnError,query:h,suspense:_.suspense}))throw y.error;return _.notifyOnChangeProps?y:f.trackResult(y)}(e,_,t)}],66027)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},27612,e=>{"use strict";let t=(0,e.i(75254).default)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);e.s(["Trash2",0,t],27612)},78894,e=>{"use strict";let t=(0,e.i(75254).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);e.s(["AlertTriangle",0,t],78894)},37727,e=>{"use strict";let t=(0,e.i(75254).default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);e.s(["X",0,t],37727)},33405,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(87338),a=e.i(54626),r=e.i(1844),n=e.i(7989),o=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,o.cn)("mt-0.5 flex items-center gap-1 text-[0.6875rem] text-ink-3",e),children:["powered by",(0,t.jsx)(s.SwayvoLogo,{className:"swayvo-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Swayvo"}),(0,t.jsx)(s.SwayvoLogo,{className:"swayvo-on-dark h-[0.95em] translate-y-[0.06em]",tone:"white",title:null})]})},"SchoolHero",0,function({src:e,name:i,children:s}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${i}`,className:"aspect-[16/7] w-full object-cover"}),s&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:s})]}):null},"SchoolMark",0,function({name:e,logo:i,className:s}){return i?(0,t.jsx)("img",{src:i,alt:`${e} logo`,className:(0,o.cn)("shrink-0 rounded-lg object-contain",s)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,o.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[0.8125rem] font-semibold text-on-accent",s),children:(0,a.monogram)(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,s=e?.brand_colour??null,o=e?.brand_secondary??null,l=!!e;i.useEffect(()=>{let e=document.documentElement,i=[...Object.keys((0,a.cssVars)((0,a.paletteFor)(null))),"--color-secondary"];if(!l){i.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme,document.querySelector('meta[name="theme-color"]')?.setAttribute("content",n.THEME_COLOR);return}let d=(0,r.schoolColours)(t,s,o);e.dataset.theme=d.theme.id,Object.entries((0,a.cssVars)((0,a.paletteFor)(d.accent,d.theme.surface))).forEach(([t,i])=>e.style.setProperty(t,i)),e.style.setProperty("--color-secondary",d.secondary);let c=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});c.setAttribute("content",d.theme.dark?d.theme.canvas:d.theme.surface),c.parentNode||document.head.appendChild(c)},[l,t,s,o])}])},65712,19654,84246,5866,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(37727),a=e.i(27612),r=e.i(17658),n=e.i(78894);function o(e,t){i.useEffect(()=>{if(!t)return;let i=window.setTimeout(()=>{let t=e.current?.querySelector('[aria-invalid="true"], [role="alert"], [data-form-error]');t&&(t.scrollIntoView?.({block:"center",behavior:"smooth"}),t.matches("input, select, textarea, button")||t.hasAttribute("tabindex")||t.setAttribute("tabindex","-1"),t.focus({preventScroll:!0}))},0);return()=>window.clearTimeout(i)},[e,t])}function l({error:e,reason:i}){var s;let a,o=null!=e&&/PLAN_LIMIT/.test(String(e?.message??e)),d=o?"Your plan’s limit is reached. See above to ask for a larger plan.":null!=e?`Not saved. ${((a=(s=(0,r.errorText)(e)).match(/^.{1,140}?[.!?](\s|$)/))?a[0]:s.length>140?s.slice(0,139)+"…":s).trim()}`:i;if(!d)return null;let c=null!=e&&!o;return(0,t.jsxs)("p",{className:"flex w-full items-start gap-1.5 text-[0.7812rem] sm:w-auto sm:flex-1 sm:self-center "+(c?"text-critical":"text-ink-3"),children:[c&&(0,t.jsx)(n.AlertTriangle,{className:"mt-0.5 size-3.5 shrink-0","aria-hidden":!0}),(0,t.jsx)("span",{children:d})]})}e.s(["SaveErrorSummary",0,l,"useFirstErrorInView",0,o],19654);var d=e.i(54616),c=e.i(30224),u=e.i(31502);let m="select app.request_plan_upgrade($1) as ok",_=`
select m.id, m.merged_at, m.undone_at, k.name as kept_name, o.name as merged_name,
       m.merged_at > now() - interval '30 days' and m.undone_at is null as can_undo
  from family_merge m
  join family k on k.id = m.kept_id
  join lateral (select name from family where id = m.merged_id) o on true
 order by m.merged_at desc limit 10`,h=`
select f.id, f.is_prospect,
       coalesce((select array_agg(distinct e.class_id) from enrolment e join student s on s.id = e.student_id
                  where s.family_id = f.id and e.status = 'active' and e.deleted_at is null and s.deleted_at is null), '{}') as class_ids,
       exists (select 1 from guardian g where g.family_id = f.id and g.deleted_at is null and g.user_id is not null) as has_login,
       exists (select 1 from guardian g where g.family_id = f.id and g.deleted_at is null
                 and (g.email is not null or g.phone is not null)) as has_contact
  from family f where f.deleted_at is null`;e.s(["ACTION_WORD",0,{insert:"Created",update:"Changed",delete:"Removed",soft_delete:"Removed",view_medical:"Viewed",merge:"Merged",unmerge:"Unmerged",withdraw:"Withdrew",offer:"Offered",accept:"Accepted",decline:"Declined",expire:"Expired",convert:"Converted",close:"Closed",upgrade_request:"Asked",grant:"Granted",import:"Imported"},"ENTITY_WORD",0,{family:"Family",guardian:"Guardian",student:"Student",emergency_contact:"Emergency contact",medical_record:"Medical record",consent_record:"Consent",enrolment:"Class place",invoice:"Invoice",payment:"Payment",membership:"Access and roles",studio:"School settings",class:"Class",staff_member:"Staff",enquiry:"Enquiry",waitlist_entry:"Waiting list",trial:"Trial"},"FAMILY_DUPLICATES",0,"select * from app.family_duplicates()","FAMILY_FACTS",0,h,"LOG_MEDICAL_VIEW",0,"select app.log_medical_view($1) as ok","MERGE_FAMILIES",0,"select app.merge_families($1, $2) as id","MERGE_PREVIEW",0,"select * from app.family_merge_preview($1, $2)","OFFICE_HISTORY",0,"select * from app.office_history($1::uuid, $2, $3, $4::date, $5::date, $6, $7)","OFFICE_HISTORY_ACTORS",0,"select * from app.office_history_actors()","RECENT_MERGES",0,_,"RECORD_HISTORY",0,"select * from app.record_history($1, $2::uuid)","REQUEST_UPGRADE",0,m,"UNDO_MERGE",0,"select app.undo_family_merge($1) as ok","readableSummary",0,e=>(e??"").replace(/_/g," ")],84246);var p=e.i(22016);let f=e=>null!=e&&/PLAN_LIMIT/.test(String(e?.message??e));function y({error:e}){let{session:i}=(0,u.useSession)(),s=(0,d.useMutation)({mutationFn:()=>(0,c.runAs)(i,t=>t(m,[(0,r.errorText)(e)]))}),a=s.isSuccess;return(0,t.jsxs)("div",{role:"status","data-form-error":!0,className:"border-l-2 border-accent-line py-1 pl-3",children:[(0,t.jsx)(r.Notice,{word:"Full",tone:"accent",title:"Your plan is full here",detail:`${(0,r.errorText)(e).replace(/\s*Ask Swayvo to move you to a larger plan\.?$/,"")} Nothing is lost: you can add more once the plan is larger.`,action:void 0}),(0,t.jsxs)("div",{className:"mt-3 flex flex-wrap items-center gap-2",children:[i?.role!=="owner"||i.platform?a?(0,t.jsx)("p",{className:"text-[0.8438rem] font-semibold text-positive",children:"Asked. Swayvo will be in touch about a larger plan."}):(0,t.jsx)(r.Button,{size:"sm",loading:s.isPending,onClick:()=>s.mutate(),children:"Ask to upgrade"}):(0,t.jsx)(p.default,{href:"/account#plan",className:"inline-flex min-h-9 items-center rounded-[var(--radius-md)] border border-line-strong px-3 text-[0.8438rem] font-semibold hover:bg-surface-2",children:"Choose a larger plan"}),null!=s.error&&(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"That request could not be sent. Try again, or contact Swayvo."})]})]})}e.s(["PlanLimitNotice",0,y,"isPlanLimit",0,f],5866),e.s(["RecordSheet",0,function({title:e,subtitle:n,onClose:d,onSave:c,saving:u,error:m,canSave:_=!0,saveLabel:h="Save",onRemove:p,removing:g,removeLabel:b="Remove",removeHint:v,saveHint:w,children:S}){let E=i.useId(),T=i.useRef(null),R=i.useRef(d);R.current=d,i.useEffect(()=>{let e=e=>{"Escape"===e.key&&R.current()};return document.addEventListener("keydown",e),T.current?.querySelector('input, select, textarea, button:not([aria-label="Close"])')?.focus(),()=>document.removeEventListener("keydown",e)},[]);let $=i.useRef(null);return o($,m),(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6",onClick:d,children:(0,t.jsxs)("div",{ref:T,role:"dialog","aria-modal":"true","aria-labelledby":E,onClick:e=>e.stopPropagation(),className:"flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden\n                   rounded-t-[var(--radius-xl)] border border-line bg-surface shadow-lg\n                   sm:rounded-[var(--radius-xl)]",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3 border-b border-line px-5 pb-3 pt-4",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{id:E,className:"text-[1.0625rem] font-semibold leading-tight tracking-[-0.01em]",children:e}),n&&(0,t.jsx)("p",{className:"mt-1 text-[0.8438rem] text-ink-3",children:n})]}),(0,t.jsx)(r.Button,{size:"sm",variant:"ghost","aria-label":"Close",onClick:d,className:"-mr-2 -mt-1",children:(0,t.jsx)(s.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsxs)("div",{ref:$,className:"min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4",children:[(0,t.jsx)("div",{className:"space-y-4",children:S}),null!=m&&(0,t.jsx)("div",{className:"mt-4",children:f(m)?(0,t.jsx)(y,{error:m}):(0,t.jsx)(r.ErrorState,{error:m})}),p&&(0,t.jsx)("div",{className:"mt-6 border-t border-line pt-4",children:v?(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:v}):(0,t.jsxs)(r.Button,{variant:"danger",size:"sm",loading:g,onClick:p,children:[(0,t.jsx)(a.Trash2,{className:"size-4","aria-hidden":!0})," ",b]})})]}),(0,t.jsxs)("div",{className:"flex flex-wrap gap-2 border-t border-line bg-surface px-5 py-3 pb-safe sm:flex-nowrap sm:justify-end",children:[(0,t.jsx)(l,{error:m??void 0,reason:_?null:w}),c!==d&&(0,t.jsx)(r.Button,{className:"flex-1 sm:flex-none",variant:"ghost",onClick:d,children:"Cancel"}),(0,t.jsx)(r.Button,{className:"flex-[2] sm:flex-none",variant:"primary",disabled:!_,loading:u,onClick:c,children:h})]})]})})}],65712)},75379,e=>{"use strict";let t="Europe/London",i=e=>e instanceof Date?e:new Date(e),s=e=>{let s=i(e),a=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(s),r=e=>a.find(t=>t.type===e)?.value??"";return`${r("year")}-${r("month")}-${r("day")}`},a=e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(i(e)),r=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(i(e)):"—";function n(e,a=new Date){let r=i(e),o=s(r).slice(0,4)!==s(a).slice(0,4),l=new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:t,...o?{year:"numeric"}:{}}).formatToParts(r),d=e=>l.find(t=>t.type===e)?.value??"";return`${d("weekday")} ${d("day")} ${d("month")}${o?` ${d("year")}`:""}`}function o(e,t=new Date){let i=function(e,t=new Date){let i=e=>Date.parse(s(e)+"T00:00:00Z");return Math.round((i(e)-i(t))/864e5)}(e,t);return 0===i?"Today":1===i?"Tomorrow":-1===i?"Yesterday":n(e,t)}e.s(["ageFrom",0,function(e){if(!e)return null;let t=i(e),s=new Date,a=s.getFullYear()-t.getFullYear(),r=s.getMonth()-t.getMonth();return(r<0||0===r&&s.getDate()<t.getDate())&&(a-=1),a},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(i(e)),"dateShort",0,r,"dayDate",0,n,"dayDateTime",0,(e,t=new Date)=>`${o(e,t)}, ${a(e)}`,"dayHeading",0,function(e,t=new Date){let i=o(e,t);return"Today"===i||"Tomorrow"===i||"Yesterday"===i?`${i} \xb7 ${r(e)}`:i},"dayName",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(i(e)),"dayRange",0,function(e=0){let t=new Date,i=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),s=new Date(i);return s.setDate(s.getDate()+1),[i.toISOString(),s.toISOString()]},"initials",0,(...e)=>{let t=e.filter(Boolean).flatMap(e=>e.trim().split(/\s+/)).filter(Boolean);return(t.length>1?[t[0],t[t.length-1]]:t).map(e=>e[0]?.toUpperCase()??"").join("")},"isoDate",0,s,"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,o,"time",0,a,"toDate",0,i,"toDateInput",0,function(e){if(null==e||""===e)return"";if(e instanceof Date){if(Number.isNaN(e.getTime()))return"";let t=0===e.getUTCHours()&&0===e.getUTCMinutes()&&0===e.getUTCSeconds()&&0===e.getUTCMilliseconds(),i=t?e.getUTCFullYear():e.getFullYear(),s=(t?e.getUTCMonth():e.getMonth())+1,a=t?e.getUTCDate():e.getDate();return`${String(i).padStart(4,"0")}-${String(s).padStart(2,"0")}-${String(a).padStart(2,"0")}`}let t=String(e);return/^\d{4}-\d{2}-\d{2}/.test(t)?t.slice(0,10):""},"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),i=(t.getDay()+6)%7;t.setDate(t.getDate()-i),t.setHours(0,0,0,0);let s=new Date(t);return s.setDate(s.getDate()+7),[t.toISOString(),s.toISOString()]}])},13927,e=>{"use strict";var t=e.i(66027),i=e.i(30224),s=e.i(31502);function a(e,r,n=[],o){let{session:l}=(0,s.useSession)();return(0,t.useQuery)({queryKey:["db",l?.userId??"anon",l?.studio??"",...e],queryFn:()=>(0,i.readAs)(l,r,n),staleTime:15e3,...o})}e.s(["useRow",0,function(e,t,i=[]){let s=a(e,t,i);return{...s,data:s.data?.[0]}},"useRows",0,a])},8199,e=>{"use strict";let t=`
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
 order by s.date_of_birth`,s=`
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
 order by i.issued_on desc nulls last limit 8`,r=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at, c.name as class_name
  from communication cm
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
   and not cm.inbound          -- only what the studio sent, never the family's own messages (R-047)
 order by cm.sent_at desc limit 8`,n=`
select g.id, g.full_name, g.email, g.phone, g.relationship, g.user_id = auth.uid() as is_me
  from guardian g where g.deleted_at is null and g.family_id in (select app.guardian_family_ids())
 order by (g.user_id = auth.uid()) desc nulls last, g.is_primary desc, g.full_name`,o=`
update guardian set full_name = $2, email = nullif($3, ''), phone = nullif($4, ''), updated_at = now() where id = $1`,l=`
select c.id, c.student_id, c.full_name, c.relationship, c.phone from collection_permission c
 where c.deleted_at is null and c.allowed order by c.created_at`,d=`
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
 where p.remaining > 0 and p.expires_on >= current_date order by p.expires_on`,p=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor
  from invoice i where i.deleted_at is null and i.status <> 'draft'
 order by i.issued_on desc nulls last, i.number desc`,f=`
select p.id, p.amount_minor, p.refunded_minor, p.method, p.succeeded_at, i.number as invoice_number,
       'RCPT-' || upper(left(md5(p.id::text), 8)) as reference
  from payment p left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null and p.succeeded_at is not null and p.amount_minor > 0
 order by p.succeeded_at desc`,y=`
select id, number, issued_on, due_on, description, total_minor, paid_minor
  from imported_invoice order by issued_on desc, number desc`,g=`
select p.id, 'RCPT-' || upper(left(md5(p.id::text), 8)) as reference,
       p.amount_minor, p.refunded_minor, p.method, p.succeeded_at,
       st.name as studio_name, regexp_replace(f.name, '\\s*\\(adult\\)\\s*$', '') as family_name,
       (select g.full_name from guardian g where g.user_id = auth.uid() and g.family_id = f.id and g.deleted_at is null limit 1) as payer,
       i.id as invoice_id, i.number as invoice_number, i.total_minor as invoice_total, i.paid_minor as invoice_paid
  from payment p join family f on f.id = p.family_id join studio st on st.id = p.studio_id
  left join invoice i on i.id = p.invoice_id
 where p.id = $1 and p.deleted_at is null and p.succeeded_at is not null`;e.s(["ADD_COLLECTOR",0,d,"ADD_CONTACT",0,u,"ASK_TO_CHANGE_GUARDIAN",0,"select app.ask_to_change_guardian($1, $2) as id","BOOK_DROP_IN",0,"select app.book_drop_in($1, $2) as r","BOOK_FOR_MYSELF",0,"select app.book_for_myself($1::date, coalesce($2::boolean, false), $3, $4) as id","BOOK_TRIAL",0,"select app.parent_book_trial($1, $2) as result","BUY_PACK",0,"select app.buy_pack($1, $2) as id","CANCEL_DROP_IN",0,"select app.cancel_drop_in($1) as r","CANCEL_TRIAL",0,"select app.guardian_cancel_trial($1) as r","CLASS_OPTIONS",0,"select * from app.class_options_for_child($1)","DROP_IN_SESSIONS",0,"select d.* from studio s, app.drop_in_sessions(s.id) d where s.id in (select app.studio_ids()) order by d.starts_at","INVITE_STUDENT",0,"select app.guardian_invite_student($1, $2) as token","JOIN_WAITLIST",0,"select app.parent_join_waitlist($1, $2) as position","MY_ALL_INVOICES",0,p,"MY_BALANCE",0,s,"MY_BILLING_SHARE",0,"select * from app.my_billing_share()","MY_BOOKINGS",0,"select * from app.my_bookings()","MY_CHILDREN",0,i,"MY_CHILDREN_LOGINS",0,"select * from app.my_children_logins()","MY_CLASHES",0,"select * from app.my_family_clashes($1::timestamptz, $2::timestamptz)","MY_COLLECTORS",0,l,"MY_COMING_UP",0,"select * from app.my_coming_up()","MY_CONTACTS",0,c,"MY_DROP_INS",0,_,"MY_GUARDIANS",0,n,"MY_IMPORTED_INVOICES",0,y,"MY_INVOICES",0,a,"MY_MESSAGES",0,r,"MY_PACKS",0,h,"MY_PAYMENTS",0,f,"MY_RECEIPT",0,g,"MY_SCHEDULE",0,t,"PACKS",0,"select id, name, classes, price_minor, valid_days from class_pack where active order by classes","REMOVE_COLLECTOR",0,"select app.remove_collection_person($1)","REMOVE_CONTACT",0,"select app.remove_emergency_contact($1)","REQUEST_CHILD",0,"select app.request_new_child($1::jsonb) as id","REQUEST_PLACE",0,"select app.request_class_place($1, $2, $3) as id","SET_STUDENT_LOGIN",0,"select app.set_student_login($1, $2) as r","UPDATE_CHILD_DETAILS",0,"select app.guardian_update_child($1, $2, $3, $4)","UPDATE_CONTACT",0,m,"UPDATE_GUARDIAN",0,o])},33204,e=>{"use strict";let t=`
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
 order by c.sent_at`,s=`
select c.id, c.subject, c.body, c.sent_at, c.inbound, c.reply_to, c.request_id is not null as is_request,
       c.private_to is not null as private, c.sent_by = auth.uid() as mine,
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
 limit 60`,r=`
select c.id, c.name, sm.display_name as teacher,
       (select count(distinct s.family_id)::int from enrolment e join student s on s.id = e.student_id
         where e.class_id = c.id and e.status = 'active' and e.deleted_at is null) as families
  from class c left join staff_member sm on sm.id = c.teacher_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`,n=`
select id, name, subject, body from communication_template
 where deleted_at is null order by name`,o=`
insert into communication_template (studio_id, name, subject, body)
select studio_id, $1, nullif(btrim($2), ''), $3 from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,l=`
update communication_template set name = $2, subject = nullif(btrim($3), ''), body = $4, updated_at = now()
 where id = $1 returning id`,d=`
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
 limit 1 returning id`,g=`
select id, kind, title, body, href, read_at, created_at from notification
 where deleted_at is null order by created_at desc limit 40`,b=`
select count(*)::int as n from notification where deleted_at is null and read_at is null`,v=`
select r.id, r.event, r.enabled, r.template_id, t.name as template_name,
       (select count(*)::int from automation_run x where x.rule_id = r.id) as sent,
       (select max(ran_at) from automation_run x where x.rule_id = r.id) as last_sent,
       coalesce((select d.due from app.automation_due(r.studio_id) d where d.rule_id = r.id), 0) as due
  from automation_rule r
  left join communication_template t on t.id = r.template_id and t.deleted_at is null
 order by array_position(array['trial_booked','trial_reminder_48h','trial_reminder_same_day',
                               'trial_attended','trial_missed','waitlist_offer'], r.event)`,w=`
select app.run_automations(studio_id) as sent from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`,S=`
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,a,"CLASS_AUDIENCES",0,r,"CONVERSATION",0,i,"CREATE_TEMPLATE",0,o,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,s,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,g,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,S,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,f,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,v,"RUN_AUTOMATIONS",0,w,"SEND_CLASS",0,m,"SEND_CLASS_AT",0,_,"SEND_DIRECT",0,d,"SEND_DIRECT_AT",0,u,"SEND_REPLY",0,c,"SEND_STUDIO",0,h,"SEND_STUDIO_AT",0,p,"SEND_TO_STUDIO",0,y,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,n,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,b,"UPDATE_TEMPLATE",0,l])}]);