import test from 'node:test';
import assert from 'node:assert/strict';
import { loginDestination } from '../src/lib/loginDestination.js';

test('login returns to the requested history tab with the exact reference query', () => {
  assert.equal(loginDestination({ pathname: '/pengambilan-barang', search: '?tab=riwayat&search=AMB-001', hash: '' }), '/pengambilan-barang?tab=riwayat&search=AMB-001');
  for (const from of [undefined, { pathname: '//external.test' }, { pathname: 'https://external.test' }, { pathname: '/\\external.test' }, { pathname: '/login' }]) assert.equal(loginDestination(from), '/');
});
