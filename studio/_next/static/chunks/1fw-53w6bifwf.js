(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var s=e.i(12598),a=e.i(71645);let r=a.createContext(!1);r.Provider,e.i(43476);let i=a.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),l=e.i(40143),o=e.i(80166),d=e.i(73911),c=e.i(15823),u=e.i(75555),h=e.i(86491),m=class extends c.Subscribable{#e;#t=void 0;#s=void 0;#a=void 0;#r;#i;#n;#l;#o;#d;#c;#u;#h;#m=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#n=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),_(this.#t,this.options)?this.#_():this.updateResult(),this.#f())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#v(),this.#t.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let a=this.hasListeners();a&&p(this.#t,s,this.options,t)&&this.#_(),this.updateResult(),a&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||(0,n.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,n.resolveStaleTime)(t.staleTime,this.#t))&&this.#g();let r=this.#b();a&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||r!==this.#h)&&this.#x(r)}getOptimisticResult(e){var t,s;let a=this.#e.getQueryCache().build(this.#e,e),r=this.createResult(a,e);return t=this,s=r,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#a=r,this.#i=this.options,this.#r=this.#t.state),r}getCurrentResult(){return this.#a}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#m.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),a=this.#e.getQueryCache().build(this.#e,s),r=()=>{},i=new Promise(e=>{t=e,r=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===a.queryHash&&void 0!==a.state.data&&(r(),e(this.createResult(a,s)))})});return Promise.race([a.fetch().then(()=>{let e=this.createResult(a,s);return t?.(e),e}).finally(()=>{r()}),i])}fetch(e){return this.#_({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#a))}#_(e){this.#v();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#g(){this.#p();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#t);if(d.environmentManager.isServer()||this.#a.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#a.dataUpdatedAt,e)+1;this.#c=o.timeoutManager.setTimeout(()=>{this.#a.isStale||this.updateResult()},t)}#b(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#x(e){this.#y(),this.#h=e,!d.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,n.isValidTimeout)(this.#h)&&0!==this.#h&&(this.#u=o.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#_()},this.#h))}#f(){this.#g(),this.#x(this.#b())}#p(){void 0!==this.#c&&(o.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(o.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let s,a=this.#t,r=this.options,i=this.#a,l=this.#r,o=this.#i,d=e!==a?e.state:this.#s,{state:c}=e,u={...c},m=!1;if(t._optimisticResults){let s=this.hasListeners(),i=!s&&_(e,t),n=s&&p(e,a,t,r);(i||n)&&(u={...u,...(0,h.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:v,status:g}=u;s=u.data;let b=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===g){let e;i?.isPlaceholderData&&t.placeholderData===o?.placeholderData?(e=i.data,b=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#d?.state.data,this.#d):t.placeholderData,void 0!==e&&(g="success",s=(0,n.replaceData)(i?.data,e,t),m=!0)}if(t.select&&void 0!==s&&!b)if(i&&s===l?.data&&t.select===this.#l)s=this.#o;else try{this.#l=t.select,s=t.select(s),s=(0,n.replaceData)(i?.data,s,t),this.#o=s,this.#n=null}catch(e){this.#n=e}else void 0===s&&(this.#n=null);this.#n&&(f=this.#n,s=this.#o,v=Date.now(),g="error",m=!1);let x="fetching"===u.fetchStatus,w="pending"===g,j="error"===g,S=w&&x,E=void 0!==s;return{status:g,fetchStatus:u.fetchStatus,isPending:w,isSuccess:"success"===g,isError:j,isInitialLoading:S,isLoading:S,data:s,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:v,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>d.dataUpdateCount||u.errorUpdateCount>d.errorUpdateCount,isFetching:x,isRefetching:x&&!w,isLoadingError:j&&!E,isPaused:"paused"===u.fetchStatus,isPlaceholderData:m,isRefetchError:j&&E,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#a,t=this.createResult(this.#t,this.options);if(this.#r=this.#t.state,this.#i=this.options,void 0!==this.#r.data&&(this.#d=this.#t),(0,n.shallowEqualObjects)(t,e))return;this.#a=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#m.size)return!0;let a=new Set(s??this.#m);return this.options.throwOnError&&a.add("error"),Object.keys(this.#a).some(t=>this.#a[t]!==e[t]&&a.has(t))};this.#w({listeners:s()})}#v(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#f()}#w(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#a)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function _(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let a="function"==typeof s?s(e):s;return"always"===a||!1!==a&&y(e,t)}return!1}function p(e,t,s,a){return(e!==t||!1===(0,n.resolveQueryBoolean)(a.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,o){let d,c=a.useContext(r),u=a.useContext(i),h=(0,s.useQueryClient)(o),m=h.defaultQueryOptions(e),_=h.getQueryCache().get(m.queryHash),f=!1!==e.subscribed;if(m._optimisticResults=c?"isRestoring":f?"optimistic":void 0,m.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=m.staleTime;m.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof m.gcTime&&(m.gcTime=Math.max(m.gcTime,1e3))}d=_?.state.error&&"function"==typeof m.throwOnError?(0,n.shouldThrowError)(m.throwOnError,[_.state.error,_]):m.throwOnError,(m.suspense||d)&&!u.isReset()&&(m.retryOnMount=!1),a.useEffect(()=>{u.clearReset()},[u]);let[p]=a.useState(()=>new t(h,m)),y=p.getOptimisticResult(m),v=!c&&f;if(a.useSyncExternalStore(a.useCallback(e=>{let t=v?p.subscribe(l.notifyManager.batchCalls(e)):n.noop;return p.updateResult(),t},[p,v]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),a.useEffect(()=>{p.setOptions(m)},[m,p]),m?.suspense&&y.isPending)throw p.fetchOptimistic(m).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:a,suspense:r})=>e.isError&&!t.isReset()&&!e.isFetching&&a&&(r&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,a])))({result:y,errorResetBoundary:u,throwOnError:m.throwOnError,query:_,suspense:m.suspense}))throw y.error;return m.notifyOnChangeProps?y:p.trackResult(y)}(e,m,t)}],66027)},95468,e=>{"use strict";let t=(0,e.i(75254).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,t],95468)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},18566,(e,t,s)=>{t.exports=e.r(76562)},33405,54626,1844,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(45974);function r(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let i=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),n=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function l(e){let[t,s,a]=i(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*s+.0722*a}function o(e,t){let[s,a]=[l(e),l(t)].sort((e,t)=>t-e);return(s+.05)/(a+.05)}function d([e,t,s]){let a=Math.max(e/=255,t/=255,s/=255),r=Math.min(e,t,s),i=(a+r)/2;if(a===r)return[0,0,i];let n=a-r;return[(a===e?(t-s)/n+6*(t<s):a===t?(s-e)/n+2:(e-t)/n+4)/6,i>.5?n/(2-a-r):n/(a+r),i]}function c([e,t,s]){if(0===t)return n([255*s,255*s,255*s]);let a=s<.5?s*(1+t):s+t-s*t,r=2*s-a,i=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?r+(a-r)*6*e:e<.5?a:e<2/3?r+(a-r)*(2/3-e)*6:r;return n([255*i(e+1/3),255*i(e),255*i(e-1/3)])}function u(e,t="#ffffff"){var s;let a,h,m=r(e)??"#5b46d9",_=.18>l(r(t)??"#ffffff"),f=4.5>o(m,"#ffffff"),[p,y,v]=d(i(m)),g=c([p,y,f?Math.min(1,v+.08):Math.max(0,v-.07)]),b=(s=_?.82:.9,a=i(m),h=i(t),n([0,1,2].map(e=>a[e]*(1-s)+h[e]*s))),x=(e,t,s)=>_?function(e,t,s){let[a,r,n]=d(i(e)),l=e;for(;o(l,t)<s&&n<1;)l=c([a,r,n=Math.min(1,n+.01)]);return l}(e,t,s):function(e,t,s){let[a,r,n]=d(i(e)),l=e;for(;o(l,t)<s&&n>0;)l=c([a,r,n=Math.max(0,n-.01)]);return l}(e,t,s),w=x(m,b,4.5),j=x(m,t,4.5),S=x(m,t,3);return{accent:m,onAccent:f?"#000000":"#ffffff",hover:g,soft:b,ink:w,text:j,line:S,darkText:f,textDeepened:j!==m}}let h=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),m=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,h,"monogram",0,m,"normaliseHex",0,r,"paletteFor",0,u],54626);let _={classic:{id:"classic",name:"Classic",tagline:"Elegant and warm — ivory, serif headings, soft edges",surface:"#fffdf9",canvas:"#faf6ee",ink:"#1f1f1f",dark:!1,accent:"#c2563c",secondary:"#ff7a5c",presets:[{name:"Terracotta",accent:"#c2563c",secondary:"#ff7a5c"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Sage",accent:"#4d6b4a",secondary:"#c8a97e"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and electric — dark mode, wide type, neon accents",surface:"#18122f",canvas:"#0d0a1c",ink:"#f6f4ff",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},f=e=>_["urban"===e?"urban":"classic"];function p(e,t,s){let a=f(e);return{theme:a,accent:r(t)??a.accent,secondary:r(s)??a.secondary}}e.s(["THEMES",0,_,"schoolColours",0,p,"themeOf",0,f],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[11px] text-ink-3",e),children:["powered by ",(0,t.jsx)(a.BarreMark,{className:"size-3","aria-hidden":!0})," ",(0,t.jsx)("span",{className:"font-medium",children:"Barre"})]})},"SchoolMark",0,function({name:e,logo:s,className:a}){return s?(0,t.jsx)("img",{src:s,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",a)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent",a),children:m(e)})},"useSchoolTheme",0,function(e){let t=e?.theme??null,a=e?.brand_colour??null,r=e?.brand_secondary??null,i=!!e;s.useEffect(()=>{let e=document.documentElement,s=[...Object.keys(h(u(null))),"--color-secondary"];if(!i){s.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let n=p(t,a,r);e.dataset.theme=n.theme.id,Object.entries(h(u(n.accent,n.theme.surface))).forEach(([t,s])=>e.style.setProperty(t,s)),e.style.setProperty("--color-secondary",n.secondary);let l=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});l.setAttribute("content",n.theme.dark?n.theme.canvas:n.theme.surface),l.parentNode||document.head.appendChild(l)},[i,t,a,r])}],33405)},84524,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(54616),r=e.i(12598),i=e.i(42009),n=e.i(95468),l=e.i(78583),o=e.i(75254);let d=(0,o.default)("flag",[["path",{d:"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528",key:"1jaruq"}]]);var c=e.i(15030),u=e.i(83086);let h=(0,o.default)("trending-up",[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]]);var m=e.i(17658),_=e.i(13927),f=e.i(30224),p=e.i(31502),y=e.i(36261),v=e.i(75379),g=e.i(45060);let b={not_started:"neutral",developing:"caution",secure:"info",mastered:"positive"},x=e=>y.LEVELS.find(t=>t.key===e)?.label??"Not yet assessed";function w(){let{session:e}=(0,p.useSession)(),t=(0,r.useQueryClient)();return(0,a.useMutation)({mutationFn:t=>(0,f.runAs)(e,e=>e(t.sql,t.params)),onSuccess:()=>t.invalidateQueries({queryKey:["db"]})})}let j={skill:h,feedback:c.MessageSquareHeart,milestone:i.Award,goal:d,report:l.FileText};e.s(["Goals",0,function({studentId:e,mode:a}){let r=(0,_.useRows)(["goals",e],y.GOALS,[e]),i=w(),[l,o]=s.useState(""),c=(r.data??[]).filter(e=>"proposed"===e.status||"agreed"===e.status),u=(r.data??[]).filter(e=>"achieved"===e.status);return(0,t.jsxs)("div",{className:"space-y-2",children:[null!=i.error&&(0,t.jsx)(m.ErrorState,{error:i.error}),0===c.length&&0===u.length&&(0,t.jsx)("p",{className:"text-[13px] text-ink-3",children:"No goals this term."}),(0,t.jsxs)("ul",{className:"space-y-1.5",children:[c.map(e=>(0,t.jsxs)("li",{className:"flex flex-wrap items-center gap-2 text-sm",children:[(0,t.jsx)(d,{className:"size-3.5 text-accent-text","aria-hidden":!0}),(0,t.jsx)("span",{className:"min-w-0 flex-1",children:e.text}),"proposed"===e.status&&(0,t.jsx)(m.Badge,{tone:"caution",children:"Waiting for your teacher"}),"teacher"===a&&"proposed"===e.status&&(0,t.jsx)(m.Button,{size:"sm",onClick:()=>i.mutate({sql:y.SET_GOAL,params:[e.id,"agreed",null]}),children:"Agree"}),"teacher"===a&&"agreed"===e.status&&(0,t.jsxs)(m.Button,{size:"sm",variant:"primary",onClick:()=>i.mutate({sql:y.SET_GOAL,params:[e.id,"achieved",null]}),children:[(0,t.jsx)(n.CheckCircle2,{className:"size-4","aria-hidden":!0})," Achieved"]}),"teacher"===a&&(0,t.jsx)(m.Button,{size:"sm",variant:"ghost",onClick:()=>i.mutate({sql:y.SET_GOAL,params:[e.id,"dropped",null]}),children:"Drop"})]},e.id)),u.slice(0,3).map(e=>(0,t.jsxs)("li",{className:"flex items-center gap-2 text-sm text-ink-2",children:[(0,t.jsx)(n.CheckCircle2,{className:"size-3.5 text-positive","aria-hidden":!0})," ",e.text]},e.id))]}),"family"!==a&&c.length<2&&(0,t.jsxs)("form",{className:"flex gap-2",onSubmit:t=>{t.preventDefault(),l.trim().length>=3&&(i.mutate({sql:y.PROPOSE_GOAL,params:[e,l,"teacher"===a?"agreed":"proposed"]}),o(""))},children:[(0,t.jsx)(m.Input,{"aria-label":"A goal for this term",value:l,onChange:e=>o(e.target.value),maxLength:200,placeholder:"student"===a?"Something you want to get better at":"A goal for this term"}),(0,t.jsx)(m.Button,{type:"submit",disabled:l.trim().length<3,children:"Add"})]})]})},"Milestones",0,function({studentId:e}){let s=(0,_.useRows)(["milestones",e],y.MILESTONES,[e]);return s.data?.length?(0,t.jsx)("ul",{className:"flex flex-wrap gap-2","aria-label":"Milestones",children:s.data.map(e=>(0,t.jsxs)("li",{className:"inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[13px] text-accent-ink",children:[(0,t.jsx)(i.Award,{className:"size-3.5","aria-hidden":!0})," ",e.title," ",(0,t.jsx)("span",{className:"text-[11.5px] opacity-70",children:(0,v.dateShort)(e.reached_on)})]},e.id))}):null},"Reflections",0,function({studentId:e}){let s=(0,_.useRows)(["reflections",e],y.REFLECTIONS,[e]);return s.data?.length?(0,t.jsx)("ul",{className:"space-y-1.5",children:s.data.map(e=>(0,t.jsxs)("li",{className:"flex gap-2 text-sm",children:[(0,t.jsx)("span",{"aria-label":`Mood ${e.mood} of 5`,className:"text-base leading-5",children:y.MOODS[e.mood-1]}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[e.text??(0,t.jsx)("span",{className:"text-ink-3",children:"No words"}),(0,t.jsxs)("span",{className:"block text-[12px] text-ink-3",children:[e.class_name??""," · ",(0,v.relativeDay)(e.created_at)]})]})]},e.id))}):(0,t.jsx)("p",{className:"text-[13px] text-ink-3",children:"No reflections."})},"ReportCard",0,function({r:e}){let s=e.summary;return(0,t.jsxs)("article",{className:"space-y-2 text-sm print:break-inside-avoid",children:[(0,t.jsxs)("header",{children:[(0,t.jsxs)("h3",{className:"font-semibold",children:[e.student_name," — ",e.class_name]}),(0,t.jsxs)("p",{className:"text-[12.5px] text-ink-3",children:[e.term_name,e.shared_at?` \xb7 shared ${(0,v.dateShort)(e.shared_at)}`:""]})]}),s.attendance&&s.attendance.of>0&&(0,t.jsxs)("p",{children:["Came to ",s.attendance.present," of ",s.attendance.of," classes."]}),!!s.skills?.length&&(0,t.jsx)("ul",{className:"grid gap-1 sm:grid-cols-2",children:s.skills.map(e=>(0,t.jsxs)("li",{className:"flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-surface-2 px-2 py-1",children:[(0,t.jsx)("span",{children:e.skill}),(0,t.jsxs)("span",{className:"text-[12.5px]",children:[e.from&&e.from!==e.level?`${x(e.from)} → `:"",(0,t.jsx)("b",{children:x(e.level)})]})]},e.skill))}),!!s.going_well?.length&&(0,t.jsxs)("p",{children:[(0,t.jsx)("b",{children:"Going well:"})," ",s.going_well.join(", "),"."]}),!!s.work_on?.length&&(0,t.jsxs)("p",{children:[(0,t.jsx)("b",{children:"To work on:"})," ",s.work_on.join(", "),"."]}),e.comment&&(0,t.jsx)("p",{className:"whitespace-pre-wrap rounded-[var(--radius-md)] border border-line p-2.5 italic",children:e.comment})]})},"SkillsPanel",0,function({studentId:e,editable:a}){let r=(0,_.useRows)(["skills",e],y.STUDENT_SKILLS,[e]),i=w(),n=s.useMemo(()=>{let e=new Map;return(r.data??[]).forEach(t=>e.set(t.framework,[...e.get(t.framework)??[],t])),[...e.entries()]},[r.data]);return r.isLoading?(0,t.jsx)(m.Skeleton,{className:"h-24"}):n.length?(0,t.jsxs)("div",{className:"space-y-3",children:[null!=i.error&&(0,t.jsx)(m.ErrorState,{error:i.error}),n.map(([s,r])=>(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3",children:s}),(0,t.jsx)("ul",{className:"space-y-1.5",children:r.map(s=>(0,t.jsxs)("li",{className:"flex flex-wrap items-center gap-2 text-sm",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[s.skill,s.previous&&s.level&&s.previous!==s.level&&(0,t.jsx)(h,{className:"ml-1 inline size-3.5 text-positive","aria-label":"Improved"})]}),a?(0,t.jsx)("span",{role:"radiogroup","aria-label":`${s.skill} level`,className:"inline-flex rounded-[var(--radius-md)] border border-line p-0.5",children:y.LEVELS.slice(1).map(a=>(0,t.jsx)("button",{role:"radio","aria-checked":s.level===a.key,title:a.label,onClick:()=>i.mutate({sql:y.RECORD_SKILL,params:[e,s.skill_id,a.key,null]}),className:(0,g.cn)("h-7 min-w-[2rem] rounded-[calc(var(--radius-md)-2px)] px-1.5 text-[12px]",s.level===a.key?"bg-accent font-semibold text-on-accent":"text-ink-2 hover:bg-surface-2"),children:a.short},a.key))}):(0,t.jsx)(m.Badge,{tone:s.level?b[s.level]:"neutral",children:x(s.level)})]},s.skill_id))})]},s)),a&&(0,t.jsx)("p",{className:"text-[12px] text-ink-3",children:"D developing · S secure · M mastered. Families see levels straight away."})]}):(0,t.jsx)("p",{className:"text-[13px] text-ink-3",children:"No skills yet — they appear once the child is in a class."})},"Timeline",0,function({studentId:e,limit:a=30}){let r=(0,_.useRows)(["timeline",e],y.TIMELINE,[e]),[i,n]=s.useState(!1),l=s.useMemo(()=>{let e=Date.now()-7776e6;return(r.data??[]).filter(t=>"skill"===t.kind&&new Date(t.at).getTime()>e&&t.previous&&t.level!==t.previous).length},[r.data]);if(r.isLoading)return(0,t.jsx)(m.Skeleton,{className:"h-24"});if(!r.data?.length)return(0,t.jsx)(m.EmptyState,{title:"Nothing yet",body:"Skills, feedback and milestones appear here as they happen."});let o=i?r.data:r.data.slice(0,a);return(0,t.jsxs)("div",{children:[l>0&&(0,t.jsxs)("p",{className:"mb-2 flex items-center gap-1.5 rounded-[var(--radius-md)] bg-positive-soft px-3 py-2 text-[13px]",children:[(0,t.jsx)(h,{className:"size-4 text-positive","aria-hidden":!0})," ",l," skill",1===l?"":"s"," moved up in the last three months."]}),(0,t.jsx)("ol",{className:"relative space-y-3 border-l border-line pl-4",children:o.map((e,s)=>{let a=j[e.kind]??u.Sparkles;return(0,t.jsxs)("li",{className:"relative",children:[(0,t.jsx)("span",{className:"absolute -left-[25px] top-0.5 grid size-[18px] place-items-center rounded-full bg-surface ring-1 ring-line",children:(0,t.jsx)(a,{className:"size-3 text-accent-text","aria-hidden":!0})}),(0,t.jsx)("p",{className:"text-[12px] text-ink-3",children:(0,v.relativeDay)(e.at)}),(0,t.jsxs)("p",{className:"text-sm font-medium",children:[e.title,"skill"===e.kind&&(0,t.jsxs)(t.Fragment,{children:[" — ",e.previous?`${x(e.previous)} → `:"",x(e.level)]}),"goal"===e.kind&&e.detail&&(0,t.jsx)(m.Badge,{tone:"achieved"===e.detail?"positive":"neutral",className:"ml-2",children:e.detail})]}),"goal"!==e.kind&&e.detail&&(0,t.jsx)("p",{className:"text-[13px] text-ink-2",children:e.detail})]},s)})}),!i&&r.data.length>a&&(0,t.jsx)(m.Button,{size:"sm",variant:"ghost",className:"mt-2",onClick:()=>n(!0),children:"Show everything"})]})}],84524)},75379,e=>{"use strict";let t="Europe/London",s=e=>e instanceof Date?e:new Date(e),a=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(s(e)),r=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(s(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=s(e),a=new Date,r=a.getFullYear()-t.getFullYear(),i=a.getMonth()-t.getMonth();return(i<0||0===i&&a.getDate()<t.getDate())&&(r-=1),r},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(s(e)),"dateShort",0,r,"dayName",0,a,"dayRange",0,function(e=0){let t=new Date,s=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),a=new Date(s);return a.setDate(a.getDate()+1),[s.toISOString(),a.toISOString()]},"greeting",0,()=>{let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let a=s(e),r=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(a),i=e=>r.find(t=>t.type===e)?.value??"";return`${i("year")}-${i("month")}-${i("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=s(e),i=new Date,n=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(i.getFullYear(),i.getMonth(),i.getDate()))/864e5);return 0===n?"Today":1===n?"Tomorrow":-1===n?"Yesterday":n>1&&n<7?a(t):r(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(s(e)),"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),s=(t.getDay()+6)%7;t.setDate(t.getDate()-s),t.setHours(0,0,0,0);let a=new Date(t);return a.setDate(a.getDate()+7),[t.toISOString(),a.toISOString()]}])},27389,e=>{"use strict";let t=`
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
 order by f.shared_at desc`,a=`
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
 order by ev.starts_at`,r=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,i=`
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
 order by starts_at`,o=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`,d=`
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
returning id, status`,h=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,m=`
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
 where c.id = $1 and c.deleted_at is null`,_=`
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
select app.retire_resource($1) as ok`,v=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,h,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,p,"CLASS_DETAIL",0,m,"CLASS_RESOURCES",0,_,"CREATE_RESOURCE",0,f,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,y,"EVENTS",0,a,"MY_REQUESTS",0,i,"MY_TEACHING_CLASSES",0,v,"MY_TIMETABLE",0,l,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,d,"RAISE_REQUEST",0,n,"REQUEST_PLACE",0,r,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,o])},36261,e=>{"use strict";let t=`
insert into feedback_chip (studio_id, kind, label, position)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1), 1)
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,s=`
select f.id, f.name, ds.name as style,
       coalesce((select jsonb_agg(jsonb_build_object('id', fs.id, 'name', fs.name, 'position', fs.position) order by fs.position)
                   from framework_skill fs where fs.framework_id = f.id and fs.deleted_at is null), '[]') as skills
  from skill_framework f left join dance_style ds on ds.id = f.dance_style_id
 where f.deleted_at is null order by ds.name`,a=`
insert into framework_skill (studio_id, framework_id, name, position)
select f.studio_id, f.id, btrim($2), coalesce((select max(position) + 1 from framework_skill where framework_id = f.id), 1)
  from skill_framework f where f.id = $1 returning id`,r=`
select s.id as student_id, s.first_name, s.last_name, a.status::text as status,
       f.going_well, f.work_on, f.shared_at is not null as shared
  from class_session cs
  join enrolment e on e.class_id = cs.class_id and e.deleted_at is null
       and (e.status = 'active' or e.ended_on >= cs.starts_at::date)
  join student s on s.id = e.student_id and s.deleted_at is null
  left join attendance_record a on a.session_id = cs.id and a.student_id = s.id and a.deleted_at is null
  left join feedback_note f on f.session_id = cs.id and f.student_id = s.id and f.deleted_at is null
 where cs.id = $1
 order by (a.status in ('present', 'late')) desc nulls last, s.first_name`,i=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.class_id = $1 and r.deleted_at is null order by s.first_name`,n=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.deleted_at is null and r.status = 'shared' order by r.shared_at desc`,l=`select id, student_id, text, status, review_note, created_at from student_goal
                       where student_id = $1 and deleted_at is null order by created_at desc`,o=`
select r.id, r.mood, r.text, r.created_at, c.name as class_name from student_reflection r
  left join class_session cs on cs.id = r.session_id left join class c on c.id = cs.class_id
 where r.student_id = $1 and r.deleted_at is null order by r.created_at desc limit 20`,d=`
select cs.id, c.name, cs.starts_at from attendance_record a join class_session cs on cs.id = a.session_id
  join class c on c.id = cs.class_id
 where a.student_id = app.student_self_id() and a.status in ('present', 'late') and a.deleted_at is null
   and cs.starts_at > now() - interval '14 days'
   and not exists (select 1 from student_reflection r where r.session_id = cs.id and r.deleted_at is null)
 order by cs.starts_at desc limit 5`;e.s(["ADD_CHIP",0,t,"ADD_REFLECTION",0,"select app.add_reflection($1, $2, $3) as id","ADD_SKILL",0,a,"CHIPS",0,"select id, kind, label, position from feedback_chip order by kind, position, label","CLASS_REPORTS",0,i,"DRAFT_REPORTS",0,"select app.draft_class_reports($1) as n","FRAMEWORKS",0,s,"GOALS",0,l,"LEVELS",0,[{key:"not_started",label:"Not started",short:"–"},{key:"developing",label:"Developing",short:"D"},{key:"secure",label:"Secure",short:"S"},{key:"mastered",label:"Mastered",short:"M"}],"MILESTONES",0,"select id, kind, title, reached_on from milestone where student_id = $1 order by reached_on desc","MOODS",0,["😣","😕","😐","🙂","🤩"],"MY_RECENT_CLASSES",0,d,"MY_REPORTS",0,n,"PROPOSE_GOAL",0,"insert into student_goal (student_id, text, status, proposed_by) values ($1, btrim($2), $3, auth.uid()) returning id","RECORD_SKILL",0,"select app.record_skill($1, $2, $3::assessment_level, $4) as id","REFLECTIONS",0,o,"REMOVE_CHIP",0,"select app.soft_delete('feedback_chip', $1)","REMOVE_SKILL",0,"select app.soft_delete('framework_skill', $1)","RENAME_SKILL",0,"update framework_skill set name = btrim($2), updated_at = now() where id = $1 returning id","SAVE_CLASS_FEEDBACK",0,"select app.save_class_feedback($1, $2::jsonb, $3) as n","SESSION_FEEDBACK",0,r,"SET_GOAL",0,"update student_goal set status = $2, review_note = coalesce(nullif(btrim($3), ''), review_note), updated_at = now() where id = $1 returning id","SET_REPORT_COMMENT",0,"update progress_report set comment = nullif(btrim($2), ''), updated_at = now() where id = $1 returning id","SHARE_REPORTS",0,"select app.share_reports($1::uuid[]) as n","SHARE_SESSION_FEEDBACK",0,"select app.share_session_feedback($1) as n","STUDENT_SKILLS",0,"select * from app.student_skills($1)","TIMELINE",0,"select * from app.student_timeline($1) limit 200"])}]);