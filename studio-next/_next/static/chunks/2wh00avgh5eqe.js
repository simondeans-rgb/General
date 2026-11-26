(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var i=e.i(12598),s=e.i(71645);let a=s.createContext(!1);a.Provider,e.i(43476);let r=s.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),o=e.i(40143),d=e.i(80166),l=e.i(73911),c=e.i(15823),u=e.i(75555),m=e.i(86491),_=class extends c.Subscribable{#e;#t=void 0;#i=void 0;#s=void 0;#a;#r;#n;#o;#d;#l;#c;#u;#m;#_=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#n=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),h(this.#t,this.options)?this.#h():this.updateResult(),this.#f())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,i=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let s=this.hasListeners();s&&p(this.#t,i,this.options,t)&&this.#h(),this.updateResult(),s&&(this.#t!==i||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||(0,n.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,n.resolveStaleTime)(t.staleTime,this.#t))&&this.#v();let a=this.#g();s&&(this.#t!==i||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||a!==this.#m)&&this.#w(a)}getOptimisticResult(e){var t,i;let s=this.#e.getQueryCache().build(this.#e,e),a=this.createResult(s,e);return t=this,i=a,(0,n.shallowEqualObjects)(t.getCurrentResult(),i)||(this.#s=a,this.#r=this.options,this.#a=this.#t.state),a}getCurrentResult(){return this.#s}trackResult(e,t){return new Proxy(e,{get:(e,i)=>(this.trackProp(i),t?.(i),Reflect.get(e,i))})}trackProp(e){this.#_.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,i=this.#e.defaultQueryOptions(e),s=this.#e.getQueryCache().build(this.#e,i),a=()=>{},r=new Promise(e=>{t=e,a=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===s.queryHash&&void 0!==s.state.data&&(a(),e(this.createResult(s,i)))})});return Promise.race([s.fetch().then(()=>{let e=this.createResult(s,i);return t?.(e),e}).finally(()=>{a()}),r])}fetch(e){return this.#h({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#s))}#h(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#v(){this.#p();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#t);if(l.environmentManager.isServer()||this.#s.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#s.dataUpdatedAt,e)+1;this.#c=d.timeoutManager.setTimeout(()=>{this.#s.isStale||this.updateResult()},t)}#g(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#w(e){this.#y(),this.#m=e,!l.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,n.isValidTimeout)(this.#m)&&0!==this.#m&&(this.#u=d.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#h()},this.#m))}#f(){this.#v(),this.#w(this.#g())}#p(){void 0!==this.#c&&(d.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(d.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let i,s=this.#t,a=this.options,r=this.#s,o=this.#a,d=this.#r,l=e!==s?e.state:this.#i,{state:c}=e,u={...c},_=!1;if(t._optimisticResults){let i=this.hasListeners(),r=!i&&h(e,t),n=i&&p(e,s,t,a);(r||n)&&(u={...u,...(0,m.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:b,status:v}=u;i=u.data;let g=!1;if(void 0!==t.placeholderData&&void 0===i&&"pending"===v){let e;r?.isPlaceholderData&&t.placeholderData===d?.placeholderData?(e=r.data,g=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#l?.state.data,this.#l):t.placeholderData,void 0!==e&&(v="success",i=(0,n.replaceData)(r?.data,e,t),_=!0)}if(t.select&&void 0!==i&&!g)if(r&&i===o?.data&&t.select===this.#o)i=this.#d;else try{this.#o=t.select,i=t.select(i),i=(0,n.replaceData)(r?.data,i,t),this.#d=i,this.#n=null}catch(e){this.#n=e}else void 0===i&&(this.#n=null);this.#n&&(f=this.#n,i=this.#d,b=Date.now(),v="error",_=!1);let w="fetching"===u.fetchStatus,E="pending"===v,R="error"===v,S=E&&w,$=void 0!==i;return{status:v,fetchStatus:u.fetchStatus,isPending:E,isSuccess:"success"===v,isError:R,isInitialLoading:S,isLoading:S,data:i,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>l.dataUpdateCount||u.errorUpdateCount>l.errorUpdateCount,isFetching:w,isRefetching:w&&!E,isLoadingError:R&&!$,isPaused:"paused"===u.fetchStatus,isPlaceholderData:_,isRefetchError:R&&$,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#s,t=this.createResult(this.#t,this.options);if(this.#a=this.#t.state,this.#r=this.options,void 0!==this.#a.data&&(this.#l=this.#t),(0,n.shallowEqualObjects)(t,e))return;this.#s=t;let i=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,i="function"==typeof t?t():t;if("all"===i||!i&&!this.#_.size)return!0;let s=new Set(i??this.#_);return this.options.throwOnError&&s.add("error"),Object.keys(this.#s).some(t=>this.#s[t]!==e[t]&&s.has(t))};this.#E({listeners:i()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#i=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#f()}#E(e){o.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#s)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function h(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,i){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let s="function"==typeof i?i(e):i;return"always"===s||!1!==s&&y(e,t)}return!1}function p(e,t,i,s){return(e!==t||!1===(0,n.resolveQueryBoolean)(s.enabled,e))&&(!i.suspense||"error"!==e.state.status)&&y(e,i)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,d){let l,c=s.useContext(a),u=s.useContext(r),m=(0,i.useQueryClient)(d),_=m.defaultQueryOptions(e),h=m.getQueryCache().get(_.queryHash),f=!1!==e.subscribed;if(_._optimisticResults=c?"isRestoring":f?"optimistic":void 0,_.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=_.staleTime;_.staleTime="function"==typeof t?(...i)=>e(t(...i)):e(t),"number"==typeof _.gcTime&&(_.gcTime=Math.max(_.gcTime,1e3))}l=h?.state.error&&"function"==typeof _.throwOnError?(0,n.shouldThrowError)(_.throwOnError,[h.state.error,h]):_.throwOnError,(_.suspense||l)&&!u.isReset()&&(_.retryOnMount=!1),s.useEffect(()=>{u.clearReset()},[u]);let[p]=s.useState(()=>new t(m,_)),y=p.getOptimisticResult(_),b=!c&&f;if(s.useSyncExternalStore(s.useCallback(e=>{let t=b?p.subscribe(o.notifyManager.batchCalls(e)):n.noop;return p.updateResult(),t},[p,b]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),s.useEffect(()=>{p.setOptions(_)},[_,p]),_?.suspense&&y.isPending)throw p.fetchOptimistic(_).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:i,query:s,suspense:a})=>e.isError&&!t.isReset()&&!e.isFetching&&s&&(a&&void 0===e.data||(0,n.shouldThrowError)(i,[e.error,s])))({result:y,errorResetBoundary:u,throwOnError:_.throwOnError,query:h,suspense:_.suspense}))throw y.error;return _.notifyOnChangeProps?y:p.trackResult(y)}(e,_,t)}],66027)},40160,e=>{"use strict";let t=(0,e.i(75254).default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);e.s(["Download",0,t],40160)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},27612,e=>{"use strict";let t=(0,e.i(75254).default)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);e.s(["Trash2",0,t],27612)},18566,(e,t,i)=>{t.exports=e.r(76562)},33405,54626,1844,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(87338);function a(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let r=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),n=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function o(e){let[t,i,s]=r(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*i+.0722*s}function d(e,t){let[i,s]=[o(e),o(t)].sort((e,t)=>t-e);return(i+.05)/(s+.05)}function l([e,t,i]){let s=Math.max(e/=255,t/=255,i/=255),a=Math.min(e,t,i),r=(s+a)/2;if(s===a)return[0,0,r];let n=s-a;return[(s===e?(t-i)/n+6*(t<i):s===t?(i-e)/n+2:(e-t)/n+4)/6,r>.5?n/(2-s-a):n/(s+a),r]}function c([e,t,i]){if(0===t)return n([255*i,255*i,255*i]);let s=i<.5?i*(1+t):i+t-i*t,a=2*i-s,r=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?a+(s-a)*6*e:e<.5?s:e<2/3?a+(s-a)*(2/3-e)*6:a;return n([255*r(e+1/3),255*r(e),255*r(e-1/3)])}function u(e,t="#ffffff"){var i;let s,m,_=a(e)??"#2638f0",h=.18>o(a(t)??"#ffffff"),f=4.5>d(_,"#ffffff"),[p,y,b]=l(r(_)),v=c([p,y,f?Math.min(1,b+.08):Math.max(0,b-.07)]),g=(i=h?.82:.9,s=r(_),m=r(t),n([0,1,2].map(e=>s[e]*(1-i)+m[e]*i))),w=(e,t,i)=>h?function(e,t,i){let[s,a,n]=l(r(e)),o=e;for(;d(o,t)<i&&n<1;)o=c([s,a,n=Math.min(1,n+.01)]);return o}(e,t,i):function(e,t,i){let[s,a,n]=l(r(e)),o=e;for(;d(o,t)<i&&n>0;)o=c([s,a,n=Math.max(0,n-.01)]);return o}(e,t,i),E=w(_,g,4.5),R=w(_,t,4.5),S=w(_,t,3);return{accent:_,onAccent:f?"#000000":"#ffffff",hover:v,soft:g,ink:E,text:R,line:S,darkText:f,textDeepened:R!==_}}let m=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),_=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,m,"monogram",0,_,"normaliseHex",0,a,"paletteFor",0,u],54626);let h={classic:{id:"classic",name:"Classic",tagline:"Light and clear — white studio, ink type, your colour for actions",surface:"#ffffff",canvas:"#f4f5f8",ink:"#121521",dark:!1,accent:"#2638f0",secondary:"#ffb089",presets:[{name:"Swayvo",accent:"#2638f0",secondary:"#ffb089"},{name:"Eucalyptus",accent:"#0b3b34",secondary:"#c86a4f"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and after-dark — night grounds, wide type, vivid accents",surface:"#141826",canvas:"#0b0d16",ink:"#f3f4f8",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},f=e=>h["urban"===e?"urban":"classic"];function p(e,t,i){let s=f(e);return{theme:s,accent:a(t)??s.accent,secondary:a(i)??s.secondary}}e.s(["THEMES",0,h,"schoolColours",0,p,"themeOf",0,f],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[11px] text-ink-3",e),children:["powered by",(0,t.jsx)(s.SwayvoLogo,{className:"swayvo-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Swayvo"}),(0,t.jsx)(s.SwayvoLogo,{className:"swayvo-on-dark h-[0.95em] translate-y-[0.06em]",tone:"white",title:null})]})},"SchoolHero",0,function({src:e,name:i,children:s}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${i}`,className:"aspect-[16/7] w-full object-cover"}),s&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:s})]}):null},"SchoolMark",0,function({name:e,logo:i,className:s}){return i?(0,t.jsx)("img",{src:i,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",s)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent",s),children:_(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,s=e?.brand_colour??null,a=e?.brand_secondary??null,r=!!e;i.useEffect(()=>{let e=document.documentElement,i=[...Object.keys(m(u(null))),"--color-secondary"];if(!r){i.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let n=p(t,s,a);e.dataset.theme=n.theme.id,Object.entries(m(u(n.accent,n.theme.surface))).forEach(([t,i])=>e.style.setProperty(t,i)),e.style.setProperty("--color-secondary",n.secondary);let o=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});o.setAttribute("content",n.theme.dark?n.theme.canvas:n.theme.surface),o.parentNode||document.head.appendChild(o)},[r,t,s,a])}],33405)},15790,3053,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(54616),a=e.i(12598);let r=(0,e.i(75254).default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);var n=e.i(40160),o=e.i(27612),d=e.i(17658),l=e.i(30224),c=e.i(31502),u=e.i(27389);let m={label:"this browser",maxBytes:0x1400000,async upload(e,{q:t,resourceId:i,studioId:s}){if(e.size>0x1400000)throw Error(`That file is ${_(e.size)}. The demo stores files in the browser, so it caps them at ${_(0x1400000)}.`);let a=new Uint8Array(await e.arrayBuffer()),r=e.type||f(e.name),[n]=await t(`insert into resource_file (studio_id, resource_id, file_name, mime_type, size_bytes, bytes, uploaded_by)
       values ($1, $2, $3, $4, $5, $6, auth.uid())
       on conflict (resource_id) do update
         set file_name = excluded.file_name, mime_type = excluded.mime_type,
             size_bytes = excluded.size_bytes, bytes = excluded.bytes, updated_at = now()
       returning id`,[s,i,e.name,r,e.size,a]);if(!n)throw Error("The database refused the upload.");let o=`local:${n.id}`;return await t("update resource set storage_path = $2, url = null where id = $1",[i,o]),{path:o,size:e.size,mime:r,name:e.name}},async resolve(e,t){let i=e.startsWith("local:")?e.slice(6):null;if(!i)return null;let s=(await (0,l.runAs)(t,e=>e("select bytes, mime_type from resource_file where id = $1 and deleted_at is null",[i])))[0];return s?URL.createObjectURL(new Blob([function(e){if(e instanceof Uint8Array||e instanceof ArrayBuffer)return new Uint8Array(e);if("string"==typeof e){let t=e.startsWith("\\x")?e.slice(2):e,i=new Uint8Array(t.length/2);for(let e=0;e<i.length;e++)i[e]=parseInt(t.substr(2*e,2),16);return i}throw Error("Unrecognised binary value from the database")}(s.bytes)],{type:s.mime_type})):null},release(e){e.startsWith("blob:")&&URL.revokeObjectURL(e)}};function _(e){return e<1024?`${e} B`:e<1048576?`${Math.round(e/1024)} KB`:`${(e/1048576).toFixed(+(e<0xa00000))} MB`}let h={mp4:"video/mp4",mov:"video/quicktime",webm:"video/webm",m4v:"video/x-m4v",mp3:"audio/mpeg",m4a:"audio/mp4",wav:"audio/wav",aac:"audio/aac",pdf:"application/pdf",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"};function f(e){return h[e.split(".").pop()?.toLowerCase()??""]??"application/octet-stream"}function p(e){let t=e.type||f(e.name);return t.startsWith("video/")?"video":t.startsWith("audio/")?"audio":"document"}e.s(["formatBytes",0,_,"kindForFile",0,p,"probeDuration",0,function(e){return new Promise(t=>{let i=p(e);if("document"===i)return t(null);let s=URL.createObjectURL(e),a=document.createElement("video"===i?"video":"audio"),r=e=>{URL.revokeObjectURL(s),t(e)};a.preload="metadata",a.onloadedmetadata=()=>{let e=Number.isFinite(a.duration)?Math.round(a.duration):0;r(e>0?e:null)},a.onerror=()=>r(null),setTimeout(()=>r(null),5e3),a.src=s})},"storage",0,m],3053);var y=e.i(45060);let b={video:"Video",audio:"Track",document:"Document",link:"Link"};e.s(["ResourceRow",0,function({r:e,canManage:h}){let{session:f}=(0,c.useSession)(),p=(0,a.useQueryClient)(),v=(e=>{if(!e)return null;let t=Math.floor(e/60);return t>=60?`${Math.floor(t/60)}h ${t%60}m`:`${t}:${String(e%60).padStart(2,"0")}`})(e.duration_sec),g=!!e.storage_path,[w,E]=i.useState(null),[R,S]=i.useState(!1),[$,T]=i.useState(null);i.useEffect(()=>()=>{w&&m.release(w)},[w]);let j=async()=>{if(e.storage_path&&!w){S(!0),T(null);try{let t=await m.resolve(e.storage_path,f);if(!t)throw Error("That file is no longer available.");E(t)}catch(e){T(e instanceof Error?e.message:"Could not open that file.")}finally{S(!1)}}},k=(0,s.useMutation)({mutationFn:async()=>(0,l.runAs)(f,t=>t(u.DELETE_RESOURCE,[e.id])),onSuccess:()=>p.invalidateQueries({queryKey:["db"]})});return(0,t.jsxs)("li",{className:"px-4 py-3.5",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("p",{className:"font-semibold",children:e.title}),e.description&&(0,t.jsx)("p",{className:"mt-0.5 text-[14px] leading-relaxed text-ink-2",children:e.description}),(0,t.jsxs)("p",{className:"mt-0.5 text-[13px] text-ink-3",children:[(0,t.jsx)("span",{className:(0,y.cn)("font-semibold","video"===e.kind||"audio"===e.kind?"text-ink-2":"text-ink-3"),children:b[e.kind]??e.kind}),[e.category,e.scope_label,v,null!=e.size_bytes?_(e.size_bytes):null,e.added_by?`added by ${e.added_by}`:null].filter(Boolean).map((e,i)=>(0,t.jsxs)("span",{className:"tnum",children:[" · ",e]},i))]})]}),(0,t.jsxs)("div",{className:"flex shrink-0 items-center gap-1",children:[g&&!w&&(0,t.jsx)(d.Button,{size:"sm",onClick:j,loading:R,children:"video"===e.kind||"audio"===e.kind?"Play":"Open"}),!g&&e.url&&(0,t.jsxs)(d.Button,{size:"sm",onClick:()=>window.open(e.url,"_blank","noopener,noreferrer"),children:[(0,t.jsx)(r,{className:"size-3.5","aria-hidden":!0})," Open"]}),h&&(0,t.jsx)(d.Button,{size:"sm",variant:"ghost",className:"size-10 p-0","aria-label":`Remove ${e.title}`,loading:k.isPending,onClick:()=>k.mutate(),children:(0,t.jsx)(o.Trash2,{className:"size-4","aria-hidden":!0})})]})]}),$&&(0,t.jsx)("p",{role:"alert",className:"mt-2 text-[12.5px] text-critical",children:$}),k.isError&&(0,t.jsx)("div",{className:"mt-2",children:(0,t.jsx)(d.ErrorState,{error:k.error})}),w&&(0,t.jsxs)("div",{className:"mt-3",children:["video"===e.kind&&(0,t.jsx)("video",{src:w,controls:!0,playsInline:!0,preload:"metadata",className:"w-full rounded-[var(--radius-md)] bg-ink"}),"audio"===e.kind&&(0,t.jsx)("audio",{src:w,controls:!0,className:"w-full"}),"video"!==e.kind&&"audio"!==e.kind&&(0,t.jsxs)("a",{href:w,download:e.file_name??e.title,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 text-sm font-medium text-accent-ink hover:underline",children:[(0,t.jsx)(n.Download,{className:"size-4","aria-hidden":!0}),e.file_name??"Download"]})]})]})}],15790)},75379,e=>{"use strict";let t="Europe/London",i=e=>e instanceof Date?e:new Date(e),s=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(i(e)),a=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(i(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=i(e),s=new Date,a=s.getFullYear()-t.getFullYear(),r=s.getMonth()-t.getMonth();return(r<0||0===r&&s.getDate()<t.getDate())&&(a-=1),a},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(i(e)),"dateShort",0,a,"dayName",0,s,"dayRange",0,function(e=0){let t=new Date,i=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),s=new Date(i);return s.setDate(s.getDate()+1),[i.toISOString(),s.toISOString()]},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let s=i(e),a=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(s),r=e=>a.find(t=>t.type===e)?.value??"";return`${r("year")}-${r("month")}-${r("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=i(e),r=new Date,n=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(r.getFullYear(),r.getMonth(),r.getDate()))/864e5);return 0===n?"Today":1===n?"Tomorrow":-1===n?"Yesterday":n>1&&n<7?s(t):a(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(i(e)),"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),i=(t.getDay()+6)%7;t.setDate(t.getDate()-i),t.setHours(0,0,0,0);let s=new Date(t);return s.setDate(s.getDate()+7),[t.toISOString(),s.toISOString()]}])},13927,e=>{"use strict";var t=e.i(66027),i=e.i(30224),s=e.i(31502);function a(e,r,n=[],o){let{session:d}=(0,s.useSession)();return(0,t.useQuery)({queryKey:["db",d?.userId??"anon",d?.studio??"",...e],queryFn:()=>(0,i.readAs)(d,r,n),staleTime:15e3,...o})}e.s(["useRow",0,function(e,t,i=[]){let s=a(e,t,i);return{...s,data:s.data?.[0]}},"useRows",0,a])},27389,e=>{"use strict";let t=`
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
 order by r.kind, r.category nulls last, r.title`,i=`
select f.id, f.headline, f.going_well, f.work_on, f.created_at, f.shared_at,
       c.name as class_name, sm.display_name as author,
       s.first_name || ' ' || s.last_name as student_name, s.id as student_id
  from feedback_note f
  join student s on s.id = f.student_id
  left join class c on c.id = f.class_id
  left join staff_member sm on sm.id = f.author_id
 where f.deleted_at is null and f.shared_at is not null
 order by f.shared_at desc`,s=`
select ev.id, ev.kind, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.venue,
       ev.cost_minor, ev.capacity, ev.entries_close_on, ev.requests_open,
       sm.display_name as teacher, ev.student_id,
       (select count(*)::int from event_participant p
         where p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null) as going,
       (select p.status::text from event_participant p
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_status,
       (select s.first_name from event_participant p join student s on s.id = p.student_id
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_student,
       (select p.id from event_participant p where p.event_id = ev.id and p.deleted_at is null
           and p.status = 'invited' limit 1) as my_invite,
       coalesce((select jsonb_agg(jsonb_build_object('title', r.title, 'starts_at', r.starts_at) order by r.starts_at)
                   from studio_event r where r.parent_event_id = ev.id and r.deleted_at is null and r.status = 'published'), '[]') as rehearsals,
       coalesce((select jsonb_agg(jsonb_build_object('title', rt.title, 'costume', rt.costume, 'position', rt.position) order by rt.position)
                   from event_routine rt where rt.event_id = ev.id and rt.deleted_at is null
                    and (exists (select 1 from routine_dancer d where d.routine_id = rt.id)
                         or rt.class_id in (select e.class_id from enrolment e where e.status = 'active' and e.deleted_at is null))), '[]') as routines
  from studio_event ev
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at > now() - interval '1 day' and ev.parent_event_id is null
 order by ev.starts_at`,a=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,r=`
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`,n=`
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
returning id`,l=`
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
 order by (r.kind = 'medical_update') desc, r.created_at`,c=`
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`,u=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,m=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,_=`
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
 where c.id = $1 and c.deleted_at is null`,h=`
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
 order by (a.id is null), r.kind, r.created_at desc`,f=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,p=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,y=`
select app.retire_resource($1) as ok`,b=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,m,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,p,"CLASS_DETAIL",0,_,"CLASS_RESOURCES",0,h,"CREATE_RESOURCE",0,f,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,y,"EVENTS",0,s,"MY_REQUESTS",0,r,"MY_TEACHING_CLASSES",0,b,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,l,"RAISE_REQUEST",0,n,"REQUEST_PLACE",0,a,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,i,"WRITE_FEEDBACK",0,d])},33204,e=>{"use strict";let t=`
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
 limit 1 returning id`,d=`
update communication_template set name = $2, subject = nullif(btrim($3), ''), body = $4, updated_at = now()
 where id = $1 returning id`,l=`
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
select count(*)::int as n from notification where deleted_at is null and read_at is null`,v=`
select r.id, r.event, r.enabled, r.template_id, t.name as template_name,
       (select count(*)::int from automation_run x where x.rule_id = r.id) as sent,
       (select max(ran_at) from automation_run x where x.rule_id = r.id) as last_sent,
       coalesce((select d.due from app.automation_due(r.studio_id) d where d.rule_id = r.id), 0) as due
  from automation_rule r
  left join communication_template t on t.id = r.template_id and t.deleted_at is null
 order by array_position(array['trial_booked','trial_reminder_48h','trial_reminder_same_day',
                               'trial_attended','trial_missed','waitlist_offer'], r.event)`,g=`
select app.run_automations(studio_id) as sent from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`,w=`
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,a,"CLASS_AUDIENCES",0,r,"CONVERSATION",0,i,"CREATE_TEMPLATE",0,o,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,s,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,y,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,w,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,f,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,v,"RUN_AUTOMATIONS",0,g,"SEND_CLASS",0,u,"SEND_CLASS_AT",0,m,"SEND_DIRECT",0,l,"SEND_DIRECT_AT",0,c,"SEND_STUDIO",0,_,"SEND_STUDIO_AT",0,h,"SEND_TO_STUDIO",0,p,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,n,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,b,"UPDATE_TEMPLATE",0,d])}]);