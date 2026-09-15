import { create } from 'zustand';

function createListPageStore(extra = {}, actions = () => ({})) {
  return create((set) => ({
    search: '',
    page: 1,
    limit: 10,
    hasLoadedOnce: false,
    lastResponse: null,
    loadingSource: null,
    ...extra,
    setSearch: (search) => set({ search, page: 1, loadingSource: { type: 'search' } }),
    setPage: (page) => set((state) => ({
      page,
      loadingSource: { type: 'page', direction: page > state.page ? 'next' : 'prev' },
    })),
    setLimit: (limit) => set({ limit, page: 1, loadingSource: { type: 'limit' } }),
    setQueryResponse: (lastResponse) => set({ lastResponse, hasLoadedOnce: true, loadingSource: null }),
    ...actions(set),
  }));
}

export const useKartuStokStore = createListPageStore({
  tipe: 'Semua',
}, (set) => ({
  setTipe: (tipe) => set({ tipe, page: 1, loadingSource: { type: 'filter' } }),
}));

export const useLogActivityStore = createListPageStore();
