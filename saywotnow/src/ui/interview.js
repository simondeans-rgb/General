// Interview pack generator (ported from the aHRcade ACTED tool).
//  - Packs (role, panel names, chosen questions) are saved on this device only
//    when the user taps Save, and never hold candidate details.
//  - The builder's unsaved work and everything in interview mode (candidate
//    name, notes, ratings) live in memory only and are cleared on leaving.
import { html, useState, useEffect, useRef } from '../vendor/preact-htm.js';
import { S } from '../strings.js';
import { Icon } from './icons.js';
import {
  content, navigate, goBack, TopBar, FavStar, showDialog, toast, createStore, useStore, registerLeaveGuard, Disclosure,
} from './core.js';
import { DateInput } from './fields.js';
import { Notice } from './form.js';
import { getPrefs, setPref, toggleFavourite } from '../prefs.js';
import { formatLong, todayISO, isISODate } from '../lib/dates.js';
import { openMail, copySensitive, canShare } from '../platform.js';
import {
  MAX_PANEL, MAX_PACKS, newDraft, draftFromPack, assignee, panelNames, choiceComplete, setChoice, toggleCompetency,
  selectedCompetencies, dimensionsCovered, stepComplete, firstIncomplete, isDraftDirty, packFromDraft, resolvePack,
  duplicatePack, newId, newSession, ratedCount, sessionDirty, ratingLabel, recordText, matchCompetency,
} from '../lib/interview.js';
import { buildPackDocument, packFileName } from '../lib/interview-docx.js';

const PRIVATE = { autocomplete: 'off', autocorrect: 'off', spellcheck: false };
const lib = () => content().interview;
const dim = (id) => lib().dimensions.find((d) => d.id === id);
const packs = () => getPrefs().interviewPacks;
const STEPS = ['Role & panel', 'Competencies', 'Questions', 'Your pack'];

/* ------------------------------------------------------------------ */
/* In-memory state and leave guards                                    */
/* ------------------------------------------------------------------ */

const builderStore = createStore(null); // { draft, original, step, q }
const sessionStore = createStore(null); // interview session

const isBuilder = (p) => p[0] === 'interview' && (p[1] === 'new' || p[1] === 'edit');
const isRun = (p) => p[0] === 'interview' && p[1] === 'run';

registerLeaveGuard({
  owns: isBuilder,
  dirty: () => { const b = builderStore.get(); return !!b && isDraftDirty(b.draft, b.original); },
  clear: () => builderStore.set(null),
  title: 'Leave without saving?',
  body: "Your changes to this pack haven't been saved.",
});
registerLeaveGuard({
  owns: isRun,
  dirty: () => { const s = sessionStore.get(); return !!s && s.status !== 'done' && sessionDirty(s); },
  clear: () => sessionStore.set(null),
  title: 'Leave this interview?',
  body: 'Notes and ratings are only kept while you stay in the interview. Save or email the record first if you need it.',
});

const updateBuilder = (fn) => builderStore.set((b) => (b ? fn(b) : b));
const updateDraft = (fn) => updateBuilder((b) => ({ ...b, draft: fn(b.draft) }));
const updateSession = (fn) => sessionStore.set((s) => (s ? fn(s) : s));

function savePack(draft) {
  const existing = draft.id ? packs().find((p) => p.id === draft.id) : null;
  if (!existing && packs().length >= MAX_PACKS) throw new Error(`You can save up to ${MAX_PACKS} packs. Delete one to make room.`);
  const pack = packFromDraft(lib(), draft, { id: draft.id || newId(), createdAt: existing?.createdAt });
  setPref('interviewPacks', [pack, ...packs().filter((p) => p.id !== pack.id)]);
  return pack;
}

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

function DimDot({ id, size = 'md' }) {
  const d = dim(id);
  return html`<span class=${`dim-dot dim-${size}`} data-dim=${id} aria-hidden="true">${(d?.name || id)[0]}</span>`;
}

function LevelChip({ level }) {
  return html`<span class=${`level-chip level-${level.toLowerCase()}`}>${level}</span>`;
}

function Stats() {
  const L = lib();
  const q = L.competencies.reduce((n, c) => n + c.questions.length, 0);
  return html`<dl class="iv-stats">
    <div><dt>Dimensions</dt><dd>${L.dimensions.length}</dd></div>
    <div><dt>Competencies</dt><dd>${L.competencies.length}</dd></div>
    <div><dt>Questions</dt><dd>${q}</dd></div>
    <div><dt>Levels</dt><dd>${L.levels.length}</dd></div>
  </dl>`;
}

async function downloadWord(pack, { candidate = '', date = '' } = {}) {
  const { default: docx } = await import('../vendor/docx.min.js');
  const doc = buildPackDocument(docx, lib(), resolvePack(lib(), pack), { candidate, date, formatDate: formatLong });
  const blob = await docx.Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = packFileName(pack.role);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/* ------------------------------------------------------------------ */
/* Tool home: saved packs                                              */
/* ------------------------------------------------------------------ */

export function InterviewTool({ tool, prefs }) {
  const L = lib();
  const list = prefs.interviewPacks;
  const go = (e, to) => { e.preventDefault(); navigate(to); };

  const remove = async (p) => {
    const ok = await showDialog({
      title: 'Delete this pack?',
      body: `"${p.role}" will be removed from this device. This can't be undone.`,
      actions: [{ label: 'Keep it', value: false, primary: true }, { label: 'Delete', value: true, danger: true }],
    });
    if (ok) { setPref('interviewPacks', packs().filter((x) => x.id !== p.id)); toast('Pack deleted.'); }
  };
  const duplicate = (p) => {
    if (packs().length >= MAX_PACKS) { toast(`You can save up to ${MAX_PACKS} packs.`); return; }
    const copy = duplicatePack(p, newId());
    setPref('interviewPacks', [copy, ...packs()]);
    toast('Pack duplicated.');
  };

  return html`<div class="screen tool-screen iv-home">
    <${TopBar} title=${tool.title} back=${() => goBack('/toolkit')}
      right=${html`<${FavStar} id=${tool.id} favs=${prefs.favourites} onToggle=${toggleFavourite} title=${tool.title} />`} />
    <p class="lede">Build structured, competency-based interviews in minutes: consistent, evidence-led and ready to use.</p>
    <a class="btn btn-primary btn-block" href="#/interview/new" onClick=${(e) => go(e, '/interview/new')}><${Icon} name="plus" size=${20} /> Create an interview pack</a>

    <h2 class="section-title">Your packs</h2>
    ${list.length ? html`<ul class="card-list" role="list">
      ${list.map((p) => html`<li class="card iv-pack" key=${p.id}>
        <span class="card-title">${p.role}</span>
        <span class="card-sub">${[p.func, p.seniority].filter(Boolean).join(' · ') || 'Reusable interview pack'}</span>
        <span class="iv-pack-meta">
          <span class="iv-dots" aria-label=${`Dimensions covered: ${[...new Set(resolvePack(L, p).items.map((c) => dim(c.dimension)?.name))].join(', ')}`}>
            ${L.dimensions.map((d) => html`<span class=${`dim-pip ${resolvePack(L, p).items.some((c) => c.dimension === d.id) ? 'on' : ''}`} data-dim=${d.id}></span>`)}
          </span>
          ${p.competencies.length} competencies · ${p.panel.length || 'no'} interviewer${p.panel.length === 1 ? '' : 's'}
        </span>
        <div class="btn-row">
          <a class="btn btn-primary btn-small" href=${`#/interview/run/${p.id}`} onClick=${(e) => go(e, `/interview/run/${p.id}`)}>Start interview</a>
          <a class="btn btn-secondary btn-small" href=${`#/interview/edit/${p.id}`} onClick=${(e) => go(e, `/interview/edit/${p.id}`)} aria-label=${`Open ${p.role}`}>Open</a>
          <button type="button" class="btn btn-secondary btn-small" onClick=${() => duplicate(p)} aria-label=${`Duplicate ${p.role}`}>Duplicate</button>
          <button type="button" class="btn btn-secondary btn-small" onClick=${() => remove(p)} aria-label=${`Delete ${p.role}`}>Delete</button>
        </div>
      </li>`)}
    </ul>` : html`<div class="empty-state"><${Icon} name="clipboard" size=${44} /><p>No interview packs yet. Create your first one and it'll appear here.</p></div>`}

    <h2 class="section-title">The ${L.methodology.name} library</h2>
    <a class="card card-link iv-explore" href="#/interview/library" onClick=${(e) => go(e, '/interview/library')}>
      <span class="iv-acted">${L.dimensions.map((d) => html`<${DimDot} id=${d.id} />`)}</span>
      <span class="card-title">${L.methodology.headline}</span>
      <span class="card-sub">${L.methodology.intro}</span>
    </a>
    <p class="privacy-line"><${Icon} name="lock" size=${16} /> Packs are saved on this device and never include candidate details. Interview notes and ratings are only kept while the interview is open.</p>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Library explorer                                                    */
/* ------------------------------------------------------------------ */

export function InterviewLibrary({ id }) {
  const L = lib();
  const comp = id ? L.competencies.find((c) => c.id === id) : null;
  const [tab, setTab] = useState(comp ? comp.dimension : L.dimensions[0].id);
  const go = (to) => navigate(to);
  if (id && !comp) return html`<div class="screen"><${TopBar} title="Not found" back=${() => navigate('/interview/library')} /><p class="empty">That competency doesn't exist.</p></div>`;

  if (comp) {
    const d = dim(comp.dimension);
    return html`<div class="screen iv-library">
      <${TopBar} title=${comp.name} sub=${`${L.methodology.name} · ${d.name}`} back=${() => goBack('/interview/library')} />
      <p class="iv-def">${comp.definition}</p>
      ${L.levels.map((lv) => {
        const qs = comp.questions.filter((q) => q.level === lv);
        const start = comp.questions.findIndex((q) => q.level === lv) + 1;
        return qs.length ? html`<section key=${lv}>
          <h2 class="mini-title">${lv}</h2>
          <ol class="iv-qlist" start=${start}>${qs.map((q) => html`<li>${q.text}</li>`)}</ol>
        </section>` : null;
      })}
      <${Indicators} d=${d} />
    </div>`;
  }

  const d = dim(tab);
  return html`<div class="screen iv-library">
    <${TopBar} title=${`Explore ${L.methodology.name}`} back=${() => goBack('/tool/interview')} />
    <p class="lede">${L.methodology.intro}</p>
    <${Stats} />
    <div class="iv-dimtabs" role="tablist" aria-label=${`${L.methodology.name} dimensions`}>
      ${L.dimensions.map((x) => html`<button type="button" role="tab" aria-selected=${x.id === tab} class=${x.id === tab ? 'on' : ''} data-dim=${x.id} onClick=${() => setTab(x.id)}>
        <${DimDot} id=${x.id} /><span>${x.name}</span></button>`)}
    </div>
    <div role="tabpanel" aria-label=${d.name}>
      <ul class="card-list" role="list">
        ${L.competencies.filter((c) => c.dimension === tab).map((c) => html`<li key=${c.id}><a class="card card-link" href=${`#/interview/library/${c.id}`} onClick=${(e) => { e.preventDefault(); go(`/interview/library/${c.id}`); }}>
          <span class="card-title">${c.name}</span>
          <span class="card-sub">${c.definition}</span>
          <span class="card-meta">${c.questions.length} questions</span>
        </a></li>`)}
      </ul>
      <${Indicators} d=${d} />
    </div>
  </div>`;
}

function Indicators({ d }) {
  return html`<div class="iv-indicators">
    <section class="iv-good"><h2 class="mini-title">What good looks like</h2><ul class="bullets">${d.good.map((t) => html`<li>${t}</li>`)}</ul></section>
    <section class="iv-watch"><h2 class="mini-title">Watch-outs</h2><ul class="bullets">${d.watchOuts.map((t) => html`<li>${t}</li>`)}</ul></section>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Builder                                                             */
/* ------------------------------------------------------------------ */

export function InterviewBuilder({ id }) {
  const b = useStore(builderStore);
  const existing = id ? packs().find((p) => p.id === id) : null;
  useEffect(() => {
    const cur = builderStore.get();
    if (cur && cur.forId === (id || null)) return;
    if (id && !existing) return;
    const draft = existing ? draftFromPack(existing) : newDraft();
    builderStore.set({ forId: id || null, draft, original: existing ? draftFromPack(existing) : newDraft(), step: existing ? 4 : 1, q: 0 });
  }, [id]);
  const topRef = useRef(null);
  if (id && !existing) return html`<div class="screen"><${TopBar} title="Not found" back=${() => navigate('/tool/interview')} /><p class="empty">That pack isn't on this device.</p></div>`;
  if (!b) return null;
  const { draft, step } = b;
  const L = lib();
  const ok = stepComplete(L, draft, step);
  const setStep = (n) => {
    updateBuilder((x) => ({ ...x, step: n, q: n === 3 ? Math.max(0, firstIncomplete(L, x.draft)) : x.q }));
    window.scrollTo(0, 0);
    setTimeout(() => document.querySelector('#main h1')?.focus({ preventScroll: true }), 0);
  };

  return html`<div class="screen iv-builder" ref=${topRef}>
    <${TopBar} title=${draft.id ? 'Interview pack' : 'New interview pack'} sub=${`Step ${step} of 4 · ${STEPS[step - 1]}`}
      back=${() => (step > 1 && !(draft.id && step === 4) ? setStep(step - 1) : goBack('/tool/interview'))} />
    <ol class="iv-steps" aria-label="Progress">
      ${STEPS.map((s, i) => html`<li class=${i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''} aria-current=${i + 1 === step ? 'step' : undefined}>
        <span>${i + 1}</span><b>${s}</b></li>`)}
    </ol>
    ${step === 1 ? html`<${StepRole} draft=${draft} />` : null}
    ${step === 2 ? html`<${StepCompetencies} draft=${draft} />` : null}
    ${step === 3 ? html`<${StepQuestions} draft=${draft} q=${b.q} />` : null}
    ${step === 4 ? html`<${StepPack} b=${b} />` : null}
    ${step < 4 ? html`<div class="sticky-cta iv-cta">
      ${step === 2 ? html`<p class="cta-note">${draft.competencies.length} selected</p>` : null}
      ${step === 3 ? html`<p class="cta-note">${selectedCompetencies(L, draft).filter((c) => choiceComplete(draft.choices[c.id])).length} of ${selectedCompetencies(L, draft).length} complete</p>` : null}
      <button type="button" class=${`btn btn-primary btn-block ${ok ? '' : 'is-disabled'}`} aria-disabled=${ok ? undefined : 'true'}
        onClick=${() => {
          if (ok) { setStep(step + 1); return; }
          toast(step === 1 ? 'Enter the role to continue.' : step === 2 ? 'Choose at least one competency.' : 'Choose a primary and a backup question for every competency.');
          if (step === 3) updateBuilder((x) => ({ ...x, q: Math.max(0, firstIncomplete(L, x.draft)) }));
        }}>Continue</button>
    </div>` : null}
  </div>`;
}

function TextField({ id, label, value, onInput, placeholder, optional, required, area, max = 80 }) {
  return html`<div class="field">
    <label class="field-label" for=${id}>${label}${required ? html`<span class="req" aria-hidden="true"> *</span>` : null}${optional ? html`<span class="opt"> (optional)</span>` : null}</label>
    ${area
      ? html`<textarea id=${id} class="input textarea short" rows="4" maxlength=${max} value=${value} placeholder=${placeholder} ...${PRIVATE} onInput=${(e) => onInput(e.target.value)} />`
      : html`<input id=${id} class="input" type="text" maxlength=${max} value=${value} placeholder=${placeholder} required=${required} ...${PRIVATE} onInput=${(e) => onInput(e.target.value)} />`}
  </div>`;
}

function StepRole({ draft }) {
  const set = (k) => (v) => updateDraft((d) => ({ ...d, [k]: v }));
  const setPanel = (i, v) => updateDraft((d) => ({ ...d, panel: d.panel.map((n, j) => (j === i ? v : n)) }));
  return html`<div class="form iv-step">
    <h2 class="iv-step-title">Role & interview panel</h2>
    <${TextField} id="iv-role" label="Role" required value=${draft.role} onInput=${set('role')} placeholder="e.g. Head of Product" />
    <${TextField} id="iv-func" label="Function" optional value=${draft.func} onInput=${set('func')} placeholder="e.g. Product" />
    <${TextField} id="iv-level" label="Level / seniority" optional value=${draft.seniority} onInput=${set('seniority')} placeholder="e.g. Director" />
    <${TextField} id="iv-desc" label="Role description" optional area max=${2000} value=${draft.description} onInput=${set('description')} placeholder="Paste or enter a short role description" />
    <fieldset class="field iv-panel">
      <legend class="field-label">Interview panel<span class="opt"> (optional)</span></legend>
      <p class="field-help">${lib().guidance.panelHelp}</p>
      ${draft.panel.map((n, i) => html`<div class="iv-panel-row" key=${i}>
        <span class="iv-panel-n" aria-hidden="true">${i + 1}</span>
        <input class="input" type="text" maxlength="60" value=${n} aria-label=${`Interviewer ${i + 1} name`} placeholder=${i === 0 ? 'Interviewer name' : 'Additional interviewer name'} ...${PRIVATE}
          onInput=${(e) => setPanel(i, e.target.value)} />
        ${i > 0 ? html`<button type="button" class="icon-btn" aria-label=${`Remove interviewer ${i + 1}`} onClick=${() => updateDraft((d) => ({ ...d, panel: d.panel.filter((_, j) => j !== i) }))}><${Icon} name="close" /></button>` : html`<span class="icon-btn-spacer"></span>`}
      </div>`)}
      <button type="button" class="btn btn-secondary btn-small" disabled=${draft.panel.length >= MAX_PANEL}
        onClick=${() => { updateDraft((d) => ({ ...d, panel: [...d.panel, ''] })); setTimeout(() => document.querySelector('.iv-panel-row:last-of-type input')?.focus(), 0); }}>
        <${Icon} name="plus" size=${18} /> Add interviewer</button>
    </fieldset>
  </div>`;
}

function StepCompetencies({ draft }) {
  const L = lib();
  const [q, setQ] = useState('');
  const covered = dimensionsCovered(L, draft);
  const all = covered.size === L.dimensions.length;
  return html`<div class="iv-step">
    <h2 class="iv-step-title">Choose competencies</h2>
    <p class="lede">${L.guidance.competencyStep}</p>
    <div class=${`iv-coverage ${all ? 'complete' : ''}`} role="status">
      <div><b>${all ? `All ${L.dimensions.length} ${L.methodology.name} dimensions represented` : `${covered.size} of ${L.dimensions.length} ${L.methodology.name} dimensions represented`}</b>
        <span>${all ? L.guidance.coverageComplete : L.guidance.coverageAdvice}</span></div>
      <div class="iv-acted">${L.dimensions.map((d) => html`<span class=${`dim-dot ${covered.has(d.id) ? '' : 'off'}`} data-dim=${d.id} aria-hidden="true">${d.name[0]}</span>`)}</div>
    </div>
    <label class="sr-only" for="iv-search">Search competencies</label>
    <input id="iv-search" class="input iv-search" type="search" value=${q} placeholder=${`Search ${L.competencies.length} competencies…`} ...${PRIVATE} onInput=${(e) => setQ(e.target.value)} />
    ${L.dimensions.map((d) => {
      const items = L.competencies.filter((c) => c.dimension === d.id && matchCompetency(c, q));
      if (!items.length) return null;
      return html`<section class="iv-group" key=${d.id} aria-labelledby=${`g-${d.id}`}>
        <header><${DimDot} id=${d.id} /><h3 id=${`g-${d.id}`}>${d.name}</h3><span>${draft.competencies.filter((id) => L.competencies.find((c) => c.id === id)?.dimension === d.id).length} selected</span></header>
        <ul class="iv-comp-grid" role="list">
          ${items.map((c) => {
            const on = draft.competencies.includes(c.id);
            return html`<li key=${c.id}><button type="button" class=${`iv-comp ${on ? 'on' : ''}`} aria-pressed=${on} onClick=${() => updateDraft((x) => toggleCompetency(x, c.id))}>
              <span class="iv-check" aria-hidden="true">${on ? html`<${Icon} name="check" size=${16} />` : html`<${Icon} name="plus" size=${16} />`}</span>
              <b>${c.name}</b><small>${c.definition}</small>
            </button></li>`;
          })}
        </ul>
      </section>`;
    })}
  </div>`;
}

function StepQuestions({ draft, q }) {
  const L = lib();
  const list = selectedCompetencies(L, draft);
  const idx = Math.min(q, list.length - 1);
  const c = list[idx];
  const done = list.filter((x) => choiceComplete(draft.choices[x.id])).length;
  const setQ = (n) => { updateBuilder((x) => ({ ...x, q: n })); window.scrollTo(0, 0); };
  if (!c) return null;
  const ch = draft.choices[c.id] || {};
  const choose = (slot, qid) => {
    const before = draft.choices[c.id];
    updateDraft((d) => ({ ...d, choices: setChoice(d.choices, c.id, slot, qid) }));
    const after = setChoice(draft.choices, c.id, slot, qid)[c.id];
    if (!choiceComplete(before) && choiceComplete(after) && idx < list.length - 1) {
      setTimeout(() => { setQ(idx + 1); toast(`${c.name} done.`, 1500); }, 250);
    }
  };
  const d = dim(c.dimension);
  return html`<div class="iv-step">
    <h2 class="iv-step-title">Select primary & backup questions</h2>
    <p class="lede">${L.guidance.questionStep}</p>
    <div class="iv-progress"><b>${idx + 1} of ${list.length}</b><span>${done} competencies complete</span>
      <progress max=${list.length} value=${done} aria-label="Competencies complete"></progress></div>
    <div class="iv-qtabs" role="group" aria-label="Competencies">
      ${list.map((x, i) => html`<button type="button" class=${`${i === idx ? 'on' : ''} ${choiceComplete(draft.choices[x.id]) ? 'complete' : ''}`}
        aria-current=${i === idx ? 'true' : undefined} aria-label=${`${i + 1}: ${x.name}${choiceComplete(draft.choices[x.id]) ? ', complete' : ''}`} onClick=${() => setQ(i)}>${i + 1}</button>`)}
    </div>
    <article class="iv-picker">
      <header><${DimDot} id=${c.dimension} size="lg" /><div><small>${d.name}</small><h3>${c.name}</h3><p>${c.definition}</p></div></header>
      <p class="iv-legend"><span><i class="p"></i> Primary: ask first</span><span><i class="b"></i> Backup: use if needed</span></p>
      <ul class="iv-qrows" role="list">
        ${c.questions.map((qq, i) => {
          const isP = ch.primary === qq.id;
          const isB = ch.backup === qq.id;
          return html`<li key=${qq.id} class=${`iv-qrow ${isP ? 'is-primary' : ''} ${isB ? 'is-backup' : ''}`}>
            <div class="iv-qtext"><${LevelChip} level=${qq.level} /><p><b>${String(i + 1).padStart(2, '0')}</b> ${qq.text}</p></div>
            <div class="iv-qbtns">
              <button type="button" class=${`btn btn-small ${isP ? 'btn-primary' : 'btn-secondary'}`} aria-pressed=${isP} disabled=${isB}
                aria-label=${`Primary: ${qq.text}`} onClick=${() => choose('primary', isP ? '' : qq.id)}>${isP ? html`<${Icon} name="check" size=${16} /> Primary` : 'Primary'}</button>
              <button type="button" class=${`btn btn-small ${isB ? 'btn-teal' : 'btn-secondary'}`} aria-pressed=${isB} disabled=${isP}
                aria-label=${`Backup: ${qq.text}`} onClick=${() => choose('backup', isB ? '' : qq.id)}>${isB ? html`<${Icon} name="check" size=${16} /> Backup` : 'Backup'}</button>
            </div>
          </li>`;
        })}
      </ul>
    </article>
    <div class="btn-row iv-qnav">
      <button type="button" class="btn btn-secondary btn-small" disabled=${idx === 0} onClick=${() => setQ(idx - 1)}><${Icon} name="back" size=${16} /> Previous competency</button>
      <button type="button" class="btn btn-secondary btn-small" disabled=${idx === list.length - 1} onClick=${() => setQ(idx + 1)}>Next competency <${Icon} name="chevron" size=${16} /></button>
    </div>
  </div>`;
}

function StepPack({ b }) {
  const L = lib();
  const { draft } = b;
  const dirty = isDraftDirty(draft, b.original);
  const [busy, setBusy] = useState(false);
  const [cand, setCand] = useState({ name: '', date: todayISO() });
  const list = selectedCompetencies(L, draft);
  const panel = panelNames(draft.panel);
  const covered = dimensionsCovered(L, draft);
  // A pack-shaped object for exports, whether or not it's been saved yet.
  const asPack = () => packFromDraft(L, draft, { id: draft.id || 'unsaved' });

  const save = () => {
    try {
      const pack = savePack(draft);
      builderStore.set({ ...b, forId: pack.id, draft: draftFromPack(pack), original: draftFromPack(pack) });
      if (!draft.id) navigate(`/interview/edit/${pack.id}`, { replace: true, skipGuard: true });
      toast('Pack saved on this device.');
      return pack;
    } catch (e) { toast(e.message); return null; }
  };
  const exportWord = async (custom) => {
    if (custom && (!cand.name.trim() || !isISODate(cand.date))) { toast('Enter the candidate name and interview date.'); return; }
    setBusy(true);
    try {
      await downloadWord(asPack(), custom ? { candidate: cand.name.trim(), date: cand.date } : {});
      toast(custom ? 'Word pack downloaded. Candidate details were not saved.' : 'Word pack downloaded.');
    } catch (e) { console.error(e); toast("The pack couldn't be created. Please try again."); }
    finally { setBusy(false); }
  };
  const start = () => {
    const pack = dirty || !draft.id ? save() : packs().find((p) => p.id === draft.id);
    if (pack) navigate(`/interview/run/${pack.id}`, { skipGuard: true }).then(() => builderStore.set(null));
  };

  return html`<div class="iv-step print-hide-wrap">
    <div class="print-hide">
      <div class="iv-hero">
        <div><small>Reusable interview pack</small><h2>${draft.role.trim()}</h2>
          <p>${covered.size} of ${L.dimensions.length} dimensions · ${list.length} competencies</p></div>
        <button type="button" class=${`btn ${dirty || !draft.id ? 'btn-primary' : 'btn-secondary'} btn-small`} onClick=${save} disabled=${!dirty && !!draft.id}>
          ${draft.id ? (dirty ? 'Save changes' : 'Saved') : 'Save pack'}</button>
      </div>
      <button type="button" class="btn btn-primary btn-block" onClick=${start}>Start interview <${Icon} name="chevron" size=${18} /></button>
      <p class="privacy-line"><${Icon} name="lock" size=${16} /> Candidate details, notes and ratings are only kept while the interview is open.</p>

      <dl class="iv-summary">
        <div><dt>Function</dt><dd>${draft.func.trim() || 'Not specified'}</dd></div>
        <div><dt>Interviewers</dt><dd>${panel.length}</dd></div>
        <div><dt>Competencies</dt><dd>${list.length}</dd></div>
        <div><dt>Questions</dt><dd>${list.length * 2}</dd></div>
      </dl>

      <h3 class="mini-title">Who asks what</h3>
      <ul class="iv-who" role="list">
        ${list.map((c, i) => html`<li key=${c.id}><${DimDot} id=${c.dimension} /><span><b>${c.name}</b><small>${assignee(draft.panel, i)}</small></span>
          <button type="button" class="link-btn" onClick=${() => updateBuilder((x) => ({ ...x, step: 3, q: i }))}>Change</button></li>`)}
      </ul>
      <div class="btn-row">
        <button type="button" class="btn btn-secondary btn-small" onClick=${() => updateBuilder((x) => ({ ...x, step: 1 }))}>Edit role & panel</button>
        <button type="button" class="btn btn-secondary btn-small" onClick=${() => updateBuilder((x) => ({ ...x, step: 2 }))}>Edit competencies</button>
      </div>

      <section class="iv-export" aria-labelledby="exp-h">
        <h3 id="exp-h">Export the pack</h3>
        <p>Generic exports contain no candidate information. Candidate details used for a customised copy are never saved.</p>
        <div class="btn-row">
          <button type="button" class="btn btn-primary btn-small" disabled=${busy} onClick=${() => exportWord(false)}><${Icon} name="doc" size=${18} /> Download Word pack</button>
          <button type="button" class="btn btn-secondary btn-small" onClick=${() => window.print()}><${Icon} name="share" size=${18} /> Print / save as PDF</button>
        </div>
        <${Disclosure} summary="Customise for a candidate">
          <div class="field"><label class="field-label" for="iv-cand">Candidate name</label>
            <input id="iv-cand" class="input" type="text" maxlength="80" value=${cand.name} ...${PRIVATE} onInput=${(e) => setCand({ ...cand, name: e.target.value })} /></div>
          <div class="field"><label class="field-label" for="iv-cdate">Interview date</label>
            <${DateInput} id="iv-cdate" value=${cand.date} label="Interview date" onChange=${(v) => setCand({ ...cand, date: v })} /></div>
          <button type="button" class="btn btn-secondary btn-small" disabled=${busy} onClick=${() => exportWord(true)}><${Icon} name="doc" size=${18} /> Download customised Word pack</button>
        </${Disclosure}>
        <p class="iv-included"><b>Included in the Word pack:</b> cover and allocation · how-to-use guidance · STAR prompts · five-point rating scale · one working section per competency · notes and rating boxes · panel evaluation and decision.</p>
      </section>
    </div>
    <${PackPrint} pack=${resolvePack(L, asPack())} />
  </div>`;
}

/* Printable pack (Print / save as PDF). Hidden on screen. */
function PackPrint({ pack }) {
  const L = lib();
  const panel = panelNames(pack.panel);
  const scale = [...L.ratingScale].reverse();
  return html`<article class="print-doc" aria-hidden="true">
    <p class="pd-brand">SayWotNow</p>
    <h1>Competency Based Interview Pack</h1>
    <table class="pd-cover"><tbody>
      <tr><th>Role</th><td><b>${pack.role}</b></td></tr>
      <tr><th>Function</th><td>${pack.func || '-'}</td></tr>
      <tr><th>Level</th><td>${pack.seniority || '-'}</td></tr>
      <tr><th>Candidate</th><td>Generic reusable pack</td></tr>
      <tr><th>Interview panel</th><td>${panel.join(' · ') || '-'}</td></tr>
    </tbody></table>
    ${pack.description ? html`<h2>Role description</h2><p>${pack.description}</p>` : null}
    <h2 class="pd-newpage">How to use this pack</h2>
    <ul>${L.guidance.howToUse.map((t) => html`<li>${t}</li>`)}</ul>
    <h2>Use STAR to probe the evidence</h2>
    ${L.guidance.star.map((s) => html`<p><b>${s.label}:</b> ${s.pack}</p>`)}
    <h2>Scoring scale</h2>
    <table class="pd-scale"><thead><tr><th>Score</th><th>Rating</th><th>What it means</th></tr></thead>
      <tbody>${scale.map((r) => html`<tr><td>${r.value}</td><td>${r.label}</td><td>${r.meaning}</td></tr>`)}</tbody></table>
    ${pack.items.map((c, i) => {
      const d = dim(c.dimension);
      return html`<section class="pd-comp">
        <p class="pd-dim">${d.name.toUpperCase()}</p>
        <h2>${c.name}</h2>
        <p><b>Interviewer: ${assignee(pack.panel, i)}</b></p>
        <p>${c.definition}</p>
        <p class="pd-label">Primary question · ${c.primary.level}</p><p class="pd-q">${c.primary.text}</p>
        <p class="pd-label">Backup question · ${c.backup.level}</p><p class="pd-q pd-backup">${c.backup.text}</p>
        <div class="pd-ind"><div><p class="pd-label">What good looks like</p><ul>${d.good.map((t) => html`<li>${t}</li>`)}</ul></div>
          <div><p class="pd-label">Watch-outs</p><ul>${d.watchOuts.map((t) => html`<li>${t}</li>`)}</ul></div></div>
        <div class="pd-notes"><p class="pd-label">Notes</p></div>
        <p class="pd-rating">${L.ratingScale.map((r) => `☐ ${r.value} ${r.short}`).join('    ')}</p>
      </section>`;
    })}
    <section class="pd-comp">
      <h2>Candidate evaluation</h2>
      <p>${L.guidance.evaluation}</p>
      <table class="pd-scale"><thead><tr><th>Competency</th>${(panel.length ? panel : ['Unassigned']).map((n) => html`<th>${n}</th>`)}<th>Agreed</th><th>Notes</th></tr></thead>
        <tbody>${pack.items.map((c, i) => html`<tr><td>${c.name}</td>${(panel.length ? panel : ['Unassigned']).map((n) => html`<td>${n === assignee(pack.panel, i) ? 'Assigned' : ''}</td>`)}<td></td><td></td></tr>`)}</tbody></table>
      <h2>Overall decision</h2>
      <p><b>${L.guidance.decisions.map((d) => `☐ ${d}`).join('     ')}</b></p>
      <p class="pd-label">Panel rationale</p>
      <div class="pd-notes"></div>
    </section>
  </article>`;
}

/* ------------------------------------------------------------------ */
/* Interview mode (memory only)                                        */
/* ------------------------------------------------------------------ */

export function InterviewRun({ id }) {
  const s = useStore(sessionStore);
  const stored = packs().find((p) => p.id === id);
  const L = lib();
  const resolved = stored ? resolvePack(L, stored) : null;
  if (!resolved || !resolved.items.length) return html`<div class="screen"><${TopBar} title="Not found" back=${() => navigate('/tool/interview')} /><p class="empty">That pack isn't on this device.</p></div>`;
  if (!s || s.pack.id !== id) return html`<${Intake} pack=${resolved} />`;
  if (s.status === 'review') return html`<${Review} s=${s} />`;
  if (s.status === 'done') return html`<${Complete} s=${s} />`;
  return html`<${Ask} s=${s} />`;
}

function Intake({ pack }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISO());
  const ok = name.trim() && isISODate(date);
  return html`<div class="screen iv-run">
    <${TopBar} title="Start interview" sub=${pack.role} back=${() => goBack('/tool/interview')} />
    <form class="form" onSubmit=${(e) => { e.preventDefault(); if (ok) sessionStore.set(newSession(pack, name, date)); }} autocomplete="off" novalidate>
      <${Notice} level=${0}>Candidate details, evidence notes and ratings are kept only while this interview is open. They're never saved on the device. Print or email the record before you leave.</${Notice}>
      <div class="field"><label class="field-label" for="iv-cname">Candidate name<span class="req" aria-hidden="true"> *</span></label>
        <input id="iv-cname" class="input" type="text" maxlength="80" required value=${name} ...${PRIVATE} onInput=${(e) => setName(e.target.value)} /></div>
      <div class="field"><label class="field-label" for="iv-date">Interview date</label>
        <${DateInput} id="iv-date" value=${date} label="Interview date" onChange=${setDate} /></div>
      <p class="muted">${pack.items.length} competencies · ${panelNames(pack.panel).join(', ') || 'No panel set'}</p>
      <div class="sticky-cta"><button type="submit" class=${`btn btn-primary btn-block ${ok ? '' : 'is-disabled'}`} aria-disabled=${ok ? undefined : 'true'}>Start interview</button></div>
    </form>
  </div>`;
}

function showOverview(s) {
  const L = lib();
  return showDialog({
    title: `${ratedCount(s)} of ${s.records.length} rated`,
    sheet: true,
    contentFirst: true,
    content: (resolve) => html`<ul class="iv-overview" role="list">
      ${s.pack.items.map((c, i) => {
        const r = s.records[i];
        return html`<li><button type="button" onClick=${() => { updateSession((x) => ({ ...x, index: i, status: 'active' })); resolve(true); }}>
          <${DimDot} id=${c.dimension} /><span>${c.name}</span>
          <em>${r.rating ? `${r.rating} / 5` : r.notes.trim() ? 'Notes added' : 'Not started'}</em></button></li>`;
      })}
    </ul>`,
    actions: [{ label: S.done, value: null, primary: true }],
  });
}

function Ask({ s }) {
  const L = lib();
  const i = s.index;
  const c = s.pack.items[i];
  const r = s.records[i];
  const d = dim(c.dimension);
  const last = i === s.pack.items.length - 1;
  const set = (patch) => updateSession((x) => ({ ...x, records: x.records.map((rec, j) => (j === i ? { ...rec, ...patch } : rec)) }));
  const go = (n) => { updateSession((x) => ({ ...x, index: n })); window.scrollTo(0, 0); setTimeout(() => document.querySelector('#main h1')?.focus({ preventScroll: true }), 0); };
  return html`<div class="screen iv-run">
    <${TopBar} title=${c.name} sub=${`${i + 1} of ${s.pack.items.length} · ${d.name} · ${s.candidate}`} back=${() => goBack('/tool/interview')}
      right=${html`<button type="button" class="btn btn-secondary btn-small" onClick=${() => showOverview(s)}>Overview</button>`} />
    <p class="iv-assigned"><${DimDot} id=${c.dimension} /> Assigned to <b>${assignee(s.pack.panel, i)}</b></p>
    <article class="iv-primary"><p class="mini-title">Primary question</p><p class="iv-ask">${c.primary.text}</p></article>
    <${Disclosure} summary="Need another angle?" open=${r.backupUsed}>
      <p class="mini-title">Backup question</p><p class="iv-ask small">${c.backup.text}</p>
      <label class="choice check inline"><input type="checkbox" checked=${r.backupUsed} onChange=${(e) => set({ backupUsed: e.target.checked })} /><span>Backup used</span></label>
    </${Disclosure}>
    <div class="field">
      <label class="field-label" for="iv-notes">Evidence notes</label>
      <textarea id="iv-notes" key=${c.id} class="input textarea short iv-notes" rows="7" maxlength="5000" value=${r.notes} placeholder="Type notes, or use the keyboard's dictation" ...${PRIVATE}
        onInput=${(e) => set({ notes: e.target.value })} />
      <p class="field-help">Kept only while this interview is open.</p>
    </div>
    <fieldset class="field">
      <legend class="field-label">Rating</legend>
      <div class="iv-rating" role="radiogroup" aria-label="Rating">
        ${L.ratingScale.map((x) => html`<label class=${`choice ${r.rating === x.value ? 'on' : ''}`}>
          <input type="radio" name=${`rate-${c.id}`} checked=${r.rating === x.value} onChange=${() => set({ rating: x.value })} aria-label=${`${x.value}: ${x.label}`} /><span>${x.value}</span></label>`)}
      </div>
      <p class="iv-rating-label" aria-live="polite">${ratingLabel(L, r.rating)}</p>
    </fieldset>
    <${Disclosure} summary="STAR and assessment guidance">
      ${L.guidance.star.map((x) => html`<p><b>${x.label}</b> ${x.live}</p>`)}
      <${Indicators} d=${d} />
    </${Disclosure}>
    <div class="sticky-cta iv-runnav">
      <button type="button" class="btn btn-secondary" disabled=${i === 0} onClick=${() => go(i - 1)}><${Icon} name="back" size=${18} /> Previous</button>
      ${last
        ? html`<button type="button" class="btn btn-primary" onClick=${() => { updateSession((x) => ({ ...x, status: 'review' })); window.scrollTo(0, 0); }}>Review interview</button>`
        : html`<button type="button" class="btn btn-primary" onClick=${() => go(i + 1)}>Next <${Icon} name="chevron" size=${18} /></button>`}
    </div>
  </div>`;
}

function Review({ s }) {
  const L = lib();
  const missing = s.records.length - ratedCount(s);
  return html`<div class="screen iv-run">
    <${TopBar} title="Review interview" sub=${`${s.candidate} · ${s.pack.role} · ${formatLong(s.date)}`} back=${() => updateSession((x) => ({ ...x, status: 'active' }))} />
    <p class="iv-count"><b>${ratedCount(s)} of ${s.records.length}</b> competencies rated</p>
    ${missing ? html`<${Notice} level=${1}>${missing} ${missing === 1 ? 'rating is' : 'ratings are'} missing. You can go back to add ${missing === 1 ? 'it' : 'them'}, or carry on. Missing ratings show as "Not rated" in the record.</${Notice}>` : null}
    <ul class="iv-overview" role="list">
      ${s.pack.items.map((c, i) => {
        const r = s.records[i];
        return html`<li><button type="button" onClick=${() => updateSession((x) => ({ ...x, index: i, status: 'active' }))}>
          <${DimDot} id=${c.dimension} /><span><b>${c.name}</b><small>${r.notes.trim() ? 'Evidence notes captured' : 'No evidence notes'}</small></span>
          <em>${r.rating ? `${r.rating} / 5` : 'Not rated'}</em></button></li>`;
      })}
    </ul>
    <div class="sticky-cta iv-runnav">
      <button type="button" class="btn btn-secondary" onClick=${() => { const j = s.records.findIndex((r) => !r.rating); updateSession((x) => ({ ...x, index: j < 0 ? 0 : j, status: 'active' })); }}>
        ${missing ? 'Add missing ratings' : 'Back to interview'}</button>
      <button type="button" class="btn btn-primary" onClick=${() => { updateSession((x) => ({ ...x, status: 'done' })); window.scrollTo(0, 0); }}>
        ${missing ? 'Finish without them' : 'Complete interview'}</button>
    </div>
  </div>`;
}

function Complete({ s }) {
  const L = lib();
  const text = () => recordText(L, s, formatLong);
  const subject = `Interview record – ${s.candidate} – ${s.pack.role}`;
  const finish = async () => {
    const ok = await showDialog({
      title: 'Finish and clear?',
      body: 'The candidate details, notes and ratings will be cleared from the app. Make sure you have printed or emailed the record.',
      actions: [{ label: 'Keep it open', value: false, primary: true }, { label: 'Clear the interview', value: true, danger: true }],
    });
    if (ok) { sessionStore.set(null); navigate('/tool/interview', { skipGuard: true }); }
  };
  return html`<div class="screen iv-run">
    <div class="print-hide">
      <${TopBar} title="Interview complete" sub=${`${s.pack.role} · ${formatLong(s.date)}`} back=${() => updateSession((x) => ({ ...x, status: 'review' }))} />
      <div class="iv-hero"><div><small>Interview record</small><h2>${s.candidate}</h2><p>${ratedCount(s)} of ${s.records.length} competencies rated</p></div></div>
      <p>Your interview record is ready. Save it as a PDF, email it, or copy it. Nothing is kept once you finish.</p>
      <div class="btn-col">
        <button type="button" class="btn btn-primary btn-block" onClick=${() => window.print()}>Print / save as PDF</button>
        <button type="button" class="btn btn-secondary btn-block" onClick=${() => openMail({ to: [], subject, body: text() })}><${Icon} name="mail" size=${18} /> Email the record</button>
        ${canShare() ? html`<button type="button" class="btn btn-secondary btn-block" onClick=${async () => { try { await navigator.share({ title: subject, text: text() }); } catch { /* cancelled */ } }}><${Icon} name="share" size=${18} /> Share</button>` : null}
        <button type="button" class="btn btn-secondary btn-block" onClick=${async () => { try { await copySensitive(text()); toast(S.copied || 'Copied. It will be cleared from the clipboard in 2 minutes.'); } catch { toast(S.copyFailed); } }}><${Icon} name="copy" size=${18} /> Copy the record</button>
        <button type="button" class="btn btn-danger btn-block" onClick=${finish}>Finish and clear</button>
      </div>
    </div>
    <article class="print-doc" aria-hidden="true">
      <p class="pd-brand">SayWotNow</p>
      <h1>Interview record</h1>
      <h2>${s.pack.role}</h2>
      <p><b>Candidate:</b> ${s.candidate}<br /><b>Interview date:</b> ${formatLong(s.date)}<br /><b>Competencies rated:</b> ${ratedCount(s)} of ${s.records.length}</p>
      ${s.pack.items.map((c, i) => {
        const r = s.records[i];
        return html`<section class="pd-rec">
          <p class="pd-dim">${dim(c.dimension).name.toUpperCase()}</p><h2>${c.name}</h2>
          <p><b>Assigned interviewer:</b> ${assignee(s.pack.panel, i)}</p>
          <p class="pd-label">Question asked</p><p>${c.primary.text}</p>
          ${r.backupUsed ? html`<p class="pd-label">Backup question used</p><p>${c.backup.text}</p>` : null}
          <p class="pd-label">Evidence notes</p><p class="pd-pre">${r.notes.trim() || 'No notes recorded.'}</p>
          <p><b>Rating:</b> ${ratingLabel(L, r.rating)}</p>
        </section>`;
      })}
    </article>
  </div>`;
}
