import { queryClient } from '@/lib/queryClient';
import { pageMemory } from '@/lib/pageMemory';
import { useMasterBarangStore } from '@/stores/masterBarangStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import * as masterStores from '@/stores/masterDataStores';
import * as listStores from '@/stores/listPageStores';
import { useSettingsStore } from '@/stores/settingsStore';

export function resetPageSession() {
  queryClient.clear();
  pageMemory.clear();
  const stores = [useMasterBarangStore, useDashboardStore, ...Object.values(masterStores), ...Object.values(listStores)];
  for (const store of stores) {
    if (typeof store.getInitialState !== 'function') continue;
    const initial = store.getInitialState();
    store.setState({ ...initial, ...(Object.hasOwn(initial, 'limit') ? { limit: useSettingsStore.getState().settings.items_per_page } : {}) }, true);
  }
  try { sessionStorage.removeItem('pengambilan-transaksi-draft'); } catch { /* Storage may be unavailable. */ }
}
