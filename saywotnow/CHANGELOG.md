# Changelog

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
