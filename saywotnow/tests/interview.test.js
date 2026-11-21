// Interview pack generator: library content, builder rules, saved-pack safety, records and the Word export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContentSync, ROOT } from './helpers.js';
import {
  newDraft, draftFromPack, assignee, setChoice, choiceComplete, toggleCompetency, stepComplete, firstIncomplete,
  dimensionsCovered, isDraftDirty, packFromDraft, sanitisePack, resolvePack, duplicatePack, newSession, ratedCount,
  sessionDirty, ratingLabel, recordText, matchCompetency,
} from '../src/lib/interview.js';
import { buildPackDocument, packFileName } from '../src/lib/interview-docx.js';

const L = loadContentSync().interview;
const first = (id) => L.competencies.find((c) => c.id === id);

function draftWith(ids, panel = ['Jo Smith', 'Sam Lee']) {
  let d = { ...newDraft(), role: 'Head of Product', func: 'Product', panel };
  for (const id of ids) {
    d = toggleCompetency(d, id);
    const qs = first(id).questions;
    d.choices = setChoice(setChoice(d.choices, id, 'primary', qs[0].id), id, 'backup', qs[4].id);
  }
  return d;
}

test('library: 5 dimensions, 35 competencies, 350 questions, 3 levels', () => {
  assert.equal(L.dimensions.length, 5);
  assert.equal(L.competencies.length, 35);
  assert.equal(L.competencies.reduce((n, c) => n + c.questions.length, 0), 350);
  assert.deepEqual(L.levels, ['Essential', 'Intermediate', 'Advanced']);
  for (const d of L.dimensions) assert.equal(L.competencies.filter((c) => c.dimension === d.id).length, 7, d.id);
});

test('panel: questions rotate between interviewers in order; blanks are ignored', () => {
  const panel = ['Jo', ' ', 'Sam', 'Ali'];
  assert.deepEqual([0, 1, 2, 3, 4].map((i) => assignee(panel, i)), ['Jo', 'Sam', 'Ali', 'Jo', 'Sam']);
  assert.equal(assignee([], 2), 'Unassigned');
  assert.equal(assignee([''], 0), 'Unassigned');
});

test('choices: primary and backup must be different questions', () => {
  let ch = setChoice({}, 'resilience', 'primary', 'resilience-1');
  assert.equal(choiceComplete(ch.resilience), false);
  const same = setChoice(ch, 'resilience', 'backup', 'resilience-1');
  assert.equal(same, ch, 'refuses the same question as backup');
  ch = setChoice(ch, 'resilience', 'backup', 'resilience-2');
  assert.equal(choiceComplete(ch.resilience), true);
  ch = setChoice(ch, 'resilience', 'primary', '');
  assert.equal(choiceComplete(ch.resilience), false);
});

test('steps: role needed, then a competency, then every question pair', () => {
  let d = newDraft();
  assert.equal(stepComplete(L, d, 1), false);
  d.role = '  ';
  assert.equal(stepComplete(L, d, 1), false);
  d.role = 'Analyst';
  assert.equal(stepComplete(L, d, 1), true);
  assert.equal(stepComplete(L, d, 2), false);
  d = toggleCompetency(d, 'resilience');
  d = toggleCompetency(d, 'self-awareness');
  assert.equal(stepComplete(L, d, 2), true);
  assert.equal(stepComplete(L, d, 3), false);
  d.choices = setChoice(setChoice(d.choices, 'resilience', 'primary', 'resilience-1'), 'resilience', 'backup', 'resilience-9');
  assert.equal(firstIncomplete(L, d), 1);
  d = toggleCompetency(d, 'self-awareness');
  assert.equal(stepComplete(L, d, 3), true);
  assert.equal(firstIncomplete(L, d), -1);
});

test('coverage counts the ACTED dimensions represented', () => {
  const ids = ['self-awareness', 'resilience', L.competencies.find((c) => c.dimension === 'DELIVER').id];
  assert.deepEqual([...dimensionsCovered(L, draftWith(ids))].sort(), ['ADAPT', 'DELIVER']);
});

test('dirty check: a new blank draft is clean; edits and reverts are tracked', () => {
  assert.equal(isDraftDirty(newDraft()), false);
  const d = draftWith(['resilience']);
  assert.equal(isDraftDirty(d), true);
  const pack = packFromDraft(L, d, { id: 'pack-0001', now: '2026-11-21T10:00:00Z' });
  const reopened = draftFromPack(pack);
  assert.equal(isDraftDirty(reopened, draftFromPack(pack)), false);
  assert.equal(isDraftDirty({ ...reopened, panel: [...reopened.panel, '  '] }, draftFromPack(pack)), false, 'blank panel rows are ignored');
  assert.equal(isDraftDirty({ ...reopened, seniority: 'Director' }, draftFromPack(pack)), true);
});

test('saved packs: trimmed, no blank interviewers, incomplete choices rejected', () => {
  const d = draftWith(['resilience', 'self-awareness'], [' Jo Smith ', '', 'Sam Lee']);
  const p = packFromDraft(L, d, { id: 'pack-0002', now: '2026-11-21T10:00:00Z' });
  assert.deepEqual(p.panel, ['Jo Smith', 'Sam Lee']);
  assert.deepEqual(p.competencies.map((c) => c.id), ['resilience', 'self-awareness']);
  assert.equal(p.createdAt, '2026-11-21T10:00:00Z');
  const broken = { ...d, choices: { ...d.choices, resilience: { primary: 'resilience-1', backup: '' } } };
  assert.throws(() => packFromDraft(L, broken, { id: 'pack-0003' }), /Resilience/);
});

test('sanitisePack keeps only the expected shape and drops junk', () => {
  assert.equal(sanitisePack(null), null);
  assert.equal(sanitisePack({ id: 'x', role: 'A', competencies: [] }), null, 'bad id');
  assert.equal(sanitisePack({ id: 'pack-1', role: '', competencies: [{ id: 'a', primary: 'b', backup: 'c' }] }), null, 'no role');
  const p = sanitisePack({
    id: 'pack-1', role: 'R'.repeat(200), candidate: 'Alex Doe', notes: 'secret',
    panel: ['A', 'B', 'C', 'D', 'E', 'F'],
    competencies: [{ id: 'resilience', primary: 'resilience-1', backup: 'resilience-1' }, { id: 'resilience', primary: 'resilience-1', backup: 'resilience-2', extra: 1 }],
  });
  assert.equal(p.role.length, 80);
  assert.equal(p.panel.length, 5);
  assert.deepEqual(p.competencies, [{ id: 'resilience', primary: 'resilience-1', backup: 'resilience-2' }]);
  assert.equal('candidate' in p || 'notes' in p, false);
});

test('resolvePack drops competencies or questions the library no longer has', () => {
  const r = resolvePack(L, { id: 'pack-1', role: 'R', panel: [], competencies: [
    { id: 'resilience', primary: 'resilience-1', backup: 'resilience-2' },
    { id: 'gone', primary: 'gone-1', backup: 'gone-2' },
    { id: 'self-awareness', primary: 'self-awareness-1', backup: 'nope' },
  ] });
  assert.deepEqual(r.items.map((c) => c.id), ['resilience']);
  assert.equal(r.items[0].primary.level, 'Essential');
});

test('duplicate makes a copy with a new id and "— Copy" title', () => {
  const p = packFromDraft(L, draftWith(['resilience']), { id: 'pack-0004' });
  const c = duplicatePack(p, 'pack-0005', '2026-11-21T11:00:00Z');
  assert.equal(c.id, 'pack-0005');
  assert.equal(c.role, 'Head of Product — Copy');
  assert.deepEqual(c.competencies, p.competencies);
});

test('interview record: counts, labels, backup used and missing notes', () => {
  const p = resolvePack(L, packFromDraft(L, draftWith(['resilience', 'self-awareness', 'learns-adapts']), { id: 'pack-0006' }));
  const s = newSession(p, '  Alex Doe ', '2026-12-01');
  assert.equal(s.candidate, 'Alex Doe');
  assert.equal(sessionDirty(s), false);
  s.records[0] = { ...s.records[0], notes: 'Clear example.', rating: 4, backupUsed: true };
  s.records[2] = { ...s.records[2], rating: 2 };
  assert.equal(sessionDirty(s), true);
  assert.equal(ratedCount(s), 2);
  assert.equal(ratingLabel(L, 4), '4 — Above Requirement');
  assert.equal(ratingLabel(L, null), 'Not rated');
  const t = recordText(L, s, (d) => `[${d}]`);
  assert.match(t, /^Interview record: Head of Product\nCandidate: Alex Doe\nInterview date: \[2026-12-01\]\nCompetencies rated: 2 of 3/);
  assert.match(t, /ADAPT · Resilience\nAssigned interviewer: Jo Smith/);
  assert.match(t, /Backup question used: /);
  assert.match(t, /Assigned interviewer: Sam Lee[\s\S]*No notes recorded\.\nRating: Not rated/);
});

test('search matches competency names and definitions', () => {
  assert.equal(matchCompetency(first('resilience'), 'RESIL'), true);
  assert.equal(matchCompetency(first('resilience'), 'setbacks'), true);
  assert.equal(matchCompetency(first('resilience'), 'budget'), false);
  assert.equal(matchCompetency(first('resilience'), '  '), true);
});

test('Word export: builds a valid .docx with every competency, and a safe file name', async () => {
  const docx = (await import(`${ROOT}/src/vendor/docx.min.js`)).default;
  const pack = resolvePack(L, packFromDraft(L, draftWith(['resilience', 'self-awareness', 'navigates-conflict']), { id: 'pack-0007' }));
  const buf = await docx.Packer.toBuffer(buildPackDocument(docx, L, pack, { candidate: 'Alex Doe', date: '2026-12-01', formatDate: (d) => `on ${d}` }));
  assert.equal(buf.subarray(0, 2).toString(), 'PK', 'a zip file');
  // Read word/document.xml back out of the zip to check the content.
  const xml = await unzipDocumentXml(buf);
  for (const s of ['Head of Product', 'Alex Doe', 'on 2026-12-01', 'Resilience', 'Self-Awareness', 'Navigates Conflict',
    'How to use this pack', 'Significantly Above Requirement', 'WHAT GOOD LOOKS LIKE', 'WATCH-OUTS', 'Candidate evaluation', 'Make Offer',
    first('resilience').questions[0].text, 'Interviewer: Sam Lee']) assert.ok(xml.includes(s.replace(/&/g, '&amp;').replace(/'/g, '&apos;')) || xml.includes(s), `missing: ${s}`);
  const generic = await unzipDocumentXml(await docx.Packer.toBuffer(buildPackDocument(docx, L, pack, {})));
  assert.ok(generic.includes('Generic reusable pack'));
  assert.ok(!generic.includes('Alex Doe'));
  // Like aHRcade: how-to-use, every competency and the evaluation each start a new page.
  assert.equal((xml.match(/<w:br w:type="page"\/>/g) || []).length, 1 + pack.items.length + 1);
  assert.equal(packFileName('Head of / Product: "Lead"'), 'SayWotNow Interview Pack - Head of Product Lead.docx');
  assert.equal(packFileName(''), 'SayWotNow Interview Pack - Untitled role.docx');
});

async function unzipDocumentXml(buf) {
  const { inflateRawSync } = await import('node:zlib');
  // Minimal zip reader: find the local file header for word/document.xml.
  const name = Buffer.from('word/document.xml');
  let i = 0;
  while ((i = buf.indexOf(Buffer.from([0x50, 0x4b, 0x03, 0x04]), i)) !== -1) {
    const method = buf.readUInt16LE(i + 8);
    const size = buf.readUInt32LE(i + 18);
    const nameLen = buf.readUInt16LE(i + 26);
    const extra = buf.readUInt16LE(i + 28);
    const fname = buf.subarray(i + 30, i + 30 + nameLen);
    const start = i + 30 + nameLen + extra;
    if (fname.equals(name)) {
      const data = buf.subarray(start, start + size);
      return (method === 8 ? inflateRawSync(data) : data).toString('utf8');
    }
    i = start;
  }
  throw new Error('document.xml not found');
}
