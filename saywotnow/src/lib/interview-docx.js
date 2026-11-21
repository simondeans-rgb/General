// Builds the Word (.docx) interview pack. The docx library is passed in, so this
// module has no imports and the 400 KB library only loads when someone exports.
// Layout follows the original aHRcade pack: cover and allocation, how-to-use
// guidance, STAR prompts, scoring scale, one section per competency, then the
// panel evaluation and decision.
import { assignee, panelNames } from './interview.js';

const INK = '26103D';
const PLUM = '4B1F7A';
const MUTED = '6E6178';
const RULE = 'D8CFDC';
const TINT = 'F5F1F7';
const ALLOC = 'EDE5F7';
const FONT = 'Arial';
const FULL = 9360;

export function packFileName(role) {
  const safe = String(role || 'Untitled role').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
  return `SayWotNow Interview Pack - ${safe || 'Untitled role'}.docx`;
}

/**
 * @param docx      the docx library namespace
 * @param library   content/interview.json
 * @param pack      a resolved pack (resolvePack): role, func, seniority, panel, items[{name, dimension, definition, primary, backup}]
 * @param options   { candidate?, date? (ISO), formatDate(iso) }  candidate details only for a customised copy; never stored
 */
export function buildPackDocument(docx, library, pack, { candidate = '', date = '', formatDate = (d) => d } = {}) {
  const {
    Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
    VerticalAlign, HeadingLevel, AlignmentType, PageBreak, Footer, PageNumber,
  } = docx;

  const dimById = Object.fromEntries(library.dimensions.map((d) => [d.id, d]));
  const panel = panelNames(pack.panel);
  const allocation = pack.items.map((c, i) => ({ c, who: assignee(pack.panel, i) }));
  const scaleHigh = [...library.ratingScale].sort((a, b) => b.value - a.value);
  const G = library.guidance;

  const text = (t, run = {}, paragraph = {}) => new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 20, color: INK, ...run })], spacing: { after: 100 }, ...paragraph });
  const label = (t, color = PLUM) => new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 16, bold: true, color, characterSpacing: 24 })], spacing: { before: 120, after: 65 } });
  const heading = (t, level = HeadingLevel.HEADING_1) => new Paragraph({ heading: level, children: [new TextRun({ text: t, font: FONT, bold: true, color: INK, size: level === HeadingLevel.HEADING_1 ? 34 : 25 })], spacing: { before: 160, after: 110 }, keepNext: true });
  const bullet = (t) => new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 19, color: INK })], bullet: { level: 0 }, spacing: { after: 70 } });
  const cell = (children, opts = {}) => new TableCell({ children, verticalAlign: VerticalAlign.CENTER, margins: { top: 120, bottom: 120, left: 140, right: 140 }, ...opts });
  const shade = (fill) => ({ shading: { type: ShadingType.CLEAR, fill, color: 'auto' } });
  const box = { top: { style: BorderStyle.SINGLE, size: 4, color: RULE }, bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE }, left: { style: BorderStyle.SINGLE, size: 4, color: RULE }, right: { style: BorderStyle.SINGLE, size: 4, color: RULE } };
  const none = { top: { style: BorderStyle.NONE, size: 0, color: 'auto' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' }, left: { style: BorderStyle.NONE, size: 0, color: 'auto' }, right: { style: BorderStyle.NONE, size: 0, color: 'auto' } };
  const pageBreak = () => new Paragraph({ children: [new PageBreak()] });
  const headCell = (t) => cell([label(t, 'FFFFFF')], shade(INK));

  const body = [];

  /* Cover */
  body.push(new Paragraph({ children: [new TextRun({ text: 'SayWotNow', font: FONT, size: 22, bold: true, color: PLUM })], spacing: { after: 300 } }));
  const title = (t, color, after) => new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 56, bold: true, color })], spacing: { after, line: 240, lineRule: 'auto' } });
  body.push(title('Competency Based', INK, 0), title('Interview Pack', PLUM, 350));
  const coverRow = (k, v, run = {}) => new TableRow({ children: [cell([label(k)]), cell([text(v, run)])] });
  body.push(new Table({
    width: { size: FULL, type: WidthType.DXA },
    columnWidths: [2600, 6760],
    rows: [
      coverRow('ROLE', pack.role, { bold: true, size: 24 }),
      coverRow('FUNCTION', pack.func || '-'),
      coverRow('LEVEL', pack.seniority || '-'),
      coverRow('CANDIDATE', candidate || 'Generic reusable pack'),
      coverRow('INTERVIEW DATE', date ? formatDate(date) : '-'),
      coverRow('INTERVIEW PANEL', panel.length ? panel.join(' · ') : '-'),
    ],
  }));
  if (pack.description) {
    body.push(heading('Role description', HeadingLevel.HEADING_2));
    for (const line of pack.description.split(/\n+/)) if (line.trim()) body.push(text(line.trim()));
  }
  body.push(heading('Questions covered', HeadingLevel.HEADING_2));
  const who = panel.length ? panel : ['Unassigned'];
  for (const name of who) {
    body.push(label(name.toUpperCase()));
    body.push(text(allocation.filter((a) => a.who === name).map((a) => a.c.name).join(' · ') || 'No competencies allocated'));
  }

  /* How to use, STAR, scale */
  body.push(pageBreak(), heading('How to use this pack'));
  G.howToUse.forEach((t) => body.push(bullet(t)));
  body.push(heading('Use STAR to probe the evidence', HeadingLevel.HEADING_2));
  G.star.forEach((s) => body.push(label(s.label.toUpperCase()), text(s.pack)));
  body.push(heading('Scoring scale', HeadingLevel.HEADING_2));
  body.push(new Table({
    width: { size: FULL, type: WidthType.DXA },
    columnWidths: [1000, 2800, 5560],
    rows: [
      new TableRow({ tableHeader: true, children: [headCell('SCORE'), headCell('RATING'), headCell('WHAT IT MEANS')] }),
      ...scaleHigh.map((r) => new TableRow({ children: [cell([text(String(r.value), { bold: true })]), cell([text(r.label, { bold: true })]), cell([text(r.meaning)])] })),
    ],
  }));

  /* One section per competency */
  const ratingLine = library.ratingScale.map((r) => `☐ ${r.value}  ${r.short}`).join('    ');
  allocation.forEach(({ c, who: name }) => {
    const dim = dimById[c.dimension] || { name: c.dimension, colour: '#4B1F7A', good: [], watchOuts: [] };
    const indicators = new Table({
      width: { size: 9200, type: WidthType.DXA },
      columnWidths: [4600, 4600],
      rows: [new TableRow({ cantSplit: true, children: [
        cell([label('WHAT GOOD LOOKS LIKE', '2E6B1F'), ...dim.good.map(bullet)], shade('F2F7EA')),
        cell([label('WATCH-OUTS', '9D5364'), ...dim.watchOuts.map(bullet)], shade('FFF1F3')),
      ] })],
    });
    const notes = new Table({
      width: { size: 9200, type: WidthType.DXA },
      rows: [
        new TableRow({ cantSplit: true, height: { value: 2500, rule: 'atLeast' }, children: [cell([label('NOTES'), text('')], { verticalAlign: VerticalAlign.TOP, borders: box })] }),
        new TableRow({ cantSplit: true, children: [cell([label('COMPETENCY RATING'), text(ratingLine, { bold: true, size: 17 })], shade(TINT))] }),
      ],
    });
    body.push(pageBreak());
    body.push(new Table({
      width: { size: FULL, type: WidthType.DXA },
      rows: [new TableRow({ cantSplit: true, children: [cell([
        label(dim.name.toUpperCase(), dim.colour.replace('#', '')),
        heading(c.name),
        text(`Interviewer: ${name}`, { bold: true, color: PLUM }),
        text(c.definition),
        label(`PRIMARY QUESTION · ${c.primary.level.toUpperCase()}`),
        text(c.primary.text, { bold: true, size: 22 }),
        label(`BACKUP QUESTION · ${c.backup.level.toUpperCase()}`, MUTED),
        text(c.backup.text, { bold: true, size: 20, color: '4F4653' }),
        new Paragraph({ spacing: { after: 70 } }),
        indicators,
        new Paragraph({ spacing: { after: 70 } }),
        notes,
      ], { margins: { top: 0, bottom: 0, left: 0, right: 0 }, borders: none })] })],
    }));
  });

  /* Panel evaluation and decision */
  body.push(pageBreak(), heading('Candidate evaluation'), text(G.evaluation));
  body.push(new Table({
    width: { size: FULL, type: WidthType.DXA },
    rows: [
      new TableRow({ tableHeader: true, children: [headCell('COMPETENCY'), ...who.map((n) => headCell(n.toUpperCase())), headCell('AGREED'), headCell('NOTES')] }),
      ...allocation.map(({ c, who: name }) => new TableRow({ children: [
        cell([text(c.name)]),
        ...who.map((n) => cell([text(n === name ? 'Assigned' : '')], n === name ? shade(ALLOC) : {})),
        cell([text('')]),
        cell([text('')]),
      ] })),
    ],
  }));
  body.push(heading('Overall decision', HeadingLevel.HEADING_2));
  body.push(text(G.decisions.map((d) => `☐ ${d}`).join('     '), { bold: true }));
  body.push(label('PANEL RATIONALE'));
  body.push(new Table({ width: { size: FULL, type: WidthType.DXA }, rows: [new TableRow({ height: { value: 1600, rule: 'atLeast' }, children: [cell([text('')], { borders: box })] })] }));

  return new Document({
    creator: 'SayWotNow',
    title: `${pack.role} interview pack`,
    styles: {
      default: { document: { run: { font: FONT, size: 20, color: INK }, paragraph: { spacing: { line: 276, lineRule: 'auto' } } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 34, bold: true, color: INK } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 25, bold: true, color: INK } },
      ],
    },
    sections: [{
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
          new TextRun({ text: 'SayWotNow  ·  ', font: FONT, size: 16, color: '887E8B' }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: '887E8B' }),
        ] })] }),
      },
      children: body,
    }],
  });
}
