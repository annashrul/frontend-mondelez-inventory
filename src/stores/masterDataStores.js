import { createCrudPageStore } from '@/stores/createCrudPageStore';

export const useKelompokBarangStore = createCrudPageStore({ kode: '', nama: '', deskripsi: '' });
export const useSatuanStore = createCrudPageStore({ kode: '', nama: '', deskripsi: '' });
export const useLokasiStore = createCrudPageStore({ kode: '', nama: '', alamat: '', deskripsi: '' });
export const useRakStore = createCrudPageStore({ kode: '', qr_code: '', nama: '', lokasi_id: '', kapasitas: 0 });
export const useAdjustmentStore = createCrudPageStore({
  tanggal: new Date().toISOString().slice(0, 10),
  barang_id: '',
  tipe: 'Tambah',
  qty: 0,
  alasan: '',
});
export const usePenggunaStore = createCrudPageStore({ username: '', password: '', nama: '', email: '', level_id: '', status: 'Aktif' });
export const useLevelPenggunaStore = createCrudPageStore({ kode: '', nama: '', deskripsi: '', action_ids: [] });
