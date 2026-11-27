(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,37345,e=>{"use strict";let t=(0,e.i(75254).default)("message-square-plus",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}],["path",{d:"M12 8v6",key:"1ib9pf"}],["path",{d:"M9 11h6",key:"1fldmi"}]]);e.s(["MessageSquarePlus",0,t],37345)},70009,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(54616),i=e.i(12598),n=e.i(37345),r=e.i(45060),d=e.i(77326),l=e.i(97214),o=e.i(13927),c=e.i(30224),u=e.i(31502),_=e.i(17658),m=e.i(27389),h=e.i(75379);let f={question:"Question",private_lesson:"Private lesson",medical_update:"Medical update",event_interest:"Event",absence:"Absence",data_request:"Data request",other:"Other"},p={caution:"text-caution",info:"text-info",positive:"text-positive",neutral:"text-ink-2"},v={open:{label:"Waiting on the studio",tone:"caution"},in_progress:{label:"Being looked at",tone:"info"},answered:{label:"Answered",tone:"positive"},closed:{label:"Closed",tone:"neutral"}};function b({onClose:e}){let n=(0,l.useFamilyVoice)(),{session:r}=(0,u.useSession)(),d=(0,i.useQueryClient)(),h=(0,o.useRows)(["ask-children"],"select id, first_name, last_name from student where deleted_at is null order by date_of_birth"),[f,p]=s.useState(""),[v,y]=s.useState("question"),[j,x]=s.useState(""),[g,w]=s.useState(""),[k,E]=s.useState(!1);s.useEffect(()=>{!f&&h.data?.[0]&&p(h.data[0].id)},[h.data,f]);let S=(0,a.useMutation)({mutationFn:async()=>(0,c.runAs)(r,e=>e(m.RAISE_REQUEST,[f,v,j.trim(),g.trim()])),onSuccess:()=>{E(!0),d.invalidateQueries({queryKey:["db"]})}}),$=f&&j.trim().length>=3&&g.trim().length>=5;return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:e,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"ask-t",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:k?(0,t.jsxs)("div",{className:"py-2",children:[(0,t.jsx)("p",{className:"font-display text-[1.375rem] uppercase leading-none tracking-[-0.01em] [font-stretch:80%]",children:"Sent"}),(0,t.jsx)("p",{id:"ask-t",className:"mt-1.5 font-semibold",children:"Sent to the studio"}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:"You will see the reply here."}),(0,t.jsx)(_.Button,{className:"mt-4 w-full",variant:"primary",onClick:e,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("h2",{id:"ask-t",className:"text-[1.0625rem] font-semibold tracking-tight",children:"Ask the studio"}),(0,t.jsxs)("div",{className:"mt-4 space-y-3",children:[(h.data?.length??0)>1&&(0,t.jsx)(_.Field,{label:n.self?"Who is it about":"About which child",htmlFor:"ask-child",children:(0,t.jsx)(_.Select,{id:"ask-child",value:f,onChange:e=>p(e.target.value),children:h.data?.map(e=>(0,t.jsx)("option",{value:e.id,children:e.id===n.self?.id?"Me":`${e.first_name} ${e.last_name}`},e.id))})}),(0,t.jsx)(_.Field,{label:"What is it about",htmlFor:"ask-kind",children:(0,t.jsxs)(_.Select,{id:"ask-kind",value:v,onChange:e=>y(e.target.value),children:[(0,t.jsx)("option",{value:"question",children:"A question"}),(0,t.jsx)("option",{value:"private_lesson",children:"A private lesson"}),(0,t.jsx)("option",{value:"medical_update",children:"A medical or allergy update"}),(0,t.jsx)("option",{value:"event_interest",children:"A competition or event"}),(0,t.jsx)("option",{value:"other",children:"Something else"})]})}),"medical_update"===v&&(0,t.jsx)("p",{className:"border-l-2 border-caution pl-3 text-[0.8438rem] text-ink-2",children:"Studio staff update the medical record themselves, so there is a record of who changed what. Tell them here and they’ll make the change."}),(0,t.jsx)(_.Field,{label:"Subject",htmlFor:"ask-subject",required:!0,children:(0,t.jsx)(_.Input,{id:"ask-subject",value:j,onChange:e=>x(e.target.value),placeholder:"Shoes for the exam"})}),(0,t.jsx)(_.Field,{label:"Message",htmlFor:"ask-body",required:!0,children:(0,t.jsx)("textarea",{id:"ask-body",value:g,onChange:e=>w(e.target.value),rows:4,placeholder:"As much or as little as you like.",className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                             focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"})})]}),S.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(_.ErrorState,{error:S.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(_.Button,{className:"flex-1",onClick:e,children:"Cancel"}),(0,t.jsx)(_.Button,{className:"flex-1",variant:"primary",loading:S.isPending,disabled:!$,onClick:()=>S.mutate(),children:"Send"})]})]})})})}e.s(["default",0,function(){let e=(0,o.useRows)(["my-requests"],m.MY_REQUESTS),[a,i]=s.useState(!1);return(0,t.jsxs)(d.Shell,{title:"Ask the studio",allow:["guardian"],actions:(0,t.jsxs)(_.Button,{size:"sm",variant:"primary",onClick:()=>i(!0),children:[(0,t.jsx)(n.MessageSquarePlus,{className:"size-4","aria-hidden":!0})," Ask a question"]}),children:[(0,t.jsxs)("div",{className:"mx-auto max-w-2xl",children:[e.isLoading&&(0,t.jsx)("div",{className:"space-y-3",children:[0,1].map(e=>(0,t.jsx)(_.Skeleton,{className:"h-20"},e))}),null!=e.error&&(0,t.jsx)(_.ErrorState,{error:e.error,onRetry:()=>e.refetch()}),e.data?.length===0&&!e.isLoading&&(0,t.jsx)(_.EmptyState,{title:"Nothing asked yet",body:"Questions about classes, uniform, private lessons or medical details all go here.",action:(0,t.jsx)(_.Button,{onClick:()=>i(!0),children:"Ask a question"})}),!!e.data?.length&&(0,t.jsx)("ul",{className:"divide-y divide-line border-t-2 border-ink",children:e.data.map(e=>{let s=v[e.status]??v.open;return(0,t.jsxs)("li",{className:"py-4",children:[(0,t.jsxs)("p",{className:"text-[0.8125rem] text-ink-3",children:[(0,t.jsx)("span",{className:"font-semibold text-ink-2",children:f[e.kind]??e.kind})," · ",(0,t.jsx)("span",{className:(0,r.cn)("font-semibold",p[s.tone]),children:s.label}),e.student_name&&(0,t.jsxs)(t.Fragment,{children:[" · about ",e.student_name]})]}),(0,t.jsxs)("div",{className:"mt-0.5 flex items-baseline gap-3",children:[(0,t.jsx)("h2",{className:"min-w-0 flex-1 font-semibold leading-snug",children:e.subject}),(0,t.jsx)("span",{className:"shrink-0 text-[0.8125rem] text-ink-3",children:(0,h.relativeDay)(e.created_at)})]}),(0,t.jsx)("p",{className:"mt-1 text-[0.9062rem] leading-relaxed text-ink-2",children:e.body}),e.answer&&(0,t.jsxs)("div",{className:"mt-3 border-l-2 border-positive pl-3",children:[(0,t.jsx)("p",{className:"text-[0.8125rem] font-semibold text-positive",children:"The studio replied"}),(0,t.jsx)("p",{className:"mt-0.5 text-[0.9375rem]",children:e.answer})]})]},e.id)})})]}),a&&(0,t.jsx)(b,{onClose:()=>i(!1)})]})}])},97214,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(54616),i=e.i(12598),n=e.i(65712),r=e.i(17658),d=e.i(13927),l=e.i(30224),o=e.i(31502),c=e.i(8199);function u(){let e=(0,d.useRows)(["my-children"],c.MY_CHILDREN);return s.useMemo(()=>{let t=e.data??[],s=t.find(e=>e.is_me)??null;return{self:s,solo:!!s&&t.every(e=>e.is_me),name:(e,t)=>s&&e===s.id?"you":t}},[e.data])}function _({onClose:e,onDone:d}){let{session:u}=(0,o.useSession)(),m=(0,i.useQueryClient)(),[h,f]=s.useState(""),[p,v]=s.useState(!1),[b,y]=s.useState(""),[j,x]=s.useState(""),g=(0,a.useMutation)({mutationFn:()=>(0,l.runAs)(u,e=>e(c.BOOK_FOR_MYSELF,[h||null,p,b||null,j||null])),onSuccess:()=>{m.invalidateQueries({queryKey:["db"]}),d()}});return(0,t.jsxs)(n.RecordSheet,{title:"Book for myself",subtitle:"For adult classes and drop-ins",onClose:e,saving:g.isPending,error:g.error,canSave:(!!h||p)&&j.trim().length>0,saveLabel:"Add me",onSave:()=>g.mutate(),children:[(0,t.jsx)("p",{className:"text-[0.8438rem] text-ink-2",children:"The school keeps a short record for you as a dancer, with someone to ring in an emergency. Nothing about your children changes."}),(0,t.jsx)(r.Field,{label:"Date of birth",htmlFor:"me-dob",hint:"Optional. Or tick the box below.",children:(0,t.jsx)(r.Input,{id:"me-dob",type:"date",value:h,onChange:e=>f(e.target.value)})}),(0,t.jsxs)("label",{className:"flex min-h-11 items-center gap-2.5 text-sm",children:[(0,t.jsx)("input",{type:"checkbox",className:"size-5 accent-[var(--color-accent)]",checked:p,onChange:e=>v(e.target.checked)}),"I am 18 or over"]}),(0,t.jsx)(r.Field,{label:"Emergency contact",htmlFor:"me-ec-name",hint:"Someone other than you.",children:(0,t.jsx)(r.Input,{id:"me-ec-name",value:b,onChange:e=>y(e.target.value),autoComplete:"off"})}),(0,t.jsx)(r.Field,{label:"Their phone",htmlFor:"me-ec-phone",required:!0,children:(0,t.jsx)(r.Input,{id:"me-ec-phone",type:"tel",value:j,onChange:e=>x(e.target.value),autoComplete:"off"})})]})}e.s(["BookForMyself",0,function(){let e=u(),[a,i]=s.useState(!1),[n,d]=s.useState(!1);return e.self&&!n?null:(0,t.jsxs)("section",{id:"for-me","aria-labelledby":"for-me-h",children:[(0,t.jsxs)("div",{className:"mb-1 border-b-2 border-ink pb-2",children:[(0,t.jsx)("h2",{id:"for-me-h",className:"section-title",children:"Classes for you"}),(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Adult classes and drop-ins, booked in your own name."})]}),n?(0,t.jsxs)("p",{role:"status",className:"pt-3 text-[0.9062rem]",children:[(0,t.jsx)("span",{className:"font-semibold text-positive",children:"Done."})," You’re on the account as an adult student. Choose a class under your name, or book a drop-in."]}):(0,t.jsxs)("div",{className:"pt-3",children:[(0,t.jsx)("p",{className:"text-[0.9062rem] text-ink-2",children:"Your children’s details stay as they are. Your bookings and payments show alongside theirs."}),(0,t.jsx)(r.Button,{className:"mt-3",onClick:()=>i(!0),children:"Book for myself"})]}),a&&(0,t.jsx)(_,{onClose:()=>i(!1),onDone:()=>{i(!1),d(!0)}})]})},"useFamilyVoice",0,u])},48848,e=>{e.v(t=>Promise.all(["static/chunks/3e350uomau313.js"].map(t=>e.l(t))).then(()=>t(39726)))},56166,e=>{e.v(t=>Promise.all(["static/chunks/1sfki9bryb301.js"].map(t=>e.l(t))).then(()=>t(52715)))},27389,e=>{"use strict";let t=`r.shows_children, r.for_all_staff, r.no_identifiable_children,
       cs.named, cs.without_consent, cs.family_visible, cs.needs_names`,s="left join lateral app.resource_child_status(r.id) cs on r.shows_children",a=`
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
 order by r.kind, r.category nulls last, r.title`,i=`
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
 order by f.shared_at desc`,n=`
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
returning id, status`,d=`
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
returning id`,u=`
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
 order by (r.kind = 'medical_update') desc, r.created_at`,_=`
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
returning id, status`,h=`
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
 where c.id = $1 and c.deleted_at is null`,p=`
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
returning id, studio_id`,b=`
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
 order by s.first_name, s.last_name`,y=`
delete from resource_child where resource_id = $1 and not (student_id = any($2::uuid[]))`,j=`
insert into resource_child (studio_id, resource_id, student_id)
select r.studio_id, r.id, x from resource r, unnest($2::uuid[]) x where r.id = $1
on conflict (resource_id, student_id) do nothing`,x=`
update resource set shows_children = $2, no_identifiable_children = $3 and $2,
                    for_all_staff = $4, updated_at = now()
 where id = $1 returning id`,g=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,w=`
select app.retire_resource($1) as ok`,k=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ADD_RESOURCE_CHILDREN",0,j,"ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,h,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,g,"CLASS_CHILDREN_CONSENT",0,b,"CLASS_DETAIL",0,f,"CLASS_RESOURCES",0,p,"CLEAR_RESOURCE_CHILDREN",0,y,"CREATE_RESOURCE",0,v,"DECIDE_ENTRY",0,m,"DELETE_RESOURCE",0,w,"EVENTS",0,n,"MY_REQUESTS",0,d,"MY_TEACHING_CLASSES",0,k,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,_,"PENDING_REQUESTS",0,u,"RAISE_REQUEST",0,l,"REQUEST_PLACE",0,r,"RESOURCES",0,a,"STUDENT_FEEDBACK",0,i,"UPDATE_RESOURCE_MEDIA",0,x,"WRITE_FEEDBACK",0,c])}]);