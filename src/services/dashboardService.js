import api from '@/services/api';

export function getDashboardStats() {
  return api.get('/dashboard/stats');
}
