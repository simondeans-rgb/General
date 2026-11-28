(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,22145,e=>{"use strict";var t=e.i(28367);let i=e=>null==e?"null":"number"==typeof e?String(e):"boolean"==typeof e?e?"true":"false":`'${String(e).replace(/'/g,"''")}'`,a=e=>`(${e.map(i).join(",")})`,s=e=>e.toISOString().slice(0,10),n=(e,t)=>{let i=new Date(e);return i.setUTCDate(i.getUTCDate()+t),i};function r({today:e=new Date}={}){let o,m,h=new Date(Date.UTC(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate())),_=n(h,-42),p=n(h,56),f=n(h,21),S=[];S.push(`insert into studio (id,name,slug,timezone,currency,brand_hue,contact_email,contact_phone,onboarding_step,onboarded_at) values
    ${a([t.STUDIO_ID,"Northstar Dance Academy","northstar","Europe/London","GBP",265,"hello@northstardance.co.uk","020 8555 0142",10,new Date().toISOString()])};`);let y={greenwich:(0,t.uid)(t.NS.location,1),blackheath:(0,t.uid)(t.NS.location,2)};S.push(`insert into location (id,studio_id,name,address_line1,city,postcode) values
    ${a([y.greenwich,t.STUDIO_ID,"Greenwich Studio","14 Creek Road","London","SE8 3BU"])},
    ${a([y.blackheath,t.STUDIO_ID,"Blackheath Studio","3 Tranquil Vale","London","SE3 0AX"])};`);let g={g1:(0,t.uid)(t.NS.room,1),g2:(0,t.uid)(t.NS.room,2),b1:(0,t.uid)(t.NS.room,3)};S.push(`insert into room (id,studio_id,location_id,name,capacity) values
    ${a([g.g1,t.STUDIO_ID,y.greenwich,"Studio One",24])},
    ${a([g.g2,t.STUDIO_ID,y.greenwich,"Studio Two",16])},
    ${a([g.b1,t.STUDIO_ID,y.blackheath,"Main Hall",20])};`);let w=[[(0,t.uid)(t.NS.user,1),"freya.lindqvist@northstardance.co.uk","Freya Lindqvist"],[(0,t.uid)(t.NS.user,2),"marcus.bell@northstardance.co.uk","Marcus Bell"],[(0,t.uid)(t.NS.user,3),"priya.raman@northstardance.co.uk","Priya Raman"],[(0,t.uid)(t.NS.user,4),"tomasz.wojcik@northstardance.co.uk","Tomasz Wójcik"],[(0,t.uid)(t.NS.user,5),"nadia.okafor@northstardance.co.uk","Nadia Okafor"]],b=[[(0,t.uid)(t.NS.user,11),"hannah.wright@example.com","Hannah Wright"],[(0,t.uid)(t.NS.user,12),"joseph.adeyemi@example.com","Joseph Adeyemi"],[(0,t.uid)(t.NS.user,13),"clare.doherty@example.com","Clare Doherty"]];S.push(`insert into user_account (id,email,full_name) values
    ${[...w,...b].map(e=>a(e)).join(",\n    ")};`),S.push(`insert into membership (id,user_id,studio_id,role) values
    ${a([(0,t.uid)(t.NS.membership,1),w[0][0],t.STUDIO_ID,"owner"])},
    ${a([(0,t.uid)(t.NS.membership,2),w[4][0],t.STUDIO_ID,"admin"])},
    ${a([(0,t.uid)(t.NS.membership,3),w[1][0],t.STUDIO_ID,"teacher"])},
    ${a([(0,t.uid)(t.NS.membership,4),w[2][0],t.STUDIO_ID,"teacher"])},
    ${a([(0,t.uid)(t.NS.membership,5),w[3][0],t.STUDIO_ID,"teacher"])},
    ${b.map((e,i)=>a([(0,t.uid)(t.NS.membership,10+i),e[0],t.STUDIO_ID,"guardian"])).join(",\n    ")};`);let v={freya:(0,t.uid)(t.NS.staff,1),marcus:(0,t.uid)(t.NS.staff,2),priya:(0,t.uid)(t.NS.staff,3),tomasz:(0,t.uid)(t.NS.staff,4)};S.push(`insert into staff_member (id,studio_id,user_id,display_name,email,colour,status,bio) values
    ${a([v.freya,t.STUDIO_ID,w[0][0],"Freya Lindqvist",w[0][1],"violet","active","Founder. RAD-trained, 18 years teaching ballet."])},
    ${a([v.marcus,t.STUDIO_ID,w[1][0],"Marcus Bell",w[1][1],"amber","active","Tap and musical theatre. West End credits."])},
    ${a([v.priya,t.STUDIO_ID,w[2][0],"Priya Raman",w[2][1],"teal","active","Contemporary and modern. MA Dance, Roehampton."])},
    ${a([v.tomasz,t.STUDIO_ID,w[3][0],"Tomasz Wójcik",w[3][1],"rose","active","Street and commercial. Choreographs the summer show."])};`);let I=(0,t.uid)(t.NS.term,1);S.push(`insert into term (id,studio_id,name,starts_on,ends_on,status) values
    ${a([I,t.STUDIO_ID,"Current Term",s(_),s(p),"published"])};`),S.push(`insert into term_break (id,studio_id,term_id,name,starts_on,ends_on) values
    ${a([(0,t.uid)(t.NS.break,1),t.STUDIO_ID,I,"Half term",s(f),s(n(f,6))])};`);let D={ballet:(0,t.uid)(t.NS.style,1),tap:(0,t.uid)(t.NS.style,2),modern:(0,t.uid)(t.NS.style,3),jazz:(0,t.uid)(t.NS.style,4),contemporary:(0,t.uid)(t.NS.style,5),street:(0,t.uid)(t.NS.style,6)};S.push(`insert into dance_style (id,studio_id,name,colour,sort_order) values
    ${a([D.ballet,t.STUDIO_ID,"Ballet","violet",1])},
    ${a([D.tap,t.STUDIO_ID,"Tap","amber",2])},
    ${a([D.modern,t.STUDIO_ID,"Modern","teal",3])},
    ${a([D.jazz,t.STUDIO_ID,"Jazz","rose",4])},
    ${a([D.contemporary,t.STUDIO_ID,"Contemporary","indigo",5])},
    ${a([D.street,t.STUDIO_ID,"Street","lime",6])};`);let k={preschool:(0,t.uid)(t.NS.level,1),primary:(0,t.uid)(t.NS.level,2),g1:(0,t.uid)(t.NS.level,3),g2:(0,t.uid)(t.NS.level,4),g3:(0,t.uid)(t.NS.level,5),inter:(0,t.uid)(t.NS.level,6)};return S.push(`insert into level (id,studio_id,name,sort_order) values
    ${a([k.preschool,t.STUDIO_ID,"Pre-School",1])},
    ${a([k.primary,t.STUDIO_ID,"Primary",2])},
    ${a([k.g1,t.STUDIO_ID,"Grade 1",3])},
    ${a([k.g2,t.STUDIO_ID,"Grade 2",4])},
    ${a([k.g3,t.STUDIO_ID,"Grade 3",5])},
    ${a([k.inter,t.STUDIO_ID,"Intermediate",6])};`),`select set_config('app.quiet', 'on', false);
`+S.join("\n")+"\n"+function(e){let s,n,r,o,{termId:c,base:m,LOC:h,ROOM:_,STAFF:p,STYLE:f,LEVEL:S,guardianUsers:y}=e,g=[],w=e=>e.toISOString().slice(0,10),b=(e,t)=>{let i=new Date(e);return i.setUTCDate(i.getUTCDate()+t),i},v=42,I=()=>(v=(1664525*v+0x3c6ef35f)%0x100000000)/0x100000000,D=e=>e[Math.floor(I()*e.length)],k=[],A=l.map((e,i)=>{let s=(0,t.uid)(t.NS.class,i+1);return k.push(s),a([s,t.STUDIO_ID,c,f[e[1]],S[e[2]],h[e[3]],_[e[4]],p[e[5]],e[0],e[6],e[7],e[8],e[9],e[10],e[11],e[12],"term",0,!0,!0,"public",d(e[0])?.[1]??null,d(e[0])?.[2]??null,d(e[0])?.[3]??null])});s=`insert into class (id,studio_id,term_id,dance_style_id,level_id,location_id,room_id,teacher_id,name,day_of_week,start_time,duration_min,capacity,age_min,age_max,price_minor,pricing,trial_price_minor,trials_enabled,waitlist_enabled,visibility,description,level_note,what_to_bring) values
    ${A.join(",\n    ")};`,g.push(s),k.forEach(e=>{let t;return t=`select app.generate_class_sessions('${e}');`,g.push(t)});let N=[5,9,7,11,6,10,8,12,4,9,7,11,5,10,6,12,8,9,3,10,7,11,13,9,5,12,6,10,14,11,4,9,8,12,7,10,15,11,6,9,5,13,16,12,8,10,7,11,17,9,4,12,6,10,14,13,5,9,7,11,3,8,15,12,6,10,16,9,7,11,5,12,9,10,8,13],T=["Ava","Isla","Maya","Nia","Sofia","Amara","Elsie","Lily","Zara","Rosa","Iris","Willow","Esme","Bea","Anaya","Clara","Nell","Sena","Ottilie","Marnie"],$=["Noah","Kai","Elias","Theo","Jonah","Amir","Luca","Reuben","Idris","Milo","Arlo","Rafe"],O=["Hannah","Joseph","Clare","Marta","Abena","Rachel","Sana","Inês","Petra","Emma","Thandi","Alex","Grace","Duncan","Yuki","Aoife","Kwabena","Giulia","Nikolai","Elin","Rana","Camille","Sinead","Fatima","Robert","Bunmi","Iona","Chiara","Zanele","Paula"],U=[],x=[],B=[],C=[],E=0,j=0,G=0;return["Wright","Adeyemi","Doherty","Kaminski","Osei","Bennett","Hussain","Ferreira","Novak","Whitfield","Mbeki","Grant","Sullivan","Ellery","Nakamura","Byrne","Ackah","Salvatore","Petrov","Lindgren","Haddad","Moreau","Quinn","Ibrahim","Fenwick","Oyelaran","Mackenzie","Rossi","Dlamini","Torres"].forEach((e,i)=>{let s=(0,t.uid)(t.NS.family,i+1);U.push(a([s,t.STUDIO_ID,`${e} family`,`${4+3*i} ${D(["Ashburnham Grove","Egerton Drive","Royal Hill","Tranquil Vale","Blackheath Road","Creek Road","Deptford High Street","Lewisham Way"])}`,"London",D(["SE8 4AA","SE10 8QY","SE3 0BU","SE13 7LN","SE8 3BU"])]));let n=i<3?y[i][0]:null;G+=1,x.push(a([(0,t.uid)(t.NS.guardian,G),t.STUDIO_ID,s,n,`${O[i]} ${e}`,n?y[i][1]:`${O[i].toLowerCase().normalize("NFD").replace(/[^a-z]/g,"")}.${e.toLowerCase()}@example.com`,`07${700+i}${String(1e5+7919*i).slice(0,6)}`,D(["Mother","Father","Guardian"]),!0,!0])),i%2==0&&(G+=1,x.push(a([(0,t.uid)(t.NS.guardian,G),t.STUDIO_ID,s,null,`${O[(i+7)%O.length]} ${e}`,`second.${e.toLowerCase()}@example.com`,`07${800+i}${String(2e5+5417*i).slice(0,6)}`,"Parent",!1,!1])));let r=i%6==0?3:i%2==0?2:1;for(let n=0;n<r;n++){E+=1;let r=(0,t.uid)(t.NS.student,E),o=i<3&&0===n?[15,14,16][i]:N[j++%N.length],d=I()>.26,l=d?T[(7*E+n)%T.length]:$[(5*E+n)%$.length],u=0;for(;C.some(e=>e.famIdx===i&&e.name.startsWith(l+" "))&&u<20;)u+=1,l=d?T[(7*E+n+u)%T.length]:$[(5*E+n+u)%$.length];C.push({id:r,famIdx:i,age:o,name:`${l} ${e}`}),B.push(a([r,t.STUDIO_ID,s,l,e,null,w(b(m,-(365*o+Math.floor(320*I())))),null,w(b(m,-Math.floor(900*I())-30))]))}}),n=`insert into family (id,studio_id,name,address_line1,city,postcode) values
    ${U.join(",\n    ")};`,g.push(n),r=`insert into guardian (id,studio_id,family_id,user_id,full_name,email,phone,relationship,is_primary,receives_billing) values
    ${x.join(",\n    ")};`,g.push(r),o=`insert into student (id,studio_id,family_id,first_name,last_name,preferred_name,date_of_birth,pronouns,joined_on) values
    ${B.join(",\n    ")};`,g.push(o),g.join("\n")+"\n"+function(e){let s,n,r,o,d,c,m,h,_,{base:p,classIds:f,students:S,rnd:y,STAFF:g}=e,w=[],b=e=>e.toISOString().slice(0,10),v=(e,t)=>{let i=new Date(e);return i.setUTCDate(i.getUTCDate()+t),i},I=[],D=[],k=0,A=0,N=new Map;l.forEach((e,i)=>{let s=f[i],n=e[9],r=e[10],o=e[11],d=Math.round(n*e[13]),l=S.filter(e=>e.age>=r&&e.age<=o).sort((e,t)=>e.id+s<t.id+s?-1:1),u=new Set;for(let e of l){if(u.size>=d)break;u.add(e.id),k+=1,I.push(a([(0,t.uid)(t.NS.enrolment,k),t.STUDIO_ID,s,e.id,"active",b(v(p,-Math.floor(45*y())-5))]))}N.set(s,u),3===i&&l.filter(e=>!u.has(e.id)).slice(0,8).forEach((e,i)=>{A+=1,D.push(a([(0,t.uid)(t.NS.waitlist,A),t.STUDIO_ID,s,e.id,"waiting",i+1]))})}),s=`insert into enrolment (id,studio_id,class_id,student_id,status,started_on) values
    ${I.join(",\n    ")};`,w.push(s),n=`insert into waitlist_entry (id,studio_id,class_id,student_id,status,position) values
    ${D.join(",\n    ")};`,w.push(n),S.slice(-4).forEach((e,t)=>{let a;a=`update enrolment set status = 'left', ended_on = ${i(b(v(p,-(5*t+6))))}
            where student_id = ${i(e.id)} and status = 'active';`,w.push(a)}),r=`
insert into attendance_record (studio_id, session_id, student_id, status, marked_by, marked_at)
select e.studio_id, cs.id, e.student_id,
       case (('x' || substr(md5(cs.id::text || e.student_id::text), 1, 7))::bit(28)::int % 100)
         when 0 then 'absent'::attendance_status
         else case
           when (('x' || substr(md5(cs.id::text || e.student_id::text), 1, 7))::bit(28)::int % 100) < 5  then 'absent'::attendance_status
           when (('x' || substr(md5(cs.id::text || e.student_id::text), 1, 7))::bit(28)::int % 100) < 9  then 'late'::attendance_status
           when (('x' || substr(md5(cs.id::text || e.student_id::text), 1, 7))::bit(28)::int % 100) < 12 then 'excused'::attendance_status
           else 'present'::attendance_status end
       end,
       null, cs.starts_at + interval '10 minutes'
  from class_session cs
  join enrolment e on e.class_id = cs.class_id and e.status = 'active' and e.deleted_at is null
 where cs.starts_at < now() and cs.status = 'scheduled'
on conflict do nothing;`,w.push(r),o=`
with one_class_each as (
  select distinct on (e.student_id) e.student_id, e.class_id
    from enrolment e
   where e.status = 'active' and e.deleted_at is null
   order by e.student_id, e.class_id
),
picked as (
  select student_id, class_id, row_number() over (order by student_id) as rn
    from one_class_each
),
last_three as (
  select ar.id,
         row_number() over (partition by ar.student_id, cs.class_id
                                order by cs.starts_at desc) as k
    from attendance_record ar
    join class_session cs on cs.id = ar.session_id
    join picked p on p.student_id = ar.student_id and p.class_id = cs.class_id and p.rn <= 9
   where cs.starts_at < now()
)
update attendance_record set status = 'absent'
 where id in (select id from last_three where k <= 3);`,w.push(o);let T=["enrolled","enrolled","enrolled","enrolled","enrolled","enrolled","enrolled","trial_attended","trial_attended","trial_attended","trial_attended","trial_booked","trial_booked","trial_missed","follow_up","enquiry","enquiry","enquiry"],$=["converted","converted","converted","converted","converted","converted","converted","attended","attended","attended","attended","booked","booked","missed",null,null,null,null],O=[],U=[];return[["Rebecca Miles","rebecca.miles@example.com","Orla Miles",6,1],["Daniel Osei","daniel.osei@example.com","Kofi Osei",8,8],["Yasmin Patel","yasmin.patel@example.com","Anya Patel",10,3],["Grace Sullivan","grace.sullivan@example.com","Erin Sullivan",7,4],["Michael Chen","michael.chen@example.com","Lucy Chen",11,10],["Aisha Rahman","aisha.rahman@example.com","Zainab Rahman",5,0],["Tom Bradshaw","tom.bradshaw@example.com","Sam Bradshaw",9,3],["Lena Fischer","lena.fischer@example.com","Mika Fischer",12,10],["Owen Pritchard","owen.pritchard@example.com","Bryn Pritchard",6,8],["Nadia Haddad","nadia.haddad@example.com","Layla Haddad",9,6],["Sam Okonkwo","sam.okonkwo@example.com","Ada Okonkwo",14,9],["Ruth Kelleher","ruth.kelleher@example.com","Fionn Kelleher",7,4],["Priti Shah","priti.shah@example.com","Diya Shah",10,3],["James Attwood","james.attwood@example.com","Ivy Attwood",5,0],["Marie Lefevre","marie.lefevre@example.com","Colette Lefevre",8,6],["Bola Adenuga","bola.adenuga@example.com","Tayo Adenuga",11,9],["Heather Ross","heather.ross@example.com","Skye Ross",6,1],["Vikram Nair","vikram.nair@example.com","Meera Nair",13,7]].forEach((e,i)=>{let s=(0,t.uid)(t.NS.enquiry,i+1),n=f[e[4]];O.push(a([s,t.STUDIO_ID,T[i],e[0],e[1],`079${String(1e7+131071*i).slice(0,8)}`,e[2],b(v(p,-(365*e[3]))),n,["Website","Instagram","Word of mouth","Walk-in"][i%4],b(v(p,i%9+1))])),$[i]&&U.push(a([(0,t.uid)(t.NS.trial,i+1),t.STUDIO_ID,n,null,null,s,$[i],0,"attended"===$[i]||"converted"===$[i]?v(p,-(i%9+2)).toISOString():null]))}),d=`insert into enquiry (id,studio_id,stage,contact_name,contact_email,contact_phone,child_name,child_dob,interest_class_id,source,next_action_on) values
    ${O.join(",\n    ")};`,w.push(d),c=`insert into trial (id,studio_id,class_id,session_id,student_id,enquiry_id,status,price_minor,attended_at) values
    ${U.join(",\n    ")};`,w.push(c),m=`
update trial t set session_id = (
  select cs.id from class_session cs
   where cs.class_id = t.class_id and cs.starts_at > now() and cs.status = 'scheduled'
   order by cs.starts_at limit 1)
 where t.session_id is null and t.status = 'booked';`,w.push(m),h=`
update class_session set status = 'cancelled',
       cancel_reason = 'Teacher unwell — this week only'
 where id = (select id from class_session
              where starts_at between now() + interval '1 day' and now() + interval '6 days'
              order by starts_at limit 1);`,w.push(h),_=`
update class_session set teacher_id = '${g.priya}'
 where id = (select cs.id from class_session cs join class c on c.id = cs.class_id
              where c.teacher_id = '${g.marcus}' and cs.starts_at > now()
              order by cs.starts_at limit 1);`,w.push(_),w.join("\n")+"\n"+function(e){let{base:s,students:n,classIds:r}=e,o=[],d=e=>e.toISOString().slice(0,10),l=(e,t)=>{let i=new Date(e);return i.setUTCDate(i.getUTCDate()+t),i},c=[[2,"Peanuts, tree nuts","Asthma","Blue inhaler","EpiPen is in the red pouch in her bag. Use it, then call 999 and the studio phone.",!0],[11,null,"Type 1 diabetes","Insulin pump","Check the pump before class. Juice carton in her bag if she seems shaky or pale.",!0],[19,"Plasters (latex)",null,null,"Non-latex plasters only.",!1],[27,null,"Mild eczema","Emollient cream","Apply cream if skin flares after class.",!1],[34,"Dairy",null,null,"No milk-based snacks at the studio.",!1]].filter(([e])=>n[e]).map(([e,i,s,r,o,d],l)=>a([(0,t.uid)(t.NS.medical,l+1),t.STUDIO_ID,n[e].id,i,s,r,o,d]));o.push(`insert into medical_record (id,studio_id,student_id,allergies,conditions,medications,action_plan,requires_alert) values
    ${c.join(",\n    ")};`);let m=n.slice(0,40).map((e,i)=>a([(0,t.uid)(t.NS.emergency,i+1),t.STUDIO_ID,e.id,["Grandma Pat","Uncle Dave","Aunt Sarah","Neighbour Ruth","Grandad Bill"][i%5],["Grandmother","Uncle","Aunt","Family friend","Grandfather"][i%5],`07${900+i%90}${String(3e5+3571*i).slice(0,6)}`,1]));o.push(`insert into emergency_contact (id,studio_id,student_id,full_name,relationship,phone,priority) values
    ${m.join(",\n    ")};`);let h=n.map((e,i)=>a([(0,t.uid)(t.NS.consent,i+1),t.STUDIO_ID,e.id,"photography",i%6!=0]));o.push(`insert into consent_record (id,studio_id,student_id,kind,granted) values
    ${h.join(",\n    ")};`);let _=[],p=[],f=[];for(let e=0;e<30;e++){let i=(0,t.uid)(t.NS.family,e+1),n=(0,t.uid)(t.NS.invoice,e+1),r=5400+e%5*1800,o=e<22?"paid":e<27?"issued":"part_paid",u="paid"===o?r:"part_paid"===o?Math.round(r/2):0;_.push(a([n,t.STUDIO_ID,i,`INV-${String(1041+e)}`,o,d(l(s,-21)),d(l(s,-7)),r,0,r,u])),p.push(a([(0,t.uid)(t.NS.item,e+1),t.STUDIO_ID,n,"tuition","Termly tuition",1,r,0])),u>0&&f.push(a([(0,t.uid)(t.NS.payment,e+1),t.STUDIO_ID,i,n,u,"card","stripe",null,null,l(s,-20).toISOString()])),e>=27&&f.push(a([(0,t.uid)(t.NS.payment,100+e),t.STUDIO_ID,i,n,r-u,"card","stripe",null,"card_declined",null]))}o.push(`insert into invoice (id,studio_id,family_id,number,status,issued_on,due_on,subtotal_minor,discount_minor,total_minor,paid_minor) values
    ${_.join(",\n    ")};`),o.push(`insert into invoice_item (id,studio_id,invoice_id,kind,description,quantity,unit_minor,discount_minor) values
    ${p.join(",\n    ")};`),o.push(`insert into payment (id,studio_id,family_id,invoice_id,amount_minor,method,provider,provider_ref,failure_code,succeeded_at) values
    ${f.join(",\n    ")};`),o.push(`update family f set balance_minor = coalesce((
          select sum(i.total_minor - i.paid_minor) from invoice i
           where i.family_id = f.id and i.status in ('issued','part_paid')), 0);`),o.push(`insert into communication (id,studio_id,kind,channel,family_id,class_id,subject,body,sent_at) values
    ${a([(0,t.uid)(t.NS.comm,1),t.STUDIO_ID,"studio_announcement","in_app",null,null,"Summer show — save the date","Our summer show is on Saturday 11 July at the Greenwich Theatre. Tickets go on sale to families two weeks before general release. Costume measurements will be taken in class over the next fortnight.",l(s,-3).toISOString()])},
    ${a([(0,t.uid)(t.NS.comm,2),t.STUDIO_ID,"class_broadcast","in_app",null,r[3],"Grade 3 Ballet — exam preparation","We are into the exam preparation weeks now. Please make sure hair is in a secure bun, and check that ballet shoes still fit — several have got tight since the start of term.",l(s,-2).toISOString()])},
    ${a([(0,t.uid)(t.NS.comm,3),t.STUDIO_ID,"direct","in_app",(0,t.uid)(t.NS.family,1),null,"Absence on Monday","Just to let you know Clara will miss Monday's class — she is on a school trip. Back the following week.",l(s,-1).toISOString()])},
    ${a([(0,t.uid)(t.NS.comm,4),t.STUDIO_ID,"direct","in_app",(0,t.uid)(t.NS.family,3),null,"Re: moving up a grade","Thank you for the chat after class. I agree she is ready for the next grade in January — I will hold a place.",l(s,-5).toISOString()])},
    ${a([(0,t.uid)(t.NS.comm,5),t.STUDIO_ID,"class_broadcast","in_app",null,r[9],"Street Seniors — new routine","We start the new routine this week. Bring trainers with a clean sole, and a water bottle. It is a fast one.",l(s,-4).toISOString()])};`);let S=e=>new Date(Date.now()-36e5*e).toISOString(),y=(0,t.uid)(t.NS.user,5),g=(0,t.uid)(t.NS.user,1);return o.push(`update communication set inbound = true, sent_by = ${a([(0,t.uid)(t.NS.user,11)])}
         where id = ${a([(0,t.uid)(t.NS.comm,3)])};
        update communication set sent_by = ${a([g])} where id = ${a([(0,t.uid)(t.NS.comm,4)])};
        update communication set sent_by = ${a([g])} where kind <> 'direct' and sent_by is null;`),o.push(`insert into communication (id,studio_id,kind,channel,family_id,subject,body,sent_by,inbound,sent_at) values
    ${a([(0,t.uid)(t.NS.comm,30),t.STUDIO_ID,"direct","in_app",(0,t.uid)(t.NS.family,1),null,"Thanks for letting us know. Hope the trip is fun — we will save her spot at the barre.",y,!1,S(20)])},
    ${a([(0,t.uid)(t.NS.comm,31),t.STUDIO_ID,"direct","in_app",(0,t.uid)(t.NS.family,2),"Tap shoes","Hi — Idris has outgrown his tap shoes again. Do you sell them at the studio, or is there a shop you would recommend?",(0,t.uid)(t.NS.user,12),!0,S(3)])},
    ${a([(0,t.uid)(t.NS.comm,32),t.STUDIO_ID,"direct","in_app",(0,t.uid)(t.NS.family,3),null,"That is wonderful, thank you. She is thrilled. Is there anything we should practise over the holidays?",(0,t.uid)(t.NS.user,13),!0,S(26)])},
    ${a([(0,t.uid)(t.NS.comm,33),t.STUDIO_ID,"direct","in_app",(0,t.uid)(t.NS.family,5),"Show costume sizes","We missed the measuring session last week. Could Sofia be measured before Grade 3 on Saturday?",null,!0,S(6)])},
    ${a([(0,t.uid)(t.NS.comm,34),t.STUDIO_ID,"direct","in_app",(0,t.uid)(t.NS.family,8),"Parking at Blackheath","Is there anywhere to park near the Blackheath studio on a Saturday morning? We are new to the area.",null,!0,S(50)])},
    ${a([(0,t.uid)(t.NS.comm,35),t.STUDIO_ID,"direct","in_app",(0,t.uid)(t.NS.family,8),null,"Welcome! The church car park on Lee Road is free before 1pm on Saturdays, and only a two-minute walk.",y,!1,S(47)])};`),o.push(`update communication set reply_to = ${a([(0,t.uid)(t.NS.comm,3)])} where id = ${a([(0,t.uid)(t.NS.comm,30)])};`),o.push(`insert into communication_read (communication_id, user_id)
        select c.id, u.id from communication c cross join (values (${a([y])}::uuid), (${a([g])}::uuid)) u(id)
         where c.id in (${[3,4,30,34,35].map(e=>a([(0,t.uid)(t.NS.comm,e)])).join(",")});`),o.push(`insert into communication_template (id,studio_id,name,subject,body) values
    ${a([(0,t.uid)(t.NS.comm,20),t.STUDIO_ID,"Trial confirmation","Your trial class is booked","Hello {{guardian_name}},\n\nWe have booked {{child_name}} into {{class_name}} on {{session_date}} at {{session_time}}.\n\nPlease arrive five minutes early. Comfortable clothes and bare feet or socks are perfectly fine for a first class.\n\nSee you then,\nNorthstar Dance Academy"])},
    ${a([(0,t.uid)(t.NS.comm,21),t.STUDIO_ID,"Trial follow-up","How did {{child_name}} get on?","Hello {{guardian_name}},\n\nWe loved having {{child_name}} in {{class_name}}. If they would like to carry on, we can hold their place for a week.\n\nJust reply here and we will sort it out.\n\nNorthstar Dance Academy"])},
    ${a([(0,t.uid)(t.NS.comm,22),t.STUDIO_ID,"Payment reminder","Invoice {{invoice_number}} is due","Hello {{guardian_name}},\n\nInvoice {{invoice_number}} for {{amount}} was due on {{due_date}}. You can pay from the Payments tab.\n\nIf something has gone wrong with the payment, tell us and we will help.\n\nNorthstar Dance Academy"])},
    ${a([(0,t.uid)(t.NS.comm,23),t.STUDIO_ID,"Waiting list offer","A place has come up in {{class_name}}","Hello {{guardian_name}},\n\nA place has become available in {{class_name}}. We can hold it for {{child_name}} until {{expires_at}}.\n\nLet us know either way and we will pass it on if it is not right for you.\n\nNorthstar Dance Academy"])},
    ${a([(0,t.uid)(t.NS.comm,24),t.STUDIO_ID,"Trial reminder","{{child_name}}’s trial is on {{session_date}}","Hello {{guardian_name}},\n\nA reminder that {{child_name}} is trying {{class_name}} on {{session_date}} at {{session_time}}. Comfortable clothes are perfect, and please arrive five minutes early.\n\nIf you can no longer make it, just reply and we will find another date.\n\nNorthstar Dance Academy"])},
    ${a([(0,t.uid)(t.NS.comm,25),t.STUDIO_ID,"Trial today","See you at {{session_time}}","Hello {{guardian_name}},\n\nWe are looking forward to meeting {{child_name}} at {{class_name}} today at {{session_time}}.\n\nNorthstar Dance Academy"])},
    ${a([(0,t.uid)(t.NS.comm,26),t.STUDIO_ID,"Missed trial","We missed {{child_name}}","Hello {{guardian_name}},\n\nWe were sorry not to see {{child_name}} at {{class_name}}. Would another date suit better? Reply here and we will hold a place.\n\nNorthstar Dance Academy"])};`),o.push(`insert into automation_rule (studio_id, event, template_id, enabled) values
    ${a([t.STUDIO_ID,"trial_booked",(0,t.uid)(t.NS.comm,20),!0])},
    ${a([t.STUDIO_ID,"trial_reminder_48h",(0,t.uid)(t.NS.comm,24),!0])},
    ${a([t.STUDIO_ID,"trial_reminder_same_day",(0,t.uid)(t.NS.comm,25),!0])},
    ${a([t.STUDIO_ID,"trial_attended",(0,t.uid)(t.NS.comm,21),!0])},
    ${a([t.STUDIO_ID,"trial_missed",(0,t.uid)(t.NS.comm,26),!1])},
    ${a([t.STUDIO_ID,"waitlist_offer",(0,t.uid)(t.NS.comm,23),!0])};`),o.push(`insert into notification (id,studio_id,user_id,kind,title,body,href) values
    ${a([(0,t.uid)(t.NS.notification,1),t.STUDIO_ID,(0,t.uid)(t.NS.user,1),"payment_failed","Demo: 3 sample card declines","Sample data only. Card payments are not connected, so no card has really been declined.","/billing"])},
    ${a([(0,t.uid)(t.NS.notification,2),t.STUDIO_ID,(0,t.uid)(t.NS.user,1),"waitlist","Grade 3 Ballet is full","8 students are waiting for a place.","/classes"])},
    ${a([(0,t.uid)(t.NS.notification,3),t.STUDIO_ID,(0,t.uid)(t.NS.user,1),"medical_updated","Medical details updated","A guardian updated an allergy record this week.","/people"])};`),o.join("\n")+"\n"+function(e){let s,n,r,o,d,l,c,m,h,_,{base:p,students:f,classIds:S,STAFF:y,STYLE:g,LEVEL:w}=e,b=[],v=(e,t)=>{let i=new Date(e);return i.setUTCDate(i.getUTCDate()+t),i};[1,2,3].forEach((e,a)=>{let s,n,r,o=(0,t.uid)(t.NS.user,40+a);s=`
insert into user_account (id, email, full_name)
select ${i(o)},
       lower(s.first_name) || '.' || lower(s.last_name) || '@example.com',
       s.first_name || ' ' || s.last_name
  from student s
 where s.family_id = ${i((0,t.uid)(t.NS.family,e))}
   and extract(year from age(current_date, s.date_of_birth)) >= 14
 order by s.date_of_birth limit 1;`,b.push(s),n=`
insert into membership (id, user_id, studio_id, role)
select ${i((0,t.uid)(t.NS.membership,40+a))}, ${i(o)}, ${i(t.STUDIO_ID)}, 'student'
 where exists (select 1 from user_account where id = ${i(o)});`,b.push(n),r=`
update student s
   set user_id = ${i(o)},
       login_enabled = true,
       login_approved_by = (select g.user_id from guardian g
                             where g.family_id = s.family_id and g.user_id is not null
                             order by g.is_primary desc limit 1),
       login_approved_at = now()
 where s.id = (select s2.id from student s2
                where s2.family_id = ${i((0,t.uid)(t.NS.family,e))}
                  and extract(year from age(current_date, s2.date_of_birth)) >= 14
                order by s2.date_of_birth limit 1)
   and exists (select 1 from user_account where id = ${i(o)});`,b.push(r)}),s=`
insert into enrolment (studio_id, class_id, student_id, status, started_on)
select s.studio_id, c.id, s.id, 'active', current_date - 30
  from student s
  cross join lateral (
    select c2.id from class c2
     where c2.deleted_at is null
       and extract(year from age(current_date, s.date_of_birth)) between c2.age_min and c2.age_max
       and app.class_enrolled_count(c2.id) < c2.capacity
     order by c2.day_of_week limit 2) c
 where s.login_enabled
   and not exists (select 1 from enrolment e
                    where e.student_id = s.id and e.status = 'active' and e.deleted_at is null)
on conflict do nothing;`,b.push(s),n=`
insert into attendance_record (studio_id, session_id, student_id, status, marked_at)
select e.studio_id, cs.id, e.student_id,
       case when (('x' || substr(md5(cs.id::text || e.student_id::text), 1, 7))::bit(28)::int % 100) < 12
            then 'late'::attendance_status else 'present'::attendance_status end,
       cs.starts_at + interval '10 minutes'
  from class_session cs
  join enrolment e on e.class_id = cs.class_id and e.status = 'active'
  join student s on s.id = e.student_id and s.login_enabled
 where cs.starts_at < now() and cs.status = 'scheduled'
on conflict do nothing;`,b.push(n),[["Really strong week","Your timing in the fast section is spot on now, and you kept the shoulders down through the whole barre.","Spotting on the turns — pick one point on the back wall and stay with it."],["Good progress","You picked the new routine up quickly and helped two others with the counts.","Land more quietly. Think about rolling through the foot rather than dropping onto it."]].forEach(([e,t,a],s)=>{let n;n=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well, work_on,
                           shared_at, share_with_student, share_with_guardian, created_at)
select s.studio_id, s.id, e.class_id, c.teacher_id, ${i(e)}, ${i(t)}, ${i(a)},
       now() - interval '${7*s+2} days', true, true, now() - interval '${7*s+2} days'
  from student s
  join enrolment e on e.student_id = s.id and e.status = 'active' and e.deleted_at is null
  join class c on c.id = e.class_id
 where s.login_enabled
   and e.id = (select e2.id from enrolment e2 where e2.student_id = s.id
                and e2.status = 'active' and e2.deleted_at is null order by e2.id limit 1);`,b.push(n)}),[["Plié — all positions","secure"],["Port de bras","mastered"],["Pirouette en dehors","developing"],["Musicality and timing","secure"],["Grand jeté","developing"],["Reverence","not_started"]].forEach(([e,t])=>{let a;a=`
insert into skill_assessment (studio_id, student_id, dance_style_id, skill, level, assessed_by, assessed_on)
select s.studio_id, s.id, ${i(g.ballet)}, ${i(e)}, ${i(t)}::assessment_level,
       (select id from staff_member where display_name = 'Freya Lindqvist' limit 1),
       current_date - 4
  from student s where s.login_enabled;`,b.push(a)}),r=`insert into resource (id,studio_id,kind,title,category,url,poster_url,duration_sec,description,created_by) values
    ${[[1,"video","Grade 3 barre — full exercise","Technique","https://vimeo.com/76979871",null,742,1],[2,"video","Port de bras, slowly","Technique","https://vimeo.com/76979871",null,305,1],[3,"video","Summer show routine — Street Seniors","Choreography","https://vimeo.com/76979871",null,218,4],[4,"video","Tap: shuffle drills at three speeds","Technique","https://vimeo.com/76979871",null,411,2],[5,"audio","Grade 3 exam music — full","Exam music","https://example.com/tracks/grade3-full.mp3",null,1680,1],[6,"audio","Grade 3 exam music — barre only","Exam music","https://example.com/tracks/grade3-barre.mp3",null,620,1],[7,"audio","Street Seniors show track (clean edit)","Show music","https://example.com/tracks/street-show.mp3",null,194,4],[8,"audio","Warm-up mix","Class music","https://example.com/tracks/warmup.mp3",null,540,5],[9,"document","Uniform and shoes — what to buy","Uniform","https://example.com/docs/uniform.pdf",null,null,5],[10,"document","Exam day: what to expect","Exams","https://example.com/docs/exam-day.pdf",null,null,5],[11,"document","Competition packing list","Competitions","https://example.com/docs/packing.pdf",null,null,5],[12,"link","How to do a secure bun","Uniform","https://example.com/guides/bun",null,null,5],[13,"document","Stretching safely at home","Wellbeing","https://example.com/docs/stretching.pdf",null,null,5]].map(e=>a([(0,t.uid)(t.NS.resource,e[0]),t.STUDIO_ID,e[1],e[2],e[3],e[4],e[5],e[6],"audio"===e[1]?"Play or download for practice at home.":"video"===e[1]?"Watch as many times as you like — the counts are called out.":"Everything you need in one page.",(0,t.uid)(t.NS.user,e[7])])).join(",\n    ")};`,b.push(r);let I=[[1,1,"class",S[3]],[2,2,"class",S[3]],[3,3,"class",S[9]],[4,4,"class",S[4]],[5,5,"class",S[3]],[6,6,"class",S[3]],[7,7,"class",S[9]],[8,8,"studio",null],[9,9,"studio",null],[10,10,"studio",null],[11,11,"studio",null],[12,12,"studio",null],[13,13,"studio",null]];o=`insert into resource_assignment (id,studio_id,resource_id,scope,class_id) values
    ${I.map(e=>a([(0,t.uid)(t.NS.assignment,e[0]),t.STUDIO_ID,(0,t.uid)(t.NS.resource,e[1]),e[2],e[3]])).join(",\n    ")};`,b.push(o),d=`update resource set for_all_staff = true where id in (${I.filter(e=>"studio"===e[2]).map(e=>i((0,t.uid)(t.NS.resource,e[1]))).join(",")});
update resource set shows_children = true where id = ${i((0,t.uid)(t.NS.resource,3))};
insert into resource_child (studio_id, resource_id, student_id)
select e.studio_id, ${i((0,t.uid)(t.NS.resource,3))}::uuid, e.student_id from enrolment e
 where e.class_id = ${i(S[9])} and e.status = 'active' and e.deleted_at is null
 order by e.student_id limit 2;`,b.push(d);let D=[[14,5,"audio","Junior Tap — count-in (8 bars)","Class music","junior-tap-count-in.wav",2,12,"Clap along at home. Eight bars in, then the shuffle starts on one."],[15,5,"document","Junior Tap — this term at a glance","Term plan","junior-tap-term-plan.pdf",2,null,"One page: what we cover each week, and what to practise."]];return l=`insert into resource (id,studio_id,kind,title,category,storage_path,duration_sec,description,created_by) values
    ${D.map(e=>a([(0,t.uid)(t.NS.resource,e[0]),t.STUDIO_ID,e[2],e[3],e[4],`local:${(0,t.uid)(t.NS.file,e[0])}`,e[7],e[8],(0,t.uid)(t.NS.user,e[6])])).join(",\n    ")};`,b.push(l),c=`insert into resource_file (id,studio_id,resource_id,file_name,mime_type,size_bytes,bytes,uploaded_by) values
    ${D.map(e=>{let a="audio"===e[2]?function(){let e=Math.round(4e3),t=8*e,i=new Uint8Array(t);for(let a=0;a<t;a++){let t=a%e,s=t<400?1-t/400:0;i[a]=128+Math.round(60*s*Math.sin(2*Math.PI*1e3*a/8e3))}let a=new Uint8Array(44+t),s=new DataView(a.buffer),n=(e,t)=>{for(let i=0;i<t.length;i++)a[e+i]=t.charCodeAt(i)};return n(0,"RIFF"),s.setUint32(4,36+t,!0),n(8,"WAVEfmt "),s.setUint32(16,16,!0),s.setUint16(20,1,!0),s.setUint16(22,1,!0),s.setUint32(24,8e3,!0),s.setUint32(28,8e3,!0),s.setUint16(32,1,!0),s.setUint16(34,8,!0),n(36,"data"),s.setUint32(40,t,!0),a.set(i,44),a}():function(){let e="BT\n"+[["Junior Tap - this term",20,760],["Northstar Dance Academy",11,738],["Weeks 1-3   Shuffle, ball change, and keeping the knees soft.",11,700],["Weeks 4-6   Time steps at two speeds. Counts called out loud.",11,682],["Weeks 7-9   The routine, section by section.",11,664],["Weeks 10-12 Whole routine, then the end-of-term showing.",11,646],["At home     Five minutes of shuffles. Little and often beats an hour",11,610],["            the night before.",11,594]].map(([e,t,i])=>`/F1 ${t} Tf 1 0 0 1 62 ${i} Tm (${e.replace(/([()\\])/g,"\\$1")}) Tj`).join("\n")+"\nET\n",t=["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",`<< /Length ${e.length} >>
stream
${e}endstream`,"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"],i="%PDF-1.4\n",a=[];t.forEach((e,t)=>{a.push(i.length),i+=`${t+1} 0 obj
${e}
endobj
`});let s=i.length,n=new Uint8Array((i+=`xref
0 ${t.length+1}
0000000000 65535 f 
`+a.map(e=>`${String(e).padStart(10,"0")} 00000 n 
`).join("")+`trailer
<< /Size ${t.length+1} /Root 1 0 R >>
startxref
${s}
%%EOF
`).length);for(let e=0;e<i.length;e++)n[e]=255&i.charCodeAt(e);return n}();return`(${i((0,t.uid)(t.NS.file,e[0]))},${i(t.STUDIO_ID)},${i((0,t.uid)(t.NS.resource,e[0]))},${i(e[5])},${i("audio"===e[2]?"audio/wav":"application/pdf")},${a.length},'\\x${u(a)}'::bytea,${i((0,t.uid)(t.NS.user,e[6]))})`}).join(",\n    ")};`,b.push(c),m=`insert into resource_assignment (id,studio_id,resource_id,scope,class_id) values
    ${a([(0,t.uid)(t.NS.assignment,14),t.STUDIO_ID,(0,t.uid)(t.NS.resource,14),"class",S[4]])},
    ${a([(0,t.uid)(t.NS.assignment,15),t.STUDIO_ID,(0,t.uid)(t.NS.resource,15),"class",S[4]])},
    ${a([(0,t.uid)(t.NS.assignment,16),t.STUDIO_ID,(0,t.uid)(t.NS.resource,14),"class",S[5]])};`,b.push(m),h=`insert into resource_assignment (studio_id,resource_id,scope,class_id)
select distinct s.studio_id, ${i((0,t.uid)(t.NS.resource,14))}::uuid, 'class'::resource_scope, e.class_id
  from student s
  join enrolment e on e.student_id = s.id and e.status = 'active' and e.deleted_at is null
 where s.login_enabled
   and not exists (select 1 from resource_assignment a
                    where a.resource_id = ${i((0,t.uid)(t.NS.resource,14))} and a.class_id = e.class_id);`,b.push(h),_=`
insert into feedback_note (id, studio_id, student_id, class_id, author_id, headline, going_well, work_on,
                           shared_at, share_with_student, share_with_guardian)
select ${i((0,t.uid)(t.NS.feedback,1))}, e.studio_id, e.student_id, e.class_id, c.teacher_id,
       'placeholder', 'placeholder', 'placeholder', null, true, true
  from enrolment e join class c on c.id = e.class_id
 where false;`,b.push(_),[["Lovely week","Really strong port de bras — the arms finally look unhurried and the shoulders stayed down all lesson.","Spotting on the turns. Pick one point on the back wall and stay with it.",3,0,!0],["Exam prep going well","Knows the whole barre without prompting now, and the timing is secure.","The reverence is rushed. Slow down and finish the arm before you step back.",3,2,!0],["Great energy","Picked up the new eight-count faster than anyone and helped two others with it.","Land more quietly — think about rolling through the foot.",9,6,!0],["Coming along","Much more confident in the centre than last term.","Practise the shuffle drill at the slower speed before trying it fast.",4,4,!0],["Careful this week","Working hard and clearly enjoying it.","Keep the knee tracking over the toe in plié — I will keep an eye on it.",3,4,!1]].forEach(([e,a,s,n,r,o],d)=>{let l;l=`
insert into feedback_note (id, studio_id, student_id, class_id, author_id, headline, going_well, work_on,
                           shared_at, share_with_student, share_with_guardian, created_at)
select ${i((0,t.uid)(t.NS.feedback,d+1))}, e.studio_id, e.student_id, e.class_id, c.teacher_id,
       ${i(e)}, ${i(a)}, ${i(s)},
       ${o?i(v(p,-(d+1)).toISOString()):"null"}, true, true,
       ${i(v(p,-(d+1)).toISOString())}
  from enrolment e join class c on c.id = e.class_id
 where e.class_id = ${i(S[n])} and e.status = 'active' and e.deleted_at is null
 order by e.student_id offset ${r} limit 1;`,b.push(l)}),[["Plié — all positions","secure"],["Port de bras","mastered"],["Pirouette en dehors","developing"],["Grand jeté","developing"],["Musicality and timing","secure"],["Reverence","not_started"]].forEach(([e,a],s)=>{let n;n=`
insert into skill_assessment (id, studio_id, student_id, dance_style_id, skill, level, assessed_by, assessed_on)
select ${i((0,t.uid)(t.NS.assessment,s+1))}, f.studio_id, f.student_id, ${i(g.ballet)}, ${i(e)},
       ${i(a)}::assessment_level, f.author_id, ${i(v(p,-4).toISOString().slice(0,10))}
  from feedback_note f where f.id = ${i((0,t.uid)(t.NS.feedback,1))};`,b.push(n)}),b.push(`
select app.ensure_frameworks(id) from studio;
insert into skill_assessment (studio_id, student_id, dance_style_id, skill, skill_id, level, assessed_by, assessed_on)
select s.studio_id, s.id, f.dance_style_id, fs.name, fs.id,
       (array['mastered','secure','developing','secure','developing','not_started','not_started','not_started','not_started'])[fs.position]::assessment_level,
       (select id from staff_member where display_name = 'Freya Lindqvist' limit 1),
       current_date - 4
  from student s
  join skill_framework f on f.studio_id = s.studio_id and f.deleted_at is null
   and f.dance_style_id in (select c.dance_style_id from enrolment e join class c on c.id = e.class_id
                             where e.student_id = s.id and e.status = 'active' and e.deleted_at is null)
  join framework_skill fs on fs.framework_id = f.id and fs.deleted_at is null and fs.position <= 5
 where s.login_enabled;`),b.join("\n")+"\n"+function(e){let{base:s,classIds:n,STAFF:r,LOC:o}=e,d=[],l=e=>d.push(e),u=e=>e.toISOString().slice(0,10),c=(e,t)=>{let i=new Date(e);return i.setUTCDate(i.getUTCDate()+t),i},m=(e,t)=>`${u(c(s,e))}T${t}:00Z`;l(`insert into studio_event (id,studio_id,kind,status,title,description,starts_at,ends_at,venue,cost_minor,capacity,entries_close_on,requests_open,teacher_id) values
    ${[[1,"competition","Thames Valley Dance Festival","Two days of solos, duets and troupes. Entries close three weeks before — let us know early if you would like to compete.",26,"09:00","Watford Colosseum",null,3500,40],[2,"show","Summer Show — Greenwich Theatre","Our whole-school show. Every class performs. Two rehearsals in the fortnight beforehand.",48,"18:30","Greenwich Theatre",null,1800,null],[3,"exam","RAD Grade 3 Ballet examinations","Examiner visiting the Greenwich studio. Candidates should arrive 30 minutes early, hair in a bun.",19,"10:00","Greenwich Studio",null,6200,14],[4,"workshop","Commercial workshop with a guest choreographer","Open to Street Seniors and Contemporary Seniors. Two hours, finishing with a filmed routine.",12,"14:00","Blackheath Studio",null,2500,24],[5,"rehearsal","Summer Show — full dress rehearsal","Everyone in costume. Please arrive with hair and make-up done.",45,"17:00","Greenwich Theatre",null,null,null]].map(e=>a([(0,t.uid)(t.NS.event,e[0]),t.STUDIO_ID,e[1],"published",e[2],e[3],m(e[4],e[5]),m(e[4],"competition"===e[1]?"17:00":"20:30"),e[6],e[8],e[9],u(c(s,Math.max(1,e[4]-21))),!0,"exam"===e[1]?r.freya:"workshop"===e[1]?r.tomasz:null])).join(",\n    ")};`);for(let e=0;e<4;e++)l(`
insert into studio_event (id, studio_id, kind, status, title, description, starts_at, ends_at,
                          venue, teacher_id, student_id, cost_minor, requests_open)
select ${i((0,t.uid)(t.NS.event,20+e))}, e.studio_id, 'private_lesson', 'published',
       'Private lesson — ' || s.first_name,
       'One-to-one, focusing on exam variations.',
       ${i(m(3+2*e,["16:00","17:00","15:30","18:00"][e]))},
       ${i(m(3+2*e,["16:45","17:45","16:15","18:45"][e]))},
       'Greenwich Studio', c.teacher_id, s.id, 3000, false
  from enrolment e join class c on c.id = e.class_id join student s on s.id = e.student_id
 where e.class_id = ${i(n[3])} and e.status = 'active' and e.deleted_at is null
 order by s.id offset ${e} limit 1;`);return[[1,(0,t.uid)(t.NS.event,1),"confirmed",3,0],[2,(0,t.uid)(t.NS.event,1),"requested",3,6],[3,(0,t.uid)(t.NS.event,3),"confirmed",3,0],[4,(0,t.uid)(t.NS.event,4),"requested",9,0],[5,(0,t.uid)(t.NS.event,4),"confirmed",9,4]].forEach(([e,a,r,o,d],u)=>{let m="confirmed"===r?6:3;l(`
insert into event_participant (id, studio_id, event_id, student_id, status, decided_by, decided_at)
select gen_random_uuid(), e.studio_id, ${i(a)}, e.student_id, ${i(r)}::participant_status,
       ${"confirmed"===r?i((0,t.uid)(t.NS.user,1)):"null"},
       ${"confirmed"===r?i(c(s,-5).toISOString()):"null"}
  from enrolment e
 where e.class_id = ${i(n[o])} and e.status = 'active' and e.deleted_at is null
 order by e.student_id offset ${d} limit ${m}
on conflict (event_id, student_id) do nothing;`)}),l(`
insert into event_participant (studio_id, event_id, student_id, status, decided_by, decided_at)
select ev.studio_id, ev.id, ev.student_id, 'confirmed', ${i((0,t.uid)(t.NS.user,1))}, now()
  from studio_event ev
 where ev.kind = 'private_lesson' and ev.student_id is not null
on conflict (event_id, student_id) do nothing;`),l(`
insert into studio_event (id, studio_id, kind, status, title, description, starts_at, ends_at, venue, cost_minor, requests_open)
values (${i((0,t.uid)(t.NS.event,6))}, ${i(t.STUDIO_ID)}, 'show', 'published', 'Winter Showcase — Blackheath',
        'An evening showcase for Junior Tap, Grade 3 Ballet and Street Juniors.', ${i(m(33,"18:00"))}, ${i(m(33,"20:00"))},
        'Blackheath Community Hall', 1200, false);
insert into event_participant (studio_id, event_id, student_id, status, invited_class_id, decided_by, decided_at)
select distinct on (e.student_id) e.studio_id, ${i((0,t.uid)(t.NS.event,6))}, e.student_id, 'confirmed', e.class_id, ${i((0,t.uid)(t.NS.user,1))}, now()
  from enrolment e where e.class_id in (${[3,4,8].map(e=>i(n[e])).join(",")}) and e.status = 'active' and e.deleted_at is null
 order by e.student_id, e.class_id
on conflict (event_id, student_id) do nothing;
insert into event_routine (studio_id, event_id, class_id, title, position, music, duration_sec) values
  (${i(t.STUDIO_ID)}, ${i((0,t.uid)(t.NS.event,6))}, ${i(n[4])}, 'Tap Happy', 1, 'Sing, Sing, Sing (edit)', 190),
  (${i(t.STUDIO_ID)}, ${i((0,t.uid)(t.NS.event,6))}, ${i(n[3])}, 'Waltz of the Flowers', 2, 'Tchaikovsky, Waltz of the Flowers', 240),
  (${i(t.STUDIO_ID)}, ${i((0,t.uid)(t.NS.event,6))}, ${i(n[3])}, 'Mazurka', 3, 'Character mazurka', 150),
  (${i(t.STUDIO_ID)}, ${i((0,t.uid)(t.NS.event,6))}, ${i(n[8])}, 'Level Up', 4, 'Clean radio edit', 200);
insert into costume_item (studio_id, event_id, routine_id, name, price_minor, charge_families)
select ${i(t.STUDIO_ID)}, r.event_id, r.id, v.name, v.price, v.charge
  from event_routine r join (values ('Tap Happy', 'Red waistcoat', 1500, true), ('Waltz of the Flowers', 'Flower dress', 2400, true),
                                    ('Mazurka', 'Character skirt', 0, false)) v(routine, name, price, charge) on v.routine = r.title
 where r.event_id = ${i((0,t.uid)(t.NS.event,6))};
update studio_event set costume_budget_minor = 120000 where id = ${i((0,t.uid)(t.NS.event,6))};
insert into event_helper_slot (studio_id, event_id, role, needed, routine_id)
select ${i(t.STUDIO_ID)}, r.event_id, 'Chaperone, dressing room 2', 2, r.id from event_routine r
 where r.event_id = ${i((0,t.uid)(t.NS.event,6))} and r.title = 'Waltz of the Flowers';`),l(`
update class set uniform = array['Pink leotard', 'Pink ballet socks', 'Pink ballet shoes', 'Hair tied back'] where id = ${i(n[1])};
update class set uniform = array['Lilac leotard', 'Pink tights', 'Pink ballet shoes', 'Hair in a bun'], uniform_url = 'https://example.com/shop/ballet' where id = ${i(n[2])};
update class set uniform = array['Navy leotard', 'Pink tights', 'Pink ballet shoes', 'Black character shoes and skirt', 'Hair in a bun'], uniform_url = 'https://example.com/shop/ballet' where id = ${i(n[3])};
update class set uniform = array['School T-shirt', 'Black shorts or leggings', 'Black tap shoes'] where id = ${i(n[4])};`),[[1,"private_lesson","open","Could we book a private before the exam?","She is nervous about the reverence and I think half an hour one-to-one would settle her. Any evening except Thursday works for us.",2],[2,"question","answered","Which shoes for Grade 3?","Are the canvas ones fine or does she need leather for the exam?",6],[3,"medical_update","open","New inhaler — please update her record","The dose has changed and she now carries a blue inhaler in the front pocket of her bag rather than in the side.",1],[4,"event_interest","in_progress","Interested in the festival","We would love him to enter a solo if there is still space. Happy to pay the entry fee this week.",3]].forEach(([e,a,n,r,o,d])=>{l(`
insert into studio_request (id, studio_id, family_id, student_id, kind, status, subject, body,
                            raised_by, answered_by, answered_at, answer, created_at)
select ${i((0,t.uid)(t.NS.request,e))}, s.studio_id, s.family_id, s.id, ${i(a)}::request_kind,
       ${i(n)}::request_status, ${i(r)}, ${i(o)},
       (select g.user_id from guardian g where g.family_id = s.family_id and g.user_id is not null limit 1),
       ${"answered"===n?i((0,t.uid)(t.NS.user,5)):"null"},
       ${"answered"===n?i(c(s,-(d-1)).toISOString()):"null"},
       ${"answered"===n?i("Canvas is absolutely fine for the exam — most of the class wear them. Leather lasts longer if you are buying new anyway."):"null"},
       ${i(c(s,-d).toISOString())}
  from student s
 where s.family_id in (${[1,2,3].map(e=>i((0,t.uid)(t.NS.family,e))).join(",")})
 order by s.id offset ${e-1} limit 1;`)}),d.join("\n")}(e)}(e)}(e)}({...e,classIds:k,students:C,rnd:I,pick:D})}({termId:I,base:h,LOC:y,ROOM:g,STAFF:v,STYLE:D,LEVEL:k,guardianUsers:b})+"\n"+(o=e=>null===e?"null":`'${String(e).replace(/'/g,"''")}'`,m=t.OTHER_STUDIOS,`
-- Northstar is a paying customer on the Studio plan.
update studio set plan_id = (select id from plan where code = 'studio'), status = 'active',
                  brand_colour = '#1e3a8a', logo_url = ${o("data:image/png;base64,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")},
                  created_at = now() - interval '2 years 3 months'
 where id = ${o(t.STUDIO_ID)};
-- Only Northstar holds sample records; onboarding says so only there (UR-11).
update studio set sample_data = true where id = ${o(t.STUDIO_ID)};

insert into user_account (id, email, full_name) values
  (${o(c)}, 'jordan@swayvo.example', 'Jordan Ellis'),
  (${o((0,t.uid)(t.NS.user,191))}, 'elena@kestrelballet.example', 'Elena Marsh'),
  (${o((0,t.uid)(t.NS.user,192))}, 'tom@pointeandflex.example', 'Tom Hadley');
insert into platform_admin (user_id, role) values (${o(c)}, 'super_admin');

insert into studio (id, name, slug, contact_email, plan_id, status, trial_ends_on, status_reason, suspended_at, created_at) values
  (${o(m.riverside)}, 'Riverside School of Dance', 'riverside-school-of-dance', 'hello@riversidedance.example',
     (select id from plan where code = 'trial'), 'trialling', current_date + 9, null, null, now() - interval '21 days'),
  (${o(m.kestrel)}, 'Kestrel Ballet School', 'kestrel-ballet-school', 'elena@kestrelballet.example',
     (select id from plan where code = 'starter'), 'active', null, null, null, now() - interval '8 months'),
  (${o(m.pointe)}, 'Pointe & Flex Dance Co', 'pointe-and-flex', 'tom@pointeandflex.example',
     (select id from plan where code = 'starter'), 'suspended', null,
     'Subscription unpaid since September — two reminders sent', now() - interval '6 days', now() - interval '14 months');

update studio set theme = 'urban', brand_colour = '#c6f432', brand_secondary = '#8b5cf6' where id = ${o(m.kestrel)};
-- Kestrel lets its teachers see their Kestrel classes in full from other schools (UR-47, 0055);
-- Northstar keeps the default, busy times only.
update studio set staff_timetable_sharing = 'details' where id = ${o(m.kestrel)};
insert into membership (user_id, studio_id, role) values
  (${o((0,t.uid)(t.NS.user,191))}, ${o(m.kestrel)}, 'owner'),
  (${o((0,t.uid)(t.NS.user,192))}, ${o(m.pointe)}, 'owner');

-- Riverside's owner has been invited but has not accepted yet.
insert into studio_invitation (studio_id, email, full_name, role, token_hash, invited_by, created_at, expires_at) values
  (${o(m.riverside)}, 'amy@riversidedance.example', 'Amy Chen', 'owner',
   app.hash_token(gen_random_uuid()::text), ${o(c)}, now() - interval '3 days', now() + interval '11 days');

-- A little of Kestrel's own school, so the console's counts are not all zero.
insert into location (id, studio_id, name, city) values (${o((0,t.uid)(t.NS.location,190))}, ${o(m.kestrel)}, 'Kestrel Hall', 'Lewes');
insert into family (id, studio_id, name) values
  (${o((0,t.uid)(t.NS.family,190))}, ${o(m.kestrel)}, 'Abbott family'),
  (${o((0,t.uid)(t.NS.family,191))}, ${o(m.kestrel)}, 'Brennan family');
insert into student (studio_id, family_id, first_name, last_name, date_of_birth) values
  (${o(m.kestrel)}, ${o((0,t.uid)(t.NS.family,190))}, 'Martha', 'Abbott', current_date - interval '9 years'),
  (${o(m.kestrel)}, ${o((0,t.uid)(t.NS.family,190))}, 'Jude', 'Abbott', current_date - interval '6 years'),
  (${o(m.kestrel)}, ${o((0,t.uid)(t.NS.family,191))}, 'Orla', 'Brennan', current_date - interval '11 years');
insert into location (studio_id, name, city) values (${o(m.pointe)}, 'The Mill', 'Brighton');

-- Adults drop in on Thursday evenings, by the class or with a pack (R-034).
insert into class (id, studio_id, term_id, dance_style_id, location_id, teacher_id, name, day_of_week, start_time, duration_min,
                   capacity, age_min, price_minor, pricing, trials_enabled, description, level_note, what_to_bring)
select ${o((0,t.uid)(t.NS.class,191))}, ${o(t.STUDIO_ID)}, (select id from term where studio_id = ${o(t.STUDIO_ID)} order by starts_on desc limit 1),
       (select id from dance_style where studio_id = ${o(t.STUDIO_ID)} and name = 'Contemporary'),
       (select id from location where studio_id = ${o(t.STUDIO_ID)} order by name limit 1),
       (select id from staff_member where user_id = ${o((0,t.uid)(t.NS.user,3))} and studio_id = ${o(t.STUDIO_ID)}),
       'Adult Contemporary (drop-in)', 4, '20:00', 60, 16, 18, 1200, 'drop_in', false,
       'For adults, all levels. Come when you can: pay per class or buy a pack.',
       'All levels, including complete beginners', 'Comfortable clothes you can move in; bare feet or socks. Bring water.';
select app.generate_class_sessions(${o((0,t.uid)(t.NS.class,191))});
insert into class_pack (studio_id, name, classes, price_minor, valid_days) values
  (${o(t.STUDIO_ID)}, '5-class pack', 5, 5000, 90), (${o(t.STUDIO_ID)}, '10-class pack', 10, 9000, 180);

-- Priya also teaches one class at Kestrel: one login, two schools (R-031).
insert into membership (user_id, studio_id, role, created_at) values (${o((0,t.uid)(t.NS.user,3))}, ${o(m.kestrel)}, 'teacher', now() + interval '1 minute');
insert into staff_member (id, studio_id, user_id, display_name) values (${o((0,t.uid)(t.NS.staff,190))}, ${o(m.kestrel)}, ${o((0,t.uid)(t.NS.user,3))}, 'Priya Raman');
insert into dance_style (id, studio_id, name, colour) values (${o((0,t.uid)(t.NS.style,190))}, ${o(m.kestrel)}, 'Contemporary', 'teal');
insert into term (id, studio_id, name, starts_on, ends_on, status) values
  (${o((0,t.uid)(t.NS.term,190))}, ${o(m.kestrel)}, 'Autumn', current_date - 40, current_date + 50, 'published');
insert into class (id, studio_id, term_id, dance_style_id, location_id, teacher_id, name, day_of_week, start_time, duration_min, capacity, price_minor)
  values (${o((0,t.uid)(t.NS.class,190))}, ${o(m.kestrel)}, ${o((0,t.uid)(t.NS.term,190))}, ${o((0,t.uid)(t.NS.style,190))}, ${o((0,t.uid)(t.NS.location,190))},
          ${o((0,t.uid)(t.NS.staff,190))}, 'Kestrel Contemporary', 3, '18:00', 60, 12, 6000);
select app.generate_class_sessions(${o((0,t.uid)(t.NS.class,190))});
insert into enrolment (studio_id, class_id, student_id, status, started_on)
  select ${o(m.kestrel)}, ${o((0,t.uid)(t.NS.class,190))}, id, 'active', current_date - 30 from student where studio_id = ${o(m.kestrel)} and first_name = 'Martha';

-- Every trial gets a child record and emergency contact (migration 0023).
do $$ declare t record; begin
  for t in select id from trial where student_id is null and deleted_at is null loop
    perform app.ensure_trial_student(t.id);
  end loop;
end $$;

-- Freya has let Swayvo support look at Northstar while they help with invoices.
insert into support_access_grant (studio_id, granted_by, reason, expires_at, created_at) values
  (${o(t.STUDIO_ID)}, ${o((0,t.uid)(t.NS.user,1))}, 'Help setting up this term''s invoices', now() + interval '2 days', now() - interval '2 hours');
insert into audit_log (studio_id, actor_id, action, entity, summary, at) values
  (${o(t.STUDIO_ID)}, ${o((0,t.uid)(t.NS.user,1))}, 'grant', 'support_access_grant',
   'Swayvo support may view the account, read-only, for 48 hours: Help setting up this term''s invoices', now() - interval '2 hours');
`)+`
update studio_event r set parent_event_id = sh.id from studio_event sh
         where r.kind = 'rehearsal' and sh.kind = 'show' and sh.studio_id = r.studio_id
           and split_part(r.title, ' — ', 1) = split_part(sh.title, ' — ', 1);`+`
update class_session cs set register_closed_at = cs.ends_at
         where cs.ends_at < now() - interval '2 hours' and cs.register_closed_at is null
           and exists (select 1 from attendance_record a where a.session_id = cs.id);`+`
select app.award_event_milestones(id) from studio;`+`
select set_config('app.quiet', 'off', false);
`+`analyze;
`}let o=[["Pre-School Ballet","Music, movement and imagination for little ones, with simple ballet steps and plenty of stories.","No experience needed","Leotard or comfortable clothes, ballet shoes or bare feet. A parent stays nearby."],["Primary Ballet","The first steps of classical ballet: posture, pointed feet and lots of jumps, ready for Grade 1.","No experience needed","Leotard and pink ballet shoes; hair tied back. Trainers are fine for a first visit."],["Grade 2 Ballet","Building strength and line through the Grade 2 syllabus, with the option to take the exam.","Some ballet: Grade 1 or a year of classes","Leotard, pink tights and ballet shoes; hair in a bun."],["Grade 3 Ballet","Grade 3 syllabus work, character dance and a free movement section, working towards the exam.","Grade 2 passed, or the teacher’s invitation","Leotard, pink tights, ballet shoes and character shoes; hair in a bun."],["Junior Tap","Rhythm, timing and lots of noise: shuffles, flaps and simple routines to music children know.","No experience needed","Comfortable clothes and tap shoes. Trainers are fine for a first visit."],["Senior Tap","Faster rhythms, time steps and longer routines for older dancers.","A year or more of tap","Comfortable clothes and tap shoes."],["Modern Juniors","Energetic modern dance: travelling steps, turns, jumps and short routines.","No experience needed","Shorts or leggings and a T-shirt; bare feet or jazz shoes."],["Contemporary Seniors","Floor work, release technique and improvisation, creating pieces together.","Some dance experience helps","Leggings or joggers and a fitted top; bare feet."],["Street Juniors","Hip hop grooves, freezes and fun routines to clean, current music.","No experience needed","Comfortable clothes and clean trainers. Bring a water bottle."],["Street Seniors","Choreography and freestyle across hip hop, house and commercial styles.","Some street dance helps, beginners welcome","Comfortable clothes and clean trainers. Bring a water bottle."],["Jazz Intermediate","Kicks, leaps, turns and sharp jazz routines for confident dancers.","A year or more of dance","Leggings or shorts, a fitted top and jazz shoes."],["Saturday Ballet Grade 1","The Grade 1 syllabus on a Saturday morning: posture, footwork and expressive dance.","Primary Ballet or a term of classes","Leotard, pink ballet shoes; hair tied back."],["Adult Contemporary (drop-in)","For adults, all levels. Come when you can: pay per class or buy a pack.","All levels, including complete beginners","Comfortable clothes you can move in; bare feet or socks. Bring water."]],d=e=>o.find(t=>t[0]===e),l=[["Pre-School Ballet","ballet","preschool","greenwich","g2","freya",1,"16:00",45,12,3,5,4200,.83],["Primary Ballet","ballet","primary","greenwich","g1","freya",1,"17:00",60,18,5,7,5400,.78],["Grade 2 Ballet","ballet","g2","greenwich","g1","freya",2,"17:30",60,16,7,9,5400,.81],["Grade 3 Ballet","ballet","g3","greenwich","g1","freya",3,"17:30",75,14,9,12,6300,1],["Junior Tap","tap","primary","greenwich","g2","marcus",2,"16:30",45,16,5,8,4600,.69],["Senior Tap","tap","inter","blackheath","b1","marcus",4,"18:30",60,18,11,16,5600,.61],["Modern Juniors","modern","g1","blackheath","b1","priya",2,"16:00",45,16,6,9,4600,.75],["Contemporary Seniors","contemporary","inter","greenwich","g1","priya",4,"19:00",75,14,13,18,6300,.5],["Street Juniors","street","primary","blackheath","b1","tomasz",3,"16:30",45,20,6,9,4600,.8],["Street Seniors","street","inter","blackheath","b1","tomasz",5,"17:30",60,20,11,17,5600,.95],["Jazz Intermediate","jazz","g3","greenwich","g1","tomasz",6,"10:30",60,16,9,13,5400,.75],["Saturday Ballet Grade 1","ballet","g1","greenwich","g2","freya",6,"09:15",60,14,6,8,5400,.86]],u=e=>Array.from(e,e=>e.toString(16).padStart(2,"0")).join(""),c=(0,t.uid)(t.NS.user,190);e.s(["PLATFORM_ADMIN",0,c,"buildSeedSql",0,r],94118),e.i(94118),e.s(["NS",()=>t.NS,"OTHER_STUDIOS",()=>t.OTHER_STUDIOS,"PLATFORM_ADMIN",0,c,"STUDIO_ID",()=>t.STUDIO_ID,"buildSeedSql",0,r,"uid",()=>t.uid],22145)}]);