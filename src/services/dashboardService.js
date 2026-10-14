import api from '@/services/api';

export function getDashboardStats(params, { signal } = {}) {
  return api.get('/dashboard/stats', { params, signal });
}
