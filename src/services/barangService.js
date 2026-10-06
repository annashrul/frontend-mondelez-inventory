import api, { getList, uploadTimeout } from '@/services/api';

// Payload FormData berarti ada gambar yang perlu di-embedding di backend,
// sehingga perlu timeout khusus agar tidak kena batas waktu CRUD biasa.
function uploadConfig(payload) {
  return payload instanceof FormData ? { timeout: uploadTimeout } : undefined;
}

export function getBarangList(params) {
  return api.get('/barang', { params });
}

export function createBarang(payload) {
  return api.post('/barang', payload, uploadConfig(payload));
}

export function updateBarang(id, payload) {
  return api.put(`/barang/${id}`, payload, uploadConfig(payload));
}

export function deleteBarang(id) {
  return api.delete(`/barang/${id}`);
}

export function generateBarangCode() {
  return api.get('/barang/kode-otomatis');
}

function optionLabel(item, detail) {
  return detail ? `${item.kode} - ${item.nama} - ${detail}` : `${item.kode} - ${item.nama}`;
}

export async function getKelompokOptions(search) {
  const rows = await api.get('/kelompok-barang', { params: { search, limit: 100 } });
  return getList(rows).map((item) => ({ value: String(item.id), label: optionLabel(item) }));
}

export async function getSatuanOptions(search) {
  const rows = await api.get('/satuan', { params: { search, limit: 100 } });
  return getList(rows).map((item) => ({ value: String(item.id), label: optionLabel(item) }));
}

export async function getRakOptions(search) {
  const rows = await api.get('/rak', { params: { search, limit: 100 } });
  return getList(rows).map((item) => ({ value: String(item.id), label: optionLabel(item, item.lokasi_detail?.nama) }));
}

export async function getBarangStockOptions(search) {
  const rows = await getBarangList({ search, limit: 100 });
  return getList(rows).map((item) => ({
    value: String(item.id),
    label: `${item.kode} - ${item.nama} (Stok: ${item.stok} ${item.satuan_detail?.nama || ''})`,
  }));
}
