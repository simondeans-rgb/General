(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,95468,e=>{"use strict";let s=(0,e.i(75254).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,s],95468)},74886,e=>{"use strict";let s=(0,e.i(75254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",0,s],74886)},52571,e=>{"use strict";let s=(0,e.i(75254).default)("info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);e.s(["Info",0,s],52571)},66408,e=>{"use strict";let s=(0,e.i(75254).default)("mail-plus",[["path",{d:"M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8",key:"12jkf8"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}],["path",{d:"M19 16v6",key:"tddt3s"}],["path",{d:"M16 19h6",key:"xwg31i"}]]);e.s(["MailPlus",0,s],66408)},7233,e=>{"use strict";let s=(0,e.i(75254).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,s],7233)},25652,e=>{"use strict";let s=(0,e.i(75254).default)("trending-up",[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]]);e.s(["TrendingUp",0,s],25652)},17801,e=>{"use strict";let s=(0,e.i(75254).default)("user-minus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]);e.s(["UserMinus",0,s],17801)},48848,e=>{e.v(s=>Promise.all(["static/chunks/03n1mi23bfzdq.js"].map(s=>e.l(s))).then(()=>s(39726)))},399,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(74886),i=e.i(43531),d=e.i(17658);e.s(["InviteLink",0,function({link:e}){let[n,l]=t.useState(!1);return(0,s.jsxs)("div",{className:"mt-3 border-l-2 border-ink pl-3",children:[(0,s.jsxs)("p",{className:"text-[0.875rem] font-semibold",children:["Invitation link ",(0,s.jsx)("span",{className:"font-normal text-ink-3",children:"· works once, for 14 days"})]}),(0,s.jsxs)("div",{className:"mt-2 flex gap-2",children:[(0,s.jsx)(d.Input,{readOnly:!0,value:e,"aria-label":"Invitation link",onFocus:e=>e.currentTarget.select(),className:"text-[0.7812rem]"}),(0,s.jsxs)(d.Button,{size:"sm",onClick:async()=>{try{await navigator.clipboard.writeText(e),l(!0),setTimeout(()=>l(!1),1800)}catch{}},children:[n?(0,s.jsx)(i.Check,{className:"size-4","aria-hidden":!0}):(0,s.jsx)(a.Copy,{className:"size-4","aria-hidden":!0}),n?"Copied":"Copy"]})]}),(0,s.jsx)("p",{className:"mt-2 text-[0.8125rem] text-ink-3",children:"Email delivery isn’t connected yet, so send this link yourself. It’s shown only now."})]})}])},56166,e=>{e.v(s=>Promise.all(["static/chunks/1sfki9bryb301.js"].map(s=>e.l(s))).then(()=>s(52715)))},27830,e=>{"use strict";e.i(47167);let s=`select id, code, name, price_minor, max_students, max_locations, max_staff, is_trial, active
  from plan order by sort`;e.s(["AM_SUPER",0,"select app.is_platform_super() as yes","CREATE_SCHOOL",0,"select * from app.platform_create_studio($1, $2, $3, $4, $5)","EVENTS",0,"select * from app.platform_events($1)","EXTEND_TRIAL",0,"select app.platform_extend_trial($1, $2)","INVITE",0,"select app.create_invitation($1, $2, $3::app_role, $4) as token","INVITES",0,"select * from app.platform_invitations($1)","PLANS",0,s,"PURGE",0,"select app.platform_purge_studio($1, $2)","REVOKE_INVITE",0,"select app.revoke_invitation($1)","SCHOOLS",0,"select * from app.platform_studios()","SET_PLAN",0,"select app.platform_set_plan($1, $2)","SET_PLAN_LIMITS",0,"select app.platform_set_plan_limits($1, $2, $3, $4, $5, $6)","SET_STATUS",0,"select app.platform_set_status($1, $2, $3)","START_SUPPORT",0,"select app.start_support_session($1) as until","inviteLink",0,e=>`${window.location.origin}/General/studio-next/invite/?token=${e}`])},36261,e=>{"use strict";let s=`select id, kind, label, position, band, sticker from feedback_chip where class_id is null
                       order by band, kind, position, label`,t=`
insert into feedback_chip (studio_id, kind, label, position)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'standard'), 1)
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,a=`
insert into feedback_chip (studio_id, kind, label, position, band, sticker)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'under_8'), 1),
       'under_8', nullif(btrim($3), '')
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,i=`select c.id, c.tracking_depth, app.class_depth(c.id) as depth, c.age_min, c.age_max,
       app.age_band_depth(c.age_max) as default_depth from class c where c.id = $1`,d=`
select f.id, f.name, ds.name as style,
       coalesce((select jsonb_agg(jsonb_build_object('id', fs.id, 'name', fs.name, 'position', fs.position) order by fs.position)
                   from framework_skill fs where fs.framework_id = f.id and fs.deleted_at is null), '[]') as skills
  from skill_framework f left join dance_style ds on ds.id = f.dance_style_id
 where f.deleted_at is null order by ds.name`,n=`
insert into framework_skill (studio_id, framework_id, name, position)
select f.studio_id, f.id, btrim($2), coalesce((select max(position) + 1 from framework_skill where framework_id = f.id), 1)
  from skill_framework f where f.id = $1 returning id`,l=`
with cs as (select * from class_session where id = $1),
kids as (
  select e.student_id, null::text as visiting, 0 as pri from cs
    join enrolment e on e.class_id = cs.class_id and e.deleted_at is null
         and (e.status = 'active' or e.ended_on >= cs.starts_at::date)
  union all
  select t.student_id, 'trial', 1 from cs join trial t on t.session_id = cs.id and t.student_id is not null
         and t.deleted_at is null and t.status in ('booked', 'attended', 'converted')
  union all
  select d.student_id, 'drop_in', 2 from cs join drop_in_booking d on d.session_id = cs.id and d.status = 'booked'
),
one as (select distinct on (student_id) student_id, visiting from kids order by student_id, pri)
select s.id as student_id, s.first_name, s.last_name, a.status::text as status, one.visiting,
       f.going_well, f.work_on, f.shared_at is not null as shared, f.edited_at,
       f.going_well_chips, f.work_on_chips, f.note, f.work_on_note, f.work_on_resource_id
  from one
  join cs on true
  join student s on s.id = one.student_id and s.deleted_at is null
  left join attendance_record a on a.session_id = cs.id and a.student_id = s.id and a.deleted_at is null
  left join feedback_note f on f.session_id = cs.id and f.student_id = s.id and f.deleted_at is null
-- One order everywhere, the register's: by last name. It must not move
 -- between saves (round 2 panel), so nothing that changes is in it.
 order by s.last_name, s.first_name, s.id`,r=`
select f.student_id, f.going_well_chips, f.work_on_chips, p.starts_at
  from class_session me
  join lateral (select cs.id, cs.starts_at from class_session cs
                 where cs.class_id = me.class_id and cs.starts_at < me.starts_at and cs.deleted_at is null
                   and exists (select 1 from feedback_note f2 where f2.session_id = cs.id and f2.deleted_at is null)
                 order by cs.starts_at desc limit 1) p on true
  join feedback_note f on f.session_id = p.id and f.deleted_at is null
 where me.id = $1`,o=`
select f.id, f.going_well, f.work_on, coalesce(cs.starts_at, f.shared_at, f.created_at) as at, c.name as class_name,
       f.shared_at is not null as shared, r.title as resource_title
  from feedback_note f
  left join class_session cs on cs.id = f.session_id
  left join class c on c.id = f.class_id
  left join resource r on r.id = f.work_on_resource_id and r.deleted_at is null
 where f.student_id = $1 and f.deleted_at is null and (f.going_well is not null or f.work_on is not null)
   and f.session_id is distinct from $2::uuid
 order by coalesce(cs.starts_at, f.created_at) desc limit 1`,_=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.class_id = $1 and r.deleted_at is null order by s.first_name`,c=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.deleted_at is null and r.status = 'shared' order by r.shared_at desc`,m=`select id, student_id, text, status, review_note, created_at from student_goal
                       where student_id = $1 and deleted_at is null order by created_at desc`,p=`
select r.id, r.mood, r.text, r.created_at, c.name as class_name from student_reflection r
  left join class_session cs on cs.id = r.session_id left join class c on c.id = cs.class_id
 where r.student_id = $1 and r.deleted_at is null order by r.created_at desc limit 20`,u=`
select cs.id, c.name, cs.starts_at from attendance_record a join class_session cs on cs.id = a.session_id
  join class c on c.id = cs.class_id
 where a.student_id = app.student_self_id() and a.status in ('present', 'late') and a.deleted_at is null
   and cs.starts_at > now() - interval '14 days'
   and not exists (select 1 from student_reflection r where r.session_id = cs.id and r.deleted_at is null)
 order by cs.starts_at desc limit 5`,f=`
select c.id, c.name, ds.name as style, app.class_depth(c.id) as depth,
       exists (select 1 from skill_framework f join framework_skill fs on fs.framework_id = f.id and fs.deleted_at is null
                where f.deleted_at is null and f.dance_style_id = c.dance_style_id)
       and exists (select 1 from enrolment e where e.class_id = c.id and e.status = 'active' and e.deleted_at is null) as has_skills
  from class c left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by ds.name nulls last, c.name`;e.s(["ADD_CHIP",0,t,"ADD_CLASS_CHIP",0,"select app.add_class_chip($1, $2, $3, $4) as id","ADD_REFLECTION",0,"select app.add_reflection($1, $2, $3) as id","ADD_SKILL",0,n,"ADD_YOUNG_CHIP",0,a,"CHIPS",0,s,"CLASS_CHIPS",0,"select * from app.class_chips($1)","CLASS_DEPTH",0,i,"CLASS_PROGRESS",0,"select * from app.class_progress($1)","CLASS_REPORTS",0,_,"DEPTHS",0,[{key:"notes",label:"Notes",hint:"Feedback notes only. No skill levels."},{key:"notes_skills",label:"Notes and skills",hint:"Notes and current skill levels."},{key:"full",label:"Full",hint:"Notes, skill levels and their history over time."}],"DRAFT_REPORTS",0,"select app.draft_class_reports($1) as n","FRAMEWORKS",0,d,"GOALS",0,m,"LAST_FEEDBACK",0,o,"LEVELS",0,[{key:"not_started",label:"Not started",short:"–"},{key:"developing",label:"Developing",short:"D"},{key:"secure",label:"Secure",short:"S"},{key:"mastered",label:"Mastered",short:"M"}],"MILESTONES",0,"select id, kind, title, reached_on from milestone where student_id = $1 order by reached_on desc","MOODS",0,["😣","😕","😐","🙂","🤩"],"MY_PROGRESS_CLASSES",0,f,"MY_RECENT_CLASSES",0,u,"MY_REPORTS",0,c,"PREVIOUS_SESSION_CHIPS",0,r,"PROPOSE_GOAL",0,"insert into student_goal (student_id, text, status, proposed_by) values ($1, btrim($2), $3, auth.uid()) returning id","RECORD_SKILL",0,"select app.record_skill($1, $2, $3::assessment_level, $4) as id","REFLECTIONS",0,p,"REMOVE_CHIP",0,"select app.soft_delete('feedback_chip', $1)","REMOVE_CLASS_CHIP",0,"select app.remove_class_chip($1, $2, $3) as ok","REMOVE_SKILL",0,"select app.soft_delete('framework_skill', $1)","RENAME_SKILL",0,"update framework_skill set name = btrim($2), updated_at = now() where id = $1 returning id","RESET_CLASS_CHIPS",0,"select app.reset_class_chips($1) as n","SAVE_CLASS_FEEDBACK",0,"select app.save_class_feedback($1, $2::jsonb, $3) as n","SESSION_FEEDBACK",0,l,"SET_CLASS_DEPTH",0,"select app.set_class_depth($1, $2) as depth","SET_GOAL",0,"update student_goal set status = $2, review_note = coalesce(nullif(btrim($3), ''), review_note), updated_at = now() where id = $1 returning id","SET_REPORT_COMMENT",0,"update progress_report set comment = nullif(btrim($2), ''), updated_at = now() where id = $1 returning id","SET_SKILL_DEMO",0,"select app.set_skill_demo($1, nullif(btrim($2), ''))","SET_SKILL_PUBLISH",0,"select app.set_skill_publish($1, $2) as mode","SET_SKILL_TRACKING",0,"select app.set_skill_tracking($1, $2) as tracked","SET_SUPPORT_NOTE",0,"select app.set_support_note($1, $2) as ok","SHARE_REPORTS",0,"select app.share_reports($1::uuid[]) as n","SHARE_SESSION_FEEDBACK",0,"select app.share_session_feedback($1) as n","SHARE_SKILLS",0,"select app.share_skills($1) as n","SKILL_DEMOS",0,"select id, demo_url from framework_skill where demo_url is not null and deleted_at is null","SKILL_HISTORY",0,"select * from app.skill_history($1)","SKILL_PUBLISH",0,"select id, skill_publish from studio where id in (select app.studio_ids()) limit 1","STUDENT_SKILLS",0,"select * from app.student_skills($1)","SUPPORT_NEEDS",0,"select * from app.support_needs()","TIMELINE",0,"select * from app.student_timeline($1) limit 200","UNSHARED_SKILLS",0,"select count(*)::int as n from skill_assessment where student_id = $1 and published_at is null and deleted_at is null"])}]);