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
| Sanaa staff see account facts only; inside a school only with the owner's time-limited, read-only, logged grant, never health records | Unrestricted operator access | Under UK GDPR Sanaa is the schools' data processor. Schools can be told, truthfully, that Sanaa cannot browse their children's records. |
| Sanaa creates schools and invites owners | Self-serve sign-up | Direct sales first; the invitation path already supports adding self-serve later. |
| Suspended and cancelled schools stay readable, with export, for 30 days | Locking everyone out | Families mid-term are not punished for the studio's billing, and a leaving school can take its data. |
| Plan limits stop additions, never delete | Enforcing by removal | Downgrading must never cost a school its records. |
| Platform staff see counts by role, not names, of a school's people | A full member list | Names of parents and children are the school's data, not Sanaa's. |
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
| The product is Sanaa; its wordmark is fixed outlines in Sanaa's own colours (eucalyptus or ivory, terracotta full stop) on every screen | Rendering the name in the school's colours or live font | The Sanaa logo looks the same whatever the school's theme; schools' own logo and colours sit alongside it. |
| Sanaa's palette (eucalyptus #0B3B34, ivory #F6F2EA, terracotta #C86A4F) and Fraunces headings are the default Classic look | A neutral default | A school that changes nothing still looks finished. |
| Monthly-priced classes are billed by month runs only; term runs bill term and course fees | One run billing everything, months × price | Schools on monthly fees expect a monthly invoice (and, later, a monthly Direct Debit). Each month is billed once. |
| A family's own discount is applied after the school rule (sibling or multi-class), not instead of it | Taking the larger | A bursary is agreed for a family's circumstances and should not disappear because a sibling rule also applies. **To confirm with the owner.** |
| Families see a bursary only as "Discount" | Showing the reason | Discretion: the reason is the office's business. |
| Pay before use is a school setting, off by default, with an on-account limit | Always requiring payment | Payments are not connected yet, and many schools trust known families. Public bookings are held 30 minutes rather than refused. |
| Public forms require reading the privacy notice; news by email is a separate, unticked choice | One combined tick | UK GDPR: transparency at collection, and marketing consent must be separate and freely given. |
| Rate limits live in the database (5 an hour per email or address, 100 per school) | Only at the edge | Works in the demo and cannot be bypassed by calling the function directly; the hosted edge can add more. |
| Enquiries with no activity are removed after 90 days (adjustable) | Keeping prospects indefinitely | Data minimisation; the figure is the school's to change. |
| Closed safeguarding concerns are kept until the school sets a period | A default deletion period | Safeguarding record periods are a matter for the school's policy and legal advice (often until the child is 25). |
| Old families are anonymised, not deleted, once the financial period passes | Deleting invoices | Totals and numbering stay intact for the accounts. |
| A family's reply to a teacher is visible to that teacher and to the office; there is still no private channel | Office-only replies (forwarded by hand) | Removes forwarding without creating a channel the school cannot see. |
| Notifications show for the chosen school only, with a count for the other | Mixing schools in one bell | Matches "choosing a school narrows everything". |
| The digest is daily at 5pm school time; urgent notices still go at once | Weekly, or digest everything | A day is the longest a parent should wait; cancellations today cannot wait. |
| Calendar links carry a random token, one per person per school; a new link retires the old | Signed URLs naming the person | A leaked link reveals a timetable, not an identity, and is easy to replace. |
| Exam grades are typed by the school; no syllabus text is held | Bundled RAD/ISTD syllabi | Avoids licensing syllabus content; every school's grade names work. |
| The programme names a child only with photography consent | Naming everyone | Being named at a public performance identifies a child as much as a photo does. **To confirm with the safeguarding lead.** |
| Tickets are booked by families of the school onto their account | Public ticket sales | Needs card payment (R-006) to sell to the public safely. |
| Students log practice; they never upload video; teachers attach demonstration links | Student video uploads | No student-uploaded video of children. |
| Office navigation is five areas plus Settings, each with its screens as tabs | Fourteen flat items | Findability; every screen is two taps away on a phone. |
| The demo loads its schema and sample school only when it builds the database | Bundling them with every page | Cuts each page's first download by about a third; irrelevant once hosted. |

