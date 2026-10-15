import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/lib/numberFormat.js', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '').replace(/export /g, '');
const { formatNumber, formatCurrency, formatTableValue } = new Function('getAppLocale', `${source}; return { formatNumber, formatCurrency, formatTableValue };`)(() => 'id-ID');

test('quantities format numeric API strings and decimal values without losing precision', () => {
  assert.equal(formatNumber(1234567), '1.234.567');
  assert.equal(formatNumber('1234.50'), '1.234,5');
  assert.equal(formatNumber(-1234.125), '-1.234,125');
  assert.equal(formatNumber(0), '0');
  assert.equal(formatNumber(1234.5, 'en-GB'), '1,234.5');
  for (const value of [null, undefined, '', NaN, Infinity, 'invalid']) assert.equal(formatNumber(value), '-');
});

test('rupiah uses grouping and preserves decimal prices', () => {
  assert.match(formatCurrency('1234567.50'), /^Rp\s1\.234\.567,5$/);
  assert.match(formatCurrency(1000), /^Rp\s1\.000$/);
  assert.equal(formatCurrency(null), '-');
});

test('tables format quantities while preserving codes and identifiers', () => {
  assert.equal(formatTableValue('qty', '1234'), '1.234');
  assert.equal(formatTableValue('kapasitas', 10000), '10.000');
  for (const key of ['kode', 'barcode', 'no_ref', 'telepon', 'id']) {
    assert.equal(formatTableValue(key, '001234567890'), '001234567890');
  }
});

const draftSource = readFileSync(new URL('../src/lib/numberInput.js', import.meta.url), 'utf8').replace(/export /g, '');
const { parseNumberDraft, formatNumberDraft, canonicalNumberDraft } = new Function(`${draftSource}; return { parseNumberDraft, formatNumberDraft, canonicalNumberDraft };`)();

test('numeric input preserves localized decimals, intermediate editing, and raw values', () => {
  assert.equal(parseNumberDraft('1.234.567,50', 'id-ID'), '1234567.50');
  assert.equal(parseNumberDraft('1.2345', 'id-ID'), '12345');
  assert.equal(parseNumberDraft('1,234.50', 'en-GB'), '1234.50');
  assert.equal(formatNumberDraft('1234567.50', 'id-ID'), '1.234.567,50');
  assert.equal(formatNumberDraft('1234.', 'id-ID'), '1.234,');
  assert.equal(formatNumberDraft('-1234.50', 'id-ID'), '-1.234,50');
  assert.equal(formatNumberDraft('', 'id-ID'), '');
  assert.equal(formatNumberDraft('-', 'id-ID'), '-');
  assert.equal(canonicalNumberDraft('-'), '');
  assert.equal(parseNumberDraft('abc', 'id-ID'), null);
  assert.equal(parseNumberDraft('1,2,3', 'id-ID'), null);
});
