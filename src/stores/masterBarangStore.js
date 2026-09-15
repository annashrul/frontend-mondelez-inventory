import { create } from 'zustand';

export const emptyBarangForm = {
  kode: '',
  barcode: '',
  nama: '',
  kelompok_id: '',
  satuan_id: '',
  rak_id: '',
  stok: 0,
  stok_min: 0,
  harga: 0,
};

export const useMasterBarangStore = create((set) => ({
  search: '',
  page: 1,
  limit: 10,
  modalOpen: false,
  form: emptyBarangForm,
  editId: null,
  hasLoadedOnce: false,
  lastResponse: null,
  loadingSource: null,
  setSearch: (search) => set({ search, page: 1, loadingSource: { type: 'search' } }),
  setPage: (page) => set((state) => ({
    page,
    loadingSource: { type: 'page', direction: page > state.page ? 'next' : 'prev' },
  })),
  setLimit: (limit) => set({ limit, page: 1, loadingSource: { type: 'limit' } }),
  setForm: (form) => set({ form }),
  setQueryResponse: (lastResponse) => set({ lastResponse, hasLoadedOnce: true, loadingSource: null }),
  updateField: (field, value) => set((state) => ({ form: { ...state.form, [field]: value } })),
  openAdd: () => set({ form: emptyBarangForm, editId: null, modalOpen: true }),
  openEdit: (row) => set({ form: row, editId: row.id, modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
}));
