# Changelog

## 1.7.0: Phase 2 (better conversations without AI)

- **Script personaliser (P2.1):** "Fill in the blanks" on each guide's During tab
  fills [placeholders] in the scripts, Copy and the large view. Held in memory only;
  no tone variants until reviewed ones exist.
- **SBI builder repaired (P2.2):** no "In in…", names and days keep capitals,
  "The impact was that…", optional request sentence, link to the feedback guide.
- **Templates (P2.3):** Full 1:1 shows core sections first with "More sections";
  T08 now says "What you said" and "Their response"; no "Sent from SayWotNow"
  footer on formal records (T03, T04, T05, T08).
- **Calendar file (P2.4):** "Add the dates to my calendar" downloads an .ics of
  agreed dates and action due dates, generic by default, built on the device.
- **Accessibility and desktop (P2.5):** WCAG 2.2 AA audit with axe (0 violations
  across 124 runs), 24px targets, a Home heading, 200% text and 320px reflow fixes,
  wider desktop lists. Report in `docs/ACCESSIBILITY.md`.
- Service worker cache `saywotnow-1.7.0-1`.

## 1.6.0: Phase 1 (find the right words quickly)

- **Search (P1.1):** full text of guides, templates, prep cards and reactions; a
  curated phrase list (`content/search.json`) so "always late", "crying", "bullying",
  "not pulling their weight" and "won't listen" find the right content; simple word
  endings; one-letter typo correction only when nothing matches; suggestions and
  a Quick Help link when there are no results. Risky terms show an HR-first or
  urgent (999) message and put G03 or G06 first. Nothing leaves the device.
- **Quick Help (P1.2):** the Home screen's main button. Two choices lead to a
  compact card built from the guide and its prep card; any serious concern goes to
  HR-first or urgent help, and a Level 3 guide's card shows its full gate first.
- **Cross-links (P1.3):** "the Flexible working guide (G13)" reads as a link
  without the code; guides have a "Related" section (G11 links to the SBI builder).
  The validator checks every reference.
- **Reactions (P1.4):** one-tap "If they react" chips on guides and Quick Help open
  a single sheet, with a link to all reactions.
- **Fixes (P1.5):** a deep link (e.g. #/meetings) survives first-run onboarding;
  no tab shows as current on Settings, Search or info pages; new users' 1:1 opens
  in Quick mode; a disabled Preview & send lists what's missing, each item taking
  you to the field; the action owner choice no longer wraps at 320–500px.
- New wording (search phrases, Quick Help labels) is in the review register as draft.
- Service worker cache `saywotnow-1.6.0-1`.

## 1.5.0: Phase 0 (safety, privacy, removals)

From the consolidated panel review plan, Phase 0.

- **Removed:** the Interview Pack Builder and the Bradford Factor (owner decision),
  including their routes, Toolkit and Settings entries, content, tests, the Word
  library and offline-cache entries. Saved interview packs and Bradford bands are
  deleted from the device on first launch, without a message (owner decision).
- **Privacy fix (P0.2):** a "No mail app?" sheet left open could copy notes after the
  form was discarded. Pop-ups that can act on a summary now close when the form is
  cleared or the screen changes, and rebuild the text from the live form when tapped.
- **HR-first gate (P0.3)** on "Contact HR first" guides (G03, G13), shown above all
  scripts and from every way in. Its wording is a draft awaiting review.
- **UK scope and review status (P0.4):** "UK guidance" and "UK rules" labels; the
  automatic "last reviewed" date is gone; every content file has honest review
  metadata, and the check refuses "approved" without a named reviewer.
- **Wellbeing and health (P0.5)** are left out of emails, copies and shares unless
  the manager includes them for that email. The preview says that anything sent
  leaves the app.
- **Review register (P0.6)** in `review/` for 54 items, with issues flagged (G13
  statutory claims, the disclaimer's liability sentence, crisis contacts and so
  on). EAP and OH are spelled out, and a near-duplicate G06 line is replaced.

### Release and rollback

- The service worker cache is `saywotnow-1.5.0-1`. Installed apps fetch the new
  version in the background and switch on next launch.
- **Rollback:** revert the Phase 0 merge on the default branch and push. GitHub
  Pages republishes v1.4 within minutes, and its service worker version
  (`saywotnow-1.4.0-2`) replaces the 1.5 cache on next launch. Interview packs and
  Bradford bands deleted on devices by 1.5 can't be restored by a rollback.
- **Manual acceptance checklist (owner):**
  - G03 and G13 show the HR-first gate above everything, from search, favourites and prep.
  - Fill T02 with wellbeing notes, preview: wellbeing is absent until switched on.
  - "No mail app?" → back → back → Discard: no pop-up remains and nothing can be copied.
  - Toolkit shows five tools; Settings has no Bradford section.
