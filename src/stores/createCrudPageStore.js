import { create } from 'zustand';

export function createCrudPageStore(emptyForm) {
  return create((set) => ({
    search: '',
    page: 1,
    limit: 10,
    modalOpen: false,
    form: emptyForm,
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
    setQueryResponse: (lastResponse) => set({ lastResponse, hasLoadedOnce: true, loadingSource: null }),
    setForm: (form) => set({ form }),
    updateField: (field, value) => set((state) => ({ form: { ...state.form, [field]: value } })),
    openAdd: () => set({ form: emptyForm, editId: null, modalOpen: true }),
    openEdit: (row) => set({ form: row, editId: row.id, modalOpen: true }),
    closeModal: () => set({ modalOpen: false }),
  }));
}
