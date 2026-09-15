import MockAdapter from 'axios-mock-adapter';
import api from '../api';
import { db } from './db';

const mock = new MockAdapter(api, { delayResponse: 500 });

const currentUser = () => {
  try { return JSON.parse(localStorage.getItem('user')) || db.pengguna[0]; }
  catch { return db.pengguna[0]; }
};

const moduleName = (endpoint) => ({
  barang: 'Master Barang',
  'kelompok-barang': 'Kelompok Barang',
  satuan: 'Master Satuan',
  lokasi: 'Master Lokasi',
  rak: 'Master Rak',
  pengguna: 'Master Pengguna',
  'level-pengguna': 'Level Pengguna',
  adjustment: 'Adjustment Stok',
  shift: 'Closing',
}[endpoint] || endpoint);

const pushLog = ({ aksi, modul, detail }) => {
  const user = currentUser();
  db.log_activity.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    waktu: new Date().toISOString(),
    user_id: user?.id || null,
    aksi,
    modul,
    detail,
    ip: 'demo-local',
  });
};

const currentNotificationSetting = () => (
  db.notification_settings?.pengambilan_barang || { level_ids: [1], user_ids: [] }
);

const notificationRecipients = () => {
  const setting = currentNotificationSetting();
  return db.pengguna
    .filter((user) => user.status === 'Aktif')
    .filter((user) => (setting.level_ids || []).map(Number).includes(Number(user.level_id)) || (setting.user_ids || []).map(Number).includes(Number(user.id)))
    .map((user) => Number(user.id));
};

const pushPengambilanNotification = ({ transaction, barang, operator, stokAkhir }) => {
  const recipients = notificationRecipients();
  if (!recipients.length) return;
  const notification = {
    id: Date.now() + 3,
    type: 'pengambilan_barang',
    title: 'Pengambilan barang baru',
    message: `${operator?.nama || operator?.username || 'Operator'} memproses ${barang.nama} sebanyak ${transaction.qty} untuk ${transaction.pemohon}`,
    data: {
      no_ref: transaction.no_ref,
      transaction_id: transaction.id,
      barang_id: barang.id,
      barang_nama: barang.nama,
      qty: transaction.qty,
      pemohon: transaction.pemohon,
      stok_akhir: stokAkhir,
    },
    created_by: operator?.id || null,
    created_at: new Date().toISOString(),
  };
  db.notifications.unshift(notification);
  recipients.forEach((userId) => db.notification_recipients.unshift({ notification_id: notification.id, user_id: userId, read_at: null }));
  if (recipients.includes(Number(currentUser()?.id))) {
    window.dispatchEvent(new CustomEvent('inventory-notification', { detail: notification }));
  }
};

const paginate = (items, params = {}) => {
  const page = Math.max(1, Number.parseInt(params.page, 10) || 1);
  const requestedLimit = Number.parseInt(params.limit, 10) || 10;
  const limit = Math.min(100, Math.max(1, requestedLimit));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * limit;

  return {
    data: items.slice(offset, offset + limit),
    pagination: {
      page: currentPage,
      limit,
      total,
      total_pages: totalPages,
      has_next: currentPage < totalPages,
      has_prev: currentPage > 1,
    },
  };
};

const nextReference = () => `AMB-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(db.pengambilan.length + 1).padStart(4, '0')}`;
const nextAdjustmentReference = () => `ADJ-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(db.adjustment.length + 1).padStart(4, '0')}`;
const codePrefixes = {
  barang: 'BRG',
  'kelompok-barang': 'KLP',
  satuan: 'STN',
  lokasi: 'LOK',
  rak: 'RAK',
  'level-pengguna': 'LVL',
};
const nextAutoCode = (table, prefix) => {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`, 'i');
  const max = (db[table] || []).reduce((highest, row) => {
    const match = String(row.kode || '').match(pattern);
    return match ? Math.max(highest, Number(match[1]) || 0) : highest;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
};
const hydrateBarang = (item) => ({
  ...item,
  kelompok_detail: db.kelompok_barang.find((row) => row.id === Number(item.kelompok_id)) || null,
  satuan_detail: db.satuan.find((row) => row.id === Number(item.satuan_id)) || null,
  rak_detail: (() => { const rak = db.rak.find((row) => row.id === Number(item.rak_id)); return rak ? { ...rak, lokasi_detail: db.lokasi.find((row) => row.id === Number(rak.lokasi_id)) || null } : null; })(),
});
const hydrateRak = (item) => ({ ...item, lokasi_detail: db.lokasi.find((row) => row.id === Number(item.lokasi_id)) || null });
const hydrateUser = (item) => ({ ...item, level_detail: db.level_pengguna.find((row) => row.id === Number(item.level_id)) || null });
const hydrateTransaction = (item, operatorField = 'user_detail') => ({
  ...item,
  ...(item.barang_id ? { barang_detail: hydrateBarang(db.barang.find((row) => row.id === Number(item.barang_id)) || {}) } : {}),
  ...(item.rak_id ? { rak_detail: hydrateRak(db.rak.find((row) => row.id === Number(item.rak_id)) || {}) } : {}),
  [operatorField]: db.pengguna.find((row) => row.id === Number(item[operatorField === 'operator_detail' ? 'operator_id' : 'user_id'])) || null,
});
const viewItem = (table, item) => table === 'barang' ? hydrateBarang(item) : table === 'rak' ? hydrateRak(item) : table === 'pengguna' ? hydrateUser(item) : ['adjustment', 'kartu_stok', 'log_activity', 'shift'].includes(table) ? hydrateTransaction(item) : item;

const setupCrud = (endpoint, table) => {
  const path = new RegExp(`^/${endpoint}(?:/([0-9]+))?$`);
  const softDeleteTables = ['barang', 'kelompok_barang', 'satuan', 'lokasi', 'rak'];

  mock.onGet(`/${endpoint}/kode-otomatis`).reply(() => {
    return [200, { kode: nextAutoCode(table, codePrefixes[endpoint] || endpoint.toUpperCase()) }];
  });

  mock.onGet(path).reply((config) => {
    const match = config.url.match(path);
    if (match && match[1]) {
      const id = parseInt(match[1], 10);
      const item = db[table].find(i => i.id === id && !i.is_deleted);
      return item ? [200, viewItem(table, item)] : [404, { message: 'Not found' }];
    }
    const rows = softDeleteTables.includes(table) ? db[table].filter((item) => !item.is_deleted) : db[table];
    const search = config.params?.search?.trim().toLowerCase();
    if (search && table === 'barang') {
      const results = rows.filter((item) =>
        item.nama.toLowerCase().includes(search) ||
        item.kode.toLowerCase().includes(search) ||
        item.barcode?.toLowerCase().includes(search)
      );
      return [200, paginate(results.map(hydrateBarang), config.params)];
    }
    if (search && table === 'pengguna') {
      const results = rows.filter((item) =>
        item.nama.toLowerCase().includes(search) ||
        item.username.toLowerCase().includes(search)
      );
      return [200, paginate(results, config.params)];
    }
    if (table === 'kartu_stok') {
      const tipe = ['Masuk', 'Keluar'].includes(config.params?.tipe) ? config.params.tipe : '';
      const hydrated = rows.map((item) => viewItem(table, item));
      const results = hydrated
        .filter((item) => !tipe || item.tipe === tipe)
        .filter((item) => !search || `${item.no_ref || ''} ${item.keterangan || ''} ${item.barang_detail?.nama || ''} ${item.barang_detail?.kode || ''}`.toLowerCase().includes(search));
      return [200, paginate(results, config.params)];
    }
    if (search && table === 'log_activity') {
      const results = rows.filter((item) =>
        `${item.aksi || ''} ${item.modul || ''} ${item.detail || ''}`.toLowerCase().includes(search)
      );
      return [200, paginate(results.map((item) => viewItem(table, item)), config.params)];
    }
    if (search) {
      return [200, paginate(rows.filter((item) => `${item.kode || ''} ${item.nama || ''}`.toLowerCase().includes(search)), config.params)];
    }
    return [200, paginate(rows.map((item) => viewItem(table, item)), config.params)];
  });

  mock.onPost(new RegExp(`^/${endpoint}$`)).reply((config) => {
    const data = JSON.parse(config.data);
    if (table === 'adjustment') {
      const barang = db.barang.find((item) => item.id === Number(data.barang_id) && !item.is_deleted);
      const qty = Number(data.qty);
      if (!barang) return [404, { message: 'Barang tidak ditemukan' }];
      if (!Number.isInteger(qty) || qty < 1) return [400, { message: 'Qty harus bilangan bulat minimal 1' }];
      if (!['Tambah', 'Kurang'].includes(data.tipe)) return [400, { message: 'Tipe adjustment tidak valid' }];
      if (!data.alasan?.trim()) return [400, { message: 'Alasan wajib diisi' }];
      if (data.tipe === 'Kurang' && qty > Number(barang.stok)) {
        return [409, { message: `Stok tidak cukup. Stok tersedia ${barang.stok}` }];
      }

      const user = currentUser();
      const no_ref = nextAdjustmentReference();
      barang.stok = data.tipe === 'Tambah' ? Number(barang.stok) + qty : Number(barang.stok) - qty;
      const newItem = {
        id: Date.now(),
        tanggal: data.tanggal || new Date().toISOString().slice(0, 10),
        no_ref,
        barang_id: barang.id,
        tipe: data.tipe,
        qty,
        alasan: data.alasan.trim(),
        user_id: user?.id || null,
      };
      db.adjustment.unshift(newItem);
      db.kartu_stok.unshift({
        id: Date.now() + 1,
        tanggal: new Date().toISOString(),
        tipe: data.tipe === 'Tambah' ? 'Masuk' : 'Keluar',
        no_ref,
        barang_id: barang.id,
        user_id: user?.id || null,
        qty,
        saldo: barang.stok,
        keterangan: data.alasan.trim(),
      });
      pushLog({ aksi: 'Adjustment', modul: 'Adjustment Stok', detail: `${no_ref}: ${barang.nama} ${data.tipe.toLowerCase()} ${qty}. Saldo akhir ${barang.stok}` });
      return [201, viewItem(table, newItem)];
    }
    if (table === 'barang' && db.barang.some((item) => item.barcode === data.barcode)) {
      return [409, { message: 'Barcode sudah digunakan' }];
    }
    if (table === 'barang' && (!db.kelompok_barang.some((row) => row.id === Number(data.kelompok_id)) || !db.satuan.some((row) => row.id === Number(data.satuan_id)) || !db.rak.some((row) => row.id === Number(data.rak_id)))) {
      return [422, { message: 'Kelompok, satuan, atau rak tidak ditemukan pada master data' }];
    }
    if (table === 'rak' && !db.lokasi.some((row) => row.id === Number(data.lokasi_id))) return [422, { message: 'Lokasi tidak ditemukan pada master lokasi' }];
    if (table === 'pengguna' && !db.level_pengguna.some((row) => row.id === Number(data.level_id))) return [422, { message: 'Level pengguna tidak ditemukan' }];
    const newItem = { id: Date.now(), ...data };
    db[table].push(newItem);
    if (table !== 'log_activity') pushLog({ aksi: 'Tambah', modul: moduleName(endpoint), detail: `Tambah ${moduleName(endpoint).toLowerCase()}: ${newItem.nama || newItem.kode || newItem.no_ref || newItem.shift || newItem.id}` });
    return [201, viewItem(table, newItem)];
  });

  mock.onPut(path).reply((config) => {
    const match = config.url.match(path);
    if (match && match[1]) {
      const id = parseInt(match[1], 10);
      const index = db[table].findIndex(i => i.id === id);
      if (index > -1) {
        const data = JSON.parse(config.data);
        if (table === 'barang' && db.barang.some((item) => item.id !== id && item.barcode === data.barcode)) {
          return [409, { message: 'Barcode sudah digunakan' }];
        }
        db[table][index] = { ...db[table][index], ...data };
        if (table !== 'log_activity') pushLog({ aksi: 'Edit', modul: moduleName(endpoint), detail: `Edit ${moduleName(endpoint).toLowerCase()}: ${db[table][index].nama || db[table][index].kode || db[table][index].no_ref || db[table][index].shift || id}` });
        return [200, viewItem(table, db[table][index])];
      }
    }
    return [404, { message: 'Not found' }];
  });

  mock.onDelete(path).reply((config) => {
    const match = config.url.match(path);
    if (match && match[1]) {
      const id = parseInt(match[1], 10);
      const item = db[table].find(i => i.id === id);
      if (softDeleteTables.includes(table) && item) {
        item.is_deleted = true;
        item.deleted_at = new Date().toISOString();
        item.deleted_by = currentUser()?.id || null;
      } else {
        db[table] = db[table].filter(i => i.id !== id);
      }
      if (table !== 'log_activity') pushLog({ aksi: 'Hapus', modul: moduleName(endpoint), detail: `Hapus ${moduleName(endpoint).toLowerCase()}: ${item?.nama || item?.kode || item?.no_ref || item?.shift || id}` });
      return [200, { message: 'Berhasil dihapus' }];
    }
    return [400, { message: 'Bad request' }];
  });
};

setupCrud('barang', 'barang');
setupCrud('kelompok-barang', 'kelompok_barang');
setupCrud('satuan', 'satuan');
setupCrud('lokasi', 'lokasi');
setupCrud('rak', 'rak');
setupCrud('pengguna', 'pengguna');
setupCrud('level-pengguna', 'level_pengguna');
setupCrud('adjustment', 'adjustment');
setupCrud('kartu-stok', 'kartu_stok');
setupCrud('log-activity', 'log_activity');
setupCrud('shift', 'shift');

mock.onGet('/dashboard/stats').reply(() => {
  const today = new Date().toISOString().slice(0, 10);
  const barang = db.barang.filter((item) => !item.is_deleted);
  const kartuStok = [...db.kartu_stok].sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)) || Number(b.id) - Number(a.id));
  return [200, {
    totalBarang: barang.length,
    totalTransaksi: kartuStok.filter((item) => String(item.tanggal || '').slice(0, 10) === today).length,
    stokMenipis: barang.filter(b => b.stok <= b.stok_min).length,
    nilaiInventory: barang.reduce((acc, curr) => acc + (curr.stok * curr.harga), 0),
    aktivitasTerbaru: kartuStok.slice(0, 5).map((item) => ({
      ...item,
      barang: db.barang.find((row) => Number(row.id) === Number(item.barang_id))?.nama || '-',
      user: db.pengguna.find((row) => Number(row.id) === Number(item.user_id))?.nama || '-',
    })),
    lowStockItems: barang.filter(b => b.stok <= b.stok_min).map(hydrateBarang).slice(0, 5)
  }];
});

mock.onGet('/pengambilan').reply((config) => {
  const search = config.params?.search?.trim().toLowerCase();
  const rows = [...db.pengambilan].reverse().map((item) => hydrateTransaction(item, 'operator_detail'));
  const filtered = search
    ? rows.filter((row) => `${row.no_ref} ${row.pemohon} ${row.barang_detail?.nama || ''} ${row.rak_detail?.nama || ''}`.toLowerCase().includes(search))
    : rows;
  return [200, paginate(filtered, config.params)];
});

mock.onPost('/ai/search-image').reply((config) => {
  const { image } = JSON.parse(config.data);
  if (!image?.startsWith('data:image/')) return [400, { message: 'Foto barang wajib dikirim' }];
  pushLog({ aksi: 'Cari', modul: 'AI Search Barang', detail: 'Pencarian barang menggunakan gambar' });
  return [200, {
    model: 'demo-catalog-fallback',
    results: db.barang.filter((item) => !item.is_deleted).slice(0, 5).map((item, index) => ({
      ...hydrateBarang(item), confidence: Math.max(0.91 - index * 0.09, 0.55),
    })),
  }];
});

mock.onPost('/rak/scan').reply((config) => {
  const { qr_code, barang_id } = JSON.parse(config.data);
  const rak = db.rak.find((item) => item.qr_code === qr_code?.trim() || item.kode === qr_code?.trim());
  if (!rak) return [404, { message: 'QR rak tidak terdaftar' }];
  const barang = db.barang.find((item) => item.id === Number(barang_id) && !item.is_deleted);
  if (!barang) return [404, { message: 'Barang tidak ditemukan' }];
  if (barang.rak_id !== rak.id) return [409, { message: `Rak tidak sesuai. Barang berada di ${hydrateBarang(barang).rak_detail?.nama}` }];
  pushLog({ aksi: 'Scan', modul: 'Scan QR Rak', detail: `Scan QR valid: ${rak.nama} untuk ${barang.nama}` });
  return [200, { valid: true, rak: hydrateRak(rak), barang: hydrateBarang(barang) }];
});

mock.onPost('/rak/items').reply((config) => {
  const { qr_code } = JSON.parse(config.data);
  const rak = db.rak.find((item) => item.qr_code === qr_code?.trim() || item.kode === qr_code?.trim());
  if (!rak) return [404, { message: 'QR rak tidak terdaftar' }];
  const barang = db.barang
    .filter((item) => Number(item.rak_id) === Number(rak.id) && !item.is_deleted)
    .map(hydrateBarang);
  pushLog({ aksi: 'Scan', modul: 'Scan QR Rak', detail: `Scan QR rak: ${rak.nama}` });
  return [200, { valid: true, rak: hydrateRak(rak), barang }];
});

mock.onPost('/pengambilan/execute').reply((config) => {
  const payload = JSON.parse(config.data);
  const barang = db.barang.find((item) => item.id === Number(payload.barang_id) && !item.is_deleted);
  const rak = db.rak.find((item) => item.id === Number(payload.rak_id));
  const qty = Number(payload.qty);
  if (!barang || !rak) return [404, { message: 'Barang atau rak tidak ditemukan' }];
  if (barang.rak_id !== rak.id || payload.qr_code !== rak.qr_code) return [409, { message: 'QR rak belum valid atau tidak sesuai barang' }];
  if (!payload.pemohon?.trim()) return [400, { message: 'Nama pengambil wajib diisi' }];
  if (!Number.isInteger(qty) || qty < 1) return [400, { message: 'Qty harus bilangan bulat minimal 1' }];
  if (qty > barang.stok) return [409, { message: `Stok tidak cukup. Stok tersedia ${barang.stok} ${hydrateBarang(barang).satuan_detail?.nama}` }];
  const operator = currentUser();
  const no_ref = nextReference();
  barang.stok -= qty;
  const transaction = { id: Date.now(), tanggal: new Date().toISOString(), no_ref, pemohon: payload.pemohon.trim(), barang_id: barang.id, rak_id: rak.id, operator_id: operator.id, qr_code: rak.qr_code, qty, keterangan: payload.keterangan?.trim() || '', status: 'Disetujui' };
  db.pengambilan.push(transaction);
  db.kartu_stok.unshift({ id: Date.now() + 1, tanggal: new Date().toISOString(), tipe: 'Keluar', no_ref, barang_id: barang.id, user_id: operator.id, qty, saldo: barang.stok, keterangan: `Diambil oleh ${transaction.pemohon} dari ${rak.nama}` });
  db.log_activity.unshift({ id: Date.now() + 2, waktu: new Date().toISOString(), user_id: operator.id, aksi: 'Pengambilan', modul: 'Pengambilan Barang', detail: `${no_ref}: ${barang.nama} ${qty} ${hydrateBarang(barang).satuan_detail?.nama}; pengambil ${transaction.pemohon}; QR ${rak.qr_code}`, ip: 'demo-local' });
  pushPengambilanNotification({ transaction, barang: hydrateBarang(barang), operator, stokAkhir: barang.stok });
  return [201, { transaction: hydrateTransaction(transaction, 'operator_detail'), stok_akhir: barang.stok }];
});

mock.onGet('/notifications/settings').reply(() => [200, currentNotificationSetting()]);

mock.onPut('/notifications/settings').reply((config) => {
  const data = JSON.parse(config.data);
  db.notification_settings ||= {};
  db.notification_settings.pengambilan_barang = {
    level_ids: Array.isArray(data.level_ids) ? data.level_ids.map(Number).filter(Boolean) : [],
    user_ids: Array.isArray(data.user_ids) ? data.user_ids.map(Number).filter(Boolean) : [],
  };
  pushLog({ aksi: 'Edit', modul: 'Pengaturan Notifikasi', detail: 'Edit penerima notifikasi pengambilan barang' });
  return [200, db.notification_settings.pengambilan_barang];
});

mock.onGet('/notifications').reply(() => {
  const user = currentUser();
  const recipients = db.notification_recipients || [];
  const rows = recipients
    .filter((item) => Number(item.user_id) === Number(user?.id))
    .map((item) => ({ ...(db.notifications || []).find((notification) => Number(notification.id) === Number(item.notification_id)), read_at: item.read_at }))
    .filter((item) => item.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return [200, { rows, unread: rows.filter((item) => !item.read_at).length }];
});

mock.onPatch('/notifications/read-all').reply(() => {
  const user = currentUser();
  (db.notification_recipients || []).forEach((item) => {
    if (Number(item.user_id) === Number(user?.id) && !item.read_at) item.read_at = new Date().toISOString();
  });
  return [200, { updated: true }];
});

mock.onPatch(new RegExp('^/notifications/([0-9]+)/read$')).reply((config) => {
  const user = currentUser();
  const id = Number(config.url.match(/^\/notifications\/([0-9]+)\/read$/)?.[1]);
  const item = (db.notification_recipients || []).find((row) => Number(row.user_id) === Number(user?.id) && Number(row.notification_id) === id);
  if (item && !item.read_at) item.read_at = new Date().toISOString();
  return [200, { updated: Boolean(item) }];
});

mock.onPost('/auth/login').reply((config) => {
  const { username, password } = JSON.parse(config.data);
  const demoUser = db.pengguna.find((item) => item.username === username && item.status === 'Aktif');
  if (demoUser && password === username) {
    db.log_activity.unshift({ id: Date.now(), waktu: new Date().toISOString(), user_id: demoUser.id, aksi: 'Login', modul: 'Auth', detail: 'Login berhasil', ip: 'demo-local' });
    return [200, {
      user: demoUser,
      token: `mock-jwt-${demoUser.username}`
    }];
  }
  return [401, { message: 'Username atau password salah' }];
});

export default mock;
