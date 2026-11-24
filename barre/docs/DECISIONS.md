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
