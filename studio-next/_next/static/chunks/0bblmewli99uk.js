(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,48241,e=>{"use strict";let t=(0,e.i(75254).default)("calendar-off",[["path",{d:"M4.2 4.2A2 2 0 0 0 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.82-1.18",key:"16swn3"}],["path",{d:"M21 15.5V6a2 2 0 0 0-2-2H9.5",key:"yhw86o"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M3 10h7",key:"1wap6i"}],["path",{d:"M21 10h-5.5",key:"quycpq"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);e.s(["CalendarOff",0,t],48241)},74886,e=>{"use strict";let t=(0,e.i(75254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",0,t],74886)},7233,e=>{"use strict";let t=(0,e.i(75254).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,t],7233)},10033,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(22016),n=e.i(54616),a=e.i(12598),r=e.i(7233),l=e.i(27612),d=e.i(65712),o=e.i(399),c=e.i(17658),_=e.i(13927),u=e.i(30224),m=e.i(31502),p=e.i(27830),f=e.i(8199);function h(e,t){let{session:s}=(0,m.useSession)(),i=(0,a.useQueryClient)();return(0,n.useMutation)({mutationFn:async t=>{let i=e(t);return(await (0,u.runAs)(s,e=>e(i.sql,i.params)))[0]},onSuccess:e=>{i.invalidateQueries({queryKey:["db"]}),t?.(e)}})}function v({studentId:e,name:i,onClose:n}){let[a,r]=s.useState(""),[l,_]=s.useState(null),u=h(t=>({sql:f.INVITE_STUDENT,params:[e,t]}),e=>_((0,p.inviteLink)(e.token)));return l?(0,t.jsxs)(d.RecordSheet,{title:`Invitation for ${i}`,onClose:n,onSave:n,saveLabel:"Done",children:[(0,t.jsxs)("p",{className:"text-[0.9062rem] text-ink-2",children:["Because you sent it, ",i,"’s login works as soon as they accept."]}),(0,t.jsx)(o.InviteLink,{link:l})]}):(0,t.jsx)(d.RecordSheet,{title:`Invite ${i}`,subtitle:"Their own login",onClose:n,saving:u.isPending,error:u.error,saveLabel:"Make the invitation",canSave:/@.+\./.test(a),onSave:()=>u.mutate(a.trim()),children:(0,t.jsx)(c.Field,{label:`${i}’s email`,htmlFor:"ci-e",required:!0,hint:"They accept the invitation to make their login.",children:(0,t.jsx)(c.Input,{id:"ci-e",type:"email",value:a,onChange:e=>r(e.target.value)})})})}function y({studentId:e,name:i,onClose:n,office:a}){let[r,l]=s.useState(""),[o,_]=s.useState(""),[u,m]=s.useState(""),[p,v]=s.useState("yes"),g=h(()=>a?{sql:x,params:[e,r,o,u,"yes"===p]}:{sql:f.ADD_COLLECTOR,params:[e,r,o,u]},n);return(0,t.jsxs)(d.RecordSheet,{title:a?"Add to the collection list":"Someone who may collect",subtitle:`For ${i}`,onClose:n,saving:g.isPending,error:g.error,canSave:r.trim().length>1,onSave:()=>g.mutate(void 0),children:[(0,t.jsx)(c.Field,{label:"Name",htmlFor:"col-n",required:!0,children:(0,t.jsx)(c.Input,{id:"col-n",value:r,onChange:e=>l(e.target.value)})}),(0,t.jsx)(c.Field,{label:"Relationship",htmlFor:"col-r",children:(0,t.jsx)(c.Input,{id:"col-r",value:o,onChange:e=>_(e.target.value),placeholder:"Grandmother, childminder…"})}),(0,t.jsx)(c.Field,{label:"Phone",htmlFor:"col-p",children:(0,t.jsx)(c.Input,{id:"col-p",type:"tel",value:u,onChange:e=>m(e.target.value)})}),a&&(0,t.jsx)(c.Field,{label:"May they collect?",htmlFor:"col-a",hint:"“May not collect” is shown to the teacher. Families do not see it.",children:(0,t.jsxs)(c.Select,{id:"col-a",value:p,onChange:e=>v(e.target.value),children:[(0,t.jsx)("option",{value:"yes",children:"May collect"}),(0,t.jsx)("option",{value:"no",children:"May not collect"})]})})]})}let g=`
select id, full_name, relationship, phone, allowed from collection_permission
 where student_id = $1 and deleted_at is null order by allowed desc, full_name`,x=`
insert into collection_permission (student_id, full_name, relationship, phone, allowed)
values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), $5) returning id`,$=[["see_schedule","Sees the schedule"],["see_payments","Sees invoices and payments"],["see_feedback","Sees teacher feedback"],["see_medical","Sees medical details"],["may_contact","May be contacted by the studio"],["may_collect","May collect the children"]];e.s(["ChildLogin",0,function({studentId:e,name:i}){let n=(0,_.useRows)(["my-children-logins"],f.MY_CHILDREN_LOGINS),a=n.data?.find(t=>t.student_id===e),[r,l]=s.useState(!1),d=h(t=>({sql:f.SET_STUDENT_LOGIN,params:[e,t]}));if(!a||"too_young"===a.state)return null;let o={too_young:null,none:(0,t.jsxs)("span",{className:"text-ink-3",children:["No login. ",i," uses the app through you."]}),invited:(0,t.jsxs)("span",{className:"[overflow-wrap:anywhere]",children:["Invited",a.email?` at ${a.email}`:"",". Once ",i," accepts, you approve it here."]}),pending:(0,t.jsxs)("span",{children:[(0,t.jsx)(c.Word,{tone:"caution",children:"Waiting for you"})," ",(0,t.jsxs)("span",{className:"ml-1",children:[i," has accepted the school’s invitation. The login stays off until a parent or carer approves it."]})]}),on:(0,t.jsxs)("span",{children:[(0,t.jsx)(c.Word,{tone:"positive",children:"On"})," ",(0,t.jsxs)("span",{className:"ml-1 [overflow-wrap:anywhere]",children:[i," signs in",a.email?` as ${a.email}`:"",". Either parent can switch it off at any time."]})]}),off:(0,t.jsxs)("span",{children:[(0,t.jsx)(c.Word,{tone:"muted",children:"Off"})," ",(0,t.jsxs)("span",{className:"ml-1",children:["A parent or carer switched it off. ",i," cannot sign in."]})]})};return(0,t.jsxs)("div",{className:"grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3",children:[(0,t.jsx)("dt",{className:"text-ink-3",children:"Own login"}),(0,t.jsxs)("dd",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[0.9062rem]",children:o[a.state]}),null!=d.error&&(0,t.jsx)("div",{className:"mt-2",children:(0,t.jsx)(c.ErrorState,{error:d.error})}),(0,t.jsxs)("div",{className:"mt-2 flex flex-wrap gap-2",children:[("pending"===a.state||"off"===a.state)&&(0,t.jsx)(c.Button,{size:"sm",variant:"primary",loading:d.isPending&&!0===d.variables,onClick:()=>d.mutate(!0),children:"pending"===a.state?"Approve":"Switch back on"}),("on"===a.state||"pending"===a.state||"invited"===a.state)&&(0,t.jsx)(c.Button,{size:"sm",loading:d.isPending&&!1===d.variables,onClick:()=>d.mutate(!1),children:"on"===a.state?"Switch off":"pending"===a.state?"Not now":"Withdraw the invitation"}),"none"===a.state&&(0,t.jsxs)(c.Button,{size:"sm",onClick:()=>l(!0),children:["Invite ",i]})]}),(0,t.jsxs)("p",{className:"mt-1.5 text-[0.7812rem] text-ink-3",children:["The school gives students their own login from age ",a.min_age,". They see their classes, feedback and practice, never payments."]})]}),r&&(0,t.jsx)(v,{studentId:e,name:i,onClose:()=>l(!1)})]})},"CollectionList",0,function({studentId:e,name:n}){let a=((0,_.useRows)(["my-collectors"],f.MY_COLLECTORS).data??[]).filter(t=>t.student_id===e),[d,o]=s.useState(!1),u=h(e=>({sql:f.REMOVE_COLLECTOR,params:[e]}));return(0,t.jsxs)("div",{className:"grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3",children:[(0,t.jsx)("dt",{className:"text-ink-3",children:"Who may collect"}),(0,t.jsxs)("dd",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"You, and anyone listed here. The teacher sees this list at the register."}),(0,t.jsx)("ul",{className:"mt-1 space-y-0.5",children:a.map(e=>(0,t.jsxs)("li",{className:"flex items-center gap-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"font-medium",children:e.full_name}),e.relationship?(0,t.jsxs)("span",{className:"text-ink-3",children:[" (",e.relationship,")"]}):null,e.phone?(0,t.jsx)("span",{className:"block tnum text-[0.8438rem] text-ink-2",children:e.phone}):null]}),(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",loading:u.isPending&&u.variables===e.id,onClick:()=>u.mutate(e.id),"aria-label":`Remove ${e.full_name}`,children:(0,t.jsx)(l.Trash2,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),(0,t.jsxs)(c.Button,{size:"sm",variant:"ghost",className:"-ml-3 mt-1",onClick:()=>o(!0),children:[(0,t.jsx)(r.Plus,{className:"size-4","aria-hidden":!0})," Add someone"]}),(0,t.jsxs)("p",{className:"mt-1 text-[0.7812rem] text-ink-3",children:["If someone must not collect ",n,", ",(0,t.jsx)(i.default,{href:"/family/enquiries",className:"font-semibold text-accent-text underline",children:"tell the office"}),"."]})]}),d&&(0,t.jsx)(y,{studentId:e,name:n,onClose:()=>o(!1)})]})},"GuardianAccessFields",0,function({guardianId:e}){let i=(0,_.useRows)(["guardian-access",e],"select * from app.guardian_access_for($1)",[e]),n=i.data?.[0],[a,r]=s.useState(null),l=h(t=>({sql:"select app.set_guardian_access($1, $2::jsonb, $3)",params:[e,JSON.stringify(t.flags),t.note??null]}));return n?(0,t.jsxs)("fieldset",{children:[(0,t.jsx)("legend",{className:"mb-1 text-[0.8125rem] font-medium text-ink-2",children:"Shared care"}),(0,t.jsx)("p",{className:"mb-1 text-[0.7812rem] text-ink-3",children:"Everything is on unless the office restricts it, for example under a court order. Changes apply at once."}),$.map(([e,s])=>(0,t.jsxs)("label",{className:"flex min-h-[44px] items-center gap-3 text-[0.875rem]",children:[(0,t.jsx)("input",{type:"checkbox",checked:!!n[e],className:"size-[18px] accent-[var(--color-accent)]",onChange:t=>l.mutate({flags:{[e]:t.target.checked}})}),s]},e)),n.can_note?(0,t.jsx)(c.Field,{label:"Safeguarding note",htmlFor:"ga-note",hint:"Only the safeguarding lead sees this.",children:(0,t.jsxs)("div",{className:"flex gap-2",children:[(0,t.jsx)(c.Input,{id:"ga-note",value:a??n.dsl_note??"",onChange:e=>r(e.target.value)}),(0,t.jsx)(c.Button,{size:"sm",disabled:null===a,loading:l.isPending,onClick:()=>{l.mutate({flags:{},note:a??""}),r(null)},children:"Save note"})]})}):n.has_note?(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"The safeguarding lead holds a note about this."}):null,null!=l.error&&(0,t.jsx)(c.ErrorState,{error:l.error})]}):i.isLoading?(0,t.jsx)(c.Skeleton,{className:"h-24"}):null},"OfficeCollection",0,function({studentId:e,name:i}){let n=(0,_.useRows)(["office-collection",e],g,[e]),[a,d]=s.useState(!1),o=h(e=>({sql:f.REMOVE_COLLECTOR,params:[e]}));return(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 border-b border-ink pb-1",children:[(0,t.jsx)("h3",{className:"min-w-0 flex-1 text-[0.875rem] font-semibold",children:"Who may collect"}),(0,t.jsxs)(c.Button,{size:"sm",variant:"ghost",onClick:()=>d(!0),children:[(0,t.jsx)(r.Plus,{className:"size-4","aria-hidden":!0})," Add"]})]}),n.isLoading&&(0,t.jsx)(c.Skeleton,{className:"mt-2 h-8"}),n.data?.length===0&&(0,t.jsx)("p",{className:"mt-1 text-[0.8438rem] text-ink-3",children:"Only the family’s guardians."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:n.data?.map(e=>(0,t.jsxs)("li",{className:"flex min-h-[44px] items-center gap-2 text-[0.875rem]",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[!e.allowed&&(0,t.jsx)(c.Word,{tone:"critical",className:"mr-1.5",children:"May not collect"}),(0,t.jsx)("span",{className:"font-medium",children:e.full_name}),e.relationship?(0,t.jsxs)("span",{className:"text-ink-3",children:[" (",e.relationship,")"]}):null]}),(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",onClick:()=>o.mutate(e.id),"aria-label":`Remove ${e.full_name}`,children:(0,t.jsx)(l.Trash2,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),a&&(0,t.jsx)(y,{office:!0,studentId:e,name:i,onClose:()=>d(!1)})]})},"PendingLogins",0,function(){let e=((0,_.useRows)(["my-children-logins"],f.MY_CHILDREN_LOGINS).data??[]).filter(e=>"pending"===e.state);return e.length?(0,t.jsx)(t.Fragment,{children:e.map(e=>(0,t.jsx)("li",{className:"py-3.5",children:(0,t.jsx)(i.default,{href:"/family/children",className:"block rounded-[var(--radius-sm)] hover:bg-surface-2/60",children:(0,t.jsx)(c.Notice,{tone:"accent",word:"New",title:`${e.first_name} has been invited to their own login`,detail:"It stays off until a parent or carer approves it. Open Your family to approve or say not now."})})},e.student_id))}):null},"StudentLoginAge",0,function(){let{session:e}=(0,m.useSession)(),s=(0,_.useRows)(["student-login-age"],"select id, student_login_min_age from studio where id in (select app.studio_ids()) limit 1"),i=s.data?.[0],n=h(e=>({sql:"select app.set_student_login_min_age($1, $2)",params:[i.id,e]}));if(!i)return null;let a=e?.role==="owner";return(0,t.jsxs)(c.Card,{children:[(0,t.jsx)(c.CardHeader,{title:"Students’ own logins",subtitle:`From age ${i.student_login_min_age}`}),(0,t.jsxs)("div",{className:"pt-3",children:[a?(0,t.jsx)(c.Field,{label:"Students may have their own login from age",htmlFor:"sl-age",hint:"A student’s login works only once a parent or carer approves it, and either parent can switch it off. Many schools choose 13; choose higher if your safeguarding policy asks for it.",children:(0,t.jsx)(c.Select,{id:"sl-age",value:String(i.student_login_min_age),onChange:e=>n.mutate(Number(e.target.value)),className:"max-w-[8rem]",children:Array.from({length:6},(e,t)=>13+t).map(e=>(0,t.jsx)("option",{value:e,children:e},e))})}):(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Only the studio owner can change this."}),null!=n.error&&(0,t.jsx)(c.ErrorState,{error:n.error})]})]})}])},399,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(74886),n=e.i(43531),a=e.i(17658);e.s(["InviteLink",0,function({link:e}){let[r,l]=s.useState(!1);return(0,t.jsxs)("div",{className:"mt-3 border-l-2 border-ink pl-3",children:[(0,t.jsxs)("p",{className:"text-[0.875rem] font-semibold",children:["Invitation link ",(0,t.jsx)("span",{className:"font-normal text-ink-3",children:"· works once, for 14 days"})]}),(0,t.jsxs)("div",{className:"mt-2 flex gap-2",children:[(0,t.jsx)(a.Input,{readOnly:!0,value:e,"aria-label":"Invitation link",onFocus:e=>e.currentTarget.select(),className:"text-[0.7812rem]"}),(0,t.jsxs)(a.Button,{size:"sm",onClick:async()=>{try{await navigator.clipboard.writeText(e),l(!0),setTimeout(()=>l(!1),1800)}catch{}},children:[r?(0,t.jsx)(n.Check,{className:"size-4","aria-hidden":!0}):(0,t.jsx)(i.Copy,{className:"size-4","aria-hidden":!0}),r?"Copied":"Copy"]})]}),(0,t.jsx)("p",{className:"mt-2 text-[0.8125rem] text-ink-3",children:"Email delivery isn’t connected yet, so send this link yourself. It’s shown only now."})]})}])},27389,e=>{"use strict";let t=`r.shows_children, r.for_all_staff, r.no_identifiable_children,
       cs.named, cs.without_consent, cs.family_visible, cs.needs_names`,s="left join lateral app.resource_child_status(r.id) cs on r.shows_children",i=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url, r.duration_sec,
       r.storage_path, f.file_name, f.mime_type, f.size_bytes, ${t},
       (select string_agg(distinct coalesce(c.name, lv.name, 'Everyone'), ', ')
          from resource_assignment a
          left join class c on c.id = a.class_id
          left join level lv on lv.id = a.level_id
         where a.resource_id = r.id and a.deleted_at is null) as scope_label
  from resource r
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  ${s}
 where r.deleted_at is null
 order by r.kind, r.category nulls last, r.title`,n=`
select f.id, f.headline, f.going_well, f.work_on, f.created_at, f.shared_at, f.edited_at,
       c.name as class_name, sm.display_name as author, ds.name as style, f.class_id,
       r.title as resource_title, r.url as resource_url,
       s.first_name || ' ' || s.last_name as student_name, s.id as student_id
  from feedback_note f
  join student s on s.id = f.student_id
  left join class c on c.id = f.class_id
  left join dance_style ds on ds.id = c.dance_style_id
  left join resource r on r.id = f.work_on_resource_id and r.deleted_at is null
  left join staff_member sm on sm.id = f.author_id
 where f.deleted_at is null and f.shared_at is not null
 order by f.shared_at desc`,a=`
select ev.id, ev.kind, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.venue,
       ev.cost_minor, ev.capacity, ev.entries_close_on, ev.requests_open,
       sm.display_name as teacher, ev.student_id,
       app.event_places(ev.id) as going,
       -- Each of my children on this event, with their own status (UR-50).
       -- RLS keeps event_participant to my own children.
       coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'student_id', s.id, 'first_name', s.first_name, 'status', p.status::text)
                                  order by s.date_of_birth)
                   from event_participant p join student s on s.id = p.student_id
                  where p.event_id = ev.id and p.deleted_at is null), '[]') as mine,
       (select p.status::text from event_participant p
         where p.event_id = ev.id and p.deleted_at is null
         order by array_position(array['confirmed','invited','requested','waitlisted','declined','withdrawn'], p.status::text) limit 1) as my_status,
       (select string_agg(s.first_name, ' & ' order by s.date_of_birth) from event_participant p join student s on s.id = p.student_id
         where p.event_id = ev.id and p.deleted_at is null and p.status not in ('declined', 'withdrawn')) as my_student,
       (select p.id from event_participant p where p.event_id = ev.id and p.deleted_at is null
           and p.status = 'invited' limit 1) as my_invite,
       coalesce((select jsonb_agg(jsonb_build_object('subject', cm.subject, 'body', cm.body, 'sent_at', cm.sent_at) order by cm.sent_at desc)
                   from communication cm where cm.event_id = ev.id and cm.deleted_at is null), '[]') as notices,
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
returning id, status`,l=`
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`,d=`
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
 order by starts_at`,c=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`,_=`
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
 order by (r.kind = 'medical_update') desc, r.created_at`,u=`
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`,m=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,p=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,f=`
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
       f.file_name, f.mime_type, f.size_bytes, ${t},
       u.full_name as added_by,
       (r.created_by = auth.uid()) as mine,
       case when a.class_id is null then 'Everyone' else null end as scope_label
  from resource r
  left join resource_assignment a
         on a.resource_id = r.id and a.deleted_at is null and a.class_id = $1
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  left join user_account u on u.id = r.created_by
  ${s}
 where r.deleted_at is null
   and (a.id is not null
        or not exists (select 1 from resource_assignment a2
                        where a2.resource_id = r.id and a2.deleted_at is null))
 order by (a.id is null), r.kind, r.created_at desc`,v=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by,
                      shows_children, for_all_staff)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid(),
       coalesce($10::boolean, false), coalesce($11::boolean, false)
  from class c where c.id = $1
returning id, studio_id`,y=`
with kids as (
  select e.student_id as id, true as in_class from enrolment e
   where e.class_id = $1 and e.status = 'active' and e.deleted_at is null
  union
  select rc.student_id, false from resource_child rc where rc.resource_id = $2::uuid
)
select s.id, s.first_name || ' ' || s.last_name as name,
       bool_or(k.in_class) as in_class,
       exists (select 1 from resource_child rc where rc.resource_id = $2::uuid and rc.student_id = s.id) as named,
       app.consent_now(s.id, 'video') as video, app.consent_now(s.id, 'photography') as photo
  from kids k join student s on s.id = k.id and s.deleted_at is null
 group by s.id, s.first_name, s.last_name
 order by s.first_name, s.last_name`,g=`
delete from resource_child where resource_id = $1 and not (student_id = any($2::uuid[]))`,x=`
insert into resource_child (studio_id, resource_id, student_id)
select r.studio_id, r.id, x from resource r, unnest($2::uuid[]) x where r.id = $1
on conflict (resource_id, student_id) do nothing`,$=`
update resource set shows_children = $2, no_identifiable_children = $3 and $2,
                    for_all_staff = $4, updated_at = now()
 where id = $1 returning id`,E=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,w=`
select app.retire_resource($1) as ok`,j=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ADD_RESOURCE_CHILDREN",0,x,"ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,p,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,E,"CLASS_CHILDREN_CONSENT",0,y,"CLASS_DETAIL",0,f,"CLASS_RESOURCES",0,h,"CLEAR_RESOURCE_CHILDREN",0,g,"CREATE_RESOURCE",0,v,"DECIDE_ENTRY",0,m,"DELETE_RESOURCE",0,w,"EVENTS",0,a,"MY_REQUESTS",0,l,"MY_TEACHING_CLASSES",0,j,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,u,"PENDING_REQUESTS",0,_,"RAISE_REQUEST",0,d,"REQUEST_MEDIA_CONSENT",0,"select * from app.request_media_consent($1)","REQUEST_PLACE",0,r,"RESOURCES",0,i,"RESOURCE_CHILD_STATUS",0,"select * from app.resource_child_status($1)","STUDENT_FEEDBACK",0,n,"UPDATE_RESOURCE_MEDIA",0,$,"WRITE_FEEDBACK",0,c])},27830,e=>{"use strict";e.i(47167);let t=`select id, code, name, price_minor, max_students, max_locations, max_staff, is_trial, active
  from plan order by sort`;e.s(["AM_SUPER",0,"select app.is_platform_super() as yes","CREATE_SCHOOL",0,"select * from app.platform_create_studio($1, $2, $3, $4, $5)","EVENTS",0,"select * from app.platform_events($1)","EXTEND_TRIAL",0,"select app.platform_extend_trial($1, $2)","INVITE",0,"select app.create_invitation($1, $2, $3::app_role, $4) as token","INVITES",0,"select * from app.platform_invitations($1)","PLANS",0,t,"PURGE",0,"select app.platform_purge_studio($1, $2)","REVOKE_INVITE",0,"select app.revoke_invitation($1)","SCHOOLS",0,"select * from app.platform_studios()","SET_PLAN",0,"select app.platform_set_plan($1, $2)","SET_PLAN_LIMITS",0,"select app.platform_set_plan_limits($1, $2, $3, $4, $5, $6)","SET_STATUS",0,"select app.platform_set_status($1, $2, $3)","START_SUPPORT",0,"select app.start_support_session($1) as until","inviteLink",0,e=>`${window.location.origin}/General/studio-next/invite/?token=${e}`])},11772,e=>{"use strict";let t=`
select x.id, x.board, x.title, x.exam_on, x.venue, x.entries_close_on, x.fee_minor, x.event_id, x.bill_on_entry,
       count(e.*) filter (where e.status <> 'withdrawn')::int as entries,
       count(e.*) filter (where e.result is not null)::int as results,
       count(e.*) filter (where e.status <> 'withdrawn' and e.invoice_id is null and e.fee_minor > 0)::int as unbilled
  from exam_session x left join exam_entry e on e.session_id = x.id
 where x.event_id = $1 and x.deleted_at is null group by x.id`,s=`
select r.id, r.from_term_id, r.to_term_id, ft.name as from_term, tt.name as to_term, tt.starts_on as to_starts, r.respond_by, r.status,
       count(o.*)::int as offers,
       count(o.*) filter (where o.status = 'confirmed')::int as confirmed,
       count(o.*) filter (where o.status = 'declined')::int as declined,
       count(o.*) filter (where o.status = 'proposed')::int as proposed,
       count(o.*) filter (where o.status = 'released')::int as released,
       count(o.*) filter (where o.status = 'placed')::int as placed,
       count(o.*) filter (where o.status = 'waitlisted')::int as waitlisted,
       count(o.*) filter (where o.class_id is null and o.status not in ('placed', 'waitlisted'))::int as no_class
  from reenrolment_round r join term ft on ft.id = r.from_term_id join term tt on tt.id = r.to_term_id
  left join reenrolment_offer o on o.round_id = r.id
 group by r.id, ft.name, tt.name, tt.starts_on order by r.created_at desc`,i=`
select o.id, o.student_id, s.first_name || ' ' || s.last_name as student,
       extract(year from age(t.starts_on, s.date_of_birth))::int as age,
       fc.name as from_class, o.class_id, c.name as class_name, o.reason, o.status, o.answered_at
  from reenrolment_offer o join reenrolment_round r on r.id = o.round_id join term t on t.id = r.to_term_id
  join student s on s.id = o.student_id
  left join class fc on fc.id = o.from_class_id left join class c on c.id = o.class_id
 where o.round_id = $1
 order by fc.day_of_week, fc.start_time, fc.name, s.first_name, s.last_name`,n=`
select c.id, c.name, l.name as level, c.age_min, c.age_max, c.capacity, c.day_of_week, c.start_time::text,
       (select count(*)::int from reenrolment_offer o where o.round_id = $2 and o.class_id = c.id and o.status not in ('declined', 'released')) as proposed,
       (select count(*)::int from reenrolment_offer o where o.round_id = $2 and o.class_id = c.id and o.status in ('confirmed', 'placed')) as confirmed
  from class c left join level l on l.id = c.level_id
 where c.term_id = $1 and c.deleted_at is null and c.pricing <> 'drop_in'
 order by c.day_of_week, c.start_time, c.name`,a=`insert into event_routine (event_id, class_id, title, music, duration_sec, position)
  select $1, $2, btrim($3), nullif(btrim($4), ''), $5, coalesce((select max(position) + 1 from event_routine where event_id = $1 and deleted_at is null), 1) returning id`,r=`update event_routine set title = btrim($2), class_id = $3, music = nullif(btrim($4), ''), duration_sec = $5,
  notes = nullif(btrim($6), ''), updated_at = now() where id = $1 returning id`,l=`
select s.id as student_id, s.first_name || ' ' || s.last_name as name,
       exists (select 1 from routine_dancer d where d.routine_id = $2 and d.student_id = s.id) as in_item
  from event_participant p join student s on s.id = p.student_id and s.deleted_at is null
 where p.event_id = $1 and p.status = 'confirmed' and p.deleted_at is null order by s.first_name, s.last_name`,d=`insert into event_helper_slot (studio_id, event_id, role, needed, routine_id)
  select e.studio_id, e.id, btrim($3), $4, $2 from studio_event e where e.id = $1 returning id`,o=`select i.id, i.name, r.title as routine, i.price_minor, i.charge_families
  from costume_item i left join event_routine r on r.id = i.routine_id where i.event_id = $1 and i.deleted_at is null order by r.position nulls first, i.name`;e.s(["ADD_COSTUME_ITEM",0,"insert into costume_item (event_id, routine_id, name, price_minor, charge_families) values ($1, $2, btrim($3), $4, $5) returning id","ADD_DANCER",0,"insert into routine_dancer (routine_id, student_id) values ($1, $2)","ADD_ITEM",0,a,"ANSWER_REENROLMENT",0,"select app.answer_reenrolment($1, $2) as r","BILL_COSTUMES",0,"select app.bill_costumes($1) as n","CANCEL_REENROLMENT",0,"select app.cancel_reenrolment($1)","CHILD_UNIFORM",0,"select * from app.child_uniform($1)","CLASS_UNIFORM",0,"select uniform, uniform_url from class where id = $1","CLOSE_REENROLMENT",0,"select app.close_reenrolment($1, $2) as n","CONFIRM_EXAM_ENTRY",0,"select app.confirm_exam_entry($1, $2)","COSTUME_BUDGET",0,"select * from app.costume_budget($1)","COSTUME_ITEMS",0,o,"EXAM_CERTIFICATE",0,"select app.exam_certificate($1, $2)","FAMILY_REENROLMENT",0,"select * from app.family_reenrolment()","ITEM_DANCERS",0,l,"ITEM_SLOT",0,d,"LEVELS",0,"select id, name, sort_order, next_level_id from level where deleted_at is null order by sort_order, name","LICENCES",0,"select * from app.licence_tracker($1)","NEXT_TERM_CLASSES",0,n,"OFFERS",0,i,"OPEN_REENROLMENT",0,"select app.open_reenrolment($1) as n","PUBLISH_REENROLMENT",0,"select app.publish_reenrolment($1) as r","REASON",0,{moves_up:"Moves up",stays:"Same class",by_age:"By age",office:"Chosen by the office",none:"No class proposed"},"REMOVE_DANCER",0,"delete from routine_dancer where routine_id = $1 and student_id = $2","REOPEN_REENROLMENT",0,"select app.reopen_reenrolment($1, $2::date)","ROUNDS",0,s,"RUNNING_ORDER",0,"select * from app.running_order($1)","SESSION_FOR_EVENT",0,t,"SET_CLASS_UNIFORM",0,"select app.set_class_uniform($1, $2::text[], $3)","SET_COSTUME_BUDGET",0,"update studio_event set costume_budget_minor = $2, updated_at = now() where id = $1 returning id","SET_LICENCE",0,"select app.set_licence($1, $2, $3, $4, $5, $6, $7::date, $8::date, $9, $10)","SET_LICENCE_ALL",0,"select app.set_licence_needed_all($1, $2) as n","SET_NEXT_LEVEL",0,"update level set next_level_id = $2, updated_at = now() where id = $1 returning id","SET_REENROLMENT_CLASS",0,"select app.set_reenrolment_class($1, $2)","STAGE_WORD",0,{withdrawn:"Withdrawn",entered:"Entered",confirmed:"Confirmed",sat:"Sat",result:"Result"},"START_REENROLMENT",0,"select app.start_reenrolment($1, $2, $3::date) as id","UPDATE_COSTUME_ITEM",0,"update costume_item set price_minor = $2, charge_families = $3 where id = $1 returning id","UPDATE_EXAM_ENTRY",0,"select app.update_exam_entry($1, $2, $3, $4::timestamptz)","UPDATE_ITEM",0,r,"clockTime",0,e=>null==e?"":`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`,"examStage",0,function(e){return"withdrawn"===e.status?"withdrawn":e.result?"result":"sat"===e.status?"sat":e.confirmed_at?"confirmed":"entered"},"parseClock",0,function(e){let t=e.trim();if(!t)return null;let s=t.match(/^(\d+)\s*[:m.]\s*(\d{1,2})\s*s?$/);return s?60*Number(s[1])+Number(s[2]):/^\d+$/.test(t)?Number(t):null}])}]);