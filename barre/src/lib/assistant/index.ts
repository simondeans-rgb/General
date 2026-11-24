/**
 * The seam for a future studio assistant.
 *
 * The interface is the whole contract: a question goes in with the caller's
 * session, an answer comes back with the rows it was built from. A real
 * backend must run every query it makes through the caller's session (RLS),
 * so it can never tell a teacher something the teacher could not look up.
 *
 * Until one is connected, `assistant.available` is false and the palette
 * answers only with saved views — real screens that already answer the
 * question. It never generates text.
 */
export type AssistantAnswer = {
  text: string;
  /** Where the answer came from, so it can be checked. */
  sources: { label: string; href: string }[];
};

export interface AssistantBackend {
  available: boolean;
  ask(question: string, session: { userId: string; role: string }): Promise<AssistantAnswer>;
}

export const assistant: AssistantBackend = {
  available: false,
  async ask() { throw new Error('The studio assistant is not connected in this build.'); },
};

/** Questions the studio asks most, each answered today by an existing screen. */
export type SavedView = { question: string; answer: string; href: string; roles: string[]; keywords: string };

export const SAVED_VIEWS: SavedView[] = [
  { question: 'What needs my attention today?', answer: 'Today → Needs attention', href: '/today',
    roles: ['owner', 'admin'], keywords: 'today urgent attention problems' },
  { question: 'Who hasn’t paid?', answer: 'Billing → Needs action', href: '/billing',
    roles: ['owner', 'admin'], keywords: 'paid unpaid owe outstanding fees show money invoices overdue' },
  { question: 'Which payments failed?', answer: 'Billing → card declined', href: '/billing',
    roles: ['owner', 'admin'], keywords: 'failed declined card payment' },
  { question: 'Which classes have waiting lists?', answer: 'Reports → Classes, fullest first', href: '/reports',
    roles: ['owner', 'admin'], keywords: 'waiting list waitlist full capacity' },
  { question: 'Which students have poor attendance?', answer: 'Today → missed three in a row', href: '/today',
    roles: ['owner', 'admin'], keywords: 'attendance absent missing poor' },
  { question: 'How many trials converted?', answer: 'Enrolment → funnel', href: '/enrolment',
    roles: ['owner', 'admin'], keywords: 'trial conversion enquiries funnel' },
  { question: 'Message a class’s parents', answer: 'Inbox → new message to a class', href: '/inbox?compose=class',
    roles: ['owner', 'admin'], keywords: 'draft message email parents class broadcast' },
  { question: 'Who is in my class today?', answer: 'Today → your registers', href: '/teach',
    roles: ['teacher'], keywords: 'class register today students' },
];
