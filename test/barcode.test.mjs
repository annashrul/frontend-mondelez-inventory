import test from 'node:test';
import assert from 'node:assert/strict';
import { generateInternalBarcode } from '../src/lib/barcode.js';

test('demo barcode generation produces a valid 13-digit barcode', () => {
  const barcode = generateInternalBarcode();
  assert.match(barcode, /^20\d{11}$/);
  const sum = [...barcode].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0);
  assert.equal(sum % 10, 0);
});
