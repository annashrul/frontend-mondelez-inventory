import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

let server;
let settings;
let Calendar;
let AsyncCombobox;
let DataTable;
let SettingsSkeleton;
before(async () => {
  server = await createServer({
    configFile: false,
    cacheDir: '/tmp/mondelez-inventory-render-test-cache',
    plugins: [reactPlugin()],
    root: fileURLToPath(new URL('../', import.meta.url)),
    resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
    server: { middlewareMode: true, watch: null, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  settings = (await server.ssrLoadModule('/src/stores/settingsStore.js')).useSettingsStore;
  Calendar = (await server.ssrLoadModule('/src/components/ui/calendar.jsx')).Calendar;
  AsyncCombobox = (await server.ssrLoadModule('/src/components/ui/async-combobox.jsx')).AsyncCombobox;
  DataTable = (await server.ssrLoadModule('/src/components/DataTable.jsx')).default;
  SettingsSkeleton = (await server.ssrLoadModule('/src/components/SettingsSkeleton.jsx')).default;
});
after(async () => { await server?.close(); });
// Zustand uses its initial snapshot during server rendering. Set that snapshot too.
function setLanguage(bahasa) {
  settings.getInitialState().settings.bahasa = bahasa;
  settings.getState().apply({ bahasa });
}
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));

test('calendar month names and accessibility labels follow the language setting', () => {
  const props = { mode: 'single', month: new Date(2026, 9, 1), selected: new Date(2026, 9, 14), captionLayout: 'dropdown' };
  setLanguage('id');
  const indonesian = render(Calendar, props);
  assert.match(indonesian, /Pilih bulan/);
  assert.match(indonesian, /Ke bulan berikutnya/);
  assert.match(indonesian, /Oktober/);
  assert.doesNotMatch(indonesian, /Go to the Next Month|Choose the Month/);
  setLanguage('en');
  const english = render(Calendar, props);
  assert.match(english, /October/);
  assert.match(english, /Next Month/);
  assert.doesNotMatch(english, /Pilih bulan|Ke bulan berikutnya/);
});

test('selected stock options update language while preserving user values', () => {
  const props = {
    value: '1', loadOptions: async () => [],
    selectedOption: {
      value: '1', label: 'BRG-001 - Nama Barang (Stok: 12 Satuan)',
      localizedLabel: {
        key: '{value0} - {value1} (Stok: {value2} {value3})',
        params: { value0: 'BRG-001', value1: 'Nama Barang', value2: 12, value3: 'Satuan' },
      },
    },
  };
  setLanguage('id');
  assert.match(render(AsyncCombobox, props), /BRG-001 - Nama Barang \(Stok: 12 Satuan\)/);
  setLanguage('en');
  assert.match(render(AsyncCombobox, props), /BRG-001 - Nama Barang \(Stock: 12 Satuan\)/);
});

test('desktop and mobile table headings translate without changing record contents', () => {
  const props = { columns: [{ key: 'nama', label: 'Nama Barang' }, { key: 'deskripsi', label: 'Deskripsi' }], data: [{ id: 1, nama: 'Nama Barang', deskripsi: 'Simpan' }] };
  setLanguage('en');
  const english = render(DataTable, props);
  assert.match(english, /Item Name/);
  assert.match(english, /Description/);
  assert.match(english, />Nama Barang</);
  assert.match(english, />Simpan</);
  setLanguage('id');
  const indonesian = render(DataTable, props);
  assert.match(indonesian, /Deskripsi/);
  assert.doesNotMatch(indonesian, /Item Name|Description/);
});

test('settings skeleton provides translated loading status for every tab', () => {
  for (const tab of ['umum', 'notifikasi', 'tampilan', 'database', 'keamanan']) {
    setLanguage('id');
    const indonesian = render(SettingsSkeleton, { tab });
    assert.match(indonesian, /role="status"/);
    assert.match(indonesian, /aria-label="Memuat pengaturan\.\.\."/);
    assert.match(indonesian, /shimmer/);
    assert.doesNotMatch(indonesian, /<input|<button/);
    setLanguage('en');
    assert.match(render(SettingsSkeleton, { tab }), /aria-label="Loading settings\.\.\."/);
  }
});
