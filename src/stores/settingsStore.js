import { create } from 'zustand';
import api from '@/services/api';

export const defaultSettings = {
  nama_perusahaan: 'Mondelez Inventory', alamat: '', telepon: '', email: '',
  tema: 'light', bahasa: 'id', items_per_page: 10,
  auto_backup: false, session_timeout: 30, two_factor: false,
};
const preferencesKey = 'inventory-appearance-preferences';
function validPreferences(value) {
  const result = {};
  if (['light', 'dark'].includes(value?.tema)) result.tema = value.tema;
  if (['id', 'en'].includes(value?.bahasa)) result.bahasa = value.bahasa;
  return result;
}
function readPreferences() {
  try {
    if (typeof localStorage === 'undefined') return {};
    return validPreferences(JSON.parse(localStorage.getItem(preferencesKey)));
  } catch { return {}; }
}
const initialPreferences = readPreferences();
let loadingPromise;
function applyDocument(settings) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', settings.tema === 'dark');
  document.documentElement.lang = settings.bahasa;
  document.title = settings.nama_perusahaan || 'Mondelez Inventory';
}
if (Object.keys(initialPreferences).length) applyDocument({ ...defaultSettings, ...initialPreferences });
export const useSettingsStore = create((set) => ({
  settings: { ...defaultSettings, ...initialPreferences },
  appearancePreferences: initialPreferences,
  loaded: false,
  apply: (value) => set(state => {
    const settings = { ...state.settings, ...value, ...state.appearancePreferences };
    applyDocument(settings);
    return { settings, loaded: true };
  }),
  setAppearancePreferences: value => set(state => {
    const appearancePreferences = { ...state.appearancePreferences, ...validPreferences(value) };
    const settings = { ...state.settings, ...appearancePreferences };
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(preferencesKey, JSON.stringify(appearancePreferences));
    } catch { /* Keep the preference for this session if browser storage is unavailable. */ }
    applyDocument(settings);
    return { appearancePreferences, settings };
  }),
  loadRuntime: () => {
    if (loadingPromise) return loadingPromise;
    loadingPromise = api.get('/settings/runtime').then(value => useSettingsStore.getState().apply(value))
      .finally(() => { loadingPromise = null; });
    return loadingPromise;
  },
}));
export function withSettingsPageSize(store) {
  store.setState({ limit: useSettingsStore.getState().settings.items_per_page });
  useSettingsStore.subscribe((state, previous) => {
    if (state.settings.items_per_page !== previous.settings.items_per_page) store.getState().setLimit(state.settings.items_per_page);
  });
  return store;
}
