import MockAdapter from 'axios-mock-adapter';
import api from '../api';
import { db } from './db';

const mock = new MockAdapter(api, { delayResponse: 500 });

const currentUser = () => {
  try { return JSON.parse(localStorage.getItem('user')) || db.pengguna[0]; }
  catch { return db.pengguna[0]; }
};

const nextReference = () => `AMB-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(db.pengambilan.length + 1).padStart(4, '0')}`;

const setupCrud = (endpoint, table) => {
  const path = new RegExp(`^/${endpoint}(?:/([0-9]+))?$`);

  mock.onGet(path).reply((config) => {
    const match = config.url.match(path);
    if (match && match[1]) {
      const id = parseInt(match[1], 10);
      const item = db[table].find(i => i.id === id);
      return item ? [200, item] : [404, { message: 'Not found' }];
    }
    const search = config.params?.search?.trim().toLowerCase();
    if (search && table === 'barang') {
      const results = db[table].filter((item) =>
        item.nama.toLowerCase().includes(search) ||
        item.kode.toLowerCase().includes(search) ||
        item.barcode?.toLowerCase().includes(search)
      );
      return [200, results];
    }
    if (search && table === 'pengguna') {
      const results = db[table].filter((item) =>
        item.nama.toLowerCase().includes(search) ||
        item.username.toLowerCase().includes(search)
      );
      return [200, results];
    }
    return [200, db[table]];
  });

  mock.onPost(new RegExp(`^/${endpoint}$`)).reply((config) => {
    const data = JSON.parse(config.data);
    if (table === 'barang' && db.barang.some((item) => item.barcode === data.barcode)) {
      return [409, { message: 'Barcode sudah digunakan' }];
    }
    const newItem = { id: Date.now(), ...data };
    db[table].push(newItem);
    return [201, newItem];
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
        return [200, db[table][index]];
      }
    }
    return [404, { message: 'Not found' }];
  });

  mock.onDelete(path).reply((config) => {
    const match = config.url.match(path);
    if (match && match[1]) {
      const id = parseInt(match[1], 10);
      db[table] = db[table].filter(i => i.id !== id);
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
  return [200, {
    totalBarang: db.barang.length,
    totalTransaksi: db.kartu_stok.length,
    stokMenipis: db.barang.filter(b => b.stok <= b.stok_min).length,
    nilaiInventory: db.barang.reduce((acc, curr) => acc + (curr.stok * curr.harga), 0),
    aktivitasTerbaru: db.kartu_stok.slice(0, 5),
    lowStockItems: db.barang.filter(b => b.stok <= b.stok_min).slice(0, 5)
  }];
});

mock.onGet('/pengambilan').reply(() => [200, [...db.pengambilan].reverse()]);

mock.onPost('/ai/search-image').reply((config) => {
  const { image } = JSON.parse(config.data);
  if (!image?.startsWith('data:image/')) return [400, { message: 'Foto barang wajib dikirim' }];
  return [200, {
    model: 'demo-catalog-fallback',
    results: db.barang.slice(0, 5).map((item, index) => ({
      ...item, confidence: Math.max(0.91 - index * 0.09, 0.55),
      rak_detail: db.rak.find((rak) => rak.nama === item.rak) || null,
    })),
  }];
});

mock.onPost('/rak/scan').reply((config) => {
  const { qr_code, barang_id } = JSON.parse(config.data);
  const rak = db.rak.find((item) => item.qr_code === qr_code?.trim() || item.kode === qr_code?.trim());
  if (!rak) return [404, { message: 'QR rak tidak terdaftar' }];
  const barang = db.barang.find((item) => item.id === Number(barang_id));
  if (!barang) return [404, { message: 'Barang tidak ditemukan' }];
  if (barang.rak !== rak.nama) return [409, { message: `Rak tidak sesuai. Barang berada di ${barang.rak}` }];
  return [200, { valid: true, rak, barang }];
});

mock.onPost('/pengambilan/execute').reply((config) => {
  const payload = JSON.parse(config.data);
  const barang = db.barang.find((item) => item.id === Number(payload.barang_id));
  const rak = db.rak.find((item) => item.id === Number(payload.rak_id));
  const qty = Number(payload.qty);
  if (!barang || !rak) return [404, { message: 'Barang atau rak tidak ditemukan' }];
  if (barang.rak !== rak.nama || payload.qr_code !== rak.qr_code) return [409, { message: 'QR rak belum valid atau tidak sesuai barang' }];
  if (!payload.pemohon?.trim()) return [400, { message: 'Nama pengambil wajib diisi' }];
  if (!Number.isInteger(qty) || qty < 1) return [400, { message: 'Qty harus bilangan bulat minimal 1' }];
  if (qty > barang.stok) return [409, { message: `Stok tidak cukup. Stok tersedia ${barang.stok} ${barang.satuan}` }];
  const operator = currentUser();
  const no_ref = nextReference();
  barang.stok -= qty;
  const transaction = { id: Date.now(), tanggal: new Date().toISOString(), no_ref, pemohon: payload.pemohon.trim(), barang: barang.nama, barang_id: barang.id, rak: rak.nama, rak_id: rak.id, qr_code: rak.qr_code, qty, keterangan: payload.keterangan?.trim() || '', status: 'Disetujui', user: operator.nama };
  db.pengambilan.push(transaction);
  db.kartu_stok.unshift({ id: Date.now() + 1, tanggal: new Date().toISOString(), tipe: 'Keluar', no_ref, barang: barang.nama, qty, saldo: barang.stok, keterangan: `Diambil oleh ${transaction.pemohon} dari ${rak.nama}`, user: operator.nama });
  db.log_activity.unshift({ id: Date.now() + 2, waktu: new Date().toISOString(), user: operator.nama, aksi: 'Pengambilan', modul: 'Pengambilan Barang', detail: `${no_ref}: ${barang.nama} ${qty} ${barang.satuan}; pengambil ${transaction.pemohon}; QR ${rak.qr_code}`, ip: 'demo-local' });
  return [201, { transaction, stok_akhir: barang.stok }];
});

mock.onPost('/auth/login').reply((config) => {
  const { username, password } = JSON.parse(config.data);
  const demoUser = db.pengguna.find((item) => item.username === username && item.status === 'Aktif');
  if (demoUser && password === username) {
    return [200, {
      user: demoUser,
      token: `mock-jwt-${demoUser.username}`
    }];
  }
  return [401, { message: 'Username atau password salah' }];
});

export default mock;