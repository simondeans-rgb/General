# Round 2 panel review: Teachers (simulated)

> **This is a simulated end-user panel.** The five teachers below are the same personas as in round 1 (`docs/review/panel-teachers.md`). A reviewer wrote them and then drove the Swayvo demo build in a browser. Their opinions are simulated judgement, not real user research. Each finding is labelled with how it was established:
> - **Observed:** driven in the browser.
> - **Code:** read in the source.
> - **Opinion:** persona view.
> - **Unverified:** neither driven nor read.
>
> The demo database is synthetic and runs in the browser.

Group slug: `teachers` · Personas 11–15 · Reviewed 28 Nov 2026, with the browser clock moved to Tue 1 Dec and Tue 8 Dec to reach real class times.

---

## 1. Method and limitations

**How it was driven**
- Playwright and Chromium against `http://127.0.0.1:8080/General/studio-next/`, with a fresh context for each run.
- Time zone Europe/London. `page.clock.install()` set the time to class time: Tue 1 Dec at 15:50, 15:56, 15:58, 16:02, 16:25 and 17:30. A run that started on 1 Dec then moved the clock to 8 Dec at 15:52 to see "last week's" feedback.
- Scripts are in `/tmp/claude-0/-home-user-General/b4a48a5e-78db-50c3-ae22-e03d809e9579/scratchpad/panel2/teachers/`: `today.cjs`, `offline.cjs`, `offline2.cjs`, `sync.cjs`, `feedback.cjs`, `nextweek.cjs`, `cover.cjs`, `screens.cjs`, `misc.cjs`, `tab.cjs`, `welcome.cjs`.

**Accounts and devices**
- **Account:** Priya Raman, a teacher at Northstar and Kestrel who is also covering Marcus's Junior Tap. She stood in for all five personas, as in round 1.
- **Phone** (390×844, touch): used for almost everything.
- **Tablet** (820×1180): Week grid, All my schools, feedback, register with medical brief.
- **Kestrel's "Urban" dark style:** checked on phone.
- **200% text:** simulated by injecting `html{font-size:200%}`. This only approximates OS text scaling.

**Screens driven**
- `/teach` (List, Week grid, All my schools)
- `/teach/register`, including offline
- `/teach/feedback`
- `/teach/students`, including the "May need support" view and the detail panel
- `/teach/messages`
- `/teach/material` → `/class`, including the "Add material" upload with "Does this show children?"
- `/teach/reports`
- The Ask for cover sheet, the school switcher, and `/welcome`
- The store images in `public/brand/store/`

**Offline tests**
- `context.setOffline(true)` in the middle of a register: marks, a reason, Late, "Mark the rest", Close, then reconnect, reload and read back.
- An offline reload of Today, opening a register from it, and opening a register URL directly. Each was tried both before and after the service worker had taken control.

**Limitations**
- **Timings are script timings.** Playwright waits about 1 s per action, so the numbers are interaction counts, not human task times.
- **Seeded attendance is random in each context.** The same child shows different percentages in different runs. In one tablet run at 16:02, the 16:00 register opened already fully marked by the seed (shot 29). That is a demo artefact.
- **Some flows were not seen end to end.**
  - A cover handover note rendering on the cover register: the seeded cover has none. It was code-verified only.
  - ICS download contents and the "all schools" calendar feed.
  - Report drafting at term end.
  - Saving a class note while offline: my script did not find the field, so this is unverified.
- **Demo offline is not hosted offline.** The database lives in the tab. Conclusions about the hosted (Supabase) build are unverified.
- **Not testable:** push, email or SMS delivery; real devices; screen readers.

---

## 2. What changed since round 1 (verification of our complaints)

| Round-1 complaint | Status | Evidence |
|---|---|---|
| **D1** Offline "Mark the rest" overwrote an absence | **Fixed** | Observed in 2 runs. Offline steps: Absent on Nia Doherty, Late on Ottilie, then Mark the rest and Close. After reconnecting and reloading, Nia was Absent with reason "Ill", Ottilie was Late (run 1), the rest were Here, the register was closed, and the queue `barre.pending-marks.v1` was empty. The sync took about 9 s for 12 marks: "Sending 11 marks…" → "Sending 6…" → done. |
| **D2** Offline taps did nothing, the queue never engaged, spinners never stopped | **Fixed** | Observed. The Absent tap showed in 125 ms. A banner read "OFFLINE · 3 marks saved on this phone, will send when connected · Keep marking. Nothing is lost if the app closes." Each row read "Saved on this phone". Close worked offline: "Closed on this phone. It reaches the office once the marks have sent." Shots 05 and 06. |
| **D3** Opening a register offline ended on a browser error page | **Fixed once the app has been opened before; partly fixed on first use** | Observed. With the service worker controlling the page, an offline reload of Today worked, "Open register" worked, and a direct register URL worked (shot 07b). On a first visit with no reload before going offline, the reload stayed on "Starting the database… Setting up a real Postgres database in your browser" with no offline message. |
| **D4** Re-editing feedback wiped saved chips and the note | **Fixed** (one possible race) | Observed on tablet. Reopening showed the saved chips pressed. Adding a chip and a note merged with what was there ("Great focus, Brilliant timing, Pointed feet" plus the note), and the row read "Shared · edited". On one phone run, an edit made while "Share with families" was still sending was lost after the share finished. Seen once; it looks like the share's success handler clears drafts (`setDrafts({})` in `feedback/page.tsx`). |
| No bulk feedback (41 taps for 12) | **Fixed** | Observed: Select all 11 → one Going well → one To work on → Share is **4 interactions**. "Same as last week" copies the previous phrases for the 12 children who had them. Shot 10. |
| Fixed, studio-wide chips | **Fixed** | Observed. "Phrases and tracking for this class" lets a teacher add or remove phrases ("Change one and the class gets its own copy", "Go back to the school's phrases"). Junior Tap (ages 5–8) gets an age set with emoji ("👂 Listened beautifully", "🦶 Pointy toes") and defaults to *Notes*, so there is no skill picker. Shot 14. |
| Previous feedback hidden at the point of teaching | **Partly fixed** | Observed on 8 Dec. Expanding Elias on the register shows "Last feedback · 1 Dec · Modern Juniors · To work on: Spotting in turns. Spot the back corner…". It sits **below** Late/Excused, medical, emergency contacts and consent, and it is **not** on the collapsed row (shot 15). The feedback row and the student panel also show it, the panel near the top. |
| Cover clash not detected | **Partly fixed** | Observed. "All my schools" flags Modern Juniors 16:00–16:45 against the Junior Tap cover at 16:30 as **CLASH** (shot 03). The default **List** view on the day still shows both with no warning: "On now 16:00 Modern Juniors… Later today 16:30 Junior Tap · You are covering" (shot 12). The office cover sheet has an override and handover (code, `session-sheet.tsx`). |
| No handover | **Fixed (code); not seen rendered** | Code: Ask for cover now has "Handover for whoever covers… Shown on their register", and the register renders a "Handover" section. The seeded cover had none. |
| Wrong-day register could be closed | **Fixed** | Observed. Thursday's register on Tuesday shows "NOT YET · This register opens at 18:30 on Thursday 3 December", and the buttons are disabled. Shot 23. |
| No cross-school schedule | **Fixed** | Observed. "All my schools" lists the next two weeks across Northstar and Kestrel: "Only you see this. Each school chooses whether its classes show here in full or as busy times". It has a travel-time setting (30 min). |
| Skills: all frameworks, publish on one tap | **Fixed** | Observed. The Modern Juniors panel shows "MODERN SKILLS" only. Its text reads: "Families see levels once you share them." |
| **D7** Stale link said "No one is enrolled" | **Fixed** | Observed: "This class could not be found · The link may be out of date…" |
| **D8** "This term" label showed all-time attendance | **Fixed (code)** | Code: `TERM_ATTENDANCE` filters on `app.current_term_start`. |
| **D10** Header truncated on phone | **Not fixed on phone**; fixed on tablet | Observed: "Tuesday 8 December · 16:00…" on phone (shot 15). On tablet it wraps to "Blackheath Studio · Main Hall" (shot 29). The store image `01-register.png` shows the truncation too. |
| **D12** Trial children excluded from feedback | **Fixed** | Observed: Fionn Kelleher (Trial) is on the Junior Tap feedback list. |
| **D13** Rows stayed expanded after a mark | **Fixed** | Observed: Ottilie's row collapsed after Late (shot 05). |
| Parent-reported absence not on the register | **Fixed (code)** | Code: "Excused · reported by …" on the row, and "n — reported absent" on Today. No seeded report fell on the tested sessions. |
| Simplified mode, fewer tabs (Maureen) | **Not fixed** | All five tabs are still there: Today, Students, Messages, Material, Reports. |

**Net:** every round-1 blocker in the safety path (offline register, wrong-day guard, data loss in feedback) is fixed and was observed working. The remaining gaps are about where things show up: the clash warning, last feedback, and the header.

---

## 3. UI review, screen by screen

| # | Screen | Observation | Sev | Shot | Concrete improvement |
|---|---|---|---|---|---|
| U1 | `/teach` List (the default) | A same-school overlap that the teacher is booked into (16:00–16:45 and a 16:30 cover at another site) shows **no** clash in List, even on the day. Only "All my schools" and Week grid say CLASH. | **High** | 12, 03 | Use the same `clash` flag on List rows and on the Next hero: "CLASH · overlaps Junior Tap 16:30 (Greenwich)". Add a one-line banner above "Next two weeks" when any clash exists. |
| U2 | `/teach` Week grid (phone) | On a Saturday it opens on the **past** week (Mon 23–Sun 29 Nov). The room column takes about 40% of a 390 px screen, so you see about 1.5 days at a time. The text reads "**You also teaches** Contemporary Seniors" (grammar). | Medium | 02 | Default to the week containing the next class. On phone, use a day-per-row agenda, or put rooms as rows under each day. Fix the copy to "Also yours: Contemporary Seniors". |
| U3 | `/teach` All my schools | The useful part of the row (site and room) is truncated: "CLASH · Northstar Dance Academ…". "6 classes overlap" counts classes, not clashes, which makes it sound worse than 3 pairs. | Medium | 03 | Drop the school name when it matches the current school, or use its short name. Put "with Junior Tap 16:30" on the row (the code has `clash_with`). Say "3 clashes". |
| U4 | `/teach/register` phone header | "Tuesday 8 December · 16:00…": the time and room are still cut off. The school switcher takes a second row (about 50 px) on every register. | Medium | 15, 05 | Let the subtitle wrap to 2 lines, as on tablet. Hide the school switcher inside a register: switching school mid-register is never right. |
| U5 | `/teach/register` offline banner | The banner is excellent, but it is only at the top. Once you scroll, the only cue is the small grey "Saved on this phone" under each name. | Low | 05 | Repeat a compact "Offline · 3 waiting" in the sticky bottom bar next to "7 to mark". |
| U6 | First run offline | With no earlier controlled load, an offline reload sits on "Starting the database…" indefinitely and never mentions the network. | Medium (trust) | — | After about 10 s with `navigator.onLine === false`, show: "No signal and this phone hasn't saved Swayvo yet. Open it once on Wi-Fi before class." Also precache on first install. |
| U7 | `/teach/register` last feedback | Last feedback is the 5th block in the expanded row, after Late/Excused, Medical, Emergency contacts and Consent. The summary repeats "To work on" twice. | Medium | 15 | Put a one-line "Working on: Spotting in turns" under the name on the collapsed row, in ink-3. In the expanded view, put Last feedback directly under the marks and show the detail once. |
| U8 | `/teach/register` at 200% text | The header grows to about 300 px, and the sticky "Mark the rest here" bar covers the counts. No child row is visible on the first screen. | Medium (Maureen) | 25 | At large text: make the header a single line (title only), let the bottom bar collapse to the button only, and hide the switcher. |
| U9 | `/teach/feedback` phone | The child's chips stack one per line (12 chips is a long scroll for each child). The back arrow sits alone on a second header row (phone and tablet). | Low | 14, 10 | Wrap chips in a flowing row, as on tablet. Put the back arrow on the left of the title, as in the register. |
| U10 | `/teach/feedback` ordering | The child order changes between loads and between Save and Share (e.g. "Elias, Elsie, Iris, Lily…" → "Elias, Nia D, Rosa, Zara…" → "Elias, Nia D, Ottilie, Reuben…"). It also differs from the register, which is by last name. | Medium | — | Sort by last name everywhere and keep the order stable after a save. |
| U11 | `/teach/feedback` share | Edits made while "Share with families" is still sending can be lost (seen once). | Medium | — | Disable child editing while sharing, or clear only the drafts that were sent. |
| U12 | `/teach/students` "May need support" | Lists **only** the 2 children with medical notes, and the reason line is empty because "Medical notes" is filtered out of `why`. Kai Doherty (67%, "attendance, low") and Iris Salvatore (57%) are flagged amber in "Everyone" but are **not** in "May need support" (same run). It duplicates the "Medical notes 2" filter. | **High** | 17 | Include "Attendance below 70% this term" as a reason. Always show reasons in words ("Absent the last 2 weeks", "Medical"). Keep medical-only children out of this list, since the filter covers them. |
| U13 | `/class` Add material | After saving a video that shows 3 children with "Not recorded" consent, the confirmation says "**SHARED · Shared with Modern Juniors · Everyone in the class finds it…**". The card behind it says "STAFF ONLY · Hidden from families". The app contradicts itself. | **High** | 21 | When anything is held back, the success state must say so: "Saved for staff. Families will see it once all 3 named children have video consent." |
| U14 | `/class` Add material | Before any child is picked, the sheet lists every child's consent status: all 12 "NOT RECORDED" in the seed. The warning says "consent not given" when it is really "not recorded". There is no way to ask for consent from here. | Medium | 20 | Show the consent word only for ticked children. Distinguish "not recorded" from "withdrawn" in the warning. Add "Ask the office to request video consent from these 3 families". |
| U15 | `/class` material card (phone) | The title wraps into 3 lines next to the Play, people and delete icons. | Low | 21 | Put the actions on a second line on phone. |
| U16 | `/teach/messages` | A clear empty state: "Write to a family from a student's page". | — | — | Retain. Add a "New message" entry point here. |
| U17 | `/teach/reports` | Before term end it reads "No reports yet. Draft them when the term is nearly over". That is clear. | Low | — | Add the round-1 warning: "No feedback recorded this term for N children". |
| U18 | Kestrel "Urban" style | The dark theme reads well. Lime "Open register" is high contrast. The hero and list are identical in structure to Northstar, which is good for a teacher moving between schools. | — | 26 | Retain. |
| U19 | Tablet register | The two-column medical brief beside emergency contacts and consent is very readable. The header wraps correctly. | — | 29 | Retain. Make the phone match the wrap. |

---

## 4. Feature and function ideas

| Feature | Problem it solves | Who | Rating | Size / code area | Risks |
|---|---|---|---|---|---|
| **Clash everywhere** (List, hero, push on cover assignment) | A double booking is only visible in a secondary tab | 12, office | **Essential** | S · `teach/page.tsx` TeachRow and NextClass, reusing `clash` from the agenda query | None |
| **"Working on" line on the register row** | Coaches want last week's focus without expanding each child | 11, 13 | **Highly desirable** | S · `RegisterLine`, `LAST_FEEDBACK` batched per session | Space on phone. Make it one truncated line, togglable. |
| **Support-needs with real reasons** (low term attendance, 2+ absences in a row, same "to work on" 3×, no feedback in 4 weeks) | The current list only repeats medical notes | 11, 13, 14 | **Highly desirable** | M · `app.support_needs()`, `support-needs.tsx` | Labelling children. It is staff only already; keep it that way. |
| **Consent request from the upload sheet** | A teacher's video stays staff-only with no route forward | 11, 14 | **Highly desirable** | M · `media-children.tsx`, office task / outbox | Pressure on families. The wording must be neutral. |
| **Register-only mode** (Today + Register; other tabs under "More") | Low-confidence teachers are put off by 5 tabs | 15 | Useful | S · `shell.tsx` nav, staff preference | Discoverability for others |
| **Class progress matrix** (children × skills, then and now) | No class-level view of progress; spreadsheets persist | 13 | Highly desirable | M–L · `/teach/students` or a class page, using skill history | Pressure to over-assess young children. Respect tracking depth. |
| **Quick class headcount / fire list** (big number, "on site now" names, exportable) | Evacuation and pick-up checks | 14 | Useful | S · register page | None |
| **Personal phrase bank across classes** | Teachers retype their own phrases in every class | 11, 13 | Useful | S · `feedback_chip` with an owner | Drift from the school's voice |
| **Voice note → text for "in your words"** | Typing notes at 21:00 | 11, 13 | Nice to have | M · feedback composer | Accuracy and privacy of dictation |
| **"Ready offline" indicator on Today** ("Today's registers saved on this phone ✓") | Teachers can't tell whether the app will work in a basement | 14, 15 | Highly desirable | S · `pwa.tsx`, `sw.js` | It must be true. Check the cache. |

---

## 5. Branding feedback (perception level)

- **Name "Swayvo":** reads as friendly and dance-ish to Siân and Gwen. Maureen finds it "a bit app-y" but doesn't mind, because she sees her school's name more than Swayvo. Inside the app it is only "powered by swayvo" in the footer, which teachers think is the right amount.
- **Count-of-eight voice:** "Five, six, seven, eight." on `/welcome` and the store image landed with all five. Tomás thinks "Register in seconds" is true now, with "Mark the rest here" and offline. Small inconsistency: `/welcome` says "Tap Here or Absent: it works." but never mentions that it works with no signal. For teachers that is the headline benefit now, and it is verified.
- **School branding layering:** observed with Northstar (navy star mark) and Kestrel (dark "Urban", lime). Priya: "I always know which school I'm in. The colour flips with the switcher." That is the right layering for multi-school staff.
- **Colour and type:** the big display time (16:00) is loved; Gwen says "I can read it across the room". Word-plus-colour status (CLASH, NOT YET, OFFLINE, STAFF ONLY) is consistent and dyslexia-friendly. The uppercase amber "NOT RECORDED" ×12 in the upload sheet reads as alarming.
- **Store images:**
  - `05-teach.png` and `01-register.png` are attractive and accurate.
  - `01-register.png` shows the truncated header "Tuesday 1 December · 16:…". The marketing image advertises the bug. Fix U4, then regenerate.
  - The store images show no offline state. Teachers would value "No signal? Keep marking." as a store caption.
- **Copy:** the plain, kind voice is a strength: "Keep marking. Nothing is lost if the app closes", "Registers open 30 minutes before the class, so a mark cannot land on the wrong day." Weak spots:
  - "You also teaches" (U2).
  - "SHARED" when the item is not shared (U13).
  - "consent not given" when it is not recorded (U14).

---

## 6. Individual panel member reports

### Persona 11: Siân Morgan, full-time teacher, 17 classes/week (simulated)
- **What's better:**
  - Feedback went from my biggest complaint to my favourite feature. Select all, two phrases, Share: 4 taps for the whole class. Then I open the two children who deserve their own words.
  - "Same as last week" is handy.
  - Reopening my feedback shows what I wrote.
  - The offline register finally behaves.
- **Still frustrates:**
  - Last week's "to work on" is hidden at the bottom of an expanded row.
  - The feedback list changes order every time I save.
  - On my phone the chips are one per line.
- **Top 5 UI improvements:**
  1. A "Working on" line on the register row.
  2. Stable last-name order.
  3. Chips that wrap on phone.
  4. Register header that wraps.
  5. Back arrow on the left.
- **Top 3 features:**
  1. Support list with real reasons.
  2. Personal phrase bank.
  3. Voice notes.
- **Branding:** "Five, six, seven, eight" is exactly how my head works. The school's colours make it feel like ours.
- **Scores:** Relevance 9 · Quality 8 · Completeness 8 · Ease 8 · Efficiency 9 · Usefulness 8 · Adoption 8 · Continued use 8 · Visual design 8 · Brand appeal 8.
- **Overall 8/10** (round 1: 6.5). Bulk feedback gives me my evenings back. The remaining issues are polish.

### Persona 12: Priya Raman, freelance across two schools (simulated)
- **What's better:**
  - "All my schools" is what I asked for: Northstar and Kestrel in one list, "Only you see this", and a travel buffer I set myself.
  - Clashes are flagged there.
  - Ask for cover now has a handover box.
- **Still frustrates:**
  - On the actual Tuesday, my default List view showed Modern Juniors "On now" and Junior Tap cover at 16:30 with **no** warning. I only see the clash if I remember to switch tabs.
  - The site name, which is what I need to get across London, is truncated off the row.
  - The Week grid opened on last week.
- **Top 5 UI improvements:**
  1. Clash on List and hero.
  2. Show the site instead of the school name on rows.
  3. Week grid starts at the next class.
  4. "with Junior Tap 16:30" on the clash.
  5. Hide the switcher inside a register.
- **Top 3 features:**
  1. Clash everywhere, plus a push on cover assignment.
  2. A subscribable all-schools feed with sites (exists in code; I'd use it).
  3. Show the handover on the Today row.
- **Branding:** the colour flip between schools is clever. I never mark the wrong school's register.
- **Scores:** Relevance 9 · Quality 7 · Completeness 8 · Ease 7 · Efficiency 7 · Usefulness 8 · Adoption 8 · Continued use 7 · Visual design 8 · Brand appeal 7.
- **Overall 7.5/10** (round 1: 6). The diary exists now. The warning needs to be where I look.

### Persona 13: Tomás Herrera, exam and competition coach (simulated)
- **What's better:**
  - Skills are scoped to the class style (Modern skills only).
  - Levels wait for Share.
  - My edits to shared feedback are kept and marked "Shared · edited".
  - Last feedback shows near the top of the student panel.
- **Still frustrates:**
  - Bulk and "Same as last week" make generic feedback very easy. I'd like a nudge when a child has had the same phrases three weeks running.
  - There is still no class-level progress view.
  - I lost one edit when I typed while the share was still sending.
- **Top 5 UI improvements:**
  1. Stable ordering.
  2. Lock editing during share.
  3. "Working on" on the register.
  4. "Same phrases 3 weeks in a row" hint.
  5. Then-and-now on the student panel by default for full tracking.
- **Top 3 features:**
  1. Class progress matrix.
  2. Support list with real reasons.
  3. Video feedback per child, with consent handled as for material.
- **Branding:** professional but warm. The progress screen on `/welcome` sells the coaching side well.
- **Scores:** Relevance 8 · Quality 7 · Completeness 6 · Ease 7 · Efficiency 8 · Usefulness 7 · Adoption 7 · Continued use 7 · Visual design 8 · Brand appeal 7.
- **Overall 6.5/10** (round 1: 5.5). It is trustworthy now. Depth for coaches is still missing.

### Persona 14: Gwen Pritchard, teacher of 3–8 year olds (simulated)
- **What's better:**
  - With no signal, my Absent tap shows straight away with a red cross, and a banner says it is saved on this phone. After reconnecting, the absent child stays absent.
  - The 5–8 phrases with little pictures ("Listened beautifully", "Being brave") are lovely, and there is no skill picker for my little ones.
  - The trial child gets feedback too.
- **Still frustrates:**
  - The "May need support" list is just my two medical children, with no reason written.
  - When I uploaded a video of three children, it said "Shared with Modern Juniors" when it actually wasn't shared with the families.
- **Top 5 UI improvements:**
  1. A truthful upload confirmation.
  2. Support reasons in words.
  3. Offline status in the bottom bar.
  4. Calmer consent labels.
  5. Register header that wraps.
- **Top 3 features:**
  1. Consent request from the upload sheet.
  2. Headcount / fire list.
  3. A "Ready offline" tick on Today.
- **Branding:** the big words (OFFLINE, NOT YET, CLASH) are easy for me to read with dyslexia. The emoji chips feel made for small children.
- **Scores:** Relevance 9 · Quality 8 · Completeness 7 · Ease 8 · Efficiency 8 · Usefulness 8 · Adoption 8 · Continued use 8 · Visual design 8 · Brand appeal 8.
- **Overall 8/10** (round 1: 6). The register is safe now, which was my one condition.

### Persona 15: Maureen Hales, low tech confidence, older tablet (simulated)
- **What's better:**
  - I can't close next Thursday's register by mistake any more. It says "Not yet" and tells me when it opens.
  - When the Wi-Fi drops it says so in plain words, and nothing spins for ever.
  - The rows close after I tap Late.
- **Still frustrates:**
  - With my big text setting, the top of the screen and the bottom button fill the whole tablet and I can't see a single name.
  - It still has five tabs I never use.
  - If the very first time I open it there's no signal, it just says "Starting the database…", whatever that means.
- **Top 5 UI improvements:**
  1. Large-text layout for the register.
  2. Register-only mode.
  3. Plain first-run offline message.
  4. Header that wraps.
  5. Hide the school box on the register.
- **Top 3 features:**
  1. Register-only mode.
  2. A "Ready offline" tick.
  3. Headcount.
- **Branding:** I notice the school's name and star, not Swayvo. That's fine by me. "Five, six, seven, eight" made me smile.
- **Scores:** Relevance 7 · Quality 7 · Completeness 7 · Ease 6 · Efficiency 7 · Usefulness 7 · Adoption 6 · Continued use 6 · Visual design 7 · Brand appeal 7.
- **Overall 6.5/10** (round 1: 5). I'd trust it now. I'd use it more if it were smaller.

---

## 7. Votes (machine-readable)

| Persona | UI 1 | UI 2 | UI 3 | Feature 1 (rating) | Feature 2 (rating) | Feature 3 (rating) | Remove/simplify | Greatest impact |
|---|---|---|---|---|---|---|---|---|
| 11 Siân | Last feedback on register row | Stable feedback order | Wrap chips on phone | Support-needs reasons (Highly desirable) | Personal phrase bank (Useful) | Voice notes (Nice to have) | School switcher inside register | Last feedback on register row |
| 12 Priya | Clash on Today list | Site on agenda rows | Week grid opens on next class | Clash everywhere (Essential) | All-schools calendar feed (Useful) | Handover on Today row (Useful) | School switcher inside register | Clash on Today list |
| 13 Tomás | Stable feedback order | Lock edits during share | Last feedback on register row | Class progress matrix (Highly desirable) | Support-needs reasons (Highly desirable) | Video feedback (Nice to have) | Same-as-last-week without hint | Class progress matrix |
| 14 Gwen | Truthful upload confirmation | Support-needs reasons | Offline status in bottom bar | Consent request from upload (Highly desirable) | Headcount view (Useful) | Ready-offline indicator (Highly desirable) | Consent labels for unticked children | Truthful upload confirmation |
| 15 Maureen | Large-text register layout | Register-only mode | First-run offline message | Register-only mode (Useful) | Ready-offline indicator (Highly desirable) | Headcount view (Useful) | Teacher tabs | Large-text register layout |

---

## 8. Group summary

**Consensus**
- The round-1 safety blockers are fixed and were observed working:
  - The offline register: no lost absence, instant marks, plain banner, offline close, correct sync.
  - The wrong-day guard.
  - Feedback that keeps edits.
- Bulk feedback (4 taps for a class) and age-appropriate phrases change daily life.
- What remains is mostly about putting the right information where teachers already look:
  - The clash on List.
  - The "working on" line on the register row.
  - Support reasons.
  - A truthful upload confirmation.

**Disagreements (kept)**
- **Tomás vs Siân:** Tomás fears "Same as last week" and Select all will make feedback generic. Siân says they are the reason she will keep giving feedback at all.
- **Maureen vs Tomás:** Maureen wants fewer tabs and a register-only mode. Tomás wants more depth (a matrix, video).
- **Priya vs Gwen on the switcher:** Priya wants the school name gone from rows in favour of the site. Gwen likes always seeing the school colour.

**Top UI issues:** U1 clash missing on List · U12 support list shows only medical · U13 "Shared" confirmation for a staff-only video · U4/U8 phone header and large-text register · U10/U11 feedback order and share race.

**Group scores**

| Persona | Round 1 | Round 2 |
|---|---|---|
| 11 Siân | 6.5 | 8.0 |
| 12 Priya | 6.0 | 7.5 |
| 13 Tomás | 5.5 | 6.5 |
| 14 Gwen | 6.0 | 8.0 |
| 15 Maureen | 5.0 | 6.5 |
| **Group mean** | **5.8** | **7.3** |

Adoption likelihood (mean of persona Adoption scores): 5.4 → **7.4**. Continued use: 5.4 → **7.2**.

**Screenshots** (`docs/review/round2/shots/`)
- `teachers-02-week-grid-phone.jpg`
- `teachers-03-all-schools-phone.jpg`
- `teachers-05-register-offline-marks.jpg`
- `teachers-06-register-offline-closed.jpg`
- `teachers-07b-offline-direct-register.jpg`
- `teachers-10-feedback-bulk-selected.jpg`
- `teachers-12-today-on-the-day.jpg`
- `teachers-14-cover-feedback-chips-5to8.jpg`
- `teachers-15-register-last-feedback-at-door.jpg`
- `teachers-17-students-may-need-support.jpg`
- `teachers-20-material-shows-children.jpg`
- `teachers-21-material-hidden-from-families.jpg`
- `teachers-23-register-not-yet.jpg`
- `teachers-25-register-200pct-text.jpg`
- `teachers-26-kestrel-urban-today.jpg`
- `teachers-29-register-tablet-medical.jpg`
