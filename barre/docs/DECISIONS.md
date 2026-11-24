# Product decisions

Where this build departs from the brief, or interprets it, and why.

| Decision | Instead of | Why |
|---|---|---|
| Teachers post notices to their own classes; conversations with families belong to the office | Teacher–parent direct messaging | Safeguarding: private one-to-one channels between staff and families of children are what UK guidance warns against. It also keeps money and health out of a teacher's view. |
| One conversation per family, like a messaging app | Email-style threads with subjects | Parents treat it as chat. A subject is optional, not required. |
| Structured requests (private lesson, medical update) stay a separate queue, linked from the Inbox | Merging them into conversation | They need a decision and an outcome, not just a reply. The Inbox says how many are waiting and links there. |
| Parent tab bar is Home · Schedule · Messages · Payments · Family; feedback, events and requests live under Family | Feedback as a top-level tab | Matches the brief's navigation and puts messages where parents expect them. |
| Automation rules are fixed events with a chosen template, on or off | A general rule builder | Studios need six automations, not a workflow language. New events slot into one SQL function. |
| Prospects without an account get automated messages by email (queued), families with one get them in-app | Forcing a family record at enquiry | A family trying a first class should not need an account. Email delivery is honest about not being connected. |
| Studio Pulse shows its five parts live and withholds the 0–100 score below 180 days of history or small samples | A score from day one | A confident number from three weeks of data would mislead an owner more than no number. |
| The assistant is an interface and a Cmd-K that routes common questions to the screen that answers them | Mock AI answers | Fake answers would be the most dangerous thing in a product holding children's data. |
| Card refunds are made in Stripe and arrive by webhook | A refund button that calls the provider | The ledger can never claim money went back that the bank did not return. |
| Voiding is only for invoices with no payments; otherwise refund | Free voiding | Keeps the money trail intact. |
| Credit is applied to the oldest open invoice automatically | Manual allocation | Fewer steps for the office; every allocation is still a visible row. |
| Notifications say *that* health details changed, never what | Including the detail | Notifications are shown on lock screens and in lists; health data is special-category. |
| Reports are a handful of rates with their sample size, two small charts | A dashboard of charts | Owners steer by five numbers; each links to the rows behind it. |
| Barre staff see account facts only; inside a school only with the owner's time-limited, read-only, logged grant, never health records | Unrestricted operator access | Under UK GDPR Barre is the schools' data processor. Schools can be told, truthfully, that Barre cannot browse their children's records. |
| Barre creates schools and invites owners | Self-serve sign-up | Direct sales first; the invitation path already supports adding self-serve later. |
| Suspended and cancelled schools stay readable, with export, for 30 days | Locking everyone out | Families mid-term are not punished for the studio's billing, and a leaving school can take its data. |
| Plan limits stop additions, never delete | Enforcing by removal | Downgrading must never cost a school its records. |
| Platform staff see counts by role, not names, of a school's people | A full member list | Names of parents and children are the school's data, not Barre's. |
| Teachers see a child's allergies, conditions, medication and emergency plan, with a marker for any recorded need (red for urgent, amber otherwise) | Only the allergy line, only for children flagged urgent | Owner's request: a teacher needs the asthma and the inhaler as much as the allergy. GP details still stay with the office. |
| One brand colour per school, used exactly; readability comes from choosing white or black text on it, and deepening only links and outlines | Full theme control, or substituting a darker colour | The school's own hex appears exactly as in its guidelines, and the app still cannot be made unreadable. |
| Logos are redrawn to a 256px PNG before saving | Storing the uploaded file as-is | Removes SVG scripts and photo metadata, keeps every page fast. |
| A term billing run raises drafts first; nothing is sent until the office sends them all | Issuing straight away | Thirty invoices are checked before any family sees one. |
| A child is never billed twice for a class in a term; late joiners pay pro rata by sessions left | Billing by enrolment date alone | A second run picks up only new joiners. |
| Sibling and multi-class discounts do not stack — the larger applies; both start switched off | Stacking, or on by default | Predictable for families; no school discounts by accident. **To confirm with the owner.** |
| Imports are checked row by row first, then applied all-or-nothing | Importing the good rows and skipping the bad | No half-imported school to untangle. |
| Undo is a ten-second delay before a removal is written | Writing, then restoring | Nothing to roll back; closing the page keeps the item. |
| Scheduled messages are hidden by a restrictive policy until their time, and released by the office's open app | A client-side timer only | No read path can reveal them early. With hosting, a scheduler calls the same function. |
| Teachers may write to a child's family; it lands in the family's conversation, visible to the office | Private teacher–parent threads | No private channels between staff and children's families. |
| Safeguarding tables have no read policy; reading goes through functions that log every view | Row-level read for owner and lead | The access log cannot be bypassed. |
| Choosing a school narrows every access helper; it never grants | Filtering on each screen | One school's data cannot leak into another's view whatever a query does. |
| Retention defaults: medical deleted 12 months after leaving, child anonymised after 36, invoices kept 72 | No defaults | Working defaults the owner can change. **To confirm with the school's adviser.** |
| Milestones count classes attended and shows done; absences never take anything away; no leaderboards | Streaks | Celebration without pressure. |
| Credit for a class the school cancels is a setting, off by default; when on, each enrolled child's per-class value goes on account once | Automatic credit always, or none | Schools differ; the owner chooses. **To confirm with the owner.** |
| Drop-ins use a pack first, else go on the family's account; cancelling 24h ahead costs nothing | Charging a card at booking | Works today without payments; card payment slots in when connected. |
| Invoices the system raises (packs, drop-ins) go through an internal function, never by borrowing an office login | Impersonating the owner | The audit trail stays truthful. |
| Notifications email only those who chose email, and wait for quiet hours — except same-day cancellations | Email everything | Respect people's evenings without missing what matters today. |
| Pilot tracking shows counts only | Showing names to the platform team | A school's people stay the school's data. |
| Two school styles, Classic and Urban, set the canvas (surfaces, type, corners, dark or light); the school's main and second colour go on top | Free-form theming | Every school looks like itself, and no combination can become unreadable: link and button text are fitted to the style's surface. |
| Fonts are self-hosted (Inter, Cormorant Garamond, Archivo) | Loading from Google Fonts | No third-party requests from families' phones; works offline. |
| Switching style keeps a school's own colours, and swaps only if it was using the old style's preset | Always resetting | A school's brand colour survives a change of style. |

