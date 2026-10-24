import test from 'node:test';
import assert from 'node:assert/strict';
import { searchHeaderMenus } from '../src/lib/headerSearch.js';

const menus = [
  { key: 'barang', nama: 'Master Barang', path: '/master-barang' },
  { key: 'pengguna', nama: 'Master Pengguna', path: '/master-pengguna' },
  { key: 'pengaturan', nama: 'Pengaturan', path: '/pengaturan' },
];
const translate = name => ({ 'Master Barang': 'Items', 'Master Pengguna': 'Users', Pengaturan: 'Settings' })[name] || name;

test('header suggestions match original and translated menu names without case sensitivity', () => {
  const user = { permissions: ['*'] };
  assert.deepEqual(searchHeaderMenus(menus, user, '  BARANG ', translate), [menus[0]]);
  assert.deepEqual(searchHeaderMenus(menus, user, 'item', translate), [menus[0]]);
  assert.deepEqual(searchHeaderMenus(menus, user, 'settings', translate), [menus[2]]);
  assert.deepEqual(searchHeaderMenus(menus, user, 'unknown', translate), []);
  assert.deepEqual(searchHeaderMenus(menus, user, ' ', translate), []);
});

test('header suggestions exclude inaccessible, disabled and invalid menu destinations', () => {
  const user = { permissions: ['barang.read'] };
  assert.deepEqual(searchHeaderMenus(menus, user, 'master', translate), [menus[0]]);
  assert.deepEqual(searchHeaderMenus(menus, null, 'master', translate), []);
  const invalid = [
    { ...menus[0], aktif: false }, { ...menus[0], path: undefined },
    { ...menus[0], path: '//example.com' }, { ...menus[0], path: 'https://example.com' },
  ];
  assert.deepEqual(searchHeaderMenus(invalid, user, 'master', translate), []);
  assert.equal(searchHeaderMenus(Array.from({ length: 10 }, (_, id) => ({ ...menus[0], id })), user, 'master', translate).length, 5);
});
