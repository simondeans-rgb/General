/* Consent: capture, withdrawal and history (UR-08, migration 0047).
   One row per change; the current state is worked out in the database
   (latest settled choice, most restrictive when guardians differ). */
export type ConsentKind = 'photography' | 'video' | 'social_media';
export const CONSENT_KINDS: ConsentKind[] = ['photography', 'video', 'social_media'];

/** Labels and plain explanations. Schools may rename these later. */
export const CONSENT_LABEL: Record<ConsentKind, string> = {
  photography: 'Photos', video: 'Video', social_media: 'Social media and public use',
};
export const CONSENT_EXPLAIN: Record<ConsentKind, string> = {
  photography: 'Photos taken in class or at shows, used by the school (noticeboards, records, programmes).',
  video: 'Video recorded in class or at shows, for teaching and for families of the class.',
  social_media: 'Photos or video on the school’s website, social media, posters or in the press.',
};

export type ConsentState = { kind: ConsentKind; granted: boolean | null; disputed: boolean; changed_at: string | null };
export type ConsentChange = { kind: ConsentKind; granted: boolean; at: string; by_name: string; source: string; note: string | null };

export const CONSENTS = `select kind, granted, disputed, changed_at from app.consents($1)`;
export const CONSENT_HISTORY = `select * from app.consent_history($1)`;
/** $1 student, $2 kind, $3 granted, $4 note, $5 recorded on paper (office). */
export const SET_CONSENT = `select app.set_consent($1, $2, $3, $4, coalesce($5::boolean, false))`;

/** Teacher-visible extras beside the brief's photo_consent. */
export const BRIEF_CONSENTS = `select app.consent_now($1, 'video') as video_consent, app.consent_now($1, 'social_media') as social_consent`;

/** "Given" / "Not given" / "Not recorded". */
export function consentWord(v: boolean | null | undefined): string {
  return v === true ? 'Given' : v === false ? 'Not given' : 'Not recorded';
}
