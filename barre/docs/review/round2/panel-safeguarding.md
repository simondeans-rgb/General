# Round 2 panel report: safeguarding, privacy, trust and accessibility

**Group slug:** `safeguarding` · **Persona:** 24, dance school safeguarding and welfare lead (the same persona as round 1, `docs/review/panel-safeguarding.md`) · **Cross-cutting role:** reviewer for safeguarding, privacy, trust and accessibility across the panel.

> This is a **simulated** professional review, not real user research. The persona, scores and opinions are my judgement of what I saw in the demo build on 28 Nov 2026. Nothing here is legal advice, a UK GDPR/DPA compliance assessment, a penetration test or a WCAG conformance claim. Labels: **Observed (browser)** = I drove it. **Observed (code)** = I read it in the source, not in the UI. **Opinion** = professional judgement. **Unverified** = I could not test it.

---

## 1. Method and limitations

- **Driven:** Playwright + Chromium against the shared preview (`http://127.0.0.1:8080/General/studio-next/`). Eleven scripted runs (`r1.cjs` … `r11.cjs`, output in `r10.out` and `r11.out`) are in `/tmp/claude-0/-home-user-General/b4a48a5e-78db-50c3-ae22-e03d809e9579/scratchpad/panel2/safeguarding/`. Each run used a fresh browser context, and so a fresh in-browser database. Within a run I switched identities so that one person's action could be checked from another person's view.
- **Identities:** Freya (owner), Nadia (admin, named DSL during the runs), Marcus, Priya and Tomasz (teachers), Hannah (guardian), Amir (student, 15) and Jordan (platform). I also used two **spoofed** sessions: Tomasz's id with `role: owner`, and Hannah's id with `role: owner`.
- **Viewports:** desktop 1440×900 for the flows. Phone 390×844 and desktop 1280×800 with the root font forced to 200% for the text-scaling checks.
- **Read:** `docs/review/FIXES.md`, `docs/compliance/DPIA-DRAFT.md`, `RETENTION-POLICY-DRAFT.md`, `docs/brand/GUIDELINES.md` (part), migrations `0057_video_access.sql` and `0059_media_retention.sql` (parts), `components/app/safeguarding.tsx`, `media-children.tsx`, `consents.tsx` (parts), `app/safeguarding/page.tsx`, `app/class/page.tsx`, `app/welcome/page.tsx` (grep).
- **Limitations:**
  - Real sign-in is still not built (R-001). I can test what an identity sees, not whether someone can become it.
  - No email, SMS or push is sent. I could not find the owner's notification for the new concerns in the bell panel within my script, so delivery is **unverified**.
  - I could not move the clock, so I did not run retention on a real leaver. Retention holds are judged from the UI text, the drafts and code reading.
  - I did not download the DSL safeguarding export or the family JSON. I saw only that the buttons exist.
  - I used no screen reader. Keyboard checks were scripted Tab, Shift+Tab and Escape. "200% text" was simulated by forcing `html{font-size:200%}`, which roughly matches browser or OS large-text settings in a rem-based app. It is not the same as browser zoom.
  - `/join` was read only to its first step. I did not re-verify trial safety capture (UR-42).

---

## 2. What changed since round 1 (my round-1 defects and recommendations)

| Round-1 item | Status now | Evidence |
|---|---|---|
| D-01 Office/DSL cannot raise a concern; no route for allegations about adults or staff | **Fixed** | Nadia raised a concern from the People sheet and got "Reference F241752A · 28 Nov 00:38" (`safeguarding-07`). "Record a concern" is on `/safeguarding` for all staff, with *A child / Another adult / A member of staff* (`safeguarding-08`). New gaps are in §3 (N-01, N-02) |
| D-02 Consent cannot be recorded or withdrawn | **Fixed** | Hannah has Allow / Don't allow for photos, video and social media per child, with history ("Video: given · 28 Nov 00:35 · Hannah Wright"). The teacher brief shows "No photos · Video: not recorded, so don't" (`safeguarding-04`) |
| D-03 Duplicate "opened a concern" rows | **Fixed** | Open, record action and place hold gave exactly one "opened", one "recorded an action" and one "placed a legal hold" row |
| Access log owner-only | **Fixed** | Nadia (DSL) sees "Who has looked", including Freya's views (`safeguarding-12`) |
| D-04 Inaccurate "teachers see allergies only" text | **Fixed** | Family page: "Nia's teachers see allergies, conditions, medication, the emergency plan, emergency contacts and photo consent…". `/family/privacy` matches. Minor drift in N-15 |
| D-05 Export omits safeguarding | **Fixed (UI seen, file not downloaded)** | "Export the safeguarding record… Not part of the school export… recorded in the access log", with an "I will store this file securely" tick |
| D-06 Misleading empty register | **Fixed** | "This isn't one of your classes. A register opens for the class's own teachers and the office. If you are covering it, the office can add you." (`safeguarding-14`) |
| D-07 Consent subquery fails with two or more rows | **Fixed (observed)** | Amir now has several consent rows, and the family, People and teacher screens all rendered |
| D-08 Sheets do not trap or return focus | **Fixed** | In the Record a concern sheet, Tab cycled Close → radios → selects → textarea → checkbox → Cancel → Close with every stop inside the dialog. Escape returned focus to "Record a concern". The *Update details* sheet did the same with Shift+Tab |
| D-09 Teen login approval dead end | **Fixed** | "Own login ON… Either parent can switch it off at any time. [Switch off]". Amir then sees "Your login is off. A parent or carer needs to approve your login, or has switched it off…" (`safeguarding-16`). "Switch back on" is offered |
| D-10 Retention anonymises children with safeguarding records | **Fixed (UI text and drafts; not run)** | Legal holds card: "Retention never deletes or anonymises anything about a child with an open concern, or a closed one still kept, including their medical record." There are child holds and concern holds. I placed a concern hold and the list shows "On hold". See the over-retention point in §5 |
| D-11 Guardian edits the other guardian | **Fixed** | Inês is read-only with "Ask the office to change". "You can change your own details. Only the office changes anyone else's." |
| R-07 Staff checks for DSL/admin, missing-check warning | **Partly fixed** | The DSL sees checks, and each person shows "No DBS on file". **But office staff (Nadia) are not in the staff list at all** (N-02) |
| R-04 Who-sees-what page, download, erasure request | **Fixed (process needs specialist review)** | `/family/privacy` has a role table, "Download (JSON)" and "Ask to delete" with a one-month note |
| R-10 Absence as a welfare signal | **Fixed (opt-in)** | "Watching attendance… A run of 3 or more unexplained absences is flagged" |
| R-001 Real sign-in | **Not fixed (waiting on decision)** | Spoofing still changes the chrome but not the data: Hannah-as-owner saw only her own three children in `/people` |
| Text scaling | **Improved; issues at the extreme** | No sideways page scroll at 200% on any of the 6 screens on phone or desktop. Phone layout issues in N-10 |

**Net:** every high-severity defect I raised in round 1 is addressed in the UI. That is a remarkable turnaround. The new problems are at the **edges** of the allegation workflow, where the stakes are highest.

---

## 3. UI review: findings, screen by screen

| # | Screen / route | Observation | Sev. | Shot | Concrete improvement |
|---|---|---|---|---|---|
| **N-01** | Record a concern → *A member of staff* → the owner, **with no DSL named** (the seeded default: "Not named — only owners") | **Observed (browser).** Marcus raised an allegation about Freya. The form said "Only the safeguarding lead and the owner see it, never the person it is about". The receipt said "**The safeguarding lead and the owner have been told.**" Freya's log then showed "No concerns recorded". **Nobody in the school can read it.** A disclosure about the owner silently disappears, and the raiser believes it was passed on | **High** | `safeguarding-13` | (1) When no DSL is named, block an allegation about the owner and show the LADO / local authority contact plus "report this outside the app today". (2) Better still, make naming a DSL a required setup step before staff can raise concerns, and show an owner banner on `/today` until one is named. (3) Write the receipt from who was actually told ("The safeguarding lead has been told. The owner has not, because it is about them") |
| **N-02** | Staff picker in Record a concern; Staff checks | **Observed (browser).** The picker lists only Freya, Marcus, Priya and Tomasz. **Nadia (admin, and the DSL) cannot be chosen**, and admins have no staff-check row ("No DBS on file" appears only for teachers). An allegation about office staff has to go in as "Another adult". **Unverified (code not checked):** whether "Another adult" concerns are hidden from that adult. If they are not, an allegation about the DSL would land in the DSL's own log | **High** | `safeguarding-09`, `-12` | Build the picker from every staff membership (owner, admin, teacher, volunteer), not `staff_member` alone. Give admins and volunteers staff-check rows. When the subject is the DSL, route the concern to the owner only, and say so on screen |
| **N-03** | Concern receipt | **Observed (browser).** The receipt always says "the safeguarding lead and the owner have been told", even when one of them is the subject (it was correctly hidden from Freya). A raiser could fear the owner was tipped off, or be falsely reassured | Medium | `safeguarding-08` | Make the receipt conditional on who was notified, and add "If you are worried this has not been acted on, contact the LADO directly" |
| **N-04** | Concern about another adult | **Observed (browser).** "Man in grey van… tried to collect Clara Wright" is saved with no link to Clara. Clara's record has no chronology entry, and a child-level retention hold does not follow automatically | Medium | `safeguarding-09` | Add an optional "Children involved" picker to adult and staff concerns. Show the concern in each linked child's chronology (DSL view only), and let retention hold the linked children |
| **N-05** | Concern sheet after "Record action" | **Observed (browser).** For about 1.5 s the new action is missing and Status still reads "Unchanged (open)". It appeared by 4 s. "Referred" has no fields for agency, reference or date | Low–Med | `safeguarding-10` | Update the trail optimistically and show "Saved". When the status is Referred, show fields for agency, their reference, date and person spoken to |
| **N-06** | `/teach/material` → class → *Add material* → **Add a link** + "Yes, children can be seen" | **Observed (browser).** A teacher can share a **Vimeo link** of children. There is a warning ("A link is only as private as the site it points to. For a video of children, upload the file instead.") but no block. Once every named child has consent, families get an **Open** button to the outside site, so the view-only, no-download protections do not apply. The seed itself has "Summer show routine — Street Seniors" (shows children) on a public Vimeo URL | Medium | `safeguarding-02`, `-05` | When "shows children" is Yes, disable *Add a link* for video and audio unless the office ticks "The hosting account is private and controlled by the school". Change the seeded show routine to an uploaded file so the demo models the safe path |
| **N-07** | Media consent gate (the best new feature) | **Observed (browser).** Marcus named Amir in a new video, and it showed "STAFF ONLY · Hidden from families: consent not given for 1 child". Hannah allowed video for Amir: it appeared for Hannah and in Amir's library. She withdrew it: it was hidden again at once. The teacher's child list shows each child's consent word. Marcus could not see the Street Seniors show routine (not his class) | Positive | `safeguarding-03`, `-05` | Keep it. Add a line on `/family/privacy` explaining it (N-15) |
| **N-08** | `/family/children` consent buttons | **Observed (browser).** After **Allow**, the confirmation "Video: allowed…" appeared while the status still said "Not recorded" and the button was not pressed. It caught up within about 2 s. One tap grants *social media and public use*, with no confirmation | Low | `safeguarding-04` | Update optimistically or wait before confirming. Ask for confirmation on **granting** public or social-media use only. Keep withdrawal one tap, as it is now |
| **N-09** | Consent vocabulary | **Observed (browser).** The parent sees "Not recorded". The teacher and student see "Not recorded, so don't / so not allowed". History says "given / not given" while the buttons say "Allow / Don't allow" | Low | `safeguarding-04` | Use one set of words everywhere ("Allowed / Not allowed / Not answered: treated as not allowed") |
| **N-10** | 200% text on phone (`/family/children`, `/safeguarding`) | **Observed (browser).** No sideways scroll. But the header stacks the logo, title, icons, avatar and primary button, which fills the whole first screen. Header icons do not scale. "Contemporary" is clipped to "Contemp" in the Classes value. Bottom-tab labels are truncated ("Sch…", "Mes…", "Pay…") | Medium | `safeguarding-18`, `-19` | At large text sizes, collapse the header into a single row (title plus overflow menu). Use `overflow-wrap:anywhere` on fact values. Size icons in rem. Switch the bottom tabs to icon-only with `aria-label`, or two lines, above a text-size threshold |
| **N-11** | Form fields (concern textarea, selects) | **Observed (code).** Focus is still a border colour change plus `focus:ring-accent-line/12` (12% opacity). Buttons have a solid 2px outline, which is good | Low–Med (unmeasured) | — | Give inputs the same solid 2px focus outline as buttons, or measure the ring against WCAG 2.2 focus appearance |
| **N-12** | `/safeguarding` child pickers | **Observed (browser).** Two native selects list every child (64 in the demo, about 300 in my school), and every name is in the page markup | Low | — | Use a searchable combobox that loads matches on demand |
| **N-13** | Class names | **Observed (browser).** Lists say "Senior Tap" and "Street Seniors". The class page heading says "Tap Intermediate" and "Street Intermediate" | Low (trust) | `safeguarding-05` | Use the class's own name as the heading, with style and level as a subtitle |
| **N-14** | Teen login switch-off | **Observed (browser).** It takes effect at once with no confirmation. Amir's message is clear and non-blaming. **Unverified:** whether the other guardian or the office is told | Low | `safeguarding-16` | Notify the other guardian and the office ("Amir's login was switched off by Hannah"). Separated parents need this |
| **N-15** | `/family/privacy` and family medical text | **Observed (browser).** The privacy page does not mention that **videos and photos showing a child are only visible to families while every child in them has consent**, or the collection list. The medical row says teachers see "photo consent", while the privacy page says "photo, video and social media consent" | Low | — | Add a row each for "Videos and photos of your child" and "Who may collect". Generate both texts from `WHO_SEES` |
| **N-16** | Cover access to media | **Observed (code).** Under 0057 a cover teacher sees class media for sessions between 1 day ago and 14 days ahead, while student records open only on the day. The DPIA's wording ("from the day before to 14 days ahead") is ambiguous | Low | — | Fine operationally. Align the DPIA wording and state the asymmetry deliberately |
| Positive | Boundary tests by URL | **Observed (browser).** Amir, Jordan and Hannah each get "Not part of your role" for `/people`, `/safeguarding`, `/account`, `/family/privacy` (Amir and Jordan) and `/teach/students?id=…` (Amir and Hannah). Marcus gets "This isn't one of your classes" on Priya's register. Tomasz spoofed as owner sees owner chrome but no concerns. Hannah spoofed as owner sees only her own children. Class pages (timetable facts and counts) remain readable to any family. "Class not found" appears for ids outside the school | — | `safeguarding-14` | Keep it. As in round 1, the remaining real gap is sign-in (R-001) |

---

## 4. Feature and function ideas

| Feature | Problem it solves | Who | Rating | Size / code area | Risk |
|---|---|---|---|---|---|
| **DSL required before go-live**, plus an out-of-app route for allegations about the owner | N-01 black hole | Owner, DSL, all staff | **Essential** | S: onboarding checklist, `app/safeguarding/page.tsx`, `RaiseConcernSheet`, `app.raise_concern_about` | Small owners may be their own DSL. The out-of-app route (LADO number per school) must then be shown |
| **All staff as subjects and as checked people** (admins, volunteers, chaperones) | N-02 | DSL | **Essential** | M: staff pick query, `staff_check` for memberships, policy for DSL-as-subject | Routing logic must be tested for each subject case |
| **Children involved** on adult and staff concerns | N-04, retention holds | DSL | Highly desirable | S–M: `safeguarding_concern_child` join table, chronology view, `retention_hold_reason` | None significant |
| **Referral fields and printable chronology** (agency, ref, date, outcome; PDF per child or concern) | Referrals to children's services and LADO | DSL | Highly desirable | M: `safeguarding_action` columns, print view | The printout must be logged and watermarked |
| **Raiser follow-up note** (append-only, by reference) | A teacher hears more the next week | Teachers, office | Highly desirable | S: `app.add_concern_note(ref)` | Must not become read access |
| **Block outside links for media of children** (office override) | N-06 | All | Highly desirable | XS–S: `AddMaterial`, `0057` check | Some schools rely on private Vimeo; hence the override |
| **Consent snapshot for an event** (printable "who may be photographed or filmed" for a show, by class) | Show week is when consent goes wrong | DSL, office, chaperones | Highly desirable | S: events page + `app.has_consent` | Paper copies must be destroyed after the event; say so on the print |
| **Annual "check your child's details"** prompt (medical, contacts, consents) | DPIA R12, stale consent and allergies | Parents, office | Highly desirable | S–M: `app.tick`, family banner | Notification fatigue: once a year only |
| **Notify the other guardian** of consent, login and collection changes | Shared care (N-14) | Parents, DSL | Useful | S: `notify_user` in `set_consent` and login toggles; respect `guardian_access` restrictions | Must never notify a restricted guardian |
| **Student (13+) privacy explainer and request route** | DPIA §7 standards 4 and 15 | Students 13+ | Useful (DPO decision first) | S: `/learn` page | Specialist decision on the age and voice of 13–17s |
| **Retention presets** ("Use common starting points" with an adviser-confirmed tick and date) | 13 bare number fields are intimidating (§5) | Owner | Useful | S: `RetentionCard` | Must not read as legal advice |

---

## 5. Compliance drafts: clarity and gaps (not legal sign-off)

**DPIA-DRAFT.md: overall.** This is unusually honest and well evidenced for a pre-launch product. Every claim cites a migration or file. "DECISION NEEDED" markers are consistent, and §10 is a usable go-live gate. My comments are about **internal consistency and things a DSL would ask**:

1. **Self-contradiction on media.** §2.2 row 10 says access is "Being tightened. Confirm against migration 0057" with "No retention rule for media". R5 says "High until 0057 is confirmed… No retention rule". R13 lists media as a gap. Yet §8.1, §6 and §9 say 0057 and 0059 are confirmed and media retention exists. §12 Sources omits 0057 and 0059. Update row 10, R5 and R13, and add a version history (it says v0.1 but has been updated twice).
2. **R6 is out of date in one direction and missing a risk in the other.** It says "the owner always has access, so a concern about the owner has no route that excludes them". In the browser, an allegation about the owner was **hidden from the owner**. The real residual risk is **N-01**: with no DSL named, that allegation reaches nobody. Add it as a separate risk, scored High until a DSL is mandatory.
3. **Staff subjects.** Row 12 and R6 assume "staff" means `staff_member`. Office and admin staff are not covered (N-02). Add them to the inventory and to R6.
4. **Marketing statements are a transparency risk.** `/welcome` says "Only the school's safeguarding lead can read the log". In fact the owner can too, and is the only reader when no DSL is named. It also says "failed cards you can retry", while payments are not built (R-006). The DPIA's transparency row should cover marketing claims as well as the privacy page.
5. **Readability.** At about 340 lines and 21 inventory rows, it suits a DPO but not a dance school owner. Split it into (a) Swayvo's own product DPIA and (b) a 2–3 page school template with only the school's decisions, pre-filled from (a).
6. **Missing items a DSL would expect:** an incident or breach log inside the app (A6 has none for schools); second-factor or step-up for opening the safeguarding log (only listed under R8); what a support viewer can see of the safeguarding page (row 20 says "account facts", but the grant shows the school "as admin"; confirm safeguarding is excluded); and photos used for school branding (the hero-photo upload in brand settings warns about consent but is not in the inventory).
7. **Cover media window** (N-16): state it in plain words.

**RETENTION-POLICY-DRAFT.md: overall.** It is clear, step-by-step and honest about gaps. Comments:

1. **Media is missing from the core sections.** `media_months` (0059) appears in the §2 schedule but not in §1.1's settings table, §1.3's run steps, §13's open decisions or the header (which mentions only 0058).
2. **Over-retention risk (opinion, needs DSL/DPO view).** With `concern_months` empty by default, "a closed concern still kept" holds **everything** about that child (medical record, attendance, messages, support notes) **indefinitely**. One minor closed wellbeing note would keep a child's full medical record for life. I suggest a hold that keeps the safeguarding chronology and what it references, a separate decision for medical, and a periodic DSL review of holds ("held for 3+ years: review").
3. **Trigger drift** (§3 gap 3) is important. Fix it in code by measuring from a stored `closed_at`, not `updated_at`, rather than leaving it as a policy note.
4. **Concern deletion removes the action history.** A DSL would expect at least a tombstone: date raised, category, date closed and outcome.
5. **School exit.** Nothing in the system stops a purge before the safeguarding export has been taken. Make it a hard precondition: the owner or DSL confirms the handover, or the purge waits.
6. **The Keeping data screen** (`/account`) has 13 number fields, each with "Check with your data protection adviser". That is honest but intimidating. Group them (children / staff / money / logs), show the current value as a sentence ("Medical records are deleted 12 months after a child leaves"), and show "next due" items. The UI correctly says "Nothing is due now. The first monthly check has not run yet."

---

## 6. Branding and trust (as a welfare lead, and on behalf of parents)

- **Trust feel: strong (opinion).** The family home (`safeguarding-20`) is calm and legible. The school's star mark leads and "powered by swayvo" is quiet. Words carry status ("CHANGED", "NEW", "AT RISK", "Allegation · LADO"), and colour only reinforces them. That is exactly right for parents and for colour-blind staff. The consent wording ("This applies straight away") and the student's login-off message are kind and plain.
- **Name and logo.** "Swayvo" reads as playful and youthful. For parents it is neutral to positive; it does not sound like a bank or a safeguarding product, and the school's own brand leads anyway. The eight-count mark is distinctive, but on a phone it can read as a signal-strength icon to a lay parent despite the gap. The guidelines already know this risk.
- **Colour.** Count blue (#2638F0) plus peach in the store images is energetic. Inside the app it is restrained, which builds trust. Keep "once per screen".
- **Store images** (`public/brand/store/02-family.png`). "Every change, said plainly." is the most trust-building line in the set. I would add one image about safety ("Only your family sees your child"), because that is the parent's first question.
- **/welcome: two trust risks.**
  - (a) The "Safe by design" section over-claims: "Only the school's safeguarding lead can read the log". The owner reads it too.
  - (b) "failed cards you can retry" promises payments that are not built.
  - Also (opinion), the hero register shows a child's name with "Mild eczema; Emollient cream". It is synthetic, but a careful parent may wince at health data on an advert. Use a non-medical example, or an obviously fictional allergy line.
- **School branding layering.** Good: the school leads, and Swayvo signs off. The brand-settings hero-photo upload warns about consent. Make it a required tick when the photo shows children.

---

## 7. Individual panel member report: persona 24, safeguarding and welfare lead (simulated)

**What's better.** Almost everything I asked for. I can record a concern at the front desk and so can Nadia. Staff allegations exist, carry "Allegation · LADO" with the right instructions, and are hidden from the person they are about. I tested that both ways: the owner could not see one about herself, and the DSL could. Consent is real now: parents change it themselves, withdrawal is instant, the teacher's card says "No photos · Video: not recorded, so don't", and **videos of children disappear from families the moment consent goes**. That last one is better than anything I have used. The access log counts once and I can see it. Teen logins can be switched off by either parent. Inês is protected from Hannah editing her number. Focus behaves in dialogs.

**What still frustrates.**
- The one scenario that frightens me most is a concern about the owner in a school with no DSL named, and the demo school has no DSL named. The app took Marcus's allegation, told him "the safeguarding lead and the owner have been told", and then **nobody could read it**.
- I cannot name Nadia, or any office or front-desk person, in an allegation, and I cannot record their DBS checks.
- An adult concern ("man in a van at collection") is not linked to the child it involved.
- Teachers can still post a Vimeo link of children.
- Sign-in is still a person-picker, so I still cannot put real children behind it.

**Top 5 UI improvements**
1. Block or redirect allegations about the owner when no DSL is named, and make the receipt truthful (N-01, N-03).
2. Staff picker and staff checks cover every staff role (N-02).
3. "Children involved" on adult and staff concerns (N-04).
4. Disable links for media showing children (N-06).
5. Large-text header and tab layout on phones (N-10).

**Top 3 feature requests**
1. A DSL as a mandatory setup step with an out-of-app LADO route (Essential).
2. Referral fields plus a printable chronology (Highly desirable).
3. A per-event consent snapshot for shows (Highly desirable).

**Branding view.** The school-first layering and plain-word statuses make the product feel trustworthy to parents. The name is fine because parents mostly see the school. Fix the two over-claims on `/welcome` before any school shows it to its families: a safeguarding product cannot afford one untrue sentence.

**Scores (/10), with round 1 in brackets**

| Relevance | Quality | Completeness | Ease of use | Efficiency | Usefulness | Adoption likelihood | Continued use | Visual design/UI | Brand appeal |
|---|---|---|---|---|---|---|---|---|---|
| 9 (9) | 8 (7) | 7 (4) | 8 (7) | 7 (6) | 8 (6) | 6 (5) | 8 (6) | 8 (—) | 7 (—) |

**Overall: 7.5/10 (round 1: 6/10).** The three everyday jobs that were impossible are now done well, and the media consent gate is genuinely leading practice. I am holding it below 8 for three reasons. The allegation edge cases (N-01, N-02) are exactly where real harm happens. Sign-in (R-001) still blocks real data. And the marketing page says one untrue thing about who reads the log. Adoption stays at 6 until sign-in exists.

---

## 8. Votes (machine-readable)

| Persona | Type | Item | Rating |
|---|---|---|---|
| 24 Safeguarding lead | UI improvement 1 | No-DSL allegation guard + truthful receipt | — |
| 24 Safeguarding lead | UI improvement 2 | All staff in allegation picker and checks | — |
| 24 Safeguarding lead | UI improvement 3 | Link children to adult concerns | — |
| 24 Safeguarding lead | New feature 1 | Mandatory DSL + LADO route | Essential |
| 24 Safeguarding lead | New feature 2 | Referral fields and chronology print | Highly desirable |
| 24 Safeguarding lead | New feature 3 | Event consent snapshot | Highly desirable |
| 24 Safeguarding lead | Remove/simplify | Outside links for media of children | — |
| 24 Safeguarding lead | Greatest impact | Mandatory DSL + LADO route | — |

---

## 9. Group summary (single-persona group, plus cross-cutting notes)

- **Consensus:** round 1's safeguarding and privacy defects are fixed in the UI (D-01 to D-11). Database boundaries held in every URL test, including two spoofed-role tests. Accessibility basics (focus trap and return, no sideways scroll at 200% text) are now good.
- **Remaining themes:**
  - **Allegation routing edge cases** (no DSL; office staff as subjects).
  - **Links that escape the media controls.**
  - **Truthfulness** of marketing copy.
  - **Large-text phone layout.**
  - **Over-retention** by blanket holds (a specialist question).
  - **Real sign-in** (R-001), which is still the absolute adoption blocker for real data.
- **Disagreements kept (cross-cutting):**
  - Owners of very small schools may resist a mandatory separate DSL. I would accept "owner is DSL" only if an allegation about the owner is routed out of the app.
  - The growth and teacher personas may want Vimeo links for convenience; I want them blocked for children.
  - Parents may want granting public-use consent to be one tap; I want a confirmation on grant only.
  - A DPO may prefer shorter retention than my "keep the chronology" instinct.
- **Group scores, now (round 1):** satisfaction 7.5 (6), adoption likelihood 6 (5), continued use 8 (6).

Screenshots: `docs/review/round2/shots/safeguarding-02` to `-20` (15 files).
