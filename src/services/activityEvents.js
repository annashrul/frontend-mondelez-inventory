import api from '@/services/api';
import { queryClient } from '@/lib/queryClient';

const timers = new Map();
export function recordUiActivity(event) {
  const token = localStorage.getItem('token');
  if (!token) return Promise.resolve();
  return api.post('/log-activity/events', { path: window.location.pathname, ...event }, { headers: { Authorization: `Bearer ${token}` } })
    .then(() => queryClient.invalidateQueries({ queryKey: ['log-activity'], refetchType: 'active' }))
    .catch(() => { console.warn('Gagal mencatat aktivitas antarmuka'); });
}

export function recordSearchActivity(search) {
  const path = window.location.pathname;
  const token = localStorage.getItem('token');
  clearTimeout(timers.get(path));
  timers.set(path, setTimeout(() => {
    timers.delete(path);
    if (token !== localStorage.getItem('token')) return;
    void recordUiActivity({ type: 'search', path, search: String(search).slice(0, 200) });
  }, 500));
}
