import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  lastResponse: null,
  hasLoadedOnce: false,
  // Simpan response terakhir agar saat kembali ke halaman dashboard
  // data langsung tampil tanpa kedipan skeleton (sama seperti master barang).
  setQueryResponse: (lastResponse) => set({ lastResponse, hasLoadedOnce: true }),
}));
