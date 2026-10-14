import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

function translations(language = 'en') {
  const state = { settings: { bahasa: language } };
  const store = selector => selector(state);
  store.getState = () => state;
  const source = readFileSync(new URL('../src/lib/i18n.js', import.meta.url), 'utf8')
    .replace(/^import .*;\n/gm, '').replaceAll('export ', '');
  return { state, ...new Function('useSettingsStore', source + '\nreturn { translate, useTranslation, getAppLocale, english, translateStockNote };')(store) };
}

test('English covers table labels, workflow steps, permission actions and statuses', () => {
  const { translate } = translations();
  for (const [label, expected] of Object.entries({ 'Nama Barang': 'Item Name', 'Nama Kelompok': 'Group Name', 'Nama Satuan': 'Unit Name', 'Nama Lokasi': 'Location Name', 'Nama Rak': 'Rack Name', 'Waktu Mulai': 'Start Time', 'Pilih Alur': 'Choose Workflow', 'Data Pengambilan': 'Withdrawal Details', 'Aktif': 'Active', 'Selesai': 'Completed' })) {
    assert.equal(translate(label), expected, label);
  }
});

test('context distinguishes stock movement from signing out without changing enums', () => {
  const { translate } = translations();
  assert.equal(translate('Keluar'), 'Sign Out');
  assert.equal(translate('Keluar', { context: 'stock' }), 'Outgoing');
  assert.equal(translate('Masuk', { context: 'stock' }), 'Incoming');
  assert.equal(translate('Keluar', 'id', { context: 'stock' }), 'Keluar');
});

test('templates preserve data values and translate both explicit and backend messages', () => {
  const { translate } = translations();
  assert.equal(translate('{value0} berisi {value1} barang.', { value0: 'Rak Merah', value1: 10 }), 'Rak Merah contains 10 items.');
  assert.equal(translate('Rak Merah berisi 10 barang.'), 'Rak Merah contains 10 items.');
  assert.equal(translate('Barang berhasil diupdate'), 'Item updated successfully');
  assert.equal(translate('Stok tidak cukup. Stok tersedia 3'), 'Insufficient stock. Available stock: 3');
  assert.equal(translate('Data milik pengguna: Rak Merah'), 'Data milik pengguna: Rak Merah');
  assert.equal(translate(null), null);
  assert.equal(translate(10), 10);
});

test('language changes are reactive and Indonesian remains intact', () => {
  const { translate, useTranslation, getAppLocale, state } = translations('id');
  assert.equal(translate('Simpan'), 'Simpan');
  assert.equal(translate('{value0} berisi {value1} barang.', { value0: 'Rak Merah', value1: 2 }), 'Rak Merah berisi 2 barang.');
  state.settings.bahasa = 'en';
  assert.equal(useTranslation().t('Simpan'), 'Save');
  assert.equal(getAppLocale(), 'en-GB');
  state.settings.bahasa = 'id';
  assert.equal(useTranslation().t('Simpan'), 'Simpan');
  assert.equal(getAppLocale(), 'id-ID');
});

test('template literals escape punctuation and unknown keys safely', () => {
  const { translate } = translations();
  assert.equal(translate('Stream kamera aktif, tetapi browser tidak menerima frame video (readyState: 0).'), 'The camera stream is active, but the browser is not receiving video frames (readyState: 0).');
  assert.equal(translate('constructor'), 'constructor');
  assert.equal(translate('toString'), 'toString');
  assert.equal(translate(' Simpan '), ' Save ');
});

test('notification and audit templates translate system wording and preserve record values', () => {
  const { translate } = translations();
  const examples = {
    'Barang: Tambah 2, saldo 10': 'Barang: Increase 2, balance 10',
    'Barang: Kurang 2, saldo 8': 'Barang: Decrease 2, balance 8',
    'Budi memproses Barang sebanyak 2 untuk Rak': 'Budi processed 2 of Barang for Rak',
    'AMB-123: Barang 2 pcs; pengambil Rak; QR RAK:A01': 'AMB-123: Barang 2 pcs; recipient Rak; QR RAK:A01',
    'ADJ-123: Barang Tambah 2. Saldo akhir 10': 'ADJ-123: Barang Increase 2. Final balance 10',
    'Tambah barang: Nama Barang': 'Added item: Nama Barang',
    'Scan QR valid: Rak untuk Barang': 'Valid QR scan: Rak for Barang',
    'Rak tidak sesuai. Barang berada di Rak - Merah': 'Rack does not match. The item is on Rak - Merah',
  };
  for (const [source, expected] of Object.entries(examples)) {
    assert.equal(translate(source), expected, source);
    assert.equal(translate(source, 'id'), source);
  }
});

test('cached stock option labels switch language without translating product names or units', () => {
  const { state, useTranslation } = translations('id');
  const key = '{value0} - {value1} (Stok: {value2} {value3})';
  const params = { value0: 'BRG-001', value1: 'Nama Barang', value2: 12, value3: 'Satuan' };
  assert.equal(useTranslation().t(key, params), 'BRG-001 - Nama Barang (Stok: 12 Satuan)');
  state.settings.bahasa = 'en';
  assert.equal(useTranslation().t(key, params), 'BRG-001 - Nama Barang (Stock: 12 Satuan)');
  state.settings.bahasa = 'id';
  assert.equal(useTranslation().t(key, params), 'BRG-001 - Nama Barang (Stok: 12 Satuan)');
});

test('resource errors translate their labels, while arbitrary message values stay intact', () => {
  const { translate } = translations();
  assert.equal(translate('Gagal menyimpan level pengguna'), 'Failed to save user role');
  assert.equal(translate('rak_id wajib berupa ID master yang valid'), 'rack must be a valid master ID');
  assert.equal(translate('stok_min harus berupa angka nol atau lebih'), 'minimum stock must be zero or greater');
  assert.equal(translate('session_timeout harus 1 sampai 1440'), 'session timeout must be between 1 and 1440');
  assert.equal(translate('Barang tersisa 3, batas minimum 5'), 'Barang has 3 remaining; minimum stock is 5');
});

test('only generated withdrawal notes are localized; user adjustment notes remain unchanged', () => {
  const { translateStockNote, state } = translations();
  const row = { tipe: 'Keluar', no_ref: 'AMB-123', keterangan: 'Diambil oleh Barang dari Rak' };
  assert.equal(translateStockNote(row), 'Taken by Barang from Rak');
  assert.equal(translateStockNote({ ...row, no_ref: 'ADJ-123' }), row.keterangan);
  assert.equal(translateStockNote({ ...row, tipe: 'Masuk' }), row.keterangan);
  assert.equal(translateStockNote({ ...row, keterangan: undefined }), undefined);
  state.settings.bahasa = 'id';
  assert.equal(translateStockNote(row), row.keterangan);
});

test('all frontend translation literals and table labels have English catalog entries', () => {
  const { english } = translations();
  const missing = [];
  const root = new URL('../src/', import.meta.url);
  for (const file of readdirSync(root, { recursive: true })) {
    if (!/\.(jsx|js)$/.test(file) || file === 'lib/i18n.js') continue;
    const source = readFileSync(new URL(file, root), 'utf8');
    const pattern = /(?:translateUi|\bt)\(\s*(['"])(.*?)\1|\blabel:\s*(['"])(.*?)\3/g;
    for (const match of source.matchAll(pattern)) {
      const key = match[2] ?? match[4];
      if (!Object.hasOwn(english, key) && !Object.hasOwn(english, key.trim())) missing.push(`${file}: ${key}`);
    }
  }
  assert.deepEqual(missing, []);
});
