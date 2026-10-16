import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

let server;
let settings;
let Calendar;
let AsyncCombobox;
let PwaControls;
let pwaStore;
let DataTable;
let KartuStokList;
let SettingsSkeleton;
let Pengaturan;
let LogActivity;
let CetakBarcode;
let AuthProvider;
let DashboardCharts;
let Dashboard;
let PermissionScope;
let PermissionAction;
let PermissionForm;
let PageHeader;
let SearchAuditPanel;
let SearchRelevance;
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
  ({ PermissionScope, PermissionAction, PermissionForm } = await server.ssrLoadModule('/src/components/PermissionAccess.jsx'));
  PageHeader = (await server.ssrLoadModule('/src/components/PageHeader.jsx')).default;
  SearchAuditPanel = (await server.ssrLoadModule('/src/components/SearchAuditPanel.jsx')).default;
  SearchRelevance = (await server.ssrLoadModule('/src/components/SearchRelevance.jsx')).default;
  settings = (await server.ssrLoadModule('/src/stores/settingsStore.js')).useSettingsStore;
  PwaControls = (await server.ssrLoadModule('/src/components/PwaControls.jsx')).default;
  pwaStore = (await server.ssrLoadModule('/src/stores/pwaStore.js')).usePwaStore;
  Calendar = (await server.ssrLoadModule('/src/components/ui/calendar.jsx')).Calendar;
  AsyncCombobox = (await server.ssrLoadModule('/src/components/ui/async-combobox.jsx')).AsyncCombobox;
  DataTable = (await server.ssrLoadModule('/src/components/DataTable.jsx')).default;
  KartuStokList = (await server.ssrLoadModule('/src/pages/kartuStok/List.jsx')).default;
  SettingsSkeleton = (await server.ssrLoadModule('/src/components/SettingsSkeleton.jsx')).default;
  Pengaturan = (await server.ssrLoadModule('/src/pages/Pengaturan.jsx')).default;
  LogActivity = (await server.ssrLoadModule('/src/pages/LogActivity.jsx')).default;
  CetakBarcode = (await server.ssrLoadModule('/src/pages/CetakBarcode.jsx')).default;
  AuthProvider = (await server.ssrLoadModule('/src/context/AuthContext.jsx')).AuthProvider;
  DashboardCharts = (await server.ssrLoadModule('/src/components/DashboardCharts.jsx')).default;
  Dashboard = (await server.ssrLoadModule('/src/pages/Dashboard.jsx')).default;
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

function renderPage(Component, client, url) {
  return renderToStaticMarkup(React.createElement(QueryClientProvider, { client },
    React.createElement(AuthProvider, null,
      React.createElement(MemoryRouter, { initialEntries: [url] }, React.createElement(Component)))));
}

test('test email form is visible only when email notifications are enabled', () => {
  setLanguage('id');
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  try {
    client.setQueryData(['settings', undefined], settings.getState().settings);
    client.setQueryData(['settings-recipients', undefined], { levels: [], users: [] });
    client.setQueryData(['notification-settings', undefined], { email_enabled: false, level_ids: [], user_ids: [], stock_enabled: true, transaction_enabled: true });
    assert.doesNotMatch(renderPage(Pengaturan, client, '/pengaturan?tab=notifikasi'), /id="test-email"/);
    client.setQueryData(['notification-settings', undefined], { email_enabled: true, level_ids: [], user_ids: [], stock_enabled: true, transaction_enabled: true });
    assert.match(renderPage(Pengaturan, client, '/pengaturan?tab=notifikasi'), /id="test-email"/);
  } finally { client.clear(); }
});

test('activity and QR pages show skeletons before their initial data arrives', () => {
  setLanguage('id');
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  try {
    const logs = renderPage(LogActivity, client, '/log-activity');
    assert.match(logs, /aria-label="Memuat log aktivitas\.\.\."/);
    assert.match(logs, /shimmer/);
    assert.doesNotMatch(logs, /Tidak ada log aktivitas/);
    const qr = renderPage(CetakBarcode, client, '/cetak-barcode');
    assert.match(qr, /aria-label="Memuat daftar rak\.\.\."/);
    assert.match(qr, /shimmer/);
    assert.doesNotMatch(qr, /Tidak ada rak yang cocok/);
  } finally { client.clear(); }
});

const chartFixture = {
  days: 7, startDate: '2026-10-10', endDate: '2026-10-16',
  daily: Array.from({ length: 7 }, (_, index) => ({ date: `2026-10-${10 + index}`, pengambilan: index % 3, masuk: index % 2, keluar: index % 3 })),
  popularItems: [{ barang_id: 1, nama: 'Nama Barang', satuan: 'Satuan', total_transaksi: 5, total_qty: 12 }],
  categories: [{ kelompok_id: 1, nama: 'Kelompok Barang', total_barang: 3 }, { kelompok_id: null, nama: null, total_barang: 2 }],
  statuses: [{ status: 'Disetujui', total: 5 }, { status: 'Pending', total: 1 }],
};

test('dashboard charts translate labels, expose per-day details and preserve user names and units', () => {
  setLanguage('en');
  const english = render(DashboardCharts, { analytics: chartFixture });
  assert.match(english, /Item Withdrawal Trend/);
  assert.match(english, /Stock Movements/);
  assert.match(english, /Outgoing/);
  assert.doesNotMatch(english, /Sign Out/);
  assert.match(english, /Item Group Distribution/);
  assert.match(english, /Ungrouped/);
  assert.match(english, />Nama Barang</);
  assert.match(english, /12 Satuan/);
  assert.match(english, />Kelompok Barang</);
  assert.match(english, /role="button"/);
  assert.match(english, /aria-valuenow="5"/);
  setLanguage('id');
  assert.match(render(DashboardCharts, { analytics: chartFixture }), /Tren Pengambilan Barang/);
});

test('empty dashboard charts show explicit empty states instead of fabricated data', () => {
  setLanguage('id');
  const empty = render(DashboardCharts, { analytics: { ...chartFixture, daily: chartFixture.daily.map(day => ({ ...day, pengambilan: 0, masuk: 0, keluar: 0 })), popularItems: [], categories: [], statuses: [] } });
  assert.match(empty, /Belum ada transaksi pada periode ini/);
  assert.match(empty, /Belum ada data barang/);
  assert.doesNotMatch(empty, /NaN|Infinity/);
});

test('dashboard uses the period-specific cached API response and removes unsupported percentage changes', () => {
  setLanguage('id');
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  try {
    client.setQueryData(['dashboard-stats', { days: 30 }], { totalBarang: 5, totalTransaksi: 2, stokMenipis: 1, nilaiInventory: 1000, aktivitasTerbaru: [], lowStockItems: [], analytics: { ...chartFixture, days: 30 } });
    const html = renderPage(Dashboard, client, '/');
    assert.match(html, /Analisis Inventory/);
    assert.match(html, /Periode grafik/);
    assert.match(html, /30 hari terakhir/);
    assert.doesNotMatch(html, /\+12%|\+8%|\+3%|\+5%/);
  } finally { client.clear(); }
});

test('infinite lists keep cumulative numbering and replace page controls with loading, retry and end states', () => {
  setLanguage('id');
  const props = {
    columns: [{ key: 'nama', label: 'Nama' }], data: [{ id: 1, nama: 'Oreo' }, { id: 2, nama: 'Cadbury' }],
    pagination: { page: 3, limit: 10, total: 30, total_pages: 3 },
  };
  const query = { isFetching: false, isError: false };
  const mobile = render(DataTable, { ...props, infiniteScroll: { query, hasNext: true } });
  assert.match(mobile, /#1</);
  assert.match(mobile, /#2</);
  assert.match(mobile, /Muat lebih banyak/);
  assert.doesNotMatch(mobile, /Halaman berikutnya/);
  const desktop = render(DataTable, props);
  assert.match(desktop, /#21</);
  assert.match(desktop, /Halaman berikutnya/);
  const pending = render(DataTable, { ...props, infiniteScroll: { query, loadingMore: true } });
  assert.match(pending, /role="status"/);
  assert.match(pending, /Memuat data berikutnya/);
  assert.match(pending, /shimmer_1.5s_infinite/);
  assert.doesNotMatch(pending, /animate-spin/);
  const failed = render(DataTable, { ...props, infiniteScroll: { query: { ...query, isError: true } } });
  assert.match(failed, /Cadbury/);
  assert.match(failed, /Coba lagi/);
  const complete = render(DataTable, { ...props, infiniteScroll: { query, hasNext: false } });
  assert.match(complete, /Semua data sudah ditampilkan/);
});


test('stock cards have a mobile card layout, desktop table and working infinite scroll states', () => {
  setLanguage('id');
  const props = {
    data: [{ id: 1, tanggal: '2026-10-15T08:00:00Z', tipe: 'Masuk', no_ref: 'ADJ-001', barang_detail: { nama: 'Oreo' }, qty: 12, saldo: 25, keterangan: 'Restock' }],
    pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
    infiniteScroll: { query: { isFetching: false, isError: false }, hasNext: true },
  };
  const html = render(KartuStokList, props);
  assert.match(html, /hidden rounded-lg border bg-card shadow-sm md:block/);
  assert.match(html, /space-y-3 md:hidden/);
  assert.match(html, /<article/);
  assert.match(html, /<h3[^>]*>Oreo<\/h3>/);
  assert.match(html, /Restock/);
  assert.match(html, /Muat lebih banyak/);
  assert.doesNotMatch(html, /Halaman berikutnya/);
  const desktop = render(KartuStokList, { ...props, infiniteScroll: undefined });
  assert.match(desktop, /Halaman berikutnya/);
  const empty = render(KartuStokList, { ...props, data: [] });
  assert.match(empty, /Belum ada data kartu stok/);
  const loading = render(KartuStokList, { ...props, loading: true });
  assert.match(loading, /role="status"/);
  setLanguage('en');
  const english = render(KartuStokList, props);
  assert.match(english, /Incoming/);
  assert.match(english, /Load more/);
});


test('PWA notices distinguish install, manual update and offline use in both languages', () => {
  const initial = pwaStore.getInitialState();
  const saved = { ...initial };
  const show = state => {
    Object.assign(initial, { ...saved, offline: false, installPrompt: null, iosInstall: false, updateAvailable: false }, state);
    pwaStore.setState(initial, true);
    return render(PwaControls);
  };
  try {
    setLanguage('id');
    assert.equal(show({}), '');
    const ios = show({ iosInstall: true });
    assert.match(ios, /Tambah ke Layar Utama/);
    const install = show({ installPrompt: {} });
    assert.match(install, /Instal aplikasi/);
    const update = show({ updateAvailable: true, applyUpdate: () => {} });
    assert.match(update, /Selesaikan pekerjaan Anda/);
    assert.match(update, /Perbarui aplikasi/);
    const offline = show({ offline: true, updateAvailable: true });
    assert.match(offline, /Hubungkan internet/);
    assert.doesNotMatch(offline, /<button/);
    setLanguage('en');
    assert.match(show({ installPrompt: {} }), /Install app/);
    assert.match(show({ offline: true }), /You are offline/);
  } finally {
    Object.assign(initial, saved);
    pwaStore.setState(saved, true);
  }
});

test('quantity cells, mobile stock cards, and pagination use localized grouping', () => {
  setLanguage('id');
  const table = render(DataTable, {
    columns: [{ key: 'kode', label: 'Kode' }, { key: 'qty', label: 'Jumlah' }],
    data: [{ id: 1, kode: '001234567', qty: '12345' }],
    pagination: { page: 1, limit: 10, total: 12345, total_pages: 1235 },
  });
  assert.match(table, /001234567/);
  assert.match(table, /12\.345/);
  assert.match(table, /1\.235/);
  const cards = render(KartuStokList, {
    data: [{ id: 1, tipe: 'Masuk', qty: '12345', saldo: '67890', tanggal: '2026-10-15', barang_detail: { nama: 'Item' } }],
  });
  assert.match(cards, /12\.345/);
  assert.match(cards, /67\.890/);
  setLanguage('en');
  assert.match(render(DataTable, { columns: [{ key: 'qty', label: 'Jumlah' }], data: [{ id: 1, qty: '12345' }] }), /12,345/);
  setLanguage('id');
});


test('permission controls disable denied CRUD actions and expose a keyboard tooltip target', () => {
  setLanguage('id');
  const restricted = children => React.createElement(PermissionScope, { user: { permissions: ['barang.read', 'barang.create'] }, permission: 'barang.read' }, children);
  const denied = renderToStaticMarkup(restricted(React.createElement(PermissionAction, { permission: 'delete' }, React.createElement('button', { onClick() {} }, 'Hapus'))));
  assert.match(denied, /data-permission-denied/);
  assert.match(denied, /tabindex="0"/);
  assert.match(denied, /Hapus: Anda tidak mempunyai akses/);
  assert.match(denied, /disabled=""/);
  assert.match(denied, /inert=""/);
  const allowed = renderToStaticMarkup(restricted(React.createElement(PageHeader, { title: 'Barang', onAdd() {} })));
  assert.doesNotMatch(allowed, /data-permission-denied/);
  const table = renderToStaticMarkup(restricted(React.createElement(DataTable, {
    columns: [{ key: 'nama', label: 'Nama' }], data: [{ id: 1, nama: 'Oreo' }], onEdit() {}, onDelete() {},
  })));
  assert.equal((table.match(/data-permission-denied/g) || []).length, 4);
  setLanguage('en');
  const form = renderToStaticMarkup(restricted(React.createElement(PermissionForm, { permission: 'update' }, React.createElement('input', { defaultValue: 'Read only' }))));
  assert.match(form, /You do not have permission/);
  assert.match(form, /inert=""/);
  setLanguage('id');
});


test('access checks respect separate menu permissions and print or close actions', () => {
  setLanguage('id');
  const action = (permission, userPermissions, resource) => renderToStaticMarkup(React.createElement(PermissionScope, {
    user: { permissions: userPermissions }, permission: `${resource}.read`,
  }, React.createElement(PermissionAction, { permission }, React.createElement('button', null, 'Action'))));
  assert.match(action('create', ['kelompok.read', 'barang.create'], 'kelompok'), /data-permission-denied/);
  assert.doesNotMatch(action('create', ['kelompok.create'], 'kelompok'), /data-permission-denied/);
  assert.match(action('barcode.print', ['barcode.read'], 'barcode'), /data-permission-denied/);
  assert.doesNotMatch(action('barcode.print', ['barcode.print'], 'barcode'), /data-permission-denied/);
  assert.match(action('closing.close', ['closing.read'], 'closing'), /data-permission-denied/);
  assert.doesNotMatch(action('closing.close', ['closing.close'], 'closing'), /data-permission-denied/);
  assert.doesNotMatch(action('delete', ['*'], 'barang'), /data-permission-denied/);
});

test('initial and infinite-scroll skeleton counts follow configured and selected page sizes', async () => {
  const Footer = (await server.ssrLoadModule('/src/components/InfiniteScrollFooter.jsx')).default;
  const previous = settings.getState().settings.items_per_page;
  try {
    for (const count of [5, 25, 100]) {
      settings.getInitialState().settings.items_per_page = count;
      settings.getState().apply({ items_per_page: count });
      const props = { columns: [{ key: 'nama', label: 'Nama' }], data: [], loading: true };
      assert.equal((render(DataTable, props).match(/<article/g) || []).length, count);
      assert.equal((render(KartuStokList, props).match(/<article/g) || []).length, count);
      const footer = render(Footer, { loadingMore: true, query: { fetchNextPage() {} } });
      assert.equal((footer.match(/aria-hidden="true"/g) || []).length, count);
    }
    assert.equal((render(DataTable, { columns: [], data: [], loading: true, pagination: { limit: 5 } }).match(/<article/g) || []).length, 5);
  } finally {
    settings.getInitialState().settings.items_per_page = previous;
    settings.getState().apply({ items_per_page: previous });
  }
});

test('search audit shows reviewed accuracy separately from found results and preserves product names', () => {
  setLanguage('en');
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  const date = offset => new Date(Date.now() + offset * 86400000).toISOString().slice(0,10);
  client.setQueryData(['search-audit',date(-30),date(0),'','',1], {
    summary: [{method:'voice',total:4,found:3,not_found:1,errors:0,reviewed:2,accuracy_reviewed:50,not_found_rate:25,avg_duration_ms:150}],
    data: [{id:'audit-1',created_at:'2026-10-16T00:00:00Z',user_id:1,method:'voice',query_text:'blockchain',status:'found',returned_count:1,result_count:1,duration_ms:150,results:[{id:1,nama:'Modular Chain',kode:'BRG-1',rank:1,text_similarity:0.3}],selected_item_id:1,selected_rank:1,relevance:true}],
    pagination:{page:1,limit:20,total:1,total_pages:1},
  });
  const html = renderToStaticMarkup(React.createElement(QueryClientProvider,{client},React.createElement(SearchAuditPanel)));
  assert.match(html,/Search Audit/); assert.match(html,/Reviewed accuracy/);
  assert.match(html,/50%/); assert.match(html,/25%/);
  assert.match(html,/Modular Chain/); assert.match(html,/blockchain/);
  assert.match(html,/Unreviewed searches are not counted as incorrect/);
  client.clear();
});

test('search relevance requires an item before a positive review and allows negative feedback without a selection', () => {
  setLanguage('en');
  const empty = render(SearchRelevance,{auditId:'audit-1'});
  assert.match(empty,/<button[^>]*disabled=""[^>]*>Relevant<\/button>/);
  assert.match(empty,/<button(?![^>]*\sdisabled=)[^>]*>Not relevant<\/button>/);
  const selected = render(SearchRelevance,{auditId:'audit-1',selected:{id:1}});
  assert.match(selected,/<button(?![^>]*\sdisabled=)[^>]*>Relevant<\/button>/);
});

test('activity page renders English API field names for timestamp, action and module', () => {
  setLanguage('id');
  const limit=settings.getInitialState().settings.items_per_page;
  const client=new QueryClient({defaultOptions:{queries:{retry:false,staleTime:Infinity,gcTime:Infinity}}});
  client.setQueryData(['log-activity',{search:'',limit,userId:undefined}],{
    pages:[{data:[{id:901,occurred_at:'2026-10-16T09:41:32',action:'Gagal Hapus',module:'Master Barang',detail:'English-column audit entry',ip:'::ffff:127.0.0.1',user_detail:{nama:'Operator Audit'}}],pagination:{page:1,limit,total:1,has_next:false,total_pages:1}}],pageParams:[1],
  });
  try {
    const html=renderPage(LogActivity,client,'/log-activity');
    assert.match(html,/Gagal Hapus/);assert.match(html,/Master Barang/);
    assert.match(html,/09:41:32/);assert.match(html,/English-column audit entry/);
    assert.match(html,/Operator Audit/);assert.match(html,/127\.0\.0\.1/);
    assert.doesNotMatch(html,/Tanggal tidak diketahui|Tidak ada log aktivitas/);
  } finally {client.clear();}
});

test('demo transport uses the English item/group wire contract while forms keep their presentation state', async () => {
  const api=(await server.ssrLoadModule('/src/services/api.js')).default;
  const mock=(await server.ssrLoadModule('/src/services/mock/mockAdapter.js')).default;
  const previousStorage=globalThis.localStorage, previousWindow=globalThis.window;
  globalThis.localStorage={getItem(){return null;},removeItem(){}};
  globalThis.window={dispatchEvent(){}};
  try {
    const group=await api.post('/kelompok-barang',{kode:'MOCK-COLUMN',nama:'Column Demo Group',deskripsi:'Demo description'});
    assert.equal(group.nama,'Column Demo Group');
    const sent=JSON.parse(mock.history.post.at(-1).data);
    assert.equal(sent.name,'Column Demo Group');assert.equal(sent.code,'MOCK-COLUMN');assert.equal(sent.description,'Demo description');assert.ok(!Object.hasOwn(sent,'nama'));
    for(const [endpoint,form] of [
      ['/lokasi',{kode:'LOC-DEMO',nama:'Demo Location',alamat:'Demo address',deskripsi:'Detail'}],
      ['/level-pengguna',{kode:'LVL-DEMO',nama:'Demo Level',deskripsi:'Detail',action_ids:[1]}]
    ]) {
      const created=await api.post(endpoint,form);
      assert.equal(created.nama,form.nama);
      const payload=JSON.parse(mock.history.post.at(-1).data);
      assert.equal(payload.code,form.kode);assert.equal(payload.name,form.nama);assert.ok(!Object.hasOwn(payload,'nama'));
      if(form.alamat){assert.equal(payload.address,form.alamat);assert.equal(created.alamat,form.alamat);}
      else assert.deepEqual(created.action_ids,[1]);
    }
    const menus=await api.get('/menus');
    assert.ok(menus.length);assert.equal(typeof menus[0].nama,'string');assert.equal(typeof menus[0].grup,'string');
    assert.equal(typeof menus[0].actions[0].nama,'string');assert.equal(typeof menus[0].actions[0].urutan,'number');
    assert.equal(menus[0].actions[0].permission,`${menus[0].key}.${menus[0].actions[0].key}`);
    const list=await api.get('/barang',{params:{search:'Kertas'}});
    assert.ok(list.data.length);assert.equal(typeof list.data[0].nama,'string');assert.equal(typeof list.data[0].stok,'number');
  } finally {
    mock.restore();
    if(previousStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=previousStorage;
    if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;
  }
});
