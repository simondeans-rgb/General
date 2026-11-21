// One-tap "If they react…" help (P1.4). Opens a single sheet: no nested sheets.
import { html } from '../vendor/preact-htm.js';
import { S } from '../strings.js';
import { content, navigate, showDialog } from './core.js';

const QUICK = [['R01', 'Upset'], ['R02', 'Angry or defensive'], ['R03', 'Gone quiet'], ['R04', 'Disagrees']];

export async function showReaction(id) {
  const r = content().reactions.reactions.find((x) => x.id === id);
  if (!r) return;
  const choice = await showDialog({
    title: `If they ${r.ifThey.charAt(0).toLowerCase()}${r.ifThey.slice(1)}`,
    sheet: true,
    contentFirst: true,
    content: () => html`<p class="react-sheet"><strong>${S.youCould} </strong>${r.youCould}</p>`,
    actions: [{ label: S.done, value: 'done', primary: true }, { label: S.allReactions, value: 'all' }],
  });
  if (choice === 'all') navigate('/reactions');
}

export function ReactChips() {
  return html`<div class="react-chips" role="group" aria-label=${S.reactChipsLabel}>
    <p class="mini-title">${S.reactChipsLabel}</p>
    <div class="chip-row left">
      ${QUICK.map(([id, label]) => html`<button type="button" class="pill" aria-label=${`${S.reactChipsLabel}: ${label}`} onClick=${() => showReaction(id)}>${label}</button>`)}
      <a class="pill" href="#/reactions" onClick=${(e) => { e.preventDefault(); navigate('/reactions'); }}>${S.allReactionsShort}</a>
    </div>
  </div>`;
}
