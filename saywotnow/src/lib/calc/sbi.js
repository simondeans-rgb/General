// SBI feedback builder (Section 10.6), repaired in v1.7 (P2.2):
//  - no doubled prepositions: "in this morning's update" or "during the call" are used as written;
//  - names, days and months keep their capitals ("Tuesday's call", "Priya");
//  - "The impact was that…" when the impact is a full clause ("we ran out of time");
//  - an optional Request / Next time sentence;
//  - one full stop per sentence, whatever the person typed.

const LEAD = /^(in|at|on|during|when|while|after|before|since|throughout|over|yesterday|today|this|last|earlier|first thing)\b/i;
// Words that start a sentence-like clause, so the impact needs "that".
const CLAUSE = /^(i|we|you|they|he|she|it|the|our|my|your|their|his|her|its|this|that|there|everyone|nobody|no one|people|customers?|clients?)\b/i;
const NAME_VERB = /^[A-Z][a-z]+ (was|were|had|has|did|didn't|couldn't|wasn't|felt|said|stopped|missed|asked)\b/;
const KEEP_CAPS = /^(I\b|[A-Z]{2}|(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)\b)/;
const COMMON_START = /^(the|this|that|these|those|a|an|our|my|your|their|his|her|its|last|yesterday|today|earlier|in|at|on|during|when|while|after|before|you|we|they|he|she|it|there|everyone|people|customers?|clients?)\b/i;

function tidy(s) {
  return String(s || '').replace(/\s+/g, ' ').trim().replace(/[.!\s]+$/, '');
}

/** Lowercases the first letter only for ordinary sentence starters, never for names, days or "I". */
function lowerFirst(s) {
  if (KEEP_CAPS.test(s)) return s;
  return COMMON_START.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

const upperFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function sentence(s) {
  const t = tidy(s);
  if (!t) return '';
  if (/[?]$/.test(t)) return upperFirst(t);
  return /^(could|would|can|will|do|are|is|shall)\b/i.test(t) ? `${upperFirst(t)}?` : `${upperFirst(t)}.`;
}

export function buildSbi({ type, situation, behaviour, impact, request }, nextLines) {
  const s = tidy(situation); const b = tidy(behaviour); const i = tidy(impact);
  if (!s || !b || !i) return null;
  const DAY = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/;
  const opening = LEAD.test(s) ? `${upperFirst(lowerFirst(s))}, ` : `${DAY.test(s) ? 'On' : 'In'} ${lowerFirst(s)}, `;
  const impactText = (CLAUSE.test(i) || NAME_VERB.test(i)) && !/^that\b/i.test(i) ? `that ${lowerFirst(i)}` : lowerFirst(i);
  const statement = `${opening}I noticed ${lowerFirst(b)}. The impact was ${impactText}.`;
  const ask = sentence(request);
  const next = (nextLines && nextLines[type]) || '';
  const parts = [statement, ask, next].filter(Boolean);
  return { statement, request: ask, next, text: parts.join(' ') };
}
