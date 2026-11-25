import { describe, expect, it } from 'vitest';
import { parseCsv, toCsv } from '../src/lib/csv';

describe('csv', () => {
  it('round-trips quotes, commas and new lines', () => {
    const rows = [{ name: 'O\'Brien, "Jo"', note: 'line one\nline two', n: 12.5 }];
    const parsed = parseCsv(toCsv(rows));
    expect(parsed[1]).toEqual(['O\'Brien, "Jo"', 'line one\nline two', '12.5']);
  });
  it('neutralises spreadsheet formulas but keeps negative numbers', () => {
    const out = toCsv([{ a: '=HYPERLINK("x")', b: '-12.50', c: '+44 7700', d: '@SUM(1)' }]);
    expect(out.split('\r\n')[1]).toBe(`"'=HYPERLINK(""x"")",-12.50,'+44 7700,'@SUM(1)`);
  });
  it('skips blank lines and reads a BOM', () => {
    expect(parseCsv('﻿a,b\r\n\r\n1,2\n')).toEqual([['a', 'b'], ['1', '2']]);
  });
});
