import api from '@/services/api';

export function getDashboardStats(params) {
  return api.get('/dashboard/stats', { params });
}
